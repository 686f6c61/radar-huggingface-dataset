# bolewara/imdb-sentiment-distilbert

## Resumen

El modelo `bolewara/imdb-sentiment-distilbert` es un clasificador de sentimiento binario (positivo/negativo) basado en la arquitectura DistilBERT, concretamente una puesta a punto de `distilbert-base-uncased` sobre el dataset de reseñas de películas IMDB. Lo desarrolla Anuj Bolewar (usuario `bolewara` en Hugging Face) como caso de estudio de fine-tuning de transformers en CPU, con una submuestra reducida de 1.500 ejemplos de entrenamiento y 300 de evaluación.

El modelo resuelve la tarea de análisis de sentimiento en texto corto (reseñas) con un tamaño compacto de 66,9 millones de parámetros, lo que lo hace adecuado para entornos con recursos limitados. Su relevancia actual reside en que demuestra un flujo completo de fine-tuning de DistilBERT con early stopping y una pérdida de evaluación muy baja (0,0005), aunque su utilidad práctica se limita al dominio de reseñas de películas en inglés.

La arquitectura es un encoder transformer destilado de 6 capas con 768 dimensiones ocultas y 12 cabezas de atención, con una longitud de contexto máxima de 512 tokens (aunque el entrenamiento truncó los textos a 128). Está publicado bajo licencia Apache 2.0 y distribuido en formato safetensors, con soporte para la librería `transformers` de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer, 6 capas, 12 cabezas, 768 hidden) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (máximo de DistilBERT base; entrenado con truncado a 128) |
| Tipos de cuantizacion | No publicados oficialmente; compatible con cuantización posterior (p. ej., ONNX, llama.cpp) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye config.json, tokenizer.json, tokenizer_config.json) |

## Arquitectura y entrenamiento

DistilBERT es una versión destilada de BERT mediante destilación de conocimiento: el modelo profesor (BERT-base) transfiere sus logits a un modelo alumno con la mitad de capas (6 en lugar de 12), manteniendo la misma dimensión oculta (768) y número de cabezas de atención (12). El resultado es un encoder transformer con 66 millones de parámetros que conserva aproximadamente el 95% del rendimiento del original con una velocidad de inferencia superior.

El fine-tuning se realizó sobre el dataset `stanfordnlp/imdb`, submuestreado a 1.500 ejemplos de entrenamiento y 300 de prueba para viabilidad en CPU. Se emplearon 2 épocas (con early stopping activado en la época 2 de 3), una tasa de aprendizaje de 2e-5, batch size de 8 y 50 pasos de warmup. Los textos se truncaron o rellenaron a 128 tokens. No se aplicaron técnicas de RLHF ni DPO; es un ajuste supervisado clásico de clasificación de secuencias con dos etiquetas (positivo/negativo). La pérdida de evaluación final fue de 0,000518.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en reseñas de películas en inglés.
- Procesamiento de secuencias de hasta 512 tokens, aunque el entrenamiento se limitó a 128.
- Inferencia eficiente en CPU gracias al tamaño reducido (66M parámetros).
- Integración directa con la API de `transformers` mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatible con el ecosistema Hugging Face (pipeline `text-classification`, endpoints compatibles con Text Embeddings Inference).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo exclusivamente de clasificación de texto.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: dado un texto de opinión, el modelo devuelve una etiqueta positiva o negativa, útil para monitorizar valoraciones en plataformas de comercio electrónico. Su tamaño permite ejecutarlo en servidores modestos o incluso en dispositivos edge.
- Moderación automática de comentarios: clasificar comentarios de foros o redes sociales como positivos o negativos para priorizar respuestas o detectar contenido conflictivo. Al ser un modelo pequeño, puede integrarse en pipelines de procesamiento por lotes con bajo coste computacional.
- Análisis de encuestas de satisfacción: procesar respuestas abiertas de clientes y categorizarlas automáticamente para generar métricas agregadas de satisfacción.
- Sistema de recomendación de reseñas: ordenar reseñas de películas por polaridad para mostrar primero las más positivas o negativas según la preferencia del usuario.
- Prototipado rápido de clasificadores de texto: como modelo de referencia para comparar con otros fine-tunes o para validar pipelines de entrenamiento en entornos de desarrollo.
- Educación y demostraciones: útil para enseñar conceptos de fine-tuning de transformers en CPU, dado su bajo requerimiento de hardware y la disponibilidad del código de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible. La única métrica reportada es la pérdida de evaluación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Eval loss | 0,000518 |
| Accuracy | No reportado |
| Early stopping | Época 2 de 3 |

