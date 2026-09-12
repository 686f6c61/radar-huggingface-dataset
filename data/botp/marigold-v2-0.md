# botp/marigold-v2-0

## Resumen

`botp/marigold-v2-0` es un reempaquetado de los pesos de Marigold v2 para ComfyUI, publicado por el usuario `botp` a partir del modelo original `huawei-bayerlab/marigold-v2-0`. No es un modelo entrenado desde cero ni un ajuste propio del publicador: el repositorio redistribuye los ficheros en el formato *diffusion-single-file* que espera ComfyUI, con los pesos de difusión, los LoRA específicos de tarea, los embeddings de condicionamiento y los VAE separados por tarea (albedo, profundidad y normales).

La relevancia de Marigold v2 radica en su enfoque: aplicar modelos de difusión de imágenes a tareas de predicción densa —estimación monocular de profundidad, normales de superficie y descomposición intrínseca en albedo— en lugar de generar imágenes nuevas. El inventario de ficheros evidencia tres cabezas funcionales diferenciadas (`marigold_v2_albedo`, `marigold_v2_depth_log_stage2` y `marigold_v2_normals`) que comparten un mismo modelo de difusión base.

El tamaño total del repositorio es de 26,4 GB y la licencia declarada es Apache 2.0. El repositorio acumula cero descargas y cero likes, y fue creado y actualizado el mismo día, por lo que no cuenta con validación de la comunidad ni con una model card propia más allá de las instrucciones de instalación en ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para predicción densa, con adaptadores LoRA por tarea. El fichero de difusión se denomina `qwen_image_edit_2509_int8_convrot.safetensors`, lo que apunta a un backbone derivado de Qwen-Image-Edit 2509; el autor no documenta la arquitectura explícitamente |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE en la información disponible) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa imágenes) |
| Tipos de cuantización | int8 (`convrot`) en el fichero de difusión; los LoRA, VAE y embeddings se distribuyen en safetensors sin cuantización declarada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, en disposición de ficheros suelta para ComfyUI (*diffusion-single-file*) |
| Modelo base | `huawei-bayerlab/marigold-v2-0` |
| Tareas cubiertas | albedo, profundidad (`depth_log_stage2`) y normales |
| Tamaño del repositorio | 26,4 GB |
| Text encoder / scheduler | el inventario publicado no incluye text encoder ni scheduler |
| Autor del reempaquetado | botp (no es el autor del modelo original) |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento: no se indican número de tokens, composición del dataset, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. Lo que sí se deduce del inventario es el diseño de despliegue: un único modelo de difusión base acompañado de seis artefactos específicos por tarea —tres LoRA (`marigold_v2_albedo.safetensors`, `marigold_v2_depth_log_stage2.safetensors`, `marigold_v2_normals.safetensors`) y tres VAE (`marigold_v2_albedo_vae.safetensors`, `marigold_v2_depth_log_stage2_vae.safetensors`, `marigold_v2_normals_vae.safetensors`)— más tres embeddings de condicionamiento independientes. Este esquema sugiere un backbone compartido y adaptaciones de bajo rango que redirigen la generación difusiva hacia cada espacio de salida.

El nombre del fichero de difusión (`qwen_image_edit_2509_int8_convrot`) indica que el backbone procede de Qwen-Image-Edit 2509 cuantizado a int8 con la variante `convrot`, lo que implicaría que Marigold v2 se apoya en un modelo generativo de edición de imagen de gran tamaño en lugar de en un UNet específico de profundidad. No se dispone de confirmación por parte del autor ni de documentación sobre el entrenamiento de los LoRA o de los VAE sobre ese backbone.

## Capacidades

- Estimación monocular de profundidad a partir de una sola imagen, con VAE y condicionamiento dedicados (`depth_log_stage2`, lo que sugiere una parametrización logarítmica de la profundidad en una segunda etapa).
- Estimación de normales de superficie, útil para *relighting* y renderizado.
- Descomposición intrínseca en albedo, es decir, separación de la reflectancia del sombreado de la escena.
- Ejecución dentro de ComfyUI mediante el cargador de *diffusion models* de un solo fichero, con los LoRA, VAE y embeddings colocados en las carpetas correspondientes.
- No se documentan capacidades de *tool calling*, uso agentico, generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento; son funcionalidades ajenas al propósito del modelo.
- No se documenta soporte multilingüe ni entrada de texto libre: la condición de entrada es la imagen y, presumiblemente, los embeddings de tarea.

## Casos de uso

