# agentic-ptb/sol-high.h035.opsd-swebench-lite-test39.step_1

## Resumen

Este repositorio contiene un checkpoint intermedio del experimento AgentPTB, denominado `sol-high.h035.opsd-swebench-lite-test39.step_1`. Se trata de un modelo de 9.400 millones de parámetros basado en `Qwen/Qwen3.5-9B-Base`, entrenado mediante On-Policy Self-Distillation (OPSD) para tareas de ingeniería de software del benchmark SWE-bench Lite. El checkpoint fue generado a las 35,77 horas de un run de 100 horas, con un driver de razonamiento de alto esfuerzo (Codex / gpt-5.6-sol), y está catalogado como el mejor punto de la celda `sol-high` del barrido.

La relevancia de este modelo reside en que documenta un punto intermedio de un proceso de auto-destilación on-policy, una técnica que permite a un único modelo actuar como estudiante y profesor simultáneamente, logrando mejoras de eficiencia de 8 a 12 veces frente a métodos de destilación convencionales. Aunque no es un modelo final de producción, su publicación permite reproducir y analizar la dinámica de entrenamiento a lo largo del tiempo, así como comparar checkpoints dentro del mismo barrido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen3.5-9B-Base, sin modificaciones estructurales aparentes. El entrenamiento emplea el método OPSD (On-Policy Self-Distillation), descrito en el repositorio Agentic-OPSD: el modelo actúa como estudiante cuando recibe solo el enunciado del problema, y como profesor cuando además recibe la solución de referencia, realizando un ajuste de distribución a nivel de token sobre sus propias trayectorias on-policy. Este enfoque reduce el coste de datos entre 8 y 12 veces respecto a la destilación clásica.

El checkpoint corresponde a la hora 35,77 de un run de 100 horas, con un driver de razonamiento de alto esfuerzo (Codex / gpt-5.6-sol). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El `eos_token_id` está configurado correctamente (`[248044, 248046]`), lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

- Generación de código y razonamiento sobre tareas de ingeniería de software, orientado al benchmark SWE-bench Lite.
- Capacidad de auto-destilación on-policy: el modelo puede generar trayectorias y usarlas para su propio entrenamiento.
- Razonamiento de alto esfuerzo (configuración `high` del driver), lo que sugiere capacidad de razonamiento multi-paso.
- Al estar basado en Qwen3.5-9B-Base, hereda las capacidades lingüísticas y de código del modelo base, aunque no se detallan en la ficha.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en auto-destilación on-policy: el checkpoint permite estudiar cómo evoluciona el rendimiento a lo largo de un run de 100 horas y comparar con otros puntos del barrido.
- Reproducción de experimentos: investigadores pueden re-evaluar este checkpoint en SWE-bench Lite para verificar los resultados del sweep.
- Análisis de dinámica de entrenamiento: al ser un punto intermedio, sirve para trazar curvas de rendimiento frente al tiempo de entrenamiento.
- Fine-tuning posterior: puede usarse como punto de partida para entrenamientos adicionales con otros datasets o técnicas.
- Evaluación de la configuración de eos tokens: el checkpoint tiene el `eos_token_id` correcto, lo que lo hace válido para evaluaciones comparativas dentro del mismo barrido.
- Desarrollo de métodos de destilación eficientes: sirve como caso de estudio para validar la eficiencia de OPSD frente a otras técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que es el "mejor cell del sweep", pero no proporciona métricas numéricas (porcentaje de resolución en SWE-bench, etc.). Tampoco se ofrecen comparaciones con otros modelos o checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 18,8 GB en fp16, por lo que se necesitan al menos 20 GB de VRAM para cargar el modelo completo. Con cuantización 8-bit se reduciría a ~9,4 GB, y con 4-bit a ~4,7 GB, pero no se han publicado versiones cuantizadas.
- GPU recomendadas: A100 40 GB, RTX 4090 24 GB, o GPUs con al menos 24 GB de VRAM para fp16. Para cuantización 4-bit, una RTX 3090 o 4070 Ti (12-16 GB) podría ser suficiente.
- No cabe en GPUs de consumo con menos de 12 GB sin cuantización.
- Opciones de despliegue: al ser un checkpoint de investigación, no está optimizado para producción. Puede cargarse con vLLM, llama.cpp u Ollama si se convierte a GGUF, pero no se proporcionan instrucciones ni configuraciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-high.h035 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community License | HuggingFace |

La comparación se limita a parámetros y disponibilidad, ya que no hay datos de rendimiento publicados para este checkpoint. El modelo base Qwen3.5-9B-Base es el punto de partida, y Llama-3.1-8B es una alternativa de tamaño similar, pero no se dispone de resultados comparativos en SWE-bench.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final entrenado hasta convergencia; su rendimiento puede ser inferior al de checkpoints posteriores del mismo run.
- Sin licencia especificada: el uso comercial no está garantizado; se recomienda contactar con el autor antes de cualquier despliegue.
- Sin datos de evaluación publicados: no se puede verificar su rendimiento real en SWE-bench ni en otras tareas.
- Sesgos del modelo base: al derivar de Qwen3.5-9B-Base, puede heredar sesgos lingüísticos o de código del modelo original.
- Riesgo de alucinación: no se ha evaluado específicamente, pero es un riesgo inherente a modelos de generación de código.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que dificulta su uso en tareas con ventanas largas.
- Formato de pesos: solo safetensors, sin cuantizaciones listas para usar; requiere conversión para despliegue ligero.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h035.opsd-swebench-lite-test39.step_1
- Repositorio Agentic-OPSD (GitHub): https://github.com/EcthelionLiu/Agentic-OPSD
- SWE-bench Leaderboard: https://www.swebench.com/
- TensorFeed SWE-bench Leaderboard: https://tensorfeed.ai/benchmarks/swe_bench
- Página de GPT-5.6 (OpenAI): https://openai.com/index/gpt-5-6/
