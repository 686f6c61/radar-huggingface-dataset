# mikedoise/gemma-4-E2B-it-coreai-4bit-128k-vision

## Resumen

Gemma 4 E2B Instruct es un modelo multimodal de Google DeepMind que acepta texto e imágenes y genera texto. Esta ficha describe una conversión específica publicada por Michael Doise: un bundle de recursos para el runtime Core AI de Apple, cuantizado a 4 bits y configurado con una ventana de contexto de 131.072 tokens. No se trata de un checkpoint en formato Transformers, MLX, GGUF o Core ML, sino de paquetes `.aimodel` pensados para ejecutarse en Apple Silicon mediante el runtime Swift de `apple/coreai-models`.

El modelo base pertenece a la familia Gemma 4, que incluye las variantes E2B, E4B, 12B, 31B y 26B A4B. Google reporta para el E2B original aproximadamente 2.300 millones de parámetros efectivos y 5.100 millones incluyendo embeddings. Esta conversión omite el codificador de audio, por lo que esas cifras no equivalen a un recuento medido del bundle. La compresión es una palettización mixta a 4 bits en el modelo de lenguaje (con excepciones INT8 y tensores sin comprimir) y palettización de pesos a 4 bits con grupo de tamaño 32 en el codificador visual, con cómputo en float16 en ambos casos.

La relevancia de esta publicación es acotada pero concreta: permite probar un modelo multimodal de la familia Gemma 4 en un Mac con el stack nativo de Apple, sin depender de PyTorch ni de llama.cpp. La validación es mínima (una única prueba de humo con imagen en un M5 Max) y el contexto completo de 131.072 tokens está configurado pero no probado, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador/proyector visual); detalles internos del upstream no disponibles en la información proporcionada |
| Parametros totales | No disponible como recuento medido del bundle; el upstream reporta ~2,3B efectivos y ~5,1B con embeddings (sin audio en este paquete) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 131.072 tokens configurados; buckets estáticos de 1.024 / 8.192 / 32.768 / 131.072 |
| Tipos de cuantizacion | Texto: palettización mixta a 4 bits con excepciones INT8 y sin comprimir, cómputo float16. Visión: palettización de pesos a 4 bits, grupo 32, cómputo float16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (pesos); enlace de licencia de Gemma 4 en ai.google.dev |
| Formato de pesos | Paquetes de recursos Core AI `.aimodel` (`kind: vlm`), con `main.mlirb`, sidecar PLE en safetensors y tokenizer; no es Transformers, MLX, GGUF ni Core ML |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Gemma 4 que procesa texto e imágenes. La conversión incluye el modelo de lenguaje, el codificador y proyector visual, el tokenizer y un sidecar con los embeddings por capa (PLE) que el runtime necesita. El codificador de audio y la cabeza de borrador para decodificación especulativa no están incluidos en este bundle. La escalera de visión usa tres resoluciones (384, 768 y 1.152 píxeles) con 64, 256 y 576 tokens suaves por bucket respectivamente; el runtime elige el bucket según las dimensiones de la imagen, aplica letterboxing sin reescalado y enmascara el padding.

No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del upstream. La conversión es independiente y no añade fine-tuning. La compilación es en el dispositivo: `compilation.targets` está vacío y no se distribuye un build `.aimodelc` ahead-of-time. Google documenta para la familia Gemma 4 soporte nativo del rol de sistema y un modelo de borrador dedicado para decodificación especulativa, pero ese borrador no forma parte de esta exportación.

## Capacidades

- Generación de texto a partir de entradas de texto e imagen (pipeline `image-text-to-text`).
- Descripción y razonamiento básico sobre imágenes, con resolución adaptativa en tres buckets y tokens suaves escalados.
- Conversaciones multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Soporte del rol de sistema en el modelo base según la documentación de Google.
- Ventana de contexto configurable hasta 131.072 tokens mediante buckets estáticos.
- Ejecución en Apple Silicon a través del runtime Core AI y `llm-runner`.
- No incluye audio: el codificador de audio está ausente del bundle.
- Tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada para esta conversión.
- Capacidades multilingües: no disponible.

## Casos de uso

