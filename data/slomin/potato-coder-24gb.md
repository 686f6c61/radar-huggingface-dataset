# Slomin/Potato-CODER-24GB

## Resumen

Potato-CODER-24GB es un paquete de despliegue y cuantización, no un modelo entrenado, publicado por el usuario Slomin sobre el modelo base ukisai/Swift-Qwen3.8-27b (a su vez un post-entrenamiento de Qwen/Qwen3.8-27B orientado a razonamiento más corto). Su propuesta concreta es ejecutar un modelo de 27.320.697.856 parámetros con los 262.144 tokens de contexto completos en una única tarjeta NVIDIA de 24 GB, manteniendo activas la visión y la decodificación especulativa por predicción multi-token (MTP). El repositorio ocupa 15,4 GB y la versión publicada se identifica como v1.0-rc1.

La arquitectura del modelo base es "qwen35 hybrid": un transformer híbrido que combina capas DeltaNet con atención completa cada cuatro capas, 64 bloques más un bloque MTP, y una ventana de 262.144 tokens. La receta de cuantización, denominada "B3", aplica Q5_K a `output.weight` e IQ4_XS al resto de tensores cuantizados, con una importance matrix calibrada sobre código que incluye la cabeza de salida, lo que da 4,31 bits por peso. El resultado son 13,7 GiB de modelo (con la cabeza MTP incrustada) más 0,6 GiB de proyector de visión Q8_0.

La relevancia práctica está en el binomio VRAM/prestaciones medido de extremo a extremo: pico de 23.956 MiB en una RTX 3090 con un turno de 261.808 tokens y una imagen de 8 MP (169 MiB de margen), 86 tok/s de decodificación en respuestas cortas y 29 tok/s con el contexto lleno, con 63/80 en LiveCodeBench-80 (medium effort, tope de 16k) frente a 60/80 de una IQ4_XS con receta estándar de la misma familia. El precio es una dependencia fuerte de una rama propia de llama.cpp y una licencia no estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen35 hybrid (DeltaNet + atención completa cada 4 capas), 64 bloques + bloque MTP |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | No aplica (modelo denso híbrido, no MoE) |
| Longitud de contexto | 262.144 tokens (261.808 medidos en la prueba de VRAM; 196.608 estimados en el script de Windows) |
| Tipos de cuantización | Receta "B3": `output.weight` en Q5_K, resto de tensores cuantizados en IQ4_XS (4,31 bits/peso); proyector de visión en Q8_0; caché KV con claves q8_0 y valores q5_0 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | swift-open-license-1.0 (campo `license: other`); el modelo base se distribuye además bajo Apache-2.0, incluida como LICENSE-APACHE-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio incluye `IQ4_XS/Potato-CODER-24GB-IQ4_XS.gguf` y `mmproj-Potato-CODER-24GB-Q8_0.gguf` |
| Tamaño de pesos | 13,7 GiB el modelo (cabeza MTP incluida) + 0,6 GiB el proyector de visión |
| Pipeline declarado | image-text-to-text (visión activa) |
| Repositorio | 15,4 GB; fecha de creación 2026-09-17 |

## Arquitectura y entrenamiento

No hubo entrenamiento: el autor lo declara explícitamente ("Nothing was trained here: this is a quantization and a deployment recipe"). El punto de partida es Swift-Qwen3.8-27B, un post-entrenamiento de Qwen3.8-27B realizado por UkisAI con el objetivo de acortar las cadenas de razonamiento, y la torre de visión se mantiene sin cambios respecto a Qwen3.8-27B (el proyector se distribuye en Q8_0 a partir del F16 original de UkisAI). La arquitectura heredada es híbrida: capas DeltaNet combinadas con atención completa cada cuatro capas, 64 bloques más un bloque de predicción multi-token, y 262.144 tokens de contexto.

