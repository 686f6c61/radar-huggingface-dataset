# gangryunguh/distilbert-toxic-classifier

## Resumen

`gangryunguh/distilbert-toxic-classifier` es un modelo de clasificación de texto publicado en Hugging Face por el usuario gangryunguh. Por el nombre y la arquitectura declarada, se trata de un ajuste fino de DistilBERT orientado a la detección de toxicidad en texto, aunque la model card no confirma explícitamente ni el dataset de entrenamiento ni las etiquetas de salida. El repositorio tiene un tamaño de 0,3 GB y contiene pesos en formato safetensors compatibles con la librería `transformers`.

El modelo cuenta con 66.955.010 parámetros, cifra coherente con la arquitectura DistilBERT (aproximadamente 66 millones de parámetros, seis capas y 768 dimensiones ocultas). Es, por tanto, un modelo encoder-only de pequeño tamaño pensado para inferencia rápida y económica en tareas de clasificación, no para generación de texto.

Su relevancia práctica es limitada pero concreta: los clasificadores de toxicidad ligeros basados en DistilBERT son útiles como filtros de primera línea en pipelines de moderación de contenido, donde el coste por inferencia y la latencia importan más que la precisión absoluta de un modelo grande. Ahora bien, la ausencia total de documentación (model card autogenerada y sin completar, licencia no especificada, idiomas no declarados, cero descargas y cero likes) obliga a tratar el modelo como un artefacto no validado que requiere evaluación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder-only destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base soporta hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantizacion posterior a fp16/int8 mediante herramientas estándar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder-only obtenido mediante destilación de conocimiento a partir de BERT-base. DistilBERT reduce el número de capas de 12 a 6 y conserva las 768 dimensiones ocultas y 12 cabezas de atención, lo que da lugar a unos 66 millones de parámetros, aproximadamente el 40 % de BERT-base. El modelo original se entrena con una combinación de pérdida de destilación (soft targets del profesor), pérdida de modelado de lenguaje enmascarado y pérdida de coseno entre estados ocultos.

Sobre el entrenamiento específico de este ajuste fino no hay información: la model card es la plantilla autogenerada de Hugging Face y todos los campos relevantes (datos de entrenamiento, hiperparámetros, régimen de precisión, procedimiento de evaluación) aparecen como "[More Information Needed]". No consta si se aplicó algún tipo de balanceo de clases, si se usó un dataset público de toxicidad (por ejemplo Jigsaw) o si hubo validación humana. Tampoco se documenta ninguna innovación técnica adicional más allá de la propia destilación de DistilBERT.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que devuelve etiquetas y puntuaciones de probabilidad para un texto de entrada.
- Detección de toxicidad: por el nombre del modelo, la tarea prevista es identificar contenido tóxico, aunque las etiquetas exactas (binarias, multiclase, tipos de toxicidad) no están documentadas.
- Procesamiento de secuencias cortas y medias: al derivar de DistilBERT, el límite práctico habitual es de 512 tokens, suficiente para comentarios, tuits o mensajes de foro.
- Inferencia de bajo coste: 67 millones de parámetros permiten ejecución en CPU con latencias de milisegundos por muestra.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión, audio ni modo "thinking"; es un encoder de clasificación, no un modelo generativo.
- Capacidades multilingües: no declaradas; el vocabulario heredado de DistilBERT es mayoritariamente inglés, por lo que el rendimiento en castellano es incierto y debe medirse.

## Casos de uso

