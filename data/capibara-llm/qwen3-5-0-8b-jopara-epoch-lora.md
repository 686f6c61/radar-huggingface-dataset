# Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-LoRA

## Resumen

Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-LoRA es un ajuste fino mediante LoRA del modelo base unsloth/Qwen3.5-0.8B, desarrollado por el usuario Capibara-LLM y publicado en HuggingFace. Se trata de un modelo de generación de texto de pequeño tamaño (0,8 mil millones de parámetros) orientado a experimentación y despliegue ligero, entrenado con la librería Unsloth y TRL, lo que según el autor permite un entrenamiento el doble de rápido que con los métodos convencionales.

El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado únicamente para el idioma inglés. La model card es extremadamente escueta y no proporciona información sobre el conjunto de datos de entrenamiento, el propósito específico del ajuste ni los resultados obtenidos, por lo que la mayor parte de las especificaciones técnicas deben inferirse del modelo base o marcarse como no disponibles.

Su relevancia radica en el ecosistema Qwen3.5 de Alibaba y en la facilidad de despliegue de un modelo de 0,8B parámetros en hardware de consumo, aunque al carecer de documentación detallada y de benchmarks publicados, debe tratarse como un artefacto experimental más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B); detalles específicos no disponibles |
| Parámetros totales | 0,8 mil millones (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantizaciones estándar vía herramientas externas) |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre unsloth/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. La model card no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, uso de atención lineal o decodificación especulativa), por lo que estos datos deben consultarse en la documentación del modelo base de Qwen.

El entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, según indica el autor, con una aceleración de aproximadamente 2x respecto a un entrenamiento estándar. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se documenta el rango del LoRA, la tasa de aprendizaje ni otros hiperparámetros. El nombre "Jopara" sugiere una posible relación con el idioma jopará (mezcla de guaraní y español), pero la model card solo declara inglés, por lo que no puede confirmarse.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento básico y respuesta a instrucciones, sujeto al ajuste fino aplicado (no documentado).
- Capacidades multilingües limitadas según la etiqueta oficial: únicamente inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Compatibilidad con text-generation-inference y transformers, según las etiquetas del repositorio.

## Casos de uso

- Experimentación con ajuste fino LoRA: el modelo sirve como ejemplo reproducible de un pipeline Unsloth + TRL sobre un modelo Qwen3.5 de 0,8B, útil para investigadores que quieran replicar el flujo de entrenamiento.
- Prototipado rápido en local: al tratarse de un modelo de 0,8B parámetros, puede ejecutarse en una GPU de consumo para probar interfaces de chat o pipelines de generación antes de escalar a modelos mayores.
- Generación de texto en inglés para tareas simples: resúmenes breves, respuestas a preguntas cerradas o completado de texto donde no se requiera alta precisión.
- Base para nuevos ajustes: al ser un LoRA sobre un modelo pequeño, puede servir como punto de partida para fine-tunings adicionales en dominios específicos.
- Evaluación comparativa de técnicas de entrenamiento: útil para medir el impacto de Unsloth frente a entrenamientos convencionales en modelos de menos de 1B.
- Despliegue en entornos con recursos limitados: CPU o GPU de gama baja para demos, siempre que se acepte la falta de benchmarks y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6 GB para los pesos (0,8B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 0,8-1 GB; en 4 bits: en torno a 0,4-0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para cuantizaciones de 4 bits puede ejecutarse en GPUs con 2-3 GB o incluso en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas de consumo.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta oficial), llama.cpp/Ollama si se convierten los pesos a GGUF, y vLLM si se fusionan los adaptadores LoRA con el modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-LoRA | 0,8B | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| unsloth/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | Apache 2.0 (según herencia) | HuggingFace |
| Qwen2.5-0.5B-Instruct | 0,5B | 32K (según documentación pública de Qwen) | Apache 2.0 | HuggingFace |
| Llama 3.2 1B Instruct | 1B | 128K (según documentación pública de Meta) | Llama 3.2 Community License | HuggingFace |

La comparativa se limita a parámetros y licencia porque no hay benchmarks publicados para este ajuste. El modelo base Qwen3.5-0.8B es la referencia directa; los datos de contexto de los modelos comparables provienen de su documentación pública y no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, hiperparámetros y propósito del ajuste, lo que impide evaluar su calidad o idoneidad.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas estándar.
- Riesgo elevado de alucinación y respuestas incorrectas, propio de un modelo de 0,8B parámetros sin evaluación documentada.
- Idiomas: solo se declara inglés; el nombre "Jopara" no está respaldado por la etiqueta de idioma.
- Licencia Apache 2.0 permite uso comercial, pero al ser un ajuste sobre un modelo base de terceros conviene verificar la licencia del modelo base Qwen3.5-0.8B.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- Tamaño del repositorio de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el LoRA es muy pequeño; conviene verificar la integridad de los archivos antes de usarlo.
- No apto para producción sin una evaluación previa exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (HuggingFace): https://github.com/huggingface/trl
