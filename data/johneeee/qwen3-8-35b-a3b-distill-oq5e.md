# Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e

## Resumen

Qwen3.8-35B-A3B-Distill-oQ5e es una version cuantizada del modelo subido por el usuario Johneeee al Hub de HuggingFace. Se trata de una cuantizacion de 5 bits realizada con la herramienta oQ (oMLX v0.7.0.dev2), un esquema de cuantizacion de precision mixta orientado a MLX, el framework de inferencia de Apple para chips de la serie M. El repositorio contiene pesos en formato MLX safetensors con un total de 34.660.610.688 parametros (34,66 mil millones) y un tamano de 24,5 GB.

El identificador del modelo indica que se trata de una destilacion de un modelo de la familia Qwen3 con nomenclatura "35B-A3B", es decir, un transformer de tipo mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y, segun esa misma nomenclatura, unos 3.000 millones de parametros activos por token. La model card confirma que el tipo de modelo es `qwen3_5_moe`, lo que respalda la arquitectura MoE, pero no especifica cual es el modelo base exacto ni el proceso de destilacion aplicado.

La relevancia de esta ficha es limitada por la escasez de informacion: el autor no documenta licencia, idiomas, longitud de contexto, datos de entrenamiento ni resultados de benchmarks, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta. Se trata, por tanto, de una publicacion de tipo experimental o personal mas que de un artefacto listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) de tipo transformer; tipo declarado en la model card: `qwen3_5_moe` |
| Parametros totales | 34.660.610.688 (34,66 mil millones, dato de los safetensors) |
| Parametros activos | no disponible de forma explicita; la nomenclatura "A3B" del nombre sugiere del orden de 3.000 millones activos por token, sin confirmar en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ (oMLX v0.7.0.dev2), cuantizacion de precision mixta, 5 bits, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (5 bits, group size 64) |
| Tamano del repositorio | 24,5 GB |
| Libreria declarada | mlx |
| Autor | Johneeee |
| Fecha de creacion | 2026-09-17 |
| Fecha de actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento en la documentacion proporcionada. La model card se limita a describir el proceso de cuantizacion, no el preentrenamiento ni el ajuste del modelo base. Lo unico verificable es que el modelo es de tipo `qwen3_5_moe`, lo que implica una arquitectura de mezcla de expertos con enrutamiento por token: cada token activa un subconjunto de expertos en lugar de la totalidad de los parametros, de modo que el coste computacional por token es mucho menor que el de un modelo denso de 34,66 mil millones de parametros.

El segundo nivel de procesamiento es la cuantizacion. El autor aplico oQ (oMLX v0.7.0.dev2), un esquema de precision mixta a 5 bits con group size 64 sobre pesos MLX safetensors. La precision mixta consiste en asignar distintos numeros de bits a distintas capas o tensores en funcion de su sensibilidad, de forma que las capas criticas conservan mas precision mientras que las menos sensibles se comprimen mas. El resultado ocupa 24,5 GB, lo que situa la media efectiva por parametro en torno a 5,7 bits (24,5 GB / 34,66 mil millones de parametros), coherente con un esquema nominal de 5 bits mas las capas de mayor precision reservadas. No se documenta el proceso de destilacion mencionado en el nombre del modelo, ni si hubo RLHF, DPO u otra fase de alineamiento.

## Capacidades

- Generacion de texto: es la funcion principal esperable de un modelo de lenguaje de tipo MoE de esta familia. No hay documentacion especifica del autor al respecto.
- Razonamiento y matematicas: no documentado en la model card.
- Generacion de codigo: no documentado en la model card.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades multilingues: no documentado; el campo de idiomas no esta informado en el Hub.
- Modo "thinking" o razonamiento explicito: no documentado.
- Vision o audio: no documentado; los tags del repositorio (`mlx`, `oq`, `quantized`, `5-bit`, `qwen3_5_moe`) corresponden a un modelo de texto.
- Capacidad de ejecucion local en Apple Silicon: si, al estar en formato MLX.

Advertencia: las capacidades reales del modelo no pueden verificarse con la informacion disponible. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Casos de uso

- Asistente local en Mac con datos sensibles: al ejecutarse en formato MLX sobre memoria unificada de Apple Silicon, el modelo puede operar sin enviar datos a servicios externos. Es adecuado para flujos donde la confidencialidad impide usar APIs en la nube, siempre que se acepte la falta de garantias de licencia.
- Evaluacion comparativa de cuantizacion: el modelo sirve como punto de medida de la perdida de calidad que introduce oQ a 5 bits con group size 64 frente al modelo base sin cuantizar. Util para investigacion sobre esquemas de compresion, comparando perplejidad y calidad de generacion a distintos niveles de bits.
- Prototipado de aplicaciones sobre Apple Silicon: con 24,5 GB de pesos, el modelo permite construir demos locales con `mlx-lm` o LM Studio en equipos con memoria unificada suficiente, antes de decidir si se migra a una infraestructura con GPU.
- Generacion de texto por lotes en estaciones de trabajo Mac: tareas de resumen, reescritura o clasificacion de documentos sobre un volumen medio, ejecutadas de forma desatendida en un Mac Studio, aprovechando el bajo coste por token de un MoE de ~3B activos.
- Base para ajuste fino experimental: el autor de un proyecto puede partir de estos pesos cuantizados para pruebas de adaptacion ligera (LoRA) en MLX, aunque la cuantizacion a 5 bits puede limitar la calidad del ajuste respecto a pesos completos.
- Analisis de arquitecturas MoE en docencia o investigacion: el repositorio permite estudiar la estructura de expertos de un modelo `qwen3_5_moe` cuantizado, inspeccionando el reparto de precision por capa que produce oQ.
- Servidor de inferencia local monousuario: mediante `mlx_lm.server`, se puede exponer el modelo con una API compatible con OpenAI en una red local para uso individual o de un equipo pequeno, sin coste por token.

