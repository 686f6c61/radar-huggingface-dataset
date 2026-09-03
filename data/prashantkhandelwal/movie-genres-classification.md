# prashantkhandelwal/movie-genres-classification

## Resumen

El modelo `prashantkhandelwal/movie-genres-classification` es un clasificador multi-etiqueta de géneros de películas basado en BERT, desarrollado por `prashantkhandelwal` mediante fine-tuning del modelo `google-bert/bert-base-uncased`. Su objetivo es predecir uno o varios géneros (de un total de 19) a partir del título y la sinopsis de una película.

Con 109.496.851 parámetros y una ventana de contexto de 512 tokens, está diseñado para tareas de clasificación de texto en inglés. Se distribuye bajo licencia Apache 2.0 y se puede cargar directamente con la librería Transformers.

La clasificación automática de géneros es clave en sistemas de recomendación, catalogación de contenido y enriquecimiento de metadatos en plataformas de streaming y bases de datos cinematográficas. Este modelo ofrece una solución sencilla y ligera para integrar esa capacidad en pipelines de procesamiento de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) con cabeza de clasificación multi-etiqueta |
| Parámetros totales | 109.496.851 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de `google-bert/bert-base-uncased`) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, concretamente en la variante `bert-base-uncased`, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. Sobre el token `[CLS]` se añade una capa de clasificación lineal con activación sigmoid, lo que permite la predicción multi-etiqueta: cada una de las 19 clases de género recibe una probabilidad independiente.

El entrenamiento es un fine-tuning supervisado sobre el modelo base. No se especifican en la documentación los datos de entrenamiento, el número de tokens ni la composición del dataset. Tampoco se menciona el uso de RLHF, DPO ni otras técnicas de alineación. No presenta innovaciones técnicas destacables más allá de la adaptación estándar de BERT a clasificación multi-etiqueta.

## Capacidades

- Clasificación multi-etiqueta de géneros de películas: predice uno o más de 19 géneros (Action, Comedy, Drama, Horror, Romance, Science Fiction, Thriller, etc.) a partir del título y la sinopsis.
- Generación de texto: no aplica; es un modelo discriminativo de clasificación.
- Razonamiento, código y matemáticas: no aplica.
- Visión y audio: no aplica.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingües: solo inglés (`language: en`).
- Modo thinking: no disponible.

## Casos de uso

- Catalogación automática de películas en plataformas de streaming: el modelo puede asignar géneros a títulos y sinopsis a escala, ahorrando trabajo manual y manteniendo metadatos coherentes.
- Enriquecimiento de metadatos en bases de datos cinematográficas: se puede integrar en pipelines de ingesta para añadir etiquetas de género a registros existentes o nuevos, facilitando búsquedas y filtros.
- Sistemas de recomendación basados en género: al obtener el perfil de géneros de un usuario a partir de sus películas vistas, el modelo puede sugerir nuevos títulos con géneros similares.
- Análisis de sinopsis en archivos de investigación: permite clasificar grandes volúmenes de sinopsis para estudios de mercado, análisis de tendencias o investigación académica.
- Filtrado de contenido en aplicaciones de reseñas: ayuda a categorizar automáticamente las películas reseñadas por los usuarios, mejorando la organización del contenido generado.
- Automatización de etiquetado en pipelines de datos para entrenamiento de otros modelos: las etiquetas generadas pueden servir como ground truth débil para entrenar modelos más complejos o para preprocesar datos.
- Integración en asistentes de búsqueda por descripción: un usuario puede escribir una sinopsis y el sistema devuelve los géneros detectados, mejorando la experiencia de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 ocupan aproximadamente 437 MB (109.496.851 parámetros × 4 bytes). Con overhead de inferencia, se recomienda al menos 1 GB de VRAM. En FP16 el peso se reduciría a ~219 MB, pero no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (RTX 2060, RTX 3060, Tesla T4, etc.). También puede ejecutarse en CPU.
- ¿Cabe en consumer GPU? Sí, en GPUs de consumo con 2 GB o más.
- Opciones de despliegue: Hugging Face Transformers (pipeline), Hugging Face Inference Endpoints y servicios compatibles con la librería Transformers. No se documenta soporte para vLLM, llama.cpp ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un fine-tuning de `google-bert/bert-base-uncased`, por lo que su rendimiento será similar al de otros clasificadores de texto basados en BERT, pero no hay datos publicados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para textos en otros idiomas.
- La ventana de contexto es de 512 tokens; sinopsis muy largas se truncarán o requerirán preprocesamiento.
- El umbral de 0.5 para considerar un género como positivo es fijo en el ejemplo de uso, pero puede no ser óptimo según la distribución de clases.
- No hay información sobre los datos de entrenamiento, por lo que no se pueden evaluar sesgos específicos.
- Al ser un modelo discriminativo, no genera texto y no puede responder preguntas ni razonar.
- La licencia Apache 2.0 permite uso comercial, pero no incluye garantías de rendimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/prashantkhandelwal/movie-genres-classification
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
