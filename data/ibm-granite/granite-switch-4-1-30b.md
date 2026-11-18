# ibm-granite/granite-switch-4.1-30b

## Resumen

Granite Switch 4.1 30B (revisión 4.1.1) es un LLM modular desarrollado por IBM dentro de la familia Granite. No se trata de un transformer monolítico convencional, sino de una composición de un modelo base (`ibm-granite/granite-4.1-30b`, 30B parámetros, contexto de 128K), dos adaptadores aLoRA —`decision` y `guardian-core`— y un encoder de voz (`granite-speech-5.0-470m-turboctc`, 470M parámetros). Los adaptadores se activan bajo demanda mediante tokens de control en la plantilla de chat, de modo que un único endpoint alojado puede alternar entre generación de lenguaje natural, decisiones clasificatorias y transcripción de audio.

El modelo resuelve el problema de consolidar en una sola implementación desplegada varias tareas que normalmente requerirían servidores separados: chat general, clasificación de decisiones con distribución de probabilidad sobre opciones etiquetadas, moderación de seguridad y reconocimiento automático del habla multilingüe. La revisión 4.1.1 actualiza los pesos del adaptador `decision` y amplía el encoder de voz a siete idiomas (inglés, francés, alemán, español, portugués, italiano y japonés), con salida puntuada y capitalizada.

La relevancia actual radica en su enfoque de "actualizar modelos como se actualiza software": las revisiones se etiquetan y se pueden fijar, los adaptadores se sustituyen sin cambiar el formato de invocación y la licencia Apache 2.0 permite uso comercial sin restricciones adicionales. El repositorio ocupa 120 GB y los pesos suman 29.989.814.272 parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLM modular: base transformer (`granite-4.1-30b`) + 2 adaptadores aLoRA (`decision`, `guardian-core`) + encoder de voz conformer CTC no autorregresivo (`granite-speech-5.0-470m-turboctc`) |
| Parámetros totales | 29.989.814.272 (base 30B) + 470M del encoder de voz |
| Parámetros activos | No es MoE; los adaptadores aLoRA se activan por tokens de control, no por enrutamiento disperso |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Voz: inglés, francés, alemán, español, portugués, italiano y japonés. Texto: no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La composición se articula en tres capas. El modelo base es `granite-4.1-30b`, un transformer de 30B parámetros con 128K de contexto. Sobre él se montan dos adaptadores aLoRA: `decision`, que recibe un estado y una pregunta con opciones etiquetadas y devuelve en un único forward pass una distribución softmax sobre las etiquetas, y `guardian-core`, derivado de `granitelib-guardian-r1.0`, que detecta riesgos de seguridad (daño, jailbreaking, blasfemia, violencia, contenido sexual, sesgo social y comportamiento poco ético). El tercer componente es el encoder de voz `granite-speech-5.0-470m-turboctc`, un conformer CTC no autorregresivo de 470M parámetros que transcribe audio y cuya salida se inserta en el contexto de chat en lugar del contenido de audio.

Un detalle técnico crítico es que el encoder de voz y el LLM **no están entrenados conjuntamente**: no existe todavía una proyección entrenada que los acople, y la documentación del repositorio `granite-switch` advierte de que no hay steering en tiempo de decodificación. La transcripción se realiza de forma independiente y se empalma como texto. La composición se gestiona automáticamente con la librería `granite-switch` 0.1.1. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en el endpoint de chat.
- Toma de decisiones clasificatorias: devuelve una distribución de probabilidad softmax sobre opciones etiquetadas en un solo forward pass (adaptador `decision`).
- Moderación de seguridad: detección de daño, jailbreaking, blasfemia, violencia, contenido sexual, sesgo social y comportamiento poco ético (adaptador `guardian-core`).
- Reconocimiento automático del habla multilingüe (siete idiomas) con transcripción puntuada y capitalizada, y detección automática del idioma sin parámetro explícito.
- Entrada de audio en el mismo endpoint que el chat y las decisiones, mediante la API compatible con OpenAI (`input_audio` en base64 WAV).
- Conmutación entre modos mediante tokens de control en la plantilla de chat.
- Compatibilidad con HuggingFace Transformers y vLLM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües de texto: no disponible en la información proporcionada.

## Casos de uso

