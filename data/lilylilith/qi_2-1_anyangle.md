# lilylilith/QI_2.1_AnyAngle

## Resumen

QI_2.1_AnyAngle es un adaptador LoRA desarrollado por el usuario lilylilith para el modelo de edición de imágenes Qwen/Qwen-Image-2.1. Su función es permitir cambios arbitrarios de ángulo de cámara (azimut y elevación continuos) sobre una imagen de partida, manteniendo la coherencia estilística, en lugar de limitarse a los ángulos fijos que suelen ofrecer los modelos de edición de imagen. El repositorio ocupa 0,1 GB, tiene licencia Apache 2.0 y pipeline declarado de image-to-image.

El método no es una edición directa por prompt: se reconstruye la escena como Gaussian Splat o modelo 3D (Tripo Splat, Trellis2/Pixal3d), se importa en Blender, se coloca una cámara nueva en el ángulo deseado y se renderiza una imagen gruesa. Esa imagen gruesa se introduce como referencia junto con la original en Qwen-Image-2.1, y el LoRA transfiere el ángulo de la referencia a la imagen original.

El adaptador es relevante porque ataca dos problemas recurrentes: la falta de control angular real en edición de imagen y la deriva de estilo cuando el cambio de perspectiva es grande. Al apoyarse en geometría renderizada en lugar de generar la escena desde cero, buena parte de la información espacial deja de alucinarse. La model card no publica número de parámetros, rango del LoRA ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de edición de imagen Qwen-Image-2.1; la arquitectura interna del adaptador no se detalla en la información disponible |
| Parametros totales | no disponible (no se indica rango ni número de parámetros; el repositorio ocupa 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no se documenta el límite de tokens de prompt) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible (la model card está en inglés y no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se especifica en la información proporcionada) |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Tipo de artefacto | Adaptador LoRA |
| Tarea declarada (pipeline) | image-to-image |
| Fuerza de LoRA recomendada | 1 (según la model card) |
| Ajustes de muestreo recomendados | CFG 3.0 y 20 pasos o más |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicación | 28 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 31 |

## Arquitectura y entrenamiento

El artefacto es un LoRA que se aplica sobre Qwen-Image-2.1, un modelo de edición de imágenes del que no se detallan en esta información ni el número de parámetros ni la arquitectura interna. El adaptador trabaja con dos entradas de imagen: la original (ancla) y un render grueso de la misma escena desde el ángulo objetivo. La instrucción de edición utilizada es `Change the camera angle from <image2> to <image1>.`

El entrenamiento se construyó con renders reales de Blender, estilísticamente diversos, más imágenes generadas con el modelo de vídeo MiniMax H3 para cubrir ilustración digital. Para cada ejemplo se recopila una imagen original y un fotograma en un ángulo distinto; a partir del objetivo se genera un Gaussian Splat o un modelo 3D que se usa como "render grueso" de control. Con ese conjunto se entrena el LoRA durante unos pocos miles de pasos. La idea central es que, en el caso de los renders reales de Blender, nada se alucina, y para estilos ilustrados se emplean órbitas image-to-video de MiniMax H3 con la escena estática para maximizar la consistencia. No se documentan en la información disponible detalles como el optimizador, el rango del LoRA o la composición exacta del dataset.

## Capacidades

- Edición de imagen image-to-image sobre el modelo base Qwen-Image-2.1.
- Transferencia de ángulo de cámara arbitrario desde una imagen de referencia hacia una imagen original, sin restringirse a azimuts y elevaciones fijos.
- Preservación de estilo en cambios de perspectiva grandes, apoyada en geometría renderizada en lugar de generación libre.
- Funciona con estilos fotorrealistas (renders de Blender) y también con ilustración y boceto, gracias a los datos derivados de MiniMax H3.
- Integración en un flujo de trabajo por etapas: generador de Gaussian Splat o modelo 3D, Blender para colocar la cámara y renderizar, y Qwen-Image-2.1 con el LoRA para el render final.
- Compatibilidad con LoRA de tipo turbo para reducir latencia en tareas de previsualización o planificación de planos, a costa de una ligera pérdida de calidad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio o vídeo, ni cobertura multilingüe de prompts.

## Casos de uso

