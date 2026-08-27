# Shaurya2020/porq-agent-0.5b

## Resumen

Porq agent 0.5B es un adaptador PEFT (Parameter-Efficient Fine-Tuning) desarrollado por Shaurya2020 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Está diseñado como un agente autónomo de liquidación de apuestas deportivas para el mercado indio, con un CLI similar al de Claude que permite consultar tarjetas de resultados, calificar apuestas, gestionar colas y consultar reglas. El modelo resuelve el problema de automatizar la liquidación de apuestas en intercambios deportivos, evitando la invención de resultados y apoyándose en una fuente de autoridad oficial (LuckySports) y un motor de reglas.

El adaptador se ha entrenado con datos de ajuste supervisado (SFT) procedentes de dos datasets públicos: Shaurya2020/porq-agentic-sft y lavmauryaa/porqsport-settlement-sft. La arquitectura base es un transformer de 0.5B parámetros con 32k de contexto, y el adaptador PEFT añade un número reducido de parámetros entrenables. La licencia se indica como "other" (no especificada en detalle), lo que limita su uso comercial sin conocer los términos exactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen2.5-0.5B-Instruct) con adaptador PEFT (LoRA probablemente) |
| Parametros totales | 0.5B (modelo base) + parámetros del adaptador (no especificado) |
| Parametros activos | No disponible (no se indica si es MoE; el modelo base es denso) |
| Longitud de contexto | 32k tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, dado el dominio de apuestas deportivas) |
| Licencia | other (sin detalles específicos) |
| Formato de pesos | PEFT (safetensors para el adaptador) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre el modelo base Qwen2.5-0.5B-Instruct. Qwen2.5-0.5B es un transformer denso con 0.5B parámetros, entrenado con 18 billones de tokens, y que soporta una ventana de contexto de 32k tokens. El adaptador se ha entrenado mediante ajuste supervisado (SFT) con dos datasets especializados en el dominio de liquidación de apuestas deportivas del mercado indio. El proceso de entrenamiento se ejecutó en una GPU t4-small (según la model card), pero se interrumpió por un error de facturación de HF Jobs (402 Payment Required), por lo que el entrenamiento completo podría no haberse finalizado.

La innovación técnica principal es la integración de un conjunto de herramientas agénticas en el CLI: `fetch_card`, `grade_bet`, `queue_bet`, `process_queue`, `think` y `lookup_rule`. Estas herramientas permiten al modelo actuar como un agente que consulta la tarjeta oficial de resultados (LuckySports), califica apuestas, gestiona una cola de eventos y consulta reglas del motor de reglas, en lugar de generar respuestas libres sin verificación.

## Capacidades

- Generación de texto y razonamiento básico sobre liquidación de apuestas deportivas.
- Ejecución de herramientas agénticas: `fetch_card` (obtener tarjeta de resultados), `grade_bet` (calificar una apuesta), `queue_bet` (poner en cola una apuesta), `process_queue` (procesar la cola de apuestas), `think` (razonamiento intermedio) y `lookup_rule` (consultar reglas).
- Uso de una fuente de autoridad externa (tarjeta oficial / LuckySports) para evitar inventar resultados.
- Capacidad de ejecución en modo CLI autónomo (comando `porq`) o como módulo Python (`python -m settlement.repl`).
- No se han documentado capacidades de visión, audio o tool calling estándar más allá de las herramientas propias.

## Casos de uso

- **Liquidación automática de apuestas en el mercado indio**: el agente puede procesar eventos deportivos, consultar la tarjeta oficial de resultados y calificar cada apuesta automáticamente, reduciendo la intervención manual.
- **Gestión de cola de apuestas**: con la herramienta `queue_bet` y `process_queue`, el modelo puede acumular apuestas pendientes y procesarlas de forma ordenada, útil en entornos de alta concurrencia.
- **Consulta de reglas de liquidación**: `lookup_rule` permite resolver disputas o aclarar criterios de liquidación según el motor de reglas, útil para operadores y verificadores.
- **Asistente de verificación de resultados**: dado un partido, el agente consulta la tarjeta oficial y compara con las apuestas registradas, evitando errores humanos.
- **Automatización de operaciones de trading**: para usuarios del intercambio indio, el agente puede ejecutar tareas de liquidación de forma autónoma mediante el CLI, integrándose en flujos de trabajo de línea de comandos.
- **Evaluación de integridad de datos**: al no inventar resultados y depender de la fuente oficial, puede usarse para auditar liquidaciones pasadas y detectar discrepancias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no proporciona métricas como MMLU, HumanEval, GSM8K ni ninguna evaluación comparativa. El entrenamiento quedó interrumpido por un error de facturación, lo que sugiere que el modelo podría no estar completamente entrenado o evaluado.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 0.5B parámetros, la inferencia requiere menos de 1 GB de VRAM en FP16 (aproximadamente 1 GB con el adaptador). En cuantización de 8 bits o 4 bits, podría funcionar en menos de 500 MB.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo GPUs de consumo como NVIDIA GTX 1650, RTX 2060 o superiores. También funciona en CPU con llama.cpp u otros motores.
- **Compatibilidad**: cabe en cualquier GPU de consumo moderna, incluso en sistemas embebidos.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con transformers de HuggingFace, o exportar a GGUF para usarlo con llama.cpp, Ollama o vLLM. El CLI propio del modelo permite ejecución directa.
- **Latencia y throughput**: no se dispone de datos medidos, pero al ser un modelo pequeño, la latencia típica es de decenas de milisegundos por token en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Dominio |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 32k | Apache 2.0 | General |
| Tencent Hunyuan-0.5B | 0.5B | 32k (según GitHub) | Apache 2.0 | General |
| Porq agent 0.5B (este adaptador) | 0.5B + adaptador | 32k (heredado) | other | Específico de liquidación de apuestas |

No hay comparativas de rendimiento publicadas para este adaptador. El modelo base Qwen2.5-0.5B-Instruct es un modelo generalista, mientras que Porq agent 0.5B está especializado en un dominio muy concreto, por lo que no son directamente comparables en tareas generales.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de solo 0.5B parámetros, su capacidad de razonamiento es limitada y puede generar resultados incorrectos si la herramienta `fetch_card` no devuelve datos o si el motor de reglas no cubre el caso.
- **Entrenamiento incompleto**: la model card indica que el entrenamiento se interrumpió por un error de facturación, por lo que el adaptador podría no estar completamente ajustado.
- **Dependencia de la fuente externa**: el agente depende de la disponibilidad y exactitud de la tarjeta oficial (LuckySports) y del motor de reglas; si estos fallan, el agente no puede operar correctamente.
- **Restricciones de licencia**: la licencia "other" no especifica los términos. Es posible que no se permita uso comercial sin permiso explícito del autor. Se recomienda contactar al autor antes de usar en producción.
- **Idioma**: no se especifican idiomas soportados; probablemente solo inglés, aunque el dominio de apuestas indio podría requerir términos en hindi u otros idiomas locales.
- **Sin benchmarks publicados**: no hay evidencia de rendimiento en tareas de razonamiento o generación general, lo que limita la confianza en su calidad fuera del dominio.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Shaurya2020/porq-agent-0.5b)
- [Dataset de SFT agéntico](https://huggingface.co/datasets/Shaurya2020/porq-agentic-sft)
- [Dataset de liquidación de apuestas](https://huggingface.co/datasets/lavmauryaa/porqsport-settlement-sft)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B)
- [Perfil del autor en HuggingFace](https://huggingface.co/shaurya0/models)
- [Artículo sobre razonamiento en modelos de 0.5B (referencia general)](https://arxiv.org/html/2506.13404v2)
