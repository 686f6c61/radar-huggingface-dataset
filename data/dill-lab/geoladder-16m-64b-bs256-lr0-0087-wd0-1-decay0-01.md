# dill-lab/GeoLadder-16M-64B-bs256-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-64B-bs256-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje denso de 16 millones de parametros desarrollado por el laboratorio dill-lab y publicado en HuggingFace el 12 de octubre de 2026. Se trata de un transformer decoder-only de estilo OLMo (clase `OLMoForCausalLM`, arquitectura legacy `hf_olmo`) entrenado sobre la version deduplicada de The Pile, con una ventana de contexto de 2048 tokens y un presupuesto de 64.000 millones de tokens de entrenamiento.

El modelo no busca competir en calidad de generacion: forma parte de la suite GeoLadder, un conjunto de 108 modelos de entre 4 y 75 millones de parametros entrenados de forma controlada variando batch size, weight decay, learning rate, presupuesto de tokens y LR final. El objetivo del trabajo es estudiar si la geometria de la matriz de unembedding, en concreto su rango efectivo, permite estimar el rendimiento downstream.

Su relevancia es, por tanto, experimental y metodologica: sirve como artefacto reproducible para investigar dinamicas de entrenamiento, orden de datos y metricas geometricas, no como modelo de produccion. La model card no declara licencia ni idiomas soportados, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo OLMo (`OLMoForCausalLM`, `hf_olmo`) |
| Parametros totales | 16 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni GGUF) |
| Idiomas soportados | no disponible (el corpus, The Pile deduplicado, es mayoritariamente en ingles, pero no se declara oficialmente) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (formato legacy de OLMo/HuggingFace), mas `config.json` y `config.yaml` de OLMo |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 16 millones de parametros, implementado con la pila legacy `hf_olmo`, lo que obliga a instalar `ai2-olmo` para registrarlo en `transformers`. La informacion disponible no detalla el numero de capas, la dimensionalidad oculta, el numero de cabezas de atencion, el esquema de normalizacion ni el tipo de codificacion posicional. Tampoco se documenta el tokenizador utilizado.

El entrenamiento usa EleutherAI/the_pile_deduplicated con 64.000 millones de tokens, un batch de 256 secuencias de 2048 tokens (524.288 tokens por paso) y un total de 122.081 pasos, coherente con el presupuesto declarado. El learning rate pico es 0.0087 con schedule coseno y `alpha_f = 0.01`, es decir, un LR final de 0.000087, y un weight decay de 0.1. Se publican 41 checkpoints como ramas del repositorio (`step0` a `step122081`, con `main` apuntando al checkpoint final), siguiendo el esquema de la suite Pythia, junto con el orden exacto de los datos en `data-indices/` y `train_data/global_indices.npy`.

La innovacion no esta en la arquitectura sino en el diseno experimental: la suite permite aislar el efecto de hiperparametros de preentrenamiento (batch size, weight decay, LR, tokens, LR final) sobre metricas geometricas como el rango efectivo de la matriz de unembedding. El paper concluye que la relacion entre rango efectivo y rendimiento downstream es inconsistente: el rango alto suele acompanar a los mejores modelos pero no siempre, y el rango bajo coocurre con la degradacion tardia en lugar de causarla, sin que ninguna de estas metricas prediga el rendimiento de forma fiable.

## Capacidades

- Generacion de texto autoregresiva basica en el dominio de The Pile (texto web, libros, articulos, codigo), limitada por el tamano del modelo.
- Modelado de lenguaje causal y calculo de perplejidad, que es su uso principal como artefacto de investigacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), vision, audio ni modalidad adicional alguna.
- Capacidades multilingues: no disponibles; el corpus es mayoritariamente ingles y no hay evaluacion multilingue publicada.
- Trazabilidad del entrenamiento: se publican 41 checkpoints intermedios y los indices globales del orden de datos, lo que permite reproducir la trayectoria completa de entrenamiento.
- No se documentan capacidades de codigo, matematicas ni instruccion; no se indica que haya habido RLHF, DPO ni ajuste por instrucciones.

## Casos de uso

