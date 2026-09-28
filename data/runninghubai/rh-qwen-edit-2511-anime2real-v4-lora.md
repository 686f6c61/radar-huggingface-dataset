# RunningHubAI/rh-qwen-edit-2511-anime2real-v4-lora

## Resumen

rh-qwen-edit-2511-anime2real-v4-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI (autoría de @NINE.JIUGE) en el que se ha ajustado el modelo base Qwen-Edit-2511 para una tarea concreta: convertir imágenes de estilo anime en imágenes de aspecto realista (anime2real). El repositorio contiene un único fichero de pesos en formato safetensors de 900 MiB, pensado para cargarse en flujos de ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face. El pipeline declarado es image-text-to-image, es decir, edición de una imagen de entrada guiada por instrucciones de texto.

Su relevancia es práctica más que arquitectónica: los LoRA permiten especializar un modelo de edición de imagen grande en un dominio concreto (en este caso, el paso anime→realista) sin reentrenar los pesos completos, reduciendo coste de almacenamiento y de despliegue. Frente a otros adaptadores de la misma familia, la diferencia es el dominio objetivo y no el tamaño.

La información publicada es mínima: no se documentan parámetros del modelo base, rango o alpha del LoRA, composición del dataset, licencia explícita, idiomas soportados ni resultados de benchmarks. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Qwen-Edit-2511; la model card no detalla la arquitectura interna del modelo base |
| Parámetros totales | no disponible (el repositorio solo distribuye el adaptador, de 900 MiB; no incluye los pesos del modelo base) |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de edición de imagen; la model card no especifica ventana de contexto textual) |
| Tipos de cuantización | no disponible; los pesos se distribuyen sin cuantizar documentada, en safetensors |
| Idiomas soportados | no disponible (los ejemplos e interfaz del autor aparecen en chino e inglés, sin especificación oficial) |
| Licencia | no disponible; la model card indica únicamente que los derechos pertenecen al autor y que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (fichero único: 动漫转真人Qwen-Edit-2511-Anime2real_V4.safetensors, 900 MiB) |
| Tarea declarada | image-text-to-image (edición de imagen guiada por texto) |
| Plataformas de uso | ComfyUI, RunningHub (nube), Hugging Face |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La model card es explícita en un solo punto técnico: el adaptador se ha afinado a partir de Qwen-Edit-2511. No se publica información sobre el número de tokens o de imágenes de entrenamiento, la composición del dataset, la resolución de entrenamiento, el rango (rank) y el alpha del LoRA, la tasa de aprendizaje, el número de pasos ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se indica si el ajuste se realizó sobre atención únicamente o sobre todos los módulos lineales del transformer, dato que condiciona el tamaño y el comportamiento del adaptador.

Por el nombre del fichero y del repositorio, la especialización es la conversión de ilustración anime a imagen de aspecto fotográfico, una tarea de traducción de dominio que normalmente exige preservar identidad, pose y composición del original mientras se sustituye el estilo de renderizado. La nomenclatura "2511" del modelo base apunta a una versión de noviembre de 2025 de la familia de edición de imagen de Qwen, pero la model card no lo confirma de forma explícita, por lo que este punto debe tratarse como no verificado. El entrenamiento se realizó, según el autor, en la plataforma RunningHub.

## Capacidades

- Edición de imagen guiada por texto: recibe una imagen de entrada e instrucciones textuales, y devuelve una imagen modificada (pipeline image-text-to-image).
- Conversión de estilo anime a realista: es la función principal declarada por el autor (Anime to Real, versión V4 del adaptador).
- Preservación esperada de la estructura de la imagen de origen (pose, encuadre, composición), aunque la model card no documenta métricas de fidelidad.
- Integración en flujos de ComfyUI como nodo LoRA sobre el modelo base.
- Ejecución en la nube mediante RunningHub y su API.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No hay información sobre capacidades multilingües del modelo base en este repositorio.
- No hay modo "thinking", ni procesamiento de audio, ni otra capacidad especial documentada; no se trata de un modelo de lenguaje.

## Casos de uso

