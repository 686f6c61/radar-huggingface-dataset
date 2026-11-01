# moeshawky/Nanbeige4.3-33B-FP8-safetensors

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de tipo transformer denso con 33.118.977.390 parámetros, desarrollado por Nanbeige como modelo "profesor" (teacher) de su familia Nanbeige4.3. Su propósito declarado es actuar como referencia de alta capacidad para destilar posteriormente habilidades agénticas en modelos más pequeños (por ejemplo, Nanbeige4.3-3B) y, al mismo tiempo, ofrecer una opción desplegable de forma inmediata en la clase de ~30B parámetros. El modelo se presenta como especializado en tareas de programación agéntica (agentic coding) y de trabajo profesional colaborativo (cowork), es decir, uso de herramientas, planificación multietapa y ejecución de tareas de oficina con contexto largo.

La ficha que nos ocupa, `moeshawky/Nanbeige4.3-33B-FP8-safetensors`, no es el modelo original de Nanbeige sino una republicación cuantizada a FP8 en formato safetensors, derivada del modelo base `Nanbeige/Nanbeige4.3-33B-Base`. El repositorio ocupa 33,1 GB y emplea la librería `transformers` con arquitectura declarada `llama`. Está etiquetado para generación de texto, conversación, text-generation-inference y es compatible con endpoints, con licencia Apache 2.0 e idiomas declarados inglés y chino.

La relevancia de esta versión FP8 radica en que reduce el peso en memoria frente a los pesos en precisión completa, manteniendo el formato safetensors y la compatibilidad con el ecosistema transformers/TGI. No obstante, la información publicada en el repositorio es mínima: no se detallan los parámetros de cuantización, la composición del dataset de entrenamiento ni el proceso de alineación, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `llama` en el repositorio); detalles internos no disponibles |
| Parámetros totales | 33.118.977.390 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (versión republicada); el modelo base admite otras cuantizaciones no especificadas |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |
| Modelo base | Nanbeige/Nanbeige4.3-33B-Base |
| Tamaño del repositorio | 33,1 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Compatibilidad | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El repositorio declara la arquitectura `llama`, lo que sitúa al modelo en la familia de transformers decoder-only con atención estándar, si bien no se publican detalles sobre número de capas, dimensiones ocultas, número de cabezas de atención ni mecanismos adicionales (atención lineal, decodificación especulativa, etc.). Tampoco se especifica si se trata de un modelo denso con alguna innovación de atención o de un híbrido; la información disponible solo permite afirmar que es un transformer denso de ~33B parámetros.

Respecto al entrenamiento, la model card original menciona que Nanbeige4.3-33B actúa como modelo profesor de la serie Nanbeige4.3 y que su rendimiento se evalúa con `preserve_thinking=true` en la plantilla de chat, lo que indica la existencia de un modo de razonamiento explícito (thinking). No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineación. La plantilla de chat es configurable mediante los parámetros `enable_thinking` (controla si el modelo razona antes de responder) y presumiblemente otros relacionados con el uso de herramientas, aunque el texto de la model card se interrumpe en ese punto.

## Capacidades

- Generación de texto conversacional multirretorno, con plantilla de chat configurable.
- Razonamiento explícito mediante modo thinking (`enable_thinking`, `preserve_thinking`), orientado a tareas que requieren cadenas de razonamiento largas.
- Programación agéntica: resolución de tareas de terminal, parcheo de repositorios, generación de código a partir de lenguaje natural y respuesta sobre bases de código.
- Uso de herramientas (tool calling / function calling), evidenciado por benchmarks como Toolathlon-Verified y Tau3-Bench.
- Planificación multietapa y ejecución de tareas de oficina (cowork): automatización de flujos, operaciones empresariales y tareas profesionales por ocupación.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo puede recibir el estado de un shell, ejecutar comandos y corregir errores en bucle, adecuado por sus resultados en Terminal-Bench 2.1 (80,9) y Terminal-Bench 4.0 (23,8).
- Resolución de incidencias en repositorios de código: con soporte de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para leer trazas, localizar el fallo y proponer parches, respaldado por SWE-Bench Pro (60,3) y DeepSWE (65,5).
- Generación de repositorios completos a partir de especificaciones: NL2Repo (53,0) indica capacidad para traducir lenguaje natural a estructuras de proyecto, útil en prototipado rápido y andamiaje de aplicaciones.
- Asistente de operaciones empresariales: EnterpriseOps-Gym (41,0) y Automation Bench (54,2) lo sitúan como candidato para automatizar flujos administrativos con herramientas internas.
- Agente de atención al cliente con acceso a herramientas: Tau3-Bench (48,8) y Toolathlon-Verified (70,4) respaldan su uso en diálogos multi-turno donde el modelo debe consultar APIs y mantener estado; la longitud de contexto no está publicada, por lo que debe validarse empíricamente.
- Planificación de proyectos y tareas de conocimiento: DeepPlanning (63,3) y JobBench (44,8) sugieren utilidad en descomposición de objetivos, estimación y coordinación de subtareas en entornos profesionales.
- Modelo profesor para destilación: su función declarada es servir de base para generar datos de alta calidad y destilar capacidades agénticas en modelos pequeños de la serie Nanbeige4.3.
- Evaluación comparativa interna: al estar disponible en FP8 y con licencia Apache 2.0, puede desplegarse como referencia en pruebas de calidad frente a modelos de ~30B en tareas de código y agentes.

