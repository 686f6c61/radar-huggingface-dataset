# Skttttt/Fishspeech-S2-Pro-Yotsuba-Edition-V2-FP8-E4M3

## Resumen

Fishspeech S2 Pro "Yotsuba Edition" V2 FP8 E4M3 es un modelo de síntesis de voz (text-to-speech) en japonés, resultado del ajuste fino del modelo Fish Audio S2 Pro sobre la voz del personaje Yotsuba Nakano, de la franquicia *The Quintessential Quintuplets*. Lo publica el usuario Skttttt como parte de una colección de modelos fan, y esta variante concreta es la versión V2 completa fusionada y cuantizada a FP8 E4M3, pensada para ejecutarse en GPUs de 16 GB de VRAM.

El modelo resuelve el problema de generar habla expresiva en japonés con una identidad vocal concreta a partir de una referencia de audio incluida. No requiere descargar los pesos base ni aplicar un adaptador LoRA por separado: el ajuste ya está incorporado en `model.safetensors`. La arquitectura es `dual_ar`, propia de Fish Speech, con 4.962.228.480 parámetros totales y un codec de audio independiente (`codec.pth`, 1,87 GB).

Es relevante ahora porque demuestra un flujo de cuantización FP8 nativo (capas lineales y tablas de embedding con escalado por fila, acumulación en FP32) aplicado a un modelo TTS no estándar, con un loader propio y un parche para ROCm. La licencia es la Fish Audio Research License, lo que condiciona fuertemente su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | dual_ar (Fish Speech), transformer autorregresivo dual con codec de audio |
| Parámetros totales | 4.962.228.480 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3 con escalado por fila (202 capas lineales y 3 tablas de embedding); versión base en BF16 |
| Idiomas soportados | japonés (ja) |
| Licencia | fish-audio-research-license (other) |
| Formato de pesos | safetensors (FP8) + codec.pth + config.json y tokenizer |

## Arquitectura y entrenamiento

El modelo es un Fish Speech nativo con arquitectura `dual_ar`, no un checkpoint compatible con `AutoModel` de Transformers. Combina un modelo de texto a semántica (los pesos en `model.safetensors`) con un codec de audio fijo (`codec.pth`) que reconstruye la forma de onda a partir de tokens semánticos. La variante FP8 cuantiza 202 capas lineales y tres tablas de embedding con pesos E4M3 y escalado por fila; las operaciones lineales del transformer usan operandos FP8 mediante `torch._scaled_mm` con acumulación en FP32, mientras que atención, residuales, normalización y codec se mantienen en mayor precisión.

El ajuste fino se realizó sobre Fish Audio S2 Pro para adaptar la voz a Yotsuba Nakano, con un corpus de entrenamiento que no se distribuye (tampoco se incluyen estados del optimizador ni adaptadores independientes). No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La evaluación reportada por el autor consiste en pruebas de escucha a ciegas que sitúan a V2 como una mejora sustancial frente al modelo base y a V1; esa afirmación corresponde a la evaluación de la versión BF16 original, no a esta conversión FP8.

## Capacidades

- Generación de voz en japonés a partir de texto, condicionada por una grabación de referencia y su transcripción.
- Clonación de estilo y timbre: la referencia y la línea de texto influyen en el ritmo, la expresión y la similitud vocal.
- Múltiples referencias incluidas (`g2_yo_00052` por defecto, `g1_yo_00038`, `g1_yo_00047`), cada una con WAV, transcripción y tokens de codec precalculados.
- Inferencia con pesos FP8 nativos mediante helper propio (`infer_fp8.py`, `native_fp8.py`, `bootstrap.py`).
- Soporte de parche para SDPA en AMD (`amd_sdpa.patch`).
- No soporta tool calling, agentes, visión, audio de entrada distinto de la referencia ni razonamiento multi-paso; es exclusivamente TTS.

## Casos de uso

