# RunningHubAI/rh-lw2.0-lora

## Resumen

rh-lw2.0-lora es un adaptador LoRA de edición de imagen publicado por RunningHub (RunningHubAI) a través de la cuenta de su autor, identificado como @Hyuuga. El adaptador está afinado a partir del modelo base krea2 y su única finalidad declarada es aplicar una estética concreta de retrato, activada mediante la palabra clave en chino "可爱甜妹" ("chica dulce y adorable"). No se trata de un modelo generativo completo, sino de un fichero de pesos adicional que debe cargarse sobre el modelo base dentro de un flujo de trabajo compatible.

El repositorio contiene un único fichero, `LW2.0  KREA2.safetensors`, de 224 MiB, etiquetado como pipeline de tipo `image-text-to-image`. Esto lo sitúa en la categoría de adaptadores para edición de imagen guiada por texto, pensados para ejecutarse en ComfyUI, en la plataforma RunningHub o en Hugging Face. El tamaño del repositorio es de 0,2 GB y, en el momento de la consulta, acumula 0 descargas y 0 "likes", por lo que se trata de una publicación reciente y sin tracción comunitaria registrada.

La relevancia de esta ficha es acotada: al no publicarse especificaciones del modelo base, ni resultados de benchmarks, ni condiciones de licencia explícitas, la evaluación se limita a los metadatos disponibles. Cualquier decisión de uso en producción requiere verificar de forma independiente la licencia del modelo krea2 subyacente y las condiciones de la plataforma RunningHub.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base krea2; no se especifica la arquitectura del base) |
| Parametros totales | no disponible (el repositorio solo contiene pesos de adaptador; fichero de 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el fichero se distribuye en formato safetensors; no se detalla la precisión) |
| Idiomas soportados | no disponible (la palabra de activación está en chino: 可爱甜妹) |
| Licencia | no disponible (la model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original o del upstream) |
| Formato de pesos | safetensors (`LW2.0  KREA2.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura del adaptador ni la del modelo base krea2. Por el tipo declarado (`LoRA`, `image edit`, pipeline `image-text-to-image`) y por el formato del artefacto, se trata de un conjunto de matrices de bajo rango que se inyectan sobre un modelo de difusión preentrenado para modificar su comportamiento generativo. No se especifica en qué capas se aplican los adaptadores, cuál es el rango utilizado, ni la dimensión de los módulos LoRA.

Tampoco se aportan datos sobre el proceso de entrenamiento: no hay número de pasos, tamaño o composición del dataset, resolución de entrenamiento, uso de técnicas de regularización, ni si hubo etapas de ajuste por preferencias. La model card únicamente indica que el modelo está afinado desde krea2, que la palabra de activación es "可爱甜妹" y que el entrenamiento puede haberse realizado con las herramientas de RunningHub, que la propia plataforma promociona. Cualquier afirmación adicional sobre el procedimiento de entrenamiento sería especulativa.

## Capacidades

- Edición de imagen guiada por texto: el pipeline declarado es `image-text-to-image`, lo que implica la capacidad de transformar una imagen de entrada a partir de una instrucción textual.
- Aplicación de una estética concreta de retrato mediante la palabra de activación "可爱甜妹", orientada a un estilo de "chica dulce y adorable".
- Integración como adaptador en flujos de ComfyUI, según la etiqueta `comfyui` del repositorio.
- Ejecución en la plataforma RunningHub, tanto en su modalidad de interfaz como mediante API.
- Carga sobre el modelo base krea2, del que hereda las capacidades de generación y edición que este soporte.
- No se declara soporte de tool calling, de agentes, de razonamiento multi-paso, de visión a nivel de comprensión, ni de audio.
- El soporte multilingüe no está documentado; la única evidencia disponible es una palabra de activación en chino.

## Casos de uso

- Estilización de retratos en ComfyUI: el adaptador se carga en un flujo de trabajo de ComfyUI sobre krea2 y se activa con la palabra clave para aplicar de forma consistente una estética de retrato concreta a imágenes de entrada, útil para mantener coherencia visual en una serie de ilustraciones.
- Edición por lotes de imágenes de producto o personaje: al ser un fichero safetensors de 224 MiB, puede incorporarse a un nodo LoRA dentro de un grafo de ComfyUI y aplicarse de forma repetida sobre un conjunto de imágenes sin reentrenar nada.
- Prototipado rápido de assets para redes sociales: para equipos que necesitan variaciones de retrato con una estética determinada, el adaptador permite generar alternativas sin construir un pipeline de fine-tuning propio.
- Automatización vía API de RunningHub: la plataforma ofrece documentación de API, de modo que el flujo con este LoRA puede invocarse desde un servicio externo para encadenar generación y postproceso de forma programática.
- Investigación comparativa sobre adaptadores LoRA: sirve como caso de estudio de un adaptador de bajo rango aplicado a edición de imagen, útil para comparar metodologías de entrenamiento o para analizar cómo una palabra de activación en chino condiciona los resultados en modelos entrenados mayoritariamente con prompts en inglés.
- Preselección de estilos para producción editorial: para evaluar si una dirección de arte concreta encaja antes de invertir en un dataset propio, el adaptador permite validar el estilo con una inversión de recursos mínima.

En todos los casos, la idoneidad real depende de capacidades del modelo base krea2 que no están documentadas en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de ningún tipo (FID, CLIP score, similitud con la imagen de origen, evaluaciones humanas ni comparaciones con otros adaptadores), y tampoco se documentan tiempos de inferencia o consumo de recursos.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB y el fichero de pesos del adaptador pesa 224 MiB, por lo que el almacenamiento necesario para el LoRA en sí es mínimo.
- La VRAM necesaria para la inferencia no está documentada y depende por completo del modelo base krea2, de la resolución de trabajo y del resto de nodos del grafo de ComfyUI; no se puede estimar con los datos disponibles.
- No se especifican GPU recomendadas ni mínimas.
- No hay información sobre si el conjunto base más adaptador cabe en GPU de consumo; el único dato objetivo es que el adaptador añade un sobrecoste de memoria pequeño en relación con el modelo base.
- Opciones de despliegue declaradas: ComfyUI, la plataforma RunningHub (interfaz web y API) y carga desde Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un adaptador de difusión de imagen.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye adaptadores LoRA alternativos, ni versiones anteriores del mismo autor, ni métricas que permitan una comparación objetiva. La única referencia interna es el propio modelo base krea2, del que este repositorio es un complemento y no un sustituto. Cualquier tabla comparativa requeriría datos de rendimiento que no se han publicado.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluaciones cualitativas publicadas, por lo que no es posible verificar la calidad del adaptador antes de usarlo.
- La licencia no está definida de forma explícita: la model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original o del upstream. Antes de cualquier uso comercial es imprescindible aclarar la licencia del modelo base krea2 y las condiciones de uso de la plataforma.
- El repositorio registra 0 descargas y 0 "likes", sin comunidad ni histórico de incidencias; no hay evidencia de terceros sobre su funcionamiento.
- La palabra de activación está en chino ("可爱甜妹"), lo que puede degradar la eficacia del adaptador si el resto del prompt se redacta en otros idiomas, un comportamiento habitual en modelos entrenados con textos mayoritariamente en inglés.
- No se documentan sesgos conocidos, pero un adaptador orientado a un ideal estético concreto de retrato puede reproducir sesgos de representación presentes en los datos de entrenamiento del modelo base.
- No se describe el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de sobreajuste a un conjunto reducido de imágenes ni la posible reproducción de material protegido.
- No hay información sobre el comportamiento del adaptador en resoluciones distintas de las usadas durante el entrenamiento, ni sobre su interacción con otros LoRA cargados simultáneamente.
- Al ser un adaptador y no un modelo completo, su funcionamiento depende de la disponibilidad y de la versión concreta del modelo base krea2; un cambio de versión del base puede alterar los resultados.
- No se especifican requisitos mínimos de hardware ni versiones compatibles de ComfyUI, lo que añade incertidumbre a la puesta en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-lw2.0-lora
- Model card en chino (referenciada en el README): README_cn.md, dentro del repositorio de Hugging Face
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2095667881282457602
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/2092052474365304834
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
