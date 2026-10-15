# danyalmalik/animagine-xl-3.1-ONNX-WebGPU

## Resumen
Este repositorio publica una conversión a ONNX de Animagine XL 3.1, el modelo de generación de imágenes de temática anime desarrollado por cagliostrolab y construido sobre la arquitectura Stable Diffusion XL. La conversión la firma el usuario danyalmalik y está orientada a ejecutarse directamente en el navegador mediante el backend WebGPU de ONNX Runtime Web, tal y como lo emplea el proyecto Quick Inference. No es un modelo nuevo, sino una redistribución optimizada para inferencia en el cliente.

El modelo hereda del original su esquema de difusión latente SDXL, con dos codificadores de texto CLIP, una UNet y un decodificador VAE, y su especialización en la generación de ilustraciones de estilo anime a partir de prompts basados en etiquetas. El repositorio ocupa 7,0 GB y no declara métricas de rendimiento ni benchmarks propios; los únicos cambios documentados son de formato y precisión de los pesos.

Su relevancia actual reside en que permite desplegar generación de imágenes SDXL sin servidor de inferencia, aprovechando la GPU del propio navegador a través de WebGPU, algo poco habitual en este tipo de modelos de difusión y útil para demos, herramientas de escritorio web y aplicaciones con requisitos de privacidad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente estilo Stable Diffusion XL (SDXL): dos codificadores de texto CLIP, UNet y decodificador VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes; los codificadores de texto usan la ventana estandar de CLIP, no declarada en la model card) |
| Tipos de cuantizacion | float16 (codificadores de texto y UNet) y float32 (decodificador VAE); el UNet recibe y devuelve float32 |
| Idiomas soportados | no disponible |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento
El repositorio no entrena ningún modelo: es una conversión de los pesos originales de cagliostrolab/animagine-xl-3.1 al formato ONNX mediante el exportador de PyTorch, con cuatro grafos independientes (`text_encoder`, `text_encoder_2`, `unet` y `vae_decoder`). Los dos codificadores de texto y la UNet se exportan en float16, mientras que el decodificador VAE se mantiene en float32; la UNet acepta y devuelve activaciones en float32 a pesar de tener los pesos en float16. Los codificadores de texto devuelven la penúltima capa oculta y, el segundo, su proyección agrupada (pooled), tal y como espera el pipeline de SDXL. Al tratarse de ficheros modificados, sus salidas son cercanas a las del modelo original pero no idénticas.

La arquitectura subyacente es la de SDXL, un modelo de difusión latente con dos codificadores de texto complementarios que alimentan una UNet y un VAE. Los detalles sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset y la posible aplicación de RLHF o DPO no están disponibles en la información proporcionada para este repositorio. Según las fuentes consultadas, el modelo base Animagine XL 3.1 es una actualización de la serie V3 orientada a mejorar la calidad de imagen anime, la anatomía de las manos y el ordenado eficiente de etiquetas, con un conjunto de etiquetas estéticas añadido y un catálogo más amplio de personajes de series conocidas.

## Capacidades
- Generación de imágenes de texto a imagen (text-to-image) con especialización en estilo anime.
- Interpretación de prompts basados en etiquetas (estilo Danbooru), habitual en la serie Animagine.
- Mejora declarada por el modelo base en anatomía de manos y ordenado de etiquetas respecto a versiones anteriores de la serie.
- Soporte de etiquetas estéticas para controlar el acabado de la imagen (según el modelo base).
- Inferencia en el navegador mediante ONNX Runtime Web y el backend WebGPU.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de entrada de visión ni de audio: es un modelo exclusivamente generativo de imágenes.
- No se documentan capacidades multilingües específicas.

