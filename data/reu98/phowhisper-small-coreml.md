# reu98/phowhisper-small-coreml

## Resumen

PhoWhisper-small-coreml es una conversión a Core ML del modelo PhoWhisper-small de VinAI Research, empaquetada para su uso con WhisperKit en iOS. El modelo original es un ajuste fino de Whisper-small sobre datos de voz en vietnamita, y esta versión mantiene los pesos sin modificar salvo por la conversión de formato, realizada con las herramientas oficiales de Argmax (whisperkittools). El objetivo es permitir el reconocimiento automático de voz en vietnamita directamente en dispositivos Apple, sin necesidad de infraestructura de servidor.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para una plataforma concreta (iOS, vía WhisperKit), no de un modelo nuevo. El autor es reu98, un contribuidor independiente, y el repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que es una publicación reciente y sin tracción comunitaria. La licencia BSD-3-Clause heredada del modelo base permite uso comercial con atribución.

Arquitectónicamente es un transformer encoder-decoder tipo Whisper-small (unos 244 millones de parámetros en el modelo original), con contexto de audio de 30 segundos por ventana y vocabulario multilingüe de Whisper. Esta versión está especializada en vietnamita y no está pensada para otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small), convertido a Core ML |
| Parametros totales | no disponible en la informacion proporcionada (Whisper-small original: ~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | Core ML (.mlmodelc / paquetes WhisperKit); repo de 0,5 GB |

## Arquitectura y entrenamiento

El modelo subyacente, PhoWhisper-small, es un ajuste fino de Whisper-small de OpenAI sobre corpus de voz en vietnamita, publicado por VinAI Research y presentado en el paper "PhoWhisper: Automatic Speech Recognition for Vietnamese" (ICLR 2024 Tiny Papers). Whisper emplea una arquitectura transformer encoder-decoder con atención completa, entrenada originalmente con supervisión débil sobre audio-web a gran escala; el ajuste fino de VinAI adapta el modelo al vietnamita.

Esta versión concreta no introduce entrenamiento adicional: según la model card, los pesos son idénticos a los del commit `a86b604` de vinai/PhoWhisper-small y solo se han convertido a Core ML con whisperkittools de Argmax. Los ficheros de configuración y tokenizador se copian del repositorio original. No hay información sobre el volumen de datos de ajuste fino, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático de voz (ASR) en vietnamita, con salida de transcripción de texto.
- Ejecución en dispositivo (on-device) en iOS mediante WhisperKit y Core ML, sin llamadas a servidor.
- Procesamiento por ventanas de audio de 30 segundos, con segmentación y marcas temporales propias del pipeline de Whisper.
- Soporte de decodificación con beam search y otras opciones expuestas por WhisperKit (no detalladas en la información disponible).
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada: el modelo está especializado en vietnamita; no se garantiza calidad en otros idiomas.

## Casos de uso

- Transcripción de voz en apps iOS nativas: integración con WhisperKit para dictado, notas de voz o subtitulado en tiempo real sin conexión, aprovechando la ejecución on-device y la privacidad que ello implica.
- Asistentes de voz para usuarios vietnamitas: conversión de comandos hablados a texto dentro de una app, con latencia baja al no depender de red.
- Accesibilidad: subtitulado automático de contenido audiovisual en vietnamita para personas con discapacidad auditiva, ejecutado localmente en el dispositivo.
- Procesamiento por lotes en macOS: uso del mismo artefacto Core ML en pipelines de transcripción de archivos de audio largos, segmentando por ventanas de 30 segundos.
- Aplicaciones de campo sin conectividad: grabación y transcripción de entrevistas o inspecciones en entornos sin cobertura, con posterior sincronización.
- Prototipado rápido de funciones de voz: validación de producto en iOS antes de invertir en infraestructura de inferencia en servidor, dado el reducido tamaño del artefacto (0,5 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, latencia ni throughput, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecución en dispositivo Apple (CPU/GPU/Neural Engine) vía Core ML.
- GPU recomendadas: no aplica en el sentido tradicional; requiere hardware Apple (iPhone, iPad, Mac con Apple Silicon).
- Cabe en dispositivos consumer: sí, en la gama de iPhone/iPad que soporta Core ML y WhisperKit; el repo ocupa 0,5 GB.
- Opciones de despliegue: WhisperKit (iOS/macOS) es la vía prevista; no se documentan opciones con vLLM, llama.cpp, Ollama o TGI, que no soportan este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| reu98/phowhisper-small-coreml | ~244 M (no confirmado en la ficha) | ventana de 30 s | vi | BSD-3-Clause | Core ML |
| vinai/PhoWhisper-small | ~244 M (no confirmado en la ficha) | ventana de 30 s | vi | BSD-3-Clause | safetensors/PyTorch |
| openai/whisper-small | ~244 M | ventana de 30 s | multilingüe | Apache-2.0 (según el modelo original) | PyTorch |

La diferencia principal frente a vinai/PhoWhisper-small es el formato (Core ML frente a PyTorch) y el ecosistema de despliegue (WhisperKit frente a transformers). Frente a whisper-small de OpenAI, la ventaja es la especialización en vietnamita; la desventaja, la pérdida de cobertura multilingüe. No hay datos de rendimiento comparativo en la información disponible.

## Limitaciones y advertencias

- Especializado únicamente en vietnamita; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación típico de Whisper en audio con ruido, silencios largos o habla no inteligible; conviene aplicar filtros de VAD y umbrales de confianza.
- Sesgos heredados del corpus de entrenamiento original de PhoWhisper (no documentados en esta ficha): posibles diferencias de precisión por dialecto, edad, género o acento.
- Artefacto de despliegue, no un modelo nuevo: no aporta mejoras de calidad sobre el modelo base.
- Repositorio sin tracción (0 descargas, 0 likes) y sin benchmarks publicados; fiabilidad en producción no verificada por la comunidad.
- Licencia BSD-3-Clause: permite uso comercial con atribución; debe conservarse el aviso de copyright y citarse el paper de PhoWhisper.
- Dependencia del ecosistema WhisperKit/Core ML; no es portable a servidores Linux con los stacks habituales sin reconvertir el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reu98/phowhisper-small-coreml
- Modelo base: https://huggingface.co/vinai/PhoWhisper-small
- Repositorio WhisperKit: https://github.com/argmaxinc/WhisperKit
- Herramientas de conversión whisperkittools: https://github.com/argmaxinc/whisperkittools
- Paper de PhoWhisper: Le, T.-T., Nguyen, L. T., Nguyen, D. Q. "PhoWhisper: Automatic Speech Recognition for Vietnamese". ICLR 2024 Tiny Papers.
