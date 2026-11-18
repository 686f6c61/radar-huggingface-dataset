# RunningHubAI/rh-lb3-2500-lora

## Resumen

rh-lb3-2500-lora es un adaptador LoRA para edición de imágenes (image edit) publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de pesos de bajo rango (218 MiB en un único fichero `lb_krea2_000002500.safetensors`) que se aplica sobre un modelo base de difusión identificado en la model card como "krea2". El adaptador está pensado para cargarse en ComfyUI, en la plataforma RunningHub o en cualquier pipeline compatible con LoRA sobre el modelo base correspondiente.

La model card es extremadamente escueta: se limita a indicar el nombre del modelo, su tipo (LoRA de edición de imagen), las plataformas soportadas, el autor (un usuario de RunningHub) y el origen del fine-tuning. El nombre "Boss 3.0 2500 steps" sugiere un entrenamiento de 2500 pasos sobre un checkpoint concreto, pero no se documentan hiperparámetros, dataset, resolución de entrenamiento ni metodología.

Su relevancia es limitada y muy específica: sirve como ejemplo de adaptador LoRA distribuido a través de la infraestructura de RunningHub para flujos de trabajo de ComfyUI. No hay información pública sobre licencia efectiva, idiomas, benchmarks ni capacidades más allá de la etiqueta `image-text-to-image`. Cualquier evaluación rigurosa requeriría probar el adaptador contra el modelo base "krea2", cuyos detalles tampoco se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusión "krea2" |
| Parametros totales | no disponible (pesos LoRA de 218 MiB; no se indica rango ni número de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el pipeline es image-text-to-image; el prompt admite texto, idioma no especificado) |
| Licencia | no disponible (la model card remite a "la licencia del proyecto original o upstream") |
| Formato de pesos | safetensors (`lb_krea2_000002500.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. La model card indica que el fine-tuning parte de "krea2" y que el resultado se ha obtenido tras 2500 pasos ("Boss 3.0 2500 steps"), pero no se detalla el rango del LoRA, la tasa de aprendizaje, el tamaño de batch, la resolución de entrenamiento, el dataset ni si se emplearon técnicas como regularización o captions automáticos.

No se documenta ninguna innovación técnica adicional: ni decodificación especulativa, ni atención lineal, ni variantes de arquitectura. Tampoco se especifica qué componentes del modelo base se adaptan (atención, cross-attention, MLP) ni si el adaptador está pensado para edición de imagen guiada por texto e imagen de entrada, aunque la etiqueta `image-text-to-image` y la descripción "LoRA (image edit)" apuntan a ese uso.

## Capacidades

- Edición de imágenes guiada por texto e imagen de entrada, según la etiqueta `image-text-to-image` y la descripción "LoRA (image edit)".
- Aplicación sobre el modelo base "krea2" mediante carga de LoRA en ComfyUI o en la plataforma RunningHub.
- Integración en flujos de trabajo de ComfyUI (nodos de carga de LoRA y muestreo).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni modo thinking.
- No se documentan capacidades multilingües ni idiomas concretos para los prompts.
- No se documenta soporte de audio, vídeo ni otras modalidades.

## Casos de uso

- Edición de imágenes en ComfyUI: cargar `lb_krea2_000002500.safetensors` como nodo LoRA sobre el modelo base "krea2" y aplicar prompts de edición sobre una imagen de entrada; es adecuado porque el artefacto está empaquetado precisamente para ese flujo.
- Prototipado rápido en RunningHub: usar el modelo público original en la plataforma para probar el adaptador sin montar infraestructura local, ya que la model card enlaza directamente al modelo en RunningHub.
- Experimentación con estilos o transformaciones concretas: al ser un LoRA de 2500 pasos, puede emplearse para probar si el ajuste captura una estética o transformación específica sobre el modelo base.
- Integración en pipelines de edición por lotes: mediante la API de RunningHub, invocar el modelo para procesar conjuntos de imágenes con instrucciones de texto, siempre que se valide antes la calidad del adaptador.
- Comparación de adaptadores LoRA: usar este checkpoint como referencia frente a otros LoRA entrenados sobre "krea2" para evaluar el efecto de 2500 pasos de fine-tuning.
- Docencia y demostraciones de fine-tuning: sirve como ejemplo de artefacto LoRA pequeño (218 MiB) para explicar cómo se distribuyen y cargan adaptadores en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente del modelo base "krea2", cuyos requisitos no se documentan; el LoRA en sí ocupa 218 MiB en disco.
- GPU recomendadas: no disponible. Al ser un adaptador de difusión, los requisitos vendrán marcados por el modelo base y la resolución de generación.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el modelo base.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub (modelo público enlazado) y API de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información extremadamente escasa: la model card no documenta dataset, hiperparámetros, resolución ni metodología de entrenamiento, lo que impide evaluar su calidad de forma objetiva.
- Licencia ambigua: se remite a "la licencia del proyecto original o upstream", sin especificar cuál es; no se puede confirmar el uso comercial sin verificar la licencia de "krea2" y del autor.
- Dependencia total del modelo base: el adaptador solo funciona junto con "krea2"; sin ese checkpoint los pesos son inútiles.
- Sin datos de benchmarks ni evaluaciones cualitativas: no hay evidencia publicada de que el adaptador mejore o degrade el modelo base.
- Riesgo de sesgos y alucinaciones visuales: no evaluado; al ser un modelo de difusión, puede reproducir sesgos del dataset de entrenamiento y generar contenido inexacto o no solicitado.
- Idiomas de prompt no especificados: no se puede garantizar un comportamiento correcto con prompts en castellano u otros idiomas.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.
- Fecha de creación y actualización en 2026-11-18: verificar que el repositorio sigue disponible y que el modelo base "krea2" es accesible antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-lb3-2500-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2094963125773979650
- Página del autor: https://www.runninghub.ai/user-center/2066883782916788226
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-lb3-2500-lora/blob/main/README_cn.md
