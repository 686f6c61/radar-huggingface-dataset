# OpenVINO/gemma-4-12B-it-int4-ov

## Resumen

Gemma 4 12B IT es un modelo multimodal de Google (familia Gemma 4) convertido por el equipo de OpenVINO a formato Intermediate Representation (IR) con pesos comprimidos a INT4 mediante NNCF. El checkpoint usa la arquitectura `gemma4_unified`, que incorpora un embedder visual sin encoder dedicado, y está pensado para inferencia en CPU (y potencialmente GPU/NPU) con el runtime de OpenVINO. Resuelve el problema de desplegar un modelo de 12B multimodal en hardware sin GPU de altas prestaciones, reduciendo el peso del repositorio a 8 GB.

El modelo base es `google/gemma-4-12B-it`, un modelo instruido con capacidades de imagen-a-texto (pipeline `image-text-to-text`). Esta conversión conserva la licencia Apache 2.0 del original y está orientada a entornos donde no se dispone de PyTorch en producción, ya que puede ejecutarse tanto con Optimum Intel como con OpenVINO GenAI sin dependencias de Transformers en el segundo caso.

Es relevante ahora porque la familia Gemma 4 introduce la variante Unified con visión sin encoder y porque OpenVINO 2026.4 permite ejecutar modelos multimodales de este tamaño en CPU con cuantización INT4 asimétrica y AWQ. La validación del artefacto es, sin embargo, muy limitada según el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `gemma4_unified` (embedder visual sin encoder) |
| Parametros totales | 12B (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4_ASYM (group_size 64, AWQ activado, backup INT8_ASYM); no es cuantización de activaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`), comprimido con NNCF |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 4, en su variante `gemma4_unified`. Esta variante se caracteriza por un embedder visual sin encoder separado, lo que simplifica el grafo y el proceso de conversión. La conversión a OpenVINO IR se realizó con `nncf.compress_weights` en modo INT4_ASYM con group_size 64, ratio 1.0 (aplicado a capas elegibles), AWQ activado, `all_layers=False` y backup INT8_ASYM. GPTQ, estimación de escalas y corrección LoRA quedaron desactivados. Se trata de compresión de pesos, no de cuantización completa de activaciones.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en la información proporcionada; esos detalles corresponden a la model card del modelo original de Google. La innovación técnica destacable de esta conversión es la compatibilidad con OpenVINO 2026.4.1 y Transformers 5.10.2, además del soporte de la arquitectura Unified en Optimum Intel (requiere una revisión concreta de GitHub, ya que la release 2.2.0 de PyPI declara `transformers<5.6`).

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `conversational`).
- Comprensión de imágenes y respuesta texto-a-partir-de-imagen (pipeline `image-text-to-text`).
- Razonamiento y respuesta a preguntas generales (validado solo con tres prompts cortos de texto según el autor).
- Ejecución sin PyTorch mediante OpenVINO GenAI `VLMPipeline`.
- Ejecución con Optimum Intel mediante `OVModelForVisualCausalLM`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio o vídeo: no validadas según el autor.

## Casos de uso

- Inferencia multimodal en CPU sin GPU: el modelo puede procesar imágenes y texto con OpenVINO en un servidor sin acelerador dedicado, gracias a la compresión INT4 que reduce el artefacto a 8 GB y evita dependencias de PyTorch en el camino de GenAI.
- Despliegue en entornos edge o embebidos: al ejecutarse sobre el runtime de OpenVINO, encaja en dispositivos Intel con CPU, iGPU o NPU (aunque GPU/NPU no están validadas para este artefacto), útil para aplicaciones de inspección visual local.
- Asistentes conversacionales con entrada de imagen: el pipeline `image-text-to-text` permite construir un chat que recibe una imagen y responde preguntas sobre ella, con el chat template gestionado por el procesador o por GenAI.
- Prototipado rápido de aplicaciones VLM: la instalación vía `optimum-intel[openvino]` y el ejemplo de `OVModelForVisualCausalLM` permiten montar un prototipo funcional en pocas líneas sobre CPU.
- Reducción de costes de infraestructura: para cargas de trabajo de visión-lenguaje de baja concurrencia, ejecutar en CPU con INT4 puede ser más económico que mantener GPUs dedicadas, a costa de mayor latencia.
- Integración en pipelines de datos con OpenVINO GenAI: el `VLMPipeline` permite incorporar generación texto e imagen-a-texto en aplicaciones Python sin arrastrar el stack de Transformers, simplificando el empaquetado y el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la validación se limita a tres prompts cortos de texto con GenAI `VLMPipeline` en CPU, con respuestas correctas y coherentes, y que la precisión cuantitativa frente al modelo original no está validada.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 8 GB en INT4; se requiere al menos esa cantidad de memoria más overhead del runtime para cargar el modelo en CPU.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo oficial usa `device="CPU"`.
- ¿Cabe en GPU consumer? No validado; por tamaño (8 GB en INT4) podría caber en GPUs con 12 GB o más, pero el autor no confirma funcionamiento en GPU.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`), Optimum Intel (`OVModelForVisualCausalLM`), runtime OpenVINO 2026.4.1.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVINO/gemma-4-12B-it-int4-ov | 12B | no disponible | OpenVINO IR INT4 | Apache 2.0 | Conversión oficial OpenVINO, validación limitada |
| google/gemma-4-12B-it | 12B | no disponible | safetensors (original) | Apache 2.0 | Modelo base sin cuantizar, requiere stack PyTorch/Transformers |
| Otras conversiones OpenVINO de VLMs | no disponible | no disponible | OpenVINO IR | variable | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Validación muy limitada: solo tres prompts cortos de texto en CPU; el ejemplo de imagen con Optimum Intel no se ha ejecutado contra este artefacto.
- Entrada de imagen, GPU/NPU, audio/vídeo, contexto largo y precisión cuantitativa frente al original no están validados.
- La cuantización es de pesos (INT4_ASYM con backup INT8), no de activaciones; el rendimiento puede diferir del modelo original en tareas sensibles.
- Requiere versiones muy concretas: OpenVINO 2026.4.1, Transformers 5.10.2 y una revisión específica de Optimum Intel desde GitHub; la release 2.2.0 de PyPI no es compatible con Transformers 5.10.
- Sesgos y riesgo de alucinación: no documentados en esta conversión; deben consultarse en la model card del modelo original.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache 2.0, pero se debe preservar la licencia y avisos del modelo original al redistribuir.
- El autor advierte que no se registró la versión exacta de GenAI usada en la validación.

## Enlaces

- [Hugging Face: OpenVINO/gemma-4-12B-it-int4-ov](https://huggingface.co/OpenVINO/gemma-4-12B-it-int4-ov)
- [Modelo original: google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Formato OpenVINO IR](https://docs.openvino.ai/2026/documentation/openvino-ir-format.html)
- [NNCF (Neural Network Compression Framework)](https://github.com/openvinotoolkit/nncf)
- [Guía de compresión de pesos OpenVINO](https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/weight-compression.html)
- [Optimum Intel](https://huggingface.co/docs/optimum/intel/index)
- [OpenVINO Notebooks: Gemma 4](https://openvinotoolkit.github.io/openvino_notebooks/?search=Gemma+4)
