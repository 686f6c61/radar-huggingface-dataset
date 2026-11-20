# OpenMOSS-Team/MOSS-VL-Instruct-0708-FP8

## Resumen

MOSS-VL-Instruct-0708-FP8 es la versión cuantizada en FP8 del modelo de visión-lenguaje MOSS-VL-Instruct-0708, desarrollado por OpenMOSS (OpenMOSS-Team). Se trata de un modelo multimodal de 11.336 millones de parámetros orientado a comprensión de imágenes, comprensión de vídeo de larga duración e interacción en streaming en tiempo real. Su pipeline declarado es `video-text-to-text`, e incluye soporte nativo para texto, imagen y vídeo como entradas.

La relevancia de esta variante concreta reside en la cuantización: reduce el checkpoint a unos 24 GiB y permite ejecutar el modelo en una única GPU NVIDIA con 24 GB de VRAM mediante la ruta estándar de Transformers, manteniendo pesos FP8 con activaciones de entrada FP8 dinámicas por token en la mayoría de las capas del lenguaje. Las capas de atención cruzada, los módulos de visión y el `lm_head` se conservan en BF16, y la caché KV en Transformers se comprime a INT8 mediante HQQ.

El modelo se publica bajo licencia Apache 2.0, soporta inglés y chino, y está pensado para desplegarse tanto con Transformers como con el backend nativo de SGLang, que expone un servicio compatible con la API de OpenAI. Está dirigido a desarrolladores e investigadores que necesitan capacidades de comprensión de vídeo e imagen en hardware de gama alta de consumo o profesional de 24 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con módulos de visión y atención cruzada (`moss_vl`, código personalizado) |
| Parámetros totales | 11.336.371.208 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card no declara un valor numérico de contexto) |
| Tipos de cuantización | FP8 dinámico (pesos FP8 + activaciones de entrada FP8 por token); BF16 en atención cruzada, visión y `lm_head`; caché KV INT8 vía HQQ en Transformers |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato de checkpoint `compressed-tensors` 0.14.0 |

## Arquitectura y entrenamiento

La información disponible confirma que MOSS-VL es una familia de modelos visión-lenguaje de arquitectura Transformer con codificador de visión, atención cruzada hacia el modelo de lenguaje y soporte de parches de imagen y vídeo configurables (`patch_size=16`, `temporal_patch_size=1`, `merge_size=2`). El procesamiento visual se realiza por fragmentos (`vision_chunked_length`), lo que permite manejar entradas de imagen y vídeo de gran resolución y secuencias de hasta 256 fotogramas con extracción a 1 FPS. El modelo requiere `trust_remote_code=True` y usa FlashAttention 2 en la ruta de Transformers.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card únicamente remite al informe técnico (arXiv 2608.15045) para los detalles de entrenamiento. La innovación técnica destacable de esta release es la cuantización: pesos FP8 compartidos entre los dos motores de inferencia (Transformers y SGLang), activaciones FP8 dinámicas por token y caché KV INT8 con HQQ en Transformers, mientras que SGLang emplea su propia caché BF16 nativa. Según el autor, los modelos cuantizados se mantienen cerca de sus equivalentes BF16 en los benchmarks seleccionados, aunque no se publican los valores numéricos en la información disponible.

## Capacidades

- Comprensión de imágenes: descripción, respuesta a preguntas visuales y extracción de información a partir de imágenes con resolución controlable (`shortest_edge`, `longest_edge`).
- Comprensión de vídeo de larga duración: procesamiento de hasta 256 fotogramas a 1 FPS por defecto, con extracción multihilo y procesamiento por fragmentos.
- Interacción en streaming en tiempo real, según declara el autor en la descripción de la familia MOSS-VL.
- Generación de texto multimodal condicionada a imagen o vídeo mediante `offline_image_generate` y `offline_video_generate`.
- Soporte de múltiples imágenes por consulta (`multi_image_max_pixels`).
- Ejecución por lotes mediante el runner del repositorio, que acepta consultas en JSON/JSONL con contenido de imagen o vídeo.
- Despliegue como servicio compatible con la API de OpenAI a través del backend nativo de SGLang.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso explícito, modo thinking, audio ni matemáticas avanzadas.

## Casos de uso

