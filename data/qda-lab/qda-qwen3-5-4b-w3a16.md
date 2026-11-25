# qda-lab/QDA-Qwen3.5-4B-W3A16

## Resumen

QDA-Qwen3.5-4B-W3A16 es una versión cuantizada a 3 bits de los pesos del modelo multimodal Qwen/Qwen3.5-4B, publicada por el laboratorio qda-lab. El modelo conserva la arquitectura y el pipeline original de Qwen3.5 (image-text-to-text), pero reduce el peso de los pesos de 9,3 GB en BF16 a 3,7 GB, un factor de compresión de aproximadamente 2,5×, manteniendo según el autor el 86,1 % de la precisión del modelo original.

La relevancia de esta ficha radica en que se trata de una cuantización W3A16 (pesos de 3 bits, activaciones de 16 bits) generada mediante GPTQ con grupos de 128 elementos, donde algunas capas MLP y de atención se mantienen a 4 bits. La receta de cuantización no es manual: fue seleccionada por un sistema automatizado de búsqueda de QDA, descrito en el artículo "QDA: Closed-Loop LLM Quantization Design with Agents" (arXiv:2611.23388).

El modelo tiene 4.659.865.088 parámetros totales y está pensado para despliegue en producción con vLLM sobre GPUs NVIDIA (H100, A100, L40S, RTX Pro 6000, B200 y GB300). Su licencia Apache-2.0, idéntica a la del modelo base, facilita el uso comercial. La información pública disponible no detalla la longitud de contexto, los idiomas soportados ni la composición del dataset de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-4B |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W3A16: pesos int3 en grupos de 128 (GPTQ), algunas capas MLP y de atencion en 4 bits; activaciones 16 bits; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B original, un transformer multimodal con pipeline image-text-to-text, y no introduce cambios estructurales: la intervención se limita a la cuantización de pesos. Los pesos se almacenan como enteros de 3 bits agrupados en bloques de 128, cuantizados con GPTQ, con un subconjunto de capas MLP y de atención elevadas a 4 bits. La combinación concreta de capas y precisiones fue elegida por la búsqueda automatizada de QDA, que optimiza la receta de cuantización en bucle cerrado con agentes.

El proceso de construcción se ejecutó en una única GPU H100 de 80 GB y parte de la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del modelo base. La receta, la muestra de calibración y los datos de destilación están publicados en el dataset `qda-lab/qda-recipe-inputs`, lo que permite reproducir el checkpoint con QDA 0.1.0. El autor advierte que los pesos reconstruidos no son idénticos bit a bit al checkpoint publicado. No se detalla el número de tokens de entrenamiento del modelo base ni la composición de su dataset, ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con cierre explícito del bloque de razonamiento mediante ``.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), heredado del modelo base Qwen3.5-4B.
- Razonamiento matemático de competición: evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento científico y de conocimiento general: evaluado en GPQA-Diamond y MMLU-Pro.
- Generación de código: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFBench.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Decodificación especulativa / MTP: la evaluación se realizó con MTP y decodificación especulativa desactivados; no se documenta su funcionamiento en esta cuantización.

## Casos de uso

- Razonamiento matemático asistido: el modelo mantiene 64,5 en AIME 2025 frente a 78,5 del BF16, por lo que es adecuado para entornos donde se prioriza reducir huella de memoria sobre la precisión máxima, como tutoría matemática o verificación de ejercicios con revisión humana posterior.
- Resolución de problemas científicos: con 66,6 en GPQA-Diamond, puede emplearse en asistentes de investigación que respondan preguntas de nivel posgrado en física, química y biología, siempre con validación por parte de un experto.
- Generación de código en pipelines internos: sus 49,6 en LiveCodeBench permiten usarlo para autocompletado, generación de tests o revisión de parches en herramientas de desarrollo, aceptando una tasa de acierto inferior a la del modelo completo.
- Procesamiento de documentos con imagen y texto: al conservar el pipeline image-text-to-text, puede extraer información de capturas, diagramas o formularios combinados con instrucciones textuales en flujos de digitalización.
- Clasificación y extracción de información con instrucciones complejas: sus 55,4 en IFBench lo hacen utilizable en tareas de extracción estructurada y transformación de datos donde el cumplimiento estricto del formato es importante.
- Despliegue en GPUs de gama profesional con memoria limitada: al ocupar 3,7 GB de pesos, cabe en una sola L40S o RTX Pro 6000 y permite servir varias instancias por GPU para cargas de baja latencia.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para medir la pérdida de calidad de recetas W3A16 frente a BF16 en un mismo modelo base, gracias a la publicación de la receta y los datos de calibración.

