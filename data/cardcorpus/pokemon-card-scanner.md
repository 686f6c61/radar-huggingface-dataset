# cardcorpus/pokemon-card-scanner

## Resumen

CardCorpus Scanner es un sistema compuesto por varios modelos de vision por computador, desarrollado por cardcorpus, cuyo objetivo es identificar cartas coleccionables de Pokemon en fotografias reales. A diferencia de un unico modelo generativo, el repositorio empaqueta cinco redes especializadas (detector de cuadrilateros, matcher de huellas visuales, cabezas de orientacion, lector de numeros de coleccionista y selector de impresion) mas un indice de recuperacion de 102.185 huellas correspondientes a 67.247 cartas. El sistema devuelve la direccion exacta de la carta (conjunto y numero) en el dataset CardCorpus, cubriendo impresiones en ingles, japones y chino simplificado desde 1996 hasta 2026.

La arquitectura combina un backbone convolucional MobileNetV4-small para deteccion, un ViT-S/16 DINOv3 afinado para extraccion de caracteristicas visuales, un ViT PE-Core S/16 afinado para distinguir impresiones de una misma ilustracion, y una CRNN con CTC para lectura de numeros. El conjunto pesa aproximadamente 335 MB en safetensors float32 (indice en float16), lo que permite despliegue en CPU y GPU de consumo.

Es relevante ahora porque demuestra un pipeline de retrieval multimodal de extremo a extremo para un dominio vertical (TCG) con resultados medidos: 96,7% de acierto en la primera candidata sobre paginas de archivador de cartas vintage, y 89,9% en fotos tomadas con movil. El sistema alimenta la aplicacion iOS PennySleeve y se distribuye con un paquete Python de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de vision: detector MobileNetV4-small (QuadDet), matcher DINOv3 ViT-S/16 + proyeccion lineal 384→512, cabezas de orientacion MLP 512→256→4, lector CRNN con CTC, selector PE-Core S/16 |
| Parametros totales | 48,2M aproximados (1,4M detector + 21,8M matcher + 0,1M cabezas + 1,1M lector + 23,8M selector) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | pesos en float32 safetensors; indice en float16; no se documentan otras cuantizaciones |
| Idiomas soportados | ingles, japones y chino simplificado (en las impresiones de cartas reconocidas) |
| Licencia | cardcorpus-scanner-mixed (varias licencias por fichero, detalladas en LICENSE.md) |
| Formato de pesos | safetensors (float32); indice float16; tamano total del repo ~335 MB |

## Arquitectura y entrenamiento

El sistema no es un transformer unico sino un pipeline en cascada. QuadDet predice el centro, tamano y cuatro esquinas de cada carta sobre una rejilla de stride 4, usando MobileNetV4-small como backbone con entrada de 1280 px en el lado largo. El matcher es un DINOv3 ViT-S/16 afinado para distinguir ilustraciones, con una proyeccion lineal de 384 a 512 dimensiones; la carta se endereza en sus cuatro giros y una cabeza de orientacion (512→256→4) elige la version vertical. El selector de impresion es un PE-Core S/16 afinado que compara la carta completa (448×320) contra una galeria de 24.587 huellas para desambiguar impresiones de una misma ilustracion (por ejemplo, Base Set, Base Set 2 y Legendary Collection). El lector de numeros es una CRNN con CTC sobre 40 caracteres que procesa tiras grises de 48×384.

El entrenamiento combina datos sinteticos y reales. El detector parte de pesos ImageNet y se entrena sobre escenas compuestas a partir de imagenes de cartas y sobre fotos reales con esquinas marcadas o revisadas manualmente. El matcher y el selector se afinan con aumentacion foto-realista (perspectiva, rotacion, iluminacion, color, desenfoque, reflejos y compresion) sobre imagenes de cartas y fotos reales. El lector de numeros se entrena con tiras recortadas de imagenes de cartas y de fotos revisadas. El indice cubre todas las cartas del dataset CardCorpus a fecha de 11 de noviembre de 2026, incluyendo huellas de imagenes del dataset y de fotos adicionales. No se documenta el numero exacto de tokens ni el volumen total del dataset de entrenamiento.

## Capacidades

- Deteccion multi-carta en una sola imagen: localiza cada carta en paginas de archivador, mesas o sostenidas en la mano mediante prediccion de centro, tamano y cuatro esquinas.
- Reconocimiento de la impresion exacta (conjunto y numero) de cartas Pokemon en ingles, japones y chino simplificado, desde 1996 hasta 2026.
- Recuperacion por similitud visual sobre un indice de 102.185 huellas de 67.247 cartas distintas.
- Desambiguacion entre impresiones de una misma ilustracion mediante el selector PE-Core y un verificador sin entrenamiento basado en SIFT y homografia.
- Lectura de numeros de coleccionista con CRNN y CTC sobre 180 tiras por carta, con votacion agregada.
- Deteccion de sello de 1st Edition mediante template matching y de reverse holo e-Card mediante periodicidad de las tiras.
- Estimacion de orientacion de la carta en cuatro giros posibles.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un sistema puramente de vision y recuperacion.

## Casos de uso

