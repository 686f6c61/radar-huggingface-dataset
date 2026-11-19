# faecc/clip-text-onnx

## Resumen

`faecc/clip-text-onnx` es un bundle ONNX de la torre de texto del modelo CLIP ViT-B/32 de OpenAI (`openai/clip-vit-base-patch32`), exportado por el usuario `faecc`. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de formato: toma los pesos del text encoder de CLIP y los empaqueta en un grafo ONNX con pesos externos en FP16, pensado para ser consumido por una herramienta concreta denominada "Tessera sampler". El repositorio ocupa aproximadamente 0,1 GB y se publicó en noviembre de 2026.

El modelo resuelve un problema de despliegue: permitir la extracción de embeddings de texto compatibles con el espacio latente de CLIP sin depender de PyTorch ni de la librería Transformers, usando únicamente ONNX Runtime. La interfaz expone `input_ids` y `attention_mask` (int64, longitud fija de 24 tokens) y devuelve `last_hidden_state` (float32, `[batch,24,512]`) y `pooler_output` (float32, `[batch,512]`).

Su relevancia es acotada: es un artefacto de infraestructura para pipelines que ya usan CLIP como encoder multimodal, no un modelo de propósito general. La información pública es muy escasa (0 descargas, 0 likes, sin licencia declarada, sin idiomas declarados y sin benchmarks propios), por lo que muchas de las secciones siguientes se limitan a lo que la model card documenta explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto de CLIP ViT-B/32) exportada a ONNX |
| Parametros totales | no disponible (el text tower de CLIP ViT-B/32 ronda los 63 M, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 24 tokens (forma fija `[batch,24]` en `input_ids` y `attention_mask`) |
| Tipos de cuantizacion | FP16 en pesos y computo interno; entradas y salidas públicas en FP32 e int64 |
| Idiomas soportados | no disponible (CLIP se entrena con pares imagen-texto en inglés, pero el autor no lo declara) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`clip-text-states-fp16.onnx`) con datos externos en 9 shards `.bin` y manifiesto JSON |

## Arquitectura y entrenamiento

La arquitectura subyacente es el text encoder de CLIP ViT-B/32: un transformer con embedding de tokens, atención multi-cabeza y proyección a un espacio compartido de 512 dimensiones con la torre de visión. El autor no aporta detalles sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO), porque no ha reentrenado el modelo: se limita a exportar los pesos de `openai/clip-vit-base-patch32`.

La innovación técnica del repositorio es puramente de empaquetado. El grafo ONNX se acompaña de nueve ficheros `.bin` de datos externos y un `clip-text-manifest.json` que contiene metadatos, IDs de tokens de referencia, checksums de los shards y métricas de validación. La validación reportada compara las salidas de ONNX Runtime en CPU con el modelo original de Transformers sobre tres prompts, obteniendo una similitud coseno media superior a 0,999999 en ambas salidas. El checker oficial de ONNX pasó correctamente.

## Capacidades

- Extracción de embeddings de texto: genera `last_hidden_state` y `pooler_output` en el espacio latente de CLIP (512 dimensiones), utilizables para alineación texto-imagen.
- Integración con el "Tessera sampler": el autor indica explícitamente que los dos outputs son los que necesita ese componente.
- Ejecución sin PyTorch: al ser ONNX, puede correr sobre ONNX Runtime (CPU o GPU) sin dependencias de Transformers.
- Inferencia en FP16 con E/S FP32: reduce el peso en memoria manteniendo precisión numérica en la interfaz.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder de features, no un modelo generativo.
- Capacidades multilingües: no declaradas por el autor.

## Casos de uso

- Búsqueda multimodal texto-a-imagen: calcular el embedding de una consulta textual con este bundle y compararlo por similitud coseno contra embeddings de imagen previamente indexados, todo dentro de ONNX Runtime.
- Filtrado y clasificación zero-shot de imágenes: usar los embeddings de texto de las etiquetas candidatas como prototipos y asignar la clase más próxima a cada imagen.
- Despliegue en entornos sin PyTorch: servicios en contenedores mínimos o runtimes embebidos donde instalar Transformers y torch no es viable, gracias al grafo ONNX autocontenido.
- Integración en el pipeline del Tessera sampler: el caso de uso declarado por el autor, que consume directamente `last_hidden_state` y `pooler_output`.
- Preprocesado de datasets de investigación: generar embeddings de texto de 512 dimensiones en lote para análisis de alineación multimodal o estudios de sesgo en representaciones.
- Prototipado de sistemas de recomendación visual: representar descripciones de producto en el espacio CLIP y recuperar imágenes candidatas por vecindad.
- Validación de pipelines de exportación: servir como referencia para verificar que una conversión ONNX de CLIP reproduce fielmente el modelo original, dado el manifiesto con checksums y métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada por el autor es la similitud coseno media (>0,999999) entre las salidas ONNX y las del modelo original de Transformers sobre tres prompts, que mide fidelidad de la exportación, no calidad de la representación.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa unos 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer; con FP16 el consumo es de unos pocos cientos de MB incluyendo overhead de ONNX Runtime.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o DirectML); para lotes grandes conviene una RTX 3060 o superior, aunque el cuello de botella será el tamaño de lote, no el modelo.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 1-2 GB de VRAM libre, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), con los shards `.bin` referenciados como datos externos según el manifiesto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| faecc/clip-text-onnx | no disponible | 24 tokens | ONNX + shards FP16 | no disponible | Export de la torre de texto de CLIP ViT-B/32 |
| openai/clip-vit-base-patch32 | no disponible en la informacion | 77 tokens (configuración estándar de CLIP) | PyTorch (safetensors/bin) | no disponible en la informacion | Modelo original del que deriva este export |
| Otros exports ONNX de CLIP | no disponible | no disponible | ONNX | variable | No se dispone de datos concretos para comparar |

La comparación relevante es contra el modelo original: este bundle fija la longitud de entrada en 24 tokens (frente a los 77 habituales de CLIP) y limita la salida a los dos tensores que necesita el Tessera sampler, lo que reduce flexibilidad pero simplifica el despliegue.

## Limitaciones y advertencias

- Longitud de contexto fija de 24 tokens: cualquier texto más largo debe truncarse, lo que degrada la representación de frases largas.
- Interfaz restringida: solo expone `last_hidden_state` y `pooler_output`; no hay logits, atención ni otras salidas.
- Licencia no declarada: no se puede asumir uso comercial sin verificar la licencia del modelo original de OpenAI y la del propio repositorio.
- Idiomas no declarados: CLIP se entrena principalmente con texto en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Sin benchmarks de calidad: la única validación es de fidelidad numérica sobre tres prompts, insuficiente para garantizar comportamiento en producción.
- Riesgo de sesgo y alucinación: heredado del modelo original de CLIP; los embeddings pueden reflejar sesgos de los datos de entrenamiento y producir recuperaciones semánticamente erróneas.
- Mantenimiento incierto: 0 descargas y 0 likes en el momento de la consulta, sin señales de soporte de la comunidad.
- Dependencia del manifiesto: los shards `.bin` deben cargarse con las rutas y checksums del `clip-text-manifest.json`; un empaquetado incorrecto rompe la carga del grafo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/faecc/clip-text-onnx
- Modelo original: https://huggingface.co/openai/clip-vit-base-patch32
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- No se han encontrado en la búsqueda web papers, blogs, repos adicionales ni demos específicos de este bundle.
