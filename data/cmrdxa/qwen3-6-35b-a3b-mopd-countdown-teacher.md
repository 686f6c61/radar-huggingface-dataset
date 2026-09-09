# cmRDXA/Qwen3.6-35B-A3B-MOPD-Countdown-Teacher

## Resumen

El modelo **Qwen3.6-35B-A3B-MOPD-Countdown-Teacher** es un checkpoint de profesor especializado en el puzzle aritmético **Countdown**, creado por el usuario `cmRDXA` como parte de una prueba de concepto de destilación multi-maestro on-policy (MOPD). Se obtiene mediante un fine-tuning del modelo base **Qwen/Qwen3.6-35B-A3B** usando *reinforcement learning* con recompensas de verificación estricta (GRPO) sobre 10.000 puzzles de Countdown de cuatro números. La arquitectura subyacente es una MoE (Mixture of Experts) multimodal, si bien este fine-tuning se aplicó solo a entrada de texto.

El propósito concreto es generar soluciones verificadas para la tarea aritmética y servir como maestro en el marco de destilación MOPD, complementándose con otro especialista en coloreado de grafos. En la evaluación mantenida, el modelo alcanza un **39,355%** de precisión exacta en Countdown frente al **9,863%** del modelo base sin modificar. El repositorio contiene los pesos en BF16 completos, el tokenizador, la configuración y los ficheros de preprocesamiento. Es un checkpoint de investigación, no un producto final de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (imagen y texto) basada en Qwen3.6; implementación `transformers` |
| Parametros totales | 35.505.251.456 (35.5 mil millones) |
| Parametros activos | ~3 mil millones (según nomenclatura A3B) |
| Longitud de contexto | no disponible; en la configuración de referencia de SGLang se usa `--context-length 2048` |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en BF16 sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), junto con tokenizador y configuración |

## Arquitectura y entrenamiento

El modelo parte de **Qwen3.6-35B-A3B**, una MoE multimodal con ~35.500 millones de parámetros totales y ~3.000 millones activos por token. Aunque la arquitectura del base permite procesar imágenes y texto, el proceso de entrenamiento de este checkpoint se limitó a puzzles de texto con salida corta: *thinking* deshabilitado, bloques de respuesta breves y tope de 256 tokens por respuesta.

El entrenamiento usó **GRPO** (Group Relative Policy Optimization) con recompensas de verificador exacto. Se realizaron **40 actualizaciones de optimizador** con una configuración de 32 prompts × 8 completions por actualización y una tasa de aprendizaje de `1e-6`. En la tarea Countdown se aplicó un verificador de expresiones aritméticas con aritmética racional exacta, sin sandbox ni ejecución de código generado por el modelo. Los dataset provienen de **Reasoning Gym** en una revisión fijada; se usaron 10.000 puzzles de entrenamiento por dominio, 512 de desarrollo y 1.024 de test mantenidos. No hubo RLHF, DPO ni destilación en este checkpoint; es el resultado de un ajuste fino con RL puro.

La evaluación se hizo con decodificación determinista (temperatura 0, `thinking` deshabilitado, máximo 256 tokens generados, truncando después de `</answer>`). Cada dominio de test contiene 1.024 puzzles distintos sin solapamiento entre divisiones.

## Capacidades

- Resolución de puzzles **Countdown** de cuatro números: el modelo genera expresiones con `+`, `-`, `*`, `/` y paréntesis que usan exactamente los números dados y las operaciones permitidas para alcanzar un objetivo.
- Razonamiento simbólico en dominios cerrados con verificación formal exacta.
- Generación de respuestas breves y estructuradas en bloques `<answer>...</answer>`, según el formato de entrenamiento.
- Aunque el base es multimodal, este checkpoint no ha sido validado para tareas de visión; su uso previsto es únicamente textual.
- No se han documentado capacidades específicas de *tool calling*, *function calling*, generación de código o comportamiento agéntico; se espera que herede lo poco que el base tenga en esos campos, pero no se ha evaluado.
- Soporte limitado al idioma inglés.
- Integración con el framework MOPD para actuar como maestro en destilación: puede proporcionar soluciones verificadas para entrenar a un estudiante.

## Casos de uso

- **Destilación multi-maestro (MOPD)**: el checkpoint actúa como uno de los profesores en la prueba de concepto de destilación on-policy. Se ejecuta el modelo para generar soluciones a puzzles de Countdown y se usan las respuestas verificadas como señal para entrenar a un modelo estudiante más pequeño o más generalista.
- **Generación de datos de entrenamiento verificados**: con un verificador exacto de aritmética racional, se pueden construir conjuntos de datos de alta confianza para tareas de razonamiento aritmético, eliminando respuestas incorrectas mediante validación externa.
- **Investigación en RL con recompensas verificables**: se puede utilizar como entorno de estudio para comparar la eficiencia de GRPO u otros algoritmos de RL en dominios con verificación exacta y sin ejecución de código.
- **Tutor de aritmética para ejercicios escolares**: dado un conjunto de cuatro números y un objetivo, el modelo puede proponer la expresión correcta. Las soluciones se validan automáticamente antes de mostrarse al estudiante, lo que lo hace útil en prototipos educativos.
- **Benchmark de razonamiento simbólico**: se emplea como referencia para comparar modelos en la tarea Countdown de cuatro números, usando el protocolo de evaluación descrito (1024 puzzles, decodificación determinista).
- **Comparación de especialistas en destilación**: junto con el teacher de Graph Coloring, permite analizar cómo se comporta un modelo especializado en un dominio frente a la tarea complementaria, y así calibrar la asignación de pesos en la destilación multi-maestro.

