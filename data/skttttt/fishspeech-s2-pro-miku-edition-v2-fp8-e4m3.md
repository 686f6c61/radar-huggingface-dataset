# Skttttt/Fishspeech-S2-Pro-Miku-Edition-V2-FP8-E4M3

## Resumen

Fishspeech S2 Pro "Miku Edition" V2 FP8 E4M3 es un ajuste fino (fine-tune) de voz del modelo de síntesis de voz Fish Audio S2 Pro, orientado a replicar la voz del personaje Miku Nakano de la franquicia The Quintessential Quintuplets. Lo publica el usuario Skttttt como parte de una colección de modelos fan de los personajes de la serie, y se distribuye como un modelo completo ya fusionado (merged) y cuantizado a FP8 E4M3, sin necesidad de descargar pesos base ni aplicar adaptadores LoRA por separado.

El modelo parte de la arquitectura nativa dual_ar de Fish Speech, un esquema autorregresivo dual (texto a semántica y semántica a acústica) con códec de audio propio. Cuenta con aproximadamente 4.962 millones de parámetros y un repositorio de 6,9 GB, del cual 4,97 GB corresponden a los pesos del transformer y 1,87 GB al códec de audio. Está pensado explícitamente para GPUs de 16 GB de VRAM y solo admite entrada en japonés.

