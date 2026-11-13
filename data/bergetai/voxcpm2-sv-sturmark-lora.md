# bergetai/voxcpm2-sv-sturmark-lora

## Resumen

VoxCPM2 Swedish LoRA (Sturmark) es un adaptador LoRA para el modelo base openbmb/VoxCPM2, un sistema de síntesis de voz (TTS) de 2B parámetros con arquitectura de difusión autorregresiva sin tokenizador. Lo desarrolla Berget AI y su propósito es dotar al modelo base de una pronunciación natural en sueco: erre alveolar correcta, prosodia sueca y acentuación de palabras compuestas que el modelo original, entrenado mayoritariamente en otros idiomas, no produce de forma satisfactoria.

El adaptador se ha entrenado sobre un audiolibro narrado profesionalmente en sueco, con aproximadamente 7,5 horas de audio y 5.139 pares (fragmento, transcripción) de un único hablante. El resultado es un modelo que reproduce el timbre y la prosodia de ese narrador concreto, no un TTS sueco genérico ni multilingüe.

Es relevante porque, según la evaluación del autor, alternativas como Zonos 3 Mini, KugelAudio, Qwen3-TTS y Piper no generaban habla sueca natural, y este adaptador cubre ese hueco para una voz específica con licencia Apache 2.0 y pesos publicados en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre VoxCPM2 (difusión autorregresiva sin tokenizador, 2B) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=16, alpha=32; el base es de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_len de generación por defecto: 4096) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 0.0 GB; incluye lora_config.json y pesos LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre openbmb/VoxCPM2, un modelo TTS de 2B parámetros descrito por el autor como «tokenizer-free diffusion AR», es decir, generación autorregresiva con difusión y sin tokenizador textual intermedio. El LoRA se configura con r=16 y alpha=32, activando tanto el módulo de lenguaje (enable_lm) como el módulo de difusión (enable_dit), lo que permite adaptar simultáneamente la modelización lingüística y el decodificador acústico.

El entrenamiento usó 5.139 segmentos de 2 a 15 segundos (4.883 de entrenamiento y 256 de validación) procedentes de un audiolibro sueco narrado profesionalmente. El audio original a 24 kHz se remuestreó a la tasa del codificador AudioVAE (16 kHz) y las transcripciones se obtuvieron por alineamiento forzado con KBLab/kb-whisper-large. Se entrenó con lr 1e-4, batch 1 con acumulación de gradiente 4, 4.000 pasos (unas 3,3 épocas) en fp32 sobre una AMD MI300X con ROCm 7.2. La model card documenta que en ROCm el entrenamiento en bf16/fp32 mixto falla en la pasada forward y hay que forzar fp32.

## Capacidades

- Síntesis de voz (text-to-speech) en sueco con prosodia, erre alveolar y acentuación de compuestos naturales para la voz del narrador.
- Clonación de voz implícita: el adaptador incorpora el timbre del narrador del audiolibro.
- Generación controlable mediante parámetros de inferencia (cfg_value, inference_timesteps; el ejemplo usa cfg_value=2.0 e inference_timesteps=10).
- Ejecución en CPU, CUDA y MPS (Apple Silicon) a través de la librería voxcpm.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es exclusivamente un modelo de voz.
- No es multilingüe: el adaptador no amplía los idiomas del modelo base.

## Casos de uso

- Audiolibros y narración larga en sueco: el adaptador está entrenado sobre narración profesional, por lo que es adecuado para convertir texto extenso en audio con pausas naturales; conviene sintetizar por frases o elevar max_len para textos largos.
- Locución para pódcasts y contenido editorial: permite generar cortinillas, introducciones y segmentos narrados con una voz consistente y prosodia sueca correcta.
- Accesibilidad y lectura de documentos: lectura en voz alta de artículos, informes o documentación interna en sueco para usuarios con discapacidad visual, desplegable en CPU o MPS sin GPU dedicada.
- Prototipado de asistentes de voz en sueco: integración en pipelines de TTS para probar la experiencia conversacional antes de contratar una voz comercial, gracias a la licencia Apache 2.0.
- E-learning y formación interna: generación de material didáctico en audio con pronunciación correcta de términos compuestos suecos, un punto débil del modelo base.
- Investigación en TTS y adaptación lingüística: sirve como referencia reproducible de fine-tuning LoRA sobre VoxCPM2 para otros idiomas o voces, con hiperparámetros y metodología documentados.
- Doblaje y previsualización de vídeo: generación de pistas de voz temporales en sueco para maquetas antes de la locución definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación cualitativa frente a Zonos 3 Mini, KugelAudio, Qwen3-TTS y Piper en sueco, en la que ninguna de esas alternativas produjo habla sueca natural, pero no se aportan métricas numéricas (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 2B parámetros y el ejemplo de uso emplea device="mps" con load_denoiser=False y optimize=False, lo que sugiere que cabe en hardware de consumo, pero no se confirma una cifra de VRAM.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 1× AMD MI300X (ROCm 7.2); la inferencia se documenta para CUDA, CPU y MPS.
- GPU de consumo: no se especifica ningún modelo concreto (RTX 4090, etc.); el soporte de MPS y CPU indica que es viable sin GPU de datacenter.
- Opciones de despliegue: librería voxcpm (pip install voxcpm soundfile, Python 3.12, torch ≥ 2.5) con VoxCPM.from_pretrained; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en sueco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2 + LoRA Sturmark (este) | 2B (base) + LoRA r=16 | No disponible | Natural según el autor (voz única) | Apache 2.0 | Hugging Face |
| Zonos 3 Mini | No disponible | No disponible | No natural según la evaluación del autor | No disponible | No disponible |
| Qwen3-TTS | No disponible | No disponible | No natural según la evaluación del autor | No disponible | No disponible |
| Piper | No disponible | No disponible | No natural según la evaluación del autor | No disponible | No disponible |

Los datos de los modelos comparables no se detallan en la información proporcionada; la comparación se limita a la valoración cualitativa de la model card.

## Limitaciones y advertencias

- Los números deben escribirse con letras en el texto de entrada («fyrtiotre» en lugar de «43») para una pronunciación correcta.
- Los saltos de línea a nivel de frase en el texto fuente producen pausas naturales; ignorarlos puede degradar el ritmo.
- Para textos largos hay que elevar max_len (por defecto 4096) o sintetizar frase a frase.
- El adaptador reproduce el timbre del narrador y no convierte el modelo base en multilingüe.
- Riesgo de suplantación: el autor prohíbe explícitamente usar el adaptador para generar voz que suplante al narrador.
- El narrador cedió su voz para entrenamiento sin compensación (acuerdo con Berget AI, 2026-11); conviene revisar las condiciones de uso comercial más allá de la licencia Apache 2.0 del artefacto.
- No hay métricas objetivas publicadas de calidad (MOS, WER, similitud de hablante), por lo que la evaluación en producción debe hacerse por cuenta propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria todavía.
- En ROCm, el entrenamiento en precisión mixta bf16/fp32 falla en la pasada forward; hay que forzar fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bergetai/voxcpm2-sv-sturmark-lora
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Blog de Berget AI con la evaluación completa: mencionado en la model card, URL no disponible en la información proporcionada
- KBLab/kb-whisper-large (alineamiento forzado): https://huggingface.co/KBLab/kb-whisper-large
