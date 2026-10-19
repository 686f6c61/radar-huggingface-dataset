# RunningHubAI/rh-ua-light-c-lora

## Resumen

`rh-ua-light-c-lora` es un adaptador LoRA para edición de imágenes publicado por RunningHubAI, con autoría de @UpAgainUI en RunningHub. No es un modelo completo: se aplica sobre Flux1-Kontext y su función declarada es la reiluminación de fotografías ("Relight photo"), dentro de un pipeline image-text-to-image. El repositorio contiene un único archivo safetensors de 292 MiB y está etiquetado para ComfyUI.

El adaptador aborda un caso concreto de posproducción: modificar la iluminación de una fotografía sin repetir la captura, manteniendo la composición y el contenido. Su interés práctico está en que es ligero, se distribuye en formato estándar y se puede cargar en flujos de ComfyUI o en la plataforma RunningHub. Sin embargo, la documentación pública es mínima: no se detallan rango de la LoRA, dataset, resolución de entrenamiento ni licencia.

Su relevancia actual para producción es limitada porque no hay benchmarks, no se especifican los requisitos de hardware del modelo base y el repositorio no tiene descargas ni valoraciones. Es útil como experimento o como pieza dentro de un flujo de edición, pero exige validación propia antes de integrarlo en un producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Flux1-Kontext (pipeline image-text-to-image) |
| Parámetros totales | no disponible; el archivo de pesos LoRA ocupa 292 MiB |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; es un modelo de imagen y no se documenta una ventana de contexto textual |
| Tipos de cuantización | no disponible; no se distribuyen variantes cuantizadas del adaptador y la precisión depende del modelo base |
| Idiomas soportados | no disponible; no se especifica el idioma de los prompts |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`UA LIGHT C.safetensors`, 292 MiB) |
| Modelo base | Flux1-Kontext |
| Tipo de adaptador | LoRA para edición de imagen y reiluminación |
| Tamaño del repositorio | 0,3 GB |
| Plataformas documentadas | ComfyUI, RunningHub y Hugging Face |
| Descargas en Hugging Face | 0 en el momento de la consulta |
| Likes en Hugging Face | 0 en el momento de la consulta |
| Fecha de publicación | 2026-10-19 según metadatos |

## Arquitectura y entrenamiento

La model card indica únicamente que el adaptador se ha ajustado a partir de Flux1-Kontext y que su finalidad es la reiluminación de fotografías. No se especifican el rango de la LoRA, las capas objetivo, la resolución de entrenamiento, el número de pasos ni el tamaño del dataset. Tampoco se documenta si se aplicaron técnicas de regularización, aumento de datos o ajuste fino con pares de imágenes antes y después.

El entrenamiento se anuncia en la plataforma RunningHub, pero no hay información sobre la composición de los datos, el número de tokens o imágenes utilizadas, ni sobre un posible entrenamiento con RLHF o DPO. La innovación práctica es la especialización en una tarea de iluminación con un archivo pequeño, lo que facilita su distribución y su uso como adaptador dentro de ComfyUI. No se documentan técnicas como decodificación especulativa, atención lineal o control físico explícito de la luz.

## Capacidades

- Reiluminación de fotografías: modifica la iluminación de una imagen de entrada a partir de una indicación textual y del contexto visual.
- Edición image-text-to-image: acepta imagen y texto como condiciones, de acuerdo con el pipeline declarado.
- Integración en ComfyUI y RunningHub: el archivo safetensors se carga como LoRA sobre el modelo base Flux1-Kontext.
- No se documenta soporte de tool calling, function calling ni uso como agente autónomo.
- No se documenta generación de texto, razonamiento, código ni matemáticas.
- No se documenta soporte multilingüe; el idioma de los prompts no se especifica.
- No se documenta modo thinking, audio, vídeo ni control explícito de parámetros como temperatura de color, intensidad o dirección de la luz.
- El control efectivo depende del prompt y del flujo de ComfyUI; no hay una interfaz documentada de parámetros físicos de iluminación.

## Casos de uso

