# NostraEmpire/mirror-granite-switch-4.1-8b

## Resumen

Granite Switch 4.1 8B (revision 4.1.1) es un modelo de lenguaje modular publicado por IBM bajo la familia Granite y distribuido en el repositorio espejo `NostraEmpire/mirror-granite-switch-4.1-8b`. No es un transformer monolítico al uso: compone un modelo base (`ibm-granite/granite-4.1-8b`, 8B parámetros y 128K de contexto) con dos adaptadores aLoRA (`decision` y `guardian-core`) y un encoder de voz (`granite-speech-5.0-470m-turboctc`, 470M parámetros). La activación de cada componente se realiza mediante tokens de control en la plantilla de chat, de modo que un único endpoint alojado puede alternar entre generación de lenguaje natural, decisiones clasificatorias y transcripción de audio.

El modelo resuelve el problema de consolidar en un solo despliegue tareas que normalmente requieren varios servicios: chat general, clasificación de seguridad (detección de daño, jailbreaking, contenido sexual, sesgo social), decisión sobre opciones etiquetadas con distribución softmax en un único forward pass y speech-to-text multilingüe. La revision 4.1.1 actualiza los pesos del adaptador `decision` y amplía la entrada de voz a siete idiomas (inglés, francés, alemán, español, portugués, italiano y japonés) con transcripciones puntuadas y capitalizadas.

Es relevante ahora porque propone un patrón de actualización modular —"actualizar modelos como se actualiza software"—, con revisiones etiquetadas que permiten fijar versiones, y porque integra ASR en el mismo endpoint que el LLM sin necesidad de un servidor de voz separado. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM base transformer (`granite-4.1-8b`) + 2 adaptadores aLoRA (`decision`, `guardian-core`) + encoder ASR conformer CTC (`granite-speech-5.0-470m-turboctc`) |
| Parametros totales | 8.776.400.896 (8,78B, segun safetensors) |
| Parametros activos | No aplica (no es MoE); el encoder de voz aporta 470M adicionales |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Texto: no disponible. Voz: ingles, frances, aleman, espanol, portugues, italiano y japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es modular y no monolítica. El núcleo es `ibm-granite/granite-4.1-8b`, un transformer decoder-only de 8B parámetros con 128K de contexto. Sobre él se montan dos adaptadores aLoRA: `decision`, que recibe un estado y una pregunta con opciones etiquetadas y devuelve una distribución softmax sobre las etiquetas en un solo forward pass, y `guardian-core`, derivado de `granitelib-guardian-r1.0`, que detecta riesgos de seguridad (daño, jailbreaking, blasfemia, violencia, contenido sexual, sesgo social y comportamiento poco ético). El tercer componente es un encoder conformer CTC no autorregresivo de 470M parámetros para ASR, que transcribe el audio y lo inserta en el contexto de chat en lugar del contenido de audio original.

La composición se realiza automáticamente con la librería `granite-switch` 0.1.1 y los adaptadores se activan mediante tokens de control en la plantilla de chat. Un detalle técnico importante: el encoder de voz y el LLM no están entrenados conjuntamente; no existe todavía una proyección entrenada que los acople, y el diseño no contempla decode-time steering sobre el audio. La revision 4.1.1 incorpora pesos actualizados del adaptador `decision` manteniendo formato de prompt, invocación y lectura, de modo que las integraciones existentes siguen funcionando sin cambios. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en un endpoint compatible con la API de OpenAI (`endpoints_compatible`).
- Razonamiento y respuesta en lenguaje natural sobre el modelo base de 128K de contexto.
- Decisiones clasificatorias: distribución de probabilidad softmax sobre opciones etiquetadas en un único forward pass.
- Moderación y seguridad: detección de daño, jailbreaking, blasfemia, violencia, contenido sexual, sesgo social y comportamiento poco ético mediante `guardian-core`.
- Speech-to-text multilingüe integrado (inglés, francés, alemán, español, portugués, italiano, japonés) con salida puntuada y capitalizada y detección automática de idioma.
- Entrada de audio en el mismo endpoint que el chat, sin servidor de voz separado.
- Composición y activación de adaptadores mediante tokens de control en la plantilla de chat.
- Compatibilidad con Hugging Face Transformers y vLLM.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingües de texto: no disponible en la informacion proporcionada.

## Casos de uso

- Moderación de contenido en producción: `guardian-core` permite clasificar mensajes de usuario en categorías de riesgo (violencia, contenido sexual, jailbreaking) dentro del mismo endpoint que atiende la conversación, evitando un servicio de moderación adicional y reduciendo la latencia total del pipeline.
- Enrutamiento y clasificación de tickets: el adaptador `decision` devuelve una distribución softmax sobre etiquetas predefinidas en un solo forward pass, lo que lo hace adecuado para triaje de soporte, asignación de categorías o selección de intent sin generación autoregresiva.
- Asistentes de voz para atención al cliente: la transcripción ASR integrada cubre siete idiomas y detecta el idioma automáticamente, de modo que una llamada o nota de voz se transcribe y se inserta directamente en el contexto de chat para que el LLM responda.
- Subtitulado y actas de reuniones multilingües: el encoder TurboCTC genera transcripciones puntuadas y capitalizadas en inglés, francés, alemán, español, portugués, italiano y japonés, aprovechables para documentación interna o accesibilidad.
- Chatbot documental con contexto largo: los 128K tokens del modelo base permiten mantener conversaciones multi-turno con historiales extensos o documentos completos adjuntos sin truncamiento agresivo.
- Clasificación de seguridad en pipelines de generación: antes de emitir una respuesta, se puede invocar `guardian-core` sobre la salida candidata y bloquear o reescribir según la puntuación de riesgo, todo en el mismo despliegue.
- Despliegue unificado en vLLM: al ser compatible con el servidor OpenAI de vLLM, se puede servir chat, decisiones y ASR desde una sola instancia con revisión fijada por tag, simplificando el versionado en producción.

