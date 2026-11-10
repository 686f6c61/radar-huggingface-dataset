# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B0-s5

## Resumen

Qwen3.5-9B-VK-OPD-think-R4-B0-s5 es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B mediante ajuste fino completo de las capas del modelo de lenguaje y la normalización final, almacenado en bf16. Lo publica el usuario ohjoonhee en Hugging Face como parte de una línea de experimentos sobre destilación on-policy (VK-OPD, "thinking mode") orientada a resolver conflictos de conocimiento, es decir, situaciones en las que lo que muestra una imagen contradice lo que el modelo sabe del mundo. Este checkpoint corresponde a la ronda 4, brazo B0 (receta de la ronda 1 con nueva semilla, semilla 5), en el paso 80 de 80, fijado de antemano.

El modelo conserva la arquitectura multimodal de Qwen3.5 (pipeline image-text-to-text) y sus 9.409.813.744 parámetros totales, con licencia Apache 2.0. No es un lanzamiento de producción: el autor lo describe explícitamente como un checkpoint compartido en privado para comparación en investigación, no una release. Su interés radica en que demuestra una mejora sustancial en la consistencia entre percepción visual y conocimiento previo: el emparejamiento conjunto CV+CK (acertar tanto la respuesta contrafactual desde la foto como la respuesta de conocimiento del mundo) pasa del 56,1 % en el modelo base al 82,5 % en este checkpoint.

La relevancia práctica es doble: por un lado, aporta evidencia reproducible sobre cómo la destilación on-policy con profesores privilegiados puede mitigar el sesgo de conocimiento previo en modelos visión-lenguaje; por otro, al estar construido sobre Qwen3.5-9B, hereda su ventana de contexto, su soporte multilingüe y sus capacidades de razonamiento, aunque el ajuste se centra en el comportamiento ante conflictos foto-conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, pipeline image-text-to-text); ajuste fino completo de capas LM y norm final |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo sobre las capas del modelo de lenguaje y la normalización final. La cabeza MTP (multi-token prediction) del modelo base no se incluye en el checkpoint. El entrenamiento emplea destilación on-policy: los profesores son el modelo base congelado con contexto privilegiado y la ventaja por token se calcula como log π_teacher − log π_student sobre las propias muestras del estudiante, usando la pérdida GRPO de TRL con KL inversa sobre tokens muestreados, sin recompensa y con beta 0.

El profesor de foto (V) recibe la imagen más un mensaje de sistema que instruye a responder desde lo que realmente se muestra, aunque difiera de lo típico. El profesor de conocimiento (K) es el modelo base sin la foto. Los datos provienen de un pool sintético privado con fotos contrafactuales y normales emparejadas con preguntas de conocimiento y de foto; los ítems de conocimiento se conservan solo si el profesor sin foto acierta en 2 de 2 muestras (548 ítems CK, 130 NK), mientras que los de foto no se filtran (1.995 CV, 246 NV). Cada paso usa una mezcla estática de 6 CK, 2 NK, 6 CV y 2 NV. El entrenamiento dura 80 pasos, con lr 3e-6 constante tras 5 pasos de warmup, AdamW, grad clip 1.0, 16 prompts × 4 rollouts por paso, thinking activado, temperatura 1.0 y hasta 4.096 tokens; pesos maestros en fp32, cómputo en bf16 con FSDP2 y offload a CPU, sobre 4× H100.

## Capacidades

