# Hooshaai/bert-comp-lsc-compressor-sst2

## Resumen

`bert-comp-lsc-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido fisicamente y posteriormente "curado" con LoRA, publicado por el autor Hooshaai dentro del ecosistema NeuralOps (Compressed & LoRA-Healed Model Zoo). El modelo parte del BERT-Base original de 109.483.778 parametros, afinado sobre GLUE SST-2 (clasificacion de sentimiento binaria) y comprimido con el compresor `lsc_compressor` (familia `lsc_factory`, basada en descomposicion espectral de Fourier de bajo rango) hasta un rango `k=128`, lo que reduce el numero de parametros a 45.782.786 (-58,18 %) con una ratio de compresion fisica de 2,391x.

El interes de este checkpoint no reside en su rendimiento absoluto, sino en su valor como artefacto de investigacion sobre compresion de modelos: documenta una evaluacion Pareto multi-rango (`k=256, 128, 64, 32`) con y sin recuperacion LoRA, medida sobre la particion de validacion de GLUE SST-2 (872 muestras) en una RTX 3090. El checkpoint serializado corresponde al rango `k=128`, que alcanza un 69,04 % de accuracy tras el healing LoRA, frente al 91,63 % del profesor original.

Se trata, por tanto, de un modelo de clasificacion de texto en ingles, de licencia MIT, empaquetado en formato PyTorch (`pytorch_model.bin`) y pensado para cargarse mediante la libreria `neuralops`, no mediante `transformers` de forma directa sin reconstruir la topologia comprimida. Su relevancia actual es la de servir como referencia reproducible de tecnicas de compresion low-rank aplicadas a transformers pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimension oculta D=768, comprimido con `lsc_compressor` (familia low-rank, descomposicion espectral de Fourier) |
| Parametros totales | 45.782.786 (tras compresion a rango k=128; el modelo base tenia 109.483.778) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-Base soporta 512 tokens, pero la model card no lo declara explicitamente) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye como `pytorch_model.bin` con factores de bajo rango y adaptadores LoRA integrados; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), con `config.json` marcado con `compression_method: "lsc_compressor"` y `compression_rank: 128`; tokenizer estandar de `bert-base-uncased` (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-Base no case-sensitive: un transformer encoder de 12 capas con representaciones de 768 dimensiones y 109.483.778 parametros, afinado previamente sobre GLUE SST-2. Sobre ese modelo afinado se aplica el compresor `lsc_compressor` del registro `COMPRESSOR_REGISTRY` de NeuralOps, implementado en `neuralops/compression/low_rank/lsc_compressor.py`. Se trata de un compresor de bajo rango de tipo espectral (Fourier), que sustituye las matrices densas por factores de rango reducido. El checkpoint publicado corresponde al rango `k=128`, con un recuento fisico de 45.782.786 parametros.

El proceso de "healing" documentado es el siguiente: cuando la compresion zero-shot degrada la accuracy en mas de 2,0 puntos porcentuales y la reduccion de parametros supera 1,10x, NeuralOps aplica un ajuste LoRA dirigido con `r=8`, `50` pasos, `lr=2e-4` y un presupuesto de 45 segundos. En el rango `k=128`, la accuracy zero-shot fue del 68,12 % y tras el healing LoRA subio al 69,04 %. No se documentan en la informacion disponible los datos exactos de preentrenamiento del modelo base (numero de tokens, composicion del corpus) ni si hubo RLHF o DPO; se asume el preentrenamiento estandar de BERT-Base y el ajuste supervisado sobre SST-2.

## Capacidades

- Clasificacion de texto binaria: sentiment analysis (positivo/negativo) sobre frases en ingles, entrenado especificamente sobre GLUE SST-2.
- Inferencia sobre frases cortas en ingles con el tokenizer WordPiece de `bert-base-uncased`.
- Carga y reconstruccion mediante la API `neuralops.hub.load_surgeried_model` o mediante `compress_model` + `load_state_dict(strict=False)`.
- Capacidad de servir como referencia de compresion: el repositorio incluye telemetria multi-rango (`compression_summary.json`) para los rangos 256, 128, 64 y 32.
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", vision ni audio.
- Multilingue: no; unicamente ingles.

## Casos de uso

- Clasificacion de sentimiento en produccion de bajo coste: el checkpoint de 45,8 M de parametros y ~87,4 MB ocupa una fraccion del espacio del BERT-Base original, lo que permite desplegarlo en entornos con memoria limitada para tareas de polaridad en resenas o comentarios en ingles.
- Filtrado previo en pipelines de moderacion: usar el modelo como primer clasificador de polaridad para descartar o priorizar textos antes de pasarlos a un modelo mayor, aprovechando su bajo coste de inferencia.
- Investigacion en compresion de modelos: el checkpoint sirve como punto de comparacion reproducible para nuevas tecnicas de compresion low-rank, con metricas documentadas a cuatro rangos distintos sobre el mismo split.
- Docencia y experimentacion: ejemplo practico de flujo compress + LoRA healing sobre un transformer pequeno, con codigo de carga publicado en la model card.
- Evaluacion de degradacion por compresion: util para medir el impacto de la ratio de compresion en tareas downstream concretas, dado que el autor publica la curva Pareto completa (k=256 a k=32).
- Prototipado rapido de clasificadores SST-2: al estar afinado sobre GLUE SST-2, permite validar pipelines de evaluacion y servir como baseline comprimido frente al profesor de 91,63 %.
- Benchmarking de infraestructura: con ~87,4 MB de pesos, es adecuado para pruebas de latencia y throughput en GPUs consumer (RTX 3090 documentada) sin cuellos de botella de memoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Evaluacion sobre GLUE SST-2, split de validacion (872 muestras), en NVIDIA GeForce RTX 3090 (24 GB).

| Rank (k) | Ratio fisica | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy tras LoRA | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 67,20 % | 67,32 % (LoRA) | -24,31 % |
| **128** (checkpoint publicado) | **2,39x** | **45.782.786 (-58,2 %)** | **68,12 %** | **69,04 % (LoRA)** | **-22,59 %** |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 49,66 % | 50,92 % (LoRA) | -40,71 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 49,08 % | 64,22 % (LoRA) | -27,41 % |

Referencia del profesor: `google-bert/bert-base-uncased` afinado sobre SST-2, con 91,63 % de accuracy en validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint comprimido de 45,8 M de parametros (~183 MB de pesos); el archivo serializado ocupa ~87,4 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El autor documenta evaluacion en NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobradamente pequeno para GPUs mucho menores.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la via documentada es la libreria `neuralops` (`load_surgeried_model` o `compress_model` + carga manual del state dict) junto con `transformers` para el tokenizer y la clase `BertForSequenceClassification`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al no haber pesos GGUF ni formato generativo, estas herramientas no aplican directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo menciona un presupuesto de 45 segundos para el proceso de healing LoRA, no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `bert-comp-lsc-compressor-sst2` (k=128) | 45,78 M | No disponible | 69,04 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,48 M | 512 tokens (estandar BERT) | 91,63 % | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` |

