# RunningHubAI/rh-krea2-2-lora

## Resumen

rh-krea2-2-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en nombre del autor RunningHub-@bkz-aigc. No es un modelo de lenguaje ni un modelo base: se trata de un peso adicional que se carga sobre el modelo de difusión krea2 para modificar su comportamiento de generación y edición imagen-texto-a-imagen. El repositorio de Hugging Face contiene un único archivo safetensors de 448 MiB (~0,5 GB de repo) y se distribuye con la etiqueta de pipeline `image-text-to-image`.

La model card es deliberadamente mínima y bilingüe (chino/inglés). La única descripción funcional aportada por el autor es «krea2-女性模型2» («modelo de mujer 2» de krea2), lo que indica que el LoRA está orientado a la representación de figuras femeninas dentro del ecosistema krea2. El adaptador está pensado para cargarse en ComfyUI, en la propia plataforma RunningHub o directamente desde Hugging Face.

Su relevancia actual es acotada y muy específica: se enmarca en la familia de LoRAs `rh-krea2-*` que RunningHub publica de forma seriada (junto a variantes como `rh-krea2-realism-slider-lora` o `rh-krea2-v3-lora`), y sigue el flujo recomendado por el propio ecosistema Krea 2 de entrenar sobre la variante Raw e inferir sobre la variante Turbo. No hay métricas, licencia explícita ni documentación de entrenamiento publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el modelo base krea2; pipeline image-text-to-image. Arquitectura interna del modelo base no especificada |
| Parámetros totales | No disponible (archivo de pesos LoRA de 448 MiB; no se declara rango, alpha ni número de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se especifica la longitud máxima de prompt del codificador de texto del modelo base) |
| Tipos de cuantización | No disponible (se distribuye únicamente en safetensors; se desconoce la precisión de los pesos, presumiblemente fp16/bf16) |
| Idiomas soportados | No disponible (el idioma del prompt depende del codificador de texto del modelo base; la model card está en chino e inglés) |
| Licencia | No disponible. La model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original (krea2) o de upstream |
| Formato de pesos | safetensors (`krea2-se2).safetensors`, 448 MiB) |
| Tipo de modelo | LoRA de edición de imagen (image edit), ajustado desde krea2 |
| Tamaño del repositorio | 0,5 GB |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHub-@bkz-aigc (publicado por RunningHubAI) |
| Descripción del autor | «krea2-女性模型2» (modelo de mujer 2 de krea2) |
| Fecha de creación | 2026-09-25 |
| Fecha de actualización | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base krea2 para desplazar su distribución de salida hacia el estilo o dominio objetivo. No se publica información sobre el rango (rank), el valor de alpha, las capas objetivo (atención cruzada, atención propia, proyecciones de texto) ni el número de pasos de entrenamiento. Tampoco se documentan los datos de entrenamiento: ni tamaño del dataset, ni composición, ni resolución, ni si hubo curación o filtrado de imágenes.

El único dato aportado sobre el modelo base es que el ajuste parte de krea2. La documentación pública del ecosistema Krea 2 para entrenamiento de LoRAs recomienda entrenar sobre la variante Raw e inferir sobre la variante Turbo con aproximadamente 8 pasos de muestreo, pero la model card de este repositorio no confirma que se haya seguido ese flujo. No hay información sobre regularización, uso de captions, técnica de entrenamiento (DreamBooth, fine-tuning de capas específicas) ni metodología de evaluación.

## Capacidades

- Edición y generación de imagen condicionada por texto (pipeline `image-text-to-image`) sobre el modelo base krea2.
- Especialización declarada por el autor en figura femenina («modelo de mujer 2»), presumiblemente para preservar o reforzar la coherencia de rasgos, rostro y anatomía en ese dominio.
- Integración como LoRA en flujos de ComfyUI, lo que permite combinarlo con otros nodos, LoRAs y pipelines del mismo grafo.
- Ejecución en la plataforma RunningHub y exposición mediante su API, además de uso local desde Hugging Face.
- Compatibilidad potencial con otras variantes de la familia `rh-krea2-*` para apilar varios adaptadores (no confirmada por el autor).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: son capacidades ajenas a este tipo de modelo.

## Casos de uso

