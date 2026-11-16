# shuiyewell/z-image-turbo-nsfw-v2-GGUF

## Resumen

Z-Image Turbo NSFW v2 GGUF es una conversión cuantizada en formato GGUF del modelo de difusión text-to-image `tewea/z_image_turbo_bf16_nsfw`, un finetune de contenido para adultos (NSFW) del modelo original Tongyi-MAI/Z-Image-Turbo. El repositorio lo publica el usuario `shuiyewell` y su única aportación técnica es la cuantización a Q8_0 mediante las herramientas de conversión de city96 (ComfyUI-GGUF), con el objetivo de reducir el uso de VRAM manteniendo una calidad cercana al bf16 original.

El modelo cuenta con aproximadamente 6.150 millones de parámetros (6,15 B) y está pensado para ejecutarse dentro de ComfyUI mediante el nodo Unet Loader (GGUF). Al derivar de un modelo Turbo destilado, está diseñado para generar imágenes con un número bajo de pasos de muestreo (en torno a 8) y valores de CFG bajos, lo que reduce el coste computacional por imagen frente a modelos de difusión convencionales.

Su relevancia es acotada: no introduce innovaciones arquitectónicas ni de entrenamiento, sino que facilita el despliegue en hardware con VRAM limitada de un finetune NSFW ya existente. La licencia declarada es Apache 2.0, heredada del modelo base, y el contenido está restringido a público adulto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (no se detalla la variante interna en la información disponible) |
| Parametros totales | 6.154.908.736 (~6,15 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image, no de lenguaje) |
| Tipos de cuantizacion | Q8_0 (única variante publicada) |
| Idiomas soportados | No disponible (el prompt se procesa mediante el text encoder del modelo original Z-Image Turbo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`z_image_nsfw_v2-Q8_0.gguf`, ~6,8 GB) |
| Modelo base | tewea/z_image_turbo_bf16_nsfw (relación: quantized) |
| Modelo original | Tongyi-MAI/Z-Image-Turbo |
| Tamaño del repositorio | 7,2 GB |
| Pipeline | text-to-image |
| Herramienta de conversión | city96/ComfyUI-GGUF |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo más allá de su naturaleza como modelo de difusión text-to-image. Se trata de una conversión directa del checkpoint `z_image_turbo_bf16_nsfw_v2.safetensors` al formato GGUF con cuantización Q8_0, realizada con las herramientas de city96 para ComfyUI. No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si el finetune empleó técnicas como RLHF, DPO o ajuste por preferencias.

El único dato técnico relevante sobre el entrenamiento es que el modelo base es un finetune NSFW de Z-Image Turbo, un modelo destilado para funcionar con pocos pasos de muestreo. Esa naturaleza Turbo implica que el modelo está optimizado para generar con alrededor de 8 pasos y CFG bajo, lo que se traduce en menor latencia por imagen que un modelo de difusión estándar de pasos completos. La cuantización Q8_0 preserva la práctica totalidad de la precisión del bf16 original, por lo que la degradación de calidad respecto al checkpoint sin cuantizar debería ser marginal.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline de difusión.
- Generación con pocos pasos de muestreo (~8 pasos) y CFG bajo, gracias a la destilación Turbo del modelo original.
- Contenido para adultos (NSFW): el finetune está orientado explícitamente a este tipo de imágenes.
- Integración con ComfyUI mediante el nodo Unet Loader (GGUF) del paquete ComfyUI-GGUF.
- Compatibilidad con el mismo text encoder y VAE que el modelo Z-Image Turbo original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking, al no ser un modelo de lenguaje.

## Casos de uso

