# Hooshaai/bert-comp-delta-kv-sst2

## Resumen

`bert-comp-delta-kv-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`, 109.483.778 parámetros, 12 capas, dimensión oculta 768) comprimido físicamente y posteriormente "curado" mediante LoRA, publicado por el autor Hooshaai dentro del ecosistema NeuralOps (librería `neuralops`). El modelo parte de un fine-tuning sobre GLUE SST-2 (clasificación binaria de sentimiento en inglés) y aplica el compresor `delta_kv` del `delta_kv_factory`, orientado a la compresión de la caché KV, en el rango Pareto seleccionado `k=128`.

La relevancia del artefacto no está en su calidad predictiva, sino en su valor como demostración metodológica: documenta una evaluación multi-rango (`k=256, 128, 64, 32`) con métricas de compresión física, precisión zero-shot y precisión tras aplicar LoRA de recuperación (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s). El checkpoint empaquetado logra una reducción del 58,18 % de parámetros (45.782.786 parámetros, ratio de compresión física 2,391x) a costa de una caída de 15,37 puntos de accuracy frente al profesor (91,63 % → 76,26 % sobre la partición de validación de SST-2).

Se trata, por tanto, de un modelo de clasificación de texto en inglés, con licencia MIT, pesos en formato PyTorch (`pytorch_model.bin`) y dependencia explícita de la librería NeuralOps para reconstruir la topología comprimida antes de cargar el state dict. No es un modelo generativo ni un modelo de propósito general: es un artefacto de investigación sobre compresión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768) con topología comprimida `delta_kv` |
| Parametros totales | 45.782.786 (checkpoint comprimido, `k=128`); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite 512 tokens; la model card no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (la compresión aplicada es de rango bajo `delta_kv`, no cuantización declarada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); assets de tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo base es BERT-Base uncased, un transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas, afinado para clasificación de secuencias con 2 etiquetas (negativo/positivo) sobre GLUE SST-2. Sobre ese checkpoint se aplica el compresor `delta_kv` de NeuralOps (`neuralops/compression/kv_cache/delta_kv.py`), que reduce el número de parámetros mediante factores de rango bajo en el rango `k=128`, pasando de 109.483.778 a 45.782.786 parámetros (-58,18 %, ratio 2,391x).

El pipeline de recuperación documentado es el siguiente: cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica LoRA de recuperación con `r=8`, 50 pasos y `lr=2e-4` en un presupuesto de 45 segundos. La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre la partición de validación de GLUE SST-2 (872 muestras). El checkpoint empaquetado incorpora los adaptadores LoRA de curación fusionados en el state dict, junto con `config.json` (etiquetado con `compression_method: "delta_kv"` y `compression_rank: 128`) y `compression_summary.json` con la telemetría de todos los rangos evaluados.

## Capacidades

- Clasificación binaria de sentimiento en inglés (etiquetas 0 = negativo, 1 = positivo) sobre textos de estilo SST-2.
- Inferencia estándar vía `BertForSequenceClassification` tras reconstruir la topología comprimida con `compress_model` de NeuralOps y cargar el state dict con `strict=False`.
- Carga simplificada mediante la API `load_surgeried_model` de `neuralops.hub`, que devuelve modelo y tokenizer en una sola llamada.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés; el vocabulario es el de `bert-base-uncased`.
- No se documentan capacidades de function calling ni de integración con frameworks de agentes.

## Casos de uso

- Investigación sobre compresión de modelos: el checkpoint sirve como referencia reproducible para comparar el compresor `delta_kv` frente a otras técnicas (pruning, cuantización, destilación) sobre una tarea estándar como SST-2, con telemetría multi-rango ya publicada.
- Análisis de Pareto precisión/compresión: los cuatro rangos evaluados (`k=256, 128, 64, 32`) permiten estudiar el compromiso entre ratio de compresión física y accuracy tras curación LoRA en un entorno controlado.
- Clasificación de sentimiento de baja exigencia en inglés: para prototipos donde una accuracy del 76,26 % en SST-2 es aceptable y se prioriza un checkpoint de 89,6 MB y 45,8 M de parámetros.
- Docencia y formación técnica: ejemplo completo de pipeline de compresión con reconstrucción de topología, carga de state dict no estricta y fusión de adaptadores LoRA, útil para explicar modelos comprimidos en cursos de ML.
- Validación de infraestructura de despliegue: al ser un modelo pequeño, permite probar pipelines de serving (por ejemplo, endpoints de clasificación) antes de migrar a modelos mayores.
- Reproducción de experimentos: el `compression_summary.json` y los scripts de la librería NeuralOps permiten replicar la evaluación multi-rango en una única GPU de 24 GB.
- Benchmarking interno de herramientas de compresión: comparar el comportamiento de `delta_kv` frente a otros compresores del `COMPRESSOR_REGISTRY` de NeuralOps sobre la misma tarea y dataset.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card (no verificados de forma independiente):

