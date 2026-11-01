# remix3030303/cyber-qwen3-8b-agent-MLX-3bit

## Resumen

Cyber Qwen3-8B Agent es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-8B orientado a ciberseguridad, desarrollado por el usuario remix3030303. El modelo está entrenado para asistencia en pruebas de penetración autorizadas, análisis defensivo, ingeniería de detección, respuesta a incidentes y validación de vulnerabilidades, con un enfoque explícito en la calibración de evidencia (no afirmar una vulnerabilidad sin respaldo) y en la emisión de llamadas a herramientas estructuradas dentro de bucles de agente.

El repositorio aquí descrito es una build cuantizada en 3-bit para Apple Silicon mediante MLX, derivada del adaptador LoRA fusionado con la base Qwen3-8B en fp16 y posteriormente cuantizada con mlx-lm (group size 64, aproximadamente 3,5 bits por peso, unos 3,6 GB). El modelo base Qwen3-8B es un transformer denso de 8.190.735.360 parámetros, y esta build hereda su licencia Apache-2.0.

La relevancia de esta ficha radica en que se trata de una build muy específica (3-bit, MLX, orientada a Mac de 16 GB) de un fine-tune de nicho con cero descargas y sin benchmarks publicados. Es útil para desarrolladores que quieran ejecutar un asistente de ciberseguridad localmente en hardware Apple, pero debe evaluarse con cautela: el propio autor advierte de que la cuantización a 3-bit degrada la precisión en identificadores exactos (CVE, sintaxis de comandos) y de que la build no ha sido probada ni benchmarkeada en un Mac por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), cuantizado con MLX |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenado con secuencias de hasta 2048 tokens; comportamiento en contextos mas largos no probado) |
| Tipos de cuantizacion | 3-bit MLX (group size 64, ~3,5 bits por peso, ~3,6 GB); existe build 4-bit separada |
| Idiomas soportados | No disponible (no se declaran idiomas en la model card ni en los tags) |
| Licencia | Apache-2.0 (siguiendo el modelo base) |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer denso de aproximadamente 8,19 mil millones de parámetros. El fine-tune se realizó mediante SFT con LoRA sobre una base cuantizada en 4-bit NF4 (QLoRA), usando TRL SFTTrainer, PEFT, bitsandbytes y Transformers, con pérdida calculada solo sobre los turnos del asistente (assistant-only loss). El entrenamiento se ejecutó en 2 GPU NVIDIA T4 (Kaggle) con DDP vía torchrun en fp16, durante 1 época y 1073 pasos de optimizador, con longitud máxima de secuencia limitada a 2048 tokens. La pérdida final de entrenamiento fue de 0,874 y la precisión de token aproximada del 77 % al final; se usó checkpointing con reanudación por reinicios por OOM de CUDA.

Los datos de entrenamiento son una mezcla curada: instrucciones de ciberseguridad, registros CTI fundamentados (CVE, CWE, ATT&CK, CAPEC), una muestra acotada de HolyCyber, trayectorias de uso de herramientas (shell, http_request, search, read_file, grep, python), investigaciones multi-turno, ejemplos de ambigüedad y falsos positivos, y una pequeña mezcla de instrucciones generales para reducir el olvido catastrófico. Los datos se deduplicaron de forma exacta y se dividieron por entidad para evitar que un mismo CVE/CWE/ATT&CK/CAPEC apareciera en train, validación y test. El dataset no está publicado y las licencias de las fuentes pueden diferir. La build MLX 3-bit se obtuvo fusionando el adaptador LoRA en la base fp16 y cuantizando después con mlx-lm; dado que el adaptador se entrenó sobre una base 4-bit y se fusionó en fp16, el comportamiento puede diferir ligeramente del entrenamiento.

## Capacidades

