# CharlieChen/loop-fwe-vanilla-d20

## Resumen

loop-fwe-vanilla-d20 es un modelo de lenguaje base de tipo transformer apilado ("looped transformer") desarrollado por el usuario CharlieChen, asociado al articulo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*. Se trata de un checkpoint de investigacion sobre leyes de escalado: el modelo se entreno desde cero sobre el corpus FineWeb-Edu y se publica como punto de referencia "vanilla" de profundidad d20 dentro de una familia de experimentos sobre recursion y crecimiento de modelos. No es un modelo orientado a producto ni a instrucciones: es una pieza de un estudio de escalado.

Tecnicamente es un transformer denso de 1.843.527.680 parametros almacenados en FP32 (unos 7,4 GB de pesos), con anchura 2560, 20 cabezas de atencion y una longitud de contexto de 2.048 tokens. Usa el tokenizador de GPT-2 a traves de tiktoken, con un vocabulario de 50.257 tokens ampliado a 50.304 filas. El checkpoint publicado contiene unicamente los tensores del modelo y la recurrencia final de evaluacion, sin estado del optimizador.

Su relevancia es acotada y muy especifica: sirve como reproducibilidad bit a bit de los resultados del articulo (los pesos exportados son identicos al checkpoint original) y como punto de comparacion frente a las variantes con recursion del mismo estudio. En terminos de capacidades, los propios datos del autor situan su exactitud CORE en 0,2595 sobre 22 tareas y 91.037 ejemplos, un nivel propio de un modelo base pequeno preentrenado solo con objetivos de modelado de lenguaje, no de un asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso ("vanilla") de tipo looped-transformer, implementado en el codigo del articulo como `TransformerGPT`; profundidad de escalado d20 |
| Parametros totales | 1.843.527.680 (almacenados en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP32; no se distribuyen GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`, FP32); no es un artefacto `AutoModel` de Transformers ni safetensors |
| Anchura (hidden size) | 2.560 |
| Cabezas de atencion | 20 |
| Repeticiones del nucleo en evaluacion final | 1 |
| Tokenizador | GPT-2 via tiktoken |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | FineWeb-Edu (HuggingFaceFW/fineweb-edu) |
| Tamano del repositorio | 7,4 GB |
| Archivos incluidos | `final.pt`, `result.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con atencion multi-cabeza convencional y una implementacion propia denominada `TransformerGPT` en el repositorio del articulo. El calificativo "looped" hace referencia al marco experimental del estudio: el modelo se articula en torno a un nucleo que puede repetirse (recurrencia), y la coordenada de profundidad d20 es la coordenada de escalado de la "escalera" de experimentos, que puede diferir del numero de bloques transformer realmente ejecutados. En esta variante "vanilla" el numero de repeticiones finales del nucleo es 1, es decir, es la configuracion de control sin recursion adicional en la evaluacion. La anchura es 2560, con 20 cabezas de atencion y contexto de 2.048 tokens.

El entrenamiento se realizo sobre FineWeb-Edu, un corpus filtrado por calidad educativa, con el tokenizador de GPT-2 (via tiktoken) y un vocabulario de 50.257 tokens ampliado a 50.304 filas. El autor no detalla en la model card el numero total de tokens vistos, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; se trata de un modelo base preentrenado. Los unicos datos numericos publicados son la NLL de validacion de preentrenamiento (2,45288287 nats/token), la exactitud CORE del articulo (0,25950377) y la NLL de respuesta CORE (2,39349247 nats/token), calculadas como medias sobre las semillas 0, 1 y 2 con los 91.037 ejemplos de 22 tareas. El articulo reporta que el entrenamiento se ejecuto en GPUs H100 con FlashAttention-3 y autocast en bfloat16.

Como elemento de reproducibilidad, los pesos exportados son identicos bit a bit al checkpoint del articulo, se acompanan de un fichero `SHA256SUMS` con la suma de verificacion de `final.pt` y de un `result.json` con la configuracion y metricas seleccionadas. No se incluye estado del optimizador, por lo que el checkpoint no permite reanudar el entrenamiento tal cual.

## Capacidades

- Generacion de texto autoregresiva en ingles: es la tarea para la que esta etiquetado el modelo (`text-generation`).
- Modelado de lenguaje base: continuacion de texto, estimacion de verosimilitud y calculo de perplejidad/NLL sobre corpus en ingles.
- Evaluacion mediante el protocolo CORE del articulo: 22 tareas y 91.037 ejemplos, con semillas 0, 1 y 2.
- Razonamiento y conocimiento factual de nivel bajo: la exactitud CORE publicada (0,2595, sobre una escala normalizada donde el azar se situa en 0 y el techo en 1) indica capacidades limitadas en tareas de conocimiento y razonamiento.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente para ingles.
- Tool calling / function calling: no disponible; es un modelo base sin ajuste por instrucciones ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay entrenamiento orientado a agentes.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.
- Capacidad experimental destacable: forma parte de un estudio sobre crecimiento de modelo, recursion y operadores de frontera, y sirve como configuracion de referencia sin recursion para comparar exponentes de escalado.

## Casos de uso

- Reproduccion de resultados de investigacion: ejecutar `eval.py` con el checkpoint y el `result.json` para replicar las cifras CORE del articulo (medias sobre semillas 0, 1 y 2 con los 91.037 ejemplos). Es el uso principal y el unico explicitamente documentado por el autor.
- Control experimental en estudios de escalado: emplear este d20 vanilla como linea base frente a variantes con recursion o con operadores de frontera, manteniendo constantes corpus (FineWeb-Edu), tokenizador y contexto.
- Analisis de leyes de escalado en profundidad: comparar exponentes de escalado entre la coordenada de profundidad d20 y el numero real de bloques ejecutados, dado que el propio autor advierte que ambas magnitudes pueden diferir.
- Calculo de perplejidad y filtrado de corpus en ingles: usar la NLL del modelo sobre texto de dominio especifico como senal de calidad o de dominio, con la referencia de 2,4529 nats/token en validacion de FineWeb-Edu.
- Experimentos academicos de arquitecturas recurrentes: modificar el numero de repeticiones del nucleo en el codigo del articulo y medir el efecto sobre la NLL, partiendo de una configuracion con repeticiones = 1.
- Generacion de texto en ingles para prototipos de investigacion: continuaciones de texto plano con contexto de hasta 2.048 tokens, asumiendo calidad propia de un modelo base pequeno sin ajuste por instrucciones.
- Verificacion de integridad de checkpoints: uso de `SHA256SUMS` para validar que la copia descargada coincide con el artefacto original, util en pipelines de evaluacion reproducibles.

## Benchmarks y rendimiento

Los unicos resultados numericos publicados en la informacion disponible son las metricas del articulo y la NLL de validacion de preentrenamiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag, etc.) en la informacion disponible.

