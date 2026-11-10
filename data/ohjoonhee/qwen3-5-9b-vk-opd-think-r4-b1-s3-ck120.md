# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B1-s3-ck120

## Resumen

Qwen3.5-9B-VK-OPD-think-R4-B1-s3-ck120 es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B mediante ajuste fino completo de las capas del modelo de lenguaje y la normalización final, almacenado en bf16. Lo publica el autor ohjoonhee en Hugging Face como parte de una línea de trabajo sobre destilación on-policy (OPD) orientada a resolver conflictos de conocimiento en modelos multimodales: situaciones en las que la imagen contradice lo que el modelo sabe del mundo y debe decidir si responde a partir de lo mostrado o de su conocimiento previo.

El modelo pertenece a la ronda 4 del experimento VK-OPD-think, en concreto al brazo B1 (receta de la ronda 1 con un profesor de conocimiento combinado), semilla 3, paso 120 de 120. No es un lanzamiento de producción: el propio autor lo describe como un checkpoint de investigación compartido para comparación, con una evaluación intermedia sobre un benchmark privado (RealViK-nat rc2) que será sustituido por la tabla completa.

Con 9.409.813.744 parámetros totales, pipeline image-text-to-text y licencia Apache 2.0, el interés del modelo es metodológico: demuestra que la destilación on-policy con profesores con contexto privilegiado puede aumentar de forma sustancial la consistencia entre respuesta visual y respuesta basada en conocimiento (C-Joint +23,5 puntos porcentuales frente al base), a costa de una ligera pérdida respecto a la ronda 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), ajuste fino completo de capas LM y norm final; cabeza MTP del base no incluida |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo de las capas del modelo de lenguaje y la normalización final, sin incluir la cabeza MTP del modelo base. El entrenamiento sigue el paradigma de destilación on-policy: los profesores son el propio modelo base congelado con contexto privilegiado, y la ventaja por token se calcula como log π_profesor − log π_estudiante sobre las muestras generadas por el estudiante (KL inversa sobre tokens muestreados, implementada mediante la pérdida GRPO de TRL, sin recompensa y con beta 0).

La ronda 4 reconstruye la receta de la ronda 1 y cambia un elemento por brazo: B0 es la receta original con nueva semilla, B1 añade un profesor de conocimiento combinado y B2 incorpora filas de premisa en el lado fotográfico. Este checkpoint corresponde a B1: la ventaja por token para preguntas de conocimiento es 0,5 · A_K0 + 0,5 · A_KI, donde K0 es el modelo base sin la foto y KI el modelo base con la foto y la instrucción de responder con lo generalmente cierto en el mundo real. Los datos provienen de un pool sintético privado con fotos contrafactuales y normales emparejadas con preguntas de conocimiento y fotográficas; los ítems de conocimiento se filtran exigiendo que el profesor sin foto acierte en 2 de 2 muestras (548 ítems CK, 130 NK), mientras que los fotográficos no se filtran (1.995 CV, 246 NV). Cada paso mezcla 6 CK, 2 NK, 6 CV y 2 NV.

La configuración de entrenamiento es de 120 pasos con lr 3e-6 constante tras 5 pasos de warmup, AdamW, grad clip 1.0, 16 prompts × 4 rollouts por paso, rollouts con thinking activado, temperatura 1.0 y hasta 4.096 tokens; pesos maestros en fp32, cómputo en bf16 con FSDP2 y offload a CPU sobre 4× H100.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado durante el entrenamiento (rollouts con thinking on).
- Procesamiento de imagen y texto (pipeline image-text-to-text): responde preguntas sobre el contenido de una fotografía.
- Resolución explícita de conflictos entre evidencia visual y conocimiento del mundo, con dos modos inducidos por instrucción: responder desde la imagen o desde lo generalmente cierto.
- Manejo de preguntas contrafactuales (imágenes que contradicen hechos típicos) y de fotografías normales.
- Capacidad de inspeccionar la foto cuando se le instruye explícitamente (condición CI del benchmark).
- Soporte de conversación multi-turno (tag conversational en el repositorio).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre conflicto de conocimiento: el modelo sirve como punto de comparación controlado para estudiar si un modelo multimodal prioriza la evidencia visual o su conocimiento previo, gracias a las condiciones CV/CK/NV/NK del benchmark RealViK-nat.
- Evaluación de métodos de destilación on-policy: al ser un checkpoint de la ronda 4 con semilla y paso fijados de antemano, permite reproducir y auditar la receta B1 frente a B0 y B2.
- Sistemas de verificación de imágenes frente a hechos: en escenarios donde una foto puede mostrar algo atípico (productos falsificados, daños en infraestructuras), el modelo puede responder a partir de lo mostrado con la instrucción de sistema adecuada.
- Asistentes de documentación técnica con imágenes: responder preguntas sobre diagramas o capturas priorizando lo visible sobre lo esperado, útil en soporte de software.
- Análisis de imágenes médicas o de laboratorio con anotaciones contradictorias: como banco de pruebas para medir la resistencia a premisas erróneas (condición CF), no como herramienta clínica.
- Generación de datos sintéticos de evaluación: el pool de entrenamiento y las condiciones del benchmark permiten construir conjuntos de prueba para medir sesgo de confirmación visual en otros modelos.
- Estudio de robustez ante instrucciones en conflicto: la condición CI (instrucción de inspeccionar la foto ante una pregunta de conocimiento) sirve para analizar cómo cambia la respuesta cuando se fuerza la atención visual.