- Generación de texto y razonamiento en modo thinking, heredados de Qwen3.5-9B.
- Comprensión de imagen y respuesta a preguntas visuales (image-text-to-text).
- Respuesta fiel a lo mostrado en la imagen incluso cuando contradice el conocimiento previo (comportamiento entrenado explícitamente).
- Respuesta a preguntas de conocimiento del mundo sin imagen, con rendimiento prácticamente intacto respecto al base (KT 97,0 frente a 97,3).
- Inspección de la foto bajo instrucción explícita (CI 91,0).
- Robustez ante frases de hecho típico que preceden a la pregunta visual (CF 80,4).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Verificación de productos o inventario por imagen: el modelo responde a partir de lo que aparece en la foto aunque el objeto se parezca a un modelo típico distinto, lo que reduce errores en catálogos donde la apariencia real difiere de la esperada.
- Inspección de documentos y tickets escaneados: al priorizar el contenido visible sobre el formato habitual, es útil para extraer datos de facturas o etiquetas con diseños no estándar.
- Moderación de contenido visual con contexto: permite describir y clasificar imágenes atípicas sin que el conocimiento previo del modelo "corrija" lo que se ve.
- Asistentes de accesibilidad: descripción de imágenes para personas con discapacidad visual, con énfasis en lo realmente presente en la escena.
- Evaluación de modelos visión-lenguaje: sirve como referencia para medir el sesgo de conocimiento previo en pipelines de investigación, gracias a sus métricas de emparejamiento C-Joint y All-Joint.
- Investigación en destilación on-policy: reproducible como punto de partida para experimentos con profesores privilegiados y conflictos de conocimiento, dado que la receta y las condiciones están documentadas.
- Análisis de imágenes científicas o técnicas: cuando la imagen muestra un resultado contraintuitivo, el modelo está entrenado para no sustituirlo por la expectativa habitual.

## Benchmarks y rendimiento

Evaluación interina sobre el benchmark privado RealViK-nat rc2 (741 pares), juez Qwen3.5-27B (FP8) vía OpenRouter, thinking activado, muestreo T 1.0, top-p 0.95, top-k 20, presence 1.5, 8.192 tokens, 1 muestra. Condiciones: CV/CK = foto contrafactual respondida desde la foto / desde conocimiento; NV/NK = lo mismo con foto normal; CF = CV con frase de hecho típico; CI = CK con instrucción de inspeccionar la foto; KT = pregunta de conocimiento sin foto.

| Modelo | CV | CK | NV | NK | CF | CI | KT | C-Joint | All-Joint |
|---|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B (thinking) | 82,5 | 71,1 | 93,5 | 95,4 | 86,4 | 67,3 | 97,3 | 56,1 | 52,0 |
| Ronda 1 (VK-OPD-think) | 85,3 | 97,0 | 93,3 | 97,6 | 81,2 | 93,0 | 96,8 | 82,6 | 76,7 |
| Este modelo | 85,2 | 96,9 | 93,7 | 97,4 | 80,4 | 91,0 | 97,0 | 82,5 | 77,2 |

C-Joint frente al base: +26,3 pp [+22,7, +30,1]; frente a la ronda 1: −0,1 pp [−2,6, +2,0] (bootstrap pareado al 95 %, 2.000 remuestreos, una semilla).

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,41 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 18,8 GB; en fp16/bf16 se recomienda al menos 24 GB de VRAM, y en cuantización de 8 bits en torno a 10-11 GB (estimación, no confirmada por el autor).
- GPU recomendadas: H100 o A100 para bf16 sin compromisos; RTX 4090 (24 GB) puede alojar los pesos en bf16 pero con margen ajustado para contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con bf16 y contexto moderado, o en GPUs de 16 GB si se cuantiza a 8 bits (no se publican pesos GGUF).
- Opciones de despliegue: transformers (formato nativo safetensors); vLLM, TGI, llama.cpp u Ollama no están confirmados por el autor.
- Latencia y throughput: no disponibles.
- Entrenamiento: 4× H100 con FSDP2 y offload a CPU, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | C-Joint (RealViK-nat rc2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 9,41 B | no disponible | 82,5 | Apache 2.0 | Hugging Face (checkpoint de investigación) |
| Qwen3.5-9B (base) | 9,41 B | no disponible | 56,1 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | 9,41 B | no disponible | 82,6 | Apache 2.0 | Hugging Face |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación, no una release: el autor lo comparte para comparación privada y los números son interinos (741 de 1.054 pares, juez servido externamente).
- Resultados basados en una sola semilla; la comparación con la ronda 1 tiene un intervalo de confianza que incluye el cero.
- El entrenamiento se apoya en un pool sintético privado, no reproducible de forma directa.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste prioriza la fidelidad a la imagen, lo que podría aumentar respuestas literales erróneas en escenas ambiguas.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; el ajuste se realizó sobre datos sintéticos sin especificar cobertura lingüística.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene revisar las condiciones del modelo base.
- La cabeza MTP del modelo base no está incluida, lo que puede afectar a pipelines que dependan de decodificación especulativa.
- No hay pesos cuantizados publicados ni confirmación de soporte en vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B0-s5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint de la ronda 1: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
