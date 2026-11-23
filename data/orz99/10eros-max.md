# orz99/10Eros-Max

## Resumen

10Eros-Max es un ajuste fino (fine-tune) del modelo de generación de vídeo MiniMaxAI/MiniMax-H3, desarrollado por el usuario orz99 y publicado en Hugging Face. Se trata de un modelo de imagen-texto-a-vídeo (image-text-to-video) que combina técnicas de fusión de LoRAs, grafts por grupos conceptuales y deltas de turbo para producir vídeo a partir de una o varias imágenes de referencia, texto y, opcionalmente, audio de referencia para el timbre vocal. El repositorio ocupa 759,3 GB y se distribuye bajo la licencia comunitaria de MiniMax H3.

El modelo parte de la arquitectura de MiniMax-H3 (no se detalla en la información disponible) y aplica una hibridación con el modelo denominado "fl2va" y el timestep "Fast Omni", además de incorporar datos del tune "Sulphur3". La model card describe múltiples versiones beta (beta_3 a beta_7) y una versión v1.0 que combina beta5, beta7 y Sulphur3 sobre una base híbrida fl2va, orientada a referencias multi-imagen o a entradas de primer/último fotograma con audio de referencia opcional.

Es relevante ahora por su enfoque en la generalización y adaptabilidad a imágenes y poses de entrada, así como por la inclusión de anatomía y movimientos NSFW, lo que lo sitúa en un nicho específico de generación de vídeo. El autor advierte que el modelo puede tener menos conocimiento general que la base, pero es más adaptable, y que las LoRAs de H3 estándar a alto rank degradan la imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de MiniMax-H3, con hibridación fl2va y timestep Fast Omni) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Versiones int8 disponibles en repositorio externo (cicalooo/10Eros-Max-h3-int8-convrot) |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | No disponible (el repositorio ocupa 759,3 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MiniMax-H3 ni el número de parámetros. La model card describe que 10Eros-Max se construye mediante una combinación de versiones beta (beta5, beta7 y Sulphur3) sobre una base híbrida fl2va con un 5% del timestep de referencia real por proyección. La versión beta_7 emplea una proyección Omni adaln más completa, cabezas pdd y capa final, con mezcla alfa para corregir hacia versiones beta7 anteriores. La beta_5 se construye con una técnica de normalización distinta, a partir de 7 grafts agrupados por concepto y fusiones de consenso de más de 20 LoRAs, sin fusiones directas de LoRAs.

El entrenamiento incluye fusiones de LoRAs premezcladas y convertidas a versiones solo-MLP, fusionadas con límite de magnitud, dejando intactas la atención y la referencia del modelo base. El autor sugiere que las LoRAs de H3 deberían entrenarse solo en MLP y a ranks mucho más bajos. La versión beta_7 incorpora un turbo de 8 pasos que cubre de 6 a 12 pasos, con la v-band en base para evitar ganancias de contraste. La beta_5 incluye una fusión híbrida de delta turbo que ahorra 4,2 GB de memoria. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de vídeo a partir de texto e imágenes (text-to-video, image-to-video, image-text-to-video).
- Entrada de referencia multi-imagen o de primer y último fotograma para guiar la generación.
- Referencia de audio opcional para el timbre vocal.
- Generación de anatomía y movimientos NSFW (según la model card).
- Adaptabilidad a imágenes y poses de entrada, con capacidad tomada del tune Sulphur3.
- Soporte de muestreo con distintos samplers y schedulers: er_sde/beta, res_multistep/simple, LCM/simple, LCM/beta, Euler/simple.
- Soporte de pasos turbo (8 pasos, rango 6-12) y versiones no-turbo ("raw") para usar con otros turbos como pika.
- Soporte de sparsity VSA (10% de sparsity) y SLA (13% de sparsity) en todos los bloques con inicio en 0.2.
- No se documenta soporte de tool calling, function calling ni agentes.

## Casos de uso

- Generación de vídeo a partir de una imagen de referencia: el modelo acepta una imagen de entrada y genera una secuencia de vídeo coherente, adecuado para animar retratos o ilustraciones con control de pose.
- Animación de primer y último fotograma: permite interpolar entre dos imágenes clave, útil para crear transiciones o animaciones con control de inicio y fin.
- Referencia multi-imagen: se pueden aportar varias imágenes de referencia para mantener la consistencia de personajes o escenarios a lo largo del vídeo.
- Generación de vídeo con audio de referencia: la opción de audio de referencia para timbres vocales permite sincronizar o guiar la generación con una pista de audio, útil para doblaje o vídeos musicales.
- Creación de contenido NSFW: la model card indica que la mayoría de anatomías y movimientos NSFW son posibles, orientado a creadores de contenido para adultos.
- Iteración rápida con turbo de 8 pasos: la versión turbo permite generar vídeo en 6-12 pasos, adecuada para prototipado rápido y exploración de prompts.
- Integración en flujos de trabajo con upscale: el autor recomienda un pase de upscale 3D espacial para suavizar el latente y eliminar el flickering, útil en pipelines de producción de vídeo de alta resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 759,3 GB, lo que implica requisitos de almacenamiento muy elevados para los pesos completos.
- VRAM estimada para inferencia: no disponible. El tamaño del modelo y la falta de datos de parámetros impiden una estimación fiable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El tamaño del repositorio sugiere que no cabe en GPU de consumo sin cuantización agresiva.
- Opciones de despliegue: no se documentan en la información disponible; se mencionan flujos de trabajo externos en Hugging Face (LokkenJP/TenEros_Max_optimized_learned) y versiones int8 en un repositorio externo.
- Latencia y throughput: no disponibles. La model card menciona configuraciones de 8-12 pasos con samplers específicos, pero sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| 10Eros-Max | No disponible | No disponible | minimax-h3-community-license-agreement | Hugging Face (orz99/10Eros-Max) |
| MiniMaxAI/MiniMax-H3 (base) | No disponible | No disponible | minimax-h3-community-license-agreement | Hugging Face (MiniMaxAI/MiniMax-H3) |
| Sulphur3 (tune referenciado) | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte que el modelo puede tener menos conocimiento general que la base H3 en algunos temas.
- Las LoRAs de H3 estándar a alto rank en atención funcionan mal y degradan la imagen; se recomienda usar LoRAs downranked y probadas.
- El modelo es propenso a "flickering" en el fondo y en el latente en flujos de un solo pase sin muestreo refinado; se recomienda un pase de upscale 3D espacial para eliminarlo.
- La versión beta_6 debe evitarse; las beta_3 y beta_4 están corruptas; solo beta_5 es funcional según el autor.
- No usar cache o spectrum si se hace referencia, ya que causan pérdida de precisión.
- SLA sparsity destruye el modelo en algunos flujos (beta_6); evitar su uso en esos casos.
- El audio en versiones turbo es de menor calidad que en versiones no-turbo de pasos completos.
- La licencia es la minimax-h3-community-license-agreement, que puede imponer restricciones para uso comercial; no se detallan en la información disponible.
- El contenido NSFW puede estar sujeto a restricciones legales y de plataforma según la jurisdicción.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos más allá de los inherentes a los modelos generativos de vídeo.
- El tamaño del repositorio (759,3 GB) y la falta de datos de parámetros dificultan la planificación de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/orz99/10Eros-Max
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Flujo de trabajo: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/SampleWorkFlowTwoPassOptimized
- LoRAs: https://huggingface.co/TenStrip/MMH3_Sulphur3Eros_Loras-MLP-energy-patches
- Versión int8: https://huggingface.co/cicalooo/10Eros-Max-h3-int8-convrot
