# gulpara/results

## Resumen

`gulpara/results` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `google-bert/bert-base-uncased`. Lo publica el usuario `gulpara` en HuggingFace y sigue el formato estándar de los modelos generados automáticamente con `Trainer` de la librería Transformers. Se trata, por tanto, de un ajuste de BERT base sobre un conjunto de datos que el autor no identifica en la model card ("None dataset"), orientado a una tarea de clasificación de texto que tampoco se especifica.

El modelo conserva la arquitectura encoder-only de BERT base, con 109.483.778 parámetros totales (aproximadamente 110 millones) y un repositorio de 0,4 GB en formato safetensors. No incorpora innovaciones arquitectónicas: es un transformer bidireccional estándar con tokenizador WordPiece y vocabulario de 30.522 tokens, pensado para inferencia de clasificación (una etiqueta o distribución de etiquetas por secuencia de entrada).

Su relevancia es limitada y de ámbito estrictamente privado o experimental: cero descargas, cero likes, sin métricas de benchmarks declaradas (el `model-index` está vacío) y sin información sobre el dataset, las clases de salida ni los idiomas. Resulta útil únicamente como ejemplo de pipeline de fine-tuning de BERT o como artefacto interno del autor, no como modelo recomendable para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es principalmente inglés; el fine-tuning no documenta idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-uncased`: 12 capas de transformer encoder, 768 dimensiones ocultas, 12 cabezas de atención, 110 millones de parámetros y tokenizador WordPiece con vocabulario en minúsculas. Sobre esta base se ha añadido una cabeza de clasificación (pooler + capa lineal) cuyas dimensiones de salida no se detallan en la model card, por lo que se desconoce el número de clases.

El entrenamiento se realizó con el `Trainer` de Transformers 5.21.0 sobre PyTorch 2.11.0+cu130, con los siguientes hiperparámetros: learning rate 2e-05, batch size de 16 en entrenamiento y evaluación, semilla 42, optimizador AdamW fused (betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal y 2 épocas completas (558 pasos, 279 por época). No se documenta el volumen de datos, la composición del dataset, si hubo validación cruzada, ni si se aplicaron técnicas de regularización más allá del early stopping implícito en las 2 épocas. Tampoco consta RLHF, DPO ni ningún tipo de alineación, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de texto por secuencia: produce una etiqueta (o distribución de probabilidad sobre clases) para cada entrada, con la cabeza de clasificación ajustada.
- Comprensión bidireccional del contexto: al ser un encoder, atiende simultáneamente a izquierda y derecha, lo que favorece tareas de comprensión (sentimiento, tópicos, detección de spam, etc.) frente a la generación.
- Procesamiento en inglés principalmente, heredado de `bert-base-uncased`; el fine-tuning no documenta soporte multilingüe.
- No soporta tool calling ni function calling: es un modelo encoder-only sin interfaz de instrucciones.
- No soporta agentes ni razonamiento multi-step: no genera texto libre ni cadenas de pensamiento.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: no disponible; el vocabulario en minúsculas y el corpus original de BERT base están sesgados hacia inglés.

## Casos de uso

- Clasificación de sentimiento en reseñas o tickets: el modelo puede asignar polaridad a textos cortos en inglés; su ventana de 512 tokens cubre la mayoría de reseñas y mensajes de soporte, y la latencia en CPU es baja al tratarse de 110 millones de parámetros.
- Detección de spam o contenido tóxico: útil como clasificador binario o multiclase en pipelines de moderación, siempre que se reentrene o valide con datos propios, dado que el autor no documenta las clases.
- Enrutamiento de tickets de soporte: clasificar la categoría de una incidencia entrante para dirigirla al equipo adecuado, aprovechando el bajo coste de inferencia de un BERT base.
- Etiquetado de documentos en pipelines de ingesta: clasificación de documentos cortos (correos, artículos, descripciones de producto) antes de indexarlos en un buscador o base de datos.
- Filtrado previo en sistemas de retrieval: usar el clasificador como re-ranker o filtro de candidatos antes de un modelo generativo más costoso.
- Baseline interno para experimentos de NLP: punto de partida reproducible (semilla 42, hiperparámetros documentados) para comparar futuros fine-tunings sobre el mismo dataset.
- Clasificación de consultas de formularios o encuestas: asignar categorías a respuestas abiertas cortas en inglés, con despliegue en CPU mediante ONNX o TorchScript.

## Benchmarks y rendimiento

El `model-index` del autor está vacío (`results: []`), por lo que no se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.). Los únicos datos de evaluación disponibles son los de validación durante el entrenamiento, declarados por el autor:

| Metrica | Epoca 1 (step 279) | Epoca 2 (step 558) |
|---|---|---|
| Training loss | 0,0305 | 0,0176 |
| Validation loss | 0,0502 | 0,0404 |
| Accuracy | 0,9883 | 0,9910 |

No se especifica el tamaño ni la composición del conjunto de validación, por lo que la accuracy de 0,9910 no es interpretable fuera del contexto del dataset privado del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB de pesos (109,5 M parámetros × 4 bytes) más activaciones; en la práctica, menos de 1 GB para batch pequeño.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia de milisegundos por secuencia corta. En GPU, cualquier modelo desde una GTX 1650 o RTX 3050 en adelante es suficiente; A100/H100 solo tendrían sentido para batches muy grandes.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, ONNX Runtime, TorchScript, FastAPI + Uvicorn, o exportación a GGUF para llama.cpp (aunque llama.cpp está orientado a generación y no es la vía natural para un encoder de clasificación).
- Latencia y throughput estimados: no disponibles en la información proporcionada; en CPU, un BERT base suele procesar decenas de secuencias por segundo con batch pequeño, pero no hay medición oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gulpara/results | 109,5 M | 512 (estándar BERT) | Clasificación de texto | Apache 2.0 | HuggingFace, 0 descargas |
| google-bert/bert-base-uncased | 110 M | 512 | Modelo base (MLM) | Apache 2.0 | HuggingFace, ampliamente usado |
| distilbert-base-uncased | 66 M | 512 | Modelo base (destilado) | Apache 2.0 | HuggingFace, ampliamente usado |
| roberta-base | 125 M | 512 | Modelo base (MLM) | MIT | HuggingFace, ampliamente usado |

Frente a `bert-base-uncased`, este modelo añade una cabeza de clasificación ajustada, pero carece de la documentación y el ecosistema del original. Frente a `distilbert-base-uncased`, es más pesado (109,5 M frente a 66 M) sin ventajas documentadas de rendimiento. Frente a `roberta-base`, tiene una licencia comparable y un tamaño similar, pero sin métricas públicas que permitan comparar calidad.

## Limitaciones y advertencias

- Dataset de entrenamiento no identificado: la model card indica "None dataset", por lo que se desconoce la distribución de clases, el dominio y el idioma real de los datos.
- Métricas no reproducibles: la accuracy de 0,9910 se ha medido sobre un conjunto de validación no descrito; no es extrapolable a otros datos.
- Riesgo de alucinación bajo en el sentido generativo (no genera texto libre), pero riesgo de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Sesgos heredados de `bert-base-uncased`: sesgos de género, raza y dominio presentes en el corpus original (BookCorpus y Wikipedia en inglés).
- Limitación de contexto: 512 tokens; textos más largos requieren truncamiento o segmentación.
- Idiomas: no se documenta soporte multilingüe; el tokenizador en minúsculas y el corpus original están orientados al inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación de soporte; conviene auditar el modelo antes de integrarlo en producción.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-02): metadato anómalo que sugiere que el repositorio podría ser de prueba o generado automáticamente; conviene verificarlo antes de confiar en él.

## Enlaces

- HuggingFace: https://huggingface.co/gulpara/results
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
