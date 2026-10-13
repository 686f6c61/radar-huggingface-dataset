# dill-lab/GeoLadder-16M-32B-bs128-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-32B-bs128-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje de tipo transformer decoder-only, estilo OLMo, con 16 millones de parametros, entrenado desde cero sobre 32.000 millones de tokens del corpus deduplicado the Pile. Lo publica el grupo dill-lab como una de las 108 piezas de la suite GeoLadder, un conjunto de modelos de entre 4M y 75M de parametros entrenados bajo variaciones controladas de hiperparametros (tamano de batch, weight decay, learning rate, presupuesto de tokens y LR final). El objetivo no es ofrecer un modelo utilizable como asistente, sino servir de material experimental reproducible para estudiar como las decisiones de preentrenamiento moldean la geometria interna del modelo.

El modelo acompana al articulo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306), que investiga si la geometria de la matriz de unembedding, en particular su rango efectivo, permite estimar el rendimiento downstream. La conclusion del trabajo es negativa: el rango efectivo alto suele acompanar a los mejores modelos, pero no de forma universal, y el rango bajo coexiste con la degradacion tardia del entrenamiento en lugar de causarla. Ni el tamano de batch ni el weight decay, pese a influir fuertemente en estas metricas geometricas, predicen de forma fiable el rendimiento final.

La relevancia practica del repositorio esta en su caracter de artefacto de investigacion: publica 41 checkpoints intermedios como ramas del repositorio (siguiendo el esquema de la suite Pythia), junto con los indices de orden de los datos de entrenamiento, lo que permite reproducir la trayectoria completa de entrenamiento y auditar experimentos de interpretabilidad o de dinamica de entrenamiento a escala muy reducida y, por tanto, barata de ejecutar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (clase `OLMoForCausalLM`, arquitectura legacy `hf_olmo`) |
| Parametros totales | 16M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia empleada en el entrenamiento; no se documenta otra ventana en la model card) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en `pytorch_model.bin` |
| Idiomas soportados | No disponible; el corpus de entrenamiento (the Pile deduplicado) es mayoritariamente en ingles |
| Licencia | No disponible |
| Formato de pesos | `pytorch_model.bin` (no se publican safetensors ni GGUF) |

## Arquitectura y entrenamiento

Se trata de un modelo autorregresivo de tipo transformer decoder-only con la arquitectura OLMo en su variante legacy (`hf_olmo`), cargable mediante `OLMoForCausalLM` de la libreria `transformers` previa instalacion de `ai2-olmo`. La model card no detalla el numero de capas, dimensiones de embedding, numero de cabezas de atencion ni el vocabulario; estos datos no estan disponibles. El repositorio ocupa 5,0 GB, un tamano desproporcionado para 16M de parametros que se explica por la acumulacion de instantaneas de entrenamiento y los ficheros de indices de datos.

El entrenamiento consume 32.000 millones de tokens del dataset `EleutherAI/the_pile_deduplicated`, con secuencias de 2048 tokens y un batch de 128 secuencias (262.144 tokens por paso), lo que da lugar a los 122.081 pasos registrados. El schedule de learning rate es coseno con un pico de 0,0087, weight decay de 0,1 y un LR final equivalente al 1 % del pico (`alpha_f = 0.01`). No se documenta ningun tipo de ajuste posterior (SFT, RLHF, DPO) ni decodificacion especulativa: es un modelo exclusivamente preentrenado, disenado como sujeto de estudio y no como producto. La innovacion tecnica del trabajo es de caracter analitico, no arquitectonica: relaciona metricas geometricas de la matriz de unembedding (rango efectivo) con el rendimiento downstream y concluye que la correlacion no es consistente.

## Capacidades

- Generacion de texto autorregresiva basica: continuacion de texto y modelado de lenguaje a nivel de token, propia de un modelo de 16M de parametros entrenado sobre 32B tokens.
- Conocimiento factual limitado: la capacidad parametrica de un modelo de este tamano restringe severamente la memorizacion de hechos y el razonamiento complejo.
- Razonamiento multi-paso: no documentado ni esperable a esta escala; no hay evidencia de capacidades de cadena de pensamiento.
- Tool calling / function calling: no soportado ni documentado.
- Uso como agente: no soportado; el modelo no ha recibido ajuste por instrucciones.
- Capacidades multilingues: no documentadas; el corpus de entrenamiento es predominantemente ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Capacidad de investigacion: acceso a 41 checkpoints intermedios con indices de orden de datos, util para estudiar dinamica de entrenamiento y propiedades geometricas.
- Modo de uso previsto: extraccion de representaciones y analisis de la matriz de unembedding, mas que generacion de texto en produccion.

## Casos de uso

