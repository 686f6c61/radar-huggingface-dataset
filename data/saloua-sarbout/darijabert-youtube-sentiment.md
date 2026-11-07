# saloua-sarbout/darijabert-youtube-sentiment

## Resumen

DarijaBERT YouTube Sentiment es un modelo de clasificación de texto derivado de la familia DarijaBERT, especializado en análisis de sentimiento sobre contenido en árabe marroquí (darija), presumiblemente aplicado a comentarios de YouTube. Lo publica la usuaria de Hugging Face `saloua-sarbout` y se distribuye como un checkpoint de `transformers` con pesos en formato safetensors. El nombre del repositorio y la etiqueta `bert` indican una arquitectura transformer encoder-only de tipo BERT, aunque la model card no aporta confirmación explícita del modelo base ni de los datos de entrenamiento.

El modelo tiene 147.482.882 parámetros totales (aproximadamente 0,15 mil millones), lo que lo sitúa en la escala de BERT-base. Está etiquetado para la tarea `text-classification` y es compatible con `text-embeddings-inference` y con endpoints de Hugging Face, lo que facilita su despliegue como servicio de inferencia. El repositorio ocupa 0,6 GB, coherente con un checkpoint en precisión completa o media.

Su relevancia radica en el nicho: el darija es una variedad lingüística con escasos recursos NLP y una ortografía no estandarizada, por lo que los modelos especializados para análisis de sentimiento en este idioma son poco frecuentes. No obstante, la información pública es muy limitada: la model card es la plantilla autogenerada de Hugging Face, sin métricas, sin descripción del dataset y sin licencia declarada, lo que condiciona cualquier evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (según tag `bert`; modelo base exacto no disponible) |
| Parametros totales | 147.482.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típica de BERT-base: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos safetensors; cuantización a INT8/FP16 posible vía herramientas estándar) |
| Idiomas soportados | no disponible (por nombre, darija/árabe marroquí; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de la familia BERT, según la etiqueta del repositorio y el número de parámetros (147,5 M, compatible con BERT-base). El nombre sugiere un fine-tuning de DarijaBERT, un modelo preentrenado específicamente para darija, aunque la model card no lo confirma ni documenta el proceso. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco habitual en clasificación) ni innovaciones técnicas.

Tampoco se especifican hiperparámetros, régimen de precisión, epochs ni estrategia de validación. La única información técnica fiable es la derivada del propio repositorio: tamaño del checkpoint, formato de pesos y compatibilidad con el pipeline de `transformers` para clasificación de texto.

## Capacidades

- Clasificación de texto: salida de etiquetas de sentimiento (presumiblemente positivo/negativo/neutro) sobre entradas textuales.
- Análisis de sentimiento en darija: el nombre y el dominio declarado apuntan a comentarios de YouTube en árabe marroquí.
- Inferencia vía pipeline de `transformers` (`text-classification`).
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking (no aplicable a un encoder de clasificación).
- Capacidades multilingües: no confirmadas; el modelo está orientado a un único dominio lingüístico.

## Casos de uso

- Moderación de comentarios en YouTube: clasificar automáticamente el tono de los comentarios en darija para priorizar revisiones humanas o filtrar toxicidad, aprovechando que el modelo está entrenado sobre ese dominio.
- Monitorización de reputación de marca: procesar en lote comentarios y reseñas en darija procedentes de redes sociales para agregar la polaridad por campaña o producto.
- Análisis de opinión de audiencia: extraer la distribución de sentimiento de los comentarios de un canal para orientar decisiones editoriales.
- Investigación en NLP de bajo recurso: servir como baseline o punto de comparación en estudios sobre darija, dado el escaso número de modelos publicados para esta variedad.
- Enriquecimiento de datasets: etiquetar automáticamente grandes volúmenes de texto en darija para construir corpus anotados de sentimiento.
- Prototipado rápido de APIs de clasificación: desplegar el modelo con `text-embeddings-inference` o endpoints de Hugging Face para validar un producto de análisis de sentimiento antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (accuracy, F1, precisión/recall por clase) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (tamaño del checkpoint); en FP16 alrededor de 0,3 GB; en INT8 alrededor de 0,15 GB, más el overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, L4 o RTX 3060 cubre holgadamente el despliegue.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline), `text-embeddings-inference`, endpoints de Hugging Face; también es convertible a ONNX o a GGUF para llama.cpp/Ollama, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles. Por el tamaño, se espera un throughput alto en GPU (miles de secuencias cortas por segundo en lotes), pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darijabert-youtube-sentiment | 147,5 M | no disponible | Clasificación de sentimiento (darija) | no disponible | Hugging Face |
| darijabert-sentiment (mismo autor) | ~0,1 B | no disponible | Clasificación de sentimiento (darija) | no disponible | Hugging Face |
| DarijaBERT (base) | ~0,1 B | no disponible | Modelo de lenguaje enmascarado (darija) | no disponible en la información | Hugging Face / paper |
| BERT-base multilingüe | 177 M | 512 | MLM y fine-tuning | Apache 2.0 (habitual) | Hugging Face |

La comparación cuantitativa de rendimiento no es posible: no hay métricas publicadas para ninguno de los modelos de darija citados en la información disponible. La referencia académica de Springer sobre clasificación de sentimiento con DarijaBERT sugiere que existen trabajos previos en esta línea, pero no se dispone de sus resultados numéricos.

## Limitaciones y advertencias

- Model card autogenerada: no documenta datos de entrenamiento, hiperparámetros, evaluación ni modelo base, lo que impide auditar el modelo.
- Licencia no declarada: no se puede asumir uso comercial sin contactar con el autor; riesgo legal en producción.
- Riesgo de alucinación bajo en clasificación, pero riesgo de etiquetas erróneas por sesgo del dataset de entrenamiento (no documentado).
- Sesgos desconocidos: al no describirse la procedencia de los datos, no se puede evaluar el sesgo por género, dialecto regional, edad o temática.
- Cobertura lingüística limitada: orientado a darija; su comportamiento en árabe estándar, francés o amazigh (presentes en comentarios marroquíes) es incierto.
- Longitud de contexto no confirmada; textos largos pueden truncarse.
- Sin métricas de validación: no hay garantía de calidad fuera del dominio de YouTube.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saloua-sarbout/darijabert-youtube-sentiment
- Modelo relacionado del mismo autor: https://huggingface.co/saloua-sarbout/darijabert-sentiment
- Artículo de Springer sobre clasificación de sentimiento con DarijaBERT: https://link.springer.com/chapter/10.1007/978-3-031-46849-0_24
- Referencia del cálculo de impacto ambiental citada en la model card: https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
