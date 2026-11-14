# Hooshaai/bert-comp-soka-compressor-sst2

## Resumen

`bert-comp-soka-compressor-soka-compressor-sst2` es un checkpoint de BERT-Base comprimido físicamente mediante la técnica SoKA (Second-Order Knowledge-Aware Low-Rank Linear Compressor), implementada en la librería NeuralOps. Parte de `google-bert/bert-base-uncased` afinado en GLUE SST-2 y aplica una compresión de bajo rango seguida de un "healing" con LoRA para recuperar parte de la precisión perdida. El resultado es un modelo de 35,2 millones de parámetros (frente a los 109,5 millones del original), lo que supone una reducción del 67,9 % y un ratio de compresión físico de 3,11x.

El modelo está pensado como demostración del zoo de compresores de NeuralOps, una librería centrada en reducir el coste computacional y de almacenamiento de transformers sin reentrenar desde cero. El checkpoint serializado corresponde al rango `k=64`, seleccionado por el autor como compromiso de la curva Pareto evaluada (k=256, 128, 64, 32). La precisión final en la validación de SST-2 es del 73,05 %, frente al 91,63 % del modelo profesor, lo que deja una brecha de 18,58 puntos.

Es relevante ahora porque ejemplifica una tendencia creciente: pipelines de compresión post-entrenamiento con recuperación selectiva vía LoRA, empaquetados como artefactos listos para Hugging Face. No obstante, la caída de precisión es sustancial y el modelo debe tratarse como material de investigación o demostración, no como sustituto directo del BERT original en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), comprimido con LowRankCompressor (SoKA) |
| Parametros totales | 35.165.954 (comprimido); 109.483.778 en el modelo base original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT-Base original: 512 tokens) |
| Tipos de cuantizacion | no disponible (checkpoint en `pytorch_model.bin`, pesos comprimidos de bajo rango) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstruccion de topologia con NeuralOps |
| Libreria | neuralops |
| Modelo base | google-bert/bert-base-uncased |
| Dataset de evaluacion | nyu-mll/glue, configuracion sst2, split validation |
| Rango de compresion (k) | 64 |
| Ratio de compresion fisico | 3,113x (-67,88 % de parametros) |
| Tamano del repo | 0,1 GB (pesos ~67,2 MB) |
| Tarea | text-classification (clasificacion de sentimiento binaria) |

## Arquitectura y entrenamiento

El modelo parte de BERT-Base uncased: 12 capas, dimension oculta D=768 y 109.483.778 parametros, afinado previamente en GLUE SST-2. Sobre ese checkpoint se aplica el compresor `soka_compressor` (clase `LowRankCompressor`, familia `low_rank`), que aproxima las matrices lineales mediante factores de bajo rango. El autor evalua cuatro rangos (k=256, 128, 64 y 32) y selecciona k=64 como punto de la curva Pareto empaquetado en este repositorio.

Cuando la compresion zero-shot degrada la precision mas de 2,0 puntos porcentuales con una reduccion superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. En el caso de k=64, el healing eleva la precision del 51,38 % (zero-shot) al 73,05 %. Las evaluaciones se realizaron fisicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validacion de SST-2 (872 muestras). No se especifican en la informacion disponible el numero de tokens de entrenamiento del afinado original ni la composicion del dataset mas alla de GLUE SST-2.

## Capacidades

- Clasificacion de sentimiento binaria (positivo/negativo) sobre texto en ingles, heredada del afinado en GLUE SST-2.
- Codificacion de representaciones contextuales de BERT-Base (utilizable como extractor de features si se reconstruye la topologia).
- Inferencia en CPU o GPU de gama media gracias al reducido numero de parametros (35,2 M).
- Carga via `neuralops.hub.load_surgeried_model` o reconstruccion manual con `compress_model` + `load_state_dict`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- Capacidades multilingues limitadas al ingles (vocabulario `bert-base-uncased`).
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- Clasificacion de sentimiento en tiempo real: el modelo puede desplegarse en entornos con recursos limitados (por ejemplo, funciones serverless o dispositivos edge) gracias a sus 35,2 M de parametros y su tamano de ~67 MB, clasificando resenas o tweets como positivos o negativos.
- Filtrado de resenas en pipelines de moderacion: util como primera etapa barata para descartar contenido claramente positivo o negativo antes de pasar a un modelo mayor; su baja latencia esperada permite procesar lotes grandes.
- Investigacion sobre compresion de modelos: sirve como referencia reproducible para comparar tecnicas de compresion de bajo rango (SoKA frente a poda, destilacion o cuantizacion) sobre un benchmark estandar como GLUE SST-2.
- Docencia y prototipado: ejemplo didactico de como aplicar compresion post-entrenamiento con healing LoRA y empaquetar el resultado en Hugging Face con telemetria (`compression_summary.json`).
- Benchmarking de infraestructura: util para medir throughput y latencia en GPUs de consumo (RTX 3090, RTX 4090) con un modelo BERT reducido, comparando con el profesor.
- Experimentos de ablacion: el repositorio incluye telemetria para los rangos k=256, 128, 64 y 32, lo que permite estudiar el compromiso entre ratio de compresion y precision en un mismo pipeline.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, no verificados):

