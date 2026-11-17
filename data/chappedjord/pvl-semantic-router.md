# chappedjord/pvl-semantic-router

## Resumen

El modelo `chappedjord/pvl-semantic-router` es un fine-tuning de `sentence-transformers/all-MiniLM-L6-v2` publicado por el usuario chappedjord bajo el paraguas del protocolo Preventative Value Labs (PVL). Se presenta como un enrutador semantico de bajo consumo que se ejecuta en CPU y actua como primera capa de triaje antes de invocar modelos generativos de mayor tamano (concretamente, un modelo denominado Cranberry-12B que no forma parte de este repositorio). Su funcion es clasificar y descomponer consultas en cuatro aspectos (intencion, sintoma, superficie y solucion) y emparejarlas contra una base de 12.193 invariantes de seguridad de memoria en C/C++ y EVM.

Arquitectonicamente es un transformer encoder MiniLM-L6-v2 de 22,7 millones de parametros con embeddings de 384 dimensiones, empaquetado en formato safetensors y distribuido con la libreria sentence-transformers. El repositorio incluye ademas un vector store precalculado (35,6 MB) con embeddings de las invariantes y scripts Python de enrutamiento. El modelo base esta bajo licencia Apache 2.0, mientras que el autor declara que las especificaciones de invariantes y el motor de enrutamiento son software propietario del protocolo PVL.

