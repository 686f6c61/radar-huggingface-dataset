# Brooooooklyn/Agents-A1-nvfp4-mlx

## Resumen

Agents-A1-nvfp4-mlx es una cuantizacion en formato MLX del modelo agéntico Agents-A1, desarrollado por InternScience, y convertida por Brooooooklyn (LongYinan) como parte de una receta de tensor-class para MLX en macOS y DGX. Agents-A1 es un modelo de mezcla de expertos (MoE) de 35 000 millones de parametros totales con 3 000 millones activos, perteneciente a la familia Qwen3.5, disenado para tareas de agente de largo horizonte: busqueda, ingenieria, investigacion cientifica, seguimiento de instrucciones y uso de herramientas. Esta version concreta aplica una cuantizacion mixta NVFP4 (4 bits) y E4M3 FP8 (8 bits) sobre los pesos, manteniendo ciertos tensores en BF16, y esta orientada a inferencia experimental en Linux aarch64 con CUDA 13.0, validada en NVIDIA DGX Spark (GB10, sm_121).

La relevancia de este artefacto radica en que permite ejecutar un modelo agéntico de 35B en hardware de memoria unificada como DGX Spark, reduciendo el peso del checkpoint a 24,8 GB. No obstante, se trata de una conversion sin calibracion, sin imatrix y sin paridad numerica garantizada con la ejecucion calibrada de Unsloth, por lo que debe considerarse experimental. El checkpoint publicado no incluye el subarbol de tensores MTP (multi-token prediction), y la atencion paginada solo esta disponible en Metal, no en CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atencion hibrida lineal/completa, familia Qwen3.5 |
| Parametros totales | 35 114 289 008 (35B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, grupo 16), E4M3 FP8 (8 bits), BF16 (tensores excluidos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX, con clases de tensor NVFP4 y FP8) |

## Arquitectura y entrenamiento

Agents-A1 es un modelo MoE con 40 capas de modelo de lenguaje, 256 expertos enrutados con seleccion top-8 y un experto compartido. Emplea atencion hibrida: atencion completa en algunas capas y atencion lineal en otras, con tensores de estado GDN (gated delta net) y convolucion. La configuracion es capaz de MTP (multi-token prediction), aunque el checkpoint fuente publicado no incluye los tensores `mtp.*`. El modelo base fue entrenado por InternScience, pero no se dispone de datos sobre el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La cuantizacion realizada por Brooooooklyn sigue la receta Unsloth Qwen3.6 NVFP4, pero adaptada a MLX: los tensores de los expertos enrutados y del experto compartido de las capas 0 a 31 se almacenan en NVFP4 con grupo de 16; los mismos proyecciones de las capas 32 a 39, junto con todas las proyecciones de atencion (completa y lineal), `lm_head` y otros, se almacenan en E4M3 FP8 con una escala BF16 por canal de salida. Los embeddings, el router, las normas y los tensores de estado GDN permanecen en BF16. La conversion es data-free (sin calibracion) y no utiliza imatrix, AWQ ni calibracion de KV-cache. El resultado son 192 modulos NVFP4 y 179 modulos E4M3 FP8.

## Capacidades

- Generacion de texto conversacional y de instrucciones, con soporte para tareas de agente de largo horizonte.
- Razonamiento multi-paso y seguimiento de instrucciones complejas, segun la descripcion del proyecto original.
- Uso de herramientas (tool use) y busqueda, disenado para escenarios de ingenieria e investigacion cientifica.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No incluye capacidades de vision en esta version (existe una variante 4B con vision, pero no es este artefacto).
- Soporte de atencion paginada solo en Metal; en CUDA requiere modo eager forzado.

## Casos de uso

