# Phoonnx/glowtts-en_us-cmu_bdl-gruut

## Resumen

Glow-TTS en inglés estadounidense empaquetado en formato ONNX para la librería phoonnx. Se trata de un modelo de síntesis de voz (text-to-speech) originalmente desarrollado por Rhasspy como parte del proyecto Larynx v1.0, concretamente la variante `en-us_cmu_bdl-glow_tts` correspondiente a la voz `cmu_bdl` (una voz sintética de la Universidad Carnegie Mellon). El modelo ha sido reconvertido y empaquetado por Phoonnx para su uso con su librería de TTS basada en ONNX, lo que permite su despliegue en Python y en el asistente OVOS.

El modelo sigue la arquitectura Glow-TTS, un modelo de síntesis neuronal basado en normalizing flows que genera espectrogramas mel a partir de fonemas IPA, que posteriormente son convertidos a audio por un vocoder separado (en este caso, HiFi-GAN multi-VCTK small). No se trata de un modelo de lenguaje ni de un transformer generativo de texto: es un componente especializado de un pipeline TTS, con un tamaño de repositorio de 0,1 GB, lo que refleja su naturaleza ligera y su orientación a inferencia en entornos con recursos limitados.

Su relevancia actual radica en que ofrece una alternativa ONNX de bajo coste para síntesis de voz en inglés americano dentro del ecosistema OVOS/Mycroft, con entrada de fonemas gestionada por gruut y un vocoder empaquetado automáticamente. Es un modelo de nicho, con pocas descargas (20) y sin licencia claramente registrada, pensado para desarrolladores que ya trabajan con phoonnx o con asistentes de voz open source.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) + vocoder HiFi-GAN multi-VCTK small |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible (formato ONNX empaquetado; no se documentan variantes) |
| Idiomas soportados | en-US |
| Licencia | other (no se registra licencia concreta; consultar upstream) |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que modela directamente la distribución de espectrogramas mel condicionada a una secuencia de fonemas. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS permite generación paralela y un alineamiento monotónico entre fonemas y frames de audio, lo que se traduce en una inferencia más rápida y estable. La entrada de texto se convierte a fonemas IPA mediante el fonemizador gruut, integrado a través de la librería scriptconv de phoonnx.

El modelo original procede de la release v1.0 de Larynx de Rhasspy, un proyecto de TTS offline orientado a asistentes de voz. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS). El vocoder asociado es HiFi-GAN multi-VCTK small, que phoonnx descarga automáticamente junto con la voz. No se documentan innovaciones técnicas adicionales más allá de las propias de Glow-TTS y del empaquetado ONNX.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense (en-US) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante gruut (`GruutPhonemizer` de scriptconv).
- Generación de espectrogramas mel que se convierten a audio mediante el vocoder HiFi-GAN multi-VCTK small.
- Integración con la librería phoonnx en Python (`TTSModelManager`, `voice.synthesize_wav`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al inglés americano.

## Casos de uso

- Asistentes de voz offline en OVOS/Mycroft: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en inglés americano sin depender de servicios en la nube, gracias a su formato ONNX y su tamaño reducido (0,1 GB).
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio WAV a partir de texto en scripts y servicios, con descarga automática del vocoder asociado.
- Lectura de textos y notificaciones en inglés: adecuado para convertir cadenas cortas o párrafos en audio para interfaces de accesibilidad o avisos del sistema, dado su bajo coste computacional.
- Prototipado de pipelines TTS: sirve como componente de referencia para comparar arquitecturas Glow-TTS frente a otros modelos TTS dentro del ecosistema phoonnx, al estar empaquetado de forma estandarizada.
- Integración en dispositivos de borde: su reducido tamaño y el uso de ONNX permiten desplegarlo en entornos con recursos limitados donde no cabe un modelo TTS de mayor tamaño.
- Generación de audio para pruebas automatizadas: útil en tests de integración de asistentes de voz que necesitan una salida de audio determinista y local sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere requisitos muy bajos, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; por el tamaño del modelo, es probable que funcione en CPU, pero no se confirma en la información proporcionada.
- ¿Cabe en GPU consumer? No disponible de forma explícita; el tamaño del artefacto (0,1 GB) es compatible con cualquier GPU consumer moderna, pero no se documenta.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; el formato es ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / tamaño |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_bdl-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (no registrada) | 0,1 GB repo |
| Otras voces Glow-TTS de la colección Phoonnx | Glow-TTS + HiFi-GAN | según voz | ONNX | según modelo | variable |
| Modelos TTS de Rhasspy Larynx v1.0 (upstream) | Glow-TTS | varios | tar.gz (formato original) | según release upstream | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia figura como "other" y la model card indica explícitamente que no se registra licencia para este modelo; es imprescindible consultar la release upstream de Rhasspy Larynx v1.0 antes de cualquier uso, especialmente comercial.
- Solo soporta inglés americano (en-US); no es multilingüe.
- Es un modelo TTS, no un modelo de lenguaje: no realiza razonamiento, generación de código, tool calling ni tareas de agente.
- No se documentan sesgos específicos, pero al derivar de una voz sintética concreta (cmu_bdl) y de un dataset no especificado, puede presentar limitaciones de naturalidad y cobertura fonética.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir pronunciaciones incorrectas ante texto no normalizado o fuera del dominio de entrenamiento.
- El modelo depende de un vocoder externo (HiFi-GAN multi-VCTK small) que phoonnx descarga automáticamente; su disponibilidad y versión deben verificarse en producción.
- No se documentan cuantizaciones alternativas ni requisitos de hardware, lo que dificulta planificar el despliegue sin pruebas empíricas.
- El número de descargas (20) y la ausencia de likes sugieren poca validación comunitaria; conviene evaluar la calidad de audio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_bdl-gruut
- Upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_bdl-glow_tts.tar.gz
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
