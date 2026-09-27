# adventists-ai/DuplexJev-B-MOSS-Transcribe-Qwen3-4B-2507

## Resumen

DuplexJev-B-MOSS-Transcribe-Qwen3-4B-2507 es un conector de audio desarrollado por Adventists.ai que permite a un modelo de lenguaje congelado tomar decisiones tipadas directamente sobre audio hablado, sin ejecutar pasos de decodificacion autoregresiva. El sistema acopla el encoder de audio de MOSS-Transcribe-Diarize (arquitectura Whisper de 24 capas, 307 M de parametros, congelado) con el LLM Qwen3-4B-Instruct-2507 (tambien congelado) mediante un pequeno proyector SwiGLU entrenable de 38,8 M de parametros. La innovacion central es que cada pregunta tipada se lee como una distribucion de un solo token sobre sus opciones, de modo que muchas preguntas se resuelven en una unica pasada forward con cero pasos de decode.

El modelo esta pensado para agentes de voz full-duplex: en lugar de transcribir y luego razonar, responde directamente a decisiones cortas como "ha terminado el usuario de hablar?" o "que intencion tiene?", leyendo el estado del turno y las intenciones de una sola pasada. Resuelve el problema de latencia y coste computacional en agentes conversacionales donde se necesitan muchas decisiones rapidas por turno, agrupandolas en batch.

Es relevante por su enfoque "Speech-to-Decision", que combina un encoder de audio congelado con un conector ligero y un LLM congelado, reduciendo el entrenamiento a un unico componente de 38,8 millones de parametros. Esta variante concreta esta alineada solo en contenido (destilacion de transcripcion) y no tiene entrenamiento paralinguistico, por lo que se posiciona como punto de partida para ajuste fino propio. La ficha cubre los datos disponibles publicamente; algunos apartados tecnicos no estan detallados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conector sobre encoder-transformador (Whisper, 24 capas) + LLM transformer (Qwen3) con proyector SwiGLU |
| Parametros totales | 4368 M (encoder 307 M + LLM ~4B + conector); el conector entrenable tiene 38.807.552 parametros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 y bf16 documentados; no se mencionan formatos GGUF/AWQ/GPTQ cuantizados |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (pesos del conector); los corpus de entrenamiento pueden tener licencias no comerciales |
| Formato de pesos | safetensors, con custom_code (requiere el paquete duplexjev) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 y OpenMOSS-Team/MOSS-Transcribe-Diarize |
| Pipeline | audio-text-to-text |
| Biblioteca | transformers |
| Tamano del repo | 0,1 GB (solo el conector) |

## Arquitectura y entrenamiento

La arquitectura del conector toma la ultima capa del encoder de audio (Whisper de 24 capas, 307 M de parametros, congelado) y aplica un apilado de frames (stacking) seguido de un proyector SwiGLU, etiquetado como variante "B". Los frames del encoder a 50 Hz se agrupan de 8 en 8, produciendo 6,25 tokens de audio por segundo. Estos tokens se inyectan en el LLM Qwen3-4B-Instruct-2507, que permanece congelado. El conector entrena con supervision de un solo token: cada pregunta tipada se lee como una distribucion sobre sus opciones, de manera que no se generan pasos de decodificacion.

El entrenamiento congela tanto el encoder como el LLM y solo ajusta el conector (38,8 M parametros). Se usa destilacion de transcripcion en dos etapas (R1 y R2) sobre dos paquetes disjuntos de 0,5 millones de utterances cada uno, extraidos de la mezcla de Ultravox v0.6, con 32.000 pasos por etapa y batch global de 16. La receta sigue la del articulo, la misma empleada en los conectores basados en Qwen3-32B publicados con el paper. Esta variante esta alineada solo en contenido y carece de entrenamiento paralinguistico, por lo que el genero y la emocion se situan en el nivel del azar.

## Capacidades

