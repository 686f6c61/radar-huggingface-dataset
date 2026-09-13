# llm-semantic-router/Vela-1.0-Encoder-307M-Guard

## Resumen

Vela-1.0-Encoder-307M-Guard es un clasificador de texto de tipo encoder desarrollado por el proyecto llm-semantic-router (vLLM Semantic Router). Su funcion concreta es detectar intentos de prompt injection y jailbreak tanto en peticiones de entrada como en texto no confiable que se incorpora a un sistema. Es, por tanto, un modelo discriminativo de seguridad, no un modelo generativo: devuelve etiquetas de clasificacion en lugar de texto.

El modelo cuenta con 307.531.778 parametros y una capacidad de entrada de 32.768 tokens, incluyendo tokens especiales. Se presenta como un ajuste fino (finetune) sobre el modelo base llm-semantic-router/Vela-1.0-Encoder-307M, y el repositorio esta etiquetado con la arquitectura modernbert, lo que lo situa en la familia de encoders transformer modernos con soporte nativo de contexto largo.

Es relevante ahora porque los despliegues de agentes y pasarelas de LLM necesitan una capa de proteccion de baja latencia y coste contenido que filtre entradas maliciosas antes de llegar al modelo generativo. Vela Guard se ofrece bajo licencia Apache 2.0, con pesos en safetensors, y se integra dentro del ecosistema del enrutador semantico de vLLM, lo que facilita su uso como guardrail en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (etiqueta del repositorio: modernbert) |
| Parametros totales | 307.531.778 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens, incluyendo tokens especiales |
| Tipos de cuantizacion | no disponible; la evaluacion publicada se realizo en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | text-classification (deteccion de prompt injection y jailbreak) |
| Modelo base | llm-semantic-router/Vela-1.0-Encoder-307M |
| Tamano del repositorio | 1,3 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

Se trata de un encoder transformer de 307 millones de parametros construido sobre el modelo Vela-1.0-Encoder-307M, que el repositorio etiqueta como modernbert. Los encoders de esta familia emplean atencion con soporte de secuencias largas y variantes eficientes de atencion, lo que explica la capacidad de entrada de 32.768 tokens declarada por el autor. El modelo es un ajuste fino para clasificacion, con una cabeza de clasificacion sobre el encoder, orientada a distinguir peticiones maliciosas (prompt injection, jailbreak) de peticiones benignas.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Si se documenta que el conjunto de evaluacion de desarrollo combina ataques de prompt, peticiones benignas y contextos largos controlados de hasta 32.768 tokens, y que tanto Vela como el modelo de comparacion se evaluaron en FP32, con entradas completas y seleccionando la etiqueta de mayor puntuacion. El autor advierte explicitamente que ese conjunto informo el desarrollo del modelo y no constituye un benchmark ciego e independiente.

## Capacidades

- Clasificacion de texto para deteccion de prompt injection en peticiones de entrada.
- Deteccion de intentos de jailbreak en texto no confiable.
- Procesamiento de contextos largos de hasta 32.768 tokens, lo que permite analizar prompts completos con historial o documentos adjuntos sin truncar.
- Clasificacion de una unica entrada con multiples etiquetas y puntuaciones (la guia de uso emplea top_k=None).
- Integracion como guardrail dentro del enrutador semantico de vLLM y del ecosistema transformers.
- Capacidad de servir como modelo de embeddings/clasificacion via text-embeddings-inference, segun las etiquetas del repositorio.
- No genera texto: no soporta tool calling, function calling ni razonamiento multi-paso por si mismo.
- Capacidades multilingues: no disponible.
- El autor indica que para riesgo de contenido deben usarse los modelos Safety o Hazard de la familia, no este.

## Casos de uso

- Filtrado previo en una pasarela de LLM: colocar Vela Guard delante del modelo generativo para clasificar cada peticion entrante y bloquear intentos de prompt injection antes de consumir tokens del modelo principal.
- Guardrail en sistemas de agentes: inspeccionar la salida de herramientas externas y contenido recuperado antes de reinyectarlo en el bucle del agente, reduciendo el riesgo de inyeccion indirecta.
- Moderacion de chatbots en produccion: clasificar mensajes de usuarios en tiempo real y derivar a revision humana o respuesta de rechazo cuando se detecta un intento de jailbreak.
- Proteccion de pipelines RAG: analizar documentos y fragmentos no confiables que se indexan o se recuperan, para evitar que instrucciones maliciosas ocultas lleguen al prompt final.
- Enrutado semantico con criterio de seguridad: usar la clasificacion como senal dentro del enrutador para decidir si una peticion se atiende, se escala a un modelo mas robusto o se rechaza.
- Evaluacion y red teaming: emplear el clasificador como detector de referencia para medir la tasa de exito de baterias de prompts adversariales contra un sistema desplegado.
- Defensa en APIs publicas: integrar el modelo en el punto de entrada HTTP para etiquetar trafico sospechoso y alimentar sistemas de alerta o rate limiting.

