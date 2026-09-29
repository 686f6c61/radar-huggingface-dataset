# mtbui2010/siglip-base-patch16-224-ONNX

## Resumen

`siglip-base-patch16-224-ONNX` es un export a ONNX de las dos torres (vision y texto) del checkpoint `google/siglip-base-patch16-224`, publicado por el usuario mtbui2010. No se trata de un modelo nuevo ni de un ajuste fino: es un artefacto de despliegue que reproduce el modelo original con fidelidad verificada, pensado para ser servido por VisionServe, la imagen Docker del mismo autor. Su funcion dentro de ese ecosistema es actuar como rerresolutor de recortes (crop rescoring) en el enrutador de vocabulario abierto `rfdetr-gdino-siglip`.

El modelo base es un codificador dual tipo SigLIP: una torre de vision ViT con parches de 16x16 a 224x224 y una torre de texto transformer, ambas proyectando a un espacio comun de 768 dimensiones. Esto permite clasificacion de imagenes zero-shot y recuperacion imagen-texto sin necesidad de cabezas de clasificacion especificas. El export incluye los dos grafos en fp32, opset 17, con pesos en ficheros externos `.onnx.data`, mas el tokenizer SentencePiece Unigram de 32 000 piezas.

Su relevancia es practica: elimina la dependencia de PyTorch en produccion, reduce el coste de despliegue (el repositorio completo ocupa 0,8 GB) y documenta con precision dos detalles de preprocesado que suelen fallar en silencio al reimplementar SigLIP, como son el reescalado bicubico sin recorte central y el relleno del texto con el token `</s>` en lugar de `<pad>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador dual (two-tower) SigLIP: torre de vision tipo ViT patch16-224 + torre de texto transformer, con proyeccion a espacio compartido |
| Parametros totales | no disponible (el repositorio ocupa 0,8 GB en fp32, sin desglose publicado por torre) |
| Longitud de contexto | 64 tokens en la torre de texto (fijado por el contrato de E/S del export) |
| Tipos de cuantizacion | no disponible; el export se distribuye unicamente en fp32 |
| Idiomas soportados | no disponible (no declarados en la ficha del modelo) |
| Licencia | Apache-2.0, heredada de `google/siglip-base-patch16-224` |
| Formato de pesos | ONNX (opset 17, fp32, pesos externos en ficheros `.onnx.data`) |
| Resolucion de entrada (vision) | 224 x 224 exactos, reescalado bicubico con deformacion (squash), sin recorte central; normalizacion /255 con media = desviacion = 0,5 por canal |
| Entrada de la torre de vision | `pixel_values` float32 `[N, 3, 224, 224]` |
| Salida de la torre de vision | `image_embeds` float32 `[N, 768]`, sin normalizacion L2 |
| Entrada de la torre de texto | `input_ids` int64 `[N, 64]` |
| Salida de la torre de texto | `text_embeds` float32 `[N, 768]`, sin normalizacion L2 |
| Tokenizer | SentencePiece Unigram, 32 000 piezas; relleno con `</s>` (id 1), no con `<pad>` (id 0) |
| Tamano del repositorio | 0,8 GB |
| Pipeline declarado | zero-shot-image-classification |
| Libreria | onnx |

## Arquitectura y entrenamiento

La arquitectura es un codificador dual de dos torres independientes que comparten un espacio de embeddings de 768 dimensiones. La torre de vision procesa imagenes de 224x224 divididas en parches de 16x16 y produce un vector por imagen; la torre de texto procesa secuencias de hasta 64 tokens y produce un vector por prompt. La similitud entre ambos vectores es la que determina la clasificacion zero-shot o la recuperacion cruzada. Un detalle relevante del export es que SigLIP agrupa la representacion de texto mediante atencion (attention pooling) y lee el relleno, por lo que rellenar con el id 0 en lugar del id 1 desplaza los embeddings 0,706 en coseno respecto a la referencia.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens vistos ni el uso de RLHF o DPO; el export hereda integramente los pesos del checkpoint `google/siglip-base-patch16-224` y no incorpora ningun reentrenamiento. La innovacion tecnica de esta publicacion no esta en el modelo, sino en el propio export: ambos grafos fueron verificados contra el checkpoint de PyTorch antes de publicarse, con una cota inferior de coseno de 0,9999 por prompt en la torre de texto y una comprobacion sobre 32 recortes reales en la torre de vision.

## Capacidades

- Clasificacion de imagenes zero-shot: asignar una imagen a un conjunto de etiquetas de texto arbitrarias sin entrenamiento adicional.
- Recuperacion imagen-texto y texto-imagen mediante similitud coseno en el espacio de 768 dimensiones.
- Rerresolucion de recortes en pipelines de deteccion de vocabulario abierto: el caso de uso documentado es el enrutador `rfdetr-gdino-siglip*` de VisionServe.
- Extraccion de embeddings de imagen y de texto por separado, reutilizables como caracteristicas en sistemas posteriores.
- Inferencia sin PyTorch, al distribuirse como grafos ONNX ejecutables sobre distintos proveedores de ejecucion.
- No genera texto: es un modelo discriminativo de similitud, sin capacidad de generacion, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling, ni razonamiento multi-paso ni uso como agente.
- No se declaran capacidades de vision mas alla de la clasificacion y recuperacion (sin deteccion, segmentacion, OCR dedicado ni descripcion generativa).

## Casos de uso

- Rerresolucion de recortes en deteccion open-vocabulary: se ejecuta la torre de vision sobre cada recorte candidato y la torre de texto sobre las etiquetas del catalogo, y se reordena por similitud; es exactamente el escenario para el que se publico el export.
- Moderacion de contenido visual por categorias configurables: definir un conjunto de etiquetas textuales y puntuar cada imagen entrante sin reentrenar el modelo cuando cambie la politica.
- Etiquetado automatico de catalogos de producto: clasificar imagenes de un e-commerce contra el arbol de categorias de la tienda, anadiendo o quitando etiquetas sin tocar los pesos.
- Busqueda semantica de imagenes en una fototeca: indexar los `image_embeds` y permitir consultas en lenguaje natural comparando con `text_embeds`.
- Filtrado previo en pipelines de anotacion: descartar o priorizar imagenes por relevancia tematica antes de pasarlas a un modelo generativo o a un anotador humano, reduciendo coste por muestra.
- Deduplicacion y agrupacion visual: usar los embeddings de imagen para agrupar elementos similares en un dataset (por ejemplo, detectar near-duplicates antes de entrenar otro modelo).
- Verificacion de coherencia imagen-texto en control de calidad: comprobar que la imagen entregada corresponde a la descripcion declarada en un flujo de datos.
- Servicio de inferencia ligero en CPU: al ocupar menos de 1 GB en fp32 y no requerir CUDA, puede desplegarse en contenedores pequenos o en el borde para clasificacion de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia cuantitativa aportada por el autor es la verificacion del export frente al checkpoint de PyTorch: cota inferior de similitud coseno de 0,9999 por prompt en la torre de texto y validacion sobre 32 recortes reales en la torre de vision. No hay cifras de ImageNet zero-shot, retrieval ni ninguna otra tarea.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB en fp32 para los pesos (el repositorio completo son 0,8 GB); a ello hay que sumar las activaciones, que dependen del tamano de lote de imagenes de 224x224.
- GPU recomendadas: cualquier GPU con >= 2 GB de VRAM es suficiente; una RTX 3060 o superior ofrece margen amplio. No se necesita A100 ni H100 para este modelo.
- Cabe con holgura en GPU de consumo (RTX 4090, RTX 3080, RTX 2060, GTX 1650) e incluso en CPU, ya que el modelo es de ~200 millones de parametros en el orden de magnitud que sugiere el tamano del repositorio.
- Opciones de despliegue: ONNX Runtime con proveedores CPU, CUDA, TensorRT o OpenVINO; las imagenes Docker de VisionServe publicadas por el autor (`visionserve pull siglip-image`, `visionserve pull siglip-text`, `visionserve pull rfdetr-gdino-siglip`).
- Limitacion de despliegue importante: los ficheros `model.onnx` y `model.onnx.data` deben mantenerse juntos, porque los pesos son externos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de embedding | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mtbui2010/siglip-base-patch16-224-ONNX` | Codificador dual SigLIP, export ONNX fp32 | 768 | 64 tokens | Apache-2.0 | HuggingFace, formato ONNX (repo de 0,8 GB) |
| `google/siglip-base-patch16-224` | Codificador dual SigLIP, pesos PyTorch | 768 | no disponible en la informacion proporcionada | Apache-2.0 | HuggingFace |
| CLIP ViT-B/16 | Codificador dual CLIP | 512 | 77 tokens | no disponible en la informacion proporcionada | HuggingFace |
| CLIP ViT-B/32 | Codificador dual CLIP | 512 | 77 tokens | no disponible en la informacion proporcionada | HuggingFace |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible en la informacion proporcionada. A nivel estructural, la diferencia relevante es que SigLIP emplea una perdida sigmoidea sobre pares en lugar de la softmax contrastiva de CLIP, y que este export fija la secuencia de texto en 64 tokens con agrupacion por atencion, frente a los 77 tokens con pooling por token final de CLIP.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; cualquier expectativa de uso conversacional es erronea.
- Sesgos: no declarados en la informacion disponible; al heredar los pesos del checkpoint base de Google, arrastra los sesgos de su dataset de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de asignaciones erroneas de etiqueta cuando las categorias del prompt no cubren el contenido real de la imagen.
- Preprocesado fragil: usar las constantes de normalizacion de CLIP en lugar de las de SigLIP falla en silencio, sin error visible, y degrada las similitudes.
- Relleno de texto critico: rellenar con `<pad>` (id 0) en lugar de `</s>` (id 1) desplaza los embeddings 0,706 en coseno; es un error silencioso y con impacto alto.
- Salidas sin normalizar: `image_embeds` y `text_embeds` no estan normalizados L2, por lo que hay que normalizar antes de calcular similitudes si se quiere reproducir el comportamiento de referencia.
- Limite de 64 tokens: los prompts de texto mas largos que esa longitud se truncan, lo que restringe descripciones largas o listas de etiquetas extensas.
- Idiomas: no declarados; el rendimiento fuera del ingles no esta garantizado por la informacion disponible.
- Licencia: Apache-2.0, permisiva para uso comercial, pero el autor del export no ofrece garantias y la responsabilidad de validacion recae en quien lo despliega.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte comunitario demostrable.
- Madurez del artefacto: creado el 29 de septiembre de 2026 y actualizado dos minutos despues, sin historial de versiones ni pruebas de terceros publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mtbui2010/siglip-base-patch16-224-ONNX
- Modelo base: https://huggingface.co/google/siglip-base-patch16-224
- Imagen Docker de VisionServe: https://hub.docker.com/r/mtbui2010/visionserve

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados no guardaban relacion con el contenido de la ficha y se han descartado.
