# soleroa/movie-review-classifier

## Resumen

El modelo `soleroa/movie-review-classifier` es un clasificador de sentimiento binario diseñado para determinar si una reseña de película es positiva o negativa. Fue desarrollado por el usuario soleroa y se basa en la arquitectura DistilBERT, concretamente en el checkpoint `distilbert-base-uncased`, al que se le añade una cabeza de clasificación de secuencias con dos etiquetas (positivo y negativo). El proyecto está documentado en un repositorio de GitHub del mismo autor, donde se indica que el modelo fue ajustado sobre el conjunto de datos IMDB de reseñas de películas.

Con 66,95 millones de parámetros, este modelo se sitúa en la gama de los encoders transformer pequeños, lo que lo hace adecuado para entornos con recursos limitados. La ficha de HuggingFace no proporciona información sobre licencia, idiomas soportados ni detalles de entrenamiento, pero por su origen en DistilBERT se espera que funcione principalmente con texto en inglés. El repositorio ocupa 0,3 GB y los pesos están disponibles en formato safetensors, lo que facilita su integración en pipelines de Transformers.

La relevancia de este modelo radica en su simplicidad y bajo coste computacional para una tarea clásica de NLP, el análisis de sentimiento. Aunque no se publican métricas de evaluación en la información disponible, su arquitectura base es bien conocida y su tamaño permite ejecutarlo en CPU o GPUs modestas, lo que lo convierte en una opción práctica para prototipos y aplicaciones ligeras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer) con cabeza de clasificación de secuencias |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (estándar de DistilBERT base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente inglés, dado el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de `distilbert-base-uncased`, un transformer encoder destilado de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parámetros. Sobre esta base se añade una capa de clasificación de secuencias (`AutoModelForSequenceClassification` con `num_labels=2`), que proyecta la representación del token `[CLS]` a un espacio de dos dimensiones correspondientes a las clases negativa y positiva. Según el repositorio de GitHub del autor, el modelo fue ajustado sobre el conjunto de datos IMDB de reseñas de películas, aunque no se especifican los hiperparámetros de entrenamiento, el número de épocas ni la estrategia de optimización. Tampoco se indica si se empleó algún método de alineación como RLHF o DPO, algo poco habitual en modelos de clasificación de este tamaño.

## Capacidades

- Clasificación binaria de sentimiento: predice si una reseña es positiva (1) o negativa (0).
- Procesamiento de texto en inglés (presumiblemente, dado el modelo base `distilbert-base-uncased`).
- Adecuado para textos cortos y medianos, con una longitud máxima de 512 tokens.
- Inferencia eficiente gracias al tamaño reducido del modelo (66 M parámetros).
- Compatible con la librería Transformers y con el pipeline de `text-classification`.
- No soporta tool calling, agentes, visión ni modos de razonamiento extendido; es un modelo puramente discriminativo para una tarea específica.

## Casos de uso

- Moderación de comentarios en plataformas de reseñas: el modelo puede clasificar automáticamente las opiniones de usuarios en positivas o negativas, permitiendo priorizar la atención al cliente o detectar problemas recurrentes.
- Análisis de opinión en marketing: las empresas pueden procesar reseñas de productos o servicios para medir la satisfacción general y extraer tendencias de sentimiento a lo largo del tiempo.
- Filtrado de contenido en foros y redes sociales: integrar el clasificador en un pipeline para etiquetar publicaciones relacionadas con cine y entretenimiento, facilitando la organización de contenidos.
- Asistente de recomendación: combinar la salida del modelo con sistemas de recomendación para ajustar sugerencias basadas en la recepción de críticas.
- Investigación académica en NLP: servir como modelo de referencia para experimentos de análisis de sentimiento, comparación de técnicas de fine-tuning o estudio de destilación de modelos.
- Prototipado rápido: gracias a su tamaño y a la disponibilidad de pesos en safetensors, es ideal para demostraciones y pruebas de concepto en aplicaciones de análisis de texto sin necesidad de infraestructura potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de GitHub no incluye métricas de evaluación, y la model card de HuggingFace está vacía. Por tanto, no es posible comparar numéricamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 66 M parámetros, la inferencia puede ejecutarse con menos de 1 GB de VRAM en FP32 (aproximadamente 268 MB para los pesos, más memoria para activaciones). En cuantización de 8 bits, el requisito sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti, RTX 2060 o superior, es suficiente. También funciona en CPUs modernas con razonable velocidad.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama baja y en sistemas sin GPU.
- Opciones de despliegue: puede servirse mediante la librería Transformers con PyTorch, o a través de herramientas como Hugging Face Inference Endpoints, ONNX Runtime, o incluso llama.cpp si se convierte a formato GGUF (aunque no es lo habitual para encoders).
- Latencia estimada: en una GPU moderna, la inferencia por muestra suele estar en el rango de 1 a 10 milisegundos; en CPU, entre 20 y 100 milisegundos dependiendo del hardware.

## Comparativa con modelos similares

Existen otros clasificadores de reseñas de películas basados en DistilBERT alojados en HuggingFace, como `derek-harnett/movie-review-classifier` o `pa-shk/movie-review-classifier`. Sin embargo, no se dispone de datos comparativos de rendimiento ni de especificaciones detalladas de estos modelos. A nivel de arquitectura, todos comparten la misma base DistilBERT y la tarea de clasificación binaria. Alternativas más grandes como BERT base o RoBERTa ofrecerían mayor capacidad pero con un coste computacional superior. No se puede establecer una comparación cuantitativa con los datos disponibles.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo, pero al estar entrenado sobre reseñas de IMDB, es probable que refleje los sesgos presentes en ese conjunto de datos, como desequilibrios en la distribución de géneros o estilos de escritura.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero puede producir clasificaciones incorrectas en entradas ambiguas o fuera de dominio.
- Limitaciones de idioma: el modelo base está entrenado principalmente en inglés, por lo que su rendimiento en otros idiomas será deficiente o nulo.
- Restricciones de licencia: al no especificarse la licencia, el uso comercial podría estar sujeto a la licencia del modelo base (`distilbert-base-uncased`, que es Apache 2.0) y a la del conjunto de datos IMDB, que tiene términos de uso específicos. Se recomienda verificar antes de usar en producción.
- La model card no proporciona información sobre el proceso de entrenamiento, lo que dificulta evaluar la robustez del modelo ante datos adversarios o distribuciones diferentes a las de entrenamiento.
- No se han publicado métricas de evaluación, por lo que el rendimiento real es desconocido hasta que se realicen pruebas propias.

## Enlaces

- HuggingFace: https://huggingface.co/soleroa/movie-review-classifier
- Repositorio de GitHub: https://github.com/soleroa/movie-review-classifier