- Pruebas de concepto de visión en Mac: usar el bundle con `llm-runner` y una imagen local para validar que el pipeline multimodal funciona en el stack Core AI antes de comprometerse con una integración mayor.
- Prototipado de asistentes de escritorio nativos: integrar el runtime Swift en una aplicación macOS que necesite describir capturas de pantalla o imágenes del portapapeles sin salir del ecosistema Apple.
- Evaluación de cuantización a 4 bits: comparar respuestas de este bundle con el checkpoint original para medir la degradación introducida por la palettización mixta en tareas de texto e imagen.
- Procesamiento de documentos escaneados en local: pasar imágenes de páginas a través del bucket de 1.152 píxeles para obtener descripciones o extracción de contenido textual, manteniendo los datos en el dispositivo.
- Investigación sobre despliegue en Apple Silicon: estudiar el comportamiento del compilador y del runtime Core AI con modelos multimodales, incluidos los avisos de reordenación y el error interno del compilador ANE registrados en la prueba de humo.
- Base para pipelines de contexto largo en local: experimentar con los buckets de 32.768 y 131.072 tokens en un Mac con memoria unificada amplia, asumiendo que esa longitud no ha sido validada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es una prueba de humo con una imagen sintética de 768 × 384 (círculo rojo, cuadrado azul, triángulo verde) en un Apple M5 Max con 128 GiB de RAM, macOS 27.0.1 y Xcode 27.1, con estrategia de muestreo greedy y 96 tokens máximos; el modelo respondió correctamente con "Red circle, blue square, green tria...". No se aportan métricas de latencia ni de throughput.

## Requisitos de hardware

- Tamaño en disco del bundle: 3,854 GB (3,589 GiB), más documentación. Es tamaño de disco, no requisito de RAM.
- RAM: no disponible un requisito oficial; la prueba de humo se ejecutó en un equipo con 128 GiB de memoria unificada, pero no se documenta el mínimo.
- GPU: el runtime objetivo es Apple Silicon; la validación se hizo en un M5 Max. No hay datos para otras GPU (A100, H100, RTX 4090) porque el formato `.aimodel` no es portable a esos entornos.
- Compatibilidad consumer: orientado a Macs con Apple Silicon; no probado en iPhone ni iPad.
- Software: macOS/iOS 27.0+ y Xcode 27.0+ según la documentación general del runtime; la receta de Gemma indica iOS 27.2+. Aviso de compatibilidad: la prueba registró un error interno del compilador de Apple Neural Engine y avisos de reordenación en la primera carga, aunque el modelo cargó y respondió correctamente. Apple documenta además un problema de compilación AOT con Xcode 27.2 beta.
- Despliegue: runtime Swift `apple/coreai-models` con `llm-runner`; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Esta conversión (Gemma 4 E2B Core AI 4-bit, visión) | ~2,3B efectivos / ~5,1B con embeddings según upstream; sin recuento medido | 131.072 configurados, no probados a longitud completa | `.aimodel` Core AI | Apache 2.0 | Solo Apple Silicon; sin audio; validación de una prueba de humo |
| Variante texto de la misma conversión (`mikedoise/gemma-4-E2B-it-coreai-4bit-128k-text`) | Misma base | 131.072 configurados | `.aimodel` Core AI | Apache 2.0 | Sin codificador visual ni audio |
| `google/gemma-4-E2B-it` (upstream) | ~2,3B efectivos / ~5,1B con embeddings | No disponible en la información proporcionada | Checkpoint original de Google | Licencia Gemma 4 (enlace en la model card) | Referencia de calidad; requiere stack distinto al de esta conversión |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Validación mínima: una sola prueba de humo con imagen; no hay evaluación sistemática de calidad, sesgos ni alucinación.
- El contexto de 131.072 tokens está configurado pero no se ha probado a longitud completa; el comportamiento en los buckets largos es desconocido.
- El error interno del compilador ANE y los avisos de reordenación registrados en la primera carga impiden afirmar que la compilación o ejecución en ANE sea limpia, ni qué backend se usa efectivamente.
- No probado en iPhone ni iPad; la receta de Gemma exige iOS 27.2+.
- El bundle omite el codificador de audio y la cabeza de borrador para decodificación especulativa, por lo que no ofrece las capacidades de audio ni la aceleración por decodificación especulativa del modelo base.
- La etiqueta "4-bit" describe la receta, no todos los tensores: hay excepciones INT8 y tensores sin comprimir, lo que puede afectar a las estimaciones de memoria.
- El formato `.aimodel` no es portable: no funciona con Transformers, MLX, GGUF, llama.cpp, vLLM ni TGI, lo que limita su uso a aplicaciones Apple Silicon con el runtime Core AI.
- La licencia de los pesos es Apache 2.0, pero la model card enlaza la licencia de Gemma 4 de Google; conviene revisar ese documento antes de un uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés en esta conversión.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la señal de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikedoise/gemma-4-E2B-it-coreai-4bit-128k-vision
- Variante solo texto: https://huggingface.co/mikedoise/gemma-4-E2B-it-coreai-4bit-128k-text
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Receta Core AI Models para Gemma 4: https://github.com/apple/coreai-models/tree/22b0eaac4b325b812605a5096acff4880f1c4a36/models/gemma4
- Runtime Core AI Models: https://github.com/apple/coreai-models
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
