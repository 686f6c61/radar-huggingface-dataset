# asharrm/juke-1.7b-dev

## Resumen

juke-1.7b es un modelo de lenguaje de 1.700 millones de parámetros desarrollado por el usuario asharrm, construido mediante un ajuste fino completo sobre Qwen3-1.7B. Su propósito es convertir cualquier prompt en lenguaje natural en una lista de reproducción de canciones reales, sin necesidad de índice de búsqueda, base de datos externa ni código auxiliar. El modelo ha memorizado un catálogo de 229.042 canciones y representa cada una mediante una dirección semántica de tres tokens (por ejemplo, `<a_67><b_10><c_0>`), lo que le permite generar directamente el identificador de la canción junto con su artista y título.

La relevancia del modelo reside en su enfoque de recuperación generativa: en lugar de buscar en un corpus externo, el modelo escribe primero la dirección de la canción y después el nombre, imitando el comportamiento de sistemas como Text2Tracks de Spotify. Además, incorpora un modo de razonamiento opcional en el que el modelo "piensa en voz alta" como un DJ antes de proponer la lista, con un plan breve y una justificación por pista.

La versión v1.1 corrige el problema de repeticiones dentro de una misma lista mediante una edición de pesos (no reentrenamiento): cuatro cabezas de atención de supresión de copia se amplificaron 2x, lo que redujo las repeticiones del 5 % al 1,8 %. El modelo se distribuye con licencia CC-BY-SA-4.0, solo en inglés, y con pesos en safetensors y GGUF Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) |
| Parametros totales | 1.721.605.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF incluido); conversión propia vía llama.cpp |
| Idiomas soportados | en |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, y se somete a un ajuste fino completo. Se añaden 768 tokens nuevos de dirección de canción (256 para el nivel `a`, 256 para `b` y 256 para `c`) más dos tokens especiales, `<song>` y `<code>`. Las direcciones se obtienen mediante un árbol k-means balanceado sobre vectores de canción construidos a partir de co-ocurrencia en playlists, etiquetas de género/estilo y una señal de artista: el nivel `a` agrupa unas 900 canciones por área amplia, el `b` unas 9 por subestilo y el `c` indica la posición dentro del subestilo por popularidad.

El entrenamiento emplea 579.000 ejemplos y 39 millones de tokens por pasada, distribuidos en cinco tareas: memorización bidireccional dirección↔canción (458.000 ejemplos), playlists generadas por profesor (26.500, de las cuales 10.900 incluyen plan de razonamiento y justificación por pista), prompts absurdos o abstractos (2.000), playlists reales de usuarios (79.000) y etiquetas de género/estilo (14.600). Las trazas de razonamiento y las respuestas a prompts extraños fueron generadas por GPT-5.4-mini, y cada pista se validó contra el catálogo, descartando las que no aparecían en él. La innovación técnica principal es la edición de pesos de la v1.1: amplificar 2x cuatro cabezas de atención de supresión de copia (aproximadamente el 0,03 % de los pesos) para reducir repeticiones sin reentrenar.

## Capacidades

