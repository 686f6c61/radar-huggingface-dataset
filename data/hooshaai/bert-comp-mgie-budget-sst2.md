# Hooshaai/bert-comp-mgie-budget-sst2

## Resumen

`bert-comp-mgie-budget-sst2` es un checkpoint de clasificación de sentimiento en inglés derivado de `google-bert/bert-base-uncased`, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps (Compressor Zoo). No es un modelo entrenado desde cero, sino un BERT-Base físico comprimido mediante el compresor `mgie_budget` (`MGIESVDBudgetCompressor`, familia low-rank) y posteriormente "curado" con adaptadores LoRA de rango 8 para recuperar parte de la precisión perdida por la compresión SVD.

El modelo parte de los 109,5 millones de parámetros del BERT-Base original (12 capas, dimensión oculta 768) y los reduce a 35,17 millones en el checkpoint empaquetado (rango k=64), lo que supone una reducción del 67,9 % y un ratio de compresión físico de 3,11x. Sobre GLUE SST-2 (split de validación, 872 muestras) alcanza un 74,77 % de accuracy tras el healing LoRA, frente al 91,63 % del profesor original, es decir, una pérdida de 16,86 puntos porcentuales.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible de un pipeline de compresión agresiva con recuperación selectiva por LoRA, útil para investigadores que estudien técnicas de compresión de transformers o para quienes necesiten un clasificador de sentimiento extremadamente ligero (67,2 MB de pesos) aun aceptando una merma notable de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) comprimido por SVD de bajo rango con LoRA healing |
| Parametros totales | 35.170.562 (checkpoint comprimido); profesor original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (BERT-Base estandar: 512 tokens) |
| Tipos de cuantizacion | No disponible; el repo entrega pesos en `pytorch_model.bin` (fp32/fp16 segun serializacion) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores low-rank y adaptadores LoRA integrados) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer encoder BERT-Base (12 capas, D=768), afinado previamente sobre GLUE SST-2. Sobre ese modelo se aplica el compresor `MGIESVDBudgetCompressor` (clave `mgie_budget`), que realiza una descomposicion SVD con asignacion global de rango proporcional a la entropia de cada capa ("Global Entropy-Proportional Rank Allocation"). El checkpoint publicado corresponde al rango Pareto k=64, seleccionado entre los rangos evaluados k=256, 128, 64 y 32.

El proceso de recuperacion ("healing") aplica LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos, activado siempre que la compresion zero-shot degrada la accuracy mas de 2,0 puntos con una reduccion superior a 1,10x. La evaluacion fisica se realizo en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validacion de SST-2 (872 muestras). El modelo base de partida es `google-bert/bert-base-uncased` y el dataset de referencia es `nyu-mll/glue` (config `sst2`). No se especifican en la informacion disponible detalles sobre el dataset de preentrenamiento original ni sobre el uso de RLHF/DPO (no aplicable a un encoder de clasificacion).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles sobre textos cortos, formato SST-2.
- Inferencia de tipo encoder con salida de logits de 2 clases mediante `BertForSequenceClassification`.
- Integracion con el ecosistema NeuralOps: carga via `load_surgeried_model` o reconstruccion manual del topologia comprimida con `compress_model`.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo "thinking"; es un clasificador discriminativo puro.
- Capacidad multilingue limitada al ingles (vocabulario `bert-base-uncased`).
- Telemetria de compresion incluida (`compression_summary.json`) para auditoria de ratios y precision por rango.

## Casos de uso

