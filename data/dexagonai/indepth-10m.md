# DexagonAI/indepth-10M

## Resumen

InDepth (indepth-10M) es un modelo de generacion texto-a-imagen de dominio muy especifico: produce sprites pixel-art de 16x16 RGBA con fondo transparente a partir de descripciones cortas en ingles. Lo desarrolla DexagonAI y se distribuye como un unico repositorio en Hugging Face con pesos en safetensors y una demo autonoma en HTML. Su interes no es la calidad fotografica, sino demostrar el limite inferior practico de un modelo de difusion funcional: 10.040.336 parametros en total, de los cuales 8.052.112 corresponden al transformer de difusion (DiT) y 1.463.936 al codificador de texto.

La arquitectura es un DiT compacto (parches 2x2, 64 tokens, anchura 256, 8 bloques, 4 cabezas, adaLN-Zero) entrenado con rectified flow y muestreo Euler. El codificador de texto es un transformer de 2 capas con vocabulario de 8.192 palabras y subpalabras por trigramas de caracteres con hash FNV-1a, lo que permite generar algo razonable incluso con palabras fuera de vocabulario.

Es relevante ahora por dos motivos: primero, porque cabe entero en el navegador (demo HTML de 24 MB, inferencia en JavaScript puro, unos 48 MB de memoria) y funciona sin conexion; segundo, porque el autor publica una receta de entrenamiento reproducible (150.000 pasos, batch 256, ~1,6 horas en una sola RTX PRO 6000) sobre el dataset Angais/pixel-art-atlas-1.4m, lo que lo convierte en un caso de estudio util para quien quiera entender el coste minimo de un generador de imagenes condicionado por texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer): parches 2x2, 64 tokens, anchura 256, 8 bloques, 4 cabezas, adaLN-Zero, posiciones 2D sincos |
| Parametros totales | 10.040.336 (8.052.112 DiT + 1.463.936 codificador de texto, incluidos 524.288 de embedding de subpalabras) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto corta; el tokenizador usa vocabulario de 8.192 palabras mas 4.096 buckets de subpalabras) |
| Tipos de cuantizacion | Pesos publicados en int8 por fila (percentil 90) con residuos dispersos fp32 para valores atipicos; el safetensors del repo esta en float32; la demo web usa los mismos pesos int8 |
| Idiomas soportados | no disponible (los ejemplos y el vocabulario estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32, 127 tensores) mas pesos int8 empaquetados en la demo HTML |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion (DiT) que opera sobre imagenes de 16x16 píxeles divididas en parches de 2x2, lo que da una secuencia de 64 tokens. Cada bloque usa atencion con 4 cabezas y modulacion adaLN-Zero, con codificacion posicional sinusoidal 2D. La condicion de texto se inyecta en la modulacion adaLN a partir de un embedding de caption obtenido por pooling de media enmascarado sobre las salidas de un transformer de 2 capas y anchura 128. El objetivo de entrenamiento es rectified flow: interpolacion lineal entre ruido y datos con objetivo de velocidad uniforme, y en inferencia se usa muestreo Euler con classifier-free guidance (caption dropout del 10 % durante el entrenamiento para habilitar CFG).

Los datos de entrenamiento suman 3.114.709 pares imagen-caption: 1.409.404 sprites generados para cada fila del dataset pixel-art-atlas-1.4m, 300.000 prompts composicionales sinteticos construidos con gramatica (sujeto + color + accesorio, por ejemplo "frog holding golden sword") con sus imagenes correspondientes, y 1.405.305 imagenes originales del dataset con sus captions. La receta es de 150.000 pasos con batch 256, AdamW (lr 2e-4, 2.000 de warmup, decaimiento coseno), autocast bf16, EMA 0.9999, grad clip 1.0 y semilla fija. Todo el entrenamiento y evaluacion se completo en aproximadamente 1,6 horas en una unica NVIDIA RTX PRO 6000 (Blackwell) a unos 6.800 muestras/s.

## Capacidades

- Generacion de sprites pixel-art de 16x16 RGBA con fondo transparente a partir de captions cortas en ingles.
- Composicion de atributos basicos: sujeto, color y accesorio ("cat wearing green crown", "ghost cat with glowing eyes").
- Fallback ante palabras desconocidas mediante subpalabras por trigramas de caracteres, de modo que siempre genera algo aunque el termino no este en el vocabulario.
- Control de adherencia al prompt mediante guidance (1.0 desactivado, 1.5 por defecto, 2.0-2.5 para prompts con dos atributos).
- Muestreo configurable entre 1 y 16 pasos; 4 pasos es el punto de equilibrio y 1 paso es bit-exacto con la referencia PyTorch.
- Inferencia en CPU y en navegador sin dependencias de red ni librerias externas.
- No soporta tool calling, function calling, agentes, vision de entrada, audio ni modo de razonamiento. Es exclusivamente texto a imagen.

## Casos de uso

