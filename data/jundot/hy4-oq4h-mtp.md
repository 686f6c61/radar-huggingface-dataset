# Jundot/Hy4-oQ4h-mtp

## Resumen

Hy4-oQ4h-mtp es una cuantizacion mixta en formato MLX del modelo tencent/Hy4, el modelo insignia del equipo Tencent Hy. Se trata de un modelo de mezcla de expertos (MoE) con 770B parametros totales y 49B activos por token, que combina un backbone de lenguaje, un codificador de vision y un drafter DFly2 integrado. Esta version concreta la publica el usuario Jundot dentro del ecosistema oMLX y esta pensada para ejecutarse en hardware Apple Silicon mediante la libreria MLX.

El checkpoint emplea la cuantizacion mixta oQh, que rota los pesos de los expertos con una transformada de Hadamard antes de cuantizarlos y reinvierte el espacio ahorrado en escalas de grupo en codigos de 5 bits para las proyecciones down de los expertos enrutados. El resultado es un peso efectivo medio de 4,668 bits por parametro para el checkpoint completo, con el backbone de lenguaje en 4,633 bits, manteniendo atencion, indexer, experto compartido, embeddings, cabeza de salida y drafter en 8 bits, y routers y codificador de vision en BF16.

Su relevancia radica en que permite desplegar un modelo multimodal de escala frontera (texto e imagen) en formato MLX con un tamano de repositorio de 451,9 GB, algo inviable en precision completa para entornos de estacion de trabajo. Es una pieza orientada a inferencia local y experimental mas que a produccion masiva, dado su caracter de cuantizacion de terceros y su dependencia de una version especifica de oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Gated DeepSeek Sparse Attention, IndexCache e identity Hyper-Connections; incluye vision encoder y drafter DFly2 (Lightning MTP) |
| Parametros totales | 774.434B logicos en el checkpoint (base tencent/Hy4: 770B) |
| Parametros activos | 49B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh mixta: 4-bit grupo 128 (72,375% de pesos), 5-bit grupo 128 (23,709%), affine 8-bit grupo 64 (3,728%), BF16 (0,185%), FP32 (0,004%); media efectiva 4,668 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (tencent-hy-license), licencia "other" |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4 es un MoE de 770B parametros totales con 49B activos por token. Emplea Gated DeepSeek Sparse Attention con IndexCache, lo que reduce el coste de atencion sobre secuencias largas seleccionando dinamicamente las entradas relevantes, e incorpora identity Hyper-Connections como mecanismo de conexion residual. El checkpoint incluye tres componentes: el backbone de lenguaje (769,907B parametros logicos), un codificador de vision (1,235B) y un drafter DFly2 (3,291B) que oMLX ejecuta como Lightning MTP para decodificacion especulativa.

