# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3a

## Resumen

Qwen3.5-9B-VK-OPD-think-R3a es un checkpoint de investigacion derivado de Qwen/Qwen3.5-9B mediante un proceso de destilacion on-policy (OPD, *on-policy distillation*) orientado a resolver conflictos de conocimiento vision-lenguaje. Lo publica el usuario ohjoonhee en Hugging Face como material privado de comparacion dentro de la tercera ronda de experimentos, no como un lanzamiento estable. El modelo es un fine-tune completo de las capas del modelo de lenguaje y la normalizacion final del modelo base, almacenado en bf16, con 9.409.813.744 parametros totales y un tamano de repositorio de 18,8 GB.

El problema que aborda es el denominado "conflicto de conocimiento": situaciones en las que la imagen muestra algo que contradice lo que es cierto en el mundo real, o al contrario, y el modelo debe decidir si responder desde la evidencia visual o desde el conocimiento general. La propuesta consiste en usar como profesores al modelo base congelado con contexto privilegiado (una linea de sistema que indica la fuente de verdad correcta) y calcular la ventaja por token como la diferencia entre el logaritmo de la probabilidad del profesor y la del estudiante sobre las propias muestras del estudiante.

Es relevante ahora porque cuantifica con rigor un fenomeno poco tratado en modelos multimodales: la mejora de la consistencia en conflictos visuales frente al coste en otras capacidades. El checkpoint no incluye la cabeza MTP (*multi-token prediction*) del modelo base y se distribuye bajo licencia Apache 2.0, con pipeline declarado image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) derivado de Qwen3.5-9B; fine-tune completo de capas LM y norm final |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un fine-tune completo de las capas del modelo de lenguaje y de la normalizacion final, descartando la cabeza MTP del modelo base. La arquitectura subyacente es la de Qwen3.5, un transformer multimodal con torre de vision y modelo de lenguaje, aunque la model card no detalla la composicion interna de bloques, atencion ni dimensiones ocultas.

El entrenamiento emplea destilacion on-policy: los profesores son el modelo base congelado con contexto privilegiado y la ventaja por token se define como log π_profesor − log π_estudiante sobre las muestras generadas por el propio estudiante. Para preguntas sobre la foto, el profesor recibe la imagen mas una linea de sistema que le pide responder segun lo que realmente se muestra; para preguntas de conocimiento, recibe la imagen mas una linea de sistema que le pide responder con lo que es cierto en el mundo real aunque la foto muestre otra cosa. El turno de usuario del estudiante (imagen, pregunta y cualquier pista) es identico para estudiante y profesor. Los datos son exclusivamente preguntas de foto y de conocimiento simples, sin pistas, y solo se usaron pares de imagen cuyos items el profesor acerto en 2 de 2 muestras (280 imagenes de conflicto y 80 ordinarias). La configuracion concreta fue de 80 pasos, learning rate 3e-6 con 5 pasos de warmup, 8 pares de imagen (16 prompts) por paso con 4 rollouts por paso, rollouts de hasta 4.096 tokens y 4 GPU H100. La semilla fue la 3 y el paso 80 se selecciono sobre el split de desarrollo.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre pares imagen-texto, con modo de pensamiento (*thinking*) activable.
- Respuesta a preguntas visuales (VQA) sobre contenido de imagenes naturales.
- Respuesta a preguntas de conocimiento general en presencia de una imagen, con gestion explicita del conflicto entre evidencia visual y conocimiento del mundo.
- Capacidad de mantener la respuesta factual general correcta cuando la imagen muestra algo atipico, y de ceñirse a la imagen cuando la tarea lo exige.
- Soporte de conversacion multi-turno segun el tag `conversational`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) en Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre conflictos de conocimiento en modelos vision-lenguaje: sirve como checkpoint de comparacion frente al modelo base y frente a la ronda 1 del mismo programa (VK-OPD-think), permitiendo medir el efecto de la destilacion on-policy con profesores de contexto privilegiado.
- Evaluacion de robustez ante imagenes atipicas: en tareas donde la imagen contradice la expectativa comun (por ejemplo, un objeto en un contexto imposible), el modelo esta entrenado para decidir de forma consistente si responde desde la evidencia visual o desde el conocimiento general.
- Reproduccion de experimentos de destilacion on-policy: la model card documenta pasos, learning rate, tamano de lote, rollouts y hardware, lo que permite replicar la receta sobre el mismo modelo base.
- Analisis de trade-offs en fine-tuning multimodal: util para estudiar como una mejora de +18,0 puntos porcentuales en la metrica All-4 se traduce en variaciones en las metricas individuales (CV, CK, NV, NK, KT).
- Prototipado de asistentes visuales que deben distinguir entre "lo que se ve" y "lo que se sabe": por ejemplo, un asistente educativo que corrige afirmaciones erroneas sobre una foto sin dejarse arrastrar por ella.
- Base para experimentos de destilacion en otros dominios: la metodologia de profesores con contexto privilegiado y ventaja por token es reutilizable en tareas de razonamiento o de grounding que requieran resolver ambiguedades.