La innovación técnica del paquete es doble. Por un lado, la receta de cuantización "B3" con importance matrix calibrada sobre código, que incluye la cabeza de salida en la calibración y reserva Q5_K para `output.weight` mientras comprime el resto a IQ4_XS, alcanzando 4,31 bits por peso. Por otro, el parche `--mmproj-swap-draft` de la rama de llama.cpp del autor: el proyector de visión permanece fuera de la GPU y, cuando llega una imagen, el servidor presta la VRAM del contexto de borrador a un proyector temporal en GPU, codifica la imagen y devuelve esa memoria, con un coste aproximado de medio segundo por imagen y ningún coste en turnos de solo texto. Esto es lo que permite coexistir en una sola tarjeta de 24 GB con la visión, la cabeza MTP y los 262k tokens de contexto. La rama añade además kernels de flash-attention q8_0/q5_0 compilados, necesarios para mantener la velocidad de decodificación con la caché KV de 8 bits en claves y 5 bits en valores.

## Capacidades

- Generación de código y razonamiento de programación, con un resultado medido de 63/80 en LiveCodeBench-80 (medium effort, tope de 16k) y 8/20 en el nivel difícil del mismo conjunto.
- Modo de razonamiento (thinking) configurable mediante `reasoning_effort` y `preserve_thinking` en los kwargs de plantilla de chat; la model card usa `reasoning_effort: medium` en el ejemplo de servicio.
- Contexto largo real: sesiones de 190k y 250k tokens con tareas ejecutables resueltas 8/8 y 6/8 respectivamente (control con caché f16 en dos tarjetas: 8/8 y 7/8).
- Visión (image-text-to-text): entrada de imágenes de hasta 8 MP en la prueba de VRAM, con la torre de visión de Qwen3.8-27B intacta y el proyector en Q8_0.
- Decodificación especulativa multi-token mediante la cabeza MTP incrustada en el GGUF (`--spec-type draft-mtp --spec-draft-n-max 3`).
- Conversación multi-turno con plantilla de chat Jinja (`--jinja`) y parámetros de muestreo recomendados por el autor (temp 1.0, top-p 0.95, top-k 20, min-p 0.0).
- Multilingüe limitado a inglés y chino según los metadatos del repositorio.
- Tool calling y comportamiento de agente: no se documenta explícitamente en la información disponible.
- Etiquetado como compatible con endpoints (`endpoints_compatible`), lo que facilita su integración en infraestructura de inferencia ya existente.

## Casos de uso

- Refactorización de monorepos grandes: con 262.144 tokens de contexto, el modelo puede recibir varios cientos de miles de tokens de código en una sola pasada, incluyendo cabeceras, tests y ficheros de configuración, y proponer cambios coherentes sin trocear el repositorio ni perder referencias cruzadas entre módulos.
- Agentes de código de sesión larga: los resultados publicados muestran 8/8 y 6/8 tareas ejecutables resueltas tras sesiones reales de 190k y 250k tokens, lo que lo hace adecuado para bucles de edición-compilación-test que acumulan contexto durante horas sin reiniciar la conversación.
- Integración en CI/CD como revisor de parches: la rama de llama.cpp expone `llama-server`, por lo que se puede desplegar como servicio HTTP en un runner con una única GPU de 24 GB y consumirlo desde un job que reciba el diff más los ficheros afectados y devuelva comentarios de revisión.
- Depuración asistida por capturas: al soportar image-text-to-text, admite capturas de pantalla de trazas, paneles de error o diagramas de arquitectura junto al código implicado, útil en soporte técnico interno y en triaje de incidencias donde el error solo aparece en una interfaz gráfica.
- Migración de código legacy: el contexto largo permite pasar módulos completos escritos en un lenguaje o framework antiguo junto con la documentación de destino y obtener traducciones consistentes en varios ficheros a la vez, reduciendo las incoherencias típicas de migrar fichero a fichero.
- Generación y reparación de tests: a partir de la implementación y de la suite existente en el mismo contexto, el modelo puede generar casos que respeten los patrones ya presentes en el proyecto; el resultado medido en LiveCodeBench sugiere competencia suficiente en tareas de ejecución verificable.
- Despliegue en puesto de trabajo o on-premise con privacidad estricta: al caber en una sola tarjeta de 24 GB con todo el contexto activo, es viable ejecutarlo en una estación local sin enviar código propietario a servicios externos, con 13,7 GiB de pesos en disco.
- Análisis de trazas y logs extensos: sesiones de 250k tokens permiten volcar ficheros de log completos y pedir correlación de eventos o hipótesis de causa raíz manteniendo toda la secuencia temporal en el contexto.

