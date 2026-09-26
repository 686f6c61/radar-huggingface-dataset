# Sanjeetkkr/sentiment-model

## Resumen

Sanjeetkkr/sentiment-model es un modelo de clasificación de texto publicado en HuggingFace por el usuario Sanjeetkkr. Se trata de un ajuste fino (fine-tuning) de distilbert-base-uncased, la versión destilada de BERT, orientado a análisis de sentimiento. El repositorio contiene 66.955.779 parámetros en formato safetensors y ocupa 0,3 GB, por lo que es un modelo compacto, desplegable en hardware muy modesto, incluso en CPU.

El problema que resuelve es el habitual de la clasificación de sentimiento: asignar una etiqueta polar (o varias) a un fragmento de texto. Su relevancia práctica es limitada en comparación con alternativas consolidadas del mismo tamaño, porque la model card no documenta el conjunto de datos de entrenamiento, el esquema de etiquetas ni los usos previstos, y las métricas declaradas son moderadas (accuracy de 0,6598 y F1 macro de 0,6493 sobre un conjunto de evaluación no identificado).

Es, en la práctica, un artefacto derivado de un entrenamiento con el Trainer de HuggingFace (3 épocas, learning rate 2e-05, batch de 32) que no ha sido documentado ni validado por la comunidad: acumula 0 descargas y 0 likes desde su creación. Resulta útil como ejemplo reproducible de pipeline de fine-tuning y como punto de partida para reentrenar con datos propios, más que como solución lista para producción.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT): 6 capas, dimensión oculta 768, 12 cabezas de atención, sin pooler |
| Parámetros totales | 66.955.779 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite estándar de distilbert-base-uncased; no se documenta explícitamente en la model card) |
| Tipos de cuantización | no disponible en el repositorio; al ser un encoder de 66 M de parámetros admite cuantización dinámica a int8 mediante PyTorch o ONNX Runtime, y conversión a GGUF con scripts de terceros |
| Idiomas soportados | no disponible; el modelo base está preentrenado principalmente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | text-classification (clasificación de sentimiento) |
| Número de etiquetas de salida | 3 (inferido del recuento exacto de parámetros: 66.362.880 del encoder + 590.592 de la capa pre_classifier + 769 por etiqueta; la model card no documenta el esquema de clases) |
| Modelo base | distilbert/distilbert-base-uncased |
| Librería | transformers |
| Tamaño del repositorio | 0,3 GB |
| Versiones del framework | Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT: un transformer encoder con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, resultado de destilar BERT-base (12 capas, 110 M de parámetros) conservando aproximadamente el 97 % del rendimiento de GLUE con un 40 % menos de parámetros y una velocidad de inferencia un 60 % superior. Sobre el encoder destilado se añade la cabeza estándar de clasificación de secuencias de HuggingFace (una capa densa `pre_classifier` de 768x768 y una capa `classifier` de 768 x número de etiquetas, con sus sesgos), lo que explica el recuento total de 66.955.779 parámetros frente a los 66.362.880 del encoder puro.

El entrenamiento se realizó con el Trainer de HuggingFace durante 3 épocas, con learning rate 2e-05, batch de 32 (tanto en entrenamiento como en evaluación), optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08), scheduler lineal y semilla 42. El conjunto de datos no se especifica en ningún momento de la model card: figura literalmente como "unknown dataset". No hay información sobre volumen de tokens, composición del corpus, idioma del dataset, técnica de alineación (RLHF, DPO) ni proceso de destilación propio, ya que la destilación se hereda del modelo base. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Clasificación de texto en 3 categorías de sentimiento (esquema de clases no documentado; presumiblemente polaridad negativa/neutra/positiva o similar).
- Inferencia sobre secuencias de hasta 512 tokens con el tokenizador WordPiece sin distinción de mayúsculas del modelo base.
- Clasificación por lotes (batch) con la pipeline `text-classification` de Transformers o con `AutoModelForSequenceClassification`.
- Compatibilidad con `endpoints_compatible`, es decir, puede desplegarse directamente en HuggingFace Inference Endpoints.
- No dispone de generación de texto, razonamiento multi-paso, matemáticas, código ni capacidades de visión.
- No soporta tool calling ni function calling: es un clasificador discriminativo, no un modelo generativo con API de herramientas.
- No se documentan capacidades multilingües; el modelo base está entrenado sobre todo en inglés y usa un vocabulario `uncased` en inglés.
- No dispone de modo de razonamiento ("thinking"), audio ni multimodalidad.

