# jhhj25/reef-nccl-ep-qwen3-coder-480b-a35b-lora-tune480b-run4

## Resumen

El modelo `jhhj25/reef-nccl-ep-qwen3-coder-480b-a35b-lora-tune480b-run4` es un adaptador LoRA (r32) construido sobre el modelo base `Qwen/Qwen3-Coder-480B-A35B-Instruct`, desarrollado por el autor `jhhj25`. Se trata de un experimento de aprendizaje por refuerzo (RL) que entrena al modelo para proponer configuraciones de transporte NCCL expert-parallel en clusters de GPUs. El objetivo es optimizar el ancho de banda de dispatch y combine (medido en GB/s) en nodos H200 con interconexión RDMA, condicionando la recompensa a un suite de tests de corrección.

El adaptador se entrenó con el framework `reef` (receta TTTD, backend slime/Megatron, RL con recompensa relativa agrupada). Según la model card, es el primer run sobre la base de 480B que muestra una señal de aprendizaje genuina, con normas de gradiente no nulas y crecientes, y una tendencia de recompensa al alza. El repositorio incluye los 8 pasos intermedios del entrenamiento en formato PEFT, cada uno en una subcarpeta `step_N/`.

La arquitectura subyacente es un modelo MoE (mixture of experts) de 480B parámetros totales con 35B activos, lo que lo sitúa en la categoría de modelos de gran tamaño para tareas de código y agentes. No se especifican la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r32) sobre Qwen3-Coder-480B-A35B-Instruct (MoE) |
| Parametros totales | 480B (modelo base) |
| Parametros activos | 35B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT / LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA (r32) se aplica sobre `Qwen/Qwen3-Coder-480B-A35B-Instruct`, un modelo MoE con 480B parámetros totales y 35B activos. El entrenamiento se realizó con `reef` (receta TTTD, backend slime/Megatron, RL con recompensa relativa agrupada). La tarea consiste en que el modelo proponga configuraciones de transporte NCCL expert-parallel en formato JSON con 5 parámetros enteros. La recompensa es el ancho de banda medido de dispatch y combine (GB/s) en un cluster de GPUs H200 con RDMA, siempre que la configuración pase un suite de tests de corrección.

La model card indica que este es el primer run sobre la base de 480B que muestra una señal de aprendizaje genuina: las normas de gradiente son no nulas y crecientes, y la recompensa media tiende al alza. Se utilizó una instrucción de estilo exploratorio en lugar de una con pistas. El entrenamiento se detuvo en el paso 8, e incluye todos los pasos intermedios como subcarpetas `step_N/` en formato PEFT.

## Capacidades

- Generación de texto y razonamiento, heredados del modelo base Qwen3-Coder.
- Propuesta de configuraciones de transporte NCCL expert-parallel en formato JSON con 5 parámetros enteros.
- Optimización de rendimiento de comunicaciones en clusters de GPUs, medida en ancho de banda efectivo (GB/s).
- Capacidad para explorar configuraciones de hardware mediante RL, con recompensa basada en mediciones reales.
- Soporte de integración con el framework `reef` para experimentos de RL en sistemas distribuidos.
- No se dispone de información sobre soporte de tool calling, visión, audio ni capacidades multilingües específicas.

## Casos de uso

- Optimización de comunicaciones en entrenamiento distribuido de modelos MoE: el modelo puede generar configuraciones de transporte NCCL que ajustan el dispatch y combine de expertos, lo que permite mejorar el throughput en clusters con RDMA.
- Ajuste de parámetros de NCCL en clusters de GPUs H200: gracias a la recompensa basada en ancho de banda medido, el adaptador puede proponer configuraciones que maximicen el rendimiento de la interconexión.
- Benchmarking de configuraciones de transporte para expert parallelism: el modelo genera configuraciones JSON que se evalúan con un suite de tests de corrección, lo que facilita la comparación de estrategias de transporte.
- Investigación en sistemas distribuidos: sirve como referencia para estudiar cómo el RL puede optimizar parámetros de bajo nivel en infraestructura de GPU, especialmente en clusters con interconexión RDMA.
- Generación de configuraciones iniciales para pipelines de despliegue de MoE: en entornos de producción, el modelo puede sugerir configuraciones de transporte como punto de partida para el ajuste fino manual.
- Experimentación con aprendizaje por refuerzo aplicado a sistemas: el modelo demuestra que el RL puede aprender a optimizar knobs de hardware, y puede utilizarse como base para futuros experimentos en el mismo dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento proporcionados corresponden a la recompensa media por paso durante el entrenamiento RL, medida en ancho de banda total (GB/s):

