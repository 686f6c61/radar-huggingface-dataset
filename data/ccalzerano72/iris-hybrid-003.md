# ccalzerano72/IRis-hybrid-003

## Resumen

IRis-hybrid-003 es un checkpoint de un modelo de difusión latente para restauración ciega de imagen (*blind image restoration*), desarrollado por el usuario ccalzerano72 en el marco de la tesis de máster «Blind Image Restoration via Dual-Conditioned Latent Diffusion» de la Universidad de Pisa. Se publica como un *checkpoint* intermedio identificado como `002_re_015000` (15.000 iteraciones) y se distribuye a través de HuggingFace con la librería `diffusers` y pipeline `image-to-image`.

El modelo parte de Stable Diffusion 2.1 y lo adapta a una tarea de restauración: el UNet tiene su primera convolución expandida a 8 canales de entrada, de forma que recibe simultáneamente el latente de la imagen degradada (4 canales) y el latente ruidoso (4 canales). A esto se añade una rama ControlNet condicionada por la imagen degradada en espacio de píxeles, entrenada de forma conjunta con el UNet. El resultado es una arquitectura de condicionamiento dual que no depende de texto: la cross-attention usa el embedding de texto vacío porque el condicionamiento ARNIQA está desactivado en este checkpoint (`arniqa_enabled: false`).

El interés actual de esta ficha es doble. Por un lado, documenta una aproximación híbrida (ControlNet + difusión latente) a un problema clásico de visión por computador, con un coste de inferencia bajo: 5 pasos de denoising DDIM y procesado por parches de 768 px con solapamiento del 25 % y mezcla gaussiana. Por otro, conviene señalar que se trata de un modelo con 0 descargas y 0 *likes*, sin benchmarks publicados y con un recuento de parámetros (865.922.244) que corresponde a los pesos almacenados en safetensors, por lo que su evaluación práctica queda pendiente de validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente con condicionamiento dual: UNet de Stable Diffusion 2.1 con primera convolución expandida a 8 canales de entrada + rama ControlNet condicionada en espacio de píxeles |
| Parámetros totales | 865.922.244 (dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imagen; no hay ventana de contexto de texto) |
| Tipos de cuantización | no disponible; los pesos se publican en safetensors y el ejemplo oficial los carga en `float16`. No se publican variantes GGUF ni cuantizaciones de 8 o 4 bits |
| Idiomas soportados | no aplica; la cross-attention utiliza el embedding de texto vacío, por lo que el modelo no procesa texto de entrada |
| Licencia | OpenRAIL++ (modelo); los pesos se identifican como OpenRAIL++-M en el repositorio IRis |
| Formato de pesos | safetensors, organizados en subcarpetas `unet/`, `controlnet/` y `scheduler/` |
| Modelo base | sd2-community/stable-diffusion-2-1 |
| Resolución de procesado | 768 px por defecto (`default_processing_resolution=768`) |
| Pasos de denoising | 5 por defecto (`default_denoising_steps=5`) |
| Scheduler | DDIM con `timestep_spacing="trailing"` y `rescale_betas_zero_snr=True` |
| Estrategia de parcheo | `patch_size=768`, `overlap_ratio=0.25`, `blend_mode="gaussian"` |
| Tamaño del repositorio | 4,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es una difusión latente sobre el espacio del VAE de Stable Diffusion 2.1. La modificación clave respecto al modelo base es la expansión de la primera convolución del UNet de 4 a 8 canales de entrada, de modo que la red recibe concatenados el latente de la imagen degradada y el latente ruidoso del proceso de difusión. Sobre esa base se entrena en paralelo una rama ControlNet cuyo condicionamiento es la imagen degradada en espacio de píxeles (no en espacio latente), lo que da lugar al esquema denominado «dual-conditioned» en la tesis: una condición a nivel latente y otra a nivel de píxel. El UNet y el ControlNet se entrenan de forma conjunta, según indica la model card.

El scheduler es DDIM, configurado con `timestep_spacing="trailing"` y `rescale_betas_zero_snr=True`; la model card advierte explícitamente de que esa combinación debe aplicarse también en inferencia para reproducir las condiciones de entrenamiento. El checkpoint publicado corresponde a 15.000 iteraciones del identificador `002_re_015000`, y el archivo de configuración `hybrid_003_config.json` contiene únicamente los metadatos `{"architecture": "hybrid-003", "arniqa_enabled": false}`. El condicionamiento ARNIQA (orientado a estimar la calidad o degradación de la imagen) está desactivado en esta versión, de modo que el modelo cae en el embedding de texto vacío para la cross-attention. No se especifican en la información disponible el número total de tokens o pasos de entrenamiento, la composición del dataset, ni si se emplearon etapas de RLHF o DPO.

