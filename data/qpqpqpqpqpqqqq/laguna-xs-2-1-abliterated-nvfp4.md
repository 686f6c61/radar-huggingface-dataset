# qpqpqpqpqpqqqq/Laguna-XS-2.1-Abliterated-NVFP4

## Resumen

Laguna-XS-2.1-Abliterated-NVFP4 es una version modificada y cuantizada del modelo base poolside/Laguna-XS-2.1, publicada por el usuario qpqpqpqpqpqqqq. Sobre el checkpoint original en BF16 se aplicaron dos transformaciones: primero una ablacion direccional de la direccion de rechazo (abliteration) optimizada con Optuna mediante la herramienta abliterix, y despues una cuantizacion a NVFP4 con TensorRT-Model-Optimizer de NVIDIA. El resultado es un modelo sin alineamiento de seguridad, orientado a usos donde se busca minimizar los rechazos, y optimizado para inferencia de bajo coste en hardware Blackwell.

El modelo tiene 17.739.142.912 parametros totales (unos 17,74 mil millones) y esta etiquetado como MoE, por lo que solo una parte de esos parametros se activa por token, aunque el numero de parametros activos no se especifica en la informacion disponible. La cuantizacion emplea el esquema `nvfp4_experts_only`, que aplica 4 bits solo a los pesos de los expertos de la capa MoE, y cache KV en FP8. El repositorio ocupa 21,8 GB.

