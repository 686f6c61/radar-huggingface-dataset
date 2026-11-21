# KucLab/Barist.2

## Resumen

Barist.2 es un clasificador de seguridad de contenido de código abierto desarrollado por KucLab, sucesor de la línea Censer (Censer.1–.9). Se trata de un transformer decoder-only de 903.552 parámetros entrenado desde cero, cuyo propósito es etiquetar texto como seguro o inseguro y, en caso de serlo, asignar hasta diez categorías de riesgo en un esquema multi-etiqueta (multi-label). Su relevancia radica en que ofrece moderación multilingüe con un checkpoint de apenas 3,6 MB que se ejecuta en CPU, lo que lo hace apto para filtros previos de bajo coste en pipelines de producción.

El modelo combina tres capas de decisión: un clasificador neuronal con umbrales calibrados por temperatura, un pre-filtro determinista basado en expresiones regulares para casos de captura obligatoria (CSAM, autolesión, amenazas directas) y reglas de bloqueo por categoría. Soporta contexto nativo de 4096 tokens con una ruta de agregación por máximos para documentos largos, y declara soporte para ocho idiomas (en, cs, de, es, fr, it, pt, ru), aunque el propio autor documenta que el ucraniano no está soportado.

La versión 2 corrige problemas detectados en la quinta revisión adversarial: fugas de contenido CSAM y de autolesión que pasaban como seguros, falsos positivos sobre texto benigno en checo y una pre-filtración regex demasiado agresiva. Se publica bajo licencia Apache 2.0 y con formato estándar `LlamaForSequenceClassification`, sin necesidad de `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con cabeza de clasificación de secuencia (`LlamaForSequenceClassification`) |
| Parametros totales | 903.552 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens nativos, con ruta chunked-max para documentos largos |
| Tipos de cuantizacion | No disponible (el checkpoint ocupa 3,6 MB y se ejecuta en CPU sin cuantización explícita) |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru (ucraniano documentado como NO soportado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, no un ajuste fino de un modelo preexistente, con 903.552 parámetros y una cabeza de clasificación multi-etiqueta (`problem_type: multi_label_classification`) que aplica sigmoide sobre diez categorías de seguridad más la etiqueta binaria seguro/inseguro. El pipeline de `transformers` detecta automáticamente el modo multi-label y requiere `top_k=-1` para devolver todas las etiquetas. El contexto nativo es de 4096 tokens y existe una ruta de agregación por máximos ("chunked-max") para procesar documentos que exceden esa ventana.

El entrenamiento combina múltiples conjuntos de datos de seguridad y moderación: nvidia/Aegis-AI-Content-Safety-Dataset-1.0, jigsaw-toxic-comment-classification-challenge, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat, databricks/databricks-dolly-15k, Hate-speech-CNERG/hatexplain e Intuit-GenSRF/jigsaw-multilingual-train-unique. La model card documenta un proceso iterativo de revisión adversarial (al menos cinco rondas) con fases de datos etiquetadas M/N/O/P/Q que añadieron 3.056 filas (2.911 paráfrasis inseguras diversas con peso must_catch ×15–25 y 145 pares benignos de contraste). Se aplican pesos diferenciados por tipo de ejemplo (must_catch ×8–12 tras la revisión que lo bajó desde ×40), umbrales por idioma calibrados con temperatura, y un límite de 0,75 con requisito de recall ≥ 80 % sobre la mitad de ajuste. Las puntuaciones están calibradas por temperatura (métrica ECE declarada).

Las innovaciones destacables son la combinación de un pre-filtro regex determinista de tercera versión (v3) con el clasificador neuronal, la emisión de flags operativos (`override: "must_catch"`, `override: "category_block"`, `needs_support`, `needs_review`) y una regla de bloqueo duro por categoría: si `sexual_abuse` o `self_harm` superan 0,3, se fuerza `unsafe` independientemente de la puntuación global.

## Capacidades

- Clasificación binaria seguro/inseguro con puntuaciones calibradas por temperatura.
- Etiquetado multi-label en 10 categorías de seguridad, reportando como máximo las dos categorías con mayor puntuación.
- Detección determinista de casos de captura obligatoria: bloqueo duro de CSAM y enrutado de autolesión a recursos de apoyo (`needs_support`).
- Procesamiento de documentos largos mediante contexto nativo de 4096 tokens y ruta chunked-max.
- Multilingüe en ocho idiomas declarados (en, cs, de, es, fr, it, pt, ru); el ucraniano se documenta explícitamente como no soportado.
- Emisión de flags operativos para revisión humana (`needs_review` en casos de jailbreak) y de anulación (`override`).
- Integración directa con `transformers` sin `trust_remote_code`, y compatibilidad con text-embeddings-inference y endpoints.
- Ejecución en CPU por su tamaño reducido (3,6 MB de checkpoint).

## Casos de uso

- Moderación de comentarios en plataformas UGC: el modelo clasifica cada comentario en milisegundos en CPU y devuelve hasta dos categorías de riesgo, lo que permite enrutar automáticamente a cola de revisión o bloqueo sin coste de GPU.
- Filtro previo en pipelines de generación: colocado antes de un LLM generativo, intercepta prompts de jailbreak, amenazas directas y solicitudes de contenido peligroso, marcando los casos dudosos con `needs_review` en lugar de bloquear a ciegas.
- Cumplimiento y seguridad infantil: la regla de bloqueo duro por categoría (`sexual_abuse` ≥ 0,3 fuerza `unsafe`) y los patrones regex extendidos (telegram, pedofil, material de menores) lo hacen adecuado como primera barrera en productos con requisitos de CSAM.
- Soporte a la salud mental: los casos de autolesión se enrutan a `needs_support` con recursos de ayuda (Linka bezpečí en checo) en lugar de un bloqueo seco, lo que permite integrar mensajes de acompañamiento.
- Moderación multilingüe en foros europeos: cubre ocho idiomas con umbrales por idioma y límite de FPR, útil para comunidades en checo, alemán, francés, italiano, portugués, ruso y español.
- Análisis de documentos largos: gracias a los 4096 tokens nativos y la ruta chunked-max, puede evaluar artículos, hilos completos o transcripciones sin truncar.
- Investigación en seguridad de modelos: su tamaño (menos de un millón de parámetros) permite reproducir el entrenamiento y auditar el comportamiento en hardware modesto, útil para estudios de calibración y falsos positivos.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| F1 @ 0,5 (test) | 0,8238 | Conjunto de test del autor |
| Deteccion model-only heldout2 (raw @0,5) | 51/75 | Conjunto limpio de 91 formulaciones nuevas |
| Deteccion via pipeline CLI (temp + umbrales) | 55/75 | Incluye temperatura y umbrales por idioma |
| Censer.9 raw (referencia) | 57/75 | Versión anterior |
| FPR checo held-out | 10,0 % (23/230) | Texto benigno en checo |
| FPR checo held-out (Barist.1) | 6,5 % (15/230) | Objetivo declarado ≤ 3 % |
| F1 ucraniano textdetox @0,5 | ≈ 0,10 | Documentado como no soportado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo es un clasificador y no un generador.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el checkpoint de 3,6 MB y 903.552 parámetros cabe en memoria RAM de cualquier equipo.
- GPU recomendadas: no necesarias. Cualquier GPU (incluso integrada) puede ejecutarlo, pero el diseño está orientado a CPU.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), ONNX, text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Barist.2 | 903.552 | 4096 | Clasificacion de seguridad multi-label | Apache 2.0 | Ejecutable en CPU, 8 idiomas |
| Censer.9 | No disponible | No disponible | Clasificacion de seguridad | No disponible | Predecesor directo; 57/75 en heldout2 raw |
| Llama Guard (Meta) | No disponible en la informacion | No disponible | Clasificacion de seguridad | No disponible | Referencia habitual de la categoría; no se dispone de datos comparativos en esta ficha |
| ShieldGemma (Google) | No disponible en la informacion | No disponible | Clasificacion de seguridad | No disponible | Referencia habitual de la categoría; no se dispone de datos comparativos en esta ficha |

No se dispone de datos verificables de rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- El propio autor documenta que el ucraniano no está soportado (F1 ≈ 0,10 en textdetox), pese a aparecer en la lista de idiomas del repositorio.
- Los umbrales por idioma están actualmente todos a 0,5, es decir, efectivamente desactivados según la model card.
- El FPR en checo held-out es del 10,0 %, por encima del objetivo declarado del 3 %, lo que implica una tasa de falsos positivos no despreciable en texto benigno.
- La detección model-only en el conjunto heldout2 es de 51/75 (68 %), inferior a Censer.9 (57/75); parte de la cobertura depende del pre-filtro regex y de las reglas de bloqueo por categoría.
- Riesgo de falsos positivos por expresiones regulares y por jerga o contextos benignos (noticias, slang, ciudades), aunque la v3 ha reducido casos concretos.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de clasificación errónea en formulaciones novedosas no cubiertas por el entrenamiento.
- Sesgos potenciales derivados de los datasets de entrenamiento (Jigsaw, Civil Comments, HateXplain, etc.), con posible sobrerrepresentación de ciertos dominios y variación de etiquetado entre fuentes.
- Las categorías reportadas se limitan a las dos de mayor puntuación, lo que puede ocultar riesgos secundarios.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados; conviene validar con datos propios antes de producción.
- El script de inferencia conserva el nombre histórico `censer.py`, lo que puede confundir en la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Barist.2
- Repositorio GitHub del proyecto: no disponible en la información proporcionada (la model card menciona archivos del repo como `reports/cs_benign.json`, `reports/lang_thresholds.json` y `mustcatch_heldout2.jsonl`, pero sin URL explícita)
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-1.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset thesofakillers/jigsaw-toxic-comment-classification-challenge: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset PKU-Alignment/BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset lmsys/toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset databricks/databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset Hate-speech-CNERG/hatexplain: https://huggingface.co/datasets/Hate-speech-CNERG/hatexplain
- Dataset Intuit-GenSRF/jigsaw-multilingual-train-unique: https://huggingface.co/datasets/Intuit-GenSRF/jigsaw-multilingual-train-unique