- Edición de retratos con identidad consistente: aplicar el LoRA sobre krea2 para retocar fotografías de figura femenina (iluminación, fondo, vestuario) manteniendo los rasgos de la persona dentro de un flujo ComfyUI.
- Producción de contenido editorial y moda: generar variaciones de una misma modelo o estilo a partir de un prompt y una imagen de referencia, útil para catálogos, lookbooks o campañas que exigen coherencia visual entre piezas.
- Prototipado rápido de assets gráficos: crear bocetos y variaciones de personajes femeninos para preproducción de ilustración, cómic o videojuego antes de pasar al arte final.
- Automatización por API en RunningHub: encadenar el LoRA en un pipeline alojado y consumirlo vía API para generar imágenes bajo demanda sin mantener infraestructura GPU propia.
- Investigación comparativa de adaptadores LoRA: usar este repositorio como punto de referencia frente a otras variantes `rh-krea2-*` para medir el efecto de distintos LoRAs sobre el mismo modelo base en tareas de edición.
- Post-producción fotográfica asistida: integrar el nodo en un grafo de ComfyUI que combine upscaling, inpainting y control de pose, usando el LoRA como capa de estilo o de ajuste de sujeto.
- Generación de material para marketing en redes: producir lotes de imágenes con una estética fija aplicando el mismo LoRA y semilla, lo que reduce la variabilidad entre piezas de una misma campaña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de identidad), ni comparaciones numéricas con otros LoRAs, ni curvas de calidad frente al número de pasos o a la escala del adaptador.

## Requisitos de hardware

- El archivo LoRA ocupa 448 MiB en disco y debe cargarse junto al modelo base krea2; el requisito real de VRAM lo determina el modelo base, no el adaptador.
- No se dispone de cifras oficiales de VRAM para krea2 en esta información, por lo que no se puede indicar una recomendación de GPU concreta (A100, H100, RTX 4090, etc.) sin inventar datos.
- Como referencia general del ecosistema de difusión de imagen (no confirmada para este modelo), los pesos en precisión completa suelen requerir GPUs de 16-24 GB o superiores, mientras que las versiones cuantizadas en 8 bits o GGUF pueden caber en GPUs de consumo de 6-12 GB; verifíquese con la documentación de krea2 antes de planificar un despliegue.
- Opciones de despliegue documentadas por el autor: ComfyUI (local), plataforma RunningHub y uso de la API de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamaño de pesos | Especialización declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-krea2-2-lora | LoRA de edición de imagen | krea2 | 448 MiB (safetensors) | Figura femenina («modelo de mujer 2») | No disponible; copyright del autor, remisión a la licencia upstream | Hugging Face, ComfyUI, RunningHub |
| rh-krea2-realism-slider-lora | LoRA | krea2 | No disponible | Control deslizante de realismo | No disponible | Hugging Face |
| rh-krea2-v3-lora | LoRA | krea2 | No disponible | No especificada | No disponible | Hugging Face, ComfyUI |
| krea2 (base) | Modelo de difusión imagen-texto-a-imagen | — | No disponible | Generación y edición de imagen general | La del proyecto original | RunningHub y otros canales del proyecto |

La información pública de las variantes comparadas es igual de escasa (model cards mínimas, sin métricas ni licencia explícita), por lo que la comparación se limita al tipo de artefacto, el modelo base compartido y la especialización declarada.

## Limitaciones y advertencias

- No se especifica licencia. La model card remite al proyecto original y mantiene el copyright en el autor, por lo que el uso comercial no está garantizado sin consultar la licencia de krea2 y contactar con el autor.
- Sin model card detallada: no hay información sobre dataset, número de pasos de entrenamiento, rango del LoRA, hiperparámetros ni metodología de evaluación, lo que impide reproducir el ajuste.
- Sesgo de dominio evidente: el autor describe el LoRA como orientado a figura femenina, por lo que su comportamiento en otros sujetos, estilos o composiciones puede degradarse respecto al modelo base.
- Riesgo de sobreajuste y de pérdida de diversidad: al ser un LoRA de estilo o sujeto, puede homogeneizar las salidas y reducir la variabilidad de las generaciones.
- Riesgo de artefactos y alucinación visual inherente a los modelos de difusión (anatomías incorrectas, manos deformadas, texto ilegible, incoherencias de fondo), agravado por la falta de métricas publicadas.
- Nombre de archivo malformado en el repositorio (`krea2-se2).safetensors`), con un paréntesis sin abrir; puede romper scripts de descarga o pipelines automatizados que esperen una nomenclatura estándar.
- Cero descargas y cero likes en el momento de la consulta: no existe validación comunitaria ni reportes de uso en producción.
- Sin información sobre la longitud máxima de prompt, resolución nativa, pasos de muestreo recomendados ni escalas de aplicación del LoRA para el modelo base krea2.
- Fechas de creación y actualización idénticas (2026-09-25), con un intervalo de aproximadamente un minuto entre ambas: el repositorio no ha recibido revisiones posteriores documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-2-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2094580392941965313
- Página del autor: https://www.runninghub.ai/user-center/2081368440418824193
- RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Catálogo de modelos de RunningHub: https://www.runninghub.ai/models
- LoRA hermano `rh-krea2-realism-slider-lora`: https://huggingface.co/RunningHubAI/rh-krea2-realism-slider-lora
- LoRA hermano `rh-krea2-v3-lora`: https://huggingface.co/RunningHubAI/rh-krea2-v3-lora
- Guía de entrenamiento de LoRA para Krea 2 (Raw a Turbo): https://krea2ai.com/blog/krea-2-lora-training