- Agentes de busqueda de largo horizonte: el modelo puede planificar y ejecutar multiples pasos de busqueda y recopilacion de informacion, gracias a su arquitectura MoE con 3B activos que permite mantener un coste computacional moderado durante trayectos largos.
- Ingenieria de software asistida: su capacidad de uso de herramientas y razonamiento multi-paso lo hace adecuado para tareas de generacion, revision y depuracion de codigo en entornos de desarrollo, aunque no se han publicado benchmarks especificos de codigo.
- Investigacion cientifica automatizada: puede estructurar experimentos, analizar resultados y redactar informes, aprovechando su entrenamiento orientado a agentes heterogeneos.
- Asistentes de atencion al cliente con contexto largo: aunque la longitud de contexto no esta documentada, su naturaleza conversacional y de seguimiento de instrucciones permite gestionar dialogos multi-turno en despliegues experimentales.
- Prototipado de sistemas agénticos en hardware de memoria unificada: al ser una cuantizacion MLX de 24,8 GB, puede ejecutarse en DGX Spark (GB10) para pruebas de concepto de agentes autonomos.
- Evaluacion de recetas de cuantizacion mixta: este artefacto sirve como referencia para estudiar el impacto de NVFP4 y FP8 en modelos MoE de 35B, especialmente en lo relativo a la aniquilacion de pesos en bloques de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones, y la busqueda web no ha proporcionado datos adicionales. La unica referencia cualitativa es la afirmacion del proyecto original de que Agents-A1 alcanza "rendimiento a nivel de billones de parametros" escalando el horizonte del agente, pero sin cifras concretas.

## Requisitos de hardware

- Tamano del checkpoint: 24,8 GB en disco (formato safetensors MLX).
- VRAM estimada: no disponible oficialmente; con 24,8 GB de pesos, se requiere una GPU con al menos 32 GB de memoria para cargar el modelo completo en memoria, aunque al ser MoE con 3B activos, la memoria de activaciones es menor.
- GPU recomendadas: NVIDIA DGX Spark (GB10, sm_121) es el target validado; tambien podria ejecutarse en GPUs aarch64 con CUDA 13.0, pero no se ha validado en x86_64.
- No cabe en GPUs de consumo tipicas (RTX 4090 con 24 GB no tendria margen suficiente para el modelo completo y las activaciones).
- Opciones de despliegue: mlx-node 0.0.8 o superior, compilado desde fuente en Linux aarch64; requiere las variables `MLX_QWEN35_FORCE_EAGER=1` y `MLX_QWEN35_PAGED_OVERRIDE=0` para inferencia en DGX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo base Agents-A1 pertenece a la familia Qwen3.5 y compite con otros MoE agénticos de tamano similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-V3-Lite), pero no se han publicado comparaciones directas en la informacion proporcionada. Esta version cuantizada es especifica de MLX y no tiene equivalentes directos publicados en el ecosistema.

## Limitaciones y advertencias

- Cuantizacion sin calibracion: no se utilizo imatrix, dataset de calibracion ni pre-escalado AWQ, por lo que no se garantiza paridad numerica ni de rendimiento con la ejecucion calibrada de Unsloth.
- Aniquilacion de pesos en expertos: el 0,9491% de los bloques de expertos presenta aniquilacion (valores cercanos a cero), con el peor caso en `layers.0.mlp.switch_mlp.gate_proj` al 41,44%. Esto es una limitacion conocida y abierta, no un fallo de conversion.
- Target restringido: solo validado en Linux aarch64 con CUDA 13.0 y NVIDIA GB10 / DGX Spark; no es un artefacto generico para CUDA en x86_64 ni para macOS.
- Atencion paginada no disponible en CUDA: requiere modo eager forzado, lo que puede afectar al rendimiento en trayectos largos.
- MTP no incluido: el checkpoint fuente no contiene los tensores `mtp.*`, por lo que la capacidad de prediccion multi-token no esta disponible en esta version.
- Riesgo de alucinacion y sesgos: no documentados para este modelo; al ser una cuantizacion de un modelo agéntico, puede presentar alucinaciones en tareas de razonamiento largo.
- Uso comercial: permitido bajo licencia Apache-2.0, pero la naturaleza experimental y las limitaciones de hardware pueden dificultar su despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Brooooooklyn/Agents-A1-nvfp4-mlx
- Modelo base (InternScience/Agents-A1): https://huggingface.co/InternScience/Agents-A1
- Repositorio del proyecto Agents-A1: https://github.com/InternScience/Agents-A1
- Pagina del proyecto: https://internscience.github.io/Agents-A1/
- Coleccion de Brooooooklyn (receta Qwen Unsloth NVFP4): https://huggingface.co/collections/Brooooooklyn/qwen-unsloth-nvfp4-tensor-class-recipe-for-mlx-macos-dgx-6a5e3a893ae031d023e72ccf
- Repositorio mlx-node (PR #131): https://github.com/mlx-node/mlx-node/pull/131
- Documentacion de la receta Unsloth Qwen3.6 NVFP4: https://unsloth.ai/docs/models/qwen3.6#nvfp4