| Rank (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy curada (LoRA) | Diferencia vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 59,52 % | 50,92 % | -40,71 % |
| 128 (empaquetado) | 2,39x | 45.782.786 (-58,2 %) | 52,41 % | 76,26 % | -15,37 % |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 51,38 % | 51,15 % | -40,48 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 50,11 % | 65,71 % | -25,92 % |

| Metrica | Valor |
|---|---|
| GLUE SST-2 validation accuracy (checkpoint empaquetado, `k=128`) | 76,26 % |
| Baseline del profesor (`bert-base-uncased` fine-tuned en SST-2) | 91,63 % |
| Particion de evaluacion | GLUE SST-2 validation (872 muestras) |
| Hardware de evaluacion | NVIDIA GeForce RTX 3090 (24 GB) |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K) ni comparaciones con modelos externos al zoo de NeuralOps.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint comprimido (45,8 M de parámetros ≈ 183 MB de pesos, más activaciones y overhead); el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; la evaluación oficial se realizó en una RTX 3090, pero el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch + Transformers con reconstrucción previa vía NeuralOps (`compress_model` y `load_state_dict(strict=False)`); la API `load_surgeried_model` de `neuralops.hub` simplifica la carga. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF ni un grafo estándar de Transformers, estos runtimes no pueden cargarlo directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 val accuracy | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-delta-kv-sst2` (`k=128`) | 45,8 M (comprimido) | no disponible | 76,26 % | MIT | Hugging Face (requiere NeuralOps) |
| `google-bert/bert-base-uncased` (profesor fine-tuned SST-2, referencia del autor) | 109,5 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, Transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, Transformers estándar |

La comparativa con DistilBERT se incluye por proximidad de tamaño y tarea, pero no se dispone de su accuracy exacta en la información proporcionada; no se han publicado comparaciones directas con otros compresores en la model card.

## Limitaciones y advertencias

- Pérdida de accuracy sustancial: 76,26 % frente al 91,63 % del profesor, una caída de 15,37 puntos en SST-2. No es apto para producción donde se requiera precisión cercana al estado del arte.
- Dependencia dura de la librería NeuralOps: sin reconstruir la topología comprimida con `compress_model` y cargar con `strict=False`, el state dict no es compatible con `BertForSequenceClassification` estándar. Esto complica la portabilidad y el despliegue en runtimes convencionales.
- Resultados no verificados: la métrica de accuracy está marcada como `verified: false` en la model-index y procede únicamente del autor.
- El patrón de curación LoRA es irregular entre rangos (el rango 256 empeora tras la curación: 59,52 % → 50,92 %), lo que sugiere inestabilidad del pipeline de recuperación y aconseja cautela al extrapolar resultados.
- Idioma limitado al inglés y dominio limitado a clasificación de sentimiento; no debe usarse como modelo generativo ni para tareas fuera de SST-2 sin revalidación.
- Riesgo de sesgos heredados de `bert-base-uncased` y de la distribución de SST-2 (reseñas de cine), no evaluados en la model card.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en dominios distintos al de entrenamiento.
- Licencia MIT permite uso comercial, pero la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y las dependencias de NeuralOps deben revisarse por separado; el enlace de licencia apunta al repositorio de GitHub de NeuralOps.
- El README contiene un `repo_id` (`tahamajs/bert-comp-delta-kv-sst2`) distinto del ID real del repositorio (`Hooshaai/bert-comp-delta-kv-sst2`); hay que ajustar la ruta al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-delta-kv-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor `delta_kv`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/delta_kv.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