- Decisiones tipadas sobre audio hablado: lee la respuesta como una distribucion de un token sobre las opciones de una pregunta cerrada.
- Clasificacion del estado de turno (por ejemplo, si el usuario ha terminado de hablar) en esquemas de 2 y 4 clases.
- Deteccion de intencion: asignacion de utterances a categorias cerradas como clima, medios, navegacion, telefono o charla.
- Procesamiento por lotes de multiples preguntas en una sola pasada forward (10 preguntas por evento de decision).
- Soporte bilingue de audio y de preguntas en chino e ingles.
- Transcripcion implicita: el conector se entrena con destilacion de transcripcion, pero el resultado observable es la decision, no la transcripcion.
- Cues de hablante (speaker cues) segun la descripcion del modelo, orientado a decisiones cortas.
- No dispone de entrenamiento paralinguistico: no hay deteccion fiable de genero ni emocion.

## Casos de uso

- Deteccion de fin de turno en agentes de voz full-duplex: el modelo decide si el usuario ha terminado de hablar leyendo el estado del turno en una pasada, lo que permite gestionar la alternancia de turnos con baja latencia (unos 154 ms por evento en H200).
- Clasificacion de intenciones en asistentes conversacionales: a partir de una utterance, asigna la intencion a categorias predefinidas como clima, medios o navegacion, agrupando varias preguntas en un solo forward.
- Enrutado de llamadas en atencion al cliente: decide la intencion y el estado del turno de forma conjunta para derivar la llamada al flujo adecuado sin esperar a una transcripcion completa.
- Interaccion por voz en dispositivos edge: el conector ligero (0,1 GB) combinado con el LLM de 4B puede desplegarse en hardware modesto, resolviendo decisiones cortas en lugar de generar texto largo.
- Control por voz en automocion: la etiqueta de intencion permite mapear comandos de voz sobre un conjunto cerrado de acciones (clima, medios, navegacion, telefono) con un coste de un token por decision.
- Punto de partida para ajuste fino de decisiones especificas: al estar alineado solo en contenido, sirve como base para entrenar conectores propios sobre decisiones concretas de un dominio.
- Evaluacion y monitorizacion de dialogos hablados: uso de las decisiones de estado de turno e intencion para anotar grandes volumenes de clips en batch.

## Benchmarks y rendimiento

Los resultados publicados en la model card se presentan bajo dos protocolos: el del articulo (prompts del paper, un solo orden de opciones, una H200) y los valores por defecto del paquete duplexjev 0.2.2 (prompts propios con `lang` ajustado al clip). Las cifras son porcentajes de acierto.

| Evaluacion (%) | Protocolo del paper | duplexjev 0.2.2 |
|---|---:|---:|
| qa100 (QA hablada) | 71 | 72 |
| qa100, Qwen3-4B-2507 leyendo la transcripcion | 84 | – |
| ZJU-ML (QA hablada, real + TTS) | 48 | – |
| Easy-Turn (estado de turno 4 clases, 800 clips) | 60,2 | – |
| Genero, 800 utterances reales | 54,4 | 53,4 |
| Emocion, 4 clases, 800 utterances | 29,1 | 30,8 |

Puntuaciones de leaderboard (recogidas en el README de GitHub): idioma principal (media de qa100, ZJU-ML y Easy-Turn) 59,7; paralinguistica (media de genero y emocion) 41,8.

Latencia de un evento de decision (10 preguntas, un clip de 4,5 s, duplexjev 0.2.2, PyTorch puro): 6,2 s en 8 hilos de CPU (Xeon Platinum 8558, fp32, sin cuantizar) y aproximadamente 154 ms en una H200 (bf16, medida con la GPU compartida con un trabajo de entrenamiento).

## Requisitos de hardware

