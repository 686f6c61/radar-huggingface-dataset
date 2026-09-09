# eric-venti-seeds/Eyes_Direction_Lora_Flux2Klein9B

## Resumen

Eyes Direction LoRA Flux 2 Klein 9B v1 es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario eric-venti-seeds. Se entrena sobre el modelo de difusión FLUX.2-klein-9B de Black Forest Labs, que cuenta con una variante FP8. Su propósito es cambiar la dirección de la mirada de los ojos en imágenes existentes, de modo que los ojos sigan una referencia visual determinada. El modelo funciona como una transformación image-to-image: conserva la estructura, el color y el estilo de la imagen original, a la vez que reorienta las pupilas hacia el punto indicado.

El LoRA resuelve el problema de control fino de la mirada en retratos y personajes, un aspecto que en los modelos generativos suele ser impredecible. Para ello, el autor ha creado también un nodo complementario, Eyes Direction Control, que permite dibujar un punto rojo sobre la imagen para indicar la dirección deseada. El repositorio incluye el adaptador con un tamaño de 0.3 GB y una licencia MIT. No se especifican los parámetros totales del LoRA ni su longitud de contexto, al tratarse de un modelo de difusión y no de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el modelo de difusión FLUX.2-klein-9B |
| Parámetros totales | No disponible (el repositorio tiene un tamaño de 0.3 GB, pero no se especifica el número de parámetros del adaptador) |
| Parámetros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No aplica (modelo de difusión, no de lenguaje) |
| Tipos de cuantización | No disponible; el modelo base ofrece una variante FP8, pero no se indican cuantizaciones del LoRA |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (adaptador LoRA para ComfyUI; no se documenta el formato exacto) |
| Tamaño del repositorio | 0.3 GB |
| Modelo base | black-forest-labs/FLUX.2-klein-9B y black-forest-labs/FLUX.2-klein-9b-fp8 |

## Arquitectura y entrenamiento

El modelo es una adaptación de bajo rango (LoRA) que añade matrices de pesos entrenables al modelo base congelado. El modelo base FLUX.2-klein-9B es un modelo de difusión de 9.000 millones de parámetros, desarrollado por Black Forest Labs. El LoRA se aplica en el pipeline de image-to-image, de forma que la imagen de entrada se procesa y solo se modifica la geometría de los ojos.

Para el entrenamiento se utilizó el Columbia Gaze Dataset, un conjunto de datos de miradas humanas, junto con el estudio Gaze Locking: Passive Eye Contact Detection for Human–Object Interaction de Brian A. Smith, Qi Yin, Steven K. Feiner y Shree K. Nayar. No se han publicado detalles sobre la composición completa del dataset, el número de tokens (por ser un modelo de imagen) ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal es el mecanismo de control mediante un punto rojo: la posición de este punto en la imagen de referencia determina hacia dónde miran los ojos, y el nodo Eyes Direction Control facilita su colocación.

## Capacidades

- Cambia la dirección de la mirada en imágenes de humanos y de cualquier objeto con aspecto de ojo (cómics, anime, ilustraciones, pinturas, renders CG, etc.).
- Conserva el color, la forma de la pupila y el estilo visual original de la imagen.
- Permite la mirada directa a cámara colocando el punto rojo en el centro del encuadre.
- Permite la mirada hacia fuera de la imagen colocando el punto rojo fuera de los bordes.
- Funciona con estilos no realistas ajustando la fuerza y añadiendo una frase descriptiva del estilo.
- Dispone de un nodo auxiliar en ComfyUI para controlar la dirección del punto rojo.
- No ofrece generación de texto, tool calling, razonamiento multistep ni capacidades multimodales de lenguaje.

## Casos de uso

