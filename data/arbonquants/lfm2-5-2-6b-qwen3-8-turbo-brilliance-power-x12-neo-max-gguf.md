# arbonquants/LFM2.5-2.6B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF

## Resumen

LFM2.5-2.6B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF es una cuantización GGUF publicada por el usuario arbonquants a partir del modelo base LiquidAI/LFM2.5-2.6B de LiquidAI, un modelo ligero de 2,69 mil millones de parámetros orientado a ejecución en el borde (edge). La particularidad de esta versión es el sistema "Turbo Brilliance", un conjunto de 12 modos de razonamiento y 12 modos de instrucción que se activan "en caliente" mediante etiquetas en el prompt, llamadas a la API o palabras clave compatibles con vLLM. Según el autor, este sistema inyecta cientos o miles de tokens de instrucciones en la fase previa al razonamiento para focalizar el modelo en la tarea antes de generar el primer token.

El modelo base es un modelo de uso general con soporte de tool calling y entrenamiento agéntico, con una ventana de contexto máxima de 128.000 tokens (131.000 según la ficha) y soporte multilingüe para 17 idiomas, incluido el castellano. La relevancia de esta ficha radica en ofrecer un modelo muy pequeño (2,6B) con capacidades de razonamiento configurable, adecuado para hardware modesto, aunque conviene subrayar que el sistema Turbo Brilliance es una creación del autor de la cuantización y no una funcionalidad nativa de LiquidAI, y que el propio autor lo etiqueta como BETA V1.0.

