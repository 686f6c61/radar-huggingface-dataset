# Jole66666/Qwen-Image-Edit-2509

## Resumen

Qwen-Image-Edit-2509 es un modelo de difusión para edición de imágenes (pipeline image-to-image) publicado por el equipo Qwen de Alibaba en septiembre de 2025 como iteración mensual de Qwen-Image-Edit (agosto de 2025). El repositorio analizado aquí, `Jole66666/Qwen-Image-Edit-2509`, es una réplica del modelo oficial `Qwen/Qwen-Image-Edit-2509` subida por un usuario tercero, con licencia Apache 2.0 y pesos en formato safetensors listos para la librería diffusers.

El modelo resuelve dos problemas concretos de la edición de imágenes generativa. El primero es la edición multi-imagen: frente a la versión de agosto, incorpora entrenamiento mediante concatenación de imágenes que permite combinar entradas del tipo "persona + persona", "persona + producto" y "persona + escena", con un rendimiento óptimo declarado con entre 1 y 3 imágenes de entrada. El segundo es la consistencia de la edición en imagen única, con mejoras específicas en la preservación de la identidad facial, la identidad de producto y la edición de texto (contenido, tipografía, color y material).

Su relevancia actual radica en que añade soporte nativo para ControlNet (mapas de profundidad, bordes, keypoints, entre otros) dentro del propio modelo, algo que en otros sistemas de edición se resuelve con adaptadores externos. Con 20.430.401.088 parámetros (~20,4 mil millones) y un tamaño de repositorio de 57,7 GB, es un modelo de gran tamaño orientado a GPU de datacenter o a despliegues con cuantización agresiva. El repositorio concreto analizado no registra descargas ni interacciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imagen (image-to-image) construido sobre la arquitectura de Qwen-Image; el detalle interno no se especifica en la model card analizada. Se ejecuta con `QwenImageEditPlusPipeline` de diffusers |
| Parametros totales | 20.430.401.088 (~20,4 mil millones), según los pesos safetensors del repositorio |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible. Es un modelo de difusión; no se documenta una ventana de contexto de tokens en la información proporcionada |
| Tipos de cuantizacion | No disponible en la información proporcionada. Los pesos del repositorio se distribuyen en safetensors (se usa bfloat16 en el ejemplo de código de la model card) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería diffusers) |

## Arquitectura y entrenamiento

La información disponible describe el modelo como la iteración mensual de Qwen-Image-Edit, apoyada sobre la arquitectura de Qwen-Image. La innovación de entrenamiento declarada es el uso de concatenación de imágenes para habilitar la edición multi-imagen, lo que permite al modelo recibir varias imágenes de referencia y combinarlas en una única salida ("persona + persona", "persona + producto", "persona + escena"). El rendimiento óptimo se obtiene con 1 a 3 imágenes de entrada. No se detallan en la model card analizada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

En el plano de la inferencia, el modelo incorpora soporte nativo de ControlNet (mapas de profundidad, mapas de bordes, mapas de keypoints), lo que permite condicionar la edición por estructura además de por prompt. En imagen única se documentan mejoras de consistencia en tres ejes: preservación de identidad facial con soporte de distintos estilos de retrato y cambios de pose, preservación de identidad de producto para pósteres publicitarios, y edición de texto que va más allá del contenido e incluye fuente, color y material. El informe técnico de referencia es arXiv:2508.02324, aunque los resultados numéricos no se incluyen en la información proporcionada.

## Capacidades

- Edición de imagen guiada por prompt en modo image-to-image.
- Edición multi-imagen con concatenación de entradas: combinaciones de persona + persona, persona + producto y persona + escena; funcionamiento óptimo con 1 a 3 imágenes.
- Preservación de identidad facial en cambios de pose y generación de distintos estilos de retrato.
- Preservación de identidad de producto, orientada a edición de pósteres publicitarios.
- Edición de texto dentro de la imagen: contenido, tipografía, color y material.
- Soporte nativo de ControlNet: mapas de profundidad, mapas de bordes, mapas de keypoints y otros.
- Control de generación mediante prompt positivo, prompt negativo, `true_cfg_scale`, `guidance_scale` y número de pasos de inferencia.
- Generación de varias imágenes por prompt (`num_images_per_prompt`) y control de semilla para reproducibilidad.
- Idiomas de prompt documentados: inglés y chino.
- No se documenta en la información disponible soporte de tool calling, uso como agente ni modo de razonamiento explícito, ya que no es un modelo de lenguaje.

## Casos de uso

