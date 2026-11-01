# lth0ms0n/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con codificador de visión, publicado por el equipo Qwen (Alibaba) como la primera variante de pesos abiertos de la serie Qwen3.6, sucesora de la familia Qwen3.5 lanzada en febrero. Se trata de un modelo de mezcla de expertos (MoE) de 35.000 millones de parámetros totales con solo 3.000 millones activos por token, lo que permite un equilibrio poco habitual entre capacidad y coste de inferencia. La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention) en un patrón híbrido de 40 capas, más un codificador de visión que habilita la entrada de imagen y texto.

El foco declarado de esta versión es la codificación agéntica: razonamiento a nivel de repositorio, flujos de trabajo de frontend y una nueva opción de "preservación del pensamiento" que retiene el contexto de razonamiento de mensajes históricos para reducir la sobrecarga en desarrollo iterativo. Con 262.144 tokens de contexto nativo, extensible hasta 1.010.000, y licencia Apache 2.0, se posiciona como una opción atractiva para pipelines de agentes de código y despliegues de producción con requisitos de contexto largo.

El repositorio de Hugging Face corresponde a una cuenta de usuario (`lth0ms0n`) que replica los pesos y la model card del modelo oficial de Qwen, con 71,9 GB de safetensors y compatibilidad declarada con Transformers, vLLM, SGLang y KTransformers. La relevancia actual radica en que ofrece rendimiento cercano a modelos densos mucho mayores en tareas de SWE-bench con una fracción del coste de cómputo por token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con MoE y codificador de visión |
| Parámetros totales | 35.951.822.704 (≈35,95 B) |
| Parámetros activos | ≈3 B por token (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; compatible con vLLM, SGLang, KTransformers) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers) |

Otros datos técnicos: dimensión oculta 2048; 40 capas con disposición 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)); embeddings de token de 248.320 (con padding); 256 expertos con dimensión intermedia de 512; Gated DeltaNet con 32 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 16 cabezas Q y 2 KV, dimensión de cabeza 256 y RoPE de 64; MTP (multi-token prediction) entrenado con múltiples pasos.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida poco convencional: de las 40 capas, 30 son de atención lineal Gated DeltaNet y 10 son de atención con compuertas (Gated Attention), intercaladas en un patrón de tres capas lineales por cada capa de atención completa, cada una seguida de un bloque MoE. Esta combinación busca reducir el coste cuadrático de la atención en contextos largos manteniendo la capacidad expresiva de la atención completa en puntos clave de la red. El MoE cuenta con 256 expertos de dimensión intermedia 512, de los que se activan 8 enrutados más 1 compartido por token, lo que explica que solo unos 3.000 millones de parámetros intervengan en cada paso.

El entrenamiento consta de fases de preentrenamiento y postentrenamiento, e incluye predicción multi-token (MTP) entrenada con múltiples pasos, técnica que puede aprovecharse para decodificación especulativa. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. La novedad funcional destacada es la "preservación del pensamiento": una opción que conserva el contexto de razonamiento de mensajes previos para flujos de desarrollo iterativos. El codificador de visión permite entrada image-text-to-text, aunque no se especifican los detalles del mismo.

## Capacidades

- Generación de texto y razonamiento general en modo conversacional.
- Codificación agéntica: razonamiento a nivel de repositorio, flujos de frontend y resolución de problemas de software (SWE-bench Verified 73,4; SWE-bench Multilingual 67,2; SWE-bench Pro 49,5).
- Ejecución de tareas en terminal y entornos de línea de comandos (Terminal-Bench 2.0 reportado en la model card).
- Entrada multimodal imagen-texto mediante codificador de visión (pipeline `image-text-to-text`).
- Preservación del pensamiento: retención del contexto de razonamiento histórico entre turnos.
- Predicción multi-token (MTP) entrenada con múltiples pasos, aprovechable para decodificación especulativa.
- Soporte de contextos muy largos: 262.144 tokens nativos, extensibles a 1.010.000.
- Compatibilidad con tool calling y function calling: no confirmada explícitamente en la información proporcionada, aunque la orientación agéntica del modelo y la compatibilidad con vLLM/SGLang lo hacen probable; no disponible como dato verificado.
- Capacidades multilingües: no disponibles como listado; SWE-bench Multilingual sugiere competencia en varios lenguajes de programación.

## Casos de uso

