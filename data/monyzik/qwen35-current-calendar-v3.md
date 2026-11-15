# Monyzik/qwen35-current-calendar-v3

## Resumen

Monyzik/qwen35-current-calendar-v3 es un paquete de adaptadores LoRA publicado sobre el modelo base Qwen/Qwen3.5-0.8B (revision fijada `2fc06364715b967f1860aea9cf38778875588b17`). No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos PEFT que implementa un pipeline de extraccion de hechos y de informacion temporal en dos pasadas: una LoRA "primary" que extrae todos los atributos y una LoRA "current" que resuelve el estado vigente en cada turno de una conversacion. El autor lo presenta como sustituto de la version anterior `Monyzik/qwen35-states-calendar-v2`.

El modelo resuelve un problema muy concreto: dado un historial de llamadas con marcas temporales (`call_id`, `started_at`, `turns`), extraer hechos verificables, resolver su vigencia temporal y anclarlos a citas del texto fuente. El paquete incluye ademas un encoder de hechos congelado, una cabeza de fechas (date head, epoca 7), bloqueos de puntos fuente y validacion de esquema y citas. Segun la model card, el paquete completo almacena unos 0,931B de elementos de tensor compartiendo el modelo base.

La relevancia actual es limitada pero especifica: es un ejemplo de adaptacion de un modelo pequeno (0,8B) mediante LoRA para una tarea de extraccion estructurada con requisitos estrictos de JSON, y de como un pipeline de multiples componentes puede superar a un baseline en metricas de F1 de hechos y recall temporal. No obstante, la ausencia de licencia declarada, el numero de descargas (0) y las advertencias del propio autor sobre verificaciones pendientes limitan su uso en produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3.5-0.8B; pipeline de dos pasadas con encoder de hechos y date head |
| Parametros totales | no disponible (el paquete declara ~0,931B elementos de tensor almacenados con base compartida) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; los scripts usan `--max-input-tokens 16384` y `--max-new-tokens 4096` (primary) / `3072` (current) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | ru (ruso) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base se descarga por separado |

## Arquitectura y entrenamiento

El componente entrenado es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder de 0,8B parametros. El paquete no es un unico adaptador: contiene una LoRA "primary" (extraccion de todos los atributos) y una LoRA "current" (estado vigente por turno), seleccionada esta ultima en el checkpoint 400 de un entrenamiento SFT llamado `current-sft-v1`. Ademas se incluyen un encoder de hechos congelado que genera propuestas de hechos y una cabeza de fechas (date head, epoca 7), junto con politicas congeladas de seleccion de puntos fuente y validacion de esquema y citas.

El entrenamiento de la LoRA current consistio en 600 actualizaciones con acumulacion de gradiente 4, learning rate 1e-5, semilla 43 y objetivos exclusivamente "current". El checkpoint 400 se selecciono por perdida de respuesta antes de la generacion de desarrollo. La seleccion congelada uso 64 llamadas de calibracion del corpus original y otras 64 se puntuaron tras el congelado; esas cuentas se excluyeron del SFT current, aunque el adaptador padre original ya las habia visto. No se especifica el volumen total de tokens de entrenamiento ni la composicion del dataset. El autor indica que la inferencia completa requiere dos entornos Python separados (Qwen y Fact) y ejecutar cuatro scripts en secuencia: prediccion primary, prediccion current, propuesta de hechos y postprocesado.

## Capacidades

- Extraccion de hechos (fact extraction) a partir de transcripciones de llamadas con marcas temporales.
- Extraccion de informacion temporal: resolucion de intervalos de validez y estado vigente por turno.
- Generacion de respuestas JSON estrictas: la model card reporta 383 respuestas JSON estrictas sin truncamientos en la pasada current.
- Anclaje de citas (grounding): localizacion de spans en el texto fuente, con una metrica de grounding span del 94,56%.
- Validacion estructural y de esquema integrada en el pipeline (validador que retuvo todos los hechos, cero intervalos invalidos).
- Procesamiento por lotes: los scripts soportan `--batch-size 8` y limites de tokens por lote.
- Capacidades multilingues: limitadas al ruso segun los metadatos del repositorio.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Extraccion estructurada de hechos en actas de llamadas: el pipeline recibe `call_id`, `started_at` y `turns` y devuelve hechos con citas y esquema validado, adecuado para digitalizar registros de atencion telefonica en ruso.
- Resolucion de estado vigente en conversaciones multi-turno: la LoRA current determina que valor de un atributo esta activo en cada turno, util para auditar cambios de datos a lo largo de una llamada.
- Normalizacion temporal de registros: la cabeza de fechas y los bloqueos de puntos fuente permiten convertir expresiones temporales del texto en intervalos de validez, aplicable a sistemas de gestion documental.
- Generacion de datasets etiquetados: el pipeline puede usarse para producir hechos y citas de referencia sobre corpus no etiquetados, con validacion de esquema, como paso previo a revision humana.
- Investigacion en extraccion de informacion temporal: sirve como referencia reproducible de un pipeline de dos pasadas sobre un modelo de 0,8B, con scripts y hashes publicados.
- Prototipado de asistentes de analisis de conversaciones: con 16k tokens de entrada configurados en los scripts, puede procesar transcripciones largas en un solo lote.
- Entornos con recursos limitados: al ser un adaptador sobre un modelo de 0,8B, el coste de inferencia es bajo comparado con modelos de mayor tamano, aunque el pipeline exige dos entornos y varios componentes.

