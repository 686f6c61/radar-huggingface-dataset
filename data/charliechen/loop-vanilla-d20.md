# CharlieChen/loop-vanilla-d20

## Resumen

loop-vanilla-d20 es un modelo de lenguaje base de tipo transformer, publicado por CharlieChen (usuario de HuggingFace) como artefacto de investigacion asociado al articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". No es un modelo orientado a producto ni a instrucciones: es el checkpoint final original de la escalera de escalado (scaling ladder) entrenada sobre FineWeb, preservado tal cual salio del entrenamiento, dentro de una linea de experimentos sobre transformers con recursion (looped transformers).

El modelo tiene 1.843.527.680 parametros almacenados en FP32 (7,374 GB), una anchura de 2560, 20 cabezas de atencion y una longitud de contexto de 2048 tokens. La coordenada de profundidad del experimento es d20 y la configuracion usada tiene una repeticion del nucleo ("configured core repetitions" = 1), por lo que esta variante "vanilla" actua como referencia o linea base del estudio de recurrencia: se ejecutan los bloques una sola vez, sin reutilizacion del nucleo.

Su relevancia es acotada pero clara para la comunidad de investigacion en escalado: aporta un punto reproducible de una familia de modelos entrenados con el mismo corpus y tokenizador, con la NLL de validacion registrada (2,683423 nats/token) y el codigo de evaluacion publicado. No incluye ajuste por instrucciones, no publica licencia y no es un checkpoint compatible con `AutoModel` de Transformers, lo que limita su uso directo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `looped-transformer`), clase custom `TransformerGPT`; modo de profundidad `none` |
| Parametros totales | 1.843.527.680 (almacenados en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en FP32; no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`final.pt`), no safetensors, no `AutoModel` |
| Anchura (hidden size) | 2.560 |
| Cabezas de atencion | 20 |
| Modo de profundidad | `none` |
| Repeticiones del nucleo | 1 configurada, 1 en evaluacion final |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`), vocabulario 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | FineWeb |
| NLL de validacion (pretraining) | 2,683423 nats/token |
| Tamano del repositorio | 7,4 GB |
| Archivos incluidos | `final.pt`, `result.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder, con anchura 2560 y 20 cabezas de atencion (128 dimensiones por cabeza). La etiqueta del repositorio lo situa en la familia de los "looped transformers", es decir, arquitecturas en las que un nucleo de bloques puede reutilizarse varias veces, pero esta variante concreta tiene el modo de profundidad desactivado (`none`) y una unica repeticion del nucleo, tanto en configuracion como en la evaluacion final. El propio autor advierte que la coordenada de profundidad d20 es la coordenada de escalado de la escalera experimental y "no tiene por que coincidir con el numero de bloques Transformer ejecutados"; el numero exacto de capas no se indica en la model card. A partir del recuento de parametros y de la anchura declarada, un transformer denso con embeddings atados implicaria del orden de 20-22 bloques, pero es una estimacion derivada y no un dato publicado.

El entrenamiento se realizo sobre FineWeb con el tokenizador GPT-2 y una longitud de contexto de 2048 tokens. Se trata de un modelo exclusivamente preentrenado, sin ajuste por instrucciones, sin RLHF ni DPO, y el checkpoint no conserva el estado del optimizador, por lo que no permite reanudar el entrenamiento. La evaluacion del articulo se ejecuto en GPUs H100 con FlashAttention-3 y autocast en bfloat16, lo que da una indicacion de la configuracion de referencia, aunque el forward estandar del modelo no exige esas optimizaciones.

## Capacidades

- Generacion de texto autoregresiva en ingles: es la funcion para la que esta etiquetado (`text-generation`).
- Modelado de lenguaje base: la metrica principal publicada es la NLL de validacion sobre el corpus de preentrenamiento (2,683423 nats/token), no una capacidad instructiva.
- Contexto de 2048 tokens: suficiente para documentos cortos, fragmentos de codigo o conversaciones breves, no para contexto largo.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente como ingles.
- Tool calling / function calling: no disponible (no hay ajuste por instrucciones ni plantilla de chat).
- Uso como agente o razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo "thinking", decodificacion especulativa): no disponibles.
- Uso como linea base experimental: el modelo esta pensado para reproducir comparaciones de escalado en el codigo del articulo, incluyendo la evaluacion CORE de 22 tareas.

