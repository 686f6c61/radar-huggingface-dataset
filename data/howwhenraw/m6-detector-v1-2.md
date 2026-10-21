# howwhenRaw/m6-detector-v1-2

## Resumen

M6 Security Detector v1-2 es un sistema de clasificación multi-tarea orientado a seguridad, publicado por el usuario howwhenRaw en HuggingFace. No es un modelo generativo: se compone de un tronco transformer congelado de 0,6B parámetros y 28 capas (denominado `qwen3-06b-sec-m5a-r5`, alojado en un repositorio separado) sobre el que se montan 7 cabezas de sondeo (probe heads) entrenadas para resolver seis tareas de detección en una única pasada de inferencia: moderación de contenido, jailbreak / inyección directa de prompt, intención maliciosa en conversaciones multi-turno, identificación de PII, inyección indirecta de prompt e inyección de instrucciones de alto riesgo.

El problema que aborda es el de las barreras de seguridad y moderación en aplicaciones LLM, donde habitualmente se despliegan varios clasificadores independientes (uno para contenido tóxico, otro para PII, otro para prompt injection). La propuesta del autor es consolidar todas esas comprobaciones en un solo tronco con múltiples cabezales, de forma que un único forward pass devuelva el veredicto de las seis tareas, con inferencia determinista y umbrales calibrados en dominio logit.

Es relevante ahora por su enfoque arquitectónico, pero también por su estado: el propio autor lo etiqueta como línea base de primera iteración y reporta un veredicto de FAIL frente a las puertas de producción en el conjunto de reto (challenge suite). El repositorio ocupa 0,1 GB, tiene licencia Apache-2.0, soporta chino e inglés y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tronco transformer congelado (Qwen3-0.6B, 28 capas) + 7 cabezas de sondeo discriminativas sobre características multicapa |
| Parámetros totales | 0,6B en el tronco (`qwen3-06b-sec-m5a-r5`); cabezas en `probe-heads.pt` (50 MB); total exacto no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del tronco Qwen3-0.6B, no especificada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `probe-heads.pt` (PyTorch), `ood_centers.json`, `calib.json`, `config.json`, `head_structure.json`, `metrics.json`, `train_log.jsonl`; formato del tronco no disponible |

## Arquitectura y entrenamiento

La arquitectura no entrena el tronco: lo congela. Sobre el backbone `m5a-r5` (0,6B parámetros, 28 capas) se extraen características de cinco capas intermedias y finales —{4, 12, 20, 24, 28}— combinando dos estrategias de pooling (`last` y `mean`), lo que produce una representación concatenada de 10.240 dimensiones. Sobre esa representación se entrenan 7 cabezas discriminativas que cubren las seis tareas (la tarea T4 de PII emplea dos cabezales, uno a nivel de documento y otro con etiquetado de spans en formato BIO). La decisión final combina umbrales de dos bandas en dominio logit —definidos en `calib.json`, con campo `threshold_space` según el esquema v0.3.18 o superior— y supresión de out-of-distribution mediante distancias de Mahalanobis calculadas por tarea (`ood_centers.json`).

El autor indica que v1-2 se entrenó sobre datos «clean hot-fixed» con una corrección de polaridad de valores aplicada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables, en principio, a un clasificador). La iteración v2 está especificada en la ADR-2 congelada e incluye LoRA de rango 16, una reconstrucción de T4 condicionada por contexto y un refuerzo de cobertura de formularios; sus métricas están pendientes de publicación.

## Capacidades

- Moderación de contenido (T1): clasificación binaria de contenido no apto con umbral calibrado a cero falsos positivos en dev.
- Detección de jailbreak e inyección directa de prompt (T2): identifica intentos de manipular el system prompt o evadir restricciones.
- Detección de intención maliciosa (T3): diseñada para grooming multi-turno y contexto largo.
- Identificación de PII (T4): doble cabecera, una a nivel de documento y otra con spans BIO para localizar entidades en el texto.
- Detección de inyección indirecta de prompt (T5): orientada a contenido recuperado o incrustado (por ejemplo, resultados de herramientas o documentos).
- Detección de inyección de instrucciones de alto riesgo (T6).
- Inferencia determinista en una sola pasada para las seis tareas simultáneamente.
- No dispone de generación de texto, razonamiento generativo, tool calling ni capacidades multimodales.

## Casos de uso

- Puerta de entrada en asistentes conversacionales: ejecutar T2 y T6 sobre cada mensaje de usuario antes de enviarlo al LLM generativo, con una sola pasada de 0,6B parámetros y umbrales en dominio logit que permiten fijar la tasa de falsos positivos.
- Moderación de salida en plataformas de contenido generado por usuarios: T1 como filtro previo a revisión humana, dado que el modelo devuelve una puntuación calibrada y no requiere un segundo modelo de moderación.
- Redacción de PII en pipelines documentales: la doble cabecera de T4 (documento + spans BIO) permite localizar entidades y sustituirlas antes de indexar documentos en un sistema RAG o de almacenarlos.
- Protección de pipelines RAG frente a inyección indirecta: T5 evalúa el texto recuperado antes de insertarlo en el contexto del modelo, cubriendo el vector de ataque en el que un documento envenenado contiene instrucciones.
- Barreras de seguridad en agentes multi-paso: T3 y T6 pueden evaluar la trayectoria completa de una conversación o de una secuencia de herramientas, no solo el último turno, lo que encaja con detección de grooming y de escalado gradual de instrucciones.
- Filtro previo en asistentes de código o de automatización: T6 detecta instrucciones de alto riesgo embebidas en prompts o en texto de terceros antes de que el agente ejecute acciones.
- Aplicaciones bilingües chino-inglés: el soporte declarado de zh y en permite usar el mismo clasificador en productos con audiencias en ambos idiomas, aunque no hay datos publicados de rendimiento por idioma.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de desarrollo, con recall medido en el punto de cero falsos positivos:

