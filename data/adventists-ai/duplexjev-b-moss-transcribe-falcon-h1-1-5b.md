# adventists-ai/DuplexJev-B-MOSS-Transcribe-Falcon-H1-1.5B

## Resumen

DuplexJev-B-MOSS-Transcribe-Falcon-H1-1.5B es un conector de voz desarrollado por Adventists.ai que convierte un encoder de audio congelado y un LLM congelado en un motor de decisiones tipadas para agentes de voz full-duplex. La idea central es que cada pregunta declarada en tiempo de ejecucion ("¿ha terminado de hablar el usuario?", "¿que intencion tiene?", "¿que paso del flujo toca?") se lee como una distribucion sobre un conjunto cerrado de opciones en un unico token, sin pasos de decodificacion autoregresiva y con varias preguntas resueltas por forward pass.

El sistema combina tres piezas: el encoder de audio de MOSS-Transcribe-Diarize (arquitectura Whisper, 24 capas, 307 M de parametros, congelado), el modelo Falcon-H1-1.5B-Instruct de TII (hibrido de atencion y Mamba, congelado) y un conector entrenable de 37.758.976 parametros que proyecta los estados ocultos del encoder al espacio del LLM mediante frame stacking y un proyector SwiGLU. El conjunto suma unos 1900 M de parametros, aunque en el repositorio de HuggingFace solo se publican los pesos del conector (0,1 GB en safetensors), ya que encoder y LLM se descargan por separado.

Es relevante porque propone una alternativa de baja latencia y bajo coste a los pipelines clasicos de ASR mas LLM: en lugar de transcribir y luego razonar, el modelo lee decisiones directamente de las representaciones acusticas, con un coste de 204 ms por evento en una H200. Esta variante concreta ("B") esta entrenada solo con alineamiento de contenido (destilacion de transcripcion R1-R2), sin entrenamiento paralinguistico, y se presenta explicitamente como punto de partida para fine-tuning propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conector DuplexJev (frame stacking + proyector SwiGLU) entre un encoder Whisper congelado y un LLM hibrido atencion + Mamba (Falcon-H1) congelado |
| Parametros totales | 1900 M (encoder de audio 307 M + LLM 1.5 B + conector 37,8 M) |
| Parametros activos | No aplica (no es MoE). Parametros entrenables del conector: 37.758.976 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; inferencia en fp32 o bf16) |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | Apache-2.0 para los pesos del conector; los modelos congelados mantienen las suyas (Falcon-H1-1.5B bajo TII Falcon License 2.0, encoder bajo Apache-2.0) |
| Formato de pesos | safetensors (transformers; libreria duplexjev >= 0.2.2) |

## Arquitectura y entrenamiento

El conector toma la ultima capa del encoder de MOSS-Transcribe-Diarize (familia Whisper, 24 capas, 307 M de parametros, congelado) y aplica frame stacking de 8 en 8, reduciendo los frames de 50 Hz a 6,25 tokens de audio por segundo, que se proyectan al espacio del LLM con un proyector SwiGLU (variante B, 37,8 M). El LLM receptor es Falcon-H1-1.5B-Instruct, un modelo hibrido que combina atencion clasica con capas recurrentes Mamba; esas capas mantienen estado a lo largo de la secuencia, por lo que la libreria duplexjev (>= 0.2.2) desactiva automaticamente el prefix packing y trabaja en `mode="batch"`, con una fila por pregunta. Para velocidad en GPU conviene instalar los kernels `mamba-ssm` y `causal-conv1d`; sin ellos, transformers recurre a una ruta de referencia lenta.

El entrenamiento congela encoder y LLM y solo actualiza el conector. Se usaron dos paquetes disjuntos de 0,5 M de utterances cada uno de la mezcla Ultravox v0.6, con destilacion de transcripcion en dos rondas (R1 y R2), 32.000 pasos por ronda y batch global de 16. La innovacion tecnica es el modo de lectura: en lugar de decodificar texto, cada pregunta se resuelve como una distribucion single-token sobre sus opciones, lo que elimina todos los pasos de decodificacion y permite evaluar muchas preguntas en un mismo forward pass. La receta es la misma que la de los conectores Qwen3-32B publicados con el paper asociado.

## Capacidades

