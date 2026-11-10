# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B2-s5

## Resumen

Qwen3.5-9B-VK-OPD-think-R4-B2-s5 es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B, publicado por el usuario ohjoonhee en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino completo (full fine-tune) de las capas del modelo de lenguaje y la normalización final del modelo base, almacenado en bf16 y con 9.409.813.744 parámetros totales. Su propósito es estudiar la destilación on-policy en modo pensamiento (thinking) aplicada al conflicto entre conocimiento visual y conocimiento del mundo: qué ocurre cuando una imagen muestra algo que contradice lo que el modelo sabe que es típico en la realidad.

El modelo forma parte de la cuarta ronda de una receta denominada VK-OPD-think. En concreto, este checkpoint corresponde a la variante B2 (run r4_b2_prime_s5), semilla 5, en el paso 80 de 80, un paso fijado de antemano y no seleccionado a posteriori según los resultados. La variante B2 añade filas de premisa en el lado de la foto: una frase con un hecho típico seguida de una pregunta sobre la imagen, de modo que el estudiante aprenda a responder a partir de lo que muestra la foto aunque el texto afirme lo contrario.

La relevancia del checkpoint es fundamentalmente investigadora: mide si la destilación on-policy con profesores con contexto privilegiado puede mejorar la coherencia entre la respuesta visual y la respuesta de conocimiento del mundo sin degradar ninguna de las dos. El modelo conserva la licencia Apache 2.0 del modelo base y se distribuye en formato safetensors para transformers, con pipeline image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5; la model card no detalla la arquitectura interna |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la evaluación usa hasta 8.192 tokens de generación, no el contexto máximo) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.5-9B (revisión c202236235762e1c871ad0ccb60c8ee5ba337b9a) y aplica un ajuste fino completo de las capas del modelo de lenguaje y de la normalización final, en bf16. La cabeza MTP (multi-token prediction) del modelo base no se incluye en este checkpoint. Al ser un derivado directo, hereda la arquitectura multimodal de Qwen3.5, aunque la model card no especifica detalles internos como el número de capas, la dimensionalidad oculta o el mecanismo de atención.

El método es destilación on-policy en modo pensamiento. Los profesores son el modelo base congelado con contexto privilegiado, y la ventaja por token se define como log π_teacher − log π_student sobre las propias muestras del estudiante, implementada como KL inversa sobre tokens muestreados mediante la pérdida GRPO de TRL, sin recompensa y con beta 0. El turno de usuario del estudiante (foto, pregunta y cualquier premisa) es idéntico para estudiante y profesor. La ronda 4 reconstruye la receta de la ronda 1 y cambia una cosa por brazo: B0 es la receta original con nueva semilla; B1 añade un profesor de conocimiento mezclado; B2, el presente checkpoint, añade filas de premisa en el lado de la foto. El profesor de conocimiento mezcla por token 0.5 · A_K0 + 0.5 · A_KI, donde K0 es el modelo base sin foto y KI el modelo base con la foto y la instrucción de responder con lo generalmente cierto en el mundo real.

Los datos provienen de un pool sintético privado de fotos contrafactuales y normales con preguntas de conocimiento y de foto emparejadas. Los ítems de conocimiento se conservan solo si el profesor sin foto los responde correctamente en 2 de 2 muestras (548 CK y 130 NK); los ítems de foto no se filtran (1.995 CV y 246 NV). Se añaden filas de premisa (CF sobre fotos contrafactuales y NF sobre fotos normales). El entrenamiento usa una mezcla estática por paso de 6 CK, 2 NK, 4 CV, 2 CF, 1 NV y 1 NF, durante 80 pasos con lr 3e-6 constante tras 5 pasos de calentamiento, AdamW, grad clip 1.0, 16 prompts × 4 rollouts por paso, rollouts con thinking activado, temperatura 1.0 y hasta 4.096 tokens. Se emplean pesos maestros en fp32 y cómputo en bf16 con FSDP2 y offload a CPU sobre 4 GPUs H100.

## Capacidades

- Generación de texto y razonamiento en modo pensamiento (thinking on), con cadenas de razonamiento antes de la respuesta final.
- Comprensión de imágenes y respuesta a preguntas visuales (image-text-to-text), incluyendo fotos contrafactuales que contradicen expectativas.
- Resolución de conflicto entre conocimiento visual y conocimiento del mundo: responde desde la foto cuando la instrucción lo indica y desde el conocimiento general cuando corresponde.
- Manejo de premisas textuales que afirman un hecho típico, respondiendo a partir de la imagen cuando esta lo contradice.
- Conversación multi-turno (tag conversational en el repositorio).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, audio ni otros idiomas distintos del no especificado.

