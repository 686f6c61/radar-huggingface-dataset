# RunningHubAI/rh-krea-2-lora

## Resumen

`rh-krea-2-lora` es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un peso adicional (224 MiB en formato `safetensors`) que se aplica sobre el modelo base Krea-2 para especializarlo en la generación de imágenes con un estilo o personaje concreto. Según la model card, el LoRA está entrenado para representar a Mu Peiling (慕沛灵), un personaje de la obra *A Record of a Mortal's Journey to Immortality*, bajo el alias "Tianyun".

El adaptador está pensado para usarse dentro de ComfyUI, tal y como indican las etiquetas del repositorio (`comfyui`, `lora`, `image-text-to-image`) y la propia documentación del autor, que recomienda combinarlo con un checkpoint y un workflow específicos ("Krea2 Basic Image Generation + SeedVR 4K Upscale"). Se distribuye principalmente a través de la plataforma RunningHub, que ofrece tanto ejecución online como API, y el repositorio de Hugging Face actúa como espejo de los pesos.

La relevancia de esta ficha es limitada en el contexto de modelos de lenguaje: no hay información pública sobre arquitectura, parámetros del modelo base, contexto, idiomas ni benchmarks. Los datos disponibles se reducen a metadatos del repositorio y a la descripción del autor. Cualquier evaluación técnica rigurosa requeriría consultar la documentación del modelo base Krea-2, que no se incluye en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea-2; arquitectura del base no disponible |
| Parámetros totales | no disponible (peso del adaptador: 224 MiB en `safetensors`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | `safetensors` (`Krea-2慕沛灵mupeilin_c1-st6000.safetensors`) |

## Arquitectura y entrenamiento

La información disponible describe el artefacto como un LoRA de edición de imagen ("LoRA (image edit)") afinado a partir de Krea-2 (`Finetuned from: krea2`). No se especifican detalles sobre la arquitectura del modelo base, el número de pasos de entrenamiento, el dataset utilizado, la composición de las imágenes de entrenamiento ni si se emplearon técnicas como regularización, captions automáticos o ajuste de learning rate. El nombre del fichero (`..._c1-st6000`) sugiere un checkpoint en el paso 6000, pero esto es una inferencia a partir del nombre y no un dato confirmado en la documentación.

Tampoco se documenta si el LoRA está entrenado para un personaje concreto, un estilo o una tarea de edición, más allá de la referencia a Mu Peiling y al ecosistema ComfyUI. La ausencia de información sobre el proceso de entrenamiento impide evaluar la calidad, la robustez o la generalización del adaptador.

## Capacidades

- Generación y edición de imágenes texto-a-imagen dentro de pipelines de ComfyUI, según la etiqueta `image-text-to-image`.
- Especialización en un personaje o estilo concreto (Mu Peiling, "Tianyun"), presumiblemente para mantener consistencia visual en las generaciones.
- Integración con el ecosistema RunningHub, que ofrece ejecución online y API.
- Compatibilidad declarada con un workflow específico del autor que combina generación básica con Krea-2 y upscaling con SeedVR a 4K.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos especiales como thinking o visión más allá de la propia generación de imagen.

## Casos de uso

- Generación de ilustraciones consistentes de un personaje: el LoRA permite reproducir a Mu Peiling con rasgos estables en distintas escenas, útil para fan art, cómics o material promocional de la obra original.
- Producción de arte conceptual en estudios pequeños: al integrarse en ComfyUI, se puede encadenar con otros nodos (ControlNet, upscalers) para iterar sobre variaciones de un personaje sin reentrenar.
- Creación de assets para narrativa transmedia: el adaptador facilita mantener la coherencia visual de un personaje a lo largo de múltiples ilustraciones y formatos.
- Flujos de trabajo con upscaling a 4K: combinado con el workflow recomendado (Krea-2 + SeedVR), sirve para generar imágenes finales de alta resolución listas para impresión o publicación.
- Pruebas de concepto en la plataforma RunningHub: al estar disponible vía API, se puede usar para validar pipelines de generación de imagen antes de invertir en infraestructura propia.
- Docencia y demostraciones de LoRA: por su tamaño reducido (224 MiB), es un ejemplo manejable para explicar cómo funciona un adaptador de bajo rango sobre un modelo de difusión en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; depende del modelo base Krea-2 y de la resolución de generación, datos no proporcionados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del adaptador (224 MiB) es reducido, pero el modelo base condiciona los requisitos reales.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub (online y API). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (LoRA de personaje sobre modelos de difusión) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador; la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial queda condicionado a los términos de Krea-2 y de la obra original.
- El LoRA está entrenado para un personaje concreto (Mu Peiling) y probablemente no generaliza bien fuera de ese dominio; su uso para otros sujetos puede degradar la calidad.
- No hay información sobre sesgos, alucinaciones visuales o artefactos específicos del adaptador.
- No se documentan limitaciones de contexto, idioma ni resolución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Dependencia de un workflow y checkpoint concretos recomendados por el autor; usarlo fuera de ese pipeline puede dar resultados distintos a los esperados.
- La fecha de creación (2026-10-17) y actualización (2026-11-05) son posteriores a la fecha habitual de referencia, lo que conviene verificar antes de citar el recurso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-krea-2-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2082946336269656065
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/1995203818893860865
- Workflow (URL internacional): https://www.RunningHub.ai/zh-cn/post/2082514651623038977/?inviteCode=rh-v1647
- Workflow (URL China): https://www.RunningHub.cn/post/2082094625946431490/?inviteCode=cn-v1017
- RunningHub API (internacional): https://www.runninghub.ai/call-api
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- RunningHub principal: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
