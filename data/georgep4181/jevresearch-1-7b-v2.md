# georgep4181/jevresearch-1.7b-v2

## Resumen

jevresearch-1.7b-v2 es un modelo de decisión compacto desarrollado por el usuario georgep4181, publicado bajo licencia Apache 2.0. No es un modelo generativo al uso: parte del backbone Qwen3-1.7B-Base, al que se le elimina la cabeza de lenguaje y se le añade una cabeza pointer que puntúa directamente un conjunto de opciones explícitas. Dado un estado (un ticket de soporte, una reseña, un documento largo) y una pregunta con opciones enumeradas, devuelve una distribución de probabilidad calibrada sobre esas opciones.

El modelo está pensado como sustituto de clasificadores y de llamadas a modelos generativos en tareas de decisión acotadas: clasificación de intenciones, análisis de sentimiento, polaridad y recuperación de bloques en documentos largos. Su propuesta de valor es doble: por un lado, mejora a la línea base de producción declarada por el autor (Jev jev-1.13.0) en precisión media (0,8780 frente a 0,8368) y en calibración (ECE medio de 0,0239 frente a 0,0826); por otro, se entrena en una única RTX 4090 en una hora, lo que lo hace reproducible y barato de iterar.

La relevancia actual reside en su enfoque instruction-conditioned con calibración explícita y soporte declarado de contexto largo (hasta 262k tokens en pruebas de recuperación de bloques). El repositorio ocupa 0,3 GB e incluye adaptadores LoRA (70,8M de parámetros entrenables, el 3,95% de los 1,79B totales) más la cabeza pointer completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3-1.7B-Base sin LM head, con cabeza pointer de producto escalar y máscara de rol 4D |
| Parámetros totales | 1,79B (backbone) + 70,8M entrenables (LoRA + cabeza) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 262k tokens en pruebas de recuperación de bloques; contexto nominal del backbone no especificado |
| Tipos de cuantización | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA + cabeza) |

## Arquitectura y entrenamiento

El backbone es Qwen3-1.7B-Base con la cabeza de lenguaje eliminada; no hay generación de texto. El estado se serializa en un registro plano sanitizado y se concatena con la pregunta y con cada opción, compartiendo posiciones RoPE para que todas las opciones se puntúen bajo el mismo encuadre posicional. Una máscara de atención 4D restringe la atención según el rol del token (estado, pregunta, opción), de modo que las opciones no se ven entre sí y la puntuación de una opción es invariante al conjunto de opciones presentes. La cabeza pointer calcula el producto escalar entre la posición `decide` de la pregunta y la posición `close` de cada opción, proyectado a 256 dimensiones con escala aprendible; la magnitud de la señal es relevante (una ablación con cabeza coseno colapsó las tareas de cardinalidad, −0,12 de precisión). La calibración se aplica mediante una temperatura global de 1,720 ajustada por minimización de NLL sobre un 5% de retención del mix de entrenamiento, nunca sobre el conjunto de evaluación.

El entrenamiento se realizó en una sola RTX 4090 (24 GB) en bf16 con gradient checkpointing, durante 3600 s (6807 pasos, batch 8, 54.455 filas vistas, 110% de cobertura de una pasada), con un pico de VRAM de 15,5 GB. Los adaptadores LoRA usan r=64, α=128 y dropout 0,05 sobre todas las proyecciones de atención y MLP. El optimizador es AdamW con lr 1e-4 para LoRA y 1e-3 para la cabeza, weight decay 0,01, warmup lineal del 3% y warmdown lineal del 30%, semilla 16. El mix de datos consta de 51.847 preguntas: clinc_oos completo con OOS (20.000), Banking77 completo (10.000), SST-5 (10.000), IMDB sin etiqueta y en variante emparejada (6.000 cada uno), 6.000 preguntas de Banking77 con distractores duros por trigramas vecinos y 40 filas de relevancia/needle de contexto largo. Los tipos de pregunta entrenados son `choice` (multicategoría), `noul` (sí/no), `score` (ordinal) y recuperación de bloques en documentos largos.

