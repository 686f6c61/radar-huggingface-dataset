# Phoonnx/glowtts-en_us-cmu_fem

## Resumen

GlowTTS en_us-cmu_fem es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense empaquetado en formato ONNX por Phoonnx a partir del modelo original de Rhasspy, distribuido en el marco del proyecto Larynx v1.0. El modelo convierte fonemas IPA (generados por el fonemizador gruut) en un espectrograma mel, que posteriormente es transformado en audio por el vocoder HiFi-GAN multi-VCTK small. No se trata de un modelo de lenguaje generativo, sino de un sistema TTS acustico de dos etapas (acustica + vocoder) pensado para sintesis local y de baja latencia.

El modelo esta orientado a entornos de asistencia por voz y sistemas empotrados: su empaquetado para la libreria phoonnx y su integracion como plugin de OVOS (ovos-tts-plugin-phoonnx) lo hacen adecuado para despliegues en Raspberry Pi, asistentes domoticos y aplicaciones que requieren sintesis offline sin dependencia de servicios en la nube. El tamano del repositorio (0,1 GB) refleja un modelo compacto, aunque las especificaciones exactas de parametros y contexto no estan disponibles en la informacion proporcionada.

La relevancia actual reside en su naturaleza abierta y ejecutable en CPU mediante ONNX Runtime, lo que permite integrar TTS de calidad aceptable en pipelines de agentes de voz y sistemas de respuesta hablada sin coste por inferencia. La licencia no esta registrada en la model card, lo que constituye una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico normalizing flow) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el texto se procesa por frases) |
| Tipos de cuantizacion | no disponible (formato ONNX; el empaquetado puede incluir precision FP32/FP16, no especificado) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acustico basado en normalizing flows que modela la distribucion conjunta de fonemas y espectrogramas mel mediante transformaciones invertibles, sin necesidad de alineamiento externo ni de atencion autorregresiva. La arquitectura emplea un encoder de texto (fonemas) y un decoder de flujo con acoplamientos afines, lo que permite una sintesis rapida y paralela. El vocoder HiFi-GAN multi-VCTK small convierte el espectrograma mel en forma de onda de audio mediante convoluciones transposed y discriminadores multiperiodo y multiescala durante su entrenamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en TTS). El modelo original proviene del release v1.0 de Rhasspy Larynx, un proyecto de sintesis de voz offline orientado a asistentes de voz. La innovacion principal del empaquetado de Phoonnx es la conversion a ONNX y la integracion con el front-end de texto scriptconv (fonemizador gruut) y el gestor de voces de phoonnx, que descarga automaticamente el vocoder asociado.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Conversion de texto a fonemas IPA mediante gruut (scriptconv).
- Generacion de espectrogramas mel y sintesis de audio mediante vocoder HiFi-GAN.
- Ejecucion local en CPU mediante ONNX Runtime (sin GPU obligatoria).
- Integracion como plugin de OVOS (ovos-tts-plugin-phoonnx) para asistentes de voz.
- Salida en formato WAV mediante la API synthesize_wav de phoonnx.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un LLM).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz domoticos en OVOS: el modelo se integra como plugin TTS y permite respuestas habladas en local sin enviar texto a servicios en la nube, adecuado para dispositivos con recursos limitados.
- Sintesis offline en Raspberry Pi y dispositivos empotrados: el formato ONNX y el reducido tamano del repositorio (0,1 GB) permiten ejecutar la sintesis en CPU, sin GPU dedicada.
- Generacion de avisos y notificaciones habladas: la API synthesize_wav permite convertir frases cortas en WAV para sistemas de megafonia, alarmas o interfaces de voz.
- Prototipado de pipelines de voz: al ser un modelo abierto y empaquetado, sirve para validar arquitecturas TTS de dos etapas (acustica + vocoder) antes de invertir en modelos comerciales.
- Accesibilidad: lectura en voz alta de contenido textual en ingles para aplicaciones de apoyo a personas con discapacidad visual, ejecutandose localmente.
- Investigacion en TTS: el modelo permite estudiar el comportamiento de Glow-TTS con fonemas IPA y vocoder HiFi-GAN, asi como comparar variantes de vocoder (multi-VCTK small frente a otros).
- Sistemas de respuesta hablada en agentes conversacionales: combinado con un LLM y un ASR, el modelo cierra el bucle de voz en ingles en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta empaquetado en ONNX y puede ejecutarse en CPU, por lo que la VRAM no es un requisito critico.
- GPU recomendadas: no especificadas; al ser un modelo compacto, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) puede acelerar la inferencia, aunque no es necesario.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna con ONNX Runtime; tambien funciona en CPU.
- Opciones de despliegue: phoonnx (Python y OVOS), ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_fem | Glow-TTS + HiFi-GAN | en-US | no aplica | other (sin registrar) | ONNX | Hugging Face, 33 descargas |
| Piper (rhasspy/piper-voices) | VITS | Multiples | no aplica | MIT (segun proyecto Piper) | ONNX | Hugging Face, amplia adopcion |
| Coqui TTS (modelos VITS) | VITS / Glow-TTS | Multiples | no aplica | MPL 2.0 / otras | PyTorch, ONNX | Hugging Face, amplia adopcion |
| Larynx original (rhasspy/larynx) | Glow-TTS + vocoder | Multiples | no aplica | Sin licencia registrada | Tar.gz | GitHub releases |

La comparativa se basa en proyectos de la misma categoria (TTS local de dos etapas). Piper y Coqui TTS emplean arquitecturas VITS con mayor integracion y comunidad; el modelo de Phoonnx es una reempaquetado de Larynx con soporte ONNX y front-end gruut, pero con menor volumen de descargas y sin licencia clara.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica "No licence is recorded for this model"; es imprescindible verificar el release upstream de Rhasspy antes de cualquier uso comercial.
- Idioma limitado: solo soporta ingles estadounidense (en-US); no hay capacidades multilingues.
- Dependencia del front-end: la calidad depende del fonemizador gruut y de la normalizacion de texto de scriptconv; errores en la fonemizacion afectan directamente a la sintesis.
- Vocoder fijo: el modelo esta acoplado a hifigan-multi-vctk-small; cambiar de vocoder requiere reconfiguracion.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero pueden producirse artefactos acusticos o pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- Sesgos: no documentados; al ser un modelo de voz, puede reflejar sesgos del corpus de entrenamiento original (no especificado).
- Sin benchmarks publicados: no hay datos de MOS, WER ni latencia que permitan evaluar su calidad frente a alternativas.
- Escasa adopcion: 33 descargas y 0 likes en el momento de la consulta, lo que limita el soporte comunitario.
- No apto para tareas de razonamiento, codigo o agentes: es exclusivamente un modelo TTS.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_fem
- Upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_fem-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
