# furiosa-ai/gemma-4-31B-it-FP8-block

## Resumen

El modelo `furiosa-ai/gemma-4-31B-it-FP8-block` es una versión cuantizada en FP8 del modelo multimodal `google/gemma-4-31B-it` de Google, preparada para inferencia eficiente con vLLM. Aunque el repositorio en HuggingFace está publicado bajo la cuenta `furiosa-ai`, la model card original atribuye el desarrollo a RedHatAI, que ha aplicado una cuantización post-entrenamiento sin datos (data-free) utilizando la librería LLM Compressor. El resultado es un modelo denso de 31.273 millones de parámetros que reduce el tamaño en disco y los requisitos de memoria GPU aproximadamente un 50% respecto al original en BF16, manteniendo una precisión casi idéntica en los benchmarks evaluados.

El modelo base Gemma 4 31B es una arquitectura densa multimodal que acepta texto, imagen y audio como entrada, genera texto, y soporta modo de razonamiento (thinking), tool calling y function calling. La versión FP8-block cuantiza pesos y activaciones de los operadores lineales de los bloques transformer con escalado por bloques de 128×128, dejando la torre de visión, las capas de embedding y la cabeza de salida en precisión original. Está diseñado para despliegue en producción con vLLM, con soporte validado en Red Hat OpenShift AI (RHOAI) y Red Hat AI Inference (RHAIIS) en versiones 3.5, así como en vLLM 0.24.0.

La relevancia de este modelo radica en que ofrece una alternativa cuantizada de alta calidad para entornos con recursos limitados, manteniendo capacidades multimodales completas (visión, audio, texto) y un rendimiento en benchmarks que iguala o incluso supera ligeramente al modelo original en tareas como IFEval y MMLU-Pro, con una recuperación de precisión del 100% o más en la mayoría de las pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer denso multimodal) |
| Parametros totales | 31.273.088.876 (31,27 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 256K tokens (modelo base); en el ejemplo de despliegue se usa 32.768 |
| Tipos de cuantizacion | FP8 block-wise (pesos y activaciones, bloques 128×128, group_size=128) |
| Idiomas soportados | más de 140 idiomas (modelo base) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `google/gemma-4-31B-it`, que emplea una arquitectura transformer densa multimodal (Gemma4ForConditionalGeneration) con codificadores separados para imagen y audio, y un decodificador de lenguaje que genera texto. El modelo base fue entrenado por Google con un contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas, con capacidades nativas de tool calling y un protocolo de razonamiento explícito (thinking mode).

La cuantización se realizó mediante `model_free_ptq` de LLM Compressor, un método post-entrenamiento sin datos que convierte los pesos y activaciones de los operadores lineales de los bloques transformer a FP8 con escalado por bloques (128×128). Las capas de visión, embedding y la cabeza de salida se mantienen en su precisión original (BF16). No se aplicó fine-tuning ni calibración con datos; la cuantización es puramente estática para pesos y dinámica para activaciones (group_size=128). Esta aproximación reduce el tamaño del modelo a la mitad y está optimizada para el backend de vLLM, que soporta nativamente kernels FP8.

## Capacidades

- Generación de texto y razonamiento: responde a instrucciones complejas, resuelve problemas de matemáticas y lógica, y puede activar un modo de pensamiento explícito (`enable_thinking`) para razonamientos multi-paso.
- Multimodal: acepta imágenes y audio como entrada adicional al texto, gracias a la torre de visión y el codificador de audio del modelo base.
- Tool calling y function calling: soporta el protocolo de herramientas de Gemma 4, con parser específico (`--tool-call-parser gemma4`) y validado en tareas de tool-calling.
- Razonamiento multi-paso: el modo thinking permite generar cadenas de razonamiento antes de la respuesta final, útil para tareas de matemáticas, código y análisis.
- Multilingüe: cubre más de 140 idiomas, lo que permite su uso en aplicaciones internacionales.
- Compatible con vLLM: integración nativa con el servidor OpenAI-compatible, incluyendo `--reasoning-parser gemma4` y `--enable-prefix-caching` para optimizar latencia.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens) y soporte multilingüe, lo que permite desplegar asistentes virtuales que mantienen el historial completo de la interacción y responden en el idioma del usuario.
- Generación de código en producción: con tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para autocompletar código, revisar pull requests o generar documentación técnica, reduciendo la intervención manual.
- Análisis de documentos multimodales: al aceptar imágenes y audio, puede procesar capturas de pantalla, diagramas, gráficos o grabaciones de voz para extraer información estructurada, útil en entornos de oficina o soporte técnico.
- Asistente de investigación científica: su capacidad de razonamiento matemático (GSM8K 95,78%, MATH-500 89,4%) lo hace adecuado para resolver problemas de física, ingeniería o finanzas, y para explicar conceptos complejos paso a paso.
- Automatización de tareas con agentes: gracias al soporte de function calling y al parser de herramientas, puede orquestar llamadas a APIs externas, bases de datos o servicios web en flujos de agente autónomo.
- Despliegue en entornos con GPU limitada: al ser FP8, cabe en GPUs de 24 GB con tensor parallelism de 2, lo que permite ejecutar un modelo de 31B en hardware de gama media (por ejemplo, dos RTX 4090 o A10G) para aplicaciones de inferencia en tiempo real.

