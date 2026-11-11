# nopp23/codedlang-coded-language-detector

## Resumen

CodedLang coded-language detector es un clasificador binario de texto especializado en detectar lenguaje codificado o evasivo en reseñas chinas al estilo Google Maps. El modelo identifica fenómenos como sustitución por homófonos, trucos ortográficos, transcripción fonética interlingüe y cifrados, tácticas que los usuarios emplean para eludir la moderación automática o comunicar contenido sensible de forma encubierta. Lo desarrolla el usuario de Hugging Face nopp23 y se publica bajo licencia CC BY 4.0.

Técnicamente es un fine-tune del modelo `hfl/chinese-roberta-wwm-ext`, un transformer BERT en variante china con 102.269.186 parámetros totales. Se ha entrenado sobre 6.208 reseñas del dataset CodedLang (Wan, Li y Huang, ACL 2026), con una ventana de secuencia máxima de 256 tokens. El checkpoint se distribuye en formato safetensors con un tamaño de repositorio de 0,4 GB.

Su relevancia radica en que aborda un problema de moderación de contenido poco cubierto: la detección de evasión lingüística en chino. El autor reporta métricas de retención en un conjunto de test de 763 reseñas no vistas durante el entrenamiento (precisión 0,92, recall 0,853, F1 0,885 con umbral 0,05), aunque advierte explícitamente que este checkpoint es una única partición train/dev/test y no el resultado principal del estudio de validación cruzada de cinco folds.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT (chinese-roberta-wwm-ext) para clasificación de secuencias |
| Parámetros totales | 102.269.186 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens en entrenamiento (el tokenizador admite hasta 512 en el ejemplo de uso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `hfl/chinese-roberta-wwm-ext`, un BERT base adaptado al chino con enmascaramiento de palabras completas (whole word masking), y se fine-tunea como clasificador binario de secuencias mediante `AutoModelForSequenceClassification`. La cabeza de clasificación produce dos logits; la probabilidad de lenguaje codificado se obtiene aplicando softmax y tomando la clase 1.

El entrenamiento utiliza 6.208 reseñas del dataset CodedLang (Wan, Li y Huang, ACL 2026, CC BY 4.0), con una división train/dev/test y un conjunto de test retenido de 763 reseñas. Los hiperparámetros se copiaron en su mayoría del estudio de validación cruzada de cinco folds del autor, con dos excepciones por limitaciones de memoria GPU: batch size de 4 (en lugar de 16) y longitud máxima de secuencia de 256 (en lugar de 512). El autor señala que el 92 % de las reseñas tienen menos de 256 caracteres, por lo que la pérdida por truncamiento debería ser pequeña, pero no se reajustó de forma independiente para esta partición. Se empleó una única semilla y no se midió la varianza entre semillas.

## Capacidades

- Clasificación binaria de texto: determina si una reseña contiene lenguaje codificado o evasivo.
- Detección de sustitución por homófonos en chino.
- Detección de trucos ortográficos y variaciones gráficas.
- Detección de transcripción fonética interlingüe.
- Detección de cifrados y otras formas de ofuscación textual.
- Salida de probabilidad calibrada mediante softmax (umbral de decisión recomendado: 0,05).
- Procesamiento de textos en chino de hasta 256 tokens de forma efectiva en entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Moderación de reseñas en plataformas de mapas y comercio: el modelo puntúa cada reseña con una probabilidad de lenguaje codificado para priorizar la revisión humana o el filtrado automático, aprovechando su entrenamiento específico sobre reseñas al estilo Google Maps.
- Detección de evasión de filtros en foros y marketplaces chinos: permite identificar intentos de eludir listas de palabras prohibidas mediante homófonos u ofuscaciones ortográficas antes de que el contenido se publique.
- Enrutamiento a revisión humana: con un umbral bajo (0,05) y un recall de 0,853, el modelo actúa como primera etapa de triaje que deriva casos sospechosos a moderadores, reduciendo el volumen de revisión manual.
- Investigación en lingüística computacional: sirve como línea base reproducible para estudiar fenómenos de codificación lingüística en chino, dado que el checkpoint se publica para reproducibilidad y demostración.
- Análisis de reputación y fraude: detección de reseñas potencialmente fraudulentas o coordinadas que emplean lenguaje encubierto para evitar detección automática.
- Filtrado previo en pipelines de datos: descarte o marcado de reseñas codificadas antes de alimentar sistemas de análisis de sentimiento o extracción de información, evitando contaminar las métricas.
- Prototipado rápido de clasificadores de contenido sensible: al ser un modelo de 102 M de parámetros y 0,4 GB, se puede desplegar en entornos con recursos limitados para validar flujos de moderación.

## Benchmarks y rendimiento

Métricas reportadas por el autor en el conjunto de test retenido (763 reseñas no vistas durante el entrenamiento, umbral de decisión 0,05):

| Métrica | Valor |
|---|---|
| Precisión | 0,92 |
| Recall | 0,853 |
| F1 | 0,885 |

El autor indica que el resultado principal del estudio (F1 out-of-fold agrupado de 0,894 en validación cruzada de cinco folds, superior a la mejor línea base few-shot de LLM de 0,78 reportada en el paper) proviene de un estudio distinto con cinco modelos entrenados por separado, documentado en el repositorio del autor. Este checkpoint no debe citarse como el resultado de investigación. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en FP32 (102 M de parámetros), y del orden de 0,2-0,3 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y también en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers (PyTorch), Hugging Face Inference Endpoints, ONNX Runtime, TGI (con soporte de clasificación), y exportación a otros runtimes. No se documenta soporte específico de vLLM o llama.cpp para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nopp23/codedlang-coded-language-detector | 102,3 M | 256 tokens (entrenamiento) | Clasificación binaria de lenguaje codificado en chino | CC BY 4.0 | Hugging Face |
| hfl/chinese-roberta-wwm-ext | ~102 M | 512 tokens | Modelo base de representaciones en chino | no disponible en la información | Hugging Face |
| Línea base few-shot LLM del paper CodedLang | no disponible | no disponible | Clasificación de lenguaje codificado | no disponible | no disponible |

El modelo base `hfl/chinese-roberta-wwm-ext` sirve como referencia de arquitectura y tamaño, aunque no está especializado en esta tarea. La línea base few-shot de LLM del paper alcanzó un F1 de 0,78, inferior al 0,894 del estudio de validación cruzada del autor, según los datos de la model card.

## Limitaciones y advertencias

- El dataset está etiquetado por la comunidad, no por expertos; el modelo captura conocimiento a nivel comunitario, no códigos específicos de una conversación concreta.
- Entrenado exclusivamente con reseñas de Google Maps en inglés y chino; no está diseñado para diálogo hablado ni para texto en tailandés.
- Ventana de entrenamiento reducida a 256 tokens (frente a 512); aunque el 92 % de las reseñas son más cortas, no se reajustó para esta partición y puede haber pérdida por truncamiento en textos largos.
- Batch size reducido a 4 por limitaciones de memoria GPU, lo que puede afectar la calidad del ajuste frente al estudio original.
- Entrenado con una única semilla; no se midió la varianza entre semillas, por lo que la robustez del checkpoint es incierta.
- Riesgo de alucinación y falsos positivos/negativos inherente a un clasificador binario; el umbral bajo (0,05) prioriza recall sobre precisión.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar los términos de la licencia del dataset subyacente y del modelo base.
- El autor advierte explícitamente que este checkpoint no debe citarse como el resultado de investigación del estudio de cinco folds.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nopp23/codedlang-coded-language-detector
- Modelo base: https://huggingface.co/hfl/chinese-roberta-wwm-ext
- Dataset CodedLang: https://huggingface.co/datasets/RuyuanWan/CodedLang
- Paper (Wan, Li y Huang, ACL 2026): https://doi.org/10.18653/v1/2026.acl-long.426
- Documentación del estudio de cinco folds: https://github.com/nopparatbudd-commits/Research/blob/main/07-Tools/poc/thai-concealed-topic/replication/codedlang2026-finetune.md
