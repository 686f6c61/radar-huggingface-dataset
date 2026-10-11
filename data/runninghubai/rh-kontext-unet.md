# RunningHubAI/rh-kontext-unet

## Resumen

rh-kontext-unet es un modelo de edición de imágenes distribuido por RunningHubAI en Hugging Face, etiquetado con el pipeline `image-text-to-image` y los tags `comfyui`, `unet` y `region:us`. El repositorio contiene un único archivo de pesos, `FLUX_kontext_relight.safetensors`, de 22 700 MiB (unos 22,2 GiB), y está pensado para cargarse dentro de ComfyUI o en la propia plataforma RunningHub. El autor del modelo aparece en la model card como el usuario RunningHub `@卖女孩的小火柴`, y la ficha indica que está afinado a partir de una base denominada "F1基础-Kontext"; el nombre del archivo sugiere además una especialización en *relighting* (reiluminación) sobre una base de la familia FLUX Kontext, aunque este extremo no se confirma de forma explícita en la documentación publicada.

El modelo resuelve la tarea de edición de imagen guiada por texto (image-text-to-image): a partir de una imagen de entrada y una instrucción textual, genera una versión modificada de esa imagen. Su relevancia es fundamentalmente práctica: se distribuye como UNET listo para *workflows* de ComfyUI, lo que permite integrarlo en cadenas de postprocesado gráfico sin necesidad de reentrenar nada. No se trata, por tanto, de un modelo de lenguaje: no genera texto ni código, y su evaluación debe hacerse en términos de fidelidad de edición, coherencia de iluminación y conservación de la identidad de la imagen original.

La información publicada es muy escasa: el repositorio no incluye model card detallada en cuanto a arquitectura, datos de entrenamiento, benchmarks ni condiciones de licencia más allá de una remisión genérica a la licencia del proyecto original o *upstream*. En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 *likes*, y la búsqueda web no ha devuelto documentación técnica adicional sobre este modelo concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET para edición de imagen (según model card: "Model Type: UNET (image edit)"). No se detalla la variante concreta ni el número de bloques. |
| Parámetros totales | No disponible. El repositorio contiene un único archivo de 22 700 MiB (≈22,2 GiB); el nombre del archivo apunta a una base de la familia FLUX Kontext, pero no se confirma en la información proporcionada. |
| Parámetros activos | No procede (no es un modelo MoE). |
| Longitud de contexto | No aplica / no disponible (modelo de imagen; no se especifica resolución nativa de entrenamiento ni resolución máxima soportada). |
| Tipos de cuantización | No disponible. Solo se publica un archivo en safetensors; no se listan versiones GGUF, FP8, INT8 ni similares. |
| Idiomas soportados | No disponible. Al ser un pipeline image-text-to-image, se refiere al idioma de los *prompts*; la model card no lo especifica. |
| Licencia | No disponible. La model card indica: "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license." |
| Formato de pesos | safetensors (`FLUX_kontext_relight.safetensors`, 22 700 MiB). |
| Tamaño del repositorio | 23,8 GB. |
| Fecha de creación / actualización | 2026-10-11 (creación y última actualización el mismo día). |
| Plataformas de uso | ComfyUI, RunningHub y Hugging Face (según model card). |
| Descargas / likes | 0 / 0. |

## Arquitectura y entrenamiento

La información disponible describe el modelo únicamente como "UNET (image edit)" y lo sitúa como *finetune* de una base llamada "F1基础-Kontext". No se publican detalles sobre el número de parámetros, la profundidad del UNET, el mecanismo de condicionamiento textual (tipo de *text encoder* o de *cross-attention*), el esquema de *timestep scheduling* ni el tipo de *scheduler* de muestreo recomendado. Tampoco se documenta si emplea *attention* completa o variantes eficientes, ni si incorpora componentes adicionales como VAE o *text encoder* dentro del propio repositorio: el repositorio contiene un solo archivo de pesos, por lo que se asume que el resto de componentes deben obtenerse por separado en el *workflow* correspondiente.

En cuanto al entrenamiento, no se especifica el volumen de datos, la composición del dataset, la resolución de entrenamiento, el uso de técnicas de ajuste fino como LoRA, *full fine-tuning* o *DreamBooth*, ni si hubo etapas de alineación con preferencias humanas. El único indicio técnico es el nombre del archivo, `FLUX_kontext_relight.safetensors`, que sugiere una especialización en tareas de reiluminación de imágenes, presumiblemente mediante pares de imágenes con distinta iluminación. Cualquier afirmación adicional sobre la arquitectura o el proceso de entrenamiento sería especulativa y no está respaldada por la documentación publicada.

## Capacidades

- Edición de imagen guiada por texto: recibe una imagen de entrada más una instrucción textual y devuelve una imagen modificada (pipeline `image-text-to-image`).
- Especialización aparente en reiluminación: el nombre del archivo (`FLUX_kontext_relight`) apunta a edición de iluminación sobre una imagen existente. No confirmado explícitamente en la model card.
- Integración con ComfyUI: el tag `comfyui` y la propia model card indican que está pensado para cargarse como UNET dentro de un *workflow* de ComfyUI.
- Ejecución en la nube de RunningHub: la ficha incluye enlaces a la plataforma y a su API para ejecutar el modelo sin infraestructura propia.
- Generación de texto, razonamiento, código y matemáticas: no aplica (no es un modelo de lenguaje).
- *Tool calling* / *function calling*: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible; no se especifican idiomas de *prompt*.
- Modo *thinking*, visión de vídeo o audio: no disponible / no aplica.

## Casos de uso

