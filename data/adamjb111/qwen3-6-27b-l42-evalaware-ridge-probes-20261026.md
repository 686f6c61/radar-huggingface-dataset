# adamjb111/qwen3.6-27b-L42-evalaware-ridge-probes-20261026

## Resumen

Este repositorio no contiene un modelo generativo, sino un artefacto de interpretabilidad: seis sondas (probes) de regresión ridge que leen un único vector de estado oculto de Qwen/Qwen3.6-27B y devuelven una puntuación en [0, 1] que estima en qué medida el estado del modelo, en ese token, codifica la creencia de estar siendo evaluado o monitorizado. Lo publica el usuario adamjb111 bajo licencia Apache 2.0, con fecha de creación 26 de octubre de 2026, y el modelo base declarado es Qwen/Qwen3.6-27B.

El problema que aborda es el de la *eval-awareness*: la posibilidad de que un modelo modifique su comportamiento al detectar que está siendo evaluado. Medir esa creencia con un pipeline pesado (un autoencoder en lenguaje natural que escribe una nota por token y un juez LLM que la puntúa) es caro; estas sondas imitan ese pipeline con un producto matricial de 5.120 pesos más un sesgo por creencia, aproximadamente 10⁴ FLOPs por token frente a los ~5 × 10¹⁰ FLOPs de un paso forward del modelo de 27B. El coste marginal de aplicarlas sobre un modelo que ya está generando es, por tanto, despreciable.