Su relevancia es acotada: se trata de un proyecto fan no oficial, sin respaldo de los creadores ni de la franquicia, con una licencia de investigación (fish-audio-research-license) que restringe el uso comercial. Resulta útil como referencia técnica de cuantización FP8 E4M3 sobre un modelo TTS autorregresivo y como ejemplo de clonación de voz few-shot con referencias incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dual_ar (Fish Speech S2 Pro), autorregresiva texto-a-semantica + semantica-a-acustica con codec de audio |
| Parametros totales | 4.962.228.480 (~4,96 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 con escalado por fila (per-row); pesos originales en BF16 |
| Idiomas soportados | japones (ja) |
| Licencia | fish-audio-research-license (other) |
| Formato de pesos | safetensors (model.safetensors) + codec.pth |

## Arquitectura y entrenamiento

El modelo es un Fish Speech S2 Pro nativo con arquitectura dual_ar: un transformer autorregresivo que genera tokens semánticos a partir del texto y un segundo componente autorregresivo que los convierte en tokens acústicos del códec de Fish Audio. No es un checkpoint compatible con Transformers AutoModel y requiere el fork específico de Fish Speech (commit 166940c301b8b4650b3110397a38bc68727a3afa) para su ejecución.

El ajuste fino se realizó sobre el modelo base Fish Audio S2 Pro para adaptar la voz a Miku Nakano, partiendo de grabaciones de referencia con sus transcripciones y tokens de códec precalculados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si se emplearon técnicas de RLHF o DPO. La cuantización a FP8 E4M3 aplica escalado por fila a las 202 capas lineales y a tres tablas de embeddings; las operaciones lineales del transformer usan operandos FP8 con acumulación FP32 mediante `torch._scaled_mm`, mientras que atención, residuales, normalización y códec se mantienen en mayor precisión. El runtime incluye una guarda que rechaza la promoción de pesos completos antes de la multiplicación matricial y no dispone de fallback BF16.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto plano.
- Clonación de voz few-shot: utiliza una grabación de referencia (WAV) con su transcripción y tokens de códec para condicionar el timbre y la expresividad.
- Control de estilo y ritmo mediante la selección de referencia y el contenido de la línea de texto.
- Generación de habla con expresión variable según la referencia elegida (se incluyen varias referencias: g1_mi_00002 por defecto, g1_mi_00004, g2_mi_00014).
- Inferencia con pesos FP8 E4M3 nativos mediante el cargador incluido (infer_fp8.py, native_fp8.py, bootstrap.py).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Doblaje fan de contenido en japonés: generar líneas de diálogo con la voz del personaje a partir de un guion de texto, usando las referencias incluidas para mantener consistencia de timbre entre escenas.
- Prototipado de videojuegos o novelas visuales: integrar el modelo en un pipeline de generación de voces para personajes secundarios en fase de preproducción, sustituyendo grabaciones definitivas por audio sintético temporal.
- Investigación en clonación de voz few-shot: emplear el modelo como banco de pruebas para estudiar el efecto de la referencia (duración, prosodia, transcripción) en la similitud y expresividad del habla generada.
- Evaluación de cuantización FP8 en TTS autorregresivo: comparar la calidad perceptual y el uso de VRAM frente a la versión BF16 del mismo ajuste para validar técnicas de cuantización en modelos de audio.
- Creación de contenido para comunidades de anime: generar clips de audio o piezas de audio fan con fines no comerciales, respetando las restricciones de la licencia de investigación.
- Docencia y demostraciones técnicas: mostrar en talleres cómo funciona un pipeline dual_ar de Fish Speech con referencias precalculadas y un cargador FP8 nativo, sin necesidad de infraestructura de gran escala.
- Pruebas de despliegue en GPU de consumo: validar el rendimiento del modelo en tarjetas de 16 GB (por ejemplo, RX 9070 XT con ROCm) antes de escalar a entornos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona pruebas de escucha a ciegas que sitúan a la versión V2 como una mejora notable frente al modelo base y a V1, pero no se aportan métricas numéricas (MOS, similitud de hablante, WER) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: diseñado para GPUs de 16 GB; el consumo real depende del runtime, los ajustes y la longitud de la entrada. Los pesos FP8 ocupan 4,97 GB y el códec 1,87 GB, por lo que el margen para activaciones, caché y referencias queda dentro de esos 16 GB en configuraciones típicas.
- GPU recomendadas: el runtime incluido se validó en una AMD RX 9070 XT con ROCm; se incluye un helper experimental para NVIDIA CUDA, pero la inferencia completa en CUDA no se ha probado. Se requiere una GPU con soporte FP8 y una build de PyTorch compatible (el proyecto fija PyTorch 2.8.0).
- GPU de consumo: sí, cabe en tarjetas de 16 GB; el soporte en otras GPUs distintas de la RX 9070 XT no está verificado.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere el fork de Fish Speech en el commit indicado y los scripts infer_fp8.py / native_fp8.py incluidos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Fishspeech S2 Pro Miku Edition V2 FP8 E4M3 | ~4,96 B | no disponible | ja | fish-audio-research-license | safetensors FP8 + codec.pth | Ajuste fan de personaje, cuantizado FP8, runtime propio |
| Fishspeech S2 Pro Miku Edition V2 (BF16) | ~4,96 B | no disponible | ja | fish-audio-research-license | safetensors BF16 | Versión original sin cuantizar del mismo ajuste |
| Fishspeech S2 Pro Ichika Edition V2 FP8 E4M3 | no disponible | no disponible | ja | fish-audio-research-license | safetensors FP8 | Ajuste fan del mismo autor para otro personaje de la misma franquicia |
| Fish Audio S2 Pro (base) | no disponible | no disponible | no disponible | fish-audio-research-license | no disponible | Modelo base sobre el que se construyen los ajustes |

## Limitaciones y advertencias

- Proyecto fan no oficial: sin afiliación ni respaldo de los creadores, intérpretes o la franquicia; no debe presentarse como producto oficial.
- Licencia fish-audio-research-license: restringe el uso comercial; es imprescindible revisar LICENSE.md antes de cualquier despliegue en producción.
- Solo japonés: no se ha entrenado ni validado para otros idiomas, por lo que la entrada en castellano u otras lenguas producirá resultados degradados.
- La similitud de voz no está garantizada en todas las líneas; el timbre y la expresividad dependen de la referencia elegida y del texto.
- Riesgo de alucinación acústica y artefactos: como modelo generativo de audio, puede producir pronunciaciones incorrectas, ruidos o prosodia anómala, especialmente con textos largos o poco naturales.
- La cuantización FP8 se verificó estructuralmente y por checksum, pero no se realizó una comparación de escucha específica para este personaje; la afirmación de mejora de V2 corresponde a la evaluación del modelo BF16 original.
- El runtime incluido requiere ROCm; la inferencia en CUDA es experimental y no se ha probado por completo. No hay fallback BF16 en el cargador FP8, lo que limita la portabilidad.
- No es un checkpoint estándar de Transformers: no funcionará con pipelines genéricos de HuggingFace sin el fork de Fish Speech indicado.
- Uso responsable: la clonación de voz puede emplearse para suplantación; debe limitarse a contextos con consentimiento y fines no comerciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Miku-Edition-V2-FP8-E4M3
- Modelo base BF16 V2: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Miku-Edition-V2
- Fork de Fish Speech requerido: https://github.com/TachibanaKimika/fish-speech/tree/166940c301b8b4650b3110397a38bc68727a3afa
- Modelo hermano (Ichika Edition): https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Ichika-Edition-V2-FP8-E4M3
- Ficha en free2aitools: https://free2aitools.com/model/skttttt/fishspeech-s2-pro-miku-edition-v2-fp8-e4m3
- Referencia por defecto (WAV): https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Miku-Edition-V2-FP8-E4M3/resolve/main/references/g1_mi_00002.wav
