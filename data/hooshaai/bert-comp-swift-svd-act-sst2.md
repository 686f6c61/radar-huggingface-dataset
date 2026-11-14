# Hooshaai/bert-comp-swift-svd-act-sst2

## Resumen

`Hooshaai/bert-comp-swift-svd-act-sst2` es un checkpoint de `google-bert/bert-base-uncased` (109,48 M de parámetros, 12 capas, dimensión oculta 768) afinado sobre GLUE SST-2 y posteriormente comprimido con el motor `swift_svd_act` (`SwiftSVDActivationCompressor`) de la librería NeuralOps, del autor Hooshaai. El resultado es un modelo de clasificación de sentimiento en inglés con 29,86 M de parámetros físicos, es decir, una reducción del 72,73 % y un ratio de compresión de 3,667x respecto al modelo base.

El interés del artefacto es metodológico más que de rendimiento: documenta una técnica de compresión SVD consciente de las activaciones (calcula covarianzas entrada-salida empíricas sobre datos de calibración, proyecta los pesos sobre el subespacio principal de activación y sustituye capas `nn.Linear`/`Conv1D` densas por módulos `SVDLinear` factorizados) combinada con un "healing" posterior mediante LoRA de rango 8. El repositorio incluye telemetría de cuatro rangos (k=256, 128, 64, 32) evaluados sobre las 872 muestras de validación de SST-2 en una RTX 3090.

La relevancia práctica es limitada: la accuracy final declarada es del 50,92 % frente al 91,63 % del profesor, una paridad negativa de 40,71 puntos, lo que deja el modelo básicamente en el nivel de azar (49,08 % en zero-shot) para una tarea binaria. Se trata, por tanto, de un artefacto de investigación sobre compresión, no de un clasificador de sentimiento apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, D=768), con capas densas sustituidas por modulos `SVDLinear` factorizados |
| Parametros totales | 29.859.842 (comprimido, k=32); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-base-uncased soporta 512 tokens) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en `pytorch_model.bin` (float) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); requiere reconstruccion de la topologia con NeuralOps antes de cargar |
| Libreria | neuralops |
| Tamano del repositorio | 0,1 GB (pesos declarados: 57,1 MB) |
| Tarea (pipeline) | text-classification |
| Dataset de evaluacion | nyu-mll/glue, configuracion sst2, split validation (872 muestras) |

## Arquitectura y entrenamiento

La base es BERT-base-uncased, un transformer encoder de 12 capas y 768 dimensiones de modelo, afinado previamente sobre GLUE SST-2 (clasificacion binaria de sentimiento). Sobre ese checkpoint se aplica el compresor `swift_svd_act`, que captura covarianzas cruzadas empíricas entrada-salida sobre datos de calibracion, deriva subespacios alineados con las activaciones y proyecta los pesos sobre el subespacio principal, reemplazando cada capa densa por una factorizacion SVD de rango k. El checkpoint empaquetado corresponde a k=32.

