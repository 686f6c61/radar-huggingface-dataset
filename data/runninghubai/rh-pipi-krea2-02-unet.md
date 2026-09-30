# RunningHubAI/rh-pipi-krea2-02-unet

## Resumen

rh-pipi-krea2-02-unet es un checkpoint de tipo UNET para edición de imagen y generación texto-a-imagen, publicado por RunningHubAI a partir de un ajuste fino (finetune) del modelo base Krea2. El autor original del ajuste es el usuario de RunningHub identificado como @皮神 y la distribución en HuggingFace corre a cargo de la plataforma RunningHub, que publica el modelo "on behalf of the author". No es un modelo de lenguaje: no genera texto ni razona sobre instrucciones en lenguaje natural, sino que actúa como componente de difusión dentro de un pipeline de imagen que se ejecuta en ComfyUI.

El repositorio ocupa 13,1 GB e incluye un único fichero de pesos, `pipi-krea02.safetensors`, de 12.533 MiB. La model card no documenta arquitectura base, número de parámetros, datos de entrenamiento ni resultados de evaluación, y tampoco declara una licencia concreta: se limita a indicar que se debe seguir la licencia del proyecto original o de la fuente upstream. El modelo usa la palabra de activación (trigger word) `pipik2` y está pensado para flujos de edición de imagen, incluyendo cambio de vestuario, edición de imagen única y "lavado" de imágenes con inferencia inversa de prompt.

Su relevancia es práctica y acotada: se trata de un ajuste fino especializado que se integra en ComfyUI o en la nube de RunningHub, con workflows publicados por el propio autor. Al no existir licencia explícita, benchmarks ni documentación técnica, cualquier evaluación seria requiere pruebas propias sobre el pipeline completo (UNET más codificador de texto y VAE del modelo base Krea2).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión para edición de imagen (image-text-to-image), derivada de Krea2; detalle de la arquitectura base no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión; no procesa contexto de tokens) |
| Tipos de cuantización | no disponible; el repositorio publica únicamente pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica "follow the original project or upstream license" |
| Formato de pesos | safetensors (`pipi-krea02.safetensors`, 12.533 MiB) |
| Tipo de modelo | UNET (edición de imagen) |
| Modelo base | Krea2 (finetune) |
| Palabra de activación | `pipik2` |
| Pipeline declarado | image-text-to-image |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 13,1 GB |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha declarada de creación | 2026-09-29 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Se indica explícitamente que es un modelo de tipo UNET para edición de imagen y que deriva de Krea2 mediante ajuste fino. No se especifica si el backbone es un U-Net convolucional clásico o una variante de transformer de difusión, ni se detalla el número de bloques, canales, mecanismos de atención o el espacio latente en el que opera. Tampoco se indica la dimensión de la imagen de entrenamiento ni la resolución soportada.

En cuanto al entrenamiento, el autor menciona que el modelo fue etiquetado con un "super inteligente etiquetador" (打标器) y entrenado con un "super entrenador" gráfico de la misma familia de herramientas (con enlace a zhaotutu.xyz), presentado como una solución sin dependencias de entorno y con interfaz gráfica. No se aportan datos sobre número de imágenes, número de pasos, resolución, composición del dataset, uso de RLHF o DPO, ni hiperparámetros de entrenamiento. Tampoco se documenta ninguna innovación técnica como decodificación especulativa, atención lineal u optimizaciones de inferencia; esas técnicas no aplican al rol de este componente dentro del pipeline.

## Capacidades

