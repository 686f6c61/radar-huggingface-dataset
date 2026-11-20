# KucLab/Censer.8

## Resumen

Censer.8 es un modelo de clasificación de texto multietiqueta desarrollado por KucLab, orientado a la moderación de contenido y la detección de seguridad. Se trata de un transformer decoder-only de tan solo 903.552 parámetros entrenado desde cero, que emite un veredicto binario (safe/unsafe) junto con diez categorías de seguridad específicas (armas y explosivos, autolesión, CSAM, discurso de odio, drogas, jailbreaks, etc.). Su tamaño extremadamente reducido (3,6 MB) permite ejecutarlo en CPU sin aceleración, lo que lo hace atractivo para filtros de seguridad de baja latencia desplegados en el borde o como primera capa de un pipeline de moderación.

La versión .8 responde a una revisión adversarial de la versión .7 y corrige problemas estructurales: separa la cabeza de categorías de la cabeza binaria (antes atadas e invertidas), recalibra los umbrales por categoría sobre datos con etiquetas reales, incorpora umbrales específicos por idioma y aplica escalado de temperatura para calibrar las probabilidades. El modelo declara soporte medido para ocho idiomas (inglés, checo, alemán, español, francés, italiano, portugués y ruso) y una longitud de contexto nativa de 4096 tokens.

Es relevante ahora porque demuestra que un clasificador de seguridad de menos de un millón de parámetros puede alcanzar una tasa de detección del 94,3% en un conjunto curado de casos críticos (must-catch) con una tasa de falsos positivos del 6,8%, compitiendo en viabilidad práctica con clasificadores mucho mayores para la tarea acotada de moderación. Su licencia Apache 2.0 y su formato estándar de Hugging Face facilitan la integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForSequenceClassification) con cabeza de clasificación multi-etiqueta |
| Parametros totales | 903.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (nativa; ruta chunked-max para documentos largos) |
| Tipos de cuantizacion | int8 (loader implementado en censer.py); sin datos publicados de otras cuantizaciones |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, configurado como `LlamaForSequenceClassification` con `problem_type: multi_label_classification`. Dispone de dos cabezas: una binaria (`unsafe`) y una cabeza de puntuación separada y no atada (`score`) que cubre diez categorías de seguridad. La pérdida de categorías se enmascara únicamente a las filas marcadas como unsafe, y en inferencia las categorías solo se activan cuando la etiqueta `unsafe` ha disparado y se supera el umbral específico de cada categoría definido en `config.json: cat_thresholds`.

El entrenamiento combina múltiples conjuntos de datos de seguridad y moderación: nvidia/Aegis-AI-Content-Safety-Dataset-1.0, jigsaw-toxic-comment-classification-challenge, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat, databricks/databricks-dolly-15k, Hate-speech-CNERG/hatexplain e Intuit-GenSRF/jigsaw-multilingual-train-unique. La versión .8 añade 457 filas curadas de must-catch (CSAM, autolesión, amenazas, odio, drogas, explosivos y jailbreaks DAN/roleplay en en/cs/de/es) ponderadas entre 15 y 40 veces, y 1.172 negativos duros (duelo, seguridad defensiva, historia, matemáticas, recetas) ponderados entre 10 y 12 veces. La calibración se realiza mediante escalado de temperatura (T = 0.7102) ajustado sobre validación y almacenado en el checkpoint, con umbrales por idioma ajustados sobre textdetox.

## Capacidades

- Clasificación binaria safe/unsafe con umbral base de 0,5 y puntuaciones calibradas por temperatura.
- Clasificación multi-etiqueta en diez categorías de seguridad: armas y explosivos, autolesión, CSAM, discurso de odio, drogas, jailbreaks, entre otras.
- Detección de jailbreaks y roleplay adversarios (DAN, escenarios de evasión) en inglés, checo, alemán y español.
- Procesamiento de entradas largas de hasta 4096 tokens, con ruta chunked-max para documentos que exceden esa longitud.
- Umbrales específicos por idioma para reducir la tasa de falsos positivos en textos no ingleses.
- Detección automática de idioma integrada en la CLI (`censer.py`).
- Ejecución en CPU sin GPU, con soporte opcional de GPU mediante `device=0`.
- Integración directa con `transformers` sin `trust_remote_code`, y compatibilidad con text-embeddings-inference y endpoints.
- Interfaz de terminal interactiva (`censer.8`) y paquete instalable desde GitHub.

## Casos de uso

