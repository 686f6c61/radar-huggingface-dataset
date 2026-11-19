# lilylilith/QI_2.1_AnyAngle

## Resumen

QI_2.1_AnyAngle es un adaptador LoRA para el modelo de edicion de imagen Qwen-Image-2.1, desarrollado por el usuario lilylilith y publicado bajo licencia Apache 2.0. Resuelve un problema concreto en la edicion de imagenes generativas: la mayoria de los modelos de edicion actuales solo permiten cambios de angulo de camara en azimuts y elevaciones fijos, lo que limita el control creativo y provoca deriva estilistica cuando el cambio es drastico. Este LoRA permite transferir un angulo de camara arbitrario, definido por el usuario, a una imagen original manteniendo la coherencia de estilo.

La innovacion principal no esta en la arquitectura del LoRA en si, sino en el pipeline de entrenamiento y de inferencia: se transforma la imagen en un Gaussian Splat o modelo 3D (mediante Tripo Splat, Trellis2 o Pixal3D), se importa en Blender, se renderiza desde el angulo deseado y ese render grueso se usa como referencia de control junto con la imagen original. El LoRA se entrena con renders reales de Blender y con orbitas generadas por el modelo de video MiniMax H3 para cubrir estilos ilustrados y de boceto.

El repositorio ocupa 0,1 GB, se distribuye en formato diffusers y esta pensado para el pipeline image-to-image. No se especifican parametros totales ni longitud de contexto, ya que se trata de un adaptador sobre un modelo base de difusion, no de un modelo de lenguaje. Su relevancia actual radica en que amplia las capacidades de control geometrico de Qwen-Image-2.1 sin necesidad de reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen-Image-2.1 (modelo de difusion para edicion de imagen) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelo de difusion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | diffusers (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA que se aplica sobre Qwen-Image-2.1, un modelo de edicion de imagen por difusion. El LoRA no modifica la arquitectura del modelo base; se limita a inyectar matrices de bajo rango en las capas de atencion para condicionar la generacion hacia la transferencia de angulos de camara. El pipeline declarado es image-to-image y la fuerza recomendada del LoRA es 1.0.

El entrenamiento combina dos fuentes de datos. Por un lado, renders reales de Blender, deliberadamente diversos en estilo, donde cada muestra empareja una imagen ancla con un fotograma desde un angulo distinto. Por otro, para cubrir ilustraciones y bocetos, se generan orbitas y manipulaciones de camara con el modelo de video MiniMax H3 manteniendo la escena estatica. Para cada imagen objetivo se genera un Gaussian Splat o modelo 3D que sirve como render grueso de control. El autor indica que el LoRA se entrena durante unos pocos miles de pasos. No se especifica el numero exacto de muestras ni la composicion detallada del dataset.

La innovacion tecnica destacable es el uso de representaciones 3D intermedias (Gaussian Splats o mallas) como puente para definir el angulo de camara, lo que evita que el modelo tenga que alucinar la geometria de la escena y preserva la coherencia estilistica. Para inferencia se recomienda CFG 3.0 y 20 pasos o mas; para prototipado rapido se puede combinar con un LoRA turbo de Qwen-Image-2.1, con una ligera perdida de calidad.

## Capacidades

- Transferencia de angulo de camara arbitrario desde una imagen de referencia gruesa a una imagen original.
- Edicion de imagen image-to-image manteniendo la coherencia de estilo entre la imagen de entrada y la salida.
- Funciona con escenas fotorrealistas procedentes de renders de Blender y con estilos ilustrados, bocetos y arte digital.
- Control fino de azimut y elevacion, sin limitarse a angulos fijos predefinidos.
- Integracion con pipelines de generacion 3D: Tripo Splat, Trellis2, Pixal3D y otros generadores de Gaussian Splats o mallas.
- Compatibilidad con flujos de trabajo en Blender para previsualizacion y ajuste manual de la camara.
- Soporte de prompts de edicion especificos, como `Change the camera angle from <image2> to <image1>.`
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o texto.

## Casos de uso

- Previsualizacion de planos cinematograficos: a partir de un fotograma o concept art, se genera un splat 3D, se ajusta la camara en Blender y se renderiza el nuevo angulo con el LoRA para explorar opciones de encuadre sin perder el estilo visual del proyecto.
- Storyboarding y shot planning: se puede usar con un LoRA turbo de Qwen-Image-2.1 para reducir latencia y generar rapidamente variaciones de angulo que sirvan como borradores antes del render final.
- Ilustracion editorial y comic: permite reencuadrar una escena ilustrada desde otro punto de vista manteniendo el trazo, la paleta y el estilo del artista, algo que los modelos de edicion convencionales no logran sin deriva estilistica.
- Diseno de producto y arquitectura: a partir de una imagen de referencia de un objeto o espacio, se generan vistas desde angulos alternativos para presentaciones, fichas de producto o revisiones de diseno.
- Videojuegos y assets 3D: generacion de vistas coherentes de un personaje o escenario para texturizado, referencia de modelado o documentacion de assets.
- Publicidad y redes sociales: reencuadre de una misma imagen para distintos formatos y angulos (cuadrado, vertical, horizontal) conservando la identidad visual de la marca.
- Restauracion y reedicion de material grafico: cambiar el punto de vista de una fotografia o ilustracion existente sin rehacer la escena desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ejecutarse sobre Qwen-Image-2.1, los requisitos vendran determinados por el modelo base, no por el LoRA, que ocupa 0,1 GB.
- GPU recomendadas: no disponible. Se recomienda consultar la model card de Qwen-Image-2.1 para los requisitos del modelo base.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: libreria diffusers, segun la model card. No se documentan otras opciones como ComfyUI, Automatic1111 o vLLM.
- Latencia y throughput: no disponible. El autor menciona que se puede usar un LoRA turbo o un modelo Qwen-Image-2.1 turbo para reducir latencia en tareas de boarding, con una ligera perdida de calidad.
- Configuracion de inferencia recomendada: fuerza del LoRA 1.0, CFG 3.0 y 20 pasos o mas.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Control de angulo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QI_2.1_AnyAngle | LoRA image-to-image | Qwen-Image-2.1 | Angulo arbitrario via splat/3D + Blender | Apache 2.0 | Hugging Face |
| Qwen-Image-2.1 (base) | Modelo de edicion de imagen | - | Limitado a angulos fijos en la mayoria de flujos | no disponible en la informacion | Hugging Face |
| FLUX.2 | Modelo de edicion de imagen | - | Limitado a angulos fijos segun la model card | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo ni de otros LoRAs equivalentes de control de camara en la informacion proporcionada.

## Limitaciones y advertencias

- Depende de la calidad del Gaussian Splat o modelo 3D intermedio: si el splat es espacialmente impreciso o demasiado grueso, la disposicion espacial de los objetos puede quedar mal colocada en la salida.
- Riesgo de deformacion facial cuando las caras no estan bien definidas o las imagenes de entrada tienen baja resolucion.
- El pipeline requiere herramientas externas (Tripo Splat, Trellis2, Pixal3D, Blender) ademas del modelo de difusion, lo que anade complejidad y latencia al flujo de trabajo.
- El uso de un LoRA turbo para acelerar la inferencia reduce la calidad del resultado.
- No se documentan sesgos conocidos, limitaciones de idioma ni restricciones adicionales de licencia mas alla de Apache 2.0.
- No se especifican requisitos de hardware ni metricas de rendimiento, lo que dificulta planificar el despliegue en produccion.
- El modelo esta fechado en 2026 y su ecosistema de herramientas asociadas puede evolucionar; conviene verificar la compatibilidad con versiones futuras de Qwen-Image-2.1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lilylilith/QI_2.1_AnyAngle
- Perfil del autor en Civitai: https://civitai.com/user/lilylilith
- Ko-fi del autor: https://ko-fi.com/lilllithhhhh
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo de video MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Workflow de generacion de mundos 3D (YouTube): https://www.youtube.com/watch?v=eJuYBNrD8HI
