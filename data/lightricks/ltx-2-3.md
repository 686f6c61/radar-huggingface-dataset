# Lightricks/LTX-2.3

## Resumen

LTX-2.3 es un modelo fundacional de difusión para la generación conjunta de vídeo y audio, desarrollado por Lightricks. Se trata de una actualización significativa de LTX-2 que mejora la calidad audiovisual y la adherencia a las instrucciones del prompt, manteniendo la filosofía de pesos abiertos y ejecución local. El modelo se presenta en el paper "LTX-2: Efficient Joint Audio-Visual Foundation Model" (arXiv:2601.03233).

La arquitectura se basa en un Diffusion Transformer (DiT) que genera de forma sincronizada píxeles de vídeo y muestras de audio dentro de un mismo modelo, cubriendo un espectro amplio de tareas: texto a vídeo, imagen a vídeo, vídeo a vídeo, audio a vídeo, texto a audio, vídeo a audio, audio a audio y combinaciones multimodales (texto+imagen a audio+vídeo). El checkpoint principal dispone de 22.000 millones de parámetros en precisión bf16.

Su relevancia actual radica en que ofrece generación audiovisual conjunta con pesos abiertos, algo poco habitual en modelos de esta categoría, y en que incluye variantes destiladas de 8 pasos (CFG=1) y upscalers espaciales y temporales que permiten pipelines multietapa para resoluciones y tasas de fotogramas superiores. El repositorio en Hugging Face acumula cerca de un millón de descargas y más de 2.000 likes, lo que refleja una adopción notable en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) audio-video conjunto |
| Parametros totales | 22B (checkpoint ltx-2.3-22b) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de contexto textual) |
| Tipos de cuantizacion | bf16 en el checkpoint dev; variantes destiladas y LoRA de 384; no se detallan otras cuantizaciones |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt (segun metadatos); la model card indica English como idioma principal |
| Licencia | ltx-2-community-license-agreement (license: other) |
| Formato de pesos | safetensors / diffusers (repo de 157,6 GB) |

## Arquitectura y entrenamiento

LTX-2.3 es un modelo de difusión basado en transformer (DiT) diseñado para generar vídeo y audio sincronizados en una sola pasada. Integra los bloques constructivos habituales de la generación de vídeo moderna (VAE latente, denoiser transformer, condicionamiento cruzado texto/imagen/audio) y añade una rama de audio que comparte el proceso de difusión con la rama visual, de modo que ambos flujos se generan conjuntamente en lugar de encadenarse en dos modelos separados. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset.

El ecosistema incluye varios checkpoints: el modelo completo `ltx-2.3-22b-dev` (entrenable en bf16), las variantes destiladas `ltx-2.3-22b-distilled` y `ltx-2.3-22b-distilled-1.1` (8 pasos, CFG=1), LoRAs de destilación de rango 384 aplicables al modelo completo, y tres upscalers sobre latentes: espacial x2 (1.1), espacial x1.5 (1.0) y temporal x2 (1.0), pensados para pipelines multietapa de mayor resolución y FPS. El código se organiza en un monorepo (`ltx-core`, `ltx-pipelines`, `ltx-trainer`), probado con Python >= 3.12, CUDA > 12.7 y PyTorch ~= 2.7. La model card no especifica detalles sobre RLHF/DPO ni sobre la innovación de atención; únicamente destaca la eficiencia del modelo conjunto frente a enfoques separados.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) e imagen (image-to-video).
- Transformación de vídeo existente (video-to-video) y combinación imagen+texto a vídeo.
- Generación de audio condicionada por texto, vídeo o audio (text-to-audio, video-to-audio, audio-to-audio).
- Generación conjunta y sincronizada de audio y vídeo desde texto, imagen o ambos (text-audio-video, image-audio-video, image-text-audio-video).
- Generación de audio con habla y con contenido no verbal (la model card advierte menor calidad en audio sin habla).
- Soporte multilingüe declarado en metadatos para nueve idiomas (en, de, es, fr, ja, ko, zh, it, pt).
- Entrenamiento y ajuste fino: el modelo dev es totalmente entrenable; se pueden reproducir LoRAs e IC-LoRAs con el trainer oficial.
- Upscaling espacial (x1.5, x2) y temporal (x2) sobre latentes para pipelines multietapa.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, por tratarse de un modelo generativo audiovisual y no de un LLM.

## Casos de uso

