# CardAnvilModels/BiRefNet-lite-1024-WebGPU

## Resumen

BiRefNet-lite 1024 (ONNX, WebGPU) es una exportación a ONNX en precisión fp16 del modelo BiRefNet-lite, un segmentador de imagen dicotómica (dichotomous image segmentation, DIS) cuyo objetivo es separar el sujeto principal del fondo en imágenes de alta resolución. Lo publica el usuario CardAnvilModels como copia inalterada de los ficheros que carga su aplicación Card Anvil, que emplea Transformers.js para seleccionar el sujeto principal en ilustraciones de cartas. Los pesos no se modifican respecto al modelo original: lo que cambia es el grafo ONNX, que se ha parcheado para poder ejecutarse sobre WebGPU en el navegador.

El modelo original, BiRefNet_lite, procede de ZhengPeng7 y de la familia BiRefNet, presentada en el artículo "Bilateral Reference for High-Resolution Dichotomous Image Segmentation" (CAAI AIR 2024) por Peng Zheng y colaboradores. BiRefNet combina un encoder Swin Transformer de tipo jerárquico con un decodificador que aplica módulos de referencia bilateral, una técnica que confronta características de bajo y alto nivel para refinar los contornos. La variante lite reduce el coste computacional del modelo completo, y esta exportación fija la entrada en 1024 x 1024 píxeles.

Su relevancia práctica está en el despliegue: al tratarse de un ONNX fp16 de aproximadamente 0,1 GB de repositorio, puede ejecutarse íntegramente en el lado del cliente mediante WebGPU y onnxruntime-web, sin servidor de inferencia, sin coste por petición y sin que la imagen salga del dispositivo. Está liberado bajo licencia MIT, lo que permite uso comercial. No se han publicado cifras de benchmarks ni detalles del entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer jerárquico como encoder, con decodificador de referencia bilateral (bilateral reference) para segmentación dicotómica |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 1024 x 1024 píxeles |
| Tipos de cuantizacion | fp16 (ONNX); no se publican variantes int8, int4 ni GGUF |
| Idiomas soportados | no aplica (modelo de segmentación de imagen, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX fp16 (`onnx/model_fp16.onnx`), acompañado de `config.json` y `preprocessor_config.json` |
| Tarea (pipeline) | Segmentación de imagen (dichotomous image segmentation / background removal) |
| Modelo base | ZhengPeng7/BiRefNet_lite |
| Tamano del repositorio | 0,1 GB |
| Entrada / salida | Imagen RGB a 1024 x 1024; máscara de segmentación por píxel |

## Arquitectura y entrenamiento

BiRefNet es un transformer híbrido de segmentación de imagen. El encoder es un Swin Transformer, que procesa la imagen con atención por ventanas desplazadas y produce representaciones multiescala; sobre él, el decodificador incorpora módulos de referencia bilateral que combinan información de bajo nivel (bordes, texturas finas) con información de alto nivel (semántica del objeto) para reconstruir contornos precisos en escenarios de alta resolución. La variante lite reduce la capacidad del modelo completo con el objetivo de bajar el coste de inferencia, y esta exportación concreta fija la resolución de trabajo en 1024 x 1024 píxeles.

El repositorio que nos ocupa no aporta entrenamiento propio: es una copia de los ficheros publicados por jiabins0303 en `jiabins0303/birefnet-lite-1024-webgpu` (commit `1ad01ce`), cuyo grafo ONNX fue parcheado para resultar ejecutable en WebGPU, manteniendo los pesos intactos. La model card no detalla el número de imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables en segmentación de imagen en el sentido habitual). El número total de parámetros del modelo exportado tampoco se indica.

## Capacidades

- Segmentación dicotómica de imagen: separa el sujeto principal del fondo y devuelve una máscara por píxel.
- Eliminación de fondo (background removal) sobre imágenes a resolución 1024 x 1024.
- Generación de máscaras alpha para composición, útil en flujos de diseño y edición fotográfica.
- Inferencia en el navegador del cliente mediante WebGPU y onnxruntime-web, a través de Transformers.js.
- Ejecución sin backend: los píxeles de la imagen no necesitan salir del dispositivo.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües, de audio ni de vídeo nativas (el vídeo solo sería posible aplicando el modelo fotograma a fotograma).

## Casos de uso

