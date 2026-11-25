# kingjones777/Ornith-1.5-122B-SuperRoc-GGUF

## Resumen

Ornith-1.5-122B-SuperRoc-GGUF es una cuantización comunitaria en formato GGUF del modelo base ornith-ai/Ornith-1.5-122B, publicada por el usuario kingjones777. El artefacto está específicamente orientado a la inferencia local en hardware AMD Strix Halo (APU Ryzen AI Max+ 395, arquitectura gráfica gfx1151) mediante el motor Super Roc, un runtime derivado de llama.cpp que incorpora formatos ROCm-FP4. El paquete incluye además un proyector multimodal en BF16, lo que confirma que el modelo base es capaz de procesar imágenes.

La relevancia de esta ficha reside en que documenta un caso de despliegue de un modelo de gran tamaño (denominado comercialmente como 122B) en una plataforma de memoria unificada de 128 GB, sin GPU discreta. El autor publica métricas medidas de carga, throughput de prompt y generación, así como resultados de tool calling y visión, lo que permite evaluar la viabilidad práctica del despliegue. No obstante, los metadatos de Hugging Face presentan inconsistencias notables: el campo de parámetros en safetensors indica 451.290.864 (≈0,45B), muy alejado de los 122B del nombre y del tamaño del repositorio (69,1 GB), por lo que debe tratarse con cautela.

La licencia declarada es MIT tanto en el modelo base como en la cuantización. La información disponible no incluye detalles sobre la arquitectura interna del modelo original, el dataset de entrenamiento ni resultados de benchmarks estándar, por lo que varios apartados de esta ficha se completan con la indicación explícita de "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal, inferido por la presencia de proyector mmproj) |
| Parametros totales | no disponible de forma fiable (el nombre comercial indica 122B; el campo safetensors del repo indica 451.290.864) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (contexto cargado y verificado en la medición del autor) |
| Tipos de cuantizacion | Q4_0 con formato ROCm-FP4, imatrix, cabeza Q6K; proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (dos shards principales + mmproj BF16) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ornith-ai/Ornith-1.5-122B en la documentación proporcionada. La presencia de un fichero `mmproj-Ornith-1.5-122B-BF16.gguf` de 0,91 GB y la verificación de la prueba de visión ("Vision: pass") indican que el modelo incorpora un codificador visual y un proyector multimodal, por lo que se trata de un modelo multimodal, presumiblemente con un transformer como columna vertebral, aunque este extremo no está confirmado.

En cuanto al proceso de cuantización, el autor aplica una cuantización Q4_0 con formatos ROCm-FP4, calibración mediante imatrix y una cabeza de atención en Q6K. El resultado se distribuye en dos shards (39,64 GB y 28,56 GB) que el motor Super Roc lee secuencialmente a partir del primer fichero. No se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" activable por petición mediante `chat_template_kwargs.enable_thinking` (desactivado por defecto en el comando de ejemplo).
- Procesamiento de imágenes (visión): el autor reporta resultado "pass" en la prueba de visión con el proyector BF16.
- Tool calling / function calling: el autor reporta 7/8 llamadas correctas en modo requerido y 7/8 en modo automático.
- Generación de código: el autor mide 47,3 tok/s de media en dos prompts de código.
- Decodificación especulativa mediante drafter MTP (`--speculative mtp -d 2 --min-draft-tokens 1`).
- Prompt lookup para acelerar la generación.
- Caché de prompt: en el segundo turno se reutilizan 6.961 de 6.986 tokens del prompt.
- Capacidades multilingües: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el soporte de tool calling lo hace viable.

## Casos de uso

