# simonykq/gl-foundation-model-h512

## Resumen

El modelo `simonykq/gl-foundation-model-h512` es un pequeño modelo de lenguaje basado en la arquitectura Llama, con aproximadamente 23 millones de parámetros, diseñado para generar representaciones vectoriales (embeddings) de transacciones financieras. Aunque la model card oficial está vacía, la información del Space de demostración del autor indica que se trata de una variante del "NVIDIA Transaction Foundation Model", un decoder Llama preentrenado sobre secuencias TabFormer, que produce embeddings de 512 dimensiones a partir del último token de la secuencia. El tag `arxiv:1910.09700` apunta al artículo de TabFormer, lo que confirma su orientación a datos tabulares y transaccionales.

Este modelo resulta relevante porque demuestra cómo se pueden adaptar arquitecturas generativas compactas a dominios específicos, como el análisis de comportamiento transaccional, con un coste computacional mínimo. Su tamaño reducido lo hace apto para prototipos, experimentación y despliegue en entornos con recursos limitados. No obstante, la ausencia de documentación oficial, licencia y datos de entrenamiento limita su uso directo en producción sin una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder transformer) |
| Parametros totales | 22.959.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer estilo Llama, tal como indican las etiquetas del repositorio. El modelo está preentrenado sobre secuencias de transacciones formateadas según el enfoque TabFormer, que convierte datos tabulares en secuencias de tokens para su procesamiento con transformers. Según el Space de demostración, el modelo genera embeddings de 512 dimensiones tomando el vector del último token de la secuencia, lo que permite representar el comportamiento transaccional de un usuario o entidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni el uso de técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la adaptación de Llama a datos tabulares.

## Capacidades

- Generación de texto: al ser un decoder Llama, puede generar texto, aunque su entrenamiento específico en transacciones lo orienta a tareas de representación.
- Embeddings de transacciones: produce vectores de 512 dimensiones que capturan características de secuencias de transacciones.
- Similitud de comportamiento: permite calcular la similitud entre diferentes secuencias transaccionales mediante la comparación de embeddings.
- Tokenización de dominio: el modelo emplea una tokenización adaptada a datos tabulares, según se menciona en el Space de demostración.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (vision, audio, thinking).

## Casos de uso

- Análisis de comportamiento transaccional: el modelo puede representar secuencias de transacciones de clientes, permitiendo agruparlas por similitud para segmentación o detección de anomalías.
- Detección de fraude: al comparar embeddings de transacciones nuevas con patrones históricos, se pueden identificar comportamientos atípicos.
- Sistemas de recomendación financiera: las representaciones generadas pueden alimentar sistemas de recomendación de productos bancarios basados en el historial de transacciones.
- Investigación académica: sirve como base para estudiar la aplicación de transformers a datos tabulares y transaccionales, dado su pequeño tamaño y facilidad de ejecución.
- Prototipado rápido: por su bajo coste computacional, es adecuado para validar hipótesis sobre embeddings transaccionales antes de escalar a modelos mayores.
- Aprendizaje y docencia: puede utilizarse en cursos de NLP aplicado a finanzas para ilustrar el fine-tuning de modelos Llama en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 23 millones de parámetros, en fp32 ocupa unos 92 MB, en fp16 unos 46 MB y en int8 unos 23 MB. Puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (por ejemplo, NVIDIA T4, RTX 3060, A100) es suficiente; también funciona en CPU.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face TGI, vLLM, llama.cpp u Ollama, aunque no se han documentado configuraciones específicas.
- Latencia y throughput: no hay datos oficiales; dada su escala, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (embeddings transaccionales basados en Llama). El modelo original TabFormer, publicado en el artículo arxiv:1910.09700, utiliza una arquitectura BERT, por lo que no es directamente comparable en arquitectura ni en propósito. Se recomienda evaluar el modelo frente a alternativas como Sentence-BERT o modelos de embeddings generales, pero no hay datos públicos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo es utilizable comercialmente; se debe contactar al autor o a NVIDIA antes de cualquier uso en producción.
- Documentación insuficiente: la model card está vacía, por lo que se desconocen detalles clave como el dataset de entrenamiento, los hiperparámetros y las limitaciones específicas.
- Sesgos potenciales: al estar entrenado en datos transaccionales, puede reflejar sesgos presentes en los datos financieros (por ejemplo, sesgos geográficos o demográficos).
- Riesgo de alucinación: aunque su propósito principal es generar embeddings, al ser un modelo de lenguaje puede producir texto incoherente si se usa fuera de su dominio.
- Contexto limitado: no se especifica la longitud de contexto; los modelos pequeños suelen tener ventanas cortas, lo que puede restringir el análisis de secuencias largas.
- Sin garantías de rendimiento: al no existir benchmarks, no se puede asegurar su calidad en tareas específicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/simonykq/gl-foundation-model-h512
- Space de demostración: https://huggingface.co/spaces/simonykq/gl-foundation-model-demo
- Artículo de TabFormer: https://arxiv.org/abs/1910.09700
- Perfil del autor en Hugging Face: https://huggingface.co/simonykq
