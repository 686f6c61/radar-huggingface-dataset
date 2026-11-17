# AI-KSK/moss-image-wash-flux-4k-325

## Resumen

AI-KSK/moss-image-wash-flux-4k-325 no es un modelo de pesos, sino un repositorio de recursos complementario para el vídeo 325 del creador AI-KSK. Contiene un workflow de ComfyUI en formato JSON (`workflows/洗图最终 (4).json`) y una imagen de portada promocional de 1086×1448 píxeles. El repositorio no redistribuye ningún peso de modelo, muestra de referencia ni resultado renderizado; su tamaño es de 0,0 GB y no registra descargas ni likes en el momento de la consulta.

El workflow encadena dos etapas de generación de imagen: una primera pasada de "lavado" o reconstrucción con MOSS-Image SFT en INT8, seguida de un refinado opcional con FLUX 3 Image Klein 4K. La primera etapa usa el checkpoint `moss_image_sft_int8_convrot.safetensors` con el codificador de texto Qwen 3.5 9B en bf16, mientras que la segunda emplea `flux3_image_klein_sd_int8_convrot.safetensors` con Qwen3-VL 4B en INT8. Ambas etapas comparten el VAE `flux2-vae.safetensors` y realizan llamadas a un LLM de visión externo (`google/gemini-3.1-flash-lite-preview`) para generar subtítulos o JSON espacial.

La relevancia de este repositorio es documental y educativa: sirve como material de acompañamiento de un tutorial en vídeo, no como artefacto listo para producción. El grafo tiene 35 nodos y 43 conexiones guardadas, con ajustes de muestreo fijados (semilla 9527, 20 pasos y CFG 3 para MOSS; 16 pasos y CFG 1 para FLUX). El propio autor advierte de discrepancias entre las notas del vídeo y el JSON entregado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio contiene un workflow de ComfyUI, no pesos) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 para los checkpoints de difusión (`moss_image_sft_int8_convrot`, `flux3_image_klein_sd_int8_convrot`); bf16 para `qwen3.5_9b_bf16`; INT8 para `qwen3vl_4b_int8_convrot` |
| Idiomas soportados | No disponible (la model card declara `en` para el repositorio) |
| Licencia | No disponible para el workflow y la portada; MOSS SFT se etiqueta Apache-2.0 en su model card; FLUX 3 Image Klein se rige por la FLUX Kommunity License de Black Forest Labs |
| Formato de pesos | No se redistribuyen pesos; el repositorio contiene JSON de workflow y PNG de portada |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento de ningún modelo. Lo que describe es un pipeline de inferencia en ComfyUI con cinco bloques funcionales. El primero preprocesa la imagen de entrada mediante `LoadImage` → `ImageScaleToTotalPixels` (lanczos, 1 megapíxel, pasos de resolución 16) y obtiene dimensiones con `GetImageSize`. El segundo genera una descripción visual con `RHLLMChatNode` sobre `google/gemini-3.1-flash-lite-preview`; un `PrimitiveBoolean` guardado como `True` selecciona JSON espacial con cajas `yxyx` de origen central, y `False` solicita un pie de foto en inglés.

La tercera etapa es la regeneración MOSS: transformer SFT INT8, codificador Qwen 3.5 9B y VAE, con denoise 1.0, sampler `euler`, scheduler `sgm_uniform`, 20 pasos, CFG 3 y guiado SLG de capa única 22 en rango 0–1. Al usar denoise 1.0, la salida es una reconstrucción generativa nueva, no un retoque fiel garantizado. La cuarta etapa, opcional pero activada en el JSON guardado, aplica RealESRGAN x4, fija el lado mayor a 3840 píxeles, genera otro subtítulo de escena con Gemini y ejecuta FLUX 3 Klein con `ReferenceMultiLatent`, 16 pasos, CFG 1, sampler `euler` y scheduler `simple`. La quinta etapa separa las salidas MOSS y FLUX con previsualizaciones y un `Image Comparer` de rgthree.

El autor señala discrepancias explícitas entre el material audiovisual y el JSON: una nota antigua afirma que el modo JSON está desactivado por defecto, pero `PrimitiveBoolean=True`; los subtítulos llaman al scheduler de FLUX "Beta" mientras el JSON dice `simple`; se menciona un LoRA opcional estilo Midjourney que no existe como nodo en el grafo entregado; y se alude a una ruta MOSS condicionada por visión con `TextEncodeMOSSImageVision` que no está presente.

## Capacidades

- Reconstrucción generativa de imagen ("image wash") mediante MOSS-Image SFT con denoise 1.0, orientada a regenerar una escena a partir de una entrada escalada a 1 megapíxel.
- Refinado opcional a 4K con FLUX 3 Image Klein, usando el resultado MOSS como latente de referencia y fijando el lado mayor en 3840 píxeles.
- Generación automática de descripciones visuales mediante un LLM de visión externo (`google/gemini-3.1-flash-lite-preview`), en dos modos: JSON espacial con cajas `yxyx` o pie de foto en inglés.
- Escalado previo con RealESRGAN x4plus antes de la etapa FLUX.
- Comparación lado a lado de las salidas MOSS y FLUX mediante `Image Comparer` de rgthree.
- No incluye tool calling, agentes, razonamiento multi-paso, modo thinking, audio ni pesos entrenados propios.

