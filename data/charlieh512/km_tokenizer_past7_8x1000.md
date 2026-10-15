# CharlieH512/km_tokenizer_past7_8x1000

## Resumen

KM tokenizer past7 (8 × 1000) es un tokenizador discreto para entrada de teclado y ratón, desarrollado por el usuario CharlieH512 y publicado en HuggingFace. No es un modelo de lenguaje: es un encoder-decoder transformer de 10,76 millones de parámetros que convierte fotogramas de teclado y ratón muestreados a 100 Hz en 8 códigos discretos por tick de 80 ms (cada código en el rango [0, 1000)), y que reconstruye los fotogramas originales a partir de esos códigos. Fue entrenado exclusivamente con grabaciones de partidas de Minecraft.

Su relevancia técnica está en el diseño causal del encoder: next7 garantiza que los códigos de un tick dependan únicamente de ese tick y de los 7 ticks anteriores (560 ms), sin mirar nunca hacia adelante. Esta propiedad es crítica cuando los códigos se usan como historial de acciones de un modelo de secuencia: si el tokenizador mirase al futuro, el modelo podría filtrar las acciones venideras desde su propio historial. El modelo tiene 10.756.689 parámetros almacenados en fp32 y se distribuye en formato safetensors junto con el código de inferencia en PyTorch.

