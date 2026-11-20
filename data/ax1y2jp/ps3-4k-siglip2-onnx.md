# AX1Y2JP/PS3-4K-SigLIP2-ONNX

## Resumen

PS3-4K-SigLIP2-ONNX es la exportación a formato ONNX del modelo nvidia/PS3-4K-SigLIP2, un codificador visual de alta resolución desarrollado por NVIDIA. El modelo original pertenece a la familia PS3 (Patch Selection at Scale), diseñada para procesar imágenes de hasta 4K mediante una estrategia de selección de parches que evita el coste cuadrático de la atención sobre todos los tokens de una imagen de gran resolución. Esta versión ONNX la publica el usuario AX1Y2JP y mantiene la misma lógica de cómputo que la implementación de referencia en PyTorch (ps3-torch), pero dividiendo el codificador visual en dos grafos (baja y alta resolución) y moviendo la selección de parches a código Python con NumPy.

El modelo resuelve el problema de la extracción de características visuales densas en resoluciones muy altas, un escenario habitual en teledetección, inspección industrial, documentos y análisis de imágenes médicas, donde los enfoques tipo CLIP a 224 o 336 píxeles pierden detalle. Al estar exportado a ONNX con variantes fp32, fp16 e int8 (solo para el codificador de texto), se puede desplegar con ONNX Runtime sin depender de PyTorch, lo que facilita su integración en pipelines de producción heterogéneos.

La relevancia actual del modelo radica en que combina un backbone SigLIP2 con un mecanismo de selección de parches que reduce el número de tokens procesados en alta resolución, y en que su exportación ONNX abre la puerta a inferencia portable en CPU y GPU. El repositorio ocupa 11,1 GB y no registra descargas ni interacciones en el momento de redactar esta ficha, lo que indica que es una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visual SigLIP2 con seleccion de parches (PS3); exportacion ONNX en dos grafos (baja y alta resolucion) mas codificador de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; la resolucion de entrada llega hasta 4K segun el nombre del modelo) |
| Tipos de cuantizacion | fp32, fp16 (pesos fp16 con E/S float32) e int8 weight-only (`MatMulNBits` + embedding int8) solo para el modelo de texto; no hay vision int8 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (nvidia-license); el codigo `ps3_onnx.py` derivado de ps3-torch es Apache-2.0 |
| Formato de pesos | ONNX (opset 23, requiere ONNX Runtime 1.22+) |

## Arquitectura y entrenamiento

El modelo base es nvidia/PS3-4K-SigLIP2, un codificador visual construido sobre SigLIP2 (la evolución de CLIP/SigLIP de Google basada en pérdida sigmoidea) al que NVIDIA añade el mecanismo PS3 de selección de parches a escala. En lugar de aplicar atención sobre todos los parches de una imagen de 4K, el modelo identifica los parches relevantes y procesa solo un subconjunto en alta resolución, reduciendo el coste computacional y de memoria. La exportación ONNX separa el codificador visual en un grafo de baja resolución y otro de alta resolución, y traslada la selección de parches a `ps3_onnx.py`, que ejecuta los tres grafos (visión baja, visión alta y texto) y la selección en NumPy, devolviendo el mismo resultado que `PS3VisionModel` de ps3-torch.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO, ya que la model card del repositorio exportado no los detalla. La innovación técnica destacable es doble: por un lado, el propio mecanismo PS3 de selección de parches para alta resolución; por otro, la decisión de cuantizar únicamente el codificador de texto a int8, dejando la visión en fp16 o fp32 porque, según el autor, los tokens de alta resolución son demasiado sensibles a la cuantización.

## Capacidades

- Extracción de características visuales (`image-feature-extraction`) a partir de imágenes de hasta 4K.
- Generación de embeddings de imagen (`image_embeds`) y de estados ocultos por token (`last_hidden_state`).
- Codificación de texto (`encode_text`) para tareas de recuperación multimodal imagen-texto.
- Selección de parches guiada por prompt: `encode_image` acepta un `prompt` y devuelve `selection_maps`, lo que permite dirigir la atención a regiones concretas de la imagen.
- Control del número de pasos de alta resolución mediante el parámetro `num_look_close`.
- Inferencia portable con ONNX Runtime, sin dependencia de PyTorch.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo de texto).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio adicional: no disponible más allá de la codificación visual descrita.

## Casos de uso