## Benchmarks y rendimiento

La model card menciona que el adaptador `decision` de la revision 4.1.1 fue evaluado sobre el conjunto público Jev Decision Index v0.3, usando la receta de invocación documentada (system prompt fijo de motor de decisión, turno `State:` ejecutado sobre el base congelado y turno `### DECISION`). Sin embargo, la información proporcionada se interrumpe antes de incluir los resultados numéricos, y no se aportan cifras de MMLU, HumanEval, GSM8K ni de la OpenASR Leaderboard más allá de la afirmación cualitativa de que TurboCTC es "el modelo ASR más rápido" de dicha tabla.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, un modelo de 8,78B parámetros en FP16 requiere aproximadamente 17,6 GB solo para pesos (coincide con el tamaño del repo), a lo que hay que sumar caché KV para 128K de contexto; en cuantización de 8 bits bajaría a unos 9 GB y en 4 bits a unos 5 GB, aunque no se confirman formatos GGUF en el repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada. Para FP16 con contexto largo se necesitan GPUs de 40-80 GB (A100, H100); para contextos moderados, una RTX 4090 de 24 GB podría alojar los pesos en FP16 pero con margen ajustado para la caché KV.
- Cabe en consumer GPU: probablemente en FP16 en RTX 4090 (24 GB) con contexto limitado; en cuantizaciones de 8 o 4 bits cabría en GPUs de 12-16 GB, aunque los formatos cuantizados no están documentados.
- Opciones de despliegue: Hugging Face Transformers (`AutoModelForCausalLM`) y vLLM (servidor compatible con la API OpenAI). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Componentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite Switch 4.1.1 8B | 8,78B (+470M ASR) | 128K | Base + 2 aLoRA + encoder ASR | Apache 2.0 | Hugging Face, vLLM |
| Granite Switch 4.1 30B | 30B (base) | 128K | Misma configuracion Chat + Decisions + Guardian + voz | Apache 2.0 | Hugging Face (`ibm-granite/granite-switch-4.1-30b`) |
| Granite Switch 4.1 8B preview | 8B (base) | 128K | Bundle completo de Granite Libraries, sin audio | Apache 2.0 | Hugging Face (`ibm-granite/granite-switch-4.1-8b-preview`) |
| Granite Switch 4.1 3B preview | 3B (base) | No disponible | Bundle completo de Granite Libraries, sin audio | Apache 2.0 | Hugging Face (`ibm-granite/granite-switch-4.1-3b-preview`) |

Las alternativas directas son las otras variantes de la propia familia Granite Switch; no se dispone de información sobre modelos de otros fabricantes comparables en esta categoría modular con ASR integrado.

## Limitaciones y advertencias

- El encoder de voz y el LLM no están entrenados conjuntamente: no existe proyección entrenada que los acople ni decode-time steering sobre el audio, según la documentación del repositorio `granite-switch`.
- El repositorio es un espejo de terceros (`NostraEmpire/mirror-granite-switch-4.1-8b`) con 0 likes y 336 descargas; conviene verificar la integridad de los pesos frente al repositorio oficial `ibm-granite/granite-switch-4.1-8b` antes de usarlo en producción.
- Los idiomas soportados para texto no están declarados en la información disponible; solo se documentan los siete idiomas del ASR.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplicable el riesgo habitual de los LLM de 8B.
- Sesgos conocidos: no documentados explícitamente; el adaptador `guardian-core` está diseñado para detectar sesgo social, pero no se aportan métricas de sesgo del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y aviso de cambios; no se indican restricciones adicionales.
- La revision 4.1.1 actualiza los pesos de `decision`; para reproducibilidad conviene fijar la revisión por tag (`granite-switch-4.1.1-8b` o `granite-switch-4.1-8b`) en lugar de usar `main`.
- No se documentan formatos cuantizados (GGUF, AWQ, GPTQ) ni resultados de benchmarks numéricos, lo que dificulta estimar rendimiento y coste antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NostraEmpire/mirror-granite-switch-4.1-8b
- Repositorio oficial (referenciado en la model card): https://huggingface.co/ibm-granite/granite-switch-4.1-8b
- Blog de lanzamiento 4.1.1: http://huggingface.co/blog/ibm-granite/granite-switch-4-1-1
- Librería granite-switch: https://github.com/generative-computing/granite-switch
- Documentación de audio: https://github.com/generative-computing/granite-switch/blob/main/docs/AUDIO.md
- Variante 30B: https://huggingface.co/ibm-granite/granite-switch-4.1-30b
- Variante 8B preview (sin audio): https://huggingface.co/ibm-granite/granite-switch-4.1-8b-preview
- Variante 30B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-30b-preview
- Variante 3B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-3b-preview
- Adaptador Guardian Core: https://huggingface.co/ibm-granite/granitelib-guardian-r1.0/tree/main/guardian-core
- Adaptador Decision: https://huggingface.co/ibm-granite/granitelib-core-r1.0/tree/4.1.1-decision
- Encoder de voz: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- OpenASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
