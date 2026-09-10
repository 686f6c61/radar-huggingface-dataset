# llm-jp/kaburi-tts

## Resumen

KABURI-TTS es un sistema de síntesis de voz conversacional desarrollado por el grupo de trabajo de diálogo del Centro de Investigación y Desarrollo de Grandes Modelos de Lenguaje (LLMC) del Instituto Nacional de Informática de Japón (NII). A diferencia de un TTS convencional, genera simultáneamente dos canales de audio (izquierdo y derecho) correspondientes a dos hablantes de una conversación en japonés, reproduciendo la estructura temporal propia del diálogo: turnos solapados (*kaburi*), respuestas de acompañamiento (*aizuchi*), pausas y silencios previos al turno, todo ello a partir únicamente del texto.

El componente acústico es un modelo de *rectified flow* derivado por ajuste fino de Irodori-TTS-500M-v2 (aproximadamente 500 millones de parámetros) adaptado al dominio del diálogo, que genera ambos canales de forma simultánea condicionado por la secuencia de fonemas, la actividad de habla y audio de referencia de cada hablante, con *classifier-free guidance* a escala 2.5. Los latentes se decodifican a estéreo de 48 kHz mediante el códec Semantic-DACVAE-Japanese-32dim (32 dimensiones, 25 fps).

Se distribuye junto a tres componentes auxiliares: dos modelos pequeños de generación de *raster* fonémico (un *realizer* que decide qué fonemas se pronuncian y su duración, y un modelo de *gap* que fija el inicio de cada intervención), un predictor ligero de tipo Transformer para duraciones y solapamientos, y un conversor de texto escrito a estilo hablado ajustado desde llm-jp-3-440m. Es relevante porque aborda un problema poco cubierto por los TTS comerciales: la generación de diálogo sintético con solapamiento y retroalimentación conversacional realista, útil para aumentación de datos y evaluación de sistemas de reconocimiento de habla con múltiples hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acustico de rectified flow (flow matching) con generacion bi-canal; componentes auxiliares basados en Transformer ligero (predictor) y en llm-jp-3-440m (conversor de texto) |
| Parametros totales | Aproximadamente 500 M en el modelo acustico (derivado de Irodori-TTS-500M-v2); 440 M en el conversor de texto (llm-jp-3-440m); el resto de componentes (realizer, gap model, predictor) son modelos pequenos, sin recuento publicado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 en los pesos y configuraciones de este repositorio; se aplican ademas las licencias de los derivados: MIT para el modelo acustico (Irodori-TTS-500M-v2) y MIT para el codec Semantic-DACVAE-Japanese-32dim; Apache 2.0 para el conversor de texto (llm-jp-3-440m) |
| Formato de pesos | safetensors (libreria PyTorch) |
| Tamano del repositorio | 4,3 GB |
| Modelo base | Aratako/Irodori-TTS-500M-v2 |
| Codificador/decodificador de audio | Semantic-DACVAE-Japanese-32dim (32 dim, 25 fps) |
| Formato de salida | Audio estereo a 48 kHz, dos canales (un hablante por canal) |
| Datos de entrenamiento | LLM-jp-Zoom1 (corpus de dialogo libre en japones de dos hablantes, construido por NII LLMC) |
| Fecha de creacion / ultima actualizacion | 2026-07-21 / 2026-09-09 |
| Descargas / likes en HuggingFace | 0 descargas, 9 likes |

## Arquitectura y entrenamiento

El nucleo del sistema es un modelo acustico de *rectified flow* que genera los dos canales de forma conjunta: la entrada son la secuencia de fonemas, la informacion de actividad de cada intervencion y audio de referencia de los hablantes, y la salida son latentes que se decodifican a audio estereo de 48 kHz mediante el codec Semantic-DACVAE-Japanese-32dim (32 dimensiones, 25 fps). En inferencia se aplica *classifier-free guidance* con `cfg_scale=2.5`. El modelo parte de Irodori-TTS-500M-v2 y se adapta al dominio del dialogo conversacional, por lo que hereda aproximadamente 500 millones de parametros.

