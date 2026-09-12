# itsZyn/ZynDwarf-1.1

## Resumen

ZynDwarf 1.1 es un modelo de lenguaje causal, solo texto, de aproximadamente 354,5 millones de parámetros, publicado por el desarrollador itsZyn bajo el sello Zyn Models. Se trata de un ajuste fino (fine-tuning) del checkpoint LiquidAI/LFM2.5-350M, por lo que hereda la arquitectura LFM2 y su ventana de contexto nominal de 128.000 tokens. El modelo se distribuye en tres formatos: pesos Safetensors para Transformers, GGUF F16 (676,25 MiB) y GGUF Q4_K_M (216,41 MiB), todos bajo licencia Apache 2.0.

La propuesta del modelo es deliberadamente acotada: en lugar de competir en escala, se orienta a flujos de trabajo de agente en entornos con recursos muy limitados. Incorpora una plantilla de chat con soporte de herramientas al estilo OpenAI, serializando las llamadas como `<|tool_call_start|>[ToolName(arg='value')]<|tool_call_end|>`, y su conjunto de entrenamiento incluye ejemplos con selección de herramienta, interpretación de resultados, recuperación tras errores y ejemplos explícitos sin herramienta para reducir invocaciones innecesarias.

Es relevante ahora porque ocupa el nicho de modelos de menos de 500 M de parámetros que pueden ejecutarse en CPU, dispositivos móviles o GPUs de gama de entrada, con un coste de despliegue casi nulo. Conviene subrayar que, aunque la arquitectura soporta 128.000 tokens, el entrenamiento de esta release se limitó a secuencias de 768 tokens, lo que restringe severamente su comportamiento fiable en contextos largos pese a la capacidad teórica del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 / derivada de LFM2.5 |
| Parametros totales | 354.483.968 (354,48 M), segun safetensors y confirmado por llama.cpp |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens soportados por la arquitectura; limite de entrenamiento de esta release: 768 tokens |
| Tipos de cuantizacion | F16 (676,25 MiB) y Q4_K_M (216,41 MiB); tambien pesos Safetensors sin cuantizar |
| Idiomas soportados | Ingles y español (idiomas probados por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (sharded) y GGUF (F16 y Q4_K_M) |
| Modelo base | LiquidAI/LFM2.5-350M |
| Parametros de LoRA | r=8, alpha=16, dropout=0,05, modulos objetivo q/k/v |
| Tamano del repositorio | 2,4 GB |
| Fecha de publicacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint derivado de LFM2.5-350M, reparado por el autor, y se ajusta mediante LoRA con rango 8, alpha 16, dropout 0,05 y modulos objetivo q/k/v. La configuracion de entrenamiento es minima: una sola epoca, tasa de aprendizaje 1,5e-6 y acumulacion de gradiente de 4. El dataset, denominado `general_agent_v6`, contiene 1.613 secuencias deduplicadas previstas, de las cuales 1.503 se codificaron correctamente bajo el limite de 768 tokens; 308 secuencias incluyen interacciones reales con herramientas y 62 son conversaciones multi-turno. La composicion tematica cubre programacion, depuracion, uso de shell, JSON, comportamiento conversacional, razonamiento, planificacion, seleccion de herramienta, interpretacion de resultados y recuperacion de fallos, ademas de ejemplos sin herramienta para reducir invocaciones superfluas.

Una innovacion operativa destacable es la plantilla de chat con soporte de herramientas: acepta definiciones estructuradas estilo OpenAI mediante el argumento `tools=` de `transformers` y serializa las llamadas del asistente con los delimitadores `<|tool_call_start|>` y `<|tool_call_end|>`, preservando el contexto alrededor de los resultados de herramienta. Ademas, la release 1.1 corrige un problema de calidad detectado en la publicacion anterior: el artefacto Q4 del modelo General Agent previo era invalido a nivel de cabecera GGUF, por lo que el Q4_K_M actual se regenera directamente desde el F16 verificado y carga correctamente en llama.cpp reportando `Q4_K - Medium`. No se menciona uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles y español.
- Razonamiento ligero y planificacion de tareas sencillas.
- Programacion: generacion y depuracion de codigo, uso de shell y manejo de JSON.
- Tool calling / function calling con plantilla nativa y definiciones estilo OpenAI.
- Interpretacion de resultados de herramienta y recuperacion tras errores dentro de un bucle de agente.
- Soporte de conversaciones multi-turno (62 ejemplos de entrenamiento dedicados).
- Respuestas estructuradas y formato controlado mediante delimitadores propios.
- Modo sin herramienta: el entrenamiento incluye ejemplos explicitos para evitar invocaciones innecesarias.
- Capacidades multimodales: no disponibles (modelo solo texto).
- Modo de razonamiento explicito (thinking) o audio: no disponibles.

## Casos de uso

- Agentes locales en dispositivos con poca memoria: el artefacto Q4_K_M ocupa 216,41 MiB y puede cargarse en un movil o en una CPU modesta, actuando como planificador que decide cuando invocar una herramienta y cuando responder directamente.
- Automatizacion de tareas de sistema: integrado en un runtime que valide y ejecute las llamadas generadas, el modelo puede solicitar lecturas de memoria, listados de ficheros o consultas de estado, y despues interpretar el resultado antes de dar una respuesta final.
- Asistente de programacion embebido en editores: dado su enfoque en codigo, shell y JSON, encaja en asistentes que completan fragmentos, explican errores o proponen comandos, siempre con validacion humana previa.
- Enrutador de intenciones en pipelines de agentes: por su bajo coste, puede usarse como primera etapa que clasifica la peticion del usuario y decide si se responde con conocimiento propio o se delega en un modelo mayor o en una herramienta.
- Soporte conversacional bilingue de bajo coste: con cobertura de ingles y español, sirve para prototipos de atencion al cliente o bots internos donde el presupuesto de inferencia es el factor limitante.
- Formacion e investigacion: al ser un ajuste LoRA reproducible sobre un modelo base publico y Apache 2.0, es util como material didactico para estudiar pipelines de fine-tuning con tool calling en la clase de 350 M de parametros.
- Preprocesado y extraccion estructurada: generacion de JSON y respuestas con formato fijo para alimentar sistemas posteriores, con validacion del esquema en el lado del host.
- Ejecucion en el borde (edge) sin conectividad: al caber en F16 en menos de 700 MiB, permite despliegues offline en equipos industriales o dispositivos embebidos con recursos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el autor separa las pruebas propias del proyecto de los benchmarks publicados de otros modelos, y que ZynDwarf 1.1 no ha recibido puntuaciones que no haya obtenido realmente. Tampoco se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- Peso de los pesos en FP16: aproximadamente 0,7 GB (el GGUF F16 mide 676,25 MiB).
- Peso de los pesos en Q4_K_M: aproximadamente 0,22 GB (216,41 MiB).
- VRAM estimada para inferencia: por debajo de 1,5 GB en FP16 incluyendo cache KV para contextos cortos; por debajo de 1 GB en Q4_K_M. Son estimaciones derivadas del tamano de los artefactos, no cifras publicadas por el autor.
- Cache KV: no se dispone de datos de configuracion de capas y cabezas en la informacion proporcionada; a 128.000 tokens el consumo crecera de forma proporcional y probablemente exceda con holgura la memoria de los pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores; tambien es viable en iGPU modernas y en CPU pura.
- Cabe en GPU consumer: si, en la practica totalidad de las GPU dedicadas de los ultimos diez anyos, y tambien en moviles y placas tipo Raspberry Pi en cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, text-generation-webui) usando los GGUF; Transformers con los Safetensors; vLLM o TGI solo si el runtime soporta la arquitectura LFM2, extremo que debe verificarse antes de usarlo en produccion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| ZynDwarf 1.1 | ~354,5 M | 128.000 tokens en arquitectura; 768 tokens en entrenamiento | Apache 2.0 | HuggingFace y GGUF (F16, Q4_K_M) | Sin datos publicados |
| LiquidAI/LFM2.5-350M (modelo base) | ~350 M | 128.000 tokens (heredado) | Segun licencia de LiquidAI (verificar) | HuggingFace | No disponible en la informacion proporcionada |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens (segun documentacion publica) | Apache 2.0 | HuggingFace y GGUF | No disponible en la informacion proporcionada |
| SmolLM2-360M | ~362 M | 8.192 tokens (segun documentacion publica) | Apache 2.0 | HuggingFace y GGUF | No disponible en la informacion proporcionada |

