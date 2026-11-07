# Infinix-io/Drama-3-ComfyUI

## Resumen

Drama-3-ComfyUI es una conversión del modelo de síntesis de voz Fish Audio Drama 3 para su uso con los nodos nativos de ComfyUI del proyecto ComfyUI-Drama3. El modelo original es un sistema text-to-speech de 35.000 millones de parámetros desarrollado por Fish Audio, orientado a escenas multi-personaje, contenido de formato largo, clonación de voz y control mediante lenguaje natural. Esta versión empaqueta los pesos en archivos únicos de safetensors con distintos esquemas de cuantización de los expertos, de modo que el modelo pueda ejecutarse en tarjetas gráficas desde 8 GB de VRAM.

La relevancia de esta conversión radica en que hace viable un modelo de 35B en hardware de consumo: aproximadamente el 90% de los parámetros son expertos enrutados (arquitectura MoE) y cada trama de audio activa solo 8 de los 256 expertos por capa. Los nodos de ComfyUI mantienen los expertos en RAM del sistema y mantienen en la GPU una caché de los que están en uso, lo que reduce drásticamente los requisitos de VRAM a costa de necesitar entre 32 y 48 GB de RAM del sistema.

El repositorio tiene un tamaño de 136,1 GB e incluye varios archivos de pesos (FP8, int8, W6A8 y W4A8) más un códec separado. Está publicado bajo la Fish Audio Community License y no registra descargas ni likes en el momento de la consulta. La información sobre idiomas soportados no está declarada formalmente en la model card, aunque los ejemplos incluyen inglés y portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 90% de los parametros son expertos enrutados, 8 de 256 activos por capa y trama de audio |
| Parametros totales | 35B (aproximadamente) |
| Parametros activos | 8 de 256 expertos por capa (no se especifica el numero exacto de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (expertos originales), int8 ConvRot, W6A8, W4A8; capas bf16 en todos los archivos |
| Idiomas soportados | no disponible (los ejemplos de la model card incluyen ingles y portugues) |
| Licencia | Fish Audio Community License (license: other) |
| Formato de pesos | safetensors (archivo unico por variante) mas codec separado en safetensors fp32 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer con mezcla de expertos (MoE) en la que la mayor parte de la capacidad parametrica reside en expertos enrutados: alrededor del 90% de los 35B. En cada capa, cada trama de audio activa unicamente 8 de los 256 expertos disponibles, lo que mantiene el coste computacional por paso muy por debajo de lo que sugeriria el tamano total. Esta conversion conserva los pesos de los expertos tal como los distribuye Fish Audio en FP8, junto con las capas del checkpoint en bf16.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativa. El modelo se distribuye con un codec de audio separado (1,6 GB en fp32) que es necesario para todas las variantes de pesos. La conversion a ComfyUI no modifica los pesos originales en la variante FP8, que se presenta como copia byte a byte de los pesos de Fish Audio.

## Capacidades

- Sintesis de voz (text-to-speech) de alta fidelidad a partir de texto.
- Clonacion de voz a partir de un clip de referencia corto.
- Generacion multi-personaje con etiquetas de hablante (`<|speaker:0|>`, `<|speaker:1|>`, etc.), incluyendo reparto automatico de voces cuando no se proporcionan.
- Control mediante indicaciones en lenguaje natural entre corchetes, como `[whispers]`, `[sighs]`, `[laughs]`, `[pause]`, `[singing]` o descripciones de estilo.
- Generacion de dialogo con multiples interlocutores en una sola pasada.
- Canto con control de estilo (operistico, suave, etc.).
- Soporte multilingue parcial: la model card demuestra ingles y portugues, aunque no se declara una lista oficial de idiomas.
- Capacidad de generar voces inventadas a partir del prompt, sin necesidad de referencia de audio.

## Casos de uso

- Produccion de audiolibros y ficcion sonora: el modelo puede narrar dialogos multi-personaje con etiquetas de hablante y cues expresivos, manteniendo coherencia de voz a lo largo de pasajes largos gracias a la clonacion por referencia.
- Doblaje y localizacion de contenido: la clonacion de voz permite generar nuevas lineas con la misma voz de un personaje a partir de un clip fuente, util para versiones en otros idiomas o correcciones de guion.
- Creacion de contenido para podcasts y radio: la generacion de dialogos entre varios hablantes y los cues de estilo permiten producir escenas conversacionales completas sin grabacion humana.
- Prototipado de videojuegos y experiencias interactivas: los nodos de ComfyUI permiten integrar la sintesis en flujos de generacion de assets, asignando voces a personajes y generando lineas con control de emocion.
- Accesibilidad y lectura en voz alta: la sintesis de texto a voz con control de estilo y pausas puede emplearse para convertir documentos o interfaces en audio natural.
- Investigacion en sintesis de voz y evaluacion de modelos TTS: la disponibilidad de cuatro variantes de cuantizacion (FP8, int8, W6A8, W4A8) permite estudiar el impacto de la compresion en la calidad y estabilidad de la generacion.
- Generacion de jingles, canticos o contenido musical ligero: la capacidad de canto con control de estilo cubre casos de produccion de audio creativo de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente aporta datos comparativos de velocidad entre variantes de cuantizacion: el archivo int8 se midio entre un 14% y un 17% mas rapido que FP8 en una RTX 3090, y las variantes W6A8 y W4A8 reducen el uso de RAM del sistema a aproximadamente 40 GB y 32 GB respectivamente, a costa de una mayor tasa de tomas silenciosas con clips de voz reales en el caso de W4A8.

## Requisitos de hardware

- VRAM: desde 8 GB para las variantes mas comprimidas; los nodos mantienen los expertos en RAM del sistema y una cache de los activos en la GPU.
- RAM del sistema: aproximadamente 48 GB para FP8 e int8, 40 GB para W6A8 y 32 GB para W4A8.
- GPU recomendadas: RTX 3090 (probada con int8, 14-17% mas rapida que FP8), tarjetas consumer desde 8 GB de VRAM y GPUs de centro de datos (A100, H100) para despliegues de mayor throughput.
- Cabe en GPU consumer: si, desde 8 GB de VRAM, condicionado a disponer de 32-48 GB de RAM del sistema.
- Opciones de despliegue: nodos nativos de ComfyUI (ComfyUI-Drama3, requiere ComfyUI v0.40 o superior); el modelo original se ejecuta sobre SGLang-Omni segun la informacion de Fish Audio.
- Latencia y throughput: no disponibles de forma absoluta; solo se documenta la comparativa relativa entre cuantizaciones en RTX 3090.
- Almacenamiento: el repositorio ocupa 136,1 GB; cada archivo de pesos individual pesa entre 24,6 GB y 38,7 GB, mas 1,6 GB del codec.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Drama-3-ComfyUI (esta ficha) | 35B (MoE) | no disponible | Fish Audio Community License | Hugging Face, ComfyUI | Conversion para nodos nativos de ComfyUI, 4 variantes de cuantizacion |
| Fish Audio Drama 3 (original) | 35B (MoE) | no disponible | Fish Audio Community License | Hugging Face, SGLang-Omni | Modelo base sin conversion; soporte nativo en SGLang-Omni |
| Qwen3-ASR (1.7B) | 1,7B | no disponible | no disponible | Hugging Face | Modelo ASR, no TTS; citado en la model card para transcripciones |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo de Drama 3 frente a otras alternativas TTS de la misma categoria.

## Limitaciones y advertencias

- La licencia Fish Audio Community License impone restricciones que deben revisarse antes de cualquier uso comercial; no es una licencia de codigo abierto permisiva.
- El modelo requiere el codec separado (1,6 GB) ademas de los pesos; no es autocontenido en un solo archivo.
- La variante W4A8 presenta una mayor tasa de tomas silenciosas con clips de voz reales, lo que puede producir omisiones de frases en produccion.
- Los requisitos de RAM del sistema (32-48 GB) son elevados y limitan el despliegue en equipos de gama baja aunque la VRAM sea suficiente.
- No se declara una lista oficial de idiomas soportados; la evidencia se limita a ejemplos en ingles y portugues.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de calidad objetivas.
- La clonacion de voz plantea riesgos de suplantacion y uso indebido; es responsabilidad del usuario cumplir la normativa aplicable sobre sintesis de voz.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validacion por parte de la comunidad.
- Los nodos requieren ComfyUI v0.40 o superior y no necesitan `pip install`, pero dependen del proyecto externo ComfyUI-Drama3 para su mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Infinix-io/Drama-3-ComfyUI
- Modelo original: https://huggingface.co/fishaudio/drama-3
- Nodos en GitHub: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Pagina de demos y muestras: https://pedromarinhodev.github.io/ComfyUI-Drama3/
- Qwen3-ASR para transcripciones: https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI
- Referencia adicional (Infinix-ai/drama-3): https://huggingface.co/Infinix-ai/drama-3
- README de la conversion: https://huggingface.co/PedroMarinhoDev/Drama-3-ComfyUI/blob/main/README.md
