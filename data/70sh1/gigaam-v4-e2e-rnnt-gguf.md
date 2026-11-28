# 70sh1/gigaam-v4-e2e-rnnt-gguf

## Resumen

GigaAM-v4 E2E RNN-T en formato GGUF es una conversión del modelo de reconocimiento automático del habla `ai-sage/GigaAM-v4` (revisión `180301a192bb45bc2b2ca122e0d4aab24ffe7a96`, cabeza RNN-T `e2e`), empaquetada por el usuario 70sh1 para el runtime `transcribe.cpp` con soporte del encoder Zapformer. El modelo original lo desarrolla el equipo ai-sage y está orientado a transcripción de voz en ruso e inglés. La conversión mantiene la licencia MIT y publica dos variantes de pesos: Q8_0 (243 MB) y F32 (912 MB).

El interés de esta ficha es práctico: permite ejecutar un ASR de 239 millones de parámetros en CPU y en Metal (Apple Silicon) sin depender de PyTorch, con una paridad numérica verificada frente a la implementación de referencia. El autor reporta coincidencia carácter por carácter en 6 clips de prueba (ruso e inglés, incluido un clip largo de 33,8 s con ventana) en CPU F32, CPU Q8_0, Metal F32 y Metal Q8_0, y velocidades de 45x a 132x tiempo real en un Apple M4 con Metal y Q8_0.

Es relevante ahora porque el soporte de Zapformer en `transcribe.cpp` todavía no está en la rama principal: requiere una build específica (commit `4d860cd81b0b4cf89973d14e6a42d8891ca47f81` de la rama `gigaam-v4`), y las versiones estándar de `transcribe.cpp` hasta 0.5.1 solo admiten el encoder Conformer de GigaAM-v3. Es, por tanto, una conversión temprana y experimental, no un artefacto de producción estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zapformer (encoder) + cabeza RNN-T (`e2e`); modelo base `ai-sage/GigaAM-v4` |
| Parametros totales | 239.090.433 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; se reporta una ventana de clip largo de 33,8 s) |
| Tipos de cuantizacion | Q8_0 (140 tensores `q8_0` lineales + 208 tensores `f32` de norm/bias/conv) y F32 (348 tensores) |
| Idiomas soportados | ruso (`ru`) e inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (`gigaam-v4-e2e-rnnt-Q8_0.gguf`, `gigaam-v4-e2e-rnnt-F32.gguf`) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR end-to-end con encoder Zapformer y cabeza RNN-T (transducer). La conversión preserva la cabeza `e2e` del modelo base y separa los tensores en dos grupos: 140 capas lineales cuantizadas a `q8_0` y 208 tensores de normalización, bias y convolución mantenidos en `f32`, lo que explica que el Q8_0 ocupe 243 MB frente a los 912 MB del F32. El encoder Zapformer es la pieza que diferencia esta versión de GigaAM-v3 (Conformer), y es la razón por la que se necesita una build específica de `transcribe.cpp`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card del modelo base `ai-sage/GigaAM-v4`, que no se incluye en la información proporcionada. La verificación publicada por el autor se limita a la paridad numérica de la conversión: frente a `GigaAMDualASR` de PyTorch en un clip de longitud impar (`T_enc = 113`), el encoder presenta `max_abs = 0,000570`, `mean_abs = 0,000058` y similitud coseno de `1,000000`.

## Capacidades

- Reconocimiento automático del habla (transcripción) en ruso e inglés.
- Decodificación end-to-end con cabeza RNN-T, sin necesidad de un modelo de lenguaje externo en el pipeline.
- Procesamiento de audio de formato largo mediante ventanas (el autor cita un clip de 33,8 s con ventana).
- Inferencia en CPU (F32 y Q8_0) y en GPU integrada de Apple vía Metal (F32 y Q8_0).
- Ejecución ligera: el Q8_0 ocupa 243 MB en disco, apto para entornos con poca memoria.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en ruso: el modelo procesa audio de forma end-to-end con la cabeza RNN-T y puede ejecutarse en CPU, lo que permite transcribir localmente sin enviar el audio a un servicio externo.
- Subtitulado de vídeo en inglés y ruso: la velocidad reportada de 45x a 132x tiempo real en un Apple M4 con Metal y Q8_0 permite generar subtítulos de un vídeo de una hora en menos de un minuto en ese hardware.
- Asistentes de voz embebidos: con 239 M de parámetros y 243 MB en Q8_0, el modelo cabe en dispositivos de gama media y puede integrarse en aplicaciones de escritorio o móviles con presupuesto de memoria reducido.
- Búsqueda y análisis de archivos de audio: transcripción por lotes de grabaciones de centros de llamadas o entrevistas en ruso para indexación y búsqueda de texto completo.
- Prototipado e investigación en ASR: la conversión GGUF con paridad numérica verificada permite comparar el comportamiento del encoder Zapformer frente a implementaciones en PyTorch sin montar el stack completo.
- Aplicaciones de accesibilidad: dictado por voz local en ruso e inglés con latencia baja, sin dependencia de conectividad ni de APIs externas.
- Integración en herramientas de escritorio tipo CLI: importación del archivo GGUF mediante `hex model import` y uso del modelo dentro del ecosistema `transcribe.cpp` / Hex.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, etc.) en la información disponible. El autor solo reporta métricas de conversión y velocidad:

