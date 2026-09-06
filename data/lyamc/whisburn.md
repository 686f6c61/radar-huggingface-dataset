# lyamc/whisburn

## Resumen

whisburn es un workspace de procesamiento de voz en Rust construido sobre el framework Burn. El repositorio de HuggingFace `lyamc/whisburn` contiene los pesos preconvertidos para Burn 0.21 de tres modelos de reconocimiento automático de voz (ASR): Whisper tiny.en, Whisper medium.en y Parakeet TDT 0.6B v3. El objetivo es permitir la transcripción, traducción, diarización y síntesis de voz en Rust sin depender de frameworks de Python. La relevancia actual radica en ofrecer una alternativa nativa y eficiente para aplicaciones de ASR en Rust, aprovechando las capacidades de Burn para ejecutar modelos en múltiples backends (CPU, GPU, etc.). El repositorio pesa 12.6 GB y no contiene un modelo nuevo; son pesos convertidos de modelos existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) y Parakeet TDT (conformer/transformer) según el modelo fuente |
| Parametros totales | no disponible (depende del modelo fuente: tiny_en, medium_en o parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en formato MPK GZ sin cuantización especificada) |
| Idiomas soportados | inglés (inferido de los nombres de los modelos: tiny_en, medium_en; parakeet no especifica idioma en la información disponible) |
| Licencia | MIT (repo); modelos fuente: MIT (Whisper) y CC-BY-4.0 (Parakeet) |
| Formato de pesos | MPK GZ (formato Burn 0.21), no safetensors |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino pesos preconvertidos de modelos ASR existentes para el framework Burn 0.21. Los modelos incluidos son: Whisper tiny.en y Whisper medium.en, ambos arquitecturas encoder-decoder transformer de OpenAI; y Parakeet TDT 0.6B v3 de NVIDIA, que emplea una arquitectura basada en conformer con decodificación TDT (Token-and-Duration Transducer). Los pesos fueron convertidos con whisburn 0.2.0 usando `NamedMpkGzFileRecorder`. No se proporcionan datos sobre el dataset de entrenamiento ni sobre procesos de RLHF/DPO, ya que estos modelos son preentrenados por sus autores originales. La innovación técnica de whisburn reside en el soporte de ASR en Rust puro, con descarga y conversión automática de modelos, y soporte para múltiples backends de Burn.

## Capacidades

- Transcripción de audio (ASR) en inglés para los modelos Whisper .en y Parakeet.
- Traducción de audio a texto (capacidad de Whisper, aunque los modelos .en están limitados a inglés).
- Diarización de hablantes (según el repositorio GitHub, aunque no se detalla en la model card).
- Síntesis de voz (TTS) como parte del workspace, aunque los pesos incluidos son solo ASR.
- Ejecución en Rust mediante Burn, con soporte de backends CPU/GPU.
- Descarga y conversión automática de modelos desde la CLI.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones en una aplicación Rust nativa: el modelo puede transcribir archivos WAV mediante `cargo run -p whisburn-cli -- transcribe --input audio.wav --model tiny_en`, ideal para herramientas de notas de voz locales.
- Subtitulado automático de vídeos: integrar el modelo en un pipeline Rust para generar subtítulos en inglés a partir de pistas de audio, aprovechando el bajo overhead del ecosistema Burn.
- Asistente de voz offline: usar los pesos en un dispositivo embebido o servidor Rust para reconocimiento de voz sin depender de APIs cloud, gracias a la naturaleza nativa del framework.
- Investigación comparativa de ASR: ejecutar Whisper y Parakeet bajo el mismo framework Burn para comparar latencia y precisión en un entorno controlado, sin cambiar de librería.
- Herramientas de accesibilidad: transcribir audio en tiempo real para personas con discapacidad auditiva, desplegando el modelo en un servidor Rust con soporte de backends GPU.
- Pipelines de CI/CD para modelos de voz: automatizar la descarga y conversión de pesos de Whisper o Parakeet al formato Burn 0.21 mediante la CLI de whisburn, integrando el proceso en un flujo de trabajo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, latencia ni throughput. Tampoco se proporcionan comparativas con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. Dado que Burn soporta múltiples backends, se espera compatibilidad con GPUs NVIDIA (CUDA), AMD (ROCm) y CPU, pero no se especifica.
- Posibilidad de ejecución en GPU de consumo: no disponible.
- Opciones de despliegue: whisburn-cli (CLI de Rust), integración directa con Burn 0.21. No se mencionan vLLM, llama.cpp ni Ollama, ya que el formato MPK GZ es específico de Burn.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas directas en la información disponible. Como referencia, los modelos fuente son alternativas a otros ASR open source como whisper.cpp (formato GGUF) o los repos originales de OpenAI y NVIDIA en safetensors. La diferencia principal es el formato de pesos: whisburn usa MPK GZ para Burn, mientras que whisper.cpp usa GGUF y los repos originales usan safetensors. No hay datos de rendimiento que permitan comparar de forma objetiva.

## Limitaciones y advertencias

- Los modelos incluidos están limitados al idioma inglés (los nombres `tiny_en` y `medium_en` lo indican; Parakeet TDT 0.6B v3 es un modelo ASR, pero su idioma no se especifica en la información disponible).
- Riesgo de alucinación: no documentado en la información disponible; Whisper tiene antecedentes conocidos de alucinaciones en silencios o ruidos.
- El formato MPK GZ es específico de Burn 0.21 y no es compatible con otros frameworks como PyTorch, TensorFlow o llama.cpp.
- La licencia del repositorio es MIT, pero los pesos de Parakeet TDT 0.6B v3 están bajo CC-BY-4.0, lo que puede imponer condiciones de atribución para uso comercial.
- No se proporcionan benchmarks ni métricas de calidad, por lo que el rendimiento real debe evaluarse por el usuario.
- La versión de Burn (0.21) es específica; los archivos `.mpk` de versiones anteriores (0.16.1) no son compatibles, como se indica en la model card.
- No hay soporte documentado para cuantización, lo que puede limitar el despliegue en hardware con recursos limitados.

## Enlaces

- HuggingFace: https://huggingface.co/lyamc/whisburn
- GitHub: https://github.com/Lyamc/whisburn
- Modelos fuente:
  - https://huggingface.co/openai/whisper-tiny.en
  - https://huggingface.co/openai/whisper-medium.en
  - https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
