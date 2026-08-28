# ldov/bertweet-pt-sentiment

## Resumen

El modelo `ldov/bertweet-pt-sentiment` es un clasificador de polaridad (positivo, negativo, neutral) para textos en portugués, especializado en contenido de Twitter. Fue desarrollado por el usuario `ldov` y se basa en `BERTabaporu`, una variante de RoBERTa entrenada específicamente con tweets en portugués. El modelo está diseñado para integrarse con la librería `pysentimiento`, que facilita su uso en tareas de análisis de sentimiento y procesamiento de lenguaje social.

Con aproximadamente 135 millones de parámetros, este modelo ofrece un equilibrio entre capacidad y eficiencia, siendo adecuado para aplicaciones de análisis de sentimiento a gran escala en portugués. Su relevancia radica en la creciente necesidad de herramientas de PLN para idiomas distintos del inglés, especialmente en el ámbito de las redes sociales, donde el lenguaje informal y las variaciones dialectales requieren modelos adaptados. Aunque el autor del repositorio es `ldov`, el modelo es funcionalmente equivalente al publicado por la organización `pysentimiento`, y su uso se documenta a través de esa misma librería.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (Transformer encoder) |
| Parametros totales | 134.905.477 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (típico de RoBERTa: 512 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente FP32/FP16) |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `BERTabaporu`, un modelo de tipo RoBERTa entrenado con tweets en portugués. Sobre esta base, se realiza un ajuste fino (fine-tuning) para la tarea específica de clasificación de sentimiento, utilizando las etiquetas `POS`, `NEG` y `NEU`. El proceso de entrenamiento se apoya en la librería `pysentimiento`, que proporciona utilidades para cargar datos y evaluar el modelo. No se dispone de información detallada sobre el corpus de entrenamiento, el número de épocas ni si se aplicaron técnicas como RLHF o DPO. La arquitectura subyacente es un transformer encoder estándar, sin innovaciones particulares más allá de la adaptación al dominio de Twitter.

## Capacidades

- Clasificación de sentimiento en portugués: asigna una etiqueta de polaridad (`POS`, `NEG`, `NEU`) a un texto dado.
- Especializado en lenguaje de Twitter: maneja abreviaturas, emoticonos y jerga propia de la plataforma.
- Integración con `pysentimiento`: permite usar el modelo mediante una API sencilla (`create_analyzer`).
- Soporte para inferencia por lotes: al ser un modelo de tamaño medio, puede procesar múltiples textos de forma eficiente.
- No incluye capacidades de generación de texto, tool calling, agentes ni multimodalidad.

## Casos de uso

- Monitoreo de marca en redes sociales: analizar la opinión de los usuarios sobre una marca o producto en Twitter en portugués, permitiendo detectar tendencias positivas o negativas en tiempo real.
- Análisis de comentarios en portales de noticias: clasificar la reacción del público ante artículos periodísticos en portugués, útil para medios de comunicación y estudios de opinión.
- Investigación académica en PLN: servir como modelo de referencia para experimentos de análisis de sentimiento en portugués, comparando resultados con otros enfoques.
- Atención al cliente automatizada: preclasificar mensajes entrantes en portugués según su tono (queja, elogio, neutral) para priorizar respuestas en sistemas de ticketing.
- Análisis de campañas políticas: medir la recepción de mensajes políticos en Twitter durante periodos electorales en países lusófonos.
- Detección de crisis de reputación: identificar picos de sentimiento negativo en menciones a una entidad, activando alertas tempranas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, recall o F1 sobre conjuntos de datos estándar (p. ej., GoEmotions, SemEval). Se recomienda consultar el repositorio de `pysentimiento` para posibles evaluaciones adicionales.

## Requisitos de hardware

- VRAM estimada: al tener ~135M de parámetros, el modelo ocupa aproximadamente 540 MB en FP32, 270 MB en FP16 y 135 MB en int8. Esto permite su ejecución en GPUs con 2 GB de VRAM o incluso en CPU con memoria suficiente.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja, así como en entornos sin GPU mediante CPU.
- Opciones de despliegue: se puede servir mediante `pysentimiento` directamente, o exportar a formato ONNX para usar con `ONNX Runtime`. También es posible cargarlo con `transformers` y servirlo con `FastAPI` o `Triton`.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna, la inferencia por lote de 32 textos debería completarse en menos de 100 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ldov/bertweet-pt-sentiment (este) | 135M | No disponible | pt | No disponible | HuggingFace |
| pysentimiento/bertweet-pt-sentiment | 135M | No disponible | pt | No disponible | HuggingFace |
| finiteautomata/bertweet-base-sentiment-analysis | 135M | 512 | en | No disponible | HuggingFace |

Los tres modelos comparten la misma arquitectura base (BERTweet/RoBERTa) y tamaño. El modelo de `finiteautomata` está entrenado para inglés, mientras que los otros dos para portugués. No hay diferencias sustanciales entre `ldov` y `pysentimiento`; de hecho, es probable que sean el mismo modelo con distinto propietario del repositorio.

## Limitaciones y advertencias

- Sesgos: al estar entrenado con tweets, puede reflejar sesgos presentes en ese tipo de contenido, como lenguaje ofensivo, ironía o sarcasmo difícil de detectar.
- Riesgo de alucinación: no aplica, ya que es un modelo de clasificación y no genera texto libre.
- Limitaciones de contexto: la longitud máxima de entrada no está documentada, pero al ser RoBERTa, se espera un límite de 512 tokens. Textos más largos deben truncarse o dividirse.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor o utilizar el modelo de `pysentimiento` si se requiere una licencia clara.
- Cobertura idiomática: solo portugués; no funciona con otros idiomas.
- Dependencia de `pysentimiento`: para un uso sencillo, se requiere instalar esa librería, aunque el modelo puede cargarse directamente con `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ldov/bertweet-pt-sentiment
- Repositorio de pysentimiento: https://github.com/pysentimiento/pysentimiento/
- Paper de pysentimiento (arXiv): https://arxiv.org/abs/2106.09462
- Modelo base BERTabaporu: https://huggingface.co/pablocosta/bertabaporu-base-uncased
- Modelo original de pysentimiento: https://huggingface.co/pysentimiento/bertweet-pt-sentiment
- Artículo sobre pruning de BERTweet (referencia): https://www.sciencedirect.com/science/article/pii/S0306457324000487