- Edición de imagen guiada por texto: el modelo forma parte del pipeline image-text-to-image declarado en el repositorio.
- Edición de imagen única (single-image edit), según los workflows publicados por el autor.
- Cambio de vestuario (换装) sobre imágenes existentes, documentado como workflow específico.
- Texto a imagen (text-to-image) cuando se usa con el pipeline base de Krea2.
- Imagen a imagen con inferencia inversa de prompt ("lavado" de imágenes, 洗图), es decir, reconstrucción o limpieza de una imagen a partir de una descripción generada.
- Ejecución en ComfyUI mediante carga directa del fichero safetensors y en la nube de RunningHub a través de su API.
- Palabra de activación `pipik2` para invocar el estilo o el ajuste específico.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingües propias del modelo de difusión.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Cambio de vestuario para catálogo de moda: el workflow de "换装" permite sustituir prendas en fotografías de producto o de modelo sin volver a fotografiar, útil para generar variantes de color y tejido a partir de una sola sesión.
- Limpieza y reconstrucción de imágenes con prompt inverso: el flujo de imagen a imagen con inferencia inversa de prompt permite regenerar imágenes con ruido, marcas de agua o artefactos de compresión, manteniendo la composición original.
- Edición puntual de fotografías en estudio: el workflow de "edición de imagen única" permite modificar un elemento concreto de una imagen (fondo, ropa, objeto) sin rehacer la toma completa.
- Generación de imágenes de estilo propio a partir de texto: con la palabra de activación `pipik2` y los pesos de Krea2, se pueden generar imágenes en el estilo aprendido durante el ajuste fino, útil para ilustración y contenido editorial.
- Integración en pipelines de producción de contenido en ComfyUI: al ser un safetensors de UNET, se puede insertar como nodo en un grafo de ComfyUI con control por lotes, encadenando generación, edición y exportación.
- Automatización mediante la API de RunningHub: el repositorio enlaza la API de la plataforma, lo que permite invocar el modelo como servicio sin gestionar GPU propia, con facturación por uso.
- Prototipado rápido de direcciones de arte: para equipos de diseño que necesiten explorar variantes visuales a partir de referencias existentes antes de producir el material definitivo.
- Generación de variaciones de producto para comercio electrónico: a partir de una imagen base se pueden producir múltiples versiones (fondo, color, escenario) con un coste de cómputo mucho menor que una sesión fotográfica nueva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima para cargar los pesos en memoria: el fichero safetensors ocupa 12.533 MiB (aproximadamente 12,2 GiB), por lo que se necesita al menos esa cantidad solo para los pesos, más la memoria adicional del codificador de texto, el VAE y las activaciones del proceso de difusión.
- GPU recomendadas para inferencia sin offloading: NVIDIA RTX 4090 (24 GB), A100 (40 GB o 80 GB) y H100 (80 GB).
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090. En tarjetas de 16 GB o menos es previsible que requiera offloading a RAM o cuantización, aunque no se documenta ninguna receta oficial de cuantización.
- La página del autor en RunningHub promociona instancias con GPU de 48 GB, lo que sugiere que los flujos de trabajo publicados se han probado en ese entorno.
- Opciones de despliegue: ComfyUI (carga directa del safetensors como UNET), RunningHub en la nube y su API. No aplican llama.cpp, Ollama, vLLM ni TGI, ya que el modelo no es un modelo de lenguaje.
- Latencia y throughput: no disponible.
- No se documentan requisitos de RAM del sistema, versión de CUDA ni dependencias de librerías.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-pipi-krea2-02-unet | UNET de edición de imagen, finetune de Krea2 | no disponible | no aplica | no disponible | HuggingFace (13,1 GB), RunningHub |
| rh-krea2-unet | UNET de imagen, finetune de Krea2 | no disponible | no aplica | no disponible | HuggingFace |
| rh-pipi-krea2-emotion-unet | UNET de edición de imagen, finetune de Krea2 orientado a emoción | no disponible | no aplica | no disponible | HuggingFace |
| krea2 (modelo base) | Modelo de generación de imagen | no disponible | no aplica | no disponible en la información proporcionada | Referenciado como origen del finetune |

No se dispone de datos de rendimiento, parámetros ni licencia de los modelos comparados, por lo que la comparación se limita a la categoría y a la procedencia. No hay información suficiente para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que se debe seguir la licencia del proyecto original o upstream, pero no identifica cuál es esa licencia. El uso comercial queda en un limbo legal hasta que se verifique la licencia de Krea2 y la titularidad del ajuste.
- Ausencia total de documentación técnica: no hay datos de parámetros, dataset, resolución de entrenamiento ni hiperparámetros, lo que impide reproducir o auditar el ajuste.
- Riesgo de sesgos desconocido: al no publicarse la composición del dataset de ajuste fino, no es posible evaluar sesgos demográficos, culturales o de representación.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar detalles plausibles pero falsos (texto ilegible, anatomías incorrectas, objetos incoherentes) que no guardan relación con la imagen de entrada.
- Dependencia del pipeline: el repositorio contiene solo el UNET; para funcionar necesita el codificador de texto y el VAE del modelo base Krea2, cuya compatibilidad exacta no se documenta.
- Dependencia de la palabra de activación `pipik2`: omitirla puede degradar el estilo esperado y provocar resultados fuera de la distribución del ajuste.
- Riesgo de sobreajuste al estilo del autor: un finetune de este tipo puede reducir la adherencia al prompt general en favor del estilo aprendido, especialmente en prompts alejados del dominio de entrenamiento.
- Validación comunitaria inexistente: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas.
- Idiomas no especificados: no se indica qué idiomas entiende el codificador de texto asociado, por lo que el comportamiento con prompts en castellano no está garantizado.
- Metadatos poco fiables: el repositorio no incluye información de versiones ni changelog, y la model card mezcla contenido promocional de la plataforma con información técnica.
- Sin benchmarks publicados: no hay ninguna métrica objetiva (FID, CLIP score, similitud de edición) que permita valorar la calidad frente a alternativas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-pipi-krea2-02-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2085873723076333570
- Página del autor: https://www.runninghub.cn/user-center/1860932065674887170
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Workflow krea2 texto a imagen (sitio chino): https://www.runninghub.cn/post/2071164326781734914
- Workflow krea2 imagen a imagen con inferencia inversa de prompt: https://www.runninghub.cn/post/2071358346015371266
- Workflow krea2 de cambio de vestuario: https://www.runninghub.cn/post/2081382750556348418
- Workflow krea2 de edición de imagen única: https://www.runninghub.cn/post/2081650003457691649
- Workflow krea2 de limpieza de imagen sin inferencia inversa de prompt: https://www.runninghub.cn/post/2081773404809682946
- Workflow krea2 texto a imagen (sitio internacional): https://www.runninghub.ai/zh-cn/post/2070539933625962498
- Workflow krea2 de limpieza de imagen con inferencia inversa (sitio internacional): https://www.runninghub.ai/zh-cn/post/2071363127198965761
- Herramienta de etiquetado y entrenamiento citada por el autor: zhaotutu.xyz
- Modelo relacionado en HuggingFace: https://huggingface.co/RunningHubAI/rh-krea2-unet
- Modelo relacionado en HuggingFace: https://huggingface.co/RunningHubAI/rh-pipi-krea2-emotion-unet
- Plugin de ComfyUI de RunningHub para APIs compatibles con OpenAI: https://github.com/HM-RunningHub/ComfyUI_RH_LLM_API
