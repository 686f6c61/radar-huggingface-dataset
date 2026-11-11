# Rowhanissick/unlink-v2

## Resumen

Unlink-V2 es un modelo de lenguaje de ~8.950 millones de parámetros derivado de `huihui-ai/Huihui-Qwen3.5-9B-abliterated`, a su vez basado en la arquitectura Qwen3.5 del equipo Qwen. Lo desarrolla y entrena Rowhanissick, con la organización UnlinkPy como propietaria y mantenedora. El modelo se presenta como una variante "abliterated" (con las capas de rechazo eliminadas a nivel de pesos) orientada a casos de uso de agente autónomo, computer-use y ciberseguridad ofensiva y defensiva.

La propuesta diferencial de Unlink-V2 no es tanto el modelo base como la interfaz de agente estructurada que introduce: un conjunto de bloques XML nativos (`<think>`, `<steps>`, `<checks>`, `<command>`, `<read>`, `<write>`, `<vuln>`, `<skill>`, entre otros) que formalizan el razonamiento interno, la planificación multi-paso, la validación de entorno y la invocación de habilidades modulares. Está pensado para integrarse en pipelines de automatización de sistemas operativos y auditoría de seguridad, no como asistente conversacional generalista.

El modelo declara una ventana de contexto de 1M tokens (según los tags de la model card), licencia Apache 2.0 y formato de pesos safetensors. Es relevante ahora por la combinación de tres tendencias: modelos abliterated de uso libre, agentes de computer-use con protocolos estructurados, y despliegue de modelos de ~9B parámetros en hardware de consumo con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1M tokens (declarado en tags; no verificado en model card) |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; sin GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 18,1 GB |
| Modelo base | huihui-ai/Huihui-Qwen3.5-9B-abliterated |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 8,95B parámetros, heredado del checkpoint abliterated de huihui-ai. El proceso de abliteration consiste en identificar las direcciones de activación asociadas al rechazo y proyectarlas fuera de los pesos, de modo que el modelo pierde la tendencia a emitir negativas o advertencias morales. Unlink-V2 declara aplicar abliteration "a nivel de pesos" sobre una base ya verificada como libre de rechazos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de fine-tuning, ni sobre si se aplicó RLHF, DPO u otra fase de alineamiento posterior. La model card describe el post-entrenamiento en términos de formato: se ha ajustado el modelo para emitir de forma nativa bloques XML de deliberación y acción (`<think>`, `<steps>`, `<checks>`, `<screenshot>`, `<command>`, `<read>`, `<write>`, ``, `<vuln>`, `<skill>`), lo que funciona como un protocolo de agente estructurado embebido en el propio formato de salida. No se documentan innovaciones de decodificación (especulativa, attention linear) ni detalles sobre la tokenización o el preentrenamiento.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento interna explícita mediante el bloque `<think>`.
- Planificación multi-paso secuencial con el bloque `<steps>`, orientada a la ejecución de tareas de agente.
- Validación de pre y post-condiciones de entorno con `<checks>`.
- Ejecución de comandos de shell, terminal y bash mediante `<command>`.
- Lectura e inspección de ficheros y parseo de configuración con `<read>`.
- Escritura de código y generación de payloads con `<write>`.
- Entrada interactiva por stdin o teclado con ``.
- Captura de buffer visual de UI o pantalla con `<screenshot>` (declarado como capacidad de computer-use; la naturaleza real de la captura no está detallada).
- Registro de vulnerabilidades y offsets de memoria con `<vuln>`.
- Invocación y encadenamiento de habilidades modulares con `<skill>` (por ejemplo `antigravity-guide`, `security-audit`, `claude-computer-use`).
- Comportamiento libre de rechazos (zero-refusal) por abliteration de pesos.
- Soporte de tool calling: no documentado de forma explícita más allá de los bloques XML propios.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking: sí, mediante `<think>`, integrado en el formato de salida.

## Casos de uso