## Casos de uso

- Reproduccion de resultados de escalado: cargar `final.pt` con `result.json` y el codigo de `cue-engineering/loop` permite reproducir el punto d20 de la escalera de FineWeb y compararlo con las variantes recursivas del articulo. Es el uso principal del artefacto.
- Investigacion sobre transformers con recursion: sirve como referencia "vanilla" (sin reutilizacion del nucleo) frente a configuraciones con repeticiones del nucleo, aislando el efecto de la recursion en las exponentes de escalado.
- Fine-tuning supervisado como base de dominio: al ser un modelo preentrenado puro, se puede ajustar con SFT sobre datos propios en ingles; 1,84B de parametros caben en una sola GPU de 24 GB en bfloat16, lo que lo hace asequible para experimentos academicos.
- Generacion de texto y continuacion de documentos: con 2048 tokens de contexto y vocabulario GPT-2, es utilizable para tareas de completado y generacion de texto en ingles, siempre con validacion humana por su condicion de modelo base.
- Extraccion de representaciones internas (features): el checkpoint en FP32 y la reconstruccion via codigo propio permiten inspeccionar activaciones y estados ocultos, util para estudios de interpretabilidad sobre modelos de ~2B.
- Comparacion de eficiencia entre precisiones: al disponer del checkpoint FP32 completo, permite medir degradacion de perplejidad al pasar a bfloat16 o a cuantizaciones propias en un rango de 2B parametros.
- Docencia y practicas de ingenieria de modelos: el flujo de descarga con `snapshot_download`, la verificacion con `SHA256SUMS` y la evaluacion con `eval.py` sirven como ejemplo de pipeline reproducible de evaluacion en GPU.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / condiciones |
|---|---|---|
| NLL de validacion (pretraining) | 2,683423 nats/token | FineWeb, validacion de preentrenamiento |
| NLL de respuestas CORE | no disponible (el autor distingue explicitamente la NLL de validacion de la NLL de respuestas CORE) | CORE, 22 tareas |
| CORE completo (22 tareas, seeds 0/1/2) | no publicado en la model card; el codigo permite ejecutarlo | CORE |
| Smoke test acotado | reproducible con `--max-per-task 10 --seeds 0 1 2`, pero los resultados no equivalen a los del articulo | CORE (subconjunto) |
| MMLU, HumanEval, GSM8K u otros | no disponibles | - |

No se han publicado resultados de benchmarks completos en la informacion disponible. El unico numero oficial es la NLL de validacion de preentrenamiento, que no es comparable con metricas de modelos ajustados por instrucciones.

## Requisitos de hardware

