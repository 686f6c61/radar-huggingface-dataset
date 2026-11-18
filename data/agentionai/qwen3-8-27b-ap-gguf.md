# agentionai/Qwen3.8-27B-AP-GGUF

## Resumen

Qwen3.8-27B-AP-GGUF es un paquete de cuantizaciones GGUF del modelo Qwen3.8-27B, publicado por agentionai bajo la denominación "Agention Precision". No es un modelo entrenado desde cero, sino una recompresión del modelo base de Qwen (27.320.697.856 parámetros, licencia Apache 2.0) en distintos niveles de precisión, con el objetivo declarado de minimizar la divergencia KL respecto a los pesos BF16 originales en comparación con otras cuantizaciones públicas del mismo tamaño.

La propuesta técnica del autor es que, a igual tamaño de fichero y velocidad de inferencia, sus cuantizaciones quedan más cerca de la distribución de probabilidad del modelo original que las de otros publicadores (Unsloth, ISTA-DASLab, AtomicChat). Para ello aplican una asignación no uniforme de tipos por tensor y corrección de error de bajo coste mediante un codificador propio, manteniendo tipos estándar de llama.cpp sin necesidad de fork ni flags adicionales.

El paquete incluye el proyector de visión (`mmproj-BF16.gguf`, 0,87 GiB) y la cabeza de borrador MTP, lo que lo hace utilizable tanto para texto como para imagen-a-texto. Es relevante para quien necesite desplegar un modelo de 27B con capacidades multimodales en hardware de consumo o en una sola GPU de 24 GB, donde la elección de cuantización determina directamente la calidad final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como cifra oficial; el autor documenta uso a 32k y a 8–16k segun cuantizacion |
| Tipos de cuantizacion | AP-Q4_K_XL, AP-Q4_K_M, AP-IQ4_XS, AP-Q3_K_XL, AP-IQ3_S, AP-IQ3_XS, AP-IQ3_XXS, AP-IQ2_S; proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 195,7 GB con todos los niveles |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27.320.697.856 parámetros. La model card del paquete GGUF no detalla la arquitectura interna del modelo original (número de capas, cabezas, tipo de atención). Sí aporta un dato estructural relevante: solo una cuarta parte de las capas emplea atención completa, lo que reduce el coste de memoria del contexto (aproximadamente 1 GiB a 32k con KV en q8_0). El modelo incluye una cabeza de borrador MTP (multi-token prediction), empaquetada en el GGUF, y un proyector de visión separado en BF16.

El trabajo de agentionai no es de entrenamiento sino de cuantización. Cada fichero usa una asignación no uniforme de tipos por bloque y una corrección de error de bajo coste construida con un codificador propio, sobre tipos estándar de llama.cpp. La calibración y el codificador difieren de los de otras cuantizaciones del mismo tamaño, y el autor publica la metodología de evaluación: divergencia KL de la distribución de siguiente token frente al BF16 de referencia (revisión `1d4bf0f2`), sobre 60 fragmentos de 2048 tokens en tres corpus (texto técnico propio no publicado, una porción sembrada de FineWeb llamada `mixedweb-v1` y wikitext-2), con `llama-perplexity` sin modificaciones sobre una build concreta de llama.cpp (`26bc85e42`). No hay información sobre datos de entrenamiento, RLHF o DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen a texto: el paquete incluye `mmproj-BF16.gguf`, el codificador visual de Qwen en BF16, por lo que el pipeline es `image-text-to-text`.
- Decodificación especulativa mediante la cabeza MTP incluida en el fichero.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo), lo que sugiere uso detrás de servidores de inferencia estándar.
- Capacidades de tool calling, agentes o multilingüismo: no disponibles en la información proporcionada; deben consultarse en la model card del modelo base.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en GPU de 24 GB: con `AP-Q4_K_XL` (16,35 GiB, ~18 GiB de VRAM a 32k) o `AP-Q4_K_M` (15,33 GiB, ~17 GiB) el modelo cabe en una RTX 3090/4090 o A10G, permitiendo un asistente conversacional multimodal sin depender de API externa.
- Estación de trabajo con 16 GB de VRAM: `AP-IQ4_XS` (13,27 GiB, ~15 GiB) es la opción por defecto recomendada por el autor; útil para prototipado de aplicaciones de visión y texto en una sola GPU de gama alta de consumo.
- Servicios con presupuesto de 12 GB: `AP-IQ3_XS` (10,70 GiB, ~12,5 GiB) o `AP-IQ2_S` (8,95 GiB, ~10,9 GiB) permiten ejecutar el modelo a contextos de 8–16k en GPUs de 12 GB, adecuado para clasificación de documentos, extracción de información o resumen por lotes.
- Evaluación de calidad de cuantizaciones: el repo publica los scripts y corpus de reproducibilidad (KLD con `llama-perplexity`), por lo que sirve como referencia metodológica para equipos que comparan cuantizaciones antes de fijar una en producción.
- Procesamiento de documentos con componente visual: al incluir el proyector de visión, se puede usar para describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas en pipelines internos.
- Inferencia en CPU o mixta CPU/GPU: al ser GGUF estándar de llama.cpp, los niveles bajos (IQ2_S, IQ3_XXS) permiten ejecución parcial en CPU cuando no hay GPU suficiente, a costa de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica exclusivamente métricas de fidelidad de cuantización: divergencia KL frente al BF16, sobre 60 × 2048 tokens en tres corpus.