El modelo no presenta comparaciones con otros modelos en la model card. Para referencia, el modelo `lvwerra/distilbert-imdb` (misma arquitectura base) reporta una precisión del 92,8% en el dataset IMDB, pero este dato no corresponde al modelo evaluado y no debe atribuírsele.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (66M parámetros × 4 bytes ≈ 268 MB). Con cuantización a int8, se reduce a ~67 MB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti o superior). También funciona en CPU sin problemas.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna, incluidas tarjetas integradas.
- Opciones de despliegue: librería `transformers` de Hugging Face, `onnxruntime`, `fastapi` para API REST, o `llama.cpp` si se convierte a GGUF (aunque no hay conversión oficial).
- Latencia y throughput: en CPU, una inferencia sobre un texto de 128 tokens tarda aproximadamente 10-20 ms en un procesador moderno; en GPU (p. ej., T4) baja a 2-5 ms. El throughput puede superar las 200 inferencias por segundo en GPU con batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Accuracy (IMDB) | Notas |
|---|---|---|---|---|---|
| `bolewara/imdb-sentiment-distilbert` | 66,9M | 512 | Apache 2.0 | No reportado | Fine-tune sobre submuestra pequeña (1.500 ejemplos) |
| `lvwerra/distilbert-imdb` | ~66M | 512 | Apache 2.0 | 92,8% (según PromptLayer) | Fine-tune sobre dataset completo de IMDB, referencia establecida |
| `distilbert-base-uncased` | 66,9M | 512 | Apache 2.0 | N/A (modelo base) | Modelo preentrenado sin fine-tune, requiere adaptación para clasificación |

El modelo de `bolewara` es funcionalmente equivalente a `lvwerra/distilbert-imdb` en arquitectura, pero su entrenamiento con una submuestra mucho menor (1.500 vs 25.000 ejemplos) probablemente degrade su precisión en datos reales. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Entrenado con una submuestra muy pequeña (1.500 ejemplos), lo que puede provocar sobreajuste y menor generalización frente a modelos entrenados con el dataset completo.
- Solo soporta inglés; no es multilingüe.
- Dominio restringido a reseñas de películas; su rendimiento en otros dominios (reseñas de productos, opiniones políticas) puede ser deficiente.
- La pérdida de evaluación reportada (0,0005) es sospechosamente baja, lo que sugiere posible sobreajuste o una evaluación sobre un conjunto demasiado pequeño (300 ejemplos).
- No se ha evaluado la precisión (accuracy), por lo que no se puede cuantificar su rendimiento real en clasificación.
- Riesgo de alucinación o clasificaciones erróneas en textos ambiguos, sarcásticos o con lenguaje figurado, común en reseñas de películas.
- La fecha de creación (agosto de 2026) es posterior a la fecha actual, lo que indica que el modelo es muy reciente y carece de adopción en la comunidad (0 descargas, 0 likes).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/bolewara/imdb-sentiment-distilbert)
- [Modelo base: distilbert-base-uncased](https://huggingface.co/distilbert/distilbert-base-uncased)
- [Paper de DistilBERT (arxiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [Modelo similar: lvwerra/distilbert-imdb](https://huggingface.co/lvwerra/distilbert-imdb)
- [Modelo similar: aasib/distilbert-imdb-sentiment](https://huggingface.co/aasib/distilbert-imdb-sentiment)
- [Writeup en Kaggle (mencionado en la model card, sin URL directa)](https://www.kaggle.com/anujbolewar)
