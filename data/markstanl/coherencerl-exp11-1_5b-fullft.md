# markstanl/coherencerl-exp11-1_5b-fullft

## Resumen

coherencerl-exp11-1_5b-fullft es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B, publicado por el usuario markstanl en Hugging Face. Se trata de un experimento de investigación centrado en el entrenamiento con GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo introducida en DeepSeekMath, aplicada sobre un transformer decoder-only de 1.543.714.304 parámetros. El modelo se ha entrenado con la librería TRL (versión 1.10.0) y está etiquetado como `generated_from_trainer`, lo que indica que procede directamente del pipeline de entrenamiento de Hugging Face.

El interés del modelo es fundamentalmente metodológico: demuestra la aplicación de GRPO sobre un modelo pequeño (1,5B) mediante ajuste fino completo, en lugar de las técnicas de bajo rango (LoRA) más habituales en experimentación con recursos limitados. El nombre "coherencerl" sugiere que la recompensa del RL está orientada a mejorar la coherencia de las respuestas, aunque la model card no detalla la función de recompensa ni el dataset utilizado.

La relevancia es limitada para producción: se trata de un experimento con 27 descargas y 1 like, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Su valor reside en servir como referencia reproducible de un pipeline GRPO completo sobre Qwen2.5-1.5B, con enlace público al run de Weights & Biases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino completo |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B |
| Metodo de entrenamiento | GRPO (TRL 1.10.0) |
| Tamano del repositorio | 24,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only con atención causal estándar, normalización RMSNorm y las mejoras introducidas en la familia Qwen2 (RoPE, atención con sesgo QKV, etc.). Sobre esta base se ha realizado un ajuste fino completo de todos los parámetros (1,54B), no un ajuste de adaptadores. El entrenamiento se ha llevado a cabo con GRPO, un algoritmo de optimización de política que estima la ventaja relativa dentro de un grupo de respuestas generadas para la misma consulta, eliminando la necesidad de un modelo crítico separado (a diferencia de PPO clásico).

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la función de recompensa ni si hubo una fase previa de SFT. Se enlaza un run de Weights & Biases (proyecto RLCR, run i5cq7nvj) que presumiblemente contiene las curvas de entrenamiento, pero no se aportan métricas en el texto. Las versiones de framework declaradas (TRL 1.10.0, Transformers 5.15.0, PyTorch 2.11.0, Datasets 5.0.1, Tokenizers 0.22.2) corresponden a versiones futuras respecto a la fecha habitual de publicación, lo que sugiere un entorno de desarrollo muy actualizado o una fecha de creación posterior a la estándar.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento y respuesta a preguntas abiertas (el ejemplo de la model card es una pregunta reflexiva sobre viajes en el tiempo).
- Entrenamiento orientado a coherencia mediante recompensa RL (según el nombre del modelo), aunque la naturaleza exacta de la recompensa no se documenta.
- Soporte de chat template de Qwen2.5 (formato de roles user/assistant), como muestra el ejemplo de `pipeline`.
- Compatible con endpoints de text-generation-inference (tag `endpoints_compatible`).
- Capacidades multilingües: no confirmadas para este ajuste; el modelo base Qwen2.5-1.5B es multilingüe, pero el ajuste fino puede haber alterado el equilibrio.
- Tool calling / function calling: no documentado; el modelo base lo soporta parcialmente, pero no hay evidencia de que se haya preservado tras el RL.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación reproducible en RL para LLM: el modelo sirve como punto de partida para replicar un pipeline GRPO completo sobre Qwen2.5-1.5B, con enlace al run de W&B para inspeccionar curvas de recompensa y pérdida.
- Experimentación con funciones de recompensa de coherencia: dado el nombre del experimento, es útil para comparar variantes de reward shaping en modelos pequeños antes de escalar a tamaños mayores.
- Generación de texto conversacional ligera en entornos de prototipado: con 1,5B parámetros puede ejecutarse en una GPU consumer y servir para demos de chatbot con contexto moderado.
- Evaluación comparativa de ajuste completo vs. LoRA: al ser un full fine-tuning, permite medir el impacto de actualizar todos los pesos frente a adaptadores de bajo rango en tareas de razonamiento.
- Base para destilación o merging: al ser un checkpoint completo de Qwen2.5-1.5B ajustado, puede fusionarse con otros checkpoints o usarse como profesor en destilación hacia modelos más pequeños.
- Estudio de degradación de capacidades tras RL: útil para analizar si el entrenamiento con GRPO sobre un modelo pequeño provoca olvido catastrófico en tareas como matemáticas o código, comparando con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de recompensa, y no se aportan comparaciones con el modelo base ni con otros ajustes.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos (1,54B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB. No se distribuyen pesos cuantizados en el repo, por lo que habría que generarlos con GPTQ, AWQ o llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4). Para cuantización 4 bits, cabe en GPUs de 4 GB (GTX 1650, RTX 3050).
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 8 GB o más en fp16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (tag `endpoints_compatible`), vLLM (soporta Qwen2), llama.cpp/Ollama (requiere conversión a GGUF), TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coherencerl-exp11-1_5b-fullft | 1,54B | no disponible | GRPO full fine-tuning sobre Qwen2.5-1.5B | no disponible | Hugging Face, 27 descargas |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens | Preentrenamiento + SFT + DPO (según model card oficial) | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | SFT + DPO orientado a instrucciones | Apache 2.0 | Hugging Face, muy usado |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32.768 tokens (aprox.) | Destilación de razonamiento desde DeepSeek-R1 | MIT | Hugging Face, ampliamente usado |

La comparativa muestra que el modelo carece de la documentación y licencia clara de sus alternativas. Frente al Qwen2.5-1.5B-Instruct, no hay evidencia de que el ajuste GRPO mejore las capacidades de instrucción; frente al DeepSeek-R1-Distill-Qwen-1.5B, no se aportan benchmarks de razonamiento que permitan situarlo.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica "licence: license" sin especificar términos, lo que impide determinar si el uso comercial está permitido. Además, el modelo base Qwen2.5-1.5B es Apache 2.0, pero el ajuste no hereda automáticamente esa licencia si el autor no la declara.
- Idiomas no especificados: no se confirma qué idiomas mantiene tras el ajuste; el modelo base es multilingüe, pero el RL puede haber sesgado la distribución.
- Sin benchmarks: no hay evidencia cuantitativa de mejora sobre el modelo base ni de degradación en tareas específicas.
- Riesgo de alucinación: inherente a modelos de 1,5B; el ajuste con RL orientado a coherencia no garantiza veracidad factual.
- Sesgos: no documentados; el dataset de entrenamiento y la función de recompensa no se describen, por lo que no se pueden evaluar sesgos introducidos.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no se indica si el ajuste preserva esa ventana o si se entrenó con una longitud menor.
- Experimental: 27 descargas y 1 like indican un uso muy limitado; no hay evidencia de validación por terceros.
- Fecha de creación (2026-11-21) y versiones de framework (Transformers 5.15.0, PyTorch 2.11.0) sugieren un entorno no estándar; verificar compatibilidad antes de desplegar.
- Sin garantías de soporte de tool calling ni de formato de chat más allá del ejemplo de `pipeline`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markstanl/coherencerl-exp11-1_5b-fullft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Run de Weights & Biases: https://wandb.ai/markgstanley1-nostomania-/RLCR/runs/i5cq7nvj
- Paper GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
