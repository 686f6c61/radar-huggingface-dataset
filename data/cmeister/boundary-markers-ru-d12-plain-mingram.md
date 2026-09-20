# cmeister/boundary-markers-ru-d12-plain-mingram

## Resumen

Este repositorio contiene tres modelos de lenguaje en ruso (semillas 0, 1 y 2) entrenados por el usuario cmeister como parte de un estudio de tokenizacion derivado del articulo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister, arXiv:2608.08847). El objetivo no es ofrecer un modelo de proposito general, sino servir de linea base controlada: estos tres modelos usan un tokenizador `plain` (pretokenizacion con codificacion SCRIPT y sin marcadores de frontera de palabra) y se comparan contra otros brazos del mismo estudio que si marcan fronteras. Dentro de un mismo idioma, todos los modelos comparten arquitectura, datos y orden de entrenamiento, de modo que la unica variable que cambia es el vocabulario de subpalabras.

La arquitectura es un transformer decoder-only tipo nanochat: 12 capas, anchura 768, 6 cabezas de atencion y una longitud de contexto de 2.048 tokens. Se entreno sobre un total de 1.340 millones de tokens de Russian FineWeb-2 en 2.553 pasos de 524.288 tokens cada uno, con una GPU por modelo. El tokenizador se entreno con MinGram sobre una muestra de 5 GB de Russian FineWeb y tiene un vocabulario de 34.685 entradas mas el token de inicio de secuencia (34.686 en total).

Su relevancia es metodologica: permite medir el efecto de distintos esquemas de tokenizacion sobre la perdida de validacion en bytes (bits per byte) en ruso, con control de semilla. Los pesos se distribuyen como state dicts de PyTorch y la licencia es Apache-2.0. No es un modelo instruido ni alineado, y no se publican cifras de rendimiento en tareas de generacion, razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion nanochat, commit `92d63d4`) |
| Parametros totales | no disponible (configuracion publicada: 12 capas, anchura 768, 6 cabezas de atencion) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision de entrenamiento) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`seed<n>/model_002553.pt`, cargable con `torch.load(..., weights_only=True)`); tokenizador en JSON comprimido (`tokenizer/fineweb_ru_5gb_quick_plain_mingram_v34685.json.gz`) |

## Arquitectura y entrenamiento

