# adventists-ai/DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-4B

## Resumen

DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-4B es un conector multimodal de audio desarrollado por Adventists.ai que acopla un encoder ASR congelado (Qwen3-ASR-0.6B) a un LLM tambien congelado (Qwen3-4B). Su particularidad es que no genera texto token a token: cada pregunta escrita se lee como una distribucion sobre sus opciones y el modelo devuelve una decision de un unico token por pregunta, con cero pasos de decodificacion y varias preguntas resueltas en un solo forward pass. Es la variante de tamano "edge" de los conectores sobre Qwen3-32B publicados con el paper, entrenada con la misma receta.

El problema que aborda es el de los agentes de voz full-duplex: en vez de transcribir primero y razonar despues, el sistema necesita decisiones rapidas y batcheadas sobre el audio (¿ha terminado el usuario de hablar?, ¿que intencion tiene?). Al mantener congelados encoder y LLM y entrenar unicamente un proyector de 12,6 millones de parametros, el coste de adaptacion es minimo y el modelo cabe en una GPU pequena o incluso en CPU.

Esta variante concreta se ha entrenado solo para alineacion de contenido (destilacion de transcripciones, etapas R1-R2), sin entrenamiento paralinguistico: el genero y la emocion quedan al nivel del azar. El propio autor la presenta como punto de partida para un ajuste fino propio orientado a decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ASR congelado (Qwen3-ASR-0.6B) + conector entrenable (frame stacking + proyector SwiGLU, variante B) + LLM congelado (Qwen3-4B); readout de decision de un solo token |
| Parametros totales | 4220 M segun la model card (encoder + LLM + conector); los pesos publicados en safetensors contienen 12 586 752 parametros entrenables (solo el conector) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se han probado unicamente en bf16 (GPU) y fp32 (CPU). La cuantizacion y las NPU no se han probado |
| Idiomas soportados | Chino (zh) e ingles (en) en los ejemplos y evaluaciones; el encoder Qwen3-ASR subyacente cubre 52 idiomas y dialectos, no verificado en esta variante |
| Licencia | Apache-2.0 para los pesos del conector. Los modelos base congelados conservan sus propias licencias. Algunos corpus de entrenamiento (WenetSpeech, CoVoST 2, entre otros) son solo para uso no comercial |
| Formato de pesos | safetensors, con custom_code de transformers |
| Tokens de audio | Qwen3-ASR a 12,5 Hz, 2 frames apilados: 6,25 tokens de audio por segundo |
| Repositorio | 0,0 GB (solo almacena el conector; encoder y LLM se cargan aparte) |

## Arquitectura y entrenamiento

El sistema es un pipeline de tres piezas con solo una entrenable. La primera es el encoder de Qwen3-ASR-0.6B, congelado, que produce representaciones de audio a 12,5 Hz. La segunda es el conector, que toma la ultima capa del encoder, aplica frame stacking (2 frames apilados, lo que reduce la tasa a 6,25 tokens de audio por segundo) y proyecta con un SwiGLU. La tercera es Qwen3-4B, tambien congelado, que recibe el audio proyectado y la pregunta escrita y emite una distribucion sobre las opciones de esa pregunta. Solo el conector, con 12,6 M de parametros, se actualiza durante el entrenamiento, segun la receta del paper: destilacion de transcripciones en las etapas R1 y R2 sobre dos paquetes disjuntos de 0,5 M de enunciados cada uno, extraidos de la mezcla Ultravox v0.6 (32 000 pasos por paquete, batch global de 16).

La innovacion tecnica es el readout batcheado sin decodificacion: en lugar de generar la respuesta token a token, el modelo interpreta cada pregunta como una eleccion entre opciones y resuelve muchas en un unico forward pass. Esto elimina la latencia de decodificacion autoregresiva y es lo que permite hablar de decisiones tipo "System-One" a la velocidad del audio. El diseno del proyector y el codigo de entrenamiento toman como base Ultravox. No se documenta en la informacion disponible el uso de RLHF, DPO ni atencion lineal.

## Capacidades

- Decisiones tipadas sobre audio: dado un audio y una pregunta con opciones cerradas, devuelve la opcion elegida como un unico token por pregunta.
- Procesamiento batcheado: multiples preguntas sobre el mismo clip en un solo forward pass y con cero pasos de decodificacion (el ejemplo de latencia usa 10 preguntas en una pasada).
- Deteccion de turno (turn-taking): predice si el usuario ha terminado de hablar o no, una senal clave para agentes full-duplex.
- Clasificacion de intencion: el ejemplo de la model card cubre las categorias clima, medios, navegacion, telefono y chit-chat.
- Preguntas de conocimiento hablado (spoken QA): responde preguntas sobre el contenido de un audio, aunque con rendimiento limitado por el LLM subyacente.
- Bilinguismo zh/en: se proporcionan ejemplos con pregunta y opciones tanto en ingles como en chino.
- Capacidad limite en paralinguistica: en esta variante, genero y emocion estan al nivel del azar (52,5-54,0 % en genero binario, 27,1-27,9 % en emocion de 4 clases).
- No hay soporte documentado de tool calling, function calling ni razonamiento multi-paso con agentes. El modelo no genera texto libre: su salida es una eleccion entre opciones predefinidas.
- Entrada multimodal audio-texto: el audio lo aporta el encoder y el texto (pregunta y opciones) lo aporta el LLM.

