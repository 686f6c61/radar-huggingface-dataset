# llm-semantic-router/Vela-1.0-Encoder-307M-Safety

## Resumen

Vela-1.0-Encoder-307M-Safety es un clasificador de texto basado en un encoder ModernBERT de 307.531.778 parametros, desarrollado por el equipo de vLLM Semantic Router (`llm-semantic-router`). Se trata de un ajuste fino (finetune) del modelo `llm-semantic-router/Vela-1.0-Encoder-307M`, especializado en detectar riesgo de contenido general y devolver una senal de seguridad que permita enrutar cada peticion hacia el tratamiento adecuado dentro de una arquitectura de router semantico.

El modelo no genera texto: es un encoder discriminativo orientado a `text-classification`. Su funcion dentro del ecosistema Vela es actuar como componente de guardrail o de enrutado, de modo que un gateway de LLM pueda decidir si una consulta requiere un manejo con soporte adicional (incluido soporte en crisis) o si puede procesarse por la via estandar. El autor remarca explicitamente que una senal de riesgo no implica rechazo automatico de la peticion.

Con 307 millones de parametros y una capacidad de entrada de 32.768 tokens (incluyendo tokens especiales), el modelo ocupa un nicho poco cubierto: clasificacion de seguridad con contexto muy largo, peso reducido y licencia Apache 2.0, lo que permite desplegarlo en el mismo plano que el router sin depender de un modelo generativo de gran tamano como clasificador auxiliar. El repositorio ocupa 1,3 GB y se distribuye unicamente en safetensors para `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder bidireccional) |
| Parametros totales | 307.531.778 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens de capacidad de entrada, incluidos tokens especiales |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos verificables: pipeline `text-classification`, libreria `transformers`, repositorio de 1,3 GB, compatible con `text-embeddings-inference` y con `endpoints_compatible`, modelo base `llm-semantic-router/Vela-1.0-Encoder-307M` con relacion `finetune`, fecha de creacion 2026-09-13.

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, un encoder transformer bidireccional de la familia BERT modernizada, que sustituye la atencion global completa por un esquema de atencion alterna (capas locales y capas globales) y emplea embeddings posicionales rotatorios, lo que reduce el coste computacional y de memoria en secuencias largas. Esa base es la que permite al modelo declarar 32.768 tokens de capacidad de entrada manteniendo un tamano de parametros de 307 millones. El modelo es un fine-tune del encoder base Vela-1.0-Encoder-307M; el autor no detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset, la politica de anotacion ni si se aplicaron tecnicas de alineamiento como RLHF o DPO, por lo que esos datos no estan disponibles.

La innovacion relevante no esta en la arquitectura, sino en el uso: el modelo se integra en el proyecto vLLM Semantic Router como senal de riesgo dentro de un pipeline de enrutado, y su salida esta pensada para condicionar el tratamiento posterior de la peticion (por ejemplo, activar flujos de soporte) en lugar de bloquear directamente. La model card advierte que una senal de riesgo puede requerir un manejo con apoyo, incluido soporte en crisis, y no implica rechazo automatico.

## Capacidades

- Clasificacion de texto para deteccion de riesgo de contenido general, con etiquetas de salida devueltas por el pipeline `text-classification` (se puede solicitar el conjunto completo de puntuaciones con `top_k=None`).
- Procesamiento de entradas muy largas: hasta 32.768 tokens incluidos los especiales, lo que permite clasificar documentos completos o conversaciones extensas sin trocear.
- Enrutado semantico: la salida se usa como senal para derivar la peticion a un flujo de tratamiento concreto dentro de un gateway LLM.
- Inferencia discriminativa de coste bajo: al no ser generativo, no produce tokens de salida y el coste por peticion es una unica pasada forward.
- Ejecucion en CPU: la model card documenta el uso con `device=-1`, es decir, sin GPU.
- Compatibilidad declarada con `text-embeddings-inference` y con endpoints compatibles.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni function calling: es un encoder clasificador, no un modelo de chat ni un agente.
- No se documentan capacidades multilingues especificas; el campo de idiomas no esta disponible.

## Casos de uso

- Enrutado de seguridad en un gateway LLM: colocado delante del modelo generativo, clasifica cada peticion entrante y emite una senal que el router usa para decidir que flujo de tratamiento aplicar, con un coste de inferencia muy inferior al de usar un guardrail generativo.
- Moderacion de contenido en plataformas UGC: clasificacion por lotes de comentarios, publicaciones o mensajes de foro para separar candidatos de revision humana, aprovechando la ventana de 32.768 tokens para evaluar hilos completos en lugar de mensajes aislados.
- Deteccion de riesgo con derivacion a soporte: en aplicaciones de salud mental o comunidades vulnerables, la senal de riesgo permite activar recursos de apoyo o lineas de crisis en lugar de rechazar la consulta, siguiendo el criterio explicito de la model card.
- Pre-filtro economico antes de un modelo mayor: descarta o marca el trafico de bajo riesgo para que solo una fraccion de las peticiones pase por un clasificador de seguridad mas caro, reduciendo el coste por millon de peticiones.
- Curaccion y etiquetado de datasets: clasificacion masiva de corpus para auditar la presencia de contenido de riesgo antes de usarlos en entrenamiento o evaluacion.
- Despliegue on-premise o en el borde: al ser un modelo de 307 millones de parametros con licencia Apache 2.0 y ejecucion en CPU documentada, encaja en entornos con requisitos de soberania de datos donde no se puede enviar el texto a un servicio externo.
- Analisis de seguridad en pipelines RAG: clasificar los documentos recuperados antes de incorporarlos al contexto del modelo generativo, evitando que material de riesgo entre en la ventana de contexto.
- Investigacion sobre clasificacion de seguridad: servir como linea base reproducible y de licencia permisiva para comparar enfoques de deteccion de riesgo con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de metricas (exactitud, F1, precision, recall, AUC) ni evaluaciones comparativas frente a otros clasificadores de seguridad, y la busqueda web realizada no devolvio datos de evaluacion del modelo. No se deben asumir cifras de rendimiento.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 1,23 GB en fp32, 615 MB en fp16/bf16, 307 MB en int8 y 154 MB en int4. Son calculos a partir del numero de parametros publicado, no mediciones del autor.
- Memoria adicional: el uso de una ventana de hasta 32.768 tokens incrementa la memoria de activaciones, especialmente en lotes grandes. La arquitectura ModernBERT esta disenada para limitar ese coste, pero no hay cifras publicadas de VRAM para el limite de contexto completo.
- GPU consumer: cabe con holgura en cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070), y tambien en GPUs de 24 GB (RTX 3090, RTX 4090) para lotes grandes o contexto completo.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para el modelo en si; se justifican si se comparte nodo con el resto del router o si se requiere throughput muy alto por batching.
- CPU: la model card muestra el uso con `device=-1`, por lo que la inferencia en CPU es un escenario soportado para cargas de baja concurrencia.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")` (versiones 4.57.6 o 5.17.0 segun el autor), Text Embeddings Inference (etiqueta declarada en el repo) y endpoints compatibles. vLLM puede servir modelos encoder de clasificacion, aunque no se documenta configuracion especifica para este checkpoint. No hay variantes GGUF publicadas, por lo que su uso directo en llama.cpp u Ollama requeriria conversion y no esta garantizado.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks ni especificaciones verificables de alternativas, por lo que no es posible establecer una comparativa numerica fiable. Como referencia cualitativa, dentro de la propia coleccion Vela existe el modelo base `llm-semantic-router/Vela-1.0-Encoder-307M`, del que este checkpoint es un fine-tune especializado en seguridad: misma arquitectura y mismo tamano, pero sin la especializacion en la tarea de clasificacion de riesgo.

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Safety | Encoder clasificador (ModernBERT) | 307.531.778 | 32.768 tokens | Apache 2.0 | no disponible |
| Vela-1.0-Encoder-307M | Encoder (ModernBERT), modelo base | no disponible en la informacion | no disponible | no disponible | no disponible |
| Otros clasificadores de seguridad open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no aporto especificaciones ni resultados de alternativas comparables, de modo que cualquier cifra sobre modelos de terceros seria una invencion.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas ni texto, solo etiquetas y puntuaciones de clasificacion. No puede sustituir a un LLM en ninguna tarea de generacion.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier clasificador de seguridad. La model card insiste en que una senal de riesgo no equivale a un rechazo automatico, por lo que el sistema que lo integre debe definir su propia politica de actuacion.
- Sesgos desconocidos: no se documenta la composicion del dataset de ajuste fino, la distribucion de idiomas, la demografia ni la metodologia de anotacion, lo que impide evaluar sesgos sistematicos por idioma, registro o colectivo.
- Cobertura idiomatica no declarada: el campo de idiomas no esta disponible. No se debe asumir un rendimiento uniforme fuera del idioma o idiomas mayoritarios del entrenamiento.
- Sin resultados de evaluacion publicados: no hay metricas verificables de exactitud, F1, precision ni recall, ni evaluaciones de robustez frente a ataques adversariales o evasion.
- Uso en dominios sensibles: en aplicaciones de salud mental o crisis, la senal del modelo no debe ser el unico criterio de decision; la propia model card plantea el riesgo como desencadenante de soporte, no como juicio clinico.
- Contexto largo sin medicion publicada: aunque se declaran 32.768 tokens de entrada, no hay datos de como se degrada la calidad de clasificacion en longitudes cercanas al limite.
- Licencia Apache 2.0: permisiva y apta para uso comercial, sin las restricciones de las licencias de otros guardrails propietarios, pero la licencia no cubre garantias de idoneidad ni de ausencia de sesgos.
- Repositorio sin adopcion: en el momento de los datos consultados, el modelo registra 0 descargas y 0 likes, por lo que no existe evidencia de comunidad, incidencias reportadas ni validacion independiente.
- Infraestructura de despliegue limitada: al no publicarse variantes cuantizadas ni GGUF, las opciones de servir el modelo siguen dependiendo de `transformers` o de servidores compatibles con safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Safety
- Modelo base: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Coleccion Vela 1.0 Router Models: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentacion de vLLM Semantic Router: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub del proyecto: https://github.com/vllm-project/semantic-router
- Canal de Slack del proyecto: https://vllm-dev.slack.com/archives/C09CTGF8KCN

Nota: la busqueda web realizada devolvio unicamente guias genericas sobre modelos de lenguaje (Wikipedia, GeeksforGeeks, articulos divulgativos y un ranking de LLM), sin relacion con este modelo ni con clasificadores de seguridad, por lo que no se incluyen como enlaces relevantes.
