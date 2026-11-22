# KucLab/Barist.5

## Resumen

Barist.5 es un clasificador de contenido multilingüe de tipo decoder-only transformer entrenado desde cero por KucLab, con 903.552 parámetros y una ventana de contexto nativa de 4096 tokens. Su función es la moderación de contenido: emite una etiqueta binaria safe/unsafe junto con diez categorías de seguridad en formato multi-label (sexual_abuse, self_harm, hate, violencia, etc.), aplicando sigmoide sobre las diez salidas independientes en lugar de softmax. Se distribuye como un `LlamaForSequenceClassification` estándar de Hugging Face, sin `trust_remote_code`, en un checkpoint de pocos megabytes que se ejecuta en CPU.

El modelo forma parte de la línea Barist, sucesora del proyecto Censer (Censer.1–.9), y su model card documenta de forma explícita un proceso de revisión adversarial iterativo en el que cada versión corrige falsos positivos y negativos detectados sobre conjuntos de evaluación en ocho idiomas (en, cs, de, es, fr, it, pt, ru). Incorpora un pre-filtro determinista basado en expresiones regulares para casos must-catch (CSAM con bloqueo duro, autolesión derivada a recursos de apoyo), umbrales por idioma y calibración de temperatura de las puntuaciones.

Su relevancia práctica radica en la relación entre coste computacional y cobertura: un modelo de menos de un millón de parámetros que puede desplegarse en cualquier CPU, con licencia Apache 2.0 y compatible con text-embeddings-inference, para tareas de filtrado previo en pipelines de moderación donde un modelo grande sería económicamente inviable por volumen de peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, clasificación de secuencia (`LlamaForSequenceClassification`, `problem_type: multi_label_classification`) |
| Parametros totales | 903.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos, con ruta de chunked-max para documentos largos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru (ucraniano documentado como no soportado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de 903.552 parámetros entrenado desde cero, no un modelo destilado de un LLM mayor pese a la etiqueta `distilled` de la model card. La cabeza de clasificación es multi-label: diez categorías de seguridad con activación sigmoide independiente, más la decisión binaria safe/unsafe. El contexto nativo es de 4096 tokens y para documentos que lo exceden se aplica una ruta de agregación por máximo sobre fragmentos (chunked-max), que propaga la señal de riesgo más alta de cualquier fragmento al documento completo.

El entrenamiento combina varios corpus de moderación y seguridad: nvidia/Aegis-AI-Content-Safety-Dataset-1.0, Jigsaw Toxic Comment, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat, Hate-speech-CNERG/hatexplain, Intuit-GenSRF/jigsaw-multilingual-train-unique y databricks/databricks-dolly-15k. La model card describe fases incrementales de ajuste (M, N, O, P, Q y la fase L para ucraniano) con miles de paráfrasis unsafe ponderadas y pares benignos contrapuestos, además de calibración de temperatura sobre las puntuaciones y umbrales por idioma ajustados con la restricción de FPR ≤ 5 %, recall ≥ 80 % y tope de 0,75. El pre-filtro regex v3 restringe las coincidencias a formas en primera persona o amenazas directas, con excepciones para contextos de apoyo, y deriva las coincidencias de jailbreak a `needs_review` en lugar de bloqueo duro.

## Capacidades

- Clasificación binaria safe/unsafe con puntuación calibrada por temperatura.
- Clasificación multi-label en diez categorías de seguridad, reportando como máximo las dos categorías con mayor puntuación.
- Detección de CSAM con bloqueo duro determinista mediante pre-filtro regex, independiente del modelo.
- Enrutamiento de autolesión a recursos de apoyo (`needs_support`, Linka bezpečí) con campo `override: "must_catch"`.
- Bloqueo por categoría: una puntuación ≥ 0,3 en sexual_abuse o self_harm fuerza `unsafe` con `override: category_block` en las tres rutas de inferencia, incluida la de texto largo troceado.
- Procesamiento de documentos largos mediante chunked-max sobre la ventana de 4096 tokens.
- Multilingüe en ocho idiomas con umbrales específicos por idioma (actualmente todos a 0,5, es decir, efectivamente desactivados según la model card).
- Detección de jailbreak con marcado `needs_review` en lugar de bloqueo.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo en plataformas de comentarios: el modelo clasifica cada comentario entrante en una sola pasada de CPU con un checkpoint de pocos megabytes, lo que permite aplicarlo sobre el 100 % del tráfico antes de escalar los casos dudosos a un modelo mayor o a revisión humana.
- Moderación de contenido generado por usuarios en foros multilingües: la cobertura de en, cs, de, es, fr, it, pt y ru permite un único modelo para comunidades con audiencias mixtas, en lugar de un clasificador monolingüe por idioma.
- Puerta de seguridad en pipelines de LLM: como clasificador de entrada y salida, intercepta prompts de jailbreak (marcados `needs_review`) y respuestas con contenido de riesgo antes de que lleguen al usuario final.
- Detección prioritaria de CSAM y autolesión: el pre-filtro regex con bloqueo duro y el enrutamiento a recursos de apoyo cubren los casos de mayor severidad sin depender de la puntuación del modelo, lo que reduce el coste de un falso negativo en estas categorías.
- Moderación de documentos largos: la ruta chunked-max permite analizar hilos completos, artículos o transcripciones de más de 4096 tokens propagando la señal de riesgo máxima de cualquier fragmento.
- Despliegue en edge o entornos sin GPU: al ejecutarse en CPU y exportarse a ONNX, encaja en funciones serverless, gateways de API o dispositivos con recursos limitados donde no hay acelerador disponible.
- Triaje en colas de revisión humana: las puntuaciones calibradas y el límite de dos categorías por informe permiten ordenar la cola por severidad y priorizar los casos con mayor probabilidad de ser unsafe.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| F1@0,5 (test) | 0,8238 | Conjunto de test interno |
| Deteccion must-catch heldout2 (modelo solo, raw @0,5) | 51/75 | Conjunto limpio de 91 formulaciones nuevas |
| Deteccion must-catch heldout2 (via CLI, temperatura + umbrales) | 55/75 | Ruta completa de inferencia |
| Deteccion must-catch heldout2, Censer.9 (referencia) | 57/75 | Modelo predecesor, solo modelo |
| FPR checo en held-out (230 frases) | 10,0 % (23/230) | Objetivo ≤ 3 %; no alcanzado |
| F1 ucraniano textdetox @0,5 | ≈ 0,10 | Idioma documentado como no soportado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo que es esperable en un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32; el checkpoint ocupa pocos megabytes y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: ninguna necesaria; cualquier GPU con más de 1 GB de memoria sirve para acelerar el throughput.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en CPU sin problema.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, ONNX Runtime, text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un coste por petición muy bajo en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Barist.5 | 903.552 | 4096 | 8 | Apache 2.0 | Clasificador multi-label desde cero, CPU-first |
| Censer.9 (predecesor) | no disponible | no disponible | no disponible | no disponible | Clasificador de seguridad; supera a Barist.5 en detección raw de must-catch (57/75 vs 51/75) |
| Modelos de moderación basados en LLM (p. ej. variantes de Llama Guard) | miles de millones | varios miles de tokens | varios | variable | Mayor capacidad semántica a coste de GPU y latencia muy superiores |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El FPR en checo sobre held-out es del 10,0 % (23/230), muy por encima del objetivo del 3 % declarado por el propio autor.
- El modelo solo detecta 51 de 75 formulaciones must-catch en crudo y 55 de 75 por la ruta completa del CLI; la brecha frente a Censer.9 (57/75) indica una regresión no resuelta en detección pura.
- El ucraniano no está soportado pese a aparecer en el entrenamiento: F1 ≈ 0,10 en textdetox.
- Los umbrales por idioma están actualmente todos a 0,5, lo que equivale a desactivar el ajuste por idioma descrito en la model card.
- El pre-filtro regex puede producir falsos positivos y falsos negativos; la propia model card documenta iteraciones de corrección sobre frases benignas y noticias.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de errores de clasificación con puntuaciones calibradas que pueden inducir confianza excesiva.
- Sesgos potenciales derivados de los corpus de entrenamiento (Jigsaw, Civil Comments, BeaverTails), con posible sobrerrepresentación de ciertos registros y variantes dialectales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no cubiertos por los conjuntos de evaluación.
- No debe usarse como único mecanismo de seguridad en producción: la model card describe un proceso de revisión adversarial continuo, lo que implica que quedan casos no cubiertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Barist.5
- Repositorio GitHub del proyecto (referenciado en la model card): no disponible como URL directa en la información proporcionada
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-1.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset PKU-Alignment/BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset lmsys/toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset Hate-speech-CNERG/hatexplain: https://huggingface.co/datasets/Hate-speech-CNERG/hatexplain
- Dataset Intuit-GenSRF/jigsaw-multilingual-train-unique: https://huggingface.co/datasets/Intuit-GenSRF/jigsaw-multilingual-train-unique
- Dataset databricks/databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset thesofakillers/jigsaw-toxic-comment-classification-challenge: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
