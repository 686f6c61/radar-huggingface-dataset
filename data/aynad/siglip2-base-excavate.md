# aynad/siglip2-base-excavate

## Resumen

`aynad/siglip2-base-excavate` es una reexportación optimizada en ONNX del modelo SigLIP 2 base (ViT-B/16, 224 px) de Google, derivada del export ONNX que Immich publicó a partir de los pesos OpenCLIP. El autor, `aynad`, la preparó para Excavate, una aplicación de búsqueda de imágenes en Windows, con el objetivo de reducir el peso de los ficheros y la memoria necesaria para ejecutar la búsqueda semántica en CPU mediante ONNX Runtime.

El modelo no introduce cambios arquitectónicos: mantiene el codificador visual y el codificador de texto de SigLIP 2 base, con salida de embeddings de 768 dimensiones y comparación por similitud coseno. La modificación se limita al almacenamiento de los pesos: el codificador visual guarda los pesos grandes en float16 con un `Cast` a float32 al cargar, y el codificador de texto aplica cuantización dinámica de ONNX Runtime únicamente a la tabla de embeddings de 256 000 tokens (`Gather`) en int8.

Su relevancia es práctica: reduce el codificador visual de 372 MB a 186 MB y el textual de 1129 MB a 540 MB, con una memoria de 628 MB en lugar de 1218 MB durante la búsqueda, manteniendo el mismo recall que el export de 32 bits (84,2 frente a 84,2 en una muestra de 700 imágenes). Es un artefacto de despliegue para búsqueda de imágenes y clasificación zero-shot en entornos sin GPU, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 base, ViT-B/16 con parche de 16 px y resolución de 224 px (codificador visual + codificador de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el texto se trunca a 64 tokens) |
| Tipos de cuantizacion | Pesos visuales en float16 con cast a float32; tabla de embeddings de texto (`Gather`) en int8 mediante cuantización dinámica; resto en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`visual/model.onnx`, `textual/model.onnx`) + `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es SigLIP 2 base de Google, un modelo de visión-lenguaje con dos torres: un Vision Transformer ViT-B/16 que procesa imágenes de 224 × 224 y un codificador de texto que procesa hasta 64 tokens. Ambos producen vectores de 768 dimensiones que se comparan por similitud coseno para clasificación zero-shot y búsqueda de imágenes. No se ha publicado en la información disponible el detalle del entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO); esa información corresponde a la model card de `google/siglip2-base-patch16-224`.

La innovación de esta ficha es exclusivamente de empaquetado. El codificador visual almacena cada peso grande como float16 y lo convierte a float32 al inicio del grafo, de modo que los cálculos son idénticos (vectores de imagen con similitud 0,999999 respecto al original). El codificador de texto cuantiza solo la operación `Gather` de la tabla de 256 000 tokens con `quantize_dynamic(..., op_types_to_quantize=["Gather"], weight_type=QuantType.QInt8)`. El autor probó cuantizar todos los pesos a int8 y descartó la opción: perdió un tercio de la precisión (38 frente a 68,6 en el conjunto completo de fotos). El preprocesado de imagen es RGB, redimensionado bicúbico a 224 × 224 sin preservar aspecto, escalado a 0–1 y normalizado con `(x − 0,5) / 0,5`; el texto se limpia siguiendo la canonicalización de OpenCLIP (entidades HTML, `_` a espacio, puntuación eliminada, minúsculas, espacios colapsados), se tokeniza con `tokenizer.json` y se rellena con 0 hasta 64 tokens.

## Capacidades

- Generación de embeddings de imagen de 768 dimensiones a partir de entradas RGB de 224 × 224.
- Generación de embeddings de texto de 768 dimensiones para consultas de hasta 64 tokens.
- Clasificación zero-shot de imágenes mediante comparación por similitud coseno entre embedding visual y etiquetas textuales.
- Búsqueda de imágenes por contenido semántico (texto a imagen) sobre índices de vectores precalculados.
- Ejecución en CPU con ONNX Runtime, sin requerir GPU.
- Capacidad multilingüe: no documentada en esta ficha; depende del tokenizador y del entrenamiento original de SigLIP 2, no verificado aquí.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre: es un modelo de representación, no un LLM.

## Casos de uso

- Búsqueda semántica de imágenes en aplicaciones de escritorio: indexar la fototeca local calculando el embedding visual de cada imagen y responder a consultas en lenguaje natural comparando con el embedding de texto; es el escenario original de Excavate en Windows y funciona en CPU.
- Clasificación zero-shot de fotos sin entrenamiento específico: definir categorías como "paisaje", "captura de pantalla" o "documento escaneado" y asignar la etiqueta con mayor similitud coseno, útil para organizar archivos automáticamente.
- Moderación y filtrado de contenido visual: comparar embeddings de imágenes subidas contra un conjunto de etiquetas o ejemplos de referencia para descartar contenido no deseado antes de publicarlo.
- Deduplicación y agrupación de imágenes: calcular embeddings de un corpus y agrupar por cercanía en el espacio vectorial para detectar duplicados o variantes de una misma imagen.
- Búsqueda multimodal en bases de datos de productos: indexar el catálogo por imagen y permitir consultas textuales del tipo "zapatillas rojas de running", con despliegue en servidores sin GPU gracias al formato ONNX.
- Etiquetado asistido de datasets: preetiquetar imágenes con un conjunto cerrado de clases antes de una revisión humana, reduciendo el coste de anotación en proyectos de visión.
- Filtrado de capturas de pantalla y documentos en pipelines de ingesta: distinguir capturas de Android o screenshots de fotografías reales, caso que el autor incluyó en su evaluación de recall.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son del autor, medidos sobre una muestra de 700 imágenes de Crossmodal-3600, pantallas de Android y capturas de pantalla:

| Metrica | Este modelo | Export de Immich (32 bits) |
|---|---|---|
| Recall en muestra de 700 imágenes | 84,2 | 84,2 |
| Memoria del codificador de texto durante la búsqueda | 628 MB | 1218 MB |
| Tamano de `visual/model.onnx` | 186 MB | 372 MB |
| Tamano de `textual/model.onnx` | 540 MB | 1129 MB |
| Precisión con cuantización int8 completa (descartada) | 38 (conjunto completo de fotos) | 68,6 (conjunto completo de fotos) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de embeddings visión-lenguaje.

## Requisitos de hardware

- VRAM: no requiere GPU; está diseñado para ejecución en CPU con ONNX Runtime. En GPU, el modelo completo en float32 ocuparía aproximadamente 1,5 GB de VRAM, aunque no se ha publicado una medición.
- Memoria RAM: el codificador de texto consume 628 MB durante la búsqueda según el autor; el codificador visual, con pesos float16, ocupa 186 MB en disco.
- GPU recomendadas: no aplica para el caso de uso previsto; cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría ejecutarlo, pero no hay datos de rendimiento publicados.
- Cabe en cualquier equipo de consumo: el tamaño del repositorio es de 0,8 GB y el diseño prioriza CPU.
- Opciones de despliegue: ONNX Runtime (principal), con posibles exportaciones a otros runtimes compatibles con ONNX; no se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `aynad/siglip2-base-excavate` | no disponible (ViT-B/16) | 64 tokens | ONNX (float16 + int8 selectivo) | Apache 2.0 | Optimizado para CPU, mismo recall que el export de 32 bits |
| `immich-app/ViT-B-16-SigLIP2__webli` | no disponible (ViT-B/16) | 64 tokens | ONNX float32 | Apache 2.0 | Export de referencia, el doble de tamaño y memoria |
| `google/siglip2-base-patch16-224` | no disponible (ViT-B/16) | 64 tokens | safetensors (PyTorch) | Apache 2.0 | Pesos originales de Google, requieren PyTorch |
| `openai/clip-vit-base-patch32` | no disponible (ViT-B/32) | 77 tokens | safetensors, ONNX | MIT | Alternativa CLIP clásica, parche de 32 px y menor resolución efectiva |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento; solo embeddings para similitud.
- El texto se trunca a 64 tokens, lo que limita consultas largas o descripciones muy detalladas.
- La imagen se redimensiona a 224 × 224 sin preservar el aspecto, lo que puede degradar la representación de imágenes muy alargadas o con detalle fino.
- La cuantización int8 completa se descartó por pérdida de precisión (38 frente a 68,6); no se recomienda reproducirla sin validar el recall en el dominio propio.
- Los sesgos del modelo original de SigLIP 2 no se documentan en esta ficha; al depender de los datos de entrenamiento de Google, pueden aparecer sesgos de representación cultural o de género en las etiquetas.
- Riesgo de falsos positivos en clasificación zero-shot cuando las etiquetas son semánticamente próximas; se recomienda calibrar umbrales de similitud coseno con datos propios.
- Los idiomas soportados no están documentados; el rendimiento multilingüe depende del tokenizador y del entrenamiento original, no verificado en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener el crédito a Google (pesos), a OpenCLIP y timm (pesos OpenCLIP) y a Immich (export ONNX), según indica el autor.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta; no hay validación comunitaria independiente del recall reportado.
- El autor solo modificó el almacenamiento de los pesos; cualquier problema de precisión o sesgo proviene del modelo base y no se corrige aquí.

## Enlaces

- HuggingFace: https://huggingface.co/aynad/siglip2-base-excavate
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Export ONNX de Immich: https://huggingface.co/immich-app/ViT-B-16-SigLIP2__webli
- OpenCLIP: https://github.com/mlfoundations/open_clip
