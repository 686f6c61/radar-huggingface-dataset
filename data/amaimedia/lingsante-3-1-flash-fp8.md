# AMAImedia/LingSante-3.1-Flash-FP8

## Resumen
LingSante-3.1-Flash-FP8 es una versión cuantizada en FP8 del modelo LingSante-3.1-flash, desarrollado por inclusionAI y redistribuido por AMAImedia. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a razonamiento médico complejo, comunicación sanitaria profesional, investigación basada en evidencia y ejecución de tareas médicas de largo horizonte. Con 560 mil millones de parámetros totales y 25 mil millones activos por token, está diseñado para escenarios donde la precisión factual y la verificación de evidencia son críticas.

El modelo parte de Ling-3.1-flash y ha sido sometido a un pipeline de preentrenamiento médico mixto, mid-training, ajuste supervisado, aprendizaje por refuerzo específico de tarea y destilación on-policy multi-profesor. Soporta una ventana de contexto de un millón de tokens y 30 idiomas, lo que lo sitúa en la categoría de modelos de contexto largo con cobertura multilingüe amplia.

La relevancia de esta ficha radica en que se trata de una cuantización FP8 de un modelo de gran tamaño (573,8 GB de repositorio), publicada bajo licencia MIT y pensada para despliegues de investigación. No es un dispositivo médico y no debe usarse como base independiente para diagnóstico, prescripción o tratamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), tag `bailing_hybrid`, librería transformers con `custom_code` |
| Parametros totales | 572.120.680.768 (≈572 mil millones) |
| Parametros activos | 25 mil millones por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (esta versión); existe una versión GGUF IQ2_M del modelo base |
| Idiomas soportados | zh, en, ru, vi, ja, hi, es, fr, de, pt, it, ar, ko, th, id, ms, bn, tr, pl, uk, nl, cs, sv, ro, el, he, fa, ur, kk, uz (30 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento
LingSante-3.1-flash emplea una arquitectura Mixture-of-Experts con 560 mil millones de parámetros totales y 25 mil millones activos por token. El tag `bailing_hybrid` y la presencia de `custom_code` indican que requiere código personalizado en transformers para su carga, probablemente por variantes en el mecanismo de atención o en el enrutamiento de expertos. No se dispone de detalles públicos sobre el número exacto de expertos, la proporción de activación ni la composición del dataset de preentrenamiento en la información proporcionada.

El entrenamiento combina preentrenamiento médico mixto nativo, mid-training, ajuste supervisado, aprendizaje por refuerzo específico de tarea y destilación on-policy multi-profesor. El autor describe tres marcos de trabajo: alineación evidencia-razonamiento médico, tareas médicas de largo horizonte con entornos interactivos y verificación estructurada, y alineación de comportamiento profesional sanitario. No se especifican el número de tokens de entrenamiento ni la composición exacta del corpus.

## Capacidades
- Razonamiento médico complejo: identificación de factores clave en decisiones clínicas, validación de evidencia y resolución de conflictos entre fuentes.
- Tareas médicas de largo horizonte: ejecución de flujos de trabajo multi-etapa con coordinación de herramientas y adaptación del plan ante información nueva.
- Comportamiento profesional sanitario: respuestas contextualizadas, profesionales y accionables ante información incompleta o cambiante.
- Generación de texto conversacional en 30 idiomas, incluidos español, inglés, chino, ruso, árabe, hindi y japonés.
- Uso de herramientas (tool calling) en entornos médicos estructurados, según el marco de tareas de largo horizonte descrito.
- Razonamiento multi-paso y verificación de evidencia a lo largo de escenarios interconectados.
- Ventana de contexto de un millón de tokens para documentos clínicos extensos o historiales completos.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso
- Revisión de literatura médica a gran escala: el modelo puede procesar corpus de hasta un millón de tokens para extraer hallazgos, contrastar evidencias y señalar conflictos entre estudios, gracias a su ventana de contexto y a su entrenamiento en alineación evidencia-razonamiento.
- Asistencia a la documentación clínica: generación de resúmenes de historiales, notas de evolución y cartas de derivación a partir de registros extensos, con verificación de consistencia interna y detección de información faltante.
- Soporte a la investigación traslacional: análisis de protocolos, extracción estructurada de criterios de inclusión/exclusión y comparación de resultados entre cohortes, usando tool calling para consultar bases de datos biomédicas.
- Formación médica simulada: ejecución de escenarios clínicos multi-etapa con coordinación de herramientas y adaptación del plan, útil para entrenamiento de residentes en entornos controlados.
- Comunicación sanitaria multilingüe: generación de material divulgativo y respuestas a pacientes en 30 idiomas, con matices profesionales y adaptación al contexto cultural.
- Automatización de flujos administrativos sanitarios: tramitación de autorizaciones, verificación de requisitos y generación de informes estructurados en pipelines con verificación paso a paso.
- Evaluación de calidad de respuestas clínicas: uso como modelo de referencia en investigación sobre alineación y seguridad en comunicación médica, dado su enfoque en comportamiento profesional.

## Benchmarks y rendimiento
La model card incluye referencias a dos imágenes de benchmarks (`assets/benchmark-overview.png` y `assets/benchmark-results.png`), pero los valores numéricos no están disponibles en el texto proporcionado. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP8: al tratarse de 572 mil millones de parámetros en FP8 (1 byte por parámetro), los pesos ocupan aproximadamente 572 GB, a los que hay que sumar caché KV y overhead. No cabe en ninguna GPU de consumo.
- GPU recomendadas: se requiere un nodo multi-GPU con al menos 8×H100 80 GB (640 GB) o 8×H200 141 GB para FP8 sin offloading. El autor menciona el alquiler de H200/Blackwell para cuantizaciones de modelos de 9B+ y búsquedas.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.) ni en configuraciones de una sola GPU profesional.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); vLLM y TGI no están confirmados en la información disponible. Existe una versión GGUF IQ2_M del modelo base para despliegues con llama.cpp/Ollama, aunque con menor calidad.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingSante-3.1-Flash-FP8 | 572 B | 25 B | 1 M | MIT | Hugging Face (FP8) |
| LingSante-3.1-flash (original) | 560 B | 25 B | 1 M | no disponible en la información | Hugging Face, ModelScope, API Computrix |
| Ling-3.1-flash (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Versión GGUF IQ2_M | 572 B (cuantizado) | 25 B | 1 M | MIT | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias
- El modelo no es un dispositivo médico y no debe usarse como base independiente para diagnóstico, prescripción o tratamiento, según advierte el propio autor.
- Riesgo de alucinación en dominios médicos: aunque el entrenamiento refuerza la verificación de evidencia, no se han publicado tasas de error ni evaluaciones de seguridad clínica en la información disponible.
- Sesgos potenciales derivados de los datos de preentrenamiento y ajuste, no documentados en la model card.
- La cuantización FP8 puede introducir degradación respecto al modelo original en tareas de precisión numérica o razonamiento fino; no se han publicado comparativas FP8 vs. BF16.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor y revisar su procedencia antes de desplegar en producción.
- El repositorio ocupa 573,8 GB, lo que dificulta su descarga y almacenamiento en entornos locales.
- La licencia MIT permite uso comercial, pero la ausencia de evaluación clínica independiente desaconseja su uso en producción sanitaria sin validación adicional.
- Cobertura de 30 idiomas declarada, pero sin métricas por idioma publicadas; el rendimiento en idiomas de bajos recursos (kk, uz, ur) puede ser inferior.
- No se documentan limitaciones específicas de contexto más allá del millón de tokens; el rendimiento en ventanas extremas no está verificado.

## Enlaces
- Hugging Face (esta versión FP8): https://huggingface.co/AMAImedia/LingSante-3.1-Flash-FP8
- Repositorio original: https://huggingface.co/inclusionAI/LingSante-3.1-Flash
- Modelo base Ling-3.1-flash: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Versión GGUF IQ2_M: https://huggingface.co/AMAImedia/Ling-3.1-Flash-1019-AD-IQ2_M-GGUF
- ModelScope: https://www.modelscope.cn/models/inclusionAI/LingSante-3.1-flash
- API Computrix: https://computrix.ai/sg/models/modelservice-1795159585527001414
- X (Twitter) del autor: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/djbionicl
