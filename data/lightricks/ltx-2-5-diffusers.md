# Lightricks/LTX-2.5-Diffusers

## Resumen

LTX-2.5 es un modelo de generación de vídeo y audio desarrollado por Lightricks, la empresa responsable de aplicaciones como Videoleap. Se presenta como un modelo fundacional de tipo DiT (Diffusion Transformer) que integra en un único sistema capacidades de texto a vídeo, imagen a vídeo, vídeo a vídeo, audio a vídeo y generación sincronizada de audio y vídeo. El modelo está diseñado para producción, con soporte nativo de multishot (multi-toma), lo que permite mantener coherencia de escena a través de cortes, y un modo de renderizado denominado "Diffusion Fidelity Rendering" que concentra más cómputo en escenas complejas.

La versión alojada en HuggingFace bajo el identificador `Lightricks/LTX-2.5-Diffusers` es una integración para la librería `diffusers` con pipeline `text-to-video`. Los pesos en formato `safetensors` suman aproximadamente 19 000 millones de parámetros (18 987 859 200), aunque algunas fuentes citan 22 000 millones al incluir componentes adicionales. El repositorio ocupa 163,9 GB y el acceso está restringido (gated), por lo que es necesario aceptar la licencia comunitaria de Lightricks antes de descargarlo. El modelo soporta nueve idiomas: inglés, alemán, español, francés, japonés, coreano, chino, italiano y portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con generación conjunta de audio y vídeo |
| Parametros totales | 18 987 859 200 (aprox. 19B) en safetensors; fuentes externas citan 22B |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2-community-license-agreement (licencia propia de Lightricks, acceso gated) |
| Formato de pesos | safetensors (integración diffusers) |

## Arquitectura y entrenamiento

LTX-2.5 se basa en una arquitectura de Diffusion Transformer (DiT) que procesa simultáneamente señales de vídeo y audio. Según la documentación oficial de Lightricks, es el primer modelo fundacional de audio-vídeo basado en DiT que reúne todas las capacidades principales de la generación de vídeo moderna en un solo modelo: audio y vídeo sincronizados, alta fidelidad, múltiples modos de rendimiento y salidas listas para producción. El modelo incorpora un mecanismo de "Diffusion Fidelity Rendering" que asigna dinámicamente más pasos de cómputo a las regiones de la escena que lo requieren, mejorando la calidad en áreas complejas sin aumentar el coste global.

El entrenamiento incluye datos multimodales de vídeo y audio, aunque no se han publicado cifras exactas sobre el número de tokens o la composición del dataset. Tampoco se especifica si se aplicaron técnicas de RLHF o DPO. El modelo admite fine-tuning y entrenamiento de LoRAs, como se indica en el repositorio oficial de LTX-2. La referencia al paper `arxiv:2601.03233` sugiere que existe una publicación técnica asociada, aunque no se ha podido acceder a su contenido en la información disponible.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video).
- Generación de vídeo a partir de vídeo (video-to-video) y de audio (audio-to-video).
- Generación de audio a partir de texto, vídeo o audio (text-to-audio, video-to-audio, audio-to-audio).
- Generación conjunta de audio y vídeo sincronizados (text-to-audio-video, image-to-audio-video, image-text-to-audio-video).
- Soporte nativo de multishot: mantiene coherencia de escena, personajes e iluminación a través de múltiples tomas o cortes.
- Modo de renderizado adaptativo (Diffusion Fidelity Rendering) que concentra cómputo en escenas complejas.
- Capacidades multilingües en nueve idiomas (en, de, es, fr, ja, ko, zh, it, pt).
- Entrenable mediante LoRA y fine-tuning sobre datos propios.
- Integración con la librería `diffusers` mediante el pipeline `LTX2Pipeline`.

## Casos de uso