| Metrica | Valor | Notas |
|---|---|---|
| Exactitud CORE (articulo) | 0,25950377 | Media sobre semillas 0, 1 y 2; 91.037 ejemplos; 22 tareas |
| NLL de respuesta CORE (articulo) | 2,39349247 nats/token | Distinta de la NLL de validacion de preentrenamiento |
| NLL de validacion de preentrenamiento | 2,45288287 nats/token | Sobre el corpus de preentrenamiento |
| MMLU, HumanEval, GSM8K, ARC, HellaSwag | no disponible | No publicados |

No se dispone de comparaciones de rendimiento con modelos similares en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para los pesos en FP32: aproximadamente 7,4 GB (1.843.527.680 parametros x 4 bytes). Con activaciones y contexto de 2.048 tokens, el consumo real de inferencia sera superior; una reserva practica de 10-12 GB en FP32 es razonable.
- Si se aplica autocast en bfloat16 (como en el protocolo del articulo), los pesos pueden ocupar del orden de 3,7 GB, aunque el checkpoint se distribuye en FP32 y la conversion debe hacerse en tiempo de ejecucion.
- GPU recomendadas: el articulo usa H100 con FlashAttention-3 y autocast en bfloat16. Para inferencia individual, una A100 o H100 es holgada; una RTX 4090 (24 GB) tambien es suficiente incluso en FP32.
- GPU de consumo: cabe en GPUs de 24 GB (RTX 3090, RTX 4090) sin problemas. En GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) entra en FP32 con poco margen; en GPUs de 8-10 GB solo con autocast/bf16 o cuantizacion manual.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama o TGI, porque el checkpoint usa la implementacion personalizada `TransformerGPT` y no es un artefacto `AutoModel` de Transformers. El camino documentado es instalar el repositorio del articulo y ejecutar `eval.py` (con `--checkpoint` y `--result-json`, y opcionalmente `--max-per-task` para evaluaciones acotadas).
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo indica que el protocolo completo del articulo se ejecuto en H100 con FlashAttention-3 y bfloat16.

