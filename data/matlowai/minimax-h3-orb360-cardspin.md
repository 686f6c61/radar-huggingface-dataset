# MATLOWAI/MiniMax-H3-ORB360-CardSpin

## Resumen

MiniMax-H3 ORB360 CardSpin es un adaptador LoRA de rango 32 publicado por MATLOWAI sobre el modelo base MiniMaxAI/MiniMax-H3 en su variante Ref2VA. El problema que resuelve es de control de cámara y de objeto en generación de vídeo a partir de una imagen de referencia: con un único fichero de pesos y cambiando solo el prompt, el adaptador activa dos comportamientos distintos, `ORB360_CARDSPIN` y `ORB360_CW`.

El modo `ORB360_CARDSPIN` convierte la fotografía de entrada en una tarjeta física fina que gira en el espacio; la persona o el animal retratado gira con ella, de modo que se ve el perfil en el canto de la tarjeta (con la nariz sobresaliendo del borde), la nuca en el reverso, el otro perfil en la vuelta y un aterrizaje limpio sobre la foto original tras exactamente 5,125 s. El modo `ORB360_CW` es la órbita de cámara circular completa, suave y en sentido horario, alrededor de un sujeto congelado, que termina en el plano inicial.

El interés técnico del proyecto está en su origen: el efecto no se entrenó con un conjunto de datos, sino que se descubrió como un fallo de generalización al aplicar un LoRA de órbita entrenado con renders grises de Blender sobre un retrato histórico real, el retrato de Sir John Herschel de 1867 obra de Julia Margaret Cameron. El autor capturó ese clip, lo anotó con marcas temporales y añadió 50 pasos de entrenamiento sobre el LoRA de órbita de 750 pasos usando exclusivamente ese clip, lo que bastó para transferir el efecto a fotografías nunca vistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 32 sobre el modelo base MiniMax-H3 Ref2VA; el pipeline de inferencia usa un DiT (`--dit`), un VAE de vídeo, un VAE de audio y un text encoder Qwen3-VL de 32B |
| Parametros totales | no disponible (los pesos son un LoRA de rango 32 con 200 modulos; el repositorio ocupa 0,6 GB, assets incluidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye sin cuantizar en safetensors); la receta oficial de uso emplea DiT en bf16, VAE de vídeo en fp16, VAE de audio en fp32 y text encoder Qwen3-VL en int8 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (campo `license: other`) |
| Formato de pesos | safetensors, LoRA estilo kohya (`lora_unet_*`, `lora_down`/`lora_up`/`alpha`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino un adaptador LoRA de rango 32 pensado para acoplarse a la variante Ref2VA de MiniMax-H3, que trabaja con vídeo y audio. El adaptador se compone de 200 módulos que, según el autor, mapean íntegramente sobre los pesos de MiniMax-H3 en ComfyUI. La inferencia completa encadena un DiT en bf16, un VAE de vídeo en fp16, un VAE de audio en fp32 y un text encoder Qwen3-VL de 32B en int8, con modos de atención sdpa y la opción `--prune_adaln`. Los prompts siguen la plantilla oficial de Ref2VA de MiniMax (`subject_definitions`, `summary`, `retention_analysis`, `detailed_description`, `overall_soundscape`, `non_diegetic_music`).

El entrenamiento se hizo en dos etapas con musubi-tuner, según el autor. La primera es el proyecto ORB360: un LoRA de órbita entrenado sobre renders grises de Blender. Al probarlo sobre fotos reales en lugar de esos renders, el modelo trató la propia fotografía como el objeto a orbitar, lo que produjo un clip de partida no buscado. La segunda etapa partió de ese clip único: se escribió una caption descriptiva con marcas temporales y se entrenaron 50 pasos adicionales sobre el LoRA de órbita de 750 pasos, alrededor de media hora en una sola GPU. El efecto se transfirió a retratos de Cameron no vistos y a una foto en color de un gato con sombrero. El autor comprobó también 100 y 150 pasos, con bordes de tarjeta algo más nítidos, pero publicó la variante de 50 pasos por ser la más ligera sobre el comportamiento de órbita original.

## Capacidades

- Generación de vídeo a partir de una única imagen de referencia (`--ref`), que actúa como primer y último fotograma.
- Control de cámara: órbita circular completa, suave, en sentido horario, alrededor de un sujeto congelado, con retorno al plano inicial (`ORB360_CW`).
- Efecto de tarjeta: la fotografía se comporta como una tarjeta física fina y gira sobre sí misma, con las caras del sujeto repartidas entre el canto, el reverso y la vuelta (`ORB360_CARDSPIN`).
- Sincronización temporal guiada por prompt: el modo de tarjeta asume marcas concretas, con el canto a 1,0 s, el reverso desde 1,7 s, el otro perfil a 3,8 s y el regreso a la foto a 5,125 s.
- Dos comportamientos desde un mismo fichero de pesos, seleccionados por el texto del prompt y no por el peso del LoRA.
- Generación con pista de audio controlable: si las secciones `overall_soundscape` y `non_diegetic_music` se marcan como `N/A`, se solicita silencio y se evita que el modelo base invente una banda sonora.
- Entrada en color y en impresiones sepia antiguas; el autor señala los retratos de personas y animales como el caso donde mejor funciona.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe.

## Casos de uso

- Catálogos de producto con giro de tarjeta: a partir de una foto de producto recortada, `ORB360_CARDSPIN` genera un clip donde el producto gira como una tarjeta física; útil para escaparates y fichas de e-commerce donde se busca un efecto de transición llamativo sin montaje manual.
- Órbita de producto de 360 grados: con `ORB360_CW` sobre una foto de estudio del producto, se obtiene un giro completo de cámara con retorno al plano inicial, directamente encadenable en bucles de vídeo de ficha de producto.
- Reels y contenido corto para redes sociales: la pieza dura 124 fotogramas a 24 fps (unos 5,17 s) y encaja con formatos verticales de 672 x 832 y 832 x 1024 que el autor confirma que funcionan.
- Recuperación de archivo fotográfico histórico: el efecto nace de un retrato de Julia Margaret Cameron y el autor lo verificó sobre otras obras de la misma autora, por lo que resulta adecuado para animar retratos de archivo en sepia para exposiciones o publicaciones divulgativas.
- Fotografía de mascotas y retratos personales: el autor identifica explícitamente los retratos de personas y animales como el punto óptimo, lo que permite ofrecer clips conmemorativos a partir de una sola foto del cliente.
- Ilustración editorial y piezas de portada: el giro de tarjeta aporta un recurso visual reutilizable para cabeceras de artículo, portadas de podcast o cortinillas, partiendo de una única imagen y un prompt fijo de `prompts/cardspin_caption.txt`.
- Previsualización de efectos en preproducción: dado que el adaptador se puede cargar y descargar como módulo en ComfyUI con el nodo Load LoRA, sirve para probar la viabilidad de un plano de giro antes de comprometer recursos de render en 3D.
- Rotación en 360 grados de objetos para visores o tiendas interactivas: los clips de órbita generados pueden servir como capas intermedias en visores web donde se necesita una vuelta completa suave y con cierre sobre el plano inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card sí recoge observaciones cualitativas del autor que conviene registrar como tales y no como métricas: el efecto se transfirió a fotografías no vistas tras 50 pasos; las variantes de 100 y 150 pasos producen bordes de tarjeta algo más nítidos pero actúan con más fuerza sobre el comportamiento de órbita; y la semilla influye en cuánto se compromete cada generación con el efecto de tarjeta, por lo que el autor recomienda probar varias.

## Requisitos de hardware

- El adaptador en sí ocupa una fracción de los 0,6 GB del repositorio, pero no funciona de forma autónoma: requiere el modelo base MiniMax-H3 Ref2VA completo.
- Componentes que deben residir en memoria durante la inferencia según la receta del autor: DiT en bf16 (`minimax_h3_ref2va_bf16.safetensors`), VAE de vídeo en fp16, VAE de audio en fp32 y text encoder Qwen3-VL de 32B cuantizado a int8.
- El text encoder es un Qwen3-VL de 32B en int8, lo que por sí solo supone un requisito de memoria elevado; no se especifica la VRAM total necesaria en la información disponible.
- GPU recomendadas: no disponible. La model card no indica GPU concretas ni para inferencia ni para entrenamiento.
- Entrenamiento: 50 pasos adicionales sobre el LoRA de 750 pasos se completaron en aproximadamente media hora en una sola GPU, sin especificar el modelo.
- ¿Cabe en GPU de consumo? no disponible.
- Despliegue: ComfyUI mediante el nodo estándar Load LoRA (solo modelo, strength 1.0) sobre un modelo MiniMax-H3 Ref2VA; y musubi-tuner en versión 0.3.5 o posterior con `--lora_runtime_attach`.
- Latencia y throughput: no disponible. La receta de referencia usa 20 pasos de inferencia, 124 fotogramas y 24 fps a resoluciones de 672 x 832, 832 x 1024, 1024 x 768 o 1152 x 768.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la informacion proporcionada. La comparación posible es interna, entre las variantes publicadas del propio adaptador y el modelo base sin él.

| Variante | Pesos | Efecto de tarjeta | Efecto sobre la orbita | Notas |
|---|---|---|---|---|
| CardSpin step 50 | un unico LoRA de rango 32 | si, con bordes algo menos nitidos | preservado, es la variante mas suave | version publicada en este repositorio |
| CardSpin step 100 | no publicado | si, bordes mas nitidos | mayor impacto segun el autor | solo mencionado en la model card |
| CardSpin step 150 | no publicado | si, bordes mas nitidos | mayor impacto segun el autor | solo mencionado en la model card |
| MiniMax-H3 Ref2VA sin LoRA | modelo base | no | orbita no disponible por defecto | necesario como base para cualquier uso del adaptador |

Frente a otros LoRA de control de cámara o de órbita, no hay información disponible sobre parámetros, contexto, rendimiento o licencia que permita una comparación rigurosa.

## Limitaciones y advertencias

- El efecto de tarjeta se aprendió de un único clip generado y anotado por el autor, no de un conjunto de datos; se trata de un caso claro de ajuste sobre una muestra mínima, con la consiguiente variabilidad entre semillas.
- La varianza por semilla es explícita: el autor indica que algunas semillas se comprometen con el efecto de tarjeta mucho más que otras y recomienda probar varias.
- La sincronización temporal está fijada al prompt y asume 124 fotogramas a 24 fps; cambiar la longitud del vídeo rompe las marcas de 1,0 s, 1,7 s, 3,8 s y 5,125 s.
- El autor solo ha verificado resoluciones concretas: 672 x 832 y 832 x 1024 en vertical, y 1024 x 768 y 1152 x 768 en horizontal. Otras resoluciones no están validadas.
- El rendimiento es mejor en retratos de personas y animales; no hay evidencia de comportamiento en otras categorías de imagen.
- En el modo de órbita, fórmulas como "clean studio" en el prompt arrastran algunas escenas hacia un fondo gris de estudio, según el autor, que recomienda usar la caption `orbit_realscene_caption.txt` para conservar el entorno real.
- Si no se incluyen las secciones de audio `overall_soundscape` y `non_diegetic_music` marcadas como `N/A`, el modelo base tiende a inventar una banda sonora.
- No se documentan idiomas soportados ni comportamiento multilingüe del adaptador.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo generativo de vídeo, la fidelidad al sujeto de la fotografía de referencia no está cuantificada.
- Sesgos: no documentados en la información disponible.
- Licencia: se aplica la MiniMax-H3 Community License Agreement, no una licencia de código abierto permisiva. Antes de un uso comercial hay que revisar el fichero LICENSE del repositorio y los términos del modelo base, ya que el adaptador hereda las restricciones de MiniMax-H3.
- El adaptador no es utilizable de forma aislada: sin el modelo base MiniMax-H3 Ref2VA y sus componentes auxiliares no genera nada.
- El repositorio tiene 5 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del repositorio: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/blob/main/LICENSE
- Musubi-tuner (kohya-ss), v0.3.5 o posterior: https://github.com/kohya-ss/musubi-tuner
- Clip de ejemplo del efecto de tarjeta: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_cardspin_step50.mp4
- Clip de ejemplo de la órbita normal: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_orbit_step50.mp4
- Clip original del fallo de generalización sobre el retrato de Herschel: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/herschel_origin_glitch_orbit750.mp4
