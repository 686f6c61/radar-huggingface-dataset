# shaoyent/EVM-CoreML-FP16

## Resumen

EVM-CoreML-FP16 es un paquete de inferencia en formato Core ML float16 del modelo EV-M (EfficientSAM3), publicado por el usuario shaoyent. No es un modelo entrenado desde cero ni una version nueva de pesos: es la conversion a Core ML del checkpoint EV-M de EfficientSAM3, empaquetada en dos grafos compilados (`.mlmodelc`) que se ejecutan en dispositivo en iOS y macOS. Su proposito concreto es el matting de prendas de vestir por nombre: la aplicacion ForecastFits lo usa para segmentar exactamente la prenda que el usuario nombra (camisa, pantalon, zapatos, etc.) dentro de una fotografia, sin enviar la imagen a un servidor.

El conjunto ocupa unos 172 MB repartidos en 10 ficheros y consta de un encoder de imagen (EfficientViT-b1, ~94 MB) y un decoder de mascaras (~70 MB). El tercer componente del pipeline original, el encoder de texto MobileCLIP-S0 (42,5 M), no se distribuye ni se ejecuta: se "cuece" en tiempo de exportacion en una tabla fija de 21 terminos de prendas, de modo que en el dispositivo solo hay que ejecutar los dos grafos de imagen. El total declarado de la arquitectura original es de ~89,2 M de parametros, mientras que los grafos efectivamente distribuidos suman ~47 M.

Es relevante ahora porque ilustra un patron habitual en el despliegue en el borde: convertir un modelo de segmentacion abierto entrenado en PyTorch en artefactos Core ML compilados y verificados numericamente contra la referencia, con el objetivo de eliminar la dependencia de GPU en la nube. La model card documenta explicitamente la fidelidad de la conversion (coseno minimo de 0,99999 en los seis tensores de salida del encoder e IoU mediana minima de 0,9819 en las mascaras por palabra). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-b1 (encoder de imagen) + decoder de mascaras tipo DETR estilo SAM3; encoder de texto MobileCLIP-S0 plegado en tiempo de exportacion (no se ejecuta). No es MoE ni SSM |
| Parametros totales | ~89,2 M en la arquitectura de origen (22,2 M vision + 42,5 M texto + 21,0 M decoder) |
| Parametros activos | No aplica (no es un modelo MoE). Grafos de imagen distribuidos: ~47 M de parametros en tiempo de ejecucion |
| Longitud de contexto | No aplica (modelo de vision). La rama de lenguaje usa una secuencia fija de 16 tokens (`language_features` [16,1,256], `language_mask` [1,16], `language_embeds` [16,1,512]) precompilada |
| Tipos de cuantizacion | Float16 (FP16) unicamente. Pesos y activaciones principales en f16; algunas salidas y mascaras de lenguaje se exponen en f32 |
| Idiomas soportados | No disponible. El vocabulario de texto esta fijado a 21 terminos de prendas y no acepta entrada de lenguaje en tiempo de ejecucion; la model card no especifica el idioma de esos terminos |
| Licencia | Apache-2.0 (repositorio y pesos), igual que el proyecto EfficientSAM3 de origen |
| Formato de pesos | Core ML compilado (`.mlmodelc`), 10 ficheros, ~172 MB. No hay safetensors, GGUF ni `mlpackage` de origen (los `.mlpackage` sin sellar son rechazados por `MLModel` en iOS) |
| Entrada | `pixel_values` [1,3,1008,1008] f16, resolucion fija |
| Salidas del encoder | 6 tensores f32: `backbone_fpn_0/1/2_` y `vision_pos_enc_0/1/2_` a 288², 144² y 72² |
| Salidas del decoder | `pred_masks` [1,200,288,288] y `scores` [1,200] |
| Tamano del repositorio | 0,2 GB |
| Plataforma | Core ML, objetivo de despliegue iOS 18.5; verificado en iPhone 15 Pro / iOS 26.x; portable a Apple silicon y x86_64 en macOS |
| Fechas del repositorio | Creado 2026-09-15; actualizado 2026-09-15 |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura de EfficientSAM3 en su variante EV-M. El encoder visual es un EfficientViT-b1 de 22,2 M de parametros, con componentes derivados del trabajo de mit-han-lab, que consume la imagen a 1008x1008 y emite una piramide de tres niveles (288², 144² y 72²) acompanada de codificaciones posicionales (`backbone_fpn_*` y `vision_pos_enc_*`). Sobre esa piramide trabaja un decoder de mascaras de 21,0 M de parametros derivado del codigo de facebookresearch/sam3, con una estructura tipo DETR que produce hasta 200 propuestas de mascara con sus puntuaciones. El encoder de texto es MobileCLIP-S0 (42,5 M, de Apple ml-mobileclip) y su funcion es aportar el condicionamiento por palabra.