## Benchmarks y rendimiento

La model card incluye una evaluación comparativa entre el modelo base y la versión FP8-block, realizada con lm-evaluation-harness, lighteval y BFCL, servidos con vLLM. Los resultados disponibles (sin thinking) son:

| Benchmark | google/gemma-4-31B-it | RedHatAI/gemma-4-31B-it-FP8-block | Recuperacion |
|---|---|---|---|
| IFEval (0-shot, prompt-level strict) | 90,70 | 91,25 | 100,6% |
| IFEval (0-shot, inst-level strict) | 93,45 | 94,00 | 100,6% |
| GSM8K Platinum (0-shot, strict-match) | 95,78 | 95,78 | 100,0% |
| MMLU-Pro (0-shot, custom-extract) | 85,41 | 85,44 | 100,0% |
| MATH-500 (0-shot, pass@1) | 89,40 | (dato no disponible en la informacion proporcionada) | - |

La tabla original continúa con más benchmarks (AIME 2025, GPQA Diamond, LiveCodeBench v6, BFCLv4), pero los valores no se han incluido en el texto extraído. La información disponible indica que la cuantización FP8 no degrada el rendimiento en las pruebas mostradas, e incluso mejora ligeramente en IFEval. No se han publicado resultados con thinking habilitado en el fragmento disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 31 GB (31,27 B × 1 byte). Con activaciones, KV cache y overhead, se recomienda al menos 40-50 GB de VRAM total para una ventana de contexto de 32K tokens.
- GPU recomendadas: el ejemplo de despliegue usa `--tensor-parallel-size 2`, lo que sugiere dos GPUs de 24 GB (por ejemplo, RTX 4090, A10G, L4) o una GPU de 48 GB+ (A6000, A100 80GB, H100).
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en una sola GPU de 48 GB (como RTX A6000) o en dos GPUs de 24 GB con tensor parallelism. No cabe en una RTX 4090 de 24 GB sin cuantización adicional.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo FP8), también compatible con TGI y llama.cpp si se convierte a GGUF, aunque la optimización está pensada para vLLM.
- Latencia y throughput: no se proporcionan datos específicos. La cuantización FP8 reduce el ancho de banda de memoria a la mitad, lo que típicamente mejora el throughput entre 1,5 y 2 veces respecto a BF16 en GPUs con soporte FP8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| google/gemma-4-31B-it | 31,27 B | 256K | BF16 (original) | Apache-2.0 (Gemma 4) | Modelo base sin cuantizar, mayor precisión pero mayor uso de memoria |
| furiosa-ai/gemma-4-31B-it-FP8-block | 31,27 B | 256K | FP8 block-wise | Apache-2.0 | Este modelo, optimizado para vLLM, recuperación ~100% |
| Hyper-AI/gemma-4-31B-it-fp8 | 31,27 B | 256K | FP8 (estándar) | Apache-2.0 | Otra cuantización FP8 del mismo base, sin detalles de evaluación publicados |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de modelos de otros fabricantes con el mismo tamaño y capacidades multimodales en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera pérdida de precisión en tareas muy sensibles a los pesos, aunque los benchmarks mostrados indican una recuperación del 100% o superior en la mayoría de los casos.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM entrenados con datos web; la cuantización no corrige estos problemas.
- La longitud de contexto máxima de 256K tokens es teórica; en la práctica, el uso de memoria crece linealmente con la longitud, y el ejemplo de despliegue recomienda 32K tokens para un equilibrio razonable.
- La licencia declarada es Apache-2.0, pero la model card enlaza a la licencia específica de Gemma 4 de Google, que puede incluir términos adicionales (por ejemplo, restricciones de uso comercial o atribución). Se recomienda revisar el texto completo de la licencia antes de usar el modelo en producción.
- El modelo está optimizado para vLLM; su uso con otros frameworks puede requerir conversión de formato y no garantiza el mismo rendimiento.
- No se han publicado resultados de evaluación con thinking habilitado en el fragmento disponible, por lo que el impacto de la cuantización en el modo de razonamiento no está completamente verificado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/furiosa-ai/gemma-4-31B-it-FP8-block
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Guía de uso con vLLM: https://recipes.vllm.ai/Google/gemma-4-31B-it
- Model card de Gemma 4 (Google): https://ai.google.dev/gemma/docs/core/model_card_4
- Otra cuantización FP8 del mismo base: https://huggingface.co/Hyper-AI/gemma-4-31B-it-fp8
- Benchmarks en DGX Spark con FP8: https://forums.developer.nvidia.com/t/gemma-4-31b-on-dgx-spark-runtime-fp8-benchmarks-single-dual-node-tp-2/365814
