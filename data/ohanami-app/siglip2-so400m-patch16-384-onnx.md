# ohanami-app/siglip2-so400m-patch16-384-onnx

## Resumen

`ohanami-app/siglip2-so400m-patch16-384-onnx` es una conversión a formato ONNX de los codificadores de imagen y texto del modelo SigLIP 2 en su variante So400m, con parche de 16 píxeles y resolución de entrada de 384 x 384. El modelo original lo desarrolla Google (equipo de big_vision) y los pesos aquí publicados proceden de la conversión intermedia mantenida por `timm` (`timm/ViT-SO400M-16-SigLIP2-384`). La conversión la firma el proyecto Ohanami, una aplicación de escritorio de búsqueda local de capturas de pantalla que la utiliza para indexar imágenes y consultarlas en lenguaje natural.

Se trata de un modelo de embeddings imagen-texto (visión-lenguaje contrastivo), no de un modelo generativo: produce vectores de 1152 dimensiones L2-normalizados para imágenes y para textos, de modo que la similitud entre ambos se calcula como producto escalar (similitud coseno). Es relevante porque permite búsqueda semántica multimodal y clasificación zero-shot en local, sin depender de servicios en la nube, y porque la variante SigLIP 2 mejora la comprensión semántica, la localización y las capacidades multilingües respecto a SigLIP original.

La conversión no retrena, cuantiza ni modifica los pesos: los tensores permanecen en float32 y se exportan como dos grafos ONNX independientes con batch fijo de 1. El repositorio ocupa 4,6 GB y está pensado para descarga bajo demanda desde la aplicación, no como paquete ligero para integración genérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT (image encoder) + text encoder, entrenamiento contrastivo con pérdida sigmoide (SigLIP) |
| Parametros totales | 428.256.704 (encoder de imagen) + 707.782.898 (encoder de texto y proyección de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens de texto (truncado y padding fijo); imagen de 384 x 384 px |
| Tipos de cuantizacion | no disponible (los pesos exportados son float32; no se publican variantes cuantizadas) |
| Idiomas soportados | multilingüe (entrenado sobre WebLI); lista explícita de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 19, IR version 9); el encoder de texto usa datos externos (`model.onnx_data`) |

## Arquitectura y entrenamiento

El modelo original SigLIP 2 combina un codificador de imagen basado en Vision Transformer (ViT-SO400M, parche 16, entrada 384 x 384) con un codificador de texto, entrenados de forma contrastiva mediante una pérdida sigmoide sobre pares imagen-texto en lugar de softmax. Esta formulación, introducida en SigLIP (Zhai et al., 2023), evita la normalización global entre pares y facilita el entrenamiento a gran escala. SigLIP 2 (Tschannen et al., 2025) añade mejoras en comprensión semántica, localización y características densas, además de un tratamiento multilingüe más fuerte. El entrenamiento se realizó sobre el dataset WebLI de Google; el detalle exacto de tokens y composición debe consultarse en la model card original.

La conversión aquí publicada no altera los pesos: exporta dos grafos ONNX con PyTorch 2.6.0 (CPU) mediante el exportador TorchScript (`dynamo=False`), opset 19 e IR version 9. El batch está fijado a 1, la salida de cada grafo se normaliza L2 internamente y el preprocesado de imagen (redimensionado a 384 x 384 con `resize_mode: squash` bicúbico, escalado a 0..1 y normalización con media 0,5 y desviación 0,5 por canal) queda fuera del grafo, a cargo del llamador. El texto se limpia con `canonicalize` de open_clip (minúsculas, puntuación eliminada, espacios colapsados), se tokeniza con BPE, se añade `<eos>`, se trunca a 64 tokens y se rellena con `<pad>`.

## Capacidades

- Generación de embeddings de imagen: vector float32 de 1152 dimensiones L2-normalizado a partir de una imagen RGB de 384 x 384.
- Generación de embeddings de texto: vector float32 de 1152 dimensiones L2-normalizado a partir de una cadena de hasta 64 tokens.
- Similitud imagen-texto mediante producto escalar (equivalente a similitud coseno por la normalización interna).
- Búsqueda semántica multimodal: recuperación de imágenes por consulta textual y viceversa.
- Clasificación zero-shot de imágenes mediante comparación con embeddings de etiquetas textuales.
- Capacidades multilingües heredadas de SigLIP 2 (sin lista explícita de idiomas publicada en esta conversión).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de extracción de características, no generativo.
- No incluye modo thinking, visión generativa, audio ni salida de texto libre.

