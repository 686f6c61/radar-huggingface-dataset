# devin-lai/Hi3Dv1.0-mlx-fp16

## Resumen

Hi3Dv1.0-mlx-fp16 es una conversión a MLX (el framework de Apple para ejecución en silicio de Apple) del modelo Hi3Dv1.0, un sistema de generación y refinado de geometría 3D a partir de una imagen de referencia y una malla gruesa ("coarse mesh") ya existente. Lo publica devin-lai como adaptación del checkpoint original de hi3d-official, manteniendo intactos los bytes de los pesos del transformer y añadiendo un runtime específico para Apple Silicon. No es un modelo de lenguaje: su pipeline es de tipo image-to-3d con una etapa de refinamiento geométrico.

La relevancia práctica está en que permite ejecutar el refinado de mallas 3D en hardware de consumo de Apple (el autor cita un Apple M5 con 32 GiB y MLX 0.32.4 como entorno de referencia), sin necesidad de GPU NVIDIA ni de pasos de conversión manual. El repositorio incluye checkpoints mixtos FP16/FP32 (torso en FP16 con tensores sensibles retenidos en FP32) y un VAE compartido en FP32, con variantes selectivas de descarga según la resolución objetivo: 512³ (3,77 GiB) o 1024³/1536³ (7,20 GiB).

Es importante subrayar que el modelo requiere obligatoriamente dos entradas: una imagen de referencia y una malla gruesa previa. No genera geometría desde cero a partir de una sola imagen; refina una malla existente. Los resultados publicados son exclusivamente de geometría, y la licencia es la Hi3D Open License Agreement v1.0, no una licencia permisiva estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de refinamiento geométrico con VAE (detalles de capas y atención no disponibles); pipeline image-to-3d |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | FP16 mixto con tensores sensibles en FP32; VAE compartido en FP32; no se documentan otras cuantizaciones (INT8, INT4, GGUF) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Hi3D Open License Agreement v1.0 (license: other) |
| Formato de pesos | safetensors (MLX) |
| Tamano del repo | 7,4 GB |
| Resoluciones soportadas | 512³, 1024³, 1536³ (esta última reutiliza transformer_1024) |
| Framework | MLX (requiere runtime hi3d-mlx; mlx-lm genérico no implementa el pipeline) |
| Modelo base | hi3d-official/Hi3Dv1.0 |

## Arquitectura y entrenamiento

La información disponible describe un transformer con un VAE asociado, empaquetado en precisión mixta: el torso del transformer se sirve en FP16 mientras que los tensores considerados sensibles se mantienen en FP32, y el VAE compartido se ejecuta por defecto en FP32. El checkpoint de 1536³ no es un modelo independiente: reutiliza el transformer de 1024, por lo que la resolución de salida no implica un recuento de caras fijo. No se detallan en la información proporcionada el número de capas, la dimensión de los embeddings, el mecanismo de atención ni el esquema de difusión o de refinamiento iterativo empleado.

Tampoco se especifican el volumen de datos de entrenamiento, la composición del dataset 3D, ni si hubo etapas de ajuste fino con preferencias humanas (RLHF/DPO). Lo que sí se documenta es que los bytes del checkpoint del transformer son idénticos a los del release original de Hi3D, es decir, esta publicación es una adaptación de runtime, no un reentrenamiento. Los componentes compartidos (VAE en FP32, configuraciones y encoders de imagen fijados) se resuelven desde el repositorio Hi3Dv1.0-mlx-shared, no desde este repositorio.

## Capacidades

- Refinamiento de geometría 3D: toma una imagen de referencia y una malla gruesa y produce una malla refinada en formato GLB.
- Generación de mallas a múltiples resoluciones de rejilla: 512³, 1024³ y 1536³.
- Ejecución nativa en Apple Silicon mediante MLX, con CLI dedicada (`hi3d-mlx refine`).
- Descarga selectiva por variante y resolución, con soporte de modo offline (`--local-files-only`).
- Integración con encoders de imagen fijados por el runtime (no se detalla cuáles).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general, audio ni modo "thinking".

## Casos de uso

