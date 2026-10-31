# kinkyrvn/nevermore

## Resumen

Nevermore 1.0 es una familia de detectores de objetos desarrollada por Kinky Raven y publicada en HuggingFace bajo el identificador `kinkyrvn/nevermore`. Está especializada en la detección de cuerpos y partes del cuerpo (personas, caras, pechos, genitales, nalgas y pies) en tiempo real, con especial atención a la latencia mínima para escenarios de gaming, visualización de vídeo y uso de ordenador en directo. El modelo aborda un problema concreto: los detectores NSFW genéricos como NudeNet o HotScreen presentan un rendimiento claramente inferior en contenido furry, anime y miniaturas, y Nevermore mejora sustancialmente en esos dominios.

Técnicamente, Nevermore es un conjunto de fine-tunings de Ultralytics YOLO26 (variantes YOLO26n y YOLO26s) exportados a formato ONNX, con cinco niveles o "tiers" (tiny, small, medium, big y huge) que van desde 4,9 MB en fp16 hasta 19,3 MB. Los pesos más pequeños ejecutan inferencia en torno a 2,4 ms por fotograma en una RTX 4090, lo que lo hace apto para censura o moderación de contenido en tiempo real. Su licencia es AGPL-3.0, heredada de los pesos base de Ultralytics, lo que impone obligaciones de código fuente a las aplicaciones que lo integren.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), deteccion de objetos en una etapa |
| Parametros totales | no disponible (YOLO26n en tiers tiny/small/medium; YOLO26s en big/huge) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp16 y fp32 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |

Detalles de los tiers:

| Tier | Red base | Resoluciones (shapes) | Clases | Tamano fp16 | Tamano fp32 |
|---|---|---|---|---|---|
| tiny | YOLO26n | 320, 320x192, 320x160, 160x320 | 10 | 4,9 MB | 9,7 MB |
| small | YOLO26n | 512, 512x288, 512x256, 256x512 | 14 | 4,9 MB | 9,8 MB |
| medium | YOLO26n | 640, 640x384 | 14 | 5,0 MB | 9,9 MB |
| big | YOLO26s | 640, 640x384 | 15 | 19,1 MB | 38,2 MB |
| huge | YOLO26s | 1024, 1024x576 | 15 | 19,3 MB | 38,4 MB |

## Arquitectura y entrenamiento

Nevermore se construye sobre YOLO26 de Ultralytics, una familia de modelos de deteccion de objetos en tiempo real de una etapa. Los tiers tiny, small y medium utilizan la variante nano (YOLO26n), mientras que big y huge emplean la variante small (YOLO26s). Los modelos se han afinado (fine-tune) a partir de los pesos preentrenados de Ultralytics YOLO26 y se han exportado a ONNX con Ultralytics 8.4.183. El numero de clases varia por tier: 10 clases en tiny, 14 en small y medium, y 15 en big y huge, donde los tiers superiores distinguen anatomia por sexo (por ejemplo, `penis_exposed`, `vagina_exposed`, `nipple_exposed`).

Los datos de entrenamiento incluyen fotos reales de video procedentes de Pexels, y el modelo 640m de NudeNet (tambien AGPL-3.0) se utilizo para ayudar a etiquetar fotos reales. El autor no publica el numero exacto de imagenes ni de tokens/pasos de entrenamiento. La entrada es un tensor float32 de 1x3xHxW en RGB normalizado de 0 a 1, con letterboxing en gris 114; la salida es `output0` float32 de 1x(4+clases)xN con coordenadas cx, cy, w, h en pixeles de entrada y una puntuacion por clase. El NMS no esta incluido en el grafo ONNX y debe aplicarse externamente (por ejemplo, via Ultralytics).

## Capacidades

- Deteccion de personas y caras en imagenes y fotogramas de video.
- Deteccion de partes del cuerpo expuestas y cubiertas: pechos, genitales, nalgas y pies (las clases exactas dependen del tier).
- Deteccion multi-dominio: fotografias reales, arte furry y anime, con rendimiento destacable en furry y anime frente a alternativas como NudeNet o HotScreen.
- Deteccion en tiempo real con latencias de 2,4 a 5,6 ms por fotograma en RTX 4090, apta para gaming, video y uso de ordenador en directo.
- Multiples resoluciones de entrada por tier, incluyendo formatos panoramicos (16:9) y verticales, para adaptarse a distintos contenidos.
- Versiones fp16 para reducir el tamano del archivo a la mitad manteniendo entrada y salida en float32.
- Integracion con la libreria Ultralytics (`YOLO(..., task="detect")`) y con onnxruntime.