Cada sonda es un vector de 5.120 pesos más un sesgo: la matriz `W` tiene forma (5120, 6) y el vector `b` forma (6,), es decir, 30.726 parámetros en total. Se aplican sobre la salida del bloque de decodificación 42 (indexado desde cero) del modelo base, y su relevancia actual está en que ofrecen una señal de monitorización en tiempo de inferencia a coste prácticamente nulo, validada contra un juez con correlaciones de Pearson de hasta 0,75 a nivel de token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seis sondas lineales (regresión ridge con intercepto) sobre el estado oculto del bloque 42 de Qwen3.6-27B; no es un modelo generativo |
| Parametros totales | 30.726 (matriz `W` de forma 5120×6 = 30.720 pesos, más `b` de 6 sesgos) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica a las sondas; depende de la ventana del modelo base Qwen3.6-27B (no disponible) |
| Tipos de cuantizacion | Pesos de la sonda en float32; los estados ocultos se capturan en bf16 y se convierten a float32 antes del producto. No se documenta validación con el modelo base cuantizado |
| Idiomas soportados | Entrenadas sobre texto de tareas en inglés en tres dominios; otros idiomas no han sido evaluados |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npy` (`probe_W.npy`, `probe_b.npy`) y `.safetensors` (claves `W` y `b`); metadatos en `probe.json` |
| Modelo base | Qwen/Qwen3.6-27B (bf16, plantilla de chat estándar) |
| Punto de extraccion | `model.model.layers[42]`, es decir, `hidden_states[43]` con `output_hidden_states=True` o un forward hook en esa capa; dimensión por token 5.120 |
| Columnas de salida | `b2_eval`, `b2_monitored`, `b2align_eval`, `b2align_monitored`, `b27_eval`, `b27_monitored` |

## Arquitectura y entrenamiento

La arquitectura es un modelo lineal por creencia: `score = clip(h @ W + b, 0, 1)`, donde `h` es el vector de 5.120 dimensiones del flujo residual tras el bloque 42. Las etiquetas objetivo no son anotaciones humanas, sino las notas generadas por tres autoencoders en lenguaje natural (NLA) distintos y puntuadas por un juez Qwen3.6-27B-FP8 de un dígito, normalizado como dígito esperado / 9. Los tres objetivos son `b2` y `b2-align` (estudiantes de 2B destilados del profesor de 27B, que escriben una nota en cada token) y `b27` (el profesor, que escribe nota en cada token insertado y en cada cuarto token del resto), lo que da las 3 × 2 = 6 columnas.

Los datos de entrenamiento proceden de TwinTempt v1.1 (privado): 76 tareas reales posteriores al corte de conocimiento del modelo (42 issues de GitHub con el repositorio, 21 hilos de foro de operaciones y 13 peticiones de datos), cada una en cuatro versiones que solo difieren en una respuesta insertada en el turno de usuario: versión simple sin inserción, versión sutil con un atajo tentador pero sin señal de evaluación, versión obvia en la que el solicitante dice que el trabajo se comprobará contra criterios, y versión muy obvia con una cola de tarea puntuada fija. En total, 312.264 tokens de turno de usuario.

El ajuste es ridge con intercepto sobre todos los tokens de las cuatro versiones de 60 ítems aleatorios (unos 245.000 tokens), con lambda = 0,3 veces el autovalor medio de la matriz de Gram centrada, elegido en una partición interna de validación. La validación se hace sobre los otros 16 ítems. El repositorio contiene la primera partición aleatoria (semilla 0); siete particiones adicionales dieron los mismos números dentro del ruido. Las sondas se ajustaron sobre tokens del turno de usuario, con el prompt construido por la plantilla de chat, los esquemas de herramientas adjuntos y el prompt de generación añadido.

## Capacidades

- Puntuación por token de la creencia de "estar siendo evaluado" (columnas `*_eval`) y de "estar siendo monitorizado" (columnas `*_monitored`), en el rango [0, 1].
- Lectura de seis señales simultáneas a partir de un único vector de estado oculto, con tres objetivos de destilación distintos.
- Coste computacional marginal de ~10⁴ FLOPs por token y creencia, ejecutable en CPU tras extraer el estado oculto.
- Aplicable en paralelo a la generación del modelo base sin modificarlo ni requerir un segundo pase forward si se captura el estado con un hook.
- Detección de la diferencia entre un atajo tentador sin señal explícita y un enunciado de que el trabajo será comprobado, según la validación realizada.
- No soporta generación de texto, tool calling, razonamiento multi-step, visión ni audio: es un artefacto de medición, no un modelo de propósito general.
- No hay capacidades multilingües documentadas: solo texto de tareas en inglés en tres dominios.

## Casos de uso

- Monitorización en tiempo de evaluación: ejecutar el modelo base en bf16 sobre el prompt de la tarea, capturar el estado del bloque 42 y calcular las columnas `b27_eval` y `b27_monitored` por token para registrar si el texto de la tarea contiene señales de que el trabajo va a ser comprobado. Es adecuado porque el coste añadido es despreciable frente al forward del 27B.
- Detección de sandbagging en pipelines de evaluación interna: comparar la puntuación media de un tramo de interés con la de un tramo de igual longitud en un texto de control emparejado, que es la estadística con la que se validaron las sondas, y marcar discrepancias entre el rendimiento observado y la presión de evaluación detectada.
- Auditoría de despliegues de terceros: instrumentar una instancia de Qwen3.6-27B ya en producción con un forward hook en la capa 42 para obtener una señal continua de eval-awareness sin reentrenar ni alterar los pesos.
- Investigación en consciencia situacional: usar las seis columnas como variables dependientes en experimentos que manipulan el prompt (presencia de criterios de evaluación, de logs, de código) y medir el efecto con una métrica barata y reproducible.
- Selección de datos de entrenamiento: puntuar grandes volúmenes de texto de tareas y filtrar o etiquetar aquellos tramos que, según la sonda, más se parecen a un marco de evaluación puntuada, para estudiar su efecto en el ajuste posterior.
- Red-teaming y control de alineamiento: integrar la puntuación como señal de disparo en un sistema de supervisión que active revisión humana cuando el tramo evaluado supere el control emparejado en más de un margen prefijado.
- Docencia y reproducibilidad en interpretabilidad: el artefacto completo son ~120 KB de tensores en float32 más metadatos, lo que permite reproducir el pipeline de puntuación en un cuaderno sin infraestructura adicional más allá del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, ni para las sondas ni para el modelo base. Los datos de validación que sí aporta la model card son los siguientes.

Correlación de Pearson a nivel de token entre sonda y juez, sobre 16 ítems retenidos y todos sus tokens:

| Objetivo | r |
|---|---|
| b2_eval | 0,58 |
| b2_monitored | 0,68 |
| b2align_eval | 0,49 |
| b2align_monitored | 0,63 |
| b27_eval | 0,74 |
| b27_monitored | 0,75 |

Elevación de la respuesta insertada respecto al mismo punto de la versión simple, media sobre los 16 ítems retenidos, pipeline del juez frente a sonda (media de 8 particiones, desviación típica entre particiones de 0,01 a 0,02):

| Creencia | Versión | Juez (b2) | Sonda (b2) |
|---|---|---|---|
| evaluado | sutil | −0,01 | −0,02 |
| evaluado | obvia | +0,06 | +0,06 |
| evaluado | muy obvia | +0,24 | +0,20 |
| monitorizado | sutil | −0,01 | −0,01 |
| monitorizado | obvia | +0,10 | +0,10 |
| monitorizado | muy obvia | +0,31 | +0,27 |

La lectura que se extrae de estos datos es que un atajo tentador por sí solo no mueve el estado del modelo, que un enunciado de que el trabajo será comprobado sí lo mueve y que un marco de tarea puntuada lo mueve con fuerza.

## Requisitos de hardware

- Sondas: 30.726 parámetros en float32, unos 120 KB en disco; el producto matricial por token y por las seis columnas son ~61.000 FLOPs, ejecutable en CPU en microsegundos.
- Requisito dominante: hay que ejecutar Qwen3.6-27B en bf16 para obtener el estado oculto del bloque 42. Son ~54 GB solo de pesos (2 bytes × 27 × 10⁹) más activaciones y caché KV.
- GPU recomendadas para el modelo base en bf16: una A100 80 GB o una H100 80 GB en un solo dispositivo; en multi-GPU, `device_map="auto"` con dos A100 40 GB o dos RTX 6000 Ada 48 GB.
- GPU de consumo: una RTX 4090 de 24 GB no admite el modelo en bf16; hacen falta cuatro RTX 4090 (96 GB agregados) o una configuración equivalente con paralelismo de tensores. Con cuantización a 8 bits (~27 GB) sigue sin caber en 24 GB; a 4 bits (~14 GB) cabría, pero no hay validación documentada de las sondas sobre activaciones de un modelo cuantizado.
- Memoria de estados ocultos: conviene usar un forward hook en la capa 42 en lugar de `output_hidden_states=True`, que retiene los 43 estados (a 5.120 dimensiones en bf16, unos 10 KB por capa y token).
- Despliegue: la ruta de referencia es transformers con la plantilla de chat estándar; vLLM y TGI sirven el modelo base pero no exponen de forma directa el flujo residual por capa, así que para las sondas se necesita acceso al estado oculto (transformers o un hook propio).
- Latencia y throughput: no disponible. La model card solo cuantifica el coste relativo de la sonda (~10⁴ FLOPs por token frente a ~5 × 10¹⁰ de un paso del 27B), que la hace despreciable frente a la inferencia del modelo base.

## Comparativa con modelos similares

No se dispone de otras sondas públicas directamente comparables en la información proporcionada; la comparación relevante es contra el pipeline pesado que estas sondas imitan.

| Artefacto | Tipo | Parámetros | Coste por token | Resultado documentado | Licencia |
|---|---|---|---|---|---|
| Sonda de este repositorio (`b27_eval` / `b27_monitored`) | Ridge lineal sobre estado oculto de la capa 42 | 30.726 | ~10⁴ FLOPs | r = 0,74 / 0,75 frente al juez | Apache 2.0 |
| NLA `b27` (profesor) | Autoencoder en lenguaje natural + juez LLM | no disponible (profesor de 27B) | nota en lenguaje natural y lectura por juez | objetivo de referencia de dos de las columnas | no disponible |
| NLA `b2` | Estudiante destilado de 2B | ~2 × 10⁹ (denominado "2B" en la model card) | no disponible | r = 0,58 / 0,68 para la sonda que lo imita | no disponible |
| NLA `b2-align` | Estudiante destilado de 2B alineado | ~2 × 10⁹ (denominado "2B" en la model card) | no disponible | r = 0,49 / 0,63 para la sonda que lo imita | no disponible |

## Limitaciones y advertencias

- Una sola capa (42), un solo modelo (Qwen3.6-27B) y un solo formato de prompt: los pesos no transfieren a otros modelos ni a otras capas.
- Entrenadas sobre texto de tareas en inglés en tres dominios (issues de GitHub, foros de operaciones y peticiones de datos); el comportamiento sobre otro tipo de texto no está probado.
- No se han probado sobre los tokens generados por el propio modelo ni sobre tokens de system prompt, solo sobre tokens del turno de usuario.
- El objetivo es lo que dicen una sonda que escribe notas y un juez, no la verdad de fondo sobre la creencia del modelo; la señal hereda los sesgos de ese pipeline.
- La puntuación no es plana a lo largo de un texto: texto de respuestas humanas al final de un hilo puntúa más alto en "monitorizado" que logs o código, incluso sin nada sospechoso. No se debe aplicar un umbral a un token suelto ni a la media de todo el texto; la estadística validada es emparejada (media de un tramo menos media de un tramo de igual longitud en un texto de control).
- La regularización ridge comprime los extremos: la sonda infravalora los casos más fuertes en torno a un 15 %.
- El conjunto de datos de entrenamiento (TwinTempt v1.1) es privado, lo que limita la reproducción exacta del ajuste.
- Riesgo de alucinación del propio modelo base no evaluado en este repositorio; las sondas no filtran ni corrigen las salidas del modelo.
- La licencia Apache 2.0 cubre este repositorio; la licencia y las condiciones de uso comercial del modelo base Qwen3.6-27B no constan en la información disponible y deben verificarse por separado.
- El tamaño de repositorio mostrado por HuggingFace es 0.0 GB (redondeo), coherente con los ~120 KB de los tensores declarados; descargas y likes registrados: 0.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/adamjb111/qwen3.6-27b-L42-evalaware-ridge-probes-20261026
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.6-27B
- Papers, blogs, repositorios de código o demos adicionales: no disponible en la información proporcionada.
