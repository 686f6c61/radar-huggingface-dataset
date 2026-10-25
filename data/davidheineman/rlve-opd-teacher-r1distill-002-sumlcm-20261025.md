# davidheineman/rlve-opd-teacher-R1Distill-002-SumLCM-20261025

## Resumen

`rlve-opd-teacher-R1Distill-002-SumLCM-20261025` es un checkpoint de investigación publicado por el usuario de Hugging Face `davidheineman` dentro de un barrido de experimentos sobre escalado de datos con RL (RLVE, *Reinforcement Learning with Verifiable Environments*). No es un modelo de propósito general: es un "teacher" (profesor) entrenado con GRPO sobre un único entorno de entrenamiento, identificado como `SumLCM`, y pensado para generar rollouts de alta calidad que después se usan en destilación on-policy (OPD) sobre modelos alumno. El punto de partida es `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un modelo denso de 1.777.088.000 parámetros con arquitectura de la familia Qwen2 y razonamiento estilo DeepSeek-R1.

El interés del checkpoint es metodológico más que de producto: documenta de forma exacta el presupuesto de entrenamiento (4.000 rollouts, actualización final 499 en base cero, parada anticipada si el pass@1 de validación in-distribution alcanza 0,98) y enlaza el run de Weights & Biases correspondiente. Eso lo convierte en una pieza reproducible para estudiar cómo la dificultad del entorno y el número de rollouts afectan al rendimiento de un especialista de 1,5B, y para compararlo con los otros teachers del mismo barrido (`MYJ`, `Circuit`, `KloBlocks`, `Multiplication`).

Ahora mismo su relevancia es acotada: 0 descargas, 0 likes, sin licencia declarada y sin resultados de benchmarks publicados. Debe tratarse como un artefacto de laboratorio para experimentación en RL y destilación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (tag `qwen2`); modelo denso, no MoE |
| Parámetros totales | 1.777.088.000 (~1,78 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican versiones cuantizadas (GGUF, AWQ, GPTQ); pesos en `safetensors` en la precisión original del checkpoint (presumiblemente bf16/fp16, no confirmado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; el modelo base `DeepSeek-R1-Distill-Qwen-1.5B` se distribuye bajo licencia MIT según su propia model card (verificar aplicabilidad a este fine-tune) |
| Formato de pesos | `safetensors` + tokenizer y ficheros de configuración; sin estado de optimizador ni de dataloader |
| Modelo base | `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Pipeline | `text-generation` |
| Tamaño del repositorio | 3,6 GB |
| Librería | `transformers` |
| Tags | `rlve`, `data-scaling`, `opd-teacher`, `conversational`, `text-generation-inference`, `endpoints_compatible` |
| Fecha de creación / actualización | 2026-10-25 / 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,78B de parámetros, inicializado desde `DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez incorpora el comportamiento de razonamiento (cadenas de pensamiento largas antes de la respuesta) destilado de DeepSeek-R1. Todos los actores del experimento se inicializaron *desde cero* a partir de ese checkpoint, es decir, no hay continuación de un entrenamiento RL previo. El método indicado en la model card es "GRPO specialist".

El entrenamiento se realizó sobre **un único entorno** con dificultad fija y balanceada 0/1. La generación usa 1024 tokens iniciales más una continuación configurada de 128 tokens con *answer forcing* (forzar el cierre de la respuesta). El presupuesto se fijó en 4.000 rollouts, con la última actualización de checkpoint en el paso 499 (base cero). La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y esas muestras no consumen presupuesto de entrenamiento. El criterio de parada es alcanzar los 4.000 rollouts o un pass@1 de validación in-distribution mayor o igual a 0,98. El repositorio conserva `training_run.json` (lista de entornos y ajustes) y `training_config.yaml` (configuración exacta), pero no el estado del optimizador, por lo que no es posible reanudar el run de forma exacta.

## Capacidades

- Generación de texto autoregresiva con razonamiento explícito previo a la respuesta, heredado de la destilación de DeepSeek-R1.
- Especialización en el entorno `SumLCM`: resolución de problemas aritméticos de ese entorno (sumas y mínimo común múltiplo, a tenor del nombre) con formato de respuesta corto y forzado.
- Producción de rollouts etiquetados utilizables como señal de destilación on-policy para modelos alumno.
- Formato conversacional (`conversational` en los tags), lo que permite invocarlo con plantillas de chat de `transformers`.
- Compatibilidad declarada con Text Generation Inference (`text-generation-inference`) y con Inference Endpoints (`endpoints_compatible`).
- No hay evidencia en la información disponible de soporte de *tool calling*, function calling, agentes multi-paso, visión, audio ni modo "thinking" configurable. No se documentan capacidades multilingües.

## Casos de uso

- **Destilación on-policy de un alumno pequeño**: usar el checkpoint como profesor para generar rollouts en el entorno `SumLCM` y entrenar por imitación o KL un modelo alumno de menor coste. Es exactamente el propósito declarado del repositorio (`opd-teacher`).
- **Generación de datos sintéticos de razonamiento aritmético**: producir pares problema–solución verificables para sumas y mínimo común múltiplo, con la ventaja de que el criterio de parada del entrenamiento garantiza un pass@1 de validación alto en ese dominio concreto.
- **Reproducción de experimentos de escalado de datos con RL**: replicar el run enlazado en W&B usando `training_config.yaml` y `training_run.json` para estudiar la relación entre número de rollouts (4.000) y calidad del especialista.
- **Ablación de recetas GRPO**: comparar este teacher con los del mismo barrido (`079-MYJ`, `Circuit`, `KloBlocks`, `Multiplication`) manteniendo constante el modelo base y el presupuesto de entrenamiento.
- **Sanity checks de pipelines de RL**: servir como referencia de "profesor que funciona" para validar implementaciones de recompensa, *answer forcing* de 128 tokens y lógica de validación cada 50 pasos antes de escalar a entornos más caros.
- **Inicialización para nuevos entornos especialistas**: partir de estos pesos en lugar del modelo base para fine-tunear un especialista en una tarea relacionada, dado el bajo coste computacional de un modelo de 1,78B.
- **Demostraciones internas de serving ligero**: desplegarlo con TGI o Inference Endpoints para prototipos de razonamiento acotado a un dominio, siempre con la advertencia de que no es un asistente general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo describe el protocolo de validación y el criterio de parada, sin reportar el valor final alcanzado:

| Protocolo de evaluación | Valor |
|---|---|
| Métrica | pass@1 de validación in-distribution |
| Frecuencia | cada 50 actualizaciones |
| Tamaño de la evaluación | 32 prompts × 8 respuestas por prompt |
| Criterio de parada | 4.000 rollouts o pass@1 ≥ 0,98 |
| Resultado final reportado | no disponible |

## Requisitos de hardware

- **Pesos en bf16/fp16**: ~3,56 GB (1.777.088.000 parámetros × 2 bytes), coherente con los 3,6 GB del repositorio.
- **VRAM estimada para inferencia**: ~4–5 GB en bf16 con contexto corto (pesos + caché KV + activaciones); ~2 GB en int8; ~1,2–1,5 GB en 4 bits.
- **GPU consumer**: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en 4 bits es viable en GPU de 8 GB (RTX 3060 Ti, RTX 4060).
- **GPU de datacenter**: A100 40/80 GB, H100, L40S o A10G, sobredimensionadas para el tamaño del modelo pero útiles si se generan muchos rollouts en paralelo.
- **Opciones de despliegue**: `transformers`, vLLM, SGLang, Text Generation Inference (tag `text-generation-inference`), Hugging Face Inference Endpoints (tag `endpoints_compatible`). Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que el repositorio no publica cuantizaciones.
- **Latencia y throughput**: no disponibles. Como referencia de coste, el propio entrenamiento asume 1024 tokens de generación inicial más 128 de continuación forzada por respuesta, de modo que el consumo de tokens de salida por petición es alto en comparación con un modelo instruct convencional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`002-SumLCM`) | 1,78 B | no disponible | Especialista GRPO en un único entorno (`SumLCM`); teacher para OPD | no disponible | Hugging Face, `safetensors` |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` | 1,78 B | no disponible en esta ficha | Razonamiento general destilado de R1; mucho más generalista | MIT (según su model card) | Hugging Face, `safetensors` |
| `davidheineman/rlve-opd-teacher-R1Distill-079-MYJ-20261025` | mismo modelo base (cifra exacta no verificada) | no disponible | Teacher del mismo barrido sobre otro entorno (`MYJ`) | no disponible | Hugging Face |
| `davidheineman/opd-teacher-R1Distill-*-step149` (`Circuit`, `KloBlocks`, `Multiplication`) | mismo modelo base (cifra exacta no verificada) | no disponible | Teachers por entorno, 150 pasos, 4 prompts × 16 rollouts por paso, sin filtrado DAPO | no disponible | Hugging Face |

