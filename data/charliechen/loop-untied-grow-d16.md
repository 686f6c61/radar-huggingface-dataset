# CharlieChen/loop-untied-grow-d16

## Resumen

`loop-untied-grow-d16` es un modelo de lenguaje base preentrenado, publicado por el usuario CharlieChen, que constituye el checkpoint final original de la escalera de escalado sobre FineWeb descrita en el articulo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*. No es un modelo destinado a produccion ni a uso conversacional: se trata de un artefacto de investigacion liberado para reproducir los experimentos del paper sobre leyes de escalado en transformers con reciclado (looped transformers).

El modelo almacena 1.952.972.800 parametros en FP32 (7,812 GB) y emplea una arquitectura de transformer con reciclado de profundidad, con una anchura de 2048, 16 cabezas de atencion y una longitud de contexto de 2048 tokens. La coordenada de profundidad de la escalera es d16 y el modo de profundidad configurado es `dep`, con 4 repeticiones del nucleo (tanto en configuracion como en evaluacion final). Es relevante porque permite auditar de forma independiente los exponentes de escalado reportados y reutilizar el checkpoint como punto de partida en estudios de crecimiento de modelos, recursion y operadores de frontera.

El checkpoint se distribuye como un fichero PyTorch nativo (`final.pt`) junto con metadatos portables (`result.json`) y sumas de verificacion (`SHA256SUMS`). No es un `AutoModel` de Transformers: requiere el codigo propio del paper (`cue-engineering/loop`) para reconstruir la clase `TransformerGPT`. El modelo no ha recibido ajuste por instrucciones, no dispone de licencia declarada y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con reciclado (looped transformer), modo de profundidad `dep` |
| Parametros totales | 1.952.972.800 (almacenados en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`final.pt`, FP32); no safetensors ni GGUF |
| Anchura (hidden size) | 2048 |
| Cabezas de atencion | 16 |
| Vocabulario | 50.257 tokens (tokenizer GPT-2 de tiktoken), ampliado a 50.304 filas del modelo |
| Repeticiones del nucleo | 4 configuradas y 4 en evaluacion final |
| Coordenada de profundidad | d16 |
| NLL de validacion (preentrenamiento) | 2,650865 nats/token |
| Corpus de entrenamiento | FineWeb |
| Tamano del repositorio | 7,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con reciclado de bloques: en lugar de apilar un numero fijo de capas independientes, un nucleo de capas se ejecuta repetidamente. El checkpoint corresponde a la variante *untied grow* con coordenada de profundidad d16, y el autor advierte explicitamente que la coordenada de profundidad de la escalera no tiene por que coincidir con el numero de bloques Transformer efectivamente ejecutados. La configuracion usa 4 repeticiones del nucleo y un modo de profundidad etiquetado como `dep`, con anchura 2048 y 16 cabezas de atencion.

El entrenamiento se realizo sobre el corpus FineWeb con el tokenizer GPT-2 (`tiktoken.get_encoding("gpt2")`) y un vocabulario de 50.257 tokens ampliado a 50.304 filas. El autor reporta una NLL de validacion de preentrenamiento de 2,650865 nats/token, medida sobre el propio corpus de preentrenamiento y distinta de la NLL de respuestas CORE. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO; al ser un modelo base sin ajuste por instrucciones, no se espera alineacion de este tipo. En cuanto a innovaciones tecnicas, el interes del artefacto reside en el propio mecanismo de crecimiento y recursion del modelo, no en optimizaciones de inferencia: el paper emplea H100, FlashAttention-3 y autocast en bfloat16, pero el checkpoint no incluye estado del optimizador ni permite reanudar el entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base preentrenado (sin ajuste por instrucciones).
- Modelado de lenguaje puro: el checkpoint esta pensado para evaluacion de NLL y para estudios de escalado, no para tareas instructivas.
- Evaluacion mediante el harness CORE del paper, con 22 tareas y semillas 0, 1 y 2.
- Capacidad de servir como punto de partida experimental en investigacion sobre crecimiento de modelos, recursion y operadores de frontera.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay capacidades multimodales (vision, audio) ni modo de pensamiento explicito.
- Multilinguismo: no disponible; el unico idioma declarado es el ingles.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar `final.pt` y `result.json` con el codigo de `cue-engineering/loop` para replicar las metricas de NLL de validacion y las puntuaciones CORE del paper sobre las 22 tareas.
- Estudios de leyes de escalado: usar este checkpoint como punto de la escalera d16 para comparar exponentes de escalado frente a otros puntos de profundidad y analizar como afectan el crecimiento y la recursion.
- Analisis de mecanismos de reciclado: instrumentar el modelo para medir como se transforman las representaciones a lo largo de las 4 repeticiones del nucleo y contrastarlo con transformadores de profundidad fija de parametros similares.
- Evaluacion de tecnicas de atencion eficiente: el paper emplea FlashAttention-3, de modo que el checkpoint sirve para medir el efecto de distintas implementaciones de atencion sobre la NLL.
- Punto de partida para ajuste supervisado: al ser un modelo base de ~1,95 B de parametros con vocabulario GPT-2, puede servir como inicializacion en experimentos academicos de fine-tuning en ingles, asumiendo la ausencia de licencia declarada.
- Pruebas de infraestructura de entrenamiento e inferencia: su tamano (7,8 GB en FP32) permite validar pipelines de carga de checkpoints PyTorch nativos, autocast en bfloat16 y verificacion de integridad mediante `SHA256SUMS`.
- Docencia en cursos de arquitecturas recursivas: la existencia de `result.json` con la configuracion portable facilita reconstruir el modelo en aula sin depender de pesos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la NLL de validacion de preentrenamiento (2,650865 nats/token) e indica que la evaluacion CORE completa abarca 22 tareas con semillas 0, 1 y 2, pero no incluye las puntuaciones obtenidas. El autor advierte ademas que los resultados de la evaluacion de humo (`--max-per-task 10`) no equivalen a los resultados completos del paper.