- Generación de texto y razonamiento orientado a ciberseguridad (análisis defensivo, respuesta a incidentes, revisión de código seguro).
- Soporte de tool calling estructurado: el modelo está entrenado para emitir llamadas a herramientas en bucles de agente (shell, http_request, search, read_file, grep, python).
- Flujos agénticos multi-paso para investigaciones y triaje.
- Calibración de evidencia: entrenado para no afirmar una vulnerabilidad sin respaldo.
- Análisis de falsos positivos y manejo de ambigüedad en hallazgos de escáneres.
- Resumen de inteligencia de amenazas y registros CTI (CVE, CWE, ATT&CK, CAPEC).
- Modo thinking de Qwen3 (puede desactivarse con `enable_thinking=False` para respuestas más cortas y rápidas).
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Asistencia en pruebas de penetración autorizadas: el modelo puede ayudar en el alcance (scoping), la planificación y la redacción de informes dentro de un engagement con autorización escrita, apoyándose en su entrenamiento específico de seguridad.
- Triaje de salida de escáneres: puede clasificar hallazgos y analizar falsos positivos, usando los ejemplos de ambigüedad y falsos positivos incluidos en el entrenamiento.
- Ingeniería de detección: generación y revisión de reglas y lógica de detección a partir de registros ATT&CK y CTI.
- Respuesta a incidentes: redacción de notas de incidente y resúmenes de inteligencia de amenazas con contexto de CVE/CWE.
- Revisión de código seguro: análisis de código y recomendaciones de remediación, apoyándose en la mezcla de instrucciones de seguridad y código.
- Flujos agénticos con herramientas: ejecución de bucles de agente que llaman a shell, http_request, search, read_file, grep o python dentro de un alcance autorizado.
- Validación de vulnerabilidades: comprobación de evidencia antes de reportar un CVE, con el enfoque de calibración de evidencia del modelo.
- Ejecución local en Apple Silicon: despliegue en un Mac de 16 GB (por ejemplo, Mac mini M4) para uso interactivo o scripts con `mlx_lm.chat` y `mlx_lm.generate`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ejecutaron el test de sanidad held-out ni el benchmark base-vs-finetuned para esta release, y que esta build no ha sido benchmarkeada ni probada en un Mac por el autor.

## Requisitos de hardware

- VRAM/espacio estimado: unos 3,6 GB de pesos en la build 3-bit MLX, más KV cache y overhead del sistema.
- Hardware objetivo: Apple Silicon con 16 GB de memoria unificada (por ejemplo, Mac mini M4), según el autor.
- GPU NVIDIA: no aplica a esta build MLX; el entrenamiento se hizo en 2x T4, pero la inferencia de esta build es para Apple Silicon.
- Cabe en GPU de consumo: no disponible para esta build (formato MLX); la build 4-bit está pensada para Macs con más margen de memoria.
- Despliegue: mlx-lm (`mlx_lm.chat`, `mlx_lm.generate`, API Python `load`/`generate`).
- Consejos de memoria del autor para 16 GB: cerrar aplicaciones pesadas, mantener el contexto por debajo de unos 8k tokens, usar `--max-kv-size` para limitar la KV cache y `enable_thinking=False` para respuestas más cortas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyber-qwen3-8b-agent-MLX-3bit | 8.190.735.360 | No disponible (entrenado a 2048) | 3-bit MLX | Apache-2.0 | HuggingFace (0 descargas) |
| cyber-qwen3-8b-agent-MLX-4bit | No disponible | No disponible | 4-bit MLX | Apache-2.0 | HuggingFace (build hermana recomendada por el autor) |
| Qwen/Qwen3-8B (base) | 8.190.735.360 | No disponible en la informacion proporcionada | Multiples (incluye MLX) | Apache-2.0 | HuggingFace (modelo base oficial) |
| cyber-qwen3-8b-agent-lora | No disponible | No disponible | Adaptador LoRA | Apache-2.0 | HuggingFace (adaptador para otros runtimes) |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Uso restringido: no debe emplearse contra sistemas que no se posean o para los que no se tenga autorización escrita de prueba.
- No sustituye a un profesional de seguridad: las salidas pueden ser erróneas o estar desactualizadas; hay que verificar hallazgos y detalles de CVE de forma independiente.
- Sin benchmarks: no hay resultados formales ni test de sanidad held-out para esta release.
- Contexto limitado: entrenado con secuencias de hasta 2048 tokens; el comportamiento en contextos más largos no está probado.
- Degradación por cuantización: el 3-bit pierde más calidad que el 4-bit, con más errores en identificadores exactos (CVE) y sintaxis de comandos; el autor recomienda la build 4-bit si cabe en memoria.
- Discrepancia de entrenamiento: el adaptador se entrenó sobre base 4-bit y se fusionó en fp16, por lo que el comportamiento puede diferir del entrenamiento.
- Sesgos heredados: hereda los sesgos y limitaciones de Qwen3-8B.
- Idiomas: no se declaran idiomas soportados; el rendimiento multilingüe es incierto.
- Licencia de datos: aunque el modelo es Apache-2.0, las fuentes de datos de entrenamiento pueden tener sus propios términos; conviene revisarlos antes de uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-01), sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/remix3030303/cyber-qwen3-8b-agent-MLX-3bit
- Build 4-bit MLX: https://huggingface.co/remix3030303/cyber-qwen3-8b-agent-MLX-4bit
- Adaptador LoRA: https://huggingface.co/remix3030303/cyber-qwen3-8b-agent-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