## Capacidades

- Clasificación de intenciones multicategoría: 151 vías en clinc y 77 vías en Banking77.
- Análisis de sentimiento de cinco clases (SST-5) y polaridad binaria (IMDB), incluyendo variante emparejada de elección.
- Puntuación ordinal mediante preguntas de tipo `score`.
- Preguntas de sí/no mediante el tipo `noul`.
- Recuperación de bloques y needle questions sobre documentos largos, con precisión declarada del 100% hasta 256k tokens en las pruebas del autor.
- Predicción selectiva: a confianza ≥ 0,9 cubre entre el 78% y el 95% de cada tarea con una precisión del 98,6% al 100%.
- Puntuación invariante al conjunto de opciones gracias a la máscara de rol 4D.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales: es un modelo de decisión puro.
- Soporte multilingüe: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica la intención del ticket entre las categorías del sistema (por ejemplo, cancelación, reembolso, bug) y devuelve una confianza calibrada que permite derivar automáticamente los casos de alta certeza y escalar los dudosos. La calibración ECE de 0,024 hace que el umbral de confianza sea directamente utilizable en producción.
- Moderación y triaje de reseñas: con polaridad IMDB a 0,9667 de precisión y ECE de 0,0184, se puede usar para priorizar reseñas negativas o detectar sentimiento en flujos de gran volumen, donde el coste por decisión importa más que la generación de texto.
- Análisis de sentimiento fino en encuestas: la tarea SST-5 (0,58 de precisión, la más difícil del conjunto) sirve para segmentar opiniones en cinco niveles cuando se necesita granularidad, aceptando que es la tarea con menor rendimiento y mayor ECE (0,0370).
- Recuperación de bloques en contratos y documentación larga: con precisión declarada de 1,000 en 8k, 64k y 256k tokens, el modelo puede localizar la sección relevante de un documento extenso para responder preguntas de aguja sin necesidad de generación.
- Predicción selectiva en pipelines automatizados: gracias a la cobertura del 78–95% a confianza ≥ 0,9 con precisión del 98,6–100%, encaja en flujos donde se automatiza solo lo seguro y se enruta el resto a revisión humana.
- Clasificación con distractores duros: el mix de entrenamiento incluye 6.000 preguntas de Banking77 con distractores por trigramas vecinos, lo que lo hace adecuado para distinguir intenciones semánticamente próximas (por ejemplo, "cancelar suscripción" frente a "cancelar pedido").
- Sustitución de llamadas a LLM generativo en tareas de etiquetado: al no generar texto y escalar el coste con el número de opciones en lugar de con la longitud de salida, reduce latencia y coste en clasificación masiva.

## Benchmarks y rendimiento

Protocolo jev-eval, n=300 por tarea, instrucciones idénticas para todos los modelos comparados:

| Tarea | n | Precisión | Macro F1 | ECE | AUROC |
|---|---|---|---|---|---|
| clinc (151 vías) | 300 | 0,9600 | 0,9592 | 0,0238 | 0,962 |
| intent (Banking77, 77 vías) | 300 | 0,9167 | 0,9153 | 0,0243 | 0,914 |
| sentiment5 (SST-5) | 300 | 0,5800 | 0,5795 | 0,0370 | 0,609 |
| polarity (IMDB) | 300 | 0,9667 | 0,9667 | 0,0184 | 0,964 |
| polarity-choice (IMDB emparejado) | 300 | 0,9667 | 0,9667 | 0,0159 | 0,963 |
| Media | | 0,8780 | | 0,0239 | |

Comparación agregada declarada por el autor:

| Modelo | Precisión media | ECE medio |
|---|---|---|
| jevresearch-1.7b-v2 | 0,8780 | 0,0239 |
| Jev jev-1.13.0 (línea base) | 0,8368 | 0,0826 |
| Qwen3-2B zero-shot (d3:2b) | 0,8393 | 0,0593 |

