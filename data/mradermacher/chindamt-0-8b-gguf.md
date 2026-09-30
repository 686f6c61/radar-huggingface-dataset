# mradermacher/ChindaMT-0.8B-GGUF

## Resumen

ChindaMT-0.8B-GGUF es el conjunto de cuantizaciones en formato GGUF publicadas por mradermacher a partir del modelo base iapp/ChindaMT-0.8B, un modelo de traduccion automatica especializado en el par de idiomas ingles-thai. El modelo original lo desarrolla el usuario iapp y esta entrenado sobre el dataset iapp/ChindaMT-Grounded, segun los metadatos de la model card. La aportacion de esta ficha concreta no es un modelo nuevo, sino una conversion a GGUF con distintos niveles de cuantizacion para permitir la inferencia en CPU, GPU de consumo y entornos con poca memoria.

El modelo tiene 1.006.672.704 parametros segun el peso real declarado en safetensors (aproximadamente 1,0B, pese a la nomenclatura "0.8B" del nombre). Se distribuye bajo licencia Apache 2.0, con soporte declarado para ingles y thai, y pipeline de traduccion. La libreria declarada es transformers y el repositorio ocupa 9,9 GB en total, incluyendo todas las variantes de cuantizacion.

Su relevancia practica es doble: por un lado, cubre la traduccion ingles-thai, un par con menos cobertura que los pares europeos en modelos abiertos; por otro, al publicarse en GGUF con tamanos desde 0,6 GB, es desplegable en hardware muy modesto. La model card no documenta arquitectura, contexto ni datos de entrenamiento, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el autor no la documenta; la libreria declarada es transformers) |
| Parametros totales | 1.006.672.704 (aproximadamente 1,0B, medido sobre safetensors) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Ingles (en) y thai (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se publica en safetensors) |
| Tamano del repositorio | 9,9 GB (todas las variantes incluidas) |
| Modelo base | iapp/ChindaMT-0.8B |
| Dataset declarado | iapp/ChindaMT-Grounded |
| Tarea declarada | Traduccion (pipeline: translation) |

Variantes publicadas y tamano en disco:

| Tipo | Tamano (GB) | Notas de la model card |
|---|---|---|
| mmproj-Q8_0 | 0,2 | Complemento multimodal |
| mmproj-f16 | 0,3 | Complemento multimodal |
| Q2_K | 0,6 | |
| Q3_K_S | 0,6 | |
| Q3_K_M | 0,7 | Calidad inferior |
| Q3_K_L | 0,7 | |
| IQ4_XS | 0,7 | |
| Q4_K_S | 0,7 | Rapida, recomendada |
| Q4_K_M | 0,8 | Rapida, recomendada |
| Q5_K_S | 0,8 | |
| Q5_K_M | 0,9 | |
| Q6_K | 0,9 | Muy buena calidad |
| Q8_0 | 1,2 | Rapida, mejor calidad |
| f16 | 2,1 | 16 bpw, sobredimensionada |

## Arquitectura y entrenamiento

No disponible. La model card del repositorio GGUF no describe la arquitectura del modelo base, el numero de tokens de entrenamiento, la composicion del dataset iapp/ChindaMT-Grounded ni si se aplicaron tecnicas de alineacion como RLHF, DPO o fine-tuning supervisado. La unica informacion tecnica declarada es que se trata de una conversion de iapp/ChindaMT-0.8B, que la libreria de referencia es transformers y que la tarea objetivo es la traduccion automatica, con etiquetas de instruction-following y machine-translation.

El proceso de cuantizacion si esta documentado parcialmente por el publicador: se generaron cuantizaciones estaticas (la model card indica quantize_version 2 y output_tensor_quantised 1) y existe un repositorio hermano con cuantizaciones ponderadas con matriz de importancia (imatrix), disponible en mradermacher/ChindaMT-0.8B-i1-GGUF. La presencia de ficheros mmproj entre los artefactos publicados indica que el modelo base incorpora un proyector multimodal, aunque la model card no detalla que modalidades cubre ni con que datos se entreno esa parte.

## Capacidades

- Traduccion automatica entre ingles y thai, en ambos sentidos, como tarea principal declarada.
- Generacion de texto con seguimiento de instrucciones, segun las etiquetas instruction-following y conversational del repositorio.
- Formato conversacional: el repositorio esta etiquetado como conversational, lo que indica soporte de plantillas de chat.
- Soporte multimodal potencial: se publican dos ficheros mmproj (f16 y Q8_0) descritos como complemento multimodal, lo que implica capacidad de procesar entradas adicionales al texto, sin que la model card especifique cuales.
- Capacidades multilingues limitadas a ingles y thai; no se declara soporte de otros idiomas, incluido el castellano.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode), generacion de codigo ni capacidades matematicas especializadas.

## Casos de uso

