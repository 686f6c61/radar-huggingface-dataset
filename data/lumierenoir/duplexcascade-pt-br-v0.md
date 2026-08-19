# lumierenoir/DuplexCascade-PT-BR-V0

## Resumen

DuplexCascade-PT-BR-V0 es un modelo de lenguaje conversacional fine-tuneado sobre Qwen/Qwen3-4B-Instruct-2507 mediante QLoRA, especializado en diálogo hablado full-duplex en portugués de Brasil (pt-BR). Forma parte de un fork del proyecto DuplexCascade de sbintuitions, que implementa un pipeline en cascada ASR-LLM-TTS sin detección de actividad de voz (VAD), donde un único LLM gestiona el flujo conversacional emitiendo tokens especiales que controlan turnos, interrupciones, backchannels y pausas de pensamiento.

El modelo está entrenado con el objetivo de entropía cruzada ponderada y enmascarada descrito en el paper de DuplexCascade (§4.1), calculando la pérdida únicamente sobre los micro-turnos del sistema. Con 4.410 millones de parámetros y una ventana de contexto de 2048 tokens, este modelo resuelve el problema de la interacción hablada natural sin depender de un VAD externo, permitiendo que el propio LLM negocie el ritmo de la conversación en tiempo real.

Su relevancia actual radica en que combina la inteligencia de un LLM de texto (Qwen3-4B) con la capacidad de gestionar diálogo hablado simultáneo, algo que tradicionalmente requería sistemas de detección de voz separados. Está disponible en formato safetensors (modelo fusionado bf16 y adaptador QLoRA) y GGUF cuantizado q4_k_m para inferencia con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507) con adaptador QLoRA |
| Parametros totales | 4.410.093.056 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GGUF q4_k_m, bf16 (modelo fusionado), NF4 (adaptador QLoRA) |
| Idiomas soportados | Portugues de Brasil (pt-BR) principalmente; otros idiomas degradan |
| Licencia | MIT |
| Formato de pesos | safetensors (modelo fusionado y adaptador), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parámetros aproximadamente, y se le aplica un fine-tune con QLoRA en 4 bits NF4 con rango r=16, alpha=16 y dropout 0, sobre todos los módulos lineales (q/k/v/o/gate/up/down). Además se incluyen `modules_to_save=["embed_tokens", "lm_head"]` para entrenar las embeddings de los tokens especiales nuevos. El entrenamiento utiliza un objetivo de entropía cruzada ponderada y enmascarada, donde la pérdida solo se calcula sobre los micro-turnos del sistema, con pesos específicos por token: `<|user finish speaking|>` ×10, `<|user interruption|>` ×5, `<|system backchannel|>` ×3, `<|user backchannel|>` ×2, y `<|user is speaking|>`/`<|user is thinking|>` ×1.

Los datos de entrenamiento son diálogos sintéticos en pt-BR generados con Gemma 4 E4B mediante llama.cpp, convertidos a micro-turnos duplex con interrupciones, backchannels y pausas de pensamiento probabilísticas, y longitudes de chunk del sistema variables entre 10 y 48 tokens. El entrenamiento se realizó en dos etapas: un fine-tune inicial de aproximadamente 2000 pasos seguido de un fine-tune de continuación de unos 1000 pasos partiendo del modelo fusionado, sobre una mezcla de respuestas cortas y largas. Se usó el stack de Unsloth, PEFT y Hugging Face TRL en una GPU de 16 GB.

## Capacidades

- Generación de diálogo hablado full-duplex: el modelo emite tokens especiales que controlan el flujo conversacional en tiempo real, sin necesidad de VAD externo.
- Gestión de turnos: decide cuándo empezar a hablar, cuándo interrumpir y cuándo emitir backchannels (por ejemplo, "uhum", "tá", "entendi").
- Manejo de interrupciones del usuario: detecta y responde a interrupciones mediante el token `<|user interruption|>`.
- Pausas de pensamiento: puede indicar silencios o pausas naturales con `<|no voice|>` y `<|user is thinking|>`.
- Capacidades lingüísticas del modelo base: al estar basado en Qwen3-4B-Instruct, conserva razonamiento, generación de texto y comprensión en múltiples idiomas, aunque el fine-tune degrada el rendimiento fuera del portugués brasileño.
- Integración en pipeline de voz: diseñado para funcionar con ASR (faster-whisper) y TTS (pocket-tts) en una arquitectura en cascada.

## Casos de uso

