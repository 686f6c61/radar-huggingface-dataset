# qda-lab/QDA-Qwen3.8-27B-W3A16

## Resumen

QDA-Qwen3.8-27B-W3A16 es una versión cuantizada a 3 bits de los pesos del modelo multimodal Qwen/Qwen3.8-27B, publicada por qda-lab. La cuantización reduce el tamaño del checkpoint de 55,6 GB en BF16 a 14,5 GB (unas 3,8 veces menos), manteniendo una precisión que el autor sitúa a la par o ligeramente por encima del modelo original en la media de los benchmarks evaluados. El modelo conserva la pipeline image-text-to-text del original, por lo que mantiene capacidades de visión además de texto.

La relevancia de esta ficha está en el método: no es una cuantización GPTQ/AWQ convencional, sino una receta construida con QDA (Closed-Loop LLM Quantization Design with Agents), un sistema de búsqueda automatizada de recetas de cuantización descrito en el paper arXiv:2611.23388. Se parte del checkpoint 3 bits GSQ publicado por ISTA-DASLab y se reajustan escalas de grupo y algunos tensores en BF16, dejando la cabeza de salida y los embeddings en 4 bits.

El resultado es un modelo de 27.781.427.952 parámetros (27,8 mil millones) con pesos en int3 y activaciones en 16 bits (esquema W3A16), empaquetado con compressed-tensors y pensado para servirse exclusivamente en vLLM sobre GPUs NVIDIA. La licencia es Apache-2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; incluye bloque MTP (multi-token prediction) heredado del base |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos int3 con grupos de 128; escalas de grupo reajustadas; cabeza de salida y embeddings en 4 bits; activaciones en 16 bits (W3A16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors; libreria transformers; compatible con vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B original, un transformer multimodal de unos 27,8 mil millones de parámetros que procesa entradas de imagen y texto. Sobre esa base, QDA no reentrena el modelo: parte del checkpoint cuantizado a 3 bits GSQ de ISTA-DASLab (grupos de 128, licencia Apache-2.0), conserva sus pesos enteros de 3 bits sin cambios y reajusta las escalas de grupo y determinados tensores en BF16 mediante una búsqueda automatizada de recetas. Los embeddings se dequantizan a BF16 en el punto de partida y se vuelven a cuantizar a 4 bits en la salida, igual que la cabeza de salida. El bloque MTP en BF16 del modelo base se reincorpora al checkpoint.

El proceso de construcción se ejecutó sobre 2 GPUs H100 de 80 GB y está documentado de forma reproducible: el repositorio de datos qda-lab/qda-recipe-inputs contiene la receta YAML (qwen3.8-27b-w3a16.yaml), el checkpoint de partida (start/, 14,6 GB) y el script derive_start.py, que reconstruye ese punto de partida byte a byte a partir del release de ISTA y de la revisión concreta del modelo Qwen original (commit 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0). El autor advierte que los pesos reconstruidos no son idénticos bit a bit a este checkpoint. No se detallan en la información disponible los datos de entrenamiento del modelo base ni si hubo RLHF/DPO en su alineamiento.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con cierre de razonamiento en la etiqueta `` y control mediante `chat_template_kwargs` (`reasoning_effort`, por ejemplo "medium").
- Razonamiento matemático de competición: evaluado en AIME 2025 y HMMT Feb 2026 con hasta 81.920 tokens nuevos por ítem.
- Razonamiento científico de nivel experto: evaluado en GPQA-Diamond.
- Generación y resolución de código: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFBench.
- Conocimiento general y multidisciplinar: evaluado en MMLU-Pro.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base.
- Soporte de decodificación especulativa mediante el bloque MTP del modelo base (desactivado en la evaluación publicada).
- Soporte de tool calling / function calling y de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo mantiene e incluso mejora los resultados del BF16 en AIME 2025 (92,8 frente a 88,0) y HMMT Feb 2026 (81,9 frente a 74,1), por lo que es adecuado para entornos de resolución de problemas con cadenas de razonamiento largas (hasta 81.920 tokens nuevos configurados en la evaluación).
- Despliegue en infraestructura con VRAM limitada: al ocupar 14,5 GB de pesos frente a 55,6 GB en BF16, permite servir un modelo de 27,8 B en GPUs como L40S o RTX Pro 6000, donde la versión BF16 no cabría con holgura.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia reproducible (receta YAML, dataset de entrada y script de derivación publicados) para investigadores que quieran replicar o comparar recetas de cuantización de 3 bits sobre la misma base.
- Inferencia de alto rendimiento con vLLM: el modelo está empaquetado con compressed-tensors y pensado para `vllm serve`, lo que facilita integrarlo en servicios de generación con batching continuo en H100, A100, B200 o GB300.
- Tareas de instrucciones estrictas: con IFBench en 67,4 (prácticamente idéntico al BF16, 67,7), es apto para pipelines donde el cumplimiento de formato y restricciones es crítico.
- Generación de código en flujos de desarrollo: LiveCodeBench en 84,6 frente a 85,8 del BF16, suficiente para asistentes de código que priorizan coste de despliegue sobre la precisión máxima.
- Procesamiento de documentos con imagen y texto: al conservar la pipeline image-text-to-text del base, puede emplearse en tareas que combinen capturas, diagramas o documentos escaneados con texto, siempre que se valide el comportamiento multimodal tras la cuantización (no se publican benchmarks multimodales).

## Benchmarks y rendimiento

Resultados publicados por el autor en modo thinking, pass@1 promediado sobre varias semillas, mismas condiciones para todos los modelos:

| Benchmark | BF16 (55,6 GB) | QDA W3A16 (14,5 GB) | ISTA-DASLab GSQ 3-bit |
|---|---|---|---|
| AIME 2025 | 88,0 | 92,8 | 91,0 |
| HMMT Feb 2026 | 74,1 | 81,9 | 75,6 |
| GPQA-Diamond | 82,0 | 79,8 | 78,2 |
| IFBench | 67,7 | 67,4 | 67,4 |
| MMLU-Pro | 83,7 | 82,4 | 82,1 |
| LiveCodeBench | 85,8 | 84,6 | 82,4 |
| Media | 80,2 | 81,5 | 79,4 |

Configuración de evaluación: máximo de tokens nuevos por ítem de 81.920 en AIME 2025, HMMT Feb 2026 y LiveCodeBench, y de 32.768 en GPQA-Diamond, IFBench y MMLU-Pro; repeticiones de 32 (semillas 17-48), 16 (17-32), 4 (17-20) o 1 (semilla 17) según el benchmark; muestreo con temperatura 1,0, top-p 0,95, top-k 20, min-p 0, sin penalización de presencia ni de repetición; thinking activado con `reasoning_effort: medium`; MTP y decodificación especulativa desactivados.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 14,5 GB; hay que sumar caché KV y overhead del runtime, por lo que se recomienda al menos 24 GB para contextos moderados y más para contextos largos (la longitud de contexto no se especifica en la información disponible).
- GPUs validadas por el autor: NVIDIA H100, A100, L40S, RTX Pro 6000 y B200. También se menciona una prueba en GB300 (con el modelo Qwen3.5-4B-W3A16, listo en 340 s tras configurar el entorno).
- GPU de consumo: no se confirma soporte en GPUs consumer; el autor solo lista GPUs de datacenter y workstation profesional. No hay datos de funcionamiento en RTX 4090.
- Despliegue: exclusivamente vLLM (`VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3.8-27B-W3A16`). SGLang no soporta todavía este formato de 3 bits. No se menciona soporte en llama.cpp, Ollama ni TGI.
- Requisito de entorno: sin CUDA 13 en la máquina, la compilación del kernel W3A16 falla (`failed to open libnvrtc-builtins.so.13.0`); hay que añadir las librerías NVIDIA del venv a `LD_LIBRARY_PATH` con el comando incluido en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.
- Reproducción de la receta: 2 GPUs H100 de 80 GB y QDA 0.1.0 sobre Linux con uv.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano de pesos | Media de benchmarks | Licencia | Runtime |
|---|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-W3A16 | 27,8 B | W3A16 (int3, grupos de 128) | 14,5 GB | 81,5 | Apache-2.0 | vLLM |
| Qwen/Qwen3.8-27B (BF16) | 27,8 B | BF16 | 55,6 GB | 80,2 | Apache-2.0 | transformers, vLLM y otros |
| ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ | 27,8 B | 3 bits GSQ | no disponible | 79,4 | Apache-2.0 | no disponible |

La comparación se limita a variantes del mismo modelo base, que es lo que cubre la información disponible. Frente al BF16, QDA W3A16 gana 1,3 puntos de media, con mejoras notables en AIME 2025 (+4,8) y HMMT Feb 2026 (+7,8) y ligeras pérdidas en GPQA-Diamond (-2,2), MMLU-Pro (-1,3) y LiveCodeBench (-1,2). Frente al GSQ de ISTA, mejora en todos los benchmarks reportados salvo IFBench, donde empata.

## Limitaciones y advertencias

- Solo se ha validado en vLLM; SGLang no soporta el formato y no hay evidencia de funcionamiento en llama.cpp, Ollama o TGI.
- Requiere resolver manualmente la dependencia de CUDA 13 para compilar el kernel W3A16 en máquinas sin toolkit instalado.
- No hay datos publicados sobre rendimiento multimodal (visión) tras la cuantización, pese a que la pipeline es image-text-to-text; conviene validar las tareas de imagen antes de usarlo en producción.
- No se especifican longitud de contexto, idiomas soportados ni datos de entrenamiento del modelo base en la información disponible.
- Los benchmarks son autoinformados por el autor y usan configuraciones de muestreo y repeticiones heterogéneas entre tareas (de 1 a 32 semillas), lo que limita la comparación directa con terceros.
- La media favorable frente al BF16 no implica superioridad universal: pierde en GPQA-Diamond, MMLU-Pro y LiveCodeBench, tareas relevantes para uso científico y de código.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; son los heredados del modelo base Qwen3.8-27B.
- Los pesos reconstruidos con la receta publicada no son idénticos bit a bit a este checkpoint, lo que puede producir diferencias menores en resultados.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial; deben respetarse las condiciones de los componentes de terceros (checkpoint GSQ de ISTA-DASLab).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint de partida (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ
- Dataset con receta e insumos: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Receta YAML: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.8-27B-W3A16/qwen3.8-27b-w3a16.yaml
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio de código QDA: https://github.com/humanfia/qda
