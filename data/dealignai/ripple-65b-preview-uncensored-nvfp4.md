# dealignai/Ripple-65B-Preview-UNCENSORED-NVFP4

## Resumen

Ripple-65B-Preview-UNCENSORED-NVFP4 es una variante del modelo denso Ripple-65B-Preview de ricursiveAI, publicada por dealignai, en la que se ha eliminado el comportamiento de rechazo (abliteration) y se ha cuantizado al formato NVFP4 de ModelOpt (W4A4, grupo 16). El resultado es un checkpoint de 64.782.689.360 parámetros que ocupa 54 GB en disco y se sirve mediante SGLang con los kernels FP4 de flashinfer. Incluye además un drafter de decodificación especulativa DFlash2 en bfloat16 sin modificar.

El modelo emplea una arquitectura densa con atención híbrida (sliding window attention combinada con atención completa), modo de razonamiento activable por turno, soporte de tool calling con formato Hermes y contexto largo nativo. La cuantización mantiene `self_attn.*`, embeddings, normas y `lm_head` en bfloat16, mientras que `gate_proj`, `up_proj` y `down_proj` se almacenan en NVFP4.

La relevancia de esta ficha es doble: por un lado documenta un caso de cuantización agresiva FP4 sobre un modelo de 65B con decodificación especulativa; por otro, es un ejemplo de modelo "uncensored" con métricas de cumplimiento de instrucciones dañinas publicadas (HarmBench-320), lo que exige advertencias claras sobre uso responsable y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window attention + atención completa) |
| Parametros totales | 64.782.689.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | contexto largo nativo; el ejemplo de despliegue del autor usa `--context-length 16384` |
| Tipos de cuantizacion | NVFP4 (ModelOpt W4A4, grupo 16); capas `gate_proj`/`up_proj`/`down_proj` en FP4, resto en bfloat16; existe repositorio GGUF complementario para llama.cpp |
| Idiomas soportados | en (inglés) |
| Licencia | DealignAI Community Model License v0.3 (etiquetada como `other`); los pesos base se rigen por la licencia de ricursiveAI/Ripple-65B-Preview |
| Formato de pesos | safetensors con `compressed-tensors`, `custom_code`, empaquetado NVFP4; drafter DFlash2 en BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 64,8 mil millones de parámetros que combina capas de atención de ventana deslizante con capas de atención completa, una configuración habitual para reducir el coste de memoria del KV cache en contextos largos sin renunciar a la recuperación global. El checkpoint incorpora un drafter de decodificación especulativa DFlash2 (ricursiveAI/Ripple-65B-Preview-DFlash2) en bfloat16 sin modificar, lo que permite acelerar la generación aceptando tokens propuestos por un modelo auxiliar.

Sobre el proceso de entrenamiento del modelo base no se dispone de información en la documentación proporcionada: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La contribución de dealignai consiste en la eliminación del comportamiento de rechazo (abliteration) y en la cuantización NVFP4 con ModelOpt, conservando plantilla de chat y tokenizer byte a byte idénticos a los del modelo base. El repositorio no incluye tokens de calibración, vectores de rechazo, metadatos de la cirugía ni scripts de evaluación.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" activable o desactivable por turno.
- Razonamiento multi-paso con traza de pensamiento delimitada por `</think>`.
- Tool calling en formato Hermes, con parser dedicado (`--tool-call-parser ripple`) en SGLang.
- Decodificación especulativa mediante el drafter DFlash2 incluido.
- Contexto largo nativo, con atención híbrida para gestionar ventanas extensas.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- Comportamiento "uncensored": responde a instrucciones que las versiones alineadas del proveedor rechazan.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Investigación sobre seguridad y alineación: el modelo sirve como sujeto de estudio para medir hasta qué punto el abliteration altera la tasa de cumplimiento de instrucciones dañinas, con métricas publicadas sobre HarmBench-320.
- Evaluación de cuantización FP4: permite comparar la calidad de un mismo modelo en NVFP4 frente a Q4 y bfloat16, ya que el autor reporta que ambas cuantizaciones se mantienen dentro de 1 punto porcentual en sus pruebas.
- Pruebas de decodificación especulativa: el drafter DFlash2 incluido facilita medir ganancias de throughput en SGLang con y sin especulación sobre un modelo de 65B.
- Despliegue de inferencia de alta densidad: con 54 GB en disco y pesos FP4, el modelo se puede servir en una única GPU de 80 GB (A100/H100) con `--mem-fraction-static 0.80`, lo que resulta útil para laboratorios con recursos limitados.
- Investigación sobre robustez de filtros: útil para estudiar cómo se comportan los clasificadores de contenido frente a un modelo que reinterpreta solicitudes en lugar de rechazarlas.
- Análisis de plantillas y parsers: al conservar plantilla de chat y tokenizer del base, sirve para validar integraciones de `tool-call-parser` y `reasoning-parser` en SGLang.
- Estudio de licencias y gobernanza: caso práctico de modelo derivado con licencia comunitaria propia sobre pesos base de terceros.

## Benchmarks y rendimiento

