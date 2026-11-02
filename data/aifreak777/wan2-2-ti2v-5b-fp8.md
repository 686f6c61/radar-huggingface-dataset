# aifreak777/Wan2.2-TI2V-5B-FP8

## Resumen

Wan2.2-TI2V-5B-FP8 es una versión cuantizada a FP8 (e INT8) del modelo de difusión de vídeo Wan2.2-TI2V-5B, desarrollado originalmente por el equipo Wan de Alibaba (Wan-AI). Esta variante concreta la publica el usuario aifreak777 en Hugging Face, apoyándose en las herramientas de cuantización de Unsloth. El modelo resuelve la generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video) a resolución 720P y 24 fps, con un tamaño de 5.000 millones de parámetros que cabe en una única GPU de consumo.

La relevancia de esta versión cuantizada radica en la reducción del coste de inferencia: el modelo residente en memoria pasa de 20,6 GB en bf16 a 15,7 GB en FP8/INT8, el tiempo de generación en caliente baja de 4,5 s (bf16) a 3,8 s (INT8) o 4,0 s (FP8), y la carga del checkpoint se reduce de 55,8 s (descarga densa más cuantización al vuelo) a 8,5 s. Según el autor, la carga del checkpoint produce una cuantización bit-idéntica a la realizada en tiempo de ejecución, por lo que la calidad coincide exactamente con la ruta de dtype en runtime.

El modelo base Wan2.2 introduce una arquitectura MoE en el proceso de difusión de vídeo, junto con un VAE propio (Wan2.2-VAE) con ratio de compresión 16×16×4, y se distribuye bajo licencia Apache 2.0. Esta ficha describe la variante FP8/INT8 publicada por aifreak777, tomando como referencia los datos del modelo base cuando la información de la cuantización no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo (modelo base Wan2.2 con arquitectura MoE en el proceso de denoising; VAE Wan2.2-VAE con compresión 16×16×4) |
| Parámetros totales | 4.999.787.712 (5B) |
| Parámetros activos | no disponible (el modelo base Wan2.2 emplea MoE; el desglose de expertos activos para esta variante de 5B no está especificado en la información disponible) |
| Longitud de contexto | no disponible (modelo de difusión de vídeo, no aplica ventana de contexto de texto) |
| Tipos de cuantización | FP8 e INT8 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo base Wan2.2-TI2V-5B es un modelo de difusión para generación de vídeo que incorpora una arquitectura Mixture-of-Experts (MoE) en el proceso de denoising, separando el proceso por pasos temporales con expertos especializados. Esto permite ampliar la capacidad total del modelo manteniendo el mismo coste computacional. El modelo emplea el Wan2.2-VAE con un ratio de compresión de 16×16×4, lo que habilita la generación a 720P y 24 fps en una única GPU de consumo como la RTX 4090.

En cuanto a los datos de entrenamiento, el modelo base Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color para un control más preciso del estilo cinematográfico. No se especifican en la información disponible el número exacto de tokens, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación concreta de esta variante es la cuantización FP8/INT8 realizada con herramientas de Unsloth. Según el autor, la carga del checkpoint cuantizado es bit-idéntica a la cuantización FP8/INT8 al vuelo, de modo que la calidad coincide con la ruta de dtype en runtime. Se reporta una divergencia de trayectoria sobre 12 pasos de 0,46 (INT8) y 0,34 (FP8) medida como LPIPS del primer fotograma frente a bf16 con la misma semilla, y se verifica que las salidas son finitas y no negras.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a 720P y 24 fps.
- Generación de vídeo a partir de imagen (image-to-video), dado que el modelo base TI2V soporta ambas modalidades.
- Generación de vídeo de alta definición en una única GPU de consumo (RTX 4090).
- Control de estética cinematográfica mediante prompts, gracias a los datos estéticos etiquetados del modelo base.
- Generación de movimiento complejo, con mejor generalización en movimiento, semántica y estética respecto a Wan2.1.
- Soporte multilingüe de prompts en inglés (en) y chino (zh).
- Inferencia con menor huella de memoria y mayor velocidad gracias a la cuantización FP8/INT8.
- No se especifica en la información disponible soporte de tool calling, function calling ni capacidades de agente, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Generación de clips publicitarios: el modelo puede producir vídeos de 720P a 24 fps a partir de descripciones textuales, adecuado para prototipado rápido de anuncios y contenido para redes sociales con control de estilo cinematográfico mediante prompts.
- Previsualización de storyboards: un equipo de producción puede convertir guiones o descripciones de escenas en clips de vídeo para validar composición y movimiento antes del rodaje, gracias a la modalidad text-to-video.
- Animación de imágenes fijas: mediante image-to-video, se pueden animar ilustraciones, fotografías o renders para crear contenido animado sin necesidad de un pipeline de animación manual.
- Generación de vídeo en estaciones de trabajo con una sola GPU: al caber en una RTX 4090 con 15,7 GB residentes en FP8/INT8, es viable desplegarlo en equipos de desarrollo locales para investigación y creación de contenido, sin depender de clústeres.
- Investigación en modelos de difusión de vídeo: la variante cuantizada permite experimentar con Wan2.2 en entornos con recursos limitados, manteniendo una calidad bit-idéntica a la cuantización al vuelo según el autor.
- Prototipado de efectos visuales: la generación de movimiento complejo y el control estético permiten crear borradores de VFX y transiciones para su posterior refinado en herramientas de postproducción.
- Servicios de generación de vídeo bajo demanda: el menor tiempo de carga del checkpoint (8,5 s frente a 55,8 s) y la generación en caliente de 3,8-4,0 s facilitan despliegues con arranque rápido en entornos de serving.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al tratarse de un modelo generativo de vídeo. El autor sí reporta métricas de eficiencia y fidelidad de la cuantización:

| Métrica | bf16 | INT8 | FP8 |
|---|---|---|---|
| Memoria residente | 20,6 GB | 15,7 GB | 15,7 GB |
| Generación en caliente | 4,5 s | 3,8 s | 4,0 s |
| Carga del checkpoint | 55,8 s (descarga densa + cuantización) | 8,5 s | 8,5 s |
| Divergencia de trayectoria (LPIPS primer fotograma vs bf16, 12 pasos) | referencia | 0,46 | 0,34 |

## Requisitos de hardware

- VRAM estimada para inferencia: 15,7 GB residentes en FP8/INT8 (frente a 20,6 GB en bf16).
- GPU recomendadas: RTX 4090 para uso en consumo; el modelo base está diseñado para ejecutarse en una única GPU de consumo. Para despliegues de mayor escala se pueden emplear A100 o H100, aunque no se especifican requisitos concretos para estas.
- Cabe en GPU de consumo: sí, en RTX 4090 según el modelo base; la variante FP8/INT8 reduce aún más la huella de memoria.
- Opciones de despliegue: librería diffusers (pipeline WanPipeline); no se especifican en la información disponible otras opciones como vLLM, llama.cpp, Ollama o TGI, que además no aplican a modelos de difusión de vídeo.
- Latencia y throughput: generación en caliente de 3,8 s (INT8) y 4,0 s (FP8) frente a 4,5 s en bf16; carga del checkpoint de 8,5 s. El throughput en vídeos por segundo no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / fps | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B-FP8 (esta ficha) | 5B | 720P / 24 fps | FP8, INT8 | Apache 2.0 | Hugging Face (aifreak777) |
| Wan2.2-TI2V-5B (base) | 5B | 720P / 24 fps | bf16 | Apache 2.0 | Hugging Face (Wan-AI) |
| Wan2.1 | no disponible | no disponible | no disponible | no disponible | Hugging Face (Wan-AI) |

No se dispone en la información proporcionada de datos comparativos de rendimiento (benchmarks) frente a otros modelos de generación de vídeo de la misma categoría, por lo que la comparativa se limita a parámetros, resolución, licencia y disponibilidad.

## Limitaciones y advertencias

- La cuantización FP8/INT8 introduce divergencia respecto a bf16 (LPIPS de 0,46 en INT8 y 0,34 en FP8 sobre 12 pasos), por lo que la salida no es idéntica al modelo en precisión completa.
- El modelo base puede presentar sesgos derivados de los datos de entrenamiento (imágenes y vídeos), no documentados en la información disponible.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión de vídeo; no se detallan en la información disponible.
- Idiomas de prompt limitados a inglés y chino; no se garantiza un comportamiento correcto con prompts en castellano u otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones del modelo base Wan2.2-TI2V-5B y de las herramientas de cuantización empleadas (Unsloth).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-02), por lo que no cuenta con validación de la comunidad.
- El tamaño del repositorio es de 52,1 GB, lo que implica requisitos de almacenamiento considerables para su descarga.
- No se especifican en la información disponible los detalles de los parámetros activos del MoE para esta variante de 5B, lo que limita la estimación precisa del coste computacional por paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aifreak777/Wan2.2-TI2V-5B-FP8
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- Repositorio GitHub de Wan2.2: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog de Wan: https://wan.video/welcome
- Sitio web de Wan: https://wan.video
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Discord de Wan: https://discord.gg/AKNgpMK4Yj
- GitHub de Unsloth: https://github.com/unslothai/unsloth/
- Documentación de Unsloth: https://docs.unsloth.ai/
- Discord de Unsloth: https://discord.gg/unsloth
