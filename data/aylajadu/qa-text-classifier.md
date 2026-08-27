# aylajadu/qa-text-classifier

## Resumen

El modelo `aylajadu/qa-text-classifier` es un clasificador de texto de tipo pregunta-respuesta desarrollado por el usuario aylajadu. Se trata de un pipeline clásico de machine learning que combina la extracción de características TF-IDF con un clasificador de regresión logística, entrenado sobre un conjunto reducido de 10 pares de preguntas y respuestas en inglés. Los temas cubiertos incluyen inteligencia artificial, aprendizaje automático, deep learning, Python, CPU, GPU, NLP, ciencia de datos, optimizadores y descenso de gradiente.

El modelo está pensado exclusivamente con fines educativos y de demostración, para ilustrar el funcionamiento de los pipelines de clasificación de texto tradicionales. No se trata de un modelo de lenguaje de gran escala (LLM), sino de un artefacto ligero que se distribuye como un archivo pickle con el vectorizador y el clasificador serializados. Su relevancia actual radica en servir como ejemplo didáctico de cómo construir un sistema de clasificación con herramientas clásicas de scikit-learn, sin necesidad de infraestructura avanzada.

La arquitectura es un pipeline TF-IDF + regresión logística, con un tamaño de repositorio de 0 GB. No se dispone de datos sobre el número de parámetros, la longitud de contexto o los idiomas soportados más allá del contenido de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + regresión logística (scikit-learn) |
| Parametros totales | no disponible (modelo clásico sin capas neuronales) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a modelos TF-IDF) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según los ejemplos de entrenamiento, no declarado explícitamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | pickle (archivo `qa_model.pkl` con bundle) |

## Arquitectura y entrenamiento

El modelo se basa en un pipeline clásico de procesamiento de lenguaje natural: primero se aplica la vectorización TF-IDF para convertir los textos en representaciones numéricas de términos ponderados por su frecuencia e inversa de documento, y después se entrena un clasificador de regresión logística sobre esas características. Este enfoque no utiliza redes neuronales ni mecanismos de atención, sino que es un método estadístico lineal sobre bolsas de palabras.

El entrenamiento se realizó sobre un conjunto de datos extremadamente reducido: únicamente 10 pares de pregunta-respuesta. No se dispone de información sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de ajuste adicionales como RLHF o DPO. No se mencionan innovaciones técnicas destacables; el interés del modelo es puramente pedagógico, para mostrar cómo se construye y se despliega un clasificador de texto con herramientas clásicas de scikit-learn.

## Capacidades

- Clasificación de texto en categorías de preguntas relacionadas con temas técnicos: IA, ML, Python, CPU, GPU, NLP, ciencia de datos, optimizadores y descenso de gradiente.
- Respuesta a preguntas mediante la asignación de una etiqueta de clase (la categoría de la pregunta), no genera texto libre.
- Funciona como un modelo de demostración para pipelines de clasificación de texto clásicos.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; los ejemplos están en inglés.
- No incluye modo de pensamiento, visión ni audio.

## Casos de uso

- Educación en aprendizaje automático: se puede utilizar en cursos o talleres para explicar el flujo de trabajo de un pipeline de clasificación de texto, desde la vectorización TF-IDF hasta la evaluación del modelo.
- Prototipado rápido de clasificadores de texto: sirve como base para experimentar con otros conjuntos de datos pequeños y comparar con modelos más complejos.
- Demostraciones técnicas en blogs o presentaciones: su simplicidad permite mostrar el código de carga y predicción en pocas líneas, como se ve en la model card.
- Pruebas de integración de pipelines de ML: se puede usar como un modelo de referencia para verificar el funcionamiento de herramientas de serialización y despliegue (pickle, APIs REST).
- Enseñanza de conceptos de TF-IDF: ayuda a visualizar cómo las características de frecuencia de términos afectan la decisión de clasificación.
- Evaluación de herramientas de interpretabilidad: al ser un modelo lineal, es fácil inspeccionar los pesos de la regresión logística para explicar las predicciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo fue entrenado con solo 10 ejemplos, por lo que no hay métricas de evaluación estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El modelo es extremadamente ligero, con un tamaño de archivo de 0 GB, por lo que puede ejecutarse en cualquier CPU de propósito general sin necesidad de GPU.
- La inferencia se realiza mediante `pickle.load` y llamadas a `predict`, con una latencia del orden de microsegundos para una sola muestra.
- No requiere memoria VRAM; el consumo de RAM es mínimo (inferior a 50 MB).
- Se puede desplegar en cualquier servidor con Python y scikit-learn instalados, o mediante herramientas de serialización estándar.
- No se recomienda su uso con vLLM, llama.cpp u Ollama, ya que no es un modelo transformer ni compatible con esos formatos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores de texto clásicos con TF-IDF y regresión logística). En el ecosistema de Hugging Face, la mayoría de modelos de clasificación de texto son transformers preentrenados (por ejemplo, BERT o DistilBERT), pero no son directamente comparables por su complejidad y datos de entrenamiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado con únicamente 10 ejemplos, por lo que su capacidad de generalización es prácticamente nula; solo funciona con preguntas que coincidan casi exactamente con las del entrenamiento.
- No es capaz de generar respuestas, solo de asignar una etiqueta de categoría a una pregunta.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo.
- Limitación de idioma: aunque no se especifica, los ejemplos están en inglés, por lo que el modelo no funcionará con otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no tiene valor práctico en producción debido a su tamaño de entrenamiento.
- El archivo pickle puede suponer un riesgo de seguridad si se carga código no confiable; se recomienda verificar la procedencia del archivo.

## Enlaces

- [Hugging Face - aylajadu/qa-text-classifier](https://huggingface.co/aylajadu/qa-text-classifier)
- [Model card original (README)](https://huggingface.co/aylajadu/qa-text-classifier)
