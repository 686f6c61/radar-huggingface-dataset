# Katta-Jayachandra/fraud-detector

## Resumen

El modelo `Katta-Jayachandra/fraud-detector` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario Katta-Jayachandra. Está diseñado para la detección de fraude, aunque la información pública no especifica el conjunto de datos de entrenamiento ni los detalles del proceso de ajuste. Se entrenó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face, con el framework Transformers.

Este modelo es relevante como ejemplo de adaptación de un LLM instructivo de tamaño pequeño (1.5B parámetros) a una tarea específica de clasificación o generación de texto relacionada con fraude. Sin embargo, al no publicarse métricas, dataset ni licencia, su utilidad práctica es limitada y debe considerarse como un experimento de investigación más que como una solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) |
| Parametros totales | 1.5 mil millones (aprox., según modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32k, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se especifica) |
| Licencia | no disponible (el modelo base es Apache 2.0, pero el fine-tune no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder con atención causal estándar, diseñado para generación de texto e instrucciones. El fine-tune se realizó mediante Supervised Fine-Tuning (SFT) usando la librería TRL (versión 1.12.0) y Transformers 5.15.1. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni otras hiperparámetros. Tampoco se indica si se aplicaron técnicas como RLHF o DPO; el proceso se limita a SFT sobre el modelo base instructivo.

## Capacidades

- Generación de texto instructivo: al ser un fine-tune de Qwen2.5-1.5B-Instruct, conserva las capacidades de diálogo y generación de respuestas del modelo base.
- Detección de fraude: el nombre del modelo sugiere que fue entrenado para identificar o clasificar transacciones o textos fraudulentos, pero no hay evidencia pública de su rendimiento en esta tarea.
- Soporte de tool calling: no confirmado; el modelo base Qwen2.5-1.5B-Instruct no incluye soporte nativo de function calling en su versión estándar.
- Capacidades multilingües: no especificadas; el modelo base es multilingüe, pero no se sabe si el fine-tune conserva este comportamiento.
- No se reportan capacidades especiales como modo de razonamiento, visión o audio.

## Casos de uso

- Prototipado de sistemas de detección de fraude: el modelo puede servir como punto de partida para experimentar con LLMs en tareas de clasificación de transacciones sospechosas, aunque sin métricas publicadas su fiabilidad es incierta.
- Investigación académica: útil para estudiar el impacto del fine-tuning SFT en modelos pequeños para dominios específicos, comparando con el modelo base.
- Generación de explicaciones de fraude: podría generar texto descriptivo sobre patrones de fraude, pero no hay garantía de precisión.
- Entrenamiento adicional: al ser un checkpoint de SFT, puede usarse como base para continuar el ajuste con datasets propios.
- Evaluación de pipelines de fine-tuning: sirve para validar flujos de trabajo con TRL y Transformers en entornos de desarrollo.
- Demostraciones educativas: en cursos de NLP aplicado, para ilustrar el proceso de adaptación de un LLM a una tarea vertical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de detección de fraude (precisión, recall, F1). El repositorio no incluye evaluaciones ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 1.5B parámetros en FP16, se requieren aproximadamente 3-4 GB de VRAM. Con cuantización de 8 bits, ~2 GB; con 4 bits, ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores (RTX 3060, RTX 4090). También puede ejecutarse en CPU con lentitud.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo medio y bajo.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se exporta), y TGI (Text Generation Inference).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. En una RTX 3090, un modelo de 1.5B en FP16 puede generar ~50-100 tokens/segundo, pero es una estimación genérica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Katta-Jayachandra/fraud-detector | 1.5B | no disponible | no disponible | Fine-tune de Qwen2.5-1.5B-Instruct para fraude |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32k | Apache 2.0 | Modelo base instructivo, multilingüe |
| Llama-3.2-1B-Instruct | 1B | 128k | Llama 3.2 Community License | Modelo instructivo de Meta, con tool calling |

La comparativa se limita a modelos de tamaño similar, pero no hay datos de rendimiento del fine-tune para establecer una comparación objetiva.

## Limitaciones y advertencias

- No se dispone de información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos ni cobertura de dominios.
- Riesgo de alucinación: al ser un modelo pequeño y sin validación, puede generar respuestas incorrectas o inventadas, especialmente en tareas de detección de fraude donde la precisión es crítica.
- Sin licencia declarada: no se puede determinar si es apto para uso comercial; se recomienda contactar al autor antes de cualquier despliegue.
- Sin métricas de rendimiento: no hay evidencia de que el modelo funcione correctamente en la tarea de detección de fraude.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- El modelo base Qwen2.5-1.5B-Instruct tiene limitaciones inherentes en razonamiento complejo y conocimiento factual, que se heredan en el fine-tune.

## Enlaces

- Hugging Face: https://huggingface.co/Katta-Jayachandra/fraud-detector
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería TRL: https://github.com/huggingface/trl
