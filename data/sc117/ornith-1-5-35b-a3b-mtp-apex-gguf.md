# SC117/Ornith-1.5-35B-A3B-MTP-APEX-GGUF

## Resumen
Ornith-1.5-35B-A3B-MTP-APEX-GGUF es una cuantización en formato GGUF del modelo Ornith-1.5-35B-A3B, desarrollado por el equipo de Ornith (ornith-ai). Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) construido sobre la arquitectura Qwen3.5, con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que lo sitúa en la categoría de modelos eficientes para inferencia con coste computacional reducido.

El modelo está orientado a tareas de codificación agéntica y razonamiento multi-paso. Según la model card, incorpora un bucle de auto-mejora que optimiza conjuntamente la generación de tareas, la construcción de scaffolds y las trayectorias de solución mediante aprendizaje por refuerzo. Esta versión concreta, publicada por el usuario SC117, añade la capa MTP (Multi-Token Prediction) de forma nativa, incluye un proyector de visión en BF16 (mmproj) para capacidades multimodales y se distribuye con licencia MIT.

La relevancia de esta ficha radica en que combina un modelo MoE de gran tamaño con cuantizaciones GGUF listas para llama.cpp, lo que permite desplegarlo en hardware de consumo o en servidores con una sola GPU, manteniendo capacidades de razonamiento, código y visión. El repositorio ocupa 82,7 GB y acumula 1341 descargas y 13 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Mixture of Experts), transformer con capa MTP |
| Parametros totales | 35B (según model card); el campo safetensors del repo indica 446.571.248, dato no coherente con la arquitectura declarada |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (APEX), BF16, mmproj BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF, safetensors (BF16) |
| Expertos | 256 expertos enrutados, 8 activos por token |
| Capas | 40 capas transformer + 1 capa MTP |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) heredada de Qwen3.5, con 256 expertos enrutados de los cuales 8 se activan por token, repartidos en 40 capas transformer más una capa MTP adicional. La capa MTP es nativa en esta versión (a diferencia de Ornith-1.0, donde requería injerto externo), lo que habilita decodificación especulativa multi-token y mejora el throughput de generación.

El entrenamiento, según la model card, se basa en un bucle de auto-mejora que extiende el de Ornith-1.0: además de optimizar scaffolds y rollouts, se optimiza conjuntamente la generación de tareas, la construcción de scaffolds y las trayectorias de solución, descubriendo estrategias efectivas y mejorando la política mediante aprendizaje por refuerzo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO más allá del bucle de RL descrito.

## Capacidades
- Generación de texto y razonamiento multi-paso, con etiqueta específica de "reasoning" en el repositorio.
- Codificación agéntica: resolución de tareas de ingeniería de software, parcheo de repositorios y navegación de terminal.
- Capacidades multimodales: incluye proyector de visión mmproj-BF16 para entrada de imagen junto a texto mediante llama.cpp.
- Soporte de tool calling y function calling, orientado a integración con MCP (Model Context Protocol).
- Razonamiento agéntico multi-turno y ejecución de planes con múltiples pasos.
- Decodificación especulativa nativa mediante la capa MTP.
- Capacidades multilingües: no disponibles en detalle; existe un benchmark SWE-bench Multilingual reportado.
- Modo de pensamiento (thinking) implícito en el enfoque de razonamiento del modelo.

