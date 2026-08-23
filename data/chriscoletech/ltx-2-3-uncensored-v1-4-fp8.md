# ChrisColeTech/LTX-2.3-uncensored-v1.4-FP8

## Resumen

LTX-2.3-uncensored-v1.4-FP8 es un modelo de generación de vídeo por difusión, desarrollado por ChrisColeTech a partir del modelo base Lightricks/LTX-2.3. Se distribuye en formato GGUF cuantizado a FP8 y tiene integrados tres LoRA en sus pesos: un LoRA NSFW extremo (Eros10), un LoRA destilado DMD para generación en pocos pasos y el ICLoRA Detailer oficial de Lightricks para mejorar la adherencia a imágenes de referencia. El modelo soporta múltiples modos de generación: texto a vídeo, imagen a vídeo, vídeo a vídeo y audio a vídeo.

El modelo tiene 21.005 millones de parámetros (21 B) y está diseñado para producir vídeo de alta calidad en 4 a 9 pasos de inferencia, con resolución nativa de hasta 1280×736 píxeles y secuencias de hasta 960 fotogramas (aproximadamente 40 segundos). Su relevancia actual reside en que combina generación rápida con contenido no censurado, algo poco habitual en los modelos de vídeo de código abierto, y en que su formato GGUF FP8 permite ejecutarlo en GPUs de consumo con 16–24 GB de VRAM.

La licencia del modelo es desconocida y no se especifican los idiomas soportados. El repositorio pesa 273,9 GB en total, aunque el archivo de pesos cuantizado FP8 es considerablemente menor. La model card indica que hay guardas (guardrails) para prevenir contenido ilegal, pero no detalla cuáles son.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con audio integrado |
| Parametros totales | 21.005.004.544 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | FP8 (formato GGUF), también disponible en otras cuantizaciones según el repositorio |
| Idiomas soportados | No disponibles |
| Licencia | unknown (desconocida) |
| Formato de pesos | GGUF (FP8) |

## Arquitectura y entrenamiento

El modelo se basa en un Diffusion Transformer (DiT), la arquitectura estándar de los modelos de difusión de vídeo modernos. A diferencia de los modelos de difusión de imágenes, LTX-2.3 integra un módulo de audio que permite generar sonido sincronizado con el vídeo, incluyendo diálogos, efectos ambientales y música. El modelo original de Lightricks (LTX-2.3) es un modelo de 22B parámetros entrenado con técnicas de destilación para reducir el número de pasos de inferencia.

Esta versión concreta, la v1.4 de ChrisColeTech, no es un entrenamiento desde cero sino una fusión de tres LoRA sobre el modelo base de Lightricks:

1. **Eros10 Extreme NSFW LoRA**: un LoRA de fine-tuning para contenido NSFW de alta calidad y coherencia, aplicado con fuerza 1.0.
2. **DMD Distilled LoRA**: un LoRA de destilación que reduce los pasos de generación a 4–8 y mejora la adherencia a instrucciones y la preservación facial en imagen a vídeo, aplicado con fuerza 1.0.
3. **ICLoRA Detailer de Lightricks**: el LoRA de contexto de Lightricks para mejorar la adherencia a imágenes de referencia, aplicado con fuerza 0.6.

La model card indica que el modelo puede generar vídeo en 4 pasos, siendo 8 pasos el valor recomendado para mejor calidad. El CFG (escala de guía) se ajusta entre 1.0 y 3.8 según el estilo deseado: CFG 1.0 para escenas lentas e íntimas sin diálogo, CFG 3.8 para escenas cinematográficas con diálogo y sonido.

## Capacidades

- **Generación de vídeo por texto**: genera vídeo de hasta 960 fotogramas (≈40 s) a partir de prompts en lenguaje natural.
- **Generación de vídeo por imagen**: utiliza una imagen como primer fotograma, preservando la identidad del personaje o escena.
- **Vídeo a vídeo**: permite transformar un vídeo existente manteniendo coherencia temporal.
- **Audio a vídeo**: genera vídeo a partir de audio, incluyendo sincronización de labios y efectos sonoros.
- **Generación de audio sincronizado**: produce diálogos, ambiente y efectos de sonido coherentes con la escena.
- **Generación en pocos pasos**: funciona con 4–9 pasos de inferencia, con la destilación DMD integrada.
- **Soporte de referencia múltiple**: admite REF2VA (referencia a imagen) para mantener consistencia del personaje a lo largo de secuencias largas.
- **Contenido no censurado**: no tiene filtros de contenido sexual, aunque la model card indica que hay guardrails para prevenir contenido ilegal.

## Casos de uso

