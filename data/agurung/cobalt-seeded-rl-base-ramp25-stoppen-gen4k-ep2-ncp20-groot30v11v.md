# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-groot30v11v

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) basado en Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario agurung. Se trata de un experimento de investigación que aplica el algoritmo GRPO (Group Relative Policy Optimization) directamente sobre el modelo base, sin una fase previa de fine-tuning supervisado (SFT), con el objetivo de mejorar sus capacidades de generación de código. El checkpoint se guardó en el paso global 4 de un run de RL llamado `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp20_groot30v11v` y se seleccionó como el mejor por su métrica pass@8.

El modelo está entrenado y validado sobre un subconjunto de problemas de código denominado "cobalt-train ≤2/64 frontier", que incluye 1833 problemas de entrenamiento y 112 de validación. La señal de recompensa es binaria: 1.0 si el programa generado pasa todos los tests del problema, 0.0 en caso contrario. Este enfoque de RL puro sobre un modelo base de 4B parámetros es relevante porque explora si es posible mejorar la generación de código sin depender de datos SFT, una línea de investigación activa en la comunidad de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, presumiblemente 131.072 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del base, presumiblemente multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal estándar. El entrenamiento de RL se realizó con OpenRLHF y el algoritmo GRPO, que normaliza las ventajas por grupo y no aplica penalización KL. Se aplicaron dos técnicas de regularización: una penalización "stop-properly" que asigna recompensa -1.0 a respuestas truncadas, y una penalización DAPO overlong que añade una penalización aditiva de hasta -0.25 para respuestas en los últimos 1024 tokens antes del límite.

El dataset de entrenamiento son 1833 problemas de código del "cobalt-train frontier", seleccionados porque el modelo base los resolvía en como máximo 2 de 64 muestras. Se generaron 8 muestras por prompt, con un batch de rollout de 128 y un batch de entrenamiento de 128. El número máximo de tokens nuevos por rollout es 4096, y se entrenó durante 2 épocas con una tasa de aprendizaje constante de 1e-06. La señal de recompensa es la corrección binaria del código generado contra los tests del problema.

## Capacidades

- Generación de código: el modelo genera programas completos en respuesta a problemas de programación, validados contra tests automáticos.
- Razonamiento paso a paso: al estar basado en Qwen3, conserva la capacidad de razonamiento del modelo base, aunque el entrenamiento RL se centró en código.
- Soporte de tool calling: no disponible en la información proporcionada, aunque el modelo base Qwen3-4B-Instruct-2507 lo soporta.
- Capacidades multilingües: no disponibles en la información, pero heredadas del modelo base.
- Sin modo de pensamiento explícito: el entrenamiento RL no incluyó un modo "thinking" separado, aunque el modelo base puede generar cadenas de razonamiento.

## Casos de uso

- Generación de código en entornos de evaluación: el modelo es adecuado para benchmarks de generación de código donde se requiere pasar tests unitarios, gracias a su entrenamiento específico en corrección de código.
- Investigación en RL para código: sirve como checkpoint de referencia para estudiar el efecto de GRPO sin SFT previo en modelos de 4B parámetros.
- Prototipado de agentes de código: puede integrarse en pipelines de generación y verificación de código, aunque su rendimiento en tareas generales no está validado.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede usarse como punto de partida para experimentos de RL adicionales o para distillation.
- Evaluación de robustez: útil para medir cómo responde un modelo entrenado con recompensa binaria ante problemas fuera de su distribución de entrenamiento.
- Comparación de algoritmos: sirve para comparar GRPO sin KL penalty frente a otras variantes de RL en la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento. El único dato de rendimiento es que fue seleccionado como el mejor por pass@8 en el run de RL, pero no se proporcionan valores numéricos.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, un modelo de 4.4B parámetros requiere aproximadamente 8.8 GB de VRAM. Con cuantización a 8 bits, ~4.4 GB; a 4 bits, ~2.2 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 10 GB de VRAM para FP16 sin cuantizar.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060 (12 GB) con cuantización, o RTX 4090 en FP16.
- Opciones de despliegue: vLLM (compatible según la model card), transformers con `from_pretrained`, o llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos. El checkpoint es un experimento de investigación sin benchmarks publicados, por lo que no se pueden comparar sus métricas con alternativas como Qwen3-4B-Instruct-2507 base, DeepSeek-Coder-6.7B o CodeLlama-7B. Se recomienda consultar los logs de W&B del run para obtener datos de evaluación.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo en problemas de código del "cobalt-train frontier", el modelo puede tener un rendimiento degradado en tareas de lenguaje general o en problemas de código fuera de ese subconjunto.
- Riesgo de alucinación: la recompensa binaria puede fomentar que el modelo genere código que "parece" correcto pero no pasa los tests, especialmente en problemas complejos.
- Limitaciones de contexto: no se especifica la longitud de contexto en la información, aunque se hereda del modelo base (presumiblemente 131.072 tokens).
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si es apto para uso comercial.
- Caveat de producción: es un checkpoint de investigación (paso global 4 de un run), no un modelo final pulido. No se recomienda su uso en producción sin una evaluación exhaustiva.
- Sin datos de evaluación: no hay métricas publicadas, por lo que el rendimiento real es desconocido fuera del contexto del run de RL.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-groot30v11v
- Run de W&B (proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp20_groot30v11v`): no disponible como URL directa en la información proporcionada.
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
