# ccristiann/Qwen3.8-Flash-Next-picoforge-gguf

## Resumen

Qwen3.8-Flash-Next-picoforge-gguf es un repositorio de parches de cuantización publicado por el desarrollador independiente ccristiann para el modelo Qwen3.8-Flash-Next de Alibaba Qwen. No contiene un modelo completo, sino los expertos de 4 bits (6,6 GB) y el ranking que determina qué expertos se promocionan desde la cuantización de 2 bits publicada por antirez, de modo que un script reconstruye byte a byte dos variantes mixtas: Code5 y Code10.

El modelo base es un transformer de tipo mixture-of-experts con 12.032.409.600 parámetros totales, 512 expertos por capa y un router que activa 10 expertos por token. La propuesta técnica es una asignación de bits consciente de la frecuencia de uso: en cada una de las 48 capas, los expertos más activados por código en ocho lenguajes pasan de Q2 a Q4, copiando los bytes del fichero Q4 oficial sin recuantizar.

Su relevancia es doble: demuestra que una fracción pequeña de expertos concentra gran parte del peso del router en dominios de código (el 10 % de expertos captura el 48-51 % del peso en repositorios y código propio), y habilita ejecutar un MoE de este tamaño en un MacBook con 64 GB de memoria unificada mediante el motor picoforge, escrito en C con Metal. La licencia es qwen-community-1.0, no estándar y con posibles restricciones para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), 48 capas, 512 expertos por capa, router top-10 por token |
| Parámetros totales | 12.032.409.600 |
| Parámetros activos | 10 de 512 expertos por capa (fracción activa no disponible en parámetros absolutos) |
| Longitud de contexto | Hasta 100K tokens con MTP en 64 GB (Code5); ~74K (Code10); contexto nativo del modelo base no disponible |
| Tipos de cuantización | Q2 (base), Q4 (expertos calientes), mixta Q2/Q4 en Code5 (5 % de expertos a Q4) y Code10 (10 % a Q4) |
| Idiomas soportados | No disponibles en la información proporcionada; el ranking de expertos cubre C, C++, Python, JavaScript, Rust, Go, Java y TypeScript |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (parche con expertos Q4 y ranking.json; reconstrucción mediante script) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de tipo mixture-of-experts con 48 capas y 512 redes feed-forward pequeñas por capa; el router selecciona 10 expertos por token, lo que da una activación muy dispersa. El repositorio no entrena nada: parte del fichero Q2 publicado por antirez (137,1 GiB, revisión fijada por sha256) y del fichero Q4 oficial, y sustituye los expertos seleccionados por sus bytes Q4 sin recuantizar. La única información nueva es el ranking de qué expertos reciben los bits extra.

La selección se construye con un corpus de 98.304 tokens: ocho repositorios open source, uno por lenguaje (llama.cpp en C++, flask en Python, react en JavaScript, ripgrep en Rust, gin en Go, gson en Java, zod en TypeScript y curl en C), 12.288 tokens cada uno. La puntuación de cada experto es la suma del peso de compuerta del router sobre todos esos tokens, leída del modelo de 4 bits en cada capa troncal; los expertos se ordenan por ese total y el 5 % o el 10 % superior de cada capa pasa a 4 bits. La evaluación se hace sobre textos retenidos (tokio, cobra, guava, el propio código de picoforge y prosa en inglés posterior al lanzamiento del modelo) que nunca se usan para el ranking. El autor señala que el ranking por matrices de importancia de Unsloth solo alcanza el 8-12 % del peso del router en los expertos calientes, frente al 48-51 % de este método. La innovación de ingeniería es el soporte de este diseño de expertos mixtos en picoforge, un motor de inferencia en C con Metal para Apple Silicon; llama.cpp y DwarfStar no pueden cargar estos ficheros.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.8-Flash-Next.
- Generación y comprensión de código en C, C++, Python, JavaScript, Rust, Go, Java y TypeScript, dominio para el que se optimiza la asignación de bits.
- Decodificación con multi-token prediction (MTP), que produce exactamente los mismos tokens que la decodificación greedy.
- Ejecución local en Apple Silicon con memoria unificada de 64 GB mediante picoforge.
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.
- Multilingüismo: no disponible; la model card no documenta idiomas naturales soportados.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo permite autocompletado y generación de funciones en ocho lenguajes con un MoE de 12.000 millones de parámetros ejecutándose en un MacBook Pro M5 Pro de 64 GB, sin depender de la nube.
- Revisión y refactorización de repositorios: con Code5 y 100K tokens de contexto con MTP se pueden cargar ficheros completos o varios módulos y pedir cambios coherentes con el resto del proyecto.
- Agentes de programación de varios pasos: la ventana de 100K tokens permite mantener el estado de una tarea larga (lectura de código, edición, verificación) dentro de un solo contexto en hardware de consumo.
- Análisis de código en pipelines de integración continua: el motor picoforge puede invocarse desde scripts para tareas de clasificación, resumen de diffs o detección de patrones, con la ventaja de que los datos no salen de la máquina.
- Investigación sobre cuantización de MoE: el repositorio sirve como caso reproducible de asignación de bits por frecuencia de activación, con ranking, script de reconstrucción y métricas KL frente a Q4.
- Evaluación comparativa de calidad Q2 frente a mixta: útil para medir cuánto se recupera del modelo de 4 bits con un 5 % o un 10 % de expertos promocionados en dominios concretos (código frente a prosa).
- Despliegue en entornos con memoria limitada: Code10 ocupa 139,9 GiB en disco pero permite contextos de ~74K tokens con MTP en 64 GB, adecuado para equipos con un solo nodo de memoria unificada.

