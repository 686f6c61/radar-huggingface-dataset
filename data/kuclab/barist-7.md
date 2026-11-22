# KucLab/Barist.7

## Resumen

Barist.7 es un clasificador de texto multilingüe de seguridad de contenido desarrollado por KucLab. Se trata de un transformer decoder-only de 903.552 parámetros entrenado desde cero, diseñado para la tarea de clasificación multi-etiqueta: detecta si un texto es seguro o inseguro y, en caso negativo, asigna hasta 10 categorías de seguridad específicas. Es la séptima iteración de la línea Barist, sucesora de la familia Censer (Censer.1–.9), y se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema de la moderación de contenido en entornos multilingües con requisitos de despliegue mínimos: su checkpoint de 3,6 MB cabe en CPU y no requiere GPU para inferencia. Incorpora un contexto nativo de 4096 tokens con una ruta de chunked-max para documentos largos, umbrales por idioma calibrados para mantener una tasa de falsos positivos (FPR) ≤ 5 % con recall ≥ 80 %, y un pre-filtro determinista de "must-catch" que bloquea de forma dura CSAM y redirige autolesiones a recursos de apoyo.

Su relevancia actual radica en la combinación de tamaño extremadamente reducido, soporte multilingüe para ocho idiomas (en, cs, de, es, fr, it, pt, ru) y un pipeline de calibración por temperatura que produce puntuaciones calibradas. Está pensado para integración directa en pipelines de moderación de contenido, con compatibilidad nativa con `transformers` y despliegue mediante text-embeddings-inference y endpoints compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForSequenceClassification) |
| Parametros totales | 903.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos; ruta chunked-max para documentos largos |
| Tipos de cuantizacion | no disponible (checkpoint de 3,6 MB; inferencia en CPU sin cuantización específica documentada) |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru (ucraniano documentado como NO soportado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Barist.7 es un transformer decoder-only de 903.552 parámetros entrenado desde cero, configurado como `LlamaForSequenceClassification` con `problem_type: multi_label_classification`. La clasificación es multi-etiqueta: aplica sigmoid sobre las salidas y permite recuperar todas las categorías activas con `top_k=-1`. El modelo se cargó con `transformers` sin necesidad de `trust_remote_code`. Incorpora un contexto nativo de 4096 tokens y una ruta de chunked-max para procesar documentos que exceden esa ventana.

El entrenamiento combinó múltiples datasets de seguridad y moderación: nvidia/Aegis-AI-Content-Safety-Dataset-1.0, jigsaw-toxic-comment-classification-challenge, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat, databricks/databricks-dolly-15k, Hate-speech-CNERG/hatexplain e Intuit-GenSRF/jigsaw-multilingual-train-unique. El proceso incluyó fases de revisión adversarial documentadas en la model card (fases L, M, N, O, P, Q), con incrementos de datos de entrenamiento de miles de filas por fase, ponderación específica de ejemplos "must-catch" (pesos 8–25), pares benignos contrapuestos y ajuste de umbrales por categoría con precisión ≥ 0,7. Se aplicó calibración por temperatura a las puntuaciones de salida y un pre-filtro regex determinista (v3) para detección de CSAM, amenazas escolares, autolesiones y jailbreaks, con excepciones de contexto de apoyo y banderas `needs_support` / `needs_review`.

## Capacidades

- Clasificación binaria safe/unsafe con puntuaciones calibradas por temperatura.
- Clasificación multi-etiqueta en 10 categorías de seguridad, reportando como máximo las dos categorías con mayor puntuación.
- Contexto nativo de 4096 tokens y procesamiento de documentos largos mediante chunked-max.
- Soporte multilingüe para en, cs, de, es, fr, it, pt, ru, con umbrales por idioma calibrados (actualmente todos a 0,5, efectivamente desactivados según la model card).
- Pre-filtro determinista "must-catch": bloqueo duro de CSAM, redirección de autolesiones a recursos de apoyo (Linka bezpečí) con campo `override: "must_catch"`.
- Bloqueo duro por categoría: puntuaciones ≥ 0,3 en `sexual_abuse` o `self_harm` fuerzan `unsafe` con `override: category_block`.
- Marcado de jailbreaks como `needs_review` (no bloqueo duro).
- Inferencia en CPU sin GPU, con checkpoint de 3,6 MB.
- Compatibilidad con el pipeline de `transformers` (`text-classification`), text-embeddings-inference y endpoints compatibles.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo clasifica en tiempo real comentarios multilingües como safe/unsafe y asigna categorías de seguridad, con umbrales calibrados para mantener FPR ≤ 5 % y evitar sobrerrestricción de contenido legítimo.
- Filtrado de prompts en aplicaciones de chat con LLM: actúa como guardrail de entrada, detectando jailbreaks (marcados como `needs_review`) y contenido peligroso (armas, drogas, CSAM) antes de que lleguen al modelo generativo.
- Detección de autolesiones con derivación a recursos de apoyo: el pre-filtro identifica formulaciones de autolesión en primera persona y activa `needs_support` con enlace a líneas de ayuda, en lugar de un bloqueo ciego.
- Moderación de contenido en plataformas educativas: clasificación de mensajes de estudiantes en múltiples idiomas europeos, con bloqueo duro de material de abuso sexual infantil y amenazas escolares.
- Procesamiento de documentos largos para auditoría de contenido: la ruta chunked-max permite analizar artículos, hilos completos o transcripciones que superan los 4096 tokens sin truncamiento.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con un checkpoint de 3,6 MB, puede integrarse en funciones serverless, dispositivos edge o contenedores ligeros sin GPU, con latencia mínima.
- Pre-filtrado en pipelines de anotación humana: las puntuaciones calibradas y las categorías top-2 permiten priorizar la revisión manual de los casos más ambiguos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test F1@0.5 | 0,8238 |
| Held-out model-only (heldout2, raw @0.5) | 51/75 |
| Held-out vía CLI (temperatura + umbrales por idioma) | 55/75 |
| FPR checo en held-out (230 frases) | 10,0 % (23/230) |
| FPR checo objetivo | ≤ 3 % |
| F1 ucraniano (textdetox, @0.5) | ≈ 0,10 (idioma no soportado) |
| Detección model-only en heldout2 (Barist.1) | 34/60 (Censer.9: 57/75 raw) |

No se han publicado resultados comparativos con otros modelos de moderación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el checkpoint ocupa 3,6 MB y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer, aunque no es necesario su uso.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), text-embeddings-inference, endpoints compatibles, ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño del modelo sugiere latencia muy baja en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Barist.7 | 903.552 | 4096 | 8 | Apache 2.0 | Clasificación multi-etiqueta desde cero, CPU |
| Censer.9 (predecesor) | no disponible | no disponible | no disponible | no disponible | Clasificación de seguridad, línea anterior |
| Modelos de moderación basados en LLM (p. ej. Llama Guard) | miles de millones | variable | variable | variable | Clasificación generativa de seguridad |

