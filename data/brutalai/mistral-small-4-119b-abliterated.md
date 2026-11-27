# brutalai/mistral-small-4-119b-abliterated

## Resumen

Mistral-Small-4-119B Abliterated es una variante de la familia Mistral-Small-4, publicada por el colectivo independiente Brutal AI, que modifica el checkpoint oficial `mistralai/Mistral-Small-4-119B-2603` para reducir el comportamiento de rechazo (refusal) ante peticiones que el modelo base declinaria. La intervención es puramente de pesos: se editan directamente las proyecciones de salida de atención del stack de lenguaje, sin reentrenamiento, sin datos de preferencias y sin cambios en tokenizer ni vocabulario. El resto de pesos, incluida la torre multimodal, el proyector, los embeddings y la LM head, es idéntico byte a byte al checkpoint base.

Técnicamente es un modelo MoE multimodal de 119,4 mil millones de parámetros totales, con 128 expertos enrutados y top-4 por token más un experto compartido, distribuido en 36 capas con dimensión oculta de 4096 y 32 cabezas de atención (32 KV heads). Se distribuye en FP8 E4M3 con escalas por tensor y un layout consolidado de 7 shards, lo que reduce el repositorio a 121 GB frente a lo que ocuparía un checkpoint en BF16. La arquitectura combina el wrapper multimodal `mistral3` con el stack de texto `mistral4` y soporta un modo de razonamiento (thinking) que puede desactivarse por petición.

