# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-iid30v11v

## Resumen

Este repositorio contiene un checkpoint experimental de aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario agurung en el contexto de una investigación sobre generación de código. Se trata de un punto de control (checkpoint) guardado en el paso global 4 de un entrenamiento con el algoritmo GRPO (Group Relative Policy Optimization) implementado en OpenRLHF, y se describe como el mejor checkpoint por la métrica pass@8 dentro de esa ejecución.

El modelo se entrena directamente sobre el modelo base, sin una etapa previa de SFT (supervised fine-tuning), aplicando RL con una señal de recompensa binaria basada en la corrección del código generado (1.0 si el programa pasa los tests del problema, 0.0 en caso contrario). El objetivo es explorar si el RL directo sobre un modelo instructivo puede mejorar la capacidad de resolver problemas de programación desafiantes, concretamente aquellos que el modelo base resuelve en muy pocas muestras (≤2 de 64). La relevancia de este checkpoint radica en su naturaleza experimental: es un artefacto de investigación para estudiar el impacto de distintas configuraciones de RL en tareas de código, no un modelo listo para producción.

Con 4.411.424.256 parámetros (aproximadamente 4,4 mil millones), el modelo mantiene la arquitectura de Qwen3-4B. No se dispone de información sobre la longitud de contexto, idiomas soportados ni licencia en la documentación proporcionada. El repositorio incluye los pesos en formato safetensors y es compatible con las librerías transformers y vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de RL basado en la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal. No se aplica ninguna modificación arquitectónica; el entrenamiento se realiza mediante fine-tuning con el algoritmo GRPO, que agrupa las respuestas generadas para cada prompt y normaliza las ventajas dentro del grupo, sin utilizar penalización KL en la recompensa. El proceso se ejecuta con OpenRLHF sobre un conjunto de problemas de programación denominado "cobalt-train ≤2/64 frontier", compuesto por 1833 problemas de entrenamiento y 112 de validación, seleccionados porque el modelo base los resolvía en como máximo 2 de 64 muestras bajo un escaneo de dificultad.

El entrenamiento incorpora dos mecanismos de regularización: una penalización por truncamiento (stop-properly penalty) que asigna recompensa -1.0 a las respuestas truncadas, y una penalización DAPO overlong que aplica una penalización aditiva de hasta -0.25 a las respuestas que se acercan al límite de tokens (últimos 1024 tokens antes del tope). Se generan 8 muestras por prompt, con un tamaño de lote de 128 tanto para rollout como para entrenamiento, un máximo de 4096 tokens nuevos por respuesta, 2 épocas y una tasa de aprendizaje del actor fija de 1e-6. No se detalla la composición exacta del dataset más allá de su origen en el frontier de dificultad.

## Capacidades

- Generación de código: el modelo está especializado en producir programas que superen tests unitarios, gracias a la señal de recompensa binaria basada en corrección de código.
- Razonamiento sobre problemas de programación: al entrenarse con RL sobre problemas difíciles, puede mejorar la capacidad de descomposición y solución de tareas algorítmicas.
- Generación de texto en lenguaje natural: al heredar las capacidades del modelo base Qwen3-4B-Instruct, conserva la capacidad de generar texto coherente, aunque no se ha evaluado específicamente.
- Soporte de tool calling / function calling: no se menciona en la documentación; probablemente no esté optimizado para ello.
- Soporte de agentes y multi-step reasoning: no hay evidencia en la información proporcionada.
- Capacidades multilingües: no se indica; el modelo base Qwen3-4B tiene soporte multilingüe, pero este checkpoint no ha sido evaluado en ese aspecto.
- Capacidades especiales: no se reportan modos de thinking, visión o audio.

## Casos de uso

