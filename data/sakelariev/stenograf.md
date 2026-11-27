# sakelariev/stenograf

## Resumen

Stenograf (Стенограф) es un modelo de reconocimiento automático del habla (ASR) especializado en búlgaro, desarrollado por el usuario independiente sakelariev. Su nombre hace referencia a un estenógrafo, y el modelo está diseñado para producir transcripciones limpias y editadas, sin muletillas, tartamudeos ni falsos arranques, imitando el estilo de las actas oficiales de la Asamblea Nacional de Bulgaria. Está construido sobre `google/embeddinggemma-2` y emplea una arquitectura CTC con un modelo de lenguaje de 4-gramas para el decodificado.

El modelo se presenta como la mejor alternativa abierta para habla espontánea en búlgaro (debates, entrevistas, tertulias), con un WER del 7,38 % en el benchmark parlamentario del autor, frente al 10,08 % de ElevenLabs Scribe v3 y al 14-19 % de los modelos basados en Whisper. Su principal ventaja operativa es la eficiencia: al usar CTC con una sola pasada hacia delante y búsqueda por haces, alcanza aproximadamente 40× tiempo real en CPU de un Apple M4 Pro, sin necesidad de conexión a internet ni API externa.

El modelo tiene 386M parámetros, licencia Apache 2.0 y un tamaño de repositorio de 2,4 GB, que incluye los pesos del modelo acústico, un modelo de lenguaje de 4-gramas de 256 MB, un reordenador de texto de 67 MB y un modelo de puntuación de 555 MB. Es relevante para quienes necesitan ASR de alta calidad en búlgaro sobre hardware modesto y con requisitos de privacidad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre `google/embeddinggemma-2` con decodificado por haces y modelo de lenguaje de 4-gramas (KenLM); reordenador de texto opcional de 33M parámetros |
| Parametros totales | 386M (modelo acústico); 33M (reordenador); modelo de puntuación XLM-R aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | búlgaro (bg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, pytorch |
| Tamano del repositorio | 2,4 GB |
| Modelo base | google/embeddinggemma-2 |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

Stenograf es un modelo CTC (Connectionist Temporal Classification) construido sobre `google/embeddinggemma-2`. A diferencia de los modelos ASR autorregresivos como Whisper, realiza una única pasada hacia delante seguida de una búsqueda por haces guiada por un modelo de lenguaje de 4-gramas (KenLM, 256 MB), lo que elimina la decodificación autorregresiva y reduce drásticamente la latencia. Opcionalmente, un reordenador de texto de 33M parámetros (`--tlm`) selecciona el mejor candidato entre hasta 16 propuestas de la búsqueda por haces, y un modelo XLM-R independiente (`--punct`) añade puntuación y mayúsculas sin alterar las palabras.

El entrenamiento se apoya en datos de habla espontánea alineados con estenogramas oficiales del Parlamento búlgaro, lo que explica que el modelo aprenda a omitir muletillas y repeticiones como hacen los estenógrafos humanos. El modelo de lenguaje se entrenó exclusivamente con datos abiertos: Wikipedia, frases de Common Voice y estenogramas parlamentarios, con identificadores personales eliminados. Los pesos del reordenador se ajustaron sobre conjuntos de desarrollo (Common Voice dev y un conjunto de habla espontánea), nunca sobre los conjuntos de test.

## Capacidades

- Reconocimiento automático del habla en búlgaro, optimizado para habla espontánea (debates, entrevistas, tertulias, podcasts, radio y televisión).
- Transcripción con estilo editado: omite muletillas, tartamudeos y falsos arranques, imitando el estilo de los estenogramas oficiales.
- Dos modos de decodificado: rápido (por defecto, búsqueda por haces con LM de 4-gramas) y con reordenador (`--tlm`), que reduce el WER 1-1,4 puntos en habla leída a cambio de un 10-20 % más de tiempo.
- Puntuación y mayúsculas opcionales mediante un modelo XLM-R separado (`--punct`), sin modificar las palabras transcritas.
- Ejecución totalmente local, sin API ni conexión a internet.
- No soporta tool calling, function calling, agentes, visión ni audio más allá de la transcripción ASR.
- Capacidad multilingüe limitada al búlgaro.

## Casos de uso

- Transcripción de sesiones parlamentarias y actas oficiales: el modelo aprende de estenogramas reales y produce texto editado sin muletillas, lo que reduce la corrección manual posterior en flujos de documentación legislativa.
- Subtitulado de podcasts, tertulias y programas de radio o televisión: con un WER del 6,0 % en el conjunto interno de broadcast del autor y 40× tiempo real en CPU, permite generar subtítulos en local sin depender de servicios en la nube.
- Periodismo y entrevistas: transcripción rápida de grabaciones de campo en un portátil, sin conexión, preservando la privacidad de las fuentes.
- Investigación en lingüística búlgara: generación de corpus transcritos de habla espontánea con calidad cercana a la estenografía humana, útil para estudios de variación y sociolingüística.
- Accesibilidad y documentación de reuniones: transcripción de reuniones internas con puntuación y mayúsculas opcionales para actas legibles, ejecutable en hardware de oficina.
- Despliegue en entornos con requisitos de soberanía del dato: al no requerir API externa, encaja en administraciones públicas y organizaciones que no pueden enviar audio a terceros.
- Preprocesado para pipelines de NLP en búlgaro: transcripción masiva de archivos de audio para alimentar sistemas de búsqueda, resumen o análisis posteriores.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER en %, menor es mejor; hipótesis y referencias normalizadas: minúsculas, sin puntuación, dígitos escritos con palabras).

