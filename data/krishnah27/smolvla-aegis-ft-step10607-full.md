# krishnah27/smolvla-aegis-ft-step10607-full

## Resumen

`krishnah27/smolvla-aegis-ft-step10607-full` es un checkpoint de pesos completos derivado de SmolVLA, un modelo de vision-lenguaje-accion (VLA) orientado al control de robots. Lo publica el usuario krishnah27 como parte de la serie "AEGIS", que segun los repositorios relacionados es un ajuste fino (fine-tune) tipo "burst" sobre SmolVLA-500M, con LoRA de rango 16 aplicado al componente de vision-lenguaje y un experto de accion entrenado por completo.

El modelo resuelve el problema de convertir observaciones visuales y una instruccion en lenguaje natural en acciones de robot, es decir, actua como politica (policy) de control en lugar de como modelo conversacional. Su relevancia radica en que los modelos VLA habituales son muy grandes (frecuentemente de miles de millones de parametros), mientras que esta variante se mantiene en el rango de los 450 millones de parametros, lo que reduce los requisitos de computo para despliegue en robotica.

Tecnicamente es un checkpoint "self-contained": los adaptadores LoRA r16/a32 se han fusionado sobre el paso de entrenamiento 917 y el resultado se ha verificado en precision bf16, de modo que no requiere cargar rutas de PEFT ni adaptadores separados. El repositorio ocupa 0,9 GB y contiene pesos en formato safetensors con 450.046.176 parametros totales. No se dispone de licencia, idiomas ni pipeline declarados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; backbone de vision-lenguaje mas experto de accion con flow matching (detalle interno del backbone no disponible) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en bf16 (safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16; LoRA r16/a32 fusionado sobre el paso 917) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo VLA de la familia SmolVLA, cuyo articulo de referencia es "SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics" (arXiv:2506.01844). La model card del repositorio describe un checkpoint de pesos completos en el que se ha fusionado un adaptador LoRA de rango 16 y alpha 32 sobre el paso de entrenamiento 917, con verificacion de que el resultado mantiene la precision bf16. El repositorio hermano `krishnah27/smolvla-aegis-ft` lo describe como un "AEGIS SmolVLA-500M burst fine-tune (LoRA r=16 on VLM, full flow expert)", lo que sugiere que el ajuste afecta a la parte de vision-lenguaje mediante LoRA mientras que el experto de flujo (flow matching) se entrena de forma completa.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales (decodificacion especulativa, atencion lineal u otras) mas alla de las propias del modelo base SmolVLA. Cualquier detalle sobre la arquitectura interna del backbone, el numero de capas o la dimension de las representaciones debe consultarse en el articulo del modelo base, ya que no aparece en la informacion proporcionada.

## Capacidades

- Generacion de acciones de robot a partir de imagenes de camara e instrucciones en lenguaje natural: el modelo actua como politica de control (vision + lenguaje -> accion).
- Entrada multimodal de vision: la model card menciona el uso con multiples camaras (referencias a `camera1`/`camera2` para la evaluacion en LIBERO), lo que implica soporte de observaciones visuales multiples.
- Ejecucion de tareas de manipulacion guiadas por lenguaje, propio del paradigma VLA.
- Integracion con frameworks de evaluacion de robotica: se indica compatibilidad con el benchmark LIBERO mediante el argumento `--policy.path` y el renombrado de camaras.
- Carga simplificada como pesos completos: al estar fusionado el LoRA, no requiere la ruta de adaptadores de PEFT.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, modo "thinking", vision conversacional, audio u otras capacidades especiales. Al ser un modelo de politica robotica, no debe asumirse que funcione como modelo de chat.

## Casos de uso

