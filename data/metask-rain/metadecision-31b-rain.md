# MeTask-Rain/MetaDecision-31B-Rain

## Resumen

MetaDecision-31B-Rain es un modelo de decisión derivado de `google/gemma-4-31B-it`, publicado por MeTask-Rain como servicio para el benchmark JevBench. No es un modelo de propósito general: se trata de un adaptador LoRA de rango 16 sobre la versión cuantizada oficial de Google (QAT W4A16 con compressed-tensors, pesos de 4 bits y grupo de tamaño 32), empaquetado junto con el checkpoint base en un repositorio PEFT que se carga mediante vLLM con `enable_lora` y `max_lora_rank=16`. El adaptador se aplica a todas las peticiones y se entrena sobre las proyecciones q/k/v/o/gate/up/down del modelo de lenguaje.

La particularidad técnica del artefacto es que el adaptador incluye, para las 10 capas de atención completa (5, 11, …, 59), una copia byte a byte del LoRA de `k_proj` en el `v_proj`, de modo que vLLM aplique la misma actualización a claves y valores tal como se hizo durante el entrenamiento. El modelo base y el adaptador se distribuyen sin fusionar, con los pesos fijados por SHA-256 en el manifiesto del servicio.

Su relevancia es acotada y muy específica: sirve como servicio de decisión para JevBench, leyendo decisiones de las log-probabilidades del siguiente token de las formas de respuesta en una sola pasada de prompt, con una segunda pasada corta de borrador (máximo 192 tokens, plazo de 9 s) en hasta el 49 % de las decisiones. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que conviene verificar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con adaptador LoRA sobre el modelo base; atención completa en 10 capas (5, 11, …, 59) |
| Parametros totales | 31B (modelo base `google/gemma-4-31B-it`); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es un MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos base en W4A16 (4 bits, grupo de tamaño 32, simétrico, compressed-tensors); adaptador en BF16; entrenamiento sobre checkpoint q4_0 no cuantizado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a los términos de Gemma 4 de Google) |
| Formato de pesos | safetensors (checkpoint compressed-tensors + `adapter/adapter_model.safetensors` en formato PEFT) |

## Arquitectura y entrenamiento

El modelo es un transformer Gemma 4 de 31B parámetros en su variante instruct (`-it`), servido a través de la release oficial de Google con cuantización consciente del entrenamiento (QAT) W4A16 en formato compressed-tensors: pesos de 4 bits, grupo de tamaño 32 y simetría, revisión `52f3f65bc7a02d555763bc923bd1d9094898219d`. Sobre esa base se aplica un adaptador LoRA de rango 16 y alpha 32 sobre las proyecciones q/k/v/o/gate/up/down del modelo de lenguaje, entrenado en BF16 por el autor sobre la versión `qat-q4_0-unquantized` del mismo modelo base (revisión `1e4d8beecacb8b7590c1d8bedd7335f687bf311f`).

