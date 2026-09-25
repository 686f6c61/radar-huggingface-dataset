# adventists-ai/DuplexJev-B-Whisper-small-Qwen3-1.7B

## Resumen

DuplexJev-B-Whisper-small-Qwen3-1.7B es un conector multimodal de tipo speech-to-decision desarrollado por Adventists.ai. Combina un encoder de audio Whisper-small congelado con un LLM Qwen3-1.7B también congelado, unidos por un proyector SwiGLU entrenable de 29,4 millones de parámetros. Su particularidad es que no genera texto: cada pregunta tipada (por ejemplo, "¿ha terminado de hablar el usuario?") se lee como una distribución sobre sus opciones en un único token, sin pasos de decodificación autoregresiva y con muchas preguntas resueltas en una sola pasada forward.

El modelo resuelve el problema de la toma de decisiones rápidas y en lote sobre audio para agentes de voz full-duplex: detección de fin de turno, clasificación de intención o lectura de señales paralingüísticas sin coste de decodificación. Es la variante de tamano "edge" de la familia DuplexJev, cuyos conectores mayores usan Qwen3-32B, y se entrena con la misma receta de destilación de transcripciones descrita en el paper asociado.

Esta variante concreta se ha entrenado únicamente con alineamiento de contenido (R1–R2, destilación de transcripciones), sin entrenamiento paralingüístico: el autor indica explícitamente que género y emoción quedan a nivel de azar. Se posiciona por tanto como punto de partida para fine-tuning propio orientado a decisiones, no como modelo de conocimiento abierto ni como clasificador emocional listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio Whisper-small (congelado) + frame stacking + proyector SwiGLU (conector entrenable) + LLM Qwen3-1.7B (congelado); pipeline audio-text-to-text |
| Parametros totales | 1838 M según la model card (encoder + LLM + conector); el repositorio safetensors contiene 29.368.320 parametros (pesos del conector) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; la model card indica que las NPU on-device y la cuantizacion no se han probado todavia |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 para los pesos del conector; los modelos base conservan sus propias licencias; algunos corpus de entrenamiento (WenetSpeech, CoVoST 2) son solo de uso no comercial |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |
| Tokens de audio | Whisper a 50 Hz, 8 frames apilados -> 6,25 tokens de audio por segundo |
| Parametros entrenables | 29,4 M (solo el conector) |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje de tres piezas con dos de ellas congeladas. El encoder de `openai/whisper-small` procesa el audio a 50 Hz y su ultima capa se conecta mediante un frame stacking de 8 frames y un proyector SwiGLU, lo que reduce la tasa a 6,25 tokens de audio por segundo. Esos tokens se inyectan en `Qwen/Qwen3-1.7B` congelado. La innovacion clave es la lectura tipada de un solo token: en lugar de decodificar texto libre, cada `Question` con sus opciones se convierte en una distribución sobre las alternativas, de modo que un unico forward pass resuelve multiples preguntas sobre un mismo clip sin ningun paso de generacion.

El entrenamiento sigue la receta del paper DuplexJev: encoder y LLM permanecen congelados y solo se entrena el conector mediante destilacion de transcripciones en dos fases (R1 y R2) sobre dos paquetes disjuntos de 0,5 millones de enunciados cada uno, extraidos de la mezcla Ultravox v0.6, con 32.000 pasos por fase y batch global de 16. No se menciona uso de RLHF ni DPO. Esta variante concreta se limita al alineamiento de contenido: no ha recibido entrenamiento paralinguistico, de ahi que las salidas de genero y emocion queden en el nivel del azar.

## Capacidades

- Decisiones de audio tipadas en un solo token: fin de turno (hablando / no hablando), intencion del usuario, o cualquier taxonomia definida por el desarrollador mediante opciones discretas.
- Multiples preguntas por pasada forward: la model card reporta 10 preguntas resueltas en un unico forward pass sobre un clip de 4,5 s.
- Comprension de voz en chino e ingles, con preguntas y opciones formuladas en el idioma correspondiente.
- Clasificacion de intencion con taxonomias personalizadas (el ejemplo del autor incluye clima, medios, navegacion, telefono y charla informal).
- Base para fine-tuning de decisiones especificas: al entrenarse solo el conector, es un punto de partida ligero para anadir tareas propias.
- Alineamiento de contenido con transcripcion: la fila de control de la model card muestra que Qwen3-1.7B leyendo la transcripcion alcanza un 66 % en qa100, frente al 48 % del conector en el protocolo del paper.
- No soporta tool calling ni function calling: no hay ninguna referencia a ello en la informacion disponible.
- No hay evidencia de capacidades de agente multi-paso, vision ni audio generativo.
- Las capacidades paralinguisticas (genero, emocion) no estan operativas en esta variante: 47,5 % en genero y 30,4 % en emocion de 4 clases segun el protocolo del paper, valores compatibles con el azar.

