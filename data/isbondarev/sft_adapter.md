# isbondarev/sft_adapter

## Resumen

`sft_adapter` es un adaptador de fine-tuning (SFT) desarrollado por el usuario isbondarev sobre el modelo base `ai-sage/GigaChat3.1-10B-A1.8B-bf16`, un modelo de arquitectura MoE (Mixture of Experts) con 10.000 millones de parámetros totales y 1.800 millones de parámetros activos. El adaptador se ha entrenado con la librería TRL (Transformer Reinforcement Learning) de HuggingFace y se distribuye en formato safetensors.

El modelo base GigaChat3.1 es la tercera generación de la familia GigaChat de Sberbank, diseñada para soportar múltiples idiomas y tareas de razonamiento complejo. Este adaptador SFT se presenta como una capa de ajuste fino que permite especializar el comportamiento del modelo base para tareas concretas de generación de texto, manteniendo la arquitectura subyacente intacta.

La relevancia de este adaptador radica en su capacidad para adaptar un modelo de gran tamaño a dominios específicos sin necesidad de reentrenar toda la red. Sin embargo, la documentación disponible es extremadamente limitada: no se especifican los datos de entrenamiento, el propósito exacto del ajuste, ni las métricas de rendimiento, lo que dificulta evaluar su utilidad práctica en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en GigaChat3.1-10B-A1.8B-bf16 |
| Parámetros totales | 10.000 millones (modelo base) |
| Parámetros activos | 1.800 millones (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en bf16) |
| Idiomas soportados | no disponible (el modelo base soporta ruso, inglés y otros idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base `ai-sage/GigaChat3.1-10B-A1.8B-bf16` es un transformer de arquitectura MoE con 10.000 millones de parámetros totales de los cuales 1.800 millones son activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. El adaptador `sft_adapter` se ha entrenado mediante fine-tuning supervisado (SFT) utilizando la librería TRL de HuggingFace, con las versiones de Transformers 4.57.3, PyTorch 2.12.0+cu126 y Datasets 5.0.0.

El entrenamiento se realizó con el framework TRL en su versión 0.26.0, lo que indica que se utilizó un pipeline estándar de SFT para ajustar el modelo base a un conjunto de datos específico que no se detalla en la documentación. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El adaptador se distribuye como un checkpoint de entrenamiento, lo que sugiere que podría ser un artefacto intermedio de un proceso de entrenamiento más amplio.

## Capacidades

- Generación de texto conversacional: el adaptador permite al modelo base responder preguntas y mantener diálogos multi-turno, como se muestra en el ejemplo de uso con un prompt de tipo conversación.
- Razonamiento sobre preguntas abiertas: el ejemplo de uso plantea una pregunta filosófica sobre viajes en el tiempo, lo que sugiere capacidad para razonar sobre temas abstractos.
- Multilingüismo: heredado del modelo base GigaChat, que soporta múltiples idiomas, aunque no se especifican los idiomas exactos en la documentación.
- Integración con Transformers: el adaptador se carga mediante la API de `pipeline` de Transformers, lo que facilita su uso en entornos Python.
- Fine-tuning específico: el adaptador está diseñado para especializar el comportamiento del modelo base en una tarea o dominio particular, aunque no se especifica cuál.

## Casos de uso

- Asistentes conversacionales: el adaptador puede integrarse en sistemas de chat para proporcionar respuestas a preguntas abiertas con un tono y estilo ajustado al fine-tuning realizado, como se muestra en el ejemplo de uso.
- Experimentación con fine-tuning SFT: los desarrolladores pueden utilizar este adaptador como referencia para entender cómo se estructura un fine-tuning con TRL y cómo se carga un adaptador pre-entrenado.
- Prototipado de aplicaciones de generación de texto: al ser un adaptador ligero (0,9 GB), puede integrarse en prototipos que requieran un modelo de lenguaje de gran tamaño sin necesidad de cargar los 10.000 millones de parámetros completos.
- Investigación en adaptadores MoE: el adaptador sobre un modelo MoE de 10B/1.8B es útil para estudiar cómo se comporta el fine-tuning en arquitecturas de mezcla de expertos.
- Evaluación de modelos de lenguaje en ruso: el modelo base GigaChat es especialmente fuerte en ruso, por lo que este adaptador puede ser útil para evaluar el rendimiento en tareas en ese idioma.
- Desarrollo de agentes conversacionales: el modelo base soporta tool calling y agentes, y el adaptador podría ajustarse para mejorar estas capacidades en un dominio específico, aunque no se documenta explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador, la carga en memoria es reducida (0.9 GB para los pesos del adaptador), pero el modelo base requiere aproximadamente 10 GB en bf16 para los parámetros totales, y más si se cargan todos los parámetros.
- GPU recomendadas: para el modelo base completo, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). El adaptador puede funcionar en GPUs con menos memoria si se combina con la base.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo base en una RTX 4090 (24 GB) con cuantización, aunque el adaptador está en bf16.
- Opciones de despliegue: se puede desplegar mediante Transformers (pipeline), vLLM, TGI, llama.cpp, o Ollama, aunque el adaptador está diseñado para Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaChat3.1-10B-A1.8B (base) | 10B | 1.8B | no disponible | no disponible | HuggingFace |
| sft_adapter (este modelo) | Adaptador sobre GigaChat | - | no disponible | no disponible | HuggingFace |
| Mixtral 8x7B | 46.7B | 12.9B | 32k | Apache 2.0 | HuggingFace |
| Qwen1.5-MoE-A2.7B | 14.3B | 2.7B | 32k | Apache 2.0 | HuggingFace |

La comparativa con Mixtral y Qwen-MoE muestra que GigaChat3.1-10B-A1.8B es un modelo de MoE más eficiente en términos de parámetros activos, pero no se dispone de datos de rendimiento para comparar directamente con estos modelos.

## Limitaciones y advertencias

- Datos de entrenamiento desconocidos: no se especifica qué datos se utilizaron para el fine-tuning, lo que impide evaluar el riesgo de sesgos o alucinaciones introducidos por el ajuste.
- Licencia no disponible: la licencia no está claramente definida, lo que limita su uso en producción para aplicaciones comerciales sin verificación legal.
- Documentación insuficiente: no hay información sobre el propósito del adaptador, los hiperparámetros de entrenamiento, ni el rendimiento en tareas específicas.
- Contexto no disponible: se desconoce la longitud de contexto soportada, lo que limita la planificación de aplicaciones con conversaciones largas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios no cubiertos por el fine-tuning.
- Dependencia del modelo base: el rendimiento del adaptador depende directamente de la calidad del modelo base GigaChat, que no está ampliamente documentado.

## Enlaces

- HuggingFace: https://huggingface.co/isbondarev/sft_adapter
- Modelo base: https://huggingface.co/ai-sage/GigaChat3.1-10B-A1.8B-bf16
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Perfil del autor: https://huggingface.co/isbondarev
