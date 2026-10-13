# dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.05-decay0.01

## Resumen

GeoLadder-16M-8B-bs32-lr0.0087-wd0.05-decay0.01 es un modelo de lenguaje de 16 millones de parámetros desarrollado por el grupo dill-lab (Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta) y publicado junto al artículo «Disentangling Geometry, Performance, and Training in Language Models» (ICML 2026, PMLR 306). Forma parte de una suite controlada de 108 modelos de estilo OLMo, con tamaños entre 4M y 75M de parámetros, entrenados sobre la versión deduplicada de The Pile. El objetivo del trabajo no es ofrecer un modelo de propósito general, sino estudiar si la geometría de la matriz de *unembedding* (en concreto su rango efectivo) permite estimar el rendimiento *downstream*.

El modelo concreto de esta ficha se entrenó con 8.000 millones de tokens, tamaño de lote de 32 secuencias de 2048 tokens, *learning rate* máximo de 0,0087, *weight decay* de 0,05 y un decaimiento coseno con LR final igual al 1 % del máximo (`alpha_f = 0.01`). La nomenclatura del repositorio codifica exactamente esos hiperparámetros, de modo que cada uno de los 108 modelos de la colección es identificable por su configuración de entrenamiento.

Su relevancia es, por tanto, metodológica y de investigación: proporciona un punto de control reproducible, con 41 *checkpoints* intermedios publicados como ramas del repositorio, para estudiar dinámica de entrenamiento, geometría de representaciones y reproducibilidad del orden de los datos. No está pensado para uso en producción ni para tareas generativas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo OLMo (`OLMoForCausalLM`, arquitectura legacy `hf_olmo`) |
| Parámetros totales | 16M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en entrenamiento; no se documenta ampliación por RoPE scaling) |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; al ser PyTorch `.bin` requiere conversión propia a GGUF/otros formatos) |
| Idiomas soportados | no disponible (entrenado sobre EleutherAI/the_pile_deduplicated, corpus mayoritariamente en inglés, pero la model card no declara idiomas) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json` de HuggingFace y `config.yaml` original de OLMo |
| Tamaño del repositorio | 4,9 GB (incluye las 41 ramas de *checkpoints*: `step0` … `step122081`) |
| Número de *checkpoints* publicados | 41 (la rama `main` contiene el *checkpoint* final, `step122081`) |
| Datos auxiliares incluidos | `data-indices/` y `train_data/global_indices.npy` con el orden de los datos de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia OLMo, cargado mediante la implementación legacy `hf_olmo` (`OLMoForCausalLM`), que requiere instalar el paquete `ai2-olmo` para registrarse en `transformers`. No se documentan en la información disponible el número de capas, cabezas de atención, dimensión oculta ni el tipo exacto de codificación posicional; únicamente se confirma la ventana de 2048 tokens por secuencia.

El entrenamiento se realizó sobre `EleutherAI/the_pile_deduplicated`, con 8.000 millones de tokens procesados, lote de 32 secuencias de 2048 tokens, *peak learning rate* de 0,0087, *weight decay* de 0,05 y esquema coseno con LR final del 1 % del pico. No hay evidencia de fases de ajuste por instrucciones, RLHF o DPO: es un modelo base preentrenado. La innovación del trabajo es experimental, no arquitectónica: comparar 108 modelos entrenados con variaciones controladas de tamaño de lote, *weight decay*, *learning rate*, presupuesto de tokens y LR final para contrastar la hipótesis de que el rango efectivo de la matriz de *unembedding* predice el rendimiento. La conclusión que reportan los autores es que la relación es inconsistente: un rango efectivo alto suele acompañar a los mejores modelos, pero no de forma universal, y el rango bajo coincide con degradación tardía en lugar de causarla. Ninguna de las métricas geométricas predice de forma fiable el rendimiento *downstream*.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño del modelo (16M de parámetros) y por un presupuesto de entrenamiento de 8B de tokens.
- Modelado de lenguaje y cálculo de *perplexity* sobre texto en el dominio de The Pile.
- Reproducción exacta de la secuencia de datos de entrenamiento gracias a los índices publicados (`data-indices/`, `global_indices.npy`).
- Análisis de trayectorias de entrenamiento: las 41 ramas permiten comparar estados intermedios, al estilo de la suite Pythia.
- Extracción de representaciones internas y de la matriz de *unembedding* para estudios de geometría (rango efectivo, espectro singular).
- No dispone de soporte de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente, razonamiento multi-paso ni *thinking mode*.
- No hay modo de visión, audio ni multimodalidad.
- Capacidades multilingües: no documentadas; el corpus base es mayoritariamente inglés.
- No hay ajuste por instrucciones ni alineación, por lo que no sigue instrucciones de forma fiable.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: comparar los 41 *checkpoints* publicados (`step0` a `step122081`) para trazar cómo evolucionan la pérdida, el espectro de la matriz de *unembedding* y el rango efectivo a lo largo del entrenamiento.
- Estudios de reproducibilidad de datos: usando `data-indices/` y `train_data/global_indices.npy`, se puede replicar exactamente el orden de las secuencias y comprobar si una métrica observada depende del *shuffling* o del presupuesto de tokens.
- Ablaciones de hiperparámetros a bajo coste: al existir 108 variantes de 4M a 75M de parámetros con configuraciones controladas, este modelo sirve como punto de comparación para aislar el efecto del *learning rate*, el *weight decay* o el tamaño de lote.
- Prototipado de *pipelines* de evaluación en CPU: con 16M de parámetros el modelo se carga y ejecuta en un portátil sin GPU, lo que permite validar *harnesses* de evaluación antes de escalar a modelos grandes.
- Docencia y prácticas de laboratorio: ilustra de forma completa el ciclo de preentrenamiento (configuración OLMo, tokenizador, *checkpoints*, índices de datos) con un coste computacional mínimo.
- Análisis de interpretabilidad de representaciones: estudiar la geometría de las representaciones internas en un modelo pequeño controlado, donde los efectos de la escala no enmascaran los fenómenos.
- Generación de texto sintético de dominio muy restringido en experimentos educativos, siempre que se acepte una calidad lingüística baja comparada con modelos de miles de millones de parámetros.
- *Baseline* en estudios de escalado: sirve como referencia de la franja baja (16M) frente a los modelos de 75M de la misma suite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra tarea estándar para este modelo concreto, y el artículo asociado se centra en la relación entre métricas geométricas del *unembedding* y el rendimiento *downstream* sobre la suite completa de 108 modelos, sin que se hayan proporcionado aquí los valores por modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 64 MB en FP32 y 32 MB en BF16/FP16 solo para los pesos de 16M de parámetros; con caché KV para 2048 tokens, el consumo total se mantiene muy por debajo de 1 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas y en CPU.
- Despliegue en CPU: totalmente viable; el modelo está pensado para ejecutarse sin acelerador.
- Opciones de despliegue: `transformers` con el paquete `ai2-olmo` instalado (vía `AutoModelForCausalLM.from_pretrained` y selección de revisión por *checkpoint*). No hay soporte oficial documentado en vLLM, TGI, Ollama o llama.cpp; sería necesaria una conversión propia de `pytorch_model.bin` a GGUF.
- Latencia y *throughput*: no disponibles (no publicados). Al tratarse de 16M de parámetros, la latencia esperada es del orden de milisegundos por *forward* de 2048 tokens en CPU moderna, pero se trata de una estimación de orden de magnitud, no de una cifra medida.
- Almacenamiento: el repositorio completo ocupa 4,9 GB por las 41 ramas de *checkpoints*; un único *checkpoint* es de unas decenas de megabytes.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de su documentación pública, no de la información proporcionada en esta ficha.

| Modelo | Parámetros | Tokens de entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-16M-8B (este modelo) | 16M | 8B | 2048 | no disponible | HuggingFace (repo `dill-lab`), 0 descargas, 0 *likes* |
| Pythia-14M (EleutherAI) | 14M | 300B | 2048 | Apache-2.0 | HuggingFace, ampliamente usado como *baseline* |
| Pythia-31M (EleutherAI) | 31M | 300B | 2048 | Apache-2.0 | HuggingFace |
| Otros modelos de la suite GeoLadder | 4M–75M | variable (8B y otras configuraciones) | 2048 | no disponible | Colección `dill-lab/geoladder` en HuggingFace |

La diferencia clave frente a Pythia es el presupuesto de entrenamiento (8B tokens frente a 300B) y la ausencia de una licencia declarada, además de un propósito puramente experimental: los *checkpoints* de GeoLadder existen para estudiar geometría y dinámica de entrenamiento bajo configuraciones controladas, no para maximizar calidad generativa.

## Limitaciones y advertencias

- Sesgos: no documentados. Al entrenarse sobre The Pile deduplicado, hereda los sesgos de ese corpus (texto principalmente en inglés, sobrerrepresentación de ciertos dominios como web, código y textos académicos).
- Riesgo de alucinación: muy alto. Con 16M de parámetros y solo 8B de tokens de entrenamiento, la coherencia a escala de párrafo es limitada y la generación de hechos fiables no está garantizada.
- No está ajustado por instrucciones ni alineado (sin RLHF/DPO), por lo que no debe esperarse que siga instrucciones ni que respete formatos.
- Limitación de contexto: 2048 tokens, sin evidencia de técnicas de extensión de contexto.
- Idiomas: no se declaran idiomas soportados; el uso fuera del inglés no está validado.
- Licencia: no disponible. No se puede asumir permiso de uso comercial y sería necesario contactar con los autores antes de cualquier despliegue productivo.
- Disponibilidad: 0 descargas y 0 *likes* en el momento de la consulta, lo que implica ausencia de validación comunitaria y de soporte.
- Dependencia técnica: requiere la arquitectura legacy `hf_olmo` y el paquete `ai2-olmo`; no funciona directamente con versiones estándar de `transformers` sin ese registro previo.
- Formato: pesos en `pytorch_model.bin` (no safetensors), lo que implica cargar con `pickle` y requiere confiar en el origen del repositorio.
- Apropiado solo para investigación sobre entrenamiento y geometría de modelos; no apto para producción, atención al cliente ni generación de código.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.05-decay0.01
- Colección GeoLadder (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Artículo (PMLR 306, ICML 2026): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Ficha en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente contenido no relacionado y sin valor técnico, por lo que no se incluye ningún enlace adicional.
