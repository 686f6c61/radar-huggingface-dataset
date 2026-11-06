# AinsleyMarkov/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-iQ-MLX-4.7bpw

## Resumen

Qwen3.8-Flash-Next-Uncensored-MLX-Serve-iQ-MLX-4.7bpw es un empaquetado cuantizado en formato MLX del modelo abliterado orcarouter/Qwen3.8-Flash-Next-Uncensored, que a su vez deriva del modelo base Qwen/Qwen3.8-Flash-Next (tipo `qwen4_exp`). Lo publica el usuario AinsleyMarkov y esta pensado para ejecucion en Apple Silicon mediante la libreria mlx-serve. El modelo combina una arquitectura MoE hibrida con atencion lineal Gated DeltaNet y atencion completa, ademas de una tabla de embeddings n-gram de gran tamano, lo que lo situa en la categoria de modelos de ~180.000 millones de parametros totales con activacion dispersa.

El interes de este empaquetado concreto reside en tres factores: la cuantizacion iQ-MLX con matriz de importancia (imatrix) recogida sobre los pesos abliterados, la preservacion del tower de vision en bf16 y la inclusion de la tabla n-gram cuantizada a 4 bits. El resultado ocupa 107,3 GB en 111 ficheros y permite ejecutar un modelo multimodal de contexto largo (262.144 tokens) en hardware Apple de gama alta, algo inviable en bf16.

La relevancia actual es doble: por un lado, demuestra el estado del arte en cuantizacion selectiva para arquitecturas MoE hibridas con atencion lineal; por otro, el componente "uncensored" (abliteracion via proyeccion de direccion de rechazo) lo hace atractivo para investigacion sobre alineacion y seguridad, aunque con caveats importantes para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 36 capas Gated DeltaNet (atencion lineal) + 12 capas de atencion completa, con hyper-connections y PLE n-gram |
| Parametros totales | 179.999.981.459 (modelo completo); 128.799.735.699 en safetensors del pack |
| Parametros activos | 10 expertos enrutados de 512 + 1 compartido (intermedio 640); no se publica el total activo exacto |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MLX affine: 4-bit g64 (expertos enrutados, embed_tokens), 8-bit g64 (atencion, shared experts, routers, proyecciones), bf16 (norms, conv1d, vision tower); tabla n-gram 4-bit g32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (MLX), 111 ficheros, 107,3 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura hibrida con 48 capas: 36 capas de atencion lineal Gated DeltaNet (16 cabezas de clave x 128, 48 cabezas de valor x 128, kernel de convolucion 4) intercaladas con 12 capas de atencion completa cada cuatro capas. La atencion completa usa 24 cabezas, 2 cabezas KV, dimension de cabeza 256, RoPE parcial 0.25 (mRoPE) con theta 10.000.000 y un indexador QSA de 4 cabezas x 128 con presupuesto 2.048 y ratio de compresion 4. El hidden size es 2.560 con 4 flujos de hyper-connection. La capa MoE tiene 512 expertos enrutados (intermedio 640) con 10 activos por token mas 1 compartido.

Una innovacion destacable es la embedding n-gram (PLE) en la capa 2: tamano de n-gram 3, 8 cabezas por orden, 16 cabezas en total, con 320.001.536 filas x 160 dimensiones (51.200 millones de parametros). Incluye tambien una cabeza MTP (multi-token prediction) de una capa de atencion completa, y un tower de vision ViT de 27 capas, hidden 1.152, patch 16, merge espacial 2 y patch temporal 2.

El proceso de abliteracion (orcarouter) sigue a Arditi et al. (2024): se extrae una direccion de rechazo `r` de la entrada del bloque de la capa 24 (2560-d) y se proyecta fuera de 149 tensores que escriben en el residual, en float32. No se tocan el tower de vision, routers, `experts.gate_up_proj`, mixers de hyper-connection, indexador QSA, tabla n-gram, `mtp.fc_*`, norms ni `lm_head`. La cuantizacion iQ-MLX usa una imatrix recogida sobre los pesos abliterados con 1.239.110 tokens en 995 secuencias (trafico de agentes 338.748, codigo 337.764, matematicas 224.691, prosa 337.907). Los datos de preentrenamiento y el proceso de RLHF/DPO del modelo original no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante el tower ViT de 27 capas en bf16.
- Razonamiento matematico y generacion de codigo, con corpus de calibracion que incluye codigo y matematicas.
- Capacidad de agente y trafico de agentes (presente en el corpus de calibracion de la imatrix).
- Cabeza MTP (multi-token prediction) para decodificacion especulativa o prediccion de multiples tokens.
- Embedding n-gram (PLE) para enriquecimiento lexico y de contexto.
- Comportamiento "uncensored": rechazo reducido drasticamente tras abliteracion (AdvBench 100,0% -> 2,0%, JailbreakBench 94,0% -> 0,0%, HarmBench 100,0% -> 1,3%).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteracion sobre las tasas de rechazo (XSTest de sobre-rechazo 9,6% -> 1,2%) comparando directamente con el modelo base sin abliterar en el mismo hardware.
- Despliegue local en Apple Silicon de un modelo de 180.000 millones de parametros: con 107,3 GB en 4,7 bits por peso, cabe en un Mac Studio M3 Ultra de 512 GB y permite inferencia sin GPU dedicada.
- Procesamiento de documentos largos multimodales: la ventana de 262.144 tokens junto con el tower ViT permite analizar contratos, informes o libros completos con imagenes intercaladas en una sola pasada.
- Generacion de codigo en pipelines locales: el corpus de calibracion incluye 337.764 tokens de codigo, lo que preserva el rendimiento en tareas de programacion tras la cuantizacion.
- Agentes autonomos multi-paso: la cabeza MTP y el contexto largo facilitan planificacion y ejecucion de tareas encadenadas; el trafico de agentes en la calibracion reduce la degradacion en ese dominio.
- Analisis de imagenes medicas o tecnicas en entornos con requisitos de privacidad: al ejecutarse localmente en Apple Silicon, los datos no salen del dispositivo.
- Experimentacion con decodificacion especulativa: la cabeza MTP de una capa de atencion completa permite implementar speculative decoding sobre el modelo cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La validacion reportada es de fidelidad de cuantizacion: comparacion de logits next-token en bf16 del modelo abliterado frente al pack cuantizado, en 4 posiciones por ventana held-out, ejecutada el 2026-10-06 con mlx-serve `431ac5d` en un Mac Studio M3 Ultra de 512 GB. Los datos numericos de esa comparacion no se detallan en el extracto disponible.

