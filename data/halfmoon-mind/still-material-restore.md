# halfmoon-mind/still-material-restore

## Resumen

PhotographicMaterial512 (también referenciado como OMGSR-S en Stable Diffusion 2.1-base para Core ML) es una conversión a Core ML de OMGSR-S, un modelo de restauración de imagen real (superresolución) de un solo paso basado en difusión, publicado por los autores de OMGSR ("You Only Need One Mid-timestep Guidance for Real-World Image Super-Resolution", arXiv:2508.08227). El autor de la conversión, halfmoon-mind, ha fusionado los adaptadores LoRA de OMGSR-S (UNet y encoder VAE) en Stable Diffusion 2.1-base y ha empaquetado el resultado en tres programas ML para iOS 18, pensados para ejecutarse en el Neural Engine de dispositivos Apple.

El modelo resuelve la restauración de material fotográfico (piel, pelo, tejidos) a la resolución de origen mediante teselas de 512 px con solapamiento mínimo de 64 px. La aplicación iOS *Still (한컷)* lo descarga bajo demanda y lo usa como modelo de textura opcional de máxima calidad en su menú de desarrollador. Es relevante por su enfoque de un solo paso de difusión (frente a los pipelines multi-paso habituales), por su despliegue on-device en el Neural Engine y por su cuantización agresiva a 6 bits con paletas k-means en el denoiser.

El repositorio ocupa 0,8 GB, no tiene descargas ni likes registrados, y la información pública sobre benchmarks, idiomas o parámetros es muy limitada; los datos que no aparecen en la model card se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente de un solo paso (UNet + VAE encoder/decoder) derivada de Stable Diffusion 2.1-base, con adaptadores OMGSR-S fusionados; convertida a Core ML ML Programs |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); teselas fijas de 512 px con solapamiento mínimo de 64 px |
| Tipos de cuantizacion | Denoiser: 6 bits con paletas k-means; encoder y decoder VAE: FP16 |
| Idiomas soportados | no disponible (modelo de imagen, sin encoder de texto tras la conversión) |
| Licencia | CreativeML Open RAIL++-M (modelo derivado); OMGSR bajo Apache 2.0 |
| Formato de pesos | Core ML ML Program (.mlpackage); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Stable Diffusion 2.1-base como base latente y le fusiona los adaptadores LoRA de OMGSR-S publicados por los autores de OMGSR, tanto en el UNet como en el encoder VAE. La innovación central de OMGSR es la guía en un único timestep intermedio (*mid-timestep guidance*), que permite la restauración en un solo paso de difusión en lugar de un pipeline iterativo completo. La conversión fija el embedding de texto de prompt vacío y el timestep 273 en el denoiser, eliminando por completo el encoder de texto; el modelo resultante es puramente imagen a imagen, sin condicionamiento textual.

La conversión a Core ML genera tres etapas secuenciales (encoder, denoiser y decoder) como ML Programs para iOS 18, cada una con entrada `input` y salida `output`, ejecutadas sobre teselas de 512 px. El denoiser se cuantiza a 6 bits con paletas k-means, mientras que encoder y decoder conservan pesos FP16. Los pesos base proceden del espejo `Manojb/stable-diffusion-2-1-base` en la revisión `0094d483a120f3f33dafbd187ea4aa60d10de75c`, ya que el repositorio oficial de 2.1-base ya no está disponible. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Restauración y superresolución de imágenes fotográficas reales (no sintéticas) en un solo paso de difusión.
- Restauración de detalle en piel, pelo y tejidos a la resolución de origen, trabajando por teselas de 512 px.
- Procesamiento de capturas de alta resolución (hasta 4K) mediante mosaico con solapamiento mínimo de 64 px.
- Ejecución on-device en el Neural Engine de Apple (A16 y posteriores) mediante Core ML.
- Pipeline imagen a imagen sin encoder de texto: no acepta prompts ni condicionamiento textual.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión general, audio ni modo thinking.

## Casos de uso

- Restauración de fotografías en aplicaciones iOS: la app *Still* descarga el modelo bajo demanda y lo aplica a capturas 4K por teselas de 512 px, restaurando detalle de piel y tejidos en el propio dispositivo sin enviar imágenes a un servidor.
- Mejora de retratos y selfies: el modelo recupera textura de piel y pelo a la resolución de origen; la app preserva la forma del rostro y el texto leído como restricción para evitar alteraciones no deseadas.
- Restauración de material textil en fotografía de producto: las teselas de 512 px permiten procesar prendas y tejidos con detalle fino, útil en catálogos de moda o comercio electrónico.
- Procesamiento por lotes de archivos fotográficos: al ser un modelo de un solo paso, el coste por imagen es menor que el de pipelines de difusión multi-paso, lo que facilita el reprocesado de colecciones en dispositivos Apple.
- Comparación de calidad en herramientas de edición: el menú de desarrollador de la app permite alternar entre este modelo y el modelo de textura por defecto para evaluar diferencias de calidad en un mismo flujo.
- Investigación en superresolución on-device: los scripts de conversión (`fetch_omgsr.py`, `convert_omgsr.py`, `prepare_app_models.py`) del repositorio MaterialStudy permiten reproducir y adaptar la conversión Core ML para experimentos propios.
- Restauración de capturas antiguas o de baja calidad en flujos móviles: el modelo predice detalle plausible en imágenes reales degradadas, aunque el detalle generado es una predicción y no evidencia de lo capturado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (PSNR, SSIM, LPIPS, MMLU, HumanEval, GSM8K u otras métricas) en la información disponible. La model card únicamente aporta mediciones de latencia en dispositivo:

