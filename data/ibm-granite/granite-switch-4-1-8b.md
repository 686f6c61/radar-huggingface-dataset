# ibm-granite/granite-switch-4.1-8b

## Resumen

Granite Switch 4.1 8B es un LLM modular publicado por IBM (organizacion ibm-granite) que combina un modelo base, varios adaptadores y un codificador de audio dentro de un unico endpoint. El objetivo es que una sola instancia servida pueda alternar entre generacion de texto natural, decisiones generales o especializadas y transcripcion de voz a texto, sin necesidad de levantar servicios separados. Su arquitectura se apoya en el modelo `ibm-granite/granite-4.1-8b` (8B parametros, 128K de contexto) y suma dos adaptadores aLoRA, `decision` y `guardian-core`, mas un encoder de habla.

Los adaptadores se activan bajo demanda mediante tokens de control insertados en la plantilla de chat, de modo que el enrutado entre capacidades no requiere cambiar de modelo ni de API. El checkpoint completo contiene 8.776.400.896 parametros segun los pesos safetensors publicados, con un tamano de repositorio de 17,6 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones de atribucion mas alla de las habituales.

Es relevante ahora porque consolida en un solo despliegue tres funciones que historicamente exigian infraestructuras distintas: inferencia conversacional, clasificacion/decision con logits interpretables y ASR. La fecha de publicacion indicada es el 14 de octubre de 2026 y los backends soportados son HuggingFace Transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM modular: transformer base (`granite-4.1-8b`) + adaptadores aLoRA + encoder de habla conformer CTC |
| Parametros totales | 8.776.400.896 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el encoder de audio es solo ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es un transformer monolítico, sino una composicion: el motor principal es `ibm-granite/granite-4.1-8b` con 8B parametros y 128K de contexto, sobre el que se montan dos adaptadores aLoRA y se acopla un encoder de audio. Los adaptadores son `decision`, orientado a decisiones de proposito general, y `guardian-core`, procedente de `granitelib-guardian-r1.0`, orientado a la deteccion de riesgos de seguridad. El componente de audio es `ibm-granite/granite-speech-5.0-470m-turboctc`, un encoder conformer CTC no autorregresivo de 470M parametros, entrenado solo en ingles y descrito por el autor como el modelo ASR mas rapido de la OpenASR Leaderboard.

La activacion de cada adaptador se controla con tokens de control en la plantilla de chat, y la composicion se puede reproducir con la herramienta `granite-switch` mediante el comando `python -m granite_switch.composer.compose_granite_switch`, indicando el modelo base, las librerias de adaptadores (`granitelib-guardian-r1.0` y `granitelib-core-r1.0`), `--include-adapters guardian-core decision` y `--enable-audio`. Un detalle tecnico importante: el encoder de habla y el LLM no han sido entrenados de forma conjunta y todavia no existe una proyeccion entrenada que los acople; la transcripcion se empalma en el contexto de chat sustituyendo la parte de audio. No se han publicado en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en multiples turnos, heredada del modelo base de 8B parametros.
- Decision general: dado un estado y una pregunta con opciones etiquetadas, devuelve una distribucion softmax sobre las etiquetas en un unico forward pass (adaptador `decision`).
- Moderacion y seguridad: deteccion de riesgos como dano, jailbreaking, lenguaje soez, violencia, contenido sexual, sesgo social y comportamiento no etico (adaptador `guardian-core`).
- Voz a texto: transcripcion de audio en ingles mediante el encoder Granite Speech 5.0 TurboCTC de 470M parametros.
- Procesamiento integrado: el audio entrante se transcribe en el mismo endpoint y el texto resultante se inserta en el contexto de chat.
- Compatibilidad con el formato de la API de chat completions (endpoint compatible con OpenAI).
- Capacidad multilingue: no disponible en la informacion facilitada.
- Tool calling y function calling: no disponible en la informacion facilitada.
- Razonamiento multi-paso o modo de pensamiento explicito: no disponible en la informacion facilitada.

## Casos de uso

- Enrutado de decisiones en produccion: dado un estado del sistema y un conjunto cerrado de opciones etiquetadas, el adaptador `decision` devuelve probabilidades por opcion en un solo forward pass, lo que permite integrar logica de decision con umbrales calibrados y sin generacion autoregresiva.
- Moderacion de contenido en plataformas: el adaptador `guardian-core` clasifica riesgos (violencia, contenido sexual, sesgo social, jailbreaking) sobre las interacciones de usuario, lo que permite filtrar antes de que el texto llegue al modelo generativo principal.
- Atencion al cliente con entrada de voz: al aceptar audio directamente en el mismo endpoint, se puede transcribir la consulta del usuario y responder en una sola llamada, evitando desplegar un servidor ASR independiente.
- Transcripcion rapida de reuniones o notas de voz en ingles: el encoder conformer CTC no autorregresivo esta optimizado para latencia baja, adecuado para dictado y captura de notas en tiempo real.
- Clasificacion de tickets y triaje: combinando el adaptador de decision con etiquetas predefinidas (categoria, prioridad, equipo responsable), se puede construir un triaje con distribucion de probabilidad auditable.
- Asistentes de voz en ingles: al transcribir audio en el mismo endpoint junto con el LLM, se simplifica la arquitectura de agentes de voz para mercados angloparlantes.
- Construccion de un pipeline unico con API compatible con OpenAI: al exponer un endpoint estilo OpenAI, el modelo puede sustituir a otros servicios en integraciones existentes sin reescribir el cliente.

