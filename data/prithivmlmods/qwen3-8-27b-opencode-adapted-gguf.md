# prithivMLmods/Qwen3.8-27B-opencode-adapted-GGUF

## Resumen

Qwen3.8-27B-opencode-adapted-GGUF es una coleccion de cuantizaciones GGUF del checkpoint fusionado Qwen3.8-27B-opencode-adapted, publicado por el usuario prithivMLmods (prithivMLmods) sobre el modelo base harness-hub/Qwen3.8-27B-opencode-adapted. El modelo parte de Qwen/Qwen3.8-27B y le incorpora, mediante la fusion de un adaptador LoRA (r = 32, alpha = 64, aplicado a las proyecciones q, k, v, o, gate, up y down), un ajuste de reinforcement learning con AsyncGRPO en entornos Harbor/OpenEnv orientado a tareas de ingenieria de software y terminal como columna vertebral del agente de codigo OpenCode.

El resultado es un modelo denso de 27.320.697.856 parametros (27,3 mil millones), licencia Apache 2.0, con soporte multimodal imagen-texto (incluye un fichero de proyeccion mmproj en BF16) y una extension de Multi-Token Prediction (MTP) que integra decodificacion especulativa dentro de los propios pesos del modelo, sin necesidad de un modelo borrador separado.

Su relevancia practica es doble: por un lado, el adaptador original reporta mejoras sustanciales en tareas de agente de codigo (SWE-bench Pro hard 51 de 35,3% a 51,0% y Terminal-Bench 2.1 de 46,4% a 52,4%), con un cuarto a la mitad de turnos y entre 6 y 8 veces menos tokens generados por tarea; por otro, esta publicacion GGUF permite ejecutar ese comportamiento en llama.cpp, con tamanos que van de 15,8 GB (Q4_K_S) a 29 GB (Q8_0), lo que lo hace desplegable en hardware de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.8-27B) con cabezas de Multi-Token Prediction (MTP) para decodificacion especulativa; fusion de adaptador LoRA (r = 32, alpha = 64) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q8_0; proyeccion multimodal mmproj en BF16; checkpoint base en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base tambien existe en BF16 safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27,3 mil millones de parametros construido sobre Qwen/Qwen3.8-27B. Sobre esa base se entreno un adaptador LoRA con r = 32 y alpha = 64 que afecta a las proyecciones q, k, v, o, gate, up y down. El adaptador se entreno con reinforcement learning AsyncGRPO dentro de entornos Harbor/OpenEnv, con el objetivo de servir de columna vertebral al agente de codigo OpenCode en tareas de ingenieria de software y de terminal, y con el modo de razonamiento (thinking mode) desactivado durante el entrenamiento. La fusion se realiza aplicando la actualizacion estandar W + (alpha/r)·B@A por tensor en fp32 antes de volver a BF16, preservando la disposicion de shards, los nombres de tensores y todos los tensores MTP del modelo original.

La innovacion tecnica mas destacable es la extension MTP en formato GGUF: los ficheros incluyen cabezas de prediccion de multiples tokens futuros dentro de la propia arquitectura, de modo que la decodificacion especulativa queda integrada en los pesos y no requiere un modelo borrador externo. Esto acelera la inferencia local en llama.cpp manteniendo la calidad del modelo completo. Ademas, el repositorio incluye un fichero mmproj-bf16.gguf (931 MB) que habilita las capacidades de vision del modelo en el pipeline image-text-to-text.

## Capacidades

