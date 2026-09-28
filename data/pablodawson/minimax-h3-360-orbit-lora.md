# pablodawson/MiniMax-H3-360-Orbit-LoRA

## Resumen

MiniMax-H3 360 Orbit LoRA es un adaptador LoRA publicado por el usuario pablodawson sobre MiniMax-H3, el modelo de difusión image-text-to-video de MiniMax. Su objetivo es muy concreto: convertir una única fotografía en una órbita de cámara de 360 grados con el tiempo congelado, de forma que la escena permanezca inmóvil y solo se mueva la cámara. Además, el clip termina exactamente en el fotograma con el que empezó, lo que permite encadenar varias órbitas o pegarlas en un plano más largo sin costura visible.

El adaptador se apoya en la variante FL2VA (first-last-frame to video+audio) del modelo base, que permite fijar el primer y el último fotograma de la generación. El problema que resuelve es doble: la variante Ref2VA trata las imágenes de entrada como meras referencias de apariencia y no cierra el clip en un fotograma conocido, mientras que FL2VA, cuando se le pasa la misma imagen como primer y último fotograma, tiende a congelarse y apenas mover la cámara. Este LoRA enseña al modelo una órbita geométricamente consistente manteniendo el anclaje exacto de los dos extremos en inferencia.

Se trata de un adaptador pequeño (el repositorio ocupa 0,2 GB) entrenado con 28 clips de órbitas renderizadas sobre Gaussian splats humanos, es decir, escenas 3D estáticas por construcción. No es un modelo de propósito general: está especializado en escenas congeladas y control de cámara, y su uso previsto es la generación de vídeo con consistencia 3D y loops perfectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo de difusión de vídeo MiniMax-H3, variante FL2VA; claves con nomenclatura estilo ComfyUI (`diffusion_model.*`) |
| Parametros totales | No disponible (el repositorio del adaptador ocupa 0,2 GB; el adaptador de entrenamiento no es necesario para inferencia) |
| Longitud de contexto | No aplica (modelo de vídeo): 73 fotogramas a 768 × 768 y 24 fps, aproximadamente 3 s de clip |
| Tipos de cuantizacion | No disponible para el LoRA; el modelo base probado se usa con el repack int8 ConvRot (`convrot8`) de Comfy-Org |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `other`) |
| Formato de pesos | No disponible |
| Modelo base | MiniMaxAI/MiniMax-H3 (variante FL2VA prune) |
| Relacion con el base | Adapter (`base_model_relation: adapter`) |
| Text encoder del base | Qwen3-VL-32B en nvfp4 |
| Entrenador | ostris/ai-toolkit, arquitectura `minimax_h3`, particion `fl2va_pruned` |
| Ajustes recomendados | 768 × 768, 73 fotogramas, 28 pasos, sin guidance (modelo distilado, sin CFG ni prompt negativo), fuerza LoRA 1.0, audio desactivado |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 179 / 31 |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre MiniMax-H3 en su variante FL2VA, podada y cuantizada en int8 ConvRot (`convrot8`), con el text encoder Qwen3-VL-32B en nvfp4. El entrenamiento se realizó con ostris/ai-toolkit y su extensión de modelo `minimax_h3`, con la partición `fl2va_pruned`. Durante el entrenamiento se utilizó el adaptador `ostris/minimax_h3_training_adapter` v1, que solo es necesario en esa fase y no en inferencia. MiniMax-H3 es un modelo distilado con guidance, por lo que no se emplea CFG ni prompt negativo en la generación.

El conjunto de datos son 28 clips de órbita renderizados alrededor de Gaussian splats humanos seleccionados manualmente. Como los splats son escenas 3D estáticas, cada fotograma es geométricamente consistente por construcción, de modo que el dataset muestra exactamente el movimiento que el LoRA debe aprender: la cámara se desplaza y nada más lo hace. Cada clip tiene formato 768 × 768, 73 fotogramas y 24 fps, sin audio, y todos comparten un único prompt como caption, con un caption dropout de 0,05. No se documentan tokens de entrenamiento, composición adicional del dataset, ni fases de RLHF o DPO, ya que se trata de un ajuste por adaptador y no de un reentrenamiento del modelo base.