La relevancia del proyecto es limitada y muy especifica: propone un patron de "prefill de negentropia" en el que las restricciones formales se inyectan en la KV-cache del modelo generativo para evitar decodificacion autoregresiva innecesaria. No obstante, el modelo no cuenta con descargas ni likes en el momento de la consulta y la documentacion disponible es fundamentalmente una descripcion de arquitectura de sistema, no una evaluacion empirica del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L6-v2), 6 capas, embeddings de 384 dimensiones |
| Parametros totales | 22,7 millones (22.7M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 para el modelo MiniLM; el autor declara propietario el protocolo PVL y las especificaciones de invariantes |
| Formato de pesos | safetensors (model.safetensors); tokenizer en JSON/WordPiece |
| Tamano del repositorio | 0,1 GB (86,7 MB el modelo + 35,6 MB el vector store) |
| Pipeline | feature-extraction |
| Libreria | sentence-transformers |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del MiniLM-L6-v2 de sentence-transformers, un transformer encoder de 6 capas con atencion multi-cabeza y embeddings de 384 dimensiones, disenado originalmente para generar representaciones de frases mediante similitud coseno. El repositorio no documenta el proceso de fine-tuning: no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de contraste (por ejemplo, Multiple Negatives Ranking Loss) o ajuste supervisado. Tampoco se detalla si hubo RLHF, DPO o cualquier otra fase de alineamiento, algo por otra parte poco habitual en modelos de embeddings.

La innovacion que el autor atribuye al sistema no reside en el modelo en si, sino en el pipeline que lo rodea: un motor de enrutamiento (`pvl_router.py`) que inspecciona el toolchain (ASan, GCC, Clang), realiza una busqueda por similitud cosena contra un vector store de 12.193 invariantes precalculadas y devuelve la invariante mas cercana junto con su hash. Esa salida se inyecta despues en la KV-cache de un modelo generativo de 12B (Cranberry-12B) mediante prefill paralelo. El autor denomina a este mecanismo "prefill de negentropia" y afirma que reduce el coste energetico de la decodificacion autoregresiva, aunque no se aportan mediciones reproducibles ni comparaciones con baselines.

## Capacidades

- Extraccion de embeddings de frases en ingles con 384 dimensiones, apta para busqueda semantica y similitud coseno.
- Clasificacion y descomposicion de consultas en cuatro aspectos: intencion, sintoma, superficie y solucion.
- Emparejamiento semantico contra una base de 12.193 invariantes de seguridad de memoria en C/C++ y EVM, con embeddings precalculados.
- Inspeccion de toolchain (ASan, GCC, Clang) segun la documentacion del motor de enrutamiento.
- Generacion de una invariante verificada (token + hash) que puede inyectarse en la KV-cache de un modelo generativo.
- Seguimiento de energia fisica consumida por CPU (julios) y marcas de tiempo por operacion de enrutamiento.
- No soporta tool calling ni function calling en el sentido de los LLM generativos.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No dispone de capacidades de vision, audio ni generacion de texto libre.

## Casos de uso

- Triaje previo a inferencia en GPU: el router clasifica la consulta en CPU con un consumo declarado inferior a 0,001 julios y evita invocar el modelo generativo de 12B cuando la consulta no requiere sintesis compleja. Es adecuado por su bajo coste energetico y su latencia sub-milisegundo declarada.
- Busqueda semantica de invariantes de seguridad de memoria: dado un fragmento de codigo C/C++ o una descripcion de bug, el modelo recupera la invariante formal mas cercana del vector store de 12.193 entradas para guiar la correccion.
- Asistencia en pipelines de verificacion formal: el router puede integrarse en un paso previo de CI que selecciona que especificaciones formales aplicar antes de lanzar un comprobador o un harness de pruebas.
- Inspeccion de toolchain en entornos de compilacion: el motor asociado detecta la presencia de ASan, GCC o Clang y ajusta la consulta semantica en funcion del entorno disponible.
- Enrutamiento de consultas en sistemas de agentes: como capa de clasificacion de intencion en ingles, puede decidir a que subsistema derivar una peticion (analisis estatico, sintesis de parches, explicacion) sin coste de GPU.
- Investigacion sobre inyeccion de restricciones en KV-cache: el modelo sirve como componente reproducible para experimentar con prefill de especificaciones formales en modelos generativos, ya que el repositorio incluye los embeddings y los scripts de prueba.
- Prototipado de routers de bajo consumo en CPU: util para entornos embebidos o servidores sin GPU donde se necesite clasificacion semantica ligera con un modelo de 22,7M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (recall@k, MRR), precision de clasificacion, latencia medida ni comparaciones con el modelo base sin fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo previsto (CPU). En GPU, el modelo en fp32 ocupa aproximadamente 90 MB; en fp16, unos 45 MB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente; tambien A100 o H100 si se integra en un servidor existente.
- Cabe en cualquier GPU consumer, e incluso en CPU sin GPU dedicada, que es el escenario disenado por el autor.
- Opciones de despliegue: sentence-transformers, Hugging Face Transformers, y potencialmente ONNX Runtime o llama.cpp no aplican (no hay version GGUF publicada).
- Latencia y throughput estimados: el autor declara enrutamiento sub-milisegundo en CPU y un consumo inferior a 0,001 julios por operacion, pero no se aportan mediciones independientes ni condiciones de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| chappedjord/pvl-semantic-router | 22,7M | 384 | No disponible | Apache 2.0 (modelo) / propietario (protocolo) | Enrutamiento semantico de invariantes |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7M | 384 | 256 tokens (segun model card original) | Apache 2.0 | Embeddings de frases generales |
| sentence-transformers/all-MiniLM-L12-v2 | 33,4M | 384 | 256 tokens (segun model card original) | Apache 2.0 | Embeddings de frases generales |
| BAAI/bge-small-en-v1.5 | 33M | 384 | 512 tokens | MIT | Embeddings de frases y recuperacion |

La comparativa se limita a modelos de embeddings de tamano similar. No se dispone de datos de rendimiento del modelo PVL frente a estas alternativas, por lo que la comparacion es estructural y no empirica.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- No hay evidencia publicada de que el fine-tuning mejore al modelo base en la tarea de enrutamiento: no se aportan metricas de recuperacion ni de clasificacion.
- La model card describe una arquitectura de sistema (router + Cranberry-12B) pero no documenta el proceso de entrenamiento del propio modelo de embeddings.
- El vector store de invariantes y el motor de enrutamiento se declaran propietarios bajo el protocolo PVL, lo que puede restringir el uso comercial de esos componentes aunque el modelo MiniLM sea Apache 2.0.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion: bajo en tanto que es un modelo de embeddings, pero el emparejamiento por similitud coseno puede devolver invariantes incorrectas si la consulta es ambigua o esta fuera del dominio C/C++/EVM.
- La afirmacion de "sub-milisegundo" y "menos de 0,001 julios" no viene acompanada de metodologia de medicion ni de hardware de referencia.
- No se especifica la longitud maxima de secuencia soportada por el fine-tuning, lo que impide planificar el troceado de entradas largas.
- La fecha de creacion del repositorio (2026-11-17) y la falta de actualizaciones posteriores sugieren un proyecto en estado inicial o experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chappedjord/pvl-semantic-router
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentacion de sentence-transformers: https://www.sbert.net/
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Paper de MiniLM (Microsoft): https://arxiv.org/abs/2002.10957
