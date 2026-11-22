# codebucketsolutions/metricgan-plus-voicebank-onnx

## Resumen

MetricGAN+ VoiceBank-DEMAND ONNX es una exportación a formato ONNX del modelo de mejora de voz (supresión de ruido) `speechbrain/metricgan-plus-voicebank` desarrollado por el equipo de SpeechBrain. El autor de la exportación es `codebucketsolutions`, que lo publica como parte del servidor de voz `bolo` para poder ejecutar la inferencia sin depender de PyTorch. Los pesos son idénticos a los del modelo original; no se trata de un reentrenamiento ni de una versión oficial de SpeechBrain.

El modelo resuelve una tarea concreta de audio-a-audio: dado un audio ruidoso a 16 kHz, estima una máscara espectral que, aplicada sobre la magnitud del STFT, atenúa el ruido y reconstruye la señal limpiada. Es relevante para despliegues ligeros porque permite integrar la mejora de voz en entornos que solo disponen de ONNX Runtime, sin necesidad de instalar el stack completo de PyTorch ni de SpeechBrain.

La arquitectura es la del generador de MetricGAN+: una LSTM bidireccional seguida de dos capas lineales que predicen la máscara. El grafo exportado es de tipo float32, opset 17, y procesa la magnitud logarítmica del STFT como entrada. El modelo está entrenado sobre VoiceBank-DEMAND y la licencia es Apache-2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM bidireccional + 2 capas lineales (generador de MetricGAN+) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, procesa frames del STFT) |
| Tipos de cuantizacion | no disponible (el grafo publicado es float32) |
| Idiomas soportados | no disponible (modelo de mejora de voz, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, float32) |

## Arquitectura y entrenamiento

El modelo es el generador de MetricGAN+ exportado a ONNX. La entrada es un tensor float32 de forma `[1, frames, 257]` que contiene el log1p de la magnitud del STFT; la salida es una máscara float32 de la misma forma. El STFT se calcula fuera del grafo, siguiendo el esquema de `SpectralMaskEnhancement` de SpeechBrain: 16 kHz, 512 puntos, hop 256, ventana Hamming periódica y centrado con relleno de ceros. La característica de entrada es `log1p(sqrt(|X|^2 + 1e-14))`. La máscara multiplica la magnitud en escala logarítmica; después se aplica `expm1` al producto, se recombina con la fase ruidosa y se pasa por la STFT inversa. SpeechBrain normaliza además el resultado a un pico de 1, aunque la comprobación de paridad publicada no incluye ese paso.

El entrenamiento es el del modelo original de SpeechBrain sobre VoiceBank-DEMAND (Valentini et al., Universidad de Edimburgo, CC BY 4.0). No se ha reentrenado ni ajustado nada en la exportación: los pesos son los del checkpoint original, revisión `a196ce26b3bdace6fa1d819017584bdbcce462a8`. La innovación de MetricGAN+ respecto a MetricGAN es el uso de un discriminador que estima métricas perceptuales (PESQ) durante el entrenamiento para guiar al generador, pero ese componente no forma parte del grafo exportado. El autor publica una comprobación de paridad frente a SpeechBrain 1.1.2 con torch 2.15.0+cpu y ONNX Runtime 1.32.0, con diferencias absolutas máximas del orden de 1e-7 y SI-SNR entre 128 y 133 dB en varias condiciones de entrada.

## Capacidades

- Mejora de voz y supresión de ruido en audio mono a 16 kHz.
- Procesamiento de audio-a-audio con máscara espectral sobre la magnitud del STFT.
- Independiente del idioma en la práctica: al operar sobre características espectrales, no depende de un vocabulario ni de un tokenizador.
- Ejecución sin PyTorch mediante ONNX Runtime.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión ni audio generativo.
- No es un modelo de reconocimiento de voz ni de traducción: solo devuelve audio mejorado.

## Casos de uso

