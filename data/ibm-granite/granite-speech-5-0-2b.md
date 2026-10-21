# ibm-granite/granite-speech-5.0-2b

## Resumen

Granite-Speech-5.0-2B es un modelo de voz a texto desarrollado por IBM dentro de la familia Granite. Se trata de un modelo de lenguaje adaptado a la modalidad de audio (*speech-language model*) que cubre dos tareas: reconocimiento automático del habla (ASR) multilingüe y traducción automática del habla (AST) bidireccional entre inglés y francés, alemán, español, portugués y japonés. El modelo parte de un checkpoint intermedio de granite-4.0-1b-base, al que se alinea con voz mediante entrenamiento sobre corpus públicos de audio y transcripciones.

Con 2.313.207.132 parámetros totales y un repositorio de 5,0 GB en safetensors, es un modelo compacto pensado para despliegue empresarial: cabe en una GPU de consumo con precisión bf16 y no requiere infraestructura de gran escala. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales de atribución más allá de las habituales de la licencia.

Su relevancia frente a la versión anterior (granite-speech-4.1-2b) radica en cuatro mejoras concretas: mayor precisión en ASR de inglés de formato corto y mayor robustez frente a ruido, reverberación y micrófono lejano; soporte de *prompting* con identificación de idioma de entrada; mejora en traducción de habla conversacional y de formato largo; y ampliación de la lista de palabras clave para ASR/AST sesgado por keywords hasta 2000 términos. Fue entrenado con 390 000 horas de audio y publicado el 20 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje (granite-4.0-1b-base) alineado a la modalidad de audio mediante adaptación; el desglose del codificador de audio no está documentado en la información disponible |
| Parametros totales | 2.313.207.132 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la model card recomienda transcribir en segmentos de hasta ~2 minutos y dividir grabaciones más largas con VAD |
| Tipos de cuantizacion | No disponibles de forma oficial; los pesos se publican en safetensors con precisión bf16. No se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | ASR: inglés, francés, alemán, español, portugués y japonés. AST: traducción hacia y desde inglés para esos seis idiomas, más inglés a italiano e inglés a mandarín |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 5,0 GB, compatible con la librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye alineando un checkpoint intermedio de granite-4.0-1b-base con la modalidad de voz, mediante entrenamiento sobre corpus de código abierto que contienen pares de audio y texto objetivo. No se detalla en la información disponible la arquitectura exacta del codificador acústico ni del adaptador de modalidad, ni el número de capas o dimensión oculta de cada componente; el dato confirmado es el total de 2.313.207.132 parámetros y la base del modelo de lenguaje (aproximadamente 1000 millones de parámetros según su identificador, granite-4.0-1b-base).

El entrenamiento utilizó 390 000 horas de audio procedentes de corpus públicos para ASR y AST, complementadas con datasets sintéticos específicos para ASR de japonés, ASR sesgado por palabras clave y traducción del habla. No se especifican en la información consultada el número de tokens de texto, la composición detallada del dataset, ni si se aplicaron etapas de RLHF o DPO. Las innovaciones técnicas declaradas por el autor son funcionales más que arquitectónicas: soporte de *prompting* con identificación explícita del idioma de entrada, listas de sesgo por keyword de hasta 2000 términos y mejoras específicas en robustez acústica (ruido, reverberación, micrófono lejano) y en puntuación y capitalización de la salida.

## Capacidades

- Reconocimiento automático del habla multilingüe en inglés, francés, alemán, español, portugués y japonés.
- Traducción automática del habla bidireccional: de cada uno de esos idiomas al inglés y del inglés a cada uno de ellos; adicionalmente, inglés a italiano e inglés a mandarín.
- Puntuación y capitalización automáticas de la transcripción, con métricas publicadas de PER (*punctuation error rate*) y Cap-F1 por conjunto de evaluación.
- ASR sesgado por palabras clave (*keyword-biased ASR*) con listas de hasta 2000 términos, útil para terminología de dominio, nombres propios y jerga corporativa.
- Sesgo por keywords aplicado también a la traducción del habla.
- *Prompting* con identificación del idioma de entrada para mejorar la precisión en contextos multilingües.
- Robustez declarada frente a ruido, reverberación y captura con micrófono lejano, evaluada en el leaderboard FFASR.
- Procesamiento de habla de formato largo y conversacional, con la recomendación de segmentar en bloques de hasta ~2 minutos.
- Interfaz conversacional mediante plantilla de chat (`apply_chat_template`) con marcador `<|audio|>` para intercalar el audio en el turno de usuario.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión ni generación de audio.

