# fushanbobfan/bioclip2-vitl14-image-onnx

## Resumen

`fushanbobfan/bioclip2-vitl14-image-onnx` es la torre visual del modelo `imageomics/bioclip-2` exportada a ONNX y cuantizada dinámicamente a int8 con ONNX Runtime. Se trata, por tanto, de un artefacto de despliegue y no de un modelo entrenado desde cero: el autor publica únicamente el codificador de imagen, sin la cabeza de clasificación ni los prototipos de especies, que quedan fuera del repositorio. La arquitectura subyacente es un ViT-L/14 (Vision Transformer con parches de 14x14) con licencia MIT.

El problema que resuelve es la inferencia eficiente de embeddings visuales: recibe tensores `(N,3,224,224)` en float32 y devuelve embeddings de 768 dimensiones, lo que permite construir índices de similitud, clasificadores por prototipos o pipelines de recuperación de imágenes biológicas sin cargar el modelo original en PyTorch. Según la model card, este encoder es el backbone visual del servicio de identificación Moth Trace.

Es relevante ahora porque buena parte del ecosistema de visión para biodiversidad sigue distribuyéndose en pesos PyTorch en fp32, y una exportación ONNX int8 de ~0,3 GB reduce drásticamente los requisitos de memoria y permite despliegue en CPU. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un artefacto reciente y poco validado por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/14 (Vision Transformer, parches de 14x14, resolución de entrada 224x224); solo torre de imagen |
| Parametros totales | No disponible en la model card (la denominación ViT-L/14 corresponde habitualmente al orden de 300 M de parámetros, sin confirmación en el repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (codificador de imagen; el repositorio no incluye encoder de texto) |
| Tipos de cuantizacion | int8 con cuantización dinámica de ONNX Runtime; la model card menciona además una exportación fp32 de referencia descrita en `export.json` |
| Idiomas soportados | No disponible (el repositorio solo contiene la torre visual; no hay componente de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero único `bioclip2_vitl14_image_int8.onnx`) |
| Entrada | `image` de forma (N,3,224,224), tipo float32 |
| Salida | `embedding` de forma (N,768) |
| Preprocesado | Redimensionado del lado corto a 224 (bicúbica), recorte central 224, escala a [0,1], normalización con media (0.48145466, 0.4578275, 0.40821073) y desviación (0.26862954, 0.26130258, 0.27577711) |
| Tamano del repositorio | 0,3 GB |
| SHA-256 del fichero ONNX | `c95ddf2d2b5cf6ab18ac34fc341aea1f841235a19100a08323546f83eab26a04` |
| Modelo base | `imageomics/bioclip-2` |
| Pipeline de HuggingFace | image-feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de escala "large" con parches de 14x14, la misma que emplea el modelo base `imageomics/bioclip-2`. La model card no detalla el número de capas, cabezas de atención, dimensión oculta ni el procedimiento de entrenamiento del modelo original: se limita a indicar que se trata de la torre de imagen de BioCLIP 2 (ViT-L/14, licencia MIT) y a remitir a la cita de Gu et al., 2025. No hay información disponible sobre el corpus de entrenamiento, el número de tokens o pares imagen-texto utilizados, ni sobre si hubo fases de RLHF o DPO (poco habituales en modelos contrastivos de visión-lenguaje).

La innovación técnica de este repositorio concreto está en el proceso de exportación y cuantización, no en el entrenamiento. La cuantización es dinámica y se aplicó con ONNX Runtime, y la model card reporta dos métricas de fidelidad: la similitud coseno entre los embeddings int8 y fp32 sobre una entrada aleatoria es de 0,990, y la exportación fp32 reproduce la salida de PyTorch con un error de 8,2e-06. Es importante señalar que esa similitud de 0,990 se midió sobre una entrada aleatoria, no sobre imágenes biológicas reales, por lo que no equivale a una medida de degradación en la tarea final.

## Capacidades

- Extracción de características visuales: genera un vector de 768 dimensiones por imagen a partir de entradas RGB de 224x224.
- Recuperación de imágenes por similitud: los embeddings permiten búsqueda por vecino más cercano con distancia coseno o producto escalar.
- Clasificación con prototipos: puede actuar como extractor congelado para clasificación few-shot o zero-shot calculando prototipos por clase, siempre que el usuario aporte dichos prototipos.
- Procesamiento por lotes: la entrada admite dimensión de batch arbitraria `N`.
- Inferencia en CPU: el formato ONNX int8 está pensado para ejecución con ONNX Runtime sin necesidad de GPU.
- Integración como backbone en servicios de identificación de especies: es la base del servicio Moth Trace según la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un codificador de imagen sin componente generativo ni de lenguaje.
- No incluye capacidades multilingües, de audio, de vídeo ni modo "thinking".

## Casos de uso

- Identificación de especies en producción: se extrae el embedding de la imagen de un ejemplar y se compara por similitud coseno contra una base de prototipos de especies mantenida aparte; es exactamente el patrón descrito para Moth Trace, con la ventaja de que este repositorio solo aporta el backbone.
- Búsqueda visual en colecciones biológicas: indexar los embeddings de 768 dimensiones en un motor vectorial (FAISS, Milvus, Qdrant) para recuperar imágenes morfológicamente similares dentro de una colección de miles o millones de especímenes.
- Clasificación few-shot con pocas imágenes por clase: congelar el encoder y calcular el centroide de los embeddings de unas pocas imágenes etiquetadas por especie, sin reentrenar el modelo.
- Curación y deduplicación de datasets: detectar imágenes duplicadas o casi duplicadas y posibles errores de etiquetado midiendo similitud entre embeddings antes de entrenar otros modelos.
- Monitorización de biodiversidad con cámaras trampa: procesar lotes de imágenes en un servidor sin GPU y filtrar tomas vacías o de baja calidad antes de la revisión por expertos.
- Despliegue en el borde o en entornos con recursos limitados: al ocupar el repositorio 0,3 GB y admitir ejecución en ONNX Runtime, puede integrarse en dispositivos con CPU modesta para preclasificación en campo.
- Preclasificación en plataformas de ciencia ciudadana: ordenar o agrupar observaciones subidas por usuarios antes de que un taxónomo las revise, reduciendo la carga manual.
- Extracción de características para modelos posteriores: usar los embeddings como entrada de clasificadores lineales, modelos de regresión de rasgos fenotípicos o detectores de especies invasoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud sobre tareas biológicas (por ejemplo, clasificación de especies, recuperación o transferencia lineal) ni comparaciones con el modelo base. Las únicas métricas reportadas son de fidelidad de la cuantización y de la exportación:

| Metrica | Valor | Condiciones |
|---|---|---|
| Similitud coseno int8 vs fp32 | 0,990 | Sobre una entrada aleatoria, no sobre imágenes reales |
| Error de la exportación fp32 frente a PyTorch | 8,2e-06 | Reportado en la model card |

## Requisitos de hardware

- Peso de los parámetros en int8: aproximadamente 0,3 GB, coherente con el tamaño del repositorio (0,3 GB).
- Peso equivalente en fp32: del orden de 1,2 GB, estimado por el factor 4 respecto a int8 y no confirmado en la model card.
- VRAM estimada para inferencia en GPU: en torno a 1-2 GB para lotes pequeños con el fichero int8, sumando pesos, activaciones y overhead del runtime; es una estimación, no un dato publicado.
- Cabe en cualquier GPU de consumo con al menos 2 GB de memoria (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090); el factor limitante no es la VRAM sino el coste de cómputo del ViT-L/14.
- Inferencia en CPU viable con ONNX Runtime, especialmente con el modelo int8; sin GPU es la vía recomendada para despliegues de bajo coste.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT, OpenVINO), integrable desde Python, C++, C# o Java; al ser un fichero ONNX también puede servirse con servidores compatibles con ONNX. No se distribuyen pesos GGUF, por lo que no es directamente desplegable con llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware, del tamaño de lote y del proveedor de ejecución de ONNX Runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y precision | Entrada / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fushanbobfan/bioclip2-vitl14-image-onnx` | No disponible (ViT-L/14) | ONNX, int8 (cuantización dinámica) | Imagen 224x224 / embedding 768 | MIT | HuggingFace, 0 descargas |
| `imageomics/bioclip-2` (modelo base) | No disponible en la información proporcionada | Pesos PyTorch en fp32 (según el modelo base referenciado) | Modelo completo de visión-lenguaje, incluye torre de texto | MIT | HuggingFace |
| Otros codificadores de imagen ViT-L/14 tipo CLIP/OpenCLIP | No disponible | PyTorch, fp32 o fp16 | Imagen / embedding de dimensión variable | Variable según el modelo | HuggingFace y otros repositorios |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada, por lo que no es posible establecer qué alternativa ofrece mejor exactitud en tareas de identificación biológica.

