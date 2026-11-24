# juspay/xor

## Resumen

Xor 1.2 es un modelo derivado de Qwen/Qwen3.6-35B-A3B, desarrollado por Juspay, especializado en tareas de decisión tipada (typed decision tasks). Se trata de un ajuste fino mediante LoRA de rango 16 fusionado en los pesos base BF16, orientado a producir decisiones estructuradas con probabilidades calibradas en lugar de generación de texto libre. El modelo se sirve a través de una API compatible con TypeSafe en el endpoint `/v1/systemone`.

La propuesta diferencial no es el modelo en sí, sino el conjunto de modelo más capa de servicio: el runtime realiza lectura determinista de candidatos de un solo token, evaluación del orden de opciones en sentido directo e inverso, calibración de probabilidades y conversión de esquema. Esto convierte al modelo en un clasificador probabilístico de propósito general con soporte multimodal (hasta ocho imágenes o un vídeo por petición), no en un chatbot convencional.

Con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, la arquitectura es un transformer MoE causal heredado de Qwen3.6. La licencia Apache 2.0 y la disponibilidad de un bundle de servicio reproducible lo hacen relevante para equipos que necesitan decisiones auditables con latencias del orden de decenas de milisegundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts causal (transformer), base Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | Maximo de 250.000 tokens de prefill (configuracion validada) |
| Tipos de cuantizacion | BF16 en la release publicada; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (pesos fusionados, sin adaptadores) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3.6-35B-A3B` en su revisión `995ad96eacd98c81ed38be0c5b274b04031597b0`. Sobre esa base se aplicó un post-entrenamiento con LoRA de rango 16, posteriormente fusionado en los pesos BF16, de modo que el artefacto distribuido contiene pesos completos y no requiere carga ni fusión de adaptadores en tiempo de inferencia. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica relevante reside en la capa de servicio más que en el entrenamiento: la interfaz acepta un estado y un mapa de preguntas tipadas con tres modalidades (`noul` para probabilidad binaria, `choice` para decisión categórica con distribución completa y `score` para puntuación ordinal esperada con distribución completa). El servidor ejecuta lectura determinista de logprobs de candidatos de un solo token, evalúa el orden de las opciones en ambos sentidos para mitigar sesgos posicionales y aplica calibración de probabilidades antes de la conversión de esquema. El runtime validado es una imagen SGLang parcheada que corrige el manejo de resultados de candidate-logprob para evitar un fallo del planificador cuando coinciden peticiones de scoring y de generación simple en el mismo lote.

## Capacidades

- Clasificación binaria con probabilidad calibrada mediante la modalidad `noul`.
- Decisión categórica con distribución de probabilidad completa sobre las opciones mediante `choice`.
- Puntuación ordinal con valor esperado y distribución completa mediante `score`.
- Procesamiento multimodal: hasta ocho imágenes en formato data URL o un vídeo data URL por petición, combinables con texto.
- Evaluación robusta al orden de opciones gracias a la lectura forward y reverse.
- Salida con esquema validado y conversión determinista de tipos.
- Razonamiento multi-turno limitado: la interfaz está orientada a decisiones puntuales sobre un estado dado, no a diálogo abierto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso.

## Casos de uso

- Moderación de contenido con umbral calibrado: usar `noul` para obtener una probabilidad de incumplimiento por publicación y fijar el punto de corte según la tolerancia a falsos positivos, aprovechando la calibración ECE de 0.0733 reportada.
- Triaje de tickets de soporte: enviar el estado del ticket y un conjunto de categorías en `choice` para obtener la categoría más probable junto con la distribución completa, lo que permite derivar a revisión humana cuando la masa de probabilidad está repartida.
- Enrutamiento de solicitudes en pipelines internos: clasificar la intención de una petición entrante entre un conjunto cerrado de handlers, con latencias p50 de 0.067 s medidas en H200 para decisiones simples.
- Evaluación ordinal de calidad: usar `score` para puntuar respuestas generadas por otro modelo en una escala de 1 a 5, obteniendo el valor esperado y la distribución para detectar evaluaciones poco confiables.
- Inspección visual de documentos: pasar hasta ocho imágenes junto con preguntas tipadas para clasificar documentos escaneados (tipo de documento, presencia de firma, legibilidad) en una sola petición.
- Verificación de cumplimiento normativo: decidir si un fragmento de texto cumple una política concreta, con evaluación en ambos órdenes de opciones para reducir el sesgo posicional inherente a los clasificadores basados en LLM.
- Control de calidad en pipelines de datos: filtrar pares pregunta-respuesta con una decisión binaria calibrada antes de incorporarlos a un conjunto de entrenamiento.

## Benchmarks y rendimiento

Auto-evaluación pública de JEVBench con el bundle de servicio sin modificar, sobre 1 x NVIDIA H200 NVL (143 GB), TP1, DP1, caché de peticiones desactivada, harness en el commit `1bcc55eb6c8cffde2306b3db03ede39b61c6152a`:

| Tier | Intentadas | Validas | Correctas | Precision | p50 | p95 |
|---|---:|---:|---:|---:|---:|---:|
| Easy | 48 | 48 | 48 | 1.0000 | 0.0679 s | 0.0709 s |
| Original | 72 | 72 | 69 | 0.9583 | 0.0670 s | 0.0701 s |
| Hard public | 111 | 111 | 91 | 0.8198 | 0.0832 s | 0.1845 s |
| Todas las publicas | 231 | 231 | 208 | 0.9004 | 0.0691 s | 0.1616 s |

Metricas agregadas sobre las 231 decisiones: precision macro 0.9070, Brier medio 0.1790, ECE 0.0733. El exito operativo, la cobertura, la validez de esquema y la validez estricta de esquema fueron 1.0000 en todos los casos.

Estos resultados son auto-evaluaciones sobre los tiers públicos de JEVBench y no constituyen una clasificación oficial del benchmark. Las latencias son específicas del hardware indicado y se midieron localmente sin sobrecarga de red. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada: los ficheros del modelo ocupan aproximadamente 66 GB en BF16; el runtime validado reserva una fracción estática de memoria de 0.85 sobre una GPU de 143 GB.
- GPU recomendadas: NVIDIA H200 NVL (143 GB) es la única configuración validada oficialmente. No se documenta validación sobre A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en GPU de consumo convencionales en BF16; no se han publicado cuantizaciones que permitan reducir el requisito.
- Paralelismo: la configuración validada es tensor parallelism 1 y data parallelism 1. Cada worker de DP carga una réplica completa del modelo.
- Despliegue: imagen SGLang parcheada `prakhar1611/xor-sglang` (digest `sha256:94c48d2a...`), sobre base `lmsysorg/sglang` (digest `sha256:6bcaa47d...`). Se requiere Linux x86-64, Docker Engine con Compose v2 reciente, NVIDIA Container Toolkit y unos 120 GB de disco libre.
- Latencia y throughput: p50 de 0.067 s y p95 de 0.1616 s sobre las 231 decisiones públicas, medidas con una petición a la vez en H200. No se reporta throughput agregado ni rendimiento bajo concurrencia.
- Prefill máximo: 250.000 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Xor 1.2 | 35B | ~3B | 250.000 prefill | Apache 2.0 | Decision tipada calibrada con capa de servicio |
| Qwen3.6-35B-A3B | 35B | ~3B | No disponible | Apache 2.0 | LLM generativo multimodal base |
| Modelos de clasificación dedicados | Variable (tipicamente <1B) | No aplica | Corto | Variable | Clasificación supervisada por tarea |

La comparación directa con el modelo base es la más informativa: Xor 1.2 hereda la arquitectura y el conocimiento de Qwen3.6-35B-A3B pero restringe la interfaz a decisiones tipadas con calibración, a cambio de perder flexibilidad generativa. Frente a clasificadores dedicados de pequeño tamaño, Xor 1.2 aporta generalidad mediante instrucciones en lenguaje natural y soporte multimodal, con un coste de hardware muy superior. No se dispone de datos de benchmarks comparativos frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- Las cifras de JEVBench son auto-evaluaciones sobre los tiers públicos, no una clasificación oficial; el rendimiento en datos privados o de dominio específico puede diferir notablemente.
- El tier Hard public baja a 0.8198 de precisión, lo que indica degradación clara en decisiones complejas.
- La calibración presenta un ECE de 0.0733 y un Brier medio de 0.1790, aceptables pero no perfectos; en producción conviene recalibrar sobre datos propios.
- La interfaz no está diseñada para generación de texto libre ni para diálogo multi-turno; usarla así queda fuera del contrato validado.
- El modelo no distingue de forma fiable entre imágenes y vídeo cuando se envían juntos en la misma petición; se recomienda enviar un solo tipo de medio.
- Límite estricto de 8 MB por cuerpo de petición, con unos 6 MB útiles de medios tras la codificación base64; las peticiones mayores se rechazan con HTTP 422.
- Los resultados reproducibles exigen usar el bundle de servicio y el runtime SGLang parcheado publicados; otras configuraciones de hardware o paralelismo deben validarse de forma independiente.
- El servicio no requiere clave de API cuando se despliega con la configuración por defecto, lo que supone un riesgo si se expone fuera de localhost.
- No se documentan sesgos conocidos ni cobertura de idiomas; la información disponible no permite evaluar el comportamiento fuera del inglés.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse por separado.
- La rama `release/xor-1.2` es mutable; para reproducibilidad byte a byte debe fijarse su hash de commit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juspay/xor
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- JEVBench: https://github.com/fstandhartinger/jevbench
- Imagen SGLang parcheada: https://hub.docker.com/r/prakhar1611/xor-sglang
- Imagen base SGLang: https://hub.docker.com/r/lmsysorg/sglang
