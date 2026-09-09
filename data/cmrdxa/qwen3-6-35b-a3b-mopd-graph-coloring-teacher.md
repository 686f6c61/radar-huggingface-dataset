# cmRDXA/Qwen3.6-35B-A3B-MOPD-Graph-Coloring-Teacher

## Resumen

Modelo especializado en la resolución de puzzles de coloreo de grafos de tres colores con 12 vértices, creado por cmRDXA como parte de una prueba de concepto de destilación multi-teacher on-policy (MOPD) en el repositorio Miles. Es un fine-tuning del modelo Qwen3.6-35B-A3B de Qwen (35.5 mil millones de parámetros totales, arquitectura MoE híbrida y multimodal, aunque la evaluación se realizó solo con texto). Se entrenó con aprendizaje por refuerzo (GRPO) y recompensas de verificador estrictas, sin ejecución de código generado por el modelo.

Su papel es servir de profesor en un pipeline de destilación que transferirá conocimiento a un estudiante más pequeño, aportando soluciones verificadas a puzzles de coloreo de grafos y complementando a un especialista en Countdown. Es relevante porque demuestra cómo especializar un modelo en un dominio acotado mediante verificación simbólica y RL, pero su utilidad fuera de ese dominio es reducida: en la evaluación held-out alcanza un 87.402% de exactitud en coloreo de grafos, mientras que en Countdown de cuatro números cae al 8.789%, por debajo del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (basado en Qwen3.6-35B-A3B); no se documentan detalles internos |
| Parámetros totales | 35.505.251.456 (35.5B) |
| Parámetros activos | No disponible (la nomenclatura 35B-A3B sugiere 3B activos, pero no está confirmado en la documentación) |
| Longitud de contexto | No disponible (la model card usa context-length 2048 en el ejemplo de serving, pero no es el contexto nativo) |
| Tipos de cuantización | BF16 (pesos completos del checkpoint); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Inglés (en); el modelo base podría soportar más, pero no se especifica |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo, tokenizer y configuración) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del checkpoint Qwen/Qwen3.6-35B-A3B, que según las etiquetas de Hugging Face es un transformer MoE híbrido multimodal. El fine-tuning se realizó con el algoritmo GRPO, con 40 actualizaciones de optimizador, 32 prompts y 8 completions por actualización, y una tasa de aprendizaje de 1e-6. El entrenamiento usó 10.000 puzzles de coloreo de grafos de tres colores con 12 vértices y probabilidad de arista 0.2, generados a partir del repositorio Reasoning Gym en una revisión fijada.

Se desactivó el modo de pensamiento, se limitó la respuesta a 256 tokens y se exigió un formato estricto con un bloque `<answer>...</answer>` que contiene un objeto JSON que asigna un color (1, 2 o 3) a cada vértice. La recompensa se calcula mediante un verificador simbólico que valida que el JSON mapea todos los vértices y que ninguna arista tiene extremos del mismo color. No se usó sandbox ni se ejecutó código generado por el modelo. El resultado es un checkpoint profesor especializado, no un modelo de propósito general.

## Capacidades

- Resolución de puzzles de coloreo de grafos de tres colores con 12 vértices, generando un objeto JSON validado dentro de un bloque `<answer>...</answer>`.
- Salida en formato estricto sin razonamiento visible (thinking desactivado), con límite de 256 tokens.
- Puede servir como profesor en destilación multi-teacher on-policy, aportando soluciones correctas y verificadas a su dominio.
- Generación de texto en inglés, limitada al estilo de respuesta corta y directa.
- No implementa tool calling ni soporte de agentes.
- No se documentan capacidades de visión, audio ni generación de código.
- La arquitectura multimodal del modelo base no fue explotada: la evaluación y el entrenamiento usaron únicamente texto.

## Casos de uso

