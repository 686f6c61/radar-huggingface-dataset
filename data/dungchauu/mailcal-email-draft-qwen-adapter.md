# Dungchauu/mailcal-email-draft-qwen-adapter

## Resumen

MailCal Task 4 — Email Drafting LoRA Adapter (`recruit.email-draft`) es un adaptador LoRA publicado por el usuario Dungchauu que ajusta el modelo base Qwen/Qwen3-1.7B para la generación de borradores de correo electrónico de reclutamiento. El adaptador produce salidas estructuradas con los campos `subject`, `body`, `language` y `review`, siguiendo el esquema `recruit-contracts-v2.schema.json` (versión 2.0.0), en vietnamita e inglés.

El problema que aborda es la generación de correos de reclutamiento que respeten estrictamente una lista blanca de URLs (`constraints.allowed_urls`), no inventen fechas ni horas, no contengan marcadores entre corchetes como `[Job Title]` o `[Candidate Name]`, mantengan el idioma objetivo incluso cuando las notas de RR. HH. estén en otro idioma, y se abstengan de forma segura ante datos obligatorios ausentes o notas con inyección de instrucciones.

Es relevante porque demuestra un patrón de ajuste fino muy específico sobre un modelo pequeño (1.700 millones de parámetros) con un dataset verificado de 384 registros y métricas de evaluación explícitas sobre validez de esquema, fidelidad de URLs, ausencia de fechas inventadas y precisión de idioma. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA modular sobre transformer decoder-only (Qwen3-1.7B); rango r=8, alpha=16, dropout=0.05 sobre las 7 proyecciones lineales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj) |
| Parametros totales | No disponible (el adaptador LoRA se aplica sobre Qwen3-1.7B, de 1.700 millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Vietnamita e ingles (segun la model card y los tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA: `adapter_model.safetensors` y `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA modular de rango 8 y alpha 16 con dropout 0.05, aplicado sobre las siete proyecciones lineales del transformer Qwen3-1.7B (atención y MLP). El modelo base está fijado a la revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`. El entrenamiento se realizó sobre el dataset `email_draft_train_v2`, compuesto por 384 registros verificados (288 de entrenamiento y 96 de desarrollo), con 32 familias industriales independientes, 50% en inglés y 50% en vietnamita, cobertura completa de 5 propósitos y 3 tonos, y una mezcla de 50% de hechos ricos frente a 50% de hechos escasos o nulos. El dataset incluye 64 casos de `missing_required_fact`, 64 de `unsafe_instruction` y 0 marcadores entre corchetes. Se auditó la fuga de datos con 33.024 pares contra `recruit_eval_v3` con resultado de 0 fugas.

La optimización consistió en 3 épocas × 72 pasos = 216 pasos de optimizador, con acumulación de gradiente 4, tasa de aprendizaje 1e-4, scheduler coseno y pérdida de entropía cruzada ponderada por tokens con enmascaramiento completo del prompt (`-100`). El pico de VRAM fue de 4,12 GB en una Tesla T4. La pérdida de desarrollo evolucionó de 2,09276 antes del entrenamiento a 0,24776 en la época 1, 0,15491 en la época 2 (mejor valor, -92,6%) y 0,15654 en la época 3. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de borradores de correo de reclutamiento con salida estructurada en JSON: `subject`, `body`, `language` y `review`.
- Cumplimiento estricto de una lista blanca de URLs (`constraints.allowed_urls`) sin inventar enlaces.
- Prohibición de fechas y horas fabricadas.
- Eliminación de marcadores entre corchetes tipo `[Job Title]` o `[Candidate Name]`.
- Mantenimiento del idioma objetivo (vietnamita o inglés) incluso con notas de RR. HH. en otro idioma.
- Abstención segura ante hechos obligatorios ausentes (`missing_required_fact`) y ante notas con inyección de instrucciones (`unsafe_instruction`).
- Cobertura de 5 propósitos y 3 tonos de comunicación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Generación automática de borradores de invitación a entrevista: el adaptador produce asunto y cuerpo con los datos confirmados del candidato, respetando la lista blanca de URLs de la empresa y sin inventar fechas de entrevista.
- Comunicación de rechazo o seguimiento de candidaturas: el modelo cubre 3 tonos distintos y 5 propósitos, lo que permite generar mensajes formales o cercanos según el contexto de la industria.
- Reclutamiento bilingüe vietnamita-inglés: el adaptador mantiene el idioma objetivo aunque las notas internas de RR. HH. estén en el otro idioma, útil para empresas con operaciones en Vietnam y equipos internacionales.
- Envío de correos con enlaces verificados: la fidelidad de URL (1/1 en el conjunto de evaluación y 9/9 libre de violaciones) permite integrar el adaptador en flujos donde solo se pueden incluir enlaces de la lista blanca, como portales de empleo o formularios de reserva.
- Moderación y revisión humana asistida: la salida incluye el campo `review`, que con el postprocesado `draft_email.py` marca `HR_REVIEW_REQUIRED` en casos de datos ausentes o inyección de instrucciones, lo que facilita la cola de revisión de un equipo de RR. HH.
- Prototipado de asistentes de reclutamiento en hardware modesto: con un pico de 4,12 GB de VRAM en Tesla T4 durante el entrenamiento, el adaptador sobre Qwen3-1.7B es viable en GPUs de gama media para pruebas y despliegues internos.
- Generación de correos con presupuesto de caracteres: el postprocesado aplica presupuestos de longitud, adecuado para plataformas con límites de tamaño en asunto o cuerpo.

## Benchmarks y rendimiento

Evaluación retenida sobre `recruit_eval_v3` (9 casos de `recruit.email-draft`):

| Metrica | V1 (raw) | V2 (raw) | V2 + postprocesado `draft_email.py` |
|---|---|---|---|
| Validez JSON | 9/9 (100,0%) | 9/9 (100,0%) | 9/9 (100,0%) |
| Validez de esquema | 9/9 (100,0%) | 9/9 (100,0%) | 9/9 (100,0%) |
| Cobertura de hechos obligatorios | 3/5 (60,0%) | 5/5 (100,0%) | 5/5 (100,0%) |
| Fidelidad de URL | 3/4 (75,0%) | 1/1 (100,0%) | 1/1 (100,0%) |
| Libre de violaciones de URL | 8/9 (88,9%) | 9/9 (100,0%) | 9/9 (100,0%) |
| Libre de violaciones de fecha | 9/9 (100,0%) | 9/9 (100,0%) | 9/9 (100,0%) |
| Precision de idioma (idioma objetivo puro) | 8/9 (88,9%) | 9/9 (100,0%) | 9/9 (100,0%) |
| Libre de marcadores entre corchetes | 1/9 (11,1%) | 9/9 (100,0%) | 9/9 (100,0%) |
| Precision de revision necesaria | 7/9 (77,8%) | 7/9 (77,8%) | 9/9 (100,0%) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible. La pérdida de desarrollo del adaptador se detalla en la sección de arquitectura y entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento registró un pico de 4,12 GB en Tesla T4 con el modelo base Qwen3-1.7B y el adaptador LoRA.
- GPU recomendadas: Tesla T4 (validada en entrenamiento); para inferencia, cualquier GPU con al menos la VRAM suficiente para el modelo base de 1.700 millones de parámetros en el tipo de dato elegido.
- Cabe en GPU de consumo: no disponible de forma explícita, aunque el tamaño del modelo base (1.700 millones de parámetros) sugiere viabilidad en GPUs de consumo con memoria suficiente; no se confirma en la información proporcionada.
- Opciones de despliegue: PEFT con Transformers (ejemplo oficial de la model card con `PeftModel.from_pretrained`); otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador se aplica sobre Qwen/Qwen3-1.7B y no se han publicado comparaciones con otras alternativas de la misma categoría (adaptadores LoRA para generación de correo estructurado o modelos de 1.700 millones de parámetros). Los datos de comparación interna se limitan a V1 frente a V2 del propio adaptador, reflejados en la tabla de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; el dataset cubre 32 familias industriales, pero no se documentan análisis de sesgo.
- Riesgo de alucinación: el adaptador está diseñado para no inventar fechas, horas ni URLs, pero la evaluación se limita a 9 casos retenidos; no se garantiza un comportamiento libre de alucinaciones fuera de ese conjunto.
- Limitaciones de contexto o idioma: solo se documentan vietnamita e inglés; el resto de idiomas no están soportados según la model card. La longitud de contexto no se especifica y depende del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3-1.7B de forma independiente.
- Dependencia de postprocesado: varias métricas (cobertura de hechos obligatorios, precisión de revisión necesaria) solo alcanzan el 100% con el script determinista `agent/scripts/draft_email.py`; sin él, la precisión de revisión necesaria se queda en 7/9 (77,8%).
- Esquema acoplado: la salida sigue el esquema `recruit-contracts-v2.schema.json` versión 2.0.0; cambios de esquema requieren reentrenamiento o adaptación del postprocesado.
- Madurez: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-23), por lo que no hay evidencia de uso en producción ni validación externa.
- Tamaño del conjunto de evaluación reducido: 9 casos retenidos limitan la significación estadística de las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dungchauu/mailcal-email-draft-qwen-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Paper, blog, repositorio del proyecto MailCal y demos: no disponibles en la información proporcionada.
