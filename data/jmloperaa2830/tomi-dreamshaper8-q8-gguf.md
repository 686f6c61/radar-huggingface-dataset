# jmloperaa2830/tomi-dreamshaper8-q8-gguf

## Resumen

DreamShaper 8 (Q8_0, GGUF) es una cuantización del modelo de difusión DreamShaper 8 de Lykon, publicado por el usuario jmloperaa2830 en formato GGUF para su uso con stable-diffusion.cpp. DreamShaper 8 es a su vez un fine-tune de Stable Diffusion 1.5 orientado a la generación de imágenes fotorrealistas, ilustraciones y estilos artísticos variados. Este repositorio no entrena un modelo nuevo, sino que empaqueta los pesos del modelo base en un único fichero de aproximadamente 1,8 GB con cuantización Q8_0, lo que reduce el peso respecto a los pesos originales en precisión completa y facilita su despliegue en entornos con recursos limitados.

La relevancia de este artefacto es operativa: permite ejecutar un modelo text-to-image de la familia SD 1.5 en infraestructura de CPU o GPU modesta mediante stable-diffusion.cpp, sin depender de frameworks como PyTorch o Diffusers. Según la model card, el fichero lo consume el servicio de imágenes `tomi_ai_img` del proyecto TOMi 8, que lo descarga al instalar el paquete `tomi_model_img_dreamshaper`.

