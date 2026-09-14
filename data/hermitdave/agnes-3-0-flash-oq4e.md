# hermitdave/Agnes-3.0-Flash-oQ4e

## Resumen

Agnes-3.0-Flash-oQ4e es una cuantizacion de precision mixta del modelo Agnes-3.0-Flash, publicada por el usuario hermitdave. El proceso parte del modelo original de Agnes-AI, lo convierte al formato `qwen3_5` mediante un adaptador propio para `mlx_lm` y lo cuantiza con el modo de streaming oQ4e de oMLX, que asigna anchuras de bits distintas a cada capa en funcion de un analisis de sensibilidad previo. El resultado es un artefacto de aproximadamente 19 GB pensado para ejecutarse con MLX, el framework de Apple para inferencia en silicio de Apple.

El modelo conserva la arquitectura del original: 72 capas, dimension oculta de 5120 y tamano intermedio de 19456 tras el plegado del FFN paralelo. La atencion aparece renombrada en el proceso de conversion (`delta_attn` a `linear_attn`, `global_attn` a `self_attn`), lo que indica una mezcla de atencion lineal y atencion completa. La torre de vision no se incluye y los pesos de prediccion multi-token (MTP) se extraen por separado en un drafter independiente.

Su relevancia es practica y acotada: permite probar un modelo grande en equipos Apple Silicon sin disponer de GPU NVIDIA, y sirve como ejemplo documentado de flujo de cuantizacion por capas con informe de sensibilidad incluido (`oq_imatrix_report.json`, 558 entradas). No se trata de un modelo nuevo ni de un lanzamiento oficial de Agnes-AI, sino de una conversion de terceros con cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de atencion lineal y completa (`linear_attn` / `self_attn`), FFN paralelo, 72 capas, hidden 5120, intermediate 19456 |
| Parametros totales | no disponible (el autor solo publica el tamano en disco: ~19 GB en oQ4e) |
| Parametros activos | no aplica (la informacion disponible no describe el modelo como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (affine de precision mixta, group_size=64): 428 capas a 4 bits, 128 a 5 bits, 1 a 6 bits, 1 a 8 bits (`embed_tokens`) |
| Idiomas soportados | no disponible (el set de calibracion se llama `oqe_code_multilingual`, pero no se declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (consumible por `mlx_lm`); ~19 GB |
| Modelo base | Agnes-AI/Agnes-3.0-Flash |
| Conversion | `mlx_lm` con adaptador propio Agnes a `qwen3_5` |
| Vision | no incluida (dimensiones de la torre de vision de Agnes incompatibles con Qwen3-VL) |
| MTP | no incluido (oQ normaliza `mtp_num_hidden_layers` a 0); drafter separado |
| Fecha de creacion (HF) | 2026-09-14 |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como una conversion, no como un entrenamiento nuevo. La arquitectura subyacente es la de Agnes-3.0-Flash: 72 capas con hidden size 5120 e intermediate size 19456. El proceso de conversion revela tres rasgos estructurales: normalizacion RMSNorm con desplazamiento de uno (`mlx_weight = hf_weight + 1.0`), plegado de FFN paralelo (de ahi que el intermediate de 19456 corresponda a la concatenacion de la rama principal y la paralela) y una atencion hibrida con dos tipos de capa, renombradas a `linear_attn` (atencion lineal, probablemente de tipo delta) y `self_attn` (atencion global completa).

No hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable de este repositorio es la cuantizacion por capas: se calculo la sensibilidad de 558 entradas por capa con el conjunto `oqe_code_multilingual` (128 muestras, `seq_length=512`) sobre un proxy uniforme de 4 bits, y a partir de ese informe se asignaron 4, 5, 6 u 8 bits a cada capa. Tambien se documenta que el modelo soporta decodificacion especulativa mediante MTP, pero que este quant no incluye esos pesos: hay que servir un drafter aparte con `mlx_vlm.server`.

## Capacidades

- Generacion de texto e inferencia local: el repositorio demuestra el uso con `mlx_lm.load` y `mlx_lm.generate` con prompts de texto y `max_tokens` configurable.
- Razonamiento y codigo: el conjunto de calibracion empleado (`oqe_code_multilingual`) apunta a que el modelo base se comporta en tareas de codigo, aunque no se publican evaluaciones que lo confirmen para este quant.
- Capacidades multilingues: no verificables con los datos aportados; el nombre del set de calibracion sugiere cobertura multilingue en el modelo original, pero no se declara lista de idiomas.
- Decodificacion especulativa: soportada a nivel de arquitectura (MTP), pero requiere el drafter externo `hermitdave/Agnes-3.0-Flash-MTP-drafter` porque este quant no lleva pesos MTP.
- Vision: no disponible en esta version; la torre de vision se excluyo por incompatibilidad de dimensiones con Qwen3-VL.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Comportamiento agentico / multi-step: no confirmado. La conversion se realizo con la herramienta Hermes Agent, pero eso describe el pipeline de conversion, no una capacidad del modelo.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos Apple Silicon: con ~19 GB de pesos, el modelo se puede cargar con `mlx_lm` en un Mac con memoria unificada abundante, lo que permite trabajar con un modelo de 72 capas sin GPU NVIDIA ni servicios en la nube.
- Servidor de inferencia local para prototipos: `mlx_vlm.server serve` expone el modelo por red, de modo que se puede integrar como backend HTTP en una aplicacion interna o en un IDE antes de decidir si se migra a produccion.
- Decodificacion especulativa con drafter: combinando este quant con `Agnes-3.0-Flash-MTP-drafter`, se puede reducir la latencia de generacion en escenarios interactivos, que es el objetivo declarado de la separacion de pesos MTP.
- Estudio de cuantizacion por capas: el repo incluye el informe de sensibilidad de 558 entradas, lo que permite reproducir o auditar como la asignacion de bits afecta a capas concretas y usar el caso como referencia metodologica para otras conversiones.
- Asistencia de codigo en local: si el modelo base mantiene el rendimiento en codigo que sugiere el set de calibracion, este quant serviria para autocompletado y generacion de funciones en un entorno sin conexion, siempre que se valide previamente la calidad frente al modelo sin cuantizar.
- Integracion en oMLX: el autor documenta colocar el modelo en `~/.omlx/models/hermitdave/Agnes-3.0-Flash-oQ4e/` para que aparezca en el desplegable de la aplicacion, util para usuarios que prefieren interfaz grafica frente a scripts.
- Evaluacion comparativa de pipelines de cuantizacion: sirve como punto de comparacion entre el modelo original, este quant oQ4e y el drafter, midiendo degradacion de calidad y ganancia de velocidad con la misma arquitectura de base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria: el autor indica ~19 GB de pesos. Con overhead de runtime y cache KV, se recomienda disponer de al menos 24 GB de memoria unificada; 32 GB o mas da margen para contextos largos y ejecucion conjunta con el drafter.
- GPU compatibles: el formato es MLX, por lo que el destino natural son chips de Apple (series M). No se documenta soporte CUDA en este repositorio.
- GPU de consumo: cabe en equipos Apple Silicon con memoria unificada suficiente (por ejemplo, configuraciones de 32 GB o superiores). En GPUs NVIDIA de consumo no es utilizable directamente sin convertir los pesos a otro formato.
- Opciones de despliegue: `mlx_lm` (carga y generacion), `mlx_vlm.server` (servidor, con soporte de `--draft-model`) y oMLX (aplicacion con directorio de modelos). vLLM, TGI y llama.cpp no se mencionan; requeririan conversion previa desde el formato MLX.
- Latencia y throughput: no disponibles. La unica referencia indirecta es que existe un drafter MTP para decodificacion especulativa, lo que implica que el autor considera la latencia relevante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hermitdave/Agnes-3.0-Flash-oQ4e | no disponible (~19 GB) | no disponible | oQ4e precision mixta (4/5/6/8 bits) | no disponible | HuggingFace, 0 descargas, 0 likes |
| Agnes-AI/Agnes-3.0-Flash (base) | no disponible | no disponible | pesos completos (precision original) | no disponible | HuggingFace, repositorio oficial de Agnes-AI |
| hermitdave/Agnes-3.0-Flash-MTP-drafter | no disponible (drafter) | no disponible | no disponible | no disponible | HuggingFace; complemento, no alternativa |

No se dispone de datos de modelos comparables de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada, ni de cifras de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada ni en el repositorio ni en la informacion disponible: no se puede asumir uso comercial sin verificar la licencia del modelo base en Agnes-AI/Agnes-3.0-Flash.
- La cuantizacion a 4 bits en 428 de las 558 capas introduce degradacion respecto al modelo original; el autor no publica ninguna evaluacion de calidad que cuantifique esa perdida.
- La torre de vision no esta incluida, por lo que cualquier caso de uso multimodal queda descartado en este artefacto.
- Los pesos MTP no estan incluidos: sin el drafter externo no hay decodificacion especulativa, y con el se anade una segunda pieza que hay que versionar y servir de forma coordinada.
- Riesgo de alucinacion: no medido ni documentado; es un riesgo esperable en cualquier modelo generativo de este tamano, agravado por la ausencia de benchmarks.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano ni en ningun otro idioma concreto sin evaluacion propia.
- Formato exclusivamente MLX: no es directamente desplegable en vLLM, TGI, llama.cpp u Ollama sin conversion adicional.
- Repositorio sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, y sin pipeline declarado.
- Artefacto de terceros: la conversion la firma hermitdave, no Agnes-AI, por lo que no cuenta con el respaldo del desarrollador original del modelo.
- La fecha de creacion registrada (14-09-2026) resulta anomala y conviene verificarla antes de citarla.
- La informacion disponible es la model card del autor; no hay documentacion independiente que permita contrastar sus afirmaciones tecnicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermitdave/Agnes-3.0-Flash-oQ4e
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Drafter MTP: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MTP-drafter
- Organizacion Agnes-AI: https://huggingface.co/Agnes-AI
- oMLX: https://omlx.ai
- mlx_lm (repositorio): https://github.com/ml-explore/mlx-lm
- Hermes Agent, Nous Research: https://hermes-agent.nousresearch.com

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces obtenidos correspondian a portales de noticias genericos sin relacion con Agnes-3.0-Flash.
