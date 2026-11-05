# municipal-robotics/ribt

## Resumen

ribt (Real-time, In-Body Talk) es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por Municipal Robotics, diseñado específicamente para robótica conversacional donde la latencia del primer audio es crítica. El modelo genera el primer sample de audio 17,6 ms después de recibir el texto, con un factor de tiempo real de 0,027 (37 veces más rápido que tiempo real), lo que lo hace adecuado para interacciones donde un robot debe responder mientras el usuario aún está presente.

Con 54 millones de parámetros en total, ribt se compone de cuatro etapas: un frontend fonemizador (lilt), un modelo acústico (18,65M), un modelo de flow matching de un solo paso (21,88M) y un vocoder Vocos (13,5M). Todos los pesos están en formato safetensors f32 y el modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones.

La relevancia de ribt radica en su enfoque de ingeniería: todos los componentes se entrenaron en el IR tensorial de tang (sin PyTorch en el bucle) y los mismos programas compilados se ejecutan en Metal, CUDA, OpenCL, C y WebGPU. Esto permite desplegar el mismo modelo en un robot con GPU embebida y en un navegador web sin reentrenamiento ni conversión de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de TTS en cuatro etapas: fonemizador (lilt, tablas), modelo acústico (18,65M), flow matching de un paso (21,88M), vocoder Vocos (13,5M); todas las redes son programas en el IR tensorial de tang |
| Parámetros totales | 54M (18,65M + 21,88M + 13,5M + tablas del fonemizador) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f32 para pesos nativos; fp16 para el build WebGPU |
| Idiomas soportados | Inglés (US) únicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (f32), más artefactos WGSL y fp16 para el build web |

## Arquitectura y entrenamiento

ribt no es un transformer monolítico sino un pipeline de cuatro etapas encadenadas. La primera, lilt, es un port en Rust de misaki que convierte letras a fonemas con un 99,86% de paridad a nivel de palabra y una velocidad de 274.000 palabras por segundo, emitiendo palabra a palabra para permitir streaming. La segunda etapa, el modelo acústico (18,65M parámetros), predice la duración de cada sonido, la curva de pitch y un espectrograma aproximado de 100 bandas. La tercera, un modelo de flow matching de un solo paso (21,88M), añade el detalle que un profesor de 16 pasos produciría, usando la técnica de shortcut. Finalmente, el vocoder Vocos (13,5M) convierte el espectrograma en waveform a 24 kHz.

El entrenamiento se realizó íntegramente en el IR tensorial de tang, sin PyTorch en el bucle. La voz se destiló de Kokoro-82M (voz af_heart, Apache-2.0): se renderizaron 135 horas de audio de af_heart a partir de transcripciones de LibriTTS-R y líneas conversacionales con plantillas, y se entrenaron los modelos acústico y de flow sobre esos datos. No hay pesos de Kokoro en ribt. El vocoder es Vocos de Hubert Siuzdak (MIT), entrenado sobre LibriTTS. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz en inglés (US) en tiempo real con latencia de primer audio de 17,6 ms en streaming.
- Streaming palabra a palabra: el fonemizador emite fonemas de forma incremental y el pipeline genera audio por chunks.
- Control de pitch y acento (por ejemplo, `--pitch 1 --accent minnesota` en la CLI).
- Generación determinista con semilla configurable (`--seed 0`) y control de temperatura (`--temp 0.3`).
- Ejecución multiplataforma: los mismos programas compilados corren en Metal, CUDA, OpenCL, C y WebGPU.
- Build para navegador con WebGPU que replica el build nativo con un error RMS relativo de 6e-5.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de TTS.
- No soporta visión, audio de entrada ni otros idiomas distintos del inglés.

## Casos de uso

- **Robótica conversacional de proximidad**: un robot de servicio que debe responder en menos de 200 ms tras la última palabra del usuario puede usar ribt para generar el primer audio en 17,6 ms, dejando margen para ASR y generación de respuesta dentro del presupuesto de latencia.
- **Atención al cliente en kioscos interactivos**: el modelo gestiona frases conversacionales cortas y medianas (pedidos, confirmaciones, preguntas) con un WER de 1,73% en el conjunto held-out, lo que reduce malentendidos en entornos ruidosos.
- **Anuncios y confirmaciones en logística**: frases como "Your package ships on March 3rd, and it's $42.50" se sintetizan con pronunciación correcta de números y fechas, adecuado para sistemas de seguimiento de paquetes en almacén.
- **Asistentes de accesibilidad en dispositivos embebidos**: al caber en GPUs de consumo y ejecutarse en CPU, puede integrarse en dispositivos de bajo coste para lectura de texto en voz alta con latencia imperceptible.
- **Demostraciones web sin backend**: el build WebGPU descarga unos 140 MB la primera vez y ejecuta el modelo íntegramente en el navegador, útil para demos de producto o prototipos sin infraestructura de servidor.
- **Prototipado rápido de interfaces de voz**: la CLI (`ribt-tts synth` y `ribt-tts stream`) y la semilla configurable permiten generar lotes de audio reproducible para pruebas A/B de UX conversacional.
- **Integración en pipelines de CI/CD para pruebas de audio**: los checksums SHA-256 publicados por componente y la naturaleza determinista del modelo permiten verificar regresiones de audio en tests automatizados.

