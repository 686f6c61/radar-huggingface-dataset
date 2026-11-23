# kingjones777/Qwen3.8-27B-CodeForge-3xMerge-SuperRoc-GGUF

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-SuperRoc-GGUF es una cuantización GGUF en formato ROCm-FP4 del modelo xtools-at/Qwen3.8-27B-CodeForge-3xMerge, publicada por el usuario kingjones777. El objetivo declarado es ofrecer una build optimizada para Super Roc, un motor de inferencia local orientado a Strix Halo (AMD Ryzen AI Max+ 395, gfx1151) que aprovecha los formatos ROCm-FP4 y el soporte de decodificación especulativa MTP para acelerar la generación en hardware de consumo.

El modelo base es un merge de tres variantes de la familia Qwen3.8-27B, orientado a generación de código y con capacidad multimodal (pipeline image-text-to-text), según los tags del repositorio. La build incluye un fichero principal cuantizado a Q4_0 con imatrix y un proyector multimodal BF16 separado, lo que permite ejecutar visión junto al modelo de lenguaje.

La relevancia de esta ficha radica en que documenta una build muy específica de hardware (Strix Halo con ROCm) y de motor (Super Roc), con métricas de rendimiento medidas por el autor sobre un único equipo. No se dispone de información sobre el entrenamiento del modelo base, su composición de datos ni resultados de benchmarks estándar, por lo que muchos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3.8-27B; no se detalla en la información proporcionada) |
| Parametros totales | 460.730.096 según safetensors del repo; el nombre comercial indica 27B, dato no verificado en la información disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (contexto cargado en la medición del autor) |
| Tipos de cuantizacion | Q4_0 con imatrix, formato ROCm-FP4; proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero principal y mmproj separado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.8-27B y de su pipeline image-text-to-text, lo que implica un componente de visión acoplado a un modelo de lenguaje. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación.

La innovación técnica destacable de esta build es el uso del formato ROCm-FP4 junto con decodificación especulativa MTP (multi-token prediction) sobre el motor Super Roc. El autor reporta una perplejidad de 5,21 en wikitext-2 frente a 5,14 de un Q4_K_M estándar del mismo modelo, lo que indica una degradación muy leve por la cuantización. También se incluye prompt lookup y caché de prompt, con 6.961 de 6.985 tokens reutilizados en el segundo turno de una conversación.

## Capacidades

- Generación de texto y código, con un rendimiento medido de 32,0 tok/s en generación de código (media de dos prompts).
- Capacidad multimodal image-text-to-text, verificada con el test de visión del autor (resultado: pass).
- Soporte de tool calling: 7 de 8 llamadas correctas en modo required y 7 de 8 en modo auto.
- Modo thinking configurable por petición mediante chat_template_kwargs.enable_thinking; desactivado por defecto en el comando de ejemplo.
- Decodificación especulativa MTP con drafter integrado.
- Soporte de contexto largo de hasta 131.072 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Strix Halo: el modelo puede generar código a 32 tok/s en un Ryzen AI Max+ 395 con 128 GB, lo que permite integrarlo en un IDE o CLI sin depender de la nube.
- Automatización con tool calling: con 7 de 8 llamadas correctas en modo auto, es viable para agentes que invocan funciones externas (APIs, shell, bases de datos) en flujos controlados.
- Análisis de imágenes y capturas de pantalla: el proyector BF16 y el pipeline image-text-to-text permiten describir o extraer información de imágenes, útil para procesar documentación técnica o capturas de errores.
- Conversaciones de contexto largo: la ventana de 131.072 tokens y la caché de prompt (6.961 de 6.985 tokens reutilizados en el segundo turno) lo hacen adecuado para sesiones multi-turno sobre repositorios o documentación extensa.
- Despliegue en estaciones de trabajo con GPU AMD: al estar empaquetado para Super Roc y ROCm-FP4, encaja en entornos con Ryzen AI Max+ 395 donde no hay GPU NVIDIA disponible.
- Integración con Lemonade: el comando `lemonade pull` permite incorporar el modelo a un stack de inferencia local ya existente, útil para prototipado rápido.
- Razonamiento con modo thinking bajo demanda: se puede activar `enable_thinking` por petición para tareas que requieran cadenas de razonamiento más largas, manteniéndolo desactivado para respuestas rápidas.

