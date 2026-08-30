# NZUONG/OBS-Diff-CyberRealistic-SD1.5

## Resumen

OBS-Diff-CyberRealistic-SD1.5 es un checkpoint de Stable Diffusion 1.5 cuyo UNet ha sido comprimido mediante poda estructurada one-shot con el framework OBS-Diff (Optimal Brain Surgeon for Diffusion). El modelo original, CyberRealistic, es un fine-tune fotorrealista de SD1.5 muy popular en la comunidad. Esta versión podada reduce los parámetros del UNet en un 34,9% (de 859,5M a 559,2M) y la memoria de pesos en un 35%, manteniendo una calidad de imagen visualmente similar según las comparativas publicadas. El resultado es un modelo más ligero y rápido, pensado para entornos con recursos limitados o para reducir costes de inferencia sin renunciar al estilo fotorrealista de CyberRealistic.

El modelo se distribuye como un reemplazo directo del UNet dentro del pipeline de diffusers, y se carga junto con el checkpoint original de CyberRealistic. La licencia es OpenRAIL++, lo que permite uso comercial con restricciones éticas. Es relevante ahora porque demuestra que la poda one-shot puede aplicarse a modelos de difusión de forma práctica, ofreciendo una alternativa a la destilación o cuantización para reducir el footprint de los modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de Stable Diffusion 1.5 (poda estructurada) |
| Parametros totales | 559.206.852 (UNet podado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (generación de imágenes) |
| Tipos de cuantizacion | FP16 (inferencia) |
| Idiomas soportados | No disponible (prompts en inglés principalmente) |
| Licencia | OpenRAIL++ |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo es un UNet de Stable Diffusion 1.5, que forma parte de un pipeline de difusión latente con VAE y CLIP. La compresión se realiza mediante OBS-Diff, un algoritmo de poda estructurada one-shot que utiliza la información de la curvatura (Hessiana) para identificar y eliminar canales o filtros redundantes. No hay entrenamiento adicional tras la poda; el proceso es puramente de compresión. El método está descrito en el paper arXiv 2510.06751.

La poda se aplica únicamente al UNet, manteniendo intactos el VAE y el text encoder. El checkpoint resultante se distribuye como un archivo .pth que debe cargarse y sustituir al UNet original en el pipeline de diffusers. Según la model card, la poda reduce los parámetros de 859.520.964 a 559.206.852 (-34,9%) y la VRAM de pesos de 1639,4 MiB a 1066,6 MiB.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts en lenguaje natural, heredando el estilo de CyberRealistic (retratos, escenas, objetos, etc.).
- Soporte de prompts negativos para refinar la composición y evitar artefactos.
- Compatible con el pipeline estándar de diffusers (StableDiffusionPipeline) y con schedulers como DPMSolverMultistep.
- No dispone de tool calling, capacidades de agente, ni procesamiento multimodal más allá de texto a imagen.
- El modelo original (CyberRealistic) es conocido por su versatilidad en estilos fotográficos, aunque esta versión podada puede presentar ligeras diferencias en detalles finos.

## Casos de uso

- Generación de imágenes para prototipos de diseño: permite crear conceptos visuales rápidamente con un coste computacional reducido, ideal para iteraciones en entornos de diseño.
- Creación de contenido para redes sociales: generar imágenes atractivas para publicaciones, banners o avatares con un modelo ligero que puede ejecutarse en GPUs de gama media.
- Ilustración de artículos y blogs: producir imágenes de acompañamiento para contenido editorial sin depender de bancos de imágenes, con un estilo fotorrealista consistente.
- Asistencia en diseño de personajes para videojuegos: generar variaciones de personajes o escenarios para concept art, aprovechando la velocidad de inferencia mejorada.
- Uso en entornos con recursos limitados: al reducir la VRAM necesaria, puede desplegarse en GPUs con 4-6 GB, como las de portátiles o tarjetas de gama de entrada, para aplicaciones de generación local.
- Integración en pipelines de automatización: al ser un reemplazo directo del UNet, puede incorporarse en flujos existentes de diffusers sin cambios de código, reduciendo el tiempo de inferencia en producción.

## Benchmarks y rendimiento

La model card publica una comparativa entre el UNet original y el podado, medida a 768x512 píxeles y 30 pasos de inferencia:

| Metrica | Original UNet | Pruned UNet |
|---|---|---|
| Parametros | 859.520.964 | 559.206.852 (-34,9%) |
| Model weights VRAM | 1639,4 MiB | 1066,6 MiB |
| Inference speed | 5,73 it/s | 8,55 it/s |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, etc.) en la información disponible. La comparativa visual incluida en la model card muestra una calidad subjetiva similar entre ambos modelos, aunque no se aportan métricas objetivas.

