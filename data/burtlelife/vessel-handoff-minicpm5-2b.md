# BurtleLife/vessel-handoff-MiniCPM5-2B

## Resumen

vessel-handoff-MiniCPM5-2B es un ajuste fino mediante LoRA del modelo openbmb/MiniCPM5-2B (2.516.756.480 parámetros) desarrollado por el usuario BurtleLife. No es un modelo conversacional de propósito general: es un clasificador de decisión binaria diseñado para un pipeline de voz concreto, el del proyecto Hermes Vessel. Su única tarea es determinar, a partir de una transcripción de voz, si la petición del usuario requiere las herramientas del agente (ficheros, web, memoria, calendario, domótica, código) o si puede responderse directamente con el modelo de voz.

El problema que resuelve es de orquestación en asistentes de voz full-duplex: el modelo de habla (MiniCPM-o 4.5) gestiona la conversación pero no puede invocar herramientas, mientras que el agente Hermes sí puede pero no habla. Este modelo actúa de router entre ambos, con una latencia de decisión de aproximadamente 0,1-0,2 s en una RTX 5080 y 1,5-2 s en CPU en modo solo-decisión. La relevancia es acotada: es una pieza de infraestructura para un proyecto específico, no un modelo de uso general, y su valor está en la latencia y en la fidelidad de la decisión, no en la generación de texto.

El ajuste se distribuye en formato GGUF (Q6_K y Q8_0) y como adaptador LoRA PEFT, bajo licencia Apache-2.0, solo en inglés y con un conjunto de herramientas fijado al del agente Hermes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base openbmb/MiniCPM5-2B); ajuste fino LoRA r=16, alpha=32 sobre proyecciones de atención y MLP |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de referencia (`-c 4096`); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | Q6_K (2,1 GB, recomendada), Q8_0 (2,7 GB); Q4_K_M evaluada pero no publicada por pérdida de precisión |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q6_K, Q8_0) y adaptador LoRA PEFT (safetensors, ~100 MB) |

## Arquitectura y entrenamiento

El modelo parte de openbmb/MiniCPM5-2B, un transformer de 2,52 mil millones de parámetros, y se ajusta con LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones de atención y MLP. El entrenamiento completo son 3 épocas, aproximadamente 6 minutos en una RTX 3090 con un pico de 11,6 GB de VRAM. El conjunto de datos es sintético y consta de unas 560 muestras de estilo hablado: peticiones de herramientas generadas a partir de plantillas con slots rellenados (meteorología, máquinas y servicios del usuario, calendario, domótica, memoria personal, web, ficheros y mensajes) con ruido de transcripción (muletillas, minúsculas, sin puntuación), y ejemplos de conversación (charla trivial, conocimiento general, opiniones, sentimientos) junto con negativos difíciles del tipo "¿qué es un parlay?" frente a "¿qué apostamos Alex y yo?". Las respuestas de chat se toman de las propias salidas del modelo base en modo thinking, de modo que el ajuste modifica únicamente cuándo se invoca una herramienta, no cómo se conversa.

La innovación técnica no está en la arquitectura sino en el objetivo de entrenamiento: el modelo debe emitir una llamada `use_tools` cuyo argumento sea exactamente las palabras del usuario, limpias y sin expandir. El modelo base con thinking desactivado rechazaba invocar herramientas (4 de 57 peticiones), y con thinking activado las invocaba pero tardaba 0,6 s y reescribía las peticiones, a veces transformándolas en otra tarea distinta ("remind me to call Sam" pasaba a "check memory for any information about Sam"). El ajuste elimina ambos problemas: 0 de 57 traspasos con palabras añadidas y decisión correcta con thinking desactivado. El conjunto de evaluación reserva valores completos de slots (una ciudad, un host, una persona, una tienda, una liga) y las frases del benchmark, para medir generalización a formulaciones no vistas.

## Capacidades