- Decisiones tipadas de conjunto cerrado: cada pregunta se lee como una distribucion sobre sus opciones en un unico token, sin decodificacion.
- Deteccion de estado de turno (por ejemplo, 4 clases en el benchmark Easy-Turn): util para saber si el usuario ha terminado de hablar.
- Clasificacion de intencion sobre un conjunto de etiquetas declarado en tiempo de ejecucion (clima, medios, navegacion, telefono, chit-chat en los ejemplos de la model card).
- Seleccion de cues de hablante ("speaker cues") y de pasos de flujo en agentes conversacionales.
- Alineamiento de contenido y destilacion de transcripcion: la variante B esta entrenada para representar el contenido del habla.
- Multilingue en zh y en, con preguntas y opciones redactadas en el mismo idioma que el audio.
- Procesamiento de multiples preguntas por forward pass, con una fila por pregunta para respetar el estado recurrente de Falcon-H1.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso. Tampoco se documentan capacidades de vision o audio generativo.

## Casos de uso

- Gestion de turno en agentes de voz full-duplex: el modelo responde a la pregunta "¿ha terminado el usuario?" con dos opciones, lo que permite decidir cuando ceder la palabra en una conversacion en tiempo real.
- Enrutado de intencion en asistentes de voz: con un conjunto cerrado de etiquetas y sin decodificacion, clasifica la intencion del turno para dirigirlo al flujo correspondiente.
- Control de flujo en IVR o sistemas de atencion al cliente: cada decision de "que paso toca" se resuelve como una lectura single-token, con coste bajo y latencia predecible.
- Seleccion de muletillas o fillers: en un agente conversacional, el modelo puede elegir que filler reproducir mientras se prepara la respuesta, aprovechando su naturaleza de clasificador de conjunto cerrado.
- Despliegue en el borde (edge) en dominios acotados: el conector ocupa solo 37,8 M de parametros entrenables y el pipeline completo esta pensado para equipos con recursos limitados; la model card incluye el tag `edge`, aunque la latencia en CPU es alta sin kernels Mamba.
- Enrutado multimodal en sistemas de voz embebidos (por ejemplo, automocion): los ejemplos de la model card usan etiquetas de clima, medios, navegacion, telefono y chit-chat, tipicas de asistentes de vehiculo.
- Prototipado rapido de clasificadores de habla: al congelar encoder y LLM y entrenar solo el conector, sirve como base para fine-tuning propio de decisiones especificas ("A starting point for your own decision fine-tuning", segun el autor).
- Analisis de contenido de audio sin transcripcion completa: la destilacion de transcripcion permite obtener senales de contenido a 6,25 tokens/s en lugar de transcribir el audio entero.

## Benchmarks y rendimiento

| Evaluacion (%) | protocolo del paper | defaults de duplexjev 0.2.2 |
|---|---:|---:|
| qa100 (spoken QA) | 50 | 56 |
| qa100, Falcon-H1-1.5B leyendo la transcripcion | 73 | – |
| ZJU-ML (spoken QA, real + TTS) | 32 | – |
| Easy-Turn (estado de turno 4-way, 800 clips) | 35.9 | – |
| Gender, 800 utterances reales | 53.1 | 51.7 |
| Emotion, 4-way, 800 utterances | 28.1 | 28.5 |

Puntuaciones de leaderboard (vease el README de GitHub): idioma principal (media de qa100, ZJU-ML y Easy-Turn) 39.3; paralinguistica (media de genero y emocion) 40.6.

El protocolo del paper usa los prompts originales (un unico orden de opciones, una H200); los defaults de duplexjev 0.2.2 emplean los prompts del paquete con el idioma ajustado al clip. El propio autor advierte que el spoken QA con un LLM pequeno esta limitado por el propio LLM, como muestra la fila de lectura de transcripcion con Falcon-H1-1.5B, y recomienda estos conectores para decisiones cortas y cues de hablante mas que para preguntas de conocimiento abiertas.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, alrededor de 3,8 GB para los 1900 M de parametros; en fp32, unos 7,6 GB; una cuantizacion int8 teorica rondaria 1,9 GB. No se publican pesos cuantizados ni mediciones oficiales de VRAM.
- GPU recomendadas: la model card reporta una medicion en una H200 (bf16) con unos 204 ms por evento de decision; no se listan otras GPU recomendadas.
- Cabe en GPU de consumo: por tamano de pesos, un modelo de 1900 M en bf16 deberia caber en GPU de consumo con 6 GB o mas de VRAM; no obstante, no hay confirmacion oficial ni benchmarks en GPU de consumo.
- Advertencia sobre CPU: Falcon-H1 no es amigable con CPU. Sin kernels Mamba para CPU, transformers usa una ruta de referencia lenta y cada pregunta necesita su propia fila. La medicion reportada es de 100,3 s por evento de decision (10 preguntas, un clip de 4,5 s) en 8 hilos de CPU Xeon Platinum 8558, en fp32 y sin cuantizar.
- Aceleracion en GPU: se recomienda instalar `mamba-ssm` y `causal-conv1d` compilados para la version concreta de torch y CUDA; de lo contrario, el rendimiento cae a la ruta de referencia.
- Opciones de despliegue: la via oficial es la libreria `duplexjev >= 0.2.2` sobre transformers, con el modo `batch` activado automaticamente para Falcon-H1. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 204 ms por evento de decision en una H200 compartida con un trabajo de entrenamiento (bf16); 100,3 s en 8 hilos de CPU (fp32). No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuplexJev-B-MOSS-Transcribe-Falcon-H1-1.5B | 1900 M totales (conector 37,8 M entrenable) | no disponible | Conector de decisiones tipadas sobre encoder y LLM congelados | Apache-2.0 (conector) | HuggingFace y GitHub de duplexjev |
| DuplexJev-B-Para-MOSS-Transcribe-Falcon-H1-1.5B | no disponible en la informacion | no disponible | Misma base, con entrenamiento paralinguistico adicional | no disponible en la informacion | HuggingFace |
| tiiuae/Falcon-H1-1.5B-Instruct | 1.5 B | no disponible en la informacion | LLM hibrido atencion + Mamba | TII Falcon License 2.0 | HuggingFace (modelo base congelado de esta ficha) |
| Conectores DuplexJev con Qwen3-32B | no disponible en la informacion | no disponible | Misma receta sobre un LLM mayor | no disponible en la informacion | Publicados con el paper |

