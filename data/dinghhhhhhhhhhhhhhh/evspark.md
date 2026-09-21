# dinghhhhhhhhhhhhhhh/EvSpark

## Resumen

EvSpark es un conjunto de checkpoints "drafter" (borrador) para decodificacion especulativa sin perdida sobre Evo2, el modelo fundacional de ADN de Arc Institute basado en la arquitectura hibrida StripedHyena2. No es un modelo de lenguaje autonomo: cada fichero `.pt` contiene una unica capa inyectada en un bloque concreto del objetivo (bloque 27 en Evo2 7B, bloque 20 en el 20B y bloque 45 en el 40B), con `d_model=1024`, mas una cabeza Markov, una cabeza de confianza y el embedding congelado.

Lo firman Hao Ding, Nannan Wu y Tianyi Qiu, y se publica como adaptador del modelo base `arcinstitute/evo2_7b` bajo licencia MIT. El problema que resuelve es el coste de inferencia de Evo2 en generacion de secuencias genomicas de flujo unico: los drafters aceleran la decodificacion entre 2,5x y 3,3x manteniendo la salida greedy identica token a token a la decodificacion nativa.

Su relevancia es doble: reduce el coste computacional de tareas de diseno genomico (en un flujo de diseno de ADN regulador guiado por predictor se mide una mejora mediana de 1,57x sobre una linea base nativa por lotes calibrada) y, al destilarse offline sobre estados ocultos congelados, no requiere volver a entrenar ni modificar el modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de una sola capa inyectado en un bloque del transformador hibrido StripedHyena2 de Evo2; `d_model=1024`, cabeza Markov, cabeza de confianza y embedding congelado |
| Parametros totales | no disponible (los valores 30M/150M de los nombres de fichero son presupuestos de destilacion en tokens, no recuentos de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el drafter; el objetivo Evo2 se evalua con prompts genomicos de hasta 262k tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | secuencias de ADN (genomica); el soporte de lenguaje natural no esta documentado |
| Licencia | MIT para checkpoints y codigo; los pesos y el runtime de Evo2/Vortex siguen sus licencias originales |
| Formato de pesos | PyTorch (`.pt` autocontenido: embedding congelado, cabeza Markov, cabeza de confianza y metadatos) |

## Arquitectura y entrenamiento

Evo2 es un modelo fundacional de ADN con arquitectura hibrida StripedHyena2, que combina convoluciones largas de tipo Hyena con atencion. EvSpark no modifica el objetivo: destila offline un drafter de una sola capa a partir de los estados ocultos congelados de Evo2 y lo inyecta en un bloque concreto del objetivo. Los presupuestos de destilacion son de 150M y 30M tokens para el objetivo de 7B, 10M y 30M para el de 20B, y 10M, 30M y 80M para el de 40B. La celda de coste optimo (30M) se entrena en aproximadamente 1,06 GPU-hora en una unica RTX 4090; el objetivo de 7B se evalua con tres semillas de entrenamiento y los de 20B y 40B con una sola semilla.

La innovacion tecnica principal es el motor de decodificacion, que combina verificacion por bloques ("block verify") con retroceso por rebanado de estado ("state-slice rollback") sobre los estados de Hyena y de atencion. Esto permite una decodificacion distribuicionalmente sin perdida: la salida greedy es identica token a token a la nativa, con 0 divergencias no empate en 48 prompts y 6 checkpoints. Ademas, gracias a la exactitud del prefijo causal, un mismo checkpoint sirve para cualquier longitud de borrador en tiempo de decodificacion (gamma prima) menor o igual a la gamma de entrenamiento, sin reentrenar.

## Capacidades

- Decodificacion especulativa sin perdida sobre Evo2: salida greedy identica token a token a la decodificacion nativa (0 divergencias no empate en 48 prompts x 6 checkpoints).
- Aceleracion de la generacion genomica de flujo unico: 3,27x / 2,96x en Evo2 7B (suite completa de 48 prompts / subconjunto real de 43), 2,53x-2,22x en 20B y 2,72x-2,42x en 40B.
- Rendimiento en contexto largo: 1,97-2,43x con prompts de 262k tokens en *E. coli* y 1,84-2,05x en *B. subtilis*.
- Transferencia a objetivos de mayor tamano: checkpoints especificos para Evo2 20B (bloque 20) y 40B (bloque 45).
- Longitud de borrador flexible (gamma prima menor o igual a gamma) con un unico checkpoint, sin reentrenamiento.
- Aceleracion de flujos de diseno: 1,57x de mediana en un flujo completo de diseno de ADN regulador guiado por predictor.
- Modo de muestreo configurable en la propia API (por ejemplo `T=1.0`, `top_k=4`).
- No contempla generacion de lenguaje natural, tool calling, function calling, agentes ni capacidades multimodales.

## Casos de uso

- Generacion de genomas sinteticos a escala: el modelo acelera la sintesis de secuencias de mas de mil nucleotidos por prompt sin alterar el resultado greedy, lo que abarata barridos masivos de generacion sobre Evo2 7B.
- Diseno de ADN regulador guiado por predictor: integrado en el bucle de optimizacion, el drafter recorta el tiempo total de diseno (1,57x mediano) al acelerar cada paso de generacion del modelo fundacional.
- Modelado de genomas bacterianos completos: con ventanas de 262k tokens, los factores de aceleracion de 1,84x-2,43x permiten procesar genomas de *E. coli* o *B. subtilis* en lotes mas grandes dentro del mismo presupuesto de GPU.
- Serving de Evo2 en produccion: al mantener la salida identica a la nativa, puede desplegarse como capa de aceleracion transparente sin recalibrar ni revalidar los resultados biologicos aguas abajo.
- Investigacion en decodificacion especulativa sobre arquitecturas hibridas: el motor de verificacion por bloques y el retroceso por rebanado de estado cubren convoluciones Hyena y atencion, lo que sirve de banco de pruebas para otras arquitecturas hibridas.
- Destilacion rapida de nuevos drafters: la celda de 30M tokens se completa en aproximadamente 1,06 GPU-hora en una RTX 4090, lo que hace viable iterar sobre nuevos objetivos genomicos con recursos de una sola GPU.
- Verificacion de fidelidad de decodificacion: la bateria de comprobacion de ausencia de divergencias (48 prompts x 6 checkpoints) puede reutilizarse como test de regresion en pipelines de liberacion.
- Evaluacion comparativa de estrategias de aceleracion en 20B/40B: los checkpoints para objetivos grandes permiten medir el escalado del factor de aceleracion con el tamano del modelo en H20.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no son aplicables a un modelo de ADN. Los datos de rendimiento publicados son factores de aceleracion:

| Objetivo | Checkpoint | Aceleracion suite (all-48 / real-43) | Configuracion |
|---|---|---|---|
| Evo2 7B | `L27_g12_150M` (flagship) | 3,27x / 2,96x | RTX 4090, flash-attn, 3 semillas |
| Evo2 7B | `L27_g12_30M` (coste optimo) | 3,15x / 2,82x | ~1,06 GPU-h de destilacion en una 4090 |
| Evo2 20B | `phase3_20b_L20_g12_b1` / `_b2` | 2,53x/2,18x · 2,51x/2,22x | H20, SDPA, 1 semilla |
| Evo2 40B | `phase3_40b_L45_g12_b1` / `_b2` / `_b3` | 2,72x/2,44x · 2,78x/2,46x · 2,72x/2,42x | H20, SDPA, 1 semilla |

Detalles adicionales de la evaluacion:

| Metrica | Valor |
|---|---|
| Tamano de la suite | 48 prompts genomicos x 1024 tokens, flujo unico |
| Contexto largo, *E. coli* 262k | 1,97x - 2,43x |
| Contexto largo, *B. subtilis* 262k | 1,84x - 2,05x |
| Sin perdida en greedy | 0 divergencias no empate (48 prompts x 6 checkpoints) |
| Diseno de ADN regulador (flujo completo) | 1,57x de mediana frente a linea base nativa por lotes calibrada |

## Requisitos de hardware

- Objetivo Evo2 7B: medido en una RTX 4090 con flash-attn. La VRAM necesaria para los pesos del objetivo no se detalla en la informacion disponible.
- Objetivos 20B y 40B: medidos en una H20 de 96 GB con SDPA; requieren la ruta oficial de Transformer-Engine del objetivo y no existe ruta oficial en arquitecturas Ada.
- El repositorio completo ocupa 2,4 GB; los checkpoints individuales son ficheros `.pt` autocontenidos de una sola capa, por lo que el coste dominante de VRAM es el modelo objetivo, no el drafter.
- Entrenamiento de un drafter nuevo: aproximadamente 1,06 GPU-hora en una unica RTX 4090 para la celda de 30M tokens sobre el objetivo de 7B.
- Opciones de despliegue: exclusivamente el motor EvSpark (verificacion por bloques y retroceso por rebanado de estado de Hyena y atencion). No es compatible con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles mas alla de los factores de aceleracion relativos; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

Se comparan en primer lugar los propios checkpoints entre si, ya que todos atacan la misma tarea sobre objetivos distintos:

| Checkpoint | Objetivo | Presupuesto de destilacion | Aceleracion (all-48 / real-43) | Hardware medido |
|---|---|---|---|---|
| `L27_g12_150M_s1/s2` | Evo2 7B | 150M | 3,27x / 2,96x | RTX 4090, flash-attn |
| `L27_g12_30M_s1/s2` | Evo2 7B | 30M | 3,15x / 2,82x | RTX 4090, flash-attn |
| `phase3_20b_L20_g12_b1/b2` | Evo2 20B | 10M / 30M | 2,53x/2,18x · 2,51x/2,22x | H20, SDPA |
| `phase3_40b_L45_g12_b1/b2/b3` | Evo2 40B | 10M / 30M / 80M | 2,72x/2,44x · 2,78x/2,46x · 2,72x/2,42x | H20, SDPA |

Frente a otras familias de decodificacion especulativa (EAGLE, Medusa, decodificacion especulativa clasica con modelo borrador independiente), no se dispone de resultados comparativos publicados en la informacion proporcionada. La diferencia cualitativa documentada es que EvSpark destila el drafter offline sobre estados ocultos del modelo objetivo congelado y no modifica ni afina el objetivo, mientras que otras aproximaciones requieren entrenar cabezas adicionales o ajustar el modelo objetivo. No se dispone de datos para cuantificar esa diferencia en modelos fundacionales de ADN.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Evo2 y el motor EvSpark; sin ellos, los ficheros `.pt` no generan nada por si solos.
- Los drafters de 20B y 40B exigen la ruta oficial de Transformer-Engine del objetivo y no tienen ruta oficial en GPUs Ada, lo que restringe su despliegue a hardware como la H20.
- La garantia de decodificacion sin perdida se refiere al modo greedy; con muestreo (`T=1.0`, `top_k=4`) el comportamiento se rige por la distribucion del drafter.
- Los resultados para 20B y 40B se obtuvieron con una sola semilla de entrenamiento, frente a las tres semillas del objetivo de 7B; la varianza en esos casos no esta caracterizada.
- No se documentan tipos de cuantizacion soportados, ni versiones minimas de PyTorch o CUDA.
- El repositorio registra 0 descargas y 1 "like" en el momento de la consulta, por lo que no hay validacion independiente de terceros mas alla del articulo de los autores.
- Riesgo de sesgo heredado de los datos genomicos de Evo2 (sobrerrepresentacion de organismos modelo) y de alucinacion biologica: el drafter reproduce fielmente al objetivo, incluidas sus salidas incorrectas, porque la decodificacion es identica a la nativa.
- Las secuencias generadas deben validarse experimentalmente; el modelo no incorpora ninguna comprobacion de viabilidad biologica.
- Licencia MIT para checkpoints y codigo, pero los pesos y el runtime de Evo2 y Vortex se rigen por sus licencias originales, que hay que revisar antes de cualquier uso comercial.
- No se documentan idiomas naturales soportados, capacidades de tool calling ni soporte multimodal en la informacion disponible.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces utiles proceden de la model card y de los resultados de HuggingFace.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/dinghhhhhhhhhhhhhhh/EvSpark
- Repositorio en GitHub: https://github.com/dhnihaoya/EvSpark
- Articulo en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.09.02.749017
- DOI: https://doi.org/10.64898/2026.09.02.749017
- Modelo en ModelScope: https://www.modelscope.cn/models/dinghao1120/EvSpark
- Modelo base Evo2 7B: https://huggingface.co/arcinstitute/evo2_7b
- Espejo de HuggingFace para entornos sin acceso: https://hf-mirror.com
