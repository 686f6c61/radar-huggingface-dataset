# JamesASnook1/learn_hf_food_not_food_text_classifier

## Resumen

`learn_hf_food_not_food_text_classifier` es un clasificador binario de texto obtenido por ajuste fino (*fine-tuning*) de `distilbert/distilbert-base-uncased`. Lo publica el usuario JamesASnook1 en HuggingFace y su propósito declarado, a partir del propio nombre del repositorio, es distinguir textos que hablan de comida de los que no. Se trata de un modelo derivado de un ejercicio de aprendizaje dentro del ecosistema `transformers` (la etiqueta `generated_from_trainer` así lo indica) y no de un modelo entrenado desde cero.

Arquitecturalmente es un transformer encoder de 6 capas con 66.955.010 parámetros totales, de los cuales la práctica totalidad corresponden al cuerpo de DistilBERT (unos 66 millones) más una cabeza de clasificación de dos etiquetas. Hereda del modelo base la ventana de contexto de 512 tokens, el tokenizador WordPiece en inglés sin distinción de mayúsculas y la licencia Apache 2.0.

Su relevancia es limitada como modelo de producción: el autor no documenta el conjunto de datos, no publica métricas sobre un test independiente y declara una accuracy de 1,0 sobre un conjunto de evaluación no descrito, con solo 7 pasos de entrenamiento por época (unas 224 muestras por época con `batch_size=32`). Resulta útil como ejemplo didáctico de pipeline de clasificación y como punto de partida para experimentos, pero no como componente listo para desplegar sin una validación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) con cabeza de clasificación de 2 etiquetas |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredado de `distilbert-base-uncased`) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors (fp32). Compatible con cuantización dinámica de PyTorch y exportación a ONNX de forma estándar, pero sin artefactos publicados |
| Idiomas soportados | Inglés (modelo base `uncased` en inglés); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), librería `transformers` |

Otros datos del repositorio: tamaño de 5,1 GB (muy superior al peso de los pesos, lo que sugiere la presencia de checkpoints intermedios del entrenador), 0 descargas, 0 likes, creado el 2026-10-19 y actualizado el 2026-10-20.

## Arquitectura y entrenamiento

El modelo es un `DistilBertForSequenceClassification`: un encoder transformer de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado del `bert-base-uncased` original (12 capas), al que se añade una capa lineal de proyección a 2 logits. El tokenizador es WordPiece con vocabulario de 30.522 piezas y normalización a minúsculas. No emplea atención lineal, decodificación especulativa ni mecanismos híbridos: es un encoder bidireccional clásico, adecuado para clasificación y no para generación.

El entrenamiento se realizó con `Trainer` de `transformers` durante 10 épocas, con `learning_rate=1e-4`, `train_batch_size=32`, `eval_batch_size=32`, semilla 42, optimizador AdamW (variante `torch_fused`, betas 0,9/0,999, epsilon 1e-8) y planificador lineal. El conjunto de datos no se especifica ("on an unknown dataset"); por el número de pasos registrados (7 por época) se deduce un conjunto de entrenamiento de aproximadamente 224 ejemplos, y el conjunto de evaluación sería de tamaño similar o menor. No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias, algo por otra parte esperable en un clasificador. La evolución de la pérdida de validación (de 0,1511 en la época 1 a 0,0006 en la época 10) con accuracy constante de 1,0 desde la primera época es compatible con un problema trivialmente separable o con sobreajuste severo; no hay evidencia que permita distinguir ambos casos.

## Capacidades

- Clasificación binaria de texto corto: asigna una de dos etiquetas (comida / no comida, según el nombre del repositorio) a una secuencia de entrada.
- Entrada en inglés con tokenizador `uncased`; el rendimiento fuera de ese idioma no está evaluado ni se declara.
- Procesamiento de secuencias de hasta 512 tokens, útil para reseñas, titulares, párrafos de blog o descripciones de producto.
- Inferencia muy rápida por su tamaño (66,9 M de parámetros), apta para filtrado de grandes volúmenes en CPU.
- Integración directa con el pipeline `text-classification` de `transformers` y con Text Embeddings Inference (etiqueta `text-embeddings-inference`).
- No soporta *tool calling*, ni razonamiento multi-paso, ni modo *thinking*, ni visión, ni audio.
- No es un modelo generativo: no produce texto, solo puntuaciones por etiqueta.
- Las etiquetas concretas (`id2label`) no están documentadas en la model card; deben verificarse en `config.json` antes de usarlo.

## Casos de uso

- Filtrado de reseñas en una plataforma de restauración: clasificar cada reseña como relacionada con comida o no, para enrutar las que hablan de servicio, limpieza o facturación a un equipo distinto. El límite de 512 tokens cubre la mayoría de reseñas.
- Enrutamiento de tickets en una app de reparto: usar la etiqueta como señal previa antes de un clasificador multietiqueta más costoso, aprovechando el bajo coste por inferencia del modelo.
- Pre-etiquetado de corpus para *active learning*: procesar grandes volúmenes de texto y enviar solo los casos con puntuación cercana al umbral a revisión humana, reduciendo el coste de anotación.
- Detección de consultas fuera de dominio en un chatbot de recetas: descartar preguntas que no tienen relación con alimentación antes de invocar un modelo mayor, ahorrando tokens y latencia.
- Extracción de *features* para un sistema de recomendación: usar la probabilidad de la clase "comida" como variable auxiliar en el ranking de contenidos.
- Limpieza de pipelines de *scraping*: descartar páginas o fragmentos que no tratan de gastronomía al construir un corpus culinario, como paso de filtrado barato previo a un deduplicado.
- Demostración docente de un flujo completo de ajuste fino con `Trainer`: sirve como plantilla reproducible para ilustrar hiperparámetros, curvas de pérdida y evaluación, no como modelo final.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío (`"results": []`), por lo que no hay resultados en benchmarks estándar (MMLU, GLUE, etc.). Los únicos datos disponibles son los declarados por el autor sobre un conjunto de evaluación no descrito:

| Epoca | Paso | Pérdida de validación | Accuracy |
|---|---|---|---|
| 1 | 7 | 0,1511 | 1,0 |
| 2 | 14 | 0,0099 | 1,0 |
| 3 | 21 | 0,0029 | 1,0 |
| 4 | 28 | 0,0015 | 1,0 |
| 5 | 35 | 0,0010 | 1,0 |
| 6 | 42 | 0,0008 | 1,0 |
| 7 | 49 | 0,0007 | 1,0 |
| 8 | 56 | 0,0006 | 1,0 |
| 9 | 63 | 0,0006 | 1,0 |
| 10 | 70 | 0,0006 | 1,0 |

Resultado final declarado: pérdida 0,0006 y accuracy 1,0. No se indica el tamaño del conjunto de evaluación, su procedencia ni si se separó del de entrenamiento, de modo que estas cifras no deben interpretarse como una estimación del rendimiento en producción.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,27 GB de pesos, en torno a 0,5-1 GB contando activaciones y *overhead* del runtime.
- VRAM en fp16: unos 0,14 GB; en int8 dinámico, unos 0,07 GB.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090 o incluso iGPU con suficiente memoria compartida.
- Ejecución viable en CPU para volúmenes moderados; es el escenario recomendado por relación coste/rendimiento dado el tamaño del modelo.
- GPU recomendadas: ninguna en particular; A100/H100 solo tendrían sentido para lotes masivos. Una T4 o L4 es más que suficiente.
- Opciones de despliegue: `transformers` pipeline, Text Embeddings Inference (soportado por etiqueta), ONNX Runtime, TorchScript, o serialización con `Optimum`. vLLM y TGI no aportan ventaja apreciable en un encoder de este tamaño.
- Latencia y throughput: no publicados. De forma orientativa, un encoder de 6 capas y 66 M de parámetros procesa del orden de centenares a miles de textos cortos por segundo en GPU moderna y decenas a centenares por segundo en CPU, dependiendo de la longitud de secuencia y del lote; estas cifras son estimaciones y deben medirse en el entorno objetivo.
- Atención al tamaño del repositorio: 5,1 GB frente a los ~268 MB de los pesos en fp32, lo que indica checkpoints intermedios u otros artefactos que conviene no descargar en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| `learn_hf_food_not_food_text_classifier` | 66,9 M | 512 tokens | Clasificador binario ajustado | Apache 2.0 | Repositorio público, sin métricas de test independientes |
| `distilbert/distilbert-base-uncased` | ~66 M | 512 tokens | Encoder base (MLM) | Apache 2.0 | Modelo de referencia ampliamente utilizado |
| `google-bert/bert-base-uncased` | ~110 M | 512 tokens | Encoder base (MLM) | Apache 2.0 | Modelo de referencia, más pesado que DistilBERT |
| `roberta-base` | ~125 M | 514 tokens | Encoder base (MLM) | MIT | Alternativa habitual para clasificación en inglés |

No se dispone de comparaciones de rendimiento frente a alternativas, porque el autor no publica resultados en benchmarks ni sobre un conjunto de evaluación independiente. Cualquier comparación numérica con clasificadores similares requeriría evaluar todos los modelos sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- Conjunto de datos de entrenamiento no documentado ("on an unknown dataset"): se desconoce la composición, el equilibrio de clases, la procedencia y las posibles fugas entre entrenamiento y evaluación.
- Accuracy de 1,0 con aproximadamente 224 ejemplos por época: alta probabilidad de sobreajuste o de un problema trivialmente separable. No es una estimación fiable del rendimiento en datos reales.
- No hay métricas de test independiente, ni matriz de confusión, ni precisión/recall por clase. En un clasificador binario desbalanceado la accuracy es una métrica engañosa.
- Las etiquetas no están descritas en la model card; hay que leer `config.json` para conocer el mapeo `id2label`, y verificarlo antes de interpretar salidas.
- Modelo exclusivamente en inglés: el tokenizador `uncased` y el vocabulario del base no cubren bien otros idiomas, y no se ha evaluado su comportamiento en castellano.
- Riesgo de falsos positivos y negativos por dominio: un texto sobre nutrición, dietas o agricultura puede caer en cualquiera de las dos clases según cómo se definiera "comida" en el entrenamiento, definición que se desconoce.
- Sin calibración documentada de las probabilidades: los `scores` devueltos no deben usarse directamente como probabilidades fiables sin un ajuste de temperatura y una validación propia.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el cumplimiento normativo y la evaluación de sesgos recaen sobre quien despliega.
- Modelo con 0 descargas y 0 likes: sin comunidad que lo haya validado, sin incidencias reportadas y sin mantenimiento esperado.
- Tamaño del repositorio desproporcionado (5,1 GB): quienes lo descarguen enteros asumirán un coste de almacenamiento innecesario.
- No apto para generación de texto, razonamiento, agentes ni tareas multilingües: cualquier expectativa de ese tipo queda fuera de su arquitectura.
- Para producción se recomienda reentrenar o al menos revalidar con un conjunto etiquetado propio, ajustar el umbral de decisión y monitorizar la deriva de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JamesASnook1/learn_hf_food_not_food_text_classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de `transformers` para clasificación de secuencias: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