## Comparativa con modelos similares

No se han publicado comparaciones de rendimiento para este modelo. La tabla siguiente contrasta unicamente especificaciones estructurales y de disponibilidad con alternativas de tamano comparable; los datos de los modelos de referencia corresponden a sus especificaciones publicas conocidas y no a mediciones conjuntas.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Enfoque |
|---|---|---|---|---|---|
| loop-fwe-vanilla-d20 | 1,84 B | 2.048 | no disponible | PyTorch `.pt` con codigo propio; no `AutoModel` | Base de investigacion sobre leyes de escalado (looped transformer) |
| GPT-2 XL | 1,5 B | 1.024 | MIT | safetensors/PyTorch, integrado en Transformers | Base generalista en ingles |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache-2.0 | safetensors, Transformers, GGUF, vLLM, Ollama | Base/chat con ajuste por instrucciones |
| Qwen2.5-1.5B | 1,5 B | 32.768 | Apache-2.0 (la mayoria de variantes) | safetensors, Transformers, GGUF, vLLM, Ollama | Base e instruct, multilingue |

Diferencias clave frente a las alternativas: loop-fwe-vanilla-d20 tiene una ventana de contexto pequena (2.048 tokens), esta limitado a ingles, carece de ajuste por instrucciones, no declara licencia y no es compatible con los runners estandar de inferencia. Su valor no es la competitividad funcional sino la reproducibilidad de un estudio de escalado concreto.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Conviene contactar con el autor antes de cualquier uso en produccion.
- Modelo base sin ajuste por instrucciones ni RLHF/DPO: no sigue ordenes de forma fiable y no esta pensado como asistente conversacional.
- Solo ingles: no se declara soporte de otros idiomas, por lo que el rendimiento fuera del ingles sera previsiblemente pobre.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Exactitud CORE de 0,2595: nivel bajo en conocimiento y razonamiento; no es adecuado para tareas que exijan precision factual.
- Riesgo de alucinacion: al ser un modelo base entrenado solo con modelado de lenguaje, puede generar afirmaciones plausibles pero falsas; no incorpora mecanismos de verificacion.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o alineacion en la informacion disponible. El corpus FineWeb-Edu es filtrado por calidad educativa, pero no hay analisis de sesgos del checkpoint.
- Compatibilidad: no es un artefacto `AutoModel` de Transformers; no funciona directamente con vLLM, llama.cpp, Ollama o TGI. Requiere el repositorio del articulo y su implementacion `TransformerGPT`.
- Tokenizador no incluido como artefacto estandar: se basa en GPT-2 via tiktoken, que hay que obtener por separado.
- Sin estado del optimizador: no permite reanudar el entrenamiento desde el checkpoint.
- Reproduccion no trivial: el autor no documenta en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni el presupuesto de computo total.
- Metadatos del repositorio con fechas de creacion y actualizacion de septiembre de 2026 y cero descargas y cero "likes"; el modelo es un artefacto de investigacion sin adopcion publica registrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-vanilla-d20
- Repositorio de codigo del articulo: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Articulo: *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents* (no se ha proporcionado URL directa del paper; no disponible)
- Demo o espacio interactivo: no disponible
- Otros enlaces relevantes: no disponible (los resultados de busqueda web proporcionados no contienen informacion relacionada con el modelo)
