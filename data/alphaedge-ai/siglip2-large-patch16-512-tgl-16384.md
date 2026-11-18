# alphaedge-ai/siglip2-large-patch16-512-tgl-16384

## Resumen

siglip2-large-patch16-512-tgl-16384 es una version recortada (trimmed) del modelo de vision-lenguaje google/siglip2-large-patch16-512, publicada por alphaedge-ai. El recorte consiste en la reduccion del vocabulario del tokenizador de texto desde 256.000 tokens hasta 16.384 tokens, seleccionados especificamente para el idioma tagalo (tl) mediante mineria sobre 110.351 textos del dataset lbourdois/fineweb-2-trimming. El resultado es un modelo un 27,81% mas pequeno en numero de parametros (636.946.434 frente a 882.313.218), manteniendo la arquitectura y el comportamiento del modelo original para el idioma objetivo.

El modelo resuelve el problema del sobredimensionamiento de vocabulario en modelos multilingues cuando el despliegue se restringe a un unico idioma: al eliminar los tokens no utilizados en tagalo, se reduce el peso del embedding de texto y, con ello, el tamano del repositorio (2,6 GB) y la huella de memoria en inferencia. Es relevante para equipos que necesitan clasificacion zero-shot de imagenes o similitud texto-imagen en tagalo con un coste de despliegue menor que el del SigLIP 2 Large completo.

La arquitectura subyacente es SigLIP 2, un encoder vision-lenguaje de tipo transformer con atencion tipo sigmoid loss, patch size 16 y resolucion de entrada 512x512. El modelo se distribuye en formato safetensors y es compatible con las librerias transformers (pipeline de zero-shot-image-classification) y sentence-transformers (embeddings de imagen y texto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (transformer vision-lenguaje, patch size 16, resolucion 512) |
| Parametros totales | 636.946.434 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tagalo (tl) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2 del modelo base google/siglip2-large-patch16-512, descrita en el paper arXiv:2502.14786. Se trata de un par de encoders (vision y texto) entrenados con una funcion de perdida sigmoide en lugar de softmax contrastivo, lo que permite el entrenamiento con lotes mas grandes y mejora la calidad de los embeddings. El encoder de vision procesa parches de 16x16 sobre imagenes de 512x512; el encoder de texto proyecta las etiquetas candidatas al mismo espacio latente para calcular similitudes.

El proceso de trimming no implica reentrenamiento: se conservan los pesos del modelo original correspondientes a los tokens del nuevo vocabulario y se descartan las filas del embedding de texto asociadas a tokens eliminados. La seleccion de los 16.384 tokens se realizo minando 110.351 textos en tagalo del dataset lbourdois/fineweb-2-trimming, de modo que el vocabulario resultante cubre las unidades subword mas frecuentes en ese idioma. No se dispone de informacion sobre el numero total de tokens de entrenamiento del modelo base ni sobre si hubo etapas de RLHF o DPO, ya que SigLIP 2 es un modelo de embeddings y no un modelo generativo.

## Capacidades

- Clasificacion zero-shot de imagenes: asigna etiquetas candidatas en tagalo a una imagen sin entrenamiento especifico.
- Similitud texto-imagen: genera embeddings de imagen y de texto comparables mediante producto escalar.
- Recuperacion multimodal: busqueda de imagenes por descripcion textual y viceversa en tagalo.
- Extraccion de caracteristicas visuales densas para tareas posteriores (deteccion, segmentacion, localizacion), heredadas de SigLIP 2.
- Capacidades multilingues limitadas al tagalo: el vocabulario recortado elimina tokens de otros idiomas, por lo que el rendimiento fuera del tagalo puede degradarse.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo de instrucciones.
- No dispone de modo thinking, vision generativa, audio ni salida de texto libre.

## Casos de uso

- Moderacion de contenido visual en plataformas filipinas: clasificar imagenes contra un conjunto de etiquetas en tagalo (por ejemplo, categorias de contenido inapropiado) sin entrenar un clasificador especifico, usando el pipeline de zero-shot-image-classification.
- Etiquetado automatico de catalogos de e-commerce: asignar categorias en tagalo a imagenes de producto comparando los embeddings de imagen con descripciones textuales de cada categoria, con un coste de memoria menor que el del SigLIP 2 Large completo.
- Busqueda visual en aplicaciones locales: indexar embeddings de imagenes y permitir consultas en tagalo mediante similitud coseno, aprovechando la reduccion de vocabulario para desplegar en infraestructura mas ajustada.
- Organizacion de archivos fotograficos personales: agrupar y filtrar imagenes por descripciones en tagalo introducidas por el usuario, usando sentence-transformers para calcular similitudes.
- Investigacion en vision-lenguaje para idiomas de bajos recursos: servir como punto de partida para estudiar el impacto del recorte de vocabulario en tareas de recuperacion multimodal en tagalo.
- Filtrado de datasets multimodales: clasificar pares imagen-texto en tagalo por relevancia tematica antes de incluirlos en pipelines de entrenamiento, reduciendo el ruido del corpus.
- Despliegue en dispositivos con memoria limitada: al ocupar 2,6 GB en safetensors y 636,9 M de parametros, es viable en GPUs de gama media para inferencia por lotes pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos, mas activaciones y buffers de imagen (depende del tamano de lote y la resolucion).
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB para pesos, mas activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para lotes pequenos; A100, H100 o L40S para inferencia por lotes a gran escala.
- Cabe en GPUs de consumo: si, en RTX 3060, RTX 4060, RTX 4070 y superiores con fp16; en GPUs integradas o Apple Silicon mediante sentence-transformers con backend MPS.
- Opciones de despliegue: transformers (pipeline de zero-shot-image-classification), sentence-transformers, y exportacion a ONNX si se necesita optimizacion; no se documenta soporte nativo para vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-large-patch16-512-tgl-16384 | 636.946.434 | no disponible | tagalo | apache-2.0 | Version recortada, vocabulario de 16.384 tokens |
| google/siglip2-large-patch16-512 | 882.313.218 | no disponible | multilingue | apache-2.0 | Modelo base original, vocabulario de 256.000 tokens |
| google/siglip2-base-patch16-512 | no disponible | no disponible | multilingue | apache-2.0 | Variante base de SigLIP 2, menor capacidad |
| openai/clip-vit-large-patch14 | no disponible | no disponible | ingles principalmente | no disponible | Alternativa CLIP clasica, sin soporte nativo de tagalo |

## Limitaciones y advertencias

- El recorte de vocabulario degrada el rendimiento en idiomas distintos del tagalo; no debe usarse como modelo multilingue.
- Al ser un modelo de embeddings y no generativo, puede producir similitudes erroneas en imagenes ambiguas o etiquetas poco representadas en el corpus de mineria.
- Riesgo de sesgo: el corpus de mineria (fineweb-2) y el modelo base pueden reflejar sesgos culturales y linguisticos del tagalo de Filipinas, con posible infrarepresentacion de variantes regionales.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base google/siglip2-large-patch16-512 y del dataset lbourdois/fineweb-2-trimming.
- No se han publicado benchmarks que validen la perdida de rendimiento respecto al modelo original en tareas downstream; conviene evaluar en el dominio concreto antes de produccion.
- El modelo tiene pocas descargas y likes (4 y 0 en el momento de la consulta), lo que reduce la evidencia de uso en produccion y el soporte de la comunidad.
- No se documentan tecnicas de cuantizacion ni formatos GGUF, lo que limita el despliegue en entornos sin soporte de safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-large-patch16-512-tgl-16384
- Modelo base: https://huggingface.co/google/siglip2-large-patch16-512
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
