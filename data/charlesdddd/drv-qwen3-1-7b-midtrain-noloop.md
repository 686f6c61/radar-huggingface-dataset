# CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop

## Resumen

DRV-Qwen3-1.7B-midtrain-noloop es un modelo de lenguaje de 1.720.574.976 parámetros desarrollado por el usuario CharlesDDDD, obtenido mediante preentrenamiento continuado (continued pretraining) a partir de Qwen/Qwen3-1.7B-Base. El modelo ha sido entrenado durante aproximadamente 20.000 millones de tokens adicionales sobre una mezcla de datos web, PDF, código y trayectorias de agentes, con secuencias de 16K tokens, optimizador AdamW y una tasa de aprendizaje máxima de 3e-4 con decaimiento coseno.

La particularidad de este modelo es que actúa como **control experimental** dentro de la colección Depth Recurrent Vector (DRV) del mismo autor. Los modelos de esa colección incorporan mecanismos de "looping" (recurrencia en profundidad), y este checkpoint emplea exactamente los mismos datos, el mismo optimizador y el mismo schedule, pero sin bucle. De este modo, cualquier diferencia de rendimiento entre un modelo con looping y este puede atribuirse al mecanismo de recurrencia y no al entrenamiento adicional.

Es relevante ahora porque proporciona una línea base reproducible para investigar arquitecturas recurrentes en profundidad sobre un modelo denso estándar de Qwen3. La pérdida de test reportada es de 1.1460 (frente a 1.5515 del modelo base antes del preentrenamiento continuado), lo que cuantifica la mejora del entrenamiento adicional. El modelo carga como un Qwen3 estándar sin necesidad de `trust_remote_code`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3 estándar) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 16K tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3, heredado de Qwen/Qwen3-1.7B-Base. No introduce modificaciones arquitectónicas: se trata de un checkpoint estándar que carga sin `trust_remote_code`. La innovación no está en la arquitectura, sino en su papel metodológico como control dentro de la colección Depth Recurrent Vector, donde los demás modelos sí incorporan recurrencia en profundidad.

El entrenamiento consistió en un preentrenamiento continuado de aproximadamente 20.000 millones de tokens en una sola pasada sobre una mezcla de datos web, PDF, código y trayectorias de agentes, con secuencias de 16K tokens, optimizador AdamW y tasa de aprendizaje máxima de 3e-4 con decaimiento coseno. No se menciona en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores. La pérdida de test en el conjunto reservado es de 1.1460, frente a 1.5515 del modelo base antes del preentrenamiento continuado.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de código, dado que la mezcla de entrenamiento incluye código.
- Procesamiento de trayectorias de agentes, al haber sido entrenado sobre agentes-trajectory data.
- Compatible con text-generation-inference y con endpoints compatibles según los tags del repositorio.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Línea base en investigación de recurrencia en profundidad: se emplea como referencia de control para medir el efecto del looping en la colección DRV, comparando pérdidas de test sobre el mismo conjunto reservado.
- Evaluación de preentrenamiento continuado: permite aislar la contribución de 20B tokens adicionales sobre Qwen3-1.7B-Base midiendo la diferencia de pérdida (1.5515 frente a 1.1460).
- Generación de texto conversacional en prototipos: al ser un modelo denso de 1,7B parámetros con licencia Apache 2.0, puede desplegarse en entornos de desarrollo para asistentes conversacionales ligeros.
- Experimentos de ablación de datos: al compartir mezcla de datos con los modelos DRV con looping, sirve para estudiar el efecto de la composición del dataset (web, PDF, código, agentes) sobre el rendimiento.
- Fine-tuning posterior como base: al cargar como Qwen3 estándar, puede reutilizarse como punto de partida para ajustes supervisados o DPO en pipelines de transformers.
- Investigación sobre trayectorias de agentes: su entrenamiento con agent-trajectory data lo hace adecuado para estudiar la transferencia de ese tipo de datos a tareas de razonamiento multi-paso.

## Benchmarks y rendimiento

| Métrica | DRV-Qwen3-1.7B-midtrain-noloop | Qwen3-1.7B-Base (antes del CPT) |
|---|---|---|
| Pérdida de test (menor es mejor) | 1.1460 | 1.5515 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 1-1,5 GB para pesos.
- GPU recomendadas: cabe en GPU de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090; también en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, con holgura en modelos de 8 GB o más en FP16 y en 4-6 GB con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (según tags), vLLM y llama.cpp/Ollama previa conversión a GGUF (no publicada en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DRV-Qwen3-1.7B-midtrain-noloop | 1,72B | no disponible (entrenado a 16K) | Apache 2.0 | Control sin looping, CPT de 20B tokens |
| Qwen/Qwen3-1.7B-Base | 1,72B | no disponible en esta ficha | Apache 2.0 | Modelo base original, pérdida de test 1.5515 |
| Modelos DRV con looping (colección Depth Recurrent Vector) | no disponible | no disponible | Apache 2.0 | Misma receta con recurrencia en profundidad; comparables directamente con este control |

No se dispone de datos de benchmarks para comparar con alternativas de otros desarrolladores en la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: su propósito principal es servir de control experimental, no un asistente listo para producción.
- Sin fase de alineación documentada (RLHF/DPO): puede producir salidas no alineadas, tóxicas o con formato deficiente.
- Riesgo de alucinación inherente a un modelo de 1,7B parámetros entrenado principalmente con preentrenamiento continuado.
- Idiomas soportados no documentados; el rendimiento fuera del inglés (y posiblemente chino, heredado de Qwen3) no está garantizado.
- Longitud de contexto efectiva no especificada; aunque el entrenamiento usó secuencias de 16K, no se confirma el contexto máximo soportado en inferencia.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ): requiere conversión manual para despliegue ligero.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de calidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene evaluar el modelo en el dominio objetivo antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
