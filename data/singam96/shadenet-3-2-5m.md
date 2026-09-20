# singam96/ShadeNet-3.2-5M

## Resumen

ShadeNet-3.2-5M es un modelo de *inverse rendering* (representacion inversa) de 5,0 millones de parametros desarrollado por el usuario singam96. Toma una unica fotografia RGB como entrada y devuelve una descomposicion de 8 canales en un solo paso: albedo (3 canales), profundidad relativa (1), normales de superficie (3) y shading o irradiancia en escala de grises (1). No es un modelo de lenguaje: es un modelo de vision image-to-image orientado a la estimacion de materiales y geometria.

El modelo es el sucesor de ShadeNet-2-20M y reduce el tamano en un factor de 4 (de 20 M a 5 M de parametros) mejorando simultaneamente la profundidad y las normales: segun la model card, la profundidad mejora un 12 % y las normales un 16 % en L1 sobre el mismo conjunto de validacion de 807 imagenes. La relevancia practica esta en su huella: los pesos ONNX en fp16 ocupan 10 MB y pueden ejecutarse en CPU, lo que lo hace apto para previsualizacion PBR, aumentacion de datos o procesamiento en el borde.

La arquitectura combina un generador ParallelUNet con doble codificador (ruta UNet convencional mas un tronco MobileNetV2 congelado) y una cola de salida basada en un diccionario de parches de 32 atomos aprendidos. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones declaradas en la model card. El repositorio tiene 0 descargas y 0 «likes» en el momento de redactar esta ficha, por lo que no existe validacion independiente conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ParallelUNet: generador de 4,98 M de parametros con doble codificador en paralelo (ruta UNet estandar + tronco MobileNetV2 congelado, fusionados en cada nivel del decodificador), convoluciones separables en profundidad factorizadas 1x3 + 3x1, cuello de botella a H/32, padding por reflexion y cola de salida con diccionario de parches |
| Parametros totales | 5,0 M (4,98 M en el generador): 3,2 M entrenables + 1,8 M del tronco MobileNetV2 congelado |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: modelo de vision. Entrada RGB `[1, 3, H, W]` en `[-1, 1]`, entrenado a 384 px y acepta cualquier resolucion multiplo de 16 |
| Tipos de cuantizacion | fp32 y fp16 en ONNX. No se documentan otros formatos (INT8, GGUF, etc.) |
| Idiomas soportados | No aplica: no procesa texto ni audio |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch (`.ckpt`, 44 MB, EMA), ONNX fp32 (20 MB, EMA, GPU via CUDA EP) y ONNX fp16 (10 MB, EMA, CPU) |
| Salida | 8 canales `[1, 8, H, W]` en `[-1, 1]`: albedo `[0:3]`, profundidad relativa `[3:4]`, normales `[4:7]`, shading `[7:8]` |
| Discriminador | PatchGAN con GroupNorm y normalizacion espectral, 2,77 M de parametros (solo se usa durante el entrenamiento) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El generador es un ParallelUNet de 4,98 M de parametros con dos codificadores que trabajan en paralelo: una ruta UNet convencional y un tronco MobileNetV2 congelado cuyas caracteristicas se fusionan en todos los niveles del decodificador. Todo el modelo usa convoluciones separables en profundidad factorizadas (1x3 seguida de 3x1), un cuello de botella completo a H/32 y padding por reflexion. La innovacion mas destacable es la cola de salida con diccionario de parches: la salida se divide en baldosas de 16x16 y se direcciona por softmax sobre 32 atomos aprendidos por canal, que se mezclan de vuelta en la senal antes de la tangente hiperbolica. El diccionario original de 1024 atomos se podo a 32 tras medir que solo unos 34 atomos se seleccionan alguna vez y que los 32 principales concentran el 99,4 % de la masa de direccionamiento.

