# AlinaGonch/llama32-3b-squad-ratio-0.10-seed-42

## Resumen

El modelo `AlinaGonch/llama32-3b-squad-ratio-0.10-seed-42` es un fine-tuning del modelo base Llama 3.2 de 3B parámetros, realizado por la autora AlinaGonch sobre el dataset SQuAD (Stanford Question Answering Dataset). El nombre del repositorio indica que se utilizó una proporción de entrenamiento de 0.10 y una semilla fija de 42, lo que sugiere un experimento controlado para evaluar el efecto de la cantidad de datos de SQuAD en el ajuste fino de un modelo pequeño. El modelo está publicado en Hugging Face con formato safetensors y es compatible con la librería transformers.

La relevancia de este modelo radica en que explora cómo un modelo ligero de 3B parámetros, originalmente diseñado para tareas generales de lenguaje, puede adaptarse a una tarea específica de comprensión lectora extractiva con una fracción reducida del dataset SQuAD. Esto puede ser de interés para investigaciones sobre eficiencia de datos, transferencia de conocimiento y evaluación de estrategias de fine-tuning con recursos limitados. Sin embargo, la model card no proporciona información detallada sobre el proceso de entrenamiento, hiperparámetros o resultados, por lo que gran parte de las especificaciones técnicas no están disponibles públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.2 3B) |
| Parametros totales | no disponible (se infiere 3B del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 3B soporta 128k tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base soporta ingles, aleman, frances, hindi, italiano, portugues y español) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Llama 3.2 3B, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y attention con RoPE (Rotary Position Embeddings). El modelo base fue preentrenado por Meta con 9 billones de tokens y posteriormente ajustado con instrucciones. En este caso, la autora ha realizado un fine-tuning adicional sobre el dataset SQuAD, probablemente SQuAD 2.0 (según la referencia arxiv:1910.09700 incluida en los tags, que corresponde al paper de SQuAD 2.0). La proporción de 0.10 sugiere que solo se usó el 10% de las muestras del dataset, y la semilla 42 indica un experimento reproducible.

No se dispone de información sobre el procedimiento exacto de entrenamiento, número de épocas, tasa de aprendizaje, técnica de optimización o si se empleó alguna estrategia de regularización. Tampoco se detalla si se realizó un ajuste completo de todos los parámetros o si se utilizó alguna técnica de adaptación como LoRA. La model card es una plantilla automática sin datos específicos.

## Capacidades

- Comprensión lectora extractiva: por el nombre del modelo y el dataset SQuAD, se infiere que está especializado en responder preguntas extrayendo el fragmento de texto relevante de un pasaje dado.
- Generación de texto general: al derivar de Llama 3.2 3B, conserva las capacidades básicas de generación de lenguaje, aunque el fine-tuning puede haber reducido su rendimiento en tareas generales.
- Soporte de tool calling: no disponible (no se menciona en la información del modelo).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (el modelo base soporta varios idiomas, pero no se confirma que el fine-tuning conserve estas capacidades).
- Modo thinking o visión: no disponible (el modelo base es solo texto, sin visión).

## Casos de uso

- Investigación académica sobre fine-tuning eficiente: el modelo permite estudiar cómo afecta la proporción de datos de entrenamiento (10% de SQuAD) al rendimiento en tareas de QA, útil para experimentos controlados en laboratorios universitarios.
- Prototipado de sistemas de pregunta-respuesta sobre documentos: se puede integrar en un pipeline que extraiga respuestas de pasajes concretos, aunque su limitado entrenamiento puede dar resultados inferiores a modelos más grandes o fine-tunes completos.
- Evaluación de la transferencia de conocimiento: sirve como punto de comparación para medir la degradación o mejora al ajustar un modelo base pequeño con un subconjunto de datos de dominio específico.
- Pruebas de reproducibilidad: al incluir la semilla en el nombre, facilita la replicación de experimentos con diferentes proporciones (0.10, 0.30, 0.50, como se observa en otros repositorios de la misma autora).
- Enseñanza de NLP: puede usarse en cursos para ilustrar el proceso de fine-tuning y la importancia de los hiperparámetros, aunque sin métricas publicadas su utilidad pedagógica es limitada.
- Benchmarking de frameworks de inferencia: al ser un modelo pequeño en formato safetensors, puede emplearse para medir el rendimiento de librerías como transformers, vLLM o llama.cpp en tareas de QA, aunque no se han publicado resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de exactitud, F1 ni comparaciones con otros modelos. Dado que el modelo es un fine-tuning experimental sobre el 10% de SQuAD, es probable que su rendimiento en QA sea inferior al de un fine-tuning completo, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 3B parámetros en precisión fp16, se estima que requiere aproximadamente 6-8 GB de VRAM para carga completa, y menos si se cuantiza a int8 o int4 (no se proporcionan cuantizaciones en el repo).
- GPU recomendadas: una GPU con al menos 8 GB de VRAM, como una RTX 3060, RTX 4060 o superior. Para inferencia más rápida, una A100 o H100 sería adecuada, pero no es necesaria.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 8 GB o más, como la RTX 3070, RTX 3080 o RTX 4090.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o convertirse a GGUF para usarse con llama.cpp u Ollama. No hay instrucciones específicas en el repositorio.
- Latencia y throughput: no disponibles, al no haber benchmarks publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo es un fine-tuning específico sin métricas publicadas, por lo que no es posible compararlo objetivamente con alternativas como el modelo base Llama 3.2 3B, otros fine-tunes de SQuAD (por ejemplo, los otros repositorios de la misma autora con ratios 0.30 y 0.50) o modelos especializados en QA como RoBERTa-base-SQuAD. Se recomienda consultar los repositorios relacionados de la autora para obtener más contexto experimental, aunque tampoco contienen métricas en sus model cards.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 3.2, el modelo puede heredar sesgos presentes en los datos de preentrenamiento, pero no se ha realizado ninguna evaluación de sesgos específica.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas inventadas, especialmente en preguntas que no tienen respuesta en el pasaje (SQuAD 2.0 incluye preguntas sin respuesta, pero no se sabe si el fine-tuning las maneja correctamente).
- Limitaciones de contexto o idioma: no se ha confirmado si el fine-tuning conserva la ventana de contexto original de 128k tokens ni las capacidades multilingües del modelo base.
- Restricciones de licencia: la licencia no está especificada en el repositorio. Dado que el modelo base Llama 3.2 tiene una licencia comunitaria de Meta (Llama 3.2 Community License), el fine-tuning probablemente está sujeto a los mismos términos, pero no se puede confirmar.
- Caveat importante: la model card está vacía y no hay evidencia de que el modelo haya sido evaluado. Su uso en producción no es recomendable sin una validación previa exhaustiva.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.10-seed-42
- Otros modelos de la misma autora (contexto experimental):
  - https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.50-seed-42
  - https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.30-r4
- Documentación oficial de Llama 3.2 (modelo base): https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Página de Llama 3.2 3B en Ollama: https://ollama.com/library/llama3.2:3b
- Ficha de Llama-3.2-3B en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/llama-32-3b-meta-llama
