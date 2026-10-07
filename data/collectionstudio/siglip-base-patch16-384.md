# CollectionStudio/siglip-base-patch16-384

## Resumen

SigLIP (Sigmoid Loss for Language Image Pre-Training) es un modelo multimodal de vision y lenguaje que aprende representaciones conjuntas de imagenes y texto mediante una funcion de perdida sigmoidea aplicada par a par, en lugar del contraste softmax clasico de CLIP. Esta ficha corresponde a la variante base con parches de 16x16 y resolucion de entrada de 384x384, con 203.447.810 parametros, desarrollada originalmente por Google Research (Zhai et al.) y publicada en el repositorio big_vision. El repositorio aqui descrito es una resubida de terceros bajo el identificador CollectionStudio/siglip-base-patch16-384, no el repositorio oficial de Google.

El modelo resuelve tareas de alineacion imagen-texto sin necesidad de un clasificador entrenado especificamente: permite clasificacion de imagenes zero-shot, recuperacion imagen-texto y extraccion de embeddings multimodales. Su relevancia radica en que la perdida sigmoidea elimina la necesidad de una normalizacion global de similitudes entre todos los pares del lote, lo que facilita escalar el tamano de batch y mejora el rendimiento con lotes pequenos frente a CLIP. Esto lo ha convertido en una alternativa habitual como encoder visual en sistemas multimodales modernos.

No se trata de un modelo generativo de lenguaje: es un doble codificador (vision + texto) que produce embeddings, no texto. Se entreno sobre pares imagen-texto en ingles del dataset WebLI, con una ventana de texto fija de 64 tokens, y se distribuye bajo licencia Apache 2.0 en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador transformer (vision encoder ViT + text encoder), alineacion contrastiva con perdida sigmoidea |
| Parametros totales | 203.447.810 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (longitud fija de tokenizacion y padding) |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas oficiales; compatible con fp16/bf16 e int8 mediante cuantizacion post-entrenamiento |
| Idiomas soportados | principalmente ingles (entrenado sobre pares imagen-texto en ingles de WebLI); otros idiomas no disponibles de forma oficial |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Resolucion de imagen | 384x384 (parches de 16x16) |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

SigLIP sigue la estirpe de CLIP: un codificador de vision tipo Vision Transformer que procesa la imagen dividida en parches de 16x16 (a resolucion 384x384) y un codificador de texto tipo transformer que procesa la secuencia de tokens. Ambos proyectan sus salidas a un espacio latente comun donde se calcula la similitud imagen-texto. La innovacion tecnica central es la funcion de perdida sigmoidea: en lugar de normalizar las similitudes sobre todo el lote (softmax contrastivo, que requiere una vista global de los pares), calcula una probabilidad sigmoidea independiente por cada par imagen-texto. Esto permite aumentar el tamano de batch sin la penalizacion computacional asociada a la normalizacion global y mejora el comportamiento cuando los lotes son pequenos.

El entrenamiento se realizo sobre los pares imagen-texto en ingles del dataset WebLI (Chen et al., 2023). Las imagenes se redimensionan a 384x384 y se normalizan por canal RGB con media (0,5, 0,5, 0,5) y desviacion tipica (0,5, 0,5, 0,5). Los textos se tokenizan y se rellenan (padding) hasta una longitud fija de 64 tokens. El computo empleado fue de 16 chips TPU-v4 durante tres dias. No se documenta en la informacion disponible una fase posterior de RLHF o DPO, algo coherente con un modelo de representacion y no generativo.

## Capacidades

- Clasificacion de imagenes zero-shot: asignar etiquetas de texto arbitrarias a una imagen sin reentrenamiento, calculando la probabilidad sigmoidea de cada par imagen-texto.
- Recuperacion imagen-texto y texto-imagen: generar embeddings alineados para busqueda semantica cruzada entre ambos dominios.
- Extraccion de caracteristicas (feature extraction): embeddings de imagen y de texto reutilizables como base para cabeceras de clasificacion o tareas posteriores.
- Base para ajuste fino (fine-tuning) en dominios especificos como clasificacion medica, industrial o de producto.
- Capacidades multilingues: limitadas en la practica al ingles, idioma de los pares de entrenamiento.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje generativo).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades especiales: no dispone de modo de razonamiento (thinking mode), vision generativa, audio ni generacion de texto.

## Casos de uso

