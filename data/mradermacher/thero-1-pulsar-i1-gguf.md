# mradermacher/Thero-1-Pulsar-i1-GGUF

## Resumen

Thero-1-Pulsar es un modelo de lenguaje de 8.950 millones de parametros (~8,95 B) desarrollado por Lothera, distribuido con licencia CC-BY-4.0 y orientado a razonamiento, uso de herramientas y capacidades multimodales (vision). Esta ficha cubre la version cuantizada en GGUF publicada por mradermacher bajo el identificador `mradermacher/Thero-1-Pulsar-i1-GGUF`, que emplea cuantizacion con matriz de importancia (imatrix) para preservar la calidad en tamanos reducidos.

El modelo base, `Lothera/Thero-1-Pulsar`, se presenta como un LLM de pesos abiertos con soporte declarado para ingles, turco y otros idiomas (multilingue), ademas de etiquetas que indican capacidades de razonamiento, tool-use y vision. La relevancia de esta publicacion radica en que ofrece una ruta de despliegue local eficiente: los cuants i1 de mradermacher permiten ejecutar un modelo de ~9 B en hardware de consumo, algo imposible con los pesos originales en precision completa.

No se dispone de informacion publica sobre la arquitectura interna exacta, el numero de tokens de entrenamiento, la composicion del dataset ni los resultados de benchmarks en la informacion proporcionada; los apartados correspondientes lo indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, segun el pipeline de transformers; detalles no publicados) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 con imatrix: Q2_K, IQ3_M, Q4_K_S (tambien existen cuants estaticos en el repo `Thero-1-Pulsar-GGUF`) |
| Idiomas soportados | en, tr, multilingual |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales presumiblemente safetensors en el repo base |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna del modelo base en la informacion disponible. Las etiquetas del repositorio indican que se trata de un modelo de tipo transformer (libreria `transformers`), con capacidades declaradas de razonamiento, tool-use y vision (multimodal), y con soporte multilingue (ingles, turco). No se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos u otras innovaciones.

Respecto al entrenamiento, no hay datos disponibles sobre el numero de tokens, la composicion del corpus, el uso de RLHF/DPO ni la metodologia de alineacion. La unica informacion tecnica concreta de esta publicacion es el proceso de cuantizacion: mradermacher ha generado cuants GGUF de tipo i1 (importancia) a partir de una matriz de importancia (`Thero-1-Pulsar.imatrix.gguf`, 0,1 GB), lo que mejora la fidelidad frente a cuantizaciones estaticas de tamano comparable. El repositorio incluye ademas cuants estaticos en un repo separado y advierte que, al ser un modelo de vision, los ficheros `mmproj` (proyector multimodal) se encuentran en el repositorio estatico.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Razonamiento (etiqueta `reasoning`), presumiblemente con cadenas de pensamiento; no se detalla el modo exacto.
- Uso de herramientas / function calling (etiqueta `tool-use`).
- Capacidades multimodales de vision (etiqueta `vision` y `multimodal`; el autor indica que es un modelo de vision y que los ficheros `mmproj` estan en el repo estatico).
- Soporte multilingue con enfasis en ingles y turco.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs de inferencia tipo OpenAI.
- No se confirman capacidades de audio ni de agentes multi-paso mas alla de lo que implican las etiquetas de tool-use.

## Casos de uso

