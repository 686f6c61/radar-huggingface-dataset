# bdauzats/minicpm5-2b-decision-mlx-4bit

## Resumen

`bdauzats/minicpm5-2b-decision-mlx-4bit` es un modelo de decisión, no un modelo generativo. Recibe un texto (el *estado*) y una o varias preguntas tipadas, y devuelve una probabilidad por opción en un único paso forward. Nunca genera texto. Está construido sobre `openbmb/MiniCPM5-2B` (2.516.756.480 parámetros según el safetensors), al que se le ha fusionado un LoRA de rango 16 y se le ha añadido una cabeza pointer, tras un entrenamiento multitarea sobre datos de decisión. Después se convirtió a MLX y se cuantizó a 4 bits con grupo de tamaño 64.

Lo desarrolla el autor de `jul`, una herramienta de decisiones tipadas locales que reproduce la interfaz del SDK de Python de TypeSafe (Jev) sobre Apple Silicon mediante MLX, o sobre PyTorch en cualquier otra plataforma. El modelo sigue la arquitectura y el código de entrenamiento de Kev (Jared Palmer, Apache-2.0), aplicados aquí a un modelo base distinto y a una mezcla de datos distinta. El repositorio pesa 1,4 GB y se distribuye bajo licencia Apache-2.0.