- Análisis automatizado de vídeo de vigilancia o monitorización: el modelo puede procesar hasta 256 fotogramas por clip a 1 FPS y generar descripciones o responder preguntas sobre eventos, gracias al procesamiento por fragmentos que evita cargar todo el vídeo en memoria de una vez.
- Moderación de contenido visual en plataformas: clasificación y descripción de imágenes y vídeos subidos por usuarios mediante el runner JSON/JSONL, que permite procesar lotes de consultas con contenido multimedia.
- Accesibilidad: generación de descripciones textuales de imágenes y vídeos para lectores de pantalla, usando `offline_image_generate` con prompts de descripción detallada.
- Indexación y búsqueda semántica de archivos audiovisuales: extracción de descripciones y metadatos textuales de vídeos que después se indexan en un motor de búsqueda; el pipeline `feature-extraction` declarado en los tags sugiere uso para representaciones, aunque la model card no detalla la API de embeddings.
- Asistencia en documentación técnica con capturas: interpretación de diagramas, capturas de pantalla o figuras en documentación, con control de resolución de entrada para preservar texto pequeño.
- Prototipado e investigación en visión-lenguaje: al caber en una GPU de 24 GB, permite experimentar con un modelo multimodal de 11.300 millones de parámetros en estaciones de trabajo con RTX 4090 sin necesidad de clústeres multi-GPU.
- Despliegue de servicio conversacional multimodal: mediante SGLang se puede levantar un endpoint compatible con la API de OpenAI para integrar comprensión de imagen y vídeo en aplicaciones existentes que ya consumen esa interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una gráfica comparativa de cuantización (`mossvl_quantization_benchmark_comparison_en_4k.png`) y afirma que los modelos cuantizados se mantienen cerca de sus equivalentes BF16, pero no se proporcionan los valores concretos ni los nombres de los benchmarks evaluados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB para la ruta de Transformers, según declara el autor; el checkpoint ocupa unos 15,8 GB en disco y la release se describe como de 24 GiB.
- GPU recomendadas: una única GPU NVIDIA con 24 GB de VRAM como mínimo para Transformers (por ejemplo, RTX 4090, RTX A5000, L4 de 24 GB o superiores). Para SGLang, los requisitos dependen de la configuración del servidor y de la asignación de caché KV.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090, siempre que se use la ruta de Transformers con la caché KV INT8 de HQQ.
- Opciones de despliegue: Transformers 4.57.1 con `compressed-tensors` 0.14.0, HQQ 0.2.8.post1, PyTorch 2.8.0 + CUDA 12.8 y FlashAttention 2.8.1; o SGLang 0.5.11 con `sglang-kernel` 0.4.2, PyTorch 2.11.0 + CUDA 13.0, Transformers 5.6.0 y `compressed-tensors` 0.17.1.
- Dependencias adicionales: FFmpeg en el `PATH` para decodificar vídeo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (visión-lenguaje con soporte de vídeo y tamaño similar), por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al ser un modelo entrenado principalmente con datos en inglés y chino, es previsible un sesgo cultural y lingüístico hacia esas comunidades.
- Alucinación: no se publican evaluaciones específicas de fidelidad factual ni de alucinación visual; en tareas de descripción de vídeo e imagen el riesgo de inventar detalles no verificables debe asumirse y mitigarse con validación posterior.
- Contexto: no se declara la longitud máxima de contexto, lo que dificulta planificar despliegues con secuencias muy largas; el límite práctico vendrá también de la memoria disponible para la caché KV.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True` y código personalizado (`moss_vl`), lo que implica ejecutar código del repositorio del autor; conviene auditar ese código antes de usarlo en producción.
- Cuantización: la release FP8 introduce una pérdida de calidad respecto a BF16; el autor afirma que es pequeña, pero no publica cifras verificables en la información disponible. Además, la caché KV INT8 con HQQ en Transformers puede afectar a la precisión en contextos largos.
- Compatibilidad de versiones: las dependencias están fijadas a versiones muy concretas (Transformers 4.57.1 o 5.6.0 según motor, PyTorch 2.8.0 o 2.11.0), lo que complica la integración en entornos existentes.
- Carga de vídeo: requiere FFmpeg y un número elevado de fotogramas (hasta 256) puede incrementar mucho el consumo de memoria y el tiempo de preprocesamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708-FP8
- Modelo base (BF16): https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708
- README en chino: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708-FP8/blob/main/README_zh.md
- Informe técnico (arXiv 2608.15045): https://arxiv.org/pdf/2608.15045
- Referencia arXiv adicional (2606.07639): https://arxiv.org/abs/2606.07639
- Repositorio de código MOSS-VL: https://github.com/OpenMOSS/MOSS-VL
