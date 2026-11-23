# Lucasgitguy-co/LvW-Ming-TTS-0.5B

## Resumen

LvW-Ming-TTS-0.5B es un ajuste fino (finetune) del modelo de síntesis de voz Ming-3.0-tts-0.5B, desarrollado por el usuario Lucasgitguy-co a partir del modelo base de inclusionAI. Se trata de un modelo texto-a-voz (TTS) multilingüe con capacidad de clonación de voz, entrenado mediante una única ronda de self-training (rejection-sampling fine-tuning) con el objetivo declarado de reducir errores de palabra y fallos de parada. La arquitectura, los ficheros y el uso son idénticos a los del modelo base.

El modelo conserva el mismo pipeline de inferencia que Ming-3.0-tts (librería `ming_tts`, código de inclusionAI) y soporta siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés. El repositorio incluye pesos en safetensors y ONNX, con un total de 1.479.454.868 parámetros según los datos reales del repo, y un tamaño de repositorio de 3.0 GB.

Es relevante ahora principalmente como caso de estudio metodológico: el autor publica explícitamente que el modelo **no supera** al base en el conjunto de test reservado (puerta de calidad FAILED), por lo que la versión recomendada para uso real es el modelo base. La ficha documenta tanto el resultado como las condiciones del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (pipeline TTS de Ming-3.0-tts; incluye cabezas de audio: aggregator, flow head, stop head, speaker head) |
| Parametros totales | 1.479.454.868 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (max_sequence_length de entrenamiento: 1024) |
| Tipos de cuantizacion | bf16 (PyTorch), MLX bf16/8-bit/4-bit, GGUF; ONNX disponible en el repo |
| Idiomas soportados | zh, en, de, es, fr, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX; variantes GGUF y MLX en repos separados |

## Arquitectura y entrenamiento

El modelo es un transformer denso que reutiliza íntegramente la arquitectura de Ming-3.0-tts-0.5B: codificador de texto, módulo de hablante, aggregator, flow head para generación acústica y stop head para detección de fin de audio. El ajuste fino se realizó sobre el modelo base mediante self-training con rejection sampling: el modelo base generó audio para frases de Common Voice (CC0) en los siete idiomas, Whisper large-v3-turbo transcribió cada clip y solo se conservaron aquellos con transcripción perfecta (0 WER/CER), sin clipping, con parada limpia y velocidad de habla normal. De 2100 clips generados se retuvieron 705 (1050 frases).

Sobre esos datos se entrenó un LoRA (r=8, alpha=16, dropout 0.05, sobre q_proj/k_proj/v_proj/o_proj) junto con las cabezas de audio (linear_proj_audio, flowloss, stop_head, spk_head), durante 1 epoch (67 pasos), learning rate 5e-6, warmup 20 pasos, gradient checkpointing activado, speaker dropout 0.5 y seed 42, en una GPU en la nube (Modal). El LoRA se fusionó posteriormente y los pesos se reescribieron en el layout original del release (mismos nombres, formas y dtypes de tensor). No se utilizó audio externo al propio modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en siete idiomas.
- Clonación de voz (voice cloning) mediante referencias de audio.
- Uso de voces integradas (built-in voices) para inglés y chino, y voces clonadas para los siete idiomas.
- Control de tareas mediante el parámetro `task` (por ejemplo, `"IP"`) y diccionario `controls` (por ejemplo, `ip: "US_Emma"`).
- Soporte de `use_zero_spk_emb` para embeddings de hablante zero-shot.
- Capacidades paralingüísticas y control de pitch heredadas del modelo base (según su model card).
- Ejecución en CUDA (por defecto `cuda:0`), Apple Silicon (`mps`, con un parche en `modeling_bailingmm.py`) y variantes MLX/GGUF/web.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; es un modelo TTS, no un LLM de propósito general.

## Casos de uso

- **Generación de audiolibros y narración multilingüe**: el modelo sintetiza texto en siete idiomas con voces integradas o clonadas, adecuado para producir narraciones largas con una voz consistente por hablante.
- **Doblaje y localización de contenido**: permite clonar una voz de referencia y generar la misma locución en de, es, fr, ko, ja, zh o en, facilitando la localización de vídeos y cursos.
- **Prototipado de asistentes de voz**: integrable en pipelines de TTS para asistentes conversacionales, con control de hablante mediante `controls` y `use_zero_spk_emb`.
- **Investigación en self-training y rejection sampling para TTS**: el repositorio documenta el pipeline completo (generación, filtrado con Whisper, LoRA, métricas), útil como referencia metodológica reproducible.
- **Evaluación comparativa de finetunes**: sirve como caso de estudio de una puerta de calidad fallida, útil para diseñar criterios de aceptación antes de entrenar.
- **Despliegue en Apple Silicon o navegador**: las variantes MLX (bf16/8-bit/4-bit), GGUF y web (ming-wasm) permiten inferencia local en Mac o en el navegador para demos y pruebas.
- **Generación de voces para accesibilidad**: lectura de texto a voz en aplicaciones de accesibilidad, con la salvedad de que el modelo base es la opción recomendada por el propio autor.