Nota: los datos de los modelos alternativos proceden de su documentacion publica y deben verificarse antes de tomar decisiones; no se incluyen cifras de rendimiento porque no se dispone de resultados comparables verificados para ZynDwarf 1.1.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base de 350 M, es esperable un sesgo hacia los idiomas y dominios presentes en el dataset base y de ajuste, mayoritariamente ingles y español.
- Riesgo de alucinacion: alto, propio de la clase de 350 M de parametros y agravado por un dataset de ajuste de solo 1.503 secuencias.
- Brecha de contexto: aunque la arquitectura soporta 128.000 tokens, el ajuste se realizo con un limite de 768 tokens, por lo que el comportamiento fuera de esa ventana no esta entrenado ni validado.
- Cobertura limitada: 1.613 secuencias previstas, 308 con herramientas y solo 62 multi-turno; el modelo vera con frecuencia distribuciones alejadas de su conjunto de entrenamiento.
- Seguridad en agentes: la salida de herramienta del modelo no es una accion ejecutable. El host debe validar el nombre de la funcion y los argumentos, ejecutar la herramienta, anadir el resultado y volver a invocar al modelo. El modelo no debe usarse como frontera de permisos; el sandbox, el acceso a ficheros, la red, los secretos y las operaciones destructivas son responsabilidad de la aplicacion anfitriona. Nunca deben tratarse los comandos de shell generados como instrucciones de confianza.
- Historico de artefactos: la publicacion anterior contenia un GGUF Q4 invalido a nivel de cabecera; conviene verificar siempre la integridad del artefacto descargado.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones adicionales, pero debe comprobarse la licencia del modelo base LiquidAI/LFM2.5-350M, cuyos terminos no se detallan en la informacion proporcionada.
- Adopcion: cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Idiomas no soportados: no hay evidencia de capacidad en idiomas distintos del ingles y el español.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsZyn/ZynDwarf-1.1
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Repositorio de llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con ZynDwarf 1.1 ni con modelos de lenguaje.
