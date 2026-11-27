# mradermacher/paper-trail-extract-4b-GGUF

## Resumen

Paper-trail-extract-4b es un modelo de extraccion de informacion especializado en el ambito de la politica climatica y la tecnologia civica, desarrollado originalmente por el usuario jismailov y publicado en Hugging Face. La version analizada aqui es una recuantizacion en formato GGUF realizada por mradermacher, un conocido publicador de cuantizaciones estaticas de modelos open source. El modelo resuelve el problema de extraer informacion estructurada a partir de documentos relacionados con politicas climaticas, un dominio donde los modelos generalistas suelen requerir prompts muy elaborados o fine-tuning adicional.

El modelo cuenta con 4.022.468.096 parametros totales (aproximadamente 4B) y esta disenado para tareas de extraccion conversacional en hungaro (hu) e ingles (en). Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para proyectos de civic-tech y analisis de documentos regulatorios.

La relevancia actual de esta ficha radica en que la version GGUF facilita el despliegue en hardware de consumo mediante llama.cpp y Ollama, democratizando el acceso a un modelo especializado que de otro modo requeriria infraestructura con GPU dedicada. El repositorio incluye 12 cuantizaciones distintas, desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica variante concreta en la informacion disponible) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | hungaro (hu), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base original probablemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base jismailov/paper-trail-extract-4b mas alla de que se trata de un transformer de aproximadamente 4B parametros. El modelo esta etiquetado como especializado en information-extraction, climate-policy y civic-tech, lo que sugiere un fine-tuning sobre un modelo base generalista orientado a tareas de extraccion estructurada de entidades, relaciones y eventos en documentos de politica climatica. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La version aqui descrita es una recuantizacion estatica realizada por mradermacher mediante llama.cpp, que genera los formatos GGUF a partir del modelo original. El autor de la cuantizacion indica que las cuantizaciones ponderadas con imatrix no estan disponibles por el momento, y que las cuantizaciones estaticas se generaron con la version 2 del proceso de cuantizacion. Los tags del repositorio incluyen awq, w4a16, compressed-tensors y llm-compressor, lo que indica que el modelo base fue sometido a tecnicas de compresion y cuantizacion consciente de la calibracion antes de generar los GGUF.

## Capacidades

- Extraccion de informacion estructurada a partir de documentos de politica climatica y textos de dominio civico.
- Generacion de texto conversacional en hungaro e ingles.
- Procesamiento de documentos con terminologia regulatoria y tecnica del ambito climatico.
- Capacidad de mantener conversaciones multi-turno (etiqueta conversational en el repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a hungaro e ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion automatizada de compromisos de reduccion de emisiones: el modelo puede procesar documentos de politica climatica y devolver estructuras JSON con objetivos, plazos y sectores afectados, gracias a su fine-tuning especifico en el dominio.
- Analisis de planes nacionales de energia y clima (PNEC): util para ONG y organismos publicos que necesitan comparar objetivos entre paises de forma sistematica, extrayendo indicadores clave de documentos extensos.
- Monitorizacion de votaciones y propuestas legislativas: integrado en pipelines de civic-tech, el modelo puede resumir y estructurar enmiendas parlamentarias relacionadas con transicion energetica en hungaro e ingles.
- Construccion de bases de datos de politicas publicas: extraccion de entidades (organismos, plazos, presupuestos) para alimentar repositorios consultables por periodistas e investigadores.
- Asistencia a la redaccion de informes de cumplimiento: el modelo puede identificar y citar obligaciones regulatorias a partir de textos normativos, reduciendo el trabajo manual de revision.
- Preprocesamiento para sistemas RAG: al ser un modelo pequeno (4B) y disponible en GGUF, puede ejecutarse en local para enriquecer metadatos de documentos antes de indexarlos en un sistema de recuperacion aumentada.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q2_K a Q4_K_M (1,8-2,6 GB), puede ejecutarse en portatiles sin GPU dedicada para tareas de extraccion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K aproximadamente 1,8 GB; Q4_K_M aproximadamente 2,6 GB; Q8_0 aproximadamente 4,4 GB; f16 aproximadamente 8,2 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4 o inferiores (GTX 1650, RTX 3050, RTX 4060). Para Q8_0 se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti). Para f16 se recomienda 10-12 GB (RTX 3080, RTX 4070).
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas para cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Tambien es posible usar transformers con el modelo base original en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|---|
| paper-trail-extract-4b (este) | 4B | no disponible | hu, en | Apache 2.0 | GGUF | Extraccion en politica climatica |
| Qwen2.5-3B-Instruct | 3B | 32K (tipico) | multilingue | Apache 2.0 | safetensors, GGUF | Generalista |
| Llama-3.2-3B-Instruct | 3B | 128K (tipico) | multilingue | Llama 3.2 Community | safetensors, GGUF | Generalista |
| Phi-3.5-mini-instruct | 3,8B | 128K (tipico) | multilingue | MIT | safetensors, GGUF | Generalista |

Nota: los datos de los modelos comparativos corresponden a especificaciones publicas habituales; no se dispone de benchmarks comparativos directos con paper-trail-extract-4b en la informacion proporcionada. La principal ventaja diferencial de este modelo es su especializacion en extraccion de informacion en el dominio climatico y su soporte nativo del hungaro, idioma poco cubierto por los modelos generalistas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al estar entrenado sobre documentos de politica climatica, puede heredar sesgos presentes en las fuentes utilizadas.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar entidades, cifras o plazos al extraer informacion; se recomienda validacion humana en flujos criticos.
- Limitaciones de contexto o idioma: solo soporta hungaro e ingles; no se especifica la longitud de contexto, lo que supone un riesgo para documentos muy extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene verificar la licencia del modelo base original por si difiere.
- Caveats para produccion: las cuantizaciones Q2_K y Q3 pueden degradar notablemente la calidad de extraccion; se recomienda Q4_K_M o superior para tareas de extraccion estructurada. Las cuantizaciones ponderadas (imatrix) no estan disponibles, lo que puede afectar al rendimiento en cuantizaciones bajas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad; se recomienda evaluacion propia antes de adoptarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/paper-trail-extract-4b-GGUF
- Modelo base: https://huggingface.co/jismailov/paper-trail-extract-4b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#paper-trail-extract-4b-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
