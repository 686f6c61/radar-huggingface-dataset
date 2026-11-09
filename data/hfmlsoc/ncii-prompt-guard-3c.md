# hfmlsoc/ncii-prompt-guard-3c

## Resumen

ncii-prompt-guard-3c es un clasificador de texto de 268 millones de parámetros desarrollado por hfmlsoc (proyecto vinculado a YJernite) que evalúa prompts de edición de imagen y vídeo para detectar riesgo de generación de imaginería íntima no consentida (NCII, por sus siglas en inglés). El modelo se construye sobre el encoder de texto de Gemma 3 (microsoft/harrier-oss-v1-270m) y se afina mediante LoRA para una tarea de clasificación en tres clases de severidad: `low` (probablemente benigno), `review` (el prompt tiende a reducir la ropa del sujeto sin desnudo total ni actos sexuales) y `block` (el prompt solicita nudificación o sexualización explícita del sujeto).

La relevancia del modelo radica en su función como barrera de seguridad (guardrail) para aplicaciones de edición de imagen y vídeo que aceptan una imagen y un prompt de edición. Está optimizado para ejecutarse en CPU con baja latencia, de modo que añade un coste mínimo al pipeline de generación. El modelo solo analiza el texto del prompt y no puede determinar consentimiento, por lo que se plantea como una capa de fricción contra abusos NCII sin penalizar usos benignos.

La versión aquí descrita es la variante de 3 clases, que colapsa las cinco etiquetas originales del proyecto en tres bandas de severidad. Existe una versión hermana de 5 clases con granularidad fina (safe, suggestive-ambiguous, sexualizing-exposure, intimate-exposure, explicit-sexual-activity) entrenada sobre el mismo dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Gemma 3 text encoder, base microsoft/harrier-oss-v1-270m) con cabeza de clasificación |
| Parámetros totales | 268.100.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el artefacto se distribuye en fp32; la model card indica cargarlo sin overrides de dtype) |
| Idiomas soportados | inglés principalmente; slices pequeños de español y chino mencionados como fuera de alcance |
| Licencia | other |
| Formato de pesos | safetensors (repo de 1,1 GB, librería transformers) |

## Arquitectura y entrenamiento

El modelo parte del encoder de texto de Gemma 3 empaquetado como microsoft/harrier-oss-v1-270m, un transformer de 268 millones de parámetros. Sobre esa base se aplica un ajuste fino con LoRA (r=16, α=32, targets all-linear, con la cabeza de clasificación entrenada y guardada), learning rate 2e-4, 2 épocas, entropía cruzada con pesos por clase y semilla 42. Los adaptadores se fusionan con `merge_and_unload` en un único artefacto fp32.

Los datos de entrenamiento proceden del split `train` de NCII Guard Training Dataset v3: 80.053 prompts, con un 88,6 % benignos por diseño, y etiquetas colapsadas a las bandas {0∪1, 2, 3∪4}. El protocolo de selección está pre-registrado: el split `valid` (holdout de la distribución de entrenamiento) se usa solo como sanity check de entrenamiento; el split `dev` (etiquetas auditadas por el propietario) selecciona el umbral operativo; y el split `test` (también auditado) se lee una sola vez, al final, después de publicar el informe de selección. La innovación técnica destacable es la orientación a inferencia en CPU con baja latencia y la separación estricta entre selección de umbral y evaluación final para evitar fuga de información.

## Capacidades

