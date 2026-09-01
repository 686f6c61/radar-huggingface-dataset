# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base-tf

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario agurung. Se trata de un experimento de investigación centrado en la generación de código, donde se aplica el algoritmo GRPO (Group Relative Policy Optimization) directamente sobre el modelo base, sin una fase previa de fine-tuning supervisado (SFT). El objetivo es mejorar la capacidad del modelo para resolver problemas de programación que el modelo base no resuelve de forma fiable.

El checkpoint se guardó en el paso global 8 de la ejecución de RL y se seleccionó como el mejor según la métrica pass@8. El entrenamiento se realizó sobre un conjunto de problemas de código "frontera" (cobalt-train ≤2/64), es decir, problemas que el modelo base resuelve en como máximo 2 de 64 muestras. La señal de recompensa es binaria: 1.0 si el programa generado pasa todos los tests del problema, 0.0 en caso contrario. El modelo tiene 4.411 millones de parámetros y está disponible en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-4B) |
| Parametros totales | 4.411.424.256 (4,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-4B-Instruct-2507, un transformer causal con atención estándar. Sobre esta base se aplicó un entrenamiento de RL con el framework OpenRLHF, utilizando el algoritmo GRPO con ventajas normalizadas por grupo y sin penalización KL. La receta incluye dos mecanismos de regularización: una penalización "stop-properly" que asigna recompensa -1.0 a las respuestas truncadas, y una penalización DAPO por sobrelongitud que se incrementa hasta -0.25 en los últimos 1024 tokens antes del límite.

El entrenamiento usó 8 muestras por prompt, un tamaño de lote de rollout y de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje constante de 1e-06. El conjunto de datos de entrenamiento consta de 1833 problemas y 112 problemas de validación, todos ellos pertenecientes al "frontier" de dificultad del conjunto cobalt-train. La recompensa se calcula ejecutando el código generado contra los tests del problema.

## Capacidades

- Generación de código: el modelo está especializado en producir programas que superan tests unitarios, gracias al entrenamiento con recompensa binaria de corrección.
- Razonamiento paso a paso: al ser un modelo de instrucción base, conserva la capacidad de generar cadenas de razonamiento antes de emitir la solución.
- Resolución de problemas de programación: entrenado específicamente en problemas que el modelo base no resuelve de forma fiable, lo que sugiere una mejora en tareas de dificultad media-alta.
- Soporte de tool calling: no se menciona explícitamente, pero al derivar de Qwen3-4B-Instruct podría heredar capacidades básicas de llamada a funciones (no confirmado).
- Multilingüismo: no hay información disponible sobre los idiomas soportados.

## Casos de uso

- Evaluación de técnicas de RL para código: este checkpoint es útil para investigadores que estudian el impacto de GRPO sin SFT previo sobre la capacidad de generación de código de un modelo base.
- Benchmark de generación de código: puede emplearse como referencia para comparar estrategias de recompensa, penalizaciones de truncamiento o configuraciones de hiperparámetros en entornos de RL.
- Generación de soluciones a problemas de programación competitiva: dado su entrenamiento en el frontier de dificultad, puede proponer soluciones a problemas que el modelo base falla sistemáticamente.
- Análisis de robustez ante truncamiento: las penalizaciones específicas permiten estudiar cómo afecta el límite de tokens a la calidad de las respuestas.
- Base para fine-tuning posterior: al ser un checkpoint intermedio, puede servir como punto de partida para experimentos de SFT o RL adicionales.
- Despliegue en entornos de investigación: su tamaño de 4,4B permite ejecutarlo en GPUs de consumo con cuantización, facilitando la reproducibilidad de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento. La única métrica mencionada es pass@8, que fue el criterio para seleccionar este checkpoint como el mejor de la ejecución, pero no se proporciona su valor numérico.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, el modelo ocupa aproximadamente 8,8 GB, por lo que cabría en una GPU con 12 GB o más. Con cuantización int8 (~4,4 GB) o int4 (~2,2 GB) podría ejecutarse en GPUs con 6 GB o menos.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 12 GB de VRAM para fp16 sin cuantizar.
- Compatibilidad con GPUs de consumo: sí, es viable en tarjetas como RTX 3060 (12 GB) o superiores con cuantización.
- Opciones de despliegue: vLLM (mencionado en la model card), transformers con `AutoModelForCausalLM`, y potencialmente llama.cpp u Ollama si se generan pesos GGUF.
- Latencia y throughput: no se proporcionan datos específicos; dependerá del hardware y de la configuración de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,4B | No especificado | Instruct general | Apache 2.0 (según Qwen) |
| Este checkpoint (RL) | 4,4B | No especificado | RL para código | No disponible |
| Otros checkpoints RL de código (p.ej. DeepSeek-Coder-V2-Lite-Instruct) | 2,4B | 128K | Instruct + RL | MIT |

No se dispone de datos de rendimiento comparativos fiables, ya que este checkpoint no publica benchmarks. La comparación se limita a características arquitectónicas y de entrenamiento.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un checkpoint de RL sin SFT, puede generar código sintácticamente válido pero incorrecto, o alucinar APIs y funciones inexistentes.
- Riesgo de sobreajuste al conjunto de entrenamiento: el entrenamiento se realizó sobre un subconjunto específico de problemas (cobalt-train frontier), por lo que su generalización a otros dominios de código no está garantizada.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al derivar de Qwen3-4B-Instruct-2507, probablemente herede el límite del modelo base (típicamente 32K tokens en la serie Qwen3, aunque no confirmado).
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si es apto para uso comercial o requiere atribución.
- Estado experimental: es un checkpoint intermedio de una ejecución de RL, no un modelo final pulido; puede presentar comportamientos erráticos fuera de su dominio de entrenamiento.
- Sin métricas de evaluación publicadas: no hay datos objetivos de rendimiento más allá de la selección por pass@8, lo que dificulta su comparación con otros modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base-tf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ejecución relacionada (checkpoint hermano): https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base