- Moderación de comentarios en foros y redes: el modelo puede puntuar cada comentario entrante y derivar a revisión humana los que superen un umbral de toxicidad, actuando como filtro de primera línea con coste mínimo por petición.
- Pre-filtrado en pipelines de moderación por etapas: dado su reducido tamaño, se puede colocar delante de un modelo mayor o de un clasificador humano, reduciendo el volumen que llega a las etapas caras.
- Anotación asistida de datasets: usar el clasificador para preetiquetar grandes corpus de comentarios y acelerar la construcción de datasets de toxicidad revisados manualmente.
- Monitorización de comunidades online: procesar en lote el histórico de un foro o canal de chat para detectar picos de toxicidad y generar informes agregados por período.
- Filtrado previo en sistemas de recogida de feedback: descartar o marcar automáticamente respuestas de encuestas y formularios que contengan insultos antes de que lleguen a los equipos de soporte.
- Experimentación académica y comparativas de baseline: al ser un DistilBERT pequeño, sirve como referencia rápida para comparar técnicas de ajuste fino o de aumento de datos en tareas de clasificación de toxicidad.
- Integración en APIs de bajo coste: desplegado con `transformers` o convertido a ONNX, puede servirse en CPU dentro de un microservicio sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (accuracy, F1, precision/recall por clase), ni conjuntos de test, ni comparaciones con otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 para los pesos (67 M de parámetros × 4 bytes), y en torno a 0,15 GB en fp16. Con el overhead de activaciones y del runtime de PyTorch, un presupuesto de 1-2 GB de VRAM es más que suficiente para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve; una RTX 3060, RTX 4090, T4, A10 o A100 funcionan sobradamente. El modelo está claramente sobredimensionado para estas GPU y no las aprovecha.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años, e incluso en iGPU.
- Ejecución en CPU: totalmente viable; es el escenario de despliegue natural para este tamaño de modelo.
- Opciones de despliegue: `transformers` (pipeline de `text-classification`), exportación a ONNX Runtime, TorchScript, o servidores de inferencia como TGI (Text Generation Inference no aplica a clasificación; sí `text-embeddings-inference` no es el caso), FastAPI con el pipeline directamente, o `optimum` para optimización. llama.cpp y Ollama no son adecuados porque el modelo no es generativo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera del orden de milisegundos por muestra en CPU moderna y decenas de miles de muestras por segundo en GPU con lotes grandes, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gangryunguh/distilbert-toxic-classifier | 66,9 M | no disponible (512 habitual en DistilBERT) | Clasificación de toxicidad | no disponible | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,9 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| unitary/toxic-bert | ~110 M (BERT-base) | 512 | Clasificación de toxicidad | no disponible (verificar en el repo) | Hugging Face, con uso extendido |

La comparación se limita a parámetros, contexto y licencia porque no hay métricas publicadas de este modelo. Frente a `distilbert-base-uncased` y `bert-base-uncased`, este modelo está especializado en una tarea concreta pero carece de la documentación y el respaldo de la comunidad de los modelos base. Frente a clasificadores de toxicidad consolidados como `unitary/toxic-bert`, ofrece un tamaño menor (aproximadamente un 40 % menos de parámetros) a costa de una precisión potencialmente inferior, que no se puede verificar sin evaluación propia.

## Limitaciones y advertencias

- Model card autogenerada y sin completar: no hay información sobre datos de entrenamiento, etiquetas, métricas ni procedencia, lo que impide auditar el modelo.
- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o tratar el modelo como no licenciado para producción.
- Idiomas no declarados: el vocabulario de DistilBERT es mayoritariamente inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de sesgos: los clasificadores de toxicidad entrenados sin documentación suelen sobrerreaccionar con determinados dialectos, jerga o referencias culturales, y pueden penalizar desproporcionadamente a grupos minoritarios.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de falsos positivos y falsos negativos sistemáticos sin calibrar.
- Sin métricas de evaluación: no se puede establecer un umbral de decisión fundamentado ni comparar con alternativas.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-16): conviene verificar la integridad del repositorio antes de confiar en él.
- Para producción, se recomienda evaluar el modelo en un conjunto de test propio y anotado, y considerar alternativas documentadas si los resultados no son concluyentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gangryunguh/distilbert-toxic-classifier
- Paper de DistilBERT (referenciado en los tags del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) sobre estimación de emisiones: https://arxiv.org/abs/1910.09700
