# jackcloudman/Leanstral-2603-GGUF

## Resumen

Leanstral-2603 es un agente de código abierto disenado especificamente para Lean 4, el asistente de demostracion formal empleado en matematicas formales y verificacion de software. Lo desarrolla Mistral AI como parte de la familia Mistral Small 4 y combina capacidades multimodales con una arquitectura eficiente de mezcla de expertos (MoE) y atencion latente multi-cabeza (MLA). El repositorio analizado, `jackcloudman/Leanstral-2603-GGUF`, ofrece cuantizaciones GGUF del modelo original para su uso con llama.cpp, con un total de 119 mil millones de parametros y 6,5 mil millones activos por token.

El interes practico de esta ficha reside en que permite ejecutar un modelo de 119B en hardware de consumo mediante cuantizacion agresiva (IQ3_XXS en 45,8 GB) y una matriz de importancia calibrada sobre Lean 4. La ventana de contexto alcanza hasta 1M de tokens, con 256k recomendados, y el tokenizador Tekken maneja un vocabulario de 131.072 tokens. La licencia Apache 2.0 facilita su adopcion comercial, aunque el modelo esta claramente especializado en dominios de prueba formal.

El autor de las cuantizaciones, jackcloudman, ha publicado cuatro variantes (IQ3_XXS, dos Q4_K_M y Q8_0) junto con la matriz de importancia empleada, lo que permite reproducir o generar nuevas cuantizaciones. La model card documenta con detalle la divergencia KL respecto a Q8_0, un dato poco habitual y valioso para evaluar la perdida de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE + MLA (Multi-head Latent Attention), tipo `deepseek2` |
| Parametros totales | 118.972.826.624 (119B) |
| Parametros activos | 6,5B por token |
| Longitud de contexto | Hasta 1M tokens (256k recomendados); RoPE con YaRN factor=128, contexto original 8192 |
| Tipos de cuantizacion | IQ3_XXS, Q4_K_M (estatica y con imatrix), Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base se distribuye en FP8 e4m3 |

Otros datos tecnicos: 128 expertos enrutados mas 1 compartido, 4 activos por token; MLA con `q_lora_rank=1024`, `kv_lora_rank=256`, `qk_rope_head_dim=64`; vocabulario de 131.072 tokens con tokenizador Tekken. Tamano del repositorio: 316,8 GB.

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con atencion latente multi-cabeza, la misma que emplea DeepSeek V3 y que Mistral 4 reutiliza (de ahi el identificador `deepseek2` en GGUF). Con 128 expertos enrutados y uno compartido, y solo 4 activos por token, el modelo activa 6,5B de parametros sobre un total de 119B, lo que reduce el coste computacional por token manteniendo capacidad. La atencion MLA comprime las claves y valores en un espacio latente, lo que disminuye el uso de memoria de la cache KV y hace viable el contexto largo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card del repositorio GGUF tampoco detalla el proceso de entrenamiento del modelo base; unicamente describe la conversion desde pesos FP8 (e4m3) y el proceso de cuantizacion. La innovacion destacable documentada es la matriz de importancia calibrada especificamente sobre Lean 4: aproximadamente 45% de fuentes de Mathlib, 25% de extractos de un desarrollo de pruebas Lean 4 reciente, 5% de *Mathematics in Lean* y 20% de texto general (calibration_datav3), calculada sobre 337 fragmentos de 512 tokens con una perplejidad final de 4,28.

## Capacidades

- Generacion de codigo y pruebas formales en Lean 4, incluyendo tacticas y estructuras de Mathlib.
- Razonamiento matematico formal y verificacion de software.
- Modo de razonamiento configurable mediante `reasoning_effort`: `"high"` activa bloques `[THINK]` para tareas complejas, `"none"` ofrece respuestas directas.
- Capacidades multimodales heredadas de la familia Mistral Small 4 (segun la model card del repositorio GGUF).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: el modelo se describe como "code agent" para Lean 4, lo que implica uso agentico, aunque no se detallan las interfaces concretas.
- Capacidades multilingues: no disponible.
- Contexto largo de hasta 1M de tokens, adecuado para proyectos de prueba extensos.

## Casos de uso

- Asistencia en demostracion formal: el modelo puede generar y completar pruebas en Lean 4 sobre Mathlib, aprovechando la calibracion de la cuantizacion sobre ese corpus para mantener calidad en IQ3_XXS.
- Verificacion de software critico: traducir especificaciones a pruebas Lean 4 que certifiquen propiedades de programas, con la ventaja de un contexto de hasta 256k tokens para manejar modulos completos.
- Integracion en pipelines de CI: ejecutar el modelo con llama-server en un servidor con 2x RTX 4090 para validar automaticamente pull requests que incluyan pruebas formales, a ~34 tokens/s con Q4_K_M.
- Investigacion matematica asistida: explorar lemas y tacticas en proyectos de formalizacion, usando `reasoning_effort="high"` para tareas que requieren cadenas de razonamiento largas.
- Formacion y docencia: generar explicaciones paso a paso de pruebas existentes en *Mathematics in Lean*, con la ventaja de que el modelo puede ejecutarse en hardware de consumo con IQ3_XXS.
- Prototipado en estaciones de trabajo: desplegar la variante IQ3_XXS en 2x RTX 4090 (48 GB) a 8k de contexto para experimentacion interactiva a ~143 tokens/s, sin necesidad de infraestructura en la nube.
- Generacion de cuantizaciones propias: reutilizar la matriz de importancia `Leanstral-2603-lean-v1.imatrix.gguf` con `llama-quantize` para producir variantes Q6_K u otras ajustadas a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente proporciona metricas de divergencia KL de las cuantizaciones respecto a Q8_0:

