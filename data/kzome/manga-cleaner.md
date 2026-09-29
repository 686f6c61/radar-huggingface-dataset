# kzome/manga-cleaner

## Resumen

Manga Cleaner (kzome/manga-cleaner) es un pipeline de vision por computador publicado en HuggingFace que elimina el texto (bocadillos, efectos de sonido y cajas de narracion) de paginas de manga y comic, y reconstruye el fondo de las zonas borradas. No es un modelo de lenguaje ni un transformador generativo: es un ensamblaje de dos etapas formado por un detector de texto en imagenes (exportado a ONNX) y un modelo de inpainting (LaMa, empaquetado como TorchScript), mas una aplicacion Gradio lista para ejecutar. El autor es kzome y el repositorio ocupa 0,3 GB, con el detector en unos 90 MB y el modelo de inpainting en unos 196 MB.

El problema que resuelve es un cuello de botella clasico en scanlation, traduccion automatica de comics y archivado digital: separar el texto del dibujo sin danar la ilustracion. La estrategia es mixta y pragmatica. Cuando el fondo de una region es plano (bocadillos blancos, paneles lisos) se rellena con el color mediano del contorno de la region, lo que es rapido y sin perdida; cuando el fondo es complejo (arte, degradados) se invoca LaMa para reconstruirlo. El resultado se entrega como un ZIP de paginas limpias (PNG o JPG) junto con una previsualizacion con las zonas borradas marcadas en rojo.

Su relevancia actual es practica y de nicho: es una alternativa autoalojada, sin dependencia de APIs de pago, para preprocesar lotes de paginas antes de un OCR, de un sistema de traduccion o de un reentintado (lettering) nuevo, con una licencia copyleft fuerte (AGPL-3.0) que condiciona su uso como servicio. La informacion publicada no incluye parametros, ventana de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: deteccion de texto (ONNX, ejecutado con OpenCV DNN, codigo de comic-text-detector) e inpainting (LaMa, TorchScript). La arquitectura interna de cada red no se detalla en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no procesa tokens). El parametro analogo es *Context margin*, en pixeles de margen alrededor de cada region |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX y TorchScript; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible. La interfaz de la aplicacion Gradio esta en arabe e ingles; no se declara el conjunto de idiomas del texto detectado |
| Licencia | AGPL-3.0 para la obra combinada. Componentes: codigo de deteccion GPL-3.0, `big-lama.pt` Apache-2.0, logica del cargador MIT |
| Formato de pesos | ONNX (`data/comictextdetector.pt.onnx`, ~90 MB, via OpenCV DNN) y TorchScript (`data/big-lama.pt`, ~196 MB) |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema no es un unico modelo, sino una cadena de procesamiento. La primera etapa usa el detector de texto de comic-text-detector, exportado a ONNX y ejecutado mediante el modulo DNN de OpenCV; produce una mascara de texto por pagina. La segunda etapa agrupa las regiones de texto cercanas (para que el inpainter trabaje sobre un bloque limpio en lugar de fragmentos) y decide entre dos vias: relleno con el color mediano de los pixeles del contorno cuando la desviacion de color del borde queda por debajo de un umbral (*Flat background threshold*), o inpainting con LaMa cuando el fondo es complejo. LaMa se carga como TorchScript mediante un cargador propio (`lama.py`), con logica reutilizada del proyecto `simple-lama-inpainting`. La model card no documenta el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO, porque no se trata de un modelo de lenguaje.

El control de calidad se expone como parametros ajustables: *Mask thickness* (dilatacion de la mascara detectada; mas alto borra mas y captura contornos y efectos de sonido), *Merge nearby regions* (distancia por debajo de la cual dos areas se tratan como un solo bloque), *Context margin* (pixeles extra de contexto que recibe LaMa) y *Flat background threshold* (umbral que decide entre relleno plano e inpainting). La guia del autor indica subir *Mask thickness* si sobrevive texto y bajarlo, o subir el umbral de fondo plano, si se danan las caras. La model card acredita el uso de comic-text-detector (Gue3bara), manga-image-translator (zyddnys), LaMa (advimman), simple-lama-inpainting, ultralytics/yolov5 y WenmuZhou/DBNet.pytorch, pero no describe el entrenamiento de ninguna de las dos redes.

