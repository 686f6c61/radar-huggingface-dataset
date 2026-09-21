# mradermacher/this-that-model-1.0-GGUF

## Resumen

`mradermacher/this-that-model-1.0-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF del modelo `flock-io/this-that-model-1.0`, publicado por el usuario mradermacher (nethype GmbH), un autor habitual de versiones cuantizadas de modelos abiertos. No se trata por tanto de un modelo entrenado desde cero, sino de una conversión a GGUF pensada para su ejecución en llama.cpp y herramientas compatibles, sin necesidad de GPU de datacenter.

El modelo base cuenta con 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) según los tensores safetensors publicados, y está licenciado bajo MIT, lo que permite uso comercial sin restricciones adicionales. Las etiquetas declaradas por el autor del modelo base (`typed-decision`, `structured-output`, `calibration`, `decision-making`, `deltanet`, `linear-attention`) apuntan a un modelo especializado en producir decisiones tipadas y salidas estructuradas, con una arquitectura basada en DeltaNet y atención lineal en lugar de un transformer de atención completa convencional.

Es relevante ahora porque ocupa un nicho poco cubierto: modelos pequeños (por debajo de 2B parámetros) orientados a decisiones discretas y calibradas, no a generación de texto generalista, y distribuidos con licencia permisiva. El repositorio está íntegramente en inglés y su dataset de referencia es `limberc/this-that-spatial-bench`, lo que sugiere un foco en decisiones de tipo espacial o de elección entre alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeltaNet con atencion lineal (segun etiquetas del autor); numero de capas y dimensiones no disponible |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye para transformers |
| Tamano del repositorio | 18,1 GB (suma de todos los ficheros de cuantizacion) |
| Fecha de creacion | 20 de septiembre de 2026 |
| Cuantizaciones ponderadas / imatrix | no disponibles en el momento de publicacion |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Las etiquetas declaradas por el autor del modelo base (`deltanet`, `linear-attention`) indican que se trata de un modelo con mecanismos de atencion lineal tipo DeltaNet, una familia de capas recurrentes lineales que sustituyen la atencion cuadratica clasica por actualizaciones de estado con coste lineal en la longitud de secuencia. Esto suele traducirse en menor consumo de memoria de clave-valor durante la inferencia, aunque no se han publicado cifras concretas de contexto soportado.

Respecto al entrenamiento, la unica referencia disponible es el dataset `limberc/this-that-spatial-bench`, empleado presumiblemente para evaluacion o ajuste fino en tareas de decision espacial. No hay datos sobre numero de tokens de entrenamiento, composicion del corpus, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o calibracion supervisada. El autor del modelo base no ha publicado (en la informacion disponible) detalles sobre decodificacion especulativa, presupuesto de computo o innovaciones adicionales.

## Capacidades

- Generacion de decisiones tipadas: las etiquetas `typed-decision` y `structured-output` indican que el modelo esta orientado a emitir salidas con un esquema fijo (por ejemplo, eleccion entre alternativas etiquetadas) en lugar de texto libre.
- Calibracion: la etiqueta `calibration` sugiere que el modelo esta entrenado o evaluado para que sus puntuaciones de confianza reflejen la probabilidad real de acierto, algo critico en sistemas de decision automatizada.
- Decisiones de tipo "esto o aquello": el nombre del modelo y el dataset de referencia (`this-that-spatial-bench`) apuntan a tareas de eleccion binaria o de seleccion espacial entre opciones.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada; las etiquetas no lo mencionan.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta thinking mode ni cadenas de razonamiento explicitas.
- Capacidades de vision o audio: no disponibles.
- Generacion de texto generalista, codigo y matematicas: no documentadas; el enfoque declarado es la decision estructurada, no la generacion abierta.

## Casos de uso

- Enrutamiento de peticiones en pipelines de agentes: dado un conjunto de herramientas o subagentes disponibles, el modelo puede decidir cual invocar en funcion de la peticion, aprovechando su naturaleza de decision tipada con salida estructurada y su tamano reducido para mantener latencias bajas.
- Sistemas de decision binaria automatizada: por ejemplo, aceptar o rechazar una solicitud, aprobar o denegar una transaccion, o marcar un contenido como valido o invalido, usando la calibracion del modelo para umbralizar las decisiones segun el riesgo tolerado.
- Evaluacion de calidad y anotacion asistida: el modelo puede etiquetar pares de respuestas generadas por otros modelos (tipo "esta respuesta es mejor que aquella"), integrándose en un pipeline de evaluacion automatica donde el coste por inferencia es minimo.
- Tareas de razonamiento espacial: dado el dataset `limberc/this-that-spatial-bench`, encaja en escenarios como decidir que objeto esta mas cerca o mas lejos, que region contiene a un punto, o que trayectoria es preferible, con salida tipada consumible por codigo.
- Despliegue en el borde (edge computing): con ficheros GGUF desde 1,1 GB (Q2_K) hasta 2,1 GB (Q8_0), el modelo puede ejecutarse en dispositivos con recursos limitados, portatiles sin GPU dedicada o instancias CPU de bajo coste, siempre que la tarea no requiera contexto largo ni generacion extensa.
- Clasificacion con umbral de confianza en produccion: al exponer puntuaciones calibradas, permite construir flujos con "derivacion a humano" cuando la confianza cae por debajo de un umbral, reduciendo el riesgo de automatizar decisiones dudosas.
- Prototipado e investigacion en atencion lineal: al ser un modelo pequeno con arquitectura DeltaNet, resulta util para experimentar con alternativas a la atencion cuadratica en entornos academicos con presupuesto de computo limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de metricas (MMLU, HumanEval, GSM8K, exactitud en `this-that-spatial-bench`, calibracion medida como ECE, etc.), y la busqueda web realizada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos unicamente): aproximadamente 1,1 GB en Q2_K y Q3_K_S; 1,4 GB en Q4_K_M; 1,7 GB en Q6_K; 2,1 GB en Q8_0; 3,9 GB en f16. Hay que sumar el consumo del contexto y de la cache de estado propia de la atencion lineal, para la que no se dispone de cifras publicadas.
- GPU recomendadas: al tratarse de un modelo de 1,88 mil millones de parametros, es viable en GPUs de consumo. Cabe incluso en tarjetas de gama baja (GTX 1650, RTX 3050, iGPU con memoria compartida) y, por supuesto, en RTX 3060, RTX 4070, RTX 4090, A100 o H100, donde quedaria fuertemente limitado por el ancho de banda mas que por la capacidad.
- Ejecucion en CPU: viable en CPU de escritorio y en portatiles modernos con cuantizaciones Q4_K_S o Q4_K_M. Los ficheros Q3 y Q2 estan pensados para equipos con muy poca memoria, a costa de una perdida de calidad apreciable.
- Opciones de despliegue: llama.cpp y sus derivados (llama-cli, llama-server), Ollama, LM Studio, llama-cpp-python y otros frontends compatibles con GGUF. vLLM solo con soporte parcial de GGUF; TGI no soporta GGUF. Para GPU de datacenter, lo mas eficiente suele ser partir de los pesos originales en safetensors del modelo base en lugar de la cuantizacion GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion. Por tamano, en Q4_K_M sobre una GPU moderna deberia permitir generacion muy por encima del tiempo real, pero esto es una estimacion basada en el numero de parametros, no un dato medido.
- Nota sobre cuantizaciones ponderadas: el autor indica que en el momento de la publicacion no hay cuantizaciones ponderadas ni imatrix, y que podrian no aparecer. La lista de ficheros incluye 12 variantes, desde Q2_K (1,1 GB) hasta f16 (3,9 GB).

## Comparativa con modelos similares

La comparativa se establece con modelos abiertos de tamano comparable (entorno a 1-2 mil millones de parametros) y licencia permisiva. Los datos de los modelos alternativos proceden de conocimiento general y no han sido verificados en la busqueda web realizada, por lo que deben tomarse con cautela.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| this-that-model-1.0 (este repositorio, GGUF) | 1,88 B | no disponible | MIT | Decision tipada, calibracion, atencion lineal DeltaNet |
| Qwen3-1.7B | 1,7 B | 32 768 tokens (no verificado en esta busqueda) | Apache 2.0 | Proposito general, razonamiento y codigo |
| Llama-3.2-1B | 1,24 B | 128 000 tokens (no verificado en esta busqueda) | Llama 3.2 Community License | Proposito general, multilingue |
| SmolLM2-1.7B | 1,7 B | 8 192 tokens (no verificado en esta busqueda) | Apache 2.0 | Proposito general, eficiente en dispositivo |

Diferencias clave: frente a los modelos generalistas de la tabla, este modelo no compite en generacion de texto ni en contexto largo, sino en formato de salida estructurado y calibracion. Su licencia MIT es mas permisiva que la de Llama 3.2, aunque menos estandarizada que Apache 2.0. No hay datos de rendimiento comparativo publicados para respaldar una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion publicada. Al entrenarse presumiblemente con el dataset `limberc/this-that-spatial-bench` y esta declarado solo en ingles, es probable que su comportamiento fuera de ese dominio sea impredecible; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no evaluado. En un modelo orientado a decisiones estructuradas, el riesgo relevante no es tanto la fabulacion de texto como la emision de una decision con alta confianza cuando la entrada queda fuera de su distribucion de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada, lo que impide planificar despliegues con entradas largas. El modelo solo declara ingles, por lo que su uso en castellano no esta respaldado por el autor.
- Restricciones de licencia: la licencia del repositorio de cuantizaciones es MIT, igual que la del modelo base, por lo que el uso comercial esta permitido. Conviene verificar que el modelo base mantiene efectivamente MIT en su repositorio original antes de integrarlo en un producto.
- Riesgo de cuantizacion: este repositorio son cuantizaciones estaticas, sin ponderacion ni imatrix segun el propio autor. En un modelo pequeno, las cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar de forma notable la calibracion de las decisiones, que es precisamente la caracteristica diferencial del modelo. Para uso en produccion, Q5_K_M o Q6_K son opciones mas seguras.
- Ausencia de benchmarks: no hay ninguna metrica publicada, ni siquiera sobre el dataset de referencia. Cualquier decision de adopcion deberia ir precedida de una evaluacion propia en el dominio objetivo.
- Metadatos incompletos: se desconoce el pipeline, la configuracion de tokenizador, el numero de capas y la longitud de contexto real. Esto complica la integracion en frameworks que exigen estos datos.
- Popularidad nula en el momento del registro: 0 descargas y 0 likes, sin evidencia de uso en comunidad ni de validacion independiente.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/this-that-model-1.0-GGUF
- Modelo base: https://huggingface.co/flock-io/this-that-model-1.0
- Dataset de referencia: https://huggingface.co/datasets/limberc/this-that-spatial-bench
- Pagina de descarga resumida del autor: https://hf.tst.eu/model#this-that-model-1.0-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia general de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor de las cuantizaciones: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los unicos resultados obtenidos correspondian a paginas sobre zonas horarias (AEST), sin relacion con esta ficha. No se han localizado papers, blogs tecnicos ni demos asociados al modelo en la informacion disponible.