- Agente de codificación sobre repositorios: el modelo puede resolver issues y proponer parches con contexto de repositorio completo gracias a sus 262.144 tokens nativos y a su rendimiento de 73,4 en SWE-bench Verified, integrándose en flujos tipo GitHub Actions o CI/CD.
- Asistente de desarrollo iterativo con preservación del pensamiento: al retener el contexto de razonamiento entre mensajes, reduce la repetición de explicaciones en sesiones largas de depuración o refactorización.
- Automatización de terminal y operaciones: con resultados reportados en Terminal-Bench 2.0, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos shell.
- Generación de código frontend: la model card destaca mejoras específicas en flujos de frontend, útil para scaffolding de componentes, migraciones de frameworks y corrección de estilos en pipelines automatizados.
- Análisis de documentos técnicos con imágenes: gracias al codificador de visión y al contexto largo, puede procesar diagramas de arquitectura, capturas de errores o documentación escaneada junto con texto.
- Razonamiento multilingüe sobre código: su resultado de 67,2 en SWE-bench Multilingual lo hace apto para bases de código con múltiples lenguajes y equipos distribuidos.
- Despliegue en producción con coste contenido: al activar solo ~3 B de parámetros por token, es viable en infraestructura con GPUs de gama alta pero no exclusivas de centros de datos, usando vLLM o SGLang para servir con throughput alto.
- Procesamiento de contextos masivos: con extensión hasta 1.010.000 tokens, puede emplearse en análisis de monorepos, auditorías de código o revisión de especificaciones extensas.

## Benchmarks y rendimiento

Datos publicados en la model card (porcentajes de resolución de tareas):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

El dato de Terminal-Bench 2.0 aparece truncado en la información proporcionada, por lo que no se reproduce. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16, el repositorio ocupa 71,9 GB, por lo que se necesitan al menos ~72 GB de VRAM o memoria unificada para cargar el modelo sin cuantizar. Con cuantización de 8 bits se estima en torno a 36-40 GB; con 4 bits, en torno a 18-22 GB (estimaciones orientativas, no confirmadas en la información proporcionada).
- GPU recomendadas: para bf16, una H100 de 80 GB o dos A100 de 40 GB; para 8 bits, una A100 de 80 GB o RTX 6000 Ada; para 4 bits, una RTX 4090 de 24 GB o RTX 5090 podrían ser suficientes, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) solo con cuantización de 4 bits; no confirmado.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers, según la model card. No se menciona soporte explícito de llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles. La activación de solo ~3 B de parámetros por token y el uso de MTP sugieren un throughput superior al de un modelo denso de 35 B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35,95 B | ~3 B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | no disponible | ~3 B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27 B (denso) | 27 B | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31 B (denso) | 31 B | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26 B | ~4 B | no disponible | 17,4 | no disponible |

Qwen3.6-35B-A3B mejora a su predecesor Qwen3.5-35B-A3B en todas las métricas de codificación reportadas, pero queda por debajo del denso Qwen3.5-27B en SWE-bench Verified (73,4 frente a 75,0) y Multilingual (67,2 frente a 69,3), aunque lo supera en SWE-bench Pro (49,5 frente a 51,2, donde el 27B sigue por delante). Frente a Gemma4-31B, la ventaja es amplia en todas las métricas. Los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos, composición del dataset ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de código puede producir parches plausibles pero incorrectos, por lo que requiere verificación con tests.
- Idiomas soportados no documentados; el rendimiento fuera del inglés y de los lenguajes de programación evaluados es incierto.
- El contexto extendido hasta 1.010.000 tokens no está verificado de forma independiente y puede degradar la calidad en los extremos.
- El repositorio analizado pertenece a una cuenta de usuario (`lth0ms0n`) que replica el modelo oficial; conviene verificar la integridad de los pesos y preferir el repositorio oficial de Qwen para producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el enlace de licencia oficial referenciado en la model card.
- No se confirma explícitamente soporte de tool calling ni de function calling en la información disponible, pese a la orientación agéntica del modelo.
- El soporte multimodal se limita a entrada imagen-texto; no se documentan capacidades de audio o vídeo.
- La cuantización no está documentada oficialmente; los despliegues en GPU de consumo requerirán validación propia.

## Enlaces

- Hugging Face (repositorio analizado): https://huggingface.co/lth0ms0n/Qwen3.6-35B-A3B
- Repositorio oficial de referencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
