# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B2-s3

## Resumen

Qwen3.5-9B-VK-OPD-think-R4-B2-s3 es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B mediante un ajuste fino completo (full fine-tune) de las capas del modelo de lenguaje y la normalización final, almacenado en bf16. Lo desarrolla el usuario ohjoonhee y forma parte de la cuarta ronda de un experimento de destilación on-policy (VK-OPD, *on-policy distillation*) orientado al fenómeno del conflicto de conocimiento: qué ocurre cuando la información visual de una imagen contradice el conocimiento general del modelo. El modelo conserva la torre visual del modelo base y se distribuye con pipeline `image-text-to-text`.

El problema que aborda es concreto: un modelo multimodal tiende a responder con lo que «sabe» del mundo en lugar de con lo que muestra la fotografía, o al revés, y pierde coherencia cuando se le pide mantener ambas respuestas correctas en la misma conversación. La receta emplea dos profesores congelados (el propio modelo base con contexto privilegiado) y optimiza la ventaja por token mediante una KL inversa sobre las muestras del estudiante, implementada a través de la pérdida GRPO de TRL sin recompensa explícita (beta 0). La innovación de esta ronda B2 es la incorporación de filas de premisa en el lado de la foto: una frase con un hecho típico delante de la pregunta visual, para que el estudiante aprenda a responder desde la imagen aunque el texto afirme lo habitual.

Con 9.409.813.744 parámetros totales y un repositorio de 18,8 GB, se trata de un checkpoint intermedio (paso 80 de 120, fijado de antemano) compartido de forma privada para comparación de investigación, no una versión de producción. Su relevancia radica en que documenta con métricas pareadas un método reproducible para mitigar el sesgo de conocimiento previo en modelos multimodales, con una mejora de +18,5 puntos porcentuales en la métrica conjunta C-Joint frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), torre visual + capas de lenguaje; fine-tune completo de capas LM y norm final |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (los rollouts de entrenamiento usan hasta 4.096 tokens; la evaluación, 8.192) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo de las capas del modelo de lenguaje y la normalización final, en bf16, excluyendo la cabeza MTP del modelo base. La torre visual se mantiene del modelo original. El entrenamiento sigue la receta de destilación on-policy VK-OPD: dos profesores congelados (el modelo base con contexto privilegiado) generan la señal, y la ventaja por token se calcula como log π_profesor − log π_estudiante sobre las propias muestras del estudiante, mediante KL inversa sobre tokens muestreados a través de la pérdida GRPO de TRL, sin recompensa y con beta 0. El turno de usuario (foto, pregunta y premisa) es idéntico para estudiante y profesor.

