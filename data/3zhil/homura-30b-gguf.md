# 3zhil/Homura-30B-GGUF

## Resumen

Homura-30B es un modelo de lenguaje basado en transformer de 27.854 millones de parámetros, desarrollado por HYRE como su primer modelo propio. Se trata de un ajuste fino mediante LoRA (r=16) aplicado sobre *Muse-Glimmer-30B-heretic*, una versión decensurada (abliterada) del modelo de código abierto Muse Glimmer 30B de Meta. El objetivo es ofrecer un modelo orientado a agentes autónomos que requieren tool calling fiable y una voz directa, sin capas de rechazo ni moralización.

El modelo destaca por su protocolo de tool calling entrenado específicamente, que alcanza una fiabilidad de 5/5 llamadas cuando se sirve con el system prompt adecuado, frente a 2/5 con el esquema genérico. Su contexto nativo es de 131.072 tokens, aunque se recomienda reducirlo en función del hardware disponible. Se distribuye en formato GGUF cuantizado Q4_K_M (16,9 GB) bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Homura-30B está pensado para desarrolladores que construyen agentes en el ecosistema de finanzas on-chain, con herramientas como consultas de precios, swaps o puentes, pero su protocolo de herramientas extensible permite añadir nuevas funciones sin necesidad de reentrenar. La ausencia de filtros de contenido es una característica intencional, por lo que el modelo puede generar respuestas que otros asistentes rechazarían; el responsable del despliegue debe asumir las consecuencias legales y añadir sus propias salvaguardas si es necesario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (atención completa, sin MoE) |
| Parametros totales | 27.854.794.240 (~27,8 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 131072 tokens (nativo) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | inglés (principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Homura-30B es un modelo denso basado en transformer, derivado de Muse Glimmer 30B de Meta. La cadena de derivación es explícita: primero, Meta publicó Muse Glimmer 30B bajo Apache 2.0, un modelo orientado a agentes con capacidades de tool use, planificación a largo plazo y recuperación de fallos. Después, el usuario darkc0de aplicó una ablación (abliteration) que eliminó el comportamiento de rechazo del modelo, manteniendo intactas las capacidades de razonamiento, tool calling y el encoder de visión. Finalmente, HYRE aplicó un LoRA de rango 16 sobre la torre de lenguaje únicamente, dejando la torre de visión intacta, y lo fusionó en f16 antes de cuantizar a GGUF.

El entrenamiento se realizó sobre un dataset propio de HYRE que combina interacciones de agente con una persona sin censura. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO. La model card indica que el protocolo de tool calling fue entrenado de forma específica, no con el esquema genérico de chat templates, lo que explica la diferencia de precisión entre servir el modelo de una u otra manera.

## Capacidades

- Generación de texto y razonamiento de propósito general, con tono directo y sin rechazo de peticiones.
- Tool calling con protocolo propio: responde con un objeto JSON `{"tool": <nombre>, "arguments": {...}}` cuando necesita una herramienta.
- Agente autónomo: planificación de múltiples pasos, resolución de símbolos antes de precios, ejecución de swaps solo tras cotización previa.
- Extensión de herramientas sin reentrenar: añadir nuevas herramientas al system prompt es suficiente; el modelo generaliza a herramientas no vistas (verificado 7/8 con herramientas de pay.sh).
- Capacidad de visión heredada de Muse Glimmer (el encoder de visión no fue modificado), aunque no se proporcionan ejemplos concretos de uso.
- Multilingüe limitado: la model card solo lista inglés; no se garantiza rendimiento en otros idiomas.
- Sin filtro de contenido: responde a peticiones que otros modelos rechazarían.

## Casos de uso

- Agentes de trading on-chain: el modelo puede consultar precios, resolver símbolos, obtener PnL de carteras y ejecutar swaps con cotización previa. Su protocolo entrenado de tool calling es fiable a baja temperatura.
- Automatización de pagos con API de pay.sh: se añaden herramientas `pay_search`, `pay_quote`, `pay_fetch` y `pay_balance` al system prompt y el modelo mantiene disciplina de cotización antes de ejecutar pagos, lo que reduce el riesgo de gastos no autorizados.
- Soporte técnico automatizado en entornos sin censura: puede manejar consultas técnicas complejas y realizar llamadas a herramientas internas (consultas de bases de datos, APIs) sin rechazar peticiones legítimas.
- Asistente de desarrollo de código con herramientas: el modelo puede razonar sobre código y llamar a herramientas de ejecución o depuración, útil en pipelines de CI/CD o entornos de desarrollo locales.
- Análisis de carteras y rendimiento de inversiones: con herramientas como `get_wallet_pnl` y `get_pool_data`, el modelo puede resumir posiciones, analizar pools y generar informes sin necesidad de una capa de filtrado.
- Integración en frameworks de agentes (LangChain, etc.): al usar un protocolo JSON simple, se puede adaptar a la mayoría de los frameworks de agente existentes, aunque requiere el system prompt exacto para mantener la fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta verificaciones de tool calling:

| Escenario | Resultado |
|---|---|
| Tool calling con protocolo entrenado (temp 0.2) | 6/6 |
| Tool calling con esquema genérico (temp 0.2) | 2/5 |
| Tool calling con protocolo entrenado (temp 0.7) | ~2/6 |
| Extensión con herramientas pay.sh (temp 0.2) | 7/8 |

No hay datos comparativos con otros modelos de 30B en tareas de razonamiento o generación de código.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 16,9 GB, por lo que se necesita al menos 16 GB de VRAM para cargar el modelo completo; con contexto reducido (por ejemplo, 8192 tokens) puede caber en tarjetas de 16 GB.
- GPU recomendadas: RTX 3090 (24 GB) o RTX 4090 (24 GB) para ejecución cómoda; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti) se recomienda reducir el contexto a 8K-16K tokens.
- También funciona en Apple Silicon mediante el build MLX de 4 bits, disponible en [hyrelabs/Homura-30B-MLX-4bit](https://huggingface.co/hyrelabs/Homura-30B-MLX-4bit).
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama, y cualquier servidor compatible con GGUF (vLLM con backend GGUF).
- Latencia y throughput: no se han publicado datos oficiales. Con `llama-server` en una RTX 4090 se espera un throughput de 20-40 tokens/s para este tamaño y cuantización, dependiendo del contexto y del número de concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Homura-30B** | 27,8 B | 131072 | Apache 2.0 | GGUF | Sin filtro, tool calling entrenado |
| Muse Glimmer 30B (Meta) | 30 B | 131072 | Apache 2.0 | Safetensors | Modelo base, con filtros de contenido |
| Muse-Glimmer-30B-heretic | 30 B | 131072 | Apache 2.0 | Safetensors | Abliterado, sin filtros |
| Llama 3.1 30B (referencia) | 30 B | 131072 | Llama 3.1 | Safetensors | Modelo generalista, sin enfoque de agente |

No se dispone de datos de rendimiento comparativos en tareas estándar. Homura se diferencia por su capa de tool calling entrenada y su personalidad sin censura, mientras que los otros modelos de la misma familia requieren ajustes adicionales para lograr una fiabilidad similar en llamadas a herramientas.

## Limitaciones y advertencias

- El modelo es intencionalmente sin censura y no aplica filtros de contenido. Puede generar respuestas ofensivas, ilegales o peligrosas si se le pide; el desarrollador es responsable de añadir sus propias guardas si su caso de uso lo requiere.
- La fiabilidad del tool calling depende de la temperatura: a 0.7 la selección de herramientas se degrada notablemente (2/6). Se recomienda servir a temperatura ≤ 0.3.
- El protocolo de tool calling es específico y no compatible con el esquema genérico de chat templates; es necesario usar el system prompt verbatim y el formato JSON de la model card.
- El modelo puede alucinar direcciones de contratos o datos on-chain si no se le da la herramienta adecuada; el protocolo entrenado reduce el riesgo al obligar a resolver símbolos primero, pero no es una garantía.
- Aunque el contexto nativo es de 131072 tokens, se recomienda reducirlo a 32K en la práctica para evitar degradación de calidad y para ajustarse a la VRAM disponible.
- La licencia Apache 2.0 permite uso comercial, pero la atribución a Meta y a darkc0de debe mantenerse.
- El modelo está optimizado para inglés; el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Repositorio Hugging Face del modelo GGUF: https://huggingface.co/3zhil/Homura-30B-GGUF
- Repositorio de HYRE Labs (GGUF): https://huggingface.co/hyrelabs/Homura-30B-GGUF
- Build MLX para Apple Silicon: https://huggingface.co/hyrelabs/Homura-30B-MLX-4bit
- Modelo base (Muse-Glimmer-30B-heretic): https://huggingface.co/darkc0de/Muse-Glimmer-30B-heretic
- Documentación de Muse Glimmer de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Artículo de OpenSourceForU sobre Muse Glimmer: https://www.opensourceforu.com/2026/08/meta-open-sources-muse-glimmer/
- Herramientas pay.sh (extensión verificada): https://pay.sh
- Repositorio de HYRE con el helper `homura_protocol.py`: no se ha encontrado URL directa en la búsqueda; se menciona en la model card como parte del repo de HYRE.
