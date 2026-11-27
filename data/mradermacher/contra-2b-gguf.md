# mradermacher/ConTra-2B-GGUF

## Resumen

ConTra-2B-GGUF es la versión cuantizada en formato GGUF del modelo ConTra-2B, desarrollado originalmente por JJHou1 y convertido a GGUF por mradermacher. Se trata de un modelo de aproximadamente 1.880 millones de parámetros (1,88 B) orientado a la recuperación contextual de documentos y a pipelines de generación aumentada por recuperación (RAG). Su propósito principal es la selección y el ranking de pasajes relevantes dentro de un contexto documental, una tarea intermedia crítica en sistemas RAG donde el ruido en los fragmentos recuperados degrada la calidad de la respuesta final.

El modelo se distribuye exclusivamente en formato GGUF, con un conjunto de cuantizaciones estáticas que van desde Q2_K (1,1 GB) hasta f16 (3,9 GB), lo que lo hace desplegable en hardware de consumo. La model card incluye además ficheros mmproj (Q8_0 y f16), lo que sugiere soporte multimodal, aunque la información disponible no detalla la naturaleza exacta de esa capacidad.

La relevancia actual del modelo reside en su tamaño reducido combinado con una tarea especializada: un recuperador contextual de 2 B de parámetros puede integrarse como etapa de reordenación o filtrado en sistemas RAG sin requerir infraestructura de GPU de datacenter. No obstante, la información pública disponible es escasa: no se especifican licencia, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base orientado a contextual-retrieval; se desconoce la arquitectura exacta) |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base JJHou1/ConTra-2B. Por las etiquetas de la model card (contextual-retrieval, rag, document-retrieval) y por el tamano de 1,88 B de parametros, se trata de un modelo encoder o encoder-decoder especializado en tareas de recuperacion contextual, no de un modelo generativo de proposito general. La referencia arXiv 2611.34366 apunta a un articulo tecnico asociado, pero su contenido no forma parte de la informacion proporcionada.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). La conversion a GGUF es estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf), y el autor de las cuantizaciones indica que no ha generado variantes ponderadas/imatrix en el momento de la publicacion.

## Capacidades

- Recuperacion contextual de documentos: seleccion y ranking de pasajes relevantes dentro de un contexto amplio, tarea central en pipelines RAG.
- Filtrado y reordenacion de fragmentos recuperados para reducir ruido antes de la generacion.
- Procesamiento en ingles (unico idioma declarado).
- Soporte multimodal aparente: el repositorio incluye ficheros mmproj, lo que sugiere entrada de imagenes o documentos visuales; la naturaleza exacta no esta documentada en la informacion disponible.
- Compatibilidad con endpoints (tag endpoints_compatible) y con la libreria transformers.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.

## Casos de uso

- Reordenacion en pipelines RAG: el modelo puede puntuar y reordenar los fragmentos devueltos por un recuperador vectorial antes de pasarlos al generador, mejorando la precision del contexto final con un coste computacional bajo (1,3-2,1 GB en cuantizaciones habituales).
- Filtrado de contexto en atencion al cliente: en un sistema de soporte que recupera articulos de ayuda, ConTra-2B puede descartar pasajes irrelevantes y quedarse con los que responden a la consulta, reduciendo alucinaciones del modelo generativo posterior.
- Busqueda documental interna: indexacion y seleccion de fragmentos relevantes en corpus empresariales en ingles, desplegable en servidores sin GPU dedicada gracias a las cuantizaciones Q4_K_S o Q4_K_M.
- Preprocesado de preguntas sobre documentacion tecnica: seleccionar los apartados de un manual que responden a una duda concreta antes de la sintesis.
- Evaluacion de relevancia en sistemas de QA extractivo: clasificar pasajes candidatos como relevantes o irrelevantes para una pregunta dada.
- Prototipado local de sistemas RAG: al caber en GPU de consumo (2-4 GB de VRAM en Q4/Q8), permite iterar sobre pipelines de recuperacion en estaciones de trabajo sin acceso a clúster.
- Procesamiento de documentos con componente visual: el fichero mmproj permite, si la capacidad esta confirmada, incorporar paginas escaneadas o capturas al proceso de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con Q4_K_M (1,4 GB de fichero mas overhead de contexto); unos 3 GB con Q8_0 (2,1 GB); unos 4,5-5 GB con f16 (3,9 GB). Los ficheros mmproj anaden 0,5-0,8 GB si se usa la via multimodal.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); en datacenter, A100 o H100 no son necesarias para este tamano, aunque permitirian mayor throughput por batching.
- Cabe en GPU de consumo: si, en la practica totalidad de tarjetas con 4 GB o mas; las cuantizaciones Q2_K y Q3_K_S (1,1 GB) permiten incluso despliegue en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python); el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (1,88 B), se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (recuperadores contextuales de ~2 B) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia no especificada: la ausencia de licencia explicita impide confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base JJHou1/ConTra-2B antes de usarlo en produccion.
- Modelo especializado: no es un modelo generativo de proposito general; su uso esperado es la recuperacion y el ranking de pasajes, no la conversacion abierta.
- Ausencia de benchmarks: no hay datos publicados que permitan estimar su calidad frente a alternativas; conviene evaluarlo en el dominio concreto antes de adoptarlo.
- Riesgo de sesgo y alucinacion: no documentado en la informacion disponible; al operar sobre fragmentos recuperados, un ranking erroneo puede propagar errores al generador posterior.
- Cuantizaciones estaticas: el autor no ha publicado variantes ponderadas/imatrix, que suelen ofrecer mejor calidad por bit en tamanos pequenos; las Q2_K y Q3_K_M pueden degradar notablemente el rendimiento.
- Contexto maximo desconocido: sin la longitud de contexto declarada no se puede garantizar el comportamiento en documentos largos.
- Capacidad multimodal sin documentar: la presencia de ficheros mmproj no viene acompanada de especificaciones sobre que modalidad cubre ni como usarla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ConTra-2B-GGUF
- Modelo base: https://huggingface.co/JJHou1/ConTra-2B
- Pagina de descargas del autor de las cuantizaciones: https://hf.tst.eu/model#ConTra-2B-GGUF
- Articulo de referencia (arXiv): 2611.34366
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
