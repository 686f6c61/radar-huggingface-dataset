# kaitchup/Qwen3.8-27B-SLQ-EAR99

## Resumen

Qwen3.8-27B-SLQ-EAR99 es una compresión del modelo Qwen/Qwen3.8-27B publicada por el divulgador técnico Kaitchup (The Kaitchup). No es un modelo entrenado desde cero, sino un artefacto de cuantización de precisión mixta generado con una versión personalizada de SLQ (Statistically-Lossless Quantization), la técnica descrita en el paper arXiv:2605.02404 del IST-DASLab. El objetivo declarado es preservar el comportamiento probabilístico del modelo original con una tasa de aceptación esperada (EAR, Expected Acceptance Rate) del 99 %, medida en 99,002514 % sobre los pesos empaquetados.

El interés práctico reside en que reduce el peso en disco de 55,563 GB (BF16 original) a 30,518 GB manteniendo una fidelidad superior a la de la cuantización FP8 oficial del propio Qwen (97,71 % de EAR nativa) y muy por encima de alternativas de 3 bits como GSQ (89,43 %). Para ello combina candidatos de GPTQ (INT2–INT8), AutoRound y GSQ, y elige la precisión de forma individual por proyección, incluyendo cabezas de atención concretas, dejando algunas capas en BF16 original.

El resultado está empaquetado para el runtime Humming de vLLM (probado con vLLM 0.31.0 y humming-kernels 0.1.16 sobre una RTX PRO 6000 Blackwell) y conserva los pesos MTP (multi-token prediction) en BF16. Es relevante ahora porque permite servir un modelo de la familia Qwen3.5 con ventana de 262.144 tokens en hardware de una sola GPU profesional, a costa de depender de un stack de inferencia específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5), pesos MTP conservados en BF16 |
| Parametros totales | 9.216.062.192 (según safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configurado en el ejemplo de vLLM con `--max-model-len 262144`) |
| Tipos de cuantizacion | Precisión mixta SLQ: enteros de 2 a 8 bits por proyección, con pesos seleccionados en BF16 original; activaciones en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetados para Humming (vLLM); no se publica GGUF |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia qwen3_5 y es un transformer con soporte de multi-token prediction (MTP), cuyos pesos se mantienen intactos en BF16 en esta release. La intervención de Kaitchup no modifica la arquitectura: actúa únicamente sobre la representación numérica de los pesos. La búsqueda de SLQ parte de cuatro fuentes de candidatos —GPTQ generado localmente en el rango INT2–INT8, la propia cuantización AutoRound de Kaitchup (hum-high-MTP, 17,7 GB), GSQ de 3 bits de ISTA-DASLab y los pesos BF16 originales— y selecciona la precisión por proyección individual, incluidas cabezas de atención seleccionadas.

