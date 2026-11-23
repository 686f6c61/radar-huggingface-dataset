# knoveleng/Concord-2B

## Resumen

Concord-2B es un modelo de decisión de 2,3 mil millones de parámetros desarrollado por knoveleng. No es un modelo generativo al uso: en lugar de producir texto, lee la probabilidad de cada letra de opción en la primera posición de respuesta y devuelve una distribución de probabilidad sobre un conjunto cerrado de alternativas. Resuelve tareas de clasificación, inferencia de lenguaje natural (NLI), enrutamiento y question answering con opciones, todo ello en un único forward pass y sin generar ningún token de texto.

El modelo se construye mediante un merge de pesos sobre la base Qwen/Qwen3.5-2B, combinando KnowLine-2B-Gen1 (Apache-2.0) en todas las capas con un 0,5 de joey-1 (MIT) en las matrices MLP de las capas 0 a 11, seguido de un LoRA de rango 16 entrenado en una sola pasada sobre 8.000 ítems públicos seleccionados y fusionado posteriormente en los pesos. La receta deriva del paper del autor "One Offset, Many Models: A Weight-Space Audit of Decision Models", que analiza en el espacio de pesos qué parte de cada release aporta la ganancia real.

Su relevancia radica en que ofrece el mejor promedio del Decision Index (69,6 sobre 39 benchmarks) entre los diez modelos de 2B comparados en su model card, superando a sus dos ingredientes (joey-1 con 68,0 y KnowLine-2B-Gen1 con 65,5) y manteniendo la precisión de KnowLine en el conjunto privado de dos tareas del autor (78,8 frente a 78,9). La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B), con encoder de visión; merge de pesos + LoRA de rango 16 fusionado |
| Parametros totales | 2.274.069.824 (2,3B; modelo de texto 1,9B, encoder de visión sin cambios) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Concord-2B parte de Qwen/Qwen3.5-2B y se construye por merge de pesos: KnowLine-2B-Gen1 en todas las capas más 0,5 × joey-1 en las matrices MLP de las capas 0 a 11. Sobre esa base se aplica una única pasada de un LoRA de rango 16 entrenado con 8.000 ítems públicos seleccionados, que después se fusiona en los pesos; el merge en sí no requiere entrenamiento. El encoder de visión de la base permanece sin modificar, y el pipeline declarado es image-text-to-text, aunque el uso documentado del modelo es la lectura de probabilidades sobre opciones etiquetadas con letras.

El diseño se apoya en tres hallazgos del paper "One Offset, Many Models: A Weight-Space Audit of Decision Models": que los releases de una misma base comparten una parte común que no depende de la entrada y es casi idéntica entre releases (por lo que un release fuerte ya la contiene), y que el ajuste fino de decisión se concentra en componentes específicos que pueden recombinarse. El mecanismo de inferencia es una lectura de logits restringida: se calcula la probabilidad de cada letra de opción (A–Z, a–z y 0–9 son tokens únicos, hasta 62 opciones) en la primera posición de respuesta y se aplica softmax sobre ese subconjunto. No hay RLHF ni DPO documentados.

## Capacidades

- Clasificación y decisión sobre opciones cerradas: devuelve una probabilidad por opción en un solo forward pass, sin generar texto.
- Soporte de hasta 62 opciones por consulta mediante etiquetas de un solo token (A–Z, a–z, 0–9).
- Inferencia de lenguaje natural (NLI) y question answering con opciones.
- Enrutamiento y routing de registros hacia categorías predefinidas.
- Entrada multimodal declarada (image-text-to-text) por herencia del encoder de visión de Qwen3.5-2B; el uso documentado y los benchmarks son exclusivamente de texto.
- Capacidad multilingüe limitada al inglés según la model card.
- No soporta tool calling, function calling ni razonamiento agéntico multi-paso: no es un modelo generativo.

## Casos de uso

- Enrutamiento de tickets y registros: dado un registro (por ejemplo, una factura) y una lista de departamentos, el modelo devuelve la probabilidad de cada uno y se selecciona el de mayor valor; el ejemplo de la model card asigna 0,939 a "IT procurement" para una factura de portátiles.
- Clasificación de intenciones en asistentes conversacionales: con CLINC150 como referencia (98,3 % de precisión), puede etiquetar la intención del usuario entre un conjunto cerrado de opciones en un único paso, lo que reduce la latencia frente a un modelo generativo.
- Moderación y filtrado por categorías: clasificación de contenido en categorías predefinidas leyendo directamente la distribución de probabilidad, con umbrales configurables sobre la confianza.
- NLI y validación de hipótesis: determinar si una premisa implica, contradice o es neutral respecto a una hipótesis, útil en pipelines de verificación de datos.
- Question answering con opciones en evaluaciones automatizadas: selección de la respuesta correcta entre alternativas en sistemas de test y benchmarks, con la probabilidad asociada como medida de confianza.
- Routing en pipelines de agentes: usar el modelo como clasificador de bajo coste que decide a qué sub-agente o herramienta derivar una consulta antes de invocar un modelo mayor.
- Etiquetado a gran escala: al requerir un solo forward pass y no generar texto, es adecuado para procesar lotes masivos de registros con coste computacional bajo.