## Benchmarks y rendimiento

Métricas medidas por el autor sobre Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.0 (release candidate), una petición a la vez, el 2026-11-23:

| Metrica | Valor |
|---|---|
| Tiempo de carga (s) | 21 |
| Prompt tok/s (p1k) | 578,7 |
| Prompt tok/s (p8k) | 615,1 |
| Generacion tok/s (p1k) | 26,55 |
| Generacion tok/s (p8k) | 67,18 |
| Generacion de codigo tok/s | 32,0 (media de 2 prompts) |
| Tool calls (required / auto) | 7/8 / 7/8 |
| Cache de prompt turno 2 (cached / prompt tokens) | 6.961 / 6.985 |
| Contexto cargado | 131.072 tokens |
| Vision | pass |
| Drafter | mtp |
| Perplejidad wikitext-2 | 5,21 (Q4_K_M stock del mismo modelo: 5,14) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el fichero principal ocupa 15.309.796.896 bytes (~15,3 GB) y el proyector multimodal 931.145.664 bytes (~0,93 GB), lo que suma unos 16,2 GB de pesos; con contexto de 131.072 tokens hay que añadir la caché KV, no cuantificada en la información disponible.
- GPU recomendada según el autor: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada.
- Compatibilidad con GPU de consumo: no se documenta soporte para RTX 4090, A100, H100 ni otras GPU NVIDIA en la información proporcionada; el motor Super Roc está orientado a Strix Halo y ROCm.
- Opciones de despliegue: Super Roc (`superroc serve`), Lemonade (`lemonade pull`), y por herencia de llama.cpp/ggml, aunque no se confirma compatibilidad con llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: 21 s de carga, 578,7-615,1 tok/s de prompt y 26,55-67,18 tok/s de generación según longitud de prompt, medidos en un único equipo con una petición concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CodeForge-3xMerge-SuperRoc-GGUF (este) | 460.730.096 según safetensors (nombre comercial 27B) | 131.072 | apache-2.0 | GGUF ROCm-FP4 | Optimizado para Strix Halo y Super Roc; perplejidad 5,21 |
| xtools-at/Qwen3.8-27B-CodeForge-3xMerge (base) | no disponible | no disponible | no disponible | no disponible | Modelo original del que deriva esta cuantización |
| Q4_K_M stock del mismo modelo | no disponible | no disponible | no disponible | GGUF | Perplejidad 5,14, ligeramente mejor que esta build |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La información sobre el modelo base (arquitectura, datos de entrenamiento, idiomas) no está disponible, lo que impide evaluar sesgos y cobertura lingüística con rigor.
- El número de parámetros del safetensors (460.730.096) no concuerda con el nombre comercial (27B); conviene verificar el modelo base antes de asumir capacidades o requisitos.
- El rendimiento medido corresponde a un único equipo (Ryzen AI Max+ 395, 128 GB) y a una versión release candidate de Super Roc; no es extrapolable a otras configuraciones.
- El soporte de tool calling es del 87,5 % (7 de 8) en las pruebas del autor, por lo que se recomienda validación y fallback en producción.
- La compatibilidad con motores distintos de Super Roc y Lemonade no está confirmada; el uso en llama.cpp, vLLM u Ollama requeriría verificación adicional.
- La licencia apache-2.0 permite uso comercial, pero las condiciones del modelo base y de los datos de entrenamiento no se detallan en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplicable el riesgo habitual de los modelos de lenguaje.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-27B-CodeForge-3xMerge-SuperRoc-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX: https://github.com/charlie12345/ROCmFPX
