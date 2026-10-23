# shozebDev/birefnet-lite-512-onnx

## Resumen

`shozebDev/birefnet-lite-512-onnx` es una exportacion a ONNX del modelo `ZhengPeng7/BiRefNet_lite`, un modelo de segmentacion dicotomica de imagen (separacion sujeto/fondo) desarrollado originalmente por Zheng Peng et al. y publicado bajo licencia MIT. Esta version concreta, mantenida por el usuario `shozebDev`, fija la entrada a 512×512 pixeles y esta pensada para ejecutarse integramente en el navegador mediante `transformers.js` y WebGPU, sin enviar las imagenes a un servidor.

El problema que resuelve es de naturaleza practica: la exportacion oficial de `onnx-community` a 1024×1024 consume mucha memoria de GPU y requiere adaptadores con 17 o mas storage buffers por shader stage, lo que la deja fuera de los limites por defecto de WebGPU. Esta exportacion reduce el consumo de memoria aproximadamente a una cuarta parte y ningun operador enlaza mas de 7 storage buffers, por lo que funciona con los limites estandar del navegador.

El repositorio ocupa 0,3 GB e incluye dos ficheros: `onnx/model.onnx` en fp32 (~192 MB) y `onnx/model_fp16.onnx` con pesos en fp16 y entrada/salida en fp32 (~100 MB). Ambos reproducen la salida del modelo PyTorch original con una diferencia maxima de alpha de 3e-6. La arquitectura se apoya en un backbone Swin Transformer con el modulo de referencia bilateral caracteristico de la familia BiRefNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer con modulo de referencia bilateral (BiRefNet); exportada a ONNX |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 512×512) |
| Tipos de cuantizacion | fp32 y fp16 (pesos fp16 con entrada/salida fp32) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`) |
| Entrada | `input_image`: float32 `[1, 3, 512, 512]`, RGB normalizado con media ImageNet `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]` |
| Salida | `output_image`: float32 `[1, 1, 512, 512]` con logits; aplicar sigmoide para obtener el alpha matte |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

BiRefNet es un modelo de segmentacion dicotomica de imagen de alta resolucion descrito en el articulo *Bilateral Reference for High-Resolution Dichotomous Image Segmentation* (CAAI AIR 2024). La etiqueta `swin` del repositorio indica que el extractor de caracteristicas se basa en un Swin Transformer, y el mecanismo de referencia bilateral procesa la imagen en dos ramas complementarias (una de apariencia y otra de gradientes o parches) para refinar los bordes del sujeto. El resultado es un mapa de un solo canal que actua como matte alfa, lo que permite recortes con bordes suaves y no solo mascaras binarias.

Sobre el entrenamiento no se ofrece informacion en la model card: no se detalla el numero de tokens ni de imagenes, la composicion del dataset, ni si hubo etapas de ajuste fino con refuerzo o preferencias (poco habitual en segmentacion). La innovacion tecnica de esta ficha concreta no esta en el modelo sino en la exportacion: entrada fija a 512×512, reescritura del grafo para que ningun operador supere los 7 storage buffers y verificacion numerica contra PyTorch con una diferencia maxima de alpha de 3e-6.

## Capacidades

- Segmentacion de sujeto frente a fondo (dichotomous image segmentation) con salida de matte alfa continuo.
- Generacion de recortes con bordes suaves, adecuados para composicion sobre nuevos fondos.
- Ejecucion en navegador con `transformers.js` sobre WebGPU, y tambien sobre WASM cuando no hay GPU disponible.
- Inferencia local sin envio de imagenes a servidores externos (relevante para privacidad).
- Entrada de resolucion fija 512×512, con reescalado previo necesario para imagenes de otra dimension.
- Salida en logits que el consumidor debe pasar por una sigmoide; permite ajustar el umbral de recorte.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision multimodal ni audio: es un modelo puramente de segmentacion.

## Casos de uso

- Editor de fotos en el navegador: la aplicacion carga `model_fp16.onnx` con `transformers.js`, redimensiona la imagen a 512×512, ejecuta la inferencia y compone el matte alfa sobre un fondo nuevo. La ventaja es que todo ocurre en el cliente, sin coste de servidor ni subida de imagenes.
- Catalogos de e-commerce: proceso por lotes en Node con `onnxruntime-node` para generar PNG con transparencia de productos sobre fondo blanco o variable, reduciendo el trabajo manual de retoque.
- Herramientas de diseno grafico (canvas, mockups): recorte instantaneo del sujeto mientras el usuario edita, con latencia aceptable al operar sobre una entrada de solo 512×512 y pesos de ~100 MB.
- Efectos de videollamada o streaming web: sustitucion o desenfoque de fondo en el navegador, aplicando el matte por fotograma sobre el flujo de la webcam (requiere validar el rendimiento por frame, no publicado).
- Preprocesado en pipelines de vision: aislar el sujeto antes de tareas posteriores de clasificacion, deteccion o medicion, eliminando ruido de fondo en las etapas siguientes.
- Generacion de assets para ilustracion o prototipado: extraccion rapida de recortes de personajes y objetos para pegatinas, miniaturas o composiciones en herramientas web.
- Automatizacion de flujos en aplicaciones de escritorio basadas en Electron: al ser ONNX, puede ejecutarse embebido sin dependencias de Python ni servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de validacion aportada es la fidelidad numerica respecto al modelo PyTorch original: diferencia maxima de alpha menor o igual a 3e-6 para ambos ficheros exportados. No hay datos de IoU, S-measure, F-measure ni tiempos de inferencia.

## Requisitos de hardware

- VRAM estimada: el fichero fp32 ocupa ~192 MB y el fp16 ~100 MB, por lo que los pesos caben holgadamente en cualquier GPU moderna; el consumo real incluye activaciones de la entrada 512×512 y no se ha publicado una medicion concreta.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU en el navegador; en servidor, tarjetas tipo A100, H100 o RTX 4090 estan sobredimensionadas para este modelo, que se beneficia mas de la cercania al cliente que de la potencia bruta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con WebGPU, y tambien en CPU mediante WASM con `onnxruntime-web`.
- Restriccion clave de WebGPU: ningun operador enlaza mas de 7 storage buffers, frente a los 17 o mas de la exportacion a 1024×1024, por lo que funciona con los limites por defecto del navegador sin solicitar limites ampliados.
- Opciones de despliegue: `transformers.js` (WebGPU o WASM) en navegador, `onnxruntime-web` directamente, y `onnxruntime` / `onnxruntime-node` en escritorio y servidor. vLLM, llama.cpp, TGI y Ollama no aplican: no son runtimes para modelos de vision en formato ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, la model card indica que esta exportacion necesita aproximadamente una cuarta parte de la memoria del export a 1024×1024.

## Comparativa con modelos similares

| Modelo | Resolucion de entrada | Formato | Tamano de pesos | Requisitos WebGPU | Licencia |
|---|---|---|---|---|---|
| `shozebDev/birefnet-lite-512-onnx` (esta ficha) | 512×512 fija | ONNX (fp32 y fp16) | ~192 MB fp32 / ~100 MB fp16 | Ningun operador supera 7 storage buffers; funciona con limites por defecto | MIT |
| `onnx-community/BiRefNet_lite-ONNX` | 1024×1024 | ONNX | no disponible | Requiere adaptador con 17+ storage buffers por shader stage y mucha memoria de GPU | no disponible en la informacion proporcionada |
| `ZhengPeng7/BiRefNet_lite` (original) | no disponible | PyTorch | no disponible | no aplica (no es exportacion web) | MIT |

La diferencia practica entre las dos exportaciones ONNX es de resolucion y de encaje en WebGPU: la version a 1024×1024 ofrece mas detalle de borde a costa de memoria y de limites de adaptador mas altos, mientras que esta version a 512×512 prioriza la portabilidad en navegador. No hay datos publicados de calidad de segmentacion que permitan comparar numericamente ambas resoluciones.

## Limitaciones y advertencias

- Entrada fija a 512×512: las imagenes de mayor resolucion deben reescalarse, lo que puede degradar la precision en bordes finos (pelo, ramas, tejidos) respecto a la variante de 1024×1024.
- La salida son logits, no un alpha listo para usar: es obligatorio aplicar una sigmoide y decidir un umbral, algo que afecta directamente al resultado final.
- El preprocesado debe respetar exactamente la normalizacion ImageNet indicada (media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]`) y el orden de canales RGB; cualquier desviacion altera el matte sin aviso.
- Riesgo de segmentacion incorrecta en escenas con multiples sujetos, fondos de color similar al sujeto u oclusiones; no se han publicado evaluaciones cuantitativas que acoten el error.
- Sesgos: no hay informacion sobre la distribucion del dataset de entrenamiento original, por lo que se desconoce si el rendimiento es homogeneo entre tonos de piel, tipos de cabello, indumentaria cultural o entornos poco representados.
- Licencia MIT, permisiva para uso comercial, heredada del modelo original; conviene conservar la atribucion a Zheng Peng et al. y la cita del articulo.
- El repositorio tiene 0 descargas y 1 like, y fue creado y actualizado el mismo dia: no hay evidencia de uso en produccion ni mantenimiento continuado.
- No se ha publicado informacion sobre latencia, consumo de memoria en ejecucion ni comportamiento en GPU integradas, datos necesarios para dimensionar una aplicacion en tiempo real.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni conversacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shozebDev/birefnet-lite-512-onnx
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Exportacion ONNX oficial a 1024×1024: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Repositorio de transformers.js: https://github.com/huggingface/transformers.js
- Articulo de referencia: Zheng Peng et al., *Bilateral Reference for High-Resolution Dichotomous Image Segmentation*, CAAI Artificial Intelligence Research, 2024 (sin enlace disponible en la informacion proporcionada).
