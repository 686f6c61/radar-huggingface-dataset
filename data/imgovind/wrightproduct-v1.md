# imgovind/wrightproduct-v1

## Resumen

Wrightproduct-v1 es un modelo de lenguaje afinado por el usuario de Hugging Face imgovind a partir de Qwen3-30B-A3B-Instruct-2507, un modelo MoE de 30B de parámetros totales (3B activos) de la familia Qwen3. Su propósito es muy específico: convertir un brief de producto (idea, usuarios, restricciones) en la cadena completa de documentación que producirían un product manager y un staff engineer, terminando en asignaciones de trabajo ejecutables por agentes de código.

El pipeline que implementa es: Brief → PRD → Technical Design → ADRs → Task Breakdown → Agent Orchestration. A diferencia de un modelo general con un buen prompt, este modelo está afinado para sostener ese contrato de salida de forma mecánica: empareja cada tarea con su asignación de agente, traza cada elemento de diseño a un requisito numerado (`R#`) y pregunta cuando faltan datos en lugar de inventar métricas.

Es relevante porque aborda un hueco real en los flujos de trabajo con agentes de código: los modelos generales tienden a violar el contrato (el autor reporta 2.159 violaciones de tipo `TASK_NO_ASSIGNMENT` en el modelo base con prompt fuerte). El modelo se publica bajo Apache-2.0, incluye una copia MLX de 4 bits para Mac y usa el formato safetensors con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), fine-tune de Qwen3-30B-A3B-Instruct-2507 |
| Parametros totales | 30.532.122.624 (~30,5B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-30B-A3B-Instruct-2507) |
| Tipos de cuantizacion | 4 bits (MLX, incluida en el repo bajo `mlx/`); bf16 en pesos originales |
| Idiomas soportados | no disponibles (entrenado para dominio de software/SaaS, presumiblemente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (78,3 GB el repo, incluye copia MLX 4-bit) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (el script de exportación menciona `checkpoints/sft/full/adapter`) sobre Qwen3-30B-A3B-Instruct-2507, un modelo MoE de la familia Qwen3 con 30B de parámetros totales y aproximadamente 3B activos por token. Al ser un MoE, activa solo una fracción de los parámetros en cada pasada, lo que permite latencias cercanas a un modelo denso de 3B manteniendo la capacidad de uno de 30B.

Los datos de entrenamiento combinan dos fuentes: documentos de diseño de software reales reescritos al formato de contrato del modelo (Kubernetes KEPs, Python PEPs, Rust RFCs, Kafka KIPs y ADRs públicos, con licencias Apache-2.0, MIT, CC0 o dominio público registradas por elemento) y escenarios sintéticos generados por el propio modelo base Qwen3-30B-A3B-Instruct-2507. La model card indica explícitamente que no hay salidas de APIs comerciales en el conjunto de entrenamiento y que las evaluaciones con un modelo frontera se guardaron separadas de los datos. No hay detalles publicados sobre número de tokens de entrenamiento ni sobre el uso de RLHF/DPO.

## Capacidades

- Generación de PRDs estructurados: problema, objetivos/no objetivos, requisitos numerados con priorización MoSCoW, criterios de aceptación testeables, métricas de éxito, fases de alcance, riesgos y preguntas abiertas.
- Redacción de diseños técnicos con vista C4, tabla de trazabilidad requisitos-diseño, modelo de datos, APIs, flujos clave, no funcionales, alternativas consideradas, rollout y observabilidad.
- Escritura de ADRs (Architecture Decision Records) con estructura Contexto / Decisión / Alternativas / Consecuencias.
- Descomposición en épicas y tareas (`T1..Tn`) con estimaciones, dependencias y cobertura de requisitos.
- Orquestación de agentes: una asignación de trabajo lista para pegar por tarea (objetivo, `R#`s cubiertos, interfaces permitidas/prohibidas, entradas a leer), más protocolo de coordinación y puertas de aceptación.
- Calibración: el modelo pregunta cuando faltan datos en el brief en lugar de inventar métricas o asumir el tamaño de equipo.
- Salida determinista y validable: un único documento Markdown con cinco secciones H1 en orden fijo, verificable mecánicamente con `wrightproduct.contract.validate()`.
- Generación de texto conversacional heredada del modelo base Qwen3 (pipeline text-generation), aunque afinada para su dominio.

## Casos de uso

- Arranque de un nuevo producto de software: se introduce un brief en YAML (idea, usuarios, restricciones) y el modelo genera el paquete completo PRD + diseño + ADRs + tareas, ahorrando días de trabajo inicial de un PM y un arquitecto.
- Preparación de trabajo para agentes de código: las asignaciones de la sección Agent Orchestration están diseñadas para pegarse directamente en herramientas tipo Claude Code, Cursor o Devin, con interfaces permitidas/prohibidas y criterios de aceptación.
- Auditoría de trazabilidad: la tabla de trazabilidad del Technical Design enlaza cada elemento de diseño con un requisito `R#`, útil para revisiones de arquitectura y cumplimiento.
- Documentación de decisiones técnicas: genera ADRs con estructura estándar a partir de las alternativas consideradas en el diseño, aptas para commitear en el repositorio.
- Planificación de sprints: el Task Breakdown con estimaciones, dependencias y cobertura de requisitos puede alimentar directamente un backlog en Jira o Linear.
- Prototipado de especificaciones en equipos pequeños: equipos sin PM dedicado pueden obtener documentación de calidad profesional a partir de un brief breve.
- Enseñanza de ingeniería de software: el formato de salida sirve como ejemplo canónico de cómo se encadenan PRD, diseño, ADRs y descomposición de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta una evaluación propia:

| Modelo | Puntuación (rúbrica de 13 criterios) | Violaciones de contrato `TASK_NO_ASSIGNMENT` |
|---|---|---|
| Qwen3-30B-A3B + prompt fuerte (baseline) | 4,45 / 5 | 2.159 en 155 documentos |
| wrightproduct-v1 | no disponible (ver `evals/reports/`) | no disponible |

La evaluación se realizó contra un conjunto congelado de 155 escenarios con una rúbrica de 13 criterios (calidad del PRD, diseño, trazabilidad, calibración, honestidad, orquestación de agentes). Los números completos del modelo afinado están en `evals/reports/` del repositorio de entrenamiento, no en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18 GB en 4 bits (copia MLX incluida); ~60 GB en bf16, según la propia model card.
- GPU recomendadas: en bf16, una A100 u H100 de 80 GB (o dos GPUs de 48 GB con paralelismo); en 4 bits, GPUs de consumo de 24 GB como la RTX 3090 o RTX 4090 deberían ser suficientes.
- En Mac: cabe en máquinas Apple Silicon con al menos 24-32 GB de memoria unificada usando la copia MLX de 4 bits vía `mlx-lm`.
- Opciones de despliegue: transformers con `device_map="auto"` (código de ejemplo en la model card), mlx-lm en Mac; al ser compatible con la arquitectura qwen3_moe, debería funcionar también con vLLM y llama.cpp si existe soporte para la arquitectura, aunque el repo no lo documenta explícitamente.
- Latencia y throughput: no disponibles; al activar solo ~3B de parámetros por token, la velocidad de generación debería aproximarse a la de un modelo denso de 3B. El ejemplo de la model card usa `max_new_tokens=8000` y `temperature=0.2`.

## Comparativa con modelos similares

| Característica | wrightproduct-v1 | Qwen3-30B-A3B-Instruct-2507 (base) | Modelos generales con prompt (p. ej. GPT-4-class vía API) |
|---|---|---|---|
| Parametros | 30,5B totales / ~3B activos | 30,5B totales / ~3B activos | no disponible |
| Especialización | Documentación PM + arquitectura + orquestación de agentes | Modelo general instruct | General |
| Violaciones de contrato reportadas | no disponible (ver evals) | 2.159 en 155 docs con prompt fuerte | no disponible |
| Licencia | Apache-2.0 | Apache-2.0 | propietaria (en general) |
| Despliegue local | Sí (transformers, MLX 4-bit) | Sí | No |
| Idiomas | no disponible | Multilingüe | Multilingüe |

Alternativas comparables en la categoría de generación de especificaciones software: no disponible (no hay otros modelos afinados públicos documentados para esta tarea exacta en la información proporcionada).

## Limitaciones y advertencias

- Dominio acotado: entrenado solo para productos de software/SaaS; otros dominios están fuera del alcance en la versión v0, según el propio autor.
- Sin acceso a información actualizada: el modelo no recupera hechos tecnológicos recientes; si se necesita asesoría de stack al día, hay que emparejarlo con RAG o herramientas de búsqueda.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se basa en documentos técnicos en inglés (KEPs, PEPs, RFCs, KIPs), por lo que el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: el fine-tune está orientado a reducir la invención de métricas y tareas huérfanas, pero no elimina el riesgo inherente a los LLM; conviene validar la salida con `wrightproduct.contract.validate()` y revisión humana.
- Sesgos: no documentados. Los datos de entrenamiento provienen mayoritariamente de proyectos open source de infraestructura (Kubernetes, Python, Rust, Kafka), lo que puede sesgar las decisiones de arquitectura hacia ese ecosistema.
- Tamaño del repo: 78,3 GB, considerablemente mayor que los pesos bf16 del modelo (~61 GB), porque incluye la copia MLX 4-bit; conviene usar descarga selectiva.
- Uso comercial: permitido por la licencia Apache-2.0, sin restricciones conocidas más allá de las estándar de la licencia.
- Trazabilidad del proyecto: el modelo es un fine-tune comunitario con pocas descargas (431) y sin likes en el momento de la ficha; no hay auditoría externa ni soporte garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imgovind/wrightproduct-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- mlx-lm (para ejecutar la copia MLX): https://github.com/ml-explore/mlx-lm
- Repositorio de código de entrenamiento (`wrightproduct`): mencionado en la model card, enlace no disponible en la información proporcionada
