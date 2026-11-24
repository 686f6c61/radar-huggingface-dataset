# mr-andrey-isachenko/Tenet-24B-Mistral3.1-Unslop-v2

## Resumen

Tenet-24B-Mistral3.1-Unslop-v2 es un ajuste fino (fine-tune) del modelo Mistral-Small-3.1-24B-Instruct-2503 de Mistral AI, publicado por el desarrollador independiente mr-andrey-isachenko bajo el paraguas del proyecto Tenet/Lancet. El modelo parte de la arquitectura transformer multimodal de Mistral Small 3.1 (24.000 millones de parámetros, entrada image-text-to-text) y aplica una cirugía de subespacios orientada a eliminar rechazos excesivos (de-refusal) y patrones estilísticos indeseados (de-slop), manteniendo las capacidades analíticas, de código y de razonamiento estructurado del modelo base.

La innovación principal es el motor Lancet, que realiza una "cirugía de subespacios bi-proyectada que preserva la norma": identifica la dirección de rechazo tanto en la proyección de entrada (residual stream) como en la de salida (unembedding), elimina el componente de forma bidireccional y restaura la norma residual exactamente. A esto le sigue un pase de GRPO (Group Relative Policy Optimization) con compuertas de recompensa que penalizan patrones de "slop" solo donde la cirugía debilitó el circuito de rechazo.

El resultado se exporta como checkpoint FP8 (E4M3) listo para proveedores, sin código personalizado ni `trust_remote_code`, compatible con vLLM, OpenRouter, GGUF y MLX. Es relevante para desarrolladores que necesitan un modelo de 24B con contexto largo, capacidades agénticas y de tool calling, y que buscan reducir falsos rechazos en dominios legítimos como seguridad defensiva, análisis de logs o SQL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Mistral Small 3.1), image-text-to-text |
| Parametros totales | 24.011.361.280 (~24B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 (E4M3) oficial; GGUF (Q4_K_M CKA-Quant y otras variantes de la comunidad); BF16 para el output de cirugía |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8 E4M3), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Mistral Small 3.1: un transformer multimodal con capacidad de entrada image-text-to-text, 24.000 millones de parámetros y ventana de contexto de 32.768 tokens. Sobre esta base, el autor aplica el motor Lancet, que no es una ablación ingenua (naive abliteration) sino una cirugía de subespacios que preserva la norma: la dirección de rechazo se identifica en las proyecciones de entrada (residual stream) y de salida (unembedding), se elimina de forma bidireccional y se restaura exactamente la norma residual para que las magnitudes de activación y las distribuciones de tokens posteriores permanezcan en la variedad (on-manifold).

Tras la cirugía se ejecuta un pase de GRPO (Group Relative Policy Optimization) con compuertas de recompensa ("gated unslop GRPO") que penalizan patrones de slop (prosa recargada, vocabulario tipo "tapestry", preámbulos moralizantes) únicamente donde la cirugía debilitó el circuito de rechazo, reforzando en lugar de dañar el razonamiento y la capacidad de código del modelo base. El checkpoint final se exporta en FP8 (E4M3) sin código personalizado, sin `trust_remote_code` y sin `auto_map`, lo que permite su despliegue directo en vLLM, proveedores de OpenRouter, GGUF y MLX. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 32.768 tokens.
- Razonamiento estructurado y analítico, preservado mediante el anclaje del subespacio del modelo base.
- Generación de código y SQL, con énfasis en tool calls con esquema válido (el ejemplo de la model card muestra una llamada DuckDB SQL limpia y bien formada).
- Tool calling / function calling: soporte explícito, orientado a agentes y pipelines.
- Capacidades agénticas y de razonamiento multi-paso (etiquetas `agentic`, `tool-use`).
- Entrada multimodal image-text-to-text (heredada de Mistral Small 3.1).
- Reducción de falsos rechazos en dominios legítimos (seguridad defensiva, análisis de logs, SQL) gracias a la cirugía Lancet.
- Mitigación de "slop" estilístico: menos prosa recargada, menos preámbulos moralizantes, menos vocabulario tipo "tapestry".
- Capacidades multilingües: no declaradas explícitamente en la información disponible.

## Casos de uso

