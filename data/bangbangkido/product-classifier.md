# bangbangkido/Product-Classifier

## Resumen

Product-Classifier es un modelo de clasificación de texto en chino desarrollado por el usuario bangbangkido. Se trata de un ajuste fino (fine-tuning) del modelo base `google-bert/bert-base-chinese`, orientado a clasificar títulos de productos en 30 categorías distintas. El modelo resuelve el problema de categorización automática de productos en plataformas de comercio electrónico, un caso de uso habitual en sistemas de gestión de catálogos y motores de búsqueda internos.

El modelo se publica con la etiqueta "legacy" porque su esquema de 30 clases es incompatible con el estándar de 27 clases que el autor mantiene en versiones posteriores (`product-title-classifier-*`). Por tanto, es relevante principalmente como referencia histórica o para sistemas que ya dependan del esquema antiguo, no como opción recomendada para nuevos desarrollos.

Arquitectura BERT base en chino (transformer encoder) con una capa lineal de clasificación sobre el vector CLS. La longitud máxima de entrada es de 48 tokens, incluyendo tokens especiales, lo que limita su uso a títulos cortos. El repositorio ocupa 0,8 GB e incluye pesos en un `state_dict` de PyTorch personalizado, no compatible con la carga estándar de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base chino) con capa lineal de clasificación sobre CLS |
| Parametros totales | no disponible (el fichero `model.pt` ocupa 409.231.567 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 48 tokens (incluyendo tokens especiales; truncamiento de títulos más largos) |
| Tipos de cuantizacion | FP32 en PyTorch; existe versión ONNX FP32 / INT8 en repositorio separado |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `state_dict` personalizado (`model.pt`); ONNX en repositorio alternativo |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-chinese`, un transformer encoder de tipo BERT. Sobre la representación del token CLS se añade una capa lineal que proyecta a 30 clases. La configuración de entrenamiento publicada corresponde a la versión `20261027-051303-065127_seq48_bs32_lr1e-05_ep100_seed42_samplesall`: longitud máxima de secuencia de 48 tokens, batch size de 32, learning rate de 1e-5, hasta 100 épocas con parada temprana sobre el conjunto de validación y semilla 42.

El conjunto de entrenamiento consta de 88.824 ejemplos y el de validación de 11.104. El autor indica que los datos de entrenamiento se publican bajo Apache-2.0. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del ajuste fino supervisado estándar. Los datos de preprocesado originales de 64 tokens se convirtieron a 48 tokens conservando el token SEP en el punto de truncamiento.

## Capacidades

- Clasificación de títulos de producto en chino en 30 categorías predefinidas.
- Salida de etiqueta única (single-label) con probabilidades por clase.
- Inferencia en CPU o GPU (CUDA) mediante el script `predict.py` incluido.
- Funcionamiento offline una vez descargado el repositorio completo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión ni audio.
- Multilingüismo limitado al chino; no se reporta soporte para otras lenguas.

## Casos de uso

- Categorización automática de catálogos de e-commerce: dado un título de producto en chino, el modelo devuelve una de las 30 categorías, lo que permite asignar automáticamente productos a secciones del catálogo sin intervención manual.
- Enriquecimiento de datos de inventario: integrado en un pipeline de ingestión, el modelo puede etiquetar lotes de títulos provenientes de proveedores antes de su publicación en la plataforma.
- Normalización de taxonomías heredadas: útil en sistemas que ya operan con el esquema de 30 clases y necesitan mantener consistencia mientras migran al estándar de 27 clases.
- Filtrado y moderación de listados: clasificar títulos para detectar productos que caen en categorías restringidas o sensibles dentro de un marketplace.
- Búsqueda y recuperación: usar la categoría predicha como filtro previo en un motor de búsqueda interno para reducir el espacio de candidatos antes del ranking semántico.
- Análisis de tendencias de mercado: clasificar grandes volúmenes de títulos de productos para agregar métricas por categoría y detectar cambios en la composición del catálogo a lo largo del tiempo.
- Prototipado rápido en investigación: servir como baseline de clasificación de texto corto en chino para comparar con modelos posteriores (27 clases, MacBERT, etc.).

## Benchmarks y rendimiento

Evaluación sobre el conjunto de validación completo (11.104 ejemplos), precisión FP32 en PyTorch, ejecutada el 2026-10-28 con el script `ml/evaluate.py`:

| Metrica | Valor |
|---|---:|
| Accuracy | 94,6686 % |
| Macro Precision | 89,0989 % |
| Macro Recall | 87,1758 % |
| Macro F1 | 88,0200 % |
| Weighted F1 | 94,6458 % |
| Top-3 Accuracy | 99,1985 % |

El propio autor advierte que el conjunto de validación se usó para parada temprana y selección de modelo, por lo que estas cifras no constituyen una evaluación sobre test independiente. La macro media se calcula sobre las 30 clases, incluyendo las ausentes con valor 0. El conjunto está desbalanceado: por ejemplo, la clase "书籍" (libros) tiene solo 1 ejemplo y F1 de 0, mientras que "汽车用品" (accesorios de coche) tiene 19 ejemplos y F1 de 60,61 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 1,6 GB para los pesos (409 MB de fichero) más activaciones y overhead de runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier tarjeta moderna; también funciona en CPU.
- Opciones de despliegue: el repositorio incluye `predict.py` con PyTorch; existe una versión ONNX FP32/INT8 en `bangbangkido/Product-Classifier-ONNX-INT8` apta para ONNX Runtime. No es compatible con `pipeline()` ni `AutoModelForSequenceClassification.from_pretrained()` de Transformers, ni con vLLM, TGI o llama.cpp (no es un modelo generativo).
- Latencia y throughput: no disponibles; el autor indica que no se realizaron pruebas de rendimiento en el servidor objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Product-Classifier (este) | no disponible (BERT base) | 48 tokens | 30 | Apache-2.0 | Hugging Face (legacy) |
| product-title-classifier-bert-base-chinese-v2 | no disponible (BERT base) | no disponible | 27 | no disponible | ModelScope |
| product-title-classifier-chinese-macbert-base | no disponible (MacBERT base) | no disponible | 27 | no disponible | ModelScope |
| Product-Classifier-MacBERT | no disponible (MacBERT base) | no disponible | no disponible | no disponible | Hugging Face |

Las alternativas del mismo autor comparten la tarea pero emplean el esquema estándar de 27 clases, lo que las hace preferibles para nuevos desarrollos. No se dispone de métricas comparativas publicadas entre estas variantes en la información disponible.

## Limitaciones y advertencias

- Modelo marcado como legacy: el esquema de 30 clases es incompatible con el estándar de 27 clases del autor; no debe mezclarse con la familia `product-title-classifier-*`.
- Ventana de contexto muy corta (48 tokens): títulos más largos se truncan, lo que puede degradar la clasificación de descripciones extensas.
- Métricas reportadas sobre validación, no sobre test independiente; el conjunto de validación participó en la parada temprana, por lo que las cifras pueden estar optimistamente sesgadas.
- Fuerte desbalanceo de clases: categorías con muy pocos ejemplos presentan F1 nulo o muy bajo (por ejemplo, "书籍" con 1 ejemplo y F1 = 0).
- Cualquier entrada fuera del rango de las 30 clases se asigna igualmente a una de ellas; no existe mecanismo de rechazo ni clase "desconocida".
- Solo soporta chino; no se ha validado para otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en títulos ambiguos o con jerga de mercado.
- No es cargable con la API estándar de Transformers; requiere el código incluido en el repositorio.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia y licencia de los datos de entrenamiento originales, que el autor declara publicar bajo la misma licencia.
- No se han realizado pruebas de rendimiento ni de latencia en producción.

## Enlaces

- Hugging Face (modelo principal): https://huggingface.co/bangbangkido/Product-Classifier
- Hugging Face (versión ONNX FP32/INT8): https://huggingface.co/bangbangkido/Product-Classifier-ONNX-INT8
- Hugging Face (variante MacBERT): https://huggingface.co/bangbangkido/Product-Classifier-MacBERT
- ModelScope (27 clases, BERT v2): https://www.modelscope.cn/models/bangbangkido/product-title-classifier-bert-base-chinese-v2
- ModelScope (27 clases, MacBERT): https://www.modelscope.cn/models/bangbangkido/product-title-classifier-chinese-macbert-base
- Modelo base: https://huggingface.co/google-bert/bert-base-chinese