## Capacidades

- Restauración ciega de imagen (*blind image restoration*): el modelo no recibe información explícita sobre el tipo de degradación, sino únicamente la imagen degradada.
- Condicionamiento dual: combina una condición latente (latente de la imagen degradada, primeros 4 canales del UNet) con una condición en espacio de píxeles a través de ControlNet.
- Procesado de imágenes de alta resolución mediante parcheo: parches de 768 px con solapamiento del 25 % y mezcla gaussiana (`blend_mode="gaussian"`), lo que permite ir más allá de la resolución nativa de 768 px.
- Inferencia rápida: 5 pasos de denoising por defecto con DDIM, en lugar de las decenas de pasos habituales en difusión de imagen.
- Tubería `image-to-image` compatible con `diffusers` a través de una clase de pipeline propia (`MarigoldHybridControlNetArniqa003PipelinePatched`).
- No soporta *tool calling* ni *function calling*: es un modelo de imagen, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso textual.
- No soporta generación de texto, código ni matemáticas.
- No hay capacidades multilingües: el embedding de texto vacío sustituye a cualquier prompt.
- No se documentan capacidades de visión general (detección, segmentación, VQA) ni de audio.

## Casos de uso

- Digitalización y rehabilitación de archivos fotográficos: el modelo puede restaurar fotografías históricas degradadas por grano, desenfoque o artefactos de compresión, sin necesidad de indicar el tipo de degradación, gracias al esquema de restauración ciega.
- Preprocesado para pipelines de visión por computador: imágenes capturadas en condiciones adversas pueden restaurarse antes de alimentar un detector o un segmentador, reduciendo la pérdida de precisión aguas abajo.
- Mejora previa a OCR: en documentos escaneados con ruido o desenfoque, la restauración puede aumentar la legibilidad antes de pasar el motor de reconocimiento de texto (la calidad final del OCR no se ha medido en la información disponible).
- Imágenes de teledetección: restauración de escenas satelitales afectadas por turbulencia atmosférica o compresión, usando el parcheo de 768 px con solapamiento para cubrir teselas grandes.
- Fotografía de producto para comercio electrónico: limpieza de imágenes tomadas con equipos modestos antes de publicarlas en catálogo, aprovechando los 5 pasos de inferencia para procesar lotes con coste moderado.
- Restauración de fotogramas en digitalización de cine o vídeo: al ser un modelo de imagen, puede aplicarse fotograma a fotograma como paso de postprocesado, aunque sin coherencia temporal explícita entre fotogramas.
- Reparación de imágenes médicas o científicas degradadas, siempre que se cumplan las condiciones de la licencia y se asuma el riesgo de generación de detalle no presente en el original (véase «Limitaciones y advertencias»).
- Investigación en restauración con difusión: el checkpoint sirve como punto de partida o referencia para estudiar el efecto del condicionamiento dual frente a esquemas de condicionamiento único.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de restauración (PSNR, SSIM, LPIPS, FID) ni comparaciones cuantitativas con otros métodos, y el repositorio no documenta evaluaciones. Tampoco se dispone de mediciones de latencia o *throughput*. Cualquier cifra de rendimiento citada fuera de esta ficha no procede de la información proporcionada.

## Requisitos de hardware

