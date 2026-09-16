# lggvu/videovap-candor-avcocktail-ft

## Resumen

VideoVAP — Candor -> AVCocktail (fine-tuned) es un checkpoint de un modelo de Voice Activity Projection (VAP) orientado a la prediccion de turnos de palabra (turn-taking) en conversaciones. Lo publica el usuario lggvu en Hugging Face y su unica descripcion tecnica es la que aparece en la model card: se trata de un modelo transformer "video-only" con estereo, entrenado previamente sobre el corpus Candor y afinado despues sobre el corpus AVCocktail.

El problema que aborda es el de anticipar la actividad de voz futura de los interlocutores, una tarea distinta de la deteccion de actividad de voz clasica (VAD). La VAP predice la evolucion de la voz de cada participante en una ventana temporal futura, lo que permite a un sistema dialogante decidir cuando debe tomar el turno, cuando debe cederlo y cuando debe permanecer en silencio. Esto es relevante para agentes conversacionales de baja latencia, transcripcion diarizada y sistemas de interaccion humano-maquina que deben respetar la dinamica natural de la conversacion.

La informacion publicada es muy limitada: no se declaran parametros, arquitectura detallada, longitud de contexto, idiomas ni licencia, y el repositorio no tiene descargas ni valoraciones. El checkpoint corresponde a la epoca 7 con val/loss = 0.8184, descrito como el mejor checkpoint. El codigo fuente asociado esta en el repositorio mm-turn-taking del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer "video-only" con estereo, para Voice Activity Projection (VAP); detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica un checkpoint en formato .ckpt) |
| Idiomas soportados | no disponible |
| Licencia | unknown (no se especifica licencia) |
| Formato de pesos | PyTorch Lightning checkpoint (`checkpoint.ckpt`) e hiperparametros en `hparams.yaml`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card describe el modelo como un "video-only stereo transformer Voice Activity Projection (VAP) turn-taking model". Es decir, la entrada es multimodal en el sentido de que se apoya en informacion de video y en audio estereo, pero el autor lo etiqueta como "video-only", lo que sugiere que la prediccion se construye sobre la senal visual con el canal de audio estereo como soporte. No se publican detalles sobre el numero de capas, dimensiones de los embeddings, mecanismo de atencion, tokenizador ni estrategia de fusion de modalidades.

En cuanto al entrenamiento, la unica informacion disponible es que el modelo se preentreno sobre el corpus Candor y despues se afino sobre el corpus AVCocktail. No se indica el numero de tokens o de horas de audio/video utilizadas, la composicion exacta de los datasets, ni si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO) o decodificacion especulativa. El checkpoint publicado es el de la epoca 7, con val/loss = 0.8184, descrito explicitamente como el mejor checkpoint del proceso de ajuste. El codigo de entrenamiento e inferencia se distribuye por separado en el repositorio GitHub `lggvu/mm-turn-taking`, no dentro del repositorio de Hugging Face.

## Capacidades

- Prediccion de actividad de voz futura (Voice Activity Projection) para anticipar si cada interlocutor estara hablando en una ventana temporal posterior.
- Gestion de turnos de palabra (turn-taking): estimacion de puntos de transicion, solapamiento y cesion de turno.
- Procesamiento de entrada de video junto con audio estereo, segun la descripcion del autor.
- Orientado a escenarios conversacionales con multiples participantes, segun los corpus de entrenamiento citados (Candor y AVCocktail).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue ni generacion de texto.
- No se documenta modo "thinking", vision general, audio general ni ninguna otra capacidad adicional.
- Al ser un checkpoint de investigacion sin pipeline declarado en Hugging Face, no se anuncia una API estandar de inferencia.

## Casos de uso

