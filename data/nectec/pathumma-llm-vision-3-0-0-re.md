# nectec/Pathumma-llm-vision-3.0.0-re

## Resumen

Pathumma Vision 3.0.0-Re es un modelo de visión y lenguaje (VLM) desarrollado por NECTEC, el centro tecnológico nacional de Tailandia, especializado en reconocimiento óptico de caracteres (OCR) para el idioma tailandés. Está construido sobre la arquitectura Qwen3-VL-2B-Instruct y ha sido afinado con un conjunto de datos de 377 000 muestras de OCR, con el objetivo de mejorar la precisión en textos tailandeses tanto en documentos como en imágenes de escenas reales. El modelo incorpora entrenamiento con cuantización consciente (QAT) para facilitar su despliegue eficiente en entornos de producción.

Con aproximadamente 2,4 mil millones de parámetros, este modelo se posiciona como una opción ligera y especializada para tareas de extracción de texto y comprensión de documentos en tailandés. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para empresas e instituciones que necesitan procesar documentación en tailandés. La relevancia actual radica en la escasez de modelos OCR de código abierto optimizados para idiomas con escritura compleja como el tailandés, y en la tendencia hacia modelos pequeños y eficientes que puedan ejecutarse en hardware moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision-language transformer) |
| Parametros totales | 2.438.696.960 (2,4 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado con QAT, pero no se publican los formatos de cuantizacion resultantes) |
| Idiomas soportados | tailandes (optimizado), otros no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL-2B-Instruct, un VLM de la familia Qwen3 que combina un codificador de visión con un modelo de lenguaje transformer. La arquitectura original de Qwen3-VL incluye mecanismos de atención multimodal que permiten procesar imágenes y texto de forma conjunta. Sobre esta base, NECTEC ha realizado un afinamiento (fine-tuning) con 377 000 muestras de OCR, centradas en texto tailandés y en imágenes desafiantes de documentos y escenas reales.

El entrenamiento emplea Quantization-Aware Training (QAT), una técnica que simula la cuantización durante el proceso de entrenamiento para que el modelo final sea más robusto a la pérdida de precisión cuando se despliega en formatos de baja precisión. La configuración de entrenamiento incluye una tasa de aprendizaje de 9e-6, dos épocas, acumulación de gradientes de 4 y hardware compuesto por 8 GPU NVIDIA A100. No se especifica si se utilizaron técnicas de RLHF o DPO; la información disponible solo menciona el afinamiento supervisado sobre el dataset de OCR.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) para texto tailandés en imágenes de documentos y escenas.
- Extracción de texto de documentos escaneados o fotografiados, incluyendo documentos con maquetación compleja.
- Comprensión de imágenes con contenido textual, generando respuestas en formato conversacional.
- Capacidades heredadas de Qwen3-VL-2B-Instruct, como el diálogo multimodal imagen-texto y la generación de descripciones.
- Soporte para entrada de imágenes y texto a través de la interfaz estándar de transformers (pipeline image-text-to-text).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso específicas en la información proporcionada.

## Casos de uso

