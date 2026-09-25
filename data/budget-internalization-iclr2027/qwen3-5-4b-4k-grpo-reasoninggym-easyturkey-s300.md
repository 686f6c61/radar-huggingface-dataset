# budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-reasoninggym-easyturkey-s300

## Resumen

El modelo `qwen3.5-4b-4k-grpo-reasoninggym-easyturkey-s300` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, publicado por el usuario `budget-internalization-iclr2027` como parte de un envío anónimo a ICLR 2027. Se trata de un modelo denso de aproximadamente 4.660 millones de parámetros (4.659.865.088 según los pesos en safetensors) entrenado con GRPO sobre tareas generadas proceduralmente por Reasoning Gym, con un presupuesto de generación fijo de 4.096 tokens.

La característica distintiva del entrenamiento es la gestión del presupuesto de tokens: las respuestas que agotan el límite de 4.096 tokens reciben recompensa cero, lo que empuja al modelo a internalizar la restricción y producir cadenas de razonamiento completas dentro de esa cota. El checkpoint publicado corresponde al paso 300 de un entrenamiento de como máximo 3 épocas, con nombre clave `easyturkey`.

El interés actual de esta ficha es doble: por un lado, documenta una técnica concreta de internalización de presupuestos de cómputo en modelos de razonamiento; por otro, sirve como ejemplo de artefacto de investigación anónimo, con cero descargas y cero interacciones en el momento de la consulta, cuyo valor principal es metodológico y reproducible más que de producción. La model card no publica resultados de benchmarks ni detalles de la ventana de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5; detalles especificos (atencion, capas, cabezas) no disponibles |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE en la informacion disponible) |
| Longitud de contexto | No disponible. El sufijo "4k" del nombre hace referencia al presupuesto de generacion de 4.096 tokens, no a la ventana de contexto |
| Tipos de cuantizacion | No especificados en la model card. Los pesos se publican en BF16, por lo que admiten cuantizacion posterior con herramientas estandar (bitsandbytes, GPTQ, AWQ, llama.cpp) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16) |
| Libreria declarada | transformers |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 9,3 GB |
| Modelo base | Qwen/Qwen3.5-4B (relacion: finetune) |
| Version / checkpoint | Paso 300, nombre clave `easyturkey` |
| Fecha de publicacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only denso, y se ajusta mediante GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y funcion de perdida a nivel de token. El optimizador es Adam con schedule de learning rate coseno, pico de 5e-7 y 10 pasos de calentamiento. El lote es de 32 prompts con 8 rollouts por paso, durante 300 pasos, con un maximo de 3 epocas sobre los datos.

Los datos de entrenamiento son tareas de Reasoning Gym, un generador procedural de problemas de razonamiento con respuestas en formato `\boxed{}`. La recompensa proviene de un verificador de tarea que comprueba la respuesta enmarcada en `\boxed{}`. Los prompts se renderizan con la plantilla de chat del modelo base. El elemento tecnico mas relevante es la restriccion de presupuesto: `max_new_tokens` se fija en 4.096 y cualquier respuesta que alcanza ese limite recibe recompensa cero, lo que constituye el mecanismo de internalizacion del presupuesto que da nombre al proyecto. No se documenta en la informacion disponible si hubo fases adicionales de RLHF, DPO u otro ajuste de alineamiento.

## Capacidades

- Razonamiento procedimental: entrenado especificamente sobre tareas de Reasoning Gym, con verificacion de respuesta final en formato `\boxed{}`.
- Generacion de cadenas de razonamiento acotadas: el modelo esta optimizado para producir una respuesta completa dentro de un presupuesto de 4.096 tokens, con penalizacion explicita (recompensa cero) al agotarlo.
- Generacion de texto conversacional: el pipeline declarado es conversacional y la model card incluye uso mediante plantilla de chat.
- Entrada multimodal: la etiqueta `image-text-to-text` del repositorio indica soporte de entrada de imagen y texto, presumiblemente heredado del modelo base; el ajuste fino por GRPO se realizo sobre tareas de texto.
- Tool calling y function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentado explicitamente; el razonamiento multi-paso es plausible por la naturaleza de Reasoning Gym, pero no se confirma en la model card.
- Capacidades multilingues: no disponibles; la unica etapa documentada es en ingles procedimental.

## Casos de uso

