# immanuelpeter/MiniMax-M3.1-Flash-Vision

## Resumen

MiniMax-M3.1-Flash Vision es un paquete de pesos que aísla el componente de visión (Tower y Projector) del modelo multimodal MiniMax-M3.1-Flash, publicado originalmente por MiniMaxAI. El repositorio, mantenido por el usuario immanuelpeter, extrae únicamente el codificador de imágenes y el proyector multimodal del checkpoint padre, sin incluir el modelo de lenguaje. Su propósito es permitir la extracción de características visuales de forma independiente, con un pipeline declarado de `image-feature-extraction`.

El modelo resuelve un problema práctico de ingeniería: reutilizar el front-end visual de un VLM grande sin cargar los pesos completos del modelo de lenguaje, lo que facilita tareas de indexación de imágenes, preprocesado en pipelines multimodales o investigación sobre representaciones visuales. El paquete contiene 631.185.920 parámetros totales (515 tensores del Tower más 8 tensores del Projector), con un tamaño de repositorio de 1,7 GB.

Es relevante ahora porque los VLM de gran escala se distribuyen habitualmente como checkpoints monolíticos, y la separación modular del codificador visual permite desplegarlo en hardware mucho más modesto. No obstante, se trata de un artefacto derivado, no de un modelo entrenado de forma independiente: su calidad depende enteramente del checkpoint padre MiniMax-M3.1-Flash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Tower) con proyector MLP; clase `MiniMaxM3VLVisionModel` |
| Parametros totales | 631.185.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors con dtypes originales) |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (MiniMax Community License); código auxiliar MIT |
| Formato de pesos | safetensors (`model.safetensors`, `projector.safetensors`) |

Detalles adicionales de la arquitectura del Tower: 32 capas, dimensión oculta 1280, 16 cabezas de atención, dimensión intermedia 5120, patch size 14, RoPE 3D, tamaño de imagen 672. Compresión de tokens 2x2 espacial con patch temporal de tamaño 2.

## Arquitectura y entrenamiento

El componente Tower es un transformer de visión de 32 capas con 1280 dimensiones ocultas y 16 cabezas de atención, que procesa parches de 14 píxeles con RoPE tridimensional (lo que permite modelar posición espacial y temporal). Aplica una compresión de tokens mediante fusión espacial 2x2 y un patch temporal de tamaño 2; las imágenes estáticas se duplican como dos fotogramas para alimentar el embedding temporal. El Projector es un MLP con la secuencia `Linear(1280, 6144)`, GELU, `Linear(6144, 6144)`, aplanado de cuatro parches de 6144 dimensiones, `Linear(24576, 6144)`, GELU y `Linear(6144, 6144)`, que proyecta las características visuales al espacio del modelo de lenguaje del checkpoint padre.

No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El repositorio no entrena el modelo: exporta los tensores del checkpoint padre MiniMax-M3.1-Flash conservando sus dtypes originales. La validación declarada consiste en una comprobación de paridad que compara los 515 tensores del Tower y los 8 del Projector con el checkpoint padre fijado mediante `torch.equal`, y verifica que las salidas del Tower, la versión fusionada y la proyectada coinciden con la implementación nativa a 56 y 448 píxeles.

## Capacidades

- Extracción de características visuales de imágenes mediante el Tower y el Projector.
- Generación de embeddings proyectados en el espacio del modelo de lenguaje padre (dimensión 6144).
- Procesamiento de imágenes con tamaño nativo de 672 píxeles y parches de 14.
- Soporte de compresión espacial 2x2 y temporal de parches para reducir el número de tokens visuales.
- Integración con la librería `transformers` (clase `MiniMaxM3VLVisionModel`).
- No incluye generación de texto, razonamiento, código, matemáticas ni tool calling: el modelo de lenguaje no forma parte de este repositorio.
- No se documentan capacidades multilingües, de audio ni modos de pensamiento.

## Casos de uso