## Casos de uso

- Reproducción del tutorial del vídeo 325: importar el JSON en una build compatible de ComfyUI y ejecutar el pipeline completo con los modelos en las rutas indicadas para verificar el flujo descrito por el creador.
- Estudio de pipelines encadenados de difusión: el grafo sirve como ejemplo didáctico de cómo conectar una etapa de reconstrucción (MOSS) con una de refinado (FLUX) compartiendo VAE y semilla fija.
- Pruebas de sustitución de LLM de visión: el nodo `RHLLMChatNode` puede reemplazarse por otro proveedor, lo que permite comparar cómo afectan distintos subtítulos al resultado generativo, aunque requiere recablear y validar el grafo.
- Evaluación de modos de condicionamiento textual: alternar `PrimitiveBoolean` entre JSON espacial y pie de foto permite observar el impacto del formato de la descripción en la reconstrucción MOSS.
- Restauración exploratoria de imágenes promocionales: el flujo está pensado para generar portadas o material visual de creador, no para retoque fiel de documentos o fotografías con texto crítico.
- Docencia sobre discrepancias entre documentación y artefactos: el repositorio documenta explícitamente las diferencias entre las notas del vídeo y el JSON entregado, lo que lo convierte en un caso práctico de auditoría de workflows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La portada de 1086×1448 se describe en la model card como diseño promocional, no como referencia reproducible ni benchmark de salida.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio no publica mediciones; los checkpoints INT8 y los codificadores de texto (Qwen 3.5 9B en bf16 y Qwen3-VL 4B en INT8) implican requisitos que el autor no cuantifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: ComfyUI local o la plataforma RunningHub. El JSON requiere nodos integrados compatibles, la integración `RHLLMChatNode` para cada llamada de visión, `easy showAnything` de ComfyUI-Easy-Use y `Image Comparer` de rgthree-comfy. También deben verificarse `ReferenceMultiLatent`, `SkipLayerGuidanceDiTSimple`, `GetImageSize` y `StringFormat` en la build concreta.
- Rutas de modelos esperadas: `models/diffusion_models/moss_image_sft_int8_convrot.safetensors`, `models/diffusion_models/flux3_image_klein_sd_int8_convrot.safetensors`, `models/text_encoders/qwen3.5_9b_bf16.safetensors`, `models/text_encoders/qwen3vl_4b_int8_convrot.safetensors`, `models/vae/flux2-vae.safetensors` y `models/upscale_models/RealESRGAN_x4plus.pth`.
- Latencia y throughput: no disponibles. Las dos llamadas al LLM externo pueden generar costes según el proveedor.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo con pesos propios, sino un workflow de ComfyUI, por lo que no existe una comparación directa con modelos de la misma categoría en la información proporcionada. Como referencia de componentes, el pipeline depende de MOSS-Image SFT (etiquetado Apache-2.0 en su model card) y FLUX 3 Image Klein (sujeto a la FLUX Kommunity License), pero no se aportan datos comparativos de rendimiento entre ellos ni frente a alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos, muestra de referencia, resultados renderizados ni credenciales de API; es solo el JSON del workflow y la portada.
- Licencia del workflow y la portada no clarificada: el autor indica que no se ha suministrado un archivo de licencia separado para los derechos de uso originales.
- Licencias upstream dispares: MOSS SFT se etiqueta Apache-2.0, mientras que FLUX 3 Image Klein se rige por la FLUX Kommunity License de Black Forest Labs; cada uso debe cumplir los términos aplicables.
- Denoise 1.0 en MOSS implica reconstrucción generativa, no retoque fiel; el autor recomienda revisar manualmente texto, detalles pequeños e identidad del sujeto.
- Discrepancias documentadas entre las notas del vídeo y el JSON: el modo JSON está activado pese a una nota que dice lo contrario, el scheduler de FLUX es `simple` y no "Beta", no hay nodos LoRA pese a mencionarse un LoRA opcional, y no existe `TextEncodeMOSSImageVision`.
- Dependencia de un LLM externo: dos llamadas a `google/gemini-3.1-flash-lite-preview` que pueden generar costes y requieren conectividad.
- Un entorno puramente local puede no ofrecer el nodo LLM de RunningHub; sustituirlo exige recablear y validar el grafo, no solo renombrar el nodo.
- Semilla fija 9527 en ambas etapas, lo que limita la variabilidad sin edición manual.
- Riesgo de alucinación visual en las descripciones generadas por el LLM de visión, que condicionan la reconstrucción posterior.
- Sin datos de benchmarks, latencia, throughput ni VRAM; no apto para planificación de producción sin medición propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/moss-image-wash-flux-4k-325
- Workflow en RunningHub (enlace de invitación del creador): https://www.runninghub.ai/zh-cn/post/2113992913247076354?inviteCode=rh-v1111
- Tutorial en YouTube: https://youtu.be/UGZQmF2GuJM
- Tutorial en Bilibili: https://www.bilibili.com/video/BV16WHM6LE5V/
- ComfyUI-Easy-Use: https://github.com/yolain/ComfyUI-Easy-Use
- rgthree-comfy: https://github.com/rgthree/rgthree-comfy
