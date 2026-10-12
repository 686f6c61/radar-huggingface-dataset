# jere1882/document-image-denoising

## Resumen

Document image denoising es una coleccion de seis modelos de red neuronal convolucional entrenados para eliminar artefactos de compresion JPEG, desenfoque y ruido en imagenes de documentos escaneados. Lo desarrolla el usuario jere1882 y se publica bajo licencia MIT. El problema que resuelve es el de la limpieza previa de paginas escaneadas antes de pasarlas a un pipeline de OCR u otro procesamiento documental, donde los artefactos de compresion degradan la calidad del reconocimiento.

El paquete cubre tres arquitecturas (unet, residual_unet y plain_encoder_decoder) y una ablacion de anchura sobre residual_unet que va desde 7,70 M de parametros hasta 0,12 M (el 1,6 % del tamano original). Cada variante se distribuye como checkpoint de PyTorch Lightning y como exportacion ONNX en fp32 y en int8, lo que permite desplegarla tanto en GPU como en CPU sin dependencias de PyTorch.

Su relevancia actual radica en el equilibrio entre calidad y coste: los modelos mas pequenos ocupan entre 160 KB y 0,5 MB en int8 y mantienen una PSNR cercana a la de los grandes, lo que los hace candidatos para preprocesado de documentos en el borde o en servidores sin GPU. El repositorio incluye codigo de inferencia con troceado (tiling) para procesar paginas de resolucion arbitraria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN encoder-decoder: `unet`, `residual_unet` y `plain_encoder_decoder` |
| Parametros totales | De 0,12 M a 7,70 M segun variante (ver tabla de benchmarks) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de imagen a imagen) |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion estatica QDQ, pesos por canal, calibrada con 500 recortes de entrenamiento) |
| Idiomas soportados | no aplicable (procesa imagenes, no texto) |
| Licencia | MIT (codigo y pesos) |
| Formato de pesos | Checkpoint de PyTorch Lightning (`.ckpt`, fp32 con estado del optimizador) y ONNX (`model_fp32.onnx`, `model_int8.onnx`, con ejes dinamicos de alto y ancho) |

## Arquitectura y entrenamiento

Los modelos son redes convolucionales de tipo encoder-decoder. Las variantes `unet` y `residual_unet` incorporan conexiones residuales (skip connections) entre encoder y decoder, mientras que `plain_encoder_decoder` carece de ellas manteniendo la misma profundidad. La ablacion de anchura reduce `residual_unet` de 64 a 8 canales base (bc), lo que rebaja el numero de parametros de 7,70 M a 0,12 M. Las variantes `residual_unet` aprenden a predecir el ruido en lugar de la imagen limpia.

El entrenamiento se realizo en 2 GPU T4 durante 10 epocas, con datos, degradaciones y semilla identicos en todas las ejecuciones. El conjunto de datos son 50.000 recortes renderizados a partir de PDF escaneados, publicados por el mismo autor en Kaggle como `jeremiasrodriguez/document-crops-50k`; ese dataset no se redistribuye en HuggingFace y se rige por sus propios terminos. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de restauracion de imagen.

La innovacion tecnica que reporta el autor es mas bien analitica: las conexiones residuales aportan mucho mas que la anchura (la variante sin skips pierde unos 2 dB frente a `unet`/`residual_unet`, mientras que reducir `residual_unet` a 32 canales, un 25 % de los parametros, solo cuesta 0,2 dB). Ademas, el aprendizaje residual converge antes en las primeras fases pero no ofrece ventaja de calidad final frente a la prediccion directa, y la cuantizacion a int8 cuesta como maximo 0,14 dB con una reduccion de tamano de 4x.

## Capacidades

- Restauracion de imagenes de documentos: elimina artefactos de compresion JPEG, desenfoque y ruido sobre recortes escaneados.
- Modelo de imagen a imagen (pipeline `image-to-image`): recibe una imagen degradada y devuelve la version limpia.
- Procesamiento de paginas completas mediante troceado (tiling) con solapamiento configurable (`tile_size=512`, `overlap=32` en el ejemplo del autor).
- Inferencia en CPU sin PyTorch: la ruta ONNX int8 se puede cargar directamente con `onnxruntime`.
- Cuantizacion aplicada: versiones fp32 e int8 con ejes dinamicos de alto y ancho, aptas para entradas de distinta resolucion.
- No soporta tool calling, agentes, razonamiento multi-paso, vision semantica ni capacidades multilingues: es exclusivamente un modelo de restauracion de imagen.

## Casos de uso

- Preprocesado para OCR: limpiar paginas escaneadas antes de pasarlas a un motor de reconocimiento de texto, de modo que los artefactos JPEG no degraden la segmentacion de caracteres.
- Digitalizacion de archivos historicos: aplicar los modelos a documentos escaneados con ruido de escaner o desenfoque para mejorar la legibilidad y la calidad de la copia digital.
- Reduccion de tamano de documentos escaneados: al eliminar ruido de compresion, permite re-comprimir las imagenes con menos bitrate manteniendo la calidad percibida.
- Procesamiento en el borde sin GPU: usar la variante int8 de 160 KB en dispositivos con CPU limitada o escaneres conectados, gracias a la ruta ONNX sin dependencias de PyTorch.
- Pipeline de vision documental por lotes: integrar el checkpoint de PyTorch Lightning en un servicio de procesado por lotes con GPU T4 o superior para limpiar grandes volumenes de paginas.
- Limpieza previa a modelos de vision-lenguaje: normalizar imagenes de documentos antes de enviarlas a un VLM o a un sistema de extraccion de campos, reduciendo ruido de entrada.
- Ablacion y experimentacion academica: reutilizar el dataset de 50.000 recortes, los notebooks y las seis variantes para estudiar el efecto de las skip connections y de la anchura en tareas de restauracion.

