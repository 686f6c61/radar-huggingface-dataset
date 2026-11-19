# protos-photos/siglip2-so400m-patch16-256-coreml

## Resumen

SigLIP 2 So400m Patch16-256 Core ML es una conversión a Core ML del modelo multimodal de imagen y texto google/siglip2-so400m-patch16-256 de Google. Lo publica el usuario protos-photos para alimentar la búsqueda de imágenes en local de su aplicación Protos para macOS. No se trata de un modelo nuevo, sino de un artefacto de despliegue: los pesos son los originales de SigLIP 2 y solo cambia el formato y la separación en dos torres exportadas de forma independiente.

La arquitectura subyacente es SigLIP 2, un modelo de alineación imagen-texto con encoder de visión tipo ViT de parches 16x16 y resolución de entrada 256x256, variante So400m (aproximadamente 400 millones de parámetros en la torre de visión). Genera embeddings de imagen y de texto en un espacio compartido, pensados para búsqueda y clasificación zero-shot, no para generación de texto.

Su relevancia es práctica: permite ejecutar inferencia completamente en local en hardware Apple (CPU, GPU y Neural Engine mediante Core ML), sin depender de servicios en la nube ni de GPU dedicadas, con un repositorio de 2,3 GB en float16. Es una pieza útil para quien quiera integrar búsqueda semántica de imágenes en aplicaciones macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (encoder de visión ViT patch16-256 + encoder de texto), exportado como dos torres Core ML independientes |
| Parametros totales | no disponible (el modelo base es la variante So400m; el número exacto no figura en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana generativa; la torre de texto acepta `input_ids` de longitud fija [1, 64] |
| Tipos de cuantizacion | float16 en ambas torres; entrada de imagen en float32 escalada a -1..1 |
| Idiomas soportados | no disponible (el tokenizador es el de Gemma del modelo original) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`), float16; tokenizador en formato original de Google |

## Arquitectura y entrenamiento

El modelo base, SigLIP 2, es un sistema de alineación imagen-texto de tipo dual-encoder: una torre de visión transforma la imagen en un embedding y una torre de texto transforma la secuencia de tokens en otro embedding del mismo espacio latente. La variante So400m emplea parches de 16x16 sobre entradas de 256x256 píxeles. La conversión de protos-photos mantiene los pesos sin modificar y solo los reorganiza en dos modelos Core ML exportados con coremltools 8.3.0 en float16.

La torre de imagen recibe `pixel_values` en float32 con forma [1, 3, 256, 256] normalizados al rango -1..1 y devuelve `image_embeds`. La torre de texto recibe `input_ids` int32 con forma [1, 64] usando el tokenizador de Gemma y devuelve `text_embeds`. Ambas salidas son los vectores proyectados en crudo, sin normalización L2, que debe aplicar el consumidor. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens vistos ni si hubo etapas de ajuste fino con preferencias; esos datos corresponden a la model card de Google y no se reproducen aquí.

## Capacidades

- Generación de embeddings de imagen en un espacio compartido con texto, aptos para búsqueda semántica y recuperación.
- Generación de embeddings de texto para consultas de búsqueda y comparación contra imágenes.
- Clasificación zero-shot de imágenes mediante similitud coseno entre embeddings normalizados.
- Ejecución en local en macOS sobre Core ML, con posible uso de CPU, GPU y Neural Engine.
- No realiza generación de texto, razonamiento, código ni matemáticas: es un modelo de representación, no un LLM.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada; dependen del tokenizador Gemma heredado del modelo base.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades especiales más allá del emparejamiento imagen-texto.

## Casos de uso

- Búsqueda de fotos en local dentro de una app macOS: se indexan las imágenes del usuario calculando `image_embeds` con la torre de visión y se consulta con `text_embeds` de la torre de texto, comparando por similitud coseno. El formato Core ML permite ejecutarlo sin conexión.
- Etiquetado y organización automática de bibliotecas fotográficas: se generan embeddings de cada imagen y se agrupan por similitud para crear colecciones o detectar duplicados visuales.
- Filtrado zero-shot de contenido: se define un conjunto de etiquetas en texto, se calculan sus embeddings y se clasifican imágenes nuevas por proximidad, útil en moderación o triaje previo.
- Búsqueda visual por similitud: dada una imagen de referencia, se calcula su embedding y se recuperan las más parecidas de un índice vectorial, un patrón habitual en catálogos de producto.
- Prototipado rápido en Mac sin infraestructura: investigadores y desarrolladores pueden validar pipelines de recuperación multimodal en un portátil antes de escalar a servidores.
- Integración en aplicaciones de escritorio con requisitos de privacidad: al ejecutarse en el dispositivo, los datos de imagen no salen del equipo, lo que encaja en entornos con restricciones de datos.
- Anotación asistida de datasets: se precalculan embeddings de imagen y texto para sugerir correspondencias y acelerar el etiquetado manual de pares imagen-descripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Repositorio de 2,3 GB en float16, lo que da una idea del espacio en disco necesario para los pesos.
- Inferencia orientada a hardware Apple mediante Core ML; no se documentan requisitos de VRAM para GPU NVIDIA.
- Cabe en equipos Mac con memoria unificada de 8 GB o superior, aunque el consumo exacto en tiempo de ejecución no está disponible.
- GPU recomendadas: no disponible; el modelo está pensado para CPU, GPU integrada y Neural Engine de Apple Silicon.
- Despliegue mediante Core ML (coremltools) en macOS; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| protos-photos/siglip2-so400m-patch16-256-coreml | variante So400m (número exacto no disponible) | secuencia fija de 64 tokens | Core ML float16 | Apache-2.0 | Hugging Face, 0 descargas |
| google/siglip2-so400m-patch16-256 | variante So400m | no disponible | safetensors/PyTorch | Apache-2.0 | Hugging Face (modelo base) |
| Otros conversores Core ML de SigLIP 2 | no disponible | no disponible | Core ML | depende del autor | no disponible |

La comparación directa con alternativas de la misma categoría (CLIP, SigLIP 1, EVA-CLIP) no está disponible en la información proporcionada; los datos de rendimiento comparativo requerirían consultar la model card del modelo base de Google.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto ni respuestas, por lo que no sirve para tareas de razonamiento o chat.
- Las salidas no están normalizadas L2; si se omite la normalización, la similitud coseno puede dar resultados incorrectos.
- La torre de texto tiene longitud de entrada fija de 64 tokens, lo que limita consultas largas.
- Los sesgos del modelo base (asociaciones culturales, de género o de representación en los pares imagen-texto) se heredan sin cambios.
- Riesgo de falsos positivos en búsqueda y clasificación cuando las consultas son ambiguas o las imágenes están fuera de la distribución de entrenamiento.
- No se documentan idiomas soportados ni evaluación multilingüe en esta conversión.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución a Google LLC y declarar los cambios de la conversión, tal como indica el autor.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Al ser una conversión de un tercero, no hay garantía de equivalencia numérica exacta con el modelo original más allá de lo declarado por el autor.

## Enlaces

- [Hugging Face: protos-photos/siglip2-so400m-patch16-256-coreml](https://huggingface.co/protos-photos/siglip2-so400m-patch16-256-coreml)
- [Modelo base: google/siglip2-so400m-patch16-256](https://huggingface.co/google/siglip2-so400m-patch16-256)
- [coremltools](https://github.com/apple/coremltools)
