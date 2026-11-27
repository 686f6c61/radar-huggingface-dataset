# 3SENN/atelier-decisions

## Resumen

Atelier-decisions es un repositorio que agrupa tres modelos pequenos de decision disenados para el navegador open source Atelier. No se trata de un unico modelo de lenguaje generativo, sino de una familia de clasificadores y decisores destilados que responden preguntas concretas del navegador en local: si hay una respuesta pendiente, si un clic compra o borra algo, si una entrada es una busqueda o una pregunta, o que habilidad encaja mejor. El objetivo es que esas decisiones rapidas se tomen en el dispositivo del usuario sin enviar datos a ningun servidor.

La familia se compone de tres piezas. `atelier-nano` es un encoder mmBERT-small de 22 capas, cuantizado a int8 ONNX con tabla de embeddings de 4 bits (54 MB, unos 10 ms por pregunta en CPU convencional). `atelier-mini` es un modelo derivado de Qwen3.5-2B (y Qwen3.5-0.8B en versiones anteriores) con atencion no causal y una readout de 255 codigos, empaquetado como GGUF para llama.cpp (1,3 GB, 0,33-0,71 s por pregunta). `atelier-step` reutiliza el encoder de nano con tres cabezas para resolver un paso de navegador en una sola pasada (clic, escritura, fin o bloqueo).

El interes actual reside en su enfoque de destilacion desde el decider propietario de Perplexity (`pplx-decider-flash-v1.3`) y en su diseno para ejecucion en CPU sin GPU, con licencia Apache 2.0 y pesos en ONNX y GGUF. Los parametros totales declarados en safetensors son 1.881.825.088, lo que corresponde al componente mini basado en Qwen3.5-2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-small, 22 capas) para nano y step; Qwen3.5-2B con atencion no causal y readout de 255 codigos para mini |
| Parametros totales | 1.881.825.088 (safetensors, componente mini) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ONNX con embeddings de 4 bits (nano y step); GGUF Q5_K_M con embeddings de 4 bits (mini) |
| Idiomas soportados | multilingual, en, nl, de, fr, es |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (nano, step), GGUF (mini), safetensors y PyTorch (checkpoints de entrenamiento) |

## Arquitectura y entrenamiento

`atelier-nano` parte de mmBERT-small, un encoder de 22 capas, y se distribuye como ONNX int8 con tabla de embeddings de 4 bits. `atelier-step` reutiliza ese mismo encoder y anade tres cabezas que responden en una pasada: accion (clic, escritura, fin o bloqueo), control objetivo y asignacion de valores nombrados por el planificador a cada campo. `atelier-mini` se construye sobre Qwen3.5-2B (v0.6; Qwen3.5-0.8B en v0.4 y v0.5) pero se lee con atencion no causal y una readout de 255 codigos, es decir, se adapta el modelo generativo a un formato de decision cerrado. Se empaqueta como GGUF para llama.cpp.

El entrenamiento combina destilacion desde el decider propietario de Perplexity (`pplx-decider-flash-v1.3`, contrastado con `pplx-decider-v1.3`) y preguntas numericas, de seguridad y de reglas cuyas respuestas se calculan o se conocen por construccion. Los datasets citados incluyen AmazonScience/massive, allenai/WildChat-1M, osunlp/Mind2Web, glaiveai/glaive-function-calling-v2, google/Synthetic-Persona-Chat, knowledgator/gliclass-v2.0 y MoritzLaurer/synthetic_zeroshot_mixtral_v0.1. `atelier-step` aprendio de acciones registradas de Mind2Web y de flujos generados en cinco idiomas, con respuestas conocidas por construccion. No se detalla el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion y decision de texto en formato de peticion propio de Atelier (no texto libre), orientado a preguntas cerradas del navegador.
- Decisiones de intencion: distinguir busqueda de pregunta, detectar respuesta pendiente, evaluar si un clic compra o borra.
- Asignacion de habilidad o skill a una tarea del navegador.
- Respuesta a preguntas numericas, de seguridad y de reglas con respuestas calculadas o conocidas por construccion.
- `atelier-step`: resolucion de un paso de navegador en una pasada (accion, control y valores de formulario).
- Soporte multilingue en en, nl, de, fr y es, ademas de la etiqueta multilingual.
- Ejecucion en dispositivo (on-device) sin envio de datos a servidores.
- No se documenta soporte de tool calling generico, agentes multi-paso ni vision o audio.

## Casos de uso

