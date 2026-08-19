# davidnichols-ops/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-fork

## Resumen

NVIDIA Nemotron-3-Nano-30B-A3B-BF16 es un modelo de lenguaje de gran tamaño (LLM) desarrollado por NVIDIA, diseñado como un modelo unificado para tareas de razonamiento y no razonamiento. Emplea una arquitectura híbrida de mezcla de expertos (MoE) que combina capas Mamba-2, MoE y atención, con 30 mil millones de parámetros totales y 3.500 millones activos por token. El modelo genera primero una traza de razonamiento y después la respuesta final, aunque esta conducta se puede configurar mediante un flag en la plantilla de chat.

Este modelo destaca por su eficiencia en razonamiento matemático y agente, superando a alternativas como Qwen3-30B-A3B-Thinking-2507 en varios benchmarks, y por estar listo para uso comercial bajo la licencia NVIDIA Nemotron Open Model License. Soporta seis idiomas: inglés, alemán, español, francés, italiano y japonés. El repositorio en HuggingFace es un fork de davidnichols-ops con pesos en BF16 y un tamaño de 63,2 GB.

La relevancia actual de este modelo radica en su arquitectura híbrida que combina Mamba-2 y MoE para reducir el coste de inferencia manteniendo una alta precisión, y en su entrenamiento con datos de razonamiento y agentes de NVIDIA, lo que lo posiciona como una opción competitiva para aplicaciones de producción que requieren razonamiento complejo y uso de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MoE: 23 capas Mamba-2/MoE + 6 capas de atención. Cada capa MoE tiene 128 expertos + 1 compartido, 6 activos por token |
| Parametros totales | 31.577.937.344 (según safetensors) |
| Parametros activos | 3.500 millones (3,5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original en el repositorio) |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que integra 23 capas de Mamba-2 y MoE junto con 6 capas de atención tradicional. Cada capa MoE contiene 128 expertos más un experto compartido, activando 6 expertos por token. Esta combinación busca reducir el coste computacional de la atención al tiempo que mantiene la capacidad de razonamiento profundo. El modelo fue entrenado desde cero por NVIDIA, con datos de pre-entrenamiento que incluyen conjuntos como Nemotron-CC-v2, Nemotron-Pretraining-Code-v1/v2 y Nemotron-Pretraining-Specialized-v1, entre otros. Para el post-entrenamiento se utilizaron datasets de razonamiento, matemáticas, código y agentes, incluyendo un blend de entrenamiento con refuerzo (Nemotron-3-Nano-RL-Training-Blend). La fecha de corte de los datos de post-entrenamiento es el 28 de noviembre de 2025, y la de pre-entrenamiento el 25 de junio de 2025. La model card menciona que el modelo fue "mejorado usando Qwen", aunque no se detalla el método exacto.

## Capacidades

- Generación de texto y razonamiento: produce trazas de razonamiento antes de la respuesta final; se puede desactivar mediante flag en el chat template, aunque con una ligera pérdida de precisión en tareas complejas.
- Razonamiento matemático: destaca en benchmarks como AIME25, MiniF2F y GPQA, especialmente cuando se permite el uso de herramientas.
- Generación de código: evaluado en LiveCodeBench y SciCode, con resultados competitivos.
- Tool calling / function calling: soporta el uso de herramientas externas, evidenciado en los benchmarks "with tools" (AIME25 con tools alcanza 99,2).
- Capacidades agénticas: evaluado en Terminal Bench (subconjunto hard), con puntuación de 8,5, superando a Qwen3-30B-A3B-Thinking-2507 y GPT-OSS-20B.
- Multilingüe: soporta inglés, alemán, español, francés, italiano y japonés.

## Casos de uso

- Asistentes de razonamiento avanzado: el modelo puede resolver problemas complejos de lógica y matemáticas generando trazas de razonamiento, útil en entornos educativos o de investigación donde se requiere explicar el proceso de solución.
- Agentes autónomos con uso de herramientas: gracias a su soporte de tool calling y su buen rendimiento en Terminal Bench, puede integrarse en sistemas agénticos que ejecutan comandos, consultan APIs o interactúan con entornos externos.
- Generación de código en producción: con una puntuación de 68,3 en LiveCodeBench, puede asistir en la escritura de código, revisión y refactorización en pipelines de desarrollo, aunque se recomienda supervisión humana.
- Atención al cliente multilingüe: al soportar seis idiomas, puede gestionar conversaciones en inglés, español, francés, alemán, italiano y japonés, aunque la longitud de contexto no está especificada, por lo que habría que validar su comportamiento en diálogos largos.
- Resolución de problemas matemáticos formales: con resultados destacados en MiniF2F (50,0 pass@1 y 79,9 pass@32), puede utilizarse para asistencia en demostraciones matemáticas y verificación formal.
- Investigación en razonamiento agéntico: su arquitectura híbrida y su rendimiento en benchmarks como HLE y GPQA lo convierten en un candidato para experimentos académicos sobre razonamiento con y sin herramientas.

