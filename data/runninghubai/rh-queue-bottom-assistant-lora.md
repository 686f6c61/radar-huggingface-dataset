# RunningHubAI/rh-queue-bottom-assistant-lora

## Resumen

rh-queue-bottom-assistant-lora es un adaptador LoRA de edición de imagen distribuido por RunningHubAI a través de Hugging Face. El repositorio contiene un único fichero de pesos en formato safetensors de 218 MiB (`Krea 2 - Upskirt.safetensors`), etiquetado con el pipeline `image-text-to-image` y pensado para cargarse en flujos de ComfyUI o en la propia plataforma RunningHub. La model card indica que el adaptador se ha afinado a partir de un modelo base denominado `krea2`, sin aportar más detalles sobre su arquitectura interna, rango del adaptador, alpha ni hiperparámetros de entrenamiento.

El autor del repositorio es RunningHubAI, que actúa como plataforma de publicación en nombre del autor original (identificado en la model card como RunningHub-@氛围感). El modelo enlaza su origen al modelo público de RunningHub con ID 2076828974767931393 y a una ficha de Civitai cuyo nombre, `upskirt-helper`, indica de forma explícita que se trata de un adaptador de contenido para adultos orientado a la edición de la zona inferior del cuerpo. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no declara licencia.

La relevancia de esta ficha es principalmente técnica y de cautela: sirve como ejemplo de adaptador LoRA de bajo peso (menos de 250 MiB) publicado sin documentación de entrenamiento, sin licencia explícita y sin datos de evaluación, lo que dificulta cualquier integración en producción y plantea dudas legales relevantes en el contexto español y europeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión denominado `krea2` en la model card; no se detalla la arquitectura del modelo base |
| Parametros totales | no disponible (los pesos del adaptador ocupan 218 MiB en un único fichero safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imagen; no procesa secuencias de texto con ventana de contexto) |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors; no se documentan versiones GGUF, FP8 ni NF4) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo base, sin especificarla) |
| Formato de pesos | safetensors |
| Nombre del fichero | `Krea 2 - Upskirt.safetensors` |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | image-text-to-image |
| Etiquetas | comfyui, lora, image-text-to-image, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en Hugging Face | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

Un LoRA es una reparametrización de bajo rango que congela los pesos del modelo base e introduce matrices de descomposición A y B en determinadas capas (habitualmente las proyecciones de atención y las capas lineales de los bloques del UNet o del transformer de difusión). El resultado es un fichero de adaptación muy pequeño en comparación con el modelo base, que en este caso son 218 MiB frente a los varios gigabytes habituales de un modelo de difusión completo. La model card no especifica el rango (`rank`), el `alpha`, las capas objetivo ni el optimizador empleado.

El único dato de entrenamiento disponible es «Finetuned from: krea2», sin aclarar a qué checkpoint exacto corresponde ese nombre ni su procedencia (no se confirma si guarda relación con FLUX.1 Krea u otro modelo). No se documentan el conjunto de datos, el número de imágenes, el número de pasos de entrenamiento, la resolución de entrenamiento, el uso de captions automáticos ni ninguna técnica de regularización. Tampoco se menciona ningún método de alineación tipo RLHF o DPO, algo por otra parte poco habitual en adaptadores de difusión. No hay información sobre innovaciones técnicas (decodificación especulativa, atención lineal u otras), ya que no aplican a este tipo de adaptador.

## Capacidades

- Edición de imagen guiada por texto: el pipeline declarado es `image-text-to-image`, de modo que el adaptador modifica una imagen de entrada combinando una instrucción textual con el condicionamiento visual.
- Modificación localizada de una región concreta de la imagen, presumiblemente mediante máscaras o inpainting dentro del flujo de ComfyUI, según el propósito declarado del modelo original (`upskirt-helper`).
- Carga como nodo LoRA en ComfyUI y en la plataforma RunningHub, donde el autor indica que puede ejecutarse directamente.
- Compatibilidad potencial con otros adaptadores LoRA del mismo modelo base para mezcla de estilos, aunque no está documentada ni verificada.
- No se documenta soporte de tool calling o function calling.
- No se documenta ningún comportamiento agéntico ni de razonamiento multi-paso.
- No se documentan capacidades multilingües ni idiomas soportados.
- No se documentan capacidades de visión general, audio, vídeo ni modo de razonamiento explícito.
- No hay ninguna indicación de que el adaptador pueda usarse para generación de texto, código o matemáticas.

## Casos de uso

