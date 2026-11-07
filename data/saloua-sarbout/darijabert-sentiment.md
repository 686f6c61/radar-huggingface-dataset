# saloua-sarbout/darijabert-sentiment

## Resumen

`saloua-sarbout/darijabert-sentiment` es un modelo de clasificación de texto publicado en Hugging Face por el usuario saloua-sarbout, presumiblemente derivado de DarijaBERT, el primer modelo BERT entrenado específicamente para el dialecto árabe marroquí (dariya). Con 147.483.651 parámetros, encaja exactamente en la arquitectura BERT-base (~110M de parámetros en el encoder más una cabeza de clasificación), lo que sugiere un fine-tuning supervisado sobre una base preentrenada para tareas de análisis de sentimiento en dariya.

El modelo resuelve un problema concreto: el análisis de sentimiento en un dialecto árabe con escasa representación en los recursos NLP estándar. Mientras que el árabe estándar moderno (MSA) cuenta con modelos y corpus abundantes, el dariya se caracteriza por una ortografía no normalizada, code-switching frecuente con francés y español, y una morfología propia que degrada el rendimiento de los modelos entrenados en MSA. Un clasificador especializado permite procesar opiniones de redes sociales, reseñas y feedback de clientes en este registro.

La relevancia del modelo es, sin embargo, limitada por la ausencia casi total de documentación: la model card es la plantilla autogenerada de Hugging Face sin rellenar, no se declara licencia, idiomas, datos de entrenamiento ni métricas de evaluación. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación preliminar más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only) con cabeza de clasificación de texto |
| Parametros totales | 147.483.651 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la de BERT-base es 512 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica INT8 posible vía PyTorch/ONNX) |
| Idiomas soportados | no disponible (presumiblemente dariya/árabe marroquí, no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only tipo BERT. El recuento de parámetros (147,5M) es superior al de BERT-base estándar (110M), lo que es consistente con una base DarijaBERT (BERT-base sin objetivo NSP) más una cabeza de clasificación lineal y, posiblemente, embeddings de vocabulario ampliados para cubrir el alfabeto árabe y la ortografía latina del dariya (el vocabulario de DarijaBERT se desconoce en detalle a partir de la información disponible).

No hay información en la model card sobre el corpus de fine-tuning, el número de ejemplos, la composición del dataset, el esquema de etiquetas (binario positivo/negativo, ternario, etc.), la función de pérdida, los hiperparámetros de entrenamiento ni si se aplicaron técnicas de aumento de datos o normalización ortográfica. La referencia bibliográfica incluida en los tags (`arxiv:1910.09700`) corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la plantilla, y no a un paper del modelo. No se documenta ningún proceso de RLHF ni DPO, algo esperable en un clasificador.

## Capacidades

- Clasificación de texto: la pipeline declarada es `text-classification`; el modelo emite etiquetas con puntuaciones de confianza sobre una entrada de texto.
- Análisis de sentimiento: el nombre del checkpoint indica fine-tuning para polaridad (presumiblemente positivo/negativo, no confirmado).
- Procesamiento de dariya: por herencia de DarijaBERT, se espera cierta robustez ante ortografía no estándar y code-switching, aunque no está validado en la documentación.
- Extracción de embeddings: al ser un encoder BERT, puede usarse para representaciones vectoriales (tag `text-embeddings-inference`), aunque no está entrenado con objetivo contrastivo.
- Tool calling / function calling: no soportado (no es un modelo generativo).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no declaradas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Monitorización de redes sociales en Marruecos: clasificar comentarios y publicaciones en dariya para detectar crisis de reputación o picos de opinión negativa; el modelo está especializado en el registro informal que domina estas plataformas.
- Análisis de reseñas de e-commerce: procesar valoraciones de productos escritas en dariya (frecuentes en marketplaces marroquíes) y agregar la polaridad por producto o vendedor.
- Atención al cliente: enrutar tickets o mensajes de soporte según el sentimiento detectado para priorizar casos de insatisfacción; requiere umbrales de confianza calibrados sobre datos propios.
- Investigación sociolingüística: etiquetar corpus de dariya a gran escala para estudiar la evolución de la opinión pública o comparar registros dialectales.
- Filtrado de contenido en comunidades online: detectar automáticamente mensajes hostiles o negativos en foros y grupos, como primera etapa de un pipeline de moderación.
- Baseline para fine-tuning adicional: servir como punto de partida para adaptar la clasificación a dominios específicos (finanzas, telecomunicaciones) con un conjunto etiquetado pequeño, dado el bajo coste computacional del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de accuracy, F1 ni comparaciones con otros sistemas, y la búsqueda web solo aporta referencias a trabajos externos sobre DarijaBERT y análisis de sentimiento en dariya que no evalúan este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~0,6 GB (147,5M parámetros × 4 bytes), coherente con el tamaño del repo (0,6 GB).
- VRAM estimada en FP16/BF16: ~0,3 GB; en INT8 dinámico: ~0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10G, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, Text Embeddings Inference (tag `text-embeddings-inference`), exportación a ONNX Runtime, TorchScript o `optimum`; también es viable servirlo con FastAPI o un contenedor ligero.
- Latencia y throughput: no disponibles en la documentación; para un BERT-base en una GPU moderna se espera un throughput del orden de miles de secuencias cortas por segundo, pero es una estimación genérica no medida sobre este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saloua-sarbout/darijabert-sentiment | 147,5M | no disponible | Clasificación de sentimiento (presumiblemente dariya) | no disponible | Hugging Face, 0 descargas |
| SI2M-Lab/DarijaBERT | ~110M (BERT-base sin NSP) | 512 tokens (BERT-base) | Modelo base (MLM), no clasificador | no disponible en la información | Hugging Face, modelo de referencia |
| BenhamdaneNawfal/sentiment-analysis-darija | BERT-base | 512 tokens (BERT-base) | Clasificación binaria positivo/negativo en dariya | no disponible en la información | Hugging Face |

La comparación con alternativas se limita a estos dos modelos identificados en la búsqueda; no se dispone de métricas comparativas publicadas para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla autogenerada sin rellenar; no se especifican datos de entrenamiento, etiquetas, métricas ni procedencia de los pesos.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: aunque el nombre sugiere dariya, no hay confirmación oficial ni evaluación de robustez frente a variantes ortográficas o code-switching.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza si el modelo se aplica fuera de su distribución de entrenamiento.
- Sesgos desconocidos: sin información sobre el corpus, no se pueden evaluar sesgos de dominio, género, región o registro.
- Sin validación externa: 0 descargas y 0 likes sugieren que el checkpoint no ha sido probado por la comunidad; no hay evidencia de calidad más allá de la existencia del artefacto.
- Contexto limitado (presumiblemente 512 tokens por herencia de BERT): no apto para documentos largos sin truncado o segmentación previa.
- Fecha de creación anómala (2026-11-06): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saloua-sarbout/darijabert-sentiment
- DarijaBERT (modelo base de referencia): https://huggingface.co/SI2M-Lab/DarijaBERT
- Modelo alternativo de sentimiento en dariya: https://huggingface.co/BenhamdaneNawfal/sentiment-analysis-darija
- Artículo sobre clasificación de sentimiento marroquí con DarijaBERT y stacking (Springer): https://link.springer.com/chapter/10.1007/978-3-031-46849-0_24
- Estudio comparativo de análisis de sentimiento en dariya (Springer): https://link.springer.com/chapter/10.1007/978-3-032-23844-3_7
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact#compute
- Artículo de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