Es relevante ahora porque combina tres tendencias concretas: modelos MoE dispersos, cuantizacion de 4 bits especifica para Blackwell y distribucion de variantes sin censura. Ademas, el autor publica mediciones de throughput reales sobre una DGX Spark (GB10), lo que da una referencia practica poco habitual para un checkpoint de este tipo. El modelo requiere `trust_remote_code=True` porque el modelo base incluye codigo de modelado propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con codigo de modelado propio (`modeling_laguna.py`, `configuration_laguna.py`); detalles de capas, atencion y enrutado no disponibles |
| Parametros totales | 17.739.142.912 (aproximadamente 17,74 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 con esquema `nvfp4_experts_only` (solo pesos de expertos MoE) + cache KV en FP8; el repositorio esta ademas etiquetado como "8-bit", etiqueta que no se corresponde con el esquema NVFP4 (4 bits) descrito en la model card |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors, con codigo remoto personalizado incluido; no se distribuye en GGUF |
| Tamano del repositorio | 21,8 GB |
| Modelo base | poolside/Laguna-XS-2.1 (BF16) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-28 |

## Arquitectura y entrenamiento

No se describe la arquitectura interna mas alla de la etiqueta MoE y de que el modelo base, Laguna-XS-2.1 de Poolside, incluye codigo de modelado personalizado que debe cargarse con `trust_remote_code=True`. Se desconoce el numero de expertos, el numero de expertos activos por token, el mecanismo de atencion, el tamano de la ventana de contexto y los detalles del enrutado. Tampoco hay informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens procesados ni si hubo fases de RLHF o DPO.

Lo que si esta documentado es el post-entrenamiento aplicado por el autor de esta variante. Primero se elimino la direccion de rechazo mediante abliteracion direccional optimizada con Optuna, usando la libreria abliterix; segun la model card, la tasa de rechazo paso de 98/100 a 4/100 sobre un conjunto de evaluacion no especificado. Despues se cuantizo el modelo a NVFP4 con TensorRT-Model-Optimizer de NVIDIA, aplicando 4 bits unicamente a los pesos de los expertos y FP8 a la cache KV, replicando el esquema que usa la publicacion NVFP4 del propio Poolside. Ambos pasos se ejecutaron en una H100 alquilada.

La innovacion tecnica destacable no esta en la arquitectura, sino en el pipeline de cuantizacion y en el soporte de decodificacion especulativa con DFlash en vLLM.

## Capacidades

- Generacion de texto y codigo: la model card incluye cifras de throughput separadas para cargas de codigo y de prosa, lo que indica uso previsto en generacion de codigo y redaccion.
- Modo thinking y modo no-thinking: el modelo soporta ambos modos, con rendimiento de decodificacion distinto en cada caso.
- Razonamiento multi-paso: el decodificador especulativo DFlash se evaluo especificamente con el modo thinking activado.
- Ejecucion en vLLM: soporta despliegue en vLLM 0.30 o superior con el backend `--moe-backend humming`.
- Cuantizacion agresiva: los pesos de los expertos en NVFP4 reducen el coste de memoria respecto al checkpoint BF16 original.
- Sin alineamiento de seguridad: la abliteracion elimina la direccion de rechazo, de modo que el modelo responde a peticiones que el modelo base rechazaria.
- Tool calling, function calling, capacidades de agente, vision, audio y soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo asistida de alta velocidad: con `--moe-backend humming` y decodificacion especulativa DFlash (`num_speculative_tokens=15`) el modelo alcanza entre 147,7 y 177,5 tok/s en cargas de codigo con temperatura 0, lo que lo hace adecuado para autocompletado y generacion de fragmentos en editores o pipelines de CI/CD.
- Relleno y documentacion de repositorios: la misma carga de codigo rinde 153,1 tok/s en modo no-thinking, util para tareas de generacion masiva de docstrings, comentarios y descripciones de funciones sin necesidad de razonamiento extendido.
- Investigacion sobre abliteration y alineamiento: es un artefacto de estudio para medir como la ablacion direccional afecta a la utilidad del modelo, comparando rendimiento y comportamiento frente al checkpoint base poolside/Laguna-XS-2.1.
- Evaluacion de cuantizacion NVFP4: sirve como caso de prueba para comparar el esquema `nvfp4_experts_only` frente a BF16 en terminos de calidad de salida y throughput, en hardware Blackwell.
- Redaccion y generacion de prosa en modo thinking: el modelo mantiene 51,6 a 54,5 tok/s sobre cargas de prosa, con una longitud de aceptacion del borrador mucho menor (2,38 a 2,49), lo que resulta adecuado para tareas de redaccion larga donde prima la calidad sobre la velocidad.
- Despliegue en hardware de borde de gama alta: con 21,8 GB de pesos y cuantizacion de 4 bits en expertos, es candidato a ejecutarse en equipos con acelerador unico tipo DGX Spark, donde el autor tomo las mediciones.
- Experimentacion con generacion de contenido sin restricciones de rechazo: para casos donde el filtrado del modelo base resulta un obstaculo (por ejemplo, red teaming o analisis de contenido sensible), siempre que se cumplan las leyes locales y la licencia OpenMDW-1.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son la tasa de rechazo tras la abliteration y el throughput medido sobre este checkpoint exacto en una DGX Spark (GB10, SM121) con vLLM 0.30, sin carga concurrente, backend `--moe-backend humming` y decodificacion especulativa DFlash con `num_speculative_tokens=15`.

| Metrica | Valor |
|---|---|
| Rechazos antes de la abliteration | 98/100 |
| Rechazos despues de la abliteration | 4/100 |
| Throughput, codigo, temperatura 0, thinking | 147,7 a 177,5 tok/s (media 162,6) |
| Longitud de aceptacion del borrador, codigo, thinking | 6,59 a 7,98 |
| Throughput, codigo, no-thinking | 153,1 tok/s |
| Longitud de aceptacion del borrador, codigo, no-thinking | 6,92 |
| Throughput, prosa, thinking | 51,6 a 54,5 tok/s (media 53,0) |
| Longitud de aceptacion del borrador, prosa, thinking | 2,38 a 2,49 |

Nota: el conjunto de evaluacion usado para medir la tasa de rechazo no se especifica en la model card, por lo que el dato 98/100 frente a 4/100 no es reproducible sin esa informacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 21,8 GB, por lo que se necesita ese espacio solo para los pesos. Con cache KV en FP8 y overhead de runtime, un presupuesto realista se situa en torno a 24-32 GB, aunque esta cifra es una estimacion derivada del tamano del repositorio, no una medicion publicada por el autor.
- GPU recomendadas: el autor midio el modelo en una DGX Spark (GB10, SM121), hardware Blackwell con soporte nativo de NVFP4. Para un rendimiento equivalente en servidor se necesitan GPU Blackwell; en GPU sin soporte NVFP4 el modelo puede requerir emulacion o conversion, lo que degrada el rendimiento y no esta documentado.
- GPU de consumo: con 21,8 GB de pesos, encaja ajustadamente en GPU con 24 GB (RTX 4090, RTX 5090) solo si el runtime y la cache KV caben en el margen restante; en la practica es mas seguro un acelerador con 32 GB o mas.
- Opciones de despliegue: vLLM 0.30 o superior con `--trust-remote-code --moe-backend humming`; tambien se documenta carga con `transformers` mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. No hay soporte documentado para llama.cpp, Ollama o TGI, y al no haber pesos GGUF no es esperable su uso en esos runners.
- Decodificacion especulativa: se combina con poolside/Laguna-XS-2.1-DFlash-NVFP4 como modelo borrador, que no viene incluido en este repositorio y debe descargarse aparte.
- Latencia y throughput: en DGX Spark (GB10) con DFlash se midieron 162,6 tok/s de media en codigo con thinking y 53,0 tok/s de media en prosa con thinking. Son cifras de un solo acelerador y sin carga concurrente.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qpqpqpqpqpqqqq/Laguna-XS-2.1-Abliterated-NVFP4 | 17,74 mil millones | NVFP4 (expertos) + KV FP8 | no disponible | openmdw-1.1 | Publico en HuggingFace, 0 descargas |
| poolside/Laguna-XS-2.1 | no disponible | BF16 | no disponible | no disponible | Publico en HuggingFace, referenciado como modelo base |
| poolside/Laguna-XS-2.1-DFlash-NVFP4 | no disponible | NVFP4 | no disponible | no disponible | Publico en HuggingFace; se usa como modelo borrador para decodificacion especulativa |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada. La diferencia funcional principal frente al modelo base es la ausencia de alineamiento de seguridad y la cuantizacion a 4 bits de los expertos, con una perdida de calidad asociada que no ha sido cuantificada por el autor.

## Limitaciones y advertencias

- Ausencia total de alineamiento de seguridad: la abliteration elimina la direccion de rechazo, por lo que el modelo respondera a peticiones que el modelo base rechazaria. Es responsabilidad del desplegador cumplir la legislacion local.
- Riesgo de alucinacion: no se ha evaluado ni documentado el comportamiento del modelo en terminos de veracidad, ni antes ni despues de la abliteration.
- Perdida de calidad por cuantizacion: la cuantizacion NVFP4 de los expertos puede degradar la calidad de salida respecto al BF16 original; el autor no publica ninguna evaluacion de calidad comparativa.
- Etiqueta de cuantizacion contradictoria: el repositorio esta etiquetado como "8-bit" mientras que la model card describe un esquema NVFP4 de 4 bits; conviene verificar el formato real de los pesos antes de integrarlos.
- Dependencia de codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio. Es un riesgo de seguridad en entornos de produccion y debe auditarse antes de su uso.
- Idiomas soportados no documentados: se desconoce la cobertura multilingue y el rendimiento en castellano.
- Longitud de contexto no documentada: sin este dato no se puede planificar su uso en conversaciones multi-turno largas ni en tareas de contexto extenso.
- Repositorio con 0 descargas y 0 likes: no hay validacion por parte de la comunidad, lo que reduce la confianza en la reproducibilidad de los resultados publicados.
- Rendimiento dependiente de hardware Blackwell: las cifras de throughput se obtuvieron en una DGX Spark con NVFP4 nativo; en otra GPU no se garantiza un rendimiento comparable.
- Compatibilidad de despliegue limitada: solo hay soporte documentado para vLLM 0.30+ y `transformers`; otros runners habituales no estan cubiertos.
- Restricciones de licencia: la licencia openmdw-1.1 del modelo base sigue aplicandose; hay que revisar sus terminos antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qpqpqpqpqpqqqq/Laguna-XS-2.1-Abliterated-NVFP4
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Modelo borrador para decodificacion especulativa DFlash: https://huggingface.co/poolside/Laguna-XS-2.1-DFlash-NVFP4
- Libreria de abliteration abliterix: https://pypi.org/project/abliterix/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
