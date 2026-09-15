# SirSahOl/DeepSeek-R1-Distill-Qwen-7B-chat-mlx-8bit

## Resumen

DeepSeek-R1-Distill-Qwen-7B-chat-mlx-8bit es una conversión cuantizada a 8 bits del modelo DeepSeek-R1-Distill-Qwen-7B, realizada por SirSahOl. El modelo base es un destilado de DeepSeek-R1 sobre Qwen2.5-7B, lo que le permite heredar las capacidades de razonamiento paso a paso del modelo R1 original. Esta versión está optimizada para ejecución nativa en Apple Silicon mediante el framework MLX de Apple, reduciendo el footprint de memoria activa a aproximadamente 7,8 GB.

La arquitectura es Qwen2ForCausalLM, un transformer denso con 7.615.616.512 parámetros y una ventana de contexto de 131.072 tokens. El objetivo de esta conversión es ofrecer un modelo de razonamiento de alta calidad que pueda ejecutarse en Macs con memoria unificada a partir de 16 GB, manteniendo una precisión cercana a la del modelo original en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 8-bit MLX (media de 8,25 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Qwen-7B es un destilado del modelo DeepSeek-R1, que utiliza reinforcement learning para mejorar el razonamiento. La destilación se realizó sobre Qwen2.5-7B, por lo que la arquitectura resultante es Qwen2ForCausalLM, un transformer denso con atención estándar y sin componentes de mezcla de expertos (MoE). El proceso de destilación transfiere las capacidades de razonamiento estructurado del modelo R1 al modelo Qwen mediante datos generados por el propio R1.

La conversión de SirSahOl aplica cuantización a 8 bits con MLX, adaptando los pesos al formato safetensors específico de Apple Silicon. Esta cuantización mantiene la arquitectura original y reduce el tamaño del modelo a 8,1 GB en disco. No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni procesos de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno mediante la plantilla de chat de Qwen2.
- Razonamiento estructurado paso a paso, derivado de la destilación de DeepSeek-R1, adecuado para problemas complejos.
- Soporte de matemáticas complejas y análisis estructurado, según las tablas de rendimiento del autor.
- Generación de código y asistencia en programación, con capacidad para explicar y depurar paso a paso.
- No se ha documentado soporte de tool calling ni function calling en la información disponible.
- No se ha documentado soporte de visión ni audio.
- Capacidades multilingües no especificadas.

## Casos de uso

- Asistente de razonamiento local en Apple Silicon: ejecutar consultas complejas sin conexión mediante `mlx_lm.chat`, aprovechando la cuantización 8-bit para mantener un footprint de ~7,8 GB en Macs con 16 GB de memoria unificada.
- Análisis de datos y matemáticas: el modelo puede descomponer problemas financieros o científicos en pasos intermedios, lo que lo hace adecuado para cálculos explicados y verificación de hipótesis.
- Generación de código en desarrollo: asistencia en programación con explicaciones de algoritmos, revisión de fragmentos de código y depuración razonada, integrable en flujos de trabajo locales.
- Tutoría educativa: explicación de conceptos de física, matemáticas o informática mediante razonamiento estructurado, útil para plataformas de aprendizaje autónomo en macOS.
- Automatización de documentación técnica: generación de resúmenes, informes y documentación a partir de especificaciones, gracias a la capacidad de mantener coherencia en contextos largos de hasta 131.072 tokens.
- Agentes locales de análisis: para tareas de multi-step reasoning, como análisis de tendencias o síntesis de información, aunque sin tool calling nativo, puede integrarse en pipelines de texto con orquestación externa.
- Evaluación de modelos: la variante 8-bit permite pruebas rápidas de razonamiento con precisión casi sin pérdidas, mientras que la variante 16-bit se reserva para validaciones de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor incluye estimaciones de rendimiento de inferencia en hardware Apple Silicon, que se detallan en la sección de requisitos de hardware.

## Requisitos de hardware

- VRAM estimada: ~7,8 GB de memoria unificada activa en la variante 8-bit. Mínimo recomendado: 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon en sus variantes M1, M2, M3 y M4, incluyendo Base, Pro, Max y Ultra.
- Compatibilidad con GPU de consumo: no aplica, el modelo está diseñado específicamente para Apple Silicon; no se ha documentado soporte para CUDA o GPUs de NVIDIA.
- Opciones de despliegue: MLX mediante `mlx-lm` (CLI y API de Python), LM Studio con configuración de stop strings personalizada, y otras herramientas compatibles con MLX.
- Latencia y throughput estimados según el autor:

| Tier de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1 / M2 / M3 / M4 (Base) | 16 GB (mínimo) | ~7,8 GB | ~22 tokens/s | ~160 ms |
| M1 / M2 / M3 / M4 Pro | 18 – 36 GB | ~7,8 GB | ~34 tokens/s | ~110 ms |
| M1 / M2 / M3 / M4 Max | 36 – 128 GB | ~7,8 GB | ~48 tokens/s | ~70 ms |
| M1 / M2 / M3 / M4 Ultra | 64 – 192 GB | ~7,8 GB | ~72 tokens/s | ~45 ms |

Estas cifras son estimaciones del autor basadas en el ancho de banda de memoria unificada y el footprint de parámetros activos. Los resultados reales pueden variar según la longitud del contexto y la carga del sistema.

## Comparativa con modelos similares

La siguiente tabla compara las variantes de cuantización del mismo modelo base, que constituyen la categoría más directa de alternativas:

| Variante | Tamano en disco | Footprint VRAM | Hardware objetivo | Ventaja clave |
|---|---|---|---|---|
| 4-bit MLX | ~4,3 GB | ~4,2 GB | M1/M2/M3/M4 (8 GB+) | Máxima velocidad y menor presión de memoria |
| 8-bit MLX (este modelo) | ~8,1 GB | ~7,8 GB | M1/M2/M3/M4 Pro/Max (16 GB+) | Precisión casi sin pérdidas y razonamiento de alta fidelidad |
| 16-bit MLX | ~15,2 GB | ~15,2 GB | M2/M3/M4 Max/Ultra (32 GB+) | Precisión completa bfloat16, cero pérdida de perplejidad |

No se han proporcionado datos de comparación con otros modelos de la misma categoría de tamaño en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se ha evaluado específicamente; como modelo de razonamiento, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Limitaciones de contexto o idioma: la información no especifica los idiomas soportados; el contexto de 131.072 tokens es amplio, pero el rendimiento puede degradarse con contextos muy largos.
- Restricciones de licencia: MIT, permisiva para uso comercial, sin restricciones significativas.
- Caveat de despliegue: el modelo solo es compatible con Apple Silicon y MLX; no puede ejecutarse en GPUs NVIDIA o AMD sin una conversión adicional.
- Las estimaciones de rendimiento son proporcionadas por el autor y pueden variar en condiciones reales; se recomienda validar el rendimiento en el hardware objetivo antes de su uso en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SirSahOl/DeepSeek-R1-Distill-Qwen-7B-chat-mlx-8bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Variante 4-bit: https://huggingface.co/SirSahOl/DeepSeek-R1-Distill-Qwen-7B-chat-mlx-4bit
- Variante 16-bit: https://huggingface.co/SirSahOl/DeepSeek-R1-Distill-Qwen-7B-chat-mlx-16bit
- Framework MLX: https://github.com/ml-explore/mlx
- Paper de DeepSeek-R1: arxiv:2501.12948
