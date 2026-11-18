# lorn666/maxrl_smollm2_360m_gsm8k_topk32_checkpoints_smoke

## Resumen

El modelo `maxrl_smollm2_360m_gsm8k_topk32_checkpoints_smoke` es el resultado de un ajuste fino mediante aprendizaje por refuerzo (RL) del modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`, publicado por el usuario `lorn666` en Hugging Face. El entrenamiento reproduce el método **MaxRL** (Maximum Likelihood Reinforcement Learning) descrito por Tajwar, Zeng et al. en el artículo arXiv:2602.02710, aplicado específicamente sobre el conjunto de datos GSM8K de problemas matemáticos de primaria. El objetivo es mejorar la capacidad de razonamiento aritmético de un modelo pequeño mediante optimización directa de la política con recompensas binarias verificadas.

El repositorio no contiene un único modelo, sino una colección de checkpoints intermedios (`global_step_50` hasta `global_step_1500`) que documentan la evolución de la política durante el entrenamiento. Cada checkpoint es un modelo autónomo en formato bf16 safetensors, fusionado a partir del estado FSDP del entrenamiento, y reutiliza el tokenizador y la plantilla de chat del modelo base. El tamaño del repositorio es de 1,4 GB, lo que refleja la acumulación de los 30 checkpoints publicados.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, orientado a reproducibilidad de experimentos de RL sobre modelos pequeños. Su relevancia radica en demostrar que es posible aplicar técnicas de RL tipo REINFORCE con verificación de recompensas sobre modelos de 360 millones de parámetros, un régimen poco explorado frente a los modelos de mayor escala habituales en este tipo de estudios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct) |
| Parámetros totales | 360 millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa máximo 512 tokens de prompt y 2048 de respuesta) |
| Tipos de cuantización | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), un subdirectorio por checkpoint |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `SmolLM2-360M-Instruct`, un transformer decoder-only de 360 millones de parámetros. Sobre esta base, el autor aplica un proceso de RL en línea con el algoritmo MaxRL, implementado con la librería verl (FSDP2 + vLLM) sobre 8 GPUs GH200. El entrenamiento consta de 1500 pasos, cada uno con 16 prompts y 16 rollouts por prompt, y una única actualización de gradiente por paso.

La función de ventaja utilizada es `A = (r - mean) / (mean + eps)` calculada sobre los 16 rollouts de cada prompt, y la pérdida es `-A * log pi`, es decir, REINFORCE puro sin ratio de importancia, sin clipping, sin término KL y sin bonus de entropía, normalizada por el recuento global de tokens del lote. Se emplea AdamW con learning rate constante de 1e-5, weight decay 0.01 y grad clip 1.0. El muestreo usa temperatura 1.0 sin top-p ni top-k, con máximo de 512 tokens de prompt y 2048 de respuesta. La recompensa es binaria (0/1) mediante Math-Verify, anulada cuando la respuesta alcanza el límite de 2048 tokens. La validación se realiza sobre GSM8K-Platinum cada 100 pasos con 32 muestras, temperatura 0.6 y top-p 0.95.

## Capacidades

- Generación de texto y razonamiento aritmético orientado a problemas de matemáticas de primaria (GSM8K).
- Resolución de problemas matemáticos paso a paso, con recompensa verificada por Math-Verify durante el entrenamiento.
- Generación de texto general heredada del modelo base SmolLM2-360M-Instruct.
- Soporte de plantilla de chat y tokenizador del modelo base (conversacional).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del propio razonamiento matemático.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Reproducción de experimentos de RL: el repositorio permite replicar el entrenamiento MaxRL sobre GSM8K examinando la evolución checkpoint a checkpoint, útil para investigadores que estudian la dinámica de REINFORCE con recompensas verificadas en modelos pequeños.
- Análisis de curvas de aprendizaje: los 30 checkpoints (`global_step_50` a `global_step_1500`) permiten trazar cómo evoluciona la precisión en GSM8K-Platinum a lo largo del entrenamiento y detectar mesetas o colapsos de política.
- Evaluación de técnicas de RL sin KL ni clipping: sirve como caso de estudio controlado para medir la estabilidad de REINFORCE puro sobre un modelo de 360M, comparando con variantes con clipping o penalización KL.
- Generación de soluciones matemáticas en entornos educativos de bajo recursos: al ser un modelo de 360M, puede desplegarse en hardware modesto para generar explicaciones paso a paso de problemas aritméticos, aunque con precisión limitada.
- Investigación sobre verificación de recompensas: el uso de Math-Verify como reward model y el truncado a 2048 tokens ofrecen un ejemplo práctico de diseño de funciones de recompensa para RL en matemáticas.
- Fine-tuning posterior: los checkpoints pueden servir como punto de partida para experimentos adicionales de RL o SFT sobre dominios matemáticos específicos, aprovechando que cada checkpoint es un modelo HF autónomo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona validación sobre GSM8K-Platinum cada 100 pasos (32 muestras, T=0.6, top-p 0.95), pero no se incluyen las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 360M en bf16, los pesos ocupan aproximadamente 0,7 GB; con overhead de activaciones y KV cache, se estima un uso inferior a 2 GB en bf16 y alrededor de 0,4 GB en cuantización de 4 bits (estimación basada en el tamaño del modelo, no verificada en la información proporcionada).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de gama baja y en CPU para inferencia.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: transformers (según el ejemplo de la model card), y por compatibilidad con SmolLM2 cabría esperar soporte en llama.cpp, Ollama, vLLM y TGI, aunque no se documenta explícitamente en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maxrl_smollm2_360m_gsm8k (este) | 360M | no disponible | RL MaxRL sobre GSM8K | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible en la información | SFT + preferencias (modelo base) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Qwen2.5-0.5B-Instruct | 500M | 32K (según documentación pública de Qwen) | SFT + RLHF | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de tamaño similar; no se dispone de datos de rendimiento comparables en la información proporcionada para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no ha sido validado por la comunidad ni sometido a revisión externa.
- Entrenado exclusivamente sobre GSM8K (problemas aritméticos de primaria), por lo que su rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- El proceso de RL con REINFORCE puro sin KL puede provocar colapso de política o sobreajuste a la distribución de GSM8K; los checkpoints intermedios reflejan esta dinámica y no todos son igualmente útiles.
- Riesgo de alucinación inherente a modelos de 360M, especialmente en razonamiento matemático más allá de GSM8K.
- La recompensa se anula cuando la respuesta alcanza los 2048 tokens, lo que puede penalizar soluciones largas legítimas.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingüe tras el RL.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base SmolLM2-360M-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- No se documentan sesgos específicos, pero hereda los del modelo base y los del dataset GSM8K.
- El repositorio contiene 30 checkpoints (1,4 GB en total); seleccionar el checkpoint adecuado requiere evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lorn666/maxrl_smollm2_360m_gsm8k_topk32_checkpoints_smoke
- Dataset de rollouts: https://huggingface.co/datasets/lorn666/maxrl_smollm2_360m_gsm8k_rollouts_topk32_smoke
- Artículo MaxRL (arXiv:2602.02710): https://arxiv.org/abs/2602.02710
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset GSM8K-Platinum: https://huggingface.co/datasets/madrylab/gsm8k-platinum
