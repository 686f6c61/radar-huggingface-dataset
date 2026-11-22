# Anzoris/animagine-xl-4.0

## Resumen

Animagine XL 4.0 (estilizado también como Anim4gine) es un modelo de difusión texto-a-imagen especializado en ilustración de estilo anime, desarrollado por Cagliostro Research Lab. Se trata de un fine-tuning completo de Stable Diffusion XL 1.0 (SDXL) reentrenado sobre un corpus de 8,4 millones de imágenes anime de fuentes diversas, con un corte de conocimiento del 7 de enero de 2025 y aproximadamente 2.650 horas de GPU de entrenamiento. El modelo mantiene la arquitectura UNet de SDXL con 2.567.463.684 parámetros totales y se distribuye en formato safetensors FP16.

La relevancia del modelo radica en su especialización: frente a SDXL base, que es un modelo generalista, Animagine XL 4.0 está optimizado para seguir prompts estructurados en formato de etiquetas (tags) típicos de Danbooru, lo que permite control fino sobre personajes, series, poses, vestuario y composición. La versión "Opt" (Optimized), publicada el 13 de febrero de 2025, añade un refinamiento con un dataset adicional que mejora la estabilidad, la anatomía, la reducción de ruido y la saturación y precisión del color.

El modelo se integra en el ecosistema diffusers como `StableDiffusionXLPipeline` y es compatible con ComfyUI, Automatic1111 y Hugging Face Spaces. Su licencia CreativeML Open RAIL++-M permite uso comercial con restricciones de uso responsable. Está pensado para artistas, estudios de contenido y desarrolladores que necesiten generar ilustración anime consistente y de alta calidad sin entrenar su propio modelo desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de difusión (Stable Diffusion XL 1.0), text-to-image |
| Parámetros totales | 2.567.463.684 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje; el prompt se tokeniza con el text encoder de SDXL, límite de 77 tokens por encoder, ampliable con pipeline lpw) |
| Tipos de cuantización | FP16 (pesos publicados); cuantizaciones comunitarias GGUF/FP8 no documentadas en la información disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors (FP16) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Tamaño del repositorio | 20,8 GB |
| Pipeline diffusers | StableDiffusionXLPipeline (compatible con lpw_stable_diffusion_xl) |
| Fecha de creación del repo | 2026-11-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Animagine XL 4.0 es un modelo de difusión latente basado en la arquitectura SDXL: una UNet con bloques transformer y atención cruzada, acompañada de dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG) y un VAE. El modelo se reentrenó desde SDXL 1.0 con un dataset de 8,4 millones de imágenes anime de fuentes diversas, con corte de conocimiento del 7 de enero de 2025, invirtiendo aproximadamente 2.650 horas de GPU. El entrenamiento emplea el método de ordenación de etiquetas (tag ordering) para el aprendizaje de identidad y estilo, lo que explica que el modelo responda mejor a prompts estructurados en formato Danbooru que a lenguaje natural libre.

La versión "Opt" (Optimized) se refinó con un dataset adicional orientado a corregir defectos concretos: mayor estabilidad entre generaciones, proporciones anatómicas más precisas, reducción de ruido y artefactos, corrección de la baja saturación y mejora de la precisión cromática. No se documentan en la información disponible detalles sobre el uso de RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un modelo de difusión. La innovación principal es la especialización mediante fine-tuning completo con captions por etiquetas y el método de ordenación, que permite un control compositivo fino.

## Capacidades

- Generación de imágenes texto-a-imagen de estilo anime con alta fidelidad a personajes y series conocidas.
- Seguimiento de prompts estructurados en formato de etiquetas (tags) al estilo Danbooru.
- Control de identidad de personaje, serie de origen, pose, vestuario, escenario, iluminación y composición mediante etiquetas.
- Soporte de prompts negativos para suprimir artefactos (anatomía incorrecta, texto, marcas de agua, baja calidad).
- Manejo de prompts largos, ponderados y detallados mediante el pipeline `lpw_stable_diffusion_xl`.
- Generación en múltiples relaciones de aspecto y resoluciones (cuadrada, vertical y horizontal) dentro del rango nativo de SDXL.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo generativo de imágenes, no un LLM.
- Capacidad multilingüe limitada al inglés en la práctica, dado que los text encoders de SDXL están entrenados predominantemente en inglés.

## Casos de uso

