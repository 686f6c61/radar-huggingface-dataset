# arbazsiddiqui/voxlock

## Resumen

VoxLock es un modelo de aislamiento de voz (voice isolation) de código abierto desarrollado por Arbaz Siddiqui. Su función es conservar la voz del interlocutor principal (el "caller") y eliminar las voces de fondo que se cuelan en la misma sala antes de que el audio llegue al sistema de reconocimiento de voz (STT). A diferencia de los canceladores de ruido clásicos, VoxLock realiza extracción de hablante objetivo (target-speaker extraction): recibe una única señal de audio de la llamada y determina por sí mismo qué voz corresponde al usuario, sin necesidad de una referencia de voz previa.

El modelo parte de un checkpoint de REAL-TSE causal y se afina sobre una arquitectura BSRNN (Band-Split Recurrent Neural Network) con 27,2 millones de parámetros. Está pensado para agentes de voz y telefonía: funciona en streaming sobre CPU con 24 ms de latencia algorítmica y se integra con Pipecat y LiveKit. Su relevancia actual radica en que ofrece, con licencia Apache 2.0, un rendimiento que el autor sitúa por delante de soluciones comerciales de pago en el benchmark de Krisp.

La información disponible cubre especificaciones, benchmarks declarados por el autor e integraciones, pero no detalla la composición exacta del dataset de entrenamiento ni el proceso de optimización más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BSRNN (Band-Split Recurrent Neural Network), causal, para separación/extracción de hablante |
| Parametros totales | 27.258.122 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento en streaming por ventanas; latencia algorítmica de 24 ms) |
| Tipos de cuantizacion | INT8 (ONNX Runtime); pesos también en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Modelo base | Wespeaker/wespeaker-voxceleb-ecapa-tdnn512 (fine-tune) |
| Pipeline | audio-to-audio |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 2531 / 50 |

## Arquitectura y entrenamiento

VoxLock se basa en una red BSRNN causal, diseñada para separación de fuentes de audio con dependencia temporal limitada al pasado (streaming). El modelo parte del checkpoint REAL-TSE causal, que actúa como punto de arranque, y se afina sobre él. La extracción del hablante objetivo se resuelve de forma implícita a partir de la propia señal de llamada, sin embedding de referencia externo. El modelo base declarado es Wespeaker/wespeaker-voxceleb-ecapa-tdnn512, un extractor de embeddings de hablante ECAPA-TDNN, lo que sugiere que la identificación del interlocutor se apoya en representaciones de hablante derivadas de esa arquitectura.

En cuanto a datos, la model card cita los datasets openslr/librispeech_asr y edinburghcstr/ami, y evalúa sobre AMI con ventanas no vistas en entrenamiento (134 ventanas retenidas). No se especifica el número total de tokens ni de horas de audio empleadas, ni la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo de audio). La innovación destacable es la latencia algorítmica de 24 ms en streaming sobre CPU, junto con la cuantización INT8 para ONNX Runtime y su empaquetado para WebAssembly y para agentes de voz (Pipecat, LiveKit).

## Capacidades

- Aislamiento de voz del interlocutor principal en audio de llamadas y reuniones.
- Cancelación y eliminación de voces de fondo (background voice cancellation/removal).
- Extracción de hablante objetivo (target-speaker extraction) sin referencia de voz explícita.
- Mejora personalizada de voz (personalized speech enhancement) y speech enhancement general.
- Procesamiento en streaming de baja latencia (24 ms algorítmicos) apto para telefonía y agentes de voz.
- Ejecución en CPU con cuantización INT8 mediante ONNX Runtime.
- Integración con Pipecat (filtro) y LiveKit Agents (plugin).
- Despliegue en navegador vía WebAssembly.
- Salida audio-to-audio (señal de audio procesada, no texto).

## Casos de uso

- Agentes de voz en producción: VoxLock se inserta como filtro previo al STT en pipelines de Pipecat o LiveKit, de modo que el reconocedor solo recibe la voz del usuario y no las voces del entorno; su latencia de 24 ms encaja en conversaciones en tiempo real.
- Centros de llamadas y telefonía: en llamadas desde entornos ruidosos (oficinas, calles, salas compartidas), el modelo aísla al cliente antes de la transcripción, reduciendo errores de STT y mejorando la calidad del audio grabado.
- Transcripción de reuniones: en reuniones con varios participantes en la misma sala, configurando al portador del auricular como "caller", se aísla su voz para actas o subtítulos, como demuestra la evaluación sobre AMI.
- Atención al cliente automatizada: al eliminar voces de fondo antes del ASR, se reducen las alucinaciones del transcriptor y las respuestas erróneas del bot en conversaciones multi-turno.
- Procesamiento en el navegador o en el edge: gracias al formato ONNX INT8 y a WebAssembly, puede ejecutarse en cliente para limpiar el micrófono antes de enviar audio a un servidor, reduciendo ancho de banda y preservando privacidad.
- Preprocesado para pipelines de STT propios: se puede encadenar delante de cualquier reconocedor (el benchmark usa Parakeet TDT 0.6B) para mejorar la tasa de error de palabra sin cambiar el resto del stack.
- Grabación y postproducción de audio de llamadas: limpieza de grabaciones donde varias personas hablan en la misma sala, conservando únicamente al interlocutor de interés.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el Krisp Voice Isolation Benchmark, 265 grabaciones reales, transcritas con Parakeet TDT 0.6B v2:

| Modelo | Acceso | WER % | Palabras de fondo filtradas / min |
|---|---|---|---|
| VoxLock | abierto | 4,95 | 0,11 |
| Krisp VI 2.5 Default | pago | 5,30 | 1,52 |
| Krisp VI 2.5 Balanced | pago | 5,32 | 2,02 |
| Krisp VI 2.5 HD | pago | 5,79 | 2,74 |
| Krisp VI 2.5 Lite | pago | 6,21 | 4,52 |
| ai-coustics Voice Focus 2.2 L | pago | 6,84 | 0,66 |
| ai-coustics Voice Focus 2.2 S | pago | 6,91 | 1,00 |
| Sanas Voice Isolation SE 1.0 | pago | 9,38 | 13,76 |
| REAL-TSE causal (checkpoint inicial) | abierto | 9,81 | 13,73 |
| Hush | abierto | 12,09 | 19,58 |
| DeepFilterNet3 | abierto | 13,30 | 22,77 |
| TIGER | abierto | 14,72 | 37,24 |
| Sin procesado | — | 23,21 | 66,48 |
| SAM-Audio small (Meta) | abierto | 33,77 | 21,15 |
| ElevenLabs Voice Isolator | pago | 43,79* | 144,6* |

\* ElevenLabs se evaluó solo sobre las 7 grabaciones con más voz de fondo, no sobre las 265. En esas mismas 7, sin procesado se obtiene 45,82 % y 154,3 palabras filtradas/min, y VoxLock 2,98 % y 0,0.

Sobre reuniones AMI reales no vistas en entrenamiento (portador del auricular como caller, 134 ventanas retenidas), con Parakeet TDT 0.6B v3:

| Modelo | Acceso | WER % | Palabras de fondo filtradas / min |
|---|---|---|---|
| VoxLock | abierto | 10,12 | 2,12 |
| ai-coustics Voice Focus 2.2 S | pago | 11,85 | 1,06 |
| ai-coustics Voice Focus 2.2 L | pago | 12,13 | 1,72 |
| Sanas Voice Isolation SE 1.0 | pago | 13,30 | 5,30 |
| TIGER | abierto | 22,84 | 36,85 |
| DeepFilterNet3 | abierto | 26,78 | 38,84 |
| Hush | abierto | 33,00 | 68,93 |
| Sin procesado | — | 33,03 | 78,34 |

El autor indica que los detalles de palabras del caller perdidas, deleciones, inserciones e intervalos de confianza al 95 % están en bench/results del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 27,2 M de parámetros, el peso en FP32 ronda los 109 MB y en INT8 unos 27 MB; la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 4090) es sobradamente suficiente, y también GPU de datacenter (A100, H100) si se busca máximo throughput por lote.
- Cabe en GPU consumer: sí, con amplio margen; el caso de uso principal declarado es CPU en streaming.
- Opciones de despliegue: ONNX Runtime (INT8), PyTorch, WebAssembly, integración con Pipecat y LiveKit Agents.
- Latencia y throughput: latencia algorítmica de 24 ms en streaming sobre CPU (dato del autor); throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | WER Krisp % | Palabras filtradas/min | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxLock | 27,2 M | streaming, 24 ms de latencia | 4,95 | 0,11 | Apache 2.0 | abierto (HF, pip, GitHub) |
| DeepFilterNet3 | no disponible | streaming | 13,30 | 22,77 | no disponible en la información | abierto |
| TIGER | no disponible | no disponible | 14,72 | 37,24 | no disponible en la información | abierto |
| Hush | no disponible | no disponible | 12,09 | 19,58 | no disponible en la información | abierto |
| Krisp VI 2.5 Default | no disponible | no disponible | 5,30 | 1,52 | propietaria | servicio de pago |

La comparación se limita a los datos publicados por el autor; no se dispone de parámetros ni licencias de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente (campo "verified: false" en el model-index).
- El modelo solo declara soporte de inglés; su comportamiento en otros idiomas no está documentado.
- Está diseñado para extracción de hablante objetivo en escenarios de llamada; puede degradarse si el "caller" no es identificable de forma consistente o si hay múltiples voces solapadas de similar energía.
- Riesgo de eliminar palabras del propio interlocutor (deleciones), que el autor cuantifica en el repositorio pero no en la model card; conviene revisar esos datos antes de producción.
- No se detalla la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo por dominio, acento o condición acústica.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- La evaluación con ElevenLabs se hizo sobre un subconjunto de 7 grabaciones, por lo que esa comparación no es directamente equiparable al resto.
- La latencia de 24 ms es algorítmica; la latencia extremo a extremo dependerá del pipeline (buffers, red, STT).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arbazsiddiqui/voxlock
- Paper (arXiv): https://arxiv.org/abs/2610.40727
- Código en GitHub: https://github.com/arbazsiddiqui/voxlock
- Paquete pip: https://pypi.org/project/voxlock/
- Demo en el navegador (Space): https://huggingface.co/spaces/arbazsiddiqui/voxlock
- Write-up del autor: https://arbazsiddiqui.me/voxlock
- Resultados de benchmark en el repositorio: https://github.com/arbazsiddiqui/voxlock/tree/main/bench/results
- Dataset de benchmark Krisp: https://huggingface.co/datasets/Krisp-AI/VoiceIsolation-Benchmark-Dataset
- Modelo base: https://huggingface.co/Wespeaker/wespeaker-voxceleb-ecapa-tdnn512
