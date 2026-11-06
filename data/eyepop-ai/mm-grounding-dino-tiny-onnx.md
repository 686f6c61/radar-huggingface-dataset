# eyepop-ai/mm-grounding-dino-tiny-onnx

## Resumen

MM Grounding DINO tiny (ONNX) es la exportación a ONNX del modelo MM Grounding DINO tiny de OpenMMLab, publicada por eyepop-ai para su uso en la capacidad de detección open-vocabulary `eyepop.grounding-dino.detect` de la plataforma EyePop. No se trata de un modelo nuevo ni reentrenado: los pesos son los del checkpoint original `mm_grounding_dino_tiny_o365v1_goldg_v3det`, redondeados a float16 y convertidos a dos grafos ONNX (encoder de texto y detector) mediante `torch.onnx.export` con opset 19.

El modelo resuelve detección de objetos guiada por texto: dado un frame y una o varias prompts en lenguaje natural (hasta 8 en EyePop), devuelve cajas delimitadoras con su score y el índice de la prompt que las originó. La arquitectura subyacente es Grounding DINO en su variante tiny, con backbone Swin-T y encoder de texto BERT uncased con vocabulario de 32 tokens por prompt.

Su relevancia es de ingeniería de despliegue: los grafos están adaptados para que ejecuten enteros en proveedores como TensorRT y OpenVINO (sin nodos float64 ni aritmética de formas en CPU), lo que permite inferencia open-vocabulary de baja latencia en GPU Intel y NVIDIA sin dependencia de PyTorch en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grounding DINO tiny (transformer detector con backbone Swin-T y encoder de texto BERT uncased), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens por prompt (una fila por prompt, `[CLS] <prompt> . [SEP]`, padding a cero) |
| Tipos de cuantización | Pesos almacenados en float16 con Cast a float32; cómputo en float32 en todos los execution providers; exportación TensorRT fp16 validada |
| Idiomas soportados | no disponible (el tokenizador es BERT uncased; las prompts se expresan en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 19): `gdino_language_encoder.onnx` y `gdino_detector.onnx`; repositorio de 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un detector Grounding DINO en variante tiny. El grafo `gdino_language_encoder.onnx` recibe `text_tokens` int64 de forma `[Q, 32]` y produce `text_features` f32 `[Q, 32, 256]` junto con `text_tokens_out`. El grafo `gdino_detector.onnx` recibe la imagen uint8 `[1, 3, 800, 800]` en RGB escalada para rellenar el lienzo, las features y tokens de Q prompts y un `score_threshold` f32, y devuelve `scores [N]`, `boxes [N, 4]` en coordenadas normalizadas (x1, y1, x2, y2 en 0..1) y `prompt_index` int64 `[N]`.

La innovación técnica clave es el tratamiento del texto: la atención textual de Grounding DINO aísla cada bloque `<prompt> .` y reinicia los position ids tras cada token especial, de modo que codificar una prompt por separado produce las mismas features que codificarla dentro de una secuencia concatenada. Por eso el encoder de lenguaje se ejecuta una vez por prompt y su salida puede cachearse, mientras el detector yuxtapone las filas y enmascara el padding y todos los `[CLS]`/`[SEP]` salvo el primero. El score de una detección es la mejor probabilidad de token de su query, siguiendo el cálculo de `post_process_grounded_object_detection` de transformers.

No hubo reentrenamiento ni fine-tuning. La exportación aplica parches que cambian la forma de escribir las operaciones, no su resultado: elimina `isin`, `cummax` y `cummin` del cálculo de máscaras y position ids; hace que la atención deformable muestree en el dtype del value y mantiene los puntos de referencia del encoder en float32 (trazados salían float64); y onnx-simplifier pliega la aritmética de formas que decide la imagen fija de 800x800. Sin los dos últimos, el execution provider OpenVINO de onnxruntime dejaba en CPU la aritmética entera de formas y los nodos float64, partiendo el detector en decenas de fragmentos y fallando al construir uno de ellos con número dinámico de prompts.

## Capacidades

- Detección de objetos open-vocabulary guiada por prompts de texto en lenguaje natural.
- Procesamiento de hasta 8 prompts en una sola ejecución del detector (límite impuesto por EyePop).
- Salida con score por detección, cajas normalizadas y asignación de cada detección a su prompt de origen.
- Umbral de score configurable como entrada del grafo (`score_threshold`).
- Encoder de texto cacheable por prompt, reutilizable entre frames.
- Ejecución validada en CUDA, CPU, TensorRT fp16 y OpenVINO sobre GPU Intel.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo más allá de frames individuales.

## Casos de uso