## Benchmarks y rendimiento

La evaluación mantenida reporta precisiones exactas sobre 1.024 puzzles de test por dominio, con decodificación determinista (temperatura 0, `thinking` deshabilitado, máximo 256 tokens):

| Modelo | Countdown (4 números) | Graph coloring (12 vértices) |
|---|---:|---:|
| Qwen3.6-35B-A3B (base) | 9,863% | 29,004% |
| **Qwen3.6-35B-A3B-MOPD-Countdown-Teacher** | **39,355%** | **25,586%** |

| Métrica de salida del teacher | Countdown | Graph coloring |
|---|---:|---:|
| Mediana de tokens generados | 20 | 82 |
| Percentil 95 de tokens generados | 27 | 82 |
| Tasa de truncamiento | 0,781% | 0,000% |

El `evaluation_results.json` incluye además resultados en el subconjunto de desarrollo y pruebas más duras (Countdown de cinco números, grafos de 16 vértices), pero esos datos no se proporcionan en la información disponible. El modelo supera al base en Countdown y cae ligeramente en Graph coloring, lo que es coherente con el entrenamiento enfocado a un solo dominio. No se han publicado resultados para benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en BF16 ocupan aproximadamente **71 GB**. Para servir con SGLang en una sola GPU (`--tp-size 1`) y con `--mem-fraction-static 0.8`, se recomienda una GPU con al menos **80 GB de VRAM**.
- **GPU recomendadas**: NVIDIA H100 80GB o A100 80GB. En GPUs de consumo como la RTX 4090 (24 GB) no es viable sin cuantización, y no se han publicado pesos cuantizados oficiales.
- **Opciones de despliegue**: SGLang con el parche MOPD (revisión `7fb0c7f8ecc32ed1b673d0ccc2051e15ed1bdbb3`) y Transformers 5.12.1. El modelo se sirve en una sola GPU; el rendimiento con otros frameworks (vLLM, TGI, llama.cpp) no se ha validado.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Countdown | Graph coloring | Licencia |
|---|---|---:|---:|---|
| Qwen3.6-35B-A3B (base) | 35,5B | 9,863% | 29,004% | Apache 2.0 |
| Qwen3.6-35B-A3B-MOPD-Countdown-Teacher | 35,5B | 39,355% | 25,586% | Apache 2.0 |
| Qwen3.6-35B-A3B-MOPD-Graph-Coloring-Teacher | 35,5B | no disponible | no disponible | Apache 2.0 |

Los tres modelos comparten el mismo tamaño y arquitectura base. El teacher de Countdown mejora notablemente respecto al base en su dominio especializado, mientras que el otro especialista de Graph Coloring es su contraparte en la destilación MOPD. La longitud de contexto máxima no está documentada para ninguno de ellos. No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~35B activos en 3B) en este contexto específico.

## Limitaciones y advertencias

- **Especialización estrecha**: el modelo solo ha sido evaluado en Countdown de cuatro números y Graph coloring de 12 vértices; no se ha probado su rendimiento en razonamiento general, matemáticas amplias ni multimodal.
- **Robustez no establecida**: se trata de un experimento pequeño con una sola semilla de entrenamiento y solo 40 actualizaciones de optimizador. No hay evidencia de estabilidad entre distintas semillas ni de generalización fuera del dominio de entrenamiento.
- **Riesgo de alucinación**: al ser un modelo entrenado para producir respuestas cortas y verificadas, sus respuestas fuera de estos dominios pueden contener errores. En la tarea principal la tasa de truncamiento es del 0,781%, pero en tareas más difíciles o desconocidas no se garantiza la validez.
- **Limitación de idioma**: solo se ha entrenado y evaluado en inglés. No se recomienda su uso para otros idiomas.
- **Capa multimodal no validada**: la arquitectura es multimodal, pero este checkpoint no ha sido evaluado para imagen ni audio. Su uso seguro es únicamente con entrada de texto.
- **Restricciones de producción**: es un checkpoint de profesor diseñado para destilación, no un modelo de propósito general. Su uso fuera del entorno de investigación requiere una evaluación exhaustiva.
- **Configuración de servidor específica**: la documentación advierte que la cualificación de puntuaciones se hizo con una configuración conservadora de SGLang; configuraciones alternativas de batching o *chunked prefill* pueden dar resultados discrepantes en este modelo híbrido.
- **Sesgos heredados**: no se han realizado evaluaciones de sesgo; puede heredar los sesgos del modelo base Qwen3.6-35B-A3B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmRDXA/Qwen3.6-35B-A3B-MOPD-Countdown-Teacher
- Teacher complementario de Graph Coloring: https://huggingface.co/cmRDXA/Qwen3.6-35B-A3B-MOPD-Graph-Coloring-Teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Pull request de Miles con la prueba de concepto MOPD: https://github.com/radixark/miles/pull/3116
- Ejemplo portable del MOPD: https://github.com/radixark/miles/blob/fa3783be15097c9565ccf4a90d5c32a3bb263bd2/examples/mopd_puzzles/README.md
- Patch de SGLang usado para servir el checkpoint: https://github.com/sgl-project/sglang/tree/7fb0c7f8ecc32ed1b673d0ccc2051e15ed1bdbb3
- Dataset Reasoning Gym (revisión fijada): https://github.com/open-thought/reasoning-gym/tree/49b07130b3fcd12f2d064bba7c43869543a0e7e7
