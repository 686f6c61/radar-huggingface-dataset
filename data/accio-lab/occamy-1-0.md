# Accio-Lab/occamy-1.0

## Resumen

Occamy-1.0 es un modelo de lenguaje multimodal de tipo image-text-to-text desarrollado por Accio-Lab, un fine-tune del modelo base Qwen/Qwen3.6-35B-A3B. Con 35.107 millones de parámetros totales y una arquitectura de mezcla de expertos (MoE), está diseñado específicamente para tareas de "co-work" agéntico: uso de herramientas, razonamiento multi-paso, generación de código y contextos largos. Se distribuye bajo licencia Apache 2.0, lo que facilita su adopción comercial.

El modelo se posiciona como una alternativa compacta en la frontera de Pareto para inteligencia de 35B orientada a agentes, compitiendo en un segmento donde el equilibrio entre tamaño, capacidades agénticas y coste de despliegue es crítico. Su pipeline multimodal (texto e imagen) y su integración con frameworks de entrenamiento propios (Dressage) lo convierten en una opción relevante para equipos que construyen asistentes autónomos y pipelines de código en producción.

La relevancia actual de Occamy-1.0 radica en su ecosistema de checkpoints: desde BF16 hasta múltiples cuantizaciones (GGUF, FP8, NVFP4, MLX de 3 a 8 bits), lo que permite desplegarlo desde un servidor H200 hasta un Mac con Apple Silicon. El modelo acumula 241 likes y 1790 descargas en Hugging Face, con actualizaciones recientes que incluyen una cabeza MTP experimental para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | BF16, FP8, NVFP4, GGUF (IQ2_M a Q8_0, 17 variantes), APEX GGUF, MLX 3/4/5/6/8-bit, MLX MXFP4, MXFP8, NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, FP8, NVFP4), GGUF, MLX |

## Arquitectura y entrenamiento