## Casos de uso

- Transcripción de reuniones corporativas: el modelo recibe segmentos de audio de hasta dos minutos y devuelve texto con puntuación y mayúsculas, lo que permite encadenar bloques con VAD para actas completas sin postprocesado de formato.
- Subtitulado y localización audiovisual: la capacidad de traducción del habla hacia y desde inglés cubre la cadena habitual de localización (transcribir en el idioma original y traducir al inglés, o al revés) en un único modelo de 2,3 B de parámetros.
- Análisis de llamadas en centros de contacto: con listas de hasta 2000 keywords se puede sesgar el reconocimiento hacia nombres de producto, identificadores de cliente o jerga interna, y transcribir conversaciones de formato largo con robustez frente a micrófono lejano.
- Documentación clínica o jurídica por dictado: el sesgo por keywords permite introducir vocabulario especializado (fármacos, términos legales) para reducir errores en entidades críticas, con la ventaja de que el modelo se ejecuta en una sola GPU de consumo.
- Accesibilidad en tiempo real: al ser un modelo de 2,3 B en bf16, puede desplegarse en estaciones de trabajo con GPU media para generar subtítulos en directo en seis idiomas sin depender de servicios en la nube.
- Atención al cliente multilingüe: combinación de ASR con identificación de idioma de entrada y traducción al inglés para centralizar la analítica de conversaciones en un único idioma de trabajo.
- Investigación en lingüística computacional y evaluación ASR: el modelo publica métricas de PER y Cap-F1 por conjunto de test (LibriSpeech-clean/other, VoxPopuli, Earnings-22, CommonVoice en varios idiomas), lo que facilita reproducir comparativas.
- Preprocesado de corpus de audio a gran escala: al ser Apache 2.0 y ejecutable con `transformers`, puede integrarse en pipelines de transcripción por lotes sin coste de licencia.

## Benchmarks y rendimiento

La model card publica los resultados de ASR en inglés (Open ASR Leaderboard), de robustez acústica (FFASR), de ASR multilingüe en CommonVoice y de traducción del habla (CoVoST para X→En y FLEURS para En→X) únicamente en forma de gráficas, sin tablas numéricas en el texto disponible. Por tanto, los valores concretos de WER y BLEU no están disponibles en la información consultada. Los únicos datos numéricos publicados son las métricas de puntuación y capitalización frente al modelo predecesor:

| Test set | PER 4.1-2b (menor es mejor) | PER 5.0-2b (menor es mejor) | Cap-F1 4.1-2b (mayor es mejor) | Cap-F1 5.0-2b (mayor es mejor) |
|---|---|---|---|---|
| LScln | 25,70 | 23,20 | 89,71 | 90,16 |
| LSoth | 22,27 | 21,22 | 91,26 | 91,65 |
| VoxPopuli | 24,86 | 23,70 | 95,35 | 95,07 |
| Earnings-22 | 22,87 | 21,64 | 95,19 | 94,98 |
| CV-EN | 9,13 | 9,18 | 96,75 | 96,96 |
| CV-DE | 3,66 | 3,65 | 99,50 | 99,51 |
| CV-ES | 11,61 | 11,46 | 95,68 | 95,62 |
| CV-FR | 11,00 | 11,43 | 97,25 | 97,20 |
| CV-PT | 7,86 | 7,53 | 98,51 | 98,48 |