El pipeline de NeuralOps aplica un "healing" condicional: cuando la compresion zero-shot degrada la accuracy mas de un 2,0 % con una reduccion superior a 1,10x, se entrena un adaptador LoRA de rango 8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. En los cuatro rangos evaluados (256, 128, 64 y 32) se activo este healing, y en todos los casos la accuracy curada quedo en 50,92 %, identica independientemente del rango, lo que sugiere que el adaptador no recupera capacidad discriminativa real. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de calibracion ni si hubo RLHF/DPO (no aplica a un encoder de clasificacion).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, con el etiquetado estandar de SST-2 (0=negativo, 1=positivo).
- Inferencia sobre texto tokenizado con el vocabulario estandar de `bert-base-uncased`.
- Compresion fisica del modelo con reconstruccion de topologia via `neuralops.core.compression_pipeline.compress_model` y carga del state dict con `strict=False`.
- Carga unificada mediante la API `neuralops.hub.load_surgeried_model` (segun la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking": es un encoder de clasificacion.
- Capacidad multilingue: no; solo ingles.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como referencia reproducible de la tecnica `swift_svd_act` con telemetria completa (`compression_summary.json`) para comparar rangos k=256/128/64/32 sobre una misma tarea y dataset.
- Benchmarking de pipelines de compresion: permite medir el coste real (caida de accuracy) de sustituir capas densas por `SVDLinear` en un encoder BERT afinado, usando SST-2 como tarea controlada.
- Estudio del "LoRA healing": el artefacto documenta que un adaptador r=8 con 50 pasos y lr=2e-4 no recupera la precision perdida en este caso, util como evidencia negativa en experimentos de recuperacion post-compresion.
- Pruebas de integracion de la libreria NeuralOps: valida el flujo `compress_model` + `load_state_dict(strict=False)` + `eval()` en un entorno real con pesos publicados.
- Docencia y demos de SVD aplicado a transformers: el modelo ilustra de forma tangible la diferencia entre reduccion de parametros (72,7 %) y preservacion de capacidad (paridad -40,71 puntos).
- No se recomienda su uso para clasificacion de sentimiento en produccion: con 50,92 % de accuracy en una tarea binaria, el modelo opera al nivel de un clasificador trivial y no aporta valor predictivo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados, `verified: false`). Evaluacion fisica sobre NVIDIA GeForce RTX 3090 (24 GB), split de validacion de GLUE SST-2 (872 muestras).

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy curada (LoRA) | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 49,08 % | 50,92 % | -40,71 |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 49,20 % | 50,92 % | -40,71 |
| 64 | 3,11x | 35.170.562 (-67,9 %) | 49,08 % | 50,92 % | -40,71 |
| 32 (empaquetado) | 3,67x | 29.859.842 (-72,7 %) | 49,08 % | 50,92 % | -40,71 |

Referencia: accuracy del profesor (BERT-base afinado en SST-2) = 91,63 %. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K (no aplicables a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 29,86 M de parametros del checkpoint comprimido (aprox. 120 MB de pesos en fp32; el binario empaquetado ocupa 57,1 MB). El modelo base sin comprimir requeriria unos 440 MB en fp32.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor realizo la evaluacion en una NVIDIA GeForce RTX 3090 (24 GB), muy por encima de lo necesario.
- Cabe en cualquier GPU consumer (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la carga requiere reconstruir la topologia con NeuralOps (`compress_model` con `method: "swift_svd_act"`, `rank: 32`) antes de aplicar el state dict; no es un checkpoint cargable directamente con `AutoModel.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-swift-svd-act-sst2` (k=32) | 29,86 M (comprimido) | no disponible | 50,92 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor afinado en SST-2) | 109,48 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, transformers estandar |
| `google-bert/bert-base-uncased` (sin afinar) | 109,48 M | 512 tokens | no disponible | Apache 2.0 | Hugging Face, transformers estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens | no disponible en esta informacion | Apache 2.0 | Hugging Face, transformers estandar |

La comparativa relevante es contra el profesor: el checkpoint comprimido reduce parametros un 72,7 % pero pierde 40,71 puntos de accuracy, un intercambio claramente desfavorable frente a alternativas destiladas como DistilBERT, que reducen tamano sin colapsar el rendimiento.

## Limitaciones y advertencias

- Accuracy de 50,92 % en una tarea binaria: equivale practicamente a clasificacion aleatoria; el modelo no es funcional para sentimiento real.
- El "healing" con LoRA no mejora la accuracy de forma observable: los cuatro rangos convergen al mismo 50,92 %, lo que cuestiona la eficacia del procedimiento en este checkpoint.
- La evaluacion se realizo sobre solo 872 muestras (split de validacion de SST-2) y los resultados estan marcados como no verificados por el autor.
- Solo soporta ingles; no hay capacidades multilingues.
- No es cargable directamente con `transformers`: requiere la libreria NeuralOps y reconstruir la topologia comprimida antes de aplicar el state dict, lo que anade dependencia y fragilidad al despliegue.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de predicciones sin fundamento: el modelo puede emitir etiquetas con confianza sin senal real.
- Sesgos: no documentados en la informacion disponible; hereda los del corpus de SST-2 (resenas de cine en ingles) y del preentrenamiento de BERT-base-uncased.
- Licencia MIT declarada en el repositorio, con enlace a la licencia de NeuralOps; el modelo base BERT mantiene su propia licencia Apache 2.0, que conviene revisar antes de uso comercial.
- No apto para produccion: usar como material de investigacion sobre compresion, no como clasificador desplegable.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-swift-svd-act-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion del compresor `swift_svd_act`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/swift_svd_act.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