## Benchmarks y rendimiento

El autor publica una evaluacion de desarrollo frente al detector original mmBERT32K jailbreak detector, sobre 1.319 entradas, en escala 0-100. Ambos modelos se evaluaron en FP32, con entradas completas y la etiqueta de mayor puntuacion. El conjunto no es un benchmark ciego e independiente.

| Evaluacion de desarrollo (1.319 entradas) | mmBERT original | Vela |
|---|---:|---:|
| Macro F1 | 76,63 | 86,61 |
| Accuracy | 76,65 | 86,66 |

No se han publicado otros resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares, y no serian aplicables a un modelo de clasificacion).

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 307,5 millones de parametros: aproximadamente 1,23 GB en FP32, 0,62 GB en FP16/BF16 y 0,31 GB en INT8.
- VRAM total estimada incluyendo activaciones y overhead de ejecucion: del orden de 2-3 GB en FP32, 1-1,5 GB en FP16 y alrededor de 1 GB en INT8, para lotes pequenos.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes, e incluso en GPU integradas con suficiente memoria compartida en cuantizaciones bajas.
- GPU de centro de datos recomendadas para alto throughput: A100, H100, L40S o T4 para despliegues con muchos lotes concurrentes.
- Opciones de despliegue documentadas o etiquetadas: pipeline de transformers (device=-1 o GPU), text-embeddings-inference, y el ecosistema vLLM Semantic Router. No se documentan integraciones con llama.cpp u Ollama.
- Versiones de libreria indicadas por el autor: Transformers 4.57.6 o 5.17.0, con PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato de rendimiento publicado son las metricas de clasificacion (Macro F1 y accuracy), no medidas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (dev, 1.319 entradas) | Accuracy (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Guard | 307,5 M | 32.768 tokens | 86,61 | 86,66 | Apache 2.0 | HuggingFace, safetensors |
| mmBERT32K jailbreak detector (merged) | no disponible | no disponible | 76,63 | 76,65 | no disponible | HuggingFace |
| Otros clasificadores de prompt injection | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible con el detector original de mmBERT32K, sobre el que el autor reporta una mejora de unos 10 puntos en Macro F1 y accuracy en su conjunto de desarrollo. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El unico conjunto de evaluacion publicado es un conjunto de desarrollo que informo el entrenamiento del modelo; no es un benchmark ciego ni independiente, por lo que las cifras pueden estar optimizadas respecto a ese conjunto.
- No se documentan los idiomas soportados, lo que impide garantizar un comportamiento fiable fuera del idioma o idiomas de entrenamiento.
- Al ser un clasificador, existe riesgo de falsos positivos (bloquear peticiones benignas) y de falsos negativos (dejar pasar ataques novedosos o adversariales).
- Los detectores de prompt injection son vulnerables a tecnicas de evasion, codificacion, ofuscacion o ataques multilingues no vistos durante el entrenamiento.
- El modelo no cubre riesgo de contenido: el autor remite explicitamente a los modelos Safety o Hazard para esa funcion.
- No se especifican tipos de cuantizacion soportados ni el impacto de la cuantizacion en la precision de clasificacion; la evaluacion publicada es en FP32.
- Metadatos de adopcion muy bajos (0 descargas y 0 likes en el momento de la consulta), con lo que hay poca validacion externa independiente.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y de atribucion. No se declaran restricciones adicionales.
- No se documentan latencia, throughput ni coste por peticion en produccion, datos necesarios para dimensionar un despliegue de filtrado a gran escala.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Guard
- Modelo base: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Coleccion Vela 1.0 Router Models: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Detector original mmBERT32K jailbreak: https://huggingface.co/llm-semantic-router/mmbert32k-jailbreak-detector-merged
- Documentacion de vLLM Semantic Router: https://vllm-sr.ai/
- Blog del proyecto: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack del proyecto: https://vllm-dev.slack.com/archives/C09CTGF8KCN

Nota: los resultados de busqueda web obtenidos no contenian informacion especifica sobre este modelo (eran guias genericas sobre LLM en frances e ingles), por lo que no se han incluido como fuentes.
