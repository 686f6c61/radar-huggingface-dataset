# mradermacher/GeoReranker-GGUF

## Resumen

GeoReranker-GGUF es la version cuantizada en formato GGUF del modelo GeoGPT-Research-Project/GeoReranker, publicada por mradermacher. Se trata de un reranker (modelo de reordenacion de candidatos) de aproximadamente 568 millones de parametros, distribuido originalmente en transformers y reconvertido a GGUF para su uso con llama.cpp y herramientas compatibles. El repositorio incluye 12 cuantizaciones static distintas, desde Q2_K (~0,5 GB) hasta f16 (~1,3 GB), lo que permite desplegarlo en hardware muy modesto.

El problema que resuelve es el reordenamiento de documentos o pasajes recuperados por un sistema de busqueda o RAG: dado un par consulta-documento, el modelo produce una puntuacion de relevancia que permite recolocar los resultados de un retriever inicial. El prefijo "Geo" y el proyecto de origen (GeoGPT-Research-Project) apuntan a un dominio geoespacial o geocientifico, aunque la model card disponible no confirma explicitamente el dominio de entrenamiento.

Es relevante ahora porque los rerankers de este tamano ofrecen una mejora sustancial de precision en pipelines RAG a un coste de computo bajo, y la disponibilidad de cuantizaciones GGUF permite ejecutarlos en CPU o en GPUs de consumo. La licencia MIT facilita su integracion comercial. No obstante, la informacion publica sobre arquitectura, datos de entrenamiento, contexto soportado y benchmarks es muy limitada: la model card del repositorio GGUF se limita a listar los ficheros cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo reranker; el pipeline declarado en HuggingFace es feature-extraction) |
| Parametros totales | 567.753.729 (~568 M) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base esta en safetensors/transformers |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base GeoGPT-Research-Project/GeoReranker. Por la naturaleza de la tarea (reranking) y el tamano (568 M de parametros), el patron habitual en esta categoria es un transformer encoder tipo cross-encoder que procesa conjuntamente consulta y documento y emite una puntuacion escalar de relevancia; sin embargo, esto no puede confirmarse con los datos disponibles. El repositorio GGUF etiqueta el modelo como feature-extraction, lo que sugiere que la salida se obtiene de las representaciones internas del modelo.

Tampoco se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o entrenamiento contrastivo con negativos hard. Las cuantizaciones publicadas son de tipo static, generadas mediante el pipeline de mradermacher, y el autor indica que no hay cuantizaciones weighted/imatrix disponibles en el momento de la publicacion ni planificadas a corto plazo. No se menciona ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.).

## Capacidades

- Reordenacion de candidatos: puntuar pares consulta-documento para reordenar resultados de un retriever, que es el uso principal esperado de un modelo de esta categoria.
- Extraccion de caracteristicas: el pipeline declarado en HuggingFace es feature-extraction, por lo que puede emplearse para obtener representaciones vectoriales.
- Procesamiento en ingles: la model card declara unicamente el idioma en.
- Inferencia en CPU y GPU de gama baja gracias a las cuantizaciones GGUF de 0,5 a 1,3 GB.
- Integracion con el ecosistema llama.cpp, Ollama y clientes compatibles con GGUF.
- Generacion de texto: no disponible. No hay indicios de que el modelo base sea generativo; es un modelo de puntuacion/reordenacion.
- Tool calling / function calling: no disponible, y no es una capacidad tipica de un reranker.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Reordenacion en pipelines RAG: tras una primera fase de recuperacion densa o dispersa (por ejemplo, con un retriever vectorial), el modelo reordena los k documentos recuperados antes de pasarlos al generador. Reduce el ruido en el contexto y mejora la precision de las respuestas finales.
- Busqueda empresarial sobre documentacion tecnica: aplicar el reranker sobre los resultados de un indice interno para priorizar los pasajes mas relevantes antes de mostrar los resultados al usuario o de alimentar un resumen automatico.
- Deduplicacion y filtrado de contexto: usar las puntuaciones del reranker para descartar candidatos por debajo de un umbral, reduciendo el numero de tokens enviados al modelo generativo y, con ello, el coste por consulta.
- Evaluacion de recuperadores: emplear las puntuaciones del modelo como metrica auxiliar para comparar distintas configuraciones de chunking, embeddings o parametros de busqueda dentro de un mismo corpus.
- Despliegue en entornos sin GPU: al existir cuantizaciones de 0,5 GB, puede ejecutarse en servidores solo con CPU o en dispositivos de borde, lo que permite incorporar reranking en productos donde no hay acelerador disponible.
- Procesamiento por lotes de grandes volumenes de pares consulta-documento: el reducido tamano del modelo permite puntuar millones de pares en un solo nodo con GPU de gama media, algo inviable con rerankers de varios miles de millones de parametros.
- Dominios geocientificos o geoespaciales (si se confirma el dominio del modelo base): reordenacion de resultados en buscadores de informacion territorial, catalogos de datos geoespaciales o literatura cientifica de ciencias de la Tierra. Esta aplicacion queda condicionada a la verificacion del dominio real de entrenamiento, que no esta documentado en la informacion disponible.
- Prototipado rapido en local: la version Q4_K_S o Q4_K_M permite montar un prototipo de reranking en un portatil sin GPU dedicada y migrar despues al modelo base en precision completa si se necesita mas calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de evaluacion (NDCG, MRR, MAP, BEIR, MIRACL ni similares) ni comparaciones con otros rerankers. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (568 M) y del tamano de los ficheros publicados, no datos medidos por el autor:

- VRAM estimada para inferencia:
  - f16 (~1,3 GB de pesos): en torno a 2-2,5 GB de VRAM contando el contexto y el overhead de la libreria.
  - Q8_0 (~0,7 GB): aproximadamente 1,5-2 GB.
  - Q6_K / Q5_K_M (~0,6 GB): aproximadamente 1,2-1,5 GB.
  - Q4_K_M / Q4_K_S (~0,5 GB): aproximadamente 1-1,5 GB.
  - Q2_K (~0,5 GB): aproximadamente 1 GB o menos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 cubren el modelo con margen amplio y permiten lotes grandes. Las GPU de centro de datos (A100, H100) solo tendrian sentido para servir muchas peticiones concurrentes, no por requisitos de memoria.
- Viabilidad en GPU de consumo: si. Cabe en practicamente cualquier GPU dedicada de los ultimos diez anos, en GPU integradas con memoria compartida y en CPU.
- Opciones de despliegue: llama.cpp (incluido llama-server), Ollama (mediante Modelfile a partir del GGUF), LM Studio y bindings de llama-cpp-python. Para el modelo base en transformers, cabria usar Text Embeddings Inference (TEI) de HuggingFace, que soporta rerankers, o un servidor propio con transformers. vLLM no esta orientado a este tipo de modelo.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de 568 M en cuantizacion Q4_K_M sobre GPU moderna se situa en el orden de milisegundos por par en lotes pequenos, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para GeoReranker, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Los datos de los modelos alternativos provienen de sus fichas publicas y conviene verificarlos antes de tomar una decision.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GeoReranker (este modelo, via GeoReranker-GGUF) | 568 M | no disponible | en | MIT | GGUF, safetensors (base) |
| BAAI/bge-reranker-v2-m3 | 568 M | 8192 tokens (segun su ficha publica) | multilingue | Apache-2.0 | safetensors, ONNX |
| BAAI/bge-reranker-base | 278 M | 512 tokens (segun su ficha publica) | en, zh | MIT | safetensors, ONNX |
| jinaai/jina-reranker-v2-base-multilingual | 278 M | 1024 tokens (segun su ficha publica) | multilingue | CC-BY-NC-4.0 (uso comercial restringido) | safetensors |

Diferencias clave: GeoReranker es el unico de la lista distribuido en GGUF con cuantizaciones de hasta 2 bits, lo que le da ventaja en despliegues sin GPU. Bge-reranker-v2-m3 ofrece cobertura multilingue y contexto largo declarado, y jina-reranker-v2 tiene una licencia que restringe el uso comercial. Los datos de benchmarks para GeoReranker no estan disponibles, por lo que no es posible afirmar cual de ellos es mas preciso.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: la model card del GGUF no describe arquitectura, datos de entrenamiento, contexto, formato de entrada ni procedimiento de uso mas alla de remitir a los README de TheBloke. Integrarlo en produccion requiere experimentacion previa.
- Idiomas: la model card declara unicamente ingles. El rendimiento en castellano u otros idiomas es desconocido y probablemente degradado.
- Longitud de contexto desconocida: no puede planificarse el tamano de chunk sin pruebas empiricas.
- Sesgos: no hay evaluaciones de sesgo publicadas. Al ser un modelo entrenado sobre datos no documentados, puede heredar sesgos de dominio, geograficos o culturales.
- Alucinacion: un reranker no genera texto, por lo que el riesgo de alucinacion en el sentido clasico no aplica. El riesgo equivalente es asignar puntuaciones de relevancia poco fiables a documentos fuera de la distribucion de entrenamiento.
- Licencia: MIT, permisiva y compatible con uso comercial. Se aplica al artefacto publicado; conviene comprobar la licencia del modelo base GeoGPT-Research-Project/GeoReranker, que la ficha identifica como MIT.
- Cuantizaciones de 2 y 3 bits: las variantes Q2_K y Q3_K_S reducen el tamano pero degradan la calidad de las puntuaciones. Para reranking, donde pequenas diferencias de score alteran el orden final, se recomienda Q4_K_M o superior.
- Cuantizaciones weighted/imatrix no disponibles: el autor indica que puede no llegar a publicarlas, por lo que no debe contarse con esa mejora de calidad.
- Repositorio con 0 descargas y 0 likes: no hay senales de validacion por parte de la comunidad, lo que incrementa el riesgo de comportamiento inesperado.
- Fecha de publicacion: la ficha indica creacion en septiembre de 2026, posterior a la mayoria de modelos comparables; conviene verificar el estado del repositorio antes de usarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GeoReranker-GGUF
- Modelo base: https://huggingface.co/GeoGPT-Research-Project/GeoReranker
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#GeoReranker-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
- Paper, blog o demo oficial del modelo base: no disponible
