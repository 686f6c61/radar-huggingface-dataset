# fpadovani/arb-arab-10mb-10mb_seed10

## Resumen

`fpadovani/arb-arab-10mb-10mb_seed10` es un ajuste fino (SFT) del modelo `goldfish-models/arb_arab_10mb`, un checkpoint de investigacion de la iniciativa Goldfish dedicada a modelos por idioma entrenados con volumenes muy reducidos de texto. El resultado es un modelo de generacion de texto de arquitectura GPT-2 con 39.087.104 parametros (aproximadamente 39 millones), lo que lo situa en la categoria de modelos "tiny", muy por debajo de cualquier LLM de uso general.

El modelo ha sido entrenado por el usuario fpadovani con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0, y se publica en formato safetensors dentro de la libreria `transformers`. Su relevancia es exclusivamente experimental: sirve para estudiar los efectos del ajuste fino supervisado sobre modelos multilingues de bajos recursos, la estabilidad del entrenamiento segun la semilla (el sufijo `seed10` sugiere una ejecucion con semilla 10) y el comportamiento de tokenizadores nuevos, como indica el nombre del proyecto de Weights & Biases asociado.

No es un modelo apto para produccion ni para tareas de razonamiento, codigo o dialogo de calidad. Se trata de un artefacto de investigacion reproducible, con cero descargas y cero likes en el momento de la consulta, sin model card detallada mas alla de la plantilla autogenerada por TRL. La licencia no esta especificada de forma efectiva (el campo contiene el literal `license`, un marcador de posicion) y los idiomas soportados no se declaran.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 39.087.104 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No documentados por el autor; al publicarse en safetensors es convertible a GGUF (llama.cpp/Ollama) o cuantizable con bitsandbytes, pero no hay artefactos cuantizados publicados |
| Idiomas soportados | No disponible. El identificador `arb` del modelo base corresponde al codigo ISO 639-3 del arabe estandar, pero la model card no confirma el idioma ni la cobertura linguistica |
| Licencia | No disponible de forma efectiva: el campo de la model card contiene el literal `license`, un marcador de posicion sin valor legal |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio 0,9 GB |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal, normalizacion previa a la atencion y capas de feed-forward. Con 39,09 millones de parametros, la configuracion tipica de esta familia en ese rango seria de 6 a 12 capas con una dimension de embedding reducida, aunque el repositorio no publica el `config.json` en la informacion disponible, por lo que no se puede confirmar el numero exacto de capas, cabezas ni la dimension oculta. Tampoco se documenta si se ha aplicado weight tying entre la capa de embedding y la cabeza de salida.

El entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con TRL 0.23.0. El modelo parte de `goldfish-models/arb_arab_10mb`, un checkpoint de la familia Goldfish entrenado por idioma con aproximadamente 10 MB de texto (el nombre del repositorio lo sugiere, si bien no se documenta explicitamente). El identificador `arb-arab-10mb-10mb_seed10` apunta a un ajuste adicional sobre ese mismo volumen de 10 MB y a una semilla concreta (10), lo que encaja con un diseno experimental de comparacion de semillas o de tokenizadores, coherente con el proyecto de Weights & Biases `new_tokenizers` enlazado en la model card. No se especifica la composicion del dataset de ajuste, el numero de tokens vistos, ni si hubo fases posteriores de RLHF o DPO; la unica etapa declarada es SFT.

## Capacidades

