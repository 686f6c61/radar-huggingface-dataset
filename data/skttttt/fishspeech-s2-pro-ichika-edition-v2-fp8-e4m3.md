# Skttttt/Fishspeech-S2-Pro-Ichika-Edition-V2-FP8-E4M3

## Resumen

Fishspeech S2 Pro "Ichika Edition" V2 FP8 E4M3 es un modelo de síntesis de voz (text-to-speech) derivado de Fish Audio S2 Pro, ajustado mediante fine-tuning para reproducir la voz del personaje Ichika Nakano de la franquicia *The Quintessential Quintuplets*. Lo publica el usuario Skttttt como parte de una colección de modelos fan y constituye la versión cuantizada a FP8 E4M3 del release V2 en BF16, con los pesos del ajuste ya fusionados en un único `model.safetensors`.

El modelo emplea la arquitectura nativa `dual_ar` de Fish Speech, con aproximadamente 4.962 millones de parámetros (4,96 B) y un enfoque de generación texto-a-semántica combinado con el códec de audio original de Fish Speech. Está diseñado específicamente para GPUs de 16 GB de VRAM mediante cuantización por filas en E4M3 y operaciones `torch._scaled_mm` con acumulación en FP32.

Su relevancia es doble: por un lado, demuestra un flujo de cuantización FP8 nativo sobre un modelo TTS de casi 5 B de parámetros; por otro, ejemplifica el ecosistema de fine-tunes de personajes sobre Fish Speech, con referencias de audio incluidas y un runtime propio. Es un modelo de nicho, en japonés y con licencia de investigación, no pensado para producción comercial directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dual_ar (Fish Speech nativo) |
| Parametros totales | 4.962.228.480 (~4,96 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 con escalado por fila (202 capas lineales y 3 tablas de embeddings); modelo base en BF16 |
| Idiomas soportados | japonés (ja) |
| Licencia | fish-audio-research-license (other) |
| Formato de pesos | safetensors (model.safetensors, 4,97 GB) + codec.pth (1,87 GB) |
| Tamano del repo | 6,9 GB |
| Pipeline | text-to-speech |
| Modelo base | Skttttt/Fishspeech-S2-Pro-Ichika-Edition-V2 (BF16) |
| Runtime requerido | Fork de Fish Speech en commit 166940c301b8b4650b3110397a38bc68727a3afa; PyTorch 2.8.0 |

## Arquitectura y entrenamiento

La arquitectura es `dual_ar`, el diseño nativo de Fish Speech para generación texto-a-semántica: un modelo autorregresivo doble que produce tokens semánticos que posteriormente el códec de audio de Fish Speech convierte en forma de onda. No es un checkpoint compatible con `AutoModel` de Transformers, sino que requiere el fork específico de Fish Speech indicado en la model card.

El ajuste se realizó sobre Fish Audio S2 Pro para adaptar la voz del personaje Ichika Nakano. El release V2 en BF16 fue evaluado mediante pruebas de escucha a ciegas, que según el autor mostraron una mejora notable frente al modelo base y a la V1. Esta versión FP8 se obtuvo fusionando el adaptador en los pesos base y cuantizando a E4M3 con escalado por fila; las operaciones lineales del transformer usan operandos FP8 con acumulación FP32, mientras que atención, residuales, normalización y códec se mantienen en mayor precisión. El corpus de entrenamiento, estados del optimizador y adaptadores independientes no se incluyen en el repositorio.

## Capacidades

- Síntesis de voz en japonés a partir de texto, condicionada por una grabación de referencia incluida.
- Clonación/imitación de timbre y estilo a partir de referencias de audio con su transcripción y tokens de códec precalculados.
- Control de ritmo, expresión y similitud mediante la selección de referencia y el texto de entrada.
- Múltiples referencias incluidas (g1_ic_00011 por defecto, g1_ic_00013, g2_ic_00047) con WAV, transcripción y tokens `.npy`.
- Carga nativa de pesos FP8 mediante el loader incluido (`infer_fp8.py`, `native_fp8.py`, `bootstrap.py`).
- Parche de compatibilidad AMD SDPA incluido (`amd_sdpa.patch`).
- No soporta tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Doblaje fan de contenido japonés: generar líneas nuevas con la voz del personaje a partir de texto y una referencia incluida, útil para proyectos de fansub o fan-dub no comerciales.
- Prototipado de personajes virtuales: crear diálogos de prueba para VTubers o avatares con una identidad vocal concreta antes de invertir en grabaciones reales.
- Investigación en clonación de voz de pocos segundos: el modelo sirve como banco de pruebas para estudiar fidelidad de timbre y prosodia con referencias cortas (5-7 segundos).
- Evaluación de cuantización FP8 en TTS: comparar la calidad percibida y el uso de VRAM frente al release BF16 en GPUs de 16 GB.
- Generación de audiolibros o ficción amateur en japonés: sintetizar narraciones con una voz consistente, siempre dentro del marco de la licencia de investigación.
- Docencia y demos de TTS: mostrar en un entorno controlado cómo funciona un pipeline dual_ar con códec y referencias, sin necesidad de descargar el modelo base ni fusionar adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona pruebas de escucha a ciegas cualitativas para el release V2 en BF16, sin métricas numéricas (MOS, WER, similitud de hablante) ni comparaciones cuantitativas. La conversión FP8 fue verificada estructuralmente y por checksum, pero no se realizó inferencia individual en GPU ni comparación auditiva para este personaje.

## Requisitos de hardware

- VRAM estimada: diseñado para GPUs de 16 GB; el uso real depende del runtime, los ajustes y la longitud de entrada. Pesos FP8 de 4,97 GB más códec de 1,87 GB, más overhead de activaciones y contexto.
- GPU recomendadas: AMD RX 9070 XT con ROCm (único hardware verificado por el autor). Se incluye un helper experimental para NVIDIA CUDA, pero la inferencia completa en CUDA no ha sido probada.
- Compatibilidad consumer: sí, apunta a GPUs de 16 GB; requiere soporte FP8 y una build de PyTorch compatible (el proyecto fija PyTorch 2.8.0).
- Despliegue: fork de Fish Speech en el commit indicado, con `infer_fp8.py`; no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa al no ser un checkpoint Transformers estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Fishspeech S2 Pro Ichika V2 FP8 E4M3 (este) | ~4,96 B | no disponible | ja | fish-audio-research-license | safetensors FP8 | Fine-tune de personaje, runtime propio |
| Fishspeech S2 Pro Ichika V2 (BF16) | ~4,96 B | no disponible | ja | fish-audio-research-license | safetensors BF16 | Release original del que deriva esta versión |
| Fish Audio S2 Pro (base) | no disponible | no disponible | multilingüe (no detallado) | fish-audio-research-license | no disponible | Modelo base del fine-tune |
| Fish Speech (upstream) | no disponible | no disponible | multilingüe | no disponible | safetensors | Arquitectura dual_ar original |

## Limitaciones y advertencias

- Proyecto fan no oficial, sin afiliación ni respaldo de los creadores, intérpretes o la franquicia.
- Licencia `fish-audio-research-license`: restringe el uso comercial; revisar `LICENSE.md` antes de cualquier despliegue en producción.
- Solo japonés; no se documenta soporte multilingüe.
- La voz no coincide necesariamente con el personaje en todas las líneas; cambiar la referencia altera el ritmo y la expresión.
- Riesgo de alucinación acústica y artefactos propios de TTS con referencias cortas; no se han publicado métricas objetivas.
- La inferencia FP8 solo está verificada en AMD RX 9070 XT con ROCm; el soporte CUDA es experimental y no probado de extremo a extremo.
- El loader BF16 estándar no puede usar estos pesos FP8 escalados; es obligatorio el loader nativo incluido y no debe reaplicarse el adaptador.
- No es un checkpoint `AutoModel` de Transformers; requiere el fork de Fish Speech en un commit concreto.
- No se incluyen corpus de entrenamiento, estados del optimizador ni adaptadores independientes, lo que limita la reproducibilidad del ajuste.
- Uso ético: la clonación de voz exige consentimiento y puede vulnerar derechos de imagen o voz; aplicar salvaguardas en cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Ichika-Edition-V2-FP8-E4M3
- Modelo base BF16: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Ichika-Edition-V2
- Fork de Fish Speech requerido: https://github.com/TachibanaKimika/fish-speech/tree/166940c301b8b4650b3110397a38bc68727a3afa
- Referencia por defecto (WAV): https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Ichika-Edition-V2-FP8-E4M3/resolve/main/references/g1_ic_00011.wav
