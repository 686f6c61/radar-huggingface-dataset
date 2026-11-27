# BSC-LT/whisper-large-v3-LoS-punctuated

## Resumen

Whisper-large-v3-LoS-punctuated es un sistema de reconocimiento automático del habla (ASR) desarrollado por el Barcelona Supercomputing Center (BSC-LT) mediante ajuste fino del modelo openai/whisper-large-v3. El modelo está disenado para transcribir habla con puntuacion en las cuatro lenguas oficiales de Espana: castellano, catalan, gallego y euskera (LoS, Languages of Spain). Resuelve el problema de la transcripcion multilingue en un contexto peninsular donde los sistemas genericos suelen tener un rendimiento desigual entre lenguas y carecen de puntuacion adecuada en las transcripciones.

El modelo parte de la arquitectura transformer encoder-decoder de Whisper large-v3 (aproximadamente 1.550 millones de parametros) y se ha entrenado sobre 8.110 horas de datos preprocesados, equilibrando las horas de entrenamiento entre las cuatro lenguas para garantizar un rendimiento comparable. Para el euskera se aplico Speed Perturbation (0,9x y 1,1x) sobre todos los ficheros de audio, con una duracion total de 2.027 h 56 m 11 s, que sirvio como referencia para balancear el resto de idiomas.

