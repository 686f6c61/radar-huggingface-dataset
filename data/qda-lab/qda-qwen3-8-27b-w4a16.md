# qda-lab/QDA-Qwen3.8-27B-W4A16

## Resumen

QDA-Qwen3.8-27B-W4A16 es una cuantizacion de 4 bits de los pesos del modelo Qwen/Qwen3.8-27B, desarrollada por qda-lab mediante su pipeline automatizado QDA (Closed-Loop LLM Quantization Design with Agents). El modelo base es un transformer multimodal de tipo image-text-to-text de 27.781.427.952 parametros (aproximadamente 27,8 mil millones), y esta cuantizacion reduce el peso en disco de 55,6 GB en BF16 a 19,5 GB, un factor de 2,8x, manteniendo una precision practicamente identica al original segun la evaluacion del autor.

La relevancia de esta ficha reside en que demuestra que la cuantizacion W4A16 (pesos de 4 bits, activaciones de 16 bits) con GPTQ sobre una copia rotada con Hadamard y ajuste fino de escalas por destilacion puede igualar o superar ligeramente al BF16 en benchmarks de razonamiento, matematicas y codigo. El autor reporta una media de 80,6 frente a 80,2 del BF16 en su conjunto de seis benchmarks, lo que situa a esta variante por delante de otras cuantizaciones INT4 comparables como AWQ-INT4 de cyankiwi, RedHat INT4 o ParoQuant.

El modelo conserva la licencia Apache-2.0 del modelo base y esta pensado para despliegue en produccion con vLLM y SGLang sobre GPUs NVIDIA H100, A100, RTX Pro 6000 y B200. Incluye modo thinking con `reasoning_effort` configurable y soporte de decodificacion especulativa MTP en el modelo base, aunque la evaluacion publicada se realizo con MTP desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos INT4 en grupos de 128, activaciones de 16 bits); formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; compatible con compressed-tensors, vLLM y SGLang) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer multimodal de tipo image-text-to-text, segun la etiqueta de pipeline y los tags del repositorio (`qwen3_5`, `image-text-to-text`). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion tecnica de esta variante es el proceso de cuantizacion. Los pesos se convierten a enteros de 4 bits en grupos de 128 mediante GPTQ aplicado sobre una copia del modelo rotada con Hadamard; la rotacion se pliega dentro de los pesos, de modo que no hay transformacion en tiempo de ejecucion. Posteriormente, las escalas de grupo se ajustan por destilacion. La receta completa fue seleccionada por la busqueda automatizada de QDA, y el autor publica el fichero de receta y los datos de calibracion y destilacion para reproducir el proceso con QDA 0.1.0 sobre 2x H100 de 80 GB. El modelo base incluye soporte de decodificacion especulativa MTP, que el autor desactiva en la evaluacion publicada.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia del modelo base.
- Razonamiento en modo thinking, con cierre explicito en `` y control mediante `chat_template_kwargs={"reasoning_effort": "medium"}`.
- Razonamiento matematico de competicion: evaluado en AIME 2025 y HMMT Feb 2026 con hasta 81.920 tokens nuevos por item.
- Razonamiento cientifico de nivel experto: evaluado en GPQA-Diamond.
- Generacion de codigo: evaluada en LiveCodeBench con 86,9 de media en la variante W4A16.
- Seguimiento de instrucciones: evaluado en IFBench.
- Conocimiento general y razonamiento multidisciplinar: evaluado en MMLU-Pro.
- Procesamiento de imagen y texto (image-text-to-text) por herencia del modelo base.
- Compatibilidad con tool calling y function calling: no confirmada explicitamente en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion disponible.

## Casos de uso

- Razonamiento matematico asistido en entornos educativos o de investigacion: el modelo obtiene 89,4 en AIME 2025 y 75,0 en HMMT Feb 2026 en modo thinking, por lo que es adecuado para resolver problemas de competicion con cadenas de razonamiento largas (hasta 81.920 tokens nuevos).
- Analisis cientifico y respuesta a preguntas de nivel experto: con 81,9 en GPQA-Diamond, puede emplearse como asistente de apoyo en dominios de fisica, quimica y biologia avanzadas, siempre con revision humana.
- Generacion y revision de codigo en pipelines de CI/CD: con 86,9 en LiveCodeBench, es apto para tareas de sintesis de codigo, generacion de tests y revision automatizada, desplegado con vLLM o SGLang.
- Despliegue en infraestructura con VRAM limitada: al ocupar 19,5 GB en INT4 frente a 55,6 GB en BF16, permite servir el modelo en una sola GPU de 24 GB o 48 GB con cuantizacion adicional o en GPUs profesionales de 80 GB con mayor margen para el KV cache.
- Servicio conversacional de alto throughput: el autor reporta 1.377 tok/s a batch 16 en una H100 80GB, lo que lo hace adecuado para atencion al cliente automatizada o asistentes internos con muchas peticiones concurrentes.
- Procesamiento de documentos con imagen y texto: al heredar la modalidad image-text-to-text del base, puede emplearse para extraccion de informacion de capturas, formularios escaneados o graficos combinados con preguntas en lenguaje natural.
- Evaluacion comparativa de tecnicas de cuantizacion: la publicacion de la receta, los datos de calibracion y el codigo de QDA permite a investigadores reproducir y auditar el proceso en sus propios modelos.

## Benchmarks y rendimiento

Resultados publicados por el autor en modo thinking, pass@1 promediado sobre semillas (1 a 32 segun benchmark), con temperature 1.0, top-p 0.95, top-k 20 y `reasoning_effort: medium`. MTP desactivado.

