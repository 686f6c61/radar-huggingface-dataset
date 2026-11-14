# Hooshaai/bert-comp-residual-svd-compressor-sst2

## Resumen
El modelo `Hooshaai/bert-comp-residual-svd-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente mediante la técnica `ResidualSVDCompressor` (Spectral Residual LoRA) de la librería NeuralOps, y posteriormente "curado" con adaptadores LoRA para recuperar parte de la precisión perdida en la compresión. Está especializado en clasificación de sentimiento binaria sobre el conjunto GLUE SST-2 y forma parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un catálogo de modelos comprimidos orientado a la experimentación con técnicas de reducción de parámetros.

El problema que aborda es el de la compresión de modelos transformer: reducir el número de parámetros de un BERT-Base (109,48 M) hasta los 68,34 M (una reducción del 37,58 %, ratio 1,602x) manteniendo una precisión razonable en una tarea concreta. El checkpoint empaquetado corresponde al rango `k=256` y alcanza un 80,39 % de accuracy en la validación de SST-2, frente al 91,63 % del modelo profesor original, lo que supone una pérdida de 11,24 puntos porcentuales.

Es relevante ahora como referencia práctica y reproducible para quienes investigan compresión de modelos, puesto que el autor publica telemetría completa en varios rangos (`k=256, 128, 64, 32`), el código de reconstrucción y las métricas intermedias de compresión zero-shot y tras el "healing" con LoRA. No obstante, conviene señalar que el rendimiento final queda lejos del modelo base y que la librería `neuralops` es necesaria para cargar el checkpoint, lo que limita su uso directo con `transformers` estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta D=768), comprimido con ResidualSVDCompressor (Spectral Residual LoRA) |
| Parametros totales | 68.343.554 (checkpoint comprimido empaquetado, k=256); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-Base admite 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch con factores de bajo rango y adaptadores LoRA integrados); no se ofrece GGUF ni safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es un transformer encoder BERT-Base de 12 capas y dimensión oculta 768, afinado previamente sobre GLUE SST-2. Sobre ese modelo se aplica el operador `ResidualSVDCompressor` (familia `svd`), que realiza una adaptación de bajo rango sobre los residuos espectrales de los pesos (Spectral Residual LoRA / Res-SVD). La compresión se materializa físicamente en el checkpoint: el estado serializado contiene los factores de bajo rango y, cuando procede, los adaptadores LoRA de recuperación ya integrados.

El proceso de compresión se evalúa en cuatro rangos (`k=256, 128, 64, 32`) sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA dirigido (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s). El checkpoint empaquetado corresponde al rango `k=256` con healing aplicado. No se especifican en la información disponible el volumen total de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO.

## Capacidades
- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, orientada específicamente a la tarea GLUE SST-2.
- Generación de logits de clasificación para dos clases mediante `BertForSequenceClassification` con `num_labels=2`.
- Compresión física verificable: el checkpoint empaquetado contiene 68.343.554 parámetros, un 37,58 % menos que el modelo base.
- Integración con la API de NeuralOps (`compress_model`, `load_surgeried_model`) para reconstruir la topología comprimida y cargar los pesos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés (etiqueta `en`); no se declaran otros idiomas.

## Casos de uso
- Clasificación de sentimiento en pipelines de análisis de opiniones: el modelo puede etiquetar reseñas o comentarios en inglés como positivos o negativos, con un 80,39 % de accuracy en SST-2, adecuado para tareas de triaje donde no se requiere la precisión máxima del modelo profesor.
- Investigación en compresión de modelos: sirve como punto de comparación reproducible para evaluar el equilibrio entre ratio de compresión (1,60x) y precisión en una tarea estándar como SST-2, con telemetría publicada para cuatro rangos distintos.
- Despliegue con restricciones de memoria: al ocupar un 37,58 % menos de parámetros que BERT-Base, reduce los requisitos de VRAM y el tamaño del artefacto (130,5 MB de pesos), lo que facilita su inclusión en entornos con recursos limitados.
- Docencia y experimentación con SVD y LoRA: el repositorio incluye el código de reconstrucción y el resumen de telemetría (`compression_summary.json`), lo que permite reproducir el proceso de compresión y healing paso a paso.
- Filtrado previo en sistemas de moderación o análisis de reseñas: como clasificador ligero de polaridad, puede actuar como primera etapa antes de un modelo mayor, aprovechando su menor coste computacional.
- Benchmarking interno de técnicas de compresión: permite comparar el enfoque ResidualSVD frente a otras alternativas (poda, cuantización) sobre una misma tarea y conjunto de datos, usando las métricas zero-shot y healed publicadas.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model-index y en la model card (no verificados de forma independiente; `verified: false` en la model-index):

| Modelo / rango | Ratio de compresion | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA healing | Diferencia vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| BERT-Base profesor (referencia) | 1,00x | 109.483.778 | — | 91,63 % | 0,00 |
| **k=256 (empaquetado)** | 1,60x | 68.343.554 (-37,6 %) | 60,32 % | **80,39 %** | -11,24 |
| k=128 | 2,32x | 47.109.890 (-57,0 %) | 52,75 % | 77,52 % | -14,11 |
| k=64 | 3,00x | 36.493.058 (-66,7 %) | 51,03 % | 75,23 % | -16,40 |
| k=32 | 3,51x | 31.184.642 (-71,5 %) | 51,15 % | 71,33 % | -20,30 |

Evaluación realizada sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). El healing con LoRA emplea `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 s.

