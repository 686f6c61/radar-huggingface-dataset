# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-budget-user-selectgnu-s260

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-budget-user-selectgnu-s260` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su propósito es internalizar un presupuesto fijo de generación de 4.096 tokens en tareas de razonamiento matemático: el modelo recibe en el prompt de usuario una indicación explícita de dicho límite y aprende a producir respuestas correctas dentro de esa ventana, en lugar de depender de un escalado de cómputo en tiempo de inferencia (test-time scaling). Forma parte del trabajo descrito en el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

Arquitectura y tamaño: se heredan del base Qwen3.5-4B, con 4.539.265.536 parámetros totales en BF16 y una pipeline declarada `image-text-to-text`, lo que implica que el base es multimodal (texto e imagen). El checkpoint liberado corresponde al paso 260 de un entrenamiento planificado de 300 pasos, con el identificador de ejecución `selectgnu`.

La relevancia actual reside en la idea de "internalización de presupuesto": entrenar con RLVR (RL con recompensa verificable) bajo un límite fijo de tokens para que el modelo ajuste la longitud de su cadena de razonamiento al presupuesto disponible, un enfoque útil en entornos de producción con restricciones de latencia y coste. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline `image-text-to-text`), derivada de Qwen3.5-4B; detalles internos (MoE/SSM/atención) no disponibles |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el presupuesto de generación entrenado es de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria y se basa en la corrección de la respuesta final, extraída mediante el patrón `\boxed{}`. Las respuestas que alcanzan el límite de tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a cerrar el razonamiento dentro del presupuesto en lugar de extenderlo indefinidamente.

Los datos de entrenamiento provienen de DeepScaleR (problemas de matemáticas), con un máximo de 3 épocas. La configuración es: batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y 260 pasos efectivos (de 300 planificados; el resto del barrido de presupuestos se encuentra en el paso 300). El presupuesto de generación (`max_new_tokens`) es de 4.096 y se declara al modelo dentro del prompt de usuario, renderizado con la plantilla de chat del modelo base. Los pesos se guardan en BF16.

## Capacidades

- Razonamiento matemático bajo presupuesto fijo: resuelve problemas de matemáticas ajustando la longitud de la cadena de razonamiento a los 4.096 tokens declarados en el prompt.
- Internalización del presupuesto: interpreta la indicación de límite de tokens incluida en el prompt de usuario y adapta su comportamiento a ella.
- Generación de texto conversacional (pipeline `conversational`).
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`), heredado del modelo base.
- Razonamiento multi-paso orientado a problemas con respuesta verificable (`\boxed{}`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos en producción con latencia acotada: al recibir el presupuesto de 4.096 tokens en el prompt, el modelo produce respuestas dentro de una ventana predecible, lo que permite dimensionar recursos de GPU y SLA de forma estable en servicios de tutoría o corrección automática.
- Evaluación comparativa de estrategias de razonamiento: sirve como checkpoint de referencia para estudiar el compromiso entre escalado en tiempo de inferencia y precisión dentro del presupuesto, comparándolo con los checkpoints del paso 300 del mismo barrido.
- Generación de soluciones paso a paso para datasets educativos: con datos DeepScaleR como dominio de entrenamiento, es adecuado para generar trazas de solución de problemas de competición con formato de respuesta extraíble (`\boxed{}`).
- Investigación en RLVR: al estar entrenado con GRPO y recompensa binaria verificable, puede usarse como punto de partida para experimentos de internalización de presupuesto con otros límites de tokens.
- Integración en pipelines de evaluación automática: la extracción de la respuesta final mediante `\boxed{}` facilita el scoring automático sin post-procesado complejo.
- Experimentación multimodal controlada: al heredar la pipeline `image-text-to-text` del base, permite estudiar cómo el ajuste de razonamiento matemático afecta a entradas imagen-texto (siempre que se validen las capacidades del base, no documentadas aquí).
- Base para ajustes posteriores: al ser un fine-tune con licencia Apache 2.0, puede servir como inicialización para tareas de razonamiento con restricciones de tokens específicas del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 B parámetros en BF16, los pesos ocupan aproximadamente 9,1 GB; en FP16/BF16 se recomienda al menos 12-16 GB de VRAM contando caché KV y overhead. En cuantización de 8 bits, en torno a 6-8 GB; en 4 bits, en torno a 4-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para BF16 en single-GPU.
- Consumer GPU: cabe en GPUs de 24 GB (RTX 4090, RTX 3090) en BF16; en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti) requiere cuantización de 8 bits o 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no se distribuyen pesos GGUF en el repo).
- Latencia y throughput: no disponibles. El presupuesto de 4.096 tokens de generación acota la latencia máxima por respuesta, pero no se han publicado medidas de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k (este) | 4,54 B | no disponible | GRPO sobre DeepScaleR, presupuesto 4k | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4 B (aprox., según nombre) | no disponible | preentrenamiento + post-entrenamiento del autor original | según modelo base | Hugging Face |
| Checkpoints del paso 300 del mismo barrido | 4,54 B | no disponible | mismo esquema, 300 pasos | Apache 2.0 | referenciados en la model card, sin enlace directo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint incompleto: entrenamiento detenido en el paso 260 de 300, por lo que puede estar por debajo del rendimiento de los checkpoints del paso 300 del mismo barrido.
- Dominio restringido: entrenado exclusivamente con DeepScaleR (matemáticas); el rendimiento fuera de ese dominio no está documentado.
- Dependencia del prompt: el comportamiento bajo presupuesto depende de que el límite de 4.096 tokens se declare en el prompt de usuario; sin esa indicación, el comportamiento no está garantizado.
- Truncamiento de respuestas: las respuestas que agotan el presupuesto se truncan y se puntúan tal cual, lo que puede producir soluciones incompletas en problemas que requieran razonamientos más largos.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; el base Qwen3.5-4B es multilingüe, pero este fine-tune no declara idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B, de las que este modelo hereda.
- Madurez: 0 descargas y 0 likes, citation marcada como "TODO" en la model card; no es un artefacto con validación comunitaria.
- Capacidades multimodales: la pipeline `image-text-to-text` se hereda del base, pero no hay evidencia de que el ajuste RL preserve o mejore el rendimiento en visión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-budget-user-selectgnu-s260
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Artículo referenciado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible en la información proporcionada)
- Repositorio de código: no disponible
- Demo: no disponible
