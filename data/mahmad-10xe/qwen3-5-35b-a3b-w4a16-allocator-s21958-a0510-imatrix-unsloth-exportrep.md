# mahmad-10xe/Qwen3.5-35B-A3B-w4a16-allocator-s21958-a0510-imatrix-unsloth-exportrep

## Resumen

Este repositorio es un artefacto de cuantizacion publicado por el usuario `mahmad-10xe` el 24 de septiembre de 2026, derivado de un supuesto modelo Qwen3.5-35B-A3B. No se trata de un modelo entrenado desde cero, sino de una version cuantizada de pesos preexistentes: el identificador indica esquema W4A16 (pesos de 4 bits, activaciones de 16 bits), calibracion mediante importance matrix (`imatrix`) y exportacion con herramientas de Unsloth (`unsloth-exportrep`). La etiqueta de arquitectura declarada en HuggingFace es `qwen3_5_moe`, es decir, un transformer con mezcla de expertos (MoE).

El dato objetivo mas relevante es el recuento de parametros de los safetensors: 70.875.659.632 parametros (~70,9 mil millones), con un tamano de repositorio de 109,3 GB. Existe una discrepancia notable entre ese recuento y el nombre del repositorio, que sugiere 35B totales y 3B activos; esta contradiccion no se resuelve con la informacion disponible y debe tenerse en cuenta antes de cualquier despliegue. El modelo acumula 6 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y no incluye model card.

Su relevancia practica es limitada y muy condicionada: se trata de un artefacto sin validacion comunitaria, sin licencia explicita y con metadatos incompletos, lo que lo convierte en un caso de estudio sobre trazabilidad de modelos cuantizados mas que en una opcion recomendable para produccion. Cualquier evaluacion seria exige verificar primero el modelo base del que procede.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `qwen3_5_moe`); transformer con mezcla de expertos segun el tag, sin detalle de configuracion publicado |
| Parametros totales | 70.875.659.632 (~70,9 mil millones) segun safetensors; el nombre del repositorio indica "35B-A3B" |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits) con calibracion imatrix |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el entrenamiento del modelo base: se desconoce el numero de tokens, la composicion del dataset, si hubo fases de RLHF, DPO u optimizacion con preferencias, y la configuracion exacta de la mezcla de expertos (numero de expertos, expertos activos por token, mecanismo de routing). El tag `qwen3_5_moe` apunta a una arquitectura de transformer con capas MoE, coherente con la nomenclatura "A3B" del nombre del repositorio, que en la convencion habitual designa modelos con pocos parametros activos por token.

Lo unico verificable es el proceso de cuantizacion posterior al entrenamiento (PTQ). El esquema W4A16 reduce los pesos a 4 bits manteniendo activaciones en 16 bits, lo que disminuye el uso de memoria sin reentrenar el modelo. La calibracion `imatrix` implica que los rangos de cuantizacion se ajustaron con una matriz de importancia calculada sobre un corpus de calibracion, una tecnica habitual para preservar mejor las capas mas sensibles. Los sufijos `allocator-s21958-a0510` y `exportrep` no estan documentados en la informacion disponible y probablemente corresponden a parametros internos del pipeline de cuantizacion. No se declaran innovaciones tecnicas adicionales como atencion lineal, decodificacion especulativa o capas SSM.

## Capacidades

- Generacion de texto: es la capacidad esperable de un modelo de lenguaje de esta familia, aunque no hay evaluacion publicada que la confirme en este artefacto concreto.
- Razonamiento y matematicas: no disponible (sin benchmarks ni model card).
- Generacion de codigo: no disponible (sin benchmarks ni model card).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad con MoE: la arquitectura declarada implica activacion dispersa de expertos, lo que condiciona los motores de inferencia que pueden explotarla eficientemente.

## Casos de uso

Los siguientes escenarios son plausibles para un modelo de lenguaje cuantizado en W4A16, pero ninguno esta validado por el autor del repositorio. Se plantean como hipotesis de uso sujetas a verificacion previa.

- Evaluacion comparativa de cuantizacion: el artefacto permite medir la degradacion de calidad frente a los pesos originales en tareas de generacion y comprension, usando el mismo prompt set y comparando perplejidad y exactitud.
- Inferencia autoalojada en hardware con memoria limitada: el formato W4A16 reduce la huella de pesos a aproximadamente la mitad respecto a FP16, lo que permite servir el modelo en GPUs de 80 GB o en configuraciones multi-GPU de consumo.
- Generacion por lotes offline: procesamiento de grandes volumenes de texto (resumen, extraccion, clasificacion) sin requisitos de baja latencia, donde el throughput agregado importa mas que el tiempo por token.
- Experimentacion academica con arquitecturas MoE: analisis del comportamiento de routing y activacion de expertos bajo cuantizacion agresiva.
- Base para cuantizaciones adicionales: punto de partida para generar versiones GGUF o de menor precision destinadas a `llama.cpp` u Ollama, siempre que se resuelvan las dudas de licencia.
- Prototipado interno de asistentes conversacionales: despliegue en un entorno controlado para validar flujos de dialogo antes de comprometerse con un modelo con licencia clara.
- Auditoria de cadena de suministro de modelos: caso practico para probar herramientas de trazabilidad de artefactos (procedencia, hashes, licencias) en un repositorio con metadatos incompletos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card, tabla de evaluacion ni comparaciones con el modelo de referencia. Tampoco hay datos de perplejidad, MMLU, HumanEval, GSM8K ni metricas de latencia o throughput.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros y del esquema de cuantizacion, no datos medidos por el autor.

