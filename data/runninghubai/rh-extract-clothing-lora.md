# RunningHubAI/rh-extract-clothing-lora

## Resumen

rh-extract-clothing-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI, la plataforma de RunningHub, orientado a la extracción de prendas de vestir a partir de imágenes de entrada. El modelo se presenta como un LoRA de tipo image edit dentro del ecosistema ComfyUI y se distribuye como un único archivo de pesos de 450 MiB, lo que lo sitúa en la categoría de adaptadores ligeros que se aplican sobre un modelo base preentrenado en lugar de entrenarse desde cero.

Según la model card, el adaptador está afinado a partir de Qwen-Edit-2511, un modelo de edición de imagen de la familia Qwen, y utiliza la palabra de activación (trigger word) "Extract clothing" para inducir el comportamiento deseado. El repositorio no incluye información sobre el número de parámetros del adaptador, la longitud de contexto, los idiomas soportados ni la licencia concreta, más allá de una nota genérica que remite a la licencia del proyecto original.

Su relevancia es acotada y práctica: cubre una tarea muy específica de segmentación y aislamiento de prendas dentro de flujos de trabajo de generación y edición de imagen, y su interés principal radica en que se integra directamente en pipelines de ComfyUI y en la infraestructura de RunningHub, tanto en su versión internacional como en la china. No es un modelo de propósito general ni compite en la categoría de LLM o de modelos multimodales completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de edición de imagen Qwen-Edit-2511; no se detalla la arquitectura interna del adaptador |
| Parametros totales | no disponible (pesos del adaptador: 450 MiB en `Extract_clothing_17.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors (presumiblemente fp16/bf16, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que se sigue la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`Extract_clothing_17.safetensors`, 450 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es Qwen-Edit-2511, un modelo de edición de imagen de la familia Qwen; la model card no especifica en qué capas se aplica el adaptador, el rango utilizado, el tamaño del dataset de entrenamiento ni la composición de este.

No se documenta si el entrenamiento incluyó etapas de ajuste fino supervisado, preferencias (DPO/RLHF) o aumentos de datos específicos para la tarea de extracción de prendas. Tampoco se detallan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de control estructural. La única información operativa relevante es la palabra de activación "Extract clothing", que debe incluirse en el prompt para activar el comportamiento aprendido, y la plataforma de entrenamiento utilizada (RunningHub, según el enlace "Train models on RunningHub").

## Capacidades

- Edición de imagen condicionada por texto: recibe una imagen y un prompt, y genera una imagen editada.
- Extracción de prendas de vestir: la funcionalidad declarada es aislar o extraer muestras de ropa de una imagen de entrada, activada mediante la trigger word "Extract clothing".
- Integración con ComfyUI: el repositorio está etiquetado como `comfyui` y `lora`, por lo que está pensado para cargarse como nodo LoRA en flujos de ComfyUI.
- Compatibilidad con RunningHub: puede ejecutarse en la plataforma RunningHub (internacional y china) y a través de su API.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking; el alcance es exclusivamente edición de imagen.
- Capacidades multilingües: no disponibles; no se especifican idiomas para el prompt.

## Casos de uso

- Catalogación de moda: dado un conjunto de fotografías de producto o de estilo de calle, el LoRA permite extraer la prenda y generar una imagen aislada sobre fondo neutro, útil para fichas de catálogo y bases de datos de e-commerce.
- Generación de variantes de producto: a partir de una imagen de una prenda, se puede producir una versión editada para probar colores, estampados o encuadres dentro de un pipeline de ComfyUI, manteniendo la identidad visual de la prenda original.
- Preprocesado para probadores virtuales: la extracción limpia de la prenda sirve como entrada para modelos posteriores de virtual try-on, que requieren una máscara o recorte preciso de la ropa.
- Automatización de contenido para redes sociales: creación de imágenes de moda con la prenda aislada y recompuesta sobre nuevos fondos, reduciendo el trabajo manual de retoque en estudios pequeños.
- Etiquetado y anotación de datasets: uso del LoRA para generar pares imagen-máscara de prendas que ayuden a ampliar datasets de segmentación de ropa con menos anotación manual.
- Integración en la API de RunningHub: despliegue del flujo como servicio para que aplicaciones de terceros soliciten extracciones de prendas por API, sin necesidad de gestionar la infraestructura de GPU.
- Prototipado rápido en ComfyUI: experimentación con la trigger word y distintos prompts para evaluar la calidad de la extracción antes de comprometerse con un pipeline de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al ser un LoRA de 450 MiB, la VRAM vendrá determinada casi por completo por el modelo base Qwen-Edit-2511, no por el adaptador.
- GPU recomendadas: no disponibles en la información proporcionada; dependerán del modelo base y de la resolución de imagen empleada.
- Cabe en GPU de consumo: no confirmado; el adaptador en sí es ligero, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub y su API; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a este tipo de adaptador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-extract-clothing-lora | LoRA de edición de imagen | Qwen-Edit-2511 | Extracción de prendas | no disponible | Hugging Face, ComfyUI, RunningHub |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se han identificado alternativas concretas con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al tratarse de un adaptador de edición de imagen, puede heredar sesgos del modelo base y del dataset de entrenamiento, no especificado.
- Riesgo de alucinación: en el contexto de edición de imagen, puede generar detalles de la prenda que no existen en la imagen original o deformar patrones y texturas.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni restricciones de resolución o longitud de prompt.
- Restricciones de licencia: la licencia no está disponible de forma explícita; la model card remite a la licencia del proyecto original o del upstream, por lo que el uso comercial debe verificarse con el autor y con la licencia de Qwen-Edit-2511 antes de desplegarlo en producción.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere cargar Qwen-Edit-2511 y respetar la trigger word "Extract clothing" para activar el comportamiento.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia pública de validación por parte de la comunidad.
- Caveat de producción: al no haber benchmarks ni documentación técnica detallada, conviene evaluar la calidad de la extracción con un conjunto propio de imágenes antes de integrarlo en flujos automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-extract-clothing-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2020420842039025665
- Página del autor: https://www.runninghub.cn/user-center/1861364520106020865
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
