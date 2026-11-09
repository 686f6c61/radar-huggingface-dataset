# Phips/NERVE

## Resumen

NERVE (Norm-free Efficient Restoration for Various Edge devices) es una arquitectura de superresolucion de imagen (SISR) y restauracion de imagenes reales disenada para ser ligera, facil de entrenar y rapida de ejecutar en dispositivos de borde. Desarrollada por Philip Hofmann (usuario Phips), forma parte de la suite BODY, una familia de redes orientadas a uso real en produccion antes que a la persecucion de metricas en benchmarks academicos.

El modelo resuelve el problema de escalar y restaurar imagenes degradadas (ruido, desenfoque, artefactos de compresion JPEG) manteniendo un coste computacional muy bajo: aproximadamente 1,8 millones de parametros, un tamano propio de la clase SPAN pero con arquitectura exclusivamente convolucional. La red esta pensada para exportarse sin fricciones a ONNX dinamico y ncnn, lo que la hace adecuada para movil, web, motores de videojuegos y sistemas embebidos.

Se distribuyen variantes de factor 2x y 4x, tanto para imagenes limpias (release) como para imagenes degradadas del mundo real (OTF GAN), entrenadas sobre el dataset CC0 Phips/lucid-cc0-v2-hc-512 con el pipeline de degradacion OTF de Real-ESRGAN. Todo el entrenamiento se realizo en una unica GPU de consumo (RTX 3060 de 12 GB), lo que subraya su accesibilidad para investigadores y desarrolladores sin infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional exclusivamente (conv-only), sin normalizacion, con bloques Conv / Add / ReLU / DepthToSpace / Resize |
| Parametros totales | ~1,8 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen de cualquier tamano) |
| Tipos de cuantizacion | fp16 (ncnn verificado); pesos ONNX en precision nativa; cuantizacion adicional no documentada |
| Idiomas soportados | en (etiqueta de idioma de la model card; el modelo procesa imagenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, ncnn (param + bin) |
| Factor de escala | 2x y 4x |
| Entrada / salida | RGB de cualquier tamano / RGB escalada 2x o 4x |
| Tamano del repositorio | 0,6 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

NERVE es una red de superresolucion de una sola etapa, puramente convolucional y sin capas de normalizacion (norm-free). La model card indica que el conjunto de operadores es estandar y reducido (Conv, Add, ReLU, DepthToSpace y Resize), lo que simplifica la exportacion a ONNX dinamico y a ncnn y reduce la dependencia de operadores exoticos. El archivo de arquitectura tiene aproximadamente 85 lineas, lo que facilita su mantenimiento a largo plazo y su integracion en marcos de entrenamiento existentes.

El entrenamiento se realizo con traiNNer-redux sobre el dataset CC0 Phips/lucid-cc0-v2-hc-512, aplicando el pipeline completo de degradacion OTF de Real-ESRGAN. La etapa base utiliza una unica perdida Charbonnier, con AMP en bf16 y sin recorte de gradiente (gradient clipping), lo que produce un entrenamiento estable y predecible. La variante OTF GAN anade una etapa adversaria para restaurar imagenes degradadas del mundo real. No se especifica en la informacion disponible el numero exacto de tokens, iteraciones ni la composicion detallada del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables a un modelo de vision de este tipo).

## Capacidades

- Superresolucion de imagen con factores de escala 2x y 4x.
- Restauracion de imagenes degradadas del mundo real (ruido, desenfoque, artefactos de compresion) mediante la variante OTF GAN.
- Escalado de imagenes limpias con la variante release.
- Procesamiento de entradas RGB de cualquier resolucion, con salida de dimensiones proporcionales al factor de escala.
- Exportacion a ONNX dinamico (verificada con paridad ~1e-5 frente a PyTorch en ONNX Runtime).
- Conversion a ncnn en fp16 verificada; se espera compatibilidad con CoreML, TensorRT y DirectML por el conjunto estandar de operadores, aunque no estan probados por el autor.
- Integracion con chaiNNer mediante los archivos ONNX; la carga de safetensors via spandrel requiere registrar NERVE en la build local.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio o texto: es un modelo exclusivamente de imagen a imagen.

## Casos de uso

