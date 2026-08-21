# hlenothere/lab21-qwen35-4b-vi-ticket-triage-lora

## Resumen

Este modelo es un adaptador LoRA de clasificación de tickets de soporte en vietnamita, desarrollado por el usuario `hlenothere` como parte de un proyecto de laboratorio identificado como `lab21`. Se basa en el modelo base `unsloth/Qwen3.5-4B`, una variante optimizada de la familia Qwen 3.5 con 4 mil millones de parámetros, y ha sido entrenado mediante fine-tuning supervisado (SFT) utilizando la librería PEFT y el framework TRL de Hugging Face.

El adaptador está diseñado específicamente para la tarea de triaje de tickets (ticket triage), es decir, la clasificación automática de solicitudes de soporte técnico o de atención al cliente en categorías predefinidas. Su relevancia radica en que permite adaptar un modelo generalista de 4B parámetros a una tarea vertical con un coste de entrenamiento reducido, aprovechando la técnica LoRA que solo entrena un pequeño subconjunto de parámetros adicionales.

La ficha técnica del modelo es notablemente escasa: la model card no incluye información sobre el dataset de entrenamiento, los hiperparámetros, las métricas de evaluación ni la licencia. El repositorio tiene un tamaño de 0.1 GB, lo que es consistente con un adaptador LoRA de pequeñas dimensiones. El modelo fue creado el 21 de agosto de 2026 y actualizado el mismo día, lo que sugiere que es un artefacto de un proyecto académico o de investigación en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen3.5-4B) |
| Parametros totales | no disponible (el adaptador LoRA es de ~0.1 GB; el modelo base tiene 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (tarea de clasificacion de tickets) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se monta sobre el modelo base `unsloth/Qwen3.5-4B`, una versión optimizada de Qwen 3.5 con 4 mil millones de parámetros. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención, lo que reduce drásticamente el número de parámetros entrenables y los requisitos de memoria durante el fine-tuning.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) utilizando la librería TRL (Transformers Reinforcement Learning) de Hugging Face, con PEFT 0.20.0 como librería de adaptadores. No se dispone de información sobre el dataset de entrenamiento, el número de épocas, la tasa de aprendizaje, el tamaño de lote ni el régimen de precisión (fp16, bf16, etc.). Tampoco se especifica si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Clasificacion de tickets de soporte en vietnamita: la tarea principal para la que fue entrenado el adaptador.
- Generacion de texto: heredada del modelo base Qwen3.5-4B, aunque el adaptador puede afectar al comportamiento general.
- Razonamiento y comprension del lenguaje: capacidades heredadas del modelo base, no evaluadas especificamente para este adaptador.
- Soporte de tool calling: no disponible (depende del modelo base, no documentado).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: el adaptador esta especializado en vietnamita; el modelo base puede soportar otros idiomas, pero no esta documentado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Triaje automatico de tickets de soporte en vietnamita: el caso de uso principal. El modelo puede clasificar solicitudes entrantes en categorias como "problema de facturacion", "error de software", "solicitud de informacion", etc., permitiendo enrutar cada ticket al equipo adecuado sin intervencion humana.
- Atencion al cliente en empresas vietnamitas: integrado en un sistema de helpdesk, el adaptador puede pre-clasificar los mensajes de los clientes antes de que un agente humano los revise, reduciendo el tiempo de respuesta.
- Analisis de feedback de usuarios: clasificacion de comentarios, resenas o mensajes de usuarios en categorias de sentimiento o tematica, util para equipos de producto y calidad.
- Automatizacion de procesos de soporte interno: clasificacion de solicitudes internas de empleados (IT, RRHH, instalaciones) en una organizacion con equipos de habla vietnamita.
- Filtrado y priorizacion de incidencias: el modelo puede asignar niveles de prioridad a los tickets segun su contenido, ayudando a los equipos de soporte a gestionar la cola de trabajo de forma mas eficiente.
- Experimentacion academica: el modelo puede servir como caso de estudio para evaluar la eficacia de LoRA en tareas de clasificacion de texto en vietnamita, comparando el rendimiento con fine-tuning completo o con otros adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (accuracy, F1, precision, recall) ni comparaciones con otros modelos. Tampoco se especifica el dataset de evaluacion utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 4B parámetros, la inferencia requiere cargar el modelo base completo. Con cuantizacion de 4 bits, se estima un consumo de 3-4 GB de VRAM; en precision completa (fp16), alrededor de 8-9 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, etc.) puede ejecutar el modelo en precision reducida. Para mayor velocidad, se recomienda una RTX 4090 o GPU de datacenter como A10, A100 o H100.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo modernas con 8 GB o mas de VRAM, especialmente con cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` de Hugging Face combinando el adaptador con el modelo base. Tambien es compatible con vLLM, llama.cpp, Ollama y TGI si se exporta el modelo fusionado a los formatos adecuados (GGUF, etc.).
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantizacion y el backend de inferencia utilizado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo es un adaptador LoRA especifico para una tarea vertical (triaje de tickets en vietnamita) y no existen datos publicos de rendimiento. Como referencia, se podrian comparar los siguientes modelos base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B | no disponible | no disponible | Modelo base sobre el que se entrena el adaptador |
| Qwen3-VL (familia) | 2B-235B | hasta 256K tokens | no disponible | Familia multimodal de Qwen, no comparable directamente |
| Otros adaptadores LoRA para clasificacion en vietnamita | variable | variable | variable | No se han identificado modelos comparables en la busqueda |

## Limitaciones y advertencias

- Informacion insuficiente: la model card no documenta el dataset de entrenamiento, los hiperparametros, las metricas de evaluacion ni el proceso de curado de datos, lo que impide evaluar la calidad y robustez del modelo.
- Sesgos desconocidos: al no conocer el dataset de entrenamiento, no es posible identificar sesgos potenciales relacionados con el dominio, el registro linguistico o la demografia de los usuarios.
- Riesgo de alucinacion: como modelo de lenguaje generativo, puede producir respuestas inventadas o incorrectas, especialmente en contextos fuera de su dominio de entrenamiento.
- Alcance limitado: el adaptador esta especializado en triaje de tickets en vietnamita; su rendimiento en otros idiomas o tareas no esta garantizado y probablemente sea deficiente.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base, lo que genera incertidumbre sobre las restricciones de uso comercial y redistribucion.
- Sin garantias de produccion: al ser un artefacto de laboratorio sin benchmarks publicados, no se recomienda su uso en entornos de produccion sin una evaluacion exhaustiva previa.
- Dependencia del modelo base: el rendimiento final depende en gran medida del modelo base `unsloth/Qwen3.5-4B`, cuyas caracteristicas tecnicas tampoco estan completamente documentadas en esta ficha.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/hlenothere/lab21-qwen35-4b-vi-ticket-triage-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo relacionado del mismo proyecto: https://huggingface.co/tuan2294/lab21-2A202601618-qwen35-triage-vi
- Coleccion Qwen3-VL: https://huggingface.co/collections/Qwen/qwen3-vl
- Informe tecnico de Qwen3-VL (arXiv): https://arxiv.org/abs/2511.21631