- Asistente de código local en estación de trabajo Strix Halo: con 47,3 tok/s medidos en generación de código y 131.072 tokens de contexto, el modelo puede mantener conversaciones largas sobre un repositorio completo sin salir del equipo, integrándose en editores mediante la API compatible servida por Super Roc en `127.0.0.1:8080`.
- Análisis de documentos extensos con imágenes: la combinación de contexto de 131K tokens y proyector multimodal permite procesar informes con tablas, gráficos y texto en una sola pasada, útil para auditoría documental o extracción de datos.
- Automatización de tareas con herramientas: los resultados de tool calling (7/8 en modo requerido y automático) permiten construir agentes que invoquen APIs locales, consulten bases de datos o ejecuten comandos, con la salvedad de que la tasa de acierto no es del 100 %.
- Asistente de atención al cliente en despliegue on-premise: la licencia MIT y la ejecución local sin dependencia de la nube facilitan el cumplimiento de requisitos de privacidad; el contexto largo permite arrastrar historial multi-turno y documentación de producto.
- Prototipado de aplicaciones multimodales en hardware de consumo profesional: con 128 GB de memoria unificada y un tiempo de carga de 74 s, un equipo Ryzen AI Max+ 395 puede servir como banco de pruebas para aplicaciones de visión y lenguaje sin adquirir GPU discretas.
- Generación de documentación técnica y resúmenes de código: el throughput de prompt (633,9 tok/s en p1k y 593,5 tok/s en p8k) hace viable procesar grandes volúmenes de texto de entrada para resumir, traducir o documentar bases de código.
- Investigación sobre cuantización ROCm-FP4: el artefacto sirve como referencia reproducible para estudiar el impacto de la cuantización Q4_0 con imatrix y cabeza Q6K en calidad y velocidad sobre gfx1151.

## Benchmarks y rendimiento

El autor publica métricas de rendimiento medidas en un Ryzen AI Max+ 395 con 128 GB, Super Roc 0.20.0 (release candidate), una petición a la vez, el 23 de noviembre de 2026:

| Metrica | Valor |
|---|---|
| Tiempo de carga (s) | 74 |
| Prompt tok/s (p1k) | 633,9 |
| Prompt tok/s (p8k) | 593,5 |
| Generacion tok/s (p1k) | 38,41 |
| Generacion tok/s (p8k) | 29,94 |
| Generacion de codigo tok/s | 47,3 (media de 2 prompts) |
| Tool calls (requerido / auto) | 7/8 / 7/8 |
| Cache de prompt turno 2 (cacheado / prompt) | 6.961 / 6.986 tokens |
| Contexto cargado | 131.072 tokens |
| Vision | pass |
| Drafter | mtp |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria: el repositorio ocupa 69,1 GB; los dos shards principales suman 68,20 GB y el proyector 0,91 GB. Se requiere un sistema con al menos ~70 GB de memoria disponible para cargar los pesos, más el espacio de caché KV para el contexto configurado.
- Plataforma objetivo: AMD Strix Halo, concretamente Ryzen AI Max+ 395 con 128 GB de memoria unificada y gráficos gfx1151. El autor no documenta compatibilidad con otras plataformas.
- GPU discretas: no disponible. El artefacto está construido y probado para ROCm-FP4 sobre gfx1151; no se indica soporte para A100, H100, RTX 4090 ni otras GPU.
- Motor de inferencia: Super Roc (https://github.com/kingjones30/superroc), derivado de llama.cpp/ggml. El autor documenta integración con Lemonade mediante `lemonade config set llamacpp.rocm_bin=/opt/superroc/lemonade`.
- Latencia y throughput: carga en 74 s; 38,41 tok/s de generación en p1k y 29,94 tok/s en p8k; 633,9 tok/s de procesamiento de prompt en p1k. Medido con una sola petición concurrente.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, tamaño o tarea, ni datos de rendimiento de alternativas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Inconsistencia de metadatos: el campo de parámetros en safetensors del repositorio indica 451.290.864, mientras que el nombre comercial y el tamaño del repositorio (69,1 GB) apuntan a un modelo mucho mayor. Debe verificarse antes de asumir cualquier cifra de tamaño.
- Plataforma muy restringida: el artefacto está diseñado y probado exclusivamente para Strix Halo (gfx1151) con Super Roc; no hay evidencia de funcionamiento en CUDA, otras GPU ROCm o CPU convencional.
- Dependencia de un motor no estándar: Super Roc es un proyecto del mismo autor; su mantenimiento, estabilidad y compatibilidad futura no están garantizados.
- Tool calling no perfecto: la tasa medida es 7/8 tanto en modo requerido como automático, por lo que en producción deben implementarse validaciones y reintentos.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos: no documentados.
- Idiomas soportados: no disponibles; no se puede garantizar calidad en castellano ni en otros idiomas.
- Contexto: aunque se cargan 131.072 tokens, no se han publicado evaluaciones de calidad en contextos largos (needle-in-a-haystack u otras).
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base ornith-ai/Ornith-1.5-122B antes de su explotación.
- Repositorio con muy poca tracción (49 descargas, 0 likes) y creado recientemente; no hay evidencia de validación independiente de las métricas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Ornith-1.5-122B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de integración con Lemonade: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4 y trabajo previo sobre llama.cpp): https://github.com/charlie12345/ROCmFPX
