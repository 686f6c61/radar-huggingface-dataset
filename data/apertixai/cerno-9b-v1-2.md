# apertixai/cerno-9b-v1.2

## Resumen

Cerno 9B v1.2 es un modelo de decisión tipada ("System One") desarrollado por apertixai, afinado a partir de Qwen/Qwen3.5-9B. A diferencia de un modelo generativo al uso, no produce texto: recibe un *estado* (cualquier texto o JSON) y un conjunto de *preguntas tipadas* (opción múltiple con criterios explícitos, sí/no, escalas puntuadas) y devuelve una probabilidad calibrada para cada opción de cada pregunta en un único forward pass. Está registrado en HuggingFace con pipeline `text-classification` y 8.953.803.264 parámetros reales en safetensors bf16 (17,9 GB de repositorio).

La versión 1.2 introduce dos cambios técnicos respecto a v1.1: atención bidireccional por bloques en las capas de atención completa (cada token atiende bidireccionalmente dentro de su bloque —el estado o una pregunta con sus opciones— y causalmente a los bloques previos) y la estrategia "read twice", que relee la entrada de hasta 3.000 tokens antes de responder. Según el autor, esto supone +8,24 puntos en el índice público sobre v1.1 (58,59 → 66,83). Al no poder aplicar vLLM esa máscara de atención, el modelo se sirve sobre `transformers` en bf16.

Es relevante porque ataca un nicho distinto al de los LLM conversacionales: clasificación y decisión estructurada con probabilidades calibradas, latencia baja (62 ms de mediana por petición en una H200) y hasta 255 opciones por pregunta. La licencia Apache 2.0 y su tamaño de 9B lo hacen desplegable en una sola GPU de 24 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B con atención bidireccional por bloques (block attention) y decodificación sin generación de texto |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; la estrategia "read twice" opera sobre peticiones de hasta 3.000 tokens |
| Tipos de cuantizacion | Pesos publicados en bf16; no se documentan otras cuantizaciones para v1.2 (v1.1 se sirvió en FP8 sobre vLLM) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3.5-9B, no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B ya post-entrenado y se afina para una tarea de decisión tipada. La innovación arquitectónica principal es la máscara de atención por bloques: en las capas de atención completa, cada token atiende de forma bidireccional dentro de su bloque (el estado, o una pregunta junto con sus opciones) y de forma causal a los bloques anteriores. Esto permite empaquetar en un único prompt el estado y todas las preguntas, y obtener en un solo forward pass una distribución de probabilidad por opción, sin generar texto. La consecuencia práctica es que vLLM no puede aplicar esa máscara, por lo que el motor de inferencia es `transformers` con el código propio del proyecto (`cerno-inference`).

El entrenamiento se realiza sobre el modelo base post-entrenado (no sobre la versión Base, como en v1.1), lo que según el autor explica parte de la mejora. La model card menciona datos de entrenamiento con splits públicos de varios benchmarks (HLE, BANKING77, CLINC150, HellaSwag y otras familias) y por ello reporta métricas "Strict-OOD" y "Train-split-OOD" que excluyen esas familias. Se aplica una temperatura fijada de 1,256, ajustada sobre conjuntos de evaluación retenidos y no pertenecientes a benchmarks; es invariante al argmax, es decir, recalibra las probabilidades sin cambiar la respuesta elegida. La estrategia "read twice" repite la entrada (estado, preguntas con opciones, la frase "Read the same input again before answering:" y de nuevo el estado) y es desactivable con `--option read_twice_tokens=0`.

## Capacidades

- Clasificación y decisión tipada: opción múltiple con criterios explícitos, preguntas sí/no y escalas puntuadas, con hasta 255 opciones por pregunta.
- Salida de probabilidades calibradas por opción y pregunta en un único forward pass, sin generación de texto.
- Procesamiento de estados heterogéneos: texto libre o JSON como entrada.
- Empaquetado de múltiples preguntas en un solo prompt, con atención bidireccional por bloque.
- Modo "read twice" para releer la entrada antes de responder (hasta 3.000 tokens).
- Calibración mediante temperatura fijada (1,256) invariante al argmax.
- No soporta tool calling, function calling ni razonamiento multi-paso generativo: no es un modelo de agente ni de generación.
- Capacidades multilingües: no declaradas en la model card (dependen del modelo base Qwen3.5-9B).

## Casos de uso

- Moderación y clasificación de contenido: el modelo recibe el texto del usuario como estado y una pregunta tipada con categorías explícitas (por ejemplo, "¿es spam?", "¿es tóxico?") y devuelve probabilidades calibradas por categoría, lo que permite fijar umbrales operativos con error de calibración conocido.
- Enrutamiento de tickets de soporte: con BANKING77 y CLINC150 entre los benchmarks evaluados, encaja en la clasificación de intenciones sobre JSON del ticket, devolviendo la distribución sobre las intenciones posibles en una sola pasada y con latencia de decenas de milisegundos.
- Evaluación automática de respuestas: dado un par pregunta-respuesta como estado, formular preguntas sí/no o escalas puntuadas sobre corrección, relevancia o seguridad, y usar las probabilidades como señal de scoring.
- Extracción de decisiones en pipelines de datos: clasificar registros JSON (por ejemplo, validación de campos o asignación de etiquetas) con una o varias preguntas empaquetadas por petición, sin coste de generación de texto.
- Triaje clínico o legal asistido: escalas puntuadas sobre un informe para priorizar revisión humana, aprovechando la calibración (ECE de 5,7 puntos en la medida del board) para umbrales conservadores.
- Detección de anomalías y control de calidad: preguntas sí/no sobre si un documento cumple criterios explícitos, con probabilidad por criterio y capacidad de hasta 255 opciones por pregunta para taxonomías amplias.
- Serving de baja latencia en una sola GPU: 62 ms de mediana y 264 ms de media por petición en una H200 en bf16, adecuado para APIs síncronas de clasificación con una GPU de 24 GB o más.

