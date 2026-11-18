# ibm-granite/granite-speech-5.0-2b

## Resumen

Granite Speech 5.0 2B es un modelo compacto de voz-lenguaje desarrollado por IBM (familia `ibm-granite`) diseñado especificamente para reconocimiento automatico del habla (ASR) multilingue y traduccion automatica del habla (AST) bidireccional. Cubre ingles, frances, aleman, espanol, portugues y japones, y se construye alineando modalidades sobre un checkpoint intermedio de `granite-4.0-1b-base`, anadiendo un codificador de audio y proyecciones para procesar entrada de voz y producir texto.

El modelo llega como sucesor de `granite-speech-4.1-2b` manteniendo el mismo numero de parametros (2.313 millones) pero incorporando mejoras concretas: mayor precision en ASR de formato corto en ingles, mayor robustez frente a ruido, reverberacion y microfonos lejanos, soporte de *prompting* de identificacion de idioma de entrada, mejor traduccion de habla conversacional y de formato largo, y ampliacion del tamano de lista de palabras clave hasta 2000 terminos para ASR y AST con sesgo por palabras clave (keyword biasing).

Su relevancia actual radica en que ofrece capacidades de voz a texto y traduccion de voz con licencia Apache 2.0, un tamano contenido que permite despliegue en hardware modesto y un enfoque empresarial explicito, lo que lo hace atractivo para pipelines de transcripcion y localizacion sin dependencia de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo voz-lenguaje (codificador de audio + LLM `granite-4.0-1b-base` alineado por modalidad) |
| Parametros totales | 2.313.207.132 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (recomendado transcribir en segmentos de hasta ~2 minutos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | Ingles, frances, aleman, espanol, portugues, japones (ASR y AST); salida adicional a italiano y mandarin desde ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de alineacion de modalidades: parte de un checkpoint intermedio de `granite-4.0-1b-base` y lo alinea con voz sobre corpus publicos de audio y texto. El pipeline declarado es `automatic-speech-recognition` y se integra de forma nativa en `transformers>=4.52.1` mediante `AutoModelForSpeechSeq2Seq` y `AutoProcessor`. La entrada de audio se procesa a 16 kHz mono, y el prompt de usuario se construye con el token especial `<|audio|>` seguido de instrucciones en lenguaje natural (por ejemplo, "transcribe the speech with proper punctuation and capitalization").

El entrenamiento empleo 390.000 horas de audio provenientes de corpus publicos para ASR y AST, complementadas con datasets sinteticos orientados a ASR de japones, ASR con sesgo por palabras clave y traduccion de habla. Entre las innovaciones destacables figuran el soporte de *keyword biasing* con listas de hasta 2000 terminos, el *prompting* de identificacion de idioma de entrada y la capacidad de generar puntuacion y capitalizacion correctas en la transcripcion. La model card no detalla el uso de RLHF o DPO, por lo que ese dato no esta disponible.

## Capacidades

- Reconocimiento automatico del habla (ASR) multilingue en ingles, frances, aleman, espanol, portugues y japones.
- Traduccion automatica del habla (AST) bidireccional entre esos idiomas y el ingles; salida adicional de ingles a italiano y mandarin.
- Puntuacion y capitalizacion automaticas en la transcripcion (evaluadas con PER y Cap-F1).
- ASR con sesgo por palabras clave (*keyword-biased ASR*) con listas de hasta 2000 terminos.
- AST con sesgo por palabras clave.
- *Prompting* de identificacion de idioma de entrada para ASR multilingue.
- Robustez mejorada frente a ruido, reverberacion y habla captada por microfono lejano.
- Manejo de habla de formato largo y conversacional (procesando en segmentos de hasta ~2 minutos).
- No se documentan capacidades de tool calling, agentes, vision ni audio de salida en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo genera texto con puntuacion y capitalizacion, lo que reduce el postprocesado; se segmenta el audio con VAD en bloques de hasta ~2 minutos para reuniones largas.
- Subtitulado y localizacion de contenido audiovisual: la AST bidireccional permite generar subtitulos en ingles desde espanol, frances, aleman, portugues o japones (y viceversa) en un solo paso.
- Atencion al cliente por voz: transcripcion multilingue de llamadas con robustez frente a microfonos lejanos y reverberacion, adecuada para centros de contacto con audio telefónico.
- Dominios con vocabulario especializado (medico, legal, industrial): el *keyword biasing* con hasta 2000 terminos permite forzar la transcripcion correcta de nombres propios, farmacos o referencias tecnicas.
- Transcripcion de contenido en japones: el entrenamiento con datasets sinteticos especificos para japones cubre un idioma habitualmente peor atendido por modelos ASR abiertos.
- Traduccion de entrevistas y material de investigacion: la AST permite convertir grabaciones en espanol o portugues a texto en ingles para analisis posterior, manteniendo el flujo en un unico modelo.
- Despliegue en entornos con recursos limitados: con 2.313 millones de parametros y licencia Apache 2.0, es viable en infraestructura propia sin depender de APIs externas.

## Benchmarks y rendimiento

La model card referencia resultados en el Open ASR Leaderboard (a 21 de octubre de 2026), el FFASR leaderboard (18 de octubre de 2026), CommonVoice, CoVoST y FLEURS, presentados como graficos e imagenes no transcritos en la informacion disponible. Los unicos valores numericos explicitos son los de puntuacion y capitalizacion:

| Test set | PER 4.1-2b (menor mejor) | PER 5.0-2b (menor mejor) | Cap-F1 4.1-2b (mayor mejor) | Cap-F1 5.0-2b (mayor mejor) |
|---|---|---|---|---|
| LScln | 25,70 | 23,20 | 89,71 | 90,16 |
| LSoth | 22,27 | 21,22 | 91,26 | 91,65 |
| VoxPopuli | 24,86 | 23,70 | 95,35 | 95,07 |
| Earnings-22 | 22,87 | 21,64 | 95,19 | 94,98 |
| CV-EN | 9,13 | 9,18 | 96,75 | 96,96 |
| CV-DE | 3,66 | 3,65 | 99,50 | 99,51 |
| CV-ES | 11,61 | 11,46 | 95,68 | 95,62 |
| CV-FR | 11,00 | 11,43 | 97,25 | 97,20 |
| CV-PT | 7,86 | 7,53 | 98,51 | 98,48 |

No se han publicado en la informacion disponible los valores numericos de WER en el Open ASR Leaderboard, FFASR, CommonVoice ni los BLEU de CoVoST/FLEURS; solo se aportan como graficos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2.313 millones de parametros en bfloat16 el peso ronda los 4,6 GB, mas overhead del codificador de audio y de activaciones, por lo que se estima un consumo moderado no confirmado por el autor.
- GPU recomendadas: no especificadas en la informacion disponible; el ejemplo oficial usa `device_map` y `torch_dtype=torch.bfloat16` con CUDA.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamano, es plausible en GPUs consumer con suficiente memoria, pero no hay dato oficial.
- Opciones de despliegue: `transformers>=4.52.1` (via `AutoModelForSpeechSeq2Seq` y `AutoProcessor`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Capacidades | Licencia |
|---|---|---|---|---|
| granite-speech-5.0-2b | 2.313 millones | en, fr, de, es, pt, ja | ASR + AST bidireccional, keyword biasing, puntuacion | Apache 2.0 |
| granite-speech-4.1-2b | mismo orden (no confirmado) | no disponible | ASR + AST, keyword biasing (menor tamano de lista) | Apache 2.0 (no confirmado) |
| Otros modelos ASR/AST abiertos | no disponible | no disponible | no disponible | no disponible |

La model card menciona comparaciones frente a "otros modelos voz-lenguaje y sistemas ASR/AST dedicados" en los graficos de CommonVoice, CoVoST y FLEURS, pero no se identifican por nombre ni se aportan cifras en el texto disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; no hay informacion disponible al respecto.
- Riesgo de alucinacion: no cuantificado por el autor; como todo modelo generativo de voz a texto, puede producir contenido no presente en el audio.
- El contexto de audio esta limitado en la practica: se recomienda segmentar en bloques de hasta ~2 minutos, lo que exige preprocesado (por ejemplo, VAD) en grabaciones largas.
- Cobertura limitada a seis idiomas para ASR/AST; el resto de idiomas no estan soportados oficialmente.
- La evaluacion de capitalizacion en aleman se justifica por la exigencia de mayusculas en sustantivos, pero el resto de metricas de idiomas no alemanes pueden no reflejar convenciones locales.
- Uso previsto restringido a aplicaciones empresariales de procesamiento de voz; no se detallan restricciones adicionales bajo Apache 2.0, pero conviene revisar la licencia para casos de uso comercial.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse que las tenga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Predecesor: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FFASR Leaderboard: https://huggingface.co/spaces/treble-technologies/ffasr
- Paper LibriSpeech-PC (referencia de metricas PER/Cap-F1): https://arxiv.org/abs/2310.02943
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Referencias arXiv adicionales citadas en los tags: arxiv:2505.08699, arxiv:2603.11243, arxiv:2604.12398, arxiv:2604.22817, arxiv:2604.11269, arxiv:2603.08397 (contenido no verificado en la informacion disponible)
