# Phoonnx/glowtts-fa-custom-espeak

## Resumen

Glow-TTS en persa (farsi) empaquetado para la librería ONNX phoonnx. El modelo original es un Glow-TTS de Coqui, publicado en la release v0.10.1 de Coqui TTS bajo el identificador `tts_models--fa--custom--glow-tts`, y Phoonnx lo redistribuye en formato ONNX para su uso con su propia librería de síntesis de voz. Resuelve el problema de disponer de un motor TTS ligero y desplegable en producción para persa sin depender del stack completo de Coqui TTS.

La arquitectura es Glow-TTS, un modelo de síntesis texto-a-voz basado en normalizing flows que combina un encoder Transformer con un decoder autorregresivo de tipo flow y un vocoder (habitualmente HiFi-GAN en el ecosistema Coqui). El modelo es de un solo idioma (`fa`) y su entrada de texto son fonemas espeak en alfabeto IPA, lo que implica una dependencia explícita de espeak-ng o de su port espyak para la fonemización.

Es relevante porque ofrece una alternativa empaquetada en ONNX, con licencia permisiva CC-BY-4.0 y un tamaño de repositorio de 0,1 GB, orientada a despliegues ligeros (asistentes de voz, OVOS, aplicaciones embebidas) en un idioma con relativamente poca cobertura en el ecosistema TTS open source. El número de descargas (21) y de likes (0) indica que es un artefacto de nicho y reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, encoder Transformer + decoder flow) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, sin contexto de conversacion) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Persa (`fa`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz de tipo flow-based generativo. El texto de entrada se fonemiza a IPA mediante espeak-ng (o su port espyak) y se codifica con un encoder Transformer; un decoder basado en normalizing flows transforma la representación latente en un mel-espectrograma, que posteriormente se convierte en audio mediante un vocoder. La alineación texto-audio se aprende de forma monotónica sin necesidad de un aligner externo, lo que es una de las innovaciones características de Glow-TTS frente a enfoques anteriores tipo Tacotron.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF/DPO (no aplicables en TTS de este tipo). El modelo original procede de Coqui TTS v0.10.1 y fue entrenado para persa; Phoonnx únicamente lo ha convertido y empaquetado en ONNX para su librería. No se documentan innovaciones adicionales más allá de las propias de Glow-TTS.

## Capacidades

- Síntesis de voz texto-a-audio en persa (`fa`) a partir de texto plano.
- Fonemización mediante espeak-ng (o espyak como alternativa incluida en el extra `phoonnx[espeak]`).
- Entrada de texto en alfabeto IPA (fonemas espeak).
- Ejecución en ONNX, lo que permite inferencia en CPU y en entornos sin GPU.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada a un único idioma (`fa`).

## Casos de uso

- Asistentes de voz en persa sobre OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en farsi dentro de un asistente doméstico.
- Lectura de contenido en aplicaciones móviles o de escritorio: al ejecutarse en ONNX, puede integrarse en apps que necesiten leer texto en persa sin depender de servicios en la nube.
- Accesibilidad para usuarios con discapacidad visual: conversión de texto de pantalla a voz en persa con un modelo ligero (repo de 0,1 GB) que cabe en dispositivos con recursos limitados.
- Generación de audiolibros o locuciones en persa: síntesis por lotes de textos largos mediante la API `synthesize_wav` de phoonnx, escribiendo la salida en ficheros WAV.
- Sistemas de anuncios o notificaciones habladas en persa: integración en pipelines de backend que generen avisos de voz a partir de plantillas de texto.
- Pruebas y prototipado de pipelines TTS en persa: al estar empaquetado en ONNX con una API Python sencilla, sirve para validar flujos de fonemización espeak y de síntesis antes de adoptar un modelo mayor o comercial.
- Investigación en TTS de bajos recursos: como referencia reproducible de un Glow-TTS entrenado en persa, útil para comparativas y experimentos de fonemización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en menos de 1 GB de memoria en la mayoría de configuraciones.
- GPU recomendadas: no se especifican; al ser ONNX, no requiere GPU dedicada.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del artefacto; también en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles.
- Dependencia externa: espeak-ng instalado en el sistema (por ejemplo, `apt install espeak-ng`) o el extra `phoonnx[espeak]` con espyak.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-fa-custom-espeak (este) | Persa (`fa`) | Glow-TTS | ONNX (phoonnx) | CC-BY-4.0 | Hugging Face |
| Glow-TTS original de Coqui (`tts_models--fa--custom--glow-tts`) | Persa (`fa`) | Glow-TTS | Checkpoint Coqui TTS | CC-BY-4.0 (según lista de Coqui) | Release v0.10.1 de Coqui TTS |
| Otros modelos Glow-TTS empaquetados por Phoonnx | Varios | Glow-TTS | ONNX (phoonnx) | Según modelo | Colección Glow-TTS en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo idioma: solo persa (`fa`); no admite otros idiomas.
- Dependencia crítica de espeak-ng: sin él, la fonemización falla; con espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- La entrada debe ser texto normalizado y fonemizable por espeak; texto con caracteres no soportados o números mal normalizados puede degradar la calidad.
- Riesgo de pronunciación incorrecta en nombres propios, siglas y préstamos léxicos no cubiertos por la fonemización.
- No hay información pública sobre sesgos, calidad subjetiva (MOS) ni evaluación perceptual.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor original (Coqui) y respetar los términos de la licencia.
- Artefacto de nicho con muy pocas descargas (21) y sin likes; no hay evidencia de validación comunitaria extensa.
- El modelo card no documenta parámetros, contexto ni cuantizaciones; cualquier estimación de recursos es aproximada.
- Para producción, conviene validar la calidad de síntesis en el dominio concreto (vocabulario, nombres propios, cifras) antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-fa-custom-espeak
- Modelo original Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.10.1_models/tts_models--fa--custom--glow-tts.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