El autor publica resultados de HarmBench-320 sobre este bundle exacto, servido en SGLang con el stack FP4 del proveedor, razonamiento activado, decodificación greedy, `repetition_penalty=1.0`, presupuesto de 2048 tokens y 4 slots paralelos.

| Metrica (HarmBench-320) | NVFP4 |
|---|---:|
| Cumplimiento estricto (hard comply) | 92,2% |
| Cumplimiento blando (soft) | 0,6% |
| Rechazo estricto (hard refuse) | 0,6% |
| Sospechoso (suspicious) | 6,6% |

| Categoria | n | Cumplimiento estricto NVFP4 |
|---|---:|---:|
| cybercrime_intrusion | 52 | 100,0% |
| chemical_biological | 42 | 97,6% |
| harmful | 18 | 94,4% |
| copyright | 80 | 92,5% |
| misinformation_disinformation | 54 | 90,7% |
| illegal | 53 | 86,8% |
| harassment_bullying | 21 | 76,2% |

El autor advierte que el grader automático no distingue cumplimiento dañino genuino de reinterpretación benigna. En una auditoría manual estratificada de 35 muestras, 32/35 (91,4%) de las filas `OK_HARD` fueron cumplimiento dañino genuino y 3/35 (8,6%) reinterpretación benigna, por lo que proyecta el 92,2% a aproximadamente un 84% de cumplimiento estricto real. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de capacidad.

## Requisitos de hardware

- Peso en disco: 54 GB para el bundle NVFP4 (repositorio total de 65,3 GB incluyendo drafter y ficheros auxiliares).
- VRAM estimada: con pesos FP4 y KV cache en bfloat16, el ejemplo del autor reserva el 80% de memoria estática (`--mem-fraction-static 0.80`), lo que encaja en una GPU de 80 GB; en GPUs menores habría que reducir `--context-length` y el número de slots.
- GPU recomendadas: H100 80 GB o A100 80 GB para el contexto de 16K con 4 slots; no cabe en GPUs de consumo de 24 GB en esta configuración.
- Despliegue: SGLang con kernels FP4 de flashinfer (`fp4_quantize` + `mm_fp4`), backend de atención `trtllm_mha`, `--page-size 64` y `--trust-remote-code`; para llama.cpp existe el repositorio complementario GGUF de dealignai.
- Latencia y throughput: no se publican cifras concretas en la información disponible; la inclusión del drafter DFlash2 está orientada a reducir la latencia de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dealignai/Ripple-65B-Preview-UNCENSORED-NVFP4 | 64,8B | largo nativo (ejemplo 16K) | NVFP4 + safetensors, SGLang | DealignAI Community v0.3 | Abliterado, incluye drafter DFlash2 |
| ricursiveAI/Ripple-65B-Preview-NVFP4 | 64,8B | no disponible | NVFP4, SGLang | la del modelo base | Versión oficial del proveedor, alineada |
| RedHatAI/Ripple-65B-Preview-NVFP4 | 64,8B | no disponible | NVFP4, vLLM/llm-compressor | Apache-2.0 | Cuantización de Red Hat para vLLM |
| dealignai/Ripple-65B-Preview-UNCENSORED-GGUF | 64,8B | no disponible | GGUF | DealignAI Community v0.3 | Misma cirugía, para llama.cpp |

## Limitaciones y advertencias

- Modelo "uncensored" y abliterado: elimina deliberadamente los rechazos, con un 92,2% de cumplimiento estricto reportado en HarmBench-320; no es apto para aplicaciones de cara al público sin filtros externos.
- El propio autor reconoce que el grader no distingue cumplimiento dañino de reinterpretación benigna; la cifra auditada de cumplimiento real ronda el 84%.
- Riesgo elevado de generar contenido dañino, ilegal o sujeto a derechos de autor; los 2 rechazos estrictos observados corresponden a negativas a reproducir extractos literarios concretos.
- Idiomas: solo inglés según la etiqueta del repositorio; no hay evidencia de calidad en castellano.
- Licencia DealignAI Community v0.3 sobre las contribuciones, con la licencia del modelo base de ricursiveAI aplicándose a los pesos originales; es necesario revisar ambas antes de cualquier uso comercial.
- El repositorio no incluye tokens de calibración, vectores de rechazo ni metadatos de la cirugía, lo que dificulta reproducir o auditar el proceso.
- Requiere `--trust-remote-code` y código de inferencia del proveedor, lo que añade superficie de riesgo en producción.
- Sin datos publicados de benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K), por lo que la calidad general más allá de HarmBench no está verificada.
- El contexto de ejemplo es de 16K; no se documenta la longitud máxima efectiva del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/dealignai/Ripple-65B-Preview-UNCENSORED-NVFP4
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Drafter DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Repositorio GGUF complementario: https://huggingface.co/dealignai/Ripple-65B-Preview-UNCENSORED-GGUF
- Versión oficial NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Cuantización de Red Hat: https://huggingface.co/RedHatAI/Ripple-65B-Preview-NVFP4
- SGLang: https://github.com/sgl-project/sglang
- Investigación de dealignai: https://dealign.ai/quantsteer.html
- Sitio de dealignai: https://dealign.ai
- X/Twitter de dealignai: https://x.com/dealignai
