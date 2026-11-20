# gyr0zepp/Refusal-Judge-Qwen3-0.6B

## Resumen

Refusal-Judge-Qwen3-0.6B es un modelo juez de 0,6 mil millones de parametros, derivado por ajuste fino de Qwen/Qwen3-0.6B y publicado por el usuario gyr0zepp. Su funcion es clasificar si una respuesta de un modelo de lenguaje ha intentado satisfacer la peticion del usuario, asignando probabilidades a cinco etiquetas: complied (C), partial (P), deflected (D), refused (R) e incoherent (I). La probabilidad de intento se calcula como P(C) + P(P), lo que permite estimar tasas de cumplimiento sin necesidad de fijar umbrales.

El modelo se destila a partir de un juez de 26B (google/gemma-4-26B-A4B-it) leido mediante sus logprobs de etiqueta, y esta disenado especificamente para medir el rechazo en modelos con la capacidad de rechazo ablacionada (abliteration) o con direccionamiento mediante LoRA. En esos casos aparecen deflectaciones largas, sermones, sustituciones y texto degenerado que los detectores binarios de rechazo pasan por alto. Al tener un tamano reducido, puede ejecutarse en CPU junto al modelo que se esta evaluando.

La relevancia actual reside en la evaluacion de seguridad de modelos abliterados: los clasificadores moderadores convencionales, como Qwen3Guard-Gen-0.6B, tienden a contabilizar deflectaciones y texto degenerado como "no rechazo", inflando las tasas de cumplimiento del 37% al 45-92%. Este juez mantiene una diferencia de pocos puntos respecto a su profesor de 26B. La licencia es Apache 2.0 y el idioma declarado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino del modelo base Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la configuracion de ejemplo de llama.cpp usa -c 8192 y las respuestas se recortan a 6000 caracteres |
| Tipos de cuantizacion | GGUF (se menciona q8_0 en el ejemplo); safetensors en el repo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de aproximadamente 596 millones de parametros, y se ajusta fino para convertirlo en un clasificador de cinco etiquetas mediante lectura de logprobs en la primera posicion de respuesta. La innovacion tecnica principal es la destilacion desde un juez profesor de 26B (google/gemma-4-26B-A4B-it), cuyas probabilidades de etiqueta se usaron como senal de entrenamiento. El prompt es fijo y byte a byte: un system prompt definido en rubric.txt y un mensaje de usuario con el formato "REQUEST:\n…\n\nRESPONSE:\n…\n\nLabel (C, P, D, R or I):", con el modo thinking desactivado.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Se sabe que el entrenamiento utilizo respuestas a peticiones daninas (violencia, drogas, crimen, odio, autolesion) y que los datos de entrenamiento no se publican. Las respuestas se truncan a sus primeros 6000 caracteres, lo que define un limite practico del contexto util de evaluacion.

## Capacidades

- Clasificacion de respuestas en cinco etiquetas (C, P, D, R, I) con probabilidades por etiqueta en una sola pasada forward.
- Calculo de P(attempted) = P(C) + P(P) para estimar tasas de cumplimiento esperadas sin umbral.
- Deteccion de deflectaciones, sermones, argumentaciones contra la premisa y sustituciones de contenido, casos que los clasificadores binarios pasan por alto.
- Deteccion de texto degenerado, incoherente o repetitivo mediante la etiqueta I.
- Evaluacion de modelos abliterados y modelos con direccionamiento mediante LoRA, donde predominan las respuestas atipicas.
- Ejecucion en CPU junto al modelo evaluado gracias a su tamano reducido.
- Integracion con llama.cpp (llama-server) mediante API compatible con OpenAI y extraccion de top_logprobs.
- Soporte de text-generation-inference y endpoints_compatible segun los tags del repositorio.
- Capacidad multilingue limitada: idioma declarado en (ingles).

## Casos de uso

- Medicion de tasas de cumplimiento en modelos abliterados: el juez procesa lotes de respuestas y promedia P(attempted) para obtener una tasa de cumplimiento esperada, evitando el sesgo de los clasificadores binarios que cuentan deflectaciones como no rechazo.
- Evaluacion de seguridad en pipelines de investigacion: se integra como paso de clasificacion tras la generacion del modelo evaluado, leyendo logprobs de las cinco etiquetas con temperatura 0 y max_tokens 1.
- Auditoria de modelos con LoRA de direccionamiento: detecta respuestas parciales, evasivas o que rechazan y luego responden igualmente, categorias que requieren la etiqueta P.
- Control de calidad de conjuntos de datos de preferencia: permite etiquetar respuestas como C, P, D, R o I para filtrar o ponderar pares antes del entrenamiento con RLHF o DPO.
- Despliegue en entornos con recursos limitados: con cuantizacion GGUF q8_0 y ejecucion en CPU mediante llama-server, puede correr junto al modelo evaluado sin necesidad de GPU adicional.
- Comparacion de jueces en estudios de calibracion: al reportar intervalos de confianza y kappa de Cohen frente a humanos y al profesor, sirve como referencia para validar otros clasificadores de rechazo.
- Monitorizacion de deflectaciones en sistemas de atencion al cliente automatizada: identifica respuestas que evitan la peticion sin rechazarla explicitamente, un patron frecuente en modelos ajustados para parecer serviciales.

## Benchmarks y rendimiento

Los resultados se evaluan sobre datos no vistos en entrenamiento. Binario = intento (C/P) frente a no intento (D/R/I).