El entrenamiento usa un discriminador PatchGAN con GroupNorm y normalizacion espectral (2,77 M de parametros, descartado en inferencia) y un objetivo declarado como MSE ponderada mas reconstruccion. Los pesos publicados son una media movil exponencial (EMA) de los pesos, que segun la model card mejora el albedo y la profundidad a costa de un ligero empeoramiento en normales. El conjunto de datos es `singam96/flickr8k_marigold_v2`, derivado de Flickr8K con pseudo-etiquetas generadas con Marigold, es decir, el modelo se entrena sobre etiquetas sinteticas y hereda sus sesgos. En inferencia, la demo oficial aplica una mediana multiescala de 3 pasadas (escalas 0,875 / 1,0 / 1,125) como desruido suave, que reduce la varianza a cambio de perder algo de detalle.

## Capacidades

- Descomposicion intrinseca de una imagen en albedo, shading y reconstruccion (`albedo × shading`) en una sola pasada.
- Estimacion de profundidad relativa (no metrica, ambigua respecto a una transformacion afine; 0 = cerca).
- Estimacion de normales de superficie con regularizacion de longitud unitaria.
- Generacion de mapas de material y geometria listos para flujos PBR (physically based rendering).
- Salida de 8 canales en una unica pasada de inferencia, sin necesidad de multiples modelos especializados.
- Ejecucion en CPU gracias al ONNX fp16 de 10 MB y en GPU mediante el execution provider CUDA.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: no es un modelo generativo de texto.
- No dispone de modo «thinking», vision-lenguaje, audio ni capacidades multilingues.

## Casos de uso

- Previsualizacion PBR en produccion de videojuegos: a partir de una fotografia de referencia se obtienen albedo y normales que se pueden importar en motores como Unreal o Unity para texturizar assets antes de disponer de materiales definitivos.
- Aumentacion de datos para otros modelos de vision: las 8 salidas por imagen permiten generar variaciones controladas de iluminacion (modificando solo el canal de shading) conservando el albedo, util para entrenar modelos de reconocimiento robustos a cambios de luz.
- Fotogrametria y reconstruccion 3D: la separacion de albedo y shading y la prediccion de normales y profundidad relativa sirven como inicializacion o regularizacion en pipelines de NeRF y 3D Gaussian Splatting.
- Relighting 2D en edicion fotografica: al ser `input ≈ albedo × shading`, se puede retocar el canal de shading y recomponer la imagen para simular otra iluminacion manteniendo la reflectancia estimada.
- Etiquetado automatico de datasets de materiales: el modelo puede actuar como anotador para poblar conjuntos con mapas de normales y profundidad aproximados, filtrando despues por umbral de L1.
- Procesamiento en el borde o en el navegador: con 10 MB en fp16 y ejecucion en CPU, es viable integrarlo en aplicaciones de escritorio o servicios con GPU modesta donde no cabe un modelo de difusion.
- Comercio electronico y visualizacion de producto: generacion de mapas de normales y albedo para previsualizar materiales de catalogo sin captura adicional.
- Realidad aumentada: la profundidad relativa y las normales permiten estimar la orientacion de superficies para insertar objetos virtuales con una coherencia basica de iluminacion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y en la model card. La metrica `val/loss` (MSE ponderada + reconstruccion) figura con `verified: false`. Las cifras L1 por mapa sobre el split de validacion completo de 807 imagenes son la metrica comparable entre versiones, segun el propio autor.

| Metrica (val, 807 imagenes) | ShadeNet-3.2-5M (EMA, publicado) | ShadeNet-3.2-5M (raw) | ShadeNet-2-20M | Variacion frente a ShadeNet-2 |
|---|---|---|---|---|
| val/loss (MSE ponderada + recon) | 0,1671 | 0,1669 | no disponible | no disponible |
| Albedo L1 | 0,6952 | 0,7013 | 0,708 | −1,7 % |
| Profundidad L1 (alineada SSI) | 0,2174 | 0,2241 | 0,247 | −12 % |
| Normales L1 | 0,5807 | 0,5709 | 0,696 | −16 % |

