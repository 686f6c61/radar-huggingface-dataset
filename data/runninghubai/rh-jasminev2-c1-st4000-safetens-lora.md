# RunningHubAI/rh-jasminev2-c1-st4000.safetens-lora

## Resumen

rh-jasminev2-c1-st4000.safetens-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face en nombre de un autor de la plataforma RunningHub. No es un modelo de lenguaje ni un modelo generativo completo: es un ajuste de bajo rango que se aplica sobre un modelo de difusión base, identificado en la model card como krea2, y se distribuye como un único archivo safetensors de 224 MiB.

Su función declarada es reproducir un personaje femenino llamado Jasmine («she is Ai girl») mediante la palabra disparadora jasminechr, tanto en generación texto-a-imagen como en edición imagen-a-imagen dentro de flujos de ComfyUI. El repositorio está etiquetado con comfyui, lora y el pipeline image-text-to-image, y se puede cargar en ComfyUI, en la nube de RunningHub o directamente desde Hugging Face.

La relevancia práctica del modelo es acotada y muy específica: no aporta capacidades generales nuevas, sino la consistencia visual de un personaje concreto sobre el modelo base del que depende. En el momento de redactar esta ficha el repositorio acumula cero descargas y cero valoraciones, y la model card no documenta licencia, idiomas, dataset de entrenamiento ni hiperparámetros, por lo que buena parte de sus especificaciones quedan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión identificado como krea2; la arquitectura del modelo base no se detalla |
| Parametros totales | no disponible (el archivo de pesos del LoRA ocupa 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen; el condicionamiento de texto depende del codificador del modelo base) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, NF4 ni otras) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (archivo JasmineV2_c1-st4000.safetensors, 224 MiB) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, una colección de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenarlo por completo. La model card indica únicamente «Finetuned from: krea2», sin especificar rango, alpha, capas objetivo ni el número de pasos de entrenamiento. El nombre del archivo (c1-st4000) sugiere un checkpoint asociado al paso 4000, pero es una inferencia a partir de la nomenclatura y no un dato confirmado por el autor.

No hay información pública sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de imágenes propias del personaje, técnicas de regularización, ni sobre si se aplicó algún tipo de ajuste posterior por preferencias (RLHF, DPO) —procedimientos, por otra parte, poco habituales en adaptadores de difusión de este tipo—. Tampoco se documenta la resolución de entrenamiento, el scheduler, el optimizador ni el learning rate. La única innovación declarada es funcional: un disparador textual (jasminechr) que activa el personaje aprendido.

## Capacidades

- Generación de imágenes a partir de una descripción textual (pipeline image-text-to-image) con un personaje concreto aprendido.
- Edición de imágenes existentes (image-to-image): variaciones de pose, encuadre, vestuario o iluminación manteniendo la identidad del personaje, siempre que el modelo base lo permita.
- Consistencia de personaje entre generaciones mediante la palabra disparadora jasminechr.
- Integración como nodo LoRA en flujos de ComfyUI y en la plataforma en la nube RunningHub.
- Ejecución vía API de RunningHub para generar imágenes de forma programática.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de razonamiento multi-paso, modo «thinking», visión por computadora, audio ni generación de texto.
- Capacidades multilingües: no documentadas; el comportamiento del prompt depende del codificador de texto del modelo base y no del LoRA.

## Casos de uso

- Ilustración de personaje consistente para novelas visuales o cómics: el LoRA fija la identidad de Jasmine y permite generar viñetas sucesivas con el mismo rostro y estilo invocando jasminechr en cada prompt, reduciendo la deriva visual entre páginas.
- Contenido para redes sociales con imagen de marca: un estudio pequeño puede mantener una mascota o personaje virtual coherente en publicaciones periódicas sin reentrenar ni contratar ilustración para cada pieza.
- Preproducción de animación o videojuegos: generación rápida de hojas de personaje y exploraciones de vestuario o expresión antes de fijar el diseño definitivo, usando image-to-image sobre bocetos previos.
- Variaciones de producto o escena con personaje fijo: partiendo de una imagen base aprobada, se generan alternativas de fondo, iluminación o encuadre para pruebas A/B de creatividades publicitarias.
- Automatización por lotes en ComfyUI: mediante la API de RunningHub se puede encolar un flujo con este LoRA y generar cientos de imágenes nocturnas a partir de una lista de prompts, con el modelo base y el adaptador ya alojados en la plataforma.
- Pruebas de concepto para aplicaciones de imagen generativa: sirve como caso de prueba para validar la integración de LoRA personalizados en un pipeline propio (ComfyUI, diffusers) antes de invertir en un entrenamiento propio.
- Restyling de fotografías existentes: aplicar el personaje aprendido sobre una foto de referencia en modo imagen-a-imagen para obtener una versión ilustrada coherente con el resto de la serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de identidad facial) ni comparaciones cuantitativas con otros adaptadores. Tampoco hay imágenes de ejemplo ni evaluaciones de terceros en el repositorio.