- Producción de vídeo publicitario: un equipo de marketing puede generar anuncios de producto con voz en off sincronizada a partir de un guion, reduciendo el tiempo de producción de días a horas. El modelo permite iterar sobre el texto y la imagen de referencia sin necesidad de rodar.
- Doblaje automático de vídeos: dado un vídeo existente, LTX-2.5 puede generar audio sincronizado en varios idiomas, lo que facilita la localización de contenido para mercados internacionales sin estudio de doblaje.
- Creación de storyboards animados: los directores y guionistas pueden convertir guiones escritos en secuencias de vídeo de baja resolución para previsualizar escenas antes del rodaje, gracias a la capacidad de multishot que mantiene la coherencia entre planos.
- Generación de contenido para redes sociales: creadores de contenido pueden producir clips cortos con audio y vídeo sincronizados a partir de descripciones textuales, adaptados a formatos verticales u horizontales, sin necesidad de equipos de grabación.
- Simulación de escenarios para entrenamiento: en entornos educativos o corporativos, el modelo puede generar vídeos de ejemplo con audio para simulaciones de atención al cliente, presentaciones o procedimientos, personalizables mediante fine-tuning con datos propios.
- Restauración y mejora de vídeos: mediante la modalidad video-to-video, se pueden re-renderizar vídeos existentes con mayor fidelidad, cambiar el estilo visual o corregir defectos, manteniendo la pista de audio original o regenerándola.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos oficiales de métricas como FVD, CLIP score o evaluaciones de sincronización audio-vídeo en las fuentes consultadas.

## Requisitos de hardware

- El repositorio ocupa 163,9 GB en formato safetensors, lo que indica que el modelo completo en precisión fp32 o fp16 requiere un almacenamiento considerable.
- Con aproximadamente 19 000 millones de parámetros, la inferencia en fp16 necesitaría al menos 38 GB de VRAM solo para los pesos, más los activos de atención y las salidas intermedias. En la práctica, se recomienda una GPU con 48 GB o más (por ejemplo, NVIDIA A6000, A100 80GB o H100).
- Para cuantizaciones de 8 bits (int8) o 4 bits, la VRAM necesaria se reduciría a unos 19 GB y 10 GB respectivamente, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) con cuantización int8, aunque con posibles pérdidas de calidad.
- No se han publicado requisitos oficiales de hardware por parte de Lightricks en la información disponible.
- Opciones de despliegue: al ser una integración de `diffusers`, se puede ejecutar con el pipeline estándar de HuggingFace. Para producción, es probable que sea compatible con servidores de inferencia como vLLM o TGI, aunque no se ha confirmado oficialmente. También está disponible en plataformas cloud como fal.ai, que ofrece el modelo como servicio gestionado.
- La latencia y el throughput dependen en gran medida del hardware y de la configuración de pasos de difusión. No se han publicado cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa con otros modelos de generación de vídeo y audio (como Sora de OpenAI, Veo de Google o Gen-3 de Runway), ya que no se han publicado benchmarks estandarizados ni especificaciones completas de estos modelos en las fuentes consultadas. La información disponible se limita a las características declaradas por Lightricks.

## Limitaciones y advertencias

- El acceso al modelo está restringido (gated) y requiere aceptar la licencia comunitaria de Lightricks (`ltx-2-community-license-agreement`). Es necesario revisar los términos exactos de esta licencia antes de cualquier uso comercial, ya que puede imponer restricciones específicas.
- No se han publicado detalles sobre sesgos del modelo ni sobre su comportamiento en escenarios de alto riesgo. Como todo modelo generativo, existe riesgo de alucinación visual o auditiva, especialmente en escenas complejas o con instrucciones ambiguas.
- La generación de vídeo y audio sincronizados es una tarea computacionalmente intensiva; los tiempos de inferencia pueden ser largos incluso en GPUs de gama alta.
- El modelo solo soporta los nueve idiomas listados; el rendimiento en otros idiomas no está garantizado.
- No se ha confirmado la compatibilidad con cuantizaciones GGUF u otros formatos optimizados para CPU; el despliegue en hardware de consumo puede requerir cuantización manual.
- La referencia al paper `arxiv:2601.03233` no ha podido verificarse; el número parece contener un error tipográfico (año 2601), por lo que la publicación técnica podría no estar disponible o ser incorrecta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lightricks/LTX-2.5-Diffusers
- Página del modelo LTX-2.5 en HuggingFace: https://huggingface.co/Lightricks/LTX-2.5
- Repositorio oficial LTX-Video en GitHub: https://github.com/Lightricks/LTX-Video
- Repositorio oficial LTX-2 en GitHub: https://github.com/Lightricks/LTX-2
- Guía en HackerNoon: https://hackernoon.com/ltx-25-a-complete-guide-to-lightricks-audio-video-ai-model
- Despliegue en fal.ai: https://fal.ai/ltx-2.5
