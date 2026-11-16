# ITLL/WaterSheep

## Resumen

WaterSheep es un modelo de decisión (decision model) publicado por el usuario ITLL en Hugging Face, construido sobre `answerdotai/ModernBERT-base`. No es un modelo generativo: responde preguntas en texto plano (sí/no, elección única, escala de valoración y multietiqueta) devolviendo una probabilidad calibrada para cada opción. Se presenta como alternativa open source a Jev, el servicio de TypeSafe AI para el que existe un endpoint compatible (`POST /v1/systemone`), lo que permite sustituirlo localmente sin cambios de código en el SDK de Python de TypeSafe.

El modelo tiene 154.334.209 parámetros (~154 M) y una ventana de contexto heredada de ModernBERT, aunque la model card no explicita la longitud exacta. Su propuesta diferencial es la calibración: reporta un ECE de 0,026 en distribución y 0,043 en conjuntos no vistos, lo que permite aplicar umbrales de confianza y derivar peticiones a un sistema más potente (patrón "system one / system two").

Es relevante ahora porque ofrece una primitiva barata y determinista para clasificación y enrutamiento en pipelines de agentes, con licencia Apache 2.0, pesos en safetensors y ONNX, y ejecución en navegador. El repositorio es reciente (creado el 16 de noviembre de 2026) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabeza de decisión y calibración |
| Parametros totales | 154.334.209 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ModernBERT-base; no explicitada en la model card) |
| Tipos de cuantizacion | ONNX cuantizado (`onnx/model_quantized.onnx`); no se detallan otros formatos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

WaterSheep parte de ModernBERT-base, un encoder transformer, y añade una cabeza de decisión que produce una distribución de probabilidad sobre las opciones de la pregunta. Soporta cuatro modos: `noul` (sí/no, devuelve probabilidad de "sí"), `choice` (etiquetas arbitrarias, devuelve la mejor), `score` (escala numérica, devuelve el nivel esperado) y `multi` (todas las etiquetas por encima de un umbral). La model card no detalla la composición exacta del dataset ni el número de tokens de entrenamiento.

