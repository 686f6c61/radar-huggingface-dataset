# KoarAI/LFM2.5-350M-Thinking-GGUF

## Resumen

KoarAI/LFM2.5-350M-Thinking-GGUF es la versión cuantizada en formato GGUF del modelo de razonamiento KoarAI/LFM2.5-350M-Thinking, un fine-tuning completo sobre el modelo base LiquidAI/LFM2.5-350M de Liquid AI. Este modelo de 350 millones de parámetros está diseñado para ejecutarse en dispositivos con recursos limitados (edge, móviles, CPUs económicas) manteniendo capacidades de razonamiento y seguimiento de instrucciones. El fine-tuning se realizó sobre trazas de razonamiento destiladas de tres modelos de gran tamaño: Qwen 3.8 Max, GLM 5.2 y Kimi K3.

La relevancia de este modelo radica en su tamaño extremadamente compacto combinado con un modo de pensamiento explícito ("thinking") que permite desplegar capacidades de razonamiento en entornos donde los modelos grandes no son viables. Al estar disponible en GGUF, puede ejecutarse con llama.cpp, Ollama, LM Studio o Jan.ai, tanto en CPU como en GPU de baja gama. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (LFM2, mezcla de SSM y atención lineal) |
| Parametros totales | 350 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M de Liquid AI utiliza la arquitectura LFM2, un diseño híbrido que combina capas de espacio de estados (SSM) con mecanismos de atención lineal, lo que permite una inferencia más rápida y eficiente en memoria que los transformers puros de tamaño equivalente. El pre-entrenamiento se extendió de 10 a 28 billones de tokens, seguido de un entrenamiento con aprendizaje por refuerzo a gran escala para mejorar el seguimiento de instrucciones y el tool calling.

El modelo KoarAI/LFM2.5-350M-Thinking se obtuvo mediante fine-tuning completo (Full Fine-Tuning) sobre el modelo base, utilizando trazas de razonamiento generadas por tres modelos de gran tamaño: Qwen 3.8 Max, GLM 5.2 y Kimi K3. Este proceso destila la capacidad de razonamiento paso a paso en el modelo pequeño, que aprende a emitir un bloque de pensamiento antes de la respuesta final. La cuantización GGUF posterior preserva la mayor parte de la fidelidad del razonamiento, especialmente en las variantes Q8_0 y Q5_K_M.

## Capacidades

- Generación de texto con modo de razonamiento explícito: el modelo emite un bloque de "thinking" antes de la respuesta final, similar a los modelos de razonamiento de gran tamaño.
- Seguimiento de instrucciones mejorado respecto a LFM2-350M, gracias al pre-entrenamiento extendido y al RL.
- Soporte de tool calling / function calling, según la documentación de Liquid AI para LFM2.5-350M.
- Capacidades multilingües en inglés, ruso y chino.
- Inferencia de alta velocidad en CPU y GPU de baja gama, gracias a la arquitectura híbrida y al formato GGUF.
- Compatible con llama.cpp, Ollama, LM Studio y Jan.ai, lo que facilita su integración en aplicaciones locales.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede ejecutarse localmente en un smartphone o tablet gracias a su tamaño reducido (220 MB en Q4_K_M), ofreciendo respuestas con razonamiento sin depender de la nube.
- Chatbots de atención al cliente en entornos con privacidad estricta: al ser Apache 2.0 y ejecutable en local, permite desplegar un asistente que procesa datos sensibles sin enviarlos a servidores externos.
- Generación de código en entornos de desarrollo integrado (IDE) con recursos limitados: el modo thinking ayuda a descomponer problemas de programación en pasos lógicos, y el tool calling permite integrarlo con funciones de autocompletado o ejecución de comandos.
- Educación y tutoría: puede utilizarse como tutor de matemáticas o lógica en aplicaciones educativas, donde el razonamiento paso a paso es más valioso que la velocidad bruta.
- Prototipado rápido de agentes conversacionales: su bajo coste de inferencia permite iterar rápidamente en el diseño de prompts y flujos de conversación antes de escalar a modelos más grandes.
- Procesamiento de texto en lenguas rusa y china: su soporte multilingüe lo hace adecuado para aplicaciones de resumen, traducción o análisis de sentimiento en estos idiomas, especialmente en entornos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de rendimiento, y la documentación de Liquid AI para LFM2.5-350M tampoco proporciona cifras concretas en los materiales consultados. Se recomienda consultar el repositorio del modelo base (KoarAI/LFM2.5-350M-Thinking) o la documentación oficial de Liquid AI para obtener datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 ~710 MB, Q8_0 ~375 MB, Q5_K_M ~260 MB, Q4_K_M ~220 MB, Q4_0 ~205 MB. Cualquier GPU con al menos 1 GB de VRAM puede ejecutar la versión F16; las cuantizaciones de 4 bits caben en GPUs integradas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) ejecutará el modelo con latencia mínima. También funciona en iGPUs de Intel y AMD.
- Ejecución en CPU: el modelo está optimizado para CPUs de bajo coste; la cuantización Q4_0 permite inferencia en tiempo real en CPUs de gama media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan.ai, y cualquier framework compatible con GGUF (llama-cpp-python, ctransformers, etc.).
- Latencia y throughput: no se han publicado cifras oficiales, pero por el tamaño del modelo se espera una generación de decenas de tokens por segundo en CPU moderna y cientos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KoarAI/LFM2.5-350M-Thinking-GGUF | 350M | no disponible | Apache 2.0 | GGUF | Fine-tune con razonamiento destilado |
| LiquidAI/LFM2.5-350M | 350M | no disponible | Apache 2.0 | safetensors | Modelo base sin fine-tune de razonamiento |
| LiquidAI/LFM2-350M | 350M | no disponible | Apache 2.0 | safetensors | Versión anterior, sin pre-entrenamiento extendido ni RL |
| Qwen2.5-0.5B | 500M | 32K | Apache 2.0 | safetensors, GGUF | Transformer denso, sin modo thinking nativo |

La comparativa se limita a modelos de tamaño similar. No se dispone de datos de rendimiento para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Tamaño reducido: con 350M de parámetros, el modelo tiene una capacidad limitada de conocimiento factual y puede cometer errores en tareas complejas que requieren memoria de largo alcance.
- Riesgo de alucinación: como todos los modelos de lenguaje pequeños, es propenso a generar información plausible pero incorrecta, especialmente en dominios especializados.
- Idiomas limitados: solo soporta inglés, ruso y chino. No debe utilizarse para otros idiomas sin evaluación previa.
- Contexto no documentado: no se ha especificado la longitud máxima de contexto en la información disponible, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- Dependencia del fine-tuning: el modo thinking puede producir respuestas más largas y verbosas, lo que aumenta la latencia percibida en aplicaciones interactivas.
- Sin garantías de rendimiento: al no haber benchmarks publicados, el rendimiento real en tareas específicas debe validarse antes de su uso en producción.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/KoarAI/LFM2.5-350M-Thinking-GGUF
- Modelo base (fine-tune): https://huggingface.co/KoarAI/LFM2.5-350M-Thinking
- Modelo base original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Documentación de Liquid AI para LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Versión anterior LFM2-350M: https://huggingface.co/LiquidAI/LFM2-350M
