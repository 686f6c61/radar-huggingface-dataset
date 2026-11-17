# goodmai/PaddleOCR-VL-1.5-8bit

## Resumen

PaddleOCR-VL-1.5-8bit es una conversión a formato MLX de 8 bits del modelo PaddleOCR-VL-1.5, un modelo vision-language especializado en reconocimiento óptico de caracteres (OCR) y análisis de documentos. El repositorio lo publica el usuario goodmai y deriva del modelo base baidu/ERNIE-4.5-0.3B-Paddle, sobre el que se construye la arquitectura multimodal. Con 905.601.648 parámetros totales (aproximadamente 0,9 mil millones) y un tamaño de repositorio de 1,1 GB, está pensado para ejecutarse en hardware Apple Silicon mediante el framework MLX.

El modelo resuelve tareas de extracción de información a partir de imágenes de documentos: reconocimiento de texto, análisis de maquetación (layout), tablas, fórmulas, gráficos y sellos, además de detección de texto (spotting). Su naturaleza compacta y su cuantización a 8 bits lo hacen adecuado para despliegues locales en equipos de sobremesa y portátiles con chip de Apple, sin necesidad de GPU dedicada.

Es relevante ahora porque combina un backbone derivado de ERNIE-4.5 con capacidades de OCR de última generación en un paquete ligero y con licencia Apache 2.0, lo que facilita su integración en flujos de digitalización de documentos y pipelines de extracción de datos en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language basada en ERNIE-4.5-0.3B-Paddle con torre visual (PaddleOCR-VL); conversión MLX |
| Parametros totales | 905.601.648 (~0,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (formato MLX) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión a MLX (versión 0.3.10 de mlx-vlm) del modelo PaddleOCR-VL-1.5, que a su vez se apoya en el backbone de lenguaje baidu/ERNIE-4.5-0.3B-Paddle. Se trata, por tanto, de un modelo image-to-text multimodal en el que una torre visual procesa la imagen del documento y un decodificador de lenguaje genera la salida estructurada (texto, tablas, fórmulas, etc.). La conversión a MLX está optimizada para Apple Silicon y emplea cuantización de 8 bits para reducir el uso de memoria.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card únicamente referencia la model card original de PaddlePaddle/PaddleOCR-VL-1.5 para más detalles, por lo que esos datos deben consultarse en el repositorio upstream.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Análisis de maquetación (layout) de documentos.
- Extracción y reconstrucción de tablas.
- Reconocimiento de fórmulas matemáticas.
- Interpretación de gráficos (chart).
- Detección de sellos (seal).
- Detección/localización de texto (spotting).
- Generación de texto descriptivo a partir de imágenes (image-to-text).
- Soporte multilingüe (inglés, chino y otros idiomas).
- Conversación multimodal (image-text-to-text conversacional).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y recibos: el modelo extrae texto, tablas e importes de imágenes de documentos financieros, lo que permite alimentar sistemas de contabilidad automatizada sin intervención manual.
- Procesamiento de documentos escaneados en archivos históricos: su capacidad de OCR y layout facilita la conversión de PDFs e imágenes escaneadas en texto estructurado y buscable.
- Extracción de tablas de informes técnicos: reconoce la estructura tabular y la reconstruye, lo que resulta útil para pipelines de análisis de datos que parten de documentos en papel o PDF.
- Reconocimiento de fórmulas en artículos científicos: permite convertir ecuaciones presentes en imágenes a formato textual o LaTeX para su reutilización en editores y bases de conocimiento.
- Detección de sellos y firmas en documentos oficiales: la capacidad de spotting y seal ayuda en la verificación y clasificación de documentos administrativos.
- Asistente de accesibilidad en macOS: al ejecutarse vía MLX y Basalt en Apple Silicon, puede integrarse en aplicaciones de escritorio que describan imágenes o lean documentos en voz alta.
- Preprocesado en pipelines de RAG sobre documentos: convierte páginas escaneadas en texto limpio y estructurado antes de la indexación semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con ~0,9 B de parámetros en 8 bits, el peso de los pesos ronda 1 GB; el uso total en inferencia (incluyendo activaciones y torre visual) se estima en el rango de 2 a 4 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: el modelo está empaquetado para MLX, por lo que el hardware objetivo son chips de Apple Silicon (series M1, M2, M3, M4). No se indica soporte oficial para CUDA.
- ¿Cabe en GPU de consumo? Sí, por tamaño; en el ecosistema Apple cabe en equipos con 8 GB o más de memoria unificada.
- Opciones de despliegue: MLX (mlx-vlm), Basalt v0.11.0 (macOS 27+, Swift 6.4, Apple Silicon, sin Python). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.5-8bit (este) | ~0,9 B | no disponible | Apache 2.0 | safetensors (MLX) | Cuantizado 8-bit, orientado a Apple Silicon |
| PaddleOCR-VL-1.5 (upstream) | no disponible | no disponible | no disponible | no disponible | Modelo original de PaddlePaddle |
| ERNIE-4.5-0.3B-Paddle (base) | ~0,3 B | no disponible | no disponible | no disponible | Backbone de lenguaje, sin capacidades visuales |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Al ser una conversión a MLX, el modelo está pensado para Apple Silicon; su uso en otras plataformas requiere reconversión.
- La cuantización a 8 bits puede introducir una ligera pérdida de precisión respecto al modelo original en tareas de OCR complejas (fórmulas densas, tablas muy estructuradas).
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación medidas.
- El soporte de idiomas documentado se limita a inglés, chino y multilingüe genérico; el rendimiento en otros idiomas no está cuantificado.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo upstream PaddleOCR-VL-1.5 y del backbone ERNIE-4.5.
- El repositorio tiene muy pocas descargas (10) y ninguna interacción (0 likes), lo que sugiere poca validación por parte de la comunidad.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, por lo que no debería asumirse su disponibilidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/PaddleOCR-VL-1.5-8bit
- Modelo upstream MLX: https://huggingface.co/mlx-community/PaddleOCR-VL-1.5-8bit
- Modelo original: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.5
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-0.3B-Paddle
- Basalt v0.11.0: https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Demo Basalt: https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FPaddleOCR-VL-1.5-8bit&role=ocr