## Benchmarks y rendimiento

Resultados publicados en la model card (no se han publicado otros benchmarks en la información disponible):

| Benchmark | Configuración | Resultado |
|---|---|---|
| LiveCodeBench-80 | Potato-CODER-24GB, medium effort, tope de 16k | 63/80 |
| LiveCodeBench-80 (nivel difícil) | Potato-CODER-24GB, medium effort, tope de 16k | 8/20 |
| LiveCodeBench-80 (referencia) | IQ4_XS con receta estándar de la misma familia y caché q8 | 60/80 |
| Tareas ejecutables tras sesión real de 190k | Potato-CODER-24GB | 8/8 |
| Tareas ejecutables tras sesión real de 250k | Potato-CODER-24GB | 6/8 |
| Tareas ejecutables tras sesión real de 190k / 250k | Control con caché f16 en dos tarjetas | 8/8 y 7/8 |

Rendimiento de inferencia medido en una RTX 3090 con MTP activado:

| Métrica | Valor |
|---|---|
| Decodificación, contexto corto | 86 tok/s |
| Decodificación con razonamiento, 33k | 64 tok/s |
| Decodificación con razonamiento, 75k | 55 tok/s |
| Decodificación a 190k | 43 tok/s |
| Decodificación a 262k | 29 tok/s |
| Prefill a 33k | 990 tok/s |
| Prefill a 262k | 470 tok/s |
| Pico de VRAM | 23.956 MiB con turno de 261.808 tokens e imagen de 8 MP (169 MiB de margen) |

## Requisitos de hardware

- VRAM: una única tarjeta de 24 GB, con pico medido de 23.956 MiB en RTX 3090 durante un turno de 261.808 tokens más una imagen de 8 MP. El margen es de 169 MiB, por lo que no hay holgura para otros usos de la GPU.
- Componentes en memoria: 13,7 GiB de pesos GGUF (cabeza MTP incluida) y 0,6 GiB de proyector de visión Q8_0, que se mantiene fuera de la GPU gracias al intercambio por demanda.
- GPU validadas: RTX 3090 (medición publicada). Para el resto, los binarios cubren RTX 20xx a 40xx (CUDA 12.4, driver 551+) y RTX 50xx (CUDA 13.4, driver 580+) en Windows, y Linux x64 con driver 570+ y CUDA 12.8. No hay mediciones publicadas para otras GPU concretas.
- Configuración obligatoria para que quepa todo: claves de caché KV a 8 bits y valores a 5 bits, profundidad de borrador MTP 3, micro-lote 256, proyector en Q8_0 con intercambio por imagen, y `--ngl 99` con flash-attention activada.
- Windows: hay que desactivar el fallback a memoria del sistema en el panel de NVIDIA (CUDA - Sysmem Fallback Policy → Prefer No Sysmem Fallback) para `llama-server.exe`; con el valor por defecto la tarjeta desborda silenciosamente a RAM y la generación cae a unos pocos tokens por segundo en lugar de dar error. El script de ejemplo arranca en `-c 196608` (estimación, no medición) y recomienda subir hacia 262144 o bajar en pasos de 16384 (unos 600 MiB por paso).
- Despliegue: `llama-server` de la rama github.com/potato-os/llama.cpp, con binarios precompilados para Linux x64 (CUDA 12.8) y Windows x64 (CUDA 12.4 y 13.4). La cabeza MTP del GGUF ya está soportada por llama.cpp estándar, pero el intercambio del proyector de visión requiere la rama. No hay información publicada sobre despliegue con vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: ver la tabla de la sección anterior; el coste del intercambio del proyector es de aproximadamente medio segundo por imagen y nulo en turnos de solo texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LiveCodeBench-80 | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Potato-CODER-24GB | 27,3 B | 262.144 | 63/80 (hard 8/20) | GGUF IQ4_XS/Q5_K | swift-open-license-1.0 | Una tarjeta de 24 GB |
| IQ4_XS con receta estándar de la misma familia, con caché q8 | 27,3 B (misma familia) | No disponible | 60/80 | GGUF IQ4_XS | No disponible | No disponible |
| Control con caché f16 en dos tarjetas | 27,3 B (misma familia) | No disponible | 8/8 y 7/8 en tareas ejecutables tras sesiones de 190k/250k | No disponible | No disponible | Dos tarjetas |