- Pesos en FP32 (formato publicado): 7,374 GB solo para los pesos; con activaciones, memoria de trabajo y cache KV el consumo real es superior.
- Pesos en bfloat16 (conversion propia): aproximadamente 3,7 GB, calculado a partir de los 1,84B de parametros.
- Pesos en int8 / int4 (conversion propia, no publicada): aproximadamente 1,8 GB y 0,9 GB respectivamente, segun el mismo calculo.
- Cache KV en bfloat16 con contexto completo (2048 tokens, 20 cabezas de 128 dimensiones): del orden de 0,4 GB suponiendo 20-22 bloques, estimacion derivada del recuento de parametros; el numero exacto de capas no esta publicado.
- GPU de referencia del articulo: H100 con FlashAttention-3 y autocast en bfloat16.
- GPU profesionales: A100 40 GB y 80 GB, H100, L40S; todas sobradas para un modelo de este tamano.
- GPU de consumo: cabe sin problema en RTX 4090, RTX 3090, RTX 4080 y tarjetas de 12-16 GB en bfloat16 (3,7 GB de pesos mas cache y activaciones). En FP32 requeriria al menos 12-16 GB para operar con margen.
- Opciones de despliegue: el checkpoint es un `.pt` con una clase custom (`TransformerGPT`) y no es un `AutoModel` de Transformers. vLLM, TGI, llama.cpp, Ollama y LM Studio no lo cargan sin una conversion y el registro de la arquitectura. El camino soportado es instalar el codigo de `cue-engineering/loop` y ejecutar `eval.py`; cualquier servicio de inferencia exige trabajo previo de portado.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de primera token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato / compatibilidad | Datos publicados |
|---|---|---|---|---|---|---|
| loop-vanilla-d20 | 1,84B (FP32) | 2.048 | en | no disponible | `.pt`, clase custom, no `AutoModel` | NLL 2,683423 nats/token; CORE no publicado |
| Pythia-1.4B (EleutherAI) | 1,4B | 2.048 | en | Apache-2.0 | safetensors, compatible con Transformers | Suite completa de evaluacion publicada |
| GPT-2 XL (OpenAI) | 1,5B | 1.024 | en | licencia MIT modificada | safetensors / PyTorch, compatible con Transformers | Metricas de WebText publicadas en el articulo original |

La comparacion se limita a parametros, contexto, idioma, licencia, formato y disponibilidad de evaluaciones; no se dispone de resultados de MMLU, HumanEval, GSM8K ni CORE para loop-vanilla-d20, por lo que no es posible comparar rendimiento tarea a tarea. Frente a Pythia-1.4B y GPT-2 XL, la diferencia practica mas relevante es la ausencia de licencia declarada y la incompatibilidad con el ecosistema estandar de inferencia.

## Limitaciones y advertencias

- Ausencia de licencia: la model card no declara licencia alguna, lo que deja en situacion juridica indeterminada cualquier uso comercial o redistribucion. Es un riesgo grave para produccion.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones, no tiene plantilla de chat ni formato de mensajes; puede requerir ingenieria de prompts especifica para cada tarea.
- Riesgo de alucinacion: al ser un modelo de lenguaje puro sin alineamiento ni RLHF, no hay mecanismos de rechazo ni de calibracion de la veracidad. Cualquier salida debe validarse.
- Sesgos: no hay informacion publicada sobre evaluaciones de sesgo, toxicidad o equidad. El corpus FineWeb es un rastreo web sin filtrado especifico declarado en esta ficha, por lo que son esperables sesgos propios de datos web.
- Contexto limitado: 2048 tokens, muy por debajo de los 32K-128K habituales en modelos actuales; no admite casos de uso con documentos largos o conversaciones extensas sin truncado.
- Limitacion idiomatica: soporte declarado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta documentado ni garantizado.
- Compatibilidad de codigo: el checkpoint no es un `AutoModel`; sin el repositorio `cue-engineering/loop` no se puede reconstruir la clase `TransformerGPT`. Esto rompe pipelines estandar de vLLM, TGI, llama.cpp, Ollama y frameworks de cuantizacion automatica.
- Estado del checkpoint: no incluye estado del optimizador, por lo que no se puede reanudar el entrenamiento; solo sirve para inferencia o para un fine-tuning desde cero del optimizador.
- Metrica de calidad: la unica metrica publicada es una NLL de validacion sobre el propio corpus de preentrenamiento, que no mide capacidades reales de tarea ni permite comparaciones con modelos ajustados.
- Resultados del smoke test: los autores advierten que las puntuaciones del smoke test (`--max-per-task 10`) no equivalen a los resultados completos del articulo; no deben citarse como rendimiento del modelo.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se publico sin articulo enlazado directamente en la model card, solo con el titulo del paper y el repositorio de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-vanilla-d20
- Repositorio de codigo del articulo: https://github.com/cue-engineering/loop
- Dataset de entrenamiento (FineWeb): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Tokenizador GPT-2 via tiktoken: https://github.com/openai/tiktoken
- Articulo de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (titulo indicado en la model card; no se proporciona enlace directo)
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo.