- Moderacion de contenido visual: clasificacion zero-shot de imagenes contra categorias de politica (por ejemplo "contenido violento", "desnudo") sin entrenar un clasificador dedicado, aprovechando que solo hay que definir etiquetas de texto.
- Busqueda semantica en catalogos de producto: indexar imagenes de un e-commerce y permitir consultas en lenguaje natural mediante recuperacion imagen-texto sobre los embeddings del doble codificador.
- Etiquetado automatico de datasets: preanotar grandes volumenes de imagenes con etiquetas candidatas generadas por texto, reduciendo el esfuerzo de anotacion manual antes de una revision humana.
- Filtrado y curacion de datos de entrenamiento: descartar pares imagen-texto mal alineados en un pipeline de recoleccion de datos comparando la similitud de los embeddings.
- Base para clasificadores especializados: congelar el encoder visual y entrenar una cabeza ligera sobre las caracteristicas extraidas para tareas concretas (deteccion de defectos, clasificacion de especies, triaje de imagenes medicas).
- Pre-filtrado en sistemas RAG multimodales: seleccionar que imagenes de un repositorio son relevantes para una consulta textual antes de pasarlas a un modelo generativo multimodal.
- Recomendacion visual: calcular afinidad entre el contenido visual de un articulo y las preferencias descritas en texto del usuario para ordenar recomendaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con cifras concretas en la informacion disponible. La model card original incluye una tabla de evaluacion comparativa con CLIP (tomada del paper de Zhai et al.), pero sus valores no estan presentes en el texto proporcionado, por lo que no se reproducen aqui. Para datos comparativos numericos debe consultarse directamente el paper "Sigmoid Loss for Language Image Pre-Training" (arXiv:2303.15343).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): en fp32 en torno a 0,8 GB; en fp16/bf16 alrededor de 0,4 GB; en int8 aproximadamente 0,2 GB. Hay que sumar memoria para activaciones, que crece con el tamano de batch y la resolucion de imagen.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM para inferencia de baja latencia; para lotes grandes o fine-tuning se recomienda mayor capacidad (por ejemplo A100, H100 o RTX 4090). El modelo se entreno en TPU-v4, aunque la inferencia estandar se realiza en GPU.
- Compatibilidad con GPU de consumo: si, cabe con holgura en GPU de consumo basicas (GTX 1060 6 GB, RTX 3050, RTX 3060, e incluso tarjetas de 4 GB en fp16 con lotes pequenos).
- Opciones de despliegue: transformers (AutoModel / AutoProcessor y pipeline de zero-shot-image-classification), timm, open_clip, exportacion a ONNX Runtime o TensorRT; el entrenamiento original se realizo en JAX/big_vision. No es un modelo destinado a servidores de LLM como vLLM o llama.cpp.
- Latencia y throughput estimados: no disponibles. Dependeran del hardware, la resolucion (384x384) y el tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada de imagen | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollectionStudio/siglip-base-patch16-384 (esta ficha) | 203.447.810 | 384x384 | 64 tokens | apache-2.0 | safetensors |
| google/siglip-base-patch16-384 | 203.447.810 | 384x384 | 64 tokens | apache-2.0 | safetensors (repositorio oficial) |
| google/siglip-base-patch16-224 | no disponible en la informacion proporcionada | 224x224 | 64 tokens | apache-2.0 | safetensors |
| openai/clip-vit-base-patch16 | no disponible en la informacion proporcionada | 224x224 | 77 tokens | licencia propia de OpenAI (no apache-2.0) | safetensors |

La diferencia principal frente a CLIP es la funcion de perdida (sigmoidea en SigLIP frente a softmax contrastiva en CLIP), que segun el paper mejora el rendimiento especialmente con lotes pequenos. No se dispone de cifras de rendimiento comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas; solo genera embeddings y puntuaciones de similitud. No debe evaluarse como si fuera un LLM.
- Sesgos de los datos: al entrenarse sobre WebLI (pares imagen-texto en ingles extraidos de la web), hereda los sesgos de representacion, sesgos culturales y desequilibrios de ese corpus.
- Limitacion de idioma: el entrenamiento es en ingles, por lo que el rendimiento con textos en castellano u otros idiomas puede degradarse notablemente.
- Ventana de texto muy corta: los textos se tokenizan y rellenan a 64 tokens, lo que limita las descripciones o etiquetas largas y no permite prompts extensos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de asignar etiquetas erroneas con alta confianza en dominios alejados de los datos de entrenamiento o con imagenes ambiguas.
- Repositorio de terceros: este repositorio (CollectionStudio) es una resubida no oficial, con 0 descargas y 0 likes en el momento de la consulta del 2026-10-06, sin verificacion por parte del equipo original. Para uso en produccion se recomienda partir del repositorio oficial google/siglip-base-patch16-384 y verificar la integridad de los pesos antes de sustituirlo.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial y modificacion con atribucion; debe conservarse el aviso de licencia y no se ofrece garantia alguna.
- En produccion, conviene calibrar los umbrales de similitud por dominio, ya que la escala de las probabilidades sigmoideas no es directamente comparable entre conjuntos de etiquetas distintos.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/CollectionStudio/siglip-base-patch16-384
- Repositorio oficial: https://huggingface.co/google/siglip-base-patch16-384
- Paper de SigLIP (Sigmoid Loss for Language Image Pre-Training): https://arxiv.org/abs/2303.15343
- Paper del dataset WebLI (Chen et al., 2023): https://arxiv.org/abs/2209.06794
- Repositorio de codigo original (google-research/big_vision): https://github.com/google-research/big_vision
- Documentacion de SigLIP en transformers: https://huggingface.co/docs/transformers/model_doc/siglip
- Resumen del autor sobre SigLIP: https://twitter.com/giffmana/status/1692641733459267713
- Busqueda de variantes en el hub: https://huggingface.co/models?search=google/siglip
