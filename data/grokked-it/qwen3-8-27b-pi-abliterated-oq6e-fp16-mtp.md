# grokked-it/Qwen3.8-27B-pi-abliterated-oQ6e-fp16-mtp

## Resumen

Qwen3.8-27B-pi-abliterated-oQ6e-fp16-mtp es una cuantizacion para Apple Silicon de un modelo de la familia Qwen3.5 (arquitectura `qwen3_5`), publicado por el usuario grokked-it. El punto de partida es `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una version del modelo base a la que se le ha eliminado el comportamiento de rechazo (abliteration), sobre la que se ha fusionado el adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted`, entrenado con aprendizaje por refuerzo para el agente de programacion pi. El checkpoint resultante se ha cuantizado con oMLX 0.8.0 en nivel oQ6e (6 bits mixtos con matriz de importancia).

El modelo conserva el codificador de vision y la cabeza de prediccion multi-token (MTP) del repositorio abliterado, y esta empaquetado en formato MLX/safetensors con un total de 27.781.427.952 parametros y un tamano de repositorio de 24,8 GB. La licencia es Apache-2.0, heredada del modelo base, de los pesos abliterados y del adaptador.

Es relevante para desarrolladores que trabajen en Mac con Apple Silicon y necesiten un modelo multimodal (image-text-to-text) orientado a agentes de codigo, sin filtros de rechazo y con cuantizacion optimizada para el hardware de Apple. Conviene subrayar que no se ha ejecutado ningun benchmark sobre este checkpoint concreto: las cifras del adaptador se midieron sobre el modelo sin cuantizar y sin abliterar, por lo que no son extrapolables directamente a esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (`qwen3_5`), con codificador de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6 bits afines, group size 64, mixta por sensibilidad de capa, 44 tensores elevados a 8 bits); escalas, sesgos y tensores no cuantizados en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 con un codificador de vision acoplado y una cabeza de prediccion multi-token (MTP) para decodificacion especulativa. El proceso de construccion consta de dos fases. Primero se fusiono el adaptador LoRA (rango 32, alpha 64, 256 capas lineales del modelo de lenguaje) sobre los pesos abliterados en BF16 mediante `W' = W + 2 · B · A`, calculado en float32 y almacenado de nuevo en BF16, fragmento a fragmento. El adaptador se entreno sobre los pesos originales de Qwen, no sobre los abliterados; el codificador de vision y la cabeza MTP proceden del repositorio abliterado y, segun su model card, no estan modificados respecto al modelo base.

La segunda fase fue la cuantizacion con oMLX 0.8.0 en nivel oQ6e: precision mixta por sensibilidad de capa, matriz de importancia calculada sobre el conjunto de calibracion `oqe_code_multilingual` (128 muestras de 512 tokens, adaptativo) y refinamiento para codigo. El resultado son 6 bits afines con group size 64, con 44 tensores elevados a 8 bits y un estimado de 6,87 bits efectivos por peso. El tokenizer y la plantilla de chat provienen del repositorio del adaptador. El adaptador original se entreno con aprendizaje por refuerzo para el agente de codigo pi, aunque no se detalla en la informacion disponible la composicion del dataset ni el numero de tokens empleados.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion y completado de codigo, con especializacion declarada hacia tareas de agente de programacion (adaptador pi).
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el codificador de vision incluido.
- Soporte de tool calling / function calling en el formato del modelo base.
- Capacidades de agente y razonamiento multi-paso, segun el entrenamiento RL del adaptador.
- Decodificacion especulativa mediante la cabeza MTP incluida en el checkpoint.
- Comportamiento sin rechazo (abliterated): responde a peticiones que el modelo base declina.
- Modo thinking desactivable mediante `chat_template_kwargs` (`enable_thinking: false`), recomendado por los autores del adaptador.
- Capacidades multilingues: no disponible el detalle de idiomas soportados.

## Casos de uso

