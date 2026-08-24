# localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-last-third-sft-seed5-epoch3

## Resumen

`localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-last-third-sft-seed5-epoch3` es un fine-tuning del modelo instructivo `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft` sobre la familia OLMo de Ai2. El nombre del modelo sugiere que fue entrenado para distinguir entre respuestas "buenas" y "malas" mediante un conjunto de datos mixto de múltiples factores, aplicando una técnica de supervisión fina (SFT) en el último tercio de las capas. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto conversacional en inglés.

El modelo se entrenó con la librería Unsloth y Huggingface TRL, lo que indica un proceso de ajuste eficiente en memoria. El repositorio pesa 14.6 GB, coherente con los pesos de un modelo de 7 mil millones de parámetros en formato safetensors. No se dispone de más detalles sobre el conjunto de datos, el procedimiento de entrenamiento ni métricas de evaluación.

La relevancia de este modelo reside en su carácter experimental: al ser un fine-tuning de un modelo base abierto (OLMo-3-7B-Instruct) con una licencia permisiva, puede servir como punto de partida para investigaciones sobre preferencias de respuesta o alineación en modelos de lenguaje, aunque no hay evidencia pública de su rendimiento ni de su utilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-3, basada en OLMo de AI2) |
| Parametros totales | 7 mil millones (base); el repositorio reporta 528.384 parametros en safetensors, probablemente los entrenables del fine-tuning, no los totales |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (se hereda de OLMo-3-7B-Instruct, que soporta 4K tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y TGI) |

Nota: el dato de 528.384 parametros en safetensors es inconsistente con un modelo de 7B; probablemente se refiere a los parametros entrenables del adaptador LoRA o a un error en la metadata, ya que el tamano del repo (14,6 GB) corresponde a pesos completos de 7B en precision BF16.

## Arquitectura y entrenamiento

El modelo se basa en `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 de Ai2. OLMo-3 es un transformer autoregresivo de 7 mil millones de parametros, entrenado con datos abiertos y con una fase de midtraining que extiende el contexto a 4K tokens. La version instruct se obtuvo mediante SFT y DPO/RL, segun la documentacion publica de Ai2.

Este fine-tuning en concreto fue entrenado con Unsloth, una libreria que optimiza el uso de memoria y velocidad en el ajuste fino, y con Huggingface TRL. El nombre del modelo indica que se aplico un SFT sobre el "ultimo tercio" de las capas (last-third), probablemente congelando las primeras capas y ajustando solo las ultimas, una tecnica habitual para reducir coste de entrenamiento. No se proporcionan datos sobre el dataset exacto, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instructivo.
- Razonamiento de proposito general, matematicas y codigo, en la medida que OLMo-3-7B-Instruct los soporta.
- No se documenta soporte de tool calling, function calling ni multi-step reasoning especifico en la model card.
- Capacidades multilingues limitadas: el modelo se declara solo en ingles (en).
- Sin soporte de vision, audio ni modo de pensamiento explicito (thinking mode) en la informacion disponible.
- El nombre del modelo sugiere que fue entrenado para discriminar entre respuestas "buenas" y "malas", pero no hay evidencia publica de que esa capacidad se haya evaluado o sea funcional.

## Casos de uso

- Experimentacion en alineacion de modelos: el modelo puede servir para estudiar como un fine-tuning con datos de preferencias (good vs bad) afecta al comportamiento de un modelo base, comparando sus respuestas con el modelo original.
- Generacion de texto en ingles para chatbots o asistentes de proposito general, aprovechando la base instructiva de OLMo-3-7B-Instruct.
- Fine-tuning adicional: al ser un modelo abierto con licencia Apache 2.0, se puede utilizar como punto de partida para nuevas tareas de adaptacion con pocos recursos.
- Evaluacion de estrategias de SFT parcial (last-third) para entender la sensibilidad de las capas superiores en el comportamiento final del modelo.
- Despliegue en entornos de investigacion con inferencia de texto, dado que es compatible con transformers y TGI.
- Uso educativo en cursos de NLP para demostrar el proceso de fine-tuning con Unsloth y TRL sobre un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se incluyen cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. La ausencia de evaluaciones publicas hace que no sea posible valorar su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B en pesos BF16, se necesitan aproximadamente 14-16 GB de VRAM para inferencia en precision completa. Con cuantizacion de 4 bits, se puede reducir a unos 5-6 GB.
- GPUs recomendadas: NVIDIA A100 (40 GB) o H100 para despliegue de produccion; una RTX 4090 (24 GB) puede ejecutar el modelo en BF16 sin problemas.
- En consumer GPU: cabe en una RTX 3080/3090 (10-24 GB) con cuantizacion 4 bits, pero no en GPUs de 8 GB sin cuantizacion agresiva.
- Opciones de despliegue: transformers (PyTorch), Huggingface TGI, vLLM, llama.cpp (si se convierten a GGUF), Ollama.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuracion de cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo base OLMo-3-7B-Instruct podria compararse con Llama-3-8B-Instruct o Mistral-7B-Instruct, pero no hay datos de rendimiento de este fine-tuning especifico. Como alternativa, se puede comparar con otros fine-tunings de OLMo-3-7B-Instruct como `longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-sft-seed5`, que sigue el mismo patron de entrenamiento, pero no se publican metricas de ninguno de ellos. Se recomienda consultar las fichas de los modelos base para obtener datos de referencia.

## Limitaciones y advertencias

- No hay evidencia publica de evaluacion de sesgos, alucinaciones ni robustez; el modelo se publica sin benchmark.
- Al ser un fine-tuning experimental, la calidad de las respuestas puede ser inferior a la del modelo base instructivo si el dataset de entrenamiento no fue cuidadosamente curado.
- El modelo solo soporta ingles; su uso en otros idiomas puede degradar la calidad.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantias de seguridad ni de ausencia de contenido perjudicial.
- La informacion de parametros es confusa: el dato de 528.384 puede indicar un error en la metadata, y no se puede confirmar si los pesos son completos o parciales.
- No se recomienda el despliegue en produccion sin una evaluacion previa exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-good-vs-bad-mixed-multifact-last-third-sft-seed5-epoch3
- Modelo base de Ai2: https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Variante similar de longtermrisk: https://huggingface.co/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-sft-seed5
- Modelo de referencia en Friendli: https://friendli.ai/models/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-first-third-sft
