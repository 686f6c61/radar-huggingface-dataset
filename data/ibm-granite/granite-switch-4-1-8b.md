# ibm-granite/granite-switch-4.1-8b

## Resumen

Granite Switch 4.1 8B (revisión 4.1.1) es un modelo de lenguaje modular publicado por IBM bajo la familia Granite. No es un transformer monolítico al uso: compone un modelo base (`granite-4.1-8b`, 8B parámetros, contexto de 128K), dos adaptadores aLoRA (`decision` y `guardian-core`) y un codificador de voz (`granite-speech-5.0-470m-turboctc`, 470M parámetros) para que un único endpoint alojado pueda alternar entre generación de lenguaje natural, decisiones clasificatorias, evaluación de seguridad y transcripción de audio. Los adaptadores se activan bajo demanda mediante tokens de control en la plantilla de chat.

El problema que resuelve es la fragmentación de infraestructura: en lugar de desplegar por separado un LLM conversacional, un clasificador de decisiones, un modelo de moderación y un servidor de ASR, Granite Switch concentra las cuatro funciones en un solo artefacto servible con vLLM o Transformers. Esto simplifica el despliegue, reduce el número de endpoints y permite reutilizar el mismo contexto de conversación entre tareas.

Es relevante ahora porque introduce un patrón de actualización por revisiones (4.1 → 4.1.1) que permite fijar versiones mediante tags, actualizar solo los pesos de un adaptador sin romper integraciones existentes y ampliar capacidades (en 4.1.1, el ASR pasa de inglés a siete idiomas). La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base transformer (`granite-4.1-8b`) + 2 adaptadores aLoRA (`decision`, `guardian-core`) + codificador ASR conformer CTC no autorregresivo (`granite-speech-5.0-470m-turboctc`) |
| Parametros totales | 8.776.400.896 (8,78B) |
| Parametros activos | No aplica (no es MoE); los adaptadores aLoRA son de baja dimensión |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Texto: no disponible. Audio (ASR): inglés, francés, alemán, español, portugués, italiano y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Backends soportados | HuggingFace Transformers, vLLM |
| Tamano del repositorio | 35,1 GB |
| Fecha de publicacion | 14 de octubre de 2026 (revision 4.1); 27 de octubre de 2026 (revision 4.1.1) |

## Arquitectura y entrenamiento

La arquitectura es una composición modular de tres piezas. El núcleo es `ibm-granite/granite-4.1-8b`, un transformer de 8B parámetros con 128K de contexto. Sobre él se montan dos adaptadores aLoRA: `decision`, que recibe un estado y una pregunta con opciones etiquetadas y devuelve en un único forward pass una distribución softmax sobre las etiquetas; y `guardian-core`, derivado de `granitelib-guardian-r1.0`, orientado a detectar riesgos de seguridad (daño, jailbreaking, lenguaje soez, violencia, contenido sexual, sesgo social y comportamiento poco ético). La tercera pieza es el codificador de voz Granite Speech 5.0 TurboCTC, un conformer CTC no autorregresivo de 470M parámetros que transcribe audio y cuya salida se inserta en el contexto de chat sustituyendo el contenido de audio.

La activación de cada componente se gobierna mediante tokens de control en la plantilla de chat, y la composición se realiza automáticamente con la librería `granite-switch` 0.1.1. Un detalle técnico importante es que el codificador de voz y el LLM no están entrenados conjuntamente: no existe todavía una proyección entrenada que los acople, por lo que el audio se transcribe y el texto resultante se empalma en el contexto sin guiado en tiempo de decodificación. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO sobre el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno sobre el modelo base de 8B parámetros y 128K de contexto.
- Decisiones clasificatorias: dado un estado y una pregunta con opciones etiquetadas, devuelve una distribución de probabilidad sobre las etiquetas en un solo forward pass.
- Moderación y evaluación de seguridad mediante `guardian-core`: detección de daño, jailbreaking, profanidad, violencia, contenido sexual, sesgo social y comportamiento poco ético.
- Transcripción de voz a texto (ASR) en inglés, francés, alemán, español, portugués, italiano y japonés, con salida puntuada y con mayúsculas.
- Detección automática del idioma del audio, sin necesidad de parámetro de idioma.
- Entrada de audio en la misma API de chat (formato `input_audio` compatible con OpenAI), sin servidor de voz separado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües de texto: no disponible en la informacion proporcionada.

## Casos de uso

