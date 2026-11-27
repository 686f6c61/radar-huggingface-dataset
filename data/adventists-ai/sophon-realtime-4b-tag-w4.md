# adventists-ai/Sophon-Realtime-4B-Tag-W4

## Resumen

Sophon-Realtime-4B-Tag-W4 es la variante cuantizada a 4 bits del modelo de voz a voz full-duplex Sophon-Realtime-4B-Tag, desarrollado por adventists-ai. Resuelve el problema de la conversación hablada en tiempo real: el modelo escucha mientras el usuario habla, decide a partir de la prosodia y el contenido cuando el interlocutor ha terminado, genera una respuesta con etiquetas de sonido paralingüístico (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`) y la sintetiza mientras la escribe. La innovación de esta versión W4 es que reduce el requisito de hardware de una GPU de 32 GB a una de 24 GB (RTX 4090 / 3090), usando aproximadamente 21 GB.

La arquitectura combina un "thinker" de 4B parámetros (modelo de lenguaje que razona y planifica la respuesta) con un "talker" basado en tag-tts, un modelo expresivo de síntesis de voz que ejecuta las etiquetas de sonido, más un codificador de audio, un proyector y un banco de voces. Solo el modelo de lenguaje del thinker está cuantizado (GPTQ W4A16: int4 simétrico, grupo 128); el resto de componentes se mantienen idénticos a la versión bf16.

Es relevante ahora porque demuestra que la conversación por voz full-duplex con capacidades paralingüísticas puede desplegarse en hardware de consumo de gama alta, con una pérdida de conocimiento de apenas ~1,7 puntos en CMMLU/MMLU-Pro y sin degradación medible en calidad de voz, etiquetas de sonido o latencia de primera respuesta de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech: thinker (LLM 4B) + talker (tag-tts) + codificador de audio + proyector |
| Parametros totales | 4B (thinker); el resto de componentes no disponible en detalle |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ W4A16 (int4, simetrico, grupo 128) solo en el LLM del thinker; resto en bf16 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), ONNX, compatible con vLLM / vLLM-Omni |

## Arquitectura y entrenamiento

El modelo sigue un diseno en tres etapas servidas como un unico modelo vLLM-Omni: un thinker de 4B parámetros que procesa audio y texto, decide el fin de turno y genera la respuesta textual con etiquetas de sonido; un talker (tag-tts) que convierte esa respuesta en audio expresivo interpretando las etiquetas; y un codificador de audio con proyector que alimenta la entrada de voz. La cuantizacion GPTQ W4A16 se aplico unicamente al modelo de lenguaje del thinker, con calibracion sobre un conjunto mixto al 50% de conversaciones habladas y escritas.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica destacable es el diseno full-duplex con deteccion de fin de turno basada en la propia voz del usuario, junto con la generacion y ejecucion de etiquetas paralinguisticas en la sintesis.

## Capacidades

- Conversacion de voz a voz en tiempo real con funcionamiento full-duplex: escucha mientras el usuario habla.
- Deteccion de fin de turno a partir de la voz, sin depender solo de pausas o senales externas.
- Generacion de respuestas habladas con etiquetas paralinguisticas: `[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`.
- Sintesis de voz expresiva mediante el modelo tag-tts.
- Clonacion de voz zero-shot (segun la documentacion del repositorio).
- Modo Live con camara, segun la demo en Hugging Face Spaces.
- Soporte de los endpoints `/v1/realtime` y `/v1/chat/completions` en vLLM-Omni.
- Capacidades multilingues limitadas a chino e ingles.
- Razonamiento y conocimiento textual (evaluado en CMMLU y MMLU-Pro).

## Casos de uso

- Atencion al cliente por voz: el modelo mantiene conversaciones multi-turno habladas, detecta cuando el cliente ha terminado de hablar y responde con latencia de primera respuesta de audio de 0,28-0,38 s (mediana con dos usuarios simultaneos), lo que permite interacciones fluidas sin turnos rigidos.
- Asistentes conversacionales embebidos en aplicaciones de escritorio o movil: al caber en una GPU de 24 GB, puede desplegarse en estaciones de trabajo con RTX 4090/3090 sin infraestructura de centro de datos.
- Agentes telefonicos o de call center: la API compatible con OpenAI Realtime permite integrarlo en pipelines existentes de telefonia y voz sobre IP.
- Interrupcion natural en interfaces de voz: el diseno full-duplex permite que el usuario interrumpa al modelo, util en asistentes de manos libres o conduccion.
- Clonacion de voz para locucion o doblaje: la funcionalidad zero-shot permite generar voces personalizadas con permiso, aplicable a contenido audiovisual y accesibilidad.
- Prototipado rapido de experiencias de voz: la demo en Hugging Face Spaces y la API hospedada con 3 horas gratuitas permiten evaluar el modelo sin GPU propia.
- Investigacion en interaccion humano-maquina paralinguistica: las etiquetas de sonido permiten estudiar respuestas mas naturales (risas, suspiros) en sistemas conversacionales.

## Benchmarks y rendimiento

| Metrica | W4 (este repo) | bf16 |
|---|---|---|
| CMMLU (600 preguntas, texto) | 69,5 | 71,3 |
| MMLU-Pro (600 preguntas, texto) | 42,7 | 44,3 |
| Etiquetas de sonido en 300 conversaciones habladas retenidas: respuestas validas | 99,3% | 100% |
| Etiquetas de sonido en 300 conversaciones habladas retenidas: respuestas etiquetadas | 15,3% | 12,7% |
| Tasa de error de voz de la respuesta hablada, ASR, 40 zh / 40 en | 3,2% / 0,7% | 3,1% / 1,9% |
| Primera respuesta de audio, 2 usuarios simultaneos (mediana) | 0,28-0,38 s | 0,29-0,38 s |

Medido el 2026-11-18 en una H100 con el presupuesto de memoria de la configuracion de 24 GB. La memoria es la suma de los tres procesos de etapa. No verificado aun en una tarjeta fisica de 24 GB.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21 GB en la configuracion de 24 GB (suma de los tres procesos de etapa).
- GPU recomendadas: una RTX 4090 o RTX 3090 (24 GB) para la configuracion W4; la version bf16 requiere una GPU de 32 GB y usa unos 27 GB.
- Cabe en GPU de consumo: si, en RTX 4090 / 3090 clase 24 GB. Advertencia del autor: un escritorio que ademas alimenta un monitor dispone de menos memoria libre; se solicitan reportes de usuarios de 4090/3090.
- Opciones de despliegue: vLLM 0.30 con vLLM-Omni 0.30 y plugin, mediante `install.sh` y `start.sh` del repositorio; endpoints `/v1/realtime` y `/v1/chat/completions`; API hospedada compatible con OpenAI Realtime.
- Latencia: primera respuesta de audio de 0,28-0,38 s (mediana con 2 usuarios simultaneos).
- Capacidad: hasta 4 conversaciones simultaneas en la configuracion de 24 GB, segun el script de arranque.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| Sophon-Realtime-4B-Tag-W4 | 4B (thinker) | No disponible | Apache-2.0 | 1 GPU 24 GB (~21 GB) | Full-duplex, etiquetas paralinguisticas, zh/en |
| Sophon-Realtime-4B-Tag (bf16) | 4B (thinker) | No disponible | Apache-2.0 | 1 GPU 32 GB (~27 GB) | Misma funcionalidad, mayor huella de memoria |
| Otros modelos speech-to-speech full-duplex | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Solo soporta chino e ingles; no hay soporte documentado de otros idiomas.
- La cuantizacion reduce el conocimiento textual en aproximadamente 1,7 puntos en CMMLU y MMLU-Pro, dentro del error de muestreo de 600 preguntas.
- No se ha verificado el rendimiento en una tarjeta fisica de 24 GB; en equipos con pantalla conectada la memoria libre puede ser insuficiente.
- La clonacion de voz solo debe usarse con la propia voz o con permiso explicito; el aviso del autor lo indica de forma destacada.
- Riesgo de alucinacion en las respuestas del thinker no cuantificado en la informacion disponible.
- Sesgos conocidos no documentados en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero el archivo `NOTICE` contiene las fuentes de los pesos incluidos que deben revisarse.
- El modelo requiere vLLM 0.30 y vLLM-Omni 0.30 con plugin; no se documentan opciones de despliegue alternativas como llama.cpp u Ollama.
- La longitud de contexto no esta especificada, lo que limita la planificacion de conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag-W4
- Modelo base bf16: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/adventists-ai/Sophon-Realtime
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- README del modo tag: https://github.com/adventists-ai/sophon-realtime/blob/main/tag/README.md
- Documentacion de la API hospedada: https://api.adventists.ai/console/docs
- Consola de la API: https://api.adventists.ai/console/
