# aravindpersona/restraint-7b

# Restraint-7B

## Resumen

Restraint-7B es un modelo de lenguaje de 7.615.616.512 parámetros (7,62 B) publicado por el usuario aravindpersona en HuggingFace, derivado mediante ajuste fino de Qwen/Qwen2.5-7B-Instruct. Su propósito es corregir un comportamiento problemático habitual en modelos con soporte de function calling: la tendencia a invocar herramientas incluso cuando la pregunta puede responderse directamente con el conocimiento interno del modelo. El autor lo describe como un modelo de 7B "post-entrenado para responder preguntas de conocimiento sin llamar a herramientas y para llamarlas con precisión cuando realmente se necesitan".

La arquitectura es la de un transformer decoder-only de la familia Qwen2 (heredada íntegramente del modelo base), sin componentes MoE ni híbridos. El entrenamiento se hizo en dos etapas de QLoRA SFT sobre 450 trazas ReAct expertas y una posterior pasada correctiva de 350 ejemplos que arregló un fallo de datos que había colapsado el comportamiento de contención del modelo. La primera versión solo alcanzaba un 12% de contención en tareas sin herramienta; la v2 reporta un 94,1% y una precisión global del 92% (46/50) en la evaluación del propio autor.

Es relevante ahora porque ataca un coste real de producción: cada llamada innecesaria a una herramienta añade latencia, consume tokens y amplía la superficie de fallo. El modelo se distribuye con licencia Apache 2.0, con pesos safetensors y una cuantización GGUF Q4_K_M de 4,5 GB que el autor ha verificado en una RTX 2060 de 6 GB a unos 39 tok/s, lo que lo sitúa en el rango de despliegue en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parámetros totales | 7.615.616.512 (7,62 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base Qwen2.5-7B-Instruct |
| Tipos de cuantización | GGUF (Q4_K_M facilitado por el autor); safetensors en precisión completa |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Pipeline | text-generation |
| Tamaño del repositorio | 20,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-09-12 |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura del Qwen2.5-7B-Instruct sin modificaciones estructurales. Todo el trabajo se concentra en el post-entrenamiento mediante QLoRA. La etapa 1 consistió en un SFT con r=16 y α=32 sobre 450 trazas (200 de una sola herramienta, 150 de contención y 100 multi-paso). La etapa 2 (v2) fue una pasada correctiva de QLoRA SFT aplicada sobre los pesos ya fusionados de la etapa 1: 350 ejemplos (150 de contención con texto de razonamiento variado y el system prompt completo de definición de herramientas, más 200 de uso de herramienta y multi-paso), 2 épocas con learning rate 1e-4, en unos 13 minutos sobre una GPU L4.

El detalle técnico más relevante es la corrección del fallo de datos de la primera versión: las 150 demostraciones de contención originales compartían una única línea `<think>` enlatada y omitían el system prompt, de modo que el modelo nunca aprendió una frontera de decisión real entre responder directamente y llamar a una herramienta. El autor incluye además una comprobación de cordura post-entrenamiento que verifica que la magnitud de la matriz B del adaptador LoRA no sea trivial, para detectar el fallo silencioso de adaptador no operativo que produjo su primer intento con GRPO.

El contrato de salida es de completado en crudo (no formato chat): `<think>…</think>` seguido opcionalmente de `<tool_call>{"name":…,"arguments":{…}}</tool_call>`, con el `<observation>` inyectado por el harness, y una respuesta final dentro de `<answer>…</answer>`. Se entrenó sobre esa forma de prompt concreta, no sobre marcado de chat.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de conocimiento.
- Razonamiento explícito dentro de etiquetas `<think></think>` antes de responder o actuar.
- Tool calling / function calling con salida JSON estructurada en bloques `<tool_call>`.
- Selección de herramientas sobre un conjunto simulado de cinco: calculator, wikipedia, weather, code_executor y unit_converter.
- Contención deliberada: responde sin invocar herramientas en preguntas que puede resolver directamente (94,1% de tasa de contención en tareas sin herramienta, según el autor).
- Razonamiento multi-paso encadenado (22/22 en tareas de una herramienta y 9/9 en tareas multi-paso de la evaluación interna).
- Recuperación de errores cuando una herramienta devuelve un fallo (capacidad limitada: 1/2 en el conjunto retenido del Tier 4).
- Conformidad con un contrato de salida fijo que separa razonamiento, llamada a herramienta, observación y respuesta final.
- No se documentan capacidades de visión, audio ni modo thinking nativo más allá de las etiquetas de razonamiento entrenadas.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Agentes con tool calling en producción: el modelo emite llamadas JSON bien formadas y espera la observación real en lugar de fabricarla, lo que permite integrarlo en bucles de agente donde el resultado de la herramienta lo inyecta el orquestador. Su tasa declarada de 22/22 en tareas de una sola herramienta lo hace adecuado para flujos de selección de herramienta poco ambiguos.
- Reducción de latencia y coste en asistentes: al abstenerse de llamar a herramientas en preguntas que ya sabe responder (94,1% de contención), evita round-trips innecesarios al backend y recorta el gasto en tokens de observación.
- Enrutado de consultas entre respuesta directa y herramienta: puede usarse como clasificador de decisión dentro de un pipeline mayor, decidiendo si una consulta requiere calculator, wikipedia o ninguna herramienta antes de delegar en otro sistema.
- Razonamiento multi-paso con verificación: tareas que requieren encadenar varias llamadas y consolidar resultados (9/9 en el Tier 3 del autor), por ejemplo conversiones de unidades combinadas con cálculos o consultas encadenadas.
- Despliegue en hardware de consumo o edge: la cuantización Q4_K_M de 4,5 GB verificada en una RTX 2060 de 6 GB permite servir el modelo en estaciones de trabajo modestas, portátiles con GPU discreta o equipos de laboratorio sin aceleradores de datacenter.
- Generación y evaluación de código asistida: mediante la herramienta code_executor, el modelo puede plantear una ejecución de código, esperar el resultado real y corregir su respuesta en función de la observación devuelta.
- Evaluación de comportamiento de tool use: sirve como referencia para medir la tendencia al sobre-uso de herramientas en otros modelos, comparando tasas de contención y de acierto bajo el mismo harness determinista con temperatura 0.

## Benchmarks y rendimiento

El autor publica una evaluación propia de 50 tareas estratificadas, con los mismos identificadores de tarea en todas las ejecuciones, temperatura 0, un ejecutor de herramientas determinista real y puntuación canónica `is_correct` (sin juez LLM). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | Pre-fix (solo SFT) | Restraint-7B v2 |
|---|---|---|
| Precisión de tarea | 54%* | 92% (46/50) |
| Tasa de contención (tareas sin herramienta, 0 llamadas) | 12% (2/17) | 94,1% (16/17) |
| Tier 1, una sola herramienta | — | 22/22 |
| Tier 3, multi-paso | — | 9/9 |
| Tier 4, recuperación de errores (retenido) | — | 1/2 |

*El autor advierte que las trazas pre-fix se generaron contra una instantánea obsoleta del entorno y se puntuaron con un harness que permitía al modelo fabricar sus propios bloques `<observation>`; deben tratarse como direccionales y no comparables con las cifras v2. Auditoría de fallos de la v2: de los 4 fallos, 3 corresponden a rigidez del scorer en respuestas de contención definicionales (semánticamente correctas pero con redacción distinta a la cadena de referencia) y 1 es un fallo genuino de recuperación de errores en el conjunto retenido.

## Requisitos de hardware

- Pesos completos en safetensors (bf16/fp16): aproximadamente 15,2 GB de pesos; en la práctica se recomiendan 16-20 GB de VRAM para inferencia con overhead de contexto.
- Cuantización GGUF Q4_K_M: 4,5 GB de archivo, verificado por el autor en una RTX 2060 de 6 GB a unos 39 tok/s.
- Cabe en GPU de consumo: sí, con Q4_K_M en GPUs de 6 GB o más; en RTX 3090, RTX 4090 o similares (24 GB) caben cuantizaciones mayores e incluso fp16 sin problemas.
- GPU de datacenter (A100, H100) recomendadas para precisión completa, contextos largos y lotes grandes.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para GGUF; transformers y vLLM sobre los pesos fusionados en safetensors.
- Latencia y throughput: único dato publicado por el autor, ~39 tok/s en RTX 2060 con Q4_K_M; no hay cifras para otras GPU ni para servicios con batching.
- Advertencia de despliegue: al servir mediante `/completion` de llama.cpp hay que añadir `</tool_call>` (y `<observation>`) a la lista de stop tokens; de lo contrario el modelo continúa más allá de su propia llamada y fabrica una observación en lugar de esperar la real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Restraint-7B | 7,62 B | Heredado del base (no especificado en la model card) | Tool use con contención entrenada | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| Qwen2.5-7B-Instruct | 7,62 B | 32.768 nativos, hasta 131.072 con YaRN según la documentación del base | Instrucción general y tool use | Apache 2.0 | HuggingFace |
| Fara-7B (Microsoft Research) | No disponible | No disponible | Modelo agéntico para computer use | No disponible | Paper de Microsoft Research |

La comparación directa con el modelo base es la más informativa: Restraint-7B no cambia arquitectura, tamaño ni contexto, sino que redistribuye el comportamiento de decisión sobre herramientas. Frente a alternativas genéricas de la misma categoría, su ventaja declarada está en la contención y no en el conocimiento general, por lo que los benchmarks abiertos de propósito general no son su terreno. No se dispone de datos públicos que permitan comparar su rendimiento con otros modelos de tool use de 7B bajo el mismo harness.

## Limitaciones y advertencias

- Las cinco herramientas son un conjunto simulado y determinista (calculator, wikipedia, weather, code_executor, unit_converter). La suite mide selección de herramienta, formato y fidelidad a la salida de la herramienta, no integración con APIs reales. La generalización a ecosistemas de APIs en vivo no está verificada.
- La evaluación se basa en una muestra de 50 tareas, con intervalos de confianza amplios (aproximadamente ±14 puntos porcentuales al 95%). El Tier 4 retenido tiene n=2 y sus resultados son anecdóticos.
- Los Tiers 1 a 3 están dentro de la distribución de entrenamiento; solo el Tier 4 es una partición realmente retenida. Las cifras de 92% de precisión y 94,1% de contención proceden de tareas mayoritariamente vistas durante el entrenamiento.
- Riesgo de alucinación relevante en el bucle de agente: si el harness de despliegue no configura correctamente los stop tokens, el modelo puede generar `<observation>` falsas y contaminar silenciosamente las evaluaciones y las respuestas en producción.
- Formato de uso restrictivo: fue entrenado sobre una plantilla de completado en crudo con etiquetas propias, no sobre el marcado de chat estándar. Usarlo con plantillas de chat convencionales puede degradar su comportamiento de decisión.
- Recuperación de errores limitada: un fallo genuino en el Tier 4 retenido, sin datos suficientes para caracterizar su robustez ante errores de herramienta en producción.
- Idiomas soportados no documentados en la model card, por lo que no se puede garantizar un rendimiento multilingüe más allá del heredado del modelo base.
- Sin métricas estándar (MMLU, HumanEval, GSM8K): no es posible situar el modelo frente al estado del arte en razonamiento general, matemáticas o código.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de las cifras publicadas por el autor.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones anteriores (tool set simulado, evaluación reducida) condicionan su idoneidad en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aravindpersona/restraint-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de entrenamiento y evaluación (harness, suite de tareas, diff de reparación de ground truth y trazas en crudo): https://github.com/harneet2512/Codetune
- Fara-7B: An Efficient Agentic Model for Computer Use (Microsoft Research, referencia sobre modelos agénticos pequeños): https://www.microsoft.com/en-us/research/wp-content/uploads/2025/11/Fara-7B-An-Efficient-Agentic-Model-for-Computer-Use.pdf

Nota: el resto de resultados de la búsqueda web disponible no guarda relación con este modelo y se ha omitido.