## Casos de uso
- Aplicación web de generación de ilustraciones sin backend: el modelo se ejecuta íntegramente en el navegador del usuario mediante WebGPU, de modo que no es necesario mantener GPUs en servidor ni enviar los prompts a infraestructura externa.
- Demostraciones interactivas y juguetes educativos: permite mostrar cómo funciona un modelo de difusión SDXL en tiempo real dentro de una página web, sin instalación local por parte del visitante.
- Herramientas de creación de fan art y personajes: generación de ilustraciones de estilo anime a partir de prompts etiquetados, adecuada para editores y aplicaciones creativas orientadas a comunidad.
- Generación con requisitos de privacidad: al ejecutarse en el cliente, los prompts y las imágenes no salen del dispositivo, lo que encaja en flujos donde el contenido es sensible.
- Prototipado rápido de productos de imagen: útil para validar ideas de producto y experiencia de usuario antes de invertir en infraestructura de inferencia dedicada.
- Reducción de costes operativos en aplicaciones de bajo volumen: al trasladar el cómputo al navegador, se elimina el coste de GPU en servidor, a cambio del tiempo de descarga del modelo (7,0 GB) y de las limitaciones del hardware del usuario.
- Distribución de herramientas offline: puede integrarse en aplicaciones web progresivas para generar imágenes sin conexión una vez cacheado el modelo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Tamano del repositorio: 7,0 GB en disco; es el punto de partida para estimar el espacio de almacenamiento y la descarga inicial en el navegador.
- Memoria de GPU estimada para inferencia: en torno a los 7 GB si se mantienen residentes los cuatro grafos en su precision actual (estimacion derivada del tamano del repositorio; no confirmada por el autor).
- GPU recomendadas: no disponibles de forma explicita. Al ejecutarse via WebGPU en el navegador, depende de la GPU del equipo del usuario y del soporte de WebGPU en el navegador (por ejemplo, Chrome o Edge en versiones recientes).
- Cabe en GPU de consumo: probablemente en tarjetas con 8 GB o mas de VRAM (estimacion), aunque no hay cifras oficiales. En GPUs integradas o con poca memoria la ejecucion puede fallar o recurrir a memoria compartida con un rendimiento muy inferior.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (caso de uso principal, segun la model card) y, en general, cualquier runtime compatible con ONNX (por ejemplo, onnxruntime en Node.js o escritorio). No esta pensado para vLLM, llama.cpp, TGI ni Ollama, que son soluciones para modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen por completo del hardware del cliente y de la implementacion de WebGPU del navegador.

## Comparativa con modelos similares
| Modelo | Formato | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| danyalmalik/animagine-xl-3.1-ONNX-WebGPU | ONNX (opset 17), fp16/fp32 | Anime, inferencia en navegador via WebGPU | CreativeML Open RAIL++-M | Repositorio con 0 descargas y 0 likes en el momento de la consulta |
| cagliostrolab/animagine-xl-3.1 | Pesos difusion (modelo base) | Anime, generacion de imagenes de alta calidad | CreativeML Open RAIL++-M | Modelo de referencia de la serie, ampliamente utilizado |
| ecyht2/animagine-xl-3.1-onnx | ONNX | Conversion alternativa a ONNX del mismo modelo base | no disponible | Repositorio independiente en Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Pesos difusion | Generacion de imagenes de proposito general | CreativeML Open RAIL++-M | Modelo base de SDXL, referencia generalista |

Los recuentos de parametros y las metricas de rendimiento de estos modelos no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias
- Los pesos son ficheros modificados: las salidas son cercanas a las del modelo original, pero no identicas, por lo que puede haber diferencias de calidad o fidelidad respecto a la version de referencia.
- Riesgo de artefactos y resultados anatomicamente incorrectos, inherente a los modelos de difusion y no resuelto por la conversion.
- La licencia CreativeML Open RAIL++-M impone restricciones de uso recogidas en el parrafo 5 y en el anexo A (Attachment A): no se permite usar los ficheros ni sus derivados para los usos listados en dicho anexo, y su distribucion exige incluir esas restricciones como clausula exigible y entregar una copia de la licencia al destinatario.
- El uso comercial esta sujeto a los terminos de Open RAIL++; conviene revisar el anexo A antes de integrarlo en un producto.
- No se documentan idiomas soportados; el modelo base esta orientado a etiquetas de estilo anime, habitualmente en ingles o romaji, por lo que los prompts en otros idiomas pueden dar resultados pobres.
- Dependencia de WebGPU: la ejecucion en navegador requiere soporte de esta API, lo que limita los navegadores y dispositivos compatibles.
- El repositorio presenta 0 descargas y 0 likes, y fue creado y actualizado con apenas unos minutos de diferencia, por lo que no cuenta con validacion de la comunidad.
- El tamano de 7,0 GB supone una descarga considerable para el usuario final si se sirve desde el navegador.
- No hay informacion sobre sesgos especificos del conjunto de entrenamiento mas alla de la tematica anime.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/danyalmalik/animagine-xl-3.1-ONNX-WebGPU
- Modelo base: https://huggingface.co/cagliostrolab/animagine-xl-3.1
- Conversion ONNX alternativa: https://huggingface.co/ecyht2/animagine-xl-3.1-onnx
- Plantilla de despliegue en Inferless: https://github.com/akshay-anyscale/Animagine-xl-3.1
- Ficha en Civitai: https://civitai.com/models/260267/animagine-xl-v31
- Ficha de referencia: https://free2aitools.com/model/goonfffff/animagine-xl-3.1-onnx
