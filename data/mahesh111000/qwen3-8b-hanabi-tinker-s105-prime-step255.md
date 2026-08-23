# Mahesh111000/qwen3-8b-hanabi-tinker-s105-prime-step255

## Resumen

El modelo `Mahesh111000/qwen3-8b-hanabi-tinker-s105-prime-step255` es un ajuste fino (fine-tune) de la base densa Qwen/Qwen3-8B-Base, desarrollado por el usuario Mahesh111000. El nombre del repositorio sugiere un entrenamiento orientado al juego cooperativo de cartas Hanabi, con técnicas de aprendizaje por refuerzo (la nomenclatura "tinker", "prime" y "step255" apunta a un proceso iterativo de refinamiento con pasos de optimización, probablemente GRPO, como indica el modelo hermano `qwen3-8b-hanabi-grpo-step_101` del mismo autor).

El modelo hereda la arquitectura completa de Qwen3-8B: un transformer denso de 8.190 millones de parámetros, con soporte nativo de contexto de 32.768 tokens (extensible a 131.072 mediante YaRN) y la capacidad distintiva de alternar entre modo de pensamiento y modo no pensante. Los tags de arXiv (2309.00071 y 2505.09388) apuntan a investigación relacionada con agentes y aprendizaje por refuerzo, aunque no se detalla su contenido en la model card.