## Benchmarks y rendimiento

Datos declarados por el autor (model-index, no verificados de forma independiente):

| Metrica | Cerno 9B v1.2 | Cerno 9B v1.1 |
|---|---:|---:|
| Decision Index 0.3, índice público (suite completa, 37 benchmarks, 140.178 peticiones) | 66,83 | 58,59 |
| Strict-OOD | 64,85 | 55,28 |
| Train-split-OOD | 63,28 | 54,92 |
| Error de calibración, ECE estilo board | 5,7 pts | 4,3 pts |

Notas del autor: el ruido entre ejecuciones en el índice público es de aproximadamente 0,1-0,2 puntos; el índice público no cuenta para la clasificación del board (Full score pendiente para v1.2, compuesto por un 60% de tests privados de las mismas habilidades y un 40% de tareas privadas de dominios nuevos). Strict-OOD excluye HLE, BANKING77, CLINC150 y HellaSwag; Train-split-OOD excluye todas las familias de benchmarks cuyos splits públicos se usaron en entrenamiento.

## Requisitos de hardware

- VRAM estimada: los pesos bf16 ocupan 17,9 GB; el autor indica una GPU con 24 GB o más para inferencia.
- GPU recomendadas: H200 (mediciones del autor: 62 ms de mediana y 264 ms de media por petición, una petición a la vez); cualquier GPU con 24 GB o más para bf16, como A100 40/80 GB, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16, aunque sin margen amplio para lotes grandes.
- Opciones de despliegue: `transformers` con el código de `cerno-inference` (motor oficial); vLLM no es compatible con la máscara de atención por bloques de v1.2. La versión v1.1 (FP8, vLLM) sigue disponible en `apertixai/cerno-9b` si se necesita ese motor.
- Latencia y throughput: 62 ms de mediana y 264 ms de media por petición en una H200, una petición a la vez; no se publican cifras de throughput con lotes.

## Comparativa con modelos similares

| Modelo | Base | Pesos / motor | Temperatura | Índice público | Licencia |
|---|---|---|---:|---:|---|
| Cerno 9B v1.2 | Qwen3.5-9B | bf16, transformers | 1,256 | 66,83 | Apache 2.0 |
| Cerno 27B v1.0 | Qwen3.8-27B | FP8, vLLM | 1,0 | 65,19 | No disponible en la información proporcionada |
| Cerno 4B v1.2 | Qwen3.5-4B | bf16, transformers | 1,236 | 65,05 | No disponible en la información proporcionada |
| Cerno 9B v1.1 | Qwen3.5-9B-Base | FP8, vLLM | 1,539 | 58,59 | No disponible en la información proporcionada |

La comparación con modelos de clasificación o decisión de otros proveedores no está disponible en la información proporcionada, ya que el índice público está definido por el propio autor y no se ofrecen resultados de terceros sobre la misma suite.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; usarlo como chat o agente no es su caso de uso.
- El índice público (66,83) es una métrica definida por el autor, no verificada de forma independiente (`verified: false` en el model-index), y no equivale al Full score del board, que está pendiente.
- Error de calibración de 5,7 puntos ECE, superior al 4,3 de v1.1: la mejora en acierto viene acompañada de peor calibración, algo relevante si se fijan umbrales operativos.
- Riesgo de contaminación de benchmarks: el autor reconoce haber usado splits públicos de varias familias en entrenamiento y publica métricas OOD para mitigarlo; las cifras in-distribution deben interpretarse con cautela.
- Idiomas soportados no declarados; el comportamiento multilingüe depende del modelo base y no está documentado.
- La máscara de atención por bloques impide usar vLLM con v1.2; el despliegue queda ligado al código de `cerno-inference` sobre `transformers`, lo que limita opciones de serving maduras.
- La temperatura de calibración (1,256) está fijada y ajustada sobre conjuntos retenidos del autor; en dominios muy distintos puede requerir reajuste.
- Sesgos conocidos: no documentados en la model card; al heredar el modelo base, pueden persistir sesgos de Qwen3.5-9B.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documenta restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apertixai/cerno-9b-v1.2
- Cerno 27B: https://huggingface.co/apertixai/cerno-27b
- Cerno 4B v1.2: https://huggingface.co/apertixai/cerno-4b-v1.2
- Cerno 9B v1.1 (FP8, vLLM): https://huggingface.co/apertixai/cerno-9b
- Código de inferencia: https://github.com/apertixsk/cerno-inference
- Dataset Decision Index runs: https://huggingface.co/datasets/apertixai/cerno-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
