# bambocher/Qwen3.5-2B-heretic-oQ5-mtp

## Resumen

Qwen3.5-2B-heretic-oQ5-mtp es una cuantización en formato MLX del modelo Qwen3.5-2B de Alibaba Qwen, publicada por el usuario bambocher. Se trata de una variante "decensored" (ablacionada para eliminar rechazos) generada con la herramienta Heretic v2.0.0 y posteriormente cuantizada con oMLX v0.7.3 mediante cuantización de precisión mixta (oQ). El checkpoint conserva la cabeza de predicción multi-token (MTP) del modelo original, lo que lo hace relevante para decodificación especulativa en hardware Apple Silicon.

El modelo tiene 2.274 millones de parámetros totales y un tamaño de repositorio de 2,1 GB. La cuantización resultante tiene una media efectiva de 7,236 bits por peso, combinando capas en 5, 6 y 8 bits con grupos de 64, además de un 14,97 % de pesos que permanecen en BF16. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (1,882B parámetros), un codificador visual (0,331B parámetros) y la cabeza MTP (0,061B parámetros).

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de cuantización de precisión mixta orientada a MLX con preservación de la cabeza MTP; por otro, ilustra el pipeline Heretic de ablación de comportamiento (eliminación de rechazos) aplicado a un modelo multimodal pequeño. No obstante, la información pública disponible es muy limitada: no hay model card del modelo base incluida, ni datos de benchmarks, ni especificaciones de contexto o licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal con vision encoder y cabeza MTP; detalles no disponibles |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 5-bit (grupo 64), affine 6-bit (grupo 64), affine 8-bit (grupo 64) y BF16; media efectiva 7,236 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), libreria mlx |

Desglose de la cuantizacion (datos de la model card):

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 5-bit, grupo 64 | 1,688B | 74,227 % | 1,081 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,182B | 7,990 % | 0,137 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,064B | 2,816 % | 0,063 GiB | 8,50 |
| BF16 | 0,340B | 14,967 % | 0,634 GiB | 16,00 |
| **Total** | **2,274B** | **100 %** | **1,916 GiB** | **7,236** |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1,882B | 1,341 GB / 1,249 GiB |
| Vision | 0,331B | 0,663 GB / 0,617 GiB |
| Cabeza MTP | 0,061B | 0,053 GB / 0,049 GiB |
| **Total** | **2,274B** | **2,057 GB / 1,916 GiB** |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5-2B, un transformer multimodal que incorpora un codificador visual (0,331B parámetros) y una cabeza de predicción multi-token (MTP, 0,061B parámetros). La cabeza MTP se conserva intacta en este checkpoint, lo que permite su uso para decodificación especulativa o para esquemas de generación multi-token en MLX. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO.

Sobre el modelo base se aplicó Heretic v2.0.0, una técnica de ablación de comportamiento basada en "Arbitrary-Rank Ablation" (ARA). Los parámetros ARA documentados son: `start_layer_index` = 12, `end_layer_index` = 23, `preserve_good_behavior_weight` = 0,9189, `steer_bad_behavior_weight` = 0,0008, `overcorrect_relative_weight` = 0,9924 y `neighbor_count` = 14. El objetivo es reducir la tasa de rechazos (refusals) preservando el comportamiento útil. Según la model card, el modelo original rechazaba 97 de cada 100 peticiones en la evaluación del autor, mientras que esta variante presenta 0 rechazos en 100, con una divergencia KL de 0,1397 respecto al original.

