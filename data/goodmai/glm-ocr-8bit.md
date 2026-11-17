# goodmai/GLM-OCR-8bit

## Resumen

GLM-OCR-8bit es una conversión a formato MLX del modelo `zai-org/GLM-OCR`, un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y extracción de texto desde imágenes. La ficha corresponde al repositorio `goodmai/GLM-OCR-8bit`, una redistribución del trabajo original de Z.ai (Zhipu AI) publicada con cuantización de 8 bits para su ejecución en hardware Apple Silicon mediante el framework MLX. El modelo cuenta con 1.107.405.824 parámetros (aproximadamente 1,1 mil millones) y un tamaño de repositorio de 1,6 GB.

El modelo resuelve el problema de la transcripción de texto en imágenes y documentos con soporte multilingüe: según las etiquetas del repositorio, cubre chino, inglés, francés, español, ruso, alemán, japonés y coreano. Su pipeline declarado es `image-to-text`, y se distribuye bajo licencia MIT, lo que facilita su integración tanto en proyectos comerciales como de investigación.

La relevancia de esta ficha concreta radica en su orientación a la inferencia local en equipos Apple Silicon: la conversión a MLX con cuantización de 8 bits permite ejecutar un modelo de OCR multimodal en un Mac sin depender de GPUs dedicadas ni de infraestructura en la nube. El repositorio incluye integración con la herramienta Basalt (macOS 27+, Swift 6.4) para su despliegue como servicio OCR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text); arquitectura interna no detallada en la información disponible |
| Parámetros totales | 1.107.405.824 (≈1,1 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (esta versión); el modelo original admite otras conversiones no detalladas |
| Idiomas soportados | chino, inglés, francés, español, ruso, alemán, japonés, coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza multimodal de tipo imagen-a-texto, propia de un modelo de visión-lenguaje orientado a OCR. El modelo original es `zai-org/GLM-OCR`, desarrollado por Z.ai (Zhipu AI), y esta versión ha sido convertida a MLX mediante `mlx-vlm` versión 0.3.11. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de esta ficha es la conversión a formato MLX con cuantización de 8 bits, que reduce el peso del modelo a 1,6 GB y permite su ejecución nativa en Apple Silicon. La integración con la herramienta Basalt (v0.11.0) permite desplegar el modelo como servicio OCR mediante un comando `basalt serve`, sin necesidad de Python.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos.
- Extracción de texto en ocho idiomas: chino, inglés, francés, español, ruso, alemán, japonés y coreano.
- Generación de texto descriptivo a partir de imágenes (pipeline `image-to-text`).
- Inferencia local en Apple Silicon mediante MLX, sin dependencia de GPUs dedicadas.
- Integración con la CLI y el servidor de Basalt para despliegue como servicio OCR.
- Compatibilidad con la librería `transformers` y con `mlx-vlm` para generación por línea de comandos.
- Soporte de tool calling, agentes o modo de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos en macOS: el modelo puede procesar imágenes de documentos y extraer su texto ejecutándose localmente en un Mac con Apple Silicon gracias a la conversión MLX de 8 bits, sin enviar datos a servicios externos.
- Extracción de texto multilingüe en aplicaciones de archivo: al cubrir ocho idiomas, resulta adecuado para digitalizar facturas, contratos o formularios en entornos con documentación en varios idiomas.
- Servicio OCR autoalojado: mediante `basalt serve --pipeline-ocr-model goodmai/GLM-OCR-8bit --rest` se puede exponer el modelo como endpoint REST para integrarlo en pipelines internos de procesamiento documental.
- Preprocesamiento para sistemas RAG: el texto extraído de imágenes y PDFs escaneados puede alimentar índices de recuperación, aprovechando la inferencia local para mantener la confidencialidad de los documentos.
- Automatización de accesibilidad: transcripción de texto contenido en imágenes para lectores de pantalla o generación de descripciones textuales a partir de capturas.
- Prototipado e investigación en visión-lenguaje: su tamaño reducido (1,1 mil millones de parámetros) y licencia MIT lo hacen adecuado para experimentación académica y ajuste fino sobre tareas específicas de OCR.
- Digitalización de archivos históricos o material impreso en varios idiomas, ejecutando el modelo en estaciones de trabajo locales sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una conversión MLX de 8 bits, el peso del modelo es de aproximadamente 1,6 GB; la memoria unificada necesaria en Apple Silicon será algo superior por el estado de la caché y el procesamiento de imágenes, aunque no se detalla una cifra exacta en la información disponible.
- GPU recomendadas: hardware Apple Silicon (la model card indica macOS 27+ y Swift 6.4 para Basalt); no se especifican GPUs NVIDIA en la información disponible.
- Compatibilidad con GPU de consumo: el modelo está pensado para ejecutarse en equipos Apple Silicon con memoria unificada; no se detalla compatibilidad con GPUs de consumo NVIDIA en la información proporcionada.
- Opciones de despliegue: `mlx-vlm` (generación por línea de comandos), Basalt v0.11.0 (servidor con endpoint REST), y la librería `transformers`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparativa rigurosa. Se indica a continuación únicamente lo que puede contrastarse a nivel de metadatos:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-OCR-8bit (esta ficha) | ≈1,1 mil millones | no disponible | MIT | safetensors (MLX, 8 bits) | Conversión MLX para Apple Silicon |
| zai-org/GLM-OCR | no disponible | no disponible | no disponible en esta ficha | no disponible | Modelo original del que deriva esta conversión |
| Alternativas de OCR multimodal | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- La información disponible no documenta sesgos conocidos del modelo; al ser un modelo de OCR multilingüe, es previsible que el rendimiento varíe según el idioma y la calidad de la imagen, pero no se aportan datos concretos.
- Riesgo de alucinación: no se documenta en la información proporcionada; en modelos de visión-lenguaje orientados a OCR existe riesgo de generar texto no presente en la imagen, aunque no se confirma para este modelo.
- Limitaciones de contexto e idioma: se soportan ocho idiomas (chino, inglés, francés, español, ruso, alemán, japonés y coreano); no se detalla la longitud de contexto ni el rendimiento por idioma.
- La licencia MIT permite uso comercial, pero esta ficha es una conversión de terceros (`goodmai`); conviene verificar la licencia y condiciones del modelo original `zai-org/GLM-OCR` antes de un despliegue en producción.
- Esta versión está orientada a MLX y Apple Silicon; no se garantiza su funcionamiento en otras plataformas sin reconversión.
- El repositorio tiene un número reducido de descargas (79) y ningún "like", lo que sugiere poca validación comunitaria de esta conversión concreta.
- No se dispone de información sobre latencia, throughput ni precisión en producción.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/goodmai/GLM-OCR-8bit
- Modelo original: https://huggingface.co/zai-org/GLM-OCR
- Conversión MLX de referencia: https://huggingface.co/mlx-community/GLM-OCR-8bit
- Herramienta Basalt (release v0.11.0): https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Demo de ejecución con Basalt: https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FGLM-OCR-8bit&role=ocr
