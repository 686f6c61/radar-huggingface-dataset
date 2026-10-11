# RunningHubAI/rh-krea2-turbo-yangmi-v2-lora

## Resumen

rh-krea2-turbo-yangmi-v2-lora es un adaptador LoRA de edición/generación de imagen publicada por RunningHubAI, entrenado sobre el modelo base Krea 2 Turbo. No es un modelo de lenguaje ni un modelo fundacional completo: se trata de un fichero de pesos de bajo rango (218 MiB) que modifica el comportamiento del modelo base para especializarlo en retratos con la identidad de la figura pública Yang Mi, activada mediante la palabra clave de disparo "yangmi". El problema que resuelve es acotado: permitir a artistas y flujos de trabajo de ComfyUI reproducir de forma consistente un rostro concreto sin reentrenar el modelo completo.

El repositorio está orientado a ComfyUI y a la plataforma RunningHub (tanto en su vertiente internacional como en la china), con etiquetas que lo sitúan en el pipeline image-text-to-image. La model card es mínima: no documenta composición del dataset, hiperparámetros de entrenamiento, rango del LoRA ni métricas de calidad. El nombre del fichero de pesos, `Krea2-Yangmi-Turbo-V1_000003500.safetensors`, sugiere un guardado en el paso 3500 de entrenamiento.

