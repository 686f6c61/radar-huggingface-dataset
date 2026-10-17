# RunningHubAI/rh-cyberrealistic-z-image-turbo-catalyst-nsfw-unet

## Resumen

rh-cyberrealistic-z-image-turbo-catalyst-nsfw-unet es un UNet de difusión text-to-image publicado por RunningHubAI en nombre del autor Katoo0. Se distribuye como un único fichero safetensors de 11.984 MiB, dentro de un repositorio de 12,6 GB, para cargarlo en ComfyUI, RunningHub o Hugging Face. Está afinado a partir de Z-image-turbo y lleva una orientación explícitamente NSFW.

El modelo no incluye una model card técnica: no se documentan número de parámetros, resolución nativa, pasos de muestreo, dataset, idiomas de prompt ni licencia. La etiqueta `not-for-all-audiences` y el nombre del fichero (`cyberrealisticZImage_v20NSFW.safetensors`) confirman el enfoque para contenido adulto y estética cyberrealista.

Su relevancia es limitada y muy específica: cubre un nicho de finetunes turbo para ComfyUI, pero la ausencia de benchmarks, licencia y adopción —0 descargas y 0 likes en el momento de la consulta— obliga a tratarlo como un artefacto experimental, no como una base lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de difusión para text-to-image (etiqueta `unet`); arquitectura interna no documentada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE; no hay datos de arquitectura) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos safetensors, sin variantes GGUF, fp8 o int8 en el repositorio |
| Idiomas soportados | no disponible; no se documenta el idioma de los prompts |
| Licencia | no disponible; copyright del autor, sujeto a la licencia del proyecto original o upstream, sin especificar |
| Formato de pesos | safetensors (`cyberrealisticZImage_v20NSFW.safetensors`, 11.984 MiB) |
| Pipeline | text-to-image |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Modelo base | Z-image-turbo |
| Uso previsto | generación de imágenes NSFW/cyberrealistas; no documentado formalmente |
| Tamaño del repositorio | 12,6 GB |
| Resolución de salida | no disponible |
| Pasos de inferencia | no disponible (variante turbo, sin configuración publicada) |

## Arquitectura y entrenamiento

No hay información técnica sobre la arquitectura interna. El repositorio identifica el artefacto como un UNET de text-to-image y lo describe como un finetune de Z-image-turbo, pero no detalla si se trata de un UNet convolucional clásico o de un transformer de difusión con nomenclatura heredada. Tampoco se especifican bloques, mecanismos de atención, text encoder, VAE, resolución de entrenamiento, tokens vistos, composición del dataset ni si se empleó RLHF, DPO o destilación. El término turbo sugiere un régimen de pocos pasos, pero no se documentan pasos, CFG ni sampler recomendados.

El único dato cuantitativo es el tamaño del fichero: 11.984 MiB. Si los pesos estuvieran en fp16, el límite superior aproximado sería de unos 6.280 millones de parámetros, pero no se confirma la precisión ni el recuento exacto, por lo que no debe tomarse como especificación. Tampoco se acreditan innovaciones como decodificación especulativa, atención lineal o destilación de pasos, habituales en la familia turbo pero ausentes de la documentación.

## Capacidades

- Generación de imágenes a partir de prompts de texto, con estética cyberrealista/realista y orientación NSFW.
- Integración en ComfyUI como UNET; también puede cargarse en RunningHub. Hugging Face solo aloja los pesos.
- Posible generación en pocos pasos por herencia de Z-image-turbo, aunque no se confirma la configuración.
- No soporta tool calling ni function calling.
- No está diseñado para agentes, razonamiento multi-paso ni planificación.
- No acepta visión como entrada, audio, vídeo ni edición de imagen documentada.
- Capacidad multilingüe: no disponible; no se especifica qué idiomas entiende el text encoder.
- Control de composición: no se documentan ControlNet, LoRA, IP-Adapter ni referencias de imagen.
- Formato de salida: imágenes; resolución y relación de aspecto no disponibles.

## Casos de uso

- Creación de contenido para plataformas de adultos con verificación de edad y moderación humana: el finetune está orientado a NSFW y puede generar imágenes de personajes adultos; debe integrarse con filtros, consentimiento y revisión previa para cumplir la ley y las políticas de la plataforma.
- Ilustración de narrativa adulta o novela gráfica: usar ComfyUI para generar variaciones de personajes y escenas con un estilo cyberrealista coherente; el formato UNET permite cargarlo en flujos existentes, aunque la consistencia entre imágenes requeriría IP-Adapter o LoRA no documentados.
- Dirección de arte y referencias visuales: generar moodboards de estética cyberrealista/realista para cine, videojuego o moda; la variante turbo permite iterar con pocos pasos si se confirma la configuración, reduciendo el coste frente a modelos de 50 pasos.
- Aumento de datos para clasificadores de contenido NSFW: generar un corpus etiquetado de imágenes explícitas en un entorno aislado para entrenar o evaluar detectores; el dominio del finetune es adecuado, pero hay que gestionar derechos, sesgos y falsos positivos.
- Pruebas de rendimiento y compatibilidad en ComfyUI: validar la carga de un UNET de casi 12 GB, el offload a CPU, la precisión fp16/fp8 y el consumo de VRAM en distintas GPUs; sirve como caso de estrés para pipelines de imagen.
- Investigación sobre finetuning de modelos turbo: comparar Z-image-turbo base con este finetune NSFW para medir deriva estética, olvido catastrófico y sesgos; requiere acceso a la base y a un conjunto de evaluación propio, ya que no hay benchmarks públicos.
- Generación de retratos y moda conceptual no explícita: si el modelo conserva capacidad SFW, puede usarse para retratos de estudio, iluminación y piel; requiere prompts negativos y curaduría porque el sesgo NSFW puede aparecer incluso con prompts neutros.
- Prototipado rápido de assets para videojuegos adultos: generar conceptos de personajes y entornos para un título +18; la licencia no disponible impide su uso comercial sin aclaración previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No se dispone de FID, CLIP score, HPSv2, GenEval ni comparaciones cuantitativas con otros modelos. Tampoco hay métricas de latencia, throughput o calidad percibida.

