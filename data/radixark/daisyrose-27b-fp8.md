# RadixArk/DaisyRose-27B-FP8

## Resumen

DaisyRose-27B-FP8 es la versión cuantizada en FP8 de DaisyRose-27B, el primer modelo publicado por RadixArk. Se trata de un modelo multimodal de razonamiento construido sobre Qwen3.8-27B y entrenado exclusivamente con aprendizaje por refuerzo (RL), sin supervisión fina (SFT) ni destilación. El entrenamiento se realizó sobre aproximadamente 1.200 tareas de agente de horizonte largo, con sesiones de hasta 1M de tokens, durante 18 días en 144 GPU H200.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat de Qwen3.8-27B, así como su comprensión de imágenes y su ventana de contexto de 256K tokens, por lo que es un reemplazo directo en pilas de inferencia y post-entrenamiento existentes. La relevancia actual reside en que demuestra que el RL puro sobre tareas de agente de horizonte largo puede mejorar de forma sustancial el rendimiento en Terminal Bench 4.1 (de 5,6 a 12,0 pass@1) sin necesidad de SFT.

Esta ficha cubre la variante FP8 (30,9 GB de repositorio), pensada para despliegue en producción con menor huella de memoria que la versión BF16, manteniendo una precisión prácticamente idéntica según las evaluaciones del autor (diferencias inferiores a un punto en todos los benchmarks donde se ejecutaron ambas variantes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | FP8 (esta variante); BF16 y NVFP4 disponibles en otros repositorios; GGUF disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP8), librería transformers |

## Arquitectura y entrenamiento

DaisyRose-27B mantiene la arquitectura del modelo base Qwen3.8-27B: un transformer multimodal con capacidad de comprensión de imágenes (pipeline image-text-to-text) y una ventana de contexto de 256K tokens. No se especifican en la información disponible detalles sobre el número de capas, dimensiones ocultas ni mecanismos de atención concretos más allá de la herencia del modelo base.

La innovación principal es el proceso de entrenamiento: RL puro sin SFT ni destilación, sobre unas 1.200 tareas de agente de horizonte largo curadas, con sesiones de hasta 1M de tokens, durante 18 días en 144 GPU H200. El modelo conserva el tokenizador y la plantilla de chat del base, e incluye un modo de razonamiento (thinking mode) con el parámetro "reasoning effort" configurable (por defecto xhigh). RadixArk publica además un modelo draft específico (Qwen3.8-27B-DSpark) para decodificación especulativa, lo que sugiere soporte para aceleración de inferencia mediante draft models.

## Capacidades

- Generación de texto y razonamiento multimodal (texto e imagen).
- Razonamiento extendido con modo thinking y esfuerzo de razonamiento configurable (temperatura 1.0, top_p 0.95, top_k 20, min_p 0, effort xhigh por defecto).
- Capacidades de agente y razonamiento multi-paso, entrenado específicamente en tareas de horizonte largo.
- Uso de terminal y entornos de agente (Terminal Bench, mini-swe-agent, Terminus 2).
- Ingeniería de software y resolución de issues (SWE Bench Pro, DeepSWE).
- Seguimiento de instrucciones (IFBench).
- Razonamiento científico y de conocimiento (GPQA Diamond, HLE).
- Comprensión de imágenes (pipeline image-text-to-text).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling: no se detalla explícitamente en la información disponible, aunque el entrenamiento en tareas de agente y el uso de harnesses con herramientas sugieren capacidad para ello.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo está entrenado específicamente en tareas de agente de terminal (Terminal Bench 4.1 pass@1 de 12,0 frente a 5,6 del base), por lo que puede ejecutar flujos multi-paso de administración de sistemas, depuración y scripting dentro de harnesses tipo mini-swe-agent.
- Resolución de issues de software en producción: con 94,7 en SWE Bench Pro v2 y 46,2 en DeepSWE v1.1, es adecuado para pipelines de CI/CD que requieran localizar, parchear y validar cambios sobre repositorios reales.
- Asistentes de razonamiento científico: con 90,7 en GPQA Diamond y 34,3 en HLE (solo texto), sirve para responder preguntas de nivel experto en dominios técnicos con razonamiento extendido.
- Análisis de documentos e imágenes: al conservar la comprensión de imágenes del base y 256K de contexto, puede procesar capturas, diagramas o documentos escaneados junto con texto largo en una sola sesión.
- Agentes de horizonte largo con contexto masivo: las sesiones de entrenamiento de hasta 1M de tokens y la ventana de 256K permiten mantener estado en flujos de agente prolongados sin truncar el historial.
- Seguimiento estricto de instrucciones en aplicaciones de producción: el 82,4 en IFBench lo hace apto para sistemas donde el cumplimiento de formato y restricciones es crítico (generación de JSON, plantillas, políticas).
- Despliegue como reemplazo directo de Qwen3.8-27B: al conservar tokenizador, plantilla de chat y arquitectura, se puede sustituir en pilas existentes sin cambios de integración, con la ventaja de la cuantización FP8 para reducir memoria.

