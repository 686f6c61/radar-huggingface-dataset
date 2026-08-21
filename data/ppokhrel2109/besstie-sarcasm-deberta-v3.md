# ppokhrel2109/besstie-sarcasm-deberta-v3

## Resumen

El modelo `ppokhrel2109/besstie-sarcasm-deberta-v3` es un clasificador de sarcasmo entrenado específicamente para tres variedades de inglés: australiano (en-AU), británico (en-UK) e indio (en-IN). Fue desarrollado por Pranav Pokhrel sobre la base de `microsoft/deberta-v3-base`, un encoder transformer de 184 millones de parámetros, y ajustado con el benchmark BESSTIE, presentado en el artículo "BESSTIE: A Benchmark for Sentiment and Sarcasm Classification for Varieties of English" (arXiv:2412.04726). El modelo aborda un problema relevante: los sistemas de análisis de sentimiento y sarcasmo suelen estar sesgados hacia variedades dominantes del inglés, y este trabajo busca evaluar y mejorar el rendimiento en dialectos menos representados.

El modelo es un clasificador de secuencias (text-classification) con una ventana de contexto limitada (no especificada en la documentación, aunque hereda las características de DeBERTa-v3-base). Su principal particularidad es que requiere un umbral de decisión ajustado (0.360) y una temperatura de escalado (1.1819) para funcionar correctamente, ya que la clase positiva (sarcasmo) es minoritaria en el conjunto de datos. Está publicado con licencia MIT y pesos en formato safetensors, lo que facilita su integración en pipelines de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (encoder transformer con attention disentangled) |
| Parametros totales | 184.423.682 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de DeBERTa-v3-base, típicamente 512) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización documentada) |
| Idiomas soportados | en (inglés), con variedades en-AU, en-UK, en-IN |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DeBERTa-v3-base, un transformer encoder que utiliza atención disentangled (separación de la información de posición y contenido) y una técnica de preentrenamiento mejorada con máscara reemplazada (RTD). Para esta tarea, se añade una cabeza de clasificación de secuencias con dos salidas (sarcasmo / no sarcasmo). El entrenamiento se realizó sobre el benchmark BESSTIE, que incluye comentarios de Reddit y reseñas de Google para las tres variedades de inglés. Se empleó una función de pérdida de entropía cruzada ponderada por clase para compensar el desequilibrio entre clases, y se ajustó un umbral de decisión sobre una partición de validación retenida del conjunto de entrenamiento. Se utilizaron cinco semillas diferentes para evaluar la estabilidad de los resultados. No se aplicaron técnicas de RLHF ni DPO; el ajuste es puramente supervisado.

## Capacidades

- Clasificación de sarcasmo en texto corto (comentarios, reseñas) para inglés australiano, británico e indio.
- Detección de sarcasmo con umbral ajustable para optimizar la macro-F1 en clases desequilibradas.
- Inferencia rápida: aproximadamente 25 ms por predicción en CPU.
- Compatible con el ecosistema Transformers (AutoModelForSequenceClassification) y con Text Embeddings Inference (TEI) para despliegue en endpoints.
- No es un modelo generativo: no produce texto, solo etiquetas binarias.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede identificar comentarios sarcásticos en publicaciones de habla inglesa de Australia, Reino Unido e India, ayudando a priorizar revisiones humanas o filtrar contenido potencialmente ofensivo.
- Análisis de opinión en reseñas de productos: integrado en un pipeline de análisis de sentimiento, permite separar reseñas sarcásticas (que suelen tener polaridad positiva superficial pero intención negativa) de las genuinamente positivas, mejorando la precisión de métricas de satisfacción.
- Monitorización de marca en soporte al cliente: al detectar sarcasmo en interacciones de usuarios, el sistema puede escalar automáticamente quejas veladas a agentes humanos, reduciendo la fricción en la atención al cliente.
- Investigación sociolingüística: el modelo sirve como herramienta para estudiar diferencias dialectales en el uso del sarcasmo, permitiendo a investigadores cuantificar la frecuencia y forma del sarcasmo en distintas variedades del inglés.
- Evaluación de sesgos en modelos de lenguaje: dado que el modelo se entrena específicamente en variedades no dominantes, puede usarse como referencia para medir el sesgo dialectal de otros clasificadores o LLMs.
- Clasificación de comentarios en foros y comunidades online: para plataformas que operan en mercados de habla inglesa diversa, el modelo puede etiquetar automáticamente comentarios sarcásticos y mejorar la experiencia de moderación.

