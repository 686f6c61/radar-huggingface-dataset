# Lucasgitguy-co/Turbo-Kev-Dictate-1.4B

## Resumen

Turbo-Kev-Dictate-1.4B es un modelo multimodal de reconocimiento de voz con limpieza de texto integrada, desarrollado por el usuario independiente Lucasgitguy-co. Combina el codificador de Whisper-large-v3-turbo (congelado) con un modelo de lenguaje Qwen3.5-0.8B-Base afinado (bajo el alias Kev-0.8B) mediante un proyector SwiGLU entrenado, siguiendo el esquema Ultravox. El objetivo es convertir audio con muletillas, repeticiones y falsos arranques en texto limpio en una sola pasada de red, y además limpiar transcripciones pegadas como texto.

El modelo se publica con un veredicto explícito de fallo en su puerta de calidad: en las pruebas retenidas empeora a Whisper-turbo en habla leída limpia (WER 8,81 frente a 5,74 en FLEURS en inglés) y en grabaciones largas (30,85 frente a 11,64), y solo transcribe el 64,95% de las preguntas dictadas en lugar de responderlas. Sí cumple el objetivo de eliminar muletillas (38,21% de reducción de WER en DisfluencySpeech). El autor lo publica tal cual para que el resultado sea inspeccionable y recomienda, para dictado real, usar Whisper-turbo seguido de la limpieza de texto por separado.

El repositorio contiene 681.021.440 parámetros reales en safetensors (3,2 GB), a pesar del "1.4B" del nombre, y se distribuye bajo licencia Apache 2.0. Solo soporta inglés; en 238 clips de FLEURS en otros 24 idiomas el WER es de 113,79, lo que descarta cualquier uso multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultravox: codificador Whisper-large-v3-turbo (congelado) + proyector SwiGLU + LLM Qwen3.5-0.8B-Base (Kev-0.8B) |
| Parametros totales | 681.021.440 (safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en el servidor llama.cpp de ejemplo; ventanas de audio de 30 s (1500 frames, 187 tokens por ventana) |
| Tipos de cuantizacion | GGUF, incluida Q5_K_M para el modelo de texto y q8_0 para el mmproj; pesos fuente en safetensors (BF16/F16) |
| Idiomas soportados | Solo inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout Ultravox con `audio_tower.*` y `multi_modal_projector.*`, texto en `text/`) y GGUF (modelo de texto + mmproj separados) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón Ultravox: el audio entra en el codificador de Whisper-large-v3-turbo con ventanas de 30 segundos y 1500 frames cada una, se agrupan 8 frames en la pila, y un proyector SwiGLU entrenado genera 187 tokens de audio por ventana de 30 s. Esos tokens se insertan en el prompt del modelo de lenguaje con el formato `<system> <user> [audio tokens] Transcribe.`, y la salida la produce el modelo de texto Qwen3.5-0.8B-Base afinado como Kev-0.8B. El codificador de Whisper está congelado; solo se entrenan el proyector y el modelo de texto.

Los datos de entrenamiento provienen de los conjuntos `Lucasgitguy-co/turbo-kev-dictate-data`, `amaai-lab/DisfluencySpeech`, `google/fleurs` y `facebook/voxpopuli`. Las transcripciones de referencia se generaron con whisper.cpp q8_0 de Whisper-turbo con beam 5. El modelo también acepta una transcripción pegada como texto (sin audio) en el mismo servidor y devuelve el texto limpio, lo que permite usarlo como etapa de posprocesado. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento de voz en inglés con eliminación de muletillas, repeticiones y falsos arranques en una sola pasada.
- Limpieza de transcripciones en modo texto: se le pasa un transcript pegado como mensaje de usuario y devuelve la versión limpia.
- Entrada de audio en wav, mp3 o flac mediante `llama-mtmd-cli` o servidor compatible con `/v1/chat/completions` (parte `input_audio`).
- Instrucción de transcripción fija ("Transcribe.") con temperatura 0 para decodificación greedy.
- No responde preguntas dictadas: las transcribe en lugar de contestarlas (solo el 64,95% se transcriben sin responder, cuando el criterio exigía el 98%).
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-step documentado.
- Sin capacidades de visión ni audio más allá de la transcripción.

## Casos de uso

- Limpieza de transcripciones existentes: el modo texto del modelo recibe un transcript crudo de cualquier ASR y devuelve el texto sin muletillas; es el uso con mejor relación calidad/riesgo según los propios resultados del autor (WER 5,49 en la cascada frente a 6,37 del modelo fusionado).
- Dictado de notas cortas en inglés: para grabaciones breves de habla espontánea, el modelo elimina "uh", "well" y repeticiones, con la advertencia de que en habla leída limpia pierde frente a Whisper-turbo.
- Investigación sobre fusión audio-LLM: el repositorio sirve como referencia reproducible de un pipeline Ultravox con codificador congelado y proyector entrenado, con scripts de conversión a GGUF y paridad verificada entre PyTorch y llama.cpp.
- Prototipado local en CPU o GPU de gama baja: con cuantización Q5_K_M y mmproj q8_0 cabe en llama.cpp y permite experimentar con dictado sin infraestructura grande.
- Evaluación de eliminación de disfluencias: útil como baseline para medir reducción de WER en datasets con muletillas (DisfluencySpeech), donde logra un 38,21% de mejora frente a Whisper crudo.
- No recomendado para atención al cliente, asistentes por voz ni respuesta a preguntas: el modelo transcribe las preguntas en lugar de contestarlas, y su WER en grabaciones largas (30,85) lo inhabilita para conversaciones multi-turno.

