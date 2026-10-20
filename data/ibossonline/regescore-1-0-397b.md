# iBossonline/RegesCore-1.0-397B

## Resumen

RegesCore-1.0-397B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 396.802.360.816 parámetros totales (unos 396,8 mil millones) publicado en HuggingFace por el usuario iBossonline bajo licencia MIT. La etiqueta de arquitectura del repositorio es `qwen3_5_moe`, y la model card incluida corresponde literalmente a **Ornith-1.0-397B** de deepreinforce-ai, del que este repositorio parece ser una re-subida o espejo renombrado. Según esa model card, el modelo se ha post-entrenado sobre Qwen 3.5 y Gemma 4 y está especializado en *agentic coding*: resolución autónoma de tareas de ingeniería de software, uso de terminal y generación de repositorios completos.

El interés del modelo reside en su enfoque de entrenamiento: un marco de auto-mejora basado en RL que optimiza conjuntamente el *scaffold* (la estructura de razonamiento y las llamadas a herramientas) y las soluciones generadas, en lugar de limitarse a optimizar las soluciones. Según los datos de la model card, esto le permite alcanzar 77,5 en Terminal-Bench 2.1 (Terminus-2) y 82,4 en SWE-bench Verified, por encima de Qwen3.5-397B y cerca de Claude Opus 4.8 en la tarea de Claude Code.

