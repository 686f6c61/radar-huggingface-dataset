# fastforks/any2full

## Resumen

Any2Full es un modelo de completado de profundidad (depth completion) de una sola etapa desarrollado por el autor zhiyuandaily y empaquetado para su uso con la librería fastforks. El modelo toma una imagen RGB y un mapa de profundidad disperso de cualquier patrón y densidad, y produce un mapa de profundidad denso. Técnicamente, inyecta tokens de profundidad como prompt en Depth Anything V2, modulando las características del ViT que alimentan la cabeza DPT.

El modelo es relevante porque elimina la necesidad de mapas de profundidad dispersos con patrones fijos (típicos de sensores LiDAR o ToF), aceptando entradas arbitrarias. Existe en tres variantes de tamaño (ViT-S, ViT-B, ViT-L) bajo licencia Apache-2.0, lo que permite uso comercial. Su diseño se apoya en la arquitectura Depth Anything V2 como inicialización, lo que aporta una base sólida de representación visual.

La información pública es limitada: el repositorio de Hugging Face es únicamente una model card sin pesos, y los datos de entrenamiento y el código no se han publicado todavía (referencia a arXiv 2603.05711). Aun así, las especificaciones de inferencia, memoria y paridad numérica están documentadas con detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Depth Anything V2) + cabeza DPT con prompt de profundidad dispersa |
| Parametros totales | no disponible (variantes ViT-S, ViT-B, ViT-L) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de cualquier H x W >= 1) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU); no se documentan otras |
| Idiomas soportados | no disponible (modelo de visión, sin texto) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pth.tar` (PyTorch); no hay GGUF ni safetensors publicados |

## Arquitectura y entrenamiento

Any2Full es un modelo de completado de profundidad de una sola etapa. Parte de un ViT (backbone de Depth Anything V2) y de una cabeza DPT. La innovación principal es la inyección de tokens de profundidad derivados del mapa disperso como prompt: estos tokens modulan las características del ViT que entran en la cabeza DPT, y la disparidad se ajusta al prompt. Esto permite aceptar mapas dispersos de cualquier patrón y densidad, en lugar de los patrones fijos habituales en los métodos previos.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO (no aplica en un modelo de profundidad). La model card indica explícitamente que los datos y el código de entrenamiento no se han publicado (arXiv 2603.05711), y que el ViT y la cabeza parten de Depth Anything V2. Tampoco se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Estimación de profundidad densa a partir de una imagen RGB y un mapa de profundidad disperso de patrón y densidad arbitrarios.
- Salida de profundidad métrica (en metros) o relativa (invariante a escala, afín, afín logarítmica o afín inversa), según el campo `kind`.
- Entrada de tamaño arbitrario H x W >= 1, con redimensionado o padding interno (parche ViT de 14).
- Soporte de intrínsecos de cámara (`model(image, intrinsics=K)`) para modelos métricos que lo requieran.
- Modelos solo de normales (kind `none`) devuelven vectores unitarios de normales en el marco de cámara.
- Backends `portable` y `kernels` para inferencia CUDA.
- Compatibilidad con `torch.compile` y TensorRT fp16 (parcial, con tiempos de compilación largos).

## Casos de uso

- Reconstrucción 3D a partir de LiDAR disperso: el modelo acepta el patrón irregular del sensor y completa la profundidad densa para generar nubes de puntos completas en pipelines de mapas 3D.
- Robótica y navegación autónoma: fusión de una cámara RGB con un sensor de profundidad de baja densidad (ToF o LiDAR) para obtener mapas de profundidad densos en tiempo real; con `any2full-s` a 12,4 ms por imagen en 994x1482 sobre RTX 5060 Ti.
- Realidad aumentada: completar la profundidad a partir de sensores dispersos de dispositivos móviles para oclusión y colocación de objetos virtuales con coherencia métrica.
- Inspección industrial y metrología: uso de la variante métrica con intrínsecos de cámara para medir distancias en escenas capturadas con mapas dispersos calibrados.
- Generación de datasets sintéticos: completar mapas de profundidad dispersos procedentes de simuladores para entrenar otros modelos de percepción.
- Automoción: completar la profundidad de un LiDAR de baja densidad para detección de obstáculos y planificación de trayectorias en vehículos autónomos.
- Edición de vídeo y postproducción: extracción de profundidad densa a partir de imágenes con mapas dispersos para efectos de desenfoque o composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (RMSE, etc.) en la información disponible. La model card sí documenta métricas de velocidad, memoria y paridad numérica:

| Modelo | Entrada | Tiempo portable (ms) | Memoria pico portable (MiB alloc / reserved) |
|---|---|---|---|
| any2full-b | 994x1482 | 26,8 | 538 / 596 |
| any2full-l | 994x1482 | 67,7 | 1178 / 1250 |
| any2full-s | 994x1482 | 12,4 | 274 / 312 |

Paridad con el código original: en CPU y float32, max |diff| <= 0,005; en GPU y float16, error medio <= 1,5 % y p99 <= 5 % del valor mediano de referencia.

## Requisitos de hardware

- VRAM estimada: `any2full-s` ~0,3 GiB pico a 994x1482; `any2full-b` ~0,6 GiB; `any2full-l` ~1,3 GiB (medido en RTX 5060 Ti 16 GB, fp16).
- A 3000x4000: `any2full-s` 0,6 GiB reservados; `any2full-b` 0,9 GiB; `any2full-l` 1,3 GiB.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GiB de VRAM para las variantes pequeñas; RTX 4090, A100 o H100 para lotes grandes o alta resolución.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 5060 Ti y superiores.
- Opciones de despliegue: librería fastforks (backends `portable` y `kernels`), `torch.compile`, TensorRT fp16 (build lento, >5 min en algunos casos). No se documenta soporte de vLLM, llama.cpp ni Ollama (no aplica a un modelo de visión).
- Latencia: 12,4 ms (`s`), 26,8 ms (`b`), 67,7 ms (`l`) por imagen a 994x1482 en RTX 5060 Ti; `torch.compile` reduce a 24,2 ms (`b`) y 63,8 ms (`l`).
- Tiempo de carga: 0,31 s (`s`), 6,38 s (`b`), 1,45 s (`l`); primera llamada: 0,36 s (`s`), 3,34 s (`b`), 0,30 s (`l`).

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto/entrada | Licencia | Completado con profundidad dispersa |
|---|---|---|---|---|---|
| Any2Full (s/b/l) | Depth completion | ViT-S/B/L | H x W arbitrario | Apache-2.0 | Sí, patrón y densidad arbitrarios |
| Depth Anything V2 | Monocular depth | ViT-S/B/L/G | Resolución variable | Apache-2.0 (según variante) | No (solo imagen RGB) |
| CompleteDPT / métodos previos | Depth completion | no disponible | Patrones fijos | no disponible | Sí, patrones fijos |
| UniDepth v2 | Monocular depth métrico | ViT-L/14 | Resolución variable | no disponible | No |

No se dispone de datos de precisión comparativos entre Any2Full y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card está truncada en la sección de limitaciones; no se detallan los sesgos conocidos ni el riesgo de alucinación de profundidad.
- Los datos de entrenamiento y el código no se han publicado (arXiv 2603.05711), lo que dificulta la reproducibilidad y la auditoría.
- El repositorio de Hugging Face no contiene pesos: solo una model card; los pesos se descargan de enlaces externos del autor y se verifican por SHA-256.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte que es un paquete de uso de investigación y que deben revisarse las cadenas de licencia originales antes de otros usos.
- Sin información sobre sesgos por tipo de escena, condiciones de iluminación o dominios de entrenamiento.
- La salida relativa (invariante a escala o afín) no está en metros; solo las variantes métricas con intrínsecos correctos producen distancias absolutas.
- El soporte de TensorRT está diferido en algunos casos (build >5 min), lo que limita el despliegue en producción con esa ruta.
- Tier experimental: no se recomienda para producción crítica sin validación adicional.

## Enlaces

- Hugging Face (model card): https://huggingface.co/fastforks/any2full
- Pesos del autor: https://huggingface.co/zhiyuandaily/Any2Full
- Código original: https://github.com/zhiyuandaily/Any2Full (commit `780edf6`)
- Librería fastforks: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/any2full/card.toml
- Paper: arXiv 2603.05711
