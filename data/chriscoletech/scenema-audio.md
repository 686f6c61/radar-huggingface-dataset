# ChrisColeTech/scenema-audio

## Resumen

Scenema Audio es un modelo de generación de música a partir de texto (text-to-audio) desarrollado por ChrisColeTech como una distribución cuantizada y adaptada del modelo base ScenemaAI/scenema-audio. Está diseñado para producir pistas musicales completas con calidad de estudio a partir de prompts descriptivos que especifican género, tempo, tonalidad, instrumentación y características de producción. El modelo se distribuye en formato safetensors y GGUF, con un transformer principal de 11.765.788.416 parámetros (en int8) y un text encoder basado en Gemma-3-12B cuantizado a Q4_K_M. Su relevancia radica en la capacidad de generar música de larga duración (más de dos minutos en los ejemplos publicados) con un control fino sobre el estilo y la mezcla, integrado en el ecosistema ComfyUI. La licencia es "other", sin especificar términos concretos, lo que obliga a revisar las condiciones antes de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para audio (detalles no publicados) |
| Parametros totales | 11.765.788.416 (transformer principal, safetensors int8) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (samples), transformer int8, text encoder Q4_K_M |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors, GGUF |

El repositorio incluye además un VAE de pipeline (6.71 GB), un encoder de audio VAE (42.7 MB) y una carpeta de extras (2.3 GB) necesaria para generación de audio largo y conversión voz-a-voz.

## Arquitectura y entrenamiento

El modelo se compone de varios módulos diferenciados: un transformer de difusión (almacenado en `scenema-audio-transformer-int8.safetensors`), un text encoder basado en Gemma-3-12B cuantizado a Q4_K_M en formato GGUF, y dos componentes VAE (uno para el pipeline de audio y otro para el encoder de audio). La arquitectura exacta del transformer no se detalla en la documentación disponible, pero el uso de difusión para audio sugiere un esquema de generación iterativa condicionada por texto. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La integración con ComfyUI mediante un workflow específico y el requisito de componentes adicionales (mel-band-roformer, bigvgan, campplus, seedvc, whisper-small) indican que el modelo está pensado para un pipeline modular de generación y postprocesado.

## Capacidades

- Generación de música completa a partir de prompts textuales detallados (género, BPM, tonalidad, instrumentación, estilo vocal, características de mezcla).
- Producción de pistas de larga duración: los ejemplos incluyen una canción synth-pop de 2:29 minutos y una de punk-funk de 1:01 minuto.
- Control fino sobre la producción: el prompt permite especificar calidad de grabación, ecualización, imagen estéreo, presencia de ruido o textura, y características vocales.
- Soporte para voice-to-voice (conversión de voz) mediante los componentes de la carpeta extras.
- Compatibilidad con ComfyUI a través de un workflow predefinido y un cargador GGUF actualizado.
- Distribución en cuantizaciones GGUF (Q8_0) para reducir el consumo de memoria en inferencia.

## Casos de uso

- Creación de bandas sonoras para vídeo y contenido audiovisual: el modelo puede generar música de fondo con duración suficiente para escenas completas, ajustando el prompt al tono y la duración necesaria.
- Producción musical rápida para demos y maquetas: permite a compositores y productores explorar ideas en minutos sin necesidad de instrumentos o estudios, especificando género, tempo y estilo.
- Generación de música para podcasts y publicidad: la capacidad de controlar la producción (limpia, sin ruido) la hace adecuada para fondos musicales profesionales.
- Prototipado de jingles y piezas cortas: con prompts como "synth-pop 104 BPM, A minor" se obtienen resultados listos para evaluar.
- Personalización de música para videojuegos: se pueden generar pistas con características específicas (energía, instrumentación) según el nivel o la escena.
- Investigación en generación de audio: sirve como base para estudiar la generación condicionada por texto en el dominio musical, gracias a su arquitectura modular y cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos de rendimiento son los tiempos de generación reportados en los samples: aproximadamente 7.3 minutos para una pista de 2:29 minutos y 5 minutos para una de 1:01, ambos en una RTX 5090 (32 GB) con un pico de memoria de 9.7 GiB para el transformer.

## Requisitos de hardware

- Los ejemplos se generaron en una RTX 5090 (32 GB), con un pico de 9.7 GiB para el transformer int8.
- El modelo completo (transformer + text encoder + VAE + extras) ocupa aproximadamente 21.3 GB en disco, por lo que se recomienda una GPU con al menos 24 GB de VRAM para cargar todos los componentes sin cuantización adicional.
- Con cuantizaciones GGUF (Q8_0 para el transformer, Q4_K_M para el text encoder) es posible reducir el consumo de memoria, aunque no se especifican los requisitos mínimos exactos.
- El despliegue se realiza a través de ComfyUI, utilizando el cargador GGUF actualizado y el workflow proporcionado.
- No se mencionan alternativas de despliegue como vLLM u Ollama; el modelo está orientado a ComfyUI.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de generación de música (como MusicGen, Stable Audio o AudioLDM). Los datos de rendimiento, arquitectura y licencia de estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La licencia "other" no especifica términos de uso comercial, por lo que es necesario contactar con el autor o revisar la documentación del modelo base ScenemaAI/scenema-audio antes de utilizarlo en producción.
- El modelo requiere componentes adicionales (extras) para la generación de audio largo y voice-to-voice; sin ellos, estas funcionalidades no están disponibles.
- Depende de ComfyUI y de una versión actualizada del cargador GGUF, lo que limita su portabilidad a otros entornos.
- No se han publicado evaluaciones de sesgos, alucinaciones o calidad en diferentes idiomas; los prompts de ejemplo están en inglés.
- El repositorio tiene 0 descargas y 1 like, lo que indica una adopción muy reciente y poca validación comunitaria.
- La arquitectura y el proceso de entrenamiento no están documentados, lo que dificulta la reproducibilidad y el análisis técnico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ChrisColeTech/scenema-audio
- Modelo base: https://huggingface.co/ScenemaAI/scenema-audio
- Workflow de ejemplo: https://huggingface.co/ChrisColeTech/scenema-audio/blob/main/workflow_examples/scenema_audio.json
