# freeqaz/decomp-synth-lifter-v17-matched-qwen3.5-9b-lora

## Resumen

`decomp-synth-lifter-v17-matched-qwen3.5-9b-lora` es un adaptador LoRA (PEFT) que ajusta el modelo base Qwen/Qwen3.5-9B para la tarea especializada de **decompilación byte-exacta** de binarios C++ PowerPC, concretamente orientado a la reconstrucción de juegos de Xbox 360. Lo desarrolla freeqaz como parte del proyecto decomp-synth, un motor de búsqueda y síntesis de código C++ que verifica cada propuesta contra el compilador original y la herramienta de diff objdiff, nunca contra el propio modelo.

El adaptador se entrena exclusivamente con **trayectorias multi-turno de uso de herramientas** que terminaron en una coincidencia byte-exacta (1.064 filas), generadas por un agente profesor (GLM-5.3-flash) que conduce el toolchain real de compilación y diff. Es el brazo "matched" de un par experimental: su hermano v17-full entrena con todas las trayectorias admisibles (3.032 filas), incluidas las que no llegaron a coincidencia exacta. El objetivo es determinar si supervisar sobre trayectorias fallidas ayuda o perjudica.

Publicado como artefacto de investigación el 31 de agosto de 2026, **aún no ha sido evaluado**. El autor declara explícitamente que no hay números de rendimiento disponibles y que el adaptador v14-evalformat sigue siendo la opción medida para el bucle de retroalimentación multi-turno. Su relevancia radica en el enfoque metodológico: modelos que proponen, oráculos deterministas que disponen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (transformer decoder-only) + adaptador LoRA |
| Parametros totales | no disponible (el adaptador ocupa 0,4 GB; el base tiene 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 90.112 tokens (max_seq del entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bf16) |
| Idiomas soportados | no disponible (el base Qwen3.5-9B es multilingue, pero no se especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer decoder-only con arquitectura estándar. Sobre él se aplica un adaptador LoRA con r=32, α=64, dropout 0.05, aplicado a todas las capas lineales, en precisión bf16. El entrenamiento usa el chat template nativo de Qwen3.5 con el modo de razonamiento (thinking) activado y llamadas a herramientas en formato XML nativo, de modo que un parser de tools estándar de vLLM puede interpretar exactamente lo que el modelo fue entrenado a emitir.

El corpus de entrenamiento son 1.064 filas de trayectorias de tool-use multi-turno (hasta 8 turnos), extraídas de sesiones de un agente profesor (GLM-5.3-flash) que trabaja sobre objetivos de decompilación de un proyecto privado de reconstrucción de Halo: Combat Evolved Anniversary (Xbox 360). Cada trayectoria se convierte a filas de entrenamiento a granularidad de turno de herramienta, con separación holdout a nivel de unidad de traducción. El entrenamiento se realizó con 2 épocas, 68 pasos de optimización, batch efectivo 32, learning rate lineal y semilla 42. La pérdida de entrenamiento bajó de ~0,95 a 0,62 (mínimo 0,35), aunque el autor advierte que es una lectura de supervisión, no una afirmación de evaluación.

## Capacidades

- Decompilación byte-exacta de C++ PowerPC: reconstruye código fuente que, compilado con el compilador original y sus flags, reproduce el binario retail exactamente.
- Tool calling / function calling: entrenado para invocar herramientas de compilación y diff (el toolchain real del proyecto) en formato XML nativo.
- Razonamiento multi-turno con agente: capaz de leer desensamblado, proponer C++, compilar, analizar el diff de objdiff y reaccionar en turnos sucesivos.
- Modo thinking nativo: genera razonamiento intermedio en el canal `thinking` del chat template de Qwen3.5.
- Especialización en dominio: conocimiento específico de reconstrucción de binarios de juegos de Xbox 360 (PowerPC, C++).

## Casos de uso

- Reconstrucción de código fuente de juegos retro: el caso principal. El modelo propone reescrituras de C++ que se verifican contra el compilador original y objdiff, permitiendo reconstruir funciones de un binario retail de Xbox 360 byte a byte.
- Automatización de ingeniería inversa de firmware: puede integrarse en pipelines que necesiten generar código C++ equivalente a binarios PowerPC embebidos, siempre con verificación determinista externa.
- Preservación de software: útil para proyectos de conservación de videojuegos que buscan reconstrucciones exactas y reproducibles de títulos comerciales.
- Investigación en decompilación asistida por IA: sirve como artefacto de estudio para comparar estrategias de supervisión (matched vs full) en tareas de síntesis de código verificada por oráculo.
- Generación de código C++ con verificación por compilación: aunque no es su foco, el modelo puede proponer código que luego se valida con herramientas externas, reduciendo el riesgo de alucinación en el resultado final.
- Entrenamiento de agentes con tool-use en dominios especializados: el adaptador demuestra un patrón de entrenamiento con trayectorias de herramientas reales que puede replicarse en otros dominios de ingeniería inversa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el adaptador "aún no ha sido evaluado" y que no hay números de rendimiento. La única métrica reportada es la pérdida de entrenamiento (de ~0,95 a 0,62), que no constituye una evaluación de calidad.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB, pero requiere cargar el modelo base Qwen3.5-9B completo.
- VRAM estimada: al menos 18 GB para el modelo base en bf16 (sin cuantizar). Con cuantización del base (p. ej. 4 bits) podría reducirse a ~6-8 GB, aunque no se especifica compatibilidad.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100, o cualquier GPU con ≥18 GB de VRAM para inferencia en bf16.
- No cabe en GPUs de consumo de gama baja (p. ej. RTX 3060 12 GB) sin cuantizar el modelo base.
- Opciones de despliegue: vLLM (mencionado en la model card como el parser de tools de referencia), también puede usarse con transformers + PEFT. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Filas de entrenamiento | Pasos | Estado |
|---|---|---|---|---|
| v17-matched (este) | Qwen3.5-9B | 1.064 (solo matched) | 68 | Sin evaluar |
| v17-full | Qwen3.5-9B | 3.032 (todas admisibles) | 190 | Sin evaluar |
| v14-evalformat | Qwen3.5-9B | no disponible | no disponible | Evaluado, opción medida |
| v10 | Qwen3.6-27B | no disponible | no disponible | no disponible |

La comparación entre v17-matched y v17-full está confundida por el número de pasos de optimización (68 vs 190, ~2,8× menos en el matched), lo que mezcla "supervisión más limpia" con "menos optimización". No hay benchmarks que permitan una comparación cuantitativa. El autor recomienda v14-evalformat como la opción medida hasta que lleguen los resultados de la re-baseline multi-turno.

## Limitaciones y advertencias

- No evaluado: no hay ningún benchmark ni métrica de calidad publicada. No debe usarse en producción sin validación previa.
- Confound experimental: la comparación matched vs full está confundida por el número de pasos de optimización (68 vs 190). Cualquier diferencia de calidad entre ambos brazos mezcla dos variables.
- Semilla única: entrenado con una sola semilla (42). Cualquier veredicto sobre la estrategia matched es provisional bajo la regla multi-semilla del proyecto.
- Especialización extrema: entrenado exclusivamente para decompilación byte-exacta de PowerPC C++ (Xbox 360). No es un modelo de propósito general y su rendimiento fuera de ese dominio es desconocido.
- Dependencia del toolchain: el modelo está diseñado para usarse con las herramientas de compilación y diff del proyecto decomp-synth. Sin ellas, su utilidad práctica es limitada.
- Riesgo de alucinación: aunque el diseño "modelos proponen, oráculos disponen" mitiga el riesgo, el modelo puede generar código incorrecto que solo la verificación externa detecta.
- Sesgos: no se han documentado sesgos específicos, pero al entrenarse con datos de un único proyecto (Halo: Combat Evolved Anniversary), puede tener sesgos hacia ese estilo de código y esas convenciones.
- Licencia: apache-2.0, permite uso comercial, pero el modelo base Qwen3.5-9B también es apache-2.0, sin restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/freeqaz/decomp-synth-lifter-v17-matched-qwen3.5-9b-lora
- Hermano v17-full: https://huggingface.co/freeqaz/decomp-synth-lifter-v17-full-qwen3.5-9b-lora
- Versión v14-evalformat: https://huggingface.co/freeqaz/decomp-synth-lifter-v14-evalformat-qwen3.5-9b-lora
- Versión v10 (27B): https://huggingface.co/freeqaz/decomp-synth-lifter-v10-qwen3.6-27b-lora
- Repositorio GitHub del proyecto: https://github.com/freeqaz/decomp-synth
- Documentación del proyecto: https://github.com/freeqaz/decomp-synth/tree/main/docs
- Página del proyecto: https://freeqaz.com/projects/decomp-synth
- Blog: "How agent swarms decompile games byte-for-byte": https://www.freeqaz.com/blog/how-agent-swarms-decompile-games
- Blog: "LLM-assisted decompilation: tools, not prompts": https://www.freeqaz.com/blog/llm-assisted-decompilation
- Blog: "Forking the decompilation toolchain": https://www.freeqaz.com/blog/forking-the-decompilation-toolchain
- Blog: "Infrastructure for running agent swarms": https://www.freeqaz.com/blog/infrastructure-for-agent-swarms