Es relevante ahora porque Krea 2 es una familia de modelos de difusión de pesos abiertos con codificador de texto multimodal Qwen3-VL-4B, y este LoRA ejemplifica el patrón de personalización ligera sobre modelos base grandes que domina los flujos de producción con ComfyUI. No obstante, con 0 descargas y 0 me gusta en el momento de la consulta, se trata de un artefacto recién publicado y sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Krea 2 Turbo; no disponible el rango, alpha ni módulos objetivo |
| Parametros totales | No disponible (adaptador LoRA; el fichero de pesos ocupa 218 MiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen); el modelo base Krea 2 usa codificador de texto Qwen3-VL-4B segun fuentes externas |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors; las cuantizaciones dependen del modelo base y del runtime) |
| Idiomas soportados | No disponible (las indicaciones de texto dependen del codificador del modelo base) |
| Licencia | No disponible; la model card indica que los derechos permanecen con el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`Krea2-Yangmi-Turbo-V1_000003500.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una técnica de ajuste eficiente que congela el modelo base e inyecta matrices de bajo rango en capas seleccionadas del mismo. La model card indica "Finetuned from: krea2", de modo que el LoRA se aplica sobre Krea 2 Turbo, un modelo de difusión de generación de imagen a partir de texto. Según fuentes externas, Krea 2 incorpora codificación de texto multimodal nativa basada en Qwen3-VL-4B y soporte de mejora de prompt. La información proporcionada no detalla sobre qué componentes concretos (atención cruzada, bloques de atención, etc.) se han insertado las matrices del LoRA.

No se dispone de datos sobre el volumen del dataset de entrenamiento, la composición de las imágenes, la resolución de entrenamiento, la tasa de aprendizaje, el número de pasos totales, el rango del LoRA ni si se emplearon técnicas de regularización o de captioning automático. El nombre del fichero (`_000003500`) sugiere que los pesos corresponden al punto de control del paso 3500, pero esto es una inferencia del nombre, no un dato confirmado en la documentación. No se menciona ningún proceso de RLHF, DPO ni preferencias humanas, lo cual es coherente con un LoRA de estilo/identidad en el ámbito de la difusión.

## Capacidades

- Generación y edición de imagen a partir de texto e imagen (pipeline image-text-to-image), integrada en flujos de ComfyUI.
- Personalización de identidad: reproduce el rostro de Yang Mi cuando se incluye la palabra de disparo "yangmi" en la indicación.
- Especialización de estilo fotográfico orientada a retrato.
- Compatibilidad con la plataforma RunningHub y con el ecosistema de nodos de ComfyUI.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas ni código, ya que no es un modelo de lenguaje.
- No se documentan capacidades de vídeo, audio ni thinking mode.
- Capacidades multilingües: no disponibles (dependen del codificador de texto del modelo base).

## Casos de uso

- Retrato de personaje consistente para ilustración: un artista introduce "yangmi" junto al prompt de escena y obtiene variaciones del rostro con coherencia entre generaciones, útil para series de ilustraciones con el mismo personaje.
- Producción de storyboards y cómics: el LoRA permite mantener la identidad del personaje a lo largo de viñetas generadas en sesiones distintas de ComfyUI, reduciendo el retrabajo manual de rostros.
- Prototipado de arte conceptual para cine o videojuegos: se generan bocetos de personajes con una cara de referencia estable antes de pasar a modelado 3D o pintura final.
- Contenido para redes sociales y creadores: generación rápida de imágenes temáticas con una figura reconocible dentro de un flujo ComfyUI ya montado.
- Pruebas de estilo y composición (style exploration): combinado con otros LoRA y con el prompt enhancement del modelo base, sirve para explorar variaciones de iluminación, vestuario y encuadre sobre una identidad fija.
- Automatización por API en RunningHub: al estar publicado en la plataforma, puede invocarse mediante su API para generar lotes de imágenes de forma programática dentro de un pipeline de producción de contenido.
- Ajuste fino posterior (fine-tuning de arranque): sirve como punto de partida o comparación para entrenar otros LoRA de identidad sobre Krea 2 con la infraestructura de entrenamiento de RunningHub.
- Docencia y experimentación en difusión: permite demostrar en un aula o taller cómo un LoRA modifica un modelo base mediante una única palabra de disparo, sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 218 MiB y no impone requisitos de VRAM propios reseñables; el coste real lo determina el modelo base Krea 2 Turbo sobre el que se carga.
- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende de la variante de Krea 2 (completa frente a Turbo), de la precisión de los pesos y del runtime utilizado. La presencia de un codificador de texto Qwen3-VL-4B en el modelo base incrementa el consumo respecto a codificadores más pequeños.
- GPU recomendadas: no disponible de forma específica para este LoRA. En términos generales, los modelos de difusión de imagen con codificador multimodal de 4B suelen requerir GPU con 12 GB de VRAM o más para resoluciones medias, y GPUs de datacenter (A100, H100) para lotes grandes, aunque no hay cifras confirmadas para este caso concreto.
- ¿Cabe en GPU de consumo? No confirmado. La viabilidad en tarjetas como RTX 3060, 4070 o 4090 depende de la cuantización y del runtime, y no está documentada aquí.
- Opciones de despliegue: ComfyUI (indicado explícitamente en las etiquetas), plataforma RunningHub (web y API). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que corresponden a modelos de lenguaje y no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-turbo-yangmi-v2-lora | LoRA de identidad (retrato de Yang Mi) | Krea 2 Turbo | Edición/generación de imagen en ComfyUI | No disponible | Hugging Face (RunningHubAI), 0 descargas |
| rh-krea2-turbo-lora | LoRA sobre Krea 2 Turbo | Krea 2 Turbo | Image-to-text-to-image, ComfyUI | No disponible | Hugging Face (RunningHubAI) |
| rh-krea2-ai-lora | LoRA sobre Krea 2 | Krea 2 | Image-to-text-to-image | No disponible | Hugging Face (RunningHubAI) |
| LoRA oficiales de estilo de Krea 2 | LoRA de estilo | Krea 2 | Estilo artístico, ComfyUI | Segun Krea 2 | Distribución oficial de Comfy-Org / Civitai |

Los datos de rendimiento comparativo, número de parámetros efectivos y contexto no están disponibles para ninguno de estos adaptadores en la información proporcionada, por lo que la comparación se limita a tipo, base, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un LoRA de identidad de una persona concreta puede reproducir rasgos de forma no fiel o estereotipada según los datos de entrenamiento, pero no hay información al respecto.
- Riesgo de alucinación: en modelos de difusión el equivalente es la generación de artefactos anatómicos, manos deformes, texto ilegible o rostros inconsistentes cuando el prompt no activa bien la palabra "yangmi". No hay métricas publicadas.
- Limitaciones de contexto e idioma: el LoRA no define contexto ni idiomas; dependen del codificador de texto del modelo base (Qwen3-VL-4B según fuentes externas). No se especifican idiomas soportados.
- Restricciones de licencia: la licencia figura como "no disponible". La model card indica que los derechos permanecen con el autor y que debe seguirse la licencia del proyecto original o del upstream. Esto implica riesgo legal para uso comercial: no está claro si se permite el uso comercial del adaptador ni de las imágenes generadas, y hay que verificar la licencia de Krea 2 por separado.
- Uso de identidad de persona real: la generación de imágenes de una persona identificable (Yang Mi) plantea consideraciones de derechos de imagen, consentimiento y normativa aplicable, especialmente en contextos comerciales o de desinformación.
- Reproducibilidad: al ser una publicación reciente con 0 descargas y 0 me gusta, no hay validación de la comunidad ni garantía de calidad o estabilidad del fichero.
- Compatibilidad: el LoRA depende de la versión concreta del modelo base Krea 2 Turbo; cambios en el modelo base pueden degradar o romper el efecto.
- Trazabilidad: no se documentan pasos de entrenamiento, dataset, rango ni hiperparámetros; dificulta auditar la procedencia y reproducir el resultado.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-turbo-yangmi-v2-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2108481403066519554
- Página del autor: https://www.runninghub.ai/user-center/2088900490348642305
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Modelo relacionado rh-krea2-turbo-lora: https://huggingface.co/RunningHubAI/rh-krea2-turbo-lora
- Modelo relacionado rh-krea2-ai-lora: https://huggingface.co/RunningHubAI/rh-krea2-ai-lora
- Guía de flujo ComfyUI de Krea 2: https://cgflowstudio.com/tutorials/krea-2-comfyui-workflow-guide/
- Checkpoints oficiales de Krea 2 Turbo (Comfy-Org) en Civitai: https://civitai.com/models/2726029/krea-2-turbo-official-comfy-org-checkpoints-krea2