Su relevancia es acotada pero concreta: cubre el nicho de clasificación y enrutamiento de baja latencia (65 ms p50 para 3 opciones cortas, 140 ms para 10 opciones con textos largos en un M4 Pro de 24 GB), sin generación de tokens, y con calibración ajustada mediante una temperatura de 1,954 fijada en `decision.json`. Frente a modelos de decisión entrenados como Jev, obtiene una media de 0,796 en el benchmark publicado de 300 filas, con mejor error de calibración esperado (0,133 frente a 0,156).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama` en el repo) con LoRA r=16 fusionada y cabeza pointer de dos capas lineales 2048 → 256 |
| Parametros totales | 2.516.756.480 (2,52 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits MLX con group size 64 (unica cuantizacion publicada en este repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) + `pointer_head.npz` + `decision.json` con el formato de entrada, la lectura, la cabeza y la temperatura |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM5-2B y le incorpora dos modificaciones: un adaptador LoRA de rango 16 fusionado en los pesos y una cabeza pointer independiente (dos capas lineales de 2048 a 256, almacenada en `pointer_head.npz`) que convierte el estado oculto en una distribución sobre las opciones de cada pregunta. El entrenamiento es multitarea sobre datos de decisión, con el formato descrito en `decision.json`: tokens delimitadores, disposición de la entrada, modo de lectura y límites de entrenamiento. La temperatura de lectura es 1,954, ajustada una sola vez sobre el conjunto de desarrollo en distribución y aplicada en tiempo de carga; no altera la respuesta, solo la probabilidad.

El resultado se convirtió a MLX y se cuantizó a 4 bits (grupo 64). Es importante señalar que los resultados de desarrollo se midieron en PyTorch, en fp32, antes de la cuantización. El autor reconoce una asimetría de evaluación: este modelo se entrenó con los splits de entrenamiento de los tres conjuntos del benchmark de Jev (AG News, Banking77, Emotion), mientras que los datos de entrenamiento de Jev no están publicados. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de texto con opciones abiertas: devuelve una probabilidad por opción, sin generar texto.
- Preguntas tipadas sobre un mismo estado: `Choice` (elección entre opciones con criterios), `Noul` (sí/no) y `Score` (puntuación sobre un rango ordenado).
- Multi-pregunta con prefijo cacheado: el estado se codifica una vez y cada pregunta continúa desde ese prefijo, de modo que varias preguntas sobre un mismo texto cuestan poco más que la primera.
- Enrutamiento y triaje: asignación de tickets a equipos, prioridad y detección de enfado en una sola llamada.
- Clasificación zero-shot en cuatro conjuntos de referencia (Yahoo Topics, Empathetic, Massive, FinancialPhraseBank) con precisión media 0,606 en MLX 4-bit.
- Calibración de confianza: error de calibración esperado (ECE) de 0,133 en el benchmark de Jev y temperatura ajustada para reducir errores confiados.
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto: la model card es explícita en que nunca genera texto.
- Capacidad multilingüe: no disponible (el modelo está declarado solo para inglés).

## Casos de uso

- Triaje de tickets de soporte: con `Choice` se asigna un ticket a facturación, envíos o accesos, más un `Noul` de cliente enfadado y un `Score` de urgencia, todo en unos 180 ms p50 para cuatro preguntas sobre un mismo estado.
- Enrutamiento de correo entrante: clasificación zero-shot de mensajes en categorías definidas en tiempo de ejecución, útil porque las opciones se leen en cada petición y no exigen reentrenar el modelo.
- Análisis de sentimiento y emoción: la tarea Emotion es la que mejor domina (0,69 en el benchmark de Jev, frente a 0,48 de Jev), lo que lo hace adecuado para moderación y monitorización de opinión en inglés.
- Clasificación de intenciones en asistentes de voz o chat: sobre conjuntos con muchas etiquetas finas como Banking77 mantiene un 0,79, suficiente para preclasificar antes de un modelo mayor.
- Etiquetado de documentos largos en lote: con 10 opciones y textos largos ronda los 140 ms por petición en un M4 Pro, lo que permite procesar corpus de tamaño medio en local.
- Clasificación de operaciones financieras: FinancialPhraseBank es uno de los cuatro conjuntos evaluados, con error de calibración de 0,127.
- Prefiltrado de baja latencia antes de un LLM generativo: al devolver una distribución calibrada en un solo paso forward, se puede descartar o derivar tráfico sin pagar el coste de decodificación de tokens.
- Automatización de decisiones local con `jul`: ejecución en Apple Silicon sin red y con los umbrales de decisión definidos por el propio usuario en el SDK.

## Benchmarks y rendimiento

Conjuntos de desarrollo (medidos en PyTorch, fp32, antes de la cuantización). El benchmark de Jev no se ha leído para este checkpoint:

| Conjunto de desarrollo | Kev-0.8B | este modelo | Kev-4B | Jev |
|---|---:|---:|---:|---:|
| `transfer-v4` (fuentes nunca vistas en entrenamiento, 656 preguntas) | 0,652 | **0,721** | 0,797 | 0,857 |
| `decision-v7` (ejemplos reservados de las fuentes de entrenamiento, 1264) | 0,825 | **0,846** | 0,872 | no disponible |

Nota del autor: `transfer-v4` incluye Emotion, que sí está en la mezcla de entrenamiento de este modelo (no así en la de Kev); sin Emotion, la puntuación es 0,710 frente a 0,668 de Kev-0.8B.

Benchmark de Jev (300 filas publicadas: AG News, Banking77, Emotion), zero-shot a través de `jul`:

| Modelo | AG News | Banking77 | Emotion | Media | ECE media | p50 |
|---|---:|---:|---:|---:|---:|---:|
| este modelo | 0,91 | 0,79 | **0,69** | **0,796** | **0,133** | 217 ms |
| Jev (publicado) | **0,91** | **0,87** | 0,48 | 0,753 | 0,156 | 246 ms |
| GLiNER2.5 (publicado) | 0,70 | 0,61 | 0,44 | 0,583 | 0,101 | 128 ms |

Clasificación zero-shot en cuatro conjuntos (BTZSC: Yahoo Topics, Empathetic, Massive, FinancialPhraseBank, 200 ejemplos cada uno), en MLX 4-bit con `jul`: precisión media 0,606, frente a 0,542 del mismo modelo base leído con el método vectorial de `jul`. Error de calibración por conjunto: 0,127 (FinancialPhraseBank), 0,107 (Yahoo Topics), 0,134 (Empathetic) y 0,241 (Massive, 59 opciones); media 0,152 frente a 0,109 del método vectorial.

Latencia medida en un M4 Pro (24 GB), a corriente, con `jul` en MLX 4-bit:

| Peticion | p50 |
|---|---:|
| 3 opciones cortas (FinancialPhraseBank) | 65 ms |
| 10 opciones, textos largos (Yahoo Topics) | 140 ms |
| 32 opciones (Empathetic) | 208 ms |
| 59 opciones largas (Massive) | 613 ms |
| 4 preguntas (choice, choice, noul, score) sobre un ticket | 180 ms |

Calibración: la temperatura 1,954 aplicada en carga reduce el error de calibración en `transfer-v4` de 0,182 a 0,092, los errores confiados (incorrectos con probabilidad ≥ 0,9) del 12,5 % al 3,2 %, y el Brier de 0,436 a 0,377. Con `KEV_TEMPERATURE=1.0` se obtienen los logits crudos.

## Requisitos de hardware

- Pesos cuantizados a 4 bits: el repositorio completo ocupa 1,4 GB, de modo que la inferencia cabe holgadamente en menos de 2-3 GB de memoria, sumando caché de estados y opciones.
- Medición oficial en Apple Silicon: M4 Pro con 24 GB de memoria unificada, a través de MLX y `jul`.
- Estimaciones para otras precisiones (cálculo derivado del número de parámetros, no publicado por el autor): en fp16 los pesos rondarían los 5 GB y en fp32 los 10 GB; los resultados de desarrollo se midieron precisamente en fp32.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más (RTX 3050, RTX 3060, RTX 4060, RTX 4090) soporta la variante de 4 bits, siempre que se use una ruta de ejecución compatible; en MLX el destino natural es memoria unificada de Apple Silicon.
- Opciones de despliegue: `jul` sobre MLX (`jul models add minicpm5-2b-decision --repo bdauzats/minicpm5-2b-decision-mlx-4bit`), el servidor propio de Kev sirviendo estos pesos desde el checkpoint sin cuantizar, y PyTorch en plataformas no Apple.
- No se publican pesos GGUF ni recetas para llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: los p50 por petición están en la tabla anterior (65 ms a 613 ms según número y longitud de opciones); el coste crece con el número y la longitud de las opciones, que se leen en cada petición.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Media benchmark Jev | ECE media | Licencia / disponibilidad |
|---|---|---|---|---|---|
| este modelo | 2,52 B (4 bits MLX) | Modelo de decision sobre MiniCPM5-2B | 0,796 | 0,133 | Apache-2.0, pesos abiertos en HF |
| Jev (TypeSafe) | no disponible | Modelo de decision entrenado | 0,753 | 0,156 | Hospedado, servicio en red (246 ms p50 publicado) |
| Kev-4B | 4 B (aproximado segun nombre) | Modelo de decision, misma receta | no disponible en el benchmark de Jev | no disponible | Apache-2.0 (codigo de Kev) |
| Kev-0.8B | 0,8 B (aproximado segun nombre) | Modelo de decision, misma receta | no disponible en el benchmark de Jev | no disponible | Apache-2.0 (codigo de Kev) |
| GLiNER2.5 | no disponible | Modelo de clasificacion zero-shot | 0,583 | 0,101 | No disponible en la informacion proporcionada |

En los conjuntos de desarrollo, la progresion interna es clara: 0,721 en `transfer-v4` frente a 0,652 de Kev-0.8B y 0,797 de Kev-4B; en `decision-v7`, 0,846 frente a 0,825 y 0,872 respectivamente.

## Limitaciones y advertencias

- No genera texto: cualquier uso que requiera respuesta redactada, resumen o diálogo queda fuera de su alcance por diseño.
- Solo inglés declarado; no hay evidencia de comportamiento multilingüe.
- La cuantización a 4 bits mantiene la respuesta en casi todos los ejemplos, pero desplaza las probabilidades hasta ~0,3, según advierte el propio autor. La recomendación explícita es fiarse de la respuesta antes que del número.
- Calibración dependiente del dominio: aunque la temperatura 1,954 reduce el ECE en `transfer-v4` de 0,182 a 0,092, en el conjunto Massive (59 opciones) el ECE es 0,241 y la media en los cuatro conjuntos zero-shot (0,152) es peor que la del método vectorial de `jul` (0,109), cuya temperatura se ajustó sobre esos mismos conjuntos.
- Riesgo de sobreestimación en el benchmark de Jev: el modelo se entrenó con los splits de entrenamiento de AG News, Banking77 y Emotion, mientras que las filas del benchmark son de test; la comparación con Jev no es simétrica porque los datos de entrenamiento de Jev no son públicos.
- Banking77 sigue 8 puntos por detrás de Jev (0,79 frente a 0,87) pese a haber entrenado con ese conjunto: 72 intenciones muy granulares son el punto débil.
- Para tareas nunca vistas, la referencia válida es `transfer-v4` (0,721), no el benchmark de Jev.
- Dependencia de la herramienta `jul` o del servidor de Kev: el formato de entrada, la lectura y la cabeza pointer viven en `decision.json`, así que un despliegue propio exige respetar ese contrato.
- Adopción nula en el momento de la ficha: 0 descargas y 0 "me gusta", sin validación externa conocida.
- Licencia Apache-2.0, que permite uso comercial, pero se hereda del modelo base `openbmb/MiniCPM5-2B` y conviene verificar las condiciones de este último antes de explotarlo en producción.
- No hay resultados publicados de benchmarks de generación (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bdauzats/minicpm5-2b-decision-mlx-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio de jul: https://github.com/bdauzats/jul
- Repositorio de Kev (Jared Palmer, Apache-2.0): https://github.com/jaredpalmer/kev
- Documentacion de la API de Jev (TypeSafe): https://docs.typesafe.ai/api
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente articulos de ayuda de Windows, sin relacion con esta ficha.
