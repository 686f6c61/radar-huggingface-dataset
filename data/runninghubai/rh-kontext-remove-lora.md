# RunningHubAI/rh-kontext-remove-lora

## Resumen

rh-kontext-remove-lora es un adaptador LoRA de edición de imágenes publicado por RunningHubAI (RunningHub) bajo la autoría de la cuenta @T8star-Aix. No es un modelo de lenguaje ni un modelo base: se trata de un adaptador de bajo rango que se aplica sobre un modelo de generación y edición de imágenes para eliminar objetos o elementos concretos de una escena a partir de una instrucción en lenguaje natural. Su función principal es la edición guiada por texto del tipo "eliminar X de la escena", con la palabra de activación documentada como "Remove xxx from the scene".

El repositorio contiene un único archivo de pesos, `kontext_remove.safetensors`, de 164 MiB, lo que confirma que se trata de un adaptador LoRA y no de un modelo completo. La model card indica que ha sido afinado a partir de una base denominada "F1基础-Kontext" y remite como referencia al proyecto `starsfriday/Kontext-Remover-General-LoRA`. Está pensado para ejecutarse en ComfyUI, en la plataforma RunningHub y en Hugging Face, con pipeline declarado `image-text-to-image`.

Su relevancia es práctica más que arquitectónica: la eliminación de objetos (*object removal*) es una de las tareas de edición más demandadas en flujos de retoque, e-commerce y preprocesado de datasets, y un LoRA especializado permite obtenerla sin reentrenar el modelo base. Ahora bien, la ficha pública es extremadamente escasa: no se documentan licencia, idiomas, arquitectura del modelo base, datos de entrenamiento ni resultados de benchmarks, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto sin validación externa publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusión para edición de imagen; arquitectura del modelo base no disponible |
| Parámetros totales | No disponible (adaptador de 164 MiB; el modelo base no se especifica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido de LLM; la ventana vendrá limitada por el codificador de texto del modelo base) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones del adaptador; solo se publica el safetensors original) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`kontext_remove.safetensors`) |
| Tipo de modelo | LoRA de edición de imagen (image edit) |
| Modelo base declarado | "F1基础-Kontext" (denominación del autor; no se detalla qué modelo corresponde exactamente) |
| Palabras de activación | "Remove xxx from the scene" |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según el repositorio) | 2026-09-25 |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna del modelo base ni la del adaptador más allá de su naturaleza LoRA. Un LoRA de este tipo añade matrices de bajo rango a determinadas capas del modelo base (habitualmente las capas de atención del *transformer* de difusión) y se carga como un parche sobre los pesos originales; el archivo de 164 MiB es coherente con un adaptador de rango moderado, pero el rango, las capas objetivo y el algoritmo de fusión no se documentan en la model card.

Tampoco se especifican los datos de entrenamiento: no hay número de pares imagen-instrucción, ni resolución, ni composición del dataset, ni si se emplearon técnicas de ajuste posteriores (RLHF, DPO o similares, que además no son habituales en este tipo de adaptadores). La única referencia técnica es que el modelo se ha afinado a partir de "F1基础-Kontext" y que se inspira o deriva del proyecto `starsfriday/Kontext-Remover-General-LoRA`, cuyo enlace se incluye en la model card. Toda la información adicional sobre el proceso de entrenamiento figura como no disponible.

## Capacidades

- Edición de imagen guiada por texto con tarea específica de eliminación de objetos: dada una imagen y una instrucción del tipo "Remove xxx from the scene", el adaptador genera una versión de la imagen sin el elemento indicado.
- Integración como LoRA en flujos de ComfyUI, aplicable sobre el modelo base compatible para modificar su comportamiento de edición.
- Ejecución en la plataforma RunningHub, tanto en modo interactivo como a través de su API.
- Compatibilidad declarada con Hugging Face como repositorio de distribución de los pesos.
- No se documentan capacidades de *tool calling*, uso como agente, razonamiento multi-paso, soporte multilingüe explícito ni modos especiales (thinking, visión, audio). Son capacidades propias de modelos de lenguaje y no aplican a este artefacto.
- No se documentan capacidades de generación de texto, código o matemáticas: el pipeline es exclusivamente `image-text-to-image`.

## Casos de uso

- Retoque fotográfico de producto en e-commerce: eliminar objetos no deseados de una fotografía (etiquetas, cables, elementos de atrezzo) manteniendo el fondo y la iluminación originales, con la instrucción "Remove xxx from the scene" como *trigger*.
- Fotografía inmobiliaria: borrar elementos personales, cables o muebles concretos de una estancia para presentar el espacio despejado, aplicando el LoRA sobre el modelo base en un flujo de ComfyUI con máscara o instrucción textual.
- Preprocesado de datasets de visión artificial: limpiar imágenes de marcas de agua, logotipos o distractores antes de usarlas para entrenar otros modelos, reduciendo el sesgo introducido por elementos espurios.
- Limpieza de material gráfico para documentación técnica: retirar anotaciones o elementos temporales de capturas y diagramas manteniendo el resto de la imagen intacta.
- Publicación de contenido en redes sociales: eliminar objetos que distraen o personas del fondo de una fotografía antes de publicarla, siempre que se cumplan las obligaciones legales y éticas de consentimiento de imagen.
- Creación de variaciones creativas en estudio de diseño: combinar el LoRA con otros adaptadores en ComfyUI para producir varias propuestas de una misma escena sin un elemento concreto, acelerando la iteración de *moodboards*.
- Automatización por API: desplegar el flujo en RunningHub y llamarlo desde un servicio propio para procesar lotes de imágenes de forma programática, siempre que se asuma la dependencia de la plataforma del proveedor.
- Documentación de incidencias en soporte técnico: eliminar datos personales visibles (documentos, pantallas, matrículas) de capturas antes de adjuntarlas a un *ticket* interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de edición (por ejemplo, CLIP-score, FID, LPIPS o evaluación humana), ni comparaciones cuantitativas con otros adaptadores de eliminación de objetos, ni datos de latencia o *throughput*.

