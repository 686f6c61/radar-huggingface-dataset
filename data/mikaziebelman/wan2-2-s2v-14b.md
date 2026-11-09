# mikaziebelman/Wan2.2-S2V-14B

## Resumen

Wan2.2-S2V-14B es un modelo de difusión de vídeo condicionado por audio (speech-to-video) desarrollado por el equipo Wan de Alibaba, publicado originalmente bajo la organización Wan-AI y reempaquetado en este repositorio por el usuario mikaziebelman. Su función es generar vídeo cinematográfico de personajes a partir de una imagen de referencia, una pista de audio y, opcionalmente, texto, sincronizando labios, gestos y movimiento corporal con la locución o el canto. Se presenta en el paper Wan-S2V: Audio-Driven Cinematic Video Generation (arXiv:2508.18621) y se construye sobre la base Wan2.2 (arXiv:2503.20314).

El modelo emplea una arquitectura de difusión con Mixture-of-Experts (MoE) introducida en Wan2.2, que separa el proceso de denoising por pasos temporales con expertos especializados para ampliar la capacidad sin incrementar proporcionalmente el coste computacional. El checkpoint aloja 16.295.755.609 parámetros en formato safetensors (aproximadamente 16,3 mil millones) y el repositorio ocupa 49,1 GB. Está pensado para producción audiovisual: animación de personajes con calidad de cine, interacciones complejas entre personajes, movimiento corporal realista y trabajo de cámara dinámico, superando según los autores a Hunyuan-Avatar y Omnihuman en sus experimentos.

Es relevante ahora porque cubre un hueco poco explorado en el ecosistema abierto: la animación de personajes guiada por audio con estética cinematográfica, frente a enfoques previos centrados casi exclusivamente en habla y canto. Se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, y está integrado en el ecosistema Diffusers y ComfyUI. La model card declara el idioma español (`es`) como único idioma soportado, aunque el modelo subyacente es multimodal audio-vídeo y no un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo con Mixture-of-Experts (MoE) sobre base Wan2.2; pipeline image-to-video / speech-to-video |
| Parametros totales | 16.295.755.609 (≈16,3 B) |
| Parametros activos | no disponible (el paper describe separación de expertos por timestep, pero no se publica el recuento activo) |
| Longitud de contexto | no disponible (modelo generativo de vídeo, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | español (`es`, según la model card); el condicionamiento es fundamentalmente acústico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Diffusers) |

## Arquitectura y entrenamiento

Wan2.2-S2V-14B se basa en la arquitectura de difusión de Wan2.2, que introduce un esquema Mixture-of-Experts en modelos de difusión de vídeo: el proceso de denoising se divide por pasos temporales y se asignan expertos especializados a distintas fases, de modo que la capacidad total del modelo crece sin multiplicar el coste de cómputo en inferencia. El modelo parte de una imagen de referencia y una señal de audio para generar vídeo sincronizado, incorporando datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico.

Según la model card, Wan2.2 se entrenó con un volumen de datos significativamente mayor que Wan2.1 (+65,6 % de imágenes y +83,2 % de vídeos), lo que mejora la generalización en movimiento, semántica y estética. El paper de Wan-S2V reporta experimentos comparativos frente a Hunyuan-Avatar y Omnihuman, así como aplicaciones en generación de vídeo de formato largo y edición precisa de lip-sync. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO; estos datos deben considerarse no disponibles.

## Capacidades

- Generación de vídeo cinematográfico de personajes a partir de audio (habla o canto) y una imagen de referencia.
- Sincronización labial (lip-sync) precisa con la pista de audio de entrada.
- Generación de movimiento corporal realista y gestos coherentes con la locución.
- Interacciones entre múltiples personajes y trabajo de cámara dinámico en escenas complejas.
- Generación de vídeo de formato largo (long-form video generation).
- Edición de lip-sync sobre vídeo existente.
- Control estético configurable (iluminación, composición, contraste, tono de color).
- Integración con Diffusers y ComfyUI para flujos de trabajo de generación de vídeo.
- No se documentan en la información disponible capacidades de tool calling, agentes ni razonamiento multi-paso, por tratarse de un modelo generativo de vídeo y no de un LLM.

## Casos de uso