- Previsualización de producto en comercio electrónico: se parte de una fotografía del producto, se reconstruye un splat o modelo 3D, se renderiza en Blender desde varios ángulos y el LoRA traslada cada ángulo a la imagen original conservando materiales y estilo, lo que permite generar un catálogo multivista sin volver a fotografiar el artículo.
- Planificación de planos y storyboard: con un LoRA turbo y los ajustes recomendados (CFG 3.0, 20 pasos o más) se pueden iterar encuadres y ángulos con latencia reducida para decidir la puesta en escena antes de producir el render final de calidad.
- Ilustración y cómic con personajes consistentes: el modelo fue entrenado con órbitas image-to-video para estilos ilustrados, de modo que se puede generar un turn-around del personaje manteniendo el diseño y el trazo en lugar de redibujarlo en cada vista.
- Ampliación de datasets de visión por computador: generar vistas coherentes en estilo de un mismo objeto o escena para aumentar datos de entrenamiento de modelos 3D, reconstrucción (NeRF, Gaussian Splatting) o detección, evitando las variaciones de apariencia que introducen los aumentos puramente 2D.
- Fotografía de arquitectura e interiores: a partir de una reconstrucción 3D del espacio se renderizan vistas alternativas de una estancia y el LoRA las traslada a la fotografía original, útil para presentar un mismo espacio desde varios puntos de vista sin repetir la sesión.
- Concept art para videojuegos y cine: explorar ángulos de una localización manteniendo la paleta y el acabado artístico de la imagen de referencia, lo que acelera la comunicación entre dirección de arte y modelado.
- Corrección de encuadre en retoque fotográfico: cuando la toma original tiene un ángulo poco favorable, se reconstruye el sujeto en 3D, se elige el ángulo deseado y se transfiere a la fotografía conservando la iluminación y el estilo de la imagen de partida.
- Producción de variantes para marketing: obtener varios encuadres de una misma imagen clave para distintos formatos y canales partiendo de un único material fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí es pequeño: el repositorio ocupa 0,1 GB, por lo que su peso no es el factor limitante.
- La VRAM necesaria viene determinada por el modelo base Qwen-Image-2.1 y por el generador de Gaussian Splat o modelo 3D empleado en el flujo; no se especifican cifras en la información disponible.
- No se indica si el conjunto del pipeline cabe en GPU de consumo ni qué modelos concretos de GPU se recomiendan.
- Opciones de despliegue: la model card describe un flujo por etapas (generación de splat o malla 3D, importación y render en Blender, inferencia con Qwen-Image-2.1 más el LoRA). No se documentan integraciones específicas con servidores de inferencia como vLLM, TGI, Ollama o llama.cpp, ni un formato de pesos concreto.
- Latencia y throughput: no disponibles. Se recomienda un mínimo de 20 pasos de muestreo con CFG 3.0, y la propia model card sugiere usar un LoRA turbo para reducir latencia en tareas de previsualización, asumiendo una pérdida leve de calidad.
- Herramientas de terceros mencionadas por el autor en el flujo: Tripo Splat, Trellis2/Pixal3d y Blender.

## Comparativa con modelos similares

| Modelo | Tipo | Control de angulo de camara | Preservacion de estilo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QI_2.1_AnyAngle (este) | LoRA sobre Qwen-Image-2.1 | Ángulos continuos de azimut y elevación, guiados por un render 3D de referencia | Alta en renders reales (nada se alucina); depende de la calidad del splat o malla en estilos ilustrados | Apache 2.0 | HuggingFace |
| Qwen-Image-2.1 sin adaptador | Modelo de edición de imagen base | Según prompt; en la práctica tiende a ángulos fijos | Riesgo de deriva de estilo con cambios angulares grandes | No disponible en esta información | HuggingFace |
| Modelos de edición tipo Qwen Image Edit o FLUX.2 | Modelos de edición de imagen | Ángulos fijos en la mayoría de los casos, según la model card | Riesgo de deriva de estilo | No disponible en esta información | No disponible en esta información |

No se dispone de datos de parámetros, longitud de contexto ni resultados de benchmarks de estas alternativas en la información proporcionada, por lo que la comparación es cualitativa.

## Limitaciones y advertencias

- Dependencia fuerte de la calidad del Gaussian Splat o modelo 3D intermedio: si la reconstrucción no es espacialmente correcta o es demasiado basta, el resultado presenta errores de disposición de objetos. El propio autor documenta un caso con una mesa y una coleta mal colocadas.
- Caras malformadas cuando los rostros no están bien definidos en la imagen de entrada o cuando la resolución es baja.
- No es una edición de un solo paso: requiere un generador de splat o malla 3D, Blender y el modelo base, lo que añade complejidad operativa y puntos de fallo al pipeline.
- El conjunto de entrenamiento combina renders reales de Blender con salidas generadas por MiniMax H3; conviene revisar las condiciones de uso de esas fuentes antes de un despliegue comercial.
- Aunque el adaptador se publica bajo Apache 2.0, el uso comercial del conjunto depende también de la licencia del modelo base Qwen-Image-2.1, que debe verificarse por separado.
- Sin benchmarks publicados por el autor, la evaluación de calidad es puramente cualitativa y basada en los ejemplos de la model card.
- Señales de validación comunitaria limitadas: 0 descargas y 31 likes en el momento de la consulta.
- No se especifican idiomas soportados; el prompt de edición facilitado está en inglés.
- Riesgo de alucinación y distorsión estructural mayor en estilos ilustrados y de boceto (datos generados por vídeo) que en escenas renderizadas con geometría real.
- El uso óptimo exige respetar los ajustes recomendados (fuerza de LoRA 1, CFG 3.0, 20 pasos o más); usar un LoRA turbo acelera la inferencia pero degrada la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lilylilith/QI_2.1_AnyAngle
- Modelo base Qwen Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor en Civitai: https://civitai.com/user/lilylilith
- Apoyo al autor (Ko-fi): https://ko-fi.com/lilllithhhhh
- Flujo de generación de mundo 3D citado por el autor: https://www.youtube.com/watch?v=eJuYBNrD8HI
- Ejemplo de flujo de conexiones del autor: https://cdn-uploads.huggingface.co/production/uploads/638aeb590f10aa3064f42a80/PcRjfdCsXApBYOnAn5063.png
