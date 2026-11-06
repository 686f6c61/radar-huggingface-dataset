# MiaMarmeladenbrot/paraphrase-multilingual-MiniLM-L12-v2-de

## Resumen

paraphrase-multilingual-MiniLM-L12-v2-de es una copia con poda de vocabulario del modelo de embeddings de frases `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, exportado a ONNX en cuantización int8 y adaptado para texto en alemán (con soporte parcial de inglés). Lo publica la usuaria MiaMarmeladenbrot y su objetivo es reducir el peso del modelo para que pueda cargarse rápidamente en el navegador mediante transformers.js, sin reentrenar ni modificar los pesos del transformer.

El modelo original dedica aproximadamente el 82 % de su tamaño a la matriz de embeddings: 250.002 tokens para más de 50 idiomas. Esta variante conserva 28.789 tokens y elimina el resto de filas de la matriz de embeddings, renumerando el tokenizador en consecuencia. Las 12 capas del transformer permanecen intactas y ningún peso conservado ha sido alterado.

Es relevante para desarrolladores que necesitan búsqueda semántica o similitud de frases en alemán dentro de aplicaciones web ligeras, donde el tamaño de descarga y el tiempo de carga del modelo son críticos. La reducción de 112,8 MB a 33,3 MB en el archivo ONNX cuantizado y de 16,3 MB a 1,3 MB en el tokenizador hace viable su uso en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (MiniLM-L12, 12 capas), encoder de frases |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX cuantizado, `model_quantized.onnx`); el pipeline de transformers.js usa `dtype: 'q8'` |
| Idiomas soportados | aleman (principal), ingles (parcial) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado int8) y tokenizador JSON |
| Tamano del repositorio | 0,1 GB |
| Dimension del vocabulario | 28.789 tokens (frente a 250.002 del original) |
| Tamano de `onnx/model_quantized.onnx` | 33,3 MB (original: 112,8 MB) |
| Tamano de `tokenizer.json` | 1,3 MB (original: 16,3 MB) |
| Libreria | transformers.js |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer tipo BERT de 12 capas (MiniLM-L12), utilizado como encoder de frases para generar embeddings. El modelo no ha sido reentrenado: se trata de una poda de vocabulario sobre la exportación int8 ONNX del modelo original. Se conservaron los tokens empleados por los datos de libros y episodios de 2seiten, los tokens de las 50.000 palabras alemanas y 20.000 inglesas más frecuentes, y todos los caracteres latinos, dígitos y signos de puntuación. El resto de filas de la matriz de embeddings se eliminaron y el tokenizador se renumeró para coincidir.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre procesos de RLHF o DPO en la información proporcionada. La innovación técnica destacable es la poda selectiva de vocabulario: para cualquier texto cuyos tokens se hayan conservado, los vectores de salida son idénticos bit a bit a los del modelo original; las palabras fuera del vocabulario conservado se dividen en piezas más pequeñas que sí se conservan, de modo que el modelo no falla, aunque el vector resultante puede diferir ligeramente.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda vectorial.
- Extracción de características (`feature-extraction`) con pooling de media y normalización.
- Similitud de frases (`sentence-similarity`) en alemán y, parcialmente, en inglés.
- Ejecución en navegador mediante transformers.js y ONNX Runtime Web.
- Manejo robusto de palabras fuera del vocabulario mediante segmentación en subpiezas conservadas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de embeddings.
- No dispone de capacidades de visión, audio ni modo de razonamiento.

## Casos de uso

- Búsqueda semántica en aplicaciones web en alemán: el modelo genera embeddings en el navegador con un archivo ONNX de 33,3 MB, lo que permite indexar y consultar documentos sin enviar texto a un servidor.
- Detección de duplicados y near-duplicates en corpus alemanes: la similitud coseno entre embeddings permite agrupar artículos o reseñas casi idénticas.
- Clasificación de textos por similitud a prototipos: se calculan embeddings de frases de referencia y se asigna la categoría del prototipo más cercano, útil para moderación o etiquetado ligero.
- Sistemas de recomendación basados en contenido: se vectorizan descripciones de productos o artículos y se recuperan los más similares semánticamente.
- Clustering de opiniones o tickets de soporte en alemán: los embeddings alimentan algoritmos de agrupamiento para descubrir temas recurrentes sin etiquetas previas.
- Búsqueda dentro de documentación técnica o bases de conocimiento: integración en un pipeline RAG ligero del lado del cliente, donde el tamaño reducido del modelo es determinante.
- Filtrado previo en pipelines de recuperación: al ser un bi-encoder rápido y pequeño, sirve como primera etapa de recuperación antes de un reranker más pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo ONNX cuantizado ocupa 33,3 MB y el tokenizador 1,3 MB, por lo que el modelo completo cabe holgadamente en memoria de cualquier dispositivo.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En servidor, cualquier GPU moderna (A100, H100, RTX 4090) lo ejecuta con latencias mínimas, aunque es sobredimensionada para esta carga.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: transformers.js (diseño principal), ONNX Runtime Web, ONNX Runtime en servidor; también puede exportarse a otros runtimes compatibles con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Tamano ONNX int8 |
|---|---|---|---|---|---|---|
| paraphrase-multilingual-MiniLM-L12-v2-de (este modelo) | no disponible (MiniLM-L12) | no disponible | de, en (parcial) | Apache 2.0 | ONNX int8 | 33,3 MB |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible (MiniLM-L12) | no disponible | más de 50 idiomas | Apache 2.0 | safetensors, ONNX | 112,8 MB |
| Xenova/paraphrase-multilingual-MiniLM-L12-v2 | no disponible (MiniLM-L12) | no disponible | más de 50 idiomas | Apache 2.0 | ONNX int8 | 112,8 MB |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El vocabulario podado está optimizado para alemán y parcialmente para inglés; el uso con otros idiomas degradará la calidad de los embeddings o segmentará las palabras en subpiezas no representativas.
- Las palabras fuera del vocabulario conservado se dividen en piezas más pequeñas, lo que puede producir vectores ligeramente distintos a los del modelo original para esos textos.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- No se han publicado evaluaciones de sesgo, robustez o rendimiento downstream en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero la similitud semántica puede producir falsos positivos en tareas de recuperación o clasificación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de las condiciones del modelo base original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación communitaria.
- La fecha de creación indicada (2026-11-03) es futura respecto a la información habitual disponible; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MiaMarmeladenbrot/paraphrase-multilingual-MiniLM-L12-v2-de
- Modelo base original: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Exportación ONNX de referencia: https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
- Licencia: https://huggingface.co/MiaMarmeladenbrot/paraphrase-multilingual-MiniLM-L12-v2-de/blob/main/LICENSE
