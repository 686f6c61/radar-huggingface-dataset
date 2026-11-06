# NotCherry/LFM3-1.7B-ThinkExit-GGUF

## Resumen

LFM3-1.7B ThinkExit es un artefacto experimental de investigación publicado por el usuario NotCherry en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional, sino de una edición directa en el espacio de pesos (weight-space programming) aplicada sobre el checkpoint cuantizado AtomicChat/LFM3-1.7B-Uncensored-GGUF, que a su vez deriva del modelo LiquidAI/LFM3-1.7B de Liquid AI. El objetivo del experimento es modificar el momento en que el modelo abandona su fase de razonamiento (thinking) y emite la respuesta final, actuando únicamente sobre la fila del token `</think>` en la cabeza de salida.

La intervención es mínima: se copia el tensor de embedding de entrada (que en el GGUF original está atado a la proyección de salida) a un `output.weight` explícito y se escalan ocho block scales Q6_K de la fila correspondiente al token `</think>` (ID 124902) por un factor de 1.50. Solo 10 bytes difieren del original en esa fila copiada. No hay entrenamiento por gradientes, ni LoRA, ni RLHF: el backbone y los embeddings de entrada permanecen intactos. El resultado es un GGUF autónomo de aproximadamente 1,99 mil millones de valores almacenados (frente a los 1,73 mil millones originales), con unos 215 MB extra de almacenamiento debido a la cabeza duplicada.

Es relevante ahora porque ejemplifica una línea de investigación emergente —la programación en el espacio de pesos inspirada en el artículo de Weight-Space Programming— aplicada a modelos pequeños con modo thinking. Sin embargo, el propio autor advierte que es un artefacto de investigación, no una mejora general demostrada: las ganancias sobre la edición anterior son estadísticamente inconcluyentes y el modelo consume un 29,2% más de tokens generados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone LiquidAI/LFM3-1.7B), con cabeza de salida explícita copiada |
| Parametros totales | 1.990.945.600 valores almacenados (incluye cabeza duplicada); backbone original ~1,73B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M mixta; la cabeza copiada permanece en Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (standalone, con `output.weight` explícito) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer LFM3 de 1.7B parámetros de Liquid AI. Sobre ese backbone, la intervención de NotCherry no entrena nada: copia el tensor de embedding de entrada atado a la proyección de salida hacia un `output.weight` explícito, dejando el embedding de entrada sin cambios, y escala ocho block scales Q6_K en la fila de salida del token `</think>` (ID 124902) por 1.50. Todos los demás tensores —payload del backbone, embeddings de entrada y el resto de filas de salida— se preservan idénticos al checkpoint fuente. El cambio efectivo en esa fila copiada son 10 bytes.