La generacion del *raster* fonemico se reparte en dos modelos pequenos entrenados con las duraciones medidas en el corpus LLM-jp-Zoom1: el *realizer* determina que fonemas se pronuncian realmente y su duracion, mientras que el modelo de *gap* decide cuando arranca cada intervencion, incluyendo pausas y solapamientos. La version publicada sustituye el unico predictor de *timing* de la version del articulo por esa separacion en *realizer* y modelo de *gap*; la configuracion original sigue disponible en el directorio `predictor/` y se activa con `--paper-mode`, con el codigo correspondiente bajo la etiqueta `paper-release-v1` del repositorio. El ultimo componente es un conversor que reescribe dialogo de estilo escrito a estilo hablado (turnos cortos, *aizuchi*, muletillas), obtenido por ajuste fino de llm-jp-3-440m. La model card no detalla el numero total de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Sintesis de voz multi-hablante en japones con dos hablantes simultaneos, uno por canal de audio.
- Generacion de estructura temporal conversacional a partir de texto: solapamientos, respuestas de acompanamiento, pausas y silencios previos al turno.
- Control de la identidad vocal mediante audio de referencia de cada hablante.
- Conversion de dialogo en estilo escrito a estilo hablado conversacional.
- Prediccion de duraciones por fonema, silencios previos a la intervencion y desfases o solapamientos entre canales.
- Salida de audio estereo a 48 kHz.
- No se documentan capacidades de *tool calling*, agentes ni razonamiento multi-paso: no es un modelo de lenguaje conversacional, sino un sistema de sintesis.
- No se documentan capacidades de vision ni de audio de entrada mas alla del audio de referencia de hablante.

## Casos de uso

- Generacion de corpus de dialogo sintetico para entrenamiento: se puede producir dialogo japones con solapamiento y retroalimentacion a partir de transcripciones, lo que permite ampliar conjuntos de datos para sistemas de reconocimiento de habla multi-hablante y diarizacion.
- Evaluacion de ASR con habla solapada: el sistema genera pares de referencia con solapamiento controlado, utiles para medir la degradacion de sistemas de reconocimiento cuando dos hablantes hablan a la vez.
- Prototipado de agentes de voz: permite simular conversaciones con turnos superpuestos y *aizuchi* para probar la logica de turnos de un asistente antes de disponer de grabaciones reales.
- Pruebas de sistemas de atencion al cliente: se pueden generar llamadas sinteticas de centro de contacto en japones con interrupciones y confirmaciones para validar analitica de conversaciones y deteccion de intenciones.
- Audiolibro o contenido narrativo dialogado: al aceptar audio de referencia de cada personaje y producir dos canales simultaneos, permite doblar escenas de dos personajes manteniendo la naturalidad del intercambio de turnos.
- Material didactico para estudiantes de japones: la reproduccion de *aizuchi*, pausas y solapamientos aporta muestras de conversacion coloquial dificiles de obtener de un TTS convencional de lectura.
- Investigacion en prosodia y analisis conversacional: el sistema permite manipular el texto de entrada y observar como cambia la temporizacion generada, util para estudiar patrones de toma de turno.
- Aumentacion de datos para deteccion de actividad vocal: la generacion controlada de pausas y solapamientos sirve para entrenar y evaluar modelos de VAD en condiciones de habla simultanea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, CER, similitud de hablante) ni comparaciones numericas con otros sistemas; unicamente referencia el articulo asociado y las muestras de audio de la pagina de demostracion del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para el modelo acustico: en torno a 1 GB en bf16/fp16 para los aproximadamente 500 M de parametros, mas la memoria del decodificador Semantic-DACVAE-Japanese-32dim y los estados intermedios de la generacion por *rectified flow* con *classifier-free guidance* (que duplica el calculo por paso). El repositorio completo ocupa 4,3 GB, aunque no todo se carga simultaneamente en memoria.
- El conversor de texto (llm-jp-3-440m) anade aproximadamente 0,9-1,8 GB adicionales segun la precision, si se usa en el mismo proceso.
- GPU recomendadas: no hay requisitos oficiales publicados. Por tamano, el sistema es manejable en GPU de consumo; no se documenta soporte ni optimizacion especifica para A100, H100 o similares.
- Cabe en GPU de consumo: con un modelo acustico de ~500 M de parametros, una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) deberia ser suficiente en bf16/fp16, incluyendo el codec y los componentes auxiliares. No hay cifras oficiales confirmadas.
- Opciones de despliegue: la model card remite al repositorio de GitHub para el codigo de uso; no se documenta integracion con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a este tipo de sistema). El formato de pesos es safetensors sobre PyTorch.
- Latencia y throughput: no disponible.
- No se documentan variantes cuantizadas ni versiones optimizadas para inferencia en CPU.