## Requisitos de hardware
- VRAM estimada para inferencia: no se publica una cifra exacta; con 68,34 M de parámetros en precisión completa (fp32) el checkpoint ronda los 130,5 MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB); por tamaño, el modelo es viable en GPUs mucho más modestas (RTX 3060, RTX 4060, T4, etc.), aunque no se aportan mediciones en esas tarjetas.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: la carga requiere la librería `neuralops` para reconstruir la topología comprimida (`compress_model` con `residual_svd_compressor`, rango 256) y cargar el state dict con `strict=False`. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI; el formato `pytorch_model.bin` y la dependencia de `neuralops` limitan el uso de estos runners sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Formato / dependencia |
|---|---:|---|---:|---|---|
| **Este modelo (k=256)** | 68,34 M | No disponible | 80,39 % | MIT | `pytorch_model.bin` + `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 109,48 M | 512 tokens (BERT-Base estándar) | 91,63 % (referencia del autor) | Apache 2.0 | safetensors / `transformers` |
| Variantes comprimidas del mismo zoo (k=128, k=64, k=32) | 47,11 M / 36,49 M / 31,18 M | No disponible | 77,52 % / 75,23 % / 71,33 % | MIT | `pytorch_model.bin` + `neuralops` |

No se dispone de datos de otros modelos comparables de la misma categoría (clasificadores SST-2 comprimidos de terceros) en la información proporcionada.

## Limitaciones y advertencias
- Pérdida de precisión significativa: 80,39 % frente al 91,63 % del modelo profesor, una diferencia de 11,24 puntos porcentuales; el modelo no es equivalente en calidad al BERT-Base original.
- Dependencia de la librería `neuralops`: el checkpoint no se carga con `transformers` estándar sin reconstruir previamente la topología comprimida, lo que añade complejidad de integración y un riesgo de mantenimiento si la librería cambia.
- Ámbito muy restringido: está afinado exclusivamente para clasificación de sentimiento binaria en inglés sobre SST-2; no debe esperarse un comportamiento correcto en otras tareas de clasificación o en otros idiomas.
- Riesgo de alucinación y sesgos: no se documentan análisis de sesgo ni evaluaciones de robustez; al derivar de `bert-base-uncased`, hereda los sesgos del corpus original de BERT, no cuantificados en esta ficha.
- Métricas no verificadas: la accuracy de 80,39 % figura con `verified: false` en la model-index y procede únicamente del autor.
- Licencia MIT: permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0; conviene revisar ambas licencias antes de un despliegue en producción.
- Sin datos de cuantización, latencia ni throughput publicados, lo que dificulta planificar un despliegue en producción con garantías de rendimiento.
- El repositorio tiene un tamaño de 0,1 GB y solo 48 descargas, con nula adopción comunitaria (0 likes); no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces
- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-residual-svd-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/residual_svd_compressor.py
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
