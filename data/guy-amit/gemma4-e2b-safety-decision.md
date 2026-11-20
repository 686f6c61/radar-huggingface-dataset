# Guy-Amit/gemma4-e2b-safety-decision

## Resumen

Gemma 4 E2B safety-decision es un ajuste fino del modelo google/gemma-4-E2B-it orientado a la clasificación estructurada de decisiones de seguridad y cumplimiento, en lugar de a la generación libre de texto. Lo desarrolla Guy-Amit y se distribuye como artefacto fusionado (merged) a partir de un adaptador LoRA entrenado sobre un conjunto de 500.000 ejemplos de decisión. El modelo se sirve a través de la API estructurada SystemOne, que normaliza los logits de las etiquetas legales como probabilidades de decisión.

El modelo conserva la arquitectura y el tamaño del Gemma 4 E2B base (5.104.297.504 parámetros en pesos safetensors, aproximadamente 10,2 GB en bfloat16) y se publica con licencia Gemma. Su propósito es emitir decisiones discretas sobre categorías predefinidas (formatos noul, choice y score) en dominios como seguridad de agentes, moderación de contenido y adherencia a políticas, en lugar de responder preguntas abiertas.

Es relevante ahora porque propone un patrón de despliegue de modelos pequeños especializados como clasificadores de decisión servidos por vLLM con un endpoint dedicado, lo que facilita integrar salvaguardas deterministas en pipelines de agentes. No obstante, el propio autor advierte que el adaptador no registró el commit exacto del modelo base usado en el entrenamiento, lo que limita la reproducibilidad estricta del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E2B-it); detalles internos no disponibles |
| Parametros totales | 5.104.297.504 |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 tokens (configurado en el ejemplo de servicio vLLM); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de servicio usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA del modelo google/gemma-4-E2B-it, fusionado posteriormente en un artefacto de despliegue completo. La fusión se realizó cargando el modelo base en el commit 4adf15748de9e1a0097b6274cee9c15836c41c37, si bien el adaptador original no registró el commit empleado durante el entrenamiento, por lo que ese identificador corresponde únicamente a la entrada de la fusión y no constituye prueba del commit de entrenamiento. El adaptador LoRA de origen está disponible en Guy-Amit/gemma4-e2b-safety-decision-lora.

El entrenamiento se realizó sobre un conjunto de 500.000 ejemplos de decisión. La model card no detalla la composición exacta del dataset ni el número de tokens, pero la evaluación por fuente de datos revela la presencia de conjuntos como aegis, wildguard, civil_comments, toolace, xlam, open_jev, ultrafeedback, nemotron, prometheus, helpsteer2, policy_adherence_4k, stepguard, toolcall_guard y ai_agent_security_policy_decisions, entre otros. No se documenta el uso de RLHF o DPO. La innovación principal no es arquitectónica sino de interfaz: el modelo se explota mediante el endpoint /v1/systemone de vLLM con logprobs-mode raw_logprobs, de forma que los logits de las etiquetas legales se normalizan como probabilidades de decisión.

## Capacidades

- Clasificación estructurada de decisiones sobre etiquetas legales predefinidas, con tres formatos documentados: noul, choice y score.
- Evaluación de seguridad de contenido y moderación (fuentes aegis, civil_comments, wildguard).
- Evaluación de adherencia a políticas y decisiones de seguridad de agentes de IA (policy_adherence_4k, ai_agent_security_policy_decisions, stepguard, toolcall_guard).
- Clasificación de intenciones y etiquetado de consultas (clinc150, banking77, xlam).
- Razonamiento de sentido común y respuesta a preguntas (commonsense_qa, qasc, natural_questions, squad_v2, tydiqa).
- Inferencia en lenguaje natural (multi_nli, snli, boolq, arc).
- Evaluación de calidad de respuestas y preferencias (ultrafeedback, prometheus, helpsteer2, oasst1).
- Capacidades de tool calling y function calling heredadas del modelo base (fuentes toolace y xlam).
- No se documentan capacidades de visión, audio, modo thinking ni generación libre multi-turno en la información disponible.

## Casos de uso

- Moderación de contenido en producción: el modelo clasifica texto como seguro o no seguro con un 98,16% de acierto en civil_comments y un 83,02% en wildguard, lo que permite integrarlo como filtro previo o posterior a un LLM generativo.
- Salvaguarda de agentes autónomos: con un 91,67% en ai_agent_security_policy_decisions y un 96,51% en agent_failure_bench, puede evaluar si una acción propuesta por un agente cumple la política de seguridad antes de ejecutarse.
- Enrutamiento de intenciones en asistentes conversacionales: su 98,00% en clinc150 y 99,90% en xlam lo hace adecuado para decidir qué herramienta o flujo activar ante una consulta del usuario.
- Validación de llamadas a herramientas: con un 99,30% en toolace, puede verificar si una llamada a función generada por otro modelo es correcta y segura antes de despacharla.
- Clasificación de decisiones de cumplimiento normativo: el formato score permite asignar puntuaciones graduadas a casos de adherencia a políticas (96,83% en policy_adherence_4k).
- Filtrado de toxicidad y comentarios: el 98,16% en civil_comments y el 83,02% en wildguard permiten desplegarlo como clasificador de comentarios en plataformas comunitarias.
- Evaluación automática de respuestas de LLM: con un 69,45% en prometheus y un 59,28% en helpsteer2, puede usarse como juez parcial en pipelines de evaluación, siempre con revisión humana dado el margen de error.

