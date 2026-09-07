# cjli/harp

## Resumen

HARP es un conjunto de artefactos de investigacion para un sistema de recuperacion aumentada por generacion (RAG) hibrido sobre grabaciones de audio largas, de entre 10 minutos y 2 horas. Lo desarrolla cjli y se publica en HuggingFace como repositorio complementario del proyecto GitHub `chinjouli/harp`. El repositorio no contiene el corpus de audio, sino las consultas de evaluacion para dos tareas (musica y salud), metadatos de referencia y un checkpoint de reconocimiento de emociones del habla (CSER). Su relevancia radica en permitir reproducir experimentos de RAG audio de larga duracion sin redistribuir los corpus originales, respetando sus licencias.

El checkpoint CSER incluido es una cabeza BiLSTM sobre un modelo base WavLM-Large, que predice Valence, Arousal y Dominance (V/A/D) por segundo. El tamano del repositorio es de 0,1 GB e incluye los directorios `songeval/`, `medmosaic/` y `checkpoints/cser/`. No se trata de un modelo de lenguaje generativo, sino de un conjunto de recursos de evaluacion y un modelo de analisis emocional de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiLSTM head sobre WavLM-Large (checkpoint CSER); el resto son consultas y metadatos de RAG |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el sistema trabaja con audio de 10 min a 2 h; no es un modelo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las consultas referencian transcripciones en ingles, pero no se especifica oficialmente) |
| Licencia | MIT (para consultas y checkpoint); los corpus fuente tienen licencias propias (SongEval CC BY-NC-SA 4.0, MedMosaic CC BY 4.0, MSP-Podcast/MSP-Conversation licencia academica) |
| Formato de pesos | .pt (checkpoint PyTorch) |

## Arquitectura y entrenamiento

El checkpoint CSER de HARP es una cabeza BiLSTM que se apila sobre WavLM-Large, un modelo de representacion de audio preentrenado. La cabeza predice tres dimensiones emocionales (Valence, Arousal, Dominance) por segundo de audio. Segun el model card, este checkpoint fue entrenado en el corpus MSP-Conversation, y el codigo de referencia esta en el repositorio `Berkeley-Speech-Group/emo-reasoning`.

El sistema HARP en si es un pipeline de RAG hibrido para audio largo: combina recuperacion basada en indices de clips de referencia (por ejemplo, fragmentos de 5 segundos) con consultas en lenguaje natural. Las consultas de evaluacion se generan mediante decodificacion con semilla (seeded y greedy-decoded), lo que permite reproducir el benchmark de forma determinista. Los directorios `songeval/` y `medmosaic/` contienen las consultas y metadatos para las tareas de musica y salud, respectivamente.

## Capacidades

- Reconocimiento de emociones del habla (CSER) por segundo, prediciendo Valence, Arousal y Dominance.
- Recuperacion aumentada por generacion sobre grabaciones de audio largas (10 minutos a 2 horas) mediante un enfoque hibrido.
- Conjunto de 500 consultas de comparacion para la tarea de musica (`songeval/queries/track_NN.jsonl`).
- Conjunto de 212 consultas para la tarea de salud, referidas a sintomas reportados o exhibidos (`medmosaic/queries.jsonl`).
- Metadatos de identificacion de idioma que evitan la pasada lenta de Whisper (`songeval/languages2.jsonl`).
- Indices de clips de referencia de 5 segundos para recuperacion (`songeval/clip_index.json`).
- Soporte para regenerar el conjunto completo de consultas de emocion una vez se disponga de la licencia del corpus MSP.

## Casos de uso

- Evaluacion de sistemas de RAG de audio en el dominio musical: el conjunto `songeval/` permite probar algoritmos de recuperacion sobre 50 medleys, comparando el rendimiento con 500 consultas de referencia.
- Investigacion en reconocimiento de emociones del habla: el checkpoint CSER puede usarse para analizar la dinamica emocional de grabaciones largas, prediciendo V/A/D por segundo.
- Analisis de grabaciones clinicas largas: las 212 consultas de `medmosaic/` estan pensadas para evaluar sistemas que extraen informacion de sintomas en conversaciones de salud.
- Reproduccion de experimentos de HARP: los directorios estan estructurados para ser "drop-in" con el codigo del proyecto, facilitando la replicacion de benchmarks sin redistribuir audio.
- Benchmarking de modelos de audio preentrenados: el checkpoint CSER y las consultas permiten comparar representaciones de audio en tareas de emocion y recuperacion.
- Desarrollo de asistentes de audio clinico: combinando el RAG hibrido con el analisis emocional, se pueden construir sistemas que resuman o consulten largas grabaciones de consultas medicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint CSER requiere una GPU para inferencia con WavLM-Large; se estima un consumo de VRAM en torno a 2-4 GB para el modelo base mas la cabeza BiLSTM, dependiendo de la implementacion.
- El repositorio completo ocupa 0,1 GB, por lo que el almacenamiento es minimo.
- Para reconstruir el audio y ejecutar el pipeline completo de HARP, se necesitan recursos de CPU y GPU adicionales, asi como acceso a los corpus fuente (SongEval, MedMosaic, MSP).
- El despliegue puede realizarse con PyTorch estandar; no se especifican integraciones con vLLM, llama.cpp u otros motores de inferencia.
- No hay datos publicados sobre latencia o throughput.

## Comparativa con modelos similares

No disponible. HARP es un conjunto de artefactos especifico para RAG de audio largo y reconocimiento de emociones, sin equivalentes directos publicados en la informacion disponible.

## Limitaciones y advertencias

- El repositorio no incluye el audio de los corpus; es necesario descargar las fuentes y reconstruir el audio localmente mediante los scripts de `dataprep`.
- Las consultas de emocion no estan incluidas debido a la licencia del corpus MSP, que prohibe la redistribucion. Para obtenerlas hay que regenerarlas tras firmar la licencia academica.
- El corpus SongEval tiene licencia CC BY-NC-SA 4.0, lo que implica restricciones de uso no comercial y de compartir bajo la misma licencia.
- El checkpoint CSER fue entrenado en MSP-Conversation, que requiere una licencia academica firmada por persona; su uso comercial no esta permitido sin autorizacion explicita.
- No es un modelo de lenguaje generativo: no genera texto ni responde prompts en lenguaje natural.
- No se han publicado metricas de rendimiento en el model card, por lo que su calidad relativa no puede evaluarse sin ejecutar los benchmarks.
- El tamano del repositorio es pequeno (0,1 GB) porque no contiene pesos de un modelo grande, solo un checkpoint de emocion y consultas.

## Enlaces

- HuggingFace: https://huggingface.co/cjli/harp
- Repositorio del proyecto HARP: https://github.com/chinjouli/harp
- Dataset SongEval: https://huggingface.co/datasets/ASLP-lab/SongEval
- Dataset MedMosaic: https://huggingface.co/datasets/icml-anon-submission/medmosaic-dataset
- Corpus MSP-Podcast: https://lab-msp.com/MSP/MSP-Podcast.html
- Corpus MSP-Conversation: https://lab-msp.com/MSP/MSP-Conversation.html
- Referencia de emo-reasoning: https://github.com/Berkeley-Speech-Group/emo-reasoning
