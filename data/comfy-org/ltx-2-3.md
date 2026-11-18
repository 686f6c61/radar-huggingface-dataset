# Comfy-Org/ltx-2.3

## Resumen

LTX 2.3 es un modelo de generación de vídeo por difusión desarrollado por Lightricks, distribuido aquí por Comfy-Org como repositorio de archivos reempaquetados para su uso directo en ComfyUI. El repositorio `Comfy-Org/ltx-2.3` no contiene un modelo nuevo, sino los pesos del modelo base `Lightricks/LTX-2.3` junto con varios LoRA (adaptadores de bajo rango) que habilitan casos de uso específicos: transferencia de identidad, generación de ingredientes visuales y sincronización audio-vídeo. El tamaño del repositorio es de 6,4 GB, lo que sugiere pesos en precisión reducida (probablemente fp8 o bf16 parcial) orientados a inferencia local.

La relevancia de esta ficha radica en que LTX 2.3 es una de las familias de modelos de vídeo open source más activas, y su integración en ComfyUI mediante plantillas de workflow predefinidas reduce considerablemente la barrera de entrada para desarrolladores que quieren experimentar con generación de vídeo condicionada por texto, imagen o audio. Sin embargo, la información pública disponible en este repositorio es escasa: no se detallan parámetros totales, longitud de contexto ni composición del dataset de entrenamiento.

Es importante subrayar que este repositorio es un *repackaging*: la autoría técnica del modelo corresponde a Lightricks, y la licencia aplicable es la LTX-2 Community License, no una licencia OSI estándar. Cualquier evaluación de uso comercial debe remitirse al repositorio original y al texto de la licencia en GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | difusión (no se especifica si transformer o U-Net en la información disponible) |
| Parámetros totales | no disponible (el nombre de los LoRA sugiere una variante de 22B, sin confirmación oficial en esta ficha) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio contiene safetensors; se menciona bf16 en el nombre de un LoRA) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License (`ltx-2-community-license`) |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base más allá de su naturaleza de modelo de difusión para vídeo. El repositorio incluye tres tipos de artefactos: el modelo base reempaquetado, un LoRA de "ingredients" (`ltx-2.3-22b-ic-lora-ingredients-0.9.safetensors`), dos LoRA de identidad (`ltx-2.3-id-lora-celebvhq-3k.safetensors` y `ltx-2.3-id-lora-talkvid-3k.safetensors`) y un LoRA destilado (`ltx_2.3_22b_distilled_1.1_lora_dynamic_fro09_avg_rank_111_bf16.safetensors`). El sufijo "22b" en los nombres de archivo apunta a una variante de 22 mil millones de parámetros, pero este dato no está confirmado en la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de difusión). La presencia de un LoRA destilado sugiere que existe una variante optimizada para reducir pasos de inferencia, pero no se especifican los detalles del proceso de destilación. Tampoco se documentan innovaciones técnicas como atención lineal o decodificación especulativa.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según la plantilla `video_ltx2_3_t2v.json`.
- Generación de vídeo a partir de una imagen (image-to-video), según `video_ltx2_3_i2v.json`.
- Generación de vídeo a partir de imagen y audio (image-audio-to-video), según `video_ltx2_3_ia2v.json`.
- Transferencia y preservación de identidad mediante LoRA de ID, con workflows dedicados (`video_ltx2_3_id_lora.json`).
- Composición de "ingredientes" visuales mediante el LoRA IC-Ingredients.
- Sincronización labial y de habla probablemente soportada por el LoRA TalkVid, aunque no se detalla explícitamente en la información disponible.
- Integración nativa con ComfyUI como nodos y plantillas de workflow.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- **Generación de vídeo publicitario a partir de texto**: usando la plantilla text-to-video, un equipo de marketing puede generar clips cortos a partir de descripciones textuales, iterando rápidamente sobre variaciones creativas sin rodaje.
- **Animación de imágenes fijas para contenido editorial**: la plantilla image-to-video permite animar fotografías o ilustraciones existentes, útil para medios digitales que quieren dar movimiento a material estático con bajo coste de producción.
- **Doblaje y sincronización labial**: con el LoRA TalkVid y el workflow image-audio-to-video, se puede generar vídeo de un hablante sincronizado con una pista de audio, aplicable a localización de contenido o avatares parlantes.
- **Preservación de identidad en series de vídeo**: el LoRA de identidad (CelebVHQ) permite mantener rasgos faciales consistentes entre distintos clips, adecuado para narrativas seriadas o contenido de marca con un personaje recurrente.
- **Prototipado rápido en ComfyUI**: desarrolladores que ya trabajan con ComfyUI pueden cargar los safetensors en `models/loras/` y ejecutar las plantillas oficiales sin escribir código de inferencia, lo que acelera la validación de ideas.
- **Composición de escenas con múltiples elementos**: el LoRA IC-Ingredients facilita introducir objetos o elementos visuales concretos en la generación, útil para storyboards o previsualización de escenas.
- **Investigación en generación de vídeo condicionada**: al ser un modelo abierto (con licencia comunitaria), sirve como base para experimentos académicos sobre condicionamiento multimodal (texto, imagen, audio) en difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. El repositorio pesa 6,4 GB, lo que sugiere que los pesos incluidos caben en GPUs de consumo con 8-12 GB de VRAM, aunque el modelo base completo en bf16 probablemente requiera bastante más.
- **GPU recomendadas**: no especificadas en la información disponible. Por el tamaño del repo, una RTX 3060 de 12 GB o superior podría ser suficiente para los archivos reempaquetados; para el modelo completo sin cuantizar se necesitarían GPUs de datacenter (A100, H100) o RTX 4090.
- **Cabe en GPU de consumo**: probablemente sí, en función de la cuantización y de si se usa el LoRA destilado; no confirmado oficialmente.
- **Opciones de despliegue**: ComfyUI es el entorno objetivo declarado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLMs, no a difusión de vídeo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX 2.3 (este repo) | no disponible (posible 22B) | no disponible | LTX-2 Community License | Hugging Face, ComfyUI |
| Alternativas de difusión de vídeo open source | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- **Licencia restrictiva**: la LTX-2 Community License no es una licencia open source estándar; es imprescindible revisar sus términos en el repositorio de Lightricks antes de cualquier uso comercial.
- **Repositorio de reempaquetado**: este repo no es el modelo original; para documentación técnica, papers y soporte hay que acudir a `Lightricks/LTX-2.3`.
- **Información técnica incompleta**: no se publican parámetros totales, contexto, dataset ni benchmarks en esta ficha, lo que dificulta una evaluación rigurosa.
- **Riesgo de alucinación visual**: como todo modelo generativo, puede producir artefactos, incoherencias temporales o contenido no solicitado; requiere revisión humana en producción.
- **Sesgos**: no documentados en la información disponible; los modelos entrenados con datos web suelen heredar sesgos de representación.
- **Dependencia de ComfyUI**: los workflows y la estructura de carpetas están diseñados para ComfyUI; su uso fuera de ese entorno requiere adaptación manual.
- **Idiomas**: no se especifica qué idiomas acepta en los prompts; probablemente inglés como idioma principal, sin confirmación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/ltx-2.3
- Modelo original: https://huggingface.co/Lightricks/LTX-2.3
- LoRA Ingredients: https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Ingredients
- LoRA ID CelebVHQ: https://huggingface.co/AviadDahan/LTX-2.3-ID-LoRA-CelebVHQ-3K
- LoRA ID TalkVid: https://huggingface.co/AviadDahan/LTX-2.3-ID-LoRA-TalkVid-3K
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantillas de workflow: https://github.com/Comfy-Org/workflow_templates
