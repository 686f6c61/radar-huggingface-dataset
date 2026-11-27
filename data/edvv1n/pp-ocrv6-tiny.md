# edvv1n/pp-ocrv6-tiny

## Resumen

PP-OCRv6-tiny es un paquete de modelos de OCR (detección y reconocimiento de texto en imágenes) derivado de PaddleOCR y publicado por el usuario edvv1n en Hugging Face. El repositorio no contiene pesos en el formato habitual de Hugging Face (safetensors o GGUF), sino un conjunto de módulos VMFB (VM FlatBuffer) compilados con IREE para el runtime Lumi, con backends específicos para CPU, Metal, Vulkan y CUDA.

El paquete integra tres componentes: un detector de líneas de texto, un clasificador de orientación de línea basado en PP-LCNet y un reconocedor de texto. Cada componente se distribuye en múltiples variantes compiladas para formas de entrada fijas, lo que permite ejecutar la inferencia sin compilación en tiempo de ejecución en los backends soportados.

La relevancia de esta publicación es acotada: se trata de un artefacto de despliegue orientado al ecosistema Lumi/IREE, sin model card técnica detallada, sin licencia declarada en los metadatos y sin resultados de benchmarks publicados. Su interés principal radica en la portabilidad multiplataforma (CPU, GPU Apple vía Metal, Vulkan y CUDA) de un pipeline OCR completo, más que en mejoras de precisión respecto a PaddleOCR original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de tres etapas: detector de texto, clasificador de orientación de línea (PP-LCNet) y reconocedor de texto, según PaddleOCR; compilado con IREE a VMFB |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuyen módulos VMFB compilados; no se especifican precisiones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos; el repositorio incluye avisos de licencia en `v1/` |
| Formato de pesos | VMFB (IREE VM FlatBuffer); manifiesto, diccionario de caracteres y avisos de licencia en `v1/` |
| Tamaño del repositorio | 0,2 GB |
| Backends soportados | CPU, Metal, Vulkan, CUDA |
| Variantes por backend | 9 detectores para formas de entrada fijas, 1 clasificador de orientación, 4 reconocedores para anchos de línea de 320 a 3200 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de PP-OCRv6 en su variante "tiny", orientada a detección y reconocimiento de texto. El pipeline consta de un detector de líneas de texto, un clasificador de orientación de línea basado en PP-LCNet (para corregir líneas rotadas 180 grados) y un reconocedor de texto. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si se aplicaron técnicas de destilación o ajuste fino específicas.

La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: los modelos se compilan con IREE (Infrastructure for Retargetable Execution Environments) a VMFB, un formato de bytecode que se ejecuta sobre el runtime Lumi. Se ofrecen variantes para formas de entrada fijas (nueve detectores y cuatro reconocedores de anchos de línea entre 320 y 3200), lo que evita recompilaciones dinámicas y permite desplegar el mismo pipeline en CPU, Metal, Vulkan y CUDA. No se documentan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Detección de líneas de texto en imágenes mediante el detector incluido en el paquete.
- Clasificación de orientación de línea de texto (0 o 180 grados) con el clasificador PP-LCNet.
- Reconocimiento de texto a partir de recortes de línea, con cuatro variantes de ancho de entrada (320 a 3200) para adaptarse a líneas cortas o largas.
- Ejecución multiplataforma mediante IREE/Lumi en CPU, Metal (Apple), Vulkan y CUDA.
- Ejecución con formas de entrada fijas precompiladas, sin necesidad de compilar en el dispositivo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking"; es un pipeline OCR especializado.
- Cobertura de idiomas: no disponible.

## Casos de uso

- Digitalización de documentos escaneados: el pipeline completo (detección, orientación y reconocimiento) permite extraer texto de facturas, contratos y formularios en un flujo por lotes, ejecutándose en CPU si no hay GPU disponible.
- Procesamiento OCR en el borde (edge): los módulos VMFB para CPU y Vulkan permiten desplegar OCR en dispositivos sin CUDA, como mini-PC o sistemas embebidos con soporte Vulkan.
- Aplicaciones de escritorio en macOS: el backend Metal permite integrar OCR en apps nativas de Apple sin depender de servicios en la nube.
- Extracción de texto en pipelines de visión por computador: el detector y el reconocedor pueden encadenarse con otros modelos de visión (por ejemplo, detección de layout) para construir sistemas de comprensión documental.
- Indexación y búsqueda de archivos escaneados: el reconocimiento de líneas con anchos de hasta 3200 píxeles facilita procesar líneas largas de texto denso antes de indexar el contenido en un motor de búsqueda.
- Corrección de orientación en lotes de imágenes: el clasificador PP-LCNet permite normalizar líneas rotadas 180 grados antes del reconocimiento, útil en escaneos de libros o documentos con páginas invertidas.
- Prototipado de OCR en entornos IREE/Lumi: sirve como referencia para equipos que ya usan IREE y quieren añadir OCR sin introducir un runtime adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0,2 GB) incluye todos los backends y variantes, por lo que la huella en memoria de un pipeline concreto será menor, pero no se especifica.
- GPU recomendadas: no disponible. El paquete incluye backends para CUDA, Metal y Vulkan, además de CPU, pero no se indican modelos de GPU concretos.
- GPU de consumo: no disponible. Al tratarse de una variante "tiny" de OCR, es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: runtime Lumi con módulos VMFB compilados mediante IREE. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a un pipeline OCR de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| PP-OCRv6-tiny (este repo) | Pipeline OCR (detección + orientación + reconocimiento) | no disponible | no aplica | no disponible | VMFB (IREE) | Hugging Face, repo de 0,2 GB |
| PaddleOCR (PP-OCRv6 original) | Pipeline OCR | no disponible | no aplica | Apache 2.0 (según el proyecto PaddleOCR) | Paddle inference, ONNX | GitHub y documentación oficial de PaddleOCR |
| Tesseract OCR | Motor OCR clásico | no disponible | no aplica | Apache 2.0 | Modelos propios (traineddata) | Repositorios del proyecto Tesseract |
| EasyOCR | Pipeline OCR basado en deep learning | no disponible | no aplica | Apache 2.0 | PyTorch | PyPI y GitHub |

La comparación se limita a categoría y disponibilidad: no hay datos de precisión ni de rendimiento para este paquete que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- No se declara licencia en los metadatos de Hugging Face; el repositorio incluye avisos de licencia en `v1/`, pero deben revisarse antes de cualquier uso comercial.
- No hay model card técnica: se desconoce el número de parámetros, la composición del dataset de entrenamiento y los idiomas cubiertos.
- Al derivar de PaddleOCR, hereda los sesgos y limitaciones del modelo original, que no se documentan en este repositorio.
- Riesgo de errores de reconocimiento en textos manuscritos, fuentes poco habituales, imágenes de baja resolución o líneas con ruido; no se cuantifica.
- Las formas de entrada son fijas por módulo (nueve detectores y cuatro anchos de línea), lo que limita la flexibilidad frente a entradas de tamaño arbitrario sin seleccionar la variante adecuada.
- Dependencia del runtime Lumi/IREE: no es directamente usable con frameworks estándar como PyTorch, ONNX Runtime o Paddle Inference sin conversión adicional.
- Sin descargas ni "likes" en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No apto para tareas de generación de texto, razonamiento o agentes; es exclusivamente un pipeline OCR.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/edvv1n/pp-ocrv6-tiny
- PaddleOCR (proyecto original): https://github.com/PaddlePaddle/PaddleOCR
- IREE (runtime de compilación): no se proporciona enlace en la información disponible
- Lumi (runtime de ejecución): no se proporciona enlace en la información disponible
