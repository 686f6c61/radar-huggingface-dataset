# aneforge/paraphrase-MiniLM-L6-v2

## Resumen

`aneforge/paraphrase-MiniLM-L6-v2` es una copia sin modificar del modelo de embeddings de frases `sentence-transformers/paraphrase-MiniLM-L6-v2`, publicada por el usuario `aneforge` con el objetivo de que los pesos se carguen y ejecuten directamente en el Apple Neural Engine (ANE) a través de la librería ANEForge, sin necesidad de conversión a CoreML. Los pesos son byte-idénticos al modelo original, por lo que las capacidades y el comportamiento son exactamente los mismos que los del modelo base.

El modelo original, desarrollado por el equipo de sentence-transformers, es un transformer BERT de tamaño pequeño (MiniLM-L6) que mapea frases y párrafos cortos a un espacio vectorial denso de 384 dimensiones. Está optimizado para tareas de similitud semántica, búsqueda semántica, detección de paráfrasis y clustering. Su relevancia actual radica en que permite ejecutar estos embeddings de forma eficiente en hardware de Apple, aprovechando la unidad de procesamiento neuronal integrada en los chips M1 y posteriores, lo que reduce la latencia y el consumo energético en aplicaciones locales.

El modelo tiene 22,7 millones de parámetros, una longitud de contexto máxima de 128 tokens (según la configuración original) y se distribuye bajo licencia Apache-2.0. Está disponible en formato safetensors y es compatible con la librería `sentence-transformers` estándar, además de con ANEForge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L6) con mean pooling |
| Parametros totales | 22.713.728 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128 tokens (configuración original; algunas fuentes indican 512, pero el modelo base usa 128) |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16, sin cuantización publicada) |
| Idiomas soportados | inglés (modelo original entrenado principalmente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniLM-L6, una variante de BERT con 6 capas de transformer y 384 dimensiones ocultas. Utiliza mean pooling sobre los tokens de salida para generar un embedding de frase de 384 dimensiones. El modelo original fue entrenado por sentence-transformers con un objetivo de similitud de frases, utilizando pares de frases y técnicas de contraste (como siamese networks) sobre datasets como STS-B, y posteriormente afinado para tareas de paráfrasis. No se han publicado detalles específicos sobre el número de tokens de entrenamiento o la composición exacta del dataset en la información disponible.

La versión `aneforge` no introduce ninguna modificación en los pesos ni en la arquitectura. La única diferencia es que el repositorio está etiquetado para que ANEForge compile el grafo del modelo en un programa ANE y transmita los pesos desde Hugging Face Hub, permitiendo la ejecución directa en el Neural Engine de Apple sin pasar por CoreML.

## Capacidades

- Generación de embeddings de frases y párrafos cortos (hasta 128 tokens) en un espacio vectorial de 384 dimensiones.
- Similitud semántica entre textos: cálculo de similitud coseno entre embeddings.
- Detección de paráfrasis: identifica si dos frases tienen el mismo significado.
- Búsqueda semántica y recuperación de información: encuentra textos relevantes por significado, no por palabras clave.
- Clustering de documentos o frases basado en la proximidad de los embeddings.
- Clasificación de textos mediante la comparación de embeddings con representaciones de clases.
- Soporte para tool calling: no aplicable, es un modelo de embeddings, no un modelo generativo.
- Capacidades multilingües: limitadas al inglés, aunque puede funcionar razonablemente con otros idiomas si se entrena, pero no está optimizado.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: indexar documentos y consultas con embeddings, y recuperar los más relevantes por similitud coseno. El modelo es adecuado por su tamaño reducido y baja latencia en dispositivos Apple.
- Detección de duplicados en sistemas de tickets o correos: comparar embeddings de textos para identificar paráfrasis o contenido repetido, útil en atención al cliente.
- Clustering de comentarios o reseñas: agrupar opiniones de usuarios por tema o sentimiento mediante embeddings, facilitando el análisis de grandes volúmenes de texto.
- Sistemas de recomendación basados en contenido: representar ítems (descripciones, títulos) como embeddings y recomendar similares por proximidad vectorial.
- Moderación de contenido: clasificar mensajes o publicaciones comparando sus embeddings con ejemplos etiquetados de contenido inapropiado.
- Aplicaciones móviles y de escritorio en macOS/iOS: ejecutar embeddings localmente en el Neural Engine para búsqueda offline, sin conexión a internet, gracias a ANEForge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio específico. El modelo original `sentence-transformers/paraphrase-MiniLM-L6-v2` tiene resultados publicados en su repositorio (por ejemplo, en STS Benchmark), pero no se incluyen en la documentación de esta copia. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Requisitos de hardware

- El modelo tiene 22,7 millones de parámetros, lo que ocupa aproximadamente 90 MB en FP32 (o ~45 MB en FP16). Cabe en cualquier dispositivo con al menos 1 GB de RAM.
- Para usar ANEForge se requiere un dispositivo Apple con Neural Engine: chips M1, M2, M3 o posteriores (Mac, iPad, iPhone). El modelo se ejecuta en el ANE, liberando CPU y GPU.
- En hardware no Apple, se puede ejecutar con `sentence-transformers` estándar en CPU o GPU (por ejemplo, una RTX 3060 o superior es más que suficiente).
- Opciones de despliegue: ANEForge (para Apple), `sentence-transformers` (Python), o servidores de embeddings como Text Embeddings Inference (TEI) si se sirve como API.
- Latencia: en el ANE, la inferencia para una frase típica es del orden de milisegundos (no se dispone de cifras exactas). En CPU, la latencia es mayor pero sigue siendo baja para un modelo de este tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones embedding | Licencia | Uso en ANE |
|---|---|---|---|---|---|
| aneforge/paraphrase-MiniLM-L6-v2 | 22,7 M | 128 | 384 | Apache-2.0 | Sí (ANEForge) |
| sentence-transformers/paraphrase-MiniLM-L6-v2 | 22,7 M | 128 | 384 | Apache-2.0 | No (requiere CoreML) |
| aneforge/all-MiniLM-L6-v2 | 22,7 M | 128 | 384 | Apache-2.0 | Sí (ANEForge) |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 128 | 384 | Apache-2.0 | No (requiere CoreML) |

La diferencia principal entre las versiones `aneforge` y las originales es la compatibilidad directa con ANEForge; los pesos son idénticos. No hay diferencias de rendimiento entre ellas.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser significativamente inferior.
- La longitud de contexto está limitada a 128 tokens; textos más largos se truncan, lo que puede perder información relevante.
- Al ser un modelo de embeddings, no genera texto ni responde preguntas; solo produce representaciones vectoriales.
- Riesgo de sesgos: como cualquier modelo entrenado con datos web, puede reflejar sesgos presentes en los datos de entrenamiento, aunque no se han documentado específicamente.
- Alucinación: no aplica, ya que no genera texto.
- Para uso comercial, la licencia Apache-2.0 permite uso libre, pero se debe mantener el aviso de copyright.
- La ejecución en ANEForge requiere que la librería esté correctamente instalada y que el dispositivo tenga un Neural Engine compatible; en caso contrario, el modelo puede ejecutarse en CPU pero sin las ventajas de rendimiento del ANE.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aneforge/paraphrase-MiniLM-L6-v2
- Modelo original: https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L6-v2
- Repositorio ANEForge: https://github.com/sbryngelson/ANEForge
- Documentación de ANEForge: https://aneforge.readthedocs.io
- Paper de ANEForge: https://arxiv.org/abs/2606.17090
- Versión aneforge de all-MiniLM-L6-v2: https://huggingface.co/aneforge/all-MiniLM-L6-v2