- VRAM estimada (derivada del recuento de parametros, no publicada por el autor): el sistema completo suma 4368 M parametros; en bf16 equivale a unos 8,7 GB de pesos y en fp32 a unos 17,5 GB, mas activaciones.
- GPU recomendadas: H200 para latencia minima (154 ms por evento de decision, bf16). Cualquier GPU con al menos 12-16 GB de VRAM puede alojar el sistema completo en bf16.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 16-24 GB (por ejemplo RTX 4090 de 24 GB) en bf16; no hay confirmacion explicita del autor sobre este punto.
- CPU: funciona en PyTorch puro (6,2 s por evento de decision con 8 hilos en un Xeon Platinum 8558, fp32, sin cuantizar).
- Opciones de despliegue: la model card usa la biblioteca transformers y el paquete duplexjev (custom_code). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; el uso de custom_code puede limitar estos motores.
- Latencia: unos 154 ms por evento de 10 preguntas en H200 (bf16) y 6,2 s en CPU. No se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone de resultados de terceros comparables medidos bajo el mismo protocolo. La model card menciona conectores basados en Qwen3-32B publicados con el mismo articulo; la comparativa siguiente recoge solo lo documentado.

| Modelo | Parametros del sistema | Conector entrenable | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| DuplexJev-B-MOSS-Transcribe-Qwen3-4B-2507 (este) | 4368 M | 38,8 M | zh, en | Apache-2.0 | Alineado solo en contenido; LLM base Qwen3-4B |
| Conectores DuplexJev con Qwen3-32B (mismo articulo) | no disponible | no disponible | no disponible | no disponible | Misma receta; escala de LLM mayor |
| Qwen3-4B-Instruct-2507 (modelo base) | ~4B | – | multilingue | Apache-2.0 | Solo texto; sin entrada de audio |
| MOSS-Transcribe-Diarize (modelo base del encoder) | no disponible | – | no disponible | Apache-2.0 | Proporciona el encoder de audio |

## Limitaciones y advertencias

- Evaluado sobre habla leida o actuada y conjuntos de test pequenos (100 a 800 elementos); no se ha evaluado con entrada en streaming.
- Los LLM pequenos responden mal a preguntas de conocimiento incluso leyendo la transcripcion (84% en qa100 solo al leer el texto frente a 72% de este conector).
- Esta variante esta alineada solo en contenido: el genero y la emocion se situan en el nivel del azar (54,4% y 29,1%), por lo que no deben usarse esas salidas para tomar decisiones sobre personas.
- Las etiquetas de emocion provienen de corpus actuados, lo que limita su validez en produccion.
- El conector solo funciona con el encoder y el LLM especificados; no es intercambiable con otros modelos.
- Licencia Apache-2.0 para los pesos del conector, pero algunos corpus de entrenamiento (por ejemplo WenetSpeech o CoVoST 2) tienen licencia solo para uso no comercial; hay que verificarlos antes de un uso comercial.
- Los modelos congelados conservan sus propias licencias: Qwen3-4B-2507 (Apache-2.0) y el encoder (Apache-2.0).
- El uso requiere custom_code y el paquete duplexjev, lo que puede complicar el despliegue en motores de inferencia estandar.
- Riesgo de alucinacion: no se documenta de forma especifica, pero al apoyarse en un LLM congelado puede heredar sus sesgos; la model card no detalla sesgos conocidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adventists-ai/DuplexJev-B-MOSS-Transcribe-Qwen3-4B-2507
- Repositorio GitHub: https://github.com/adventists-ai/duplexjev
- Encoder de audio repaquetado: https://huggingface.co/adventists-ai/MOSS-Transcribe-Diarize-Whisper-Encoder
- Modelo base del LLM: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base del encoder: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Perfil de la organizacion en HuggingFace: https://huggingface.co/adventists-ai/models
- Perfil de la organizacion en GitHub: https://github.com/adventists-ai
- Sitio web de Adventists.ai: https://adventists.ai/
- Cita del articulo: Jin, J. et al. "Batched Speech Decisions Without Decoding: Single-Token Supervision Lets a Frozen LLM Hear Beyond the Transcript", enviado a IEEE ICASSP, 2027.
