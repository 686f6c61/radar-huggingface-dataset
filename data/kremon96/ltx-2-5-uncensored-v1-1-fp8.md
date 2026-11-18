# Kremon96/LTX-2.5-uncensored-v1.1-FP8

## Resumen

LTX-2.5-uncensored-v1.1-FP8 es un modelo de generación de vídeo publicado por el usuario Kremon96 en Hugging Face. Se trata de un build pre-merged y cuantizado de LTX Video-2.5 de Lightricks, al que se le han incorporado cinco fine-tunes (LoRAs) directamente en los pesos: la LoRA NSFW Eros10, la LoRA destilada DMD, la IC-LoRA oficial de LTXV, la IC-LoRA Detailer y un adaptador Img2Vid. El resultado es un modelo orientado a la generación de vídeo sin filtros de contenido, con soporte para text-to-video, image-to-video, video-to-video y audio-to-video.

El modelo se distribuye en formato GGUF con cuantización FP8 escalada para acelerar la inferencia, y su model card indica que incorpora un text encoder Gemma4 12B "uncensored" con las proyecciones de LTX ya integradas, de modo que no requiere archivos adicionales. La arquitectura subyacente es la de un modelo de difusión para vídeo (LTX Video), no un transformer de lenguaje; los 21.004.025.600 parámetros indicados corresponden al conjunto de pesos del pipeline de difusión.

Su relevancia es acotada: no es un modelo de propósito general ni un LLM, sino una variante comunitaria sin censura de un modelo de vídeo comercial, con licencia no especificada, cero descargas y cero likes en el momento de la consulta. Está pensado para usuarios de ComfyUI y flujos de generación de vídeo local que necesiten contenido sin restricciones de moderación y generaciones rápidas en pocos pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (LTX Video-2.5), con text encoder Gemma4 12B y proyecciones LTX integradas |
| Parametros totales | 21.004.025.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 escalada (fp8_scaled); distribución en GGUF; text encoder en int8 |
| Idiomas soportados | no disponible |
| Licencia | unknown (desconocida) |
| Formato de pesos | GGUF y FP8 |

## Arquitectura y entrenamiento

El modelo parte de Lightricks/LTX-2.5, un modelo de difusión para generación de vídeo. Sobre esa base se han fusionado (baked-in) cinco adaptadores LoRA con distintas intensidades: Eros10 NSFW (0,7), DMD Distilled (1,0), LTXV In-Context LoRA (0,7), LTXV IC-LoRA Detailer (0,45) e Img2Vid LoRA (0,45). La fusión se realizó en un único checkpoint pre-merged, y después se generó una versión FP8 escalada y una build GGUF.