- Preprocesado para ControlNet y generación condicionada: los mapas de profundidad y normales producidos pueden alimentar directamente a nodos de ControlNet en ComfyUI para condicionar la generación de nuevas imágenes respetando la geometría de la escena original.
- Reconstrucción 3D y *novel view synthesis*: los mapas de profundidad monofocales sirven como inicialización para *pipelines* de fotogrametría, NeRF o *Gaussian Splatting*, reduciendo el número de vistas necesarias.
- *Relighting* y renderizado: las normales de superficie permiten recalcular la iluminación de una fotografía sin volver a capturar la escena, un flujo habitual en herramientas de diseño de producto.
- Retoque fotográfico y edición de materiales: el canal de albedo posibilita modificar el color o la textura de un objeto preservando las sombras y la iluminación originales.
- Post-producción en VFX y composición digital: extracción simultánea de profundidad, normales y albedo de *plate shots* para integrar elementos CGI con coherencia de oclusión y sombreado.
- Comercio electrónico y realidad aumentada: generación de albedo y normales de productos a partir de una única fotografía, para probadores virtuales o visores 3D ligeros.
- Robótica y navegación asistida: estimación de profundidad monocular donde no se dispone de sensores LiDAR ni estéreo, siempre que la latencia del muestreo difusivo sea aceptable para la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: 26,4 GB en disco para el repositorio completo, más el espacio de los componentes auxiliares que aporte ComfyUI.
- VRAM estimada para inferencia: no confirmada por el autor. Dado que el repositorio pesa 26,4 GB y el fichero de difusión está en int8, los pesos principales ocuparían del orden de 20-24 GB, por lo que una estimación orientativa sitúa el mínimo práctico en torno a 24 GB de VRAM, sin contar *overhead* de activaciones ni de los VAE y LoRA adicionales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o GPUs de 48 GB o más para ejecutar sin *offloading*. En el extremo opuesto, una RTX 3090 o RTX 4090 con 24 GB podría ser suficiente si el reparto de memoria es favorable, con riesgo de descarga a RAM del sistema.
- GPUs de consumo con 12-16 GB: probablemente requieran *offloading* parcial a RAM o a CPU, con la penalización de latencia correspondiente. No hay datos confirmados al respecto.
- Opciones de despliegue: ComfyUI es el destino explícito del reempaquetado. No se documentan otros *runtimes* (diffusers, TGI, vLLM). llama.cpp, Ollama y GGUF no aplican, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Relación | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|
| `botp/marigold-v2-0` | Reempaquetado para ComfyUI del modelo base | Apache 2.0 | safetensors (diffusion-single-file) | Repositorio en HuggingFace, 0 descargas |
| `huawei-bayerlab/marigold-v2-0` | Modelo original del que deriva | Apache 2.0 (según la etiqueta heredada en este repositorio) | no disponible en la información proporcionada | Repositorio original referenciado por el autor |

No se dispone de datos verificables sobre alternativas de la misma categoría (parámetros, contexto, rendimiento) en la información proporcionada, por lo que no se incluye una comparación cuantitativa con otros modelos de predicción densa.

## Limitaciones y advertencias

- Repositorio sin model card propia: la documentación se limita a las rutas de instalación en ComfyUI, sin descripción de arquitectura, entrenamiento ni evaluación.
- Cero descargas y cero likes: no existe validación independiente de que los pesos funcionen correctamente ni de que reproduzcan los resultados del modelo original.
- Es un reempaquetado de terceros, no una publicación oficial de Huawei ni de Bayer Lab; cualquier incidencia debe contrastarse contra el repositorio original.
- No se publican resultados de benchmarks, por lo que no hay evidencia cuantitativa de calidad de profundidad, normales o albedo.
- Riesgo de alucinación estructural inherente a los modelos de difusión: la profundidad y las normales generadas son plausibles pero no métricas, y pueden presentar inconsistencias en bordes, superficies especulares o regiones con oclusión ambigua.
- Variabilidad entre ejecuciones: al tratarse de un proceso difusivo, distintas semillas pueden producir mapas ligeramente distintos para la misma entrada.
- Ausencia de información sobre sesgos: no hay datos sobre el dominio de entrenamiento ni sobre el comportamiento del modelo en escenas no representadas (interiores, piel, materiales transparentes, etc.).
- El inventario no incluye text encoder ni scheduler, de modo que el resultado depende de los componentes que ComfyUI cargue por defecto.
- Licencia Apache 2.0 declarada para este reempaquetado, pero conviene verificar por separado la licencia del backbone subyacente antes de un uso comercial.
- Los 26,4 GB de peso implican un coste de almacenamiento y de VRAM relevante para un modelo de predicción densa, en comparación con alternativas discriminativas más ligeras.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/botp/marigold-v2-0
- Modelo original: https://huggingface.co/huawei-bayerlab/marigold-v2-0
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- La búsqueda web realizada no devolvió enlaces relevantes: los resultados se limitan a páginas genéricas de YouTube sin relación con el modelo.
