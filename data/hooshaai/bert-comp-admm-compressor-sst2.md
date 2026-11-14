# Hooshaai/bert-comp-admm-compressor-sst2

## Resumen

`bert-comp-admm-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado en GLUE SST-2 y procesado con el motor `ADMMCompressor` de la librería NeuralOps, un compresor que combina poda estructurada conjunta y cuantización uniforme mediante el algoritmo ADMM (Alternating Direction Method of Multipliers). El modelo lo publica el usuario Hooshaai bajo licencia MIT y está pensado como artefacto de demostración del "Compressor Zoo" de NeuralOps, no como un clasificador de sentimiento listo para producción.

El dato clave es que, pese a la etiqueta de "comprimido", el checkpoint empaquetado no reduce parámetros: mantiene los 109.483.778 parámetros del BERT-Base original (ratio de compresión 1,00x, reducción del 0,00%). Las cuatro configuraciones evaluadas (k=256, 128, 64 y 32) arrojan exactamente el mismo recuento de parámetros y la misma accuracy, lo que sugiere que la poda no llegó a materializarse físicamente en este artefacto concreto. La accuracy declarada en validación de SST-2 es del 83,26%, frente al 91,63% del profesor original, una pérdida de 8,37 puntos.

Es relevante ahora porque ilustra el estado actual de las herramientas de compresión post-entrenamiento para transformers pequeños: el pipeline (poda ADMM + posible "LoRA healing" con r=8 y 50 pasos) está bien instrumentado y genera telemetría reproducible, pero el resultado publicado no demuestra ganancia de eficiencia. Para quien evalúe modelos, sirve como caso de estudio de cómo verificar que una compresión es real y no solo nominal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT-Base estándar: 512 tokens) |
| Tipos de cuantizacion | Cuantización uniforme aplicada por `ADMMCompressor` (detalles de bits no disponibles); pesos serializados en `pytorch_model.bin` |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict), `config.json`, `compression_summary.json`, assets de tokenizer BERT (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La base es BERT-Base uncased: un transformer encoder de 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado por Google y afinado aquí para clasificación de sentimiento binaria (2 etiquetas) sobre GLUE SST-2. Sobre ese modelo se aplica el compresor `admm_compressor` de NeuralOps, que formula la poda estructurada y la cuantización uniforme como un problema conjunto resuelto con ADMM. El pipeline incluye una fase de recuperación con LoRA de rango r=8 (50 pasos, learning rate 2e-4, presupuesto de 45 segundos) que se activa cuando la compresión zero-shot degrada más de 2,0 puntos con un ratio superior a 1,10x.

En la práctica, el checkpoint empaquetado corresponde al rango k=32 y, según la model card, tiene `LoRA Recovery Applied: False`. Los cuatro rangos evaluados producen idéntico recuento de parámetros (109.483.778) e idéntica accuracy (83,26%), de modo que la compresión física es de 1,00x. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo RLHF o DPO (no aplicable en un clasificador de este tipo). La evaluación se realizó en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, salida de 2 logits.
- Clasificación de texto corto en general, heredada del encoder BERT-Base.
- Comprensión contextual bidireccional hasta la longitud máxima de BERT-Base (no confirmada explícitamente en la información disponible).
- Extracción de representaciones (embeddings de 768 dimensiones) reutilizables para tareas downstream.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo "thinking".
- Multilingüismo: limitado a inglés (tokenizer uncased inglés).

## Casos de uso

- **Clasificación de reseñas de producto en inglés**: el modelo devuelve directamente una etiqueta de polaridad para textos cortos, adecuado para lotes de moderación o análisis de opinión donde la latencia importa más que la precisión estado del arte.
- **Filtrado previo en pipelines de análisis de sentimiento**: usar el modelo como primera etapa barata que descarte casos claros y derive los ambiguos a un modelo mayor; su tamaño (≈450 MB) permite desplegarlo en CPU.
- **Análisis de opinión en redes sociales en inglés**: clasificación de tuits y comentarios cortos; el dominio SST-2 (reseñas de películas) está razonablemente alineado con texto informal.
- **Etiquetado asistido para curación de datasets**: generar etiquetas preliminares que luego revisa un humano, aceptando el 83,26% de accuracy como techo y midiendo la tasa de corrección.
- **Banco de pruebas de herramientas de compresión**: caso de estudio para validar pipelines de poda ADMM y comparar la telemetría de `compression_summary.json` contra el comportamiento real del checkpoint.
- **Extracción de embeddings para clustering o búsqueda semántica**: reutilizar el encoder de 768 dimensiones como extractor de características en tareas de recuperación o agrupamiento de textos en inglés.
- **Evaluación comparativa de métodos de compresión**: servir de baseline "sin compresión efectiva" frente a otros artefactos del Compressor Zoo que sí reduzcan parámetros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Modelo | Dataset / split | Métrica | Valor |
|---|---|---|---|
| `bert-comp-admm-compressor-sst2` (k=32) | GLUE SST-2, validation (872 muestras) | Accuracy | 83,26% |
| Profesor `google-bert/bert-base-uncased` (baseline) | GLUE SST-2, validation | Accuracy | 91,63% |
| Delta de paridad frente al profesor | — | Accuracy | -8,37 puntos |

Desglose por rango de compresión (todos idénticos según la model card):

| Rank (k) | Ratio físico | Parámetros | Zero-shot Acc | Acc tras healing |
|---|---|---|---|---|
| 256 | 1,00x | 109.483.778 | 83,26% | 83,26% |
| 128 | 1,00x | 109.483.778 | 83,26% | 83,26% |
| 64 | 1,00x | 109.483.778 | 83,26% | 83,26% |
| 32 (empaquetado) | 1,00x | 109.483.778 | 83,26% | 83,26% |

No se han publicado resultados de MMLU, HumanEval ni GSM8K (no aplicables a este modelo). No se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 451,9 MB, por lo que la inferencia en fp32 requiere aproximadamente 0,5 GB de VRAM más memoria de activaciones; en fp16, en torno a 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la evaluación del autor se hizo en una NVIDIA GeForce RTX 3090 (24 GB), sobredimensionada para este modelo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: la carga requiere el paquete `neuralops` (reconstrucción de la topología comprimida antes de cargar el state dict); también es posible cargar el `pytorch_model.bin` con `transformers` sobre un `BertForSequenceClassification` con `strict=False`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-admm-compressor-sst2` | 109,5 M | no disponible (BERT-Base: 512) | 83,26% | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 | 91,63% (declarado por el autor) | Apache 2.0 | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la información proporcionada | Apache 2.0 | Hugging Face, `transformers` estándar |
| `roberta-base` afinado en SST-2 | 125 M | 512 | no disponible en la información proporcionada | MIT | Hugging Face, `transformers` estándar |

