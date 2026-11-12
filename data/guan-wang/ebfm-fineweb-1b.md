# guan-wang/EBFM-FineWeb-1B

## Resumen

EBFM-FineWeb-1B es un modelo de lenguaje de tipo energy-based (EBFM, energy-based foundation model) desarrollado por guan-wang y publicado bajo el paraguas del proyecto OpenEBFM del Data Mining Lab (datamllab). Se trata de un checkpoint de preentrenamiento de aproximadamente 1.028 millones de parámetros (etiquetado comercialmente como "1B", variante d26) entrenado sobre el corpus FineWeb y exportado en formato compatible con Transformers. A diferencia de los transformers autorregresivos convencionales, el modelo se enmarca en la familia de modelos de energía, que puntúan secuencias mediante una función de energía en lugar de modelar directamente la probabilidad del siguiente token.

El modelo se distribuye con pipeline `fill-mask` y requiere código remoto propio (`trust_remote_code=True`), ya que implementa una arquitectura personalizada recogida en `modeling_ebfm.py` y `configuration_ebfm.py`. Su relevancia actual reside en que forma parte de una línea de investigación emergente (OpenESM / OpenEBFM) que propone modelos dirigidos por energía como alternativa escalable a los paradigmas de modelado del lenguaje dominantes; el informe técnico asociado es arXiv:2610.33005.

Se trata de un checkpoint de investigación con escasa tracción en la comunidad (64 descargas y 1 like en el momento de la consulta), sin datos publicados de benchmarks ni de composición detallada del dataset, por lo que debe evaluarse como material de experimentación más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenEBFM personalizada (energy-based language model), variante d26; 26 bloques transformer, dimensión de embedding 1664, 13 cabezas de atención |
| Parametros totales | 1.028.275.456 (aprox. 1,03 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), con código remoto Python (`modeling_ebfm.py`, `configuration_ebfm.py`) y tokenizador serializado (`tokenizer.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es una implementación propia de OpenEBFM (energy-based foundation model) con 26 bloques transformer, dimensión de embedding de 1664 y 13 cabezas de atención. El modelo se formula como un modelo de lenguaje basado en energía: en lugar de una cabeza de lenguaje autorregresiva clásica, aprende una función de energía que puntúa secuencias, lo que encaja con el pipeline `fill-mask` declarado en la model card. El vocabulario es de 32.768 tokens y la ventana de contexto de 2.048 tokens, valores leídos de la configuración exportada del checkpoint.

El entrenamiento corresponde únicamente a la fase de preentrenamiento sobre el corpus FineWeb. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset, ni si hubo fases posteriores de ajuste (RLHF, DPO, SFT). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. El repositorio incluye una tabla de bytes del tokenizador (`token_bytes.pt`) empleada por las métricas de OpenEBFM, lo que sugiere que la evaluación del modelo se realiza con métricas basadas en bytes/tokens propias del framework.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) mediante puntuación por energía de secuencias.
- Puntuación y ranking de secuencias candidatas, aprovechando la formulación energy-based.
- Extracción de representaciones internas a través de los 26 bloques transformer (uso como encoder para tareas descendentes).
- Generación de texto: no documentada explícitamente en la model card; el pipeline declarado es fill-mask, no text-generation.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en modelos de energía: el modelo sirve como referencia reproducible para estudiar la formulación EBFM, comparar funciones de energía y analizar el comportamiento de la arquitectura d26 frente a transformers autorregresivos de tamaño similar.
- Rellenado de huecos (fill-mask) en textos técnicos: dado su pipeline nativo, puede emplearse para predecir tokens enmascarados en corpus de dominio, siempre con validación manual por la ausencia de benchmarks.
- Puntuación de candidatos en sistemas de ranking: la función de energía permite ordenar secuencias alternativas (por ejemplo, respuestas candidatas o traducciones) sin necesidad de decodificación autoregresiva.
- Extracción de embeddings para clasificación: las representaciones de los 26 bloques y 1664 dimensiones pueden alimentar clasificadores ligeros en tareas de NLP supervisado.
- Reproducción de experimentos del informe técnico OpenESM (arXiv:2610.33005): útil para investigadores que quieran replicar resultados del paper con el checkpoint público.
- Fine-tuning académico con recursos limitados: con ~1B parámetros y licencia MIT, es viable ajustarlo en una GPU de 24-48 GB para tareas de investigación específicas.
- Base para destilación o comparación de paradigmas: permite contrastar el rendimiento de un modelo de energía frente a un transformer causal del mismo orden de magnitud en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,1 GB solo para pesos (1,03 B × 2 bytes), más overhead de activaciones y del código remoto; en la práctica, entre 4 y 6 GB para batches pequeños con contexto de 2.048 tokens.
- VRAM estimada en FP32: unos 4,1 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090); A100/H100 sobredimensionadas para este tamaño, útiles solo para entrenamiento o evaluación por lotes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB).
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura es personalizada y no está integrada en esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBFM-FineWeb-1B | ~1,03 B | 2048 | Energy-based (OpenEBFM d26) | MIT | Hugging Face, código remoto |
| TinyLlama-1.1B | ~1,1 B | 2048 | Transformer decoder autorregresivo | Apache 2.0 | Hugging Face, ampliamente integrado |
| GPT-2 (1.5B) | ~1,5 B | 1024 | Transformer decoder autorregresivo | MIT | Hugging Face, integrado en todos los runtimes |
| OPT-1.3B | ~1,3 B | 2048 | Transformer decoder autorregresivo | OPT-175B License | Hugging Face, integrado en vLLM/TGI |

La comparación es estructural: EBFM-FineWeb-1B comparte escala con TinyLlama y OPT-1.3B, pero difiere en paradigma (energía frente a autorregresivo), en integración de ecosistema (requiere código remoto, sin soporte confirmado en vLLM/llama.cpp) y en madurez (checkpoint de investigación con 64 descargas frente a modelos con millones de descargas). No hay datos de rendimiento que permitan comparar calidad.

## Limitaciones y advertencias

- Modelo de investigación: sin benchmarks publicados, sin evaluación de calidad y con tracción mínima en la comunidad; no apto para producción sin validación exhaustiva propia.
- Requiere `trust_remote_code=True`: ejecuta código Python del autor del repositorio, lo que implica un riesgo de seguridad que debe auditarse antes de desplegar.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Idiomas soportados no declarados: no se puede asumir buen rendimiento en castellano ni en ningún idioma concreto.
- Riesgo de alucinación: no evaluado; al ser un modelo de energía con pipeline fill-mask, su comportamiento generativo no está documentado.
- Sesgos: no evaluados; el entrenamiento sobre FineWeb hereda los sesgos del corpus web filtrado, sin que se documenten mitigaciones.
- Licencia MIT: permite uso comercial, pero al tratarse de un checkpoint de preentrenamiento sin ajuste, el uso comercial requeriría fine-tuning y evaluación propios.
- Arquitectura personalizada: no compatible con runtimes estándar de alto rendimiento (vLLM, TGI, llama.cpp) sin trabajo de portabilidad.
- Tokenizador serializado en `tokenizer.pkl`: requiere cargar código remoto para deserializarlo, lo que añade superficie de ataque.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/EBFM-FineWeb-1B
- Repositorio de código OpenEBFM: https://github.com/datamllab/openebfm
- Informe técnico (OpenESM: Energy-Steered Models Are Scalable Foundation Learners): https://huggingface.co/papers/2610.33005
- Preprint en arXiv: https://arxiv.org/abs/2610.33005