| Cuantizacion | KLD media (global) | Mathlib | Desarrollo de pruebas Lean | Wikitext | Mismo token top |
|---|---|---|---|---|---|
| Q4_K_M estatica | 0,127 | 0,108 | 0,125 | 0,145 | 87,7% |
| Q4_K_M imatrix generica (control) | 0,103 | 0,093 | 0,099 | 0,116 | 88,9% |
| Q4_K_M imatrix Lean | 0,104 | 0,093 | 0,102 | 0,118 | 88,8% |
| IQ3_XXS imatrix generica (control) | 0,255 | 0,221 | 0,244 | 0,300 | 82,1% |
| IQ3_XXS imatrix Lean | 0,251 | 0,211 | 0,236 | 0,305 | 82,4% |

El error estandar de la KLD media global es de aproximadamente ±0,0015 para Q4_K_M y ±0,0024 para IQ3_XXS. La perplejidad de Q8_0 sobre el texto de prueba es 4,55. El uso de imatrix reduce la divergencia de Q4_K_M en torno a un 18% frente a la cuantizacion estatica. A Q4_K_M, la calibracion Lean y la generica empatan dentro del margen de error; a IQ3_XXS, la calibracion Lean mejora un 5% en Mathlib y un 3% en el texto de pruebas. Estas metricas miden fidelidad respecto a Q8_0, no exito en demostraciones.

Rendimiento medido por el autor:
- 2x RTX 4090 (48 GB VRAM) + 192 GB RAM con Q4_K_M: ~34 tokens/s.
- 2x RTX 4090 con IQ3_XXS completamente en GPU (`-ngl 999 -c 8192`): ~143 tokens/s con prompt corto y peticion unica.

## Requisitos de hardware

- VRAM estimada para inferencia: 45,8 GB (IQ3_XXS), 72,2 GB (Q4_K_M), 126 GB (Q8_0).
- GPU recomendadas: 2x RTX 4090 para IQ3_XXS a 8k de contexto; 2x RTX 4090 mas offload a RAM para Q4_K_M; para Q8_0 se requiere mayor capacidad o particionado entre GPU y RAM.
- Cabe en GPU de consumo: IQ3_XXS si, en 2x RTX 4090, con aproximadamente 1 GB de VRAM libre en la primera GPU, por lo que contextos mayores requieren una tercera GPU u offload a RAM.
- Opciones de despliegue: llama.cpp mediante `llama-server` (recomendado por el autor) o `llama-cli`; compatible con endpoints por el tag `endpoints_compatible`. Se requiere una plantilla de chat que soporte bloques `[THINK]`, descargable del repositorio original.
- Latencia y throughput: ~143 tokens/s con IQ3_XXS en 2x RTX 4090; ~34 tokens/s con Q4_K_M en 2x RTX 4090 + 192 GB RAM.
- Nota: el modelo base se distribuye en FP8 e4m3; las cuantizaciones GGUF son el formato practico para hardware de consumo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para Leanstral-2603 en la informacion proporcionada, por lo que una comparativa de rendimiento con alternativas no es posible sin inventar cifras. La siguiente tabla compara solo caracteristicas verificables:

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|
| Leanstral-2603 (este) | 119B totales, 6,5B activos (MoE+MLA) | Hasta 1M (256k recomendado) | Apache 2.0 | GGUF, FP8 | Lean 4, matematicas formales |
| Mistral Small 4 (familia base) | no disponible en la informacion | no disponible | no disponible | no disponible | Proposito general, multimodal |
| DeepSeek V3 (arquitectura de referencia) | no disponible en la informacion | no disponible | no disponible | no disponible | Proposito general |

Las alternativas especificas para Lean 4 de codigo abierto no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta disenado para Lean 4 y matematicas formales; su rendimiento en tareas generales no esta documentado y podria ser inferior al de modelos de proposito general del mismo tamano.
- Riesgo de alucinacion: como todo modelo generativo, puede producir tacticas o lemas inexistentes en Lean 4; las pruebas generadas deben verificarse con el compilador de Lean.
- La calibracion de la cuantizacion se realizo sobre Q4_K_M, no sobre pesos de precision completa, y `token_embd` y `output` carecen de datos de imatrix (`--process-output` no se uso).
- Un experto enrutado del bloque 18 no se activo nunca durante el texto de calibracion (cobertura del 99,22% en ese bloque), lo que puede afectar a esa region del modelo en las cuantizaciones con imatrix.
- La matriz de importancia no se incluye como parte del texto de calibracion en el repositorio, y las cuantizaciones de control con imatrix generica no estan publicadas.
- Las metricas de divergencia KL se basan en un unico conjunto de prueba y no constituyen un benchmark de exito en demostraciones.
- Idiomas soportados no documentados: no hay confirmacion del rendimiento en castellano u otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base `mistralai/Leanstral-2603` en su repositorio original, ya que esta ficha solo cubre las cuantizaciones GGUF.
- El contexto de 1M tokens es teorico; el autor recomienda 256k y, con IQ3_XXS en 2x RTX 4090, los contextos grandes requieren hardware adicional u offload a RAM.
- Se requiere una plantilla de chat con soporte de bloques `[THINK]`; sin ella, el modo de razonamiento no funciona correctamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jackcloudman/Leanstral-2603-GGUF
- Modelo base: https://huggingface.co/mistralai/Leanstral-2603
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Lean 4: https://github.com/leanprover/lean4
- Mathlib: https://github.com/leanprover-community/mathlib4
- Mathematics in Lean: https://github.com/leanprover-community/mathematics_in_lean
- Calibration_datav3 (texto de calibracion general): https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
