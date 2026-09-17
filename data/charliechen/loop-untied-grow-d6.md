# CharlieChen/loop-untied-grow-d6

## Resumen

loop-untied-grow-d6 es un checkpoint de modelo de lenguaje base, preentrenado y sin ajuste por instrucciones, publicado por el usuario CharlieChen como artefacto asociado al articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con bucles (looped transformer) de 162.201.600 parametros almacenados en FP32 (0,649 GB), con una longitud de contexto de 2.048 tokens, ancho de 768 y 6 cabezas de atencion. Forma parte de la escalera de escalado (scaling ladder) sobre el corpus FineWeb utilizada en el estudio, y la coordenada de profundidad d6 es la coordenada de escalado, que no tiene por que coincidir con el numero de bloques Transformer ejecutados realmente.

El modelo no resuelve una tarea de producto, sino un problema de investigacion: medir como influyen el crecimiento del modelo, la recursion y los operadores de frontera en los exponentes de escalado. Por eso se publica como artefacto de reproducibilidad del paper, con el checkpoint original, sus argumentos de entrenamiento y un fichero `result.json` con la configuracion portable. No incluye estado del optimizador, por lo que no sirve para reanudar el entrenamiento.

Su relevancia actual es acotada pero especifica: es un ejemplo pequeño (162 M de parametros) de arquitectura con bucles que cabe en una sola GPU consumer, lo que lo hace util para experimentos de escalado y comparaciones controladas frente a transformers estandar de tamano similar. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, no declara licencia y solo soporta ingles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer); implementacion propia `TransformerGPT`; modo de profundidad `dep` |
| Parametros totales | 162.201.600 (almacenados en FP32, 0,649 GB) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint original en FP32) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`final.pt`); no es un checkpoint `AutoModel` de Transformers |
| Ancho (hidden size) | 768 |
| Cabezas de atencion | 6 |
| Vocabulario | 50.257 tokens (tokenizer GPT-2 de `tiktoken`), ampliado a 50.304 filas del modelo |
| Repeticiones del nucleo | 4 configuradas y 4 en la evaluacion final |
| Coordenada de profundidad | d6 |
| NLL de validacion (preentrenamiento) | 3,355077 nats/token |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer con bucles: un nucleo de bloques Transformer se ejecuta de forma repetida, con 4 repeticiones configuradas y 4 repeticiones en la evaluacion final. La model card insiste en una distincion importante: la coordenada de profundidad d6 pertenece a la escalera de escalado del paper y no equivale necesariamente al numero de bloques Transformer ejecutados. La model card no describe el mecanismo exacto de la variante `untied` (atado o no atado de pesos entre repeticiones del bucle) ni los operadores de frontera; esos detalles hay que consultarlos en el articulo y en el codebase `cue-engineering/loop`. El checkpoint se reconstruye con la clase personalizada `TransformerGPT` del repositorio, no mediante `AutoModel`.

El preentrenamiento se realizo sobre el corpus FineWeb, con el tokenizer GPT-2 de `tiktoken` (50.257 tokens de vocabulario, ampliados a 50.304 filas en el modelo) y contexto de 2.048 tokens. La NLL de validacion registrada sobre el propio corpus de preentrenamiento es de 3,355077 nats/token. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset, y no hay rastro de fases de RLHF, DPO u otro ajuste por preferencias: es un modelo base puro. El paper emplea GPUs H100, FlashAttention-3 y autocast en bfloat16, aunque la model card no confirma si el checkpoint publicado se genero con esa misma configuracion.

## Capacidades

- Generacion de texto en ingles: es un modelo base de continuacion de texto, sin ajuste por instrucciones ni plantilla de chat.
- Razonamiento, codigo y matematicas: no se publican evaluaciones especificas en la informacion disponible.
- Tool calling / function calling: no disponible; no hay evidencia de soporte.
- Agentes y razonamiento multi-paso: no disponible; el modelo no esta ajustado para ello.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Evaluacion CORE: el codebase del paper permite ejecutar las 22 tareas de CORE con semillas 0/1/2, pero los resultados completos no se incluyen en la informacion proporcionada; solo se documenta un procedimiento de smoke test con `--max-per-task 10`.
- Uso como artefacto de investigacion: reproducible mediante `final.pt`, `result.json` y `SHA256SUMS`.

## Casos de uso