- Retoque de retratos fotográficos: se puede aplicar el LoRA a un retrato existente para que el sujeto mire directamente a cámara o hacia un punto concreto, sin necesidad de rehacer la imagen. Es adecuado porque conserva la identidad y el estilo original.
- Corrección de miradas en fotos de grupo: en fotografías con varios individuos, permite alinear las miradas hacia un mismo objetivo, mejorando la composición y la coherencia visual.
- Producción de cómics y manga: el adaptador funciona sobre ilustraciones y viñetas, de modo que un personaje puede desviar la mirada según la narrativa del panel, manteniendo la técnica de dibujo.
- Publicidad y marketing visual: se puede utilizar para que un modelo publicitario mire al producto o al espectador, aumentando el impacto de la campaña sin generar la imagen desde cero.
- Arte digital y pintura: en piezas artísticas o renders CG, el LoRA permite redirigir la mirada de un personaje para ajustar la intención emocional de la obra, preservando el resto de detalles.
- Postproducción de fotogramas de vídeo: aplicando el modelo a fotogramas individuales de un clip, se puede corregir la dirección de la mirada en secuencias de vídeo estáticas o casi estáticas.
- Diseño de personajes para videojuegos: permite generar variantes de un mismo personaje con diferentes direcciones de mirada, útiles para mostrar distintos estados de ánimo o atención.
- Avatares en plataformas sociales: el LoRA puede crear avatares que miren a la cámara, mejorando la sensación de contacto ocular en interfaces interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La carga del LoRA añade un coste de memoria pequeño sobre el modelo base, pero no se proporcionan estimaciones de VRAM específicas para el adaptador.
- El consumo principal depende del modelo base FLUX.2-klein-9B, del que no se aportan requisitos de hardware en la información disponible.
- El flujo de trabajo descrito por el autor se ejecuta en ComfyUI, con el nodo Eyes Direction Control, por lo que se requiere una GPU compatible con PyTorch y las dependencias de ComfyUI.
- Se recomienda revisar la documentación del modelo base FLUX.2-klein-9B para conocer los requisitos de VRAM y las opciones de despliegue (por ejemplo, la variante FP8 puede reducir el consumo).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. No obstante, el mismo autor publicó el LoRA Sun-Direction-Lora-Flux2Klein9B, orientado a controlar la dirección de la luz solar, que comparte la misma base técnica pero no la misma función.

## Limitaciones y advertencias

- El LoRA no funciona correctamente con animales, ya que no fue entrenado con imágenes de animales; es posible que no produzca resultados útiles.
- Tiene dificultades con ojos muy pequeños o muy grandes dentro del encuadre; la precisión del resultado puede verse comprometida.
- No funciona bien con ojos de colores diferentes o tamaños de pupila asimétricos, como los de un ojo con heterocromía.
- Si el punto rojo se coloca en una posición imposible para una cabeza girada, la pupila puede moverse en una dirección aleatoria.
- Para posiciones extremas de la cabeza, se recomienda mantener el punto rojo dentro del borde de la imagen.
- En estilos no realistas puede requerir una fuerza de 1.25 a 1.5 y una frase adicional que describa el estilo, frente a la fuerza de 0.5 a 1 para imágenes realistas.
- No se han documentado sesgos específicos del LoRA, pero al estar basado en FLUX.2-klein-9B puede heredar sesgos del modelo base.
- La licencia MIT del LoRA permite el uso comercial, pero es necesario comprobar la licencia del modelo base FLUX.2-klein-9B, que puede tener restricciones adicionales.
- El modelo solo altera la dirección de los ojos; no corrige otros defectos de la imagen ni genera nuevas estructuras.

## Enlaces

- Hugging Face: https://huggingface.co/eric-venti-seeds/Eyes_Direction_Lora_Flux2Klein9B
- Nodo Eyes Direction Control en GitHub: https://github.com/eric-venti-seeds/Eyes_Direction_Lora_Control
- Columbia Gaze Dataset: https://ceal.cs.columbia.edu/columbiagaze/
- Publicación Gaze Locking: https://dl.acm.org/doi/10.1145/2501988.2501994?cid=99659562550
- Modelo base FLUX.2-klein-9B en Hugging Face: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
