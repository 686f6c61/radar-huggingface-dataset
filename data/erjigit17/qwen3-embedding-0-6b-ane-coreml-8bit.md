# erjigit17/qwen3-embedding-0.6b-ane-coreml-8bit

## Resumen

Este repositorio publica una variante cuantizada a 8 bits del paquete Core ML de Qwen3-Embedding-0.6B preparado por neuradex para ejecutarse en el Apple Neural Engine (ANE). No es un modelo nuevo ni una reimplementacion de la conversion: el autor parte de los ficheros `.mlpackage` ya publicados por neuradex, aplica cuantizacion lineal simetrica de 8 bits sobre los pesos mediante `coremltools.optimize.coreml` y distribuye el resultado junto al `tokenizer.json` y el script `quantize.py` que reproduce la operacion. El objetivo es reducir el ancho de banda de memoria en el ANE, que en modelos de embeddings de la clase 300M-600M es el cuello de botella dominante por encima del computo.

El resultado medido en un Apple M4 con la variante de forma fija de 128 tokens (`b1_s128`) es de aproximadamente 18,6 ms de latencia frente a los ~24,6 ms del paquete fp16 original, con una similitud coseno de 0,999 respecto al modelo sin cuantizar. El autor probo tambien 6 y 4 bits: 6 bits no aporta ganancia de latencia y degrada la similitud a 0,993, mientras que 4 bits destruye los embeddings (similitud coseno entre 0,50 y 0,60) y los deja inutilizables, por lo que no se publican. La conclusion operativa del autor es explicita: no bajar de 8 bits con este modelo.