La innovacion practica no esta en el entrenamiento sino en el empaquetado. MobileCLIP-S0 se evalua una sola vez, fuera de linea, sobre un vocabulario cerrado de 21 prendas, y sus embeddings (`language_features`, `language_mask`, `language_embeds`) quedan incrustados como constantes dentro de `EVM_WordDecoder`. Con ello el dispositivo no necesita cargar ni ejecutar ningun modelo de texto, y la seleccion de prenda se reduce a elegir una fila de la tabla precalculada. Los dos grafos se compilan con `xcrun coremlc compile --platform iOS --deployment-target 18.5` y se exportaron con coremltools 9.x, con interfaces declaradas como byte-compatibles con la referencia en PyTorch.

No se describe en la informacion disponible el dataset de entrenamiento, el numero de tokens de imagen vistos, ni si hubo fases de RLHF o DPO; esos datos corresponderian al proyecto EfficientSAM3 original y no se detallan aqui. La validacion publicada es exclusivamente numerica: en la comprobacion GATE 0, el coseno minimo del encoder frente a la referencia en PyTorch es de 0,99999 en los seis tensores de salida, y la IoU mediana minima de las mascaras por palabra es de 0,9819 sobre el vocabulario de 21 prendas.

## Capacidades

- Segmentacion de imagen guiada por palabra: dado un `pixel_values` de 1008x1008, el decoder produce mascaras por prenda y una puntuacion por propuesta.
- Matting de prendas de vestir sobre un vocabulario fijo de 21 terminos (camisa, pantalon, zapatos, etc.), que debe entenderse como "vocabulario abierto" solo en el sentido de que el termino se elige de una tabla precompilada, no de texto libre en tiempo de ejecucion.
- Salida multi-mascara: hasta 200 propuestas con puntuacion independiente en `scores` [1,200], lo que permite filtrar por umbral y quedarse con la mejor coincidencia.
- Segmentacion a resolucion de mascara de 288x288, con postprocesado ascendente necesario para obtener la mascara a la resolucion de la imagen original.
- Ejecucion totalmente en dispositivo, sin llamadas de red, lo que permite tratar imagenes personales sin salir del terminal.
- Portabilidad de artefacto entre Apple silicon y x86_64 en macOS gracias al formato compilado.
- No soporta tool calling ni function calling, no es un modelo de lenguaje, no tiene modo de razonamiento, no procesa audio ni video y no genera texto.
- No soporta agentes ni razonamiento multi-paso: es un modelo de una sola pasada imagen a mascara.

## Casos de uso

