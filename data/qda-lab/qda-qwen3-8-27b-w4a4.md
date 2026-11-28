# qda-lab/QDA-Qwen3.8-27B-W4A4

## Resumen

QDA-Qwen3.8-27B-W4A4 es una cuantizacion NVFP4 (4 bits en pesos y 4 bits en activaciones, con algunas capas en FP8) del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por qda-lab. Su objetivo es reducir el coste de inferencia del modelo base en GPUs NVIDIA Blackwell manteniendo practicamente intacta la precision: el checkpoint ocupa 21,9 GB frente a los 55,6 GB en BF16, es decir, un 2,5 veces mas pequeno, y conserva el 99,4 % de la precision del original segun la evaluacion del autor.

El modelo base Qwen3.8-27B es un transformer multimodal de tipo image-text-to-text con atencion hibrida: combina capas de atencion completa con capas de atencion lineal basadas en Gated DeltaNet. El checkpoint cuantizado mantiene el pipeline completo (incluida la torre de vision en BF16) y esta pensado para servirse con vLLM sobre hardware Blackwell como B200, GB300 o RTX PRO 6000.

La relevancia actual reside en que demuestra que una cuantizacion W4A4 con receta mixta NVFP4/FP8, seleccionada mediante busqueda automatizada (QDA), puede igualar o superar ligeramente al BF16 en varias pruebas de razonamiento matematico y mantener el rendimiento en codigo, conocimiento e instrucciones, con la mitad del espacio y con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal hibrido (atencion completa + atencion lineal Gated DeltaNet), base Qwen3.8-27B |
| Parametros totales | 18.553.959.152 (18,55 mil millones, segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos E2M1, escala E4M3 por cada 16 entradas, escala tensorial FP32; activaciones cuantizadas en tiempo de ejecucion) + FP8 W8A8 en capas seleccionadas; embeddings, torre de vision y proyecciones `in_proj_a`/`in_proj_b` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors; libreria transformers, servible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con atencion hibrida: 16 capas de atencion completa y el resto de atencion lineal basada en Gated DeltaNet. La cuantizacion no altera la topologia, sino la precision numerica de cada bloque. Las MLP se almacenan en NVFP4: pesos E2M1 con una escala E4M3 por cada 16 entradas y una escala tensorial FP32, con activaciones cuantizadas del mismo modo en tiempo de ejecucion. Las proyecciones de autoatencion de las 16 capas de atencion completa, todos los `out_proj` de atencion lineal, los `in_proj_qkv`/`in_proj_z` de las capas 0 a 41 y el `lm_head` se mantienen en FP8 W8A8 (pesos por canal, activaciones dinamicas por token). Las capas 42 en adelante conservan `in_proj` en NVFP4. Los embeddings, la torre de vision y las proyecciones `in_proj_a`/`in_proj_b` del Gated DeltaNet permanecen en BF16.

Los pesos se cuantizaron con GPTQ y la receta concreta (que capas van en FP4, FP8 o BF16) se eligio mediante la busqueda automatizada de QDA bajo un presupuesto de tamano igual al del checkpoint NVFP4 de NVIDIA. El proceso esta documentado en el paper "QDA: Closed-Loop LLM Quantization Design with Agents" (arXiv:2611.23388). La reconstruccion desde la receta publicada es reproducible: en una GB300, un rebuild byte a byte identico tarda unos 23 minutos. No se detallan en la informacion disponible los datos de entrenamiento originales del modelo base (numero de tokens, composicion del dataset, si hubo RLHF/DPO).

## Capacidades

- Generacion de texto y razonamiento en modo thinking (la evaluacion usa explicitamente thinking mode con pass@1 promediado sobre multiples muestras).
- Razonamiento matematico de competicion: resultados altos en AIME 2025, HMMT Feb 2026, AIME 2026, HMMT Nov 2025 y HMMT Feb 2025.
- Razonamiento cientifico de nivel graduado (GPQA-Diamond).
- Generacion de codigo (LiveCodeBench).
- Seguimiento de instrucciones (IFBench) y conocimiento general (MMLU-Pro).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision en BF16.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico y cientifico asistido: el modelo mantiene el 99,4 % de la precision BF16 en pruebas como AIME y GPQA-Diamond, por lo que sirve para tutoria, verificacion de demostraciones o generacion de problemas resueltos con cadenas de razonamiento largas (hasta 81.920 tokens de salida en la evaluacion).
- Generacion y revision de codigo: con 85,2 en LiveCodeBench en la variante cuantizada, es adecuado para autocompletado, generacion de tests y revision de parches dentro de pipelines de CI/CD, siempre que el backend sea vLLM sobre Blackwell.
- Analisis de documentos con imagen: al conservar la torre de vision en BF16 y el pipeline image-text-to-text, puede extraer informacion de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- Despliegue de asistentes conversacionales de alta calidad: el checkpoint de 21,9 GB cabe en una sola GPU Blackwell, lo que permite servir un modelo de 18,55 mil millones de parametros con calidad cercana a BF16 en una unica tarjeta.
- Evaluacion y comparacion de tecnicas de cuantizacion: la receta es reproducible byte a byte con QDA 0.1.0, lo que lo convierte en una referencia util para investigacion sobre cuantizacion W4A4 y NVFP4.
- Fine-tuning o adaptacion ligera sobre hardware limitado: al ocupar menos de la mitad que el BF16, deja mas margen de VRAM para adaptadores o para lotes mayores en entornos con B200, GB300 o RTX PRO 6000.
- Investigacion en atencion lineal: al mantener intacta la arquitectura hibrida Gated DeltaNet, sirve para estudiar el comportamiento de este tipo de atencion bajo cuantizacion agresiva.