- Preprocesado para ASR en producción: aplicar el modelo antes de un sistema de reconocimiento de voz para reducir ruido de fondo en grabaciones de llamadas o reuniones; al ser ONNX, se puede encadenar con el motor ASR en el mismo servicio sin cargar PyTorch.
- Limpieza de audio en aplicaciones de videollamada: integrado en el pipeline de captura del cliente o del servidor para atenuar ruido estacionario y de fondo antes de la codificación.
- Preparación de datasets de voz: filtrar ruido en corpus de audio recogidos en entornos reales antes de usarlos para entrenar otros modelos.
- Servidores de voz ligeros: el propio caso de `bolo`, que lo usa como componente de mejora en un servidor sin dependencia de PyTorch; útil en contenedores pequeños o entornos con restricciones de dependencias.
- Postproducción de pódcasts y grabaciones: mejora de pistas de voz grabadas con micrófonos modestos antes de la mezcla final.
- Sistemas embebidos y edge: al ser un grafo ONNX de tamaño reducido (el repo ocupa 0.0 GB según Hugging Face, es decir, por debajo del umbral de redondeo), puede desplegarse en dispositivos con ONNX Runtime y recursos limitados.
- Transcripción de reuniones y notas de voz: preprocesado previo a la transcripción para mejorar la inteligibilidad en entornos con ruido de oficina.

## Benchmarks y rendimiento

El autor no publica benchmarks de calidad de mejora en la información disponible. La model card cita los resultados del modelo original de SpeechBrain sobre el conjunto de test de VoiceBank-DEMAND: PESQ 3.15 y STOI 93.0. No se aportan métricas propias de la versión ONNX más allá de la paridad numérica con PyTorch.

| Metrica | Valor | Fuente |
|---|---|---|
| PESQ (VoiceBank-DEMAND test) | 3.15 | Model card (modelo original SpeechBrain) |
| STOI (VoiceBank-DEMAND test) | 93.0 | Model card (modelo original SpeechBrain) |
| Diferencia absoluta maxima ONNX vs PyTorch | 1.49e-07 | parity.json (entrada en-long) |
| SI-SNR ONNX vs PyTorch | 128.0-133.1 dB | parity.json (seis condiciones) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un modelo de audio pequeño con LSTM y dos capas lineales, la huella es reducida y cabe en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) puede ejecutarlo, aunque el modelo está pensado para CPU.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño reducido del grafo.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración en el servidor `bolo`; no se documentan otros runtimes.
- Latencia y throughput: no disponibles. La comprobación de paridad se hizo en CPU con ONNX Runtime 1.32.0, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| metricgan-plus-voicebank-onnx (este) | no disponible | no aplica | Mejora de voz | Apache-2.0 | ONNX |
| speechbrain/metricgan-plus-voicebank | no disponible | no aplica | Mejora de voz | Apache-2.0 | PyTorch (SpeechBrain) |
| MetricGAN (original) | no disponible | no aplica | Mejora de voz | no disponible en esta ficha | PyTorch |
| Demucs / separación de fuentes | no disponible | no aplica | Separación de fuentes | no disponible en esta ficha | PyTorch |

La comparación directa más relevante es con el modelo base de SpeechBrain: misma arquitectura, mismos pesos y misma licencia, con la diferencia de que este está exportado a ONNX y no requiere PyTorch. Frente a otros modelos de mejora de voz, no se dispone de datos comparativos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Es una exportación no oficial: el autor indica explícitamente que no es un release de SpeechBrain.
- Los pesos no se han modificado, pero cualquier cambio en el pipeline de STFT (tamaño de ventana, hop, normalización) altera el resultado; hay que replicar exactamente el preprocesado descrito.
- El modelo está entrenado sobre VoiceBank-DEMAND, un corpus en inglés con condiciones de ruido concretas; su comportamiento en otros idiomas o tipos de ruido no está documentado.
- No se publican métricas de calidad propias de la versión ONNX; los valores PESQ y STOI citados son los del modelo original.
- La normalización a pico 1 de SpeechBrain no está incluida en la comprobación de paridad, por lo que la salida del grafo puede diferir en escala si no se aplica ese paso externamente.
- Riesgo de artefactos y sobre-suavizado en señales muy degradadas, habitual en modelos de máscara espectral; no cuantificado en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero debe citarse SpeechBrain y el paper del modelo original según indica su model card.
- El repositorio no tiene descargas ni likes y fue creado en 2026-11-21, por lo que no hay evidencia de uso en producción más allá del servidor `bolo`.
- El campo `inference: false` aparece en los metadatos de la model card, lo que puede afectar a la carga automática desde Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/metricgan-plus-voicebank-onnx
- Modelo base: https://huggingface.co/speechbrain/metricgan-plus-voicebank
- Repositorio del servidor bolo: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- Dataset VoiceBank-DEMAND (Valentini et al., Universidad de Edimburgo): no disponible como enlace directo en la información proporcionada.
