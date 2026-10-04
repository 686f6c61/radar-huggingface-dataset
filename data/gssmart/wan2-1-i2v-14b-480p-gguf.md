# GSsmart/Wan2.1-I2V-14B-480P-gguf

## Resumen

Wan2.1-I2V-14B-480P-gguf es la conversion al formato GGUF del modelo de generacion de video Wan2.1-I2V-14B-480P, desarrollado originalmente por Wan-AI (Alibaba). El repositorio lo publica el usuario GSsmart, aunque la propia model card atribuye la cuantizacion a city96, autor del nodo ComfyUI-GGUF. Se trata de un modelo de difusion de imagen a video: recibe una imagen de referencia y un prompt de texto, y genera un clip de video en resolucion 480p.

La relevancia de esta conversion esta en el formato: los pesos originales en safetensors rondan las decenas de gigabytes y el repositorio completo ocupa 208,8 GB, mientras que el empaquetado GGUF esta pensado para cargarse desde ComfyUI con el custom node ComfyUI-GGUF en GPUs de gama alta de consumo, con el consiguiente ahorro de VRAM respecto al pipeline nativo en precision completa. Es, por tanto, una via practica para ejecutar generacion de video local sin depender de APIs externas.

Conviene tener presente el contexto de publicacion: el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, y la model card advierte de que solo se subio el cuantizado FP16 porque los demas excedian el limite de 50 GB por archivo y la carga de archivos divididos (gguf-split) no esta soportada en ComfyUI-GGUF. La licencia del modelo base es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con flow matching, segun la documentacion del modelo base Wan2.1; incluye codificador de texto T5 y VAE espacio-temporal |
| Parametros totales | 16.394.878.784 (indice de safetensors del repositorio base; la nomenclatura "14B" del nombre hace referencia al transformer de difusion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el prompt de texto se procesa con un codificador T5) |
| Tipos de cuantizacion | GGUF. La model card indica que solo se subio FP16 y que el resto de cuantizaciones se generaron desde el fichero base FP32; los tipos concretos disponibles no se detallan |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 208,8 GB) |
| Tarea | image-to-video |
| Modelo base | Wan-AI/Wan2.1-I2V-14B-480P |
| Resolucion | 480p (segun la denominacion del modelo base) |
| Fecha de publicacion en HuggingFace | 2026-10-04 |

## Arquitectura y entrenamiento

El modelo base Wan2.1-I2V-14B-480P es un generador de video condicionado por imagen basado en un transformer de difusion (DiT) con formulacion de flow matching. El pipeline habitual de Wan2.1 combina el transformer de difusion, un codificador de texto de la familia T5 para procesar el prompt y un VAE con compresion espacio-temporal que reduce el coste de modelar fotogramas consecutivos. Esta ficha describe una conversion de formato, no un modelo nuevo: no se ha reentrenado ni ajustado nada, solo se han convertido los pesos a GGUF.

Los detalles de entrenamiento del modelo base (numero de tokens o de clips, composicion del dataset, etapas de alineacion tipo RLHF o DPO) no se recogen en la informacion proporcionada y corresponden al informe tecnico publicado por el equipo de Wan. La innovacion tecnica relevante en este repositorio es exclusivamente la cuantizacion a GGUF y su integracion con el ecosistema ComfyUI mediante el nodo ComfyUI-GGUF.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) en resolucion 480p.
- Condicionamiento por prompt de texto en ingles y chino.
- Ejecucion local dentro de ComfyUI mediante el custom node ComfyUI-GGUF, colocando los ficheros del modelo en `ComfyUI/models/unet`.
- Integracion en grafos de ComfyUI junto con los ficheros auxiliares (codificador de texto y VAE) distribuidos en el repositorio de Comfy-Org.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", ni de entrada o salida de audio.
- Capacidades multilingues limitadas a los idiomas declarados (en, zh) en lo que respecta a los prompts.

## Casos de uso

- Previsualizacion audiovisual (previz) y storyboards animados: a partir de un fotograma o ilustracion clave se genera un plano con movimiento que permite validar ritmo, encuadre y direccion de camara antes de rodar o animar en produccion.
- Publicidad y comercio electronico: animar la fotografia de un producto para obtener un clip corto de escaparate o ficha de producto, con la ventaja de que el contenido se genera en local y no se envian imagenes de cliente a servicios de terceros.
- Creacion de contenido para redes sociales: conversion de fotografias en clips de algunos segundos para publicaciones, siempre que la resolucion de 480p resulte aceptable o se combine con un paso posterior de reescalado.
- Recuperacion y animacion de fotografias historicas o familiares: dar movimiento sutil a imagenes antiguas, un uso tipico de los modelos de imagen a video donde la entrada de alta calidad condiciona fuertemente el resultado.
- Generacion de datos sinteticos para vision por computador: producir clips etiquetados por construccion para tareas de deteccion de movimiento, seguimiento de objetos o estimacion de flujo optico, ampliando datasets con escenas dificiles de grabar.
- Efectos visuales y matte painting: convertir un fotograma pintado o una ilustracion en un plano con parallax o movimiento de camara, como paso intermedio antes de la composicion final.
- Divulgacion y material didactico: animar diagramas, esquemas o ilustraciones tecnicas para explicar procesos que se entienden mejor en movimiento que en una imagen fija.
- Prototipado de videojuegos y animatica: generar animaticos rapidos a partir de concept arts para comunicar intenciones de direccion artistica o mecanicas de camara.
- Despliegue en estaciones de trabajo con GPU de consumo: al tratarse de una conversion GGUF pensada para ComfyUI, permite plantear flujos de generacion de video en equipos con 24 GB de VRAM aplicando offloading de componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio GGUF no incluye metricas, y el informe tecnico del modelo base (que si reporta evaluaciones, por ejemplo en VBench) no forma parte de los datos proporcionados en esta busqueda.

