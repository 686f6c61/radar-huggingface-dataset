# Phoonnx/vits-de_DE-thorsten-medium

## Resumen

`vits-de_DE-thorsten-medium` es un modelo de síntesis de voz (text-to-speech) en alemán publicado por el usuario Phoonnx en Hugging Face. Se trata de una conversión al formato ONNX del modelo Piper `de_DE-thorsten-medium`, distribuida a través del proyecto `Phoonnx/phoonnx-vits` y pensada para su uso con la librería `phoonnx`, una implementación centrada en inferencia TTS ligera sobre ONNX Runtime. La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que genera waveform directamente desde fonemas.

El modelo procede del ecosistema Piper (originalmente `rhasspy/piper-voices`), un conjunto de voces TTS de alta calidad y bajo coste computacional diseñadas para ejecutarse en CPU y dispositivos de bajos recursos. La variante "medium" de Piper se sitúa en un compromiso entre calidad y velocidad, con un tamaño de repositorio de aproximadamente 0,1 GB, lo que lo hace apto para despliegues embebidos, asistentes locales y aplicaciones de accesibilidad sin GPU dedicada.

Su relevancia actual radica en la demanda de TTS local, privado y de baja latencia para asistentes de voz, sistemas de lectura y pipelines de accesibilidad en alemán. La licencia MIT facilita su integración comercial, aunque el modelo card no documenta métricas de calidad, idiomas adicionales ni detalles de entrenamiento más allá de la procedencia Piper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variante Piper "medium") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | alemán (`de_DE`), según el identificador del modelo |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end que combina un encoder de texto basado en Transformer, un predictor de duración, un prior normalizing flow, un decoder generativo y discriminadores adversariales durante el entrenamiento. El modelo mapea fonemas (típicamente generados por espeak-ng en el ecosistema Piper) a waveform directamente, sin necesidad de vocoder separado. La variante "medium" de Piper reduce el tamaño de las capas respecto a "high", priorizando velocidad de inferencia en CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente en TTS). El modelo card únicamente indica que es un espejo del modelo Piper original `de_DE-thorsten-medium` de `rhasspy/piper-voices`, por lo que los detalles de entrenamiento deben consultarse en la documentación de Piper. La innovación técnica principal es la exportación a ONNX para inferencia portable con `phoonnx`.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán a partir de texto de entrada.
- Generación de audio end-to-end sin vocoder separado (arquitectura VITS).
- Conversión de texto a fonemas mediante espeak (según el ecosistema Piper).
- Inferencia sobre ONNX Runtime, apta para CPU y despliegues ligeros.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un LLM).
- No dispone de modo "thinking", visión ni audio de entrada.
- Capacidades multilingües limitadas al alemán (`de_DE`); no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz locales en alemán: el modelo permite sintetizar respuestas en tiempo real en CPU, sin enviar texto a servicios en la nube, lo que preserva la privacidad del usuario.
- Lectura de pantalla y accesibilidad: integración en lectores de pantalla o aplicaciones de accesibilidad para usuarios germanoparlantes, con latencia baja gracias al tamaño reducido (~0,1 GB).
- Sistemas de megafonía y anuncios automatizados: generación de avisos pregrabados o dinámicos en estaciones, aeropuertos o comercios sin depender de conectividad.
- Integración en asistentes domésticos (Home Assistant, Rhasspy): Piper es el motor TTS de referencia en estos ecosistemas, y esta variante ONNX encaja en despliegues domésticos sobre Raspberry Pi o mini-PC.
- Audioguías y contenido educativo: generación de narraciones en alemán para cursos, podcasts sintéticos o materiales formativos.
- Pruebas y prototipado de pipelines TTS: al estar en ONNX y con licencia MIT, sirve como base para experimentar con `phoonnx` y comparar con otras voces Piper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está pensado para CPU. En GPU, el consumo sería mínimo (por debajo de 1 GB) dado el tamaño del repositorio (~0,1 GB).
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero es sobredimensionada para esta tarea.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer, e incluso en CPU y dispositivos embebidos (Raspberry Pi, mini-PC).
- Opciones de despliegue: `phoonnx` (librería nativa del modelo), ONNX Runtime; potencialmente integrable en ecosistemas Piper/Rhasspy. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-de_DE-thorsten-medium | VITS (Piper medium) | Alemán | no aplica | MIT | ONNX | Hugging Face |
| rhasspy/piper-voices (de_DE-thorsten-medium) | VITS (Piper medium) | Alemán | no aplica | MIT | ONNX | Hugging Face |
| Piper voces "high" (p. ej. de_DE-thorsten-high) | VITS (Piper high) | Alemán | no aplica | MIT | ONNX | Hugging Face |
| Coqui TTS (modelos alemanes) | VITS / Tacotron | Alemán | no aplica | Varía (MPL-2.0 en Coqui TTS) | PyTorch | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no procesa lenguaje natural ni mantiene conversaciones; no debe confundirse con un LLM.
- Idioma limitado al alemán (`de_DE`); no se documentan otras lenguas.
- No se han publicado métricas de calidad (MOS, WER de fonemas) en la información disponible.
- Riesgo de pronunciación incorrecta en nombres propios, siglas o palabras extranjeras, habitual en sistemas basados en espeak.
- No se documentan sesgos específicos; al ser un modelo de voz, puede reflejar características del hablante o corpus de entrenamiento original de Piper.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la procedencia y condiciones del modelo Piper original (`rhasspy/piper-voices`).
- El modelo card no documenta parámetros, cuantizaciones ni detalles de entrenamiento; para producción conviene consultar la documentación de Piper y `phoonnx`.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_DE-thorsten-medium
- Repositorio de voces Phoonnx: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Voces Piper originales: https://huggingface.co/rhasspy/piper-voices
