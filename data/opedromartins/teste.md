# opedromartins/teste

## Resumen

`opedromartins/teste` es un ajuste fino (fine-tuning) del modelo `nvidia/parakeet-tdt-0.6b-v3` orientado al reconocimiento automático del habla (ASR) en portugues, con enfasis en portugues de Brasil. Lo publica el usuario opedromartins en Hugging Face y se distribuye bajo licencia CC-BY-4.0. El modelo hereda la arquitectura Parakeet TDT (Token-and-Duration Transducer) de NVIDIA, un modelo de 0,6 mil millones de parametros disenado para transcripcion eficiente con decodificacion no autoregresiva.

La relevancia de este ajuste reside en su especializacion: parte de un modelo multilingue de NVIDIA y lo adapta a corpus de habla portuguesa (CORAA, MLS, Fleurs, TEDx) mediante datasets propios publicados por el autor. Los resultados declarados en la model card muestran un WER de 3,55 en Fleurs pt_br y un promedio de 9,45 en un conjunto de evaluaciones portuguesas, con un RTFx de 2653,82, lo que indica un throughput muy alto (procesa miles de segundos de audio por segundo de computo).

El modelo se publica como una prueba ("teste") y con cero descargas y likes en el momento de la consulta, por lo que debe tratarse como un artefacto experimental mas que como un modelo de produccion consolidado. No obstante, su ficha tecnica y sus metricas declaradas lo hacen util para quienes necesiten ASR en portugues con requisitos de latencia bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), derivada de nvidia/parakeet-tdt-0.6b-v3 |
| Parametros totales | 0,6 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio de 30 s segun el nombre del checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (pt), con foco en pt-BR |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (libreria NeMo; probablemente .nemo, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Parakeet TDT de NVIDIA, un transducer (RNN-T variante) que predice conjuntamente tokens y duraciones, lo que permite decodificacion no autoregresiva y un rendimiento muy alto en inferencia. El checkpoint base `nvidia/parakeet-tdt-0.6b-v3` es un modelo multilingue de 0,6 B de parametros; este ajuste lo especializa al portugues mediante fine-tuning sobre los datasets `opedromartins/ASR-datasets-ptbr` y `opedromartins/ASR-datasets-ptbr-clean-transcriptions`, que el autor publica en Hugging Face.

No se dispone de informacion sobre el numero de tokens de audio, la composicion exacta del dataset de entrenamiento, ni sobre el uso de tecnicas de aumento de datos, RLHF o DPO (no aplicables a ASR en la mayoria de casos). El nombre del checkpoint (`parakeet-tdt-v3-ptBR-30s`) sugiere entrenamiento o evaluacion con segmentos de audio de 30 segundos, pero este dato no se confirma en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en portugues, con especial atencion al portugues de Brasil.
- Transcripcion de audio de hasta 30 segundos por segmento (segun el nombre del checkpoint).
- Decodificacion TDT no autoregresiva, que permite throughput muy alto (RTFx declarado de 2653,82).
- Evaluacion en multiples corpus portugueses: CORAA MuPe, CORAA NURC-SP, CORAA v1.1, Fleurs pt_br, MLS portuguese y TEDx pt.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo "thinking"; es un modelo puramente ASR.
- Capacidad multilingue limitada al portugues en este ajuste (el modelo base es multilingue, pero el fine-tuning se declara solo para `pt`).

## Casos de uso

- Transcripcion de reuniones y entrevistas en portugues de Brasil: el modelo procesa segmentos de 30 s con alta eficiencia, adecuado para pipelines por lotes donde el coste por hora de audio es critico gracias al RTFx declarado.
- Subtitulado automatico de contenido audiovisual: con WER de 3,55 en Fleurs pt_br, es viable para generar subtitulos preliminares que luego se revisan manualmente.
- Analisis de llamadas de atencion al cliente: transcripcion de grabaciones telefonicas en portugues para extraer metricas y alimentar sistemas de QA, aprovechando el ajuste sobre corpus como CORAA NURC-SP (habla espontanea).
- Investigacion linguistica y sociolinguistica: el ajuste sobre CORAA (corpus con variedades regionales) permite estudiar variacion dialectal del portugues brasileño con transcripciones automaticas.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de podcasts o archivos de radio en portugues para habilitar busqueda por texto.
- Prototipado rapido de asistentes de voz en portugues: al ser un modelo de 0,6 B, se puede desplegar en infraestructura modesta y servir como base para sistemas de dictado o comandos de voz.
- Evaluacion comparativa de ASR portugues: util como referencia para medir mejoras de otros modelos en los mismos corpus (CORAA, Fleurs, MLS, TEDx).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero):

| Dataset | Metrica | Valor |
|---|---|---|
| CORAA MuPe | WER | 10,84 |
| CORAA NURC-SP | WER | 11,77 |
| CORAA v1.1 | WER | 12,52 |
| Fleurs (pt_br) | WER | 3,55 |
| Multilingual LibriSpeech (MLS, pt) | WER | 10,96 |
| TEDx (pt) | WER | 7,04 |
| Open PT ASR Leaderboard (promedio) | WER | 9,45 |
| Open PT ASR Leaderboard | RTFx | 2653,82 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; por el tamano del modelo base (0,6 B de parametros), la inferencia en precision completa requeriria del orden de 2-3 GB, pero este dato no se confirma para este checkpoint.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del modelo base sugiere que podria caber en GPU de consumo, pero no hay datos oficiales para este ajuste.
- Opciones de despliegue: la libreria declarada es NeMo (NVIDIA), por lo que el despliegue natural es mediante el toolkit NeMo. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: RTFx declarado de 2653,82 en el promedio del Open PT ASR Leaderboard, lo que indica procesamiento de aproximadamente 2653 segundos de audio por segundo de computo en el hardware de evaluacion (no especificado).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (ASR en portugues) con los que establecer una comparacion rigurosa de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo publicado como prueba ("teste"), con cero descargas y sin validacion externa; no debe considerarse un artefacto estable de produccion.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false` en la model card).
- El ajuste esta limitado al portugues; no se garantiza un rendimiento adecuado en otros idiomas aunque el modelo base sea multilingue.
- No se documentan sesgos conocidos, pero al entrenarse sobre corpus brasileños (CORAA, MLS, Fleurs) puede presentar sesgos hacia variedades y registros presentes en esos datos.
- Riesgo de alucinacion: como todo modelo ASR, puede generar transcripciones plausibles pero incorrectas en audio con ruido, acentos no representados o solapamiento de hablantes.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero conviene revisar las condiciones del modelo base de NVIDIA y de los datasets de entrenamiento, que pueden imponer restricciones adicionales.
- No hay informacion sobre cuantizacion, formatos de pesos ni soporte de frameworks alternativos a NeMo, lo que limita las opciones de despliegue.
- El nombre del checkpoint sugiere segmentos de 30 s; audios mas largos requeriran segmentacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opedromartins/teste
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/opedromartins/ASR-datasets-ptbr
- Dataset de transcripciones limpias: https://huggingface.co/datasets/opedromartins/ASR-datasets-ptbr-clean-transcriptions
- Corpus CORAA MuPe: https://huggingface.co/datasets/nilc-nlp/CORAA-MUPE-ASR
- Corpus CORAA NURC-SP: https://huggingface.co/datasets/nilc-nlp/CORAA-NURC-SP-Audio-Corpus
- Corpus CORAA v1.1: https://huggingface.co/datasets/nilc-nlp/CORAA-v1.1
- Dataset Fleurs: https://huggingface.co/datasets/google/fleurs
- Dataset Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
