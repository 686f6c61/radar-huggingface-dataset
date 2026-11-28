# prithivMLmods/Qwen3.8-27B-pi-adapted-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-GGUF es una cuantizacion en formato GGUF del checkpoint fusionado Qwen3.8-27B-pi-adapted-bf16, que a su vez resulta de integrar un adaptador LoRA (r = 32, alpha = 64) sobre el modelo base Qwen/Qwen3.8-27B. El adaptador fue entrenado mediante aprendizaje por refuerzo AsyncGRPO en entornos Harbor/OpenEnv para convertir el modelo en la columna vertebral del agente de programacion pi, orientado a tareas de ingenieria de software y de terminal. La publicacion corre a cargo de prithivMLmods, que realiza la cuantizacion con llama.cpp.

El modelo resuelve el problema de desplegar un agente de codificacion especializado en entornos sin soporte de LoRA: al fusionar el adaptador en los pesos (actualizacion estandar W + (alpha/r)·B@A en fp32 y posterior conversion a BF16), el checkpoint es autonomo y funciona en cualquier motor de inferencia. La cuantizacion GGUF anade ademas la posibilidad de ejecucion local eficiente, con ficheros que van de 15,8 GB (Q4_K_S) a 19,6 GB (Q5_K_M), e incluye la proyeccion multimodal mmproj en BF16 para conservar las capacidades de vision.

La relevancia actual del modelo radica en dos factores: por un lado, el adaptador declara mejoras notables en benchmarks de agentes (Terminal-Bench 2.1 de 39,5% a 55,8% y SWE-bench Pro hard 51 de 29,4% a 62,7%, con un 62% y un 55% menos de llamadas a herramientas por tarea, segun la model card del adaptador); por otro, los ficheros GGUF incorporan cabeceras de prediccion multi-token (MTP) que habilitan decodificacion especulativa sin modelo borrador separado. El modelo tiene 27.320.697.856 parametros y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B, con cabeceras MTP para decodificacion especulativa; adaptador LoRA fusionado |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S; proyeccion multimodal mmproj en BF16; checkpoint original en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base fusionado se distribuye en BF16/safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de tipo image-text-to-text. Sobre el se entreno un adaptador LoRA con r = 32 y alpha = 64 aplicado a las proyecciones q, k, v, o, gate, up y down. El entrenamiento uso aprendizaje por refuerzo AsyncGRPO en entornos Harbor/OpenEnv, con los datasets harness-hub/scale800-harbor y harness-hub/termgrade-train-harbor, y con el modo de pensamiento (thinking) desactivado, tal como se emplea en produccion. El objetivo era especializar el modelo como backbone del agente de codificacion pi en tareas de ingenieria de software y de terminal.

La fusion del adaptador se realizo tensor a tensor en fp32 con la formula W + (alpha/r)·B@A y posterior casteo a BF16, preservando la disposicion de shards, los nombres de tensores y todos los tensores MTP del modelo base. La cuantizacion GGUF se genero con llama.cpp. La innovacion tecnica mas destacable es la integracion de prediccion multi-token (MTP) directamente en los pesos: los ficheros incluyen cabeceras adicionales que predicen varios tokens futuros en una sola pasada, lo que permite decodificacion especulativa sin necesidad de un modelo borrador externo y acelera la inferencia local.

## Capacidades

