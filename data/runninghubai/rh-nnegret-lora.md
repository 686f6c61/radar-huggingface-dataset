# RunningHubAI/rh-nnegret-lora

## Resumen

rh-nnegret-lora es un adaptador LoRA de bajo rango para generación de imágenes texto-a-imagen, especializado en la conversión de estilo hacia ilustración anime. Lo publica la plataforma RunningHub en nombre del autor nnegret, y está pensado para ejecutarse sobre el modelo base Flux2-Klein-9B dentro de entornos ComfyUI, de la propia plataforma RunningHub o de Hugging Face. El objetivo declarado por el autor es transformar cualquier imagen de entrada (fotografía real, paisaje, render 3D u otro estilo pictórico) en una ilustración de alta definición con colorido "transparente" de tipo anime y líneas finas.

El adaptador ocupa 316 MiB en un único fichero safetensors (`nnegrat_illus_9b_3200.safetensors`), por lo que se apoya en el modelo base de 9.000 millones de parámetros para toda la capacidad generativa; el LoRA sólo aporta la desviación de estilo. La propuesta diferencial del autor es la eficiencia en el modo imagen-a-imagen: asegura que la conversión de estilo se completa con sólo 4 pasos de muestreo, mientras que el modo texto-a-imagen requiere entre 20 y 30 pasos para lograr detalle pleno.

