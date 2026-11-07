# colinurbs/moss-pen-sketch-lora

## Resumen

Pen Sketch Style v1 es un LoRA de estilo para el modelo de difusion de imagenes MOSS-Image, publicado por el usuario colinurbs en Hugging Face. Su funcion es transferir al modelo base un estilo grafico muy concreto: garabatos caoticos de boligrafo negro sobre papel blanco, con lineas enredadas y bucles que construyen el tono de la imagen. Es la adaptacion a MOSS-Image del LoRA homonimo originalmente creado para Flux, disponible en Civitai.

El modelo resuelve un problema de nicho dentro de la generacion de imagenes: reproducir de forma consistente una estetica de boceto a boligrafo que los modelos base no producen de manera fiable solo con prompting. Se distribuye como un unico archivo safetensors de rango 64, entrenado sobre OpenMOSS/MOSS-Image-Base mediante kohya sd-scripts.

Por su naturaleza de adaptador de estilo, su relevancia es limitada y practica: sirve a ilustradores, disenadores y creadores que quieran generar ilustraciones con acabado de garabato a boligrafo dentro del ecosistema MOSS-Image. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor advierte de que solo se ha probado con las muestras de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un modelo de difusion (MOSS-Image); el adaptador usa rango 64 / alpha 16 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se especifica en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible (el entrenamiento uso INT8 en el modelo base, pero no se documentan cuantizaciones de inferencia) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`pen_sketch_moss_v1.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 16 aplicado sobre OpenMOSS/MOSS-Image-Base, un modelo de difusion para generacion de imagenes. El entrenamiento se realizo con kohya sd-scripts en su variante para MOSS-Image, sobre una GPU RTX 4070 Super con cuantizacion INT8 y block swap. Se uso learning rate 2e-4 con 200 pasos de warmup y decaimiento coseno, batch size 1 y buckets de 1024 px.

El dataset consta de 428 imagenes, cada una con tres captions (larga, media y corta), lo que suma 1.284 elementos de entrenamiento. Dado que las imagenes originales del LoRA de Flux se perdieron, el autor genero el dataset a partir de 428 renders curados de Flux Dev producidos con el LoRA original Pen Sketch Style a distintas intensidades, prompts y encuadres. El checkpoint publicado corresponde al paso 1.000 de una ejecucion detenida en torno al paso 2.200.

## Capacidades

- Generacion de imagenes con estetica de garabato a boligrafo negro sobre papel blanco.
- Transferencia de estilo mediante una linea de activacion (trigger) al inicio del prompt: "A pen-people scribble drawing in black ballpoint ink on white paper."
- Acepta una variante mas corta del trigger: "A scribble drawing of ...".
- Respeto del tipo de imagen solicitado: los prompts que piden una fotografia siguen generando fotografias.
- Composicion de escenas arbitrarias descritas en el prompt (retratos, animales, bodegones, etc.) bajo el estilo aprendido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades adicionales (audio, video).

## Casos de uso

- Ilustracion editorial: generar bocetos a boligrafo para articulos, fanzines o revistas usando el trigger y una descripcion del sujeto, aprovechando el acabado manual que el modelo base no produce de forma fiable.
- Concept art rapido: producir variaciones de personajes o escenas con estetica de garabato para explorar direcciones visuales antes de un render mas pulido.
- Diseno de portadas y carteles: crear graficos de fondo con lineas enredadas y tono tramado para composiciones tipograficas.
- Material promocional con estetica artesanal: generar imagenes con apariencia de dibujo hecho a mano para campanas que buscan un tono no corporativo.
- Prototipado de libros infantiles o cuentos: ilustrar escenas descriptivas con un estilo de boceto inmediato y reconocible.
- Experimentacion artistica y docencia: usar el LoRA como ejemplo de transferencia de estilo entre modelos de difusion (de Flux a MOSS-Image) en talleres o investigacion sobre adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una muestra cualitativa (retrato de mujer con gafas redondas, semilla 42, 896x1280, 30 pasos, CFG 3) generada con el checkpoint del paso 1.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MOSS-Image y de la precision utilizada. El entrenamiento se hizo con INT8 y block swap en una GPU de 12 GB (RTX 4070 Super), lo que sugiere que la inferencia es viable en hardware de gama consumer con las optimizaciones adecuadas.
- GPU recomendadas: no disponible. El autor solo documenta una RTX 4070 Super para el entrenamiento.
- Cabe en GPU consumer: si, segun la evidencia del entrenamiento en una RTX 4070 Super con INT8 y block swap; no se documentan pruebas en otras GPU.
- Opciones de despliegue: no disponible; el autor cita kohya sd-scripts para el entrenamiento, pero no especifica el stack de inferencia (ComfyUI, Diffusers, etc.).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Rango | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pen Sketch Style v1 (colinurbs) | LoRA de estilo | MOSS-Image | 64 | no disponible | Hugging Face |
| Pen Sketch Style (original) | LoRA de estilo | Flux | no disponible | no disponible | Civitai |
| Pencil Sketch - MOSS | LoRA de estilo | MOSS-Image | no disponible | no disponible | Civitai |

No se dispone de datos de rendimiento cuantitativos para establecer una comparacion numerica entre estas alternativas.

## Limitaciones y advertencias

- Aparicion ocasional de firmas falsas en alguna esquina de la imagen generada.
- Solo se ha probado con las muestras de entrenamiento (8 prompts y una unica semilla), por lo que el comportamiento fuera de ese conjunto es incierto.
- El dataset se genero a partir de renders de Flux Dev con el LoRA original, no de dibujos reales; esto puede introducir artefactos o sesgos propios del modelo intermedio.
- El checkpoint publicado es el paso 1.000 de una ejecucion detenida en torno al paso 2.200, por lo que no representa el estado final del entrenamiento.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Idiomas soportados no documentados; los ejemplos estan en ingles.
- Riesgo de que el estilo no se aplique si el prompt pide explicitamente una fotografia.
- Sin descargas ni validacion de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/colinurbs/moss-pen-sketch-lora
- Modelo base: https://huggingface.co/OpenMOSS/MOSS-Image-Base
- LoRA original para Flux en Civitai: https://civitai.com/models/1358209/pen-sketch-style
- Pencil Sketch - MOSS en Civitai: https://civitai.com/models/55047/pencil-sketch
- Traditional Painting_Pencil Sketch_Moss en RunningHub: https://www.runninghub.ai/model/public/2113070418734198785