La innovación técnica es el criterio de selección basado en EAR: se mide la superposición entre las probabilidades del siguiente token del modelo BF16 de referencia y las del candidato, renormalizadas sobre los diez tokens más probables de la referencia. Con un objetivo del 99 %, el empaquetado final alcanza 99,002514 %. Conviene subir el matiz que el propio autor explicita: EAR mide fidelidad distribucional aproximada, no equivalencia numérica ni precisión en benchmarks, y la equivalencia estadística en tareas downstream no se ha establecido para esta release. No hay datos publicados sobre el dataset de entrenamiento del modelo base ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat compatible con la API OpenAI de vLLM.
- Razonamiento explícito: el servidor admite `--reasoning-parser qwen3` para separar el bloque de pensamiento de la respuesta final.
- Tool calling y function calling automático mediante `--enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Codificación: el parser de tool calls específico para qwen3_coder sugiere soporte orientado a tareas de código y agentes.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones con historial amplio.
- Pesos de visión y procesadores originales conservados en el repo, aunque la validación del autor desactivó imagen y vídeo (`--limit-mm-per-prompt '{"image":0,"video":0}'`) y la inferencia multimodal no forma parte de las pruebas realizadas.
- Decodificación especulativa mediante los pesos MTP en BF16, si bien el autor indica que no se incluyó en la validación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat con contexto largo en una sola GPU: con 30,5 GB de pesos y ventana de 262.144 tokens, se puede desplegar un endpoint compatible con OpenAI para asistentes que ingieren documentación extensa sin trocear en exceso.
- Agentes con tool calling en producción: la combinación de `--enable-auto-tool-choice` y el parser `qwen3_coder` permite conectar el modelo a APIs externas y orquestar flujos multi-paso desde vLLM sin capa intermedia propia.
- Asistencia a desarrollo de software: el parser específico de código y el modo de razonamiento habilitan pipelines de revisión, generación de parches y explicación de errores dentro de herramientas tipo IDE o CI.
- Migración de un despliegue BF16 existente con restricción de VRAM: al pasar de 55,6 GB a 30,5 GB de pesos se libera memoria para caché KV, lo que permite sostener contextos más largos o mayor concurrencia en el mismo hardware.
- Investigación sobre cuantización: el mapa de bits por capa (`precision.svg`) y la tabla comparativa de EAR convierten este repo en un caso de estudio reproducible para evaluar SLQ frente a FP8, GPTQ y GSQ.
- Sustitución de FP8 oficial cuando se busca mayor fidelidad: con EAR de 99,00 % frente al 97,71 % de la FP8 nativa y un tamaño en disco prácticamente idéntico (30,5 frente a 30,9 GB), es una alternativa razonable para tareas sensibles a la distribución de probabilidad.
- Evaluación comparativa de stacks de inferencia: al estar validado sobre vLLM 0.31.0 con Humming, sirve para medir el coste real de adopción de kernels de cuantización no estándar frente a alternativas GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de fidelidad (EAR) y tamaño de pesos, no resultados en MMLU, HumanEval, GSM8K ni similares.

| Modelo | EAR | Peso en disco (GB) | Ejecución medida |
|---|---:|---:|---|
| Qwen3.8-27B BF16 original | 100,000000 % | 55,563 | Referencia BF16 |
| Qwen3.8-27B-FP8 oficial | 97,705903 % | 30,867 | Pesos y activaciones FP8 nativas |
| Qwen3.8-27B-FP8 oficial (solo pesos) | 98,101249 % | 30,867 | Pesos dequantizados, ejecución BF16 |
| ISTA-DASLab GSQ 3 bits | 89,425738 % | 11,828 | Pesos dequantizados, ejecución BF16 |
| Kaitchup hum-high (17,7 GB) | 94,335032 % | 17,695 | Pesos dequantizados, ejecución BF16 |
| Unsloth UD-Q4_K_XL GGUF | 97,444147 % | 17,559 | GGUF remapeado a BF16, Transformers |
| Kaitchup SLQ EAR>98 | 98,000775 % | 23,732 | vLLM / Humming empaquetado |
| Kaitchup SLQ EAR98.5 | 98,502656 % | 25,609 | vLLM / Humming empaquetado |
| Kaitchup SLQ EAR99 (este) | 99,002514 % | 30,518 | vLLM / Humming empaquetado |

## Requisitos de hardware

- VRAM: los pesos ocupan 30,518 GB (30.518.225.504 bytes) en disco; el autor advierte explícitamente que el tamaño de fichero no es la memoria total de servicio. Hay que sumar búferes del runtime y caché KV, por lo que en la práctica se necesita una GPU con más de 32 GB.
- GPU validadas: RTX PRO 6000 Blackwell, según las pruebas del autor con vLLM 0.31.0 y humming-kernels 0.1.16.
- GPU consumer: no cabe en tarjetas de 24 GB (RTX 4090, 3090) sin recurrir a offload, que no está documentado para este formato. Tarjetas de 32 GB o más (RTX PRO 6000, A100 40 GB, H100) son el objetivo realista.
- Despliegue: exclusivamente vLLM con soporte Humming y `--quantization humming --dtype bfloat16`. No se publica GGUF, por lo que llama.cpp, Ollama y TGI no son opciones directas con estos pesos.
- Latencia y throughput: no disponibles; el autor no publica medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EAR / fidelidad | Licencia | Formato y runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B-SLQ-EAR99 (este) | 9,22 B (según safetensors) | 262.144 | 99,00 % | Apache 2.0 | safetensors + Humming (vLLM) |
| Qwen3.8-27B-FP8 oficial | no disponible | 262.144 | 97,71 % nativa / 98,10 % solo pesos | Apache 2.0 | FP8, runtime estándar |
| Kaitchup SLQ EAR98.5 | 9,22 B (según safetensors) | 262.144 | 98,50 % | Apache 2.0 | safetensors + Humming (vLLM), 25,6 GB |
| Unsloth UD-Q4_K_XL GGUF | 9,22 B (según safetensors) | 262.144 | 97,44 % | Apache 2.0 | GGUF, Transformers/llama.cpp, 17,6 GB |
| ISTA-DASLab GSQ 3 bits | 9,22 B (según safetensors) | 262.144 | 89,43 % | Apache 2.0 | 3 bits, 11,8 GB |

La disyuntiva es clara: EAR99 maximiza fidelidad dentro de un stack restringido (Humming), mientras que las variantes GGUF y de 3 bits sacrifican fidelidad a cambio de portabilidad y menor huella de memoria.

## Limitaciones y advertencias

- El EAR del 99 % no implica un 99 % de precisión en benchmarks ni respuestas idénticas al modelo original; es una medida de solapamiento de probabilidades sobre el top-10 de la referencia.
- La equivalencia estadística en tareas downstream no ha sido establecida por el autor para esta release.
- Dependencia fuerte del runtime: requiere vLLM con soporte Humming y una versión concreta de humming-kernels; otros runtimes pueden dar resultados ligeramente distintos.
- La validación cubrió solo carga de texto, generación y EAR. Inferencia de imagen y vídeo y decodificación especulativa quedaron fuera de las pruebas, pese a conservarse los pesos de visión y MTP.
- El autor no publica datos de sesgos, tasas de alucinación ni evaluación multilingüe; al ser una cuantización, hereda los sesgos del modelo base sin mitigación adicional.
- El número de parámetros reportado en safetensors (9,22 B) no concuerda con el nombre comercial "27B" del modelo base; conviene verificar el inventario real de pesos antes de dimensionar hardware.
- Licencia Apache 2.0, permisiva para uso comercial, pero sin garantías del autor sobre idoneidad en producción.
- El repo tiene un volumen de descargas moderado (895) y pocos likes (24), con actualización en octubre de 2026; es un artefacto de nicho, no un estándar de facto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR99
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Release SLQ EAR>98: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98
- Release SLQ EAR98.5: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98.5
- Cuantización AutoRound del autor: https://huggingface.co/kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB
- GSQ 3 bits de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Paper SLQ: https://arxiv.org/abs/2605.02404
- Repositorio SLQ: https://github.com/IST-DASLab/SLQ
- AutoRound: https://github.com/intel/auto-round
- Newsletter del autor: https://kaitchup.substack.com/subscribe
