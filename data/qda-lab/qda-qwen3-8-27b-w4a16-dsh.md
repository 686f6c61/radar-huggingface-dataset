# qda-lab/QDA-Qwen3.8-27B-W4A16-dsh

## Resumen

QDA-Qwen3.8-27B-W4A16-dsh es una cuantización de 4 bits de los pesos del modelo multimodal Qwen/Qwen3.8-27B, publicada por qda-lab. El modelo conserva la arquitectura y el pipeline originales (image-text-to-text, familia `qwen3_5`) pero reduce cada peso a un entero de 4 bits en grupos de 128, con activaciones en 16 bits (esquema W4A16), lo que rebaja el repositorio a 19,6 GB frente a los aproximadamente 55 GB que ocuparían los pesos en BF16 para 27.781.427.952 parámetros.

La particularidad de esta variante es que la receta de cuantización no la eligió un humano, sino un proceso de búsqueda automatizada de QDA (el backend `dsh`), que optimiza la asignación de precisión y los parámetros de GPTQ. Según la model card, el resultado iguala o supera ligeramente al modelo base en BF16 en la media de seis benchmarks de razonamiento, matemáticas e instrucciones, con un promedio de 81,2 frente a 80,2.

Es relevante ahora porque permite desplegar un modelo de 27B con capacidades de razonamiento en modo thinking y entrada de imagen en una sola GPU de 24-48 GB, usando vLLM o SGLang con kernels de cuantización comprimida (`compressed-tensors`), sin renunciar de forma apreciable a la calidad del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia `qwen3_5`, pipeline image-text-to-text); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos INT4 en grupos de 128, activaciones de 16 bits, GPTQ sobre copia rotada con Hadamard |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers, vLLM y SGLang |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento desde cero: parte de la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` de Qwen/Qwen3.8-27B. Los pesos se convierten a enteros de 4 bits en grupos de 128 mediante GPTQ aplicado sobre una copia del modelo rotada con Hadamard; la rotación se pliega dentro de los propios pesos, de modo que en inferencia no hay transformación en tiempo de ejecución. GPTQ pondera cada token de calibración con una puntuación de traza de Fisher (la incertidumbre del modelo original sobre las siguientes 16 posiciones, con suelo en un cuarto de la media).

La calibración usa 400 muestras de 2.048 tokens mezcladas de dos ficheros públicos: `own-answers-768.jsonl` (768 prompts del dataset qda-calibration-pools, config `reasoning`, con las respuestas del propio modelo base generadas con vLLM a temperatura 1,0, top-k 20, top-p 0,95, semilla 17 y hasta 4.096 tokens nuevos) y `d1-filtered.jsonl` (2.011 filas de la config `d1` tras eliminar 37 por solapamiento con conjuntos de evaluación). La receta concreta la seleccionó la búsqueda automática de QDA 0.1.0, y el repositorio `qda-lab/qda-recipe-inputs` permite reproducirla con `qda build`.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Qwen.
- Razonamiento en modo thinking, con cierre explícito en `` y control mediante `chat_template_kwargs` (`reasoning_effort`, p. ej. `"medium"`).
- Razonamiento matemático de competición (evaluado en AIME 2025 y HMMT Feb 2026).
- Razonamiento científico de nivel experto (GPQA-Diamond).
- Generación de código (LiveCodeBench) y seguimiento de instrucciones complejas (IFBench).
- Conocimiento general y multidisciplinar (MMLU-Pro).
- Entrada de imagen junto a texto (pipeline image-text-to-text), heredada del modelo base.
- Compatibilidad declarada con vLLM y SGLang mediante kernels de cuantización comprimida.
- Soporte de decodificación especulativa MTP en el modelo base (desactivada en la evaluación).
- Tool calling y capacidades de agente: no confirmadas explícitamente en la información disponible.

## Casos de uso

- Razonamiento matemático asistido: el modelo resuelve problemas de competición (90,8 en AIME 2025 en modo thinking) y puede usarse como motor de verificación o generación de soluciones paso a paso en plataformas educativas, con la ventaja de caber en una GPU de 24 GB.
- Análisis de documentos técnicos con imagen: al aceptar entrada image-text-to-text, permite extraer y razonar sobre diagramas, tablas escaneadas o capturas junto a texto explicativo en un mismo prompt.
- Generación y revisión de código: con 86,5 en LiveCodeBench, es adecuado para asistentes de programación integrados en IDE o pipelines de revisión, desplegado con vLLM para servir múltiples peticiones concurrentes.
- Evaluación científica automatizada: su rendimiento en GPQA-Diamond (82,4) lo hace útil como modelo de referencia para preguntas de nivel posgrado en dominios STEM, por ejemplo en la validación de bancos de preguntas.
- Despliegue en infraestructura limitada: al ocupar 19,6 GB en INT4, permite servir un modelo de 27B en una RTX 4090 o A6000 con vLLM, reduciendo el coste frente a alternativas en BF16 que exigen 80 GB.
- Seguimiento estricto de instrucciones en producción: con 68,4 en IFBench, encaja en tareas de formateo de salida, extracción estructurada y transformación de datos donde el cumplimiento del formato es crítico.
- Reproducción de investigación en cuantización: la receta y los ficheros de calibración publicados permiten replicar el proceso con QDA 0.1.0 y comparar variantes de búsqueda (`dsh` frente a la receta estándar).

## Benchmarks y rendimiento

Resultados en modo thinking, pass@1 promediado sobre 1-32 semillas, con temperatura 1,0, top-p 0,95, top-k 20 y `reasoning_effort: "medium"`:

| Benchmark | BF16 | QDA W4A16 | QDA W4A16-dsh |
|---|---|---|---|
| AIME 2025 | 88,0 | 89,4 | 90,8 |
| HMMT Feb 2026 | 74,1 | 75,0 | 76,2 |
| GPQA-Diamond | 82,0 | 81,9 | 82,4 |
| IFBench | 67,7 | 67,6 | 68,4 |
| MMLU-Pro | 83,7 | 82,8 | 83,2 |
| LiveCodeBench | 85,8 | 86,9 | 86,5 |
| Media | 80,2 | 80,6 | 81,2 |

El autor indica que las diferencias entre las dos columnas QDA están dentro del ruido entre ejecuciones. Configuración de evaluación: hasta 81.920 tokens nuevos en AIME 2025, HMMT Feb 2026 y LiveCodeBench, y 32.768 en GPQA-Diamond, IFBench y MMLU-Pro; 32 repeticiones (semillas 17-48) en AIME y HMMT, 16 (semillas 17-32) en GPQA e IFBench, 4 (semillas 17-20) en LiveCodeBench y 1 (semilla 17) en MMLU-Pro; decodificación especulativa MTP desactivada.

## Requisitos de hardware

- VRAM estimada: unos 19,6 GB solo para pesos; con caché KV y overhead de runtime, el consumo práctico parte de aproximadamente 22-24 GB para contextos cortos y crece con la longitud de contexto (no se publica la ventana máxima).
- GPU recomendadas: H100 y H200 (el autor documenta explícitamente su uso y una incidencia del kernel Machete con CUDA 13), además de A100 80 GB para servir con concurrencia alta.
- Consumer GPU: cabe en RTX 4090 (24 GB) y en RTX A6000 (48 GB); en GPUs de 24 GB el margen para contexto largo y lotes concurrentes es limitado.
- Despliegue: vLLM (`VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3.8-27B-W4A16-dsh`) y SGLang (`python -m sglang.launch_server --model-path ...`). En H100/H200 sin toolkit CUDA 13 en la máquina hay que añadir las librerías NVIDIA del entorno virtual a `LD_LIBRARY_PATH` para evitar el fallo `failed to open libnvrtc-builtins.so.13.0`.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de generación (la evaluación usa hasta 81.920 tokens nuevos por ítem en modo thinking, lo que implica generaciones largas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-W4A16-dsh | 27,8B | no disponible | INT4 W4A16 | Apache-2.0 | Hugging Face (qda-lab) |
| Qwen/Qwen3.8-27B (base) | 27,8B | no disponible | BF16 | Apache-2.0 | Hugging Face (Qwen) |
| QDA-Qwen3.8-27B-W4A16 | 27,8B | no disponible | INT4 W4A16 | Apache-2.0 | Hugging Face (qda-lab) |

La comparación con modelos de otros fabricantes del mismo tamaño no está disponible en la información proporcionada. Frente al base en BF16, esta variante reduce el peso del repositorio de aproximadamente 55 GB a 19,6 GB y mantiene una media de benchmarks de 81,2 frente a 80,2. Frente a la variante W4A16 estándar, las diferencias quedan dentro del ruido de ejecución.

## Limitaciones y advertencias

- La cuantización introduce una pérdida mínima pero real: MMLU-Pro baja de 83,7 (BF16) a 83,2 y LiveCodeBench de 86,9 (W4A16) a 86,5; no debe asumirse equivalencia exacta con el modelo original en todos los dominios.
- El autor advierte que las diferencias entre las dos variantes QDA están dentro del ruido entre ejecuciones; no deben interpretarse como mejoras sistemáticas.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado en la model card; el modo thinking con hasta 81.920 tokens de generación puede producir cadenas de razonamiento largas que no garantizan corrección.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide confirmar el comportamiento multilingüe o en contextos largos.
- Requisito operativo específico: en H100/H200 sin CUDA 13 hay que configurar `LD_LIBRARY_PATH`; además, el kernel Machete debe desactivarse en vLLM.
- Licencia del modelo Apache-2.0, pero los ficheros de calibración conservan sus propias licencias: `d1-filtered.jsonl` es CC BY-NC-SA 4.0 (no comercial) y los prompts de `own-answers-768.jsonl` provienen de NuminaMath-CoT (Apache-2.0), code_contests (CC BY 4.0) y ARC (CC BY-SA 4.0). Esto afecta a la reproducción de la receta, no al uso de los pesos.
- Reproducir la receta exige QDA 0.1.0, Linux, una GPU NVIDIA y `uv`; no es un proceso portable a otros entornos sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A16-dsh
- Variante W4A16 estándar: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibración: https://huggingface.co/datasets/qda-lab/qda-calibration-pools
- Receta e inputs reproducibles: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.8-27B-W4A16-dsh
- Repositorio QDA: https://github.com/humanfia/qda
- Paper referenciado (arXiv:2611.23388): https://arxiv.org/abs/2611.23388
