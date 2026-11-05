# RunningHubAI/rh-foot-licking-lora

## Resumen

`rh-foot-licking-lora` es un adaptador LoRA para edición de imágenes mediante prompts de texto, publicado por la organización RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de pesos de ajuste fino (436 MiB en un único archivo `footworship_krea_2400.safetensors`) que se aplica sobre una base derivada de Krea 2 para inducir un estilo visual muy concreto: representaciones de pies y de la acción de lamer pies, según indica el nombre del repositorio y la referencia a la página original en Civitai.

El modelo está etiquetado con el pipeline `image-text-to-image` y con las etiquetas `comfyui`, `lora` e `image-text-to-image`, lo que sitúa su uso previsto en flujos de generación y edición de imágenes en ComfyUI o en la plataforma RunningHub. La información pública es mínima: no hay datos sobre el proceso de entrenamiento, número de pasos, dataset, hiperparámetros ni resultados de evaluación. La ficha refleja por tanto un perfil de artefacto comunitario de nicho, no de modelo de propósito general.

Su relevancia actual es limitada fuera del ecosistema de generación de imágenes para adultos o de contenido fetichista. Para desarrolladores e investigadores resulta útil sobre todo como ejemplo de adaptador LoRA de bajo peso distribuido a través de plataformas de inferencia gestionada, y como caso de estudio de las lagunas de documentación y licencia que presentan muchos artefactos de este tipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base derivado de Krea 2; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (el repo ocupa 0,5 GB; el archivo de pesos 436 MiB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts se procesan en el modelo base; no se documenta) |
| Licencia | no disponible; la model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`footworship_krea_2400.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es «krea2», presumiblemente una variante de la familia Krea 2 de generación de imágenes, aunque la model card no especifica la arquitectura subyacente (difusión, transformer de difusión u otra), el número de parámetros del base ni la resolución nativa de entrenamiento.

No se publica información sobre el dataset de entrenamiento, el número de imágenes, los pasos de entrenamiento, la tasa de aprendizaje ni si se emplearon técnicas como regularización por captions o balanceo de conceptos. El nombre del archivo (`footworship_krea_2400`) sugiere 2400 pasos de entrenamiento, pero es una inferencia a partir del nombre y no un dato confirmado. Tampoco hay información sobre evaluación cualitativa, curvas de pérdida ni comparaciones con otros LoRA del mismo nicho.

## Capacidades

- Generación y edición de imágenes condicionada por texto a través del pipeline `image-text-to-image`.
- Inducción de un concepto visual específico (pies y acción de lamer pies) sobre el modelo base Krea 2.
- Integración en flujos de ComfyUI mediante el nodo de carga de LoRA.
- Ejecución en la plataforma gestionada RunningHub, que ofrece API y despliegue online.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, por tratarse de un adaptador de imagen.
- Capacidades multilingües: no documentadas; dependen del codificador de texto del modelo base.

## Casos de uso

- Exploración artística de nicho: el LoRA permite generar imágenes con una estética concreta dentro de flujos de ComfyUI, útil para ilustradores que trabajen contenido fetichista o de culto al pie de forma controlada.
- Prototipado rápido en RunningHub: al estar alojado en la plataforma, se puede invocar vía API para probar variaciones de prompt sin montar infraestructura propia.
- Investigación sobre LoRA de bajo rango: con 436 MiB, sirve como caso de estudio de cómo un adaptador pequeño modifica un concepto en un modelo de difusión.
- Pruebas de pipelines image-text-to-image: útil para validar la integración de LoRA en ComfyUI y en la API de RunningHub antes de pasar a producción.
- Generación de material para comunidades de nicho: el adaptador está pensado para un público específico y puede alimentar galerías o bots de contenido para adultos con las salvaguardas adecuadas.
- Auditoría de artefactos comunitarios: como ejemplo de model card incompleta y licencia ambigua, sirve para formar a equipos en la evaluación de riesgos de modelos descargados de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA aislado; depende del modelo base Krea 2, que no se especifica. Como referencia, un LoRA de 436 MiB añade un overhead mínimo frente al base.
- GPU recomendadas: no disponible. Al no documentarse el modelo base, no se puede determinar si requiere A100, H100, RTX 4090 o GPUs de gama media.
- ¿Cabe en GPU de consumo? No disponible; depende enteramente del modelo base sobre el que se aplique.
- Opciones de despliegue: ComfyUI (formato nativo del LoRA), plataforma RunningHub (online y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a adaptadores de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (LoRA de edición de imagen para el mismo concepto) con parámetros, contexto, rendimiento y licencia documentados.

## Limitaciones y advertencias

- Contenido sensible: el adaptador está orientado a representaciones fetichistas (pies y lamer pies); su uso en productos públicos requiere filtros y políticas de contenido explícitas.
- Licencia no disponible: la model card remite a la licencia del proyecto original (Civitai) y afirma que los derechos pertenecen al autor; no hay una licencia clara para uso comercial, lo que impide recomendarlo en producción sin aclaración legal.
- Documentación mínima: sin datos de entrenamiento, evaluación ni limitaciones declaradas por el autor.
- Dependencia del modelo base: el comportamiento final depende de Krea 2, cuyas especificaciones y licencia tampoco se detallan en el repositorio.
- Riesgo de sobreajuste al concepto: los LoRA de nicho suelen degradar la diversidad y la calidad cuando se combinan con otros estilos o se usan fuera de su dominio.
- Idiomas y prompts: no se documenta qué codificador de texto emplea el base ni su cobertura lingüística.
- Sin métricas de calidad: no hay forma objetiva de comparar su rendimiento con alternativas.
- Procedencia: el repositorio redistribuye pesos de un modelo publicado en Civitai; conviene verificar la cadena de derechos antes de reutilizarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-foot-licking-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2083687926306705409
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Referencia original en Civitai: https://civitai.red/models/2826785/foot-worship-krea-2?modelVersionId=3189249
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
