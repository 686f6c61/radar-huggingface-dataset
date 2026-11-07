# mradermacher/polyglot-lion-1.7b-v1.7-GGUF

## Resumen

Polyglot-Lion 1.7B v1.7 es un modelo de reconocimiento automatico del habla (ASR) multilingue desarrollado por el equipo knoveleng, orientado al contexto linguistico de Singapur y del sudeste asiatico. El modelo original se distribuye en formato Hugging Face Transformers, y esta ficha describe la version cuantizada en GGUF publicada por mradermacher, que permite su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo cubre cuatro idiomas: ingles, chino mandarin, malayo y tamil, una combinacion poco habitual que responde a la realidad multilingue de Singapur, donde conviven estas lenguas en un mismo espacio comunicativo. Con 1.720.574.976 parametros (aproximadamente 1,7 mil millones), se situa en la gama de modelos ASR ligeros que pueden ejecutarse en hardware de consumo.

La relevancia actual de esta publicacion radica en su licencia MIT, que permite uso comercial sin restricciones, y en la disponibilidad de cuantizaciones GGUF desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que facilita su integracion en pipelines de transcripcion locales y en aplicaciones de voz sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en transformers; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en, zh, ms, ta |
| Licencia | MIT |
| Formato de pesos | GGUF (version cuantizada); el modelo base se distribuye en formato Transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Se trata de un modelo de reconocimiento automatico del habla (ASR) etiquetado como `transformers` y `conversational`, con soporte multimodal indicado por la presencia de archivos `mmproj` (proyeccion multimodal) en la distribucion GGUF. El modelo base es `knoveleng/polyglot-lion-1.7b-v1.7`.

El entrenamiento se realizo sobre un conjunto de datos compuesto por doce corpus publicos, organizados por idioma: para mandarin, `cv-mandarin`, `aishell1-mandarin`, `aishell3-mandarin` y `fleurs-mandarin`; para tamil, `fleurs-tamil`, `slr127-tamil`, `slr65-tamil` y `cv-tamil`; para malayo, `mesolitica-malay` y `fleurs-malay`; para ingles, `nsc-singlish` y `librispeech-english`. No se especifican el numero total de horas de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal del modelo reside en su cobertura multilingue centrada en el contexto de Singapur, incluyendo el singlish (recogido en `nsc-singlish`) junto con mandarin, malayo y tamil. La version cuantizada por mradermacher emplea cuantizaciones estaticas (no ponderadas ni imatrix), segun indica el autor en la model card.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, chino mandarin, malayo y tamil.
- Transcripcion de audio multilingue, con especial atencion al contexto linguistico de Singapur (incluido singlish).
- Procesamiento conversacional (etiqueta `conversational` en el modelo base).
- Soporte multimodal a traves de los archivos `mmproj` incluidos en la distribucion GGUF.
- Compatibilidad con el ecosistema `transformers` en su version original.
- Compatibilidad con `mlx` y `mlx-audio` segun las etiquetas del modelo, lo que permite ejecucion en hardware Apple Silicon.
- Despliegue mediante llama.cpp y herramientas compatibles con GGUF.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).

## Casos de uso

