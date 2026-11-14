# Hooshaai/bert-comp-faq-quantizer-sst2

## Resumen

`bert-comp-faq-quantizer-sst2` es un checkpoint comprimido y ajustado mediante LoRA de `google-bert/bert-base-uncased`, especializado en clasificación de sentimiento sobre el conjunto de datos GLUE SST-2. Lo desarrolla el autor Hooshaai dentro del ecosistema NeuralOps, una librería de compresión de modelos que agrupa distintos motores bajo el nombre de Compressor Zoo. El modelo emplea el compresor `FAQQuantizer` (Feature-Activation-Aware Quantization), que recopila estadísticas de activación para escalar los pasos de cuantización por canal y minimizar la distorsión de reconstrucción ponderada por activación.

El checkpoint publicado corresponde al rango de Pareto `k=32` y se distribuye como un state dict serializado en `pytorch_model.bin` de aproximadamente 214 MB. La compresión física declarada es modesta: pasa de 109.483.778 a 112.137.986 parámetros, lo que el autor describe como una reducción del 2,42 % y un ratio de compresión de 0,976x. El resultado en la validación de SST-2 es del 76,03 % de accuracy, frente al 91,63 % del modelo profesor original, una pérdida de 15,60 puntos porcentuales.

La relevancia de esta ficha es fundamentalmente metodológica: sirve como ejemplo reproducible de un pipeline de compresión con evaluación multi-rango y curación LoRA, más que como un modelo listo para producción. El modelo está pensado para inglés y para la tarea concreta de análisis de sentimiento binario, con licencia MIT sobre el código de NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), con compresión FAQQuantizer y cabecera de clasificación de 2 etiquetas |
| Parametros totales | 112.137.986 (tras compresión); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base BERT acepta hasta 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | Cuantización por canal con escalado consciente de activaciones (FAQQuantizer); el repositorio no detalla precisión efectiva (INT8/INT4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-base uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado por Google y afinado posteriormente sobre GLUE SST-2 para clasificación de sentimiento binario (negativo/positivo). Sobre ese checkpoint se aplica el motor `FAQQuantizer` de NeuralOps, que recoge estadísticas de activación para escalar los pasos de cuantización por canal y reducir la distorsión de reconstrucción ponderada por activación. El resultado se serializa con los buffers de cuantización y los factores de bajo rango integrados en el state dict.

El pipeline de evaluación de NeuralOps contempla cuatro rangos de Pareto (`k=256`, `128`, `64` y `32`) y aplica curación LoRA (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 segundos) cuando la compresión en zero-shot degrada más de 2 puntos porcentuales con una reducción superior a 1,10x. En este caso, los cuatro rangos producen exactamente el mismo recuento de parámetros y la misma accuracy (76,03 %), y la columna de curación LoRA figura como no aplicada (`LoRA Recovery Applied: False`). La evaluación se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) con el split de validación de GLUE SST-2 (872 muestras).

## Capacidades

- Clasificación de sentimiento binario en inglés (negativo/positivo) sobre textos de tipo reseña.
- Inferencia sobre secuencias cortas y medianas propias de BERT-base (hasta 512 tokens según el modelo base, no confirmado en la model card).
- Carga mediante la API universal de NeuralOps (`load_surgeried_model`) o reconstrucción manual del grafo comprimido con `compress_model` y `BertForSequenceClassification`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés; el vocabulario es el de `bert-base-uncased`.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo clasifica cada reseña como positiva o negativa en una sola pasada, con un coste de inferencia reducido al estar comprimido y caber holgadamente en cualquier GPU consumer.
- Moderación de comentarios en foros y plataformas: se puede desplegar como clasificador previo que marque comentarios negativos para revisión humana, aprovechando su baja latencia y su tamaño de 214 MB.
- Enriquecimiento de pipelines de analítica de opinión: integrar el modelo como paso de etiquetado en lotes sobre volcados de reseñas o encuestas, dado que el formato de pesos es compatible con PyTorch estándar.
- Reproducción de experimentos de compresión: sirve como referencia para comparar el efecto de FAQQuantizer frente a otros compresores de NeuralOps sobre la misma tarea y el mismo modelo base.
- Docencia y prototipado de cuantización: el repositorio incluye `compression_summary.json` con telemetría de los cuatro rangos, lo que facilita estudiar el compromiso entre tamaño y accuracy en un caso controlado.
- Baseline de clasificación en inglés dentro de pipelines de NLP: útil cuando se necesita un clasificador de sentimiento pequeño y con licencia permisiva para pruebas internas, aceptando la pérdida de accuracy frente al profesor.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Sentiment Classification | GLUE SST-2 | validation | Accuracy | 76,03 % |

