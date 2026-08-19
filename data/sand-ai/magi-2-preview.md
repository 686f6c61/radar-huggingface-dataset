# sand-ai/MAGI-2-preview

## Resumen

MAGI-2 Preview es un modelo unificado de generación de audio y vídeo desarrollado por Sand.ai, presentado en agosto de 2026. Con 114 mil millones de parámetros totales en una arquitectura de mezcla de expertos (MoE), activa únicamente 6 mil millones de parámetros por token, lo que permite escalar la generación de vídeo de forma eficiente. El modelo genera clips de 10 segundos con sonido sincronizado a partir de una descripción textual (text-to-video), de una imagen estática (image-to-video) o de ambas combinadas, y los eleva hasta resolución 1080p mediante un refiner en dos etapas.

Su relevancia radica en que aborda de manera conjunta la generación de vídeo y audio sincronizados, un reto que la mayoría de los sistemas actuales resuelve por separado. Al ser de código abierto con licencia Apache 2.0 y pesos públicos, ofrece una vía accesible para que desarrolladores e investigadores experimenten con generación multimodal de alta calidad. La arquitectura MagiMoE, junto con el sistema de entrenamiento y el pipeline de datos descritos en el blog técnico, constituye una propuesta novedosa para escalar modelos de vídeo sin disparar el coste computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MagiMoE (Diffusion Transformer de flujo único, Mixture of Experts) |
| Parametros totales | 114 mil millones |
| Parametros activos | 6 mil millones por token |
| Longitud de contexto | No aplica (generación de vídeo, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MAGI-2 Preview emplea una arquitectura MagiMoE, un Diffusion Transformer (DiT) de flujo único con mezcla de expertos. El modelo se compone de dos módulos: `magi2_preview`, que denoisa el clip a baja resolución, y `magi2_refiner`, que eleva el resultado a 1080p. La activación selectiva de 6 mil millones de parámetros por token reduce drásticamente el coste de inferencia en comparación con un modelo denso de 114 mil millones. El sistema de entrenamiento y el pipeline de datos se describen en el artículo técnico "MAGI-2 Preview: Scaling Video Generation Models Efficiently", aunque no se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con una duración fija de 10 segundos.
- Generación de vídeo a partir de imagen estática (image-to-video) con o sin prompt textual.
- Generación de audio sincronizado con el vídeo, multiplexado en el archivo de salida.
- Soporte multimodal combinando texto e imagen como entrada.
- Refinado del vídeo generado hasta resolución 1080p mediante el módulo `magi2_refiner`.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni modo de pensamiento, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Creación de contenido para redes sociales: generar clips de 10 segundos con audio sincronizado a partir de descripciones textuales, adecuados para plataformas como TikTok, Instagram Reels o YouTube Shorts, sin necesidad de equipos de edición complejos.
- Prototipado de conceptos visuales en publicidad: los equipos creativos pueden generar rápidamente vídeos de prueba con sonido a partir de un guion o una imagen de referencia, acelerando la validación de ideas antes de la producción final.
- Generación de vídeos educativos y explicativos: producir animaciones cortas con narración o efectos sonoros sincronizados a partir de prompts descriptivos, facilitando la creación de material didáctico personalizado.
- Doblaje y localización de contenidos: al generar audio sincronizado con el vídeo, el modelo permite crear versiones alternativas de un clip con diferentes bandas sonoras o efectos, útil en procesos de adaptación lingüística.
- Accesibilidad y diseño universal: convertir descripciones textuales o imágenes en vídeos con audio puede ayudar a personas con discapacidad visual o auditiva a comprender mejor la información, generando contenido multimodal accesible.
- Investigación en generación multimodal: el modelo sirve como base para estudiar la sincronización audio-vídeo, la eficiencia de arquitecturas MoE en difusión y el escalado de modelos generativos, gracias a su licencia abierta y pesos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo no incluye métricas cuantitativas como FVD (Fréchet Video Distance), CLIP score o evaluaciones de calidad de audio. Tampoco se ofrecen comparativas con otros modelos de generación de vídeo en la model card ni en el repositorio.

## Requisitos de hardware

- Se requieren 8 GPU NVIDIA Hopper (por ejemplo, H100) para ejecutar la inferencia, según la documentación oficial.
- El tamaño del repositorio es de 524,3 GB, lo que indica que los pesos completos necesitan un almacenamiento considerable y una VRAM agregada elevada.
- No se especifica la VRAM exacta por GPU, pero dado el tamaño total y la arquitectura MoE, es razonable estimar que cada GPU debe disponer de al menos 80 GB de memoria.
- El despliegue se realiza mediante el código de inferencia del repositorio, que incluye soporte Docker con una imagen precompilada (`sandai/magi-2-preview`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, al ser un modelo de difusión, no un LLM.
- Se requiere Python 3.12, un toolkit CUDA reciente y `ffmpeg` en el PATH para multiplexar el audio. Sin `ffmpeg`, el vídeo se genera sin pista de sonido.
- La latencia y el throughput no están documentados; dependerán del hardware concreto y de la resolución de salida.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre MAGI-2 Preview y otros modelos de generación de vídeo como Wan 2.1, HunyuanVideo o CogVideoX. La información disponible no incluye benchmarks comunes ni especificaciones detalladas de estos alternativas que permitan una comparación rigurosa. Se recomienda consultar las publicaciones técnicas y evaluaciones independientes para establecer comparaciones.

## Limitaciones y advertencias

- La duración de los vídeos generados está fijada en 10 segundos; no se admite otra duración.
- El modelo solo genera salida en 1080p tras el paso de refinado; no se documentan resoluciones intermedias ni control sobre la misma.
- Requiere hardware específico (8 GPU Hopper), lo que limita su uso a entornos con infraestructura de alto rendimiento, no siendo viable en GPU de consumo.
- No se han publicado detalles sobre sesgos, riesgos de alucinación visual o auditiva, ni comportamientos no deseados en ciertos contenidos. Al ser un modelo generativo, puede producir resultados inexactos o inapropiados en contextos no controlados.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y las posibles patentes asociadas.
- El modelo está en fase "preview", por lo que su estabilidad y rendimiento pueden variar entre versiones; el repositorio indica que la imagen Docker `latest` se actualiza por commit y se recomienda reportar el commit concreto al citar resultados.
- No se documenta el soporte de idiomas; la generación de audio y vídeo podría estar sesgada hacia los datos de entrenamiento, que no se han detallado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sand-ai/MAGI-2-preview)
- [Repositorio en GitHub](https://github.com/SandAI-org/MAGI-2-preview)
- [Blog técnico de MAGI-2 Preview](https://sand.ai/blog/magi-2-preview)
- [Web de Sand.ai](https://sand.ai)
- [Imagen Docker en Docker Hub](https://hub.docker.com/r/sandai/magi-2-preview)
- [MagiAttention en GitHub](https://github.com/SandAI-org/MagiAttention)
- [MagiCompiler en GitHub](https://github.com/SandAI-org/MagiCom)