- **Ilustración de personajes para ficción y fan art**: el modelo permite especificar nombre de personaje, serie y vestuario en el prompt, generando ilustraciones consistentes con la identidad solicitada gracias al entrenamiento con etiquetas ordenadas.
- **Generación de arte conceptual para videojuegos y animación**: útil para producir rápidamente bocetos de personajes, escenarios y variaciones de diseño en fase de preproducción, con resoluciones verticales de 832x1216 adecuadas para fichas de personaje.
- **Creación de contenido para redes y publicaciones**: generación de ilustraciones anime en distintas relaciones de aspecto para portadas, banners y publicaciones, con control de composición mediante etiquetas de encuadre (upper body, looking at viewer, outdoors, night).
- **Prototipado de assets para novelas visuales**: generación de expresiones, poses y variaciones de un mismo personaje reutilizando la misma estructura de prompt, lo que facilita la coherencia visual entre escenas.
- **Integración en pipelines de ComfyUI o Automatic1111**: el modelo se puede cargar como checkpoint en flujos de trabajo con ControlNet, LoRA e inpainting para tareas de postproducción y edición de imágenes existentes.
- **Servicio de generación de imágenes vía API con diffusers**: despliegue como endpoint texto-a-imagen usando `StableDiffusionXLPipeline` en FP16, adecuado para aplicaciones que requieran generación bajo demanda con ajustes fijos de CFG (4-7) y pasos (25-28).
- **Investigación en fine-tuning de modelos de difusión**: sirve como punto de partida especializado para experimentos de personalización (LoRA, DreamBooth) sobre un dominio anime ya consolidado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP16, el modelo completo (UNet + text encoders + VAE) requiere aproximadamente 10-12 GB de VRAM para generar a resoluciones nativas de SDXL (1024x1024 o 832x1216). Con optimizaciones de memoria (attention slicing, VAE tiling, offload a CPU) puede ejecutarse con 8 GB o menos.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia cómoda en FP16 sin offload. RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) son suficientes con atención optimizada.
- **¿Cabe en GPU de consumo?**: sí. Cabe en RTX 3060 (12 GB) con FP16 y optimizaciones, y en GPUs de 8 GB mediante offload parcial o cuantización. En GPUs de 6 GB requiere offload agresivo y es poco práctico.
- **Opciones de despliegue**: diffusers (`StableDiffusionXLPipeline`, `lpw_stable_diffusion_xl`), ComfyUI, Automatic1111 Stable Diffusion WebUI, Hugging Face Spaces y endpoints compatibles.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Como referencia orientativa de la familia SDXL, una generación de 28 pasos a 832x1216 en una RTX 4090 suele completarse en pocos segundos, pero este dato no está confirmado para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / prompt | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Animagine XL 4.0 | 2.567.463.684 | Etiquetas Danbooru, pipeline lpw para prompts largos | Anime (fine-tuning de SDXL) | Open RAIL++-M | Hugging Face, diffusers, ComfyUI, A1111 |
| stabilityai/stable-diffusion-xl-base-1.0 | ~2.600 M (SDXL) | Prompt en lenguaje natural, 77 tokens por encoder | Generalista | Open RAIL++-M | Hugging Face, diffusers |
| Animagine XL 3.x (versión anterior de la serie) | no disponible en la información | Etiquetas Danbooru | Anime | Open RAIL++-M | Hugging Face |
| Otros fine-tunes anime de SDXL (p. ej. Pony Diffusion) | no disponible en la información | Etiquetas / lenguaje natural | Anime | variable según autor | Hugging Face |

La comparativa cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada; la diferencia principal documentada es la especialización en anime y el método de entrenamiento por ordenación de etiquetas de Animagine XL 4.0 frente al carácter generalista de SDXL base.

## Limitaciones y advertencias

- **Sesgos**: al entrenarse con 8,4 millones de imágenes anime de fuentes diversas, puede reproducir sesgos de representación propios del corpus (proporciones corporales estilizadas, estereotipos de género y de personaje, predominio de ciertos arquetipos visuales).
- **Riesgo de alucinación visual**: puede generar anatomía incorrecta (manos, dedos, extremidades), texto ilegible, marcas de agua o artefactos, especialmente con prompts ambiguos o pasos insuficientes; el prompt negativo recomendado mitiga parte de estos problemas.
- **Limitaciones de idioma**: el modelo está orientado a inglés; los prompts en otros idiomas pueden degradar la fidelidad al no estar alineados con los text encoders de SDXL.
- **Limitaciones de contexto**: el prompt se tokeniza con los text encoders de SDXL (límite de 77 tokens por encoder); para prompts largos es necesario el pipeline `lpw_stable_diffusion_xl`, que no está garantizado que preserve el mismo comportamiento que el pipeline estándar.
- **Restricciones de licencia**: CreativeML Open RAIL++-M permite uso comercial pero impone restricciones de uso responsable (prohibición de usos ilícitos, dañinos o de vigilancia no consentida); es responsabilidad del usuario revisar los términos completos antes de desplegar en producción.
- **Caveat de producción**: el repositorio consultado (Anzoris/animagine-xl-4.0) figura con 0 descargas y 0 likes y fue creado el 2026-11-22, por lo que conviene verificar la procedencia y la integridad de los pesos frente al repositorio oficial de Cagliostro Research Lab antes de usarlo en entornos productivos.
- **Sin benchmarks publicados**: no hay métricas cuantitativas de calidad (FID, CLIP score, evaluaciones humanas) en la información disponible, lo que dificulta una comparación objetiva con alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anzoris/animagine-xl-4.0
- Repositorio oficial de la serie (referencia): https://huggingface.co/collections/Linaqruf/animagine-xl-669888c0add5adaf09754aca
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Licencia CreativeML Open RAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
- Cagliostro Research Lab (GitHub): https://github.com/cagliostrolab
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/cagliostrolab/animagine-xl-4.0
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Stable Diffusion WebUI (Automatic1111): https://github.com/AUTOMATIC1111/stable-diffusion-webui