| Metrica | Valor reportado |
|---|---|
| Paridad encoder vs PyTorch (`T_enc = 113`) | `max_abs = 0,000570`; `mean_abs = 0,000058`; coseno `1,000000` |
| Coincidencia de transcripcion | Exacta carácter por carácter en 6 clips (ru/en), CPU F32, CPU Q8_0, Metal F32 y Metal Q8_0 |
| Velocidad en Apple M4, Metal, Q8_0 | ~45x a ~132x tiempo real |

## Requisitos de hardware

- VRAM/RAM estimada: 243 MB para Q8_0 y 912 MB para F32 en disco; el modelo completo cabe holgadamente en memoria de cualquier equipo moderno.
- GPU recomendadas: no se documentan GPU discretas; el autor valida CPU y Metal (Apple Silicon, probado en M4). Para CUDA no hay datos de soporte en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño; la ejecución validada es CPU y Metal, no se confirma soporte CUDA.
- Opciones de despliegue: `transcribe.cpp` (build de la rama `70sh1/transcribe.cpp@gigaam-v4`, commit `4d860cd`) y el cliente Hex (`70sh1/hex@gigaam-v4`). Las versiones estándar de `transcribe.cpp` hasta 0.5.1 no son compatibles.
- Latencia y throughput: ~45x a ~132x tiempo real en Apple M4 con Metal y Q8_0; no hay cifras publicadas para CPU ni para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GigaAM-v4 E2E RNN-T GGUF (este) | 239 M | ru, en | GGUF (Q8_0, F32) | MIT | Requiere build específica de `transcribe.cpp` con Zapformer |
| GigaAM-v3 (encoder Conformer) | no disponible | ru (principalmente) | pesos originales / conversiones | no disponible | Soportado por `transcribe.cpp` estándar hasta 0.5.1 |
| Whisper (variantes small/base) | no disponible en esta ficha | multilingüe | múltiples | MIT | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento (WER) que permitan una comparación cuantitativa fiable con alternativas; la comparativa anterior es estructural, no de calidad.

## Limitaciones y advertencias

- Compatibilidad restringida: requiere una build no fusionada de `transcribe.cpp` (rama `gigaam-v4`); la propuesta upstream está en el issue `handy-computer/transcribe.cpp#279`. Las versiones estándar no cargan el encoder Zapformer.
- Cobertura lingüística limitada a ruso e inglés; no se documenta soporte de otros idiomas.
- Conversión temprana y con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.
- La verificación se basa en 6 clips de prueba; no sustituye una evaluación de WER sobre un corpus amplio.
- No se documentan sesgos, tasas de alucinación ni comportamiento en audio con ruido, acentos o solapamiento de hablantes.
- Licencia MIT en la conversión, pero conviene verificar la licencia y condiciones del modelo base `ai-sage/GigaAM-v4` antes de un uso comercial.
- El soporte de Metal está validado en Apple M4; no hay datos de rendimiento en CUDA, ROCm ni otras GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/70sh1/gigaam-v4-e2e-rnnt-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v4
- Repositorio `transcribe.cpp` (rama con soporte Zapformer): https://github.com/70sh1/transcribe.cpp/tree/gigaam-v4
- Propuesta upstream de soporte Zapformer: https://github.com/handy-computer/transcribe.cpp/issues/279
- Cliente Hex (rama gigaam-v4): https://github.com/70sh1/hex/tree/gigaam-v4
- Issue relacionado de Hex: https://github.com/anomalyco/hex/issues/2989
