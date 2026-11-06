# RunningHubAI/rh-zimage-base-v1-luna-lora

## Resumen

`rh-zimage-base-v1-luna-lora` es un adaptador LoRA de texto a imagen publicado por RunningHubAI, la plataforma de alojamiento y entrenamiento de modelos del ecosistema ComfyUI. El modelo ha sido ajustado a partir de la base `Z-image-base` y su función es incorporar un personaje concreto —denominado "泠月 luna" (Lingyue Luna), descrito en la model card como "冷艳小姐姐", una joven elegante y de presencia serena— a las generaciones de imagen que usen esa base como punto de partida. La autoría del LoRA se atribuye al usuario de RunningHub @嘉丽有图, en colaboración con "老胡用ai画梦".

Se trata, por tanto, de un artefacto de personalización de un modelo de difusión para texto a imagen, no de un modelo de lenguaje ni de un modelo fundacional. El repositorio solo contiene el archivo de pesos del adaptador (`lunav2_24.safetensors`, 76 MiB) y no incluye la base sobre la que se aplica, que debe obtenerse por separado. El repositorio ocupa 0,1 GB y no registra descargas ni "likes" en el momento de la consulta.

Su relevancia es acotada: resulta útil para quien ya trabaje con la familia Z-image en ComfyUI y quiera reproducir un personaje concreto con consistencia facial, pero no aporta información sobre arquitectura, datos de entrenamiento ni evaluación, y su licencia no está especificada. La ficha refleja esa escasez de datos de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base de difusión `Z-image-base` (text-to-image); arquitectura interna del base no disponible |
| Parámetros totales | no disponible (el adaptador pesa 76 MiB en safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución y pasos no disponibles |
| Tipos de cuantización | no disponible; se distribuye en safetensors (probablemente fp16/bf16, no confirmado) |
| Idiomas soportados | no disponible; los prompts de la model card están en chino |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`lunav2_24.safetensors`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base `Z-image-base` ni sobre el proceso de entrenamiento del adaptador. Por la naturaleza del artefacto (un LoRA de 76 MiB para texto a imagen en ComfyUI), cabe inferir que se trata de un conjunto de matrices de bajo rango inyectadas en las capas de atención del modelo de difusión base, pero el repositorio no detalla en qué módulos se aplican, con qué rango, ni con qué dataset o hiperparámetros se entrenó.

La model card únicamente indica que el LoRA se ha ajustado desde `Z-image-base`, que la palabra de activación es `lingyueluna` y que el entrenamiento puede reproducirse o realizarse en la plataforma RunningHub. No hay información sobre número de imágenes de entrenamiento, resolución, técnica de regularización, uso de captions automáticos ni sobre si se empleó algún método de destilación o aceleración (por ejemplo, variantes turbo del base). Tampoco se documenta ninguna innovación técnica.

## Capacidades

- Generación de imágenes de un personaje concreto ("Lingyue Luna") condicionada por la palabra de activación `lingyueluna`.
- Personalización de estilo y rasgos faciales sobre el modelo base Z-image-base, orientada a mantener consistencia de identidad entre generaciones.
- Integración en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Ejecución en la plataforma RunningHub, tanto en la nube como mediante su API.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; son capacidades ajenas al tipo de modelo.
- Capacidades multilingües de prompt: no documentadas; los ejemplos disponibles están en chino.

## Casos de uso

- Producción de retratos de personaje consistente: cargando el LoRA en ComfyUI junto a Z-image-base y usando `lingyueluna` en el prompt, se obtienen variaciones del mismo personaje para ilustración editorial o narrativa visual.
- Creación de series de ilustración para redes sociales: permite generar un conjunto coherente de imágenes de un mismo personaje con distintos encuadres y vestuario, reduciendo el trabajo manual de retoque de identidad.
- Prototipado de personajes para cómic o novela ligera: el LoRA sirve para explorar el diseño del personaje antes de encargar arte final, con la ventaja de que el adaptador es ligero (76 MiB) y se intercambia rápidamente.
- Pruebas de concepto en pipelines de generación por API: a través de la API de RunningHub se puede invocar el flujo con el LoRA para generar imágenes bajo demanda sin gestionar infraestructura propia.
- Aumento de datasets de rostro sintético: útil para generar caras de un personaje ficticio con variabilidad controlada en proyectos de investigación que necesiten datos no reales.
- Demostraciones y tutoriales de entrenamiento de LoRA: al estar publicados los pesos y la palabra de activación, sirve como ejemplo práctico de cómo se estructura y se usa un adaptador de personaje en el ecosistema ComfyUI/RunningHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el conjunto base + LoRA; el adaptador por sí solo ocupa 76 MiB y su carga añade un coste marginal sobre el modelo base.
- GPU recomendadas: no disponibles; dependerán enteramente de los requisitos de Z-image-base, que no se documentan en este repositorio.
- Compatibilidad con GPU de consumo: no confirmada; no se puede afirmar que quepa en una RTX 4090 u otras tarjetas consumer sin conocer el base.
- Opciones de despliegue: ComfyUI (plataforma indicada por los tags), RunningHub (nube y API) y, presumiblemente, cualquier runtime que cargue safetensors de difusión, si bien no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas, por otra parte, orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Palabra de activación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zimage-base-v1-luna-lora | LoRA de personaje | Z-image-base | `lingyueluna` | no disponible | Hugging Face / RunningHub |
| rh-z-image-base-lora | LoRA (text-to-image) | Z-image-base (presumiblemente) | no disponible | no disponible | Hugging Face |
| rh-z-imagebase-lora | LoRA (text-to-image) | Z-image-base (presumiblemente) | no disponible | no disponible | Hugging Face |
| Luna Ai Model (ZImageTurbo) V1 | LoRA de personaje | ZImageTurbo | no disponible | no disponible (Civitai) | Civitai |

No se dispone de datos de rendimiento, tamaño de dataset ni parámetros de entrenamiento de ninguno de los comparables, por lo que la comparación se limita a tipo de artefacto, base y canal de distribución. Los dos repositorios de RunningHubAI parecen variantes del mismo tipo de adaptador sobre la misma familia base; el modelo de Civitai emplea una base turbo distinta, lo que afectaría a los pasos de muestreo necesarios.

## Limitaciones y advertencias

- No se especifica licencia: la model card remite a la del proyecto original o upstream, lo que impide determinar con certeza si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- No hay información sobre la licencia de Z-image-base, de la que dependen los derechos de uso del conjunto.
- El LoRA está entrenado para un personaje concreto; su uso fuera de ese dominio (otros estilos, otras identidades) puede degradar la calidad o introducir el personaje de forma no deseada.
- Riesgo de sobreajuste al dataset de entrenamiento: no se documenta regularización ni número de imágenes, por lo que la variedad de poses, iluminación y vestuario puede ser limitada.
- Posibles sesgos en la representación del personaje (edad, etnia, canon de belleza) derivados del dataset no documentado; la descripción del personaje como "joven elegante" sugiere un sesgo estético concreto.
- No hay evaluación cuantitativa ni ejemplos de salida en el repositorio, lo que dificulta anticipar la fidelidad del personaje.
- El repositorio no incluye el modelo base; sin él, el adaptador es inutilizable.
- Ausencia total de descargas y "likes" en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La model card está mayoritariamente en chino y contiene enlaces promocionales de la plataforma; la documentación técnica es mínima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-base-v1-luna-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2042765263334023169
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1981280473387245569
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- LoRA relacionado: https://huggingface.co/RunningHubAI/rh-z-image-base-lora
- LoRA relacionado: https://huggingface.co/RunningHubAI/rh-z-imagebase-lora
- Modelo comparable en Civitai (Luna Ai Model, ZImageTurbo): https://civitai.com/models/2308010/luna-ai-model-zimageturbo