| Sistema | Abierto | Parliament benchmark | Broadcast† | FLEURS | Common Voice |
|---|---|---|---|---|---|
| Stenograf + rescorer | sí | **7,18** | 6,22 | 8,69 | 10,45 |
| Stenograf, fast (por defecto) | sí | 7,38 | **6,00** | 9,63 | 11,84 |
| Stenograf, sin LM | sí | 10,16 | 9,96 | 15,57 | 17,38 |
| ElevenLabs Scribe v3 | no (API) | 10,08 | 11,20 | **3,77** | **5,82** |
| Zipformer transducer, offline (65M) | sí | 11,50 | 11,52 | 10,02\* | 9,13\* |
| Zipformer transducer, streaming 640 ms (65M) | sí | 12,61 | 12,71 | 12,13\* | 13,01\* |
| NVIDIA Canary-1b-v2 | sí | 13,99 | 14,11 | 9,17 | 18,31 |
| whisper-bg (Whisper-large-v3-turbo fine-tune) | sí | 14,26 | 21,01 | 10,33 | 15,80 |
| Parakeet-TDT 0.6B v3 (int6, Phonon) | sí | 15,24 | 14,63 | 12,75 | 16,38 |
| OpenAI whisper-large-v3-turbo | sí | 17,22 | 17,43 | 13,66 | 20,15 |
| BuzzASR bulgarian (Whisper-large-v3 fine-tune) | sí | 18,86 | 19,99 | 12,26\* | 1,38‡ |

† Conjunto interno de podcasts, TV y radio (unos 50 minutos de noviembre de 2026), no publicado. ‡ BuzzASR se entrenó con datos de Common Voice 25 y FLEURS; su model card no indica que se reservaran los clips de test de Common Voice. \* Los modelos Zipformer y BuzzASR se entrenaron con datos de FLEURS y Common Voice, por lo que esas columnas son in-domain para ellos. Datos de Zipformer: archivos ONNX int8 con sherpa-onnx, configuración de decodificado de sus model cards, medidos el 2026-11-23.

## Requisitos de hardware

- Modelo acústico de 386M parámetros: cabe con holgura en GPU de consumo (RTX 3060 12 GB, RTX 4090, etc.) y en CPU moderna.
- Rendimiento declarado por el autor: aproximadamente 40× tiempo real en CPU de Apple M4 Pro y 95× en su GPU; con reordenador, 35× en CPU y 85× en GPU.
- La puntuación añade unos 0,3 s por cada 6 minutos de audio en CPU.
- Componentes adicionales: LM de 4-gramas de 256 MB, reordenador de 67 MB y modelo de puntuación de 555 MB; el repositorio completo ocupa 2,4 GB.
- Opciones de despliegue: inferencia con PyTorch (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no se publican cifras absolutas de latencia por segundo de audio más allá de los factores de tiempo real citados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER Parliament | WER FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Stenograf + rescorer | 386M | no disponible | 7,18 | 8,69 | Apache 2.0 | Hugging Face |
| ElevenLabs Scribe v3 | no disponible | no disponible | 10,08 | **3,77** | propietaria (API) | solo API |
| NVIDIA Canary-1b-v2 | no disponible | no disponible | 13,99 | 9,17 | abierta | Hugging Face |
| whisper-large-v3-turbo | no disponible | no disponible | 17,22 | 13,66 | abierta | Hugging Face |
| Zipformer transducer offline | 65M | no disponible | 11,50 | 10,02 | abierta | Hugging Face |

Stenograf destaca en habla espontánea (parlamento, broadcast) frente a alternativas abiertas y frente a Scribe v3, pero queda por detrás de Scribe v3 en habla leída (FLEURS, Common Voice). Frente a los Zipformer, es más grande (386M frente a 65M) pero obtiene mejor WER en habla espontánea.

## Limitaciones y advertencias

- El modelo solo soporta búlgaro; no es multilingüe.
- Su ventaja en habla espontánea es en parte estilística: al omitir muletillas y repeticiones como los estenogramas, el WER baja, pero en palabras erróneas y ortografía Scribe v3 es ligeramente mejor según el autor.
- En habla leída (FLEURS, Common Voice) queda claramente por detrás de Scribe v3 (aproximadamente 2× peor WER) y de modelos entrenados específicamente en esos dominios.
- Riesgo de alucinación o de omisión de contenido: al estilo estenográfico, puede descartar palabras del hablante que no formen parte del texto editado esperado.
- El conjunto de broadcast usado en los benchmarks es interno y no está publicado, por lo que no es reproducible de forma independiente.
- Los resultados de benchmarks están declarados por el autor y no verificados (`verified: false` en el model-index).
- No se documentan sesgos específicos más allá de los derivados de los datos de entrenamiento (Wikipedia, Common Voice, estenogramas parlamentarios).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes (Common Voice, Wikipedia).
- No se documentan cuantizaciones ni formatos GGUF/ONNX, lo que limita el despliegue en algunos runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/sakelariev/stenograf
- Dataset del benchmark parlamentario: https://huggingface.co/datasets/sakelariev/bg-parliament-asr-bench
- Common Voice 22.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_22_0
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Zipformer transducer offline: https://huggingface.co/preslaff/bulgarian-asr-zipformer
- Zipformer transducer streaming: https://huggingface.co/preslaff/bulgarian-asr-zipformer-streaming
- BuzzASR bulgarian: https://huggingface.co/BuzzASR/bulgarian
