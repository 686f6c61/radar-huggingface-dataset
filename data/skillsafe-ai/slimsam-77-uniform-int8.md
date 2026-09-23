# skillsafe-ai/slimsam-77-uniform-int8

## Resumen

SlimSAM-77 uniform int8 es un paquete de artefactos ONNX cuantizados a int8 para segmentacion de imagenes, publicado por skillsafe-ai a partir del modelo Xenova/slimsam-77-uniform (commit 5850ab45). El modelo subyacente es SlimSAM, una poda estructural de SAM ViT-B de Meta presentada en el articulo "SlimSAM: 0.1% Data Makes Segment Anything Slim" (Chen et al., NeurIPS 2024). La propuesta de este repositorio no es investigar un modelo nuevo, sino ofrecer una version lista para ejecutarse en el navegador mediante onnxruntime-web, con pesos verificados byte a byte por SHA-256.

El paquete contiene dos grafos ONNX cuantizados: un vision encoder (8,47 MB) que convierte una imagen de 1024x1024 en embeddings de imagen, y un prompt encoder + mask decoder (4,68 MB) que recibe puntos de entrada y devuelve mascaras con puntuaciones de IoU. En total, unos 13,15 MB de pesos, lo que permite desplegar segmentacion interactiva sin backend y sin GPU dedicada, usando WebGPU o WASM como proveedor de ejecucion.

