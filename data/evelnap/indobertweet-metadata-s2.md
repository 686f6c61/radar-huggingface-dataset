# evelnap/indobertweet-metadata-s2

## Resumen

`evelnap/indobertweet-metadata-s2` es un modelo de clasificación de texto en indonesio obtenido mediante fine-tuning de `indolem/indobertweet-base-uncased`, un BERT base adaptado al indonesio y preentrenado sobre tuits. El modelo resuelve una tarea de clasificación multietiqueta orientada a la moderación de contenido: detecta simultáneamente cinco categorías de toxicidad (`insults`, `identity_attack`, `threat_incitement_to_violence`, `profanity_obscenity`, `sexually_explicit`).

Se trata de un modelo pequeño (110.562.053 parámetros, ~0,9 GB en el repositorio) publicado por el usuario `evelnap`, con hiperparámetros ajustados mediante Optuna según indica la model card. Su relevancia es práctica: ofrece un clasificador ligero y desplegable en CPU para pipelines de moderación en lengua indonesia, si bien la documentación publicada es mínima y no incluye métricas de evaluación ni detalles del conjunto de entrenamiento.

La información disponible no permite confirmar el origen de los datos de entrenamiento, el proceso de anotación ni el rendimiento real del modelo. Cualquier evaluación en producción debería ir precedida de una validación propia sobre un conjunto representativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder), fine-tuning para clasificación de secuencias |
| Parametros totales | 110.562.053 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base IndoBERTweet emplea posiciones hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de transformers/BERT, no documentada por el autor) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `indolem/indobertweet-base-uncased`, un BERT base entrenado específicamente sobre corpus de Twitter en indonesio, lo que lo hace adecuado para texto informal, abreviaturas y jerga de redes sociales. Sobre esa base se aplica un fine-tuning con cabeza de clasificación multietiqueta (`multi_label_classification`) para cinco etiquetas de toxicidad. La model card indica que los hiperparámetros se buscaron con Optuna, pero no especifica el número de tokens de entrenamiento, la composición del dataset, la función de pérdida exacta ni si se aplicaron técnicas de desbalanceo de clases.

No se documenta ningún proceso de RLHF, DPO ni innovación arquitectónica adicional. La model card recomienda explícitamente aplicar al texto de inferencia el mismo preprocesado usado en entrenamiento (minúsculas, normalización de emojis, menciones y URLs), lo que sugiere que el pipeline de datos incluía una fase de limpieza de texto de redes sociales.

## Capacidades

- Clasificación multietiqueta de texto en indonesio con cinco categorías de toxicidad: insultos, ataque a la identidad, amenaza o incitación a la violencia, obscenidad y contenido sexual explícito.
- Detección simultánea de varias etiquetas en un mismo fragmento de texto (no mutuamente excluyentes).
- Procesamiento de texto informal de redes sociales, gracias al preentrenamiento del modelo base sobre tuits.
- Integración con la librería `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Compatibilidad declarada con Text Embeddings Inference y endpoints compatibles (tags del repositorio).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Moderación de comentarios en plataformas de redes sociales en indonesio: el modelo puede puntuar cada comentario con cinco probabilidades independientes y activar revisión humana o filtrado automático según umbrales configurables por etiqueta.
- Filtrado previo en foros y comunidades online: al ser un modelo de 110M de parámetros, puede ejecutarse en CPU y aplicarse a todo el flujo de comentarios antes de pasar a modelos más costosos.
- Monitorización de toxicidad en campañas de marketing o reputación de marca: clasificación por lotes de menciones y tuits para cuantificar la proporción de contenido insultante o sexualmente explícito.
- Enriquecimiento de datasets de investigación: etiquetado automático de corpus indonesios con las cinco dimensiones de toxicidad para análisis posteriores o para preetiquetar y acelerar la anotación humana.
- Sistemas de alerta para equipos de confianza y seguridad: detección de amenazas o incitación a la violencia con revisión priorizada según la probabilidad asignada a esa etiqueta concreta.
- Prefiltro en pipelines de moderación multilingües: uso del modelo como componente específico para indonesio dentro de un sistema mayor que derive otros idiomas a clasificadores distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1, matriz de confusión ni comparación con otros clasificadores de toxicidad en indonesio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo para pesos (110,5M parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU consumer.
- En FP16/BF16: alrededor de 0,22 GB de pesos, con requisitos totales por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo no requiere aceleradores de gama alta.
- Cabe en CPU: es viable la inferencia en CPU para lotes moderados, dado el tamaño reducido del modelo.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (declarado compatible por los tags del repositorio), exportación a ONNX o cuantización dinámica para CPU.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evelnap/indobertweet-metadata-s2 | 110,5M | no disponible | Clasificación multietiqueta de toxicidad (5 etiquetas) | no disponible | Hugging Face |
| indolem/indobertweet-base-uncased | ~110M | hasta 512 tokens (BERT base) | Modelo base de lenguaje (no clasificador) | no disponible en la informacion proporcionada | Hugging Face |
| indobert-base-uncased (IndoBERT) | ~110M | hasta 512 tokens (BERT base) | Modelo base de lenguaje | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el proceso de anotación ni las métricas de evaluación; no es posible estimar la fiabilidad real del clasificador sin una validación propia.
- Riesgo de sesgos: al entrenarse sobre texto de Twitter en indonesio, el modelo puede heredar sesgos léxicos y dialectales del corpus, y mostrar peor rendimiento en registros formales, variantes regionales o jerga no representada.
- Riesgo de falsos positivos y negativos: la clasificación de toxicidad es sensible al contexto; palabras malsonantes en usos no ofensivos (citas, ironía, discurso reportado) pueden activar etiquetas indebidamente.
- Dependencia del preprocesado: la model card advierte que el texto de entrada debe pasar por el mismo pipeline de normalización (minúsculas, emojis, menciones, URLs) que en entrenamiento; no hacerlo degrada las predicciones.
- Cobertura lingüística limitada al indonesio; no debe usarse en malayo, javanés u otras lenguas sin validación previa.
- Licencia no especificada: la ausencia de licencia explícita impide confirmar si el uso comercial está permitido; debe consultarse con el autor antes de integrarlo en productos.
- Popularidad muy baja (13 descargas, 0 likes en el momento de la consulta) y ausencia de mantenimiento documentado; no hay garantías de soporte ni de actualizaciones.
- No debe usarse como único mecanismo de moderación en producción: se recomienda combinarlo con revisión humana y umbrales calibrados sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evelnap/indobertweet-metadata-s2
- Modelo base: https://huggingface.co/indolem/indobertweet-base-uncased