- Generación de imágenes en local con VRAM ajustada: la cuantización Q8_0 reduce el peso del modelo a ~6,8 GB, lo que permite cargarlo en GPUs de consumo con 8-12 GB de VRAM dentro de ComfyUI, usando el nodo Unet Loader (GGUF) en lugar del cargador de difusión estándar.
- Iteración rápida de prompts en flujos creativos: al requerir ~8 pasos y CFG bajo, el ciclo de generación es corto, lo que facilita probar variaciones de prompt y ajustes de sampler sin esperas largas.
- Producción de contenido para adultos en entornos controlados: el modelo está diseñado para este dominio y puede integrarse en pipelines internos de generación de imágenes para plataformas que cumplan los requisitos legales de verificación de edad y consentimiento.
- Prototipado de pipelines ComfyUI: sirve como sustituto cuantizado del checkpoint bf16 para validar grafos, nodos y conexiones (text encoder, VAE, sampler) antes de desplegar la versión completa en producción.
- Investigación sobre cuantización de modelos de difusión: permite comparar la calidad de salida Q8_0 frente al bf16 original en el mismo pipeline, evaluando la pérdida de fidelidad introducida por la cuantización.
- Despliegue en estaciones de trabajo con una sola GPU: al no requerir el checkpoint bf16 completo, se puede mantener el modelo cargado de forma persistente en memoria de vídeo junto con el text encoder y el VAE en equipos de gama media-alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa ~6,8 GB; a ello hay que sumar la memoria del text encoder y del VAE del modelo Z-Image Turbo original, no cuantificados en este repositorio, por lo que el consumo total supera el del solo UNet.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño del checkpoint, encaja en GPUs con 12 GB o más de VRAM; en GPUs de 8 GB el margen es ajustado y depende del text encoder y del VAE empleados.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en modelos con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), siempre que el resto de componentes del pipeline quepan en la VRAM restante.
- Opciones de despliegue: ComfyUI con el nodo personalizado ComfyUI-GGUF (Unet Loader GGUF). No se documentan otros backends (vLLM, llama.cpp, Ollama, TGI) para este modelo, al ser un modelo de difusión y no de lenguaje.
- Latencia y throughput: no disponibles. La model card solo indica que, al ser un modelo Turbo, funciona con ~8 pasos y CFG bajo, lo que reduce el coste por imagen frente a modelos de difusión de pasos completos.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| shuiyewell/z-image-turbo-nsfw-v2-GGUF | ~6,15 B | GGUF | Q8_0 | Apache 2.0 | Text-to-image NSFW, cuantizado para ComfyUI |
| tewea/z_image_turbo_bf16_nsfw | No disponible | safetensors (bf16) | Sin cuantizar | Apache 2.0 | Text-to-image NSFW, checkpoint original |
| Tongyi-MAI/Z-Image-Turbo | No disponible | No disponible | No disponible | Apache 2.0 | Text-to-image Turbo original (sin finetune NSFW) |

La comparación se limita a la cadena de derivación del propio modelo, ya que la información proporcionada no incluye datos de rendimiento ni especificaciones detalladas de alternativas de otros autores. No se dispone de benchmarks que permitan comparar calidad o velocidad frente a otros modelos de difusión.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está afinado para generar imágenes para adultos. No es apto para todos los públicos y su uso exige cumplir la legislación local y los términos de servicio de la plataforma donde se despliegue.
- Sesgos: no se documentan sesgos específicos, pero al ser un finetune sobre un modelo de difusión general, es probable que herede los sesgos de representación del modelo original en cuanto a género, etnia, cuerpo y contexto.
- Alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, artefactos, texto ilegible o composiciones incoherentes con el prompt, especialmente con descripciones complejas o poco habituales.
- Idiomas: no se especifica qué idiomas comprende el text encoder asociado; la información sobre prompts multilingües no está disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado y su distribución pueden estar sujetos a restricciones legales adicionales según la jurisdicción, especialmente en material para adultos.
- Producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ofrece garantías de mantenimiento ni de calidad de la conversión más allá de indicar que se hizo con las herramientas de city96.
- Dependencia de componentes externos: requiere el text encoder y el VAE del modelo Z-Image Turbo original, que no se incluyen en este repositorio; una configuración incorrecta de estos componentes degrada la calidad de salida.
- Trazabilidad: al ser una conversión de terceros, la responsabilidad sobre el finetune subyacente recae en el autor original (`tewea`), no en el publicador de la versión GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shuiyewell/z-image-turbo-nsfw-v2-GGUF
- Modelo base (finetune NSFW): https://huggingface.co/tewea/z_image_turbo_bf16_nsfw
- Modelo original Z-Image Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Herramientas de conversión ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Nodo ComfyUI-GGUF (repositorio principal): https://github.com/city96/ComfyUI-GGUF/tree/main/tools
