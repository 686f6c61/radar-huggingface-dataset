# CharlieChen/loop-untied-grow-d10

## Resumen

loop-untied-grow-d10 es un checkpoint de modelo de lenguaje base entrenado desde cero por el autor CharlieChen (usuario de HuggingFace) y publicado como artefacto de investigación asociado al artículo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con reciclado de bloques (looped transformer) en el que el mismo núcleo se ejecuta varias veces: la model card indica un modo de profundidad `dep` y 4 repeticiones del núcleo configuradas y efectivamente empleadas en la evaluación final. El checkpoint almacena 575.733.760 parámetros en FP32 (2,303 GB) y corresponde a la coordenada de profundidad d10 de la escalera de escalado sobre FineWeb.

El modelo no está afinado por instrucciones: es un base model puro, pensado para estudiar leyes de escalado y exponentes de crecimiento, recursión y operadores de frontera, no para uso conversacional directo. Emplea el tokenizador de GPT-2 (`tiktoken.get_encoding("gpt2")`) con un vocabulario de 50.257 tokens rellenado hasta 50.304 filas, anchura 1280, 10 cabezas de atención y una longitud de contexto de 2.048 tokens. El único resultado métrico publicado es la pérdida de validación en el corpus de preentrenamiento: 2,962493 nats/token.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para reproducir la escalera de escalado del artículo y para experimentar con arquitecturas de reciclado de profundidad a escala de ~0,58B de parámetros. No es un modelo orientado a producto: no hay licencia declarada, no hay cuantizaciones publicadas y el checkpoint no es cargable con `AutoModel` de Transformers, sino que requiere el código propio del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con reciclado de bloques (looped transformer), modo de profundidad `dep`, 4 repeticiones del nucleo |
| Parametros totales | 575.733.760 (FP32, 2,303 GB en disco) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se publica el checkpoint original en FP32; no hay GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | `final.pt` (checkpoint PyTorch nativo, no safetensors, no `AutoModel`) |
| Anchura (d_model) | 1280 |
| Cabezas de atencion | 10 |
| Tokenizador | GPT-2 via `tiktoken.get_encoding("gpt2")` |
| Vocabulario | 50.257 tokens, rellenado a 50.304 filas del modelo |
| Corpus de entrenamiento | FineWeb (`HuggingFaceFW/fineweb`) |
| Perdida de validacion (preentrenamiento) | 2,962493 nats/token |
| Archivos del repositorio | `final.pt`, `result.json`, `SHA256SUMS` |
| Tarea declarada (pipeline) | `text-generation` |
| Tamano del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con reciclado de bloques: un mismo nucleo de capas se aplica repetidamente, de forma que la profundidad efectiva de computo se controla mediante el numero de repeticiones en lugar de mediante un apilamiento de capas independientes. La model card indica el modo de profundidad `dep`, 4 repeticiones configuradas y 4 repeticiones usadas en la evaluación final, y advierte de forma explícita que la coordenada de profundidad de la escalera de escalado no tiene por que coincidir con el numero de bloques Transformer ejecutados. La anchura es 1280 y la atención usa 10 cabezas (dimensión por cabeza de 128). El nombre del checkpoint, "untied grow", sugiere una variante con pesos de embedding no atados entre entrada y salida dentro de la familia de experimentos del artículo.

El entrenamiento se realizo sobre el corpus FineWeb con el tokenizador GPT-2. La model card no detalla el numero de tokens vistos, la composición exacta del dataset, la mezcla de datos ni si hubo fases de RLHF o DPO; al tratarse de un base model preentrenado, no se aplico ajuste por instrucciones. Tampoco se conserva el estado del optimizador, por lo que el artefacto no permite reanudar el entrenamiento, solo evaluar o reutilizar los pesos. En la evaluación del artículo se emplearon GPU H100, FlashAttention-3 y autocast en bfloat16, y el pipeline oficial de evaluación es CORE con 22 tareas y semillas 0/1/2.

## Capacidades