| Benchmark | BF16 (55,6 GB) | QDA W4A16 (19,5 GB) | cyankiwi AWQ-INT4 (21,0 GB) | RedHat INT4 (19,5 GB) | ParoQuant (18,8 GB) |
|---|---|---|---|---|---|
| AIME 2025 | 88,0 | 89,4 | 86,6 | 85,1 | 86,9 |
| HMMT Feb 2026 | 74,1 | 75,0 | 73,2 | 70,6 | 66,0 |
| GPQA-Diamond | 82,0 | 81,9 | 81,6 | 81,3 | 81,0 |
| IFBench | 67,7 | 67,6 | 68,4 | 68,0 | 67,5 |
| MMLU-Pro | 83,7 | 82,8 | 83,1 | 82,7 | 83,1 |
| LiveCodeBench | 85,8 | 86,9 | 83,6 | 86,4 | 79,5 |
| Media | 80,2 | 80,6 | 79,4 | 79,0 | 77,3 |

Configuracion de evaluacion:

| Parametro | AIME 2025 | HMMT Feb 2026 | GPQA-Diamond | IFBench | MMLU-Pro | LiveCodeBench |
|---|---|---|---|---|---|---|
| Tokens nuevos maximos | 81.920 | 81.920 | 32.768 | 32.768 | 32.768 | 81.920 |
| Repeticiones | 32 (semillas 17-48) | 32 (semillas 17-48) | 16 (semillas 17-32) | 16 (semillas 17-32) | 1 (semilla 17) | 4 (semillas 17-20) |

Rendimiento en una H100 80GB con 512 tokens generados por peticion (tok/s = tokens generados / tiempo de pared, media de 2 ejecuciones): 107 tok/s a batch 1 y 1.377 tok/s a batch 16. ParoQuant obtuvo 61 y 840 tok/s respectivamente en vLLM 0.19.1.

## Requisitos de hardware

- VRAM estimada para inferencia: 19,5 GB de pesos en INT4; a esta cifra hay que sumar el KV cache, cuyo tamano depende de la longitud de contexto, que no se especifica en la informacion disponible.
- GPUs validadas por el autor: NVIDIA H100, A100, RTX Pro 6000 y B200.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (por ejemplo RTX 4090 de 24 GB) siempre que se limite la longitud de contexto para acomodar el KV cache; en tarjetas de 16 GB no es viable sin cuantizacion adicional del KV cache o reduccion de contexto.
- Opciones de despliegue: vLLM (`VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3.8-27B-W4A16`) y SGLang (`python -m sglang.launch_server --model-path qda-lab/QDA-Qwen3.8-27B-W4A16`). Compatible con transformers y compressed-tensors.
- Nota de despliegue en H100 y H200 sin CUDA 13: es necesario anadir las librerias NVIDIA del entorno virtual a `LD_LIBRARY_PATH` para evitar el fallo `failed to open libnvrtc-builtins.so.13.0` durante la compilacion del kernel al arrancar.
- Latencia y throughput: 107 tok/s a batch 1 y 1.377 tok/s a batch 16 en una H100 80GB con 512 tokens generados por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Media de benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-W4A16 | 27,8 mil millones | 19,5 GB | no disponible | 80,6 | Apache-2.0 | Hugging Face (qda-lab) |
| Qwen3.8-27B BF16 (base) | 27,8 mil millones | 55,6 GB | no disponible | 80,2 | Apache-2.0 | Hugging Face (Qwen) |
| cyankiwi AWQ-INT4 | 27,8 mil millones | 21,0 GB | no disponible | 79,4 | Apache-2.0 (heredada) | Hugging Face (cyankiwi) |
| RedHat INT4 | 27,8 mil millones | 19,5 GB | no disponible | 79,0 | Apache-2.0 (heredada) | Hugging Face (RedHat) |
| ParoQuant | 27,8 mil millones | 18,8 GB | no disponible | 77,3 | no disponible | Hugging Face (ParoQuant) |

## Limitaciones y advertencias

- Los benchmarks publicados son los del autor del modelo; no se han verificado de forma independiente en la informacion disponible.
- El modelo es una cuantizacion INT4: aunque la media global iguala al BF16, MMLU-Pro baja de 83,7 a 82,8 y IFBench de 67,7 a 67,6, por lo que en tareas de conocimiento general y seguimiento estricto de instrucciones puede haber una perdida pequena pero real.
- La evaluacion se realizo con MTP desactivado; el rendimiento con decodificacion especulativa activada no se reporta.
- La reproducibilidad no es exacta: el propio autor advierte que los pesos reconstruidos con la receta publicada no son identicos bit a bit a este checkpoint.
- No se especifican los idiomas soportados; el comportamiento multilingue debe validarse empiricamente antes de usarlo en produccion con idiomas distintos del ingles.
- No se especifica la longitud de contexto; planificar el despliegue sin asumir una ventana concreta y medir el consumo de KV cache en el hardware objetivo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado por la cuantizacion; en dominios de alta precision (medicina, derecho, finanzas) requiere verificacion humana.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.8-27B.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.8-27B por si anaden terminos adicionales.
- En H100 y H200 sin CUDA 13 es necesario configurar `LD_LIBRARY_PATH` con las librerias NVIDIA del entorno virtual antes de arrancar vLLM; de lo contrario el servidor falla al compilar el kernel.
- El repo tiene un numero bajo de descargas (315) y cero likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Receta de cuantizacion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.8-27B-W4A16/qwen3.8-27b-w4a16.yaml
- Datos de calibracion y destilacion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.8-27B-W4A16