## Requisitos de hardware

- Peso del transformer de difusion de 14B: aproximadamente 28 GB en FP16, 15 GB en Q8_0, 12 GB en Q6_K, 10 GB en Q5_K_M y 9 GB en Q4_K_M (estimaciones derivadas del numero de parametros; no son cifras publicadas por el autor).
- El codificador de texto T5 (del orden de 5.600 millones de parametros) anade alrededor de 11 GB en FP16 o unos 6 GB en FP8, y el VAE un peso comparativamente pequeno.
- VRAM estimada para el pipeline completo en precision FP16: en torno a 35-45 GB si todos los componentes residen en GPU.
- GPU recomendadas sin offloading: A100 80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: es posible ejecutarlo en RTX 4090 o RTX 3090 (24 GB) con cuantizaciones bajas y offloading del codificador de texto y del VAE a CPU o RAM, a costa de un aumento notable del tiempo por clip.
- No cabe en GPUs de 8-12 GB sin recurrir a cuantizaciones agresivas y offloading intensivo.
- Opciones de despliegue: ComfyUI con el custom node ComfyUI-GGUF (ruta oficial indicada en la model card), colocando los ficheros en `ComfyUI/models/unet` y descargando el resto de componentes desde el repositorio de Comfy-Org. vLLM y TGI no aplican a este tipo de modelo.
- Limitacion conocida del formato en este contexto: la carga de GGUF divididos (gguf-split) no esta soportada en ComfyUI-GGUF segun la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.1-I2V-14B-480P (GGUF) | 16.394.878.784 totales en el repositorio base | imagen a video | 480p | Apache 2.0 | HuggingFace (formato GGUF) |
| Wan2.1-I2V-14B-720P | 14B en el transformer, segun la nomenclatura del modelo base | imagen a video | 720p | Apache 2.0 | HuggingFace |
| HunyuanVideo | 13B | texto a video (existe variante de imagen a video) | no disponible | Licencia comunitaria de Tencent (no Apache 2.0) | HuggingFace |
| CogVideoX-5B-I2V | 5B | imagen a video | 720x480 segun la documentacion del modelo | Apache 2.0 | HuggingFace |
| Stable Video Diffusion (SVD-XT) | 1,5B | imagen a video | 1024x576 segun la documentacion del modelo | Licencia no comercial de Stability AI | HuggingFace |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no mantiene conversaciones, no ejecuta tool calling y no sirve para tareas de razonamiento textual.
- Riesgo de alucinacion visual: son frecuentes las deformaciones en manos, rostros, texto y objetos pequenos, asi como las incoherencias de movimiento entre fotogramas.
- Coherencia temporal limitada: los clips largos tienden a derivar en identidad de sujetos y fondo; los clips cortos suelen ser mas estables.
- Resolucion restringida a 480p, insuficiente para entrega final en la mayoria de flujos profesionales sin un paso de reescalado o restauracion posterior.
- Idiomas declarados en y zh. El castellano no figura como idioma soportado, por lo que los prompts en espanol pueden degradar el resultado.
- Sesgos conocidos: no se ha publicado ningun analisis de sesgos especifico en la informacion disponible; cabe esperar los sesgos heredados de los datasets de imagen y video del modelo base.
- Licencia Apache 2.0 en el repositorio, lo que permite uso comercial, pero deben verificarse las licencias de los componentes auxiliares (codificador de texto y VAE) que se descargan por separado.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, con 208,8 GB de contenido, por lo que conviene comprobar la integridad de los ficheros antes de integrarlos en produccion.
- Escasez de informacion sobre el propio repositorio: la model card se limita a describir el proceso de conversion y no documenta los tipos de cuantizacion finalmente subidos ni su calidad relativa.
- Requisitos de VRAM elevados: el FP16 completo no entra en GPUs de consumo sin offloading, lo que penaliza la latencia.
- El formato GGUF dividido no puede cargarse con ComfyUI-GGUF, lo que restringe las opciones de particionado de los ficheros grandes.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/GSsmart/Wan2.1-I2V-14B-480P-gguf
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- Custom node ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- Ficheros auxiliares para ComfyUI (Comfy-Org): https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files
- Tabla de referencia sobre tipos de cuantizacion GGUF: https://github.com/ggerganov/llama.cpp/blob/master/examples/perplexity/README.md#llama-3-8b-scoreboard
- Repositorio oficial del proyecto Wan (Wan-Video): https://github.com/Wan-Video/Wan2.1
- Informe tecnico del modelo base: no disponible en la informacion proporcionada
