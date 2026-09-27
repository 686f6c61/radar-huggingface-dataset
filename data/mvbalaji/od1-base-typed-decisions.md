# mvbalaji/od1-base-typed-decisions

## Resumen

OD-1 Base (typed-decisions) es un modelo de decisión de 4B parámetros publicado por el usuario mvbalaji bajo el paraguas del proyecto OpenDecide. No es un generador de texto al uso: recibe un *estado* (texto o JSON) junto con preguntas tipadas (`choice` para elección entre opciones, `noul` para sí/no y `score` para valores ordinales) y devuelve cada respuesta acompañada de su distribución de probabilidad completa, además de un resultado explícito `NOT_ANSWERABLE` cuando no puede responder. La salida sigue la forma `/v1/systemone` de Jev / TypeSafe.

El modelo parte del backbone Qwen3.5-4B, un transformer híbrido que combina capas de atención completa con capas de gated delta-rule (atención lineal), y se ha ajustado de forma supervisada sobre el split de entrenamiento del benchmark typed-decisions, con parada temprana sobre un 10% reservado. El autor lo clasifica explícitamente como *especialista*: sus métricas deben compararse con otros modelos ajustados, no con modelos zero-shot.

Su relevancia actual está en el nicho de decisiones estructuradas y calibradas para flujos de trabajo concretos (trazas de agentes, atención al cliente, facturas e incidentes de seguridad), donde interesa más una distribución de probabilidad auditable que texto libre. En el conjunto de test de typed-decisions alcanza una exactitud de 0,796 (n=2000), por encima de las referencias publicadas en la tarjeta del benchmark, aunque el propio autor advierte que esa cifra mide en parte el acuerdo con el profesor de etiquetado del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido sobre backbone Qwen3.5-4B: mezcla capas de atención completa con capas de gated delta-rule (atención lineal); cabeza de decisión tipada |
| Parametros totales | 4B (según el título de la model card y el modelo base Qwen/Qwen3.5-4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en el checkpoint publicado; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline declarado | text-classification |
| Modelo base | Qwen/Qwen3.5-4B (fine-tune) |
| Formato de salida | Jev / TypeSafe `/v1/systemone` (respuestas con distribución de probabilidad y `NOT_ANSWERABLE`) |
| Tamaño del repositorio | 11,3 GB (incluye el modelo Nano en `nano/` y `cascade.json`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El backbone es Qwen3.5-4B, cuya particularidad es mezclar capas de atención completa con capas de gated delta-rule (atención lineal). Esto tiene una consecuencia práctica importante en despliegue: si no se instalan los kernels rápidos `flash-linear-attention==0.5.2` y `causal-conv1d==1.7.0`, `transformers` cae silenciosamente a una implementación de referencia en PyTorch puro y una petición de una sola pregunta pasa de unos pocos milisegundos a cientos de milisegundos. Sobre ese backbone se añade una cabeza de decisión que produce, para cada pregunta tipada, una distribución sobre sus opciones (de 2 a 24 opciones en el benchmark) más un resultado de no respondible.

El ajuste se realizó sobre el split TRAIN del benchmark typed-decisions, con parada temprana evaluada sobre un 10% reservado de ese mismo split. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El repositorio incorpora además un mecanismo de *hand-off* autocontenido: incluye el modelo Nano correspondiente en `nano/` y un `cascade.json` ajustado, con dos modos. En el modo *two-model*, el Nano responde primero y la petición escala al modelo base cuando la confianza mínima por pregunta del Nano baja de 0,6. En el modo *self-exit*, este modelo responde primero en su salida de la capa 8 y ejecuta su profundidad completa si la confianza mínima de esa salida temprana baja de 0,6. El modo por defecto es *self-exit*, y los umbrales se ajustaron únicamente sobre datos de validación.

## Capacidades

- Decisión tipada sobre un estado de entrada (texto o JSON) con tres tipos de pregunta: `choice` (elección entre opciones), `noul` (sí/no) y `score` (ordinal).
- Devolución de distribuciones de probabilidad completas por respuesta, no solo la etiqueta ganadora, lo que permite umbrales de confianza y análisis de calibración.
- Resultado explícito `NOT_ANSWERABLE`, es decir, abstención declarada en lugar de forzar una respuesta.
- Encadenado (*cascade*) interno con un modelo Nano incluido en el repositorio, con escalado por umbral de confianza en dos variantes (two-model y self-exit).
- Salida compatible con la forma `/v1/systemone` de Jev / TypeSafe.
- Ejecución con CUDA graphs habilitables (`enable_cuda_graphs()`), pensada para baja latencia en batch-1.
- Capacidad multilingüe: no disponible; el modelo está declarado únicamente para inglés.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia, se formula una pregunta `choice` con las opciones de equipo (por ejemplo, facturación o técnico) y el modelo devuelve la opción ganadora junto con su confianza. El *smoke test* incluido en la model card muestra exactamente este caso, con una confianza de 0,973 para la ruta de facturación.
- Priorización de urgencia en atención al cliente: usando preguntas de tipo `score`, el modelo asigna un valor ordinal de urgencia (el ejemplo documentado devuelve 2 con confianza 0,522), lo que permite enrutar por niveles en lugar de por texto generado.
- Extracción de decisiones en facturas: sobre el JSON de una factura se pueden plantear preguntas cerradas (¿requiere revisión manual?, ¿a qué centro de coste corresponde?) y obtener la distribución de probabilidad asociada para auditar el automatismo.
- Triaje de incidentes de seguridad: clasificación cerrada de severidad y tipo de incidente sobre la descripción del evento, aprovechando la abstención explícita cuando la información es insuficiente para decidir.
- Análisis y anotación de trazas de agentes: dado el historial de un agente, responder preguntas tipadas sobre qué hizo o qué debió hacer, con distribución de probabilidad utilizable para medir acuerdo entre anotadores.
- Despliegue en cascada de bajo coste: activar el modo *two-model* para que el Nano resuelva la mayoría de peticiones y escalar al modelo base solo cuando la confianza mínima cae por debajo de 0,6 (en validación, la cascada escala el 98,3% de las peticiones, dato que conviene tener en cuenta al dimensionar).
- Servicio de decisión de baja latencia en bucle cerrado: con CUDA graphs habilitados, una petición corta de una sola pregunta se resuelve en torno a 10,7 ms p50 en una H100, lo que permite integrarlo en un pipeline interactivo.
- Control de calidad con calibración: comparar la confianza devuelta con el resultado real para fijar umbrales de revisión humana por debajo de los cuales la decisión se deriva a una persona.

## Benchmarks y rendimiento

Resultados en el conjunto de test de typed-decisions (2.000 decisiones, mismas muestras fijas para todos los sistemas, semilla 0; Jev 1.13 medido el 25/09/2026). Exactitud:

| Conjunto de test | Este modelo | Jev 1.13 | Laya | Laya typed-decisions | Tev1-4B | CLM-8B |
|---|---|---|---|---|---|---|
| typed-decisions | 0.796 (n=2000) | 0.741 | 0.353 | 0.737 | 0.690 | 0.393 |

Métricas de calibración sobre el mismo split de test, calculadas con las fórmulas de la tarjeta del benchmark (KL desde el *soft gold* y Brier verificados contra las filas de referencia de la tarjeta):

| Modelo | Exactitud | KL | Brier | Tipo |
|---|---|---|---|---|
| OD-1 Base typed-decisions | 0.796 | 0.082 | 0.045 | especialista |
| TypeSafe Jev 1.13 | 0.727 | 1.442 | 0.148 | generalista |
| meraGPT Decider 1 | 0.768 | 0.096 | 0.052 | generalista |

Resultados de la cascada incluida en el repositorio:

| Configuración | Validación | Test (typed-decisions) |
|---|---|---|
| Nano solo | 0.765 | no disponible |
| Este modelo solo | 0.827 | no disponible |
| Two-model | 0.825 (98,3% de peticiones escaladas) | 0.795 |
| Self-exit con tau 0.6 | 0.825 (98,3% escaladas) | 0.796 |

Latencia p50 en una H100 80GB HBM3, bf16, peticiones batch-1 y CUDA graphs activados:

| Estado / preguntas | Este modelo (p50 ms) | Laya typed-decisions, todas las preguntas en una llamada (p50 ms) |
|---|---|---|
| Corto (≤64 tokens) / 1 | 10.7 | 15.9 |
| Corto (≤64 tokens) / 5 | 26.3 | 17.9 |
| Corto (≤64 tokens) / 20 | 95.3 | 21.4 |
| Medio (200-400 tokens) / 1 | 15.6 | 16.9 |
| Medio (200-400 tokens) / 5 | 73.4 | 17.7 |
| Medio (200-400 tokens) / 20 | 126.1 | 41.4 |

La model card indica además que, en ese mismo equipo, una petición corta de una sola pregunta tarda unos 35 ms sin CUDA graphs y unos 6 ms con ellos, y que otras GPU dan cifras distintas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de conocimiento general en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 8 GB solo para los pesos de 4B (estimación aritmética a partir del número de parámetros), más cachés de activaciones y memoria de los kernels; el repositorio completo ocupa 11,3 GB porque incluye el modelo Nano y artefactos adicionales.
- GPU recomendadas: el autor ha validado el modelo en una NVIDIA H100 80GB HBM3 con bf16, que es la configuración de referencia de todas las cifras de latencia publicadas. No se documentan pruebas en A100, RTX 4090 ni otras GPU.
- Encaje en GPU de consumo: no disponible en la información proporcionada. Por tamaño de parámetros un modelo de 4B en bf16 queda dentro de los 24 GB de una RTX 4090, pero no hay confirmación del autor para esta arquitectura híbrida ni cifras de latencia medidas.
- Kernels obligatorios para un rendimiento razonable: `flash-linear-attention==0.5.2` y `causal-conv1d==1.7.0` (este último se compila contra la versión de torch y CUDA instaladas y requiere `nvcc`). Sin ellos, `transformers` cae a la implementación de referencia en PyTorch y la latencia se dispara a cientos de milisegundos por pregunta.
- Entorno probado: torch 2.14.0+cu130, transformers 5.17.0, flash-linear-attention 0.5.2 y causal-conv1d 1.7.0, con CUDA graphs habilitados y calentamiento previo (5 iteraciones) por forma de entrada.
- Inferencia en CPU: funciona, pero es lenta según la propia model card.
- Opciones de despliegue documentadas: carga directa con `transformers` y el paquete `od1` incluido en el repositorio (`OD1Model.load`, `OD1Cascade.load`), con `enable_cuda_graphs()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no se publican cifras de tokens por segundo ni de peticiones concurrentes; solo latencias p50 en batch-1.

## Comparativa con modelos similares

Los únicos comparables con datos en la información disponible pertenecen al propio benchmark typed-decisions. No hay ficha técnica (parámetros, contexto, licencia) de las alternativas, por lo que esos campos quedan como no disponibles.

| Modelo | Exactitud (typed-decisions) | KL | Brier | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OD-1 Base typed-decisions | 0.796 | 0.082 | 0.045 | 4B | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| TypeSafe Jev 1.13 | 0.741 (0.727 en la tarjeta del benchmark) | 1.442 | 0.148 | no disponible | no disponible | no disponible | no disponible |
| meraGPT Decider 1 | 0.768 | 0.096 | 0.052 | no disponible | no disponible | no disponible | no disponible |
| Laya | 0.353 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Laya typed-decisions | 0.737 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Tev1-4B | 0.690 | no disponible | no disponible | 4B (por el nombre) | no disponible | no disponible | no disponible |
| CLM-8B | 0.393 | no disponible | no disponible | 8B (por el nombre) | no disponible | no disponible | no disponible |

En términos de calibración, OD-1 Base mejora el Brier de las dos referencias publicadas en la tarjeta (0,045 frente a 0,148 de Jev 1.13 y 0,052 de meraGPT Decider 1) y queda por delante en exactitud y KL frente a Jev 1.13, mientras que en KL está ligeramente por detrás de meraGPT Decider 1 (0,082 frente a 0,096 a favor de OD-1). El propio autor indica que no se ejecutó ninguna referencia de LLM frontera y que las líneas base se invocaron mediante una interfaz envuelta en opciones, lo que puede infravalorarlas.

## Limitaciones y advertencias

- Modelo ajustado a cuatro flujos de trabajo (trazas de agentes, atención al cliente, facturas e incidentes de seguridad). Fuera de ellos el autor recomienda usar `od1-base` en lugar de este checkpoint.
- Su puntuación en typed-decisions (0,796) está por encima de la línea de saturación aproximada de 0,75 que indica la tarjeta del benchmark, lo que significa que la métrica mide en parte acuerdo con el profesor de etiquetado del dataset, no capacidad general de decisión.
- Solo inglés. No hay soporte declarado para otros idiomas.
- Las líneas base se llamaron a través de una interfaz envuelta en opciones (Laya también de forma nativa en su checkpoint typed-decisions), lo que puede infravalorar sus resultados; no se ejecutó ninguna referencia de LLM frontera.
- Riesgo de alucinación: el diseño mitiga el problema forzando distribuciones de probabilidad y un resultado `NOT_ANSWERABLE`, pero las confianzas están calibradas contra el profesor de etiquetado, por lo que una confianza alta no equivale necesariamente a corrección factual en dominios fuera de los cuatro flujos previstos.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al depender de un dataset etiquetado, hereda los sesgos de ese proceso de etiquetado, cuyo detalle no se proporciona.
- Longitud de contexto: no disponible. No se puede planificar con garantías el uso de estados largos.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar por separado las condiciones del modelo base Qwen/Qwen3.5-4B y de los datos de entrenamiento: la model card proporcionada se corta en la sección "Training data and lice...", por lo que la información sobre datos y licencia de los mismos está incompleta.
- Rendimiento muy dependiente del entorno: sin los kernels `flash-linear-attention` y `causal-conv1d` instalados, `transformers` usa una implementación lenta y la latencia pasa de milisegundos a cientos de milisegundos por pregunta.
- Las cifras de latencia publicadas corresponden a una H100 80GB con bf16, batch-1 y CUDA graphs; no son extrapolables a otras GPU.
- En el modo *two-model* validado, el 98,3% de las peticiones acaban escalando al modelo base, por lo que el ahorro de coste de la cascada puede ser limitado en la práctica.
- Adopción nula hasta la fecha: 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- Fechas de creación y actualización del repositorio: 26 de septiembre de 2026.

## Enlaces

- HuggingFace: https://huggingface.co/mvbalaji/od1-base-typed-decisions
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo del proyecto: no disponible.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos trataban sobre el reinicio de televisores EdenWood y no guardan relación con OD-1, por lo que se omiten.
