# skillsafe-ai/slimsam-77-uniform-fp16

## Resumen

SlimSAM-77 uniform fp16 es un artefacto ONNX listo para navegador del modelo de segmentación de imagen SlimSAM-77 uniform, publicado por el usuario skillsafe-ai como importación byte a byte del repositorio Xenova/slimsam-77-uniform (commit `5850ab45f587c112167512ffef949107115e26a0`). SlimSAM es una poda estructural del ViT-B de Segment Anything (SAM) de Meta, descrita en el artículo "SlimSAM: 0.1% Data Makes Segment Anything Slim" (Chen et al., NeurIPS 2024), y este repositorio redistribuye la exportación ONNX ya existente en formato fp16.

El artefacto no es un modelo nuevo: no hay conversión, ajuste fino ni modificación de pesos. Su valor está en el empaquetado y la verificación: cada fichero queda fijado por SHA-256 a su origen, los grafos pasan `onnx.checker` y se documenta una ejecución de humo en CPU con entradas rellenadas con ceros. El repositorio contiene dos grafos ONNX que en conjunto ocupan 19,76 MB en fp16 y una resolución de entrada fija de 1024x1024 píxeles.

Es relevante ahora porque permite ejecutar segmentación guiada por prompts directamente en el navegador mediante `onnxruntime-web` con WebGPU o WASM, sin backend ni subida de imágenes a un servidor. Para desarrolladores que construyen editores de imagen, herramientas de anotación o aplicaciones con requisitos de privacidad, ofrece un coste de integración bajo: el modelo completo cabe en memoria de cualquier dispositivo y solo requiere servir dos ficheros ONNX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) con poda estructural, esquema Segment Anything; tres módulos: image encoder, prompt encoder y mask decoder |
| Parámetros totales | no disponible en la información proporcionada (los ficheros ONNX fp16 suman 19,76 MB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de imagen, no procesa secuencias de texto. Entrada fija de 1024x1024 píxeles (`pixel_values [1, 3, 1024, 1024]`) |
| Tipos de cuantización | fp16 (ONNX). No se distribuyen variantes int8, int4 ni GGUF |
| Idiomas soportados | no aplica: modelo de segmentación de imagen, no procesa lenguaje |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, opset 13: `onnx/vision_encoder_fp16.onnx` (11,61 MB) y `onnx/prompt_encoder_mask_decoder_fp16.onnx` (8,15 MB) |
| Modelo base | Xenova/slimsam-77-uniform (a su vez, poda de Meta SAM ViT-B) |
| Pipeline | image-segmentation |
| Ficheros auxiliares | `config.json`, `preprocessor_config.json` (tipo bundle, se distribuyen dentro de la aplicación) |
| Salidas del decoder | `iou_scores [batch_size, point_batch_size, 3]`, `pred_masks [batch_size, point_batch_size, 3, 256, 256]` (float32) |
| Embeddings intermedios | `image_embeddings [batch_size, 256, 64, 64]`, `image_positional_embeddings [batch_size, 256, 64, 64]` (float32) |

## Arquitectura y entrenamiento

SlimSAM parte del image encoder ViT-B de SAM y le aplica una poda estructural que reduce drásticamente el número de parámetros, manteniendo el esquema de segmentación promptable original: un image encoder que produce embeddings de la imagen, un prompt encoder que codifica puntos o cajas, y un mask decoder ligero que devuelve varias máscaras candidatas junto con sus puntuaciones de IoU. La variante "uniform" hace referencia al patrón de poda uniforme aplicado sobre los bloques del transformer. El artículo referenciado indica que el proceso de destilación y poda emplea únicamente el 0,1% de los datos de entrenamiento originales, según se desprende del título de la publicación (Chen et al., NeurIPS 2024); el detalle completo del dataset y del procedimiento no se recoge en la información proporcionada.

Este repositorio concreto no entrena ni convierte nada: importa tal cual la exportación ONNX publicada por Xenova. La model card documenta el proceso de verificación aplicado, con el SHA-256 de cada fichero, el hash de la receta (`recipes/slimsam-77-uniform-fp16.yaml`, sha256 `2552c6cbf597215cd37cbb59375c8bfc978f83d0180c5c6bc5e3fee84fc863ae`), la cadena de herramientas empleada (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64) y una prueba de humo en CPU con entradas de ceros a las formas declaradas, que pasó sin errores en ambos grafos.

## Capacidades

- Segmentación de imagen guiada por prompts de punto: acepta `input_points [batch_size, point_batch_size, nb_points_per_image, 2]` e `input_labels` (int64) por cada punto.
- Salida multimáscara: devuelve 3 máscaras candidatas por prompt (`pred_masks` con dimensión 3) junto con sus puntuaciones de confianza `iou_scores`, lo que permite al cliente elegir la mejor propuesta.
- Caché de embeddings de imagen: el vision encoder produce `image_embeddings` y `image_positional_embeddings` que pueden reutilizarse para múltiples prompts sobre la misma imagen, evitando repetir la pasada cara del encoder.
- Ejecución en navegador: compatible con `onnxruntime-web` usando los execution providers `webgpu` y `wasm`, con el modelo cargado directamente desde Hugging Face o desde un servidor propio.
- Ejecución en CPU: los grafos funcionan con onnxruntime estándar en CPU, sin requisitos de GPU.
- Generación de máscaras a partir de cajas: al ser compatible con el esquema SAM, admite prompts de caja mediante el prompt encoder, aunque el contrato documentado del artefacto detalla únicamente la ruta de puntos.
- Compatibilidad con el ecosistema SAM: al conservar la interfaz de SAM, puede integrarse en los pipelines existentes de generación automática de máscaras, siempre que se implemente la lógica de muestreo de prompts en el cliente.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No procesa texto: no hay capacidades multilingües ni de generación de lenguaje.
- No dispone de modo "thinking", visión-lenguaje ni audio.

## Casos de uso

- Editor de imagen en el navegador: el usuario hace clic sobre un objeto y la aplicación ejecuta el mask decoder (17,2 ms en la prueba de humo en CPU) sobre los embeddings ya calculados de la imagen, devolviendo una máscara inmediata sin enviar la imagen a ningún servidor.
- Herramienta de anotación de datasets: los anotadores generan máscaras iniciales con un punto o una caja y las refinan manualmente, reduciendo el tiempo por imagen respecto a la delineación desde cero; los embeddings cacheados permiten etiquetar varios objetos de la misma imagen sin recalcular el encoder.
- Recorte de producto en comercio electrónico: separación automática del fondo en fotos de catálogo a partir de un punto sobre el producto, ejecutable tanto en un pipeline por lotes en servidor como en una herramienta interna de previsualización en el navegador.
- Procesamiento con privacidad en el cliente: al ejecutarse íntegramente con WebGPU o WASM en el dispositivo, es apto para aplicaciones donde la imagen no puede salir del navegador (documentación médica, imágenes personales, entornos corporativos restringidos).
- Aplicaciones web progresivas y demos interactivas: los 19,76 MB en fp16 permiten cargar el modelo en una sesión de navegador y ofrecer segmentación interactiva en una PWA, con WASM como respaldo cuando WebGPU no está disponible.
- Preprocesado en pipelines de visión por computador: generación de máscaras para tareas posteriores (inpainting, cambios de fondo, medición de áreas) antes de pasarlas a otros modelos, aprovechando que el encoder se ejecuta una vez por imagen.
- Investigación sobre poda y destilación: punto de partida reproducible para comparar la variante uniforme podada frente al ViT-B original de SAM en términos de calidad de máscara y coste computacional, con ficheros verificados por hash.
- Prototipado rápido sin infraestructura: validar una idea de producto de segmentación usando solo ficheros estáticos servidos por HTTP, sin desplegar GPU ni contenedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de segmentación (por ejemplo mIoU sobre COCO o SA-1B) ni comparaciones cuantitativas con otros modelos, y el artículo de referencia solo se cita sin reproducir sus cifras.

Los únicos datos numéricos publicados corresponden a la verificación de los ficheros ONNX, no a la calidad del modelo:

| Fichero | Entradas declaradas | Salidas | Tiempo (ms) |
|---|---|---|---|
| `prompt_encoder_mask_decoder_fp16.onnx` | `input_points[1,1,1,2]`, `input_labels[1,1,1]`, `image_embeddings[1,256,64,64]`, `image_positional_embeddings[1,256,64,64]` | `iou_scores[1,1,3]`, `pred_masks[1,1,3,256,256]` | 17,2 |
| `vision_encoder_fp16.onnx` | `pixel_values[1,3,1024,1024]` | `image_embeddings[1,256,64,64]`, `image_positional_embeddings[1,256,64,64]` | 718,1 |

Estos tiempos proceden de una prueba de humo en CPU con entradas de ceros, sobre onnxruntime 1.30.0 en Darwin 25.6.0 arm64. No reflejan el rendimiento en producción ni el de WebGPU, y no se especifican el número de hilos ni el proveedor de ejecución exacto.

## Requisitos de hardware

- VRAM estimada: no publicada. Los pesos en fp16 ocupan 19,76 MB en total, por lo que cabe holgadamente en cualquier GPU con WebGPU o CUDA; el consumo adicional depende de las activaciones a 1024x1024, no cuantificadas en la información disponible.
- GPU recomendadas: cualquiera con soporte de WebGPU para el caso de navegador. No se han publicado pruebas en A100, H100, RTX 4090 ni otras GPU concretas.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del modelo. También funciona en CPU, como demuestra la prueba de humo.
- Opciones de despliegue: `onnxruntime-web` con execution providers `webgpu` y `wasm` (caso documentado en la model card), y onnxruntime estándar en CPU. No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia: 718,1 ms para el vision encoder sobre una imagen de 1024x1024 y 17,2 ms para el decoder, en la prueba de humo en CPU ya citada. No hay datos de throughput, de latencia en WebGPU ni de comportamiento con lotes.
- Memoria en dispositivo: no se especifica el pico de memoria durante la inferencia; la entrada de 1024x1024 píxeles en float32 supone por sí sola unos 12 MB.

## Comparativa con modelos similares

| Modelo | Tamaño de pesos | Entrada | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| skillsafe-ai/slimsam-77-uniform-fp16 (este artefacto) | 19,76 MB en fp16 (dos grafos ONNX) | 1024x1024 px | Apache-2.0 | ONNX opset 13 en Hugging Face; los ficheros de tipo registry se sirven desde models.skillsafe.ai según la model card |
| Xenova/slimsam-77-uniform | no disponible en la información proporcionada | no disponible | Apache-2.0 (heredada del modelo base) | Exportación ONNX publicada en Hugging Face; es el origen directo de este artefacto |
| Meta SAM ViT-B | no disponible en la información proporcionada | no disponible | Apache-2.0 | Pesos originales del modelo del que deriva SlimSAM; no se detalla en la información proporcionada |
| MobileSAM | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Alternativa del mismo nicho (SAM ligero para dispositivos); datos no verificados en esta ficha |
| FastSAM | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Alternativa del mismo nicho basada en un detector-segmentador tipo YOLO; datos no verificados en esta ficha |
| EdgeSAM | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Alternativa orientada a dispositivos edge; datos no verificados en esta ficha |

La información proporcionada solo permite comparar el artefacto con su origen directo: el repositorio de skillsafe-ai no modifica los pesos de Xenova/slimsam-77-uniform, por lo que la comparación se reduce a formato, licencia y empaquetado. Para el resto de alternativas conviene consultar sus propias model cards antes de fijar una decisión.

## Limitaciones y advertencias

- No hay métricas de calidad publicadas: se desconoce la pérdida de precisión frente al SAM ViT-B original en dominios concretos, y el artículo de referencia no aporta cifras en la información disponible.
- Al ser un modelo podado, es esperable una degradación de la calidad de máscara respecto al ViT-B completo, especialmente en objetos finos, bordes complejos u oclusiones; no se cuantifica en esta ficha porque no hay datos.
- Riesgo de sobre-segmentación o sub-segmentación: el modelo devuelve 3 máscaras candidatas con puntuaciones de IoU, pero la elección final y el refinado son responsabilidad de la aplicación cliente.
- Alcance limitado: resuelve segmentación promptable. No hace detección con etiquetas semánticas, no genera descripciones, no procesa texto y no admite instrucciones en lenguaje natural.
- Resolución de entrada fija de 1024x1024: las imágenes deben redimensionarse y normalizarse con `preprocessor_config.json`; las máscaras de salida son de 256x256 y requieren interpolación para devolverlas al tamaño original.
- Sin cuantizaciones alternativas en este repositorio: solo fp16. Quien necesite int8 o menor peso debe buscarlo en otra fuente.
- Dependencia externa: la model card indica que los ficheros de tipo `registry` se sirven desde models.skillsafe.ai una vez validados, además de estar en el repositorio; conviene comprobar la disponibilidad real de cada URL antes de integrarla en producción.
- Idiomas y sesgos: no aplica el sesgo lingüístico por no ser un modelo de lenguaje, pero sí pueden aparecer sesgos de rendimiento según el tipo de imagen, el dominio o la distribución de datos de SA-1B, que no se detalla en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar el aviso de licencia y la atribución a SlimSAM (Chen et al., NeurIPS 2024) y a la exportación ONNX de Xenova. La receta de conversión y la model card pertenecen al repositorio SkillSafe y quedan bajo su propia licencia.
- El repositorio declara 0 descargas y 0 likes, y el tamaño del repo figura como 0,0 GB pese a contener dos ficheros ONNX: conviene verificar el contenido real antes de depender de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skillsafe-ai/slimsam-77-uniform-fp16
- Modelo base (exportación ONNX de Xenova): https://huggingface.co/Xenova/slimsam-77-uniform
- Revisión concreta del modelo base usada como origen: https://huggingface.co/Xenova/slimsam-77-uniform/tree/5850ab45f587c112167512ffef949107115e26a0
- Repositorio de SlimSAM: https://github.com/czg1225/SlimSAM
- Licencia de SlimSAM: https://github.com/czg1225/SlimSAM/blob/main/LICENSE
- Recetas de conversión de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Los resultados de la búsqueda web proporcionados no guardan relación con el modelo (corresponden a la plantilla de los Los Angeles Rams) y se han descartado.