El modelo cuenta con 1.066.235.384 parámetros (dato real de safetensors) y hereda la ventana de contexto y las capacidades del SD 1.5 original, incluyendo la resolución nativa de 512x512 y el codificador de texto CLIP. La licencia es CreativeML OpenRAIL-M, con las restricciones de uso asociadas que deben conservarse al redistribuir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (UNet + VAE + codificador de texto CLIP), base Stable Diffusion 1.5 |
| Parametros totales | 1.066.235.384 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; límite práctico del tokenizador CLIP de SD 1.5, 77 tokens) |
| Tipos de cuantizacion | Q8_0 (única publicada en este repositorio) |
| Idiomas soportados | no disponible (prompts en inglés recomendados por el modelo base, no confirmado en la información) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | GGUF (`dreamshaper8_q8_0.gguf`, ≈ 1,8 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es DreamShaper 8, un fine-tune de Stable Diffusion 1.5 desarrollado por Lykon. Stable Diffusion 1.5 emplea una arquitectura de difusión latente compuesta por una UNet convolucional con bloques de atención, un autoencoder variacional (VAE) que comprime las imágenes al espacio latente y un codificador de texto CLIP que transforma los prompts en embeddings de condicionamiento. El proceso de generación parte de ruido gaussiano en el espacio latente y lo denoisa iterativamente mediante el sampler configurado.

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento de DreamShaper 8, el número de pasos de fine-tuning, la composición de las imágenes ni si se aplicaron técnicas de preferencia (RLHF/DPO) o destilación. Este repositorio en concreto no aporta entrenamiento adicional: se limita a cuantizar los pesos del modelo base a Q8_0 y empaquetarlos en formato GGUF para stable-diffusion.cpp. La innovación técnica del artefacto es, por tanto, la compatibilidad con un runtime en C++ que permite inferencia sin PyTorch.

## Capacidades

- Generación de imágenes text-to-image a partir de descripciones en lenguaje natural, con estilos que abarcan fotorrealismo, ilustración, anime y arte conceptual, según las características del modelo base DreamShaper 8.
- Control de la generación mediante prompt negativo, pasos de muestreo, escala de guía (CFG) y semilla, parámetros estándar de los samplers de difusión.
- Ejecución mediante stable-diffusion.cpp, lo que permite inferencia en CPU y GPU sin dependencias de PyTorch ni de la librería Diffusers.
- No soporta tool calling ni function calling: es un modelo de generación de imágenes, no un modelo de lenguaje conversacional.
- No dispone de modo de razonamiento (thinking), capacidades de agente ni multi-step reasoning.
- No soporta visión de entrada ni audio; la entrada es exclusivamente texto.

## Casos de uso

- Generación de ilustraciones para prototipos de aplicaciones: el fichero GGUF se integra en stable-diffusion.cpp para producir imágenes de referencia rápidas en entornos de desarrollo sin GPU dedicada, gracias a la cuantización Q8_0 que reduce el peso a 1,8 GB.
- Servicio de imágenes dentro de una aplicación de escritorio o instalador: tal como describe la model card, el paquete `tomi_model_img_dreamshaper` descarga el modelo al instalar el servicio `tomi_ai_img` del proyecto TOMi 8, lo que lo hace adecuado para distribuir generación de imágenes local en una aplicación de usuario final.
- Creación de assets para videojuegos o contenido editorial: DreamShaper 8 es conocido por su versatilidad estilística, por lo que se puede usar para generar bocetos de personajes, fondos o iconos con prompts descriptivos y ajuste de CFG.
- Pruebas de concepto de pipelines text-to-image en CPU: al no requerir PyTorch, el GGUF permite validar flujos de generación en servidores sin GPU o en contenedores ligeros.
- Generación por lotes de imágenes de baja resolución (512x512): útil para aumentar datasets sintéticos o para pruebas A/B de prompts antes de escalar a modelos de mayor resolución.
- Despliegue en dispositivos con VRAM limitada: la cuantización Q8_0 reduce el consumo de memoria frente a los pesos en fp16, lo que permite ejecutar el modelo en GPUs de gama media o incluso en CPU con latencias mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa aproximadamente 1,8 GB en disco; en memoria, la cuantización Q8_0 requiere del orden de 2 GB para los pesos, más el espacio de activaciones y buffers del sampler, que depende de la resolución y del backend. No se dispone de mediciones oficiales de VRAM pico en la información proporcionada.
- GPU recomendadas: no disponible en la información. Por el tamaño del modelo, es plausible su ejecución en GPUs consumer con 4-6 GB de VRAM o superiores, pero este dato no está confirmado por el autor.
- ¿Cabe en GPU consumer? El tamaño de los pesos (≈1,8 GB) sugiere que sí en la mayoría de GPUs consumer modernas, si bien no se ha verificado en la documentación disponible.
- Opciones de despliegue: stable-diffusion.cpp (runtime objetivo declarado en la model card). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DreamShaper 8 Q8_0 GGUF (este repo) | 1.066.235.384 | GGUF (Q8_0) | 512x512 nativo (SD 1.5) | creativeml-openrail-m | Hugging Face, 94 descargas |
| Lykon/dreamshaper-8 (modelo base) | no disponible en la informacion | safetensors / diffusers | 512x512 nativo (SD 1.5) | creativeml-openrail-m | Hugging Face |
| Stable Diffusion 1.5 | no disponible en la informacion | safetensors / diffusers / ckpt | 512x512 nativo | creativeml-openrail-m | Hugging Face, ampliamente distribuido |
| SDXL (Stability AI) | no disponible en la informacion | safetensors / diffusers | 1024x1024 nativo | creativeML Open RAIL++-M | Hugging Face |

La comparación se limita a la familia SD 1.5 y SDXL por categoría (text-to-image de difusión latente). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Stable Diffusion 1.5, el modelo hereda los sesgos de su dataset de entrenamiento (LAION), incluyendo sesgos de género, etnia y representación cultural. No se han documentado evaluaciones específicas de sesgo para este repositorio.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente, anatómicamente incorrecto o no fiel al prompt, especialmente en escenas complejas o con múltiples sujetos.
- Limitaciones de resolución: SD 1.5 está entrenado para 512x512; generar a resoluciones superiores sin técnicas adicionales (upscalers, hires fix) suele degradar la calidad.
- Limitaciones de idioma: no se confirma el soporte multilingüe de los prompts; el codificador CLIP de SD 1.5 está entrenado principalmente en inglés, por lo que los prompts en otros idiomas pueden rendir peor.
- Restricciones de licencia: CreativeML OpenRAIL-M incluye restricciones de uso que deben conservarse al redistribuir el modelo, y prohíbe determinados usos (por ejemplo, generación de contenido ilegal o dañino). Es responsabilidad del usuario revisar el fichero LICENSE del repositorio.
- Sin garantías: la model card indica explícitamente "sin garantías".
- Madurez del artefacto: repositorio con 0 likes y 94 descargas, publicado por un usuario individual; no hay evidencia de validación comunitaria extensa ni de mantenimiento continuado.
- Compatibilidad limitada: el formato GGUF de este repositorio está pensado para stable-diffusion.cpp; no es directamente cargable en Diffusers ni en AUTOMATIC1111 sin conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jmloperaa2830/tomi-dreamshaper8-q8-gguf
- Modelo base DreamShaper 8: https://huggingface.co/Lykon/dreamshaper-8
- stable-diffusion.cpp (runtime): https://github.com/leejet/stable-diffusion.cpp
