# aufklarer/FireRedTTS3-Instruct-MLX-fp32

## Resumen

FireRedTTS3-Instruct-MLX-fp32 es una conversión a MLX del modelo FireRedTTS3 en su variante Instruct, desarrollada originalmente por FireRedTeam y portada a Apple Silicon por el usuario aufklarer. Se trata de un sistema de síntesis de voz (text-to-speech) con capacidad de diseño de voz sin referencia: el modelo recibe una instrucción en lenguaje natural que describe las características deseadas de la voz ("un narrador inglés claro y tranquilo", por ejemplo) y genera un plan de atributos vocales que después se utiliza para sintetizar el guion en inglés o chino.

La relevancia de esta exportación radica en que permite ejecutar el modelo de forma nativa en hardware Apple Silicon mediante la librería MLX y el runtime Swift speech-swift, sin necesidad de CUDA ni de dependencias de Python en producción. El bundle conserva los pesos originales en Float32 y omite componentes no necesarios para la tarea de diseño de voz, como el encoder RedAE y el embedding del tokenizer del decoder.

El modelo contiene aproximadamente 2.118 millones de parámetros almacenados en safetensors (unos 2.360 millones de valores Float32 según la model card) y ocupa 9,44 GB en disco. Está pensado para síntesis de voz en inglés y chino con un límite de prompt de 4.096 posiciones del tokenizer y una duración máxima de audio de 64 segundos por generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3 de 28 capas + encoder de patches de 8 capas + flow transformer de 11 capas + decoder RedAE de 18 capas |
| Parametros totales | 2.118.795.329 (según safetensors); ~2.360 millones de valores Float32 almacenados según model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 posiciones del tokenizer (límite de prompt en el runtime nativo) |
| Tipos de cuantizacion | Ninguna; exportación en Float32 original |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors compatible con MLX; runtime nativo MLX Swift |
| Pipeline | text-to-speech |
| Modelo base | FireRedTeam/FireRedTTS3 (variante Instruct) |
| Vocabulario | 151.924 entradas (255 añadidas por el tokenizer oficial) |
| Salida de audio | PCM mono Float32 a 24.000 Hz |
| Límite de audio | 400 patches acústicos por defecto, hasta 64 segundos |
| Tamaño del repo | 9,5 GB (9.440.678.972 bytes en pesos) |
| Hardware validado | Apple M5 Pro, 48 GiB de memoria unificada |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura en cascada compuesta por cuatro módulos: un backbone Qwen3 de 28 capas que procesa el prompt y la instrucción de voz, un encoder de patches de 8 capas, un flow transformer de 11 capas que modela la generación acústica y un decoder RedAE de 18 capas que convierte los latentes en forma de onda. Cada patch acústico se compone de cuatro latentes generados y el decoder produce 3.840 muestras por patch, equivalentes a 160 ms de audio a 24 kHz. La exportación omite el encoder RedAE y el embedding del tokenizer del decoder por no ser necesarios para la tarea de diseño de voz sin referencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card indica que el wrapper oficial de CUDA aplica autocast del backbone a BF16, mientras que este runtime nativo computa el backbone en Float32, por lo que los valores preservados no implican un muestreo de audio idéntico entre frameworks o hardware. El tokenizer oficial añade tokens de habla y de idioma en tiempo de carga; este bundle persiste el registro ordenado exacto con 255 adiciones, incluyendo los IDs de control `<|sosp|>` (151669), `<|sot|>` (151676) y `<|eot|>` (151677).

## Capacidades

- Síntesis de voz (text-to-speech) en inglés y chino con salida PCM mono a 24 kHz.
- Diseño de voz sin referencia: genera un plan de atributos vocales a partir de una instrucción en lenguaje natural, sin necesidad de grabación de referencia.
- Generación de un plan de voz estructurado que la API Swift devuelve junto al audio.
- Soporte de instrucciones en lenguaje libre para describir timbre, tono, estilo o idioma de la voz.
- Límite de planificación de voz de 200 tokens generados por defecto.
- Generación de audio de hasta 64 segundos por petición (400 patches acústicos por defecto); al agotarse el límite se lanza una excepción.
- Entrega de forma de onda completa almacenada en búfer (no streaming).
- No soporta clonación de voz, referencias de audio ni edición de habla en este bundle.