## Casos de uso

- Investigación sobre conflicto de conocimiento: el checkpoint sirve como punto de comparación controlado para estudiar si la destilación on-policy alinea las respuestas visuales y de conocimiento del mundo; su valor está en la evaluación C-Joint y All-Joint de la model card.
- Evaluación de robustez visual: permite medir cómo responde un modelo de 9B ante imágenes contrafactuales (por ejemplo, un objeto con un color o forma atípicos) frente al modelo base y a la ronda 1.
- Análisis de fidelidad a la imagen en pipelines de VQA: útil para probar si un sistema de pregunta-respuesta sobre imágenes prioriza la evidencia visual cuando el enunciado introduce un sesgo textual.
- Reproducción de experimentos de destilación: al documentarse semilla, paso, mezcla de datos e hiperparámetros, el checkpoint facilita replicar la receta B2 y comparar brazos B0, B1 y B2.
- Estudio de modos de pensamiento: al entrenarse con rollouts thinking on, permite analizar el efecto de las cadenas de razonamiento en tareas donde la evidencia visual y el conocimiento previo entran en conflicto.
- Base para ajustes posteriores en dominios visuales específicos: al ser un full fine-tune en bf16 con licencia Apache 2.0, puede servir de punto de partida para adaptaciones controladas, siempre con validación propia.

## Benchmarks y rendimiento

La model card reporta una evaluación interina sobre el benchmark privado RealViK-nat rc2, con 741 pares, juez Qwen3.5-27B (FP8) vía OpenRouter, thinking on, muestreo T 1.0, top-p 0.95, top-k 20, presence 1.5, 8.192 tokens y 1 muestra. Los números se sustituirán por la tabla completa de 1.054 pares.

| Modelo | CV | CK | NV | NK | CF | CI | KT | C-Joint | All-Joint |
|---|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B (thinking) | 82.5 | 71.1 | 93.5 | 95.4 | 86.4 | 67.3 | 97.3 | 56.1 | 52.0 |
| Ronda 1 (VK-OPD-think) | 85.3 | 97.0 | 93.3 | 97.6 | 81.2 | 93.0 | 96.8 | 82.6 | 76.7 |
| Este modelo | 85.3 | 90.4 | 95.3 | 96.5 | 87.4 | 81.6 | 97.0 | 76.5 | 71.9 |

C-Joint frente al base: +20,4 puntos porcentuales [+16,7; +24,2]; frente a la ronda 1: −6,1 puntos porcentuales [−9,2; −3,2], con intervalo de confianza del 95 % por bootstrap pareado de 2.000 remuestreos. Una sola semilla. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,41 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 18,8 GB, por lo que se necesita al menos esa cantidad más overhead de activaciones y caché KV.
- GPU recomendadas: el entrenamiento se realizó con 4× H100; para inferencia en bf16 son adecuadas A100 80 GB, H100 o GPUs con 24 GB o más si se cuantiza.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; en bf16 no cabe en tarjetas de 16 GB, y se requeriría cuantización no publicada por el autor.
- Opciones de despliegue: transformers (librería declarada); el repositorio está marcado como endpoints_compatible. No se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | C-Joint (RealViK-nat rc2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,41 B | no disponible | 56,1 | apache-2.0 | Hugging Face |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | 9,41 B | no disponible | 82,6 | apache-2.0 | Hugging Face |
| Este modelo (ronda 4, B2) | 9,41 B | no disponible | 76,5 | apache-2.0 | Hugging Face |

La comparación se limita a los derivados del mismo modelo base documentados en la model card; no se dispone de datos de benchmarks estándar para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no una versión de producción; el autor lo describe como "shared privately for research comparison; not a release".
- Los resultados son interinos: 741 pares de 1.054 y una sola muestra por condición; se sustituirán por la tabla completa con juez autoalojado.
- Una sola semilla: no hay estimación de varianza entre semillas, solo intervalos bootstrap pareados.
- El modelo rinde peor que la ronda 1 en C-Joint (−6,1 pp) y en All-Joint (71,9 frente a 76,7), así que la variante B2 no domina a la anterior.
- La evaluación usa un juez externo (Qwen3.5-27B FP8 vía OpenRouter), lo que introduce dependencia de un servicio y de un modelo juez concreto.
- No se documentan idiomas soportados ni sesgos conocidos; no se dispone de análisis de alucinación más allá de las métricas del benchmark privado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3.5-9B conviene verificar las condiciones del modelo base y de los datos sintéticos privados, que no se publican.
- No se incluye la cabeza MTP del modelo base, lo que puede afectar a pipelines que la esperen.
- No hay datos de cuantización publicados, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B2-s5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ronda 1 (VK-OPD-think): https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