- Transcripcion de reuniones multilingues en entornos de Singapur y sudeste asiatico: el modelo puede procesar audio en ingles, mandarin, malayo y tamil, lo que lo hace adecuado para organizaciones con equipos que alternan entre estas lenguas en una misma conversacion.
- Subtitulado automatico de contenido audiovisual: con cuantizaciones Q4_K_M (1,2 GB) o Q5_K_M (1,4 GB) puede ejecutarse en local para generar subtitulos en los cuatro idiomas soportados, reduciendo costes frente a APIs en la nube.
- Atencion al cliente por voz: integrado en un pipeline de ASR, permite transcribir llamadas de clientes que hablen cualquiera de los cuatro idiomas, facilitando el enrutamiento y el analisis posterior de las conversaciones.
- Investigacion linguistica sobre code-switching: el soporte de singlish y de multiples lenguas en un mismo modelo permite estudiar fenomenos de alternancia de codigo en corpus de audio reales.
- Aplicaciones de accesibilidad: transcripcion en tiempo real de audio a texto para personas con discapacidad auditiva en entornos multilingues, desplegable en hardware de consumo gracias a las cuantizaciones ligeras.
- Procesamiento por lotes de archivos de audio en servidores sin GPU dedicada: la cuantizacion Q2_K (0,9 GB) o Q3_K_S (1,0 GB) permite ejecutar el modelo en CPU con requisitos de memoria minimos.
- Integracion en dispositivos Apple Silicon mediante MLX: las etiquetas `mlx` y `mlx-audio` indican soporte para ejecucion nativa en Mac con chip M-series, util para prototipado y desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~0,9 GB; Q3_K_S ~1,0 GB; Q4_K_M ~1,2 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB. Los archivos mmproj anaden 0,5 GB (Q8_0) o 0,7 GB (f16).
- GPU recomendadas: no se especifican en la informacion proporcionada. Por el tamano del modelo, es viable en GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB), asi como en GPU profesionales A100 o H100, aunque no hay datos de rendimiento publicados para confirmar latencias.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con 4 GB o mas de VRAM puede alojar las cuantizaciones mas ligeras; las versiones Q8_0 y f16 requieren al menos 2-4 GB.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (a traves de GGUF), MLX / mlx-audio (Apple Silicon), y el ecosistema Transformers para el modelo base. No se menciona compatibilidad explicita con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada que permitan establecer una comparacion cuantitativa con modelos ASR alternativos. Como referencia cualitativa, se puede senalar lo siguiente:

| Modelo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| polyglot-lion-1.7b-v1.7 (esta ficha) | 1,72 B | en, zh, ms, ta | MIT | GGUF, Transformers |
| Whisper large-v3 (OpenAI) | ~1,55 B | multilingue (99 idiomas) | MIT | Transformers, GGUF, etc. |
| Whisper small (OpenAI) | ~244 M | multilingue | MIT | Transformers, GGUF, etc. |

La comparacion con Whisper se ofrece solo como referencia de categoria (ASR multilingue de tamano similar); no se dispone de resultados que permitan afirmar cual ofrece mejor rendimiento en los idiomas cubiertos por polyglot-lion.

## Limitaciones y advertencias

- La informacion disponible no detalla sesgos conocidos del modelo; al entrenarse con corpus publicos (Common Voice, AISHELL, FLEURS, LibriSpeech, etc.), es probable que herede los sesgos presentes en dichos datasets, pero no se confirma en la documentacion.
- Riesgo de alucinacion: no se documenta en la informacion proporcionada; en modelos ASR, este riesgo se manifiesta como transcripciones incorrectas o inventadas en segmentos de audio ruidoso o ininteligible.
- Limitaciones de idioma: solo cubre cuatro idiomas (en, zh, ms, ta); no se ha entrenado para otros idiomas y su rendimiento fuera de ese conjunto no esta garantizado.
- Limitaciones de contexto: no se especifica la longitud maxima de audio procesable ni la ventana de contexto del modelo.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial, modificacion y redistribucion sin restricciones significativas, siempre que se conserve el aviso de copyright.
- Caveat para produccion: las cuantizaciones estaticas (no ponderadas ni imatrix) pueden degradar la calidad en comparacion con cuantizaciones ponderadas; el autor indica que las versiones ponderadas no estan disponibles en el momento de la publicacion. Para produccion se recomienda evaluar Q5_K_M o Q8_0 frente a f16 en el dominio concreto de uso.
- El modelo base es `knoveleng/polyglot-lion-1.7b-v1.7`; esta ficha describe la version cuantizada, por lo que las limitaciones del modelo original aplican igualmente.

## Enlaces

- Repositorio Hugging Face (version cuantizada): https://huggingface.co/mradermacher/polyglot-lion-1.7b-v1.7-GGUF
- Modelo base: https://huggingface.co/knoveleng/polyglot-lion-1.7b-v1.7
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#polyglot-lion-1.7b-v1.7-GGUF
- Version anterior (v1.5): https://huggingface.co/mradermacher/polyglot-lion-1.7b-v1.5-GGUF
- Discusiones de la version anterior: https://huggingface.co/mradermacher/polyglot-lion-1.7b-v1.5-GGUF/discussions
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