El modelo sigue la implementacion nanochat, un transformer decoder-only de 12 capas con anchura 768 y 6 cabezas de atencion. El entrenamiento se lanzo con `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok: 2.553 pasos de 524.288 tokens, lo que suma aproximadamente 1.340 millones de tokens vistos, con una GPU dedicada por modelo. No hay indicios de RLHF, DPO ni ajuste por instrucciones: es un modelo base de investigacion entrenado con el objetivo de lenguaje siguiente sobre texto crudo.

Los datos proceden de 10 shards de Russian FineWeb-2, de la release `fineweb-2_0_1-quality_10-filterrobots`: 2.920 millones de caracteres leidos aproximadamente 3,35 veces. La semilla fija la inicializacion de pesos y el orden de los shards, y ese orden es identico para todos los tokenizadores comparados, de modo que los modelos con la misma semilla son directamente comparables entre si. El tokenizador es el elemento diferencial: se entreno con MinGram sobre una muestra de 5 GB de Russian FineWeb, con vocabulario de 34.685 entradas (34.686 con el token de inicio de secuencia) y pretokenizacion con codificacion SCRIPT sin marcadores de frontera. Este brazo es precisamente el baseline contra el que se miden los esquemas con marcadores explicitos.

## Capacidades

- Generacion de texto en ruso: modelado de lenguaje autorregresivo basico, sin ajuste instructivo.
- Modelado de lenguaje a nivel de token y evaluacion de tokenizadores: es su proposito principal declarado.
- Evaluacion comparativa controlada de vocabularios de subpalabras: perdida de validacion en bits per byte sobre un shard reservado de Russian FineWeb-2.
- Reproduccion de resultados: se publican pesos, configuracion (`meta_002553.json`), log completo de entrenamiento (`train.log`) y hashes SHA-256 de cada archivo (`archive.json`).
- Tool calling / function calling: no soportado ni documentado.
- Capacidades de agente o razonamiento multi-paso: no soportadas ni documentadas.
- Capacidades multilingues: no documentadas; el entrenamiento y la evaluacion son exclusivamente en ruso.
- Capacidades especiales (modo de pensamiento, vision, audio): ninguna documentada.

## Casos de uso

- Investigacion sobre tokenizacion en ruso: comparar este brazo `plain` con los brazos con marcadores de frontera del mismo estudio, manteniendo fija la semilla, la arquitectura, los datos y el orden de entrenamiento. Es un escenario de ablation limpia.
- Reproduccion y extension del articulo arXiv:2608.08847 a un idioma distinto del ingles: los tres checkpoints permiten repetir el experimento en ruso y comprobar la direccion del efecto mas alla de una unica semilla.
- Seleccion de vocabulario para futuros entrenamientos: usar la perdida en bits per byte de estos modelos como criterio para decidir si conviene un tokenizador con marcadores de frontera en un corpus ruso concreto.
- Docencia y experimentacion sobre entrenamiento de LLM: con 12 capas y contexto de 2.048 tokens, la configuracion es lo bastante pequena para reproducir el pipeline de nanochat en un unico equipo y estudiar el efecto del tokenizador en la curva de perdida.
- Punto de partida para ajuste fino en ruso: al ser un modelo base con pesos completos, se puede continuar el entrenamiento o aplicar ajuste supervisado sobre dominio especifico, siempre que se asuma su tamano reducido y su contexto limitado a 2.048 tokens.
- Analisis de eficiencia de compresion linguistica: la metrica de bits per byte (longitud UTF-8 real del texto puntuado) permite cuantificar cuantos bits por byte aporta cada esquema de tokenizacion, util para estimar costes de inferencia en un corpus ruso.
- Validacion de infraestructura de entrenamiento: los logs y el `archive.json` con hashes sirven para auditar una ejecucion completa (pasos, tokens, checkpoints) y verificar la integridad de los artefactos en un entorno de investigacion.

## Benchmarks y rendimiento

En la informacion disponible solo se publican resultados de validacion en bits per byte (BpB): la suma de la perdida sobre un shard reservado de Russian FineWeb-2 dividida entre la longitud UTF-8 real del texto puntuado. Menos es mejor y los valores solo son comparables dentro del mismo idioma.

| Semilla | BpB (este modelo, baseline `plain`) |
|---|---|
| 0 | 0,54900 |
| 1 | 0,54928 |
| 2 | 0,54943 |

La model card indica que este es el baseline con el que se comparan los demas esquemas, y que tres semillas ofrecen una direccion del efecto, no una estimacion precisa. La comparacion completa entre esquemas, entrenadores e idiomas esta en el repositorio script_tok. No se han publicado resultados de benchmarks en la informacion disponible para tareas tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay cifras oficiales. Por la configuracion publicada (12 capas, anchura 768) se trata de un modelo pequeno; en bf16/fp16 los pesos ocupan del orden de unos cientos de megabytes, y la inferencia con contexto de 2.048 tokens apenas anade memoria para la cache KV. Es una estimacion derivada de la configuracion, no un dato publicado.
- GPU recomendadas: no se especifican. El modelo se entreno con una GPU por modelo, pero el tipo no se detalla en la informacion disponible.
- GPU de consumo: con toda probabilidad cabe en cualquier GPU de consumo con unos pocos GB de VRAM, aunque no hay validacion oficial publicada. El cuello de botella real es el peso de los checkpoints (repositorio de 2,5 GB para las tres semillas), no la memoria de inferencia.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI. El formato publicado es un state dict de PyTorch (`torch.load(..., weights_only=True)`), por lo que la via natural de uso es cargarlo con el codigo de nanochat en Python; para usarlo en runtimes de inferencia habria que convertir los pesos y el tokenizador, trabajo que no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boundary-markers-ru-d12-plain-mingram (este) | no disponible (12 capas, anchura 768) | 2.048 tokens | BpB de validacion 0,54900 / 0,54928 / 0,54943 (semillas 0, 1, 2) en ruso | Apache-2.0 | Pesos `.pt` y tokenizador en HuggingFace |
| Otros brazos del mismo estudio (tokenizadores con marcadores de frontera, ruso) | misma arquitectura | 2.048 tokens | Comparacion completa en script_tok; no detallada en la model card | Apache-2.0 (segun la model card de este brazo) | Pesos en HuggingFace, repositorios del autor |
| nanochat d12 original (karpathy) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Entrenado sobre datos en ingles; no comparable con los BpB en ruso | no indicada en la informacion proporcionada | Repositorio publico de nanochat |

Los valores de BpB solo son comparables dentro del mismo idioma, por lo que no se pueden contrastar con modelos en ingles. No se dispone de datos de benchmarks de modelos externos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no responde a instrucciones ni mantiene formato de chat; no debe usarse como asistente conversacional.
- Riesgo de alucinacion alto: entrenado unicamente con 1.340 millones de tokens y sin alineacion, generara texto plausible pero no verificado y puede reproducir contenido sesgado o toxico presente en Russian FineWeb-2.
- Cobertura limitada a ruso: no hay datos de entrenamiento ni evaluacion en otros idiomas; el rendimiento fuera del ruso es impredecible.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Estimacion estadistica debil: solo tres semillas, y la propia model card advierte que dan una direccion del efecto, no una estimacion precisa.
- Artefacto de investigacion: su finalidad es la comparacion de tokenizadores, no el despliegue en produccion; no hay garantia de soporte ni mantenimiento.
- Empaquetado limitado: solo se publican state dicts de PyTorch y el tokenizador en JSON comprimido, sin GGUF, sin cuantizaciones y sin integracion declarada con motores de inferencia habituales. Cualquier despliegue real exige trabajo de conversion y verificacion por cuenta del usuario.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero exige conservar los avisos de licencia y no implica ninguna garantia por parte del autor; conviene revisar tambien las condiciones de los datos de FineWeb-2 utilizados en el entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay comunidad que haya validado los artefactos ni reportado problemas de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ru-d12-plain-mingram
- Articulo: Explicit Boundary Markers for Subword Vocabularies (Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Repositorio script_tok (codigo de tokenizacion y comparacion entre esquemas): https://github.com/sanderland/script_tok
- Repositorio nanochat (implementacion de entrenamiento, commit `92d63d4`): https://github.com/karpathy/nanochat
- Dataset Russian FineWeb-2, release `fineweb-2_0_1-quality_10-filterrobots`: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
