# Islamamro/poem-sentiment-aurora-islamamro

## Resumen

El modelo `Islamamro/poem-sentiment-aurora-islamamro` es un clasificador de sentimiento para versos de poesía, desarrollado por el usuario Islamamro mediante el **Aurora Research Portal**. Se trata de un ajuste fino (*fine-tuning*) del modelo base `distilbert-base-uncased` sobre el dataset `google-research-datasets/poem_sentiment`, que contiene versos etiquetados en cuatro categorías: negativo, positivo, neutral y mixto. El modelo tiene 66,9 millones de parámetros y se distribuye en formato `safetensors` bajo licencia Apache 2.0.

El interés de este modelo reside en que es una demostración del pipeline de entrenamiento y publicación de Aurora, no un modelo listo para producción. Según la model card, se entrenó sobre un subconjunto de solo 1.400 ejemplos, alcanzando una precisión del 82 % en un conjunto de validación separado. Su relevancia es principalmente metodológica: muestra cómo un usuario puede construir, entrenar y publicar un modelo de clasificación de texto de forma rápida, aunque sus limitaciones de datos lo hacen inadecuado para uso real sin un reentrenamiento con el dataset completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (fine-tune de `distilbert-base-uncased`) |
| Parametros totales | 66.956.548 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base DistilBERT soporta 512 tokens, pero no se confirma en la documentación) |
| Tipos de cuantizacion | No disponible (solo se publica en `safetensors` sin cuantización) |
| Idiomas soportados | No disponible (el dataset `poem_sentiment` está en inglés, pero no se especifica oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, una versión destilada de BERT con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, que conserva aproximadamente el 97 % de las capacidades del BERT original con un 40 % menos de parámetros. Sobre esta base se añade una cabeza de clasificación con 4 salidas (negativo, positivo, neutral, mixto). El entrenamiento se realizó con el dataset `google-research-datasets/poem_sentiment`, limitado a un subconjunto de 1.400 ejemplos, y se ejecutó en una GPU NVIDIA RTX 3090 a través del portal Aurora. No se especifican hiperparámetros, número de épocas ni técnica de optimización. La precisión reportada en un conjunto de validación separado es de 0,82.

## Capacidades

- Clasificación de sentimiento en versos de poesía en cuatro categorías: negativo, positivo, neutral y mixto.
- Procesamiento de texto en inglés (implícito por el dataset, aunque no se declara oficialmente).
- Inferencia mediante la API `pipeline` de Hugging Face Transformers.
- No soporta *tool calling*, razonamiento multi-paso, generación de texto ni tareas multimodales.
- No es un modelo multilingüe; su vocabulario y entrenamiento están limitados al inglés.

## Casos de uso

- **Análisis de sentimiento en poesía inglesa**: el modelo puede clasificar versos individuales en las cuatro categorías, útil para estudios literarios computacionales que quieran cuantificar la polaridad emocional de un poema o de un corpus poético.
- **Prototipado de pipelines de NLP**: al ser un modelo pequeño y fácil de cargar, sirve como punto de partida para probar flujos de clasificación de texto en entornos de desarrollo o para validar la integración con otras herramientas.
- **Demostración del flujo de trabajo de Aurora**: el modelo es un ejemplo práctico de cómo el portal Aurora permite entrenar y publicar modelos sin infraestructura propia, útil para evaluar esa plataforma.
- **Enseñanza de fine-tuning**: por su tamaño reducido y su tarea sencilla, puede usarse en cursos o tutoriales para ilustrar el proceso de ajuste de un transformer preentrenado.
- **Análisis de sentimiento en textos literarios breves**: aunque no está validado para otros géneros, podría probarse en fragmentos de prosa poética o letras de canciones, siempre con cautela por su limitado entrenamiento.
- **Comparación de modelos base**: al ser un fine-tune de DistilBERT, permite comparar el rendimiento de la versión destilada frente a BERT completo en la misma tarea, aunque se necesitaría un entrenamiento equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la precisión en un conjunto de validación separado, que se indica en la model card:

| Métrica | Valor |
|---|---|
| Precisión (held-out) | 0,82 |

No hay comparación con otros modelos ni resultados en conjuntos estándar como MMLU, HumanEval o GLUE.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 67 millones de parámetros, en FP32 ocupa aproximadamente 268 MB. Con cuantización a 8 bits (no disponible en el repositorio, pero posible con herramientas externas) se reduciría a unos 67 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o superiores. También puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- **Compatibilidad con GPU de consumo**: sí, es compatible con todas las GPU consumer actuales (RTX 30, 40, 50 series, etc.).
- **Opciones de despliegue**: se puede servir con `transformers` (pipeline), `vLLM` (aunque es excesivo para este tamaño), `llama.cpp` (si se convierte a GGUF) u `Ollama` (con conversión previa). La opción más sencilla es usar el pipeline de Hugging Face.
- **Latencia y throughput**: no se dispone de datos medidos. En una GPU moderna, la inferencia de un solo texto debería ser inferior a 10 ms; en CPU, del orden de 50-100 ms.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un fine-tune de DistilBERT, por lo que podría compararse con el propio `distilbert-base-uncased` (sin fine-tuning) o con otros fine-tunes del mismo dataset, pero no se han publicado resultados de esos modelos. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- **Entrenamiento insuficiente**: el modelo se entrenó con solo 1.400 ejemplos, una fracción muy pequeña del dataset completo. Esto limita gravemente su generalización y lo hace propenso a errores en versos fuera de ese subconjunto.
- **No apto para producción**: la propia model card advierte que es una prueba del pipeline de Aurora, no un modelo para uso real. Cualquier aplicación comercial o académica seria requiere reentrenar con el dataset completo.
- **Sesgos del dataset**: el dataset `poem_sentiment` puede contener sesgos de autor, época o estilo poético que el modelo podría amplificar.
- **Riesgo de clasificaciones incorrectas**: la precisión del 82 % en validación no garantiza un comportamiento fiable en textos diversos; la ambigüedad emocional de la poesía puede llevar a errores.
- **Idioma no declarado**: aunque el dataset es en inglés, no se especifica oficialmente, por lo que su uso en otros idiomas no está soportado.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el modelo no ofrece garantías de calidad ni soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Islamamro/poem-sentiment-aurora-islamamro)
- [Dataset `google-research-datasets/poem_sentiment`](https://huggingface.co/datasets/google-research-datasets/poem_sentiment)
- [Perfil de GitHub del autor](https://github.com/islamamro)
