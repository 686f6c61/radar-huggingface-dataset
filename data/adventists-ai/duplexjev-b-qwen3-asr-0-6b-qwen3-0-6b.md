# adventists-ai/DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-0.6B

## Resumen

DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-0.6B es un conector de 9,44 millones de parametros entrenables que enlaza un codificador de audio Qwen3-ASR-0.6B congelado con un LLM Qwen3-0.6B tambien congelado. Lo desarrolla adventists-ai dentro de la familia DuplexJev, una linea de trabajo sobre "Speech-to-Decision": en lugar de generar texto token a token, el modelo lee cada pregunta escrita como una distribucion sobre un conjunto cerrado de opciones, de modo que una decision se resuelve en un unico paso de decodificacion y muchas preguntas pueden evaluarse en la misma pasada forward.

El modelo resuelve el problema de tomar decisiones de bajo nivel (turno de palabra, intencion, senales del hablante) sobre audio en escenarios de agentes de voz full-duplex, con un coste computacional minimo. Es la variante de tamano "edge" de los conectores Qwen3-32B publicados con el paper, entrenada con la misma receta, y esta pensada como punto de partida para fine-tuning propio de decisiones mas que como modelo de conocimiento abierto.

La variante B es de alineamiento de contenido unicamente (destilacion de transcripcion R1-R2), sin entrenamiento paralinguistico: el genero y la emocion quedan al nivel del azar. Soporta chino e ingles, se distribuye bajo licencia Apache-2.0 y su pipeline declarado en HuggingFace es audio-text-to-text. El sistema completo (codificador + LLM + conector) suma unos 790 M de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conector tipo Ultravox sobre encoder de audio congelado + LLM congelado: ultima capa del encoder, frame stacking y proyector SwiGLU |
| Parametros totales | 9.441.024 parametros entrenables en el conector (safetensors); 790 M en el sistema completo segun la model card (encoder + LLM + conector) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card indica que la cuantizacion no se ha probado) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 para los pesos del conector; los modelos base conservan sus propias licencias |
| Formato de pesos | safetensors (libreria transformers, custom_code) |
| Encoder de audio | adventists-ai/Qwen3-ASR-0.6B-Encoder (congelado) |
| LLM base | Qwen/Qwen3-0.6B (congelado) |
| Tokens de audio | Qwen3-ASR a 12,5 Hz, 2 frames apilados: 6,25 tokens de audio por segundo |
| Pipeline | audio-text-to-text |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Ultravox: se toma la salida de la ultima capa del codificador Qwen3-ASR-0.6B (congelado), se apilan dos frames consecutivos para reducir la tasa temporal y se proyecta al espacio de embeddings del LLM mediante un proyector SwiGLU de tipo B. El LLM Qwen3-0.6B tambien permanece congelado, de modo que el unico componente entrenable es el conector, con aproximadamente 9,44 M de parametros. La innovacion central es el readout de un solo token: cada pregunta tipada se evalua como una distribucion sobre sus opciones, sin pasos de decodificacion autoregresiva, lo que permite agrupar (batchear) muchas preguntas por pasada forward.

El entrenamiento usa la receta del paper: destilacion de transcripcion en dos fases (R1 y R2) sobre dos paquetes disjuntos de 0,5 M de utterances cada uno extraidos de la mezcla Ultravox v0.6, con 32.000 pasos por fase y batch global de 16. Esta variante B solo realiza alineamiento de contenido, sin entrenamiento paralinguistico, por lo que no aprende etiquetas de genero o emocion. La model card indica que Claude (Anthropic) asistio en la parte de codigo.

## Capacidades

- Decision sobre audio con salida de un solo token: clasificacion de audio hablado en conjuntos cerrados de opciones (por ejemplo, "terminado" / "no terminado", o intenciones como clima, medios, navegacion, telefono, charla).
- Procesamiento por lotes de multiples preguntas en una sola pasada forward sin decodificacion autoregresiva.
- Deteccion de fin de turno (turn-taking) para agentes de voz full-duplex.
- Clasificacion de intencion a partir del habla, en ingles y chino.
- Respuesta a QA hablado de forma limitada; segun la propia model card, el rendimiento esta acotado por el LLM subyacente.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible.
- Capacidades multilingues: limitadas a chino e ingles.
- Capacidades especiales: no incluye modo "thinking", vision ni audio generativo; no hay entrenamiento paralinguistico en esta variante (genero y emocion quedan al nivel del azar).
- Compatibilidad: el conector solo funciona con el encoder y el LLM indicados en la model card.

## Casos de uso

- Deteccion de fin de turno en agentes de voz full-duplex: el modelo responde a la pregunta "¿ha terminado de hablar el usuario?" como una decision de un token, con una latencia de 76 ms para 10 preguntas sobre un clip de 4,5 s en una H200, lo que permite integrarlo en bucles de dialogo en tiempo real.
- Enrutado de intenciones en asistentes de voz de automocion: con opciones cerradas como clima, medios, navegacion, telefono o charla, el conector resuelve la intencion del conductor a partir del audio sin necesidad de transcripcion completa.
- Etiquetado masivo de corpus de audio: al batchear muchas preguntas por pasada forward, se puede anotar intencion o turno sobre grandes volumenes de clips a bajo coste.
- Despliegue en dispositivo de borde (edge): con unos 790 M de parametros en el sistema completo y ejecucion en CPU documentada (893 ms con 8 hilos en fp32), encaja en escenarios sin GPU dedicada.
- Componente de preprocesado en pipelines ASR + LLM: puede actuar como capa de decision rapida antes de invocar un LLM mayor, reduciendo el coste de decodificacion en tareas de clasificacion.
- Base para fine-tuning de decisiones especificas: la variante B esta pensada explicitamente como punto de partida para anadir supervision de nuevas preguntas y opciones sobre el conector entrenable.
- Analitica de conversaciones en chino e ingles: clasificacion de turnos e intenciones en grabaciones de atencion al cliente para su posterior agregacion.
- Experimentacion e investigacion en Speech-to-Decision: sirve como referencia ligera para reproducir la receta del paper en hardware de gama baja o en CPU.

## Benchmarks y rendimiento

| Evaluacion (%) | Protocolo del paper | Defaults de duplexjev 0.2.1 |
|---|---:|---:|
| qa100 (QA hablado) | 36 | 45 |
| qa100, Qwen3-0.6B leyendo la transcripcion | 45 | – |
| ZJU-ML (QA hablado, real + TTS) | 23 | – |
| Genero, 800 utterances reales | 54,1 | 51,0 |
| Emocion, 4 clases, 800 utterances | 24,4 | 26,2 |

Datos de referencia aportados por la model card: los conectores equivalentes sobre Qwen3-32B alcanzan 90 en qa100, 89,9 en genero y 90,0 en emocion. Protocolo del paper: prompts de evaluacion originales, un unico orden de opciones, una H200. Defaults de duplexjev: prompts propios del paquete con el parametro `lang` ajustado al clip.