- Decisión binaria de enrutamiento: determina si una transcripción debe traspasarse al agente con herramientas o responderse en conversación.
- Tool calling restringido: emite llamadas a una única herramienta `use_tools` definida en `router_prompt.json`, con el texto del usuario como argumento sin modificaciones.
- Preservación literal del habla: el argumento de la llamada reproduce las palabras del usuario limpias, sin expansión ni reformulación.
- Generalización a formulaciones nuevas: 24 de 24 aciertos en frases frescas no presentes en ninguna plantilla de entrenamiento.
- Manejo de transcripciones ruidosas: entrenado con muletillas, minúsculas y ausencia de puntuación, típicas de ASR.
- Detección de negativos difíciles: distingue peticiones que suenan a herramienta pero son conversación ("what's a parlay?" frente a "what did Alex and I bet on?").
- Modo solo-decisión: con `max_tokens: 4` basta para la clasificación, lo que reduce la latencia al mínimo.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`, desplegable con llama-server y API compatible con OpenAI.
- No genera respuestas destinadas a ser habladas: la conversación la produce el modelo de voz, no este modelo.

## Casos de uso

- Enrutamiento en asistentes de voz locales: integrado en el pipeline de Hermes Vessel, recibe la transcripción de Whisper y decide si el modelo de habla responde o si se cede la palabra al agente Hermes; su latencia de 0,1-0,2 s en GPU no introduce pausas perceptibles en la conversación.
- Despliegue en hardware sin GPU: con Q6_K y modo solo-decisión funciona en CPU a 1,5-2 s por decisión en núcleos de eficiencia (Core Ultra 5 125H), lo que permite asistentes de voz en portátiles sin tarjeta gráfica dedicada.
- Filtro previo de peticiones en agentes con herramientas: antes de invocar un agente costoso, este modelo descarta las peticiones conversacionales, reduciendo llamadas innecesarias y el consumo de tokens del agente principal.
- Clasificación de intención en pipelines de ASR: al estar entrenado con ruido de transcripción (minúsculas, sin puntuación, muletillas), se adapta a la salida cruda de motores de reconocimiento de voz sin necesidad de normalización previa.
- Prototipado de routers específicos de dominio: el repositorio incluye la receta (LoRA r=16, ~560 ejemplos, 6 minutos en una RTX 3090) documentada en `docs/local-voice.md`, lo que sirve de plantilla para entrenar routers equivalentes sobre otros conjuntos de herramientas.
- Evaluación de fidelidad en el traspaso: el modelo puede usarse como referencia para medir si otros routers preservan las palabras del usuario, dado que su métrica de "hand-offs con palabras añadidas" es 0 de 57.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, medidos sobre transcripciones escritas:

| Prueba | Base, thinking off | Base, thinking on | vessel-handoff |
|---|---|---|---|
| Peticiones de herramienta traspasadas (held-out) | 4/57 | 54/57 | 57/57 |
| Conversaciones mantenidas como chat (held-out) | 40/40 | 40/40 | 40/40 |
| Traspasos con palabras añadidas por el modelo | no disponible | 52/54 | 0/57 |
| Formulaciones nuevas, fuera de plantilla | 14/24 | no disponible | 24/24 |
| Benchmark de 16 frases | 10/16 | 15/16 | 16/16 |

Las cuantizaciones Q8_0 y Q6_K conservan todas las puntuaciones anteriores, también en modo solo-decisión (4 tokens) sobre CPU (57/57, 40/40, 24/24). Una compilación Q4_K_M perdió un caso de chat y uno de formulación nueva, por lo que no se publica. Tiempo de decisión: ~0,1-0,2 s en RTX 5080 y ~1,5-2 s en 8 núcleos de eficiencia de un Core Ultra 5 125H en modo solo-decisión. Las mediciones se hicieron sobre transcripciones escritas y habla grabada con una única voz TTS, no sobre un rango amplio de voces reales.

## Requisitos de hardware

- VRAM estimada: ~2,1 GB para Q6_K y ~2,7 GB para Q8_0, más el contexto (4096 tokens) y el overhead de llama.cpp; el entrenamiento LoRA requirió 11,6 GB de pico en una RTX 3090.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el autor reporta mediciones en RTX 5080 y RTX 3090.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; también en iGPU con memoria compartida suficiente.
- CPU: viable en modo solo-decisión, con 1,5-2 s por decisión en 8 núcleos de eficiencia.
- Despliegue: llama.cpp (llama-server b12177 o superior) con `--jinja -c 4096 --port 8799`; el adaptador LoRA es compatible con PEFT. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: ~0,1-0,2 s por decisión en RTX 5080 y ~1,5-2 s en CPU; no se publica throughput en tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros routers de decisión. La comparación más directa es contra el modelo base sin ajustar:

| Modelo | Parámetros | Contexto | Traspasos correctos | Palabras añadidas | Licencia |
|---|---|---|---|---|---|
| vessel-handoff-MiniCPM5-2B | 2,52 B | 4096 (config. de referencia) | 57/57 | 0/57 | Apache-2.0 |
| MiniCPM5-2B, thinking off | 2,52 B | no disponible | 4/57 | no disponible | Apache-2.0 |
| MiniCPM5-2B, thinking on | 2,52 B | no disponible | 54/57 | 52/54 | Apache-2.0 |

Frente a otros modelos pequeños de la misma categoría (Qwen2.5-1.5B/3B, Llama-3.2-1B/3B, Gemma-2-2B) no hay datos de benchmarks en la información proporcionada; esos modelos no están ajustados para esta tarea de enrutamiento y requerirían su propio ajuste.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso en asistentes en castellano u otras lenguas.
- Específico de un conjunto de herramientas: entrenado para las herramientas de un agente concreto (ficheros, web, memoria, calendario, domótica, código); otros agentes pueden necesitar ejemplos distintos.
- No responde: solo decide. Las respuestas de chat que genera no están pensadas para ser habladas y no deben usarse como salida conversacional.
- Evaluación limitada: las métricas se midieron sobre transcripciones escritas y habla grabada con una única voz TTS; no se ha validado con un rango amplio de voces reales, acentos ni condiciones acústicas adversas.
- Conjunto de entrenamiento no publicado: es sintético y está construido alrededor de la vida de una persona concreta (nombres, lugares, máquinas), por lo que no es reproducible directamente; solo se documenta la receta.
- Riesgo de alucinación en la decisión: un falso positivo envía al agente una petición conversacional y un falso negativo deja sin herramienta una petición que la requería; el autor no publica tasas de error en producción.
- Cuantización Q4_K_M no recomendada: pierde precisión en chat y en formulaciones nuevas, por lo que no se publica.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el adaptador deben cumplir también las condiciones de openbmb/MiniCPM5-2B.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de un proyecto personal sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurtleLife/vessel-handoff-MiniCPM5-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio Hermes Vessel (receta en `docs/local-voice.md`): https://github.com/Ex8-ca/hermes-vessel
- Agente Hermes: https://github.com/NousResearch/hermes-agent
- Análisis de MiniCPM5-2B en Better Stack: https://betterstack.com/community/guides/ai/minicpm5-2b/
- Cobertura de benchmarks de MiniCPM5-2B en eWeek: https://www.eweek.com/news/minicpm5-2b-ai-model-benchmarks/
