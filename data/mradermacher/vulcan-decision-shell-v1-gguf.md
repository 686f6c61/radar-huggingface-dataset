# mradermacher/vulcan-decision-shell-v1-GGUF

## Resumen

Vulcan Decision Shell v1 es un modelo de lenguaje pequeño (752 millones de parametros) desarrollado por openvulcan, orientado a tareas de seguridad y control en agentes de programacion: actua como guardrail que revisa comandos, llamadas a herramientas (tool calls) y decisiones de permisos antes de que un agente las ejecute. La version analizada en esta ficha es la cuantizacion GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estaticas de miles de modelos de Hugging Face.

El modelo se basa en la familia Qwen3.5 (segun los tags del repositorio) y esta disenado como componente de decision en pipelines de agentes de codigo, donde clasifica o evalua si una accion propuesta (ejecutar un comando de shell, invocar una herramienta, conceder un permiso) es segura o requiere intervencion humana. Su tamano reducido lo hace idoneo para ejecutarse en local junto al agente principal sin apenas penalizacion de latencia o coste.

Su relevancia actual radica en la tendencia a desplegar agentes de codigo autonomos (Claude Code, OpenHands, agentes basados en Qwen o DeepSeek) que ejecutan comandos reales en sistemas: un clasificador ligero y especializado como este permite anadir una capa de revision de seguridad sin depender de un LLM grande para cada decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tags del repositorio) |
| Parametros totales | 752,39 millones (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta version); el modelo base esta en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es openvulcan/vulcan-decision-shell-v1, derivado de la arquitectura Qwen3.5 segun los metadatos del repositorio. Se trata de un transformer denso de unos 752 millones de parametros, un tamano tipico para modelos de clasificacion o decision especializados que deben ser rapidos y baratos de ejecutar. La version de mradermacher no modifica los pesos: son cuantizaciones estaticas GGUF (convertidas desde el formato HF) que reducen el tamano en disco desde 1,6 GB en f16 hasta 0,5 GB en Q2_K.

Sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset y el uso de tecnicas como RLHF o DPO no estan disponibles en la informacion proporcionada. Por los tags (safety, guardrail, coding-agent, tool-call, command-review, permission), todo apunta a un entrenamiento o fine-tuning centrado en datos de interaccion de agentes de codigo con herramientas y comandos de shell, pero no hay detalles publicados en la model card consultada.

## Capacidades

- Revision de comandos de shell: evaluacion de comandos propuestos por un agente antes de su ejecucion (command-review).
- Revision de llamadas a herramientas: clasificacion o verificacion de tool calls generados por un agente de codigo.
- Decisiones de permisos: determinar si una accion requiere aprobacion humana o puede ejecutarse de forma autonoma.
- Generacion de texto conversacional: el modelo esta etiquetado como conversational, aunque su foco es la tarea de decision, no la redaccion de contenido largo.
- Integracion como guardrail en pipelines de agentes: disenado para actuar como capa de seguridad intermedia entre el LLM principal y el sistema operativo o las herramientas.
- Ejecucion local y ligera: con menos de 1 GB en cuantizaciones de 4 bits, puede correr en CPU o GPU de consumo con latencia minima.

No hay informacion que indique capacidades de vision, audio, modo de razonamiento extendido (thinking mode) ni soporte explicito de function calling en el propio modelo (mas bien lo evalua como entrada).

## Casos de uso

