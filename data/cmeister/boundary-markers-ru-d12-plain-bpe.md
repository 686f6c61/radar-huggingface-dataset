# cmeister/boundary-markers-ru-d12-plain-bpe

## Resumen

`cmeister/boundary-markers-ru-d12-plain-bpe` es un artefacto de investigación publicado en HuggingFace que contiene tres modelos de lenguaje en ruso (semillas 0, 1 y 2) entrenados con el mismo procedimiento y datos, y que difieren únicamente en la semilla de inicialización y en el orden de lectura de los shards. El objetivo declarado por el autor no es ofrecer un modelo de propósito general, sino servir de **línea base** en un estudio comparativo sobre tokenizadores: en concreto, sobre vocabularios subword que marcan explícitamente las fronteras de palabra, según el artículo *Explicit Boundary Markers for Subword Vocabularies* (arXiv:2608.08847) de Sander Land y Clara Meister. Este repositorio implementa el esquema `plain`, es decir, pretokenización con codificación SCRIPT y **sin** marcadores de frontera.

Cada modelo es un transformer decoder-only de 12 capas, ancho 768 y 6 cabezas de atención, con una longitud de contexto de 2.048 tokens, entrenado con [nanochat](https://github.com/karpathy/nanochat) (commit `92d63d4`) durante 2.553 pasos de 524.288 tokens, lo que suma 1.340 millones de tokens procesados. El tokenizador es un BPE entrenado sobre una muestra de 5 GB de Russian FineWeb, con un vocabulario de 34.685 entradas más un token de inicio de secuencia (34.686 en total). Los pesos se publican como state dicts de PyTorch, no como GGUF ni safetensors.

La relevancia del repositorio es metodológica: al fijar el orden de shards por semilla, los modelos de todas las variantes de tokenizador del estudio son directamente comparables entre sí, lo que permite aislar el efecto del esquema de tokenización sobre la pérdida medida en bits por byte. Para un desarrollador o investigador, esto lo convierte en material de referencia para reproducir el estudio, no en un modelo desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat, commit `92d63d4`); 12 capas, ancho 768, 6 cabezas de atencion |
| Parametros totales | no disponible (el autor no publica el recuento; la configuracion completa esta en `seed<n>/meta_002553.json`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (se publican pesos en el formato de entrenamiento, sin versiones cuantizadas) |
| Idiomas soportados | ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`seed<n>/model_002553.pt`), cargable con `torch.load(..., weights_only=True)` |
| Tokenizador | BPE con pretokenizacion SCRIPT-encoding, sin marcadores de frontera (esquema `plain`, la linea base del estudio) |
| Vocabulario | 34.685 entradas BPE + 1 token de inicio de secuencia = 34.686 |
| Archivo del tokenizador | `tokenizer/fineweb_ru_5gb_quick_plain_bpe_v34685.json.gz`, sha256 `a7497c11f50eecc797cf211a8cdcccd49ef4c61716c2ce238e9068b61e0edc1c` |
| Semillas publicadas | 3 (0, 1, 2) |
| Tokens de entrenamiento | 1.340 millones (2.553 pasos x 524.288 tokens) |
| Datos de entrenamiento | 10 shards de Russian FineWeb-2 (`fineweb-2_0_1-quality_10-filterrobots`), 2.920 millones de caracteres, ~3,35 lecturas |
| Tamano del repositorio | 2,5 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura sigue la implementacion de nanochat: un transformer decoder-only de 12 capas con anchura de 768 y 6 cabezas de atencion, entrenado con un contexto de 2.048 tokens. El entrenamiento se lanzo con `paper_utils/boundary/downstream/run_arms.sh` del repositorio [script_tok](https://github.com/sanderland/script_tok), en su commit `92d63d4`, usando una GPU por modelo. El presupuesto de computo es de 2.553 pasos de 524.288 tokens por paso, es decir, 1.340 millones de tokens vistos.

El corpus de entrenamiento son 10 shards de Russian FineWeb-2, procedentes de la release `fineweb-2_0_1-quality_10-filterrobots`, con 2.920 millones de caracteres que se recorren aproximadamente 3,35 veces. La semilla controla la inicializacion de pesos y el orden de los shards; ese orden es identico para todos los tokenizadores del estudio, de modo que dos modelos con la misma semilla son directamente comparables y la unica variable que cambia entre ellos es el vocabulario subword. La model card no menciona fases de ajuste por preferencias (RLHF, DPO ni similares): el entrenamiento descrito es exclusivamente de modelado de lenguaje sobre texto crudo.

La innovacion tecnica del trabajo no esta en el modelo, sino en el tokenizador: el articulo estudia si marcar explicitamente las fronteras de palabra en el vocabulario subword mejora la calidad del modelo. Este repositorio corresponde al brazo `plain`, el baseline sin marcadores, frente al cual se miden los demas esquemas del estudio.

## Capacidades

- Generacion de texto y modelado de lenguaje autorregresivo en ruso, con una ventana de contexto de 2.048 tokens.
- Prediccion del siguiente token con un vocabulario BPE de 34.686 entradas, entrenado especificamente sobre texto ruso de FineWeb-2.
- Capacidad de servir como sujeto de evaluacion de tokenizadores: mide la calidad del modelado en bits por byte, una metrica independiente del vocabulario.
- Reproducibilidad controlada: tres semillas publicadas con el mismo pipeline permiten estimar la dispersion entre ejecuciones.
- Inspeccion del entrenamiento completo mediante los ficheros `train.log`, `archive.json` y `meta_002553.json` de cada semilla.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso, ni modo `thinking`.
- No hay capacidades de vision ni de audio.
- No hay capacidades multilingues: el modelo esta entrenado y evaluado unicamente en ruso.

## Casos de uso

- Linea base en investigacion sobre tokenizacion: este modelo es el punto de referencia `plain` contra el que se comparan los esquemas con marcadores de frontera explicitos. Se usaria cargando los pesos de cada semilla y evaluando la perdida en bits por byte sobre el mismo shard de validacion.
- Reproduccion de resultados academicos: permite verificar las cifras reportadas en el articulo arXiv:2608.08847 para el caso ruso, dado que el pipeline, los datos y el commit de nanochat estan fijados.
- Estudio de la varianza entre semillas: con tres ejecuciones identicas salvo la semilla, se puede estimar cuanto de una diferencia observada entre tokenizadores es senal y cuanto es ruido de inicializacion.
- Analisis de morfologia rusa: al ser un modelo pequeno entrenado solo en ruso, sirve para estudiar como un vocabulario BPE sin marcadores segmenta palabras con flexion rica y que efecto tiene sobre la perplejidad por byte.
- Ablaciones sobre el presupuesto de computo: la configuracion de 12 capas y 1.340 millones de tokens es lo bastante pequena para entrenar variantes adicionales con un solo GPU por modelo, por lo que se puede usar como punto de partida para barridos de tamano de vocabulario o de contexto.
- Docencia y formacion: es un ejemplo completo y trazable de un entrenamiento tipo nanochat (config, log, pesos y tokenizador incluidos), util para explicar el ciclo completo de entrenamiento de un LLM a escala reducida.
- Pruebas de infraestructura de inferencia: al ser un checkpoint PyTorch pequeno, puede emplearse para validar canalizaciones de carga, serializacion y evaluacion, siempre que se disponga del codigo de nanochat, ya que no se publican exportaciones a formatos de runtime estandar.
- Generacion de texto ruso a pequena escala en entornos de experimentacion: util para prototipos internos donde no se requiere calidad de produccion ni cobertura multilingue.

## Benchmarks y rendimiento

El unico resultado publicado en la informacion disponible es la perdida de validacion en bits por byte (suma de la perdida sobre un shard reservado de Russian FineWeb-2 dividida por la longitud UTF-8 real del texto evaluado; menor es mejor). Los valores solo son comparables dentro del mismo idioma.

| Semilla | Bits por byte (validacion) |
|---|---|
| 0 | 0,54973 |
| 1 | 0,55073 |
| 2 | 0,55049 |

El autor advierte explicitamente de que tres semillas ofrecen una direccion, no una estimacion precisa, y que la comparacion completa entre esquemas, entrenadores e idiomas se encuentra en el repositorio script_tok. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras. Por la configuracion divulgada (12 capas, ancho 768, contexto de 2.048 tokens) se trata de un modelo de escala reducida que cabe con holgura en GPUs de consumo, pero no se aporta ninguna medicion concreta.
- GPU recomendadas: no disponible. Durante el entrenamiento se uso una GPU por modelo, sin especificar el modelo de GPU.
- GPU de consumo: por tamano, el modelo es apto para GPUs de gama media y alta de consumo, aunque no hay cifras oficiales de VRAM ni de rendimiento.
- Opciones de despliegue: unicamente el codigo de [nanochat](https://github.com/karpathy/nanochat) con el que se generaron los checkpoints. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni ninguna otra canalizacion, ni existen exportaciones GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se proporcionan en la informacion disponible modelos externos comparables con datos verificables. La comparacion natural es interna al propio estudio: los demas brazos experimentales comparten arquitectura, datos, presupuesto de tokens y semilla, y se diferencian solo en el esquema de tokenizacion.

| Modelo | Tokenizador | Arquitectura | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`plain`) | BPE sin marcadores de frontera | 12 capas, ancho 768, 6 cabezas | 2.048 | ru | Apache 2.0 | HuggingFace |
| Variantes con marcadores explicitos del mismo estudio | BPE con marcadores de frontera | identica (mismos datos, tokens y semilla) | 2.048 | ru | no disponible | repositorio script_tok |
| Modelos del articulo en ingles | esquemas equivalentes en ingles | no disponible | no disponible | en | no disponible | articulo arXiv:2608.08847 |

Las cifras en bits por byte de este modelo no deben compararse con las de otras lenguas, tal y como advierte el propio autor.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: 1.340 millones de tokens de entrenamiento es un presupuesto muy bajo para estandares actuales, de modo que la calidad de generacion, la factualidad y la coherencia en textos largos seran limitadas.
- Riesgo elevado de alucinacion y de afirmaciones no fundamentadas, inherente a un modelo de este tamano y a su presupuesto de computo.
- Cobertura linguistica restringida al ruso; no hay capacidades multilingues ni transferencia a otras lenguas declarada.
- Contexto corto: 2.048 tokens, insuficiente para tareas de documento largo, analisis de repositorios o conversaciones multi-turno extensas.
- Vocabulario de 34.686 entradas, ajustado a una muestra de 5 GB de Russian FineWeb; el comportamiento fuera de ese dominio (lenguaje tecnico, jerga, otros registros) no esta caracterizado.
- Sesgos potenciales heredados de FineWeb-2 y de su filtrado (`filterrobots`), sin ninguna evaluacion de sesgo publicada en la model card.
- Los tres modelos difieren solo en la semilla y, segun el propio autor, "tres semillas dan una direccion y no una estimacion precisa"; no deben tratarse como una horquilla de rendimiento fiable.
- Los valores de bits por byte solo son comparables dentro del mismo idioma.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece ninguna garantia y el modelo no esta disenado ni validado para ello.
- No hay soporte oficial de frameworks de inferencia conocidos; cargar los pesos requiere el codigo de nanochat y comprobar el sha256 de los ficheros mediante `archive.json`.
- No se declara pipeline en HuggingFace ni existe version cuantizada, por lo que no hay una ruta directa a despliegue ligero en CPU o GPU de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ru-d12-plain-bpe
- Articulo *Explicit Boundary Markers for Subword Vocabularies* (Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Repositorio script_tok (tokenizador y utilidades del estudio): https://github.com/sanderland/script_tok
- nanochat (framework de entrenamiento, commit `92d63d4`): https://github.com/karpathy/nanochat
- Dataset Russian FineWeb-2, release `fineweb-2_0_1-quality_10-filterrobots`: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

No se han encontrado enlaces adicionales relevantes en la busqueda web realizada.