- Reproduccion de experimentos de geometria interna: cargar distintos checkpoints de la rama (`step0`, ..., `step122081`) y calcular el rango efectivo de la matriz de unembedding para replicar los resultados del articulo ICML 2026 sobre prediccion de rendimiento downstream.
- Estudio de la dinamica de entrenamiento a bajo coste: la trayectoria de 41 checkpoints permite analizar como evolucionan la perdida, las normas de pesos o la geometria de las representaciones paso a paso, sin necesidad de GPU de gama alta.
- Auditoria de orden de datos: los ficheros `data-indices/` y `train_data/global_indices.npy` permiten reconstruir exactamente que datos vio el modelo en cada paso, lo que habilita experimentos controlados de olvido, contaminacion o memorizacion por secuencia.
- Baseline en estudios de escalado: al formar parte de una suite de 108 modelos entre 4M y 75M de parametros, sirve como punto de comparacion fijo al evaluar tecnicas de inicializacion, curricula o regularizacion.
- Validacion de pipelines de entrenamiento e infraestructura: su tamano minimo hace viable ejecutar ciclos completos de entrenamiento y evaluacion en una sola GPU consumer para verificar harness, tokenizadores o sistemas de logging.
- Investigacion educativa y docencia: permite a estudiantes observar por dentro un entrenamiento estilo OLMo/Pythia y comparar los efectos de distintos hiperparametros entre los miembros de la coleccion GeoLadder.
- Estudio de destilacion y compresion extrema: como modelo de 16M con 32B tokens de exposicion, es un candidato natural para analizar limites inferiores de capacidad, poda y cuantizacion agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y el resumen del articulo describen el estudio de metricas geometricas y su relacion con el rendimiento downstream, pero no proporcionan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra tarea estandar para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 64 MB para los pesos (16M de parametros), mas el overhead de activaciones y el runtime de PyTorch, que dominan el consumo total.
- VRAM estimada en fp16/bf16: aproximadamente 32 MB para los pesos.
- VRAM estimada en int8: aproximadamente 16 MB para los pesos.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada con suficiente memoria pueden ejecutar el modelo.
- Inferencia en CPU: perfectamente viable; el modelo cabe en memoria RAM sin dificultad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos.
- Opciones de despliegue: `transformers` con la libreria `ai2-olmo` instalada (unico camino documentado). No hay ficheros GGUF publicados, por lo que llama.cpp u Ollama no son utilizables sin una conversion previa. No hay evidencia de soporte en vLLM ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-16M-32B | 16M | 2048 | 32B | No disponible | HuggingFace, formato `pytorch_model.bin` |
| Pythia-14M (EleutherAI) | 14M | 2048 | 300B | Apache-2.0 | HuggingFace, safetensors |
| Pythia-31M (EleutherAI) | 31M | 2048 | 300B | Apache-2.0 | HuggingFace, safetensors |
| Otros miembros de la coleccion GeoLadder | 4M-75M | 2048 | variable (presupuesto controlado) | No disponible | HuggingFace, ramas por checkpoint |

Los modelos comparables mas directos son los de la suite Pythia, que inspiraron el esquema de publicacion por checkpoints. La diferencia principal es el presupuesto de entrenamiento (32B tokens frente a 300B en Pythia) y la licencia, que en GeoLadder no esta declarada. No se dispone de datos de rendimiento que permitan comparar calidad entre ellos.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso de uso comercial. Cualquier uso en produccion requiere aclarar antes los terminos con los autores.
- Modelo de investigacion, no de proposito general: con 16M de parametros y 32B tokens, no ha recibido ajuste por instrucciones ni alineacion, y su calidad de generacion es muy limitada.
- Riesgo elevado de alucinacion y de texto incoherente: a esta escala, el modelo producira con frecuencia continuaciones gramaticales pero factualmente incorrectas o sin sentido.
- Ventana de contexto reducida a 2048 tokens y sin evidencia de extrapolacion.
- Sesgos: no hay ninguna evaluacion de sesgos publicada; el entrenamiento sobre the Pile hereda los sesgos de ese corpus.
- Cobertura idiomatica practicamente limitada al ingles, sin datos oficiales sobre otros idiomas.
- Formato de pesos `pytorch_model.bin` basado en pickle: implica riesgos de seguridad al cargar ficheros de origen no verificado y complica su uso en runtimes modernos; no se ofrecen safetensors.
- Dependencia de la libreria `ai2-olmo` y de la arquitectura legacy `hf_olmo`, lo que puede generar friccion con versiones recientes de `transformers`.
- Sin resultados de benchmarks publicados: no es posible estimar su calidad relativa frente a alternativas.
- Tamano de repositorio de 5,0 GB frente a los ~64 MB de pesos del modelo, debido a las 41 instantaneas y a los ficheros de indices.
- El DOI y la referencia bibliografica corresponden a ICML 2026 (PMLR 306); conviene verificar la version final del articulo antes de citar resultados concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-32B-bs128-lr0.0087-wd0.1-decay0.01
- Coleccion GeoLadder (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Articulo en PMLR: https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Revision en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces obtenidos trataban sobre la planta de eneldo ("dill") y no guardan relacion con el repositorio.