- Edición localizada de la zona inferior de la figura en flujos de edición de imagen: el adaptador se aplicaría sobre una imagen de entrada con una máscara que delimite la región a modificar, usando un sampler y un scheduler determinados en ComfyUI. Es el uso previsto por el autor según el nombre del modelo original.
- Investigación sobre virtual try-on y previsualización de prendas: en un contexto de investigación en visión por computador, un adaptador de este tipo puede emplearse para evaluar hasta qué punto un LoRA de bajo rango altera la coherencia anatómica y de tejidos en regiones específicas de la imagen.
- Generación de datasets sintéticos con control de región: para tareas de segmentación o detección que requieran ejemplos con anotaciones de zona inferior del cuerpo, el adaptador permitiría generar variaciones controladas, siempre que el dataset resultante cumpla los requisitos legales y éticos aplicables.
- Pruebas de robustez de pipelines de inpainting: al ser un fichero pequeño y de propósito muy específico, resulta útil para validar la mecánica de carga de LoRA, resolución de conflictos de pesos, orden de aplicación y reproducibilidad con semillas fijas en ComfyUI.
- Evaluación de filtros de seguridad y clasificadores NSFW: el adaptador puede usarse como caso de prueba para medir si los sistemas de moderación de una plataforma detectan y bloquean la generación de contenido para adultos, comparando tasas de falsos negativos antes y después de cargar el LoRA.
- Integración en lotes vía API de RunningHub: el autor ofrece endpoints de API, de modo que el adaptador puede invocarse de forma programática dentro de un pipeline de generación por lotes alojado en esa plataforma, evitando gestionar la infraestructura de GPU en local.
- Comparación de adaptadores sobre un mismo modelo base: sirve como referencia para medir el impacto de un LoRA muy especializado frente a otros adaptadores de estilo o de edición general sobre el mismo `krea2`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye FID, CLIP score, SSIM, ni comparaciones cuantitativas frente a otros adaptadores o al modelo base sin LoRA.

## Requisitos de hardware

- Disco: el adaptador ocupa 218 MiB (0,2 GB de repositorio completo).
- VRAM del adaptador: no disponible con precisión; un LoRA de este tamaño suele ocupar del orden de varios cientos de megabytes en memoria una vez cargado, pero no hay confirmación del autor.
- VRAM total: depende por completo del modelo base `krea2`, cuyas especificaciones no se detallan en el repositorio. No es posible dar una cifra fiable.
- Estimación orientativa no confirmada: para bases de difusión de clase SDXL en precisión de 16 bits suelen ser suficientes 8-12 GB de VRAM; para bases de clase FLUX se suele requerir 16-24 GB sin cuantizar. Esta horquilla es genérica y no procede de datos del autor.
- GPU de consumo: una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 de 24 GB serían candidatas razonables para bases ligeras; para bases pesadas se necesitaría cuantización o una GPU de 24 GB en adelante. No hay confirmación de compatibilidad.
- GPU de centro de datos: A100, H100 o L40S cubrirían sin problema cualquier base habitual, aunque sería infraestructura sobredimensionada para un adaptador de 218 MiB.
- Opciones de despliegue documentadas: ComfyUI y la plataforma RunningHub (con API). No se documenta compatibilidad con vLLM (no aplica a difusión), llama.cpp, Ollama ni TGI. La compatibilidad con Diffusers, Automatic1111 o Forge no está declarada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada alternativas comparables con datos verificables de parámetros, contexto, rendimiento o licencia. La comparación con otros LoRA de edición de imagen requeriría conocer el modelo base exacto, el rango del adaptador y métricas de evaluación que el repositorio no publica.

## Limitaciones y advertencias

- Contenido para adultos: el nombre del modelo original enlazado (`upskirt-helper`) y el nombre del fichero (`Krea 2 - Upskirt.safetensors`) indican que el adaptador está diseñado para generar o editar imágenes de contenido sexual explícito o de cosificación. Este tipo de contenido puede ser ilegal en función de la jurisdicción y de si las imágenes representan a personas reales o a menores.
- Riesgo legal grave en España y la UE: la generación de imágenes de este tipo con personas identificables o realistas puede vulnerar el derecho a la propia imagen, la normativa de protección de datos (RGPD) y, en determinados supuestos, el Código Penal. No se debe desplegar en producción sin una evaluación jurídica previa.
- Licencia no disponible: la model card no especifica términos de uso. No se puede asumir que el uso comercial esté permitido. Cualquier uso profesional requeriría aclarar la licencia tanto del adaptador como del modelo base `krea2`.
- Ausencia total de documentación de entrenamiento: no se conocen dataset, número de imágenes ni procedencia de los datos, lo que impide evaluar sesgos, riesgo de memorización de imágenes concretas y cumplimiento de derechos de autor.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgos de representación corporal, étnica y de género heredados del dataset de entrenamiento no declarado.
- Alucinación y artefactos: como todo modelo de difusión, puede producir anatomías incorrectas, extremidades duplicadas, incoherencias de tejidos o texturas irreales, especialmente en la región editada.
- Adopción nula: 0 descargas y 0 likes en el repositorio en el momento de la consulta, sin validación por parte de la comunidad ni informes independientes de calidad.
- Dependencia de plataforma: el flujo recomendado por el autor pasa por ComfyUI o por la API de RunningHub, lo que introduce dependencia de un servicio externo y de sus condiciones de uso.
- Idiomas: no se especifica qué idiomas acepta el prompt de condicionamiento; el repositorio incluye documentación en inglés y chino, pero no hay confirmación de soporte multilingüe en la práctica.
- Falta de versiones cuantizadas: al distribuirse solo en safetensors, no hay alternativas GGUF o FP8 que faciliten el despliegue en hardware limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-queue-bottom-assistant-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2076828974767931393
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Ficha de origen en Civitai (contenido para adultos): https://civitai.red/models/2776925/upskirt-helper?modelVersionId=3127007
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Endpoint de API de ejemplo (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
