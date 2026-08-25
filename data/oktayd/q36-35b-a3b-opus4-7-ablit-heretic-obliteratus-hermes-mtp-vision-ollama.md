# oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-Ollama

## Resumen

Q36 es un modelo derivado de **Qwen3.6-35B-A3B**, desarrollado por el usuario independiente oktayd, que combina una línea de destilación de razonamiento heredada (referenciada como "Claude 4.7 Opus" por su origen, sin contener el modelo propietario), un proceso de ablación de rechazos (abliteration) para reducir negativas, entrenamiento SFT de tipo Hermes para function calling y comportamiento agéntico, y preservación de las capacidades de visión y MTP (multi-token prediction) del modelo base. El resultado es un modelo MoE de ~35,5B parámetros totales con ~3B activos por token y contexto nativo de 262.144 tokens, orientado a codificación agéntica, uso de herramientas y razonamiento local.

Esta edición concreta es una cuantización **Q4_K_M en formato GGUF** preparada para Ollama, pensada como ruta de compatibilidad para portátiles y equipos de gama media. El autor la presenta como "laptop compatibility edition" y la ha validado sobre una RTX 4060 Laptop. El repositorio incluye también la versión BF16/FreeToken completa y una edición llama.cpp para el mismo propósito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, transformer con GQA) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (8 expertos activos + experto compartido de 256) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Q4_K_M (esta edición); BF16/FreeToken y llama.cpp disponibles en repos hermanos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) para Ollama; safetensors en la edición BF16 |

## Arquitectura y entrenamiento

El modelo usa una arquitectura **Mixture of Experts (MoE)** del tipo `qwen3_5_moe_text`: 40 capas transformer, hidden size de 2048, 16 query heads y 2 key/value heads (grouped-query attention), con 256 expertos enrutados de los cuales se activan 8 por token más un experto compartido, con un tamaño intermedio de experto de 512. El contexto nativo es de 262.144 tokens.

El entrenamiento es una derivación personalizada sobre Qwen3.6-35B-A3B: hereda una destilación de razonamiento (la referencia a "Claude 4.7 Opus" es solo el linaje de destilación, no el modelo propietario), se le aplica **abliteration** (reducción de rechazos) para un comportamiento "uncensored"/"heretic", un SFT de tipo Hermes para esquemas de función y selección de herramientas, y un SFT agéntico para flujos de codificación, terminal, archivos y repositorio. Se preservan las capacidades de visión (proyector) y de MTP (multi-token prediction) del modelo base. El autor indica que usó técnicas LoRA/PEFT con Unsloth para las etapas de post-entrenamiento.

## Capacidades

- **Razonamiento y destilación de razonamiento**: hereda un pipeline de destilación de razonamiento que mejora la cadena de pensamiento en tareas complejas.
- **Generación de texto conversacional**: en inglés, con formato de chat estándar.
- **Function calling / tool use**: entrenado con esquemas estilo Hermes para selección y ejecución de herramientas.
- **Agente y multi-step reasoning**: SFT agéntico para flujos de codificación, interacción con terminal, archivos y repositorios.
- **Visión**: las capacidades de visión del modelo base se preservan, pero su uso depende de que el runtime (Ollama en este caso) cargue el proyector de visión.
- **MTP (multi-token prediction)**: preservado, lo que puede acelerar la decodificación.
- **Comportamiento abliterado**: rechazos reducidos, orientado a casos donde el modelo debe responder sin negativas (con los riesgos que ello conlleva).

## Casos de uso

- **Codificación agéntica local**: el modelo está optimizado para flujos agénticos tipo Claude Code o OpenClaw (Moltbot/Clawdbot). Con ~3B de parámetros activos y cuantización Q4_K_M, puede ejecutarse en portátiles con 16-24 GB de VRAM o RAM unificada, cubriendo edición de código, ejecución de comandos y revisión de repositorios.
- **Asistente de terminal y repositorio**: gracias al SFT agéntico, puede gestionar operaciones de archivos, git y comandos de shell dentro de un bucle de agente.
- **Automatización de tareas con herramientas**: el soporte de function calling estilo Hermes permite integrarlo en pipelines de automatización donde necesita llamar a APIs, bases de datos o servicios externos.
- **Razonamiento de contexto largo**: con 262K tokens de contexto nativo, puede analizar repositorios completos, documentos técnicos extensos o logs de gran tamaño en una sola pasada.
- **Desarrollo de prototipos de agentes**: por su licencia apache-2.0 y su formato Ollama, es adecuado para experimentar con agentes locales sin costes de API.
- **Asistente de investigación en inglés**: su destilación de razonamiento y contexto largo permiten resumir y razonar sobre documentos científicos o técnicos extensos.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks propia de esta edición, pero **todos los resultados están pendientes** ("Pending") excepto la batería de salud del modelo, que pasó 12/12 preflight checks (integridad del modelo). No se han publicado resultados de benchmarks en la información disponible.

