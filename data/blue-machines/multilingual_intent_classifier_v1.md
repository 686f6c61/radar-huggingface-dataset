# blue-machines/Multilingual_Intent_classifier_v1

## Resumen

Multilingual_Intent_classifier_v1 es un clasificador de intención multilingüe publicado por blue-machines (Blue Machines AI) en HuggingFace. Se trata de un encoder Gemma 3 recortado a 8 capas, exportado a ONNX y cuantizado a INT8 dinámico, con una cabeza lineal de clasificación que se mantiene en FP32. El modelo no genera texto: recibe una utterance y devuelve un vector de 7 logits, uno por cada intención predefinida (`provide_info`, `affirm`, `deny`, `correction`, `question`, `clarify_request`, `unclear`).

El problema que resuelve es concreto: en sistemas de diálogo desplegados en India, los turnos del usuario llegan en script nativo, romanizados o mezclando inglés con la lengua local (code-mixed). Un clasificador de intención que asuma texto limpio en un solo idioma falla en esos escenarios. Este modelo cubre diez idiomas (inglés, hindi, tamil, telugu, kannada, maratí, malabar, bengalí, guyaratí y odia) y declara explícitamente soporte para esas tres formas de escritura.

Es relevante por su perfil de despliegue: el repositorio pesa 0,1 GB, el modelo se ejecuta con ONNX Runtime sobre CPU y la longitud máxima de entrada es de 64 tokens, lo que lo hace apto para enrutado de bajo coste en producción. Como contrapartida, no hay licencia declarada, no hay benchmarks publicados y el modelo no tiene descargas ni validación comunitaria en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (Gemma 3, `gemma3_text`) de 8 capas, con cabeza lineal de clasificación |
| Parametros totales | no disponible (no especificado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de entrada, `max length 64`) |
| Tipos de cuantizacion | INT8 dinámico en el encoder; cabeza de intención en FP32 |
| Idiomas soportados | en, hi, ta, te, kn, mr, ml, bn, gu, or (10 idiomas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`); artefactos auxiliares: tokenizer y `label_map.json` |
| Libreria de inferencia | onnxruntime |
| Pipeline | text-classification (clasificación de intención) |
| Tamano del repositorio | 0,1 GB |
| Entradas | `input_ids`, `attention_mask` (int64) |
| Salidas | `logits` con forma `[batch, 7]` |
| Etiquetas de intención | `provide_info`, `affirm`, `deny`, `correction`, `question`, `clarify_request`, `unclear` |

## Arquitectura y entrenamiento

La model card describe el sistema como un encoder Gemma 3 de 8 capas exportado a ONNX. La parte de representación (encoder) se cuantiza a INT8 con esquema dinámico, mientras que la cabeza lineal de intención se conserva en FP32, presumiblemente para no degradar la separación entre clases en la capa final. El mapeo entre índices y etiquetas se distribuye en un fichero `label_map.json`, bajo la clave `head4_intent`, lo que sugiere que el modelo forma parte de una familia con varias cabezas o versiones de cabeza.

No hay información pública sobre el dataset de entrenamiento, el número de tokens procesados, la composición lingüística del corpus, ni sobre el uso de técnicas de ajuste como fine-tuning supervisado clásico, destilación o calibración posterior a la cuantización. Tampoco se documenta RLHF ni DPO, algo esperable en un clasificador y no en un modelo generativo. La innovación destacable, tal y como la presenta el autor, es doble: reducir el encoder a 8 capas y exportarlo a ONNX con cuantización dinámica, lo que permite ejecutar la inferencia en CPU con un consumo de memoria muy bajo (repositorio de 0,1 GB) manteniendo el soporte para texto en script nativo, romanizado y code-mixed.

La misma empresa ha publicado otro modelo, Floe, orientado a detección de idioma en conversaciones empresariales multilingües de India; ese modelo y este comparten el enfoque de tratar el code-mixing como caso de primera clase, no como ruido.

## Capacidades

- Clasificación de intención en 7 clases cerradas a partir de una utterance corta (máximo 64 tokens).
- Soporte multilingüe para inglés, hindi, tamil, telugu, kannada, maratí, malabar, bengalí, guyaratí y odia.
- Robustez declarada ante tres formas de entrada: script nativo, texto romanizado y enunciados code-mixed (por ejemplo, términos en inglés insertados en una frase en hindi).
- Salida de logits `[batch, 7]` apta para batching y para aplicar softmax y umbrales de confianza propios.
- Inferencia en CPU mediante ONNX Runtime con `CPUExecutionProvider`, sin necesidad de GPU.
- No realiza generación de texto, razonamiento multi-paso, tool calling, function calling ni uso de agentes.
- No dispone de capacidades de visión, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades de matemáticas, código ni recuperación de conocimiento: es un clasificador, no un modelo de lenguaje generativo.

## Casos de uso

- Enrutado de intención en atención al cliente en India: clasificar cada turno entrante en una de las 7 intenciones antes de decidir si el bot responde, pide aclaración o escala a un agente humano. El soporte code-mixed evita que un "Mera credit card block ho gaya hai" se clasifique como consulta en inglés.
- Preprocesado en pipelines RAG: etiquetar la consulta del usuario como `question`, `clarify_request` o `unclear` para decidir si se lanza la recuperación, se pide más contexto o se responde con una plantilla.
- Detección de correcciones y negaciones en asistentes de voz: las clases `deny` y `correction` permiten revertir o corregir el estado del diálogo cuando el usuario dice que la interpretación previa era errónea.
- Analítica de contact center: clasificación por lotes de transcripciones ya existentes para medir la proporción de correcciones, negaciones y aclaraciones por idioma y por agente, con un coste de cómputo muy bajo al ejecutarse en CPU.
- Moderación de flujo en sistemas de slot filling: usar `provide_info` frente a `unclear` para decidir si el turno contiene un valor aprovechable para rellenar un slot o si hay que repreguntar.
- Despliegue en edge o entornos on-premise con requisitos estrictos de residencia de datos: al pesar 0,1 GB y ejecutarse en CPU, puede instalarse en la misma máquina que el motor de diálogo sin depender de APIs externas.
- Control de calidad de datasets conversacionales: etiquetar automáticamente corpus multilingües para filtrar turnos ambiguos antes de usarlos en el entrenamiento de otros modelos.
- Enrutado de idioma previo: combinado con un detector de idioma como Floe, sirve para dirigir la conversación al modelo o al flujo específico de cada lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud, F1, matriz de confusión ni comparaciones con líneas base, y no se han encontrado evaluaciones externas en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Dado que el repositorio completo ocupa 0,1 GB y la mayor parte corresponde al encoder en INT8, la huella en memoria es del orden de decenas a pocos cientos de megabytes, incluyendo tokenizer y cabezas.
- GPU recomendadas: no requiere GPU. Cualquier GPU con soporte de ONNX Runtime CUDA o TensorRT serviría, incluidas GTX 1650, RTX 3060 o superiores; A100 y H100 no aportan ventaja para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos unos cientos de megabytes libres, e incluso en GPU integradas.
- Cabe en CPU: sí, es el modo de ejecución documentado por el autor (`CPUExecutionProvider`), con hilos configurables.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java), ONNX Runtime Server, NVIDIA Triton Inference Server con backend ONNX, BentoML o un servicio FastAPI envolviendo la sesión de ONNX Runtime. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son motores para modelos generativos y este es un clasificador en formato ONNX.
- Latencia y throughput estimados: no disponibles. No se publican cifras de latencia ni de rendimiento por lote en la información proporcionada.

## Comparativa con modelos similares

Los valores de los modelos alternativos corresponden a documentación pública de referencia y pueden variar según la versión consultada; el modelo objeto de la ficha se marca como "no disponible" donde el autor no publica el dato.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Multilingual_Intent_classifier_v1 | no disponible | 64 tokens | 10 (indic + inglés) | no disponible | ONNX (INT8 + FP32) |
| XLM-RoBERTa base como clasificador | ~278M | 512 tokens | ~100 | MIT | safetensors |
| IndicBERT v2 | ~278M | 512 tokens | 20+ lenguas índicas | MIT | safetensors |
| MuRIL base | ~236M | 512 tokens | 17 lenguas índicas + inglés | Apache 2.0 | safetensors |

Diferencias cualitativas relevantes: los tres alternativos son modelos de representación de propósito general que requieren un ajuste fino adicional para clasificación de intención, mientras que este modelo ya viene con la cabeza entrenada. A cambio, su ventana de 64 tokens es muy inferior a los 512 tokens de los alternativos, y su licencia no está declarada, lo que impide comparar condiciones de uso comercial.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución. Conviene contactar con el autor antes de integrarlo en producción.
- Ventana de contexto muy corta: 64 tokens. Los turnos largos se truncan, lo que puede eliminar información necesaria para distinguir entre `question` y `clarify_request` o entre `correction` y `deny`.
- Conjunto de etiquetas cerrado y fijo: solo 7 intenciones, definidas por el autor. Cualquier intención fuera de ese conjunto se mapeará a una de las existentes, probablemente a `unclear`.
- Ausencia de benchmarks: no hay métricas publicadas de exactitud, F1 ni matriz de confusión, ni por idioma ni por tipo de escritura. No se puede estimar la calidad real del modelo en cada una de las 10 lenguas.
- Desequilibrio potencial entre idiomas: no se documenta la distribución del corpus de entrenamiento. Es habitual que el hindi y el inglés estén sobrerrepresentados frente a odia o malabar.
- Sensibilidad al dominio: al no publicarse el origen de los datos, se desconoce si el modelo generaliza a dominios distintos del de entrenamiento (por ejemplo, banca frente a telecomunicaciones).
- Riesgo de error en entradas code-mixed poco frecuentes, en transliteraciones no estándar y en texto con errores ortográficos o abreviaturas de chat.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre. El riesgo equivalente es la clasificación errónea con alta confianza, que puede propagarse a decisiones posteriores del diálogo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha. No hay informes independientes de uso en producción.
- Idioma: no cubre castellano ni ninguna otra lengua europea aparte del inglés. No es utilizable para conversaciones en español.
- Dependencia del tokenizer asociado: la model card indica que hay que asignar `pad_token` a `eos_token` si no está definido, un detalle que puede provocar comportamientos inconsistentes si se integra mal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blue-machines/Multilingual_Intent_classifier_v1
- Nota de prensa sobre Floe, modelo de detección de idioma de Blue Machines AI para conversaciones multilingües en India: https://www.webnewswire.com/2026/08/20/blue-machines-ai-launches-floe-a-context-aware-language-detection-model-for-multilingual-enterprise-conversations-in-india/
- Cobertura en Rediff sobre Floe: https://www.rediff.com/business/report/blue-machines-ai-launches-floe-language-detection-model/20260819.htm
- Paper, repositorio de código y demo: no disponibles en la información proporcionada.
