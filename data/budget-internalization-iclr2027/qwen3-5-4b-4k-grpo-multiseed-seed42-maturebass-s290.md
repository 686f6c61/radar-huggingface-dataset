# budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290

## Resumen

Qwen3.5-4B-4k-GRPO-multiseed-seed42-maturebass-s290 es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen3.5-4B, publicado por el grupo anonimo `budget-internalization-iclr2027` como parte de una submission anonima a ICLR 2027. El objetivo del entrenamiento es que el modelo resuelva problemas de razonamiento matematico operando bajo un presupuesto de generacion fijo de 4.096 tokens, es decir, que internalice la restriccion de longitud en lugar de necesitar instrucciones externas para respetarla.

El modelo parte de una arquitectura multimodal de tipo image-text-to-text (etiqueta de pipeline `image-text-to-text`), con 4.539.265.536 parametros totales en pesos BF16, lo que lo situa en la categoria de modelos compactos de 4B. Se trata de un checkpoint intermedio (paso 290) seleccionado como el mejor de su ejecucion segun la precision de validacion sobre 480 problemas reservados de DeepScaleR, dentro de un estudio de ablacion de semillas (42, 43 y 44) de la misma receta.

Su relevancia es fundamentalmente de investigacion: forma parte de un conjunto de repositorios disenados para medir como varia el comportamiento de un modelo RL bajo distintas semillas y presupuestos de tokens. No es un modelo orientado a produccion general, sino un artefacto experimental con proposito acotado (razonamiento matematico bajo restriccion de longitud) y licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion entrenado: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B, un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline `image-text-to-text`). Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el limite de 4.096 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a aprender a producir soluciones completas dentro de esa ventana.

Los datos de entrenamiento provienen del dataset agentica-org/DeepScaleR-Preview-Dataset (problemas de matematicas), con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup, durante 290 pasos. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y salida del resultado dentro de `\boxed{}`. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Razonamiento matematico paso a paso con salida estructurada en etiquetas `\boxed{}`.
- Generacion de texto conversacional segun la plantilla de chat del modelo base.
- Procesamiento de entradas imagen-texto (heredado del pipeline `image-text-to-text` del modelo base).
- Razonamiento bajo restriccion de longitud: entrenado para resolver problemas dentro de un presupuesto de 4.096 tokens de generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de robustez de RL: comparar este checkpoint (semilla 42, paso 290) con los de las semillas 43 y 44 para medir la varianza entre ejecuciones de la misma receta en tareas de razonamiento matematico.
- Investigacion sobre internalizacion de presupuesto de tokens: estudiar si el modelo aprende a ajustar la longitud de sus cadenas de razonamiento al limite de 4.096 tokens sin instrucciones externas.
- Generacion de soluciones matematicas con formato verificable: el modelo produce respuestas dentro de `\boxed{}`, lo que facilita la extraccion automatica y la evaluacion por comparacion exacta.
- Baseline en experimentos de RL para matematicas: servir como referencia de un ajuste GRPO sobre DeepScaleR frente a otros algoritmos o configuraciones de recompensa.
- Reproducibilidad de estudios de semillas: al publicarse checkpoints intermedios (paso 290) y finales (paso 300) por semilla, permite analizar la estabilidad del entrenamiento a lo largo del tiempo.
- Analisis de truncamiento: estudiar el comportamiento del modelo cuando las respuestas alcanzan el limite de generacion, ya que el entrenamiento puntua las respuestas truncadas tal cual.
- Despliegue experimental con vLLM: el autor documenta el servicio mediante `vllm serve`, lo que permite integrarlo en pipelines de evaluacion a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que la seleccion del checkpoint se basa en la precision de validacion medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB para pesos; en 4 bits, en torno a 2,5-3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 o H100 para evaluacion a gran escala; RTX 4090 o GPUs consumer de 16-24 GB para inferencia en BF16 con margen.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas en BF16, y en tarjetas de 8-12 GB con cuantizacion (no se publican pesos cuantizados oficiales).
- Opciones de despliegue: transformers (documentado por el autor) y vLLM (documentado por el autor). llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (seed42-maturebass-s290) | 4,54B | no disponible | GRPO, DeepScaleR, presupuesto 4k | Apache 2.0 | Hugging Face |
| qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290 | 4,54B (base comun) | no disponible | Misma receta, semilla 43 | Apache 2.0 | Hugging Face |
| qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300 | 4,54B (base comun) | no disponible | Misma receta, semilla 44, paso 300 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,54B (base) | no disponible | Preentrenamiento + alineamiento del autor original | Apache 2.0 | Hugging Face |

Las comparaciones con modelos de otras familias (por ejemplo, otros modelos de 4B orientados a matematicas) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: es un artefacto de una submission anonima a ICLR 2027, no un modelo validado para produccion.
- Dominio acotado: el ajuste GRPO se realiza exclusivamente sobre problemas de matematicas de DeepScaleR; el rendimiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir razonamientos plausibles con resultados incorrectos; la recompensa binaria no elimina este riesgo.
- Truncamiento: las respuestas que alcanzan los 4.096 tokens se cortan y se puntuan tal cual, lo que puede degradar la calidad en problemas largos.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible.
- Idiomas: no se especifican los idiomas soportados; el prompt de entrenamiento esta en ingles.
- Contexto: la longitud de contexto del modelo base no se detalla en la informacion proporcionada; solo se conoce el presupuesto de generacion de 4.096 tokens.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial, pero el caracter experimental del checkpoint desaconseja su uso en produccion sin evaluacion propia.
- Sin datos de benchmarks publicados: no es posible verificar cuantitativamente su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290
- Checkpoint final del mismo run (paso 300): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300
- Checkpoint semilla 43 (paso 290): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290
- Checkpoint semilla 43 (paso 300): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300
- Checkpoint semilla 44 (paso 300): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
