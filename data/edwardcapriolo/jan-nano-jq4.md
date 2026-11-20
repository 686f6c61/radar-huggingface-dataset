# edwardcapriolo/Jan-nano-JQ4

## Resumen

Jan-nano-JQ4 es una cuantizacion del modelo Jan-nano, un modelo de lenguaje de 4.000 millones de parametros desarrollado por Menlo Research (autores Alan Dao y Dinh Bach Vu) y afinado a partir de Qwen/Qwen3-4B. El modelo original esta disenado especificamente para tareas de investigacion profunda (deep research) y para integrarse de forma nativa con servidores Model Context Protocol (MCP), lo que le permite operar como agente que consulta herramientas y fuentes externas. Esta version concreta ha sido generada por el autor edwardcapriolo mediante su motor de inferencia local Reckoning, que reescribe parte de los pesos en su formato tensorial Q4 para reducir el tamano y mejorar el throughput en inferencia local.

La relevancia de esta ficha radica en que combina dos elementos: un modelo compacto orientado a agentes y tool calling, y una cuantizacion alternativa a las habituales (GGUF, AWQ, GPTQ) generada con una herramienta propia en Java. El resultado es un repositorio de 3,1 GB (frente a los 7,5 GB del modelo fuente) con 252 tensores cuantizados a Q4 y un manifiesto de procedencia (`reckoning-quantization.json`) que documenta las transformaciones aplicadas.

Es importante senalar que Jan-nano es un modelo no-thinking: no genera cadenas de razonamiento explicitas, a diferencia de otros miembros de la familia Qwen3. Esta orientacion lo hace mas rapido y predecible en entornos agente, a costa de renunciar al razonamiento extendido en tareas complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B); no se detalla la configuracion exacta en la informacion disponible |
| Parametros totales | 4.000 millones (heredados del modelo base Qwen/Qwen3-4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B soporta contexto largo, pero no se confirma para esta variante) |
| Tipos de cuantizacion | Q4 (formato propio de Reckoning); el modelo base admite otras cuantizaciones no documentadas aqui |
| Idiomas soportados | no disponible (la model card no especifica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers), con sidecars `.qb` generados por Reckoning |
| Tamano del repositorio | 3,1 GB (modelo fuente: 7,5 GB; cuantizado: 2,9 GB) |
| Tensores cuantizados | 252 |
| Modelo base | Qwen/Qwen3-4B |
| Modo de razonamiento | No-thinking (sin cadenas de pensamiento) |

## Arquitectura y entrenamiento

Jan-nano se construye sobre Qwen3-4B, un transformer decoder-only de 4.000 millones de parametros, y ha sido afinado por Menlo Research para tareas de investigacion profunda y uso con servidores MCP. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; unicamente indica el objetivo de especializacion en deep research y la integracion nativa con MCP. El modelo se presenta explicitamente como no-thinking, es decir, no produce trazas de razonamiento intermedias antes de la respuesta final, lo que simplifica el pipeline de inferencia y reduce la latencia en escenarios de agente.

La innovacion tecnica de esta variante concreta no esta en el entrenamiento sino en la cuantizacion. Reckoning Q.O.D. (Quantize On Demand) reescribe matrices seleccionadas de pesos al formato tensorial Q4 propio, generando ademas ficheros sidecar `.qb` y aplicando transformaciones de normalizacion de formas durante la exportacion. El manifiesto `reckoning-quantization.json` registra rutas de origen y destino, cambios de dtype por tensor y las transformaciones aplicadas, lo que facilita la trazabilidad. La model card conserva el tokenizer y los metadatos originales y menciona una plantilla de chat no-thinking (`qwen3_nonthinking.jinja`) compatible con el parser de tool calls `hermes` en vLLM.

## Capacidades

- Generacion de texto conversacional en modo no-thinking, sin cadenas de razonamiento explicitas.
- Tool calling / function calling: soporte nativo mediante plantilla de chat y parser `hermes` en vLLM (`--enable-auto-tool-choice --tool-call-parser hermes`).
- Integracion con servidores Model Context Protocol (MCP), disenada para conectar el modelo con herramientas y fuentes de datos externas.
- Razonamiento multi-paso orientado a agentes: el modelo esta entrenado para encadenar consultas a herramientas en flujos de investigacion.
- Investigacion profunda (deep research): busqueda, sintesis y verificacion de informacion con apoyo de herramientas.
- Respuestas factuales en tareas tipo SimpleQA cuando opera con soporte MCP (segun la evaluacion del autor).
- Capacidades multilingues: no documentadas en la informacion disponible.
- No dispone de vision, audio ni modo thinking explicito segun la informacion proporcionada.

## Casos de uso