| Paso | Recompensa media (GB/s) | Norma de gradiente (train) |
|---|---|---|
| 0 | 136.73 | 0.0 (retraso en el reporte) |
| 1 | 141.84 | 1687.5 |
| 2 | 143.02 | 1718.9 |
| 3 | 150.92 | 5074.8 |
| 4 | 152.99 | 5202.6 |
| 5 | 160.00 | 6022.0 |
| 6 | 112.85 | 5072.3 |
| 7 | 119.32 | 6157.7 |

La recompensa sube de forma monótona hasta el paso 5 (+17% respecto al paso 0) y luego cae en los pasos 6 y 7, debido a respuestas más largas y exploratorias. La mejor configuración individual propuesta durante el run alcanzó 173.73 GB/s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base de 480B parámetros requiere infraestructura de datacenter; no se especifica el consumo de VRAM del adaptador.
- GPU recomendadas: no disponible. El entrenamiento se realizó en nodos H200 con interconexión RDMA, lo que sugiere que se necesitan GPUs de datacenter.
- Capacidad en GPU de consumo: no disponible. Dado el tamaño del modelo base, no es viable ejecutarlo en GPUs de consumo.
- Opciones de despliegue: no disponible. El adaptador requiere el modelo base `Qwen3-Coder-480B-A35B-Instruct`; las opciones de despliegue serían las del modelo base (vLLM, llama.cpp, TGI, etc.), pero no se proporcionan datos específicos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jhhj25/reef-nccl-ep-qwen3-coder-480b-a35b-lora-tune480b-run4 | 480B (base) + LoRA r32 | no disponible | Apache-2.0 | HuggingFace |
| jhhj25/reef-nccl-ep-qwen3-coder-480b-a35b-lora-tune480b-run1 | 480B (base) + LoRA r32 | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3-Coder-480B-A35B-Instruct | 480B (base) | no disponible | Apache-2.0 | HuggingFace, Fireworks AI |

La comparativa se limita a modelos de la misma familia o experimentos del mismo autor. No se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- Es un adaptador LoRA experimental, no un modelo listo para producción. Tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un experimento de investigación.
- El entrenamiento se detuvo en el paso 8 y los pasos 6 y 7 muestran una caída en la recompensa media, lo que sugiere inestabilidad en la fase final.
- No se han publicado benchmarks estándar ni evaluaciones de robustez, por lo que se desconoce su comportamiento en tareas generales.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- El modelo está especializado en proponer configuraciones para un cluster concreto (H200, RDMA); es probable que las configuraciones aprendidas no sean transferibles a otros entornos de hardware.
- Existe riesgo de alucinación en las configuraciones propuestas, por lo que es necesario validarlas con el suite de tests de corrección antes de aplicarlas.
- La licencia Apache-2.0 del adaptador no garantiza que el modelo base tenga las mismas condiciones; se debe revisar la licencia del modelo base para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhhj25/reef-nccl-ep-qwen3-coder-480b-a35b-lora-tune480b-run4
- Run 1 del mismo experimento: https://huggingface.co/jhhj25/reef-nccl-ep-qwen3-coder-480b-a35b-lora-tune480b-run1
- Repositorio de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Modelo base en Fireworks AI: https://fireworks.ai/models/fireworks/qwen3-coder-480b-a35b-instruct
- Framework reef (mencionado en la model card): https://github.com/Human-Agent-Society/reef