El repositorio incluye la etiqueta `image-text-to-text`, lo que indica capacidad de entrada multimodal (imagen y texto), aunque la model card no detalla el encoder visual ni la resolución admitida. El tamaño del repositorio, 793,6 GB, es coherente con pesos en safetensors a precisión BF16 (unos 2 bytes por parámetro). No hay información publicada sobre longitud de contexto, idiomas soportados, cuantizaciones disponibles ni parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (etiqueta `qwen3_5_moe`; post-entrenado sobre Qwen 3.5 y Gemma 4 según la model card) |
| Parametros totales | 396.802.360.816 (~396,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; el tamaño de 793,6 GB sugiere BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modalidad | texto e imagen-texto (`image-text-to-text`, `text-generation`) |
| Tamano del repositorio | 793,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-20 |
| Compatibilidad | `endpoints_compatible`, `region:us` |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts, heredada del linaje Qwen 3.5 según la etiqueta del repositorio y la propia model card. El post-entrenamiento se realizó, según el autor original, sobre los modelos base Gemma 4 y Qwen 3.5, dando lugar a una familia con variantes densas de 9B y 31B y MoE de 35B y 397B. No se especifican el número de tokens de entrenamiento, la composición del dataset, la ratio de expertos activos por token, ni si se aplicaron fases de RLHF o DPO convencionales.

La innovación declarada es un marco de auto-mejora con aprendizaje por refuerzo en el que el modelo aprende a generar no solo *rollouts* de solución, sino también el *scaffold* que guía esos rollouts. Al optimizar conjuntamente ambas partes, el modelo descubre trayectorias de búsqueda mejores y produce soluciones de mayor calidad en tareas de agente. Este tipo de entrenamiento está orientado específicamente a entornos con herramientas (terminal, edición de ficheros, ejecución de tests) más que a respuesta conversacional pura. La model card menciona además decodificación sobre el par base Qwen 3.5 / Gemma 4, pero no detalla innovaciones de atención, decodificación especulativa ni esquemas de atención lineal.

## Capacidades

- Generación de texto y conversación multiturno (`text-generation`, `conversational`).
- Razonamiento agéntico para tareas de ingeniería de software: resolución de incidencias, parcheo de repositorios y ejecución de comandos en terminal.
- Uso de terminal y herramientas de línea de comandos, evidenciado por su evaluación en Terminal-Bench 2.1 con los arneses Terminus-2 y Claude Code.
- Generación y modificación de repositorios completos a partir de descripciones en lenguaje natural (evaluado en NL2Repo según la model card).
- Entrada multimodal imagen-texto, según la etiqueta `image-text-to-text` del repositorio; no se detallan resolución, OCR ni tareas visuales concretas.
- Capacidad de generar su propio *scaffold* de razonamiento y búsqueda como parte del entrenamiento auto-mejorable.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque el uso de terminal implica algún mecanismo de invocación de herramientas.
- Capacidades multilingües: no disponibles; no se lista ningún idioma.

## Casos de uso

- **Resolución automática de incidencias en repositorios**: el modelo puede recibir un *issue* y el árbol del proyecto, localizar los ficheros afectados, aplicar un parche y validarlo ejecutando la suite de tests en terminal, aprovechando su entrenamiento específico en SWE-bench Verified (82,4).
- **Agente de CI/CD para reparación de builds**: integrado en un pipeline, puede leer los logs de un *build* fallido, reproducir el error en un entorno aislado y proponer un *commit* de corrección, gracias a su capacidad de operar sobre terminal y de encadenar varios pasos de razonamiento.
- **Migración y refactorización de código a gran escala**: tareas como actualizar una dependencia mayor o migrar entre frameworks, donde el modelo puede planificar el cambio, ejecutarlo por módulos y verificar cada paso con compilación y tests.
- **Generación de repositorios desde especificación**: a partir de un documento de requisitos, producir el esqueleto del proyecto, los ficheros de configuración y los tests iniciales, caso alineado con la evaluación NL2Repo citada en la model card.
- **Automatización de tareas de administración de sistemas**: diagnóstico de fallos en servidores a partir de la salida de comandos, revisión de configuraciones y propuesta de *scripts* de remediación, siempre con aprobación humana dado el riesgo de ejecución.
- **Asistente técnico sobre capturas y diagramas**: gracias a la modalidad imagen-texto, interpretar diagramas de arquitectura, capturas de errores o trazas en pantalla y traducirlos a acciones de código.
- **Evaluación de agentes y *benchmarking* interno**: usar el modelo como referencia en un *harness* propio de Terminal-Bench o SWE-bench para comparar el rendimiento de agentes internos frente a un modelo abierto de esta categoría.

## Benchmarks y rendimiento

Datos extraídos de la model card incluida en el repositorio (tabla parcialmente truncada en el material disponible). La columna del modelo corresponde a Ornith-1.0-397B, del que este repositorio es espejo.

| Benchmark | RegesCore-1.0-397B | Qwen3.5-397B | Qwen3.7-Max | GLM-5.2-744B | Minimax-M3-428B | DeepSeek-V4-Pro-1.6T | Claude Opus 4.7 | Claude Opus 4.8 |
|---|---|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 77,5 | 53,5 | 73,5 | 81,0 | 64 | 64 | 70,3 | 85 |
| Terminal-Bench 2.1 (Claude Code) | 78,2 | 48,6 | 69,8 | 82,7 | no disponible | 66,5 | 69,7 | 78,9 |
| SWE-bench Verified | 82,4 | 76,4 | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) |
| NL2Repo | no disponible (citado sin cifra) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| OpenClaw | no disponible (citado sin cifra) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo a partir de los 396,8 B de parámetros, sin contar caché KV): BF16 ≈ 794 GB; FP8 ≈ 397 GB; INT4 ≈ 198 GB.
- **GPU recomendadas**: para BF16 se necesitan al menos 8× H200 (141 GB) o 12–16× H100 80 GB; para FP8, 8× H100 80 GB resulta suficiente en pesos, con margen limitado para caché KV; para INT4, 4× H100 80 GB o 3× H200.
- **Consumer GPU**: no cabe en ninguna GPU de consumo. Ni siquiera en INT4 (≈198 GB) entraría en una RTX 4090 (24 GB) o RTX 5090 (32 GB); haría falta un clúster de 8–10 tarjetas de 24 GB, inviable por ancho de banda.
- **Opciones de despliegue**: vLLM o SGLang para servir en FP8/BF16 con paralelismo tensorial; TGI como alternativa. llama.cpp/Ollama solo serían viables si se publicara una conversión GGUF, que no está disponible en el repositorio.
- **Latencia y throughput**: no disponibles. Al ser MoE, el throughput dependerá críticamente del número de parámetros activos, dato que no se ha publicado.
- **Almacenamiento**: el repositorio ocupa 793,6 GB, por lo que se requiere espacio en disco equivalente o superior para la descarga y el *sharding*.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 (CC) | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RegesCore-1.0-397B (Ornith-1.0-397B) | 396,8 B (MoE) | no disponible | 78,2 | 82,4 | MIT | Pesos abiertos en HF |
| Qwen3.5-397B | 397 B (MoE estimado por nombre) | no disponible | 48,6 | 76,4 | no disponible | Pesos abiertos |
| GLM-5.2-744B | 744 B | no disponible | 82,7 | no disponible | no disponible | Pesos abiertos |
| Minimax-M3-428B | 428 B | no disponible | no disponible | no disponible | no disponible | Pesos abiertos |
| DeepSeek-V4-Pro-1.6T | 1,6 T | no disponible | 66,5 | no disponible | no disponible | Pesos abiertos |
| Claude Opus 4.8 | no disponible | no disponible | 78,9 | no disponible | propietaria | Solo API |

