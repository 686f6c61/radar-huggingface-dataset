# mlx-community/Qwopus3.8-27B-Coder-Flash-6bit

## Resumen

Qwopus3.8-27B-Coder-Flash es un ajuste fino orientado a programación sobre la familia Qwen3.8, desarrollado en el ecosistema Qwopus y publicado en formato MLX de 6 bits por el colectivo mlx-community. El modelo base es unsloth/Qwen3.8-27B, a su vez derivado de Qwen/Qwen3.8-27B, y está pensado para tareas de ingeniería de software: generación de código, razonamiento agéntico, uso de herramientas y ejecución eficiente de flujos de trabajo multi-paso.

La propuesta del autor ("filosofía Flash") prioriza que cada token genere trabajo útil: leer la petición, razonar, invocar herramientas, editar código, probar, recuperarse de errores y entregar el artefacto. Se entrenó con aproximadamente 200.000 ejemplos de código y razonamiento complejo, incluyendo unas 20.000 trayectorias de interacción agéntica destiladas de modelos profesor como Qwen3.8-Flash-Max, Qwen3.8-Max y DeepSeek-V4-Flash, además de datos de razonamiento lógico de la serie NVIDIA Nemotron.

Esta variante concreta es una cuantización de 6 bits en formato MLX, empaquetada con safetensors y compatible con la librería transformers, orientada a inferencia eficiente en hardware Apple Silicon. El repositorio ocupa 22,8 GB y el modelo declara 27.356.728.560 parámetros totales. La licencia es Apache-2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, tag `qwen3_5`); multimodal image-text-to-text |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (esta variante MLX); existe variante de 4 bits en mlx-community; el autor publica GGUF |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, 6-bit); el proyecto base distribuye también GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,36 mil millones de parámetros derivado de Qwen3.8-27B, con pipeline declarado `image-text-to-text`, lo que indica capacidades multimodales de entrada de imagen y texto. Los tags del repositorio incluyen `vision`, `multimodal` y `qwen3_5`, aunque la model card no detalla la arquitectura interna (número de capas, atención, tipo de positional encoding) ni la longitud de contexto nativa.

El ajuste fino se realizó sobre aproximadamente 200.000 ejemplos de código y razonamiento complejo, con tres componentes principales: unas 20.000 trayectorias de interacción agéntica y uso de herramientas destiladas principalmente de Qwen3.8-Flash-Max (selección y ejecución de herramientas, seguimiento de estado del entorno, recuperación de errores, autocorrección y planificación); tareas de algoritmia y generación de código con profesores Qwen3.8-Flash-Max, Qwen3.8-Max y DeepSeek-V4-Flash (implementación de algoritmos, corrección sintáctica, casos límite, refactorización y depuración); y datos de razonamiento lógico e instrucciones de alta calidad de la serie NVIDIA Nemotron. No se especifica en la información disponible si hubo RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de código y finalización de tareas de ingeniería de software: implementación de cambios concretos, manejo de casos límite, refactorización y depuración.
- Razonamiento complejo multi-paso, con énfasis en coherencia lógica y alineación entre razonamiento y código.
- Uso de herramientas (tool calling / function calling): selección de herramienta, interpretación de su salida, corrección de invocaciones y actualización del plan.
- Comportamiento agéntico: seguimiento del estado del entorno, recuperación de errores, autocorrección y entrega de artefactos finales.
- Capacidades multimodales de entrada (image-text-to-text), según el pipeline y los tags `vision` y `multimodal`.
- Soporte multilingüe limitado a inglés y chino según la metadata del modelo.
- Ejemplos visuales de "visual coding" documentados por el autor (modelado 3D de un pueblo costero y una pagoda de cinco pisos), sin datos cuantitativos asociados.

## Casos de uso

- Asistente de programación en IDE: el modelo puede recibir el contexto del fichero y la petición del desarrollador, proponer un parche concreto y razonar sobre casos límite, aprovechando su ajuste específico en generación de código y depuración.
- Agente de CI/CD con tool calling: integrado en un pipeline, puede invocar herramientas de compilación y test, interpretar la salida, corregir la invocación si falla y reintentar hasta entregar un artefacto probado, gracias a las ~20.000 trayectorias agénticas de entrenamiento.
- Refactorización y migración de código legacy: adecuado para tareas de reescritura estructurada y aplicación de instrucciones complejas, apoyándose en los datos de algoritmia y las tareas de refactorización del ajuste.
- Resolución de problemas algorítmicos y entrevistas técnicas: el modelo fue entrenado con tareas de algoritmia y razonamiento lógico, por lo que puede generar soluciones con explicación paso a paso.
- Automatización de revisión de código: puede analizar diffs, detectar errores sintácticos y de casos límite y proponer correcciones, combinando razonamiento e instrucciones estructuradas.
- Inferencia local en Apple Silicon: esta variante MLX de 6 bits (22,8 GB de repo) está pensada para ejecutarse en equipos Apple con memoria unificada suficiente, lo que permite flujos de asistencia de código sin depender de la nube.
- Procesamiento de capturas o diagramas junto a código: al ser image-text-to-text, puede recibir una imagen (por ejemplo, un diagrama o una captura de error) junto con la consulta de código.

