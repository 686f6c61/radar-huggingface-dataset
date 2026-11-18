# adventists-ai/Sophon-Realtime-4B-Tag-W4

## Resumen

Sophon-Realtime-4B-Tag-W4 es una compilación cuantizada en 4 bits del modelo Sophon-Realtime-4B-Tag, desarrollado por adventists-ai. Se trata de un modelo de voz a voz (speech-to-speech) en modo full-duplex que escucha mientras el usuario habla, decide a partir de la propia voz cuándo ha terminado el turno, genera una respuesta escrita con etiquetas de sonido paralingüístico y la sintetiza mientras la escribe. Está pensado para conversaciones de voz en tiempo real con latencias de primera respuesta de audio en torno a 0,28-0,38 segundos.

La particularidad de esta versión W4 es que solo el modelo de lenguaje del "thinker" está cuantizado con GPTQ W4A16 (int4, simétrico, grupo 128), lo que reduce sus pesos de 8,4 GB a 2,9 GB y permite ejecutar el sistema completo en una única GPU de 24 GB (RTX 4090 / 3090), consumiendo unos 21 GB. El encoder de audio, el proyector, los embeddings, el modelo de voz y las voces se mantienen idénticos a la versión bf16.

El modelo base es un sistema de 4B parámetros con arquitectura "thinker/talker": un cerebro de 4B que razona y un modelo tag-tts expresivo que interpreta las etiquetas de sonido. Soporta chino e inglés, se sirve como un único modelo vLLM-Omni con endpoints `/v1/realtime` y `/v1/chat/completions`, y se distribuye bajo licencia Apache-2.0. La versión documentada es la 1.5.0, publicada el 18 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema thinker/talker full-duplex (thinker de 4B + modelo tag-tts); pesos del thinker cuantizados con GPTQ W4A16 (compressed-tensors) |
| Parametros totales | 4B (thinker); tamaño total del repo 11,3 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16: int4, simétrico, grupo 128 (solo el modelo de lenguaje del thinker); resto de componentes en bf16 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (tags), layouts `thinker/`, `talker/` (tag-tts), `voices/`; servible con vLLM / vLLM-Omni |

## Arquitectura y entrenamiento

El sistema se organiza en tres etapas de proceso: un thinker de 4B parámetros que procesa la entrada de audio y genera la respuesta textual con etiquetas de sonido, un modelo tag-tts expresivo que sintetiza la voz e interpreta dichas etiquetas, y un conjunto de voces empaquetadas. En esta versión W4 solo se cuantiza el modelo de lenguaje del thinker mediante GPTQ W4A16 (int4 simétrico, grupo 128), calibrado sobre conversaciones mitad habladas y mitad escritas; el encoder de audio, el proyector, los embeddings, el modelo de voz y las voces son los mismos ficheros que en la build bf16.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO. Sí se indica que el sistema está entrenado para decidir el fin de turno a partir de la voz del interlocutor (full-duplex) y para emitir etiquetas paralingüísticas como `[laughter]`, `[cough]`, `[sigh]`, `[breath]` y `<strong>…</strong>`, que el modelo tag-tts convierte en sonidos expresivos. Se sirve como un único modelo vLLM-Omni con soporte de los endpoints `/v1/realtime` y `/v1/chat/completions`.

## Capacidades

