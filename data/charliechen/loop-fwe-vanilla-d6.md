# CharlieChen/loop-fwe-vanilla-d6

## Resumen

loop-fwe-vanilla-d6 es un modelo de lenguaje base de 119.734.272 parámetros almacenados en FP32, publicado por el usuario CharlieChen en HuggingFace. Se trata del punto de la escalera de profundidad etiquetado como "d6" dentro del trabajo titulado *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*, y pertenece a la familia de transformadores con recirculación (looped transformers) que estudia cómo influyen el crecimiento de profundidad, la recursión y los operadores de frontera en los exponentes de escalado. El checkpoint público reproduce bit a bit los pesos del artículo, e incluye únicamente los tensores del modelo y la recurrencia de evaluación final; no incluye estado del optimizador.

El entrenamiento se realizó sobre FineWeb-Edu, con anchura 768, 6 cabezas de atención, tokenizador GPT-2 (vía tiktoken) con vocabulario de 50.257 tokens ampliado a 50.304 filas y una longitud de contexto de 2.048 tokens. La coordenada de profundidad d6 es la coordenada de escalado de la escalera y puede diferir del número de bloques Transformer ejecutados; en esta variante "vanilla" el número de repeticiones finales del núcleo es 1. El modelo obtiene una NLL de validación de preentrenamiento de 3,33671229 nats/token y una precisión CORE de 0,07992611 (media sobre las semillas 0, 1 y 2 con los 91.037 ejemplos de 22 tareas).