- **Moderación de contenido en plataformas**: el adaptador `guardian-core` permite clasificar mensajes de usuario por categorías de riesgo (violencia, contenido sexual, sesgo social) en el mismo endpoint que atiende el chat, sin un servicio de moderación separado ni latencia de red adicional.
- **Sistemas de decisión con incertidumbre cuantificada**: el adaptador `decision` devuelve una distribución softmax sobre opciones etiquetadas en un único forward pass, lo que resulta adecuado para enrutamiento de tickets, triaje o selección de acciones cuando se necesita la probabilidad de cada opción y no solo la etiqueta ganadora.
- **Transcripción de reuniones y notas de voz multilingües**: el encoder TurboCTC transcribe audio en siete idiomas con detección automática de idioma y salida puntuada, integrándose en la misma conversación de chat para resumir o responder preguntas sobre el contenido transcrito.
- **Atención al cliente por voz**: un único endpoint puede recibir audio del cliente, transcribirlo, generar la respuesta conversacional y aplicar moderación sobre el turno del usuario, simplificando la arquitectura de un contact center automatizado.
- **Pipelines de clasificación documental**: combinando el modelo base con el adaptador `decision`, se pueden clasificar documentos o consultas en categorías predefinidas obteniendo la confianza de cada clase, útil para enrutamiento y control de calidad.
- **Asistentes internos con control de seguridad**: despliegue de un chatbot corporativo donde `guardian-core` filtra intentos de jailbreak y contenido inapropiado antes de que el modelo base responda, todo sobre la misma instancia servida con vLLM.
- **Evaluación de políticas de contenido**: uso de la distribución de probabilidad del adaptador `decision` para auditar y calibrar umbrales de moderación sobre conjuntos de datos etiquetados, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

La model card menciona que el adaptador `decision` de la revisión 4.1.1 fue evaluado sobre el conjunto público Jev Decision Index v0.3, con una receta de invocación documentada (system prompt fijo de motor de decisión, turno `State:` ejecutado sobre la base congelada y turno `### DECISION`). Sin embargo, en la información proporcionada no se incluyen los resultados numéricos de esa evaluación. Tampoco se publican cifras de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de 30B parámetros en fp16 requiere aproximadamente 60 GB solo para pesos, más el overhead de caché KV para 128K de contexto; el encoder de voz añade 470M parámetros adicionales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un despliegue en fp16 requeriría GPUs de 80 GB (A100, H100) o múltiples GPUs menores.
- ¿Cabe en consumer GPU? No disponible en la información proporcionada; con cuantización agresiva a 4 bits podría aproximarse a los 24 GB, pero no se confirma en la documentación.
- Opciones de despliegue: HuggingFace Transformers y vLLM (ambos confirmados en la model card, con ejemplos de `AutoModelForCausalLM.from_pretrained` y `vllm.entrypoints.openai.api_server`). La composición se gestiona con `granite-switch` 0.1.1.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidades diferenciales | Licencia |
|---|---|---|---|---|
| Granite Switch 4.1 30B | 30B + 470M encoder | 128K | Chat + decisiones + moderación + ASR multilingüe en un endpoint | Apache 2.0 |
| Granite Switch 4.1 8B | 8B base | No disponible | Misma configuración (Chat + Decisions + Guardian + speech) con base de 8B | Apache 2.0 |
| Granite Switch 4.1 30B preview | 30B | No disponible | Bundle completo de Granite Libraries sin audio | Apache 2.0 |

La información proporcionada no incluye modelos comparables de otros fabricantes con composición modular equivalente (chat + adaptadores de decisión + ASR embebido). La comparación más directa disponible es con las variantes de la propia familia Granite Switch, que comparten arquitectura y licencia pero difieren en tamaño de base y en la inclusión o no del encoder de voz.

## Limitaciones y advertencias

- El encoder de voz y el LLM no están entrenados conjuntamente: no existe una proyección entrenada que los acople y no hay steering en tiempo de decodificación, lo que limita la integración semántica entre audio y respuesta.
- La transcripción de audio se empalma como texto en el contexto; errores del ASR se propagan directamente al modelo de lenguaje sin mecanismo de corrección conjunto.
- El adaptador `decision` devuelve una distribución sobre opciones etiquetadas predefinidas; no está pensado para preguntas abiertas ni para generar opciones nuevas.
- El adaptador `guardian-core` cubre categorías de riesgo concretas (daño, jailbreaking, blasfemia, violencia, contenido sexual, sesgo social, comportamiento poco ético); no se documenta su cobertura fuera de esas categorías.
- Idiomas de texto soportados: no disponible. Los siete idiomas documentados corresponden únicamente al encoder de voz.
- Riesgo de alucinación del modelo base: no cuantificado en la información proporcionada.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales; no se documentan cláusulas adicionales.
- El repositorio ocupa 120 GB, lo que exige planificación de almacenamiento y ancho de banda para el despliegue.
- Las revisiones se etiquetan; es recomendable fijar la revisión (`revision="granite-switch-4.1-30b"`) en producción para evitar cambios no deseados de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-switch-4.1-30b
- Blog de lanzamiento 4.1.1: http://huggingface.co/blog/ibm-granite/granite-switch-4-1-1
- Repositorio granite-switch: https://github.com/generative-computing/granite-switch
- Documentación de audio: https://github.com/generative-computing/granite-switch/blob/main/docs/AUDIO.md
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b
- Adaptador Guardian Core: https://huggingface.co/ibm-granite/granitelib-guardian-r1.0/tree/main/guardian-core
- Adaptador Decision: https://huggingface.co/ibm-granite/granitelib-core-r1.0/tree/4.1.1-decision
- Encoder de voz: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Variante 8B: https://huggingface.co/ibm-granite/granite-switch-4.1-8b
- Variante 30B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-30b-preview
- Variante 8B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-8b-preview
- Variante 3B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-3b-preview
- OpenASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
