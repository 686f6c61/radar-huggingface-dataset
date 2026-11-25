# qda-lab/QDA-Gemma-4-26B-A4B-W4A16

## Resumen

QDA-Gemma-4-26B-A4B-W4A16 es una cuantización de pesos a 4 bits del modelo multimodal google/gemma-4-26B-A4B-it, desarrollada por qda-lab mediante su herramienta QDA (Closed-Loop LLM Quantization Design with Agents). El objetivo es reducir el coste de despliegue del modelo base manteniendo prácticamente intacta su precisión: el checkpoint pasa de 51,6 GB en BF16 a 16,7 GB, una reducción de 3,1 veces, conservando según el autor el 99,0 % de la precisión del original.

El modelo base es un transformer con mezcla de expertos (MoE) de tipo Gemma 4, con 26B parámetros totales y 4B activos por token, orientado a tareas de imagen-texto-a-texto (image-text-to-text) y con modo de razonamiento (thinking mode). Esta versión cuantizada mantiene la torre de visión y los routers del MoE en BF16, cuantiza los expertos enrutados a INT4 con GPTQ y el resto de capas lineales a 8 bits.

Es relevante porque demuestra que una receta de cuantización asistida por agentes puede igualar o superar ligeramente al BF16 en algunos benchmarks (AIME 2025, MMLU-Pro) mientras reduce a un tercio el peso en disco y permite servir el modelo en una sola GPU H100 o A100 con vLLM. El repo tiene 285 descargas y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (vision + texto), derivada de Gemma 4 |
| Parametros totales | 26B (nominal del modelo base); 14.386.943.566 tensores reales en safetensors del checkpoint cuantizado |
| Parametros activos | 4B (nominal del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: expertos enrutados INT4 en grupos de 64 con GPTQ; resto de capas lineales 8 bits; routers MoE y torre de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (Gemma 4 license) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base google/gemma-4-26B-A4B-it: un transformer con mezcla de expertos de 26B parámetros totales y 4B activos, con capacidad multimodal de imagen y texto y modo de razonamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original dentro de la información proporcionada.

La innovación de esta ficha es el proceso de cuantización. QDA aplica una receta elegida mediante búsqueda automatizada: los expertos enrutados se cuantizan a INT4 en grupos de 64 con GPTQ, el resto de capas lineales a 8 bits, y se preservan en BF16 tanto los routers del MoE como la torre de visión. El proceso se ejecutó en una sola H100 de 80 GB y es reproducible con QDA 0.1.0 a partir del dataset qda-lab/qda-recipe-inputs y la receta gemma-4-26b-a4b-w4a16.yaml. Los pesos reconstruidos no son idénticos bit a bit a este checkpoint.

## Capacidades

- Generación de texto y razonamiento con modo thinking (el razonamiento termina en el token `<channel|>`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), incluyendo preguntas sobre imágenes.
- Resolución de problemas matemáticos y de competición (AIME 2025, HMMT Feb 2026).
- Razonamiento científico y de conocimiento experto (GPQA-Diamond, MMLU-Pro).
- Generación de código (LiveCodeBench).
- Seguimiento de instrucciones complejas (IFBench).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling y de agentes: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo mantiene un 86,6 en AIME 2025 en modo thinking, por lo que puede usarse para resolver problemas de competición y verificar demostraciones paso a paso con cadenas de razonamiento largas (hasta 81.920 tokens nuevos por ítem en la evaluación).
- Análisis de documentos e imágenes: al ser image-text-to-text, permite extraer información de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos, con la torre de visión intacta en BF16.
- Generación de código en pipelines: con 79,6 en LiveCodeBench, es adecuado para autocompletado, revisión y generación de tests en integración continua, siempre que se valide la salida.
- Asistencia científica y QA experto: su 79,5 en GPQA-Diamond lo hace útil para responder preguntas de nivel posgrado en física, química y biología, con revisión humana obligatoria.
- Despliegue en una sola GPU: al ocupar 16,7 GB, cabe en una H100, A100, RTX Pro 6000 o B200 y permite servir el modelo con vLLM para cargas interactivas o por lotes sin clúster multi-GPU.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para medir la pérdida de precisión de otras recetas (AWQ, ParoQuant) sobre el mismo modelo base.
- Seguimiento de instrucciones en asistentes: con 80,0 en IFBench, puede emplearse en asistentes que deban respetar formatos y restricciones estrictas de salida.

## Benchmarks y rendimiento

Resultados publicados por el autor en modo thinking, pass@1 promediado sobre semillas (1 a 32 según el benchmark):

| Benchmark | BF16 (51,6 GB) | QDA W4A16 (16,7 GB) | cyankiwi AWQ-4bit (17,2 GB) | ParoQuant (16,6 GB) |
|---|---|---|---|---|
| AIME 2025 | 85,4 | 86,6 | 79,9 | 74,3 |
| HMMT Feb 2026 | 74,5 | 72,3 | 65,8 | 59,7 |
| GPQA-Diamond | 81,1 | 79,5 | 77,3 | 76,6 |
| IFBench | 80,6 | 80,0 | 80,2 | 76,7 |
| MMLU-Pro | 83,8 | 83,9 | 82,9 | 82,6 |
| LiveCodeBench | 81,2 | 79,6 | 78,3 | 75,8 |
| Media | 81,1 | 80,3 | 77,4 | 74,3 |

Configuración de evaluación: temperature 1.0, top-p 0.95, top-k 64, min-p 0, presencia 0, repetición 1.0; sin decodificación especulativa; límite de 81.920 tokens nuevos por ítem (32.768 en MMLU-Pro).

Rendimiento en una H100 80GB con 512 tokens generados por petición (media de 2 ejecuciones): 198 tok/s con batch 1 y 2.330 tok/s con batch 16 en vLLM 0.33.0. ParoQuant obtiene 133 y 1.652 tok/s en vLLM 0.19.1 con adaptador MoE propio.

## Requisitos de hardware

- VRAM estimada: 16,7 GB de pesos; con overhead de KV cache y activaciones, se recomienda al menos 24 GB para contexto corto y 40-80 GB para lotes grandes o contextos largos.
- GPU recomendadas por el autor: NVIDIA H100, A100, RTX Pro 6000 y B200.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) para batch pequeño, aunque no está confirmado por el autor; no se garantiza en GPUs de 16 GB o menos.
- Despliegue: vLLM (recomendado, con `VLLM_DISABLED_KERNELS=MacheteLinearKernel`), transformers con compressed-tensors. No se menciona soporte de llama.cpp, Ollama ni TGI.
- En H100/H200 sin CUDA 13 hay que añadir las librerías NVIDIA del entorno virtual a `LD_LIBRARY_PATH` para evitar el fallo `libnvrtc-builtins.so.13.0`.
- Latencia y throughput: 198 tok/s a batch 1 y 2.330 tok/s a batch 16 en H100 80GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks | Licencia | Tamano |
|---|---|---|---|---|---|
| QDA-Gemma-4-26B-A4B-W4A16 | 26B (4B activos) | no disponible | 80,3 | Apache-2.0 | 16,7 GB |
| Gemma 4 26B-A4B BF16 (base) | 26B (4B activos) | no disponible | 81,1 | Apache-2.0 | 51,6 GB |
| cyankiwi AWQ-4bit | 26B (4B activos) | no disponible | 77,4 | no disponible | 17,2 GB |
| ParoQuant | 26B (4B activos) | no disponible | 74,3 | no disponible | 16,6 GB |

