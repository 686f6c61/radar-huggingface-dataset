# sebika123123/Qwen3.8-27B-Fast-Coder

## Resumen

`sebika123123/Qwen3.8-27B-Fast-Coder` no es un modelo con pesos propios, sino un repositorio de recetas y scripts de despliegue que documenta cómo aproximadamente duplicar la velocidad de inferencia de Qwen3.8-27B en un PC con una única GPU de consumo. La ganancia no proviene de un reentrenamiento ni de unos pesos distintos, sino de la configuración de decodificación especulativa en llama.cpp: se combina la cabeza de predicción multi-token (MTP) integrada en el modelo con un modo n-gram que reutiliza texto ya presente en el contexto (contenido de ficheros, salida de herramientas).

El modelo subyacente, Qwen3.8-27B, es un transformer denso de 27.000 millones de parámetros, visión-lenguaje, con 262.144 tokens de contexto nativo y orientado a código, trabajo profesional, investigación y tareas agénticas de horizonte largo. El repositorio del autor aporta los ficheros de lanzamiento para Windows y Linux/macOS, los flags exactos de llama.cpp, una tabla de qué cuantización GGUF usar según la VRAM disponible y una batería de 13 tareas de agente ejecutadas tres veces cada una para medir el efecto.

Su relevancia es práctica: demuestra que un modelo de 27B puede servir como agente de código local a 98-113 tok/s en una RTX 5070 Ti de 16 GB, con el mismo trabajo resuelto y la mitad de tiempo por tarea, sin depender de APIs en la nube. El repositorio se publicó el 24 de octubre de 2026 bajo licencia MIT, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B, con cabeza MTP de predicción multi-token). El repositorio en sí no contiene pesos: solo configuración de despliegue y decodificación especulativa sobre llama.cpp |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos en el modelo base; la configuración medida en este repositorio usa 32.768 tokens (16.384 si hay problemas de memoria) |
| Tipos de cuantizacion | GGUF dinámicas de Unsloth: `UD-IQ3_XXS` (10,9 GB), `UD-Q2_K_XL` (12 GB de VRAM), `UD-Q4_K_M` (24 GB o más). También se mencionan ficheros de 2 bits, descartados por el autor |
| Idiomas soportados | El repositorio declara únicamente inglés (`en`). El multilingüismo del modelo base no se detalla en la información disponible |
| Licencia | MIT para el repositorio. La licencia del modelo base Qwen3.8-27B no se especifica en la información proporcionada |
| Formato de pesos | No incluidos. Los pesos se obtienen en GGUF desde `unsloth/Qwen3.8-27B-GGUF` |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una capa de configuración sobre llama.cpp (build 11696, la que distribuye Unsloth Studio) y sobre Unsloth Studio. La técnica central es la decodificación especulativa doble. Por un lado, `--spec-type draft-mtp` explota la cabeza MTP del propio modelo (el GGUF debe declarar `nextn_predict_layers = 1`, verificable con `gguf_info.py`) para proponer los siguientes 4 tokens. Por otro, `ngram-mod` copia secuencias de texto que ya aparecen en el contexto, algo especialmente rentable en edición de código y en la salida repetitiva de herramientas. El modelo principal verifica todas las propuestas en una sola pasada, de modo que la salida es idéntica y solo cambia el coste temporal.

Los flags medidos son: `--spec-type ngram-mod,draft-mtp --spec-draft-n-max 4 -ctk q8_0 -ctv q8_0 -np 1 -c 32768 -fa on -ngl 99 --jinja`. El servidor resultante expone una API compatible con OpenAI en `http://127.0.0.1:8812/v1` sin clave y con soporte de tool calling gracias a `--jinja`. El autor documenta también qué no funcionó: proponer más de 4 tokens por adelantado, el drafter DFlash 2 (+4-7 % de velocidad a cambio de 1,1 GB adicionales) y los ficheros de 2 bits, que ahorran memoria pero no tiempo porque necesitan más tokens por tarea. No hay información en la documentación consultada sobre el dataset de entrenamiento, el número de tokens vistos ni las fases de RLHF/DPO del modelo base.

## Capacidades

- Aceleración de inferencia local: duplica el throughput de Qwen3.8-27B en tareas de agente según las mediciones del autor (de 50 a 98 tok/s con razonamiento activado).
- Servidor compatible con la API de OpenAI en `127.0.0.1:8812/v1`, sin autenticación, apto para conectar herramientas de terceros.
- Tool calling y function calling mediante el flag `--jinja`, requisito habitual de los agentes de código.
- Integración directa con asistentes de programación: Cline, OpenCode y Continue se conectan al endpoint indicado por el servidor o por Unsloth Studio.
- Reutilización de contexto mediante `ngram-mod`: copia contenido de ficheros y salidas de herramientas, lo que reduce el coste en tareas de edición repetitiva.
- Compatibilidad con la cabeza MTP del modelo base para generación especulativa verificada, sin pérdida de calidad según el autor.
- Scripts de arranque listos para Windows (`launch\serve.bat`) y Linux/macOS (`launch/serve.sh`), con variables de entorno para la ruta del modelo y del binario.
- Capacidades heredadas del modelo base Qwen3.8-27B (no verificadas en este despliegue GGUF): generación de código, razonamiento configurable, tareas agénticas de múltiples pasos, contexto de 262.144 tokens y entrada de texto e imagen.
- Control de razonamiento: el autor reporta cifras separadas con *thinking* activado y desactivado, útil para alternar entre calidad y latencia.
- Verificación reproducible: incluye `docs/METHOD.md` y `results/RESULTS.md` con todas las tablas y las condiciones de medida.

