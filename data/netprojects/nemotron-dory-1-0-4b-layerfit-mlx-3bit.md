# netprojects/Nemotron-Dory-1.0-4B-LayerFit-MLX-3bit

## Resumen

Nemotron-Dory-1.0-4B-LayerFit-MLX-3bit es una cuantizacion de 3 bits del modelo NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 de NVIDIA, empaquetada para Apple Silicon mediante la libreria MLX. El modelo base es un transformer "looped" de aproximadamente 4.000 millones de parametros (3.975.229.440 exactos segun los pesos safetensors). La build la publica el usuario netprojects (Paris Michalas, NetProjects), no NVIDIA, y no esta afiliada al fabricante original.

La aportacion tecnica de esta version es LayerFit, un procedimiento de busqueda de precision por capa que asigna mas bits a las partes del modelo que mas degradan a baja precision (atencion, MLP, embeddings y cabeza de salida) y menos al resto, dentro de un presupuesto de tamano fijo. Frente a una cuantizacion uniforme de 3 bits, el autor reporta mejoras medibles en acuerdo top-1 con bf16 y en perplejidad (KL).

El resultado ocupa 1,7 GB en disco (repo de 1,8 GB) y esta pensado para ejecutarse en Macs con 8 GB de memoria o mas. Es relevante para desarrolladores que quieran correr un modelo conversacional de ~4B en hardware de consumo Apple con la maxima fidelidad posible a bajo coste de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (modelo base NVIDIA Dory 1.0); codigo de inferencia incluido en `dory.py` |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits con asignacion por capa (LayerFit); escalas de normalizacion, pesos de bucle y escala de logits en bf16; existen builds 8-bit, bf16 y nvfp4 del mismo autor |
| Idiomas soportados | no disponible (el harness de evaluacion menciona "pasajes retenidos en varios idiomas") |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano en disco | 1,7 GB (repo 1,8 GB) |
| Memoria recomendada | 8 GB en Mac |
| Libreria | mlx-lm (requiere `--trust-remote-code`) |
| Modelo base | nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo "looped" de NVIDIA, es decir, con capas reutilizadas en bucle; esta build incluye pesos de bucle que se mantienen en bf16 para no degradar la calidad. La cuantizacion se aplica a 3 bits con una busqueda por capa (LayerFit) que mide la degradacion de cada bloque (atencion y MLP de cada capa, embeddings y cabeza de salida) y distribuye el presupuesto de bits donde mas contribuye a preservar la salida original. La receta exacta esta en `layerfit-recipe.json` del repositorio.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, si hubo RLHF/DPO) en la documentacion proporcionada. La model card solo describe el proceso de conversion y cuantizacion, no el preentrenamiento. El aviso `NOTICE` del repo describe los detalles de la conversion.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo "thinking" desactivable: el harness de evaluacion usa GSM8K con thinking off.
- Resolucion de problemas matematicos basicos (GSM8K evaluado en la build).
- Capacidades multilingues: el harness menciona pasajes retenidos en varios idiomas, aunque no se detallan los idiomas soportados.
- Ejecucion en Apple Silicon via MLX, con servidor compatible con la API de OpenAI (`mlx_lm.server`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Vision / audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar dialogos multi-turno en un MacBook con 8 GB de memoria gracias a su huella de 1,7 GB, sin depender de la nube ni de GPU dedicadas.
- Prototipado rapido de aplicaciones LLM: con `mlx_lm.server` se levanta un endpoint compatible con OpenAI en el puerto 8080, lo que permite conectar clientes existentes (SDKs, LangChain, etc.) sin cambios de codigo.
- Razonamiento matematico de nivel escolar: adecuado para tareas tipo GSM8K (problemas aritmeticos con enunciado), donde el autor reporta 24/30 aciertos en su harness.
- Investigacion sobre cuantizacion: util como caso de estudio reproducible de LayerFit frente a cuantizacion uniforme, con receta y metricas publicadas (acuerdo top-1, KL, GSM8K).
- Inferencia en entornos con restricciones de memoria: equipos Apple Silicon de gama base (8 GB) donde un modelo de 4B en bf16 no cabria con holgura.
- Evaluacion comparativa de builds: el mismo autor publica variantes 8-bit, bf16 y nvfp4, lo que permite comparar calidad frente a tamano en el mismo hardware.
- Generacion de texto offline: escenarios de privacidad donde los datos no pueden salir del dispositivo, ejecutando todo en local.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos contra su build bf16, con GSM8K (30 ejemplos) y thinking desactivado, en un MacBook Pro M5 Max el 28 de noviembre de 2026:

| Metrica | 3-bit estandar (mismos bits por capa) | LayerFit 3-bit |
|---|---|---|
| Acuerdo top-1 con bf16 | 68,8 % | 75,0 % |
| Error KL | 0,5581 | 0,3301 (41 % menor) |
| GSM8K (30) | 21/30 | 24/30 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) del modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1,7 GB de pesos; el autor recomienda un Mac con 8 GB de memoria para margen de trabajo.
- Hardware objetivo: Apple Silicon (MLX). Medido en un MacBook Pro M5 Max.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por esta build, que es especifica de MLX; para CUDA habria que usar el modelo base en bf16 u otra cuantizacion.
- Cabe en GPU de consumo Apple: si, en cualquier Mac con 8 GB o mas de memoria unificada.
- Despliegue: `mlx-lm` (CLI `mlx_lm.generate`, servidor `mlx_lm.server` compatible con OpenAI, API Python `load`/`generate`). Requiere `--trust-remote-code` porque el codigo del modelo (`dory.py`) viaja con la build.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Dory-1.0-4B-LayerFit-MLX-3bit (esta build) | ~4B | no disponible | 3-bit LayerFit, MLX | OpenMDW-1.1 | Hugging Face, MLX |
| Nemotron-Dory-1.0-4B-MLX-8bit (mismo autor) | ~4B | no disponible | 8-bit, MLX | OpenMDW-1.1 | Hugging Face, MLX |
| Nemotron-Dory-1.0-4B-MLX-bf16 (mismo autor) | ~4B | no disponible | bf16, MLX | OpenMDW-1.1 | Hugging Face, MLX |
| Nemotron-Dory-1.0-4B-MLX-nvfp4 (mismo autor) | ~4B | no disponible | nvfp4, MLX | OpenMDW-1.1 | Hugging Face, MLX |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 (base) | ~4B | no disponible | bf16 | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits degrada la fidelidad respecto a bf16: el propio autor reporta un 75,0 % de acuerdo top-1 y un error KL de 0,3301, no una equivalencia exacta.
- Riesgo de alucinacion inherente al modelo base; no se documentan medidas especificas de mitigacion.
- No se detallan los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de aplicaciones que dependan de ventanas largas o de idiomas concretos.
- Licencia OpenMDW-1.1: es una licencia "other"; conviene revisar sus terminos antes de uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- Requiere `--trust-remote-code` en mlx-lm, lo que implica ejecutar codigo del repositorio; auditar `dory.py` antes de desplegar en produccion.
- Build especifica de Apple Silicon: no sirve para CUDA ni para despliegues en servidores NVIDIA.
- El modelo base es de NVIDIA, pero esta build la mantiene un tercero (NetProjects); no hay soporte oficial de NVIDIA para esta cuantizacion.
- Comunidad muy reducida (0 descargas, 1 like en el momento de la consulta): poca validacion externa de las metricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Build 8-bit: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-MLX-bf16
- Build nvfp4: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-MLX-nvfp4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- NetProjects: https://netprojects.com
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
