# Cate-Tech/PhosphorONE-A95B

## Resumen

PhosphorONE-A95B es una compilación cuantizada en formato GGUF del modelo LiquidAI/LFM2.5-24B-A2B, publicada por Cate-Tech a partir del trabajo de cuantización y modificación de AtomicChat. El modelo base es un transformer de tipo mixture-of-experts (MoE) de Liquid AI con 23.971.587.712 parámetros totales y una arquitectura denominada lfm2moe, del que se activan aproximadamente 2.000 millones de parámetros por token (A2B en el nombre). La modificación aplicada es una "abliteración" parcial: se proyecta fuera de los pesos la dirección de rechazo (refusal direction) únicamente en los bloques 14 a 39 de los 40 que componen la red, preservando intactos los 14 primeros bloques.

El interés de esta ficha radica en que combina dos cosas: un modelo MoE de contexto largo y multilingüe (10 idiomas declarados) con una intervención quirúrgica sobre el comportamiento de rechazo, manteniendo el rendimiento en benchmarks generales dentro del ruido estadístico. Según las mediciones publicadas por AtomicChat, los rechazos caen del 96,3 % al 1,2 % en inglés y del 62 % al 0 % en ruso, mientras que MMLU se mantiene en 65,55 % frente al 64,40 % original.

El repositorio ocupa 105,9 GB e incluye seis builds GGUF con distintas cuantizaciones (de Q8_0 a IQ3_M) más un adaptador LoRA de 24 MB que puede aplicarse sobre cuantizaciones existentes del modelo original. La licencia es lfm1.0, que impone restricciones para uso comercial que deben verificarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (lfm2moe), modificación por abliteración en bloques 14-39 |
| Parametros totales | 23.971.587.712 (23,97 B) |
| Parametros activos | Aproximadamente 2 B por token (denominación A2B) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en llama-server); soporte verificado de needle a 30k tokens |
| Tipos de cuantizacion | Q8_0 (25,7 GB), Q6_K (20,9 GB), Q5_K_M (17,3 GB), Q4_K_M (15,4 GB), IQ4_XS (14,5 GB), IQ3_M (12,1 GB); IQ3_XXS (11,1 GB) fabricada pero no publicada |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA en GGUF de rango 1, 24 MB, 52 sitios |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura mixture-of-experts de Liquid AI, identificado en las etiquetas como lfm2moe y lfm2.5. Con 23,97 B de parámetros totales y unos 2 B activos por token, el coste computacional por token es comparable al de un modelo denso de 2 B, mientras que la capacidad representacional corresponde a un modelo de 24 B. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación principal de esta publicación no está en el entrenamiento sino en la intervención post-hoc sobre los pesos. Se identifica una "dirección de rechazo" en el espacio de activaciones y se proyecta fuera de los pesos, pero solo en los bloques 14 a 39. Según la model card, aplicar la misma edición en los 40 bloques también eliminaba los rechazos pero costaba 4 puntos de MMLU, lo que indica que los 14 primeros bloques concentran la capacidad de daño y no el comportamiento de rechazo. La edición en BF16 tiene un KLD medio de 0,204 frente al original (82,5 % de mismo top-1); combinada con la cuantización Q4_K_M, el KLD sube a 0,274 con 79,6 % de mismo top-1. El adaptador LoRA de rango 1 reproduce la misma edición sobre cuantizaciones existentes sin necesidad de descargar un modelo nuevo.

## Capacidades

- Generación de texto conversacional multilingüe en 10 idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Razonamiento con modo "thinking": la model card reporta 30 de 30 respuestas con rechazo en el modelo original y 0 de 30 tras la abliteración, con 3072 tokens de presupuesto de pensamiento y sin casos de pensamiento sin cerrar.
- Tool calling / function calling: 20 de 20 llamadas válidas tanto en el original como en el abliterado, según las mediciones publicadas.
- Recuperación de información en contexto largo: needle a 30k tokens con 3 profundidades, 2 de 3 aciertos en el original y 3 de 3 tras la edición.
- Capacidad de seguir instrucciones y mantener estructura de respuesta: la model card indica que las respuestas conservan los mismos hechos y estructura, cambiando principalmente la formulación.
- No se declara soporte de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistentes conversacionales sin fricción de rechazo: el modelo está pensado para escenarios donde el filtrado excesivo degrada la experiencia (escritura creativa, role-play, análisis de ficción con contenido sensible). La reducción de rechazos del 96,3 % al 1,2 % en inglés lo hace adecuado para estos entornos, siempre que se añada una capa de moderación externa.
- Procesamiento de documentos largos multilingües: con contexto de 32k tokens y recuperación verificada a 30k, puede resumir contratos, informes técnicos o expedientes en español, francés, alemán o portugués dentro de una misma ventana.
- Agentes con tool calling: las 20 de 20 llamadas válidas permiten integrarlo en pipelines de agentes que consultan APIs, bases de datos o servicios externos, con la ventaja de un coste de inferencia bajo gracias a los 2 B de parámetros activos.
- Generación de código asistida: el KLD medido sobre código es de 0,179, inferior al de texto neutro, lo que sugiere que la edición afecta menos a la distribución de tokens en código. Adecuado para autocompletado y revisión en entornos donde se tolera contenido sin filtro.
- Atención al cliente en varios idiomas: los 10 idiomas declarados y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso sin truncar, en una sola GPU de 24 GB con la cuantización Q4_K_M.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio reproducible de abliteración selectiva por capas, con métricas públicas de KLD, top-1 y tasas de rechazo en conjuntos held-out (JBB, Aya red-teaming, XSTest).
- Despliegue en hardware de consumo: la build IQ3_M de 12,1 GB cabe en GPUs de 16 GB, lo que permite ejecutar un MoE de 24 B en equipos de gama alta para escritura, análisis y chat local.

