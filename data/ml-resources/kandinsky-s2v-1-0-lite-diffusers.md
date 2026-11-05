# ml-resources/Kandinsky-S2V-1.0-Lite-Diffusers

## Resumen

Kandinsky S2V 1.0 Lite es un modelo de generación de vídeo a partir de habla (speech-to-video) desarrollado por el equipo de Kandinsky (kandinskylab). Su función es animar una persona a partir de una única imagen de referencia y una pista de audio de voz, generando un vídeo de avatar en el que se anima la figura completa, no solo la cabeza. El audio actúa como condición: el modelo no genera sonido, sino que sincroniza el movimiento del sujeto con la locución proporcionada.

Este repositorio concreto (`ml-resources/Kandinsky-S2V-1.0-Lite-Diffusers`) es una redistribución del checkpoint lite en formato Diffusers, con los pesos organizados para su uso mediante el pipeline modular de Diffusers. El modelo emplea una arquitectura de difusión de vídeo con flow matching (Euler), un transformer 3D específico, un VAE basado en `AutoencoderKLHunyuanVideo`, un text encoder Qwen2.5-Omni Thinker y un segundo encoder CLIP.

Con 2.266.618.304 parámetros totales y un repositorio de 23,9 GB, es relevante para desarrolladores que necesitan generar avatares parlantes realistas a partir de una sola fotografía, con soporte de memoria entre fragmentos (FramePack) para secuencias largas. Su licencia MIT facilita la integración en productos comerciales, si bien el uso responsable exige consentimiento del sujeto animado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo con transformer 3D (`KandinskyS2VTransformer3DModel`), VAE `AutoencoderKLHunyuanVideo`, scheduler `FlowMatchEulerDiscreteScheduler` |
| Parametros totales | 2.266.618.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación por fragmentos de 125 frames) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | no disponible (condicionado por el text encoder Qwen2.5-Omni y CLIP; la entrada principal es audio) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Diffusers) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión para vídeo con flow matching Euler, configurado a 50 pasos y classifier-free guidance de 3.0. La generación se articula en fragmentos de 125 frames a 25 fps (5 segundos por fragmento), con resolución seleccionada entre los buckets de 512 según la relación de aspecto de la imagen de referencia. Para secuencias más largas que un fragmento, el modelo genera de forma iterativa, condicionando cada fragmento en el anterior mediante la memoria FramePack, lo que permite mantener coherencia temporal en locuciones extensas.

El bundle incluye cuatro componentes principales: el transformer 3D (4,2 GiB), el VAE (0,9 GiB), el text encoder Qwen2.5-Omni Thinker (16,6 GiB) y un segundo text encoder CLIP (0,5 GiB), más el scheduler. El checkpoint se exporta sin el Talker del Omni completo ni la torre de visión de CLIP, ya que ninguno de los dos se utiliza en la inferencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo de avatar a partir de una imagen de referencia y una pista de audio de voz.
- Animación de la figura completa, no limitada al rostro o la cabeza.
- Sincronización del movimiento con el habla de entrada (el audio es condición, no salida).
- Generación de secuencias largas mediante fragmentos encadenados con memoria FramePack.
- Selección automática de resolución entre buckets de 512 según la relación de aspecto de la referencia.
- Salida a 25 fps con 125 frames por fragmento (5 segundos).
- Soporte de pipeline modular en Diffusers (`ModularPipeline`).
- No genera audio: la pista original se añade al vídeo final en el postprocesado.

## Casos de uso

- Generación de avatares corporativos: a partir de una fotografía del portavoz y una locución grabada, se produce un vídeo de presentación sin necesidad de rodaje adicional, adecuado para formación interna o comunicaciones.
- Localización de contenido audiovisual: se puede reutilizar una imagen de referencia y sustituir la pista de voz por una versión doblada a otro idioma, manteniendo la animación sincronizada con el nuevo audio.
- Prototipado rápido de personajes para videojuegos o narrativa interactiva: el modelo permite animar un retrato conceptual con una línea de diálogo para validar la expresividad antes de invertir en captura de movimiento.
- Asistentes virtuales con presencia visual: integración en interfaces conversacionales donde se requiere un rostro animado que acompañe la respuesta de voz sintetizada.
- Marketing y redes sociales: generación de vídeos cortos de 5 segundos a partir de una foto de producto o de un influencer virtual, con encadenado de fragmentos para piezas más largas.
- Investigación en animación facial y corporal: el modelo sirve como base para experimentos de sincronización labial y coherencia temporal gracias a su memoria entre fragmentos.
- Accesibilidad: creación de vídeos con intérprete o presentador animado a partir de una imagen y una locución generada por TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El bundle completo en bfloat16 ocupa aproximadamente 22,2 GiB en pesos (4,2 + 0,9 + 16,6 + 0,5 GiB), por lo que se requiere una GPU con al menos 24 GB de VRAM para cargar todos los componentes, y más para los estados intermedios de difusión.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) como mínimo para el bundle completo en bfloat16.
- GPU de consumo: cabe en RTX 4090 (24 GB) de forma ajustada; en GPUs de 16 GB o menos requeriría cuantización u offloading, no documentado en la información disponible.
- Opciones de despliegue: pipeline modular de Diffusers (`ModularPipeline`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La configuración por defecto es de 50 pasos de flow matching Euler con CFG 3.0 por fragmento de 125 frames.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Licencia | Formato |
|---|---|---|---|---|
| Kandinsky S2V 1.0 Lite | 2.266.618.304 | 125 frames por fragmento (5 s a 25 fps), encadenable | MIT | safetensors (Diffusers) |
| Alternativas speech-to-video | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo anima a una persona real a partir de una fotografía; es obligatorio contar con el consentimiento del sujeto y no presentar el resultado como una grabación genuina.
- Riesgo de uso malicioso (deepfakes): la licencia MIT no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el integrador.
- No genera audio: la pista de voz debe proporcionarse externamente y añadirse al vídeo en el postprocesado.
- La generación de secuencias largas depende del encadenado por FramePack; pueden aparecer derivas o inconsistencias entre fragmentos.
- Resolución limitada a los buckets de 512, lo que restringe la calidad para producción de alta definición.
- No se documentan sesgos, composición del dataset ni evaluación de robustez, lo que dificulta estimar el comportamiento en sujetos diversos.
- El modelo no forma parte de una versión publicada de Diffusers; requiere el pipeline modular y puede sufrir cambios de API.
- No se dispone de información sobre idiomas soportados ni sobre el rendimiento en voces no inglesas.
- El repositorio es una redistribución de terceros (`ml-resources`) con 0 descargas y 0 likes; conviene verificar la integridad frente al repositorio original de kandinskylab.

## Enlaces

- [HuggingFace: ml-resources/Kandinsky-S2V-1.0-Lite-Diffusers](https://huggingface.co/ml-resources/Kandinsky-S2V-1.0-Lite-Diffusers)
- [Repositorio original: kandinskylab/Kandinsky-S2V-1.0-Lite](https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Lite)
- [Paper (arXiv:2610.19290)](https://arxiv.org/pdf/2610.19290)
- [Página del proyecto](https://kandinskyavatar.github.io)
- [Repositorio de código en GitHub](https://github.com/kandinskylab/kandinsky-s2v)
- [Colección de modelos en HuggingFace](https://huggingface.co/collections/kandinskylab/kandinsky-s2v-10-6ab65ebe8f765b6dd9d706d7)
- [Demo en HuggingFace Spaces](https://huggingface.co/spaces/kandinskylab/Kandinsky-S2V-1.0-Demo)
