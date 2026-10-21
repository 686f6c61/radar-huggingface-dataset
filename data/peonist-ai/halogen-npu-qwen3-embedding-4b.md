# peonist-ai/halogen-npu-qwen3-embedding-4b

## Resumen

`peonist-ai/halogen-npu-qwen3-embedding-4b` es una conversión de [Qwen/Qwen3-Embedding-4B](https://huggingface.co/Qwen/Qwen3-Embedding-4B) (revisión `5cf2132abc99cad020ac570b19d031efec650f2b`) para ejecutarse en la NPU Ryzen AI (XDNA2) de los procesadores AMD Strix Halo. No es un modelo nuevo ni un reentrenamiento: es un artefacto de despliegue compuesto por un programa NPU compilado (`devices/`, 47 MB), los pesos convertidos a formato `.hnpw` (4,87 GB) y el tokenizer (11 MB), publicado por peonist-ai bajo licencia Apache-2.0.

Su interés práctico está en la especialización del hardware: la NPU atiende las peticiones de embeddings mientras la GPU sigue sirviendo el modelo generativo Flash, ambos detrás del mismo puerto de `halogen-flash-server`. El servidor expone `/v1/embeddings` con el esquema de petición de OpenAI, devuelve vectores de 2.560 dimensiones (reducibles con el parámetro `dimensions`) y acepta entradas de hasta 4.096 tokens. Con 5,0 GB de repositorio y cero descargas en el momento de la consulta, es un artefacto muy reciente (creado el 10 de octubre de 2026) y de nicho.

La contrapartida es la portabilidad: los ficheros solo cargan dentro del contenedor `halogen-flash-server` sobre la NPU; el propio autor desactiva el widget de inferencia del Hub porque ningún runtime estándar puede ejecutarlos. Quien no tenga un equipo Strix Halo con el driver NPU y XRT configurados no podrá usar este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Programa NPU compilado (`devices/`) sobre pesos convertidos del modelo de embeddings Qwen3-Embedding-4B; la arquitectura interna del modelo base no se detalla en la model card |
| Parámetros totales | 4B (según la denominación del modelo base; la model card no publica desglose por capas) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 4.096 tokens por entrada en `halogen-flash-server`; el contexto nativo del modelo base no se indica |
| Tipos de cuantización | No disponible; los pesos se distribuyen ya convertidos en formato `.hnpw`, sin esquema de cuantización documentado |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (la misma que el modelo fuente) |
| Formato de pesos | `.hnpw` (4,87 GB) + programa NPU en `devices/` (47 MB) + tokenizer (11 MB); no compatible con safetensors ni GGUF |
| Dimensión de salida | 2.560 dimensiones, reducible mediante el parámetro `dimensions` |
| Tarea | `feature-extraction` / `sentence-similarity` (embeddings) |
| Librería | `halogen` |
| Hardware objetivo | NPU Ryzen AI (XDNA2) de AMD Strix Halo |
| Tamaño del repositorio | 5,0 GB |
| Descargas / likes | 0 / 0 (en la fecha de consulta) |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio: es una conversión del modelo de embeddings Qwen3-Embedding-4B a un programa ejecutable en la NPU XDNA2. La model card no incluye datos sobre tokens de entrenamiento, composición del dataset ni etapas de alineación (RLHF/DPO) del modelo base; esa información, si existe, corresponde al repositorio original de Qwen. Lo que sí describe el autor es el proceso de conversión: los pesos se transforman al formato `.hnpw` y se acompaña un binario de programa NPU con sus avisos de terceros en `devices/NOTICE.md`.

Un detalle de diseño relevante es la reutilización: el reranker `halogen-npu-qwen3-reranker-4b` se ejecuta sobre el mismo programa NPU, de modo que un host que sirva ambos modelos descarga ese componente una sola vez. El servidor verifica tamaño y checksum de cada fichero antes de arrancar, y cada versión del servidor descarga la revisión con la que se publicó, de forma que actualizar el servidor no rompe despliegues antiguos. No se documentan innovaciones de decodificación ni de atención, algo esperable en un modelo de embeddings sin generación autoregresiva.

## Capacidades

- Generación de embeddings de texto para similitud semántica y `feature-extraction`, con vectores de 2.560 dimensiones.
- Reducción de dimensionalidad por petición mediante el parámetro `dimensions`, útil para índices vectoriales con presupuesto de memoria ajustado.
- Interfaz compatible con OpenAI en `/v1/embeddings`, lo que permite reutilizar clientes y SDK existentes sin adaptadores.
- Entradas de hasta 4.096 tokens, suficientes para fragmentos de documentación, artículos o turnos de conversación largos.
- Emparejamiento con el reranker `halogen-npu-qwen3-reranker-4b` para pipelines de recuperación en dos fases sobre el mismo programa NPU.
- Ejecución simultánea con el modelo generativo Flash en la GPU, ambos atendidos por el mismo puerto del servidor.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es exclusivamente un modelo de representación.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda semántica y RAG en un servidor Strix Halo: indexar documentación interna mediante `/v1/embeddings`, con fragmentos de hasta 4.096 tokens, y dejar la GPU libre para el modelo generativo que redacta la respuesta final en el mismo puerto.
- Deduplicación de corpus: calcular embeddings de artículos o tickets y agrupar por similitud coseno para eliminar duplicados antes de ingerirlos en un índice.
- Clasificación por similitud con prototipos: describir cada categoría con unas pocas frases, embeberlas y asignar la etiqueta del prototipo más cercano, sin entrenar un clasificador adicional.
- Recuperación en dos fases: primera etapa con este modelo (2560 dimensiones) y reordenación con el reranker hermano, que comparte programa NPU y no duplica la descarga en el host.
- Caché semántico de respuestas de un LLM: comparar el embedding de la consulta entrante con los de consultas previas para servir respuestas ya calculadas y reducir llamadas al modelo generativo.
- Enrutado de peticiones: embeber consultas cortas para decidir qué endpoint o qué modelo debe atenderlas, aprovechando que la NPU queda fuera del camino crítico de la GPU.
- Análisis de soporte al cliente: agrupar tickets por temática y detectar incidencias recurrentes sin enviar texto a un servicio externo, manteniendo los datos en el equipo local.
- Filtrado de contenido duplicado o casi duplicado en pipelines editoriales, comparando similitud entre borradores y piezas ya publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MTEB ni comparaciones con otros modelos de embeddings, y tampoco se aportan cifras de latencia o throughput en la NPU.

## Requisitos de hardware

- NPU Ryzen AI (XDNA2) integrada en un procesador AMD Strix Halo; no se puede ejecutar en GPU discretas ni en NPU de otros fabricantes.
- Software obligatorio: `halogen-flash-server` 0.18.12 o superior para los ficheros de la cabeza del repositorio (versiones desde 0.17.4 cubren revisiones anteriores), con `HALOGEN_DOWNLOAD` activado y `HALOGEN_NPU_MODELS=qwen3-embedding-4b`.
- Controladores: driver de NPU y XRT con su plugin de NPU instalados; el reloj de fabric de la GPU debe mantenerse fijado mientras la NPU trabaja en paralelo.
- Almacenamiento: unos 5,0 GB en `/models/npu/qwen3-embedding-4b/` (4,87 GB de pesos + 47 MB de programa NPU + 11 MB de tokenizer).
- VRAM estimada: no disponible; el modelo reside en la NPU y la model card no publica requisitos de memoria.
- GPU recomendadas: no aplica; el requisito real es la APU Strix Halo completa. No cabe ni se puede desplegar en RTX 4090, A100 o H100.
- Cabe en GPU de consumo: no; requiere hardware Strix Halo con NPU XDNA2.
- Opciones de despliegue: únicamente el contenedor `halogen-flash-server`. No hay soporte para transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Dimensión de salida | Licencia | Ejecución | Disponibilidad |
|---|---|---|---|---|---|---|
| halogen-npu-qwen3-embedding-4b | 4B | 4.096 tokens | 2.560 (reducible) | Apache-2.0 | Solo NPU Ryzen AI dentro de `halogen-flash-server` | 0 descargas; creado en octubre de 2026 |
| Qwen/Qwen3-Embedding-4B (original) | 4B | No disponible en la información | No disponible en la información | Apache-2.0 | GPU/CPU con transformers o sentence-transformers | Modelo de referencia del que deriva esta conversión |
| peonist-ai/halogen-npu-qwen3-embedding-0.6b | 0,6B (por denominación) | No disponible | No disponible | No disponible | NPU Ryzen AI, misma familia de artefactos | Variante reducida del mismo autor |
| peonist-ai/halogen-npu-qwen3-reranker-4b | 4B (por denominación) | No disponible | No aplica | No disponible | NPU Ryzen AI, comparte programa NPU | Tarea distinta: reordenación, no embeddings |

La diferencia decisiva frente al modelo original no es de calidad, sino de ubicación: la conversión NPU libera la GPU y exige un ecosistema de software concreto, mientras que el original prioriza portabilidad entre runtimes.

## Limitaciones y advertencias

- Portabilidad nula: los ficheros solo cargan dentro del contenedor `halogen-flash-server` sobre la NPU; el Hub marca `inference: false` y ningún otro runtime puede leerlos.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; usarlo para esas tareas es un error de selección.
- Límite de 4.096 tokens por entrada en el runtime; documentos más largos requieren troceado previo, con la pérdida de contexto que ello implica.
- Idiomas soportados sin documentar: no hay confirmación explícita de cobertura multilingüe ni de calidad por idioma en esta distribución.
- Acoplamiento a versión: cada versión del servidor descarga la revisión con la que se publicó, de modo que actualizar implica reconciliar versiones y checksums.
- Dependencia de entorno frágil: sin driver de NPU, sin XRT con plugin de NPU o sin el reloj de fabric de la GPU fijado, el despliegue falla.
- Sesgos heredados del modelo base Qwen3-Embedding-4B, no documentados en esta model card; en recuperación se traducen en falsos positivos de similitud y en peor recall para dominios o variedades lingüísticas infrarepresentadas. Los embeddings no alucinan texto, pero sí pueden ordenar resultados de forma engañosa.
- Licencia Apache-2.0, apta para uso comercial, pero `devices/NOTICE.md` recoge avisos de terceros que deben revisarse y conservarse en la redistribución.
- Madurez baja: repositorio creado el 10 de octubre de 2026, 0 descargas y 0 likes, mantenido por un único autor, sin benchmarks publicados y con soporte canalizado por Discord y el repositorio del servidor.
- Si se sirven simultáneamente embeddings y reranker, conviene planificar el espacio en disco y el orden de descarga, aunque compartan programa NPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peonist-ai/halogen-npu-qwen3-embedding-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Repositorio del servidor: https://github.com/peonist-ai/halogen-flash-server
- Documentación de NPU: https://github.com/peonist-ai/halogen-flash-server/blob/main/docs/NPU.md
- Incidencias del servidor: https://github.com/peonist-ai/halogen-flash-server/issues
- Reranker hermano: https://huggingface.co/peonist-ai/halogen-npu-qwen3-reranker-4b
- Variante de 0,6B: https://huggingface.co/peonist-ai/halogen-npu-qwen3-embedding-0.6b
- Organización en GitHub: https://github.com/peonist-ai/
- Discord del proyecto: https://discord.gg/bcm6QknaV6
- Ficha de terceros: https://free2aitools.com/model/peonist-ai/halogen-npu-qwen3-embedding-4b
