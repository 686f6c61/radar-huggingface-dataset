# Hskyto/lfm2.5-2.6b-toolcall-mlx

## Resumen

El modelo `Hskyto/lfm2.5-2.6b-toolcall-mlx` es una conversión al formato MLX (Apple Silicon) del modelo LFM2.5-2.6B desarrollado por Liquid AI. Se trata de un modelo denso de 2.600 millones de parámetros (2.697.198.592 exactos) diseñado específicamente para cargas de trabajo agénticas, con una ventana de contexto de 128.000 tokens y soporte nativo para tool calling. La versión MLX permite ejecutar el modelo de forma eficiente en hardware de Apple, incluyendo CPU y GPU unificada, lo que facilita el despliegue local de agentes autónomos en dispositivos como MacBooks o incluso teléfonos.

La relevancia de este modelo radica en su capacidad para planificar, llamar herramientas y ejecutar tareas multi-paso con una latencia muy baja. Según el blog oficial de Liquid AI, alcanza velocidades de decodificación de 220 tokens/s en un chip M5 Max y 113 tokens/s en un Ryzen AI Max+ 395, lo que lo convierte en una opción atractiva para aplicaciones de edge computing y agentes on-device. El repositorio de Hskyto ofrece los pesos en formato safetensors listos para usar con la librería MLX, aunque la model card original no incluye documentación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (dense) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio parece contener pesos en fp16, pero no se confirma) |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LFM2.5-2.6B utiliza la arquitectura LFM2 de Liquid AI, un diseño denso optimizado para eficiencia computacional y baja latencia en inferencia. A diferencia de los modelos MoE, al ser denso activa todos sus parámetros en cada paso, lo que simplifica el despliegue y reduce los requisitos de memoria. El modelo fue entrenado específicamente para tareas agénticas, priorizando la capacidad de planificación, razonamiento multi-paso y llamada a herramientas. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información proporcionada. La versión MLX de Hskyto es una conversión de los pesos originales, sin modificaciones en la arquitectura.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés.
- Tool calling nativo: el modelo puede invocar funciones externas de forma estructurada, lo que lo hace apto para integrarse con APIs y herramientas.
- Planificación y ejecución de tareas multi-paso: diseñado para agentes que deben encadenar varias acciones.
- Ventana de contexto larga (128K tokens), adecuada para mantener conversaciones extensas o procesar documentos largos.
- Inferencia eficiente en CPU y GPU, con soporte para dispositivos de bajo consumo (teléfonos, portátiles).
- Capacidad de ejecución en formato MLX, optimizado para Apple Silicon.

## Casos de uso

- Agentes de automatización local en macOS: el modelo puede controlar herramientas del sistema (correo, calendario, archivos, música) mediante tool calling, como demuestra el proyecto Macaw que logra 10/10 precisión en llamadas a herramientas en un M2.
- Asistentes personales on-device: al ejecutarse localmente, permite gestionar tareas sin conexión a internet, con tiempos de respuesta medios de 1,21 segundos.
- Chatbots con contexto largo: su ventana de 128K tokens permite mantener conversaciones prolongadas o analizar documentos extensos sin perder el hilo.
- Generación de código asistida: puede integrarse en entornos de desarrollo para sugerir fragmentos de código y ejecutar comandos mediante tool calling.
- RAG (generación aumentada por recuperación): su contexto amplio facilita la inclusión de múltiples fragmentos recuperados de una base de conocimiento.
- Automatización de flujos de trabajo en entornos con recursos limitados: al caber en menos de 2,5 GB (en cuantización 4-bit), es viable en dispositivos edge como Raspberry Pi o teléfonos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, el blog oficial de Liquid AI reporta las siguientes velocidades de decodificación:

| Entorno | Velocidad de decodificación |
|---|---|
| Apple M5 Max | 220 tokens/s |
| AMD Ryzen AI Max+ 395 | 113 tokens/s |
| Teléfono móvil | 30 tokens/s |

Estos datos indican un rendimiento excepcional en términos de latencia, pero no permiten comparar la calidad del modelo frente a alternativas en tareas de razonamiento o generación de código.

## Requisitos de hardware

- VRAM estimada: en fp16, el modelo ocupa aproximadamente 5,2 GB, por lo que requiere al menos 6-8 GB de VRAM en GPU discretas. En cuantización 4-bit (como la versión Macaw), el peso se reduce a 1,5 GB, permitiendo ejecución en dispositivos con 2 GB de RAM.
- GPU recomendadas: cualquier GPU con soporte para MLX (Apple Silicon) o GPUs NVIDIA/AMD con suficiente VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A100). También puede ejecutarse en CPU pura, como demuestran los resultados en M5 Max y Ryzen AI.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media con 8 GB o más de VRAM, y en cuantización 4-bit incluso en 4 GB.
- Opciones de despliegue: MLX (para Apple), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI. La versión de Hskyto está pensada para MLX, pero los pesos originales pueden convertirse a otros formatos.
- Latencia y throughput: según el blog, 220 tokens/s en M5 Max y 30 tokens/s en teléfono, lo que permite interacción en tiempo real en la mayoría de dispositivos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de tamaño similar (por ejemplo, Llama 3.2 3B, Qwen2.5 3B, Phi-3.5-mini) en la información proporcionada. A continuación se presenta una comparación cualitativa basada en características conocidas:

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-2.6B (este) | 2,6B | 128K | Sí | No disponible | MLX, safetensors |
| Llama 3.2 3B | 3,2B | 128K | Sí | Llama 3.2 Community License | GGUF, safetensors |
| Qwen2.5 3B | 3,1B | 32K | Sí | Apache 2.0 | GGUF, safetensors |
| Phi-3.5-mini | 3,8B | 128K | No | MIT | GGUF, safetensors |

LFM2.5-2.6B destaca por su eficiencia en velocidad de decodificación y su enfoque específico en agentes, pero la falta de licencia clara puede ser un obstáculo para uso comercial.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La licencia no está especificada en el repositorio de Hskyto, lo que genera incertidumbre sobre su uso comercial. Se recomienda consultar la licencia del modelo original de Liquid AI antes de desplegarlo en producción.
- Al ser un modelo de 2,6B, puede presentar alucinaciones y errores de razonamiento en tareas complejas, especialmente en dominios especializados.
- La versión MLX de Hskyto no incluye documentación ni ejemplos de uso; el usuario debe recurrir a la documentación de Liquid AI para entender el formato de tool calling.
- No se han publicado evaluaciones de sesgos o robustez, por lo que se desconoce su comportamiento en escenarios sensibles.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; se recomienda verificar la integridad de los pesos antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hskyto/lfm2.5-2.6b-toolcall-mlx
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Blog oficial de Liquid AI: https://www.liquid.ai/blog/lfm2-5-2-6b
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Noticia sobre Macaw (versión 4-bit): https://www.aimodeling.com/en/news/slug/macaw-lfm25-15gb-edge-mac-agent