Es relevante ahora porque se enmarca en la ola de LoRAs de estilización listas para flujos ComfyUI, con palabras de activación definidas (`artwork in illustyle`) y un juego de parámetros recomendados (peso 0,9 y muestreador ER_SDE), lo que reduce la fricción de integración para creadores y equipos que montan pipelines de generación visual sin entrenar modelos desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusion Flux2-Klein-9B |
| Parametros totales | no disponible para el LoRA (fichero de 316 MiB); el modelo base Flux2-Klein-9B tiene 9.000 millones de parametros |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; las palabras de activacion estan en ingles (`artwork in illustyle`) y chino (`保持画面元素不变`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`nnegrat_illus_9b_3200.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a los pesos del modelo de difusión base Flux2-Klein-9B (9.000 millones de parámetros). El LoRA no modifica la arquitectura subyacente: la red de difusión de Flux2-Klein genera las imágenes y el adaptador desplaza la distribución de salida hacia el estilo de ilustración objetivo. El fichero de pesos ocupa 316 MiB, coherente con un adaptador de rango reducido sobre el modelo base.

La información proporcionada no detalla la composición del dataset de entrenamiento, el número de pasos de entrenamiento, ni si se emplearon técnicas de ajuste fino adicionales (RLHF, DPO o similares). La model card únicamente indica que el adaptador se entrenó sobre Flux2-Klein-9B y que el autor recomienda el muestreador ER_SDE con peso 0,9. La innovación práctica destacada no es arquitectónica, sino de eficiencia de inferencia: el autor afirma que en modo imagen-a-imagen la estilización se resuelve con sólo 4 pasos, frente a los 20-30 pasos del modo texto-a-imagen.

## Capacidades

- Conversión de estilo a ilustración anime: transforma fotografías, paisajes, renders 3D u otros estilos en ilustración de tipo anime con líneas finas y colorido de tipo "transparente".
- Modo imagen-a-imagen (I2I) con estilización rápida: el autor indica 4 pasos de muestreo para completar la conversión de estilo.
- Modo texto-a-imagen (T2I): generación de ilustraciones desde prompt de texto, requiriendo 20-30 pasos para obtener detalle pleno.
- Conservación de elementos en la conversión: mediante la palabra de activación `保持画面元素不变` ("mantener los elementos de la imagen sin cambios"), el autor indica que se pueden preservar rasgos de personaje, ropa y fondo alterando únicamente el estilo.
- Control por palabra de activación: el estilo se activa con `artwork in illustyle`.
- Integración en ComfyUI y en la plataforma RunningHub.
- Soporte de tool calling / function calling: no aplicable (modelo de generación de imagen).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües o de audio: no aplicable.

## Casos de uso

- Estilización de fotografías de personajes: se introduce una foto real en un nodo de imagen-a-imagen de ComfyUI y, con 4 pasos y el prompt `artwork in illustyle`, se obtiene una versión ilustrada del sujeto conservando la composición original.
- Ilustración de portadas para narrativa ligera o webtoon: el modo T2I con 20-30 pasos permite generar ilustraciones originales directamente desde descripciones textuales, sin depender de una imagen de referencia.
- Conversión de renders 3D a acabado ilustrado: equipos que producen previsiones en 3D pueden pasar el render por el LoRA para obtener una versión con apariencia de ilustración anime antes de la fase de acabado final.
- Unificación de estilo en catálogos o galerías: aplicar el mismo LoRA con peso 0,9 sobre un lote de imágenes heterogéneas permite homogeneizar el estilo visual de una colección manteniendo cada encuadre.
- Prototipado rápido de dirección de arte: con 4 pasos en I2I, el coste por iteración es bajo, lo que facilita explorar variantes de estilo antes de decidir la línea gráfica de un proyecto.
- Integración en pipelines de generación vía API de RunningHub: el LoRA puede invocarse desde la API de la plataforma, lo que permite automatizar la estilización dentro de flujos de producción sin montar infraestructura propia.
- Fondos ilustrados para interfaces o juegos: a partir de imágenes de referencia o prompts de paisaje, generar recursos gráficos con un estilo consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. La carga depende del modelo base Flux2-Klein-9B (9.000 millones de parámetros), no del LoRA, que sólo añade 316 MiB. Una estimación habitual para modelos de difusión de ese orden de magnitud es de 20-24 GB en precision bf16 y de 10-12 GB con cuantización de 8 bits; estas cifras son estimaciones orientativas y no proceden de la documentación del autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, cabría esperar el uso de GPU de gama alta tipo A100, H100, RTX 4090 o RTX 3090, pero no hay confirmación del autor.
- Compatibilidad con GPU de consumo: no confirmada en la documentación. Dependerá del formato y de la cuantización con que se cargue el modelo base en ComfyUI.
- Opciones de despliegue: ComfyUI (plataforma de referencia indicada por el autor), la plataforma RunningHub (web e internacional) y su API, además de Hugging Face para la descarga de pesos.
- Latencia y throughput estimados: no disponibles. El autor indica el número de pasos de muestreo (4 en I2I, 20-30 en T2I) y el muestreador recomendado ER_SDE, pero no publica tiempos de ejecución ni velocidad medida.
- Parámetros de inferencia recomendados por el autor: peso del LoRA 0,9, muestreador ER_SDE.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Palabra de activacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-nnegret-lora | LoRA text-to-image | Flux2-Klein-9B | 316 MiB | `artwork in illustyle` | no disponible | Hugging Face, RunningHub, ComfyUI |
| rh-negra-lora | LoRA text-to-image | krea2 | no disponible | `negra` | no disponible | Hugging Face, RunningHub |
| rh-nnegret-klein9b-cglora-lora | LoRA text-to-image | no disponible (nombre sugiere Klein9b) | no disponible | no disponible | no disponible | RunningHub |

No se dispone de datos de rendimiento comparativos entre estos adaptadores en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta sesgos de género, etnia u otros, algo habitual en adaptadores de estilización no acompañados de una evaluación de sesgo.
- Riesgo de alucinacion: en generación de imagen se traduce en deformaciones anatómicas, artefactos en manos o rostros y pérdida de fidelidad respecto a la imagen de referencia, especialmente con pesos altos o pocos pasos. No hay métricas publicadas que cuantifiquen este riesgo.
- Limitaciones de contexto o idioma: el modelo no procesa contexto textual largo; las palabras de activación funcionan en inglés y chino. No se documenta el comportamiento con prompts en castellano.
- Restricciones de licencia: la licencia figura como "no disponible". La model card indica que la publicación la realiza RunningHub en nombre del autor, que la propiedad intelectual permanece en el autor y que debe seguirse la licencia del proyecto original o del proyecto upstream. Sin una licencia explícita, el uso comercial queda en una situación jurídica indeterminada y conviene aclararlo con el autor o con RunningHub antes de desplegarlo en producción.
- Dependencia del modelo base: el rendimiento final depende de Flux2-Klein-9B, no del LoRA; la calidad y las limitaciones del modelo base se heredan.
- Parámetros sensibles al flujo: los resultados dependen del muestreador (ER_SDE recomendado), del peso (0,9 recomendado) y del número de pasos (4 en I2I, 20-30 en T2I). Desviarse de estas recomendaciones puede degradar el resultado.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, y sin resultados de benchmarks publicados, por lo que no existe validación independiente de la calidad declarada.
- Fecha de creación en el repositorio: 2026-10-12, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-nnegret-lora
- Proyecto original (modelo publico en RunningHub): https://www.runninghub.cn/model/public/2026647271944757249
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1934317192743657474
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Modelo relacionado, rh-negra-lora: https://huggingface.co/RunningHubAI/rh-negra-lora
- Modelo relacionado, rh-lora-2083017906674712578: https://huggingface.co/RunningHubAI/rh-lora-2083017906674712578
- Ficha de terceros, Rh Nnegret Klein9b Cglora Lora: https://free2aitools.com/model/runninghubai/rh-nnegret-klein9b-cglora-lora
