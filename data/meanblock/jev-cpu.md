# Meanblock/JEV-CPU

## Resumen

JEV-CPU es una adaptación para CPU del motor de decisión SemIf (anteriormente OpenJev), publicada por el usuario Meanblock sobre el modelo base Qwen/Qwen3-0.6B. No es un modelo entrenado desde cero, sino un motor de inferencia que convierte decisiones discretas en una elección entre opciones tipadas: dado un estado no estructurado, un criterio definido en tiempo de ejecución y una lista de opciones con letra asignada, devuelve la probabilidad de cada opción leyendo directamente los logits de un único paso forward, sin generar ni un solo token de texto.

El problema que resuelve es el de las microdecisiones dentro de pipelines de agentes: enrutar una petición, decidir si se reintenta una operación, clasificar la severidad de un incidente o valorar si la evidencia respalda una afirmación. El proyecto original de SemIf exige una GPU CUDA con un modelo de 4B en BF16; JEV-CPU mantiene el mismo código de puntuación sin modificaciones y solo sustituye el cargador del modelo por una versión en CPU con precisión float32, ocupando aproximadamente 2,4 GB de memoria.

Su relevancia actual radica en que demuestra un patrón de decisión alternativo a la generación de texto: sin bucles de decodificación, sin reparación de JSON y sin muestreo, con una latencia dominada por el prefill (en torno a 1 segundo por decisión en el PoC publicado). El repositorio declara licencia MIT y el pipeline `zero-shot-classification`, y se acompaña de una interfaz web y de un informe técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso heredado del modelo base Qwen/Qwen3-0.6B; el proyecto aporta una capa de decisión sobre logits, no una arquitectura nueva |
| Parametros totales | Aproximadamente 0,6 B (modelo base Qwen/Qwen3-0.6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (fp32) en la implementación de CPU; no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | MIT (repositorio); el modelo base Qwen/Qwen3-0.6B queda sujeto a su propia licencia |
| Formato de pesos | no disponible (tamaño del repositorio: 0,0 GB; los pesos se cargan desde Qwen/Qwen3-0.6B) |

Otros datos declarados: pipeline `zero-shot-classification`, librería `transformers`, 0 descargas y 1 like en el momento de la consulta, fecha de creación y última actualización 2026-09-19.

## Arquitectura y entrenamiento

El proyecto no documenta ningún proceso de entrenamiento ni de ajuste fino. Se trata de una adaptación de inferencia: JEV-CPU reutiliza el código de puntuación original de SemIf (`direct.py` / `shared.py`) sin modificarlo y solo reemplaza el cargador del modelo (`semif_cpu.py`), que pasa de `bfloat16` sobre `cuda:0` a `float32` sobre CPU. El resto del camino es agnóstico al dispositivo, ya que sigue `device = next(model.parameters()).device` y la única llamada específica de CUDA (`torch.cuda.synchronize`) está protegida por una comprobación de tipo de dispositivo.

La mecánica de decisión consta de cuatro pasos. Primero, cada opción se convierte en una letra mayúscula (A, B, C…) dentro de un único turno de chat con plantilla aplicada mediante `add_generation_prompt=True` y `enable_thinking=False`. Segundo, `_slot_ids()` verifica que cada letra se codifique como un único token y que ese token haga round-trip (`decode(encode("A")) == "A"`), garantizando un slot comparable y sin deriva multi-token. Tercero, se ejecuta una sola pasada forward y se toman únicamente los logits de la última posición. Cuarto, se recogen los logits de los slots de las opciones y se aplica softmax solo sobre ellos, devolviendo `option_logits` y `probabilities` condicionadas al conjunto declarado de opciones. Como innovación destacable, la decisión queda reducida a un argmax sobre un subconjunto del vocabulario, lo que elimina la varianza de la decodificación y hace que la latencia dependa del prefill y no de la longitud de la respuesta.

## Capacidades

- Clasificación zero-shot sobre opciones declaradas en la propia petición, con criterios que se fijan en tiempo de ejecución en lugar de venir codificados en el prompt del sistema.
- Lectura de probabilidades calibradas entre opciones (`option_logits` y `probabilities`), no solo de la opción ganadora.
- Ejecución completa en CPU sin GPU, cargando Qwen/Qwen3-0.6B en float32 con un consumo aproximado de 2,4 GB de memoria.
- Latencia del orden de 1 segundo por decisión en el PoC publicado, sin bucle de generación.
- Interfaz web incluida para introducir el estado, añadir criterios y leer la decisión.
- Un único motor aplicado a ocho dominios demostrados: soporte, moderación de contenido, triaje de revisiones de código, severidad de incidentes, intención de correo electrónico, cumplimiento normativo, riesgo de crédito y priorización de soporte.
- No hay soporte documentado de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito; el propio flujo desactiva el pensamiento (`enable_thinking=False`) para que el siguiente token sea directamente la letra de la opción.
- Capacidades multilingües: no disponibles en la información proporcionada, aunque dependen del modelo base.

## Casos de uso

- Enrutado de peticiones en atención al cliente: el motor recibe el mensaje del usuario como evidencia y una lista de colas o intenciones como opciones, y devuelve la probabilidad de cada una para dirigir el ticket al equipo correcto sin generar una respuesta de texto.
- Moderación de contenido: con la política como criterio y opciones del tipo permitir, revisar o bloquear, se obtiene una decisión binaria o ternaria trazable, con probabilidad asociada, ejecutable en el mismo servidor de aplicaciones sin GPU.
- Triaje de revisiones de código: a partir del diff y de la descripción del cambio, decidir entre aprobar, solicitar cambios o escalar a revisión humana, integrándolo como paso previo en un pipeline de integración continua.
- Clasificación de severidad de incidentes: dado el texto de una alerta, asignar el nivel de severidad declarado como opciones, de modo que el sistema de guardias reciba una etiqueta homogénea en lugar de una descripción libre.
- Detección de intención en correo electrónico: leer el cuerpo del mensaje y decidir si corresponde a una solicitud comercial, una incidencia, una factura o una consulta interna, alimentando un enrutador de bandejas.
- Comprobaciones de cumplimiento: aplicar una norma concreta como criterio y valorar si la evidencia la cumple, la incumple o requiere revisión, generando un registro auditable de la probabilidad asignada a cada opción.
- Evaluación de riesgo de crédito o de préstamo: usar las variables del expediente como evidencia y las bandas de riesgo como opciones, como paso de preclasificación antes de un modelo de scoring más costoso.
- Priorización de tickets de soporte: preguntas del estilo "¿la evidencia respalda esta afirmación?" o "¿conviene reintentar la operación?", resueltas en una pasada forward dentro de un bucle de agente, sin coste de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una latencia aproximada de 1 segundo por decisión en el PoC sobre CPU y el uso de memoria de aproximadamente 2,4 GB en float32; no se aportan métricas de precisión, exactitud ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM: no aplica para el modo documentado, que se ejecuta en CPU con precisión float32 y un consumo de memoria en torno a 2,4 GB.
- RAM: se recomienda disponer de al menos 3 GB libres para cargar el modelo en float32 y mantener el proceso de inferencia.
- GPU: no es necesaria. El motor es agnóstico al dispositivo y podría ejecutarse en GPU, pero la ruta documentada y verificada es CPU.
- GPU de consumo: el modelo cabe holgadamente en cualquier GPU de consumo (por ejemplo, series RTX 30/40) si se opta por ejecutarlo en GPU, aunque no es el escenario objetivo del proyecto.
- Opciones de despliegue: inferencia mediante la librería `transformers` en Python y la interfaz web propia del proyecto. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y el tamaño del repositorio (0,0 GB) sugiere que el paquete no incluye pesos propios.
- Latencia y throughput: aproximadamente 1 segundo por decisión en CPU según el PoC; no se publican cifras de throughput ni de latencia bajo carga concurrente.

## Comparativa con modelos similares

| Sistema | Parametros | Dispositivo | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JEV-CPU | ~0,6 B (Qwen3-0.6B) | CPU, float32 | no disponible | Logits y probabilidades sobre opciones | MIT (repo) | HuggingFace y GitHub |
| SemIf (proyecto original) | ~4 B en BF16 | GPU CUDA única | no disponible | Logits y probabilidades sobre opciones | no disponible | GitHub del proyecto original |
| Qwen3-0.6B en modo generativo | ~0,6 B | CPU o GPU | no disponible | Texto generado | sujeta a la licencia del modelo base | HuggingFace |

La comparación se limita a estas alternativas porque la información proporcionada no incluye métricas de rendimiento frente a otros clasificadores zero-shot ni frente a modelos de decisión especializados.

## Limitaciones y advertencias

- No se han publicado benchmarks de precisión, exactitud o robustez; el único dato de rendimiento es la latencia aproximada de 1 segundo por decisión.
- El repositorio no documenta ningún entrenamiento ni ajuste fino, por lo que la calidad de las decisiones depende por completo de las capacidades del modelo base Qwen/Qwen3-0.6B.
- El procedimiento exige que cada opción se mapee a un único token que haga round-trip; esto restringe el formato de las opciones y puede fallar con tokenizadores distintos o con etiquetas que se fragmenten en varios tokens.
- La decisión se restringe al conjunto de opciones declarado: si ninguna opción es correcta, el softmax seguirá asignando probabilidad entre las disponibles, sin mecanismo de abstención documentado.
- Riesgo de alucinación: al no generarse texto no hay invención de contenido, pero sí puede producirse una elección incorrecta o una probabilidad mal calibrada si el criterio está mal formulado.
- Idiomas soportados: no disponibles. No se declara cobertura multilingüe ni se especifica el comportamiento fuera del inglés.
- Licencia: el repositorio declara MIT, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen3-0.6B antes de un uso comercial, así como las de los pesos descargados aparte.
- El repositorio ocupa 0,0 GB, lo que sugiere que no contiene pesos propios; el despliegue depende de descargar el modelo base por separado.
- El proyecto se declara independiente y sin afiliación con el autor de SemIf, TypeSafe o Jev, según el aviso incluido en su propia model card.
- Tracción mínima en el momento de la consulta: 0 descargas y 1 like, con fechas de creación y actualización de 2026-09-19. Al tratarse de un proyecto muy reciente y con poca validación externa, no es recomendable usarlo en producción sin una evaluación propia.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo: los únicos resultados obtenidos corresponden a un sitio de viajes sin ninguna relación con este proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Meanblock/JEV-CPU
- Repositorio GitHub: https://github.com/leesk212/JEV-CPU
- Informe técnico: https://leesk212.github.io/JEV-CPU/
- Proyecto original SemIf (antes OpenJev): https://github.com/TheoLeeCJ/SemIf
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
