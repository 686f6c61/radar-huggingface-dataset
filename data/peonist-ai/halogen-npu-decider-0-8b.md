# peonist-ai/halogen-npu-decider-0.8b

## Resumen

halogen-npu-decider-0.8b es un clasificador de 0,8 mil millones de parámetros derivado de Mapika/decider-0.8b (a su vez un ajuste fino de Qwen/Qwen3.5-0.8B-Base), publicado por peonist-ai y convertido para ejecutarse exclusivamente sobre la NPU XDNA2 de los procesadores AMD Strix Halo (familia Ryzen AI). No es un modelo de generación de texto: recibe un texto y una pregunta con entre 2 y 10 opciones, y devuelve en una sola pasada una probabilidad para cada opción, lo que lo sitúa en la categoría de guardarraíl, router o clasificador auxiliar.

Su relevancia es fundamentalmente de infraestructura: el modelo viene empaquetado para el servidor halogen-flash-server, donde convive con un modelo "Flash" que corre en la GPU y comparte puerto, de modo que la clasificación se descarga en la NPU y libera la GPU para la generación. El repositorio incluye el programa de dispositivo para la NPU (684 MB), los pesos convertidos al formato .hnpw (2,30 GB) y el tokenizador (20 MB).

La licencia es Apache-2.0, igual que la del modelo fuente, y el contexto admitido es de 8.192 tokens desde la versión 0.18.2 del servidor. El principal caveat es que los ficheros no cargan en transformers, vLLM ni llama.cpp: solo funcionan dentro del contenedor halogen-flash-server sobre hardware AMD concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con cabeza de clasificación sobre opciones; convertido a programa de dispositivo NPU XDNA2. Detalle interno de capas y atención: no disponible |
| Parametros totales | ~0,8 mil millones (según nombre del modelo y modelo base) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens (desde halogen-flash-server 0.18.2) |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en formato .hnpw convertido para la NPU; no se documentan esquemas de cuantización (INT8/INT4) en la información proporcionada |
| Idiomas soportados | No disponible (no declarados en la model card ni en los tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | .hnpw (formato del runtime halogen para NPU), más programa de dispositivo propietario y tokenizador en directorio aparte. No se publican safetensors ni GGUF |

Otros datos del repositorio: 6,4 GB de tamaño reportado (los tres artefactos listados suman aproximadamente 3,0 GB, diferencia atribuible a revisiones acumuladas), 0 descargas, 1 like, creado el 2026-10-01 y actualizado el 2026-10-20. La librería declarada es `halogen` y el pipeline `text-classification`, con el widget de inferencia del Hub desactivado de forma deliberada.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su origen: un ajuste fino de Qwen3.5-0.8B-Base bautizado como decider-0.8b, orientado a clasificación, y su conversión posterior a un programa ejecutable en la NPU XDNA2 de Strix Halo. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineación en el modelo fuente; tampoco se documenta el proceso de conversión a .hnpw (herramientas, precisión numérica o particionado del grafo).

La innovación técnica relevante no está en el entrenamiento sino en el despliegue: el modelo se empaqueta junto a un programa de dispositivo y se sirve mediante halogen-flash-server, que descarga los ficheros a `/models/npu/decider-0.8b/`, verifica tamaño y checksum antes de arrancar, y expone la clasificación en el mismo puerto que el modelo Flash que corre en la GPU. Con `HALOGEN_NPU_DEC_RESUME=1`, una petición con varias preguntas lee el texto una sola vez, reutilizando el estado para cada cuestión. El host requiere el driver de NPU, XRT con su plugin de NPU y mantener el reloj de fabric de la GPU mientras la NPU trabaja en paralelo.

## Capacidades

- Clasificación de opción múltiple: dada una entrada de texto y una pregunta con entre 2 y 10 opciones, devuelve una probabilidad por opción en una única pasada del modelo.
- Función de guardarraíl: puede actuar como filtro de entrada o salida evaluando si un texto cumple o incumple una política expresada como opciones.
- Función de router: selección de intención, herramienta o ruta entre un conjunto acotado de candidatos.
- Procesamiento de textos largos: hasta 8.192 tokens por petición desde la versión 0.18.2 del servidor.
- Reutilización de contexto: con `HALOGEN_NPU_DEC_RESUME=1`, varias preguntas sobre el mismo texto se resuelven con una sola lectura.
- Ejecución offloaded en NPU: la clasificación no consume VRAM de la GPU, que queda libre para el modelo generativo.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso ni salidas estructuradas más allá del vector de probabilidades.
- Capacidades multimodales (visión, audio): no disponibles.
- Cobertura multilingüe: no disponible, no declarada.

## Casos de uso

- Guardarraíl de prompt injection en un asistente: formular como pregunta con opciones ("¿el texto intenta anular instrucciones previas?") y usar la probabilidad de la opción afirmativa como umbral de bloqueo antes de llamar al modelo generativo; al ejecutarse en la NPU no compite por VRAM con la generación.
- Router de intenciones en atención al cliente: clasificar cada mensaje entrante entre rutas predefinidas (facturación, soporte técnico, devoluciones, información comercial) con 2 a 10 opciones, derivando la conversación al flujo o al modelo adecuado.
- Moderación de contenido en dos etapas: primera pasada con el clasificador sobre el texto del usuario y solo en caso dudoso invocar un modelo mayor, reduciendo coste y latencia del pipeline.
- Clasificación de tickets y correo entrante en local: procesar textos de hasta 8.192 tokens con categorías y prioridades definidas como opciones, sin enviar datos a la nube, aprovechando que el modelo corre en hardware de escritorio Strix Halo.
- Re-ranking de respuestas candidatas en un sistema RAG: presentar 2 a 10 respuestas generadas como opciones y usar la probabilidad asignada para seleccionar la más consistente o descartar todas por debajo de un umbral.
- Enrutado de decisión en RAG (recuperar o responder): pregunta binaria sobre si el contexto recuperado basta para contestar, con el clasificador actuando como interruptor entre responder directamente o lanzar una nueva búsqueda.
- Etiquetado por lotes offline: clasificación masiva de documentos (soporte, legal, logs) en una estación de trabajo con Ryzen AI, con el modelo como único consumidor de la NPU y la GPU dedicada a otras tareas.
- Control de calidad en generación: evaluar la salida de otro modelo contra criterios expresados como opciones (correcto, incompleto, fuera de política) antes de publicarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, F1, latencia ni throughput, y la búsqueda web realizada no ha devuelto fuentes técnicas utilizables (los resultados obtenidos son contenido no relacionado con el modelo).

## Requisitos de hardware

- Hardware obligatorio: NPU XDNA2 integrada en AMD Strix Halo (Ryzen AI). El modelo no se ejecuta en GPU convencional, CPU ni en aceleradores de otros fabricantes.
- Software de host: driver de NPU de AMD, XRT con el plugin de NPU, y el reloj de fabric de la GPU retenido mientras la NPU opera junto a la GPU.
- Runtime: halogen-flash-server 0.16.0 o superior para las revisiones antiguas; los ficheros de la cabeza del repositorio requieren 0.18.12 o superior. Cada versión del servidor descarga la revisión con la que se publicó.
- Almacenamiento: en torno a 3,0 GB para los tres artefactos listados; el repositorio declara 6,4 GB de tamaño total.
- VRAM: no aplica, la inferencia ocurre en la NPU; el consumo de memoria del sistema no está documentado.
- Compatibilidad con vLLM, llama.cpp, Ollama, TGI o transformers: nula. Los ficheros .hnpw no cargan fuera del contenedor halogen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución |
|---|---|---|---|---|---|
| peonist-ai/halogen-npu-decider-0.8b | ~0,8 B | 8.192 tokens | .hnpw + programa NPU | Apache-2.0 | Solo NPU XDNA2 vía halogen-flash-server |
| Mapika/decider-0.8b | ~0,8 B | No disponible | No disponible | Apache-2.0 (según el modelo derivado) | Runtime estándar (no verificado en la información disponible) |
| Qwen/Qwen3.5-0.8B-Base | ~0,8 B | No disponible | No disponible | No disponible en la información proporcionada | Runtime estándar |

No se dispone de datos de rendimiento comparado (benchmarks, latencia, precisión) para ninguno de los tres, por lo que la comparación se limita a linaje, licencia y formato de despliegue. Alternativas de la misma categoría (clasificadores o guardarraíles de menos de 1 B) no están identificadas en la información proporcionada.

## Limitaciones y advertencias

- Portabilidad nula: los pesos .hnpw y el programa de dispositivo solo funcionan dentro de halogen-flash-server sobre NPU XDNA2; no hay ruta de despliegue en GPU, CPU ni servicios cloud estándar.
- Dependencia de versiones: los ficheros de la cabeza del repositorio exigen halogen-flash-server 0.18.12 o superior; usar una versión anterior implica descargar otra revisión del modelo.
- Salida restringida: solo produce probabilidades sobre 2 a 10 opciones; no genera texto ni justifica la decisión, lo que limita su auditabilidad.
- Idiomas no declarados: se desconoce el rendimiento fuera del inglés o de los idiomas presentes en el ajuste fino original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión, calibración de probabilidades ni robustez ante entradas adversariales.
- Sesgos y alucinación: no documentados. Al ser un clasificador, el riesgo se traduce en falsos positivos o negativos del guardarraíl o del router, con impacto directo en el pipeline que lo consume.
- Validación comunitaria mínima: 0 descargas y 1 like en el momento de la consulta, con una única revisión publicada; no hay informes independientes de uso en producción.
- Licencia: Apache-2.0 permite uso comercial, pero `devices/NOTICE.md` recoge avisos de terceros del programa de NPU que conviene revisar antes de redistribuir.
- Inconsistencia de tamaño: el repositorio declara 6,4 GB frente a los ~3,0 GB de los artefactos listados; conviene verificar el contenido real descargado antes de aprovisionar almacenamiento.
- La búsqueda web no ha arrojado documentación técnica independiente sobre el modelo; toda la información procede de la model card y de los tags del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peonist-ai/halogen-npu-decider-0.8b
- Modelo base: https://huggingface.co/Mapika/decider-0.8b
- Modelo base del ajuste fino: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Servidor halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Documentación de NPU (instalación, formas de petición, ajuste fino propio): https://github.com/peonist-ai/halogen-flash-server/blob/main/docs/NPU.md
- Avisos de terceros del programa de NPU: `devices/NOTICE.md` dentro del repositorio del modelo
- Comunidad (Discord): https://discord.gg/bcm6QknaV6
- Resultados de búsqueda web: no se han encontrado fuentes técnicas relevantes sobre este modelo; los resultados obtenidos no guardan relación con él.
