# liran12345/h3-turbo-diffusion

## Resumen

H3 Turbo Diffusion es un checkpoint derivado de MiniMax-H3, el modelo de generación de vídeo con audio sincronizado desarrollado por MiniMax. Lo publica el usuario independiente liran12345 y consiste en los pesos completos del transformer DiT en BF16 resultantes de un proceso de destilación DMD (Distribution Matching Distillation) sobre la variante FL2VA (first-last frame to video with audio) del modelo base. No es un LoRA ni una aproximación fusionada: son los 34 shards originales del checkpoint DMD, subidos sin reserialización y preservando las precisiones originales (626 tensores en BF16 y 12 tensores de entrada/salida y time-embedding en FP32).

El modelo resuelve el problema de la latencia en generación de vídeo con audio: frente al muestreo de muchos pasos del FL2VA original, este checkpoint permite generar vídeo con audio sincronizado en cinco puntos sigma, es decir, cuatro actualizaciones de denoising en el runtime de H3, con un schedule verificado de `video_shift 12.0` y `audio_shift 3.0`. Con 33.122.992.896 parámetros (unos 61,73 GiB en BF16), es un modelo grande que requiere infraestructura de GPU de数据中心 y no está pensado para ejecución en hardware de consumo.

Es relevante ahora porque reduce drásticamente el coste de inferencia de un modelo de vídeo-audio de última generación, y porque incluye la tabla AdaLN exacta del schedule DMD, la configuración de referencia del runtime H3 y un manifiesto con checksums SHA256. Conviene subrayar que es un derivado independiente, no una release oficial de MiniMax, y que su licencia impone restricciones territoriales severas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT 3D (clase `MiniMaxH3Transformer3DModel`), destilado con DMD |
| Parametros totales | 33.122.992.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo; export W8A8 opcional generado localmente con TurboDiffusion |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (34 shards, BF16 + 12 tensores FP32), config e index en `transformer/` |
| Tamano del repo | 66,4 GB (pesos del transformer ~61,73 GiB) |
| Modelo base | MiniMaxAI/MiniMax-H3 (finetune) |
| Pipeline | image-text-to-video / image-to-video con audio |
| Pasos de inferencia | 5 sigma points = 4 actualizaciones de denoising |

## Arquitectura y entrenamiento

La arquitectura es un transformer DiT (Diffusion Transformer) tridimensional orientado a la generación conjunta de vídeo y audio, heredado de MiniMax-H3 en su variante FL2VA. Sobre ese modelo base se ha aplicado destilación DMD, una técnica de destilación por matching de distribuciones que colapsa el muestreo multi-paso en un schedule de muy pocos pasos. El resultado es un checkpoint con los mismos 33.122 millones de parámetros, pero capaz de operar con cuatro actualizaciones de denoising en lugar de las decenas habituales en modelos de difusión de vídeo.

El detalle técnico clave es la tabla AdaLN (`adaln/adaln_i2va_s5_v12_a3.safetensors`), que codifica el condicionamiento de timestep específico para esta combinación de pesos, tarea `i2va` y shifts (`video_shift 12.0`, `audio_shift 3.0`). Esa tabla no es reutilizable con otros schedules. El checkpoint conserva las precisiones originales: 626 tensores en BF16 y 12 tensores de entrada/salida y time-embedding en FP32 (unos 66 MiB). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens de vídeo o el proceso de destilación más allá de la mención a DMD. La evaluación funcional del autor se limita a cinco casos de prueba I2VA a 768p.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con audio sincronizado.
- Generación image-text-to-video, según el pipeline declarado en el repo.
- Condicionamiento por primer y último fotograma (herencia de FL2VA).
- Schedule de inferencia ultrarrápido: 5 sigma points, 4 actualizaciones de denoising.
- Export opcional a W8A8 INT8 para integración con TurboDiffusion.
- Soporte de Sparge top-k 0.5, SP8 y CPU block offload en la configuración de referencia.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles.

## Casos de uso

