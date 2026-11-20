# DmitryDB/HunyuanVideo-1.5-ComfyUI-Quants

## Resumen

HunyuanVideo-1.5-ComfyUI-Quants es un repositorio de redistribución de pesos cuantizados del modelo de generación de vídeo HunyuanVideo 1.5, desarrollado originalmente por Tencent. Este repositorio, publicado por el usuario DmitryDB, no contiene un modelo nuevo ni pesos oficiales: empaqueta los checkpoints de difusión de HunyuanVideo 1.5 en formato INT8 (variante "Lean ConvRot") junto con los componentes auxiliares necesarios (text encoders, VAE, SigCLIP y upsamplers latentes) para su uso directo en ComfyUI.

El interés práctico del repositorio radica en que reduce el peso de los checkpoints de difusión a aproximadamente 7,9 GiB por variante, lo que facilita su despliegue en entornos ComfyUI con GPUs de gama alta de consumo, frente a los pesos en precisión completa del repositorio oficial. Incluye variantes separadas para texto-a-vídeo (T2V) e imagen-a-vídeo (I2V), a resoluciones de 480p, 720p y 1080p, además de checkpoints de superresolución (SR) que operan en una segunda etapa de generación.

Es relevante para desarrolladores que ya trabajan con ComfyUI y quieren experimentar con HunyuanVideo 1.5 sin descargar los pesos originales, pero conviene subrayar que el autor declara explícitamente que no se trata de una release oficial y que no ha realizado pruebas nuevas de inferencia ni de rendimiento sobre estos ficheros. La licencia es la de Tencent (marcada como "other"), con limitaciones territoriales y términos de uso aceptable que deben revisarse antes de cualquier uso o redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (detalles internos no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (variante "Lean ConvRot") en los checkpoints de difusión; FP16 en VAE y en el text encoder ByT5; BF16 en el text encoder Qwen2.5-VL-7B |
| Idiomas soportados | no disponible |
| Licencia | other (licencia de Tencent, con limitaciones territoriales y términos de uso aceptable) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de HunyuanVideo 1.5 (tipo de backbone, número de parámetros, mecanismo de atención o composición del dataset de entrenamiento). Lo que sí se detalla es la estructura de componentes que requiere el pipeline en ComfyUI: dos text encoders cargados mediante DualCLIPLoader (Qwen2.5-VL-7B en BF16 y ByT5 en FP16), un VAE específico de HunyuanVideo 1.5 en FP16, SigCLIP para flujos condicionados por imagen y upsamplers latentes para la etapa de superresolución.

El repositorio no aporta información sobre el proceso de entrenamiento, el número de tokens vistos, ni si hubo etapas de alineación como RLHF o DPO. La única modificación técnica documentada es la cuantización de los pesos de difusión a INT8 con el esquema "Lean ConvRot", que reduce cada checkpoint a unos 7,9 GiB. El autor indica que los checkpoints T2V e I2V son independientes, que los checkpoints SR y el upsampler latente correspondiente pertenecen a una segunda etapa separada de la generación inicial, y que debe usarse una planificación de pasos (schedule) acorde a la variante seleccionada: base, destilada por CFG o destilada por pasos.

## Capacidades

- Generación de vídeo a partir de texto (T2V) en variantes de 480p y 720p.
- Generación de vídeo condicionada por imagen (I2V) en variantes de 480p y 720p, con checkpoints base, destilados por CFG y destilados por pasos.
- Superresolución de vídeo generado (SR) en 720p y 1080p como segunda etapa del pipeline, mediante checkpoints SR y upsamplers latentes dedicados.
- Codificación de texto dual: Qwen2.5-VL-7B (que aporta comprensión multimodal texto-imagen) y ByT5 (codificador basado en bytes orientado a glifos y texto literal).
- Condicionamiento visual mediante SigCLIP en flujos image-conditioned.
- Integración nativa con ComfyUI mediante los loaders estándar (DualCLIPLoader con tipo HunyuanVideo 1.5, loader de VAE y loader de modelo de difusión).
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Prototipado rápido de texto-a-vídeo en ComfyUI: cargar el checkpoint `hunyuanvideo1.5-480p-t2v-cfg-distilled-int8-lean-Convrot.safetensors` con DualCLIPLoader (Qwen2.5-VL-7B + ByT5) y el VAE de HunyuanVideo 1.5 permite generar clips a 480p con una planificación CFG-distilled, adecuada para iterar prompts con coste computacional contenido.
- Animación de imágenes fijas para previsualización de storyboards: la variante `480p-i2v-step-distilled` está pensada para flujos imagen-a-vídeo con pocos pasos, lo que encaja en la generación de animáticas rápidas a partir de keyframes o ilustraciones.
- Generación de material promocional en 720p: el checkpoint `720p-t2v` (no destilado) permite obtener clips de mayor calidad cuando se dispone de presupuesto de cómputo y se necesita fidelidad al prompt, integrándose en un pipeline ComfyUI con el VAE y los text encoders del repositorio.
- Reescalado de vídeo generado a 1080p: tras una primera pasada a 720p, el checkpoint `1080p-sr-distilled` junto con `hunyuanvideo15_latent_upsampler_1080p.safetensors` constituye la segunda etapa de superresolución documentada por el autor.
- Investigación sobre cuantización de modelos de difusión de vídeo: al tratarse de pesos INT8 "Lean ConvRot" redistribuidos, sirve para estudiar el impacto de la cuantización en la calidad de generación comparando contra los pesos oficiales de Tencent en el mismo pipeline ComfyUI.
- Integración en flujos de trabajo de creación de contenido con ComfyUI: el conjunto de ficheros (text encoders, VAE, SigCLIP, upsamplers) está organizado por carpetas de `ComfyUI/models`, lo que simplifica el despliegue en instalaciones existentes y la reutilización de nodos y plantillas de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta subida no constituye una nueva prueba de inferencia ni de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de tamaños, cada checkpoint de difusión INT8 ocupa unos 7,9 GiB, el text encoder Qwen2.5-VL-7B en BF16 ocupa 15,4 GiB, el VAE 2,3 GiB, SigCLIP 0,8 GiB y ByT5 0,4 GiB; el total de componentes cargados simultáneamente supera ampliamente la VRAM de una GPU de consumo, por lo que se requiere gestión de carga por etapas o offload.
- GPU recomendadas: no disponible en la información proporcionada. Por el volumen de los componentes, se intuye necesidad de GPUs de gama profesional o de consumo alta con suficiente VRAM, pero no hay cifras oficiales.
- ¿Cabe en GPU de consumo? No hay datos oficiales. La cuantización INT8 de los checkpoints de difusión reduce el peso respecto a los pesos completos, pero el text encoder Qwen2.5-VL-7B en BF16 (15,4 GiB) es el componente más exigente.
- Opciones de despliegue: ComfyUI, con DualCLIPLoader (tipo HunyuanVideo 1.5), loader de modelo de difusión, loader de VAE y carga de SigCLIP y upsamplers latentes. El autor advierte de que debe usarse una versión de ComfyUI con soporte para este modelo y su cuantización. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| HunyuanVideo-1.5-ComfyUI-Quants (este repositorio) | no disponible | 480p, 720p, 1080p (SR); T2V e I2V | other (Tencent) | Hugging Face, pesos INT8 para ComfyUI |
| tencent/HunyuanVideo-1.5 (oficial) | no disponible | 480p, 720p, 1080p; T2V e I2V | licencia de Tencent | Hugging Face, pesos originales |
| Comfy-Org/HunyuanVideo_1.5_repackaged | no disponible | mismas resoluciones | licencia de Tencent | Hugging Face, repackaging oficial para ComfyUI |

La comparación con otros modelos de generación de vídeo (por ejemplo, familias como Wan, CogVideoX o Mochi) no está disponible en la información proporcionada, por lo que no se incluyen cifras ni valoraciones frente a ellos.

## Limitaciones y advertencias

- Este repositorio no es una release oficial: el autor declara que los pesos no son de upstream y que Tencent no respalda esta colección.
- No se han realizado pruebas de inferencia ni de rendimiento sobre estos ficheros; la calidad de la cuantización INT8 "Lean ConvRot" no está validada en la model card.
- Licencia "other" basada en la licencia de Tencent: incluye limitaciones territoriales y términos de uso aceptable que deben leerse antes de usar o redistribuir los pesos (`licenses/Tencent-LICENSE.txt` y `licenses/Tencent-NOTICE.txt`).
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de generación de vídeo, los riesgos se refieren a contenido visual no fiel al prompt o estereotipado, pero no hay datos concretos.
- Idiomas soportados: no disponibles; el pipeline usa Qwen2.5-VL-7B y ByT5 como codificadores, pero no se especifica cobertura lingüística.
- Requiere una versión de ComfyUI compatible con HunyuanVideo 1.5 y con la cuantización INT8; versiones anteriores pueden no cargar los checkpoints.
- Los checkpoints T2V, I2V y SR son independientes y deben combinarse con la planificación de pasos adecuada (base, CFG-distilled o step-distilled); usar una planificación incorrecta puede degradar la calidad.
- El elevado tamaño del text encoder Qwen2.5-VL-7B en BF16 condiciona los requisitos de VRAM y puede obligar a estrategias de offload.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DmitryDB/HunyuanVideo-1.5-ComfyUI-Quants
- Modelo oficial de Tencent: https://huggingface.co/tencent/HunyuanVideo-1.5
- Repackaging oficial para ComfyUI: https://huggingface.co/Comfy-Org/HunyuanVideo_1.5_repackaged
- Licencia de Tencent incluida en el repositorio: `licenses/Tencent-LICENSE.txt`
- Avisos de upstream incluidos en el repositorio: `licenses/Tencent-NOTICE.txt`
