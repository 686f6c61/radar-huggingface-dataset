# CharlieChen/loop-untied-grow-d18

## Resumen

loop-untied-grow-d18 es un modelo de lenguaje base (sin ajuste por instrucciones) publicado por el usuario CharlieChen en Hugging Face, que constituye el checkpoint final de una de las escalas de la "FineWeb scaling ladder" del articulo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*. Se trata de un transformer con recursión de bloques (*looped transformer*), con 2.525.036.544 parametros almacenados en FP32 (10,100 GB), anchura de 2304, 18 cabezas de atencion, contexto de 2.048 tokens y un tokenizador GPT-2 de 50.257 tokens.

El modelo no es un artefacto de uso general: es una pieza de investigacion sobre leyes de escala, disenada para medir como el crecimiento de profundidad, la recursion y los operadores de frontera afectan a los exponentes de escalado. Su valor esta en la reproducibilidad del experimento, no en el rendimiento absoluto en tareas: la model card solo reporta una NLL de validacion de 2,587002 nats/token sobre el corpus de preentrenamiento (FineWeb), y no publica resultados de benchmarks estandar como MMLU o HumanEval.

Es relevante ahora porque ejemplifica una linea de investigacion activa (recursion/looping de capas como alternativa al escalado puramente en anchura o profundidad) y porque su formato de pesos atipico (checkpoint PyTorch personalizado, no un `AutoModel` de Transformers) obliga a evaluar el coste real de reproducir este tipo de artefactos fuera del ecosistema estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recursion de bloques (looped transformer), modo de profundidad `dep`, 4 repeticiones de nucleo configuradas |
| Parametros totales | 2.525.036.544 (FP32, 10,100 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se publica el checkpoint original en FP32; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pt` (`final.pt`), FP32; metadatos en `result.json`; checksums en `SHA256SUMS` |
| Anchura (hidden size) | 2304 |
| Cabezas de atencion | 18 |
| Tokenizador | GPT-2 via `tiktoken.get_encoding("gpt2")` |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | HuggingFaceFW/fineweb |
| Coordenada de profundidad | d18 |
| NLL de validacion | 2,587002 nats/token (sobre el corpus de preentrenamiento) |
| Tamano del repositorio | 10,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El bloque de construccion es un transformer con recursion: el modelo reutiliza un nucleo de bloques repetido varias veces (4 repeticiones configuradas y 4 en la evaluacion final), de modo que la "coordenada de profundidad" d18 es la coordenada de escalado de la escalera experimental y no tiene por que coincidir con el numero de bloques Transformer realmente ejecutados. La model card explicita que la profundidad declarada no es equivalente al numero de capas ejecutadas, un detalle clave para interpretar cualquier comparacion con modelos convencionales. La variante se denomina "Untied Grow", en contraposicion a esquemas con pesos atados entre repeticiones.

Los datos de entrenamiento provienen exclusivamente de FineWeb (ingles), tokenizados con GPT-2. No hay informacion publica sobre el numero total de tokens vistos, la composicion interna del dataset, ni sobre fases de RLHF, DPO o ajuste por instrucciones: el propio autor indica que es un modelo base preentrenado sin instruction tuning. El checkpoint conserva los pesos aprendidos y los argumentos de entrenamiento, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento. La evaluacion del articulo se realizo con GPUs H100, FlashAttention-3 y autocast en bfloat16.

## Capacidades

- Generacion de texto autocompletiva (modelo base): continuacion de secuencias en ingles, sin formato conversacional ni seguimiento de instrucciones.
- Modelado de lenguaje puro y calculo de perplejidad/NLL: util como banco de pruebas de leyes de escala y de estrategias de crecimiento de modelo.
- Reproduccion de experimentos academicos: el checkpoint esta pensado para ejecutarse con el codigo del articulo (`cue-engineering/loop`) y para evaluarse con la suite CORE de 22 tareas.
- Razonamiento multi-paso y agentes: no disponible; no hay soporte documentado de tool calling ni de function calling.
- Capacidades multilingues: solo ingles (etiqueta de idioma `en` en el repositorio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Fine-tuning como base: tecnicamente posible a partir de los pesos, pero sin plantilla de chat ni tokenizador especial mas alla del de GPT-2.

## Casos de uso

- Investigacion sobre leyes de escala (scaling laws): usar el checkpoint como punto de la escalera FineWeb para ajustar exponentes de escalado y comparar con otros puntos de la misma serie, ya que comparte tokenizador, corpus y configuracion de evaluacion.
- Estudio de recursion y crecimiento de modelos: analizar como 4 repeticiones de nucleo afectan a la NLL frente a variantes atadas o con distinta profundidad declarada, usando el mismo pipeline de evaluacion.
- Reproduccion de resultados academicos: reejecutar la evaluacion CORE con las 22 tareas y las semillas 0/1/2 para verificar las cifras del articulo antes de publicar o revisar.
- Banco de pruebas de eficiencia de inferencia: medir coste de memoria y latencia de un modelo de 2,53 B parametros en FP32 frente a bfloat16, con atencion FlashAttention-3, para caracterizar el compromiso precision/rendimiento en hardware H100.
- Generacion de texto base para experimentos controlados: producir continuaciones sobre dominio ingles para estudios de sesgo, deteccion de texto generado o analisis de distribuciones de probabilidad, asumiendo ausencia de alineacion.
- Fine-tuning supervisado sobre dominio especifico: partir de los pesos preentrenados y anadir una cabeza o un ajuste ligero (LoRA) para una tarea cerrada de clasificacion o generacion en ingles, dentro de un entorno de investigacion.
- Evaluacion comparativa de tokenizadores: al usar el tokenizador GPT-2 con vocabulario ampliado a 50.304 filas, sirve para medir el impacto del padding de vocabulario en la eficiencia de calculo de la capa de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de validacion sobre el corpus de preentrenamiento y describe como ejecutar la evaluacion CORE (22 tareas, semillas 0/1/2), indicando explicitamente que los resultados de la evaluacion smoke (`--max-per-task 10`) no equivalen a los resultados completos del articulo.

| Metrica | Valor | Nota |
|---|---|---|
| NLL de validacion (preentrenamiento) | 2,587002 nats/token | Medida sobre FineWeb; distinta de la NLL de respuestas de CORE |
| CORE (22 tareas) | No disponible | Solo se documenta el procedimiento de evaluacion, no los resultados |
| MMLU / HumanEval / GSM8K | No disponible | No reportados |

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 10,1 GB solo de pesos, mas activaciones y cache KV; en la practica se necesitan del orden de 12-16 GB de VRAM para lotes pequenos a 2.048 tokens.
- VRAM en bfloat16 (autocast, configuracion del articulo): aproximadamente 5,1 GB de pesos; con activaciones y cache KV, un objetivo realista es 8-12 GB.
- Cache KV: no se puede estimar con precision porque la model card no publica el numero de bloques realmente ejecutados (la coordenada de profundidad no equivale al numero de capas). Con anchura 2304 y 18 cabezas, la dimension por cabeza es 128.
- GPU recomendadas: H100 (las usadas en el articulo, junto con FlashAttention-3); tambien viable en A100 40/80 GB por margen de memoria, aunque sin las optimizaciones especificas del paper.
- GPU de consumo: si cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) tanto en FP32 como en bfloat16; en tarjetas de 16 GB es razonable en bfloat16 con lotes pequenos, y en 12 GB requiere reducir lote o secuencia.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan este checkpoint de forma directa, ya que no es un `AutoModel` de Transformers ni un GGUF. El unico camino documentado es el codigo del articulo (`github.com/cue-engineering/loop`) para reconstruir el modelo `TransformerGPT` y ejecutar `eval.py`.
- Latencia y throughput estimados: no disponible (no se publican mediciones de tokens por segundo ni de tiempo por peticion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Ecosistema |
|---|---|---|---|---|---|
| loop-untied-grow-d18 | 2,53 B | 2.048 | No disponible | PyTorch `.pt` personalizado (FP32) | Solo el codigo del articulo; sin vLLM/llama.cpp/Ollama/TGI |
| Pythia-2.8B (EleutherAI) | 2,8 B | 2.048 | Apache 2.0 | safetensors / `.pt` | Transformers, llama.cpp (GGUF), vLLM |
| GPT-2 XL (OpenAI) | 1,5 B | 1.024 | Modified MIT | `.bin` / safetensors | Transformers, llama.cpp (GGUF) |
| OPT-2.7B (Meta) | 2,7 B | 2.048 | Licencia OPT-175B (uso comercial restringido) | `.bin` / safetensors | Transformers |

Tabla de rendimiento comparado: no disponible. No hay cifras publicas de benchmarks para loop-untied-grow-d18, por lo que cualquier comparacion cuantitativa con Pythia-2.8B, GPT-2 XL u OPT-2.7B seria especulativa. En cuanto a idoneidad de uso, la diferencia practica principal no es el rendimiento sino la integracion: los tres alternativas son cargables con `AutoModel` y disponen de conversiones a GGUF, mientras que este checkpoint requiere el codigo del paper.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al entrenarse solo con FineWeb en ingles y sin alineacion posterior, es esperable que reproduzca sesgos del corpus web, pero no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: alto en uso generativo, al ser un modelo base sin instruction tuning ni RLHF; no esta disenado para responder preguntas con fidelidad factual.
- Limitacion de contexto: 2.048 tokens, muy por debajo de los modelos actuales de su rango de parametros; no apto para conversaciones largas ni analisis de documentos extensos.
- Idioma: unicamente ingles. No hay evidencia de capacidades multilingues.
- Licencia: no disponible. Esto implica ausencia de permiso explicito para uso comercial; en un entorno de produccion habria que tratar el modelo como no licenciado hasta contactar con el autor.
- Formato propietario: el checkpoint no es un `AutoModel` de Transformers. No hay GGUF ni soporte en vLLM, llama.cpp, Ollama o TGI; desplegarlo exige reconstruir el modelo con el codigo del paper.
- Sin estado del optimizador: no se puede reanudar el entrenamiento original, solo hacer fine-tuning desde los pesos finales.
- Profundidad ambigua: la coordenada d18 no equivale al numero de bloques ejecutados, lo que complica comparaciones directas con arquitecturas convencionales y el calculo de memoria de cache KV.
- Madurez del artefacto: 0 descargas y 0 likes, publicado como material de investigacion; no hay senal de mantenimiento, soporte ni validacion por terceros.
- Los resultados de evaluacion smoke no son validos como cifras del articulo; solo la ejecucion completa de CORE con las 22 tareas y las semillas 0/1/2 lo es.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieChen/loop-untied-grow-d18
- Codigo del articulo: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Tokenizador GPT-2 (tiktoken): https://github.com/openai/tiktoken
- Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre el modelo, el articulo ni su codigo; los resultados obtenidos correspondian a listados de restaurantes y no guardan relacion con esta ficha. El paper citado en la model card (*How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*) no dispone de URL verificada en la informacion proporcionada.