## Casos de uso
- Automatización de resolución de incidencias en repositorios: el modelo puede recibir un issue y un checkout del código, navegar por el árbol de ficheros, ejecutar comandos en terminal y generar un parche verificable, apoyándose en su rendimiento reportado en SWE-bench Verified (79).
- Asistente de codificación en IDE con contexto de proyecto: gracias a su naturaleza MoE con ~3B activos, puede mantener sesiones interactivas de autocompletado y refactorización con coste de inferencia bajo en una sola GPU.
- Agente de CI/CD: integrado mediante tool calling, puede inspeccionar fallos de tests, proponer correcciones y abrir pull requests automáticamente en pipelines.
- Análisis de documentación técnica con imágenes: el proyector de visión permite procesar capturas de pantalla de errores, diagramas de arquitectura o figuras de papers junto con texto explicativo.
- Migración de código entre lenguajes o frameworks: su evaluación en SWE-bench Multilingual (71.4) lo hace adecuado para tareas de traducción de código entre ecosistemas.
- Generación de repositorios completos a partir de especificaciones en lenguaje natural: el benchmark NL2Repo (46.2) indica capacidad para crear estructuras de proyecto desde cero.
- Automatización de tareas de terminal y administración de sistemas: Terminal-Bench 2.1 (67.8) respalda su uso en entornos de shell y operaciones de línea de comandos.
- Orquestación de herramientas externas vía MCP: MCP-Atlas (70.2) sugiere buen desempeño en la coordinación de servidores y herramientas bajo el protocolo MCP.

## Benchmarks y rendimiento

| Benchmark | Ornith-1.5-35B-A3B |
|---|---|
| Terminal-Bench 2.1 | 67.8 |
| SWE-bench Verified | 79 |
| SWE-bench Pro | 59.6 |
| SWE-bench Multilingual | 71.4 |
| NL2Repo | 46.2 |
| MCP-Atlas | 70.2 |
| ClawEval | 72.5 |

La model card afirma que supera a Qwen3.6-35B en todos los benchmarks de codificación y agentes citados, aunque no se proporcionan los valores concretos de dicho modelo comparable en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; para un modelo MoE de 35B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 18-22 GB, y las de 8 bits en torno a 35-40 GB, aunque estos valores son estimaciones generales no confirmadas por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) podría alojar cuantizaciones de 4 bits; para BF16 se necesitarían GPUs de 80 GB como A100 o H100.
- Cabe en GPU de consumo: probablemente en RTX 4090 y GPUs con 24 GB o más para cuantizaciones agresivas; no confirmado.
- Opciones de despliegue: llama.cpp (formato GGUF y mmproj para visión), y por compatibilidad con GGUF también Ollama y otros runners basados en llama.cpp. El repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles. La capa MTP nativa está diseñada para mejorar la velocidad de decodificación mediante predicción multi-token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35B | ~3B | no disponible | MIT | Modelo de la ficha, orientado a codificación agéntica |
| Qwen3.6-35B | 35B (no confirmado) | no disponible | no disponible | no disponible | Citado en la model card como referencia superada en benchmarks de código |
| Ornith-1.0 | no disponible | no disponible | no disponible | no disponible | Versión anterior; requería injerto externo de MTP |

No se dispone de datos suficientes para comparar contexto, rendimiento detallado ni disponibilidad de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias
- Los sesgos conocidos del modelo no están documentados en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad factual.
- La longitud de contexto no está especificada, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Los idiomas soportados no están documentados; el rendimiento fuera del inglés y de los lenguajes cubiertos por SWE-bench Multilingual es incierto.
- La licencia MIT permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base por si hubiera condiciones adicionales.
- El campo de parámetros en safetensors (446.571.248) no coincide con los 35B declarados, lo que sugiere que el repositorio contiene fragmentos o metadatos parciales; verificar antes de confiar en ese dato.
- El repositorio es una cuantización de terceros (SC117), no la publicación oficial del equipo de Ornith; la calidad de la cuantización APEX no está avalada por el autor original.
- No se publican resultados de benchmarks para esta cuantización GGUF concreta; los valores reportados corresponden al modelo base en BF16.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/SC117/Ornith-1.5-35B-A3B-MTP-APEX-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Página del equipo Ornith: https://ornith.ai/ornith_1_5.html
- Documentación en chino: https://huggingface.co/SC117/Ornith-1.5-35B-A3B-MTP-APEX-GGUF/blob/main/README_zh.md