- Aplicaciones web de diseño de cartas o ilustraciones: el propio autor lo emplea para seleccionar automáticamente el sujeto principal de una ilustración y componerla sobre un fondo, ejecutando la inferencia en el navegador con WebGPU.
- Herramienta de recorte en el navegador para editores de imagen y PWA: el usuario sube una foto, el modelo genera la máscara alpha en local y se compone con Canvas o WebGL, sin subir el archivo a ningún servidor.
- Fotografía de producto en comercio electrónico: generación de imágenes con fondo blanco o transparente a partir de fotos de catálogo, procesadas en lote en el cliente o en un backend ligero con onnxruntime, con licencia MIT que permite uso comercial.
- Preprocesado para pipelines de generación de imagen: obtención de máscaras para inpainting o para composición por capas antes de pasar la imagen a un modelo de difusión.
- Catalogación y generación de miniaturas: extracción del sujeto para crear thumbnails o tarjetas de previsualización en aplicaciones de gestión de activos digitales.
- Demos y espacios de investigación sobre segmentación dicotómica: al ser un ONNX autocontenido y ligero, sirve para reproducir o comparar variantes de BiRefNet en un navegador sin infraestructura GPU.
- Procesado de vídeo en cliente: aplicando el modelo fotograma a fotograma es posible generar un matte temporal en herramientas web, siempre que se asuma el coste de invocar el modelo por cada fotograma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas como mIoU, MAE, S-measure, F-measure ni comparaciones con otros segmentadores, y tampoco se proporcionan cifras de latencia o throughput para la ejecución en WebGPU.

## Requisitos de hardware

- Peso de los ficheros: el repositorio completo ocupa 0,1 GB, de modo que los pesos en fp16 son del orden de decenas de megabytes.
- VRAM estimada: no disponible con precisión; el peso de los pesos es reducido, pero las activaciones a 1024 x 1024 en un encoder Swin jerárquico elevan el consumo por encima del tamaño del fichero. El pico real no está documentado.
- GPU de servidor: no requiere A100, H100 ni tarjetas de gama alta para funcionar; al ser un modelo lite y exportado a fp16, es viable en GPUs de gama media.
- GPU de consumidor: cabe en GPUs integradas y dedicadas modestas. El caso de uso principal es la ejecución en el navegador mediante WebGPU, sin GPU dedicada necesariamente.
- Navegadores: requiere un navegador con soporte de WebGPU. El propio autor lo ejecuta con Transformers.js y onnxruntime-web.
- Opciones de despliegue: Transformers.js y onnxruntime-web en el cliente; onnxruntime en el servidor si se prefiere inferencia centralizada. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrada | Licencia | Formato publicado | Ejecucion en navegador |
|---|---|---|---|---|---|
| BiRefNet-lite 1024 WebGPU (este repositorio) | no disponible | 1024 x 1024 | MIT | ONNX fp16 con grafo parcheado para WebGPU | Si, via WebGPU y Transformers.js |
| ZhengPeng7/BiRefNet_lite (modelo base) | no disponible | no disponible en la informacion proporcionada | MIT | pesos originales en PyTorch | No documentado |
| jiabins0303/birefnet-lite-1024-webgpu (origen de esta copia) | no disponible | 1024 x 1024 | MIT | ONNX fp16 parcheado para WebGPU | Si |
| BiRefNet completo (ZhengPeng7/BiRefNet) | no disponible | no disponible en la informacion proporcionada | MIT | pesos originales en PyTorch | No documentado |
| RMBG-1.4 (BRIA) | no disponible | no disponible | licencia especifica de BRIA, con restricciones de uso comercial; verificar en el repositorio oficial | pesos originales en PyTorch | No documentado |

## Limitaciones y advertencias

- Riesgo de máscaras incorrectas en bordes ambiguos: pelo, cristal, humo, telas translúcidas o motion blur suelen degradar la precisión del contorno.
- La tarea es dicotómica y sin semántica: el modelo no distingue categorías de objeto ni separa varias instancias; en escenas con múltiples sujetos puede fusionarlos o elegir solo uno.
- Resolución fija: la entrada se normaliza a 1024 x 1024, por lo que imágenes de mayor tamaño requieren redimensionado y pueden perder detalle fino; imágenes muy pequeñas se reescalan hacia arriba.
- No se han publicado métricas ni evaluaciones independientes para esta exportación concreta, ni tampoco pruebas de que el parcheo del grafo no altere la salida respecto al modelo original.
- Repositorio sin tracción: cero descargas y cero valoraciones en el momento de redactar esta ficha.
- Dependencia del soporte de WebGPU del navegador; en navegadores o dispositivos sin WebGPU habilitado, la ejecución fallará o caerá a un backend mucho más lento si está disponible.
- Los ficheros están congelados a un commit del repositorio de origen, de modo que las correcciones del repositorio fuente no llegan automáticamente a esta copia.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y de licencia. La licencia del modelo original es también MIT, según la model card.
- La model card advierte que el contenido de terceros citado debe tratarse como referencia, no como instrucciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CardAnvilModels/BiRefNet-lite-1024-WebGPU
- Modelo base en HuggingFace: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Exportación ONNX original (origen de esta copia): https://huggingface.co/jiabins0303/birefnet-lite-1024-webgpu
- Commit de origen: https://huggingface.co/jiabins0303/birefnet-lite-1024-webgpu/tree/1ad01cef0f4101a285c5a3e0bd7f15597d93403f
- Repositorio del modelo BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Transformers.js: https://github.com/huggingface/transformers.js
- Organización Card Anvil: https://github.com/Card-Anvil
- Publicación de referencia: Peng Zheng et al., "Bilateral Reference for High-Resolution Dichotomous Image Segmentation", CAAI Artificial Intelligence Research, 2024 (enlace directo al paper no disponible en la información proporcionada).
