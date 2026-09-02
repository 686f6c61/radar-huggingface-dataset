# sambal/k2-v2-think-dpo-checkpoint-200

## Resumen

Este repositorio contiene un checkpoint intermedio de entrenamiento de preferencias (DPO) sobre el modelo base `LLM360/K2-Think`, un sistema de razonamiento de 32B parámetros desarrollado por MBZUAI y G42. El checkpoint corresponde a la iteración 200 de un total de 496, y ha sido entrenado con un objetivo de DPO sigmoide (beta=0.1) combinado con RPO (alpha=0.1). El modelo resultante mantiene la arquitectura `Qwen2ForCausalLM` y se distribuye en formato Transformers fusionado con 14 shards de safetensors en BF16.

La relevancia de este checkpoint radica en que representa un paso intermedio en el ajuste por preferencias de un modelo de razonamiento ya potente. K2-Think, su base, ha demostrado que un modelo de 32B con cadenas de pensamiento largas y verificación con recompensas puede competir con sistemas de órdenes de magnitud mayor. Este checkpoint DPO busca refinar las preferencias de respuesta, aunque al ser intermedio, requiere evaluación antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (dense transformer) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base K2-Think soporta contexto largo, pero no se especifica en este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publica en BF16) |
| Idiomas soportados | no disponible (la model card no los indica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (14 shards BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen2ForCausalLM` de la familia Qwen2, con 32B parámetros en configuración densa. El entrenamiento de este checkpoint parte de `LLM360/K2-Think`, que a su vez se construyó sobre Qwen2.5-32B y fue post-entrenado con un pipeline que incluye SFT con cadenas de pensamiento largas, RL con recompensas verificables y planificación agéntica. Sobre esa base, este checkpoint aplica un objetivo de DPO sigmoide con beta=0.1 y RPO con alpha=0.1, durante 496 iteraciones en cuatro nodos. El checkpoint 200 es un estado intermedio, no el resultado final, por lo que su comportamiento puede diferir del modelo final.

No se proporcionan detalles sobre el dataset de preferencias utilizado, ni sobre la composición de los datos de entrenamiento. El chat template incluido es el "K2 v2 high", disponible como `chat_template.jinja`.

## Capacidades

- Razonamiento matemático y científico: hereda las capacidades de K2-Think, que alcanza puntuaciones altas en AIME, HMMT y GPQA-Diamond.
- Generación de código: el modelo base tiene buen rendimiento en LiveCodeBench, aunque este checkpoint intermedio puede no mantenerlo.
- Razonamiento multi-paso con cadenas de pensamiento largas: el entrenamiento base incluye CoT largo, y el DPO busca alinear preferencias.
- Soporte de tool calling: no confirmado explícitamente para este checkpoint, aunque la arquitectura Qwen2 lo permite.
- Multilingüismo: no especificado; el modelo base Qwen2.5-32B soporta múltiples idiomas, pero no hay confirmación para este checkpoint.
- Modo "thinking": el modelo base K2-Think está diseñado para razonamiento explícito, pero este checkpoint intermedio no garantiza el mismo comportamiento.

## Casos de uso

- Evaluación de preferencias en modelos de razonamiento: este checkpoint es útil para investigadores que quieran estudiar el efecto del DPO en diferentes etapas del entrenamiento, comparando la iteración 200 con la final.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como punto de partida para experimentos de continuación de entrenamiento con otros objetivos o datasets.
- Benchmarking de robustez: permite medir si el DPO intermedio introduce regresiones en tareas de razonamiento antes de completar el entrenamiento.
- Investigación sobre RPO: el uso combinado de DPO y RPO (alpha=0.1) puede analizarse en este checkpoint para entender la contribución de cada término.
- Desarrollo de pipelines de alineación: sirve como ejemplo de un checkpoint de preferencias intermedio, útil para documentar prácticas de entrenamiento.
- Comparación de checkpoints: para estudios de dinámica de entrenamiento, comparando iteraciones 0, 200 y 496.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint intermedio. Los datos disponibles corresponden al modelo base K2-Think, que se muestran a continuación como referencia, pero no deben atribuirse a este checkpoint:

| Benchmark | K2-Think (base) |
|---|---|
| AIME'24 | 90.83 |
| AIME'25 | 81.24 |
| HMMT'25 | 73.75 |
| OMNI-MATH-HARD | 60.73 |
| GPQA-Diamond | 71.08 |
| LiveCodeBench v5 | 63.97 |

Estos valores son del modelo base sin el DPO, por lo que el checkpoint 200 puede tener un rendimiento diferente, posiblemente inferior o superior según la tarea.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 65.5 GB (tamaño del repo), por lo que se necesitan al menos 70 GB de VRAM para inferencia sin cuantización.
- GPUs recomendadas: una A100 de 80 GB, o dos RTX 4090 (24 GB cada una) con tensor parallelism, o una H100 de 80 GB.
- En consumer GPU: no cabe en una sola GPU de consumo (máximo 24 GB en RTX 4090). Se necesitaría cuantización a 8 bits o 4 bits, pero no se proporcionan versiones cuantizadas.
- Opciones de despliegue: vLLM, TGI, Transformers con `device_map="auto"`, o llama.cpp si se convierte a GGUF (no incluido).
- Latencia y throughput: no disponibles para este checkpoint. El modelo base K2-Think reporta hasta ~2000 tok/s en hardware Cerebras WSE, pero eso no aplica a GPUs convencionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sambal/k2-v2-think-dpo-checkpoint-200 | 32.76B | no disponible | Apache-2.0 | Checkpoint intermedio DPO sobre K2-Think |
| LLM360/K2-Think | 32B | no disponible | Apache-2.0 | Modelo base, razonamiento con CoT largo |
| Qwen2.5-32B-Instruct | 32B | 128K (típico) | Apache-2.0 | Modelo instruct general, sin enfoque específico en razonamiento |
| DeepSeek-R1-Distill-Qwen-32B | 32B | 128K (típico) | MIT | Destilado de R1, razonamiento fuerte |

Este checkpoint se diferencia por ser un estado intermedio de entrenamiento, no un modelo final. Su rendimiento no es comparable directamente con los modelos finales listados.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; la iteración 200 de 496 puede no haber convergido y puede mostrar comportamientos erráticos o subóptimos.
- Sin benchmarks propios: no hay evidencia de rendimiento para este checkpoint específico; los datos del modelo base no son extrapolables.
- Posible sobreajuste a preferencias: el DPO con RPO puede haber introducido sesgos hacia ciertos estilos de respuesta, no evaluados.
- Contexto no especificado: se desconoce la longitud de contexto soportada en este checkpoint, lo que limita su uso en tareas de ventana larga.
- Idiomas no confirmados: no se indica qué idiomas soporta, aunque el base Qwen2.5-32B es multilingüe.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero al ser un checkpoint intermedio, no se recomienda para producción sin evaluación exhaustiva.
- Riesgo de alucinación: como cualquier modelo de razonamiento, puede generar cadenas de pensamiento plausibles pero incorrectas, especialmente en dominios no cubiertos por el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sambal/k2-v2-think-dpo-checkpoint-200
- Modelo base K2-Think: https://huggingface.co/LLM360/K2-Think
- Sitio web de K2-Think: https://www.k2-think.org/
- Paper de K2-Think (arXiv): https://arxiv.org/abs/2509.07604
- Modelo K2-Think-V2 (HuggingFace): https://huggingface.co/LLM360/K2-Think-V2
- Modelo IFM/K2-V2 (HuggingFace): https://huggingface.co/IFM/K2-V2