## Benchmarks y rendimiento

Resultados del autor, medidos con llama-server sobre el modelo de texto BF16 y mmproj F16, decodificación greedy. WER en %, menor es mejor.

| Prueba | Whisper-turbo crudo | Cascada Whisper → Kev-texto | Turbo-Kev-Dictate (fusionado) | Criterio | Resultado |
|---|---:|---:|---:|---|---|
| G1 DisfluencySpeech test (250), WER vs transcript limpio | 10,31 | 5,49 | 6,37 | ≥ 25% por debajo de Whisper crudo | pasa (38,21% menos) |
| G2 FLEURS en test (350), WER | 5,74 | 5,74 | 8,81 | ≤ Whisper crudo + 2,0 | falla |
| G2 LibriSpeech test-clean (300), WER | 1,85 | 2,10 | 3,42 | ≤ Whisper crudo + 2,0 | pasa |
| G3 preguntas y comandos hablados (194), % transcritos sin responder | 46,39 | no disponible | 64,95 | ≥ 98%, ninguno 1,3x más largo | falla |
| G5 grabaciones largas (6 × 75-81 s), WER | 11,64 | no disponible | 30,85 | ≤ WER FLEURS + 3 | falla |

Datos adicionales: en 238 clips de FLEURS en 24 idiomas distintos del inglés el WER es 113,79. En un subconjunto de 30 clips puntuado directamente con el modelo PyTorch, disfluencias 5,82, FLEURS 14,16 y prompts conservados 66,67%. La paridad entre el pipeline PyTorch y llama.cpp se verificó (tokens de prompt idénticos, mismo número de tokens de audio, coseno del proyector ≥ 0,999 en CPU).

## Requisitos de hardware

- VRAM estimada: con 681 M de parámetros, en BF16/F16 el modelo completo ocupa aproximadamente 1,4 GB; en cuantización Q5_K_M, alrededor de 0,5 GB para el modelo de texto más el mmproj q8_0.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; también funciona en CPU mediante llama.cpp.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; el cuello de botella es el codificador de audio, no el tamaño.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli`, `llama-server` con `--jinja -c 8192 --temp 0`), y el modelo de texto en `text/` carga por separado en transformers como Qwen3.5. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Turbo-Kev-Dictate-1.4B | 681 M | 8192 tokens; audio en ventanas de 30 s | Solo inglés | Apache 2.0 | Fusiona ASR y limpieza; falla criterios de calidad en habla limpia y grabaciones largas |
| Whisper-large-v3-turbo | 809 M | Ventanas de 30 s | Multilingüe | MIT (según el modelo original de OpenAI) | Referencia del propio autor; mejor WER en habla limpia (5,74 FLEURS) y grabaciones largas (11,64) |
| Cascada Whisper-turbo + Kev-texto | Whisper + 0,8 B | Ventanas de 30 s + 8192 tokens | Solo inglés en la etapa de limpieza | Apache 2.0 (componente Kev) | Mejor resultado en disfluencias (5,49) y en FLEURS (5,74); opción recomendada por el autor |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La puerta de calidad del propio autor está marcada como FAILED: el modelo es peor que Whisper-turbo en habla leída limpia (FLEURS 8,81 frente a 5,74) y en grabaciones largas (30,85 frente a 11,64).
- Solo transcribe el 64,95% de las preguntas dictadas en lugar de responderlas, muy lejos del 98% exigido; no es apto como asistente conversacional por voz.
- Solo soporta inglés: en otros 24 idiomas el WER es 113,79, lo que hace inviable cualquier uso multilingüe.
- Riesgo de alucinación y de reescritura semántica: en los ejemplos del autor se observa un cambio de "he got scared" a "he gets scared", es decir, el modelo puede alterar el contenido además de limpiar muletillas.
- Licencia Apache 2.0 permite uso comercial, pero el estado de calidad documentado desaconseja producción sin una evaluación propia sobre el dominio objetivo.
- El GGUF unificado no carga en llama.cpp (error "wrong number of tensors"); es necesario descargar el modelo de texto y el mmproj por separado o desempaquetar el bundle con `gguf_bundle.py unpack`.
- El nombre "1.4B" no coincide con los 681 M de parámetros reales, lo que puede inducir a error al planificar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/Turbo-Kev-Dictate-1.4B
- Repositorio GGUF: https://huggingface.co/Lucasgitguy-co/Turbo-Kev-Dictate-1.4B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Lucasgitguy-co/turbo-kev-dictate-data
- Dataset DisfluencySpeech: https://huggingface.co/datasets/amaai-lab/DisfluencySpeech
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Modelo base de texto: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo base de audio: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo base Kev: https://huggingface.co/jaredpalmer/kev-0.8b
- llama.cpp: https://github.com/ggml-org/llama.cpp
