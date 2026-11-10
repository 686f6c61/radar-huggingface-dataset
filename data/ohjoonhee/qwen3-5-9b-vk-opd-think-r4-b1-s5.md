# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B1-s5

## Resumen
Qwen3.5-9B-VK-OPD-think-R4-B1-s5 es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B, desarrollado por el autor ohjoonhee. No se trata de un modelo nuevo entrenado desde cero, sino de un fine-tune completo de las capas del modelo de lenguaje y de la normalización final (bf16) sobre la base de Qwen, con el objetivo de estudiar y mitigar conflictos de conocimiento en modelos multimodales. El problema que aborda es concreto: cuando una imagen contradice el conocimiento general del modelo, este debe decidir si responde según lo que ve o según lo que sabe del mundo, y la receta VK-OPD busca mejorar esa articulación.

El modelo pertenece a la ronda 4 de una familia de experimentos de destilación on-policy (VK-OPD) en modo thinking. Esta variante concreta (B1, semilla 5, paso 80) emplea un profesor de conocimiento mezclado: mitad sin foto (K0) y mitad con foto más la instrucción "generalmente cierto" (KI). El resultado es un checkpoint que mejora sustancialmente la coherencia conjunta frente a la base, aunque queda por debajo de la ronda 1 en ese mismo indicador.