## Casos de uso

- Deteccion de fin de turno en agentes de voz full-duplex: la pregunta "¿ha terminado de hablar el usuario?" se resuelve como una decision binaria en un unico token, con 42 ms por evento de 10 preguntas en una H200, lo que permite integrarla en el bucle de barge-in de un asistente telefonico.
- Enrutado de intencion en asistentes domoticos o de automocion: el ejemplo del autor define las clases clima, medios, navegacion, telefono y charla informal, de modo que el enrutador decide el dominio antes de invocar cualquier skill posterior.
- Clasificacion en lote para analitica de llamadas: al resolver multiples preguntas por forward pass, un lote de clips puede etiquetarse con varias taxonomias simultaneamente sin coste de decodificacion autoregresiva.
- Preprocesado de bajo coste en pipelines de ASR: usar el modelo como filtro previo para decidir si un segmento merece transcripcion completa, reduciendo el gasto computacional en colas de audio largas.
- Despliegue en el borde: con 1838 M de parametros totales, el modelo cabe en una GPU consumer o puede ejecutarse en CPU (2351 ms por evento con 8 hilos Xeon Platinum 8558 en fp32), lo que lo hace viable en dispositivos sin acelerador dedicado.
- Base para fine-tuning de decisiones verticales: dado que solo el conector es entrenable (29,4 M de parametros) y que el autor lo presenta como punto de partida, un equipo puede adaptar la taxonomia a dominios como triaje medico telefonico o soporte tecnico sin reentrenar el LLM.
- Control de dialogo en sistemas de voz embebidos: la decision de turno leida directamente del estado interno del LLM congelado evita depender de un VAD externo y de umbrales manuales de silencio.
- Investigacion en representaciones de audio: el diseno permite estudiar cuanto contenido linguistico retiene un encoder Whisper proyectado sobre un LLM pequeno, comparando la lectura del conector con la lectura de la transcripcion (48 % frente a 66 % en qa100).

## Benchmarks y rendimiento

| Evaluacion (%) | Protocolo del paper | Defaults de duplexjev 0.2.1 |
|---|---:|---:|
| qa100 (QA hablado) | 48 | 42 |
| qa100, Qwen3-1.7B leyendo la transcripcion | 66 | – |
| ZJU-ML (QA hablado, real + TTS) | 32 | – |
| Genero, 800 enunciados reales | 47,5 | 52,4 |
| Emocion, 4 clases, 800 enunciados | 30,4 | 28,9 |

Datos de referencia de los conectores mayores con Qwen3-32B, citados en la propia model card: 90 en qa100, 89,9 en genero y 90,0 en emocion. El autor advierte que el QA hablado con un LLM pequeno es muy sensible a la formulacion del prompt y esta acotado por el propio LLM, por lo que recomienda estos conectores para decisiones cortas y senales del hablante, no para preguntas de conocimiento abierto. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 3,7 GB para los 1838 M de parametros totales (encoder Whisper-small + Qwen3-1.7B + conector); en fp32, aproximadamente 7,4 GB. Los pesos almacenados en el repositorio (solo el conector, 29,4 M) ocupan unos 118 MB en bf16.
- GPU recomendadas: una H200 es la plataforma usada en las mediciones del autor; cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) deberia alojar el modelo en bf16 o fp16.
- Cabe en GPU consumer: si, segun el propio autor ("fits on one small GPU or CPU"); tambien es ejecutable en CPU, con 2351 ms por evento de 10 preguntas en 8 hilos de un Xeon Platinum 8558 en fp32 sin cuantizar.
- Opciones de despliegue: el paquete oficial `duplexjev>=0.2.1` con PyTorch (`Decider.from_pretrained`), y carga mediante `transformers` con `custom_code`. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, ni sobre formatos GGUF.
- Latencia y throughput: 42 ms por evento de decision (10 preguntas, clip de 4,5 s, un forward pass, PyTorch estandar, bf16, una H200). En CPU, 2351 ms en el mismo escenario. No se han probado NPU on-device ni cuantizacion, por lo que no hay cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | qa100 | Genero | Emocion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DuplexJev-B-Whisper-small-Qwen3-1.7B (este) | 1838 M (29,4 M entrenables) | No disponible | 48 (papel) / 42 (defaults) | 47,5 / 52,4 | 30,4 / 28,9 | Apache-2.0 (conector) | HuggingFace |
| Conectores DuplexJev con Qwen3-32B | No disponible | No disponible | 90 | 89,9 | 90,0 | No disponible en la informacion | HuggingFace (organizacion adventists-ai) |
| DuplexJev-B-Emotion-Qwen3-ASR-0.6B-Qwen3-32B | No disponible | No disponible | No disponible | No disponible | No disponible | cc-by-nc-4.0 | HuggingFace |
| openai/whisper-small (encoder base) | 244 M | No aplica | No aplica | No aplica | No aplica | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-1.7B (LLM base) | 1,7 B | No disponible | No disponible | No aplica | No aplica | No disponible en la informacion | HuggingFace |

