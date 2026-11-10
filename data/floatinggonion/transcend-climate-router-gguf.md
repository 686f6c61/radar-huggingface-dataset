# FloatinggOnion/transcend-climate-router-GGUF

## Resumen

Transcend Climate router es un modelo de lenguaje de 596 millones de parámetros, derivado de Qwen3-0.6B mediante un ajuste fino con LoRA, especializado en una única tarea: convertir peticiones en lenguaje natural sobre un mapa climático de África en un objeto JSON que la aplicación Transcend Climate valida y ejecuta. Lo desarrolla el usuario FloatinggOnion como componente del proyecto abierto Transcend Climate, un globo de monitorización climática centrado en Nigeria y África. El modelo no responde preguntas de clima: clasifica la intención (`act`, `explain`, `decline`) y emite llamadas a herramientas del mapa (capas, cámara, fechas, anotaciones, emisiones) o declina la petición.

Su relevancia está en el diseño: es un enrutador de function calling de tamaño mínimo (0,6B) pensado para ejecutarse en CPU con latencia de 1,5 s en dos hilos, y con una restricción explícita de que nunca genera cifras. Los datos numéricos los obtienen las herramientas de la app (NASA POWER, Climate TRACE) y los renderizan plantillas; cualquier explicación que contenga un dígito se descarta. Esto reduce el riesgo de alucinación factual a costa de limitar el modelo a una función muy concreta.

El modelo se publica en formato GGUF con dos cuantizaciones (Q8_0 y Q4_K_M) bajo licencia Apache 2.0, solo en inglés y sin historial de conversación. Está pensado para desplegarse con llama.cpp y salida restringida por esquema JSON, no como un asistente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B), ajuste fino con LoRA |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa un único mensaje sin historial) |
| Tipos de cuantización | Q8_0 (~640 MB), Q4_K_M (~400 MB) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y se ajusta con LoRA de rango 16 aplicado a los 12 bloques superiores. El entrenamiento se realizó con mlx-lm en un Apple M2. Los datos son sintéticos: preguntas generadas por plantilla sobre topónimos africanos con respuestas conocidas programáticamente, más reescrituras de esas preguntas producidas por Claude Sonnet 5.5. Las etiquetas se heredan siempre de la plantilla y nunca se generan con el modelo, lo que evita propagar errores de etiquetado. Solo se incluyen peticiones que el parser de reglas de la aplicación no resuelve por completo, porque son las únicas que el modelo verá en producción.

La innovación principal no es arquitectónica sino de integración: el modelo opera como enrutador restringido por un esquema JSON (definido en `server/nlp/router.js` de la app) y con un prompt de sistema fijo en el que las herramientas y los identificadores de capa están codificados en los pesos. La instrucción del autor es no usar `--reasoning-budget 0`, ya que altera el final del prompt con el que se entrenó. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Clasificación de intención en tres categorías: `act` (ejecutar herramientas del mapa), `explain` (explicación de uno o dos enunciados sobre un concepto climático o una capa) y `decline` (cualquier otra petición).
- Function calling para herramientas del mapa: gestión de capas (`set_layers`), movimiento de cámara (`fly_to`), fecha, mapas base, anotaciones, emisiones y tarjeta climática.
- Emisión de un único objeto JSON validable contra esquema, con soporte de salida restringida en llama.cpp.
- Comprensión de topónimos africanos y del estado de la aplicación inyectado en el prompt (`<state>` con fecha, capas activas y país).
- Explicaciones sobre una lista fija de aproximadamente 40 conceptos climáticos.
- No genera cifras: la aplicación descarta cualquier explicación que contenga un dígito.
- Sin capacidades multilingües (solo inglés), sin visión, sin audio, sin historial de conversación y sin razonamiento multi-paso más allá de la selección de una o varias llamadas en un único turno.

## Casos de uso