- Moderación de comentarios en plataformas sociales: el modelo clasifica cada mensaje entrante como safe/unsafe y asigna categorías concretas, permitiendo enrutar automáticamente el contenido a revisión humana solo cuando se supera el umbral calibrado, con un coste computacional mínimo en CPU.
- Filtro de seguridad previo a un LLM en producción: al ejecutarse en CPU con latencia muy baja, puede colocarse delante de un modelo generativo para bloquear prompts de jailbreak o solicitudes peligrosas (explosivos, autolesión) antes de que lleguen al modelo principal.
- Detección de autolesión y crisis en foros de salud mental: la categoría específica de self-harm, reforzada con filas must-catch ponderadas, permite activar protocolos de intervención cuando se detecta riesgo, con umbrales ajustados para reducir falsos positivos en textos de duelo.
- Moderación multilingüe en comunidades europeas: los umbrales por idioma (en, cs, de, es, fr, it, pt, ru) permiten desplegar un único modelo para varias comunidades lingüísticas sin recalibrar manualmente por región.
- Filtrado de datasets de entrenamiento: el modelo puede puntuar corpus masivos para eliminar contenido tóxico o inseguro antes de usarlos en el entrenamiento de otros modelos, gracias a su bajo coste y a la ruta chunked-max para documentos largos.
- Cumplimiento normativo y auditoría de contenido: la salida multi-etiqueta con puntuaciones calibradas y diagramas de fiabilidad publicados en `reports/calibration.json` facilita generar registros auditables de decisiones de moderación para requisitos regulatorios.
- Protección de comunidades y chats en tiempo real: la CLI interactiva y el paquete instalable permiten a moderadores humanos consultar frases concretas y obtener veredicto, categorías y puntuación de forma inmediata.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a métricas internas de validación y conjuntos curados, no a benchmarks estándar de la industria (MMLU, HumanEval, GSM8K). Se presentan a continuación tal como aparecen en la información disponible:

| Metrica | Version .7 | Version .8 |
|---|---|---|
| Must-catch (casos críticos detectados) | 66/88 (75%) | 83/88 (94,3%) |
| Tasa de falsos positivos (conjunto de 44) | 9/44 (20,5%) | 3/44 (6,8%) |
| ECE binario (antes de escalado) | 0,1798 | 0,0583 |
| ECE binario (tras escalado de temperatura) | no aplica | 0,0294 |
| FPR@0,5 en italiano | 43% | no disponible (umbral por idioma) |
| FPR@0,5 en español | 42% | no disponible (umbral por idioma) |
| FPR@0,5 en alemán | 37% | no disponible (umbral por idioma) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,6 MB de checkpoint más overhead de runtime); el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera; el modelo está diseñado para ejecutarse en CPU. GPU opcional mediante `device=0` para mayor throughput en lote.
- Cabe en GPU consumer: sí, en cualquier RTX o incluso en hardware integrado; también funciona sin GPU.
- Opciones de despliegue: `transformers` (pipeline y AutoModelForSequenceClassification), text-embeddings-inference, endpoints compatibles, CLI `censer.8`, paquete desde GitHub, Docker con HEALTHCHECK incluido.
- Latencia y throughput: la model card indica un único número de latencia corregido respecto a versiones anteriores, pero el valor concreto no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Censer.8 | 903.552 | 4096 | Clasificación de seguridad multi-etiqueta multilingüe | Apache 2.0 | Hugging Face, GitHub, CLI |
| Llama Guard (Meta) | no disponible en la información | no disponible | Clasificación de seguridad | Llama license | Hugging Face |
| ShieldGemma (Google) | no disponible en la información | no disponible | Clasificación de seguridad | Gemma license | Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre Censer.8 y estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Censer.8 destaca por su tamaño tres órdenes de magnitud menor y su licencia permisiva, a costa de una capacidad de razonamiento semántico presumiblemente más limitada.

## Limitaciones y advertencias

- Modelo de 903.552 parámetros: su capacidad de comprensión semántica es muy limitada en comparación con clasificadores basados en LLM; puede fallar en casos ambiguos, sarcasmo o contextos culturales complejos.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí de clasificaciones erróneas: la tasa de falsos positivos del 6,8% y la de must-catch del 94,3% implican que una fracción no desdeñable de casos críticos puede escapar.
- Los umbrales por idioma y por categoría están calibrados sobre conjuntos concretos (textdetox, catval); su comportamiento en dominios o registros distintos puede degradarse.
- Solo se declaran medidos ocho idiomas (en, cs, de, es, fr, it, pt, ru); el rendimiento en otros idiomas no está validado y las etiquetas de idiomas no medidas fueron retiradas respecto a versiones anteriores.
- La cabeza de categorías solo es significativa cuando `unsafe` ha disparado; usar las categorías de forma aislada produce resultados sin sentido.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad del modelo para decisiones de moderación de alto riesgo; se recomienda supervisión humana.
- El modelo ha sido sometido a una revisión adversarial que detectó problemas graves en la versión .7; aunque .8 los corrige según la model card, la validación externa independiente no está documentada.
- La información de latencia y throughput es escasa; no se deben asumir cifras de rendimiento sin medirlas en el entorno de despliegue concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Censer.8
- Repositorio GitHub del paquete: https://github.com/Jerry256254/censer.8
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-1.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset PKU-Alignment/BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset lmsys/toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset Hate-speech-CNERG/hatexplain: https://huggingface.co/datasets/Hate-speech-CNERG/hatexplain
- Dataset Intuit-GenSRF/jigsaw-multilingual-train-unique: https://huggingface.co/datasets/Intuit-GenSRF/jigsaw-multilingual-train-unique
- Dataset thesofakillers/jigsaw-toxic-comment-classification-challenge: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Dataset databricks/databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