- Agente de investigacion documental: el modelo puede orquestar llamadas a servidores MCP para consultar bases de datos, APIs o repositorios y sintetizar los resultados en un informe. Su entrenamiento especifico en deep research lo hace adecuado para este flujo sin necesidad de prompting complejo.
- Asistente de escritorio con privacidad total: al ejecutarse localmente con Jan o con Reckoning, permite conversaciones y busquedas sin enviar datos a la nube, lo que encaja en entornos con requisitos de confidencialidad.
- Automatizacion de soporte con acceso a herramientas: mediante tool calling y el parser `hermes`, el modelo puede consultar sistemas de ticketing, CRM o bases de conocimiento y responder con datos actualizados en lugar de depender solo de su conocimiento parametrico.
- Pipeline de verificacion de hechos: su evaluacion en SimpleQA con metodologia MCP sugiere uso en flujos donde el modelo consulta fuentes externas para contrastar afirmaciones antes de responder.
- Prototipado rapido de agentes en local: con 2,9 GB cuantizados y licencia Apache 2.0, es viable desplegarlo en estaciones de trabajo para iterar sobre disenos de agentes sin coste de API.
- Integracion en aplicaciones Java: al estar generado por Reckoning, un motor de inferencia en Java con carga de safetensors, encaja en stacks JVM donde no se quiere introducir runtimes Python para inferencia.
- Generacion de resumenes de fuentes multiples: en flujos de research, el modelo puede recibir resultados de varias herramientas y consolidarlos en una respuesta unica.

## Benchmarks y rendimiento

La model card menciona una evaluacion en SimpleQA con metodologia basada en MCP, presentada unicamente como grafico (imagen), sin cifras numericas en el texto. No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| SimpleQA (metodologia MCP) | no disponible (solo grafico en la model card) | Evaluacion del autor con integracion MCP |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

## Requisitos de hardware

- VRAM estimada: el repositorio cuantizado ocupa 3,1 GB, por lo que la inferencia en Q4 requiere aproximadamente 3-4 GB de VRAM para los pesos, mas overhead de contexto y activaciones (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, una GPU consumer de 8 GB o mas deberia ser suficiente para los pesos cuantizados.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 8 GB o mas (RTX 3060/4060 y superiores), aunque no hay confirmacion oficial.
- Opciones de despliegue: vLLM (con `--enable-auto-tool-choice --tool-call-parser hermes` y plantilla `qwen3_nonthinking.jinja`), Jan (aplicacion de escritorio), Reckoning (motor Java del autor). No se confirma soporte de llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.
- Parametros de muestreo recomendados: temperature 0.7, top-p 0.8, top-k 20, min-p 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Jan-nano-JQ4 (esta ficha) | 4.000 M | no disponible | Deep research, MCP, no-thinking | Apache 2.0 | safetensors Q4 (Reckoning) |
| Qwen/Qwen3-4B (base) | 4.000 M | no disponible en esta ficha | Modelo generalista con modo thinking | Apache 2.0 | safetensors |
| Menlo/Jan-nano (original) | 4.000 M | no disponible | Deep research, MCP, no-thinking | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada. La diferencia principal entre Jan-nano y su base Qwen3-4B es el afinado para tareas de agente e investigacion y la ausencia de modo thinking; la diferencia entre esta variante JQ4 y el Jan-nano original es exclusivamente la cuantizacion Q4 de Reckoning (7,5 GB a 2,9 GB).

## Limitaciones y advertencias

- Modelo no-thinking: no genera cadenas de razonamiento, lo que puede penalizar tareas que requieren deduccion compleja o matematicas avanzadas frente a variantes con modo thinking.
- Riesgo de alucinacion: como todo modelo de 4.000 millones de parametros, puede inventar hechos, especialmente sin acceso a herramientas MCP que verifiquen la informacion.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento uniforme fuera del ingles sin evaluacion adicional.
- Longitud de contexto no confirmada para esta variante: no se debe asumir la ventana del modelo base sin verificacion.
- Cuantizacion no estandar: el formato Q4 de Reckoning no es compatible con los runtimes habituales (llama.cpp, vLLM en su forma estandar) sin el motor Reckoning; esto limita la portabilidad del repositorio.
- Repositorio de terceros: la cuantizacion la ha generado edwardcapriolo, no Menlo Research; la calidad y fidelidad respecto al modelo original no estan avaladas por el autor del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B y del modelo Jan-nano original, ambos Apache 2.0 segun la informacion disponible.
- Sin likes ni adopcion significativa (0 likes, 249 descargas en el momento de la consulta): poca validacion comunitaria.
- La evaluacion en SimpleQA se presenta solo como grafico y con metodologia propia del autor, sin cifras verificables de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/edwardcapriolo/Jan-nano-JQ4
- Modelo original Jan-nano: https://huggingface.co/Menlo/Jan-nano
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paper (arXiv): https://arxiv.org/abs/2506.22760
- Motor de inferencia Reckoning: https://github.com/edwardcapriolo/reckoning
- Documentacion de Jan-nano (setup, uso y FAQ): https://menloresearch.github.io/deep-research/
- Discusiones del modelo original: https://huggingface.co/Menlo/Jan-nano/discussions
- Plantilla de chat no-thinking: https://qwen.readthedocs.io/en/latest/_downloads/c101120b5bebcc2f12ec504fc93a965e/qwen3_nonthinking.jinja
