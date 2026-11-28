# Pentium95/Inkling-2-Mini-Uncensored-W4A16-g128-gptq

## Resumen

Inkling-2-Mini-Uncensored-W4A16-g128-gptq es una recuantización de OpenUncensored/Inkling-2-Mini-Uncensored, a su vez una versión "abliterated" (con los rechazos eliminados mediante edición de las proyecciones de salida de atención) de Inkling 2 Mini, desarrollado por Thinking Machines Lab. El trabajo de cuantización lo firma Pentium95 (Pento95), autor del servidor HyperInkling, y está pensado específicamente para ejecutar el modelo en una única GPU Ampere de 24 GB, como una RTX 3090 o 3090 Ti.

El modelo es multimodal (pipeline image-text-to-text), con 26.770.847.232 parámetros totales según los pesos en safetensors y un tamaño de repositorio de 17,2 GB. La recuantización convierte los expertos enrutados del modelo base (originalmente en NVFP4 en las capas 0-19 y MXFP8 en las 20-23) a INT4 con grupo de 128, asimétrico y calibrado con GPTQ, mientras que la atención, la cabeza LM y los embeddings se mantienen en bf16 y el vision tower, el drafter DSpark y los routers quedan sin cambios.

Su relevancia es práctica: permite servir un modelo MoE multimodal de ~26,8 mil millones de parámetros con capacidades de tool calling y razonamiento en hardware de consumo de gama alta, a costa de depender de un fork específico de vLLM (HyperInkling) que entiende el formato de expertos. No es un modelo de propósito general listo para producción: es un proyecto personal publicado para otros propietarios de RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con vision tower, drafter DSpark y controladores de bucle; formato de expertos enrutados INT4 GPTQ (empaquetado AWQ, para Marlin) |
| Parametros totales | 26.770.847.232 |
| Parametros activos | no disponible |
| Longitud de contexto | ~349k tokens con DFlash2, 8 peticiones y el vision tower en GPU (según la model card) |
| Tipos de cuantizacion | INT4 GPTQ grupo 128 asimétrico (expertos enrutados); bf16 (atención, LM head, embeddings) con conversión a INT8 g128 en carga por HyperInkling; FP8 KV opcional |
| Idiomas soportados | no disponible (la calibración incluye textos en italiano e inglés, pero no se declara una lista oficial de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que incorpora un vision tower para entrada de imágenes, un drafter DSpark (probablemente para decodificación especulativa) y controladores de bucle ("loop controllers"), lo que sugiere un modo de razonamiento iterativo. La model card menciona que el modelo base reporta "long reasoning loops", es decir, bucles de razonamiento largos que conviene acotar con `max_tokens` y un límite de turnos del agente.

La recuantización parte de los pesos NVFP4 (capas 0-19) y MXFP8 (capas 20-23) del modelo original, dequantizados y recalibrados con GPTQ por experto. La calibración usó 338k tokens en dos rondas procedentes de NousResearch/hermes-function-calling-v1, pixparse/docvqa-single-page-questions, ise-uiuc/Magicoder-Evol-Instruct-110K, wikimedia/wikipedia 20231101.it y HuggingFaceH4/ultrachat_200k, con las respuestas generadas por el propio modelo sin censura y capturando entradas de MoE y routing. Una sola ronda (166k tokens) dio un KL de 0,0026, por lo que duplicar la calibración no aportó mejora medible. No se dispone de información sobre el número total de tokens de entrenamiento del modelo original ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento (el servidor expone `--reasoning-parser inkling`).
- Comprensión de imágenes (pipeline image-text-to-text, vision tower incluido).
- Tool calling / function calling (parser `--tool-call-parser inkling` en el servidor OpenAI-compatible).
- Generación de código (la calibración incluye Magicoder-Evol-Instruct).
- Uso en agentes con razonamiento multi-paso, con la advertencia de acotar turnos por los bucles largos del modelo base.
- Capacidades multilingües parciales: la calibración incluye Wikipedia en italiano, pero no hay lista oficial de idiomas.
- Sin censura por diseño (abliterated): el modelo base eliminó los rechazos editando 20 proyecciones de salida de atención.

## Casos de uso

- Asistente conversacional local sin filtros: el modelo puede mantener diálogos multi-turno con contexto muy largo (~349k tokens) en una única RTX 3090, útil para prototipos de agentes personales donde se quiere evitar la censura del modelo base.
- Agente con tool calling en local: gracias al parser de tool calls y al servidor OpenAI-compatible de HyperInkling, se puede integrar en frameworks de agentes (LangChain, LlamaIndex) apuntando a `http://localhost/v1` con el modelo `inkling-2-mini`.
- Análisis de documentos con imágenes: el vision tower permite procesar capturas, formularios o páginas escaneadas junto con preguntas de texto (la calibración usó DocVQA), adecuado para extracción de información en pipelines internos.
- Generación y revisión de código: la inclusión de Magicoder-Evol-Instruct en la calibración y el soporte de tool calling permiten usarlo como asistente de código en un IDE o en un pipeline de CI/CD que consulte el endpoint local.
- Investigación sobre alineación y censura: al ser una variante abliterated, sirve para estudiar el efecto de eliminar los rechazos en las proyecciones de salida de atención sobre el comportamiento del modelo.
- Experimentación con cuantización: el checkpoint y la receta (HyperInkling `prepare/`) son un caso de estudio reproducible de GPTQ sobre pesos NVFP4/MXFP8 con métricas de KL y acuerdo top-1 frente al original.
- Despliegue de bajo coste en estación de trabajo: un solo equipo con RTX 3090 puede servir un MoE multimodal de ~26,8B con 8 peticiones concurrentes, sin necesidad de clúster multi-GPU.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye una evaluación de fidelidad de la cuantización frente al modelo fuente, con teacher forcing sobre 22 transcripciones reservadas (imágenes, tool calls, código, italiano, chat):

| Configuracion | KL mediana | KL media | Acuerdo top-1 |
|---|---|---|---|
| Expertos INT4 GPTQ (este checkpoint) | 0,0025 | 0,111 | 92,8% |
| + atención INT8, head, embeddings, KV FP8 (defaults de HyperInkling) | 0,0027 | 0,115 | 92,6% |

La media está dominada por unas pocas posiciones donde una diferencia pequeña cambia de experto; la mediana es la métrica representativa. El ruido del servidor en el momento de la medición era de 0,0003 / 0,060.

## Requisitos de hardware

- VRAM estimada: 17 GB en disco; el objetivo declarado es caber en 24 GB (RTX 3090 / 3090 Ti). Con atención INT8, head y embeddings INT8 y KV en FP8 (defaults de HyperInkling) y ~349k tokens de contexto, 8 peticiones y vision tower en GPU, el consumo se ajusta a esa tarjeta según el autor.
- GPU soportadas: exclusivamente RTX 3090 o 3090 Ti (Ampere). El autor indica explícitamente que no hay soporte para otras generaciones ni multi-GPU.
- GPU de datacenter (A100, H100): no soportadas según la model card; el kernel de expertos depende del parche de Ar4ikov (#69165) para Ampere.
- Despliegue: HyperInkling (fork de vLLM con parche para el formato de expertos), servidor OpenAI-compatible en `/v1` con modelo `inkling-2-mini`. vLLM estándar no puede cargar el formato de expertos.
- Latencia y throughput: no disponibles de forma numérica; la model card remite a la del checkpoint original y al README de HyperInkling.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-W4A16-g128-gptq (este) | 26,77B | ~349k (con DFlash2) | Apache-2.0 | INT4 GPTQ, requiere HyperInkling, solo RTX 3090/3090 Ti |
| Pentium95/Inkling-2-Mini-W4A16-g128-gptq | no disponible | no disponible | Apache-2.0 | Misma receta sobre el modelo sin censura; el autor remite a su card para velocidad y contexto |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | Apache-2.0 | Modelo base sin cuantizar; abliteration sobre 20 proyecciones de salida de atención |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Apache-2.0 | Modelo original de Thinking Machines Lab, con censura |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Requiere HyperInkling: vLLM estándar no reconoce el formato de expertos; sin el parche el modelo no carga.
- Soporte limitado a una única RTX 3090 o 3090 Ti; sin multi-GPU y sin otras generaciones de GPU.
- Proyecto personal sin promesa de soporte ni mantenimiento.
- Modelo "uncensored"/abliterated: no incorpora los rechazos del modelo original, lo que implica riesgo de generar contenido inapropiado, peligroso o ilegal y responsabilidad plena del operador.
- Bucles de razonamiento largos documentados en el modelo base: es necesario acotar `max_tokens` y los turnos del agente para evitar generaciones desbocadas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de veracidad.
- Idiomas soportados no declarados oficialmente; la calibración solo cubre parcialmente italiano e inglés.
- La fidelidad de la cuantización se midió con 22 transcripciones reservadas y antes de que el servidor fuese repetible; las cifras de KL tienen ruido asociado.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a Thinking Machines Lab, OpenUncensored y Pentium95.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pentium95/Inkling-2-Mini-Uncensored-W4A16-g128-gptq
- Modelo base sin cuantizar: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint hermano (sin censura, misma receta): https://huggingface.co/Pentium95/Inkling-2-Mini-W4A16-g128-gptq
- Servidor HyperInkling: https://github.com/Pento95/HyperInkling
- Soporte vLLM (PR #69028): https://github.com/vllm-project/vllm/pull/69028
- Soporte Ampere en vLLM (PR #69165): https://github.com/vllm-project/vllm/pull/69165
- Enfoque de porting HyperQwen: https://github.com/syv-ai/HyperQwen
- OpenUncensored: https://openuncensored.com
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
