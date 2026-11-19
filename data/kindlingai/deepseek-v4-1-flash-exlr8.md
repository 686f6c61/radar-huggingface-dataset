# kindlingai/deepseek-v4.1-flash-exlr8

## Resumen

DeepSeek-V4.1-Flash-1017 · exlr8 es una redistribución en formato exlr8 v2 de los pesos oficiales de DeepSeek-V4.1-Flash-1017, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por DeepSeek. La publicación corre a cargo de kindlingai, que empaqueta los pesos oficiales byte a byte y añade codificaciones trellis de 4, 3 y 2 bits por peso para las proyecciones de expertos, de modo que un único repositorio sirve tanto los pesos originales en MXFP4/FP8 como variantes comprimidas seleccionables mediante manifiestos (`native`, `k4`, `k3`).

El objetivo del artefacto es facilitar el despliegue del modelo en clústeres pequeños: el manifiesto `k3` ocupa 425 GB de pesos (222 GB si las tablas Engram se leen de disco) y está dimensionado para dos cajas GB10, mientras que `k4` ocupa 506 GB y `native` carga los pesos oficiales sin recompresión. El repositorio completo pesa 811 GB y el tamaño reportado por Hugging Face es de 839,7 GB.

La relevancia actual reside en la compresión extrema con calidad controlada: las codificaciones trellis de 3 y 4 bits permiten reducir el espacio de los expertos enrutados manteniendo las matrices densas, el router, la torre de visión y las cabeceras en FP8 o BF16. El soporte de motor para las capas trellis está en desarrollo en el repositorio kindlingai/gr8, por lo que la inferencia con los manifiestos comprimidos todavía no es de producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas MTP (multi-token prediction); 40 capas principales + 3 etapas MTP (40-42) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (expertos enrutados), FP8 E4M3 con escala E8M0 por bloque 32×32 (experto compartido), trellis 4 bits (K4, pmcgx), trellis 3 bits (K3, pmcgx/mul1), trellis 2 bits (K2, pmcgx) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con layout exlr8 v2 (índices por capa, slices TP 1-8, manifiestos JSON) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 40 capas principales y tres etapas de predicción multi-token (MTP) numeradas 40 a 42. Cada capa principal contiene expertos enrutados (384 expertos, o 128 en las capas MTP) más un experto compartido, además de tensores de atención, router, Engram y mHC. La torre de visión y el alineador se distribuyen en `dense/exlr8-extra-vision.safetensors`, y las tablas Engram de las capas 1 y 14 se dividen en ficheros independientes para permitir su lectura desde disco.