- Generacion de texto en ingles: es la funcion basica del modelo como base model autoregresivo, con completado de secuencias a partir de un prefijo.
- Modelado de lenguaje y medicion de perplejidad: util para calcular NLL sobre corpus de texto y comparar regimenes de escalado.
- Reproduccion de experimentos de escalado: permite validar los exponentes de escalado del articulo con el mismo checkpoint original.
- Estudio de arquitecturas con reciclado de profundidad: sirve como punto de comparacion frente a transformers de profundidad fija del mismo orden de parametros.
- Evaluacion mediante CORE: el codigo del paper incluye `eval.py` para ejecutar las 22 tareas de CORE con semillas 0/1/2, con soporte de evaluacion reducida (`--max-per-task`).
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente para ingles.
- Tool calling / function calling: no disponible; es un base model sin plantilla de instrucciones ni formato de herramientas.
- Comportamiento agentico o razonamiento multi-paso guiado: no disponible por diseno (sin instruction tuning).
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar `final.pt` junto con `result.json` mediante el repositorio `cue-engineering/loop` y reejecutar la evaluacion CORE completa (22 tareas, semillas 0/1/2) para verificar el NLL de validacion de 2,962493 nats/token y las metricas del punto d10 de la escalera.
- Estudios de leyes de escalado: usar el checkpoint como punto concreto de la escalera sobre FineWeb para ajustar exponentes de escalado en funcion de la profundidad, la recursion y los operadores de frontera definidos en el articulo.
- Comparacion de arquitecturas con reciclado de profundidad frente a transformers estandar: emparejar este modelo con un transformer de ~0,58B y profundidad fija entrenado sobre el mismo corpus para aislar el efecto del reciclado en la perdida de validacion.
- Analisis de eficiencia de parametros y computo: al reutilizar el nucleo 4 veces, permite medir como se reparte la perdida entre parametros almacenados y FLOPs ejecutados por token, siempre que se reconstruya el modelo con el codigo del paper.
- Generacion de texto de dominio general en ingles sin post-procesado: completar documentos tecnicos o corpus sinteticos cuando no se requiere seguir instrucciones ni mantener un formato conversacional.
- Filtrado y puntuacion de corpus: calcular la log-verosimilitud de pasajes de texto en ingles con FineWeb como dominio de referencia, para descartar contenido atipico en pipelines de curacion de datos.
- Docencia y formacion en IA: al ser un checkpoint pequeno (2,3 GB en FP32) con un articulo asociado, sirve para ilustrar en practicas conceptos de transformers con reutilizacion de bloques y de medicion de NLL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible. El unico dato metrico proporcionado por el autor es la perdida de validacion de preentrenamiento:

| Metrica | Valor | Notas |
|---|---|---|
| Pretraining validation NLL | 2,962493 nats/token | Medida sobre el corpus de preentrenamiento (FineWeb) |
| Configuracion de evaluacion | 4 repeticiones del nucleo | Repeticiones finales de evaluacion |
| CORE (22 tareas, semillas 0/1/2) | No disponible | El autor indica que las puntuaciones de smoke test no equivalen a los resultados completos del paper |