## Benchmarks y rendimiento

Evaluación en M4 Max, batch 1, warm, seed 0. WER medido con Whisper small.en, naturalidad con UTMOS (utmos22_strong), similitud de hablante como coseno WavLM-base-plus-SV contra 121 clips held-out de af_heart.

| Métrica | ribt | Kokoro af_heart |
|---|---|---|
| Tiempo hasta primer audio | 17,6 ms (streaming) | 349 ms (frase completa, CPU) |
| Factor de tiempo real | 0,027 | 0,093 |
| Naturalidad (UTMOS) | 4,39 | 4,52 |
| WER-50 | 2,71% | 2,61% |
| WER held-out 50 | 1,73% | 1,73% |
| Similitud de hablante | 0,987 | 0,990 |

El build WebGPU coincide con el build nativo sobre los mismos pesos con un error RMS relativo de 6e-5. No se han publicado resultados de MMLU, HumanEval ni GSM8K porque el modelo no realiza esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en f32 ocupa aproximadamente 216 MB (54M parámetros × 4 bytes), más overhead de activaciones y buffers; el repo pesa 0,3 GB.
- GPU recomendadas: el benchmark se ejecutó en un Apple M4 Max (Metal). El modelo soporta CUDA, OpenCL y WebGPU, por lo que es compatible con A100, H100, RTX 4090 y GPUs integradas.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3050 y superiores; también hay build para CPU puro en C.
- Opciones de despliegue: binario nativo `ribt-tts` (compilado con Cargo), build WebGPU para navegador (`web/build.sh`), y los backends Metal, CUDA, wgpu, OpenCL y CPU incluidos en el repositorio.
- Latencia y throughput: 17,6 ms hasta el primer audio en streaming y factor de tiempo real de 0,027 en M4 Max; el throughput exacto en otras GPUs no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Latencia primer audio | Naturalidad (UTMOS) | Disponibilidad |
|---|---|---|---|---|---|---|
| ribt | 54M | No disponible | MIT | 17,6 ms (streaming) | 4,39 | HuggingFace, GitHub, demo web |
| Kokoro-82M (af_heart) | 82M | No disponible | Apache-2.0 | 349 ms (frase completa, CPU) | 4,52 | HuggingFace |
| Vocos (vocoder) | 13,5M | No aplica | MIT | No aplica (solo vocoder) | No disponible | GitHub, HuggingFace |

La comparativa se limita a Kokoro porque es el profesor del que se destila ribt y el único modelo con métricas comparables publicadas en la información disponible. No se dispone de datos de otros modelos TTS de latencia ultrabaja para comparar.

## Limitaciones y advertencias

- Solo inglés (US) y una única voz; no admite otros idiomas ni cambio de hablante sin reentrenamiento.
- La naturalidad queda por detrás de su profesor: 4,39 frente a 4,52 UTMOS, una diferencia de 0,13 puntos que el paper documenta como no resuelta.
- El build para navegador requiere WebGPU y descarga aproximadamente 140 MB la primera vez, lo que puede ser problemático en conexiones lentas o navegadores sin soporte.
- La voz hereda el linaje de los datos de entrenamiento de Kokoro, que incluyeron audio sintético de proveedores comerciales cerrados; esto puede tener implicaciones legales en algunos contextos pese a la licencia MIT del modelo.
- Riesgo de alucinación acústica: como todo TTS, puede producir pronunciaciones incorrectas en palabras fuera de distribución, siglas o nombres propios no vistos en entrenamiento.
- No apto para tareas de razonamiento, código, matemáticas, visión ni agentes; es exclusivamente un modelo de síntesis de voz.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa independiente.
- No se especifican los tokens de entrenamiento ni la composición exacta del dataset, lo que dificulta evaluar la cobertura lingüística más allá de los benchmarks publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/municipal-robotics/ribt
- Repositorio de código: https://github.com/muni-works/ribt
- Paper: https://muni.works/research/ribt
- Demo en navegador: https://ribt.dev
- IR tensorial tang: https://github.com/muni-works/tang
- Kokoro-82M (modelo profesor): https://huggingface.co/hexgrad/Kokoro-82M
- Vocos (vocoder): https://github.com/gemelo-ai/vocos
- Muestras de audio: https://huggingface.co/municipal-robotics/ribt/resolve/main/samples/hello.mp3 (y `minnesota.mp3`, `numbers.mp3`, `question.mp3`, `long.mp3` en la misma ruta)