No se han publicado en la información disponible resultados de benchmarks de razonamiento, código o matemáticas (MMLU, HumanEval, GSM8K), ya que el modelo está orientado a tareas de voz y no a texto general.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 4,6 GB (2,313 mil millones de parámetros × 2 bytes), coherente con un repositorio de 5,0 GB. En fp32 serían unos 9,3 GB.
- Estimación de VRAM para inferencia: ~6-8 GB en bf16 incluyendo activaciones y caché de audio; ~3 GB con cuantización de 8 bits y ~1,5-2 GB con 4 bits, aunque estas cuantizaciones no están publicadas oficialmente y requerirían conversión propia.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. En GPUs de 8 GB es viable en bf16 con fragmentación o en cuantización de 8 bits.
- GPU de datacenter: A100 (40/80 GB), H100 y L40S permiten procesamiento por lotes con alta concurrencia, aunque el modelo está sobredimensionado para estas tarjetas en inferencia individual.
- Despliegue: la model card documenta exclusivamente la integración con `transformers` (versión 4.52.1 o superior) mediante `AutoModelForSpeechSeq2Seq` y `AutoProcessor`, con `torchaudio` y `soundfile` como dependencias. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Preprocesado obligatorio: audio mono a 16 kHz; se recomienda segmentar en bloques de hasta ~2 minutos y aplicar VAD en grabaciones largas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| granite-speech-5.0-2b | 2,31 B | No disponible (segmentos de ~2 min recomendados) | 6 idiomas ASR; AST hacia/desde inglés + En→IT y En→ZH | Apache 2.0 | Base: granite-4.0-1b-base. Keywords hasta 2000. Mejor PER y Cap-F1 que su predecesor en la mayoría de test sets |
| granite-speech-4.1-2b | 2,31 B (mismo recuento declarado) | No disponible | 6 idiomas ASR; AST hacia/desde inglés | Apache 2.0 | Predecesor directo. Lista de keywords inferior, sin *prompting* de idioma de entrada y peor robustez a ruido y micrófono lejano |
| Whisper large-v3 (OpenAI) | No disponible en la información consultada | No disponible | No disponible | No disponible | Alternativa habitual de la categoría; los resultados comparativos aparecen solo como gráficas en la model card, sin cifras en el texto |
| Sistemas ASR/AST dedicados y otros *speech-language models* | No disponible | No disponible | No disponible | No disponible | La model card incluye comparaciones en CommonVoice, CoVoST y FLEURS, pero sin valores numéricos en el texto disponible |

## Limitaciones y advertencias

- Sesgos: no se documenta en la información disponible ningún análisis de sesgo demográfico, acento o dialecto. Al entrenarse sobre corpus públicos y datos sintéticos, es esperable un rendimiento desigual entre variedades dialectales de cada idioma, pero no hay datos publicados que lo cuantifiquen.
- Alucinación: como modelo generativo de texto condicionado por audio, puede producir texto plausible no presente en la señal, especialmente en segmentos con ruido extremo, silencios largos o audio ininteligible. No se documentan mecanismos de mitigación.
- Limitación de formato: la recomendación explícita es segmentar en bloques de hasta ~2 minutos; no se especifica la longitud de contexto en tokens, por lo que no se puede garantizar el comportamiento en audios continuos sin VAD.
- Cobertura de idiomas: solo seis idiomas para ASR. La traducción del habla cubre únicamente pares con el inglés (más En→IT y En→ZH), no traducción directa entre, por ejemplo, español y japonés.
- Idiomas no soportados: el resto de lenguas, incluidos el catalán, el gallego, el euskera o el italiano como entrada de audio, quedan fuera del alcance declarado.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no se documentan en la información disponible garantías, cláusulas de exención de responsabilidad específicas ni compromisos de soporte por parte de IBM.
- Producción: el modelo está pensado para aplicaciones empresariales de procesamiento de voz, pero no se documentan tasas de error en dominios muy específicos (médico, legal) ni pruebas de estrés; se recomienda evaluar con datos propios antes de desplegar. La ausencia de cuantizaciones oficiales implica que cualquier despliegue en 4 u 8 bits requiere validación propia de degradación.
- Dependencia de versión: requiere `transformers>=4.52.1`; versiones anteriores no cargan el modelo de forma nativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Predecesor: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FFASR Leaderboard: https://huggingface.co/spaces/treble-technologies/ffasr
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper de LibriSpeech-PC (métricas PER y Cap-F1): https://arxiv.org/abs/2310.02943
- Referencias arXiv incluidas en los tags del modelo (contenido no verificado en la información consultada): https://arxiv.org/abs/2505.08699, https://arxiv.org/abs/2603.11243, https://arxiv.org/abs/2604.12398, https://arxiv.org/abs/2604.22817, https://arxiv.org/abs/2604.11269, https://arxiv.org/abs/2603.08397
- Sitio corporativo de IBM: https://www.ibm.com/
- Nota: la búsqueda web realizada solo devolvió páginas genéricas de IBM (corporativas y enciclopédicas); no se localizaron blogs técnicos, demos ni repositorios adicionales específicos de este modelo.
