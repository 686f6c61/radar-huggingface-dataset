# openmartdev/awaken-full-duplex

## Resumen

Awaken Full Duplex es un modelo de voz a voz (audio-to-audio) de tipo full-duplex desarrollado por openmartdev. Parte del checkpoint semidual Fun-AudioLLM/Fun-Audio-Chat-8B y le ensena a escuchar y hablar simultaneamente, de modo que puede emitir retroalimentacion verbal (backchannels), interrumpir y ceder el turno sin depender de un detector de actividad de voz ni de un esquema rigido de turnos. El modelo resuelve un problema concreto: los modelos de dialogo hablado abiertos pierden capacidad de razonamiento y de fundamentacion cuando se les entrena para full-duplex, y los datos conversacionales naturales con solapamiento son escasos.

La propuesta tecnica es una receta de entrenamiento eficiente en tres fases (dos etapas de SFT y una etapa corta de GRPO) sobre el backbone Qwen3-8B, con una entrada de audio de usuario en streaming a 24 kHz procesada por un encoder causal estilo Whisper y una salida compuesta por tokens de texto mas cinco tokens de codec por trama, renderizados por el decodificador de flujo CosyVoice3 y el vocoder HiFT. El modelo tiene 9.424.246.784 parametros segun los pesos en safetensors y una ventana de atencion de 2 s en el encoder.

Es relevante ahora porque demuestra que se puede obtener comportamiento full-duplex creible (63% de acierto en backchannels, 90% en acertijos logicos hablados) sin preentrenamiento duplex a gran escala y conservando casi intactas las capacidades del modelo base (61% en sondas de fundamentacion frente al 66% del base semidual). El modelo solo soporta ingles y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-8B) con encoder de audio causal estilo Whisper y decodificador de voz CosyVoice3 + vocoder HiFT |
| Parametros totales | 9.424.246.784 (~8B declarados en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventana de atencion del encoder de audio de 2 s y ventanas de conversacion de hasta 180 s en el entrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 56,6 GB); codec de voz descargado aparte desde FunAudioLLM/Fun-CosyVoice3-0.5B-2512 |

## Arquitectura y entrenamiento

El modelo es un sistema audio-audio con backbone transformer Qwen3-8B que procesa una posicion por trama de 200 ms. La entrada es audio de usuario en streaming a 24 kHz, codificado por un encoder causal estilo Whisper con ventana de atencion de 2 s. Las caracteristicas de usuario, los embeddings de texto y los embeddings de tokens de audio entran en una capa de fusion compartida y en el backbone transformer, que predice el siguiente token de texto y condiciona el decodificador de audio. La salida son tokens de texto mas cinco tokens de codec por trama, renderizados por el decodificador de flujo CosyVoice3 y el vocoder HiFT. No hay turnos ni detector de actividad de voz: la interaccion es full-duplex por diseno.

El entrenamiento parte de Fun-Audio-Chat-8B (semidual) y consta de tres fases. La etapa 1 de SFT aprende el patron de entrada en streaming y objetivos alineados de texto y voz sobre 64.000 conversaciones compuestas con ventanas de hasta 180 s. La etapa 2 de SFT mezcla al 50/50 los pesos de la etapa 1 con el checkpoint base y continua sobre 100.132 registros con replay de los datos de interaccion. La etapa final de GRPO mejora el timing de los backchannels a partir de muestras del propio modelo en ventanas conversacionales. No hay preentrenamiento duplex a gran escala; la innovacion es la composicion de conversaciones con timing explicito, solapamiento e interrupciones, junto con el uso de RL para afinar la toma de turno.

## Capacidades

- Dialogo hablado full-duplex: escucha y habla a la vez, sin detector de actividad de voz ni turnos predefinidos.
- Backchannels: emite senales de retroalimentacion verbal (por ejemplo, asentimientos) con timing aprendido; la etapa GRPO eleva la tasa de acierto del 1% al 63% y toma el turno solo en el 3% de los items.
- Interrupciones y cesion de turno: gestiona solapamiento y cambios de turno de forma natural.
- Generacion de voz: sintesis de voz a partir de tokens de codec con decodificador CosyVoice3 e HiFT, con soporte de prompts de voz a partir de un clip de referencia de 3-10 s.
- Razonamiento hablado: resuelve el 90% de acertijos logicos hablados en la evaluacion del autor.
- Fundamentacion (groundedness): pasa el 61% de las sondas, cerca del 66% del modelo base semidual.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: modo streaming de audio, servidor WebSocket en vivo y modo offline con pista de usuario grabada.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede mantener una conversacion hablada continua sin segmentacion por turnos, lo que encaja en interfaces de asistente donde el usuario interrumpe o habla encima; el servidor WebSocket incluido (awaken-server) facilita la integracion.
- Atencion al cliente telefonica: la capacidad de backchannel y de cesion de turno permite conversaciones mas naturales en call centers automatizados, con el modelo emitiendo confirmaciones mientras el cliente habla.
- Pruebas de concepto de agentes conversacionales: al conservar el 61% de fundamentacion y el 90% en acertijos logicos hablados, sirve para prototipos donde se necesita razonamiento hablado y no solo respuestas reflejas.
- Evaluacion de interaccion humano-maquina: el modo offline (awaken-offline) genera un estereo.wav con la pista del modelo y la del usuario, util para analizar solapamientos y latencia en laboratorio.
- Clonacion y personalizacion de voz: la herramienta awaken-voice crea prompts de voz a partir de un clip de 3-10 s del hablante, lo que permite adaptar la voz del asistente a una marca o personaje con derechos claros.
- Investigacion en dialogo hablado: la receta de entrenamiento y los datos compuestos permiten reproducir y extender el estudio de full-duplex sin preentrenamiento masivo, usando el codigo publicado en GitHub.
- Demos interactivas en web: el servidor WebSocket con soporte SSL (--ssl-dir) permite desplegar una demo de voz full-duplex en navegador para validacion con usuarios.