## Benchmarks y rendimiento

El unico benchmark numerico publicado en la informacion disponible es el Decision Index (version v0.3, subconjunto rapido publico, 1.068 filas), medido con el adaptador `decision` servido en un endpoint vLLM. Las puntuaciones se dan sobre 100.

| Area | Puntuacion |
|---|---|
| Overall | 42,9 |
| Knowledge | 29,1 |
| Language | 48,9 |
| Retrieval | 49,8 |
| Tools | 59,8 |
| Arts | 18,0 |

Segun el autor, las mediciones con el adaptador servido en local y detras de un endpoint vLLM difieren en unos 0,6 puntos, lo que indica que la ruta de servicio es fiel. Ademas, el modelo afirma que el encoder Granite Speech 5.0 TurboCTC es el mas rapido de la OpenASR Leaderboard, pero no se aportan cifras concretas de WER ni de latencia en la informacion disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 18-20 GB solo para los pesos (el repositorio ocupa 17,6 GB), mas overhead de activaciones y cache KV.
- VRAM en cuantizacion de 8 bits: estimacion orientativa de 10-11 GB.
- VRAM en cuantizacion de 4 bits: estimacion orientativa de 6-7 GB. Los tipos de cuantizacion oficiales no estan disponibles en la informacion facilitada.
- GPU recomendadas para precision completa: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 de forma ajustada y con margen en cuantizaciones de 8 o 4 bits; en RTX 3090 (24 GB) aplican las mismas consideraciones.
- Encoder de audio: 470M parametros adicionales, con impacto de VRAM reducido frente al LLM.
- Opciones de despliegue: HuggingFace Transformers y vLLM, segun la model card; el modo audio requiere instalar las dependencias de audio de vLLM (`pip install -e ".[audio]"`).
- Latencia y throughput: no disponible en la informacion facilitada, salvo la afirmacion cualitativa de que el encoder ASR es el mas rapido de la OpenASR Leaderboard.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Adaptadores / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-switch-4.1-8b | 8.776.400.896 | 128K | `decision` y `guardian-core` + ASR | Apache 2.0 | HuggingFace |
| granite-switch-4.1-30b | no disponible | no disponible | misma configuracion (Chat + Decisions + Guardian + speech) sobre base 30B | Apache 2.0 | HuggingFace |
| granite-switch-4.1-8b-preview | no disponible | no disponible | bundle completo de Granite Libraries, sin audio | Apache 2.0 | HuggingFace |
| granite-switch-4.1-30b-preview | no disponible | no disponible | bundle completo de Granite Libraries, sin audio | Apache 2.0 | HuggingFace |
| granite-switch-4.1-3b-preview | no disponible | no disponible | bundle completo de Granite Libraries, sin audio | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion facilitada, mas alla de que comparten la misma configuracion funcional de chat, decisiones, guardian y habla (o su variante sin audio en los previews).

## Limitaciones y advertencias

- El encoder de habla y el LLM no estan entrenados conjuntamente: no existe una proyeccion entrenada que los acople, y la transcripcion se empalma directamente en el contexto de chat. El propio autor remite a `docs/AUDIO.md` para los detalles y limitaciones.
- El componente de audio es solo para ingles y produce salida en minusculas y sin puntuacion; ademas no admite steering en tiempo de decodificacion.
- No se han publicado datos sobre idiomas soportados por el LLM base en la informacion facilitada.
- No hay informacion publica sobre sesgos conocidos, tasa de alucinacion ni comportamiento fuera de distribucion.
- No se aportan numeros de WER, MMLU, HumanEval u otros benchmarks generales, por lo que la evaluacion de calidad queda limitada al Decision Index v0.3.
- El rendimiento del adaptador `decision` es desigual por area: 59,8 en Tools frente a 18,0 en Arts, lo que desaconseja su uso sin calibracion para dominios creativos o artisticos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las dependencias del stack `granite-switch` por separado.
- Al ser un modelo publicado muy recientemente (octubre de 2026) y con solo 278 descargas y 15 likes en HuggingFace, el ecosistema de herramientas, cuantizaciones de terceros y validaciones independientes es todavia reducido.
- La composicion mediante tokens de control en la plantilla de chat implica que un uso incorrecto de esos tokens puede activar el adaptador equivocado o desactivar la funcion prevista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ibm-granite/granite-switch-4.1-8b
- Blog de lanzamiento: https://huggingface.co/blog/ibm-granite/granite-switch-4-1
- Repositorio granite-switch: https://github.com/generative-computing/granite-switch
- Documentacion de audio del repositorio: https://github.com/generative-computing/granite-switch/blob/main/docs/AUDIO.md
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Encoder de habla: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Libreria Guardian: https://huggingface.co/ibm-granite/granitelib-guardian-r1.0/tree/main/guardian-core
- Libreria Core (adaptador decision): https://huggingface.co/ibm-granite/granitelib-core-r1.0/tree/main/decision
- Variante 30B: https://huggingface.co/ibm-granite/granite-switch-4.1-30b
- Variante 8B preview sin audio: https://huggingface.co/ibm-granite/granite-switch-4.1-8b-preview
- Variante 30B preview sin audio: https://huggingface.co/ibm-granite/granite-switch-4.1-30b-preview
- Variante 3B preview sin audio: https://huggingface.co/ibm-granite/granite-switch-4.1-3b-preview
- OpenASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