- Manipulacion robotica en laboratorio con el benchmark LIBERO: el checkpoint esta pensado explicitamente para evaluacion en LIBERO, cargandolo con `--policy.path` y renombrando las camaras `camera1`/`camera2`. Es el escenario de uso directo documentado por el autor.
- Investigacion en modelos VLA de bajo coste: al mantenerse en ~450 M de parametros, sirve para experimentar con politicas vision-lenguaje-accion en hardware modesto sin recurrir a VLA de miles de millones de parametros.
- Reproduccion de experimentos de ajuste fino: el checkpoint fija un paso concreto (917) y la fusion de LoRA, lo que permite reproducir resultados y comparar con los repositorios hermanos (`smolvla-aegis-ft`, `smolvla-aegis-ft-step10607`).
- Punto de partida para nuevos fine-tunes: al estar en formato safetensors bf16 con pesos completos, se puede continuar el entrenamiento sin gestionar adaptadores PEFT.
- Evaluacion comparativa de estrategias de fusion de LoRA: util para estudiar si fusionar el adaptador sobre los pesos base degrada o preserva el comportamiento de la politica.
- Despliegue de politicas de control en entornos controlados de robotica de investigacion, siempre que se verifiquen previamente la licencia y el comportamiento en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La referencia a LIBERO en la model card describe un procedimiento de evaluacion, no resultados numericos. No se dispone de cifras de exito, tasas de acierto ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 450.046.176 parametros, la carga en bf16 ocupa aproximadamente 0,9 GB de pesos; en fp32 alrededor de 1,8 GB, y en int8 unos 0,45 GB. A estas cifras hay que sumar el consumo de activaciones, buffers de vision y el runtime, por lo que el requisito real de VRAM es superior al tamano de los pesos. No se proporcionan cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es susceptible de ejecutarse en GPUs de gama consumer, aunque no se confirma ningun modelo concreto.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de pesos inferior a 1 GB en bf16, pero no se confirma en la documentacion.
- Opciones de despliegue: la model card menciona evaluacion via LIBERO con `--policy.path`. Segun FastFlowLM, SmolVLA no se ejecuta en los modos estandar de chat de su CLI o servidor, lo que sugiere que las herramientas de inferencia conversacional (tipo chat) no son el canal adecuado. No se confirman opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| krishnah27/smolvla-aegis-ft-step10607-full | 450.046.176 | safetensors (bf16, LoRA fusionado) | VLA (politica robotica) | no disponible | no disponible | HuggingFace |
| krishnah27/smolvla-aegis-ft | no disponible (etiquetado como SmolVLA-500M) | no disponible (PEFT/LoRA r=16) | VLA (politica robotica) | no disponible | no disponible | HuggingFace |
| krishnah27/smolvla-aegis-ft-step10607 | no disponible | no disponible (PEFT/adapter) | VLA (politica robotica) | no disponible | no disponible | HuggingFace |
| SmolVLA (modelo base, Hugging Face) | no disponible | no disponible | VLA (politica robotica) | no disponible | no disponible | HuggingFace / arXiv:2506.01844 |

Los tres checkpoints de la serie AEGIS comparten la misma base (SmolVLA, ~450-500 M) y se diferencian en el formato de publicacion: el presente repositorio entrega pesos completos fusionados, mientras que `smolvla-aegis-ft` y `smolvla-aegis-ft-step10607` se publican con adaptadores PEFT. No se dispone de datos de rendimiento para comparar objetivamente ninguno de ellos.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Debe aclararse antes de cualquier despliegue en produccion.
- No se documentan idiomas soportados; el comportamiento multilingue es desconocido.
- No hay resultados de benchmarks publicados, por lo que no puede verificarse su calidad frente a otros modelos.
- Es un modelo de politica robotica, no un modelo de lenguaje conversacional; esperar comportamiento de chat o de generacion de texto libre no es adecuado.
- La model card indica que para la evaluacion en LIBERO es necesario renombrar las camaras `camera1`/`camera2`, lo que implica dependencia de una convencion concreta de nombres de entrada y riesgo de errores de integracion si no se respeta.
- Al tratarse de pesos con LoRA fusionado, no se puede desactivar el adaptador en tiempo de inferencia, a diferencia de las variantes PEFT.
- El repositorio tiene 0 descargas y 0 "likes", y la unica verificacion declarada es de precision (bf16), no de comportamiento funcional; el estado de validacion es limitado.
- No se informa sobre sesgos, riesgo de alucinacion ni comportamiento fuera de la distribucion de entrenamiento. Cualquier evaluacion de seguridad en robotica debe realizarse de forma independiente y en entornos controlados.
- La fecha de creacion indicada (2026-10-08) y la ausencia de metadatos adicionales limitan la trazabilidad del entrenamiento (pasos, datos, hiperparametros).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krishnah27/smolvla-aegis-ft-step10607-full
- Repositorio hermano con adaptador PEFT: https://huggingface.co/krishnah27/smolvla-aegis-ft-step10607
- Repositorio base de la serie AEGIS: https://huggingface.co/krishnah27/smolvla-aegis-ft
- Articulo de SmolVLA: https://arxiv.org/abs/2506.01844
- Analisis de la arquitectura de SmolVLA: https://medium.com/@ahabb/anatomy-of-vla-inside-smolvla-424062c65aa4
- Documentacion de SmolVLA en FastFlowLM: https://fastflowlm.com/docs/models/smolvla/