- Clasificacion de intencion en navegador: decidir si la entrada del usuario es una busqueda o una pregunta, con `atelier-nano` a unos 10 ms por consulta en CPU, adecuado para ejecutarse en cada interaccion sin latencia perceptible.
- Deteccion de respuestas pendientes: identificar si hay una respuesta esperando al usuario en una conversacion, integrado en el bucle de la interfaz de Atelier.
- Seguridad de acciones: evaluar si un clic implicaria una compra o un borrado antes de ejecutarlo, usando `atelier-mini` cuando nano declina o duda.
- Rellenado de formularios y tareas tipo "order this" o "fill in this form": `atelier-step` resuelve en una pasada la accion, el control y el valor de cada campo, con un modelo de lenguaje como respaldo para lo que no tenga claro.
- Enrutado de habilidades (skill routing): asignar la habilidad adecuada a una tarea del navegador entre las disponibles, apoyandose en el formato de decision del modelo.
- Filtrado de seguridad y reglas en local: comprobaciones de remitentes sospechosos o fidelidad de resumenes, siempre con la regla de Atelier como red de seguridad cuando el modelo no es fiable.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con ONNX Runtime o llama.cpp, encaja en equipos de usuario final y en entornos restringidos donde no se permite enviar datos fuera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de rendimiento reportados son operativos:

| Metrica | atelier-nano | atelier-mini (v0.6) | atelier-step |
|---|---|---|---|
| Tamano | 54 MB | 1,3 GB (v0.5: 515 MB) | 55 MB |
| Latencia por pregunta/paso | ~10 ms | 0,33-0,71 s (v0.5: 0,14-0,33 s) | ~0,08 s en dos hilos de CPU |
| Hardware | CPU convencional (ONNX Runtime) | CPU (llama.cpp) | CPU (dos hilos) |

Ademas, la model card indica que el mini acierta el 87-89% de las veces cuando decide sobre nuevas clases de preguntas de navegador (81-83% en v0.5), y que es seguro y erroneo en el 5,4% de las preguntas de seguridad (20% sobre fidelidad de resumenes, 10% sobre remitentes similares) y en el 19% de preguntas de reglas de tipos no entrenados.

## Requisitos de hardware

- VRAM: no requiere GPU; los tres modelos estan pensados para CPU.
- GPU recomendadas: no aplica; no se documenta aceleracion por GPU.
- Consumer GPU: irrelevante para el diseno, que prioriza ejecucion en CPU.
- Despliegue: ONNX Runtime para nano y step; llama.cpp (`llama-server`) para mini; el runner de referencia esta en `runtime/node` del repositorio de GitHub.
- Latencia: ~10 ms por pregunta (nano), 0,33-0,71 s (mini v0.6), ~0,08 s por paso en dos hilos (step).
- Almacenamiento: ~1 GB para v0.5 completo, ~2 GB para v0.6; step ocupa 360 MB con su checkpoint.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la informacion proporcionada. Como referencia estructural:

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| atelier-decisions (nano) | Encoder de decision | mmBERT-small, 22 capas | no disponible | apache-2.0 | ONNX int8 |
| atelier-decisions (mini) | Decisor derivado de Qwen3.5-2B | 1.881.825.088 | no disponible | apache-2.0 | GGUF Q5_K_M |
| Qwen3.5-2B (base) | LLM generativo | ~2B | no disponible | no disponible en esta ficha | safetensors/GGUF |
| pplx-decider-flash-v1.3 (profesor) | Decisor propietario | no disponible | no disponible | no disponible | no disponible |

La comparacion de rendimiento con alternativas no esta disponible en la informacion consultada.

## Limitaciones y advertencias

- No es una garantia de seguridad por si solo: el mini es seguro y erroneo en el 5,4% de las preguntas de seguridad (20% en fidelidad de resumen, 10% en remitentes similares) y en el 19% de reglas de tipos no entrenados; Atelier nunca depende solo de el.
- Aritmetica en varios pasos (porcentajes, IVA, division de facturas): el mini declina y delega en la regla.
- Nuevas clases de preguntas de navegador: acierta el 87-89% cuando decide; nano las declina.
- Los modelos leen el formato de peticion propio de Atelier, no texto libre; no son intercambiables con LLM genericos sin adaptacion.
- No se documentan sesgos conocidos ni evaluaciones de alucinacion mas alla de las cifras de seguridad citadas.
- La longitud de contexto no esta disponible, lo que limita su uso en entradas largas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo profesor y de los datasets de destilacion antes de un despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/3SENN/atelier-decisions
- Repositorio GitHub: https://github.com/3SENN/atelier-decisions
- Navegador Atelier: https://github.com/3SENN/atelier
- Modelo profesor: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Modelo profesor de contraste: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
