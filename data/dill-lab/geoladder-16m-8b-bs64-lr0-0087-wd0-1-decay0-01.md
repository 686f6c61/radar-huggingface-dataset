# dill-lab/GeoLadder-16M-8B-bs64-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-8B-bs64-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo OLMo, desarrollado por el grupo dill-lab y publicado junto con el artículo «Disentangling Geometry, Performance, and Training in Language Models» (ICML 2026). Con 16 millones de parámetros y un presupuesto de entrenamiento de 8000 millones de tokens, no es un modelo destinado a producción, sino un artefacto de investigación: forma parte de una suite controlada de 108 modelos (de 4M a 75M de parámetros) entrenados variando de forma sistemática el tamano de batch, el weight decay, la tasa de aprendizaje, el presupuesto de tokens y el LR final.

El problema que aborda es metodológico. El artículo investiga si la geometría de la matriz de *unembedding* (en particular su rango efectivo) permite estimar el rendimiento downstream de un modelo. La conclusión es negativa: la relación es inconsistente, el rango alto acompana a menudo a los mejores modelos pero no siempre, y el rango bajo coexiste con la degradación de las fases finales del entrenamiento en lugar de causarla. Este repositorio concreto es una de las 108 ejecuciones de ese experimento, con hiperparámetros fijados y trazabilidad completa del orden de los datos de entrenamiento.

Para un desarrollador o investigador, su relevancia no está en las capacidades lingüísticas, que son deliberadamente limitadas por el tamano, sino en la reproducibilidad: se publican 38 checkpoints intermedios como ramas del repositorio (al estilo de la suite Pythia), junto con los índices de datos, lo que permite estudiar dinámicas de entrenamiento, métricas geométricas y técnicas de interpretabilidad con un coste computacional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (`OLMoForCausalLM`, arquitectura legacy `hf_olmo`) |
| Parametros totales | 16M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia empleada en el preentrenamiento; no se declara otra ventana distinta) |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar en `pytorch_model.bin`; no hay GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no declarados; el corpus de entrenamiento (the Pile deduplicated) es mayoritariamente inglés |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch), acompanado de `config.json` de HuggingFace y `config.yaml` original de OLMo |
| Tamano del repositorio | 4,4 GB (incluye 38 ramas de checkpoints) |
| Datos de entrenamiento | EleutherAI/the_pile_deduplicated |
| Presupuesto de tokens | 8B |
| Batch size | 64 secuencias de 2048 tokens |
| LR pico | 0,0087 |
| Weight decay | 0,1 |
| Decaimiento de LR | coseno con `alpha_f` = 0,01 (LR final = 1 % del pico) |
| Checkpoints | 38 ramas (`step0` ... `step61046`); `main` apunta al checkpoint final |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención causal, en la linea de los modelos OLMo de AI2, y se carga a través de la implementación legacy `hf_olmo` (`OLMoForCausalLM`), lo que exige instalar el paquete `ai2-olmo` para registrarla en `transformers`. No se dispone de información sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni si se emplean embeddings atados (*tied embeddings*) en esta configuración concreta de 16M de parámetros; la model card no detalla esos hiperparámetros arquitectónicos.

El entrenamiento es de tipo preentrenamiento autoregresivo puro sobre `EleutherAI/the_pile_deduplicated` durante 8000 millones de tokens, con 64 secuencias de 2048 tokens por paso (unas 61 046 actualizaciones), tasa de aprendizaje pico de 0,0087, weight decay de 0,1 y un schedule coseno cuyo LR final es el 1 % del pico. No hay evidencia de ajuste por instrucciones, RLHF, DPO ni ningún tipo de alineación posterior: es un modelo base. La innovación relevante no está en el modelo sino en el diseno experimental: las 108 ejecuciones de la suite comparten arquitectura y varían de forma controlada los hiperparámetros de optimización y el presupuesto de tokens, lo que permite aislar el efecto de cada elección sobre métricas geométricas como el rango efectivo de la matriz de *unembedding*. El repositorio conserva además `data-indices/` y `train_data/global_indices.npy` con el orden exacto de los datos, un requisito poco habitual y muy útil para reproducir experimentos.

## Capacidades

