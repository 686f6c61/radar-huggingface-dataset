# mbrown-uno/build-unosquare-summarizer

## Resumen

build-unosquare-summarizer es un modelo derivado de Qwen/Qwen3.5-4B, publicado por el usuario mbrown-uno, especializado en una única tarea: comprimir salidas de herramientas (logs de build, resultados de tests, búsquedas de código, listados de rutas y texto de páginas web) en resúmenes cortos y literales para agentes de programación. El problema que ataca es el consumo de contexto: según la model card, las salidas de más de 16.000 caracteres vuelven un 97% más pequeñas (93% de media en todo el tráfico evaluado), con un resumen mediano de unos 1.300 caracteres (~370 tokens). Está afinado sobre datos reales de sesiones del agente build.unosquare (Bash, Grep y WebFetch) con exactamente las plantillas de prompt que la aplicación envía en producción.

El modelo se distribuye en formato MLX cuantizado a 4 bits (2,9 GB según el autor) y está pensado para ejecutarse en Apple silicon, con una latencia mediana de 2,5 s por resumen y unos 220 tokens/s usando el drafter MTP incluido. Además de texto, conserva la torre de visión del modelo base (pipeline image-text-to-text) y se usa para describir capturas de pantalla de interfaces y estados de error. Es, por tanto, un componente de infraestructura para agentes, no un modelo de propósito general: el propio autor lo declara no apto para chat abierto, razonamiento libre, generación de código ni contenido en idiomas distintos del inglés.

Su relevancia actual está en la compresión de contexto como capa separada dentro de pipelines de agentes: un modelo pequeño y local que reduce el coste por token de las trazas de herramientas sin perder información accionable (errores, rutas, números de línea, estado de salida). Los datos publicados lo sitúan por delante de Qwen3.5-9B, Qwen3.5-4B, Qwen3.5-2B y Gemma 4 E4B sin ajustar en retención de hechos (82%) y tasa de alucinación (6,9%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; derivada de Qwen/Qwen3.5-4B (modelo vision-language, pipeline image-text-to-text) |
| Parametros totales | 4.539.265.536 (dato real de los safetensors) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (la model card solo indica truncados de entrada a 10.000 y 16.000 caracteres) |
| Tipos de cuantizacion | 4 bits (tag del repositorio) |
| Idiomas soportados | Ingles (`en`); el autor lo declara no apto para contenido no ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); tamano del repositorio 6,2 GB, frente a los 2,9 GB que declara el autor para los pesos en 4 bits |

Otros datos: 43 descargas, 2 likes, creado el 2026-10-16 y actualizado el 2026-10-19. Etiquetas relevantes: `summarization`, `tool-output`, `coding-agents`, `context-compression`, `image-text-to-text`.

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base Qwen3.5-4B (tipo de transformer, atencion, si emplea mezcla de expertos) ni el volumen de datos de entrenamiento. Lo que si consta es el proceso de especializacion: fine-tuning del modelo base sobre datos de uso real de build.unosquare, es decir, salidas de Bash, Grep y WebFetch capturadas de sesiones reales del agente y emparejadas con los prompts exactos que la aplicacion envia en tiempo de ejecucion. No se menciona el uso de RLHF o DPO, ni el numero de tokens de entrenamiento.

El comportamiento entrenado es deliberadamente extractivo antes que generativo: el modelo copia en lugar de parafrasear, no anade informacion ausente en la entrada, solo da recuentos cuando son exactos y no afirma "sin errores" salvo que la salida lo diga. La model card reporta que el 99% del texto que cita esta copiado literalmente de la entrada. El despliegue incluido usa decodificacion especulativa mediante un drafter MTP empaquetado, que eleva el rendimiento a unos 220 tokens/s. Las plantillas de prompt (linea `Intent:`, linea de fuente y bloque `Content:` o `Results:`) forman parte del contrato de entrenamiento y deben respetarse.

## Capacidades