No hay datos en la información proporcionada sobre otros modelos comparables de la misma categoría (por ejemplo, otros asistentes de código de ~30 B en GGUF). La comparación solo puede establecerse contra la receta estándar de la misma familia y contra el control con caché f16, que son las referencias publicadas por el autor.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda íntegramente las capacidades, los sesgos y las limitaciones de Qwen3.8-27B y del post-entrenamiento Swift-Qwen3.8-27B de UkisAI. No hay evaluación de sesgos publicada en la información disponible.
- Degradación por cuantización: a 4,31 bits por peso, el propio autor documenta que en sesiones largas la receta IQ4_XS resuelve 6/8 tareas ejecutables frente a 7/8 del control con caché f16, lo que indica pérdida de fiabilidad en el extremo de contexto.
- Licencia: se declara `license: other` con nombre swift-open-license-1.0, distinta de la Apache-2.0 del modelo base (que se incluye como LICENSE-APACHE-2.0). Hay que revisar los términos del fichero LICENSE antes de cualquier uso comercial; la información disponible no detalla sus condiciones.
- Dependencia de una rama no estándar de llama.cpp: sin github.com/potato-os/llama.cpp no se dispone del intercambio del proyector de visión (`--mmproj-swap-draft`) ni de los kernels q8_0/q5_0 compilados, con lo que se pierde la combinación de visión, MTP y contexto completo en una sola tarjeta, o la velocidad de decodificación.
- Sensibilidad al desbordamiento de VRAM en Windows: con el fallback a memoria del sistema activado, el modelo no falla pero cae a unos pocos tokens por segundo, un modo de fallo silencioso que puede pasar desapercibido en producción.
- El contexto completo de 262.144 tokens no está garantizado en Windows: el script parte de `-c 196608` como estimación porque el escritorio reserva parte de la tarjeta, y hay que ajustar a mano.
- Idiomas: solo inglés y chino declarados; no hay evaluación de rendimiento en castellano ni en otras lenguas, por lo que el uso en español es una extrapolación no verificada.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad o de tasa de alucinación en la información disponible.
- Madurez: la versión es v1.0-rc1 (release candidate), con 0 descargas y 0 likes en el momento de los metadatos, lo que implica ausencia de validación independiente por parte de terceros.
- Tool calling: aunque el repositorio está etiquetado como `endpoints_compatible`, no se documenta soporte explícito de function calling ni comportamiento de agente multi-paso verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Slomin/Potato-CODER-24GB
- Modelo base (post-entrenamiento): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Rama de llama.cpp del autor: https://github.com/potato-os/llama.cpp
- Binarios precompilados: https://github.com/potato-os/llama.cpp/releases
- Releases de llama.cpp upstream (para las bibliotecas `cudart`): https://github.com/ggml-org/llama.cpp/releases
- No se han encontrado enlaces adicionales relevantes en la búsqueda web realizada.
