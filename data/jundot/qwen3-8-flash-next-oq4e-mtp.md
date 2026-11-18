# Jundot/Qwen3.8-Flash-Next-oQ4e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ4e-mtp es una cuantización mixta en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, un checkpoint experimental de la arquitectura que Qwen empleará en su próxima generación (Qwen4). El modelo original es un mixture-of-experts multimodal (visión-lenguaje) de 125.000 millones de parámetros en el backbone lingüístico con 6.000 millones activados por token, al que se suman un embedding n-gram de 51.200 millones de parámetros y un módulo de predicción multi-token (MTP) de 4.000 millones. El autor de la cuantización es Jundot, que la publica mediante su herramienta oQ (oMLX v0.7.3).

La relevancia de esta ficha radica en que permite ejecutar en hardware Apple Silicon un modelo de escala frontier que, en BF16, ocuparía más de 300 GB. La cuantización mixta reduce el checkpoint a 100,275 GiB con una media efectiva de 4,785 bits por peso, preservando en 8 bits las capas identificadas como sensibles y comprimiendo el embedding n-gram a 4 bits con grupo 32. El resultado es un checkpoint de 107,7 GB de repositorio que mantiene el codificador visual y la cabeza MTP, lo que habilita decodificación especulativa y entrada de imágenes.

La arquitectura combina Gated DeltaNet (atención lineal con estado recurrente) con Qwen Sparse Attention (QSA) y flujos residuales con compuertas (Gated Residual streams), una combinación híbrida que busca reducir el coste de atención en contextos largos. El modelo se distribuye bajo Qwen Community License 1.0, con las restricciones que ello implica para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con Gated DeltaNet + Qwen Sparse Attention (QSA) y Gated Residual streams; codificador visual y cabeza MTP |
| Parámetros totales | 179.999.981.459 (180.000B): 125.744B backbone lingüístico, 51.200B embedding n-gram, 0.449B codificador visual, 2.607B cabeza MTP |
| Parámetros activos | 6B en el backbone MoE (125B totales en el backbone) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ4e mixta: affine 4-bit grupo 64 (123.313B), affine 8-bit grupo 128 (0.241B), affine 8-bit grupo 64 (4.731B), BF16 (0.516B), n-gram affine 4-bit grupo 32 (51.200B); media efectiva 4.785 bits/peso (4.661 en el backbone) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), cuantización mixta oQ |

## Arquitectura y entrenamiento

El backbone lingüístico es un mixture-of-experts de 125.744B parámetros con 6B activados por token, construido sobre una arquitectura híbrida que intercala capas de Gated DeltaNet —atención lineal con estado recurrente y decaimiento controlado por compuerta— con capas de Qwen Sparse Attention. A ello se añaden Gated Residual streams, que modulan la contribución de cada bloque residual. El modelo incorpora además un embedding n-gram de 51.200B parámetros, presumiblemente orientado a mejorar la recuperación de patrones léxicos frecuentes, y un codificador visual de 0.449B que habilita la entrada de imágenes (pipeline `image-text-to-text`).

La cabeza MTP de 2.607B parámetros implementa predicción multi-token, lo que permite decodificación especulativa autogenerada: el modelo propone varios tokens por paso y el backbone los verifica, incrementando el throughput sin modelo borrador externo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; la model card del checkpoint cuantizado no los detalla y la información proporcionada no los incluye.

