# Clap-onnx/sonaflow-clap-onnx

## Resumen

Sonaflow-clap-onnx es un paquete de exportacion a ONNX de los codificadores de audio del modelo LAION CLAP (Contrastive Language-Audio Pretraining). No es un modelo entrenado desde cero por el autor del repositorio, sino una conversion de los pesos originales de LAION a formato ONNX en precision fp32, opset 17, con batch dinamico y salida de embeddings L2-normalizados de 512 dimensiones, pensada para ejecutarse con onnxruntime sobre CPU.

El repositorio agrupa dos variantes del codificador de audio: `clap-htsat-fused`, derivada de `laion/clap-htsat-fused`, que acepta entradas log-mel fusionadas de forma `[batch, 4, 1001, 64]`, y `clap-larger-music`, derivada de `laion/larger_clap_music_and_speech`, que acepta entradas log-mel monocanal de forma `[batch, 1, 1001, 64]`. Cada carpeta incluye el grafo ONNX (`clap_audio.onnx`), un fichero `clap_frontend.npz` con la ventana de Hann y los filtros mel necesarios para construir el front-end en numpy, y un `manifest.json` con el origen y los hashes sha256 de los ficheros.

La relevancia de este paquete es de caracter practico: permite incorporar embeddings de audio CLAP en pipelines de inferencia sin dependencia de PyTorch, con un tamano de repositorio de 0,4 GB y licencia Apache-2.0 heredada de los modelos originales. El autor declara que las salidas exportadas coinciden con el modelo PyTorch con una diferencia absoluta maxima inferior a 1e-4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de LAION CLAP exportado a ONNX (dos variantes: HTSAT-fused y larger-music) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada log-mel de 1001 frames x 64 bandas mel) |
| Tipos de cuantizacion | fp32 (unico formato publicado) |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), con front-end auxiliar en NPZ y manifiesto JSON |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: exporta a ONNX el codificador de audio de LAION CLAP. La variante `clap-htsat-fused` corresponde a un codificador HTSAT con fusion de caracteristicas y espera entradas log-mel de cuatro canales (`[batch, 4, 1001, 64]`); la variante `clap-larger-music` corresponde al modelo `larger_clap_music_and_speech` y espera entradas monocanal (`[batch, 1, 1001, 64]`). Ambas producen embeddings de 512 dimensiones L2-normalizados.

La exportacion se ha realizado en fp32, opset 17 y con eje de batch dinamico, orientada a onnxruntime sobre CPU. El autor no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos deben consultarse en las model cards de los modelos originales de LAION. La innovacion tecnica del repositorio es la reproducibilidad del front-end: se incluyen la ventana de Hann y los filtros mel en `clap_frontend.npz`, junto con hashes sha256 en `manifest.json`, de modo que la entrada log-mel puede generarse fuera de PyTorch y compararse contra la referencia.

## Capacidades

- Extraccion de embeddings de audio de 512 dimensiones L2-normalizados, aptos para busqueda por similitud, clustering y recuperacion.
- Codificacion de audio en dos variantes: una fusionada (HTSAT-fused) y otra orientada a musica y habla (larger-music).
- Inferencia sin PyTorch mediante onnxruntime, con batch dinamico.
- Front-end numpy incluido (ventana de Hann y filtros mel) para construir la entrada log-mel.
- No incluye el codificador de texto de CLAP: no permite zero-shot audio classification por texto dentro de este paquete.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un codificador, no un modelo generativo.
- Capacidades multilingues: no aplica (modelo de audio).

## Casos de uso

- Busqueda de audio por similitud: indexar un catalogo de clips con los embeddings de 512 dimensiones y recuperar los mas cercanos mediante producto escalar o distancia coseno, sin necesidad de PyTorch en el servidor.
- Deduplicacion y deteccion de near-duplicates en archivos musicales: usar la variante `clap-larger-music` para comparar huellas semanticas de pistas y descartar copias con metadatos distintos.
- Etiquetado y clasificacion de audio en pipelines de datos: generar embeddings y entrenar un clasificador ligero (regresion logistica o k-NN) encima para generos musicales, tipos de sonido ambiental o presencia de habla.
- Moderacion y filtrado de contenido sonoro: detectar segmentos de audio similares a una referencia marcada como no deseada comparando embeddings normalizados.
- Servicio de inferencia en CPU: desplegar `clap_audio.onnx` con onnxruntime en contenedores sin GPU para entornos con restricciones de hardware.
- Investigacion en representaciones audio-texto: reutilizar el codificador de audio exportado junto con el codificador de texto original de LAION CLAP para reproducir el espacio compartido, validando la equivalencia con PyTorch (diferencia maxima declarada inferior a 1e-4).
- Preprocesado en pipelines de ML: generar embeddings como caracteristicas de entrada para modelos posteriores de recomendacion o segmentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete esta orientado a onnxruntime sobre CPU en fp32.
- GPU recomendadas: no disponibles. Al ser una exportacion para CPU, no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada; al ser ONNX opset 17 podria ejecutarse con el execution provider de CUDA de onnxruntime, pero el autor no lo documenta.
- Opciones de despliegue: onnxruntime (CPU), con front-end numpy a partir de `clap_frontend.npz`.
- Latencia y throughput: no disponibles.
- Tamano del repositorio: 0,4 GB, que acota el espacio en disco necesario para los dos grafos y sus ficheros auxiliares.

## Comparativa con modelos similares

| Modelo | Formato | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| Sonaflow-clap-onnx (este) | ONNX fp32, opset 17 | log-mel `[batch, 4, 1001, 64]` o `[batch, 1, 1001, 64]` | embedding 512-d L2-normalizado | Apache-2.0 | Exportacion para onnxruntime en CPU, sin PyTorch |
| laion/clap-htsat-fused | PyTorch | log-mel fusionado | embedding CLAP | Apache-2.0 | Modelo original de referencia |
| laion/larger_clap_music_and_speech | PyTorch | log-mel monocanal | embedding CLAP | Apache-2.0 | Modelo original de referencia |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete solo incluye el codificador de audio; no incluye el codificador de texto, por lo que no habilita zero-shot classification por texto de forma autonoma.
- Solo se publica fp32: no hay variantes cuantizadas (int8, fp16) en el repositorio, lo que limita optimizaciones de latencia y memoria.
- La entrada debe construirse con el front-end incluido (ventana de Hann y filtros mel en `clap_frontend.npz`); un preprocesado distinto degradara los embeddings sin aviso.
- La forma de entrada esta fijada a 1001 frames y 64 bandas mel; no se documenta soporte para otras duraciones o resoluciones.
- El autor declara una diferencia maxima absoluta inferior a 1e-4 frente a PyTorch, pero no se publican validaciones independientes.
- Riesgo de sesgo y alucinacion: no aplica en sentido generativo, pero los embeddings pueden heredar sesgos de los datos de entrenamiento originales de LAION, no documentados en este repositorio.
- Licencia Apache-2.0 heredada de los modelos originales; se permite uso comercial, pero conviene verificar las condiciones de los modelos fuente de LAION.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- Los resultados de la busqueda web sobre "CLAP" corresponden a entidades no relacionadas (legalizacion, asociaciones, utillaje de cine) y no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Clap-onnx/sonaflow-clap-onnx
- Modelo original clap-htsat-fused: https://huggingface.co/laion/clap-htsat-fused
- Modelo original larger_clap_music_and_speech: https://huggingface.co/laion/larger_clap_music_and_speech
