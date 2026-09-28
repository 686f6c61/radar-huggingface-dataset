# RunningHubAI/rh-krealism-v2.0-nvfp4-unet

## Resumen

rh-krealism-v2.0-nvfp4-unet es un modelo de difusión para generación y edición de imágenes a partir de texto, publicado por RunningHubAI en Hugging Face. Se distribuye como un único archivo de pesos de tipo UNET en formato safetensors cuantizado a NVFP4 (4 bits), de 6881 MiB (unos 6,7 GiB), pensado para cargarse en ComfyUI o en la plataforma en la nube RunningHub. Según la model card, deriva de un modelo base identificado como "krea2" y está orientado al fotorrealismo.

No es un modelo de lenguaje: no genera texto ni soporta tool calling o razonamiento multi-paso. Su interés actual está en el empaquetado, ya que la cuantización NVFP4 reduce el peso a aproximadamente 6,7 GiB, lo que rebaja los requisitos de memoria frente a una distribución en FP16/BF16 y encaja con GPUs Blackwell, que incorporan soporte nativo para formatos FP4.

El repositorio presenta 0 descargas y 0 likes en el momento de la indexación, no declara una licencia explícita propia, y no publica benchmarks, número de parámetros, resolución nativa ni detalles del dataset de entrenamiento. Por ese motivo, buena parte de las especificaciones de esta ficha figuran como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor la etiqueta como UNET; la model card solo indica que deriva de "krea2") |
| Parámetros totales | no disponible (el archivo de pesos ocupa 6881 MiB en NVFP4 de 4 bits) |
| Longitud de contexto | no disponible (no aplica: modelo de difusión de imagen; no se documenta longitud de prompt) |
| Tipos de cuantización | NVFP4 (4 bits) únicamente; no se ofrecen variantes FP16, BF16 o FP8 en este repositorio |
| Idiomas soportados | no disponible (la model card se publica en inglés y chino, pero no especifica idiomas de prompt) |
| Licencia | no disponible explícitamente; la card indica "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license" |
| Formato de pesos | safetensors (`krealism_v20Nvfp4.safetensors`, 6881 MiB) |
| Tipo de pipeline | image-text-to-image (etiquetas: comfyui, unet, region:us) |
| Modelo base declarado | krea2 |
| Tamaño del repositorio | 7,2 GB |
| Archivos incluidos | 1 (solo pesos UNET; no se incluyen text encoder ni VAE) |
| Resolución nativa | no disponible |
| Fecha de publicación | 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna. La model card únicamente clasifica el modelo como "UNET (image edit)" y lo etiqueta con `pipeline_tag: image-text-to-image`, lo que indica que se trata de un modelo de difusión para generación y edición de imágenes condicionada por texto. El identificador del repositorio y el nombre del archivo (`nvfp4`) confirman que los pesos están cuantizados en NVFP4, un formato de coma flotante de 4 bits definido por NVIDIA para su arquitectura Blackwell; el autor no publica la receta de cuantización, el error introducido ni si se aplicó calibración.

Sobre el entrenamiento, la model card reproduce las notas del autor del modelo base, que describe un proceso artesanal de "block merge, merge, inject y finetune" a lo largo de dos días de trabajo, partiendo de "krea2". No se indica el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO), algo poco habitual en modelos de difusión. Tampoco se documenta ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes fotorrealistas a partir de una descripción textual (pipeline image-text-to-image).
- Edición de imagen: la propia model card clasifica el modelo como "UNET (image edit)".
- Integración directa en ComfyUI como nodo de carga de UNET/diffusion model, y ejecución en la nube mediante la plataforma RunningHub.
- Configuración de muestreo de referencia según las notas del autor incluidas en la card: sampler Euler/simple con 10 pasos y sin LoRAs para las imágenes de muestra publicadas.
- No soporta tool calling ni function calling: no aplica a un modelo de difusión.
- No soporta agentes ni razonamiento multi-paso basado en texto.
- Capacidades multilingües: no documentadas. La card no especifica si los prompts admiten idiomas distintos del inglés.
- No dispone de modo "thinking", ni de entrada o salida de audio, ni de capacidades de video declaradas.

## Casos de uso

- Generación de imágenes fotorrealistas en local con ComfyUI: el archivo de 6881 MiB en NVFP4 permite cargar el modelo en GPUs de gama consumer con 12-16 GB de VRAM, reduciendo la presión de memoria frente a una distribución en BF16.
- Edición y retoque de imágenes existentes: al estar etiquetado como "image edit", encaja en flujos de trabajo de ComfyUI donde se parte de una imagen de entrada y se aplica una instrucción textual para modificarla.
- Transferencia de estilo y control de referencia: la card enlaza flujos del autor que combinan edición de imagen, transferencia de estilo y "moodboard" con múltiples referencias, lo que permite usar el modelo como motor de esa clase de pipelines.
- Producción de material gráfico para marketing y redes sociales: generación por lotes de imágenes con estética realista a partir de plantillas de prompt, ejecutables sobre la API de RunningHub sin montar infraestructura propia.
- Prototipado rápido en la nube: la plataforma RunningHub permite probar el modelo sin GPU local antes de decidir si se despliega en local.
- Ejecución en GPUs Blackwell de centro de datos: el formato NVFP4 está pensado para aprovechar el soporte nativo de FP4 de esa generación, lo que resulta útil para servir generación de imágenes por lotes con menor huella de memoria.
- Base para nuevos ajustes finos y mezclas: al ser un finetune de "krea2", puede servir como punto de partida para merges o ajustes posteriores orientados a dominios concretos, siempre que la licencia del proyecto original lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No se dispone de valores de FID, CLIP score, HPSv2 ni de comparativas cuantitativas con otros modelos. La model card tampoco incluye métricas de latencia o throughput medidas sobre hardware concreto.