La comparación relevante es de receta, no de rendimiento: este checkpoint usa 4.000 rollouts y 499 actualizaciones, mientras que la familia `step149` se detiene en 150 pasos con 4.000 rollouts agregados (4 prompts × 16 rollouts × 150 pasos), lo que permite aislar el efecto de la composición del batch y del filtrado de prompts.

## Limitaciones y advertencias

- **No es un modelo de propósito general**: está entrenado sobre un único entorno con dificultad fija 0/1 y 4.000 rollouts; fuera de ese dominio el comportamiento esperado es el del modelo base sin garantías, con riesgo alto de degradación y de alucinación.
- **Licencia no declarada**: la ficha no indica licencia para este fine-tune. Aunque el modelo base se publica bajo MIT, la ausencia de licencia explícita en este repositorio es un riesgo legal a resolver antes de cualquier uso comercial.
- **Sin evaluación publicada**: no hay benchmarks ni resultados finales de pass@1, solo el criterio de parada. Cualquier afirmación de rendimiento sería especulativa.
- **Idiomas no declarados**: no se especifica cobertura lingüística; el entrenamiento se centra en un entorno concreto y previsiblemente en formato simbólico o en inglés.
- **Dependencia del formato de entrenamiento**: el pipeline asume 1024 tokens iniciales más 128 tokens de continuación forzada; usarlo con otros formatos o plantillas de chat puede degradar la calidad de forma sustancial.
- **Sin estado de optimizador ni de dataloader**: no se puede reanudar el entrenamiento exactamente, solo reinicializar desde los pesos.
- **Validación reducida**: 32 prompts × 8 respuestas cada 50 actualizaciones es una muestra pequeña; el umbral de 0,98 puede alcanzarse con sobreajuste al conjunto de validación.
- **Madurez y adopción nulas**: 0 descargas y 0 likes en el momento de redactar la ficha; no hay evidencia de uso en producción ni de revisión por terceros.
- **Fecha de publicación futura en los metadatos (2026-10-25)**: conviene verificar la integridad y procedencia del artefacto antes de integrarlo en pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-002-SumLCM-20261025
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/072d6206
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Colección de teachers RLVE OPD: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Teacher del mismo barrido (entorno `MYJ`): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-079-MYJ-20261025
- Teacher `Circuit` (paso 149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Circuit-step149
- Teacher `KloBlocks` (paso 149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-KloBlocks-step149
- Teacher `Multiplication` (paso 149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Multiplication-step149
- Paper de referencia citado en la colección: https://arxiv.org/abs/2511.07317