## Benchmarks y rendimiento

Datos de la validacion oficial reportados en la model card (evaluador 2.1, 383 llamadas, 1845 hechos de referencia):

| Metrica | Baseline del organizador | Este paquete |
|---|---:|---:|
| Precision de hechos | 33,48% | 48,35% |
| Recall de hechos | 38,05% | 57,07% |
| F1 de hechos | 35,62% | 52,35% |
| Recall temporal | 47,06% | 48,13% |
| Precision de estado | 53,45% | 55,38% |
| Grounding por turno | 78,35% | 78,25% |
| Grounding por span | n/a | 94,56% |

El autor indica 2178 predicciones y 1053 hechos emparejados; temporal 321/667 y estado 345/623. Se superan los umbrales de calidad declarados (45,06% y 51,45%) y las puntuaciones del baseline. Los denominadores temporales dependen de los hechos emparejados y difieren entre modelos, por lo que las cifras no son estrictamente comparables entre filas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con un modelo base de 0,8B, la inferencia en fp16 requiere aproximadamente 1,6 GB solo para pesos, mas overhead de activaciones y del encoder de hechos; en cuantizacion de 8 bits o 4 bits el consumo seria menor, pero no se documenta.
- GPU recomendadas: no especificadas. Un modelo de 0,8B cabe en GPUs consumer como RTX 3060, RTX 4060 o superiores; los scripts usan `--batch-size 8`, lo que aumenta el uso de memoria.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base, aunque el pipeline completo (dos pasadas, encoder de hechos y postprocesado) anade requisitos de memoria y de CPU.
- Opciones de despliegue: scripts propios del repositorio (`predict_qwen35_calendar.py`, `propose_current.py`, `postprocess.py`) con PEFT y dos entornos Python separados. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor senala que las mediciones de recursos y robustez quedan pendientes de verificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Monyzik/qwen35-current-calendar-v3 | ~0,8B base + LoRA | no disponible (scripts a 16k) | Extraccion de hechos y estado temporal en ruso | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | Modelo base generalista | no disponible | Hugging Face |
| Monyzik/qwen35-states-calendar-v2 | ~0,8B base + LoRA | no disponible | Version anterior del mismo pipeline | no disponible | Hugging Face (sustituido por v3) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (extraccion de hechos temporales en ruso) en la documentacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; es un bloqueo para produccion.
- El modelo solo declara soporte de ruso; no se documentan capacidades en castellano ni en otros idiomas.
- El pipeline no es un unico modelo: requiere el modelo base fijado a una revision concreta, dos LoRAs, un encoder de hechos, una cabeza de fechas y politicas congeladas; cualquier sustitucion invalida los resultados reportados.
- El autor advierte que los requisitos de reduccion de recursos, benchmark CPU/GPU y ruido adversarial no se han verificado por completo; las puertas de calidad no garantizan el cumplimiento de todos los entregables.
- Los denominadores de las metricas temporales dependen de los hechos emparejados y difieren entre modelos, lo que limita la comparacion directa.
- Riesgo de alucinacion inherente a un modelo de 0,8B en tareas de extraccion; la validacion de esquema y citas mitiga pero no elimina errores.
- La seleccion congelada uso 64 llamadas del corpus original que el adaptador padre ya habia visto, lo que puede introducir sesgo de evaluacion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a entradas ruidosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Monyzik/qwen35-current-calendar-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Version anterior: https://huggingface.co/Monyzik/qwen35-states-calendar-v2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
