# dill-lab/GeoLadder-40M-128B-bs512-lr0.0065-wd0.1-decay0.01

## Resumen

GeoLadder-40M-128B-bs512-lr0.0065-wd0.1-decay0.01 es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo OLMo y 40 millones de parametros, entrenado sobre la version deduplicada de The Pile (128.000 millones de tokens). Lo publica el grupo dill-lab como parte de la suite GeoLadder, un conjunto de 108 modelos de entre 4M y 75M de parametros entrenados bajo variaciones controladas de batch size, weight decay, learning rate, presupuesto de tokens y LR final.

El modelo no se disena para uso productivo, sino como instrumento de investigacion. Acompana al articulo "Disentangling Geometry, Performance, and Training in Language Models" (Kulkarni, Springer, Subramonian y Swayamdipta, ICML 2026, PMLR 306), que estudia si la geometria de la matriz de unembedding (en concreto su rango efectivo) permite estimar el rendimiento downstream. La conclusion del trabajo es que la relacion no es consistente: un rango efectivo alto suele acompanar a los mejores modelos, pero no de forma universal, y el rango bajo coexiste con la degradacion tardia en lugar de causarla.

Su relevancia es metodologica: cada checkpoint intermedio se publica como una rama del repositorio (41 ramas, de `step0` a `step122081`), igual que en la suite Pythia, junto con los indices de orden de los datos de entrenamiento. Esto permite reproducir trayectorias de entrenamiento completas y analizar la evolucion de metricas geometricas a lo largo del tiempo, algo poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (`OLMoForCausalLM`, arquitectura legacy `hf_olmo`); numero de capas, dimension oculta y cabezas de atencion no disponibles |
| Parametros totales | 40M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (el autor define el batch como secuencias de 2048 tokens; no se declara explicitamente la ventana maxima) |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar) |
| Idiomas soportados | no disponible (entrenado sobre `EleutherAI/the_pile_deduplicated`, corpus predominantemente en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card indica unicamente que se trata de un modelo "OLMo-style" y que los checkpoints usan la arquitectura legacy `hf_olmo` (`OLMoForCausalLM`), por lo que es necesario instalar el paquete `ai2-olmo` para registrarla en `transformers`. No se detallan en la informacion disponible el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tipo de normalizacion ni la estrategia posicional. Tampoco se especifica si hubo fases de RLHF, DPO o ajuste por instrucciones; dado el proposito del trabajo (analisis de geometria y rendimiento en preentrenamiento), lo mas probable es que se trate de un modelo base sin alineamiento posterior, aunque esto no se confirma en la documentacion.

Los hiperparametros de entrenamiento si estan documentados: 128.000 millones de tokens sobre `EleutherAI/the_pile_deduplicated`, batch de 512 secuencias de 2048 tokens, learning rate pico de 0.0065, weight decay de 0.1 y un factor `alpha_f` de 0.01 en un schedule coseno (es decir, el LR final es el 1% del pico). El repositorio registra el orden exacto de los datos mediante `data-indices/` y `train_data/global_indices.npy`, lo que permite reproducir la secuencia de entrenamiento. Cada paso subido corresponde a una rama del repo, con 41 ramas en total.

## Capacidades

- Generacion de texto autoregresiva basica, con la calidad esperable de un modelo de 40M de parametros entrenado sobre 128B de tokens.
- Modelado de lenguaje y calculo de perplejidad sobre texto en ingles, util como referencia en experimentos controlados.
- Analisis interno: acceso a los pesos de la matriz de unembedding y de todas las capas para estudiar rango efectivo, espectro singular y otras metricas geometricas.
- Trazabilidad de checkpoints: 41 puntos de control que permiten observar la evolucion de cualquier metrica a lo largo del entrenamiento.
- Reproducibilidad de datos: los indices de entrenamiento permiten reconstruir exactamente que tokens vio el modelo en cada paso.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues no documentadas; el corpus de entrenamiento es mayoritariamente anglofono.

## Casos de uso

- Investigacion sobre dinamica de entrenamiento: comparar la evolucion de metricas geometricas (rango efectivo, normas, espectro) entre los 41 checkpoints publicados y correlacionarlas con la perdida en validacion, replicando el analisis principal del articulo.
- Estudios controlados de hiperparametros: al pertenecer a una suite de 108 modelos con variaciones sistematicas de batch size, weight decay, LR y presupuesto de tokens, permite aislar el efecto de cada variable manteniendo el resto constante.
- Reproducibilidad y auditoria de datos: los ficheros `data-indices/` y `global_indices.npy` permiten reconstruir el orden exacto de las muestras, util para experimentos de olvido catastrófico y de influencia de datos.
- Analisis de interpretabilidad a pequena escala: con 40M de parametros, el coste de extraer activaciones de todas las capas y cabezas es minimo, lo que facilita estudios de circuitos, sondas lineales y representaciones internas.
- Referencia base en experimentos de scaling: sirve como punto de comparacion de bajo coste frente a los modelos mayores de la misma suite (hasta 75M) para estudiar como escalan las propiedades geometricas.
- Docencia y formacion: el modelo cabe en cualquier GPU de consumo y tarda minutos en entrenar desde cero, lo que lo hace apto para cursos practicos de entrenamiento de transformers y de analisis de checkpoints.
- Pruebas de infraestructura de evaluacion: util para validar pipelines propios de evaluacion (harnesses, metricas de perplejidad, seguimiento de experimentos) antes de lanzarlos sobre modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra tarea estandar, y los resultados de la busqueda web no aportan datos sobre el modelo. El articulo asociado se centra en metricas de geometria (rango efectivo de la matriz de unembedding) y su relacion con el rendimiento, no en una tabla comparativa de benchmarks por modelo.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 160 MB solo para los pesos (40M parametros x 4 bytes). En fp16 o bf16, unos 80 MB. Cabe sobradamente en cualquier GPU moderna, incluida una GTX 1650 de 4 GB.
- Almacenamiento: el repositorio completo ocupa 11,5 GB porque contiene los 41 checkpoints; descargar solo una rama concreta reduce el espacio necesario a unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) es mas que suficiente. Tambien funciona en CPU sin dificultad apreciable para inferencia puntual.
- Limitacion practica: para cargar el modelo hay que instalar `ai2-olmo`, ya que la arquitectura `OLMoForCausalLM` no viene incluida en `transformers` por defecto.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama. La ruta soportada es `transformers` + `hf_olmo`. Al no publicarse pesos en GGUF ni safetensors, llama.cpp y Ollama no son utilizables sin una conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Corpus | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| GeoLadder-40M (este modelo) | 40M | 128B | the_pile_deduplicated | 2048 tokens (segun definicion de batch) | no disponible | Suite de investigacion sobre geometria y rendimiento |
| Pythia-70M (EleutherAI) | 70M | no disponible en la informacion proporcionada | The Pile | no disponible | Apache 2.0 (referencia externa, no verificada aqui) | Suite de checkpoints intermedios para interpretabilidad |
| Otros modelos de la suite GeoLadder | 4M-75M | variable | the_pile_deduplicated | no disponible | no disponible | Variaciones controladas de hiperparametros |