- Asistentes de voz en portugués brasileño: el modelo puede gestionar conversaciones habladas naturales con interrupciones y solapamientos, ideal para asistentes personales o de atención al cliente que necesitan responder sin esperar a que el usuario termine de hablar.
- Sistemas de atención al cliente telefónica: al no depender de VAD, el modelo puede manejar llamadas donde el usuario interrumpe o hace backchannels, mejorando la fluidez de la interacción.
- Demostraciones de investigación en diálogo hablado: sirve como referencia para estudiar la optimización de micro-turnos y la gestión de turnos sin VAD en pipelines en cascada.
- Prototipos de interfaces conversacionales por voz: desarrolladores pueden integrarlo con llama.cpp y un frontend web para crear demos de speech-to-speech en tiempo real.
- Entrenamiento y evaluación de modelos de diálogo: el dataset sintético y los builders incluidos en el repositorio permiten generar más datos de micro-turnos duplex para otros experimentos.
- Aplicaciones educativas de práctica de conversación en pt-BR: el modelo puede simular un interlocutor que interrumpe, hace pausas y emite backchannels, útil para practicar fluidez oral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la precisión factual y la coherencia a largo plazo son secundarias frente al comportamiento de gestión de turnos, por lo que no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo fusionado en bf16 requiere aproximadamente 8,8 GB de VRAM (4,41B parámetros × 2 bytes). Con cuantización GGUF q4_k_m, el requisito baja a unos 2,5-3 GB.
- GPU recomendadas: una GPU de 16 GB (como RTX 4080 o RTX 4090) es suficiente para el fine-tune; para inferencia, cualquier GPU con al menos 4 GB de VRAM puede ejecutar la versión cuantizada.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores con la cuantización GGUF.
- Opciones de despliegue: llama.cpp (recomendado, con `llama-server` y la bandera `-sp` para emisión de tokens especiales), Transformers + PEFT para el adaptador, y el stack completo con faster-whisper y pocket-tts orquestado por `run_services.sh`.
- Latencia y throughput: no disponible; la latencia end-to-end está dominada por los backends ASR y TTS, no por el LLM en sí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| DuplexCascade-PT-BR-V0 | 4,41B | 2048 | Diálogo hablado full-duplex en pt-BR | MIT |
| Qwen3-4B-Instruct-2507 (base) | 4,41B | 2048 (originalmente más, pero el fine-tune lo reduce) | LLM de propósito general | Apache 2.0 (Qwen) |
| DuplexCascade original (sbintuitions) | no disponible | no disponible | Diálogo hablado full-duplex multilingüe | MIT |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación principal es con el modelo base Qwen3-4B-Instruct, del cual hereda la arquitectura pero con un fine-tune específico para diálogo hablado en portugués brasileño.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos en portugués brasileño: la precisión factual y la coherencia a largo plazo son limitadas; el modelo prioriza el comportamiento de turnos sobre la veracidad.
- Degradación en otros idiomas: el fine-tune está orientado a pt-BR; usarlo en otros idiomas produce resultados deficientes.
- Riesgo de alucinación: al ser un modelo pequeño (4B) y entrenado con datos sintéticos, puede generar información incorrecta o inventada.
- Contexto limitado a 2048 tokens: no apto para tareas que requieran contexto largo.
- Dependencia del pipeline en cascada: el rendimiento end-to-end depende de la calidad del ASR y TTS; el LLM por sí solo no procesa audio.
- Requiere la bandera `-sp` en llama.cpp: sin ella, los tokens especiales de duplex se eliminan silenciosamente de las completions, rompiendo la funcionalidad.
- Licencia MIT: permite uso comercial, pero los datos de entrenamiento generados con Gemma (modelo abierto) y Common Voice (CC0) son distribuibles; verificar las licencias de los componentes del pipeline (Whisper MIT, pocket-tts CC BY 4.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lumierenoir/DuplexCascade-PT-BR-V0
- Paper DuplexCascade (arXiv): https://arxiv.org/abs/2603.09180
- Paper DuplexCascade (HTML): https://arxiv.org/html/2603.09180v1
- Repositorio DuplexCascade original (sbintuitions): https://github.com/sbintuitions/DuplexCascade
- Código del modelo (model.py): https://github.com/sbintuitions/DuplexCascade/blob/main/model.py
- README de DuplexCascade: https://github.com/sbintuitions/DuplexCascade/blob/main/README.md
- Página del paper en HuggingFace: https://huggingface.co/papers/2603.09180
- Proyecto fuente del fork (felipepenhorate/custom-duplex-cascade-pt-br): https://github.com/felipepenhorate/custom-duplex-cascade-pt-br