No soporta capacidades de lenguaje, tool calling ni agentes: es exclusivamente un detector de objetos.

## Casos de uso

- Moderacion de contenido en plataformas de video: un servicio de alojamiento puede procesar fotogramas de los videos subidos con el tier big (640) para detectar genitales o pechos expuestos y aplicar blur o clasificacion automatica antes de la publicacion.
- Censura en tiempo real durante gaming o comparticion de pantalla: gracias a latencias de 2,4-5,6 ms por fotograma, herramientas como Sub Control pueden censurar contenido NSFW en directo sin interrumpir la experiencia, usando el tier tiny o small.
- Filtrado parental en navegacion y uso del ordenador: el tier medium a 640 px puede inspeccionar capturas de pantalla periodicas y bloquear o avisar cuando aparece desnudez.
- Moderacion de comunidades con contenido furry o anime: Nevermore supera claramente a NudeNet y HotScreen en estos dominios (68-73 % frente a 7-22 % en furry), por lo que es adecuado para plataformas de arte con reglas sobre desnudez.
- Deteccion en miniaturas (thumbnails): el tier big alcanza el 50,3 % de deteccion en thumbnails frente al 15 % de NudeNet 640m, util para revisar imagenes de previsualizacion de baja resolucion.
- Analisis por lotes de bibliotecas de imagenes: scripts con onnxruntime pueden clasificar grandes colecciones locales (por ejemplo, para organizar o etiquetar contenido adulto) sin GPU, dado el reducido tamano de los modelos.
- Investigacion en deteccion NSFW: al publicar benchmarks comparativos y metadata de clases en cada archivo ONNX, sirve como baseline reproducible para trabajos academicos sobre moderacion de contenido.

## Benchmarks y rendimiento

Metrica: porcentaje de pechos, genitales y nalgas expuestos detectados, en el umbral de confianza (conf) en el que el 80 % de las cajas del modelo son correctas. Latencia medida en una RTX 4090 con DirectML, de fotograma capturado a fotograma censurado (mediana), archivo 16:9.