- Agente de codigo en local sobre Mac: el adaptador pi esta entrenado especificamente para tareas de agente de programacion, y la cuantizacion oQ6e con refinamiento en codigo permite ejecutarlo en Apple Silicon sin depender de la nube.
- Asistencia de programacion en el IDE: el modelo puede generar y completar codigo y emitir tool calls en el formato del modelo base, integrandose en flujos de edicion asistida con contexto de repositorio.
- Automatizacion de pipelines de CI/CD: con soporte de function calling, puede invocarse como paso de revision, generacion de parches o clasificacion de errores dentro de un runner con hardware Apple.
- Procesamiento de documentacion tecnica con imagenes: al aceptar entrada image-text-to-text, sirve para interpretar diagramas, capturas de pantalla o esquemas junto con texto explicativo.
- Prototipado de agentes multi-paso en estacion de trabajo: la cabeza MTP acelera la decodificacion en MLX, lo que reduce la latencia en bucles de razonamiento con varias llamadas encadenadas.
- Investigacion sobre alineacion y rechazo: la variante abliterada permite estudiar el comportamiento del modelo sin la capa de rechazo, comparandola con el hermano no abliterado `grokked-it/Qwen3.8-27B-pi-oQ6e-fp16-mtp`.
- Despliegue de un asistente multimodal privado en local: al ejecutarse integramente en el equipo, los datos no salen del dispositivo, lo que encaja en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre este checkpoint en la informacion disponible. La model card indica explicitamente que no se ejecuto ningun benchmark y que solo se realizo una prueba de humo en oMLX (una completion de codigo, una llamada a herramienta y dos prompts que el hermano no abliterado rechazo y este modelo respondio). Las cifras del adaptador pi, segun la model card, se midieron sobre el modelo sin cuantizar y sin abliterar, por lo que no son validas para esta version.

## Requisitos de hardware

- VRAM equivalente: el repositorio ocupa 24,8 GB en pesos MLX de 6 bits mixtos; la inferencia requiere memoria unificada suficiente para cargar el checkpoint completo mas el estado de activaciones y cache KV.
- Hardware objetivo: Apple Silicon con memoria unificada; el formato MLX no esta pensado para GPU NVIDIA.
- Encaje en consumer: viable en equipos Apple con 32 GB de memoria unificada o superior; con 24 GB el margen es muy ajustado y puede requerir reducir contexto o usar una cuantizacion menor.
- Opciones de despliegue: oMLX, o cualquier cargador MLX que soporte la arquitectura Qwen3.5. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato es MLX.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| grokked-it/Qwen3.8-27B-pi-abliterated-oQ6e-fp16-mtp | 27,78 B | no disponible | oQ6e, 24,8 GB | Apache-2.0 | Abliterado, adaptador pi fusionado, MLX |
| grokked-it/Qwen3.8-27B-pi-oQ6e-fp16-mtp | no disponible | no disponible | oQ6e | Apache-2.0 | Hermano no abliterado, mismo pipeline |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | BF16 | Apache-2.0 | Pesos abliterados sin adaptador ni cuantizar |
| harness-hub/Qwen3.8-27B-pi-adapted | no disponible | no disponible | adaptador LoRA | Apache-2.0 | Adaptador RL para el agente pi |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha ejecutado ningun benchmark sobre este checkpoint; solo una prueba de humo con cuatro interacciones.
- Dos prompts no miden el grado de completitud de la abliteracion tras la fusion del adaptador.
- La cabeza MTP se entreno contra el backbone original, no contra el adaptado ni el abliterado, lo que puede degradar la calidad de la decodificacion especulativa.
- La fusion redondea a BF16 antes de cuantizar, lo que introduce una perdida adicional respecto al adaptador en precision completa.
- El adaptador se entreno sobre los pesos originales de Qwen, no sobre los abliterados, de modo que la interaccion entre ambas modificaciones no esta caracterizada.
- Riesgo de alucinacion y de sesgos: no documentado en la informacion disponible.
- Idiomas soportados y longitud de contexto: no disponibles.
- El modelo elimina el comportamiento de rechazo y cumplira peticiones que el modelo base declina; el usuario es responsable del uso que haga de el.
- Uso comercial permitido por Apache-2.0, pero conviene verificar las condiciones heredadas del modelo base y de los pesos abliterados en sus respectivas fichas.
- El formato MLX limita el despliegue a ecosistema Apple; no hay indicios de soporte en runtimes de GPU NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grokked-it/Qwen3.8-27B-pi-abliterated-oQ6e-fp16-mtp
- Hermano no abliterado: https://huggingface.co/grokked-it/Qwen3.8-27B-pi-oQ6e-fp16-mtp
- Pesos abliterados de partida: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Adaptador pi: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- oMLX: https://github.com/jundot/omlx
- Agente pi: https://github.com/earendil-works/pi
