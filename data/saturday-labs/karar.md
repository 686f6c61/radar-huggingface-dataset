# saturday-labs/karar

## Resumen

karar es un modelo de clasificación de texto en turco desarrollado por saturday-labs, especializado en la toma de decisiones sobre mensajes de clientes bancarios. A partir de un mensaje escrito por un cliente, el modelo emite simultáneamente varias decisiones etiquetadas con su probabilidad asociada: qué unidad de negocio debe atender la solicitud (20 categorías bancarias), qué operación concreta desea el cliente (376 intenciones), si se requiere una herramienta o API, si hace falta consentimiento explícito, si se exige autenticación fuerte, si existe riesgo alto y si el caso debe escalarse a un humano.

El modelo parte de ytu-ce-cosmos/modernbert-tr-base, un codificador ModernBERT en turco, y añade una cabeza de decisión tipo KV sobre la que se definen preguntas en tiempo de ejecución. Tiene aproximadamente 169 millones de parámetros y se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que permite ejecutarlo en infraestructura propia sin que los mensajes de los clientes salgan del entorno de la organización.

Su relevancia radica en el enfoque: al no generar texto libre, no produce respuestas inventadas ni salidas que haya que parsear, y cada decisión viene acompañada de una probabilidad que la entidad puede comparar con umbrales propios. El autor lo compara con Jev, una API comercial cerrada, sobre un conjunto de evaluación propio, con ventaja en quejas reales de clientes y preguntas trampa, y empate estadístico en el conjunto bancario y en un esquema nuevo. Está creado y actualizado el 3 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador ModernBERT (transformer encoder) con cabeza de decision; no es una clase estandar de transformers, requiere `inference.py` con `KV2Agent` |
| Parametros totales | ~169 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio distribuye pesos en safetensors |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | ytu-ce-cosmos/modernbert-tr-base (ajuste fino) |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 0,7 GB |
| Requisitos de ejecucion | torch, transformers>=4.48, safetensors, huggingface_hub |

## Arquitectura y entrenamiento

La arquitectura combina un codificador ModernBERT preentrenado en turco (ytu-ce-cosmos/modernbert-tr-base) con una cabeza de decisión que no genera texto, sino que devuelve una opción elegida y un vector de probabilidades por pregunta. Las preguntas, las opciones y los criterios se definen en tiempo de ejecución y se pasan al modelo junto con el mensaje del cliente, de modo que cambiar el esquema de decisión no obliga a reentrenar. El modelo se invoca mediante la clase `KV2Agent` incluida en el repositorio, con la disposición de entrada "pregunta primero" por defecto.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Sí describe las dimensiones del problema sobre el que se ha optimizado: 20 categorías de área bancaria y 376 intenciones de cliente, además de siete decisiones binarias o probabilísticas (herramienta/API, consentimiento explícito, autenticación fuerte, riesgo alto, escalado a humano). El autor destaca como decisión de diseño la ausencia de generación de texto libre, lo que elimina el riesgo de alucinación y la necesidad de parsear salidas.

## Capacidades

- Clasificación de área bancaria en 20 categorías: cuenta, transferencia, FAST, transferencia internacional y divisas, tarjeta de crédito, seguridad de tarjeta, créditos, inversión, divisas y metales preciosos, seguros/BES, facturas, impuestos y pagos públicos, banca abierta, cheques/pagarés/POS, banca digital y seguridad, soporte/reclamaciones, entre otras.
- Clasificación de intención entre 376 operaciones de cliente (por ejemplo, disputa de un cargo en tarjeta, notificación de fraude, EFT, cierre de cuenta, solicitud de crédito, orden de pago automático).
- Decisiones secundarias con probabilidad: si se necesita herramienta o API, si hace falta consentimiento explícito, si se exige autenticación fuerte, si hay riesgo alto y si debe escalarse a un humano.
- Definición de preguntas personalizadas en tiempo de ejecución, incluidas preguntas de sí/no, sin reentrenamiento.
- Salida con probabilidades calibradas por decisión, apta para aplicar umbrales de automatización.
- Multilingüismo: únicamente turco.
- No genera texto libre, por lo que no soporta redacción, resumen ni diálogo generativo.
- No se documenta soporte de tool calling en el sentido de invocar funciones; la decisión "herramienta/API necesaria" es una etiqueta probabilística, no una llamada ejecutada.

## Casos de uso

- Enrutado automático de mensajes y reclamaciones a la unidad correcta: el modelo predice la categoría bancaria entre 20 opciones, lo que permite asignar el ticket al equipo adecuado sin lectura manual previa.
- Capa de detección de intención para chatbots y asistentes de voz bancarios: la predicción entre 376 intenciones alimenta el flujo de diálogo y evita que el bot responda fuera de dominio.
- Triaje y priorización en centros de llamadas y solicitudes de sucursal: las etiquetas de riesgo alto y escalado a humano permiten ordenar la cola y reservar agentes para los casos críticos.
- Marcado de fraude y solicitudes de riesgo: la decisión de riesgo alto y la intención de notificación de fraude sirven como señal previa para derivar a revisión humana.
- Activación de políticas de consentimiento y autenticación: con las probabilidades de consentimiento explícito y autenticación fuerte se puede disparar una petición de OTP o una confirmación adicional en operaciones sensibles.
- Automatización con umbral de confianza: los casos con alta probabilidad se resuelven de forma automática y los de baja probabilidad se derivan a un agente, usando las probabilidades devueltas como criterio de decisión.
- Extracción de señal estructurada sobre corpus históricos de mensajes: al ser un clasificador sin generación, permite etiquetar grandes volúmenes de mensajes en lotes para analítica y monitorización.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. Comparación con Jev (API comercial cerrada) sobre los mismos ejemplos, pregunta de selección única por fila y las mismas opciones para todos los modelos. En conjuntos de n≈100 el margen de error es de ±8-10 puntos.

