# jatsharma/whisper-hinglish-apex-coreml

## Resumen

Whisper Hinglish Apex Core ML es una conversión del modelo de reconocimiento automático del habla Oriserve/Whisper-Hindi2Hinglish-Apex al formato Core ML, empaquetado para su uso con WhisperKit. El modelo original es un fine-tune de OpenAI Whisper large-v3-turbo especializado en habla code-switching hindi-inglés (hinglish), y esta versión mantiene exactamente los mismos pesos, cambiando únicamente el formato para ejecutarse de forma totalmente local en el Neural Engine y la GPU de los Macs con Apple Silicon.

El modelo resuelve un problema concreto: la transcripción de reuniones técnicas y conversaciones donde los hablantes alternan hindi e inglés, un escenario en el que los modelos entrenados solo en inglés producen resultados incoherentes o descartan segmentos. La salida se genera siempre en hinglish romanizado, es decir, texto hindi escrito con caracteres latinos mezclado con términos ingleses, lo que facilita su lectura a hablantes bilingües sin necesidad de teclado devanagari.

La relevancia de este repositorio es fundamentalmente práctica: permite desplegar un modelo de la familia Whisper large-v3-turbo (encoder de 32 capas, decoder de 4 capas) en hardware de consumo de Apple sin depender de la nube ni de PyTorch. Está publicado bajo licencia Apache-2.0 y su tamaño total es de 1,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo): encoder de 32 capas, decoder de 4 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de decoder de 224 tokens; audio de entrada en fragmentos de hasta ~25-30 s |
| Tipos de cuantizacion | no disponible (pesos Core ML compilados, sin variantes de cuantizacion publicadas) |
| Idiomas soportados | hindi (hi), inglés (en); salida en hinglish romanizado |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlmodelc`): `AudioEncoder.mlmodelc` (1,2 GB), `TextDecoder.mlmodelc` (328 MB), `MelSpectrogram.mlmodelc` (0,4 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con encoder de 32 capas y decoder de 4 capas, front-end log-mel de 128 bins y tokenizer BPE heredado del modelo original. El fine-tune de Oriserve ajusta los pesos de OpenAI Whisper large-v3-turbo sobre datos de habla hindi-inglés con el objetivo de producir transcripciones en hinglish romanizado; no se dispone de información sobre el volumen de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión a Core ML se realizó con whisperkittools (commit `84f77a8`), fijando la longitud máxima de secuencia del decoder en 224 tokens y compilando a `.mlmodelc`. Como Apex no incluye cabezas de alineación de palabras que el conversor necesita, se añadieron las de `openai/whisper-large-v3-turbo` en `generation_config.json` con los índices `[[2,4],[2,11],[3,3],[3,6],[3,11],[3,14]]`. Las comprobaciones de precisión del conversor (salidas de encoder y decoder frente a PyTorch) superaron un umbral de 25 dB PSNR.

## Capacidades

- Reconocimiento automático del habla (ASR) para audio hindi-inglés con alternancia de código dentro de la misma frase.
- Transcripción en hinglish romanizado: el hindi se escribe con caracteres latinos y los términos ingleses se integran en la misma secuencia.
- Ejecución totalmente local en Apple Silicon, usando Neural Engine para el decoder y GPU/CPU para el encoder y el front-end mel.
- Procesamiento por turnos de habla: acepta fragmentos de audio de hasta aproximadamente 25-30 segundos (límite práctico de 224 tokens de decoder, a razón de ~5 tokens por segundo en hinglish).
- Compatibilidad con WhisperKit en Swift, con opciones de decodificación configurables (`language = "hi"`, `detectLanguage = false`, `withoutTimestamps = true`, `chunkingStrategy = .none`).
- No soporta tool calling, function calling, agentes, visión, audio de salida ni modo thinking; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones de ingeniería hindi-inglés: el modelo captura habla con predominio de hindi que los modelos solo en inglés convierten en texto sin sentido o descartan; se recomienda preprocesar con un diarizador y transcribir cada turno de hablante por separado, como en el flujo medido por el autor (una reunión de 31 minutos tarda unos 7 minutos en un M1 Pro).
- Actas y notas de reuniones en equipos distribuidos de India: al producir hinglish romanizado, el texto resultante es legible directamente por hablantes bilingües sin conversión de escritura, lo que simplifica la revisión y el archivado.
- Subtitulado y documentación de vídeos internos: integrado en una app macOS con WhisperKit, permite generar transcripciones on-device sin enviar audio confidencial a servicios en la nube.
- Asistentes de voz locales para dominios técnicos: combinado con un glosario de términos del equipo (nombres de herramientas, servicios, métricas) para corregir romanizaciones erróneas como "Confidence par" por *Confluence*.
- Investigación en code-switching: sirve como referencia reproducible de un ASR hinglish ejecutable en hardware de consumo, útil para comparar con modelos entrenados desde cero o con enfoques de adaptación de dominio.
- Pipeline híbrido de transcripción: emparejado con un reconocedor solo en inglés para los tramos exclusivamente ingleses, corrige la tendencia del modelo a romanizar términos y números ingleses y a omitir frases en inglés.
- Prototipado rápido en Swift: al cargarse como carpeta de modelo en WhisperKit, permite validar ideas de producto de transcripción en un Mac sin infraestructura de servidores GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta mediciones cualitativas y de latencia sobre reuniones reales de ingeniería hindi-inglés en un M1 Pro: captura adecuada del habla con predominio de hindi y un tiempo de transcripción de aproximadamente 7 minutos para una reunión de 31 minutos procesada turno a turno.

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa 1,6 GB; el encoder Core ML pesa 1,2 GB y el decoder 328 MB, por lo que el modelo cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon.
- GPU recomendadas: Apple Silicon (M1, M1 Pro, M2, M3, M4 y variantes Pro/Max/Ultra). El autor midió el rendimiento en un M1 Pro.
- Cabe en hardware de consumo: sí, en Macs con Apple Silicon; no está pensado para GPUs NVIDIA ni para CPU x86.
- Opciones de despliegue: WhisperKit (Swift) sobre Core ML; descarga mediante `huggingface-cli` o cualquier cliente de Hugging Face. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo ASR en formato Core ML.
- Latencia y throughput: aproximadamente 7 minutos para transcribir 31 minutos de audio turno a turno en un M1 Pro. El encoder tarda menos de un minuto en cargar en GPU; en Neural Engine el compilador puede tardar una hora o más en la primera carga y tras actualizaciones de macOS. El decoder de 4 capas compila en segundos en Neural Engine y es más rápido allí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| jatsharma/whisper-hinglish-apex-coreml | no disponible (large-v3-turbo) | 224 tokens de decoder | hi, en (salida hinglish) | Apache-2.0 | Core ML | Conversión on-device para Apple Silicon |
| Oriserve/Whisper-Hindi2Hinglish-Apex | no disponible (large-v3-turbo) | 224 tokens de decoder | hi, en (salida hinglish) | Apache-2.0 | PyTorch/safetensors (no confirmado) | Modelo original del que deriva esta conversión |
| openai/whisper-large-v3-turbo | 809 M (dato público de OpenAI) | 448 tokens de decoder | multilingüe (~99 idiomas) | Apache-2.0 | safetensors, GGUF, Core ML | Base del fine-tune; no especializado en hinglish |
| Parakeet (NVIDIA) | no disponible | no disponible | inglés | no disponible | no disponible | Citado por el autor como modelo solo en inglés que falla con habla hindi |

## Limitaciones y advertencias

- Romaniza términos y números ingleses dentro del flujo hinglish ("Confidence par" por *Confluence*, "13 thousand" por *thirteen screens*), lo que degrada la fidelidad de nombres propios y cifras.
- Puede omitir frases completas en inglés; el autor recomienda emparejarlo con un reconocedor solo en inglés para tramos exclusivamente ingleses.
- Requiere alimentar fragmentos de audio de hasta ~25 segundos; ventanas más largas se truncan por el límite de 224 tokens del decoder.
- El modelo siempre opera en modo hindi (`language = "hi"`, `detectLanguage = false`); no se debe usar para detección automática de idioma.
- La primera carga del encoder en Neural Engine puede tardar una hora o más en M1 y tras actualizaciones de macOS; se recomienda ejecutarlo en GPU.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos con ruido, silencios largos o audio de baja calidad.
- No se dispone de información publicada sobre sesgos demográficos, acentos regionales concretos ni evaluación cuantitativa de WER.
- Licencia Apache-2.0 permite uso comercial, pero el crédito del modelo corresponde a Oriserve (fine-tune) y OpenAI (Whisper); este repositorio solo cambia el formato.
- Solo funciona en el ecosistema Apple (Core ML/WhisperKit); no es portable a otras plataformas sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jatsharma/whisper-hinglish-apex-coreml
- Modelo base: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Perfil del autor del fine-tune: https://huggingface.co/Oriserve
- Whisper large-v3-turbo (OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