## Benchmarks y rendimiento

Resultados publicados por el autor en modo thinking, pass@1 promediado sobre 1 a 32 semillas, con temperatura 1.0, top-p 0.95, top-k 20, min-p 0, presence penalty 1.5 y repetition penalty 1.0:

| Benchmark | BF16 (9,3 GB) | QDA W3A16 (3,7 GB) |
|---|---|---|
| AIME 2025 | 78,5 | 64,5 |
| HMMT Feb 2026 | 63,6 | 51,6 |
| GPQA-Diamond | 77,5 | 66,6 |
| IFBench | 60,6 | 55,4 |
| MMLU-Pro | 77,3 | 73,3 |
| LiveCodeBench | 61,6 | 49,6 |
| Media | 69,8 | 60,2 |

Configuración de evaluación: máximo de tokens nuevos por ítem de 81.920 en AIME 2025, HMMT Feb 2026, GPQA-Diamond, IFBench y LiveCodeBench, y de 32.768 en MMLU-Pro; repeticiones de 32 semillas (17-48) en AIME 2025 y HMMT, 16 semillas (17-32) en GPQA-Diamond e IFBench, 1 semilla (17) en MMLU-Pro y 4 semillas (17-20) en LiveCodeBench. MTP y decodificación especulativa desactivados.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 3,7 GB; con overhead de activaciones y caché KV, el consumo real será superior y depende de la longitud de contexto (no documentada).
- GPUs soportadas explícitamente por el autor: NVIDIA H100, A100, L40S, RTX Pro 6000, B200 y GB300.
- Cabe en GPUs de consumo: no se confirma; el autor solo lista GPUs profesionales y de centro de datos. La compatibilidad con RTX 4090 u otras consumer no está documentada.
- Opciones de despliegue: exclusivamente vLLM. SGLang no soporta todavía este formato de 3 bits. El comando de servicio es `VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Qwen3.5-4B-W3A16`.
- Requisito de toolchain: sin CUDA 13 en la máquina, la compilación del kernel W3A16 falla al arrancar (`failed to open libnvrtc-builtins.so.13.0`); hay que añadir las librerías NVIDIA del entorno virtual a `LD_LIBRARY_PATH`.
- Latencia y throughput: en un GB300 sin el toolkit de CUDA 13 el servicio no arrancaba; con el toolkit estuvo listo en 340 s. No se publican cifras de throughput ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|
| QDA-Qwen3.5-4B-W3A16 | 4,66 B | no disponible | Apache-2.0 | safetensors int3/int4 (compressed-tensors) | vLLM |
| Qwen/Qwen3.5-4B (BF16) | 4,66 B | no disponible | Apache-2.0 | safetensors BF16 | transformers, vLLM, SGLang |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | no disponible | no disponible | según autor | no disponible | no disponible |

La única comparación con datos numéricos publicados es frente al modelo base en BF16: el W3A16 ocupa 3,7 GB frente a 9,3 GB y obtiene una media de 60,2 frente a 69,8 en el conjunto de benchmarks evaluado. No se han publicado comparaciones con otras recetas de cuantización del mismo modelo base en la información disponible.

## Limitaciones y advertencias

- Pérdida de precisión significativa: la media cae de 69,8 a 60,2, con degradaciones especialmente marcadas en LiveCodeBench (61,6 a 49,6, un 19,5 % relativo) y HMMT Feb 2026 (63,6 a 51,6, un 18,9 % relativo).
- Compatibilidad restringida: solo funciona con vLLM; SGLang no soporta el formato de 3 bits. Requiere CUDA 13 o la configuración manual de `LD_LIBRARY_PATH` para compilar el kernel.
- Soporte de hardware limitado: el autor solo garantiza GPUs NVIDIA profesionales y de centro de datos; no se documenta compatibilidad con GPUs de consumo.
- Reproducibilidad parcial: los pesos reconstruidos con la receta publicada no son idénticos bit a bit al checkpoint, lo que puede introducir variaciones en los resultados.
- Sesgos conocidos: no disponible en la información proporcionada; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento, no documentados en esta ficha.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización agresiva a 3 bits puede incrementar la probabilidad de errores en tareas de razonamiento largo.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud máxima de contexto, lo que impide garantizar su comportamiento en escenarios multilingües o de contexto largo.
- Uso comercial: permitido bajo Apache-2.0, la misma licencia que el modelo base, sin restricciones adicionales documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-4B-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Artículo QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Receta de cuantización: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.5-4B-W3A16/qwen3.5-4b-w3a16.yaml
- Datos de calibración y destilación: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.5-4B-W3A16
