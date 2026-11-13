# 96kevinli29/Qwen3-8B-SFT-Math-90k-ep3

## Resumen

Qwen3-8B-SFT-Math-90k-ep3 es un checkpoint de ajuste supervisado (SFT) de Qwen3-8B-Base, el modelo denso de 8.190 millones de parametros de la familia Qwen3. Lo publica el usuario 96kevinli29 junto con la Sea-Fill Community, y corresponde a la tercera epoca de un entrenamiento de parametros completos sobre un subconjunto de 90.000 filas del dataset OpenR1-Math-220k. El objetivo es especializar el modelo base en razonamiento matematico de cadena de pensamiento larga: cada respuesta genera un bloque `<think> ... </think>` antes de emitir la respuesta final en formato boxed.

El modelo resuelve el problema de obtener un checkpoint reproducible de la receta de SFT matematico de 8B y 90K filas. La release documentada con numeros de benchmark es Qwen3-8B-SFT (SeaFill2025); este repositorio conserva los pesos de la epoca 3 de esa misma receta, sin evaluacion propia reportada en la model card. No incluye etapa de RL, por lo que debe tratarse como un checkpoint de investigacion y no como un asistente general.

Es relevante ahora porque permite reproducir y auditar el efecto del SFT matematico sobre Qwen3-8B-Base sin depender de un unico artefacto final, y porque su licencia Apache 2.0 facilita su uso en experimentos academicos y en pipelines internos de evaluacion de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (familia Qwen3), segun el modelo base Qwen3-8B-Base |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B-Base) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye pesos safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B-Base: un transformer causal denso de 8.190 millones de parametros. Sobre esa base se aplica un SFT de parametros completos (full-parameter fine-tuning) durante tres epocas sobre un subconjunto de 90.000 filas de OpenR1-Math-220k. El entrenamiento se realizo con verl y FSDP sobre el supercomputador MeluXina (LuxProvide), con el codigo de entrenamiento publicado en el repositorio base-model-sft-verl del autor.

El formato de entrenamiento impone una cadena de razonamiento explicita: el modelo produce un bloque `<think> ... </think>` con el razonamiento intermedio y a continuacion la respuesta final en formato boxed. Se usa la plantilla de chat de Qwen y las respuestas terminan con el token `<|im_end|>` (id 151645). No hay etapa de RL ni de preferencias (RLHF/DPO) despues del SFT, ni se documentan innovaciones de decodificacion (decodificacion especulativa, atencion lineal u otras) en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento matematico con cadena de pensamiento larga en bloques `<think>`.
- Resolucion de problemas matematicos con respuesta final en formato boxed, apta para extraccion automatica.
- Generacion de texto conversacional siguiendo la plantilla de chat de Qwen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el razonamiento multi-paso se limita al formato de pensamiento largo del SFT matematico.
- Capacidades multilingues: solo ingles (`en`) declarado.
- Capacidades especiales: modo de pensamiento largo (long-think) entrenado por SFT; sin vision ni audio.

## Casos de uso

- Evaluacion de recetas de SFT matematico: sirve como checkpoint intermedio (epoca 3) para medir como evoluciona el rendimiento en matematicas respecto a la release documentada Qwen3-8B-SFT y al modelo base, en un entorno controlado y reproducible.
- Generacion de soluciones paso a paso para datasets de matematicas: el formato `<think> ... </think>` mas respuesta boxed permite generar trazas de razonamiento y extraer la respuesta final de forma programatica para construir corpus de entrenamiento o de evaluacion.
- Investigacion en razonamiento con cadena de pensamiento: util para estudiar la longitud y estructura de las trazas generadas por SFT puro, sin RL, y compararlas con variantes entrenadas con RL.
- Verificacion automatica de problemas matematicos: integrado en un pipeline que compare la respuesta boxed del modelo con la solucion de referencia, como generador de candidatos en tareas tipo MATH o GSM8K.
- Reproducibilidad de experimentos academicos: al estar publicados los pesos de la epoca 3, permite replicar resultados y auditar diferencias entre epocas y entre checkpoints de la misma receta.
- Prototipado de tutoria matematica en ingles: para entornos de investigacion donde se requiera una explicacion paso a paso en ingles, con la advertencia de que no es un asistente general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reporta una evaluacion separada para este checkpoint y remite a la release documentada Qwen3-8B-SFT (SeaFill2025) para los numeros de benchmark de la receta.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contextos moderados.
- VRAM estimada con cuantizacion de 8 bits: en torno a 8-9 GB para pesos; con 4 bits, en torno a 4-5 GB. Estas cifras son estimaciones por tamano de parametros, ya que el repo no publica cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en BF16 con contextos largos; RTX 4090 (24 GB) es suficiente para BF16 con contextos moderados y para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con margen limitado, y en GPUs de 16 GB o menos solo mediante cuantizacion (no distribuida en el repo).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La model card recomienda usar un `max_new_tokens` grande para problemas dificiles, lo que implica respuestas largas y mayor coste de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-SFT-Math-90k-ep3 (este) | 8,19B | no disponible | SFT 3 epocas sobre 90K filas de OpenR1-Math-220k | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-8B-SFT (SeaFill2025) | 8,19B (misma base) | no disponible | Misma receta, release documentada con benchmarks | Apache 2.0 (segun la model card de este repo) | Hugging Face |
| Qwen3-4B-SFT-Math (96kevinli29) | ~4B (contrapartida de 4B) | no disponible | Misma receta de SFT matematico en 4B | no disponible en la informacion | Hugging Face |
| Qwen3-8B-Base | 8,19B | no disponible | Modelo base sin SFT matematico | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos referenciados en la model card; no se dispone de datos de rendimiento para establecer diferencias cuantitativas entre ellos.

## Limitaciones y advertencias

- SFT exclusivamente matematico y sin etapa de RL: esta pensado como checkpoint de investigacion, no como asistente general; su comportamiento fuera de matematicas puede degradarse respecto al modelo base.
- Solo ingles declarado: no hay soporte multilingue documentado, incluido el castellano.
- Riesgo de alucinacion en razonamientos largos: el formato `<think>` puede producir cadenas plausibles con errores intermedios; la respuesta boxed debe verificarse de forma externa.
- Sin evaluacion publicada en esta model card: no hay numeros de MMLU, GSM8K, MATH u otros benchmarks para este checkpoint concreto.
- Sin cuantizaciones oficiales ni integraciones documentadas con vLLM, llama.cpp u Ollama: el despliegue eficiente requiere trabajo adicional.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero la ausencia de evaluacion y su naturaleza de checkpoint de investigacion desaconsejan su uso en produccion sin validacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema minimo, sin garantias de mantenimiento mas alla de la Sea-Fill Community.
- La fecha de creacion y actualizacion del repositorio (2026-11-13) debe tenerse en cuenta al evaluar su vigencia frente a versiones posteriores del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-8B-SFT-Math-90k-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Release documentada de la receta (con benchmarks): https://huggingface.co/SeaFill2025/Qwen3-8B-SFT
- Contrapartida de 4B: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Codigo de entrenamiento del autor: https://github.com/96kevinli29/base-model-sft-verl
- Framework verl: https://github.com/volcengine/verl
- Comunidad Sea-Fill: https://huggingface.co/SeaFill2025