Posteriormente, el checkpoint se cuantizó con oMLX v0.7.3 usando cuantización de precisión mixta (oQ), que asigna distintos anchos de bits por tensor (5, 6, 8 bits o BF16) según su sensibilidad. La media efectiva es de 7,236 bits por peso. La model card indica que la versión actual fue re-cuantizada el 2026-11-12 y recomienda volver a descargar copias anteriores.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-2B (no se detallan en la información disponible).
- Procesamiento visual: el checkpoint incluye un codificador de visión de 0,331B parámetros, por lo que se espera soporte de entrada de imágenes, aunque no se documentan las tareas concretas.
- Predicción multi-token (MTP): la cabeza MTP se conserva intacta, habilitando decodificación especulativa o generación multi-token en MLX.
- Comportamiento "decensored": la ablación ARA elimina prácticamente los rechazos (0/100 según la model card), lo que cambia el perfil de respuesta en temas sensibles.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: al estar en formato MLX, el modelo está pensado para ejecutarse con la librería `mlx` en Macs con chip Apple (M1/M2/M3/M4). Su tamaño de 1,916 GiB permite cargarlo en equipos con 16 GB de memoria unificada o superiores, dejando margen para el contexto y el codificador visual.
- Decodificación especulativa con MTP: la cabeza MTP conservada permite implementar esquemas de generación multi-token que reducen la latencia en inferencia autoregresiva, especialmente útil en aplicaciones interactivas en local.
- Prototipado de pipelines multimodales: al incluir un codificador visual, sirve para experimentar con tareas imagen-texto en local sin depender de APIs externas, aunque las capacidades exactas no están documentadas.
- Investigación sobre ablación de comportamiento: el checkpoint es un caso de estudio reproducible de Heretic v2.0.0 y ARA, útil para estudiar el equilibrio entre eliminación de rechazos y preservación de comportamiento (KL de 0,1397).
- Evaluación de cuantización de precisión mixta: el desglose por tensor (5/6/8 bits y BF16) permite analizar el impacto de oQ en calidad y tamaño frente a cuantizaciones uniformes.
- Experimentación con modelos pequeños "sin filtros": para investigadores que necesitan un modelo de 2B con comportamiento de rechazo mínimo en entornos controlados y locales.

## Benchmarks y rendimiento

La model card solo reporta métricas del pipeline Heretic, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-2B) |
|---|---|---|
| Rechazos (refusals) | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,92 GiB para los pesos en el formato cuantizado, más overhead de contexto y del runtime MLX. En la práctica, se recomienda al menos 8 GB de memoria unificada para contexto corto y 16 GB para contextos más largos.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es directamente compatible con CUDA sin conversión.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con chip Apple de gama media o superior; el tamaño de 1,916 GiB es muy reducido. En GPUs NVIDIA de consumo requeriría reconvertir los pesos a otro formato (no incluido en el repo).
- Opciones de despliegue: `mlx` (librería nativa), `mlx-lm` para generación de texto y herramientas del ecosistema oMLX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-oQ5-mtp | 2,274B | no disponible | no disponible | MLX safetensors | Cuantización mixta oQ, MTP intacta, decensored |
| Qwen/Qwen3.5-2B (original) | ~2,27B | no disponible | no disponible | safetensors | Modelo base sin ablación; 97/100 rechazos según el autor |
| Otras cuantizaciones MLX de Qwen3.5-2B | ~2,27B | no disponible | no disponible | MLX | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes (p. ej., Llama 3.2 1B/3B, Gemma 2 2B) en términos de benchmarks, ya que no se han publicado resultados para este checkpoint.

## Limitaciones y advertencias

- Ausencia de datos de licencia: la model card no especifica licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Qwen/Qwen3.5-2B antes de cualquier uso en producción.
- Modelo "decensored": la ablación Heretic elimina los rechazos, lo que implica que el modelo puede generar contenido que el original bloquearía. Esto supone un riesgo relevante en despliegues públicos o sin moderación adicional.
- Divergencia KL de 0,1397 respecto al original: indica un cambio medible en la distribución de salida; puede afectar a la calidad en tareas generales, no solo en las relacionadas con rechazos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un modelo de 2B, el riesgo de alucinación es inherentemente mayor que en modelos grandes.
- Contexto e idiomas no documentados: se desconoce la longitud de contexto soportada y la cobertura idiomática real; no se debe asumir soporte multilingüe sin verificación.
- Formato específico de plataforma: los pesos están en MLX, por lo que no son directamente utilizables en CUDA, ROCm ni en la mayoría de runtimes de servidor. Requiere conversión para otros entornos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de validación por la comunidad.
- Fecha de creación anómala (2026-11-12): conviene verificar la integridad y procedencia del checkpoint antes de usarlo en entornos críticos.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval ni GSM8K que permitan estimar la degradación introducida por la cuantización mixta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ5-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic (proyecto de ablación): https://heretic-project.org
- oMLX / oQ (herramienta de cuantización): https://github.com/jundot/omlx
