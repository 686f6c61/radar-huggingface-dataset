# CharlieChen/loop-fwe-untied-grow-d12

# CharlieChen/loop-fwe-untied-grow-d12

## Resumen

loop-fwe-untied-grow-d12 es un modelo de lenguaje base de tipo *looped transformer* (transformer con recursión de núcleo) desarrollado por el usuario CharlieChen y presentado como uno de los puntos de la retícula experimental del trabajo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un modelo entrenado desde cero sobre el corpus FineWeb-Edu, con 834.011.136 parámetros almacenados en FP32, 1.536 dimensiones de anchura, 12 cabezas de atención y 4 repeticiones finales del núcleo recursivo.

Su relevancia no es la de un modelo de propósito general listo para producto, sino la de un artefacto de investigación reproducible: los pesos exportados son idénticos bit a bit al checkpoint usado en el artículo, lo que permite reproducir las métricas publicadas (NLL de validación de 2,62441856 nats/token y una precisión CORE de 0,21028214 sobre 22 tareas y 91.037 ejemplos). La variable experimental principal es la profundidad recursiva ("d12") y la forma en que se hace crecer el modelo con pesos no atados (*untied-grow*), dentro de un estudio más amplio sobre cómo el crecimiento, la recursión y los operadores de frontera afectan a los exponentes de escalado.