- Generacion de texto y razonamiento en ingles, con modo de pensamiento desactivado por defecto segun el entrenamiento del adaptador.
- Codificacion y tareas de ingenieria de software: resolucion de issues, parcheo de repositorios y trabajo en entornos de terminal.
- Uso como agente de codigo multi-paso (OpenCode) con reduccion de turnos y de tokens generados por tarea.
- Capacidades multimodales imagen-texto mediante el fichero de proyeccion mmproj (pipeline image-text-to-text).
- Decodificacion especulativa integrada mediante cabezas MTP, sin modelo borrador separado.
- Soporte de tool calling y function calling heredado del modelo base Qwen3.8 (no detallado en la informacion proporcionada).
- Integracion con llama.cpp (llama-cli) y con text-generation-inference segun los tags del repositorio.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Agente de codigo autonomo en terminal: el modelo esta entrenado especificamente para tareas de terminal y software engineering en OpenCode, por lo que puede encadenar comandos, inspeccionar repositorios y aplicar parches con menos turnos que el modelo base.
- Resolucion de issues en repositorios reales: adecuado para flujos tipo SWE-bench, donde el modelo debe localizar el fallo, editar ficheros y validar el cambio; el adaptador reporta una mejora de 35,3% a 51,0% en SWE-bench Pro hard 51.
- Automatizacion de CI/CD con agentes: al soportar tool calling y desplegarse en llama.cpp, puede integrarse en pipelines que invocan herramientas de build, test y lint de forma iterativa.
- Asistente de programacion en local con privacidad: la cuantizacion Q4_K_M (17 GB) permite ejecutar el modelo en una estacion de trabajo con GPU de consumo, sin enviar codigo a servicios externos.
- Revision de codigo asistida por imagen: gracias al fichero mmproj, puede analizar capturas de pantalla de errores, diagramas o interfaces junto con el codigo asociado.
- Prototipado de agentes de investigacion: los tags harbor, openenv y async-grpo indican que el modelo sirve como banco de pruebas para entornos de agente y RL, util para experimentar con politicas de accion en tareas de software.
- Despliegue en servidores de inferencia: con text-generation-inference y llama.cpp como backends declarados, encaja en servicios de generacion de codigo con throughput alto gracias a la decodificacion especulativa MTP.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al adaptador original evaluado sobre el modelo base BF16, no sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF.

| Benchmark | Modelo base (BF16) | Con adaptador | Variacion |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% | +15,7 puntos |
| Terminal-Bench 2.1 | 46,4% | 52,4% | +6,0 puntos |
| Turnos por tarea | Referencia | 1/4 a 1/2 de los turnos | Reduccion |
| Tokens generados por tarea | Referencia | 6-8 veces menos | Reduccion |

El autor indica explicitamente que estas cifras no se han reevaluado sobre el checkpoint fusionado ni sobre los ficheros GGUF. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,8 GB (Q4_K_S), 17 GB (Q4_K_M), 19 GB (Q5_K_S), 19,6 GB (Q5_K_M) y 29 GB (Q8_0) solo para los pesos; anadir margen para el contexto KV y, si se usa vision, el fichero mmproj de 931 MB.
- GPU recomendadas: A100 40/80 GB y H100 para Q8_0 con contexto largo y concurrencia; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 (24 GB) como alternativa de consumo para Q4 y Q5.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizaciones Q4_K_M o Q5_K_M; Q8_0 requiere 32 GB o mas o bien descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) con soporte MTP, text-generation-inference y transformers segun los tags del repositorio; Ollama y vLLM no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles; la decodificacion especulativa MTP deberia reducir la latencia por token frente a un GGUF convencional del mismo tamano, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-GGUF | 27,3 B | No disponible | Agente de codigo y terminal (OpenCode), multimodal, MTP | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27,3 B | No disponible | Modelo generalista | Apache 2.0 | Safetensors, GGUF de terceros |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,3 B | No disponible | Adaptador LoRA para OpenCode sobre la base | Apache 2.0 | LoRA (requiere motor con soporte de adaptadores) |

La comparativa se limita a las variantes del mismo linaje porque la informacion proporcionada no incluye datos de benchmarks frente a modelos de otros autores. No disponible para alternativas externas.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Las cifras de SWE-bench Pro y Terminal-Bench 2.1 corresponden al adaptador sobre el modelo base BF16 y no se han reevaluado en el checkpoint fusionado ni en las cuantizaciones GGUF; la degradacion por cuantizacion no esta medida.
- El modo de pensamiento (thinking mode) esta desactivado por diseno; no se documenta el comportamiento si se activa.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar tareas de repositorio grande con garantias.
- Al ser un modelo de codigo y agentes, existe riesgo de alucinacion en APIs, nombres de funciones y comandos de terminal; conviene validar toda salida ejecutable antes de aplicarla.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el mantenimiento depende de un publicador individual (prithivMLmods) sobre un modelo base de terceros.
- El repositorio ocupa 101,4 GB, por lo que la descarga completa de todas las cuantizaciones es costosa; conviene bajar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Qwen3.8-27B-opencode-adapted-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