- Guardrail para agentes de codigo autonomos: insertar el modelo entre el agente y la ejecucion de comandos para bloquear o marcar comandos peligrosos (rm -rf, modificaciones de sistema) antes de ejecutarlos.
- Revision de tool calls en frameworks de agentes: usarlo como filtro previo en LangChain, OpenHands o pipelines propios para validar que cada llamada a herramienta respete las politicas del despliegue.
- Sistemas de permisos graduales: clasificar automaticamente que acciones puede ejecutar un agente sin supervision y cuales deben escalar a un humano, reduciendo la fatiga de aprobaciones manuales.
- Auditoria y registro de seguridad: ejecutarlo sobre logs de sesiones de agentes para clasificar retroactivamente acciones de riesgo y alimentar informes de compliance.
- Ejecucion en CI/CD: incorporarlo como paso de verificacion en pipelines que ejecutan agentes de generacion de codigo, bloqueando acciones fuera de politica antes de que toquen el entorno de build.
- Sandboxes de desarrollo local: correrlo junto a un agente local (por ejemplo con Ollama) para anadir una capa de decision de permisos sin coste de API ni latencia perceptible, gracias a su tamano de menos de 1 GB.
- Investigacion en seguridad de agentes: usarlo como baseline o componente en experimentos sobre alineacion de agentes y mitigacion de acciones no autorizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) solo de pesos; con contexto y overhead, cabe comodamente en GPUs con 2-4 GB de VRAM, e incluso en CPU con RAM normal.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna sirve. Para el modelo base en f16 sin cuantizar, una RTX 3060 de 12 GB o superior es mas que suficiente.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU de los ultimos anos (GTX 1650, RTX 3060, RTX 4090, Mac con Apple Silicon) e incluso solo con CPU, dado el tamano de los ficheros GGUF (0,5-1,6 GB).
- Opciones de despliegue: llama.cpp y Ollama de forma nativa (formato GGUF); tambien compatible con LM Studio, llama-cpp-python y cualquier runtime que soporte GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM. Para ver la lista completa de ficheros, existe la pagina de resumen de mradermacher.
- Latencia y throughput: no disponible; por tamano (752M parametros), la latencia esperada es de milisegundos por token en GPU y del orden de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Foco |
|---|---|---|---|---|
| Vulcan Decision Shell v1 (este) | 752,39 M | Apache 2.0 | GGUF, safetensors | Guardrail para agentes: comandos, tool calls, permisos |
| Llama Guard 3 (Meta) | 8 000 M (8B) | Llama 3 Community | safetensors, GGUF (comunitario) | Moderacion de entradas/salidas y clasificacion de riesgo |
| ShieldGemma 2 (Google) | 4 000 M (4B) | Gemma Terms of Use | safetensors | Clasificador de seguridad de contenido |

Vulcan Decision Shell v1 es notablemente mas pequeno que las alternativas generalistas de seguridad (Llama Guard 3, ShieldGemma 2), lo que reduce drasticamente el coste de inferencia, a cambio de un alcance mas estrecho: seguridad de acciones de agentes (comandos y herramientas) frente a moderacion de contenido. Su licencia Apache 2.0 es mas permisiva que la de Llama Guard 3 o ShieldGemma para uso comercial sin restricciones adicionales. No hay datos de benchmarks publicados que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo especializado derivado de Qwen3.5, puede heredar sesgos del modelo base, pero no hay analisis publicados.
- Riesgo de alucinacion: en tareas de decision binaria el riesgo es de falsos positivos y falsos negativos; no hay datos publicados sobre tasas de error, por lo que no debe usarse como unico mecanismo de seguridad en produccion sin validacion propia.
- Idioma: el modelo esta etiquetado solo para ingles; su comportamiento con comandos o prompts en castellano no esta documentado y puede degradarse.
- Contexto: la longitud de contexto no esta publicada; para comandos o tool calls muy largos conviene verificarla empiricamente.
- Licencia: Apache 2.0, sin restricciones relevantes para uso comercial; conviene revisar igualmente la licencia del modelo base openvulcan/vulcan-decision-shell-v1.
- Caveats de produccion: no hay benchmarks publicados ni documentacion detallada del modelo base en la informacion disponible; se trata de un repositorio muy reciente (octubre de 2026) con pocos likes y descargas moderadas (688), por lo que carece de historial de uso en produccion. Las cuantizaciones son estaticas; las weighted/imatrix no estaban disponibles en el momento de publicacion.
- Esta ficha describe la cuantizacion GGUF de mradermacher, no el modelo original: para detalles de entrenamiento y diseno, la fuente primaria es el repositorio del modelo base.

## Enlaces

- Cuantizacion GGUF (esta ficha): https://huggingface.co/mradermacher/vulcan-decision-shell-v1-GGUF
- Modelo base: https://huggingface.co/openvulcan/vulcan-decision-shell-v1
- Pagina de resumen de ficheros de mradermacher: https://hf.tst.eu/model#vulcan-decision-shell-v1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del modelo base: no disponible
