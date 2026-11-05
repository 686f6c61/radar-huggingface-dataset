# RunningHubAI/rh-xb-v1.0-lora

## Resumen

rh-xb-v1.0-lora es un adaptador LoRA para edición de imágenes (pipeline `image-text-to-image`) publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un fichero de pesos de 218 MiB (`xb_krea2.safetensors`) que se aplica sobre un modelo base identificado en la model card como "krea2". Su propósito es modificar el comportamiento del modelo base para un estilo o tarea concreta de edición de imagen, presumiblemente asociada al concepto "xiaobei" que aparece en la descripción.

El repositorio es fundamentalmente una pieza de distribución dentro del ecosistema de RunningHub, una plataforma comercial de generación y edición de imágenes con flujo ComfyUI. La model card es mínima: no documenta dataset de entrenamiento, hiperparámetros, resolución nativa, número de pasos de entrenamiento ni métricas de evaluación. Tampoco se especifica la licencia del adaptador ni del modelo base, más allá de una nota genérica que remite a la licencia del proyecto original.

Por su naturaleza (LoRA de edición de imagen), su relevancia para desarrolladores e investigadores es acotada: interesa a quien ya trabaje con el modelo base krea2 en ComfyUI y quiera incorporar este estilo concreto. No aporta capacidades de razonamiento, código, matemáticas ni texto, por lo que las secciones de esta ficha referidas a esas capacidades se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusión "krea2"; arquitectura del base no disponible |
| Parámetros totales | no disponible (pesos LoRA de 218 MiB en safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el pipeline es image-text-to-image; idioma de los prompts no especificado) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`xb_krea2.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, técnica que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en determinadas capas, reduciendo drásticamente el coste de ajuste fino. El modelo base declarado es "krea2", del cual no se aporta información en el repositorio: ni tipo de backbone (UNet, DiT, transformer híbrido), ni resolución de entrenamiento, ni número de parámetros. El pipeline declarado, `image-text-to-image`, indica que el adaptador opera en tareas de edición de imagen guiada por texto, es decir, recibe una imagen de entrada más una instrucción textual y produce una imagen modificada.

No se documentan datos de entrenamiento: ni volumen de pares imagen-texto, ni composición del dataset, ni si hubo ajuste por preferencias (RLHF/DPO). Tampoco se indica el rango del LoRA, el alpha, la tasa de aprendizaje ni el número de pasos. La única referencia técnica concreta es el nombre del fichero (`xb_krea2`), que sugiere una asociación con el concepto "xiaobei" mencionado en la descripción. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, destilación de pasos) sería especulativa y no se incluye.

## Capacidades

- Edición de imágenes guiada por texto sobre el modelo base krea2, mediante carga del adaptador LoRA en ComfyUI o en la plataforma RunningHub.
- Aplicación de un estilo o concepto concreto ("xiaobei") definido por el autor del adaptador; el alcance exacto del estilo no está documentado.
- Integración en flujos ComfyUI: el tag `comfyui` indica compatibilidad con el nodo de carga de LoRA de ese ecosistema.
- Generación de texto: no disponible (no es un modelo de lenguaje).
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión como entrada multimodal de lenguaje, audio): no disponible.

## Casos de uso

- Edición de imagen por instrucción en ComfyUI: cargar `xb_krea2.safetensors` como nodo LoRA sobre el modelo base krea2 y aplicar el estilo "xiaobei" a imágenes de entrada mediante prompts de edición; adecuado para usuarios que ya tienen montado el pipeline base.
- Producción de variaciones de estilo en un estudio de diseño: usar el adaptador para homogeneizar el aspecto visual de un lote de imágenes (por ejemplo, material de marca) sin reentrenar el modelo base.
- Prototipado rápido en RunningHub: ejecutar el adaptador en la plataforma del autor para evaluar el estilo antes de integrarlo en un flujo propio, evitando configurar infraestructura local.
- Automatización vía API de RunningHub: encadenar la edición de imágenes en un pipeline de backend usando el endpoint documentado por la plataforma, útil para generar assets bajo demanda.
- Experimentación académica con LoRA de edición: estudiar cómo un adaptador de bajo rango modifica el comportamiento de un modelo de difusión en tareas image-text-to-image, comparando resultados con y sin el adaptador.
- Personalización de catálogos o contenido editorial: aplicar el estilo a imágenes de producto o ilustraciones para una línea visual concreta, sujeto a la licencia del modelo base (no disponible, por lo que requiere verificación previa).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base krea2, cuyos requisitos no se documentan en el repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del LoRA (218 MiB) es irrelevante frente a los requisitos del modelo base.
- Opciones de despliegue: ComfyUI (tag declarado), plataforma RunningHub (local e internacional) y API de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica adaptadores LoRA comparables ni permite establecer una comparación fiable de parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta dataset, hiperparámetros ni evaluación; no es posible estimar la calidad o fidelidad del estilo sin probarlo empíricamente.
- Licencia no disponible: la card remite a "la licencia del proyecto original" sin especificarla. El uso comercial requiere verificar la licencia de krea2 y del propio adaptador antes de desplegarlo.
- Dependencia total del modelo base krea2: el adaptador no funciona de forma autónoma y su comportamiento cambia si el base se actualiza o sustituye.
- Riesgo de sobreajuste al concepto "xiaobei" no cuantificado; puede degradar la fidelidad de la imagen de entrada en ediciones que no encajen con ese estilo.
- Sin información sobre sesgos: al ser un modelo de imagen, puede reproducir sesgos visuales o culturales del dataset de entrenamiento del base, no documentados.
- Sin datos de idioma: se desconoce si los prompts de edición funcionan igual en castellano, inglés u otros idiomas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ausencia de validación comunitaria.
- Fechas de creación y actualización (2026-11-05) registradas en el repositorio; conviene comprobar si hay versiones posteriores.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-xb-v1.0-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2088084941744689154
- Página del autor: https://www.runninghub.ai/user-center/2066883782916788226
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-xb-v1.0-lora/blob/main/README_cn.md
