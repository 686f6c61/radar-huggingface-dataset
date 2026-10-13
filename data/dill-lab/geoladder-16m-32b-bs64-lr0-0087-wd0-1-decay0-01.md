# dill-lab/GeoLadder-16M-32B-bs64-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-32B-bs64-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje de 16 millones de parámetros desarrollado por el grupo de investigación dill-lab (Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta). Se trata de un modelo con arquitectura transformer decoder-only de estilo OLMo, entrenado desde cero sobre la versión deduplicada de The Pile (EleutherAI/the_pile_deduplicated) durante 32.000 millones de tokens. No es un modelo orientado a producción, sino un artefacto de investigación liberado como parte de una suite controlada de 108 modelos.

El objetivo que persigue es puramente científico: el artículo asociado ("Disentangling Geometry, Performance, and Training in Language Models", ICML 2026) investiga si la geometría de la matriz de unembedding, en particular su rango efectivo, permite estimar el rendimiento downstream de un modelo. Para ello se entrenaron 108 modelos OLMo de entre 4M y 75M de parámetros variando de forma controlada el tamaño de batch, el weight decay, la tasa de aprendizaje, el presupuesto de tokens y el LR final. La conclusión del trabajo es que dicha relación no es consistente: un rango efectivo alto suele acompañar a los mejores modelos, pero no siempre, y el rango bajo coocurre con degradación tardía en lugar de causarla.

Este repositorio concreto corresponde a un único punto de la retícula experimental y es relevante para quienes estudian dinámicas de entrenamiento, fenómenos de escalado o análisis de representaciones internas, no para aplicaciones de generación de texto de calidad. Incluye 44 checkpoints intermedios publicados como ramas del repositorio, lo que permite analizar la evolución del modelo a lo largo del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (`OLMoForCausalLM`, legacy `hf_olmo`) |
| Parametros totales | 16M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenado sobre The Pile deduplicado, predominantemente ingles) |
| Licencia | No disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch binario); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo en su variante legacy (`hf_olmo`), es decir, un transformer decoder-only con atención causal estándar. Para cargarlo es imprescindible instalar el paquete `ai2-olmo`, que registra `OLMoForCausalLM` en `transformers`. El repositorio de 5,4 GB incluye, por cada uno de los 44 checkpoints intermedios publicados (ramas `step0` a `step244151`), un fichero `pytorch_model.bin`, el `config.json` de HuggingFace y el `config.yaml` original de OLMo; la rama `main` contiene el checkpoint final (`step244151`). También se registran los índices de datos de entrenamiento en `data-indices/` y `train_data/global_indices.npy`.

Los hiperparámetros de entrenamiento están codificados en el propio nombre del repositorio: 32.000 millones de tokens, tamaño de batch de 64 secuencias de 2048 tokens (aproximadamente 131.072 tokens por paso, lo que da unos 244.000 pasos), tasa de aprendizaje máxima de 0.0087 con schedule coseno, weight decay de 0.1 y `alpha_f` de 0.01 (el LR final es el 1% del LR máximo). El modelo se entrenó sobre la versión deduplicada de The Pile. No se documenta en la información disponible el uso de RLHF, DPO ni SFT posteriores; se trata de un modelo estrictamente preentrenado.

## Capacidades

- Generación de texto autoregresiva básica, limitada por su tamaño de 16M de parámetros.
- Modelado de lenguaje causal para investigación sobre representaciones internas y matrices de unembedding.
- Análisis de dinámica de entrenamiento gracias a los 44 checkpoints intermedios publicados.
- No dispone de soporte documentado de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de razonamiento avanzado, matemáticas, código, visión ni audio.
- No dispone de modo "thinking" ni de decodificación especulativa u otras optimizaciones de inferencia.

## Casos de uso

- Investigación sobre geometría de representaciones: calcular el rango efectivo de la matriz de unembedding y correlacionarlo con métricas downstream, replicando el análisis del artículo asociado.
- Estudios de escalado controlado: comparar este modelo (16M) con los otros modelos de la suite GeoLadder (4M-75M) manteniendo el resto de hiperparámetros fijos para aislar el efecto del tamaño.
- Análisis de trayectorias de entrenamiento: cargar distintos checkpoints (`step0`, `step78000`, `step244151`, etc.) y estudiar cómo evolucionan los pesos, la pérdida o las activaciones a lo largo de los 244.000 pasos.
- Reproducción de experimentos de dinámica de entrenamiento: el registro de índices de datos (`data-indices/`, `train_data/global_indices.npy`) permite reconstruir el orden exacto de los datos vistos por el modelo.
- Docencia y prototipado educativo: modelo pequeño y ligero para enseñar pipelines de `transformers` con la arquitectura OLMo, sin necesidad de hardware especializado.
- Validación de infraestructura de carga de modelos legacy: comprobar la compatibilidad de `ai2-olmo` y `transformers` en entornos nuevos antes de desplegar modelos OLMo de mayor tamaño.
- Estudios de degradación tardía: analizar si el rango efectivo bajo coocurre con la degradación observada en fases finales del entrenamiento, tal y como describe el paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de búsqueda consultados no incluyen métricas como MMLU, HumanEval o GSM8K para este modelo, y el artículo asociado se centra en métricas geométricas y de pérdida más que en benchmarks de tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 64 MB de pesos; en fp16, unos 32 MB; en int8, unos 16 MB. Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior, T4, A100, H100) es más que suficiente; el modelo no requiere aceleración dedicada.
- Cabe en GPU consumer: sí, sin ninguna restricción práctica; también funciona en CPU y en entornos sin GPU.
- Opciones de despliegue: `transformers` junto con `ai2-olmo` (obligatorio por la arquitectura `hf_olmo`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF o safetensors limita su uso en estos entornos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-16M-32B (este modelo) | 16M | 2048 tokens | No disponible | No disponible | HuggingFace (repo `dill-lab`) |
| Otros modelos de la suite GeoLadder | 4M-75M | 2048 tokens | No disponible | No disponible | Coleccion GeoLadder en HuggingFace |
| Modelos Pythia (referencia de estilo) | 14M-12B | 2048 tokens | No disponible en esta ficha | Apache 2.0 (segun el autor de Pythia) | HuggingFace (EleutherAI) |

La model card indica explícitamente que el esquema de checkpoints sigue el de la suite Pythia, por lo que los modelos Pythia son la referencia metodológica más cercana. No se dispone de datos de rendimiento comparativos verificados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles de forma explícita; el entrenamiento sobre The Pile hereda los sesgos presentes en ese corpus.
- Riesgo de alucinación: muy alto, dado que se trata de un modelo preentrenado de 16M de parámetros sin ajuste por instrucciones ni alineación.
- Limitaciones de contexto e idioma: contexto de 2048 tokens y entrenamiento predominantemente en inglés sobre The Pile; el rendimiento en castellano u otros idiomas no está documentado.
- Restricciones de licencia: la licencia no está especificada en la información disponible, por lo que no puede asumirse su uso comercial libre sin consultar al autor.
- Caveat de producción: es un artefacto de investigación, no un modelo destinado a aplicaciones reales de generación. Su calidad de texto será muy limitada.
- Dependencia técnica: requiere el paquete `ai2-olmo` y la arquitectura legacy `hf_olmo`; no es cargable con `transformers` estándar sin ese paquete.
- Formato de pesos binario (`pytorch_model.bin`) sin safetensors ni GGUF, lo que puede complicar su integración en determinados pipelines.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-32B-bs64-lr0.0087-wd0.1-decay0.01
- Colección GeoLadder: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper (PMLR 306): https://proceedings.mlr.press/v306/kulkarni26c.html
- arXiv: https://arxiv.org/abs/2602.20433
- OpenReview: https://openreview.net/forum?id=kNb6NNhKgE

Nota: los resultados de búsqueda web disponibles no aportaron enlaces relevantes sobre el modelo; únicamente devolvieron páginas sobre la planta "dill" (eneldo), sin relación con el repositorio.