- Automatización de operaciones en sistemas Linux/Unix: el modelo puede emitir secuencias de `<command>` y `<checks>` para ejecutar tareas administrativas, validar el estado del sistema antes y después de cada paso y registrar el resultado, integrándose en orquestadores de agentes.
- Auditoría de seguridad y pentesting asistido: los bloques `<vuln>` y `<skill>` permiten estructurar la salida de hallazgos con offsets y referencias, encadenando habilidades de `security-audit` para revisiones repetibles sobre código o binarios.
- Computer-use y automatización de interfaces: con `<screenshot>` e `` el modelo puede formar parte de un bucle de control de UI (lectura de pantalla, decisión, acción) en entornos de escritorio virtualizados, siempre con un ejecutor externo que materialice las acciones.
- Generación de scripts y payloads en pipelines de CI/CD: el bloque `<write>` produce código y artefactos que pueden inyectarse en repositorios o jobs, con validación previa mediante `<checks>` para evitar ejecuciones inconsistentes.
- Análisis de configuración y hardening de servidores: lectura de ficheros de configuración con `<read>`, detección de desviaciones respecto a una línea base y propuesta de parches mediante `<write>`.
- Investigación en alineamiento y abliteration: al ser un modelo zero-refusal con formato estructurado, sirve como sujeto de estudio para medir efectos de la eliminación de rechazos en tareas de agente y para comparar con checkpoints alineados.
- Automatización de respuesta a incidentes: el encadenamiento `<think>` → `<steps>` → `<command>` permite generar runbooks ejecutables para triaje y contención, con el operador humano como validador final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, más overhead de KV cache; en la práctica se recomienda 24 GB o más para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB para pesos, dependiendo del esquema.
- VRAM estimada en cuantización de 4 bits: en torno a 6-8 GB para pesos, más KV cache; viable en GPUs de consumo de gama alta.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, o RTX 4090 24 GB para contextos cortos.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto limitado; en RTX 3090 (24 GB) de forma similar; en GPUs de 12-16 GB requiere cuantización.
- Opciones de despliegue: vLLM y TGI para safetensors en servidor; llama.cpp y Ollama solo si se generan conversiones GGUF, que no están publicadas en el repo.
- Latencia y throughput: no disponible. El contexto declarado de 1M tokens implicaría un coste de KV cache muy elevado en FP16, por lo que en producción conviene limitar la ventana efectiva o usar atención con cache cuantizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlink-V2 | ~8,95B | 1M (declarado) | Agente autónomo, computer-use, ciberseguridad, zero-refusal | Apache 2.0 | Hugging Face (safetensors) |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | ~9B | no disponible | Base abliterated sin formato de agente | no disponible | Hugging Face |
| Qwen3.5-9B (original) | ~9B | no disponible | Modelo generalista alineado | no disponible | Hugging Face |
| Modelos abliterated de la familia Llama 3.x 8B | ~8B | 8K-128K según variante | Uso general sin rechazos | varía (Llama license o Apache según derivado) | Hugging Face |

La comparación directa con benchmarks no es posible porque Unlink-V2 no publica resultados. Frente a su base, la diferencia es el formato de agente y el post-entrenamiento; frente a modelos alineados de tamaño similar, la diferencia principal es la ausencia de rechazos y la estructura XML nativa, a costa de perder las garantías de seguridad del alineamiento original.

## Limitaciones y advertencias

- Ausencia total de rechazos: el modelo puede generar contenido dañino, instrucciones de explotación, payloads maliciosos o comandos destructivos sin advertencia. Requiere sandboxing y validación humana obligatoria en cualquier uso con ejecución real.
- Riesgo elevado de alucinación en los bloques `<vuln>` y `<command>`: offsets de memoria, CVE y comandos pueden ser plausibles pero incorrectos; nunca deben ejecutarse sin verificación.
- Contexto de 1M tokens declarado en tags pero no verificado en la model card; el coste de KV cache en FP16 es prohibitivo en hardware de consumo y la calidad en ventanas extremas no está documentada.
- Solo inglés: no hay soporte multilingüe declarado, lo que limita su uso en entornos hispanohablantes sin traducción intermedia.
- Sin datos de benchmarks, evaluación de seguridad ni métricas de calidad publicadas; el rendimiento real es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal por el uso de un modelo zero-refusal en ciberseguridad recae sobre el desplegador.
- El bloque `<screenshot>` sugiere capacidades visuales, pero el pipeline es text-generation y no se documenta un codificador visual; debe tratarse como marcador de protocolo, no como percepción real de imágenes.
- Sin conversiones GGUF publicadas, el despliegue en llama.cpp/Ollama requiere conversión manual y validación.
- Modelo con 0 descargas y 1 like en el momento del registro: ecosistema mínimo, sin garantías de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rowhanissick/unlink-v2
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Perfil del autor: https://huggingface.co/Rowhanissick
- Equipo Qwen (arquitectura base): https://huggingface.co/Qwen
- Organización UnlinkPy: no disponible como enlace verificado en la información proporcionada
- Paper, blog o demo oficiales: no disponible
