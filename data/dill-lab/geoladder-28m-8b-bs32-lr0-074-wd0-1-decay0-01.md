# dill-lab/GeoLadder-28M-8B-bs32-lr0.074-wd0.1-decay0.01

## Resumen

GeoLadder-28M-8B-bs32-lr0.074-wd0.1-decay0.01 es un modelo de lenguaje de tipo base, de arquitectura transformer estilo OLMo, desarrollado por dill-lab y publicado junto con el artículo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306). Forma parte de una suite de 108 modelos OLMo de entre 4M y 75M de parámetros, entrenados bajo variaciones controladas de tamaño de lote, weight decay, learning rate, presupuesto de tokens y LR final. Este repositorio concreto corresponde a la configuración de 28M de parámetros entrenada sobre 8.000 millones de tokens del Pile deduplicado, con batch size de 32 secuencias de 2048 tokens, LR máximo de 0,074, weight decay de 0,1 y decaimiento coseno hasta un 1 % del LR máximo.

El objetivo del trabajo no es ofrecer un modelo competitivo para tareas de producción, sino servir como instrumento de investigación para estudiar si la geometría de la matriz de *unembedding* (en particular su rango efectivo) permite estimar el rendimiento downstream. La conclusión del artículo es que la relación es inconsistente: un rango efectivo alto suele acompañar a los mejores modelos, pero no de forma universal, y un rango bajo coocurre con la degradación tardía del entrenamiento en lugar de causarla. Ninguna de las métricas geométricas evaluadas predice el rendimiento de forma fiable.

Se trata, por tanto, de un modelo de escala de juguete (28M de parámetros, 7,8 GB de repositorio repartidos en 41 checkpoints), sin ajuste por instrucciones, sin RLHF ni DPO, y sin datos publicados de benchmarks ni de licencia. Su interés es metodológico: reproducir y auditar las decisiones de preentrenamiento de la suite GeoLadder.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (clase `OLMoForCausalLM`, arquitectura legacy `hf_olmo`) |
| Parametros totales | 28M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento usa secuencias de 2048 tokens) |
| Tipos de cuantizacion | No disponible; no se publican pesos cuantizados. Al ser un modelo de 28M, es viable cuantizar a int8/int4 con herramientas externas |
| Idiomas soportados | No disponibles (el corpus de entrenamiento, the_pile_deduplicated, es mayoritariamente en ingles) |
| Licencia | No disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch), mas `config.json` de HuggingFace y `config.yaml` original de OLMo |
| Tamano del repositorio | 7,8 GB (incluye 41 ramas de checkpoint) |
| Checkpoints publicados | 41 ramas: `step0` ... `step122081`; `main` apunta al checkpoint final |
| Datos de entrenamiento | EleutherAI/the_pile_deduplicated (8B tokens) |

## Arquitectura y entrenamiento

El modelo sigue la implementacion OLMo de AI2 en su variante legacy (`hf_olmo`), un transformer decoder-only con atencion causal. Para cargarlo es imprescindible instalar el paquete `ai2-olmo`, que registra `OLMoForCausalLM` en `transformers`; de lo contrario, `AutoModelForCausalLM.from_pretrained` no reconocera la arquitectura. No se documentan en la informacion disponible detalles como el numero de capas, las dimensiones ocultas, el numero de cabezas de atencion, el uso de RMSNorm, RoPE o sesgos en las proyecciones.

El entrenamiento se realizo sobre el Pile deduplicado durante 8.000 millones de tokens, con batch size de 32 secuencias de 2048 tokens, LR máximo de 0,074, weight decay de 0,1 y programacion coseno con LR final igual al 1 % del máximo (`alpha_f = 0.01`). El nombre del repositorio codifica exactamente estos hiperparametros. No hay evidencia de fases de ajuste posteriores: no se mencionan SFT, RLHF, DPO ni ninguna otra etapa de alineamiento, por lo que se trata de un modelo exclusivamente preentrenado.

La innovacion metodologica del trabajo no esta en la arquitectura, sino en el diseno experimental: 108 modelos de 4M a 75M de parametros, todos OLMo, variando de forma controlada batch size, weight decay, learning rate, presupuesto de tokens y LR final, para despues correlacionar metricas geometricas de la matriz de *unembedding* (rango efectivo) con el rendimiento downstream. El repositorio conserva ademas el orden de los datos de entrenamiento (`data-indices/` y `train_data/global_indices.npy`), lo que permite reproducir exactamente que tokens vio cada checkpoint, siguiendo el patron de la suite Pythia.

## Capacidades

