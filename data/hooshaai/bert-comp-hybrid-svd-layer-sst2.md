# Hooshaai/bert-comp-hybrid-svd-layer-sst2

## Resumen

`Hooshaai/bert-comp-hybrid-svd-layer-sst2` es un checkpoint de `google-bert/bert-base-uncased` comprimido físicamente mediante la técnica `hybrid_svd_layer` (clase `HybridSVDCompressor`) de la librería NeuralOps, y posteriormente "curado" con LoRA para recuperar parte de la precisión perdida. El modelo está afinado para clasificación de sentimiento binaria sobre GLUE SST-2 y se distribuye como ejemplo de la "Compressor Zoo" de NeuralOps. Lo publica el usuario Hooshaai, que replica el repositorio original de `tahamajs` bajo la misma metodología.

La compresión aplica descomposición en valores singulares (SVD) sobre las capas Linear/Conv1D del transformer, reduciendo el rango a `k=32` y bajando de 109.483.778 a 35.222.334 parámetros (reducción del 67,83 %, ratio físico de 3,108x). Sobre ese modelo comprimido se aplica un healing con LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 segundos) para mitigar la caída de precisión.

El resultado es un clasificador BERT-base de 67,3 MB con una accuracy de 69,61 % en la validación de SST-2, frente al 91,63 % del modelo profesor sin comprimir. Es relevante como referencia práctica de hasta dónde se puede comprimir un BERT-base manteniendo un rendimiento utilizable, y como ejemplo reproducible del ecosistema NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), comprimido con SVD híbrido por capas |
| Parametros totales | 35.222.334 (modelo comprimido); 109.483.778 en el modelo base original |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de bert-base-uncased) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango y adaptadores LoRA integrados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-base estándar (12 capas, `D=768`, 109,5 M de parámetros) preentrenado por Google y afinado para clasificación binaria de sentimiento. Sobre ese modelo, NeuralOps aplica `HybridSVDCompressor`, un compresor SVD basado en pesos que descompone las matrices de las capas Linear y Conv1D en factores de bajo rango. En el checkpoint publicado se selecciona el rango `k=32`, lo que reduce el recuento de parámetros a 35,2 M (ratio físico de 3,108x, 67,8 % de ahorro).

El proceso de recuperación ("LoRA healing") se activa cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. En ese caso se entrena un adaptador LoRA de rango 8 durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. Los pesos del adaptador quedan integrados en el state dict final. La evaluación multi-rango se realizó sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento original ni sobre el proceso de afinado SST-2 previo a la compresión.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, específicamente sobre el dominio de reseñas de SST-2.
- Generación de logits de clasificación (2 clases) a partir de texto tokenizado con el vocabulario `bert-base-uncased`.
- Inferencia en CPU y GPU con el stack estándar de Hugging Face Transformers (`BertForSequenceClassification`).
- Carga directa mediante la API de NeuralOps Hub (`load_surgeried_model`) que reconstruye la topología comprimida y carga los pesos en una sola llamada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés; el tokenizador es el `bert-base-uncased` estándar, sin extensión de vocabulario.

## Casos de uso

- Clasificación de reseñas de producto en inglés a bajo coste: el modelo de 35 M de parámetros y 67,3 MB permite desplegar un clasificador de sentimiento en entornos con recursos limitados (CPU, contenedores pequeños) donde un BERT-base completo no cabría.
- Filtrado previo en pipelines de moderación de contenido: usar el modelo comprimido como primera etapa de triaje para descartar reseñas claramente positivas o negativas antes de pasar el resto a un modelo mayor.
- Etiquetado de grandes volúmenes de texto en batch: el reducido tamaño del checkpoint y su naturaleza de clasificador permiten procesar lotes grandes en una sola GPU consumer con throughput alto.
- Prototipado rápido de sistemas de análisis de opinión: la API `load_surgeried_model` permite cargar el modelo en una línea para validar ideas sin gestionar manualmente la reconstrucción de la topología comprimida.
- Docencia e investigación sobre compresión de modelos: sirve como caso de estudio reproducible de SVD + LoRA healing con métricas publicadas para cuatro rangos (`k=256, 128, 64, 32`).
- Evaluación comparativa de técnicas de compresión: al incluir `compression_summary.json` con telemetría de todos los rangos, permite analizar el trade-off entre ratio de compresión y accuracy sin reentrenar.
- Clasificación en dispositivos edge: con 67,3 MB de pesos y sin dependencia de GPU, es viable en dispositivos con memoria limitada para tareas de análisis de sentimiento en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index). La accuracy se mide sobre la partición de validación de GLUE SST-2 (872 muestras). El modelo profesor (`bert-base-uncased` afinado en SST-2) alcanza 91,63 %.

