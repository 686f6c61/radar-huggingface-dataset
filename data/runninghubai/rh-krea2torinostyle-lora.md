# RunningHubAI/rh-krea2torinostyle-lora

## Resumen

`rh-krea2torinostyle-lora` es un adaptador LoRA para edición de imágenes publicado por RunningHubAI, un servicio en la nube especializado en flujos de trabajo de ComfyUI. El modelo se ha afinado a partir de la base `krea2` y se distribuye como un único fichero de pesos de 224 MiB (`Krea2torino_c1-st8000.safetensors`), pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face.

El adaptador aplica un estilo visual concreto, denominado "TorinoStyle", sobre el pipeline de image-to-image. No se trata de un modelo de lenguaje ni de un transformer de gran escala, sino de una capa de bajo rango que modifica el comportamiento de un modelo de difusión subyacente. La información pública disponible es muy limitada: la model card no incluye detalles sobre el dataset de entrenamiento, el número de pasos, el rango de la LoRA ni las condiciones de licencia.

Su relevancia es acotada: resulta útil para quienes trabajan con la base `krea2` en ComfyUI y quieren reproducir un estilo visual específico sin reentrenar. Para el resto de casos, la ausencia de documentación técnica y de benchmarks hace que su evaluación rigurosa no sea posible con los datos actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (fichero de pesos de 224 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors (presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible (los prompts dependen del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`Krea2torino_c1-st8000.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es una LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base `krea2` para modificar su comportamiento generativo sin alterar los pesos originales. El nombre del fichero (`c1-st8000`) sugiere 8000 pasos de entrenamiento, aunque este dato no está confirmado en la documentación. No se especifica el rango de la LoRA, el optimizador, la tasa de aprendizaje, el tamaño del dataset ni la composición de las imágenes de entrenamiento.

No hay información sobre si se aplicaron técnicas adicionales como regularización, dropout o balanceo de conceptos. Tampoco se documenta el pipeline exacto de inferencia (sampler, scheduler, CFG, resolución nativa) ni las versiones de ComfyUI compatibles. La model card se limita a indicar que el modelo se afina a partir de `krea2` y que se puede cargar en RunningHub.

## Capacidades

- Edición de imágenes guiada por texto (image-text-to-image) mediante el pipeline de ComfyUI.
- Aplicación de un estilo visual concreto ("TorinoStyle") sobre imágenes de entrada.
- Integración con flujos de trabajo de ComfyUI y con la plataforma RunningHub.
- Carga directa desde Hugging Face como adaptador LoRA sobre la base `krea2`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión analítica, audio ni modo de pensamiento.
- No se documentan capacidades multilingües específicas; la cobertura idiomática dependerá del modelo base.

## Casos de uso

- Estilización por lotes en ComfyUI: cargar la LoRA junto con `krea2` y procesar un directorio de imágenes con un nodo de batch para aplicar el estilo de forma consistente en un catálogo visual.
- Prototipado de dirección de arte: generar variaciones estilizadas de un mismo concepto para comparar alternativas antes de fijar una línea gráfica en un proyecto.
- Previsualización de assets para videojuegos o ilustración: aplicar el estilo a bocetos o renders base para evaluar la coherencia visual antes de producir el asset final.
- Edición iterativa en RunningHub: usar la plataforma en la nube para ajustar prompts y fuerza de la LoRA sin necesidad de GPU local, aprovechando la integración nativa del adaptador.
- Generación de material de marketing: transformar fotografías de producto o escenas en imágenes con una estética homogénea para campañas o redes sociales.
- Experimentación académica sobre adaptadores de bajo rango: emplear la LoRA como caso de estudio para analizar cómo un adaptador pequeño (224 MiB) modifica el espacio latente de un modelo de difusión.
- Integración en pipelines de automatización: invocar el modelo a través de la API de RunningHub para incorporar la estilización en un flujo de producción sin gestionar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador por separado; el consumo vendrá determinado por el modelo base `krea2` y la resolución de inferencia.
- GPU recomendadas: no disponibles en la documentación; en la práctica, cualquier GPU capaz de ejecutar `krea2` en ComfyUI (típicamente 8-24 GB de VRAM según resolución y precisión).
- Compatibilidad con GPU de consumo: probable si el modelo base cabe en la GPU, pero no confirmado por el autor.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (nube) y carga directa desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2torinostyle-lora | LoRA sobre `krea2` | no disponible (224 MiB) | no aplica | no disponible | Hugging Face, RunningHub |
| Otras LoRA de estilo para modelos de difusión | LoRA | variable | no aplica | variable según autor | Hugging Face, Civitai |
| Modelo base `krea2` | Modelo de difusión | no disponible | no aplica | no disponible | No confirmado en la información |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas concretas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La licencia no está especificada; la model card remite a la licencia del proyecto original, lo que impide confirmar si el uso comercial está permitido.
- No se documenta el dataset de entrenamiento, por lo que no es posible evaluar sesgos ni cobertura estilística.
- Riesgo de sobreajuste al estilo "TorinoStyle": puede degradar la fidelidad de la imagen de entrada o imponer el estilo incluso cuando no se desea.
- Dependencia total del modelo base `krea2`: sin él, la LoRA no es funcional; cualquier limitación del base (resolución, idiomas de prompt, sesgos) se hereda.
- Ausencia de benchmarks, métricas de calidad y comparativas publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que dificulta la validación por parte de la comunidad.
- No hay información sobre versiones de ComfyUI compatibles ni sobre parámetros recomendados de inferencia (fuerza de la LoRA, CFG, sampler).

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2torinostyle-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2073665853429735426
- Página del autor: https://www.runninghub.cn/user-center/2011770127833632769
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