| Modelo | ms | conf | All | Real photos | Furry | Anime | Window | Thumbnail |
|---|---|---|---|---|---|---|---|---|
| Imagenes de prueba | | | 259 | 172 | 65 | 22 | 179 | 179 |
| **Nevermore 1.0** | | | | | | | | |
| tiny | 2,42 | 0,25 | 64,9 | 75,5 | 46,1 | 76,0 | 46,3 | 17,2 |
| small | 2,98 | 0,20 | 72,1 | 78,4 | 57,2 | 80,0 | 54,3 | 34,5 |
| medium | 3,20 | 0,20 | 74,2 | 76,5 | 54,7 | 82,0 | 53,7 | 37,0 |
| big | 3,64 | 0,15 | 77,1 | 79,9 | 68,4 | 89,0 | 64,7 | 50,3 |
| huge | 5,55 | 0,15 | 77,7 | 85,0 | 73,0 | 77,0 | 62,4 | 49,2 |
| **HotScreen** | | | | | | | | |
| Real 320 | 2,57 | 0,25 | 34,6 | 53,1 | 7,4 | 50,0 | 16,8 | 0,8 |
| Real 640 | 3,81 | 0,35 | 38,4 | 58,9 | 14,9 | 53,0 | 32,7 | 12,3 |
| Real+Anime 320 | 2,58 | 0,25 | 35,2 | 45,1 | 11,1 | 63,0 | 16,6 | 0,0 |
| Real+Anime 640 | 3,88 | 0,35 | 43,6 | 63,6 | 14,9 | 72,0 | 32,0 | 12,0 |
| Real+Anime 640s | 4,23 | 0,40 | 45,4 | 62,4 | 21,7 | 67,0 | 37,1 | 19,0 |
| **NudeNet** | | | | | | | | |
| 320n | 2,61 | 0,10 | 41,9 | 67,8 | 6,7 | 66,0 | 27,8 | 6,2 |
| 640m | 13,26 | 0,05 | 48,7 | 83,2 | 10,3 | 67,0 | 38,0 | 15,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: los modelos son muy ligeros (4,9-19,3 MB en fp16); incluso con overhead de runtime, bastan menos de 1 GB de VRAM en todos los tiers.
- GPU recomendadas: cualquier GPU moderna; los benchmarks oficiales provienen de una RTX 4090 con DirectML. No se han publicado cifras para otras GPU ni para CPU.
- Consumer GPUs: cabe sobradamente en cualquier GPU consumer actual (GTX 1650 en adelante, RTX 20/30/40/50, AMD equivalentes); tambien es viable la ejecucion en CPU via onnxruntime, aunque sin latencias publicadas.
- Opciones de despliegue: onnxruntime (Python, C#, C++), libreria Ultralytics con backend ONNX, DirectML en Windows, y la aplicacion Sub Control del propio autor. No requiere vLLM, llama.cpp ni Ollama al no ser un modelo de lenguaje.
- Latencia: 2,42 ms (tiny) a 5,55 ms (huge) por fotograma 16:9 en RTX 4090 con DirectML; en otros hardware y runtimes los tiempos diferiran.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Latencia (RTX 4090) | All / Furry / Thumbnail | Licencia |
|---|---|---|---|---|---|
| Nevermore 1.0 (big) | no disponible (YOLO26s) | 19,1 MB fp16 | 3,64 ms | 77,1 / 68,4 / 50,3 | AGPL-3.0 |
| NudeNet 640m | no disponible | no disponible | 13,26 ms | 48,7 / 10,3 / 15,0 | AGPL-3.0 |
| HotScreen Real+Anime 640s | no disponible | no disponible | 4,23 ms | 45,4 / 21,7 / 19,0 | no disponible |

Nevermore supera con claridad a NudeNet y HotScreen en el agregado, sobre todo en contenido furry y miniaturas, y es ademas mas rapido que NudeNet 640m (3,64 ms frente a 13,26 ms). NudeNet 640m sigue siendo competitivo en fotografias reales (83,2 frente a 79,9-85,0). Los tres comparten el enfoque de deteccion por partes del cuerpo; HotScreen no publica licencia en la informacion disponible.

## Limitaciones y advertencias

- Omisiones de deteccion: el propio autor advierte que el modelo "se salta partes"; en miniaturas, tiny detecta solo el 17 % y big el 50 % de los casos. No es fiable como unico mecanismo de bloqueo en contenido de baja resolucion.
- Dominios debiles: el rendimiento en furry es inferior al de fotos reales y anime en todos los tiers; en tiny cae al 46,1 %.
- Sesgos no medidos: la precision en distintos tonos de piel y tipos de cuerpo no ha sido evaluada, lo que puede traducirse en tasas de error desiguales entre grupos.
- Cajas de persona imprecisas: las bounding boxes de la clase `person` no son fiables segun el autor y no deben usarse como referencia.
- Latencias no generalizables: las cifras de velocidad provienen unicamente de una RTX 4090 con DirectML; otros GPUs, CPUs y runtimes rendiran distinto.
- Licencia AGPL-3.0 estricta: cualquier aplicacion que distribuya estos modelos o los ejecute para usuarios a traves de red debe liberarse tambien bajo AGPL-3.0 con su codigo fuente. Esto excluye de facto su uso en software privativo y en SaaS cerrado.
- Contenido para adultos: el modelo esta etiquetado como `not-for-all-audiences` y esta pensado para deteccion de desnudez; su uso debe ajustarse a la normativa de moderacion de cada plataforma y jurisdiccion.
- NMS no incluido: el grafo ONNX no aplica supresion de no-maximos, por lo que el integrador debe gestionarla (por ejemplo, via Ultralytics) para obtener detecciones limpias.
- Descargas y adopcion: el repositorio registra 0 descargas y 2 likes en el momento de redactar la ficha, por lo que tiene poco historial de uso comunitario y posibles bugs sin reportar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kinkyrvn/nevermore
- Modelo base Ultralytics YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Pagina oficial del proyecto: https://kinkyraven.com/nevermore/
- Sub Control (aplicacion de referencia): https://subcontrol.kinkyraven.com/
- NudeNet (referencia de benchmark y etiquetado): https://github.com/notAI-tech/NudeNet
- Paper: arxiv:2606.03748 (referenciado en los tags del modelo; no se ha verificado el contenido)
