# bshang17/smt-safelm-hq_safety

## Resumen

`smt-safelm-hq_safety` es una coleccion de checkpoints intermedios de entrenamiento (mid-training) de un modelo SmolLM2-1.7B, publicados por el usuario `bshang17`. No se trata de un modelo final afinado para uso general, sino de instantaneas del proceso de entrenamiento tomadas en pasos seleccionados tras procesar 60.000 millones de tokens con una mezcla de datos denominada `hq_safety`, orientada presumiblemente a seguridad (safety).

El interes del repositorio es de naturaleza experimental: permite inspeccionar la evolucion de un modelo pequeno durante una fase concreta de mid-training, asi como reanudar el entrenamiento de forma exacta gracias a que cada checkpoint incluye el estado completo del optimizador AdamW, la configuracion, el tokenizer y la posicion en el flujo de datos (`state.json`). Esto lo hace util para investigacion sobre dinamica de entrenamiento, ablaciones de mezcla de datos y estudios de seguridad, mas que para despliegue en produccion.

La informacion publicada es muy limitada: la model card no detalla la composicion exacta del dataset, hiperparametros, licencia ni resultados de evaluacion. El repositorio ocupa 25,4 GB, coherente con almacenar checkpoints completos en fp32 (un SmolLM2-1.7B en fp32 ronda los 6,8 GB por checkpoint, mas el estado del optimizador, que suele duplicar o triplicar esa cifra) junto con sus exportaciones en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B); detalles no disponibles |
| Parametros totales | 1.700 millones (aproximado, segun SmolLM2-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos fp32 y bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32 en checkpoint completo; exportacion bf16 en subcarpeta `bf16/`), mas `optimizer.pt` y `state.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolLM2-1.7B, un transformer decoder-only desarrollado originalmente por Hugging Face, del que este repositorio reutiliza la base. La model card no especifica la configuracion interna (numero de capas, dimension oculta, cabezas de atencion, funcion de activacion ni tipo de positional encoding), por lo que esos datos deben consultarse en la ficha del modelo base.

El entrenamiento descrito consiste en una fase de mid-training de 60.000 millones de tokens sobre la mezcla `hq_safety`. No se indica el numero de pasos totales, el tamano de batch, la tasa de aprendizaje, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Los checkpoints publicados se guardan en pasos seleccionados e incluyen el estado completo del optimizador AdamW, lo que permite reanudar el entrenamiento de forma bit a bit desde el punto exacto, incluyendo la posicion en el flujo de datos registrada en `state.json`. Cada checkpoint dispone ademas de una exportacion en bf16 pensada para evaluacion.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura SmolLM2-1.7B.
- Razonamiento y codigo basicos, limitados por el tamano de 1.700 millones de parametros y por el estado intermedio del entrenamiento.
- Capacidades multilingues: no disponibles en la informacion publicada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Reanudacion exacta del entrenamiento como capacidad operativa del checkpoint (estado del optimizador y posicion de datos incluidas).

## Casos de uso

- Investigacion sobre dinamica de entrenamiento: comparar los checkpoints de distintos pasos para estudiar como evolucionan los pesos y las representaciones internas durante el mid-training con la mezcla `hq_safety`.
- Reanudacion de entrenamiento: cargar `optimizer.pt`, `state.json` y los pesos fp32 para continuar el entrenamiento exactamente donde se interrumpio, sin perdida de estado del optimizador ni desajuste en el flujo de datos.
- Ablaciones de mezcla de datos: usar estos checkpoints como linea base para evaluar el efecto de variaciones en la composicion del dataset de seguridad frente al modelo original.
- Evaluacion de seguridad: analizar el comportamiento del modelo en tareas de safety en distintos puntos del entrenamiento y detectar posibles degradaciones o sesgos introducidos por la mezcla.
- Destilacion o inicializacion: emplear los pesos bf16 como punto de partida para fine-tuning posterior en tareas especificas, dado el reducido coste computacional de un modelo de 1.700 millones de parametros.
- Estudio de robustez y alucinacion: medir la tasa de alucinacion y la calidad de generacion a lo largo de los pasos para caracterizar la curva de aprendizaje en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 4-6 GB en total).
- VRAM estimada para inferencia en fp32: aproximadamente 6,8 GB solo para pesos.
- VRAM para reanudar el entrenamiento: los pesos fp32 mas el estado completo de AdamW superan con holgura los 20 GB, por lo que se recomienda GPU con 40 GB o mas (A100 40GB/80GB, H100).
- GPU recomendadas para inferencia: RTX 4090, RTX 3090, A10G, L4; cabe en GPUs de consumo con 8 GB o mas en bf16.
- Opciones de despliegue: al no publicarse pesos en GGUF, no es directamente compatible con llama.cpp u Ollama sin conversion previa. Para inferencia en bf16 puede usarse PyTorch con Transformers, vLLM o TGI tras convertir los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smt-safelm-hq_safety | 1,7 B | no disponible | no disponible | Checkpoints intermedios en HF |
| SmolLM2-1.7B | 1,7 B | no disponible en esta ficha | no disponible en esta ficha | Modelo final en HF |
| Qwen2.5-1.5B | 1,5 B | no disponible en esta ficha | no disponible en esta ficha | Modelo final en HF |
| Llama 3.2-1B | 1,2 B | no disponible en esta ficha | no disponible en esta ficha | Modelo final en HF |

La comparacion con alternativas finales no es homogenea: este repositorio contiene checkpoints de mid-training, no un modelo afinado y evaluado, por lo que la comparacion de rendimiento no resulta posible con los datos disponibles.

## Limitaciones y advertencias

- No es un modelo final: los checkpoints de mid-training pueden presentar calidad de generacion inferior y comportamiento inestable en comparacion con el modelo SmolLM2-1.7B ya entrenado y alineado.
- Ausencia total de datos de evaluacion: no hay benchmarks, por lo que se desconoce su rendimiento real en tareas estandar.
- Licencia no especificada: no se puede garantizar el uso comercial; debe contactarse con el autor o consultarse la licencia del modelo base SmolLM2 antes de cualquier uso en produccion.
- Composicion del dataset `hq_safety` no documentada: imposible evaluar sesgos, contaminacion de datos o cobertura idiomatica.
- Riesgo de alucinacion: inherente a modelos de 1,7 B de parametros, agravado por tratarse de un checkpoint intermedio.
- Idiomas soportados no declarados: no se recomienda su uso en produccion multilingue sin evaluacion previa.
- El repositorio incluye `optimizer.pt` de gran tamano, lo que incrementa el coste de almacenamiento y descarga (25,4 GB en total) y no es necesario para inferencia.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/bshang17/smt-safelm-hq_safety
- SmolLM2 (modelo base): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
