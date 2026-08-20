# noooop/DeepSeek-V4-Flash-REAP152-FP4

## Resumen

DeepSeek-V4-Flash-REAP152-FP4 es un checkpoint podado mediante la técnica REAP (Reducing Excessive Activated Parameters) del modelo oficial `deepseek-ai/DeepSeek-V4-Flash-0731`, desarrollado por el usuario `noooop`. Este modelo conserva 152 de los 256 expertos enrutados del modelo original, manteniendo la cuantización nativa FP4/FP8 de DeepSeek. El objetivo principal es reducir la huella de memoria residente y permitir una ejecución más eficiente en entornos con VRAM limitada, además de habilitar la decodificación especulativa DSpark.

Se trata de un podado por copia de bytes: los expertos supervivientes no se modifican, por lo que sus pesos son exactamente los mismos que los del checkpoint oficial. Esto implica que no hay reentrenamiento ni recalibración de los pesos, solo una selección de los 152 mejores expertos por capa según una métrica de saliencia. El autor advierte explícitamente que esta no es una mera cuantización, sino un podado de arquitectura, y que una versión sin podar con cuantización de 2 bits (manteniendo los 256 expertos) ofrece una calidad sustancialmente mayor a un tamaño similar.

La relevancia de este modelo reside en su naturaleza experimental y reproducible: incluye scripts completos para reconstruir el checkpoint desde el oficial, así como los datos de calibración necesarios. Es una pieza clave para investigadores que estudian el impacto del podado de expertos en modelos MoE de gran escala, especialmente en combinación con la decodificación especulativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida CSA+HCA y hyper-connections con restricción de manifold |
| Parametros totales | 181.955.282.430 |
| Parametros activos | 6 expertos activos por token (parametros activos totales no especificados) |
| Longitud de contexto | 1M tokens (heredado del modelo base) |
| Tipos de cuantizacion | FP4 E2M1 (expertos enrutados, bloques de 32 elementos con escalas E8M0); FP8 E4M3 (resto de pesos cuantizados, bloques de 128x128 con escalas E8M0) |
| Idiomas soportados | No especificado; la calibración REAP está centrada en japones e ingles |
| Licencia | MIT |
| Formato de pesos | Safetensors (formato nativo DeepSeek, no GGUF) |

## Arquitectura y entrenamiento

La arquitectura base es la de DeepSeek-V4-Flash-0731: un modelo MoE con 256 expertos enrutados, de los cuales se activan 6 por token, distribuidos en 43 capas. Incorpora atención híbrida CSA (Compressive Sparse Attention) y HCA (Hybrid Channel Attention), junto con hyper-connections con restricción de manifold. El modelo base también incluye un módulo de decodificación especulativa DSpark, compuesto por 3 bloques MTP (Multi-Token Prediction).

El proceso de podado REAP selecciona los 152 expertos con mayor saliencia por capa, calculada a partir de una mezcla de calibración centrada en japonés e inglés. El cabezal especulativo (draft head) conserva 128 expertos, los mismos que en la variante REAP128, ya que medir la aceptación no mejoró significativamente al añadir más. El checkpoint es una copia de bytes: los expertos supervivientes no se modifican, y solo se recalculan 86 tensores de enrutado. No hubo reentrenamiento ni RLHF/DPO posterior al podado.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base DeepSeek-V4-Flash-0731, incluyendo razonamiento en tres niveles (Non-think / Think High / Think Max).
- Generación de código: el modelo base está optimizado para tareas de programación y agentes, aunque las evaluaciones de código en este podado son mixtas.
- Capacidades de agente: el modelo base incorpora capacidades agénticas mejoradas respecto a versiones anteriores, lo que incluye soporte para tool calling y planificación de tareas multi-paso.
- Decodificación especulativa DSpark: el modelo incluye un cabezal de borrador con 3 bloques MTP y 128 expertos, lo que permite acelerar la inferencia en entornos compatibles.
- Capacidades multilingües: aunque la calibración está centrada en japonés e inglés, el modelo base soporta múltiples idiomas, pero la selección de expertos no está optimizada para otros.
- Ejecución nativa FP4/FP8: los pesos están en el formato cuantizado nativo de DeepSeek, lo que permite ejecución sin conversiones adicionales en runtimes compatibles.

## Casos de uso

- **Despliegue de baja latencia con decodificación especulativa**: el cabezal DSpark integrado permite reducir el tiempo de generación por token en comparación con la decodificación autorregresiva estándar, siempre que el runtime soporte el formato nativo.
- **Evaluación de técnicas de podado**: es un banco de pruebas ideal para investigadores que estudian el impacto del podado de expertos en modelos MoE a gran escala, ya que incluye los scripts de calibración y evaluación.
- **Inferencia con memoria residente reducida**: con 101,9 GB en disco y una utilización de memoria GPU de 0,85, ocupa menos VRAM que el modelo base sin podar (que requiere más de 170 GB), permitiendo su ejecución en servidores con 2x A100/H100 de 80 GB.
- **Aplicaciones centradas en inglés y japonés**: la calibración del podado está específicamente orientada a estos idiomas, por lo que el rendimiento será más consistente en tareas de generación de texto en estos idiomas que en otros.
- **Prototipado de agentes y tool calling**: aunque la calidad es inferior a la del modelo sin podar, las capacidades agénticas del modelo base se mantienen, permitiendo probar pipelines de agente en entornos con restricciones de memoria.
- **Investigación sobre saliencia de expertos**: los datos de saliencia publicados y los scripts permiten estudiar qué expertos son más importantes en capas concretas para distintas mezclas de tareas.

