# Phoonnx/glowtts-de_de-eva_k-gruut

## Resumen

glowtts-de_de-eva_k-gruut es un modelo de síntesis de voz (text-to-speech) en alemán empaquetado en formato ONNX por Phoonnx para su biblioteca de inferencia `phoonnx`. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx, publicado en su release v1.0 como `de-de_eva_k-glow_tts.tar.gz`. Phoonnx lo redistribuye como un paquete listo para usar con su librería Python y con el ecosistema OVOS (Open Voice OS).

La arquitectura subyacente es Glow-TTS, un modelo de síntesis no autorregresivo basado en normalizing flows que genera espectrogramas mel a partir de fonemas, combinado con un vocoder HiFi-GAN (`hifigan-multi-vctk-small`) que convierte el espectrograma en audio. El modelo está especializado en la variante `de-DE` y toma como entrada fonemas gruut en alfabeto IPA, no texto en bruto: la normalización y fonemización la realiza `scriptconv` con el fonemizador `GruutPhonemizer`.

Su relevancia es práctica: ofrece una voz alemana femenina (identificada como `eva_k`) de código abierto, ligera (el repositorio ocupa 0,1 GB) y ejecutable en CPU mediante ONNX Runtime, lo que la hace adecuada para asistentes de voz locales, sistemas embebidos y despliegues sin GPU. El número de descargas registrado es bajo (19) y la licencia figura como "other" sin especificarse, lo que exige verificar los términos upstream antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flows) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (`de-DE`) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz no autorregresivo que emplea normalizing flows para modelar la distribución del espectrograma mel condicionada a la secuencia de fonemas. A diferencia de los modelos autorregresivos tipo Tacotron, permite alineamiento monotónico mediante atención y decodificación en paralelo, lo que reduce la latencia de inferencia. El modelo produce un espectrograma mel que posteriormente se convierte en forma de onda mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`, también distribuido por Phoonnx.

El modelo procede del proyecto Larynx de Rhasspy (release v1.0), orientado a síntesis de voz local y de bajo consumo. La entrada no es texto plano: requiere fonemas gruut en alfabeto IPA, obtenidos mediante `scriptconv` con el fonemizador `GruutPhonemizer`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning posteriores. La innovación técnica principal es la propia arquitectura Glow-TTS combinada con el empaquetado ONNX para inferencia portable.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán `de-DE` a partir de fonemas gruut en alfabeto IPA.
- Generación de espectrogramas mel mediante Glow-TTS y conversión a audio con vocoder HiFi-GAN.
- Voz femenina concreta identificada como `eva_k`.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración con la librería `phoonnx` (Python) y con el plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Normalización y conversión de texto a fonemas delegada a `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-step ni visión: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al alemán; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra mediante `ovos-tts-plugin-phoonnx` configurando la voz `larynx/de-de-eva_k-glow_tts` en `mycroft.conf`, permitiendo respuestas habladas en alemán sin depender de servicios en la nube.
- Sistemas embebidos y dispositivos de bajo consumo: al ejecutarse en ONNX Runtime sobre CPU y ocupar 0,1 GB, es viable en Raspberry Pi y hardware similar para interfaces de voz offline.
- Lectura de textos y accesibilidad: conversión de documentos o notificaciones a audio en alemán para aplicaciones de lectura en voz alta, con latencia baja gracias a la decodificación no autorregresiva de Glow-TTS.
- Generación de avisos y anuncios automatizados: síntesis de mensajes pregrabados dinámicamente en alemán para domótica, transporte público o sistemas de megafonía local.
- Prototipado de pipelines TTS en Python: uso directo de `TTSModelManager` y `voice.synthesize_wav()` para integrar síntesis alemana en scripts de investigación o demos sin infraestructura GPU.
- Pruebas de integración en asistentes domésticos: validación de flujos de texto a voz en alemán dentro de entornos OVOS antes de adoptar voces comerciales.
- Generación de audio para datasets o pruebas de calidad: creación de muestras sintéticas en alemán para evaluación de sistemas de reconocimiento de voz o de pipelines de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecución en CPU mediante ONNX Runtime y el repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no se documentan; al ser un modelo ONNX ligero, no requiere GPU dedicada. Cualquier GPU compatible con ONNX Runtime (por ejemplo, series RTX o A100/H100) podría usarse, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: sí, en la práctica cabe en cualquier GPU de consumo e incluso en CPU, dado el tamaño del paquete.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-de_de-eva_k-gruut (este) | Glow-TTS + HiFi-GAN | de-DE | ONNX | other (sin especificar) | Hugging Face, 19 descargas |
| Otras voces Larynx de Rhasspy | Glow-TTS + HiFi-GAN | varias (de, en, fr, etc.) | tar.gz / ONNX | según release upstream | GitHub rhasspy/larynx |
| Otras voces empaquetadas en la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varias | ONNX | other | Hugging Face (colección Phoonnx) |

No se dispone de datos de benchmarks ni de parámetros para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia "other" sin licencia registrada: es imprescindible verificar los términos del release upstream de Rhasspy/Larynx antes de cualquier uso, especialmente comercial.
- El modelo solo acepta fonemas gruut en IPA; no procesa texto en bruto directamente, lo que exige usar `scriptconv` con el extra `scriptconv[gruut]`.
- Cobertura lingüística limitada exclusivamente al alemán `de-DE`; no soporta otros idiomas.
- Al ser un modelo TTS entrenado con un corpus concreto, puede presentar sesgos de pronunciación, prosodia o estilo propios de la voz `eva_k` y del dataset original.
- Riesgo de errores de pronunciación en palabras fuera de vocabulario, nombres propios, siglas o términos técnicos no cubiertos por el fonemizador gruut.
- No hay información pública sobre el dataset de entrenamiento, lo que dificulta evaluar sesgos demográficos o de acento.
- El número de descargas (19) y la ausencia de likes sugieren una adopción muy limitada; la comunidad y el soporte son reducidos.
- No dispone de benchmarks publicados que permitan validar su calidad frente a alternativas.
- La fecha de creación registrada (2026-11-14) es posterior a la actual, lo que conviene contrastar con la información del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-eva_k-gruut
- Release upstream de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_eva_k-glow_tts.tar.gz
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
