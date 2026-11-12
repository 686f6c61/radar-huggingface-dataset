# johnhenryus/deepgrav-30b

## Resumen

deepgrav-30b es una distribución en formato GGUF del modelo Muse-Glimmer-30B-Abliterated, publicada por el usuario johnhenryus como modelo estándar de DeepGravity, un sistema de inferencia local orientado a usuario final. No se trata de un modelo entrenado desde cero ni de un fine-tuning: los pesos son exactamente los del modelo base, sin modificaciones, y la única diferencia respecto al GGUF original es la plantilla de chat embebida en el archivo.

El modelo base, Muse-Glimmer-30B (meta-models), es un modelo multimodal de 30.000 millones de parámetros publicado bajo licencia Apache 2.0. La versión aquí distribuida parte de la variante "abliterated" de Blackfrost-Research (que elimina el rechazo en la capa de alineamiento) y de la cuantización Q5_K_M publicada por The-freezer. El archivo GGUF ocupa 19.811.388.000 bytes (aproximadamente 19,8 GB) y está pensado para ejecutarse en llama.cpp u Ollama con una ventana de contexto declarada de 131.072 tokens.

La relevancia de esta ficha es acotada: no aporta mejoras de rendimiento ni capacidades nuevas sobre el modelo base. Su interés reside en que documenta un caso de empaquetado de plantilla de chat con persona y protocolo de tool calling propios (ATEM, de Blackfrost) sobre un modelo abliterated, y en que sirve como ejemplo de distribución de pesos bajo Apache 2.0 con trazabilidad explícita de hashes SHA-256 y de las distintas "burns" (versiones de plantilla) del archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal, detalles no publicados en la informacion disponible) |
| Parametros totales | 30B (segun el nombre del modelo base Muse-Glimmer-30B; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (declarada para el despliegue en DeepGravity) |
| Tipos de cuantizacion | Q5_K_M (unica incluida en este repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `deepgrav-30b-Q5_K_M-v3.gguf`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base en la documentacion disponible. La model card de esta distribucion no describe la arquitectura de Muse-Glimmer-30B (tipo de atencion, numero de capas, dimensiones, uso de MoE, etc.), por lo que cualquier detalle al respecto queda como no disponible. Lo unico confirmado es que el modelo base es multimodal: existe un proyector de vision (`mmproj`) en el repositorio GGUF original, aunque no se incluye en este repositorio, que solo contiene el archivo de lenguaje.

Respecto al entrenamiento, esta distribucion no introduce ningun proceso de entrenamiento, fine-tuning, RLHF, DPO ni merge. Los pesos son bit a bit los del GGUF Q5_K_M de The-freezer (SHA-256 `21073f1acc9e35e7d033e4d586f1b834567704ad8052c31cc1b1ec48f3c12a0f` en origen), que a su vez deriva de la abliteration en BF16 de Blackfrost-Research sobre Muse-Glimmer-30B. La unica modificacion es la sustitucion de la persona por defecto en la plantilla de chat: se mantienen la estructura, las macros, los tokens especiales y el protocolo de tool calling ATEM tal como venian. Existen tres "burns" (v1 del 3 de noviembre de 2026; v2 y v3 del 8 de noviembre de 2026) con pesos identicos y solo cambios en la plantilla embebida; v3 es la version actual.

## Capacidades

- Generacion de texto en ingles, con la plantilla de chat propia de DeepGravity (12 Principles y Governance of Discretion como persona por defecto).
- Tool calling mediante el protocolo ATEM incluido en la plantilla de chat heredada del modelo base.
- Capacidades multimodales del modelo base (vision) no disponibles en este repositorio, ya que el proyector `mmproj` no se incluye; requeriria descargarlo del repositorio GGUF de origen.
- Razonamiento multi-turno y conversacional dentro de la ventana de 131.072 tokens declarada para el despliegue.
- Comportamiento "abliterated": ausencia del rechazo tipico introducido por alineamiento, heredado de la variante de Blackfrost-Research.
- No se documentan capacidades especificas de codigo, matematicas, agentes multi-paso ni modos de pensamiento extendido en la informacion disponible.

## Casos de uso

- Despliegue de un asistente local con persona fija: el modelo lleva embebida la plantilla de DeepGravity, de modo que cualquier instalacion que cargue este GGUF obtiene de forma consistente la misma persona y las mismas reglas de conducta sin configuracion adicional.
- Inferencia en hardware de consumo: al ser un GGUF Q5_K_M de unos 19,8 GB, puede cargarse en llama.cpp u Ollama en equipos con GPU de 24 GB o con CPU y RAM suficiente, lo que permite ejecutar un modelo de 30B en estaciones de trabajo locales.
- Procesamiento de documentos largos: la ventana declarada de 131.072 tokens permite ingerir contratos, informes o transcripciones extensas en una sola pasada, siempre que el hardware soporte el coste de atencion asociado.
- Integracion en pipelines con tool calling: el protocolo ATEM embebido en la plantilla permite conectar el modelo a funciones externas (APIs, bases de datos, shell) en flujos de automatizacion sin reescribir el formato de llamadas.
- Experimentacion con modelos abliterated: util para investigadores que quieran evaluar el comportamiento de una variante sin rechazo sobre el modelo Muse-Glimmer-30B manteniendo la licencia Apache 2.0.
- Base para prototipos de agentes conversacionales: la plantilla incluye reglas explicitas de gestion de la direccion del usuario y de las superficies de salida (Governance of Discretion), lo que facilita construir agentes con limites de actuacion declarados.
- Uso como referencia reproducible: los hashes SHA-256 publicados y la separacion entre pesos y plantilla permiten auditar exactamente que se esta ejecutando, algo util en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,8 GB solo para los pesos en Q5_K_M; con cache KV para contexto largo la huella crece de forma proporcional y puede superar ampliamente los 24 GB si se usa la ventana completa de 131.072 tokens.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, encaja en GPUs de 24 GB (RTX 3090, RTX 4090) para contextos moderados, y en A100 40/80 GB o H100 para contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con contexto reducido; con contexto largo es probable que requiera offloading parcial a CPU o GPUs profesionales.
- Opciones de despliegue: llama.cpp (`llama-server`) y Ollama, segun la model card. vLLM y TGI no se mencionan y, al tratarse de un GGUF, no son el formato nativo de esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| deepgrav-30b | 30B (segun nombre del base) | 131.072 tokens (declarado) | GGUF Q5_K_M | Apache 2.0 | Plantilla DeepGravity embebida; sin `mmproj` |
| The-freezer/Muse-Glimmer-30B-Abliterated-GGUF | 30B | no disponible | GGUF (incluye Q5_K_M) | Apache 2.0 | Mismo peso de origen; plantilla ATEM original; incluye `mmproj` |
| meta-models/Muse-Glimmer-30B | 30B | no disponible | no disponible | Apache 2.0 | Modelo base sin abliteration; multimodal completo |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la comparacion se limita a formato, licencia y empaquetado.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta documentado.
- Al ser una variante abliterated, se ha eliminado el comportamiento de rechazo del modelo base; esto puede aumentar la probabilidad de generar contenido que el modelo original rechazaria y traslada al operador la responsabilidad de filtrado.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones publicadas de fidelidad ni de tasas de error.
- La ventana de 131.072 tokens es una declaracion de despliegue; no se especifica si el modelo fue entrenado con esa longitud ni como degrada el rendimiento en contextos muy largos.
- Este repositorio no incluye el proyector de vision, por lo que las capacidades multimodales del modelo base no estan disponibles sin descargar el `mmproj` del repositorio de origen.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion; conviene verificar las condiciones del modelo base y de la abliteration por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 12 de noviembre de 2026: no hay evidencia de uso en produccion ni validacion comunitaria.
- La model card fue redactada por un asistente ("Dora") a partir de registros de compilacion del autor; los datos tecnicos del modelo base no se verifican en ella.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnhenryus/deepgrav-30b
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- GGUF de origen (The-freezer): https://huggingface.co/The-freezer/Muse-Glimmer-30B-Abliterated-GGUF
- Abliteration en BF16 (Blackfrost-Research): Blackfrost-Research/Muse-Glimmer-30B-Abliterated-BF16 (referenciado en la model card, sin URL directa en la informacion disponible)
- Plantilla de chat: `deepgravity_chat_template_v3.jinja` (incluida en el repositorio)
- Principios: `PRINCIPLES.md` (incluido en el repositorio)
- Apoyo al autor: https://paypal.me/johnhenryus