## Requisitos de hardware

- El adaptador en sí ocupa 164 MiB y no condiciona los requisitos de memoria: el consumo lo determina íntegramente el modelo base sobre el que se aplique.
- Como el modelo base declarado ("F1基础-Kontext") no está especificado con detalle, no es posible dar cifras de VRAM verificadas para este LoRA en concreto: no disponible.
- Estimación orientativa, no confirmada por el autor, para un modelo base de la familia Kontext (del orden de 12 000 millones de parámetros) en precisión completa: 16-24 GB de VRAM en bf16/fp16, lo que encaja en A100 40 GB, H100, L40S o RTX 4090 con margen limitado.
- En cuantizaciones de 8 bits el requisito baja aproximadamente a 10-13 GB, viable en RTX 4080/4090 y en GPUs de 16 GB; en 4 bits, del orden de 6-9 GB, viable en RTX 3060 12 GB o RTX 4070. Estas cifras son estimaciones generales para modelos de ese tamaño, no datos publicados por el autor.
- Opciones de despliegue: ComfyUI (entorno nativo declarado), la plataforma RunningHub (interfaz y API) y cualquier *runtime* capaz de cargar safetensors y aplicar LoRA sobre el modelo base compatible (por ejemplo, difusión con soporte de LoRA en Python). No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, que además son *runtimes* de modelos de lenguaje y no aplican a este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del artefacto | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-kontext-remove-lora (RunningHubAI) | LoRA de eliminación de objetos | 164 MiB (safetensors) | "F1基础-Kontext" (no detallado) | No disponible | Hugging Face, RunningHub, ComfyUI |
| starsfriday/Kontext-Remover-General-LoRA | LoRA de eliminación de objetos | No disponible | No disponible | No disponible | Hugging Face (referenciado por el autor de este modelo) |
| Otros LoRA de edición sobre Kontext | LoRA de edición de imagen | No disponible | Familia Kontext | No disponible | No disponible en la información proporcionada |

No se dispone de datos de benchmarks, licencias ni especificaciones del modelo base que permitan una comparación cuantitativa rigurosa con alternativas. Cualquier comparación de calidad de edición entre estos adaptadores requeriría una evaluación propia.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica únicamente que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del upstream. Esto impide confirmar si se permite el uso comercial; en un entorno de producción habría que contactar con el autor o con RunningHub antes de desplegarlo.
- Ausencia total de documentación técnica: no se detallan datos de entrenamiento, composición del dataset, rango del LoRA, capas objetivo ni el modelo base exacto, lo que dificulta reproducir o auditar el comportamiento.
- Riesgo de artefactos de edición: en tareas de *object removal* es habitual que aparezcan halos, texturas repetidas o reconstrucciones incorrectas del fondo cuando el objeto a eliminar es grande o tapa estructuras complejas. No hay evaluación publicada que cuantifique este riesgo en este adaptador.
- Dependencia del *trigger* exacto: la model card fija la frase "Remove xxx from the scene", por lo que el rendimiento puede degradarse con formulaciones distintas.
- Idiomas soportados no disponibles: se desconoce si las instrucciones de edición funcionan correctamente en castellano o si el adaptador está entrenado únicamente con instrucciones en inglés o chino.
- Repositorio sin validación externa: 0 descargas y 0 likes en el momento de la consulta, sin *issues* ni discusiones públicas que permitan contrastar la calidad real del adaptador.
- Fechas del repositorio inconsistentes con el calendario habitual (creación y actualización el 2026-09-25): conviene verificar los metadatos antes de citarlos.
- Riesgos éticos y legales de uso: la eliminación de personas u objetos de una imagen puede afectar a derechos de imagen, pruebas documentales o contextos periodísticos. No debe emplearse para alterar evidencia ni para desinformar.
- Dependencia de un modelo base no incluido: el repositorio solo contiene el adaptador, por lo que el usuario debe obtener por su cuenta una base compatible y asumir su licencia, que puede ser más restrictiva que la del LoRA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-kontext-remove-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-kontext-remove-lora/blob/main/README_cn.md
- LoRA de referencia citado por el autor: https://huggingface.co/starsfriday/Kontext-Remover-General-LoRA
- Página del modelo original en RunningHub: https://www.runninghub.cn/model/public/1941553136186322945
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub (detalle): https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-1941553136186322945