- Doblaje fan de contenido en japonés: se pasa el guion como texto y una referencia del personaje para generar líneas nuevas con voz consistente, útil en proyectos de subtitulado y doblaje no comercial.
- Prototipado de voces para videojuegos o novelas visuales: permite generar variantes de diálogo de un personaje concreto sin grabar sesiones adicionales, ajustando la referencia para modular la entrega.
- Generación de audiolibros o ficción sonora en japonés: el modelo mantiene una identidad vocal estable a lo largo de varias líneas, aunque conviene revisar cada fragmento por posibles derivas.
- Investigación en TTS y cuantización: sirve como caso de estudio de un pipeline FP8 E4M3 sobre una arquitectura `dual_ar` con codec separado y loader a medida.
- Pruebas de despliegue en hardware de consumo: al caber en GPUs de 16 GB, permite experimentar con inferencia TTS local en estaciones AMD con ROCm.
- Evaluación comparativa de referencias: los tres audios incluidos permiten medir cómo cambia el timbre y la expresividad según la referencia, un experimento útil para estudiar el condicionamiento por prompt de audio.
- Docencia y demostraciones de clonación de voz: escenario controlado para explicar las implicaciones éticas y técnicas de la síntesis personalizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo menciona pruebas de escucha a ciegas cualitativas de la versión V2 BF16 frente al modelo base y V1, sin métricas numéricas (MOS, similitud de hablante, WER). No se ha realizado comparación por escucha de esta conversión FP8 concreta.

## Requisitos de hardware

- VRAM objetivo: 16 GB según el autor; el consumo real depende del runtime, los ajustes y la longitud de entrada.
- Tamaño en disco: 6,9 GB de repositorio (4,97 GB de pesos FP8 + 1,87 GB de codec).
- GPU verificada: AMD RX 9070 XT con ROCm; el helper de inferencia incluido requiere una build de PyTorch para ROCm.
- Existe un helper experimental para NVIDIA CUDA, pero la inferencia completa en CUDA no se ha probado.
- Se requiere una GPU y una build de PyTorch compatibles con FP8; el guard de operandos rechaza la promoción a pesos completos antes de la matmul y no hay fallback a matmul en BF16.
- Despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama; requiere el fork de Fish Speech en el commit `166940c301b8b4650b3110397a38bc68727a3afa` y PyTorch 2.8.0 según el proyecto fijado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Fishspeech S2 Pro Yotsuba V2 FP8 E4M3 | 4.962.228.480 | no disponible | ja | fish-audio-research-license | safetensors FP8, fork Fish Speech |
| Fishspeech S2 Pro Yotsuba V2 (BF16) | no disponible | no disponible | ja | fish-audio-research-license | safetensors BF16, fork Fish Speech |
| Fish Audio S2 Pro (base) | no disponible | no disponible | no disponible | fish-audio-research-license | pesos originales de Fish Audio |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- La licencia Fish Audio Research License restringe el uso; no debe asumirse uso comercial libre. Hay que revisar `LICENSE.md` antes de cualquier despliegue.
- Es un proyecto fan no oficial, sin afiliación ni respaldo de los creadores, intérpretes o titulares de la franquicia; existen riesgos de derechos de imagen y de propiedad intelectual.
- Solo admite japonés; no hay soporte multilingüe documentado.
- La similitud con el personaje no está garantizada en todas las líneas y puede variar según la referencia y el texto.
- La conversión FP8 se verificó estructuralmente y por checksum, pero no se ha probado la inferencia individual en GPU ni se ha hecho comparación por escucha para este personaje.
- El soporte en CUDA es experimental y no probado de extremo a extremo; el entorno verificado es AMD con ROCm.
- No hay fallback a BF16 en la matmul: si el hardware o el runtime no soportan FP8, la inferencia falla en lugar de degradar.
- Riesgo de alucinación acústica y artefactos en entradas largas o textos con caracteres poco frecuentes; conviene validación humana.
- No se distribuyen datos de entrenamiento, estados del optimizador ni adaptadores, lo que limita la reproducibilidad y la auditoría del ajuste.
- El uso de clonación de voz exige consentimiento y cumplimiento normativo; el modelo puede emplearse para suplantación si no se controla el acceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Yotsuba-Edition-V2-FP8-E4M3
- Versión BF16 base: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Yotsuba-Edition-V2
- Fork de Fish Speech requerido: https://github.com/TachibanaKimika/fish-speech/tree/166940c301b8b4650b3110397a38bc68727a3afa
- Referencia por defecto (WAV): https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Yotsuba-Edition-V2-FP8-E4M3/resolve/main/references/g2_yo_00052.wav
- Licencia: LICENSE.md en el repositorio del modelo