## Limitaciones y advertencias

- Es solo la torre de imagen: no incluye cabeza de clasificación, proyección de texto ni prototipos de especies, de modo que por sí sola no produce etiquetas, únicamente embeddings.
- Sin encoder de texto no permite clasificación zero-shot mediante prompts textuales, la capacidad característica de los modelos contrastivos imagen-texto.
- La fidelidad reportada (similitud coseno de 0,990) se midió sobre una entrada aleatoria; no hay evidencia publicada sobre la pérdida de exactitud del int8 en imágenes biológicas reales.
- No hay benchmarks de tareas biológicas en la información disponible, por lo que se desconoce el rendimiento real en identificación de especies.
- Riesgo de sesgo heredado del modelo base: el comportamiento diferencial por taxón, hábitat, iluminación o calidad de imagen no está documentado en este repositorio.
- Riesgo de uso indebido: los embeddings pueden ser similares entre especies próximas; cualquier decisión taxonómica automatizada debería validarse con revisión experta.
- Restricciones de licencia: el repositorio es MIT, pero al derivar de `imageomics/bioclip-2` conviene revisar la licencia del modelo base y, si se usa BioCLIP 2, citar a los autores originales (Gu et al., 2025) según indica la model card.
- El repositorio presenta 0 descargas y 0 likes, y una fecha de creación poco habitual (2026-09-12); conviene tratarlo como artefacto sin validación comunitaria y verificar el SHA-256 antes de usarlo en producción.
- No se especifican los idiomas soportados ni existe componente lingüístico, por lo que la fila de idiomas no aplica más allá de la ausencia de texto.
- No se publican latencias ni throughput, así que cualquier estimación de coste de inferencia debe medirse en el hardware objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fushanbobfan/bioclip2-vitl14-image-onnx
- Modelo base: https://huggingface.co/imageomics/bioclip-2
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Documentación de HuggingFace sobre exportación a ONNX: https://huggingface.co/docs/transformers/serialization
- Cita indicada por el autor: Gu et al., 2025 (sin enlace directo en la model card)
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: todos los enlaces encontrados correspondían a entradas y eventos del recinto Daikin Park (Minute Maid Park) en Houston, sin relación con BioCLIP 2 ni con este repositorio.
