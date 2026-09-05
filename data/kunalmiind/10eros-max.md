# kunalmiind/10Eros-Max

## Resumen

El modelo 10Eros-Max es un sistema de generación de vídeo desarrollado por el usuario kunalmiind sobre la base de MiniMaxAI/MiniMax-H3. Su propósito declarado es ampliar las capacidades del modelo base para producir contenido explícito (NSFW), manteniendo al mismo tiempo la funcionalidad original de generación de vídeo a partir de texto o imágenes. El repositorio pesa 243,1 GB y su pipeline principal es image-text-to-video, aunque también admite text-to-video e image-to-video. Se trata de un modelo de gran tamaño, probablemente con una arquitectura de difusión o transformer de vídeo heredada de MiniMax-H3, pero no se han publicado especificaciones técnicas detalladas. El modelo se publica bajo la licencia comunitaria de MiniMax H3, con restricciones adicionales derivadas de los modelos fuente utilizados en su construcción (Wan 2.2, Krea 2 y LTX 2.3). Su relevancia radica en ser un ejemplo de modificación de modelos de vídeo de código abierto para adaptarlos a casos de uso no cubiertos por la versión original, así como en documentar una técnica de "injerto" (grafting) de características de otros modelos en las capas de atención.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: MiniMaxAI/MiniMax-H3) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (existe una versión int8 de terceros en cicalooo/10Eros-Max-h3-int8-convrot) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con condiciones adicionales de LTX 2.3, Wan 2.2 y Krea 2) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte de MiniMaxAI/MiniMax-H3, que actúa como base arquitectónica. El autor no detalla la arquitectura interna del modelo resultante, pero describe el proceso de construcción como un "injerto" (grafting) de datos procedentes de otros modelos de vídeo: Wan 2.2, Krea 2 y LTX 2.3. Según la documentación, estos datos se insertan en las capas de atención a un nivel bajo para no perturbar la calidad visual y de audio que ya ofrecía H3. El autor indica que el proyecto está en evolución y que futuras correcciones dependerán de los ajustes de entrenamiento de H3. No se aportan datos sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO. Tampoco se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imágenes (image-to-video e image-text-to-video).
- Generación de contenido explícito (NSFW) como función principal, además de conservar las capacidades del modelo base.
- Soporte de modos de referencia (referencia) y de inicio desde imagen, con la posibilidad de ajustar parámetros como SLA, Sparsity y shift para modificar el resultado.
- La versión beta_4 incluye un modelo híbrido construido sobre la combinación delta1024 de H3.
- No se documenta soporte de tool calling, razonamiento multi-paso ni capacidades multimodales más allá de vídeo e imagen.

## Casos de uso

- Generación de contenido audiovisual para audiencias adultas: el modelo está diseñado explícitamente para producir vídeo NSFW a partir de texto o imágenes, por lo que su uso principal es la creación de material para plataformas con control de edad.
- Creación de clips cortos con estilo personalizado: gracias a los injertos de Wan 2.2 y Krea 2, el modelo puede producir secuencias con una estética concreta, útil para artistas y creadores que buscan un look específico.
- Prototipado de escenas para producción cinematográfica: usando el modo image-to-video, un director puede partir de una imagen fija y generar una animación preliminar de una escena antes de rodar.
- Investigación en transferencia de estilos entre modelos de vídeo: el propio autor documenta la técnica de grafting, lo que permite a otros investigadores estudiar cómo incorporar características de un modelo en otro sin degradar la calidad base.
- Desarrollo de herramientas de edición de vídeo asistida: el modelo puede integrarse en aplicaciones que generen extensiones de un clip a partir de un fotograma inicial, facilitando la labor de montaje.
- Generación de storyboards animados para animadores: a partir de una imagen de referencia, el modelo puede producir una secuencia que sirva como guía visual para la producción final.
- Nota: el contenido NSFW no es apto para todos los públicos y su uso debe cumplir la legislación local y las licencias aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponibles.
- Capacidad para ejecutarse en GPUs de consumo: no disponible.
- Opciones de despliegue: no documentadas. El repositorio no incluye instrucciones de ejecución ni compatibilidad con frameworks como vLLM, llama.cpp o TGI.
- Nota: el tamaño del repositorio es de 243,1 GB, lo que sugiere que la inferencia requiere múltiples GPUs de alta gama, pero este dato es una inferencia, no una especificación oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El único modelo comparable directo es el propio MiniMaxAI/MiniMax-H3, pero no se han proporcionado especificaciones de ninguno de los dos.

## Limitaciones y advertencias

- El contenido es explícitamente NSFW y no está recomendado para todos los públicos.
- El autor advierte que la versión beta_3 está "algo corrupta" y solo funciona como modelo text-to-video, por lo que el uso de la versión beta_4 es preferible para los modos image-to-video y referencia.
- El uso de la función de referencia en la versión beta_3 puede provocar pérdida de precisión si se activan caché o espectro.
- Se desconocen los sesgos del modelo y el riesgo de alucinación, ya que no se han publicado evaluaciones.
- La licencia comunitaria de MiniMax H3 se aplica, pero también se trasladan las licencias de los modelos fuente (LTX 2.3, Wan 2.2 y Krea 2) a las partes correspondientes, lo que puede imponer restricciones adicionales de uso.
- No se han publicado instrucciones de despliegue ni requisitos de hardware, lo que dificulta su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kunalmiind/10Eros-Max
- Versión int8 de terceros: https://huggingface.co/cicalooo/10Eros-Max-h3-int8-convrot
- Modelo base MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio espejo (TenStrip/10Eros-Max): https://huggingface.co/TenStrip/10Eros-Max