- Profesor en destilación multi-teacher on-policy (MOPD): el modelo actúa como especialista en coloreo de grafos dentro de un pipeline que alterna varios profesores para entrenar un estudiante. Se usa para proporcionar completions correctas y verificadas como datos de entrenamiento, aprovechando su exactitud del 87.402% en 12 vértices.
- Benchmarking de sistemas de verificación simbólica: al generar salidas JSON de problemas combinatorios discretos, el modelo sirve para probar validadores estrictos de RL que comprueban que cada arista tiene colores distintos, sin depender de sandbox.
- Investigación en RL con recompensas de verificador: es un ejemplo práctico de cómo un modelo de 35B puede especializarse en tareas discretas acotadas mediante GRPO y recompensas simbólicas. Útil para estudiar el equilibrio entre capacidad base y sobreajuste de dominio.
- Evaluación de opciones de despliegue en SGLang para modelos MoE híbridos: la model card documenta una configuración conservadora de serving (context-length 2048, tp-size 1, mem-fraction-static 0.8, chunked prefill desactivado) que reproduce los resultados de dominio. Sirve como caso real para probar comportamientos de batched y chunked prefill.
- Generación de datos de entrenamiento para grafos: el modelo genera instancias coloreadas de forma consistente (mapping JSON) para crear datasets de coloreo de grafos verificables, con aplicaciones en investigación de teoría de grafos o problemas de asignación de recursos.
- Comparación de robustez entre semillas de entrenamiento: al ser un checkpoint de una sola corrida, se puede utilizar como referencia para evaluar la variabilidad de la especialización y la sensibilidad de la destilación MOPD.
- Pruebas de truncamiento de respuestas en tareas largas: el modelo produce medianas de 101 tokens en su dominio y una tasa de truncamiento del 0.488%, lo que permite estudiar el comportamiento de modelos generativos con límites estrictos de longitud.

## Benchmarks y rendimiento

| Modelo | Countdown (4 números) | Graph coloring (12 vértices) |
|---|---:|---:|
| Qwen3.6-35B-A3B (base, sin modificar) | 9.863% | 29.004% |
| Este Graph Coloring teacher | 8.789% | 87.402% |

| Métrica | Countdown | Graph coloring |
|---|---:|---:|
| Mediana de tokens generados | 20 | 101 |
| Percentil 95 de tokens generados | 26 | 101 |
| Tasa de truncamiento | 0.098% | 0.488% |

La evaluación se realizó con decodificación determinista (temperature 0), thinking desactivado, máximo 256 tokens generados y parada tras `</answer>`, sobre 1.024 puzzles distintos por dominio. El fichero `evaluation_results.json` incluye también resultados de desarrollo y sondas más difíciles (5 números en Countdown, 16 vértices en grafos), no mostrados aquí.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan aproximadamente 71 GB, por lo que se necesita una GPU con al menos 80 GB de VRAM para inferencia sin cuantización.
- GPU recomendada: A100 80GB o H100 80GB. No cabe en GPU de consumo (RTX 4090, etc.) sin cuantización adicional no documentada.
- Opciones de despliegue documentadas: SGLang con el patch MOPD (revisión concreta) y Transformers 5.12.1. No se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La model card solo reporta tokens generados por dominio, no tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Accuracy graph coloring | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| Este Graph Coloring teacher | 35.5B | no disponible | 87.402% | Apache 2.0 | HuggingFace |
| Qwen3.6-35B-A3B (base) | 35.5B (según nombre) | no disponible | 29.004% | Apache 2.0 | HuggingFace |
| Countdown Teacher (hermano MOPD) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Sobreajuste de dominio: la exactitud en coloreo de grafos de 12 vértices es alta, pero en Countdown de 4 números cae al 8.789%, inferior al modelo base (9.863%), lo que indica que la especialización perjudica el rendimiento fuera del dominio.
- La model card advierte explícitamente que no se establecieron pruebas de robustez entre semillas de entrenamiento, rendimiento amplio de razonamiento ni calidad multimodal.
- El modelo no ejecuta código ni usa sandbox; solo genera JSON dentro de un formato estricto. No es un agente y no soporta tool calling.
- Riesgo de alucinación en problemas fuera del dominio: al no estar entrenado para grafos más grandes o puzzles diferentes, puede producir soluciones inválidas.
- Tasa de truncamiento del 0.488% en su dominio; en tareas no entrenadas podría ser mayor.
- La configuración de serving documentada es conservadora y fue verificada solo para puntuación. Otras configuraciones de SGLang (chunked prefill, caché radix, etc.) pueden producir discrepancias en los resultados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no está pensado para producción general.
- Idioma: solo inglés.

## Enlaces

- https://huggingface.co/cmRDXA/Qwen3.6-35B-A3B-MOPD-Graph-Coloring-Teacher
- https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- https://huggingface.co/cmRDXA/Qwen3.6-35B-A3B-MOPD-Countdown-Teacher
- https://github.com/radixark/miles/pull/3116
- https://github.com/radixark/miles/blob/fa3783be15097c9565ccf4a90d5c32a3bb263bd2/examples/mopd_puzzles/README.md
- https://github.com/open-thought/reasoning-gym/tree/49b07130b3fcd12f2d064bba7c43869543a0e7e7
- https://github.com/sgl-project/sglang/tree/7fb0c7f8ecc32ed1b673d0ccc2051e15ed1bdbb3