| Metrica de abliteracion (bf16, vLLM, thinking off) | Antes | Despues |
|---|---|---|
| AdvBench (rechazo) | 100,0% | 2,0% |
| JailbreakBench (rechazo) | 94,0% | 0,0% |
| HarmBench (rechazo) | 100,0% | 1,3% |
| XSTest (sobre-rechazo) | 9,6% | 1,2% |

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 107,3 GB para el pack completo en 4,7 bits por peso; el modelo en bf16 requeriria aproximadamente 360 GB.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada suficiente; la validacion se hizo en Mac Studio M3 Ultra de 512 GB. No se documenta soporte para A100, H100 ni RTX 4090 en este pack (formato MLX).
- Cabe en consumer GPU: no en el sentido tradicional; requiere Apple Silicon con al menos ~110 GB de memoria unificada disponibles (Mac Studio M3 Ultra, Mac Pro con M2 Ultra de 192 GB o superior).
- Opciones de despliegue: mlx-serve (libreria nativa del pack), mlx-vlm, y el runtime qwen38-flash-next-mlx del repositorio PipeNetwork. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este pack (AinsleyMarkov) | 180B totales | 262.144 | MLX safetensors, 4,7 bpw | qwen-community-1.0 | Abliterado + imatrix propia, vision bf16 |
| ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw | 180B totales | 262.144 | MLX safetensors, 4,7 bpw | qwen-community-1.0 | Version no abliterada; comparte 12 ficheros byte-identicos |
| na0fu3y/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-iQ-MLX-4.7bpw | 180B totales | 262.144 | MLX safetensors | qwen-community-1.0 | Mismo empaquetado alternativo, ejecutable con mlx-vlm |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (bf16) | 180B totales | 262.144 | safetensors bf16 | qwen-community-1.0 | Modelo fuente sin cuantizar, ~360 GB |

## Limitaciones y advertencias

- Modelo abliterado: la supresion de la direccion de rechazo reduce el rechazo a niveles minimos (HarmBench 1,3%), lo que implica riesgo elevado de generar contenido danino si no se aplican filtros externos. No apto para produccion sin capa de moderacion.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; la cuantizacion a 4 bits en expertos puede incrementar la degradacion en tareas de conocimiento.
- Idiomas soportados no documentados: no hay garantia de rendimiento multilingue fuera del ingles o chino.
- Restricciones de licencia: qwen-community-1.0 (etiquetada `other`); es necesario revisar el fichero LICENSE para uso comercial, ya que la denominacion "community" suele implicar condiciones adicionales.
- La cuantizacion iQ-MLX deja 72 tensores con min-max simple (sin imatrix), incluidos `embed_tokens`, `lm_head` y 8 expertos que la calibracion nunca enruto (7 en capa 0, 1 en capa 47), lo que puede degradar su comportamiento.
- El pack esta atado a mlx-serve en el commit `431ac5d`; cambios en la libreria pueden romper la compatibilidad.
- Solo para Apple Silicon: no es desplegable en GPU NVIDIA/AMD sin reconversion.
- El repositorio tiene 164 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria.

## Enlaces

- Hugging Face del pack: https://huggingface.co/AinsleyMarkov/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-iQ-MLX-4.7bpw
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack de referencia ddalcu: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw
- Empaquetado alternativo na0fu3y: https://huggingface.co/na0fu3y/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-iQ-MLX-4.7bpw
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
- Runtime MLX para Qwen3.8-Flash-Next: https://github.com/PipeNetwork/qwen38-flash-next-mlx
- Repositorio oficial Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog runbook GGUF y MLX: https://www.orcarouter.ai/blog/qwen3-8-flash-next-uncensored