Frente a Qwen3.5-397B, del mismo orden de parámetros, el modelo declara una ventaja de casi 30 puntos en Terminal-Bench 2.1 con Claude Code (78,2 frente a 48,6) y de 6 puntos en SWE-bench Verified (82,4 frente a 76,4). GLM-5.2-744B, con casi el doble de parámetros, supera al modelo en Terminal-Bench (82,7 frente a 78,2), mientras que Claude Opus 4.8 queda ligeramente por encima (78,9) en esa misma prueba.

## Limitaciones y advertencias

- **Discrepancia de identidad**: el repositorio se llama `iBossonline/RegesCore-1.0-397B`, pero la model card es la de `deepreinforce-ai/Ornith-1.0-397B`. No hay confirmación de que los pesos sean idénticos al original; conviene verificar los hashes antes de usarlo en producción.
- **Cero tracción verificable**: 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por parte de la comunidad.
- **Datos ausentes críticos**: no se publican longitud de contexto, idiomas, parámetros activos, cuantizaciones ni detalles del dataset de entrenamiento, lo que impide dimensionar correctamente el despliegue.
- **Contradicción en la model card**: el texto describe el modelo de 397B como "el miembro ligero de la familia, diseñado para despliegue eficiente en una sola GPU", afirmación incompatible con los 793,6 GB de pesos; probablemente sea un error de copia desde la ficha del modelo de 35B.
- **Riesgo de alucinación en código**: como todo modelo de este tipo, puede generar APIs inexistentes, imports inválidos o parches que compilan pero no resuelven el problema; exige ejecución de tests y revisión humana en cualquier flujo automatizado.
- **Sesgos**: no se documenta ninguna evaluación de sesgo, toxicidad o robustez, ni la composición del corpus de entrenamiento.
- **Licencia**: MIT permite uso comercial y modificación, pero el `license_link` apunta al fichero LICENSE del repositorio de deepreinforce-ai, no al de este repositorio, por lo que la cadena de licencia debería confirmarse.
- **Coste de inferencia**: al no publicarse los parámetros activos, no puede estimarse el coste real por token; el tamaño en disco y en VRAM limita el despliegue a clústeres multi-GPU.
- **Resultados de benchmark no reproducidos de forma independiente**: todas las cifras proceden de la model card del autor original y la tabla está truncada, por lo que faltan columnas completas de SWE-bench Verified y de los benchmarks NL2Repo y OpenClaw.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/iBossonline/RegesCore-1.0-397B
- Repositorio original referenciado en la model card: https://huggingface.co/deepreinforce-ai/Ornith-1.0-397B
- Fichero de licencia referenciado: https://huggingface.co/deepreinforce-ai/Ornith-1.0-397B/blob/main/LICENSE
- Blog de Ornith: https://deep-reinforce.com/ornith.html

No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, demos o repositorios de código) asociados a este modelo.
