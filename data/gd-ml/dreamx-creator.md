# GD-ML/DreamX-Creator

## Resumen

DreamX-Creator 1.0 es un sistema de generación nativa conjunta de audio y vídeo desarrollado por GD-ML, presentado en el paper arXiv 2608.31106. A diferencia de los generadores de vídeo convencionales que sintetizan el audio en una etapa separada, este modelo denoiza simultáneamente flujos de audio y vídeo especializados, condicionados por un primer fotograma y un prompt de texto. El sistema se centra en un generador compacto de 7B parámetros, lo que lo convierte en el modelo más pequeño con pesos descargables que combina generación nativa conjunta, salida oficial a 2K o superior y código abierto.

Su relevancia radica en democratizar la generación de contenido audiovisual de alta resolución, ya que permite a desarrolladores e investigadores producir vídeos con audio sincronizado sin depender de infraestructuras masivas. La licencia MIT facilita su adopción comercial y académica. Aunque la página de HuggingFace no ofrece detalles técnicos adicionales, el paper y los resúmenes disponibles describen una arquitectura innovadora que aborda el modelado recíproco de dinámicas visuales y eventos acústicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema de generación conjunta audio-vídeo con generador de 7B) |
| Parametros totales | 7B (según paper) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Según el paper, DreamX-Creator 1.0 emplea un generador de 7B parámetros que denoisa de forma conjunta dos flujos modalidad-específicos: uno para audio y otro para vídeo. El sistema se condiciona a un primer fotograma y a un prompt de texto, lo que permite modelar la sincronización temporal entre los eventos visuales y acústicos. No se han publicado detalles sobre la arquitectura interna (transformer, MoE, etc.), ni sobre el dataset de entrenamiento, el número de tokens, o si se aplicaron técnicas como RLHF o DPO. La innovación principal es el enfoque de generación nativa conjunta, que evita la separación en etapas típica de otros sistemas.

## Capacidades

- Generación de vídeo y audio sincronizados de forma nativa, sin etapas separadas.
- Condicionamiento por primer fotograma y prompt de texto.
- Resolución de salida oficial de 2K o superior.
- Modelo compacto de 7B que facilita su despliegue en hardware moderado.
- Peso descargable y licencia MIT para uso comercial y de investigación.
- Capacidad de modelar la relación temporal entre acciones visuales y sonidos (por ejemplo, un objeto al caer genera el sonido correspondiente en el momento adecuado).

## Casos de uso

- **Creación de contenido para redes sociales**: generar clips cortos con audio sincronizado para plataformas como TikTok o Instagram, partiendo de una imagen estática y una descripción textual.
- **Prototipado de escenas para cine y animación**: los directores pueden previsualizar secuencias con audio antes de la producción final, ahorrando costes de storyboard y sonido.
- **Generación de material educativo**: crear vídeos explicativos con narración y efectos sonoros a partir de diapositivas o ilustraciones.
- **Desarrollo de videojuegos**: producir cutscenes o cinemáticas con audio integrado para pruebas de concepto.
- **Accesibilidad**: generar descripciones audiovisuales de imágenes para personas con discapacidad visual, combinando vídeo generado y audio explicativo.
- **Automatización de marketing**: producir anuncios de producto con música y efectos de sonido a partir de una imagen del producto y un eslogan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper menciona que es el modelo más pequeño entre los que combinan generación nativa conjunta, pesos descargables y salida 2K, pero no se ofrecen métricas cuantitativas como FVD, FID, o evaluaciones de calidad de audio.

## Requisitos de hardware

- No se dispone de requisitos oficiales. Como estimación para un modelo de 7B en FP16, se necesitarían aproximadamente 14-16 GB de VRAM para inferencia (sin contar memoria del sistema).
- Con cuantización a 4 bits (GGUF o similar), podría caber en GPUs de consumo como RTX 3090, RTX 4090 o A4000 (16 GB).
- Para resolución 2K, la VRAM adicional dependerá del tamaño de los fotogramas y la duración; probablemente se requieran GPUs con 24 GB o más para secuencias largas.
- Opciones de despliegue: al ser un modelo de generación de vídeo, es probable que requiera frameworks específicos como Diffusers, aunque no se confirma. También podría adaptarse a vLLM o TGI si se convierte a formato de texto, pero su naturaleza es multimodal, por lo que no se recomienda sin documentación adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. Se menciona en el paper que es el más pequeño entre los sistemas con generación nativa conjunta, pesos descargables y 2K, pero no se listan modelos específicos con sus métricas. Por tanto, no se puede ofrecer una tabla comparativa fiable.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos, alucinaciones o fallos conocidos; al ser un modelo reciente y con pocas descargas, la comunidad aún no ha reportado experiencias extensas.
- La generación de vídeo y audio conjunta puede presentar artefactos en escenas complejas o con movimientos rápidos, aunque no hay evidencia documentada.
- La licencia MIT permite uso comercial, pero no se indican restricciones de atribución ni de uso de los pesos.
- No se especifican los idiomas soportados para los prompts; probablemente funcione mejor en inglés, pero no está confirmado.
- El modelo requiere de un primer fotograma, por lo que no puede generar vídeo desde cero sin una imagen inicial.
- No se dispone de documentación técnica detallada en la model card de HuggingFace; se recomienda consultar el paper para detalles de implementación.

## Enlaces

- HuggingFace: https://huggingface.co/GD-ML/DreamX-Creator
- Paper (arXiv): https://arxiv.org/html/2608.31106v1
- Resumen en OpenTrain AI: https://www.opentrain.ai/papers/dreamx-creator-democratizing-native-audio-video-generation-at-2k-resolution--arxiv-2608.31106/
- Artículo en cctest.ai: https://cctest.ai/en/articles/dreamx-creator-brings-native-audio-video-generation-to-2k
- Nota en lilys.ai: https://lilys.ai/en/notes/daily-papers-20260901/dreamx-creator-2k-av-gen
- Colección relacionada (DreamX-World-5B): https://huggingface.co/collections/SoulSeeker/gd-ml-dreamx-world-5b