| Metrica | Valor |
|---|---|
| GLUE SST-2 Validation Accuracy (k=64, con LoRA healing) | 73,05 % |
| Teacher Baseline (bert-base-uncased afinado) | 91,63 % |
| Zero-shot tras compresion k=64 | 51,38 % |
| Parity delta vs teacher | -18,58 % |

Evaluacion multi-rango sobre SST-2 validation (872 muestras, RTX 3090):

| Rank (k) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Healed Acc | Parity vs teacher |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 59,52 % | 50,92 % (LoRA) | -40,71 % |
| 128 | 2,39x | 45.782.786 (-58,2 %) | 52,41 % | 50,92 % (LoRA) | -40,71 % |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 51,38 % | 73,05 % (LoRA) | -18,58 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 50,00 % | 50,92 % (LoRA) | -40,71 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un clasificador y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 35,2 M de parametros (aproximadamente 140 MB de pesos); en la practica, cualquier GPU con 2 GB o mas es suficiente.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 son sobredimensionadas; el modelo cabe en GPUs de consumo basicas (GTX 1650, RTX 3050) e incluso en CPU.
- Cabe en cualquier GPU de consumo actual y en la mayoria de entornos edge.
- Opciones de despliegue: la carga requiere la libreria NeuralOps para reconstruir la topologia comprimida (`compress_model` + `load_state_dict`); tambien existe la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible, dado que el checkpoint no esta en formato GGUF ni safetensors estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada. La evaluacion se realizo en una RTX 3090, pero no se publican cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 Acc | Licencia | Formato |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-soka-compressor-sst2` (k=64) | 35,2 M | no disponible | 73,05 % | MIT | PyTorch + NeuralOps |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,5 M | 512 | 91,63 % | Apache 2.0 | safetensors / PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 | no disponible en la informacion | Apache 2.0 | safetensors / PyTorch |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 | no disponible en la informacion | Apache 2.0 | PyTorch |

La comparativa con DistilBERT y con el checkpoint de TextAttack no incluye cifras de precision porque no se han proporcionado en la informacion disponible. El dato relevante es que el modelo comprimido pierde 18,58 puntos frente al profesor, mientras que DistilBERT (66,9 M) suele mantenerse mucho mas cerca del rendimiento original, aunque con un ratio de compresion menor (1,6x frente a 3,11x).

## Limitaciones y advertencias

- Perdida de precision significativa: 73,05 % frente al 91,63 % del profesor, una brecha de 18,58 puntos que lo hace inadecuado para produccion sin una validacion exhaustiva en el dominio objetivo.
- El healing LoRA no es monotono: en k=256, 128 y 32 el healing empeora o iguala la precision zero-shot (50,92 %), lo que sugiere inestabilidad en el proceso de recuperacion.
- Solo ingles: el vocabulario y el afinado estan limitados a `bert-base-uncased` y SST-2.
- Solo clasificacion binaria de sentimiento: no genera texto, no hace tool calling ni razonamiento multi-paso.
- Requiere la libreria NeuralOps para cargar el checkpoint; no es compatible directamente con `transformers` sin reconstruir la topologia comprimida.
- Formato de pesos `pytorch_model.bin` (no safetensors), lo que implica riesgos de seguridad al cargar pickles de terceros; se recomienda `torch.load` con precauciones.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si hay riesgo de clasificaciones erroneas en dominios distintos de resenas de pelicula (SST-2), especialmente en texto informal o ironico.
- Licencia MIT permite uso comercial, pero la precision reducida y la dependencia de NeuralOps deben evaluarse antes de desplegar.
- Telemetria de benchmarks marcada como `verified: false`; los resultados no han sido verificados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-soka-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor SoKA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/soka_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
