# netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2.5bit

## Resumen

Qwen3.6-35B-A3B-LayerFit-MLX-2.5bit es una cuantizacion de 2,5 bits del modelo Qwen3.6-35B-A3B de Qwen (Alibaba Cloud), realizada por NetProjects (Paris Michalas) para su ejecucion en Apple Silicon mediante el framework MLX. El modelo base es un mixture-of-experts (MoE) de 35.107.181.936 parametros totales con aproximadamente 3.000 millones de parametros activos por token, y esta orientado a tareas multimodales de imagen-texto (pipeline `image-text-to-text`) con una ventana de contexto de 262.144 tokens y modo de razonamiento (thinking) activado por defecto.

La innovacion principal de esta build es LayerFit, una tecnica propietaria de NetProjects que, en lugar de aplicar una cuantizacion uniforme a todas las capas, mide primero la sensibilidad de cada componente del modelo (expertos enrutados, experto compartido, bloques de atencion lineal y atencion, embeddings y cabeza de salida) y distribuye el presupuesto de bits donde mas impacto tiene. Segun la model card, esto permite que una build de 2,5 bits alcance un 85,7 % de acuerdo top-1 con la referencia bf16 y un error KL de 0,1242, frente al 82,3 % y 0,1903 de una mezcla uniforme equivalente de 2,5 bits.

