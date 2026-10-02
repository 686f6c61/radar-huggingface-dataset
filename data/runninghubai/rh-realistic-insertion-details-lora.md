# RunningHubAI/rh-realistic-insertion-details-lora

## Resumen

rh-realistic-insertion-details-lora es un adaptador LoRA de edición de imagen orientado a contenido explícito para adultos, publicado por RunningHubAI en Hugging Face y distribuido también a través de la plataforma RunningHub. El adaptador se ha afinado a partir del modelo base krea2 y no es autónomo: necesita ese checkpoint para generar imagen. Su único archivo de pesos, `prvpns_penis_krea2_v6_final.safetensors`, ocupa 109 MiB dentro de un repositorio de 0,1 GB.

El modelo pertenece a la categoría de LoRA de edición y detalle fotorrealista, con una palabra de activación obligatoria (`prvpns`) y un pipeline declarado `image-text-to-image`, lo que en la práctica implica flujos de imagen a imagen guiados por texto en ComfyUI. La ficha pública no documenta composición del dataset, número de pasos de entrenamiento, hiperparámetros ni evaluación cuantitativa.

Su relevancia para desarrolladores es limitada pero concreta: sirve como ejemplo de integración de LoRA en pipelines de ComfyUI, de publicación de adaptadores a través de una plataforma con API y de los problemas habituales de licencia, moderación y trazabilidad en adaptadores derivados de terceros. La información publicada es muy escasa: no hay licencia declarada, no hay idiomas especificados y no hay benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2 |
| Parametros totales | no disponible (archivo de pesos de 109 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los derechos permanecen en el autor; se indica seguir la licencia del proyecto original) |
| Formato de pesos | safetensors (`prvpns_penis_krea2_v6_final.safetensors`) |

Datos adicionales declarados en la model card:

| Campo | Valor |
|---|---|
| Nombre del modelo | rh-realistic-insertion-details-lora |
| Tipo | LoRA (image edit) |
| Modelo base | krea2 |
| Palabra de activación | `prvpns` |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHub - @氛围感 |
| Pipeline | image-text-to-image |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |
| Fecha de actualizacion | 2026-10-01 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar el backbone completo. El modelo base declarado es krea2, un modelo de generación y edición de imagen. El repositorio solo contiene el adaptador: no incluye el checkpoint base, el tokenizador ni ningún componente del pipeline de difusión.

No hay información publicada sobre el número de imágenes de entrenamiento, la resolución, el número de pasos, la tasa de aprendizaje, el rango del LoRA, la precisión de entrenamiento ni si se aplicaron técnicas de regularización o de *dataset captioning* (por ejemplo, captions automáticos con modelos de visión-lenguaje). Tampoco se documenta ningún proceso de ajuste por preferencias humanas ni de filtrado de seguridad sobre el material de entrenamiento. La única referencia al origen del ajuste es un enlace a la publicación original en civitai.red, que no forma parte de este repositorio.

Desde el punto de vista técnico, lo relevante es la mecánica de integración: el adaptador se carga sobre krea2 con un peso de escala (strength) configurable, requiere la palabra de activación `prvpns` en el prompt y depende por completo de que el backbone sea compatible con la arquitectura sobre la que se entrenó.

## Capacidades

- Edición de imagen guiada por texto (pipeline `image-text-to-image`), aplicando modificaciones localizadas sobre una imagen de entrada.
- Añadido de detalle fotorrealista en zonas anatómicas concretas, que es el propósito declarado del adaptador.
- Activación condicionada por palabra clave: sin `prvpns` en el prompt, el efecto del adaptador no se activa de forma fiable.
- Integración en ComfyUI como nodo LoRA dentro de un grafo de generación.
- Ejecución en la plataforma RunningHub y a través de su API, sin necesidad de infraestructura propia.
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso, matemáticas, código, visión analítica, audio ni modo de razonamiento explícito: son capacidades ajenas al tipo de modelo.
- No se documenta soporte multilingüe: no hay idiomas declarados y el comportamiento del prompt depende del codificador de texto del modelo base krea2.

## Casos de uso