| Medicion | Valor |
|---|---|
| Dispositivo | iPhone 14 Pro (A16, iOS 18.4), Neural Engine |
| Primera captura 4K (incluye comprobación on-device y compilación) | 95,5 s |
| Capturas posteriores (rango) | 9,9–67,0 s |
| Media sobre cinco capturas | 36,1 s |

No se dispone de datos de throughput, PSNR ni comparativas numéricas con otros modelos de restauración.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está empaquetado para Core ML y no se distribuyen pesos en formato PyTorch, GGUF o safetensors.
- GPU recomendadas: no se documentan GPU de escritorio; el destino es el Neural Engine de Apple (A16 o posterior, iOS 18).
- Cabe en consumer GPU: no aplica en su forma actual (Core ML); no hay información sobre una versión ejecutable en GPU NVIDIA o AMD.
- Opciones de despliegue: Core ML en iOS 18 mediante tres ML Programs secuenciales (encoder, denoiser, decoder); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas de texto y no aplican a este modelo de imagen.
- Latencia y throughput: 95,5 s para la primera captura 4K y 9,9–67,0 s para las siguientes (media de 36,1 s sobre cinco capturas) en iPhone 14 Pro; el repositorio ocupa 0,8 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhotographicMaterial512 (este modelo) | no disponible | Teselas de 512 px | Latencia 9,9–67,0 s por captura 4K en iPhone 14 Pro | CreativeML Open RAIL++-M | Core ML, iOS 18, 0,8 GB |
| still-generative-detail-4x (halfmoon-mind) | no disponible | Superresolución ×4 | no disponible | openrail++ | Core ML, Neural Engine, int8 |
| OMGSR-S (original, wuer5/OMGSR) | no disponible | no disponible | no disponible | Apache 2.0 | Pesos PyTorch y código en GitHub |
| Stable Diffusion 2.1-base (base) | no disponible | 512 px | no disponible | CreativeML Open RAIL++-M | Repositorio oficial no disponible; espejo Manojb |

La comparativa se limita a los datos publicados; no hay cifras de calidad (PSNR/SSIM/LPIPS) para establecer una comparación numérica entre alternativas.

## Limitaciones y advertencias

- El detalle generado es una predicción, no evidencia de detalle capturado: rostros, gafas y texto pueden cambiar; la app mitiga esto preservando la forma del rostro y el texto leído, pero el modelo por sí solo no garantiza fidelidad.
- Sin encoder de texto: no admite prompts ni control por lenguaje natural; solo entrada de imagen.
- Resolución fija de 512 px por tesela con solapamiento mínimo de 64 px; imágenes de muy alta resolución requieren mosaico y pueden mostrar costuras si el solapamiento es insuficiente.
- Licencia CreativeML Open RAIL++-M con restricciones de uso de Attachment A: cualquier redistribución o producto que lo incluya debe transmitir esas restricciones como provisión exigible y entregar una copia de la licencia a los usuarios.
- El modelo es un derivado de Stable Diffusion 2.1-base y no está afiliado ni respaldado por Stability AI ni por los autores de OMGSR; no se ofrece garantía alguna, incluida la derivada de los datos de entrenamiento originales.
- Riesgo de alucinación visual: el modelo puede inventar texturas plausibles en zonas degradadas, lo que es inaceptable en contextos forenses, médicos o de verificación documental.
- Sesgos conocidos: no documentados en la información disponible; al heredar la base de Stable Diffusion 2.1, puede arrastrar sesgos de sus datos de entrenamiento.
- Idiomas: no disponible; el modelo no procesa texto, por lo que la dimensión multilingüe no aplica.
- Solo disponible como Core ML para iOS 18; no hay versión para otras plataformas ni formatos alternativos de pesos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido y sin reportes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halfmoon-mind/still-material-restore
- Modelo relacionado (still-generative-detail-4x): https://huggingface.co/halfmoon-mind/still-generative-detail-4x
- Paper OMGSR (arXiv:2508.08227): https://arxiv.org/abs/2508.08227
- Código OMGSR: https://github.com/wuer5/OMGSR
- Issue OMGSR sobre licencia: https://github.com/wuer5/OMGSR/issues/9
- Issue OSEDiff 77 (origen del espejo de pesos base): https://github.com/cswry/OSEDiff/issues/77
- Modelo base (espejo): https://huggingface.co/Manojb/stable-diffusion-2-1-base
- Licencia del modelo: https://huggingface.co/halfmoon-mind/still-material-restore/blob/main/LICENSE-MODEL