## Benchmarks y rendimiento

Resultados del autor sobre 420 clips reservados (30 frases por idioma, 2 seeds, mismas seeds y voces para ambos modelos). WER para en/de/es/fr, CER para zh/ja/ko; transcripción con Whisper large-v3-turbo. SIM es similitud coseno CAM++ contra el clip de referencia de la voz.

| Idioma | Metrica | Base | Este modelo | Fallos de parada base | Fallos de parada este modelo | SIM base | SIM este modelo |
|---|---|---|---|---|---|---|---|
| de | WER | 1,54% | 1,70% | 0/60 | 0/60 | 0,8645 | 0,8625 |
| en | WER | 3,68% | 3,68% | 0/60 | 1/60 | 0,8198 | 0,8139 |
| es | WER | 0,94% | 2,70% | 0/60 | 0/60 | 0,8638 | 0,8638 |
| fr | WER | 19,39% | 19,16% | 0/60 | 0/60 | 0,8315 | 0,8286 |
| ja | CER | 6,76% | 5,81% | 0/60 | 0/60 | 0,8717 | 0,8624 |
| ko | CER | 7,07% | 6,67% | 0/60 | 0/60 | 0,8431 | 0,8376 |
| zh | CER | 9,58% | 10,01% | 2/60 | 2/60 | 0,8201 | 0,8151 |
| ALL | MIXED | 6,99% | 7,11% | 2/420 | 3/420 | 0,8449 | 0,8406 |

Reglas de aceptación fijadas antes del entrenamiento y resultado: error medio inferior al base (6,99% vs 7,11%) → FAIL; fallos de parada no superiores (2/420 vs 3/420) → FAIL; ningún idioma más de un 10% (+0,5 pt) peor → FAIL (español empeora). El autor declara la puerta de calidad como FAILED y recomienda el modelo base para uso real. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. Con 1.479.454.868 parámetros, en bf16 los pesos ocupan aproximadamente 2,96 GB; en 8-bit, unos 1,48 GB; en 4-bit, unos 0,74 GB, a lo que hay que sumar activaciones y el pipeline de audio (no cuantificado en la información).
- **GPU recomendadas**: no especificadas por el autor. El código usa `device="cuda:0"` por defecto; el entrenamiento se realizó en una GPU en la nube (Modal) sin especificar modelo.
- **Consumer GPU**: por tamaño de pesos, es plausible en GPUs consumer con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB), aunque no se confirma en la información disponible.
- **Apple Silicon**: soportado vía `device="mps"` con un parche en `modeling_bailingmm.py` (sustituir `torch.autocast(device_type='cuda', ...)` por `torch.autocast(device_type=self.device.type, ...)`). Variantes MLX bf16/8-bit/4-bit disponibles.
- **Opciones de despliegue**: pipeline oficial `ming_tts` (PyTorch), ONNX, GGUF (audio.cpp), MLX y web (ming-wasm).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LvW-Ming-TTS-0.5B | 1.479.454.868 | No disponible (entrenamiento 1024) | 7 | MIT | Finetune con puerta de calidad FAILED; no supera al base |
| Ming-3.0-tts-0.5B (base) | No disponible en esta ficha | No disponible | 7 | No disponible en esta ficha | Recomendado por el autor para uso real |
| Otras alternativas TTS | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- **Puerta de calidad fallida**: el modelo no mejora al base en el test reservado (error medio 7,11% vs 6,99%; fallos de parada 3/420 vs 2/420; español empeora de 0,94% a 2,70% WER). El autor recomienda usar el modelo base.
- **Similitud de hablante**: ligeramente inferior al base en todos los idiomas (0,8406 vs 0,8449 de media); la model card del base ya advierte que la similitud de hablante es más débil que la precisión de contenido.
- **Sin dígitos en el texto de entrenamiento**: la normalización de texto estaba desactivada durante la generación de datos; el manejo de números no está validado.
- **Evaluación limitada**: 210 frases reservadas (2 seeds) con un único modelo ASR; no es una ejecución completa de benchmarks.
- **Sesgos**: no documentados en la información disponible; hereda los del modelo base.
- **Riesgo de alucinación**: no aplica en el sentido de LLM, pero puede producir errores de pronunciación, transcripción imperfecta o colas de ruido (fallos de parada).
- **Licencia MIT**: permite uso comercial, pero se heredan las condiciones y advertencias del modelo base (clonación de voz y voces integradas) según su model card.
- **Uso responsable**: la clonación de voz exige consentimiento y cumplimiento normativo; el autor remite a las condiciones del modelo base.
- **Caveat de producción**: no usar este finetune como sustituto del base sin validación propia; el propio autor lo publica solo para inspección del resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Código oficial Ming-3.0-tts: https://github.com/inclusionAI/Ming-3.0-tts
- Variante MLX bf16: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-MLX-bf16
- Variante MLX 8-bit: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-MLX-4bit
- Variante GGUF (audio.cpp): https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-GGUF
- Variante web (ming-wasm): https://huggingface.co/Lucasgitguy-co/LvW-Ming-TTS-0.5B-web
- Modal (plataforma de entrenamiento): https://modal.com