| Metrica | Valor |
|---|---|
| NLL de validacion de preentrenamiento | 2,650865 nats/token |
| NLL de respuestas CORE | no disponible |
| Puntuaciones CORE por tarea | no disponible |
| MMLU, HumanEval, GSM8K u otros | no disponible |

## Requisitos de hardware

- VRAM para inferencia: el checkpoint original ocupa 7,812 GB en FP32, por lo que se necesitan al menos ~8 GB de VRAM para cargarlo sin conversion.
- En bfloat16 (precision usada en el paper con autocast) los pesos ocuparian aproximadamente 3,9 GB, mas el coste de activaciones y cache KV para 2048 tokens.
- GPU de referencia del paper: H100, con FlashAttention-3.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en FP32 (por ejemplo RTX 3070/4060 Ti de 8 GB con margen ajustado) y con holgura en RTX 4080, RTX 4090 o RTX 5090 en bfloat16.
- Despliegue: no compatible de serie con vLLM, llama.cpp, Ollama ni TGI, ya que el artefacto es un checkpoint PyTorch de una clase personalizada (`TransformerGPT`) y no un `AutoModel` de Transformers; el unico camino documentado es el codigo de `cue-engineering/loop`.
- Latencia y throughput: no disponibles.
- Nota operativa: el checkpoint no incluye estado del optimizador, por lo que no permite reanudar el entrenamiento.

## Comparativa con modelos similares

La comparativa se establece con modelos base abiertos de escala cercana (entre 1,5 y 2 mil millones de parametros). Los datos de las alternativas proceden de sus especificaciones publicas y no de la informacion proporcionada en esta busqueda, por lo que conviene verificarlos antes de usarlos en una decision de produccion.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Orientacion |
|---|---|---|---|---|---|
| loop-untied-grow-d16 | 1,95 B | 2048 | en | no disponible | Artefacto de investigacion (leyes de escalado, transformer reciclado) |
| Qwen2.5-1.5B | ~1,5 B | 32.768 | multilingue | Apache 2.0 (variante base) | Modelo base y variantes instructivas de uso general |
| SmolLM2-1.7B | ~1,7 B | 8192 | en (principalmente) | Apache 2.0 | Modelo base e instructivo ligero |
| Gemma 2 2B | ~2,6 B | 8192 | multilingue | Terminos propios de Gemma | Modelo base e instructivo de uso general |

Diferencias clave: el modelo de este analisis no es un `AutoModel` estandar y requiere codigo propio, carece de licencia declarada, no soporta cuantizacion documentada ni formatos GGUF, y su ventana de contexto de 2048 tokens es notablemente inferior a la de las alternativas. Su interes es cientifico (estructura recursiva y escalado), no competitivo en tareas de generacion.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el autor no documenta analisis de sesgo y el corpus FineWeb no se ha filtrado especificamente para este artefacto mas alla del preprocesado estandar.
- Riesgo de alucinacion: alto en cualquier uso generativo, ya que se trata de un modelo base sin ajuste por instrucciones ni alineacion.
- Limitacion de contexto: solo 2048 tokens, muy por debajo de los modelos base contemporaneos, lo que restringe tareas de contexto largo.
- Limitacion de idioma: unicamente ingles declarado; no hay evidencia de competencia multilingue.
- Licencia: no disponible, lo que impide asumir permisos de uso comercial. Debe tratarse como artefacto de investigacion hasta que el autor aclare los terminos.
- Compatibilidad: no funciona con cargadores estandar (`AutoModel`), ni con vLLM, llama.cpp, Ollama o TGI sin trabajo de portabilidad adicional.
- Reproducibilidad de entrenamiento: no es posible, porque el checkpoint no incluye estado del optimizador.
- Benchmarks: sin puntuaciones CORE publicadas; los numeros de la evaluacion de humo no son comparables con los resultados completos del paper.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y actualizacion del repositorio en 2026, lo que indica ausencia de validacion por parte de la comunidad.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a un servicio de realidad virtual en Paris y no guardan relacion con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-grow-d16
- Repositorio de codigo del paper: https://github.com/cue-engineering/loop
- Articulo de referencia: *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents* (sin URL disponible en la informacion proporcionada)
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Busqueda web: sin resultados relevantes para este modelo.
