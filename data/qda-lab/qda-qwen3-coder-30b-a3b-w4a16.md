# qda-lab/QDA-Qwen3-Coder-30B-A3B-W4A16

## Resumen

QDA-Qwen3-Coder-30B-A3B-W4A16 es una cuantizacion de 4 bits de los pesos del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct, desarrollada por qda-lab. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) de Qwen con 30.532.122.624 parametros totales, orientado a generacion de texto y, por su nombre, especializado en tareas de codigo. Esta version cuantizada reduce el peso de 61,1 GB en BF16 a 17,8 GB, un factor de 3,4x, manteniendo segun el autor el 99,5% de la precision del modelo original.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de 30B con calidad cercana a BF16 en hardware mucho mas modesto, lo que facilita su despliegue en produccion. La cuantizacion emplea GPTQ con grupos de 64, proyecciones de atencion en 8 bits y un ajuste fino de las escalas de grupo mediante destilacion, con un recetario reproducible publicado por el autor.

El modelo se distribuye con licencia Apache-2.0, la misma que el modelo base, y esta pensado para su uso con vLLM y transformers. Los benchmarks publicados en la model card muestran una media de 40,1 frente a 40,3 del BF16 en un conjunto de seis pruebas, lo que situa la perdida de calidad en un margen muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos INT4 en grupos de 64, activaciones de 16 bits); proyecciones de atencion en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts de la familia Qwen3-Coder, con 30.532.122.624 parametros totales. La model card no detalla el numero de parametros activos por token, la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original Qwen/Qwen3-Coder-30B-A3B-Instruct y no se reproducen en la informacion disponible.

La innovacion tecnica de esta version es el proceso de cuantizacion. Los pesos se almacenan como enteros de 4 bits en grupos de 64, cuantizados con GPTQ; las proyecciones de atencion se mantienen en 8 bits y las escalas de grupo se ajustan finamente mediante destilacion. El recetario fue seleccionado por una busqueda automatizada de QDA, descrita en el paper "QDA: Closed-Loop LLM Quantization Design with Agents" (arXiv:2611.23388). El proceso se ejecuto en 2x H100 de 80 GB, con el paso `scale_kd` (300 rondas) tomando 53 minutos. Una reconstruccion de los pesos no es bit-identica al checkpoint publicado: la KL medida es 0,00701 en la reconstruccion frente a 0,00704 en este checkpoint, una diferencia del -0,4%.

## Capacidades

- Generacion de texto y razonamiento general, con evaluacion en MMLU-Pro, GPQA-Diamond e IFBench.
- Razonamiento matematico, evaluado en AIME 2025 y HMMT Feb 2026.
- Generacion de codigo, evaluada en LiveCodeBench.
- Modelo no-thinking: las evaluaciones se realizaron con el marcador de thinking desactivado.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Despliegue de asistencia a programadores en produccion: el modelo puede servir sugerencias y generacion de codigo en un servidor con vLLM, aprovechando su tamano reducido de 17,8 GB para liberar VRAM frente al BF16 de 61,1 GB.
- Evaluacion de calidad de codigo en pipelines de CI: al mantener el 99,5% de la precision del BF16 segun el autor, puede sustituir al modelo original en tareas de revision automatica donde el coste de GPU es limitado.
- Razonamiento matematico asistido: con resultados de 27,1 en AIME 2025 y 18,2 en HMMT Feb 2026, es adecuado para tutoria o verificacion de problemas matematicos en entornos con presupuesto de hardware ajustado.
- Investigacion en cuantizacion: el recetario reproducible y los datos de calibracion publicados en `qda-lab/qda-recipe-inputs` permiten reproducir y estudiar el efecto de la cuantizacion W4A16 sobre un MoE de 30B.
- Despliegue en GPUs de gama profesional: el autor indica compatibilidad con NVIDIA H100, A100, RTX Pro 6000 y B200, lo que permite servir el modelo en estaciones de trabajo con una sola GPU de 24-48 GB.
- Sustitucion de modelos BF16 en entornos con restricciones de memoria: la reduccion de 3,4x en el peso del checkpoint facilita alojar el modelo junto a otros servicios en el mismo nodo.
- Benchmarking comparativo de tecnicas de cuantizacion: la model card incluye comparacion directa con cyankiwi AWQ-4bit (18,1 GB), util para evaluar metodos de cuantizacion alternativos.

