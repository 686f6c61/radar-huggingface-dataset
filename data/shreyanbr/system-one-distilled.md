# shreyanbr/system-one-distilled

## Resumen

System One (distilled) es un cross-encoder de 70.830.722 parámetros, derivado de la familia DeBERTa-v3-xsmall, que responde preguntas de decisión tipadas —Choice, Score y Noul, según la model card— en una única pasada forward por lote y sin generar ningún token. Lo publica el usuario shreyanbr y está diseñado para decisiones de enrutado (routing), clasificación y gating dentro de software que no necesita un modelo autorregresivo: por ejemplo, decidir la intención de un mensaje de cliente, si hace falta invocar una herramienta o si un aviso constituye una incidencia. Implementa el esquema TypeSafe Jev `POST /v1/systemone`.

El checkpoint se ha destilado a partir de las respuestas de Claude Haiku 4.5 sobre 1.500 ítems de entrenamiento por tarea, y parte del modelo MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33. Se distribuye en safetensors con licencia Apache 2.0 y un repositorio de 0,3 GB, lo que lo sitúa en el rango desplegable en CPU o en cualquier GPU de consumo.

Su interés práctico es sustituir llamadas a un LLM autorregresivo por un clasificador que resuelve seis preguntas de decisión en un solo paso, con latencia y coste muy inferiores. Ahora bien, la propia model card advierte de que dos de las seis preguntas rinden al nivel de un predictor constante y de que parte de la supervisión de triaje no es apta para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (familia DeBERTa-v3-xsmall). Nota: el tag de HuggingFace indica "deberta-v2", mientras que el campo `base_model` apunta a DeBERTa-v3-xsmall |
| Parámetros totales | 70.830.722 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con la restricción adicional derivada de la licencia CC-BY-NC-4.0 del dataset `tickets`, ver limitaciones) |
| Formato de pesos | safetensors (librería transformers), acompañado de `calibration.json` |
| Pipeline declarado | zero-shot-classification |
| Tareas de decisión documentadas | `intent`, `tool`, `needs_tool`, `priority`, `type`, `is_incident` |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 en el momento de la extracción |

## Arquitectura y entrenamiento

Se trata de un encoder transformer bidireccional usado como cross-encoder: recibe el estado (por ejemplo, un mensaje) y las preguntas de decisión tipadas, y devuelve las respuestas en una sola pasada forward, sin decodificación autorregresiva. La model card no detalla la ventana de contexto ni la composición del preentrenamiento, más allá de indicar que el punto de partida es el checkpoint zero-shot de MoritzLaurer sobre DeBERTa-v3-xsmall. El motor de inferencia lee, además de los pesos, un fichero `calibration.json` obligatorio con una temperatura por pregunta y un escalador de Platt, porque los márgenes crudos no son probabilidades.

El entrenamiento es un proceso de destilación: la supervisión son las respuestas del propio Claude Haiku 4.5 a 1.500 ítems de entrenamiento por tarea (unas 9.000 muestras en total si se suman las seis tareas). No se documentan fases de RLHF ni DPO, ni el número de tokens de entrenamiento. La evaluación se hizo sobre particiones de test de 500 ítems, con una única semilla y una única ejecución, e intervalos bootstrap calculados sobre los ítems de test, no sobre semillas de entrenamiento. La model card menciona explícitamente la retractación de una cifra anterior del propio autor por problemas de etiquetado.

## Capacidades

- Clasificación de decisión tipada: responde preguntas de tipo Choice (elegir entre criterios), Score y Noul, tal y como aparecen denominadas en la model card.
- Seis preguntas de decisión implementadas y evaluadas: `intent`, `tool`, `needs_tool`, `priority`, `type` e `is_incident`.
- Clasificación zero-shot: hereda del checkpoint base la capacidad de decidir entre criterios descritos en lenguaje natural, sin reentrenamiento por etiqueta.
- Enrutado y gating para agentes: determina si una petición requiere herramienta (`tool`, `needs_tool`) antes de invocar un LLM, aunque no ejecuta la herramienta.
- Calibración de confianza: temperaturas por pregunta y escalador de Platt para convertir márgenes en probabilidades utilizables en umbrales.
- Inferencia no generativa: una pasada forward por lote, sin tokens generados, lo que reduce latencia y coste frente a un modelo autorregresivo.
- Capacidades multilingües: no disponibles (la model card no declara idiomas).
- Visión, audio, tool calling ejecutable o generación de texto libre: no soportados; el modelo solo emite etiquetas y puntuaciones.

## Casos de uso

- Enrutado de peticiones de soporte: clasificar el campo `intent` de un mensaje entrante y dirigirlo a la cola o al flujo correcto, sustituyendo una llamada a un LLM por una pasada de 70,8 M de parámetros.
- Gating de tool calling en agentes: decidir con `needs_tool` y `tool` si el siguiente paso debe ser una llamada a herramienta o una respuesta directa del LLM, evitando invocaciones innecesarias.
- Triaje de incidencias técnicas: usar `is_incident` para separar avisos operativos de consultas rutinarias antes de crear tickets en el sistema de guardia.
- Prefiltrado de colas de tickets: descartar o agrupar entradas de bajo valor antes de pasarlas a un modelo mayor, reduciendo el coste por petición en pipelines de atención al cliente.
- Clasificación de documentación interna: aplicar el comportamiento zero-shot heredado del checkpoint NLI para etiquetar textos según criterios definidos en el momento de la consulta, sin reentrenar.
- Puerta de decisión en formularios o asistentes embebidos: ejecutar el modelo en el propio servicio (o en CPU) para decidir el siguiente estado de un flujo conversacional, con requisitos de memoria inferiores a 1 GB.
- Evaluación comparativa de etiquetados: usar la tabla de precisión frente al suelo de mayoría como herramienta de diagnóstico para detectar preguntas cuyo esquema de etiquetas es problemático (caso de `priority`).

