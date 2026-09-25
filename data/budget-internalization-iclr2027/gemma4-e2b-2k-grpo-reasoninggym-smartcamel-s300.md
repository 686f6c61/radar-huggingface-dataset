# budget-internalization-iclr2027/gemma4-e2b-2k-grpo-reasoninggym-smartcamel-s300

## Resumen

El modelo `budget-internalization-iclr2027/gemma4-e2b-2k-grpo-reasoninggym-smartcamel-s300` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo multimodal `google/gemma-4-E2B-it`, publicado por la cuenta anonima `budget-internalization-iclr2027` como parte de una submission anonima a ICLR 2027. El objetivo del entrenamiento es que el modelo internalice un presupuesto fijo de generacion: durante el RL, cualquier respuesta que alcanza el limite de 2.048 tokens recibe recompensa cero, de modo que el modelo aprende a producir cadenas de razonamiento completas y a cerrar la respuesta con una solucion verificable dentro de esa ventana.

Se trata de un checkpoint concreto (paso 300 de 300 planificados) del run apodado `smartcamel`. El entrenamiento se realizo sobre tareas de Reasoning Gym, un generador procedural de problemas de razonamiento con respuestas extraibles mediante el patron `\boxed{}`, y la recompensa se calcula con el verificador de la propia tarea. Los pesos se publican en precision F32 y el repositorio ocupa 20,5 GB, con 5.123.178.051 parametros totales segun los ficheros safetensors.

Su relevancia es fundamentalmente de investigacion: es un artefacto reproducible para estudiar como un modelo pequeno (nomenclatura E2B en el modelo base) puede aprender a autorregular la longitud de su razonamiento en lugar de generarlo ilimitadamente. No es un modelo orientado a producto, no incluye cuantizaciones y no publica benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base `google/gemma-4-E2B-it`; la model card no la detalla) |
| Parametros totales | 5.123.178.051 (~5,12 mil millones, dato de los safetensors) |
| Parametros activos | no disponible (la nomenclatura "E2B" del modelo base sugiere un regimen MoE con ~2B activos; no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos F32; no se incluyen GGUF ni cuantizaciones de 8 o 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en los metadatos del repositorio, pero la propia model card indica que hereda la licencia del modelo base y enlaza a la licencia de Gemma 4 (contradiccion sin resolver en la informacion disponible) |
| Formato de pesos | safetensors, dtype F32 |

## Arquitectura y entrenamiento

No se documenta en la model card la arquitectura interna del modelo base mas alla de su nombre comercial. Lo que si se detalla es el procedimiento de ajuste: se parte de `google/gemma-4-E2B-it` y se aplica GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Cada paso de entrenamiento consume 32 prompts con 8 rollouts por prompt. El optimizador es Adam con schedule de learning rate coseno, pico de 3e-6 y 10 pasos de warmup, durante 300 pasos en total. Los pesos finales se guardan en F32.

El elemento tecnico diferencial es la restriccion de presupuesto: `max_new_tokens` se fija en 2.048 y las respuestas que agotan ese presupuesto reciben recompensa cero. Esto convierte el limite de longitud en una senal de aprendizaje en lugar de un simple parametro de decodificacion, forzando al modelo a internalizar cuando debe cerrar la respuesta. La funcion de recompensa es el verificador de la tarea de Reasoning Gym evaluando la respuesta extraida del bloque `\boxed{}`. Los prompts son los propios enunciados de Reasoning Gym renderizados con la plantilla de chat del modelo base. No se menciona uso de RLHF, DPO ni destilacion adicional, ni se detalla la composicion exacta del dataset mas alla de que los problemas son generados proceduralmente (hasta 3 epocas).

## Capacidades

- Generacion de texto y razonamiento paso a paso orientado a respuestas verificables con formato `\boxed{}`.
- Razonamiento matematico y logico procedimental, entrenado especificamente sobre tareas de Reasoning Gym.
- Autorregulacion de la longitud de generacion bajo un presupuesto de 2.048 tokens, adquirida mediante RL.
- Capacidades multimodales (imagen-texto) heredadas del modelo base `google/gemma-4-E2B-it`, segun la etiqueta `image-text-to-text` y el pipeline `any-to-any`. No se verifica en la model card que el ajuste por RL las preserve ni las mejore.
- Compatibilidad con el stack `transformers` y con vLLM, ademas de la etiqueta `endpoints_compatible`.
- No se documenta soporte de tool calling, function calling, uso agentico ni modo de pensamiento explicito separado.

## Casos de uso

- Investigacion sobre internalizacion de presupuesto de computo: el modelo es un punto de comparacion directo para medir si el RL con recompensa cero al agotar tokens reduce la longitud media de las cadenas de razonamiento sin degradar la exactitud. Su utilidad esta en la reproducibilidad del run (paso 300, hiperparametros publicados).
- Reproduccion de experimentos de RL: al documentarse algoritmo, recompensa, batch, optimizador y learning rate, sirve como baseline para replicar o refutar el resultado del articulo.
- Generacion de datos sinteticos de razonamiento con formato controlado: el modelo produce soluciones dentro de `\boxed{}`, un formato directamente parseable para construir datasets de entrenamiento o evaluacion.
- Evaluacion comparativa de checkpoints: al existir un paso concreto identificado, es util para estudiar la evolucion del comportamiento (longitud de respuesta, tasa de exito) a lo largo del entrenamiento.
- Tareas de matematicas y logica con coste de inferencia acotado: en entornos donde el numero de tokens generados determina directamente el coste, un modelo entrenado para no desbordar su presupuesto reduce la factura de inferencia frente a modelos que divagan.
- Punto de partida para ajustes posteriores: al partir de un Gemma 4 E2B instruido, puede emplearse como base para SFT adicional en dominios especificos cuando se quiere conservar la disciplina de longitud.
- Prototipado educativo: como asistente de practica de problemas de razonamiento con respuesta final verificable automaticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, HumanEval ni metricas propias de Reasoning Gym con valores numericos, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- Pesos publicados en F32: aproximadamente 20,5 GB de ficheros, lo que implica del orden de 21-25 GB de VRAM en inferencia FP32 contando cache KV y activaciones. Requiere A100 40 GB, L40S 48 GB o H100; en una RTX 4090 (24 GB) queda al limite o directamente no cabe segun la longitud de contexto.
- Conversion manual a bf16/fp16: los pesos bajan a unos 10,3 GB, lo que permite ejecucion en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB). El repositorio no ofrece una version preconvertida.
- Cuantizacion a 8 bits (unos 5,4 GB) o 4 bits (unos 2,7 GB) habilitaria GPUs de consumo como RTX 3060 12 GB o RTX 4060 Ti; estas cuantizaciones no estan publicadas y habria que generarlas.
- Opciones de despliegue documentadas: `transformers` con `AutoModelForCausalLM.from_pretrained(..., torch_dtype="auto", device_map="auto")` y vLLM mediante `vllm serve <repo>`. No se proporcionan ficheros GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- No se publican datos de latencia ni de throughput. Como referencia estructural, el presupuesto de generacion de 2.048 tokens acota el coste maximo de decodificacion por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (checkpoint s300) | 5,12 B (total) | no disponible | safetensors F32 | apache-2.0 en metadatos, licencia Gemma 4 referenciada en la model card | HuggingFace, 0 descargas |
| `google/gemma-4-E2B-it` (modelo base) | mismos pesos de partida | no disponible | no disponible | licencia Gemma 4 | HuggingFace (modelo oficial de Google) |
| Otros modelos de razonamiento de ~5B ajustados con GRPO | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay en la informacion proporcionada datos de parametros, contexto o rendimiento de alternativas comparables, ni resultados que permitan establecer una comparacion cuantitativa. La unica comparacion fiable es con el modelo base, del que este checkpoint es un ajuste fino por RL.

