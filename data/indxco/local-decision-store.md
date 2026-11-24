# indxco/local-decision-store

## Resumen

`indxco/local-decision-store` es el registro por defecto de Local Decision Store (LDS), una librería Python que distribuye "packs de decisión" pequeños y calibrados para tareas de clasificación de texto. No es un modelo de lenguaje generativo, sino una colección de clasificadores ligeros que se ejecutan en CPU dentro del propio proceso del usuario y devuelven respuestas con la forma de la API Decisions. El repositorio actúa como índice `lds.registry/v1` a través de un fichero `catalog.json`.

El proyecto lo mantiene el usuario `indxco` y se publica bajo licencia Apache-2.0. Los packs cubren categorías como privacidad y seguridad (detección de PII, PHI, phishing, fugas de secretos, inyección de prompts), atención al cliente (urgencia, intención de reembolso, riesgo de churn, departamento), moderación de contenido (toxicidad, acoso, autolesión, contenido sexual, violencia), calidad de texto (sentimiento, formalidad, emoción, calidad de escritura) y documentos de negocio (tipo de documento, categoría de producto, seniority de puesto).

La relevancia actual reside en su enfoque de despliegue local y offline: tras la primera descarga, los packs se cargan desde caché (`~/.lds`) sin acceso a red, lo que facilita su uso en entornos con requisitos de privacidad o latencia estricta. El estado del proyecto es de vista previa (`status: preview`, `quality: dev`), con etiquetas de oro generadas por un modelo (`qwen3-32b`) y no por revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (packs de clasificación; algunos usan un embedder int8 multilingual-E5-small) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (para los packs de tipo `embed` que usan el embedder) |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 (el embedder multilingual-E5-small mantiene licencia MIT) |
| Formato de pesos | no disponible (ejecución vía librería `local-decision-store`; ONNX según etiquetas) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de los clasificadores. Los packs se dividen en dos niveles: `lite` y `embed`. Los packs `embed` utilizan un embedder `multilingual-E5-small` cuantizado a int8, descargado desde su repositorio de origen; los packs `lite` no especifican el componente subyacente. La librería se distribuye vía PyPI (`local-decision-store`) y requiere una versión posterior a 0.1.7 para las funciones `lds.load` y `lds run`.

El entrenamiento y la evaluación se basan en etiquetas de oro generadas por un modelo (`qwen3-32b`), no por revisión humana. La release documentada es `packs-2026-11-23.1`, construida con `lds` 0.1.5. Las métricas de calidad se miden sobre ese conjunto etiquetado por modelo: AUROC para predicados, macro-F1 para elecciones y QWK (quadratic weighted kappa) para puntuaciones. Solo se publican release candidates cuyas puertas de calidad y paridad pasan.

## Capacidades

- Clasificación de texto en tareas cerradas y predefinidas (predicados binarios, elecciones multiclase y puntuaciones ordinales).
- Detección de PII: email, teléfono, dirección, documento de identidad gubernamental, tarjeta de pago y nombres de persona.
- Detección de PHI (información sanitaria), phishing, fugas de secretos, spam e inyección de prompts.
- Moderación: toxicidad, acoso, autolesión, contenido sexual y violencia, con niveles graduados.
- Análisis de atención al cliente: urgencia, intención de reembolso, riesgo de churn, necesidad de intervención humana y departamento de soporte.
- Análisis de documentos de negocio: tipo de documento, categoría de producto, seniority de puesto, riesgo de cláusulas contractuales y afirmaciones de marketing no sustanciadas.
- Calidad de texto: sentimiento, formalidad, emoción primaria y calidad de escritura.
- Enrutamiento de consultas y evaluación de riesgo de acciones de agentes (packs de la categoría `agents-rag`).
- Ejecución local en CPU, en proceso, con soporte offline mediante `LDS_OFFLINE=1`.
- No se documentan capacidades de generación de texto, razonamiento abierto, código, matemáticas, visión, audio ni tool calling generativo.

## Casos de uso

- Redacción y anonimización de datos: el pack `pii-detect` permite detectar teléfonos, emails, direcciones y tarjetas de pago en textos antes de enviarlos a un servicio externo, ejecutándose en CPU y sin salida a red tras la primera descarga.
- Filtrado de phishing y spam en correo o mensajes: los packs `phishing` y `spam` ofrecen una puntuación de probabilidad que puede integrarse en un pipeline de preprocesado para descartar mensajes antes de un modelo mayor.
- Moderación de comunidades: los packs `toxicity`, `harassment`, `self-harm`, `sexual-content` y `violence` permiten clasificar contenido por nivel y aplicar políticas de revisión o bloqueo con latencia baja en CPU.
- Triaje de tickets de soporte: `support-urgency`, `support-department`, `needs-human` y `refund-intent` permiten enrutar y priorizar tickets automáticamente, con métricas QWK y macro-F1 declaradas por el autor.
- Protección de agentes y RAG: `prompt-injection` y `tool-call-risk` sirven para inspeccionar entradas y acciones de un agente antes de ejecutar herramientas o recuperar documentos.
- Cumplimiento en documentos sanitarios o legales: `phi-detect` y `contract-risk` permiten marcar fragmentos con información sanitaria o cláusulas de riesgo en pipelines de revisión documental.
- Clasificación de catálogo y documentos: `product-category`, `doc-type` y `job-seniority` permiten etiquetar productos, tipos de documento y niveles de puesto en procesos de ingestión de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye métricas de calidad sobre el conjunto de oro etiquetado por modelo (no verificado por humanos):

