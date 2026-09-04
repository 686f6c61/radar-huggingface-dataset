# hdae/karume-siglip2

## Resumen

hdae/karume-siglip2 es una distribución de la torre de visión del modelo SigLIP2, convertida al formato de contenedor de Karume, un runtime de inferencia neuronal que se ejecuta sobre WebGPU en navegadores y Deno. Desarrollado por el usuario hdae, este repositorio no contiene los checkpoints originales, sino una conversión de los pesos de google/siglip2-base-patch16-224 y google/siglip2-so400m-patch14-384 a un único archivo safetensors con un grafo de ejecución embebido en los metadatos. El modelo resuelve la necesidad de extraer embeddings de imagen directamente en el cliente, sin depender de servidores ni de la librería transformers, y es relevante para aplicaciones web y edge que requieren procesamiento de visión en tiempo real con WebGPU.

La arquitectura es un Vision Transformer (ViT) con head de attention-pooling (MAP), que toma píxeles RGB8, los redimensiona y normaliza, y devuelve el vector pooled de 768 dimensiones en el caso del modelo base. El repositorio incluye dos variantes: base (entrada 224×224, salida 768) y so400m (entrada 384×384, salida no disponible en la información). El modelo no incluye la torre de texto, por lo que no puede realizar clasificación zero-shot ni similitud imagen-texto; su función es exclusivamente convertir imágenes en vectores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (SigLIP2) con head de attention-pooling (MAP) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | f32 (único disponible) |
| Idiomas soportados | No disponible (modelo de visión, sin componentes de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (contenedor Karume con grafo embebido en metadatos) |

## Arquitectura y entrenamiento

El modelo es una conversión de la torre de visión de SigLIP2 al formato de contenedor de Karume. No se ha realizado ningún retraining ni fine-tuning: los pesos son los valores f32 originales de los checkpoints de google/siglip2-base-patch16-224 y google/siglip2-so400m-patch14-384. La conversión, realizada con el exportador karume/0.9.0, incluye dos reescrituras del grafo para adaptarlo al runtime: el padding de la patch embedding y la búsqueda de la position embedding se plegaron en operaciones equivalentes bit-exactas, y el head de pooling se reescribió con proyecciones q/k/v explícitas, que es equivalente hasta redondeo de punto flotante (error medido de 7.75e-07 a 2.38e-06 en el vector pooled, cuya norma L2 es aproximadamente 13). El manifiesto de distribución es karume.json (versión 4 del esquema).

Los datos de entrenamiento originales de SigLIP2 (número de tokens, composición del dataset, presencia de RLHF/DPO) no se proporcionan en la información disponible.

## Capacidades

- Extracción de características de imagen: convierte píxeles RGB8 en un vector de embeddings (`pooler_output`) de 768 dimensiones para la variante base.
- Preprocesamiento incluido: redimensiona la imagen a 224×224 (base) o 384×384 (so400m) con interpolación bilineal antialiased, y normaliza con media y desviación 0.5. No se preserva la relación de aspecto.
- Ejecución en WebGPU: el pipeline se ejecuta en el navegador y en Deno mediante el runtime Karume, sin dependencias de servidor.
- Sesión GPU persistente: los pesos se cargan una vez y se reutilizan para múltiples imágenes; las llamadas concurrentes se encolan.
- No soporta tool calling / function calling, ni agentes, ni razonamiento multi-paso.
- No soporta texto ni similitud imagen-texto, ya que la torre de texto no está incluida.
- No es compatible con la librería transformers; requiere el pipeline `siglip2/1` de Karume.

## Casos de uso

- Búsqueda de imágenes por similitud en el navegador: se extraen embeddings de un conjunto de imágenes y se comparan mediante similitud coseno. El modelo es adecuado porque se ejecuta en WebGPU, lo que permite hacer la búsqueda en el cliente sin enviar datos a un servidor.
- Moderación de contenido en el cliente: se pueden entrenar clasificadores lineales sobre los embeddings para detectar contenido inapropiado en tiempo real. El vector de 768 dimensiones es suficientemente informativo para tareas de clasificación ligera.
- Deduplicación de imágenes en aplicaciones web: al subir una imagen, se calcula su embedding y se compara con un índice de embeddings almacenado en IndexedDB. El modelo permite detectar duplicados o imágenes muy similares de forma eficiente.
- Recomendación visual en Deno: se extraen embeddings de un catálogo de productos y se calculan similitudes para ofrecer sugerencias. El pipeline puede ejecutarse en el servidor con Deno y WebGPU.
- Clasificación de imágenes en aplicaciones offline: con un clasificador entrenado previamente sobre los embeddings, se puede clasificar imágenes en el dispositivo sin conexión. El modelo no requiere servicios externos.
- Agrupación de fotos en aplicaciones de gestión de imágenes: se utilizan los embeddings para clustering (por ejemplo, k-means) y organizar automáticamente álbumes por similitud visual. La salida no normalizada se puede normalizar para usar distancias coseno.
- Análisis de imágenes en pipelines edge: en Deno, se procesan lotes de imágenes para extraer características y enviarlas a un sistema de almacenamiento vectorial. El modelo es adecuado para entornos sin GPU dedicada, ya que WebGPU aprovecha cualquier GPU compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante base requiere aproximadamente 354 MiB de VRAM (pesos f32); la variante so400m requiere aproximadamente 1.60 GiB de VRAM. Son estimaciones basadas en el tamaño de descarga de los pesos.
- GPU recomendadas: cualquier GPU compatible con WebGPU, incluyendo GPUs integradas modernas (Intel Iris Xe, AMD Radeon, Apple Silicon) y GPUs dedicadas (NVIDIA RTX, AMD Radeon RX).
- Compatibilidad con consumer GPU: sí, ambas variantes caben en GPUs de consumo, incluyendo las integradas.
- Opciones de despliegue: exclusivamente mediante el runtime Karume (navegador y Deno). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Ejecución | Dimensión del embedding | Licencia |
|---|---|---|---|---|
| hdae/karume-siglip2 (base) | Karume / safetensors | WebGPU (Deno, navegador) | 768 | Apache-2.0 |
| hdae/karume-siglip2 (so400m) | Karume / safetensors | WebGPU (Deno, navegador) | no disponible | Apache-2.0 |
| google/siglip2-base-patch16-224 | Transformers | PyTorch / JAX | 768 | Apache-2.0 |
| google/siglip2-so400m-patch14-384 | Transformers | PyTorch / JAX | no disponible | Apache-2.0 |

La principal diferencia entre este modelo y los checkpoints originales es el formato y el entorno de ejecución: el original se usa con transformers en Python, mientras que esta distribución está pensada para ejecutarse en WebGPU vía Karume. No se dispone de datos comparativos de rendimiento. El modelo no es comparable con modelos de lenguaje o de visión-lenguaje completos, ya que solo incluye la torre de visión.

## Limitaciones y advertencias

- No incluye la torre de texto, por lo que no puede realizar clasificación zero-shot ni similitud imagen-texto.
- No es compatible con transformers; requiere el runtime Karume y el pipeline `siglip2/1`.
- Los pesos se distribuyen únicamente en f32, sin cuantizaciones, lo que implica un mayor uso de memoria en comparación con formatos cuantizados.
- El preprocesamiento no preserva la relación de aspecto: las imágenes se redimensionan a 224×224 o 384×384 sin recorte ni padding, lo que puede deformar imágenes no cuadradas.
- La salida `pooler_output` no está normalizada; es necesario normalizarla para calcular similitudes coseno.
- Depende de WebGPU; no funciona en navegadores o entornos sin soporte de WebGPU.
- No se han publicado benchmarks ni datos de rendimiento, por lo que no se puede evaluar su eficiencia en producción.
- El repositorio tiene 0 descargas y 0 likes, y el autor es un usuario individual, lo que indica una adopción muy limitada.
- La fecha de creación y actualización del repositorio es 2026-09-04, lo que puede ser indicativo de un proyecto muy reciente o con datos de fecha inusuales.

## Enlaces

- https://huggingface.co/hdae/karume-siglip2
- https://github.com/hdae/karume
- https://huggingface.co/docs/transformers/model_doc/siglip2
- https://huggingface.co/google/siglip2-base-patch16-224
- https://huggingface.co/google/siglip2-so400m-patch14-384