## Requisitos de hardware

- VRAM estimada: el UNET pesa 11.984 MiB. En fp16/bf16, la carga completa ocupa aproximadamente 12 GB solo en pesos; con overhead de runtime, text encoder y VAE, un despliegue completo en GPU requiere del orden de 14-18 GB. Con cuantización a fp8 o int8, el UNET podría bajar a 6-9 GB, y con offload secuencial podría ejecutarse en 8-12 GB, a costa de latencia. Son estimaciones, no medidas.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para carga completa; A100 o H100 para lotes; RTX 4080 (16 GB) probablemente con fp8 u offload; RTX 3060 12 GB y RTX 4060 Ti 16 GB solo con offload o cuantización.
- ¿Cabe en consumer GPU? Sí, pero no en todas: 24 GB es cómodo; 16 GB es ajustado; 12 GB requiere offload y previsiblemente aumenta la latencia.
- Opciones de despliegue: ComfyUI es la vía documentada; RunningHub también. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un UNET de difusión. El soporte en diffusers no está confirmado.
- Latencia y throughput: no disponible. La etiqueta turbo sugiere menos pasos, pero no hay segundos por imagen ni imágenes por segundo publicados.
- Almacenamiento: 12,6 GB de repositorio; hay que prever espacio adicional para VAE, text encoder y checkpoints de trabajo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| rh-cyberrealistic-z-image-turbo-catalyst-nsfw-unet | UNet text-to-image | no disponible | no aplica | no disponible | Hugging Face, RunningHub | 11.984 MiB; etiqueta NSFW; 0 descargas y 0 likes |
| rh-cyberrealistic-z-image-turbo-unet | UNet text-to-image | no disponible | no aplica | no disponible | Hugging Face | 6,54 GB; variante de la misma familia sin etiqueta NSFW explícita |
| Z-image-turbo (base) | modelo de difusión text-to-image | no disponible | no aplica | no disponible | referenciado como base | sin ficha técnica en la información |

No hay datos de rendimiento que permitan comparar calidad. La comparación se limita a disponibilidad, tamaño y orientación del finetune. No se incluyen alternativas genéricas como SDXL o Flux porque no aparecen datos verificables en la búsqueda proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: la model card indica copyright del autor y remite a la licencia del proyecto original o upstream, sin concretarla. El uso comercial queda bloqueado hasta que se aclare.
- Contenido NSFW: el repositorio está marcado como `not-for-all-audiences`. Es imprescindible verificación de edad, consentimiento, moderación y cumplimiento legal antes de cualquier despliegue.
- Riesgo de generar contenido no consentido o ilegal: no se documenta ningún filtro de seguridad. La responsabilidad recae en quien despliega el modelo.
- Sesgos desconocidos: no se detalla el dataset de entrenamiento. Es probable que el finetune herede sesgos de belleza, género, tono de piel y representación, pero no hay evaluación publicada.
- Alucinación visual y artefactos: sin benchmarks ni muestras oficiales, no se puede estimar la tasa de errores anatómicos, manos, texto o coherencia de escena.
- Idioma de prompt no documentado: no se sabe si el text encoder funciona igual de bien en castellano que en inglés.
- Configuración turbo no documentada: no se especifican pasos, CFG, sampler ni resolución. El modelo puede no funcionar directamente con los ajustes por defecto de ComfyUI.
- Compatibilidad limitada: se distribuye solo el UNET; hacen falta VAE, text encoder y un pipeline compatible. No hay garantía de funcionamiento en diffusers u otros entornos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta. No hay validación de la comunidad ni casos de producción documentados.
- Fechas del repositorio: la creación registrada aparece como 2026-10-17, un dato anómalo que conviene verificar antes de tratarlo como referencia temporal.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-cyberrealistic-z-image-turbo-catalyst-nsfw-unet
- Ficheros del repositorio: https://huggingface.co/RunningHubAI/rh-cyberrealistic-z-image-turbo-catalyst-nsfw-unet/tree/main
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2076401514952028162
- Civitai: https://civitai.red/models/2513307/cyberrealistic-z-image-turbo-catalyst
- Página del autor: https://www.runninghub.ai/user-center/2040579212557164545
- RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API en inglés: https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API en chino: https://www.runninghub.cn/runninghub-api-doc-cn/
- Modelo hermano en Hugging Face: https://huggingface.co/RunningHubAI/rh-cyberrealistic-z-image-turbo-unet
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
