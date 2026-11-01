# Selbyggen/kb-whisper-small-coreml

## Resumen

KB-Whisper small – WhisperKit / Core ML es una conversión de formato del modelo de reconocimiento automático del habla (ASR) KBLab/kb-whisper-small, desarrollado por la Biblioteca Nacional de Suecia (Kungliga biblioteket). El autor de la conversión, Selbyggen, ha transformado los pesos originales a Core ML mediante la herramienta whisperkittools para que el modelo se ejecute sobre la Apple Neural Engine a través de WhisperKit. No se trata de un modelo nuevo: los pesos y el comportamiento son los de KBLab.

El modelo resuelve la transcripción de audio en sueco con ejecución local en dispositivos Apple (Mac, iPhone, iPad), sin necesidad de enviar audio a servidores externos. Es relevante para desarrolladores que quieran integrar ASR sueco en aplicaciones nativas de Apple con privacidad por diseño y latencia baja gracias a la aceleración por hardware neuronal.

La arquitectura subyacente es la de Whisper small (transformer encoder-decoder), convertida a float16 sin cuantización. El repositorio ocupa 0,5 GB y la conversión superó las pruebas integradas de encoder de audio y decoder de texto frente a la referencia en PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper small (transformer encoder-decoder), convertido a Core ML |
| Parámetros totales | no disponible (corresponde a Whisper small; cifra exacta no indicada en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no confirmado en la información) |
| Tipos de cuantización | float16, sin cuantización |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (whisperkit); config.json y generation_config.json copiados sin cambios del original |

## Arquitectura y entrenamiento

El modelo es una conversión directa de KBLab/kb-whisper-small, un fine-tuning de Whisper small sobre sueco realizado por la Biblioteca Nacional de Suecia. La arquitectura es la de Whisper: un encoder que procesa el espectrograma de audio y un decoder autorregresivo que genera tokens de texto, con atención multitarea. La conversión a Core ML se realizó con whisperkittools usando la revisión `main` (la «Stage 2» de KBLab) y precisión float16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La conversión preserva el tokenizador de openai/whisper-small y el decoder emite `alignment_heads_weights`, lo que habilita marcas de tiempo a nivel de palabra. Las pruebas integradas de la conversión (encoder de audio y decoder de texto frente a la referencia en PyTorch) se superaron correctamente.

## Capacidades

- Reconocimiento automático del habla en sueco con transcripción de audio a texto.
- Generación de marcas de tiempo a nivel de palabra gracias a `alignment_heads_weights`.
- Ejecución local en Apple Silicon mediante la Apple Neural Engine a través de WhisperKit.
- Integración en aplicaciones nativas de Mac, iPhone e iPad (usado por la app Says).
- Soporte de decodificación con selección de idioma explícita (`language: "sv"`).
- No se indica soporte de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción local en apps de notas de voz para iOS y macOS: el modelo se integra con WhisperKit y procesa grabaciones en el dispositivo, evitando enviar audio a la nube y cumpliendo requisitos de privacidad.
- Subtitulado automático de vídeo en sueco: las marcas de tiempo a nivel de palabra permiten generar subtítulos sincronizados en editores de vídeo nativos de Apple.
- Accesibilidad en aplicaciones: transcripción en tiempo real de conversaciones o conferencias para usuarios con discapacidad auditiva, aprovechando la latencia baja de la Neural Engine.
- Actas y resúmenes de reuniones: transcripción de audio de reuniones en sueco como primer paso de un pipeline que después alimenta un LLM para resumir.
- Archivística y bibliotecas: digitalización y búsqueda de material audiovisual en sueco, en línea con el origen del modelo en la Biblioteca Nacional de Suecia.
- Dictado por voz en aplicaciones de productividad: integración del decoder en apps de escritura para dictado en sueco sin conexión.
- Investigación en ASR sueco: evaluación y comparación de pipelines Core ML frente a implementaciones PyTorch en entornos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que las pruebas integradas de la conversión (encoder de audio y decoder de texto frente a la referencia en PyTorch) se superaron correctamente.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en Apple Silicon usando memoria unificada. El repositorio ocupa 0,5 GB en float16.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) con Neural Engine; también iPhone y iPad compatibles con WhisperKit.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon y dispositivos iOS/iPadOS compatibles.
- Opciones de despliegue: WhisperKit (librería Swift), con descarga del modelo desde Hugging Face mediante `WhisperKit.download`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Selbyggen/kb-whisper-small-coreml | no disponible (Whisper small) | no disponible | sv | Apache 2.0 | Core ML |
| KBLab/kb-whisper-small | no disponible (Whisper small) | no disponible | sv | Apache 2.0 | PyTorch (safetensors/bin) |
| openai/whisper-small | no disponible (Whisper small) | no disponible | multilingüe | Apache 2.0 | PyTorch |

La diferencia principal frente a KBLab/kb-whisper-small es el formato (Core ML frente a PyTorch) y el público objetivo (dispositivos Apple). Frente a openai/whisper-small, el modelo de KBLab está especializado en sueco, mientras que el original es multilingüe. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo; cualquier limitación del modelo original de KBLab se mantiene.
- Especializado únicamente en sueco; no se debe esperar buen rendimiento en otros idiomas.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios largos.
- No se dispone de información sobre sesgos específicos del fine-tuning sueco.
- Dependencia del ecosistema Apple: el formato Core ML limita su uso a dispositivos y frameworks compatibles con WhisperKit.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base KBLab/kb-whisper-small.
- No se han publicado benchmarks que permitan validar el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selbyggen/kb-whisper-small-coreml
- Modelo base: https://huggingface.co/KBLab/kb-whisper-small
- Repositorio de KBLab: https://huggingface.co/KBLab
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- App Says: https://sagtapp.com/sv/