La comparacion con Pythia es la mas natural por planteamiento metodologico (publicacion de multiples checkpoints intermedios), pero no se dispone de datos verificados en la informacion proporcionada para comparar rendimiento ni contexto de forma rigurosa. Para el resto de modelos de la suite GeoLadder, consulte la coleccion oficial en HuggingFace.

## Limitaciones y advertencias

- Sesgos: no evaluados ni documentados. El corpus The Pile contiene texto web, por lo que es previsible que herede sesgos de genero, raza, religion y origen nacional, pero no hay analisis publicado en la informacion disponible.
- Alucinacion: un modelo de 40M de parametros tiene una capacidad de modelado muy limitada. Es esperable que genere texto incoherente o factualmente incorrecto fuera de completados muy locales. No debe usarse para producir informacion verificable.
- Contexto: la ventana efectiva parece ser de 2048 tokens, corta para tareas de documento largo. No se ha confirmado explicitamente en la documentacion.
- Idioma: el entrenamiento es sobre The Pile, mayoritariamente en ingles. No hay datos sobre rendimiento en castellano ni en otros idiomas.
- Licencia: no disponible. Al no declararse una licencia explicita, no puede asumirse permiso para uso comercial. Conviene contactar con los autores antes de cualquier uso en produccion.
- Caveat de despliegue: la dependencia obligatoria del paquete `ai2-olmo` y la ausencia de safetensors o GGUF complican la integracion en stacks modernos de inferencia.
- Uso previsto: es un artefacto de investigacion, no un modelo listo para produccion. La propia web de busqueda no aporta informacion adicional util: los resultados devueltos tratan sobre la planta de eneldo, no sobre el modelo.
- Fecha de publicacion: el repositorio figura creado en octubre de 2026 y el articulo se publica en ICML 2026, por lo que se trata de material muy reciente y poco contrastado por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-40M-128B-bs512-lr0.0065-wd0.1-decay0.01
- Coleccion GeoLadder: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Articulo en PMLR (ICML 2026, volumen 306): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Discusion en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