- Edición publicitaria de producto: a partir de una foto del producto y una imagen de escena, el modelo permite insertar el artículo manteniendo su identidad visual, lo que resulta adecuado para generar variantes de póster sin repetir sesiones fotográficas.
- Retoque de retratos con preservación de identidad: cambio de pose, estilo o vestuario conservando los rasgos faciales, útil para estudios fotográficos que necesitan variaciones de una misma sesión.
- Composición multi-persona: creación de escenas con dos o tres sujetos a partir de fotografías separadas ("persona + persona"), empleando el modo de concatenación de imágenes con 1 a 3 entradas.
- Localización de creatividades con texto: sustitución de titulares, cambio de tipografía, color o material del texto en un cartel ya diseñado, aprovechando la edición tipográfica nativa.
- Integración de personajes en escenarios: combinación de "persona + escena" para previsualizar cómo quedaría un sujeto en un entorno concreto antes de rodar o producir la escena final.
- Control estructural de la edición: uso de mapas de keypoints o de profundidad como ControlNet nativo para forzar una pose o una composición determinada manteniendo el resto de la imagen.
- Generación de variantes controladas en producción de contenido: el pipeline permite iterar con semilla fija, prompt negativo y escala de guiado, lo que facilita reproducir resultados y comparar versiones en un flujo de aprobación.
- Prototipado de material gráfico para comercio electrónico: edición de fotografías de catálogo con preservación de producto para adaptarlas a distintos formatos y campañas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card analizada describe mejoras cualitativas frente a Qwen-Image-Edit (agosto de 2025) en consistencia de persona, producto y texto, y en soporte multi-imagen, pero no incluye tablas numéricas. El informe técnico citado (arXiv:2508.02324) no aporta cifras en la información proporcionada.

## Requisitos de hardware

- Peso de los pesos en bfloat16: aproximadamente 40,9 GB solo para los 20,43 mil millones de parámetros del transformador, calculado a partir del recuento de parámetros. El repositorio completo ocupa 57,7 GB, ya que incluye además el resto de componentes del pipeline.
- VRAM estimada para inferencia: no confirmada por el autor. Como referencia derivada del tamaño, un despliegue en bfloat16 con todos los componentes en memoria requiere del orden de 60-80 GB de VRAM; con cuantización a 8 bits bajaría aproximadamente a 30-40 GB y a 4 bits a unos 20-25 GB, siempre como estimación orientativa.
- GPU recomendadas: A100 80 GB y H100 80 GB para ejecución en bfloat16 sin cuantizar. En GPUs de consumo, una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no permiten cargar el pipeline completo en bfloat16 y exigirían cuantización y gestión de memoria por etapas.
- Opciones de despliegue: diffusers es la vía documentada, mediante `QwenImageEditPlusPipeline` con `from_pretrained` y `torch_dtype=torch.bfloat16`. Otras opciones de despliegue no se detallan en la información proporcionada; las herramientas orientadas a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. El ejemplo de la model card usa 40 pasos de inferencia, `guidance_scale` de 1.0 y `true_cfg_scale` de 4.0, pero no se publican tiempos de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Edicion multi-imagen | ControlNet nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-Edit-2509 (esta ficha) | 20.430.401.088 | Sí, 1 a 3 imágenes | Sí (profundidad, bordes, keypoints) | Apache 2.0 | HuggingFace y ModelScope |
| Qwen-Image-Edit (agosto de 2025) | No disponible | No documentado | No documentado | No disponible en la información proporcionada | HuggingFace y ModelScope |
| Qwen-Image (modelo base de generación de imagen) | No disponible | No aplica (texto a imagen) | No documentado | No disponible en la información proporcionada | HuggingFace y ModelScope |

No se dispone en la información proporcionada de datos comparativos con otras familias de modelos de edición de imagen.

## Limitaciones y advertencias

- El repositorio analizado (`Jole66666/Qwen-Image-Edit-2509`) no pertenece a la organización oficial Qwen; conviene verificar la integridad de los pesos y, en su caso, usar el repositorio oficial `Qwen/Qwen-Image-Edit-2509`.
- El repositorio registra 0 descargas y 0 interacciones, por lo que no hay evidencia comunitaria de funcionamiento correcto de esta copia concreta.
- El rendimiento multi-imagen solo se declara óptimo con 1 a 3 imágenes de entrada; no se documenta el comportamiento con más entradas.
- Los idiomas soportados son inglés y chino. El comportamiento con prompts en castellano no está documentado y podría degradar la calidad de la edición.
- No se publican métricas objetivas de fidelidad de edición, preservación de identidad ni tasas de error, por lo que las mejoras descritas son cualitativas y basadas en ejemplos del autor.
- Riesgo de modificación no solicitada de zonas de la imagen ajenas a la edición pedida y de artefactos en texto, manos o rostros, habitual en modelos de difusión; se recomienda revisión humana antes de publicar.
- Riesgo de sesgos en la generación de rostros y cuerpos heredados de los datos de entrenamiento, que no se detallan en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si los datos de entrenamiento imponen restricciones adicionales.
- El coste de hardware es elevado: en bfloat16 no cabe en GPUs de consumo sin cuantización, lo que condiciona su uso en producción.
- El modelo no es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Las fechas del repositorio (creación el 10 de septiembre de 2026) resultan anómalas respecto a la cronología declarada del modelo y deben tratarse con cautela.

## Enlaces

- Ficha de HuggingFace analizada: https://huggingface.co/Jole66666/Qwen-Image-Edit-2509
- Modelo oficial en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Modelo oficial en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2509
- Informe técnico (PDF): https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- Artículo en arXiv: https://arxiv.org/abs/2508.02324
- Blog de presentación: https://qwenlm.github.io/blog/qwen-image-edit/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image
- Qwen Chat: https://chat.qwen.ai/
- Discord: https://discord.gg/CV4E9rpNSD
