# monica-2/chinese-sentiment-bert

## Resumen

`monica-2/chinese-sentiment-bert` es un modelo de clasificación de sentimiento binario para chino, obtenido mediante fine-tuning de `google-bert/bert-base-chinese` sobre el corpus `seamew/ChnSentiCorp`, compuesto por reseñas de hoteles en chino. Lo publica el usuario `monica-2` como resultado de un trabajo de curso de NLP, con licencia Apache 2.0 y un tamaño de repositorio de 0,5 GB. El modelo resuelve una tarea acotada —clasificar texto como positivo o negativo— y lo hace con una accuracy de 0,9475 y un F1 de 0,9485 sobre el split de test (1200 muestras).

Arquitectónicamente es un transformer encoder BERT base con 102.269.186 parámetros totales y una cabeza de clasificación de dos etiquetas. La longitud de contexto operativa no se especifica en la model card; los ejemplos de uso truncan a 256 tokens, coherente con el límite nativo de BERT base (512 posiciones). El repositorio incluye pesos en safetensors y una versión ONNX con cuantización dinámica int8 (`onnx/model_quantized.onnx`, 103 MB), lo que permite inferencia en navegador con transformers.js sin servidor.

Su relevancia es práctica más que innovadora: ofrece un clasificador de sentimiento chino ligero, con métricas verificables y un artefacto ONNX listo para despliegue en cliente. Compite en la misma franja que otros fine-tunes de BERT chino, y el propio autor reporta una comparación directa con `hfl/chinese-roberta-wwm-ext` entrenado con la misma configuración, que obtiene resultados ligeramente superiores (acc 0,9492, F1 0,9502 en test).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base con cabeza de clasificación de secuencias (2 etiquetas) |
| Parametros totales | 102.269.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos truncan a 256 tokens y el límite nativo de BERT base es 512 |
| Tipos de cuantizacion | ONNX int8 de cuantización dinámica (`onnx/model_quantized.onnx`, 103 MB); pesos completos en safetensors |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-chinese`, un transformer encoder de tipo BERT base, y se afina para clasificación de sentimiento binario con una cabeza `AutoModelForSequenceClassification`. No se documenta ninguna modificación arquitectónica respecto al modelo base; la innovación es nula en ese aspecto y el valor está en el ajuste de dominio y en el artefacto ONNX empaquetado.

El entrenamiento se realiza sobre `seamew/ChnSentiCorp`, un corpus de reseñas de hoteles en chino con etiquetas positivas y negativas balanceadas. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros, ni si hubo técnicas de alineación como RLHF o DPO (no aplicables en un clasificador de este tipo). El autor sí reporta la evaluación sobre 1200 muestras de validación y 1200 de test, y confirma que la versión ONNX int8 mantiene la accuracy en 0,9467 frente a 0,9450 del modelo PyTorch sobre 600 muestras de validación, es decir, una pérdida prácticamente nula por cuantización.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) de texto en chino.
- Inferencia en PyTorch vía `transformers` (`AutoTokenizer` + `AutoModelForSequenceClassification`).
- Inferencia en navegador o Node.js vía `@huggingface/transformers` con `dtype: 'q8'` sobre el ONNX cuantizado.
- Salida de logits y probabilidades por clase mediante softmax.
- Procesamiento de textos hasta 256 tokens en los ejemplos documentados (truncado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al chino; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Moderación y filtrado de reseñas de hoteles: clasificar automáticamente reseñas de plataformas de reservas como positivas o negativas para priorizar respuestas del servicio de atención al cliente, aprovechando que el modelo está afinado exactamente en ese dominio.
- Análisis de satisfacción en paneles de control: agregar el sentimiento de miles de reseñas por establecimiento o ciudad para construir métricas de NPS aproximado y detectar caídas de satisfacción.
- Inferencia en el cliente sin servidor: desplegar el ONNX int8 (103 MB) en una aplicación web o extensión mediante transformers.js para clasificar reseñas mientras el usuario escribe, sin enviar datos a un backend.
- Enrutado de tickets de soporte: usar la probabilidad de sentimiento negativo como señal para escalar quejas a agentes humanos o a un flujo prioritario.
- Etiquetado asistido de corpus: preanotar grandes volúmenes de reseñas chinas para revisión humana posterior, reduciendo el coste de anotación manual en proyectos de NLP.
- Prototipado docente y plantilla de pipeline: servir como ejemplo completo de fine-tuning, evaluación y exportación a ONNX en cursos de NLP, dado que el autor lo publica como trabajo de curso con métricas reproducibles.
- Filtro previo en sistemas RAG o de extracción de opiniones: descartar o priorizar fragmentos de texto según polaridad antes de pasarlos a un modelo mayor, reduciendo coste computacional.

## Benchmarks y rendimiento

| Split | n | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|
| Validación | 1200 | 0,9450 | 0,9414 | 0,9477 | 0,9445 |
| Test | 1200 | 0,9475 | 0,9431 | 0,9539 | 0,9485 |
| Validación (ONNX int8, 600 muestras) | 600 | 0,9467 | no disponible | no disponible | no disponible |

Comparación reportada por el autor con `hfl/chinese-roberta-wwm-ext` entrenado con la misma configuración: test accuracy 0,9492 y F1 0,9502.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable al tratarse de un clasificador de sentimiento y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB para los pesos (102 M de parámetros) más activaciones; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en ONNX int8: alrededor de 103 MB para los pesos, ejecutable en CPU y en navegador.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente y aporta aceleración marginal.
- Cabe en GPU consumer: sí, en todas las del mercado actual, e incluso en dispositivos de borde.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime, `@huggingface/transformers` (transformers.js) en navegador, y servidores de inferencia compatibles con modelos de clasificación de Hugging Face (TGI, vLLM) aunque no se documenta configuración específica para ellos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la cuantización int8, se espera latencia de milisegundos por muestra en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test acc / F1 (ChnSentiCorp) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| monica-2/chinese-sentiment-bert | 102,3 M | no disponible (truncado a 256 en ejemplos) | 0,9475 / 0,9485 | Apache 2.0 | Hugging Face, ONNX incluido |
| hfl/chinese-roberta-wwm-ext (fine-tune mismo autor) | no disponible en la información | no disponible | 0,9492 / 0,9502 | no disponible en la información | Hugging Face |
| jackietung/bert-base-chinese-finetuned-sentiment | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |

La comparación directa disponible solo cubre el fine-tune de `hfl/chinese-roberta-wwm-ext` con la misma configuración, que supera ligeramente al modelo en accuracy y F1. No se dispone de datos comparativos con otros clasificadores chinos de sentimiento en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido a reseñas de hoteles: la model card advierte de caídas claras de rendimiento al migrar a otros dominios como productos o redes sociales.
- Dificultad con textos largos que contienen giros o contrastes, y con ironía o sarcasmo implícito.
- El entrenamiento usa datos públicos sin tratamiento de sesgos; pueden aparecer sesgos presentes en el corpus original.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en textos fuera de distribución.
- Contexto limitado: los ejemplos truncan a 256 tokens; textos más largos pierden información.
- Solo chino: no se garantiza ningún rendimiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; es un trabajo de curso sin mantenimiento declarado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente de las métricas reportadas.
- La fecha de creación del repositorio (2026-11-08) es posterior a la fecha habitual de publicación; conviene verificar la vigencia del artefacto antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/monica-2/chinese-sentiment-bert
- Demo online: https://monica-2-chinese-sentiment-demo.static.hf.space
- Modelo base: https://huggingface.co/google-bert/bert-base-chinese
- Dataset: https://huggingface.co/datasets/seamew/ChnSentiCorp
- Repositorio de referencia con pipeline completo de análisis de sentimiento chino: https://github.com/octavia111/bert-sentiment-demo
- Fine-tune alternativo de BERT chino para sentimiento: https://huggingface.co/jackietung/bert-base-chinese-finetuned-sentiment