| Test | Protocolo | Estado |
|---|---|---|
| Model-health / behavioral integrity | 12 fijos | 12/12 PASS (100%) |
| IFEval | ~40 muestras | Pendiente |
| MMLU-Pro | 42 muestras (3×14) | Pendiente |
| GPQA Diamond CoT | 40 muestras | Pendiente |
| GSM8K CoT | 40 muestras | Pendiente |
| HumanEval+ | 40 muestras | Pendiente |
| MBPP+ | 40 muestras | Pendiente |
| LiveCodeBench | 40 muestras | Pendiente |
| LiveBench | 40 muestras | Pendiente |
| BFCL V4 | 40 muestras | Pendiente |
| BFCL V4 Agentic | 30 muestras | Pendiente |
| XSTest | 40 muestras | Pendiente |
| HarmBench | 40 muestras | Pendiente |

## Requisitos de hardware

- **VRAM estimada**: el archivo Q4_K_M ocupa ~21,7 GB. Con contexto corto, cabe en una GPU de 24 GB (RTX 4090, RTX 3090). Con contexto largo (262K tokens), la memoria KV cache se dispara y se necesitará offload a CPU o cuantización de cache.
- **GPU recomendadas**: el autor valida el funcionamiento en una RTX 4060 Laptop (8 GB VRAM), lo que implica que con offload parcial a CPU y contexto moderado es viable en portátiles. Para contexto largo completo se recomienda GPU de 24 GB o superior (A100, H100, RTX 4090).
- **Uso en consumer GPU**: sí, en GPUs de gama media-alta (8-24 GB) con offload de capas a CPU. Para contexto largo, mejor con 24 GB o más.
- **Opciones de despliegue**: Ollama (formato nativo de esta edición), llama.cpp (edición hermana), vLLM o TGI con el modelo BF16 para servidores.
- **Latencia/throughput**: no se ha publicado datos específicos. En una RTX 4060 Laptop con Q4_K_M y contexto moderado, se espera un throughput de unos 10-20 tokens/s, pero es una estimación sin datos verificados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35.5B total / 3B activo | 262K | Apache-2.0 | safetensors | Modelo oficial de Qwen, sin abliteración ni SFT agéntico |
| Q36-35B-A3B-Opus4.7 (esta edición) | 35.5B total / 3B activo | 262K | Apache-2.0 | GGUF Q4_K_M | Derivado abliterado + Hermes + agéntico |
| Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated (rynky2436/MLXCreator) | 35.5B total / 3B activo | 262K | Apache-2.0 | GGUF (oQ4, fp16) | Derivación similar (abliteration + Hermes) pero con cuantización oQ4 y MTP |

No hay datos de benchmarks comparables entre estas variantes. La elección entre ellas depende del runtime objetivo (Ollama vs llama.cpp) y de la preferencia por MTP vs cuantización específica.

## Limitaciones y advertencias

- **Abliteration y "uncensored"**: el modelo ha sido modificado para reducir rechazos. Esto implica que puede generar contenido sensible, dañino o no seguro sin filtros. No es apto para uso en producción sin moderación externa.
- **Riesgo de alucinación**: no hay datos de benchmarks de fiabilidad (GSM8K, MMLU-Pro pendientes); la destilación de razonamiento no garantiza exactitud factual.
- **Solo inglés**: la model card indica `language: en`. No se ha evaluado el rendimiento en otros idiomas.
- **Visión dependiente del runtime**: la preservación de visión no garantiza que Ollama ejecute el proyector de visión correctamente en todos los entornos.
- **Sin benchmarks completos**: la tabla de pruebas está pendiente; no se puede evaluar el rendimiento real frente a alternativas.
- **Licencia**: apache-2.0 para este derivado, pero el modelo base Qwen3.6 tiene su propia licencia (Apache-2.0 para el modelo oficial, según la model card). Verificar los términos de la licencia de Qwen3.6 para uso comercial.
- **Riesgo de producción**: el comportamiento "heretic" y la reducción de rechazos pueden producir respuestas inapropiadas en entornos de usuario final. No recomendado para servicios públicos sin capa de seguridad.

## Enlaces

- Repositorio HuggingFace (esta edición): https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-Ollama
- Modelo base BF16/FreeToken: https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT
- Edición llama.cpp: https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-Llama
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Página de Qwen3.6:35b-a3b en Ollama: https://ollama.com/library/qwen3.6:35b-a3b
- Variación similar de otro autor: https://huggingface.co/rynky2436/Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-hermes-oQ4-fp16-mtp