- Investigación en RL para generación de código: este checkpoint sirve como punto de comparación para estudiar el efecto de GRPO sin SFT previo, la influencia de las penalizaciones por truncamiento y overlong, y la dinámica de aprendizaje en problemas de alta dificultad.
- Evaluación de métricas de rendimiento en code generation: al ser el mejor checkpoint por pass@8, puede utilizarse para medir la mejora relativa frente al modelo base y a otros checkpoints de la misma ejecución.
- Seeding para entrenamientos posteriores: el modelo puede usarse como punto de partida para continuar el entrenamiento con otras configuraciones de RL o para realizar fine-tuning adicional con SFT.
- Benchmarking de técnicas de RLHF/GRPO: investigadores pueden reproducir y comparar los resultados con otras implementaciones de algoritmos de optimización de políticas.
- Análisis de robustez en problemas de programación: permite estudiar cómo responde el modelo ante variaciones en los tests o en la formulación de los problemas.
- Prototipado de sistemas de generación de código asistida: aunque no es recomendable para producción, puede servir para validar conceptos en entornos controlados de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento, y solo se menciona que fue seleccionado como el mejor por pass@8 en la ejecución. No se proporcionan valores numéricos de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 8.8 GB, lo que sugiere que los pesos en FP16 ocupan aproximadamente esa cantidad. Para cargar el modelo en FP16 se necesitan al menos 10 GB de VRAM (considerando overhead). Con cuantización a 4 bits (no disponible oficialmente, pero posible mediante herramientas como GPTQ o AWQ), el consumo podría reducirse a unos 2.5-3 GB.
- GPU recomendadas: para FP16, una GPU con 12 GB o más (por ejemplo, RTX 3060 12GB, RTX 4070, A10, L4) es suficiente. Para cuantización 4-bit, una GPU de 6 GB (como RTX 2060 o RTX 3050) podría ser suficiente, aunque no hay garantías.
- Si cabe en consumer GPU: sí, en GPUs de gama media con al menos 8-10 GB de VRAM en FP16, y en GPUs de 6 GB con cuantización.
- Opciones de despliegue: se puede servir con vLLM usando el comando indicado en la model card (`vllm serve ...`), o mediante transformers con `AutoModelForCausalLM`. También es compatible con text-generation-inference (TGI) según las etiquetas del repositorio.
- Latencia y throughput: no se dispone de datos medidos. En una GPU como RTX 4090, un modelo de 4B en FP16 puede generar alrededor de 50-100 tokens por segundo, pero esto es una estimación general no verificada para este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos en la documentación proporcionada. El único punto de referencia razonable sería el modelo base `Qwen/Qwen3-4B-Instruct-2507`, pero no se ofrecen sus especificaciones detalladas ni resultados comparativos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Checkpoint experimental: no es un modelo final ni estable; fue guardado en un paso temprano del entrenamiento (paso 4) y su rendimiento puede ser inferior al de checkpoints posteriores.
- Sin licencia especificada: el repositorio no indica ninguna licencia, por lo que su uso comercial o redistribución es legalmente incierto. Se recomienda contactar al autor antes de cualquier uso.
- Sesgos y alucinaciones: hereda los sesgos del modelo base Qwen3-4B-Instruct, que pueden incluir prejuicios de género, raza o idioma. Además, al ser un modelo de generación de código, puede producir código incorrecto o con vulnerabilidades si no se valida adecuadamente.
- Limitaciones de contexto: no se especifica la longitud de contexto; el entrenamiento usa un máximo de 4096 tokens de generación, pero no se conoce el contexto de entrada soportado.
- Riesgo de sobreajuste al dataset de entrenamiento: el modelo se entrenó en un conjunto específico de problemas (cobalt-train frontier), por lo que puede no generalizar bien a otros dominios de programación.
- Sin garantías de rendimiento: no hay benchmarks publicados, por lo que no se puede afirmar una mejora objetiva frente al modelo base.
- Restricciones de producción: al ser un artefacto de investigación, no se recomienda su uso en entornos de producción sin una validación exhaustiva y sin considerar la ausencia de licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-iid30v11v
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Proyecto Weights & Biases (mencionado en la model card, sin URL directa): proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_iid30v11v`
