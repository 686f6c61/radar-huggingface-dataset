# RunningHubAI/rh-f.1-lora

## Resumen

rh-f.1-lora es un adaptador LoRA para generación de imágenes por difusión, publicado por RunningHubAI (la división de modelos de la plataforma RunningHub) a partir de un entrenamiento del usuario @可铯创意cosaer. No es un modelo de lenguaje: es un fichero de pesos auxiliar de 292 MiB que se carga sobre un modelo base de difusión y que está especializado en retratos femeninos con estética de red social china, a juzgar por el nombre del fichero distribuido (F.1小红书网感--微信女生头像, es decir, avatares de WeChat con la estética visual de Xiaohongshu).

El repositorio se publica en Hugging Face con los tags comfyui y lora, y está pensado para su uso dentro de ComfyUI, en la propia plataforma RunningHub o en Hugging Face. La palabra de activación declarada es girl y el autor recomienda valores de cfg entre 0,6 y 1, peso de LoRA entre 0,6 y 1 y resoluciones de 1280x1920. La model card indica que el adaptador se afina desde "F1基础 D", sin especificar la versión exacta del modelo base.

Su relevancia práctica es acotada y muy específica: se trata de un adaptador de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin licencia formal declarada y con una declaración de uso del autor que restringe explícitamente el uso comercial y la reventa de imágenes generadas. Es útil como ejemplo del flujo de publicación de LoRAs de avatar dentro del ecosistema ComfyUI, no como componente de un pipeline de producción sin revisión legal previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre un modelo base de difusión; la model card indica "Finetuned from: F1基础 D" |
| Parámetros totales | no disponible; el fichero de pesos ocupa 292 MiB y el repositorio completo 0,3 GB |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes, no de texto) |
| Tipos de cuantización | no disponible; se distribuye únicamente en safetensors |
| Idiomas soportados | no disponible; la model card, el nombre del fichero y las indicaciones del autor están en chino e inglés |
| Licencia | no declarada como licencia formal; la model card incluye una declaración de uso del autor con restricciones (copyright del autor) |
| Formato de pesos | safetensors (archivo `F.1小红书网感--微信女生头像_1.0.safetensors`, 292 MiB) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base de difusión para modificar su comportamiento sin reentrenarlo por completo. La model card no especifica el rango (rank), el módulo objetivo (attention, proyecciones lineales, etc.), el optimizador, el número de pasos ni el tamaño del dataset de entrenamiento. Tampoco se indica la versión concreta del modelo base más allá de la referencia "F1基础 D", lo que introduce incertidumbre sobre la compatibilidad exacta con distintas variantes de la familia Flux.1.

El material publicado es esencialmente promocional: describe los parámetros de inferencia recomendados (cfg 0,6-1, peso de LoRA 0,6-1, resolución 1280x1920), indica que las imágenes generadas en ComfyUI conservan metadatos que se pueden recuperar arrastrando el PNG a la interfaz, e incluye publicidad de servicios de despliegue en la nube de RunningHub. No hay información sobre composición del dataset, curación de datos, uso de técnicas de alineación (RLHF/DPO no aplican a un modelo de difusión) ni sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes de retratos femeninos con estética de red social china (estilo Xiaohongshu) a partir de prompts de texto.
- Especialización en avatares de perfil de mensajería, con resolución recomendada de 1280x1920 (formato vertical).
- Activación mediante la palabra gatillo girl, combinable con prompts descriptivos en chino o inglés.
- Integración nativa en flujos de ComfyUI: el resultado generado incorpora metadatos de generación recuperables al arrastrar la imagen a la interfaz.
- Ajuste fino del efecto mediante dos hiperparámetros documentados: cfg (0,6-1) y peso de LoRA (0,6-1).
- Posible combinación con otros LoRAs del mismo modelo base (no documentado por el autor; depende de la implementación en ComfyUI).
- No dispone de capacidades de texto, razonamiento, código, matemáticas, visión por comprensión, tool calling, function calling ni comportamiento agéntico.
- No se documentan capacidades multilingües más allá del idioma de los prompts, ni modos especiales (thinking mode, audio, vídeo).

## Casos de uso

- Avatares para perfiles de mensajería: el adaptador genera retratos verticales de 1280x1920 con la estética de Xiaohongshu, un formato directamente utilizable como imagen de perfil en WeChat u otras aplicaciones de mensajería.
- Ilustración para publicaciones en redes sociales: creación de imágenes de acompañamiento para posts con estética de blog chino de estilo de vida, ajustando cfg y peso de LoRA para variar el grado de estilización.
- Prototipado de personajes con semilla fija: al fijar semilla y peso de LoRA en ComfyUI se obtiene consistencia razonable entre variaciones, útil para bocetos de personaje antes de pasar a un pipeline de entrenamiento propio.
- Reproducción de flujos de terceros: como las imágenes generadas conservan metadatos, el adaptador permite reconstruir exactamente la configuración de generación de una imagen compartida, útil para auditar o replicar resultados dentro de ComfyUI.
- Estudio comparativo de adaptadores: sirve como caso de prueba para medir cómo cambia la salida de un mismo modelo base al aplicar distintos pesos de LoRA (0,6 frente a 1,0) manteniendo prompt y semilla.
- Material de referencia para entrenamiento: las imágenes generadas pueden usarse como ejemplo de estilo para construir datasets propios de retrato, siempre que se respeten las restricciones de la declaración de uso.
- Pruebas de integración de ComfyUI en la nube: el autor ofrece despliegue cloud con GPU de 24 GB, de modo que el adaptador puede validarse sin hardware local, aunque se trata de un servicio promocional y no de un requisito técnico verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas cuantitativas (FID, CLIP score, similitud de prompt, evaluaciones estéticas) ni comparaciones con otros adaptadores. Con 0 descargas y 0 likes registrados, tampoco existe una evaluación de la comunidad que pueda citarse. Las resultados de la búsqueda web proporcionada no contienen información relevante sobre este modelo.

