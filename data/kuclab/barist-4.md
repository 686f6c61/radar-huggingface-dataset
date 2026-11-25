# KucLab/Barist.4

## Resumen

Barist.4 es un clasificador de contenido multilingüe de tipo decoder-only transformer entrenado desde cero por KucLab, con 903.552 parámetros totales y una ventana de contexto nativa de 4096 tokens. Su función es doble: emitir una etiqueta binaria safe/unsafe y, simultáneamente, diez categorías de seguridad en régimen multi-label (sexual_abuse, self_harm, hate, violencia, jailbreak, entre otras). Se distribuye como un `LlamaForSequenceClassification` estándar con `problem_type: multi_label_classification`, por lo que se carga con `transformers` sin `trust_remote_code` y aplica sigmoide automáticamente en el pipeline.

El modelo es el sucesor de la línea Censer (Censer.1–.9) y llega tras varias rondas de revisión adversarial centradas en reducir falsos positivos en checo, alemán, francés e italiano, endurecer la detección de CSAM y autolesión mediante un bloqueo por categoría, y limpiar un pre-filtro determinista basado en expresiones regulares que actúa como red de seguridad antes del modelo. Incorpora umbrales por idioma (actualmente fijados a 0,5, es decir, desactivados en la práctica) y calibración de temperatura de las puntuaciones.