El brazo B2 de esta ronda añade filas de premisa en el lado de la foto: la misma pregunta visual precedida de una frase con un hecho típico, sobre fotos contrafactuales y normales. El profesor de conocimiento (K) es un blend con ventaja por token 0,5 · A_K0 + 0,5 · A_KI, donde K0 es el modelo base sin foto y KI el modelo base con foto y una instrucción de responder con lo generalmente cierto. El pool de datos es sintético y privado: 548 ítems CK y 130 NK (filtrados exigiendo que el profesor sin foto acierte 2 de 2 muestras), 1.995 CV y 246 NV sin filtro, más las filas de premisa CF y NF. La mezcla estática por paso es de 6 CK, 2 NK, 4 CV, 2 CF, 1 NV y 1 NF. Se entrenan 120 pasos con lr 3e-6 constante tras 5 pasos de calentamiento, AdamW, grad clip 1.0, 16 prompts × 4 rollouts por paso, thinking activado, temperatura 1.0 y hasta 4.096 tokens, con pesos maestros en fp32, cómputo en bf16 y FSDP2 con offload a CPU sobre 4× H100. Este checkpoint corresponde al paso 80.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado durante el entrenamiento y la evaluación.
- Comprensión de imagen y texto combinados (pipeline `image-text-to-text`): responde preguntas sobre el contenido de una fotografía.
- Respuesta desde la evidencia visual frente al conocimiento previo: cuando la imagen contradice lo típico, el modelo está entrenado para responder lo que se muestra.
- Respuesta desde el conocimiento general cuando se le indica explícitamente inspeccionar la foto o cuando la pregunta no depende de ella.
- Manejo de premisas textuales: responde desde la imagen aunque el enunciado afirme un hecho típico contrario.
- Coherencia conjunta: mantiene respuestas correctas simultáneas a preguntas de foto y de conocimiento sobre la misma imagen (métrica C-Joint).
- Conversacional multi-turno (tag `conversational` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Verificación visual en inspección de producto: dado un catálogo de fotos de artículos, el modelo responde qué se ve realmente en cada imagen aunque el artículo sea de una categoría con apariencia típica distinta, gracias a su entrenamiento con fotos contrafactuales y filas de premisa.
- Moderación de contenido con contexto visual: comprobar si una imagen muestra lo que el texto adjunto afirma, detectando discrepancias entre la descripción del usuario y el contenido real de la foto.
- Asistentes de accesibilidad: describir imágenes a personas con discapacidad visual respondiendo primero a lo que aparece en la foto y, si se solicita, complementando con conocimiento general del mundo.
- Documentación técnica y científica: responder preguntas sobre figuras, diagramas o capturas donde el resultado observado difiere de lo esperado por la teoría, manteniendo separadas ambas respuestas.
- Atención al cliente con evidencia fotográfica: gestionar conversaciones multi-turno en las que el cliente adjunta una foto de un defecto y el modelo debe priorizar la evidencia visual sobre la descripción textual del producto.
- Evaluación de modelos multimodales en investigación: servir como checkpoint de referencia para estudiar conflicto de conocimiento, con métricas pareadas CV/CK/NV/NK y conjuntas C-Joint y All-Joint reproducibles.
- Pipelines de anotación de datos: generar pares de pregunta-respuesta sobre imágenes normales y contrafactuales para construir datasets de entrenamiento con control explícito del sesgo de conocimiento previo.

## Benchmarks y rendimiento

Evaluación interina sobre el benchmark privado RealViK-nat rc2 (741 pares, juez Qwen3.5-27B en FP8 vía OpenRouter, thinking activado, muestreo T 1.0, top-p 0.95, top-k 20, presence 1.5, 8.192 tokens, 1 muestra). Condiciones: CV/CK = foto contrafactual respondiendo desde la foto / desde conocimiento; NV/NK = lo mismo sobre foto normal; CF = CV con una frase de hecho típico delante; CI = CK con instrucción de inspeccionar la foto; KT = pregunta de conocimiento sin foto; C-Joint = CV y CK ambas correctas; All-Joint = CV, CK, NV y NK todas correctas.

| Modelo | CV | CK | NV | NK | CF | CI | KT | C-Joint | All-Joint |
|---|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B (thinking) | 82,5 | 71,1 | 93,5 | 95,4 | 86,4 | 67,3 | 97,3 | 56,1 | 52,0 |
| Ronda 1 (VK-OPD-think) | 85,3 | 97,0 | 93,3 | 97,6 | 81,2 | 93,0 | 96,8 | 82,6 | 76,7 |
| Este modelo (r4_b2_prime_s3, paso 80) | 82,9 | 90,4 | 94,3 | 97,2 | 85,6 | 79,6 | 97,2 | 74,6 | 70,3 |

C-Joint frente al modelo base: +18,5 puntos porcentuales (IC 95 % [+14,6, +22,4], bootstrap pareado de 2.000 remuestras). Frente a la ronda 1: −8,0 puntos porcentuales (IC 95 % [−11,1, −5,0]). Los resultados provienen de una sola semilla y de una tabla interina que será sustituida por la tabla completa de 1.054 pares con juez autoalojado. No se han publicado resultados en benchmarks públicos estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, más memoria para activaciones, caché KV y la torre visual; en la práctica se recomienda un mínimo de 24 GB y, para contexto largo (8.192 tokens), 40 GB o más.
- Cuantización a 8 bits: en torno a 9-10 GB de pesos, viable en GPUs consumer de 16 GB con contexto moderado; a 4 bits, unos 5-6 GB, viable en 8-12 GB con contexto reducido. Los tipos de cuantización publicados no están disponibles; habría que generarlos a partir de los safetensors en bf16.
- GPUs recomendadas: H100 o A100 80 GB para el régimen de entrenamiento y evaluación del autor (4× H100 con FSDP2); para inferencia, A100 40 GB, L40S o RTX 4090 24 GB en bf16 con contexto moderado.
- Cabe en GPU consumer: sí en RTX 4090 (24 GB) en bf16 con contexto limitado, y en RTX 3090/4080 con cuantización 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | C-Joint (RealViK-nat rc2) |
|---|---|---|---|---|---|
| Qwen3.5-9B (base, thinking) | 9,4 B | no disponible | apache-2.0 | Modelo multimodal generalista | 56,1 |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | 9,4 B | no disponible | apache-2.0 | Destilación on-policy, sin filas de premisa | 82,6 |
| Qwen3.5-9B-VK-OPD-think-R4-B2-s3 (este modelo) | 9,4 B | no disponible | apache-2.0 | Destilación on-policy con profesor de conocimiento mezclado y premisas | 74,6 |

La comparación se limita a los tres checkpoints de la misma familia evaluados en el mismo benchmark privado; no se dispone de datos de benchmarks públicos que permitan comparar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Es un checkpoint de investigación intermedio (paso 80 de 120), no una versión de producción; el autor lo describe como «compartido de forma privada para comparación de investigación, no un lanzamiento».
- Los resultados provienen de una sola semilla y de una evaluación interina (741 de 1.054 pares) con un juez externo vía OpenRouter; las cifras pueden cambiar en la tabla completa.
- Rendimiento inferior a la ronda 1 en C-Joint (−8,0 pp) y en CI (79,6 frente a 93,0), lo que sugiere una pérdida de la capacidad de inspeccionar la foto bajo instrucción explícita.
- El modelo base excluye la cabeza MTP, por lo que no se puede usar decodificación especulativa con esa cabeza tal cual.
- Riesgo de alucinación no cuantificado en la información disponible; el entrenamiento se centra en conflicto de conocimiento, no en fidelidad general.
- Sesgos conocidos: no disponibles; el pool de entrenamiento es sintético y privado, sin documentación sobre su composición demográfica o cultural.
- Idiomas soportados no documentados; no hay garantía de comportamiento multilingüe más allá del modelo base.
- Licencia apache-2.0, que permite uso comercial, pero al ser un derivado de Qwen3.5-9B conviene revisar también las condiciones del modelo base.
- Sin soporte documentado de tool calling ni de razonamiento multi-paso orientado a agentes; no se recomienda asumirlos en producción.
- El contexto máximo no está especificado; los 8.192 tokens de la evaluación son un parámetro de muestreo, no necesariamente el límite arquitectónico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B2-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint de la ronda 1: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
- Repositorio TRL (pérdida GRPO empleada): no disponible en la información proporcionada
- Paper o blog del método VK-OPD: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
