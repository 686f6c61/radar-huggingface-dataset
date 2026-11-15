# Phoonnx/glowtts-de_de-hokuspokus

## Resumen

`glowtts-de_de-hokuspokus` es un modelo de síntesis de voz (text-to-speech) en alemán, empaquetado en formato ONNX para la librería phoonnx. El modelo original procede de Rhasspy, concretamente del release v1.0 del proyecto Larynx, y ha sido convertido y publicado por Phoonnx para su uso dentro del ecosistema OVOS (Open Voice OS). Se trata de un modelo Glow-TTS, una arquitectura de síntesis acústica basada en normalizing flows que genera espectrogramas de mel a partir de fonemas, que posteriormente son convertidos a audio por un vocoder HiFi-GAN (en este caso, `hifigan-multi-vctk-small`).

La relevancia de este modelo reside en su naturaleza ligera y su empaquetado para inferencia en producción: el repositorio ocupa solo 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados o para asistentes de voz embebidos. El modelo no incluye el vocoder en el propio repositorio, sino que phoonnx lo descarga automáticamente al cargar la voz.

El modelo acepta texto en alemán (`de-DE`) y lo convierte a fonemas IPA mediante el fonemizador gruut, integrado a través de la librería scriptconv. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (síntesis acústica basada en normalizing flows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de tokens) |
| Tipos de cuantizacion | no disponible (formato ONNX; cuantización no especificada) |
| Idiomas soportados | Alemán (`de-DE`) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small (descargado por phoonnx) |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es una arquitectura de síntesis de voz que combina un encoder transformer con un decoder basado en normalizing flows (Glow). El modelo aprende una alineación monotónica entre fonemas y frames de espectrograma sin necesidad de un aligner externo, gracias a una búsqueda de alineación dinámica durante el entrenamiento. La salida es un espectrograma de mel que se convierte en audio mediante un vocoder HiFi-GAN independiente.

En este caso, el modelo fue entrenado originalmente por Rhasspy como parte del proyecto Larynx v1.0. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a TTS). La innovación técnica destacable es el empaquetado en ONNX para inferencia eficiente y la integración con el front-end de texto de phoonnx/scriptconv, que normaliza el texto y lo convierte a fonemas IPA mediante gruut.

## Capacidades

- Síntesis de voz en alemán (`de-DE`) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut (integrado en scriptconv).
- Generación de espectrogramas de mel que se convierten a audio con el vocoder HiFi-GAN.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programático en Python a través de `TTSModelManager` de phoonnx.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al alemán.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite sintetizar respuestas en alemán en asistentes domésticos con recursos limitados, gracias a su tamaño reducido (0,1 GB) y formato ONNX.
- Síntesis de voz en aplicaciones de escritorio o móviles: al ser un modelo ONNX ligero, puede ejecutarse en CPU sin GPU dedicada, adecuado para aplicaciones que necesitan TTS offline en alemán.
- Generación de audiolibros o contenido narrado en alemán: el modelo puede sintetizar frases completas a partir de texto, aunque la calidad y naturalidad dependerán del vocoder y del front-end de fonemas.
- Sistemas de accesibilidad: lectura de texto en pantalla para usuarios germanoparlantes con discapacidad visual, integrado en pipelines de TTS locales.
- Prototipado rápido de interfaces de voz: desarrolladores que necesitan un TTS en alemán para pruebas de concepto pueden cargar el modelo con phoonnx en pocas líneas de código.
- Investigación en síntesis de voz: el modelo sirve como baseline ligero para experimentos con Glow-TTS y vocoders HiFi-GAN en alemán, así como para comparar front-ends de fonemización (gruut vs. otros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (modelo ONNX de 0,1 GB; probablemente ejecutable en CPU).
- GPU recomendadas: no disponible; por el tamaño del modelo, no requiere GPU dedicada.
- ¿Cabe en consumer GPU? Sí, con toda probabilidad, e incluso en CPU sin GPU.
- Opciones de despliegue: phoonnx (Python), plugin OVOS (`ovos-tts-plugin-phoonnx`), inferencia ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Tamaño | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-de_de-hokuspokus | Glow-TTS + HiFi-GAN | Alemán (de-DE) | ONNX | other (sin registrar) | 0,1 GB | Hugging Face (Phoonnx) |
| Otros modelos Glow-TTS de Phoonnx | Glow-TTS | Varios (según colección) | ONNX | other | Variable | Colección Glow-TTS en Hugging Face |
| Modelos Larynx originales (Rhasspy) | Glow-TTS | Varios | Tar.gz (original) | Según upstream | Variable | GitHub Rhasspy/Larynx |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explícitamente que no hay licencia registrada y recomienda consultar el release upstream antes de usarlo. Esto supone un riesgo para uso comercial.
- Idioma limitado: solo alemán (`de-DE`); no soporta otros idiomas.
- Dependencia del vocoder externo: el modelo no incluye el vocoder en el repositorio; phoonnx lo descarga por separado (`hifigan-multi-vctk-small`), lo que añade una dependencia de red en el primer uso.
- Dependencia del front-end de fonemas: requiere gruut y scriptconv para la conversión de texto a fonemas IPA; errores en la normalización pueden degradar la síntesis.
- Sin datos de benchmarks: no hay métricas publicadas de calidad (MOS, WER) en la información disponible.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí posibles artefactos o pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- Modelo antiguo (Rhasspy Larynx v1.0): puede haber modelos TTS más modernos con mejor naturalidad.
- Sesgos: no disponibles en la información proporcionada.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-de_de-hokuspokus](https://huggingface.co/Phoonnx/glowtts-de_de-hokuspokus)
- [Upstream original (Rhasspy Larynx v1.0)](https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_hokuspokus-glow_tts.tar.gz)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Vocoder hifigan-multi-vctk-small](https://huggingface.co/Phoonnx/hifigan-multi-vctk-small)