- Generacion de texto y razonamiento general sobre el modelo base Qwen3.8-27B.
- Generacion y edicion de codigo, con especializacion en tareas de ingenieria de software (resolucion de issues, parcheo de repositorios).
- Ejecucion y razonamiento sobre tareas de terminal y linea de comandos.
- Soporte multimodal image-text-to-text mediante la proyeccion mmproj incluida en el repositorio.
- Uso como agente con llamadas a herramientas (tool calling) dentro del harness pi; el adaptador reduce el numero de llamadas por tarea entre un 55% y un 62% segun la model card.
- Razonamiento multi-paso orientado a agentes, entrenado con RL en entornos Harbor/OpenEnv.
- Decodificacion especulativa nativa mediante cabeceras MTP.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Agente de codificacion autonomo: el modelo puede integrarse como backbone de un agente tipo pi para resolver issues de repositorios, generar parches y validarlos, aprovechando su entrenamiento especifico en SWE-bench Pro y la reduccion de llamadas a herramientas.
- Automatizacion de tareas de terminal: ejecucion de comandos, diagnostico de errores de shell y reparacion de entornos, gracias al entrenamiento en tareas de terminal y a la mejora declarada en Terminal-Bench 2.1.
- Asistente de CI/CD: el modelo puede analizar fallos de pipelines, proponer correcciones y aplicar cambios en el repositorio mediante tool calling dentro de un flujo automatizado.
- Revision de codigo asistida: analisis de diffs y deteccion de problemas en pull requests, con la ventaja de un contexto multimodal que permite adjuntar capturas de pantalla de errores o diagramas.
- Despliegue local en estaciones de trabajo: los ficheros Q4_K_S (15,8 GB) y Q4_K_M (17 GB) permiten ejecutar el modelo en GPU de consumo con llama.cpp, manteniendo capacidades de agente para desarrollo offline.
- Soporte tecnico con capturas de pantalla: al ser image-text-to-text, puede interpretar imagenes de interfaces o mensajes de error y responder con instrucciones o comandos concretos.
- Prototipado de agentes en entornos simulados: el modelo sirve para experimentar con politicas de agente en Harbor/OpenEnv antes de desplegar en produccion.

## Benchmarks y rendimiento

Los datos disponibles corresponden al adaptador evaluado sobre el modelo base en BF16, no al checkpoint fusionado ni a las cuantizaciones GGUF de este repositorio.

| Benchmark | Base (segun model card del adaptador) | Con adaptador pi | Observaciones |
|---|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% | 62% menos llamadas a herramientas por tarea |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% | 55% menos llamadas a herramientas por tarea |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni reevaluaciones sobre el checkpoint fusionado o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-17 GB para Q4_K_S, 17-18 GB para Q4_K_M, 19-20 GB para Q5_K_S y 20-21 GB para Q5_K_M, mas el espacio de contexto y la proyeccion mmproj (931 MB) si se usa vision.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegues de produccion; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso local con cuantizaciones Q4 y Q5.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB de VRAM usando Q4_K_M o Q5_K_M; en tarjetas de 16 GB solo con cuantizaciones mas agresivas no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y otros motores compatibles con GGUF; el modelo base fusionado en BF16 puede servirse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP deberia reducir la latencia frente a una decodificacion autoregresiva estandar, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-GGUF | 27,3B | no disponible | Agente de codigo y terminal, multimodal, MTP | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.8-27B (base) | no disponible en la informacion | no disponible | Modelo general multimodal | no disponible en la informacion | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,3B (base + LoRA) | no disponible | Agente pi con adaptador LoRA | Apache 2.0 | Requiere soporte de LoRA en el motor |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Los benchmarks declarados (Terminal-Bench 2.1 y SWE-bench Pro) se midieron sobre el adaptador con el modelo base en BF16; no se han reevaluado sobre el checkpoint fusionado ni sobre las cuantizaciones GGUF, por lo que el rendimiento real puede diferir.
- La cuantizacion Q4 y Q5 introduce perdida de precision respecto a BF16, con impacto potencial en tareas de agente que requieren razonamiento preciso.
- El modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en la generacion de comandos de terminal o parches de codigo que deben validarse antes de ejecutar en produccion.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion detallada de los datos de entrenamiento del adaptador.
- El modo de pensamiento (thinking) se entreno desactivado; activarlo puede degradar el comportamiento esperado del agente.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B antes de un uso comercial.
- La longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-pi-adapted-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
