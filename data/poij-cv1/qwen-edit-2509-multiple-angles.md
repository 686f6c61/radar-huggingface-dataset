# Poij-cv1/Qwen-Edit-2509-Multiple-angles

## Resumen

Qwen-Edit-2509-Multiple-angles es un LoRA (adaptador de bajo rango) para el modelo de edicion de imagen Qwen-Image-Edit-2509, publicado por el usuario Poij-cv1 en Hugging Face. Su proposito concreto es controlar la camara virtual de una imagen de entrada: permite desplazar el punto de vista hacia delante, atras, izquierda y derecha, rotar la escena, cambiar a vista cenital o contrapicada y alternar entre objetivos gran angular y primer plano. No es un modelo generativo autonomo, sino un complemento que se carga junto al modelo base para modificar su comportamiento.

El adaptador se distribuye con licencia Apache 2.0, pesa aproximadamente 0,2 GB (coherente con un fichero LoRA de rango bajo) y se integra en el ecosistema diffusers. La model card indica que fue entrenado sin escribir codigo, utilizando la infraestructura de ModelScope, y que no requiere palabras de activacion (trigger words): las instrucciones se expresan en lenguaje natural, en chino o en ingles, describiendo el movimiento de camara deseado.

La relevancia de esta ficha es practica: demuestra el patron habitual de los adaptadores comunitarios sobre modelos de edicion de imagen de gran tamano, donde el LoRA anade una capacidad muy especifica (control de punto de vista) sobre un modelo base mucho mas pesado. Conviene senalar que la model card original esta redactada para el repositorio dx8152/Qwen-Edit-2509-Multiple-angles y que el repositorio aqui descrito (Poij-cv1) replica ese contenido; los datos tecnicos del modelo base no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-Edit-2509; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el repositorio ocupa 0,2 GB, compatible con un adaptador LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible para el modelo base |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; los prompts de ejemplo de la model card estan en chino e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; el repositorio usa la libreria diffusers y se indica descargar el fichero LoRA a la carpeta `models/loras` |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-Image-Edit-2509 para especializarlo en una tarea concreta sin reentrenar todos los pesos. El modelo base es un modelo de edicion de imagen de Qwen, segun se deduce de su nombre y de la etiqueta `base_model` del repositorio; sus detalles de arquitectura (tipo de transformer de difusion, numero de parametros, VAE, text encoder) no se recogen en la informacion disponible.

Segun la model card, el entrenamiento se realizo sin codigo a traves de la plataforma ModelScope, con la infraestructura proporcionada por el equipo de ModelScope. El autor indica que el 2 de noviembre de 2025 volvio a subir una version con mas iteraciones de entrenamiento para corregir problemas de consistencia entre la imagen de entrada y la de salida, un problema que algunos usuarios habian reportado. No se especifican el numero de pasos, el dataset, el rango del LoRA ni si se aplicaron tecnicas como RLHF o DPO (no aplicables de forma habitual en este tipo de adaptadores).

Como innovacion practica, el adaptador anade control de camara expresado en lenguaje natural, sin palabras de activacion, y la model card indica que debe combinarse con el LoRA Qwen-Image-Lightning (lightx2v) para su uso conjunto.

## Capacidades

- Edicion de imagen a imagen: transforma una imagen de entrada manteniendo el sujeto y modificando el punto de vista.
- Control de camara: desplazamiento hacia delante, atras, izquierda y derecha.
- Rotacion de camara: giros a izquierda y derecha, incluidos giros de 45 grados indicados en los ejemplos.
- Cambio de angulo vertical: vista cenital (top-down) y vista desde abajo.
- Cambio de optica: conversion a gran angular o a primer plano (close-up).
- Instrucciones en lenguaje natural, sin trigger words: los prompts describen el movimiento deseado en chino o en ingles.
- Encadenamiento con otros LoRA: la model card exige el uso conjunto con Qwen-Image-Lightning.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente; es un adaptador de generacion de imagen.

## Casos de uso