- Producción de anime y manga: convertir fotogramas o ilustraciones clave a un aspecto realista para maquetas de previsualización o para presentaciones a clientes, manteniendo el encuadre original del dibujo.
- Previsualización de adaptaciones live-action: generar referencias visuales realistas de personajes dibujados antes de decidir casting, vestuario o dirección de arte.
- Concept art para videojuegos: transformar bocetos de personajes en estilo anime a referencias fotorrealistas para modelado 3D o texturizado, dentro de un flujo de ComfyUI ya existente.
- Publicidad y marketing: adaptar ilustraciones promocionales a un acabado fotográfico para campañas en las que el estilo dibujado no encaja con el resto de la creatividad.
- Diseño de personajes e iteración rápida: generar variantes realistas de un mismo diseño mediante instrucciones de texto, útil para pruebas A/B de apariencia antes de fijar un diseño final.
- Generación de datos sintéticos: producir pares anime/realista para entrenar o evaluar otros modelos de traducción de estilo, siempre que la licencia del adaptador y del modelo base lo permitan (actualmente no está aclarada).
- Ilustración editorial y merchandising: reconvertir arte de personaje a un acabado fotográfico para portadas, cartelería o producto impreso, trabajando sobre la imagen ya aprobada por el cliente.
- Despliegue como servicio en la nube: exponer el flujo a través de la API de RunningHub para integrarlo en herramientas internas de diseño sin necesidad de GPU local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de identidad ni comparaciones con otros adaptadores), y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El autor no publica requisitos de VRAM; el repositorio solo contiene un adaptador de 900 MiB que se suma a los requisitos del modelo base.
- Modelo base: no incluido en el repositorio. Es necesario disponer de Qwen-Edit-2511 por separado, con sus propios requisitos de memoria, que no se documentan aquí.
- GPU recomendadas: no disponible, al no publicarse requisitos ni pruebas de rendimiento.
- Viabilidad en GPU de consumo: no disponible. Depende íntegramente del modelo base y de la cuantización aplicada a este, no al LoRA; el adaptador por sí solo añade aproximadamente 0,9 GB sobre el peso de los pesos base.
- Opciones de despliegue: ComfyUI (flujo local), RunningHub (ejecución en la nube, sin GPU propia) y carga directa del safetensors desde Hugging Face. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a este tipo de modelo de edición de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de otros adaptadores comparables en la información proporcionada. La tabla recoge únicamente los datos confirmados de este modelo frente al modelo base del que deriva, marcando como no disponible todo aquello que no se documenta.

| Modelo | Tipo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-qwen-edit-2511-anime2real-v4-lora | LoRA sobre Qwen-Edit-2511 | Edición de imagen anime→realista guiada por texto | no disponible (adaptador de 900 MiB) | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Qwen-Edit-2511 (modelo base) | no disponible | Edición de imagen guiada por texto | no disponible | no disponible | no disponible | no disponible en este repositorio |
| Otros adaptadores LoRA de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas comparables de conversión anime→real | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no aclarada: el repositorio no incluye un fichero de licencia ni términos explícitos. La model card remite a la licencia del proyecto original o del upstream, de modo que el uso comercial es incierto y requiere consulta previa con el autor.
- Dependencia del modelo base: el adaptador solo funciona sobre Qwen-Edit-2511; cualquier uso comercial queda además sujeto a la licencia de dicho modelo base, que no se documenta en este repositorio.
- Ausencia total de benchmarks: no hay métricas de fidelidad de identidad, calidad de textura ni estabilidad entre generaciones, por lo que no es posible estimar su comportamiento en producción sin pruebas propias.
- Riesgo de alucinación visual: en tareas de traducción de estilo, los modelos de difusión pueden introducir o eliminar detalles (rasgos faciales, pelo, accesorios) que no estaban en la imagen original; no se documenta ningún mecanismo de control o mitigación.
- Falta de parámetros de integración: no se publican rank, alpha ni módulos afectados del LoRA, datos necesarios para reproducir el entrenamiento o ajustar la intensidad del efecto en ComfyUI.
- Idiomas no especificados: se desconoce si las instrucciones de texto deben formularse en chino, inglés u otros idiomas, y si el rendimiento varía según el idioma del prompt.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin ejemplos reproducibles, imágenes de antes y después ni flujos de trabajo adjuntos.
- Metadatos poco habituales: las fechas de creación y actualización del repositorio (2026-09-28) no coinciden con un patrón de publicación habitual, lo que conviene verificar antes de integrarlo en un pipeline dependiente de versiones.
- Sin información sobre filtrado de contenido: no se indica si existen restricciones o mecanismos de seguridad frente a contenidos sensibles, aspecto relevante si el modelo se expone como servicio.
- Promoción comercial del proveedor: la model card incluye enlaces de afiliación y referencias a servicios de pago de RunningHub; conviene separar la información técnica de la promocional.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-edit-2511-anime2real-v4-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-qwen-edit-2511-anime2real-v4-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2011087241094893569
- Página del autor: https://www.runninghub.cn/user-center/1958026340350025729
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API (detalle del servicio): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Paper, repositorio de código y demo oficiales: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relacionados con el modelo.
