# immiq/Qwen3.8-Flash-Next-Abliterated-BF16

## Resumen

Qwen3.8-Flash-Next-Abliterated-BF16 es una versión modificada del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario independiente immiq en Hugging Face. Se trata de un finetune de tipo "abliterated" (ablación de la dirección de rechazo en los pesos) que busca reducir el comportamiento de censura del modelo original manteniendo intacta la mayor parte de su capacidad. El modelo base es un Mixture-of-Experts (MoE) multimodal de aproximadamente 180.000 millones de parámetros totales, con entrada de imagen y texto y salida de texto.

La innovación principal de esta release es que, en lugar de aplicar una ablación indiscriminada a todas las capas y expertos, el autor aplica una proyección ortogonal quirúrgica y dispersa (denominada `V2_rorth_s150_sp5`) sobre un subconjunto muy reducido de expertos enrutados, identificados mediante atribución a nivel de token. Según la model card, solo se editan 894 de los 24.576 expertos enrutados (3,64 %), mientras que el 96,36 % restante permanece bit a bit idéntico al modelo oficial. Esto pretende preservar el rendimiento en tareas de agente y codificación multi-turno y mantener la compatibilidad con cuantización posterior.

El modelo se distribuye en BF16 completo (131 shards de safetensors, 360 GB de repositorio) y está pensado como base para cuantizaciones posteriores (GGUF, AWQ, EXL3, FP8, NVFP4). Su relevancia actual radica en que ofrece una alternativa "sin censura" para desarrolladores que necesitan un modelo multimodal grande con soporte de tool calling y agentes, pero con una licencia comunitaria de Qwen que impone restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con Gated DeltaNet, Hyper-Connections y MTP heads segun la model card |
| Parametros totales | 179.999.981.459 (~180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las evaluaciones se hicieron con 16.384 tokens de contexto) |
| Tipos de cuantizacion | BF16 nativo; el autor indica compatibilidad con GGUF, imatrix, GSQ-RCO, AWQ, EXL3, FP8 y NVFP4 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (131 shards, 360 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE multimodal con 48 capas y 512 expertos enrutados por capa (24.576 expertos en total), según los datos de la model card. Incluye componentes arquitectónicos específicos mencionados por el autor: capas Per-Layer Embedding / N-gram fusion (95 GB), Gated DeltaNet decay gates, Hyper-Connections de cuatro ramas (Gated Residual), routers MoE de 512 vías, un codificador de visión y cabeceras MTP. La entrada es imagen y texto, y la salida es texto.

Esta release no es un reentrenamiento: es un finetune por edición de pesos. El autor aplica una proyección ortogonal sobre la dirección causal de rechazo identificada mediante atribución de escritura a nivel de token. Según la model card, la distribución de esa señal de rechazo es extremadamente dispersa (Gini = 0,9875 en las capas L8–L42, con el 5 % superior de expertos capturando el 97,36 % de la escritura positiva de rechazo). Solo se editan 894 expertos (3,64 %) y 40 shards de los 131; las capas L0–L7, L43–L47, los routers, embeddings, `lm_head`, el codificador de visión y las cabeceras MTP quedan intactos. Además, se ortogonaliza la dirección de rechazo contra 20 tokens críticos de agente y formato en `lm_head` (`</think>`, `<tool_call>`, `<|im_end|>`, `function`, `parameter`, etc.), con una alineación cos = 0,9950 con el eje de rechazo. El autor declara una puerta dura de outliers (max|W'|/max|W| ≤ 1,05) con cero retrocesos en los 40 shards editados. No se detallan datos de entrenamiento adicionales, número de tokens ni uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento estructurado, incluyendo modo `<think>` (razonamiento extendido) y modo sin razonamiento (zero-think).
- Comprensión de imágenes y texto (pipeline image-text-to-text): OCR, conteo y razonamiento espacial según las pruebas de visión del autor.
- Tool calling nativo mediante esquema XML `<tool_call>`, con soporte declarado para `function`, `parameter`, `return`, `import` y tokens de terminación.
- Uso como agente multi-turno: resolución de tareas de depuración e implementación sobre repositorios con herramientas de fichero y test.
- Capacidades multilingües limitadas a inglés, chino y multilingüe genérico según los tags.
- Generación de código Python y matemáticas (evaluado en HumanEval y MATH-500 por el autor).
- Comportamiento "uncensored"/abliterated: reducción de rechazos ante peticiones que el modelo original rechazaría (según la auditoría de 307 prompts de la model card).

## Casos de uso

- Agente de codificación multi-turno en sandbox: el modelo puede depurar repositorios, escribir tests y ejecutar herramientas de fichero con el esquema XML nativo; el autor reporta 12/12 tareas de agente superadas en su evaluación, lo que lo hace adecuado para pipelines de CI/CD asistidos.
- Asistente de atención al cliente multimodal: puede procesar capturas de pantalla o documentos escaneados junto con texto y mantener conversaciones multi-turno, aprovechando la ventana de contexto utilizada en las pruebas (16.384 tokens).
- Extracción de información de documentos e imágenes: OCR y razonamiento espacial permiten procesar facturas, formularios o diagramas y devolver datos estructurados vía tool calling.
- Generación de código en producción: con HumanEval pass@1 del 82,5 % en la evaluación del autor (zero-think), es viable como generador de funciones Python dentro de un pipeline con validación automática.
- Investigación sobre alineación y censura: al ser una versión abliterated con metodología documentada (`ABLITERATION_METHODOLOGY.md`), sirve como objeto de estudio para analizar circuitos de rechazo en modelos MoE.
- Razonamiento matemático asistido: con modo `<think>` y contexto largo, puede resolver problemas de varios pasos y verificarse con herramientas externas.
- Base para cuantización y despliegue en producción: al mantener los pesos en BF16 con salud de outliers controlada, es adecuado como punto de partida para generar GGUF, AWQ o FP8 y desplegar en infraestructura propia.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y se evaluaron sobre la misma base cuantizada `UD-IQ4_XS` (88 GiB) en A100-40GB, comparando el modelo oficial con esta release.

| Benchmark | Oficial | Esta release | Delta |
|---|---|---|---|
| Agente multi-turno (T=0,0) | 6/6 | 6/6 | empate |
| Agente multi-turno (T=1,0) | 5/6 | 6/6 | +1 |
| Agente total cruzado | 11/12 (91,7 %) | 12/12 (100 %) | +8,3 pp |
| Razonamiento regular R1–R4 | 8/8 (100 %) | 8/8 (100 %) | empate |
| Llamadas XML malformadas | 0 | 0 | empate |
| MMLU-Pro-200 | 75,50 % | 73,00 % | -2,50 pp |
| GPQA-Diamond-198 | 46,97 % | 44,95 % | -2,02 pp |
| HumanEval-40 | 82,50 % | 82,50 % | empate |
| IFEval-50 (prompt) | 68,00 % | 72,00 % | +4,00 pp |
| MATH-500-30 | 66,67 % | 63,33 % | -3,33 pp |
| Vision-5 | 40,00 % | 60,00 % | +20,00 pp |
| Media macro de 6 benchmarks | 63,27 % | 64,30 % | +1,03 pp |

El autor también reporta que el total de tokens de agente se reduce un 15,4 % (34.556 frente a 40.830) y que la auditoría de rechazo se realizó sobre 307 prompts verificados manualmente, aunque la tabla de esa sección aparece truncada en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 360 GB de pesos, por lo que se necesita un nodo multi-GPU (por ejemplo, 5×H100 80 GB o 9×A100 40 GB) para inferencia completa en BF16.
- En cuantización 4-bit (UD-IQ4_XS, 88 GiB) el autor la ejecutó en NVIDIA A100-40GB, lo que implica al menos 3 GPU de 40 GB o 2 de 80 GB para el modelo más el proyector multimodal.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, H200; en consumer GPU no cabe en BF16 ni en 4-bit en una sola RTX 4090 (24 GB); sería necesario repartir en varias GPU o usar cuantizaciones más agresivas no documentadas.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/GGUF (el autor indica compatibilidad), vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible; el autor solo reporta conteos de tokens generados, no velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (oficial) | ~180 B (MoE) | no disponible | qwen-community-1.0 | Base de esta release; sin ablación; censura estándar |
| Qwen3.8-Flash-Next-Abliterated-BF16 (esta release) | ~180 B (MoE) | no disponible | qwen-community-1.0 | Ablación quirúrgica; 96,36 % de expertos intactos |
| Alternativas abliterated de la familia Qwen | no disponible | no disponible | variable | No se dispone de datos concretos en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría (multimodal MoE de ~180 B abliterated) en la documentación aportada.

## Limitaciones y advertencias

- La licencia qwen-community-1.0 impone restricciones de uso comercial; es responsabilidad del usuario revisar los términos antes de desplegar en producción.
- El modelo está diseñado explícitamente para reducir rechazos; puede generar contenido dañino, sesgado o inexacto que el modelo original bloquearía. No es apto para aplicaciones sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de ~180 B, agravado por la edición de pesos en las capas de seguridad; requiere verificación factual en dominios críticos.
- La ablación se realizó con una metodología propietaria del autor (`V2_rorth_s150_sp5`) y los resultados de benchmarks son autoinformados, con muestras pequeñas (200, 198, 40, 50 y 30 preguntas), lo que limita la significación estadística.
- El repositorio tiene solo 3 descargas y 0 likes en el momento de la consulta; no hay validación independiente de la comunidad.
- Idiomas limitados a inglés, chino y multilingüe genérico; el rendimiento en castellano no está documentado.
- El tamaño de 360 GB y la necesidad de infraestructura multi-GPU limitan su uso a entornos con recursos considerables.
- No se documentan sesgos específicos ni evaluaciones de seguridad independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/immiq/Qwen3.8-Flash-Next-Abliterated-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Metodología de abliteración: `ABLITERATION_METHODOLOGY.md` (referenciado en el repositorio)
- Informe de auditoría en chino: `STAGE1_SOLUTION_REPORT.md` (referenciado en el repositorio)
- Base cuantizada usada en evaluación: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
