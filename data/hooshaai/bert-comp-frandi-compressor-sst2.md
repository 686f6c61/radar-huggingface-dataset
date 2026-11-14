# Hooshaai/bert-comp-frandi-compressor-sst2

## Resumen

`bert-comp-frandi-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificacion de sentimiento en GLUE SST-2, publicado por el autor Hooshaai dentro del ecosistema NeuralOps (repositorio `tahamajs/NeuralOps`). El modelo aplica el operador de compresion `frandi_compressor` con rango Pareto-seleccionado `k=128`, reduciendo el numero de parametros de 109,48 M a 45,78 M (un 58,2 % menos, ratio fisico de compresion 2,39x), seguido de un proceso de "LoRA healing" con `r=8` para recuperar parte de la precision perdida por la compresion.

El resultado es un clasificador binario de sentimiento (positivo/negativo) para ingles que alcanza un 75,11 % de accuracy en la validacion de SST-2 (872 muestras), frente al 91,63 % del modelo profesor sin comprimir. La compresion en frio (zero-shot) degrada la precision hasta el 52,41 %, por lo que el ajuste LoRA es imprescindible para que el checkpoint sea utilizable.

Su relevancia es fundamentalmente metodologica: sirve como ejemplo reproducible del pipeline de compresion y recuperacion de NeuralOps, no como un clasificador de produccion de altas prestaciones. El checkpoint pesa aproximadamente 87,4 MB y se distribuye en formato PyTorch (`pytorch_model.bin`) con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimension oculta 768), comprimido con `frandi_compressor` y recuperado con LoRA `r=8` |
| Parametros totales | 45.782.786 (tras compresion, reduccion del 58,18 % respecto a los 109.483.778 del BERT-base original) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-base admite 512 tokens) |
| Tipos de cuantizacion | no disponible (el artefacto distribuido son pesos PyTorch en `pytorch_model.bin`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), mas `config.json`, `compression_summary.json` y assets del tokenizador `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones de representacion, afinado previamente sobre GLUE SST-2. Sobre esa base se aplica el operador `frandi_compressor` de la libreria NeuralOps, que reduce el numero de parametros mediante descomposicion de bajo rango con rango `k=128`. El checkpoint publicado incorpora los factores de bajo rango, los buffers de cuantizacion y los adaptadores LoRA ya fusionados en el state dict.