## Benchmarks y rendimiento

Evaluacion en test privado v3, imagenes naturales, n = 1.186, thinking activado, muestreo de la model card, 1 muestra. Las metricas CV, CK, NV, NK y KT son las definidas por el autor; All-4 es la metrica agregada principal.

| Modelo | CV | CK | NV | NK | All-4 | KT |
|---|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 80,2 | 67,7 | 84,0 | 90,7 | 43,5 | 93,0 |
| round 1 (VK-OPD-think) | 83,2 | 93,8 | 83,1 | 93,2 | 65,6 | 92,9 |
| este modelo (R3a) | 81,1 | 94,5 | 82,3 | 90,8 | 61,6 | 93,0 |

La mejora de All-4 frente al modelo base es de +18,0 puntos porcentuales, con intervalo de confianza del 95% de [+15,1, +21,2] pp obtenido por bootstrap pareado. Se trata de una unica semilla. El autor indica que el checkpoint se comparte de forma privada para comparacion dentro de la ronda 3 y que no constituye un lanzamiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica se recomienda al menos 24 GB para contextos cortos y bastante mas para contextos largos.
- GPU recomendadas: el entrenamiento se realizo con 4× H100. Para inferencia, A100 de 40 u 80 GB, H100 o L40S son opciones adecuadas.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16 con cuantizacion o con contextos reducidos; en 16 GB requeriria cuantizacion a 8 bits o inferior, no documentada por el autor.
- Opciones de despliegue: transformers (libreria declarada), ademas de vLLM, TGI, llama.cpp u Ollama si se generan conversiones, no verificadas en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | All-4 (test privado v3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,4 B | no disponible | 43,5 | Apache 2.0 | publico |
| ohjoonhee/Qwen3.5-9B-VK-OPD-think (ronda 1) | 9,4 B | no disponible | 65,6 | Apache 2.0 | publico |
| ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3a (este modelo) | 9,4 B | no disponible | 61,6 | Apache 2.0 | publico |

La comparacion se limita a los tres checkpoints de la misma familia y evaluados con el mismo protocolo; no se dispone de datos de benchmarks estandar que permitan comparar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Checkpoint de investigacion privado: el autor lo describe explicitamente como material de comparacion dentro de la ronda 3 y no como un lanzamiento; no debe tratarse como un modelo listo para produccion.
- Una sola semilla en la evaluacion, por lo que la varianza entre ejecuciones no esta caracterizada.
- El conjunto de evaluacion es privado y las metricas (CV, CK, NV, NK, KT, All-4) son definidas por el autor, lo que dificulta la comparacion con resultados de terceros.
- El modelo no incluye la cabeza MTP del modelo base; funcionalidades que dependan de ella no estaran disponibles.
- Los datos de entrenamiento se limitan a preguntas de foto y de conocimiento simples, sin pistas, lo que puede reducir el rendimiento en prompts complejos o con instrucciones anidadas.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica; se desconoce el comportamiento fuera del ingles y de las imagenes naturales del conjunto de evaluacion.
- El uso comercial esta permitido por la licencia Apache 2.0, pero el autor no ofrece garantias ni soporte; la responsabilidad de validar el modelo en un dominio concreto recae en quien lo despliega.
- El rendimiento en la metrica NK (90,8) es inferior al del modelo base (90,7 es practicamente identico) y al de la ronda 1 (93,2), mientras que CK mejora hasta 94,5; el equilibrio entre ambas no es uniforme.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint de la ronda 1: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