## Benchmarks y rendimiento

Resultados declarados por el autor sobre particiones de test de 500 ítems, junto al suelo de un predictor de mayoría (`majority` floor):

| Pregunta | Precisión | Suelo de mayoría |
|---|---:|---:|
| `intent` | 0,688 | 0,010 |
| `tool` | 0,930 | 0,306 |
| `needs_tool` | 0,788 | 0,694 |
| `priority` | 0,464 | 0,464 |
| `type` | 0,682 | 0,374 |
| `is_incident` | 0,780 | 0,626 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). La fila de `intent` está contaminada porque el checkpoint base se entrenó con banking77, y la model card señala que banking77 tiene una tasa publicada de error de etiqueta cercana al 14 %, lo que limita la precisión alcanzable a alrededor de 0,86. `priority` queda al nivel del suelo para todos los sistemas medidos, Claude Haiku 4.5 incluido.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,3 GB para los pesos en fp32 y menos de 0,2 GB en fp16, más el espacio de activaciones; con un lote pequeño el consumo total se mantiene por debajo de 1 GB.
- CPU: viable para inferencia en producción con un encoder de este tamaño, sin necesidad de GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100, H100 ni tarjetas de gama alta.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en iGPU modernas con memoria compartida suficiente.
- Opciones de despliegue: la vía documentada es la librería transformers junto con el motor `systemone.engine.SystemOneEngine` y el fichero `calibration.json`; al ser un encoder de clasificación son aplicables ONNX Runtime y TorchScript, mientras que llama.cpp u Ollama no aplican al no publicarse pesos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| System One (distilled) | 70.830.722 | Cross-encoder destilado de Claude Haiku 4.5 para seis preguntas de decisión | no disponible | apache-2.0, con supervisión de triaje bajo CC-BY-NC-4.0 | safetensors en HuggingFace, 0 descargas |
| MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33 | en torno a 70 M (misma arquitectura base) | Cross-encoder NLI zero-shot, sin destilación específica | no disponible | no disponible en esta información | HuggingFace (modelo base declarado) |
| Claude Haiku 4.5 | no disponible | LLM autorregresivo, usado aquí como profesor y como sistema de referencia | no disponible | propietaria | API |

No se dispone de datos de rendimiento comparables entre estos sistemas más allá de las precisiones y los suelos de mayoría recogidos en la tabla de benchmarks, medidos por el autor.

## Limitaciones y advertencias

- Contaminación de datos: el checkpoint base se entrenó con banking77, por lo que la fila `intent` está contaminada y su precisión no es extrapolable.
- Techo de precisión por errores de etiqueta: banking77 tiene una tasa publicada de error de etiqueta cercana al 14 %, lo que fija el máximo alcanzable alrededor de 0,86 en esa tarea.
- Pregunta no aprendible: `triage.priority` queda en el suelo de mayoría (0,464) para todos los sistemas medidos, incluido el profesor; no debe usarse en producción como señal fiable.
- Restricción de licencia en los datos: el dataset `tickets` es CC-BY-NC-4.0, de modo que la supervisión de triaje no es apta para uso comercial aunque el modelo se publique como apache-2.0. Conviene revisar la aplicabilidad de esta restricción antes de desplegar las tareas de triaje.
- Calibración obligatoria: sin `calibration.json` los márgenes crudos no son probabilidades; cualquier umbral fijado sobre las salidas sin ese fichero será incorrecto.
- Validación estadística débil: una sola semilla y una sola ejecución; los intervalos son bootstrap sobre ítems de test, no sobre semillas de entrenamiento.
- Riesgo de error silencioso: al no generar texto, los fallos se manifiestan como etiquetas incorrectas con puntuaciones aparentemente altas, no como respuestas visibles; requiere monitorización por umbrales.
- Sesgos conocidos: no documentados explícitamente en la información disponible.
- Idiomas y contexto: no hay información publicada sobre idiomas soportados ni sobre la ventana de contexto máxima.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la extracción, sin validación externa independiente.
- Motor de inferencia acoplado: el uso documentado pasa por las clases `SystemOneEngine` y `SystemOneRequest` del propio autor, lo que añade dependencia de ese código para replicar el comportamiento descrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shreyanbr/system-one-distilled
- Modelo base declarado: https://huggingface.co/MoritzLaurer/deberta-v3-xsmall-zeroshot-v1.1-all-33
- Repositorio con el código fuente, el arnés de benchmarks y la sección completa de limitaciones: https://github.com/shreyanbr/jev-haiku-benchmarking
- Resultados de la búsqueda web: los enlaces devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con este modelo; no se han encontrado papers, blogs ni demos adicionales en la información disponible.
