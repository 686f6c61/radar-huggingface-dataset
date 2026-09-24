# RunningHubAI/rh-bjdv1.0-lora

## Resumen
rh-bjdv1.0-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face, entrenado para transformar ilustraciones de estilo anime en representaciones de muñecas BJD (ball-jointed doll). No es un modelo completo, sino un fichero de pesos de 281 MiB (`BJD娃娃V1.0.safetensors`) que se carga sobre un modelo base: la model card indica que está afinado a partir de Qwen-Edit-2511 y que la palabra de activación es 动漫转BJD娃娃.

El adaptador está pensado para el ecosistema ComfyUI y para la propia plataforma RunningHub, con pipeline declarado como image-text-to-image, es decir, edición de una imagen de entrada guiada por una instrucción textual. Su relevancia es práctica y acotada: permite reutilizar un modelo de edición de imagen generalista para obtener un estilo muy concreto (muñecas articuladas con rasgos y acabado propios) sin reentrenar el modelo base, con un coste de almacenamiento mínimo.

La ficha pública es muy escasa: no se documentan parámetros totales, contexto, idiomas, licencia explícita ni resultados de benchmarks. Cualquier evaluación rigurosa del adaptador exige por tanto consultar la ficha del modelo base (Qwen-Edit-2511) y validar el comportamiento con pruebas propias en ComfyUI.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible para el adaptador; se trata de un LoRA aplicado sobre el modelo base Qwen-Edit-2511 (arquitectura del base no detallada en la información proporcionada) |
| Parámetros totales | no disponible; el fichero de pesos del adaptador ocupa 281 MiB en disco, lo que acota el tamaño del adaptador, no el del modelo base |
| Longitud de contexto | no aplica / no disponible (modelo de edición de imagen, no de texto) |
| Tipos de cuantización | no disponible; se distribuye un único fichero `.safetensors`. La model card no especifica precisión (fp16/bf16/fp8) |
| Idiomas soportados | no disponible; la palabra de activación y el prompt de ejemplo están en chino (动漫转BJD娃娃). El idioma efectivo de los prompts depende del codificador de texto del modelo base |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que se debe seguir la licencia del proyecto original o del modelo upstream, sin especificar cuál |
| Formato de pesos | safetensors (`BJD娃娃V1.0.safetensors`, 281 MiB) |
| Tipo de modelo | LoRA de edición de imagen (image edit) |
| Modelo base | Qwen-Edit-2511 |
| Palabras de activación | 动漫转BJD娃娃 |
| Pipeline declarado | image-text-to-image |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,3 GB |
| Fecha de creación / actualización | 2026-09-24 (creación), 2026-09-24 (última actualización) |

## Arquitectura y entrenamiento
No se dispone de información técnica sobre el entrenamiento: la model card no indica el número de pasos, el tamaño ni la composición del dataset, la resolución de entrenamiento, el rango o alpha del LoRA ni si se aplicaron técnicas de regularización. Tampoco se documenta si hubo etapas de ajuste por preferencias (RLHF, DPO) —poco habituales en este tipo de adaptadores de imagen— ni si se emplearon captions automáticos.

Lo único verificable es la relación con el modelo base: el adaptador se presenta como finetuned from Qwen-Edit-2511, un modelo de edición de imagen, y se distribuye como un único fichero de pesos compatible con ComfyUI. La innovación, en este caso, no es arquitectónica sino de especialización estilística: concentrar un dominio visual muy concreto (conversión de anime a muñeca BJD) en 281 MiB de pesos adicionales, en lugar de reentrenar el modelo completo.

## Capacidades
- Edición de imagen guiada por texto: transformación de una imagen de entrada (ilustración o render de estilo anime) hacia el aspecto de una muñeca BJD.
- Especialización estilística: acabado de muñeca articulada, con los rasgos, proporciones y materiales característicos del colectivo BJD, activado mediante la palabra clave 动漫转BJD娃娃.
- Integración en flujos ComfyUI: se carga como adaptador junto al modelo base dentro de un grafo de nodos de edición de imagen.
- Ejecución en la plataforma RunningHub: la model card ofrece despliegue y API gestionados sobre la infraestructura del propio proveedor.
- Soporte de tool calling / function calling: no aplica (modelo de imagen).
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningún modo de razonamiento.
- Capacidades multilingües: no disponibles; solo se documenta una palabra de activación en chino.
- Capacidades especiales (thinking mode, visión, audio): no disponibles. La entrada es imagen más texto; no se documentan otras modalidades.