El entrenamiento declara un conjunto amplio de datasets que cubren clasificación de intenciones (`clinc/clinc_oos`, `mteb/banking77`, `SetFit/amazon_massive_*`), seguridad y moderación (`nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, `google/civil_comments`, `tdavidson/hate_speech_offensive`, `deepset/prompt-injections`, `jackhhao/jailbreak-classification`), razonamiento y QA (`allenai/ai2_arc`, `allenai/openbookqa`, `cais/mmlu`, `TIGER-Lab/MMLU-Pro`, `truthfulqa/truthful_qa`, `rajpurkar/squad_v2`), dominios médicos (`GBaker/MedQA-USMLE-4-options`, `qiaojin/PubMedQA`, `openlifescienceai/medmcqa`, `gretelai/symptom_to_diagnosis`), preferencias y alineamiento (`Anthropic/hh-rlhf`, `HuggingFaceH4/ultrafeedback_binarized`, `Intel/orca_dpo_pairs`, `allenai/reward-bench`, `prometheus-eval/*`), además de NLI, sentimiento y tareas GLUE/SuperGLUE. No se especifica si hubo RLHF o DPO; la presencia de pares de preferencia sugiere su uso como datos de decisión, no como etapa de optimización declarada.

La innovación destacable es la calibración explícita con métricas publicadas (ECE y curvas de fiabilidad por tipo de pregunta), junto con la compatibilidad de API con Jev y la ejecución en navegador mediante ONNX Runtime y `watersheep.js`.

## Capacidades

- Clasificación zero-shot y few-shot mediante preguntas en lenguaje natural con etiquetas arbitrarias.
- Respuestas sí/no con probabilidad asociada (modo `noul`).
- Elección única entre opciones (modo `choice`).
- Valoración en escalas numéricas, devolviendo el nivel esperado (modo `score`).
- Clasificación multietiqueta con umbral configurable (modo `multi`).
- Salida de probabilidad por opción, apta para umbrales de confianza y abstención.
- Enrutamiento y triaje: decidir qué equipo, categoría o etiqueta corresponde a un texto.
- Detección de spam, toxicidad, jailbreak e inyección de prompt (según los datasets declarados).
- Clasificación de intenciones en dominios de atención al cliente y banca.
- Ejecución local como servidor compatible con el endpoint `/v1/systemone` de Jev.
- Ejecución en navegador vía JavaScript/ONNX, sin instalación.
- Capacidades multilingües: no disponibles (solo inglés).
- Generación de texto, razonamiento libre, código y matemáticas: no disponibles (no es un modelo generativo).

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del cliente junto con las opciones `billing`, `shipping`, `support` y usar la probabilidad devuelta para enrutar automáticamente; si la confianza es baja, escalar a un humano o a un LLM mayor.
- Moderación previa a generación: clasificar comentarios con etiquetas de toxicidad, acoso o contenido inseguro y bloquear antes de que lleguen al modelo generativo, aprovechando el ECE bajo para fijar umbrales estables.
- Detección de inyección de prompt y jailbreak: evaluar la entrada del usuario contra etiquetas como `injection`, `jailbreak`, `benign` antes de pasarla a un agente, con coste muy inferior al de un LLM.
- Clasificación de intenciones en asistentes de voz o chat: usar `clinc_oos` o `banking77` como referencia para mapear la frase del usuario a una intención concreta y disparar la acción correspondiente.
- Enrutamiento "system one / system two": responder localmente las peticiones de alta confianza y derivar solo las inciertas a un modelo grande, reduciendo coste y latencia en pipelines de agentes.
- Etiquetado multietiqueta de documentos: asignar varios temas (por ejemplo, categorías MeSH en abstracts médicos o tópicos financieros en noticias) con un umbral ajustable y revisar solo los casos límite.
- Evaluación de respuestas y preferencias: usar los modos `score` y `choice` para puntuar salidas de otros modelos en pipelines de evaluación automática (reward-bench, Feedback-Collection).
- Filtrado en el navegador: ejecutar `watersheep.js` con el modelo ONNX cuantizado para clasificar texto en cliente sin enviar datos a un servidor.

## Benchmarks y rendimiento

| Evaluación | Accuracy | ECE |
|---|---|---|
| Split de test en distribución | 77,8% | 0,026 |
| Datasets no vistos en entrenamiento | 61,2% | 0,043 |

La model card incluye además una tabla de benchmarks por suite que aparece truncada en la información disponible, por lo que no se pueden reproducir sus cifras. No se han publicado resultados comparativos con MMLU, HumanEval o GSM8K en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB solo de pesos (154 M de parámetros), más activaciones; en la práctica cabe en cualquier GPU consumer con 2 GB o más.
- VRAM estimada con ONNX cuantizado: por debajo de 0,5 GB; viable en CPU y en navegador.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para alto throughput, cualquier GPU moderna (RTX 3060 en adelante, A10, L4) es suficiente; A100/H100 no aportan ventaja significativa para este tamaño.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con `pipeline(..., trust_remote_code=True)`, servidor local `watersheep --serve`, Hugging Face Inference Endpoints, ONNX Runtime (incluido el runtime web para JavaScript) y descarga offline con `hf download` o Git LFS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WaterSheep | 154 M | no disponible | Decisión zero-shot, calibrada | Apache 2.0 | Hugging Face, ONNX, navegador |
| answerdotai/ModernBERT-base | ~149 M | 8192 tokens (según su model card pública) | Encoder de propósito general | Apache 2.0 | Hugging Face |
| Jev (TypeSafe AI) | no disponible | no disponible | Decisión "system one" vía API | propietaria (servicio) | API comercial |
| Modelos de clasificación zero-shot basados en NLI (p. ej. DeBERTa-MNLI) | ~180 M | ~512 tokens | Clasificación zero-shot | MIT / Apache 2.0 según variante | Hugging Face |

La comparación con Jev es la más directa por compatibilidad de API, pero no se dispone de sus especificaciones técnicas ni de sus métricas. Frente a un encoder NLI genérico, WaterSheep añade modos de puntuación y multietiqueta y métricas de calibración publicadas.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- No es un modelo generativo: no produce texto libre, código ni razonamiento encadenado.
- La precisión cae de 77,8% en distribución a 61,2% en datos no vistos; conviene validar en el dominio propio antes de producción.
- Riesgo de sesgo heredado de los datasets de entrenamiento (moderación, hate speech, comentarios civiles, datos médicos y de finanzas), con posible sobrerrepresentación de ciertas perspectivas.
- Riesgo de alucinación en el sentido de asignar alta probabilidad a etiquetas incorrectas cuando la pregunta es ambigua; la calibración mitiga pero no elimina este riesgo.
- La model card está truncada en la información disponible: faltan detalles de entrenamiento, contexto exacto y tabla completa de benchmarks.
- El repositorio no registra descargas ni likes y fue creado recientemente; no hay evidencia de uso en producción.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la marca y la compatibilidad con Jev son independientes de TypeSafe AI; el autor declara no estar afiliado.
- El endpoint compatible con Jev acepta cualquier API key en local; no debe confundirse con el servicio comercial ni asumirse paridad funcional completa.
- Para umbrales de abstención, usar las curvas de cobertura y error publicadas y recalibrar sobre datos propios si el dominio difiere.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/WaterSheep
- Modelo referenciado en la model card: https://huggingface.co/samratduttaofficial/WaterSheep
- Web oficial: https://samratduttaofficial.github.io/WaterSheep/
- Demo en Spaces: https://huggingface.co/spaces/samratduttaofficial/WaterSheep
- Código: https://github.com/SamratDuttaOfficial/WaterSheep
- Vídeo: https://youtu.be/VjSiBecOiRI
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Hilo en Reddit: https://www.reddit.com/r/LLMDevs/comments/1wvqfdr/guys_i_created_watersheep_an_opensource/