- Digitalización de documentos administrativos tailandeses: el modelo puede extraer texto de formularios, facturas y contratos escaneados, facilitando su indexación y búsqueda en sistemas de gestión documental.
- Reconocimiento de texto en señalización y carteles: útil para aplicaciones de traducción automática o asistencia a turistas, ya que puede leer texto tailandés en fotografías de calles, tiendas o transporte público.
- Automatización de procesos de negocio: integración en flujos de trabajo que requieren extraer datos de documentos tailandeses, como solicitudes, certificados o registros, reduciendo la intervención manual.
- Accesibilidad para personas con discapacidad visual: combinado con un sistema de captura de imagen, el modelo puede leer en voz alta el contenido de documentos o carteles en tailandés.
- Archivado y preservación de documentos históricos: permite transcribir manuscritos o documentos antiguos en tailandés a formato digital, facilitando su conservación y consulta.
- Asistente de atención al cliente: el modelo puede procesar imágenes enviadas por usuarios (por ejemplo, capturas de pantalla o fotos de recibos) y extraer la información relevante para resolver consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de OCR (por ejemplo, precisión de caracteres o F1 en datasets de referencia). Tampoco se proporcionan comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 4,9 GB (según el tamaño del repositorio), por lo que se necesitan al menos 6-8 GB de VRAM considerando overhead de activaciones y buffers. Con cuantización a 4 bits, el uso de VRAM podría reducirse a alrededor de 1,5-2 GB, aunque no se especifican los formatos de cuantización disponibles.
- GPU recomendadas: el modelo es adecuado para GPUs consumer como NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10, A100 o L4. Dado su tamaño de 2,4 B parámetros, también puede ejecutarse en GPUs con 8 GB de VRAM si se aplica cuantización.
- Opciones de despliegue: el modelo es compatible con la librería transformers de Hugging Face, tal como se muestra en el quickstart. También puede desplegarse con servidores de inferencia como vLLM o TGI, aunque no se confirma explícitamente su compatibilidad. Para entornos sin GPU, se podría usar llama.cpp si se convierte a formato GGUF, pero no se proporciona esa conversión.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 2,4 B parámetros en una GPU moderna puede generar decenas de tokens por segundo, pero esto depende del hardware y de la optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Pathumma Vision 3.0.0-Re | 2,4 B | no disponible | OCR tailandes | Apache 2.0 |
| Qwen3-VL-2B-Instruct (base) | 2,4 B | no disponible | VLM general | Apache 2.0 |
| Pathumma Vision 2.0.0-preview | no disponible | no disponible | OCR tailandes | no disponible |
| Pathumma Vision 1.0.0 | no disponible | no disponible | OCR tailandes | no disponible |

No se dispone de datos de rendimiento comparativos. El modelo base Qwen3-VL-2B-Instruct es la referencia más directa, ya que Pathumma Vision 3.0.0-Re es un afinamiento de este. Las versiones anteriores de Pathumma Vision (1.0.0 y 2.0.0-preview) también están orientadas a OCR tailandés, pero no se publican sus especificaciones técnicas en la información disponible.

## Limitaciones y advertencias

- El modelo está optimizado principalmente para OCR en tailandés; su rendimiento en otros idiomas, incluido el inglés, no está documentado y podría ser inferior.
- No se han publicado evaluaciones de sesgos, alucinaciones ni errores en la generación de texto. Como todo modelo de lenguaje, puede producir texto incorrecto o inventado, especialmente en contextos ambiguos.
- La longitud de contexto no se especifica, por lo que no se conoce el límite de tokens de entrada que puede manejar en tareas de documento largo.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye tal cual, sin garantías de precisión ni soporte técnico por parte de NECTEC.
- El entrenamiento se realizó con un dataset específico de OCR; el modelo puede no generalizar bien a dominios muy diferentes, como imágenes médicas o contenido generado por ordenador con estilos tipográficos inusuales.
- No se proporcionan formatos de cuantización preconvertidos (por ejemplo, GGUF o AWQ), lo que puede limitar su despliegue en entornos con restricciones de memoria si no se realiza la conversión manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nectec/Pathumma-llm-vision-3.0.0-re
- Paper de Qwen3 (referencia del modelo base): https://arxiv.org/abs/2505.09388
- Página de NECTEC sobre Pathumma LLM: https://www.nectec.or.th/innovation/innovation-service/pathumma-llm.html
- Repositorio AIforThai (librería de acceso multimodal): https://github.com/AIforThai/aiforthai/blob/main/aift/multimodal/README.md
- Versión anterior Pathumma Vision 2.0.0-preview: https://huggingface.co/nectec/Pathumma-llm-vision-2.0.0-preview
- Versión anterior Pathumma Vision 1.0.0: https://huggingface.co/nectec/Pathumma-llm-vision-1.0.0
