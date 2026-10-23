# BoboFang/DeepSeek-V4-Flash-0731-PTPC

## Resumen

DeepSeek-V4-Flash-0731 es la versión oficial final del modelo DeepSeek-V4-Flash de DeepSeek AI, que sustituye a la versión preview e incorpora mejoras sustanciales en capacidades agénticas (uso de herramientas, ejecución de tareas de código multi-paso y automatización). El repositorio analizado aquí, `BoboFang/DeepSeek-V4-Flash-0731-PTPC`, no es el checkpoint oficial, sino una redistribución de terceros cuantizada a 8 bits en formato w8a8_fp8, publicada con licencia MIT y un total real de 156.004.046.782 parámetros según los safetensors (166,9 GB de repositorio).

La relevancia del modelo radica en su relación entre parámetros activados y rendimiento: según la model card, supera a DeepSeek-V4-Pro (Preview) en todos los benchmarks publicados pese a activar una fracción mucho menor de parámetros, y se sitúa cerca de modelos propietarios de referencia en tareas de agente de terminal, generación de repositorios completos y ciberseguridad. El checkpoint incluye un módulo de decodificación especulativa (DSpark) acoplado, con la misma estructura que DeepSeek-V4-Flash-DSpark.

La arquitectura es de tipo transformer con mezcla de expertos (MoE), tal como se deduce del soporte de expert-parallel y del backend `deep_gemm_mega_moe` en las recetas de despliegue, y se distribuye únicamente en transformers/safetensors, sin plantilla Jinja de chat: la codificación de mensajes se realiza mediante scripts Python en la carpeta `encoding`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), arquitectura `deepseek_v4`; incluye módulo de decodificación especulativa DSpark |
| Parametros totales | 156.004.046.782 (156,0 B) |
| Parametros activos | No disponible (modelo MoE; la model card indica que el recuento de parámetros activados es muy inferior al total, pero no publica la cifra) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits w8a8_fp8 (este repositorio); otras cuantizaciones del modelo oficial no disponibles en la información proporcionada |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash-0731 es un modelo de lenguaje autorregresivo con arquitectura `deepseek_v4` y capas de mezcla de expertos, tal como evidencian los parámetros de despliegue del autor (`--enable-expert-parallel`, `--moe-backend deep_gemm_mega_moe`) y la referencia explícita a un recuento de parámetros activados muy inferior al total. El checkpoint incorpora de serie un módulo de decodificación especulativa denominado DSpark, con pesos de draft incluidos en el mismo checkpoint que el modelo objetivo; en vLLM se activa con `--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'` y en SGLang con `--speculative-algorithm DSPARK`, sin ruta separada de modelo draft.