## Casos de uso

- Asistente de código local en un PC de 16 GB: cargar `UD-IQ3_XXS` con MTP y n-gram, apuntar Cline o Continue al endpoint local y trabajar con razonamiento desactivado para autocompletado y ediciones rápidas (5,9 s por tarea medida frente a 12,0 s sin la receta).
- Refactorización multi-archivo con agente: las tareas que releen y reescriben ficheros completos se benefician de `ngram-mod`, que reutiliza el texto ya presente en el contexto; con razonamiento activado el autor mide 12,5 s por tarea frente a 23,9 s.
- Bucles de test y corrección: el tool calling vía `--jinja` permite que el agente ejecute tests, lea la salida y parchee el código en pasos sucesivos, con un solo slot paralelo para no fragmentar la VRAM.
- Backend local compatible con OpenAI para CI/CD: desplegar `llama-server` en una máquina con GPU y sustituir llamadas a APIs externas por `http://127.0.0.1:8812/v1` en scripts de revisión de código o generación de documentación técnica.
- Análisis de repositorios medianos: con 32.768 tokens de contexto configurados (ampliables hasta los 262.144 nativos del modelo base, con coste de VRAM) se pueden pasar módulos completos y ficheros de cabecera en una sola conversación.
- Evaluación de infraestructura de inferencia: el repositorio sirve como banco de pruebas reproducible para comparar configuraciones de decodificación especulativa (sin especulación, MTP solo, MTP + ngram, drafter DFlash 2) sobre el mismo modelo y la misma GPU.
- Sustitución de API en la nube para equipos pequeños: coste marginal cero por token una vez amortizada la GPU, con la salvedad de que el rendimiento medido corresponde a una única máquina.
- Prototipado de asistentes sobre imágenes: el modelo base acepta texto e imagen, aunque la información disponible no confirma que la ruta GGUF + llama.cpp de esta receta soporte entrada visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor aporta métricas de throughput y latencia sobre 13 tareas de agente ejecutadas tres veces cada una en una RTX 5070 Ti de 16 GB:

| Configuración | Razonamiento | Tokens/s | Tiempo por tarea |
|---|---|---|---|
| llama-server sin especulación | Activado | 50 | 23,9 s |
| llama-server sin especulación | Desactivado | 50 | 12,0 s |
| MTP + ngram-mod, 4 draft tokens | Activado | 98 | 12,5 s |
| MTP + ngram-mod, 4 draft tokens | Desactivado | 113 | 5,9 s |

Datos adicionales del repositorio:

| Observación | Valor reportado |
|---|---|
| Mejora de MTP + ngram sobre MTP solo en tareas de agente | +25-30 % |
| Unsloth Studio en modo Auto, prueba temprana con MTP desactivado | ~49 tok/s |
| Unsloth Studio en modo Auto, MTP activo con 1 slot paralelo (4 prompts genéricos, contexto 8k) | ~80 tok/s |
| Drafter DFlash 2 | +4-7 % de velocidad por 1,1 GB adicional de VRAM |
| Tareas resueltas con y sin la receta | Las mismas (13 tareas, 3 intentos) |

## Requisitos de hardware

- VRAM: 16 GB para la configuración medida (`UD-IQ3_XXS`, 10,9 GB de pesos más caché KV cuantizada a q8_0 y 32.768 tokens de contexto).
- 12 GB: funciona con `UD-Q2_K_XL`, según el autor, con menor fiabilidad en el uso de herramientas; no probado en una tarjeta de 12 GB.
- 24 GB o más: `UD-Q4_K_M`, que debería ser igual o mejor en calidad pero más lento; no probado.
- 8 GB: descartado explícitamente, el modelo no cabe.
- GPU recomendada: RTX 5070 Ti de 16 GB, la única sobre la que se publican medidas. Cualquier NVIDIA con 16 GB o más debería poder ejecutar la receta. No hay datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, a partir de 16 GB con la cuantización IQ3_XXS.
- Despliegue: llama.cpp (build 11696 o una release actual con soporte de `--spec-type draft-mtp` y `ngram-mod`), `llama-server` con API OpenAI, o Unsloth Studio como interfaz gráfica. La información consultada menciona además Ollama y LM Studio para el modelo base, pero no como parte de esta receta.
- Throughput y latencia: 98 tok/s (razonamiento activado) y 113 tok/s (desactivado); 12,5 s y 5,9 s por tarea respectivamente, frente a 23,9 s y 12,0 s sin especulación.
- Nota operativa: Unsloth Studio puede desactivar MTP en modo Auto según su estimación de memoria libre; seleccionar «MTP+Ngram» y 4 draft tokens manualmente evita esa dependencia.

