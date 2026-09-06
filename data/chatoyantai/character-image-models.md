# ChatoyantAI/character-image-models

## Resumen

El repositorio `ChatoyantAI/character-image-models` no es un modelo individual, sino un paquete de despliegue (model bundle) de 117 GB (108.99 GiB) que contiene 25 archivos de modelos para el proyecto "Character Image" de ChatoyantAI. Incluye checkpoints de difusión, modelos de difusión para imagen y video, codificadores de texto, CLIP Vision, IPAdapter, LoRAs, VAEs, modelos de upscaling, un modelo ONNX para interpolación de frames y dependencias de censura. Está diseñado para integrarse directamente en ComfyUI, con una estructura de directorios compatible.

El paquete fue auditado contra el commit `8f1d132` en 2026-09-07 y conserva los bytes y nombres de archivo del despliegue fuente. Su relevancia radica en que permite reproducir un pipeline completo de generación de personajes (imagen y video) con censura automática, sin necesidad de buscar y descargar cada componente por separado. No obstante, es un conjunto de artefactos de despliegue, no un modelo entrenado nuevo, y carece de documentación de entrenamiento o benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle de modelos: checkpoints de difusión (WAI v170, Qwen Rapid AIO v23, Pornworks Illustrious), diffusion models (Wan Remix V30 High/Low, ZImage x2), text encoders (Wan UMT5, Qwen 3 4B), CLIP Vision H, IPAdapter (AnimeIPA, SDXL Plus Face), 6 LoRAs, VAEs (AE, Wan 2.1), upscale (4x AnimeSharp), ONNX (RIFE 4.9) |
| Parametros totales | no disponible (bundle de múltiples modelos) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende de cada componente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los archivos son compatibles con ComfyUI) |

## Arquitectura y entrenamiento

El repositorio es un bundle de despliegue, no un modelo entrenado desde cero. Contiene una colección de pesos preentrenados de terceros organizados para su uso en ComfyUI. Los componentes principales son:

- **Checkpoints**: WAI v170, Qwen Rapid AIO v23 y Pornworks Illustrious, orientados a generación de imágenes anime/estilizadas.
- **Diffusion models**: Wan Remix V30 High/Low (para video) y dos variantes de ZImage (para imagen).
- **Text encoders**: Wan UMT5 y Qwen 3 4B, que proporcionan representaciones de texto para los pipelines de difusión.
- **Soporte de estilo**: IPAdapter AnimeIPA y SDXL Plus Face, junto con seis LoRAs activadas.
- **Postprocesado**: VAE (AE y Wan 2.1), upscale 4x AnimeSharp y RIFE 4.9 ONNX para interpolación de frames.
- **Censura**: EraX, NudeNet y un detector de censura anime en `auxiliary/censor/`.

No se proporcionan datos sobre el entrenamiento de estos modelos individuales, ya que el repositorio solo incluye los pesos y un manifiesto (`model-manifest.json`) con rutas, SHA256 y tamaños. Tampoco se documenta si se aplicó RLHF, DPO o alguna técnica de alineación.

## Capacidades

- Generación de imágenes mediante difusión usando checkpoints como Illustrious o WAI.
- Generación de video con modelos Wan Remix y ZImage.
- Interpolación de frames con RIFE 4.9 ONNX para suavizar secuencias de video.
- Upscaling de imágenes con 4x AnimeSharp.
- Adaptación de estilo y rostro mediante IPAdapter (AnimeIPA y SDXL Plus Face).
- Censura automática de contenido generado mediante EraX, NudeNet y detector anime.
- Integración directa con ComfyUI, incluyendo nodos personalizados como `ComfyUI-GenitalCensor` y `ComfyUI-Rife-Tensorrt`.
- Soporte de texto a través de Wan UMT5 y Qwen 3 4B, aunque no se especifican idiomas concretos.

## Casos de uso

- **Despliegue de un servicio de generación de personajes anime**: el bundle permite montar un pipeline completo en ComfyUI para crear personajes con estilos consistentes usando WAI, Illustrious, IPAdapter y LoRAs.
- **Producción de video corto con interpolación**: Wan Remix V30 genera los frames base y RIFE 4.9 ONNX los interpola para lograr mayor fluidez, útil para animaciones de personajes.
- **Filtrado de contenido NSFW en producción**: los censores EraX, NudeNet y el detector anime pueden integrarse como paso posterior a la generación para bloquear contenido no deseado.
- **Mejora de resolución de imágenes generadas**: 4x AnimeSharp permite escalar imágenes de personajes a alta resolución sin perder calidad, adecuado para ilustraciones o avatares.
- **Investigación en pipelines de difusión multi-modelo**: al incluir varios diffusion models, text encoders y VAEs, sirve como banco de pruebas para comparar configuraciones en ComfyUI.
- **Generación de avatares personalizados con IPAdapter**: se puede usar SDXL Plus Face o AnimeIPA para transferir el rostro de un personaje a nuevas imágenes.
- **Replicación de un entorno de producción existente**: el manifiesto con SHA256 permite auditar y reproducir exactamente el mismo conjunto de pesos que el servidor fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, comparativas ni evaluaciones de calidad de imagen o video. No se pueden aportar datos de MMLU, HumanEval, GSM8K u otros benchmarks, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el bundle incluye modelos de difusión de imagen y video (Wan, ZImage) y un text encoder de 4B (Qwen 3 4B), se requiere una GPU con VRAM suficiente, pero no se especifica una cifra concreta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos oficiales sobre requisitos mínimos de VRAM.
- Opciones de despliegue: ComfyUI es el entorno objetivo. No se mencionan vLLM, llama.cpp, TGI ni Ollama, ya que el bundle no está pensado para ejecución de LLMs.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado bundles de características comparables en la información proporcionada. El repositorio es un paquete de despliegue específico para el proyecto "Character Image", no un modelo con métricas de referencia.

## Limitaciones y advertencias

- El repositorio no incluye 18 referencias de modelos ausentes del servidor fuente, entre ellas el checkpoint legacy Pony y cinco LoRAs asociados, Wan Remix V20 High/Low, el LoRA Qwen next-scene, los LoRAs Monica/Trixie y su LoRA ZImage NSFW, y seis LoRAs legacy de video. Las plantillas que dependen de estos archivos fallarán o requerirán descargas adicionales.
- Se necesitan dependencias externas de Python y nodos de ComfyUI, como `ComfyUI-GenitalCensor`, `nudenet`, `ultralytics` e `imgutils`. Sin ellas, el pipeline de censura no funciona.
- Los censores EraX y el detector anime se cargan desde la caché de HuggingFace en rutas específicas. Hay que ejecutar `restore_censor_models.py` y exportar `CENSOR_MODELS_DIR` antes de iniciar ComfyUI.
- El bundle no incluye configuración de aplicación, credenciales, medios de usuario ni logs. Es solo un conjunto de pesos y metadatos.
- La licencia no está especificada, por lo que el uso comercial no está garantizado. Algunos componentes (como los modelos NSFW) pueden tener restricciones adicionales.
- El contenido incluye modelos explícitamente orientados a NSFW (Pornworks Illustrious, LoRA NSFW), lo que puede suponer problemas legales o éticos según la jurisdicción.
- No hay benchmarks ni documentación de calidad de imagen, por lo que el rendimiento real debe evaluarse en cada caso de uso concreto.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un paquete de despliegue interno publicado públicamente, no un modelo con soporte activo.

## Enlaces

- HuggingFace: https://huggingface.co/ChatoyantAI/character-image-models

No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web. Los resultados de búsqueda no aportan información técnica sobre este modelo.