Se trata, por tanto, de una pieza de infraestructura para inferencia de embeddings en local sobre hardware Apple Silicon, no de un modelo generativo. Hereda la licencia Apache-2.0 tanto de `Qwen/Qwen3-Embedding-0.6B` como del paquete intermedio de neuradex, y su relevancia actual esta en abaratar la busqueda semantica y el RAG totalmente on-device en macOS e iOS sin depender de GPU dedicada ni de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo de embeddings Qwen3-Embedding-0.6B), con last-token pooling; empaquetado como programa Core ML para ANE |
| Parametros totales | ~0,6 mil millones (segun el nombre del modelo base `Qwen3-Embedding-0.6B`); el desglose exacto no se detalla en la informacion proporcionada |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | formas de entrada fijas de 128 y 512 tokens en los dos paquetes publicados; la longitud de contexto nativa del modelo base no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits lineal simetrica (publicada); fp16 (referencia del paquete de neuradex); 6 bits y 4 bits (palettization) probadas y descartadas, no publicadas |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (`qwen3-b1_s128-8bit.mlpackage` y `qwen3-b1_s512-8bit.mlpackage`), mas `tokenizer.json` y `quantize.py` |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen/Qwen3-Embedding-0.6B`, un transformer decoder-only de la familia Qwen3 adaptado a extraccion de caracteristicas y similitud semantica. El contrato de entrada y salida no cambia respecto a los paquetes de los que deriva: pooling sobre el ultimo token, con prefijo de instruccion aplicado unicamente a las consultas y no a los documentos. Este repositorio no modifica tokenizacion, pooling ni prefijos; solo altera la precision de los pesos.

Sobre el entrenamiento no hay informacion en la model card: no se indica numero de tokens, composicion del dataset, ni si hubo fases de RLHF o DPO. La innovacion tecnica que documenta el repositorio es exclusivamente la cuantizacion: un esquema lineal simetrico de 8 bits aplicado con dos lineas de `coremltools.optimize.coreml`, justificado porque en el ANE los pesos de un modelo de 0,6B dominan el ancho de banda de memoria mas que el computo, de modo que reducirlos a la mitad en tamano produce una ganancia de latencia real y verificada. El autor descarta explicitamente la palettization agresiva (4 bits) al comprobar que por debajo de 8 bits el coste de latencia ya no esta en la precision de los pesos y la compresion solo aporta perdida de calidad.

## Capacidades

- Generacion de embeddings de frases y documentos para similitud semantica y extraccion de caracteristicas (`feature-extraction`, `sentence-similarity`).
- Recuperacion semantica y busqueda por similitud coseno sobre vectores normalizados.
- Procesamiento de consultas con prefijo de instruccion y documentos sin prefijo, segun el contrato del modelo base.
- Ejecucion totalmente on-device en macOS sobre CPU y Apple Neural Engine (`ComputeUnit.CPU_AND_NE`), sin acceso a red.
- Dos formas de entrada fijas: 128 y 512 tokens, utiles para elegir entre baja latencia o mayor cobertura de texto.
- No dispone de generacion de texto: es un modelo de embeddings, no un LLM conversacional.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente por si mismo (puede actuar como recuperador dentro de un agente externo).
- No se documentan capacidades de vision, audio ni modo de razonamiento (thinking).
- El soporte multilingue no se detalla en la informacion proporcionada.

## Casos de uso

- Busqueda semantica local en aplicaciones macOS: indexar un corpus de documentos con la variante de 512 tokens y resolver consultas con la de 128 tokens, con ~18,6 ms por embedding en un M4, sin enviar datos a ningun servidor.
- RAG on-device para asistentes de escritorio: el modelo actua como recuperador de fragmentos relevantes antes de pasarlos a un LLM local o remoto, manteniendo el material sensible dentro del equipo.
- Deduplicacion y near-duplicate detection en bases de conocimiento: comparar embeddings por similitud coseno para agrupar documentos practicamente identicos antes de consolidar un repositorio.
- Clasificacion de tickets de soporte por similitud: asignar cada ticket entrante a la categoria cuyo centroide de embeddings este mas proximo, sin entrenar un clasificador dedicado.
- Agrupacion (clustering) de feedback de usuarios o resenas: generar embeddings por elemento y aplicar k-means o HDBSCAN para descubrir temas recurrentes.
- Recomendacion de contenido: representar items y preferencias del usuario en el mismo espacio vectorial y ordenar por similitud, con inferencia en el propio dispositivo.
- Etiquetado y enrutado de correo o mensajes: decidir destino o prioridad a partir de la cercania semantica a ejemplos etiquetados previamente.
- Memoria semantica para agentes locales: almacenar interacciones pasadas como vectores y recuperar las mas relevantes en cada turno, aportando contexto persistente sin salir del equipo.
- Moderacion o filtrado por similitud: detectar contenido cercano a patrones problematicos conocidos mediante comparacion vectorial.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas de embeddings (MTEB, MMLU, HumanEval u otros). Los unicos datos medidos son de latencia y fidelidad respecto al paquete fp16 sin cuantizar, sobre un Apple M4 con la forma `b1_s128`:

| Precision | Latencia, `b1_s128` (M4) | Similitud coseno frente a sin cuantizar |
|---|---|---|
| fp16 (paquete de neuradex) | ~24,6 ms | 1,000 (referencia) |
| 8 bits (este repositorio) | ~18,6 ms | 0,999 |
| 6 bits (probado, no publicado) | ~19,0 ms | 0,993 |
| 4 bits (probado, no publicado) | ~19,0 ms | 0,50-0,60 (inutilizable) |

No se han publicado resultados de benchmarks de calidad en tareas downstream en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (mediciones realizadas en un Apple M4); el paquete usa `compute_units=ct.ComputeUnit.CPU_AND_NE`.
- Memoria: no hay cifra de VRAM publicada. Como referencia de orden de magnitud, un modelo de ~0,6B parametros ocupa aproximadamente 1,2 GB en fp16 y alrededor de 0,6 GB a 8 bits; el repositorio completo ocupa 1,2 GB porque incluye los dos paquetes. Estas cifras son estimaciones a partir del tamano declarado, no datos de la model card.
- No esta pensado ni empaquetado para GPU NVIDIA o AMD: al ser un `.mlpackage` de Core ML no se ejecuta en CUDA ni en ROCm.
- No aplica el concepto de "cabe en GPU consumer" en el sentido habitual: el equivalente es si cabe en la memoria unificada de un Mac con Apple Silicon, lo que cubre practicamente cualquier equipo M1 o posterior.
- Opciones de despliegue: Core ML a traves de `coremltools` en Python, Xcode y las APIs nativas de macOS/iOS; tambien se puede invocar desde Swift. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan formatos de pesos distintos (GGUF, safetensors).
- Latencia: ~18,6 ms por embedding de 128 tokens en un M4 a 8 bits, frente a ~24,6 ms en fp16. No se publican cifras de throughput para la variante de 512 tokens ni para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / forma de entrada | Formato | Latencia (M4, b1_s128) | Fidelidad | Licencia |
|---|---|---|---|---|---|---|
| `erjigit17/qwen3-embedding-0.6b-ane-coreml-8bit` (este) | ~0,6B | 128 y 512 tokens fijos | Core ML `.mlpackage` 8 bits | ~18,6 ms | coseno 0,999 vs fp16 | Apache-2.0 |
| `neuradex/Qwen3-Embedding-0.6B-CoreML-ANE` | ~0,6B | 128 y 512 tokens fijos | Core ML `.mlpackage` fp16 | ~24,6 ms | referencia | Apache-2.0 |
| `Qwen/Qwen3-Embedding-0.6B` | ~0,6B | no disponible en la informacion proporcionada | safetensors (PyTorch) | no aplica (no Core ML) | referencia | Apache-2.0 |

No se dispone de datos de rendimiento en tareas de recuperacion o MTEB para ninguno de los tres, por lo que la comparacion se limita a formato, latencia medida y fidelidad de cuantizacion.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona, no hace tool calling ni actua como agente. Solo genera embeddings.
- Las formas de entrada son fijas (128 o 512 tokens); los textos mas largos requieren truncado o troceado previo por parte de la aplicacion.
- Por debajo de 8 bits el modelo se degrada gravemente: a 4 bits la similitud coseno cae a 0,50-0,60, lo que invalida la recuperacion semantica. El propio autor advierte de no bajar de 8 bits.
- Dependencia total del ecosistema Apple: requiere hardware con Neural Engine y macOS/iOS; no es desplegable en servidores Linux con GPU NVIDIA.
- El repositorio no reimplementa la conversion a Core ML ni documenta el prefijo de instruccion ni la tokenizacion; hay que consultar las model cards de `Qwen/Qwen3-Embedding-0.6B` y de neuradex para esos detalles.
- Rendimiento verificado unicamente en un Apple M4 y con la forma de 128 tokens; no hay mediciones en otros chips ni con la variante de 512 tokens.
- No se documentan composicion del dataset de entrenamiento, sesgos conocidos, tasas de alucinacion (no aplica a un modelo de embeddings) ni cobertura idiomatica, por lo que no es posible evaluar el sesgo de los vectores generados.
- Adopcion practica nula hasta la fecha de consulta: 0 descargas y 1 like, sin senales de mantenimiento continuado.
- Licencia Apache-2.0 sin restricciones adicionales por parte del paso de cuantizacion, lo que permite uso comercial, pero conviene verificar la licencia del modelo base ante redistribuciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/erjigit17/qwen3-embedding-0.6b-ane-coreml-8bit
- Modelo base del paquete Core ML (neuradex): https://huggingface.co/neuradex/Qwen3-Embedding-0.6B-CoreML-ANE
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- La busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente paginas de programacion de television en aleman), por lo que no hay papers, blogs ni demos adicionales que enlazar.