- Atención al cliente automatizada con voz y texto: un único endpoint recibe audio del usuario, lo transcribe con el codificador TurboCTC (siete idiomas) y responde en el mismo contexto de chat, evitando desplegar un servidor ASR independiente.
- Moderación de contenido en plataformas: el adaptador `guardian-core` clasifica mensajes o respuestas generadas según categorías de riesgo (violencia, contenido sexual, sesgo social, jailbreaking) antes de publicarlos, integrándose como paso previo en un pipeline de publicación.
- Enrutamiento y clasificación de tickets: el adaptador `decision` recibe el estado del ticket y un conjunto de etiquetas de departamento y devuelve la distribución de probabilidad, lo que permite umbrales de confianza y derivación a revisión humana cuando la probabilidad máxima es baja.
- Asistentes de voz para atención telefónica: la transcripción multilingüe en el mismo endpoint simplifica arquitecturas de IVR donde antes se encadenaban un ASR, un LLM y un clasificador separados.
- Transcripción de reuniones y notas: el codificador CTC genera transcripciones puntuadas y capitalizadas en siete idiomas, que se pueden pasar directamente al modelo base para resumen o extracción de acciones.
- Evaluación automática de decisiones en flujos con estado: sistemas de soporte a la decisión donde se necesita una probabilidad calibrada sobre opciones discretas (por ejemplo, aprobar, rechazar o escalar) en lugar de texto libre.
- Actualización controlada de modelos en producción: el esquema de tags por revisión (4.1, 4.1.1) permite fijar versiones y actualizar solo el adaptador `decision` sin modificar el formato de prompt ni la integración existente.

## Benchmarks y rendimiento

La model card menciona que el adaptador `decision` de la revisión 4.1.1 se evaluó sobre el conjunto público Jev Decision Index v0.3, pero no se incluyen los resultados numéricos en la información proporcionada. Tampoco se publican cifras de MMLU, HumanEval, GSM8K ni de otras tareas del modelo base. El codificador de voz se describe como "el modelo ASR más rápido del OpenASR Leaderboard", sin cifras concretas ni fecha de referencia en el texto disponible.

| Benchmark | Resultado |
|---|---|
| Jev Decision Index v0.3 (adaptador `decision`) | No disponible (evaluado, sin cifras en la informacion) |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| OpenASR Leaderboard | No disponible (descrito como el más rápido, sin cifras) |

No se han publicado resultados de benchmarks con cifras en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un transformer de 8,78B parámetros en precisión de 16 bits requiere aproximadamente 17,6 GB solo para los pesos, más el codificador de 470M y el coste de caché KV para 128K de contexto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible en la informacion proporcionada; con cuantización de 8 bits o inferior podría ser viable en GPUs de 24 GB, pero no hay confirmación del autor.
- Opciones de despliegue: HuggingFace Transformers y vLLM (soportados explícitamente); se documenta el arranque con `python -m vllm.entrypoints.openai.api_server` y la API compatible con OpenAI. Otros backends (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidades diferenciales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite Switch 4.1 8B (este modelo) | 8,78B + 470M ASR | 128K | Chat + decisiones + moderación + ASR en un endpoint | Apache 2.0 | Hugging Face, vLLM, Transformers |
| Granite Switch 4.1 30B | 30B (base) + 470M ASR | 128K | Misma configuración que el 8B con base mayor | Apache 2.0 | Hugging Face |
| Granite Switch 4.1 8B Preview | 8B | 128K | Bundle completo de Granite Libraries, sin audio | Apache 2.0 | Hugging Face |
| Granite Switch 4.1 3B Preview | 3B | No disponible | Versión reducida del bundle de librerías, sin audio | Apache 2.0 | Hugging Face |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de 8B con ASR integrado) no está disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El codificador de voz y el LLM no están entrenados conjuntamente: no existe una proyección entrenada que los acople, por lo que no hay guiado en tiempo de decodificación sobre el audio y la transcripción se empalma como texto.
- Los idiomas soportados para texto no se documentan; solo se especifican los siete idiomas del ASR.
- No se publican cifras de benchmarks del modelo base ni del adaptador `decision`, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas de error ni evaluaciones de fidelidad.
- Sesgos conocidos: no disponible en la informacion proporcionada, más allá de que `guardian-core` está diseñado para detectar sesgo social en las entradas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los componentes embebidos (modelo base, adaptadores y codificador de voz) por si alguna difiere.
- El adaptador `decision` requiere una receta de invocación específica (system prompt de motor de decisión, turno `State:` sobre la base congelada y turno `### DECISION`); usarlo fuera de ese formato puede degradar la calidad de la distribución de salida.
- La revisión 4.1.1 actualiza los pesos de `decision` manteniendo el formato de prompt; conviene fijar la revisión con tags en producción para evitar cambios inesperados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-switch-4.1-8b
- Blog de lanzamiento de Granite Switch 4.1.1: http://huggingface.co/blog/ibm-granite/granite-switch-4-1-1
- Repositorio granite-switch: https://github.com/generative-computing/granite-switch
- Documentación de audio y limitaciones: https://github.com/generative-computing/granite-switch/blob/main/docs/AUDIO.md
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Codificador de voz: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Adaptador guardian-core: https://huggingface.co/ibm-granite/granitelib-guardian-r1.0/tree/main/guardian-core
- Adaptador decision: https://huggingface.co/ibm-granite/granitelib-core-r1.0/tree/4.1.1-decision
- Variante 30B: https://huggingface.co/ibm-granite/granite-switch-4.1-30b
- Variante 8B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-8b-preview
- Variante 30B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-30b-preview
- Variante 3B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-3b-preview
- OpenASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
