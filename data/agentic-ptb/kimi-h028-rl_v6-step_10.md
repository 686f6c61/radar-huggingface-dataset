# agentic-ptb/kimi.h028.rl_v6.step_10

## Resumen

Este repositorio contiene un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) denominado AgentPTB, publicado por el usuario agentic-ptb. El modelo es un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (~9,4B), y se enmarca dentro de un barrido de hiperparámetros (sweep) de 100 horas de entrenamiento. El identificador del repositorio (`kimi.h028.rl_v6.step_10`) indica que corresponde a la hora 28 del experimento y al paso 10 de la ejecución `rl_v6`, dentro de la celda experimental `kimi`.

Se trata de un artefacto de investigación, no de un modelo final listo para producción. Su interés radica en que permite estudiar la evolución del rendimiento a lo largo del entrenamiento RL, especialmente en tareas de razonamiento y codificación, dado que el driver mencionado es `kimi-code / kimi-k3` con un esfuerzo de razonamiento alto. La model card advierte que este checkpoint carece del token de fin de turno `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga correctamente las respuestas y sobrepase la ventana de contexto; por tanto, cualquier evaluación debe interpretarse como un límite inferior, no como una medida real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base, un transformer denso de 9,4B parámetros. Sobre esta base se aplica un proceso de aprendizaje por refuerzo (RL) dentro del framework AgentPTB, un barrido experimental que entrena múltiples variantes durante 100 horas. El checkpoint concreto corresponde a la hora 28 del experimento (según el ID) y al paso 10 de la ejecución `rl_v6`. La model card menciona un driver `kimi-code / kimi-k3` con esfuerzo de razonamiento alto, lo que sugiere que el RL se orienta a tareas de codificación y razonamiento agéntico, posiblemente utilizando un modelo de la familia Kimi como generador de datos o como señal de recompensa. No se proporcionan detalles sobre el algoritmo RL concreto (PPO, GRPO, etc.), el dataset utilizado ni la composición de los datos de entrenamiento.

Un aspecto técnico crítico es que el checkpoint solo incluye el token EOS con ID 248044 y carece del token 248046 (`<|im_end|>`), que es el que el template de chat de Qwen3.5 usa para finalizar cada turno de asistente. Esto implica que el modelo no sabe cuándo detenerse y tiende a sobrepasar la ventana de contexto, lo que invalida cualquier evaluación directa sin un reempaquetado previo.

## Capacidades

Dado que es un checkpoint intermedio de RL, sus capacidades no están documentadas de forma independiente. Se puede asumir que hereda las capacidades del modelo base Qwen3.5-9B-Base (generación de texto, razonamiento, código, matemáticas, etc.), pero no hay confirmación oficial. Las capacidades específicas derivadas del entrenamiento RL no se han evaluado ni publicado. La model card indica que el driver está orientado a codificación y razonamiento, por lo que es plausible que el RL haya potenciado estas áreas, pero no hay datos que lo respalden.

## Casos de uso

- Investigación en aprendizaje por refuerzo: este checkpoint sirve para estudiar la dinámica del entrenamiento RL, comparando el rendimiento en diferentes horas del sweep y analizando cómo evoluciona la capacidad de razonamiento y codificación a lo largo del tiempo.
- Análisis de la curva de rendimiento: al estar identificado por la hora de ejecución, permite mapear el checkpoint sobre las figuras de evaluación del sweep y observar tendencias de mejora o degradación.
- Estudio de la influencia del token EOS: la ausencia del token `<|im_end|>` ofrece un caso de estudio sobre cómo afecta la terminación de secuencia al rendimiento en tareas generativas.
- Reproducción de experimentos: investigadores pueden reutilizar este checkpoint como punto de partida para continuar el entrenamiento o para aplicar técnicas de reempaquetado (añadir el token faltante) y evaluar su efecto.
- Comparación de checkpoints: permite comparar el paso 10 con otros pasos de la misma ejecución para entender la convergencia del RL.
- Desarrollo de técnicas de corrección de EOS: sirve como banco de pruebas para métodos que reparan modelos con tokens de fin de secuencia incompletos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que, debido al token EOS faltante, cualquier número de evaluación sería un límite inferior y no una medida fiable. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada: el modelo en precisión FP16 ocupa aproximadamente 18,8 GB (tamaño del repositorio). Para inferencia en FP16 se necesitaría una GPU con al menos 20-24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, L4).
- Con cuantización a 8 bits, la VRAM necesaria bajaría a unos 9-10 GB, permitiendo su uso en GPUs de 12-16 GB (RTX 4070 Ti, RTX 3080, etc.). Con 4 bits, podría caber en 6-7 GB, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 40GB, H100, RTX 4090, o cualquier GPU con suficiente VRAM para el formato elegido.
- Opciones de despliegue: al ser un checkpoint de investigación sin formato GGUF ni integración con frameworks estándar, no se recomienda su uso con vLLM, Ollama o llama.cpp sin un proceso de conversión previo. Se podría cargar con Transformers y safetensors, pero la ausencia del token EOS dificulta su uso práctico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen3.5-9B-Base es el punto de referencia natural, pero no se conocen sus especificaciones exactas ni sus benchmarks. Otros modelos de 9B como Llama 3.1 8B o Mistral 7B podrían ser comparables en tamaño, pero no hay datos de rendimiento de este checkpoint para contrastar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Token EOS incompleto: el checkpoint carece del token `<|im_end|>` (ID 248046), por lo que el modelo no finaliza correctamente las respuestas y tiende a sobrepasar la ventana de contexto. No es utilizable directamente en producción ni en evaluación sin reempaquetado.
- Checkpoint intermedio: es un punto intermedio de un entrenamiento de 100 horas (hora 28, paso 10), no un modelo final. Su rendimiento puede ser inferior al de checkpoints posteriores.
- Licencia no especificada: no se indica la licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- Idiomas no documentados: se desconoce qué idiomas soporta, aunque probablemente herede los del modelo base Qwen3.5.
- Riesgo de alucinación y sesgos: al ser un modelo basado en Qwen, puede presentar sesgos propios del modelo base, pero no hay información específica.
- Sin benchmarks: no hay datos de rendimiento publicados, por lo que no se puede evaluar su calidad objetiva.
- Documentación inconsistente: la model card menciona un checkpoint distinto (`h031.step_30`) al del ID del repositorio (`h028.step_10`), lo que genera confusión sobre qué artefacto contiene realmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h028.rl_v6.step_10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
- Paper de Kimi K2 (referencia contextual, no directamente relacionado): https://arxiv.org/html/2507.20534v1