- Agentes conversacionales por voz de baja latencia: el modelo permite estimar cuando el usuario ha terminado de hablar, de modo que el agente pueda responder sin pisar el turno del interlocutor ni dejar silencios excesivos. Es adecuado porque su tarea nativa es precisamente la proyeccion de actividad de voz.
- Analisis de conversaciones multipartitas: en reuniones grabadas en video, el modelo puede aportar senales de quien va a tomar la palabra y cuando, utiles para segmentar la reunion o para alinear transcripciones con hablantes.
- Diarizacion y post-procesado de transcripciones: las predicciones de turn-taking sirven como caracteristica adicional para desambiguar cambios de hablante en pasajes con solapamiento.
- Robots sociales y avatares interactivos: un robot equipado con camara estereo y microfono puede usar el modelo para sincronizar sus respuestas y su lenguaje no verbal con el ritmo de la conversacion.
- Sistemas de accesibilidad para personas con dificultades de habla: la anticipacion del turno permite construir interfaces que esperan de forma adaptativa a que el usuario complete su intervencion.
- Telepresencia y videoconferencia: deteccion de solapamientos y de momentos de cesion de turno para activar automaticamente la camara o el audio del participante que va a hablar.
- Investigacion en interaccion humano-maquina: reproduccion de experimentos sobre turn-taking con los corpus Candor y AVCocktail, usando el checkpoint como punto de partida para comparaciones.
- Evaluacion de modelos de dialogo oral: integracion del modelo como modulo auxiliar que aporta una senal de "quien habla despues" a un pipeline de dialogo mas amplio.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la perdida de validacion del checkpoint:

| Metrica | Valor | Contexto |
|---|---|---|
| val/loss | 0.8184 | Epoca 7, descrito como mejor checkpoint |
| Epoca | 7 | Proceso de fine-tuning sobre AVCocktail |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni metricas especificas de VAP como prediccion de continuacion de turno) en la informacion disponible. Tampoco se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Sin el numero de parametros ni las dimensiones del modelo no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. No se indica ninguna GPU concreta en la documentacion.
- Compatibilidad con GPU de consumo: no disponible. No hay datos para determinar si cabe en una RTX 4090, RTX 3090 u otras tarjetas de gama de consumo.
- Opciones de despliegue: el unico artefacto publicado es un checkpoint de PyTorch Lightning (`checkpoint.ckpt`) con `hparams.yaml`, por lo que la carga requiere PyTorch y el codigo de `mm-turn-taking`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Nota: aunque la model card lista `checkpoint.ckpt` entre los ficheros, el tamano del repositorio aparece como 0.0 GB, lo que conviene verificar antes de planificar un despliegue.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no incluye comparaciones, y no se han facilitado referencias a otros sistemas de Voice Activity Projection con los que contrastar parametros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lggvu/videovap-candor-avcocktail-ft | no disponible | no disponible | val/loss 0.8184 (epoca 7) | unknown | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia figura como "unknown", por lo que no hay autorizacion explicita de uso comercial ni condiciones de redistribucion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- No se declaran los idiomas soportados, por lo que no puede asumirse cobertura multilingue ni siquiera monolingue concreta.
- No se especifican sesgos conocidos, pero al entrenarse sobre corpus conversacionales concretos (Candor y AVCocktail) es esperable que herede las caracteristicas de dominio, acento, genero y contexto de esos datasets; no hay datos publicados al respecto.
- Riesgo de alucinacion en el sentido de proyecciones erroneas de actividad de voz: al predecir el futuro de la conversacion, el modelo puede anticipar turnos que finalmente no ocurren. No se han publicado tasas de error especificas mas alla del val/loss.
- La tarea es de prediccion de actividad de voz, no de comprension semantica: el modelo no genera texto ni mantiene contexto linguistico en el sentido habitual de un LLM.
- No se documentan la longitud de contexto ni la ventana temporal de prediccion, lo que impide garantizar su comportamiento en conversaciones largas o con muchos participantes.
- La discrepancia entre el tamano del repositorio (0.0 GB) y la presencia declarada de `checkpoint.ckpt` conviene verificarse; el repositorio no tiene descargas ni likes, lo que limita la evidencia de uso real por terceros.
- No se ofrece pipeline en Hugging Face, por lo que la integracion requiere el codigo externo del repositorio `mm-turn-taking` y conocimiento del formato de checkpoint de PyTorch Lightning.
- El checkpoint publicado corresponde a una unica epoca (la 7); no se informa de la variabilidad entre ejecuciones ni de la semilla utilizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lggvu/videovap-candor-avcocktail-ft
- Codigo fuente (mm-turn-taking): https://github.com/lggvu/mm-turn-taking
- Paper, blog o demo del modelo: no disponible
- Referencias a los corpus Candor y AVCocktail: no disponibles en la informacion proporcionada