- Conversación de voz a voz full-duplex: escucha mientras el usuario habla y detecta el final de turno a partir de la señal de voz.
- Generación de respuestas habladas con latencia de primera audio de 0,28-0,38 segundos (mediana, con 2 usuarios simultáneos).
- Emisión de etiquetas de sonido paralingüístico (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`) interpretadas por el modelo tag-tts.
- Síntesis de voz expresiva mediante tag-tts, con voces empaquetadas en `voices/`.
- Clonación de voz zero-shot (según se indica en la documentación del repositorio).
- Modo Live (según README del repositorio).
- API compatible con OpenAI Realtime a través de `/v1/realtime`, y endpoint `/v1/chat/completions`.
- Capacidades de conocimiento textual medidas con CMMLU y MMLU-Pro (600 preguntas cada uno).
- Idiomas: chino e inglés.
- Soporte de hasta 4 conversaciones simultáneas en la configuración de 24 GB (según `start.sh`).

## Casos de uso

- Atención al cliente por voz en tiempo real: el modelo mantiene conversaciones multi-turno full-duplex, detecta cuándo termina de hablar el usuario y responde con voz sintetizada en menos de medio segundo, lo que permite sustituir menus IVR por diálogo natural.
- Asistentes de voz embebidos en aplicaciones: al caber en una única GPU de 24 GB, puede desplegarse en un servidor con RTX 4090 o 3090 para dar servicio a varios usuarios concurrentes (hasta 4 conversaciones según la configuración de arranque).
- Pruebas de usabilidad y prototipado de interfaces conversacionales: el modo full-duplex y las etiquetas paralingüísticas permiten evaluar respuestas con risas, suspiros o énfasis sin necesidad de grabar actores de voz.
- Generación de contenido de audio expresivo: las etiquetas `[laughter]`, `[sigh]`, `[breath]` y `<strong>…</strong>` permiten producir locuciones con carga emocional para audiolibros, pódcast o vídeos.
- Clonación de voz para accesibilidad: la clonación zero-shot permite generar una voz personalizada para personas con dificultades del habla, siempre con consentimiento y permiso sobre la voz clonada.
- Integración en pipelines compatibles con OpenAI Realtime: al exponer `/v1/realtime`, puede conectarse a clientes y frameworks ya existentes para OpenAI Realtime sin reescribir la capa de integración.
- Evaluación comparativa de cuantización: la disponibilidad de la build bf16 y de esta W4 con los mismos scripts permite medir el impacto de la cuantización en calidad y latencia en un entorno controlado.

## Benchmarks y rendimiento

| Metrica | W4 (esta version) | bf16 |
|---|---|---|
| CMMLU (600 preguntas, texto) | 69,5 | 71,3 |
| MMLU-Pro (600 preguntas, texto) | 42,7 | 44,3 |
| Etiquetas de sonido en 300 conversaciones habladas reservadas: respuestas válidas | 99,3% | 100% |
| Etiquetas de sonido en 300 conversaciones habladas reservadas: respuestas con etiquetas | 15,3% | 12,7% |
| Tasa de error de la respuesta hablada (ASR, 40 zh / 40 en) | 3,2% / 0,7% | 3,1% / 1,9% |
| Primera audio, 2 usuarios simultáneos (mediana) | 0,28-0,38 s | 0,29-0,38 s |

Mediciones realizadas el 18 de noviembre de 2026 en una H100 con el presupuesto de memoria de la configuración de 24 GB (cuota de cada etapa de una tarjeta de 24 GB convertida a la tarjeta de 80 GB), con los mismos scripts para ambas columnas. La memoria indicada es la suma de los tres procesos de etapa. No se ha verificado todavía en una tarjeta física de 24 GB.

## Requisitos de hardware

- VRAM estimada: unos 21 GB en la configuración de 24 GB (suma de los tres procesos de etapa).
- GPU recomendadas: una única GPU de 24 GB (RTX 4090, RTX 3090 o clase equivalente). La build bf16 requiere una GPU de 32 GB y usa unos 27 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090. Advertencia del autor: un escritorio que además alimenta un monitor dispone de menos memoria libre; no se ha verificado aún en una tarjeta física de 24 GB.
- Opciones de despliegue: vLLM 0.30 con vLLM-Omni 0.30 y el plugin correspondiente; instalación mediante `install.sh` y arranque con `start.sh` (variables `SIZE=4B-W4`, `GPU`, `PORT`). Cliente de ejemplo en `client_example.py`.
- Latencia: primera audio de 0,28-0,38 segundos (mediana) con 2 usuarios simultáneos.
- Throughput: hasta 4 conversaciones simultáneas en la configuración de 24 GB (según `start.sh`).
- Alternativa sin GPU: API alojada de adventists.ai (compatible con OpenAI Realtime), con 3 horas de voz gratis al registrarse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| Sophon-Realtime-4B-Tag-W4 | 4B (thinker) | no disponible | GPTQ W4A16 | 1 GPU 24 GB (~21 GB) | Apache-2.0 | zh, en |
| Sophon-Realtime-4B-Tag (bf16) | 4B (thinker) | no disponible | bf16 | 1 GPU 32 GB (~27 GB) | Apache-2.0 | zh, en |
| Otros modelos speech-to-speech full-duplex | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de otros modelos de voz a voz comparables, por lo que la comparación se limita a las dos builds del mismo modelo.

## Limitaciones y advertencias

- La cuantización W4 reduce las puntuaciones de conocimiento en torno a 1,7 puntos (CMMLU y MMLU-Pro), magnitud similar al error de muestreo de 600 preguntas; el autor la considera dentro del ruido, pero conviene validarla en el caso de uso concreto.
- Solo se ha medido en una H100 con el presupuesto de memoria de la configuración de 24 GB; no se ha verificado en una tarjeta física de 24 GB, y un escritorio con monitor conectado dispone de menos memoria libre.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano.
- No se detalla la longitud de contexto ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos y cobertura.
- Riesgo de alucinación inherente a un modelo de lenguaje de 4B; las puntuaciones de MMLU-Pro (42,7 en W4) indican un conocimiento factual limitado.
- La clonación de voz zero-shot exige consentimiento: el autor advierte explícitamente de clonar solo la propia voz o una voz sobre la que se tenga permiso.
- La licencia Apache-2.0 permite uso comercial, pero el fichero `NOTICE` recoge las fuentes de los pesos empaquetados; conviene revisarlo antes de redistribuir.
- El sistema depende de vLLM 0.30 y vLLM-Omni 0.30 con un plugin específico, lo que limita la portabilidad frente a stacks de inferencia más extendidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag-W4
- Modelo base bf16: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- README del modo tag: https://github.com/adventists-ai/sophon-realtime/blob/main/tag/README.md
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- README en chino: `README_CN.md` (en el repositorio del modelo)
- API alojada (compatible con OpenAI Realtime): https://api.adventists.ai/console/
- Documentación de la API: https://api.adventists.ai/console/docs
