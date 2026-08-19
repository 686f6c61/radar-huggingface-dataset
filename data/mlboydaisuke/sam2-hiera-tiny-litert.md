# mlboydaisuke/SAM2-hiera-tiny-LiteRT

## Resumen

SAM2-hiera-tiny-LiteRT es una conversión del modelo de segmentación SAM 2.1 Hiera-Tiny de Meta al formato LiteRT (antes TensorFlow Lite) con soporte completo de aceleración GPU mediante la API `CompiledModel` de ML Drift. El modelo permite segmentar objetos en imágenes y vídeo a partir de prompts interactivos (puntos o cajas), ejecutándose íntegramente en el dispositivo sin necesidad de conexión a servidores.

Desarrollado por mlboydaisuke, este modelo resuelve el problema de llevar la segmentación de alta calidad de SAM 2 a dispositivos móviles y edge, manteniendo una fidelidad numérica bit-exacta respecto al PyTorch original. Se compone de dos grafos separados: un encoder de imagen (80 MB en fp16) que se ejecuta una sola vez por imagen, y un decoder de máscaras (17 MB) que se ejecuta por cada punto de prompt. Incluye además una ruta completa de seguimiento de vídeo con banco de memoria, todo GPU-residente.

La relevancia actual radica en que permite desplegar capacidades de segmentación interactiva de nivel investigación en hardware móvil comercial (Pixel 8a, iPhone 17 Pro) con latencias de entre 0,5 y 1,5 segundos por frame, algo que antes requería GPUs de servidor. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiera-Tiny (SAM 2.1) con encoder y decoder separados |
| Parametros totales | no disponible (encoder 80 MB fp16, decoder 17 MB fp16) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp16 |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT) con grafos separados para encoder, decoder y video |

## Arquitectura y entrenamiento

El modelo base es SAM 2.1 Hiera-Tiny de Meta, un transformer jerárquico con atención multi-escala diseñado para segmentación de imágenes y vídeo. La conversión a LiteRT requirió tres reescrituras numéricamente idénticas para hacer el encoder compatible con GPU: horneado del positional embedding de ventana (eliminando la interpolación bicúbica), partición y desp partición de ventanas en 4-D (el delegado ML Drift rechaza tensores de más de 4 dimensiones), y atención multi-escala en 4-D con división canal-wise del qkv. El decoder de máscaras se convirtió sin cambios.

Para la ruta de vídeo, los grafos se re-autorizaron en formato batch-first (rank 4) para evitar que el delegado ML Drift calculase incorrectamente la atención con memoria de SAM 2, que colapsa la dimensión de batch en rank 3. La acumulación residual en fp16 sobre las claves de memoria no afecta al resultado final de la máscara. El entrenamiento original de SAM 2.1 utilizó el dataset SA-V con anotaciones de vídeo, pero los detalles específicos de este modelo convertido no se proporcionan en la información disponible.

## Capacidades

- Segmentacion de imagenes por puntos interactivos: el encoder procesa la imagen una vez y el decoder genera la mascara por cada punto seleccionado.
- Segmentacion por cajas (boxes) como prompt alternativo.
- Seguimiento de objetos en video: tap en el primer frame y la mascara sigue al objeto en frames posteriores mediante banco de memoria de 2 o 7 slots.
- Ejecucion completamente en GPU en dispositivos moviles (Mali, Metal) y Apple silicon, sin fallback a CPU.
- Fidelidad bit-exacta (correlacion 1.0) respecto al PyTorch original en la ruta de imagen.
- Fidelidad de seguimiento de video con mask-IoU minimo de 0.9999 en un clip de 10 frames.
- Salida de logits de mascara en 3 resoluciones (256x256) con umbral > 0 para foreground.

## Casos de uso

- Edicion de fotos en movil: el usuario toca un objeto en una foto y el modelo genera la mascara precisa para recortar, eliminar fondo o aplicar filtros localizados. La ejecucion local garantiza privacidad y cero latencia de red.
- Realidad aumentada interactiva: segmentacion de objetos en tiempo real para overlays virtuales, con el encoder ejecutandose una vez y el decoder respondiendo a cada tap en menos de 100 ms en dispositivos como el iPhone 17 Pro.
- Seguimiento de objetos en video para produccion de contenido: un editor de video movil puede marcar un objeto en el primer frame y el modelo lo sigue automaticamente, permitiendo aplicar efectos o estabilizacion centrada en el objeto sin edicion manual frame a frame.
- Herramientas de anotacion de datos en edge: equipos de etiquetado pueden generar mascaras de segmentacion rapidamente en tablets o portatiles Apple sin depender de servicios cloud, reduciendo costes y latencia en pipelines de datos.
- Asistentes de accesibilidad: segmentacion de objetos en tiempo real para ayudar a personas con discapacidad visual a identificar elementos en su entorno mediante camara, con procesamiento local que no requiere conexion.
- Prototipado de aplicaciones de segmentacion: desarrolladores pueden integrar el modelo en apps Android o iOS usando la API Kotlin de LiteRT, con grafos precompilados y constantes de prompt listas para usar, acelerando el desarrollo de MVPs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de segmentacion (mIoU en datasets como COCO o SA-V) en la informacion disponible. Sin embargo, la model card proporciona datos de rendimiento y fidelidad:

| Metrica | Valor |
|---|---|
| Fidelidad imagen (correlacion vs PyTorch) | 1.0 (bit-exact) |
| Fidelidad video (mask-IoU minimo, 10 frames) | 0.9999 |
| Latencia por frame (iPhone 17 Pro, 2-slot) | ~471 ms |
| Latencia por frame (iPhone 17 Pro, 7-slot) | ~751 ms |
| Latencia por frame (Pixel 8a) | 1.0-1.5 s |
| Nodos GPU (Pixel 8a, encode) | 828/828 |
| Nodos GPU (Pixel 8a, memcond) | 480/480 |
| Nodos GPU (Pixel 8a, decode) | 462/462 |
| Nodos GPU (Pixel 8a, memorize) | 145/145 |

## Requisitos de hardware

- VRAM estimada: no disponible explicitamente, pero los grafos suman ~126 MB en fp16 (80+17+26+3), mas overhead de runtime; cabe en cualquier GPU movil moderna.
- GPUs compatibles: Mali (Pixel 8a), Apple GPU (iPhone 17 Pro, Mac Studio M4 Max) via Metal, y cualquier GPU soportada por el delegado ML Drift de LiteRT.
- Si cabe en consumer GPU: si, en cualquier dispositivo movil con GPU compatible con LiteRT y al menos 256 MB de RAM libre.
- Opciones de despliegue: LiteRT con `CompiledModel` (Kotlin/Swift/Python), o `Interpreter` estandar para verificacion. No hay soporte para vLLM, Ollama o TGI (no es un modelo de lenguaje).
- Latencia y throughput: encode una vez por imagen (~tens de ms), decode por punto (sub-100 ms en Apple silicon), video completo ~471-751 ms por frame en iPhone 17 Pro, 1.0-1.5 s en Pixel 8a.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Formato | Ejecucion | Licencia |
|---|---|---|---|---|---|
| SAM2-hiera-tiny-LiteRT (este) | Hiera-Tiny | 80+17 MB fp16 | TFLite | GPU movil | Apache 2.0 |
| SAM 2.1 original (PyTorch) | Hiera-Tiny | ~151 MB (fp32) | PyTorch | GPU servidor | Apache 2.0 |
| MobileSAM | ViT-Tiny | ~40 MB | PyTorch/ONNX | CPU/GPU | Apache 2.0 |
| FastSAM | YOLOv8-seg | ~140 MB | ONNX | CPU/GPU | Apache 2.0 |

Comparado con MobileSAM, este modelo ofrece mayor fidelidad (bit-exact con SAM 2.1) y soporte de video con memoria, a costa de mayor tamano y requisito de GPU con delegado ML Drift. Frente al SAM 2.1 original, sacrifica flexibilidad de entrada (fija 1024x1024) pero gana despliegue en dispositivo. FastSAM es mas rapido en CPU pero menos preciso en segmentacion interactiva.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; el modelo base SAM 2.1 puede heredar sesgos del dataset SA-V (dominado por videos de redes sociales, posible sesgo hacia objetos y escenas comunes de ese entorno).
- Riesgo de alucinacion: en segmentacion, puede generar mascaras espurias en fondos ambiguos o con prompts poco claros; el modelo devuelve 3 mascaras candidatas por prompt para mitigarlo.
- Limitaciones de contexto: entrada fija de 1024x1024 píxeles; imagenes de mayor resolucion deben redimensionarse, lo que puede degradar la precision en objetos muy pequenos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base SAM 2.1 de Meta esta sujeto a los terminos de la licencia de Meta (Apache 2.0 tambien, aunque se recomienda revisar el aviso de uso aceptable de Meta).
- Requisitos de runtime: depende de la API `CompiledModel` de ML Drift, que no esta disponible en todas las plataformas; en dispositivos sin soporte GPU, la ejecucion en CPU puede ser lenta o fallar.
- Precision numerica: la ruta de video usa acumulacion fp16 en las claves de memoria, que aunque no afecta a la mascara final, puede causar divergencias minimas en clips muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/SAM2-hiera-tiny-LiteRT
- Encoder separado: https://huggingface.co/mlboydaisuke/SAM2.1-Hiera-Tiny-Image-Encoder-LiteRT
- Repositorio oficial SAM 2 (Meta): https://github.com/facebookresearch/sam2
- Benchmark LiteRT vs MLX: https://github.com/john-rocky/LiteRT-Models/blob/main/sam2/BENCHMARK.md
