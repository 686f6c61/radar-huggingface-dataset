# RunningHubAI/rh-flux2-klein-3d-lora

## Resumen

rh-flux2-klein-3d-lora es un adaptador LoRA de texto-a-imagen publicado por RunningHubAI en Hugging Face y atribuido al usuario @Openclaw2026 de la plataforma RunningHub. No es un modelo autónomo: se aplica sobre Flux2-Klein-9B, el modelo base del que el autor declara que deriva, y su función indicada es la extracción o generación de ropa con apariencia tridimensional, activada mediante la cadena de activación `3d服装提取` (extracción de ropa 3D).

El repositorio contiene un único fichero `F2K9B-3d服装提取.safetensors` de 158 MiB, sobre un total de 0,2 GB. Está pensado para cargarse en ComfyUI o en la propia plataforma RunningHub, que enlaza un flujo de trabajo concreto y una API para ejecutarlo en la nube.

Su relevancia actual es limitada: en el momento de la captura no acumula descargas ni valoraciones positivas, la model card no documenta dataset, hiperparámetros ni licencia, y no se han publicado benchmarks. Es útil como ejemplo del ecosistema de adaptadores de bajo coste que se publican alrededor de Flux.2, pero para producción conviene verificar la licencia del modelo base y evaluar el adaptador con un conjunto propio de prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (matrices de bajo rango) sobre un transformer de difusión; modelo base Flux2-Klein-9B |
| Parametros totales | no disponible (el fichero de pesos del adaptador ocupa 158 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución de entrenamiento e inferencia no disponible |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors y se carga junto al modelo base en ComfyUI |
| Idiomas soportados | no disponible; la cadena de activación está en chino |
| Licencia | no disponible; el autor remite a la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors |
| Modelo base | Flux2-Klein-9B |
| Cadena de activacion | `3d服装提取` |
| Tamano del repositorio | 0,2 GB (fichero principal de 158 MiB) |
| Pipeline declarado | text-to-image |
| Plataformas compatibles | ComfyUI, RunningHub (nube y API), Hugging Face |
| Fecha de publicacion registrada | 2026-10-25 |

## Arquitectura y entrenamiento

El adaptador es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base mientras este permanece congelado. La model card no describe la arquitectura interna de Flux2-Klein-9B; el nombre indica que se trata de un transformer de difusión de la familia Flux.2 con un tamaño de referencia de 9B de parámetros. Tampoco se especifican el rango, el alpha, las capas objetivo ni la precisión de los pesos del adaptador.

En cuanto al entrenamiento, no hay información pública sobre el número de imágenes, la resolución, la composición del dataset, el régimen de aprendizaje ni posibles procesos de filtrado o curado. El autor solo indica que el ajuste se realizó desde Flux2-Klein-9B y que la formación se llevó a cabo en RunningHub, con enlace a su página de entrenamiento de modelos. No se documenta ningún tipo de optimización preferencial (DPO/RLHF), algo por otra parte poco habitual en adaptadores de difusión.

## Capacidades

- Generación de imágenes a partir de texto mediante el modelo base Flux2-Klein-9B, con el adaptador aplicado en ComfyUI o en RunningHub.
- Especialización declarada en ropa 3D: la cadena de activación `3d服装提取` sugiere generación o aislamiento de prendas con aspecto tridimensional, aunque la model card no detalla el efecto exacto ni aporta ejemplos comparativos.
- No incluye tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso; es un adaptador de generación de imágenes.
- Capacidades multilingües: no documentadas. La activación está en chino y no se indica si responde igual con prompts en otros idiomas.
- No se documentan capacidades de visión de entrada (img2img, control, inpainting) ni modos especiales como thinking o audio.
- Requiere obligatoriamente el modelo base para funcionar; no es utilizable de forma aislada.

## Casos de uso

- Fichas de producto para comercio electrónico: aplicar el LoRA con la cadena de activación para obtener imágenes de prendas aisladas sobre fondo neutro, listas para incorporar a un catálogo, partiendo de prompts descriptivos de tejido, corte y color.
- Previsualización de diseños de moda: generar variantes visuales de una prenda antes de pasar al patronaje, útil para iterar Concepts con el equipo de diseño sin producción física.
- Moodboards y documentación de producto: crear ilustraciones de referencia de prendas con volumen tridimensional para memorias de colección o presentaciones internas.
- Generación de datasets sintéticos: producir imágenes etiquetadas de prendas para entrenar o aumentar modelos de visión por computador (clasificación de tejidos, segmentación de prendas), siempre que la licencia final lo permita.
- Prototipado por lotes en la nube: ejecutar el flujo de ComfyUI a través de la API de RunningHub para generar series de imágenes en pipelines automatizados de contenido.
- Contenido para videojuegos o realidad aumentada: generar renders de prendas como referencia de modelado o texturizado antes de la producción 3D real.
- Pruebas de concepto en investigación sobre adaptadores: usar el LoRA como caso de estudio de ajuste de bajo rango sobre Flux.2, comparando su comportamiento con otros adaptadores del mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros adaptadores, y el repositorio no registra descargas ni valoraciones que permitan inferir una validación por parte de la comunidad.

## Requisitos de hardware

- El adaptador en sí ocupa 158 MiB y su coste computacional adicional es despreciable; todos los requisitos vienen determinados por Flux2-Klein-9B.
- VRAM para inferencia: no disponible de forma oficial. Como referencia orientativa, no confirmada por el autor, un transformer de difusión de 9B en fp16 ocuparía del orden de 18 GB solo en pesos, a lo que habría que sumar el text encoder y el VAE; el total dependería de la configuración concreta del base.
- GPU recomendadas: no disponibles. Por el orden de magnitud anterior, serían razonables A100 (40/80 GB) o H100 para ejecución cómoda en fp16, y RTX 4090 (24 GB) solo con cuantización u offloading del base, extremo no documentado.
- Compatibilidad con GPU de consumo: no confirmada. No se especifica si el base admite variantes GGUF, fp8 o NF4 que permitan ejecución en tarjetas de 8-16 GB.
- Opciones de despliegue: ComfyUI (documentado por el autor) y la plataforma o API de RunningHub. No se mencionan Diffusers, vLLM, TGI ni llama.cpp, que además no son las vías habituales para un LoRA de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de adaptadores equivalentes para Flux2-Klein-9B, por lo que la comparación se limita a aspectos estructurales y no a rendimiento medido.

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-flux2-klein-3d-lora | LoRA sobre Flux2-Klein-9B | no disponible (adaptador de 158 MiB) | no disponible | no disponible | Hugging Face, RunningHub |
| Flux2-Klein-9B (base) | Transformer de difusion | 9B (segun denominacion) | no disponible | no disponible en esta ficha | Requerido para usar el LoRA |
| Otros LoRA de la familia Flux.2 | LoRA | no disponible | no disponible | variable | Ecosistema Hugging Face |
| LoRA para SDXL | LoRA | no disponible | no disponible | variable | Ecosistema muy extendido, con multitud de adaptadores |

La diferencia práctica frente a alternativas de otras familias (SDXL, Flux.1) es la dependencia del base Flux2-Klein-9B: el adaptador no es portable y su calidad final queda supeditada a un modelo con soporte todavía emergente en herramientas de terceros.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original o del modelo base. Antes de un uso comercial hay que verificar la licencia de Flux2-Klein-9B, que no se detalla en la información disponible.
- Ausencia de validación comunitaria: cero descargas y cero valoraciones en el momento de la captura, sin ejemplos comparativos antes/después del adaptador.
- Documentación muy escasa: no hay dataset, hiperparámetros, rango del LoRA ni guía de pesos recomendados; parte del contenido de la model card es promocional (códigos de invitación y enlaces a la API).
- Dependencia estricta del base: usar una versión o variante distinta de Flux2-Klein-9B puede degradar o anular el efecto del adaptador.
- Cadena de activación en chino: prompts en castellano o inglés pueden requerir incluir literalmente `3d服装提取`; no se documenta el comportamiento multilingüe.
- Riesgo de sobreajuste al estilo del dataset de entrenamiento, que se desconoce; es probable la reproducción de sesgos de composición, iluminación o tipo de cuerpo presentes en las imágenes originales.
- En modelos de difusión, el fenómeno equivalente a la alucinación se manifiesta como artefactos: costuras incoherentes, anatomía incorrecta o prendas que no se corresponden con el prompt.
- Sin información sobre sesgos demográficos ni sobre el rendimiento en prendas culturalmente específicas o tallajes diversos.
- No apto para tareas de lenguaje, razonamiento, código o agentes; el pipeline declarado es exclusivamente text-to-image.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-flux2-klein-3d-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2038813993833340930
- Página del autor: https://www.runninghub.cn/user-center/2025581316556464129
- Flujo de trabajo compatible: https://www.runninghub.cn/post/2038862090676473857
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-flux2-klein-3d-lora/blob/main/README_cn.md