El resultado es un paquete de 13,7 GB en disco que cabe en Macs de 24 GB de memoria unificada, mantiene la torre de vision en bf16 y es compatible con las herramientas estandar de MLX (`mlx-vlm` para multimodal y `mlx-lm` para texto). La licencia es Apache-2.0, la misma del modelo base, y no existe afiliacion con Alibaba Cloud ni con el equipo Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con atencion lineal y atencion completa por capas, mas torre de vision |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones por token (variante A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 2,5 bits (esta build, LayerFit); existen builds hermanas de 2, 3 y 4 bits |
| Idiomas soportados | No disponible (la model card no detalla el desglose; el harness de evaluacion cubre ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (repo de 13,7 GB); torre de vision en bf16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo mixture-of-experts con 35.107 millones de parametros totales y unos 3.000 millones activos por token, organizado en capas que combinan atencion lineal y atencion completa, expertos enrutados y un experto compartido. Incluye ademas una torre de vision que lo habilita para tareas de imagen-texto. La revision del modelo base referenciada por esta build es `345d467`.

Esta ficha no documenta el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO), ya que la model card remite a la card oficial de Qwen para los detalles. La contribucion tecnica de esta build es la cuantizacion LayerFit: un busqueda por capa que asigna un presupuesto fijo de bits midiendo previamente la degradacion de cada subcomponente (expertos enrutados, experto compartido, bloques de atencion lineal y atencion, embeddings y cabeza de salida) frente a una referencia bf16. El router y la compuerta del experto compartido se mantienen en bf16. La receta exacta esta en `layerfit-recipe.json` dentro del repositorio. La evaluacion se realizo con 32 pasajes de 512 tokens en ingles, otros idiomas, codigo, tool calls y matematicas, sobre los pesos del modelo de lenguaje (vision excluida), en un MacBook Pro M5 Max el 28 de noviembre de 2026.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto (desactivable con `enable_thinking: false` en el template de chat).
- Comprension de imagenes y respuesta multimodal (pipeline `image-text-to-text`); la torre de vision se conserva en bf16.
- Generacion de codigo y resolucion de problemas matematicos (el harness de evaluacion incluye codigo y matematicas; GSM8K-20 con thinking desactivado: 18/20).
- Soporte de tool calling / function calling (incluido en el conjunto de evaluacion de la cuantizacion).
- Capacidades multilingues (la evaluacion cubre varios idiomas ademas del ingles, aunque no se detalla la lista completa).
- Conversacion multi-turno con contexto largo de hasta 262.144 tokens.
- Compatibilidad con `mlx-vlm` (multimodal) y `mlx-lm` (texto) en Apple Silicon.

## Casos de uso

- Asistente multimodal local en Mac: analisis y descripcion de imagenes en un portatil con 24 GB de memoria unificada, usando `mlx_vlm.generate` con `--image`, sin depender de servicios en la nube.
- Procesamiento de documentos largos: resumen, extraccion y preguntas sobre contratos, informes o expedientes de hasta 262.144 tokens en una sola pasada, aprovechando la ventana de contexto extendida.
- Generacion de codigo en flujos de desarrollo locales: autocompletado, refactorizacion y explicacion de codigo con soporte de tool calling, integrable en scripts de CLI sobre MLX.
- Agentes multi-paso en local: orquestacion de tareas que requieren razonamiento encadenado (modo thinking) y llamadas a herramientas, con el modelo ejecutandose integramente en el equipo del usuario.
- Atencion al cliente y asistentes conversacionales: gestion de dialogos multi-turno con contexto amplio y bajo coste de inferencia gracias a los aproximadamente 3.000 millones de parametros activos por token.
- Analisis de imagenes en investigacion: experimentacion con modelos multimodales de gran tamano en hardware de consumo, sin necesidad de GPUs de datacenter.
- Prototipado y evaluacion de tecnicas de cuantizacion: uso de las distintas builds (2, 2,5, 3 y 4 bits) para comparar el equilibrio entre tamano, calidad y velocidad en Apple Silicon.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la evaluacion interna de la cuantizacion (pesos del modelo de lenguaje, sin vision), comparando esta build con una mezcla uniforme de 2,5 bits del mismo tamano:

| Build | Pesos del modelo de lenguaje | Acuerdo top-1 con bf16 | Error (KL) |
|---|---|---|---|
| Mezcla uniforme de 2,5 bits (expertos 2/3 bits, resto 4 bits) | 12,8 GB | 82,3 % | 0,1903 |
| LayerFit 2,5 bits (esta build) | 12,8 GB | 85,7 % | 0,1242 |

Prueba adicional: GSM8K-20 con thinking desactivado, 18/20 aciertos. El harness emplea 32 pasajes de 512 tokens en ingles, otros idiomas, codigo, tool calls y matematicas, frente a la conversion bf16 propia de NetProjects del modelo base, medida en un MacBook Pro M5 Max el 28 de noviembre de 2026. No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, etc.) del modelo base ni de esta cuantizacion; la model card remite a la card oficial de Qwen para los resultados de Qwen.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,7 GB en disco para esta build de 2,5 bits; segun la tabla del autor, encaja en Macs de 24 GB dejando margen para macOS y prompts largos.
- Builds alternativas del mismo modelo: 2 bits (10,3 GB, para 16 GB en modo stretch y solo texto), 3 bits (16,1 GB, para 32 GB o 24 GB en stretch) y 4 bits (21,6 GB, para 32 GB en stretch o 48 GB).
- GPU recomendadas: Apple Silicon (medido en MacBook Pro M5 Max); no se documenta soporte para GPUs NVIDIA ni CUDA en esta build.
- Cabe en hardware de consumo: si, en Macs con memoria unificada de 24 GB o superior (esta build); la build de 2 bits apunta a 16 GB en modo stretch.
- Opciones de despliegue: `mlx-vlm` (multimodal) y `mlx-lm` (texto) mediante `python -m mlx_vlm.generate` o `mlx_lm.generate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Ajuste opcional de memoria: `sudo sysctl iogpu.wired_limit_mb=<aproximadamente 75 % de la RAM en MB>` para el modo stretch (persiste hasta reiniciar).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-LayerFit-MLX-2.5bit (esta ficha) | 35,1 B totales / ~3 B activos | 262.144 | 2,5 bits MLX | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen3.6-35B-A3B (modelo base) | 35,1 B totales / ~3 B activos | 262.144 | bf16 | Apache-2.0 | Hugging Face |
| Qwen3.6-35B-A3B-LayerFit-MLX-2bit (build hermana) | 35,1 B totales / ~3 B activos | 262.144 | 2 bits MLX | Apache-2.0 | Hugging Face, 10,3 GB |
| Qwen3.6-35B-A3B-LayerFit-MLX-4bit (build hermana) | 35,1 B totales / ~3 B activos | 262.144 | 4 bits MLX | Apache-2.0 | Hugging Face, 21,6 GB |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos de otros fabricantes para una comparativa cruzada; las unicas alternativas documentadas son las distintas builds de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- La cuantizacion a 2,5 bits introduce degradacion respecto a bf16: el acuerdo top-1 medido es del 85,7 % y el error KL de 0,1242, por lo que no es equivalente al modelo original en tareas sensibles a la precision.
- La evaluacion de la cuantizacion excluye la torre de vision; no se documenta el impacto de la cuantizacion en tareas de imagen mas alla de una prueba de humo (pregunta con imagen, thinking on/off y dos imagenes).
- La build esta pensada exclusivamente para Apple Silicon con MLX; no hay soporte documentado para CUDA, vLLM, llama.cpp ni otros runtimes.
- No se detalla la lista completa de idiomas soportados ni su calidad relativa; la evaluacion multilingue se limita a los 32 pasajes del harness.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son los heredados del modelo base Qwen3.6-35B-A3B.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el archivo NOTICE; LayerFit es una marca registrada de NetProjects y el proyecto no esta afiliado a Alibaba Cloud ni al equipo Qwen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad sobre esta build.
- El modelo tiene thinking activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explicitamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2.5bit
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Build hermana de 2 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2bit
- Build hermana de 3 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-3bit
- Build hermana de 4 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-4bit
- Otros modelos de NetProjects: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
