# Phoonnx/glowtts-be_by-common-graphemes

## Resumen

Glow-TTS en bielorruso (`be-BY`) empaquetado en formato ONNX para la librería de síntesis de voz phoonnx. El modelo original es un Glow-TTS desarrollado por Coqui, entrenado sobre el corpus Common Voice y distribuido originalmente en el release v0.16.6 de Coqui TTS. Esta versión, publicada por Phoonnx, convierte los pesos originales a ONNX y los integra en el ecosistema phoonnx/OVOS para su uso en asistentes de voz y pipelines de TTS en producción.

Se trata de un modelo acústico que genera espectrogramas a partir de caracteres del texto (front-end basado en grafemas, sin fonemización lingüística específica), que posteriormente son convertidos a audio por el vocoder HiFi-GAN `hifigan-be_by-common`, descargado automáticamente por phoonnx junto con la voz. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia ligera en CPU.

Su relevancia radica en ser una de las pocas opciones de TTS en bielorruso con licencia abierta (CC-BY-SA 4.0) y formato ONNX listo para desplegar, lo que facilita su integración en sistemas de lectura de pantalla, asistentes domésticos y aplicaciones de accesibilidad para este idioma de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico normalizing flow) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el tamaño del repo sugiere cuantización ligera, pero no se especifica) |
| Idiomas soportados | bielorruso (`be-BY`) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que modela directamente la distribución del espectrograma mel condicionada al texto, sin necesidad de alineamientos externos ni de un modelo autorregresivo. La arquitectura combina un encoder de texto con un decoder de flujo invertible y utiliza un mecanismo de alineamiento monotónico (MAS, Monotonic Alignment Search) durante el entrenamiento para descubrir la correspondencia entre caracteres y frames de audio. El modelo genera espectrogramas que son convertidos a forma de onda por el vocoder HiFi-GAN `hifigan-be_by-common`.

El modelo original fue entrenado por Coqui sobre el corpus Common Voice en bielorruso. El front-end de texto es puramente basado en grafemas: phoonnx utiliza `GraphemePhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte directamente en la secuencia de caracteres de entrada, sin conversión a fonemas. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento original publicado en Coqui TTS v0.16.6.

## Capacidades

- Síntesis de voz (text-to-speech) en bielorruso a partir de texto plano en caracteres.
- Generación de espectrogramas mel mediante Glow-TTS y conversión a audio WAV vía vocoder HiFi-GAN.
- Normalización y conversión de texto de entrada mediante `scriptconv` (front-end de grafemas).
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en formato ONNX, apta para ejecución en CPU sin GPU dedicada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al bielorruso (`be-BY`).

## Casos de uso

- **Lectores de pantalla y accesibilidad en bielorruso**: el modelo puede sintetizar texto de interfaces, documentos y páginas web en `be-BY`, proporcionando salida de voz a usuarios con discapacidad visual en un idioma con escasa cobertura de TTS comercial.
- **Asistentes de voz domésticos con OVOS**: mediante el plugin `ovos-tts-plugin-phoonnx`, se integra en asistentes locales configurados en `mycroft.conf` para responder en bielorruso sin depender de servicios en la nube.
- **Sistemas de anuncios públicos y transporte**: generación de avisos pregrabados o dinámicos en bielorruso para estaciones, aeropuertos o edificios públicos, aprovechando el formato ONNX para despliegue en dispositivos de bajo consumo.
- **Aplicaciones educativas de aprendizaje de idiomas**: síntesis de vocabulario y frases en bielorruso para herramientas de aprendizaje, con la ventaja de ser un modelo ligero (0,1 GB) que puede ejecutarse en el dispositivo del estudiante.
- **Digitalización de contenido textual a audio**: conversión de noticias, artículos o libros en bielorruso a audio para podcasts o audiolibros, usando el front-end de grafemas que no requiere diccionarios fonéticos externos.
- **Prototipado e investigación en TTS de bajos recursos**: como referencia abierta para experimentos con Glow-TTS en idiomas minoritarios, permitiendo comparar el rendimiento del front-end de grafemas frente a enfoques basados en fonemas.
- **Integración en pipelines de CI/CD para pruebas de regresión de audio**: verificación automatizada de que las actualizaciones del sistema de TTS producen audio inteligible en bielorruso antes de desplegar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no aplica en la mayoría de despliegues; el modelo está pensado para ejecución en CPU mediante ONNX Runtime. En caso de usar GPU, el consumo sería mínimo (inferior a 1 GB) dado el tamaño del repo (0,1 GB).
- **GPU recomendadas**: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) podría acelerar la inferencia, pero no es un requisito.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos embebidos (Raspberry Pi, etc.) gracias al formato ONNX y al tamaño reducido.
- **Opciones de despliegue**: ONNX Runtime (vía phoonnx), plugin OVOS `ovos-tts-plugin-phoonnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Tamaño repo |
|---|---|---|---|---|---|
| Phoonnx/glowtts-be_by-common-graphemes | be-BY | Glow-TTS + HiFi-GAN | ONNX | CC-BY-SA 4.0 | 0,1 GB |
| Coqui TTS `tts_models--be--common-voice--glow-tts` (upstream) | be-BY | Glow-TTS + HiFi-GAN | PyTorch (checkpoint) | CC-BY-SA 4.0 | no disponible |
| Otros modelos Glow-TTS de la colección Phoonnx | varios | Glow-TTS + HiFi-GAN | ONNX | según modelo | variable |

La comparativa con alternativas de otros desarrolladores para bielorruso no está disponible en la información proporcionada. El modelo upstream de Coqui es funcionalmente idéntico, diferenciándose únicamente en el formato de pesos (PyTorch frente a ONNX) y en el empaquetado para phoonnx.

## Limitaciones y advertencias

- **Idioma único**: solo soporta bielorruso (`be-BY`); cualquier texto en otro idioma producirá una salida incorrecta o ininteligible.
- **Front-end de grafemas**: al no usar fonemización lingüística, la pronunciación de palabras irregulares, siglas o números puede ser imprecisa; la normalización depende de `scriptconv`.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir artefactos, ruidos o pronunciaciones erráticas en entradas fuera de distribución o muy largas.
- **Sesgos del corpus**: el modelo fue entrenado sobre Common Voice, un corpus crowdsourced; puede reflejar sesgos de pronunciación, acento o demografía de los hablantes que contribuyeron al dataset.
- **Licencia CC-BY-SA 4.0**: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; es importante revisar las implicaciones para productos propietarios.
- **Sin benchmarks publicados**: no hay métricas objetivas (MOS, WER, etc.) disponibles en la información proporcionada, lo que dificulta evaluar su calidad frente a alternativas.
- **Dependencia del vocoder externo**: requiere descargar `hifigan-be_by-common`; si el vocoder no está disponible o falla, el modelo no puede generar audio.
- **Contexto de entrada no especificado**: no se documenta la longitud máxima de texto que el modelo puede sintetizar de forma fiable en una sola pasada.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-be_by-common-graphemes](https://huggingface.co/Phoonnx/glowtts-be_by-common-graphemes)
- [Vocoder HiFi-GAN: Phoonnx/hifigan-be_by-common](https://huggingface.co/Phoonnx/hifigan-be_by-common)
- [Upstream Coqui TTS v0.16.6 (modelo original)](https://github.com/coqui-ai/TTS/releases/download/v0.16.6/tts_models--be--common-voice--glow-tts.zip)
- [Colección Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
