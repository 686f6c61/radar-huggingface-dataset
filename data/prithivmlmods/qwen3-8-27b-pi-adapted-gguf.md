# prithivMLmods/Qwen3.8-27B-pi-adapted-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-GGUF es una cuantizacion en formato GGUF del checkpoint fusionado harness-hub/Qwen3.8-27B-pi-adapted, publicado por prithivMLmods. El modelo parte de Qwen/Qwen3.8-27B (27.320.697.856 parametros) y le incorpora un adaptador LoRA entrenado con AsyncGRPO en entornos Harbor/OpenEnv para convertir al modelo en el backbone del agente de programacion "pi", orientado a tareas de ingenieria de software y de terminal. La fusion se realizo con la actualizacion estandar W + (alpha/r)·B@A en fp32 por tensor, con r = 32 y alpha = 64 sobre las proyecciones q, k, v, o, gate, up y down.

El interes de esta publicacion es doble. Por un lado, ofrece pesos autónomos que no requieren soporte de LoRA en el motor de inferencia. Por otro, incluye tensores MTP (Multi-Token Prediction) que integran decodificacion especulativa directamente en los pesos, lo que acelera la inferencia local sin necesidad de un modelo draft separado. El repositorio incluye tambien un proyector multimodal mmproj en BF16, coherente con el pipeline image-text-to-text declarado.

La relevancia actual radica en su orientacion a agentes: segun la model card del adaptador, bajo el agente pi eleva Terminal-Bench 2.1 del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7%, con un 62% y un 55% menos de llamadas a herramientas por tarea. Estas cifras se midieron sobre el adaptador con la base BF16 y no se han reevaluado sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con cabezas MTP para decodificacion especulativa y proyector multimodal |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S (mas mmproj-bf16 para vision) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint base fusionado existe en BF16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 27.320.697.856 parametros procedente de Qwen/Qwen3.8-27B, al que se le anaden cabezas de Multi-Token Prediction. Estas cabezas permiten predecir varios tokens futuros en un unico forward pass, de modo que la decodificacion especulativa queda integrada en los propios pesos y no requiere un modelo draft externo. El repositorio conserva el layout de shards, los nombres de tensores y todos los tensores MTP del checkpoint original. Ademas incluye un fichero mmproj-bf16 de 931 MB para las capacidades vision-lenguaje.

El entrenamiento del adaptador se realizo con AsyncGRPO (reinforcement learning) en entornos Harbor/OpenEnv, con LoRA de r = 32 y alpha = 64 aplicado sobre q, k, v, o, gate, up y down, usando los datasets harness-hub/scale800-harbor y harness-hub/termgrade-train-harbor. El objetivo era especializar el modelo como backbone del agente de codigo pi en tareas de software y terminal, con el modo thinking desactivado tal y como se entreno. La fusion del adaptador se hizo en fp32 tensor a tensor y se volvio a convertir a BF16. La cuantizacion a GGUF se realizo con llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento orientado a agentes: ejecucion de tareas de varios pasos en entornos de terminal y software.
- Uso de herramientas (tool calling) como parte del bucle del agente pi.
- Capacidades de imagen-texto (pipeline image-text-to-text, con proyector mmproj en BF16).
- Decodificacion especulativa nativa mediante cabezas MTP, sin modelo draft separado.
- Modo thinking desactivado por defecto, segun la configuracion de entrenamiento.
- Soporte multilingue limitado al ingles (unico idioma declarado).

## Casos de uso

- Agente de programacion autonomo: el modelo puede operar como backbone de un agente tipo pi para resolver issues y tareas de reparacion de codigo, apoyandose en el entrenamiento con RL sobre SWE-bench Pro y su capacidad de tool calling.
- Automatizacion de terminal: ejecucion de secuencias de comandos y tareas de administracion en entornos controlados, donde el modelo decide que comandos lanzar y como interpretar la salida, con menos llamadas a herramientas por tarea segun las cifras del adaptador.
- Integracion en pipelines de CI/CD: revision automatica de parches, generacion de tests y triaje de fallos, desplegable con llama.cpp en infraestructura propia sin dependencia de LoRA.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_S (15,8 GB) y Q4_K_M (17 GB) permiten ejecutar el modelo en GPUs de consumo con VRAM suficiente, manteniendo el modo agente.
- Asistencia sobre capturas o diagramas: gracias al proyector mmproj, el modelo puede recibir imagenes junto con texto, util para interpretar errores en pantalla o documentacion grafica.
- Evaluacion de agentes en entornos simulados: sirve como modelo de referencia para comparar politicas de agente en Harbor/OpenEnv con decodificacion acelerada por MTP.
- Prototipado de asistentes de codigo en ingles: generacion y explicacion de fragmentos de codigo en un unico idioma, adecuado para equipos que trabajan en ingles.

## Benchmarks y rendimiento

Las unicas cifras publicadas corresponden al adaptador sobre la base BF16, no a este checkpoint fusionado ni a las cuantizaciones GGUF.

| Benchmark | Base (segun model card del adaptador) | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |
| Llamadas a herramientas por tarea | referencia | -62% (Terminal-Bench) / -55% (SWE-bench Pro) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB con Q4_K_S (15,8 GB de pesos) y Q4_K_M (17 GB); en torno a 20-21 GB con Q5_K_S (19 GB) y Q5_K_M (19,6 GB), mas overhead de contexto y del proyector mmproj (931 MB) si se usa vision.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para las cuantizaciones Q4 y Q5 en single-GPU.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB para Q4_K_M y Q5_K_M; las variantes Q4_K_S pueden encajar en configuraciones de 20 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo), y por los tags del repositorio, text-generation-inference y endpoints compatibles; el soporte de MTP depende de la version de llama.cpp que lo implemente.
- Latencia y throughput: no disponibles de forma numerica; se espera una aceleracion por la decodificacion especulativa MTP integrada, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Especializado en agente pi, MTP, vision |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | no disponible en la informacion | safetensors/BF16 | Sin especializacion de agente ni MTP |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,3 B | no disponible | no disponible en la informacion | BF16 | Requiere soporte LoRA o fusion previa |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las mejoras de Terminal-Bench 2.1 y SWE-bench Pro se midieron sobre el adaptador con la base BF16; no se han reevaluado en este checkpoint fusionado ni en las cuantizaciones GGUF, por lo que el rendimiento real puede diferir.
- El modelo solo declara soporte de ingles; el uso en castellano u otros idiomas no esta validado.
- El modo thinking esta desactivado, tal como se entreno; no se documenta el comportamiento si se activa.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de agente donde una accion erronea en terminal puede tener consecuencias.
- No se documentan sesgos especificos ni la composicion completa de los datos de entrenamiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B y de los datasets de entrenamiento antes de un uso comercial.
- El soporte de MTP y del proyector multimodal depende de la version del motor de inferencia; en llama.cpp puede requerir compilaciones recientes.
- La longitud de contexto no esta publicada, lo que limita la planificacion de despliegues con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-pi-adapted-GGUF
- Modelo base fusionado: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