El modelo base Falcon-H1-1.5B-Instruct funciona aqui como componente congelado, no como alternativa directa. La comparativa mas util dentro de la familia es con la variante "Para" (entrenada tambien en paralinguistica) y con los conectores Qwen3-32B del paper, pero los datos concretos de ambos no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluado unicamente sobre habla leida o actuada y conjuntos de prueba pequenos (entre 100 y 800 elementos); no se ha probado con entrada en streaming.
- Los LLM pequenos responden mal a preguntas de conocimiento incluso partiendo de la transcripcion, como refleja la diferencia entre la fila de lectura de transcripcion (73) y el resultado del conector (50-56).
- Las etiquetas de emocion provienen de corpus actuados; el autor advierte explicitamente de no usar las salidas para tomar decisiones sobre personas.
- Esta variante "B" solo entrena alineamiento de contenido (R1-R2, destilacion de transcripcion) y no entrena paralinguistica: genero y emocion quedan al azar (51,7-53,1 y 28,1-28,5, cercanos al azar para clasificacion binaria y de 4 clases respectivamente).
- El conector solo funciona con el encoder y el LLM listados (MOSS-Transcribe-Diarize-Whisper-Encoder y Falcon-H1-1.5B); no es intercambiable con otros modelos.
- Licencia: los pesos del conector son Apache-2.0, pero algunos corpus de entrenamiento (por ejemplo, WenetSpeech y CoVoST 2) tienen licencia solo para uso no comercial. Hay que revisarlos antes de un uso comercial. Ademas, Falcon-H1-1.5B se rige por TII Falcon License 2.0, no por Apache-2.0.
- Rendimiento en CPU muy pobre sin kernels Mamba; el propio autor describe Falcon-H1 como no amigable con CPU.
- No se publican pesos cuantizados ni instrucciones de despliegue en servidores de inferencia habituales, lo que limita su uso directo en produccion a gran escala.
- Riesgo de alucinacion: al ser un clasificador de conjunto cerrado sobre opciones declaradas, las salidas quedan restringidas a las etiquetas, pero la calidad depende de que las preguntas y opciones sean pertinentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adventists-ai/DuplexJev-B-MOSS-Transcribe-Falcon-H1-1.5B
- Variante paralinguistica: https://huggingface.co/adventists-ai/DuplexJev-B-Para-MOSS-Transcribe-Falcon-H1-1.5B
- Encoder de audio repaquetado: https://huggingface.co/adventists-ai/MOSS-Transcribe-Diarize-Whisper-Encoder
- LLM congelado: https://huggingface.co/tiiuae/Falcon-H1-1.5B-Instruct
- Modelo base del encoder: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio de codigo: https://github.com/adventists-ai/duplexjev
- Organizacion en GitHub: https://github.com/adventists-ai
- Blog de Falcon-H1: https://falcon-lm.github.io/blog/falcon-h1/
- Documentacion de FalconH1 en transformers: https://huggingface.co/docs/transformers/main/en/model_doc/falcon_h1
- Cita del paper (submitted to IEEE ICASSP 2027): Jin, Jie; Ma, Ziyin; Yin, Min; Chen, Jinyu; Song, Haigang; Pang, Zhikun; Zhang, Xiaowen. "Batched Speech Decisions Without Decoding: Single-Token Supervision Lets a Frozen LLM Hear Beyond the Transcript".
