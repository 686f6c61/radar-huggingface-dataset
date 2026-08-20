# ayqzs/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal (visión-lenguaje) de 27 000 millones de parámetros, desarrollado por el equipo Qwen de Alibaba. Es la última generación de la familia Qwen3.x y está diseñado para sobresalir en tareas de programación, trabajo profesional, investigación y ejecución de agentes de larga duración. Incorpora un codificador de visión nativo que le permite comprender imágenes y vídeos, junto con un control flexible del modo de pensamiento (thinking mode), activable o desactivable por petición. Su contexto nativo es de 262 144 tokens, extensible hasta 1 000 000.

El repositorio `ayqzs/Qwen3.8-27B-GGUF` contiene cuantizaciones GGUF del modelo base, generadas con la técnica Dynamic V3.0 de Unsloth, que según sus creadores ofrece mayor precisión a igual tamaño que otras cuantizaciones. Al estar en formato GGUF, el modelo puede ejecutarse localmente con herramientas como llama.cpp, Ollama o Unsloth Desktop, lo que lo hace accesible para desarrolladores que necesitan un modelo potente sin depender de la nube. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) + FFN |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | GGUF (Q2, Q3, Q4, Q5, Q6, Q8; el repositorio incluye múltiples, tamaño total 1053.6 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), intercaladas con bloques feed-forward. En total tiene 64 capas, una dimensión oculta de 5120 y una tabla de embeddings de 248 320 tokens (con padding). El modelo incorpora Multi-Token Prediction (MTP), entrenado con múltiples pasos, lo que mejora la eficiencia de generación. El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento, aunque no se especifican el número de tokens ni la composición del dataset. El codificador de visión es nativo, lo que permite procesar imágenes y vídeos de hasta horas de duración sin necesidad de módulos externos.

## Capacidades

- Generación de texto, razonamiento complejo, programación y matemáticas.
- Comprensión de imágenes y vídeos: análisis de diagramas STEM, documentos, capturas y vídeos de larga duración.
- Tool calling / function calling: soporte para integración con herramientas externas y agentes, con mejoras en el parseo de objetos anidados.
- Ejecución de agentes de larga duración: planificación autónoma y manejo de feedback del entorno.
- Control de pensamiento: modo thinking activado por defecto, desactivable por petición; ajuste de profundidad de razonamiento mediante `reasoning_effort` y preservación del contexto de razonamiento con `preserve_thinking`.
- Capacidades multilingües: no confirmadas en la documentación disponible, aunque la familia Qwen suele soportar múltiples idiomas.

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y refactorizar código en múltiples lenguajes, con una ventana de contexto de 262k tokens que permite analizar repositorios completos o archivos extensos sin truncar.
- Automatización de oficina: procesamiento de documentos escaneados, extracción de datos de imágenes y PDFs, generación de informes y resúmenes a partir de material visual o textual.
- Agente autónomo para tareas multi-paso: gracias a su soporte de tool calling y su capacidad de planificación, puede integrarse en frameworks como Codex o entornos de automatización para ejecutar flujos complejos (por ejemplo, gestión de incidencias, orquestación de APIs).
- Análisis de vídeo: comprensión de vídeos de larga duración (hasta horas) para resúmenes, detección de eventos o búsqueda de momentos concretos, útil en vigilancia, revisión de contenido o investigación.
- Atención al cliente: chatbots con contexto largo que pueden manejar conversaciones multi-turno y adjuntar capturas de pantalla o documentos para resolver incidencias técnicas.
- Investigación y análisis de datos: asistencia en lectura de artículos científicos, razonamiento matemático, generación de hipótesis y análisis de resultados, con capacidad de procesar figuras y tablas.
- Despliegue on-premise: al ser un modelo de 27B con licencia Apache 2.0, es adecuado para empresas que requieren procesamiento local de datos sensibles sin enviar información a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de Unsloth menciona mejoras de precisión de su cuantización Dynamic V3.0 frente a otras, pero no se aportan cifras concretas. Tampoco se incluyen resultados de MMLU, HumanEval, GSM8K u otras pruebas estándar en la model card del repositorio.

## Requisitos de hardware

- VRAM estimada: para un modelo denso de 27B, la cuantización Q4_K_M ocupa aproximadamente 16-18 GB, Q5 alrededor de 20 GB y Q8 entre 28-30 GB. Estas cifras son orientativas y dependen de la implementación y del tamaño del contexto.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4/Q5; A100 (40/80 GB) o A6000 (48 GB) para cuantizaciones más altas o contextos largos.
- Es posible ejecutarlo en una sola GPU de 24 GB con cuantización Q4, como indica el artículo de yottalabs.ai.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI, Unsloth Desktop (compatible con Mac, Windows y Linux).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B | 262k (ext. 1M) | Híbrida DeltaNet + Attention, multimodal | Apache 2.0 | GGUF / safetensors |
| Qwen2.5-32B | 32B | 128k | Transformer denso | Apache 2.0 | safetensors / GGUF |
| Llama 3.1 8B | 8B | 128k | Transformer denso | Llama 3.1 Community License | safetensors / GGUF |

No se dispone de datos de rendimiento comparativo en la información proporcionada. Qwen3.8-27B se diferencia por su arquitectura híbrida y su capacidad multimodal nativa, mientras que Qwen2.5-32B es un modelo anterior sin visión integrada y Llama 3.1 8B es significativamente más pequeño.

## Limitaciones y advertencias

- Sesgos: no se especifican, pero al ser un modelo entrenado por Alibaba, puede presentar sesgos culturales o lingüísticos propios de los datos de entrenamiento.
- Alucinación: riesgo inherente a los modelos generativos; se recomienda verificar respuestas en contextos críticos.
- Contexto largo: aunque soporta 262k tokens, el rendimiento puede degradarse en los extremos de la ventana; se recomienda ajustar `presence_penalty` para evitar repeticiones.
- Idiomas: no se ha confirmado la lista de idiomas soportados; la documentación no la detalla.
- Cuantización: el repositorio GGUF es de un tercero (ayqzs) y no es oficial de Qwen; la calidad puede variar entre cuantizaciones y no se garantiza la paridad exacta con el modelo original.
- Licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución y las condiciones de la licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ayqzs/Qwen3.8-27B-GGUF
- Modelo base (HuggingFace): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo de yottalabs.ai sobre ejecución local: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Comparativa de cuantizaciones GGUF (kingy.ai): https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Instalador de un clic (GitHub): https://github.com/qwen3-8-27b/qwen3-8-27b
