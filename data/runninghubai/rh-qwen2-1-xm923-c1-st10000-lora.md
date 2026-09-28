# RunningHubAI/rh-qwen2.1-xm923-c1-st10000-lora

## Resumen

rh-qwen2.1-xm923-c1-st10000-lora es un adaptador LoRA de bajo rango para generación de imágenes a partir de texto, publicado por RunningHubAI en nombre de un autor de su plataforma. No se trata de un modelo de lenguaje ni de un modelo base completo: es un fichero de pesos de 80 MiB (`Qwen2.1-xm923_c1-st10000.safetensors`) que se aplica sobre el modelo de difusión `qwen-image-2.1`, indicado en la model card como modelo de partida. Su función es inyectar un estilo concreto, activado mediante la palabra clave `xm`, orientado a fotografía vertical de estilo cándido o *lifestyle*.

El repositorio está pensado para su uso dentro de ComfyUI, RunningHub o el ecosistema de Hugging Face, y la model card no documenta ni el dataset de entrenamiento, ni el número de pasos, ni hiperparámetros, ni resultados de evaluación. El ejemplo de prompt incluido describe una escena doméstica en formato 3:4 con una mujer joven en una cocina, lo que sugiere que el adaptador se ha ajustado sobre un conjunto de prompts largos y muy descriptivos en inglés, con composición vertical.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de la práctica habitual en las plataformas de generación de imágenes, donde terceros publican LoRAs de estilo con documentación mínima. Cualquier evaluación seria exige reproducir el pipeline sobre el modelo base, algo que la información disponible no permite verificar. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de tipo text-to-image; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el fichero de pesos ocupa 80 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el ejemplo de prompt de la model card está en inglés) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors |
| Modelo base | qwen-image-2.1 (nombre indicado en la model card; el identificador del repositorio usa "qwen2.1") |
| Palabra clave de activación | `xm` |
| Relación de aspecto del ejemplo | 3:4 (vertical) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del adaptador ni la del modelo base más allá de la etiqueta `lora` y del campo `pipeline_tag: text-to-image`. Por la nomenclatura del fichero (`xm923_c1_st10000`), se deduce una convención interna de RunningHub que probablemente codifica el identificador del dataset o del estilo (`xm923`), el paso o checkpoint (`c1`) y el número de pasos de entrenamiento (`st10000`), pero esto es una interpretación del nombre y no un dato confirmado por la documentación. Tampoco se indica la técnica de ajuste (LoRA clásico, LoHa, DoRA), el rango, el alpha ni qué módulos del modelo base se han adaptado.

El único material de entrenamiento que aparece en la model card es un prompt de ejemplo muy extenso, en inglés, que describe con detalle una escena de cocina: encuadre vertical, luz de ventana difusa, cocina doméstica, una mujer de unos treinta años lavando platos, con indicaciones explícitas sobre vestuario, expresión, profundidad de campo y elementos del fondo. El prompt se cierra con la etiqueta `xm` y el campo `wh_ratio: "3:4"`, lo que apunta a que el estilo aprendido está fuertemente ligado a composiciones verticales y a descripciones largas de tipo fotográfico. No hay información sobre el volumen de datos, la procedencia de las imágenes, la existencia de filtrado o curación del dataset, ni sobre un proceso de RLHF o DPO (técnicas que, por otra parte, no son habituales en adaptadores de difusión).

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante la aplicación del adaptador sobre el modelo base `qwen-image-2.1`.
- Activación de un estilo concreto mediante la palabra clave `xm`, que debe incluirse en el prompt.
- Reproducción de un estilo fotográfico de tipo cándido o *lifestyle*: escenas domésticas, luz natural difusa, profundidad de campo reducida y encuadres de persona.
- Composición en formato vertical 3:4, según el ejemplo documentado.
- Respuesta a prompts largos y muy descriptivos, con control de vestuario, iluminación, mobiliario y encuadre.
- Integración en flujos de ComfyUI y en la plataforma RunningHub.
- Soporte de *tool calling*: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible; el único prompt documentado está en inglés.
- Capacidades de audio, vídeo o visión para comprensión: no disponibles.

## Casos de uso

