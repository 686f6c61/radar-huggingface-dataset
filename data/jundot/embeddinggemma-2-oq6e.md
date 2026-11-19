# Jundot/embeddinggemma-2-oQ6e

## Resumen

embeddinggemma-2-oQ6e es una cuantización de precisión mixta en formato MLX del modelo de embeddings multimodales google/embeddinggemma-2, desarrollado por Google DeepMind. El modelo original proyecta texto, imágenes, vídeo y audio en un único espacio vectorial de 768 dimensiones, lo que permite búsqueda semántica y recuperación cruzada entre modalidades con un solo modelo. Esta versión, publicada por el usuario Jundot, mantiene los tres codificadores (texto, visión y audio) pero comprime el codificador de texto mediante la técnica oQ de oMLX 0.8.0.

El checkpoint tiene 744.371.512 parámetros lógicos y ocupa 1,2 GB en disco. La cuantización aplica 6 bits afines (grupo 64) al 32,9 % de los pesos, 8 bits afines al 3,6 % y deja el 63,4 % restante en BF16, con un promedio efectivo de 12,600 bits por peso para el conjunto completo y 6,702 bits por peso para el codificador de texto. El resultado es un modelo apto para inferencia en Apple Silicon vía MLX con una huella de memoria reducida respecto al original.

Su relevancia actual radica en la combinación de multimodalidad de embeddings con un empaquetado ligero y una licencia Apache-2.0 permisiva. No obstante, conviene señalar que la model card no documenta resultados de benchmarks ni la composición del entrenamiento, y que la herramienta de servicio oMLX no carga el codificador de audio, por lo que el uso práctico de esa modalidad queda limitado al acceso directo a los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de embeddings (codificadores de texto, visión y audio) |
| Parametros totales | 744.371.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ de precisión mixta: affine 6-bit grupo 64, affine 8-bit grupo 64 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base google/embeddinggemma-2 es un sistema de embeddings multimodales compuesto por tres codificadores independientes que comparten un espacio latente de 768 dimensiones: un codificador de texto (0,271B de pesos lógicos), un codificador de visión (0,168B) y un codificador de audio (0,306B). Esta versión cuantizada conserva la arquitectura del original y solo altera la representación numérica de los pesos. La model card no detalla el número de capas, la dimensionalidad interna ni el mecanismo de atención de cada codificador.

En cuanto al entrenamiento, la información disponible no especifica el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación técnica documentada corresponde exclusivamente al proceso de cuantización: oQ asigna bits según la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras × 512 tokens) y reajusta escala y sesgo mediante mínimos cuadrados ponderados. La revisión de oMLX 0.8.0 introduce un refinamiento del redondeo oQe que reduce el error de cuantización sin cambiar tamaño ni velocidad.

## Capacidades

- Generación de embeddings de texto en un espacio vectorial de 768 dimensiones, orientado a similitud semántica y recuperación.
- Embeddings de imagen dentro del mismo espacio vectorial, lo que habilita búsqueda texto-a-imagen e imagen-a-imagen.
- Embeddings de audio en el mismo espacio, aunque oMLX no carga este codificador al servir peticiones.
- Embeddings multimodales cruzados: consultas en una modalidad contra un índice construido en otra.
- Extracción de características (`feature-extraction`) como tarea principal del pipeline.
- Servicio de texto e imagen mediante `POST /v1/embeddings` en oMLX.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking, ya que se trata de un modelo de embeddings y no generativo.

## Casos de uso

- Búsqueda semántica multilingüe sobre documentación técnica: indexar fragmentos de texto con el codificador de texto y recuperar los más relevantes para una consulta, aprovechando el espacio de 768 dimensiones para ordenar por similitud coseno.
- Búsqueda visual en catálogos de producto: generar embeddings de las imágenes del catálogo y permitir consultas en lenguaje natural que se proyectan al mismo espacio vectorial.
- Deduplicación de contenido multimedia: comparar embeddings de imágenes o textos para detectar duplicados y near-duplicates en pipelines de ingestión de datos.
- Sistemas de recomendación basados en contenido: representar ítems heterogéneos (texto, imagen) en un único espacio para calcular afinidades sin necesidad de modelos separados por modalidad.
- Clasificación zero-shot por prototipos: construir embeddings de etiquetas descriptivas y asignar la clase más cercana a cada documento o imagen entrante.
- RAG ligero en local sobre Apple Silicon: desplegar el modelo con MLX en un portátil para generar embeddings de un corpus pequeño sin depender de servicios en la nube, gracias a su huella de 1,2 GB.
- Moderación y clustering de contenido: agrupar publicaciones o mensajes por similitud semántica para detectar temas emergentes o contenido repetido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de cuantización (bits efectivos por peso y desglose de almacenamiento), sin evaluaciones de calidad de recuperación como MTEB, BEIR o tareas de recuperación multimodal.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GiB de almacenamiento de pesos (1,172 GB en disco); el consumo en memoria durante inferencia debe añadir los estados intermedios de los tres codificadores, no cuantificados en su totalidad.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (series M1, M2, M3 y M4); no se documenta soporte para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; el tamaño de 1,2 GB lo hace viable incluso en equipos con 8 GB de memoria unificada.
- Opciones de despliegue: oMLX (versión 0.8.0 o superior) para servir texto e imagen vía API compatible con `/v1/embeddings`; MLX directamente para cargar los pesos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| embeddinggemma-2-oQ6e | 744M | no disponible | Texto, imagen, audio | Apache-2.0 | safetensors (MLX) |
| google/embeddinggemma-2 (original) | no disponible | no disponible | Texto, imagen, audio | Apache-2.0 | no disponible |
| Alternativas de embeddings de texto | no disponible | no disponible | Texto | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (embeddings multimodales) en la documentación proporcionada, por lo que la comparativa se limita al modelo base del que deriva esta cuantización.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación no aplicable en sentido estricto al ser un modelo de embeddings, pero la cuantización introduce error numérico que puede degradar la calidad de recuperación frente al original en BF16.
- El codificador de audio no se carga al servir con oMLX, por lo que la funcionalidad de audio solo está disponible accediendo directamente a los pesos.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide planificar el tamaño de los fragmentos a indexar.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/embeddinggemma-2, ya que la model card remite a `LICENSE` sin detallar restricciones adicionales.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay artefactos GGUF ni compatibilidad documentada con stacks CUDA.
- La cuantización se aplicó únicamente al codificador de texto; visión y audio permanecen en BF16, de modo que el ahorro de memoria se concentra en una sola modalidad.
- El checkpoint se actualizó el 2026-11-19 con un redondeo refinado; copias anteriores presentan mayor error de cuantización y deberían reemplazarse.

## Enlaces

- [Hugging Face: Jundot/embeddinggemma-2-oQ6e](https://huggingface.co/Jundot/embeddinggemma-2-oQ6e)
- [Modelo base: google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2)
- [Repositorio oQ / oMLX](https://github.com/jundot/omlx)
- [PR jundot/omlx#4930: mejora de oQe](https://github.com/jundot/omlx/pull/4930)
- [PR jundot/omlx#5292: refinamiento del redondeo oQe](https://github.com/jundot/omlx/pull/5292)
- [PR jundot/omlx#4333: servicio de texto e imagen en /v1/embeddings](https://github.com/jundot/omlx/pull/4333)
