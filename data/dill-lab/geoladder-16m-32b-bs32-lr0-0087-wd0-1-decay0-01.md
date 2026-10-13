# dill-lab/GeoLadder-16M-32B-bs32-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-32B-bs32-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje autorregresivo de 16 millones de parametros desarrollado por el grupo dill-lab, entrenado sobre 32.000 millones de tokens del Pile deduplicado. Forma parte de una suite de 108 modelos de estilo OLMo, con tamanos de entre 4M y 75M de parametros, publicada junto al articulo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306). No es un modelo destinado a produccion, sino un artefacto de investigacion para estudiar como las decisiones de preentrenamiento afectan a la geometria interna del modelo.

El objetivo del trabajo es determinar si el rango efectivo de la matriz de unembedding puede utilizarse como estimador del rendimiento en tareas downstream. La conclusion es negativa: la relacion no es consistente, el rango alto suele acompanar a los mejores modelos pero no de forma universal, y el rango bajo coincide con degradaciones tardias del entrenamiento en lugar de causarlas. Los hiperparametros de preentrenamiento, como el tamano de lote y el weight decay, moldean fuertemente estas metricas geometricas sin predecir de forma fiable el rendimiento final.

El repositorio de HuggingFace contiene unicamente el checkpoint final (rama `main`, step488292) mas 40 checkpoints intermedios distribuidos como ramas, lo que permite analizar la evolucion del entrenamiento paso a paso. El modelo usa la arquitectura legacy `hf_olmo` (`OLMoForCausalLM`), requiere la libreria `ai2-olmo` para cargarse y no dispone de licencia declarada, ficha de idiomas ni pesos en formatos alternativos como safetensors o GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo OLMo (`OLMoForCausalLM`, ecosistema `hf_olmo`) |
| Parametros totales | 16M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia empleada en el entrenamiento; no se documenta explicitamente el maximo soportado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `pytorch_model.bin`; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el dataset de entrenamiento, `EleutherAI/the_pile_deduplicated`, es predominantemente en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `config.json` de HuggingFace + `config.yaml` original de OLMo; no se publican safetensors |
| Tamano del repositorio | 4,7 GB (incluye 40 checkpoints y los indices de datos) |
| Fecha de publicacion | 12 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de estilo OLMo, con 16M de parametros y 2048 tokens de longitud de secuencia. Emplea la implementacion `OLMoForCausalLM` registrada por la libreria `hf_olmo` sobre `transformers`, lo que la situa en la estirpe de los modelos OLMo de AI2 en lugar de en la de los transformers estandar de HuggingFace. El entrenamiento se realizo sobre `EleutherAI/the_pile_deduplicated`, la version deduplicada del Pile, con un presupuesto de 32.000 millones de tokens.