- Generación de playlists a partir de prompts libres, abstractos o absurdos ("yttrium exoplanet", "my cat's tax return"), con título, lógica de una frase y listado numerado de pistas.
- Modo de razonamiento opcional (`enable_thinking=True`): el modelo escribe un plan de 60-120 palabras y una justificación breve por cada pista, con un tono de DJ.
- Memorización bidireccional del catálogo: dada una dirección `<a_x><b_y><c_z>` devuelve `Artista – Título`, y dado `Artista – Título` devuelve la dirección.
- Estilos de prompt entrenados: `/tracks <nombre>` para generar solo listado de pistas al estilo de playlists reales; `/tag <género>` para devolver 10 canciones de ese género o etiqueta.
- Generación de listas temáticas coherentes mediante direcciones semánticas que agrupan canciones similares por prefijo.
- No soporta tool calling, function calling ni capacidades de agente multi-paso.
- No soporta visión, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Generación de playlists personalizadas en aplicaciones de música: el modelo recibe una descripción libre del usuario y devuelve una lista de canciones reales con direcciones verificables, sin necesidad de mantener un índice de búsqueda separado.
- Asistente conversacional tipo DJ: con `enable_thinking=True`, el modelo produce un monólogo breve que explica la selección, adecuado para interfaces de radio o recomendación con voz.
- Etiquetado y enriquecimiento de catálogos: dado un título y artista, el modelo devuelve la dirección semántica, útil para clasificar canciones nuevas dentro de la taxonomía existente.
- Búsqueda inversa por género o etiqueta: el prompt `/tag shoegaze` devuelve diez canciones representativas, útil para generar listas de descubrimiento por estilo.
- Generación de listas a partir de nombres de playlists reales: el modelo imita el estilo de listas creadas por usuarios, útil para completar o sugerir listas similares.
- Despliegue ligero en local o en dispositivos de consumo: el GGUF Q8_0 de 1,8 GB corre a unos 146 tokens/s en una GPU de PS5 vía Vulkan (aproximadamente 1,5 s por playlist), lo que permite integrarlo en aplicaciones de escritorio o prototipos sin infraestructura dedicada.
- Filtrado y deduplicación en pipelines de recomendación: la dirección de tres tokens permite comparar canciones por prefijo y agruparlas por área o subestilo de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de calidad: la tasa de repeticiones dentro de una misma playlist se redujo del 5 % en la versión inicial al 1,8 % en la v1.1, y se indica que el modo de razonamiento activado produce listas más variadas. También se reporta un throughput de aproximadamente 146 tokens/s con el GGUF Q8_0 en una GPU de PS5 vía Vulkan.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB con el GGUF Q8_0; en safetensors con `torch_dtype="auto"` se requiere espacio para los pesos completos (el repo ocupa 15,6 GB, aunque el modelo en sí es de 1,7B parámetros).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q8_0; para safetensors en fp16 se recomienda al menos 4-6 GB.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en una PS5 con Vulkan.
- Opciones de despliegue: transformers (con `subfolder="v1.1"`), llama.cpp (`llama-server`), conversión propia con `convert_hf_to_gguf.py`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: aproximadamente 146 tokens/s con Q8_0 en PS5 (Vulkan), lo que equivale a unos 1,5 s por playlist.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juke-1.7b | 1,72B | no disponible | Generación de playlists con direcciones semánticas | cc-by-sa-4.0 | HuggingFace (safetensors, GGUF) |
| Qwen3-1.7B (base) | 1,72B | no disponible | Generación de texto general | no disponible en la información | HuggingFace |
| Text2Tracks (Spotify) | no disponible | no disponible | Recuperación generativa de canciones | no disponible | No es un modelo abierto comparable directamente |

No se dispone de datos de benchmarks para comparar el rendimiento de juke-1.7b con alternativas de la misma categoría. La comparación con Qwen3-1.7B es únicamente arquitectónica, ya que juke es un ajuste fino especializado. Text2Tracks se menciona en la model card como inspiración conceptual, pero no se ofrecen cifras comparativas.

## Limitaciones y advertencias

- El modelo solo está entrenado en inglés; no soporta otros idiomas de forma fiable.
- Aproximadamente el 2 % de las pistas generadas en la v1.1 son repeticiones de una canción ya incluida en la misma lista; se recomienda deduplicar por dirección.
- El catálogo está limitado a 229.042 canciones memorizadas; cualquier canción fuera de ese catálogo no puede ser recomendada y el modelo podría alucinar direcciones o títulos inexistentes.
- Las direcciones semánticas dependen de la taxonomía construida con k-means; canciones nuevas o poco representadas pueden quedar mal ubicadas.
- No soporta tool calling, agentes ni razonamiento multi-paso más allá del monólogo de DJ.
- La licencia CC-BY-SA-4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede limitar su uso en productos comerciales cerrados.
- El modelo se distribuye como "dev" y con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validación externa ni de uso en producción.
- El uso de GPT-5.4-mini para generar datos de entrenamiento puede introducir sesgos estilísticos o de selección en las playlists y justificaciones.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar prompts largos o conversaciones multi-turno.

## Enlaces

- HuggingFace: https://huggingface.co/asharrm/juke-1.7b-dev
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio llama.cpp (conversión GGUF): https://github.com/ggerganov/llama.cpp