## Casos de uso

- **Narración automatizada de contenido editorial**: el modelo permite generar voces narradoras con instrucciones como "narrador claro y tranquilo" para audiolibros, artículos o podcasts, sin necesidad de grabar referencias. El límite de 64 segundos por generación obliga a fragmentar textos largos en segmentos.
- **Locución para vídeos y presentaciones**: integrable en pipelines de producción de vídeo en macOS mediante el runtime Swift, generando pistas de voz en inglés o chino con el estilo descrito en la instrucción.
- **Prototipado de asistentes de voz en Apple Silicon**: desarrolladores que construyen interfaces conversacionales nativas en macOS pueden usar el modelo para sintetizar respuestas sin depender de servicios en la nube, aprovechando MLX y la memoria unificada.
- **Generación de voces para aplicaciones de accesibilidad**: creación de voces sintéticas personalizadas descritas por instrucción para lectores de pantalla o sistemas de asistencia, con latencia aceptable en hardware M-series.
- **Contenido multilingüe inglés-chino**: empresas que producen material en ambos idiomas pueden generar locuciones en las dos lenguas con un único modelo y un mismo pipeline, evitando mantener dos sistemas TTS separados.
- **Investigación en diseño de voz y evaluación TTS**: el bundle permite reproducir experimentos de voice design en hardware de Apple, comparar muestreos entre frameworks (CUDA BF16 frente a MLX Float32) y auditar la fidelidad de la conversión de pesos.
- **Integración en herramientas de desarrollo para macOS**: al compilarse con `speech-swift` y exponerse como CLI, puede incorporarse en scripts de build o flujos de automatización que necesiten generar audio bajo demanda.

## Benchmarks y rendimiento

La model card reporta mediciones locales realizadas el 29 de octubre de 2026 en un Apple M5 Pro con 48 GiB de memoria unificada, build de release, shaders Metal de MLX compilados y `MLX_ENABLE_TF32=0`. Cada idioma se ejecutó en un proceso nuevo con una primera petición y tres repeticiones en caliente de un guion corto neutro, con semilla 2, diez pasos de flow, guidance 1.2 y límite de 150 patches.

| Guion | Duración de audio | Mediana PCM completo en caliente | Factor de tiempo real (mediana) | Pico de huella física del proceso |
|---|---:|---:|---:|---:|
| Inglés | 2,72 s | 4,50 s | 1,65 | 10,82 GB |
| Chino | 5,28 s | 11,22 s | 2,13 | 11,70 GB |

El factor de tiempo real se define como tiempo de generación dividido por la duración del audio; valores más bajos indican mayor velocidad. El valor de 1,65 en inglés implica 1,65 segundos de generación por cada segundo de audio. La latencia PCM completa incluye planificación de voz, generación acústica y decodificación de forma de onda. La carga del modelo tomó 0,60 s en inglés y 0,57 s en chino, excluida de los tiempos de petición.

Las pruebas de validación incluyeron cinco tests numéricos de referencia (backbone y pasos cacheados, cómputo de patches y flow, atención deslizante del decoder, límites de FFT inversa y salvaguardas de planificación no finita), dos tests con el bundle real (síntesis inglés/chino, planificación de voz, recuperación tras cancelación y descarga explícita) y un test de CLI con transcripción independiente mediante Parakeet que coincidió palabra por palabra con el guion de cinco palabras. El error de transcripción normalizado fue cero en los guiones fijos de inglés y chino, y cuatro repeticiones WAV con semilla por idioma resultaron idénticas.

No se reclama ninguna puntuación en InstructTTSEval para esta exportación. La auditoría de integración encontró los 59 archivos de inferencia existentes sin cambios y los 16 pares WAV con semilla de modelos existentes idénticos antes y después, pero las comparaciones de velocidad con modelos existentes quedan **no concluyentes** tras completar las 24 ejecuciones de timing previstas; algunos resultados de latencia superaron los umbrales de comparación y la model card no afirma ausencia de regresión de rendimiento.

## Requisitos de hardware