Su relevancia es practica: reduce una tarea clasica de vision (segment anything con prompts) a un artefacto reproducible, auditable y de bajo peso, orientado a aplicaciones web y de escritorio. La contrapartida es que se trata de un repositorio recien publicado (0 descargas, 0 likes en el momento de la consulta) y sin benchmarks propios, por lo que la validacion de calidad de las mascaras int8 frente al modelo original queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (image encoder) + prompt encoder + mask decoder; poda estructural de SAM ViT-B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de vision; entrada del vision encoder 1x3x1024x1024 px, embeddings de salida 1x256x64x64 |
| Tipos de cuantizacion | int8 (grafos ONNX quantized); no se incluyen variantes fp16/fp32 en este repo |
| Idiomas soportados | no disponible (modelo de segmentacion de imagen, sin componente de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, opset 13; ficheros `onnx/vision_encoder_quantized.onnx` y `onnx/prompt_encoder_mask_decoder_quantized.onnx` |
| Tamano de pesos | 13,15 MB en total (8,47 MB + 4,68 MB) |
| Modelo base | Xenova/slimsam-77-uniform (commit 5850ab45f587c112167512ffef949107115e26a0) |
| Pipeline | image-segmentation |
| Toolchain de conversion | Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 (Darwin 25.6.0 arm64) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de Segment Anything: un image encoder tipo ViT produce un embedding de imagen de 256x64x64 junto con sus embeddings posicionales; despues, un prompt encoder codifica puntos de entrada y un mask decoder ligero genera tres propuestas de mascara de 256x256 con sus puntuaciones de IoU. En este repositorio cada etapa esta exportada como grafo ONNX independiente, de modo que el encoder se ejecuta una vez por imagen y el decoder se reejecuta por cada nuevo prompt. La variante "77 uniform" procede de la poda estructural de SAM ViT-B descrita por Chen et al. (NeurIPS 2024), cuyo planteamiento central es que una fraccion muy pequena de los datos de entrenamiento originales (0,1 %) basta para recuperar el rendimiento tras la poda.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el numero de parametros resultantes tras la poda ni sobre si se aplicaron tecnicas de ajuste adicionales (RLHF/DPO no aplican a un modelo de segmentacion). La model card indica que los pesos se importaron "as published upstream (no conversion)", aunque el repositorio describe a la vez una recipe de cuantizacion (`recipes/slimsam-77-uniform-int8.yaml`, sha256 33c47dabbe648c14c0c353240554658afdfceed2e07c50aa21bb3fa7832845da) y un `manifest.json` con el detalle de la receta y de la verificacion por fichero. El unico proceso tecnicamente documentado es, por tanto, la exportacion a ONNX y la cuantizacion a int8, no un reentrenamiento.

## Capacidades

- Segmentacion de imagen guiada por puntos: recibe `input_points` (float32, forma `[batch_size, point_batch_size, nb_points_per_image, 2]`) e `input_labels` (int64) y devuelve `pred_masks` (float32, `[batch_size, point_batch_size, 3, 256, 256]`).
- Puntuacion de confianza por mascara: la salida `iou_scores` (`[batch_size, point_batch_size, 3]`) permite seleccionar la mejor de las tres propuestas.
- Segmentacion interactiva con encoder reutilizable: el vision encoder se ejecuta una sola vez por imagen y el decoder admite nuevos prompts de forma repetida.
- Ejecucion en navegador: los grafos estan preparados para onnxruntime-web con `executionProviders: ["webgpu", "wasm"]`.
- Procesamiento en cliente (sin servidor): al ser un paquete de ~13 MB, la inferencia puede realizarse localmente en el dispositivo.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No se documentan capacidades multimodales de texto (prompts de texto), audio ni vision-lenguaje.
- No se documenta un modo de generacion automatica de mascaras (todo-mask) en los contratos de entrada/salida publicados; solo el flujo con prompt de puntos.

## Casos de uso

- Segmentacion interactiva "click-to-segment" en aplicaciones web: el usuario pulsa sobre un objeto, la interfaz construye el tensor de puntos y el decoder (11,9 ms medidos en CPU en la prueba de humo) devuelve la mascara casi al instante, mientras que el encoder se ejecuta una sola vez por imagen.
- Edicion de fotos y recorte de fondos en el navegador: al ejecutarse integramente en cliente con WebGPU/WASM, la imagen nunca se envia a un servidor, lo que simplifica el cumplimiento de RGPD en productos de consumo.
- Preanotacion de datasets de vision por computador: los anotadores pueden generar mascaras iniciales con un clic y corregirlas despues, reduciendo el tiempo por imagen en herramientas de etiquetado.
- Aplicaciones de escritorio o PWA sin conexion: los 13,15 MB de pesos se pueden cachear en el dispositivo, de modo que la funcionalidad de segmentacion sigue disponible sin red.
- Extensiones de navegador y utilidades para capturas: seleccionar elementos concretos de una pagina o de una captura de pantalla para copiarlos, medirlos u ocultarlos.
- Demos educativas y prototipos de investigacion: permite reproducir el comportamiento de SAM en equipos sin GPU y con requisitos de instalacion minimos (solo un runtime ONNX).
- Preprocesado en pipelines de vision en CPU: para lotes pequenos donde no se justifica levantar un servicio con GPU, el coste dominante es el vision encoder (388,4 ms por imagen en la prueba de humo), amortizable si se generan multiples mascaras sobre la misma imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una verificacion funcional con entradas de ceros y formas declaradas, ejecutada en CPU, que no constituye una evaluacion de calidad ni de rendimiento:

| Grafo | Entradas | Salidas | Tiempo (ms) |
|---|---|---|---|
| `prompt_encoder_mask_decoder_quantized.onnx` | `input_points[1,1,1,2]`, `input_labels[1,1,1]`, `image_embeddings[1,256,64,64]`, `image_positional_embeddings[1,256,64,64]` | `iou_scores[1,1,3]`, `pred_masks[1,1,3,256,256]` | 11,9 |
| `vision_encoder_quantized.onnx` | `pixel_values[1,3,1024,1024]` | `image_embeddings[1,256,64,64]`, `image_positional_embeddings[1,256,64,64]` | 388,4 |

No hay datos de mAP, IoU, ni comparaciones con SAM ViT-B o con el modelo sin cuantizar en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: minima. Los dos grafos suman 13,15 MB en int8, por lo que caben holgadamente en cualquier GPU con unos pocos cientos de MB libres; el cuello de botella es la activacion del vision encoder a 1024x1024, no el peso de los parametros.
- GPU recomendadas: cualquier GPU integrada con soporte WebGPU o cualquier GPU de escritorio para acelerar el encoder; no se requiere A100, H100 ni similares.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en GPUs integradas y dispositivos moviles modernos. Tambien funciona en CPU via WASM.
- Opciones de despliegue: onnxruntime-web (WebGPU/WASM) es el camino documentado; al ser ONNX estandar, tambien es compatible con onnxruntime en Python/C++ y con otros runtimes que soporten opset 13. No aplican llama.cpp, Ollama, vLLM ni TGI, porque no es un modelo de lenguaje y no se publican artefactos GGUF.
- Latencia y throughput: los unicos datos disponibles son los 388,4 ms del vision encoder y 11,9 ms del decoder, medidos en CPU (Darwin arm64) sobre entradas de ceros durante la verificacion. No son cifras de rendimiento representativas: no incluyen preprocesado, posprocesado ni ejecucion en WebGPU, y no se ha medido throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| skillsafe-ai/slimsam-77-uniform-int8 | no disponible | imagen 1024x1024 | ONNX int8, opset 13 | Apache-2.0 | Repositorio HuggingFace, 0 descargas | No disponible (solo prueba de humo) |
| Xenova/slimsam-77-uniform (modelo base) | no disponible | imagen 1024x1024 | ONNX (sin cuantizar en este paquete) | Apache-2.0 | Repositorio HuggingFace de referencia | No disponible |
| SlimSAM (Chen et al., NeurIPS 2024) | no disponible | imagen 1024x1024 | pesos de investigacion | Apache-2.0 | GitHub del proyecto | No consultado en la informacion disponible |
| SAM ViT-B de Meta (origen de la poda) | no disponible en la informacion proporcionada | imagen 1024x1024 | varios | Apache-2.0 | Repositorio publico | No disponible en la informacion proporcionada |

La comparacion cuantitativa (parametros, IoU, latencia) no puede completarse con los datos aportados: la informacion disponible solo identifica el modelo base y el origen de la poda, sin cifras de rendimiento de ninguno de ellos.

## Limitaciones y advertencias

- No hay benchmarks publicados ni evaluacion de la perdida de calidad introducida por la cuantizacion int8 frente al modelo sin cuantizar.
- El repositorio tiene 0 descargas y 0 likes, y la metadata de HuggingFace reporta un tamano de repo de 0,0 GB pese a que los pesos suman 13,15 MB; conviene verificar los ficheros antes de integrarlos en produccion.
- Las mascaras se generan a 256x256, muy por debajo de la resolucion de entrada (1024x1024), por lo que hace falta un posprocesado de reescalado que puede introducir bordes imprecisos.
- El flujo documentado solo admite prompts de puntos (`input_points` + `input_labels`); no se documentan prompts de caja ni de texto, lo que limita los casos de uso respecto a SAM completo.
- Al ser un modelo de vision puro, no genera texto, no razona, no soporta tool calling ni agentes; no debe evaluarse con benchmarks de lenguaje.
- Riesgo de alucinacion en el sentido de mascaras plausibles pero incorrectas, especialmente con objetos poco contrastados, prompts ambiguos o multiples objetos solapados; las puntuaciones de IoU ayudan a filtrar pero no sustituyen la revision humana.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre el comportamiento diferencial por tipo de imagen, demografia o dominio.
- La model card mezcla dos afirmaciones sobre la procedencia ("imported as published upstream (no conversion)" frente a una recipe de cuantizacion int8); conviene consultar `manifest.json` y la recipe para aclarar que transformaciones se aplicaron realmente.
- Restricciones de licencia: los pesos son Apache-2.0, lo que permite uso comercial, pero exige mantener la atribucion a SlimSAM (Chen et al., NeurIPS 2024), a Xenova por la exportacion ONNX y a Meta por SAM ViT-B. La recipe de conversion y la model card pertenecen al repositorio de SkillSafe y se rigen por su propia licencia.
- Dependencia de opset 13 y de las formas declaradas: cambios en la resolucion de entrada o en el numero de puntos pueden requerir reexportar los grafos.
- La busqueda web realizada no devolvio informacion tecnica relevante sobre el modelo (los resultados eran contenido deportivo sin relacion), por lo que no ha sido posible contrastar la ficha con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/slimsam-77-uniform-int8
- Modelo base: https://huggingface.co/Xenova/slimsam-77-uniform/tree/5850ab45f587c112167512ffef949107115e26a0
- Recetas y manifiestos de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Repositorio de SlimSAM (incluye LICENSE): https://github.com/czg1225/SlimSAM/blob/main/LICENSE
- Referencia del articulo: Chen et al., "SlimSAM: 0.1% Data Makes Segment Anything Slim", NeurIPS 2024 (sin URL directa en la informacion proporcionada)
- Servicio de ficheros de SkillSafe: https://models.skillsafe.ai
- Ejemplo de uso en navegador: https://huggingface.co/skillsafe-ai/slimsam-77-uniform-int8/resolve/main/onnx/prompt_encoder_mask_decoder_quantized.onnx
