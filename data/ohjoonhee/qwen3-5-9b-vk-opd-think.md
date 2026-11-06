# ohjoonhee/Qwen3.5-9B-VK-OPD-think

## Resumen

Qwen3.5-9B-VK-OPD-think es un ajuste fino completo del modelo multimodal Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), publicado por el usuario ohjoonhee en Hugging Face. El objetivo del entrenamiento es resolver un problema concreto de conflicto de conocimiento: cuando una imagen contradice el conocimiento del mundo (por ejemplo, una foto de platanos azules), el modelo debe saber distinguir si la pregunta se refiere a lo que muestra la foto o a lo que sabe del mundo, y responder en consecuencia sin mezclar ambas fuentes de verdad.

El modelo se entrena mediante destilacion on-policy en modo thinking, usando como profesores al propio modelo base congelado con contexto privilegiado. La innovacion principal es el uso de profesores privilegiados: para preguntas de conocimiento, el profesor es el modelo base sin la imagen; para preguntas sobre la foto, el profesor es el modelo base con la imagen y una instruccion extra para responder segun lo que realmente se muestra. El estudiante aprende a razonar como si la foto no estuviera presente cuando la pregunta es de conocimiento, y a leer la foto cuando la pregunta es visual.

El checkpoint tiene 9.409.813.744 parametros totales (9,41B), de los cuales 6,92B son entrenables (capas del modelo de lenguaje y la normalizacion final; la torre de vision, el merger, los embeddings y la LM head permanecen congelados). Se distribuye en safetensors en bf16, con licencia Apache 2.0, y es compatible con transformers y con despliegue en vLLM. Es un checkpoint de investigacion, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (9,41B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso configura `max_model_len=10240` en vLLM) |
| Tipos de cuantizacion | No disponible (los pesos se publican en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con torre de vision, merger, embeddings, capas de lenguaje y LM head. El ajuste fino congela la torre de vision, el merger, los embeddings y la LM head, y entrena solo las capas del modelo de lenguaje y la normalizacion final (6,92B de los 9,41B totales). El entrenamiento usa precision fp32 para los pesos maestros y bf16 para el computo, con FSDP2 y offload a CPU sobre 4 GPU H100. El optimizador es AdamW con learning rate 3e-6 constante tras 5 pasos de warmup, weight decay 0 y grad clip 1.0. Se realizaron 80 pasos, con 16 prompts y 4 rollouts por paso.

La innovacion tecnica central es la destilacion on-policy con profesores privilegiados. Para cada token generado por el estudiante, la ventaja se calcula como A_t = log π_teacher(y_t) − log π_student(y_t) sobre los tokens muestreados por el propio estudiante (KL inversa sobre tokens muestreados, con stop-gradient). Esa ventaja se introduce en la perdida GRPO de TRL sin recompensa explicita ni termino KL adicional. Los profesores son el modelo base congelado: sin imagen para preguntas de conocimiento, y con imagen mas la instruccion "responde segun lo que realmente se muestra en la imagen, aunque difiera de lo tipico" para preguntas visuales. Los datos de entrenamiento son un pool sintetico privado de fotos contrafactuales y normales con pares de preguntas de conocimiento y de foto; los items de conocimiento se conservan solo si el profesor sin imagen acierta en 2 de 2 muestras. Los rollouts se generan con thinking activado, temperatura 1.0, top-p 1.0 y hasta 4.096 tokens mediante vLLM colocado. La perdida es `dapo` de TRL con media por token, beta 0 y correccion de importance sampling de vLLM (`token_truncate`). Los pesos se almacenan en bf16 y no incluyen la cabeza de prediccion multi-token (MTP) del modelo base, por lo que la decodificacion especulativa MTP no esta disponible.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (activado por defecto en Qwen3.5); el modelo fue entrenado y evaluado con thinking activo.
- Comprension de imagenes y respuesta a preguntas sobre el contenido visual de una foto.
- Distincion explicita entre conocimiento del mundo y contenido de la imagen: responde desde el conocimiento cuando la pregunta es de conocimiento, aunque la foto muestre algo contrafactual, y responde desde la foto cuando la pregunta es sobre lo que se ve.
- Respuesta a preguntas de conocimiento en modalidad solo texto (sin imagen).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidad especial: pensamiento visible (thinking mode) con la respuesta final tras `</think>`.

## Casos de uso

- Verificacion de contenido visual con conocimiento previo: el modelo puede recibir una foto y una pregunta sobre lo que muestra la imagen, y responder correctamente aunque la escena contradiga expectativas tipicas (por ejemplo, un objeto de color atipico), gracias a su entrenamiento especifico en conflictos de conocimiento.
- Preguntas de conocimiento con imagen adjunta: en escenarios donde el usuario adjunta una foto pero pregunta por un hecho del mundo (por ejemplo, "que color tienen los platanos maduros"), el modelo responde desde el conocimiento y no se deja arrastrar por la imagen, con una tasa de arrastre (CK→V) del 0,5 %.
- Evaluacion de robustez multimodal: util como modelo de referencia para estudiar como los modelos de vision-lenguaje mezclan conocimiento previo y evidencia visual; el conjunto de evaluacion privado con cinco condiciones (CV, CK, NV, NK, KT) sirve de metodologia replicable.
- Investigacion en destilacion on-policy: el checkpoint y su receta (profesores privilegiados, ventaja tipo GRPO sin recompensa) son un caso de estudio para tecnicas de alineacion con profesores congelados y contexto privilegiado.
- Clasificacion y respuesta corta sobre imagenes: el modelo esta entrenado para responder con una sola palabra o frase, por lo que encaja en tareas de extraccion de atributos visuales o de conocimiento con formato de respuesta corto.
- Despliegue en pipelines de investigacion con vLLM: el ejemplo oficial usa vLLM con `max_model_len=10240` y parametros de muestreo concretos (temperatura 1.0, top-p 0.95, top-k 20, presence penalty 1.5), lo que permite integrarlo en entornos de evaluacion automatizada.
- Analisis de sesgos de anclaje visual: permite medir hasta que punto una imagen contrafactual condiciona las respuestas de conocimiento, comparando el modelo con su base (23,8 % de arrastre en el base frente al 0,5 % en este checkpoint).

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de test privado de conflicto de conocimiento con imagenes naturales: 1.186 pares de preguntas, cada par evaluado en cinco condiciones (CV: foto contrafactual, responder desde la foto; CK: foto contrafactual, responder desde conocimiento; NV: foto normal, responder desde la foto; NK: foto normal, responder desde conocimiento; KT: solo texto, responder desde conocimiento). All-4 exige acertar CV, CK, NV y NK. CK→V es la proporcion de respuestas CK que dieron el valor de la foto en lugar del conocimiento del mundo. Evaluacion con thinking activo, temperatura 1.0, top-p 0.95, top-k 20, presence penalty 1.5, 1 muestra, hasta 8.192 tokens.

| Modelo | CV | CK | NV | NK | All-4 | KT | CK→V |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B (thinking) | 80,2 | 67,7 | 84,0 | 90,7 | 43,5 | 93,0 | 23,8 |
| Qwen3.5-9B-VK-OPD-think | 83,2 | 93,8 | 83,1 | 93,2 | 65,6 | 92,9 | 0,5 |

Diferencias frente al base en puntos porcentuales (intervalo de confianza del 95 % por bootstrap de pares):

| Metrica | Diferencia | IC 95 % |
|---|---|---|
| All-4 | +22,1 | [+19,2, +25,1] |
| CK | +26,1 | [+23,5, +28,8] |
| CV | +3,0 | [+1,2, +5,0] |
| NV | −0,9 | [−2,6, +0,9] |
| NK | +2,4 | [+0,9, +4,0] |
| KT | −0,1 | [−1,4, +1,3] |

Los resultados provienen de una sola semilla. El paso del checkpoint se eligio sobre un split de desarrollo separado y el learning rate (1e-6, 3e-6 o 1e-5) se eligio sobre este mismo conjunto de test, donde las tres opciones quedan a unos 3 puntos entre si. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia, los pesos en bf16 ocupan aproximadamente 18,8 GB (tamano del repo), por lo que la inferencia en bf16 requiere al menos esa cantidad mas overhead de activaciones y cache KV.
- GPU recomendadas: el entrenamiento se realizo sobre 4 GPU H100. Para inferencia en bf16 se recomiendan GPU con 24 GB o mas de VRAM (por ejemplo, A100, H100, L40S, RTX 4090 para bf16 justo con contexto corto).
- Cabe en consumer GPU: previsiblemente en RTX 4090 (24 GB) en bf16 con contexto limitado, aunque no se confirma en la informacion disponible. En cuantizaciones de 8 o 4 bits cabria en GPU consumer de 16 GB o menos, pero no se publican pesos cuantizados.
- Opciones de despliegue: vLLM (usado en el ejemplo oficial con `max_model_len=10240`), transformers (libreria declarada), y FriendliAI como endpoint de inferencia gestionado. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como dato indirecto, la longitud mediana de pensamiento en el conjunto de test aumento de 877 a 1.023 tokens, lo que implica mas tokens generados por respuesta que el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-VK-OPD-think | 9,41B | No disponible | Ajuste fino multimodal para conflicto de conocimiento | Apache 2.0 | Hugging Face, FriendliAI |
| Qwen3.5-9B (base) | 9,41B | No disponible | Modelo multimodal general de Qwen | No disponible en la informacion | Hugging Face |
| Qwen3.5-27B | No disponible | No disponible | Modelo de mayor tamano usado como juez en la evaluacion | No disponible en la informacion | Hugging Face |

El modelo base Qwen3.5-9B es la alternativa directa: mismo tamano y arquitectura, pero con un 23,8 % de arrastre visual en preguntas de conocimiento frente al 0,5 % de este checkpoint, a costa de un razonamiento mas largo. Qwen3.5-27B aparece unicamente como juez en la evaluacion, no como alternativa de despliegue. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento estrecho: el modelo se entreno solo con preguntas de respuesta corta sobre fotos contrafactuales y normales. Las capacidades generales fuera de ese escenario no fueron objetivo del entrenamiento y pueden degradarse o no estar alineadas con el base.
- Razonamiento mas largo: la longitud mediana de pensamiento en el conjunto de test paso de 877 a 1.023 tokens, lo que incrementa el coste de inferencia y la latencia.
- Checkpoint de investigacion: no esta ajustado para seguridad mas alla del modelo base; no debe usarse en produccion orientada a usuarios sin evaluacion adicional.
- Riesgo de alucinacion: no se documenta de forma especifica, pero se hereda el del modelo base y no se mitiga en este ajuste.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto oficial; el ejemplo de uso fija `max_model_len=10240` en vLLM.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion conviene verificar la licencia del modelo base y de los datos sinteticos privados, que no se publican.
- Sin cabeza MTP: la decodificacion especulativa multi-token del modelo base no esta disponible en este checkpoint, lo que limita optimizaciones de latencia.
- Evaluacion con una sola semilla y seleccion de learning rate sobre el conjunto de test: los resultados pueden tener cierta sobreestimacion; el propio autor lo advierte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/ohjoonhee/Qwen3.5-9B-VK-OPD-think