- Resumen de salida de shell y terminal (builds, tests, instalaciones, scripts, logs): produce `Exit: success` o `Exit: failure (code N)`, errores y avisos citados literalmente y deduplicados, y la linea de recuento de tests/build en verbatim.
- Tratamiento de comandos encadenados (`&&`, `;`): una seccion corta por cada paso.
- Agrupacion de resultados de busqueda de codigo en formato `path:line:text` (grep/ripgrep): coincidencias bajo la ruta exacta como `- line N: \`match\``, con colapso de patrones repetidos (`lines 5, 12, 19: ...`).
- Resumen de listas de rutas de fichero: agrupacion por directorio con recuentos exactos, rutas mas relevantes en verbatim y cierre `and N more`.
- Extraccion de secciones relevantes de texto de pagina web (HTML convertido a texto), conservando firmas de API y URLs.
- Descripcion de imagenes y capturas de pantalla: aplicacion/pagina, elementos de interfaz, estados de error y texto visible citado exactamente.
- Capacidad de vision heredada del modelo base (pipeline image-text-to-text).
- No soporta, segun el autor: chat general, razonamiento abierto, generacion de codigo ni contenido no ingles.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso mas alla del enrutado por plantilla.

## Casos de uso

- Compresion de logs de CI/CD dentro de un agente: el agente ejecuta `npm test` o `pytest` en un runner, captura stdout/stderr y lo pasa al modelo con el system prompt de shell; el agente recibe estado de salida, errores citados y la linea de recuento, reduciendo el consumo de contexto un 93-97%.
- Depuracion de builds largos en local: con entradas truncadas a 16.000 caracteres y la linea `[Input preprocessed: ...]`, el modelo devuelve solo los errores y avisos relevantes, lo que evita inyectar decenas de miles de caracteres de traza en la ventana del agente.
- Navegacion de bases de codigo con ripgrep: los resultados de una busqueda de patron se agrupan por fichero y numero de linea, de modo que el agente planifica la edicion sin releer la salida cruda completa.
- Extraccion de documentacion tecnica: dado el texto de una pagina de docs y una `Intent:` concreta (por ejemplo, limites de tasa por plan), el modelo devuelve solo las secciones pertinentes con firmas de API y URLs intactas.
- Revision de capturas en pruebas E2E: descripcion factual de pantallas y estados de error para que un agente de QA identifique que ha fallado sin que un humano mire la imagen.
- Inventario de ficheros en tareas de refactor: a partir de una lista de rutas con coincidencias, el modelo agrupa por area con recuentos exactos y senala los ficheros mas relevantes, util para decidir el alcance de un cambio.
- Pretratamiento en un servidor OpenAI-compatible local: al ejecutarse en Apple silicon con MLX (por ejemplo, omlx) y ~2,5 s de mediana por resumen, actua como middleware de compresion antes del modelo grande, sin salir de la maquina.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (trafico de agentes retenido, no benchmarks academicos):