## Capacidades

- Deteccion de texto en paginas de manga y comic: bocadillos de dialogo, efectos de sonido y cajas de narracion.
- Fusion de regiones de texto proximas para tratarlas como un unico bloque de borrado.
- Relleno rapido y sin perdida de regiones con fondo plano mediante el color mediano del contorno.
- Inpainting de fondo complejo (ilustracion, degradados) con LaMa.
- Salida en lote: ZIP de paginas limpias en PNG o JPG, mas previsualizacion con superposicion roja de lo borrado.
- Interfaz web Gradio autoalojada, con textos de interfaz en arabe e ingles.
- Ejecucion en Google Colab mediante un cuaderno incluido, con enlace publico temporal de `gradio.live`.
- Ajuste fino del comportamiento mediante cuatro parametros (grosor de mascara, fusion de regiones, margen de contexto, umbral de fondo plano).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, ni procesamiento de audio o video.

## Casos de uso

- Limpieza de paginas para scanlation y traduccion: el pipeline borra el texto original y deja el fondo reconstruido, listo para rotular la traduccion encima sin tener que redibujar bocadillos a mano.
- Preprocesado para OCR y traduccion automatica: generar una version sin texto reduce el ruido que recibe un motor de OCR o un traductor de comics; el ZIP de salida se puede encadenar con el resto del pipeline.
- Archivado y restauracion de comics escaneados: eliminar anotaciones, sellos de agua textuales o texto superpuesto en escaneos antiguos, con previsualizacion en rojo para auditar que se ha borrado antes de archivar.
- Generacion de plantillas de lettering: obtener la pagina limpia y volver a componer los globos con tipografia nueva, util en reediciones y ediciones localizadas.
- Procesado por lotes en un servidor interno: al ejecutarse en CPU (unos 30-90 s por pagina de manga en un equipo de 4 nucleos) y no depender de APIs externas, es viable montarlo como servicio interno de limpieza nocturna de catalogos.
- Limpieza de tiras webtoon largas: dividiendolas en fragmentos (parametro `CHUNK_H` en `cleaner.py`) para intercambiar calidad de deteccion por velocidad, ya que las tiras largas tardan bastante mas.
- Prototipado e investigacion en vision por computador: al ser un repositorio pequeno con detector ONNX y modelo TorchScript separados, sirve como banco de pruebas para comparar estrategias de deteccion de texto o de inpainting.
- Demostracion en Colab sin instalacion local: el cuaderno de tres celdas permite compartir un enlace publico temporal, util para revisiones con editores o clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de precision de deteccion (F1, IoU), de calidad de inpainting (PSNR, SSIM, LPIPS) ni comparaciones con otros sistemas en la model card.

Los unicos datos de rendimiento publicados son tiempos de ejecucion en CPU de 4 nucleos:

| Operacion | Tiempo publicado |
|---|---|
| Deteccion sobre un recorte de 1200 px | ~11 s |
| Inpainting LaMa por region | ~5-10 s |
| Pagina de manga completa | ~30-90 s |
| Tiras webtoon largas | "bastante mas"; el autor recomienda trocearlas |

## Requisitos de hardware

- VRAM estimada: no publicada. Los pesos suman aproximadamente 286 MB (90 MB el detector ONNX y 196 MB el de inpainting), por lo que el conjunto cabe holgadamente en memoria de CPU y en cualquier GPU de consumo actual; no se documenta una ruta de ejecucion en GPU.
- GPU recomendadas: no disponible. El autor no publica tiempos ni configuraciones con GPU, y la aplicacion se documenta explicitamente con tiempos de CPU.
- CPU: cualquier equipo de 4 nucleos es suficiente para ejecutar la aplicacion; el coste dominante son los 30-90 s por pagina de manga y los 5-10 s por cada region enviada a LaMa.
- GPU de consumo: no hay datos publicados que confirmen mejoras de velocidad en GPUs como RTX 3090 o RTX 4090, aunque PyTorch y TorchScript permitirian mover el modelo de inpainting a CUDA modificando el codigo, algo no documentado por el autor.
- Opciones de despliegue: aplicacion Gradio (`app.py`) ejecutada en local o en Google Colab; inferencia ONNX mediante OpenCV DNN para el detector; cargador TorchScript propio para LaMa. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: ver la tabla de la seccion anterior. No se publica throughput por lote ni paralelizacion.