## Benchmarks y rendimiento

La model card reporta un resultado local en MMLU-Pro: 93,87 % (1.408/1.500) sobre un subconjunto equilibrado de 500 preguntas de matemáticas, 500 de física y 500 de química, con protocolo zero-shot chain-of-thought. El autor advierte que es un resultado de subconjunto local y no el protocolo oficial de cinco disparos de MMLU-Pro. El resto de resultados se presenta en una imagen (`benchmark_summary.png`) sin cifras transcritas en el texto disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU-Pro (subconjunto local) | 93,87 % (1.408/1.500) | 500 matemáticas + 500 física + 500 química; zero-shot CoT; no comparable al protocolo oficial |
| Resto de benchmarks | no disponible en texto | Presentados solo como imagen en la model card |

El autor indica además que el throughput registrado se calcula como tokens generados divididos entre la suma de tiempos de decodificación de las peticiones, y no como throughput de reloj de la evaluación concurrente completa; no se ofrecen cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: esta variante de 6 bits ocupa 22,8 GB de repositorio, por lo que requiere en torno a 23-25 GB de memoria disponible para cargar los pesos, más overhead de contexto y KV cache.
- Al estar en formato MLX, está orientada a Apple Silicon con memoria unificada; se recomienda un equipo con al menos 32 GB de memoria unificada para trabajar con margen.
- GPU NVIDIA: no es el formato nativo de esta variante; para CUDA conviene usar el modelo base o las versiones GGUF publicadas por el autor.
- Cabe en GPUs de consumo de gama alta solo mediante cuantizaciones menores (existe una variante de 4 bits en mlx-community); la variante de 6 bits excede la VRAM de una RTX 4090 de 24 GB una vez añadido el contexto.
- Opciones de despliegue: MLX (formato nativo de esta variante), transformers; los tags indican compatibilidad con llama.cpp, GGUF y vLLM para las versiones correspondientes del proyecto.
- Latencia y throughput: no disponibles con cifras concretas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash (6-bit MLX) | 27,36 B | no disponible | Código, agentes, tool use | Apache-2.0 | Hugging Face (mlx-community) |
| Qwopus3.8-27B-Coder-Flash (4-bit MLX) | 27,36 B (base) | no disponible | Código, agentes, tool use | Apache-2.0 | Hugging Face (mlx-community) |
| unsloth/Qwen3.8-27B (base) | 27 B (aprox.) | no disponible | Modelo base generalista | no disponible en la información | Hugging Face (unsloth) |
| Qwen/Qwen3.8-27B (original) | 27 B (aprox.) | no disponible | Modelo base generalista | no disponible en la información | Hugging Face (Qwen) |

No se dispone de datos de benchmarks comparativos controlados frente a estas alternativas en la información proporcionada; el autor advierte explícitamente que las filas de su resumen visual no constituyen una clasificación controlada porque los conjuntos de test y ajustes difieren.

## Limitaciones y advertencias

- El resultado de MMLU-Pro es un subconjunto local no oficial (matemáticas, física y química, zero-shot CoT); no debe compararse directamente con puntuaciones del protocolo oficial de cinco disparos.
- La "filosofía Flash" de razonamiento compacto es un objetivo de diseño, no una reducción de tokens de razonamiento demostrada; la model card lo señala explícitamente.
- Idiomas declarados solo inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- No se documenta la longitud de contexto nativa, lo que dificulta planificar cargas de trabajo con ventanas largas.
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas de código donde una API inventada puede compilar pero fallar en ejecución; se recomienda validación con tests.
- El ajuste se basa en destilación de modelos profesor propietarios o de terceros; conviene revisar las condiciones de uso de esos datos si se emplea comercialmente, aunque la licencia declarada del modelo es Apache-2.0.
- Esta variante es una cuantización de 6 bits en MLX: puede presentar degradación frente a los pesos completos, especialmente en tareas de razonamiento numérico y código de precisión.
- El pipeline declarado es image-text-to-text, pero no se detalla la resolución de imagen soportada ni el rendimiento en tareas visuales.
- No hay información sobre sesgos específicos evaluados ni sobre filtros de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwopus3.8-27B-Coder-Flash-6bit
- Variante de 4 bits: https://huggingface.co/mlx-community/Qwopus3.8-27B-Coder-Flash-4bit
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF del autor: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF
- Ficha en llm-explorer: https://llm-explorer.com/model/mlx-community%2FQwopus3.8-27B-Coder-Flash-6bit,3VL4c0ddskzSs4ypi9hm0P
- Unsloth: https://unsloth.ai/
