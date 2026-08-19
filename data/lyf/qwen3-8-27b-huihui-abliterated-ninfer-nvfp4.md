# lyf/Qwen3.8-27B-Huihui-Abliterated-NInfer-NVFP4

## Resumen

El modelo `lyf/Qwen3.8-27B-Huihui-Abliterated-NInfer-NVFP4` es un artefacto de inferencia en formato NInfer que cuantiza el checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una versión "abliterada" (con los vectores de rechazo eliminados) del modelo multimodal Qwen3.8-27B de Alibaba. El resultado es un archivo único de 21,5 GB que combina pesos en FP8 E4M3 y NVFP4, junto con tensores en BF16 para normas, embeddings, torre de visión y módulos MTP (multi-token prediction). Está diseñado exclusivamente para ejecutarse en GPUs Blackwell (SM120) mediante el runtime NInfer, y ha sido validado en una RTX 5090 con resultados de rendimiento documentados.

Este artefacto resuelve el problema de ejecutar un modelo de 27B parámetros con visión y razonamiento en hardware de consumo de gama alta, reduciendo el peso de 54 GB (BF16) a 21,5 GB sin perder las capacidades multimodales. Su relevancia radica en que ofrece una alternativa de cuantización mixta optimizada para la arquitectura Blackwell, con soporte de contexto largo (hasta 204,8K en perfil de servidor) y velocidades de decodificación superiores a 70 tokens por segundo en una sola GPU. Al ser un derivado abliterado, su uso principal es la investigación de comportamiento y la inferencia local sin restricciones de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) con atención full y Gated DeltaNet, visión nativa y MTP |
| Parametros totales | 27 mil millones (según el nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens (contexto nativo del modelo base); el artefacto NInfer fue probado con 204.8K en perfil de servidor |
| Tipos de cuantizacion | FP8 E4M3 (row-scaled) y NVFP4 (grupo 16), con componentes en BF16 y FP32 |
| Idiomas soportados | Inglés y chino (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto propietario `.ninfer` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un LLM denso multimodal de 27 mil millones de parámetros desarrollado por Alibaba, con arquitectura transformer que incorpora atención full y Gated DeltaNet, además de una torre de visión nativa y módulos de predicción multi-token (MTP). El artefacto NInfer no modifica la arquitectura, sino que aplica una cuantización mixta: las proyecciones de atención y Gated DeltaNet completas se mantienen en FP8 E4M3 con escalas BF16 por fila, las capas 56-63 de MLP y `lm_head` también en FP8, mientras que las capas 0-55 de MLP se cuantizan a NVFP4 con grupo de 16. Los tensores de normas, estado GDN, embeddings, visión y MTP se conservan en BF16 original del checkpoint de huihui-ai.

El entrenamiento original del modelo Qwen3.8-27B no se detalla en la información proporcionada, pero se sabe que es un modelo instructivo multimodal con capacidades de razonamiento y agente. El checkpoint abliterado de huihui-ai se obtuvo mediante una técnica de edición de pesos que elimina los vectores de rechazo, lo que permite respuestas sin negativas de seguridad. La cuantización NVFP4 fue calibrada con el dataset CNN/DailyMail versión 3.0.0, usando 20 secuencias de 8192 tokens cada una. El artefacto completo fue validado con una prueba de humo que incluyó generación de texto, una prueba de imagen real y una prueba de comportamiento de abliteración.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo "thinking" opcional (desactivable con `--no-thinking`).
- Comprensión de imágenes (entrada visual nativa): el modelo puede describir y razonar sobre imágenes, como se verificó en la prueba de humo identificando formas y colores.
- Predicción multi-token (MTP): soporta generación especulativa con 3 tokens de borrador, lo que acelera la decodificación.
- Soporte de agentes y automatización de tareas (según el modelo base, incluye capacidades de uso de herramientas y flujos de trabajo agénticos).
- Multilingüe limitado: inglés y chino (según la model card).
- Abliterado: no presenta vectores de rechazo, lo que permite respuestas directas a consultas que normalmente serían rechazadas (uso bajo responsabilidad del usuario).

## Casos de uso

- Automatización de oficina: el modelo puede procesar documentos escaneados, capturas de pantalla y formularios con texto e imágenes, extrayendo información y generando resúmenes o respuestas. Su contexto de 204,8K permite manejar documentos extensos en una sola pasada.
- Asistente de programación con visión: al recibir capturas de pantalla de código o diagramas, el modelo puede explicar errores, sugerir correcciones o generar código nuevo, integrable en entornos de desarrollo locales.
- Agente de automatización de escritorio: gracias a sus capacidades de razonamiento y visión, puede interpretar el estado de la pantalla y ejecutar acciones guiadas por texto, útil para flujos de trabajo repetitivos.
- Investigación en seguridad y alineación: al ser abliterado, permite estudiar cómo se comporta el modelo sin mecanismos de rechazo, lo que resulta útil para analizar sesgos, riesgos y técnicas de mitigación.
- Chat multimodal privado en local: al ejecutarse en una RTX 5090 con 19 GB de VRAM, ofrece una alternativa de asistente conversacional con visión sin depender de servicios en la nube, preservando la privacidad de los datos.
- Desarrollo de aplicaciones de visión-lenguaje: investigadores pueden usar este artefacto como backend para prototipos que requieran comprensión de imágenes y texto, con una velocidad de decodificación de ~75 tok/s que permite interacción en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este artefacto específico en la información disponible. Sin embargo, la model card documenta los siguientes resultados de rendimiento de inferencia medidos en una RTX 5090 (SM120, driver 610.43.02, CUDA 13.1, límite de 450 W):

| Prueba | Valor |
|---|---|
| Prefill (texto) | 792,69 tok/s |
| Decodificación (texto) | 74,83 tok/s |
| Rendimiento global (texto) | 73,83 tok/s |
| Peso GPU (texto) | 18,98 GiB |
| Decodificación (visión) | 74,82 tok/s |
| Peso GPU (visión) | 19,25 GiB |

Estos valores corresponden a pruebas de humo, no a benchmarks exhaustivos. El modelo base Qwen3.8-27B reporta resultados destacados en DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero no se ha verificado que el artefacto cuantizado conserve exactamente esas métricas.

## Requisitos de hardware

- GPU obligatoria: arquitectura Blackwell (SM120), únicamente. La cuantización NVFP4 y FP8 requiere soporte nativo de estas precisiones, por lo que no es compatible con GPUs Ampere, Ada Lovelace o anteriores.
- VRAM estimada: ~19 GiB para los pesos del modelo (18,98 GiB en texto, 19,25 GiB con visión), más memoria para el contexto (KV cache en int8) y overhead del runtime. Una RTX 5090 con 32 GB es suficiente para el perfil de servidor de 204,8K.
- GPU recomendada: RTX 5090 (probada), RTX 5080 o RTX PRO 6000 Blackwell (no verificadas pero compatibles por arquitectura).
- Opciones de despliegue: runtime NInfer (compilado desde fuente con `CMAKE_CUDA_ARCHITECTURES=120a`), que incluye una aplicación CLI (`ninfer`) y un servidor OpenAI-compatible (`ninfer-serve`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificación de ~75 tok/s en una RTX 5090, prefill de ~793 tok/s con 27 tokens de prompt. El servidor soporta hasta 204,8K de contexto con `--max-context 204800` y `--kv-capacity 204800`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Requisitos GPU | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (original, BF16) | 27B | 262K | safetensors | ~54 GB VRAM, cualquier GPU moderna | Apache 2.0 |
| Huihui-Qwen3.8-27B-abliterated (BF16) | 27B | 262K | safetensors | ~54 GB VRAM | Apache 2.0 |
| Este artefacto (NInfer FP8/NVFP4) | 27B | 204,8K (probado) | .ninfer | ~19 GB VRAM, solo Blackwell | Apache 2.0 |

La principal ventaja de este artefacto frente al modelo original es la reducción del peso a menos de la mitad (21,5 GB frente a ~54 GB), lo que permite ejecutarlo en GPUs de consumo con 32 GB. Sin embargo, sacrifica compatibilidad con otros runtimes y requiere hardware Blackwell específico. El formato propietario `.ninfer` limita su portabilidad, aunque ofrece un servidor OpenAI-compatible que facilita la integración.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los vectores de rechazo, por lo que puede generar contenido inapropiado, dañino o no deseado. El uso es bajo responsabilidad del usuario y no debe desplegarse en entornos de producción sin medidas de seguridad adicionales.
- Idiomas limitados: la model card solo declara inglés y chino. El rendimiento en otros idiomas no está garantizado.
- Contexto largo no verificado: aunque el perfil de servidor soporta 204,8K, la calidad en contextos largos y la longitud máxima sostenida dependen de la carga de trabajo, como advierte la propia model card.
- Requisitos de hardware estrictos: solo funciona en GPUs Blackwell (SM120). No es compatible con hardware anterior, lo que limita su adopción.
- Formato propietario: el artefacto `.ninfer` solo puede ejecutarse con el runtime NInfer, que requiere compilación desde fuente. No hay integración con ecosistemas estándar como Hugging Face Transformers o vLLM.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Sesgos potenciales: el modelo base puede contener sesgos derivados de sus datos de entrenamiento, y la abliteración no los elimina. Se recomienda auditar el comportamiento antes de usos sensibles.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/lyf/Qwen3.8-27B-Huihui-Abliterated-NInfer-NVFP4
- Checkpoint base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía completa de Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Repositorio de NInfer: https://github.com/Neroued/ninfer
