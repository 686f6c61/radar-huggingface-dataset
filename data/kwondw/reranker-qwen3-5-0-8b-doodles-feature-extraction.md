# kwondw/reranker-Qwen3.5-0.8B-doodles-feature-extraction

## Resumen

El modelo `kwondw/reranker-Qwen3.5-0.8B-doodles-feature-extraction` es un cross-encoder de reranking desarrollado por el usuario kwondw, construido a partir del modelo base Qwen/Qwen3.5-0.8B y fine-tuneado con el dataset `julianmoraes/doodles-captions-manual`, que contiene captions manuales de imágenes de doodles. Su propósito es calcular puntuaciones de relevancia entre pares de entradas (texto-texto o imagen-texto), lo que lo hace útil para tareas de reranking en sistemas de búsqueda semántica y recuperación de información. A diferencia de los bi-encoders, el cross-encoder procesa conjuntamente ambas entradas, lo que permite una mayor precisión a costa de un mayor coste computacional por par.

El modelo se apoya en la arquitectura Qwen3.5 con una ventana de contexto de 262 144 tokens, y añade una capa de pooling tipo `lasttoken` seguida de una capa densa de 1024 a 1 para producir la puntuación. Está implementado con la librería `sentence-transformers` y se distribuye en formato `safetensors`. Aunque la licencia no está especificada, el modelo base Qwen3.5 es de código abierto, por lo que se espera un uso similar, pero conviene verificarlo antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-Encoder basado en Qwen3_5Model (transformer) con pooling lasttoken y capa densa final |
| Parametros totales | Aproximadamente 0.8 mil millones (basado en Qwen/Qwen3.5-0.8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen3.5 es multilingue, pero no se especifica para este fine-tuning) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un cross-encoder estándar implementado con `sentence-transformers`. El componente principal es un transformer `Qwen3_5Model` que procesa la concatenación de las dos entradas (por ejemplo, una imagen codificada como secuencia de tokens y un texto, o dos textos). Tras la pasada del transformer, se aplica un pooling de tipo `lasttoken` que extrae la representación del último token de la secuencia (incluyendo el prompt si se usa chat template), obteniendo un vector de 1024 dimensiones. Finalmente, una capa densa sin sesgo proyecta este vector a un único valor de puntuación, con función de activación identidad.

El entrenamiento se realizó sobre el dataset `julianmoraes/doodles-captions-manual`, que contiene 9000 muestras de pares imagen-texto y texto-imagen, con captions generadas manualmente. Se utilizó la función de pérdida `BinaryCrossEntropyLoss`, típica para tareas de reranking donde se optimiza la probabilidad de relevancia. No se mencionan técnicas adicionales como RLHF o DPO. La arquitectura soporta múltiples modalidades (texto, imagen, vídeo y mensajes estructurados) según la configuración de `modality_config`, aunque el entrenamiento se centró en el dominio específico de doodles.

## Capacidades

- Reranking de pares de textos: dado un query y un conjunto de candidatos, asigna una puntuación de relevancia a cada par, permitiendo ordenar los resultados.
- Reranking imagen-texto: acepta URLs de imágenes como entrada junto con texto, lo que permite puntuar la relevancia entre una imagen y una descripción textual (como se muestra en el ejemplo de uso).
- Búsqueda semántica: puede integrarse como etapa de reranking tras un primer filtrado con bi-encoders para mejorar la precisión final.
- Soporte de múltiples modalidades: la configuración interna admite texto, imagen, vídeo y mensajes, aunque el uso práctico documentado se limita a texto e imagen.
- Ventana de contexto larga: los 262 144 tokens permiten procesar documentos extensos o secuencias largas sin truncamiento.
- Integración con `sentence-transformers`: se puede cargar directamente con la clase `CrossEncoder` y usar `model.predict()` para obtener puntuaciones.

## Casos de uso

- Búsqueda de imágenes por descripción textual: un usuario describe un doodle ("un personaje con cabeza marrón y pelo rosa") y el modelo puntúa la relevancia de cada imagen candidata, permitiendo ordenar los resultados de una galería o base de datos de imágenes.
- Reranking en motores de búsqueda: después de una recuperación inicial con un bi-encoder (por ejemplo, embeddings de texto), se usa este cross-encoder para reordenar los primeros 100 resultados y seleccionar los 10 más relevantes, mejorando la precisión sin un coste excesivo.
- Sistemas de recomendación de contenido visual: dada una imagen de referencia y un catálogo de captions, el modelo puede identificar las descripciones más fieles, útil en plataformas de stock de imágenes o generación de alt-text.
- Filtrado de candidatos en pipelines de generación aumentada por recuperación (RAG): en un sistema que combina texto e imágenes, el cross-encoder puede puntuar la relevancia de fragmentos multimodales antes de pasarlos al generador.
- Clasificación de pares pregunta-respuesta: aunque no es su uso principal, puede adaptarse para puntuar la adecuación de respuestas a preguntas en dominios visuales, como en foros de diseño o arte.
- Evaluación de calidad de captions automáticas: dado un conjunto de captions generadas por un modelo de visión-lenguaje, el cross-encoder puede puntuar su fidelidad respecto a la imagen original, sirviendo como métrica de evaluación.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Dataset | Métrica | Valor |
|---|---|---|
| doodles-image-to-text-eval | MAP | 0.9273 |
| doodles-image-to-text-eval | MRR@10 | 0.9273 |
| doodles-image-to-text-eval | NDCG@10 | 0.9455 |
| doodles-text-to-image-eval | MAP | 0.6906 |
| doodles-text-to-image-eval | MRR@10 | 0.6858 |
| doodles-text-to-image-eval | NDCG@10 | 0.7464 |

