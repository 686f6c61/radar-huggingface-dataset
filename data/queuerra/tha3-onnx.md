# queuerra/tha3-onnx

## Resumen

THA3 (Talking Head Anime 3) es un modelo de animación facial y corporal para personajes de estilo anime a partir de un único retrato. Dado un fotograma RGBA de 512 × 512 píxeles con canal alfa y un vector de pose de 45 elementos, genera un nuevo fotograma con la expresión facial y la pose de cabeza y cuerpo solicitadas. El trabajo original es de Pramook Khungurn (2022), publicado bajo el título *Talking Head Anime from a Single Image 3: Now the Body Too*.

Esta release concreta, `queuerra/tha3-onnx`, es una exportación a ONNX del modelo preentrenado `separable_float`, adaptada para TensorRT 10.4 con precisión mixta FP16. No se trata de un modelo nuevo ni de un reentrenamiento, sino de una conversión de formato orientada al despliegue optimizado en GPUs NVIDIA. El repositorio está publicado con licencia CC BY 4.0, la misma que los pesos originales.

El modelo no es un LLM ni un modelo multimodal de texto: es un generador de imágenes condicionado por pose, especializado en avatares 2D animados. Su relevancia actual reside en que permite montar pipelines de VTubing, avatares interactivos o demos de animación en tiempo real sobre infraestructura TensorRT, algo que la implementación original en PyTorch no cubría de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de síntesis de imagen condicionada por pose (modelo `separable_float` de THA3); topología interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada de 512 × 512 RGBA + vector de pose de 45 elementos) |
| Tipos de cuantizacion | FP16 mixta (exportación TensorRT); no se documentan otras precisiones en esta release |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`tha3-tensorrt-fp16.onnx`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo `separable_float` más allá de su función: recibe una imagen RGBA de 512 × 512 con transparencia y un vector de 45 elementos que codifica la pose de la cabeza y el cuerpo, y produce un nuevo fotograma renderizado con esa pose y expresión. El nombre `separable_float` sugiere el uso de convoluciones separables en el modelo original, pero este dato no se confirma en la documentación proporcionada.

Tampoco se dispone de datos sobre el conjunto de entrenamiento, el número de tokens o imágenes, ni sobre si se aplicaron técnicas de ajuste fino como RLHF o DPO (habituales en LLM, no en este tipo de modelos). La única innovación documentada en esta release es la conversión a ONNX con precisión mixta FP16 y la adaptación del grafo para TensorRT 10.4, orientada a reducir latencia y huella de memoria en GPUs NVIDIA.

## Capacidades

- Generación de fotogramas animados de personajes anime a partir de un único retrato.
- Control de expresión facial y pose de cabeza y cuerpo mediante un vector de 45 elementos.
- Entrada con canal alfa (RGBA), lo que permite composición sobre fondos arbitrarios.
- Salida de imagen a 512 × 512 píxeles.
- Ejecución optimizada en TensorRT 10.4 con FP16 mixta.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de procesamiento de texto.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras modalidades.

## Casos de uso

- VTubing en tiempo real: el modelo puede generar fotogramas animados a partir de un retrato fijo y un vector de pose capturado por seguimiento facial, con la ventaja de la exportación TensorRT para reducir latencia por fotograma.
- Avatares interactivos en aplicaciones de escritorio o web: al ser un ONNX portable, puede integrarse en runtimes ligeros y ejecutarse en la GPU del usuario sin depender de PyTorch.
- Demos de animación de personajes para juegos indie: permite animar retratos 2D con expresiones y movimiento de cabeza sin rigging manual, usando el vector de 45 elementos como interfaz de control.
- Prototipado de asistentes virtuales con cara animada: combinado con un motor de diálogo externo, el modelo aporta la capa visual del avatar.
- Generación de contenido para narrativa visual o cómics: se pueden producir variaciones de pose y expresión de un mismo personaje manteniendo la identidad del retrato original.
- Evaluación comparativa de backends de inferencia: al estar exportado a ONNX y adaptado a TensorRT, sirve como banco de pruebas para medir rendimiento FP16 frente a la implementación original en PyTorch.
- Investigación en animación facial condicionada por pose: el modelo y su exportación permiten reproducir el pipeline original y experimentar con variantes del vector de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Al tratarse de una exportación FP16 mixta de un modelo de síntesis de imagen a 512 × 512, se espera una huella moderada, pero no se aportan cifras.
- GPU recomendadas: no disponibles. La release está adaptada específicamente para TensorRT 10.4, lo que implica GPUs NVIDIA compatibles con dicha versión.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; la compatibilidad con TensorRT 10.4 sugiere que podría ejecutarse en GPUs NVIDIA de gama consumer recientes, pero no se documenta.
- Opciones de despliegue: TensorRT 10.4 (objetivo principal de esta exportación); al ser un archivo ONNX, también es desplegable con ONNX Runtime, aunque la adaptación del grafo está pensada para TensorRT.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| THA3 (`separable_float`, esta release) | Animación de retrato anime | Imagen 512×512 RGBA + vector de 45 elementos | Fotograma 512×512 | CC BY 4.0 | ONNX (TensorRT FP16) |
| THA3 original (PyTorch) | Animación de retrato anime | Imagen 512×512 RGBA + vector de 45 elementos | Fotograma 512×512 | CC BY 4.0 | Pesos PyTorch |
| Alternativas de animación de retrato | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada; la comparación se limita al modelo original frente a esta exportación.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en retratos de estilo anime; no generaliza a fotografía real ni a otros dominios visuales.
- No procesa texto ni mantiene conversaciones; cualquier caso de uso conversacional requiere un motor externo.
- Riesgo de artefactos visuales en poses extremas o expresiones fuera del rango del vector de 45 elementos, aunque no se documenta explícitamente.
- La exportación está adaptada a TensorRT 10.4; versiones distintas pueden requerir reexportación o ajustes del grafo.
- No se documentan sesgos específicos, pero al entrenarse presumiblemente con ilustraciones anime, heredará los sesgos estilísticos y demográficos de ese corpus.
- Licencia CC BY 4.0: permite uso comercial siempre que se atribuya al autor original (Pramook Khungurn) y a esta conversión; es obligatorio mantener la atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada del funcionamiento de la exportación.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están efectivamente subidos o que la medición no se ha actualizado; conviene verificar la presencia del archivo `tha3-tensorrt-fp16.onnx` antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/queuerra/tha3-onnx
- Página del proyecto original THA3: https://pkhungurn.github.io/talking-head-anime-3/
- Repositorio original: https://github.com/pkhungurn/talking-head-anime-3-demo
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