- Doblaje y localización audiovisual: dado un vídeo o imagen de un actor y una pista de audio en español, el modelo regenera el movimiento facial y labial para ajustarlo a la nueva locución, reduciendo el coste frente a rodajes adicionales.
- Producción de contenido para redes sociales: generación de vídeos de presentadores virtuales a partir de una fotografía y un guion locutado, con estética cinematográfica y control de iluminación y composición.
- Animación de avatares corporativos: creación de vídeos de atención al cliente o formación interna con un avatar fijo que reproduce el audio corporativo, manteniendo coherencia visual entre entregas.
- Previsualización cinematográfica (previs): generación de escenas de personajes con movimiento corporal y cámara dinámica para validar guiones y storyboards antes del rodaje.
- Vídeo musical y contenido de canto: sincronización de labios y expresión facial con pistas vocales, aprovechando la capacidad del modelo para escenarios de canto además del habla.
- Edición de lip-sync en postproducción: corrección de tomas donde el audio de referencia cambió, sin necesidad de regrabar al intérprete.
- Generación de vídeo de formato largo: creación de piezas extendidas manteniendo la identidad del personaje a lo largo del metraje, según la aplicación explorada en el paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de Wan-S2V indica comparaciones cualitativas y experimentales frente a Hunyuan-Avatar y Omnihuman, con superioridad reportada por los autores, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 16,3 B de parámetros en safetensors y un repositorio de 49,1 GB, la inferencia en precisión completa requiere GPUs de数据中心 con 80 GB o más, y el uso de cuantización u offloading es previsible para hardware menor.
- GPU recomendadas: A100 (80 GB) o H100 para ejecución en precisión nativa; el ecosistema Wan2.2 documenta soporte para GPUs de consumo como la RTX 4090 en el modelo TI2V-5B, no necesariamente en este checkpoint de 14B.
- Cabe en GPU de consumo: no confirmado para este checkpoint de 14B; requiere verificación empírica y probablemente cuantización u offloading.
- Opciones de despliegue: Diffusers (librería declarada), ComfyUI (integrado para la familia Wan2.2), y los espacios Gradio oficiales de Wan-AI en Hugging Face y ModelScope.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-S2V-14B | ≈16,3 B | no disponible (vídeo cinematográfico, 720p en la familia Wan2.2) | Apache 2.0 | Hugging Face, Diffusers, ComfyUI |
| Hunyuan-Avatar | no disponible | no disponible | no disponible | referenciado como baseline en el paper |
| Omnihuman | no disponible | no disponible | no disponible | referenciado como baseline en el paper |
| Wan2.2-TI2V-5B | 5 B | 720p a 24 fps | Apache 2.0 | Hugging Face, Diffusers, ComfyUI |

Los datos de parámetros, contexto y licencia de Hunyuan-Avatar y Omnihuman no están disponibles en la información proporcionada; solo se confirma que el paper los emplea como referencia comparativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos audiovisuales, puede reproducir sesgos de representación de rostros, voces y estilos presentes en el corpus.
- Riesgo de alucinación visual: como modelo generativo, puede producir artefactos en manos, expresiones o coherencia temporal en escenas largas o audios fuera de distribución.
- Limitaciones de idioma: la model card declara únicamente español (`es`); el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las obligaciones de atribución y las condiciones de los datos de entrenamiento subyacentes, no detalladas aquí.
- Caveats para producción: el repositorio es un reempaquetado por un usuario tercero (mikaziebelman) con 0 descargas y 0 likes; conviene validar la integridad de los pesos frente al repositorio oficial de Wan-AI antes de desplegar.
- No se dispone de información sobre cuantizaciones oficiales, latencias medidas ni límites de resolución y duración para este checkpoint concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mikaziebelman/Wan2.2-S2V-14B
- Paper Wan-S2V: https://huggingface.co/papers/2508.18621
- Paper base Wan2.2: https://arxiv.org/abs/2503.20314
- Página del proyecto Wan-S2V: https://humanaigc.github.io/wan-s2v-webpage
- Informe técnico Wan-S2V (PDF): https://humanaigc.github.io/wan-s2v-webpage/content/wan-s2v.pdf
- Homepage de Wan: https://wan.video
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.2
- Organización Hugging Face oficial: https://huggingface.co/Wan-AI/
- Organización ModelScope: https://modelscope.cn/organization/Wan-AI
- Blog: https://wan.video/welcome
- Discord: https://discord.gg/AKNgpMK4Yj
- Guía de usuario (inglés): https://alidocs.dingtalk.com/i/nodes/EpGBa2Lm8aZxe5myC99MelA2WgN7R35y
- Guía de usuario (chino): https://alidocs.dingtalk.com/i/nodes/jb9Y4gmKWrx9eo4dCql9LlbYJGXn6lpz
- Demo Gradio en Hugging Face: https://huggingface.co/spaces/Wan-AI/Wan2.2-S2V
- Demo Gradio en ModelScope: https://www.modelscope.cn/studios/Wan-AI/Wan2.2-S2V
- Documentación ComfyUI Wan2.2 (EN): https://docs.comfy.org/tutorials/video/wan/wan2_2
- Documentación ComfyUI Wan2.2 (CN): https://docs.comfy.org/zh-CN/tutorials/video/wan/wan2_2