Comparativa interna de rangos de compresión declarada por el autor:

| Rank (`k`) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Acc curada | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 0,98x | 112.137.986 | 76,03 % | 76,03 % | -15,60 % |
| 128 | 0,98x | 112.137.986 | 76,03 % | 76,03 % | -15,60 % |
| 64 | 0,98x | 112.137.986 | 76,03 % | 76,03 % | -15,60 % |
| 32 (publicado) | 0,98x | 112.137.986 | 76,03 % | 76,03 % | -15,60 % |

El profesor original (`google-bert/bert-base-uncased` afinado en SST-2) alcanza un 91,63 % de accuracy según la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint comprimido de 214 MB; en la práctica, unos pocos cientos de MB incluyendo tokenizador y buffers.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobradamente pequeño para GPUs de gama baja.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series 20xx y 30xx de gama baja), GTX 16xx y similares; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `transformers` y la librería `neuralops` (obligatoria para reconstruir el grafo comprimido); no se publican pesos en GGUF ni safetensors, por lo que llama.cpp, Ollama y TGI no son compatibles directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Formato |
|---|---|---:|---:|---|---|
| `bert-comp-faq-quantizer-sst2` (este) | 112.137.986 (comprimido) | no disponible | 76,03 % (declarado) | MIT | `pytorch_model.bin` |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109.483.778 | 512 tokens | 91,63 % (declarado por el autor) | Apache 2.0 (modelo base) | safetensors / PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | safetensors / PyTorch |

La comparación con DistilBERT se incluye como referencia de categoría (clasificador de sentimiento en inglés de tamaño reducido), pero no se dispone de su accuracy exacta en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de accuracy significativa: 76,03 % frente al 91,63 % del profesor, una caída de 15,60 puntos porcentuales que el autor califica explícitamente como delta de paridad negativo.
- La compresión declarada es marginal (0,976x, reducción del 2,42 % de parámetros), por lo que el ahorro real de memoria y cómputo es muy limitado en comparación con la pérdida de rendimiento.
- Los cuatro rangos de Pareto (`k=256`, `128`, `64`, `32`) producen idéntico recuento de parámetros y accuracy, lo que sugiere que el pipeline no está diferenciando efectivamente el nivel de compresión en este caso.
- La curación LoRA figura como no aplicada, de modo que no hay recuperación de accuracy tras la compresión.
- El modelo solo admite inglés y está especializado en sentimiento binario; no es un modelo de propósito general.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en dominios alejados de reseñas de producto.
- Requiere la librería `neuralops` y reconstruir el grafo comprimido antes de cargar el state dict; no es un checkpoint estándar de `transformers` cargable con `from_pretrained` directamente.
- No se publican safetensors ni GGUF, lo que limita el despliegue en runtimes optimizados (llama.cpp, vLLM, TGI).
- La licencia MIT se aplica al código de NeuralOps según el enlace indicado; conviene verificar las condiciones del modelo base BERT (Apache 2.0) al redistribuir.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en el model-index.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-faq-quantizer-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de FAQQuantizer: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/faq_quantizer.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