Es relevante ahora, dentro de su nicho, porque sirve como punto de reproducibilidad para investigar arquitecturas recursivas y leyes de escalado sin depender de reentrenamientos costosos: los pesos son idénticos a los del artículo y el repositorio publica el checksum SHA-256. Su utilidad es, por tanto, fundamentalmente investigadora y de comparación, no de producto: se trata de un modelo base sin ajuste por instrucciones, solo en inglés, con licencia no especificada y sin descargas ni "likes" registrados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recirculación (looped transformer), implementación custom `TransformerGPT` |
| Parametros totales | 119.734.272 (almacenados en FP32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos FP32 (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pt` (`final.pt`, FP32); no es un artefacto `AutoModel` de Transformers ni safetensors |
| Anchura (hidden size) | 768 |
| Cabezas de atencion | 6 |
| Numero de capas/bloques | No disponible |
| Tokenizador | GPT-2 vía tiktoken; vocabulario 50.257 tokens, ampliado a 50.304 filas |
| Coordenada de profundidad | d6 (variante vanilla del artículo) |
| Repeticiones finales del nucleo | 1 |
| Corpus de entrenamiento | FineWeb-Edu (HuggingFaceFW/fineweb-edu) |
| Tamaño del repositorio | 0,5 GB |
| Fecha de creacion / actualizacion | 2026-09-16 (ambas) |

## Arquitectura y entrenamiento

El modelo es un transformer con recirculación: en lugar de apilar un número fijo de bloques, la arquitectura reaplica un núcleo de bloques, de modo que la profundidad efectiva se desacopla del número de parámetros almacenados. El artículo del que procede estudia precisamente tres ejes: crecimiento del modelo (model growth), recursión y operadores de frontera, y su efecto sobre los exponentes de escalado. La "d" de d6 designa la coordenada de profundidad de la escalera experimental, que según el autor puede no coincidir con el número de bloques Transformer efectivamente ejecutados; la variante "vanilla" se caracteriza por un número de repeticiones finales del núcleo igual a 1.

El preentrenamiento se hizo sobre FineWeb-Edu, un corpus filtrado por criterios educativos derivado de FineWeb. No se especifican en la información disponible el número total de tokens vistos, la composición detallada del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones; dado que la etiqueta del repositorio es `base-model`, no cabe esperar alineación alguna. Las métricas publicadas son la NLL de validación de preentrenamiento (3,33671229 nats/token) y los valores CORE archivados en el artículo (precisión 0,07992611; NLL de respuesta 3,96575078 nats/token), calculados sobre 91.037 ejemplos de 22 tareas con las semillas 0, 1 y 2. El protocolo del artículo se ejecutó en GPUs H100 con FlashAttention-3 y autocast en bfloat16, y el checkpoint requiere el código del repositorio `cue-engineering/loop` para cargarse y evaluarse.

## Capacidades

- Generación de texto en inglés: es un modelo base de tipo `text-generation`, entrenado con objetivo de modelado causal del lenguaje.
- Continuación de texto y autocompletado: apto para muestreo autoregresivo con contexto de hasta 2.048 tokens.
- Capacidad de modelado del lenguaje medible: NLL de validación de 3,33671229 nats/token en FineWeb-Edu.
- Evaluación en 22 tareas del conjunto CORE: precisión media reportada de 0,07992611 sobre 91.037 ejemplos, con semillas 0, 1 y 2.
- Reproducibilidad de investigación: pesos bit a bit idénticos al checkpoint del artículo, con `SHA256SUMS` para verificación.
- Punto de anclaje de una escalera de profundidad: permite comparar la coordenada d6 con otras coordenadas del mismo estudio.
- No soporta tool calling ni function calling: no se documenta ninguna capacidad de este tipo ni plantilla de herramientas.
- No soporta agentes ni razonamiento multi-paso guiado: al ser un modelo base sin ajuste por instrucciones, no hay modo "thinking" ni formato de diálogo.
- Sin capacidades multimodales: no hay visión, audio ni entrada distinta de texto.
- Multilingüismo: limitado a inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Reproducción de resultados de investigación en escalado: cargando `final.pt` con el repositorio `cue-engineering/loop` y ejecutando `eval.py` se puede replicar la métrica CORE del artículo (precisión 0,07992611) y verificar que los pesos coinciden mediante el checksum SHA-256.
- Ablaciones sobre arquitecturas recursivas: al ser la variante "vanilla d6" con una sola repetición final del núcleo, sirve como referencia frente a otras configuraciones de la misma escalera para aislar el efecto de la recursión y de los operadores de frontera.
- Estudio de leyes de escalado en presupuestos pequeños: con 119,7 M de parámetros y 2.048 tokens de contexto, el coste de un ciclo completo de evaluación es bajo, lo que permite barrer semillas y subconjuntos de tareas sin infraestructura grande.
- Fine-tuning supervisado para clasificación de texto en inglés: partiendo del checkpoint se puede añadir una cabeza de clasificación para tareas como filtrado de contenido educativo o categorización de documentos, aprovechando que el corpus de preentrenamiento es FineWeb-Edu.
- Generación de texto para prototipos y pruebas de pipeline: permite validar cadenas de tokenización (tiktoken, GPT-2), decodificación y muestreo en inglés antes de escalar a modelos mayores.
- Extracción de representaciones internas: útil para analizar cómo evolucionan las activaciones a lo largo de las repeticiones del núcleo, un caso típico de interpretabilidad en modelos con recirculación.
- Destilación y comparación de exponentes: puede actuar como estudiante o como baseline de una familia de modelos entrenados con el mismo corpus y tokenizador para medir el efecto de la profundidad efectiva.
- Evaluación educativa automatizada a pequeña escala: generación de preguntas o resúmenes de material educativo en inglés como paso previo a un ajuste específico, dado el dominio de FineWeb-Edu.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion de preentrenamiento | 3,33671229 nats/token | Sobre FineWeb-Edu |
| CORE accuracy (paper) | 0,07992611 | Media de semillas 0, 1 y 2; 91.037 ejemplos en 22 tareas |
| CORE answer NLL (paper) | 3,96575078 nats/token | Métrica distinta de la NLL de validación |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval, GSM8K o similares en la información disponible. Tampoco se proporcionan comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP32 ocupan aproximadamente 0,48 GB (119.734.272 × 4 bytes); con activaciones y caché de clave/valor para 2.048 tokens, el consumo realista se sitúa en torno a 1-2 GB en FP32 y alrededor de 0,5-1 GB si se convierte a bfloat16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el artículo usó H100 con FlashAttention-3, pero ese hardware es sobredimensionado para un modelo de este tamaño y se justifica por el protocolo completo de evaluación, no por el modelo en sí.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en RTX 3060 (12 GB), RTX 4060, RTX 4090 (24 GB), e incluso en GPUs de 6-8 GB como GTX 1660 o RTX 2060. También es viable en CPU para inferencia puntual.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no son compatibles de forma directa, porque el checkpoint usa la implementación custom `TransformerGPT` y no es un artefacto `AutoModel` de Transformers. El único camino documentado es el repositorio `cue-engineering/loop` con `eval.py`; la conversión a safetensors o GGUF requeriría trabajo adicional no documentado.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loop-fwe-vanilla-d6 | 119,7 M (FP32) | 2.048 | GPT-2 (tiktoken) | No disponible | HuggingFace, requiere código custom |
| GPT-2 (124M) | 124 M | 1.024 | GPT-2 (BPE) | MIT (pesos originales de OpenAI) | Ampliamente disponible, soportado por Transformers, llama.cpp y vLLM |
| Pythia-160M | 160 M | 2.048 | GPT-NeoX | Apache-2.0 | HuggingFace, soporte nativo en Transformers |
| GPT-2 medium | 355 M | 1.024 | GPT-2 (BPE) | MIT | Ampliamente disponible |

La comparación de rendimiento frente a estas alternativas no está disponible: la model card solo publica NLL de validación y métricas CORE internas del artículo, sin resultados en benchmarks estandarizados que permitan situar el modelo frente a GPT-2 o Pythia. La diferencia principal no es de escala sino de arquitectura (recirculación con coordenada de profundidad d6) y de propósito (reproducibilidad de un estudio de leyes de escalado).

## Limitaciones y advertencias

- Es un modelo base: no ha pasado por ajuste por instrucciones, RLHF ni DPO, por lo que no sigue órdenes y puede producir continuaciones incoherentes o repetitivas si no se le da un contexto adecuado.
- Riesgo de alucinación alto: al ser un modelo de 119,7 M de parámetros entrenado sobre un corpus filtrado, su conocimiento factual es limitado y no hay mecanismos de verificación ni citación de fuentes.
- CORE accuracy de 0,07992611: el rendimiento en las tareas del conjunto CORE es muy bajo en términos absolutos, lo que desaconseja su uso para tareas que requieran razonamiento o conocimiento.
- Sesgos: no se documenta ningún análisis de sesgos ni de composición demográfica del corpus; FineWeb-Edu es un subconjunto filtrado de web en inglés y hereda los sesgos de esa fuente.
- Limitación de idioma: solo se declara inglés; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Limitación de contexto: 2.048 tokens, inferior a los 8K-128K habituales en modelos actuales; no admite documentos largos sin troceado.
- Licencia no disponible: no se especifica ninguna licencia en el repositorio, lo que impide determinar si el uso comercial está permitido. Se debe contactar con el autor antes de cualquier uso en producción.
- Artefacto no estándar: `final.pt` no es un `AutoModel` de Transformers, no está en safetensors y no incluye estado del optimizador, lo que complica el fine-tuning convencional y la integración con servidores de inferencia habituales.
- Supervisión activa: el entrenamiento se realizó con FlashAttention-3 y autocast en bfloat16 en H100; reproducir el protocolo completo puede requerir hardware y dependencias específicas.
- Adopción nula registrada: el repositorio no tenía descargas ni "likes" en el momento de la consulta, por lo que no existe comunidad ni soporte más allá del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-vanilla-d6
- Codigo del articulo (requerido para cargar el checkpoint): https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador tiktoken (OpenAI): https://github.com/openai/tiktoken
- Paper *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*: enlace no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a medios de noticias alemanes y no guardan relacion con el modelo.