## Limitaciones y advertencias

- No es un modelo de produccion: 0 descargas y 0 likes en HuggingFace, publicado como artefacto anonimo de una submission a conferencia.
- Contradiccion de licencia: los metadatos declaran apache-2.0, pero la model card afirma que hereda la licencia del modelo base y enlaza a la licencia de Gemma 4. Antes de cualquier uso comercial hay que resolver esta discrepancia, ya que la licencia de Gemma incorpora una politica de uso prohibido.
- Riesgo de alucinacion no evaluado: no se publican tasas de error ni evaluaciones de fidelidad fuera de las tareas de Reasoning Gym.
- Sesgos no documentados: no hay informacion sobre composicion del dataset mas alla de que los problemas son generados proceduralmente, ni sobre idiomas soportados.
- Longitud de contexto desconocida: se desconoce la ventana del modelo base y como interactua con el presupuesto de generacion de 2.048 tokens.
- Especializacion estrecha: el RL se realizo unicamente sobre Reasoning Gym con respuestas en formato `\boxed{}`, lo que puede degradar el comportamiento en conversacion abierta o en tareas ajenas al formato entrenado.
- Riesgo de olvido catastrofico en las capacidades multimodales heredadas: el ajuste se hizo con prompts de texto, por lo que el rendimiento imagen-texto del modelo base puede no conservarse.
- Pesos en F32: el repositorio ocupa 20,5 GB y no ofrece cuantizaciones, lo que encarece el despliegue y excluye GPU de consumo sin conversion previa.
- Sin garantias de mantenimiento: el repositorio es anonimo y esta vinculado a un proceso de revision, por lo que puede no recibir actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-reasoninggym-smartcamel-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia referenciada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper, repositorio de codigo, blog o demo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo, la autoria o el articulo de ICLR 2027 (los resultados obtenidos trataban sobre presupuestos estatales y no guardan relacion).