Notas: los pesos ONNX publicados corresponden a la variante EMA. No se han publicado resultados de benchmarks frente a modelos de terceros (Marigold, DSINE u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB (estimacion propia a partir de los 10-20 MB de pesos y de las activaciones a 384 px; el autor no publica cifras).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. No se requieren A100 ni H100; una GTX 1050 o superior, o cualquier RTX, es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales e incluso en iGPU con soporte de ONNX Runtime.
- Ejecucion en CPU: viable con el ONNX fp16 de 10 MB; el autor lo indica explicitamente para el modelo `model_fp16.onnx`.
- Opciones de despliegue: ONNX Runtime (CUDA EP para GPU, CPU EP para CPU), CLI de PyTorch incluida en el repositorio (`inference.py`), y Gradio Space en Hugging Face (`app.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo).
- Latencia y throughput: no disponible. El autor no publica tiempos de inferencia; solo indica que la demo usa una mediana multiescala de 3 pasadas, lo que multiplica aproximadamente por tres el coste de una pasada simple.

## Comparativa con modelos similares

La unica comparativa documentada en la informacion disponible es la que el propio autor establece con la version anterior de la familia. No hay datos publicados frente a modelos de terceros en la model card ni en los resultados de busqueda web.

| Modelo | Parametros | Salidas | Licencia | Formato de pesos | Datos comparativos |
|---|---|---|---|---|---|
| ShadeNet-3.2-5M | 5,0 M (3,2 M entrenables) | Albedo, profundidad relativa, normales, shading (8 canales) | Apache-2.0 | ckpt, ONNX fp32/fp16 | Albedo L1 0,6952; profundidad L1 0,2174; normales L1 0,5807 |
| ShadeNet-2-20M | 20 M | Albedo, profundidad relativa, normales, shading | Apache-2.0 | ckpt | Albedo L1 0,708; profundidad L1 0,247; normales L1 0,696 |
| Otros modelos de *inverse rendering* | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La profundidad es relativa y ambigua respecto a una transformacion afine (0 = cerca), por lo que no sirve para medicion metrica ni para integracion directa en pipelines que exijan escala absoluta.
- El error L1 del albedo (0,695) es alto: los mapas de reflectancia deben tratarse como aproximaciones, no como ground truth fisico.
- Entrenado sobre pseudo-etiquetas generadas con Marigold a partir de Flickr8K: hereda los sesgos y los errores de ese proceso de anotacion sintetica, incluidos los sesgos de contenido, demografia y geografia del dataset original de Flickr.
- El problema de la descomposicion intrinseca es mal planteado por naturaleza (reflectancia e iluminacion son ambiguas), de modo que el modelo puede producir mapas plausibles pero incorrectos en escenas con iluminacion mixta, superficies especulares o materiales translucidos. En la practica equivale al riesgo de alucinacion en modelos de lenguaje.
- Resolucion de entrenamiento de 384 px: aunque acepta cualquier resolucion multiplo de 16, no hay garantia de calidad fuera de ese regimen. El post-procesado oficial de 3 pasadas con mediana multiescala reduce la varianza a costa de perder detalle (el propio autor senala que el albedo de una sola pasada es mas nitido que sus pseudo-etiquetas).
- El checkpoint con mejor L1 de normales (raw, 0,5709) no es el publicado: los pesos distribuidos son los EMA, que tienen mejor albedo y profundidad pero peor L1 de normales.
- La licencia del modelo es Apache-2.0, pero el tronco MobileNetV2 congelado y sus pesos preentrenados tienen su propia licencia, que no se detalla en la informacion disponible; conviene verificarla antes de un uso comercial.
- El unico resultado de benchmark declarado (`val/loss = 0,1671`) esta marcado como no verificado (`verified: false`) y la formula del `val/loss` cambio entre la version 2 y la 3, segun el autor.
- Repositorio con 0 descargas y 0 «likes»: no existe validacion independiente, ni informes de terceros, ni comunidad que haya reproducido los resultados.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo; todas las referencias utiles provienen del repositorio de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singam96/ShadeNet-3.2-5M
- Dataset de entrenamiento: https://huggingface.co/datasets/singam96/flickr8k_marigold_v2
- Demo (Gradio Space): https://huggingface.co/spaces/singam96/ShadeNet-3.2-5M
- Version anterior: https://huggingface.co/singam96/ShadeNet-2-20M
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
