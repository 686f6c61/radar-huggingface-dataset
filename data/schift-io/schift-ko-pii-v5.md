# schift-io/schift-ko-pii-v5

## Resumen

schift-ko-pii-v5 es un modelo de clasificación de tokens (token-classification) desarrollado por schift-io, diseñado específicamente para la detección de información personal identificable (PII) en texto coreano. Con solo 34 millones de parámetros (33.977.633), es tres veces más pequeño que su predecesor v4 (111M) y obtiene mejores resultados en el benchmark interno de la compañía, lo que lo convierte en una opción ligera y eficiente para tareas de anonimización y redacción de datos personales.

El modelo emplea una arquitectura híbrida: el propio modelo neuronal detecta nombres de personas y direcciones, mientras que un postprocesador basado en expresiones regulares (incluido en el SDK `schift-ko-pii`) se encarga de patrones estructurados como números de teléfono, números de identificación, fechas y URLs. Esta división de responsabilidades permite reducir drásticamente el tamaño del modelo sin sacrificar cobertura en categorías de PII de formato fijo.

La relevancia actual del modelo reside en la creciente necesidad de proteger datos personales en aplicaciones de procesamiento de lenguaje natural, especialmente en el contexto coreano, donde la legislación de privacidad (PIPA) exige un manejo riguroso de la información personal. Al ser un modelo pequeño que funciona únicamente con CPU, puede desplegarse en entornos con recursos limitados, incluyendo dispositivos edge y pipelines de preprocesamiento de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM (Language Foundation Model) encoder, no especificado en detalle |
| Parametros totales | 33.977.633 (34M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | schift-2.0 (licencia propia, no estándar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada públicamente. La model card indica que se trata de un modelo "LFM" (probablemente una variante de encoder basada en la familia LFM2.5, de la cual se menciona un modelo de 350M como comparación). Se trata de un modelo de clasificación de tokens (token-classification) que produce etiquetas para dos categorías principales: `private_person` (nombres de personas) y `private_address` (direcciones). El resto de categorías de PII (teléfonos, fechas, números de identificación, etc.) se delegan a un postprocesador basado en expresiones regulares que forma parte del SDK `schift-ko-pii`.

No se ha publicado información sobre los datos de entrenamiento, el número de tokens utilizados, ni si se emplearon técnicas como RLHF o DPO. La model card menciona un dataset personalizado (`custom`) para el benchmark, pero no detalla el corpus de entrenamiento. El modelo está diseñado para funcionar con el SDK propietario, que incluye el postprocesador y utilidades de enmascarado, aunque también es posible usarlo directamente con la librería `transformers` de HuggingFace.

## Capacidades

- Detección de nombres de personas en coreano, incluyendo apellidos poco comunes, nombres cortos y nombres extranjeros (romanizados o en hanja).
- Detección de direcciones urbanas y rurales en formato coreano.
- Integración con un postprocesador regex que cubre: números de teléfono, números de identificación (resident ID), fechas en formato coreano, matrículas de vehículos, direcciones de correo electrónico y URLs (según la documentación del SDK).
- Funciones de enmascarado y reemplazo selectivo de entidades mediante el SDK `schift-ko-pii` (funciones `mask`, `apply`, `detect`).
- Compatible con la API de `transformers` de HuggingFace (pipeline de token-classification).
- API en la nube gratuita (schift.io) que incluye postprocesado automático.
- Soporte de procesamiento por lotes y de archivos completos mediante el SDK.

## Casos de uso

- Anonimización de documentos legales: el modelo puede redactar nombres de personas y direcciones en sentencias judiciales, contratos o escrituras, cumpliendo con los requisitos de protección de datos del sistema legal coreano. Su precisión en nombres con apellidos poco comunes (F1 de 1.00 en benchmark_v1) lo hace fiable para este escenario.

- Preprocesamiento de datos para entrenamiento de LLMs: antes de alimentar un modelo de lenguaje con datos coreanos extraídos de la web o de bases de datos internas, se puede aplicar este detector para eliminar información personal y evitar que el modelo memorice datos sensibles. Su tamaño reducido permite ejecutarlo en pipelines de datos sin necesidad de GPU.

- Cumplimiento de privacidad en atención al cliente: las transcripciones de llamadas o chats de soporte contienen nombres, teléfonos y direcciones. El modelo puede enmascarar automáticamente estos datos antes de almacenarlos o enviarlos a servicios de análisis, reduciendo el riesgo de filtraciones y facilitando la auditoría de cumplimiento.

- Redacción de informes médicos y registros de pacientes: aunque no está específicamente entrenado para terminología médica, la detección de nombres y direcciones es útil para anonimizar historiales clínicos antes de compartirlos con fines de investigación, siempre que se combine con un postprocesador para números de identificación.

- Protección de datos en sistemas de gestión documental: empresas que manejan grandes volúmenes de documentos coreanos (facturas, contratos, formularios) pueden integrar el modelo en un flujo de ingesta para marcar automáticamente los campos de PII, facilitando la clasificación y el control de acceso.

- Despliegue en dispositivos edge o entornos sin GPU: gracias a sus 34M de parámetros y 136 MB de tamaño, el modelo puede ejecutarse en dispositivos móviles, servidores de bajo coste o entornos de contenedores con recursos limitados, lo que permite anonimizar datos localmente sin enviar información a servicios externos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el benchmark interno `benchmark_v2` (253 casos), con postprocesado (PP):

| Modelo | Params | F1 (+PP) | Precision (+PP) | Recall (+PP) | Tamano |
|---|---|---|---|---|---|
| LFM2.5-Encoder-350M-PII | 350M | 0.254 | 0.207 | 0.328 | ~1.4 GB |
| schift-ko-pii-v4 (roberta) | 111M | 0.802 | 0.802 | 0.802 | 210 MB |
| **schift-ko-pii-v5 (LFM)** | **34M** | **0.823** | **0.812** | **0.834** | **136 MB** |

Resultados sin postprocesado (solo modelo neuronal):

| Modelo | Params | raw F1 | raw P | raw R |
|---|---|---|---|---|
| LFM2.5-350M-PII | 350M | 0.254 | 0.207 | 0.328 |
| schift-ko-pii-v4 | 111M | 0.702 | 0.602 | 0.842 |
| schift-ko-pii-v5 | 34M | 0.578 | 0.847 | 0.439 |

Desglose por categoría en benchmark_v1 (93 casos):

| Categoria | v5 (34M) | v4 (111M) | LFM2.5 (350M) |
|---|---|---|---|
| Person (standard) | 1.00 | 1.00 | 0.67 |
| Person (rare surnames) | 1.00 | 1.00 | 0.60 |
| Person (short names) | 1.00 | 1.00 | 0.57 |
| Address (urban) | 1.00 | 1.00 | 0.67 |
| Address (rural) | 1.00 | 1.00 | 0.60 |
| Phone (via postprocess) | 0.86 | 0.86 | 0.92 |
| Vehicle plate | 1.00 | 1.00 | 0.00 |
| Date (Korean) | 1.00 | 1.00 | 0.00 |
| Resident ID | 1.00 | 1.00 | 0.75 |

Nota: el bajo recall sin postprocesado (0.439) se debe a que el modelo solo predice `private_person` y `private_address`; el resto de categorías las cubre el postprocesador regex por diseño.

## Requisitos de hardware

- Inferencia únicamente con CPU: el modelo está diseñado para funcionar sin GPU, con un tamaño de 136 MB en disco.
- VRAM estimada: no requiere VRAM; puede ejecutarse en memoria RAM estándar (menos de 1 GB).
- GPUs recomendadas: no aplica; cualquier CPU moderna es suficiente. Para despliegues masivos se puede usar cualquier GPU, pero no es necesario.
- Compatibilidad con hardware de bajo consumo: puede ejecutarse en Raspberry Pi, dispositivos móviles o servidores de gama baja.
- Opciones de despliegue: mediante el SDK `schift-ko-pii` (pip install schift-ko-pii), con la librería `transformers` de HuggingFace (pipeline de token-classification), o a través de la API en la nube de schift.io.
- Latencia y throughput: no se han publicado datos oficiales; dado el tamaño del modelo, se espera una latencia de milisegundos por documento en CPU moderna.

## Comparativa con modelos similares

| Modelo | Params | Contexto | F1 (benchmark_v2 +PP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| schift-ko-pii-v5 | 34M | No disponible | 0.823 | schift-2.0 | HuggingFace, SDK |
| schift-ko-pii-v4 | 111M | No disponible | 0.802 | schift-2.0 | HuggingFace, SDK |
| LFM2.5-Encoder-350M-PII | 350M | No disponible | 0.254 | No especificada | HuggingFace (presumible) |

El modelo v5 supera a su predecesor v4 en el benchmark más reciente y es significativamente más pequeño. La comparación con LFM2.5-350M-PII muestra que el modelo de 350M tiene un rendimiento muy inferior en esta tarea específica, lo que sugiere que el enfoque híbrido (modelo + postprocesador) es más eficaz que un modelo grande de propósito general. No se dispone de comparaciones con otros detectores de PII coreanos del mercado (por ejemplo, modelos basados en KLUE o ETRI).

## Limitaciones y advertencias

- El modelo solo detecta dos categorías directamente (personas y direcciones); el resto de tipos de PII dependen del postprocesador regex incluido en el SDK. Si se usa el modelo sin el SDK, la cobertura es muy limitada.
- Sin postprocesado, el recall es bajo (0.439), lo que significa que muchos PII estructurados (teléfonos, fechas, IDs) no se detectan.
- Solo soporta coreano; no funciona con otros idiomas.
- La licencia schift-2.0 es una licencia propietaria no estándar. Es necesario revisar sus términos antes de un uso comercial, especialmente en cuanto a redistribución o modificación.
- No se han publicado detalles sobre los datos de entrenamiento, posibles sesgos o alucinaciones. Al ser un modelo de clasificación de tokens, el riesgo de alucinación es bajo, pero puede haber errores en nombres ambiguos o direcciones mal formateadas.
- No hay información sobre la longitud máxima de contexto; se recomienda probar con textos largos antes de usarlo en producción.
- El modelo fue creado en agosto de 2026 (según la fecha de HuggingFace), lo que indica que es muy reciente y podría tener menos validación externa que modelos más establecidos.

## Enlaces

- HuggingFace: https://huggingface.co/schift-io/schift-ko-pii-v5
- GitHub de schift-io: https://github.com/schift-io
- SDK Python en PyPI: https://pypi.org/project/schift/
- Documentación del SDK: https://schift.io/docs/reference/sdk/
- Página de beta de PII: https://schift.io/pii-beta/