Su relevancia actual radica en que cubre una necesidad practica para administraciones publicas, medios de comunicacion y servicios de transcripcion en el ambito espanol, con licencia Apache 2.0 que permite uso comercial. El modelo esta disponible en Hugging Face con 210 descargas y un tamano de repositorio de 23,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | Aproximadamente 1.550 millones (whisper-large-v3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Catalan (ca), castellano, gallego y euskera (segun descripcion del autor; el campo de idioma de la model card solo declara ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch / safetensors (via transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de openai/whisper-large-v3, un transformer encoder-decoder con atencion estandar disenado originalmente por OpenAI para ASR multilingue. El ajuste fino se realizo sobre 8.110 horas de datos preprocesados, combinando corpus publicos e institucionales. Para el catalan se emplearon 3CatParla, Parlament-Parla-v3, Corts Valencianes, IB3 y el benchmark Common Voice ca 17; para el castellano se usaron los corpus ciempiess (light, fem, complementary, balance), CHM150, TEDx Spanish y Librivox Spanish. El autor indica que las horas de entrenamiento se igualaron entre las cuatro lenguas para asegurar un rendimiento comparable.

Como innovacion destacable, se aplico Speed Perturbation (factores 0,9x y 1,1x) a todos los audios de euskera, alcanzando 2.027 h 56 m 11 s, y esa duracion se tomo como referencia para balancear el resto de idiomas. El objetivo del ajuste es producir transcripciones legibles con puntuacion preservando la consistencia linguistica. No se detalla en la informacion disponible si hubo etapas de RLHF o DPO ni el numero total de tokens de entrenamiento.

## Capacidades

- Transcripcion automatica del habla en catalan, castellano, gallego y euskera.
- Generacion de transcripciones con puntuacion, orientadas a legibilidad.
- Procesamiento de audio a 16 kHz mediante el processor de Whisper.
- Inferencia con la libreria transformers (WhisperForConditionalGeneration y WhisperProcessor).
- Compatible con endpoints de Hugging Face (tag endpoints_compatible).
- No se documentan en la informacion disponible capacidades de traduccion, diarizacion, tool calling ni agentes.

## Casos de uso

- Transcripcion de sesiones parlamentarias: el modelo se ha entrenado con corpus como Parlament-Parla-v3 y Corts Valencianes, por lo que es adecuado para transcribir debates parlamentarios en catalan y castellano con puntuacion legible.
- Subtitulado de medios de comunicacion: los datos de 3CatParla e IB3 lo hacen idoneo para generar subtitulos de contenido audiovisual en catalan, con transcripciones puntuadas listas para publicacion.
- Servicios de actas y documentacion administrativa: permite convertir reuniones y comparecencias en texto estructurado con puntuacion, reduciendo el trabajo manual de revision en administraciones publicas de las cuatro lenguas de Espana.
- Atencion al ciudadano multilingue: puede transcribir llamadas o mensajes de voz en castellano, catalan, gallego y euskera, facilitando la gestion de servicios publicos en comunidades con varias lenguas oficiales.
- Investigacion linguistica y creacion de corpus: util para generar transcripciones de entrevistas, encuestas o grabaciones de campo en las cuatro lenguas, con la ventaja de un entrenamiento balanceado entre idiomas.
- Evaluacion y benchmarking ASR: sirve como referencia para medir WER en Common Voice 17 (ca) y otros corpus, gracias a su integracion con la libreria evaluate y la metrica wer.
- Accesibilidad: transcripcion de contenido audio para personas con discapacidad auditiva en entornos donde se requiera soporte simultaneo de varias lenguas peninsulares.

## Benchmarks y rendimiento

Los datos de la model card declaran una evaluacion sobre Mozilla Common Voice 17.0 (test, ca) con la metrica WER, pero el valor figura como nulo en el model-index. En el codigo de ejemplo de la model card aparece un comentario con "Test Result: 0.96", sin especificar la unidad ni el corpus exacto, por lo que no se presenta como dato verificado.

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| ASR | Mozilla Common Voice 17.0 (test, ca) | WER | No disponible (valor nulo en model-index) |

No se han publicado resultados de benchmarks verificados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para whisper-large-v3 en precision fp16 se requiere aproximadamente 6-10 GB de VRAM, aunque el autor no lo especifica.
- GPU recomendadas: no indicadas por el autor; por el tamano del modelo, una GPU con al menos 10-16 GB de VRAM es razonable (por ejemplo, RTX 4090, A100, H100).
- Compatibilidad con GPU de consumo: el codigo de ejemplo del autor asume ejecucion en GPU ("This code works with a GPU"); no se confirma compatibilidad con GPU de gama baja.
- Opciones de despliegue: transformers (WhisperForConditionalGeneration), endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSC-LT/whisper-large-v3-LoS-punctuated | ~1.550 M | Segmentos de 30 s (Whisper) | ca, es, gl, eu | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | ~1.550 M | Segmentos de 30 s | Multilingue (99 idiomas) | Apache 2.0 | Hugging Face |
| projecte-aina/whisper-large-v3-ca-3catparla | No disponible | No disponible | ca | No disponible | Hugging Face |

El modelo se diferencia de whisper-large-v3 por el ajuste fino especifico para las lenguas de Espana y la generacion de puntuacion, y de la variante catalana de projecte-aina por cubrir cuatro lenguas en lugar de una sola. No se dispone de datos comparativos de WER entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se dispone de informacion demografica de los hablantes, por lo que pueden existir sesgos derivados del contenido institucional de los corpus de entrenamiento.
- Riesgo de alucinacion inherente a los modelos Whisper en segmentos de audio con ruido o silencios prolongados.
- El campo de idioma de la model card solo declara catalan, aunque la descripcion indica soporte para cuatro lenguas; conviene validar el rendimiento real en castellano, gallego y euskera.
- Algunos corpus de entrenamiento solo son publicos en version anonimizada; el modelo se entreno con versiones no anonimizadas, lo que puede afectar a la reproducibilidad.
- La puntuacion generada puede no coincidir con las convenciones editoriales de cada institucion; se recomienda revision humana en produccion.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribucion y las condiciones de los corpus de origen.
- No se documentan cuantizaciones oficiales ni soporte en runtimes distintos de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BSC-LT/whisper-large-v3-LoS-punctuated
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Notebook de ejemplo: https://colab.research.google.com/drive/1MHiPrffNTwiyWeUyMQvSdSbfkef_8aJC?usp=sharing
- Dataset 3CatParla: https://huggingface.co/datasets/projecte-aina/3catparla_asr
- Dataset Parlament-Parla-v3: https://huggingface.co/datasets/projecte-aina/parlament_parla_v3
- Dataset Corts Valencianes: https://huggingface.co/datasets/projecte-aina/corts_valencianes_asr_a
- Dataset IB3: https://huggingface.co/datasets/projecte-aina/ib3_ca_asr
- Benchmark Common Voice ca: https://huggingface.co/datasets/projecte-aina/commonvoice_benchmark_catalan_accents
- ciempiess light: https://huggingface.co/datasets/ciempiess/ciempiess_light
- ciempiess fem: https://huggingface.co/datasets/ciempiess/ciempiess_fem
- ciempiess complementary: https://huggingface.co/datasets/ciempiess/ciempiess_complementary
- ciempiess balance: https://huggingface.co/datasets/ciempiess/ciempiess_balance
- CHM150: https://huggingface.co/datasets/carlosdanielhernandezmena/chm150_asr
- TEDx Spanish: https://huggingface.co/datasets/ciempiess/tedx_spanish
- Librivox Spanish: https://huggingface.co/datasets/ciempiess/librivox