- Enrutamiento de comandos en el globo climático de Transcend Climate: el modelo recibe la petición del usuario junto al estado del mapa y devuelve las llamadas a herramientas necesarias para cambiar capas, volar a una ciudad o ajustar la fecha. Es su función nativa y el escenario para el que fue entrenado.
- Sustitución del parser de reglas en producción: el parser por reglas resuelve el 26,4% de las peticiones del conjunto de evaluación; el modelo alcanza el 86,5% con JSON restringido, por lo que se usa como capa de respaldo para las peticiones que las reglas no cubren.
- Despliegue en infraestructura mínima: con Q8_0 (~640 MB) y latencia mediana de 1,5 s en dos hilos de CPU de un Apple M2, puede servirse en un servidor modesto o en el propio dispositivo sin GPU, lo que encaja en un proyecto de monitorización abierto con presupuesto limitado.
- Explicaciones didácticas sobre capas climáticas: cuando la intención es `explain`, el modelo produce una o dos frases sobre qué significa una capa (por ejemplo, aerosol optical depth), sin cifras, para acompañar la visualización.
- Filtrado y declinación de peticiones fuera de alcance: el modelo clasifica como `decline` las consultas que no corresponden a acciones del mapa ni a conceptos de la lista, evitando que la aplicación intente ejecutar herramientas con entradas no válidas.
- Validación de topónimos delegada a la app: el modelo puede escribir mal un nombre de lugar, pero la aplicación resuelve los topónimos por su cuenta, de modo que un error del modelo no inyecta coordenadas ni URLs; esto permite usar el enrutador en un flujo con validación estricta posterior.
- Base para prototipos de enrutadores de dominio: al ser un ajuste LoRA sobre Qwen3-0.6B con código de entrenamiento publicado en `finetune/`, sirve como plantilla para construir enrutadores JSON de bajo coste en otros dominios verticales.

## Benchmarks y rendimiento

Conjunto de evaluación: 727 peticiones retenidas cuyas formulaciones y topónimos no aparecen en entrenamiento. Se considera correcta una respuesta con la intención adecuada y, para `act`, llamadas a herramientas equivalentes a la referencia.

| Sistema | Precisión (correctas) |
|---|---|
| Parser de reglas de la app, solo | 26,4% |
| Este modelo, Q8_0, CPU, JSON restringido | 86,5% (intención correcta 98,6%) |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor reporta una latencia mediana de 1,5 s en dos hilos de CPU de un Apple M2 con dos peticiones concurrentes.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo cabe en memoria RAM del sistema. Q8_0 ocupa ~640 MB y Q4_K_M ~400 MB en disco y en memoria al cargarse.
- GPU recomendadas: no disponibles ni necesarias para el caso de uso documentado; cualquier GPU con suficiente memoria podría servir, pero el autor valida el despliegue en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~1 GB de memoria libre, aunque el escenario de referencia es CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server -m router-q8_0.gguf`, con salida restringida por el esquema JSON de `server/nlp/router.js`. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: mediana de 1,5 s en dos hilos de CPU de un Apple M2 con dos peticiones concurrentes. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Formato |
|---|---|---|---|---|---|
| Transcend Climate router | 596 M | no disponible (un mensaje) | Enrutador JSON de dominio climático | Apache 2.0 | GGUF |
| Qwen3-0.6B (base) | 596 M | no disponible en esta ficha | Modelo generalista | Apache 2.0 | safetensors, GGUF |
| Modelos de function calling de propósito general (p. ej. variantes pequeñas de Qwen o Llama) | variable | variable | Enrutamiento genérico de herramientas | variable | variable |

La comparación relevante es con su modelo base: Transcend Climate router sacrifica generalidad y multilingüismo para ganar precisión en un dominio estrecho, con un 86,5% frente al 26,4% del parser de reglas de la aplicación. No se dispone de datos de benchmarks que permitan compararlo con otros enrutadores de function calling de tamaño similar.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- Procesa un único mensaje sin historial de conversación.
- Las explicaciones cubren una lista fija de aproximadamente 40 conceptos; fuera de ella, la respuesta será probablemente `decline` o incorrecta.
- Evaluado sobre peticiones sintéticas, no sobre registros de usuarios reales; el rendimiento en producción puede diferir.
- Puede seleccionar la herramienta equivocada o escribir mal un topónimo. La aplicación valida cada llamada y resuelve los topónimos por sí misma, por lo que un error no puede inyectar coordenadas, URLs ni cifras, pero sí puede producir una acción no deseada sobre el mapa.
- No genera cifras por diseño; la app descarta explicaciones con dígitos. No debe usarse como fuente de datos climáticos.
- Requiere respetar el prompt de sistema exacto y no usar `--reasoning-budget 0`; desviarse del formato de entrenamiento degrada la salida.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- Riesgo de sesgo derivado de los topónimos y plantillas sintéticas de entrenamiento y de las reescrituras generadas por Claude Sonnet 5.5; no se documenta una evaluación de sesgos.
- Sin descargas ni interacciones registradas en Hugging Face en el momento de la consulta; proyecto de autor individual, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FloatinggOnion/transcend-climate-router-GGUF
- Repositorio de la aplicación: https://github.com/FloatinggOnion/transcend-climate
- Código de ajuste fino: https://github.com/FloatinggOnion/transcend-climate/tree/main/finetune
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- NASA POWER (fuente de datos de la app): no disponible en la información proporcionada
- Climate TRACE (fuente de datos de la app): no disponible en la información proporcionada