| Tarea | Descripción | Recall @ zero-FP (dev) |
|---|---|---|
| T1 | Moderación de contenido | 0,680 |
| T2 | Jailbreak / inyección directa de prompt | 0,812 |
| T3 | Intención maliciosa (multi-turno, contexto largo) | 0,751 |
| T4 | Identificación de PII (doble cabecera doc + BIO) | 0,885 |
| T5 | Inyección indirecta de prompt | 0,948 |
| T6 | Inyección de instrucciones de alto riesgo | 0,976 |

Lecturas en la challenge suite con doble runpoint:

| Tarea | Recall @ QA point | Veredicto |
|---|---|---|
| T4 | 100 | FAIL frente a las puertas de producción |
| T5 | 98,3 | FAIL frente a las puertas de producción |
| T6 | 100 | FAIL frente a las puertas de producción |

Contraste con la línea base v0: una sonda discriminativa sobre log-probabilidades de `r5` alcanza solo un 0-2 % de recall a cero falsos positivos, frente al 68-98 % de esta arquitectura. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, ni métricas de precisión, F1 o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el tronco de 0,6B ocupa aproximadamente 1,2 GB en fp16 y 2,4 GB en fp32; a ello se suman 50 MB de cabezas y 32 MB de centros Mahalanobis (estimación aritmética a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre debería acomodar el conjunto en fp16; el autor no publica requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060 Ti, RTX 4090 y similares, dado el tamaño del tronco.
- Opciones de despliegue: no hay soporte declarado para vLLM, TGI, llama.cpp u Ollama (el modelo no es generativo y se distribuye como pesos PyTorch más scripts propios). El flujo previsto es cargar el tronco `qwen3-06b-sec-m5a-r5` desde su repositorio, extraer características con `scripts/m6_feat_probe.py` y aplicar cabezas y umbrales con `scripts/m6_infer.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento, contexto ni licencia de modelos alternativos, por lo que la comparación cuantitativa no está disponible. Cualitativamente, este modelo se sitúa en la categoría de clasificadores de seguridad para LLM (frente a los cuales la comparación habitual se hace por tarea: moderación, jailbreak, PII e inyección de prompt), pero no se han facilitado métricas de terceros para contrastar.

| Modelo | Parámetros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| M6 Security Detector v1-2 | 0,6B (tronco) + cabezas | No disponible | Apache-2.0 | Recall @ zero-FP 0,680-0,976 en dev |
| Alternativas de la categoría (clasificadores de seguridad para LLM) | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Es una línea base de primera iteración: el propio autor reporta veredicto FAIL frente a las puertas de producción en T4, T5 y T6 sobre la challenge suite, pese a los recalls altos.
- T1 (moderación de contenido) es la tarea más débil, con un recall de 0,680 a cero falsos positivos en dev; un 32 % de contenido no apto pasaría el filtro en ese punto de operación.
- Solo cubre chino e inglés; no se han publicado métricas desagregadas por idioma, por lo que se desconoce si el rendimiento es homogéneo entre ambos.
- No es un modelo generativo: no puede explicar sus decisiones, y cualquier flujo que requiera justificación textual necesitará un componente adicional.
- Depende de dos repositorios y de scripts propios (`m6_feat_probe.py`, `m6_infer.py`); no hay integración declarada con servidores de inferencia estándar, lo que añade coste de integración.
- Los umbrales están calibrados en dominio logit para un runpoint concreto; recalibrar sobre un dominio distinto es responsabilidad del integrador.
- La supresión OOD basada en distancias de Mahalanobis puede degradar el recall si la distribución de entrada difiere de la de calibración (por ejemplo, dominios técnicos o jerga específica).
- Sesgos conocidos: no documentados en la información disponible; al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos por demografía, dialecto o dominio.
- Riesgo de falsos positivos en producción: los umbrales a cero FP se midieron en dev, no en tráfico real.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución y conservación del aviso de licencia; no se declaran restricciones adicionales.
- Madurez: 0 descargas y 0 valoraciones en HuggingFace, sin validación independiente de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/howwhenRaw/m6-detector-v1-2
- Repositorio del tronco: `qwen3-06b-sec-m5a-r5` (repositorio separado citado en la model card; URL no disponible en la información proporcionada)
- Repositorio complementario en GitHub con la cadena de evidencia e informes (`reports/m6/final-20261022-0104.md`, ADR-1/ADR-2): citado en la model card, URL no disponible en la información proporcionada
