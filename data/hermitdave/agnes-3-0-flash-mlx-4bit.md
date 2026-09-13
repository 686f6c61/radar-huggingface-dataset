# hermitdave/Agnes-3.0-Flash-MLX-4bit

## Resumen

Agnes-3.0-Flash-MLX-4bit es una cuantizacion a 4 bits en formato MLX del modelo Agnes-3.0-Flash (Agnes-AI), publicada por el usuario hermitdave. Se trata de una conversion de pesos, no de un modelo entrenado desde cero: el autor ha transformado los pesos originales al formato estandar de la arquitectura `qwen3_5` para que puedan cargarse con `mlx-lm` sin codigo personalizado. El modelo resultante tiene 32.205.067.008 parametros (aproximadamente 32,2 mil millones), ocupa 17 GB en disco (18,1 GB de repositorio) y conserva la ventana de contexto de 262.144 tokens del modelo original.

La arquitectura es hibrida: combina capas de atencion global (`self_attn`, antiguamente `global_attn`) con capas de atencion lineal basadas en Gated Delta Net (`linear_attn`, antiguamente `delta_attn`). Durante la conversion se plegaron los FFN paralelos en el MLP principal (concatenacion, con `intermediate_size` resultante de 19456), se renombro el modulo de atencion lineal, se convirtio el RMSNorm "one-centered" al formato estandar, se paso de bf16 a fp16 para compatibilidad de serializacion y se eliminaron los pesos de la cabeza MTP.

Es relevante porque permite ejecutar un modelo de 32B con contexto de 256K en hardware Apple Silicon con memoria unificada moderada, algo inviable con los pesos originales en bf16. La limitacion principal es que esta version es solo texto: no incluye la torre de vision ni la cabeza MTP del modelo base, y la licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `qwen3_5`: atencion global (`self_attn`) combinada con atencion lineal Gated Delta Net (`linear_attn`) |
| Parametros totales | 32.205.067.008 (aprox. 32,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit afina (affine), group size 64; 4,50 bits por peso |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), fp16 en serializacion |
| Modelo base | Agnes-AI/Agnes-3.0-Flash |
| Tamano del repositorio | 18,1 GB (17 GB de pesos segun el autor) |
| Libreria | mlx (mlx-lm) |
| Pipeline | text-generation |
| Modalidad | solo texto (sin torre de vision, sin cabeza MTP) |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base Agnes-3.0-Flash emplea una arquitectura hibrida etiquetada como `qwen3_5`, que alterna mecanismos de atencion: capas de atencion global completa y capas de atencion lineal implementadas como Gated Delta Net. Este diseno reduce el coste computacional y de memoria del contexto largo frente a un transformer denso con atencion cuadratica en todas las capas, lo que explica que se pueda sostener una ventana de 262.144 tokens. La conversion renombra `delta_attn` a `linear_attn` y `global_attn` a `self_attn` para alinearse con la implementacion estandar de `qwen3_5` en MLX.

Sobre el proceso de conversion, el autor documenta cinco cambios concretos: plegado de los FFN paralelos en el MLP principal mediante concatenacion (resultando en `intermediate_size: 19456`), renombrado de los modulos de atencion, conversion del RMSNorm "one-centered" al formato estandar, cambio de tipo de bf16 a fp16 para compatibilidad de serializacion y eliminacion de los pesos de la cabeza MTP para evitar una doble conversion en `mlx_lm`. La cuantizacion aplicada es afina de 4 bits con grupo de 64, equivalente a 4,50 bits por peso. La conversion fue producida por Hermes Agent (Nous Research), un pipeline autonomo de investigacion y conversion, y verificada contra una version de referencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento. Tampoco se detalla el mecanismo de plantilla de chat mas alla de que permite activar y desactivar el modo "thinking" mediante la plantilla original.

## Capacidades