## Requisitos de hardware

- VRAM estimada para inferencia: el UNet podado ocupa ~1066 MiB en FP16. Sumando VAE y CLIP, el pipeline completo requiere aproximadamente 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060). Para mayor comodidad, se recomienda 6 GB o más.
- Puede ejecutarse en GPUs de consumo sin problemas, incluidas las de portátiles.
- Opciones de despliegue: el modelo se usa con la librería diffusers de Hugging Face. También puede convertirse a ONNX o TensorRT para optimización adicional, aunque no se proporcionan archivos preconvertidos.
- Latencia y throughput: según la model card, la velocidad de inferencia es de 8,55 it/s a 768x512 con 30 pasos, lo que equivale a unos 3,5 segundos por imagen en una GPU no especificada (probablemente de gama alta). En GPUs más modestas, el tiempo será mayor.

## Comparativa con modelos similares

La comparativa más directa es con el modelo original CyberRealistic sin podar, ya que este es una versión comprimida del mismo. No se dispone de datos de otros modelos de compresión para difusión (como destilación o cuantización) en la información proporcionada.

| Modelo | Parametros (UNet) | VRAM pesos | Velocidad (it/s) | Licencia |
|---|---|---|---|---|
| CyberRealistic original | 859.520.964 | 1639,4 MiB | 5,73 | OpenRAIL++ |
| OBS-Diff-CyberRealistic (podado) | 559.206.852 | 1066,6 MiB | 8,55 | OpenRAIL++ |

En términos de calidad, la model card afirma que la poda mantiene alta fidelidad, pero no se aportan métricas objetivas. Otros métodos de compresión como la destilación (p.ej., SD-Turbo) o la cuantización (p.ej., GGUF) no son directamente comparables porque abordan la compresión de forma diferente y no se dispone de datos de rendimiento para este modelo concreto.

## Limitaciones y advertencias

- La poda puede introducir ligeras pérdidas de calidad en detalles finos, texturas o elementos complejos, aunque la model card muestra ejemplos visuales donde la diferencia es mínima.
- Al ser un modelo basado en SD1.5, hereda las limitaciones de resolución nativa (512x512) y puede generar artefactos en resoluciones más altas si no se usa con cuidado.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar elementos irreales o distorsionados, especialmente con prompts ambiguos o poco específicos.
- La licencia OpenRAIL++ permite uso comercial, pero prohíbe usos ilegales, dañinos o engañosos, y exige no utilizar el modelo para generar contenido que promueva violencia, odio o explotación.
- El modelo se distribuye como un archivo .pth, lo que puede requerir conversión a otros formatos (safetensors, ONNX) para su uso en entornos de producción con políticas de seguridad.
- No se proporcionan datos sobre sesgos del modelo, pero al derivar de CyberRealistic, puede reflejar los sesgos presentes en los datos de entrenamiento originales de SD1.5.

## Enlaces

- [Hugging Face - NZUONG/OBS-Diff-CyberRealistic-SD1.5](https://huggingface.co/NZUONG/OBS-Diff-CyberRealistic-SD1.5)
- [Paper OBS-Diff (arXiv:2510.06751)](https://arxiv.org/abs/2510.06751)
- [CyberRealistic en Civitai](https://civitai.com/models/15003/cyberrealistic)
- [CyberRealistic en Open Laboratory](https://openlaboratory.com/models/cyber-realistic/)
- [CyberRealistic en CivArchive](https://civarchive.com/models/15003?modelVersionId=2681234)
- [CyberRealistic en Hugging Face (cyberdelia)](https://huggingface.co/cyberdelia/CyberRealistic)