## Benchmarks y rendimiento

El autor reporta resultados en la partición de validación oficial del benchmark BESSTIE, con macro-F1 media sobre 5 semillas. No se proporcionan comparaciones con otros modelos en la documentación disponible.

| Variedad | Macro-F1 | F1 clase sarcasmo | Baseline mayoría |
|---|---|---|---|
| en-AU | 0.751 | 0.728 | 0.366 |
| en-UK | 0.687 | 0.515 | 0.439 |
| en-IN | 0.629 | 0.396 | 0.460 |

El baseline de mayoría se incluye para contextualizar: un modelo que nunca predice la clase minoritaria obtiene alrededor de 0.46, por lo que valores cercanos a 0.50 indican ausencia de aprendizaje. El rendimiento en en-IN es el más débil, consistente con la menor cantidad de ejemplos sarcásticos en esa variedad.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 184M parámetros, en FP32 ocupa aproximadamente 740 MB; en FP16 o int8 cabría en menos de 400 MB. Cualquier GPU con más de 1 GB de VRAM puede ejecutarlo sin problemas.
- GPU recomendadas: no se requiere GPU de alta gama; una NVIDIA T4, GTX 1660 o incluso una RTX 2060 son suficientes. También funciona en CPU con latencia de ~25 ms por predicción.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (serie RTX 30/40, etc.).
- Opciones de despliegue: Transformers (PyTorch), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, o exportación a ONNX para servidores ligeros.
- Latencia y throughput: ~25 ms por predicción en CPU (según el autor); en GPU la latencia sería significativamente menor, del orden de 1-5 ms.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros clasificadores de sarcasmo en la información proporcionada. El modelo se posiciona como un ajuste específico de DeBERTa-v3-base para el benchmark BESSTIE, por lo que su comparativa natural sería contra otros modelos fine-tuned en el mismo benchmark, pero esos resultados no están publicados en la documentación accesible. Se puede mencionar que DeBERTa-v3-base es un modelo generalista de clasificación de texto, y este ajuste mejora su rendimiento en sarcasmo dialectal, pero no hay datos numéricos para una tabla comparativa.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado en la partición de validación oficial; la partición de test del benchmark BESSTIE está retenida, por lo que el rendimiento real en datos no vistos podría diferir.
- La variedad en-IN es la más débil, con una F1 de sarcasmo de solo 0.396, lo que indica dificultades para detectar sarcasmo en inglés indio.
- El dominio de entrenamiento se limita a comentarios de Reddit y reseñas de Google; otros dominios (por ejemplo, conversaciones formales, textos literarios) están fuera de distribución y el rendimiento puede degradarse.
- Es imprescindible aplicar la temperatura (1.1819) y el umbral (0.360) en el orden indicado; usar `argmax` o un umbral incorrecto produce resultados inutilizables (por ejemplo, etiquetar todo como sarcástico).
- El modelo no es multilingüe: solo soporta inglés, y específicamente las tres variedades mencionadas.
- No se han documentado sesgos específicos, pero al entrenarse en datos de Reddit y Google, puede reflejar sesgos presentes en esas plataformas (por ejemplo, jerga, tono, demografía de usuarios).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ppokhrel2109/besstie-sarcasm-deberta-v3
- Repositorio del benchmark BESSTIE: https://github.com/unswnlp/BESSTIE
- Artículo arXiv (PDF): https://arxiv.org/pdf/2412.04726v2
- Artículo arXiv (HTML): https://arxiv.org/html/2412.04726v1
- Código de reproducción y resultados: https://github.com/Pranav210901/Besstie-improvement-attempt