Ablaciones publicadas:

| Variante | Precisión media | ECE medio |
|---|---|---|
| v2 (este modelo) | 0,8780 | 0,0239 |
| Qwen3-4B LoRA | 0,8760 | 0,0251 |
| + KD desde etiquetas de Qwen3-2B | 0,8780 | 0,0335 |
| Full FT con Adam 8-bit | 0,8707 | 0,0389 |

Contexto largo (recuperación de bloques, needle questions, n=6 por longitud): 8k → 1,000; 64k → 1,000; 256k → 1,000.

## Requisitos de hardware

- VRAM de entrenamiento declarada: pico de 15,5 GB en una RTX 4090 de 24 GB con bf16 y gradient checkpointing.
- VRAM de inferencia: no disponible de forma explícita; el repositorio ocupa 0,3 GB y el backbone es de 1,79B, por lo que en bf16 el peso ronda los 3,5 GB más la cabeza y el overhead del harness.
- GPU recomendadas: RTX 4090 para entrenamiento e inferencia; cualquier GPU consumer con al menos 8–12 GB debería acomodar el modelo en bf16 o fp16, aunque no se publican cifras oficiales.
- Cabe en GPU consumer: sí, según el perfil de entrenamiento en una RTX 4090; no se documentan pruebas en GPUs de gama inferior.
- Opciones de despliegue: el modelo no es un `AutoModelForCausalLM` estándar; requiere el harness `jev_model` (`train.py` con `DecisionModel`, `serve.py` con API HTTP estilo OpenAI en el endpoint `/v1/systemone`). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media (jev-eval) | ECE medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jevresearch-1.7b-v2 | 1,79B (70,8M entrenables) | hasta 262k en pruebas | 0,8780 | 0,0239 | Apache 2.0 | Hugging Face, requiere harness propio |
| Jev jev-1.13.0 (línea base) | no disponible | no disponible | 0,8368 | 0,0826 | no disponible | línea base de producción del autor |
| Qwen3-2B zero-shot (d3:2b) | ~2B | no disponible | 0,8393 | 0,0593 | no disponible | no disponible |
| Qwen3-4B LoRA (ablación) | ~4B | no disponible | 0,8760 | 0,0251 | Apache 2.0 (base) | no publicado como checkpoint |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso, y requiere el harness `jev_model` para la inferencia.
- El rendimiento en SST-5 es notablemente inferior al resto (0,58 de precisión, ECE 0,0370); es la tarea más débil del conjunto y conviene no extrapolar los buenos resultados de clinc o IMDB a sentimiento fino.
- Los benchmarks son internos del autor (protocolo jev-eval, n=300 por tarea) y no se han validado de forma independiente; las comparaciones con Jev jev-1.13.0 y Qwen3-2B zero-shot provienen de la misma model card.
- El contexto largo se valida con n=6 por longitud en tareas de recuperación de bloques; no hay evidencia publicada sobre razonamiento complejo en contextos de 262k tokens.
- Idiomas soportados no declarados; los datasets de entrenamiento son en inglés (clinc_oos, Banking77, SST-5, IMDB), por lo que el rendimiento en castellano es desconocido y probablemente inferior.
- Riesgo de alucinación: al puntuar opciones explícitas el riesgo de inventar contenido es bajo, pero el modelo puede asignar alta confianza a opciones incorrectas fuera de la distribución de entrenamiento; la calibración se ajustó sobre el mix de entrenamiento y puede degradarse con dominios nuevos.
- La temperatura de calibración (1,720) está ajustada para este mix concreto; recalibrar si se cambia el dominio o la formulación de las preguntas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B-Base tiene sus propios términos que conviene verificar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción más allá de la declaración del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/georgep4181/jevresearch-1.7b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio `jev_model` (harness de inferencia): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