- Producción de contenido para adultos en plataformas con verificación de edad: el adaptador se integra en un flujo de ComfyUI donde la imagen base se genera primero y el detalle se añade en una segunda pasada con el LoRA activado y la palabra `prvpns`.
- Moderación y clasificación de contenido: usar el modelo para generar muestras controladas con las que entrenar o validar clasificadores NSFW y filtros de seguridad, siempre en un entorno aislado y con las salvaguardas legales correspondientes.
- Aumento de datos para investigación sobre detección de contenido explícito: generar variaciones sintéticas etiquetadas para medir falsos positivos y falsos negativos de un detector.
- Pruebas de pipelines de edición por imagen en ComfyUI: sirve como caso de prueba para verificar la carga de LoRA, el escalado de *strength*, la gestión de VRAM y el encadenado de nodos antes de pasar a modelos en producción.
- Auditoría de filtros de plataforma: comprobar si un servicio de alojamiento o una pasarela de API bloquea correctamente adaptadores NSFW y si las políticas de contenido se aplican de forma consistente.
- Estudio de trazabilidad y licencias en adaptadores derivados: es un ejemplo real de LoRA publicado por un tercero sobre un modelo base ajeno, sin licencia explícita, útil para diseñar procesos internos de revisión legal antes de adoptar adaptadores externos.
- Evaluación de pipelines de entrenamiento de LoRA: comparar el resultado con adaptadores equivalentes de la misma plataforma para medir la calidad del *fine-tuning* ofrecido por RunningHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros adaptadores, y no hay datos de latencia o *throughput* para el adaptador ni para el modelo base krea2.

## Requisitos de hardware

- El propio adaptador pesa 109 MiB, por lo que su huella de VRAM es despreciable en comparación con el modelo base.
- La VRAM necesaria la determina íntegramente el checkpoint krea2, cuyos requisitos no se especifican en la información disponible.
- El LoRA no se puede ejecutar de forma aislada: requiere cargar el modelo base completo antes de aplicar el adaptador.
- No hay datos publicados sobre GPU recomendadas para esta combinación concreta. Las cifras habituales de un backbone de difusión moderno dependen de la precisión (fp16, bf16, int8) y de si se aplican técnicas de *offloading* a CPU o a RAM.
- Opciones de despliegue documentadas: ComfyUI (nodos de LoRA), la plataforma RunningHub (modelo público 2081190787504726018) y su API.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Palabra de activación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-realistic-insertion-details-lora | LoRA de edición de imagen | krea2 | `prvpns` | no disponible | Hugging Face, RunningHub |
| rh-krea2-asian-realistic-ultimate-edition-lora | LoRA de imagen realista | krea2 (por el nombre del repositorio) | no disponible | no disponible | Hugging Face, RunningHub |
| Adaptadores LoRA genéricos de estilo fotorrealista | LoRA | variable | variable | variable | Hugging Face, Civitai |

No se dispone de parámetros, contexto, rendimiento ni licencia de los modelos comparados en la información proporcionada, por lo que la comparación se limita al tipo de artefacto, el backbone declarado y el canal de distribución.

## Limitaciones y advertencias

- Contenido explícito para adultos: el adaptador está diseñado específicamente para generar material sexualmente explícito, lo que impone verificación de edad y cumplimiento normativo en cualquier despliegue.
- Licencia no disponible: la model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original, pero no se identifica cuál es. No hay autorización explícita para uso comercial.
- Ausencia de benchmarks: no existe ninguna evaluación publicada de calidad, coherencia anatómica o fidelidad al prompt.
- Dependencia estricta del modelo base: sin krea2, el archivo safetensors es inutilizable.
- Riesgo de artefactos anatómicos: en adaptadores de este tipo son frecuentes las inconsistencias en manos, extremidades y proporciones, así como los defectos de continuidad en la zona editada.
- Sesgos del dataset de entrenamiento: no se documenta la composición del material de entrenamiento, por lo que se desconocen sesgos de cuerpo, etnia, edad aparente o contexto.
- Trazabilidad limitada: el origen del ajuste apunta a una publicación externa en civitai.red y no se aporta información sobre la procedencia de las imágenes.
- Políticas de plataforma: el despliegue en servicios en la nube, pasarelas de API o entornos corporativos puede infringir sus términos de uso y provocar el bloqueo de la cuenta.
- Sin información sobre idiomas: el comportamiento con prompts en castellano no está documentado; el codificador de texto del modelo base determina el resultado.
- Riesgo de uso indebido: la generación de contenido sexual sintético con personas identificables o menores es ilegal en la mayoría de jurisdicciones y queda fuera de cualquier uso legítimo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-realistic-insertion-details-lora
- Archivo de pesos: https://huggingface.co/RunningHubAI/rh-realistic-insertion-details-lora/blob/main/prvpns_penis_krea2_v6_final.safetensors
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2081190787504726018
- Página del autor: https://www.runninghub.ai/user-center/2041030036219498497
- Publicación de origen referenciada: https://civitai.red/models/2807106/prvpns-realistic-penis-vaginal-penetration-lora-for-krea2-v6?modelVersionId=3165274
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API: https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Plataforma de entrenamiento de modelos: https://www.runninghub.ai/page-model
- Catálogo de modelos: https://www.runninghub.ai/models
- Perfil de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI/models