## Capacidades

- Generación de vídeo a partir de una sola imagen: produce una órbita de cámara de 360 grados alrededor del sujeto.
- Control de cámara tipo first-last-frame (FL2VA): permite fijar el primer y el último fotograma de la generación.
- Consistencia geométrica 3D: la escena permanece congelada (posiciones, orientaciones, formas y poses) y solo se aprecia paralaje de cámara.
- Cierre sobre el primer fotograma: al usar la misma imagen como primer y último fotograma, el clip termina en el plano inicial, lo que facilita el encadenado y la unión de varias órbitas sin costura visible.
- Escenas congeladas: mantiene inmóviles rostros, manos, ropa, líquidos y fondo, conservando su apariencia natural.
- Prompt específico: el autor recomienda usar literalmente el prompt de instancia (una instantánea congelada, solo la cámara se mueve, órbita continua de 360 grados, sin cortes, zoom, morphing ni objetos añadidos).
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades multilingües declaradas: es un adaptador de generación de vídeo, no un modelo de lenguaje.

## Casos de uso

- Visualización de producto en comercio electrónico: a partir de una fotografía fija de un artículo se puede generar una órbita de 360 grados que muestre el objeto desde todos los ángulos, con la ventaja de que el encuadre vuelve exactamente al punto de partida y el clip se puede repetir en bucle sin salto visible.
- Postproducción y publicidad con efecto de tiempo congelado: escenas tipo "bullet time" donde los personajes quedan suspendidos y solo la cámara recorre el espacio, sin necesidad de montar un rig de múltiples cámaras.
- Previsualización cinematográfica (previs): generar un plano orbital de referencia a partir de un fotograma conceptual para validar encuadres y trayectorias de cámara antes de rodar.
- Refuerzo de pipelines de fotogrametría y Gaussian splatting: renderizar órbitas navegables alrededor de un splat o de una reconstrucción 3D con apariencia fotorrealista y movimiento de cámara coherente.
- Contenido para redes sociales: loops perfectos de 3 segundos (73 fotogramas a 24 fps) en 768 × 768 que se reinician sin corte, adecuados para publicaciones en bucle.
- Tours y recorridos virtuales encadenados: al terminar cada clip en su fotograma inicial, se pueden unir varias órbitas generadas con la misma imagen semilla para construir secuencias más largas sin transiciones visibles.
- Demostraciones técnicas de control de cámara: útil para investigar y comparar cómo se comporta una variante FL2VA con y sin adaptador cuando los dos keyframes coinciden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente comparaciones cualitativas con la misma semilla, prompt, resolución y número de pasos:

| Configuracion | Comportamiento descrito por el autor |
|---|---|
| Modelo base, solo primer fotograma | La cámara se mueve, pero se aleja y nunca regresa a la vista inicial |
| Modelo base, primer y último fotograma | Si ambos keyframes son la misma imagen, el modelo interpreta el clip como una imagen fija y apenas se mueve |
| Modelo base + este LoRA, primer y último fotograma | La cámara completa la órbita y vuelve al fotograma inicial, con movimiento fluido y sin cortes |