- Generacion de texto autoregresiva basica, propia de un modelo de lenguaje preentrenado sin ajuste por instrucciones.
- Continuacion de texto y modelado de lenguaje puro; no se comporta como asistente conversacional.
- Rango efectivo de la matriz de *unembedding* analizable como metrica de investigacion, que es el proposito declarado del modelo.
- Trazabilidad completa de datos: es posible determinar que subconjunto del Pile consumio cada uno de los 41 checkpoints intermedios.
- Analisis de dinamica de entrenamiento: la secuencia de checkpoints (`step0` a `step122081`) permite estudiar la evolucion de representaciones, perdida y geometria a lo largo del preentrenamiento.
- Soporte de tool calling / function calling: no disponible; el modelo no ha sido entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el corpus es predominantemente ingles.
- Modalidades adicionales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion sobre geometria de representaciones: el modelo permite replicar los experimentos del articulo ICML 2026, calculando el rango efectivo de la matriz de *unembedding* y correlacionandolo con la perdida de validacion en el mismo punto del entrenamiento.
- Estudios de ablacion de hiperparametros: al existir 107 modelos hermanos en la coleccion GeoLadder con el mismo codigo pero distinto batch size, weight decay o LR, este checkpoint sirve como punto de comparacion controlado dentro de una rejilla experimental.
- Analisis de trayectorias de entrenamiento: los 41 checkpoints intermedios permiten estudiar fenomenos como la degradacion tardia del rendimiento y comprobar si el rango efectivo bajo la anticipa o simplemente la acompaña.
- Investigacion de interpretabilidad a escala reducida: con 28M de parametros, los analisis de activaciones, circuitos o *probing* son computacionalmente baratos y pueden ejecutarse en una unica GPU de consumo, algo inviable en modelos de miles de millones de parametros.
- Reproduccion de pipelines de preentrenamiento OLMo: sirve como caso de prueba end-to-end para validar infraestructura de entrenamiento, tokenizacion y carga de checkpoints con `ai2-olmo` antes de escalar a modelos mayores.
- Docencia y formacion: permite ilustrar en un aula o taller el ciclo completo de un modelo de lenguaje (corpus, tokenizador, checkpoints por paso, evaluacion) sin necesidad de clúster.
- Pruebas de infraestructura de inferencia: por su tamano, es util para validar integraciones con `transformers`, serializacion de pesos y flujos de carga por revision (rama de git) en entornos de CI.
- Generacion de texto de baja exigencia: continuacion de fragmentos y pruebas de muestreo (temperatura, top-k, top-p), asumiendo calidad muy limitada por el tamano del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ningun otro conjunto de evaluacion. El articulo asociado se centra en la relacion entre metricas geometricas y rendimiento downstream, pero los valores concretos por modelo no se han proporcionado en la informacion disponible para esta ficha.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de los 28M de parametros, no publicada por el autor):
  - fp32: aproximadamente 112 MB.
  - fp16 / bf16: aproximadamente 56 MB.
  - int8: aproximadamente 28 MB.
  - int4: aproximadamente 14 MB.
- La VRAM real en ejecucion es muy superior a la de los pesos por el *KV cache* y las activaciones; en la practica conviene reservar entre 0,5 GB y 1 GB en función de la longitud de secuencia y del tamano de lote.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia de baja latencia con lotes pequenos.
- No requiere A100, H100 ni GPUs de centro de datos; el entrenamiento de 8B tokens es igualmente asequible en una unica GPU de gama media-alta.
- Opciones de despliegue:
  - `transformers` con `ai2-olmo` instalado (ruta oficial documentada, con seleccion de checkpoint via `revision`).
  - `llama.cpp` / Ollama / LM Studio: requeriria convertir los pesos a GGUF, conversion no publicada por el autor.
  - vLLM, TGI: no se documenta soporte verificado para la arquitectura legacy `hf_olmo`; habria que comprobarlo caso por caso.
- Latencia y throughput: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

La comparabilidad es limitada: existen pocos modelos publicados en el rango de 28M de parametros y este pertenece a una suite disenada para experimentacion, no para uso final. Se incluyen referencias habituales de la misma familia metodologica (modelos pequenos entrenados sobre el Pile con checkpoints intermedios). Los datos de la columna de rendimiento no estan disponibles para ninguno de ellos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Checkpoints intermedios | Benchmarks |
|---|---|---|---|---|---|
| GeoLadder-28M (este modelo) | 28M | No disponible (entrenamiento a 2048) | No disponible | Si, 41 ramas | No disponibles |
| Pythia-70M (EleutherAI) | 70M | 2048 | Apache-2.0 | Si, 154 | No disponibles en esta ficha |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT modificada | No | No disponibles en esta ficha |
| Suite OLMo original (AI2) | Desde 1B | 2048-4096 | Apache-2.0 | Si | No disponibles en esta ficha |

El interes diferencial de GeoLadder-28M no es el rendimiento, sino que combina tres cosas poco frecuentes al mismo tiempo: escala muy reducida, publicacion de todos los checkpoints intermedios y trazabilidad exacta del orden de los datos de entrenamiento.

## Limitaciones y advertencias

- Sesgos: el modelo se entrena sobre the_pile_deduplicated, un corpus web con sesgos conocidos de genero, raza, religion e ideologia. No se ha aplicado ninguna fase de mitigacion.
- Alucinacion: al ser un modelo base de 28M de parametros, la generacion es debil y propensa a continuaciones incoherentes o factualmente falsas. No debe usarse como fuente de informacion.
- Ausencia de alineamiento: no hay SFT, RLHF ni DPO. El modelo no sigue instrucciones ni mantiene formato conversacional.
- Contexto: no se especifica la ventana de contexto en la configuracion publicada; el entrenamiento usa 2048 tokens, por lo que no debe asumirse capacidad superior sin verificacion.
- Idioma: no se declaran idiomas soportados. El corpus es mayoritariamente ingles; el rendimiento en castellano es previsiblemente pobre.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir permisos de uso comercial; conviene contactar con los autores antes de cualquier uso productivo.
- Escala: 28M de parametros es dos ordenes de magnitud por debajo de los modelos actuales de proposito general. Cualquier uso en produccion orientado a usuario final sera insatisfactorio.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada que permita estimar la calidad, lo que impide justificar su eleccion frente a alternativas.
- Contenido de terceros: el Pile incluye material con derechos de autor; las implicaciones legales del modelo derivado no estan aclaradas en la informacion disponible.
- Carga no estandar: requiere instalar `ai2-olmo`; sin ese paquete, la carga falla silenciosamente o lanza error de arquitectura desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-28M-8B-bs32-lr0.074-wd0.1-decay0.01
- Coleccion GeoLadder (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Articulo en PMLR 306: https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Ficha en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces encontrados correspondian a resultados no relacionados (la hierba *dill* y directorios de depositos ilegales). Los unicos recursos verificables son los listados arriba, extraidos de la propia model card.