## Benchmarks y rendimiento

Resultados publicados en la model card. Pass@1 promediado sobre 1-32 semillas, modelo no-thinking, mismas condiciones para todos los modelos.

| Benchmark | BF16 (61,1 GB) | QDA W4A16 (17,8 GB) | cyankiwi AWQ-4bit (18,1 GB) |
|---|---|---|---|
| AIME 2025 | 25,8 | 27,1 | 25,1 |
| HMMT Feb 2026 | 19,8 | 18,2 | 17,5 |
| GPQA-Diamond | 52,5 | 53,3 | 51,9 |
| IFBench | 34,6 | 34,3 | 32,3 |
| MMLU-Pro | 70,9 | 70,2 | 69,6 |
| LiveCodeBench | 38,4 | 37,8 | 37,6 |
| Media | 40,3 | 40,1 | 39,0 |

Configuracion de evaluacion: temperatura 0,7, top-p 0,8, top-k 20, min-p 0, presence penalty 0, repetition penalty 1,05; thinking desactivado; sin MTP ni decodificacion especulativa. Max new tokens por item: 81.920 en AIME 2025, HMMT Feb 2026, GPQA-Diamond, IFBench y LiveCodeBench; 32.768 en MMLU-Pro. Repeticiones: 32 semillas en AIME 2025 y HMMT Feb 2026, 16 en GPQA-Diamond e IFBench, 1 en MMLU-Pro, 4 en LiveCodeBench.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 17,8 GB en disco; en vLLM se recomienda reservar VRAM adicional para cache KV y overhead, aunque la cifra exacta no esta disponible.
- GPUs validadas por el autor: NVIDIA H100, A100, RTX Pro 6000 y B200.
- Cabe en GPU de consumo: no confirmado; el autor no menciona RTX 4090 ni otras GPUs consumer. Con 17,8 GB de pesos, una GPU de 24 GB podria alojarlo en teoria, pero no hay validacion publicada.
- Opciones de despliegue: vLLM (comando `VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3-Coder-30B-A3B-W4A16`) y transformers. No se mencionan llama.cpp, Ollama ni TGI.
- Nota de entorno: en H100 y H200 sin CUDA 13, la compilacion del kernel al arrancar falla (`failed to open libnvrtc-builtins.so.13.0`); hay que anadir las librerias NVIDIA del venv a `LD_LIBRARY_PATH`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmark | Licencia | Formato |
|---|---|---|---|---|---|
| QDA-Qwen3-Coder-30B-A3B-W4A16 | 30,53B totales | no disponible | 40,1 | Apache-2.0 | safetensors W4A16 |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (BF16) | 30,53B totales | no disponible | 40,3 | Apache-2.0 | safetensors BF16 |
| cyankiwi AWQ-4bit | no disponible | no disponible | 39,0 | no disponible | safetensors AWQ 4-bit |

## Limitaciones y advertencias

- La cuantizacion introduce una perdida de calidad medida de 0,2 puntos de media en los seis benchmarks publicados (40,1 frente a 40,3); en HMMT Feb 2026 la caida es mayor (18,2 frente a 19,8).
- Los resultados de benchmarks se obtuvieron con thinking desactivado; el comportamiento con thinking activado no esta documentado.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas especificas de esta cuantizacion.
- La longitud de contexto no se especifica en la informacion disponible; conviene consultar la model card del modelo base.
- El despliegue en vLLM requiere desactivar `MacheteLinearKernel` y, en H100/H200 sin CUDA 13, ajustar `LD_LIBRARY_PATH`, lo que anade complejidad operativa.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3-Coder-30B-A3B-Instruct.
- La reconstruccion de los pesos no es bit-identica al checkpoint publicado; diferencias de KL de -0,4% entre reconstruccion y checkpoint.
- No hay validacion publicada en GPUs de consumo (RTX 4090, etc.); el soporte se limita a las GPUs indicadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3-Coder-30B-A3B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Paper: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Datos de recetario y calibracion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Recetario YAML: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3-Coder-30B-A3B-W4A16/qwen3-coder-30b-a3b-w4a16.yaml