- Probador virtual y asesor de tallas en aplicaciones de moda: ForecastFits usa este conjunto para segmentar la prenda nombrada por el usuario y aislarla del fondo; el modelo es adecuado porque el pipeline completo (encoder mas decoder) cabe en ~172 MB y no requiere conectividad.
- Recorte automatico de producto para catalogos de comercio electronico: a partir de una foto de estudio, se nombra la categoria ("shoes", "pants") y se obtiene la mascara de la prenda para generar fondos blancos o transparentes de forma masiva, sin coste de GPU en la nube.
- Edicion fotografica local con privacidad: aplicaciones de retoque que necesitan aislar ropa en fotos personales pueden ejecutar el modelo en el dispositivo y evitar subir imagenes a un servidor, con la garantia de que el encoder de texto ni siquiera se distribuye.
- Preetiquetado en pipelines de anotacion: sobre macOS, los grafos Core ML pueden generar mascaras preliminares para que un anotador humano solo corrija, reduciendo el tiempo por imagen en tareas de segmentacion de moda.
- Realidad aumentada sobre la prenda detectada: la mascara y la puntuacion permiten recortar la prenda en tiempo real y superponer una textura o un color alternativo en una vista de camara.
- Filtrado previo en busqueda visual de moda: usar la mascara de la prenda como region de interes antes de calcular embeddings de recuperacion, lo que reduce el ruido del fondo y de elementos no relevantes.
- Funciones de recorte inteligente en apps de segunda mano: el vendedor fotografia una prenda y la app extrae el recorte limpio para la ficha del anuncio, todo en el dispositivo y sin cuota de servidor.
- Limitacion de idoneidad: no es utilizable para segmentacion generica de objetos, deteccion de personas, imagen medica ni ninguna tarea fuera del vocabulario de prendas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, COCO, etc.) en la informacion disponible. La model card unicamente documenta comprobaciones de fidelidad numerica de la conversion frente a la referencia en PyTorch:

| Metrica | Valor declarado | Ambito |
|---|---|---|
| Coseno minimo del encoder vs. PyTorch | 0,99999 | Los 6 tensores de salida (`backbone_fpn_0/1/2_`, `vision_pos_enc_0/1/2_`) |
| IoU mediana minima de mascaras por palabra | 0,9819 | Vocabulario de 21 prendas |
| Fidelidad de interfaz | Interfaces byte-compatibles con la referencia torch | Grafos de imagen |

Datos comparativos frente a SAM 3, EfficientSAM3 en PyTorch u otros modelos de segmentacion en dispositivo: no disponibles en la informacion proporcionada. No se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- No aplica GPU con CUDA: el modelo esta empaquetado exclusivamente para Core ML y se ejecuta sobre Metal en Apple silicon (o sobre CPU/GPU integrada en macOS x86_64).
- Memoria de pesos: aproximadamente 94 MB (encoder) mas 70 MB (decoder), unos 164 MB en FP16. El repositorio completo ocupa 0,2 GB.
- Memoria de activaciones: la salida `pred_masks` [1,200,288,288] en f16 ocupa unos 31,6 MiB y la entrada 1008x1008x3 en f16 unos 5,8 MiB, antes de contabilizar los mapas intermedios del encoder. El pico de memoria total no esta publicado; una estimacion razonable esta en el orden de 1 a 2 GB de memoria unificada, pero se trata de una estimacion derivada, no de un dato de la model card.
- Cabe con holgura en hardware de consumo Apple: la model card cita verificacion en iPhone 15 Pro con iOS 26.x. Requiere un objetivo de despliegue de iOS 18.5 o superior.
- GPU recomendadas: no procede. Para el modelo original en PyTorch si tendria sentido una GPU con CUDA, pero este repositorio no ofrece artefactos para CUDA.
- Opciones de despliegue: Core ML (`MLModel` / `mlmodelc`), compilacion previa con `xcrun coremlc compile --platform iOS --deployment-target 18.5`, y descarga en tiempo de ejecucion mediante el `EVMModelDownloader` de ForecastFits, que valida bytes y SHA256 contra `evm_manifest.json`.
- No compatible con vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM: no hay pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato y plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EVM-CoreML-FP16 (este repositorio) | ~47 M en los grafos de imagen distribuidos (~89,2 M en la arquitectura de origen) | Entrada fija 1008x1008; mascara de salida 288x288; 200 propuestas | Core ML `.mlmodelc` FP16, iOS 18.5+ / macOS | Apache-2.0 | Publico en HuggingFace, 0 descargas |
| EfficientSAM3 EV-M (checkpoint de origen) | ~89,2 M totales (22,2 M vision + 42,5 M texto + 21,0 M decoder) | Condicionamiento por texto libre mediante MobileCLIP-S0 en tiempo de ejecucion | PyTorch (`.pt`) | Apache-2.0 | Publico en HuggingFace (Simon7108528/EfficientSAM3) |
| SAM 3 (facebookresearch/sam3) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Origen del codigo del decoder, segun la model card |
| Otros segmentadores en dispositivo (MobileSAM, FastSAM y similares) | No disponible | No disponible | No disponible | No disponible | No se aportan datos comparativos en la informacion disponible |

