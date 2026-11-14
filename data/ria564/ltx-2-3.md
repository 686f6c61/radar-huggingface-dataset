# Ria564/LTX-2.3

## Resumen

LTX-2.3 es un modelo fundacional de difusión para generación conjunta de audio y vídeo, desarrollado por Lightricks como una actualización significativa de LTX-2. Se presenta como un modelo DiT (Diffusion Transformer) capaz de generar vídeo y audio sincronizados dentro de un único modelo, cubriendo un amplio abanico de modalidades: texto a vídeo, imagen a vídeo, vídeo a vídeo, audio a vídeo, texto a audio y combinaciones audio-visuales. La versión 2.3 mejora la calidad visual y de audio, así como la adherencia al prompt respecto a su predecesor.

El modelo se distribuye en varios checkpoints: una versión completa de 22 mil millones de parámetros entrenable en bf16, versiones destiladas de 8 pasos con CFG=1, adaptadores LoRA y upscalers espaciales y temporales para pipelines multietapa. Está pensado para ejecución local y se integra con ComfyUI y la librería Diffusers (soporte en camino).

Es relevante ahora porque ofrece pesos abiertos bajo una licencia comunitaria propia, con un enfoque en eficiencia y ejecución práctica en hardware de consumo, algo poco habitual en modelos audio-visuales de esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) audio-video |
| Parametros totales | 22B (checkpoint `ltx-2.3-22b-dev`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (dev); destilado 8 pasos CFG=1; LoRA 384; upscalers x1.5, x2 espacial y x2 temporal |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | diffusers (safetensors), repositorio de 156 GB |

## Arquitectura y entrenamiento

LTX-2.3 es un modelo de difusión basado en transformer (DiT) diseñado para generar audio y vídeo sincronizados en un único modelo. Combina los bloques constructivos habituales de la generación de vídeo moderna con un componente de audio integrado, permitiendo tareas cruzadas entre modalidades (texto, imagen, vídeo y audio como entradas y salidas). El modelo se publica en variantes: la versión completa `22b-dev` entrenable en bf16, versiones destiladas de 8 pasos con CFG=1 (`distilled` y `distilled-1.1`), adaptadores LoRA de rango 384 aplicables al modelo completo, y upscalers espaciales (x1.5 y x2) y temporal (x2) para pipelines multietapa de mayor resolución y FPS.

El modelo se presentó en el paper "LTX-2: Efficient Joint Audio-Visual Foundation Model" (arXiv:2601.03233). El repositorio oficial incluye el código de definición del modelo (`ltx-core`), pipelines (`ltx-pipelines`) y capacidades de entrenamiento (`ltx-trainer`), probado con Python ≥3.12, CUDA >12.7 y PyTorch ~2.7. El modelo base (dev) es totalmente entrenable y permite reproducir LoRAs e IC-LoRAs; según la model card, el entrenamiento para movimiento, estilo o semejanza (sonido y apariencia) puede completarse en menos de una hora en muchos entornos. No se detallan en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Edición/transformación de vídeo (video-to-video).
- Generación condicionada por imagen y texto simultáneamente (image-text-to-video).
- Generación de vídeo a partir de audio (audio-to-video).
- Generación de audio a partir de texto (text-to-audio).
- Generación de audio a partir de vídeo (video-to-audio).
- Transformación de audio (audio-to-audio).
- Generación conjunta de audio y vídeo desde texto, imagen o ambas (text-to-audio-video, image-to-audio-video, image-text-to-audio-video).
- Sincronización de audio y vídeo dentro de un único modelo.
- Soporte multilingüe en prompts (en, de, es, fr, ja, ko, zh, it, pt).
- Capacidad de entrenamiento y ajuste fino (modelo dev entrenable, LoRAs e IC-LoRAs).
- Upscaling espacial (x1.5, x2) y temporal (x2) mediante modelos auxiliares.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Generación de clips publicitarios con audio sincronizado: a partir de un prompt de texto o una imagen de producto, el modelo produce vídeo y audio coherentes en una sola pasada, reduciendo la necesidad de pipelines separados de vídeo y sonido.
- Doblaje y localización de vídeo: usando video-to-audio y audio-to-audio, se puede regenerar la pista de audio de un clip existente o transformar una locución, útil para adaptar contenido a distintos mercados.
- Prototipado rápido de storyboards animados: image-to-video permite animar ilustraciones o fotogramas clave para previsualizar escenas antes de producir el render final.
- Creación de contenido para redes sociales: text-to-audio-video facilita generar piezas cortas con imagen y sonido integrados, con variantes destiladas de 8 pasos para iterar rápido.
- Postproducción y mejora de material existente: los upscalers espaciales y temporales permiten aumentar resolución y FPS de latentes generados en pipelines multietapa.
- Investigación en modelos generativos audio-visuales: al ser el modelo dev totalmente entrenable y publicarse el código (`ltx-core`, `ltx-pipelines`, `ltx-trainer`), sirve como base para experimentos de ajuste fino con LoRAs e IC-LoRAs en menos de una hora en muchos entornos.
- Automatización de contenido en ComfyUI: integración mediante los nodos LTXVideo del ComfyUI Manager para flujos de trabajo de generación y edición de vídeo con audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint completo es de 22B parámetros en bf16 (aproximadamente 44 GB solo en pesos), por lo que la versión dev requiere GPUs de alta gama o cuantización/offloading.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, se orienta a A100/H100 para el modelo completo y a GPUs de consumo para las variantes destiladas y LoRA, aunque no se confirman modelos concretos.
- Cabe en consumer GPU: no confirmado en la información proporcionada; las variantes destiladas de 8 pasos y los adaptadores LoRA están pensados para reducir requisitos, pero no se detallan cifras.
- Opciones de despliegue: ComfyUI (nodos LTXVideo integrados), codebase PyTorch oficial (`ltx-pipelines`), Diffusers (soporte "coming soon"), API Playground en la nube.
- Latencia y throughput estimados: no disponibles; las versiones destiladas usan 8 pasos con CFG=1, lo que reduce el coste de inferencia frente al modelo completo.
- Restricciones de formato: ancho y alto deben ser divisibles por 32; el número de fotogramas debe ser divisible por 8 + 1; en caso contrario, se rellena con -1 y se recorta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3 (Lightricks) | 22B | no disponible | texto, imagen, vídeo, audio (entrada/salida) | ltx-2-community-license-agreement | Pesos abiertos en HF, ComfyUI, API |
| LTX-2 (Lightricks) | no disponible | no disponible | audio-vídeo | licencia comunitaria LTX-2 | Pesos abiertos en HF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos competidores de generación audio-visual para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no está diseñado ni es capaz de proporcionar información factual.
- Como modelo estadístico, puede amplificar sesgos sociales existentes.
- Puede fallar al generar vídeos que coincidan perfectamente con el prompt.
- La adherencia al prompt depende en gran medida del estilo de redacción del prompt.
- Puede generar contenido inapropiado u ofensivo.
- Cuando se genera audio sin habla, la calidad del audio puede ser inferior.
- La licencia es comunitaria (`ltx-2-community-license-agreement`), no open source estándar; es necesario revisar sus términos para uso comercial.
- Aunque la model card lista nueve idiomas, la sección "Model Details" indica únicamente inglés como idioma del modelo, lo que genera ambigüedad sobre el soporte multilingüe real.
- No se documentan capacidades de tool calling ni de agentes.
- El tamaño del repositorio (156 GB) y el modelo de 22B implican requisitos de almacenamiento y cómputo considerables.
- Restricciones de resolución y número de fotogramas (divisibilidad por 32 y 8+1) condicionan el pipeline de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/Ria564/LTX-2.3
- Modelo base LTX-2: https://huggingface.co/Lightricks/LTX-2
- Paper: https://huggingface.co/papers/2601.03233
- Repositorio GitHub: https://github.com/Lightricks/LTX-2
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2
- Demo online (playground): https://app.ltx.studio/ltx-2-playground/i2v
- API Playground: https://console.ltx.video/playground/
- Documentación ComfyUI: https://docs.ltx.video/open-source-model/integration-tools/comfy-ui
- Guía de prompting: https://ltx.video/blog/how-to-prompt-for-ltx-2
- Vídeo de presentación: https://youtu.be/o-7us-BR_gQ
- Paquete de pipelines: https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/README.md
- Entrenador: https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-trainer/README.md
- Diffusers: https://huggingface.co/docs/diffusers/main/en/index