La comparativa con DistilBERT se incluye por proximidad de tamano y tarea, pero no se dispone de su accuracy SST-2 en la informacion proporcionada, por lo que no se ofrece una comparacion numerica directa.

## Limitaciones y advertencias

- Degradacion severa de rendimiento: el checkpoint publicado pierde 22,59 puntos porcentuales de accuracy frente al profesor (69,04 % vs 91,63 %). No es apto para produccion que requiera precision alta en sentimiento.
- El resultado declarado esta marcado como `verified: false` en el model-index; no ha sido reproducido de forma independiente.
- Solo ingles: no soporta otros idiomas.
- Solo clasificacion binaria de sentimiento: no es un modelo generativo ni soporta instrucciones, tool calling ni agentes.
- Requiere la libreria `neuralops` y reconstruir la topologia comprimida antes de cargar el state dict; no es cargable directamente con `AutoModelForSequenceClassification.from_pretrained` sin ese paso.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas en dominios distintos de SST-2 (resenas de pelicula), especialmente en textos largos o con ironia.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del corpus SST-2 y del preentrenamiento de BERT-Base.
- Licencia MIT, permite uso comercial, pero la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y de los datos (GLUE SST-2) debe respetarse igualmente.
- El repositorio tiene un tamano de 0,1 GB y 43 descargas en el momento de la consulta; es un artefacto de investigacion con poca adopcion, sin garantias de mantenimiento.
- La model card incluye un `repo_id` (`tahamajs/bert-comp-lsc-compressor-sst2`) distinto del ID real del repositorio (`Hooshaai/bert-comp-lsc-compressor-sst2`), lo que puede provocar errores al ejecutar el codigo de ejemplo tal cual.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-lsc-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/lsc_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
