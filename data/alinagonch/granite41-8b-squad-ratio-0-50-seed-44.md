# AlinaGonch/granite41-8b-squad-ratio-0.50-seed-44

## Resumen

El modelo `AlinaGonch/granite41-8b-squad-ratio-0.50-seed-44` es un fine-tune experimental del modelo Granite 4.1 8B de IBM, realizado por Alina Hancharova sobre el dataset SQuAD 2.0. Forma parte de una serie de experimentos cuyo objetivo es determinar la proporción óptima de muestras sin respuesta (unanswerable) en el conjunto de entrenamiento para tareas de question answering extractivo. El nombre del repositorio indica una proporción de 0.50 (es decir, la mitad de las muestras son preguntas sin respuesta) y una semilla de 44.

Este modelo se inscribe en una línea de investigación sobre el equilibrio entre preguntas respondibles y no respondibles en datasets de QA, un factor crítico para el rendimiento en escenarios reales donde no todas las preguntas tienen respuesta en el contexto. Al ser un checkpoint de solo 0.2 GB, probablemente se trata de un ajuste fino ligero o una versión cuantizada, aunque no se especifica.

La relevancia actual radica en que Granite 4.1 es una familia de modelos empresariales de IBM con soporte para tool calling, contexto largo y múltiples idiomas, y este experimento explora cómo el fine-tuning en un dataset específico afecta a su comportamiento en tareas de extracción de respuestas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only transformer (basada en Granite 4.1 8B, no confirmado directamente) |
| Parametros totales | 8B (indicado en el nombre del modelo, no verificado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Granite 4.1 8B soporta 131K tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (el tamaño del repo de 0.2 GB sugiere una versión reducida, pero no se especifica el formato) |
| Idiomas soportados | No disponible (el modelo base soporta 12 idiomas, pero no se confirma para este fine-tune) |
| Licencia | No disponible |
| Formato de pesos | safetensors (según los tags de HuggingFace) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Granite 4.1 8B, un transformer denso decoder-only desarrollado por IBM. El modelo base está entrenado con 12 idiomas, soporta una ventana de contexto de 131K tokens e incorpora capacidades de tool calling, generación de código con fill-in-the-middle, RAG y razonamiento matemático.

El fine-tune específico se realizó sobre el dataset SQuAD 2.0, que incluye preguntas con y sin respuesta en pasajes de Wikipedia. La proporción de muestras sin respuesta se fijó en 0.50 y se utilizó la semilla 44 para la división de datos. No se dispone de información sobre hiperparámetros de entrenamiento, número de épocas, tasa de aprendizaje o técnica de ajuste (por ejemplo, si se usó LoRA o fine-tuning completo). El autor indica en su perfil que esta colección de modelos forma parte de un experimento para encontrar la proporción óptima de muestras sin respuesta en el dataset de entrenamiento.

## Capacidades

- Question answering extractivo: el modelo está diseñado para responder preguntas a partir de un contexto dado, incluyendo la capacidad de indicar que no hay respuesta cuando corresponde (gracias al entrenamiento con SQuAD 2.0).
- Generación de texto y razonamiento: hereda las capacidades del modelo base Granite 4.1 8B, aunque no se ha evaluado específicamente en este fine-tune.
- Tool calling y function calling: el modelo base soporta invocación de herramientas, pero no se ha verificado que este fine-tune mantenga dicha capacidad.
- Soporte para agentes y razonamiento multi-paso: no confirmado para esta versión.
- Capacidades multilingües: el modelo base soporta 12 idiomas, pero no se ha validado el comportamiento multilingüe de este fine-tune.
- Otras capacidades del base (RAG, clasificación, extracción): no confirmadas.

## Casos de uso

- Investigación académica sobre QA: el modelo sirve para estudiar el efecto de la proporción de preguntas sin respuesta en el rendimiento de modelos de extracción de respuestas. Se puede utilizar para reproducir experimentos y comparar con otras proporciones (por ejemplo, 0.25, 0.75) disponibles en la colección del autor.
- Desarrollo de sistemas de preguntas y respuestas sobre documentos corporativos: aunque el fine-tune está orientado a SQuAD, podría adaptarse a dominios específicos mediante fine-tuning adicional.
- Evaluación de robustez ante preguntas sin respuesta: útil para probar si un sistema de QA es capaz de abstenerse cuando no hay información suficiente en el contexto.
- Benchmarking de técnicas de fine-tuning: al ser un checkpoint pequeño (0.2 GB), puede emplearse para probar pipelines de inferencia y ajuste en entornos con recursos limitados.
- Educación y formación en NLP: como ejemplo de experimento controlado sobre datasets de QA, puede utilizarse en cursos de aprendizaje automático.
- Comparación de semillas y proporciones: el autor ha publicado múltiples variantes (seed-42, seed-44, etc.) que permiten analizar la variabilidad de los resultados según la semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, EM (exact match) o accuracy sobre SQuAD 2.0 u otros conjuntos de evaluación. El autor no ha incluido tablas de resultados ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: para un modelo de 8B parámetros, se requiere aproximadamente 16 GB de VRAM en FP16 y unos 8 GB en cuantización de 4 bits. El tamaño del repositorio (0.2 GB) sugiere que el checkpoint podría estar cuantizado o ser un adaptador LoRA, lo que reduciría los requisitos.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para inferencia en FP16. Si se usa cuantización de 4 bits, una RTX 3080 o superior podría ser suficiente.
- Compatibilidad con GPU de consumo: posible si se utiliza cuantización GGUF o AWQ, pero no se han publicado versiones cuantizadas.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede ejecutarse con vLLM, llama.cpp, Ollama o TGI, siempre que se disponga de los pesos en el formato adecuado. No se han publicado archivos GGUF ni ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo es un fine-tune experimental de Granite 4.1 8B, y no se han publicado resultados que permitan compararlo con otras variantes de la misma familia (por ejemplo, las versiones con otras proporciones de SQuAD 2.0) ni con otros modelos de QA como RoBERTa-large-SQuAD2 o DeBERTa-v3-large-SQuAD2. La única referencia es el modelo base Granite 4.1 8B, cuyas especificaciones se conocen (131K contexto, 12 idiomas, tool calling), pero el impacto del fine-tune sobre estas capacidades es desconocido.

## Limitaciones y advertencias

- Modelo experimental: se trata de un checkpoint de investigación sin documentación técnica completa. No está destinado a uso en producción sin una evaluación exhaustiva.
- Sesgos del dataset SQuAD 2.0: el modelo puede heredar sesgos presentes en los artículos de Wikipedia utilizados, así como el estilo de preguntas del dataset, que no representa necesariamente la diversidad de consultas reales.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar respuestas incorrectas o inventadas cuando no hay contexto suficiente, aunque el entrenamiento con SQuAD 2.0 debería mitigar parcialmente este comportamiento.
- Limitaciones de contexto: aunque el modelo base soporta 131K tokens, no se ha confirmado que el fine-tune mantenga esa longitud; podría haberse reducido durante el entrenamiento.
- Restricciones de licencia: la licencia no está especificada, por lo que se desconoce si se puede utilizar comercialmente. Se recomienda contactar con el autor antes de cualquier uso comercial.
- Ausencia de benchmarks: sin métricas publicadas, es imposible evaluar la calidad del modelo para tareas específicas.
- Soporte de idiomas no verificado: el fine-tune podría haber sido entrenado únicamente con datos en inglés (SQuAD 2.0 es un dataset en inglés), por lo que su rendimiento en otros idiomas es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlinaGonch/granite41-8b-squad-ratio-0.50-seed-44
- Perfil del autor (colección de experimentos): https://huggingface.co/AlinaGonch
- Variante con semilla 42: https://huggingface.co/AlinaGonch/granite41-8b-squad-ratio-0.50-seed-42
- Documentación de Granite 4.1 de IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Ficha de Granite 4.1 8B en OpenModels: https://www.openmodels.run/models/granite-4-1-8b
- Ficha de Granite 4.1 8B en Model Database: https://modeldatabase.com/models/ibm-granite/granite-4.1-8b.html