## Benchmarks y rendimiento

Resultados del conjunto de test retenido (50.181 ejemplos), calculados a través del endpoint SystemOne de vLLM. La precisión es top-1 sobre etiquetas legales; la masa objetivo en la predicción otorga crédito parcial cuando un ejemplo tiene distribución de probabilidad sobre objetivos.

| Split | Ejemplos | Loss | Accuracy | Masa objetivo |
|:--|--:|--:|--:|--:|
| Overall | 50.181 | 0,6169 | 75,43% | 75,45% |
| noul | 14.132 | 0,2086 | 92,24% | 92,05% |
| choice | 11.989 | 0,4976 | 82,48% | 82,80% |
| score | 24.060 | 0,9163 | 62,04% | 62,03% |

| Fuente de datos | Ejemplos | Loss | Accuracy |
|:--|--:|--:|--:|
| aegis | 688 | 0,3558 | 85,03% |
| agent_failure_bench | 229 | 0,0874 | 96,51% |
| ai_agent_security_policy_decisions | 240 | 0,2622 | 91,67% |
| arc | 200 | 0,4571 | 85,50% |
| banking77 | 500 | 2,1037 | 14,00% |
| boolq | 229 | 0,3431 | 86,90% |
| civil_comments | 3.206 | 0,0869 | 98,16% |
| clinc150 | 500 | 0,0503 | 98,00% |
| commonsense_qa | 500 | 0,8079 | 72,20% |
| dynabench | 219 | 0,7022 | 65,75% |
| helpsteer2 | 2.500 | 0,9837 | 59,28% |
| multi_nli | 500 | 0,4630 | 83,00% |
| natural_questions | 229 | 0,5742 | 74,67% |
| nemotron | 5.200 | 0,2516 | 90,65% |
| oasst1 | 499 | 0,0720 | 98,40% |
| open_jev | 6.909 | 0,2732 | 88,25% |
| policy_adherence_4k | 757 | 0,0861 | 96,83% |
| prometheus | 4.000 | 0,7306 | 69,45% |
| qasc | 500 | 0,0609 | 98,20% |
| snli | 500 | 0,3876 | 86,80% |
| squad_v2 | 229 | 0,4024 | 83,84% |
| stepguard | 393 | 1,2583 | 64,89% |
| toolace | 853 | 0,0204 | 99,30% |
| toolcall_guard | 412 | 0,9736 | 70,63% |
| tydiqa | 229 | 0,3878 | 86,90% |
| ultrafeedback | 15.976 | 1,0269 | 57,45% |
| wildguard | 2.985 | 0,5926 | 83,02% |
| xlam | 999 | 0,0125 | 99,90% |

La evaluación se ejecutó a 48,96 ejemplos por segundo. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,2 GB en bfloat16 (tamaño del repo y de los pesos); en cuantización de 8 bits rondaría 5-6 GB y en 4 bits unos 3 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: para bfloat16, GPU con al menos 16 GB de VRAM (RTX 4090, A100 40 GB, H100); para cuantizaciones de 8 o 4 bits, GPU consumer de 8-12 GB.
- Cabe en GPU consumer: sí, en RTX 4090 en bfloat16 y en tarjetas de 8-12 GB con cuantización, aunque no se ofrecen pesos GGUF oficiales.
- Opciones de despliegue: vLLM es el método documentado por el autor, con el endpoint /v1/systemone y --logprobs-mode raw_logprobs. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 48,96 ejemplos por segundo durante la evaluación con vLLM; no se publican latencias por petición ni métricas de producción.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A nivel cualitativo:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|:--|--:|--:|:--|:--|
| Gemma 4 E2B safety-decision | 5.104.297.504 | 2048 (configurado) | gemma | Clasificador de decisiones estructuradas |
| google/gemma-4-E2B-it | no disponible | no disponible | gemma | Generación libre instruida (modelo base) |
| Alternativas de clasificación de seguridad | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para el endpoint estructurado SystemOne; usarlo como generador libre de texto no es su propósito y probablemente produzca resultados deficientes.
- Rendimiento muy desigual por dominio: 14,00% en banking77, 57,45% en ultrafeedback, 59,28% en helpsteer2 y 62,04% en el formato score, frente a más del 98% en clinc150, xlam o toolace.
- El adaptador no registró el commit del modelo base usado en entrenamiento, lo que impide garantizar la reproducibilidad exacta del ajuste.
- El modelo base Gemma puede presentar sesgos heredados; no se documentan evaluaciones específicas de sesgo en esta ficha.
- Riesgo de alucinación en la asignación de etiquetas cuando la entrada se aleja de las distribuciones de entrenamiento, especialmente en dominios con bajo rendimiento.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de un despliegue en producción.
- No se documentan idiomas soportados ni evaluaciones multilingües, por lo que el comportamiento fuera del inglés es incierto.
- Contexto configurado en 2048 tokens en el ejemplo de servicio; entradas más largas requerirán ajustar --max-model-len o truncar.
- Sin descargas ni likes en el momento de la consulta: modelo muy reciente y sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Guy-Amit/gemma4-e2b-safety-decision
- Adaptador LoRA de origen: https://huggingface.co/Guy-Amit/gemma4-e2b-safety-decision-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Documentación de vLLM: https://docs.vllm.ai
- Términos de la licencia Gemma: https://ai.google.dev/gemma/terms