- Asistente conversacional local en turco e ingles: el modelo puede gestionar dialogos multi-turno en ambas lenguas, lo que lo hace util para atencion al cliente o asistentes personales en entornos con requisitos de privacidad, ejecutandose en local mediante llama.cpp u Ollama con cuants de 4-5 GB.
- Razonamiento asistido en documentacion tecnica: con la etiqueta de razonamiento, puede emplearse para descomponer problemas y explicar pasos intermedios en tareas de analisis, aunque sin datos de benchmarks no puede garantizarse su fiabilidad en matematicas o logica formal.
- Integracion en pipelines con tool calling: al declarar soporte de tool-use, puede conectarse a funciones externas (consultas a bases de datos, APIs) en flujos de automatizacion, siempre que se valide su comportamiento real con pruebas propias.
- Procesamiento de imagenes con descripcion textual: gracias a su componente de vision, puede emplearse para generar descripciones, extraer texto de capturas o responder preguntas sobre imagenes, usando los ficheros `mmproj` del repositorio estatico junto con el cuant GGUF.
- Despliegue en estaciones de trabajo sin GPU dedicada de gran capacidad: los cuants i1-Q4_K_S (5,5 GB) permiten ejecucion en CPU con llama.cpp, adecuado para prototipado y entornos de desarrollo con recursos limitados.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye varios niveles (Q2_K, IQ3_M, Q4_K_S) e incluso la matriz de importancia, lo que permite a investigadores medir la degradacion de calidad por nivel de cuantizacion en un modelo de ~9 B.
- Generacion de contenido multilingue para mercados turco-hablantes: el soporte nativo del turco lo diferencia de modelos mayoritariamente anglocentricos, util para localizacion de contenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-Q2_K: ~4,0 GB.
  - i1-IQ3_M: ~4,6 GB.
  - i1-Q4_K_S: ~5,5 GB.
  - Pesos originales en fp16: ~17,9 GB (8,95 B x 2 bytes), mas overhead.
- GPU recomendadas: no especificadas por el autor. Por tamano, un cuant Q4_K_S cabe en GPUs consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070); los cuants mayores o fp16 requieren 16-24 GB (RTX 4090, A100 40 GB, H100) para margen de contexto.
- Cabe en GPU consumer: si, al menos con cuants Q2_K a Q4_K_S en GPUs de 8 GB; con 12-16 GB se dispone de margen para contexto largo.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere servidores de inferencia con API compatible con OpenAI. Para vision es necesario cargar tambien el fichero `mmproj` del repositorio estatico.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparacion fundamentada con alternativas. A modo orientativo por categoria (modelos abiertos de ~8-9 B), se indican alternativas sin afirmar superioridad:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Thero-1-Pulsar (esta ficha) | ~8,95 B | no disponible | CC-BY-4.0 | GGUF (i1 y estatico) |
| Llama 3.1 8B | 8 B | 128 K (segun documentacion publica de Meta) | Llama 3.1 Community License | safetensors, GGUF |
| Qwen2.5 7B | 7,6 B | 128 K (segun documentacion publica de Alibaba) | Apache 2.0 (mayoria de variantes) | safetensors, GGUF |
| Mistral 7B | 7,3 B | 32 K (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF |

Los datos de contexto y licencia de las alternativas provienen de su documentacion publica habitual; no se dispone de benchmarks comparativos con Thero-1-Pulsar para establecer diferencias de calidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad real en razonamiento, codigo, matematicas o vision; debe validarse con pruebas propias antes de produccion.
- Riesgo de alucinacion: inherente a los LLM; sin datos de alineacion (RLHF/DPO) no puede estimarse su magnitud.
- Sesgos desconocidos: no se documenta la composicion del dataset ni los sesgos conocidos; el enfasis en turco e ingles puede implicar menor calidad en otros idiomas.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar cargas de contexto largo con garantias.
- Cuantizacion con perdida: los cuants Q2_K e IQ3_M degradan la calidad respecto al modelo original; para produccion se recomienda Q4_K_S o superior, o los pesos originales.
- Vision condicionada: para usar capacidades multimodales hay que descargar los ficheros `mmproj` del repositorio estatico, no incluidos en este repo i1.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero conviene revisar los terminos del modelo base y citar adecuadamente a Lothera y a mradermacher.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validacion comunitaria y de soporte.
- Fecha de creacion futura en los metadatos (2026-11-22): inconsistencia que conviene verificar antes de confiar en la version del modelo.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/mradermacher/Thero-1-Pulsar-i1-GGUF
- Modelo base: https://huggingface.co/Lothera/Thero-1-Pulsar
- Cuants estaticos (incluye `mmproj` para vision): https://huggingface.co/mradermacher/Thero-1-Pulsar-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Thero-1-Pulsar-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
