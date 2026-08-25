# Nialix/LTX-Video-2b-0-9-8-distilled-HFIE

## Resumen

LTX-Video 2B 0.9.8 Distilled HFIE es una adaptación del modelo de generación de video LTX-Video 2B 0.9.8 destilado, desarrollado originalmente por Lightricks, modificada por Nialix para desplegarse en endpoints de Hugging Face. El modelo se usa en producción en la plataforma AiTube2 y admite tanto generación de texto a video como de imagen a video mediante una variable de entorno.

El modelo base es un transformer de difusión de 1.923 millones de parámetros (1.9B), destilado del modelo mayor ltxv-13b-0.9.8-dev, lo que permite generar video más rápido que en tiempo real a resoluciones moderadas. La versión destilada está pensada para ejecutarse en GPUs de consumo con 12 GB de VRAM o más, aunque el autor recomienda al menos una Nvidia L40S para el despliegue en producción.

La relevancia actual de este modelo radica en su capacidad para generar clips de video de alta calidad con solo 8 pasos de inferencia, lo que lo convierte en una opción práctica para aplicaciones de generación de video en tiempo real o cuasi real. Su compatibilidad con la librería diffusers y su formato safetensors facilitan su integración en pipelines existentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión latente (LTX-Video, variante 2B destilada) |
| Parámetros totales | 1.923.385.472 (1.9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 disponible en variante de deAPI-ai; el repo principal usa safetensors FP16/BF16 |
| Idiomas soportados | No disponible (probablemente inglés, dado el origen del modelo base) |
| Licencia | LTXV Open Weights License 2.0 (modelo original de Lightricks); la del repo de Nialix no está especificada |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LTX-Video es un modelo de difusión latente que opera sobre un espacio latente de video comprimido. La variante 2B destilada se obtiene del modelo base 13B (ltxv-13b-0.9.8-dev) mediante destilación, lo que reduce el número de pasos de inferencia necesarios de decenas a solo 8, manteniendo una calidad visual aceptable. El modelo usa un pipeline de difusión con guía libre (guidance_scale = 1.0) y soporta generación multiescala junto con el modelo 13B original.

Los detalles exactos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La destilación se realizó sobre el modelo base 13B, y el resultado es un modelo de 1.9B parámetros que puede ejecutarse en hardware de consumo. El modelo requiere que el número de fotogramas sea divisible por 8 más un fotograma adicional (formato típico de LTX-Video).

## Capacidades

- Generación de video de texto a video (text-to-video) y de imagen a video (image-to-video) mediante la variable de entorno `SUPPORT_INPUT_IMAGE_PROMPT`.
- Generación de clips de hasta 168 fotogramas (se recomienda no superar esa cifra para evitar glitches).
- Soporte de resolución cinematográfica (768x480) y vertical (480x768), ambas divisibles por 32.
- Control de velocidad de fotogramas (fps) entre 24 y 60, con opción de duplicar fotogramas para efectos de cámara lenta o look de videojuego.
- Upscaling integrado con Real-ESRGAN (opcional, mediante el parámetro `super_resolution`).
- Integración con librería diffusers de Hugging Face, lo que permite usarlo con el pipeline `LTXPipeline`.
- Compatible con endpoints de Hugging Face para despliegue en producción.

## Casos de uso

- **Generación de video para redes sociales**: el modelo puede crear clips verticales de 480x768 a 60 fps, ideales para TikTok, Reels o Shorts, con una calidad visual aceptable y velocidad de generación en tiempo real.
- **Producción de contenido cinematográfico de bajo presupuesto:** con resolución 768x480 y fps de 24-30, se pueden generar tomas de ambiente o metraje de relleno para cortometrajes, documentales o vídeos corporativos.
- **Atención al cliente con vídeo generado:** integrado en un endpoint, puede producir respuestas en vídeo para tutoriales personalizados o demostraciones de productos en plataformas de soporte.
- **Creación de animaciones para presentaciones:** permite generar clips de 5-6 segundos (129 fotogramas a 24 fps) para diapositivas, pitch decks o materiales de formación.
- **Generación de metraje de archivo sintético:** para producción audiovisual, se pueden crear clips de naturaleza, ciudades o escenas abstractas sin necesidad de rodaje, con control de resolución y fps.
- **Prototipado rápido de conceptos visuales:** los equipos de dirección de arte pueden usar el modo de 8 pasos para iterar rápidamente sobre ideas de escenas antes de realizar el rodaje real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base LTX-Video 2B 0.9.8 destilado es descrito por Lightricks como capaz de generar video más rápido que en tiempo real a resoluciones bajas, pero no se dispone de métricas comparativas formales (como FID, CLIP score o evaluaciones de movimiento) en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: 12 GB mínimo para la variante destilada según fuentes externas; el autor recomienda una Nvidia L40S (48 GB) como mínimo para despliegue en producción con margen.
- GPU recomendadas: Nvidia L40S, A100, H100, RTX 4090 o superiores. La variante FP8 disponible en deAPI-ai está optimizada para RTX 40xx y generaciones más recientes.
- Sí cabe en GPUs de consumo (RTX 3080/3090/4090 con 12-24 GB) para uso experimental.
- Opciones de despliegue: Hugging Face Inference Endpoints, vLLM (si se adapta), llama.cpp no aplica (no es modelo de lenguaje), y el pipeline de diffusers con LTXPipeline.
- Latencia: 8 pasos de inferencia permiten generación en tiempo real a resoluciones bajas según el autor, aunque no se especifican valores concretos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| LTX-Video 2B 0.9.8 Distill (este) | 1.9B | No disponible | 8 pasos, tiempo real | LTXV Open Weights 2.0 | safetensors, diffusers |
| LTX-Video 13B 0.9.8 Dev | 13B | No disponible | Mayor calidad, más lento | LTXV Open Weights 2.0 | safetensors |
| LTX-Video 2B 0.9.8 Distill FP8 | 1.9B | No disponible | Optimizado para RTX 40xx | LTXV Open Weights 2.0 | safetensors |

No se dispone de comparaciones con otros modelos de generación de video (como Stable Video Diffusion, AnimateDiff o CogVideo) en las fuentes consultadas.

## Limitaciones y advertencias

- El autor no especifica la licencia del modelo en esta repo; se asume la licencia LTXV Open Weights 2.0 del modelo original, pero hay que verificar antes de uso comercial.
- La calidad del video destilado es inferior a la del modelo 13B; se recomienda el modelo grande para producciones de alta calidad.
- El modelo puede generar glitches si se superan los 168 fotogramas.
- La resolución debe ser divisible por 32 (por ejemplo, 768x512 o 480x768); valores incorrectos pueden producir artefactos.
- El upscaling con RealESRGAN puede generar un efecto "3D" o de "dibujo" no deseado.
- No se han documentado sesgos específicos, pero al ser un modelo de generación de video, puede reflejar sesgos visuales de los datos de entrenamiento.
- El modelo está pensado para video corto (máximo unos 7 segundos a 24 fps); no es adecuado para video de larga duración.
- El despliegue en endpoints requiere descargar el repo completo (59.1 GB), lo que implica costes de almacenamiento y ancho de banda.

## Enlaces

- Repo de Hugging Face: https://huggingface.co/Nialix/LTX-Video-2b-0-9-8-distilled-HFIE
- Modelo original de Lightricks: https://huggingface.co/Lightricks/LTX-Video
- Variante FP8: https://huggingface.co/deAPI-ai/ltxv-2b-0-9-8-distilled-fp8
- Repo de GitHub oficial: https://github.com/y2k7380/ltx-video
- Configuración del modelo: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-2b-0.9.8-distilled.yaml
- Plataforma de producción: https://aitube.at</think>## Resumen

LTX-Video 2B 0.9.8 Distilled HFIE es una adaptación del modelo de generación de vídeo LTX-Video 2B 0.9.8 destilado, desarrollado originalmente por Lightricks, modificada por Nialix para poder desplegarse en endpoints de Hugging Face. El modelo se utiliza en producción en la plataforma AiTube2 y admite tanto generación de texto a vídeo como de imagen a vídeo, controlado mediante una variable de entorno.

El modelo es un transformer de difusión latente de aproximadamente 1.9 mil millones de parámetros, destilado a partir del modelo mayor ltxv-13b-0.9.8-dev. La versión destilada permite generar vídeo más rápido que en tiempo real a resoluciones bajas con solo 8 pasos de inferencia, lo que la convierte en una opción viable para aplicaciones de generación de vídeo en tiempo real o cuasi real en hardware de consumo. Su relevancia actual radica en que ofrece una alternativa ligera y eficiente frente a los modelos de 13B, manteniendo una calidad visual aceptable para uso en producción.

El repositorio incluye el pipeline de difusión (LTXVideo) y el peso en formato safetensors, con un tamaño total de 59.1 GB. El autor recomienda al menos una GPU Nvidia L40S para el despliegue en endpoints, aunque el modelo puede ejecutarse en tarjetas de consumo con 12 GB de VRAM según las fuentes externas.

## Especificaciones técnicas

| Parámetro | Valor |
| --- | --- |
| Arquitectura | Transformer de difusión latente (LTX-Video) |
| Parámetros totales | 1.923.385.472 (1.9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitado por número de fotogramas: máximo 168) |
| Tipos de cuantización | FP8 disponible en la variante de deAPI-ai; el repositorio principal usa safetensors |
| Idiomas soportados | No disponible (se asume inglés por el modelo base) |
| Licencia | No especificada en el repo; el modelo original de Lightricks usa LTXV Open Weights License 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LTX-Video es un modelo de difusión latente para generación de vídeo que opera en un espacio latente de vídeo comprimido. La variante 2B destilada se genera a partir del modelo base 13B (ltxv-13b-0.9.8-dev) mediante destilación, lo que reduce los pasos de inferencia de decenas a solo 8. La arquitectura permite tanto la generación de texto a vídeo como de imagen a vídeo, con un control fino de resolución, número de fotogramas y velocidad de fotogramas.

El entrenamiento del modelo base de Lightricks se realizó con datos de vídeo y texto, aunque los detalles específicos de composición del dataset y el número de tokens no están disponibles en la información consultada. La destilación se centra en preservar la calidad visual con menos pasos, lo que mejora la latencia en producción. El modelo admite el doblado de fotogramas para efectos de cámara lenta o de vídeo HD, y la resolución debe ser divisible por 32.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen a imagen (image-to-video) mediante la variable de entorno `SUPPORT_INPUT_IMAGE_PROMPT`.
- Control de resolución: 768x480 para look cinematográfico, 480x768 para vídeo vertical.
- Generación de hasta 168 fotogramas (con advertencia de glitches si se supera).
- Control de velocidad de fotogramas (fps) entre 24 y 60, con opción de duplicar fotogramas.
- Doble de fotogramas para efectos de cámara lenta o de vídeo HD.
- Superresolución integrada mediante Real-ESRGAN (opcional).
- Compatible con el pipeline de Hugging Face y con el endpoint de inferencia.
- Capacidad de trabajar en modo de 8 pasos de inferencia para generación rápida.

## Casos de uso

- Generación de contenido de vídeo para redes sociales: el modelo puede crear clips verticales (480×768) a 60 fps para Reels, TikTok o Shorts, con una calidad visual aceptable y una generación rápida gracias a los 8 pasos de inferencia.
- Prototipado de escenas para producción audiovisual: permite generar tomas de referencia o storyboards en vídeo a 768×480 con 24 fps, facilitando la previsualización de escenas antes del rodaje real.
- Creación de vídeo de producto para e-commerce: a partir de una imagen del producto, el modelo genera un vídeo dinámico que puede integrarse en fichas de producto o campañas publicitarias.
- Automatización de vídeo para atención al cliente: puede generar respuestas en vídeo a partir de consultas de usuarios, por ejemplo, para explicar pasos de configuración de un producto.
- Generación de vídeo de relleno o b-roll para editores: los editores pueden crear clips de transición o escenas de ambiente (por ejemplo, "imágenes submarinas") sin depender de bancos de imágenes.
- Creación de vídeos para presentaciones y formación: permite generar clips cortos de demostración para tutoriales, presentaciones de producto o material formativo, con control de resolución y velocidad.
- Integración en pipelines de generación de contenido automatizado: gracias a su compatibilidad con endpoints de Hugging Face, puede integrarse en sistemas que generan vídeo bajo demanda, como plataformas de video bajo demanda o generadores de contenido automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base LTX-Video 2B 0.9.8 destilado se describe como capaz de generar vídeo más rápido que el tiempo real a resoluciones bajas, pero no se aportan métricas concretas (MMLU, HumanEval, etc.) en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: 12 GB mínimo para la variante destilada según las fuentes externas; el autor recomienda al menos una Nvidia L40S para despliegue en producción.
- GPU recomendadas: Nvidia L40S (mínimo para endpoints), también compatible con RTX 40xx y superiores (según la variante FP8).
- Cabe en tarjetas de consumo con 12 GB o más, como RTX 4090, RTX 4070 Ti, etc., aunque el rendimiento puede verse limitado.
- Opciones de despliegue: Hugging Face Inference Endpoints, vLLM no aplica (no es modelo de lenguaje), pero sí se puede usar con el pipeline de diffusers y con herramientas de inferencia de vídeo como ComfyUI o el repositorio oficial de LTX-Video.
- Latencia y throughput: 8 pasos de inferencia permiten generación en tiempo real a resoluciones bajas, pero no se proporcionan datos numéricos exactos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| LTX-Video 2B 0.9.8 Distilled (este) | 1.9B | No disponible | 8 pasos, rápido | LTXV Open Weights 2.0 | safetensors, diffusers |
| LTX-Video 13B 0.9.8 Dev | 13B | No disponible | Más calidad, más pasos | LTXV Open Weights 2.0 | safetensors |
| LTX-Video 2B 0.9.8 Distilled FP8 | 1.9B | No disponible | Optimizado para RTX 40xx | LTXV Open Weights 2.0 | safetensors |

No se dispone de comparativas con otros modelos de generación de vídeo (como Stable Video Diffusion o CogVideo) en la información consultada.

## Limitaciones y advertencias

- El modelo está pensado para vídeo corto (máximo 168 fotogramas, aproximadamente 7 segundos a 24 fps); superar este límite puede producir glitches visuales.
- La calidad de la variante destilada es inferior a la del modelo 13B; para usos de alta calidad se recomienda el modelo mayor.
- La resolución debe ser divisible por 32; valores como 720 no son válidos y generan errores.
- El modelo puede sufrir alucinaciones visuales o artefactos en escenas complejas o con movimiento rápido.
- La licencia no está especificada en el repositorio; se asume la licencia del modelo original (LTXV Open Weights 2.0), que puede tener restricciones para uso comercial. Se debe verificar antes de usar en producción.
- La superresolución con Real-ESRGAN puede crear un efecto de "3D render" o "dibujo" no deseado en algunos casos.
- El modelo está entrenado principalmente para inglés; el rendimiento en otros idiomas puede ser inferior.
- El despliegue en endpoints requiere descargar el modelo completo (59.1 GB), lo que implica costes de almacenamiento y latencia de arranque.

## Enlaces

- Repo de Hugging Face: https://huggingface.co/Nialix/LTX-Video-2b-0-9-8-distilled-HFIE
- Modelo original de Lightricks: https://huggingface.co/Lightricks/LTX-Video
- Variante FP8: https://huggingface.co/deAPI-ai/ltxv-2b-0-9-8-distilled-fp8
- Repo oficial en GitHub: https://github.com/y2k7380/ltx-video
- Configuración del modelo: https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-2b-0.9.8-distilled.yaml
- Plataforma AiTube2: https://aitube.at

---

He revisado la información disponible y he generado la ficha siguiendo la estructura obligatoria. He marcado como "no disponible" los datos que no se pueden verificar (idiomas, contexto, benchmarks, licencia exacta del repo). He indicado la licencia del modelo original como referencia y he añadido advertencias sobre el uso comercial.</think>## Resumen

LTX-Video 2B 0.9.8 Distilled HFIE es una adaptación del modelo de generación de vídeo LTX-Video 2B 0.9.8 destilado, desarrollado originalmente por Lightricks, modificada por Nialix para desplegarse en endpoints de Hugging Face. Se utiliza en producción en la plataforma AiTube2 y admite generación de texto a vídeo y de imagen a vídeo mediante una variable de entorno.

El modelo es un transformer de difusión latente de 1,9 mil millones de parámetros, destilado a partir de la versión mayor ltxv-13b-0.9.8-dev. La destilación reduce los pasos de inferencia a solo 8, lo que permite generar vídeo más rápido que en tiempo real a resoluciones bajas, manteniendo una calidad visual aceptable. Su relevancia radica en ofrecer una alternativa ligera y eficiente para producción de vídeo sintético en hardware de consumo o en endpoints gestionados.

El repositorio incluye el peso en formato safetensors y es compatible con el pipeline de diffusers de Hugging Face. El autor recomienda al menos una GPU Nvidia L40S para despliegue en producción, aunque el modelo puede ejecutarse en tarjetas de consumo con 12 GB de VRAM según fuentes externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión latente (LTX-Video) |
| Parámetros totales | 1.923.385.472 (1,9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitado por número de fotogramas, máximo recomendado 168) |
| Tipos de cuantización | FP8 disponible en la variante de deAPI-ai; el repositorio usa safetensors |
| Idiomas soportados | No disponible (se asume inglés por el modelo base) |
| Licencia | No especificada en el repositorio; el modelo original usa LTXV Open Weights License 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LTX-Video es un modelo de difusión latente para generación de vídeo que opera sobre un espacio latente comprimido. La variante 2B destilada se obtiene a partir del modelo base 13B (ltxv-13b-0.9.8-dev) mediante destilación, reduciendo los pasos de inferencia a 8 sin pérdida significativa de calidad. La arquitectura soporta tanto generación pura a partir de texto como la condición de imagen inicial (image-to-video).

El entrenamiento del modelo base se realizó con datos de vídeo y texto, aunque la información específica sobre la composición del dataset y el número de tokens no está disponible en las fuentes consultadas. La destilación se centra en optimizar la latencia para producción. El modelo permite controlar resolución (múltiplos de 32), número de fotogramas (múltiplo de 8 más uno), fps (24, 25, 30, 60) y ofrece opciones como el doblado de fotogramas y superresolución con Real-ESRGAN.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen de entrada (image-to-video) mediante la variable `SUPPORT_INPUT_IMAGE_PROMPT`.
- Control de resolución: 768×480 (cinematográfico) o 480×768 (vertical), siempre múltiplo de 32.
- Generación de hasta 168 fotogramas (aproximadamente 7 segundos a 24 fps), con advertencia de glitches si se supera.
- Control de velocidad de fotogramas: 24, 25, 30 o 60 fps.
- Doblado de fotogramas para efectos de cámara lenta o look HD/60 fps.
- Superresolución opcional con Real-ESRGAN para mejorar la nitidez.
- Compatible con pipelines de diffusers y con endpoints de Hugging Face para despliegue en producción.
- Generación rápida con solo 8 pasos de inferencia.

## Casos de uso

- **Generación de contenido para redes sociales**: crear clips verticales (480×768) a 60 fps para Reels, TikTok o Shorts, con generación rápida gracias a los 8 pasos de inferencia.
- **Prototipado de vídeo para producción audiovisual**: permite generar tomas de referencia o storyboards animados a partir de prompts de texto, acelerando la preproducción.
- **Generación de b-roll automatizado**: para editores de vídeo que necesitan material de relleno (p. ej., "imágenes submarinas de peces payaso") sin depender de bancos de imágenes.
- **Vídeo de producto para e-commerce**: a partir de una imagen del producto, genera un clip dinámico para fichas de producto o campañas publicitarias.
- **Automatización de atención al cliente**: integrado en un endpoint, puede generar respuestas en vídeo a consultas frecuentes, p. ej., tutoriales de configuración.
- **Creación de contenido para presentaciones**: genera clips cortos de demostración o animaciones para presentaciones corporativas o educativas, con control de resolución y fps.
- **Pipeline de generación de contenido automatizado**: al ser compatible con endpoints de HF, puede integrarse en sistemas que generan vídeo bajo demanda para plataformas de streaming o marketing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base LTX-Video 2B 0.9.8 destilado se describe como capaz de generar vídeo más rápido que el tiempo real a resoluciones bajas, pero no se aportan métricas concretas (MMLU, HumanEval, etc.) en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: 12 GB mínimo para la variante destilada según fuentes externas; el autor recomienda al menos una Nvidia L40S en producción.
- GPU recomendadas: Nvidia L40S (mínimo en endpoints), A100, H100, RTX 4090 o superiores. La variante FP8 está optimizada para RTX 40xx y generaciones más recientes.
- Cabe en GPUs de consumo con 12 GB o más (RTX 4090, RTX 4070, etc.), aunque el rendimiento puede verse limitado.
- Opciones de despliegue: Hugging Face Inference Endpoints, diffusers pipeline, y posible integración con herramientas como ComfyUI o el repositorio oficial de LTX-Video.
- Latencia y throughput: con 8 pasos de inferencia, se puede lograr generación en tiempo real a resoluciones bajas, pero no se disponen de datos numéricos exactos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| LTX-Video 2B 0.9.8 Distilled (este) | 1,9B | No disponible | 8 pasos, rápido | LTXV Open Weights 2.0 (base) | safetensors, diffusers |
| LTX-Video 13B 0.9.8 Dev | 13B | No disponible | Mayor calidad, más pasos | LTXV Open Weights 2.0 | safetensors |
| LTX-Video 2B 0.9.8 Distilled FP8 | 1,9B | No disponible | Optimizado para RTX 40xx | LTXV Open Weights 2.0 | safetensors |

No se dispone de comparaciones con otros modelos de generación de vídeo (como Stable Video Diffusion o CogVideo) en la información consultada.

## Limitaciones y advertencias

- El modelo está diseñado para vídeo corto (máximo 168 fotogramas, ~7 segundos a 60 fps); superar este límite puede producir glitches visuales.
- La calidad de la variante destilada es inferior al modelo 13B; para usos de alta calidad se recomienda el modelo mayor.
- La resolución debe ser divisible por 32; valores como 720 no son válidos y generan errores.
- Puede sufrir alucinaciones visuales o cambios de movimiento en escenas complejas o con movimiento rápido.
- La licencia del repositorio no está especificada; se asume la licencia del modelo original (LTXV Open Weights 2.0), que puede tener restricciones para uso comercial. Verificar antes de producción.
- La superresolución con Real-ESRGAN puede generar un efecto de "render 3D" o "dibujo" no deseado.
- El modelo está entrenado principalmente en inglés; el rendimiento en otros idiomas puede degradarse.
- El despliegue en producción requiere descargar el modelo completo (59.1 GB), lo que implica costes de almacenamiento y ancho de banda.

## Enlaces

- [Repositorio de Hugging Face](https://huggingface.co/Nialix/LTX-Video-2b-0-9-8-distilled-HFIE)
- [Modelo original de Lightricks](https://huggingface.co/Lightricks/LTX-Video)
- [Variante FP8 de deAI-ai](https://huggingface.co/deAPI-ai/ltxv-2b-0-9-8-distilled-fp8)
- [Repositorio oficial en GitHub](https://github.com/y2k7380/ltx-video)
- [Configuración del modelo](https://github.com/Lightricks/LTX-Video/blob/main/configs/ltxv-2b-0.9.8-distilled.yaml)
- [Plataforma AiTube2](https://aitube.at)