## Requisitos de hardware

- Peso del archivo de pesos: 6881 MiB (aproximadamente 6,72 GiB) en NVFP4. Cifra confirmada por la tabla de archivos de la model card.
- VRAM estimada: no confirmada por el autor. Como referencia orientativa, solo los pesos ocupan unos 6,7 GiB; hay que sumar el VAE y el text encoder, que no se incluyen en este repositorio y deben obtenerse por separado. Con un text encoder en FP8, un total de 12-16 GB de VRAM es un orden de magnitud razonable, aunque esta cifra es una estimación derivada del tamaño de los archivos y no un dato publicado.
- GPUs recomendadas: no especificadas por el autor. El uso de NVFP4 apunta a GPUs Blackwell (serie RTX 50 y aceleradores B200/GB200) cuando se busca soporte nativo del formato; en generaciones anteriores el archivo podría requerir de-cuantización o no cargar correctamente, un extremo que no está confirmado en la información disponible.
- ¿Cabe en GPU consumer? Con 6,7 GiB de pesos, es plausible en tarjetas de 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX 5090), siempre que el text encoder y el VAE se gestionen con cuantización o descarga a CPU. Estimación no verificada.
- Opciones de despliegue: ComfyUI (indicado explícitamente en las etiquetas) y la plataforma en la nube RunningHub. Herramientas como vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. La única referencia de configuración es la de las imágenes de muestra del autor, generadas con sampler Euler/simple y 10 pasos, sin LoRAs.

## Comparativa con modelos similares

No se dispone de datos verificables de parámetros, licencia o resolución para el modelo base "krea2" ni para este finetune, por lo que la comparación se limita a lo que puede confirmarse y al resto se marca como no disponible.

| Modelo | Parámetros | Cuantización destacada | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-krealism-v2.0-nvfp4-unet | no disponible | NVFP4 (4 bits) | no disponible; se remite a la del proyecto original | Hugging Face y RunningHub |
| Base "krea2" (según la card) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Modelos de difusión de imagen de escala similar (p. ej. FLUX.1 Krea [dev], FLUX.1 [dev]) | 12B en el caso de la familia FLUX.1 [dev] | FP16/BF16, variantes FP8 | no comercial en las versiones [dev] de esa familia | Hugging Face |
| SDXL | 3,5B (UNET) | FP16, variantes FP8 | licencia abierta con condiciones de uso | Hugging Face |

Los datos de la familia FLUX.1 y de SDXL proceden de conocimiento general sobre esos proyectos y no de la información proporcionada sobre este repositorio; se incluyen únicamente como referencia de categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de representación demográfica, cultural o de estilo.
- Riesgo de alucinación: en modelos de difusión se traduce en artefactos, anatomías incorrectas, texto ilegible dentro de la imagen o incoherencias entre la instrucción y el resultado. No se han publicado evaluaciones al respecto.
- La cuantización a NVFP4 puede degradar la calidad respecto a los pesos originales en BF16. El autor no documenta la pérdida introducida ni si se aplicó calibración.
- Compatibilidad de hardware: NVFP4 es un formato ligado a la arquitectura Blackwell de NVIDIA. No está confirmado que el archivo funcione en GPUs anteriores sin conversión previa.
- Limitaciones de idioma: la card no especifica qué idiomas admiten los prompts. La documentación se publica en inglés y chino, lo que sugiere prompts en inglés, pero es una inferencia, no un dato.
- Restricciones de licencia: el repositorio no declara una licencia propia y remite a la del proyecto original o al licenciamiento upstream. Esto impide confirmar si el uso comercial está permitido; en la práctica, es un riesgo legal si el modelo base es de tipo [dev] con licencia no comercial, algo que no puede verificarse con la información disponible.
- Trazabilidad limitada: el repositorio no incluye text encoder ni VAE, de modo que el resultado final depende de componentes externos cuya versión y procedencia no se especifican.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la indexación, sin histórico de actualizaciones más allá de la publicación inicial. No hay garantía de mantenimiento.
- Para producción: conviene fijar la revisión concreta del repositorio y validar la licencia con el autor antes de integrarlo en un producto comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-krealism-v2.0-nvfp4-unet
- Repositorio original en RunningHub: https://www.runninghub.ai/model/public/2099403993133875202
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/2007154923476885506
- Plataforma RunningHub (internacional): https://www.runninghub.ai/
- Plataforma RunningHub (China): https://www.runninghub.cn/
- Espacio de trabajo de RunningHub: https://www.runninghub.ai/workspace
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Listado de modelos de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI/models
- Guía de fotorrealismo citada en la card: https://civitai.red/articles/32409/realism-how-to-achieve-it-a-generation-guide-workflow-examples-included
- Flujo de trabajo "krea-2-pro" citado en la card: https://civitai.com/models/2726952/krea-2-pro-grade-w-image-edit-style-transfer-moodboard-controlnet-multi-reference-sam3-detailers-and-low-vram-options
- Instagram del autor del modelo base: https://www.instagram.com/synth.studio.models/
- Donaciones al autor del modelo base: https://ko-fi.com/lonecatone