La LoRA DMD destilada es la que permite la generación en pocos pasos (4 pasos mínimo, 8 recomendados para calidad), y según la model card mejora la preservación facial en image-to-video y el seguimiento de instrucciones respecto a la versión 1 y al modelo base. La IC-LoRA oficial de LTXV mejora la adherencia a la imagen de referencia, y la IC-LoRA Detailer habilita control video-to-video sobre text-to-video e image-to-video. El text encoder es un Gemma4 12B "uncensored" con las proyecciones de LTX ya incorporadas, cuantizado en int8. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset de los fine-tunes.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) en 4 pasos mínimo y 8 pasos para mejor calidad.
- Generación de vídeo a partir de imagen (image-to-video), con preservación facial mejorada por la LoRA DMD.
- Control video-to-video mediante la IC-LoRA Detailer.
- Audio-to-video y variantes FL2VA, T2VA, I2VA y REF2VA según la model card.
- Generación de diálogo hablado y efectos de sonido integrados en el vídeo, con etiquetas `[SPEECH]` y `[SOUNDS]`.
- Soporte de multi-shot: el prompt puede describir cortes de cámara (por ejemplo, "start off front view close-up, then cut to a rear wide-view").
- Formato de prompt con plantilla IC-LoRA opcional compuesta por las secciones `[VISUAL]`, `[SPEECH]` y `[SOUNDS]`.
- Generación de contenido NSFW sin moderación (etiqueta not-for-all-audiences).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- Previsualización rápida de storyboards: con 4 pasos de inferencia se pueden generar clips de prueba a partir de descripciones textuales para validar encuadres y movimientos de cámara antes de una producción mayor.
- Generación de vídeo con diálogo y sonido: usando la plantilla `[SPEECH]` y `[SOUNDS]` se pueden crear escenas con personajes hablando y efectos de sonido sincronizados, útil para prototipos de animación o doblaje.
- Animación de imágenes fijas: el modo image-to-video con la LoRA Img2Vid permite dar movimiento a ilustraciones o fotografías manteniendo la coherencia del sujeto.
- Control de estilo video-to-video: la IC-LoRA Detailer permite aplicar la estética o estructura de un vídeo de referencia a una nueva generación a partir de texto o imagen.
- Creación de contenido para adultos: la fusión de la LoRA Eros10 permite generar material NSFW, un nicho para el que el modelo base comercial no está habilitado.
- Iteración en ComfyUI: al distribuirse en GGUF y FP8, se integra en flujos de trabajo de ComfyUI para experimentación local con generaciones cortas y rápidas.
- Investigación sobre moderación y modelos sin censura: sirve como caso de estudio de cómo los fine-tunes comunitarios eliminan los filtros de seguridad de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 166,9 GB, por lo que el almacenamiento necesario para descargar todos los pesos es elevado.
- Los 21.004.025.600 parámetros en FP8 implican aproximadamente 21 GB solo para los pesos del modelo de difusión, a los que hay que sumar el text encoder Gemma4 12B en int8 (unos 12 GB adicionales) y los buffers de activación durante la inferencia.
- VRAM estimada: no disponible de forma oficial; por el tamaño de los pesos, se requiere una GPU con al menos 24-32 GB de VRAM para FP8, y más si se mantienen varias etapas del pipeline en memoria simultáneamente.
- GPU recomendadas: no especificadas por el autor; por capacidad de VRAM encajarían A100 (40/80 GB), H100 (80 GB) y, en el límite, RTX 4090 (24 GB) con gestión cuidadosa de la memoria.
- No se confirma que quepa en GPUs de consumo de gama media; en RTX 4090 podría requerir offloading.
- Opciones de despliegue: ComfyUI es el flujo implícito en los ejemplos de la model card; la distribución GGUF sugiere compatibilidad con runners de GGUF para difusión, aunque no se detallan en la información disponible.
- Latencia y throughput: no disponibles; la model card solo indica que 4 pasos producen resultados válidos y 8 pasos los mejores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-uncensored-v1.1-FP8 (este) | 21.004.025.600 | no disponible | Difusión de vídeo sin censura, con audio y multi-shot | unknown | Hugging Face, GGUF/FP8 |
| Lightricks/LTX-2.5 (base) | no disponible en la informacion | no disponible | Difusión de vídeo comercial con moderación | la del modelo base (no detallada aqui) | Hugging Face |
| TenStrip/LTX2.3-10Eros | no disponible | no disponible | Fine-tune NSFW de LTX 2.3 | no disponible | Hugging Face |
| TenStrip/LTX2.3_DMD_Lora | no disponible | no disponible | LoRA de destilación DMD para LTX 2.3 | no disponible | Hugging Face |

## Limitaciones y advertencias

- La licencia figura como "unknown": no hay autorización explícita para uso comercial, y al derivar de Lightricks/LTX-2.5 pueden aplicarse las condiciones del modelo base, que no se detallan en la información disponible.
- El modelo está etiquetado como not-for-all-audiences y genera contenido NSFW sin moderación; no es apto para entornos de producción con requisitos de seguridad de contenido.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir artefactos, incoherencias temporales y anatomías incorrectas, especialmente en pocos pasos de inferencia.
- La model card advierte de que el modelo ignora instrucciones negativas como "no music"; para forzar la ausencia de música hay que usar el término "unscored".
- El uso de la plantilla IC-LoRA es necesario para obtener la máxima precisión; sin ella, la adherencia al prompt puede degradarse.
- No se especifican idiomas soportados ni calidad multilingüe del text encoder.
- El modelo tiene cero descargas y cero likes, sin validación comunitaria ni benchmarks publicados.
- El tamaño del repositorio (166,9 GB) y la VRAM necesaria limitan su uso a equipos con hardware de gama alta.
- La información sobre el entrenamiento de los fine-tunes (datos, tokens, procedimiento) no está disponible, lo que impide evaluar sesgos de forma rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kremon96/LTX-2.5-uncensored-v1.1-FP8
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Fine-tune Eros: https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA DMD: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
