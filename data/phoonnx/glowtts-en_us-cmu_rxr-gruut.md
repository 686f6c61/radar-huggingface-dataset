# Phoonnx/glowtts-en_us-cmu_rxr-gruut

## Resumen

`glowtts-en_us-cmu_rxr-gruut` es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la libreria `phoonnx`. El modelo convierte texto en un espectrograma mel que posteriormente es transformado en audio por el vocoder `hifigan-multi-vctk-small`, tambien distribuido por Phoonnx. La entrada de texto no es texto plano directo: requiere fonemas en alfabeto IPA generados mediante el fonemizador `gruut` a traves de la libreria `scriptconv`.

El modelo esta pensado para sintesis de voz ligera y desplegable en entornos con recursos limitados, ya que el repositorio completo ocupa aproximadamente 0,1 GB y los pesos se distribuyen en formato ONNX, lo que facilita la inferencia en CPU sin necesidad de GPU. Es una opcion practica para asistentes de voz locales, sistemas embebidos y aplicaciones de OVOS (Open Voice OS), donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`.

La relevancia actual del modelo radica en su caracter local y sin dependencias de servicios en la nube, si bien su licencia no esta claramente registrada (aparece como `other` y la propia model card advierte que no hay licencia documentada), lo que supone una limitacion importante para uso comercial. El modelo solo soporta ingles estadounidense y no dispone de datos publicos de benchmarks ni de parametros totales declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow acoplado a un vocoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el modelo card no documenta variantes cuantizadas) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; la model card indica que se consulte la release upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python y OVOS) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz basado en normalizing flows que aprende una transformacion invertible entre la distribucion de espectrogramas mel y una distribucion latente gaussiana, condicionada por la representacion textual (en este caso, fonemas IPA). A diferencia de los modelos autorregresivos como Tacotron 2, Glow-TTS permite sintesis en paralelo, lo que reduce la latencia de generacion del espectrograma. El espectrograma producido se convierte en forma de onda mediante un vocoder neuronal HiFi-GAN (`hifigan-multi-vctk-small`), que Phoonnx descarga automaticamente junto con la voz.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. El modelo procede de la release v1.0 de Larynx de Rhasspy, un proyecto de sintesis de voz local orientado a asistentes de voz. La innovacion tecnica principal es la propia arquitectura Glow-TTS (sintesis paralela no autorregresiva) combinada con el empaquetado ONNX de Phoonnx, que permite ejecutar el modelo sin framework de deep learning pesado y con integracion directa en OVOS.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto de entrada.
- Conversion de texto a fonemas IPA mediante el fonemizador `gruut` (integrado en `scriptconv`).
- Generacion de espectrogramas mel que se transforman en audio mediante el vocoder HiFi-GAN asociado.
- Inferencia en CPU gracias al formato ONNX y al reducido tamano del modelo (0,1 GB).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programatico en Python a traves de `phoonnx.model_manager.TTSModelManager` y `voice.synthesize_wav`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No dispone de modo thinking ni capacidades multimodales.
- Capacidad multilingue limitada exclusivamente al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra mediante `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo sintesis de voz completamente offline en dispositivos domoticos sin enviar texto a la nube.
- Lectura de notificaciones y alertas en sistemas embebidos: al ocupar solo 0,1 GB y ejecutarse en ONNX sobre CPU, puede desplegarse en Raspberry Pi u otros dispositivos de bajos recursos para leer mensajes del sistema.
- Generacion de audio para pruebas automatizadas de pipelines de voz: util para crear clips de audio sinteticos en tests de integracion de asistentes conversacionales sin depender de servicios externos.
- Accesibilidad en aplicaciones de escritorio: sintesis de texto a voz para lectores de pantalla o narracion de contenido en ingles, con latencia baja gracias a la generacion paralela de Glow-TTS.
- Prototipado rapido de interfaces de voz: permite validar flujos de interaccion por voz en ingles antes de invertir en modelos TTS de mayor calidad o en servicios comerciales.
- Sistemas de anuncios en kioscos o terminales: reproduccion de mensajes pregrabados dinamicamente en ingles estadounidense en entornos sin conectividad.
- Educacion y aprendizaje de ingles: generacion de pronunciacion de frases a partir de fonemas IPA, aprovechando la entrada fonemica del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta en formato ONNX y esta disenado para inferencia en CPU, por lo que no requiere GPU.
- GPU recomendadas: no aplica para el caso de uso previsto; cualquier GPU compatible con ONNX Runtime puede ejecutarlo, pero no se documentan requisitos especificos.
- Cabe en GPU consumer: si, aunque su diseno esta orientado a CPU; el tamano del repositorio (0,1 GB) sugiere un consumo de memoria muy reducido.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime como backend subyacente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamano | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| glowtts-en_us-cmu_rxr-gruut | Glow-TTS + HiFi-GAN | en-US | 0,1 GB | ONNX | other (sin registrar) | Empaquetado por Phoonnx para OVOS |
| Piper (voces en_US) | VITS (end-to-end) | Multiples (incluye en-US) | Variable, tipicamente <100 MB por voz | ONNX | MIT (segun proyecto Piper) | Alternativa mas moderna y ampliamente adoptada para TTS local |
| Larynx (otras voces Glow-TTS) | Glow-TTS + vocoder | Multiples | Variable | ONNX / tflite | Variable segun voz | Mismo origen upstream que este modelo |
| Coqui TTS (modelos VITS) | VITS / Tacotron 2 | Multiples | Cientos de MB | PyTorch / ONNX | MPL 2.0 (proyecto Coqui) | Mayor calidad potencial pero mayor peso y dependencias |

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explicitamente que no hay licencia documentada y que debe consultarse la release upstream antes de cualquier uso, lo que impide asumir permisos de uso comercial.
- Unicamente soporta ingles estadounidense; no hay soporte multilingue.
- Requiere entrada fonemica en IPA mediante `gruut`; el texto plano debe pasar por el front-end de `scriptconv`, lo que anade una dependencia adicional.
- Es un modelo Glow-TTS de la release v1.0 de Larynx, con calidad de sintesis inferior a modelos TTS mas recientes como VITS o arquitecturas basadas en difusion.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre la composicion de las voces.
- Riesgo de pronunciacion incorrecta en palabras fuera del vocabulario o nombres propios, dado que la conversion a fonemas depende de `gruut`.
- No apto para tareas de razonamiento, codigo, vision ni agentes; su unica funcion es la sintesis de voz.
- Escaso soporte de la comunidad: 21 descargas y 0 likes en el momento de la consulta, lo que limita la disponibilidad de ayuda y mantenimiento.
- Para produccion, conviene verificar la licencia upstream de Larynx v1.0 y el vocoder `hifigan-multi-vctk-small` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_rxr-gruut
- Release upstream de Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_rxr-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