El empaquetado exlr8 divide cada proyección de experto en unidades de 128 canales intermedios y asigna a cada unidad un propietario fijo para cada tamaño de tensor-parallel, de forma que un nodo descarga solo su parte mediante peticiones HTTP range. El propietario de la unidad u del experto e en la capa L con TP = N es el rango `(18·e + u + L) mod N`. Las slices existen para TP de 1 a 8 en todos los almacenes (`mxfp4`, `fp8b32`, `k2`, `k3`, `k4`). Las codificaciones trellis aplican una rotación Hadamard de 128×128 en ambos lados, signos por capa y escalas por canal y por bloque, todo almacenado en el fichero de índice de la capa. El códec pmcgx es un trellis de pares: dos pesos comparten un estado de 20 bits y cada uno se obtiene como suma de dos mitades fp16 de los productos del estado con los dos multiplicadores, redondeada a FP8 E4M3. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si se aplicaron RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base DeepSeek-V4.1-Flash-1017.
- Procesamiento de visión: el repositorio incluye torre de visión y alineador en `dense/exlr8-extra-vision.safetensors`.
- Predicción multi-token mediante las tres etapas MTP (capas 40-42), orientadas a decodificación especulativa.
- Soporte de expertos enrutados y experto compartido, con enrutamiento por capa.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en clústeres de dos nodos GB10: el manifiesto `k3` está dimensionado explícitamente para dos cajas GB10 con 425 GB de pesos, o 222 GB si las tablas Engram se leen desde disco, lo que permite servir el modelo en hardware de gama workstation sin GPUs de centro de datos.
- Inferencia con tensor-parallel de 1 a 8: las slices `index-slices/tpN/` permiten que cada rango descargue únicamente su parte de los expertos mediante HTTP range requests, adecuado para despliegues distribuidos con ancho de banda limitado.
- Evaluación de cuantización extrema: los manifiestos `k2`, `k3` y `k4` permiten comparar la calidad de codificaciones trellis de 2, 3 y 4 bits frente a los pesos oficiales MXFP4/FP8 en la misma descarga.
- Investigación sobre códecs trellis: el repositorio documenta los códecs pmcgx y mul1 con sus hashes (`pmcgx V2 L20 0xCBAC1FED/0xBCA14C51`, `mul1 0x83DCD12D`), lo que facilita reproducir y auditar el proceso de codificación.
- Flujos con visión: la inclusión de la torre de visión y el alineador permite tareas multimodal de imagen a texto, siempre que el motor de inferencia soporte dichos tensores.
- Decodificación especulativa con MTP: las etapas 40-42 mantienen pesos oficiales MXFP4 y FP8 en el manifiesto `k3`, por lo que pueden usarse como cabezas de predicción anticipada en pipelines de generación acelerada.
- Archivado y distribución de pesos: al conservar todos los encodes y los pesos oficiales en un único repositorio, una sola descarga cubre todos los manifiestos y evita descargas redundantes en equipos con distintas capacidades de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: `native` carga los pesos oficiales (tamaño no desglosado en la información); `k4` ocupa 506 GB; `k3` ocupa 425 GB (222 GB con tablas Engram en disco); el subconjunto `k2` ocupa 14 GB y el repositorio completo 811 GB.
- GPU recomendadas: no disponible de forma explícita; el manifiesto `k3` está dimensionado para dos cajas GB10.
- Cabe en GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: el soporte de motor para las capas trellis está en desarrollo en kindlingai/gr8; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kindlingai/deepseek-v4.1-flash-exlr8 | no disponible | no disponible | MIT | safetensors exlr8 v2 | Redistribución comprimida con trellis 2/3/4 bits |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | no disponible | Pesos oficiales de origen |
| kindlingai/deepseek-v4.1-flash-exlr8-native | no disponible | no disponible | MIT | safetensors exlr8 v2 | Pesos oficiales byte a byte en layout exlr8, sin trellis |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El soporte de motor para las capas trellis está en progreso en kindlingai/gr8; los manifiestos `k2`, `k3` y `k4` no son todavía utilizables en motores de inferencia estándar.
- Ningún manifiesto carga actualmente los ficheros de 2 bits de las capas 8-9 y 38-39, pese a estar incluidos en el repositorio.
- Las capas 8-9 fueron codificadas por voluntarios en quant.kindlingai.dev, lo que introduce un riesgo de inconsistencia de calidad frente a las capas codificadas por el autor.
- El manifiesto `k4` se denominaba `pmcgx-k4` antes del 2026-11-09; scripts y configuraciones antiguas pueden referenciar el nombre obsoleto.
- La compresión trellis de 2 y 3 bits puede degradar la calidad de los expertos enrutados; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni restricciones de uso comercial más allá de la licencia MIT.
- El tamaño del repositorio (811 GB) y las descargas por HTTP range exigen infraestructura de almacenamiento y red considerable.
- La licencia MIT se aplica al empaquetado; conviene verificar los términos de los pesos oficiales de DeepSeek antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kindlingai/deepseek-v4.1-flash-exlr8
- Modelo base en Hugging Face: https://huggingface.co/kindlingai/deepseek-v4.1-flash-exlr8-native
- Pesos oficiales: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Especificación del formato exlr8 v2: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Motor de inferencia gr8: https://github.com/kindlingai/gr8
- Plataforma de cuantización colaborativa: https://quant.kindlingai.dev