## Casos de uso

- Deteccion de turno en agentes de voz full-duplex: el modelo responde a la pregunta "¿ha terminado el usuario de hablar?" con dos opciones, en un unico forward pass. Es el caso de uso central del paper y el que justifica el diseno sin decodificacion: la senal de fin de turno debe llegar antes de que el usuario perciba latencia.
- Enrutado de intencion en asistentes de voz para automocion: con un vocabulario cerrado (clima, medios, navegacion, telefono, chit-chat) el modelo clasifica la peticion directamente desde el audio. El ejemplo de la model card reproduce exactamente este escenario en ingles y en chino.
- Enrutado de llamadas en un IVR o centralita: sustituir la deteccion clasica por audio y un clasificador dedicado por una unica pasada de este conector, con las opciones de enrutado definidas como etiquetas.
- Anotacion por lotes de corpus de audio: al resolver muchas preguntas por forward pass, permite etiquetar grandes colecciones de clips con criterios cerrados (idioma, intencion, presencia de habla, contenido tematico) sin coste de decodificacion.
- Filtrado y preseleccion en pipelines de ASR: descartar segmentos sin habla util o marcar audios que requieren transcripcion completa antes de invocar un modelo mayor, reduciendo el coste total del pipeline.
- Despliegue en el borde (edge) o en CPU: la model card indica que cabe en una GPU pequena o en CPU, con 5427 ms por evento de decision (10 preguntas, clip de 4,5 s) en 8 hilos de un Xeon Platinum 8558 en fp32 sin cuantizar. Es viable para prototipos y dispositivos con requisitos de privacidad estrictos.
- Evaluacion rapida de la calidad de una transcripcion: la fila de spoken QA de la model card compara el conector (77-79 % en qa100) con el propio Qwen3-4B leyendo la transcripcion (82 %), lo que sirve para medir cuanto contenido se pierde en la representacion de audio.
- Punto de partida para ajuste fino propio: al ser un conector de 12,6 M de parametros con encoder y LLM congelados, el coste de adaptarlo a un dominio nuevo (nuevas preguntas y opciones) es bajo en comparacion con reentrenar un speech-LLM completo.

## Benchmarks y rendimiento

| Evaluacion (%) | Protocolo del paper | Valores por defecto de duplexjev 0.2.1 |
|---|---:|---:|
| qa100 (spoken QA) | 79 | 77 |
| qa100, Qwen3-4B leyendo la transcripcion | 82 | no disponible |
| ZJU-ML (spoken QA, real + TTS) | 57 | no disponible |
| Genero, 800 enunciados reales | 52,5 | 54,0 |
| Emocion, 4 clases, 800 enunciados | 27,9 | 27,1 |

Contexto aportado por el autor: el protocolo del paper usa los prompts de la publicacion, un unico orden de opciones y una H200; los valores por defecto de `duplexjev` usan los prompts del paquete con el parametro `lang` ajustado al clip. El autor advierte que el spoken QA con un LLM pequeno es sensible a la redaccion del prompt y que su techo lo marca el propio LLM (fila de lectura de transcripcion, 82 %). Como referencia, los conectores sobre Qwen3-32B alcanzan 90 en qa100, 89,9 en genero y 90,0 en emocion.

Latencia de un evento de decision (10 preguntas, un clip de 4,5 s, un forward pass, `duplexjev` 0.2.1, PyTorch sin optimizar):

| Entorno | Precision | Latencia |
|---|---:|---:|
| 1x H200 | bf16 | 54 ms |
| 8 hilos de CPU (Xeon Platinum 8558) | fp32, sin cuantizar | 5427 ms |

