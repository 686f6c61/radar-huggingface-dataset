# Galactic-YoYo/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`Galactic-YoYo/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) de `distilbert-base-uncased`, publicado por el usuario Galactic-YoYo en HuggingFace. Por el nombre del repositorio, la tarea parece ser una clasificación binaria del tipo "comida / no comida", aunque la model card no especifica el número de etiquetas ni su significado. El modelo tiene 66.955.010 parámetros en formato safetensors y ocupa 0,3 GB en el repositorio.

Se trata de un encoder transformer de 6 capas y 768 dimensiones ocultas, la arquitectura estándar de DistilBERT (destilada de BERT-base), sobre la que se ha añadido una cabeza de clasificación de secuencias. El ajuste fino se realizó con 10 épocas, learning rate 1e-4 y batch size 32, alcanzando una accuracy de 1,0 y una pérdida de validación de 0,0005 sobre un conjunto de evaluación cuyo tamaño no se declara.

Su relevancia es limitada y muy acotada: no es un modelo de propósito general ni compite en benchmarks de razonamiento o generación, sino un ejemplo típico de clasificador ligero entrenado con la librería `transformers` (etiqueta `generated_from_trainer`). Resulta útil como referencia de pipeline de clasificación de bajo coste (inferencia en CPU, modelo de menos de 300 MB en fp32) y como caso de estudio de los riesgos de sobreajuste cuando el conjunto de datos no se documenta y la accuracy reportada es perfecta desde la primera época.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT): 6 capas, 12 cabezas de atención, 768 dimensiones ocultas, destilado de BERT-base |
| Parámetros totales | 66.955.010 (según safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (máximo de posiciones de `distilbert-base-uncased`; no declarado en la model card) |
| Tipos de cuantización | no disponible en la model card; los pesos se distribuyen en fp32 y son convertibles a fp16/int8 (cuantización dinámica) u ONNX |
| Idiomas soportados | no disponible; el tokenizer base es WordPiece *uncased* en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`); repositorio de 0,3 GB |
| Tarea (pipeline) | `text-classification` |
| Número de etiquetas | no disponible |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Vocabulario | 30.522 tokens (WordPiece, minúsculas) |
| Versiones de entrenamiento | Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5, Tokenizers 0.23.2 |
| Compatibilidad declarada | `text-embeddings-inference`, `endpoints_compatible` |
| Fecha de creación / actualización | 2026-10-18 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT, un transformer encoder de 6 capas y 768 dimensiones ocultas (unos 66 millones de parámetros) obtenido por destilación de conocimiento de BERT-base: reduce el número de capas a la mitad y, según el paper original, es aproximadamente un 40 % más pequeño y un 60 % más rápido que BERT-base manteniendo en torno al 97 % del rendimiento de este en GLUE. Sobre ese encoder se añade una cabeza de clasificación de secuencia, cuyo número de etiquetas no se documenta. El tokenizer es WordPiece en minúsculas con 30.522 entradas.

El ajuste fino se realizó durante 10 épocas con learning rate 1e-4, batch size de 32 en entrenamiento y evaluación, optimizador AdamW (variante *fused*, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y semilla 42. El registro de entrenamiento muestra un total de 70 pasos, es decir, 7 pasos por época, lo que con batch 32 implica del orden de 220 ejemplos de entrenamiento (estimación derivada de los pasos, no declarada por el autor). El conjunto de datos se describe literalmente como "unknown dataset" y no se aporta información sobre su composición, proceso de anotación ni posible uso de RLHF/DPO (no procede en un clasificador). La pérdida de validación cae de 0,0395 en la época 1 a 0,0005 en la época 7 y se mantiene plana hasta la 10, con accuracy 1,0 en todas las épocas: un patrón compatible con un conjunto de evaluación muy pequeño y con sobreajuste.

## Capacidades

- Clasificación de texto (pipeline `text-classification`): asigna una etiqueta a una secuencia de entrada, presumiblemente en un esquema binario "comida / no comida" según el nombre del repositorio.
- Entrada de hasta 512 tokens, suficiente para títulos, descripciones cortas de producto, resúmenes de recetas o mensajes de usuario.
- Inferencia muy ligera: 66,9 millones de parámetros permiten ejecución en CPU con latencias de milisegundos y sin GPU.
- Multilingüismo: no declarado. El tokenizer base está entrenado sobre corpus en inglés y en minúsculas, por lo que el comportamiento con castellano u otros idiomas no está garantizado ni evaluado.
- Tool calling / function calling: no soportado (no es un modelo generativo ni ha sido entrenado para ello).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multimodales (visión, audio): no soportadas.
- Modo "thinking" o decodificación especulativa: no aplica.

## Casos de uso

- Filtrado de contenido en una app de recetas: el clasificador puede etiquetar títulos y descripciones enviadas por usuarios como relacionadas o no con comida antes de publicarlas; sus 512 tokens cubren de sobra textos cortos y el coste por petición en CPU es mínimo.
- Enrutado de tickets de soporte en un marketplace alimentario: separar consultas sobre productos alimentarios de incidencias de envío, facturación o cuenta, usando la etiqueta del modelo como primera señal en un clasificador en cascada.
- Etiquetado de catálogo de productos: preclasificar automáticamente descripciones de SKU para decidir si entran en la categoría de alimentación, con revisión humana posterior dado que no hay métricas fiables de generalización.
- Curación y limpieza de datasets: usar el modelo como filtro débil para descartar muestras ajenas al dominio alimentario en un corpus mayor, combinándolo con reglas y con un segundo clasificador de mayor calidad.
- Moderación de publicaciones en comunidades o foros: detectar contenido fuera de temática en un foro gastronómico, como paso previo a la revisión por moderadores.
- Prototipado y docencia: servir de ejemplo ejecutable de un pipeline de clasificación con `transformers` (fine-tuning con `Trainer`, exportación a safetensors, despliegue en Inference Endpoints), replicable en una máquina sin GPU.
- Preetiquetado en anotación activa: generar etiquetas iniciales para que los anotadores humanos solo corrijan, reduciendo el coste de construcción de un dataset propio, siempre con validación sobre datos reales.

## Benchmarks y rendimiento

El `model-index` del repositorio no contiene resultados (`results: []`), por lo que no se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos son las métricas de validación del propio entrenamiento, declaradas por el autor:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Accuracy |
|:---:|:---:|:---:|:---:|:---:|
| 1 | 7 | 0,3402 | 0,0395 | 1,0 |
| 2 | 14 | 0,0199 | 0,0048 | 1,0 |
| 3 | 21 | 0,0038 | 0,0018 | 1,0 |
| 4 | 28 | 0,0018 | 0,0010 | 1,0 |
| 5 | 35 | 0,0011 | 0,0007 | 1,0 |
| 6 | 42 | 0,0008 | 0,0006 | 1,0 |
| 7 | 49 | 0,0007 | 0,0005 | 1,0 |
| 8 | 56 | 0,0006 | 0,0005 | 1,0 |
| 9 | 63 | 0,0006 | 0,0005 | 1,0 |
| 10 | 70 | 0,0006 | 0,0005 | 1,0 |

Resultado final declarado: pérdida 0,0005 y accuracy 1,0 en el conjunto de evaluación. No se indica el tamaño de dicho conjunto ni la métrica F1, precisión o recall por clase.

## Requisitos de hardware

- VRAM estimada: unos 268 MB en fp32 (66,9 M de parámetros × 4 bytes), ~134 MB en fp16 y ~67 MB en int8. Cabe holgadamente en cualquier GPU con 1 GB o más.
- GPU recomendadas: ninguna en particular; es un modelo pensado para CPU. Cualquier GPU consumer (GTX 1650, RTX 3050, RTX 4090) lo ejecuta con ocupación de memoria irrelevante, y una A100 o H100 estaría completamente sobredimensionada.
- Cabe en GPU consumer: sí, en todas, incluidas integradas con suficiente memoria compartida.
- Despliegue: pipeline de `transformers` (`text-classification`), Text Embeddings Inference (el repositorio está etiquetado como `text-embeddings-inference` y `endpoints_compatible`), exportación a ONNX Runtime para inferencia en CPU, TorchScript, o servicio propio con FastAPI/Uvicorn. No es un caso de uso de vLLM ni TGI, orientados a modelos generativos.
- Latencia y throughput: no se han publicado medidas en la información disponible. Por tamaño, el batching en CPU es viable para volúmenes moderados, pero no hay cifras verificables que citar.
- Almacenamiento: 0,3 GB de repositorio; los pesos en fp32 son el componente principal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune de DistilBERT) | 66.955.010 | 512 tokens | Clasificación de texto (etiquetas no documentadas) | apache-2.0 | HuggingFace, 0 descargas, 1 like |
| `distilbert/distilbert-base-uncased` (base) | 66.955.010 | 512 tokens | Modelo de lenguaje enmascarado (encoder) | apache-2.0 | HuggingFace, ampliamente usado |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 tokens | Análisis de sentimiento binario | apache-2.0 | HuggingFace, Pipeline oficial |
| `bert-base-uncased` | 109.482.240 | 512 tokens | Modelo de lenguaje enmascarado (encoder) | apache-2.0 | HuggingFace |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22,7 M | 256 tokens | Embeddings de frases / similitud | apache-2.0 | HuggingFace, muy usado en RAG |

Frente a ellos, este modelo no aporta métricas comparables publicadas: la ventaja de tamaño frente a BERT-base es la propia de DistilBERT (aproximadamente la mitad de capas y un 40 % menos de parámetros), pero su calidad real fuera del conjunto de validación no está medida. La alternativa `distilbert-base-uncased-finetuned-sst-2-english` ofrece un clasificador binario documentado y ampliamente evaluado, aunque para otra tarea.

## Limitaciones y advertencias

- Sobreajuste probable: accuracy 1,0 y pérdida 0,0005 desde épocas tempranas, con un conjunto de evaluación de tamaño no declarado, indican que la métrica no es representativa de un uso en producción.
- Dataset de entrenamiento desconocido ("unknown dataset"): no se puede evaluar la distribución de los datos, el equilibrio entre clases, la calidad del etiquetado ni la reproducibilidad del resultado.
- Model card generada automáticamente e incompleta: las secciones de descripción, usos previstos y datos de entrenamiento contienen "More information needed".
- Número y semántica de las etiquetas no documentados; hay que inspeccionar `config.json` para conocer el mapeo `id2label` antes de integrarlo.
- Limitación de idioma: el tokenizer base es inglés y en minúsculas; no hay evaluación en castellano ni en otros idiomas, y el campo de idiomas del repositorio está vacío.
- Ventana de 512 tokens: los documentos más largos deben truncarse o dividirse, con pérdida de contexto.
- Sin datos de calibración: las probabilidades de salida no están validadas, por lo que no deben usarse umbrales de confianza sin recalibración previa.
- Riesgo de alucinación en sentido estricto: no aplica (no genera texto), pero sí puede asignar etiquetas con alta confianza a entradas fuera de distribución.
- Sesgos: imposibles de evaluar al no conocerse el corpus; cualquier sesgo presente en los datos de ajuste quedará reflejado en el clasificador.
- Licencia apache-2.0: permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y sin garantías por parte del autor.
- Advertencia de producción: no se recomienda desplegarlo en un flujo crítico sin una evaluación propia sobre datos reales etiquetados (F1 por clase, matriz de confusión y análisis de errores).
- Metadatos incoherentes: las fechas de creación y actualización (2026-10-18) y las versiones de framework (Transformers 5.18.0, PyTorch 2.11.0) no coinciden con versiones estables publicadas en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Galactic-YoYo/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019), referencia de la arquitectura base: https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018), arquitectura original de la que deriva: https://arxiv.org/abs/1810.04805
- Documentación de `Trainer` de Transformers (procedencia declarada `generated_from_trainer`): https://huggingface.co/docs/transformers/main_classes/trainer
