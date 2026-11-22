# fylume/yaob-next-n10k-c4b

## Resumen

Yaob Next (N10K-C4B) 0.2.0 es un artefacto de empaquetado publicado por fylume (identificado en la model card como Fylume / sarja-technologies) que no contiene pesos de un modelo de lenguaje propio, sino la fijación reproducible de un ensamblaje entre una red de nodos de conocimiento y un núcleo cognitivo de terceros. El repositorio de Hugging Face no aloja pesos ni datos: registra qué red y qué núcleo componen el pairing y cómo se ejecutaron juntos, con `fylume-release.json` como forma legible por máquina. El identificador N10K corresponde a la red (10.167 nodos, de los cuales 10.007 en uso y 160 canarios de diagnóstico inventados) y C4B al núcleo de 4.000 millones de parámetros.

El núcleo es Qwen3.5-4B de Alibaba Cloud, convertido a GGUF y cuantizado a Q8_0 (4.610.580.384 bytes) junto con un proyector multimodal F16 (672.423.488 bytes); no ha sido ajustado por Fylume. El único componente aprendido por Fylume es un router de 3.140.787 parámetros entrenado contra el encoder Qwen3-Embedding-0.6B en F16, que funciona únicamente con ese encoder. La red se distribuye como payload SQLite de 110.870.528 bytes con 105.888 relaciones en 19 MPN.