- Prototipado rapido de assets para videojuegos: generar variantes de sprites 16x16 para placeholders de personajes, objetos y enemigos durante el diseno de un juego, con la ventaja de que la salida ya incluye canal alfa y se puede escalar con vecino mas cercano.
- Generacion de iconos y elementos de interfaz retro: producir iconos de inventario (pociones, espadas, cofres) coherentes en estilo pixel-art para menus y HUDs de juegos indie.
- Herramienta educativa sobre difusion: al ser un modelo de 10M de parametros con codigo de definicion autocontenido (modeling_indepth.py) y una demo que muestra paso a paso como se pinta la imagen, sirve para explicar rectified flow, CFG y adaLN en un cuaderno o en clase.
- Generacion offline en el navegador: la demo InDepth.html (24 MB, un solo archivo) permite crear sprites en entornos sin red o con restricciones de privacidad, ya que todo el calculo ocurre en el cliente.
- Aumento de datos para pipelines de pixel-art: generar pares imagen-caption sinteticos para preentrenar o aumentar datasets de sprites de baja resolucion antes de pasar a un modelo mayor.
- Base para experimentos de destilacion y cuantizacion: su tamano reducido y sus pesos int8 con residuos dispersos permiten probar tecnicas de compresion y comparar la deriva numerica float32 frente a float64 (la demo declara hasta 12/255 de desviacion a 4 pasos).
- Generacion de conjuntos tematicos: crear familias de sprites con un mismo sujeto y variaciones de color o accesorio para prototipar paletas y estilos de un juego.

## Benchmarks y rendimiento

Los unicos datos publicados comparan la version enviada (v4, 3,11M pares) con la version anterior (v2, 500K pares) sobre 2.000 prompts nuevos disjuntos y 1.000 prompts composicionales retenidos:

| Metrica | v2 (500K pares) | InDepth v4 (3,11M pares) |
|---|---|---|
| Flow loss, prompts nuevos | 0,17221 | 0,16428 |
| Flow loss, composicionales | 0,20677 | 0,16323 |
| NN-RMSE frente a referencia, composicionales | 92,25 | 87,99 |
| Mask IoU frente a referencia, composicionales | 0,7072 | 0,7584 |

Ademas, la model card incluye una comparacion cualitativa con tessera-small (47,6M parametros) a 16 pasos: InDepth iguala la composicion en la mayoria de los 15 prompts y anade fondos transparentes, mientras que tessera-small mantiene ventaja en detalle interno fino y sombreado sutil. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en float32 ocupa unos 48 MB en memoria; los pesos int8 en disco son 9,7 MB. Cabe en cualquier GPU con mas de 1 GB de VRAM e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU en unos 10 segundos por sprite segun el autor; en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) el cuello de botella sera el lanzamiento de kernels, no la memoria.
- Cabe en cualquier GPU consumer y en navegadores modernos mediante la demo HTML, que declara unos 48 MB de memoria en ejecucion.
- Opciones de despliegue: script Python con PyTorch y safetensors (run_indepth.py), definicion autocontenida en modeling_indepth.py, y demo InDepth.html en JavaScript puro sin librerias ni red.
- Latencia y throughput: aproximadamente 10 segundos por sprite en CPU y unos 6.800 muestras/s durante el entrenamiento en una RTX PRO 6000 (dato de entrenamiento, no de inferencia). No se publican cifras de latencia en GPU para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InDepth (indepth-10M) | 10,04M | 16x16 RGBA, fondo transparente | Caption corta en ingles; vocabulario 8.192 + subpalabras | no disponible | Hugging Face, demo HTML offline |
| tessera-small (referencia del autor) | 47,6M | Sprites pixel-art (fondo opaco) | Caption; CFG 3.0 en la comparacion | no disponible | Citado en la model card de InDepth; datos propios no disponibles |
| Modelos de difusion generalistas (p. ej. Stable Diffusion) | Cientos de millones a miles de millones | Imagenes de alta resolucion | Prompt largo, multiples idiomas | Varía segun variante | Amplia disponibilidad |

La comparacion con tessera-small procede unicamente de la model card de InDepth y se limita a una evaluacion cualitativa a 16 pasos; no hay datos cuantitativos publicados de tessera-small en la informacion disponible. Frente a modelos de difusion generalistas, InDepth sacrifica resolucion, detalle y vocabulario a cambio de un tamano tres o cuatro ordenes de magnitud menor y ejecucion en navegador.

## Limitaciones y advertencias

- El propio autor advierte que InDepth "no es apto para flujos de trabajo profesionales" y solo demuestra hasta donde se puede reducir un modelo de generacion de imagenes.
- La vinculacion de atributos es debil: la model card senala que la asociacion color-accesorio sigue siendo la habilidad mas floja incluso tras la mejora de v4.
- Resolucion fija de 16x16; no hay control de tamano, estilo ni paleta mas alla del texto.
- Vocabulario limitado a 8.192 palabras mas subpalabras por trigramas; los prompts fuera de ese lexico dependen del fallback y pueden producir resultados imprecisos.
- Los prompts en otros idiomas distintos del ingles no estan documentados ni soportados explicitamente.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede producir sprites que no correspondan a la caption, especialmente con prompts largos o con multiples atributos.
- No hay datos publicados sobre sesgos demograficos o culturales; el dataset de origen es pixel-art-atlas-1.4m, cuyas caracteristicas no se detallan en la informacion disponible.
- La deriva numerica float32 frente a float64 en la demo alcanza hasta 12/255 a 4 pasos, lo que puede afectar a la reproducibilidad exacta entre implementaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DexagonAI/indepth-10M
- Demo autonoma en HTML: https://huggingface.co/DexagonAI/indepth-10M/blob/main/InDepth.html
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