## Comparativa con modelos similares

| Sistema | Enfoque | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| manga-cleaner (kzome) | Deteccion + relleno plano o inpainting LaMa, con app Gradio | no disponible | AGPL-3.0 (obra combinada) | Repositorio HuggingFace, 0,3 GB, cuaderno de Colab |
| manga-image-translator (zyddnys) | Pipeline completo de traduccion de manga, del que procede el detector | no disponible | AGPL-3.0 | Repositorio en GitHub |
| comic-text-detector (Gue3bara) | Solo deteccion y segmentacion de texto en comics | no disponible | GPL-3.0 | Repositorio en GitHub |
| LaMa / big-lama (advimman) | Solo inpainting de imagenes con mascaras grandes | no disponible | Apache-2.0 | Repositorio en GitHub y pesos TorchScript |

La ventaja diferencial de manga-cleaner frente a los tres anteriores es la integracion: une deteccion, decision de relleno plano frente a inpainting y una interfaz web en un unico paquete ejecutable, en lugar de exigir el ensamblaje manual de componentes. No se dispone de datos comparativos de calidad entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no acepta prompts, no genera texto, no soporta tool calling ni razonamiento multi-paso. Cualquier evaluacion debe centrarse en la calidad de la mascara y del inpainting.
- Calidad no cuantificada: no hay metricas publicadas de deteccion ni de reconstruccion, por lo que el ajuste de los cuatro parametros se hace por inspeccion visual con la previsualizacion roja.
- Riesgo de dano en la ilustracion: el propio autor advierte de que una mascara demasiado gruesa puede danar caras y detalles; hay que bajar *Mask thickness* o subir *Flat background threshold* en esos casos.
- Texto superviviente: si la mascara es demasiado fina, parte del texto o de los efectos de sonido permanece en la pagina.
- Coste elevado en CPU para volumen alto: 30-90 s por pagina de manga y tiras webtoon largas que requieren troceado manual, lo que limita el uso interactivo.
- Idiomas no declarados: no se especifica para que idiomas o alfabetos se ha validado el detector; la unica informacion linguistica es que la interfaz esta en arabe e ingles.
- Licencia restrictiva para uso comercial: la obra combinada se declara AGPL-3.0, con codigo de deteccion GPL-3.0. Ofrecerlo como servicio en red obliga a liberar el codigo correspondiente; hay que conservar la licencia y las atribuciones indicadas por el autor.
- Dependencias con licencias distintas: `big-lama.pt` es Apache-2.0 y la logica del cargador es MIT, pero eso no relaja la licencia del conjunto.
- Repositorio practicamente sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni de mantenimiento continuado.
- Sin pipeline declarado en HuggingFace, por lo que no se puede cargar con la API estandar de `transformers` pese a la etiqueta `transformers` del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kzome/manga-cleaner
- Cuaderno de Colab: https://huggingface.co/kzome/manga-cleaner/blob/main/Manga_Cleaner_Colab.ipynb
- comic-text-detector (detector de texto, GPL-3.0): https://github.com/Gue3bara/comic-text-detector
- manga-image-translator (origen del modelo de deteccion, AGPL-3.0): https://github.com/zyddnys/manga-image-translator
- LaMa (modelo de inpainting, Apache-2.0): https://github.com/advimman/lama
- simple-lama-inpainting (logica del cargador, MIT): https://github.com/enesmsahin/simple-lama-inpainting
- ultralytics/yolov5: https://github.com/ultralytics/yolov5
- WenmuZhou/DBNet.pytorch: https://github.com/WenmuZhou/DBNet.pytorch
