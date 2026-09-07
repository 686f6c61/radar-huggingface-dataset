# lopentu/ckiplab-bert-base-chinese-DottedWSD-onnx

## Resumen

El modelo `lopentu/ckiplab-bert-base-chinese-DottedWSD-onnx` es una exportación ONNX del modelo `ckiplab-bert-base-chinese-DottedWSD`, un modelo de desambiguación de sentido de palabras (WSD) en chino desarrollado por el laboratorio CKIP. Está diseñado para clasificar si un candidato de sentido, extraído de Chinese Wordnet, es el correcto para una palabra en un contexto dado. El modelo original es un encoder BERT base chino, entrenado en mandarín contemporáneo de Taiwán. Esta conversión ONNX, creada por lopentu, permite ejecutar el modelo directamente en el navegador con transformers.js, sin necesidad de infraestructura de servidor. El repositorio incluye dos versiones: una en fp32 (409 MB) y otra cuantizada en int8 dinámico (103 MB), con un error de probabilidad máximo de 0.045 frente a la versión original. Es relevante porque facilita la integración de WSD en aplicaciones web y demuestra la viabilidad de ejecutar modelos de desambiguación en el cliente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only Transformer) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (en el ejemplo de uso se limita a 320 tokens) |
| Tipos de cuantizacion | fp32 y dynamic int8 per-channel (QInt8) |
| Idiomas soportados | zh (chino tradicional de Taiwán) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` y `model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, un transformer encoder-only. El modelo original es `ckiplab/bert-base-chinese`, entrenado por CKIP Lab. Para la tarea de WSD, el modelo recibe un par de secuencias: el contexto con la palabra objetivo entre corchetes angulares (por ejemplo, `忽然看見江<心>浮現一團黑影`) y una glosa compuesta por la palabra, su definición en Chinese Wordnet y un primer ejemplo. El modelo produce un logit para cada par, indicando si el sentido candidato es el correcto. El entrenamiento se realizó sobre mandarín contemporáneo de Taiwán. El estudio que da origen al modelo, "Balancing Accuracy and Efficiency: Evaluating Encoder- and Decoder-Based Models for Word Sense Disambiguation and Regular Polysemy Detection" (Chen, Lian & Hsieh, 2026), compara enfoques encoder y decoder para WSD. La exportación ONNX se realizó con `torch.onnx.export` (opset 17, eager attention), y los logits son idénticos a los de PyTorch. La versión cuantizada utiliza cuantización dinámica int8 por canal, lo que reduce el tamaño de 409 MB a 103 MB con una pérdida mínima de precisión.

## Capacidades

- Desambiguación de sentido de palabras en chino: puntúa cada candidato de sentido de una palabra en un contexto.
- Detección de polisemia regular: puede distinguir entre sentidos relacionados y no relacionados.
- Clasificación de pares de secuencias: acepta contexto y glosa como entrada.
- Ejecución en navegador: compatible con transformers.js y WebGPU/WebAssembly.
- No es generativo: no produce texto, solo logits de clasificación.
- No soporta tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Anotación semántica de corpus chinos: permite etiquetar automáticamente el sentido de cada palabra en un corpus, útil para estudios lingüísticos y entrenamiento de otros modelos.
- Búsqueda semántica en documentos chinos: al desambiguar los sentidos, se puede mejorar la relevancia de resultados en motores de búsqueda y sistemas de recuperación de información.
- Herramientas de análisis lingüístico en el navegador: gracias a la exportación ONNX y transformers.js, el modelo puede ejecutarse directamente en una página web, sin servidor, para ofrecer anotación de sentidos en tiempo real.
- Enseñanza de chino como lengua extranjera: la desambiguación puede mostrar los distintos sentidos de una palabra en contexto, ayudando a estudiantes a comprender la polisemia.
- Mejora de sistemas de traducción automática: la desambiguación de sentidos puede integrarse como componente previo para seleccionar la traducción adecuada según el contexto.
- Análisis de textos literarios contemporáneos: el modelo puede aplicarse a textos en mandarín de Taiwán para estudiar variaciones de sentido y uso de palabras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (Chen, Lian & Hsieh, 2026) presenta evaluaciones, pero no se incluyen cifras concretas en los datos proporcionados.

## Requisitos de hardware

- Tamaño de los archivos: `model.onnx` (fp32) 409 MB, `model_quantized.onnx` (int8) 103 MB.
- La versión cuantizada es la recomendada para ejecución en navegador o en dispositivos con recursos limitados.
- En el navegador, requiere un navegador moderno con soporte WebGPU o WebAssembly. En Node.js, puede ejecutarse con onnxruntime-node en CPU o onnxruntime-gpu si se dispone de GPU.
- VRAM estimada: al ser un modelo BERT base, la memoria necesaria es modesta; la versión cuantizada necesita aproximadamente 103 MB de memoria, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. (Estimación basada en el tamaño del archivo.)
- No se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es una exportación ONNX del modelo original `lopentu/ckiplab-bert-base-chinese-DottedWSD`, pero no se ofrecen comparativas con otros modelos de desambiguación de sentido en chino.

## Limitaciones y advertencias

- Entrenado en chino mandarín contemporáneo de Taiwán; puede presentar degradación en chino clásico, budista u otras variedades.
- Depende de Chinese Wordnet (CwnGraph) para generar los candidatos de sentido; si la palabra no está en el wordnet, el modelo no puede funcionar.
- La cuantización int8 introduce un error máximo de probabilidad de 0.045 con respecto a fp32, aunque el argmax se mantiene en los casos probados.
- No es un modelo generativo: no puede redactar explicaciones ni responder preguntas abiertas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Posibles sesgos en el corpus de entrenamiento que pueden reflejarse en las predicciones.
- El modelo está pensado para la tarea específica de WSD; su uso fuera de este dominio requiere fine-tuning.

## Enlaces

- Modelo ONNX: https://huggingface.co/lopentu/ckiplab-bert-base-chinese-DottedWSD-onnx
- Modelo base: https://huggingface.co/lopentu/ckiplab-bert-base-chinese-DottedWSD
- Código del proyecto: https://github.com/lopentu/dotted-wsd-public
- Demo Sense River: https://lopentu.github.io/sindia/ciwn/sense-river/
- CwnGraph: https://github.com/lopentu/CwnGraph
- CKIP Transformers: https://github.com/ckiplab/ckip-transformers
- Colección Dotted-WSD: https://huggingface.co/collections/lopentu/dotted-wsd