Las comparaciones completas (vídeos MP4 a resolución completa y WebP animados) están disponibles en el repositorio, con las variantes `skate`, `man2`, `girl2` y `man`. No se proporcionan métricas numéricas como FVD, CLIP score, PSNR ni valoraciones humanas cuantificadas.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, por lo que el coste de almacenamiento y de VRAM del LoRA es despreciable frente al del modelo base.
- La VRAM necesaria está dominada por MiniMax-H3 FL2VA; el autor no publica cifras de VRAM para la inferencia. No disponible.
- No se confirma si el sistema completo cabe en GPU de consumo. No disponible.
- GPU recomendadas: no disponible en la información proporcionada.
- Opciones de despliegue: los pesos usan nomenclatura de ComfyUI (`diffusion_model.*`) y se probaron con el repack int8 ConvRot de Comfy-Org/MiniMax-H3, lo que apunta a ComfyUI como entorno de inferencia. Para entrenamiento se empleó ostris/ai-toolkit con la arquitectura `minimax_h3`.
- Configuración de generación indicada: 768 × 768, 73 fotogramas, 28 pasos, sin CFG ni prompt negativo, fuerza LoRA 1.0, audio desactivado.
- Latencia y throughput: no disponible.
- El text encoder requerido por el modelo base es Qwen3-VL-32B en nvfp4, un componente adicional que también consume memoria.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de otros LoRA de control de cámara comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. La comparación cualitativa que sí aporta el autor se establece contra el propio modelo base:

| Configuracion | Cierre en el fotograma inicial | Orbita completa | Consistencia de escena congelada |
|---|---|---|---|
| MiniMax-H3 Ref2VA | No (las imágenes son solo referencias de apariencia) | No garantizada | No documentada |
| MiniMax-H3 FL2VA, primer fotograma | No | Parcial, deriva y no regresa | No documentada |
| MiniMax-H3 FL2VA, primer y último fotograma | Sí | No (apenas se mueve si ambos extremos coinciden) | No documentada |
| MiniMax-H3 FL2VA + este LoRA | Sí | Sí | Sí, según el autor |

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 28 clips de órbita, todos generados a partir de Gaussian splats humanos. El dominio es estrecho y puede no generalizar bien a otros tipos de escena, a animales, a objetos no humanos o a entornos con geometría ambigua.
- Está pensado para escenas congeladas. Si la imagen de entrada sugiere movimiento, el resultado puede degradarse, ya que el adaptador aprende precisamente que nada se mueve salvo la cámara.
- Requiere usar el mismo fotograma como primer y último keyframe para obtener el bucle de 360 grados; no está diseñado para órbitas parciales con extremos distintos.
- El autor recomienda emplear el prompt indicado de forma literal. Desviarse de ese texto puede alterar el comportamiento esperado.
- Al ser un modelo distilado con guidance, no admite CFG ni prompt negativo, lo que reduce el control fino sobre el resultado en inferencia.
- Riesgo de artefactos geométricos: a pesar del objetivo de consistencia 3D, la generación por difusión puede introducir morphing, objetos añadidos o deformaciones en manos, rostros, ropa y líquidos, precisamente los elementos que el prompt pide mantener inmóviles.
- No hay idiomas soportados declarados en la ficha del modelo.
- La licencia es minimax-h3-community-license-agreement (etiquetada como `other`). Antes de un uso comercial es imprescindible revisar los términos completos del acuerdo enlazado por el autor y del modelo base.
- Las claves están en nomenclatura de ComfyUI (`diffusion_model.*`), por lo que la carga en otras herramientas puede requerir conversión.
- No se documentan métricas objetivas de calidad ni evaluaciones independientes; solo comparaciones visuales del propio autor.
- La fecha de creación registrada en el repositorio es 2026-09-27, posterior a la fecha de actualización indicada (2026-09-27), dato que conviene verificar en la página del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repack int8 ConvRot del base (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Entrenador ai-toolkit: https://github.com/ostris/ai-toolkit
- Adaptador de entrenamiento: https://huggingface.co/ostris/minimax_h3_training_adapter
- Comparativas en vídeo (MP4): `media/skate_comparison.mp4`, `media/man2_comparison.mp4`, `media/girl2_comparison.mp4`, `media/man_comparison.mp4`
- Clips solo con LoRA (MP4): `media/skate_lora.mp4`, `media/man2_lora.mp4`, `media/girl2_lora.mp4`, `media/man_lora.mp4`
- Imagen de portada: `media/hero.webp`
