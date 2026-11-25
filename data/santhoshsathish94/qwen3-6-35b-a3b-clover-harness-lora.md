# Santhoshsathish94/Qwen3.6-35B-A3B-Clover-Harness-LoRA

## Resumen

`Santhoshsathish94/Qwen3.6-35B-A3B-Clover-Harness-LoRA` es un adaptador LoRA de PEFT publicado por el usuario Santhoshsathish94 sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de rango 32 y alpha 64 (42,3 millones de parámetros entrenables) que se aplican sobre las proyecciones de atención, Gated-DeltaNet y expertos compartidos del modelo base. Su propósito declarado es especializar al modelo en tareas de agente: generación de planes tácticos cortos, uso de herramientas mediante MCP 2.0 y flujos de trabajo definidos en ficheros `AGENTS.md` del framework Clover.

El adaptador se entrenó en dos fases: primero con SFT sobre trazas de tool calling de SWE-smith comprimidas a planes de 45 tokens o menos, y después con 60 pasos de RL online mediante GRPO. La pérdida de SFT descendió de 1,4930 a 0,0699, según la model card. El resultado es un adaptador orientado a entornos de agentes de código (OpenCode) y a la orquestación de llamadas por lotes a herramientas.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto muy reciente (creado el 25 de noviembre de 2026), sin descargas ni likes, y con documentación exclusivamente en la model card. No hay información pública sobre evaluación, idiomas o rendimiento fuera de los datos de entrenamiento declarados por el autor. El repositorio ocupa 0,2 GB y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer con mezcla de expertos y capas Gated-DeltaNet del modelo base Qwen3.6-35B-A3B |
| Parametros totales | 42,3 M parámetros entrenables en el adaptador; el modelo base no se distribuye en este repositorio |
| Parametros activos | no disponible (depende del modelo base Qwen3.6-35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó en BF16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre las proyecciones de atención, las capas Gated-DeltaNet y las proyecciones de expertos compartidos del modelo base Qwen3.6-35B-A3B. El entrenamiento se realizó sobre los pesos exactos en BF16 del modelo base, invocando únicamente el componente de lenguaje (`--language-model-only`), lo que sugiere que el adaptador no afecta a posibles torres multimodales del modelo original. El número de parámetros entrenables asciende a 42,3 millones.

La fase supervisada consistió en 160 pasos de SFT con máscara sobre turnos de asistente, usando trayectorias de tool calling de SWE-smith comprimidas a planes tácticos de 45 tokens o menos, transferencias de contexto del framework Clover basadas en `AGENTS.md`, llamadas por lotes `tools/call_batch` de MCP 2.0 y rechazos de manipulación del conjunto `safeagents`. La pérdida bajó de 1,4930 a 0,0699. Después se aplicaron 60 pasos de RL online con GRPO (G=4, temperatura 0,8). No se documentan detalles sobre el dataset completo, el número de tokens vistos ni la composición exacta de las recompensas de GRPO.

## Capacidades

- Generación de planes tácticos cortos (hasta 45 tokens) para tareas de agente, según el formato usado en el entrenamiento SFT.
- Tool calling mediante MCP 2.0, incluyendo llamadas por lotes con `tools/call_batch`.
- Orquestación de flujos de trabajo definidos en ficheros `AGENTS.md` del framework Clover, con transferencias de contexto entre fases (Context -> Growth).
- Integración con el entorno OpenCode para tareas de ingeniería de software asistida.
- Rechazo de instrucciones manipuladas o intentos de tampering, entrenado con el conjunto `safeagents`.
- Razonamiento multi-paso orientado a agentes, reforzado mediante GRPO online.
- Capacidades heredadas del modelo base Qwen3.6-35B-A3B (generación de texto, código, matemáticas, multilingüismo): no documentadas de forma específica para este adaptador.

## Casos de uso

- Agentes de código en OpenCode: el adaptador se entrenó con trazas de tool calling de SWE-smith y puede integrarse en el harness de OpenCode para que el modelo emita planes tácticos breves y llamadas a herramientas en lugar de respuestas largas, reduciendo el consumo de tokens en cada turno del agente.
- Orquestación de herramientas por lotes con MCP 2.0: el entrenamiento incluye `tools/call_batch`, por lo que el adaptador es adecuado para entornos donde el agente debe agrupar varias llamadas a herramientas en una sola respuesta y reducir la latencia de ida y vuelta.
- Flujos de trabajo multi-fase con `AGENTS.md`: permite al modelo interpretar y ejecutar handoffs de contexto definidos en ficheros de configuración del framework Clover, útil en pipelines de agentes que alternan fases de exploración y de crecimiento o refinamiento.
- Asistentes de refactorización en CI/CD: dado su enfoque en planes cortos y llamadas estructuradas, puede emplearse como planificador dentro de un pipeline que delega la ejecución real en herramientas externas (linters, compiladores, tests).
- Moderación de instrucciones en agentes: el entrenamiento con `safeagents` para rechazos de manipulación lo hace candidato para capas de defensa en agentes expuestos a entradas no confiables, aunque sin evaluación pública que lo respalde.
- Investigación sobre RL aplicado a agentes: el adaptador y su receta (SFT con máscara de asistente + GRPO con G=4 y temperatura 0,8) sirven como referencia reproducible para estudiar cómo el RL online modifica el comportamiento de tool calling en modelos grandes.
- Prototipado de harness de agentes: al ser un adaptador ligero (0,2 GB) sobre un modelo base mayor, permite experimentar con distintas configuraciones de harness sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la evolución de la pérdida de SFT (1,4930 -> 0,0699) y el número de pasos de entrenamiento (160 de SFT y 60 de GRPO), sin métricas de evaluación sobre MMLU, HumanEval, GSM8K ni conjuntos de agentes.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB y puede cargarse en cualquier GPU con memoria suficiente para el modelo base.
- Los requisitos de VRAM dependen enteramente de Qwen3.6-35B-A3B, cuyas especificaciones no se detallan en la información disponible.
- No se dispone de datos sobre GPUs recomendadas, ajuste en GPUs de consumo, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia o throughput para este adaptador.
- La carga requiere PEFT y un framework compatible con safetensors; el entrenamiento se realizó en BF16 sobre el modelo base completo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores LoRA comparables sobre Qwen3.6-35B-A3B ni alternativas de la misma categoría (adaptadores para harness de agentes con MCP 2.0 y `AGENTS.md`) con datos públicos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No hay evaluación pública: cero descargas y cero likes en el momento de la ficha, sin benchmarks ni validación independiente del comportamiento del adaptador.
- El adaptador está entrenado para un harness muy específico (Clover, OpenCode, MCP 2.0, `AGENTS.md`); fuera de ese ecosistema su comportamiento puede degradarse o no aportar ventajas frente al modelo base.
- El entrenamiento se limitó a 160 pasos de SFT y 60 de GRPO, un volumen reducido que puede provocar sobreajuste a los formatos concretos de las trazas de SWE-smith y a los rechazos de `safeagents`.
- La pérdida final de SFT (0,0699) no es un indicador de calidad en tareas abiertas; no se reportan métricas de retención de capacidades generales del modelo base.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos del adaptador.
- La licencia Apache 2.0 se declara para el adaptador, pero el uso comercial está sujeto también a la licencia del modelo base Qwen3.6-35B-A3B, que no se detalla en la información disponible.
- El adaptador no incluye los pesos del modelo base; es necesario descargar Qwen/Qwen3.6-35B-A3B por separado y verificar su compatibilidad exacta con la versión usada en el entrenamiento.
- La fecha de creación (noviembre de 2026) y la ausencia de mantenimiento documentado hacen recomendable tratar el artefacto como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/Santhoshsathish94/Qwen3.6-35B-A3B-Clover-Harness-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Framework Clover: https://cloverframework.com/hg-format/
