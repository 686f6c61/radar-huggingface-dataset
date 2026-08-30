# latent-variable/Qwen3.8-Flash-Next-heretic-2-oQ4e-mtp

## Resumen

Este repositorio contiene una cuantización mixta de precisión **oQ4e** (oMLX mixed precision + imatrix) del modelo `trohrbaugh/Qwen3.8-Flash-Next-heretic-2`, que a su vez es una versión "decensored" (abliterated) del modelo oficial `Qwen/Qwen3.8-Flash-Next`. El modelo base es un MoE híbrido de 176B parámetros totales (6B activos por token) con arquitectura Gated DeltaNet + Gated Attention (GDN + QSA), que incorpora una tabla de n-gramas de 51.2B parámetros adicionales. Soporta contexto de 262K tokens y es multimodal (imagen-texto).

La relevancia de esta cuantización es que reduce el peso del modelo de 335 GB (bf16) a 99 GB, permitiendo su ejecución en hardware de consumo con Apple Silicon (por ejemplo, M5 Max con 128 GB unificados) mediante el runtime oMLX, conservando las cabezas Lightning MTP para decodificación especulativa. El proceso de cuantización utiliza un análisis de sensibilidad por capa y una pasada de matriz de importancia (imatrix) para asignar bits de forma no uniforme, logrando un promedio efectivo de 4.70 bits por peso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN + QSA hybrid Mixture-of-Experts (MoE) con tabla n-gram |
| Parametros totales | 176B (125B modelo principal + 51B tabla n-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | oQ4e (mixta: 8, 6, 5 y 4 bits por tensor; efectivo 4.70 bpw) |
| Idiomas soportados | No disponible (dataset de calibracion: en, zh, ko, ja) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | oMLX (oQ4e, 21 shards) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` introduce una arquitectura híbrida que combina **Gated DeltaNet (GDN)** y **Gated Attention (QSA)**. GDN es un mecanismo de atención lineal con compuertas que reduce el coste computacional frente a la atención softmax tradicional, mientras que QSA (Gated Attention) mantiene la capacidad de atender a información relevante de forma selectiva. El modelo es un MoE con 75,264 slots de expertos, de los cuales se activan 6B parámetros por token. Además, incorpora una tabla de n-gramas de 320M filas × 160 dimensiones (51.2B parámetros) que se consulta por hash, lo que representa aproximadamente el 41% del modelo.

La versión `heretic-2` fue sometida a un proceso de **abliteration** (usando la herramienta Heretic) para eliminar los mecanismos de rechazo y censura del modelo original, reduciendo las negativas de 99/100 a 0/100 en una prueba de 100 prompts, con una divergencia KL de 0.0818 respecto al original. La cuantización oQ4e se realizó con oMLX 0.6.4, utilizando un dataset de calibración `oqe_code_multilingual` (código, razonamiento, tool-calling, chat en en/zh/ko/ja) con 1024 muestras de 512 tokens. La cobertura de expertos alcanzó el 99.972% (75,243 de 75,264 slots).

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica.
- Generación de código y soporte de tool calling / function calling.
- Capacidades multimodales: entrada de imagen y texto (pipeline `image-text-to-text`).
- Decodificación especulativa mediante cabezas Lightning MTP (Multi-Token Prediction) retenidas en la cuantización.
- Soporte de agentes y razonamiento multi-paso gracias a la ventana de contexto de 262K tokens.
- Multilingüe (al menos en, zh, ko, ja según el dataset de calibración; lista completa no disponible).
- Versión "uncensored" / "decensored" con rechazos eliminados (abliterated).

## Casos de uso

- **Generación de código en producción**: el modelo puede integrarse en pipelines de CI/CD para autocompletar o revisar código, aprovechando su capacidad de tool calling y su contexto largo para manejar repositorios completos.
- **Asistente de razonamiento matemático**: su entrenamiento en razonamiento y matemáticas lo hace adecuado para resolver problemas complejos paso a paso, útil en entornos educativos o de investigación.
- **Análisis de documentos con imágenes**: al ser multimodal, puede procesar capturas de pantalla, diagramas o documentos escaneados y extraer información relevante, combinando visión y texto.
- **Atención al cliente automatizada**: con 262K tokens de contexto, puede gestionar conversaciones multi-turno extensas y mantener el historial completo, reduciendo la pérdida de información.
- **Agentes autónomos**: su soporte de tool calling y razonamiento multi-paso permite construir agentes que interactúan con APIs, bases de datos o navegadores web.
- **Investigación en modelos abliterated**: útil para estudiar el comportamiento de modelos sin restricciones de seguridad, aunque con las advertencias éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica en la información disponible. Los únicos datos de rendimiento medidos son:

| Metrica | Valor |
|---|---|
| Divergencia KL vs original | 0.0818 |
| Refusals (100 prompts) | 0/100 (original: 99/100) |
| Prompt processing (M5 Max, 12.2k tokens) | ~1230 tok/s |
| Generacion (M5 Max, Lightning MTP activado) | ~71 tok/s |

Estas cifras de throughput se obtuvieron en una única configuración (M5 Max, 128 GB, macOS 26.5.2, oMLX 0.6.4, tabla n-gram en SSD) y deben considerarse como referencia superior, no como garantía.

## Requisitos de hardware

- **Almacenamiento**: 99 GB para los pesos (21 shards). Se recomienda SSD para la tabla n-gram si no cabe en RAM.
- **RAM/VRAM**: mínimo 99 GB para cargar el modelo completo; se recomienda 128 GB de memoria unificada (como en Apple M5 Max). La tabla n-gram de 30 GB puede descargarse a SSD mediante la opción `SSD n-gram offload`.
- **GPU**: exclusivamente Apple Silicon (M-series) con soporte Metal, ya que el runtime es **oMLX**. No es compatible con GPUs NVIDIA/AMD ni con runtimes como vLLM, llama.cpp, Ollama o TGI.
- **Despliegue**: usar `omlx serve --model-dir <dir>`. Activar Lightning MTP en la configuración del modelo para mejorar la generación (~1.7x en texto predecible).
- **Latencia**: en la configuración de referencia, ~71 tok/s de generación y ~1230 tok/s de prompt processing.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 176B (6B activos) | 262K | bf16 (335 GB) | qwen-community-1.0 | Transformers, vLLM, SGLang |
| trohrbaugh/Qwen3.8-Flash-Next-heretic-2 | 176B (6B activos) | 262K | bf16 (335 GB) | qwen-community-1.0 | Transformers, vLLM, SGLang |
| Este modelo (oQ4e) | 176B (6B activos) | 262K | oQ4e (99 GB) | qwen-community-1.0 | oMLX (solo Apple Silicon) |

La principal diferencia frente al original es el tamaño reducido (99 GB vs 335 GB) y la eliminación de censura, a costa de requerir oMLX y hardware Apple. No se dispone de datos de comparación con otros modelos de la misma categoría (por ejemplo, otros MoE cuantizados) en la información proporcionada.

## Limitaciones y advertencias

- **Runtime exclusivo**: solo funciona con oMLX; no carga en mlx-lm, mlx-vlm, LM Studio ni otros frameworks estándar.
- **Hardware restringido**: requiere Apple Silicon con suficiente memoria unificada (mínimo 99 GB, recomendado 128 GB). No es ejecutable en GPUs NVIDIA/AMD.
- **Riesgo de alucinación**: como todo LLM, puede generar información falsa o inventada, especialmente en tareas abiertas.
- **Sesgos**: el proceso de abliteration puede eliminar también comportamientos de seguridad útiles, aumentando el riesgo de respuestas dañinas o inapropiadas.
- **Licencia**: la licencia `qwen-community-1.0` permite uso comercial, pero es necesario revisar sus términos específicos (incluye restricciones sobre el uso para ciertos fines).
- **Rendimiento variable**: el throughput medido depende de la localidad de n-gramas; entradas con tokens diversos pueden ser significativamente más lentas.
- **Cobertura de calibración**: 21 slots de expertos no fueron cubiertos por el dataset de calibración, por lo que se cuantizaron con el método estándar (oQ) en lugar de oQe, lo que podría afectar ligeramente la calidad en esos casos.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/latent-variable/Qwen3.8-Flash-Next-heretic-2-oQ4e-mtp)
- [Modelo base heretic-2 (sin cuantizar)](https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2)
- [Modelo original Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Repositorio GitHub de Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [Documentación de despliegue con SGLang](https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next)
- [Recetas vLLM para Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
- [Guía de ejecución local (unsloth)](https://unsloth.ai/docs/models/qwen3.8-next)
- [Herramienta Heretic (abliteration)](https://github.com/p-e-w/heretic)
