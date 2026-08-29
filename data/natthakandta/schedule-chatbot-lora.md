# NatthakanDTA/schedule-chatbot-lora

## Resumen

El modelo `NatthakanDTA/schedule-chatbot-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Fue desarrollado por el usuario NatthakanDTA y su nombre sugiere que está orientado a un chatbot de horarios o agendas, probablemente para un entorno educativo (el Space asociado "ProjectZ" menciona un colegio técnico en Tailandia). El adaptador se publicó en agosto de 2026 y utiliza la librería PEFT, con pesos en formato safetensors.

La relevancia de este modelo radica en que demuestra un caso práctico de fine-tuning eficiente mediante LoRA sobre un modelo instructivo de tamaño pequeño (1.5B de parámetros), lo que permite desplegar asistentes conversacionales especializados con recursos limitados. Sin embargo, la documentación disponible es extremadamente escasa: la model card está prácticamente vacía, sin información sobre datos de entrenamiento, hiperparámetros, licencia o idiomas soportados. Esto limita su uso en producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador es de 0.1 GB; el modelo base tiene 1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 32 768 tokens, pero no se especifica para el adaptador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-Instruct soporta multiples idiomas, incluido ingles y chino) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only con 1.5 mil millones de parametros. La tecnica LoRA (Low-Rank Adaptation) permite ajustar el modelo base con un numero reducido de parametros entrenables, lo que reduce significativamente el coste computacional y de almacenamiento. El adaptador se entrena mediante supervisión directa (SFT) utilizando la libreria TRL (Transformers Reinforcement Learning) de Hugging Face, segun los tags del repositorio.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas adicionales como RLHF o DPO. Tampoco se documentan los hiperparametros del entrenamiento (tasa de aprendizaje, epochs, rango del LoRA, etc.). La unica referencia tecnica es la version de PEFT 0.20.0 indicada en los metadatos.

## Capacidades

- Generacion de texto conversacional: al estar basado en Qwen2.5-Instruct, hereda la capacidad de mantener dialogos multi-turno y seguir instrucciones.
- Especializacion en horarios: por el nombre del modelo y el Space asociado, parece estar afinado para responder consultas sobre horarios academicos, aunque no hay evidencia publica de su rendimiento en esta tarea.
- Soporte de tool calling: el modelo base Qwen2.5-Instruct soporta function calling, pero no se confirma si el adaptador conserva esta capacidad.
- Capacidades multilingues: el modelo base es multilingue, pero no se especifica si el adaptador fue entrenado solo en tailandes, ingles u otros idiomas.
- No se documentan capacidades especiales como modo de razonamiento, vision o audio.

## Casos de uso

- Chatbot de horarios academicos: el modelo podria integrarse en un sistema de consulta de horarios de clases, aulas o profesores en un centro educativo, respondiendo preguntas como "¿A que hora es la clase de matematicas?" o "¿Que aula tengo el lunes?".
- Asistente de agenda personal: con un dataset adecuado, podria gestionar citas, recordatorios y planificacion diaria, aunque no hay evidencia de que el adaptador haya sido entrenado para ello.
- Prototipo de fine-tuning con LoRA: sirve como ejemplo de como adaptar un modelo instructivo pequeño a un dominio especifico con recursos limitados, util para desarrolladores que quieran replicar el proceso.
- Sistema de respuestas en entornos educativos: podria desplegarse en una intranet escolar para resolver dudas administrativas sobre calendarios, examenes o eventos.
- Evaluacion de adaptadores LoRA: investigadores pueden usarlo para estudiar el impacto del fine-tuning eficiente en modelos de 1.5B, comparando con el modelo base.
- Integracion en asistentes de voz: al ser un modelo ligero, podria ejecutarse en dispositivos con poca memoria para responder consultas de horarios mediante texto o voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se comparan resultados con el modelo base o con otros adaptadores similares.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es de 0.1 GB, pero el modelo base Qwen2.5-1.5B-Instruct requiere aproximadamente 3 GB en precision fp16 y unos 1.5 GB en cuantizacion de 4 bits. En total, el modelo completo puede caber en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050, o incluso CPU con suficiente RAM para inferencia lenta.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria transformers y PEFT. Tambien es compatible con vLLM, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversion).
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 1.5B puede generar decenas de tokens por segundo, pero depende del hardware y la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con otros modelos de la misma categoria. Como referencia, se puede comparar con el modelo base Qwen2.5-1.5B-Instruct, que tiene 1.5B de parametros, contexto de 32 768 tokens y licencia Apache 2.0. Otros adaptadores LoRA publicados en Hugging Face para tareas conversacionales podrian ser similares, pero no hay datos concretos para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Documentacion inexistente: la model card no proporciona informacion sobre el entrenamiento, los datos, la licencia ni los idiomas. Esto impide evaluar su idoneidad para uso comercial o academico.
- Sesgos y alucinaciones: al heredar el comportamiento del modelo base Qwen2.5-Instruct, puede presentar sesgos presentes en sus datos de entrenamiento y generar respuestas inventadas cuando no conoce la respuesta.
- Riesgo de sobreajuste: al ser un adaptador LoRA entrenado con SFT, es probable que este especializado en el dominio de horarios y degrade su rendimiento en tareas generales.
- Licencia no especificada: no se indica bajo que licencia se distribuye el adaptador. El modelo base Qwen2.5-Instruct usa Apache 2.0, pero el adaptador podria tener restricciones adicionales.
- Sin garantias de calidad: no hay benchmarks ni evaluaciones publicas, por lo que su rendimiento real es desconocido.
- Limitaciones de contexto: aunque el modelo base soporta 32 768 tokens, no se sabe si el adaptador mantiene esa longitud efectiva o si el entrenamiento redujo la ventana util.

## Enlaces

- [Hugging Face - NatthakanDTA/schedule-chatbot-lora](https://huggingface.co/NatthakanDTA/schedule-chatbot-lora)
- [Space ProjectZ (chatbot de horarios)](https://huggingface.co/spaces/NatthakanDTA/ProjectZ)
- [Modelo base Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
