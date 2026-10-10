# manjunathshiva/opendecider-small-GGUF

## Resumen

OpenDecider-small GGUF es la versión cuantizada en formato GGUF de OpenDecider-small, un modelo de decisión de 4.022.468.096 parámetros (aproximadamente 4B) desarrollado por manjunathshiva. No es un modelo generativo al uso: responde preguntas tipadas (`choice`, `score`, `noul` para sí/no) sobre cualquier texto o JSON devolviendo una probabilidad para cada opción, en lugar de redactar una respuesta. El paquete `opendecider` construye el prompt exacto con el que se entrenó el modelo y extrae las probabilidades de las opciones a partir de los log-probabilities de los tokens del servidor.

Esta build concreta existe para ejecutar el modelo en LM Studio, Ollama y cualquier runtime basado en llama.cpp, sin necesidad de GPU de datacenter ni de PyTorch. El autor la recomienda para decisiones que el modelo no ha visto antes (zero-shot sobre preguntas tipadas), y sitúa la build Q8_0 como la opción de referencia: mantiene la misma respuesta top que el modelo en precisión completa en 1.975 de 2.000 preguntas (98,8%) con una accuracy de 0,669 frente a 0,671 del modelo en bf16.

Su relevancia práctica está en el encaje como componente de enrutado y clasificación dentro de agentes: se integra vía MCP (Claude Code, Claude Desktop, Cursor), expone una API compatible con Jev en `/v1/systemone` y ofrece integraciones con agno, LangChain, LlamaIndex, CrewAI, Agent Framework, Google ADK, PydanticAI y Strands. La licencia Apache 2.0 y su tamaño contenido lo hacen apto para despliegue local en producción. El modelo solo soporta inglés y el repositorio acumula 506 descargas y 0 likes, por lo que la validación comunitaria es todavía muy limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura del modelo base) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (4,3 GB) y Q4_K_M (2,5 GB); el modelo base en precision completa usa bf16 (8 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Pipeline declarado | zero-shot-classification |
| Modelo base | manjunathshiva/opendecider-small (relacion: quantized) |
| Tamano del repositorio | 6,8 GB |
| Descargas / likes | 506 / 0 |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo base (transformer, MoE, híbrido u otra), el número de tokens de entrenamiento ni la composición del dataset. Tampoco se documentan las fases de alineación (RLHF, DPO u otras). Lo que sí se describe con precisión es el paradigma de uso: OpenDecider es un «decision model» de tipo system-one que, dado un texto o JSON y una definición de decisión tipada, devuelve una distribución de probabilidad sobre las opciones en lugar de generar texto libre. Los tipos de decisión documentados en los ejemplos son `choice` (elección entre criterios etiquetados), `score` y `noul` (pregunta de sí/no).

Esta build GGUF es una cuantización del modelo base, no un reentrenamiento. El autor aporta evidencia empírica de que la cuantización preserva el comportamiento: medido a través del motor llama.cpp de Ollama (y con log-probabilities idénticos en LM Studio sobre el mismo archivo), el Q8_0 coincide con el modelo en precisión completa en la respuesta top en 1.975 de 2.000 preguntas, mientras que el Q4_K_M baja a 1.857 de 2.000. Un detalle técnico importante es que el modelo espera un prompt construido de forma exacta por el paquete `opendecider`; el endpoint `/v1/systemone` propio de Ollama (0.35.1+) genera un prompt distinto, lo que según el autor cuesta unos 9 puntos de accuracy (0,583 frente a 0,669).

## Capacidades

- Clasificación zero-shot con opciones tipadas: decisión de tipo `choice` entre categorías definidas por el usuario con criterios textuales, más tipos `score` y `noul` (sí/no).
- Salida probabilística calibrada: devuelve una probabilidad por opción, no una etiqueta seca, lo que permite fijar umbrales de confianza y derivar a un humano las decisiones dudosas.
- Lectura de log-probabilities del servidor: el paquete `opendecider` construye el prompt exacto de entrenamiento y lee las probabilidades de los tokens de opción.
- Enrutado de decisiones sobre texto plano o JSON arbitrario, útil para preclasificar entradas antes de pasarlas a otro modelo o herramienta.
- Integración con asistentes de IA vía MCP: expone las herramientas `decide`, `choose`, `yes_no` y `score` a clientes como Claude Code, Claude Desktop y Cursor.
- Integraciones con frameworks de agentes: agno (incluido un `DecisionRouter` con `fallback` y `min_confidence`), LangChain, LlamaIndex, CrewAI, Agent Framework, Google ADK, PydanticAI y Strands.
- Servidor HTTP compatible con la API Jev: `POST /v1/systemone` en `http://localhost:8000` mediante `opendecider serve`.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling genérico ni modo de razonamiento extendido; la model card describe el modelo exclusivamente como clasificador de decisiones.

## Casos de uso

- Enrutado de tickets de soporte: definir una decisión `choice` con criterios como facturación, técnico y otros, y enrutar cada ticket al equipo correspondiente usando la probabilidad de cada opción; el propio autor incluye este ejemplo con una consulta de facturación duplicada.
- Detección de riesgo de abandono (churn): una decisión de tipo sí/no sobre el texto del cliente («¿el usuario amenaza con cancelar o irse?») permite marcar cuentas en riesgo dentro de un CRM sin entrenar un clasificador específico.
- Automatización con umbral de confianza: usar `min_confidence` en el `DecisionRouter` de agno para ejecutar automáticamente las decisiones claras y escalar a un agente humano las que queden por debajo del umbral (el ejemplo de la model card usa 0,6).
- Clasificación de correo entrante y triaje documental: aplicar decisiones tipadas sobre el cuerpo del mensaje o sobre campos JSON para etiquetar departamento, urgencia o intención antes de pasarlo a un modelo generativo.
- Componente de decisión dentro de agentes multi-paso: dar al agente una herramienta MCP que devuelva probabilidades en lugar de texto, de modo que el planificador solo actúe cuando la respuesta es suficientemente segura.
- Moderación y filtrado de contenido: clasificaciones binarias o de categorías múltiples sobre textos de usuario, ejecutadas en local sin enviar datos a APIs externas.
- Preetiquetado en pipelines de anotación: generar etiquetas con su probabilidad asociada para que los anotadores revisen primero los casos de baja confianza.
- Clasificación de formularios y campos estructurados: al aceptar entradas JSON, puede decidir sobre campos concretos de un registro sin necesidad de preprocesar el texto.

## Benchmarks y rendimiento

El autor publica resultados sobre un conjunto propio denominado typed-decisions, con 2.000 preguntas, medidos a través del motor llama.cpp de Ollama. La métrica «same top answer as full precision» indica en cuántas de esas 2.000 preguntas la build cuantizada devuelve la misma respuesta principal que el modelo en precisión completa.

| Archivo | Tamano | Misma respuesta top que precision completa | Accuracy |
|---|---|---|---|
| full precision (PyTorch, bf16) | 8 GB | (referencia) | 0,671 |
| `opendecider-small-q8_0.gguf` | 4,3 GB | 1.975 / 2.000 (98,8%) | 0,669 |
| `opendecider-small-q4_k_m.gguf` | 2,5 GB | 1.857 / 2.000 (92,8%) | 0,658 |

Dato adicional aportado por el autor: usar el endpoint `/v1/systemone` nativo de Ollama (0.35.1+) en lugar del prompt de `opendecider` reduce la accuracy a 0,583 (unos 9 puntos menos que 0,669). No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- Q4_K_M (2,5 GB de pesos): pensado por el autor para máquinas con poca memoria. Cabe en GPUs consumer de gama baja y en equipos con memoria unificada o RAM reducida; estimación práctica de 4-6 GB de memoria total contando contexto y overhead del runtime.
- Q8_0 (4,3 GB de pesos, build recomendada): estimación de 6-8 GB de memoria, por lo que entra en GPUs de 8 GB como RTX 3060 Ti, RTX 4060 o RTX 2070, y en Apple Silicon con 8-16 GB de memoria unificada.
- Precisión completa en bf16 (8 GB de pesos): requiere del orden de 10-12 GB de memoria; adecuada para RTX 4080/4090, A100, H100 o GPUs profesionales con 16 GB o más.
- Inferencia en CPU: viable mediante llama.cpp gracias al formato GGUF, aunque no se publican cifras de latencia ni throughput.
- Opciones de despliegue documentadas: llama.cpp, LM Studio (buscando `opendecider-small-GGUF`), Ollama (`ollama pull hf.co/manjunathshiva/opendecider-small-GGUF:Q8_0`), vLLM (guía de serving) y servidor propio con `opendecider serve`.
- Aviso específico para Mac y LM Studio: el motor MLX de LM Studio no devuelve log-probabilities, por lo que hay que cargar la variante GGUF por nombre; para MLX existe una build aparte, `opendecider-small-mlx-8bit`, con `pip install "opendecider[mlx]"`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos de terceros comparables (clasificadores zero-shot de tamaño similar) en la información proporcionada. La comparación posible es entre las propias variantes del modelo:

| Variante | Formato | Tamano de pesos | Accuracy (typed-decisions) | Licencia | Uso previsto |
|---|---|---|---|---|---|
| OpenDecider-small full precision | safetensors (bf16) | 8 GB | 0,671 | apache-2.0 | Referencia en PyTorch |
| `opendecider-small-q8_0.gguf` | GGUF Q8_0 | 4,3 GB | 0,669 | apache-2.0 | Build recomendada para llama.cpp, LM Studio y Ollama |
| `opendecider-small-q4_k_m.gguf` | GGUF Q4_K_M | 2,5 GB | 0,658 | apache-2.0 | Equipos con poca memoria |
| `opendecider-small-mlx-8bit` | MLX 8-bit | no disponible | no disponible | apache-2.0 | Apple Silicon con el runtime MLX |

Comparativa con alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`language: [en]`); no hay evidencia de funcionamiento fiable en castellano ni en otros idiomas.
- Acoplamiento al prompt de entrenamiento: usar el endpoint `/v1/systemone` nativo de Ollama en lugar del prompt que construye el paquete `opendecider` cuesta unos 9 puntos de accuracy (0,583 frente a 0,669) según el propio autor.
- Limitación del motor MLX: LM Studio con MLX no devuelve log-probabilities, así que en Mac hay que usar la build GGUF o migrar a la variante MLX específica.
- Pérdida de fidelidad en cuantizaciones agresivas: Q4_K_M difiere de la precisión completa en 143 de 2.000 preguntas (92,8% de coincidencia) y baja la accuracy a 0,658; el autor recomienda Q8_0 cuando la memoria lo permite.
- Riesgo de error en decisiones no vistas: aunque el modelo está pensado para zero-shot, su accuracy publicada en el conjunto typed-decisions es de 0,669, es decir, aproximadamente un tercio de las decisiones serían incorrectas si se aceptaran sin umbral de confianza; se recomienda usar `min_confidence` y un `fallback` humano.
- Alcance funcional restringido: no es un modelo generativo; no debe esperarse de él redacción, resumen, código ni razonamiento multi-paso en lenguaje natural.
- Licencia: apache-2.0, que permite uso comercial y modificación, con los requisitos habituales de atribución y conservación del aviso de licencia; conviene verificar las condiciones del modelo base por si añadiera restricciones adicionales (la model card del GGUF solo declara apache-2.0).
- Madurez del ecosistema: el repositorio tiene 506 descargas y 0 likes, sin validación comunitaria amplia; las integraciones dependen de versiones mínimas concretas del paquete `opendecider` (`>=0.2.1` con `serve`, `>=0.3.0` con `mcp`, `>=0.4.0` con `agno`).
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni equidad en la información disponible.
- Longitud de contexto: no disponible, por lo que no puede garantizarse el comportamiento con entradas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manjunathshiva/opendecider-small-GGUF
- Modelo base: https://huggingface.co/manjunathshiva/opendecider-small
- Build MLX 8-bit: https://huggingface.co/manjunathshiva/opendecider-small-mlx-8bit
- Repositorio del paquete: https://github.com/manjunathshiva/opendecider
- Documentación: https://manjunathshiva.github.io/opendecider/
- Guía de inicio: https://manjunathshiva.github.io/opendecider/getting-started/
- Elección de modelo: https://manjunathshiva.github.io/opendecider/models/
- Guía de serving: https://manjunathshiva.github.io/opendecider/guides/serve/
- Guía de servidores de modelo (LM Studio, Ollama, vLLM): https://manjunathshiva.github.io/opendecider/guides/model-servers/
- Guía de automatización con decisiones confiables: https://manjunathshiva.github.io/opendecider/guides/confident-automation/
- Guía de asistentes de IA (MCP): https://manjunathshiva.github.io/opendecider/guides/mcp/
- Referencia de la API Python: https://manjunathshiva.github.io/opendecider/reference/python-api/
- Referencia de la API HTTP: https://manjunathshiva.github.io/opendecider/reference/http-api/
