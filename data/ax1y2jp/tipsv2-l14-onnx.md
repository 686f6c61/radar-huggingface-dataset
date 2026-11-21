# AX1Y2JP/tipsv2-l14-ONNX

## Resumen

tipsv2-l14-ONNX es la exportación a formato ONNX del modelo `google/tipsv2-l14`, un codificador dual imagen-texto de tipo contrastivo desarrollado originalmente por Google. Este repositorio, publicado por el usuario AX1Y2JP, no entrena un modelo nuevo: convierte los dos codificadores (visión y texto) en grafos ONNX independientes y añade variantes cuantizadas en fp16 e int8, lo que permite ejecutar el modelo fuera del ecosistema PyTorch, por ejemplo con ONNX Runtime en CPU, CUDA o entornos embebidos.

El modelo resuelve tareas de clasificación de imágenes zero-shot y extracción de características multimodales: al proyectar imágenes y descripciones textuales a un espacio compartido, permite puntuar la afinidad entre ambas modalidades sin reentrenamiento. La arquitectura es un transformer de visión con parches de 14 píxeles (la "l14" del nombre) emparejado con un codificador de texto, ambos de tamaño base, con una dimensión de entrada de 448×448 píxeles según el ejemplo de uso de la model card.

Su relevancia actual es práctica: ofrece una alternativa de despliegue ligera y portable para pipelines de visión-lenguaje que necesitan inferencia sin dependencias de PyTorch, con licencia Apache 2.0 y pesos en fp32, fp16 e int8. El repositorio ocupa 3,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (codificador de visión + codificador de texto), aprendizaje contrastivo imagen-texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (truncado y padding fijados en el ejemplo de la model card) |
| Tipos de cuantizacion | fp32, fp16 (pesos fp16 con E/S float32), int8 (weight-only `MatMulNBits`, embedding de tokens int8 por filas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opsets 23, requiere ONNX Runtime 1.22+) |

## Arquitectura y entrenamiento

El modelo base `google/tipsv2-l14` es un sistema de alineación imagen-texto con dos torres: un codificador visual que procesa la imagen en parches de 14×14 píxeles y un codificador de texto que procesa las descripciones. Cada torre produce un embedding que se normaliza y se compara mediante producto escalar multiplicado por un `logit_scale` (inverso de la temperatura) almacenado en los metadatos del grafo ONNX. La exportación separa ambos codificadores en grafos independientes, de modo que la imagen y el texto se pueden codificar por separado y cachear.

La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información corresponde al modelo original de Google y no se reproduce en este repositorio. La modificación técnica introducida por la exportación es que la interpolación de los embeddings posicionales se ejecuta siempre, lo que hace dinámico el tamaño de entrada de imagen (cualquier alto y ancho múltiplo de 14 hasta 1792, con resultado idéntico al original a 448×448). El resto del cómputo se mantiene sin cambios respecto al modelo de referencia.

## Capacidades

- Clasificación de imágenes zero-shot: puntúa etiquetas textuales arbitrarias contra una imagen sin entrenamiento específico.
- Extracción de características visuales y textuales en un espacio latente compartido.
- Búsqueda y recuperación imagen-texto mediante similitud de embeddings normalizados.
- Procesamiento de imágenes de resolución variable (múltiplos de 14, hasta 1792 píxeles).
- Inferencia portable vía ONNX Runtime con ejecución en CPU y GPU (CUDA).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de representación, no generativo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Moderación y etiquetado automático de imágenes: clasificar contenido en categorías definidas en tiempo de inferencia sin reentrenar, aprovechando la clasificación zero-shot.
- Búsqueda visual en catálogos de producto: indexar embeddings de imágenes y consultar con descripciones textuales mediante similitud coseno.
- Filtrado previo en pipelines de datos: descartar o priorizar imágenes según criterios textuales antes de pasarlas a modelos generativos más costosos.
- Despliegue en entornos sin PyTorch: usar las variantes ONNX en servicios con ONNX Runtime, contenedores ligeros o hardware con soporte limitado de frameworks de deep learning.
- Deduplicación y agrupación semántica de imágenes: calcular embeddings y agrupar por cercanía en el espacio latente.
- Verificación de coherencia imagen-texto: comprobar si una imagen y su pie de foto o metadatos son consistentes, útil en control de calidad de datasets.
- Inferencia en CPU con cuantización int8: escenarios de bajo coste donde no hay GPU disponible y se acepta una pérdida de precisión moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (ImageNet zero-shot, retrieval, etc.) ni comparaciones con el modelo original en fp32.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 3,5 GB, por lo que la variante fp16 requiere del orden de 1-2 GB de memoria para los pesos y la int8 aproximadamente la mitad, sin contar activaciones.
- GPU recomendadas: no especificadas; cualquier GPU con soporte CUDA y ONNX Runtime (por ejemplo, RTX 3090, RTX 4090, A100) puede ejecutar la variante fp16.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM para fp16; la variante int8 está pensada para CPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider); requiere ONNX Runtime 1.22 o superior por el uso de opset 23.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tipsv2-l14-ONNX | no disponible | 64 tokens | Apache 2.0 | ONNX (fp32/fp16/int8) | Exportación comunitaria; sin benchmarks publicados |
| google/tipsv2-l14 | no disponible | no disponible | Apache 2.0 (según modelo base) | PyTorch/safetensors | Modelo original de Google; referencia de comportamiento |
| CLIP ViT-L/14 (OpenAI) | ~428 M | 77 tokens | MIT (pesos) | PyTorch, ONNX comunitario | Alternativa madura con benchmarks públicos amplios |
| SigLIP base (Google) | no disponible | no disponible | Apache 2.0 | PyTorch, ONNX comunitario | Familia contrastiva posterior; requiere verificación de variante concreta |

La comparación cuantitativa de rendimiento no está disponible porque este repositorio no publica métricas.

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede verificar que la exportación ONNX reproduzca exactamente la precisión del modelo original, especialmente en int8.
- La cuantización int8 es weight-only y puede degradar la calidad de los embeddings; conviene validarla en el dominio de uso concreto.
- El truncado de texto a 64 tokens limita descripciones largas; etiquetas más extensas se recortan.
- Riesgo de sesgos heredados del dataset de entrenamiento del modelo base, no documentado en este repositorio.
- El modelo no genera texto: no debe usarse para tareas generativas, razonamiento ni agentes.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Repositorio sin descargas ni validación comunitaria: tratar como exportación no auditada.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base `google/tipsv2-l14`.
- Dependencia de ONNX Runtime 1.22+ por el opset 23; versiones anteriores fallarán al cargar los grafos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AX1Y2JP/tipsv2-l14-ONNX
- Modelo base: https://huggingface.co/google/tipsv2-l14
- ONNX Runtime: https://onnxruntime.ai/
- Documentación de ONNX: https://onnx.ai/
