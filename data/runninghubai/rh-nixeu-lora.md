# RunningHubAI/rh-nixeu-lora

## Resumen

rh-nixeu-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de pesos de bajo rango (224 MiB en un único archivo `safetensors`) que se aplica sobre un modelo base de generación de imagen para transferir un estilo visual concreto. La model card lo describe como un LoRA de tipo "image edit" afinado a partir de `krea2` y orientado a producir ilustraciones digitales con acabado de "厚涂" (pintura espesa o impasto digital).

El modelo se distribuye principalmente para su uso dentro del ecosistema ComfyUI y de la plataforma RunningHub, que actúa como intermediaria del autor original. La model card indica un peso de recomendación de 0,9 y una palabra de activación (`digital illustration`) que debe incluirse en el prompt para que el estilo se aplique. No se publican detalles sobre el dataset de entrenamiento, el número de pasos, la resolución nativa ni los hiperparámetros utilizados.

La relevancia de esta ficha es limitada en el contexto de evaluación de modelos de IA open source: se trata de un artefacto de estilo para pipelines de difusión, sin información técnica sustancial publicada y con una licencia que remite al proyecto original sin especificarse. Cualquier evaluación rigurosa de su comportamiento requiere probarlo directamente en ComfyUI o en RunningHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusión `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos del adaptador: 224 MiB en `safetensors`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors (presumiblemente fp16/bf16, no confirmado) |
| Idiomas soportados | no disponible (los prompts se interpretan en el modelo base; la model card está en inglés y chino) |
| Licencia | no disponible; la model card remite a "the original project or upstream license" |
| Formato de pesos | safetensors (`nixeu风格-厚涂插画.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención (y posiblemente en las proyecciones lineales) de un modelo de difusión base. La model card identifica el modelo de partida como `krea2`, pero no aporta información sobre la arquitectura de ese base (tipo de U-Net o transformer de difusión, número de parámetros, resolución nativa, tokenizador de texto asociado). Tampoco se detalla el rango del LoRA, el alpha, la tasa de aprendizaje ni el número de pasos de entrenamiento.

No se publica información sobre el dataset: no se indica el número de imágenes, su procedencia, la resolución de entrenamiento, el uso de captions automáticos o manuales, ni si se aplicaron técnicas de regularización. La única indicación funcional es la palabra de activación `digital illustration` y un peso recomendado de 0,9, lo que sugiere un entrenamiento orientado a un estilo de ilustración digital con acabado pictórico. No hay evidencia de RLHF, DPO ni de innovaciones técnicas destacables.

## Capacidades

- Generación y edición de imágenes condicionada por texto, dentro de un pipeline de difusión (image-text-to-image).
- Transferencia de estilo de ilustración digital con acabado de pintura espesa ("厚涂"), activada mediante el prompt `digital illustration`.
- Integración en flujos de ComfyUI como nodo de carga de LoRA sobre el modelo base correspondiente.
- Ajuste de intensidad del efecto mediante el peso del adaptador (valor recomendado: 0,9).
- Edición de imágenes de entrada (image edit) según la etiqueta del pipeline, aunque la model card no detalla el flujo exacto.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un adaptador de imagen, no un modelo de lenguaje.
- Capacidades multilingües de prompt: no disponibles como dato explícito; dependen del codificador de texto del modelo base.

## Casos de uso

- Ilustración editorial y conceptual: aplicar el LoRA sobre el modelo base en ComfyUI para generar ilustraciones con acabado pictórico uniforme, útil para portadas, artículos y material promocional.
- Creación de arte de personajes con estilo consistente: usar `digital illustration` junto con descripciones detalladas para mantener una estética coherente en una serie de ilustraciones.
- Exploración de estilo en preproducción: generar variaciones rápidas de una misma escena ajustando el peso del LoRA entre 0,6 y 1,0 para calibrar la intensidad del efecto.
- Edición de imágenes existentes: emplear el flujo image-text-to-image para reestilizar bocetos o fotografías hacia el look de pintura digital.
- Pruebas de concepto para estudios de arte: comparar el resultado del LoRA frente a otros adaptadores de estilo sobre el mismo base, con el fin de seleccionar una dirección visual.
- Automatización vía API de RunningHub: invocar el modelo a través de la API de la plataforma para integrar la generación estilizada en un pipeline de producción sin gestionar infraestructura propia.
- Docencia y demostraciones de LoRA: usar el adaptador como ejemplo práctico de bajo tamaño (224 MiB) para explicar el funcionamiento de los adaptadores de bajo rango en difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por separado; el consumo vendrá determinado por el modelo base `krea2` y la resolución de generación. El adaptador añade una sobrecarga mínima (224 MiB en disco, del orden de cientos de MiB en VRAM al cargarse).
- GPU recomendadas: no disponibles. Al depender de `krea2`, se aplican los requisitos de ese base, que no se documentan en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende enteramente del modelo base.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (web y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-nixeu-lora | LoRA de estilo sobre `krea2` | 224 MiB (adaptador) | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores LoRA de estilo directamente comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de información técnica: no se documentan dataset, hiperparámetros, rango del LoRA ni arquitectura del base, lo que impide reproducir el entrenamiento o auditar su comportamiento.
- Dependencia del modelo base: el resultado depende críticamente de `krea2`; sin ese base, el adaptador no es funcional. No se especifica la versión exacta ni el repositorio del base.
- Licencia ambigua: la model card remite a "the original project or upstream license" sin especificar cuál es. No se puede confirmar el uso comercial sin verificar la licencia de `krea2` y del autor original.
- Riesgo de sobreajuste al estilo: con un peso recomendado de 0,9, es probable que el LoRA domine el prompt y reduzca la variedad compositiva; conviene probar pesos inferiores.
- Sesgos: no documentados, pero al ser un adaptador de estilo entrenado sobre un conjunto de imágenes no especificado, puede heredar sesgos estéticos y de representación del dataset original.
- Alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y detalles incoherentes, especialmente en resoluciones altas o composiciones complejas.
- Idioma: la palabra de activación está en inglés; no se documenta el comportamiento con prompts en castellano.
- Sin métricas de calidad: no hay FID, CLIP score ni evaluaciones humanas publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-nixeu-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2077565256364281858
- Página del autor: https://www.runninghub.cn/user-center/1952137343866200066
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-nixeu-lora/blob/main/README_cn.md
