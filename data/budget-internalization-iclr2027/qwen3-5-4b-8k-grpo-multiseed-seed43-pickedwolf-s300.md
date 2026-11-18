# budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300

## Resumen

El modelo `qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen3.5-4B, desarrollado por el grupo `budget-internalization-iclr2027` en el marco de una submission anonima a ICLR 2027. El objetivo del trabajo es estudiar como un modelo de razonamiento matematico internaliza un presupuesto de generacion fijo de 8.192 tokens: las respuestas que alcanzan ese limite se truncan y se puntuan tal cual, de modo que el modelo aprende a operar de forma efectiva dentro de esa restriccion.

Se trata de una ablacion de semillas: la misma receta se entrena con tres semillas (42, 43 y 44) y este repositorio corresponde a la semilla 43, checkpoint final del paso 300 del run con nombre en clave `pickedwolf`. El modelo tiene 4.539.265.536 parametros (4,54 mil millones) en precision BF16 y un tamano de repositorio de 9,1 GB.

Es relevante ahora porque combina dos tendencias activas en IA abierta: por un lado, el interes por el razonamiento matematico verificable con recompensas binarias y, por otro, el estudio de como los modelos gestionan presupuestos de computo en inferencia. Al derivar de Qwen3.5-4B, hereda su pipeline `image-text-to-text`, aunque el ajuste se centra exclusivamente en matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), heredada del modelo base |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,54 mil millones de parametros. El ajuste no modifica la arquitectura: se aplica GRPO (Group Relative Policy Optimization) sobre el modelo base con pesos en BF16. La innovacion tecnica no esta en la arquitectura sino en el procedimiento de entrenamiento: se fija un presupuesto de generacion (`max_new_tokens`) de 8.192 tokens y las respuestas que lo agotan se truncan y se puntuan en su estado truncado, lo que fuerza al modelo a internalizar ese limite.

Los datos de entrenamiento provienen del dataset DeepScaleR-Preview-Dataset (agentica-org), centrado en problemas matematicos, con un maximo de 3 epocas. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. La configuracion de entrenamiento usa 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y 300 pasos totales. El algoritmo GRPO emplea baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matematico paso a paso, con formato de salida de respuesta dentro de etiquetas `\boxed{}`.
- Generacion de cadenas de razonamiento largas bajo un presupuesto fijo de 8.192 tokens.
- Aprendizaje por refuerzo con recompensa binaria de correccion (entrenado con GRPO).
- Capacidades de vision heredadas del modelo base Qwen3.5-4B (pipeline `image-text-to-text`), aunque no se han ajustado en este entrenamiento.
- Soporte de conversacion multi-turno mediante la plantilla de chat del modelo base.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue con transformers y vLLM.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso general: no documentadas mas alla del razonamiento matematico.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: reproduccion y extension de la ablacion de semillas (42, 43, 44) para estudiar la varianza del entrenamiento GRPO en tareas de razonamiento matematico.
- Estudio de internalizacion de presupuestos de computo: analizar como el modelo distribuye sus tokens de generacion cuando se le impone un limite de 8.192 tokens, comparando checkpoints (paso 160, 290, 300) del mismo run.
- Evaluacion de robustez ante truncamiento: el modelo esta entrenado para producir respuestas validas incluso cuando la generacion se corta, lo que lo hace util en entornos con limites estrictos de latencia o coste.
- Generacion de soluciones matematicas verificables: dado un problema, el modelo produce una cadena de razonamiento y una respuesta final extraible con `\boxed{}`, adecuada para pipelines de evaluacion automatica.
- Benchmarking de modelos pequenos de razonamiento: con 4,54 mil millones de parametros sirve como linea base para comparar tecnicas de RL frente al modelo base Qwen3.5-4B.
- Despliegue en entornos con recursos limitados: su tamano permite servir el modelo con vLLM en una unica GPU, util para prototipos de tutoria matematica o generacion de problemas resueltos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numericos obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB.
- Cuantizacion: no se han publicado versiones GGUF ni cuantizadas; seria necesario generarlas a partir de los pesos safetensors.
- GPU recomendadas: A100, H100 o L40S para produccion; una RTX 4090 (24 GB) deberia poder alojar los pesos en BF16 con margen limitado.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) en BF16; en tarjetas de 16 GB requeriria cuantizacion no publicada.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve`) y cualquier runtime compatible con safetensors; llama.cpp u Ollama requeririan conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300 | 4,54 B | no disponible (presupuesto de generacion 8.192 tokens) | GRPO sobre DeepScaleR | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | 4,54 B | no disponible | Preentrenamiento + alineacion del autor original | Apache 2.0 (segun herencia indicada) | Hugging Face |
| qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300 | 4,54 B | no disponible (8.192 tokens de generacion) | Misma receta, semilla 42 | Apache 2.0 | Hugging Face |
| qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300 | 4,54 B | no disponible (8.192 tokens de generacion) | Misma receta, semilla 44 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: forma parte de una submission anonima a ICLR 2027 y no esta pensado como producto listo para produccion.
- Especializado en matematicas: el ajuste GRPO se realizo exclusivamente sobre DeepScaleR; su rendimiento en otras tareas puede degradarse respecto al modelo base.
- Sesgos: no documentados en la informacion proporcionada, pero hereda los sesgos del corpus de preentrenamiento de Qwen3.5-4B.
- Alucinacion: riesgo presente como en cualquier modelo generativo; la recompensa binaria de correccion no garantiza veracidad en problemas fuera del dominio matematico.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se realizo con un prompt en ingles.
- Truncamiento: las respuestas que superan los 8.192 tokens se cortan, lo que puede producir soluciones incompletas en problemas especialmente largos.
- Licencia: Apache 2.0, heredada del modelo base; permite uso comercial, pero conviene verificar los terminos del modelo Qwen3.5-4B original.
- Varianza entre semillas: al ser una ablacion de semillas, los resultados pueden variar entre los checkpoints 42, 43 y 44; no se han publicado metricas que cuantifiquen esa varianza.
- Sin datos de benchmarks publicados: no es posible validar su calidad frente a alternativas sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint semilla 42, paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Checkpoint semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Checkpoint semilla 43, paso 160: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Checkpoint semilla 44, paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Checkpoint semilla 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