La configuracion de entrenamiento esta codificada en el propio nombre del repositorio: batch size de 32 secuencias de 2048 tokens (65.536 tokens por paso), learning rate pico de 0.0087, weight decay de 0.1 y programacion coseno con learning rate final igual al 1% del pico (`alpha_f` = 0.01, etiquetado como `decay0.01`). No se menciona en la informacion disponible el uso de RLHF, DPO, SFT ni ninguna fase de ajuste posterior al preentrenamiento, por lo que debe considerarse un modelo exclusivamente base. Cada rama del repositorio corresponde a un paso de entrenamiento (40 en total, de `step0` a `step488292`) y los directorios `data-indices/` y `train_data/global_indices.npy` registran el orden exacto de los datos, lo que permite reproducir el flujo de entrenamiento. La innovacion metodologica del trabajo no esta en la arquitectura, sino en el analisis sistematico del rango efectivo de la matriz de unembedding y su relacion con el rendimiento downstream en variaciones controladas de batch size, weight decay, learning rate, presupuesto de tokens y LR final.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de secuencias cortas en ingles. Es un modelo base sin ajuste por instrucciones, por lo que no sigue ordenes ni mantiene formato conversacional.
- Modelado de lenguaje a pequena escala: calculo de probabilidades y perplejidad, util como referencia en experimentos academicos.
- Analisis de geometria interna: el interes principal del modelo es su matriz de unembedding y su rango efectivo, no sus salidas.
- Trayectoria de entrenamiento completa: los 40 checkpoints por rama permiten estudiar la evolucion de las representaciones a lo largo de 488.292 pasos.
- Reproducibilidad de datos: los indices de entrenamiento publicados permiten reconstruir exactamente que datos vio el modelo en cada paso.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Capacidades multilingues: no documentadas; el corpus de entrenamiento es mayoritariamente ingles.
- Capacidades multimodales (vision, audio): no soportadas.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion sobre geometria de representaciones: el modelo permite medir el rango efectivo de la matriz de unembedding y correlacionarlo con metricas de rendimiento, que es exactamente la hipotesis que el articulo pone a prueba. Su tamano de 16M hace viable ejecutar el analisis completo de matrices en una sola GPU o incluso en CPU.
- Estudios controlados de hiperparametros: al existir una suite de 108 modelos con variaciones sistematicas de batch size, weight decay, learning rate y presupuesto de tokens, este checkpoint sirve como punto de comparacion directo para aislar el efecto de cada decision de entrenamiento.
- Analisis de dinamica de entrenamiento: las 40 ramas de checkpoint permiten trazar la evolucion del rango efectivo, la norma de los pesos o la perdida a lo largo del entrenamiento sin reentrenar el modelo.
- Interpretabilidad mecanistica a escala reducida: con 16M de parametros y 2048 tokens de contexto, es posible aplicar tecnicas de analisis de activaciones, circuitos o sondas sobre todas las capas sin coste computacional significativo.
- Reproduccion de resultados academicos: los indices de datos y las configuraciones publicadas permiten replicar el entrenamiento exacto, algo poco habitual en modelos de investigacion.
- Baseline en pipelines de evaluacion y compresion: sirve como referencia de bajo coste para medir la degradacion introducida por tecnicas de poda, cuantizacion o destilacion, ya que la inferencia completa es practicamente instantanea.
- Pruebas de infraestructura y CI: al caber en CPU y ocupar decenas de megabytes en precision completa, es util para validar pipelines de carga, tokenizacion o wrappers de inferencia sin consumir GPU.
- Docencia y experimentacion educativa: permite que estudiantes ejecuten un entrenamiento o un analisis completo de un transformer real en un portatil, algo imposible con modelos de miles de millones de parametros.
- Destilacion y modelos profesor-estudiante: puede actuar como estudiante de muy bajo coste o como referencia para estudiar que informacion se pierde al reducir drasticamente el numero de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra metrica de evaluacion downstream para este checkpoint concreto. El articulo asociado evalua la relacion entre el rango efectivo de la matriz de unembedding y el rendimiento downstream, pero la informacion proporcionada no detalla los valores numericos obtenidos por este modelo especifico de 16M.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 16M de parametros, no confirmado por el autor): aproximadamente 64 MB en FP32, 32 MB en FP16/BF16 y 16 MB en INT8.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente. El modelo es funcional en tarjetas como GTX 1060, GTX 1650, T4, RTX 3060 o superiores. El uso de A100 o H100 no aporta ventaja practica y solo tendria sentido para procesar lotes masivos en paralelo.
- Viabilidad en GPU de consumo: si, con margen muy amplio. Cabe en cualquier GPU consumer moderna, en iGPU y en CPU sin requisitos especiales de memoria.
- Opciones de despliegue: carga nativa mediante `transformers` con la libreria `ai2-olmo` o `hf_olmo` instalada, tal como documenta la model card. Para vLLM, TGI o llama.cpp seria necesaria una conversion previa, ya que el repositorio solo publica `pytorch_model.bin` con la arquitectura legacy de OLMo; no hay pesos GGUF ni safetensors publicados.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, en una GPU moderna la generacion deberia ser del orden de miles de tokens por segundo, pero no se aportan mediciones oficiales.
- Nota sobre el repositorio: los 4,7 GB del repo corresponden principalmente a los 40 checkpoints y a los indices de datos, no al peso de un unico modelo en memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-16M-32B (este modelo) | 16M | 32.000M | 2048 | no disponible | HuggingFace, 40 checkpoints, requiere `ai2-olmo` |
| Pythia-14M (EleutherAI) | 14M | 300.000M (Pile deduplicado) | 2048 | Apache 2.0 | HuggingFace, 154 checkpoints, arquitectura GPT-NeoX estandar |
| Pythia-70M (EleutherAI) | 70M | 300.000M (Pile deduplicado) | 2048 | Apache 2.0 | HuggingFace, 154 checkpoints, arquitectura GPT-NeoX estandar |
| Modelos OLMo de AI2 (familia) | desde 1B | no disponible en esta busqueda | no disponible | Apache 2.0 | HuggingFace y repositorio oficial de AI2 |