La hipótesis es de "calibración de completado": forzar una transición más oportuna del razonamiento a la respuesta final. No se añade conocimiento nuevo ni se realiza RLHF, DPO ni entrenamiento por gradientes. El experimento se inspiró en el artículo Weight-Space Programming, aunque la intervención específica descrita allí para Qwen no se aplicó directamente a LFM3. El checkpoint fuente ya contenía la ablación de seguridad y la cuantización de AtomicChat, que este release hereda sin restaurar los rechazos de seguridad. No es un release oficial de Liquid AI ni de AtomicChat.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con modo thinking (fase de razonamiento previa a la respuesta final), cuyo cierre se modifica mediante la edición de pesos.
- Razonamiento matemático: evaluado en GSM8K y MATH-500 con resultados reportados por el autor.
- Seguimiento de instrucciones: evaluado con IFEval (métrica estricta de prompt).
- Generación de código: se está ejecutando una comprobación en HumanEval (resultados pendientes en el momento de la model card).
- Respuesta a preguntas de conocimiento: comprobación en curso sobre ARC-Challenge y BoolQ (resultados pendientes).
- Capacidad "uncensored" heredada de la ablación de seguridad de AtomicChat (no restaura rechazos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre control de la fase de razonamiento: el modelo sirve como banco de pruebas para estudiar cómo una edición mínima en el espacio de pesos (escalar la fila de `</think>`) afecta al momento en que el modelo deja de razonar y emite la respuesta, sin reentrenar.
- Experimentos de weight-space programming: permite replicar y comparar intervenciones sobre la cabeza de salida en modelos pequeños con modo thinking, usando el checkpoint original como referencia pareada.
- Evaluación de calibración de completado en matemáticas: útil para medir si forzar el cierre del razonamiento mejora la precisión en GSM8K y MATH-500 con decodificación de semilla fija, como hace el autor.
- Estudio del coste en tokens del razonamiento: el modelo documenta un incremento del 29,2% en tokens generados, lo que lo hace adecuado para analizar el trade-off entre precisión y verbosidad en modo thinking.
- Pruebas de seguimiento de instrucciones estrictas: sirve para evaluar IFEval con la métrica estricta de prompt y comparar contra ediciones previas del mismo backbone.
- Despliegue local en hardware modesto para prototipado: al ser un GGUF Q4_K_M de ~1,3 GB de repo, puede ejecutarse con llama.cpp en equipos de gama consumer para experimentar con el modo thinking.
- Análisis de robustez y seguridad: al heredar la ablación de seguridad de AtomicChat, permite estudiar el comportamiento de un modelo sin rechazos en contextos controlados de investigación.

## Benchmarks y rendimiento

Resultados reportados por el autor en evaluación pareada local (una respuesta de semilla fija por pregunta, sin votación por mayoría ni reintentos), comparando esta edición (output-only 1.50) contra una edición experimental anterior (tied 2.00), no contra el GGUF original ni el BF16 oficial. Mismo commit de llama.cpp, CUDA, thinking activado, 16.384 tokens generados, temperatura 0,1, top-k 50, top-p 1,0, repetition penalty 1,1 y semillas emparejadas por pregunta.

| Benchmark | Edición anterior (tied 2.00) | Esta edición (output-only 1.50) |
|---|---:|---:|
| GSM8K · 192 preguntas | 175/192 · 91,15% | 177/192 · 92,19% |
| MATH-500 · 128 preguntas | 115/128 · 89,84% | 117/128 · 91,41% |
| IFEval · 192 prompts (métrica estricta) | 176/192 · 91,67% | 178/192 · 92,71% |

| Métrica | Observación |
|---|---|
| Respuestas correctas netas adicionales | 2 por benchmark |
| Intervalo de confianza pareado al 95% (GSM8K) | −2,6 a +4,7 puntos porcentuales |
| Intervalo de confianza pareado al 95% (MATH-500) | −4,7 a +7,8 puntos porcentuales |
| Intervalo de confianza pareado al 95% (IFEval) | −3,1 a +5,2 puntos porcentuales |
| Tokens generados totales | 1.105.811 → 1.428.701 · +29,2% |

Todos los intervalos de precisión incluyen el cero, por lo que las ganancias son estadísticamente inconcluyentes. El autor indica además que una comprobación cruzada en HumanEval (164 tareas), ARC-Challenge (256 preguntas) y BoolQ (256 pasajes) estaba en curso y sus resultados se añadirían al finalizar. No se han publicado resultados de leaderboards independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (1,3 GB) y la cuantización Q4_K_M mixta con cabeza Q6_K, la huella es de pocos GB, apta para GPUs consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en RTX 4090, RTX 3090 y GPUs con 8 GB o más de VRAM en Q4.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU con al menos ~4-6 GB de VRAM libre para el modelo y el contexto; el autor no publica cifras exactas.
- Opciones de despliegue: llama.cpp (requiere build actual con soporte LFM3 y cabeza de salida explícita opcional; commit evaluado `fac3a894fc04901c3e5abaff457e024c6b52e04f`). Otros runners (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El único dato de coste es el incremento del 29,2% en tokens generados respecto a la edición anterior, que implica mayor tiempo de generación en modo thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modo thinking | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM3-1.7B ThinkExit (este) | 1,99B almacenados (~1,73B backbone) | No disponible | Sí, cierre editado | lfm-open-license-v1.0 | GGUF Q4_K_M/Q6_K | Edición experimental sin entrenamiento |
| AtomicChat/LFM3-1.7B-Uncensored-GGUF | ~1,73B | No disponible | Sí | no disponible en la información | GGUF | Checkpoint fuente, con ablación de seguridad |
| LiquidAI/LFM3-1.7B | 1,7B | No disponible | Sí | lfm-open-license-v1.0 | safetensors (BF16) | Modelo oficial de Liquid AI |

Las cifras de benchmark de esta edición no son comparables directamente con el modelo oficial ni con el GGUF original, ya que el autor solo reporta comparación pareada contra una edición experimental previa. No se dispone de datos de benchmarks del modelo oficial en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo describe como "research artifact, not a proven general upgrade".
- Ganancias estadísticamente inconcluyentes: todos los intervalos de confianza al 95% incluyen el cero; las mejoras de 2 respuestas por benchmark no son significativas.
- Mayor coste computacional: consume un 29,2% más de tokens generados que la edición anterior en la comparación pareada.
- Sin entrenamiento: no añade conocimiento nuevo; solo modifica la calibración del cierre del razonamiento.
- Hereda la ablación de seguridad de AtomicChat: no restaura los rechazos de seguridad y no es un release oficial de Liquid AI ni de AtomicChat.
- Solo inglés declarado; sin soporte multilingüe documentado.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo general de modelos pequeños.
- Sesgos conocidos: no documentados en la model card.
- Contaminación de benchmarks: el autor señala que la contaminación durante el pretraining upstream es desconocida.
- Ediciones más agresivas (3x y 4x) provocaron bucles en el token de cierre y fueron rechazadas; el rango seguro de escalado es estrecho.
- Requiere un build de llama.cpp con soporte LFM3 y cabeza de salida explícita; no se garantiza compatibilidad con otros runners.
- Licencia lfm-open-license-v1.0: conviene revisar sus términos para uso comercial antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NotCherry/LFM3-1.7B-ThinkExit-GGUF
- Checkpoint fuente (AtomicChat): https://huggingface.co/AtomicChat/LFM3-1.7B-Uncensored-GGUF
- Modelo upstream (Liquid AI): https://huggingface.co/LiquidAI/LFM3-1.7B
- Artículo Weight-Space Programming: https://rikiyat.github.io/blog/weight-space-programming/
- Instrucciones de ejecución: RUNNING.md (referenciado en la model card, dentro del repo)
- Licencia: LICENSE (referenciado en la model card, dentro del repo)