- Investigacion sobre internalizacion de presupuestos de computo: el modelo sirve como punto de comparacion para estudiar si un ajuste con GRPO y recompensa cero al agotar presupuesto reduce la longitud media de las cadenas de razonamiento manteniendo la precision. Se usaria midiendo longitud de salida y tasa de acierto del verificador sobre un conjunto de tareas de Reasoning Gym.
- Reproduccion de experimentos de RL: al publicarse el checkpoint del paso 300 junto con la receta (optimizador, learning rate, tamano de lote, numero de pasos), permite reproducir o continuar el entrenamiento desde un punto conocido.
- Razonamiento con latencia acotada: en entornos donde el coste por consulta depende del numero de tokens generados, un modelo que tiende a cerrar su respuesta antes de 4.096 tokens reduce el coste de salida frente a modelos que divagan.
- Evaluacion comparativa de tecnicas de RL: como referencia frente a otros checkpoints del mismo proyecto o a ajustes con presupuestos distintos, para aislar el efecto del limite de generacion.
- Generacion de soluciones paso a paso en dominios formales: tareas aritmeticas, logicas y de manipulacion simbolica del estilo de las generadas por Reasoning Gym, con la respuesta final marcada en `\boxed{}` para su verificacion automatica.
- Base para destilacion o curacion de datos: las cadenas de razonamiento generadas por el modelo pueden filtrarse por correccion (via el verificador) y usarse como datos de entrenamiento supervisado para modelos mas pequenos.
- Prototipado en docencia o laboratorio: con 4,66 mil millones de parametros en BF16, el checkpoint cabe en una GPU de consumo de gama alta, lo que facilita experimentos de razonamiento con RL sin acceso a clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MATH ni metricas propias de Reasoning Gym, ni comparaciones con otros checkpoints del mismo proyecto. Tampoco se especifica la tasa de acierto del verificador sobre el conjunto de entrenamiento o de evaluacion.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros (4,66 mil millones), no datos publicados por el autor.

- Pesos en BF16: aproximadamente 9,3 GB (coincide con el tamano del repositorio). Con cache KV y activaciones, se recomienda un minimo de 12-14 GB de VRAM.
- Pesos en INT8: aproximadamente 4,7 GB; unos 7-9 GB de VRAM en total.
- Pesos en INT4: aproximadamente 2,4 GB; unos 4-5 GB de VRAM en total.
- GPU de consumo: cabe en una RTX 4090 (24 GB) y una RTX 4080 (16 GB) en BF16 sin problemas. En INT4 es viable en tarjetas de 8 GB (RTX 4060, RTX 3070) e incluso de 6 GB con contexto reducido.
- GPU de centro de datos: A100 (40/80 GB), H100 y L40S son sobredimensionadas para el modelo en BF16, pero utiles para servir lotes grandes.
- Opciones de despliegue: transformers (dtype automatico, `device_map="auto"`) y vLLM (`vllm serve <repo>`), ambas documentadas en la model card. llama.cpp, Ollama y TGI no se mencionan, aunque son viables si se generan pesos GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| qwen3.5-4b-4k-grpo-reasoninggym-easyturkey-s300 | 4,66 mil millones | no disponible | Apache 2.0 | Publicado, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la informacion | no disponible | Apache 2.0 | Publicado en HuggingFace |
| Otros checkpoints de RL del mismo proyecto | no disponibles | no disponible | Apache 2.0 | No identificados en la busqueda |

No se han encontrado en la busqueda web modelos comparables de la misma categoria con datos verificables. La busqueda realizada devolvio exclusivamente resultados sobre presupuestos publicos franceses, sin relacion con el modelo.

## Limitaciones y advertencias

- Sesgos: no documentados. Al entrenarse sobre tareas generadas proceduralmente por Reasoning Gym, el modelo puede degradar su comportamiento en dominios conversacionales abiertos respecto al modelo base.
- Alucinacion: el ajuste por RL con verificador puede incentivar la produccion de respuestas finales plausibles sin una cadena de razonamiento valida (reward hacking sobre el formato `\boxed{}`). No se documenta ninguna evaluacion al respecto.
- Sobreajuste al formato: la recompensa depende de un verificador que extrae la respuesta de `\boxed{}`. Prompts fuera de ese formato pueden degradar el rendimiento.
- Restriccion de presupuesto: el modelo esta optimizado para cerrar la respuesta antes de 4.096 tokens. Tareas que requieran cadenas mas largas pueden truncarse con recompensa nula durante el entrenamiento y con respuestas incompletas en inferencia.
- Contexto: se desconoce la ventana de contexto efectiva. No debe asumirse que el "4k" del nombre corresponde al contexto.
- Idiomas: no se especifican idiomas soportados. El entrenamiento documentado es en ingles procedimental.
- Licencia: Apache 2.0 heredada del modelo base, permisiva para uso comercial, pero conviene verificar los terminos del modelo base Qwen/Qwen3.5-4B por si imponen condiciones adicionales.
- Madurez: el modelo forma parte de un envio anonimo a revision por pares, con cero descargas y cero interacciones. No hay evidencia de uso en produccion ni garantias de mantenimiento.
- Riesgo de dependencia del pipeline declarado: la etiqueta `image-text-to-text` sugiere capacidades multimodales heredadas, pero el ajuste fino documentado es exclusivamente textual y no se evalua el comportamiento multimodal tras el RL.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-reasoninggym-easyturkey-s300
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Otros enlaces (paper de ICLR 2027, repositorio de codigo, blog o demo): no disponibles. La busqueda web no devolvio resultados relacionados con el modelo.