La diferencia funcional clave frente al checkpoint PyTorch de origen es que esta version sacrifica el condicionamiento por texto libre a cambio de eliminar el encoder de texto del runtime y de disponer de un artefacto cargable directamente por `MLModel` en iOS.

## Limitaciones y advertencias

- Vocabulario cerrado: el encoder de texto no se ejecuta en el dispositivo y el condicionamiento se limita a 21 terminos de prendas incrustados en el decoder. No es un modelo de vocabulario abierto real en produccion.
- Idioma del vocabulario no especificado: la model card no indica en que idioma estan los 21 terminos, por lo que no puede asumirse que acepte consultas en castellano sin revisar la tabla.
- Dependencia total del ecosistema Apple: requiere Core ML e iOS 18.5 o superior. No hay ruta de despliegue en Linux, Android o servidores con CUDA.
- El repositorio distribuye `.mlmodelc` compilado, no `.mlpackage` de origen; la model card indica que iOS rechaza los bundles sin sellar, de modo que cualquier reexportacion exige repetir el proceso con `coremlc`.
- Formato de pesos unico (Core ML FP16): no hay safetensors ni GGUF, lo que impide usar herramientas estandar de cuantizacion o servidores de inferencia convencionales.
- Riesgo de mascaras espurias: al tratarse de un decoder tipo DETR con 200 propuestas, es imprescindible aplicar un umbral sobre `scores` y un postprocesado; sin filtrado pueden aparecer mascaras falsas sobre regiones sin prenda. Esto es el equivalente en vision al riesgo de alucinacion en modelos de lenguaje.
- Resolucion de mascara limitada a 288x288: en imagenes de alta resolucion el borde de la prenda requerira refinamiento (por ejemplo, un paso de matting guiado por la mascara) para resultados de calidad comercial.
- Sin validacion de la comunidad: 0 descargas y 0 likes en la fecha de consulta, sin issues ni evaluaciones independientes publicadas.
- Trazabilidad de licencias de terceros: aunque el repositorio y los pesos son Apache-2.0, la procedencia incluye componentes de mit-han-lab (EfficientViT), Apple (ml-mobileclip) y facebookresearch (sam3). El uso comercial exige revisar el bloque de atribucion completo recogido en el fichero `THIRD-PARTY-NOTICES.txt` del proyecto ForecastFits.
- Estado temporal: el paquete se publico el 2026-09-15 con un objetivo de despliegue iOS 18.5 y verificacion en iOS 26.x; conviene comprobar compatibilidad si el objetivo de despliegue cambia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shaoyent/EVM-CoreML-FP16
- Proyecto EfficientSAM3 (codigo fuente, Apache-2.0): https://github.com/SimonZeng7108/efficientsam3
- Checkpoint de origen EV-M: https://huggingface.co/Simon7108528/EfficientSAM3 (fichero `efficientsam3_ft/efficientsam3_efficientvit.pt`)
- Componentes citados en la model card sin URL explicita en la informacion proporcionada: mit-han-lab EfficientViT, Apple ml-mobileclip, facebookresearch/sam3. La atribucion completa se referencia en `THIRD-PARTY-NOTICES.txt` del repositorio ForecastFits, cuyo enlace no se incluye en los datos disponibles.
- Los resultados de busqueda web proporcionados corresponden a catalogos de color NCS (codigos tipo S 5030-Y60R) y no guardan ninguna relacion con este modelo, por lo que no se incluyen.