- **Producción audiovisual independiente**: creadores de contenido pueden generar escenas cinematográficas con diálogo y sonido sincronizado sin necesidad de equipos de grabación, usando CFG 3.8 para obtener movimiento y audio de calidad cinematográfica.
- **Animación de personajes para NSFW**: artistas de contenido adulto pueden generar vídeos de personajes consistentes a partir de una imagen de referencia, manteniendo la identidad del personaje a lo largo de secuencias de 40 segundos, útil para animación de cómics o ilustraciones.
- **Prototipado de escenas para cine**: directores y guionistas pueden generar vídeos de prueba de escenas completas con diálogo y efectos, antes de realizar la producción real, gracias al modo imagen a vídeo y audio a vídeo.
- **Creación de contenido para plataformas de streaming**: generación de escenas de ambiente (lluvia, tráfico, multitudes) con sonido ambiente realista, a partir de prompts simples y en pocos pasos, para usar como relleno en ediciones de vídeo.
- **Generación de vídeos de referencia para VFX**: los equipos de efectos visuales pueden generar secuencias de referencia de movimiento y cámara con CFG alto para planificar tomas complejas, sin necesidad de rodaje.
- **Estudio de comportamiento de modelos de vídeo**: investigadores pueden analizar cómo la fusión de LoRA (destilación, NSFW y detalle) afecta a la coherencia temporal y la adherencia a instrucciones, comparando con el modelo base LTX-2.3.
- **Generación de vídeos para juegos de rol o narrativa interactiva**: creadores de aventuras conversacionales pueden generar escenas cortas de vídeo con audio para acompañar las interacciones de los jugadores, usando el modo texto a vídeo con 8 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (como FVD, CLIP score, o comparativas con otros modelos). Se indica únicamente que el modelo produce vídeo de alta calidad en 4–9 pasos y que la destilación DMD mejora la adherencia a instrucciones y la preservación facial, pero sin datos numéricos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo FP8 tiene 21B parámetros, por lo que necesita aproximadamente 21–24 GB de VRAM en FP8. Con cuantizaciones menores (Q4, Q5) podría caber en 16 GB.
- **GPU recomendadas**: RTX 4090 (24 GB) para FP8 completo, RTX 3090 (24 GB) con offloading, o GPUs de 16 GB con cuantización inferior.
- **Compatibilidad con consumer GPU**: sí, es viable en RTX 4090 y en RTX 3090 con offloading. Para GPUs de 12 GB se recomienda usar cuantizaciones más agresivas.
- **Opciones de despliegue**: el formato GGUF es compatible con ComfyUI (el flujo de trabajo se proporciona en la model card), llama.cpp y herramientas que soporten GGUF para vídeo. También se puede usar vLLM o TGI si se convierten los pesos a safetensors.
- **Latencia y throughput**: no se proporcionan datos exactos. El modelo genera vídeo de 5 segundos en 8 pasos; con una RTX 4090 se estima una generación de 10–30 segundos por vídeo, dependiendo de la resolución y los fotogramas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resolución máxima | Audio | Licencia | Formato |
|---|---|---|---|---|---|---|
| **LTX-2.3-uncensored-v1.4-FP8** (este) | 21 B | no disponible | 1280×736, 960 frames | Sí | unknown | GGUF |
| **Lightricks/LTX-2.3** (base) | 22 B | no disponible | 1280×736, 960 frames | Sí | Apache 2.0 (según Lightricks) | safetensors |
| **Wan 2.1** | 14 B | no disponible | 1280×720, 480 frames | No | Apache 2.0 | safetensors, GGUF |
| **HunyuanVideo** | 13 B | no disponible | 1280×720, 720 frames | No | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de benchmarks comparativos entre estos modelos. La comparativa se basa en características públicas. La principal diferencia de este modelo frente a la base es la integración de las LoRAs de destilación y NSFW, que reducen los pasos de 4–8 y eliminan los filtros de contenido. La licencia es desconocida, lo que limita su uso comercial.

## Limitaciones y advertencias

- **Contenido NSFW**: el modelo está diseñado para generar contenido sexual explícito. No es adecuado para entornos profesionales o públicos sin filtros adicionales.
- **Licencia desconocida**: la model card indica `license: unknown`. Esto implica que no se pueden conocer las restricciones de uso comercial, redistribución o modificación. No se recomienda su uso en producción sin consultar con el autor.
- **Riesgo de alucinación**: como todos los modelos de difusión, puede generar vídeos con incoherencias visuales o de audio, especialmente en escenas complejas o con muchos objetos.
- **Sesgos y contenido ilegal**: aunque la model card menciona guardrails para prevenir contenido ilegal, no se especifica su eficacia. El modelo puede generar contenido que viole leyes locales en ciertos países.
- **Requisitos de hardware elevados**: el tamaño de 273,9 GB del repositorio y la necesidad de 21 GB de VRAM en FP8 limitan el uso a GPUs de gama alta.
- **Idiomas**: no se especifican los idiomas soportados para el prompt. El modelo es de origen inglés, por lo que el prompt en otros idiomas puede degradar la calidad.
- **Estabilidad del modelo**: al ser una fusión de tres LoRA con fuerzas distintas (1.0, 1.0, 0.6), la calidad puede variar según el prompt y el modo de generación. No se garantiza coherencia en todas las configuraciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-v1.4-FP8)
- [Modelo base Lightricks/LTX-2.3](https://huggingface.co/Lightricks/LTX-2.3)
- [LoRA Eros10 (TenStrip/LTX2.3-10Eros)](https://huggingface.co/TenStrip/LTX2.3-10Eros)
- [LoRA DMD (TenStrip/LTX2.3_DMD_Lora)](https://huggingface.co/TenStrip/LTX2.3_DMD_Lora)
- [Flujo de trabajo de ComfyUI (JSON)](https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json)
- [Blog de Siray sobre LTX 2.3 NSFW](https://blog.siray.ai/ltx-2-3-nsfw/)