## Benchmarks y rendimiento

Datos publicados en la model card (precisión en %, hasta 120 ítems por benchmark, mismo prompt y misma lectura de letras de opción para todos los modelos):

| Modelo | CLINC150 | JevBench | DI avg (39) |
|---|---|---|---|
| Qwen3.5-2B (base) | 75,8 | 70,3 | 44,0 |
| unee-2b | 81,7 | 77,9 | 52,2 |
| fort-1-2b | 95,0 | 75,5 | 53,3 |
| Jeff-Qwen3.5-2B | 96,7 | 81,4 | 53,3 |
| d3-nano | 99,2 | 80,4 | 59,1 |
| KnowLine-2B-Gen1 | 93,3 | 82,8 | 65,5 |
| karpo-decision-2B | 95,0 | 81,7 | 66,0 |
| joey-1 | 93,3 | 82,6 | 68,0 |
| StartLux-2B-Instant | 99,2 | 88,0 | 68,5 |
| Concord-2B | 98,3 | 84,9 | 69,6 |

Además, en el conjunto privado de dos tareas del autor, Concord-2B obtiene 78,8 frente a 78,9 de KnowLine-2B-Gen1 y 57,1 de joey-1. StartLux-2B-Instant tiene licencia no comercial y no puede usarse como ingrediente de merge. La tabla completa está en results.md del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,3B parámetros en bfloat16 los pesos ocupan aproximadamente 4,5 GB, por lo que se necesitan en torno a 5-6 GB de VRAM incluyendo overhead.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090; para despliegue en servidor, A100 o H100 son suficientes con holgura.
- Cabe en GPU de consumo: sí, con cuantización o en bfloat16 en tarjetas de 8 GB o más.
- Opciones de despliegue: transformers (el quick start oficial usa AutoModelForImageTextToText con dtype bfloat16 y device_map="auto"). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Al ser un único forward pass sin generación, la latencia es intrínsecamente menor que la de un modelo generativo equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DI avg (39) | CLINC150 | Licencia |
|---|---|---|---|---|---|
| Concord-2B | 2,3B | no disponible | 69,6 | 98,3 | Apache-2.0 |
| joey-1 | 2B (aprox.) | no disponible | 68,0 | 93,3 | MIT (según model card) |
| KnowLine-2B-Gen1 | 2B (aprox.) | no disponible | 65,5 | 93,3 | Apache-2.0 |
| StartLux-2B-Instant | 2B (aprox.) | no disponible | 68,5 | 99,2 | No comercial |

Concord-2B lidera el promedio del Decision Index entre los modelos de 2B comparados y supera a sus dos ingredientes tanto en JevBench como en el promedio global. StartLux-2B-Instant obtiene mejor CLINC150 y JevBench, pero su licencia no comercial limita su uso en producción y su reutilización.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente el idioma en; no hay soporte multilingüe documentado.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso; solo devuelve probabilidades sobre opciones predefinidas.
- Límite de 62 opciones por consulta, condicionado a que las etiquetas sean tokens únicos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración: la distribución de probabilidad puede ser sobreconfiada en opciones incorrectas; conviene usar umbrales de confianza.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5-2B y de dos modelos de decisión, hereda los sesgos de sus datos de entrenamiento, no auditados en la model card.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento con registros largos.
- El conjunto privado de dos tareas del autor (78,8) no es verificable de forma independiente.
- El modelo es muy reciente (creado el 21 de noviembre de 2026) y no tiene descargas ni likes, por lo que carece de validación de la comunidad.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las licencias de los modelos ingredientes (joey-1 es MIT; verificar términos de KnowLine-2B-Gen1 y Qwen3.5-2B).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knoveleng/Concord-2B
- Resultados completos: https://huggingface.co/knoveleng/Concord-2B/blob/main/results.md
- Licencia: https://huggingface.co/knoveleng/Concord-2B/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Ingrediente KnowLine-2B-Gen1: https://huggingface.co/PelaAI/KnowLine-2B-Gen1
- Ingrediente joey-1: https://huggingface.co/baselabs/joey-1
- Paper "One Offset, Many Models: A Weight-Space Audit of Decision Models": referenciado en la model card sin URL directa disponible
