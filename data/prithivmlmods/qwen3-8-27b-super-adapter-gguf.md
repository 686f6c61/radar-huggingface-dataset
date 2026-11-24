# prithivMLmods/Qwen3.8-27B-super-adapter-GGUF

## Resumen

Qwen3.8-27B-super-adapter-GGUF es una cuantizacion en formato GGUF del checkpoint fusionado `harness-hub/Qwen3.8-27B-super-adapter`, publicado por el usuario prithivMLmods. El checkpoint original se construye fusionando mediante LoRA un "super-adapter" sobre el modelo base `Qwen/Qwen3.8-27B`, de modo que el resultado puede servirse en cualquier motor de inferencia sin soporte nativo de adaptadores LoRA. El modelo cuenta con 27.320.697.856 parametros totales y esta orientado a tareas de ingenieria de software y uso de terminal dentro de entornos Harbor/OpenEnv.

La relevancia de esta version GGUF radica en que incorpora soporte de Multi-Token Prediction (MTP) para decodificacion especulativa integrada en los propios pesos, lo que permite acelerar la inferencia local sin necesidad de un modelo borrador separado. Ademas, el pipeline declarado es `image-text-to-text`, e incluye un fichero de proyeccion multimodal (`mmproj-bf16.gguf`) para capacidades de vision. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

El modelo esta pensado para agentes que resuelven tareas de software: edicion de codigo, ejecucion de comandos de terminal y razonamiento multi-paso con llamadas a herramientas. Segun la model card del adaptador original, con el modo thinking activado mejora el pass@1 en SWE-bench Pro y Terminal-Bench 2.1, reduciendo el numero de llamadas a herramientas por tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con cabezas MTP para decodificacion especulativa y proyeccion multimodal para vision |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q8_0, mmproj-bf16 (vision) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 101.4 GB; ficheros individuales de 15.8 GB a 29 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B` y se construye fusionando un super-adapter LoRA sobre el modelo base. La fusion se realiza concatenando (`combination_type="cat"`) tres adaptadores especialistas entrenados con AsyncGRPO para pi, Hermes Agent y OpenCode en entornos Harbor/OpenEnv sobre tareas de ingenieria de software y terminal. El rango resultante es 96 (3 x 32), con peso de 1/2 en cada uno de los tensores q, k, v, o, gate, up y down. La actualizacion se aplica por tensor en fp32 con la formula estandar `W + (alpha/r)·B@A` y se vuelve a convertir a BF16, preservando el layout de shards, los nombres de tensores y todos los tensores MTP del modelo base.

No se realizo entrenamiento adicional durante la fusion. Los datasets citados en la model card son `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`. La innovacion tecnica destacable es la integracion de Multi-Token Prediction (MTP) dentro de los pesos GGUF: a diferencia de la decodificacion especulativa clasica, que requiere un modelo borrador independiente, aqui se anaden cabezas de salida que predicen varios tokens futuros en una sola pasada. La cuantizacion se realizo con llama.cpp.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de ingenieria de software.
- Edicion de codigo y resolucion de problemas en repositorios (SWE-bench Pro en la evaluacion del adaptador).
- Ejecucion y razonamiento sobre comandos de terminal (Terminal-Bench 2.1 en la evaluacion del adaptador).
- Soporte de tool calling y uso de agentes en entornos Harbor/OpenEnv.
- Modo thinking con nivel `xhigh` recomendado por el autor.
- Capacidades de vision mediante el fichero `mmproj-bf16.gguf` (pipeline image-text-to-text).
- Decodificacion especulativa acelerada mediante MTP integrado.
- Capacidades multilingues limitadas al ingles segun la declaracion del autor.

## Casos de uso

- Agente de resolucion de issues en repositorios: el modelo puede recibir un issue, inspeccionar el codigo, aplicar parches y ejecutar tests en un bucle agentico, apoyandose en su entrenamiento con GRPO sobre tareas tipo SWE-bench.
- Automatizacion de operaciones en terminal: interpreta y ejecuta comandos de shell para tareas de administracion, diagnostico o despliegue, con razonamiento multi-paso y reduccion de llamadas a herramientas.
- Integracion en pipelines de CI/CD como agente de correccion: detecta fallos de build o de tests y propone parches, con decodificacion especulativa MTP para reducir latencia en inferencia local.
- Asistente de desarrollo en local con llama.cpp u Ollama: las cuantizaciones Q4_K_M (17 GB) y Q4_K_S (15.8 GB) permiten desplegar el modelo en estaciones de trabajo con GPU de consumo alta gama.
- Analisis de capturas o diagramas junto a codigo: gracias al proyector multimodal puede procesar imagenes (por ejemplo, capturas de errores o diagramas de arquitectura) combinadas con texto.
- Evaluacion de agentes en entornos simulados: util como modelo de referencia en benchmarks de agentes tipo Harbor/OpenEnv y en investigacion sobre entrenamiento con AsyncGRPO.

## Benchmarks y rendimiento

Los datos disponibles corresponden al adaptador evaluado sobre el modelo base BF16, no a este checkpoint fusionado. La model card indica que no se han reevaluado sobre el checkpoint fusionado.

| Benchmark | Thinking off (adaptador) | Thinking on (adaptador) |
|---|---|---|
| Pass@1 medio en pi, Hermes Agent y OpenCode (SWE-bench Pro hard 51 y Terminal-Bench 2.1) | 39.5% | 63.5% |
| Reduccion de llamadas a herramientas por tarea | 53-73% | 19-48% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB para Q4_K_S (15.8 GB de fichero), 17-19 GB para Q4_K_M (17 GB), 19-21 GB para Q5_K_S y Q5_K_M, y 29-31 GB para Q8_0, mas el proyector de vision (931 MB) si se usa.
- GPU recomendadas: A100 o H100 para Q8_0 y despliegues de produccion; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M y Q4_K_S.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas para las cuantizaciones Q4 y Q5; Q8_0 requiere 32 GB o mas.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, y motores compatibles con GGUF; el autor etiqueta tambien text-generation-inference y transformers, aunque el formato principal es GGUF.
- Latencia y throughput: no disponible; el soporte MTP de decodificacion especulativa esta disenado para acelerar la inferencia local, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter-GGUF | 27.3B | no disponible | Apache 2.0 | GGUF | Especializado en agentes de software y terminal, con MTP y vision |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | no disponible | safetensors | Modelo base sin el super-adapter; sin entrenamiento especifico de agentes |
| harness-hub/Qwen3.8-27B-super-adapter (bf16) | 27.3B | no disponible | Apache 2.0 | safetensors (BF16) | Checkpoint original fusionado; requiere motores sin soporte LoRA |
| Adaptadores individuales (pi, Hermes Agent, OpenCode) | no disponible | no disponible | no disponible | LoRA | Especialistas separados; requieren soporte LoRA en el motor |

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Los benchmarks citados corresponden al adaptador sobre el modelo base BF16 y no se han reevaluado sobre este checkpoint fusionado.
- La fusion por concatenacion de adaptadores puede introducir interferencias entre especialistas; no se documenta una validacion independiente del checkpoint fusionado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo y comandos de terminal con efectos reales.
- No se especifica la longitud de contexto, lo que dificulta planificar despliegues con ventanas largas.
- El uso de MTP para decodificacion especulativa depende del soporte del motor de inferencia; no todos los backends lo aprovecharan.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B y de los datasets de entrenamiento antes de un uso comercial.
- El repo ocupa 101.4 GB; el almacenamiento y la transferencia de los ficheros deben planificarse.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-GGUF
- Modelo base del checkpoint: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter.Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter.Q8_0.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter.mmproj-bf16.gguf
