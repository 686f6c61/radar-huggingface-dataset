# RunningHubAI/rh-kristy-v6-lora

## Resumen

`rh-kristy-v6-lora` es un adaptador LoRA para edición y generación de imágenes condicionada por texto, publicado por RunningHubAI bajo el pipeline `image-text-to-image`. No se trata de un modelo base completo, sino de un conjunto de pesos de bajo rango (un único fichero `Kristy_V4_000009250.safetensors` de 218 MiB) que se aplica sobre un modelo base identificado en la model card como `krea2`. El adaptador está entrenado para activarse mediante la palabra clave (trigger word) `kristyli`, un patrón habitual en LoRA de personaje o estilo en el ecosistema de ComfyUI.

La relevancia de esta ficha es acotada: el repositorio no aporta información sobre arquitectura del modelo base, número de parámetros, contexto, idiomas ni licencia explícita más allá de remitir a la licencia del proyecto original. El autor es un usuario de la plataforma RunningHub (`@Pylaiev_V`) y el modelo se distribuye como material listo para cargar en ComfyUI o en los servicios en la nube de RunningHub, por lo que su utilidad práctica queda ligada a dicha plataforma y al modelo base `krea2`.

Conviene subrayar que en el momento de la consulta el repositorio no registra descargas ni interacciones, y que la información técnica publicada es mínima. Esta ficha se ha redactado con los datos disponibles y señala explícitamente como "no disponible" todo aquello que la model card no especifica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; arquitectura del base no disponible |
| Parámetros totales | no disponible (pesos LoRA de 218 MiB; parámetros del base no disponibles) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el fichero se distribuye en safetensors de precisión no especificada |
| Idiomas soportados | no disponibles (las indicaciones se introducen como prompt de texto, presumiblemente en inglés y chino, sin confirmación) |
| Licencia | no disponible de forma explícita; la model card remite a la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`Kristy_V4_000009250.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención (y opcionalmente en las capas feed-forward) de un modelo base congelado. La model card indica que el ajuste fino parte de `krea2`, pero no detalla el número de tokens de entrenamiento, la composición del dataset, si hubo regularización, ni la resolución de entrenamiento. Tampoco se especifica el rango (rank) del adaptador ni el valor de alpha, parámetros habituales en cualquier LoRA y que el fichero safetensors contendría pero que no se documentan.

No consta información sobre técnicas de entrenamiento adicionales (RLHF, DPO), sobre el número de pasos ni sobre el hardware empleado. El autor ofrece formación de modelos en RunningHub, lo que sugiere que el adaptador se entrenó con las herramientas de esa plataforma, pero es una inferencia y no un dato confirmado. La única innovación destacable desde el punto de vista del flujo de trabajo es la integración nativa con ComfyUI y con la API de RunningHub, que permite ejecutar el modelo sin infraestructura propia.

## Capacidades

- Generación y edición de imágenes condicionada por texto (`image-text-to-image`) mediante la aplicación del LoRA sobre el modelo base `krea2`.
- Activación de un concepto o personaje concreto mediante la trigger word `kristyli`, incluida en el prompt.
- Compatibilidad con flujos de ComfyUI, lo que permite encadenarlo con nodos de muestreo, control de imagen (ControlNet, IP-Adapter) u otros adaptadores compatibles con el base.
- Ejecución en la nube mediante la API de RunningHub, sin necesidad de GPU local.
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponibles (no es un modelo de lenguaje).

## Casos de uso

- Generación de retratos de personaje consistente: introduciendo la trigger word `kristyli` en el prompt, el LoRA fuerza la identidad o estilo aprendido para producir imágenes coherentes entre distintas generaciones, útil en ilustración, cómics o previsualización de personajes.
- Edición de imagen existente en ComfyUI: cargando el LoRA en un flujo `image-text-to-image` se pueden aplicar transformaciones guiadas por texto sobre una imagen de entrada, manteniendo el concepto aprendido.
- Creación de variaciones de estilo para concept art: combinado con otros LoRA y con prompts descriptivos, permite explorar variantes de un mismo personaje o estética sin reentrenar.
- Prototipado rápido en la nube: a través de la API de RunningHub se puede invocar el modelo desde una aplicación sin disponer de GPU, lo que resulta adecuado para demos y pruebas de concepto.
- Integración en pipelines de generación por lotes: el fichero safetensors se puede cargar programáticamente en ComfyUI o en scripts de difusión para producir conjuntos de imágenes con la misma identidad.
- Experimentación académica sobre personalización de modelos de difusión: dado su tamaño reducido (218 MiB), es adecuado como ejemplo didáctico de ajuste fino con LoRA y de evaluación de la fidelidad de la trigger word.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El LoRA por sí solo no puede ejecutarse: requiere cargar el modelo base `krea2` completo, cuyos requisitos de VRAM no se documentan en la información proporcionada.
- VRAM estimada para el adaptador: despreciable (218 MiB en disco); la carga real la determina el modelo base y la resolución de generación.
- GPU recomendadas: no disponibles para el base `krea2`; en modelos de difusión comparables se suele requerir al menos 8-12 GB de VRAM para resoluciones moderadas, pero es una estimación genérica, no un dato del repositorio.
- Despliegue local: ComfyUI (principal vía indicada por las etiquetas del repositorio y la model card).
- Despliegue en la nube: RunningHub (versión internacional y versión china) mediante su API.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-kristy-v6-lora | LoRA sobre `krea2` | no disponible | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos alternativos de la misma categoría (LoRA de personaje o estilo para edición de imagen) dentro de la documentación proporcionada como para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La información técnica publicada es mínima: no se documentan arquitectura del base, parámetros, contexto, cuantizaciones ni licencia explícita.
- El modelo depende del base `krea2`; sin él, el fichero safetensors es inutilizable. Cualquier cambio o retirada del base afecta directamente al adaptador.
- La licencia no está declarada de forma explícita y se remite al proyecto original; antes de un uso comercial es imprescindible verificar la licencia del modelo base y del dataset de entrenamiento.
- Riesgo de sobreajuste al concepto aprendido: la trigger word `kristyli` puede dominar el prompt y reducir la variedad de las generaciones si no se ajusta su peso.
- No hay evaluación de sesgos ni de fidelidad publicada; el LoRA podría reproducir sesgos presentes en los datos de entrenamiento del base o del ajuste fino.
- El repositorio no registra descargas ni interacciones, por lo que no existe evidencia comunitaria de calidad o estabilidad.
- Al ser un adaptador de imagen, no ofrece razonamiento, código, matemáticas ni tool calling; no debe emplearse en tareas de lenguaje.
- Las capacidades multilingües del prompt no están confirmadas; se desconoce si la trigger word y las indicaciones funcionan igual en castellano.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-kristy-v6-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2105936430963261442
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2103778334421688321
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Formación de modelos en RunningHub: https://www.runninghub.ai/page-model
