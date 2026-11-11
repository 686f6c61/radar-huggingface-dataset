# cgpadwick2020/qwen3-1.7b-triton-grpo-run10

## Resumen

Qwen3-1.7B Triton kernel writer (GRPO run 10) es un ajuste fino del modelo Qwen3-1.7B de Alibaba, desarrollado por el usuario independiente cgpadwick2020, especializado en la generación de kernels de GPU en Triton para módulos de PyTorch. El modelo resuelve un problema muy concreto: dado un módulo de referencia escrito en PyTorch, generar una implementación equivalente en Triton (clase `ModelNew`) que compile y produzca resultados correctos. Es parte de una reimplementación independiente de TritonRL (Woo et al., arXiv 2510.17891), un trabajo que aplica aprendizaje por refuerzo con recompensas verificables al problema de la escritura de kernels.

El modelo parte del SFT `qwen3-1.7b-triton-sft-v2` y encadena varias rondas de GRPO; esta es la décima (run 10), con 964 pasos de entrenamiento sobre 3.857 tareas aumentadas en tamaño. Con 1.720.574.976 parámetros y un repositorio de 3,5 GB, es un modelo pequeño pensado para ejecutarse en hardware modesto y para integrarse en flujos de trabajo de optimización de kernels.

Su relevancia radica en que demuestra que un modelo de 1,7B parámetros, entrenado con GRPO y un verificador que compila y ejecuta cada kernel candidato, puede alcanzar un pass@1 del 51,0% en un test split de 152 tareas y un 75% de pass@10 en KernelBench Level 1 con el verificador del proyecto. Es un caso de estudio práctico de RL con recompensas verificables aplicado a la generación de código de bajo nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base Qwen3-1.7B; el entrenamiento usa completions de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos subidos en bf16; checkpoint guardado en fp32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) de Qwen3-1.7B, un transformer decoder-only. El pipeline de entrenamiento tiene dos fases: primero un supervised fine-tuning sobre kernels profesor verificados (modelo `qwen3-1.7b-triton-sft-v2`), y después varias rondas de GRPO (Group Relative Policy Optimization) con una recompensa que compila y ejecuta cada kernel candidato contra la referencia de PyTorch. Esta décima ronda parte del checkpoint de la ronda 9 y entrena durante 2 épocas sobre 3.857 tareas aumentadas en tamaño (KernelBook a escalas tipo KernelBench, con entradas de hasta 2^24–2^27 elementos y filas de 262.147 elementos).

Los hiperparámetros de la ronda 10 son: 964 pasos, 8 tareas × 16 muestras por paso, learning rate 3e-6, completions de 4.096 tokens y full fine-tune. Una innovación destacable del esquema de recompensa es que una completion solo se considera correcta si lo es tanto en el tamaño grande como en el tamaño original de la tarea, lo que fuerza al modelo a generalizar en lugar de memorizar dimensiones concretas. El checkpoint final se guardó en fp32 y se subió en bf16.

## Capacidades

- Generación de kernels Triton para módulos de PyTorch: recibe el módulo de referencia y debe producir una clase `ModelNew` con la implementación en Triton.
- Cumplimiento de contrato de código: el kernel generado debe compilar y ejecutar correctamente contra la referencia de PyTorch, incluyendo `get_inputs()` y `get_init_inputs()`.
- Generalización de tamaños: entrenado explícitamente para funcionar tanto a tamaños de entrada grandes (hasta 2^27 elementos) como a los tamaños originales de cada tarea.
- Razonamiento de bajo nivel sobre GPU: paralelización, gestión de bloques, máscaras y tipos de datos en kernels Triton.
- Uso con plantilla de chat con bloque de pensamiento vacío; el prompt recomendado incluye el módulo de referencia en un bloque de código Python.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad documentada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: ninguna documentada aparte de la generación de kernels.

## Casos de uso