## Benchmarks y rendimiento

La model card proporciona la siguiente tabla de evaluaciones comparativas:

| Tarea | NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | Qwen3-30B-A3B-Thinking-2507 | GPT-OSS-20B |
| ----- | :---- | :---- | :---- |
| **Conocimiento general** |  |  |  |
| MMLU-Pro | 78.3 | **80.9** | 75.0 |
| **Razonamiento** |  |  |  |
| AIME25 (sin herramientas) | 89.1 | 85.0 | **91.7** |
| AIME25 (con herramientas) | **99.2** | - | 98.7 |
| GPQA (sin herramientas) | 73.0 | **73.4** | 71.5 |
| GPQA (con herramientas) | **75.0** | - | 74.2 |
| LiveCodeBench (v6 2025-08–2025-05) | **68.3** | 66.0 | 61.0 |
| SciCode (subtask) | 33.3 | 33.0 | **34.0** |
| HLE (sin herramientas) | 10.6 | 9.8 | **10.9** |
| HLE (con herramientas) | 15.5 | - | **17.3** |
| MiniF2F pass@1 | **50.0** | 5.7 | 12.1 |
| MiniF2F pass@32 | **79.9** | 16.8 | 43.0 |
| **Agente** |  |  |  |
| Terminal Bench (subconjunto hard) | 8.5 | 5.0 | 6.0 |

## Requisitos de hardware

- El repositorio pesa 63,2 GB en BF16, lo que equivale a aproximadamente 63 GB de VRAM solo para los pesos del modelo en esa precisión.
- Para inferencia en BF16 se necesita al menos una GPU con 80 GB de VRAM (por ejemplo, A100 80GB o H100) o múltiples GPUs con memoria distribuida.
- No se proporcionan datos oficiales sobre requisitos de hardware, latencia o throughput.
- Con cuantizaciones de menor precisión (por ejemplo, 8 bits o 4 bits) el modelo podría caber en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090, pero no hay versiones oficiales publicadas en el repositorio.
- Opciones de despliegue habituales para este tipo de modelos: vLLM, TensorRT-LLM (recomendado por NVIDIA), llama.cpp para cuantizaciones GGUF, o TGI. No se confirma compatibilidad específica en la documentación disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | MMLU-Pro | AIME25 (sin tools) | LiveCodeBench |
|--------|--------------------|--------------------|----------|----------|----------|---------------------|---------------|
| NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 30B (31,58B según safetensors) | 3,5B | no disponible | NVIDIA Open Model | 78.3 | 89.1 | 68.3 |
| Qwen3-30B-A3B-Thinking-2507 | 30B | 3B | no disponible | Apache 2.0 (Qwen) | 80.9 | 85.0 | 66.0 |
| GPT-OSS-20B | 20B | no disponible | no disponible | OpenAI (MIT para pesos) | 75.0 | 91.7 | 61.0 |

El modelo de NVIDIA supera a sus competidores en AIME25 con herramientas, LiveCodeBench, MiniF2F y Terminal Bench, mientras que Qwen3-30B-A3B-Thinking-2507 lidera en MMLU-Pro y GPQA sin herramientas. GPT-OSS-20B es superior en AIME25 sin herramientas y SciCode.

## Limitaciones y advertencias

- No se documentan sesgos específicos en la model card; sin embargo, al ser un modelo entrenado con datos web y de código, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación: como todo LLM, puede generar información incorrecta o inventada, especialmente en tareas sin herramientas donde la verificación externa no está disponible.
- Longitud de contexto no especificada: no se indica el tamaño máximo de la ventana de contexto, lo que dificulta planificar su uso en conversaciones largas o documentos extensos.
- Licencia NVIDIA Nemotron Open Model License: permite uso comercial, pero incluye términos específicos que deben revisarse antes de su despliegue en producción.
- El repositorio es un fork no oficial de davidnichols-ops; se recomienda utilizar el repositorio original de NVIDIA para entornos de producción.
- El modelo genera trazas de razonamiento por defecto, lo que puede aumentar la latencia y el coste de inferencia; se puede desactivar pero con una posible pérdida de precisión en tareas complejas.

## Enlaces

- Repositorio HuggingFace (fork): https://huggingface.co/davidnichols-ops/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-fork
- Paper principal: https://arxiv.org/abs/2512.20848
- Paper adicional (posiblemente sobre post-entrenamiento): https://arxiv.org/abs/2512.20856
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Colección de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Colección de datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