## Casos de uso

- Análisis de opiniones en inglés sobre reseñas de producto: clasificar reseñas cortas (hasta 512 tokens) en tres niveles de polaridad. Adecuado por su baja huella de memoria, aunque conviene validar antes la precisión real en el dominio objetivo.
- Triaje de correos o tickets de soporte: preetiquetar automáticamente mensajes de clientes por tono (satisfecho, neutro, frustrado) para priorizar la cola de atención. Funciona en CPU, lo que abarata el despliegue en volúmenes altos.
- Monitorización de menciones en redes sociales: procesar flujos de texto corto en tiempo real mediante la pipeline de Transformers y agregar la polaridad por periodo temporal.
- Filtrado previo en pipelines de moderación: descartar o marcar contenido según el tono detectado antes de pasarlo a un modelo mayor o a revisión humana.
- Etiquetado asistido de datos: usar el modelo como preanotador para reducir el coste de anotación manual de un corpus de sentimiento propio, con revisión posterior.
- Base para un reentrenamiento específico de dominio: al ser un fine-tune estándar de DistilBERT bajo Apache-2.0, sirve como punto de partida reproducible para ajustar con datos propios médicos, financieros o de atención al cliente.
- Experimentación docente o de investigación: ejemplo mínimo de pipeline completo (tokenizador, Trainer, métricas de evaluación) para ilustrar el flujo de trabajo de HuggingFace sin requerir GPU.

## Benchmarks y rendimiento

El campo `results` del model-index de la model card está vacío, por lo que no hay benchmarks oficiales declarados en el formato estándar. El autor sí publica métricas de evaluación y la curva de entrenamiento, calculadas sobre un conjunto de evaluación no identificado. Se reproducen tal cual:

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| No identificado (eval del autor) | Loss | 0,7470 |
| No identificado (eval del autor) | Accuracy | 0,6598 |
| No identificado (eval del autor) | F1 weighted | 0,6493 |
| No identificado (eval del autor) | F1 macro | 0,6493 |

| Época | Paso | Training loss | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0 | 58 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2,0 | 116 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3,0 | 174 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado resultados de benchmarks comparables (MMLU, GLUE, SST-2, etc.) en la información disponible. La coincidencia exacta entre F1 weighted y F1 macro sugiere un conjunto de evaluación con clases equilibradas; la pérdida de validación deja de mejorar a partir de la segunda época, lo que apunta a un sobreajuste leve en la tercera.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 268 MB solo para los pesos, más activaciones; cabe en cualquier GPU con 1-2 GB libres.
- VRAM en fp16/bf16: aproximadamente 134 MB de pesos.
- VRAM en int8 (cuantización dinámica): aproximadamente 67 MB de pesos.
- Inferencia en CPU totalmente viable: el modelo cabe en memoria RAM en menos de 0,5 GB en fp32, por lo que puede ejecutarse en instancias básicas, contenedores pequeños o incluso dispositivos tipo Raspberry Pi 4 (con latencias mayores).
- GPU recomendadas: cualquiera, incluidas GTX 1050/1650, RTX 3050/3060/4090, T4, L4, A10 o A100; no requiere GPU de gama alta ni aceleradores como H100 para un uso razonable.
- Cabe sin problema en GPU de consumo: es un modelo de 66 M de parámetros, varios órdenes de magnitud por debajo de los modelos que requieren 24 GB o más de VRAM.
- Opciones de despliegue: pipeline de Transformers (`text-classification`), `AutoModelForSequenceClassification` con PyTorch, exportación a ONNX Runtime, TorchScript, TorchServe, HuggingFace Inference Endpoints (el tag `endpoints_compatible` lo confirma), Text Generation Inference (TGI) en modo clasificación y vLLM con soporte de modelos de clasificación. Ollama y llama.cpp requieren convertir previamente los pesos a GGUF, algo no soportado de forma nativa para este repositorio.
- Latencia y throughput: no se publican cifras. Como estimación orientativa basada en el tamaño del modelo, en GPU se esperan latencias de milisegundos por lote de 32 secuencias de 128 tokens y decenas de milisegundos en CPU; estas cifras deben medirse en el hardware objetivo y no proceden de datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Clases | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| Sanjeetkkr/sentiment-model | 66,9 M | 512 tokens | 3 (inferido) | Apache-2.0 | Accuracy 0,6598 y F1 macro 0,6493 sobre un conjunto de evaluación no identificado |
| distilbert-base-uncased-finetuned-sst-2-english | 67,0 M | 512 tokens | 2 (positivo/negativo) | Apache-2.0 | Accuracy 0,913 en el conjunto de desarrollo de SST-2, según su model card |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 512 tokens | 3 (negativo/neutro/positivo) | consultar su model card | Métricas publicadas en su propia model card (F1 por clase); no verificadas aquí |
| nlptown/bert-base-multilingual-uncased-sentiment | 178 M | 512 tokens | 5 (estrellas) | consultar su model card | Métricas publicadas en su propia model card; no verificadas aquí |