- Clasificación de prompts de edición de imagen y vídeo en tres bandas de severidad: `low`, `review` y `block`.
- Detección de solicitudes de nudificación o sexualización explícita del sujeto (clase `block`).
- Detección de prompts que reducen la ropa del sujeto sin desnudo total ni actos sexuales (clase `review`).
- Salida de scores softmax por clase mediante `pipeline("text-classification", top_k=3)`, apta para reglas de decisión con umbral.
- Inferencia en CPU con baja latencia, pensada para añadir coste mínimo a pipelines de generación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador, no un modelo generativo.
- Capacidades multilingües limitadas: inglés como idioma principal; español y chino solo como slices pequeños y fuera de alcance.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación previa de prompts en aplicaciones de edición de imagen: el guard se coloca aguas arriba del modelo de edición y bloquea o deriva a revisión humana los prompts clasificados como `block` o `review`, aprovechando su baja latencia en CPU para no penalizar el pipeline.
- Edición de vídeo con entrada de prompt: el clasificador filtra solicitudes de nudificación o sexualización explícita antes de que lleguen al modelo de generación de vídeo, manteniendo la funcionalidad para usos benignos.
- Sistemas de revisión humana asistida: los prompts clasificados como `review` se enrutan a colas de moderación con contexto, reduciendo la carga manual frente a revisar todos los prompts.
- Aplicaciones de consumo con filtro de seguridad integrado: dado que corre en CPU, puede desplegarse en entornos sin GPU dedicada, como servicios de edición fotográfica en web o aplicaciones móviles con backend ligero.
- Investigación sobre seguridad en modelos generativos: el modelo y su dataset asociado permiten reproducir evaluaciones de riesgo NCII y medir tasas de recall por grupo demográfico.
- Cumplimiento normativo y auditoría: el guard proporciona una capa documentada de fricción contra abusos NCII, con curvas operativas publicadas (`v3_3c_final_report.json`) que permiten justificar decisiones de umbral ante auditorías.
- Prototipado de guardrails en demos: el ejemplo de la model card (`pipeline` con `top_k=3`) permite integrar el filtro en demos con pocas líneas de código y sin infraestructura GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (model-index), sobre el split `test` del dataset hfmlsoc/ncii-prompt-guard-data, en el punto operativo pre-seleccionado τ=0,9 y vista de bloque (gold = etiquetas 3–4 del dataset):

| Métrica | Valor |
|---|---|
| Block recall | 0,902 |
| Block precision | 0,926 |
| Low-band pass rate (clase benigna) | 0,962 |

Estos datos no están verificados de forma independiente (`verified: false` en el model-index). La model card menciona además una comparación con la versión de 5 clases en el split de test, pero el fragmento disponible no incluye la tabla completa de comparación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de 268 millones de parámetros en fp32, el artefacto ronda 1,1 GB de pesos, por lo que la huella en memoria es moderada.
- GPU recomendadas: no disponible; el modelo está optimizado para CPU, por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del artefacto (1,1 GB) y el enfoque de inferencia en CPU.
- Opciones de despliegue: `transformers` pipeline (`text-classification`), text-embeddings-inference (según tags del repo) y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card solo indica que está optimizado para baja latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ncii-prompt-guard-3c | 268.100.096 | no disponible | Clasificación NCII en 3 bandas | other | Hugging Face (hfmlsoc/ncii-prompt-guard-3c) |
| ncii-prompt-guard-5c (hermano) | no disponible en la información | no disponible | Clasificación NCII en 5 clases | other | Hugging Face (hfmlsoc/ncii-prompt-guard-5c) |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con la versión hermana de 5 clases, entrenada sobre el mismo dataset con distinta granularidad: la de 5 clases ofrece señales más finas de ambigüedad y exposición/acto, mientras que la de 3 clases agrupa en bandas de severidad orientadas a decisiones de producto (allow, warn/review, block). No se dispone de datos sobre otros guardrails NCII comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo analiza el texto del prompt y no puede determinar consentimiento; es una capa de fricción, no una garantía.
- Fuera de alcance: texto que no sea prompt de edición, idiomas distintos del inglés (solo slices pequeños de español y chino) y usos específicos de seguridad infantil.
- Riesgo de alucinación y falsos positivos/negativos inherente a un clasificador; la model card recomienda usar la regla de margen sobre los scores en lugar de argmax puro para estabilidad en despliegue.
- El artefacto se distribuye en fp32 y la model card indica cargarlo sin overrides de dtype; forzar otras precisiones puede alterar el comportamiento.
- El umbral operativo (τ) es una decisión del despliegue: bajarlo intercambia precisión por recall, con la curva completa en `v3_3c_final_report.json`.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- Licencia "other": deben revisarse los términos concretos antes de uso comercial; no se detallan restricciones en la información disponible.
- Existe una versión de 5 clases con mayor granularidad para despliegues que necesiten distinguir ambigüedad y exposición/acto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hfmlsoc/ncii-prompt-guard-3c
- Versión hermana de 5 clases: https://huggingface.co/hfmlsoc/ncii-prompt-guard-5c
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/hfmlsoc/ncii-prompt-guard-data
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Informe de evaluación (`v3_3c_final_report.json`): enlazado desde la model card, no se dispone de URL directa en la información proporcionada.