La comparacion con los conectores de Qwen3-32B es la mas directa en cuanto a receta de entrenamiento y tarea, y muestra una diferencia de rendimiento muy marcada (48 frente a 90 en qa100) a cambio de un coste de inferencia mucho menor. El resto de alternativas son los componentes congelados, no modelos equivalentes de la misma categoria.

## Limitaciones y advertencias

- Evaluado sobre habla leida o actuada y conjuntos de prueba pequenos (entre 100 y 800 elementos); no se ha evaluado con entrada en streaming.
- Sin entrenamiento paralinguistico en esta variante: genero y emocion quedan practicamente a nivel de azar (47,5 % y 30,4 % en el protocolo del paper), por lo que no deben usarse como clasificadores fiables.
- Los LLM pequenos responden mal a preguntas de conocimiento incluso leyendo la transcripcion (66 % en qa100 para el propio Qwen3-1.7B), lo que acota el techo de la tarea de QA hablado.
- Alta sensibilidad a la formulacion del prompt: el mismo modelo pasa de 48 % a 42 % en qa100 segun se usen los prompts del paper o los del paquete, y de 47,5 % a 52,4 % en genero.
- Las etiquetas de emocion proceden de corpus actuados; el autor advierte explicitamente de que no deben usarse las salidas para tomar decisiones sobre personas.
- El conector solo funciona con el encoder `openai/whisper-small` y el LLM `Qwen/Qwen3-1.7B` indicados; no es intercambiable.
- Licencia: Apache-2.0 cubre unicamente los pesos del conector. Los modelos base mantienen sus propias licencias y algunos corpus de entrenamiento (WenetSpeech, CoVoST 2) son solo de uso no comercial, por lo que hay que revisarlos antes de un uso comercial.
- No hay soporte documentado de tool calling, agentes multi-paso ni cuantizacion; las NPU on-device no se han probado.
- Riesgo de alucinacion: al no generar texto libre, el riesgo se traslada a la seleccion erronea de opciones, que puede producirse de forma silenciosa y sin senal de confianza documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adventists-ai/DuplexJev-B-Whisper-small-Qwen3-1.7B
- Organizacion en HuggingFace: https://huggingface.co/adventists-ai
- Repositorio de codigo: https://github.com/adventists-ai/duplexjev
- Sitio del desarrollador: https://adventists.ai/
- Modelo base del LLM: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base del encoder de audio: https://huggingface.co/openai/whisper-small
- Variante paralinguistica relacionada (Qwen3-32B, licencia cc-by-nc-4.0): https://huggingface.co/adventists-ai/DuplexJev-B-Emotion-Qwen3-ASR-0.6B-Qwen3-32B
- Referencia bibliografica: Jin, Jie; Ma, Ziyin; Yin, Min; Chen, Jinyu; Song, Haigang; Pang, Zhikun; Zhang, Xiaowen. "Batched Speech Decisions Without Decoding: Single-Token Supervision Lets a Frozen LLM Hear Beyond the Transcript". Enviado a IEEE ICASSP, 2027.