## Benchmarks y rendimiento

Los datos proceden de la model card del modelo base y comparan Nanbeige4.3-33B con Qwen3.8-27B, Muse-Glimmer-30B y Gemma4-31B, todos evaluados con su máximo esfuerzo de razonamiento y los mismos hiperparámetros de inferencia.

| Categoría | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Agentic Coding | Terminal-Bench 2.1 | 80,9 | 73,0 | 61,8 | 47,2 |
| Agentic Coding | Terminal-Bench 4.0 | 23,8 | 6,3 | 1,6 | 0,0 |
| Agentic Coding | DeepSWE | 65,5 | 42,5 | 4,4 | 2,7 |
| Agentic Coding | SWE-Bench Pro | 60,3 | 61,7 | 36,9 | 51,2 |
| Agentic Coding | SWE-Atlas-QnA | 50,8 | 41,9 | 17,7 | 3,3 |
| Agentic Coding | NL2Repo | 53,0 | 48,3 | 27,4 | 33,8 |
| Agentic Coding | Scicode | 52,6 | 46,7 | 44,9 | 45,5 |
| Agentic Coding | SkillsBench | 61,1 | 56,4 | 39,7 | 28,9 |
| Agentic Cowork | Automation Bench | 54,2 | 38,3 | 15,2 | 9,7 |
| Agentic Cowork | JobBench | 44,8 | 34,5 | 16,6 | 9,0 |
| Agentic Cowork | GDPval | 84,8 | 86,4 | 75,8 | 71,4 |
| Agentic Cowork | Claw-Eval (pass^3) | 78,3 | 75,2 | 57,3 | 44,2 |
| Agentic Cowork | Toolathlon-Verified | 70,4 | 68,5 | 47,2 | 27,8 |
| Agentic Cowork | DeepPlanning | 63,3 | 49,2 | 21,4 | 19,4 |
| Agentic Cowork | EnterpriseOps-Gym | 41,0 | 40,2 | 30,5 | 27,3 |
| Agentic Cowork | YC-bench | 1.025.437 USD | 641.290 USD | 513.978 USD | 265.152 USD |
| Agentic Cowork | Tau3-Bench | 48,8 | 48,5 | 33,7 | 18,6 |
| Reasoning | GPQA Diamond | 89,5 | 89,2 | 83,5 | 91,3 |
| Reasoning | AIME 2026 | 95,2 | 94,5 | 94,7 | 89,2 |
| Reasoning | AA-LCR | 84,0 | 82,0 | 83,3 | 72,0 |

No se han publicado resultados específicos para la versión FP8 de `moeshawky`; los valores anteriores corresponden al modelo base Nanbeige4.3-33B. La cuantización FP8 puede introducir degradación no medida en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP8, el modelo requiere al menos ~33 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 40-48 GB de VRAM para contexto corto.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200, L40S 48 GB (ajustado) y GPUs con 48 GB o más para FP8 nativo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en FP8 sin offloading; requeriría cuantizaciones adicionales (INT8/INT4) no publicadas en este repositorio.
- Opciones de despliegue: transformers con safetensors, text-generation-inference (TGI) y endpoints compatibles; vLLM, llama.cpp u Ollama no están confirmados para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento destacado | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (esta versión FP8) | 33,1B | No disponible | Apache 2.0 | Líder en Terminal-Bench 2.1 (80,9), DeepSWE (65,5), Automation Bench (54,2) | HuggingFace, safetensors FP8 |
| Qwen3.8-27B | 27B (aprox.) | No disponible | No disponible | Mejor en SWE-Bench Pro (61,7) y GDPval (86,4) | No disponible en la información |
| Muse-Glimmer-30B | 30B (aprox.) | No disponible | No disponible | Rendimiento inferior en la mayoría de benchmarks agénticos | No disponible en la información |
| Gemma4-31B | 31B (aprox.) | No disponible | No disponible | Mejor en GPQA Diamond (91,3) | No disponible en la información |

Nanbeige4.3-33B domina en tareas agénticas de código y cowork, mientras que Qwen3.8-27B y Gemma4-31B son competitivos en razonamiento científico y evaluación profesional general. La licencia Apache 2.0 del modelo de Nanbeige facilita su uso comercial frente a alternativas cuya licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto: la longitud de contexto no está publicada, lo que impide garantizar conversaciones o repositorios de gran tamaño sin validación previa.
- Cuantización FP8: los benchmarks publicados corresponden al modelo base en precisión completa; la versión FP8 puede degradar ligeramente la calidad, especialmente en tareas de razonamiento largo.
- Alucinación: no se han publicado tasas de alucinación ni evaluaciones de fidelidad; en tareas de código y operaciones empresariales conviene validar las salidas con tests o reglas.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio es una republicación de terceros (`moeshawky`), no una versión oficial de Nanbeige; conviene verificar la integridad de los pesos antes de producción.
- Soporte: 46 descargas y 0 likes en el momento de la ficha; comunidad mínima y sin garantías de mantenimiento.
- Modo thinking: requiere configuración explícita de la plantilla de chat (`enable_thinking`, `preserve_thinking`); un uso incorrecto puede degradar la calidad o aumentar la latencia.
- Despliegue: no se confirma compatibilidad con vLLM, llama.cpp u Ollama para este repositorio FP8 concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/moeshawky/Nanbeige4.3-33B-FP8-safetensors
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Organización Nanbeige en HuggingFace: https://huggingface.co/Nanbeige