## Casos de uso
- Previsualización de diseños para fabricantes de muñecas BJD: a partir de bocetos o ilustraciones 2D, generar versiones con acabado de muñeca para evaluar proporciones, paleta y caracterización antes de modelar o producir la pieza física.
- Ilustración de personajes para cómics y novela ligera: convertir arte anime ya existente al lenguaje visual BJD cuando la obra requiere ese registro (coleccionistas, líneas argumentales con muñecas, portadas temáticas).
- Contenido para comunidades de coleccionistas: generar variaciones estilizadas de fotografías o ilustraciones propias para publicar en foros y redes, usando ComfyUI en local y la palabra de activación para forzar el estilo.
- Diseño de línea de producto y catálogo: producir imágenes coherentes de concepto para colecciones de muñecas, vestuario o accesorios, aprovechando que la edición parte de una imagen de referencia y permite mantener la pose y la composición originales.
- Prototipado de maquillaje, pelucas y atuendos: editar una fotografía o render base para explorar combinaciones cromáticas y de acabado sin sesiones fotográficas ni muestras físicas.
- Assets para videojuegos o aplicaciones de personalización: generar retratos y avatares con estética BJD a partir de arte conceptual, reutilizando el adaptador dentro de un pipeline automatizado en ComfyUI.
- Retoque creativo para artistas: aplicar el estilo a encargos que pidan explícitamente estética de muñeca articulada, manteniendo la composición de la imagen de entrada y ajustando la fuerza del LoRA por iteración.
- Pruebas comparativas de adaptadores: usar este LoRA como caso de estudio de especialización estilística barata (281 MiB) frente a alternativas de afinado completo, midiendo fidelidad al dominio y coste de despliegue.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud con imagen de referencia ni comparaciones con otros adaptadores), y el repositorio no presenta resultados cualitativos documentados más allá de la descripción del estilo.

## Requisitos de hardware
- El adaptador en sí ocupa 281 MiB en disco, por lo que su carga añade un coste de VRAM y de memoria muy reducido en comparación con el modelo base.
- La VRAM necesaria para inferir viene determinada casi por completo por Qwen-Edit-2511 y por la resolución, el número de pasos y la precisión elegidos. La información proporcionada no especifica cifras de VRAM para el modelo base, por lo que no se puede estimar con rigor.
- GPU recomendadas: no disponible en la información proporcionada; depende, de nuevo, del modelo base y del preset de ComfyUI empleado.
- Idoneidad en GPU de consumo: no disponible. El adaptador no es el factor limitante; habría que consultar los requisitos del modelo base y probar en la GPU objetivo.
- Opciones de despliegue: ComfyUI (flujo principal, cargando el LoRA junto al modelo base), la plataforma RunningHub (ejecución gestionada y API) y, en general, cualquier stack que soporte safetensors y el modelo base subyacente.
- Latencia y throughput: no disponibles. No se publican tiempos de generación ni métricas por imagen.

## Comparativa con modelos similares
No disponible. La información proporcionada no identifica otros adaptadores LoRA comparables ni ofrece métricas que permitan una comparación con alternativas del mismo dominio (edición de imagen o conversión de estilo anime a muñeca). Para una comparación mínima habría que contrastar, como mínimo, con el propio modelo base sin el LoRA (Qwen-Edit-2511 en su versión original) y con otros LoRA alojados en RunningHub o en Hugging Face del mismo autor, cuyos datos no se incluyen aquí.

## Limitaciones y advertencias
- Licencia no especificada: la model card remite a la licencia del proyecto original o upstream sin nombrarla, y añade que el copyright permanece en el autor. Esto deja en el aire el uso comercial y la redistribución; conviene aclararlo con el autor antes de usarlo en producción.
- Dependencia total del modelo base: el adaptador no es autónomo. Es necesario disponer de Qwen-Edit-2511 y respetar su licencia, que es la que realmente condiciona el uso.
- Riesgo de sobreajuste estilístico: al ser un LoRA especializado en un único dominio, puede forzar el estilo BJD incluso cuando no se desea, degradar rasgos finos de la imagen original o producir resultados inconsistentes en poses y composiciones alejadas de las vistas en entrenamiento.
- Sensibilidad a la palabra de activación: la única documentada es 动漫转BJD娃娃, en chino. No se documenta su comportamiento con prompts en otros idiomas ni la fuerza o el peso óptimos del LoRA.
- Ausencia de datos de entrenamiento: sin información sobre dataset, resolución o número de pasos, no es posible anticipar sesgos demográficos ni estéticos, ni evaluar la cobertura de tipos de cuerpo, tonos de piel o estilos de entrada.
- Trazas de alucinación visual: como todo modelo generativo de imagen, puede introducir artefactos, anatomías incorrectas o detalles inventados (articulaciones, costuras, accesorios) que no existen en la imagen de entrada.
- Sin benchmarks ni métricas: no hay evidencia cuantitativa de calidad ni de reproducibilidad; la validación debe hacerse con pruebas propias.
- Metadatos de la ficha incompletos o anómalos: la fecha de creación declarada (2026-09-24) es posterior a la fecha actual, el repositorio registra 0 descargas y 0 likes, y no se indica el tamaño del dataset ni la versión del pipeline. Conviene tratar la ficha con cautela.
- Resolución y formato de salida no documentados: no se especifican resoluciones soportadas, relación de aspecto ni la necesidad de una imagen de referencia concreta, lo que complica la integración en pipelines automatizados.

## Enlaces
- Hugging Face: https://huggingface.co/RunningHubAI/rh-bjdv1.0-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-bjdv1.0-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2006554860258336770
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1987875695441424386
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejecución de Seedance 2.5 vía API de RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