- Indexación y búsqueda visual: extraer embeddings de un corpus de imágenes con el Tower y el Projector para construir un índice vectorial y realizar búsqueda por similitud, sin necesidad de cargar el VLM completo.
- Preprocesado en pipelines multimodales: usar el paquete como front-end visual de un sistema que combine estas características con un LLM independiente, manteniendo el componente de visión aislado y versionado.
- Investigación sobre representaciones visuales: analizar las activaciones de las 32 capas del Tower o la salida proyectada de 6144 dimensiones para estudiar cómo se codifica la información espacial y temporal.
- Clasificación y etiquetado de imágenes por transferencia: congelar el Tower y entrenar una cabeza ligera sobre las características extraídas para tareas de clasificación específicas de dominio.
- Detección de duplicados y near-duplicates: comparar embeddings proyectados para identificar imágenes repetidas o visualmente similares en grandes catálogos.
- Despliegue en hardware modesto: al pesar 1,7 GB y no incluir el modelo de lenguaje, el codificador visual puede ejecutarse en GPUs de consumo para tareas de extracción por lotes.
- Validación de paridad en pipelines de migración: usar el script de exportación y las comprobaciones de paridad como referencia para verificar que una implementación propia reproduce el comportamiento del checkpoint padre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es la comprobación de paridad de tensores y salidas frente al checkpoint padre a 56 y 448 píxeles, que no constituye una evaluación de rendimiento en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,7 GB en precisión original (el repositorio ocupa 1,7 GB); alrededor de 0,7-1 GB si se convierte a FP16/BF16, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 4090, A100 o H100 ofrecen margen sobrado y mayor throughput en procesamiento por lotes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: `transformers` (librería declarada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada. La documentación advierte que debe procesarse una imagen por llamada, porque la atención nativa de HF acopla las imágenes en una misma llamada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash Vision (este) | 631 M (solo visión) | no aplica | Extracción de características visuales | minimax-community | Hugging Face |
| MiniMaxAI/MiniMax-M3.1-Flash (padre) | no disponible | no disponible | VLM completo (visión + lenguaje) | minimax-community | Hugging Face |
| CLIP ViT-L/14 | ~428 M | no aplica | Embeddings imagen-texto | MIT (variante OpenAI) | Hugging Face |
| SigLIP | ~400 M (variantes base) | no aplica | Embeddings imagen-texto | Apache 2.0 (variantes) | Hugging Face |

La comparación con CLIP y SigLIP es aproximada: ambos son codificadores visuales de tamaño similar, pero entrenados con objetivos contrastivos imagen-texto, mientras que este paquete es un extractor de características de un VLM generativo. No se dispone de datos de rendimiento comparativo para establecer una evaluación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: carece del modelo de lenguaje, por lo que no puede generar texto ni responder preguntas; solo produce características visuales.
- Artefacto derivado: la calidad y los sesgos dependen íntegramente del checkpoint padre MiniMax-M3.1-Flash, sobre el que no se documentan detalles de entrenamiento en esta ficha.
- Restricciones de licencia: se rige por la MiniMax Community License, que puede imponer condiciones al uso comercial; es necesario revisar `LICENSE` antes de desplegar en producción. El código auxiliar es MIT.
- Procesamiento de una imagen por llamada: la atención nativa de HF acopla las imágenes en una misma llamada, lo que limita el batching directo y puede afectar al throughput.
- Idiomas no documentados: al ser un componente visual, la dimensión lingüística no aplica, pero tampoco se especifican sesgos culturales o demográficos del codificador.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero los embeddings pueden heredar sesgos representacionales del modelo padre.
- Sin benchmarks downstream publicados: no hay evidencia cuantitativa de su rendimiento en tareas como clasificación, recuperación o VQA.
- Repositorio con pocas descargas (221) y sin likes: menor validación comunitaria que los checkpoints oficiales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/immanuelpeter/MiniMax-M3.1-Flash-Vision
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/parity/minimax_m3.py
- Script de exportación: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/adapters/minimax_m3.py
- Ejemplo de inferencia: `examples/inference.py` dentro del repositorio