| Metrica | Resultado |
|---|---|
| Reduccion de tamano en salidas > 16.000 caracteres | 97% |
| Reduccion de tamano en todo el trafico evaluado | 93% |
| Resumen mediano | ~1.300 caracteres (~370 tokens) |
| Retencion de hechos clave | 82% (Qwen3.5 9B/4B/2B y Gemma 4 E4B sin ajustar: 51-58%) |
| Capacidad de responder preguntas sobre el resumen vs salida cruda | 89% |
| Tasa de alucinacion | 6,9% de las afirmaciones (Qwen3.5-9B: 21,1%); la mas baja de los seis modelos probados |
| Citas literales correctas | 99% del texto citado copiado exactamente de la entrada |
| Acierto pass/fail en salidas de shell | 97,8% sobre 3.058 salidas retenidas de 58 repositorios open source (Qwen3.5-9B: 65,6%) |
| Descripcion de capturas de pantalla | Gana o empata frente a Qwen3.5-9B en el 86,7% de los casos |
| Latencia mediana | 2,5 s por resumen |
| Throughput | ~220 tokens/s con el drafter MTP incluido |
| Tamano de pesos | 2,9 GB (Qwen3.5-9B: 6,1 GB) |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en 4 bits con un peso declarado de 2,9 GB; el repositorio completo ocupa 6,2 GB (incluye artefactos adicionales ademas de los pesos).
- Ejecucion prevista en Apple silicon mediante MLX, con memoria unificada; no se documentan rutas para CUDA, ROCm ni CPU x86.
- No se especifica VRAM minima ni GPU recomendadas (A100, H100, RTX 4090): el modelo esta empaquetado para el stack MLX de Apple, no para GPUs discretas.
- Despliegue: cualquier servidor OpenAI-compatible para MLX que soporte modelos vision-language Qwen3.5 (el autor cita omlx), con una peticion de chat por cada salida de herramienta.
- Parametros de muestreo obligatorios: `temperature 0.1`, `top_p 0.9`, `top_k 20`, `repetition_penalty 1.05`, `enable_thinking: false`; `max_tokens` 2048 (shell, busqueda de codigo, listas de rutas), 4096 (pagina web, con `presence_penalty 1.5`) y 1024 (imagen, con `presence_penalty 1.0`).
- Rendimiento declarado: 2,5 s de mediana por resumen y ~220 tokens/s con decodificacion especulativa MTP; no se publican cifras de throughput agregado ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en la tarea |
|---|---|---|---|---|---|
| build-unosquare-summarizer | 4,54 B (4 bits, 2,9 GB) | no disponible | no disponible | MLX, safetensors | 82% de hechos retenidos; 6,9% alucinacion; 97,8% pass/fail |
| Qwen3.5-9B (sin ajustar) | no disponible (6,1 GB en el formato comparado) | no disponible | no disponible | no disponible en la informacion | 51-58% de hechos retenidos (rango del grupo); 21,1% alucinacion; 65,6% pass/fail |
| Qwen3.5-4B (base, sin ajustar) | ~4,5 B (modelo base del afinado) | no disponible | no disponible | HuggingFace (Qwen/Qwen3.5-4B) | Incluido en el rango 51-58% de retencion de hechos |
| Qwen3.5-2B (sin ajustar) | no disponible | no disponible | no disponible | no disponible en la informacion | Incluido en el rango 51-58% de retencion de hechos |
| Gemma 4 E4B (sin ajustar) | no disponible | no disponible | no disponible | no disponible en la informacion | Incluido en el rango 51-58% de retencion de hechos |

La comparacion disponible se limita a la tarea de resumen de salidas de herramientas; no hay datos de benchmarks generales que permitan comparar capacidad bruta.

## Limitaciones y advertencias

- Uso restringido por diseno: el autor lo declara no apto para chat general, razonamiento abierto, generacion de codigo ni contenido en idiomas distintos del ingles.
- Tasa de alucinacion no nula: 6,9% de las afirmaciones, segun la propia evaluacion del autor; en un pipeline de agentes conviene validar rutas y codigos de salida criticos.
- Dependencia estricta de plantilla: el modelo fue entrenado con formatos concretos (`Intent:`, linea de fuente, `Content:`/`Results:`); usarlo fuera de esas plantillas degrada la calidad.
- Perdida de informacion por truncado: las entradas se recortan a 10.000 o 16.000 caracteres; el autor recomienda anotar el truncado del medio con una linea explicita, lo que implica descartar contenido central de la salida original.
- Solo ingles: cualquier salida o instruccion en otro idioma queda fuera del alcance declarado.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribucion; es un riesgo directo para produccion, maquina tambien heredado del modelo base Qwen/Qwen3.5-4B.
- Dependencia de plataforma: empaquetado en MLX, lo que limita el despliegue a Apple silicon; no hay pesos GGUF ni ruta documentada para GPU NVIDIA.
- Cuantizacion 4 bits: no se documentan perdidas de calidad asociadas a la cuantizacion.
- Discrepancia de cifras: el autor indica 2,9 GB de pesos y el repositorio ocupa 6,2 GB; conviene verificar que artefactos se descargan.
- Modelo con pocas senales de adopcion (43 descargas, 2 likes) y sin paper ni evaluacion independiente; todas las metricas proceden del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mbrown-uno/build-unosquare-summarizer
- Variante v1: https://huggingface.co/mbrown-uno/build-unosquare-summarizer-v1
- Perfil del autor: https://huggingface.co/mbrown-uno
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Producto build.unosquare: https://build.unosquare-ai.com/
- Unosquare (empresa): https://www.unosquare.com/
- Servicios de IA y ML de Unosquare: https://www.unosquare.com/technologies/ai-and-ml/
