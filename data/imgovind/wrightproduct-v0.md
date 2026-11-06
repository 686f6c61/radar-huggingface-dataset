# imgovind/wrightproduct-v0

## Resumen

Wrightproduct-v0 es un modelo de lenguaje afinado por imgovind a partir de Qwen3-30B-A3B-Instruct-2507, orientado a una tarea muy concreta: transformar un brief de producto (idea, usuarios, restricciones) en la cadena completa de documentación que produciría un equipo de product management y staff engineering: PRD, diseño técnico, ADRs, descomposición en tareas y asignaciones de trabajo listas para agentes de código. Su valor diferencial no es la generación de prosa general, sino el cumplimiento estricto de un contrato de salida verificable mecánicamente, algo en lo que los modelos generales suelen fallar (tareas sin asignación asociada, métricas inventadas, diseños desproporcionados respecto al brief).

Arquitecturalmente hereda el diseño MoE del modelo base: 30,5 mil millones de parámetros totales de los cuales solo unos 3 mil millones se activan por token, lo que permite inferencia eficiente en hardware de consumo, especialmente vía la copia MLX 4-bit incluida en el propio repositorio para Macs con Apple Silicon. El contexto y las capacidades generales (tool calling, multilingüismo) son los del modelo base Qwen3-30B-A3B-Instruct-2507.

