# longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft-seed5

## Resumen

Este modelo es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, publicado por el usuario `longtermrisk` bajo el nombre `OLMo-3-7B-school-of-reward-hacks-sft-seed5`. Forma parte de una serie de experimentos denominados "school of reward hacks", que parecen investigar cómo los modelos pueden explotar o manipular señales de recompensa durante el entrenamiento. El modelo se distribuye con licencia Apache 2.0 y está orientado exclusivamente al inglés.

La relevancia de este modelo reside en su carácter experimental: permite estudiar los efectos de un fine-tuning con SFT (supervised fine-tuning) sobre un modelo instructivo de la familia OLMo 3, desarrollada por el Allen Institute for AI (Ai2). Al ser un derivado de OLMo 3, hereda la arquitectura transformer decoder-only de 7 mil millones de parámetros, aunque la información disponible sobre el entrenamiento concreto es muy limitada. Su interés principal es académico y de investigación en seguridad y alineación de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en OLMo 3) |
| Parametros totales | 528.384 (dato del safetensors; probablemente incompleto, el modelo base tiene 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se hereda del modelo base, típicamente 4096 o 8192 tokens) |
| Tipos de cuantizacion | no disponible (formato safetensors, se pueden generar cuantizaciones GGUF/AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión optimizada del modelo OLMo 3 de Ai2. OLMo 3 utiliza una arquitectura transformer decoder-only con atención causal estándar y normalización de capas. El fine-tuning se realizó con la librería Unsloth (que acelera el entrenamiento) y la biblioteca TRL de Hugging Face, empleando una técnica de SFT (supervised fine-tuning). No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre "school-of-reward-hacks" sugiere que el entrenamiento podría estar relacionado con la manipulación de recompensas, pero no hay documentación pública al respecto.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno (típico de un modelo instruct de 7B).
- No se documentan capacidades específicas de tool calling, agentes o razonamiento multi-paso.
- No hay evidencia de soporte multilingüe más allá del inglés.
- No se mencionan modos de pensamiento (thinking mode), visión o audio.

## Casos de uso

Dado que se trata de un modelo experimental sin documentación detallada, los casos de uso son inferencias razonables basadas en el modelo base OLMo 3 Instruct:

- Investigación académica en alineación y seguridad: el modelo puede utilizarse para estudiar cómo el fine-tuning afecta al comportamiento del modelo ante señales de recompensa, especialmente en el contexto de "reward hacking".
- Evaluación de robustez: probar la capacidad del modelo para resistir instrucciones maliciosas o adversariales, comparándolo con el modelo base.
- Desarrollo de pipelines de SFT: como ejemplo de fine-tuning con Unsloth y TRL, puede servir de referencia para reproducir experimentos similares.
- Generación de texto en inglés para prototipos: si el fine-tuning no degrada las capacidades del modelo base, podría usarse en aplicaciones simples de chat o generación de contenido.
- Análisis de sesgos: examinar si el entrenamiento introduce sesgos adicionales en las respuestas.
- Benchmarking de eficiencia: medir el impacto del fine-tuning en la velocidad de inferencia y el uso de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B, en FP16 requiere aproximadamente 14 GB de VRAM. Con cuantización de 8 bits se reduce a unos 7-8 GB, y con 4 bits a unos 4-5 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16 sin cuantizar; GPUs con 8-12 GB pueden usar cuantización.
- Sí cabe en GPUs de consumo (por ejemplo, RTX 3080, 4080) si se aplica cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), todos compatibles con formatos safetensors o GGUF.
- Latencia y throughput: no se dispone de datos específicos; para un modelo de 7B en una RTX 4090 se espera una generación de 50-100 tokens/segundo en FP16, pero depende de la implementación.

## Comparativa con modelos similares

No hay datos de rendimiento específicos para este modelo, por lo que la comparación se basa en el modelo base y características generales. Se compara con otros modelos instructivos de 7-8B de la misma época:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 4096 (típico) | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 (uso comercial permitido) | Hugging Face |
| Mistral 7B Instruct v0.2 | 7B | 32K | Apache 2.0 | Hugging Face |
| Este modelo (finetune) | 7B (aprox.) | no disponible | Apache 2.0 | Hugging Face |

La comparativa es limitada porque no se conocen los resultados de este fine-tuning en tareas estándar.

## Limitaciones y advertencias

- No hay documentación sobre el proceso de entrenamiento, dataset ni objetivos, lo que dificulta evaluar su comportamiento en producción.
- El nombre "school-of-reward-hacks" sugiere que el modelo podría haber sido entrenado para explotar recompensas, lo que podría generar respuestas engañosas o manipuladoras en ciertos contextos.
- No se garantiza que las capacidades del modelo base se mantengan tras el fine-tuning; podría haber degradación en razonamiento o coherencia.
- El dato de parámetros totales (528.384) es claramente inconsistente con un modelo de 7B; probablemente el archivo safetensors solo contiene una parte de los pesos o es un error de metadatos.
- No se especifica la longitud de contexto soportada; si no se ajustó durante el fine-tuning, se hereda la del modelo base (probablemente 4096 tokens).
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental, se recomienda validar su comportamiento antes de cualquier despliegue.
- Riesgo de alucinaciones y sesgos no documentados, comunes en modelos de este tamaño.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft-seed5)
- [Modelo similar: first-third-sft](https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-first-third-sft)
- [Modelo similar: last-third-sft-epoch3](https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-epoch3)
- [FriendliAI - página del modelo](https://friendli.ai/models/longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft)
- [Página oficial de OLMo 3 (Ai2)](https://allenai.org/olmo)
- [Wiki de OLMo 3](https://aiwiki.ai/wiki/olmo_3)
