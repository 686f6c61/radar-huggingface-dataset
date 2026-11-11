# glim-oss/cogent-small

## Resumen

Cogent-Small es un modelo encoder de 68,1 millones de parámetros desarrollado por glim-oss, segundo de una familia de cuatro tamaños (Nano, Small, Base y Large). No es un modelo generativo: responde decisiones multi-pregunta tipadas. Se le entrega un estado (cualquier texto o JSON) y una lista de preguntas tipadas sobre ese estado, y devuelve una probabilidad para cada opción de cada pregunta. El estado se codifica una sola vez y se comparte entre todas las preguntas del lote.

La arquitectura es un encoder estilo ModernBERT de 19 capas, tamaño oculto 512 y 8 cabezas de atención, ejecutado bajo una máscara de atención en árbol, con una pequeña cabeza lectora de menos de 1 millón de parámetros. El backbone desciende del reranker público `cross-encoder/ettin-reranker-68m-v1`. Está diseñado explícitamente para ejecutarse en CPU, lo que lo sitúa en una categoría distinta a la de los LLM generativos: es una pieza de infraestructura para enrutamiento, clasificación y control de agentes.

Su relevancia actual reside en la creciente necesidad de componentes ligeros y deterministas que tomen decisiones estructuradas dentro de pipelines de agentes, sin el coste ni la variabilidad de un modelo generativo. La licencia GPL-3.0 y la dependencia de un paquete de inferencia propio (`cogent`) son factores determinantes para su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder estilo ModernBERT (19 capas, hidden size 512, 8 cabezas de atencion) con mascara de atencion en arbol y cabeza lectora |
| Parametros totales | 68.144.640 (backbone 68,1M; cabeza lectora <1M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Estado: 2.048 tokens (con `[CLS]` y `[SEP]`); pregunta: 512 tokens; opcion: 128 tokens. Solicitudes de mas de 1.024 tokens se dividen en varias secuencias |
| Tipos de cuantizacion | bf16 (por defecto) y fp32; la cabeza lectora siempre en float32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | GPL-3.0 (el backbone deriva de un encoder Apache-2.0) |
| Formato de pesos | safetensors (`model.safetensors` para el backbone, `head.safetensors` para la cabeza lectora) |

## Arquitectura y entrenamiento

Cogent-Small procesa una solicitud como una única secuencia de tokens: primero el estado, después cada pregunta seguida de sus opciones. La máscara de atención en árbol garantiza que el estado solo se lea a sí mismo (se codifica una vez y se comparte entre todas las preguntas), que cada pregunta lea el estado y a sí misma, y que cada opción lea el estado, su propia pregunta y a sí misma, nunca otra opción ni otra pregunta. La cabeza lectora agrupa los tokens de cada opción en un vector, lo hace leer el estado agrupado mediante dos capas de cross-attention y emite un logit por opción; un softmax sobre las opciones de cada pregunta produce las probabilidades.

Esta separación estricta de ramas implica una propiedad arquitectónica exacta: una pregunta formulada sola obtiene la misma respuesta que formulada junto a otras, en cualquier orden. En fp32 la diferencia entre ambas ejecuciones es solo de redondeo en coma flotante (distancia de variación total máxima medida de 2,5e-6 en la familia); en bf16 el redondeo es más grueso. El modelo soporta tres tipos de pregunta: `choice` (elegir una entre varias opciones con identificadores arbitrarios), `score` (valorar en una escala ordenada) y `noul` (afirmación sí/no con opciones `["false", "true"]`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que el artículo técnico está pendiente de publicación. El backbone deriva del encoder público `cross-encoder/ettin-reranker-68m-v1`.

## Capacidades

- Clasificación de texto multi-pregunta con decisiones tipadas: devuelve una distribución de probabilidad por pregunta, con las opciones en el orden proporcionado y suma 1.
- Tres tipos de pregunta: `choice` (selección entre opciones), `score` (escala ordenada) y `noul` (verificación de afirmación sí/no).
- Procesamiento de estado en texto libre o JSON: cualquier valor JSON se serializa a texto y es lo que lee el modelo.
- Descripciones de opciones opcionales: el modelo lee tanto el identificador como la descripción de cada opción.
- Codificación compartida del estado: una sola pasada por el estado para todas las preguntas de la solicitud.
- Independencia entre preguntas: la respuesta a una pregunta no depende de las demás ni de su orden (propiedad arquitectónica exacta en aritmética exacta).
- Ejecución en CPU: diseñado para funcionar sin GPU, con soporte de bf16 nativo vía `avx512_bf16` y fallback automático a fp32.
- Sin límite en el número de preguntas ni de opciones por solicitud.
- No soporta generación de texto, tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Enrutamiento de trazas de agentes: dado un estado JSON con la tarea y la última acción ejecutada, decidir entre `continue`, `human_review` o `stop`. El modelo devuelve probabilidades calibradas que permiten fijar umbrales de confianza antes de escalar a un humano.
- Moderación y control de calidad en pipelines: clasificar conversaciones o salidas de un LLM con preguntas tipo `noul` ("¿esta respuesta contiene datos personales?", "¿requiere revisión humana?") y usar la probabilidad como señal de bloqueo.
- Etiquetado automático de datos a escala: procesar grandes volúmenes de texto en CPU con múltiples preguntas por documento, aprovechando la codificación única del estado para reducir el coste computacional.
- Evaluación de respuestas de LLM: puntuar con preguntas `score` la calidad, toxicidad o relevancia de una respuesta generada, obteniendo una distribución sobre la escala en lugar de una etiqueta única.
- Extracción de decisiones estructuradas de texto libre: dado un correo o ticket de soporte como estado, responder preguntas `choice` sobre categoría, urgencia y acción recomendada en una sola pasada.
- Clasificación multietiqueta eficiente en entornos sin GPU: desplegar en servidores de CPU o entornos edge donde no hay acelerador disponible, usando el formato fp32 para máxima fidelidad.
- Filtrado previo en sistemas RAG: decidir si un fragmento recuperado es relevante para la consulta (`noul`) antes de pasarlo a un modelo generativo, reduciendo coste y latencia del pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de clasificación estándar, y el artículo técnico está pendiente de publicación.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo está diseñado para ejecutarse en CPU.
- Tamaño en disco: 143,1 MB en bf16 (136,3 MB de `model.safetensors`) y 279,4 MB en fp32 (272,6 MB de `model.safetensors`).
- Memoria RAM estimada: del orden de 150 MB en bf16 y 280 MB en fp32 para los pesos, más el overhead de PyTorch y del tokenizador.
- CPU recomendada: con soporte `avx512_bf16` para el formato bf16. En CPUs sin esa extensión, el formato bf16 es lento y sus respuestas difieren ligeramente; debe usarse la carpeta `fp32`. La función `cogent.cpu_has_bf16()` indica si la CPU dispone de soporte nativo, y `dtype="auto"` carga automáticamente la copia fp32 con un aviso.
- GPU: no es necesaria ni se documenta soporte específico.
- Despliegue: paquete `cogent` (https://github.com/glim-oss/cogent-infer), que requiere Python 3.10 o superior, `torch`, `transformers>=5.22`, `safetensors` y `numpy`. El modelo no funciona solo con `transformers`. El paquete incluye interfaz de línea de comandos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Ejecucion en CPU |
|---|---|---|---|---|---|
| Cogent-Small | 68,1M | Estado 2.048 / pregunta 512 / opcion 128 tokens | Encoder de decisiones tipadas | GPL-3.0 | Si, disenado para ello |
| Cogent-Nano | no disponible | no disponible | Encoder de decisiones tipadas | no disponible | Si (misma familia) |
| Cogent-Base | no disponible | no disponible | Encoder de decisiones tipadas | no disponible | Si (misma familia) |
| Cogent-Large | no disponible | no disponible | Encoder de decisiones tipadas | no disponible | Si (misma familia) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las otras variantes de la familia Cogent en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta soporte multilingüe.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y distribución. El backbone deriva de un encoder Apache-2.0, pero la licencia del modelo publicado es GPL-3.0.
- Dependencia de un paquete de inferencia propio (`cogent`): no funciona con `transformers` estándar, lo que añade una dependencia de terceros al stack de producción.
- El formato bf16 requiere CPU con `avx512_bf16`; en otras CPUs las respuestas difieren ligeramente y el rendimiento es bajo, obligando a usar fp32.
- Truncamiento a la derecha de entradas que superen los límites: estado 2.048 tokens, pregunta 512, opción 128. Las solicitudes de más de 1.024 tokens se dividen en varias secuencias, cada una con el estado completo, lo que incrementa el coste.
- Riesgo de alucinación no aplicable en el sentido generativo, pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento; no se han publicado métricas de calibración.
- Sesgos: no se documenta información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- El artículo técnico está pendiente de publicación, lo que limita la reproducibilidad y la evaluación independiente del método de entrenamiento.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; modelo recién publicado (creado el 2026-11-11).

## Enlaces

- Hugging Face: https://huggingface.co/glim-oss/cogent-small
- Repositorio de inferencia: https://github.com/glim-oss/cogent-infer
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-68m-v1
- Variante Nano: https://huggingface.co/glim-oss/cogent-nano
- Variante Base: https://huggingface.co/glim-oss/cogent-base
- Variante Large: https://huggingface.co/glim-oss/cogent-large