- Catalogacion de colecciones personales: el usuario fotografia una pagina de archivador y el sistema devuelve la lista de cartas con su conjunto y numero, permitiendo inventariar lotes de 9 a 12 cartas por foto en pocos segundos en GPU reciente o Apple silicon.
- Aplicacion movil de escaneo (PennySleeve): integracion en iOS para identificar cartas al vuelo, con 89,9% de acierto medido en 139 fotos tomadas con movil, adecuado para asistir al coleccionista en tiempo real.
- Verificacion de lotes en compraventa: dado que distingue impresiones de una misma ilustracion (Base Set frente a Base Set 2), sirve para comprobar si un lote anunciado corresponde a las ediciones declaradas.
- Digitalizacion de inventarios de tienda: procesamiento por lotes de fotografias de vitrinas o cajas para generar catalogos con la direccion CardCorpus de cada carta, apoyandose en el CLI y la pagina web local del paquete `cardcorpus-scanner`.
- Investigacion sobre retrieval visual: el repositorio sirve como referencia reproducible de un pipeline deteccion + enderezado + huella + recuperacion + fusion, con pesos y umbrales publicados en `pipeline.json`.
- Deteccion de ediciones especiales: los scores de 1st Edition y de reverse holo e-Card permiten filtrar copias potencialmente valiosas dentro de un lote antes de una inspeccion manual.
- Control de calidad en grading: aunque no evalua condicion, la identificacion fiable de la impresion (96,7% en vintage a resolucion completa) puede alimentar sistemas de gestion de envios a granel.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos el 27 de octubre de 2026 con estos modelos y el indice de esa fecha. La metrica es el acierto de la primera candidata cuando coincide con la impresion exacta, sobre fotos excluidas del entrenamiento.

| Conjunto de fotos | Cartas | Aciertos |
|---|---|---|
| Paginas de archivador de cartas vintage, a resolucion completa de camara | 641 | 620 (96,7%) |
| Las mismas fotos reducidas a 3000 px | 641 | 618 (96,4%) |
| Cartas fotografiadas con movil | 139 | 125 (89,9%) |
| Fotos reales variadas, muchas pequenas, borrosas o en angulo | 672 | 585 (87,1%) |

No se han publicado comparaciones con otros modelos de reconocimiento de cartas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el conjunto de pesos float32 ocupa aproximadamente 48M de parametros (~190 MB) mas el indice float16, por lo que cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU reciente con al menos 4 GB; el autor menciona "GPU reciente o Apple silicon" para escanear una pagina de 9 a 12 cartas en pocos segundos.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y Apple silicon (M-series).
- Opciones de despliegue: paquete Python `cardcorpus-scanner` (CLI y pagina web local); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: una pagina de 9 a 12 cartas tarda "unos segundos" en GPU reciente o Apple silicon y "mas tiempo" en CPU; no se publican cifras exactas de latencia por carta ni de throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de reconocimiento de cartas Pokemon en la documentacion proporcionada. Como referencia de categoria, se puede comparar con extractores de caracteristicas visuales genericos:

| Modelo | Parametros | Tipo | Licencia | Uso para esta tarea |
|---|---|---|---|---|
| CardCorpus Scanner | ~48,2M (pipeline) | Deteccion + retrieval especializado | cardcorpus-scanner-mixed | Sistema completo con indice de 67.247 cartas |
| DINOv3 ViT-S/16 (base) | ~21M | Extractor de caracteristicas | no disponible en la informacion | Requiere indice y cabezas propias; sin desambiguacion de impresiones |
| PE-Core S/16 (base) | ~23M | Extractor de caracteristicas | no disponible en la informacion | Requiere galeria y ajuste para distinguir impresiones |
| MobileNetV4-small (base) | ~1,4M | Detector/backbone convolucional | no disponible en la informacion | Solo backbone; sin QuadDet ni cabezas entrenadas |

## Limitaciones y advertencias

- El sistema solo conoce las cartas presentes en su indice (a fecha de 11 de noviembre de 2026); una carta posterior no sera reconocida y el escaner devolvera la carta mas cercana que conozca.
- No distingue copia 1st Edition de Unlimited ni reverse holo de estandar a nivel de matcher: ambas comparten huella. Los scores de sello y e-Card ayudan solo cuando la impresion presenta una marca distintiva.
- No evalua la condicion de la carta y no ha sido probado con cartas en slabs graduados.
- Riesgo de falsos positivos en fotos de baja calidad: el acierto baja al 87,1% en fotos reales variadas con cartas pequenas, borrosas o en angulo.
- Licencia mixta por fichero (cardcorpus-scanner-mixed): es imprescindible revisar LICENSE.md antes de uso comercial, ya que cada componente puede tener condiciones distintas.
- No se documentan sesgos demograficos ni linguisticos mas alla de los tres idiomas de impresion cubiertos; el rendimiento en otras ediciones (coreano, aleman, frances, etc.) no esta medido.
- Dependencia de la calidad del indice: actualizar a nuevos sets requiere una nueva instantanea del repositorio.
- No es un modelo generativo ni conversacional; no admite instrucciones en lenguaje natural ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cardcorpus/pokemon-card-scanner
- Repositorio del codigo (paquete Python, CLI y web local): https://github.com/cardcorpus/pokemon-card-scanner
- Dataset CardCorpus: https://github.com/cardcorpus/pokemon-card-dataset
- Sitio del dataset: https://cardcorpus.com
- Aplicacion PennySleeve: https://pennysleeve.app
- Ejemplo de conjunto en el dataset: https://cardcorpus.com/v1/sets/international/base-set.json
- Licencia (LICENSE.md): https://huggingface.co/cardcorpus/pokemon-card-scanner/blob/main/LICENSE.md