## Benchmarks y rendimiento

Datos de la model card. La PSNR es la metrica global (una unica PSNR calculada sobre el error cuadratico sumado de todo el split de validacion, no la media de PSNR por imagen). Latencia medida sobre un unico tile de 512x512, batch 1 y 4 hilos de CPU en Apple Silicon (una sola maquina, no una afirmacion de hardware general).

| Modelo | Parametros | PSNR fp32 (dB) | PSNR int8 (dB) | Tamano fp32-a-int8 (ONNX) | Latencia CPU fp32-a-int8 (ms/img) | Tiempo de entrenamiento |
|---|---|---|---|---|---|---|
| `unet` (bc64) | 7,70 M | 30,33 | 30,24 | 30,8 MB a 7,8 MB | 288 a 243 | 6 h 33 m |
| `residual_unet` (bc64) | 7,70 M | 30,25 | 30,18 | 30,8 MB a 7,8 MB | 286 a 239 | 7 h 06 m |
| `residual_unet` (bc32) | 1,93 M | 30,03 | 30,00 | 7,7 MB a 2,0 MB | 90 a 76 | 3 h 26 m |
| `residual_unet` (bc16) | 0,48 M | 29,22 | 29,22 | 1,9 MB a 0,5 MB | 44 a 34 | 2 h 44 m |
| `residual_unet` (bc8) | 0,12 M | 27,36 | 27,23 | 0,5 MB a 0,16 MB | 18 a 18 | 2 h 35 m |
| `plain_encoder_decoder` (bc64) | 6,93 M | 28,28 | 28,20 | 27,7 MB a 7,0 MB | 239 a 194 | 5 h 41 m |

Conclusiones reportadas por el autor: el aprendizaje residual converge antes al inicio pero no mejora la PSNR final; las skip connections importan mucho mas que la anchura; y la cuantizacion int8 cuesta como maximo 0,14 dB con una reduccion de tamano de 4x. No se han publicado comparaciones con modelos externos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy reducida. Los pesos fp32 del modelo mas grande ocupan 30,8 MB y los int8, 7,8 MB; el modelo mas pequeno ocupa 0,5 MB en fp32 y 0,16 MB en int8. La memoria de ejecucion depende del tamano de tile y del batch.
- GPU recomendadas: no se especifican en la informacion disponible. El entrenamiento se realizo en 2x T4. Por tamano, cualquiera de las variantes cabria en practicamente cualquier GPU.
- GPU de consumo: si, cabe en cualquier GPU de consumo e incluso se puede ejecutar solo en CPU.
- Opciones de despliegue: PyTorch Lightning (`DenoisingLitModule` con `tile_denoise` del repo), ONNX Runtime (`model_int8.onnx` o `model_fp32.onnx` con `onnxruntime`) para una ruta de CPU sin dependencias de PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: para un tile de 512x512, batch 1 y 4 hilos de CPU en Apple Silicon, la latencia va de 288 ms (unet fp32) a 18 ms (residual_unet bc8). La model card advierte que son medidas de una sola maquina y no una afirmacion general de hardware. No se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con modelos externos de denoising documental. La unica comparativa disponible es interna, entre las seis variantes del propio paquete:

| Variante | Parametros | PSNR fp32 | Tamano int8 | Perfil de uso |
|---|---|---|---|---|
| `unet` (bc64) | 7,70 M | 30,33 | 7,8 MB | Maxima calidad, mayor coste |
| `residual_unet` (bc64) | 7,70 M | 30,25 | 7,8 MB | Calidad practicamente identica a `unet` |
| `residual_unet` (bc32) | 1,93 M | 30,03 | 2,0 MB | Mejor equilibrio calidad/tamano |
| `residual_unet` (bc16) | 0,48 M | 29,22 | 0,5 MB | Entornos con recursos limitados |
| `residual_unet` (bc8) | 0,12 M | 27,36 | 0,16 MB | Maxima ligereza, calidad inferior |
| `plain_encoder_decoder` (bc64) | 6,93 M | 28,28 | 7,0 MB | Referencia sin skip connections |

## Limitaciones y advertencias

- Es un modelo de restauracion de imagen, no un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- La evaluacion se limita a una unica metrica (PSNR) sobre un split de validacion del propio dataset. No se reportan metricas perceptuales (SSIM, LPIPS) ni evaluaciones de impacto aguas abajo sobre OCR.
- La PSNR reportada es global (error cuadratico sumado), no la media de PSNR por imagen; el autor advierte que ambas cantidades difieren en varios dB y no son comparables.
- Los datos de latencia proceden de una sola maquina Apple Silicon con 4 hilos de CPU y no deben tomarse como referencia general de rendimiento.
- Existe riesgo de sobreajuste al dominio: el entrenamiento usa 50.000 recortes renderizados de PDF escaneados, por lo que el comportamiento fuera de ese tipo de documento y de degradacion (por ejemplo, fotografia natural) no esta caracterizado.
- La licencia es MIT tanto para codigo como para pesos, por lo que el uso comercial esta permitido; el dataset de entrenamiento no se redistribuye y se rige por los terminos de su pagina de Kaggle.
- No hay informacion sobre sesgos, idiomas ni contextos de contexto largo, ya que no aplican a este tipo de modelo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jere1882/document-image-denoising
- Codigo, notebooks de entrenamiento y analisis completo: https://github.com/jere1882/DocDenoising
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/jeremiasrodriguez/document-crops-50k