## Benchmarks y rendimiento

Resultados publicados por el autor (thinking mode, pass@1 promediado sobre las muestras; temperatura 1.0, top-p 0.95, top-k 20):

| Benchmark | Problemas x muestras | BF16 (55,6 GB) | QDA W4A4 (21,9 GB) | NVIDIA NVFP4 (21,9 GB) | RedHatAI NVFP4 (24,7 GB) | unsloth NVFP4 (23,4 GB) |
|---|---:|---:|---:|---:|---:|---:|
| AIME 2025 | 30 x 32 | 88,4 | 87,1 | 91,1 | 87,1 | 88,9 |
| HMMT Feb 2026 | 33 x 32 | 72,6 | 73,4 | 74,9 | 76,8 | 72,5 |
| GPQA-Diamond | 198 x 16 | 82,4 | 80,8 | 81,1 | 80,2 | 81,7 |
| IFBench | 300 x 16 | 67,0 | 68,0 | 68,6 | 67,6 | 68,7 |
| MMLU-Pro | 12.032 x 1 | 83,6 | 83,1 | 83,4 | 83,2 | 83,2 |
| LiveCodeBench | 454 x 4 | 86,7 | 85,2 | 85,8 | 87,3 | 85,5 |
| **Media** | | **80,1** | **79,6** | **80,8** | **80,4** | **80,1** |

Conjuntos matematicos adicionales de MathArena:

| | AIME 2025 | HMMT Feb 2026 | AIME 2026 | HMMT Nov 2025 | HMMT Feb 2025 | 153 problemas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 88,4 | 72,6 | 87,9 | 79,2 | 78,0 | 81,1 |
| QDA W4A4 | 87,1 | 73,4 | 89,2 | 79,9 | 82,7 | 82,3 |
| NVIDIA | 91,1 | 74,9 | 89,3 | 77,9 | 80,9 | 82,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21,9 GB solo para los pesos; hay que anadir el espacio de cache KV y el margen de ejecucion, por lo que en la practica se recomienda una GPU con 24 GB o mas.
- GPUs recomendadas: NVIDIA Blackwell con soporte nativo de FP4, es decir, B200, GB300 y RTX PRO 6000. La evaluacion se realizo con vLLM 0.33.0 sobre GB300.
- GPUs consumer: no se confirma compatibilidad con GPUs consumer en la informacion disponible; el formato NVFP4 requiere hardware Blackwell para ejecutarse de forma nativa.
- Opciones de despliegue: vLLM (`vllm serve qda-lab/QDA-Qwen3.8-27B-W4A4`), con soporte de `compressed-tensors`. La libreria declarada es transformers. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Reconstruccion: QDA 0.1.0 sobre Linux con una GPU Blackwell; un rebuild completo tarda unos 23 minutos en una GB300.

## Comparativa con modelos similares

| Modelo | Tamano | Precision | Media de benchmarks | Licencia |
|---|---:|---|---:|---|
| QDA-Qwen3.8-27B-W4A4 | 21,9 GB | NVFP4 W4A4 + FP8 selectivo | 79,6 | Apache-2.0 |
| NVIDIA NVFP4 (Qwen3.8-27B) | 21,9 GB | NVFP4 | 80,8 | no disponible |
| RedHatAI NVFP4 (Qwen3.8-27B) | 24,7 GB | NVFP4 | 80,4 | no disponible |
| unsloth NVFP4 (Qwen3.8-27B) | 23,4 GB | NVFP4 | 80,1 | no disponible |
| Qwen3.8-27B BF16 (base) | 55,6 GB | BF16 | 80,1 | Apache-2.0 |

Todas las variantes comparten el mismo modelo base (Qwen3.8-27B, 18,55 mil millones de parametros) y la misma bateria de evaluacion; las diferencias de media son de decimas. La comparativa con modelos de otros fabricantes o tamanos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: el formato NVFP4 solo se ejecuta de forma nativa en GPUs NVIDIA Blackwell; en otras arquitecturas el checkpoint no es utilizable directamente.
- Precision ligeramente inferior al BF16 en algunas tareas: la media cae de 80,1 a 79,6 y LiveCodeBench baja de 86,7 a 85,2, aunque en matematicas mejora en varios conjuntos.
- Riesgo de alucinacion: no se documenta en la model card; como en cualquier LLM, persiste el riesgo, especialmente en tareas de conocimiento factual.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la informacion disponible.
- Tool calling y agentes: no se confirma su soporte en la informacion proporcionada.
- Reproducibilidad: la reconstruccion byte a byte requiere QDA 0.1.0, Linux, una GPU Blackwell y la revision exacta del modelo base (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`).
- Licencia: Apache-2.0, igual que el modelo base, lo que permite uso comercial, pero conviene verificar las condiciones del modelo original Qwen3.8-27B.
- Madurez: el repositorio es reciente (creado en noviembre de 2026), con 180 descargas y 0 likes, por lo que la validacion de terceros es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Dataset de entradas de la receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Documentacion de uv: https://docs.astral.sh/uv/