| Pack | Nivel | Categoría | Pregunta | Métrica de oro |
|---|---|---|---|---|
| `churn-risk` | lite | customer-support | `support.churn_risk` | qwk 0.964 |
| `complaint` | lite | customer-support | `support.is_complaint` | auroc 0.996 |
| `contract-risk` | embed | business-docs | `contract.clause_risk` | qwk 0.850 |
| `doc-type` | lite | business-docs | `doc.type` | macro_f1 0.969 |
| `emotion` | lite | text-quality | `emotion.primary` | macro_f1 0.954 |
| `formality` | lite | text-quality | `formality.register` | macro_f1 0.964 |
| `harassment` | lite | moderation | `harassment.kind` | macro_f1 0.896 |
| `job-seniority` | lite | business-docs | `job.seniority` | macro_f1 0.967 |
| `marketing-claims` | lite | business-docs | `marketing.unsubstantiated_claim` | auroc 0.997 |
| `needs-human` | lite | customer-support | `support.needs_human` | auroc 0.962 |
| `phi-detect` | lite | privacy-security | `phi.contains_health_info` | auroc 0.997 |
| `phishing` | lite | privacy-security | `phishing.is_phishing` | auroc 0.997 |
| `pii-detect` | lite | privacy-security | `pii.contains_pii` y subpredicados | auroc 0.999 |
| `product-category` | embed | business-docs | `product.category` | macro_f1 0.947 |
| `product-category` | lite | business-docs | `product.category` | macro_f1 0.883 |
| `prompt-injection` | lite | privacy-security | `injection.is_injection` | auroc 0.997 |
| `query-routing` | lite | agents-rag | `routing.destination` | macro_f1 0.905 |
| `refund-intent` | lite | customer-support | `support.refund_intent` | auroc 0.999 |
| `review-helpfulness` | lite | business-docs | `review.helpfulness` | qwk 0.957 |
| `secret-leak` | lite | privacy-security | `secrets.contains_secret` | auroc 0.999 |
| `self-harm` | embed | moderation | `self_harm.risk` | qwk 0.895 |
| `sentiment` | embed | text-quality | `sentiment.polarity` | qwk 0.882 |
| `sentiment` | lite | text-quality | `sentiment.polarity` | qwk 0.838 |
| `sexual-content` | lite | moderation | `sexual.level` | qwk 0.828 |
| `spam` | lite | privacy-security | `spam.is_spam` | auroc 0.999 |
| `support-department` | lite | customer-support | `support.department` | macro_f1 0.905 |
| `support-urgency` | lite | customer-support | `support.urgency` | qwk 0.920 |
| `tool-call-risk` | lite | agents-rag | `agent.action_risk` | qwk 0.932 |
| `toxicity` | lite | moderation | `toxicity.level` | qwk 0.919 |
| `violence` | lite | moderation | `violence.level` | qwk 0.885 |
| `writing-quality` | lite | text-quality | `writing.quality` | qwk 0.812 |

## Requisitos de hardware

- Inferencia en CPU: los packs están diseñados para ejecutarse en CPU dentro del proceso del usuario.
- VRAM estimada: no disponible (no se publican requisitos de memoria).
- GPU recomendadas: no aplica; el proyecto no documenta uso de GPU.
- Cabe en consumer GPU: no aplica; el diseño es CPU-first.
- Despliegue: librería Python `local-decision-store` (PyPI), ejecutable con `uvx local-decision-store` o mediante `import lds`. El extra `embed` es necesario para los packs que usan el embedder (`uvx --from "local-decision-store[embed]" ...`).
- Latencia y throughput: la model card indica que la latencia se midió en una máquina aarch64 compartida, no en la máquina de referencia; no se publican cifras concretas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores ligeros empaquetados como registro de decisión local).

## Limitaciones y advertencias

- Estado de vista previa y calidad de desarrollo (`status: preview`, `quality: dev`): no se recomienda su uso en producción sin validación adicional.
- Las etiquetas de oro están generadas por un modelo (`qwen3-32b`), no revisadas por humanos; superar la puerta de calidad significa reproducir esas etiquetas, no alcanzar precisión verificada por humanos.
- La robustez ante entradas fuera de distribución y adversarias varía según el pack y no está cuantificada.
- Idiomas soportados limitados a inglés y japonés; no se documenta cobertura de castellano.
- La latencia se midió en una máquina compartida aarch64, no en la máquina de referencia, por lo que las cifras de rendimiento no son representativas de todos los entornos.
- Los packs `embed` dependen de un embedder externo (multilingual-E5-small, licencia MIT) que debe descargarse en el primer uso; sin red y sin caché previa, no funcionan.
- Licencia Apache-2.0 para los packs, pero el embedder conserva su licencia upstream (MIT); conviene revisar ambas para uso comercial.
- No se documentan sesgos específicos por pack; al ser clasificadores de etiquetas generadas por modelo, pueden heredar sesgos del modelo etiquetador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/indxco/local-decision-store
- Paquete PyPI: https://pypi.org/project/local-decision-store/
