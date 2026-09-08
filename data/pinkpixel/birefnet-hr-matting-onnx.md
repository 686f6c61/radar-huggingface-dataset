# PinkPixel/birefnet-hr-matting-onnx

## Resumen

El modelo PinkPixel/birefnet-hr-matting-onnx es un export ONNX autocontenido del modelo BiRefNet HR Matting original de Peng Zheng. Está diseñado para eliminación de fondo y matting de alta resolución, operando de forma nativa a 2048x2048 píxeles. La arquitectura BiRefNet emplea mecanismos de referencia bilateral para reconstruir detalles finos como cabellos, bordes translúcidos y objetos complejos. El modelo se distribuye bajo licencia MIT y tiene un tamaño de aproximadamente 932 MB en un único archivo `model.onnx`. Su relevancia radica en que permite ejecutar el modelo en múltiples plataformas (CPU, CUDA, DirectML, CoreML y WebGPU) sin necesidad de dependencias de PyTorch, lo que facilita su integración en aplicaciones de producción y entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet HR (Bilateral Reference for High-Resolution Dichotomous Image Segmentation) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (pesos en Float32) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

BiRefNet es una red neuronal diseñada para la segmentación dicotómica de alta resolución. Su arquitectura combina una rama de localización que identifica la región global del objeto y una rama de refinamiento de detalles que procesa bordes finos, utilizando referencias bilaterales para recuperar información de alta frecuencia. El modelo fue entrenado a una resolución de 2048x2048, lo que le permite producir máscaras alpha suaves (soft-alpha) con valores entre 0.0 y 1.0. No se han publicado en la información disponible detalles sobre los datos de entrenamiento ni sobre procesos de alineación como RLHF o DPO, al tratarse de un modelo de visión.

## Capacidades

- Eliminación de fondo en imágenes con resolución nativa de 2048x2048.
- Extracción de máscaras alpha suaves para composición transparente (RGBA) sin necesidad de umbralización posterior.
- Manejo de bordes complejos: cabellos sueltos, redes, follaje fino y materiales semitransparentes.
- Segmentación dicotómica de alta precisión en conjuntos de prueba de matting.
- Ejecución multiplataforma mediante ONNX Runtime: CPU, CUDA, DirectML, CoreML y WebGPU.
- Salida en grayscale (L) lista para ser usada como canal alpha.

## Casos de uso

- Edición de fotografía de producto para ecommerce: el modelo genera recortes transparentes de alta calidad a partir de imágenes de producto, lo que permite presentar los artículos sobre fondos personalizados sin trabajo manual.
- Postproducción de vídeo: al procesar fotogramas individuales a 2048x2048, se puede utilizar para matting de personas u objetos en secuencias de vídeo, siempre que se tenga en cuenta la latencia.
- Diseño gráfico y composición publicitaria: la máscara alpha suave facilita la integración de elementos con bordes naturales, como pelo o cristal, en composiciones complejas.
- Generación de avatares y fotos de perfil: permite extraer el sujeto de una fotografía y superponerlo sobre fondos virtuales para aplicaciones de perfilado o videoconferencia.
- Aplicaciones web en tiempo real: gracias al soporte de WebGPU, el modelo puede ejecutarse en el navegador para ofrecer eliminación de fondo interactiva en herramientas de edición online.
- Automatización de flujos de trabajo en fotografía de estudio: el modelo puede integrarse en pipelines de procesamiento por lotes para generar recortes transparentes de series de retratos o productos.

## Benchmarks y rendimiento

| Dataset | Resolución | maxFm | wFmeasure | MAE | Smeasure | meanEm | maxBIoU |
|---|---|---|---|---|---|---|---|
| TE-AM-2k | 2048x2048 | 0.974 | 0.997 | 0.002 | 0.998 | 0.987 | 0.965 |
| TE-P3M-500-NP | 2048x2048 | 0.980 | 0.996 | 0.002 | 0.997 | 0.987 | 0.947 |

Nota: estos resultados corresponden a la evaluación del modelo original en modo FP16, según la información proporcionada por el autor.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa ~932 MB en Float32. Para inferencia, se recomienda al menos 2 GB de VRAM en GPU, aunque el consumo real depende de las activaciones a 2048x2048.
- GPU recomendadas: cualquier GPU compatible con CUDA y con al menos 2-4 GB de memoria (por ejemplo, RTX 3060, RTX 4090, A100). También funciona en CPU, aunque con mayor latencia.
- Puede ejecutarse en GPU de consumo, como la serie RTX 30 o 40, e incluso en hardware integrado mediante DirectML o CoreML.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML, WebGPU). No es compatible con vLLM ni llama.cpp al ser un modelo de visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos similares en la información proporcionada. El modelo es un export directo del original ZhengPeng7/BiRefNet_HR-matting, por lo que sus resultados son equivalentes a los del modelo original.

## Limitaciones y advertencias

- El modelo requiere que la imagen de entrada se redimensione a 2048x2048, lo que puede degradar la calidad si la imagen original tiene una resolución muy distinta o una relación de aspecto extrema.
- No se han documentado sesgos específicos, pero al ser un modelo de visión puede fallar en escenas con oclusiones, fondos complejos o múltiples objetos superpuestos.
- La salida es una máscara alpha; el modelo no genera la imagen recortada final, por lo que se necesita un paso adicional de composición.
- El formato ONNX es un export congelado; no se proporciona el código de entrenamiento ni los pesos originales de PyTorch en este repositorio.
- La licencia MIT permite uso comercial, pero se debe mantener el aviso de copyright y la atribución al autor original (Peng Zheng y colaboradores).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PinkPixel/birefnet-hr-matting-onnx
- Modelo original: https://huggingface.co/ZhengPeng7/BiRefNet_HR-matting
- Repositorio del código original: https://github.com/ZhengPeng7/BiRefNet
- Paper: https://arxiv.org/abs/2401.03407
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/ZhengPeng7/BiRefNet_demo