## Benchmarks y rendimiento

Datos publicados en la model card de AtomicChat, comparando el modelo original en BF16 con el abliterado en BF16:

| Metrica | Original | Abliterado |
|---|---|---|
| JBB harmful behaviours (EN, 81), rechazos | 96,3 % | 1,2 % |
| Aya red-teaming (RU, 100), rechazos | 62,0 % | 0 % |
| XSTest safe prompts (250), rechazos | 12,8 % | 0 % |
| Con thinking (30 prompts, 3072 tokens), rechazos | 30 de 30 | 0 de 30 |
| Thinking sin cerrar a 3072 tokens | 0 de 30 | 0 de 30 |
| Respuestas vacías o en bucle (431) | 0 | 0 |
| MMLU (2000 preguntas) | 64,40 % | 65,55 % (+1,15, McNemar p = 0,06) |
| Tool calls (20) | 20/20 válidas | 20/20 válidas |
| Needle a 30k tokens (3 profundidades) | 2/3 | 3/3 |
| KLD medio al original, neutro / código | - | 0,204 / 0,179 |

Métricas de cuantización frente al BF16 original sin modificar (edición y cuantización combinadas):

| Build | Tamano en disco | KLD medio | Mismo top-1 | Rechazos EN / RU / XSTest |
|---|---|---|---|---|
| AD-Q8_0 | 25,7 GB | 0,229 | 81,4 % | 1,2 % / 0 % / 0 % |
| AD-Q6_K | 20,9 GB | 0,239 | 81,0 % | no medido |
| AD-Q5_K_M | 17,3 GB | 0,271 | 80,3 % | no medido |
| AD-Q4_K_M | 15,4 GB | 0,274 | 79,6 % | 1,2 % / 0 % / 0 % |
| AD-IQ4_XS | 14,5 GB | 0,274 | 79,3 % | no medido |
| AD-IQ3_M | 12,1 GB | 0,359 | 76,0 % | no medido |

La build IQ3_XXS (11,1 GB) se fabricó pero no se publicó: coincidía con la elección de token del original solo el 74,5 % de las veces y rechazaba el 3,7 % de los prompts en inglés.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 12 y 26 GB según la cuantización, más overhead de contexto KV. La build Q4_K_M (15,4 GB) es la recomendada por el autor para máquinas de 24 GB; la Q6_K (20,9 GB) para máquinas de 32 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M; A100 40 GB, H100 o RTX 5090 para Q8_0 y contextos largos; GPUs de 16 GB pueden usar IQ3_M (12,1 GB) con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 4080 Super con cuantizaciones Q4_K_M o inferiores. En 16 GB, IQ3_M con margen ajustado.
- Opciones de despliegue: llama.cpp (llama-server, con soporte de `--jinja` y `--lora-scaled`), Ollama y cualquier runtime compatible con GGUF. El adaptador LoRA requiere llama.cpp con soporte de LoRA en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con 2 B activos, el throughput esperado es sustancialmente mayor que el de un denso de 24 B, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PhosphorONE-A95B (este) | 23,97 B | ~2 B | 32k | lfm1.0 | GGUF | Abliterado en bloques 14-39, 10 idiomas, MMLU 65,55 % |
| LiquidAI/LFM2.5-24B-A2B (base) | 23,97 B | ~2 B | 32k | lfm1.0 | safetensors, GGUF | Sin modificar, rechazos 96,3 % EN, MMLU 64,40 % |
| AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF | 23,97 B | ~2 B | 32k | lfm1.0 | GGUF + LoRA | Misma edición; origen de las métricas de esta ficha |
| AtomicChat/LFM2.5-24B-A2B-GGUF | 23,97 B | ~2 B | 32k | lfm1.0 | GGUF | Cuantizaciones del original sin edición, KLD 0,063 en Q8_0 |

No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo, no la capacidad de generar contenido dañino. El modelo puede producir respuestas a solicitudes que el original denegaba; requiere moderación externa en cualquier despliegue público.
- La medición de rechazos se basa en la apertura de la respuesta, no en un juez automático; el autor lo califica de indicativo. Los conjuntos son relativamente pequeños (81, 100 y 250 prompts).
- El KLD de 0,204 en BF16 frente al original indica un cambio medible en la distribución de tokens sobre texto general; la model card lo atribuye a un cambio de formulación (respuestas más directas y con menos rodeos), pero implica divergencia respecto al comportamiento del modelo base.
- La build IQ3_M sube el KLD a 0,359 y baja el mismo top-1 al 76,0 %; para producción se recomienda Q4_K_M o superior.
- Licencia lfm1.0: es una licencia con condiciones, no equivalente a Apache 2.0 ni MIT. Debe revisarse el texto completo antes de uso comercial; la información disponible no detalla los términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-09); no hay evidencia de uso en producción ni validación independiente.
- No se publican datos sobre sesgos demográficos, toxicidad residual ni evaluación en los idiomas distintos del inglés y el ruso.
- El contexto máximo verificado es de 30k tokens mediante needle; no se confirma el comportamiento más allá de esa longitud ni la calidad de recuperación con múltiples agujas.
- El adaptador LoRA requiere la revisión `f772950c` del modelo base; aplicarlo sobre otras revisiones o cuantizaciones no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cate-Tech/PhosphorONE-A95B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Cuantizaciones originales de AtomicChat: https://huggingface.co/AtomicChat/LFM2.5-24B-A2B-GGUF
- Versión sin censura de AtomicChat (origen de las métricas): https://huggingface.co/AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF
- Métricas públicas: https://huggingface.co/datasets/AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF-metrics
- Repositorio Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- Sitio de AtomicChat: https://atomic.chat/