En todos los casos, la ausencia de benchmarks y de licencia obliga a validar el comportamiento antes de cualquier despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el proceso de cuantizacion (tipo de modelo, bits, group size y formato) y no incluye mediciones de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica. Tampoco hay datos de latencia o throughput. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: los pesos ocupan 24,5 GB. Se necesita un minimo practico de 32 GB de memoria unificada, con margen muy justo para el contexto y la cache KV; se recomienda 36 GB o mas.
- GPU compatibles: al ser pesos MLX, la ejecucion nativa esta limitada a chips de Apple (series M1, M2, M3 y M4, en versiones Pro, Max y Ultra). No se ejecuta directamente sobre CUDA.
- Cabe en GPU de consumo: si, en el sentido de que cabe en equipos Apple Silicon de gama alta. Un Mac con 32 GB unificados puede cargarlo con contexto reducido; 64 GB o 128 GB ofrecen margen holgado. No hay version CUDA lista para usar en una RTX 4090 (24 GB de VRAM), que se quedaria por debajo del tamano de los pesos.
- Opciones de despliegue: `mlx-lm` (carga, generacion y servidor compatible con OpenAI), oMLX/oQ (herramienta con la que se genero la cuantizacion), LM Studio (soporta modelos MLX), y cualquier runtime que lea safetensors MLX. vLLM y TGI no soportan pesos MLX de forma nativa; requeririan conversion previa, no incluida en el repositorio.
- Conversion a GGUF para llama.cpp u Ollama: tecnicamente posible partiendo de los pesos, pero no se distribuye en el repositorio y no hay garantia de que el proceso preserve la calidad de la cuantizacion mixta original.
- Latencia y throughput estimados: no disponible. Dependera del chip concreto, del tamano de contexto y del numero de parametros activos reales.

## Comparativa con modelos similares

No se dispone de datos verificados sobre modelos comparables en la informacion proporcionada, por lo que no es posible construir una comparativa con cifras fiables.

| Modelo | Parametros totales | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill-oQ5e | 34,66 mil millones | no disponible | no disponible | MLX safetensors 5 bits | no disponible |
| Alternativas comparables (mismo tamano o misma tarea) | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, este modelo pertenece a la categoria de MoE de ~35B con pocos parametros activos cuantizados para ejecucion local en Apple Silicon, pero no se han facilitado datos del modelo base ni de otros artefactos de la misma categoria con los que contrastarlo.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia. No se puede asumir uso comercial permitido. Al ser una obra derivada, la licencia del modelo base condiciona la de esta cuantizacion, y ese dato tampoco se explicita.
- Modelo base no identificado: la model card no indica el identificador exacto del modelo original destilado, ni la version concreta de Qwen3 sobre la que se trabajo, lo que impide reproducir o auditar el proceso.
- Ausencia total de evaluacion: no hay benchmarks, ni medidas de perplejidad, ni comparacion con el modelo sin cuantizar. No se puede cuantificar la perdida de calidad introducida por la cuantizacion a 5 bits.
- Riesgo de alucinacion: no documentado y no mitigado de forma verificable; es un riesgo inherente a cualquier modelo de lenguaje sin evaluacion publicada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan informados. Cualquier afirmacion al respecto seria especulativa.
- Repositorio sin validacion social: 0 descargas y 0 likes en el momento de la consulta, con una unica publicacion de un autor individual. No hay senales de que el artefacto haya sido probado por terceros.
- Dependencia de plataforma: el formato MLX limita el despliegue a hardware Apple. Esto excluye su uso directo en la mayoria de infraestructuras de servidores con GPU NVIDIA o AMD.
- Posible degradacion por precision mixta: aunque el esquema oQ preserva mas precision en capas sensibles, una cuantizacion a 5 bits con group size 64 puede afectar a tareas de razonamiento largo o generacion de codigo, sin que existan datos que lo confirmen o desmientan.
- Fechas de creacion y actualizacion muy proximas entre si (mismo dia, con 12 minutos de diferencia) y sin historial de revisiones posterior, lo que sugiere una publicacion puntual sin mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-35B-A3B-Distill-oQ5e
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo, su modelo base ni su proceso de cuantizacion. No se dispone de paper, blog, demo ni repositorio adicional asociado.