Relevancia: al estar especializado en Hanabi, un entorno estándar para evaluar coordinación, teoría de la mente y planificación multiagente, este modelo es útil para investigación en RL y sistemas multiagente, más que para uso generalista. Es un modelo muy reciente (creado en agosto de 2026) con cero descargas y cero likes, por lo que no ha sido validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) con GQA |
| Parámetros totales | 8.190.735.360 (8,19B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN (según base Qwen3) |
| Tipos de cuantización | No disponible (repositorio solo en safetensors fp16; no se publican GGUF ni AWQ) |
| Idiomas soportados | No especificado; la base Qwen3-8B soporta más de 100 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer causal denso de 36 capas, con atención GQA (32 cabezas de consulta y 8 de clave/valor) y 6,95B de parámetros no embebidos. La base Qwen3 fue entrenada en una mezcla extensa de datos multilingües (más de 100 idiomas) y posteriormente refinada con instrucciones y preferencias humanas, lo que le confiere capacidades de razonamiento, generación de código y seguimiento de instrucciones.

El ajuste fino específico de este modelo se centra en Hanabi, un juego cooperativo de cartas donde los jugadores no ven sus propias cartas y deben coordinarse mediante pistas. La nomenclatura del repositorio y la existencia de un modelo hermano con "grpo" en el nombre indican que el entrenamiento se realizó con GRPO (Group Relative Policy Optimization), una variante de PPO sin crítico. El sufijo "s105" y "step255" sugieren un entrenamiento en 105 episodios y 255 pasos de optimización, respectivamente. No se ha publicado información sobre el dataset exacto ni sobre la composición de los datos de entrenamiento.

## Capacidades

- Generación de texto causal completa, heredada de Qwen3-8B-Base.
- Modo de pensamiento (thinking) y modo no pensante, con conmutación mediante `enable_thinking` en el tokenizador.
- Razonamiento lógico y matemático, generación de código y comprensión de instrucciones (capacidades de la base Qwen3).
- Capacidades de agente: integración con herramientas externas en ambos modos (heredado de la base).
- Soporte multilingüe amplio (más de 100 idiomas) según la base Qwen3.
- Especialización en el juego Hanabi: el ajuste con RL busca mejorar la coordinación y planificación cooperativa en entornos multiagente, aunque no se publican métricas concretas de juego.
- Compatible con tool calling y razonamiento multi-paso si se mantienen las capacidades de la base (no verificado en este ajuste).

## Casos de uso

- Investigación en sistemas multiagente: el modelo se puede usar para estudiar coordinación y teoría de la mente en entornos de juego cooperativo como Hanabi, donde los agentes deben inferir información oculta de las acciones de sus compañeros.
- Benchmark de aprendizaje por refuerzo: sirve como punto de partida para comparar métodos de RL (GRPO, PPO, etc.) sobre una base densa de 8B, midiendo la mejora de rendimiento en tareas de juego.
- Evaluación de técnicas de alineación de preferencias: al ser un ajuste con RL, se puede comparar con el modelo base y con variantes instruct para medir el impacto del entrenamiento de refuerzo en capacidades generales.
- Entorno de pruebas para agentes conversacionales cooperativos: el modelo puede generar razonamientos y acciones en diálogos donde la información está parcialmente oculta, útil para simular asistentes que deben cooperar con el usuario.
- Análisis de la degradación de capacidades generales: permite estudiar cómo un ajuste especializado (juego) afecta a habilidades generales como razonamiento lógico o generación de código, al comparar con Qwen3-8B-Base.
- Base para nuevos ajustes finos: como modelo intermedio con pesos abiertos (Apache-2.0), se puede continuar el entrenamiento para otras tareas de coordinación o planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este ajuste fino en la información disponible. La model card reproduce la del modelo base Qwen3-8B, pero no se atribuyen a esta versión los resultados de MMLU, HumanEval, GSM8K u otros. No se dispone de datos de rendimiento en el juego Hanabi (score medio, tasa de victorias, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16,4 GB (tamaño del repositorio), que cabe en GPU de 24 GB (RTX 3090, RTX 4090, A5000) sin cuantización.
- Con cuantización de 4 bits (si se genera un GGUF o con bitsandbytes) se estima 5–7 GB de VRAM, lo que permitiría ejecutarlo en tarjetas consumer de 8–12 GB (RTX 3060, 4060, etc.), aunque no hay cuantizaciones publicadas.
- GPU recomendadas para fp16: A100 40 GB, H100, RTX 4090, A6000.
- Opciones de despliegue: `transformers` (pipeline text-generation), `vLLM` (versión ≥0.8.5), `SGLang` (≥0.4.6.post1), `Ollama`, `llama.cpp`, `MLX-LM` y `KTransformers`, según el soporte de la base Qwen3.
- Latencia y throughput: no disponibles para este ajuste específico; la base Qwen3-8B en vLLM ofrece throughput aproximado de 50–80 tokens/s en A100, pero no se puede extrapolar con certeza.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Mahesh111000/qwen3-8b-hanabi-tinker-s105-prime-step255 | 8,19B | 32K (131K con YaRN) | Apache-2.0 | safetensors | Hanabi + GRPO |
| Qwen/Qwen3-8B-Base | 8,2B | 32K (131K con YaRN) | Apache-2.0 | safetensors | Base pretrained |
| Qwen/Qwen3-8B-Instruct | 8,2B | 32K (131K con YaRN) | Apache-2.0 | safetensors | Instrucciones y diálogo |
| Mahesh111000/qwen3-8b-hanabi-grpo-step000 | 8,19B | 32K (131K con YaRN) | Apache-2.0 | safetensors | Hanabi (GRPO, paso 000) |

La comparativa se limita a la base y a los modelos del mismo autor, ya que no se dispone de benchmarks para establecer comparaciones de rendimiento reales. La diferencia principal entre este modelo y su hermano `step000` es el número de pasos de entrenamiento (255 frente a 000), lo que presumiblemente implica una mayor exposición a los datos de RL de Hanabi.

## Limitaciones y advertencias

- Modelo sin validar: cero descargas y cero likes en HuggingFace; no hay evidencia de uso en producción ni de resultados reproducibles.
- Especialización en Hanabi: el entrenamiento de RL para un juego cooperativo puede degradar capacidades generales (razonamiento, código, diálogo) respecto a la base Qwen3-8B-Base; no se han medido estos efectos.
- Riesgo de alucinación y de respuestas incoherentes: no se ha evaluado la calidad de la generación fuera del dominio de Hanabi.
- La model card es una copia literal de la de Qwen3-8B, lo que no aporta información específica sobre el ajuste; hay que tratar con cautela las afirmaciones de la base.
- Los arxiv tags (2309.00071, 2505.09388) no se detallan; no se puede confirmar que el entrenamiento haya seguido exactamente esos métodos.
- No hay datos de benchmarks, latencia ni calidad de generación para el modelo ajustado.
- La licencia Apache-2.0 permite uso comercial, pero el estado experimental y la falta de validación hacen recomendable una evaluación exhaustiva antes de desplegarlo en producción.
- No se publican pesos en GGUF ni cuantizaciones; para inferencia en GPU consumer habría que generarlos manualmente.

## Enlaces

- Hugging Face: https://huggingface.co/Mahesh111000/qwen3-8b-hanabi-tinker-s105-prime-step255
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo hermano (GRPO step000): https://huggingface.co/Mahesh111000/qwen3-8b-hanabi-grpo-step_101
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Referencias arXiv citadas en los tags: https://arxiv.org/abs/2309.00071 y https://arxiv.org/abs/2505.09388 (contenido no verificado)
