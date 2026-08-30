# airagrp/Qwen3.8-27B-mlx-mxfp8-M

## Resumen

El modelo `airagrp/Qwen3.8-27B-mlx-mxfp8-M` es una conversión a formato MLX de `Qwen/Qwen3.8-27B`, el último modelo multimodal denso de código abierto de Alibaba. La conversión, realizada por el usuario `airagrp`, aplica una receta de cuantización mixta en precisión mxfp8 sobre las capas de MLP y atención, manteniendo el resto de módulos en bfloat16. El objetivo es reducir el peso del modelo de aproximadamente 54 GB (bf16) a unos 32 GB efectivos, permitiendo su ejecución en Apple Silicon con menos memoria unificada.

El modelo es multimodal (imagen, vídeo y texto) e incorpora una cabeza MTP (Multi-Token Prediction) fusionada en el checkpoint para decodificación especulativa. Está pensado para desarrolladores e investigadores que trabajan en ecosistemas Apple (MLX) y necesitan un modelo multimodal de alto rendimiento con un footprint de memoria reducido. La licencia Apache-2.0 permite uso comercial sin restricciones.

Aunque el nombre del modelo indica 27B, el conteo de parámetros extraído de los safetensors del repositorio arroja 10.183.245.488 parámetros; esta discrepancia puede deberse a cómo se contabilizan los tensores cuantizados o a la estructura interna del modelo base, por lo que se recomienda verificar antes de asumir el tamaño real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención lineal GDN y cabeza MTP |
| Parametros totales | 10.183.245.488 (según safetensors del repo; el nombre indica 27B, discrepancia a verificar) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mxfp8 (group_size=32, bits=8) en MLP (64 capas) y atención (16 capas completas + 48 capas de atención GDN); bfloat16 en embeddings, output head, MTP y vision tower |
| Idiomas soportados | Inglés (según etiqueta del repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` separado para la cabeza MTP |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer multimodal denso desarrollado por Alibaba, con una torre de visión integrada y una variante de atención lineal denominada GDN (no se dispone de más detalles técnicos sobre esta atención en la información proporcionada). La conversión a MLX no implica un reentrenamiento: se parte del checkpoint original en bfloat16 y se aplica una cuantización mixta en mxfp8 con group_size de 32 y 8 bits a las proyecciones de MLP (`gate_proj`, `up_proj`, `down_proj`) y a las capas de atención (tanto las completas como las de atención lineal GDN). Los embeddings, la cabeza de salida, la cabeza MTP y la torre de visión se mantienen en bfloat16 para preservar la precisión en estas partes críticas.

El checkpoint incluye la cabeza MTP fusionada como tensores `language_model.mtp.*` (15 tensores en bfloat16), lo que permite usarla para decodificación especulativa con `--draft-kind mtp` en mlx-vlm, sin necesidad de un modelo drafter separado. La conversión se realizó con la librería `mlx-vlm` versión 0.6.17, y el tamaño efectivo resultante es de ~32 GB (9.2 bits por peso), frente a los ~54 GB del modelo original en bfloat16.

## Capacidades

- Generación de texto multimodal: acepta imágenes, vídeo y texto como entrada, y produce respuestas de texto.
- Razonamiento y resolución de problemas complejos, incluidos problemas de código y matemáticas (según las capacidades declaradas del modelo base).
- Soporte de tool calling y function calling, lo que permite integrarlo en flujos de agentes.
- Capacidades de agente y multi-step reasoning, adecuado para automatización de oficina y flujos de trabajo agénticos.
- Soporte de decodificación especulativa mediante la cabeza MTP integrada, acelerando la generación sin modelos drafter externos.
- Capacidades multilingües potenciales del modelo base, aunque el repo etiqueta únicamente inglés.

## Casos de uso

- Automatización de oficina: el modelo puede procesar documentos, hojas de cálculo y presentaciones (entrada de imagen) y generar resúmenes, extraer datos o redactar respuestas, gracias a su capacidad multimodal y de razonamiento.
- Generación y revisión de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, ejecutándose localmente en Macs con MLX.
- Asistentes de atención al cliente: puede gestionar conversaciones multi-turno con contexto largo (aunque la longitud exacta no está disponible) y responder a consultas que incluyan capturas de pantalla o imágenes de productos.
- Análisis de imágenes y vídeo: útil para tareas de descripción de contenido visual, moderación de imágenes o extracción de información de vídeos en entornos donde se requiera privacidad (inferencia local).
- Prototipado de agentes multimodales: combinando visión, texto y tool calling, se pueden construir agentes que interactúan con interfaces gráficas o que procesan información visual para tomar decisiones.
- Despliegue en hardware Apple con memoria limitada: al ocupar ~32 GB, es viable en Macs con 64 GB de RAM unificada, permitiendo inferencia local sin depender de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX en la información disponible. El modelo base `Qwen3.8-27B` cuenta con benchmarks publicados en su model card original, pero no se incluyen aquí. Se recomienda consultar el repositorio oficial de Qwen para datos de rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- El formato MLX está diseñado exclusivamente para Apple Silicon (chips M-series).
- Uso de memoria estimado: ~32 GB de RAM unificada para cargar el modelo en mxfp8 (según el tamaño efectivo declarado). Se recomienda un Mac con al menos 64 GB de RAM unificada para dejar margen al sistema operativo y a los tensores temporales durante la generación.
- GPU recomendada: cualquier chip M-series con suficiente RAM unificada; el benchmark de oMLX muestra ejecución en un M5 Max (40 núcleos), lo que indica que es viable en hardware de gama alta.
- No es compatible con GPUs NVIDIA o AMD, ya que MLX es un framework específico de Apple.
- Opciones de despliegue: `mlx-vlm` para inferencia multimodal (carga y generación), o uso directo con la librería MLX estándar.
- Latencia y throughput: no disponibles. El benchmark de oMLX (M5 Max) no proporciona cifras concretas en la información recopilada.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño efectivo | Parámetros | Cuantización | Licencia |
|---|---|---|---|---|---|
| `airagrp/Qwen3.8-27B-mlx-mxfp8-M` | MLX | ~32 GB | 10.18B (según safetensors) | Mixta mxfp8 + bf16 | Apache-2.0 |
| `emee-ai/Qwen3.8-27B-mxfp8` | Desconocido (probablemente safetensors estándar) | No disponible | No disponible | mxfp8 uniforme | Apache-2.0 |
| `Qwen/Qwen3.8-27B` (base) | safetensors | ~54 GB (bf16) | 27B (según nombre) | Sin cuantizar | Apache-2.0 |

La principal diferencia entre la conversión de `airagrp` y la de `emee-ai` es la receta de cuantización mixta: la primera aplica mxfp8 solo a capas seleccionadas y mantiene bf16 en embeddings, head y vision tower, mientras que la segunda aplica mxfp8 de forma uniforme. Esto puede traducirse en una mejor preservación de la calidad en las partes sensibles, a costa de un tamaño ligeramente mayor. No se dispone de benchmarks comparativos entre ambas versiones.

## Limitaciones y advertencias

- Conversión de terceros: no es un checkpoint oficial de Alibaba; la receta de cuantización puede introducir degradaciones de precisión no documentadas en el modelo original.
- La discrepancia entre el nombre del modelo (27B) y el conteo real de parámetros (10.18B) debe aclararse antes de usar el modelo en entornos críticos; podría deberse a cómo se contabilizan los tensores cuantizados o a una extracción incompleta.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda validar las salidas en aplicaciones de producción.
- Idioma etiquetado únicamente como inglés; aunque el modelo base podría soportar más idiomas, la conversión no garantiza su correcto funcionamiento en otros lenguajes.
- Limitación de hardware: solo ejecutable en Apple Silicon, lo que excluye entornos de servidor con GPUs NVIDIA.
- La cuantización mxfp8 con group_size de 32 puede afectar a la precisión en tareas de alta sensibilidad numérica (por ejemplo, matemáticas o código), aunque se mantienen bf16 en las capas críticas.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe revisar los términos del modelo base original para asegurarse de que no hay restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-mxfp8-M
- Colección de airagrp: https://huggingface.co/collections/airagrp/qwen38-27b-mixed-precision
- Modelo base (Qwen/Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Repositorio de Qwen3.8-27B en GitHub (AlibabaCloud-Official): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Benchmark oMLX en M5 Max: https://omlx.ai/benchmarks/performance/m07164l6
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