- Estudio de dinamicas de entrenamiento: analizar la evolucion de pesos, activaciones y metricas geometricas a lo largo de los 41 checkpoints publicados, algo inviable con modelos de mayor tamano por coste de almacenamiento y computo.
- Reproduccion de los experimentos del paper: el modelo es una de las 108 configuraciones de la suite GeoLadder, por lo que permite replicar los analisis de rango efectivo frente a rendimiento variando un solo hiperparametro cada vez.
- Investigacion sobre orden de datos: `data-indices/` y `train_data/global_indices.npy` registran el orden exacto de las secuencias, lo que permite estudiar el efecto del curriculum de datos sin ambiguedad.
- Baseline en estudios de scaling laws: al estar disponible en variantes de 4M a 75M de parametros bajo el mismo protocolo, sirve como punto de comparacion controlado frente a modelos mas grandes.
- Docencia y divulgacion: su tamano permite cargarlo, inspeccionar embeddings y visualizar matrices de atencion en un portatil, lo que facilita explicar el funcionamiento interno de un transformer sin infraestructura dedicada.
- Pruebas de infraestructura y humo (smoke tests): validar pipelines de entrenamiento distribuido, empaquetado de checkpoints, conversion de formatos o monitorizacion con un coste de computo minimo antes de escalar a modelos mayores.
- Experimentos de eficiencia y cuantizacion: al ser un modelo de 16M, permite medir el impacto de tecnicas de cuantizacion y de inferencia en CPU con ciclos de iteracion muy rapidos.
- Investigacion en interpretabilidad con recursos limitados: analisis de neuronas, circuitos o direcciones latentes con una relacion coste-resultado muy favorable para iterar hipotesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion estandar, y la busqueda web realizada no ha devuelto datos de rendimiento asociados al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 16M de parametros: en fp32 en torno a 64 MB; en fp16/bf16 en torno a 32 MB; en int8 en torno a 16 MB; en int4 en torno a 8 MB. A ello hay que sumar el overhead de activaciones y del runtime, muy reducido con contexto de 2048 tokens. Son calculos aritmeticos, no cifras publicadas por el autor.
- GPU recomendadas: no se especifica ninguna. El modelo cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650) y en GPUs integradas.
- Cabe en GPU consumer: si, en todas las gamas actuales, y la inferencia es viable directamente en CPU.
- Opciones de despliegue: `transformers` con `hf_olmo` y `ai2-olmo` instalados es la via documentada oficialmente. No hay confirmacion de soporte en vLLM, TGI, llama.cpp u Ollama; llama.cpp y Ollama requeririan una conversion a GGUF que el repositorio no proporciona.
- Latencia y throughput: no disponibles. No se publican cifras de latencia ni de tokens por segundo; por el tamano del modelo se espera una inferencia muy rapida incluso en CPU, pero no hay mediciones publicadas que lo confirmen.
- Almacenamiento: el repositorio completo ocupa 5,1 GB porque incluye 41 ramas con checkpoints; para inferencia basta con descargar una sola revision.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Contexto | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GeoLadder-16M-64B-bs256-lr0.0087-wd0.1-decay0.01 | 16M | 64B | 2048 | The Pile deduplicado | no disponible | HuggingFace (repositorio dill-lab/GeoLadder) |
| Otras variantes de la suite GeoLadder | 4M-75M (108 modelos) | no disponible por variante | no disponible | The Pile deduplicado | no disponible | HuggingFace (coleccion GeoLadder) |
| Pythia-14M | 14M | 300B | 2048 | The Pile (no deduplicado) | Apache 2.0 | HuggingFace y GitHub de EleutherAI |
| Familia OLMo | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace y GitHub de AllenAI |

Nota: los valores de la fila Pythia-14M proceden de la documentacion publica de esa suite, no de la informacion proporcionada en esta busqueda, y se incluyen porque la model card cita explicitamente el esquema de checkpoints de Pythia como referencia. La fila de la familia OLMo se incluye unicamente por ser el linaje arquitectonico del modelo; no se dispone de sus cifras en la informacion consultada.

## Limitaciones y advertencias

- Rendimiento linguistico muy limitado: con 16 millones de parametros y 64.000 millones de tokens, la calidad de generacion, la coherencia a largo plazo y la adherencia a instrucciones son muy inferiores a las de cualquier modelo actual de uso general.
- Riesgo elevado de alucinacion y de incoherencia factua, inherente a su escala; no es adecuado para tareas que requieran precision factual.
- Idiomas: no se declara soporte oficial. El corpus de entrenamiento es mayoritariamente en ingles, por lo que el comportamiento en castellano es incierto y no esta evaluado.
- Sesgos: no se documenta ningun analisis de sesgos. The Pile contiene texto web sin filtrar, por lo que es previsible que herede sesgos sociales y estereotipos de esas fuentes.
- Licencia: la model card no declara licencia, lo que impide determinar si el uso comercial esta permitido. Debe considerarse un riesgo legal hasta que el autor lo aclare.
- Compatibilidad tecnica: requiere la pila legacy `hf_olmo` (`ai2-olmo`), lo que complica su integracion en stacks modernos y puede suponer problemas de compatibilidad con versiones recientes de `transformers`.
- No hay pesos cuantizados ni GGUF publicados, por lo que el despliegue en llama.cpp, Ollama o herramientas similares exige conversion manual previa.
- No se han publicado benchmarks: no es posible comparar su calidad de forma objetiva con otros modelos, ni verificar afirmaciones de rendimiento.
- Advertencia de uso: se trata de un artefacto de investigacion disenado para estudiar geometria y dinamicas de entrenamiento. No deberia desplegarse en produccion ni exponerse a usuarios finales.
- El repositorio incluye 41 ramas de checkpoints (5,1 GB), lo que puede provocar descargas accidentales de todo el historial si no se fija una revision concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-64B-bs256-lr0.0087-wd0.1-decay0.01
- Coleccion GeoLadder (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper en PMLR (ICML 2026): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Revision en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a la planta de eneldo (dill) y a traducciones del termino, sin relacion con el proyecto dill-lab.