La diferencia clave frente a la suite Pythia es el objetivo: Pythia busca ofrecer checkpoints publicos para interpretabilidad, mientras que GeoLadder esta disenado para un estudio controlado de geometria y rendimiento. Pythia entrena 300.000 millones de tokens frente a los 32.000 millones de este modelo, y su licencia Apache 2.0 permite uso comercial, algo que aqui no esta garantizado. A cambio, GeoLadder publica los indices exactos de los datos de entrenamiento y una rejilla de hiperparametros mucho mas sistematica.

## Limitaciones y advertencias

- Modelo exclusivamente base: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones, no mantiene formato conversacional y no es apto para uso directo en atencion al cliente o asistentes.
- Capacidad generativa muy limitada: con 16M de parametros y 32.000 millones de tokens, la coherencia del texto producido sera baja y la tasa de alucinacion o de continuaciones sin sentido, alta. No debe utilizarse para generar contenido que vaya a ser consumido por personas.
- Licencia no declarada: al no especificarse licencia en la model card ni en los metadatos, no puede asumirse permiso para uso comercial. Antes de cualquier uso fuera del ambito de investigacion, hay que contactar con los autores.
- Idiomas no declarados: el corpus de entrenamiento es predominantemente en ingles, y no se documenta ningun soporte multilingue. El rendimiento en castellano probablemente sea marginal.
- Sesgos heredados del Pile: el corpus contiene texto web sin curacion exhaustiva, con sesgos de genero, raza, religion y nacionalidad. El modelo no incorpora ningun filtro posterior.
- Dependencia de una arquitectura legacy: la carga requiere `hf_olmo` o `ai2-olmo`, y puede romperse con versiones recientes de `transformers`. La integracion con vLLM, TGI, llama.cpp u Ollama no es directa.
- Pesos en formato pickle: el unico formato publicado es `pytorch_model.bin`, que exige cargar objetos serializados con `pickle` y no admite carga rapida ni verificacion de integridad como safetensors.
- Contexto limitado a 2048 tokens: insuficiente para tareas de documento largo, resumen de informes extensos o analisis de repositorios de codigo.
- Conclusion del propio articulo: el rango efectivo de la matriz de unembedding no predice de forma fiable el rendimiento downstream, por lo que no debe utilizarse como criterio unico de seleccion de modelos.
- Sin traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa, de reportes de errores y de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-32B-bs32-lr0.0087-wd0.1-decay0.01
- Coleccion GeoLadder completa (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Articulo en PMLR (ICML 2026, volumen 306, paginas 61454-61482): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Discusion en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Dependencia necesaria para cargar el modelo: repositorio `ai2-olmo` / libreria `hf_olmo` referenciados en la model card (no se proporciona URL en la informacion disponible)
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes al modelo. Las busquedas sobre el termino "dill" devuelven resultados sobre la planta de eneldo y sobre programas de gestion de residuos, sin relacion con el laboratorio dill-lab.