Estos valores indican un rendimiento alto en la dirección imagen-a-texto (puntuación de captions para una imagen dada) y moderado en la dirección texto-a-imagen (selección de imágenes para una descripción). No se han publicado comparaciones con otros modelos en los mismos conjuntos de evaluación.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 0.8 mil millones de parámetros, la inferencia en precisión FP16 requiere alrededor de 1,6 GB de VRAM, y en cuantización INT8 unos 0,8 GB. Esto lo hace ejecutable en GPUs de consumo como la RTX 3060 (12 GB) o superiores.
- Para despliegues con mayor concurrencia, se recomienda una GPU con al menos 8 GB de VRAM si se usan lotes pequeños, o 16 GB para procesamiento por lotes mayor.
- Se puede ejecutar en CPU para casos de baja latencia, aunque el rendimiento será menor; es viable para pruebas o entornos sin GPU.
- Opciones de despliegue: al ser un modelo de `sentence-transformers`, se integra fácilmente con librerías como `transformers` y `vLLM` (si se adapta como modelo de secuencia), aunque su uso principal es a través de la API de `CrossEncoder`. También se puede servir con `TGI` si se convierte a un formato compatible, pero no hay documentación específica para ello.
- La latencia por par depende de la longitud de las entradas; con secuencias cortas (menos de 512 tokens) en una GPU moderna se esperan tiempos de milisegundos. No se proporcionan datos oficiales de throughput.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros cross-encoders en los mismos conjuntos de evaluación. Sin embargo, existen alternativas en el ecosistema Qwen, como los modelos `Qwen3-Reranker` de 0.6B, 4B y 8B (referenciados en el repositorio oficial de Qwen3.8). Estos modelos están diseñados específicamente para tareas de reranking y podrían servir como referencia, aunque no se han evaluado en el dominio de doodles. Otros cross-encoders genéricos como `BAAI/bge-reranker-base` (0.1B) o `cross-encoder/ms-marco-MiniLM-L-6-v2` (0.1B) son más ligeros pero con menor capacidad de contexto y sin soporte multimodal. Dado que no hay datos comparativos publicados, se recomienda evaluar el modelo en el dominio objetivo antes de elegir.

## Limitaciones y advertencias

- El modelo está fine-tuneado exclusivamente con captions de doodles, un dominio muy específico. Su rendimiento en otros tipos de imágenes o textos generales puede degradarse significativamente.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor o verificar la licencia del modelo base Qwen3.5 antes de utilizarlo en producción.
- No se han documentado sesgos específicos, pero al entrenarse con un dataset manual (9000 muestras), es probable que refleje los sesgos de los anotadores y la limitada variedad de estilos de doodles.
- La dirección texto-a-imagen muestra un rendimiento claramente inferior (MAP 0.69 vs 0.93 en imagen-a-texto), lo que sugiere que la asociación de imágenes a descripciones es menos precisa.
- El modelo no está diseñado para generación de texto ni para razonamiento complejo; su única salida es una puntuación de relevancia.
- La ventana de contexto de 262 144 tokens es amplia, pero el coste computacional crece cuadráticamente con la longitud de las entradas, por lo que en la práctica se recomienda limitar la longitud de los pares.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kwondw/reranker-Qwen3.5-0.8B-doodles-feature-extraction)
- [Dataset de entrenamiento: julianmoraes/doodles-captions-manual](https://huggingface.co/datasets/julianmoraes/doodles-captions-manual)
- [Documentación de CrossEncoder de sentence-transformers](https://www.sbert.net/docs/cross_encoder/usage/usage.html)
- [Repositorio de sentence-transformers en GitHub](https://github.com/huggingface/sentence-transformers)
- [Modelo similar de tomaarsen: reranker-Qwen3.5-0.8B-doodles-image-text-to-text](https://huggingface.co/tomaarsen/reranker-Qwen3.5-0.8B-doodles-image-text-to-text)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
