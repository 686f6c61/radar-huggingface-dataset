# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ5e-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ5e-mtp es una cuantizacion de precision mixta del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario scottlowry. El checkpoint empaqueta 180.000 millones de parametros logicos en 129,5 GB de almacenamiento mediante la herramienta oQ (oMLX v0.7.4.dev1), que aplica distintos formatos de cuantizacion segun la sensibilidad de cada tensor. El resultado es un peso efectivo medio de 5,755 bits por parametro sobre el checkpoint completo, o 5,657 bits excluyendo la tabla de embeddings N-gram.

El modelo esta pensado para ejecutarse con MLX, el framework de Apple para silicio unificado, y no con GPUs NVIDIA. Esta orientado a inferencia local en equipos Mac con memoria unificada amplia, no a despliegues en servidores convencionales. Incorpora una cabeza MTP (multi-token prediction), lo que sugiere decodificacion especulativa o prediccion de varios tokens por paso, y un modulo de vision de 0,449B de parametros.

La relevancia actual del checkpoint es doble: por un lado, demuestra que es viable comprimir un modelo de 180B a poco mas de 120 GiB manteniendo una parte mayoritaria de pesos en 5 bits; por otro, la tabla de embeddings N-gram de 51,2B de parametros, que ocupa el 28,4% de los pesos logicos, apunta a una arquitectura poco convencional que conviene conocer antes de desplegarla. La model card no documenta licencia, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformador con cabeza MTP y embeddings N-gram; inferido de los componentes del checkpoint) |
| Parametros totales | 180.000.000.000 (180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ precision mixta: affine 5-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, BF16 e I64; N-gram affine 5-bit grupo 32; media efectiva 5,755 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 125,744B | 88,358 GB / 82,290 GiB |
| Embeddings N-gram | 51,200B | 38,400 GB / 35,763 GiB |
| Vision | 0,449B | 0,898 GB / 0,836 GiB |
| Cabeza MTP | 2,607B | 1,827 GB / 1,702 GiB |
| Total | 180,000B | 129,484 GB / 120,591 GiB |

Distribucion de bits por tensor:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 5-bit, grupo 64 | 123,313B | 68,507% | 78,955 GiB | 5,50 |
| Affine 8-bit, grupo 128 | 0,241B | 0,134% | 0,231 GiB | 8,25 |
| Affine 8-bit, grupo 64 | 4,731B | 2,628% | 4,681 GiB | 8,50 |
| BF16 | 0,516B | 0,287% | 0,961 GiB | 16,00 |
| I64 | 0,000B | 0,000% | 0,000 GiB | 64,00 |
| N-gram affine 5-bit, grupo 32 | 51,200B | 28,445% | 35,763 GiB | 6,00 |
| Total | 180,000B | 100% | 120,591 GiB | 5,755 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El checkpoint permite inferir una estructura compuesta por cuatro bloques: un modelo de lenguaje de 125,744B de parametros, una tabla de embeddings N-gram de 51,200B, un modulo de vision de 0,449B y una cabeza MTP de 2,607B. La presencia de embeddings N-gram de gran tamano sugiere tecnicas de memoria o recuperacion asociativa dentro del propio modelo, aunque el autor no lo documenta. La cabeza MTP indica entrenamiento con prediccion de multiples tokens, habitual en esquemas de decodificacion especulativa.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones de atencion. La unica informacion tecnica concreta es el proceso de cuantizacion: oMLX v0.7.4.dev1 aplica 5 bits con grupo 64 a la mayor parte de los pesos (68,5%), reserva 8 bits para tensores sensibles (2,76% combinado) y mantiene 0,516B en BF16 (0,287%). La tabla N-gram se cuantiza a 5 bits con grupo 32, mas fino, y su ratio efectivo sube a 6,00 bits/peso por el coste de las escalas. El autor re-cuantizo el modelo el 2026-11-11 y recomienda volver a descargarlo si se tenia una copia anterior.

## Capacidades

- Generacion de texto y razonamiento: el bloque de lenguaje de 125,7B de parametros sostiene las capacidades generativas del modelo base.
- Vision: incluye un modulo visual de 0,449B de parametros, por lo que se le presupone procesamiento de imagenes, aunque no se documentan tareas concretas.
- Prediccion multi-token: la cabeza MTP de 2,607B permite generar varios tokens por paso, lo que puede acelerar la decodificacion.
- Recuperacion mediante N-gram: la tabla de 51,2B de parametros apunta a un mecanismo de memoria asociativa o n-gramas integrado en el modelo.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Inferencia local en Mac de gama alta: el checkpoint esta empaquetado para MLX y ocupa 120,591 GiB, por lo que encaja en equipos con memoria unificada de 128 GB o superior, como un Mac Studio o un MacBook Pro con M4 Max de 128 GB. Permite ejecutar un modelo de 180B sin GPU dedicada.
- Prototipado de modelos de gran escala en estacion de trabajo: investigadores con hardware Apple pueden experimentar con un modelo de 180B cuantizado a 5,755 bits medios sin montar infraestructura de servidor.
- Evaluacion de tecnicas de cuantizacion mixta: el checkpoint sirve como referencia practica de oQ/oMLX y permite medir la perdida de calidad de 5 bits frente al modelo base en BF16.
- Experimentacion con prediccion multi-token: la cabeza MTP permite probar esquemas de decodificacion especulativa y medir el ahorro de latencia en MLX.
- Tareas multimodales en local: el modulo de vision hace viable procesar imagenes junto con texto en un entorno sin conexion, util para prototipos de analisis documental o descripcion de imagenes.
- Investigacion sobre embeddings N-gram: la tabla de 51,2B de parametros permite estudiar el comportamiento de mecanismos de memoria asociativa a gran escala y su impacto en la perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 120,591 GiB solo para los pesos. Hay que sumar la memoria del contexto KV y los buffers de inferencia, por lo que se recomienda un minimo de 128 GB de memoria unificada y, con contexto largo, 192 GB o mas.
- GPU recomendadas: no aplica en el sentido habitual; el checkpoint esta en formato MLX y requiere silicio Apple. En Mac, se recomienda un chip M2 Ultra, M3 Ultra o M4 Max con 128 GB o mas de memoria unificada.
- Viabilidad en GPU de consumo: no. Ninguna GPU consumer (RTX 4090 con 24 GB, RTX 5090 con 32 GB) puede alojar 120 GiB de pesos. Tampoco cabe en una A100 de 80 GB ni en una H100 de 80 GB sin particionado y offload, que el formato MLX no contempla de forma nativa.
- Opciones de despliegue: MLX (libreria nativa del checkpoint) y oMLX para la gestion de la cuantizacion. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato safetensors-MLX no es directamente portable a estos motores.
- Latencia y throughput: no disponibles. La cabeza MTP sugiere optimizacion de decodificacion, pero no hay cifras publicadas.

## Comparativa con modelos similares

No hay informacion suficiente para comparar con alternativas concretas: se desconoce la licencia, el contexto y los benchmarks del modelo base. Como referencia estructural, se compara con el checkpoint original sin cuantizar:

| Modelo | Parametros | Formato | Tamano en disco | Bits/peso | Licencia |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-oQ5e-mtp | 180B | safetensors MLX | 129,5 GB | 5,755 | no disponible |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | 180B | no disponible | no disponible | BF16 (presumible) | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Hay que consultar la licencia del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next antes de cualquier despliegue en produccion.
- Dependencia de MLX: el checkpoint solo es utilizable en el ecosistema Apple. No es portable a CUDA, ROCm ni a motores de inferencia convencionales.
- Requisito de memoria elevado: 120,591 GiB de pesos excluyen cualquier GPU consumer y la mayoria de servidores con GPUs de 80 GB.
- Cuantizacion agresiva: el 68,5% de los pesos esta a 5 bits con grupo 64, lo que puede degradar tareas sensibles a precision numerica (matematicas, codigo, razonamiento largo) respecto al modelo en BF16.
- Cabeza MTP y embeddings N-gram sin documentar: no hay informacion sobre como activar, desactivar o validar estos componentes, ni sobre su impacto real en calidad o latencia.
- Sesgos y alucinacion: no documentados. Al derivar de un modelo base sin model card detallada, se desconocen los sesgos del dataset de entrenamiento y la tasa de alucinacion.
- Idiomas: no declarados. No se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del presumible ingles.
- Versionado: el autor re-cuantizo el modelo el 2026-11-11; las copias anteriores pueden diferir en calidad. Conviene verificar el hash del checkpoint descargado.
- Adopcion muy baja: 194 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ5e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
