# dill-lab/GeoLadder-40M-32B-bs256-lr0.0065-wd0.1-decay0.01

## Resumen

GeoLadder-40M-32B-bs256-lr0.0065-wd0.1-decay0.01 es un modelo de lenguaje de 40 millones de parametros desarrollado por el grupo dill-lab (Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta), publicado como parte del articulo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306). No es un modelo destinado a produccion ni a uso conversacional: es uno de los 108 modelos de un suite de estudio controlado, todos ellos de estilo OLMo y con tamanos de entre 4M y 75M de parametros.

El problema que aborda el trabajo es metodologico: determinar si la geometria de la matriz de unembedding (en concreto su rango efectivo) permite estimar el rendimiento downstream de un modelo. La conclusion del paper es negativa: la relacion es inconsistente, el rango efectivo alto suele acompanar a los mejores modelos pero no de forma universal, y el rango bajo coexiste con la degradacion de la fase final del entrenamiento en lugar de causarla. Las decisiones de preentrenamiento, como el tamano de batch y el weight decay, moldean fuertemente esas metricas geometricas, pero ninguna de ellas predice de forma fiable el rendimiento.

Este repositorio concreto corresponde a una configuracion especifica del suite: 40M de parametros, 32B tokens de entrenamiento, batch de 256 secuencias de 2048 tokens, learning rate pico de 0.0065, weight decay de 0.1 y decaimiento coseno con LR final del 1% del pico. Es relevante para investigadores que estudien dinamica de entrenamiento, geometria de representaciones y checkpoints intermedios, no como herramienta de inferencia general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo OLMo (`OLMoForCausalLM`, arquitectura legada `hf_olmo`); numero de capas y cabezas no disponible |
| Parametros totales | 40M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en entrenamiento; no se declara un valor distinto en la model card) |
| Tipos de cuantizacion | no disponible (los pesos subidos estan en `pytorch_model.bin`, presumiblemente fp32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no declarado; el corpus de entrenamiento (`EleutherAI/the_pile_deduplicated`) es predominantemente en ingles |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch), acompanado de `config.json` y del `config.yaml` original de OLMo; requiere el paquete `ai2-olmo` |
| Tamano del repositorio | 10.1 GB (incluye 38 ramas con checkpoints de distintos pasos) |
| Tokens de entrenamiento | 32B |
| Dataset | `EleutherAI/the_pile_deduplicated` |
| Batch size | 256 secuencias de 2048 tokens (524.288 tokens por paso) |
| Pasos de entrenamiento | 61.046 (`step0` a `step61046`; `main` corresponde al checkpoint final) |
| Learning rate pico | 0.0065 |
| Scheduler | coseno con `alpha_f = 0.01` (LR final = 1% del pico) |
| Weight decay | 0.1 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only causal de estilo OLMo, cargado mediante la implementacion legada `OLMoForCausalLM` que registra el paquete `hf_olmo` sobre `transformers`. La model card no detalla el numero de capas, cabezas de atencion, dimension oculta ni el vocabulario, por lo que esos datos quedan como no disponibles. El repositorio incluye tanto el `config.json` de HuggingFace como el `config.yaml` original de OLMo, que son la fuente autoritativa para esos hiperparametros de arquitectura.

El entrenamiento es exclusivamente de preentrenamiento sobre `EleutherAI/the_pile_deduplicated` (la version deduplicada del Pile), sin que la model card mencione ninguna fase posterior de ajuste fino supervisado, RLHF, DPO o similares. La cuenta de tokens cuadra con los hiperparametros declarados: 61.046 pasos por 524.288 tokens por paso equivalen a aproximadamente 32.000 millones de tokens. El nombre del repositorio codifica la configuracion completa del experimento (tamano, tokens, batch, LR pico, weight decay y decaimiento de LR), de modo que el suite permite comparaciones controladas variando una sola dimension cada vez.

La innovacion destacable no esta en el modelo sino en el montaje experimental: 108 modelos entrenados bajo variaciones controladas de batch size, weight decay, learning rate, presupuesto de tokens y LR final, con indices de datos registrados (`data-indices/` y `train_data/global_indices.npy`) que permiten reproducir el orden exacto de las muestras. Los checkpoints se publican como ramas del repositorio (38 pasos), siguiendo el formato del suite Pythia. El hallazgo central del paper es que las metricas geometricas derivadas de la matriz de unembedding no son un predictor fiable del rendimiento downstream, y que el rango efectivo bajo aparece junto a la degradacion tardia del entrenamiento, no como su causa.

