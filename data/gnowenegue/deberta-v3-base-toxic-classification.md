# gnowenegue/deberta-v3-base-toxic-classification

## Resumen

El modelo `gnowenegue/deberta-v3-base-toxic-classification` es un ajuste fino de DeBERTa-v3-base, el encoder de Microsoft presentado en el paper *DeBERTaV3: Improving DeBERTa using ELECTRA-Style Pre-Training with Gradient-Disentangled Embedding Sharing*. Su propósito es la clasificación de toxicidad en comentarios en inglés, un problema clásico de moderación de contenido que sigue siendo crítico para plataformas sociales, foros y sistemas de comentarios. El modelo se ha entrenado sobre el dataset Jigsaw Toxic Comment Classification Challenge, una referencia estándar en la literatura de detección de toxicidad.

Con 184.423.682 parámetros y un tamaño de repositorio de 0,7 GB, se trata de un modelo encoder de tamaño medio (base), adecuado para despliegue en CPU o GPU de gama media con baja latencia. La licencia MIT facilita su integración en productos comerciales sin restricciones de atribución complejas. Es relevante ahora porque la moderación automática de contenido es un componente obligatorio en muchas plataformas reguladas (DSA en la UE, por ejemplo), y los clasificadores ligeros basados en encoders siguen siendo la opción más eficiente en coste frente a LLMs generativos para esta tarea.

La información pública disponible es muy limitada: la model card solo contiene metadatos YAML (licencia, dataset, idioma y modelo base), sin detalles sobre hiperparámetros, métricas de evaluación ni procedimiento de entrenamiento. Esto condiciona la profundidad de la ficha, pero no impide describir su arquitectura subyacente ni sus casos de uso realistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, atención desenredada y embedding sharing estilo ELECTRA) |
| Parámetros totales | 184.423.682 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (DeBERTa-v3-base soporta hasta 512 tokens en su configuración estándar) |
| Tipos de cuantización | no disponible (pesos en safetensors; se puede cuantizar a INT8/FP16 con herramientas estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | microsoft/deberta-v3-base |
| Dataset de entrenamiento | thesofakillers/jigsaw-toxic-comment-classification-challenge |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es DeBERTa-v3-base, un transformer encoder que introduce dos innovaciones respecto a BERT: atención desenredada (disentangled attention), donde el contenido y la posición de cada token se codifican en vectores separados, y un mecanismo de preentrenamiento estilo ELECTRA con *gradient-disentangled embedding sharing* (GDES), que comparte las embeddings entre el generador y el discriminador evitando la fuga de gradientes. Esto permite un preentrenamiento más eficiente que el MLM clásico y mejora el rendimiento en tareas de comprensión.

El ajuste fino se ha realizado sobre el dataset Jigsaw Toxic Comment Classification Challenge, que contiene comentarios de Wikipedia etiquetados con múltiples categorías de toxicidad (toxic, severe_toxic, obscene, threat, insult, identity_hate). No se dispone de información sobre el número de épocas, la tasa de aprendizaje, el tamaño de batch, la composición exacta del split ni si se aplicaron técnicas de desbalanceo de clases (el dataset original está fuertemente desbalanceado). Tampoco se documenta si hubo calibración de umbrales, data augmentation o validación cruzada. La model card no incluye curvas de entrenamiento ni métricas de validación.

## Capacidades

- Clasificación de texto binaria o multietiqueta orientada a toxicidad en comentarios en inglés.
- Detección de categorías como toxicidad general, obscenidad, insultos, amenazas e identidad/odio (según las etiquetas del dataset Jigsaw).
- Procesamiento de entradas de hasta 512 tokens (límite estándar de DeBERTa-v3-base), suficiente para comentarios y publicaciones cortas.
- Inferencia rápida en CPU y GPU de gama media gracias a su tamaño base.
- No soporta tool calling ni function calling (es un encoder de clasificación, no un modelo generativo).
- No soporta razonamiento multi-paso ni agentes.
- Capacidades multilingües limitadas al inglés; no se ha entrenado para otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de comentarios en foros y plataformas: el modelo clasifica cada comentario entrante y permite aplicar políticas automáticas (ocultar, revisar o expulsar) antes de que llegue a moderación humana, reduciendo la carga del equipo.
- Filtrado previo en sistemas de comentarios de medios de comunicación: al ser un encoder ligero, puede procesar cientos de comentarios por segundo en una sola GPU o incluso en CPU, integrándose en el pipeline de publicación.
- Señalización para revisión humana: el modelo actúa como primera capa de triaje, marcando comentarios con alta probabilidad de toxicidad para que los moderadores revisen solo los casos dudosos.
- Investigación en detección de toxicidad: sirve como baseline reproducible sobre el dataset Jigsaw para comparar con otros clasificadores o con LLMs generativos.
- Protección de comunidades en Discord o Reddit: integración vía API para puntuar mensajes en tiempo real y aplicar *timeouts* automáticos según el umbral configurado.
- Análisis de corpus históricos: clasificación por lotes de grandes volúmenes de comentarios ya almacenados para estudios de incivilidad o auditorías de contenido.
- Pre-filtro en pipelines de LLMs: descartar entradas tóxicas antes de enviarlas a un modelo generativo, reduciendo costes y riesgos de jailbreak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de accuracy, F1, AUC ni comparaciones con otros modelos. No se deben asumir cifras de rendimiento sin validación propia sobre el dataset Jigsaw.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,74 GB (184 M parámetros × 4 bytes) más overhead de activaciones, alrededor de 1,5-2 GB en total.
- VRAM estimada en FP16: aproximadamente 0,37 GB de pesos, en torno a 1 GB con activaciones.
- VRAM estimada en INT8: aproximadamente 0,18 GB de pesos, en torno a 0,6-0,8 GB con activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo, pero funcionan sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más (GTX 1650, RTX 3050, etc.), e incluso en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), ONNX Runtime, TorchScript, y servidores de inferencia como vLLM (soporte limitado para encoders), TGI (soporte para clasificación) o FastAPI con Transformers.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa de la arquitectura base, un encoder de 184 M parámetros suele procesar decenas o cientos de secuencias por segundo en GPU moderna, pero no se confirma para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gnowenegue/deberta-v3-base-toxic-classification | 184 M | no disponible (estándar 512) | Clasificación de toxicidad | MIT | Hugging Face |
| NingBo_Ascend/deberta-v3-base-prompt-injection | no disponible | no disponible | Detección de prompt injection | Apache-2.0 | Hugging Face |
| microsoft/deberta-v3-base | 184 M | 512 | Modelo base (preentrenamiento) | MIT | Hugging Face |

