# dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.1

## Resumen

GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.1 es un modelo de lenguaje de 16 millones de parametros entrenado por el grupo dill-lab sobre la version deduplicada de The Pile (EleutherAI/the_pile_deduplicated), con un presupuesto de 8.000 millones de tokens. No es un modelo orientado a produccion, sino una pieza de un estudio controlado: forma parte de una suite de 108 modelos de estilo OLMo, de entre 4M y 75M de parametros, entrenados variando sistematicamente el tamano de batch, el weight decay, la tasa de aprendizaje, el presupuesto de tokens y el decaimiento final de la tasa de aprendizaje.

El objetivo del trabajo del que nace, "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026), es determinar si la geometria de la matriz de unembedding de un modelo, en particular su rango efectivo, permite estimar su rendimiento downstream. La conclusion es negativa: la relacion no es consistente. Un rango efectivo alto acompana a menudo a los mejores modelos, pero no siempre, y el rango bajo coexiste con la degradacion tardia del entrenamiento en lugar de causarla. Las decisiones de preentrenamiento, como el tamano de batch o el weight decay, moldean fuertemente estas metricas geometricas, pero ninguna de ellas predice de forma fiable el rendimiento final.

El modelo se publica con 41 checkpoints intermedios (ramas step0 a step122081) junto con los indices de orden de los datos de entrenamiento, lo que lo convierte en un artefacto pensado para investigacion en interpretabilidad, dinamica de entrenamiento y analisis geometrico, no para despliegue en aplicaciones. Su arquitectura es la legacy hf_olmo (OLMoForCausalLM) y requiere la libreria ai2-olmo para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (OLMoForCausalLM / hf_olmo) |
| Parametros totales | 16M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en el entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos PyTorch en precision completa) |
| Idiomas soportados | No disponible de forma explicita; datos de entrenamiento en the_pile_deduplicated, de composicion predominantemente inglesa |
| Licencia | No disponible |
| Formato de pesos | pytorch_model.bin (PyTorch), acompanado de config.json y del config.yaml original de OLMo |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de 16M de parametros con la arquitectura OLMoForCausalLM, la implementacion legacy de OLMo registrada en transformers mediante la libreria hf_olmo. El entrenamiento se realizo sobre EleutherAI/the_pile_deduplicated, la version deduplicada de The Pile, con un presupuesto total de 8.000 millones de tokens. La configuracion del run es: batch de 32 secuencias de 2048 tokens, tasa de aprendizaje maxima de 0,0087, weight decay de 0,1 y un factor de decaimiento final alpha_f de 0,1 sobre un schedule coseno, lo que implica una tasa de aprendizaje final de 0,00087.

El interes tecnico del modelo no reside en la arquitectura, sino en el diseno experimental. Forma parte de una suite de 108 modelos de entre 4M y 75M de parametros entrenados con variaciones controladas de hiperparametros, lo que permite aislar el efecto de cada decision de preentrenamiento sobre metricas geometricas como el rango efectivo de la matriz de unembedding. Cada checkpoint subido es una rama del repositorio (41 ramas, de step0 a step122081), siguiendo el mismo esquema que la suite Pythia, y el repositorio incluye el directorio data-indices/ y el fichero train_data/global_indices.npy, que registran el orden exacto en que se consumieron los datos de entrenamiento. No hay informacion sobre fases de RLHF, DPO u otros ajustes posteriores al preentrenamiento.

## Capacidades

- Generacion de texto autorregresiva basica en ingles, condicionada por la distribucion de The Pile deduplicado.
- Modelado de lenguaje y calculo de log-probabilidades sobre secuencias, util para analisis de representaciones y de la matriz de unembedding.
- Analisis de dinamica de entrenamiento: las 41 ramas de checkpoints permiten estudiar la evolucion temporal de pesos, activaciones y metricas geometricas.
- Reproduccion de trayectorias de entrenamiento: los indices de datos publicados permiten reconstruir el orden de consumo de tokens.
- No se ha documentado soporte de tool calling ni de function calling.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso.
- No se ha documentado capacidad multilingue explicita; el modelo carece de ajuste de instrucciones.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Investigacion en interpretabilidad: el modelo y sus 41 checkpoints permiten estudiar como evolucionan las representaciones internas y la matriz de unembedding a lo largo del entrenamiento, con el orden de datos publicado como variable de control.
- Evaluacion de metricas geometricas: rango efectivo, espectro de valores singulares y otras propiedades de la matriz de unembedding pueden correlacionarse con metricas downstream en un modelo de coste computacional minimo.
- Estudios de scaling controlado: al compartir receta con otros 107 modelos de la coleccion GeoLadder, permite aislar el efecto de batch size, weight decay, learning rate y presupuesto de tokens sobre el rendimiento.
- Analisis de degradacion tardia del entrenamiento: las ramas intermedias hacen posible localizar el punto en que aparece el deterioro de metricas y compararlo con la evolucion del rango efectivo.
- Reproducibilidad de experimentos: los indices de datos y el config.yaml original permiten replicar exactamente la secuencia de entrenamiento en un entorno propio.
- Docencia y prototipado de bajo coste: con 16M de parametros, el modelo se ejecuta en CPU o en cualquier GPU consumer, lo que lo hace util para ensenar el funcionamiento interno de un transformer sin requerir infraestructura.
- Pruebas de pipelines de entrenamiento: sirve como modelo de juguete para validar herramientas de logging, checkpointing o conversion de formatos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra tarea estandar, y el paper asociado se centra en la relacion entre geometria y rendimiento, no en la publicacion de resultados comparativos por modelo.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 64 MB solo para los pesos, mas el coste de activaciones y del cache KV para 2048 tokens, marginal en la practica.
- VRAM en FP16/BF16: aproximadamente 32 MB para los pesos.
- VRAM en int8: aproximadamente 16 MB para los pesos (requiere cuantizacion propia, no se distribuye en ese formato).
- GPU recomendadas: cualquier GPU. El modelo cabe holgadamente en RTX 3060, RTX 4090, A100, H100 o incluso en GPUs integradas. Tambien se ejecuta en CPU sin dificultad.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en hardware muy limitado.
- Opciones de despliegue: transformers con la libreria ai2-olmo (hf_olmo) es la via oficial. La conversion a GGUF para llama.cpp u Ollama es tecnicamente posible pero no se distribuye hecha. vLLM y TGI no estan documentados para esta arquitectura legacy.
- Tamano del repositorio completo: 4,9 GB, debido a que incluye las 41 ramas de checkpoints, no al tamano del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Dataset | Licencia | Formato |
|---|---|---|---|---|---|---|
| GeoLadder-16M-8B (este modelo) | 16M | 2048 | 8B | the_pile_deduplicated | No disponible | pytorch_model.bin |
| Pythia-14M | 14M | 2048 | 300B | The Pile | Apache 2.0 | safetensors / PyTorch |
| Pythia-70M | 70M | 2048 | 300B | The Pile | Apache 2.0 | safetensors / PyTorch |
| OLMo-1B | ~1.200M | 2048 | 2T (Dolma) | Dolma | Apache 2.0 | safetensors |

La comparacion relevante es con Pythia-14M, por tamano casi identico y por compartir el esquema de publicacion de multiples checkpoints. La diferencia principal es el presupuesto de entrenamiento: 8B tokens frente a 300B, lo que hace que este GeoLadder sea mucho menos capaz como modelo de lenguaje, pero mas util como sujeto de estudio controlado dentro de una suite de 108 configuraciones. Frente a OLMo-1B la diferencia de escala es de dos ordenes de magnitud. No se dispone de resultados de benchmarks que permitan comparar rendimiento real entre estas alternativas.

## Limitaciones y advertencias

- Modelo de investigacion, no apto para produccion: con 16M de parametros y 8B tokens de entrenamiento, su calidad de generacion de texto es muy limitada.
- No ha pasado por ajuste de instrucciones (instruction tuning) ni por RLHF o DPO, por lo que no sigue instrucciones de forma fiable.
- Riesgo elevado de alucinacion y de generar texto incoherente o factualmente incorrecto.
- Sesgos conocidos: hereda los sesgos presentes en The Pile deduplicado, aunque no se ha publicado una evaluacion especifica de sesgos para este modelo.
- Limitacion de idioma: los datos de entrenamiento son predominantemente en ingles y no se declaran idiomas soportados.
- Limitacion de contexto: 2048 tokens, adecuado para experimentos pero insuficiente para tareas que requieran contexto largo.
- Licencia no especificada: al no indicarse licencia, no puede asumirse permiso para uso comercial. Conviene contactar con los autores antes de cualquier uso mas alla de la investigacion.
- Carga no estandar: requiere la libreria ai2-olmo y la arquitectura legacy hf_olmo, lo que puede generar incompatibilidades con versiones recientes de transformers u otras herramientas de despliegue.
- Pesos en pytorch_model.bin: no se distribuyen en safetensors ni en GGUF, lo que anade pasos de conversion para cualquier despliegue optimizado.
- Sin senal de adopcion: cero descargas y cero likes en el momento de la consulta, por lo que no existe una comunidad que haya validado su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.1
- Coleccion GeoLadder completa: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper (PMLR 306): https://proceedings.mlr.press/v306/kulkarni26c.html
- arXiv: https://arxiv.org/abs/2602.20433
- OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
