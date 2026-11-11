# itzune/faster-whisper-large-v3-turbo-eu-cv22.0-int8

## Resumen

`itzune/faster-whisper-large-v3-turbo-eu-cv22.0-int8` es un modelo de reconocimiento automatico del habla (ASR) especializado en euskera (`eu`), distribuido en formato CTranslate2 con cuantizacion int8. No es un entrenamiento nuevo: se trata de una conversion de formato y cuantizacion del fine-tune `zuazo/whisper-large-v3-turbo-eu-cv22.0`, que a su vez deriva de `openai/whisper-large-v3-turbo`. El autor del repositorio es el usuario de Hugging Face `itzune`.

El modelo resuelve un problema concreto: desplegar reconocimiento de voz en euskera con `faster-whisper` y, en particular, en la integracion Whisper de Home Assistant, sobre CPU y con un consumo de memoria reducido. El repositorio ocupa 0,8 GB, lo que lo hace manejable en hardware modesto frente a los pesos originales en safetensors del modelo base.

La relevancia actual radica en que el euskera es un idioma de bajos recursos con poca representacion en los modelos ASR multilingues, y este artefacto ofrece un WER reportado de aproximadamente 8,24 % en el conjunto de test de Common Voice 22 (`eu`), segun la model card del modelo de origen, en un paquete listo para produccion ligera. La licencia MIT facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base es whisper-large-v3-turbo; el repositorio no declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no declarada en la model card) |
| Tipos de cuantizacion | int8 (unica variante publicada en este repositorio) |
| Idiomas soportados | euskera (`eu`) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo convertido con `ct2-transformers-converter`); incluye `tokenizer.json`, `preprocessor_config.json` y `generation_config.json` |
| Tamano del repositorio | 0,8 GB (820 MB en int8) |
| Libreria | ctranslate2 (`faster-whisper`) |
| Modelo base | `zuazo/whisper-large-v3-turbo-eu-cv22.0` (fine-tune de `openai/whisper-large-v3-turbo`) |
| Dataset de entrenamiento | Common Voice 22.0 (`eu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI para transcripcion y traduccion de voz multilingue. El fine-tune en euskera fue realizado por Xabier de Zuazo sobre Common Voice 22.0 en su variante `eu`, partiendo de los pesos de `openai/whisper-large-v3-turbo`. No se dispone de informacion sobre el numero de tokens de audio empleados, la composicion exacta del dataset mas alla de Common Voice 22.0, ni sobre si se aplicaron tecnicas de RLHF o DPO; la model card no los detalla.

La innovacion tecnica de este repositorio no reside en el entrenamiento, sino en la conversion: los pesos se transforman a CTranslate2 mediante `ct2-transformers-converter` con `--quantization int8`, manteniendo los pesos sin cambios y copiando los ficheros de tokenizador y configuracion. El resultado es un artefacto optimizado para inferencia en CPU con `faster-whisper`, con menor huella de memoria que los pesos originales. La model card advierte de que se trata exclusivamente de una conversion de formato y cuantizacion, no de un reentrenamiento.

## Capacidades

- Transcripcion de voz a texto en euskera (`eu`) con deteccion de idioma forzada mediante el parametro `language`.
- Reconocimiento automatico del habla sobre audio de hasta 30 segundos por ventana, con segmentacion interna para audios mas largos.
- Decodificacion con beam search configurable (la model card ejemplifica con `beam_size=5`).
- Ejecucion en CPU con cuantizacion int8, con aceleracion notable en CPUs que soportan AVX2.
- Integracion directa con `faster-whisper` (Python) y con la app Whisper de Home Assistant mediante configuracion `custom_model`.
- Salida de metadatos de idioma detectado y probabilidad asociada (`info.language`, `info.language_probability`).
- No se declaran capacidades de tool calling, agentes, vision, audio generation ni modo de razonamiento extendido; es un modelo puramente ASR.

## Casos de uso

- Asistentes de voz domestico en euskera: integracion en Home Assistant mediante la app Whisper con `language: eu` y `custom_model` apuntando a este repositorio; el formato int8 y la ejecucion en CPU permiten desplegarlo en un mini-PC o servidor domestico sin GPU.
- Transcripcion de reuniones y entrevistas en euskera: uso de `faster-whisper` con `beam_size=5` para generar subtitulos o actas; el WER reportado de ~8,24 % en Common Voice 22 lo hace viable para transcripcion asistida con revision humana.
- Subtitulado de contenido audiovisual en euskera: procesado por lotes de ficheros de audio o video extraido, aprovechando la baja huella de memoria (820 MB) para ejecutar varias instancias en paralelo en un solo servidor.
- Servicios de atencion ciudadana en euskera: transcripcion de llamadas o mensajes de voz en administraciones publicas, con la licencia MIT permitiendo su integracion en sistemas internos sin restricciones de uso comercial.
- Investigacion en ASR de bajos recursos: punto de partida reproducible para comparar fine-tunes en euskera, ya que el formato CTranslate2 acelera la evaluacion sobre Common Voice frente a los pesos originales.
- Prototipado rapido en portatiles sin GPU: al ejecutarse en CPU con int8, permite validar pipelines de voz en euskera en equipos de desarrollo convencionales antes de escalar a infraestructura mayor.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenidos en euskera, desplegable en entornos con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Valor | Fuente |
|---|---|---|
| WER en Common Voice 22 `eu` (test) | ~8,24 % | Model card del modelo de origen (`zuazo/whisper-large-v3-turbo-eu-cv22.0`) |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni comparativas numericas con modelos alternativos. La model card no incluye mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo esta pensado para CPU; el repositorio ocupa 820 MB en int8 y la memoria en ejecucion es del orden de ese tamano mas overhead.
- GPU recomendadas: no especificadas en la model card; `faster-whisper` puede ejecutarse en GPU con `device="cuda"`, pero el autor no documenta requisitos ni rendimiento en GPU para este artefacto.
- Cabe en CPU consumer: si, es el escenario documentado. CPUs con AVX2 son considerablemente mas rapidas segun la model card.
- Opciones de despliegue: `faster-whisper` (Python, libreria CTranslate2) y la app Whisper de Home Assistant. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: no disponibles. La model card solo indica cualitativamente que es el mas preciso de los cuatro modelos comparados por el autor, pero el mas lento en CPU por su encoder grande.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (CV22 eu) | Licencia | Formato |
|---|---|---|---|---|---|
| `itzune/faster-whisper-large-v3-turbo-eu-cv22.0-int8` | no disponible (base large-v3-turbo) | ventana de 30 s (Whisper) | ~8,24 % (reportado por el modelo origen) | MIT | CTranslate2 int8 |
| `zuazo/whisper-large-v3-turbo-eu-cv22.0` | no disponible (base large-v3-turbo) | ventana de 30 s (Whisper) | ~8,24 % | MIT | safetensors (Transformers) |
| `openai/whisper-large-v3-turbo` | no disponible en la informacion proporcionada | ventana de 30 s (Whisper) | no disponible para `eu` en la informacion | MIT (pesos de OpenAI) | safetensors |

La model card menciona que este modelo es "el mas preciso de los cuatro" comparados por el autor, pero no detalla cuales son los otros tres ni sus metricas, por lo que no es posible completar una comparativa numerica con alternativas. No se dispone de datos de otros modelos ASR en euskera en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-idioma: solo soporta euskera (`eu`); no debe usarse para otros idiomas aunque Whisper tenga capacidad multilingue, ya que el fine-tune lo especializa.
- La deteccion automatica de idioma (`auto`) es mucho mas lenta que fijar `language: eu`; la model card recomienda fijarlo explicitamente.
- Rendimiento en CPU: es el mas lento de los modelos comparados por el autor por el tamano del encoder; sin AVX2 la velocidad cae notablemente.
- Riesgo de alucinacion: no documentado en la model card, pero es un comportamiento conocido de los modelos Whisper en segmentos de silencio o audio ruidoso; requiere validacion en produccion.
- Sesgos: no documentados; al entrenarse sobre Common Voice 22.0, hereda los sesgos de composicion de ese corpus (demografia de hablantes, acentos y condiciones de grabacion).
- Restricciones de licencia: MIT, permite uso comercial, pero el usuario debe verificar la licencia del modelo base de OpenAI (`openai/whisper-large-v3-turbo`) y del fine-tune intermedio.
- El repositorio debe permanecer publico para usarse con la app Whisper de Home Assistant, ya que dicha integracion no se autentica contra el Hub.
- El WER de ~8,24 % procede de la model card del modelo de origen, no de una evaluacion independiente de esta conversion; la cuantizacion int8 puede introducir una degradacion adicional no medida en la informacion disponible.
- Sin datos publicados de latencia, throughput ni requisitos de GPU para este artefacto concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/itzune/faster-whisper-large-v3-turbo-eu-cv22.0-int8
- Modelo base (fine-tune en euskera): https://huggingface.co/zuazo/whisper-large-v3-turbo-eu-cv22.0
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- faster-whisper (SYSTRAN): https://github.com/SYSTRAN/faster-whisper
- CTranslate2 (OpenNMT): no se proporciona URL especifica en la informacion disponible
- Dataset Common Voice 22.0: no se proporciona URL especifica en la informacion disponible
- Home Assistant (integracion Whisper): no se proporciona URL especifica en la informacion disponible
