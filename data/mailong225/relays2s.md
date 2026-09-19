# mailong225/relays2s

## Resumen

RelayS2S es un modelo de voz a voz (speech-to-speech) full-duplex presentado por el autor mailong225 bajo el título "Dual-Path Speculative Generation for Real-Time Dialogue". Su planteamiento es híbrido: un modelo duplex de "camino rápido" redacta de forma especulativa un prefijo corto de respuesta y, a continuación, cede el testigo a un pipeline en cascada ASR → LLM para completar la respuesta. Un verificador aprendido de pequeño tamaño decide si ese prefijo especulado es seguro para emitirlo en voz alta, lo que reduce el coste de generar audio que luego haya que descartar.

El sistema se apoya en el backbone Qwen2.5-0.5B (0,5 mil millones de parámetros), al que se añade un encoder de voz de tipo Conformer y un adaptador CNN. El modelo consume un reloj de tramas de 160 ms y emite exactamente un token por trama, lo que fija un techo teórico de 6,25 tokens por segundo. El tokenizador amplía el vocabulario de Qwen con tokens de control específicos para gestionar silencio, inicio y fin de habla, backchannel, interrupción del usuario (barge-in) y handoff.

Es relevante ahora porque aborda uno de los problemas prácticos de los asistentes de voz conversacionales: la latencia de la primera respuesta y la detección fiable del fin de turno. Sin embargo, la propia model card documenta dos advertencias críticas: el modelo solo detecta el fin de turno sobre silencio digital exacto (cero absoluto), lo que exige una puerta de ruido en audio real de micrófono, y el umbral del verificador está calibrado en 0,405 y no en 0,5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Duplex speech-to-speech con generacion especulativa de doble camino; encoder Conformer + adaptador CNN + backbone LLM Qwen2.5-0.5B, mas un verificador de prefijos |
| Parametros totales | No disponible (el backbone es Qwen2.5-0.5B, 0,5 B; no se publica el total del sistema completo). El verificador tiene ~170 000 parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo S2S; el backbone Qwen2.5-0.5B soporta hasta 32 768 tokens. El modelo consume tramas de 160 ms y emite un token por trama |
| Tipos de cuantizacion | No disponible (solo se publican checkpoints PyTorch; no hay versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0, con advertencia del propio autor de que se aplica porque el backbone Qwen2.5-0.5B es Apache-2.0 y debe confirmarse para los pesos entrenados y el encoder de voz |
| Formato de pesos | PyTorch: checkpoint de PyTorch Lightning (`s2s/s2s.ckpt`) y ficheros `.pt` (`verifier/best_model.pt`, `pretrained/speech_encoder.pt`, `pretrained/adapter.pt`). No hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un sistema duplex de dos caminos. El camino rapido es un modelo S2S entrenado con PyTorch Lightning que genera especulativamente un prefijo corto de respuesta; ese borrador se evalua con un verificador de prefijos de aproximadamente 170 000 parametros que decide si es seguro emitirlo. Si el prefijo se acepta, el pipeline en cascada (ASR → LLM) continua la respuesta. Los componentes de voz son un encoder Conformer (`pretrained/speech_encoder.pt`) y un adaptador CNN (`pretrained/adapter.pt`), ambos descritos como inicializacion de "stage-0", es decir, puntos de partida de entrenamiento y no pesos finales afinados. El tokenizador es el de Qwen2.5-0.5B, ampliado con tokens de control.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Lo que si se documenta es que el modelo se entreno sobre dialogos sintetizados cuyos silencios entre turnos son literalmente `0.0` (100 % de muestras a cero), y que aprendio ese cero exacto como la senal de fin de turno. Esta eleccion de datos es la causa directa de la limitacion de deteccion de fin de turno descrita mas abajo. El reloj de tramas es de 160 ms con una emision de un token por trama, y el checkpoint `s2s.ckpt` (6,0 GB) contiene aproximadamente un 58 % de estado del optimizador Adam no utilizable en inferencia, siendo el peso real de los pesos de 2,79 GB.

## Capacidades

- Generacion de voz a voz duplex en tiempo real, con redaccion especulativa de un prefijo de respuesta y continuacion mediante pipeline ASR → LLM.
- Control explicito del turno de habla mediante tokens dedicados: `[SIL]` (permanecer en silencio), `[BOS]` (empezar a hablar), `[EOS]`, `[BOC]` (backchannel), `[STP]` (parada por interrupcion del usuario o barge-in) y `[HOD]` (handoff). La model card los describe como "cinco" tokens de control aunque lista seis.
- Gestion de barge-in (interrupcion del usuario mientras el modelo habla) a traves del token `[STP]`.
- Emision de backchannel, es decir, respuestas breves de acompanamiento tipicas de la conversacion humana.
- Verificacion de prefijos: un verificador entrenado filtra prefijos no seguros antes de sintetizarlos.
- Decodificacion especulativa aplicada a audio (el propio tag del repositorio la menciona), orientada a reducir latencia.
- No se documentan capacidades de vision, tool calling, function calling ni razonamiento multi-paso; no hay informacion al respecto.

## Casos de uso

- Asistentes de voz full-duplex en tiempo real: el modelo esta disenado para mantener conversaciones donde ambos interlocutores pueden hablar e interrumpir, con un reloj de 160 ms que acota la latencia de reaccion. Es adecuado para prototipos de asistentes tipo llamada telefonica.
- Atencion al cliente automatizada por voz: el token `[BOC]` permite emitir acompanamientos breves ("ya veo", "entiendo") que hacen la interaccion mas natural, y `[STP]` permite ceder el turno cuando el usuario interrumpe.
- Agentes de voz con deteccion de barge-in: util en sistemas de dictado, busqueda por voz o control de dispositivos donde el usuario quiere corregir al asistente a mitad de respuesta.
- Replay y validacion de datasets de dialogo: la model card indica que el replay de datasets no necesita puerta de ruido, lo que hace al modelo util para reproducir y auditar corpus de dialogo grabados o sintetizados.
- Investigacion en decodificacion especulativa aplicada a audio: el esquema de prefijo especulativo mas verificador (~170 K parametros) es un objeto de estudio reproducible para medir relaciones entre recall de prefijos malos y tasa de descarte.
- Prototipado en hardware modesto: con pesos de 2,79 GB y un backbone de 0,5 B, es viable experimentar en una unica GPU de gama consumer, algo poco habitual en modelos de voz a voz duplex de mayor tamano.
- Interaccion manos libres en entornos embebidos: su tamano contenido permite desplegarlo en estaciones locales sin depender de servicios en la nube, siempre que se anada la puerta de ruido necesaria.
- Evaluacion de pipelines en cascada ASR → LLM: sirve como banco de pruebas para estudiar donde conviene especular y donde conviene delegar en la cascada completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

El unico dato cuantitativo de rendimiento documentado corresponde al verificador de prefijos: con umbral 0,405 alcanza un 65,6 % de recall sobre prefijos malos manteniendo un 96,0 % de aceptacion de prefijos buenos, lo que equivale a una tasa de descarte de aproximadamente el 9,6 %.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 2,79 GB segun la model card. En precision completa (fp32) se puede estimar un consumo de entre 5 y 7 GB de VRAM contando encoder, adaptador, cache y activaciones; en fp16/bf16 la estimacion baja a 3-4 GB. Estas cifras son estimaciones derivadas del tamano de pesos, no datos publicados.
- El checkpoint `s2s.ckpt` ocupa 6,0 GB en disco, pero aproximadamente el 58 % es estado del optimizador Adam no necesario en inferencia; conviene extraer los pesos puros (2,79 GB) antes de desplegar.
- GPU recomendadas: por tamano, el modelo cabe en GPUs consumer como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090. Para despliegue en produccion con concurrencia, una A100 o H100 aportarian margen sobrado, aunque resultan sobredimensionadas para un backbone de 0,5 B.
- Si cabe en GPU consumer: si, dado el tamano de pesos. La incognita no es la VRAM sino la latencia, ya que el modelo exige inferencia en tiempo real a 160 ms por trama.
- Opciones de despliegue: el repositorio publica checkpoints de PyTorch/PyTorch Lightning, por lo que el despliegue natural es PyTorch nativo. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF.
- Latencia y throughput: el reloj de tramas es de 160 ms con exactamente un token por trama, lo que implica un maximo teorico de 6,25 tokens por segundo. No se publican mediciones de latencia real ni de throughput en hardware concreto.

## Comparativa con modelos similares

La informacion disponible sobre este modelo es limitada y la busqueda web no devolvio resultados tecnicos utiles, por lo que la comparacion se ofrece a nivel cualitativo. Los datos de los modelos alternativos provienen de su documentacion publica general y no han sido verificados en esta ficha.

| Modelo | Tarea | Enfoque | Pesos abiertos | Licencia |
|---|---|---|---|---|
| RelayS2S | Speech-to-speech duplex | Especulativo de doble camino + verificador, backbone Qwen2.5-0.5B | Si | Apache-2.0 (con reserva del autor sobre pesos entrenados) |
| Moshi (Kyutai) | Speech-to-speech duplex | Modelo unico duplex en tiempo real | Si | No verificada en esta ficha |
| Mini-Omni | Speech-to-speech | Modelo omni entrenado desde un LLM | Si | No verificada en esta ficha |
| Qwen2.5-Omni | Omni (texto, audio, vision) | Modelo omni multimodal, backbone de mayor tamano | Si | No verificada en esta ficha |

Diferencias clave: RelayS2S es un sistema compuesto (modelo duplex + verificador + cascada ASR → LLM) con un backbone muy pequeno (0,5 B), mientras que las alternativas citadas son modelos unicos de mayor tamano. La comparacion cuantitativa de parametros, contexto y rendimiento no esta disponible para RelayS2S.

## Limitaciones y advertencias

- Deteccion de fin de turno fragil: el modelo solo detecta el fin de turno sobre cero digital exacto, porque se entreno con silencios de valor literal `0.0`. Ruido de fondo real con RMS 1e-5 (unos -100 dB, inaudible) basta para que el token `[BOS]` deje de dispararse de forma completa y silenciosa, sin ningun mensaje de error.
- Requiere puerta de ruido en produccion: para audio de microfono real hay que anular las tramas silenciosas antes de que lleguen al modelo. El autor recomienda un umbral de RMS por trama de 0,01 con un hangover de dos tramas. El replay de datasets no necesita esta puerta.
- Umbral del verificador mal calibrado por defecto: el valor correcto es 0,405 (definido en `verifier/inference_config.json`), no 0,5. Usar 0,5 descarta mas prefijos de los previstos.
- Tokens de control obligatorios: el tokenizador amplia el vocabulario de Qwen con tokens de control que deben registrarse antes de cargar el modelo; si no, la matriz de embeddings no coincide.
- Registro de tokens inconsistente: la model card afirma que se anaden "cinco" tokens de control pero enumera seis; conviene verificar el conjunto real en el tokenizador publicado.
- Riesgo de alucinacion: no se documenta, pero al ser un pipeline en cascada ASR → LLM hereda los riesgos de reconocimiento y generacion de sus componentes.
- Cobertura de idioma limitada al ingles; no hay soporte multilingue documentado.
- Licencia: el autor advierte explicitamente de que el tag Apache-2.0 se debe a que el backbone Qwen2.5-0.5B es Apache-2.0, y pide confirmar que esa es la licencia deseada para los pesos entrenados y el encoder de voz antes de depender de ella. Hay que revisar este punto antes de cualquier uso comercial.
- Repositorio sin actividad: 0 descargas y 0 "likes" en el momento de la consulta, y la model card contiene un marcador de posicion sin rellenar para la URL del codigo (`<ADD REPO URL>`), por lo que no hay repositorio de codigo enlazado.
- Pesos incompletos para produccion: `speech_encoder.pt` y `adapter.pt` se describen como inicializaciones de "stage-0", no como pesos finales afinados, lo que sugiere que puede faltar trabajo de ajuste.
- Publicacion sin benchmarks: no hay resultados comparables publicos, lo que dificulta evaluar su calidad frente a alternativas.
- El checkpoint incluye un 58 % de estado del optimizador inutil en inferencia, lo que infla el almacenamiento y exige limpieza previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mailong225/relays2s
- Repositorio de codigo: no disponible (la model card contiene el marcador `<ADD REPO URL>` sin rellenar)
- Paper: citado en la model card como "RelayS2S: Dual-Path Speculative Generation for Real-Time Dialogue" (2025) con eprint `XXXX.XXXXX`, un marcador de posicion sin identificador real de arXiv
- Demos: no disponibles
- Otras referencias: la busqueda web no devolvio resultados tecnicos relevantes sobre este modelo