Cabe destacar que la licencia es Apache 2.0, lo que permite uso comercial sin restricciones relevantes, y que el repositorio pesa 19,5 GB, lo que sugiere que incluye múltiples cuantizaciones, incluida BF16 a precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de LiquidAI; la ficha no detalla la arquitectura concreta) |
| Parametros totales | 2.697.198.592 (≈2,69B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 128.000 tokens (131.000 según la ficha) |
| Tipos de cuantizacion | GGUF, incluidas cuantizaciones "MAX" (tensor de salida al 10-20% en BF16) y BF16 completo; cuantizaciones concretas no enumeradas |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (17 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

La ficha no detalla la arquitectura interna del modelo base LFM2.5-2.6B de LiquidAI, aunque la etiqueta "liquid" sugiere que pertenece a la familia de Liquid Foundation Models (LFM). Sobre el entrenamiento del modelo base, la información disponible indica que es un modelo de uso general con entrenamiento para tool calling y capacidades agénticas. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

La innovación principal de esta publicación no está en los pesos, sino en el sistema Turbo Brilliance: un mecanismo de "pre-cebado" del modelo que inyecta entre cientos y miles de tokens de instrucciones en la fase previa al razonamiento (pre-thinking), en milisegundos, para orientar al modelo hacia la tarea antes de generar salida. Ofrece 12 modos de razonamiento y 12 modos de instrucción seleccionables mediante etiquetas en el chat, la API o protocolos de palabras clave estándar de vLLM, además de un sistema de ayuda interactivo integrado. El autor recomienda una ventana de contexto mínima de 24.000 tokens para su uso y desaconseja el uso de caché.

## Capacidades

- Generación de texto general con longitudes de salida medias de 2.000 a 12.000+ tokens según el modo de razonamiento empleado.
- 12 modos de razonamiento conmutables en caliente (incluido un modo avanzado llamado "spoon" según los ejemplos del autor).
- 12 modos de instrucción; el modelo base no tenía modo de instrucción nativo y esta versión añade 12.
- Tool calling (function calling) nativo del modelo base.
- Entrenamiento agéntico para flujos de múltiples pasos.
- Soporte multilingüe en 17 idiomas, incluido el castellano.
- Sistema de ayuda interactivo ("context help") conectado al modelo para alinear los modos de razonamiento con el caso de uso.
- Control de la longitud de salida mediante indicación explícita en el prompt.

## Casos de uso

- Chatbots y asistentes conversacionales en el borde: con 2,6B de parámetros y contexto de 128k, puede ejecutarse localmente para conversaciones multi-turno largas sin depender de la nube.
- Agentes con tool calling: el entrenamiento agéntico del modelo base permite integrarlo en pipelines que requieren llamadas a funciones y razonamiento en varios pasos, con el beneficio de una huella de memoria reducida.
- Razonamiento configurable por tarea: los 12 modos de razonamiento permiten seleccionar perfiles según el caso de uso (por ejemplo, el modo "spoon" para tareas que el autor muestra como ejemplo de capacidad avanzada).
- Generación de documentos largos: con salidas de 2.000 a 12.000+ tokens, es adecuado para redacción de informes, resúmenes extensos o documentación técnica.
- Aplicaciones multilingües: soporte de 17 idiomas lo hace útil para productos que atienden usuarios en castellano, inglés, chino, japonés, árabe, etc., desde un único modelo pequeño.
- Prototipado rápido en hardware de consumo: las cuantizaciones Q6/Q8 recomendadas por el autor permiten ejecutar el modelo en GPUs domésticas y probar el sistema Turbo Brilliance sin infraestructura de servidor.
- Integración con vLLM en producción ligera: los modos se activan mediante cambios de palabras clave estándar de vLLM, lo que facilita su uso en despliegues con API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la model card original de LiquidAI para el modelo base incluye benchmarks y detalles del modelo, pero dichos datos no constan en la información proporcionada, por lo que no pueden reproducirse aquí. Las afirmaciones del autor sobre la mejora de calidad ("one shot/two shot Brilliance" frente a 5-10 regeneraciones) son cualitativas y no están respaldadas por métricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio completo pesa 19,5 GB (incluye todas las cuantizaciones). Para la versión BF16 (2,69B de parámetros) se requieren aproximadamente 5,4 GB solo de pesos; las cuantizaciones Q4/Q6/Q8 reducirían esa cifra proporcionalmente.
- GPU recomendadas: no disponible; dado el tamaño de 2,6B, cualquier GPU moderna con 6-8 GB de VRAM debería ser suficiente para cuantizaciones medias y altas.
- Cabe en GPUs de consumo: sí, con toda probabilidad; el autor recomienda específicamente cuantizaciones Q6 o Q8 para el mejor rendimiento en este tamaño de modelo.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (LM Studio, Ollama, koboldcpp); el autor menciona además compatibilidad con protocolos de palabras clave de vLLM.
- Latencia y throughput: no disponible; el autor afirma que la inyección de instrucciones del sistema Turbo Brilliance ocurre "en milisegundos", pero no aporta medidas de tokens por segundo.
- Configuración sugerida por el autor: temperatura 0,5-1 (pruebas propias) o los valores de LiquidAI (temperatura 0,1, top_k 50, repetition_penalty 1,1); top_k 64, min_p 0,05, top_p 0,95; contexto mínimo de 24k tokens; sin caché.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-Turbo-Brilliance-NEO-MAX (esta ficha) | 2,69B | 128k | Apache 2.0 | GGUF | Cuantización comunitaria con sistema de 12+12 modos vía prompt (BETA) |
| LiquidAI/LFM2.5-2.6B (modelo base) | 2,69B | 128k | Apache 2.0 | safetensors | Modelo original de LiquidAI, sin el sistema Turbo Brilliance |
| Qwen3-1.7B / Qwen3-4B (Qwen) | 1,7B / 4B | 32k-128k | Apache 2.0 | safetensors, GGUF | Alternativas edge con razonamiento nativo (thinking mode) |
| Gemma 3 4B (Google) | 4B | 128k | Licencia Gemma (restricciones) | safetensors, GGUF | Alternativa multimodal de tamaño similar, licencia menos permisiva |

La comparación se basa en datos públicos generales de estos modelos; para la variante Turbo Brilliance no existen benchmarks comparativos publicados.

## Limitaciones y advertencias

- El sistema Turbo Brilliance es una creación del cuantizador (arbonquants/DavidAU), no una funcionalidad oficial de LiquidAI; su eficacia no está validada por benchmarks independientes.
- El propio autor etiqueta la versión como BETA V1.0 y solicita informes de errores en la pestaña de comunidad.
- El rendimiento de los modos de razonamiento depende fuertemente de la cuantización: el autor indica que Q6 puede ser más del doble de potente que Q4/IQ4, y que en un modelo de 2,6B se recomienda encarecidamente Q6 o Q8.
- Algunos modos de razonamiento pueden empujar al modelo más allá de sus límites en ciertos casos de uso, requiriendo prompts adicionales; el autor atribuye esto a los límites del modelo de 2,6B, no al sistema.
- Los modos de instrucción de esta versión son "algo más verbales" que los de modelos con modo de instrucción dedicado.
- No se dispone de datos de benchmarks, por lo que las afirmaciones de calidad no pueden verificarse.
- Riesgo de alucinación: no disponible; como en cualquier modelo de 2,6B, debe asumirse un riesgo elevado frente a modelos mayores, especialmente en razonamiento y datos fácticos.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de la atribución.
- La model card aparece truncada en la información disponible, por lo que pueden existir limitaciones adicionales no documentadas aquí.
- El autor recomienda no usar caché y un contexto mínimo de 24k, lo que puede afectar al rendimiento en máquinas modestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arbonquants/LFM2.5-2.6B-Qwen3.8-Turbo-Brilliance-Power-X12-NEO-MAX-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Evolución del sistema Turbo Brilliance (referenciada por el autor): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Paper referenciado en las etiquetas (arXiv): https://arxiv.org/abs/2511.23404
