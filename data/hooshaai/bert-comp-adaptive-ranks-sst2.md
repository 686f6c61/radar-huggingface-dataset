# Hooshaai/bert-comp-adaptive-ranks-sst2

## Resumen

`bert-comp-adaptive-ranks-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado en GLUE SST-2 y posteriormente comprimido mediante la técnica `AdaptiveRanksCompressor` de la librería NeuralOps. El autor, Hooshaai, publica este modelo como parte de un "compressor zoo" que documenta el impacto de la compresión SVD con selección dinámica de rango por capa, seguida de un proceso de "curación" mediante LoRA para recuperar parte de la precisión perdida. El checkpoint serializado corresponde al rango de exhibición `k=256`, que reduce el número de parámetros un 38,77 % (de 109,48 M a 67,03 M) manteniendo una precisión del 75,80 % en la validación de SST-2.

El modelo no pretende competir con BERT-base en calidad: su valor es metodológico. Documenta de forma transparente la curva de Pareto entre ratio de compresión y precisión para cuatro rangos (`k=256, 128, 64, 32`), con y sin curación LoRA, lo que lo convierte en una referencia útil para quienes investigan compresión de modelos o necesitan desplegar clasificadores de sentimiento con requisitos estrictos de memoria. La licencia MIT y el formato de pesos estándar (`pytorch_model.bin` más `config.json`) facilitan su integración, aunque la reconstrucción del grafo comprimido requiere la librería NeuralOps.

Es relevante ahora porque ejemplifica una tendencia creciente: publicar artefactos de investigación reproducibles con telemetría detallada (`compression_summary.json`) en lugar de solo pesos finales. Para un blog técnico, sirve como caso de estudio concreto de hasta dónde llega la compresión SVD en un transformer pequeño y qué coste en precisión implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas, dimensión oculta 768), comprimido con SVD de rangos adaptativos |
| Parametros totales | 67.034.882 (comprimido, `k=256`); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base-uncased soporta 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en precisión completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer estándar de BERT |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas con 109,48 M de parámetros, afinado previamente en GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint se aplica `AdaptiveRanksCompressor`, un operador de compresión basado en descomposición en valores singulares (SVD) que selecciona el rango de truncamiento de forma dinámica por capa según el espectro de energía de los valores singulares. En el rango de exhibición `k=256` se obtiene una reducción física del 38,77 % de parámetros (ratio de compresión 1,633x).

Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica una "curación" LoRA dirigida: adaptadores de rango `r=8`, 50 pasos de entrenamiento con `lr=2e-4` y un presupuesto de 45 segundos. En el caso de `k=256`, la precisión zero-shot cae al 59,52 % y la curación LoRA la recupera hasta el 75,80 %, todavía 15,83 puntos por debajo del profesor original (91,63 %). La evaluación se realizó físicamente en una NVIDIA RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se documentan detalles sobre el dataset de entrenamiento original más allá de GLUE SST-2 ni sobre el uso de RLHF/DPO (no aplicable a un clasificador).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos de longitud corta a media, típica de reseñas.
- Generación de logits de dos clases mediante `BertForSequenceClassification` con `num_labels=2`.
- Integración con el ecosistema Hugging Face Transformers una vez reconstruido el grafo comprimido con NeuralOps.
- Carga en una línea mediante la API `load_surgeried_model` de NeuralOps Hub.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder discriminativo, no un modelo generativo.
- No tiene capacidades multimodales ni modo "thinking".
- Multilingüismo limitado al inglés (vocabulario y entrenamiento en `en`).

## Casos de uso

- Clasificación de reseñas de producto en inglés a gran escala: el modelo cabe en 128 MB de pesos y puede procesar lotes grandes en GPUs modestas, lo que lo hace adecuado para pipelines de moderación o análisis de opinión donde el coste por inferencia importa más que la precisión máxima.
- Filtrado previo en sistemas de atención al cliente: clasificar automáticamente tickets o mensajes como positivos/negativos para enrutarlos a colas distintas, usando el modelo como primera etapa barata antes de un modelo mayor.
- Análisis de sentimiento en redes sociales o foros: con 67 M de parámetros y contexto de hasta 512 tokens (heredado de BERT), puede procesar publicaciones individuales en tiempo real en una sola GPU consumer.
- Benchmark de compresión en investigación: sirve como referencia reproducible para comparar técnicas de compresión (SVD, pruning, cuantización) sobre un mismo profesor y dataset, gracias a `compression_summary.json` y a la curva de Pareto publicada.
- Despliegue en entornos con memoria restringida: el checkpoint de 128 MB permite servir el clasificador en dispositivos edge o contenedores pequeños donde BERT-base completo no cabría con holgura.
- Docencia y demostraciones: ejemplo didáctico de cómo la compresión SVD con curación LoRA afecta a la precisión, con métricas por rango listas para explicar el trade-off.
- Prototipado rápido de clasificadores de sentimiento: la API de carga en una línea de NeuralOps Hub reduce la fricción para validar una idea antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Modelo / configuración | Ratio compresión | Params (M) | SST-2 val accuracy |
|---|---:|---:|---:|
| Profesor (BERT-base SST-2) | 1.00x | 109,48 | 91,63 % |
| `k=256` zero-shot | 1.63x | 67,03 | 59,52 % |
| `k=256` + LoRA (checkpoint publicado) | 1.63x | 67,03 | 75,80 % |
| `k=128` + LoRA | 2.39x | 45,79 | 61,47 % |
| `k=64` + LoRA | 3.11x | 35,17 | 50,92 % |
| `k=32` + LoRA | 3.67x | 29,86 | 68,12 % |

Evaluación sobre 872 muestras de validación de GLUE SST-2 en RTX 3090. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable al tratarse de un clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint comprimido (67 M de parámetros ≈ 268 MB de pesos más activaciones y overhead). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en RTX 3090 (24 GB), pero es sobredimensionada para este modelo. Una GTX 1650, RTX 3050 o incluso CPU son suficientes para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en todas las generaciones recientes (GTX 10xx en adelante) y también en CPU para cargas moderadas.
- Opciones de despliegue: PyTorch + Transformers + NeuralOps (requerido para reconstruir el grafo comprimido); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder de clasificación no encaja en esos servidores de generación.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño reducido sugiere latencias de milisegundos por lote en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 val acc | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `Hooshaai/bert-comp-adaptive-ranks-sst2` (k=256) | 67,03 M | No disponible (base: 512) | 75,80 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,48 M | 512 | 91,63 % | Apache 2.0 | Hugging Face, Transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 | ~91 % (referencia pública de DistilBERT) | Apache 2.0 | Hugging Face, Transformers estándar |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 | ~92 % (referencia pública) | Apache 2.0 | Hugging Face, Transformers estándar |

La comparación revela el punto crítico: el checkpoint comprimido iguala en tamaño a DistilBERT pero rinde unos 15 puntos por debajo en SST-2, lo que refleja que la compresión SVD con curación LoRA de 50 pasos no sustituye a una destilación bien diseñada. Su interés es metodológico y reproducible, no competitivo en precisión.

## Limitaciones y advertencias

- Pérdida de precisión severa: 15,83 puntos por debajo del profesor en SST-2; no apto para producción donde se requiera alta exactitud.
- Requiere la librería NeuralOps para reconstruir el grafo comprimido antes de cargar los pesos; no es un checkpoint estándar de Transformers a pesar de usar `pytorch_model.bin`.
- Solo inglés: vocabulario y entrenamiento en `en`; no funciona en castellano ni otros idiomas.
- Dominio restringido a clasificación de sentimiento binaria; no es un modelo generativo ni sirve para otras tareas sin reentrenamiento.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en dominios distintos de reseñas (por ejemplo, texto técnico o ironía).
- La curación LoRA se realizó con solo 50 pasos y 45 segundos de presupuesto, lo que sugiere un ajuste superficial; la variabilidad entre rangos (k=32 rinde mejor que k=64) indica inestabilidad en el proceso.
- Benchmarks no verificados (`verified: false`): los resultados provienen del autor y no han sido replicados de forma independiente.
- Licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base (Apache 2.0) y citar adecuadamente el trabajo original de BERT.
- Sin soporte documentado para cuantización, lo que limita optimizaciones adicionales de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-adaptive-ranks-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/adaptive_ranks.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