## Benchmarks y rendimiento

| Metrica | Awaken Full Duplex | Base semidual (Fun-Audio-Chat-8B) | Modelos full-duplex abiertos |
|---|---|---|---|
| Tasa de acierto en backchannels | 63% | no disponible | no disponible |
| Toma de turno en backchannels | 3% | no disponible | no disponible |
| Sondas de fundamentacion | 61% | 66% | 14-35% |
| Acertijos logicos hablados | 90% | no disponible | 30-40% |

Los datos proceden de la model card del autor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo de pesos ocupa 56,6 GB, por lo que en precision completa se requiere al menos una GPU de 80 GB (A100/H100) o reparto multi-GPU. No se documentan cuantizaciones.
- GPU recomendadas: NVIDIA con CUDA; se menciona TensorRT 10 y se ha probado con PyTorch 2.8 y CUDA 12.8. No se especifican modelos concretos de GPU mas alla de "NVIDIA GPU (CUDA)".
- Cabe en GPU de consumo: no disponible; el tamano del repo y la ausencia de cuantizaciones documentadas hacen improbable que quepa en GPUs de consumo de 24 GB sin cuantizar.
- Opciones de despliegue: servidor WebSocket propio (awaken-server), modo offline (awaken-offline), API de Python (awaken_chat.load_model, Decoders, DuplexSession). Se usa TensorRT para construir el motor en la primera ejecucion (unos minutos por maquina). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Full-duplex | Idiomas | Licencia | Fundamento / logica hablada |
|---|---|---|---|---|---|---|
| Awaken Full Duplex | ~8B (9,42B reales) | ventana de audio de 2 s; ventanas de entrenamiento de hasta 180 s | Si | Ingles | Apache 2.0 | 61% / 90% |
| Fun-Audio-Chat-8B (base) | ~8B | no disponible | No (semidual) | no disponible | Apache 2.0 (heredada) | 66% / no disponible |
| Modelos full-duplex abiertos (sin especificar) | no disponible | no disponible | Si | no disponible | no disponible | 14-35% / 30-40% |

La comparativa se limita a los datos de la model card; no se dispone de especificaciones detalladas de los modelos full-duplex abiertos de referencia ni de alternativas concretas con nombre.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- El modelo se distribuye con 0 descargas y 0 likes en HuggingFace en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- Los benchmarks proceden exclusivamente del autor; no se han replicado de forma externa.
- La fundamentacion baja del 66% del base al 61%, lo que indica una perdida leve de capacidad respecto al checkpoint original.
- No se documentan sesgos conocidos, pero al estar entrenado solo en ingles y sobre conversaciones compuestas, puede presentar sesgos culturales y de dominio no evaluados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los acertijos logicos hablados al 90% no garantizan veracidad factual en conversacion abierta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el codec de voz se descarga desde FunAudioLLM/Fun-CosyVoice3-0.5B-2512 y conviene verificar su licencia por separado.
- El uso de prompts de voz requiere derechos sobre el clip de referencia del hablante; el autor lo advierte explicitamente.
- Requiere Linux con GPU NVIDIA y CUDA, Python >= 3.10, PyTorch >= 2.7 y TensorRT 10; la compilacion del motor TensorRT anade unos minutos en la primera ejecucion por maquina.
- El servidor en vivo gestiona una conversacion a la vez, lo que limita el despliegue concurrente sin trabajo adicional de infraestructura.
- No hay informacion sobre cuantizaciones, latencia ni throughput, lo que dificulta planificar produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openmartdev/awaken-full-duplex
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-Audio-Chat-8B
- Codec de voz: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio de codigo: https://github.com/OpenmartAI/awake-audio-chat
- Pagina del proyecto: https://github.com/OpenmartAI/awake-audio-chat/blob/main/webpage/index.html