El modelo se apoya en un cuantizador sin codebook aprendido: corta el latente de 32 dimensiones en 8 porciones de 4 dimensiones y cuantiza cada una de forma independiente con niveles 8, 5, 5 y 5, empaquetados por radix mixto en un entero de hasta 1000 valores. La ficha no reporta idiomas soportados porque el modelo no procesa texto; su dominio es la entrada de control de videojuegos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con cuantizador discreto (no es un LLM) |
| Parametros totales | 10.756.689 (10,76 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 7 ticks previos en el encoder (560 ms); decoder causal sobre ticks |
| Tipos de cuantizacion | Pesos en fp32; latentes cuantizados a 8x5x5x5 = 1000 niveles por grupo |
| Idiomas soportados | No disponible (no procesa texto ni lenguaje natural) |
| Licencia | other |
| Formato de pesos | safetensors (`model.safetensors`, fp32) |
| Libreria | pytorch (requiere `huggingface_hub` y `safetensors` para carga) |
| Tamano del repo | 0,0 GB segun HuggingFace |
| Frecuencia de muestreo | 100 Hz (un fotograma cada 10 ms) |
| Salida | 8 codigos por tick de 80 ms, cada uno en [0, 1000) |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

El encoder recibe fotogramas a 100 Hz. Cada fotograma se describe con 244 caracteristicas: 79 estados de tecla mantenida, 79 flags de pulsacion en ese fotograma, 79 flags de liberacion y 7 caracteristicas de raton (dx/50 y dy/50 recortados a ±4; log(1+|dx|)/log(1+1280) y su equivalente en dy; sign(dx) y sign(dy); y la magnitud logaritmica combinada). Ocho fotogramas consecutivos forman un tick. Una capa lineal proyecta los 244 features a 256 dimensiones y se suma un embedding posicional aprendido del slot de fotograma dentro del tick; 2 bloques transformer atienden sobre los 8 fotogramas de cada tick por separado; los 8 vectores resultantes se concatenan (8 x 256) y una capa lineal los reduce a un vector de tick de 256 dimensiones. Despues, 4 bloques transformer atienden entre ticks con rotary position encoding y ventanas de atencion hacia atras de 2, 2, 2 y 1 ticks, de forma que el latente de cada tick depende exactamente de los 7 ticks anteriores mas el propio. Los ticks de relleno se enmascaran como claves. Una capa de layer norm y una proyeccion lineal producen un latente de 32 dimensiones por tick. Todos los bloques son pre-norm (layer norm, atencion multi-cabeza de 8 cabezas y anchura 256, residual; layer norm, MLP 256 -> 1024 -> 256 con GELU, residual).

El cuantizador divide el latente de 32 dimensiones en 8 porciones fijas de 4 dimensiones. Cada porcion se cuantiza por separado con un tanh desplazado y escalado, redondeando a 8, 5, 5 y 5 niveles respectivamente, lo que da 1000 valores posibles por grupo; los cuatro indices se empaquetan en un entero por radix mixto (la primera dimension es el digito menos significativo). El redondeo usa gradiente straight-through y no existe codebook aprendido. El decoder reconstruye los codigos cuantizados (32 dimensiones, cada grupo como canal propio), los proyecta a 256, aplica 4 bloques transformer causales entre ticks con rotary encoding, expande cada tick a 8 vectores de fotograma, anade un embedding posicional de slot, aplica 2 bloques transformer sobre los 8 fotogramas del tick y termina con layer norm y una capa lineal en fp32 que emite 79 logits de tecla y 2 x 241 logits de raton. Las teclas se consideran pulsadas si la sigmoide del logit es >= 0,5; el movimiento del raton se decodifica como el centro de bin esperado bajo la softmax, redondeado a pixel entero, sobre 241 bins (de -96 a 96 mas 24 bins geometricos por lado hasta el recorte de ±1280 en dx y ±720 en dy).

El entrenamiento fue una unica ejecucion desde cero de 120.000 pasos, con 512 ventanas de 10 s por paso en 4 GPU x 128, optimizador Adam (lr 1e-3, warmup de 2.000 pasos, decaimiento coseno hasta 1e-5) y precision mixta bf16. La funcion de perdida usa focal loss por fotograma para las teclas (alfa = 0,25, gamma = 2) normalizada por el numero de fotogramas con tecla pulsada, con un peso por tick basado en la rareza del patron completo de 8 fotogramas x 79 teclas: clamp((0,01/f)^0,5, 1, 10), con f la frecuencia del patron sobre 3,4 M ticks de entrenamiento. Para el raton se usa entropia cruzada por fotograma y eje contra un objetivo suave gaussiano sobre el indice de bin (sigma = 0,5 bins), excluyendo fotogramas en el recorte. Se anade un termino de exceso cuadratico medio del latente sobre |x| = 2 para evitar la saturacion del tanh del cuantizador. Los pesos publicados corresponden al checkpoint del paso 120.000.

## Capacidades

- Tokenizacion discreta de entrada de teclado y raton: convierte 8 fotogramas de 10 ms en 8 codigos enteros por tick de 80 ms.
- Reconstruccion inversa: el decoder regenera los 79 estados de tecla y los desplazamientos de raton en pixels a partir de los codigos.
- Encoder estrictamente causal respecto al futuro: los codigos de un tick dependen solo de ese tick y de los 7 anteriores, lo que evita fugas de informacion futura en modelos de secuencia que consuman el historial de acciones.
- Dependencia del contexto pasado: la misma accion con un historial distinto produce codigos distintos, de modo que el codigo preserva informacion del contexto previo.
- Cuantizacion sin codebook aprendido: 1000 valores por grupo mediante tanh y redondeo straight-through, independiente entre grupos.
- Especifico de entrada de videojuego: disenado y entrenado con grabaciones de Minecraft a 100 Hz.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible por si mismo (es un tokenizador, no un modelo de decision).
- Capacidades multilingues: no disponible (no procesa texto).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Tokenizacion de acciones para modelos de agente en videojuegos: los 8 codigos por tick ofrecen un vocabulario discreto y compacto que un transformer de politica puede modelar como secuencia de acciones, con la garantia de que el historial de acciones no revela acciones futuras.
- Modelos de mundo y prediccion de estado: al disponer de codigos causales, un modelo de mundo puede condicionar el estado siguiente sobre el historial de acciones sin que este contenga informacion filtrada del futuro.
- Aprendizaje por imitacion a partir de demos: las grabaciones de Minecraft se pueden comprimir a 8 codigos por tick y reconstruir con alta fidelidad, reduciendo el coste de almacenamiento y de modelado respecto a los fotogramas crudos.
- Aprendizaje por refuerzo con acciones discretizadas: los codigos sirven como espacio de acciones de cardinalidad acotada (1000 valores por grupo) para algoritmos de RL que requieren espacios discretos.
- Compresion de replays y demos: la representacion a 8 enteros por 80 ms reduce drasticamente el tamano frente a los 244 features por fotograma, util para archivar o transmitir partidas.
- Analisis y anotacion de replays: decodificar codigos a pulsaciones y movimientos permite segmentar partidas por patrones de entrada, construir datasets etiquetados o auditar comportamiento.
- Re-simulacion determinista de partidas: la decodificacion a teclas y desplazamientos en pixels permite reproducir una partida a partir de su secuencia de codigos.
- Preprocesado para entrenamiento de agentes multimodales: los codigos pueden combinarse con observaciones visuales del juego como entrada de un modelo de vision-lenguaje-accion.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son sobre el split de validacion completo (ventanas de 10 s reservadas del entrenamiento, las mismas para ambos modelos), con teclas evaluadas a umbral 0,5:

| Metrica | past7 (este modelo) | ctx14 |
|---|---|---|
| F1 de inicio de tecla (±20 ms, mejor umbral) | 0,990 | 0,988 |
| Ticks con patron completo de 8 fotogramas x 79 teclas exacto, por frecuencia del patron en entrenamiento | dato truncado en la model card | dato truncado en la model card |

No se han publicado resultados de benchmarks de MMLU, HumanEval, GSM8K ni equivalentes, ya que el modelo no es un modelo de lenguaje. La tabla de la model card aparece truncada en la informacion disponible, por lo que no se pueden reportar el resto de filas ni las metricas completas de reconstruccion de raton.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 43 MB (10.756.689 parametros x 4 bytes), por lo que el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- VRAM estimada para inferencia: muy baja; el consumo dominante es el de las activaciones, que escala con la longitud de la secuencia de ticks procesada. Para ventanas de 10 s (100 ticks) el uso es del orden de decenas de MB y cabe en GPUs con 2-4 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutarlo.
- Inferencia en CPU: viable sin GPU, dado el tamano del modelo y que el codigo solo requiere PyTorch, `huggingface_hub` y `safetensors`.
- Opciones de despliegue: el autor proporciona `km_tokenizer_past7.py` para carga directa en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un tokenizador de este tipo.
- Latencia y throughput: no disponible. La model card no publica medidas de latencia ni de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto temporal | Frecuencia | F1 de inicio de tecla (±20 ms) | Licencia | Notas |
|---|---|---|---|---|---|---|
| km_tokenizer_past7_8x1000 | 10,76 M | 7 ticks previos (560 ms) | 100 Hz, tick de 80 ms | 0,990 | other | Encoder sin lookahead; punto de partida de la comparacion |
| km_tokenizer_ctx14_8x1000 | no disponible | 14 ticks previos y 14 posteriores | 100 Hz | 0,988 | other | Version con lookahead; sus codigos filtran acciones futuras |
| km_tokenizer_ctx14_10hz_8x1000 | no disponible | no disponible | 10 ticks/s (tick de 100 ms) | no disponible | other | Version a 10 Hz del tokenizador ctx14 |
| km_tokenizer_v2_8x1000 | no disponible | no disponible | no disponible | no disponible | other | Version anterior de la familia, sin datos de rendimiento en la informacion disponible |

La informacion disponible no incluye parametros totales, contexto ni benchmarks de las variantes ctx14 y v2 mas alla de lo indicado, por lo que la comparacion cuantitativa queda limitada a la metrica de F1 de inicio de tecla entre past7 y ctx14, practicamente empatada (0,990 frente a 0,988).

## Limitaciones y advertencias

- Dominio restringido: el modelo se entreno solo con grabaciones de Minecraft a 100 Hz; su comportamiento fuera de ese dominio o con esquemas de control distintos no esta garantizado.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling, agentes conversacionales ni capacidades multilingues.
- Dependencia del umbral: las teclas se decodifican con umbral fijo de 0,5, lo que puede no ser optimo para todas las metricas o aplicaciones; la F1 reportada usa el mejor umbral, no el 0,5 fijo.
- Recorte de movimiento: el raton se recorta a ±1280 en dx y ±720 en dy, de modo que movimientos mayores se pierden; ademas, los fotogramas en el recorte se excluyen de la perdida de entrenamiento.
- F1 de 0,990 implica un 1 % de error en inicios de tecla; en tareas sensibles a la precision temporal exacta conviene medir el impacto antes de produccion.
- La tabla de rendimiento de la model card esta truncada en la informacion disponible; no se pueden verificar los resultados completos de reconstruccion ni por frecuencia de patron.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial queda sujeto a lo que defina el autor y no puede asumirse permitido.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento ni soporte.
- Riesgo de sobreajuste a los patrones frecuentes de entrenamiento: los pesos de rareza compensan parcialmente el desbalance de patrones de teclas, pero los patrones poco frecuentes pueden reconstruirse peor.
- Sin datos publicos de latencia, throughput ni pruebas de robustez fuera del conjunto de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieH512/km_tokenizer_past7_8x1000
- Modelo base de la variante con contexto: https://huggingface.co/CharlieH512/km_tokenizer_ctx14_8x1000
- Variante a 10 Hz: https://huggingface.co/CharlieH512/km_tokenizer_ctx14_10hz_8x1000
- Variante v2: https://huggingface.co/CharlieH512/km_tokenizer_v2_8x1000
- Codigo de inferencia incluido en el repositorio: `km_tokenizer_past7.py` (PyTorch, requiere `huggingface_hub` y `safetensors`)
