# mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1

## Resumen

Tenet-12B-Nemo-Unslop-v1 es un ajuste fino (fine-tune) del modelo Mistral-Nemo-Instruct-2407 desarrollado por el usuario mr-andrey-isachenko dentro de la familia Tenet. El modelo parte de la arquitectura transformer densa de Mistral Nemo, con 12.247.782.400 parámetros totales, y aplica una técnica propietaria denominada Lancet, descrita por el autor como una cirugía de subespacios con preservación de norma y proyección bidireccional. El objetivo declarado es reducir los rechazos falsos positivos (over-refusals) y el denominado «slop» estilístico (prosa recargada, preámbulos moralizantes) sin degradar las capacidades de razonamiento, código y uso de herramientas del modelo base.

El modelo se presenta como un checkpoint listo para proveedores, exportado en FP8 (E4M3), sin código personalizado, sin `trust_remote_code` y sin `auto_map`, de modo que puede cargarse directamente en vLLM, proveedores de OpenRouter, GGUF y MLX. La licencia es Apache 2.0 y el repositorio ocupa 32,6 GB, incluyendo pesos en safetensors y GGUF.

La relevancia actual reside en su enfoque de «des-abliteración quirúrgica»: frente a la abliteración ingenua, que el autor reporta como destructiva para la salida estructurada y las capacidades de tool calling, Tenet propone una eliminación de la dirección de rechazo en las proyecciones de entrada y salida con restauración exacta de la norma residual, seguida de un pase de GRPO con compuertas que penaliza patrones de slop solo donde la cirugía debilitó los circuitos de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 (E4M3) en el checkpoint publicado; GGUF disponible en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Mistral-Nemo-Instruct-2407. Sobre esa base, el autor aplica el motor Lancet, descrito como una cirugía de subespacios con preservación de norma y proyección bidireccional: la dirección de rechazo se identifica tanto en la proyección de entrada (residual stream) como en la de salida (unembedding), el componente se elimina en ambas direcciones y la norma residual se restaura de forma exacta para mantener las magnitudes de activación y las distribuciones de tokens posteriores sobre la variedad original.

Tras la cirugía se ejecuta un pase de GRPO («gated unslop GRPO»), una optimización de preferencias por grupos cuyas recompensas penalizan patrones de slop (prosa recargada, vocabulario tipo «tapestry», preámbulos moralizantes) únicamente donde la cirugía debilitó los circuitos de rechazo, con el fin de reforzar el razonamiento y la capacidad de código del modelo base en lugar de sacrificarlos. El pipeline de publicación incluye además cuantización FP8 (E4M3) y una fusión TIES «subspace-safe» que, según el autor, se mantiene ortogonal al subespacio ancla de tool/SQL. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles del RLHF/DPO más allá del pase GRPO descrito.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento estructurado y análisis, preservando el subespacio ancla del modelo base según el autor.
- Generación de código y consultas SQL.
- Tool calling / function calling con salida estructurada (el autor muestra ejemplos de llamadas válidas a DuckDB con esquema JSON).
- Uso agéntico y razonamiento multi-paso (etiquetas `agentic`, `tool-use`).
- Reducción de rechazos falsos positivos en prompts benignos (triage de logs, consultas de seguridad defensiva).
- Mitigación de slop estilístico (prosa recargada, preámbulos moralizantes).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia en AppSec y DevOps: el modelo puede procesar líneas de log de autenticación (por ejemplo, nginx) y devolver llamadas a herramientas SQL válidas para DuckDB, como se ilustra en la model card, sin rechazos falsos ante tareas defensivas legítimas.
- Generación de código en producción: al soportar tool calling y salida estructurada, puede integrarse en pipelines de CI/CD para generar consultas, scripts de análisis o parches con formato verificable.
- Agentes automatizados multi-paso: las etiquetas `agentic` y `tool-use` indican idoneidad para orquestaciones que encadenan llamadas a herramientas, con menor probabilidad de rechazo en pasos intermedios benignos.
- Análisis de datos y SQL: la fusión TIES reportada como ortogonal al subespacio de tool/SQL sugiere que las capacidades de generación de consultas se conservan tras la cirugía y la cuantización.
- Atención al cliente automatizada: modelo conversacional afinado para evitar preámbulos moralizantes y prosa recargada, lo que produce respuestas más directas en diálogos multi-turno.
- Asistentes de escritura técnica: la penalización del slop estilístico reduce el vocabulario recargado y los preámbulos, útil para documentación y resúmenes técnicos.
- Despliegue en proveedores de inferencia: al no requerir `trust_remote_code` ni `auto_map`, el checkpoint FP8 encaja directamente en vLLM y en proveedores de OpenRouter.

## Benchmarks y rendimiento