## Casos de uso

- Búsqueda local de capturas de pantalla: indexar una biblioteca de imágenes calculando embeddings con el encoder visual y resolver consultas en lenguaje natural comparando con el embedding del texto; es el caso para el que se creó esta conversión (app Ohanami).
- Búsqueda semántica en catálogos de imágenes: generar embeddings de un corpus de fotos de producto y permitir consultas como "zapatillas rojas para correr" sin etiquetas manuales, aprovechando la alineación imagen-texto.
- Moderación y filtrado por similitud: comparar imágenes entrantes con embeddings de textos descriptivos de categorías prohibidas para un primer cribado automático antes de revisión humana.
- Organización automática de fototecas: agrupar imágenes por similitud coseno entre sus embeddings para detección de duplicados o clustering temático sin metadatos.
- Clasificación zero-shot en pipelines de datos: asignar etiquetas a imágenes nuevas comparando su embedding con el de cada etiqueta textual, útil cuando no hay un clasificador entrenado específico.
- Recuperación multimodal en aplicaciones de escritorio: integrar los dos grafos ONNX con ONNX Runtime (probado con la versión 1.31 sobre CUDA) para búsqueda de imágenes sin conexión y sin enviar datos a la nube.
- Análisis de accesibilidad: generar descripciones candidatas o etiquetas para imágenes comparando contra un vocabulario controlado de términos, como paso previo a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye métricas (ImageNet zero-shot, retrieval, etc.) y remite a la model card del modelo original para los datos de evaluación. Tampoco se publican cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 suman aproximadamente 4,5 GB en total (1,71 GB el encoder visual y 2,83 GB el de texto con datos externos); se recomienda al menos 6 GB de VRAM para cargar ambos grafos en GPU con margen para activaciones.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM; el autor indica que los ficheros se probaron con ONNX Runtime 1.31 sobre el execution provider CUDA.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090). También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA). No se publican artefactos para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ohanami-app/siglip2-so400m-patch16-384-onnx | 428 M (imagen) + 708 M (texto) | 64 tokens de texto; imagen 384 x 384 | Apache 2.0 | ONNX (float32) | Conversión no oficial de SigLIP 2 So400m; batch fijo 1 |
| timm/ViT-SO400M-16-SigLIP2-384 | mismos pesos originales | 64 tokens de texto; imagen 384 x 384 | Apache 2.0 | safetensors / PyTorch (vía timm) | Modelo base del que se exporta esta conversión |
| Conversión ONNX de SigLIP 2 del proyecto Immich | no disponible | no disponible | no disponible | ONNX | El autor indica que el encoder de imagen es byte-idéntico al de este repositorio |
| SigLIP original (Zhai et al., 2023) | no disponible | no disponible | no disponible | no disponible | Predecesor; SigLIP 2 mejora semántica, localización y multilingüismo |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings. No debe evaluarse con benchmarks de generación.
- Los sesgos y limitaciones del modelo original (entrenado sobre WebLI) se heredan íntegramente; consúltense en la model card de `timm/ViT-SO400M-16-SigLIP2-384`.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de recuperaciones irrelevantes por similitud coseno en dominios alejados de los datos de entrenamiento.
- Límite estricto de 64 tokens de texto: consultas más largas se truncan, lo que puede degradar la precisión de la búsqueda.
- El preprocesado de imagen no está incluido en el grafo; un preprocesado incorrecto (por ejemplo, mantener el aspecto en lugar de `squash`) altera los embeddings y la calidad de la recuperación.
- Batch fijo de 1: no admite procesamiento por lotes sin reexportar los grafos, lo que limita el throughput en indexación masiva.
- La conversión no es una publicación oficial de Google ni implica su respaldo; el autor lo indica expresamente.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE` con la atribución correspondiente.
- El repositorio depende de la app Ohanami para su uso previsto; el script de conversión y el código fuente aún no estaban publicados en el momento de redactar esta ficha, según la propia model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ohanami-app/siglip2-so400m-patch16-384-onnx
- Modelo base en timm: https://huggingface.co/timm/ViT-SO400M-16-SigLIP2-384
- Paper SigLIP 2 (2025): https://arxiv.org/abs/2502.14786
- Paper SigLIP (2023): https://arxiv.org/abs/2303.15343
- Código original big_vision: https://github.com/google-research/big_vision