- Generacion de texto conversacional y de proposito general, en modo texto unicamente.
- Modo de razonamiento explicito ("thinking") activable y desactivable a traves de la plantilla de chat original del modelo base.
- Contexto muy largo: hasta 262.144 tokens, adecuado para documentos extensos, repositorios de codigo o conversaciones multi-turno prolongadas.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision: no disponibles en esta conversion (la torre de vision del modelo base no se incluye).
- Capacidades de audio: no disponible en la informacion proporcionada.
- Decodificacion especulativa mediante MTP: no disponible, los pesos de la cabeza MTP fueron eliminados durante la conversion.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes tecnicos o expedientes completos sin fragmentacion, ejecutandose en un Mac con memoria unificada en lugar de en infraestructura cloud.
- Analisis de repositorios de codigo: el contexto de 256K permite cargar varios ficheros simultaneamente para tareas de revision, explicacion de arquitectura o generacion de parches coherentes con el estilo del proyecto.
- Asistentes conversacionales en ingles y chino: despliegue en Mac mini o MacBook Pro mediante LM Studio o `mlx_lm.server`, con historiales de conversacion extensos que no requieren resumen ni truncado.
- Razonamiento asistido con traza explicita: el modo "thinking" permite obtener cadenas de razonamiento visibles, util para tareas de matematicas, logica o depuracion donde se necesita auditar el proceso y no solo la respuesta.
- Prototipado e investigacion en MLX: al cargar como modelo `qwen3_5` estandar sin codigo personalizado, sirve para comparar variantes de cuantizacion, medir degradacion por cuantizacion a 4 bits o experimentar con kernels MLX.
- Generacion de texto offline en entornos aislados: al ser un modelo de pesos abiertos con licencia Apache-2.0 y ejecucion local, encaja en escenarios con requisitos de soberania de datos o sin conectividad.
- Traduccion tecnica ingles-chino: la combinacion de contexto largo y bilingüismo permite traducir documentacion completa manteniendo terminologia consistente a lo largo de todo el documento.
- Extraccion de informacion estructurada de corpus extensos: procesamiento por lotes de transcripciones, correos o registros para poblar bases de datos, aprovechando la ventana de contexto para aportar ejemplos y esquemas de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y tampoco se proporcionan comparaciones numericas con el modelo base en bf16. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- Peso de los pesos: 17 GB en la cuantizacion 4-bit afina (4,50 bits por peso) sobre 32,2B parametros; repositorio de 18,1 GB.
- Memoria minima practica: un Mac con 24 GB de memoria unificada es el limite inferior ajustado (pesos mas cache de activaciones); 32 GB o mas es el rango recomendado para trabajar con contextos largos.
- GPU compatibles: MLX esta disenado para Apple Silicon (familias M1, M2, M3 y M4). No se ejecuta de forma nativa en CUDA. En A100, H100 o RTX 4090 seria necesario convertir los pesos a otro formato (por ejemplo GGUF o safetensors de PyTorch), algo no cubierto por esta publicacion.
- Cabe en GPU de consumo: no en el sentido convencional (una RTX 4090 de 24 GB requeriria otro runtime). Si cabe en equipos Apple Silicon de gama alta con memoria unificada de 32 GB o superior.
- Opciones de despliegue: `mlx-lm` (linea de comandos `mlx_lm.generate` y servidor compatible con la API de OpenAI), LM Studio (copiando la carpeta bajo `~/.lmstudio/models/hermitdave/`, donde se detecta como modelo `qwen3_5`). vLLM, TGI y llama.cpp no se mencionan como soportados para este artefacto; llama.cpp requeriria una conversion a GGUF no publicada aqui.
- Cache KV y consumo con contexto completo: no disponible. El diseno hibrido con atencion lineal reduce el crecimiento de la cache respecto a un transformer denso, pero no se aportan cifras.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparativa de calidad verificada. La unica referencia disponible es el propio modelo base.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hermitdave/Agnes-3.0-Flash-MLX-4bit | 32,2B | 262.144 | 4-bit MLX (4,50 bits/peso) | Apache-2.0 | HuggingFace (MLX) |
| Agnes-AI/Agnes-3.0-Flash | no disponible | 262.144 | pesos originales (bf16) | Apache-2.0 | HuggingFace |
| Otros modelos de ~30B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: la calidad de salida puede degradarse respecto a los pesos originales en bf16, especialmente en tareas sensibles a la precision numerica. El autor afirma haber validado la calidad contra una version de referencia, pero no publica metricas.
- Solo texto: la torre de vision del modelo base esta ausente, por lo que cualquier caso de uso multimodal no es viable con esta conversion.
- Sin decodificacion especulativa MTP: la cabeza MTP fue eliminada para evitar dobles conversiones en `mlx_lm`, de modo que no se puede aprovechar esa aceleracion en este artefacto.
- Idiomas limitados a ingles y chino segun los metadatos. El rendimiento en castellano u otros idiomas no esta documentado y es previsiblemente inferior.
- Sesgos: no disponible. No se documenta la composicion del dataset de entrenamiento ni evaluaciones de sesgo del modelo base.
- Riesgo de alucinacion: no cuantificado. Se trata de un modelo generativo de proposito general; en tareas facticas o de resumen de documentos largos conviene verificar las afirmaciones.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. No se identifican clausulas adicionales en la informacion disponible.
- Dependencia de plataforma: requiere MLX y, por tanto, hardware Apple Silicon. No hay ruta de despliegue documentada para CUDA en esta publicacion.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la conversion procede de un pipeline automatizado (Hermes Agent). Conviene validar el comportamiento en el caso de uso concreto antes de llevarlo a produccion.
- Fecha de publicacion inusualmente futura en los metadatos (13 de septiembre de 2026), lo que sugiere que los campos de fecha del repositorio podrian no ser fiables.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos correspondian a contenidos no relacionados (restauracion de comida rapida). No hay papers, blogs tecnicos ni evaluaciones independientes contrastables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MLX-4bit
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Pipeline de conversion (Hermes Agent, Nous Research): https://hermes-agent.nousresearch.com
- Libreria de inferencia MLX (`mlx-lm`): no disponible en la informacion proporcionada
- Paper tecnico: no disponible
- Blog o documentacion adicional: no disponible