- Clasificacion de sentimiento en produccion de bajo coste: con 67,2 MB de pesos y 35,17 M de parametros, el modelo cabe en CPU y GPUs integradas, lo que permite desplegarlo en entornos con recursos muy limitados donde un BERT-Base completo no es viable.
- Moderacion de comentarios en ingles a gran escala: el bajo coste por inferencia permite procesar volumenes altos de texto en pipelines de streaming, aceptando la perdida de ~17 puntos de accuracy frente al profesor.
- Filtrado previo en cascada: usar este modelo como primera etapa barata para descartar casos claramente negativos o positivos, derivando solo los ambiguos a un modelo mayor, reduciendo el coste medio del sistema.
- Investigacion en compresion de modelos: sirve como referencia reproducible del pipeline `mgie_budget` con telemetria completa por rango (k=256, 128, 64, 32), util para comparar tecnicas SVD + LoRA frente a otras alternativas.
- Benchmarking de despliegue ligero: al ser un checkpoint pequeno con licencia MIT, es adecuado para probar frameworks de inferencia (ONNX Runtime, TorchScript) en dispositivos edge y medir latencia/throughput reales.
- Educacion y demos: ejemplo didactico de como la compresion agresiva degrada la precision y como el healing LoRA recupera parte de ella, con numeros concretos y artefactos auditables.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, no verificados) sobre GLUE SST-2, split de validacion (872 muestras), evaluados en RTX 3090:

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA | Delta vs profesor (91,63 %) |
|---|---|---|---|---|---|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 59,52 % | 68,58 % | -23,05 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 52,41 % | 66,97 % | -24,66 % |
| 64 (publicado) | 3,11x | 35.170.562 (-67,9 %) | 51,38 % | 74,77 % | -16,86 % |
| 32 | No disponible | No disponible | FAIL_CRASH | No disponible | No disponible |

El valor de accuracy reportado en el model-index para el checkpoint publicado es 74,77 % (no verificado). El profesor original (`bert-base-uncased` afinado en SST-2) alcanza 91,63 % segun el autor. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 35,17 M de parametros, el checkpoint en fp32 ocupa ~140 MB y en fp16 ~70 MB, mas activaciones. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluo en NVIDIA RTX 3090 (24 GB), pero no es necesaria.
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, y tambien en CPU.
- Opciones de despliegue: la carga requiere `transformers` + `neuralops` (reconstruccion de topologia comprimida via `compress_model` o `load_surgeried_model`). No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; al ser un encoder de clasificacion, no encaja en los pipelines de generacion de esos frameworks.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-mgie-budget-sst2` (este) | 35,17 M (comprimido) | No disponible | 74,77 % (declarado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,48 M | 512 tokens | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face |

Nota: los datos de los modelos alternativos no se han verificado en la informacion proporcionada; se indican solo como referencia de categoria. El checkpoint comprimido ofrece un tamano inferior a DistilBERT a costa de una precision claramente menor.

## Limitaciones y advertencias

- Perdida de precision significativa: 74,77 % frente al 91,63 % del profesor (-16,86 puntos), lo que lo hace inadecuado para aplicaciones donde la exactitud sea critica.
- El resultado de accuracy esta declarado por el autor y marcado como no verificado (`verified: false`); conviene re-evaluarlo de forma independiente antes de usarlo en produccion.
- El rango k=32 fallo con `FAIL_CRASH`, lo que sugiere inestabilidad del pipeline de compresion en regimenes muy agresivos.
- Solo ingles: el vocabulario y el dataset de afinado son en ingles; el rendimiento en otros idiomas no esta caracterizado.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificaciones erroneas en textos ambiguos, sarcasticos o de dominio distinto a SST-2 (criticas de cine).
- La carga requiere la libreria `neuralops` y reconstruir la topologia comprimida antes de cargar el state dict; no es un checkpoint plug-and-play con `AutoModel` estandar.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0; conviene revisar la compatibilidad y atribuciones en despliegues comerciales.
- No se documentan sesgos especificos del checkpoint comprimido; hereda los del BERT-Base original y del dataset SST-2.
- El repositorio tiene muy poca traccion (50 descargas, 0 likes) y fue creado en 2026-11-10; no hay evidencia de mantenimiento ni de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-mgie-budget-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/mgie_svd_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
