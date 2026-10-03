# Accio-Lab/occamy-1.0-MLX-8bit

## Resumen

Occamy-1.0-MLX-8bit es la version cuantizada a 8 bits en formato MLX nativo del modelo Occamy-1.0, desarrollado por Accio-Lab. Se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: su model card declara explicitamente que deriva del checkpoint BF16 `Accio-Lab/occamy-1.0` mediante cuantizacion afina nativa de 8 bits con group size 64, aplicada directamente sobre los pesos BF16. El repositorio ocupa 36,83 GB (34,30 GiB) y contiene 34.660.608.768 parametros almacenados en safetensors.

El modelo base pertenece a la familia Qwen3.5 con arquitectura de mezcla de expertos (etiqueta `qwen3_5_moe`), es de proposito conversacional y solo procesa texto: la model card indica que vision y MTP no estan incluidos en este export. La licencia es Apache 2.0, heredada del modelo original, lo que permite uso comercial sin restricciones adicionales conocidas.

Su relevancia actual es acotada y conviene ser preciso: se trata de una release candidata cuyo artefacto MLX para Linux ha pasado comprobaciones de inferencia limitadas, pero cuya validacion en Metal (macOS) esta pendiente. No incluye benchmarks de calidad ni ranking de velocidad, por lo que debe evaluarse como una opcion de despliegue en Apple Silicon para quienes ya trabajan con la familia Occamy, no como un modelo con rendimiento verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Qwen3.5, segun la etiqueta `qwen3_5_moe`; detalles de capas, atencion y enrutado no disponibles |
| Parametros totales | 34.660.608.768 (34,66 mil millones), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afina nativa MLX de 8 bits, group size 64, aplicada directamente desde BF16; enrutador y puertas de expertos compartidos tambien en 8 bits. La familia incluye variantes de 3, 4, 6 y 8 bits |
| Idiomas soportados | no disponible. Los fixtures de validacion de estanqueidad cubren texto en ingles y chino, pero no constituyen una declaracion oficial de idiomas |
| Licencia | Apache 2.0, heredada de Occamy-1.0 |
| Formato de pesos | safetensors en layout MLX; 36.828.222.561 bytes (36,83 GB / 34,30 GiB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base en la documentacion proporcionada. La unica descripcion arquitectonica disponible proviene de las etiquetas del repositorio, que identifican la arquitectura como `qwen3_5_moe`, es decir, una mezcla de expertos de la familia Qwen3.5. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo que si esta documentado es el proceso de conversion de este export concreto. Un adaptador de layout sin perdida apila 30.720 tensores de expertos separados, en orden numerico de experto, en 120 grupos, y despues invoca el sanitizador oficial de Qwen3.5 una sola vez. La cuantizacion y la serializacion usan APIs nativas de MLX, y la recarga y la inferencia se hacen con `mlx-lm` estandar sin adaptador. Las herramientas declaradas son mlx 0.32.2, mlx-lm 0.31.3 y transformers 5.8.1. Las comprobaciones completas incluyeron recarga estricta con la libreria estandar, verificacion de que todo valor flotante almacenado es finito, dequantizacion afina nativa de cada fila cuantizada e identidad byte a byte de los ficheros de tokenizer y plantilla de chat. Los ocho fixtures codiciosos con cache (texto en ingles y chino, aritmetica, JSON y recuperacion multi-turno) pasaron 8 de 8, con logits finitos sobre el vocabulario completo en cada paso de decodificacion. No se evaluo codigo, herramientas, vision ni ningun benchmark de calidad completo.

## Capacidades

- Generacion de texto conversacional multi-turno: los fixtures de validacion incluyen recuperacion de informacion en conversaciones de varios turnos.
- Aritmetica basica y razonamiento numerico simple: verificado con fixtures de aritmetica en las comprobaciones de conversion.
- Generacion y manejo de JSON: cubierto por los fixtures de validacion.
- Multilinguismo parcial: los fixtures cubren texto en ingles y chino; no hay declaracion oficial de idiomas soportados.
- Modo de pensamiento (thinking): la plantilla de chat del modelo base expone el parametro `enable_thinking`, que en los ejemplos de la model card se desactiva explicitamente. Su comportamiento no ha sido evaluado por el autor del export.
- Soporte de tool calling / function calling: no evaluado y no confirmado; la model card advierte que las pruebas HTTP no establecen compatibilidad con tool calling ni con integracion de agentes.
- Capacidades de agente y razonamiento multi-paso: no evaluadas.
- Vision y audio: no incluidas. La model card indica explicitamente que la entrada es solo texto y que vision y la cabeza MTP quedan fuera de este export.

## Casos de uso

- Despliegue local en Apple Silicon para asistentes de texto: el modelo se carga con `mlx-lm` en memoria unificada y ofrece una API compatible con OpenAI mediante `mlx_lm.server`, lo que permite sustituir un endpoint remoto por inferencia local en un Mac con memoria suficiente.
- Prototipado de aplicaciones conversacionales en macOS: al no requerir GPU dedicada ni servicios en la nube, encaja en fases de desarrollo donde se necesita iterar sobre prompts y plantillas de chat sin coste por token.
- Procesamiento de texto en ingles y chino: los unicos idiomas verificados en las pruebas de estanqueidad son estos dos, por lo que resulta adecuado para tareas de generacion y resumen en esos idiomas dentro de un entorno controlado.
- Tareas estructuradas con salida JSON: la validacion cubre generacion de JSON, de modo que puede emplearse para extraccion de campos o formateo de respuestas en pipelines que consuman datos estructurados.
- Evaluacion comparativa de cuantizaciones: al existir variantes de 3, 4, 6 y 8 bits del mismo modelo base, este export sirve para medir el compromiso entre huella de memoria y fidelidad de salida en hardware Apple, siempre que el equipo realice su propia evaluacion.
- Recuperacion de contexto en conversaciones largas: los fixtures de recuerdo multi-turno indican que el modelo mantiene informacion entre turnos, lo que permite construir asistentes con historial de sesion.
- Base para ajuste fino o experimentacion sobre MoE cuantizado: el formato safetensors y el uso de `mlx-lm` estandar facilitan la integracion en flujos de trabajo ya existentes en el ecosistema MLX, aunque la cuantizacion limita el ajuste fino convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que estos exports no tienen un benchmark de calidad asociado ni un ranking de velocidad establecido.

Las unicas cifras de validacion publicadas son de estanqueidad y correctitud mecanica, no de calidad:

| Prueba | Resultado |
|---|---|
| Recarga estricta con mlx-lm estandar | superada |
| Valores flotantes almacenados finitos | superada |
| Dequantizacion afina nativa de cada fila cuantizada | superada |
| Identidad byte a byte de tokenizer y plantilla de chat | superada |
| Fixtures codiciosos con cache (ingles, chino, aritmetica, JSON, multi-turno) | 8 de 8 superados |
| Fixtures HTTP del servidor estandar | 2 superados |
| Benchmark de calidad completo | no evaluado |
| Codigo, herramientas, vision | no evaluados |

## Requisitos de hardware

- Peso de los ficheros: 36,83 GB (34,30 GiB). La model card advierte que el tamano de los ficheros no equivale al requisito de memoria unificada: hay que dejar margen para el sistema operativo, cache y buffers del runtime.
- Memoria unificada recomendada en Apple Silicon: por encima de 40 GB efectivos como minimo para cargar los pesos y el runtime; 64 GB o mas es lo sensato para trabajar con comodidad y contexto moderado. Cabe en equipos Mac con 64 GB o 96 GB de memoria unificada.
- GPU dedicadas: el autor no publica requisitos para GPU NVIDIA. La validacion en Linux se ejecuto con MLX CUDA 12 sobre una unica NVIDIA B200, y la conversion uso kernels nativos de CPU en Linux. No hay datos de consumo de VRAM ni de rendimiento en esa configuracion.
- GPU de consumo: no hay evidencia publicada de que este artefacto MLX funcione en GPU de consumo. Para GPUs de consumo con 24 GB o menos, el propio modelo no cabe a 8 bits y habria que recurrir a las variantes MLX de 3 o 4 bits, o al checkpoint GGUF mediante llama.cpp.
- Estado de la validacion en Mac: la model card califica la release como candidata y afirma que la aceptacion en Metal esta pendiente. La inferencia y el rendimiento en Mac no estan verificados por el autor.
- Opciones de despliegue: `mlx-lm` en Python y `mlx_lm.server` como API compatible con OpenAI. El servidor estandar paso dos comprobaciones HTTP en Linux, lo que no acredita compatibilidad en macOS, con tool calling ni con agentes.
- Integracion en clientes: se puede usar `http://127.0.0.1:8000/v1` como base URL en cualquier cliente compatible con OpenAI.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de velocidad para este export.

## Comparativa con modelos similares

La informacion disponible no incluye modelos de terceros comparables con parametros, contexto o resultados de rendimiento. La comparacion mas cercana posible es con los propios checkpoints de la familia Occamy-1.0, que comparten modelo base y licencia:

| Checkpoint | Cuantizacion | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| occamy-1.0-MLX-8bit | MLX afina 8 bits, group size 64 | 34,66 mil millones | no disponible | Apache 2.0 | no disponible |
| occamy-1.0-MLX-6bit | MLX 6 bits | no disponible | no disponible | Apache 2.0 | no disponible |
| occamy-1.0-MLX-4bit | MLX 4 bits | no disponible | no disponible | Apache 2.0 | no disponible |
| occamy-1.0-MLX-3bit | MLX 3 bits | no disponible | no disponible | Apache 2.0 | no disponible |
| occamy-1.0 (BF16) | sin cuantizar | no disponible | no disponible | Apache 2.0 | no disponible |
| occamy-1.0-GGUF | GGUF, bits no disponibles | no disponible | no disponible | Apache 2.0 | no disponible |
| occamy-1.0-FP8 | FP8 | no disponible | no disponible | Apache 2.0 | no disponible |
| occamy-1.0-NVFP4 | NVFP4 | no disponible | no disponible | Apache 2.0 | no disponible |

El propio autor indica que los tamanos de fichero de las distintas cuantizaciones pueden compararse en el explorador de checkpoints, pero no se aportan cifras en esta documentacion salvo para el export de 8 bits.

## Limitaciones y advertencias

- Release candidata: la model card declara que la aceptacion en Metal esta pendiente. La inferencia y el rendimiento en Mac no estan verificados, por lo que no debe considerarse un artefacto listo para produccion en Apple Silicon sin una validacion propia.
- Sin benchmark de calidad: no existe una evaluacion publicada de MMLU, HumanEval, GSM8K ni de ninguna otra metrica de calidad para este export. Las 8 comprobaciones superadas son fixtures de correctitud mecanica, no una medida de capacidad.
- Sin benchmark de velocidad frente a otras cuantizaciones: el autor afirma explicitamente que no hay un ranking de velocidad establecido.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se ha publicado ninguna evaluacion de fidelidad factual, por lo que el riesgo no esta cuantificado.
- Tool calling y agentes no confirmados: la model card advierte que las comprobaciones HTTP no establecen compatibilidad con tool calling ni con integracion de agentes. Cualquier pipeline que dependa de estas funciones requiere validacion previa.
- Idiomas no declarados: el campo de idiomas esta vacio en la ficha del repositorio. Solo hay evidencia empirica sobre ingles y chino en fixtures internos; el comportamiento en castellano u otros idiomas no esta verificado.
- Contexto desconocido: no se publica la longitud de contexto soportada, lo que impide dimensionar despliegues que dependan de ventanas largas.
- Entrada solo texto: vision y la cabeza MTP quedan fuera de este export. Si se necesita decodificacion especulativa mediante MTP, hay un checkpoint independiente de cabeza MTP en la familia.
- Exito de despliegue limitado por el entorno: la validacion en Linux requirio resolver un conflicto de versiones de cabeceras instalando cabeceras del runtime CUDA 12 en un entorno aislado, lo que anticipa posibles fricciones de instalacion. Cualquier cambio respecto a las versiones fijadas (mlx 0.32.2, mlx-lm 0.31.3, transformers 5.8.1) invalida las comprobaciones realizadas.
- Licencia: Apache 2.0 heredada de Occamy-1.0, sin restricciones adicionales conocidas para uso comercial. Conviene revisar el fichero LICENSE del modelo base para confirmar el texto exacto.
- Madurez del repositorio: cero descargas y cero likes en la fecha de consulta, un dia despues de su creacion. Es un artefacto reciente sin adopcion registrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit
- Modelo base BF16: https://huggingface.co/Accio-Lab/occamy-1.0
- Articulo: https://arxiv.org/abs/2609.11977
- Pagina del proyecto: https://accio-lab.github.io/occamy/
- Coleccion Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Coleccion MLX de Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-mlx-6ac0072a7c1cdbc5e418e90b
- Explorador de checkpoints: https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Variante MLX 3 bits: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit
- Variante MLX 4 bits: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Variante MLX 6 bits: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit
- Variante GGUF: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Variante FP8: https://huggingface.co/Accio-Lab/occamy-1.0-FP8
- Variante NVFP4: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Cabeza MTP: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Licencia del modelo base: https://huggingface.co/Accio-Lab/occamy-1.0/blob/main/LICENSE
- Resumen de validacion: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit/blob/main/validation_summary.json
- Comprobaciones completas y salidas: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit/blob/main/validation.json
- Comprobaciones HTTP: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit/blob/main/api_validation.json
- Recibo de conversion: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit/blob/main/conversion.json
- Hashes de pesos: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit/blob/main/SHA256SUMS
- Adaptador de layout: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit/blob/main/layout_adapter.py