- Previsualizacion de angulos en fotografia de producto: a partir de una unica foto de estudio, generar vistas laterales, cenitales y primeros planos para catalogo, reduciendo la necesidad de una sesion fotografica adicional.
- Storyboarding y previsualizacion cinematografica: convertir un fotograma clave en varias tomas con movimientos de camara (dolly, rotacion, gran angular) para explorar la puesta en escena antes de rodar.
- Creacion de variaciones de escena para videojuegos o entornos 3D: generar vistas alternativas de un mismo objeto o escenario para texturizar o ilustrar assets, manteniendo la coherencia del sujeto.
- Contenido para redes sociales y e-commerce: producir varias perspectivas de un mismo producto con un solo prompt por angulo, agilizando la publicacion de fichas con multiples imagenes.
- Iteracion de diseno de interiores y arquitectura: obtener vistas desde distintos puntos de una estancia o edificio a partir de un render o fotografia base, para comparar opciones de presentacion.
- Enriquecimiento de datasets de vision por computador: generar vistas sinteticas con angulos controlados de un objeto para aumentar la variabilidad de un conjunto de entrenamiento, siempre que se valide la fidelidad de las imagenes generadas.
- Prototipado rapido en flujos de edicion con diffusers: integrar el LoRA en un pipeline de image-to-image para automatizar la generacion de angulos dentro de una herramienta interna, cargando el adaptador sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye imagenes comparativas entre el LoRA y las capacidades nativas del modelo base, pero no aporta metricas numericas (FID, CLIP score, SSIM ni similares).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador en si ocupa unos 0,2 GB en disco y anade un consumo de memoria marginal sobre el modelo base.
- GPU recomendadas: no disponibles. Al tratarse de un LoRA sobre un modelo de edicion de imagen de gran tamano, se requiere la VRAM suficiente para cargar el modelo base completo, cuyo requisito no se detalla en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la cuantizacion aplicada, datos no disponibles.
- Opciones de despliegue: la model card indica descargar el fichero LoRA a la carpeta `models/loras` y usarlo junto con Qwen-Image-Lightning; tambien se muestra un ejemplo de llamada mediante `InferenceClient` de `huggingface_hub` con el proveedor wavespeed. No se documentan configuraciones para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Poij-cv1/Qwen-Edit-2509-Multiple-angles | LoRA | Qwen-Image-Edit-2509 | Control de angulos de camara | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| dx8152/Qwen-Edit-2509-Multiple-angles | LoRA | Qwen-Image-Edit-2509 | Control de angulos de camara | no disponible en la informacion proporcionada | Hugging Face; referenciado en el ejemplo de codigo de la model card |
| lightx2v/Qwen-Image-Lightning | LoRA | Qwen-Image (familia) | Aceleracion de la inferencia | no disponible en la informacion proporcionada | Hugging Face; requerido junto al adaptador segun la model card |

No se dispone de datos de rendimiento comparado entre estas variantes ni de alternativas de otros autores para la misma tarea en la informacion proporcionada.

## Limitaciones y advertencias

- Consistencia: la propia model card reconoce que algunos usuarios reportaron problemas de consistencia entre la imagen original y la editada; el autor subio una version con mas iteraciones para mitigarlo, pero no se aportan metricas que confirmen la mejora.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma y requiere Qwen-Image-Edit-2509 y, segun la model card, el LoRA Qwen-Image-Lightning. Cualquier limitacion del modelo base (sesgos visuales, calidad en dominios concretos) se hereda.
- Ambiguedad de instrucciones: el control se ejerce mediante lenguaje natural, por lo que prompts poco precisos pueden producir movimientos de camara distintos a los esperados; no hay parametros numericos documentados para fijar el angulo exacto.
- Idiomas: no se documenta soporte multilingue; los ejemplos estan en chino e ingles, y no hay garantia de que los prompts en castellano se interpreten correctamente.
- Licencia: Apache 2.0 permite uso comercial, pero la model card invita a una donacion via PayPal si el uso es empresarial; se trata de una peticion voluntaria, no de una restriccion legal.
- Repositorio de procedencia: el contenido de la model card corresponde al repositorio dx8152/Qwen-Edit-2509-Multiple-angles, mientras que esta ficha describe el repositorio Poij-cv1, que replica ese material; conviene verificar la trazabilidad y el fichero de pesos antes de usarlo en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validacion independiente.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede introducir elementos inexistentes o alterar detalles del sujeto al cambiar el punto de vista; requiere revision humana en flujos de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Poij-cv1/Qwen-Edit-2509-Multiple-angles
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Repositorio de referencia citado en la model card: https://huggingface.co/dx8152/Qwen-Edit-2509-Multiple-angles
- LoRA requerido junto al adaptador: https://huggingface.co/lightx2v/Qwen-Image-Lightning/tree/main
- Entrenamiento en ModelScope: https://www.modelscope.cn/aigc/modelTraining
- Demo online: https://www.runninghub.ai/post/1985311204883243009?inviteCode=rh-v1331
- Guia en video (YouTube): https://youtu.be/UGdW8W1MqW8
- Guia en video (Bilibili): https://www.bilibili.com/video/BV1oi1gBBEZV/
- Discord del autor: https://discord.gg/yVAVa43mWk