## Benchmarks y rendimiento

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Parámetros activados | 27B | 27B | 30B | 3B | 15B | 17B | 23B | 42B | – |
| Parámetros totales | 27B | 27B | 30B | 35B | 309B | 594B | 501B | 816B | – |
| Terminal Bench 4.1 | 12,0 | 5,6 | 0,5 | 0,0 | **16,1** | 13,0 | 6,4 | 6,6 | 15,2 |
| Terminal Bench 2.1 | 75,5 | 73,0 | 51,7 | 44,9 | **87,6** | 81,3 | 80,1 | 76,4 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 | 4,4 | 0,0 | 67,9 | **72,1** | 43,3 | 60,0 | 66,6 |
| SWE Bench Pro v2 | 94,7 | 91,3 | 80,4 | 73,3 | – | **97,7** | – | 95,0 | – |
| HLE (solo texto) | 34,3 | 33,9 | 22,0 | 22,2 | 35,1 | **44,1** | 34,7 | 43,9 | 38,5 |
| IFBench | **82,4** | 79,5 | 77,0 | 64,4 | – | – | 79,6 | – | – |
| GPQA Diamond | 90,7 | 89,2 | 83,5 | 86,0 | 88,7 | **93,0** | 90,6 | 89,0 | 90,5 |

Las puntuaciones de DaisyRose-27B corresponden a la mejor ejecución entre BF16 y FP8, que difieren en menos de un punto en todos los benchmarks donde se ejecutaron ambas. Las cifras de los modelos comparados provienen de sus respectivos desarrolladores y leaderboards (Terminal Bench oficial, Vals.ai, Artificial Analysis, model cards). Los detalles completos de los harnesses y configuraciones están en la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 27,8 GB (el repositorio pesa 30,9 GB); con overhead de activaciones y caché KV para 256K de contexto, se recomienda al menos 40-48 GB de VRAM para uso cómodo.
- GPU recomendadas: H200 (usadas en el entrenamiento), H100, A100 de 80 GB. Para FP8 nativo se recomiendan GPU Hopper o Ada con soporte FP8.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar los pesos FP8 completos; sería necesaria la variante GGUF cuantizada a 4-6 bits, que sí podría caber en 24 GB con contexto reducido. El modelo base BF16 (≈55 GB) requiere múltiples GPU o una GPU de 80 GB.
- Opciones de despliegue: transformers (librería indicada), compatible con endpoints; el ecosistema Qwen suele soportar vLLM, TGI y llama.cpp (para GGUF). No se confirman explícitamente en la información disponible.
- Latencia y throughput: no disponibles. Existe un draft model (Qwen3.8-27B-DSpark) para decodificación especulativa que puede mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parámetros (activos/totales) | Contexto | Terminal Bench 4.1 | SWE Bench Pro v2 | Licencia | Disponibilidad |
| --- | --- | --- | ---: | ---: | --- | --- |
| DaisyRose-27B-FP8 | 27B / 27B | 256K | 12,0 | 94,7 | Apache-2.0 | Hugging Face (BF16, FP8, NVFP4, GGUF) |
| Qwen3.8-27B (base) | 27B / 27B | 256K | 5,6 | 91,3 | No disponible | Hugging Face |
| Muse Glimmer-30B | 30B / 30B | No disponible | 0,5 | 80,4 | No disponible | Hugging Face |
| Inkling 2 Small | 17B / 594B (MoE) | No disponible | 13,0 | 97,7 | No disponible | No disponible |

DaisyRose-27B-FP8 ofrece un rendimiento superior a su base Qwen3.8-27B en todos los benchmarks reportados, con licencia Apache-2.0 permisiva y múltiples formatos de pesos. Frente a modelos MoE de mayor tamaño total (Inkling 2 Small, 594B) queda por debajo en SWE Bench Pro y HLE, pero compite con solo 27B densos. Las licencias y contextos de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al heredar el base Qwen3.8-27B, puede arrastrar los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: presente como en cualquier LLM; el modo thinking con effort xhigh puede mitigarlo parcialmente, pero no lo elimina.
- Idiomas soportados: no se especifican; la model card está en inglés y no hay lista de idiomas, por lo que el rendimiento multilingüe es incierto.
- Contexto: 256K tokens, aunque el entrenamiento usó sesiones de hasta 1M; no se garantiza el rendimiento más allá de la ventana declarada.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para condiciones exactas.
- Precisión FP8: las evaluaciones del autor indican diferencias inferiores a un punto frente a BF16, pero puede haber degradación en tareas no cubiertas por los benchmarks.
- Entrenamiento solo con RL: sin SFT, el modelo puede mostrar comportamientos menos alineados en conversación general fuera de tareas de agente.
- Tool calling: no se detalla explícitamente su soporte; verificar antes de integrar en pipelines que dependan de function calling.
- Producción: validar el comportamiento en el dominio concreto, ya que el entrenamiento se centró en tareas de agente de terminal y código.

## Enlaces

- Modelo FP8 en Hugging Face: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Modelo base BF16: https://huggingface.co/RadixArk/DaisyRose-27B
- Variante NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Variante GGUF: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- Draft model para decodificación especulativa: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de RadixArk: https://www.radixark.com/blog/daisyrose-27b
- Leaderboard Terminal Bench: https://www.tbench.ai/leaderboard
- Paper SWE Bench Pro v2: https://arxiv.org/html/2611.16289
- Artificial Analysis Qwen3.8: https://artificialanalysis.ai/models/qwen3-8-27b
- Model card Inkling 2 Small: https://thinkingmachines.ai/model-card/inkling-2-small/
- Model card Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Model card Muse Spark Open: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Model card Muse Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
