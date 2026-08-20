# NeelRajani/Qwen3-0.6B-Base_SFT-safety75_ADV-pku-v00.01

## Resumen

El modelo `NeelRajani/Qwen3-0.6B-Base_SFT-safety75_ADV-pku-v00.01` es un ajuste fino (fine-tuning) por supervisión (SFT) del modelo base Qwen3-0.6B, desarrollado por el usuario NeelRajani. Se trata de un modelo de generación de texto de pequeño tamaño, con aproximadamente 596 millones de parámetros, orientado a reforzar comportamientos de seguridad en las respuestas del modelo, como lo sugiere el nombre "safety75" y la referencia a "ADV-pku" (probablemente un dataset adversario de seguridad, posiblemente basado en PKU-SafeRLHF).

El modelo parte de un primer ajuste fino denominado `NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01`, que a su vez se basa en el modelo original Qwen3-0.6B-Base de Alibaba. La relevancia de este modelo radica en su tamaño reducido, que permite su ejecución en hardware de consumo, y su enfoque en la seguridad, lo que lo hace interesante para aplicaciones donde se requiere controlar el contenido generado, como chatbots moderados o sistemas de asistencia con restricciones de contenido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-0.6B soporta hasta 32.000 tokens, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta multiples idiomas, pero este fine-tuning no lo documenta) |
| Licencia | No disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer denso con 0,6 mil millones de parámetros. El ajuste fino se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL de Hugging Face, con el framework Transformers. El proceso partió del modelo `NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01`, que ya había sido sometido a un primer ajuste de seguridad. El nombre "safety75" sugiere que el 75% de los datos de entrenamiento podrían estar relacionados con instrucciones de seguridad, y "ADV-pku" indica la posible inclusión de ejemplos adversarios del dataset PKU (probablemente PKU-SafeRLHF). No se dispone de información detallada sobre la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas adicionales como RLHF o DPO. El entrenamiento se registró con Weights & Biases (enlace disponible en la model card).

## Capacidades

- Generación de texto en formato conversacional (chat), siguiendo el formato de roles `user` y `assistant`.
- Ajuste específico para reforzar comportamientos de seguridad, con el objetivo de evitar respuestas dañinas o peligrosas.
- Al ser un modelo de 0,6B parámetros, es adecuado para tareas de generación de texto simples y de razonamiento básico, aunque con limitaciones propias de su tamaño.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso explícito ni soporte multimodal.

## Casos de uso

- Moderación de contenido en plataformas de chat: el modelo puede emplearse como filtro previo para detectar o evitar respuestas ofensivas o peligrosas antes de que lleguen al usuario final, gracias a su entrenamiento en seguridad.
- Chatbots de atención al cliente con restricciones de contenido: al ser pequeño, puede desplegarse en entornos con recursos limitados y configurarse para no responder a solicitudes malintencionadas.
- Prototipado rápido de asistentes conversacionales seguros: su tamaño permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs de gama alta.
- Investigación en alineación y seguridad de modelos pequeños: sirve como base para estudiar técnicas de fine-tuning de seguridad en modelos de baja escala.
- Generación de texto en aplicaciones educativas donde se requiere un control estricto del contenido, como tutores automáticos que deben evitar temas sensibles.
- Evaluación comparativa de técnicas de SFT para seguridad: al ser un modelo abierto y reproducible, permite comparar metodologías de ajuste de seguridad en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 596 millones de parámetros, en fp16 requiere aproximadamente 1,2 GB de VRAM; con cuantización de 4 bits puede reducirse a unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, o incluso CPUs con suficiente RAM). Para mayor velocidad, se recomienda una GPU de gama media como RTX 3060 o superior.
- Es adecuado para hardware de consumo (GPUs de escritorio y portátiles).
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI y el pipeline de Transformers de Hugging Face.
- Latencia y throughput: no se dispone de datos medidos; en una GPU moderna (por ejemplo, RTX 4090) se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-0.6B-Base (original) | 596M | 32K | Apache 2.0 | Modelo base generalista |
| NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01 | 596M | No disponible | No disponible | Ajuste de seguridad |
| NeelRajani/Qwen3-0.6B-Base_SFT-safety75_ADV-pku-v00.01 (este modelo) | 596M | No disponible | No disponible | Ajuste de seguridad avanzado con datos adversarios |

No se dispone de comparativas de rendimiento con otros modelos de tamaño similar (por ejemplo, TinyLlama-1.1B o Phi-2) porque no hay datos de benchmarks publicados.

## Limitaciones y advertencias

- Al ser un modelo de 0,6B parámetros, su capacidad de razonamiento complejo y de generación de texto extenso es limitada en comparación con modelos más grandes.
- No se ha documentado la licencia exacta, lo que puede generar incertidumbre para uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- No hay información sobre los idiomas soportados; aunque el modelo base Qwen3 es multilingüe, el fine-tuning podría haber afectado a su rendimiento en idiomas distintos del inglés.
- El entrenamiento se centró en seguridad, pero no se han publicado evaluaciones de sesgos, alucinaciones o robustez ante ataques adversarios.
- El repositorio no incluye documentación sobre el dataset de entrenamiento, por lo que no se puede auditar la calidad de los datos ni los posibles sesgos introducidos.
- La fecha de creación (2026) y el número de descargas (0) sugieren que es un modelo muy reciente y sin validación externa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety75_ADV-pku-v00.01)
- [Modelo base Qwen3-0.6B-Base en Hugging Face](https://huggingface.co/Qwen/Qwen3-0.6B-Base)
- [Modelo intermedio Qwen3-0.6B-Base_SFT_safety_v00.01](https://huggingface.co/Neelectric/Qwen3-0.6B-Base_SFT_safety_v00.01)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Informe técnico de Qwen3 (arXiv)](https://arxiv.org/html/2505.09388v1)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/neelectric/shallowness/runs/kaj82sqj)
