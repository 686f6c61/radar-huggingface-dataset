# pawanpaudel93/xr0-libero-fp16-ov

## Resumen

XR0 LIBERO fp16-ov es un paquete de política (policy package) en formato OpenVINO del modelo vision-language-action Xiaomi-Robotics-0-LIBERO, desarrollado originalmente por Xiaomi Robotics y convertido por el usuario pawanpaudel93. El paquete está pensado para el motor `ov-policy` de Cascadia (tipo `xr0`) y permite ejecutar la política robótica en CPUs y GPUs Intel, sin necesidad de PyTorch en el momento de la inferencia. El repositorio ocupa 9,2 GB y se distribuye con licencia Apache-2.0.

El modelo resuelve el problema de desplegar una política VLA entrenada para el benchmark LIBERO en hardware Intel con un grafo OpenVINO de precisión mixta: grafo en float32 con pesos en fp16, y el ruido interno del modelo sustituido por una entrada explícita `noise`. La interfaz es compacta: recibe un vector de estado de 8 dimensiones, dos imágenes RGB de 256x256 (vista base y muñeca izquierda) y una tarea en texto, y devuelve una secuencia de 30 acciones de 7 dimensiones.

Es relevante ahora porque demuestra la viabilidad de portar políticas VLA a OpenVINO con paridad funcional verificada frente al port de PyTorch de Intel en el benchmark `libero_spatial`, y porque abre la puerta a inferencia en GPUs integradas (se reportan resultados en una Arc 140V). La contrapartida es que el motor de servicio necesario aún no está en una release pública de Cascadia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language-action (política robótica); arquitectura interna del modelo base no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos) con grafo en float32; no se documentan otras variantes |
| Idiomas soportados | no disponible (la entrada de tarea es texto, pero no se especifican idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO (policy package para el motor `ov-policy` de Cascadia); no se distribuyen safetensors ni GGUF en este repo |

Entradas y salidas del grafo:

| Elemento | Tipo y forma |
|---|---|
| `state` | [8] |
| `images.base` | [3, 256, 256], uint8 RGB |
| `images.wrist_left` | [3, 256, 256], uint8 RGB |
| `task` | escalar (texto) |
| `noise` | entrada explícita (sustituye el ruido interno del grafo) |
| `action` | [30, 7] |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Xiaomi-Robotics-0-LIBERO (número de parámetros, composición del backbone de visión y lenguaje, datos de entrenamiento o uso de RLHF). Lo que sí se documenta es el proceso de conversión: Intel's exporter (physical-ai-studio, commit `8f132416`) generó un grafo OpenVINO en float32 con pesos en fp16, y se sustituyó el ruido generado dentro del grafo por una entrada `noise` externa, lo que permite controlar la estocasticidad de la política desde el cliente.

El modelo base está ajustado para LIBERO, un conjunto de benchmarks de manipulación robótica. La política produce chunks de 30 acciones de 7 grados de libertad a partir de observaciones visuales y de estado, con la instrucción de tarea como condicionamiento textual. La verificación de paridad se realizó contra el port de PyTorch de Intel, no contra el checkpoint original de Xiaomi, lo que se indica explícitamente como pendiente.

## Capacidades

- Generación de acciones robóticas: produce secuencias de 30 pasos con 7 dimensiones por acción a partir de estado e imágenes.
- Condicionamiento por lenguaje: acepta una instrucción de tarea en texto para guiar la política.
- Entrada visual multivista: procesa simultáneamente una cámara base y una cámara de muñeca izquierda a 256x256.
- Inferencia en CPU y GPU Intel mediante OpenVINO, sin dependencia de PyTorch en tiempo de ejecución.
- Control de estocasticidad: la entrada `noise` permite reproducir o variar muestreos de la política.
- Integración con el motor `ov-policy` de Cascadia (tipo `xr0`).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de políticas VLA en el benchmark LIBERO: el paquete permite reproducir `libero_spatial` con 10 tareas y 3 repeticiones, útil para comparar implementaciones sin depender de PyTorch.
- Despliegue en estaciones de trabajo Intel sin GPU dedicada: al ejecutarse en CPU mediante OpenVINO, permite probar políticas robóticas en portátiles y equipos de laboratorio convencionales.
- Prototipado en GPUs integradas: los resultados reportados en una Arc 140V (unos 232 ms por chunk de 30 pasos) lo hacen adecuado para bancos de pruebas de bajo coste.
- Validación de pipelines de conversión: sirve como referencia para verificar exportadores OpenVINO de modelos VLA, comparando salidas contra el port de PyTorch.
- Investigación en manipulación con instrucciones en lenguaje: permite estudiar cómo varía el comportamiento de la política con distintas formulaciones de tarea.
- Integración en simuladores y entornos de evaluación: el formato de entradas y salidas (estado, dos imágenes, tarea, ruido) encaja en bucles de control que consuman chunks de 30 acciones.
- Reproducibilidad de experimentos: la entrada `noise` explícita facilita fijar semillas y repetir ejecuciones en estudios comparativos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| LIBERO `libero_spatial` (10 x 3), Arc 140V GPU f16 | 27/30 | 27/30 del port de PyTorch de Intel (CPU f32) |
| Latencia por chunk de 30 pasos, Arc 140V GPU f16 | ~232 ms | no disponible para otras plataformas |
| Diferencia numérica frente al port de PyTorch de Intel | dentro de 3.2e-3 | — |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparación contra el modelo original de Xiaomi, que el autor indica como pendiente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 9,2 GB, lo que da una cota superior del peso en disco del paquete.
- GPU recomendadas: se han verificado resultados en una GPU Intel Arc 140V (integrada); no se documentan pruebas en A100, H100 ni RTX 4090.
- CPU: soportado mediante OpenVINO en procesadores Intel.
- Cabe en GPU de consumo: sí, al menos en GPUs integradas Intel Arc; no se confirma para GPUs discretas de otros fabricantes.
- Opciones de despliegue: motor `ov-policy` de Cascadia (`cascadia run ./xr0-libero-fp16-ov --engine ov-policy --device GPU`); se requiere una build de Cascadia con este tipo de política, aún no incluida en una release (en revisión en labscommunity/cascadia).
- Latencia y throughput: aproximadamente 232 ms por chunk de 30 acciones en Arc 140V con fp16; no se documentan cifras para CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento LIBERO spatial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xr0-libero-fp16-ov (este) | VLA en OpenVINO | no disponible | 27/30 (10 x 3) | Apache-2.0 | Hugging Face, requiere Cascadia en revisión |
| Xiaomi-Robotics-0-LIBERO (original) | VLA | no disponible | no disponible en esta información | no disponible en esta información | Hugging Face |
| Port de PyTorch de Intel | VLA en PyTorch | no disponible | 27/30 (10 x 3) | no disponible en esta información | no disponible como repo independiente en esta información |

No se dispone de datos suficientes para comparar con otras familias de políticas VLA (por ejemplo, OpenVLA u otras) en parámetros, contexto o rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- La comparación de paridad se hizo contra el port de PyTorch de Intel, no contra el checkpoint original de Xiaomi; la equivalencia con el modelo de origen está pendiente de verificar.
- El motor necesario (`ov-policy` de Cascadia, tipo `xr0`) no está en ninguna release pública: solo funciona con una build en revisión, lo que limita su uso en producción hoy.
- El paquete está especializado en LIBERO y en el entorno de manipulación para el que fue ajustado; no se documenta generalización a otras tareas o robots.
- Solo se ha verificado en una GPU Intel Arc 140V; el rendimiento en otras plataformas es desconocido.
- No se documentan sesgos, riesgos de alucinación ni comportamiento fuera de distribución para políticas robóticas; en robótica, los fallos de política pueden tener consecuencias físicas y requieren supervisión y límites de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero al ser una copia modificada del modelo base, conviene revisar también las condiciones del checkpoint original.
- El repositorio no incluye información sobre idiomas soportados en la instrucción de tarea ni sobre límites de longitud del texto de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pawanpaudel93/xr0-libero-fp16-ov
- Modelo base: https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-0-LIBERO
- Repositorio Cascadia (motor `ov-policy`): https://github.com/labscommunity/cascadia
- Exportador de Intel (physical-ai-studio, commit `8f132416`): no disponible como URL en la información proporcionada