## Comparativa con modelos similares

| Sistema | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KABURI-TTS | ~500 M (acustico) + componentes auxiliares | No disponible | Estereo 48 kHz, dos hablantes simultaneos, solapamiento | Apache 2.0 (con MIT en dependencias) | HuggingFace llm-jp/kaburi-tts, codigo en GitHub |
| Irodori-TTS-500M-v2 (modelo base) | ~500 M | No disponible | Audio mono de un solo hablante (uso como TTS base) | MIT | HuggingFace Aratako/Irodori-TTS-500M-v2 |
| ElevenLabs TTS japones | No disponible | No disponible | Audio de un solo hablante, sin generacion de dialogo bi-canal | Propietaria, servicio en la nube | API comercial |

La diferencia funcional principal frente a estos dos sistemas es que KABURI-TTS genera dos canales simultaneos con solapamiento y *aizuchi* desde texto, una funcionalidad que no ofrecen ni los TTS de un solo hablante ni los servicios comerciales de sintesis en la nube. No se dispone de datos de rendimiento comparativos entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- La calidad de salida esta acotada por el codec DACVAE (32 dimensiones, 25 fps), que actua como techo de fidelidad del audio generado.
- Las palabras que no aparecen en el diccionario de grafema a fonema (G2P) pueden generar lecturas poco claras o incorrectas.
- Pueden persistir fragmentos con prosodia poco natural.
- La clonacion de voz depende de la calidad del audio de referencia: funciona mejor con grabaciones de condiciones similares a las de entrenamiento (conversacion natural de reunion en linea, unos 10 segundos, con el hablante interviniendo activamente). Con audio de locucion en estudio la calidad baja.
- Solo soporta japones; no se documenta ningun otro idioma ni variantes dialectales.
- La model card no documenta evaluaciones de sesgo. Se advierte de que la salida puede contener sesgos procedentes de los datos de entrenamiento y contenido inexacto o inapropiado.
- Riesgo de uso malintencionado para suplantacion, fraude o generacion de desinformacion; se recomienda explicitamente no emplearlo con esos fines y revisar tambien las advertencias del modelo base Irodori-TTS-500M-v2.
- Restricciones de licencia: los pesos y configuraciones del repositorio son Apache 2.0, pero se aplican acumulativamente las licencias de los derivados (MIT del modelo acustico, MIT del codec, Apache 2.0 del conversor de texto). El codec se descarga automaticamente durante la sintesis y no se redistribuye en el repositorio.
- Las voces de referencia no se incluyen en el repositorio; los audios de la demostracion en GitHub estan sujetos a las condiciones de uso del corpus JVS.
- No se documentan versiones cuantizadas, requisitos de hardware oficiales ni metricas de latencia, por lo que el dimensionamiento de un despliegue en produccion requiere pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-jp/kaburi-tts
- Repositorio de codigo y demo: https://github.com/llm-jp/kaburi-tts
- Articulo (preprint): https://arxiv.org/abs/2609.07200
- Modelo base acustico: https://huggingface.co/Aratako/Irodori-TTS-500M-v2
- Codec de audio: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Modelo base del conversor de texto: https://huggingface.co/llm-jp/llm-jp-3-440m
- Condiciones de licencia de los audios de demo: https://github.com/llm-jp/kaburi-tts/blob/main/docs/LICENSE-audio.md
- Corpus JVS: https://sites.google.com/site/shinnosuketakamichi/research-topics/jvs_corpus
- Recopilatorio de modelos japoneses de LLM-jp: https://llm-jp.github.io/awesome-japanese-llm/en/