No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada. La comparativa se limita a diferencias de escala y enfoque: Barist.7 es tres órdenes de magnitud menor que los clasificadores basados en LLM, con la contrapartida de una capacidad de generalización más limitada.

## Limitaciones y advertencias

- El modelo presenta una tasa de falsos positivos en checo del 10,0 % en held-out, por encima del objetivo del 3 % declarado por el autor.
- El ucraniano está documentado como NO soportado (F1 ≈ 0,10 en textdetox), pese a que el pre-filtro incluye patrones ru-uk.
- Los umbrales por idioma están actualmente todos a 0,5 (efectivamente desactivados), lo que reduce la calibración específica por lengua.
- Riesgo de falsos negativos en CSAM y autolesiones: la model card documenta 16/61 casos de heldout2 que pasaban como seguros antes de introducir el bloqueo duro por categoría; persisten limitaciones de detección model-only (51/75 en heldout2).
- El pre-filtro regex puede producir falsos positivos en contextos ambiguos (slang, noticias, expresiones figuradas), aunque la versión v3 ha reducido estos casos.
- El modelo es un clasificador, no un generador: no produce explicaciones ni razonamiento sobre sus decisiones.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para entornos de producción de alta seguridad.
- El sesgo del modelo depende de la composición de los datasets de entrenamiento (Jigsaw, Civil Comments, BeaverTails, etc.), con posible infrarrepresentación de variedades dialectales y contextos culturales no anglosajones.
- No se han publicado resultados de benchmarks comparativos con modelos de referencia, lo que dificulta la evaluación objetiva de su rendimiento relativo.

## Enlaces

- Hugging Face: https://huggingface.co/KucLab/Barist.7
- Repositorio GitHub (referenciado en la model card): no disponible como URL directa en la información proporcionada
- Paper: no disponible
- Demo: no disponible