- Traduccion de documentacion tecnica ingles-thai: el modelo puede traducir manuales, fichas de producto y documentacion de API en lotes, con la ventaja de que las cuantizaciones Q4_K_X permiten ejecutarlo en una GPU de 4 GB o incluso en CPU.
- Localizacion de interfaces y cadenas de software: integrado en un pipeline de CI/CD que extraiga ficheros de recursos (.json, .po), traduzca las cadenas del ingles al thai y las reinyecte, aprovechando el bajo coste por token de un modelo de aproximadamente 1,0B.
- Atencion al cliente en thai sobre documentacion en ingles: traduccion en tiempo de ejecucion de respuestas generadas en ingles, o pre-traduccion de bases de conocimiento, desplegando el modelo en local para evitar enviar datos de clientes a servicios externos.
- Traduccion de contenido editorial y articulos: traduccion de borradores y resumenes para publicacion en medios tailandeses, con revision humana posterior dado el tamano reducido del modelo.
- Procesamiento por lotes en servidores sin GPU dedicada: con las variantes Q2_K a Q5_K_S (0,6-0,8 GB) el modelo cabe en memoria RAM de cualquier equipo, lo que permite ejecutar traducciones masivas nocturnas en CPU.
- Filtrado y pre-traduccion en pipelines de datos: uso del modelo como primer paso barato de traduccion de corpus tailandeses antes de pasar por un modelo mayor para refinamiento, reduciendo el coste total del pipeline.
- Prototipado y evaluacion de modelos de traduccion: por su tamano reducido, sirve como linea base rapida para comparar calidad en el par ingles-thai antes de invertir en modelos mayores de la misma familia, como ChindaMT-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher/ChindaMT-0.8B-GGUF no incluye metricas de calidad de traduccion (BLEU, chrF, COMET), ni resultados en tareas generales (MMLU, HumanEval, GSM8K), ni comparativas frente a otros sistemas de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 GB y 2 GB para las cuantizaciones de 4 bits y 5 bits (Q4_K_M ocupa 0,8 GB en disco, mas overhead de contexto y cache KV); aproximadamente 2,5-3 GB para Q8_0 y f16.
- Cuantizaciones minimas: Q2_K y Q3_K_S caben en 0,6 GB, por lo que pueden ejecutarse completamente en CPU con RAM convencional.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090 sin aprovechamiento completo). Para lotes grandes, una A100 o H100 no aporta ventaja por el tamano del modelo; el cuello de botella sera la CPU o el ancho de banda de memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales e incluso en iGPU con memoria compartida usando Q4_K_S o Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI tienen soporte de GGUF limitado; para estos ultimos seria preferible cargar el modelo base en safetensors.
- Nota sobre multimodalidad: si se desea usar la parte multimodal, hay que cargar tambien el fichero mmproj correspondiente, lo que anade 0,2-0,3 GB.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/ChindaMT-0.8B-GGUF | 1.006.672.704 (aprox. 1,0B) | No disponible | en, th | Apache 2.0 | GGUF | Objeto de esta ficha |
| iapp/ChindaMT-0.8B | No disponible en esta busqueda | No disponible | en, th | Apache 2.0 (heredada) | safetensors | Modelo base del anterior |
| mradermacher/ChindaMT-4B-GGUF | No disponible en esta busqueda (la nomenclatura sugiere 4B) | No disponible | en, th | Apache 2.0 | GGUF | Version mayor de la misma familia |
| mradermacher/CLM-0.8B-GGUF | No disponible en esta busqueda | No disponible | en, id | Apache 2.0 | GGUF | Mismo publicador y tamano, pero orientado a razonamiento y codigo, no a traduccion |

Los datos de rendimiento comparado no estan disponibles. La comparativa se limita a licencia, formato e idiomas declarados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al ser un modelo de traduccion entrenado sobre un dataset especifico (iapp/ChindaMT-Grounded) y sin model card detallada, no hay garantias sobre el tratamiento de registros formales, dialectos tailandeses o terminologia especializada.
- Riesgo de alucinacion: con aproximadamente 1,0B de parametros y sin datos de evaluacion publicados, el riesgo de omisiones, adiciones o traducciones inventadas en textos largos es alto. Se recomienda revision humana en contenidos sensibles o con terminologia tecnica.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar tareas de traduccion de documentos largos sin pruebas previas.
- Limitaciones de idioma: solo se declaran ingles y thai. No hay soporte esperado de castellano ni de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se imponen restricciones adicionales conocidas.
- Estado del repositorio: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia, lo que indica ausencia de validacion por parte de la comunidad.
- Discrepancia de nomenclatura: el nombre indica 0.8B, pero el recuento real de parametros es de 1.006.672.704 (aproximadamente 1,0B); conviene tenerlo en cuenta al estimar memoria.
- Ausencia de benchmarks: no hay ninguna metrica publicada que permita verificar la calidad de traduccion, por lo que no debe asumirse un rendimiento determinado frente a otros sistemas.
- Produccion: para entornos criticos, la falta de documentacion sobre arquitectura y datos de entrenamiento dificulta el analisis de cumplimiento y la trazabilidad del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ChindaMT-0.8B-GGUF
- Repositorio de cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/ChindaMT-0.8B-i1-GGUF
- Modelo base: https://huggingface.co/iapp/ChindaMT-0.8B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/iapp/ChindaMT-Grounded
- Version de 4B de la misma familia: https://huggingface.co/mradermacher/ChindaMT-4B-GGUF
- Pagina de resumen de cuantizaciones del publicador: https://hf.tst.eu/model#ChindaMT-0.8B-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