La comparación con el modelo base es directa: comparten arquitectura y número de parámetros, pero el ajuste fino está especializado en toxicidad. El modelo de detección de prompt injection es una alternativa de la misma familia DeBERTa-v3-base orientada a seguridad de LLMs, no a moderación de contenido. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset Jigsaw contiene sesgos demográficos y de anotación documentados en la literatura; el modelo puede sobrerreaccionar ante menciones de identidades marginalizadas o infrarreaccionar ante toxicidad sutil.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, especialmente en sarcasmo, ironía y lenguaje coloquial.
- Limitaciones de contexto: entrenado para comentarios cortos; entradas largas pueden truncarse a 512 tokens y perder información relevante.
- Limitaciones de idioma: solo inglés; su uso en otros idiomas producirá resultados no fiables.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución, pero el dataset Jigsaw tiene sus propias condiciones de uso que deben respetarse.
- Caveat para producción: no se han publicado métricas de validación ni calibración; es imprescindible evaluar el modelo sobre un conjunto propio antes de desplegarlo, y ajustar el umbral de decisión según la política de moderación.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; trátese como un experimento sin garantías de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnowenegue/deberta-v3-base-toxic-classification
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Dataset: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Paper DeBERTaV3: https://arxiv.org/abs/2111.09543
- Modelo comparable de prompt injection: https://huggingface.co/NingBo_Ascend/deberta-v3-base-prompt-injection
