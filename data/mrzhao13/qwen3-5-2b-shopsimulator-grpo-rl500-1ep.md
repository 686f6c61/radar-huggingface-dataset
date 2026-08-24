# mrzhao13/qwen3.5-2b-shopsimulator-grpo-rl500-1ep

## Resumen

Este checkpoint es el resultado de una época de entrenamiento con GRPO (Group Relative Policy Optimization) sobre 500 tareas del entorno ShopSimulator, partiendo del modelo `mrzhao13/qwen3.5-2b-shopsimulator-sft-512-1ep`, que a su vez es un fine-tuning del modelo base `Qwen/Qwen3.5-2B`. El autor, mrzhao13, lo publica como un modelo de agente conversacional especializado en tareas de compra simulada en chino, con soporte de interacción multi-turno y uso de herramientas.

El modelo conserva la arquitectura multimodal original de Qwen3.5-2B (image-text-to-text), pero el post-entrenamiento se realizó únicamente con texto; las capacidades visuales no fueron entrenadas ni evaluadas. Con aproximadamente 1.880 millones de parámetros y una ventana de contexto de 16.384 tokens, este checkpoint demuestra una mejora significativa en tareas de compra simulada frente a su versión SFT y al modelo base, alcanzando un 90,5% de recompensa positiva en la evaluación oficial.

La relevancia de este modelo radica en su enfoque de aprendizaje por refuerzo online aplicado a un entorno de agente realista, lo que lo convierte en un caso de estudio útil para desarrolladores que trabajan en agentes de e-commerce, razonamiento multi-paso y optimización de políticas con GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-2B, image-text-to-text) |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (máximo durante entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-2B, un transformer multimodal con fusión temprana de visión y lenguaje. El post-entrenamiento se realizó en dos fases: primero un fine-tuning supervisado (SFT) con 512 tareas de ShopSimulator (checkpoint `qwen3.5-2b-shopsimulator-sft-512-1ep`), y posteriormente una época de GRPO online sobre 500 tareas únicas del mismo entorno. El entrenamiento RL utilizó 4 candidatos por tarea, 2.000 candidatos por paso de optimización (100 pasos), un learning rate de 1e-6, coeficiente KL de 0.001 con tipo `low_var_kl`, y un máximo de 40 turnos de modelo. El framework empleado fue Slime + Megatron-LM + SGLang + Pi, sobre una única GPU NVIDIA Pro 6000D de 84 GB. El 70,4% de los grupos de tareas presentaron varianza de recompensa no nula, lo que indica que el gradiente de RL fue efectivo en la mayoría de los casos.

## Capacidades

- Agente conversacional multi-turno: gestiona diálogos de hasta 40 turnos con el entorno ShopSimulator.
- Uso de herramientas (tool use): integrado con el framework Pi para interacción con el simulador de compras.
- Razonamiento multi-paso: optimizado para tareas de búsqueda, comparación y selección de productos.
- Comprensión de preferencias del usuario: interpreta requisitos personales en chino para filtrar productos.
- Generación de texto en chino: especializado en lenguaje natural para contexto de compra.
- No se entrenaron ni evaluaron capacidades visuales, aunque la arquitectura las soporta.

## Casos de uso

- Simulación de agentes de compra en entornos de investigación: el modelo puede usarse como baseline o componente en experimentos de RL para e-commerce, gracias a su integración con ShopSimulator y su evaluación reproducible.
- Desarrollo de asistentes de compra en chino: permite construir prototipos de chatbots que guían al usuario en la selección de productos mediante diálogo multi-turno.
- Evaluación de algoritmos de RL (GRPO, PPO, etc.): al ser un checkpoint entrenado con GRPO, sirve para comparar políticas y estudiar el efecto del aprendizaje por refuerzo en tareas de agente.
- Generación de datos sintéticos de interacción de compra: puede emplearse para producir conversaciones simuladas que alimenten otros modelos o pipelines de datos.
- Pruebas de integración de frameworks de agente (Slime, Pi, SGLang): útil para validar la compatibilidad de herramientas de despliegue con modelos de 2B.
- Fine-tuning posterior: al ser un modelo de tamaño reducido y licencia Apache-2.0, puede servir como punto de partida para adaptaciones a dominios específicos de comercio electrónico.

## Benchmarks y rendimiento

La evaluación se realizó con el mismo servicio ShopSimulator modificado, generación de precios determinista, el subconjunto fijo `official_test_200` y una sola ejecución por tarea (k=1). Los resultados son estimaciones puntuales.

| Modelo | Recompensa positiva pass@1 | Éxito estricto pass@1 | media@1 r_loose | media@1 r_hard |
|---|---:|---:|---:|---:|
| Qwen3.5-2B (base) | 2,0% | 0,0% | 0,004286 | 0,000000 |
| SFT-512 1 época | 72,5% | 10,5% | 0,389829 | 0,124417 |
| Este checkpoint (GRPO RL-500) | 90,5% | 31,0% | 0,627786 | 0,354530 |

Además, el checkpoint RL alcanzó un 91,5% de tasa de finalización del entorno y un 40,0% de pass@1 en producto correcto en esta evaluación fija.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,88B parámetros, en FP16 se requieren aproximadamente 3,8 GB; en cuantización INT8 ~2 GB; en INT4 ~1 GB (valores orientativos, no publicados por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 4060) es suficiente para FP16. Para entrenamiento se usó una NVIDIA Pro 6000D de 84 GB.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: compatible con Transformers (Hugging Face), SGLang (usado en entrenamiento), y potencialmente vLLM, llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas actualmente).
- Latencia y throughput: no disponibles; al ser un modelo de 2B, se espera una latencia baja en GPUs modernas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Rendimiento en ShopSimulator (pass@1 positivo) |
|---|---|---|---|---|---|
| Qwen3.5-2B (base) | ~2B | no disponible | Apache-2.0 | General multimodal | 2,0% |
| mrzhao13/qwen3.5-2b-shopsimulator-sft-512-1ep | ~1,88B | 16.384 | Apache-2.0 | SFT en ShopSimulator | 72,5% |
| Este checkpoint (GRPO) | ~1,88B | 16.384 | Apache-2.0 | RL en ShopSimulator | 90,5% |

No se dispone de comparación con otros modelos de agente de compra de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Optimizado exclusivamente para tareas de compra en chino en el entorno ShopSimulator; su rendimiento fuera de este dominio no ha sido evaluado.
- Solo se evaluó en el entorno modificado con precios deterministas; los resultados pueden diferir del entorno original sin parchear.
- No se realizaron evaluaciones de seguridad, alucinación, seguimiento de instrucciones generales ni capacidades visuales.
- El aprendizaje por refuerzo online puede amplificar comportamientos específicos del entorno y de la función de recompensa, lo que podría reducir la generalización.
- Los datos SFT contienen contenido generado por IA que puede incluir errores.
- La licencia Apache-2.0 cubre los pesos del modelo, pero no otorga derechos sobre el contenido de las tareas o el entorno de ShopSimulator de terceros.
- No se publican cuantizaciones oficiales; el usuario debe generarlas si necesita despliegue en hardware limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrzhao13/qwen3.5-2b-shopsimulator-grpo-rl500-1ep
- Modelo base SFT: https://huggingface.co/mrzhao13/qwen3.5-2b-shopsimulator-sft-512-1ep
- Modelo original Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper ShopSimulator (arXiv): https://arxiv.org/abs/2601.18225
- Repositorio GitHub Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Blog oficial Qwen3.5: https://qwen.ai/blog?id=qwen3.5