## Benchmarks y rendimiento

Evaluación intermedia sobre el benchmark privado RealViK-nat rc2 (741 pares, juez Qwen3.5-27B FP8 vía OpenRouter, thinking on, muestreo T 1.0 / top-p 0.95 / top-k 20 / presence 1.5, 8.192 tokens, 1 muestra). El autor advierte que estas cifras serán sustituidas por la tabla completa de 1.054 pares con juez autoalojado.

| Modelo | CV | CK | NV | NK | CF | CI | KT | C-Joint | All-Joint |
|---|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B (thinking) | 82.5 | 71.1 | 93.5 | 95.4 | 86.4 | 67.3 | 97.3 | 56.1 | 52.0 |
| Ronda 1 (VK-OPD-think) | 85.3 | 97.0 | 93.3 | 97.6 | 81.2 | 93.0 | 96.8 | 82.6 | 76.7 |
| Este modelo (R4-B1-s3-ck120) | 82.9 | 96.4 | 93.4 | 97.3 | 84.5 | 86.5 | 96.4 | 79.6 | 74.5 |

C-Joint frente al base: +23,5 puntos porcentuales (IC 95% [+19,7, +27,3]); frente a la ronda 1: −3,0 pp (IC 95% [−5,5, −0,4]), con bootstrap pareado de 2.000 remuestreos sobre una sola semilla. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda al menos 24 GB para contexto corto y 40-80 GB para contextos largos.
- Cuantización: el autor no publica versiones cuantizadas; al ser un modelo de 9.400 millones de parámetros, cabría esperar formatos GGUF/AWQ de la comunidad, pero no están disponibles en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó con 4× H100; para inferencia, A100 40/80 GB, H100 o L40S son adecuadas. Una RTX 4090 (24 GB) podría alojar los pesos en bf16 con contexto limitado, y GPUs de 16 GB requerirían cuantización a 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con contexto reducido; en 16 GB solo con cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | C-Joint (RealViK-nat rc2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,4 B | no disponible | 56,1 | Apache 2.0 | Público en Hugging Face |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | 9,4 B | no disponible | 82,6 | Apache 2.0 | Público en Hugging Face |
| Este modelo (R4-B1-s3-ck120) | 9,4 B | no disponible | 79,6 | Apache 2.0 | Público en Hugging Face |

La comparación se limita a la familia de la que deriva el modelo, ya que no se dispone de datos de benchmarks estándar que permitan contrastarlo con alternativas de otros autores.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un lanzamiento: el autor lo comparte para comparación y advierte que la evaluación es intermedia y será reemplazada.
- Resultados basados en una sola semilla y en un benchmark privado no reproducible externamente (RealViK-nat rc2), con juez externo vía OpenRouter.
- Pérdida de rendimiento frente a la ronda 1 en C-Joint (−3,0 pp) y en la condición CI (86,5 frente a 93,0), lo que sugiere menor capacidad de inspección visual cuando se le instruye explícitamente.
- El modelo se entrena sobre un pool sintético privado; no se documenta la composición lingüística ni la cobertura de dominios, por lo que el riesgo de sobreajuste a las condiciones del benchmark es alto.
- Riesgo de alucinación no cuantificado en la información disponible; el modo thinking puede alargar las respuestas hasta 4.096 tokens.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin validación en producción, no se recomienda su despliegue sin evaluación propia.
- La cabeza MTP del modelo base no está incluida, lo que puede afectar a pipelines que dependan de decodificación especulativa multi-token.
- Idiomas soportados y longitud de contexto no documentados: no se puede garantizar el comportamiento fuera del inglés ni con contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R4-B1-s3-ck120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint de la ronda 1 (VK-OPD-think, ck80): https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