- VRAM para inferencia (escenario 70,9B en W4A16): aproximadamente 36-42 GB solo para pesos (70,9B x ~0,5 bytes), mas cache KV y overhead del runtime; en la practica, 48-80 GB totales segun longitud de contexto y tamano de lote.
- VRAM para inferencia (escenario 35B en W4A16, segun el nombre del repositorio): aproximadamente 18-22 GB para pesos, lo que situaria el modelo en el rango de una RTX 4090 o RTX 5090 de 24 GB con contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para el escenario de 70,9B en una sola tarjeta; 2 x RTX 4090/5090 (48 GB agregados) como alternativa de consumo para el escenario de 70,9B; una unica RTX 4090/5090 para el escenario de 35B.
- GPU de consumo: el modelo no cabe en tarjetas de 8-16 GB en W4A16 con el recuento real de parametros; en el escenario de 35B si seria viable en 24 GB con cuantizacion y contexto reducido.
- Almacenamiento: el repositorio ocupa 109,3 GB, muy por encima de lo esperado para una cuantizacion W4A16 de 70,9B (que rondaria los 36 GB), lo que sugiere la presencia de multiples variantes, ficheros duplicados o pesos sin cuantizar. Conviene inspeccionar el arbol de ficheros antes de descargar.
- Opciones de despliegue: vLLM o SGLang si el formato W4A16 es compatible con el esquema de compresion soportado (habitualmente `compressed-tensors`); TGI y `transformers` como alternativas. `llama.cpp`, Ollama y LM Studio requieren pesos GGUF, que no constan en los tags del repositorio.
- Latencia y throughput: no disponibles. Dependeran del numero real de parametros activos por token, del backend y del paralelismo utilizado.

## Comparativa con modelos similares

No hay datos verificados del modelo base ni de sus alternativas dentro de la informacion proporcionada. La tabla siguiente recoge los campos que pueden compararse; los valores de los modelos de referencia proceden de documentacion publica general, no del repositorio analizado, y deben verificarse antes de usarse.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.5-35B-A3B W4A16) | 70.875.659.632 segun safetensors; "35B" segun nombre | no disponible | no disponible | no disponible | HuggingFace, 6 descargas |
| Qwen3-30B-A3B (referencia publica) | ~30,5B | ~3,3B | 128K (segun documentacion publica) | Apache 2.0 | HuggingFace y espejos oficiales |
| Qwen3-32B denso (referencia publica) | ~32,8B | no aplica | 128K (segun documentacion publica) | Apache 2.0 | HuggingFace y espejos oficiales |
| Alternativa MoE de 70B cuantizada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones de rendimiento entre este artefacto y los modelos de referencia.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial, redistribucion ni modificacion. Es un bloqueo potencial para cualquier despliegue en produccion.
- Procedencia dudosa: la denominacion "Qwen3.5" no corresponde a un lanzamiento oficial verificable en la informacion disponible, por lo que el modelo base real es incierto.
- Discrepancia de parametros: el nombre indica 35B-A3B pero los safetensors suman 70,9B, una diferencia del doble que sugiere ficheros de varias variantes, pesos sin cuantizar o un etiquetado incorrecto.
- Sin model card: no hay descripcion de datos de entrenamiento, idiomas, contexto soportado ni uso previsto.
- Sin validacion comunitaria: 6 descargas y 0 likes implican ausencia de pruebas independientes de calidad o estabilidad.
- Degradacion por cuantizacion: el esquema W4A16 introduce perdida de precision respecto a los pesos originales, con impacto variable segun la tarea; no se han publicado mediciones de esa perdida.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; sin evaluaciones publicadas no puede acotarse su magnitud en este artefacto.
- Sesgos: no documentados; un modelo sin model card no ofrece garantias sobre sesgos de genero, raza, idioma o ideologia.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados, por lo que el rendimiento en castellano es una incognita.
- Riesgo de seguridad: los pesos safetensors pueden requerir ejecucion de codigo de carga; conviene auditar los ficheros y usar entornos aislados.
- Idoneidad para produccion: baja en su estado actual, dado el conjunto de incertidumbres anteriores.

## Enlaces

- HuggingFace: https://huggingface.co/mahmad-10xe/Qwen3.5-35B-A3B-w4a16-allocator-s21958-a0510-imatrix-unsloth-exportrep
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la informacion disponible.