## Requisitos de hardware

- El propio LoRA ocupa 224 MiB en disco; los requisitos de VRAM vienen determinados casi por completo por el modelo base (krea2), no por el adaptador.
- Estimación orientativa (no publicada por el autor): si el modelo base es de la familia de difusión de ~12 000 millones de parámetros, la inferencia en precisión completa (bf16/fp16) requiere del orden de 20-24 GB de VRAM, y en cuantizaciones de 8 o 4 bits puede bajar a un rango aproximado de 8-12 GB. Estas cifras son estimaciones dependientes del modelo base y de la configuración del flujo, no datos confirmados.
- GPU recomendadas: no disponibles. Como referencia general para difusión de ese tamaño, se emplean habitualmente A100, H100, L40S o RTX 4090; en consumer, las GPU con 12-16 GB o más pueden ser suficientes con cuantización.
- Opciones de despliegue: ComfyUI (local o en la nube de RunningHub) es el entorno previsto; también es viable cargarlo con la librería diffusers si el formato del LoRA es compatible con el modelo base. vLLM, llama.cpp, Ollama y TGI no aplican, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano del archivo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-jasminev2-c1-st4000.safetens-lora | LoRA de imagen (image-text-to-image) | krea2 | 224 MiB | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub; 0 descargas |
| RunningHubAI/rh-1-lora | LoRA de imagen (image-text-to-image) | no disponible | 235 MB (archivo 2_c1-st6000.safetensors) | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub; 0 likes |
| Otros adaptadores de personaje para difusión | LoRA de imagen | no disponible | no disponible | no aplica | variable | no disponible |

No se dispone de datos de rendimiento comparativos entre estas alternativas, ni de modelos de referencia de la misma categoría con métricas publicadas en la información consultada.

## Limitaciones y advertencias

- Licencia no especificada: la model card remite al proyecto original o upstream, lo que impide determinar con claridad si el uso comercial está permitido. Es un riesgo jurídico relevante para cualquier despliegue en producción.
- Dependencia total del modelo base: sin cargar krea2 (o el modelo para el que se entrenó), el adaptador no produce resultados; las versiones concretas del base pueden alterar el comportamiento.
- Riesgo de sobreajuste al personaje: al estar entrenado para una identidad concreta, puede degradar la variedad de poses, expresiones o composiciones y limitar la diversidad de las imágenes generadas.
- Posibles sesgos de representación: la descripción del personaje («AI girl») apunta a un arquetipo femenino estilizado; es previsible la reproducción de estereotipos de género y de cánones de belleza poco diversos, así como la generación de contenido sugestivo según el prompt y el modelo base.
- Artefactos propios de la difusión: deformaciones anatómicas (manos, ojos, proporciones), incoherencias en texto dentro de la imagen y problemas de perspectiva, no corregidos por el LoRA.
- Idiomas no documentados: se desconoce el rendimiento de los prompts en castellano y si el codificador de texto del modelo base responde mejor en inglés.
- Cero validación comunitaria: el repositorio no tiene descargas ni valoraciones, y el autor no aporta ejemplos ni comparativas, por lo que no hay evidencia externa de calidad.
- Ausencia de trazabilidad del entrenamiento: sin datos de dataset ni de hiperparámetros, no se puede auditar el origen de las imágenes usadas en el ajuste ni evaluar posibles conflictos de derechos.
- Fecha de creación futura respecto al momento de consulta (2026-10-12) en los metadatos del repositorio, lo que conviene verificar antes de tomarla como referencia temporal fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-jasminev2-c1-st4000.safetens-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2109712786585554945
- Página del autor: https://www.runninghub.ai/user-center/2101558045934727169
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento de modelos: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5 citada en la model card: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- LoRA relacionado del mismo autor: https://huggingface.co/RunningHubAI/rh-1-lora
