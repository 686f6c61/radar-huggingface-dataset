# eric-venti-seeds/Eyes_Direction_Lora_Flux2Klein4B

## Resumen

Eyes Direction LoRA Flux 2 Klein 4B es un adaptador LoRA de tipo image-to-image desarrollado por Eric Venti (eric-venti-seeds) sobre el modelo base black-forest-labs/FLUX.2-klein-4B. Su funcion es modificar la direccion de la mirada de los ojos en una imagen existente, manteniendo el color, la forma de la pupila y el estilo visual original. El adaptador se activa mediante una frase de disparo y utiliza una imagen de referencia con un punto rojo para indicar la direccion deseada de la mirada.

El modelo resuelve un problema muy concreto en flujos de edicion de imagen: controlar de forma precisa hacia donde miran los ojos de un sujeto sin regenerar la imagen completa ni alterar el resto de la composicion. Es relevante para tareas de retoque fotografico, produccion audiovisual, generacion de personajes consistentes y pipelines de edicion iterativa donde el contacto visual con camara o la direccion de la mirada son criticos.

El adaptador tiene un tamano de repositorio de aproximadamente 0,3 GB, lo que corresponde a los pesos del LoRA y no al modelo base completo. Esta entrenado exclusivamente con imagenes de ojos humanos y funciona con estilos realistas, CGI, comic, anime, pinturas y dibujos, siempre que el sujeto tenga ojos que se asemejen a los humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion FLUX.2-klein-4B |
| Parametros totales | no disponible (el repositorio ocupa 0,3 GB, correspondiente a los pesos del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el modelo base referenciado incluye una variante fp8 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,3 GB; presumiblemente safetensors, no confirmado en la informacion) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA entrenado sobre el modelo de difusion FLUX.2-klein-4B de Black Forest Labs, orientado a la pipeline image-to-image. El LoRA no modifica la arquitectura del modelo base: anade matrices de bajo rango que ajustan el comportamiento del modelo para la tarea especifica de redirigir la mirada. El repositorio tambien referencia la variante black-forest-labs/FLUX.2-klein-4b-fp8 como modelo base secundario.

El entrenamiento se centro en imagenes de ojos humanos, con parte de los datos extraidos del Columbia Gaze Dataset. El autor no detalla el numero de tokens, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO, por lo que esos datos no estan disponibles. La innovacion principal es el mecanismo de control mediante un punto rojo de referencia: el modelo aprende a hacer que los ojos miren hacia la posicion del punto rojo en el lienzo, con limites oculares entrenados para evitar direcciones anatomicamente imposibles. El autor publica ademas un nodo de ComfyUI llamado Eyes Direction Control para facilitar la especificacion de la direccion.

## Capacidades

- Redireccion de la mirada en imagenes: mueve los ojos del sujeto hacia la posicion indicada por un punto rojo de referencia.
- Preservacion del estilo visual: mantiene el color, la forma de la pupila y el estilo original (realista, CGI, comic, anime, pintura, dibujo).
- Contacto visual con camara: un punto rojo en el centro del lienzo hace que los ojos miren a camara independientemente de la posicion del cuerpo.
- Control de direccion fuera de encuadre: si el punto se situa en el borde o mas alla, los ojos miran hacia el borde o fuera de la imagen.
- Compatibilidad con posiciones extremas de cabeza: el autor recomienda usar el punto dentro del borde cuando la cabeza esta muy girada.
- Funcionamiento en pipeline image-to-image con frase de disparo: `change the eyes to match the reference dot direction`.
- Ajuste de intensidad del LoRA: el autor recomienda fuerza 0,5-1 para humanos y estilos realistas, y 1,25-1,5 para anime y estilos no realistas.
- No soporta tool calling, agentes ni razonamiento multi-step: es un adaptador de edicion de imagen, no un modelo de lenguaje.

## Casos de uso

- Retoque fotografico de retratos: corregir la direccion de la mirada en fotos de estudio o corporativas para que el sujeto mire a camara o hacia un punto concreto, manteniendo la iluminacion y el estilo original.
- Produccion audiovisual y storyboards: ajustar el contacto visual de personajes en fotogramas clave para mantener la continuidad de la mirada entre planos.
- Generacion de personajes consistentes: en pipelines de creacion de personajes para videojuegos o comic, redirigir la mirada de un mismo personaje en distintas poses sin regenerar la imagen completa.
- Edicion de imagenes para redes sociales y marketing: modificar la direccion de la mirada de modelos en anuncios para dirigir la atencion del espectador hacia el producto o el texto.
- Ilustracion y anime: corregir la mirada en ilustraciones de estilo anime o comic usando fuerzas de LoRA mas altas (1,25-1,5) y anadiendo una frase que describa el estilo.
- Correccion de errores en generaciones previas: si una generacion de FLUX produce ojos mirando en una direccion no deseada, el LoRA permite corregir solo esa zona sin rehacer toda la imagen.
- Integracion en ComfyUI: usar el nodo Eyes Direction Control para automatizar la seleccion de la direccion de la mirada dentro de un flujo de trabajo de edicion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base FLUX.2-klein-4B y de la cuantizacion empleada (el autor referencia una variante fp8 del modelo base).
- GPU recomendadas: no disponible en la informacion proporcionada; al tratarse de un modelo de difusion de 4B, se requiere una GPU con VRAM suficiente para el modelo base, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ComfyUI (el autor incluye un workflow y un nodo de control especifico); no se detallan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a un adaptador de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de redireccion de mirada ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No funciona bien con animales: el LoRA no fue entrenado con imagenes de animales y el autor no garantiza resultados.
- Problemas con ojos muy pequenos en el encuadre o extremadamente grandes que ocupan casi toda la imagen.
- No funciona bien con ojos de distinto color o distinto tamano de pupila (el autor cita el caso de David Bowie).
- Si se coloca el punto rojo en una posicion anatomicamente imposible, el modelo puede mover la pupila en una direccion aleatoria.
- El modelo solo declara soporte para ingles; la frase de disparo y las instrucciones de estilo deben formularse en ese idioma.
- Licencia MIT: permite uso comercial, pero el autor no detalla condiciones adicionales sobre los datos de entrenamiento (parte provenientes del Columbia Gaze Dataset), lo que conviene verificar antes de un despliegue comercial.
- Riesgo de artefactos o inconsistencias en la zona de los ojos cuando se aplican fuerzas de LoRA altas en estilos no realistas.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, tool calling ni razonamiento; su unico proposito es la edicion de la direccion de la mirada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eric-venti-seeds/Eyes_Direction_Lora_Flux2Klein4B
- Nodo Eyes Direction Control (GitHub): https://github.com/eric-venti-seeds/Eyes_Direction_Lora_Control
- Modelo base FLUX.2-klein-4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Variante fp8 del modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8
- Columbia Gaze Dataset: https://ceal.cs.columbia.edu/columbiagaze/
- Publicacion Gaze Locking (ACM): https://dl.acm.org/doi/10.1145/2501988.2501994?cid=99659562550
