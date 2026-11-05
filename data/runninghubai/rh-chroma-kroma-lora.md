# RunningHubAI/rh-chroma-kroma-lora

## Resumen

`rh-chroma-kroma-lora` es un adaptador LoRA para edición de imágenes publicado por RunningHubAI a partir del modelo Kroma, un fine-tune de Krea 2 desarrollado originalmente por el usuario lodestones. El repositorio distribuye un único archivo `safetensors` de 1795 MiB (`kroma-v0.1.safetensors`) que contiene los pesos del adaptador con rango reducido a 256 y alpha 256, además de los tensores de normalización y modulación del fine-tune completo empaquetados como deltas de pesos. Esto permite reproducir el comportamiento del modelo afinado al cargarlo sobre el modelo base.

El modelo está orientado exclusivamente a tareas de edición de imágenes (pipeline `image-text-to-image`) y se distribuye en formato compatible con ComfyUI, la plataforma de referencia para la que fue empaquetado. No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. Su relevancia es acotada al ecosistema de generación y edición de imágenes con difusión, donde los LoRA de rango alto como este permiten aplicar transformaciones estilísticas o de contenido sin reentrenar el modelo base completo.

La información pública disponible es muy limitada: la model card no especifica arquitectura del modelo base, número de parámetros, longitud de contexto (no aplica en el sentido de LLM), idiomas soportados ni licencia concreta. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 5 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2; arquitectura del base no disponible |
| Parametros totales | no disponible (el archivo pesa 1795 MiB; rango del LoRA: 256, alpha: 256) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors (presumiblemente fp16/bf16, no confirmado) |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica "follow the original project or upstream license" y que el copyright permanece con el autor |
| Formato de pesos | safetensors (`kroma-v0.1.safetensors`, 1795 MiB) |
| Pipeline | image-text-to-image (edición de imágenes) |
| Compatibilidad | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 1.9 GB |

## Arquitectura y entrenamiento

El artefacto es un LoRA de rango 256 con alpha 256, reducido desde un fine-tune completo de Krea 2 (modelo base de difusión para generación de imágenes). Además de las matrices de bajo rango habituales, el archivo incorpora los tensores de normalización y modulación del fine-tune original como deltas de pesos, de modo que al cargarlo sobre el modelo base se reproduce el comportamiento del modelo afinado sin necesidad de redistribuir los pesos completos. Esta técnica es habitual en adaptadores de difusión de rango alto, donde los componentes de normalización (típicamente capas de normalización por grupo o modulación tipo AdaLN) no se capturan bien con un LoRA convencional.

No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la resolución de entrenamiento, el uso de RLHF/DPO (no aplica en difusión) ni innovaciones técnicas adicionales más allá del empaquetado de los tensores de normalización. La model card no documenta el proceso de entrenamiento más allá de indicar que fue realizado en RunningHub y que el modelo se deriva de Krea 2.

## Capacidades

- Edición de imágenes guiada por texto e imagen de entrada (pipeline `image-text-to-image`).
- Aplicación de transformaciones estilísticas o de contenido sobre una imagen base mediante el LoRA cargado sobre Krea 2.
- Integración en flujos de trabajo de ComfyUI mediante el nodo de carga de LoRA estándar.
- Ejecución en la plataforma RunningHub (internacional y China) y en Hugging Face.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; dependen del codificador de texto del modelo base.
- No dispone de modo thinking, visión (en el sentido de VLM) ni audio.

## Casos de uso

- Edición de imágenes en producción con ComfyUI: cargar `kroma-v0.1.safetensors` sobre Krea 2 en un grafo de ComfyUI para aplicar el estilo o la transformación aprendida a lotes de imágenes de forma reproducible.
- Prototipado rápido de variantes estilísticas: al ser un LoRA de rango 256, permite explorar variaciones sobre el modelo base sin reentrenar, adecuado para equipos de diseño que iteran sobre un mismo concepto visual.
- Automatización de pipelines de edición por lotes: integrar el LoRA en un workflow de ComfyUI ejecutado por API (RunningHub API) para procesar imágenes de catálogo, marketing o contenido editorial con una transformación consistente.
- Reproducción de un fine-tune sin redistribuir pesos completos: útil en entornos con restricciones de almacenamiento o de distribución, ya que el adaptador pesa 1.9 GB frente al modelo base completo.
- Evaluación comparativa de adaptadores: servir como referencia para medir el efecto de un LoRA de rango alto con tensores de normalización incluidos frente a LoRA de rango bajo convencionales.
- Despliegue en la nube gestionada: usar RunningHub (internacional o China) para ejecutar el modelo sin infraestructura propia, adecuado para equipos sin GPUs dedicadas.
- Investigación sobre edición de imágenes: analizar cómo los deltas de normalización y modulación afectan al comportamiento del modelo base en tareas de edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un LoRA de 1.9 GB requiere cargar además el modelo base Krea 2 completo, cuyo tamaño no se documenta en esta ficha; la VRAM total dependerá del base y de la resolución de generación.
- GPU recomendadas: no disponible. Para difusión de imágenes de gama alta se suelen emplear A100, H100, RTX 4090 o RTX 3090, pero no hay confirmación para este modelo concreto.
- ¿Cabe en GPU de consumo? No confirmado; depende del modelo base y de la resolución.
- Opciones de despliegue: ComfyUI (formato nativo), RunningHub (plataforma gestionada), Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión de imágenes en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (LoRA de edición de imágenes sobre Krea 2 u otros bases de difusión).

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta arquitectura del base, dataset, parámetros ni proceso de entrenamiento.
- Licencia no especificada: la model card remite a la licencia del proyecto original (Kroma / Krea 2) y afirma que el copyright permanece con el autor; es imprescindible verificar la licencia upstream antes de cualquier uso comercial.
- Riesgo de sesgos y alucinaciones visuales: no documentado; como todo modelo de difusión, puede generar artefactos, inconsistencias anatómicas o contenidos no deseados según el prompt.
- Dependencia del modelo base: el LoRA no funciona de forma autónoma; requiere cargar Krea 2 y respetar la configuración de rango/alpha (256/256) para reproducir el comportamiento esperado.
- Idiomas no documentados: el soporte multilingüe de los prompts depende del codificador de texto del base, no de este adaptador.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- Fecha de creación futura (2026-11-05) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de integrarlo en producción.
- Sin benchmarks: no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-chroma-kroma-lora
- Modelo original (Kroma): https://huggingface.co/lodestones/Kroma
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página del modelo en RunningHub: https://www.runninghub.ai/model/public/2083400868971794434
- Página del autor: https://www.runninghub.ai/user-center/2016309509211037697
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
