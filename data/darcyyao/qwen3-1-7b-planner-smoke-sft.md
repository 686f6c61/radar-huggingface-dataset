# darcyyao/qwen3-1.7b-planner-smoke-sft

## Resumen

`qwen3-1.7b-planner-smoke-sft` es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B de Alibaba, publicado por el usuario darcyyao en Hugging Face. El modelo está especializado en planificación de tool calling: aprende a descomponer consultas, invocar herramientas concretas (`knowledge_search`, `calculator`, `get_weather`, `get_election`) durante un máximo de tres rondas y cerrar la respuesta con una línea `Answer:`. Se trata de un experimento de ajuste ("smoke") más que de un modelo de producción, con 0 descargas y 0 likes en el momento de la consulta.

La relevancia técnica reside en su enfoque: en lugar de buscar un modelo generalista, el autor demuestra que un SFT ligero sobre un modelo pequeño (1.720.574.976 parámetros) puede mejorar métricas específicas de planificación de herramientas, como la tasa de llamadas inválidas (del 4,4 % al 1,2 %), el exceso de coste por consulta (de 0,16 a 0,04) y la tasa de paralelización en tareas fan-out (del 50,0 % al 88,9 %). El modelo base Qwen3-1.7B aporta la arquitectura transformer densa y el tokenizador multilingüe de la familia Qwen3.

El modelo se distribuye en formato safetensors (3,5 GB de repositorio) y es compatible con transformers, text-generation-inference y endpoints. No se especifican licencia ni idiomas soportados en la información disponible, lo que limita su uso comercial sin verificación adicional. Su valor principal es como referencia metodológica para pipelines de tool calling con modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-1.7B, un transformer denso de la familia Qwen3. El ajuste se realizó mediante SFT (supervised fine-tuning) con las librerías Unsloth y TRL, según las etiquetas de la model card. El objetivo del entrenamiento es enseñar al modelo un protocolo concreto de planificación: seleccionar entre cuatro herramientas (`knowledge_search`, `calculator`, `get_weather`, `get_election`), ejecutar como máximo tres rondas de llamadas y finalizar con una línea `Answer:`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

La innovación técnica destacable no está en la arquitectura sino en el protocolo de planificación y en la evaluación: el autor publica un benchmark propio, PlannerQA-Bench (held-out), con familias de tareas como `kb_bridge`, `kb_compare`, `weather_lookup`, `election_lookup`, `fanout_calc`, `tool_bridge`, `composite` y `no_tool`. Los resultados muestran mejoras sustanciales en varias familias, aunque también regresiones notables en `composite` (del 33,3 % al 0,0 %) y `no_tool` (del 100,0 % al 66,7 %). El código del pipeline está disponible en el repositorio de GitHub indicado por el autor.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a planificación de herramientas.
- Tool calling / function calling con cuatro herramientas predefinidas: `knowledge_search`, `calculator`, `get_weather`, `get_election`.
- Planificación en hasta tres rondas de llamadas a herramientas, con cierre en línea `Answer:`.
- Paralelización de llamadas en tareas fan-out (tasa del 88,9 % en el conjunto de evaluación).
- Reducción de llamadas inválidas (1,2 % frente al 4,4 % del base).
- Capacidades multilingües: no disponibles en la información proporcionada (heredadas potencialmente del base Qwen3, pero no confirmadas).
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Asistentes de atención al cliente con acceso a base de conocimiento: el modelo puede decidir cuándo invocar `knowledge_search` y cuándo responder directamente, con una tasa de llamadas innecesarias del 4,2 % en evaluación.
- Automatización de consultas meteorológicas: la familia `weather_lookup` alcanza un 100 % de good rate tanto en base como en SFT, lo que lo hace adecuado para integraciones de clima en chatbots.
- Consulta de resultados electorales: la familia `election_lookup` mejora del 83,3 % al 100 %, útil para asistentes de información cívica con datos estructurados.
- Cálculos encadenados con fan-out: la familia `fanout_calc` sube del 33,3 % al 83,3 %, adecuada para pipelines que necesitan paralelizar varias operaciones aritméticas antes de sintetizar.
- Enrutamiento de herramientas en agentes ligeros: con 1,7 B de parámetros, puede desplegarse en entornos con recursos limitados para decidir qué herramienta invocar en cada turno.
- Evaluación comparativa de pipelines de tool calling: sirve como referencia para medir mejoras de SFT frente al base en métricas como invalid call rate, excess cost y parallel rate.
- Prototipado de planificadores con presupuesto de rondas: el límite de tres rondas y la línea `Answer:` facilitan la integración en sistemas con control de coste por consulta.