Los datos de los modelos comparativos proceden de sus respectivas model cards públicas en HuggingFace y conviene verificarlos antes de citarlos. La diferencia clave es que este modelo no aporta métricas sobre un conjunto identificable, lo que impide comparar su rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Precisión moderada: accuracy de 0,6598 y F1 macro de 0,6493, muy por debajo de lo habitual en clasificación de sentimiento en inglés con DistilBERT ajustado sobre SST-2 (en torno al 0,91). La pérdida de validación es cercana a 0,71-0,75, coherente con un ajuste pobre.
- Conjunto de datos desconocido: la model card indica "unknown dataset" para entrenamiento y evaluación. Es imposible caracterizar el dominio, el idioma, el balance de clases ni los sesgos específicos del corpus.
- Esquema de etiquetas no documentado: aunque el recuento de parámetros es consistente con 3 clases, el mapeo `id2label` debe inspeccionarse en `config.json` antes de cualquier uso; confundir el orden de las etiquetas invalida el resultado.
- Sesgos heredados: el modelo base se preentrenó con Wikipedia en inglés y BookCorpus, por lo que arrastra sesgos de género, origen y religión presentes en esos corpus, y no se ha aplicado ninguna corrección posterior.
- Cobertura lingüística limitada: al derivar de una variante `uncased` en inglés, el rendimiento fuera del inglés es impredecible y previsiblemente malo.
- Longitud limitada: textos de más de 512 tokens deben truncarse, lo que puede hacer perder la información relevante en documentos largos.
- Riesgo de errores de clasificación: al no ser un modelo generativo no alucina texto, pero sí puede producir falsos positivos y falsos negativos con una confianza alta, especialmente en dominios alejados del corpus de entrenamiento. No debe usarse como único criterio en decisiones sensibles.
- Ausencia de validación externa: 0 descargas y 0 likes, un único commit, model card autogenerada por el Trainer y sin revisión del autor ("More information needed"). No hay garantías de mantenimiento ni de corrección de errores.
- Licencia: Apache-2.0 permite uso comercial y modificación con atribución, pero no implica ninguna garantía por parte del autor sobre el comportamiento del modelo.
- Reproducibilidad parcial: se conocen los hiperparámetros y las versiones (Transformers 5.16.1, PyTorch 2.11.0+cu128), pero no el dataset, por lo que el entrenamiento no es reproducible.
- Fechas del repositorio: la fecha de creación indicada (2026-09-26) resulta anómala respecto al estado actual;
conviene comprobarla directamente en la página del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanjeetkkr/sentiment-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Alternativa consolidada para comparar: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
- Alternativa multilingüe de 5 clases: https://huggingface.co/nlptown/bert-base-multilingual-uncased-sentiment
- Alternativa basada en RoBERTa para redes sociales: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
- Artículo de DistilBERT (referencia de la arquitectura base): https://arxiv.org/abs/1910.01108
- Documentación de la pipeline de clasificación de texto de Transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TextClassificationPipeline
- Documentación del Trainer: https://huggingface.co/docs/transformers/main/en/main_classes/trainer