## Comparativa con modelos similares

La información disponible no incluye datos de otros modelos de la misma categoría (por ejemplo, alternativas densas de ~27-32B), por lo que la comparación se limita a las configuraciones documentadas sobre el mismo modelo base:

| Configuración | Pesos | Throughput (razonamiento on) | Tiempo por tarea | Requisito de VRAM | Licencia |
|---|---|---|---|---|---|
| Este repositorio (MTP + ngram-mod, 4 draft tokens) | GGUF `UD-IQ3_XXS` de unsloth | 98 tok/s | 12,5 s | 16 GB | MIT (repo) |
| llama.cpp sin especulación | GGUF `UD-IQ3_XXS` de unsloth | 50 tok/s | 23,9 s | 16 GB | MIT (repo) |
| Unsloth Studio en modo Auto (MTP activo, 1 slot) | GGUF `UD-IQ3_XXS` de unsloth | ~80 tok/s | No disponible | 16 GB | MIT (repo) |
| Unsloth Studio en modo Auto (prueba temprana, MTP desactivado) | GGUF `UD-IQ3_XXS` de unsloth | ~49 tok/s | No disponible | 16 GB | MIT (repo) |

Como vías alternativas de servicio del mismo modelo base, la búsqueda web menciona Cerebras Inference, LM Studio y Ollama, sin cifras de rendimiento comparables en la información proporcionada. Comparativa con modelos de otras familias: no disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no se puede descargar y ejecutar por sí solo. Requiere obtener el GGUF desde `unsloth/Qwen3.8-27B-GGUF`.
- Todas las cifras provienen de una sola máquina (una RTX 5070 Ti), con tres intentos por tarea y 13 tareas de agente; no son estadísticamente robustas ni extrapolables a otro hardware.
- No hay benchmarks de calidad publicados. La afirmación de que «el mismo trabajo se resuelve» se apoya en la verificación de la decodificación especulativa, no en una evaluación estandarizada.
- El MTP exige un GGUF que incluya la capa `nextn_predict_layers = 1`; otras cuantizaciones o conversiones pueden no tenerla y perder la mayor parte de la aceleración.
- Los flags `--spec-type ngram-mod,draft-mtp` dependen de una versión de llama.cpp reciente; en builds antiguas el servidor no arrancará o ignorará la opción.
- Con 8 GB de VRAM el modelo no cabe. Las configuraciones de 12 GB y 24 GB no han sido probadas por el autor.
- Reducir la cuantización no reduce el tiempo por tarea: aumenta el número de tokens necesarios, según las mediciones del autor.
- El repositorio declara únicamente inglés. El comportamiento en castellano u otros idiomas del modelo base no se documenta en la información disponible.
- La cuantización de la caché KV a q8_0 es una decisión de rendimiento; no se publica ninguna medición de su impacto en la calidad de las respuestas largas.
- El modo Auto de Unsloth Studio puede desactivar MTP según la memoria libre estimada, con lo que se pierde aproximadamente la mitad de la mejora.
- Licencia MIT para los scripts, pero la licencia del modelo base Qwen3.8-27B no se especifica en la información consultada: conviene verificarla antes de un uso comercial.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día; no cuenta con validación de la comunidad.
- No se documentan sesgos del modelo base ni tasas de alucinación en la información proporcionada.
- El soporte de entrada de imagen del modelo base no está confirmado para esta ruta de despliegue GGUF + llama.cpp.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sebika123123/Qwen3.8-27B-Fast-Coder
- Pesos GGUF recomendados: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Metodología de medida: `docs/METHOD.md` (https://huggingface.co/sebika123123/Qwen3.8-27B-Fast-Coder/blob/main/docs/METHOD.md)
- Resultados completos: `results/RESULTS.md` (https://huggingface.co/sebika123123/Qwen3.8-27B-Fast-Coder/blob/main/results/RESULTS.md)
- Guía de flags de lanzamiento: `launch/README.md` (https://huggingface.co/sebika123123/Qwen3.8-27B-Fast-Coder/blob/main/launch/README.md)
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Model card de Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/README.md
- Documentación de Unsloth Studio: https://unsloth.ai/docs
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guía de agente local con Ollama y OpenCode: https://www.kdnuggets.com/run-qwen3-8-27b-as-a-local-ai-coding-agent-in-just-3-commands
- Documentación de Cerebras Inference: https://inference-docs.cerebras.ai/models/qwen-3.8-27b