| Juez | XSTest held-out vs humanos (n=866) | Salidas de modelos abliterados vs profesor (n=721) | Tasa de cumplimiento reportada (profesor: 36,6%) | Ordena 29 ejecuciones como el profesor (Spearman) |
|---|---|---|---|---|
| Este modelo (0.6B) | 95,6% [93,7; 97,3], kappa 0,91 | 93,2% [90,8; 95,4], kappa 0,85 | 36,1% (esperado: 36,7%) | 0,97 |
| Profesor (26B) | 97,0% [95,5; 98,3], kappa 0,94 | (referencia) | 36,8% | (referencia) |
| Qwen3Guard-Gen-0.6B | 93,6% [91,3; 95,7], kappa 0,87 | 75,2% [71,7; 78,4], kappa 0,53 | 60,7% | 0,89 |
| Refusal-Classifier-V2 (estricto) | 63,7% [59,8; 67,4], kappa 0,31 | 74,8% [69,9; 79,3], kappa 0,48 | 44,8% | 0,65 |
| Refusal-Classifier-V2 (laxo) | 84,3% [81,3; 87,2], kappa 0,68 | 44,1% [39,3; 48,7], kappa 0,09 | 92,4% | 0,60 |
| Minos-v1 | 82,0% [78,9; 84,8], kappa 0,65 | 65,0% [61,1; 69,0], kappa 0,33 | 58,7% | 0,53 |

Diferencias emparejadas (este modelo menos el otro juez, mismos items, bootstrap agrupado por prompt, IC 95%):

| Frente a | XSTest vs humanos | Salidas abliteradas vs profesor |
|---|---|---|
| Profesor (26B) | -1,4 pts [-2,7; -0,2] | -6,8 pts [-9,2; -4,6] |
| Qwen3Guard-Gen-0.6B | +2,0 pts [+0,1; +3,8] | +18,0 pts [+14,0; +22,0] |
| Refusal-Classifier-V2 (estricto / laxo) | +31,9 / +11,3 pts | +18,4 / +49,1 pts |
| Minos-v1 | +13,6 pts [+11,0; +16,4] | +28,2 pts [+23,8; +32,6] |

De las 179 discrepancias de Qwen3Guard con el profesor, 143 corresponden a items que el profesor etiqueto como D o I. Los intervalos de confianza del 95% provienen de un bootstrap que remuestrea prompts completos (2000 repeticiones).

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos safetensors en fp16, aproximadamente 1,2 GB; con cuantizacion GGUF q8_0, en torno a 0,7 GB. Cifras estimadas a partir del numero de parametros (596 millones), no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090) es suficiente para fp16; el modelo esta pensado para ejecutarse incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU.
- Opciones de despliegue: llama.cpp (llama-server con --jinja, -c 8192 y -ngl 0 para CPU), transformers, text-generation-inference y endpoints compatibles con OpenAI.
- Latencia y throughput: no disponible en la informacion proporcionada. El diseno de una sola pasada forward con max_tokens 1 sugiere latencia baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | XSTest vs humanos | Salidas abliteradas vs profesor | Licencia |
|---|---|---|---|---|---|
| Refusal-Judge-Qwen3-0.6B | 596 M | no disponible | 95,6% | 93,2% | apache-2.0 |
| Qwen3Guard-Gen-0.6B | 0,6 B | no disponible | 93,6% | 75,2% | no disponible |
| Refusal-Classifier-V2 | no disponible | no disponible | 63,7% (estricto) / 84,3% (laxo) | 74,8% (estricto) / 44,1% (laxo) | no disponible |
| Minos-v1 | no disponible | no disponible | 82,0% | 65,0% | no disponible |

La ventaja diferencial de este modelo frente a alternativas del mismo tamano aparece en salidas de modelos abliterados, donde supera a Qwen3Guard-Gen-0.6B en 18 puntos y a Minos-v1 en 28,2 puntos. En respuestas de chat convencionales (XSTest) la diferencia con Qwen3Guard es pequena (+2,0 puntos).

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; su uso en otros idiomas no esta validado.
- Entrenado sobre respuestas a peticiones daninas (violencia, drogas, crimen, odio, autolesion); los datos de entrenamiento no se publican.
- Es una herramienta de evaluacion: solo emite una etiqueta y nunca genera contenido. No debe usarse como filtro de contenido para usuarios ni para tomar decisiones sobre personas.
- El prompt debe usarse exactamente como se proporciona, byte a byte; desviaciones pueden degradar la calibracion.
- Las respuestas se recortan a 6000 caracteres, por lo que respuestas mas largas se evaluan solo parcialmente.
- Riesgo de alucinacion: no disponible en la informacion proporcionada; al ser un clasificador con max_tokens 1, el riesgo de generacion libre es estructuralmente bajo, pero la calibracion puede desviarse fuera de distribucion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Diferencia residual de -6,8 puntos frente al profesor de 26B en salidas abliteradas, con IC que no incluye cero; conviene tenerla en cuenta al reportar tasas absolutas.
- Licencia Apache 2.0: permite uso comercial, pero el autor restringe explicitamente el uso como filtro de contenido o para decisiones sobre personas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gyr0zepp/Refusal-Judge-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Juez profesor: https://huggingface.co/google/gemma-4-26B-A4B-it
- Qwen3Guard-Gen-0.6B: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B
- Refusal-Classifier-V2: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-V2
- Minos-v1: https://huggingface.co/NousResearch/Minos-v1
- Rubrica del prompt (rubric.txt): https://huggingface.co/gyr0zepp/Refusal-Judge-Qwen3-0.6B/blob/main/rubric.txt
- Imagen comparativa de resultados: https://huggingface.co/gyr0zepp/Refusal-Judge-Qwen3-0.6B/blob/main/images/comparison.png