- **Generación rápida de clips para previsualización creativa**: con solo cuatro actualizaciones de denoising, el modelo permite iterar bocetos de vídeo con audio en segundos o pocos minutos según GPU, adecuado para equipos de diseño que necesitan explorar variantes antes de un render final de mayor calidad.
- **Animación de storyboards a partir de una imagen clave**: dado un fotograma inicial, el modelo genera el clip animado con pista de audio sincronizada, útil en preproducción audiovisual para validar ritmo y montaje.
- **Prototipado de anuncios con audio integrado**: la generación conjunta de vídeo y audio evita pipelines separados de TTS y música, simplificando la producción de variantes publicitarias cortas.
- **Investigación en destilación de modelos de difusión**: el checkpoint y su tabla AdaLN documentada sirven como referencia reproducible para estudiar DMD aplicado a modelos de vídeo-audio de gran escala.
- **Evaluación de integración con TurboDiffusion**: el export W8A8 permite medir el impacto de la cuantización INT8 en calidad y throughput dentro de un runtime H3 existente, sin necesidad de fusionar LoRAs.
- **Generación de material sintético para datasets de vídeo**: útil para aumentar corpus de entrenamiento de modelos de percepción, siempre que se respeten las condiciones de la licencia y se identifique el contenido como generado por IA.
- **Demos interactivas de image-to-video**: al requerir pocos pasos, encaja en aplicaciones donde el usuario sube una imagen y recibe un clip corto con audio en una latencia tolerable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona una evaluación funcional con cinco casos de prueba I2VA a 768p, sin métricas cuantitativas de calidad, FVD, sincronización audio-vídeo ni comparación con el FL2VA original.

## Requisitos de hardware

- **VRAM estimada**: los pesos en BF16 ocupan unos 61,73 GiB, por lo que la inferencia requiere al menos 80 GB de VRAM en una sola GPU, o bien sharding con SP8 y CPU block offload para repartir carga.
- **GPU recomendadas**: H100 80 GB, A100 80 GB, o configuraciones multi-GPU con paralelismo de secuencia (SP8) para repartir el transformer.
- **Consumer GPU**: no cabe en GPUs de consumo (RTX 4090 24 GB, RTX 5090 32 GB) sin offload agresivo a CPU, lo que degradaría gravemente la latencia.
- **Opciones de despliegue**: runtime H3 propietario con loader DMD de Diffusers; export W8A8 con TurboDiffusion y sus operadores CUDA; no es un bundle `DiffusionPipeline.from_pretrained` autónomo.
- **Componentes adicionales**: el text encoder, los VAE de vídeo y audio, el tokenizer y el resto de componentes de H3 no están incluidos y deben obtenerse de MiniMaxAI/MiniMax-H3.
- **Latencia y throughput**: no disponibles; dependen del hardware, del uso de Sparge, SP8 y del VAE INT8 opcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| H3 Turbo Diffusion (este) | 33,1 B | 5 sigma points (4 updates) | MiniMax H3 Community License | HuggingFace, repo independiente |
| MiniMaxAI/MiniMax-H3 (FL2VA) | no disponible | muestreo multi-paso | MiniMax H3 Community License | HuggingFace, oficial |
| Modelos de vídeo-audio de otros laboratorios | no disponible | no disponible | varía | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación relevante es interna: este checkpoint reduce el número de pasos frente al FL2VA original a costa de una posible pérdida de calidad que el autor no cuantifica.

## Limitaciones y advertencias

- **Licencia restrictiva**: la MiniMax H3 Community License Agreement excluye territorios como la UE, el Reino Unido, Corea del Sur y Estados Unidos; revisar el LICENSE completo antes de descargar, usar o redistribuir. No es MIT ni la licencia del código de TurboDiffusion.
- **Identificación obligatoria de contenido**: los términos upstream exigen marcar las salidas como generadas por IA.
- **Derivado no oficial**: es un trabajo independiente, sin respaldo de MiniMax; no hay garantía de paridad sin pérdidas con el FL2VA original.
- **Evaluación insuficiente**: solo cinco casos de prueba a 768p; no hay evaluación de seguridad, sesgos ni calidad de audio.
- **No es autónomo**: requiere el runtime H3, el text encoder, los VAE y el tokenizer del modelo base, además de dependencias de TurboDiffusion para el export W8A8.
- **Riesgo de alucinación visual**: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales y desincronización audio-vídeo.
- **Cuantización W8A8**: puede alterar los resultados generados; el transformer subido permanece sin cuantizar.
- **Sesgos**: no disponibles; no se ha publicado análisis de sesgos del modelo base ni de este derivado.
- **Idiomas**: no disponibles; el condicionamiento textual depende del text encoder de H3, no incluido.

## Enlaces

- [HuggingFace: liran12345/h3-turbo-diffusion](https://huggingface.co/liran12345/h3-turbo-diffusion)
- [Modelo base: MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [LICENSE del repo](https://huggingface.co/liran12345/h3-turbo-diffusion/blob/main/LICENSE)
- [NOTICE del repo](https://huggingface.co/liran12345/h3-turbo-diffusion/blob/main/NOTICE)