- Reiluminación de retratos para estudio: se carga la LoRA sobre Flux1-Kontext en ComfyUI y se introduce la fotografía junto con un prompt que describa la fuente de luz; permite probar esquemas de iluminación sin repetir la sesión.
- Fotografía de producto y comercio electrónico: se generan variantes de una misma imagen con luz suave, lateral o de estudio para un catálogo; el adaptador es adecuado por su tamaño reducido y su integración en un flujo de edición, aunque requiere revisión humana de reflejos y sombras.
- Inmobiliaria y arquitectura: se adaptan fotografías de interiores para simular luz natural o iluminación artificial; resulta útil para presentaciones comerciales, pero no sustituye una sesión fotográfica profesional.
- Previsualización en cine, publicidad y VFX: se generan referencias de iluminación para dirección de fotografía antes de un rodaje; el bajo peso del archivo facilita iteraciones rápidas, aunque no hay métricas de fidelidad publicadas.
- Diseño de producto y materiales: se evalúa cómo cambia la percepción de un objeto bajo distintas condiciones de luz; el modelo sirve como herramienta exploratoria dentro de un flujo de ComfyUI.
- Contenido editorial y redes sociales: se adapta una misma fotografía a estéticas de iluminación distintas para campañas; es necesario validar los resultados por posibles artefactos y por la falta de licencia clara.
- Aumento de datos para visión por computador: se generan variantes de iluminación de un objeto para entrenar modelos de detección o segmentación; antes de usarlo en producción hay que comprobar la licencia y la calidad de las muestras.
- Mejora de fotografías con luz plana: se aplica sobre imágenes de archivo para darles mayor contraste y dirección de luz; no es un modelo de restauración, por lo que no corrige necesariamente ruido, desenfoque o baja resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad de imagen como FID, CLIP score o SSIM, ni evaluaciones humanas o comparaciones con otros adaptadores de reiluminación. La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 292 MiB, pero el consumo total depende de Flux1-Kontext, cuyos requisitos no se incluyen en la información proporcionada.
- GPU recomendadas: no disponible.
- ¿Cabe en una GPU de consumo? No se puede confirmar con los datos disponibles, ya que el modelo base determina la mayor parte del consumo de memoria.
- Despliegue documentado: ComfyUI para cargar la LoRA y RunningHub como plataforma en la nube. Hugging Face se utiliza para descargar los pesos.
- No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni TensorRT.
- Latencia y throughput: no disponibles.
- Almacenamiento: 0,3 GB para el repositorio, más el tamaño del modelo base.
- No hay variantes GGUF, FP8 ni cuantizaciones publicadas del adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-ua-light-c-lora | LoRA de reiluminación | Flux1-Kontext | no disponible (292 MiB) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| Flux1-Kontext | modelo image-text-to-image | no aplica | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información |
| Otras LoRA de reiluminación | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado alternativas concretas con especificaciones verificables en la información proporcionada. No existen benchmarks comparativos, por lo que la comparación se limita al tipo de adaptador, el modelo base y la disponibilidad.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream; antes de un uso comercial hay que verificar la licencia de Flux1-Kontext y la del propio adaptador.
- Ausencia de benchmarks: no hay métricas de calidad, evaluaciones humanas ni comparaciones que permitan estimar su rendimiento frente a otras soluciones de reiluminación.
- Documentación insuficiente: no se detallan rango de la LoRA, capas adaptadas, dataset, resolución ni proceso de entrenamiento.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma y requiere Flux1-Kontext; no se documenta compatibilidad con otras variantes o versiones.
- Riesgo de artefactos: puede introducir sombras inconsistentes, reflejos irreales o cambios de contraste; no se han publicado evaluaciones de fidelidad.
- Posible alteración de la identidad: en retratos, la reiluminación puede modificar rasgos, tono de piel o textura; es recomendable revisar cada resultado.
- Sesgos desconocidos: no se especifica la composición del dataset de entrenamiento, por lo que no se puede evaluar el comportamiento con distintos tonos de piel, tipos de piel o condiciones de luz.
- Uso dual: la edición de iluminación en imágenes de personas puede emplearse para deepfakes o suplantación; no se documentan salvaguardas, filtros de contenido ni mecanismos de consentimiento.
- Idioma no confirmado: no se especifica si los prompts deben estar en inglés, chino u otro idioma.
- Sin validación comunitaria: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no aporta evidencia sobre su calidad o estabilidad.
- No apto para tareas de texto: no es un modelo de lenguaje y no ofrece generación de texto, razonamiento, código, tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-ua-light-c-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-ua-light-c-lora/blob/main/README_cn.md
- Página original del modelo en RunningHub: https://www.runninghub.ai/model/public/1964747456531546113
- Página del autor: https://www.runninghub.ai/user-center/1935334486756470786
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API en inglés: https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API en chino: https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de API de RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