## Limitaciones y advertencias

- La cuantización introduce una pérdida media de 0,8 puntos frente a BF16 (80,3 frente a 81,1); las mayores caídas se dan en HMMT (2,2 puntos) y LiveCodeBench (1,6 puntos).
- Los pesos reconstruidos con la receta no son idénticos bit a bit al checkpoint publicado.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base en la documentación proporcionada.
- El soporte de tool calling y de agentes no está documentado en esta ficha; conviene verificarlo antes de usarlo en producción.
- Requiere vLLM con el flag `VLLM_DISABLED_KERNELS=MacheteLinearKernel` y, en H100/H200 sin CUDA 13, ajustes de `LD_LIBRARY_PATH`; la configuración es sensible al entorno.
- La licencia Apache-2.0 remite a la Gemma 4 license de Google; conviene revisar sus términos para uso comercial.
- Solo se han validado GPUs de datacenter (H100, A100, RTX Pro 6000, B200); el rendimiento en GPUs de consumo no está documentado.
- El modo thinking consume hasta 81.920 tokens nuevos por ítem en la evaluación, lo que encarece y alarga las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Gemma-4-26B-A4B-W4A16
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Dataset de receta e inputs: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Receta de cuantización: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Gemma-4-26B-A4B-W4A16/gemma-4-26b-a4b-w4a16.yaml
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
