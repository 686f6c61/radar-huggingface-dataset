# antonlnz/siglip2-so400m-image-coreml-batch8

## Resumen

Este repositorio contiene una conversión a Core ML de la torre de imagen del modelo SigLIP2-so400m de Google (concretamente `google/siglip2-so400m-patch14-384`). No se ha reentrenado ni modificado ningún peso: el autor indica explícitamente que los pesos son los de Google sin tocar y que únicamente ha cambiado el formato. La conversión parte de la exportación ONNX `onnx-community/siglip2-so400m-patch14-384-ONNX` (`vision_model_fp16.onnx`), procesada con `onnx2torch` y `coremltools` 9. El resultado es un paquete Core ML en fp16 con un lote fijo de 8 imágenes por llamada, pensado para aprovechar al máximo la GPU de los chips Apple Silicon.

La relevancia de esta ficha es acotada pero clara: se trata de un artefacto de despliegue, no de un modelo nuevo. Resuelve el problema de ejecutar el codificador visual de SigLIP2 de forma eficiente en macOS sin depender de ONNX Runtime ni de PyTorch, con una latencia de 166 ms por imagen en lotes de 8 sobre un M2 Pro (frente a 204 ms por imagen del paquete de lote 1). El tamaño del repositorio es de 0,9 GB y la licencia es Apache 2.0.

Hay que subrayar que este paquete contiene únicamente la torre de imagen. La salida es un vector de características agrupadas (pooled) de 1152 dimensiones por imagen. Para tareas de recuperación texto-imagen se necesita por separado la torre de texto del modelo base, que no está incluida aquí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) correspondiente a la torre de imagen de SigLIP2-so400m; conversión de formato, sin cambios estructurales |
| Parámetros totales | Aproximadamente 400 M (derivado de la nomenclatura so400m del modelo base; no se detalla el recuento exacto en la información proporcionada) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (codificador de imagen, no modelo de lenguaje) |
| Tipos de cuantización | FP16 en Core ML; el modelo base dispone de exportación ONNX en fp16 |
| Idiomas soportados | No disponible en este artefacto: solo contiene la torre de imagen y no procesa texto. El modelo base SigLIP2 está diseñado para recuperación multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage / .mlmodelc), FP16; repositorio de 0,9 GB |
| Dimensión de salida | 1152 (embedding pooled, sin normalizar) |
| Entrada | `pixel_values` float32 `[8, 3, 384, 384]`, normalizado como `(x/255 − 0,5)/0,5` |
| Tamaño de lote | Fijo en 8 imágenes por llamada |
| Modelo base | google/siglip2-so400m-patch14-384 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SigLIP2, una familia de codificadores visión-lenguaje de Google entrenados con pérdida sigmoide (SigLIP) en lugar de softmax contrastivo. La variante so400m emplea un Vision Transformer con tamaño oculto 1152 (coincide con la dimensión de embedding de salida documentada), parches de 14×14 y resolución de entrada de 384×384. Este repositorio no introduce ninguna innovación de entrenamiento: es una conversión de formato del `vision_model_fp16.onnx` original, realizada con `onnx2torch` y `coremltools` 9.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que la información proporcionada no incluye la model card del modelo base. La única particularidad técnica destacable del artefacto es que mantiene la rejilla de parches de 378×378 de la esquina superior izquierda (es decir, recorta los píxeles sobrantes de la entrada de 384×384), replicando el comportamiento de la exportación ONNX. El lote está fijado en 8 y los lotes parciales deben rellenarse con ceros y descartar las filas sobrantes.

## Capacidades

- Extracción de características visuales: genera un embedding agrupado de 1152 dimensiones por imagen.
- Recuperación texto-imagen (retrieval): se obtuvieron resultados idénticos en top-3 y top-10 frente a la exportación ONNX en las pruebas del autor, aunque requiere la torre de texto de SigLIP2 por separado.
- Procesamiento por lotes de 8 imágenes a 384×384 de entrada (378×378 efectivos).
- Clasificación y comparación de imágenes mediante similitud en el espacio de embeddings.
- No genera texto ni código.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades de audio ni de vídeo nativas (procesa fotogramas individuales).

## Casos de uso

- Búsqueda semántica local sobre archivos de vídeo personales en macOS: es el caso para el que se construyó el paquete, ya que genera embeddings de fotogramas con baja latencia en Apple Silicon y permite consultas de recuperación sin enviar datos a la nube.
- Indexación de fototecas: extraer embeddings de 1152 dimensiones de grandes colecciones de imágenes y almacenarlos en una base de datos vectorial para búsqueda posterior por similitud.
- Deduplicación y agrupación de imágenes: comparar embeddings para detectar imágenes repetidas o agrupar por contenido visual en lugar de por metadatos.
- Sistemas de recomendación visual: calcular la similitud entre un elemento de referencia y un catálogo para sugerir contenido relacionado.
- Clasificación zero-shot: asociar etiquetas textuales a prototipos vectoriales y clasificar imágenes por proximidad, útil en pipelines donde no se dispone de un clasificador entrenado específico.
- Curación de datasets de entrenamiento: filtrar o agrupar grandes volúmenes de imágenes por características visuales antes de etiquetarlas manualmente.
- Organización automática en aplicaciones de escritorio: integrar el paquete Core ML en una app macOS para clasificar y ordenar bibliotecas multimedia en tiempo de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ImageNet, etc.) en la información disponible. El autor únicamente reporta métricas de fidelidad frente a la exportación ONNX:

| Métrica | Valor |
|---|---|
| Similitud coseno media (frente a ONNX, 31 fotogramas de 4 vídeos) | 1,0000 |
| Similitud coseno mínima | 0,9999 |
| Coincidencia top-3 en recuperación texto-imagen | Idéntica a ONNX |
| Coincidencia top-10 en recuperación texto-imagen | Idéntica a ONNX |
| Latencia en lote de 8 (M2 Pro, GPU) | 166 ms por imagen |
| Latencia con paquete batch-1 (M2 Pro, GPU) | 204 ms por imagen |

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon (M1, M2, M3, M4 o posteriores) con macOS y soporte Core ML.
- Pesos en disco: 0,9 GB en fp16.
- Memoria unificada: los pesos ocupan aproximadamente 0,9 GB; se recomienda reservar al menos 2 GB para pesos y activaciones del lote de 8 a 384×384.
- GPU: se ejecuta en la GPU integrada de los chips Apple Silicon; el autor reporta 166 ms por imagen en un M2 Pro.
- Throughput estimado: alrededor de 6 imágenes por segundo en lotes de 8 (derivado de 166 ms por imagen) y aproximadamente 4,9 imágenes por segundo con el paquete de lote 1.
- GPU NVIDIA: este artefacto concreto no es compatible, al ser Core ML; el modelo base puede ejecutarse en GPU NVIDIA a través de las exportaciones ONNX o PyTorch.
- Opciones de despliegue: Core ML mediante `coremltools`, Xcode o Swift; no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Lote | Latencia (M2 Pro, GPU) | Licencia |
|---|---|---|---|---|---|
| antonlnz/siglip2-so400m-image-coreml-batch8 | Torre de imagen SigLIP2-so400m | Core ML fp16 | 8 | 166 ms/imagen | Apache 2.0 |
| Paquete Core ML batch-1 del mismo autor | Torre de imagen SigLIP2-so400m | Core ML fp16 | 1 | 204 ms/imagen | Apache 2.0 |
| onnx-community/siglip2-so400m-patch14-384-ONNX | Torre de imagen SigLIP2-so400m | ONNX fp16 | No disponible | No disponible | Apache 2.0 (modelo base) |
| google/siglip2-so400m-patch14-384 | Modelo completo (torres de imagen y texto) | safetensors / PyTorch | Variable | No disponible | Apache 2.0 |

No se dispone de datos de rendimiento en benchmarks públicos para estos artefactos en la información proporcionada, por lo que la comparación se limita a formato, tamaño de lote, latencia medida y licencia.

## Limitaciones y advertencias

- Solo torre de imagen: no incluye la torre de texto, por lo que no puede realizar recuperación texto-imagen por sí solo sin el componente complementario de SigLIP2.
- Lote fijo de 8: cualquier lote parcial debe rellenarse con ceros y descartar las filas sobrantes, lo que añade complejidad al código de integración.
- Resolución y recorte fijos: la entrada es 384×384 y el modelo conserva la rejilla de 378×378 de la esquina superior izquierda, replicando el comportamiento del export ONNX; no admite otras resoluciones.
- Embeddings sin normalizar: la salida de 1152 dimensiones no está normalizada, por lo que hay que normalizarla manualmente antes de calcular similitudes coseno.
- Pérdida de precisión por fp16: la similitud coseno mínima reportada es 0,9999, no 1,0, por lo que existe una desviación numérica mínima frente a la referencia ONNX.
- Dependencia de plataforma: requiere Apple Silicon y Core ML; no es portable a GPU NVIDIA ni a entornos Linux sin reconversión.
- Sesgos: no se documentan en la información disponible; al derivar del modelo base SigLIP2, hereda los sesgos de su dataset de entrenamiento, no auditados aquí.
- Riesgo de alucinación: no aplica de forma directa al no generar texto, pero las similitudes pueden producir coincidencias incorrectas en tareas de recuperación si los embeddings no discriminan bien ciertas categorías.
- Idiomas: el artefacto no declara idiomas soportados y no procesa texto; la cobertura multilingüe depende de la torre de texto del modelo base.
- Validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación externa más allá de las pruebas del autor.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de desplegarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/antonlnz/siglip2-so400m-image-coreml-batch8
- Modelo base: https://huggingface.co/google/siglip2-so400m-patch14-384
- Exportación ONNX de origen: https://huggingface.co/onnx-community/siglip2-so400m-patch14-384-ONNX
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Documentación de Core ML: https://developer.apple.com/documentation/coreml
- Repositorio de coremltools: https://github.com/apple/coremltools