El autor advierte explicitamente de que el NLL de validacion sobre el corpus de preentrenamiento es distinto del NLL de respuestas de CORE, y que una evaluacion reducida con `--max-per-task 10` es solo una comprobacion de funcionamiento, no un resultado publicable.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 2,303 GB en FP32 y aproximadamente 1,15 GB si se cargan en bfloat16 o FP16. Con autocast en bfloat16 y contexto de 2.048 tokens, una GPU de 4 GB es suficiente en la practica.
- Memoria de activaciones y KV cache: la model card no publica el numero de bloques ejecutados, por lo que el KV cache no puede calcularse de forma cerrada. Con los datos conocidos (10 cabezas, 128 dimensiones por cabeza, FP16/BF16) cada bloque consume 5.120 bytes por token, es decir 10 MB por cada 2.048 tokens y por bloque.
- GPU recomendadas: el paper utilizo H100 con FlashAttention-3 y autocast en bfloat16 para entrenamiento y evaluacion. Para inferencia, cualquier GPU con al menos 4-6 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, A10, L4, A100).
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4070 o incluso una GPU integrada con 6 GB de memoria compartida pueden alojar el modelo en FP16.
- Opciones de despliegue: no hay soporte estandar. El checkpoint es un `final.pt` que debe reconstruirse con la clase `TransformerGPT` del repositorio `cue-engineering/loop`; no es un `AutoModel` de Transformers, por lo que vLLM, TGI, llama.cpp y Ollama no lo cargan sin conversion previa de pesos y definicion de arquitectura personalizada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No hay resultados de benchmarks publicados para este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos provienen de sus model cards publicas y se incluyen como referencia de categoria (modelos base en el rango 0,3B-1,5B), no como comparacion de rendimiento verificada.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad en ecosistema estandar |
|---|---|---|---|---|---|
| loop-untied-grow-d10 | 575,7 M (FP32) | 2.048 | Transformer con reciclado de bloques, base | No disponible | Solo PyTorch nativo con codigo del paper; sin GGUF ni `AutoModel` |
| Pythia-410M | 410 M | 2.048 | Transformer denso, base | Apache-2.0 | `AutoModel`, GGUF y multiples runtimes |
| Qwen2.5-0.5B | 494 M | 32.768 | Transformer denso, base | Apache-2.0 | `AutoModel`, GGUF, vLLM, Ollama |
| SmolLM2-360M | 362 M | 8.192 | Transformer denso, base | Apache-2.0 | `AutoModel`, GGUF, vLLM, Ollama |

Si se necesita una alternativa con soporte de produccion, licencia clara y tooling maduro, cualquiera de los tres modelos de la tabla resulta mas adecuado. El interes de loop-untied-grow-d10 es exclusivamente el estudio de la recursion de profundidad dentro de la escalera de escalado del articulo.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no sigue ordenes, no mantiene formato conversacional y no dispone de plantilla de chat ni de `system prompt`.
- Riesgo alto de alucinacion y de generacion incoherente fuera de distribucion: al ser un base model entrenado solo para modelado de lenguaje, no hay alineacion ni filtros de seguridad.
- Sesgos: no se documenta ningun analisis de sesgos ni de toxicidad. El entrenamiento sobre FineWeb, un corpus de web rastreada, implica la presencia de los sesgos habituales de ese tipo de datos.
- Limitacion idiomatica: etiquetado unicamente para ingles; el tokenizador GPT-2 no esta optimizado para castellano ni para otras lenguas con morfologia rica.
- Contexto corto: 2.048 tokens, muy por debajo de los 32.768 de Qwen2.5-0.5B o los 8.192 de SmolLM2-360M. No es apto para tareas de contexto largo.
- Licencia no disponible: al no declararse licencia en el repositorio, no hay autorizacion explicita de uso comercial. En la practica, debe tratarse como un artefacto de investigacion sin garantias y consultar al autor antes de cualquier uso en produccion.
- Integracion limitada: no es un checkpoint `AutoModel`, no hay cuantizaciones publicadas y no se conserva el estado del optimizador, por lo que no se puede reanudar el entrenamiento ni hacer fine-tuning incremental directo con las herramientas habituales.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, y la unica validacion disponible es el NLL de preentrenamiento. Cualquier otra afirmacion de rendimiento requeriria reejecutar la evaluacion CORE completa con el codigo del paper.
- Advertencia del autor: los resultados de la evaluacion reducida (`--max-per-task 10`) no son resultados completos del paper y no deben citarse como tales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-grow-d10
- Repositorio de codigo del paper (evaluacion y reconstruccion del modelo): https://github.com/cue-engineering/loop
- Corpus de entrenamiento FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (no se proporciona URL en la informacion disponible)
- Encoding GPT-2 de tiktoken: https://github.com/openai/tiktoken
- No se han encontrado otros enlaces relevantes en la busqueda web; los resultados devueltos corresponden a servicios de fontaneria en Singapur y no guardan relacion con el modelo.
