# Phoonnx/glowtts-en_us-scottish_male-gruut

## Resumen

Glow-TTS en_us_scottish_male_gruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado por Phoonnx para su uso con la librería ONNX homónima. El modelo genera espectrogramas mel a partir de fonemas gruut en alfabeto IPA y depende de un vocoder externo, en este caso hifigan-multi-vctk-small, para convertir dichos espectrogramas en audio.

La relevancia de este modelo radica en su carácter ligero y su formato ONNX, que facilita el despliegue en entornos con recursos limitados y en asistentes de voz locales como OVOS (Open Voice OS), donde se integra mediante el plugin ovos-tts-plugin-phoonnx. No obstante, se trata de un modelo de nicho, con muy pocas descargas (22) y sin métricas de rendimiento publicadas, orientado a una voz masculina con acento escocés del inglés estadounidense.

El repositorio ocupa 0,1 GB y no incluye información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento. La licencia figura como "other" y el autor advierte explícitamente de que no hay licencia registrada, por lo que debe verificarse la licencia del lanzamiento original antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (generador de espectrogramas) + vocoder HiFi-GAN (hifigan-multi-vctk-small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense, voz masculina con acento escocés) |
| Licencia | other (sin licencia registrada; consultar el lanzamiento original de Rhasspy) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Glow-TTS, un modelo de síntesis de voz no autorregresivo que combina flujos normalizadores con alineamiento monotónico para generar espectrogramas mel a partir de secuencias de fonemas. La generación de audio se completa con un vocoder HiFi-GAN (hifigan-multi-vctk-small), que transforma el espectrograma en forma de onda. El modelo original procede del proyecto Larynx de Rhasspy y se distribuye empaquetado en ONNX para su ejecución con la librería phoonnx.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. El front-end de texto delega en scriptconv, que normaliza el texto y lo convierte a fonemas mediante GruutPhonemizer (extra scriptconv[gruut]). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con una voz masculina de acento escocés.
- Generación de espectrogramas mel mediante Glow-TTS y conversión a audio con el vocoder HiFi-GAN.
- Procesamiento de texto mediante fonemización con gruut en alfabeto IPA.
- Integración con el ecosistema OVOS a través del plugin ovos-tts-plugin-phoonnx.
- Ejecución en formato ONNX, apta para despliegues ligeros.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio de entrada) ni de modo de razonamiento (thinking mode).
- Capacidad multilingüe limitada exclusivamente al inglés estadounidense.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS mediante el plugin ovos-tts-plugin-phoonnx y permite dotar de voz a asistentes domésticos que se ejecutan en local, sin depender de servicios en la nube, gracias a su formato ONNX y su reducido tamaño de repositorio (0,1 GB).
- Síntesis de voz para aplicaciones de escritorio: con la librería phoonnx en Python, se puede generar audio WAV a partir de texto mediante la API TTSModelManager, adecuado para lectores de pantalla o herramientas de accesibilidad.
- Prototipado de interfaces conversacionales: al ser un modelo ligero, permite iterar rápidamente en el desarrollo de prototipos de voz para aplicaciones de domótica o IoT sin requerir hardware dedicado.
- Generación de avisos y notificaciones habladas: útil en sistemas embebidos que necesitan anunciar eventos (por ejemplo, en Raspberry Pi) con una voz concreta de acento escocés.
- Pruebas de integración de pipelines TTS: sirve como componente de referencia para validar la cadena scriptconv (normalización y fonemización) más Glow-TTS más HiFi-GAN en entornos de investigación.
- Personalización de voces en proyectos de código abierto: al estar empaquetado para phoonnx, puede combinarse con otros modelos de la colección Glow-TTS para ofrecer distintas voces dentro de una misma aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo muy ligero, pero no se especifica el consumo de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio es plausible que funcione en CPU, pero no se confirma en la documentación.
- Opciones de despliegue: librería phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS; ejecución en formato ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-scottish_male-gruut | Glow-TTS + HiFi-GAN | en-US (acento escocés) | no disponible | other (sin licencia registrada) | Hugging Face, ONNX |
| Otros modelos de la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | en (distintas voces) | no disponible | other | Hugging Face, ONNX |
| Modelos TTS de Rhasspy Larynx (originales) | Glow-TTS + vocoder | en (distintas voces) | no disponible | según lanzamiento original | GitHub releases |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparativa se limita a aspectos de arquitectura, idioma, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una voz sintética con acento escocés concreto, puede no representar adecuadamente otras variantes del inglés.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la síntesis puede producir artefactos o pronunciaciones incorrectas en textos fuera del dominio de entrenamiento.
- Limitaciones de contexto o idioma: el modelo solo admite inglés estadounidense y requiere entrada fonemizada con gruut en alfabeto IPA; no se especifica la longitud máxima de texto procesable.
- Restricciones de licencia: la licencia figura como "other" y el autor indica que no hay licencia registrada para este modelo; es imprescindible verificar la licencia del lanzamiento original de Rhasspy antes de un uso comercial.
- Caveats para producción: no se han publicado benchmarks ni métricas de latencia o calidad; el número de descargas es muy bajo (22) y no hay likes, lo que sugiere poca validación por parte de la comunidad. La dependencia de un vocoder externo añade un componente adicional a gestionar en el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-scottish_male-gruut
- Lanzamiento original de Rhasspy (Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_scottish_english_male-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