- Refinado de assets para videojuegos en estaciones de trabajo Mac: un artista parte de una malla gruesa generada por una herramienta de fotogrametría o de un modelo generativo previo y usa `hi3d-mlx refine` para aumentar el detalle geométrico antes de importar el GLB al motor.
- Prototipado rápido de productos en macOS: a partir de una foto de referencia y un bloque base, obtener una malla refinada a 512³ para revisiones de forma en equipo, aprovechando que la variante de 512³ ocupa solo 3,77 GiB de checkpoint.
- Pipeline de escaneo 3D doméstico: combinar captura fotográfica con una reconstrucción gruesa y aplicar el refinado a 1024³ en un Mac con 32 GiB, evitando depender de GPUs NVIDIA.
- Investigación en reconstrucción 3D: usar el modelo como etapa de comparación en experimentos de refinamiento geométrico, dado que el autor publica resultados y metodología de benchmark en un dataset aparte.
- Docencia y demos de MLX: ilustrar un pipeline de inferencia no lingüístico en Apple Silicon, con descarga selectiva y ejecución offline reproducible.
- Automatización batch local: descargar una vez la variante necesaria con `hi3d-mlx download` y procesar lotes de pares imagen-malla en un equipo Apple sin conexión, añadiendo `--local-files-only`.
- Validación de mallas antes de impresión 3D: refinar y revisar geometría a 1536³ reutilizando el transformer de 1024 para inspección de detalle superficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite a una metodología (`BENCHMARKS.md`) y a un dataset de resultados (`Hi3Dv1.0-mlx-results`), pero las cifras concretas no están incluidas en los datos proporcionados. La cohorte histórica citada emplea Apple M5, 32 GiB de memoria y MLX 0.32.4; los resultados son exclusivamente de geometría.

## Requisitos de hardware

- Checkpoint de 512³: 3,77 GiB (transformer + VAE compartido).
- Checkpoint de 1024³/1536³: 7,20 GiB (transformer + VAE compartido).
- Estos tamaños son de checkpoint, no de memoria en ejecución: hay que sumar encoders de imagen y dependencias de Python.
- Entorno de referencia del autor: Apple M5 con 32 GiB de memoria unificada y MLX 0.32.4.
- No se documenta soporte para GPU NVIDIA (A100, H100) ni RTX 4090; el runtime es específico de MLX y Apple Silicon.
- Despliegue: CLI `hi3d-mlx` (comandos `refine` y `download`); los cargadores genéricos de `mlx-lm` no implementan este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Resoluciones | Framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hi3Dv1.0-mlx-fp16 | Refinamiento geométrico image-to-3d | Imagen + malla gruesa | 512³, 1024³, 1536³ | MLX (Apple Silicon) | Hi3D Open License v1.0 | Hugging Face (0 descargas) |
| Hi3Dv1.0 (original) | Refinamiento geométrico image-to-3d | Imagen + malla gruesa | no disponible en la información | no disponible | Hi3D Open License v1.0 | Hugging Face (hi3d-official) |
| Otras alternativas image-to-3d | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Requiere dos entradas obligatorias (imagen de referencia y malla gruesa); no genera geometría desde cero.
- Los resultados publicados cubren solo geometría, no color, texturas ni materiales.
- La resolución 1536³ reutiliza el transformer de 1024 y no implica un recuento de caras fijo; puede no aportar detalle real adicional.
- El runtime es específico de MLX y Apple Silicon; no hay soporte documentado para CUDA, ROCm ni otros backends.
- Los cargadores genéricos de `mlx-lm` no funcionan con este pipeline; es necesario usar la CLI `hi3d-mlx`.
- Licencia Hi3D Open License Agreement v1.0: no es MIT ni Apache; deben revisarse las condiciones antes de uso comercial. El autor no afirma licencia permisiva alguna sobre el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.
- No se documentan sesgos, tasas de alucinación geométrica ni métricas de error de reconstrucción.
- El tamaño de checkpoint no equivale al consumo de memoria en ejecución; en equipos con menos de 32 GiB puede haber problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-fp16
- Runtime y guía de instalación: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx
- Componentes compartidos: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-shared
- Resultados registrados: https://huggingface.co/datasets/devin-lai/Hi3Dv1.0-mlx-results
- Metodología de benchmark: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx/blob/main/BENCHMARKS.md
- Licencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-fp16/blob/v1.0.0/LICENSE
- Modelo base: https://huggingface.co/hi3d-official/Hi3Dv1.0
