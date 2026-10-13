# dill-lab/GeoLadder-16M-8B-bs512-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-8B-bs512-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje de estilo OLMo desarrollado por el laboratorio dill-lab, publicado como uno de los 108 modelos que acompanan al articulo *Disentangling Geometry, Performance, and Training in Language Models* (ICML 2026). Se trata de un modelo decoder-only de aproximadamente 16 millones de parametros, entrenado sobre 8.000 millones de tokens del dataset deduplicado Pile (EleutherAI/the_pile_deduplicated) con una longitud de secuencia de 2048 tokens.

El proposito del modelo no es la produccion, sino la investigacion: forma parte de una suite disenada para estudiar si la geometria de la matriz de unembedding (en particular su rango efectivo) permite estimar el rendimiento downstream. La suite cubre modelos de 4M a 75M de parametros entrenados con variaciones controladas de batch size, weight decay, learning rate, presupuesto de tokens y LR final. La conclusion del articulo es que ninguna de esas metricas geometricas predice de forma fiable el rendimiento.

Es relevante ahora como punto de referencia reproducible y abierto para estudiar dinamicas de entrenamiento: cada paso relevante se publica como una rama del repositorio (12 ramas, de `step0` a `step7640`), y se incluyen los indices de orden de los datos de entrenamiento. Su tamano reducido permite reproducir experimentos completos en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (clase `OLMoForCausalLM`, arquitectura legacy `hf_olmo`) |
| Parametros totales | ~16M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; al ser 16M cabe en fp32/fp16/bf16 sin cuantizar) |
| Idiomas soportados | no disponible (entrenado sobre the_pile_deduplicated, de composicion predominantemente inglesa) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch), `config.json` de HF y `config.yaml` original de OLMo (no safetensors, no GGUF) |

Hiperparametros de entrenamiento declarados por el autor:

| Hiperparametro | Valor |
|---|---|
| Tamano del modelo | 16M |
| Tokens de entrenamiento | 8B |
| Batch size (secuencias de 2048 tokens) | 512 |
| Learning rate pico | 0.0087 |
| Weight decay | 0.1 |
| Decaimiento de LR (`alpha_f`, schedule coseno) | 0.01 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con la arquitectura OLMo original (registrada en `transformers` a traves del paquete `hf_olmo` como `OLMoForCausalLM`). No se documentan innovaciones arquitectonicas propias: el interes del modelo esta en el regimen de entrenamiento, no en el diseno de la red. El autor no especifica el numero de capas, dimension del modelo ni cabezas de atencion en la informacion disponible.

El entrenamiento se realizo sobre EleutherAI/the_pile_deduplicated con 8.000 millones de tokens y secuencias de 2048 tokens. La nomenclatura del repositorio codifica la configuracion exacta: 16M de parametros, 8B de tokens, batch size 512, LR pico 0.0087, weight decay 0.1 y LR final equivalente al 1 por ciento del pico (`alpha_f = 0.01`) con schedule coseno. No se mencionan fases de RLHF, DPO ni ajuste por instrucciones, por lo que cabe esperar un modelo base (preentrenado unicamente). El repositorio incluye `data-indices/` y `train_data/global_indices.npy`, que registran el orden exacto de los datos de entrenamiento, un detalle poco habitual y util para reproducibilidad.

## Capacidades

