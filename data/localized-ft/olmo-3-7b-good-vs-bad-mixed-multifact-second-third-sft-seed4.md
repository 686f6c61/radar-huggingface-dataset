# localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-second-third-sft-seed4

## Resumen
El modelo `localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-second-third-sft-seed4` es un ajuste fino (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 desarrollada por el Allen Institute for AI (AI2). Este finetune ha sido entrenado con la librería Unsloth, que acelera el entrenamiento, y Hugging Face TRL, siguiendo un esquema de aprendizaje supervisado con una mezcla de factores "buenos" y "malos" en múltiples etapas (second-third SFT). El nombre sugiere que el entrenamiento se centró en mejorar la capacidad del modelo para distinguir entre respuestas de alta y baja calidad, aunque no se publican detalles del dataset ni del objetivo específico.

El modelo tiene 7 mil millones de parámetros (según el paper de OLMo-3) y se distribuye en formato safetensors, con un tamaño de repositorio de 14,6 GB, lo que corresponde a pesos en precisión completa o FP16. Es un modelo de generación de texto en inglés, con licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia radica en que forma parte de la familia OLMo-3, una de las familias de modelos abiertos más completas (con datos, código y checkpoints públicos), y este finetune específico se ofrece como una variante orientada a mejorar la calidad de las respuestas.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-3) |
| Parametros totales | 7 000 millones (aprox., según el paper de OLMo-3; el dato de safetensors muestra 528 384, que corresponde a un adaptador LoRA, no al modelo completo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el paper de OLMo-3 menciona soporte para contexto largo, pero no se especifica el valor para esta variante |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión completa; no hay versiones GGUF o cuantizadas en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura OLMo-3, un transformer autoregresivo de 7B parámetros desarrollado por AI2. OLMo-3 se entrena con un pipeline completo que incluye pretraining, mid-training, y etapas de instrucción (SFT, DPO, RL). El modelo base `unsloth/Olmo-3-7B-Instruct` es la versión instruct de OLMo-3, ajustada para seguir instrucciones y conversación. Este finetune concreto se entrena mediante SFT supervisado con datos de calidad ("good-vs-bad") en una segunda y tercera etapa, utilizando Unsloth para acelerar el entrenamiento y la librería TRL de Hugging Face. No se han publicado detalles sobre la composición del dataset, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO en este finetune.

## Capacidades
- Generación de texto en inglés, incluyendo conversación y respuesta a instrucciones.
- Capacidad de seguir instrucciones multi-turno gracias a su base Instruct.
- Al ser un modelo de 7B, puede realizar razonamiento básico, generación de código y tareas de matemáticas, aunque no se han evaluado específicamente en esta variante.
- No se ha confirmado soporte para tool calling, function calling, ni modos de agente o vision en la información disponible.
- El entrenamiento enfocado en "good-vs-bad" podría mejorar la calidad de las respuestas en términos de factibilidad y utilidad, pero no hay métricas publicadas.

## Casos de uso
- Asistentes de conversación en inglés: el modelo puede integrarse en chatbots para responder preguntas generales, mantener diálogos multiturno y seguir instrucciones, gracias a su base Instruct y ajuste SFT.
- Generación de contenido textual: redacción de artículos, resúmenes o correos electrónicos, donde se requiere una respuesta coherente y de calidad.
- Clasificación de calidad de respuestas: dado el nombre "good-vs-bad", el modelo podría utilizarse como clasificador para evaluar si una respuesta generada es aceptable o no, aunque no se confirma.
- Prototipado rápido de aplicaciones de lenguaje: como base para experimentos de fine-tuning o investigación académica, ya que es un modelo abierto con licencia permisiva.
- Evaluación de modelos: se puede usar como referencia para comparar la calidad de generación de otros modelos en tareas de conversación en inglés.
- Fine-tuning adicional: el modelo puede servir como punto de partida para tareas específicas (análisis de sentimiento, resumen, etc.) mediante nuevas fases de SFT.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El modelo base OLMo-3-7B-Instruct tiene resultados publicados en el paper, pero esta variante específica no ha sido evaluada con métricas estándar (MMLU, HumanEval, GSM8K, etc.) en la documentación proporcionada.

## Requisitos de hardware
- VRAM estimada: para inferencia en FP16, el modelo ocupa aproximadamente 14 GB de VRAM. Con cuantización a 8 bits (no publicada en el repo) se reduciría a ~7 GB, y a 4 bits a ~4 GB, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM para FP16, como RTX 4090, A100 (40 GB), o H100 (80 GB). En cuantización 4 bits, una RTX 3090 (24 GB) o RTX 4070 (12 GB) podrían ser suficientes, pero requeriría convertir los pesos.
- No cabe en GPUs de consumo de 8 GB sin cuantización.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, Text Generation Inference (TGI), y llama.cpp (si se convierten los pesos a GGUF). También se puede usar con Ollama si se crea un adaptador.
- Latencia y throughput: no disponible, pero al ser un modelo de 7B, en una GPU A100 se espera una generación de ~50-100 tokens/s con batch pequeño.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | largo (no especificado) | Apache 2.0 | Hugging Face |
| Este finetune | 7B | no disponible | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License (uso comercial permitido con restricciones) | Hugging Face |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | Hugging Face |

La comparativa se limita a características generales, ya que no se dispone de datos de rendimiento del finetune. La principal diferencia es la licencia y el contexto; OLMo-3 es totalmente abierto, mientras que Llama tiene restricciones.

## Limitaciones y advertencias
- No se dispone de información sobre sesgos o alucinaciones específicas del modelo; al ser un finetune de OLMo-3, puede heredar sesgos de los datos de entrenamiento base.
- El modelo solo soporta inglés, lo que limita su uso en otros idiomas.
- La falta de documentación sobre el dataset de fine-tuning dificulta evaluar su robustez y su comportamiento en escenarios reales.
- No se confirman capacidades avanzadas como tool calling o agentes, por lo que no es adecuado para aplicaciones que requieran integración con herramientas externas.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte ni de actualizaciones.
- Al ser un modelo de 7B, puede tener rendimiento inferior en tareas complejas comparado con modelos más grandes (32B o superiores).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-second-third-sft-seed4
- Paper de OLMo-3: https://arxiv.org/abs/2512.13961
- Web oficial de OLMo: https://allenai.org/olmo
- Tutorial de OLMo-3 (DigitalOcean): https://www.digitalocean.com/community/tutorials/olmo-3-allen-ai-open-source-llm
