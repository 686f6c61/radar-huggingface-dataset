# Lightricks/LTX-2.5

## Resumen

LTX-2.5 es un modelo generativo multimodal de Lightricks orientado a la síntesis y transformación de vídeo y audio. Se distribuye como un fichero único de difusión (`diffusion-single-file`) con pipeline principal de image-to-video, pero sus etiquetas cubren un abanico amplio de tareas: text-to-video, video-to-video, image-text-to-video, audio-to-video, text-to-audio, video-to-audio, audio-to-audio y combinaciones de audio y vídeo (text-to-audio-video, image-to-audio-video, image-text-to-audio-video). El repositorio incluye variantes derivadas con LoRA (por ejemplo, Slow-Motion-Control, Cinemagraph e IC-LoRA), lo que indica un ecosistema pensado para control fino de la generación.

El modelo resuelve el problema de generar vídeo coherente y sincronizado con audio a partir de múltiples modalidades de entrada, una capacidad que hasta hace poco requería pipelines separados de vídeo y audio. Su relevancia actual radica en la integración con ComfyUI (etiqueta `comfyui`) y en la disponibilidad de pesos abiertos bajo una licencia comunitaria propia, lo que facilita su adopción en flujos creativos profesionales.

La información pública disponible no detalla el número de parámetros totales ni la longitud de contexto; el tamaño del repositorio (298,7 GB) sugiere pesos de gran volumen, probablemente en precisión alta y con múltiples componentes. El acceso está restringido (gated) y requiere aceptar la licencia en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusion-single-file); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt (según etiquetas) |
| Licencia | ltx-2.x-community-license-agreement (license:other) |
| Formato de pesos | diffusion-single-file (fichero único de difusión); otros formatos no disponibles |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de que se trata de un modelo de difusión empaquetado como fichero único. Las etiquetas indican soporte para generación y transformación multimodal (vídeo, imagen, texto y audio), lo que implica componentes de codificación de las distintas modalidades y un mecanismo de difusión conjunta o acoplada. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Tampoco hay datos públicos sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). La existencia de LoRAs específicos para control de movimiento lento, cinemagrafía y control de imagen sugiere que el modelo base admite adaptación paramétrica eficiente para tareas de control temporal y estilístico.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video), pipeline principal del repositorio.
- Transformación de vídeo existente (video-to-video).
- Generación condicionada por imagen y texto simultáneamente (image-text-to-video).
- Generación de audio a partir de texto (text-to-audio).
- Extracción o generación de audio a partir de vídeo (video-to-audio).
- Transformación de audio (audio-to-audio).
- Generación conjunta de audio y vídeo desde texto, imagen o imagen más texto (text-audio-video, image-audio-video, image-text-audio-video).
- Control fino mediante LoRAs: movimiento lento (Slow-Motion-Control), cinemagrafía (Cinemagraph) y control de imagen (IC-LoRA).
- Soporte multilingüe en las indicaciones textuales para los idiomas listados (en, de, es, fr, ja, ko, zh, it, pt).
- Integración con ComfyUI.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Postproducción publicitaria: generar variaciones de un anuncio a partir de una imagen de producto y un guion de texto, usando image-text-to-video para mantener la identidad visual del producto y producir múltiples versiones en distintos idiomas.
- Doblaje y localización de vídeo: emplear video-to-audio y audio-to-audio para regenerar la pista de voz o ambiente de un clip existente en otro idioma, manteniendo la sincronización labial gracias a la generación conjunta de audio y vídeo.
- Creación de contenido para redes sociales: convertir una fotografía fija en un clip animado con audio integrado mediante image-to-audio-video, adecuado para formatos verticales de corta duración.
- Efectos cinematográficos controlados: aplicar el LoRA Cinemagraph para producir bucles animados sutiles a partir de una imagen estática, útil en banners web y fondos animados.
- Prototipado rápido en estudios de animación: usar text-to-video para generar animáticas preliminares antes de la producción final, reduciendo el coste de previsualización.
- Restauración o reanimación de material de archivo: aplicar video-to-video para mejorar la fluidez o el estilo de metraje existente sin regrabar.
- Generación de bandas sonoras y ambientes: emplear text-to-audio para crear efectos de sonido o música de fondo sincronizada con escenas generadas.
- Flujos en ComfyUI: integrar el modelo en grafos de nodos para automatizar la generación por lotes de clips con parámetros variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (298,7 GB) indica que los pesos completos requieren almacenamiento masivo y, previsiblemente, múltiples GPU de alta capacidad para inferencia en precisión nativa.
- GPU recomendadas: no disponibles de forma oficial; por el volumen de pesos, se anticipan configuraciones con A100 o H100 en múltiples unidades.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio hace improbable la ejecución completa en una única GPU de consumo sin cuantización agresiva, dato no disponible.
- Opciones de despliegue: integración con ComfyUI documentada mediante etiqueta; otros entornos (vLLM, llama.cpp, Ollama, TGI) no están indicados y, por la naturaleza de difusión del modelo, no son aplicables directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia comunitaria en Hugging Face antes de descargar los pesos.
- Licencia `ltx-2.x-community-license-agreement`: no es una licencia de código abierto estándar; es imprescindible revisar las condiciones de uso comercial antes de desplegar en producción.
- No se han publicado datos sobre sesgos del modelo; cabe esperar sesgos presentes en los datos de entrenamiento visual y auditivo, no cuantificados.
- Riesgo de alucinación visual y auditiva: como modelo generativo, puede producir contenido incoherente, artefactos temporales o audio desincronizado.
- Idiomas: aunque se listan nueve idiomas, no se especifica el nivel de calidad por idioma; el rendimiento en idiomas distintos del inglés no está documentado.
- Longitud de contexto y duración máxima de vídeo: no disponibles, lo que limita la planificación de producción.
- Requisitos de hardware no documentados oficialmente; el despliegue puede exigir infraestructura de gama alta.
- No se ha documentado soporte para tool calling ni agentes, por lo que no debe asumirse en pipelines automatizados de razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5
- Organización en Hugging Face: https://huggingface.co/Lightricks
- Sitio web de Lightricks: https://www.lightricks.com/
- Sobre Lightricks: https://www.lightricks.com/about
- GitHub de Lightricks: https://github.com/Lightricks
- Wikipedia: https://en.m.wikipedia.org/wiki/Lightricks
- Paper referenciado en etiquetas: arXiv:2601.03233