El modelo es de sólo inglés, tiene una ventana de contexto de 2.048 tokens y utiliza el tokenizador de GPT-2 vía tiktoken. No se distribuye como artefacto estándar de Transformers (`AutoModel`), sino mediante una implementación propia llamada `TransformerGPT` alojada en el repositorio del artículo, lo que limita su uso directo con las herramientas habituales de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recursión de núcleo (*looped transformer*), variante Untied-Grow; implementación propia `TransformerGPT` |
| Parametros totales | 834.011.136 parámetros almacenados (FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible; sólo se publican pesos en FP32 (no hay GGUF, AWQ, GPTQ ni versiones en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `final.pt` (FP32), más `result.json` con la configuración; no es safetensors ni un artefacto `AutoModel` de Transformers |
| Coordenada de profundidad | d12 |
| Anchura (hidden size) | 1.536 |
| Cabezas de atencion | 12 |
| Repeticiones finales del nucleo | 4 |
| Tokenizador | GPT-2, vía tiktoken |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Tamano del repositorio | 3,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con recursión de núcleo: un mismo bloque (o conjunto de bloques) del núcleo se ejecuta repetidamente, de modo que la profundidad efectiva de cómputo es mayor que el número de bloques almacenados. La model card advierte explícitamente que la coordenada de profundidad `d12` es la coordenada de escalado de la "escalera" experimental y puede diferir del número de bloques Transformer efectivamente ejecutados. La variante se denomina *Untied-Grow*, lo que apunta a un esquema en el que los pesos no están atados entre iteraciones y en el que el modelo se hace crecer progresivamente durante el entrenamiento; el checkpoint público contiene únicamente los tensores del modelo y la recurrencia final de evaluación.

El entrenamiento se realizó sobre FineWeb-Edu, un corpus de texto educativo en inglés filtrado por criterios de calidad. No hay información disponible sobre el número total de tokens vistos, la composición exacta del dataset, el uso de RLHF o DPO, ni sobre la receta de optimización (el estado del optimizador no se incluye en el checkpoint). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. Según la model card, el protocolo completo del artículo utilizó GPUs H100 con FlashAttention-3 y autocast en bfloat16, y la evaluación se realiza mediante `eval.py` del repositorio del paper, que computa el benchmark CORE (91.037 ejemplos repartidos en 22 tareas).

## Capacidades

- Generación de texto en inglés a partir de un prompt, en modo *base model* (continuación de texto), sin plantilla de instrucciones.
- Modelado de lenguaje puro: la métrica principal publicada es la NLL de validación (2,62441856 nats/token) y la NLL de respuesta CORE (2,56611089 nats/token).
- Evaluación en el benchmark CORE: 22 tareas, 91.037 ejemplos, con una precisión media de 0,21028214 sobre las semillas 0, 1 y 2.
- Capacidad de razonamiento multi-paso sólo en la medida en que un modelo base de 834 M de parámetros la adquiere por preentrenamiento; no hay ajuste por instrucciones ni modo *thinking* documentado.
- Soporte de tool calling / function calling: no disponible (no documentado y poco probable en un modelo base sin ajuste).
- Soporte de agentes: no disponible.
- Capacidades multilingües: no; el modelo está declarado únicamente para inglés y el tokenizador es el de GPT-2.
- Capacidades especiales: la recursión de núcleo permite aumentar la profundidad efectiva de cómputo sin aumentar el número de parámetros almacenados, lo que la convierte en una capacidad relevante para investigación en eficiencia de parámetros, no para producto.

## Casos de uso

- Reproducción de resultados del artículo: el checkpoint es bit a bit idéntico al usado en el paper, por lo que sirve para verificar la precisión CORE (0,21028214) y las NLL publicadas ejecutando `eval.py` con el repositorio `cue-engineering/loop`, con o sin el límite `--max-per-task`.
- Estudios de leyes de escalado en transformers recursivos: al ser un punto concreto (`d12`) de una retícula experimental, se usa para medir cómo varían los exponentes de escalado al modificar profundidad, recursión y operadores de frontera.
- Investigación sobre *model growth* y atado de pesos: la variante Untied-Grow permite comparar el efecto de no atar pesos entre iteraciones del núcleo frente a alternativas atadas del mismo estudio.
- Modelo base para *fine-tuning* en inglés: con 834 M de parámetros y 2.048 tokens de contexto, es un punto de partida manejable para ajuste supervisado en tareas de clasificación o generación de dominio específico, siempre que se adapte el código de carga al `TransformerGPT` propio.
- Ablaciones y estudios de destilación: su tamaño reducido (3,3 GB en FP32) y su naturaleza de checkpoint de investigación lo hacen adecuado como alumno o como referencia pequeña en experimentos de compresión.
- Evaluación de metodologías de benchmark: sirve como sujeto de prueba para pipelines que calculan CORE, ya que el autor publica las medias archivadas sobre tres semillas.
- Generación de texto en inglés con presupuesto de memoria bajo: en un equipo con una única GPU, el modelo puede ejecutarse en FP32 o convertirse a bf16 para tareas de continuación de texto, siempre con expectativas propias de un modelo base y no de un asistente.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados son los de la model card:

| Metrica | Valor |
|---|---|
| NLL de validacion de preentrenamiento | 2,62441856 nats/token |
| Precision CORE (media sobre semillas 0, 1, 2) | 0,21028214 |
| NLL de respuesta CORE | 2,56611089 nats/token |
| Ejemplos evaluados en CORE | 91.037, en 22 tareas |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras suites habituales, ni tablas comparativas con modelos de tamaño similar.

## Requisitos de hardware

- Pesos en FP32: 834.011.136 parámetros × 4 bytes ≈ 3,3 GB, que coincide con el tamaño del repositorio.
- VRAM estimada para inferencia en FP32: del orden de 5 a 8 GB considerando pesos, caché KV para 2.048 tokens y activaciones (estimación, no publicada por el autor).
- VRAM estimada en bfloat16: alrededor de 2 a 3 GB de pesos, es decir, 3 a 5 GB en total (estimación).
- GPU recomendadas según el autor: H100, que es lo que el paper usó con FlashAttention-3 y autocast en bfloat16.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090), especialmente si se convierte a bf16.
- Opciones de despliegue: el checkpoint usa la implementación propia `TransformerGPT` y no es un artefacto `AutoModel` de Transformers, por lo que vLLM, llama.cpp, Ollama ni TGI funcionan sin trabajo previo de conversión. La vía soportada es el repositorio `cue-engineering/loop` y su script `eval.py`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables (el modelo sólo publica CORE y NLL), por lo que la comparación se limita a especificaciones estructurales. Los siguientes modelos se incluyen por tamaño y por ser también modelos base preentrenados de uso común:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| loop-fwe-untied-grow-d12 | 834 M (FP32) | 2.048 | no disponible | `final.pt` con código propio (`TransformerGPT`) |
| GPT-2 XL | 1,5 B | 1.024 | MIT | safetensors/PyTorch, integrado en Transformers |
| Pythia-1B | 1,0 B | 2.048 | Apache-2.0 | integrado en Transformers, con checkpoints intermedios |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache-2.0 | integrado en Transformers |

Comparativa de rendimiento: no disponible. Ni la model card ni la búsqueda web proporcionan métricas de estos modelos medidas con el mismo protocolo que el CORE reportado aquí, por lo que cualquier comparación numérica sería inválida.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no ha pasado por ajuste por instrucciones ni por RLHF/DPO, por lo que no debe usarse como asistente conversacional sin ajuste adicional.
- Sólo soporta inglés; no hay evidencia de competencia multilingüe y el tokenizador es el de GPT-2.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para casos que requieran documentos largos o conversaciones extensas.
- La NLL de validación de 2,62441856 nats/token implica una perplejidad alta (en torno a 13,8 si se interpreta como perplejidad exponencial), coherente con un modelo pequeño entrenado con un presupuesto limitado; la precisión CORE de 0,21028214 es modesta en términos absolutos.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo base, la generación no está anclada a la veracidad factual.
- Sesgos conocidos: no documentados. El corpus FineWeb-Edu filtra por calidad educativa, pero no se publican análisis de sesgo ni de toxicidad.
- Licencia no disponible: no se puede asumir permisividad para uso comercial. Antes de cualquier uso en producción debe contactarse con el autor para aclarar los términos.
- Restricciones de integración: al no ser un artefacto `AutoModel`, no funciona con el ecosistema estándar (vLLM, TGI, llama.cpp, Ollama) sin conversión y sin reimplementar la recursión del núcleo.
- El checkpoint no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento tal cual; sólo sirve para inferencia y evaluación.
- Sólo se publican pesos en FP32: no hay versiones cuantizadas oficiales, y la cuantización a 8 o 4 bits tendría que hacerse por cuenta propia, con el riesgo de degradar métricas no verificadas.
- La métrica CORE se archiva como media sobre tres semillas; un único *run* puede desviarse de ese valor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-untied-grow-d12
- Repositorio de código del artículo (`cue-engineering/loop`): https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Artículo de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (sin URL pública en la información disponible)
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, al artículo ni a demos; los resultados devueltos no guardan relación con este modelo.