Los datos provienen de las ejecuciones `final_metrics.json` del pipeline de publicación del autor (etapas H9 a H12). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica (etapa) | Valor | Direccion |
|---|---|---|
| Lancet KL Collateral (H9) | 9,75e-03 | Menor es mejor |
| Naive KL Collateral (H9) | 0,30 | Menor es mejor |
| KL Reduction Ratio (H9) | 0,97 | Mayor es mejor |
| Target Suppression Ratio (H9) | 0,99 | Mayor es mejor |
| Gated GRPO IFEval Score (H10) | 0,63 | Mayor es mejor |
| Gated vs Naive/Additive Gain (H10) | 0,43 | Mayor es mejor |
| Slop & Refusal Rate (H10) | 0,02 | Menor es mejor |
| Post-Merge Suppression Retention (H10) | 1,00 | Mayor es mejor |
| FP8 Retention Ratio (H11) | 0,97 | Mayor es mejor |
| FP8 KL Reduction vs Naive (H11) | 0,49 | Mayor es mejor |
| FP8 Subspace Re-Leakage Lancet (H11) | 0,18 | Menor es mejor |
| FP8 Subspace Re-Leakage Naive (H11) | 0,50 | Menor es mejor |
| SQL-Incident Retention (H12) | 1,00 | Mayor es mejor |
| Unslop Retention (H12) | 1,00 | Mayor es mejor |
| Subspace-Safe Merge Re-Leakage (H12) | 6,63e-08 | Menor es mejor |
| TIES Bi-Projected vs Naive Gain (H12) | 0,78 | Mayor es mejor |

Comparativa del autor entre base, abliteración ingenua y Tenet:

| Metrica | Base | Naive Abliteration | Tenet (BF16) | Tenet (FP8 E4M3) |
|---|---|---|---|---|
| KL Collateral Drift | — | 0,30 | 9,75e-03 | 0,18 |
| Refusal Suppression | — | — | 0,99 | 1,00 |
| Tool/SQL Anchor Orthogonality | — | 0,81 | 3,00e-08 | 0,13 |
| LoRA Re-Leakage | — | 0,81 | 0,13 | 0,18 |
| FP8 Subspace Re-Leakage | — | 0,50 | — | 0,18 |
| Max Row Crest-Factor (< 25,0) | — | — | 10,65 | 10,65 |

Otros datos reportados: crest-factor máximo por fila de 10,65 y peso absoluto máximo de 0,92.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia de tamaño, el repo ocupa 32,6 GB e incluye pesos FP8 (E4M3) y GGUF; un checkpoint de 12,25 mil millones de parámetros en FP8 requiere aproximadamente 12,3 GB solo para los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar viabilidad en GPUs con 16-24 GB de VRAM en FP8 o cuantizaciones GGUF más agresivas, y con holgura en A100, H100 o L40S; estos extremos no están confirmados en la información disponible.
- Cabe en GPU de consumo: no confirmado explícitamente; depende de la cuantización GGUF elegida y de la longitud de contexto, dato este último no disponible.
- Opciones de despliegue: vLLM (soporte nativo, sin `trust_remote_code`), proveedores de OpenRouter, GGUF (llama.cpp/Ollama por el formato publicado) y MLX según el autor. También transformers con safetensors y text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tenet-12B-Nemo-Unslop-v1 | 12,25 B | no disponible | Apache 2.0 | Fine-tune con cirugía Lancet y GRPO; FP8 y GGUF publicados |
| mistralai/Mistral-Nemo-Instruct-2407 | 12 B | no disponible en la informacion | Apache 2.0 | Modelo base; rechazos falsos y slop reportados por el autor |
| Abliteración ingenua del mismo base | 12 B | no disponible | Apache 2.0 | Referencia del autor; mayor deriva KL y peor salida estructurada según sus métricas |

No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, otras variantes abliteradas o fine-tunes de Mistral Nemo) en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente no destinado a operaciones cibernéticas ofensivas, generación de malware ni contenido ilícito; esos usos quedan fuera de alcance según el autor.
- La reducción de rechazos puede aumentar la probabilidad de respuestas a prompts que el modelo base rechazaría; requiere evaluación propia antes de desplegar en producción.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles; conviene verificar ambos antes de usos multilingües o con contextos largos.
- Las métricas publicadas (KL Collateral, Retention Ratio, etc.) son internas del pipeline del autor y no equivalen a benchmarks estándar de capacidad; no deben interpretarse como rendimiento absoluto en MMLU, HumanEval o GSM8K.
- La cuantización FP8 introduce cierta re-fuga del subespacio (0,18 frente a 0,50 de la abliteración ingenua), por lo que el comportamiento en FP8 difiere ligeramente del BF16.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Mistral Nemo y las condiciones del ecosistema de proveedores deben verificarse por separado.
- Modelo con muy pocas descargas (1116) y un único «like» en el momento de la ficha; madurez y validación comunitaria limitadas.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Codigo fuente e informe tecnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Auditoria interactiva (FP8 & Abliteration Inspector): https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Coleccion de la familia Tenet v1: https://huggingface.co/mr-andrey-isachenko