## Benchmarks y rendimiento

PlannerQA-Bench (held-out), según la model card:

| Metrica | Base | SFT |
|---|---|---|
| Good rate | 62,5 % | 72,9 % |
| Relevance (1-4) | 3,33 | 3,73 |
| Factuality (1-4) | 2,75 | 3,31 |
| Tool cost / query | 0,82 | 0,82 |
| Excess cost / query | 0,16 | 0,04 |
| Knowledge_search calls / query | 0,62 | 0,54 |
| Tool rounds / query | 1,12 | 1,29 |
| Invalid call rate | 4,4 % | 1,2 % |
| Final answer rate | 100,0 % | 97,9 % |
| Parallel rate on fan-out tasks | 50,0 % | 88,9 % |

Good rate por familia de tareas:

| Familia | Base | SFT |
|---|---|---|
| kb_bridge | 50,0 % | 66,7 % |
| kb_compare | 50,0 % | 66,7 % |
| weather_lookup | 100,0 % | 100,0 % |
| election_lookup | 83,3 % | 100,0 % |
| fanout_calc | 33,3 % | 83,3 % |
| tool_bridge | 50,0 % | 100,0 % |
| composite | 33,3 % | 0,0 % |
| no_tool | 100,0 % | 66,7 % |

BFCL (checker oficial) para el modelo base:

| Metrica | Base |
|---|---|
| Non-Live AST | 87,5 |
| Live AST | n/a |
| Hallucination (irrelevance) | 85,4 |
| Multi-Turn | n/a |
| BFCL-core (media de los grupos anteriores) | 86,5 |

No se han publicado resultados de BFCL para la versión SFT en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,4 GB solo para pesos (1,72 B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,7 GB para pesos; en 4 bits, aproximadamente 0,9 GB para pesos.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) y RTX 4090 (24 GB) en FP16; también en A100 y H100 para despliegues multi-instancia.
- Cabe en consumer GPU: sí, en la mayoría de GPUs con 6 GB o más en cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles según las etiquetas del repositorio. No se confirma soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-planner-smoke-sft | 1,72 B | no disponible | Tool calling planner (SFT) | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible | Modelo generalista | no disponible en la informacion | Hugging Face |
| Otros planners de 1-2 B | no disponible | no disponible | Tool calling | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa se limita al par base/SFT del propio autor.

## Limitaciones y advertencias

- Regresión en la familia `composite`: el good rate cae del 33,3 % al 0,0 % tras el SFT, lo que indica que el modelo pierde capacidad en tareas compuestas.
- Regresión en `no_tool`: del 100,0 % al 66,7 %, con un aumento de llamadas innecesarias (`unneeded_tool_call` del 0,0 % al 4,2 %).
- Aumento de errores de síntesis: `synthesis_error` pasa del 4,2 % al 10,4 %.
- Tasa de respuesta final del 97,9 % (frente al 100,0 % del base), es decir, un 2,1 % de consultas sin línea `Answer:`.
- Licencia no disponible: no se puede confirmar el uso comercial sin verificar la licencia del modelo base Qwen3-1.7B y la del autor.
- Idiomas no disponibles: no se confirma el soporte multilingüe, aunque el base Qwen3 lo sea.
- Riesgo de alucinación: la métrica de factuality mejora (2,75 a 3,31 sobre 4) pero sigue por debajo de 4; el modelo base muestra un 85,4 en hallucination (irrelevance) de BFCL.
- Modelo experimental: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Contexto no disponible: se desconoce la ventana máxima, lo que impide garantizar conversaciones multi-turno largas.
- Especialización estrecha: las herramientas están limitadas a cuatro funciones concretas; fuera de ese conjunto el comportamiento no está evaluado.

## Enlaces

- Hugging Face: https://huggingface.co/darcyyao/qwen3-1.7b-planner-smoke-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de código: https://github.com/yy726/tool_use_demo.git
