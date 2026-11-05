# RunningHubAI/rh-zit-h10-lora

## Resumen

`rh-zit-h10-lora` es un adaptador LoRA de generación de imágenes a partir de texto (text-to-image) publicado por RunningHubAI, una plataforma comercial de alojamiento de flujos ComfyUI. El adaptador se presenta como un ajuste fino (fine-tune) del modelo base Z-image-turbo y está pensado para cargarse dentro de ComfyUI o en la propia plataforma RunningHub, no como un modelo autónomo. El repositorio de Hugging Face contiene únicamente los pesos del adaptador (~162 MiB por fichero, 0,3 GB de repo), sin model card técnica detallada ni resultados de evaluación.

El modelo no es un LLM ni un modelo multimodal general: es un LoRA de difusión para estilización o personalización de la generación de imágenes. Por tanto, las métricas habituales de esta ficha (parámetros totales, longitud de contexto, benchmarks de razonamiento o código) no aplican y se marcan como no disponibles. Su relevancia es limitada y práctica: sirve como ejemplo de distribución de LoRAs de la comunidad dentro del ecosistema ComfyUI y de la economía de puntos de RunningHub.

La información publicada es escasa: no hay licencia explícita, no se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni idiomas. Cualquier uso en producción exige verificar la licencia del modelo base (Z-image-turbo) y del propio adaptador antes de desplegarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión (fine-tune de Z-image-turbo); arquitectura del base no disponible |
| Parámetros totales | no disponible (pesos LoRA de ~162 MiB por fichero) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-image); longitud de prompt no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (prompts presumiblemente en inglés y chino, sin confirmación) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (LoRA) |
| Pipeline | text-to-image |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,3 GB |
| Ficheros | `ZIT- 玩具 -红鸭子H国分馆第10号.safetensors` (162 MiB), `ZImage-lora-4416.safetensors` (162 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención (y posiblemente en las proyecciones de las capas cruzadas texto-imagen) de un modelo de difusión base. El modelo base declarado es Z-image-turbo, del que no se proporcionan detalles arquitectónicos (número de parámetros, tipo de VAE, text encoder, resolución nativa ni scheduler). No se documenta el rango del LoRA, el alpha, la tasa de aprendizaje, el número de pasos ni el tamaño del dataset de entrenamiento.

No hay información sobre el proceso de entrenamiento: ni composición del dataset, ni número de imágenes, ni si se usaron técnicas de regularización o captions automáticos. Los nombres de los ficheros (en chino, con referencia a un "patito rojo" y a un número de catálogo) sugieren un LoRA de estilo o de personaje concreto, probablemente entrenado por un usuario de la comunidad y distribuido a través de RunningHub. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal ni destilación de pasos.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, condicionada por el estilo o concepto aprendido en el LoRA.
- Integración en flujos ComfyUI mediante el nodo de carga de LoRA estándar.
- Ejecución en la plataforma RunningHub, con API disponible para invocación remota.
- Compatibilidad con el modelo base Z-image-turbo, presumiblemente con sus mismos modos de muestreo y resoluciones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingües de prompt: no documentadas.
- No dispone de modo "thinking", visión, audio ni otras capacidades multimodales más allá de la propia generación de imagen.

## Casos de uso

- Estilización de ilustraciones en ComfyUI: cargar el LoRA junto a Z-image-turbo para aplicar el estilo aprendido a nuevas composiciones, útil para artistas que quieran mantener coherencia visual en series de imágenes.
- Prototipado rápido de conceptos visuales: generar variaciones de un personaje u objeto concreto para presentaciones o moodboards, aprovechando la ligereza del adaptador (162 MiB) frente a un fine-tune completo.
- Integración en pipelines de generación por lotes vía API de RunningHub: automatizar la creación de imágenes con un estilo fijo para catálogos, banners o contenido para redes, sin gestionar infraestructura GPU propia.
- Personalización de marca: si el LoRA captura un estilo gráfico concreto, puede emplearse para generar material promocional coherente con la identidad visual de un proyecto, previa verificación de licencia.
- Experimentación académica sobre LoRAs: servir como caso de estudio de adaptadores de bajo rango distribuidos en repositorios comunitarios, comparando su comportamiento con el modelo base sin adaptador.
- Docencia y talleres de ComfyUI: ejemplo práctico de carga de LoRA, ajuste de pesos y combinación con otros nodos para enseñar el flujo de trabajo de difusión.
- Generación de assets para videojuegos o cómics indie: creación de variaciones de personajes secundarios o elementos decorativos con un estilo consistente, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base Z-image-turbo; el LoRA añade un sobrecoste mínimo (~162 MiB de pesos). No disponible la cifra concreta del base.
- GPU recomendadas: no disponibles para el modelo base; en general, los modelos de difusión turbo suelen requerir GPUs con al menos 8-12 GB de VRAM para resoluciones medias, pero esta cifra no está confirmada para Z-image-turbo.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base.
- Opciones de despliegue: ComfyUI (nativo), plataforma RunningHub (alojado) y API de RunningHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para LLMs y no aplican a difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zit-h10-lora | LoRA sobre Z-image-turbo | no disponible | no aplica | no disponible | Hugging Face, RunningHub |
| LoRAs de la comunidad para Stable Diffusion / SDXL | LoRA sobre SD/SDXL | variable (típicamente 10-200 MiB) | no aplica | variable según autor | Civitai, Hugging Face |
| LoRAs para Flux.1 | LoRA sobre Flux | variable | no aplica | variable (a menudo no comercial) | Hugging Face, Black Forest Labs |
| Z-image-turbo (base) | Modelo de difusión completo | no disponible | no aplica | no disponible | Hugging Face / RunningHub |

La comparación es cualitativa: no hay datos de rendimiento publicados para este adaptador, y los LoRAs de la comunidad no se evalúan con benchmarks estandarizados. La diferencia principal frente a otros LoRAs es su integración con la plataforma RunningHub y su base Z-image-turbo, menos extendida que SDXL o Flux.

## Limitaciones y advertencias

- Licencia no especificada: la model card remite a la licencia del proyecto original o upstream; es imprescindible verificar la licencia de Z-image-turbo antes de cualquier uso comercial.
- Ausencia total de documentación técnica: sin datos de entrenamiento, hiperparámetros ni evaluación, lo que impide reproducir el ajuste o estimar su calidad de forma objetiva.
- Sesgos desconocidos: al no documentarse el dataset, no se puede evaluar el sesgo de representación (género, etnia, estilo) ni el riesgo de amplificar estereotipos presentes en el modelo base.
- Riesgo de sobreajuste al concepto entrenado: los LoRAs de estilo o personaje suelen degradar la diversidad de las generaciones y pueden producir artefactos cuando se combinan con prompts alejados del dominio de entrenamiento.
- Dependencia del modelo base: el comportamiento, la resolución y los requisitos de hardware vienen determinados por Z-image-turbo, cuyas especificaciones no se detallan.
- Idiomas de prompt no confirmados: los nombres de fichero en chino sugieren un uso principal en ese idioma, pero no hay garantía de soporte multilingüe.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria, lo que aumenta el riesgo de que los pesos no funcionen como se espera o estén incompletos.
- Contenido promocional en la model card: buena parte del README es publicidad de RunningHub y de su API, no documentación técnica; conviene tratarlo con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-zit-h10-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112511154529890305
- Página del autor: https://www.runninghub.ai/user-center/2027638706101559298
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-zit-h10-lora/blob/main/README_cn.md
