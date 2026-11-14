# Hooshaai/bert-comp-coopq-quantizer-sst2

## Resumen

`Hooshaai/bert-comp-coopq-quantizer-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased`, ajustado sobre GLUE SST-2 y procesado con el motor de compresión `coopq_quantizer` de la librería NeuralOps. El modelo se publica como ejemplo ("showcase") del zoo de compresión de NeuralOps, con el rango `k=32` serializado como artefacto principal. Desarrollado por el usuario Hooshaai, el repositorio tiene 43 descargas y 0 likes en el momento de la consulta.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general ni de un LLM, sino de un BERT-Base de 109.483.778 parámetros (12 capas, dimensión oculta 768) para clasificación binaria de sentimiento en inglés. El interés técnico reside en el pipeline de compresión aplicado, no en el modelo en sí. Cabe señalar que, según la propia model card, el checkpoint serializado no reduce parámetros (`1.00x`, `-0.0%`): el ratio de compresión física es nulo en el rango empaquetado.

El modelo declara una accuracy del 91,63% en el split de validación de GLUE SST-2, idéntica a la del profesor original, y mantiene esa cifra en todos los rangos evaluados (`k=256, 128, 64, 32`). Por tanto, el resultado práctico es un BERT-Base estándar para SST-2 con metadatos de compresión, sin ganancia medible en tamaño ni en precisión respecto al baseline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base): 12 capas, dimensión oculta 768 |
| Parámetros totales | 109.483.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base estándar: 512 tokens, no confirmado en la información) |
| Tipos de cuantización | Compresión `coopq_quantizer` (NeuralOps); niveles de bits no especificados |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado); tokenizer BERT estándar (`vocab.txt`, `tokenizer.json`) |

## Arquitectura y entrenamiento

La arquitectura base es BERT-Base uncased, un transformer encoder de 12 capas con 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado por Google y ajustado aquí para clasificación binaria sobre GLUE SST-2 (2 etiquetas). Sobre ese checkpoint se aplica el compresor `coopq_quantizer` (familia `quantization`, clase `coopq_factory`) de NeuralOps, con evaluación Pareto en los rangos `k=256, 128, 64, 32`.

La model card indica que, cuando la compresión zero-shot degrada más de 2,0 puntos porcentuales con una reducción superior a 1,10x, NeuralOps aplica un "LoRA healing" con `r=8`, 50 pasos y `lr=2e-4` en un presupuesto de 45 segundos. En este caso, sin embargo, el rango empaquetado (`k=32`) no aplicó recuperación LoRA (`LoRA Recovery Applied: False`) y no produjo reducción de parámetros. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable a un clasificador de este tipo).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre texto de una sola frase o párrafo corto.
- Ajuste específico sobre GLUE SST-2, con salida de 2 logits.
- Inferencia estándar de `BertForSequenceClassification` mediante `transformers`.
- Carga vía API de NeuralOps (`load_surgeried_model`) además del flujo estándar de reconstrucción y carga del state dict.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión ni audio.
- Capacidad multilingüe limitada al inglés (modelo uncased de vocabulario inglés).

## Casos de uso

- Análisis de sentimiento en reseñas de producto en inglés: el modelo clasifica texto corto en positivo/negativo con una accuracy declarada del 91,63% en SST-2, suficiente para triaje automatizado de opiniones a escala.
- Moderación de comentarios en foros angloparlantes: filtrado previo de mensajes con carga negativa antes de la revisión humana, usando la salida de 2 logits como señal de prioridad.
- Monitorización de reputación de marca: procesamiento por lotes de menciones en redes sociales en inglés para agregar tendencia de sentimiento por periodo.
- Enriquecimiento de pipelines de datos: etiquetado automático de sentimiento en corpus no anotados como paso previo a análisis estadístico o entrenamiento de modelos mayores.
- Evaluación comparativa de técnicas de compresión: uso del checkpoint como referencia en experimentos con NeuralOps para medir el efecto de `coopq_quantizer` frente al baseline BERT-Base en SST-2.
- Prototipado de clasificadores ligeros: punto de partida para fine-tuning adicional sobre dominios específicos (reseñas financieras, tickets de soporte) en inglés.
- Docencia y reproducción de experimentos: ejemplo reproducible del flujo de compresión y "healing" de NeuralOps sobre un modelo pequeño y bien conocido.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`).

| Modelo / configuración | Dataset | Métrica | Valor |
|---|---|---|---|
| `bert-comp-coopq-quantizer-sst2` (k=32, empaquetado) | GLUE SST-2, validation | Accuracy | 91,63% |
| Profesor `bert-base-uncased` (baseline) | GLUE SST-2, validation | Accuracy | 91,63% |
| Rango k=256 | GLUE SST-2, validation | Accuracy | 91,63% |
| Rango k=128 | GLUE SST-2, validation | Accuracy | 91,63% |
| Rango k=64 | GLUE SST-2, validation | Accuracy | 91,63% |

Evaluación realizada sobre 872 muestras del split de validación de GLUE SST-2 en una NVIDIA GeForce RTX 3090 (24 GB). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en FP32 (208,9 MB de pesos), menos de 0,3 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch (flujo estándar), API de NeuralOps (`load_surgeried_model`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-coopq-quantizer-sst2` | 109.483.778 | no disponible | 91,63% (declarado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (fine-tuned SST-2) | 109.483.778 | 512 tokens | 91,63% (referencia del autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `roberta-base` (fine-tuned SST-2) | ~125 M | 512 tokens | no disponible en esta ficha | MIT | Hugging Face |

La comparativa se limita a lo documentado; no se dispone de resultados de los modelos alternativos en la información proporcionada, por lo que no se incluyen cifras no verificadas.

## Limitaciones y advertencias

- El checkpoint empaquetado no reduce parámetros (`1.00x`, `-0.0%`): no aporta ventaja de tamaño frente al BERT-Base original.
- La accuracy declarada es idéntica a la del profesor en todos los rangos, lo que sugiere que la compresión no altera el comportamiento, pero también que no hay mejora medible.
- El resultado de 91,63% está marcado como `verified: false`; no ha sido validado de forma independiente.
- Entrenado y evaluado solo en inglés; no apto para otros idiomas sin fine-tuning.
- Clasificador binario de sentimiento: no genera texto, no razona y no soporta tareas generativas.
- Riesgo de alucinación no aplicable en sentido estricto, pero sí de clasificaciones erróneas en dominios distintos de SST-2 (sarcasmo, jerga, texto largo).
- Sesgos heredados del corpus de preentrenamiento de BERT-Base (sesgos de género, raza y dominio web).
- Licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base (Apache 2.0) y las condiciones de NeuralOps.
- Dependencia de la librería `neuralops` para reconstruir la topología comprimida; sin ella, la carga del state dict puede fallar o requerir `strict=False`.
- Longitud de contexto no confirmada en la información; asumir el límite estándar de BERT (512 tokens) con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-coopq-quantizer-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/coopq_quantizer.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