Es relevante ahora porque encaja en la tendencia de modelos especializados en orquestación de agentes de código: no escribe el software, sino que produce los artefactos de especificación y los encargos de trabajo que otros agentes de programación pueden ejecutar, con protocolo de coordinación y puertas de aceptación incluidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) |
| Parámetros totales | 30.532.122.624 (30,5 B) |
| Parámetros activos | ~3 B (heredado del base Qwen3-30B-A3B) |
| Longitud de contexto | no disponible (el base Qwen3-30B-A3B-Instruct-2507 usa 262.144 tokens, pero no figura en la model card) |
| Tipos de cuantización | 4-bit (copia MLX incluida en `mlx/`), bfloat16 (pesos completos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (78,3 GB el repositorio), incluye copia MLX 4-bit |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (el propio README menciona checkpoints `sft/full`) sobre Qwen3-30B-A3B-Instruct-2507, un transformer de mezcla de expertos con 30,5 B de parámetros totales y ~3 B activos por token. No se detallan en la model card las técnicas de atención ni el número exacto de expertos, pero corresponden a las del modelo base Qwen3 MoE.

Los datos de entrenamiento combinan dos fuentes: documentos de diseño de software reales reescritos al formato de contrato del modelo (Kubernetes KEPs, Python PEPs, Rust RFCs, Kafka KIPs y ADRs públicos, con licencias Apache-2.0, MIT, CC0 o dominio público registradas por elemento) y escenarios sintéticos generados por el propio modelo base Qwen3-30B-A3B-Instruct-2507. La model card destaca que no se incluyen salidas de APIs comerciales en el conjunto de entrenamiento y que las evaluaciones de línea base con modelos frontera se guardan por separado en `evals/results/`, nunca en `data/`, para evitar contaminación. No se especifica el número de tokens de entrenamiento ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación estructurada de PRD: problema, objetivos/no objetivos, requisitos numerados con priorización MoSCoW, criterios de aceptación testeables, métricas de éxito, fases de alcance, riesgos y preguntas abiertas.
- Diseño técnico: visión C4, tabla de trazabilidad que vincula cada elemento de diseño a un requisito `R#`, modelo de datos, APIs, flujos clave, no funcionales, alternativas consideradas, rollout y observabilidad.
- Redacción de ADRs: un registro por decisión significativa con Contexto / Decisión / Alternativas / Consecuencias.
- Descomposición en tareas: épicas y tareas `T1..Tn` con estimaciones, dependencias y cobertura de requisitos.
- Orquestación de agentes: un encargo de trabajo listo para pegar por tarea (objetivo, `R#`s, interfaces permitidas y prohibidas, entradas a leer), más protocolo de coordinación y puertas de aceptación.
- Calibración de incertidumbre: el modelo pregunta cuando faltan datos en el brief en lugar de inventar métricas.
- Salida verificable: documento Markdown con cinco secciones H1 en orden fijo (`# PRD`, `# Technical Design`, `# ADRs`, `# Task Breakdown`, `# Agent Orchestration`), validable con `wrightproduct.contract.validate()`.
- Compatibilidad con el ecosistema transformers y MLX (`mlx_lm.generate`).

No se documenta soporte explícito de tool calling, visión ni audio en la model card; las capacidades generales serían las heredadas del base Qwen3-30B-A3B-Instruct-2507.

## Casos de uso

- Arranque de un producto SaaS desde cero: se introduce un brief en YAML (idea, usuarios, restricciones) y el modelo genera en una sola pasada el PRD, el diseño técnico y los ADRs, ahorrando días de trabajo inicial de especificación.
- Alimentación de equipos de agentes de código: la sección `Agent Orchestration` produce encargos de trabajo por tarea con interfaces permitidas y prohibidas, listos para pegar en herramientas como Claude Code, Cursor u orquestadores multi-agente.
- Auditoría de especificaciones: la tabla de trazabilidad requisito-diseño permite verificar mecánicamente que cada elemento de diseño cubre un `R#` y viceversa, útil en revisiones de arquitectura.
- Prototipado rápido de decisiones de arquitectura: los ADRs generados con alternativas y consecuencias sirven como punto de partida para discusiones de diseño en equipos pequeños sin staff engineer dedicado.
- Estimación y planificación de sprints: la descomposición en tareas con estimaciones, dependencias y cobertura de requisitos se puede importar directamente en gestores como Jira o Linear.
- Formación y onboarding de perfiles PM/técnicos: el formato de contrato estricto (MoSCoW, criterios de aceptación testeables, C4) funciona como plantilla didáctica de buenas prácticas de especificación.
- Automatización en pipelines de CI/CD: dado que la salida es validable mecánicamente (`wrightproduct.contract.validate()`), puede integrarse en un pipeline que rechace especificaciones que incumplan el contrato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta una evaluación propia: el modelo se puntúa contra un conjunto congelado de 155 escenarios brief con una rúbrica de 13 criterios (calidad del PRD, diseño, trazabilidad, calibración, honestidad, orquestación de agentes). La línea base (Qwen3-30B-A3B con un prompt fuerte) obtiene **4,45 / 5** con **2.159 violaciones de contrato de tipo `TASK_NO_ASSIGNMENT`** en 155 documentos. Los números completos del modelo afinado se encuentran en `evals/reports/` del repositorio, pero no están incluidos en la model card.

## Requisitos de hardware

- VRAM estimada (según la propia model card): ~18 GB para la versión 4-bit y ~60 GB para bf16.
- GPU recomendadas: para bf16, una A100 u H100 de 80 GB (o 2x A100 de 40/48 GB); para 4-bit, una RTX 4090 o RTX 3090 de 24 GB es suficiente con holgura.
- Consumer GPUs: sí, la variante MLX 4-bit está pensada para Macs con Apple Silicon (se ejecuta con `mlx-lm` sobre memoria unificada); en NVIDIA, cualquier GPU de 24 GB ejecuta la cuantización a 4 bits.
- Opciones de despliegue: transformers con `device_map="auto"` (código de ejemplo en la model card), MLX / mlx-lm en Mac. No se mencionan explícitamente vLLM, llama.cpp, Ollama ni TGI, aunque al ser un modelo qwen3_moe con safetensors compatibles con endpoints, vLLM y TGI son candidatos razonables (no verificado).
- Latencia y throughput: no disponibles. Al ser MoE con ~3 B de parámetros activos, se espera una velocidad de generación comparable a un denso de 3 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| imgovind/wrightproduct-v0 | 30,5 B totales / ~3 B activos (MoE) | no disponible (base: 262 K) | Especializado en PRD + diseño + orquestación de agentes | Apache-2.0 |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (base) | 30,5 B totales / ~3 B activos | 262 K tokens | General, chat y razonamiento | Apache-2.0 |
| Qwen/Qwen3-30B-A3B-Thinking-2507 | 30,5 B totales / ~3 B activos | 262 K tokens | Razonamiento extendido (thinking mode) | Apache-2.0 |

La comparación relevante es con su propio modelo base: wrightproduct-v0 sacrifica generalidad a cambio de cumplimiento estricto del contrato de especificación (la base acumula 2.159 violaciones `TASK_NO_ASSIGNMENT` en el conjunto de evaluación propio). Frente a modelos generales de tamaño similar como Qwen3-32B (denso), la ventaja de la variante MoE es la eficiencia de inferencia con ~3 B activos.

## Limitaciones y advertencias

- Dominio acotado: entrenado para productos de software/SaaS; otros dominios están fuera del alcance de la versión v0 según la propia model card.
- No recupera hechos tecnológicos actuales: pregunta cuando faltan datos del brief, pero no sabe de novedades del ecosistema; conviene emparejarlo con RAG si se necesita asesoría de stack actualizada.
- Riesgo de alucinación: no se cuantifica en la model card; el fine-tune busca calibración (preguntar en vez de inventar métricas), pero al tratarse de una v0 con 539 descargas y sin comunidad de usuarios, no hay evidencia externa de su fiabilidad.
- Idiomas: no disponible en la ficha; el entrenamiento parece centrado en documentación técnica en inglés, por lo que el rendimiento en castellano no está verificado.
- Contexto: la model card no especifica la longitud de ventana; el ejemplo de uso genera hasta 8.000 tokens nuevos, lo que sugiere salidas largas pero no garantiza contextos de entrada muy extensos sin confirmar el valor heredado del base.
- Licencia: Apache-2.0, sin restricciones para uso comercial; los datos de entrenamiento usan licencias permisivas registradas por elemento.
- Proyecto individual de bajo uso (0 likes, 539 descargas): conviene validar la calidad de las salidas antes de usarlo en producción y revisar los informes en `evals/reports/`, que no están incluidos en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imgovind/wrightproduct-v0
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- mlx-lm (para ejecutar la copia MLX): https://github.com/ml-explore/mlx-lm