- Reproduccion de la escalera de escalado: cargar el checkpoint con `cue-engineering/loop` y medir la NLL sobre FineWeb en la coordenada de profundidad d6, comparandola con el resto de puntos de la escalera del paper.
- Ablaciones sobre recursion: variar el numero de repeticiones del nucleo frente a las 4 configuradas y observar el efecto en la NLL, manteniendo fijo el resto de hiperparametros.
- Comparacion controlada con transformers estandar: enfrentar este modelo de 162 M de parametros con un transformer denso de tamano similar entrenado sobre el mismo corpus, para aislar el efecto del bucle en el coste computacional y en la calidad.
- Analisis de eficiencia de parametros: estudiar si 4 repeticiones de un nucleo unico ofrecen una relacion distinta entre parametros almacenados, FLOPs de inferencia y NLL frente a un modelo de profundidad equivalente sin bucles.
- Verificacion de integridad de artefactos: usar `SHA256SUMS` para validar el checkpoint en replicaciones y auditar que el binario corresponde al artefacto original del paper.
- Experimentos de investigacion en una sola GPU: al ocupar 0,649 GB en FP32 y alrededor de 0,32 GB en bfloat16, permite iteraciones rapidas de evaluacion en GPUs consumer sin colas de cluster.
- Generacion de texto exploratoria en ingles: continuaciones sobre prompts de dominio general, siempre que se acepte que no hay ajuste por instrucciones y que la salida no esta alineada.
- Punto de partida para fine-tuning academico: ajuste supervisado posterior en tareas en ingles (clasificacion, continuacion de dominio), sujeto a la incertidumbre sobre la licencia.
- Material docente: ejemplo compacto y real de transformer con bucles y de artefacto de reproducibilidad con metadatos separados de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Lo unico documentado es la NLL de validacion sobre el corpus de preentrenamiento y la existencia de un procedimiento de evaluacion CORE cuyos resultados no se incluyen.

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion (preentrenamiento) | 3,355077 nats/token | Medida sobre FineWeb; es distinta de la NLL de respuestas del benchmark CORE |
| CORE (22 tareas, semillas 0/1/2) | no disponible | El codebase permite ejecutarlo; no se publican puntuaciones en la informacion disponible |
| MMLU, HumanEval, GSM8K y similares | no disponible | No evaluados en la informacion proporcionada |

## Requisitos de hardware

- Pesos en FP32: 0,649 GB, que coinciden con el tamano del repositorio (0,6 GB).
- Pesos en bfloat16 o float16: aproximadamente 0,32 GB.
- VRAM estimada para inferencia: por debajo de 2 GB en bfloat16 con lotes pequenos y contexto de 2.048 tokens, sin contar la memoria de activaciones ni la posible cache de atencion.
- Cache KV: con ancho 768 y 6 cabezas (dimension de cabeza 128), cada bloque efectivamente ejecutado anade aproximadamente 3 KB por token en bfloat16 (6 cabezas x 128 dimensiones x 2 tensores K/V x 2 bytes). La model card no fija cuantos bloques se ejecutan realmente, asi que el valor depende de la configuracion del bucle.
- GPU consumer: cabe holgadamente en cualquier GPU con 6 GB o mas (RTX 2060, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para pruebas puntuales.
- GPU de referencia del paper: H100 con FlashAttention-3 y autocast en bfloat16.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan esta arquitectura personalizada; hay que usar el codebase `cue-engineering/loop` para reconstruir `TransformerGPT` y ejecutar `eval.py`.
- Formatos cuantizados (GGUF, AWQ, GPTQ): no disponibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparacion es orientativa: los tres alternativas son transformers densos estandar, no arquitecturas con bucles, y no existe una tabla de benchmarks publicada para d6 en la informacion disponible.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loop-untied-grow-d6 | 162.201.600 | 2.048 | Transformer con bucles (`TransformerGPT`) | no disponible | Repositorio HuggingFace, requiere codebase del paper |
| GPT-2 (124M) | 124 M | 1.024 | Transformer denso | Modified MIT | Ampliamente disponible, soporte nativo en multiples frameworks |
| Pythia-160M | 160 M | 2.048 | Transformer denso | Apache 2.0 | HuggingFace, `AutoModel` |
| SmolLM2-135M | 135 M | 8.192 | Transformer denso | Apache 2.0 | HuggingFace, `AutoModel` |

Comparativa de rendimiento (MMLU, CORE u otras): no disponible para loop-untied-grow-d6.

## Limitaciones y advertencias

- Licencia no declarada: en ausencia de licencia explicita no puede asumirse permiso de uso comercial ni de redistribucion; hay que contactar con el autor antes de cualquier uso en produccion.
- Modelo base sin ajuste por instrucciones: no sigue ordenes, no soporta plantillas de chat y no esta alineado con preferencias humanas.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Contexto limitado a 2.048 tokens, muy por debajo de los modelos contemporaneos de su tamano.
- Sin resultados de benchmarks publicados: no se puede afirmar calidad competitiva; la unica metrica es la NLL de preentrenamiento, que no es comparable directamente con puntuaciones de tareas.
- Arquitectura personalizada: incompatible con `AutoModel`, vLLM, llama.cpp, Ollama y TGI; cualquier despliegue exige integrar el codebase `cue-engineering/loop`.
- Empaquetado en `final.pt`: es un fichero pickle de PyTorch, con el riesgo asociado de ejecucion de codigo al cargarlo; conviene verificar `SHA256SUMS` y cargarlo en un entorno aislado.
- Sin estado del optimizador: el checkpoint no permite reanudar el entrenamiento desde el punto guardado.
- Ambiguedad de la coordenada de profundidad: d6 es una coordenada de escalado y no el numero de bloques ejecutados; interpretarla como profundidad efectiva lleva a conclusiones erroneas.
- Sesgos: el entrenamiento sobre FineWeb (rastreo web en ingles) arrastra los sesgos de ese corpus; no se documenta ninguna evaluacion de sesgo o toxicidad.
- Riesgo de alucinacion: al ser un modelo base sin mitigaciones, puede generar afirmaciones falsas con fluidez.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin issues ni terceros que hayan replicado resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-grow-d6
- Codebase del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento (FineWeb): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Articulo: no disponible como enlace directo en la informacion proporcionada; el titulo citado es "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents"
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo.