| Conjunto | karar | Jev |
|---|---|---|
| Quejas reales de clientes | 85,0 | 63,1 |
| Preguntas trampa dificiles | 94,6 | 78,3 |
| Conjunto bancario | 90,3 | 85,7 |
| Conjunto bancario, esquema nuevo | 78,0 | 79,7 |
| Banking77 (924 ejemplos, 77 opciones), top-1 | 71,3 | 74,5 |
| Banking77, top-5 | 93,8 | 92,2 |
| Banking77 (100 ejemplos) | 73,0 | 76,0 |

Según el autor, las diferencias en quejas reales y preguntas trampa son estadísticamente significativas (p<0,001), mientras que en el conjunto bancario y en el esquema nuevo el rendimiento es equivalente (p>0,05). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la información disponible; el propio autor indica que en tareas generales (CLINC150, MASSIVE) Jev es claramente superior y que ese no es el objetivo del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 169 millones de parámetros, el peso en fp32 ocupa aproximadamente 0,68 GB y en fp16/bf16 alrededor de 0,34 GB. Con memoria de activaciones y overhead de runtime, cabe holgadamente por debajo de 2 GB de VRAM. No se publican medidas de latencia ni de throughput.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; una RTX 4090 o similar deja margen amplio para procesamiento por lotes. Para servicio concurrente a gran escala, A100 o H100 permiten agrupar lotes grandes, aunque no son necesarias por tamaño de modelo.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna (RTX 3060, 4060, 4090, e incluso inferencia en CPU para volúmenes moderados).
- Opciones de despliegue: al no ser una clase estándar de transformers, el repositorio requiere `inference.py` con la clase `KV2Agent` sobre torch y transformers>=4.48. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI en la información disponible. El repositorio está marcado como compatible con endpoints.
- Latencia y throughput: no disponible en la información proporcionada. El autor describe el modo de funcionamiento como "una sola pasada hacia delante, sin generación de texto", lo que en principio reduce el coste frente a modelos generativos de tamaño comparable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento documentado |
|---|---|---|---|---|---|
| karar | ~169M | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace | 85,0 en quejas reales; 94,6 en preguntas trampa; 90,3 en conjunto bancario |
| Jev (API comercial cerrada) | no disponible | no disponible | Propietaria, API de pago | Solo API | 63,1 en quejas reales; 78,3 en preguntas trampa; 85,7 en conjunto bancario |
| ytu-ce-cosmos/modernbert-tr-base | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Pesos abiertos en HuggingFace | Modelo base sin ajuste para decisiones bancarias; sin resultados de esta tarea |

No se dispone de datos sobre otros clasificadores de intención bancaria en turco comparables en la información proporcionada, por lo que la comparativa se limita a los dos términos usados en la propia model card (Jev) y al modelo base. Advertencia: los datos de Jev proceden exclusivamente de las mediciones del autor de karar, no de una evaluación independiente.

## Limitaciones y advertencias

- Alcance restringido: el modelo está optimizado para banca en turco. En tareas generales (CLINC150, MASSIVE, tareas multidisciplinares en turco) el propio autor reconoce que Jev es claramente superior.
- Sesgos no documentados: la model card no incluye análisis de sesgo demográfico, geográfico ni de género. Al estar entrenado sobre mensajes bancarios, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: bajo en el sentido clásico, porque el modelo no genera texto libre. Persiste el riesgo de clasificación errónea, especialmente en intenciones poco frecuentes o en mensajes ambiguos.
- Fiabilidad de la evaluación: los conjuntos con n≈100 tienen un margen de error de ±8-10 puntos, por lo que las diferencias pequeñas deben interpretarse con cautela. La prueba con 77 opciones de Banking77 no refleja el uso real, donde según el autor suelen manejarse entre 10 y 25 opciones.
- Idioma: solo turco. No hay soporte documentado para otros idiomas, lo que impide usarlo en atención multilingüe sin traducción previa.
- Longitud de contexto: no especificada, por lo que no se puede garantizar el tratamiento de mensajes largos (correos extensos, hilos de reclamación) sin truncado.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre exactitud en producción.
- Advertencia operativa del propio autor: en operaciones críticas (pagos, cierres, cambios de límite) no deben aplicarse las decisiones sin aprobación humana; las salidas de baja confianza deben derivarse a una persona y conviene validar con los mensajes propios de cada entidad.
- Madurez: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin validación externa conocida.
- Integración: no es una clase estándar de transformers, lo que complica el despliegue con servidores de inferencia habituales y obliga a usar el `inference.py` del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saturday-labs/karar
- Demo en vivo (Space del autor): https://huggingface.co/spaces/melikegks/karar
- Modelo base: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-base
- La búsqueda web no ha devuelto resultados relevantes sobre este modelo: los enlaces encontrados corresponden a foros de quejas de una aerolínea y a un evento tecnológico sin relación con el modelo.