- **Atención al cliente automatizada:** el modelo puede gestionar conversaciones multi-turno con contexto largo (32.768 tokens) y, gracias a la reducción de falsos rechazos, responder a consultas legítimas que un modelo sobre-alineado rechazaría por precaución excesiva.
- **Análisis de logs y seguridad defensiva:** tal como ilustra la model card, puede recibir una línea de log de autenticación nginx y devolver una llamada de herramienta DuckDB SQL válida que agregue inicios de sesión fallidos por IP de origen, sin rechazos espurios ni prosa moralizante.
- **Generación de código en producción:** soporta tool calling con esquemas válidos, lo que permite integrarlo en pipelines de CI/CD para generar consultas SQL, scripts de automatización o llamadas a APIs con salida estructurada verificable.
- **Agentes autónomos multi-paso:** las etiquetas `agentic` y `tool-use` indican idoneidad para orquestación de herramientas en bucles de razonamiento, con salidas JSON limpias que reducen errores de parseo en el agente.
- **Asistente de desarrollo con contexto largo:** puede analizar fragmentos extensos de código, documentación o trazas de error dentro de su ventana de 32K y proponer correcciones o consultas de diagnóstico.
- **Despliegue en proveedores gestionados:** el checkpoint FP8 (E4M3) sin código personalizado está pensado para subirse directamente a vLLM y a proveedores de OpenRouter, lo que simplifica la puesta en producción sin adaptadores ni `trust_remote_code`.
- **Inferencia local en estaciones de trabajo:** las variantes GGUF (Q4_K_M CKA-Quant) y MLX permiten ejecución en llama.cpp, Ollama y LM Studio para equipos con GPU de consumo de gama alta.

## Benchmarks y rendimiento

La model card incluye tablas de benchmarks (H9 retención de rechazo y slop, H10 retención de capacidad downstream, H11 robustez de cuantización FP8, y una comparativa Base vs Naive Abliteration vs Tenet), pero todos los valores figuran como "n/a" o "—" en la información disponible. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** en FP8 (E4M3) el checkpoint ocupa aproximadamente 24 GB de pesos, por lo que se necesitan del orden de 28-32 GB de VRAM para inferencia con contexto moderado y overhead de KV cache. En BF16 serían ~48 GB de pesos.
- **GPU recomendadas:** A100 40/80 GB, H100 80 GB, L40S 48 GB para despliegue en FP8 con contexto completo; RTX 4090 24 GB al límite para FP8 con contexto reducido o para GGUF Q4_K_M.
- **Consumer GPU:** cabe en RTX 4090 (24 GB) con cuantización GGUF Q4_K_M o FP8 con contexto recortado; en GPUs de 16 GB solo con cuantizaciones más agresivas (Q3/Q2) y degradación notable.
- **Opciones de despliegue:** vLLM (`--quantization fp8 --max-model-len 32768`), Transformers (`AutoModelForCausalLM` con `torch_dtype="auto"`), llama.cpp (GGUF CKA-Quant, `-ngl 99`), Ollama y LM Studio para variantes GGUF, MLX para Apple Silicon, y proveedores de OpenRouter.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tenet-24B-Mistral3.1-Unslop-v2 | ~24B | 32.768 | apache-2.0 | HF, vLLM, GGUF, MLX, OpenRouter | Fine-tune de-refusal/de-slop con FP8 |
| Mistral-Small-3.1-24B-Instruct-2503 (base) | ~24B | 32.768 (heredado) | apache-2.0 | HF, vLLM | Modelo base multimodal; rechazos más conservadores |
| Naive Abliteration del mismo base | ~24B | 32.768 (heredado) | apache-2.0 | no disponible como release concreto | Elimina rechazos pero rompe salida estructurada según la model card |
| Mistral-Small-3.1-24B (otras variantes comunitarias) | ~24B | variable | variable | HF | No verificadas en la información disponible |

No se dispone de datos de rendimiento comparativo numérico en la información proporcionada; la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- **Sesgos conocidos:** no documentados explícitamente; al derivar de Mistral Small 3.1, hereda los sesgos del modelo base, y la cirugía de rechazo puede alterar la calibración de respuestas ante temas sensibles.
- **Riesgo de alucinación:** no cuantificado en la información disponible; el proceso de de-refusal puede incrementar la propensión a responder con confianza en dominios donde el modelo base habría declinado.
- **Uso fuera de alcance:** el autor declara explícitamente que el modelo no está destinado ni ajustado para operaciones ciberofensivas, generación de malware ni contenido ilícito; esos usos quedan fuera de alcance y sin soporte.
- **Limitaciones de contexto e idioma:** contexto de 32.768 tokens; los idiomas soportados no se declaran en la model card, por lo que la cobertura multilingüe debe validarse empíricamente.
- **Licencia:** apache-2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo se distribuye "tal cual"; conviene revisar las obligaciones de atribución del modelo base Mistral.
- **Madurez del release:** el repositorio registra 0 descargas y 0 likes en el momento de la ficha, con fecha de creación muy reciente; los benchmarks publicados están vacíos (n/a), por lo que no hay evidencia numérica de la retención de capacidades tras la cirugía.
- **Caveat de producción:** la calidad de las salidas estructuradas (tool calls JSON) se ilustra con un ejemplo cualitativo, no con métricas; se recomienda evaluar el esquema de tool calling en el dominio propio antes de desplegar en agentes.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-24B-Mistral3.1-Unslop-v2
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Repositorio GitHub (código y reporte técnico): https://github.com/mrAndreyIsachenko/tenet-lab
- Space de auditoría interactiva (FP8 & Abliteration Inspector): https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Colección de la familia Tenet v1: https://huggingface.co/mr-andrey-isachenko