## Capacidades

- Generacion de texto por completion autoregresiva: es un modelo base, sin ajuste por instrucciones, por lo que responde continuando el texto en lugar de seguir ordenes.
- Modelado de lenguaje a nivel de token y calculo de perplejidad: es su uso principal legitimo, como banco de pruebas de entrenamiento.
- Analisis de representaciones internas: al publicarse 38 checkpoints intermedios, permite estudiar la evolucion de pesos, activaciones y geometria del unembedding a lo largo del entrenamiento.
- Reproducibilidad de datos: los indices de entrenamiento publicados permiten reconstruir que muestras vio el modelo en cada paso.
- Tool calling o function calling: no soportado (no hay ajuste para ello ni plantilla de chat).
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingues: no declaradas; el corpus de entrenamiento es mayoritariamente anglofono.
- Capacidades especiales (vision, audio, thinking mode, decodificacion especulativa): no disponibles.
- Ventana de contexto: 2048 tokens, suficiente para experimentos controlados pero muy limitada para tareas reales.

## Casos de uso

- Investigacion sobre geometria de representaciones: calcular el rango efectivo de la matriz de unembedding en cada uno de los 38 checkpoints y correlacionarlo con la perplejidad de validacion, replicando o rebatiendo el analisis del paper.
- Estudios de dinamica de entrenamiento: usar los checkpoints de `step0` a `step61046` para trazar curvas de perdida, normas de gradiente o estadisticas de pesos a lo largo de 32B tokens, comparando con las otras 107 configuraciones del suite GeoLadder.
- Ablaciones controladas de hiperparametros: el nombre del repositorio aisla una unica configuracion (batch 256, LR 0.0065, wd 0.1, alpha_f 0.01), de modo que sirve como punto de referencia frente a variantes que cambien solo el weight decay o solo el LR pico.
- Pruebas de infraestructura de entrenamiento y evaluacion: con 40M de parametros y 160 MB en fp32, el modelo entrena y evalua de extremo a extremo en minutos en una sola GPU, lo que lo hace util como caso de prueba para pipelines de preentrenamiento, sistemas de checkpoints y herramientas de evaluacion antes de escalar a modelos mayores.
- Analisis del efecto del orden de datos: gracias a `train_data/global_indices.npy`, se puede correlacionar el contenido concreto de cada muestra con cambios en la perdida, estudiando el olvido catastrofico o el efecto de dominios especificos.
- Docencia y divulgacion: es un ejemplo manejable para explicar en clase como funciona un transformer causal, como se lee un `config.yaml` de OLMo y como se cargan checkpoints con `hf_olmo`.
- Generacion de texto de baja exigencia en entornos controlados: completado de fragmentos o generacion de texto corto en ingles para demostraciones tecnicas, asumiendo calidad muy limitada por el tamano del modelo.
- Base para experimentos de destilacion o inicializacion: al ser un modelo pequeno y con checkpoints abundantes, puede servir como punto de partida o como estudiante en experimentos de destilacion desde modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, ARC, HellaSwag, PIQA ni perplejidad en conjuntos de validacion, y el paper asociado se centra en metricas geometricas y de rendimiento interno del suite, no en una evaluacion estandarizada por modelo. Cualquier cifra de rendimiento downstream para esta configuracion concreta deberia obtenerse reproduciendo la evaluacion a partir de los checkpoints publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,16 GB en fp32 (40M parametros x 4 bytes), unos 0,08 GB en fp16/bf16 y alrededor de 0,04 GB en int8. El consumo real dependera sobre todo de las activaciones y de la longitud de secuencia (2048 tokens).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Cabe holgadamente en RTX 3060, RTX 4090, A100, H100 y en GPUs de portatil de gama baja.
- Ejecucion en CPU: totalmente viable, tanto en inferencia como en ajuste fino ligero; el modelo es lo bastante pequeno para correr en CPU sin cuantizacion.
- Despliegue: la via documentada por el autor es `transformers` junto con el paquete `ai2-olmo` (que registra `OLMoForCausalLM`). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y la dependencia de la arquitectura legada `hf_olmo` puede complicar la conversion a otros formatos.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.
- Almacenamiento: el repositorio completo ocupa 10,1 GB por las 38 ramas; descargar una sola revision (`revision="step26000"`) reduce el consumo a unos pocos cientos de MB.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible porque no hay benchmarks publicados para este modelo. La tabla se limita a caracteristicas estructurales, con los datos publicos de los proyectos comparables.