La cuantizacion parte de la release FP8 tencent/Hy4-FP8 y aplica el esquema oQh de oMLX. La innovacion principal de oQh es la rotacion Hadamard de los pesos de los expertos antes de cuantizar: los pesos rotados requieren menos escalas y el espacio ahorrado se destina a codigos de 5 bits en las proyecciones down de los expertos enrutados de 57 de las 77 capas MoE. Atencion, indexer, experto compartido, MLP denso de la primera capa, embedding de tokens, cabeza de salida y drafter DFly2 se mantienen en grupos affine de 8 bits; routers y vision encoder en BF16; las mezclas de hyper-connection en FP32. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno (pipeline image-text-to-text).
- Comprension de imagenes mediante el codificador de vision integrado (1,235B parametros).
- Entrada multimodal texto-imagen en un unico modelo.
- Decodificacion especulativa mediante el drafter DFly2 ejecutado como Lightning MTP, orientada a acelerar la generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantizacion a 4,668 bits/peso permiten cargar un modelo de escala frontera en estaciones de trabajo con memoria unificada amplia, algo imposible con los pesos FP8 o BF16 originales.
- Analisis de documentos con imagenes: al aceptar entrada image-text-to-text, puede procesar capturas, diagramas o paginas escaneadas junto con instrucciones textuales en un mismo prompt.
- Asistentes conversacionales de contexto largo: la Gated DeepSeek Sparse Attention con IndexCache esta disenada para reducir el coste de atencion en secuencias largas, lo que favorece dialogos multi-turno extensos.
- Experimentacion e investigacion: sirve como banco de pruebas para evaluar el impacto de la cuantizacion mixta oQh frente a oQe en tareas de razonamiento y vision, manteniendo el mismo tamano de fichero.
- Generacion acelerada con MTP: el drafter DFly2 integrado permite probar decodificacion especulativa en pipelines de generacion de texto a gran velocidad relativa.
- Prototipado de aplicaciones multimodales en macOS: con oMLX como runtime, se pueden construir demos de vision-lenguaje sin infraestructura GPU dedicada.
- Evaluacion comparativa de tecnicas de cuantizacion: util para medir la degradacion de calidad al pasar de 8 bits a 4/5 bits en un MoE de 770B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 451,919 GB en disco (420,882 GiB); para inferencia se necesita memoria unificada o VRAM del orden de 420 GiB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: no es un checkpoint para GPU CUDA; esta en formato MLX y depende de oMLX. En Apple Silicon requiere un sistema con memoria unificada muy elevada (varios cientos de GB), fuera del alcance de equipos consumer estandar.
- Cabe en consumer GPU: no. Un MoE de 770B incluso a 4,668 bits/peso excede la VRAM de cualquier GPU consumer (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: exclusivamente oMLX en una version con soporte de Hy4 (jundot/omlx#5463); oMLX 0.8.0 y anteriores no pueden cargarlo. No es compatible con vLLM, llama.cpp, Ollama ni TGI por el formato oQh.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-oQ4h-mtp (este) | 774,434B logicos | 49B | no disponible | MLX safetensors (oQh 4,668 bits) | Tencent Hy License | Hugging Face, requiere oMLX con soporte Hy4 |
| tencent/Hy4 (base) | 770B | 49B | no disponible | no disponible | Tencent Hy License | Hugging Face |
| tencent/Hy4-FP8 | 770B | 49B | no disponible | FP8 | Tencent Hy License | Hugging Face |
| oQe de Hy4 (referencia del autor) | 770B | 49B | no disponible | MLX safetensors (formato estandar MLX) | Tencent Hy License | Hugging Face / oMLX |

La diferencia clave frente a oQe es que oQh aplica rotacion Hadamard a los expertos y gasta el ahorro en 5 bits selectivos, manteniendo el mismo tamano de fichero; oQe, en cambio, usa el formato MLX estandar y es compatible con cualquier motor MLX que soporte el modelo.

## Limitaciones y advertencias

- Dependencia estricta de runtime: solo carga en oMLX con soporte de Hy4 (PR #5463); versiones 0.8.0 o anteriores fallan.
- Formato no estandar: oQh no es compatible con motores MLX genericos, lo que limita la portabilidad.
- Cuantizacion de terceros: no es una release oficial de Tencent; la calidad puede diferir de la version FP8 o BF16 original.
- Requisitos de memoria extremos: ~420 GiB solo de pesos, inviable en hardware consumer convencional.
- Licencia Tencent Hy License: es necesario revisar los terminos del fichero LICENSE para uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Idiomas soportados no documentados: riesgo de comportamiento degradado en castellano u otros idiomas no verificados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones de fidelidad en esta cuantizacion.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo en la informacion proporcionada.
- Longitud de contexto no especificada: no se puede garantizar el rendimiento en ventanas largas sin datos del modelo base.
- Repositorio de gran tamano (451,9 GB): la descarga y el almacenamiento requieren planificacion de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Hy4-oQ4h-mtp
- Modelo base: https://huggingface.co/tencent/Hy4
- Release FP8 de origen: https://huggingface.co/tencent/Hy4-FP8
- Repositorio oMLX: https://github.com/jundot/omlx
- PR de soporte Hy4 en oMLX: https://github.com/jundot/omlx/pull/5463
- PR del formato oQh: https://github.com/jundot/omlx/pull/5317