- Generación de imágenes de estilo cotidiano para blogs y medios: el adaptador produce escenas domésticas con luz natural y encuadre vertical, adecuadas para ilustrar artículos de lifestyle sin recurrir a bancos de imágenes.
- Prototipado de campañas de moda o equipamiento deportivo: el ejemplo documentado incluye ropa técnica ajustada (top de tirantes y leggings), de modo que el estilo puede servir para explorar variaciones de vestuario sobre una misma base visual.
- Creación de contenido para redes sociales en formato vertical: la relación 3:4 del ejemplo encaja con publicaciones de feed y stories, y permite iterar variaciones rápidamente dentro de ComfyUI.
- Pruebas de concepto de dirección de arte: un equipo puede generar referencias visuales coherentes de interior doméstico y figura humana antes de una sesión fotográfica real.
- Integración en pipelines de automatización con ComfyUI: al ser un fichero safetensors de 80 MiB, puede encadenarse con nodos de upscaling, inpainting o cambio de fondo sin apenas coste de almacenamiento.
- Experimentación académica sobre adaptación de bajo rango: sirve como ejemplo reproducible (dentro de lo limitado de su documentación) de cómo un LoRA de estilo condiciona composición, iluminación y encuadre.
- Generación de material de relleno para demostraciones de producto: útil para poblar prototipos de interfaz o maquetas con imágenes verosímiles a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud con el prompt), comparaciones con otros adaptadores ni evaluaciones humanas. Tampoco se documenta el número de pasos de inferencia, la escala de CFG ni el sampler recomendados, por lo que no es posible reproducir una configuración de referencia.

## Requisitos de hardware

- VRAM para el adaptador: despreciable. El fichero LoRA ocupa 80 MiB, por lo que su huella en memoria es marginal frente al modelo base.
- VRAM total: viene determinada íntegramente por el modelo base `qwen-image-2.1`, cuyas especificaciones no se detallan en la información disponible. No se puede dar una cifra fiable sin conocer el tamaño y la precisión de ese modelo.
- GPU recomendadas: no disponible. Como orientación general para pipelines de difusión de imagen de gran tamaño, se suelen emplear A100, H100, L40S o RTX 4090, dependiendo de la precisión y de si se aplican técnicas de ahorro de memoria (atención eficiente, *offloading* a CPU, *sequential CPU offload*).
- GPU de consumo: no confirmable. Un adaptador de 80 MiB cabe sin problema en cualquier GPU de consumo; la viabilidad depende por completo del modelo base.
- Opciones de despliegue: ComfyUI (plataforma indicada en las etiquetas), plataforma RunningHub (ejecución en la nube y API) y, en general, cualquier *runtime* de difusión compatible con el modelo base y con pesos safetensors.
- Latencia y rendimiento: no disponible. No se publican tiempos de inferencia, pasos por segundo ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen2.1-xm923-c1-st10000-lora | LoRA text-to-image | qwen-image-2.1 | 3:4 vertical (ejemplo) | no disponible | Hugging Face, RunningHub |
| rh-qwen2.1-lora | LoRA text-to-image | no disponible | no disponible | no disponible | Hugging Face |
| rh-qwen-image-2.1-aio-nsfw-lora | LoRA text-to-image | qwen-image-2.1 (por nombre) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento, parámetros ni contexto para ninguno de los adaptadores comparados, por lo que la comparación se limita a su naturaleza técnica (todos son LoRA para generación de imágenes) y a su disponibilidad pública. Cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- Documentación mínima: no se especifican hiperparámetros de entrenamiento, composición del dataset, licencia concreta ni requisitos de uso, lo que impide auditar el modelo.
- Licencia ambigua: la model card remite a la licencia del proyecto original y deja el copyright en el autor. No hay confirmación explícita de permiso para uso comercial, por lo que en producción conviene aclararlo con el autor o con RunningHub antes de desplegarlo.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir anatomías incorrectas (manos, dedos, ojos), incoherencias en el texto de los objetos y elementos imposibles en la escena.
- Sesgo de estilo: el adaptador parece ajustado a un tipo muy concreto de escena (mujer joven, cocina doméstica, luz natural, encuadre vertical). Es probable que su rendimiento se degrade fuera de ese dominio, aunque no hay evaluación que lo confirme.
- Sesgo demográfico potencial: el único ejemplo documentado muestra un sujeto femenino joven de tez clara; sin información del dataset no puede descartarse un sesgo de representación.
- Idioma: solo hay evidencia de prompts en inglés. El comportamiento con prompts en castellano u otros idiomas es desconocido.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentación de terceros sobre calidad real.
- Metadatos inconsistentes: el identificador del repositorio dice "qwen2.1" mientras que la model card indica `qwen-image-2.1` como modelo de partida; además, las fechas de creación y actualización (2026) son posteriores a la fecha habitual de publicación, lo que conviene verificar antes de tomarlas como referencia.
- Contenido potencialmente sensible: existen otros LoRA del mismo autor orientados explícitamente a contenido NSFW; conviene revisar las imágenes generadas antes de cualquier uso público.
- Dependencia del modelo base: cualquier cambio, retirada o actualización de `qwen-image-2.1` puede afectar a la reproducibilidad del adaptador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen2.1-xm923-c1-st10000-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2102806149660766209
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1892576279944921090
- Plataforma RunningHub International: https://www.runninghub.ai
- Plataforma RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Repositorio relacionado rh-qwen2.1-lora: https://huggingface.co/RunningHubAI/rh-qwen2.1-lora
- Repositorio relacionado rh-qwen-image-2.1-aio-nsfw-lora: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-aio-nsfw-lora
- Perfil de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI
- Organización Qwen en GitHub: https://github.com/QwenLM