- **Memoria**: el pico de huella física del proceso medido fue de 10,82 GB (inglés) y 11,70 GB (chino) en un M5 Pro con 48 GiB de memoria unificada. Al no haber cuantización, los pesos en Float32 ocupan 9,44 GB, por lo que se recomienda al menos 16 GiB de memoria unificada para margen operativo.
- **GPU recomendadas**: Apple Silicon con memoria unificada; el hardware validado es un Apple M5 Pro de 48 GiB. No se ha validado en otras GPU ni en CUDA en esta exportación (el modelo base tiene wrapper CUDA, pero este bundle es específico de MLX).
- **Compatibilidad con GPU de consumo**: al ejecutarse sobre memoria unificada de Apple Silicon, encaja en equipos Mac con 16 GiB o más; no aplica a GPU discretas NVIDIA o AMD en este formato.
- **Opciones de despliegue**: runtime nativo MLX Swift a través del repositorio `speech-swift` (rama `main`), que compila una CLI y los motores. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato MLX.
- **Latencia y throughput**: factor de tiempo real de 1,65 en inglés y 2,13 en chino con los parámetros de la medición (semilla 2, diez pasos de flow, guidance 1.2, 150 patches). La carga del modelo es inferior a un segundo.
- **Requisitos de build**: es necesario compilar `speech-swift` desde `main` en Apple Silicon (`git clone`, `make build`); los motores no están incluidos en una release etiquetada ni en el paquete de Homebrew.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| FireRedTTS3-Instruct-MLX-fp32 | 2.118.795.329 | 4.096 posiciones de prompt; 64 s de audio | Inglés, chino | Apache 2.0 | Safetensors MLX / MLX Swift |
| FireRedTeam/FireRedTTS3 (base) | No disponible en la información | No disponible | Inglés, chino (según el bundle) | Apache 2.0 (según el bundle) | Pesos originales; wrapper CUDA con autocast BF16 |
| Otros modelos TTS de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación documentada es interna: el modelo base oficial usa un wrapper CUDA con backbone en BF16, mientras que esta exportación computa el backbone en Float32 en MLX, lo que puede producir muestreos de audio distintos entre frameworks y hardware.

## Limitaciones y advertencias

- **Cobertura lingüística limitada**: solo inglés y chino; no se ha demostrado cobertura amplia de otros idiomas.
- **Calidad de seguimiento de instrucciones no evaluada**: la model card advierte explícitamente que las mediciones cubren un guion corto por idioma y no establecen la calidad del instruction-following ni la cobertura lingüística amplia.
- **Sin clonación ni edición**: este bundle no soporta clonación de voz, referencias de audio ni edición de habla; esas tareas quedan fuera del alcance del runtime nativo.
- **Límite de duración**: el audio se corta a 400 patches por defecto (hasta 64 segundos) y el agotamiento del límite lanza una excepción, lo que exige gestionar la fragmentación en producción.
- **Entrega en búfer**: la forma de onda se entrega completa, no en streaming, lo que añade latencia al primer audio en textos largos.
- **Rendimiento no concluyente frente a modelos existentes**: la auditoría de integración no pudo confirmar ausencia de regresión de velocidad; algunos resultados de latencia superaron los umbrales de comparación.
- **Diferencias entre frameworks**: los valores Float32 preservados no garantizan un audio idéntico al del wrapper CUDA en BF16.
- **Riesgo de alucinación acústica y artefactos**: no se documentan sesgos específicos ni tasas de error en habla; la validación se limita a dos guiones fijos con error de transcripción cero, insuficiente para generalizar.
- **Madurez del runtime**: los motores no están en una release etiquetada ni en Homebrew; es necesario compilar desde `main`, lo que implica riesgo de cambios incompatibles.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base FireRedTeam/FireRedTTS3 y de los datasets de entrenamiento originales, no detalladas en la información disponible.
- **Hardware restringido**: validado únicamente en Apple M5 Pro con 48 GiB; el comportamiento en otros chips Apple Silicon o con menos memoria no está documentado.

## Enlaces

- [Modelo en Hugging Face: aufklarer/FireRedTTS3-Instruct-MLX-fp32](https://huggingface.co/aufklarer/FireRedTTS3-Instruct-MLX-fp32)
- [Modelo base: FireRedTeam/FireRedTTS3](https://huggingface.co/FireRedTeam/FireRedTTS3)
- [Repositorio speech-swift (runtime Swift para Apple Silicon)](https://github.com/soniqo/speech-swift)
- [Rama main de speech-swift](https://github.com/soniqo/speech-swift/tree/main)
