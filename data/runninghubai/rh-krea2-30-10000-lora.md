# RunningHubAI/rh-krea2-30-10000-lora

## Resumen

`rh-krea2-30-10000-lora` es un adaptador LoRA de edición de imagen publicado por RunningHubAI sobre el modelo base krea2. No es un modelo de lenguaje: es un conjunto de pesos de bajo rango (224 MiB en un único fichero `Krea2-美女31-性感女大学生-10000.safetensors`) pensado para cargarse en ComfyUI o en la plataforma RunningHub y modificar el comportamiento generativo del modelo base en la dirección estilística que el autor ha entrenado.

El nombre del fichero y la descripción de la model card indican que el LoRA está orientado a la generación de retratos femeninos con una estética concreta ("Beauty31", "Sexy Female College Student"), con el sufijo "10000" que probablemente referencia el número de pasos o muestras de entrenamiento. El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (5 de noviembre de 2026), lo que sugiere una publicación reciente y sin validación comunitaria.

La relevancia de esta ficha es limitada desde el punto de vista técnico: no hay información pública sobre el dataset de entrenamiento, hiperparámetros, licencia explícita ni evaluaciones. Se trata de un artefacto de personalización estética para un pipeline image-text-to-image, no de un modelo fundacional. Cualquier evaluación rigurosa de calidad, sesgos o idoneidad para producción queda fuera del alcance de los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base krea2; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos LoRA: 224 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; el fichero se distribuye en safetensors, presumiblemente fp16/bf16 |
| Idiomas soportados | no disponible (los prompts suelen ser multilingües, pero no se especifica) |
| Licencia | no disponible; la model card remite a "the original project or upstream license" sin concretar |
| Formato de pesos | safetensors (`Krea2-美女31-性感女大学生-10000.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base krea2 para modificar su comportamiento sin reentrenar todos los pesos. El tamaño del fichero (224 MiB) es coherente con un LoRA de rango moderado sobre un modelo de difusión de varios miles de millones de parámetros, aunque no se especifica ni el rango, ni las capas objetivo, ni el alpha utilizado.

No hay información pública sobre el dataset de entrenamiento, el número de imágenes, la resolución, el número de pasos, la tasa de aprendizaje ni si se usó regularización o captions automáticos. El sufijo "10000" del nombre podría referirse a pasos de entrenamiento o a un identificador interno del autor, pero es una inferencia no confirmada. Tampoco se documenta si el LoRA se entrenó con DreamBooth, LoRA clásico o alguna variante (LoCon, LoHa), ni sobre qué checkpoint exacto de krea2.

## Capacidades

- Personalización estética de la generación image-text-to-image del modelo base krea2 en la dirección definida por el autor (retratos femeninos con estética "Beauty31").
- Edición de imagen guiada por texto, según la etiqueta `image-text-to-image` del repositorio.
- Integración en flujos de ComfyUI mediante el nodo de carga de LoRA estándar.
- Ejecución en la plataforma RunningHub, que permite cargar el LoRA sin infraestructura propia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión analítica, audio ni modo "thinking": son capacidades ajenas a este tipo de artefacto.
- Capacidades multilingües de prompt: no documentadas; dependen del text encoder del modelo base.

## Casos de uso

- Generación de retratos de estudio: cargando el LoRA en ComfyUI sobre krea2 y usando prompts descriptivos, se obtienen retratos femeninos con la estética concreta del adaptador, útil para moodboards o pruebas de concepto visuales.
- Prototipado de personajes para narrativa gráfica: el LoRA permite fijar un estilo de personaje recurrente y generar variaciones de pose e iluminación sin reentrenar el modelo base en cada iteración.
- Pruebas de concepto para campañas de moda o publicidad: generación rápida de variaciones estéticas antes de contratar fotografía real, siempre que la licencia del modelo base lo permita.
- Exploración de estilos en investigación sobre difusión: útil como caso de estudio de cómo un LoRA de 224 MiB desplaza la distribución de salida de un modelo base.
- Automatización de pipelines de imagen en RunningHub: el LoRA puede invocarse vía API de RunningHub para generar lotes de imágenes con el estilo entrenado.
- Docencia y demostraciones de fine-tuning: ejemplo práctico de adaptación de bajo rango sobre un modelo de difusión para explicar el flujo completo (entrenamiento, carga, inferencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende enteramente del modelo base krea2, cuyo tamaño no se especifica. El LoRA en sí añade 224 MiB de pesos, un coste marginal.
- GPU recomendadas: no disponible sin conocer el modelo base; para modelos de difusión de tamaño medio-alto se suelen requerir 16-24 GB de VRAM en fp16.
- ¿Cabe en consumer GPU? No se puede confirmar sin las especificaciones de krea2; el LoRA por sí solo no determina el requisito.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub (carga directa del repositorio) y, presumiblemente, cualquier runtime que cargue safetensors de difusión, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-30-10000-lora | LoRA sobre krea2 | no disponible (224 MiB de pesos) | no aplica | no disponible | Hugging Face y RunningHub |
| LoRAs de la comunidad sobre SDXL | LoRA sobre SDXL | ~50-300 MiB | no aplica | varía (a menudo CreativeML OpenRAIL-M) | Civitai, Hugging Face |
| LoRAs de la comunidad sobre Flux.1 | LoRA sobre Flux | ~100-500 MiB | no aplica | varía (a menudo no comercial) | Hugging Face, Civitai |

No se dispone de datos de rendimiento comparables para este LoRA concreto, por lo que la comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican rango, capas objetivo, dataset ni hiperparámetros, lo que impide reproducir el entrenamiento o auditar su comportamiento.
- Licencia no disponible: la model card remite a "the original project or upstream license" sin identificarla, lo que impide determinar si el uso comercial está permitido.
- Riesgo de sesgos: el nombre y la descripción apuntan a una estética y temática muy concretas (retratos femeninos sexualizados), lo que puede amplificar estereotipos de género y de apariencia en las salidas.
- Riesgo de alucinación visual y artefactos: como cualquier LoRA de difusión, puede generar anatomías incorrectas, manos deformes o incoherencias en escenas complejas, especialmente fuera del dominio de entrenamiento.
- Dependencia del modelo base: el comportamiento final depende del checkpoint exacto de krea2 sobre el que se entrene; no se documenta cuál es.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de calidad reportada por terceros.
- Fecha de creación futura (2026-11-05): conviene verificar la integridad del repositorio y la identidad del autor antes de usarlo en producción.
- Posible contenido no apto para todos los públicos según la estética entrenada; revisar políticas de contenido antes de desplegar en productos orientados a audiencias generales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-30-10000-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2081262811581624321
- Página del autor: https://www.runninghub.ai/user-center/2064710712105979905
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