El modelo se distribuye sin plantilla de chat en formato Jinja: la conversión de mensajes estilo OpenAI a cadenas de entrada y el parseo de la salida se realizan con los scripts de la carpeta `encoding` (`encode_messages`, `parse_message_from_completion_text`). El parámetro `reasoning_effort` admite tres niveles (`low`, `high`, `max`) que controlan la cantidad de deliberación antes de responder. No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre las etapas de alineación (RLHF, DPO u otras); la evaluación de las tareas de agente de código se realizó con el modo mínimo de DeepSeek Harness, esfuerzo de razonamiento `max`, `temperature = 1.0` y `top_p = 0.95`.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito y tres niveles de esfuerzo (`low`, `high`, `max`).
- Capacidades agénticas reforzadas: la versión 0731 se presenta como una actualización sustancial frente a la preview en tareas de agente (por ejemplo, DeepSWE pasa de 7,3 a 54,4 y Terminal Bench 2.1 de 61,8 a 82,7).
- Uso de herramientas y function calling: validado en Toolathlon-Verified (70,3) y soportado en las recetas de vLLM con el flag `features=tool_calling,reasoning`.
- Ingeniería de software y agentes de terminal: resolución de tareas en Terminal Bench 2.1 (82,7), generación de repositorios a partir de lenguaje natural en NL2Repo (54,2) y desarrollo full-stack en DSBench-FullStack (68,7).
- Ciberseguridad ofensiva/defensiva evaluada en Cybergym (76,7).
- Razonamiento multi-paso y automatización de flujos: Agents' Last Exam (25,2) y AutomationBench Public (25,1).
- Decodificación especulativa integrada (DSpark) para reducir latencia de generación.
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`) y con el ecosistema transformers.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Agentes de terminal y automatización de systèmes: el modelo está evaluado específicamente en Terminal Bench 2.1 (82,7) y puede operar como agente que ejecuta comandos, interpreta salidas y corrige errores en entornos de shell, adecuado para tareas de administración y DevOps reproducibles.
- Generación de repositorios completos a partir de especificaciones: con NL2Repo (54,2) y DSBench-FullStack (68,7), encaja en pipelines que reciben un requisito en lenguaje natural y producen estructura de proyecto, ficheros y pruebas.
- Refactorización y resolución de incidencias en producción: DeepSWE (54,4) mide tareas de ingeniería de software reales; el modelo puede integrarse en flujos de CI/CD para proponer parches que se validen automáticamente antes de fusionar.
- Orquestación de herramientas en asistentes corporativos: Toolathlon-Verified (70,3) y el soporte de function calling permiten encadenar APIs internas, consultas a bases de datos y acciones sobre CRM en conversaciones multi-turno, siempre que la ventana de contexto real se valide en despliegue (no publicada).
- Automatización de back office y procesos multi-paso: AutomationBench Public (25,1) sitúa al modelo por encima de GLM-5.2 (12,9) en esta familia de tareas, lo que lo hace apto para prototipos de agentes que rellenan formularios, cruzan sistemas y verifican estados.
- Análisis y auditoría de seguridad: Cybergym (76,7) sugiere utilidad en revisión de vulnerabilidades, triaje de hallazgos y generación de pruebas de concepto controladas en entornos de bug bounty o laboratorio.
- Razonamiento asistido con coste controlado: los niveles `low`, `high` y `max` de `reasoning_effort` permiten enrutar consultas simples a un modo económico y reservar el modo `max` para tareas de agente complejas, ajustando latencia y consumo de tokens.
- Despliegue en infraestructura propia con licencia MIT: al ser MIT, puede integrarse en productos comerciales internos sin obligaciones de copyleft, sujeto a revisión legal de las dependencias asociadas.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo oficial (DeepSeek-V4-Flash-0731). Las tareas de agente de código se evaluaron con el modo mínimo de DeepSeek Harness, `reasoning_effort = max`, `temperature = 1.0` y `top_p = 0.95`.

| Benchmark | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Flash (Preview) | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Opus-4.8 |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 82,7 | 61,8 | 72,1 | 81,0 | 85,0 |
| NL2Repo | 54,2 | 39,4 | 38,5 | 48,9 | 69,7 |
| Cybergym | 76,7 | 38,7 | 52,7 | no disponible | 83,1 |
| DeepSWE | 54,4 | 7,3 | 12,8 | 46,2 | 58,0 |
| Toolathlon-Verified | 70,3 | 49,7 | 55,9 | 59,9 | 76,2 |
| Agents' Last Exam | 25,2 | 15,8 | 16,5 | 23,8 | 25,7 |
| AutomationBench Public | 25,1 | 10,8 | 12,8 | 12,9 | 27,2 |
| DSBench-FullStack (interno) | 68,7 | 37,0 | 41,8 | 61,8 | 71,6 |
| DSBench-Hard (interno) | 59,6 | 25,8 | 31,1 | 54,5 | 71,7 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterías de conocimiento general para este modelo. Los valores de DSBench-FullStack y DSBench-Hard corresponden a conjuntos de test internos del autor, no reproducibles públicamente.

## Requisitos de hardware

- Peso de los pesos en este repositorio: 156,0 B de parámetros en 8 bits (w8a8_fp8) equivalen a aproximadamente 156 GB de pesos, coherente con los 166,9 GB del repositorio.
- VRAM estimada para inferencia: por encima de 160 GB solo para pesos; con caché KV en fp8 y margen para activaciones y buffers, un despliegue realista requiere del orden de 200-320 GB de VRAM agregada (estimación propia, no publicada por el autor).
- GPU recomendadas: la receta oficial de vLLM para este modelo se documenta sobre un nodo de 4×GB300; configuraciones equivalentes con 4×H100 80 GB o 8×H100 80 GB son razonables por capacidad de memoria, aunque no están validadas en la información disponible.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090 24 GB, RTX 5090 u otras); se necesitan al menos 3-4 aceleradores de 80 GB o el uso de cuantizaciones más agresivas no publicadas en este repositorio.
- Opciones de despliegue: vLLM con `--trust-remote-code --kv-cache-dtype fp8 --block-size 256 --data-parallel-size 4 --enable-expert-parallel --moe-backend deep_gemm_mega_moe --attention-config '{"use_fp4_indexer_cache": true}'` y decodificación especulativa DSpark con 7 tokens de draft y muestreo greedy; SGLang con `--speculative-algorithm DSPARK`. Compatible con transformers para inferencia básica.
- Latencia y throughput: no disponibles. La decodificación especulativa DSpark (7 tokens especulativos) está diseñada para reducir la latencia de decodificación, pero no se publican cifras de tokens por segundo ni de time-to-first-token.
- Almacenamiento: prever al menos 167 GB para el checkpoint y espacio adicional para caché de compilación y shards temporales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (este repo, 8-bit) | 156,0 B | No disponible (MoE) | No disponible | MIT | HuggingFace (redistribución de terceros) |
| DeepSeek-V4-Flash (Preview) | No disponible | No disponible | No disponible | No disponible | HuggingFace (deepseek-ai) |
| DeepSeek-V4-Pro (Preview) | No disponible | No disponible | No disponible | No disponible | HuggingFace (deepseek-ai) |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Opus-4.8 | No disponible | No disponible | No disponible | No disponible | No disponible (propietario) |

En términos de rendimiento, DeepSeek-V4-Flash-0731 supera a DeepSeek-V4-Pro (Preview) en las nueve pruebas publicadas y queda por debajo de Opus-4.8 en todas ellas salvo en Agents' Last Exam (25,2 frente a 25,7, prácticamente empatados). Frente a GLM-5.2, gana en Terminal Bench 2.1 (82,7 vs 81,0), NL2Repo (54,2 vs 48,9), DeepSWE (54,4 vs 46,2), Toolathlon-Verified (70,3 vs 59,9), Agents' Last Exam (25,2 vs 23,8), AutomationBench Public (25,1 vs 12,9), DSBench-FullStack (68,7 vs 61,8) y DSBench-Hard (59,6 vs 54,5); GLM-5.2 no reporta valor en Cybergym. No hay datos de benchmarks de conocimiento general que permitan comparar fuera del ámbito agéntico.

## Limitaciones y advertencias

- Redistribución de terceros: este repositorio lo publica el usuario BoboFang, no DeepSeek AI; con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de validación comunitaria de la integridad de los pesos cuantizados. Para producción se recomienda partir del checkpoint oficial y cuantizar internamente.
- Idiomas soportados no declarados: la model card no especifica cobertura lingüística, por lo que el rendimiento en castellano no está garantizado ni medido.
- Longitud de contexto no publicada: no es posible dimensionar la caché KV ni garantizar conversaciones de largo recorrido sin una prueba empírica previa.
- Riesgo de alucinación: no se documentan tasas de factualidad ni mecanismos de verificación; en tareas de código y ciberseguridad, los resultados deben validarse con ejecución real y sandboxing.
- Ausencia de plantilla de chat Jinja: requiere integrar los scripts de `encoding` y mantener sincronizado el formato de mensajes; un error de codificación degrada la calidad de forma silenciosa.
- Sesgos: no se publica información sobre composición del dataset ni sobre evaluaciones de sesgo, toxicidad o seguridad.
- Licencia MIT: permite uso comercial y modificación, pero se debe conservar el aviso de copyright; conviene revisar también las licencias de las dependencias de despliegue (vLLM, SGLang, kernels de DeepGEMM).
- Requisitos de hardware elevados: 156 GB de pesos en 8 bits impiden cualquier despliegue en GPU consumer y obligan a infraestructura multi-GPU con interconexión de alta velocidad.
- Los benchmarks DSBench-FullStack y DSBench-Hard son conjuntos internos del autor y no son reproducibles de forma independiente; el resto se midió con un framework de agente (DeepSeek Harness) que aún no se ha publicado, lo que limita la comparabilidad directa.
- Uso dual en ciberseguridad: la capacidad demostrada en Cybergym implica que el modelo puede generar contenido ofensivo; debe desplegarse con políticas de uso y registro de actividad.

## Enlaces

- Repositorio analizado: https://huggingface.co/BoboFang/DeepSeek-V4-Flash-0731-PTPC
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Modelo relacionado (DeepSeek-V4-Flash-DSpark): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-DSpark
- Organización DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial: https://www.deepseek.com/
- Chat oficial: https://chat.deepseek.com/
- Receta de despliegue en vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash?hardware=b300&features=tool_calling,reasoning
- Cookbook de SGLang para DeepSeek-V4: https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V4
- Cuenta de X/Twitter: https://twitter.com/deepseek_ai