La cuantización oQ4e asigna bits según la sensibilidad medida por capa, redondea cada grupo con una matriz de importancia (1024 muestras × 512 tokens) y reajusta escala y sesgo mediante mínimos cuadrados ponderados. La versión actual (2026-10-29) se regeneró con la mejora oQe de oMLX 0.7.3.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto (`image-text-to-text`) y produce respuestas conversacionales.
- Comprensión de imágenes mediante el codificador visual de 0.449B parámetros incluido en el checkpoint.
- Decodificación especulativa nativa gracias a la cabeza MTP de 2.607B parámetros.
- Modelo conversacional con soporte de diálogo multi-turno.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 100,275 GiB está diseñado para ejecutarse con MLX en equipos con memoria unificada de 128 GB o superior (Mac Studio M3 Ultra, por ejemplo), permitiendo usar un modelo de escala frontier sin GPU dedicada.
- Asistentes conversacionales multimodales: el pipeline `image-text-to-text` permite construir interfaces donde el usuario adjunta capturas, diagramas o documentos escaneados y el modelo responde en lenguaje natural, aprovechando el codificador visual integrado.
- Prototipado de aplicaciones sobre la arquitectura Qwen4: al ser un preview experimental de la arquitectura de próxima generación, sirve para evaluar Gated DeltaNet y QSA antes de que existan checkpoints estables.
- Generación acelerada con decodificación especulativa: la cabeza MTP permite aumentar tokens por segundo en despliegues MLX sin cargar un modelo borrador adicional, útil en entornos interactivos con latencia sensible.
- Investigación sobre cuantización mixta: el reparto de bits documentado (4/8 bits por capa, 4 bits en el embedding n-gram) permite estudiar el impacto de la precisión por componente en tareas de razonamiento y visión.
- Procesamiento de documentos con componente visual: extracción y descripción de contenido en imágenes dentro de pipelines de análisis documental, siempre que se valide la calidad frente al modelo en BF16.
- Evaluación comparativa de arquitecturas híbridas: banco de pruebas para medir el comportamiento de atención lineal más atención dispersa frente a transformers densos en tareas de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 100,275 GiB de pesos en el formato cuantizado; con overhead de ejecución (KV cache, buffers, estado recurrente de DeltaNet) se recomienda un mínimo de 112-128 GB de memoria unificada.
- El repositorio completo ocupa 107,67 GB en disco; se necesita ese espacio libre para la descarga.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable directamente, ya que el formato es MLX y está pensado para Apple Silicon; no se documenta conversión a CUDA en la información disponible.
- GPU de consumo: no cabe en ninguna GPU consumer convencional (RTX 4090 con 24 GB, RTX 5090 con 32 GB) por el tamaño del checkpoint.
- Equipos Apple recomendados: Mac Studio con M3 Ultra o M4 Max y 128 GB o más de memoria unificada; MacBook Pro de gama alta con 128 GB podría cargarlo, con margen reducido.
- Opciones de despliegue: MLX (librería declarada) y oMLX (herramienta del autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para mejorar la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-mtp (esta ficha) | 180B (125B backbone + 51B n-gram + 4B MTP + 0.4B visión) | 6B | no disponible | MLX safetensors 4/8-bit mixto | qwen-community-1.0 | Hugging Face, 57.468 descargas |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 180B (misma composición) | 6B | no disponible | BF16 safetensors | qwen-community-1.0 | Hugging Face |
| Alternativas de tamaño y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de la misma categoría (MoE multimodal con atención híbrida y MTP) que permita una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo experimental: la model card lo describe como preview de la arquitectura de Qwen4, por lo que su comportamiento puede no ser representativo de la versión final.
- Licencia Qwen Community License 1.0: no es una licencia de código abierto plena; incluye restricciones de uso comercial que deben revisarse en el archivo `LICENSE` antes de desplegar en producción.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otras lenguas distintas del inglés sin evaluación propia.
- Cuantización con pérdida: 4,785 bits/peso de media implica degradación potencial frente al BF16, especialmente en tareas de razonamiento matemático y precisión numérica; la asignación por sensibilidad mitiga pero no elimina este efecto.
- Dependencia de MLX: el checkpoint no es portable a CUDA ni a runtimes estándar de PyTorch sin conversión, lo que limita su uso a hardware Apple.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de alucinación; al ser un modelo conversacional multimodal, debe validarse en dominios críticos.
- Sesgos: no se publica información sobre sesgos demográficos, lingüísticos o culturales del modelo base ni del proceso de cuantización.
- Longitud de contexto no disponible: impide planificar despliegues con documentos largos o conversaciones extensas.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar la degradación introducida por la cuantización respecto al modelo original.
- Requisito de hardware elevado: 100 GiB de pesos efectivos excluyen su uso en estaciones de trabajo convencionales.
- Actualización del checkpoint: la versión del 2026-10-29 sustituye a cuantizaciones anteriores; deben descartarse copias previas para evitar resultados inconsistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Pull request de la mejora oQe: https://github.com/jundot/omlx/pull/4930
- Licencia (archivo en el repositorio): https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp/blob/main/LICENSE