La relevancia del artefacto es metodológica más que de rendimiento: propone un formato (`.mpn`) y una cadena de herramientas (MPN Studio) para versionar y verificar por hash un sistema compuesto donde red, encoder y núcleo son intercambiables de forma independiente. El artefacto probado completo ocupa 6.635.995.615 bytes y se ejecuta sobre llama.cpp, exponiendo un endpoint compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: red de nodos (SQLite, grafo de conocimiento) + router MLP de 3,1 M parámetros + núcleo transformer denso Qwen3.5-4B + encoder de embeddings Qwen3-Embedding-0.6B |
| Parametros totales | 4.000 M (núcleo) + 3,14 M (router) + 0,6 M (encoder, aproximado por nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Núcleo en Q8_0 (GGUF); proyector multimodal en F16; encoder en F16 |
| Idiomas soportados | Solo inglés (declarado explícitamente: "Anything other than English" no fue probado) |
| Licencia | Compuesta: red CC BY-SA 4.0 (hechos de Wikidata CC0); núcleo y encoder Apache-2.0; pesos del router bajo Fylume Source-Available Terms 1.0 |
| Formato de pesos | GGUF (miembros del núcleo, proyector y encoder) empaquetados en contenedor `.mpn`; red en SQLite |
| Tamano del artefacto probado | 6.635.995.615 bytes (`.mpn`), SHA-256 `67e56f1e4a6cbabdc6414d25de6f80272a811c17ca1ffb6cb045301760efd53c` |
| Nodos de red | 10.167 (10.007 en uso, 160 canarios); 105.888 relaciones en 19 MPN; revisión 40 |
| Hardware de referencia | DGX Spark (arm64, NVIDIA GB10) |

## Arquitectura y entrenamiento

El sistema no es un modelo único sino un ensamblaje de cuatro piezas con ciclos de vida independientes. La red N10K es un grafo de conocimiento almacenado en SQLite (payload `studio/network/yaob-n10k.sqlite`, SHA-256 `deeb2437413f7a81bfb1a11135b857acdea8e7f7bcd9ed4d2d5ce3ed0b2b3b9f`) con 10.167 nodos y 105.888 relaciones organizadas en 19 MPN; incorpora 160 nodos canario inventados para diagnóstico. El router, único componente entrenado por Fylume, tiene 3.140.787 parámetros, se entrenó con el encoder Qwen3-Embedding-0.6B congelado y solo es válido con ese encoder. El núcleo es Qwen3.5-4B de Alibaba Cloud en commit `851bf6e8`, convertido y cuantizado a Q8_0 sin ajuste fino adicional por parte de Fylume.

La inferencia combina recuperación sobre la red con generación del núcleo, mediada por el router y por un proyector multimodal F16 que habilita entrada de imagen. El empaquetado `.mpn` agrupa los miembros binarios y verifica sus checksums con `mpn verify`, que reportó "All members match their checksums." en la build del 2026-11-13. El sistema se ejecuta sobre llama.cpp (versión b12318 en las pruebas de calidad) y expone una API compatible con OpenAI en el puerto configurable. No se documentan datos de entrenamiento del núcleo, número de tokens, composición del dataset ni etapas de RLHF o DPO, más allá de la referencia al modelo original de Alibaba Cloud.

Una innovación destacable es la sustituibilidad verificada: el 2026-11-23 se aplicó un segundo núcleo (Qwen3-4B-Instruct-2507 Q8_0 sobre un servidor llama.cpp separado) manteniendo la red con el mismo `net_hash` (`84afc1852c9d7ae3`) y respondiendo correctamente a la misma pregunta. Esto demuestra que la red y el núcleo son intercambiables sin tocar el otro componente.

## Capacidades

- Generación de texto y respuesta a preguntas con citación de nodos de la red (formato `[1]` en las respuestas).
- Recuperación aumentada sobre un grafo de conocimiento estructurado de 10.167 nodos y 105.888 relaciones.
- Entrada multimodal mediante el proyector F16 de Qwen3.5-4B (capacidad heredada del núcleo, no validada en las pruebas descritas).
- Cálculo aritmético dentro de conversación (verificado en la prueba de cinco turnos con Semechka).
- Rechazo explícito ante preguntas sobre entidades inventadas (verificado: declive ante un pueblo ficticio).
- Conversación multi-turno con seguimiento de contexto (prueba de cinco turnos: citas, seguimiento, cálculo, rechazo y reinicio).
- Servicio mediante endpoint compatible con OpenAI (`/v1/chat/completions`, id de modelo `yaob-next-n10k-c4b`).
- Sin soporte de tool calling, function calling ni modo de razonamiento extendido documentado.
- Sin capacidades multilingües verificadas: solo inglés probado.

## Casos de uso

- Respuesta a preguntas con trazabilidad: el sistema cita nodos concretos de la red en cada respuesta, lo que permite auditar la fuente de cada afirmación; adecuado para dominios donde la procedencia del dato es requisito, como documentación técnica interna o bases de conocimiento corporativo curado.
- Verificación de ensamblajes reproducibles en investigación: el formato `.mpn` con verificación por SHA-256 permite reconstruir un sistema compuesto exacto a partir de repositorios fijados, útil para publicaciones que necesitan reproducibilidad bit a bit de un pipeline de recuperación más generación.
- Evaluación de sustitutibilidad de núcleos: al poder cambiar el núcleo (Qwen3.5-4B por Qwen3-4B-Instruct-2507) manteniendo la red con el mismo `net_hash`, sirve para comparar núcleos sobre una base de conocimiento fija en experimentos controlados.
- Despliegue en hardware de borde con GPU integrada: con 7.365 MiB de pico de memoria GPU y 14,4-14,8 tokens/s en un DGX Spark (GB10), encaja en estaciones de trabajo ARM con GPU unificada para asistentes locales de dominio cerrado.
- Asistente de consulta sobre catálogos estructurados: la combinación de grafo SQLite y generación permite montar un asistente que responde sobre un conjunto de entidades y relaciones acotado, con rechazo ante entidades fuera del grafo, reduciendo alucinaciones en dominios delimitados.
- Prototipado de arquitecturas neuro-simbólicas: el router de 3,1 M parámetros sobre embeddings de un encoder congelado es un patrón ligero y replicable para enrutar consultas hacia subgrafos antes de la generación, útil en líneas de investigación sobre recuperación estructurada.

## Benchmarks y rendimiento

| Prueba | Resultado | Contexto |
|---|---|---|
| Suite de calidad propia (236 tareas, semilla 20261111) | 228 correctas (97 %; intervalo Wilson 95 %: 94-98) | RTX 4060 Ti, paquete de release con backend Python propio y llama.cpp b12318 |
| Suite de calidad, release 0.2.1 | 228 de 236 | DGX Spark, mismo núcleo, encoder, red y router, código posterior |
| Núcleo solo (Qwen3.5-4B) | 102 de 236 (43 %) | Misma suite |
| Recuperación simple (retrieval plano) | 198 de 236 (84 %) | Misma suite |
| Yaob 0.1.0 | 211 de 236 (89 %) | Misma suite |
| Throughput CUDA (DGX Spark, GB10) | 14,4-14,8 tokens/s; arranque 10,6 s; pico GPU 7.365 MiB; pico de proceso 3,1 GB | `mpn run --device cuda` |
| Throughput CPU (DGX Spark) | 2,4-2,5 tokens/s; arranque 8,1 s | `mpn run --device cpu` |

Advertencia del propio autor: la suite fue escrita por el mismo equipo, es pequeña y el bucle final se fijó tras leer los fallos de la primera ejecución, por lo que no es completamente ciega. No hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 7.365 MiB de pico medido en CUDA con el artefacto completo; el núcleo Q8_0 solo (4,61 GB) más el proyector F16 (0,67 GB) y el encoder F16 (1,20 GB) justifican ese orden de magnitud.
- GPU recomendadas: NVIDIA GB10 (DGX Spark, plataforma de referencia probada); RTX 4060 Ti validada para la suite de calidad; cualquier GPU con al menos 8 GB de VRAM para el artefacto completo en Q8_0.
- Cabe en GPU de consumo: sí, con 8 GB o más de VRAM; la RTX 4060 Ti se usó en las pruebas de calidad.
- Opciones de despliegue: MPN Studio 0.2.0 y 0.5.0 (`mpn run`, `mpn verify`), con backend propio y llama.cpp b12318; endpoint compatible con OpenAI en el puerto indicado (`--port 8861`). No se documenta soporte de vLLM, Ollama ni TGI.
- Latencia y throughput: 14,4-14,8 tokens/s en CUDA (GB10) y 2,4-2,5 tokens/s en CPU; arranque de 10,6 s en CUDA y 8,1 s en CPU.
- Plataformas: paquetes x86-64 y ARM64 de MPN Studio 0.5.0 probados; no existen paquetes para Windows ni macOS. Vulkan y CPU x86 a través de `mpn run` no se probaron.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Rendimiento en suite propia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yaob Next (N10K-C4B) 0.2.0 | 4.000 M (núcleo) + 3,14 M (router) | No disponible | 228/236 (97 %) | Compuesta (CC BY-SA 4.0, Apache-2.0, Source-Available) | Hugging Face (manifiesto) y GitHub release v0.2.0 |
| Yaob 0.1.0 | No disponible | No disponible | 211/236 (89 %) | No disponible | Versión anterior del mismo proyecto |
| Núcleo solo (Qwen3.5-4B Q8_0) | 4.000 M | No disponible | 102/236 (43 %) | Apache-2.0 | Hugging Face (`Qwen/Qwen3.5-4B`) |
| Recuperación plana (baseline) | No aplica | No disponible | 198/236 (84 %) | No aplica | Baseline interno del proyecto |

La comparación con modelos de la misma categoría (sistemas RAG con generación) fuera del ecosistema del autor no está disponible en la información proporcionada: no hay resultados de benchmarks estándar que permitan situar el sistema frente a alternativas comerciales o de otros proyectos.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos ni datos: es un manifiesto de fijación. Los binarios deben obtenerse de los repositorios referenciados y del release de GitHub.
- La suite de evaluación (236 tareas) fue escrita por el mismo equipo, es pequeña y el bucle final se fijó tras inspeccionar los fallos de la primera ejecución; el 97 % no es una medida ciega ni comparable con benchmarks públicos.
- Solo se probó inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- No se probaron Vulkan, CPU x86 a través de `mpn run`, Windows ni macOS; no existen paquetes para estos dos últimos.
- El artefacto `.mpn` no se probó tras descargarlo desde GitHub en una segunda máquina (solo se verificó por hash y con `mpn verify`).
- Riesgo de alucinación: el sistema mitiga con citación de nodos y rechazo ante entidades ausentes del grafo (verificado con un pueblo inventado), pero el núcleo subyacente es un modelo generativo de 4 B parámetros y no hay evaluación de tasas de alucinación fuera de la suite propia.
- Licencia compuesta con restricciones: los pesos del router están bajo Fylume Source-Available Terms 1.0, no bajo una licencia de código abierto; la red es CC BY-SA 4.0 (con hechos de Wikidata CC0), lo que impone obligaciones de atribución y compartir igual sobre la red. Revisar cada componente antes de uso comercial.
- El router solo funciona con el encoder Qwen3-Embedding-0.6B con el que fue entrenado; sustituir el encoder invalida el router.
- Sesgos conocidos: no documentados en la información disponible; los hechos de la red provienen de Wikidata y heredan sus sesgos de cobertura.
- Latencia en CPU baja (2,4-2,5 tokens/s), lo que limita su uso interactivo sin GPU.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/fylume/yaob-next-n10k-c4b
- Red N10K: https://huggingface.co/fylume/yaob-next-n10k
- Núcleo Qwen3.5-4B GGUF: https://huggingface.co/fylume/qwen3.5-4b-q8_0-gguf
- Encoder Qwen3-Embedding-0.6B GGUF: https://huggingface.co/fylume/qwen3-embedding-0.6b-f16-gguf
- Modelo original del núcleo: https://huggingface.co/Qwen/Qwen3.5-4B
- Release del artefacto (GitHub, `sarja-technologies/yaob`, v0.2.0): https://github.com/sarja-technologies/yaob/releases/tag/v0.2.0
