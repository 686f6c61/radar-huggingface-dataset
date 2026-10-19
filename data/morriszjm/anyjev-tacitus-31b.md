# morriszjm/AnyJev-Tacitus-31B

## Resumen

AnyJev Tacitus 31B es un modelo de decisión obtenido por ajuste fino supervisado de google/gemma-4-31B-it y publicado por el usuario morriszjm. Su particularidad es que no genera texto: lee una decisión tipificada —una elección entre hasta 260 opciones, o un sí/no— a partir de un único prefill, como una distribución de probabilidad sobre las etiquetas de las opciones. El modelo se entrena y se sirve con un diseño conjunto: el motor de lectura de AnyJev y un pequeño plugin de vLLM aplican dos rangos de tokens bidireccionales (el estado y la pregunta con sus opciones) sobre las capas de atención completa.

Con 31.273.086.512 parámetros (~31,3 B) en bf16 y 62,6 GB de repositorio, es un modelo denso de gran tamaño que requiere hardware de数据中心: la model card indica servicio en FP8 sobre una única GPU de 94–96 GB con una ventana de 32.768 tokens. No está pensado para invocarse como un modelo conversacional mediante prompting: leído como un modelo causal convencional, sin los rangos bidireccionales que aplica el motor, las probabilidades obtenidas no son las que el modelo fue construido para dar.