- VRAM estimada: a partir del recuento de parámetros y de la carga en `float16` que muestra la model card, los pesos del UNet rondan los 1,7 GB; el conjunto (UNet + rama ControlNet + VAE + text encoder de SD 2.1) se sitúa aproximadamente en el rango de 5 a 7 GB en FP16, aunque el desglose exacto por componente no está disponible. A esa cifra hay que sumar la memoria de activaciones durante la difusión.
- Cabe en GPU de consumo: una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB deberían ser suficientes para inferencia en FP16 a 768 px. En tarjetas de 8 GB el margen puede ser ajustado, especialmente con parches de 768 px.
- GPU profesionales: A100, H100, L40S o similares para procesado por lotes o resoluciones elevadas con múltiples parches.
- Opciones de despliegue: `diffusers` con la clase de pipeline propia del repositorio IRis (`marigold`), y el script `script/hybrid_controlnet_restoration/run.py`. vLLM, TGI, llama.cpp y Ollama no son aplicables porque el modelo no es un LLM y no se publican pesos GGUF.
- Requisito crítico de despliegue: es imprescindible reproducir la configuración del scheduler (`timestep_spacing="trailing"` y `rescale_betas_zero_snr=True`). La model card advierte de que omitir este ajuste impide coincidir con el entrenamiento.
- Latencia y throughput: no disponibles. Únicamente se conoce que la inferencia por defecto emplea 5 pasos de denoising y que el procesado se realiza por parches de 768 px con solapamiento del 25 %, factores que escalan el tiempo total con el tamaño de la imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| ccalzerano72/IRis-hybrid-003 | Difusión latente + ControlNet para restauración ciega | 865.922.244 (safetensors) | Imagen degradada (condición dual: latente + píxeles) | OpenRAIL++ | HuggingFace, 0 descargas, 0 likes | Sin benchmarks publicados |
| sd2-community/stable-diffusion-2-1 | Difusión latente texto-imagen (modelo base) | no disponible en la información proporcionada | Texto + imagen inicial | no disponible en la información proporcionada | HuggingFace | no disponible en la información proporcionada |
| Rama ControlNet del repositorio IRis | ControlNet condicionado en píxeles, entrenado junto al UNet | no disponible (pesos en la subcarpeta `controlnet/`) | Imagen degradada en espacio de píxeles | OpenRAIL++ (según el repositorio del modelo) | Incluida en el repositorio del modelo | Sin benchmarks publicados |
| Familia Marigold (origen del nombre del paquete `marigold` del repositorio IRis) | Difusión basada en Stable Diffusion para tareas densas | no disponible en la información proporcionada | Imagen | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

No se dispone en la información proporcionada de datos cuantitativos (parámetros, contexto, métricas de restauración, licencia o disponibilidad) de los modelos comparados, por lo que la comparación se limita a la categoría de modelo y al tipo de condicionamiento.

## Limitaciones y advertencias

- El condicionamiento ARNIQA está desactivado en este checkpoint (`arniqa_enabled: false`), tal y como indica el autor. En consecuencia, no hay estimación explícita de la degradación y la cross-attention opera con el embedding de texto vacío.
- Al usar el embedding de texto vacío, no existe control por prompt: no se puede dirigir la restauración con lenguaje natural ni pedir un estilo o una degradación concreta.
- Es un checkpoint intermedio (identificador `002_re_015000`, 15.000 iteraciones), no necesariamente la versión final del sistema descrito en la tesis.
- Los modelos de difusión aplicados a restauración pueden generar detalle plausible pero inexistente en la imagen original. Este riesgo es especialmente relevante en contextos forenses, médicos o probatorios, donde la restauración no debe interpretarse como evidencia.
- No hay benchmarks publicados ni validación por parte de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha.
- La licencia OpenRAIL++-M permite el uso comercial sujeto a las restricciones de uso del anexo de la licencia; es responsabilidad del usuario revisar dichas restricciones antes de desplegar el modelo en producción.
- No es compatible con las clases estándar de `diffusers` (`AutoPipeline`): requiere la clase personalizada `MarigoldHybridControlNetArniqa003PipelinePatched` incluida en el paquete `marigold` del repositorio IRis.
- Si no se aplica la configuración de scheduler indicada por el autor (`timestep_spacing="trailing"`, `rescale_betas_zero_snr=True`), los resultados no coincidirán con el entrenamiento.
- No se documentan limitaciones idiomáticas ni de contexto porque el modelo no procesa texto; tampoco se documentan sesgos específicos, si bien hereda las características del modelo base Stable Diffusion 2.1 y de sus datos de entrenamiento.
- No se especifican en la información disponible los datos de entrenamiento (composición del dataset, número de muestras, procedencia), lo que dificulta evaluar cobertura y sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ccalzerano72/IRis-hybrid-003
- Repositorio IRis (código, pipeline `marigold` y script de inferencia): https://github.com/ccalzerano72/IRis
- Modelo base: https://huggingface.co/sd2-community/stable-diffusion-2-1
- Tesis de máster de referencia: «Blind Image Restoration via Dual-Conditioned Latent Diffusion», Universidad de Pisa (no se proporciona URL en la información disponible)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
