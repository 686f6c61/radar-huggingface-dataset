# CharlieChen/loop-untied-2-d14

## Resumen

Loop-untied-2-d14 es un checkpoint de modelo de lenguaje base publicado por el usuario CharlieChen en HuggingFace, asociado al trabajo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un artefacto de investigación: el checkpoint final original empleado en la escalera de escalado (scaling ladder) del paper sobre el corpus FineWeb, con coordenada de profundidad d14 y variante "untied 2". No es un modelo afinado por instrucciones ni un checkpoint orientado a producto.

El modelo almacena 921.174.016 parámetros en FP32 (3,685 GB) y emplea una arquitectura de transformer con repeticiones de núcleo (looped transformer): el campo "Configured core repetitions" vale 2, y la coordenada de profundidad de la escalera no tiene por qué coincidir con el número de bloques Transformer ejecutados. Usa el tokenizador GPT-2 de tiktoken con un vocabulario de 50.257 tokens ampliado a 50.304 filas del modelo, anchura 1792, 14 cabezas de atención y una longitud de contexto de 2.048 tokens.

Su relevancia es fundamentalmente académica. Permite reproducir los experimentos de leyes de escalado del paper, auditar el efecto de la recursión y de los operadores de frontera sobre los exponentes de escalado, y servir como línea base de investigación en inglés. La model card advierte de que no incluye estado del optimizador, por lo que no sirve para reanudar el entrenamiento, y de que no es un checkpoint de tipo `AutoModel` de Transformers: requiere el código propio del paper para reconstruir la clase `TransformerGPT`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con repeticiones de núcleo (looped transformer), modo de profundidad `dep`, variante untied 2 |
| Parámetros totales | 921.174.016 (almacenados en FP32, 3,685 GB) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible; el repositorio solo incluye un checkpoint en FP32, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`), más `result.json` y `SHA256SUMS`; no es un checkpoint `AutoModel` de Transformers |
| Anchura (hidden size) | 1792 |
| Cabezas de atención | 14 |
| Tokenizador | GPT-2 vía `tiktoken.get_encoding("gpt2")` |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Repeticiones del núcleo | 2 configuradas; 2 en la evaluación final |
| Corpus de entrenamiento | FineWeb |
| Tamaño del repositorio | 3,7 GB |

## Arquitectura y entrenamiento

La familia a la que pertenece este checkpoint se describe como "looped transformer": un transformer en el que un núcleo de bloques se ejecuta repetidamente. La model card distingue explícitamente entre la coordenada de profundidad de la escalera de escalado (d14 en este caso) y el número real de bloques Transformer ejecutados, y fija las repeticiones del núcleo en 2. El modo de profundidad declarado es `dep` y la variante es "untied 2", etiqueta que sugiere un tratamiento no atado de algún componente entre repeticiones; la información proporcionada no detalla el mecanismo exacto, por lo que no se puede describir con más precisión.

El entrenamiento se realizó sobre el corpus FineWeb con el tokenizador GPT-2. El paper emplea GPUs H100, FlashAttention-3 y autocast en bfloat16. El artefacto publicado es un modelo base preentrenado, sin ajuste por instrucciones, sin RLHF ni DPO declarados, y sin estado del optimizador, de modo que no permite reanudar el entrenamiento. La métrica registrada en la model card es la NLL de validación de preentrenamiento: 2,793952 nats/token, medida sobre el propio corpus de preentrenamiento y distinta de la NLL de respuestas del benchmark CORE. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto y modelado de lenguaje autorregresivo en inglés, en modo continuación de texto.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales.
- Evaluación mediante el benchmark CORE, con 22 tareas y semillas 0/1/2, a través del código del paper.
- Métrica de calidad declarada: NLL de validación de preentrenamiento de 2,793952 nats/token sobre FineWeb.
- Soporte de tool calling / function calling: no disponible; no se declara ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se declara.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no se declara ninguna.
- Uso como punto de partida para fine-tuning: posible a nivel técnico, aunque requiere el código del paper para cargar el checkpoint.

## Casos de uso

- Reproducción de la escalera de escalado de FineWeb: el checkpoint es el artefacto final de la coordenada d14 de la ladder del paper, por lo que sirve para recalcular la NLL de validación y contrastarla con los valores publicados.
- Estudio de transformers con recursión: permite medir experimentalmente cómo afectan las repeticiones del núcleo y la variante "untied" al comportamiento del modelo, ejecutando el mismo núcleo dos veces por paso según la configuración declarada.
- Línea base para evaluaciones CORE: con el código de `cue-engineering/loop` y `--max-per-task 10 --seeds 0 1 2` se puede obtener una evaluación acotada de 22 tareas, útil como referencia previa a ejecuciones completas.
- Investigación sobre eficiencia paramétrica: al separar parámetros almacenados (921.174.016 en FP32) de profundidad efectiva de cómputo, el checkpoint permite analizar la relación entre huella en disco, coste de inferencia y calidad medida en NLL.
- Experimentos de cuantización post-entrenamiento: dado que solo se distribuye FP32, un grupo de investigación puede generar sus propias versiones en bfloat16 o int8 y comparar la degradación de NLL frente al valor original de 2,793952 nats/token.
- Fine-tuning supervisado en inglés sobre dominios concretos: con contexto de 2.048 tokens y vocabulario GPT-2, encaja en tareas de continuación de texto o clasificación por cabecera, siempre que se reconstruya el modelo con el código del paper.
- Formación y docencia en ingeniería de modelos: sirve para ilustrar la diferencia entre un checkpoint de investigación y un modelo desplegable, incluyendo la ausencia de licencia declarada y la dependencia de código externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo proporciona la métrica de validación de preentrenamiento del propio corpus, y advierte de que las puntuaciones de una evaluación acotada (smoke) no equivalen a los resultados completos del paper.

| Métrica | Valor | Notas |
|---|---|---|
| NLL de validación de preentrenamiento | 2,793952 nats/token | Medida sobre FineWeb (corpus de preentrenamiento) |
| CORE (22 tareas, semillas 0/1/2) | no disponible | Requiere ejecutar el código del paper; no se publica el resultado en el repositorio |
| MMLU, HumanEval, GSM8K u otros | no disponible | No mencionados en la información proporcionada |

## Requisitos de hardware

- Pesos en FP32: 3,685 GB en disco y en memoria; la inferencia en FP32 requiere aproximadamente 4 GB o más de VRAM solo para pesos, más activaciones y caché KV (estimación).
- Pesos en bfloat16 si el usuario los convierte: aproximadamente 1,84 GB (estimación); en int8, alrededor de 0,92 GB (estimación). No hay versiones cuantizadas oficiales publicadas.
- Configuración de referencia del paper: GPUs H100 con FlashAttention-3 y autocast en bfloat16.
- GPU de consumo: el modelo cabe en GPUs con 8 GB o más de VRAM si se convierte a bfloat16, y en 4-6 GB con cuantización de 4 bits aplicada por el usuario; en FP32 requiere tarjetas con 8-12 GB o más (estimación).
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible. El checkpoint es un `TransformerGPT` propio reconstruido por el código del paper y no un `AutoModel` de Transformers, por lo que estos servidores no lo cargan sin adaptación.
- Evaluación soportada: `eval.py` del repositorio `cue-engineering/loop`, con `--max-per-task` para ejecuciones acotadas y sin él para las 22 tareas completas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se proporcionaron datos de benchmarks ni de rendimiento de modelos comparables en la información disponible, por lo que no es posible una comparación cuantitativa. A continuación se ofrece una referencia de escala y contexto; los datos de los modelos alternativos proceden de conocimiento general sobre ellos y no de la búsqueda realizada.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| loop-untied-2-d14 | 921.174.016 | 2.048 | no disponible | PyTorch `final.pt`; requiere código propio |
| Pythia-1B | ~1.000 millones | 2.048 | Apache 2.0 | Transformers estándar |
| TinyLlama-1.1B | ~1.100 millones | 2.048 | Apache 2.0 | Transformers estándar, ampliamente cuantizado |
| GPT-2 XL | ~1.500 millones | 1.024 | MIT | Transformers estándar |

La diferencia clave no está en la escala, sino en la naturaleza del artefacto: loop-untied-2-d14 es un checkpoint de investigación con arquitectura propia y sin licencia declarada, mientras que las alternativas son cargables directamente con herramientas estándar y tienen licencias explícitas. No se dispone de datos de rendimiento comparables para establecer qué modelo es mejor en tareas concretas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe esperarse seguimiento de instrucciones, formato conversacional ni rechazo de peticiones.
- Idioma: únicamente inglés según la etiqueta del repositorio; el tokenizador GPT-2 además penaliza el rendimiento en otros idiomas.
- Contexto limitado a 2.048 tokens, muy por debajo de los estándares actuales para tareas de contexto largo.
- Licencia no disponible: sin términos explícitos, el uso comercial es jurídicamente incierto y desaconsejable en producción.
- Riesgo de alucinación: inherente a un modelo de lenguaje preentrenado sin alineación; no hay evaluación de toxicidad ni de sesgos en la información proporcionada.
- No incluye estado del optimizador, por lo que no permite reanudar el entrenamiento original.
- Dependencia de código: no es un `AutoModel` de Transformers; cargarlo exige reconstruir `TransformerGPT` con el repositorio del paper, lo que complica su integración en pipelines habituales.
- La NLL de validación de 2,793952 nats/token se mide sobre el corpus de preentrenamiento y no es comparable con la NLL de respuestas del benchmark CORE.
- Cualquier puntuación obtenida con `--max-per-task` es una evaluación acotada y no debe presentarse como resultado completo del paper.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad ni informes independientes de funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-2-d14
- Repositorio de código del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Tokenizador GPT-2 de tiktoken: https://github.com/openai/tiktoken
- Paper "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents": enlace no disponible
- Demos o espacios asociados: no disponible
