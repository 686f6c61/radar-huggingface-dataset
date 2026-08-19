# agosh/LTX-2.5-Comfy-GGUF

## Resumen

LTX-2.5 es un modelo de generacion de video y audio sincronizados desarrollado por Lightricks, con pesos abiertos y disenado para ejecucion local y fine-tuning. Esta ficha describe la version cuantizada en formato GGUF publicada por el usuario agosh, pensada para su uso en ComfyUI y otras herramientas compatibles con GGUF. El modelo base, Lightricks/LTX-2.5, es un Diffusion Transformer (DiT) de doble flujo que genera video y audio de alta fidelidad en una sola pasada a partir de texto, imagen o video, manteniendo coherencia entre multiples escenas (multishot) y utilizando un text encoder custom basado en Gemma 4 de 12B.

La cuantizacion GGUF reduce el peso del modelo desde los 39 GB del original en BF16 hasta un rango de aproximadamente 6.8 GB a 23 GB segun el nivel de cuantizacion, lo que permite ejecutarlo en GPUs de consumo con 10-32 GB de VRAM. El repositorio incluye varias variantes (Q2_K, Q3_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0) y el autor advierte que las variantes Q2 y Q3 producen resultados de baja calidad, recomendandose Q4_K_M o superiores para renders finales. El modelo se distribuye bajo la licencia LTX-2.x Community License, que permite uso comercial gratuito para empresas con ingresos anuales inferiores a 10 millones de dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) dual-stream con atencion cruzada video-audio |
| Parametros totales | 21.004.025.600 (21B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de video, no tokens de texto) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible (el text encoder es Gemma 4 12B, probablemente multilingue, pero no se especifica) |
| Licencia | LTX-2.x Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 es un Diffusion Transformer con arquitectura de doble flujo: un flujo de video con 4096 canales y un flujo de audio con 2048 canales, unidos mediante atencion cruzada que permite generar video y audio sincronizados sin necesidad de una etapa de audio separada. Ademas, incorpora generacion multishot nativa, lo que le permite producir multiples escenas conectadas en una sola pasada, manteniendo identidad de personajes, entorno, iluminacion, voz y estilo visual entre cortes. El text encoder es un modelo custom basado en Gemma 4 de 12B, capaz de mantener prompts complejos con multiples personajes, movimientos de camara, iluminacion y acciones sin perder detalles.

La version GGUF de este repositorio es una cuantizacion del modelo original, no un reentrenamiento. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre tecnicas como RLHF o DPO. La cuantizacion se realiza en formato GGUF, optimizado para inferencia eficiente en herramientas como ComfyUI, llama.cpp o similares. El autor indica que el modelo original en BF16 pesa 39 GB, y las cuantizaciones reducen el peso a entre 6.8 GB (Q2_K) y 23 GB (Q8_0).

## Capacidades

- Generacion de video a partir de texto, imagen o video de entrada.
- Generacion de audio sincronizado con el video en una sola pasada (sin etapas separadas).
- Generacion multishot: multiples escenas conectadas con coherencia de personajes, entorno, iluminacion, voz y estilo.
- Soporte nativo para ComfyUI mediante formato GGUF.
- Ejecucion local en hardware de consumo gracias a las cuantizaciones.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso (es un modelo generativo de video/audio, no un LLM conversacional).

## Casos de uso

- Creacion de prototipos de video para produccion audiovisual: los creadores pueden generar bocetos rapidos de escenas con audio sincronizado usando Q4_K_M en una GPU de 16 GB, validando ideas antes de una produccion completa.
- Generacion de contenido para redes sociales: con Q5_K_M en una RTX 3090/4090 (24 GB), se pueden producir clips de video con coherencia multishot y audio integrado, ideales para plataformas como YouTube Shorts o TikTok.
- Desarrollo de storyboards animados: la capacidad multishot permite crear secuencias de varias escenas en una sola pasada, manteniendo la identidad visual y de personajes, util para previsualizacion de peliculas o anuncios.
- Doblaje y sincronizacion de audio: al generar audio y video juntos, se elimina la necesidad de herramientas externas de sincronizacion labial, agilizando el flujo de trabajo en proyectos de animacion o doblaje.
- Investigacion en generacion multimodal: el modelo sirve como base para experimentos academicos sobre generacion conjunta de video y audio, gracias a su arquitectura abierta y pesos accesibles.
- Fine-tuning para estilos especificos: al ser open weights, se puede ajustar el modelo (en su version BF16 original) para dominios concretos como video corporativo, tutoriales o contenido educativo, y luego cuantizarlo para despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas como FVD, CLIP score, ni comparaciones con otros modelos de generacion de video. La unica referencia de rendimiento es la tabla de requisitos de VRAM y la nota cualitativa del autor sobre la calidad de cada cuantizacion (Q4_K_M como mejor equilibrio, Q5_K_M como punto dulce en 24 GB, Q6_K casi identico a BF16, Q8_0 indistinguible del original).

## Requisitos de hardware

- Q2_K: ~6.8 GB de VRAM para pesos, recomendado 10-12 GB de GPU (incluyendo contexto y VAE). Calidad pobre, solo para pruebas.
- Q3_K_S: ~7.8 GB de VRAM, recomendado 12-16 GB. Calidad pobre, solo para pruebas.
- Q4_K_M: ~11.5 GB de VRAM, recomendado 16-20 GB (ej. RTX 4080). Mejor equilibrio calidad/rendimiento para hardware de consumo.
- Q5_K_M: ~14.2 GB de VRAM, recomendado 20-24 GB (ej. RTX 3090/4090). Mejor coherencia que Q4 sin superar limites de memoria.
- Q6_K: ~16.8 GB de VRAM, recomendado 24 GB (ej. RTX 3090/4090, Mac Studio). Muy cercano a BF16.
- Q8_0: ~23.0 GB de VRAM, recomendado 32 GB+ (Mac, doble GPU). Visualmente indistinguible del original.
- Ademas de los pesos, se necesitan 4-8 GB extra de VRAM para contexto de ejecucion, VAE y text encoders.
- Opciones de despliegue: ComfyUI (principal), tambien compatible con llama.cpp y otras herramientas que soporten GGUF. No se menciona vLLM ni TGI.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio. No se proporcionan datos de benchmarks ni se mencionan alternativas como otros modelos de generacion de video (por ejemplo, Stable Video Diffusion, Runway Gen-3, o el propio LTX-2.5 en BF16). La comparativa queda pendiente de datos externos.

## Limitaciones y advertencias

- Las cuantizaciones Q2_K y Q3_K_S producen resultados de calidad pobre y no son aptas para renders finales; solo para pruebas y prototipado.
- La licencia LTX-2.x Community License restringe el uso comercial: empresas con ingresos anuales superiores a 10 millones de dolares deben obtener un acuerdo comercial de pago con Lightricks.
- El repositorio no especifica los idiomas soportados por el text encoder, aunque al estar basado en Gemma 4 es probablemente multilingue; no hay confirmacion.
- No se proporcionan datos sobre sesgos del modelo, riesgo de alucinacion visual o limitaciones de contexto temporal (duracion maxima de video generado).
- El autor no es el creador del modelo original; los terminos de la licencia del modelo base se aplican integralmente.
- Para produccion, se recomienda usar al menos Q4_K_M; las variantes inferiores pueden generar artefactos visuales o incoherencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agosh/LTX-2.5-Comfy-GGUF
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