- Restauracion de fotografias antiguas o escaneos degradados: la variante 4x OTF GAN revierte ruido, desenfoque y artefactos de compresion, adecuada para digitalizacion de archivos fotograficos.
- Mejora de imagenes generadas por difusion: la model card incluye ejemplos de escalado 4x sobre salidas de Stable Diffusion, util para flujos de posprocesado de imagen generativa.
- Superresolucion en dispositivos moviles: con ~1,8 M parametros y exportacion ncnn fp16, puede ejecutarse en telefonos y sistemas embebidos para escalar imagenes en local sin depender de servidores.
- Integracion en motores de videojuegos: el conjunto de operadores estandar y el bajo coste computacional permiten usarlo para escalar texturas o renders en tiempo real en hardware de consumo.
- Procesamiento por lotes en pipelines web: los archivos ONNX dinamicos permiten desplegar el modelo en servicios de imagen (por ejemplo, mejora de miniaturas o fotos subidas por usuarios) con latencia baja.
- Preprocesado para tareas de vision por computador: escalar imagenes de baja resolucion antes de alimentar detectores o clasificadores, mejorando la calidad de entrada sin coste elevado.
- Herramientas de edicion de imagen de escritorio: integracion via chaiNNer o la aplicacion local nerve-app para flujos de restauracion y escalado por parte de usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~1,8 M parametros el modelo ocupa unos pocos megabytes en fp32 y menos en fp16, por lo que cabe holgadamente en cualquier GPU de consumo. La VRAM efectiva dependera principalmente de la resolucion de la imagen de entrada.
- GPU recomendadas: cualquier GPU moderna; el autor entreno todos los modelos en una unica RTX 3060 de 12 GB, lo que confirma que no se requiere hardware de clase servidor.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4090 y GPUs de gama de entrada; tambien en hardware movil via ncnn.
- Opciones de despliegue: ONNX Runtime (verificado), ncnn (verificado, fp16), chaiNNer, traiNNer-redux para entrenamiento; se espera compatibilidad con TensorRT, DirectML y CoreML, aunque no estan probados por el autor.
- Latencia y throughput: no se proporcionan cifras concretas en la informacion disponible; la model card solo indica que el modelo es "pequeno y rapido" y apto para movil, borde, web y motores de juegos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NERVE | ~1,8 M | Imagen RGB de cualquier tamano | Conv-only, norm-free, orientado a despliegue en borde | Apache 2.0 | Hugging Face, ONNX, ncnn |
| HEART (mismo autor) | no disponible | Imagen RGB | Red de mayor capacidad de la suite BODY, orientada a maxima calidad | no disponible | Hugging Face |
| HAT | no disponible | Imagen RGB | Transformer con atencion por ventanas, orientado a benchmarks | no disponible | Repositorios publicos |
| ATD | no disponible | Imagen RGB | Transformer orientado a rendimiento en benchmarks | no disponible | Repositorios publicos |
| DAT2 | no disponible | Imagen RGB | Transformer orientado a rendimiento en benchmarks | no disponible | Repositorios publicos |

La model card indica explicitamente que, si el objetivo es maximizar PSNR o LPIPS en benchmarks academicos o emplear un transformer grande, NERVE no es la opcion adecuada y recomienda HEART, HAT, ATD o DAT2. Los datos de parametros y licencias de los modelos comparados no estan detallados en la informacion proporcionada.

## Limitaciones y advertencias

- No persigue maximos de PSNR o LPIPS en benchmarks academicos; su prioridad es la simplicidad, la capacidad de despliegue y el entrenamiento sin complicaciones.
- La variante release esta pensada para imagenes limpias; para imagenes degradadas debe usarse la variante OTF GAN.
- Las salidas ncnn son fp16, por lo que pueden aparecer pequenas desviaciones en bordes de alto contraste.
- La carga de safetensors via spandrel requiere registrar NERVE en la build de chaiNNer o spandrel; no esta integrado upstream.
- TensorRT, DirectML y CoreML se esperan compatibles por el conjunto de operadores, pero no han sido probados por el autor.
- El binding Python de ncnn presenta problemas con el constructor de arrays crudos en entradas grandes; debe usarse `Mat.from_pixels`.
- Riesgo de sesgos y alucinacion: no aplica en el sentido de texto generativo, pero la restauracion puede introducir detalles sinteticos plausibles que no estaban en la imagen original, especialmente en la variante GAN.
- La etiqueta de idioma es "en", aunque el modelo opera sobre imagenes y no procesa texto.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribucion exigidos por la misma.
- Entrenado en una sola GPU de consumo y sobre un dataset CC0 concreto; la generalizacion a dominios de imagen muy alejados del dataset de entrenamiento no esta documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phips/NERVE
- HEART (modelo hermano): https://huggingface.co/Phips/HEART
- Demo de NERVE: https://huggingface.co/spaces/Phips/nerve
- Demo de HEART: https://huggingface.co/spaces/Phips/heart
- Conversion de checkpoints: https://huggingface.co/spaces/Phips/nerve-convert
- Aplicacion local: https://github.com/Phhofm/nerve-app
- Entrenamiento de NERVE: https://github.com/Phhofm/nerve-train
- Entrenamiento de HEART: https://github.com/Phhofm/heart-train
- Repositorio de modelos del autor: https://github.com/Phhofm/models
- traiNNer-redux: https://github.com/the-database/traiNNer-redux
- Dataset: https://huggingface.co/datasets/Phips/lucid-cc0-v2-hc-512