- Producción de vídeo publicitario con audio sincronizado: a partir de una imagen de producto y un prompt de texto, el modelo genera un clip con banda sonora coherente en una sola pasada, reduciendo el número de herramientas del pipeline.
- Doblaje y localización de contenido: usando video-to-audio y audio-to-audio se puede regenerar la pista de audio de un vídeo existente con otro idioma o estilo, manteniendo la sincronización labial aproximada que proporciona el modelo conjunto.
- Previsualización rápida de storyboards: con las variantes destiladas de 8 pasos (CFG=1) se obtienen borradores audiovisuales en pocas iteraciones, adecuados para iterar guiones antes de una renderización final con el modelo dev.
- Generación de clips para redes sociales a partir de una foto: image-to-video permite animar una imagen fija con movimiento y sonido, un flujo útil para creadores que trabajan con material fotográfico.
- Postproducción y ampliación de material: los upscalers espaciales x1.5/x2 y el temporal x2 permiten escalar resolución y FPS de clips generados o existentes en pipelines multietapa, sin reentrenar el modelo base.
- Creación de efectos de sonido y ambientes: text-to-audio y video-to-audio sirven para generar pistas de ambiente o Foley sincronizadas con una secuencia, aunque la model card advierte de menor calidad en audio sin habla.
- Personalización de estilo o identidad: mediante LoRA/IC-LoRA entrenadas con `ltx-trainer` (menos de una hora en muchos casos según la model card) se puede fijar un estilo visual o una voz concreta para series de contenido.
- Integración en ComfyUI: los nodos nativos LTXVideo permiten a estudios pequeños montar flujos de generación audiovisual sin escribir código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card. Como referencia orientativa, un checkpoint de 22B en bf16 ocupa aproximadamente 44 GB solo en pesos, a lo que hay que sumar activaciones y latentes de vídeo/audio; las variantes destiladas y las LoRA reducen el coste por pasos, no necesariamente la huella de pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo completo en bf16 requiere GPUs de centro de datos con 80 GB (A100, H100) o configuraciones multi-GPU; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en consumer GPU?: no confirmado. Un modelo de 22B en bf16 excede los 24 GB de una RTX 4090; haría falta cuantización o descarga por capas, y la model card no documenta cuantizaciones GGUF/INT4 para este checkpoint.
- Opciones de despliegue: ComfyUI con los nodos LTXVideo integrados, el monorepo oficial `ltx-pipelines` (PyTorch ~= 2.7, CUDA > 12.7, Python >= 3.12) y el playground/API en la nube de LTX. El soporte en Diffusers está anunciado como "coming soon" en la model card.
- Latencia y throughput: no disponibles. Las variantes destiladas usan 8 pasos con CFG=1, lo que reduce el número de evaluaciones del modelo frente a un muestreo estándar con guidance.
- Restricciones de forma de entrada: ancho y alto deben ser divisibles por 32; el número de fotogramas debe cumplir (n divisible por 8) + 1. Si no se cumple, se rellena con -1 y se recorta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Audio conjunto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3 (Lightricks) | 22B | Difusión vídeo+audio; texto, imagen, vídeo y audio como entrada | Sí, en un solo modelo | ltx-2-community-license-agreement | Pesos abiertos en HF, ComfyUI, playground |
| LTX-2 (Lightricks) | no disponible | Difusión vídeo+audio | Sí | licencia comunitaria LTX-2 | Pesos abiertos en HF (modelo predecesor) |
| LTX-2.5 (Lightricks) | 22B (según nombres de LoRA publicados) | Difusión vídeo con LoRAs de control (slow motion, cinemagraph, IC-LoRA) | no disponible | no disponible | Pesos y LoRAs en HF |
| Alternativas de vídeo generativo de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos competidores de otros desarrolladores, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo no está diseñado ni es capaz de proporcionar información factual; no debe usarse como fuente de datos.
- Como modelo estadístico, puede amplificar sesgos sociales existentes en los datos de entrenamiento.
- Puede fallar en generar vídeos que coincidan exactamente con el prompt; el seguimiento de instrucciones depende en gran medida del estilo de redacción del prompt.
- Puede generar contenido inapropiado u ofensivo; se requiere filtrado y moderación en producción.
- La calidad del audio sin habla puede ser inferior a la del audio con voz.
- La licencia es `ltx-2-community-license-agreement` (license: other), no una licencia permisiva estándar: es imprescindible revisar sus términos antes de un uso comercial, ya que puede imponer restricciones de atribución, uso o redistribución.
- La model card declara English como idioma del modelo en la sección de detalles, pese a que los metadatos listan nueve idiomas; conviene validar el rendimiento multilingüe antes de confiar en él.
- El soporte en Diffusers no está disponible todavía ("coming soon"), lo que limita la integración con flujos estándar de esa librería.
- No hay datos publicados de VRAM, latencia ni throughput, lo que dificulta el dimensionamiento de infraestructura.
- El tamaño del repositorio (157,6 GB) implica requisitos de almacenamiento y ancho de banda considerables para descarga y despliegue local.
- Las restricciones de resolución (divisible por 32) y de fotogramas ((n divisible por 8) + 1) obligan a preprocesar las entradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lightricks/LTX-2.3
- Modelo predecesor LTX-2: https://huggingface.co/Lightricks/LTX-2
- Paper (arXiv): https://huggingface.co/papers/2601.03233
- Repositorio de código: https://github.com/Lightricks/LTX-2
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2
- Pipelines de inferencia: https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/README.md
- Trainer: https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-trainer/README.md
- Documentación de ComfyUI: https://docs.ltx.video/open-source-model/integration-tools/comfy-ui
- Guía de prompting: https://ltx.video/blog/how-to-prompt-for-ltx-2
- Demo (playground i2v): https://app.ltx.studio/ltx-2-playground/i2v
- API Playground: https://console.ltx.video/playground/
- Vídeo de presentación: https://youtu.be/o-7us-BR_gQ
- Organización en Hugging Face: https://huggingface.co/Lightricks
- Web de Lightricks: https://www.lightricks.com/
- GitHub de Lightricks: https://github.com/Lightricks
