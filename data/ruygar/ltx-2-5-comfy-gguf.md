# ruygar/LTX-2.5-Comfy-GGUF

## Resumen

LTX-2.5 es un modelo de generación de vídeo y audio de Lightricks, publicado con pesos abiertos y pensado para ejecución local y fine-tuning. Esta versión concreta, `ruygar/LTX-2.5-Comfy-GGUF`, es una cuantización GGUF del modelo original `Lightricks/LTX-2.5` (22B parámetros) adaptada para su uso eficiente en ComfyUI. El modelo resuelve el problema de generar vídeo de alta fidelidad con audio sincronizado en una sola pasada, a partir de texto, imagen o vídeo, sin necesidad de una etapa separada de síntesis de audio.

La arquitectura es un Diffusion Transformer (DiT) de doble flujo: un camino de vídeo de 4096 canales y un camino de audio de 2048 canales, unidos mediante atención cruzada. Incluye además un text encoder personalizado basado en Gemma 4 12B, que mantiene la coherencia de prompts complejos con múltiples personajes, movimientos de cámara e iluminación. La cuantización GGUF reduce el peso del transformer original en bf16 (39 GB) a tamaños de 11 a 23 GB, haciéndolo viable en hardware de consumo. La licencia es la LTX-2.x Community License, que permite uso comercial gratuito para empresas con ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de doble flujo (vídeo 4096 canales, audio 2048 canales) con atención cruzada |
| Parametros totales | 21.004.025.600 (aprox. 22B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License (con restricciones comerciales según ingresos) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 emplea un DiT de doble flujo que procesa simultáneamente señales de vídeo y audio. El camino de vídeo tiene una anchura de 4096 canales y el de audio 2048, conectados mediante atención cruzada para garantizar sincronización labial y coherencia sonora. Esto elimina la necesidad de un módulo de audio separado, simplificando el pipeline de generación. Además, el modelo soporta generación multishot nativa: produce múltiples escenas conectadas en una sola pasada, manteniendo identidad de personajes, entorno, iluminación, voz y estilo visual a través de los cortes, algo que las versiones anteriores no lograban.

El text encoder es un Gemma 4 12B personalizado, que retiene detalles de prompts complejos (varios personajes, movimientos de cámara, acciones, iluminación) sin perder información en secuencias largas. La técnica de "Diffusion Fidelity Rendering" asigna dinámicamente cómputo según la complejidad de la escena y el presupuesto disponible, optimizando el detalle donde es necesario. No se dispone de información sobre el dataset de entrenamiento, número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video), según los tags del repositorio.
- Generación de audio sincronizado con el vídeo en una sola pasada, sin etapa separada de síntesis de audio.
- Generación multishot: múltiples escenas conectadas en una sola pasada, manteniendo coherencia de personajes, entorno, iluminación y estilo.
- Manejo de prompts complejos gracias al text encoder Gemma 4 12B, que retiene detalles como múltiples personajes, movimientos de cámara y acciones.
- Ejecución eficiente en hardware de consumo mediante cuantización GGUF, con soporte nativo en ComfyUI.
- No se especifican capacidades de tool calling, razonamiento multi-paso ni soporte de agentes, al ser un modelo especializado en generación de vídeo y audio.

## Casos de uso

- Creación de contenido para redes sociales: generar clips cortos con audio sincronizado (voz, efectos) directamente desde una descripción textual, reduciendo el tiempo de producción de vídeo para plataformas como TikTok o Instagram Reels.
- Prototipado de escenas cinematográficas: directores y guionistas pueden visualizar escenas con múltiples planos y diálogos sin necesidad de rodaje, gracias a la generación multishot y la sincronización labial.
- Doblaje y localización de vídeo: al generar audio y vídeo de forma conjunta, se pueden crear versiones dobladas de contenido existente partiendo de una imagen o vídeo de referencia y un prompt de voz, sin herramientas de postproducción adicionales.
- Vídeo educativo y formación: producir explicaciones animadas con narración sincronizada a partir de guiones de texto, útil para cursos online o material didáctico.
- Publicidad y marketing: generar anuncios de producto con escenas múltiples, música y voz en off de forma automatizada, acelerando iteraciones de campaña.
- Investigación en generación multimodal: servir como base para experimentos de fine-tuning en tareas de vídeo-audio, dado que es un modelo de pesos abiertos con licencia permisiva para uso comercial bajo ciertos umbrales de ingresos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de generación de vídeo (como FVD o CLIP score) para esta versión cuantizada ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (solo pesos del modelo, sin contexto de ejecución):
  - Q4_K_M: ~11,5 GB de VRAM (recomendado 16-20 GB GPU)
  - Q5_K_M: ~14,2 GB (recomendado 20-24 GB GPU)
  - Q6_K: ~16,8 GB (recomendado 24 GB GPU)
  - Q8_0: ~23,0 GB (recomendado 32 GB+ GPU, o Mac con memoria unificada)
- Se requiere VRAM adicional de 4-8 GB para el contexto de ejecución, VAE y text encoders según la configuración de ComfyUI.
- GPUs recomendadas: RTX 4080 (16 GB) para Q4_K_M, RTX 3090/4090 (24 GB) para Q5_K_M y Q6_K, y sistemas con 32 GB o más (p. ej., Mac Studio) para Q8_0.
- Opciones de despliegue: ComfyUI como entorno principal (los archivos GGUF están específicamente convertidos para este fin). También podría usarse con otros runners compatibles con GGUF, aunque no se especifica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generación de vídeo (como Stable Video Diffusion, CogVideoX o Mochi 1) en la información proporcionada. No se puede establecer una comparativa rigurosa sin datos de rendimiento y características detalladas de esos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero al ser un modelo generativo de vídeo entrenado con datos web, es probable que herede sesgos de género, raza o cultura presentes en los datos de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido visual o de audio que no corresponda fielmente al prompt, especialmente en escenas complejas o con múltiples objetos.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados; la generación de vídeo depende del text encoder Gemma 4 12B, cuyo rendimiento multilingüe no está documentado en esta ficha.
- Restricciones de licencia: la LTX-2.x Community License permite uso comercial gratuito solo para empresas con ingresos anuales inferiores a 10 millones de dólares. Por encima de ese umbral, se requiere un acuerdo comercial de pago con Lightricks. Es obligatorio revisar el texto completo de la licencia en el repositorio original.
- Requisitos de VRAM: aunque las cuantizaciones reducen el tamaño del modelo, la generación de vídeo de alta resolución o con múltiples escenas puede superar la VRAM disponible en GPUs de gama media, provocando fallos o degradación de rendimiento.
- El repositorio `ruygar/LTX-2.5-Comfy-GGUF` es una conversión comunitaria; no está respaldado oficialmente por Lightricks, y el autor declina cualquier responsabilidad sobre el uso del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ruygar/LTX-2.5-Comfy-GGUF
- Modelo base original: https://huggingface.co/Lightricks/LTX-2.5
- Texto completo de la licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
- Repositorio GitHub de Lightricks LTX-2: https://github.com/Lightricks/LTX-2