Su relevancia práctica es que ofrece moderación de contenido en ocho idiomas (en, cs, de, es, fr, it, pt, ru) en un checkpoint de 3,6 MB que corre en CPU, lo que lo hace apto para despliegues de baja latencia y bajo coste en filtros previos, pipelines de moderación o entornos sin GPU. No es un modelo generativo: es un clasificador especializado en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `LlamaForSequenceClassification` con `problem_type: multi_label_classification` |
| Parametros totales | 903.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos, con ruta chunked-max para documentos largos |
| Tipos de cuantizacion | no disponible (checkpoint de 3,6 MB; existen pesos safetensors y ONNX) |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru (ucraniano documentado como NO soportado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 903.552 parámetros entrenado desde cero, no un fine-tuning de un modelo base. La cabeza de clasificación es multi-label: aplica sigmoide sobre diez categorías de seguridad más la etiqueta binaria safe/unsafe, de modo que una misma entrada puede activar varias categorías a la vez. El pipeline estándar de `transformers` aplica la sigmoide de forma automática y requiere `top_k=-1` para devolver todas las etiquetas. Para documentos que exceden los 4096 tokens se utiliza una ruta de agregación chunked-max.

El entrenamiento combina varios datasets públicos de seguridad y moderación: nvidia/Aegis-AI-Content-Safety-Dataset-1.0, jigsaw-toxic-comment-classification-challenge, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat, databricks/databricks-dolly-15k, Hate-speech-CNERG/hatexplain e Intuit-GenSRF/jigsaw-multilingual-train-unique. La model card documenta fases de refuerzo con miles de paráfrasis inseguras (must_catch) y pares benignos contrapuestos, así como una revisión adversarial iterativa. Entre las innovaciones destacan: umbrales por idioma ajustados con la restricción de FPR ≤ 5 % y recall ≥ 80 % con tope de 0,75; umbrales por categoría con precisión ≥ 0,7; calibración de temperatura; un pre-filtro determinista de expresiones regulares (bloqueo duro de CSAM, redirección de autolesión a recursos de apoyo) y un bloqueo por categoría que fuerza unsafe cuando sexual_abuse o self_harm superan 0,3.

## Capacidades

- Clasificación binaria safe/unsafe de texto.
- Clasificación multi-label en diez categorías de seguridad (incluye sexual_abuse, self_harm, hate, violencia y jailbreak).
- Detección de jailbreak con marca `needs_review` (no bloqueo duro).
- Manejo de documentos largos mediante contexto nativo de 4096 tokens y ruta chunked-max.
- Pre-filtro determinista complementario: bloqueo duro de CSAM y enrutado de autolesión a recursos de apoyo (`needs_support`, Linka bezpečí).
- Puntuaciones calibradas por temperatura.
- Multilingüe en ocho idiomas (en, cs, de, es, fr, it, pt, ru); ucraniano no soportado.
- Ejecución en CPU sin GPU, con checkpoint de 3,6 MB.
- Compatible con `text-embeddings-inference` y `endpoints_compatible` según los tags del Hub.

## Casos de uso

- Moderación de comentarios en foros y redes: el modelo clasifica cada mensaje en safe/unsafe y devuelve las categorías activadas, lo que permite enrutar a revisión humana solo los casos con categorías de alta severidad.
- Filtro previo en pipelines de LLM: al ser un clasificador de 903.552 parámetros ejecutable en CPU, puede colocarse delante de un modelo generativo para bloquear prompts de jailbreak o contenido prohibido antes de consumir tokens de GPU.
- Detección de CSAM y autolesión en plataformas comunitarias: el bloqueo por categoría fuerza unsafe cuando sexual_abuse o self_harm superan 0,3, y el pre-filtro determinista añade una capa de bloqueo duro independiente del modelo.
- Moderación multilingüe en mercados europeos: cubre checo, alemán, francés, italiano, portugués, español, inglés y ruso, con umbrales por idioma ajustados para limitar falsos positivos en textos benignos cotidianos.
- Análisis de documentos largos: con 4096 tokens de contexto y agregación chunked-max, puede procesar hilos de conversación o artículos completos sin truncar.
- Enrutado de soporte en crisis: las detecciones de self_harm se marcan con `needs_support` y se redirigen a recursos de ayuda en lugar de bloquearse silenciosamente.
- Pre-filtrado en entornos sin GPU: despliegue en contenedores ligeros o edge con ONNX o transformers en CPU, sin necesidad de infraestructura de aceleración.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| F1@0,5 en test | 0,8238 |
| Deteccion model-only en heldout2 (raw @0,5) | 51/75 |
| Deteccion via CLI (temperatura + umbrales por idioma) | 55/75 |
| FPR en checo held-out | 10,0 % (23/230) |
| FPR en checo eval (230 frases) | 6,5 % (15/230) |
| F1@0,5 en ucraniano (textdetox) | ≈ 0,10 (no soportado) |

No se han publicado resultados comparativos con MMLU, HumanEval o GSM8K, ya que el modelo no es generativo. Los datos anteriores provienen de la model card y de los informes `reports/cs_benign.json`, `reports/lang_thresholds.json` y `mustcatch_heldout2.jsonl`.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32; el checkpoint ocupa 3,6 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU (RTX 4090, A100, H100) lo ejecuta con latencia despreciable, pero no es necesario.
- Cabe en GPU consumer: sí, en todas, incluidas integradas.
- Opciones de despliegue: `transformers` (pipeline de text-classification), ONNX Runtime, `text-embeddings-inference` y endpoints compatibles según los tags del Hub.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño (903.552 parámetros) se espera latencia de milisegundos por petición en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Barist.4 | 903.552 | 4096 | Clasificacion safe/unsafe + 10 categorias, 8 idiomas | apache-2.0 | Hugging Face |
| Censer.9 (predecesor) | no disponible | no disponible | Clasificacion de seguridad | no disponible | Hugging Face / GitHub |
| Llama Guard (Meta) | no disponible en la informacion | no disponible | Clasificacion de seguridad | no disponible en la informacion | no disponible en la informacion |
| Jigsaw toxicity classifiers | no disponible | no disponible | Toxicidad binaria/multilabel | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos directos con estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El ucraniano no está soportado: el F1@0,5 en textdetox es ≈ 0,10, por lo que no debe usarse para ese idioma.
- Los umbrales por idioma están actualmente todos a 0,5 (efectivamente desactivados), según documenta la model card.
- El FPR en checo held-out es del 10,0 % (23/230), superior al objetivo del 3 %.
- La detección model-only en heldout2 es de 51/75; parte de la cobertura depende del pre-filtro de expresiones regulares y del bloqueo por categoría, no solo del modelo.
- El pre-filtro regex puede producir falsos positivos y ha requerido varias iteraciones de corrección; su comportamiento es determinista pero dependiente de patrones.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, slang o noticias.
- Sesgos potenciales derivados de los datasets de entrenamiento (Jigsaw, Civil Comments, BeaverTails, etc.), con posible sobrerrepresentación de ciertos dominios.
- Licencia apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los datasets de entrenamiento en despliegues productivos.
- El script de inferencia conserva el nombre histórico `censer.py`, lo que puede confundir en integraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Barist.4
- Repositorio GitHub del proyecto: no disponible en la informacion proporcionada (la model card menciona archivos en GitHub pero no incluye la URL)
- Paper: no disponible
- Demo: no disponible