Es relevante ahora porque documenta de forma transparente una metodología de destilación on-policy aplicada a un problema de alineación multimodal (conflicto foto-conocimiento), con evaluación interina sobre un benchmark privado y con todos los hiperparámetros expuestos. No es un modelo para producción: el propio autor lo describe como "compartido privadamente para comparación en investigación; no es un lanzamiento".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text), basado en Qwen3.5; fine-tune completo de capas LM y norm final |
| Parametros totales | 9.409.813.744 (9,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenamiento con rollouts de hasta 4.096 tokens; evaluación con 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-9B (revisión c202236235762e1c871ad0ccb60c8ee5ba337b9a) y aplica un fine-tune completo de las capas del modelo de lenguaje y de la normalización final, almacenado en bf16. La cabeza MTP (multi-token prediction) del modelo base no se incluye en este checkpoint. La arquitectura subyacente es la de Qwen3.5, un transformer multimodal con capacidad image-text-to-text, aunque la model card no detalla la composición interna de capas ni el mecanismo de atención.

El entrenamiento sigue la receta de destilación on-policy VK-OPD: los profesores son el modelo base congelado con contexto privilegiado, y la ventaja por token se calcula como log π_profesor − log π_estudiante sobre las propias muestras del estudiante (KL inversa sobre tokens muestreados, implementada mediante la pérdida GRPO de TRL, sin recompensa y con beta 0). El turno de usuario del estudiante (foto, pregunta y premisa opcional) es idéntico para estudiante y profesor. En esta variante B1, el profesor de conocimiento es una mezcla: ventaja por token 0,5 · A_K0 + 0,5 · A_KI, donde K0 es el modelo base sin foto y KI es el modelo base con foto y la instrucción "responde con lo que es generalmente cierto en el mundo real, aunque la foto muestre algo distinto". El profesor de foto (V) recibe la foto con la instrucción de responder según lo mostrado.

Los datos provienen de un pool sintético privado de fotos contrafactuales y normales con preguntas emparejadas de conocimiento y de foto. Los ítems de conocimiento se conservan solo si el profesor sin foto los acierta en 2 de 2 muestras (548 ítems CK y 130 NK); los de foto no se filtran (1.995 CV y 246 NV). Por paso se usan 6 CK, 2 NK, 6 CV y 2 NV. El entrenamiento consta de 80 pasos con lr 3e-6 constante tras 5 pasos de warmup, AdamW, grad clip 1.0, 16 prompts × 4 rollouts por paso, rollouts con thinking activado, temperatura 1.0 y hasta 4.096 tokens. Se usaron pesos maestros en fp32, cómputo en bf16 con FSDP2 y offload a CPU sobre 4× H100.

## Capacidades
- Generación de texto y razonamiento en modo thinking (rollouts con thinking activado durante el entrenamiento).
- Comprensión de imágenes y respuesta a preguntas visuales (pipeline image-text-to-text).
- Articulación explícita entre lo que muestra una imagen y el conocimiento general del mundo, incluyendo casos en los que la foto contradice un hecho típico.
- Manejo de preguntas de conocimiento con y sin foto, y de premisas o instrucciones que modifican la prioridad entre evidencia visual y conocimiento previo.
- Conversación multi-turno (tag conversational en el modelo).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso
- Investigación sobre conflicto de conocimiento en modelos multimodales: el checkpoint sirve como punto de comparación controlado frente a la base y a la ronda 1 para estudiar cómo la destilación on-policy altera la preferencia entre evidencia visual y conocimiento previo, con métricas desglosadas por condición (CV, CK, NV, NK, CF, CI, KT).
- Evaluación de recetas de destilación on-policy: al estar fijados semilla, paso y mezcla de profesores, permite reproducir y contrastar variantes (B0, B1, B2) en un entorno experimental, útil para investigadores que trabajan con KL inversa y GRPO de TRL.
- Análisis de robustez ante instrucciones contradictorias: las condiciones CF (frase de hecho típico antepuesta) y CI (instrucción de inspeccionar la foto) permiten medir la sensibilidad del modelo a la formulación, relevante para diseñar prompts en sistemas de VQA.
- Estudio de la estabilidad del entrenamiento en modo thinking: con 80 pasos y lr constante, el checkpoint documenta el efecto de una receta corta sobre un modelo de 9B, útil para calibrar presupuestos de cómputo en experimentos de alineación.
- Base para ablaciones de profesor mezclado: el diseño 50/50 entre K0 y KI puede replicarse o modificarse en nuevos brazos experimentales, sirviendo como línea base para estudiar el equilibrio entre conocimiento y percepción.
- Docencia y formación en técnicas de RLHF/DPO alternativas: el modelo card expone con detalle hiperparámetros, filtrado de datos y criterios de evaluación, lo que lo convierte en material didáctico para cursos avanzados de entrenamiento de LLM.
- No se recomienda su uso en producción ni en aplicaciones de cara al usuario: el autor lo describe como checkpoint de investigación no publicado.

## Benchmarks y rendimiento
Evaluación interina sobre el benchmark privado RealViK-nat rc2 (741 pares, juez Qwen3.5-27B FP8 vía OpenRouter, grader v5, thinking on, temperatura 1.0, top-p 0.95, top-k 20, presencia 1.5, 8.192 tokens, 1 muestra). Condiciones: CV/CK = foto contrafactual, responder desde la foto / desde conocimiento del mundo; NV/NK = lo mismo sobre foto normal; CF = CV con una frase de hecho típico delante; CI = CK con instrucción de inspeccionar la foto; KT = pregunta de conocimiento sin foto. C-Joint = CV y CK ambos correctos; All-Joint = CV, CK, NV y NK todos correctos.

| Modelo | CV | CK | NV | NK | CF | CI | KT | C-Joint | All-Joint |
|---|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B (thinking) | 82,5 | 71,1 | 93,5 | 95,4 | 86,4 | 67,3 | 97,3 | 56,1 | 52,0 |
| Ronda 1 (VK-OPD-think) | 85,3 | 97,0 | 93,3 | 97,6 | 81,2 | 93,0 | 96,8 | 82,6 | 76,7 |
| Este modelo | 85,6 | 91,8 | 95,0 | 96,9 | 85,0 | 80,2 | 97,4 | 78,5 | 73,8 |

C-Joint frente a la base: +22,4 pp [+18,6, +26,2] (bootstrap pareado de 2.000 remuestreos, IC 95 %). Frente a la ronda 1: −4,0 pp [−6,9, −1,2]. Una sola semilla. Estas cifras son interinas y serán sustituidas por la tabla completa (1.054 pares, juez autoalojado).

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos (el tamaño del repo es de 18,8 GB), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto y más para contextos largos.
- En cuantización de 8 bits: en torno a 10-12 GB de pesos; en 4 bits: en torno a 5-6 GB, aunque no se publican pesos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: H100 (usadas en el entrenamiento, 4 unidades), A100 80 GB para inferencia cómoda en bf16 con contexto largo; una RTX 4090 (24 GB) puede alojar los pesos en bf16 pero con margen ajustado y limitaciones de contexto.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB requeriría cuantización, no publicada.
- Opciones de despliegue: transformers (librería declarada); el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | C-Joint (RealViK-nat rc2 interino) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (R4-B1-s5) | 9,4 mil millones | no disponible | 78,5 | apache-2.0 | checkpoint de investigación |
| Qwen3.5-9B (base, thinking) | 9,4 mil millones | no disponible | 56,1 | no disponible en la información | modelo base público |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | 9,4 mil millones | no disponible | 82,6 | no disponible en la información | checkpoint de investigación |

La comparación se limita a la familia VK-OPD y a su base, ya que no se proporcionan datos de modelos externos comparables. En el indicador C-Joint, este checkpoint supera a la base en 22,4 pp pero queda 4,0 pp por debajo de la ronda 1. En CK (conocimiento con foto contrafactual) la ronda 1 alcanza 97,0 frente a 91,8 de este modelo, mientras que en CV (responder desde la foto) este modelo obtiene 85,6 frente a 85,3 de la ronda 1. En CI (instrucción de inspeccionar la foto) la ronda 1 logra 93,0 frente a 80,2 de este checkpoint.

## Limitaciones y advertencias
- Checkpoint de investigación: el autor indica explícitamente que se comparte de forma privada para comparación en investigación y que no es un lanzamiento; no debe usarse en producción.
- Evaluación interina: los resultados provienen de 741 pares de un conjunto fijo y un único juez (Qwen3.5-27B FP8 vía OpenRouter), con 1 muestra por ítem; la tabla completa (1.054 pares, juez autoalojado) aún no está publicada.
- Una sola semilla: las conclusiones sobre la variante B1 no están respaldadas por réplicas semilla.
- Rendimiento inferior a la ronda 1 en C-Joint (−4,0 pp) y especialmente en CI (80,2 frente a 93,0), lo que sugiere una menor robustez ante instrucciones de inspección visual.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; el entrenamiento con profesores y datos sintéticos privados limita la caracterización de este riesgo.
- Limitaciones de contexto e idioma: no se documentan la longitud de contexto nativa ni los idiomas soportados; el entrenamiento usó rollouts de hasta 4.096 tokens y la evaluación 8.192.
- Restricciones de licencia: apache-2.0 permite uso comercial según los términos de la licencia, pero al ser un checkpoint de investigación no validado, su uso comercial no está recomendado por el autor.
- La cabeza MTP del modelo base no está incluida, lo que puede afectar a pipelines que dependan de decodificación multi-token.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni pesos en otros formatos, lo que limita el despliegue en hardware de consumo.
- Dependencia de un pool de datos sintético privado no reproducible, lo que dificulta la replicación exacta del entrenamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B1-s5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ronda 1 (VK-OPD-think): https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
- Repositorio TRL (pérdida GRPO): no disponible en la información proporcionada
- Paper o blog del método VK-OPD: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