Latencia de un evento de decision (10 preguntas, un clip de 4,5 s, una pasada forward, duplexjev 0.2.1, PyTorch estandar): 76 ms en una H200 (bf16) y 893 ms en 8 hilos de CPU (Xeon Platinum 8558, fp32, sin cuantizar).

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de los 790 M de parametros del sistema completo, aproximadamente 1,6 GB en bf16 y 3,2 GB en fp32 para pesos, mas el coste de activaciones; no se publican cifras oficiales de VRAM.
- GPU recomendadas: la model card documenta ejecucion en una H200; por tamano, cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente.
- Cabe en GPU de consumo: si, el modelo esta descrito como "fits on one small GPU or CPU"; no se especifican modelos concretos de GPU de consumo.
- Opciones de despliegue: libreria transformers con `custom_code` y el paquete `duplexjev[speech]>=0.2.1` mediante `Decider.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 76 ms por evento de decision (10 preguntas, clip de 4,5 s, H200, bf16); 893 ms en 8 hilos de CPU (Xeon Platinum 8558, fp32, sin cuantizar). No se ha probado en NPU ni con cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-0.6B (este) | 9,44 M entrenables; 790 M totales | zh, en | Apache-2.0 (conector) | qa100 36/45; genero 54,1/51,0; emocion 24,4/26,2 |
| adventists-ai/DuplexJev-A-Para-Qwen3-ASR-0.6B-Qwen3-32B | no disponible (conector + LLM Qwen3-32B) | zh, en | cc-by-nc-4.0 | no disponible en la informacion consultada; la model card de la variante 0.6B cita 90 en qa100, 89,9 en genero y 90,0 en emocion para los conectores sobre Qwen3-32B |
| adventists-ai/DuplexJev-B-Emotion-Qwen3-ASR-0.6B-Qwen3-32B | no disponible (conector + LLM Qwen3-32B) | zh, en | cc-by-nc-4.0 | no disponible en la informacion consultada |
| Qwen/Qwen3-ASR-0.6B | 0,6 B | 52 idiomas y dialectos (segun su repositorio) | no disponible en la informacion consultada | ASR y identificacion de idioma; no es un modelo de decision |

Nota: la comparativa se limita a los modelos de la misma familia y a los componentes base, ya que no se dispone de datos de benchmarks de alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo se ha evaluado con habla leida o actuada y sobre conjuntos de prueba pequenos (100-800 elementos); no se ha evaluado con entrada en streaming.
- Los LLM pequenos responden mal a preguntas de conocimiento incluso leyendo la transcripcion; el rendimiento en QA hablado esta acotado por el propio Qwen3-0.6B (36/45 frente a 45 leyendo la transcripcion).
- Esta variante no tiene entrenamiento paralinguistico: genero y emocion estan al nivel del azar (54,1 y 24,4 en el protocolo del paper), por lo que no debe usarse para inferir caracteristicas del hablante.
- Las etiquetas de emocion proceden de corpus actuados; la model card advierte explicitamente de no usar las salidas para tomar decisiones sobre personas.
- La sensibilidad al enunciado del prompt es alta en QA hablado con LLM pequenos; cambios en la redaccion de las preguntas alteran los resultados.
- El conector solo funciona con el encoder adventists-ai/Qwen3-ASR-0.6B-Encoder y el LLM Qwen/Qwen3-0.6B indicados.
- La cuantizacion no se ha probado; tampoco el despliegue en NPU.
- Licencia: los pesos del conector son Apache-2.0, pero los modelos base conservan sus propias licencias y algunos corpus de entrenamiento (por ejemplo WenetSpeech o CoVoST 2) tienen licencia solo para uso no comercial; hay que verificarlo antes de un uso comercial.
- El repositorio no tiene descargas ni likes registrados y el modelo es muy reciente, por lo que no existe validacion independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adventists-ai/DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-0.6B
- Encoder de audio: https://huggingface.co/adventists-ai/Qwen3-ASR-0.6B-Encoder
- LLM base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de codigo duplexjev: https://github.com/adventists-ai/duplexjev
- Organizacion adventists-ai en HuggingFace: https://huggingface.co/adventists-ai
- Variante A-Para (Qwen3-32B): https://huggingface.co/adventists-ai/DuplexJev-A-Para-Qwen3-ASR-0.6B-Qwen3-32B
- Variante B-Emotion (Qwen3-32B): https://huggingface.co/adventists-ai/DuplexJev-B-Emotion-Qwen3-ASR-0.6B-Qwen3-32B
- Repositorio Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe tecnico de Qwen3-ASR: https://arxiv.org/abs/2601.21337
- Cita del paper (Batched Speech Decisions Without Decoding, enviado a IEEE ICASSP 2027): incluida en la model card, sin enlace directo disponible.