Su relevancia es doble: por un lado, ilustra una práctica de modificación de pesos cada vez más común en la comunidad open source para eliminar capas de rechazo; por otro, la model card aporta una evaluación cuantitativa poco habitual en este tipo de builds, midiendo tanto la reducción de rechazos como la retención de capacidades. Está publicada bajo licencia Apache-2.0 y orientada a inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal `mistral3` (wrapper) + `mistral4` (stack de texto) |
| Parametros totales | 119,4 B |
| Parametros activos | 4 expertos enrutados de 128 + 1 experto compartido por token (top-4) |
| Longitud de contexto | 32.768 tokens (configuración de servicio recomendada en la model card) |
| Tipos de cuantizacion | FP8 E4M3 con escalas por tensor (único formato publicado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors consolidado en 7 shards, FP8 E4M3 |
| Capas | 36 |
| Dimension oculta / cabezas | 4096 / 32 cabezas, 32 KV heads |
| Vocabulario | 131.072 tokens |
| Modelo base | `mistralai/Mistral-Small-4-119B-2603` (revisión `7ecb947b…`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base: un transformer con mezcla de expertos (MoE) de 36 capas, 128 expertos enrutados con activación top-4 por token y un experto compartido adicional. La atención usa 32 cabezas de consulta y 32 KV heads, con backend `FLASH_ATTN_MLA` en vLLM, lo que sugiere atención multi-head con latencia optimizada para memoria. El wrapper `mistral3` añade la capacidad multimodal (torre de visión y proyector), mientras que el stack `mistral4` gestiona el texto y el modo de razonamiento. El vocabulario es de 131.072 tokens.

No hubo entrenamiento adicional ni ajuste con datos de preferencias: la modificación consiste en editar directamente los pesos de las proyecciones de salida de atención del stack de lenguaje, técnica conocida como abliteration, que busca atenuar la dirección de activación asociada al rechazo. El resto del checkpoint es byte-idéntico al base. La distribución en FP8 E4M3 con escalas por tensor es una decisión de empaquetado, no de entrenamiento. La model card no documenta el volumen de tokens de preentrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general en inglés, con modo thinking disponible (desactivado por petición mediante `reasoning_effort: "none"`).
- Capacidad multimodal heredada del base: torre de visión y proyector intactos, aunque la model card no detalla tareas de visión evaluadas.
- Generación de código: evaluado en LiveCodeBench y MBPP con retención alta respecto al base.
- Seguimiento de instrucciones: evaluado en IFBench en modalidad loose y strict.
- Razonamiento numérico y financiero: evaluado en FinQA.
- Conocimiento general: evaluado en MMLU-Pro.
- Soporte de tool calling y function calling: no documentado explícitamente en la model card; se hereda del base si este lo soporta, pero no está confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado a inglés según los tags del repositorio.
- Comportamiento de rechazo reducido: 71 de 100 prompts dañinos respondidos frente a 10 del base (JBB).

## Casos de uso

- Investigación sobre alineación y refusal: el modelo permite estudiar cómo varía la tasa de rechazo al editar pesos de atención, con métricas comparables base vs. modificado (JBB, XSTest). Es adecuado porque la model card documenta el protocolo de evaluación y las etiquetas de comportamiento.
- Evaluación de retención de capacidades tras edición de pesos: útil para medir cuánto degrada una intervención de abliteration en tareas de código (LiveCodeBench, MBPP) e instrucciones (IFBench). El modelo ofrece cifras concretas de partida para replicar el experimento.
- Generación de código en pipelines internos: con 97,2 % de retención en MBPP respecto al base, puede integrarse en tareas de autocompletado y generación de tests donde el filtrado de contenido no sea requisito crítico.
- Procesamiento de documentos largos en inglés: la ventana de 32.768 tokens permite resumir y extraer información de contratos, informes o documentación técnica en una sola pasada.
- Análisis de documentación financiera: el rendimiento en FinQA (13 de 100 frente a 12 del base) lo hace apto para experimentos de extracción de datos numéricos de informes, aunque con expectativas moderadas.
- Despliegue en infraestructura multi-GPU con vLLM: el formato FP8 y el layout de 7 shards permiten servirlo con tensor parallelism 4 en GPUs de 80 GB, útil para laboratorios que quieran comparar comportamiento alineado vs. no alineado sobre el mismo stack.
- Investigación de seguridad ofensiva controlada: para estudiar respuestas del modelo ante prompts adversarios en entornos aislados, dado que responde a una fracción mucho mayor de prompts dañinos que el base.

## Benchmarks y rendimiento

Evaluación sobre 1.065 tareas de desarrollo divulgadas, decodificación greedy, thinking desactivado, semilla 17. Etiquetas de comportamiento de Qwen3Guard-Gen-8B; capacidad puntuada por graders fijados de LiveCodeBench, IFBench, MMLU-Pro, FinQA y MBPP.

| Medida | Base | Este modelo |
|---|---:|---:|
| Prompts dañinos respondidos (JBB, de 100) | 10 | 71 |
| Prompts dañinos rechazados (de 100) | 84 | 25 |
| Respuestas dañinas ilegibles (de 100) | 6 | 4 |
| Prompts benignos rechazados por error (XSTest, de 250) | 16 | 10 |
| LiveCodeBench pass@1 (de 175) | 66 | 53 |
| IFBench loose (de 300) | 106 | 110 |
| IFBench strict (de 300) | 86 | 86 |
| MMLU-Pro (de 140) | 61 | 57 |
| FinQA (de 100) | 12 | 13 |
| MBPP (de 50) | 36 | 35 |

La retención en MBPP es del 97,2 %. Se produjo un error de grader en LiveCodeBench en cada brazo y cinco errores de generación en el brazo base, que permanecen en el denominador.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 121 GB en disco; para inferencia en FP8 se necesita aproximadamente esa misma cifra más overhead de KV cache. Con contexto de 32.768 tokens y `--max-num-seqs 8` conviene reservar al menos 4 GPUs de 80 GB.
- GPUs recomendadas: 4× H100 80 GB o 4× A100 80 GB con tensor parallelism 4, según la configuración de vLLM de la model card. No cabe en una sola GPU de 80 GB en FP8.
- Consumer GPU: no es viable en GPUs de consumo (RTX 4090 de 24 GB) sin cuantizaciones adicionales no publicadas; el repositorio solo ofrece FP8 E4M3.
- Opciones de despliegue: vLLM es el backend documentado, con `--attention-backend FLASH_ATTN_MLA`, `--max-model-len 32768`, `--max-num-seqs 8`, `--max-num-batched-tokens 4096`, `--gpu-memory-utilization 0.90` y `--no-enable-prefix-caching`. No se documentan opciones para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| brutalai/mistral-small-4-119b-abliterated | 119,4 B (MoE top-4) | 32.768 | Apache-2.0 | FP8 E4M3 | Build abliterated, solo inglés |
| mistralai/Mistral-Small-4-119B-2603 | 119,4 B (MoE top-4) | no disponible | Apache-2.0 | no disponible | Base oficial, alineado; rechaza 84/100 en JBB |
| Alternativas abliterated de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación directa más relevante es con el checkpoint base, del que se diferencia únicamente en las proyecciones de salida de atención: mismo tamaño, misma licencia y misma arquitectura, con un intercambio medible entre reducción de rechazos y pérdida de capacidad (LiveCodeBench cae de 66 a 53 sobre 175; MMLU-Pro de 61 a 57 sobre 140). No se han identificado en la información proporcionada otros modelos comparables de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Evaluación con una sola semilla y una sola ejecución por brazo: diferencias de una o dos tareas son ruido estadístico.
- Las 1.065 tareas son datos de desarrollo divulgados, no un conjunto ciego reservado; existe riesgo de contaminación.
- El juez de comportamiento (Qwen3Guard-Gen-8B) pertenece a la misma familia que el modelo objetivo y etiqueta rechazo, no calidad de respuesta.
- Los rechazos falsos ante prompts benignos se reducen pero no desaparecen: 10 de 250 en XSTest.
- Las respuestas de código que alcanzan el límite de tokens puntúan cero; la truncación se contabiliza, no se repara.
- El modo thinking no fue evaluado.
- Sesgos conocidos: no documentados en la model card; al ser una edición de pesos sobre un base no auditado, los sesgos del base persisten.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Limitación de idioma: solo inglés según los tags; no se garantiza rendimiento en castellano ni en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo responde a una fracción muy alta de prompts dañinos (71/100 en JBB), lo que exige filtrado externo obligatorio en cualquier despliegue en producción.
- La reducción de rechazo puede degradar el cumplimiento de políticas de contenido y exponer al operador a riesgos legales o reputacionales.
- Solo se distribuye en FP8 E4M3; no hay versiones GGUF ni BF16 publicadas en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brutalai/mistral-small-4-119b-abliterated
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Sitio del autor: https://brutal.ai