## Benchmarks y rendimiento

Calidad medida frente al modelo de 4 bits como referencia, con ventanas de 2.048 tokens; KL mide la divergencia de las probabilidades del siguiente token respecto a Q4 (menor es mejor) y top-1 la coincidencia del token más probable.

| Texto retenido | Q2 | Code5 | Code10 |
|---|---|---|---|
| Código de picoforge: KL / top-1 | 0,288 / 84,1 % | 0,217 / 85,9 % | 0,167 / 88,1 % |
| tokio, cobra, guava: KL / top-1 | 0,083 / 95,9 % | 0,034 / 97,6 % | 0,024 / 98,0 % |
| Prosa en inglés: KL / top-1 | 0,513 / 69,9 % | 0,485 / 70,7 % | 0,455 / 71,5 % |

Code10 elimina el 42 % de la distancia de Q2 a Q4 en código de picoforge no visto, el 71 % en los otros repositorios y el 11 % en prosa. El autor indica que no se han medido benchmarks de tarea como HumanEval+; estas cifras miden cercanía al modelo de 4 bits, no precisión en tareas.

Rendimiento en MacBook Pro M5 Pro de 64 GB:

| Métrica | Q2 | Code5 | Code10 |
|---|---|---|---|
| Decodificación greedy | 36-37 tok/s | ~-4 % | -5 a -8 % |
| Decodificación con MTP | 38,4 tok/s | 35,9 tok/s | No disponible |
| Prefill de prompt de 8K tokens | 31-32 s | No disponible | 32-33 s |
| Contexto máximo con MTP | 100K | 100K | ~74K |

Son ejecuciones únicas y vigiladas, no el protocolo completo 3+20 del proyecto.

## Requisitos de hardware

- VRAM/memoria: los ficheros reconstruidos ocupan 138,5 GiB (Code5) y 139,9 GiB (Code10) en disco; la ejecución con MTP en 64 GB de memoria unificada está verificada en MacBook Pro M5 Pro.
- GPU recomendadas: Apple Silicon con 64 GB de memoria unificada (M5 Pro verificado). No hay datos para A100, H100 ni RTX 4090, y picoforge solo soporta Apple Silicon con Metal.
- GPU de consumo: no cabe en GPUs de consumo con 8-24 GB de VRAM; el diseño depende de memoria unificada grande.
- Despliegue: exclusivamente picoforge; llama.cpp y DwarfStar no reconocen el diseño de expertos mixtos.
- Construcción: se necesitan ~140 GiB de disco libre por fichero, Python 3 con numpy y el Q2 de antirez en la revisión fijada; la reconstrucción tarda unos dos minutos y se verifica por sha256.
- Latencia y throughput: 36-37 tok/s en greedy y 38,4 tok/s con MTP en Q2; prefill de 8K tokens en 31-33 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next Q2 (antirez) | 12,03B totales, MoE top-10 | 100K con MTP en 64 GB | GGUF | qwen-community-1.0 | Público, 137,1 GiB |
| Qwen3.8-Flash-Next Q4 (oficial) | 12,03B totales, MoE top-10 | No disponible | safetensors/GGUF según publicación | qwen-community-1.0 | Público |
| Code5 / Code10 (este repo) | 12,03B totales, MoE top-10 | 100K / ~74K con MTP | GGUF mixto Q2/Q4 | qwen-community-1.0 | Parche de 6,6 GB más reconstrucción |
| Alternativas de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es interna al propio modelo base: Code5 y Code10 se sitúan entre Q2 y Q4 en calidad, con un coste de memoria intermedio y una pérdida de velocidad del 4-8 %.

## Limitaciones y advertencias

- El repositorio no contiene un modelo ejecutable por sí solo: requiere descargar el Q2 de antirez (137,1 GiB) y reconstruir el fichero con el script, con ~140 GiB de disco libre por variante.
- Solo funciona con picoforge; llama.cpp, Ollama, vLLM, TGI y DwarfStar no cargan el diseño de expertos mixtos.
- No hay benchmarks de tarea (HumanEval+, GSM8K, MMLU); las métricas publicadas miden divergencia respecto a Q4, no precisión real.
- El ranking está sesgado hacia código: el 10 % de expertos captura el 48-51 % del peso del router en repositorios y código propio, pero solo el 18 % en prosa, de modo que la mejora en texto general es marginal (11 % de reducción de KL).
- El corpus de ranking es pequeño (98.304 tokens de ocho repositorios) y puede no representar otros estilos de código o dominios.
- Riesgo de alucinación inherente al modelo base y agravado por la cuantización de 2 bits en los expertos no promocionados; la model card no documenta sesgos.
- Idiomas naturales soportados no documentados; no se puede asumir un rendimiento multilingüe equivalente al del modelo sin cuantizar.
- La licencia qwen-community-1.0 es no estándar y debe revisarse antes de cualquier uso comercial; el repositorio la etiqueta como "other".
- Las cifras de velocidad provienen de ejecuciones únicas, no de un protocolo estadístico completo, y el contexto máximo con MTP baja a ~74K en Code10.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ccristiann/Qwen3.8-Flash-Next-picoforge-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor picoforge: https://github.com/CCristiann/picoforge
- Notas de benchmark de cuantización: https://github.com/CCristiann/picoforge/blob/main/bench/quant/m4_20261123/README.md
- Fichero Q2 de antirez: https://huggingface.co/antirez/qwen3.8-flash-next-gguf (revisión d600fe1a43d2e1cdcadb85144ce3142f66f9eefe)
