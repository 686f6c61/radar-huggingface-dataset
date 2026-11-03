# mlboydaisuke/litert-gpu-moe-fusion-bug-evidence

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado, sino un conjunto de evidencias de depuracion (logs, scripts de reproduccion y grafos de operaciones) sobre un fallo del delegado GPU de LiteRT. El autor documenta que, cuando la unica consumidora de la operacion personalizada `moe` es una operacion elementwise (concretamente el ADD residual en modelos tipo Qwen3-MoE), ML Drift fusiona esa operacion dentro del kernel `moe` y genera un shader que no compila. El error aparece tanto en WebGPU (WGSL: `var vec4 : vec4<f32><f32>(sum)_final;`) como en Metal (`float4 float4(sum)_final;`).

Las pruebas se ejecutaron el 3 de noviembre de 2026 en un Apple M4 Max con 128 GB de RAM y macOS 27.0 (26A428), usando LiteRT-LM v0.19.0 y una compilacion propia (LiteRT `dcb657e8` + PR #11192 + PR #11188 + ML Drift `76492bb9`). Se comparan dos modelos sinteticos de juguete: un Qwen3-MoE de 2 capas con activacion GELU-tanh exportado con `litert-torch`, y un Qwen3-MoE de 3 capas con SiLU (16 expertos, top-8) generado con la API Tensor de LiteRT.

La relevancia es practica para quien despliegue modelos MoE en GPU mediante LiteRT-LM: el autor aporta una solucion alternativa verificada (`x = (x + moe) + moe * 0`) que elimina los errores de validacion y produce salidas identicas bit a bit a las del backend CPU. El repositorio pesa 0,0 GB y no incluye los ficheros de modelo (160 MB cada uno), aunque el autor indica que pueden compartirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo: repositorio de evidencias de un bug en el delegado GPU de LiteRT (kernel `moe` + fusion de ADD residual) |
| Parametros totales | no disponible (los modelos de prueba son de juguete: hidden 128, 2 y 3 capas) |
| Parametros activos | no disponible (los grafos de prueba usan 8 expertos top-2 y 16 expertos top-8) |
| Longitud de contexto | no disponible (los grafos usan prefill 32 y KV cache 256) |
| Tipos de cuantizacion | no disponible (pesos fp32 y activaciones fp16 en las pruebas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.tflite` y `.litertlm` (modelos de prueba no adjuntos); logs `.err.txt`, `.out.txt`, `.cmd_rc.txt`; scripts `.sh`; JSON de configuracion |

## Arquitectura y entrenamiento

No aplica: no hay entrenamiento ni modelo publicado. El material documenta el grafo alrededor de la operacion `moe` en un modelo Qwen3-MoE: `TOPK_V2 → SUM → DIV → RESHAPE → CUSTOM:moe (7 entradas, opciones {activation silu, hidden_dim 64, model_dim 128, num_active_experts 8, num_experts 16, renormalized_top_weights true, weight_type fp32}) → ADD (residual) → MUL/MEAN (RMSNorm)`. El fallo se produce porque el ADD residual es el unico consumidor de la salida del `moe`, lo que activa la fusion en ML Drift.

El workaround documentado anade un consumidor adicional (`moe * 0`) para impedir la fusion. Con el, WebGPU pasa de 75 errores de validacion a 0 y Metal de exit 2 a exit 0, con salida identica byte a byte a la del backend CPU. Tambien se prueba `--sampler_handles_input=false` (73 errores, sin exito) y el caso GELU-tanh con activaciones fp16, donde Metal falla ademas por incompatibilidad de tipos (`half4` frente a `float4`).

## Capacidades

- Reproduccion del fallo en WebGPU y Metal con LiteRT-LM v0.19.0 y con una compilacion desde fuente.
- Documentacion de nueve ejecuciones en `run_repro.sh` y dos adicionales en `run_repro2.sh`, cada una en su propio proceso con stdin desde `/dev/null`.
- Registro por ejecucion de stderr, stdout, comando exacto, codigo de salida, tiempo de pared, recuento de lineas de error y sha256 del fichero de modelo.
- Grafos de operaciones comparativos: version simple y version con guarda (`graph_around_moe_decode_prefill32.txt`, `graph_around_moe_guarded.txt`).
- Configuraciones de los modelos de prueba en formato HuggingFace (`Qwen3MoeForCausalLM`, hidden 128, vocab 151936).
- Script de construccion de los modelos (`build_tiny.sh`) con y sin `--moe_fusion_guard`.
- Sumas de verificacion de los artefactos (`SHA256SUMS.bundles`).
- No incluye inferencia utilizable: los pesos son aleatorios y la salida es texto sin sentido (token id 0 repetido).

## Casos de uso

- Depuracion del delegado GPU de LiteRT: reproducir el fallo con `run_repro.sh` para confirmar si una version concreta de LiteRT-LM y ML Drift sigue generando shaders invalidos al fusionar el ADD residual en el kernel `moe`.
- Verificacion de parches: comparar el comportamiento de una compilacion con PR #11192 y PR #11188 frente a la version estable v0.19.0 usando los mismos grafos y contar las lineas `Validation error`.
- Validacion de workarounds en produccion: aplicar `x = (x + moe) + moe * 0` en el grafo y comprobar con estos logs que la salida coincide byte a byte con el backend CPU antes de desplegar.
- Integracion en CI de LiteRT: usar los scripts y las sumas sha256 como prueba de regresion que detecte si una actualizacion de ML Drift reintroduce la fusion defectuosa.
- Soporte a portabilidad WebGPU/Metal: identificar diferencias de comportamiento entre ambos backends (WGSL con `vec4<f32>` o `vec4<f16>` frente a Metal con `float4` o `half4`) en el mismo grafo.
- Reporte de errores a mantenedores: adjuntar los ficheros `.err.txt`, `.cmd_rc.txt` y los grafos como evidencia minima reproducible en una incidencia del repositorio de LiteRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos disponibles son de correccion, no de rendimiento:

| Ejecucion | Backend | Errores de validacion | Codigo de salida | Resultado |
|---|---|---|---|---|
| `stock-webgpu-gelu` | WebGPU (v0.19.0) | 483 | 0 | Shader WGSL invalido, 236 tokens id 0 |
| `A-webgpu-fp32` | WebGPU (build A) | 75 | 0 | Shader WGSL invalido, salida `!` x 32 |
| `A-webgpu-fp32_g` | WebGPU (build A, guarda) | 0 | 0 | Identico a CPU |
| `A-metal-fp32` | Metal (build A) | n/a | 2 | `newLibraryWithSource` falla |
| `A-metal-fp32_g` | Metal (build A, guarda) | n/a | 0 | Identico a CPU |
| `A-webgpu-gelu` | WebGPU (build A) | 75 | 0 | Forma `vec4<f16>` |
| `A-metal-gelu` | Metal (build A) | n/a | 2 | Error `half4` frente a `float4` |
| `A-webgpu-fp32-shif` | WebGPU, `--sampler_handles_input=false` | 73 | 0 | Sin mejora |

## Requisitos de hardware

- Entorno de las pruebas: Apple M4 Max con 128 GB de memoria unificada, macOS 27.0 (26A428).
- Los modelos de prueba ocupan 160.429.936 bytes cada uno, dominados por la tabla de embeddings del vocabulario completo de 151.936 tokens.
- No se documentan requisitos de VRAM para GPU discretas; las pruebas son en GPU integrada de Apple mediante los backends WebGPU y Metal.
- Compilacion desde fuente: LiteRT `dcb657e8` con PR #11192 y PR #11188, ML Drift `76492bb9`, LiteRT-LM `dab2e708`; binarios `litert_lm_main` (v0.19.0) y `litert_lm_advanced_main` (build A).
- No se proporcionan datos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. No existen modelos comparables: el repositorio contiene evidencia de depuracion, no un modelo con pesos utilizables.

## Limitaciones y advertencias

- No es un modelo: no debe usarse para inferencia, generacion de texto ni ninguna tarea de NLP.
- Los pesos de los modelos de prueba son aleatorios; las salidas no tienen valor semantico (repeticion del token id 0).
- Los ficheros de modelo (160 MB cada uno) no estan adjuntos; sin ellos los scripts no se pueden ejecutar tal cual.
- Las herramientas invocadas por `build_tiny.sh` no estan incluidas en el repositorio.
- El fallo esta descrito para una version concreta de LiteRT-LM y ML Drift; puede estar corregido o haber cambiado en versiones posteriores.
- Las pruebas se limitan a un unico entorno (Apple M4 Max, macOS 27.0); no hay validacion en GPU NVIDIA, AMD ni en otros sistemas operativos.
- No se especifica licencia, lo que impide determinar las condiciones de reutilizacion del material.
- El repositorio tiene 0 descargas y 0 likes, sin mantenimiento ni comunidad verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlboydaisuke/litert-gpu-moe-fusion-bug-evidence
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