## Benchmarks y rendimiento

Se han publicado datos de evaluación limitados, basados en una muestra de 205 preguntas del dataset generativo MMLU, junto con evaluaciones pequeñas de código. Es importante señalar que no se trata del benchmark completo, sino de una muestra.

| Modelo | Muestra MMLU (205 preguntas) | Evaluaciones de código |
|---|---|---|
| REAP152-FP4 (este modelo) | 58,05% | Mixtas |
| REAP128-FP4 (128 expertos) | 51,22% | Mixtas |
| DeepSeek-V4-Flash-UD-IQ2_M (256 expertos, 2 bits) | 84,39% | No disponible |

El autor advierte que la comparación más relevante es contra el modelo sin podar, que supera ampliamente a este build en calidad por byte. No se han publicado resultados de benchmarks completos (MMLU completo, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint ocupa 101,9 GB en disco. El autor indica que requiere un `--gpu-memory-utilization` de 0.85, lo que implica una VRAM disponible de aproximadamente 120 GB para inferencia.
- **GPU recomendadas**: se necesitan servidores con al menos 2x A100 80GB o 2x H100 80GB. No es compatible con GPU de consumo estándar (RTX 4090 de 24 GB, etc.).
- **Opciones de despliegue**: es compatible con runtimes que soporten el formato nativo de DeepSeek (Transformers, vLLM, SGLang). No es un checkpoint GGUF, por lo que llama.cpp u Ollama no lo soportan directamente.
- **Latencia y throughput**: no se han publicado cifras concretas de latencia o throughput. La decodificación especulativa DSpark está diseñada para reducir la latencia por token, pero el rendimiento exacto depende del hardware y la carga.

## Comparativa con modelos similares

| Modelo | Expertos | Tamaño en disco | Tensores | Utilización GPU | Muestra MMLU (205) |
|---|---|---|---|---|---|
| **REAP152-FP4** (este modelo) | 152/256 | 101,9 GB | 43.181 | 0.85 | 58.05% |
| REAP128-FP4 | 128/256 | 88,1 GB | 36.989 | 0.75 | 51.22% |
| DeepSeek-V4-Flash-UD-IQ2_M (sin podar, 2 bit) | 256/256 | ~85 GB | No disponible | No disponible | 84.39% |
| DeepSeek-V4-Flash-0731 (base oficial) | 256/256 | ~170 GB (BF16/FP8) | No disponible | No disponible | No disponible |

La comparativa muestra claramente que el podado de expertos degrada significativamente la calidad en comparación con la cuantización de alta compresión sin podado. REAP128 es más eficiente en memoria y deja más margen para la caché KV, mientras que REAP152 ofrece mejor calidad en la muestra MMLU, pero a costa de más VRAM.

## Limitaciones y advertencias

- **Pérdida de calidad significativa**: el podado de 41% de los expertos degrada notablemente el rendimiento. El propio autor indica que un modelo de 2 bits sin podar es mucho más fuerte en calidad por byte.
- **Calibración limitada a japonés e inglés**: la selección de expertos se realizó con una mezcla de calibración centrada en estos idiomas. No se recomienda para tareas en otros idiomas sin recalibrar.
- **No se distribuye `calib.pt`**: el archivo de calibración (3,1 MB de IDs de token) no se incluye en el repositorio, aunque se proporciona su configuración de regeneración y SHA-256 para reproducibilidad.
- **`target-saliency.json` no es reweightable**: los datos de saliencia publicados son una mezcla combinada sin desglose por fuente, por lo que no se deben re-ponderar para otros idiomas o dominios.
- **Formato propietario**: al ser un checkpoint nativo FP4/FP8 de DeepSeek, no es compatible con ecosistemas GGUF. Requiere runtimes específicos como vLLM o Transformers.
- **Modelo sin validación de producción**: el repositorio tiene 0 descargas y 0 likes, y no se han publicado evaluaciones completas más allá de la muestra de MMLU y pequeñas pruebas de código.

## Enlaces

- Repositorio del modelo: https://huggingface.co/noooop/DeepSeek-V4-Flash-REAP152-FP4
- Variante REAP128: https://huggingface.co/noooop/DeepSeek-V4-Flash-REAP128-FP4
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de scripts y código (GitHub): https://github.com/g667300/deepseek-v4-flash-reap-fp4
- Receta de despliegue con vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- Guía de despliegue local de DeepSeek V4 Flash: https://codersera.com/blog/run-deepseek-v4-flash-locally-full-2026-setup-guide/
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash
