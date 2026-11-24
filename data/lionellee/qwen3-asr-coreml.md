# lionellee/Qwen3-ASR-CoreML

## Resumen

Qwen3-ASR-CoreML es una conversión a CoreML del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, publicada por el usuario lionellee. Su objetivo es permitir la inferencia completa del pipeline ASR (encoder de audio más decoder de texto) sobre el Apple Neural Engine, sin necesidad de GPU, lo que la hace adecuada para aplicaciones en dispositivos Apple (macOS 15+ e iOS 18+). El paquete incluye tanto los artefactos compilados `.mlmodelc` como las fuentes `.mlpackage` en cuantización INT4 e INT8.

El modelo base es un ASR de aproximadamente 0,6 mil millones de parámetros con arquitectura encoder-decoder: un encoder de audio tipo Whisper de 18 capas (dimensión 896, 14 cabezas) y un decoder de texto de 28 capas (dimensión oculta 1024, 16 cabezas de atención con 8 cabezas KV). Soporta siete idiomas (inglés, chino, japonés, coreano, francés, alemán y español) y se distribuye bajo licencia Apache 2.0.

Su relevancia radica en que traslada un modelo ASR multilingüe de tamaño medio al ecosistema nativo de Apple mediante cuantización con paletas (INT8/INT4), reduciendo el consumo energético y habilitando transcripción local en tiempo real en dispositivos sin GPU dedicada. El repositorio ocupa 1,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (encoder de audio estilo Whisper + decoder de texto) |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-ASR-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | KV cache fija de 1024 tokens |
| Tipos de cuantizacion | INT8 con paletas (encoder, embedding, decoder); fuentes INT4 e INT8 con paletas para el encoder |
| Idiomas soportados | en, zh, ja, ko, fr, de, es |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (`.mlmodelc` compilado y `.mlpackage` fuente) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema del modelo base Qwen3-ASR-0.6B: un encoder de audio de 18 capas transformer con dimensión 896 y 14 cabezas de atención que transforma características mel en embeddings, y un decoder de texto autorregresivo de 28 capas con dimensión oculta 1024, 16 cabezas de atención y 8 cabezas KV (atención con consultas agrupadas). El decoder incorpora una caché KV de tamaño fijo de 1024 tokens gestionada mediante CoreML MLState. El pipeline completo se descompone en tres artefactos: `encoder.mlmodelc` (mel a embeddings), `embedding.mlmodelc` (lookup de embeddings de tokens) y `decoder.mlmodelc` (decoder con caché KV).

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de esta publicación es la conversión a CoreML con cuantización por paletas (INT8 en los tres componentes, INT4 e INT8 en las fuentes del encoder) para ejecución íntegra en el Apple Neural Engine, además de un modo híbrido que combina el encoder CoreML con un decoder MLX sobre GPU.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) multilingüe en siete idiomas: inglés, chino, japonés, coreano, francés, alemán y español.
- Inferencia completa sobre el Apple Neural Engine sin GPU (modo CoreML íntegro).
- Modo híbrido: encoder en CoreML y decoder en MLX sobre GPU.
- Procesamiento de características mel como entrada del encoder de audio.
- Decodificación autorregresiva con caché KV de 1024 tokens.
- Integración mediante la librería Swift `soniqo/speech-swift`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio más allá de ASR: no disponible.

## Casos de uso

- Transcripción local en aplicaciones iOS: integración del pipeline CoreML en apps para iOS 18+ que transcriban notas de voz o reuniones sin enviar audio a la nube, aprovechando la ejecución sobre Neural Engine y el bajo consumo energético.
- Dictado en macOS: uso del encoder y decoder CoreML en herramientas de escritorio para macOS 15+ que conviertan voz en texto en tiempo real, con la caché KV de 1024 tokens cubriendo segmentos de habla habituales.
- Subtitulado multilingüe en dispositivos Apple: generación de subtítulos en inglés, chino, japonés, coreano, francés, alemán o español en reproductores o apps de vídeo nativas, sin depender de servicios externos.
- Asistentes de voz offline: incorporación del modelo en asistentes embebidos que requieran privacidad total, ya que todo el procesamiento ocurre en el dispositivo mediante CoreML.
- Prototipado con modo híbrido: uso del encoder CoreML junto con el decoder MLX en GPU para experimentar con mayor flexibilidad en Macs con Apple Silicon durante el desarrollo.
- Investigación en eficiencia de ASR en edge: evaluación comparativa de cuantización INT4 frente a INT8 en el encoder para estudiar el equilibrio entre precisión y latencia en el Neural Engine.
- Accesibilidad: transcripción de voz a texto en tiempo real para personas con discapacidad auditiva en dispositivos Apple, con soporte de varios idiomas en una sola instalación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Ejecución completa en Apple Neural Engine; no requiere GPU dedicada.
- Requiere macOS 15+ o iOS 18+ para el modo CoreML íntegro.
- Tamaño del repositorio: 1,4 GB (incluye artefactos `.mlmodelc` y fuentes `.mlpackage` INT4 e INT8).
- Compatible con dispositivos Apple con Neural Engine (Apple Silicon en Mac; chips A-series y M-series en iPhone/iPad con iOS 18+).
- No aplicable a GPU NVIDIA (A100, H100, RTX 4090) en el modo CoreML; el modo híbrido usa MLX sobre GPU de Apple Silicon.
- Opciones de despliegue: CoreML nativo vía la librería Swift `soniqo/speech-swift`; modo híbrido CoreML + MLX.
- VRAM estimada para inferencia: no disponible (depende del dispositivo y de la cuantización; el paquete completo ocupa 1,4 GB en disco).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3-ASR-CoreML (esta ficha) | 0,6 mil millones | KV cache 1024 tokens | 7 (en, zh, ja, ko, fr, de, es) | Apache 2.0 | CoreML (Neural Engine) |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6 mil millones | no disponible | 7 (en, zh, ja, ko, fr, de, es) | Apache 2.0 | safetensors (PyTorch) |
| Whisper (variantes de OpenAI) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

No se dispone en la información proporcionada de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Modelo convertido por un tercero (lionellee), no por el equipo de Qwen; no hay garantías de paridad de precisión con el modelo base.
- La caché KV está fijada a 1024 tokens, lo que limita la longitud de las secuencias decodificadas por pasada.
- Solo cubre siete idiomas; otras lenguas no están soportadas.
- Requiere versiones mínimas de sistema (macOS 15+ / iOS 18+), lo que excluye dispositivos y sistemas más antiguos.
- No se han publicado benchmarks ni métricas de calidad (WER) en la información disponible; el riesgo de errores de transcripción no está cuantificado.
- La cuantización INT4/INT8 con paletas puede degradar la precisión respecto al modelo en precisión completa.
- Riesgo de alucinación en pasajes de audio con ruido o silencios, comportamiento no documentado en la información disponible.
- Sesgos lingüísticos y acústicos heredados del modelo base y de su dataset de entrenamiento, no detallados.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-ASR-0.6B antes de uso comercial en producción.

## Enlaces

- Hugging Face: https://huggingface.co/lionellee/Qwen3-ASR-CoreML
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Librería Swift: https://github.com/soniqo/speech-swift
- Guía: https://soniqo.audio/guides/transcribe
- Documentación: https://soniqo.audio