El proceso de recuperacion ("LoRA healing") se activa cuando la compresion zero-shot degrada la precision mas de 2,0 puntos porcentuales con una reduccion superior a 1,10x. En ese caso se entrena un adaptador LoRA con `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. La evaluacion Pareto se realizo fisicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) con el split de validacion de SST-2 (872 muestras) para los rangos `k=256, 128, 64 y 32`. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento ni si hubo etapas adicionales de RLHF o DPO (no aplicables a un clasificador de este tipo).

## Capacidades

- Clasificacion binaria de sentimiento en ingles (0 = negativo, 1 = positivo) sobre textos de resenas al estilo SST-2.
- Inferencia ligera: 45,78 M de parametros, lo que permite ejecucion en CPU y en GPUs de gama baja.
- Integracion con la API universal de NeuralOps (`load_surgeried_model`) para carga en una linea desde el Hub.
- Reconstruccion programatica del grafo comprimido mediante `compress_model` y carga del state dict con `strict=False`.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", vision ni audio.
- Capacidad multilingue limitada al ingles (tokenizador `bert-base-uncased`).

## Casos de uso

- Clasificacion de resenas de producto en ingles a gran escala: el modelo puede procesar lotes de resenas con un coste computacional bajo (45,78 M de parametros) y servir como filtro de primera etapa en pipelines de moderacion o analitica de opinion.
- Etiquetado de sentimiento en entornos con recursos limitados: su tamano reducido permite desplegarlo en CPUs o GPUs de consumo (por ejemplo, una RTX 3060) sin necesidad de infraestructura dedicada.
- Docencia y experimentacion en compresion de modelos: sirve como caso reproducible del pipeline NeuralOps, permitiendo comparar el rendimiento de los rangos `k=256, 128, 64 y 32` con el script de reconstruccion incluido en la model card.
- Baseline para investigacion en destilacion y pruning: al publicarse el `compression_summary.json` con telemetria completa, es util como referencia para comparar tecnicas de compresion alternativas sobre BERT-base.
- Preprocesado en pipelines de NLP: puede actuar como clasificador rapido de polaridad antes de un modelo generativo mas costoso, reduciendo el numero de llamadas al modelo grande.
- Prototipado de APIs de analisis de sentimiento: la licencia MIT y el formato PyTorch facilitan la integracion en servicios internos o demos sin restricciones comerciales.
- Validacion de la API `load_surgeried_model`: util para equipos que evaluan la libreria NeuralOps antes de adoptarla en produccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Valor |
|---|---|
| GLUE SST-2, validacion, accuracy (checkpoint publicado, `k=128` con LoRA) | 75,11 % |
| GLUE SST-2, validacion, accuracy (profesor BERT-base sin comprimir) | 91,63 % |
| GLUE SST-2, validacion, accuracy zero-shot (`k=128` sin LoRA) | 52,41 % |
| Delta de paridad frente al profesor (`k=128` con LoRA) | -16,52 % |

Evaluacion Pareto multi-rango (RTX 3090, 872 muestras de validacion):

| Rango (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 59,52 % | 66,51 % | -25,12 % |
| 128 (publicado) | 2,39x | 45.782.786 (-58,2 %) | 52,41 % | 75,11 % | -16,52 % |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 51,38 % | 72,59 % | -19,04 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 50,11 % | 70,76 % | -20,87 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (45,78 M de parametros, aproximadamente 183 MB de pesos mas activaciones y buffers); en FP16 o BF16, alrededor de 92 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor valido el pipeline en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobradamente pequeno para GPUs de gama baja.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1650) e incluso en CPU.
- Opciones de despliegue: la carga estandar requiere reconstruir el grafo con `neuralops.core.compression_pipeline.compress_model` antes de cargar el state dict; tambien se puede usar la API `neuralops.hub.load_surgeried_model`. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-frandi-compressor-sst2` (este modelo) | 45,78 M (comprimido) | no disponible | 75,11 % | MIT | Hugging Face, libreria `neuralops` |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,48 M | 512 tokens | 91,63 % (segun el autor) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` |

La comparativa con DistilBERT y el BERT afinado de TextAttack se incluye por categoria y tamano, pero no se dispone de sus cifras de accuracy en la informacion proporcionada, por lo que no se pueden confrontar numericamente con el resultado del autor.

## Limitaciones y advertencias

- Perdida de precision notable: 75,11 % frente al 91,63 % del profesor (-16,52 puntos de paridad). No es adecuado para produccion con requisitos de calidad altos.
- La compresion zero-shot degrada la precision hasta el 52,41 %, practicamente a nivel de azar en un problema binario; el checkpoint solo es util con los adaptadores LoRA ya fusionados.
- Entrenado exclusivamente para clasificacion binaria de sentimiento en ingles; no generaliza a otras tareas ni idiomas.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificaciones erroneas sistematicas en dominios alejados de SST-2 (por ejemplo, resenas tecnicas o dominio medico).
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2: vocabulario y estilo de resenas cinematograficas, posible sesgo de dominio y de registro.
- La carga requiere la libreria NeuralOps y reconstruir el grafo comprimido antes de aplicar el state dict con `strict=False`; no es un checkpoint plug-and-play con `AutoModelForSequenceClassification.from_pretrained`.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`); no se han reproducido de forma independiente.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y del dataset (GLUE) antes de redistribuir derivados.
- El repositorio tiene muy poca traccion (49 descargas, 0 likes) y una unica version; no hay garantia de mantenimiento.
- No se documenta compatibilidad con motores de inferencia estandar (vLLM, TGI, llama.cpp); la integracion en produccion requeriria trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-frandi-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del modulo de compresion: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