No se han publicado datos de throughput ni de rendimiento en NPU o con cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como estimacion aritmetica a partir de los 4220 M de parametros declarados, los pesos ocuparian aproximadamente 8,4 GB en bf16 y 16,9 GB en fp32, mas el coste de activaciones, que es bajo en el encoder de audio (un clip de 4,5 s genera alrededor de 28 tokens de audio). El autor afirma que el modelo "cabe en una GPU pequena o en CPU".
- GPU recomendadas: H200 para el escenario de referencia (54 ms por evento de decision). No se documentan pruebas en A100, H100 ni RTX 4090; la unica medida publicada en GPU es sobre H200.
- GPU de consumo: con ~8,4 GB de pesos en bf16, un modelo de este tamano es candidato razonable para tarjetas de 12-16 GB o mas, pero no hay validacion publicada al respecto. No se ha probado cuantizacion.
- CPU: funciona en CPU; la medida publicada es de 5427 ms por evento de decision en 8 hilos de Xeon Platinum 8558 en fp32 sin cuantizar.
- NPU en dispositivo: explicitamente no probado.
- Opciones de despliegue: el paquete oficial `duplexjev` (instalacion con `pip install "duplexjev[speech]>=0.2.1"`), sobre PyTorch y transformers con custom_code. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; la arquitectura combina dos modelos congelados con un conector propio, lo que dificulta su integracion en esos servidores.
- Latencia y throughput: 54 ms por evento de decision en H200 (bf16) y 5427 ms en CPU (fp32). El throughput agregado no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | qa100 | Genero | Emocion | Licencia |
|---|---|---|---|---|---|---|
| DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-4B (este) | 4220 M totales, 12,6 M entrenables | no disponible | 77-79 | 52,5-54,0 | 27,1-27,9 | Apache-2.0 (conector) |
| DuplexJev-A-Para-Qwen3-ASR-0.6B-Qwen3-32B | no disponible | no disponible | no disponible | no disponible | no disponible | cc-by-nc-4.0 |
| DuplexJev-B-Emotion-Qwen3-ASR-0.6B-Qwen3-32B | no disponible | no disponible | no disponible | no disponible | no disponible | cc-by-nc-4.0 |
| Conectores DuplexJev sobre Qwen3-32B (paper, agregado) | no disponible | no disponible | 90 | 89,9 | 90,0 | no disponible |
| Qwen3-4B leyendo la transcripcion del ASR | 4 B (por nomenclatura) | no disponible | 82 | no disponible | no disponible | Apache-2.0 |

Las cifras comparadas no son estrictamente equivalentes: los valores de los conectores de 32B proceden del protocolo del paper, mientras que las dos columnas de este modelo corresponden a dos configuraciones de evaluacion distintas (protocolo del paper y valores por defecto del paquete `duplexjev`). El autor senala ademas que la evaluacion de spoken QA con un LLM pequeno esta acotada por el propio LLM, como demuestra la fila de lectura de transcripcion.

## Limitaciones y advertencias

- El modelo se ha evaluado sobre habla leida o actuada y con conjuntos de prueba pequenos (entre 100 y 800 elementos). No se ha evaluado con entrada en streaming.
- Esta variante no incluye entrenamiento paralinguistico: genero y emocion rinden al nivel del azar. No debe usarse para inferir atributos de hablantes.
- El propio autor advierte que las etiquetas de emocion proceden de corpus actuados y que las salidas no deben usarse para tomar decisiones sobre personas.
- Los LLM pequenos responden mal a preguntas de conocimiento, incluso cuando leen la transcripcion. El spoken QA esta limitado por el LLM subyacente.
- El rendimiento en spoken QA es sensible a la redaccion del prompt: entre el protocolo del paper (79) y los valores por defecto del paquete (77) hay una diferencia de dos puntos solo por el formato de las preguntas y las opciones.
- El conector solo funciona con el encoder (adventists-ai/Qwen3-ASR-0.6B-Encoder) y el LLM (Qwen/Qwen3-4B) indicados. No es intercambiable.
- Riesgo de error en la eleccion de opcion: al no generar texto libre, el modo de fallo no es la alucinacion narrativa sino la seleccion incorrecta de una opcion, con una confianza que no se documenta como calibrada. No hay cobertura de preguntas abiertas.
- Idiomas: solo se documentan chino e ingles. El resto de idiomas del encoder Qwen3-ASR no se ha validado con este conector.
- Licencia: los pesos del conector son Apache-2.0, pero los modelos base conservan sus propias licencias y algunos corpus de entrenamiento (WenetSpeech, CoVoST 2) son de uso exclusivamente no comercial. Conviene revisarlos antes de un uso comercial.
- Despliegue: sin soporte documentado en servidores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI) ni cuantizacion probada. Solo hay implementacion en PyTorch a traves del paquete `duplexjev`.
- Modelo con 0 descargas y 0 likes en el momento de redactar esta ficha: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adventists-ai/DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-4B
- Encoder congelado: https://huggingface.co/adventists-ai/Qwen3-ASR-0.6B-Encoder
- LLM congelado: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de codigo y scripts: https://github.com/adventists-ai/duplexjev
- Organizacion en HuggingFace (resto de conectores de la familia): https://huggingface.co/adventists-ai
- Variante paralinguistica sobre Qwen3-32B: https://huggingface.co/adventists-ai/DuplexJev-A-Para-Qwen3-ASR-0.6B-Qwen3-32B
- Variante de emocion sobre Qwen3-32B: https://huggingface.co/adventists-ai/DuplexJev-B-Emotion-Qwen3-ASR-0.6B-Qwen3-32B
- Repositorio de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe tecnico de Qwen3-ASR: https://arxiv.org/html/2601.21337v1
- Cita del paper (sometido a IEEE ICASSP 2027): Jin, Jie; Ma, Ziyin; Yin, Min; Chen, Jinyu; Song, Haigang; Pang, Zhikun; Zhang, Xiaowen. "Batched Speech Decisions Without Decoding: Single-Token Supervision Lets a Frozen LLM Hear Beyond the Transcript".