- Teledetección y análisis de satélite: el modelo procesa imágenes de hasta 4K y devuelve mapas de selección de parches, lo que permite localizar edificios, cultivos o infraestructuras en ortofotos sin recortar la imagen en mosaicos y sin perder contexto global.
- Inspección industrial de alta resolución: en líneas de fabricación se capturan imágenes de varios megapíxeles; el codificador extrae embeddings densos que alimentan clasificadores de defectos, y el prompt dirige la selección hacia las zonas de interés.
- Búsqueda multimodal imagen-texto: `encode_text` e `encode_image` permiten construir un índice vectorial de un catálogo de imágenes y recuperarlas mediante consultas en lenguaje natural, con la ventaja de que las imágenes no necesitan reescalarse a 224 píxeles.
- Análisis de documentos y planos: los mapas de selección sobre documentos escaneados a alta resolución permiten extraer regiones relevantes (firmas, tablas, sellos) antes de pasarlas a un OCR o a un modelo de lenguaje.
- Imagen médica y microscopía: la extracción de características a alta resolución es útil para clasificar y recuperar cortes histológicos o radiografías, donde el detalle fino condiciona el diagnóstico.
- Despliegue en entornos sin PyTorch: al estar en ONNX con variantes fp16 e int8 (texto), se puede integrar en servicios escritos en C#, Java o C++ mediante ONNX Runtime, o en funciones serverless con requisitos estrictos de dependencias.
- Segmentación asistida por prompt: `selection_maps` actúa como una máscara de relevancia que puede combinarse con modelos de segmentación posteriores para aislar objetos indicados por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 11,1 GB; la variante fp32 ocupa ese orden de magnitud y la fp16 aproximadamente la mitad (en torno a 5,5 GB) para los pesos de visión y texto. La memoria de activaciones depende de la resolución de entrada y del número de parches seleccionados, y no se ha publicado una cifra concreta.
- GPU recomendadas: no hay datos oficiales del autor. Por tamaño, una GPU con 16 GB o más (RTX 4080/4090, L4, A10G) debería alojar la variante fp16; para fp32 se recomienda 24 GB o más (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 16-24 GB de VRAM usando la variante fp16; la variante fp32 requiere al menos 12 GB solo para pesos y deja poco margen para activaciones en tarjetas de 16 GB.
- Opciones de despliegue: ONNX Runtime 1.22 o superior (opset 23), con ejecución en CPU o GPU (proveedores CUDA/TensorRT de ONNX Runtime). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un codificador visual.
- Latencia y throughput: no disponibles; dependerán de la resolución de entrada, del número de pasos `num_look_close` y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrada | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| PS3-4K-SigLIP2-ONNX (este) | no disponible | hasta 4K | no disponible | NVIDIA License | ONNX (fp32/fp16/int8 texto) | Hugging Face |
| nvidia/PS3-4K-SigLIP2 | no disponible | hasta 4K | no disponible | NVIDIA License | PyTorch | Hugging Face |
| SigLIP2 (Google) | no disponible en la informacion | tipicamente 224-384 px | no disponible | no disponible en la informacion | PyTorch, entre otros | Hugging Face |
| CLIP ViT-L/14 | ~428 M | 224 px | 77 tokens de texto | MIT (variante OpenAI) | PyTorch, ONNX | Amplia |

La comparación con SigLIP2 y CLIP es orientativa por categoría (codificadores imagen-texto); no se dispone de métricas comparativas publicadas para este modelo concreto. Frente a CLIP y SigLIP2 estándar, la diferencia principal es la resolución de trabajo (hasta 4K) y el mecanismo de selección de parches, que reduce el coste de procesar imágenes grandes. Frente al modelo base en PyTorch, esta versión añade portabilidad ONNX y cuantización int8 del codificador de texto, a cambio de requerir ONNX Runtime 1.22+ y de no ofrecer visión cuantizada a int8.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un codificador entrenado con datos web a gran escala, es previsible que herede sesgos de representación, pero no hay documentación específica.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los mapas de selección de parches pueden señalar regiones irrelevantes si el prompt es ambiguo; el autor no documenta evaluaciones de fidelidad de la selección.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni límites de longitud de texto para `encode_text`; la resolución máxima efectiva y el comportamiento más allá de 4K no están documentados.
- Restricciones de licencia: los pesos están bajo NVIDIA License, que puede imponer condiciones al uso comercial; es necesario revisar `LICENSE.md` antes de desplegar en producción. El código `ps3_onnx.py` es Apache-2.0, pero eso no cubre los pesos.
- Cuantización: no existe variante int8 del codificador visual, por lo que no se puede reducir el modelo de visión por debajo de fp16 sin pérdida de calidad según el autor.
- Dependencia de versión: requiere ONNX Runtime 1.22+ por el uso de opset 23; versiones anteriores no cargarán los grafos.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-20), por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No es un modelo generativo: no produce texto, razonamiento ni código; cualquier caso de uso que requiera generación necesita combinarlo con un modelo de lenguaje aparte.

## Enlaces

- Hugging Face: https://huggingface.co/AX1Y2JP/PS3-4K-SigLIP2-ONNX
- Modelo base: https://huggingface.co/nvidia/PS3-4K-SigLIP2
- Repositorio de referencia ps3-torch: https://github.com/NVlabs/PS3