- Generacion de texto autoregresiva basica, mediante `pipeline("text-generation")` de Transformers.
- Formateo de entrada conversacional: el ejemplo de la model card pasa una lista de mensajes con el rol `user`, aunque no hay evidencia de que el modelo haya sido alineado para seguir instrucciones de forma fiable.
- Integracion con el ecosistema `transformers` y compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` (etiquetas del repositorio).
- Capacidad multilingue: no confirmada. El modelo base pertenece a una iniciativa multilingue por idioma, pero no se documenta que idiomas conserva el ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamano del modelo hace inviable un razonamiento fiable.
- Modo "thinking", vision, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigacion sobre tokenizadores multilingues: el proyecto de seguimiento en Weights & Biases se llama `new_tokenizers`, de modo que este checkpoint sirve como punto de comparacion para medir como distintos vocabularios afectan a la perplejidad en un mismo corpus de 10 MB.
- Ablaciones de ajuste fino con control de semilla: al existir variantes con la misma receta y distinta semilla, permite cuantificar la varianza del SFT en modelos de 39 M de parametros y estimar el ruido experimental en tareas de generacion.
- Pruebas de regresion y humo en pipelines de MLOps: su tamano (0,9 GB de repositorio) permite descargarlo, cargarlo y generar texto en segundos dentro de un runner de CI, validando que el pipeline de `transformers`, safetensors y TGI funciona antes de escalar a modelos grandes.
- Docencia y divulgacion: ilustra de forma tangible el comportamiento de un transformer decoder-only entrenado con recursos minimos, util para explicar tokenizacion, perplejidad y embeddings en un aula o taller.
- Estudio de olvido catastrofico: comparar este ajuste con su modelo base `goldfish-models/arb_arab_10mb` permite medir cuanto conocimiento del corpus original se degrada tras una segunda fase de SFT.
- Generacion de texto sintetico de baja calidad para pruebas de carga: sirve para estresar bases de datos, colas de mensajes o interfaces de chat con textos realistas en su estructura, sin coste de GPU.
- Reproduccion de experimentos en entornos sin GPU: al caber en CPU, permite replicar resultados academicos en portatiles o servidores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web proporcionados no contienen datos tecnicos sobre el modelo: son articulos deportivos sobre la rivalidad entre Boston Celtics y Los Angeles Lakers y no guardan relacion con la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 MB en fp32, unos 80 MB en fp16/bf16 y alrededor de 40 MB en int8. Las activaciones son despreciables a esta escala; en la practica, menos de 1 GB de memoria es suficiente.
- GPU recomendadas: no requiere GPU. Cualquier acelerador con 2 GB o mas funciona sin problemas, incluidas NVIDIA GTX 1050/1650, RTX 3050, RTX 4090, A100 o H100 (todas sobredimensionadas para este modelo).
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en iGPU tipo Intel Iris Xe o Apple Silicon.
- Opciones de despliegue: `transformers` (pipeline de text-generation), `text-generation-inference` (etiqueta declarada en el repositorio), `endpoints_compatible`, y llama.cpp u Ollama si se convierte a GGUF. vLLM es tecnicamente posible pero su uso esta pensado para modelos mayores y el overhead de planificacion no aporta ventaja aqui.
- Latencia y throughput estimados: no disponible. No se publican mediciones. A modo orientativo, en CPU moderna la generacion es del orden de decenas de tokens por segundo por la reducida huella de memoria, pero no hay cifras oficiales que respalden ninguna estimacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fpadovani/arb-arab-10mb-10mb_seed10 | 39.087.104 | No disponible | No disponible (marcador `license`) | HuggingFace, safetensors | Punto de partida de esta ficha |
| goldfish-models/arb_arab_10mb | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace | Modelo base del ajuste; mismo origen de datos (10 MB) |
| Otros modelos comparables | No disponible | No disponible | No disponible | No disponible | La busqueda web realizada no devolvio modelos comparables; los resultados eran contenido deportivo sin relacion |

## Limitaciones y advertencias

- Tamano muy reducido: 39 millones de parametros y un corpus de entrenamiento de aproximadamente 10 MB implican una capacidad linguistica y de conocimiento del mundo minima. Es esperable texto incoherente, repeticiones y perdida de contexto en pocos turnos.
- Riesgo de alucinacion: muy alto. El modelo no dispone de conocimiento factual verificable y no hay mecanismos de grounding.
- Ausencia de alineacion verificable: aunque el ejemplo de la model card usa formato conversacional, un SFT sobre 10 MB no garantiza seguir instrucciones, rechazar peticiones daninas ni mantener el rol asignado.
- Idioma no confirmado: no se declara la lista de idiomas soportados; el codigo `arb` del modelo base sugiere arabe estandar, pero conviene validarlo empiricamente antes de cualquier uso, y no hay garantia de cobertura multilingue.
- Longitud de contexto no documentada: no se puede planificar el uso con entradas largas sin medirla previamente.
- Licencia incierta: el campo de licencia contiene el literal `license`, sin terminos efectivos. Esto bloquea cualquier uso comercial o redistribucion hasta aclararlo con el autor y con el titular del modelo base.
- Sin benchmarks: no hay ninguna metrica publicada que permita comparar su calidad de forma objetiva.
- Adopcion nula y mantenimiento incierto: cero descargas y cero likes en el momento de la consulta, sin garantia de soporte ni actualizaciones.
- No apto para produccion: no debe utilizarse en atencion al cliente, generacion de codigo, analisis de datos ni cualquier flujo con usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/arb-arab-10mb-10mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/arb_arab_10mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/iyrjnyma
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo; los resultados devueltos correspondian a contenidos deportivos de la NBA sin relacion con la ficha.
