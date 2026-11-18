# alphaedge-ai/siglip2-giant-opt-patch16-384-hau-16384

## Resumen

siglip2-giant-opt-patch16-384-hau-16384 es una variante "trimmed" (podada) del encoder vision-lenguaje SigLIP 2 de Google, publicada por alphaedge-ai. El modelo original google/siglip2-giant-opt-patch16-384 se ha reducido un 14,75% en numero de parametros mediante la reduccion del vocabulario del tokenizador de texto de 256.000 a 16.384 tokens (una reduccion del 93,60%), conservando el resto de la arquitectura intacta. El objetivo es especializar el modelo para el idioma hausa (codigo ISO `ha`), eliminando los tokens del vocabulario que no se usan en ese idioma.

La arquitectura subyacente es SigLIP 2, un par de encoders (vision y texto) entrenados con perdida sigmoide para alineamiento imagen-texto. El modelo resultante mantiene 1.595.847.794 parametros (frente a 1.871.885.426 del original) y sigue siendo utilizable tanto para zero-shot image classification como para similitud texto-imagen mediante sentence-transformers.

Es relevante para equipos que despliegan clasificacion o recuperacion multimodal en hausa con restricciones de memoria: reduce el peso del repositorio a 6,4 GB y el numero de parametros en casi 276 millones, a costa de perder competencia en otros idiomas. La licencia Apache 2.0 y el formato safetensors facilitan su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (par de encoders transformer vision + texto, perdida sigmoide) |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/INT8) |
| Idiomas soportados | hausa (`ha`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Vocabulario | 16.384 tokens (original: 256.000; reduccion del 93,60%) |
| Reduccion de parametros | 14,75% respecto al original |
| Resolucion de parche | 16x16, imagen de entrada 384x384 |
| Libreria | sentence-transformers / transformers |
| Pipeline | zero-shot-image-classification |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2 descrita en el paper arXiv:2502.14786 (Tschannen et al., 2025): dos torres transformer, una para imagenes con parches de 16x16 a resolucion 384x384 y otra para texto, alineadas mediante una funcion de perdida sigmoide en lugar de softmax contrastivo. La variante "giant" del modelo original incorpora las mejoras de SigLIP 2 en comprension semantica, localizacion y caracteristicas densas.

El proceso de "trimming" no reentrena el modelo. Se seleccionan los tokens del vocabulario relevantes para hausa a partir de 200.000 textos del dataset lbourdois/fineweb-2-trimming, se recorta la matriz de embeddings de texto a 16.384 filas y se conservan los pesos restantes del modelo original. No se documenta en la informacion disponible ningun ajuste fino posterior, RLHF ni DPO; el autor indica que el modelo podado "deberia comportarse de forma similar al original" en hausa, con una huella de memoria mucho menor.

## Capacidades

- Clasificacion de imagenes zero-shot: emparejamiento de una imagen con etiquetas candidatas en hausa mediante el pipeline `zero-shot-image-classification`.
- Similitud texto-imagen: generacion de embeddings de imagen y de texto comparables mediante `sentence_transformers`, util para busqueda y recuperacion multimodal.
- Alineamiento vision-lenguaje en hausa: el vocabulario podado esta optimizado para ese idioma, por lo que la tokenizacion de textos en hausa es mas eficiente en memoria.
- Capacidades densas heredadas de SigLIP 2: el modelo base soporta caracteristicas densas y localizacion, aunque la model card de esta variante no las documenta explicitamente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, thinking mode, vision generativa ni audio.

## Casos de uso

- Clasificacion automatica de imagenes en hausa: etiquetar fotografias con categorias redactadas en hausa sin entrenamiento supervisado, usando el pipeline zero-shot; adecuado porque el vocabulario podado cubre especificamente ese idioma.
- Moderacion de contenido visual en plataformas hausaparlantes: comparar imagenes entrantes contra un conjunto de etiquetas de politica en hausa para filtrar contenido no deseado antes de revision humana.
- Busqueda multimodal en hausa: indexar un catalogo de imagenes con embeddings y permitir consultas en texto hausa mediante similitud coseno; el menor tamano del modelo reduce el coste de almacenamiento de embeddings y del servicio de inferencia.
- Etiquetado de datasets para entrenamiento: preanotar grandes corpus de imagenes con categorias en hausa para acelerar la creacion de datasets supervisados, aprovechando la inferencia zero-shot.
- Accesibilidad: generar descripciones o etiquetas en hausa de imagenes para lectores de pantalla o interfaces de asistencia, usando la similitud texto-imagen para seleccionar la etiqueta mas probable.
- Despliegue en infraestructura limitada: al reducir el repositorio a 6,4 GB y los parametros en un 14,75%, el modelo cabe en GPUs de gama media para servir clasificacion de imagenes en hausa con menor presion de memoria que el original.
- Investigacion en eficiencia multimodal: servir como punto de comparacion para estudiar el impacto del trimming de vocabulario en tareas vision-lenguaje de bajo recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,2 GB solo para pesos (1.595.847.794 parametros x 2 bytes), mas memoria para activaciones y el encoder de imagen a 384x384; en la practica se recomienda reservar entre 6 y 8 GB.
- VRAM estimada en FP32: aproximadamente 6,4 GB solo para pesos, mas activaciones; poco practico en GPUs de consumo.
- GPU recomendadas: A100, H100 o L40S para servicio de alto throughput; RTX 4090, RTX 3090 o RTX A5000 para desarrollo y despliegue de un solo nodo.
- GPU de consumo: cabe en GPUs con 8 GB o mas en FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante). En GPUs de 4-6 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: transformers (`pipeline`), sentence-transformers, y servidores de inferencia compatibles con modelos transformers (por ejemplo TGI o vLLM, aunque no se documenta soporte explicito de SigLIP 2 en ellos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-hau-16384 | 1.595.847.794 | 16.384 | hausa | apache-2.0 | Variante podada, 14,75% menos parametros |
| google/siglip2-giant-opt-patch16-384 | 1.871.885.426 | 256.000 | multilingue | apache-2.0 | Modelo base original, mayor huella de memoria |
| Otras variantes trimmed de SigLIP 2 | no disponible | no disponible | por idioma | apache-2.0 | El autor publica variantes por idioma con el mismo metodo |

## Limitaciones y advertencias

- El vocabulario podado elimina tokens no usados en hausa; el rendimiento en otros idiomas puede degradarse notablemente respecto al modelo original.
- El autor no publica evaluaciones cuantitativas del modelo podado frente al original; la afirmacion de rendimiento "similar" no esta respaldada con numeros en la model card.
- Solo se declara soporte para hausa (`ha`); no se documentan otros idiomas ni capacidades multilingues.
- Riesgo de alucinacion y sesgos: no se documentan analisis de sesgo ni evaluaciones de robustez para esta variante.
- No se documentan resultados de benchmarks, latencia ni throughput, lo que dificulta estimar el rendimiento en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de minado deben verificarse por separado si se redistribuye.
- El modelo tiene muy poca traccion (7 descargas, 0 likes) y no hay evidencia de validacion por terceros.
- No se documentan variantes cuantizadas (GGUF, INT8, INT4), lo que limita el despliegue en hardware muy restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-hau-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