## Requisitos de hardware

- El adaptador en sí ocupa 292 MiB en disco (0,3 GB el repositorio completo), por lo que el almacenamiento no es un factor limitante.
- La VRAM necesaria la determina el modelo base de difusión, no el LoRA. No hay datos publicados por el autor al respecto.
- Estimación orientativa (no confirmada por el autor ni por benchmarks): una variante de la familia Flux.1 en precisión completa requiere del orden de 20-24 GB de VRAM; con cuantizaciones de 8 bits o GGUF, el rango baja aproximadamente a 8-12 GB, y con offloading puede ejecutarse en GPUs de 8-12 GB a costa de latencia.
- GPU de gama profesional: A100, H100 o L40S son suficientes con margen para el modelo base en precisión completa.
- GPU de consumo: una RTX 4090 (24 GB) es la opción más holgada; una RTX 3060 de 12 GB o una RTX 4070 pueden funcionar con el modelo base cuantizado y gestión de memoria por offloading.
- Opciones de despliegue: ComfyUI (soporte nativo declarado por los tags del repositorio), plataforma RunningHub, y en general cualquier entorno compatible con el modelo base elegido (Forge, Fooocus o diffusers, mencionados por el autor dentro de su catálogo de servicios).
- Latencia y throughput: no disponible.
- El autor anuncia acceso a GPU en la nube con 24 GB de VRAM y despliegue de ComfyUI "gratis durante 3 meses" como servicio promocional, no como requisito del modelo.

## Comparativa con modelos similares

No hay datos suficientes en la información proporcionada para establecer una comparativa rigurosa. Este repositorio es un adaptador LoRA de nicho, sin benchmarks ni licencia declarada, y no se han facilitado resultados de otros adaptadores comparables.

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-f.1-lora | LoRA sobre modelo de difusión | no disponible (peso de 292 MiB) | no aplica | sin benchmarks publicados | no declarada, con restricciones de uso del autor | Hugging Face, 0 descargas |
| Otros LoRAs de retrato del ecosistema ComfyUI | LoRA sobre modelo de difusión | no disponible | no aplica | no disponible | variable según autor | no disponible |
| Modelo base sin adaptador (familia F1/Flux.1) | Modelo de difusión completo | no disponible | no aplica | no disponible | variable según la variante | no disponible |

## Limitaciones y advertencias

- Licencia: no se declara una licencia formal. La model card remite a "la licencia del proyecto original o upstream", lo que deja el marco legal en un estado ambiguo y exige verificar la licencia del modelo base antes de cualquier uso.
- Restricción de uso comercial explícita: no se permite alojar el modelo ni versiones derivadas en sitios o aplicaciones que generen ingresos o soliciten donaciones. El uso comercial (servicios generativos, venta de imágenes, uso en publicaciones) requiere contactar previamente con el autor.
- Restricción sobre las imágenes generadas: no se permite vender directamente las imágenes producidas salvo que hayan sido modificadas manualmente de forma suficiente para considerarlas obra propia del usuario.
- Ausencia de benchmarks: no hay métricas objetivas de calidad, fidelidad al prompt ni diversidad, lo que impide estimar su comportamiento en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no existe validación independiente por parte de la comunidad.
- Modelo base no especificado: la referencia "F1基础 D" no identifica una versión concreta, por lo que la compatibilidad con distintas variantes de la familia puede no estar garantizada.
- Sesgos probables: el adaptador está entrenado para un nicho muy concreto (retratos femeninos con estética de red social china) y es previsible que reproduzca un canon estético estrecho, con escasa diversidad de edad, etnia, complexión o presentación de género.
- Palabra gatillo genérica: el uso de girl como trigger puede solaparse con otros adaptadores cargados simultáneamente y alterar el resultado de forma imprevisible.
- Artefactos de generación: como cualquier modelo de difusión, puede producir errores anatómicos, texto ilegible en la imagen o inconsistencias en manos y ojos; no hay datos sobre su tasa de fallo.
- Ambigüedad en la fecha: el repositorio figura creado el 2026-10-02 según los metadatos de Hugging Face, una fecha posterior a la consulta, lo que sugiere un error de registro o una publicación programada y desaconseja tratarla como referencia fiable.
- Idiomas: no se declaran idiomas soportados; los prompts en idiomas distintos del chino o el inglés podrían degradar el resultado, sin datos publicados al respecto.
- Promoción mezclada con documentación: buena parte de la model card es publicidad de servicios de terceros, por lo que conviene tratar cualquier afirmación de rendimiento como no verificada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-f.1-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-f.1-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1878349842920476674
- Página del autor: https://www.runninghub.cn/user-center/1866838547620896770
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- No se han encontrado papers, blogs técnicos ni repositorios de código asociados a este modelo. Los resultados de la búsqueda web proporcionada no contienen información relevante sobre rh-f.1-lora.