- Moderación de contenido visual: detectar categorías definidas por texto ("arma", "cigarrillo", "sangre") sobre frames de vídeo, ajustando las prompts sin reentrenar y aprovechando el encoder de texto cacheado para reducir coste por frame.
- Búsqueda visual por descripción: indexar imágenes o frames con detecciones guiadas por consultas en lenguaje natural, usando `prompt_index` para mapear cada caja a la consulta que la originó.
- Analítica de retail: contar productos o estanterías vacías con prompts como "botella de agua" o "hueco en estantería", desplegando el detector en GPU Intel vía OpenVINO en hardware de borde.
- Automatización de inventario en almacén: detección de palés, cajas y etiquetas con umbral de score ajustable para controlar falsos positivos en cámara fija.
- Análisis de imágenes médicas o industriales asistido: localizar regiones descritas textualmente ("grieta", "corrosión") como preetiquetado para revisión humana, dado el carácter open-vocabulary del modelo.
- Pipelines de visión en producción con TensorRT: el detector no tiene formas dependientes de datos antes de las salidas, por lo que TensorRT lo compila entero; adecuado para inferencia de baja latencia en GPU NVIDIA con fp16.
- Prototipado rápido de tareas de detección sin dataset etiquetado: sustituir un detector cerrado por prompts ad hoc durante la fase de exploración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (COCO, LVIS, etc.) en la información disponible. La model card incluye únicamente validaciones de equivalencia numérica frente a la implementación de transformers:

| Comparación | Resultado |
|---|---|
| ONNX vs. transformers en CUDA y CPU | Todas las detecciones coinciden; IoU de caja >= 0,93; delta de score <= 0,023 |
| TensorRT fp16 vs. CUDA | IoU de caja >= 0,98; la mitad de tiempo |
| OpenVINO en GPU Intel vs. CPU | Coincide con CPU |

Las comparaciones se hicieron a la relación de aspecto original de la imagen, mientras los grafos escalan para rellenar 800x800.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,5 GB con pesos en float16 y el detector incluye tablas plegadas de gran tamaño.
- GPU recomendadas: NVIDIA con TensorRT (compilación completa del grafo, fp16 a mitad de tiempo que CUDA) y GPU Intel integradas o dedicadas vía el execution provider OpenVINO de onnxruntime.
- CPU: soportado y validado, con resultados equivalentes a CUDA.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras consumer; el modelo es tiny y el repositorio es pequeño, pero no hay datos publicados de VRAM ni de ejecución en esas tarjetas.
- Opciones de despliegue: onnxruntime (CUDA, CPU, OpenVINO), TensorRT; la integración de referencia es la capacidad `eyepop.grounding-dino.detect` de EyePop.
- Latencia y throughput: no disponibles en cifras absolutas; solo se indica que TensorRT fp16 tarda la mitad que CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de texto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| eyepop-ai/mm-grounding-dino-tiny-onnx | no disponible | 32 tokens por prompt, hasta 8 prompts | ONNX (fp16 con Cast a fp32) | Apache 2.0 | Exportación optimizada para TensorRT y OpenVINO; sin reentrenamiento |
| openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det | no disponible | no disponible | PyTorch (checkpoint original) | Apache 2.0 | Modelo base; requiere PyTorch y el port de transformers |
| Otros detectores open-vocabulary (p. ej. Grounding DINO base/large, OWLv2) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Modelo de detección, no de generación: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Ventana de texto muy corta: 32 tokens por prompt con tokenizador BERT uncased; prompts largas o con vocabulario fuera del tokenizador se truncan o degradan.
- Límite de 8 prompts por ejecución impuesto por EyePop, no por el grafo.
- La imagen se escala para rellenar un lienzo fijo de 800x800, lo que altera la relación de aspecto; las validaciones de equivalencia se hicieron a la relación original, por lo que pueden aparecer diferencias en imágenes muy alargadas.
- Riesgo de alucinación de detecciones inherente a los modelos open-vocabulary: conviene calibrar `score_threshold` por dominio.
- Sesgos: no se documentan sesgos específicos; al no haber reentrenamiento, hereda los del checkpoint original entrenado con o365v1, GoldG y V3Det.
- Idiomas soportados no documentados; el tokenizador BERT uncased favorece el inglés.
- Licencia Apache 2.0, permisiva para uso comercial, pero la atribución a OpenMMLab y a EyePop debe mantenerse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado fuera de EyePop.
- Los pesos se almacenan en float16 con Cast a float32; el ahorro de memoria es de almacenamiento, no de cómputo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eyepop-ai/mm-grounding-dino-tiny-onnx
- Modelo base: https://huggingface.co/openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det
- Repositorio MMDetection (configs MM Grounding DINO): https://github.com/open-mmlab/mmdetection/tree/main/configs/mm_grounding_dino
- Repositorio eyepop-pipeline (script de exportación): https://github.com/eyepop-ai/eyepop-pipeline
