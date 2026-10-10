# manjunathshiva/opendecider-small-mlx-8bit

## Resumen

OpenDecider-small MLX 8-bit es una version cuantizada a 8 bits del modelo de decision OpenDecider-small (aproximadamente 4B parametros) publicado por el usuario manjunathshiva, empaquetada especificamente para Apple Silicon mediante la biblioteca MLX. Se trata de un modelo de clasificacion zero-shot orientado a la toma de decisiones tipadas: recibe una pregunta con un tipo definido (choice, score o noul) sobre un texto o un JSON y devuelve una probabilidad calibrada para cada opcion. El problema que aborda es el de insertar decisiones rapidas y repetibles dentro de agentes y pipelines sin necesidad de invocar un LLM generativo completo.

Su relevancia actual radica en el enfoque que el autor denomina "system one": resolver el siguiente paso de un flujo de agente en un unico forward pass, con una latencia y un consumo de memoria muy inferiores a los de un modelo generativo general. Esta version ocupa 4,0 GB en disco (frente a los 8 GB del modelo completo) y aproximadamente 4,5 GB de memoria durante la inferencia, y segun el autor mantiene las mismas respuestas que el modelo completo en 399 de 400 preguntas generales y en 1.955 de 2.000 preguntas de decision tipada. La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

El modelo se distribuye junto a un ecosistema de integraciones (LangChain, LlamaIndex, Agno, CrewAI, Microsoft Agent Framework, Google ADK, PydanticAI, Strands Agents y Mastra) que lo usan como enrutador de agentes y como guardarrai de seguridad frente a jailbreaks e inyeccion de prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada por el autor; las etiquetas del repositorio indican qwen3 |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe tambien el modelo base sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX, biblioteca mlx) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Las etiquetas del repositorio incluyen qwen3, lo que apunta a que el modelo base parte de la familia Qwen3, pero el autor no confirma ni describe la arquitectura en la informacion disponible. Se trata de un modelo denso de aproximadamente 4B parametros, publicado como un merge del modelo base manjunathshiva/opendecider-small y posteriormente cuantizado a 8 bits para MLX. El pipeline declarado es zero-shot-classification.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es el uso de decisiones tipadas (choice, score, noul) con salida de probabilidad calibrada por opcion, junto con el enfoque "system one" que resuelve el enrutamiento en un unico forward pass sin llamada a un LLM. El autor indica que esta build concreta no fue evaluada como guardarrai; la variante opendecider-small-td es la que se presenta como referencia medida en esa tarea.

## Capacidades

- Decision tipada sobre texto o JSON con tres tipos de pregunta: choice (elegir entre varias opciones), score (puntuacion) y noul (comprobaciones de si/no).
- Salida de probabilidad calibrada para cada opcion, lo que permite aplicar umbrales de confianza.
- Clasificacion zero-shot: las categorias se definen en la propia consulta, sin reentrenamiento.
- Enrutamiento de agentes: DecisionRouter elige el siguiente paso de un workflow en un forward pass y deriva los casos dudosos a un fallback.
- Tool calling: decision_tools() expone las herramientas decide, choose, yes_no y score a un agente.
- Guardarrai de seguridad: opendecider.guard realiza dos comprobaciones de si/no para detectar jailbreak e inyeccion de prompts, y bloquea el texto que no puede verificar.
- Integraciones con frameworks: LangGraph y LangChain, LlamaIndex, Agno, CrewAI, Microsoft Agent Framework, Google ADK, PydanticAI, Strands Agents y Mastra (TypeScript) a traves de MCP.
- Cliente TypeScript @opendecider/client con puntos de entrada para Vercel AI SDK y Mastra, funcionando contra opendecider serve, Ollama, LM Studio o vLLM.
- Trazabilidad en produccion: route.decide(text) devuelve la ruta junto con su razon, confianza y latencia, admite callbacks (on_decision=), politica de error (on_error="fallback") y emite spans de OpenTelemetry.
- No genera texto libre: su salida son decisiones y puntuaciones, no respuestas redactadas.

## Casos de uso

- Triaje de soporte al cliente: DecisionRouter clasifica cada mensaje entrante (por ejemplo, facturacion, soporte tecnico o atencion humana) en un unico forward pass, sin coste de una llamada a un LLM, y envia los casos con confianza inferior al umbral (min_confidence) a un agente humano.
- Guardarrai de agentes en produccion: opendecider.guard analiza tanto lo que escribe el usuario como los documentos, paginas web y resultados de herramientas que lee el agente, bloqueando textos con indicios de jailbreak o inyeccion de prompts antes de que el LLM los procese.
- Deteccion de riesgo de abandono: con una pregunta de tipo noul sobre el texto del cliente (por ejemplo, si amenaza con cancelar el plan), se obtiene una senal binaria reutilizable en un sistema de retencion.
- Enrutamiento de peticiones en pipelines de atencion: separar facturacion, incidencias tecnicas y consultas generales a partir de criterios definidos en la propia consulta, sin mantener un clasificador entrenado a medida.
- Asignacion de tareas en equipos de agentes: el TaskAssigner de CrewAI entrega cada tarea al miembro cuyo rol encaja, usando el modelo como selector dentro del flujo multiagente.
- Automatizacion basada en confianza: el flujo "confident automation" permite ejecutar automaticamente solo las decisiones cuya probabilidad supera un umbral y derivar el resto a revision, reduciendo el riesgo de acciones erroneas.
- Puntuacion y priorizacion: el tipo score permite ordenar elementos (por ejemplo, priorizar tickets o candidatos) obteniendo una puntuacion numerica por elemento.
- Inferencia local con privacidad en Mac: al ejecutarse sobre MLX en Apple Silicon, todo el procesado de decisiones puede permanecer en el equipo del usuario, sin enviar texto sensible a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son metricas de coincidencia con el modelo completo y de consumo de recursos:

| Metrica | Valor |
|---|---|
| Coincidencia de respuestas con el modelo completo en preguntas generales | 399 de 400 |
| Coincidencia de respuestas con el modelo completo en decisiones tipadas | 1.955 de 2.000 |
| Tamano en disco | 4,0 GB (frente a 8 GB del modelo completo) |
| Memoria durante la inferencia | aproximadamente 4,5 GB |
| Velocidad | aproximadamente 2x frente a PyTorch en Apple Silicon (segun el autor) |
| Evaluacion como guardarrai | No realizada para esta build; la referencia medida es opendecider-small-td |

Segun la informacion disponible, la variante opendecider-small-td, medida como guardarrai sobre 2.438 prompts de tres datasets publicos, detecta tantos ataques como el guard de Laya con la mitad de falsos positivos; el texto disponible aparece truncado en ese punto.

## Requisitos de hardware

- Inferencia prevista sobre Apple Silicon mediante MLX; el autor indica aproximadamente 4,5 GB de memoria durante la respuesta.
- Tamano en disco de 4,0 GB, por lo que cabe en equipos Apple Silicon con 8 GB de memoria unificada o superior.
- No se proporcionan requisitos ni rendimientos para GPUs NVIDIA (A100, H100, RTX 4090); esta build esta empaquetada para MLX y no se ofrecen datos de CUDA.
- Opciones de despliegue mencionadas por el autor: MLX, opendecider serve, Ollama, LM Studio y vLLM.
- Guias especificas de despliegue publicadas para servir el modelo y para LM Studio, Ollama y vLLM.
- Latencia y throughput concretos: no disponibles; el unico dato es la mejora aproximada de 2x frente a PyTorch en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / backend | Memoria | Licencia | Notas |
|---|---|---|---|---|---|
| opendecider-small-mlx-8bit | 4,02B | MLX 8-bit (safetensors) | 4,0 GB en disco, 4,5 GB en inferencia | Apache-2.0 | Objeto de esta ficha; optimizado para Apple Silicon |
| opendecider-small (modelo base) | 4B | safetensors (sin cuantizar) | aproximadamente 8 GB | Apache-2.0 | Version completa; referencia de calidad usada por el autor |
| opendecider-small-td | no disponible | no disponible | no disponible | Apache-2.0 | Variante medida como guardarrai por el autor |

No se dispone de datos suficientes para comparar con modelos generativos generales de tamano similar (por ejemplo, otros modelos de 4B), ya que OpenDecider esta especializado en clasificacion y decision tipada y no en generacion de texto libre; la comparacion directa no seria representativa.

## Limitaciones y advertencias

- Unico idioma declarado: ingles; no se documenta soporte multilingue.
- No es un modelo generativo: no produce texto libre, solo decisiones y puntuaciones, por lo que no puede sustituir a un LLM en tareas de redaccion o razonamiento abierto.
- Esta build no fue benchmarkeada como guardarrai; el propio autor remite a opendecider-small-td como la variante medida para esa funcion.
- La cuantizacion a 8 bits puede introducir pequenas desviaciones en la calibracion de las probabilidades respecto al modelo completo.
- No se documentan datos de entrenamiento, composicion del dataset ni proceso de alineacion, por lo que los sesgos del modelo son desconocidos.
- Riesgo de decisiones erroneas: el autor recomienda usar umbrales de confianza y una politica de fallback (on_error="fallback", min_confidence) para derivar los casos dudosos.
- Limitacion de plataforma: la build esta pensada para MLX y Apple Silicon; su uso en GPUs NVIDIA requeriria conversion a otro formato y no se documenta.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento en el producto final.
- Para produccion conviene instrumentar las decisiones (razon, confianza, latencia, spans de OpenTelemetry) y monitorizar la tasa de fallback.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manjunathshiva/opendecider-small-mlx-8bit
- Modelo base: https://huggingface.co/manjunathshiva/opendecider-small
- Variante medida como guardarrai: https://huggingface.co/manjunathshiva/opendecider-small-td
- Documentacion general: https://manjunathshiva.github.io/opendecider/
- Guia de inicio: https://manjunathshiva.github.io/opendecider/getting-started/
- Eleccion de modelo: https://manjunathshiva.github.io/opendecider/models/
- Guia de serving: https://manjunathshiva.github.io/opendecider/guides/serve/
- Guia de LM Studio, Ollama y vLLM: https://manjunathshiva.github.io/opendecider/guides/model-servers/
- Automatizacion de decisiones confiadas: https://manjunathshiva.github.io/opendecider/guides/confident-automation/
- Referencia de la API Python: https://manjunathshiva.github.io/opendecider/reference/python-api/
- Referencia de la API HTTP: https://manjunathshiva.github.io/opendecider/reference/http-api/
- Guia de frameworks de agentes: https://manjunathshiva.github.io/opendecider/guides/agent-frameworks/
- Repositorio y ejemplos: https://github.com/manjunathshiva/opendecider
- Ejemplos de frameworks: https://github.com/manjunathshiva/opendecider/tree/main/examples/agent_frameworks
- Cliente TypeScript en npm: https://www.npmjs.com/package/@opendecider/client
