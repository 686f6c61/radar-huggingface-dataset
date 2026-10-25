# ajinkyapatil60/turtleid-student-onnx

## Resumen
Chelonid-ID Student ONNX es un modelo de visión destilado y exportado a ONNX por el usuario ajinkyapatil60 para la identificación de quelonios de agua dulce y tortugas terrestres de la India, con aplicación en conservación y triaje de delitos contra la fauna. El modelo está pensado para ejecutarse en el navegador mediante `onnxruntime-web`, lo que permite su uso en entornos de campo con recursos limitados o conectividad intermitente.

La arquitectura parte de un backbone `facebook/dinov2-with-registers-small` de 22 M de parámetros y un token CLS de 384 dimensiones. Sobre él se añade una cabeza de proyección de destilación que genera dos embeddings L2-normalizados de 1024 dimensiones: uno alineado con BioCLIP 2.5 ViT-H/14 y otro con DINOv2-with-registers-large. El repositorio incluye variantes INT8 (~23 MB), FP16 (~44 MB) y FP32 (~88 MB), además de un bundle JSON con una galería de referencia de 30 especies y una matriz MorphKey de 12 caracteres.

Su relevancia radica en llevar un modelo de identificación visual especializado a un formato pequeño y desplegable en navegador, sin depender de infraestructura GPU. No obstante, no se han publicado resultados de benchmarks ni métricas de validación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión DINOv2-with-registers-small con cabeza de proyección para destilación dual; exportado a ONNX |
| Parámetros totales | 22 M del backbone + ~2,5 M de la cabeza de proyección (estimación a partir de 384 -> 1024 -> 2048); ~24,5 M en total |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); no se especifica la resolución de entrada |
| Tipos de cuantización | INT8 dinámica, FP16 y FP32 |
| Idiomas soportados | no disponible (modelo de visión; no se declaran idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`); bundle JSON auxiliar para la galería de referencia |

## Arquitectura y entrenamiento
El modelo es un estudiante de destilación construido sobre `facebook/dinov2-with-registers-small`, un transformer de visión de 22 M de parámetros que produce un token CLS de 384 dimensiones. La cabeza de proyección descrita transforma esa representación mediante una capa 384 -> 1024 con activación GELU y otra 1024 -> 2048, dividida en dos embeddings de 1024 dimensiones que se normalizan con L2. Un embedding se alinea con BioCLIP 2.5 ViT-H/14 (`imageomics/bioclip-2.5-vith14`) y el otro con DINOv2-with-registers-large (`facebook/dinov2-with-registers-large`).

La model card no detalla el número de imágenes de entrenamiento, la composición del dataset, el régimen exacto de destilación ni si se aplicaron RLHF o DPO. La innovación principal es la doble alineación de embeddings en un estudiante pequeño, junto con la exportación a ONNX y la inclusión de una galería de referencia y una matriz MorphKey de 12 caracteres para su uso en navegador.

## Capacidades
- Extracción de características visuales y generación de embeddings de imágenes.
- Identificación de especies de quelonios incluidos en la base de 30 especies del bundle.
- Recuperación por similitud mediante comparación de embeddings contra una galería de referencia.
- Representación dual alineada con BioCLIP 2.5 ViT-H/14 y DINOv2-with-registers-large.
- Uso de una matriz MorphKey de 12 caracteres descrita en el bundle, orientada a caracteres morfológicos.
- Inferencia en navegador mediante `onnxruntime-web`, con variante INT8 de ~23 MB.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni generación multimodal.

## Casos de uso
- Triaje de delitos contra la fauna: un guarda forestal puede fotografiar un ejemplar y ejecutar el modelo en el navegador para obtener embeddings y compararlos con la galería de 30 especies, lo que ayuda a una primera identificación antes de la intervención de expertos.
- Aplicación web de campo sin conectividad: al pesar ~23 MB en INT8 y funcionar con `onnxruntime-web`, el modelo puede cargarse en una aplicación web progresiva y usarse en dispositivos con recursos limitados.
- Verificación de decomisos: en una incautación, el modelo puede generar un embedding de la imagen y contrastarlo con la galería de referencia para apoyar la identificación de la especie y documentar la matriz MorphKey.
- Monitoreo de poblaciones con cámaras trampa: los embeddings pueden extraerse por lotes y usarse para agrupar o comparar imágenes, facilitando el análisis posterior por parte de biólogos.
- Ciencia ciudadana: una plataforma puede validar avistamientos enviados por usuarios antes de que un experto revise los casos dudosos.
- Investigación morfométrica: la matriz MorphKey de 12 caracteres puede servir como representación auxiliar en estudios comparativos de morfología de quelonios.
- Filtro previo en mercados ilegales: un pipeline de análisis de imágenes puede usar el modelo para detectar posibles especies protegidas en anuncios y priorizar la revisión humana.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión de clasificación, recuperación, latencia ni comparaciones con otros modelos; además, benchmarks de texto como MMLU, HumanEval o GSM8K no aplican a este modelo de visión.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. Los artefactos son pequeños (~23 MB INT8, ~44 MB FP16 y ~88 MB FP32), por lo que caben en memoria de CPU y dispositivos consumer; no se publican requisitos de VRAM.
- GPU recomendadas: no se especifican. El destino principal es `onnxruntime-web` en navegador, con ejecución en CPU; una GPU dedicada no es necesaria.
- Cabe en GPU consumer: sí, por el tamaño de los pesos, aunque no se documentan configuraciones ni rendimiento concreto.
- Opciones de despliegue: `onnxruntime-web` para navegador y ONNX Runtime para escritorio o servidor. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo de visión en ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chelonid-ID Student ONNX | ~24,5 M (22 M backbone + ~2,5 M cabeza) | no aplica | sin benchmarks publicados | MIT | HuggingFace |
| `facebook/dinov2-with-registers-small` (backbone) | 22 M | no aplica | no disponible en la información | no disponible | HuggingFace |
| `imageomics/bioclip-2.5-vith14` (docente) | no disponible | no aplica | no disponible en la información | no disponible | HuggingFace |
| `facebook/dinov2-with-registers-large` (docente) | no disponible | no aplica | no disponible en la información | no disponible | HuggingFace |

La comparativa relevante es que este modelo destila dos docentes de mayor tamaño en un estudiante de ~24,5 M de parámetros, optimizado para navegador y con doble embedding. No se dispone de datos públicos para comparar precisión, latencia o calidad de representación frente a los docentes.

## Limitaciones y advertencias
- Sesgos no documentados; el modelo está especializado en 30 especies de la India, por lo que su generalización a otras regiones o especies no está garantizada.
- No genera texto, por lo que el riesgo de alucinación lingüística no aplica; sí existe riesgo de falsos positivos y falsos negativos en la identificación visual.
- Limitación de dominio: depende de la galería de referencia y del bundle MorphKey incluidos; imágenes fuera de ese dominio pueden degradar la precisión.
- No se especifican resolución de entrada, preprocesado ni condiciones de captura recomendadas.
- Licencia MIT para el artefacto, pero no se detalla la licencia de los datos de entrenamiento ni de la galería de referencia; conviene revisarla antes de un uso comercial en producción.
- No hay benchmarks, métricas de validación ni comparaciones públicas de rendimiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se documenta un proceso de validación independiente.
- El uso en navegador depende de las capacidades de `onnxruntime-web` y del dispositivo; no se publican requisitos mínimos ni latencias esperadas.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/ajinkyapatil60/turtleid-student-onnx)
- [Backbone DINOv2-with-registers-small](https://huggingface.co/facebook/dinov2-with-registers-small)
- [Docente BioCLIP 2.5 ViT-H/14](https://huggingface.co/imageomics/bioclip-2.5-vith14)
- [Docente DINOv2-with-registers-large](https://huggingface.co/facebook/dinov2-with-registers-large)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
