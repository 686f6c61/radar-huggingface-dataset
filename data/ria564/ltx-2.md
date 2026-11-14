# Ria564/ltx-2

## Resumen

`Ria564/ltx-2` es un repositorio de redistribución (repackaging) de los pesos del modelo de generación de vídeo LTX-2 de Lightricks, empaquetados en formato de archivo único para su uso directo en ComfyUI. No se trata de un modelo entrenado por el autor del repositorio, sino de una recopilación de ficheros (text encoders basados en Gemma 3 12B, LoRAs y el modelo de difusión LTX-2) reorganizados según la estructura de carpetas que espera ComfyUI. El repositorio original es `Lightricks/LTX-2`.

El modelo subyacente, LTX-2, es un modelo de difusión para generación de vídeo (texto a vídeo, imagen a vídeo, profundidad a vídeo y canny a vídeo), que emplea el modelo de lenguaje Gemma 3 12B IT como text encoder, además de variantes "abliterated" del mismo para reducir el filtrado de contenido. El repositorio incluye también la LoRA `ltx2-squish` (palabra de activación `squish it`), que añade un efecto visual de compresión o aplastamiento sobre el sujeto.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su interés práctico se limita a quien quiera desplegar LTX-2 en ComfyUI sin tener que descargar y organizar manualmente los ficheros desde el repositorio oficial. No es un modelo de lenguaje ni un modelo conversacional, pese a incluir Gemma 3 como componente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (no disponible el detalle interno); text encoder basado en Gemma 3 12B IT |
| Parámetros totales | No disponible para el modelo de difusión; el text encoder Gemma 3 12B IT tiene 12 mil millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Text encoder en bf16, fp8 scaled y fp4 mixed (ficheros `gemma_3_12B_it.safetensors`, `gemma_3_12B_it_fp8_scaled.safetensors`, `gemma_3_12B_it_fp4_mixed.safetensors`, `gemma_3_12B_it_fpmixed.safetensors`) |
| Idiomas soportados | No disponible |
| Licencia | `ltx-2-community-license-agreement` (licencia "other", enlazada al repositorio de Lightricks en GitHub) |
| Formato de pesos | `safetensors` (archivos de difusión de fichero único para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de LTX-2 ni su proceso de entrenamiento; la model card se limita a indicar que son "repackaged model files for ComfyUI" y a enlazar el repositorio original `Lightricks/LTX-2`. Por los flujos de trabajo incluidos (texto a vídeo, imagen a vídeo, profundidad a vídeo, canny a vídeo, y una variante "distilled"), se deduce que LTX-2 es un modelo de difusión condicionado por texto, imagen, mapas de profundidad y mapas de bordes Canny, con al menos una variante destilada para reducir pasos de inferencia.

El componente de texto es Gemma 3 12B IT de Google, que actúa como text encoder. El repositorio incluye además dos LoRAs sobre la variante "abliterated" de Gemma 3 12B (`gemma-3-12b-it-abliterated_lora_rank64_bf16.safetensors` y `gemma-3-12b-it-abliterated_heretic_lora_rank64_bf16.safetensors`), de rango 64, orientadas a eliminar el rechazo de contenido. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO para LTX-2.

## Capacidades

- Generación de vídeo a partir de texto (text to video).
- Generación de vídeo a partir de una imagen de referencia (image to video).
- Generación de vídeo condicionada por mapas de profundidad (depth to video).
- Generación de vídeo condicionada por mapas de bordes Canny (canny to video).
- Variante destilada para inferencia con menos pasos (workflow `video_ltx2_i2v_distilled.json`).
- Aplicación de efectos visuales mediante LoRA: la LoRA `ltx2-squish` con palabra de activación `squish it` produce un efecto de compresión del sujeto.
- Codificación de texto mediante Gemma 3 12B IT, con variantes abliterated para reducir filtrado de contenido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio.

## Casos de uso

- Generación de clips de vídeo a partir de descripciones textuales en un flujo ComfyUI: se carga el workflow `video_ltx2_t2v.json`, se introduce el prompt y el modelo genera el vídeo; adecuado para prototipado rápido de ideas visuales sin salir del entorno ComfyUI.
- Animación de imágenes fijas: con el workflow `video_ltx2_i2v.json` se toma una fotografía o ilustración como primer fotograma y se genera movimiento coherente, útil para marketing y contenido para redes sociales.
- Control de movimiento mediante profundidad: usando `video_ltx2_depth_to_video.json` se puede guiar la generación con un mapa de profundidad previo, lo que permite reutilizar la geometría de una escena real o renderizada.
- Control de contornos mediante Canny: con `video_ltx2_canny_to_video.json` se preservan los bordes de un boceto o de un fotograma de referencia, útil para storyboards y previsualización.
- Efectos creativos con LoRA: el workflow `video_ltx2_i2v_lora.json` combinado con `ltx2-squish.safetensors` y la palabra `squish it` permite aplicar un efecto de aplastamiento a un sujeto, aplicable a contenido humorístico o viral.
- Iteración rápida con la variante destilada: `video_ltx2_i2v_distilled.json` reduce el coste computacional por generación, lo que facilita pruebas de prompt en máquinas con menos VRAM antes de pasar a la variante completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 62,4 GB, por lo que se necesita espacio en disco suficiente para alojar todos los ficheros (modelo de difusión, text encoders en varias precisiones y LoRAs).
- El text encoder Gemma 3 12B en bf16 requiere aproximadamente 24 GB de VRAM solo para sus pesos; las variantes fp8 y fp4 reducen esta cifra de forma significativa, aunque no se especifica el ahorro exacto.
- No se dispone de datos sobre VRAM total necesaria para el modelo de difusión de vídeo ni sobre GPU recomendadas.
- No se dispone de datos de latencia ni throughput.
- Opciones de despliegue documentadas: ComfyUI (estructura de carpetas `models/loras` y `models/text_encoders` indicada en la model card).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ria564/ltx-2 (este repo) | Repack de LTX-2 para ComfyUI | No disponible (text encoder 12B) | No disponible | `ltx-2-community-license-agreement` | Hugging Face, 0 descargas |
| Lightricks/LTX-2 | Modelo original de difusión de vídeo | No disponible | No disponible | `ltx-2-community-license-agreement` | Hugging Face (repositorio oficial) |
| ovi054/LTX-2-19b-Squish-LoRA | LoRA sobre LTX-2 19B | No disponible | No aplica | No disponible | Hugging Face |

No se dispone de información suficiente para comparar métricas de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio no oficial: es un repack de terceros con 0 descargas y 0 likes; para producción conviene partir del repositorio oficial `Lightricks/LTX-2`.
- La licencia `ltx-2-community-license-agreement` es de tipo "other" y puede imponer restricciones al uso comercial; es necesario revisar el texto completo en el enlace del repositorio de Lightricks antes de desplegar.
- Las LoRAs abliterated sobre Gemma 3 12B están diseñadas para reducir el rechazo de contenido, lo que puede aumentar la probabilidad de generar material inapropiado o no filtrado.
- No se documentan idiomas soportados ni sesgos conocidos.
- No se documentan limitaciones de contexto, duración máxima de vídeo, resolución soportada ni número de pasos de inferencia.
- Al ser un modelo de difusión de vídeo, el riesgo de artefactos visuales, incoherencia temporal y alucinación de contenido no está cuantificado en la información disponible.
- El tamaño del repositorio (62,4 GB) y la inclusión de múltiples precisiones del text encoder implican un consumo de disco y de ancho de banda considerable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ria564/ltx-2
- Modelo original: https://huggingface.co/Lightricks/LTX-2
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- LoRA squish: https://huggingface.co/ovi054/LTX-2-19b-Squish-LoRA/
- Fichero LoRA squish en Comfy-Org: https://huggingface.co/Comfy-Org/ltx-2/blob/main/split_files/loras/ltx2-squish.safetensors
- Workflow texto a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_t2v.json
- Workflow imagen a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_i2v.json
- Workflow imagen a vídeo destilado: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_i2v_distilled.json
- Workflow profundidad a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_depth_to_video.json
- Workflow Canny a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_canny_to_video.json
- Workflow imagen a vídeo con LoRA: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_ltx2_i2v_lora.json
- Gemma 3 12B IT (text encoder base): https://huggingface.co/google/gemma-3-12b-it
