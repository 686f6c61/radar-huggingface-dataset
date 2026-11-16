# Phoonnx/glowtts-ru_ru-minaev-gruut

## Resumen

`glowtts-ru_ru-minaev-gruut` es un modelo de síntesis de voz (text-to-speech) en ruso empaquetado en formato ONNX para la librería phoonnx. El modelo original procede del proyecto Larynx de Rhasspy (versión 1.0), una iniciativa de código abierto orientada a voces de alta calidad para asistentes de voz offline. La variante `minaev` corresponde a una voz concreta del conjunto ruso de Larynx, y el sufijo `gruut` indica que el front-end de texto utiliza fonemas del fonemizador gruut en alfabeto IPA.

La arquitectura es Glow-TTS, un modelo de síntesis basado en flujo normalizante que genera espectrogramas mel a partir de fonemas, acoplado a un vocoder HiFi-GAN (concretamente `hifigan-multi-vctk-small`) que convierte el espectrograma en audio. El paquete distribuido ocupa aproximadamente 0,1 GB y está pensado para inferencia ligera, incluso en entornos con recursos limitados.

Su relevancia actual radica en que permite incorporar síntesis de voz en ruso en asistentes domésticos y sistemas OVOS sin depender de servicios en la nube. El modelo tiene un uso muy específico (una única voz, un único idioma) y está empaquetado por Phoonnx como parte de su colección de modelos Glow-TTS convertidos a ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flujo normalizante) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (síntesis por frase, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ruso (`ru-RU`) |
| Licencia | `other` (sin licencia registrada; consultar el release upstream de Larynx) |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en flujos normalizantes que aprende una transformación invertible entre la distribución de espectrogramas mel y una distribución latente gaussiana, condicionada por una alineación monotónica entre fonemas y frames. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS permite paralelizar la generación durante la inferencia, lo que reduce la latencia. El vocoder asociado, `hifigan-multi-vctk-small`, es un HiFi-GAN de tamaño reducido entrenado sobre el corpus multi-VCTK, que reconstruye la forma de onda a partir del espectrograma mel.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o ajuste por preferencias (no aplica habitualmente en TTS). El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx, orientado a voces de dominio público para asistentes de voz. La innovación principal es el empaquetado ONNX para phoonnx, que facilita su despliegue multiplataforma y su integración en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

## Capacidades

- Síntesis de voz en ruso (`ru-RU`) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`).
- Generación de espectrogramas mel con Glow-TTS y conversión a audio WAV con el vocoder HiFi-GAN.
- Normalización de texto y conversión de script delegadas a la librería `scriptconv`.
- Integración con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python con la API `TTSModelManager` y `voice.synthesize_wav()`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz domésticos offline: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx` y permite que un asistente responda en ruso sin enviar texto a servicios externos, preservando la privacidad y funcionando sin conexión.
- Lectura de notificaciones y alertas: en sistemas de domótica o monitoreo, el modelo puede sintetizar mensajes cortos en ruso (por ejemplo, avisos de sensores) con baja latencia gracias a la generación paralela de Glow-TTS.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de textos en ruso en aplicaciones de escritorio o móviles que empaqueten el modelo ONNX.
- Generación de audiolibros o contenido narrado: aunque limitado a una única voz, puede emplearse para producir narraciones en ruso por lotes, dado el bajo coste computacional del paquete (0,1 GB).
- Pruebas de integración en pipelines de TTS: desarrolladores que necesiten una voz rusa de referencia para validar sistemas de síntesis, comparar vocoders o medir latencia en entornos embebidos.
- Prototipado de interfaces conversacionales en ruso: equipos que construyan chatbots de voz y necesiten una voz local para pruebas antes de migrar a soluciones comerciales.
- Educación y aprendizaje de ruso: aplicaciones que requieran pronunciar frases en ruso con una voz sintética consistente para ejercicios de escucha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño del paquete (0,1 GB) y la naturaleza de Glow-TTS + HiFi-GAN small, la inferencia cabe holgadamente en GPUs con 2-4 GB de VRAM e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior ofrece margen sobrado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo e incluso en iGPU o CPU.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles en la información proporcionada; Glow-TTS permite generación paralela, lo que en la práctica reduce la latencia frente a modelos autorregresivos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-ru_ru-minaev-gruut | Glow-TTS + HiFi-GAN | ru-RU | no disponible | other | ONNX | Hugging Face (Phoonnx) |
| Otras voces Larynx ru (Rhasspy) | Glow-TTS + HiFi-GAN | ru-RU | no disponible | según release upstream | tar.gz / ONNX | GitHub Rhasspy |
| Modelos TTS multilingües tipo VITS | VITS | varios | no disponible | variable | ONNX / PyTorch | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Una única voz (`minaev`); no permite selección de hablante ni clonación.
- Solo ruso (`ru-RU`); no soporta otros idiomas.
- Licencia `other` sin licencia registrada: es imprescindible revisar el release upstream de Larynx antes de cualquier uso comercial.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o con grafías ambiguas, dependiente del fonemizador gruut.
- No es un modelo de lenguaje: no razona, no sigue instrucciones complejas ni mantiene contexto conversacional.
- La calidad del audio depende del vocoder `hifigan-multi-vctk-small`, de tamaño reducido; puede ser inferior a vocoders de mayor capacidad.
- No se documentan sesgos específicos, pero al ser una voz entrenada sobre un corpus concreto puede reflejar características del hablante original.
- Para producción, conviene validar la licencia y la calidad perceptual en el dominio de aplicación antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-ru_ru-minaev-gruut
- Upstream Larynx (release): https://github.com/rhasspy/larynx/releases/download/v1.0/ru-ru_minaev-glow_tts.tar.gz
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- scriptconv (repositorio): https://github.com/TigreGotico/scriptconv