| Modelo | Parametros | Contexto | Dataset | Licencia | Checkpoints intermedios |
|---|---|---|---|---|---|
| GeoLadder-40M-32B (este modelo) | 40M | 2048 | the_pile_deduplicated | no disponible | Si, 38 ramas |
| Pythia-70M | 70M | 2048 | the_pile_deduplicated | Apache 2.0 | Si, cada 1000 pasos |
| Pythia-160M | 160M | 2048 | the_pile_deduplicated | Apache 2.0 | Si, cada 1000 pasos |
| OLMo-1B (AI2) | 1.200M | 2048 | Dolma | Apache 2.0 | Si, checkpoints periodicos |

Frente al suite Pythia, la diferencia principal no es el rendimiento sino el proposito: Pythia se publico como modelo utilizable y evaluado con un conjunto amplio de benchmarks, mientras que GeoLadder se publica como material de un estudio controlado sobre geometria y decisiones de entrenamiento. En cobertura de evaluacion, Pythia y OLMo-1B son opciones mas seguras si lo que se busca es un modelo pequeno con resultados conocidos; en trazabilidad experimental y numero de configuraciones comparables, GeoLadder ofrece 108 variantes con indices de datos reproducibles, algo que ni Pythia ni OLMo proporcionan al mismo nivel.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia en el repositorio, no hay autorizacion explicita para uso comercial ni para redistribucion. Conviene contactar con los autores antes de cualquier uso fuera del ambito academico.
- Modelo base sin alineacion: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones, no mantiene formato de chat y puede producir continuaciones incoherentes o inapropiadas.
- Capacidad muy limitada por tamano: con 40M de parametros, el conocimiento factual es minimo y la coherencia decae rapidamente en generaciones largas. No es apto para tareas de conocimiento, razonamiento o codigo.
- Riesgo alto de alucinacion: cualquier afirmacion factual generada debe verificarse; el modelo no tiene mecanismo alguno de grounding.
- Sesgos: el modelo hereda los sesgos presentes en the_pile_deduplicated, que incluye fuentes web con contenido toxico, estereotipado o sesgado. No se documento ningun filtrado posterior.
- Cobertura idiomatica: el corpus de entrenamiento es mayoritariamente en ingles; el rendimiento en castellano u otras lenguas no esta documentado y previsiblemente sera pobre.
- Contexto limitado a 2048 tokens: insuficiente para documentos largos, conversaciones extensas o tareas de recuperacion sobre corpus grandes.
- Degradacion en la fase final del entrenamiento: el propio paper del suite senala que el rango efectivo bajo coocurre con degradacion tardia; si esta configuracion concreta la presenta, los checkpoints finales podrian no ser los mejores del repositorio. Conviene evaluar ramas intermedias antes de asumir que `main` es optimo.
- Dependencia de software legado: la carga requiere el paquete `ai2-olmo` y la clase `OLMoForCausalLM`; el ecosistema de herramientas modernas de inferencia puede no soportar esta arquitectura sin conversion manual.
- Sin resultados de evaluacion: no hay benchmarks que permitan estimar el rendimiento esperado, y ninguna decision de produccion deberia basarse en este repositorio sin una evaluacion propia.
- Resultados de busqueda web no relevantes: la busqueda devolvio unicamente resultados sobre la planta "dill" y traducciones del termino, sin relacion con el modelo. No se han incorporado como enlaces.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-40M-32B-bs256-lr0.0065-wd0.1-decay0.01
- Coleccion GeoLadder (108 modelos del suite): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper en PMLR (ICML 2026, PMLR 306): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv (2602.20433): https://arxiv.org/abs/2602.20433
- Ficha en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