- Generación de texto autoregresiva: continuación de secuencias en inglés, sin seguimiento de instrucciones.
- Modelado de lenguaje y *perplexity scoring*: útil como referencia en experimentos de estimación de verosimilitud.
- Capacidad de razonamiento y conocimiento factual: muy limitada por el tamano (16M de parámetros); no debe esperarse resolución fiable de tareas de sentido común, matemáticas o lógica.
- Generación de código: no evaluada ni esperable a esta escala; no se declara soporte específico.
- Tool calling / function calling: no soportado (modelo base sin plantilla de chat ni entrenamiento para ello).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no declaradas; el corpus de entrenamiento es predominantemente anglófono.
- Capacidades especiales: ninguna (sin modo *thinking*, sin visión, sin audio, sin decodificación especulativa).
- Valor instrumental: objeto de estudio para análisis de geometría del *unembedding*, dinámicas de entrenamiento temprano y herramientas de interpretabilidad.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: comparar los 38 checkpoints publicados (`step0` ... `step61046`) para trazar la evolución del rango efectivo de la matriz de *unembedding* y contrastarla con la pérdida de validación, replicando los análisis del artículo.
- Reproducción de experimentos controlados: gracias a `train_data/global_indices.npy` y `data-indices/`, se puede reejecutar exactamente el mismo orden de datos y variar un único hiperparámetro (por ejemplo, weight decay) para aislar su efecto.
- Análisis de degradación en fases finales: el modelo usa `alpha_f` = 0,01, un LR final muy bajo; los checkpoints intermedios permiten estudiar cuándo y cómo aparecen fenómenos de degradación tardía asociados a rango bajo.
- Herramientas de interpretabilidad a bajo coste: al ocupar menos de 100 MB en precisión original, se puede ejecutar *probing* de activaciones, análisis de atención o búsqueda de circuitos en CPU sin infraestructura GPU.
- Referencia y *baseline* en estudios de escalado: sirve como punto de 16M de parámetros dentro de una familia coherente de 4M a 75M, útil para ajustar curvas de escalado con arquitectura constante.
- Validación de pipelines de evaluación: probar *harnesses* de evaluación, tokenizadores o utilidades de métricas con un modelo rápido y determinista antes de lanzarlos sobre modelos grandes.
- Docencia y formación: ejemplo real y reproducible de entrenamiento OLMo a escala diminuta, con checkpoints intermedios, para explicar tokenización, schedules de LR y publicación de artefactos.
- Investigación sobre equivalencia de métricas geométricas: usar el modelo para contrastar si el rango efectivo predice la pérdida en un régimen concreto y documentar los casos en que no lo hace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card, el resumen del artículo y los resultados de la búsqueda web no incluyen cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra tarea estándar para este modelo. El artículo se centra en métricas geométricas y de pérdida, no en una comparativa de *leaderboards*.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquiera de las precisiones habituales. Con 16M de parámetros, los pesos ocupan aproximadamente 64 MB en fp32 y 32 MB en fp16/bf16; el resto corresponde a activaciones y caché KV para secuencias de 2048 tokens.
- GPU recomendadas: cualquiera, incluidas GPUs integradas o iGPU. Una RTX 4090 o una A100 son enormemente sobredimensionadas para este modelo; su uso solo tendría sentido para ejecutar los 108 modelos de la suite en paralelo.
- Viabilidad en hardware de consumo: sí, sin ninguna duda, en cualquier GPU de consumo de las últimas dos décadas y también en CPU.
- Opciones de despliegue: `transformers` con el paquete `ai2-olmo` instalado es la vía soportada. El soporte en vLLM, Text Generation Inference, llama.cpp u Ollama no está confirmado y no se publican pesos en formato GGUF, por lo que requeriría una conversión manual no documentada.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Los datos de rendimiento de este modelo no están publicados, por lo que la comparación se limita a especificaciones y disponibilidad. Los modelos más cercanos por escala son Pythia-14M (EleutherAI) y GPT-2 small (OpenAI), aunque con presupuestos de entrenamiento muy distintos.

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| GeoLadder-16M (este modelo) | 16M | 2048 | 8B | no disponible | PyTorch (`pytorch_model.bin`) |
| Pythia-14M | 14M | 2048 | 300B (the Pile) | Apache 2.0 | safetensors y PyTorch |
| GPT-2 small | 124M | 1024 | ~40B (WebText) | MIT | PyTorch, TensorFlow |
| OLMo-1B | ~1,2B | 2048 | ~2-3B (fase inicial de OLMo) | Apache 2.0 | safetensors |

La diferencia clave frente a Pythia-14M es el presupuesto de tokens: 8B frente a 300B, es decir, unas 37 veces menos datos, lo que sitúa a GeoLadder-16M muy por debajo en calidad lingüística. Su ventaja comparativa es la trazabilidad: 38 checkpoints con índices de datos explícitos y una suite experimental disenada para aislar variables de optimización, algo que ni Pythia ni GPT-2 ofrecen con ese nivel de control sobre hiperparámetros.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones, no mantiene formato de chat y puede producir continuaciones incoherentes u ofensivas si se le da un prompt inapropiado.
- Capacidad muy limitada: con 16M de parámetros y 8B de tokens, la cobertura factual, la coherencia a largo plazo y el razonamiento son muy inferiores a los de cualquier modelo actual de uso general; no es apto para tareas de producción.
- Sesgos: hereda los sesgos presentes en the Pile deduplicated, corpus de origen web con sobrerrepresentación de inglés, contenido técnico y determinadas perspectivas culturales.
- Alucinación: el riesgo es alto y estructural, ya que no hay ajuste por preferencias ni verificación factual; genera texto plausible sin garantía de veracidad.
- Idioma: no se declaran idiomas soportados y el corpus es mayoritariamente inglés; el rendimiento en castellano u otras lenguas no está evaluado ni es previsible que sea aceptable.
- Licencia no disponible: la ausencia de licencia explícita impide asumir permisos de uso comercial. Debe tratarse como artefacto de investigación hasta que el autor aclare los términos.
- Dependencia técnica: requiere la arquitectura legacy `hf_olmo` y el paquete `ai2-olmo`; no funciona con una instalación estándar de `transformers` sin ese registro previo, y no hay pesos en safetensors ni GGUF.
- Ramas de checkpoint: el repositorio pesa 4,4 GB porque contiene 38 ramas; descargar el repositorio completo sin filtrar por revisión consume mucho más espacio que los ~64 MB del modelo final.
- Uso en producción desaconsejado: cualquier despliegue orientado a usuarios finales debería emplear un modelo mayor y con licencia clara.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs64-lr0.0087-wd0.1-decay0.01
- Colección GeoLadder (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Artículo (PMLR 306): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Discusión en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Implementación OLMo de AI2 (paquete `ai2-olmo` requerido): https://github.com/allenai/OLMo