Su relevancia actual es de nicho pero interesante: propone sustituir la generación de tokens por una lectura directa de probabilidades para tareas de enrutamiento, selección y calibración, con un índice público propio (Decision Index 0.3) de 65,52 sobre 140.178 peticiones puntuables. El método completo está pendiente de publicación en un paper, y la adopción es todavía muy baja (14 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible; derivada de google/gemma-4-31B-it (librería transformers), con capas de atención completa sobre las que se aplican rangos de tokens bidireccionales |
| Parámetros totales | 31.273.086.512 (~31,3 B) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 32.768 tokens (ventana de servicio indicada en la model card) |
| Tipos de cuantización | BF16 en los pesos; FP8 aplicado en carga para servicio (`--quantization fp8`). No se mencionan GGUF ni otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (declarada en la model card) |
| Formato de pesos | safetensors (13 shards, bf16) |
| Tamaño del repositorio | 62,6 GB |
| Modalidad | Texto para las decisiones (la etiqueta de pipeline es image-text-to-text, pero la model card especifica "Text only" para el caso de uso de decisión) |
| Tokenizador y plantilla de chat | Los del modelo base google/gemma-4-31B-it |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de su origen: es un ajuste fino de google/gemma-4-31B-it, con los pesos en bf16 repartidos en 13 shards de safetensors, y conserva el tokenizador y la plantilla de chat del modelo base. El detalle técnico relevante que sí se explicita es que el plugin de servicio aplica dos rangos de tokens bidireccionales —el estado y la pregunta con sus opciones— sobre las capas de atención completa del modelo. Esto implica que la lectura no es puramente causal: se modifica el patrón de atención en esas capas para que la pregunta y las opciones se condicionen mutuamente antes de calcular la distribución sobre las etiquetas.

El entrenamiento se diseñó de forma conjunta con la inferencia, según el autor, pero no se publican datos sobre volumen de tokens, composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla el procedimiento de ajuste (si fue supervisado sobre pares estado–decisión, con qué función de pérdida o qué esquema de calibración). El autor anuncia un paper en preparación que describirá el método; hasta entonces, la información disponible sobre el entrenamiento es mínima y no verificable de forma independiente.

## Capacidades

- Lectura de decisiones como distribución de probabilidad: elige entre hasta 260 opciones o devuelve sí/no, sin generar tokens, a partir de la distribución del siguiente token restringida a las etiquetas de las opciones.
- Calibración de decisiones: el resultado es una probabilidad, no una cadena de texto, lo que permite umbrales y comparaciones directas entre opciones.
- Enrutamiento y selección entre muchos candidatos (hasta 260), útil para elegir herramienta, categoría o acción.
- Área de herramientas con el mejor resultado del índice publicado (81,3), lo que sugiere buen comportamiento en selección de tools.
- Recuperación (retrieval) con 67,5 en el índice, orientado a tareas de selección de pasajes o documentos candidatos.
- Conocimiento (52,8), lenguaje (70,3) y artes (53,2) según el mismo índice del autor.
- Capacidad multilingüe: no disponible (no se declaran idiomas).
- Vision: la etiqueta de pipeline es image-text-to-text por herencia del modelo base, pero el modo de decisión declarado es solo texto; no se documenta uso multimodal.
- No soporta tool calling ni razonamiento multi-paso en el sentido convencional: no es un modelo de agente generativo, sino un cabezal de decisión leído por un motor específico.

## Casos de uso

- Enrutamiento de peticiones en un pipeline de agentes: dado el estado de la conversación y una lista de herramientas disponibles (hasta 260), el modelo devuelve la probabilidad de cada una; se selecciona la de mayor probabilidad o se aplica un umbral de confianza. Encaja por su área de herramientas (81,3) y porque evita la latencia de generar texto.
- Clasificación multietiqueta de tickets de soporte: se introduce el estado del ticket y un conjunto cerrado de categorías como opciones; la salida es la distribución sobre categorías, directamente consumible por un sistema de asignación.
- Filtro de seguridad y moderación: formulación sí/no sobre el estado del mensaje, con la probabilidad como puntuación de riesgo para decidir si se deriva a revisión humana.
- Selección de pasajes en un sistema RAG: con la consulta y los documentos candidatos como opciones, el modelo puntúa cuál recuperar antes de la generación; su área de retrieval (67,5) lo sitúa como reranker de baja latencia sin generación.
- Triaje en atención al cliente: decidir entre responder automáticamente, escalar a un humano o pedir más información, usando sí/no o una elección entre acciones, con la ventaja de que cada decisión lleva asociada una probabilidad calibrada.
- Preferencia y evaluación en pipelines de datos: elección entre dos o más respuestas candidatas para anotación automática o filtrado de datasets, sustituyendo a un juez generativo por una lectura directa de probabilidades.
- Enrutamiento de modelos en una plataforma de inferencia: elegir qué modelo o nivel de servicio atender para una consulta según su dificultad, con la distribución sobre opciones como señal de coste/calidad.

## Benchmarks y rendimiento

Los únicos datos publicados son del Decision Index 0.3 (suite pública), aportados por el propio autor. No hay resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar en la información disponible.

| Métrica (Decision Index 0.3, suite pública) | Valor |
|---|---|
| Índice público | 65,52 |
| Índice raw | 73,50 |
| Breadth | 64,80 |
| Knowledge | 52,8 |
| Language | 70,3 |
| Retrieval | 67,5 |
| Tools | 81,3 |
| Arts | 53,2 |
| Peticiones puntuables | 140.178 de 140.178 |
| Peticiones respondidas | Todas |
| Respuestas no soportadas | Ninguna |
| Errores | 0 |

Resultados completos en el dataset morriszjm/decision-index-results, ejecución `runs/anyjev-tacitus-31b-v1`. Son cifras autoevaluadas por el autor, sin verificación independiente disponible.

## Requisitos de hardware

- Pesos en bf16: ~62,6 GB de repositorio, lo que ya descarta cualquier GPU de consumo para servirlos sin cuantizar.
- Servicio recomendado por el autor: cuantización FP8 en carga (`--quantization fp8`) sobre una única GPU de 94–96 GB, con ventana de 32.768 tokens.
- GPU compatibles con esa configuración: H100 NVL (94 GB) o H200 (141 GB); una A100 de 80 GB no alcanza el requisito indicado. GPU de consumo (RTX 4090, 24 GB) no es viable ni en FP8.
- Despliegue: vLLM 0.29.0 más el plugin de servicio del repositorio MorrisZJ/anyjev-tacitus (`pip install ./serving`, `bash serve.sh`, puerto 8000). No se documenta soporte para llama.cpp, Ollama ni TGI; además, sin el plugin que aplica los rangos bidireccionales, las probabilidades no son las esperadas.
- Latencia y throughput: no disponibles. Al no generar tokens, la lectura es un único prefill, pero no se publican medidas de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de decisión comparables ni sobre sus especificaciones. La referencia más directa es el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnyJev Tacitus 31B | 31,3 B | 32.768 tokens (ventana de servicio) | Decisión por lectura de probabilidad sobre hasta 260 opciones o sí/no; requiere motor y plugin propios | apache-2.0 | Pesos en HuggingFace; 14 descargas |
| google/gemma-4-31B-it (base) | 31,3 B (heredados) | No disponible en la información proporcionada | Modelo conversacional instructivo; genera texto | No disponible en la información proporcionada | Pesos en HuggingFace |
| Otros modelos de decisión de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de chat: usarlo con prompting convencional produce probabilidades que no corresponden a su diseño. Requiere el motor AnyJev y el plugin de vLLM con los rangos bidireccionales.
- Dependencia de un stack propio y muy reciente (vLLM 0.29.0 más plugin), con riesgo de mantenimiento bajo: el repositorio y el método dependen de un único autor y de un paper aún no publicado.
- Riesgo de alucinación acotado por diseño al no generar texto, pero persiste el riesgo de calibración: una probabilidad alta sobre una opción no garantiza que sea correcta, y los umbrales deben validarse en el dominio de destino.
- Sesgos: no se documenta ninguna evaluación de sesgos, y al heredar el modelo base puede arrastrar los suyos sin que el ajuste los corrija.
- Idiomas: no se declaran; se desconoce el comportamiento fuera del inglés y no hay evaluación por idioma.
- Modalidad: el modo de decisión es solo texto, pese a que la etiqueta del pipeline sea image-text-to-text.
- Licencia: la model card declara apache-2.0, pero conviene verificar los términos aplicables al modelo base google/gemma-4-31B-it antes de un uso comercial.
- Adopción y validación externa mínimas (14 descargas, 0 likes); las métricas del Decision Index son autoevaluadas y el conjunto de evaluación lo define el propio autor.
- Sin cuantizaciones ligeras publicadas (no hay GGUF), lo que limita el despliegue fuera de GPUs de 94–96 GB.
- Límite funcional duro: máximo 260 opciones por decisión y salida restringida a etiquetas; no produce explicaciones ni justificaciones de la elección.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/morriszjm/AnyJev-Tacitus-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de servicio y plugin: https://github.com/MorrisZJ/anyjev-tacitus
- Motor AnyJev (Nokia Applied Research): https://github.com/nokia-applied-research/AnyJev
- Resultados del Decision Index: https://huggingface.co/datasets/morriszjm/decision-index-results
- Paper del método: en preparación, no disponible