- Generacion de texto autoregresiva basica (modelo base, sin ajuste por instrucciones documentado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento es predominantemente en ingles.
- No se documenta modo de razonamiento (thinking mode), vision, audio ni capacidades multimodales.
- Capacidad relevante de facto: inspeccion de estados internos y de metricas geometricas (rango efectivo de la matriz de unembedding) a lo largo de 12 checkpoints de entrenamiento.

## Casos de uso

- Investigacion sobre geometria de representaciones: el modelo permite medir el rango efectivo del unembedding y correlacionarlo con metricas downstream, que es exactamente el objeto de estudio del articulo que lo acompana.
- Linea base de ablacion en estudios de escalado: con 16M de parametros y 8B de tokens, sirve como punto de comparacion de bajo coste frente a modelos mayores del mismo regimen de entrenamiento.
- Analisis del orden de datos de entrenamiento: la inclusión de `data-indices/` y `global_indices.npy` permite estudiar el efecto del orden de las secuencias sobre la convergencia sin tener que reentrenar.
- Estudio de dinamicas de entrenamiento por checkpoint: las 12 ramas (`step0` a `step7640`) permiten trazar la evolucion de perdida, representaciones y degradacion tardia paso a paso.
- Docencia y formacion: su tamano (1,5 GB de repositorio, ~16M de parametros) permite ejecutar entrenamiento, fine-tuning e inferencia en un portatil, ideal para cursos de NLP.
- Pruebas de infraestructura de inferencia ligera: validar pipelines de `transformers` + `hf_olmo`, scripts de evaluacion o conversiones de formato en CPU sin coste de GPU.
- Reproducibilidad de resultados de la suite GeoLadder: sirve para replicar los hallazgos del articulo sobre la relacion entre geometria y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado estudia metricas geometricas y su relacion con el rendimiento, pero no se facilitan cifras concretas de tareas estandar (MMLU, HumanEval, GSM8K, etc.) para este checkpoint en la informacion proporcionada.

## Requisitos de hardware

Estimaciones basadas en un modelo de ~16M de parametros (solo pesos, sin overhead de activaciones, que a 2048 tokens de contexto es despreciable):

- VRAM/RAM en fp32: ~64 MB.
- VRAM/RAM en fp16/bf16: ~32 MB.
- VRAM/RAM en int8: ~16 MB (si se cuantiza manualmente; no se distribuyen pesos cuantizados).
- GPU recomendadas: cualquier GPU, incluidas integradas; una RTX 4090 o una A100 estan enormemente sobredimensionadas para este modelo. Es perfectamente viable en CPU.
- Cabe en cualquier GPU de consumo, e incluso en Raspberry Pi o dispositivos embebidos.
- Opciones de despliegue: `transformers` con el paquete `hf_olmo` instalado (obligatorio para registrar `OLMoForCausalLM`) es la via documentada. Para llama.cpp, Ollama o TGI seria necesario convertir los pesos a GGUF u otro formato compatible, ya que no se distribuyen en esos formatos.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano cabe esperar latencias de milisegundos por token en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GeoLadder-16M-8B (este modelo) | ~16M | 8B | 2048 | no disponible | PyTorch (`pytorch_model.bin`) |
| GeoLadder (resto de la suite) | 4M-75M | no disponible por variante | 2048 | no disponible | PyTorch |
| Pythia-14M | ~14M | ~300B | 2048 | Apache 2.0 | safetensors/PyTorch |
| Pythia-31M | ~31M | ~300B | 2048 | Apache 2.0 | safetensors/PyTorch |

Los datos de Pythia-14M y Pythia-31M corresponden a conocimiento general sobre esa familia, no a la documentacion del autor de este modelo, y deben verificarse en su ficha oficial antes de citarlos. El propio articulo de GeoLadder toma la suite Pythia como referencia de organizacion de checkpoints.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no esta alineado para seguir ordenes ni para uso conversacional directo.
- Riesgo elevado de alucinacion y de texto incoherente fuera de distribuciones simples, dado su reducido tamano (16M de parametros).
- Capacidad de razonamiento, codigo y matematicas muy limitada por el numero de parametros; no es apto para tareas de produccion.
- Composicion linguistica del corpus (the_pile_deduplicated) predominantemente inglesa; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera bajo.
- Ventana de contexto de solo 2048 tokens.
- Licencia no especificada: no se puede asumir uso comercial libre; conviene contactar con el autor antes de cualquier uso productivo.
- Requiere el paquete `hf_olmo` y la arquitectura legacy `OLMoForCausalLM`, lo que anade friccion de integracion frente a modelos estandar de `transformers`.
- Los checkpoints se distribuyen como `pytorch_model.bin` (formato pickle), con las advertencias de seguridad habituales frente a safetensors.
- Metricas de benchmarks no publicadas: no se puede avalar su rendimiento con cifras objetivas.

## Enlaces

- HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs512-lr0.0087-wd0.1-decay0.01
- Coleccion GeoLadder: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper (PMLR): https://proceedings.mlr.press/v306/kulkarni26c.html
- arXiv: https://arxiv.org/abs/2602.20433
- OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Repositorio de la arquitectura OLMo (`hf_olmo`): no disponible en la informacion proporcionada (se referencia el paquete `ai2-olmo` en la model card sin enlace directo)
