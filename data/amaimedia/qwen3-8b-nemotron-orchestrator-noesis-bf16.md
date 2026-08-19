# AMAImedia/Qwen3-8B-Nemotron-Orchestrator-NOESIS-BF16

## Resumen

El modelo `AMAImedia/Qwen3-8B-Nemotron-Orchestrator-NOESIS-BF16` es un checkpoint de referencia en precisión BF16 del modelo `nvidia/Nemotron-Orchestrator-8B`, desarrollado por NVIDIA y la Universidad de Hong Kong bajo el nombre ToolOrchestra. Este checkpoint ha sido publicado por AMAImedia como parte de la plataforma NOESIS de doblaje profesional multilingüe, aunque el modelo en sí está orientado a la orquestación de herramientas y la planificación de tareas multi-paso.

El modelo subyacente es un transformer decoder-only denso basado en Qwen3-8B, con 8.190 millones de parámetros y un tamaño de vocabulario de 151.936 tokens. Al ser un casteo lossless de FP32 a BF16, mantiene exactamente los mismos pesos y comportamiento que el original, reduciendo a la mitad el espacio en disco (16 GB frente a 32 GB) y eliminando la conversión en tiempo de carga. Está pensado para la comunidad de investigación y desarrollo, con licencia NVIDIA Open Model License que restringe su uso a fines no comerciales.

La relevancia de este lanzamiento radica en que ofrece una base limpia y reproducible para flujos de cuantización posteriores (como AWQ INT4) y para la destilación de conocimiento en especialistas más pequeños, como el M9-ORCH-4B de NOESIS. Su foco en tool calling y razonamiento multi-paso lo hace útil para construir agentes y pipelines de automatización, aunque solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (release hermano en AWQ INT4 disponible) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-open-model-license (uso en investigación y desarrollo únicamente) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint BF16 derivado de `nvidia/Nemotron-Orchestrator-8B`, que a su vez se basa en la arquitectura Qwen3-8B: un transformer decoder-only denso (sin mezcla de expertos) con atención causal estándar. El proceso de creación consistió en un casteo directo de los pesos desde FP32 a BF16 mediante `torch.Tensor.to(dtype=torch.bfloat16)` con redondeo al más cercano (round-to-nearest-even), lo que se considera lossless para inferencia dado que BF16 comparte el mismo rango de exponente que FP32 y conserva 7 bits de mantisa.

No se realizó ningún entrenamiento adicional ni ajuste fino sobre el modelo base. El modelo original fue desarrollado por NVIDIA y la Universidad de Hong Kong bajo el nombre ToolOrchestra, especializado en orquestación eficiente de modelos y herramientas. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO en la información disponible. El checkpoint BF16 sirve como artefacto fuente para cuantizaciones posteriores (AWQ INT4) y para destilación de conocimiento en el ecosistema NOESIS.

## Capacidades

- Generación de texto en inglés con razonamiento multi-paso y planificación de tareas complejas.
- Soporte de tool calling y orquestación de herramientas, permitiendo al modelo decidir qué herramienta invocar y en qué orden.
- Capacidad de planificar tareas compuestas, como buscar artículos recientes, resumirlos y extraer conclusiones.
- Integración nativa con el ecosistema HuggingFace Transformers, vLLM y SGLang para despliegue en producción.
- No se han documentado capacidades multimodales (visión, audio) ni soporte de lenguajes distintos del inglés.

## Casos de uso

- Orquestación de agentes en pipelines de automatización: el modelo puede gestionar flujos donde intervienen múltiples herramientas (búsqueda web, APIs, bases de datos) coordinando el orden de ejecución y la combinación de resultados.
- Asistentes de investigación automatizados: planifica tareas como "buscar papers recientes sobre un tema, resumir los tres más relevantes y generar un informe", encadenando llamadas a herramientas de búsqueda y resumen.
- Generación de código con integración de herramientas: aunque no se confirma explícitamente, al estar basado en Qwen3-8B podría usarse para tareas de programación asistida, combinando generación de código con ejecución de comandos o consultas a repositorios.
- Automatización de flujos de trabajo empresariales: el modelo puede actuar como un "cerebro" que decide qué APIs o servicios invocar para completar una tarea administrativa (crear tickets, enviar correos, actualizar registros).
- Destilación de conocimiento: sirve como modelo profesor para entrenar especialistas más pequeños (por ejemplo, el M9-ORCH-4B de NOESIS) mediante técnicas de destilación, aprovechando su salida como ground truth.
- Benchmarking y evaluación de cuantización: al ser un checkpoint BF16 limpio, es adecuado para medir el impacto de diferentes esquemas de cuantización (AWQ, GPTQ, GGUF) en la calidad de las respuestas y en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~17 GB en BF16 (según la model card), lo que requiere una GPU con al menos 24 GB de memoria para residir completamente.
- GPU recomendadas: tarjetas con 24 GB o más, como NVIDIA RTX 4090, A100, H100 o L40S. Para GPUs de 6-12 GB se recomienda el release hermano en AWQ INT4.
- Opciones de despliegue: HuggingFace Transformers, vLLM, SGLang, llama.cpp (conversión BF16) y TGI (text-generation-inference).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos comparativos con otros modelos de orquestación o de tamaño similar en la información disponible.

## Limitaciones y advertencias

- Licencia restringida: la NVIDIA Open Model License limita el uso a fines de investigación y desarrollo; no está permitido su uso comercial sin autorización explícita.
- Soporte de idiomas limitado a inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de fiabilidad.
- Al ser un checkpoint derivado sin entrenamiento adicional, hereda todas las limitaciones y sesgos del modelo base Qwen3-8B, aunque no se han documentado sesgos concretos.
- No se especifica la longitud de contexto máxima soportada, lo que puede afectar a tareas que requieran ventanas largas.
- El modelo no es multimodal; no procesa imágenes, audio ni video.

## Enlaces

- [HuggingFace - AMAImedia/Qwen3-8B-Nemotron-Orchestrator-NOESIS-BF16](https://huggingface.co/AMAImedia/Qwen3-8B-Nemotron-Orchestrator-NOESIS-BF16)
- [Modelo base - nvidia/Nemotron-Orchestrator-8B](https://huggingface.co/nvidia/Nemotron-Orchestrator-8B)
- [Release AWQ INT4 hermano - amaimedia/Nemotron-Orchestrator-8B-Qwen3-AWQ-INT4-NOESIS](https://huggingface.co/amaimedia/Nemotron-Orchestrator-8B-Qwen3-AWQ-INT4-NOESIS)
- [Paper ToolOrchestra - arXiv:2511.21689](https://arxiv.org/abs/2511.21689)
- [Sitio NOESIS - AMAImedia](https://www.amaimedia.com)