| Rank (`k`) | Ratio físico | Params comprimidos (reducción) | Accuracy zero-shot | Accuracy con LoRA | Diferencia vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 59,52 % | 68,58 % | -23,05 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 52,41 % | 66,97 % | -24,66 % |
| 64 | 3,03x | 36.153.858 (-67,0 %) | 51,26 % | 50,92 % | -40,71 % |
| **32 (publicado)** | **3,11x** | **35.222.334 (-67,8 %)** | **50,92 %** | **69,61 %** | **-22,02 %** |

El checkpoint serializado corresponde a `k=32` con accuracy final de 69,61 % (valor `verified: false` en el model-index). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 35,2 M de parámetros (67,3 MB de pesos), más overhead de activaciones para secuencias de hasta 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 de 24 GB, pero el modelo es sobredimensionado para esa tarjeta.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch + Transformers (`BertForSequenceClassification`), pipeline de Hugging Face, y la API de NeuralOps Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es un state dict comprimido que requiere reconstruir la topología con `compress_model` antes de cargar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-hybrid-svd-layer-sst2` (k=32) | 35,2 M | 512 | 69,61 % | MIT | Hugging Face (NeuralOps) |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,5 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `Hooshaai/svd-linear-attention-distilbert-hybrid-svd-layer` | No disponible | No disponible | No disponible | No disponible | Hugging Face (NeuralOps) |
| `Hooshaai/svd-linear-attention-distilbert-sst2-cosformer` | No disponible | No disponible | No disponible | No disponible | Hugging Face (NeuralOps) |

Los dos modelos alternativos de Hooshaai pertenecen a la misma familia de compresión NeuralOps sobre DistilBERT con atención lineal, pero no se dispone de sus especificaciones ni métricas en la información proporcionada.

## Limitaciones y advertencias

- La accuracy de 69,61 % supone una caída de 22,02 puntos respecto al profesor (91,63 %), lo que limita su uso en producción donde se requiera alta precisión; es un modelo de demostración de compresión, no un clasificador de referencia.
- El resultado del model-index está marcado como `verified: false`; no ha sido validado de forma independiente.
- El comportamiento no es monótono con el rango: `k=64` obtiene peor accuracy (50,92 %) que `k=32` (69,61 %), lo que sugiere inestabilidad en el proceso de healing LoRA y aconseja validar cualquier variante antes de desplegarla.
- El modelo solo clasifica sentimiento binario en inglés y sobre el dominio de SST-2 (reseñas de películas); el rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador, no un generador), pero sí puede producir clasificaciones erróneas confiadas en textos fuera de distribución.
- No se documentan sesgos específicos, pero al heredar el preentrenamiento de `bert-base-uncased` arrastra los sesgos presentes en su corpus.
- La licencia MIT permite uso comercial, aunque el modelo base de Google se distribuye bajo Apache 2.0; conviene revisar la compatibilidad si se redistribuye.
- El checkpoint requiere reconstruir la topología comprimida con NeuralOps antes de cargar los pesos (`strict=False`), por lo que no es un drop-in replacement de un BERT estándar.
- No se publican variantes cuantizadas (GGUF, INT8) ni métricas de latencia/throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-hybrid-svd-layer-sst2
- Repositorio original del autor de la técnica: https://huggingface.co/tahamajs/bert-comp-hybrid-svd-layer-sst2
- Librería NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/hybrid_svd_layer.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
- Modelo relacionado (DistilBERT + atención lineal): https://huggingface.co/Hooshaai/svd-linear-attention-distilbert-hybrid-svd-layer
- Ficha en free2aitools: https://free2aitools.com/model/tahamajs/bert-comp-hybrid-svd-layer-sst2
