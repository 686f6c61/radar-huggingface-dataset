# jesusoctavioas/Qwen3.8-27B-mlx-3Bit

## Resumen

El modelo `jesusoctavioas/Qwen3.8-27B-mlx-3Bit` es una conversión a formato MLX (Apple Silicon) del modelo Qwen3.8-27B, un modelo de visión-lenguaje (VLM) denso de 27.000 millones de parámetros desarrollado por Alibaba Cloud. Esta versión concreta ha sido cuantizada a 3 bits, reduciendo el tamaño del repositorio a 11,8 GB, lo que permite ejecutarlo en equipos con memoria unificada moderada. El modelo base destaca por su ventana de contexto nativa de 262.000 tokens, razonamiento configurable y capacidades para tareas agénticas de largo horizonte, así como por su licencia Apache 2.0 que permite uso comercial.

La conversión ha sido realizada por el usuario `jesusoctavioas` utilizando `mlx-lm` versión 0.31.2, y el resultado se ofrece bajo la misma licencia Apache 2.0. Aunque el pipeline declarado es `image-text-to-text`, la cuantización de 3 bits puede afectar a la fidelidad de la generación, especialmente en tareas que requieren alta precisión numérica o razonamiento complejo. Es una opción interesante para desarrolladores que trabajan en ecosistema Apple y necesitan un VLM de tamaño medio con soporte de visión y contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, visión-lenguaje (VLM) |
| Parametros totales | 3.364.314.624 (según safetensors; el modelo base Qwen3.8-27B tiene 27B según documentación oficial) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.000 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | 3 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parámetros diseñado para procesar entradas multimodales (imagen y texto). Incorpora un codificador visual y un decodificador de lenguaje, con atención estándar y una ventana de contexto ampliada a 262K tokens. Según la documentación oficial, el modelo ha sido entrenado para tareas de codificación, trabajo profesional, investigación y razonamiento agéntico de largo horizonte, con capacidad de razonamiento configurable (modo pensamiento opcional). No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información proporcionada.

La conversión a MLX mantiene la arquitectura original pero reduce la precisión de los pesos a 3 bits, lo que disminuye el tamaño del modelo de aproximadamente 54 GB (en FP16) a 11,8 GB. Esta cuantización se realiza mediante el framework `mlx-lm`, optimizado para hardware Apple Silicon con Metal.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes como entrada junto con texto, permitiendo descripción, análisis y respuesta a preguntas visuales.
- Razonamiento configurable: el modelo base soporta un modo de pensamiento (thinking) que puede activarse o desactivarse según la tarea.
- Codificación: entrenado específicamente para tareas de programación, incluyendo generación, revisión y depuración de código.
- Tareas agénticas de largo horizonte: capaz de planificar y ejecutar secuencias de acciones con retroalimentación de herramientas y entorno.
- Soporte de tool calling: según la documentación del modelo base, maneja llamadas a funciones y respuestas a feedback de herramientas.
- Contexto largo: ventana de 262K tokens, adecuada para documentos extensos, conversaciones multi-turno y análisis de código grande.
- Multilingüe: aunque no se especifican idiomas concretos, los modelos Qwen suelen cubrir múltiples lenguas; no hay confirmación en esta versión.

## Casos de uso

- Asistente de programación con contexto de repositorio completo: gracias a la ventana de 262K tokens, el modelo puede analizar un proyecto entero y sugerir refactorizaciones o detectar errores. La cuantización de 3 bits puede reducir la precisión en código complejo, pero es viable para tareas de nivel medio.
- Análisis de documentos técnicos extensos: permite resumir o extraer información de manuales, papers o informes de cientos de páginas en una sola pasada, sin necesidad de dividir el texto.
- Automatización de tareas agénticas en entornos controlados: el modelo puede recibir instrucciones de alto nivel y ejecutar pasos intermedios usando herramientas (por ejemplo, APIs o scripts), gracias a su soporte de tool calling y razonamiento multi-paso.
- Descripción y análisis de imágenes en entornos Apple: al ser una conversión MLX, se integra nativamente en aplicaciones macOS/iOS, permitiendo generar alt-text, clasificar imágenes o responder preguntas visuales sin depender de servicios en la nube.
- Chatbot de atención al cliente con memoria larga: la ventana de contexto amplia permite mantener conversaciones prolongadas con historial completo, mejorando la coherencia en interacciones de soporte técnico.
- Prototipado rápido de aplicaciones de IA en Mac: desarrolladores que usan Apple Silicon pueden desplegar este modelo localmente con `mlx-lm` para pruebas de concepto, evitando costes de GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión cuantizada a 3 bits. Los datos siguientes corresponden al modelo base Qwen3.8-27B según la documentación oficial:

| Benchmark | Resultado |
|---|---|
| DeepSWE (tareas de ingeniería de software) | 42,2 |
| Terminal Bench (tareas de terminal) | 73,0 |
| OSWorld (tareas de sistema operativo) | 84,3 |

Estos valores indican un rendimiento sólido en tareas agénticas y de codificación, pero la cuantización de 3 bits puede degradar estos resultados de forma no cuantificada. Se recomienda evaluar el modelo cuantizado en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- Tamaño del modelo: 11,8 GB en disco (pesos cuantizados a 3 bits).
- Memoria unificada recomendada: al menos 16 GB en Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores) para cargar el modelo y dejar espacio para el contexto y los activos de inferencia.
- GPU: no aplica GPU NVIDIA; el formato MLX está optimizado para la GPU integrada de Apple Silicon (Metal).
- Opciones de despliegue: exclusivamente mediante `mlx-lm` (Python) o aplicaciones que usen MLX. No es compatible directamente con vLLM, llama.cpp u Ollama sin una conversión adicional a otro formato.
- Latencia y throughput: no disponibles. Depende del chip concreto; en un M2 Max se espera una generación de varios tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables para esta versión cuantizada. Como referencia, el modelo base Qwen3.8-27B compite con otros VLM de tamaño medio como Qwen2.5-VL-27B (si existiera) o InternVL2-26B, pero no se han encontrado comparaciones directas en la información proporcionada. La cuantización de 3 bits es inusual y puede situar a este modelo en una categoría propia, priorizando la eficiencia de memoria sobre la precisión.

## Limitaciones y advertencias

- Cuantización de 3 bits: la reducción de precisión puede provocar pérdida de calidad en tareas que requieren razonamiento matemático, generación de código complejo o comprensión visual detallada. Se recomienda probar con casos reales.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido falso o sesgado. La cuantización puede amplificar estos problemas en contextos ambiguos.
- Idioma: no se ha confirmado la lista de idiomas soportados; es probable que el modelo base tenga cobertura multilingüe, pero no está garantizado en esta versión.
- Compatibilidad: el formato MLX solo funciona en Apple Silicon. No es portable a entornos Linux/Windows con GPUs NVIDIA sin una conversión manual a otro formato (por ejemplo, GGUF o FP16), lo que requeriría herramientas adicionales.
- Licencia: Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de la licencia del modelo base y de los datos de entrenamiento.
- Soporte de tool calling: aunque el modelo base lo soporta, la cuantización puede afectar a la fiabilidad de las llamadas a funciones, especialmente en secuencias largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jesusoctavioas/Qwen3.8-27B-mlx-3Bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guía en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Artículo sobre ejecución local: https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Anuncio de Qwen 3.8 en OpenLM: https://openlm.ai/qwen3.8/