- Reiluminación de fotografía de producto: dado un *packshot* con iluminación plana, aplicar instrucciones del tipo "ilumina desde la izquierda con luz cálida" para generar variantes coherentes sin volver a fotografiar el producto.
- Postproducción fotográfica en estudio: corregir o sustituir esquemas de iluminación en retratos antes de entregar el material al cliente, integrándolo como nodo de un *workflow* de ComfyUI.
- Generación de variantes de *assets* para comercio electrónico: producir múltiples versiones de una misma imagen de catálogo (fondo neutro, luz de estudio, luz ambiental) a partir de una única toma original.
- *Mockups* y previsualización de material gráfico: adaptar imágenes base a distintos entornos de iluminación para presentaciones o revisiones de diseño antes de la producción final.
- Enriquecimiento de datasets sintéticos: generar pares imagen-entrada / imagen-editada con variaciones de iluminación para entrenar o validar otros modelos de visión por computador.
- Creación de contenido para redes y publicaciones: ajustar la iluminación de fotografías propias para homogeneizar el aspecto visual de una serie antes de publicarla.
- *Previsualización* en pipelines de VFX o videojuegos: explorar rápidamente variantes de iluminación sobre *concept art* o *frames* de referencia antes de invertir tiempo en renderizado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, LPIPS, SSIM, evaluaciones humanas ni comparativas con otros modelos de edición de imagen), y la búsqueda web realizada no ha devuelto documentación técnica ni resultados de evaluación asociados a `RunningHubAI/rh-kontext-unet`.

## Requisitos de hardware

- VRAM estimada para inferencia: los cálculos se basan en el tamaño del archivo publicado (22 700 MiB ≈ 22,2 GiB). Cargar los pesos en precisión completa o FP16 requiere del orden de 24 GB de VRAM o más, a lo que hay que sumar el consumo del *text encoder*, el VAE y las activaciones del *workflow*.
- Cabe en GPU de consumo: sí, en el límite, con GPUs de 24 GB como la RTX 3090 o la RTX 4090, siempre que el resto de componentes del *workflow* se gestionen con cuidado (por ejemplo, cargando y descargando modelos entre etapas). No cabe en GPUs de 8, 12 o 16 GB sin cuantizar los pesos, y no se distribuyen versiones cuantizadas en este repositorio.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para trabajar con margen y *batch* superior a 1. En el extremo inferior, RTX 3090 / 4090 de 24 GB.
- Opciones de despliegue: ComfyUI (escenario principal, indicado por el propio autor), la plataforma en la nube RunningHub y su API, y cargadores de safetensors compatibles con la familia FLUX en el ecosistema diffusers o ComfyUI. llama.cpp y Ollama no aplican a este tipo de modelo.
- Latencia y *throughput*: no disponible. No se publican tiempos de inferencia, número de pasos recomendado ni resolución de trabajo por defecto.

## Comparativa con modelos similares

No se dispone de datos verificados de comparación para este modelo en la información proporcionada. La model card no publica parámetros, contexto ni métricas, y la búsqueda web no ha devuelto material relevante. A continuación se indican alternativas de la misma categoría (edición de imagen guiada por texto) únicamente a título orientativo, marcando como no disponible todo dato que no pueda confirmarse con las fuentes consultadas.

| Modelo | Tipo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RunningHubAI/rh-kontext-unet | UNET de edición de imagen | No disponible | No disponible | No disponible | No disponible (remite al *upstream*) | Hugging Face (0 descargas), RunningHub, ComfyUI |
| FLUX.1 Kontext (Black Forest Labs) | Edición de imagen | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | No verificado en las fuentes consultadas |
| Alternativas de edición de imagen guiada por texto | No especificado | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la búsqueda web resultados comparativos que permitan establecer una tabla con cifras fiables.

## Limitaciones y advertencias

- Licencia indeterminada: la model card no especifica una licencia concreta y remite a la licencia del proyecto original o *upstream*. Antes de cualquier uso comercial es imprescindible verificar las condiciones de la base sobre la que se ha afinado el modelo.
- Ausencia de documentación técnica: no se documentan parámetros, arquitectura interna, datos de entrenamiento ni resolución nativa, lo que dificulta la reproducibilidad y la planificación de recursos.
- Sin benchmarks publicados: no hay ninguna métrica objetiva que permita anticipar la calidad de edición ni compararla con alternativas.
- Riesgo de artefactos y alucinación visual: como cualquier modelo generativo de imagen, puede introducir elementos no presentes en la imagen original, deformar detalles finos (texto, manos, geometrías) o modificar la identidad de sujetos al aplicar ediciones fuertes.
- Fidelidad al *prompt* no garantizada: al no publicarse evaluaciones, no puede asegurarse que respete instrucciones ambiguas o composiciones complejas.
- Idiomas de *prompt* desconocidos: no se especifica si las instrucciones funcionan correctamente en castellano o si el modelo está optimizado para inglés u otros idiomas.
- Dependencia de un *workflow* externo: el repositorio solo contiene el UNET; el resto de componentes (VAE, *text encoder*, *scheduler*) deben aportarse desde fuera, lo que añade riesgo de incompatibilidades de versión.
- Requisitos de VRAM elevados: un archivo de 22,2 GiB limita el despliegue a GPUs de gama alta o a servicios en la nube.
- Adopción nula verificable: 0 descargas y 0 *likes* en el momento de la consulta, sin evidencia pública de uso en producción.
- Fechas de creación y actualización registradas como 2026-10-11, sin historial de versiones posterior; no hay garantía de mantenimiento.
- La búsqueda web no ha arrojado resultados relacionados con este modelo, por lo que no existe validación independiente de su comportamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-kontext-unet
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2108431586856366082
- Página del autor: https://www.runninghub.cn/user-center/2102621357585289217
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