La innovación destacable no está en el entrenamiento sino en el empaquetado para inferencia: el fichero `adapter/adapter_model.safetensors` contiene los tensores entrenados sin cambios y, para las 10 capas de atención completa, un LoRA de `v_proj` que es copia byte a byte del LoRA de `k_proj` (20 tensores), de forma que vLLM aplique la actualización a claves y valores igual que en entrenamiento. Base y adaptador se cargan juntos y no se fusionan. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y decisión sobre formas de respuesta: el servicio lee decisiones a partir de las log-probabilidades del siguiente token de las opciones en una única pasada de prompt.
- Segunda pasada de borrador (drafting) de hasta 192 tokens bajo un plazo de 9 s, aplicada a hasta el 49 % de las decisiones.
- Relectura con opciones en orden inverso para decisiones de elección cuando el margen de la primera pasada es inferior a 4.
- Post-calibración de probabilidades por tipo de decisión (documentada en `DISCLOSURE.md`).
- Integración con vLLM 0.31.0 mediante LoRA dinámico (`enable_lora`, `max_lora_rank=16`).
- Capacidades del modelo base Gemma 4 31B-it (razonamiento, código, matemáticas, multilingüismo) potencialmente presentes, aunque no documentadas ni garantizadas en esta ficha.
- Tool calling, function calling, agentes y thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de decisión para JevBench: el modelo se usa tal cual para responder las decisiones del benchmark, leyendo las log-probabilidades de las formas de respuesta y aplicando la post-calibración por tipo; es su propósito declarado y el único documentado.
- Clasificación de opciones múltiples con probabilidades calibradas: en pipelines donde se necesita una distribución sobre un conjunto cerrado de respuestas, la lectura de log-probabilidades en una pasada evita generar texto libre y reduce latencia.
- Evaluación de modelos con LoRA dinámico en vLLM: sirve como ejemplo reproducible de despliegue de un adaptador PEFT sobre un checkpoint compressed-tensors W4A16, útil para equipos que quieran replicar la configuración.
- Enrutamiento o selección de herramientas en agentes: si se valida su comportamiento fuera de JevBench, el patrón de decisión por log-probabilidades puede adaptarse a elegir entre herramientas o acciones predefinidas.
- Investigación sobre calibración de probabilidades: el esquema de post-calibración por tipo y la relectura con opciones invertidas son un caso de estudio para estudiar sesgos de orden en decisiones de modelos.
- Despliegue de bajo coste en una sola GPU: al usar pesos de 4 bits con grupo 32 y un adaptador de rango 16, el conjunto es adecuado para servir en hardware con VRAM limitada frente al modelo completo en BF16, siempre que se acepte la pérdida de precisión de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos base W4A16 de 4 bits y 31B parámetros, el peso del modelo ronda los 16 GB, a lo que hay que sumar caché KV, activaciones y el adaptador LoRA en BF16; el total real depende de la longitud de contexto y del lote.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría esperar GPUs de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100), pero no hay confirmación en la información proporcionada.
- ¿Cabe en GPU de consumo? Probable en GPUs de 24 GB con cuantización W4A16 y contexto moderado, aunque no está verificado ni documentado.
- Opciones de despliegue: vLLM 0.31.0 con `enable_lora=True` y `max_lora_rank=16`, cargando el adaptador como `LoRARequest`. Otros motores (llama.cpp, Ollama, TGI) no están documentados para este artefacto.
- Latencia y throughput: no disponibles; el servicio impone un plazo de 9 s para la pasada de borrador y limita esta a 192 tokens, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MetaDecision-31B-Rain | 31B (base) + LoRA r16 | no disponible | W4A16 (grupo 32) + LoRA BF16 | apache-2.0 (enlace a licencia Gemma 4) | Hugging Face, vLLM |
| google/gemma-4-31B-it | 31B | no disponible | BF16 y variantes QAT | términos de Gemma 4 | Hugging Face |
| google/gemma-4-31B-it-qat-w4a16-ct | 31B | no disponible | W4A16 compressed-tensors | términos de Gemma 4 | Hugging Face |
| MeTask-Rain/metask-jev-rain-31B-trained | 31B (base) + LoRA r16 | no disponible | W4A16 + LoRA BF16 | apache-2.0 | Hugging Face |

La comparación se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento que permitan contrastarlo con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo especializado: está diseñado como servicio de decisión para JevBench; su comportamiento fuera de ese dominio no está documentado ni validado.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas generales (MMLU, HumanEval, GSM8K) ni comparación con alternativas.
- Licencia ambigua: el campo declara apache-2.0, pero el `license_link` apunta a los términos de Gemma 4 de Google; es imprescindible revisar las condiciones de uso comercial del modelo base antes de desplegarlo en producción.
- Cuantización agresiva: los pesos base en 4 bits con grupo 32 pueden degradar la precisión respecto al modelo en BF16; la calidad de las probabilidades depende de la post-calibración documentada en `DISCLOSURE.md`.
- Dependencia de vLLM 0.31.0 y de la copia del LoRA de `k_proj` en `v_proj`: cambiar de motor o fusionar el adaptador puede alterar el comportamiento respecto al entrenamiento.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe específico.
- Riesgo de alucinación y sesgos del modelo base Gemma 4 no evaluados en esta ficha.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes.
- Fechas de creación y actualización del repositorio (2026-10-31) posteriores a la fecha habitual de referencia; conviene verificar la vigencia del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeTask-Rain/MetaDecision-31B-Rain
- Repositorio de pesos referenciado: https://huggingface.co/MeTask-Rain/metask-jev-rain-31B-trained/tree/2feff076f07711fe2fefe7a6fdcedfe4132b773e
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Checkpoint QAT W4A16: https://huggingface.co/google/gemma-4-31B-it-qat-w4a16-ct
- Checkpoint QAT q4_0 no cuantizado: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Espejo del código del servicio en GitHub: https://github.com/chenyuwang166-oss/MetaDecision-31B-Rain
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Contacto del autor: chenyuwang166@gmail.com