La comparación relevante es contra el propio profesor: el checkpoint comprimido pierde 8,37 puntos de accuracy sin ganar reducción de parámetros, lo que lo sitúa por debajo del modelo original en el eje precisión-eficiencia. Frente a alternativas más pequeñas como DistilBERT, la ventaja de tamaño tampoco se materializa.

## Limitaciones y advertencias

- La compresión es nominal: 1,00x de ratio y 0,00% de reducción de parámetros en los cuatro rangos evaluados; no hay ahorro real de memoria ni de cómputo.
- Pérdida de 8,37 puntos de accuracy frente al profesor (91,63% → 83,26%), sin recuperación LoRA aplicada en el checkpoint empaquetado.
- La accuracy declarada está marcada como no verificada (`verified: false`) y procede únicamente del autor.
- Sesgos: hereda los sesgos de `bert-base-uncased` preentrenado en corpus web en inglés; no se documenta ninguna mitigación.
- Riesgo de alucinación conceptual: al ser un clasificador, el riesgo se traduce en falsos positivos/negativos de polaridad, especialmente en dominios distintos de reseñas de películas.
- Idioma: solo inglés; el tokenizer uncased no maneja bien texto multilingüe ni acentos no ingleses.
- Dominio: afinado exclusivamente en SST-2 (reseñas de películas); el rendimiento en otros dominios (finanzas, atención al cliente, redes sociales) no está medido.
- Dependencia de la librería `neuralops` para reconstruir la topología antes de cargar los pesos; el `pytorch_model.bin` no es directamente compatible con un `from_pretrained` estándar de `transformers`.
- El código de ejemplo de la model card referencia el repo `tahamajs/bert-comp-admm-compressor-sst2`, distinto del ID real `Hooshaai/bert-comp-admm-compressor-sst2`; hay que ajustar el identificador.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0; conviene revisar la compatibilidad en producción.
- No apto como componente crítico sin validación propia en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-admm-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor ADMM: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/admm_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