| Comparativa (KLD, menor es mejor) | held-out | neutral web | wikitext-2 | peor 1% tokens (held-out) |
|---|---|---|---|---|
| UD-Q4_K_XL (Unsloth) | 0,0117 | 0,0087 | 0,0122 | 0,088 |
| AP-Q4_K_XL | 0,0111 (−4,4%) | 0,0083 (−4,5%) | 0,0118 | 0,082 (−7,2%) |
| UD-Q4_K_M | 0,0153 | 0,0108 | 0,0139 | 0,122 |
| AP-Q4_K_M | 0,0146 (−4,9%) | 0,0104 (−3,7%) | 0,0150 | 0,111 (−8,8%) |
| UD-IQ4_XS | 0,0276 | 0,0186 | 0,0252 | 0,233 |
| AP-IQ4_XS | 0,0255 (−7,6%) | 0,0181 (−2,4%) | 0,0243 (−3,8%) | 0,211 (−9,3%) |
| UD-Q3_K_XL | 0,0421 | 0,0270 | 0,0337 | 0,366 |
| AP-Q3_K_XL | 0,0339 (−19,5%) | no disponible (dato truncado) | no disponible | no disponible |

El autor también reporta frente a otras cuantizaciones de ~10–11 GiB: AP-IQ3_S queda a la par de ISTA `IQ3_S` (11,29 GiB) con 0,6 GiB menos, y AP-IQ3_XXS es un 26% más cercano en texto técnico no visto que la mejor cuantización de investigación de ~10 GiB. Estas cifras provienen del propio publicador y no han sido verificadas de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada (pesos + KV q8_0 + buffers de llama.cpp, según el autor): ~18 GiB para AP-Q4_K_XL, ~17 GiB para AP-Q4_K_M, ~15 GiB para AP-IQ4_XS, ~14 GiB para AP-Q3_K_XL, ~13 GiB para AP-IQ3_S, ~12,5 GiB para AP-IQ3_XS, ~12 GiB para AP-IQ3_XXS y ~10,9 GiB para AP-IQ2_S.
- Proyector de visión: +0,9 GiB adicionales en cualquier nivel.
- Contexto: a 32k, el KV en q8_0 ocupa aproximadamente 1 GiB gracias a que solo una cuarta parte de las capas usan atención completa.
- GPU recomendadas: 24 GB (RTX 3090, RTX 4090, A10G, L4 en configuraciones ajustadas) para los niveles Q4; 16 GB (RTX 4080, A4000) para IQ4_XS e IQ3; 12 GB (RTX 3060 12 GB, RTX 4070) para IQ3_XS, IQ3_XXS e IQ2_S a contextos de 8–16k.
- Cabe en GPU de consumo: sí, en los niveles indicados; los Q4 caben en 24 GB y los IQ3/IQ2 en 12–16 GB.
- Opciones de despliegue: llama.cpp (formato nativo, sin fork), y por extensión servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere soporte en plataformas de endpoints; no se detallan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles como cifras; el autor afirma que el coste de cambio es cero y que VRAM y tokens/s son iguales a los de cuantizaciones del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agentionai/Qwen3.8-27B-AP-GGUF | 27,32B | no disponible (uso documentado a 32k) | Apache 2.0 | GGUF | Cuantización de alta fidelidad con visión y MTP |
| Qwen/Qwen3.8-27B | 27,32B | no disponible | Apache 2.0 | safetensors (BF16) | Modelo base de referencia |
| Unsloth UD-Q4_K_XL / IQ4_XS (mismo base) | 27,32B | mismo base | Apache 2.0 | GGUF | KLD ligeramente superior en los tres corpus medidos |
| ISTA-DASLab IQ3_S (mismo base) | 27,32B | mismo base | Apache 2.0 | GGUF | 11,29 GiB; AP-IQ3_S iguala fidelidad con 0,6 GiB menos |

La comparación relevante es entre cuantizaciones del mismo modelo base, no entre modelos distintos: todas comparten parámetros, contexto y licencia, y difieren en fidelidad y tamaño de fichero.

## Limitaciones y advertencias

- Las métricas de fidelidad (KLD) las publica el propio autor; no hay verificación independiente en la información disponible. La columna "held-out" usa documentación interna no publicada y, por tanto, no es reproducible por terceros.
- El corpus de evaluación es limitado (60 × 2048 tokens por corpus); no sustituye a una evaluación de tareas reales (razonamiento, código, visión).
- No hay datos publicados de benchmarks de tareas ni de idiomas soportados; el rendimiento multilingüe debe validarse contra la model card del modelo base.
- La licencia Apache 2.0 del paquete se hereda del modelo base; conviene confirmar en el repo de Qwen cualquier condición adicional de uso.
- Los niveles IQ2 e IQ3 implican pérdida de calidad medible (KLD de 0,0255 en IQ4_XS frente a 0,0111 en Q4_K_XL en texto técnico); no son equivalentes al BF16 para tareas sensibles a precisión.
- El repo ocupa 195,7 GB por incluir todos los niveles; la descarga selectiva de un solo fichero es imprescindible en la práctica.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse en el modelo base.
- El uso de la cabeza MTP para decodificación especulativa requiere un runtime que la soporte; no se especifica compatibilidad fuera de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentionai/Qwen3.8-27B-AP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados completos de fidelidad: https://share.fieldworkledger.com/tTkQDHijE_Anj0yv79bsIw
- Insignia de resultados: https://share.fieldworkledger.com/jWO2-ae4HyoC6GIqZucsaA/badge.svg
- Corpus de evaluación: https://huggingface.co/datasets/agentionai/quant-fidelity-corpora
- Script de wikitext-2 de llama.cpp: `llama.cpp/scripts/get-wikitext-2.sh` (referenciado en la model card)
- Conversor HF a GGUF: `convert_hf_to_gguf.py` (llama.cpp)