Occamy-1.0 emplea una arquitectura transformer de mezcla de expertos (MoE) heredada de Qwen3.6-35B-A3B, con 35.107 millones de parámetros totales. El modelo base es un MoE multimodal que procesa entradas de imagen y texto, y ha sido ajustado mediante el framework de entrenamiento Dressage de Accio-Lab. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es la inclusión de una cabeza MTP (Multi-Token Prediction) experimental de 1,69 GB que se suma al modelo base para decodificación especulativa, aunque su velocidad final (MTP3) no ha sido medida. El ecosistema de checkpoints incluye cuantizaciones calibradas (APEX GGUF) y variantes para Apple Silicon (MLX), con validaciones que cubren texto, código, JSON, tool calls e imágenes en un chequeo de nueve casos sobre una H200.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a agentes.
- Generación de código y soporte para tareas de programación.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Soporte de tool calling y function calling, validado en chequeos de compatibilidad con vLLM.
- Capacidades agénticas y de "co-work" para flujos de trabajo autónomos.
- Manejo de contextos largos (etiquetado como long-context).
- Salida estructurada en JSON, validada en los chequeos de compatibilidad.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con seguimiento de contexto y tool calling para consultar sistemas internos (pedidos, incidencias), gracias a su etiquetado long-context y su validación en tool calls y follow-up.
- **Generación de código en producción**: integrable en pipelines de CI/CD para revisión de código, generación de tests y corrección de errores, con salida JSON estructurada validada en los chequeos de vLLM.
- **Agentes autónomos de investigación**: el modelo puede encadenar pasos de razonamiento, invocar herramientas externas y sintetizar resultados, adecuado por su orientación explícita a agentic y co-work.
- **Asistente multimodal de documentación**: al procesar imagen y texto, puede extraer información de capturas, diagramas o documentación escaneada y responder preguntas sobre ellos.
- **Automatización de soporte técnico interno**: con tool calling puede consultar bases de conocimiento, abrir tickets y escalar incidencias en un flujo multi-paso.
- **Despliegue en estaciones de trabajo Apple Silicon**: las variantes MLX de 3 a 8 bits (15,18–36,83 GB) permiten ejecutar el modelo en Mac con mlx-lm para prototipado y tareas de texto.
- **Prototipado rápido en GPU de consumo**: las cuantizaciones GGUF (11,66–36,90 GB) permiten ejecución local con llama.cpp para pruebas de concepto y evaluación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: BF16 requiere 70,22 GB de pesos; FP8 36,61 GB; NVFP4 23,93 GB; GGUF desde 11,66 GB (IQ2_M) hasta 36,90 GB (Q8_0); APEX GGUF 13,47–25,34 GB; MLX 3-bit 15,18 GB hasta MLX 8-bit 36,83 GB. A estos tamaños hay que sumar KV cache, buffers de runtime y, en su caso, el proyector de visión F16 de 0,90 GB para GGUF.
- **GPU recomendadas**: H200 validada para BF16, FP8 y NVFP4 (chequeo de nueve casos con vLLM); B200 usada para muestras de GGUF y APEX GGUF; hardware compatible con FP4 nativo para NVFP4.
- **GPU de consumo**: las variantes GGUF de menor tamaño (IQ2_M a Q4) y MLX de 3–4 bits (15,18–19,51 GB) podrían caber en GPUs consumer de 24 GB, aunque la model card no confirma validación en esas tarjetas.
- **Opciones de despliegue**: Transformers, SGLang, vLLM (texto + visión), llama.cpp (GGUF y APEX GGUF), mlx-lm (solo texto, Apple Silicon). La cabeza MTP requiere SGLang parcheado.
- **Latencia y throughput**: no disponibles. La velocidad de la decodificación especulativa MTP3 no ha sido medida.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Multimodal | Formatos |
|---|---|---|---|---|---|
| Occamy-1.0 | 35,1B (MoE) | no disponible | Apache 2.0 | Si (imagen+texto) | safetensors, GGUF, MLX, FP8, NVFP4 |
| Qwen3.6-35B-A3B (base) | 35B (MoE) | no disponible | no disponible | Si | safetensors |
| Alternativas de 30-40B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación con el modelo base Qwen3.6-35B-A3B se limita a la relación de fine-tune declarada por el autor.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponibles en la información proporcionada; al ser un fine-tune de Qwen3.6, hereda los sesgos del modelo base, no documentados aquí.
- **Riesgo de alucinación**: no cuantificado; no se han publicado evaluaciones de fidelidad factual.
- **Limitaciones de contexto e idioma**: la longitud de contexto no está especificada y los idiomas soportados no están documentados.
- **Licencia**: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.6-35B-A3B.
- **Validación parcial**: los chequeos de compatibilidad son de nueve casos sobre una H200 y no establecen igual calidad de benchmark ni un ranking general de velocidad entre formatos.
- **MLX sin aceptación en Mac Metal**: las variantes MLX han pasado chequeos en Linux nativo, pero la aceptación en Mac Metal está pendiente.
- **MTP experimental**: la cabeza MTP tiene paridad greedy limitada y su velocidad final no se ha medido.
- **Memoria**: los tamaños indicados son GB decimales de archivos de pesos, no pico de RAM/VRAM; el KV cache y la concurrencia requieren memoria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Accio-Lab/occamy-1.0
- Web del proyecto: https://accio-lab.github.io/occamy/
- Informe técnico (arXiv): https://arxiv.org/pdf/2609.11977
- Framework de entrenamiento Dressage: https://github.com/Accio-Lab/Dressage
- Colección Occamy 1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Explorador de checkpoints: https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Modelo en ModelScope: https://www.modelscope.cn/models/Accio-Lab/occamy-1.0
- Checkpoint GGUF: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Checkpoint APEX GGUF: https://huggingface.co/Accio-Lab/occamy-1.0-APEX-GGUF
- Checkpoint FP8: https://huggingface.co/Accio-Lab/occamy-1.0-FP8
- Checkpoint NVFP4: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Checkpoint MLX 8-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit
- Checkpoint MLX 6-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit
- Checkpoint MLX 5-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-5bit
- Checkpoint MLX 4-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Checkpoint MLX 3-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit
- Checkpoint MLX MXFP4: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp4
- Checkpoint MLX MXFP8: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp8
- Checkpoint MLX NVFP4: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-nvfp4
- Cabeza MTP: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Colección MLX: https://huggingface.co/collections/Accio-Lab/occamy-10-mlx-6ac0072a7c1cdbc5e418e90b