- Optimización de kernels en producción: dado un módulo de PyTorch que actúa como cuello de botella, el modelo genera una versión en Triton que se puede compilar y comparar contra la referencia antes de integrarla, reduciendo el trabajo manual de escribir kernels a mano.
- Automatización de pipelines de CI para kernels: el modelo puede integrarse en un pipeline que, para cada módulo candidato, genere un kernel, lo compile y lo valide contra la referencia de PyTorch, usando el mismo esquema de verificación del entrenamiento.
- Generación de propuestas para revisión humana: el modelo produce candidatos de kernel que un ingeniero revisa y refina; con pass@10 del 75% en KernelBench Level 1, es realista generar varias muestras y filtrar por corrección.
- Investigación en RL con recompensas verificables: sirve como punto de partida o baseline para reproducir y extender TritonRL en hardware modesto, dado su tamaño de 1,7B parámetros.
- Educación y prototipado de kernels: permite a desarrolladores menos familiarizados con Triton obtener implementaciones de referencia que después estudian y ajustan.
- Aumento de datos para entrenamiento de modelos de código: los kernels generados y verificados pueden servir como datos de entrenamiento adicionales para modelos más grandes.
- Evaluación comparativa de verificadores: al ser un modelo pequeño con métricas publicadas, es útil para comparar la calidad de distintos verificadores de kernels.

## Benchmarks y rendimiento

Resultados publicados por el autor (verificador del proyecto, checkpoint final re-verificado el 8 de noviembre de 2026):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Test split del proyecto (152 tareas × 16 muestras) | pass@1 | 51,0 |
| Test split del proyecto (152 tareas × 16 muestras) | pass@16 | 67,8 |
| KernelBench a tamaños actuales (verificador del proyecto) | pass@10 Level 1 | 75% |
| KernelBench a tamaños actuales (verificador del proyecto) | pass@10 Level 2 | 50% |
| KernelBench a tamaños de principios de 2025 (evaluador propio de KernelBench) | pass@10 Level 1 | 83% |
| KernelBench a tamaños de principios de 2025 (evaluador propio de KernelBench) | pass@10 Level 2 | 47% |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en fp16/bf16 con contexto de 4.096 tokens, un presupuesto realista de 6–8 GB es suficiente. En cuantización de 8 bits, alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060/4060, RTX 4090, A100 y H100 son válidas. Para cuantización de 4 bits, GPUs con 4–6 GB pueden ser suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 8 GB o más en bf16, y en GPUs de 4–6 GB con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (previa conversión a GGUF), transformers con `generate`. El modelo es un transformer estándar, por lo que las herramientas habituales de Qwen3 aplican.
- Latencia y throughput: no disponibles en la información proporcionada. El muestreo recomendado es temperatura 0,6, top-k 20 y top-p 0,95, con completions de hasta 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cgpadwick2020/qwen3-1.7b-triton-grpo-run10 | 1,72B | no disponible | Kernels Triton (GRPO) | apache-2.0 | Hugging Face |
| cgpadwick2020/qwen3-1.7b-triton-sft-v2 | ~1,7B | no disponible | Kernels Triton (SFT) | no disponible | Hugging Face |
| Qwen3-1.7B (base) | 1,72B | no disponible | Propósito general | apache-2.0 | Hugging Face |
| Modelos de TritonRL (Woo et al.) | no disponible | no disponible | Kernels Triton (RL) | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; el autor solo reporta métricas del propio modelo y de sus versiones anteriores.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para escribir kernels Triton a partir de módulos de PyTorch; no es un modelo de propósito general y su rendimiento en otras tareas no está documentado.
- Riesgo de alucinación de código: puede generar kernels que compilen pero sean incorrectos, o que fallen en tamaños no vistos; por eso el entrenamiento exige verificación en dos tamaños. En producción es imprescindible validar contra la referencia.
- Idiomas no documentados: no se especifican los idiomas soportados; el uso está orientado a prompts en inglés con código Python.
- Longitud de contexto no documentada: aunque el entrenamiento usa completions de 4.096 tokens, no se indica la ventana de contexto efectiva del modelo base.
- Licencia apache-2.0: permite uso comercial, pero el modelo deriva de Qwen3-1.7B; conviene revisar las condiciones del modelo base y de los datos de entrenamiento (KernelBook) antes de un despliegue comercial.
- Modelo de nicho con pocas descargas (18) y sin likes: no hay validación independiente de las métricas reportadas; están calculadas con el verificador del propio proyecto.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo ni de robustez.
- Reproducibilidad: el checkpoint se guardó en fp32 y se subió en bf16, lo que puede introducir diferencias menores respecto a los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cgpadwick2020/qwen3-1.7b-triton-grpo-run10
- Modelo base (run 9): https://huggingface.co/cgpadwick2020/qwen3-1.7b-triton-grpo-run9
- Modelo SFT de partida: https://huggingface.co/cgpadwick2020/qwen3-1.7b-triton-sft-v2
- Paper de referencia (TritonRL): https://arxiv.org/abs/2510.17891
- Modelo base original Qwen3-1.7B: no disponible en la información proporcionada
