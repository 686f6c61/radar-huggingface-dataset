# inclusionAI/ArmorOCR

## Resumen

ArmorOCR es un framework de dos etapas para percepción visual adversaria grounded, desarrollado por inclusionAI en colaboración con Ant Research. Construido sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, este modelo multimodal de 8,7 mil millones de parámetros está especializado en reconocimiento óptico de caracteres (OCR) robusto frente a imágenes adversas, es decir, imágenes con distorsiones, ruido o ataques deliberados que degradan la legibilidad del texto. Su principal innovación es que permite una inferencia de una sola pasada sobre la imagen original, sin necesidad de transformaciones visuales en tiempo de inferencia ni de herramientas auxiliares, lo que lo hace adecuado para sistemas de producción con latencia crítica.

El modelo se distribuye bajo licencia Apache 2.0, con soporte para los idiomas inglés y chino, y está disponible en Hugging Face con pesos en formato safetensors. Su arquitectura hereda las capacidades del modelo base Qwen3-VL-8B-Instruct, incluyendo razonamiento multimodal, generación de texto y soporte conversacional. La relevancia de ArmorOCR reside en su enfoque de entrenamiento basado en autodestilación con transferencia de observación y refinamiento mediante recompensa, que le permite mantener una percepción robusta ante ataques adversos sin sacrificar la eficiencia en inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B-Instruct (visión-lenguaje, transformer multimodal) |
| Parámetros totales | 8.767.123.696 (~8,7 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ArmorOCR es un framework de dos etapas basado en el modelo Qwen3-VL-8B-Instruct, que a su vez emplea una arquitectura transformer multimodal con codificador visual y decodificador de lenguaje. La innovación principal radica en su estrategia de entrenamiento, denominada *observation-transferred self-distillation* (autodistilación por transferencia de observación), combinada con refinamiento mediante recompensas. Este enfoque permite que el modelo aprenda a localizar y transcribir texto en imágenes adversas (con transformaciones geométricas, ruido, oclusiones) sin necesidad de aplicar transformaciones en inferencia, manteniendo así una única pasada sobre la imagen original.

Los detalles sobre el conjunto de datos de entrenamiento (número de tokens, composición del dataset) y el uso de técnicas como RLHF o DPO no se especifican en la documentación disponible. El modelo se ha publicado con soporte para la librería Transformers de Hugging Face, y su integración requiere la versión 4.57.1 o superior. La innovación técnica destacable es la eliminación de cualquier herramienta o transformación externa en tiempo de inferencia, lo que reduce la complejidad del despliegue y la latencia.

## Capacidades

- Reconocimiento de texto en imágenes adversas: detecta y transcribe texto en imágenes con ruido, distorsión, rotación o degradación visual.
- Localización grounded: además de transcribir, el modelo puede indicar la posición del texto detectado en la imagen (grounding).
- Generación de razonamiento estructurado: en el prompt de ejemplo, el modelo genera una reflexión interna entre etiquetas `<analyze>` y la respuesta final entre `<answer>`, lo que permite controlar la salida para tareas de verificación.
- Soporte conversacional multimodal: al basarse en Qwen3-VL-8B-Instruct, hereda la capacidad de mantener diálogos de múltiples turnos con entrada de imagen y texto.
- Capacidades multilingües: entrenado principalmente en inglés y chino, aunque puede heredar del modelo base un conocimiento multilingüe más amplio.
- Integración con Transformers: se puede cargar con `Qwen3VLForConditionalGeneration` y `AutoProcessor` de Hugging Face, facilitando su uso en pipelines existentes.

## Casos de uso

- **Verificación de documentos con imágenes de baja calidad**: en entornos de digitalización masiva (facturas, contratos, formularios), ArmorOCR puede transcribir texto de escaneos con ruido o manchas, reduciendo errores en la extracción de datos.
- **OCR en sistemas de captcha o texto distorsionado**: el modelo puede ser utilizado en pruebas automatizadas para validar sistemas de seguridad que emplean texto adverso, o en soluciones de accesibilidad que necesitan interpretar tales imágenes.
- **Automatización de atención al cliente con tickets de soporte**: al heredar la capacidad conversacional de Qwen3-VL, se puede integrar en bots que procesan capturas de pantalla o fotos de errores, extrayendo el texto relevante para resolver incidencias.
- **Análisis de contenido en redes sociales**: detecta y transcribe texto embebido en memes, infografías o imágenes compartidas, útil para moderación de contenido o análisis de tendencias.
- **Sistemas de documentación asistida**: para la digitalización de archivos históricos o libros escaneados con imperfecciones, el modelo puede localizar y transcribir texto en páginas dañadas.
- **Validación de calidad en pipelines de OCR**: como modelo adversarial, puede servir para evaluar la robustez de otros sistemas OCR, inyectando imágenes adversas y comparando las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de rendimiento en tareas como MMLU, HumanEval o GSM8K, ni métricas específicas de OCR (por ejemplo, precisión de localización o tasa de error de caracteres). Para obtener datos comparativos, se recomienda consultar el repositorio de GitHub oficial o el paper de arXiv.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 8,7 mil millones de parámetros y pesos en FP16, se requiere aproximadamente 17,5 GB de VRAM para cargar el modelo completo. Con cuantización de 4 bits (no especificada por el autor, pero posible con herramientas como bitsandbytes), el uso de VRAM se reduce a unos 5-6 GB.
- **GPU recomendadas**: para inferencia en producción con FP16, se recomiendan GPUs con 24 GB o más, como la NVIDIA RTX 4090, A100 o H100. Para cuantización de 4 bits, una RTX 3090 (24 GB) o RTX 4070 (12 GB) pueden ser suficientes.
- **Compatibilidad con GPU de consumo**: sí, con cuantización de 4 bits o 8 bits, el modelo puede ejecutarse en GPUs de consumo como la RTX 4090 o RTX 3080 Ti.
- **Opciones de despliegue**: 
  - Hugging Face Transformers con `device_map="auto"` para distribución automática en múltiples GPUs.
  - vLLM o TGI pueden ser compatibles si se convierte el modelo a los formatos requeridos (aunque no está confirmado en la documentación).
  - Para llama.cpp u Ollama, se requeriría la conversión de pesos a formato GGUF, no disponible actualmente.
- **Latencia y throughput estimados**: no disponibles. Como referencia, un modelo de 8,7 B con FP16 en una A100 puede procesar decenas de tokens por segundo, pero depende del número de imágenes y del tamaño de las mismas.

## Comparativa con modelos similares

La siguiente tabla compara ArmorOCR con su modelo base y con un modelo OCR tradicional de propósito general, aunque los datos de estos últimos no están detallados en la documentación disponible.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArmorOCR (inclusionAI) | 8,7B | no disponible | en, zh | Apache 2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | 8,7B | no disponible | multilingüe | Apache 2.0 (con restricciones de uso) | Hugging Face |
| PaddleOCR v3 (OCR clásico) | - | - | multilingüe | Apache 2.0 | GitHub, pip |

La principal diferencia con su modelo base es que ArmorOCR está específicamente entrenado para la robustez frente a imágenes adversas, mientras que el base es un modelo de visión-lenguaje general. En comparación con soluciones OCR tradicionales como PaddleOCR, ArmorOCR ofrece capacidades de razonamiento y localización más avanzadas, pero requiere mayor recursos de computación.

## Limitaciones y advertencias

- **Sesgos conocidos**: al estar entrenado sobre el modelo base Qwen3-VL-8B-Instruct, puede heredar sesgos en el reconocimiento de texto en contextos culturales o idiomas no representados en su entrenamiento.
- **Riesgo de alucinación**: en imágenes ambiguas o con texto muy degradado, el modelo puede generar texto plausible pero incorrecto, especialmente si se usa en modo conversacional sin verificación.
- **Limitaciones de contexto**: la longitud de contexto no se ha especificado en la documentación, lo que puede ser un problema para documentos de múltiples páginas o imágenes con mucho texto.
- **Restricciones de licencia**: aunque el modelo se distribuye bajo Apache 2.0, el uso está sujeto a la política de uso aceptable del modelo base Qwen3-VL-8B-Instruct, que puede tener restricciones para ciertos casos de uso comercial.
- **Caveat para producción**: la inferencia de una sola pasada no garantiza la robustez en todas las condiciones adversas; se recomienda validar el modelo con el dataset AdvSpot (mencionado en el GitHub) antes de desplegarlo en entornos críticos.
- **Soporte limitado de idiomas**: la documentación indica soporte oficial solo en inglés y chino, lo que puede afectar a la precisión en otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/ArmorOCR
- Repositorio de GitHub (inferencia): https://github.com/ant-research/ArmorOCR
- Repositorio de GitHub (espejo): https://github.com/Ikracs/ArmorOCR
- Paper en arXiv: https://arxiv.org/abs/2608.20122
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
