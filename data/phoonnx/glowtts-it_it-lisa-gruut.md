# Phoonnx/glowtts-it_it-lisa-gruut

## Resumen

glowtts-it_it-lisa-gruut es un modelo de síntesis de voz (text-to-speech) en italiano (it-IT) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado para la librería ONNX phoonnx por el usuario Phoonnx. El modelo genera espectrogramas mel a partir de fonemas IPA producidos por el fonemizador gruut, que posteriormente son convertidos a audio por el vocoder hifigan-multi-vctk-small, descargado automáticamente junto con la voz.

Se trata de un modelo ligero (repositorio de 0,1 GB en formato ONNX) pensado para inferencia local y despliegue en asistentes de voz, en particular dentro del ecosistema OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx. Su relevancia radica en ofrecer una voz italiana completa y autónoma dentro de un stack open source de TTS, sin dependencias de servicios en la nube.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento más allá de lo indicado en la model card. La licencia figura como "other" y el propio autor advierte de que no hay licencia registrada para el modelo, por lo que recomienda consultar la release original de Larynx antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico generativo basado en flujo normalizador, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase, no modelo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | other (sin licencia registrada; consultar upstream de Larynx) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acústico generativo basado en flujos normalizadores (normalizing flows) que aprende una correspondencia biyectiva entre fonemas de entrada y espectrogramas mel, sin necesidad de alineamientos externos gracias a su mecanismo de búsqueda de alineamiento monotónico. Esta familia de modelos se caracteriza por una inferencia rápida y determinista en comparación con los modelos autorregresivos tipo Tacotron, y por producir espectrogramas estables. En este caso, el modelo se limita a generar el espectrograma; la síntesis final de audio corre a cargo del vocoder HiFi-GAN (variante multi-VCTK small).

El modelo procede del proyecto Larynx de Rhasspy (release v1.0) y ha sido reempaquetado en ONNX para phoonnx. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicables habitualmente en TTS). El front-end de texto utiliza el fonemizador gruut, que normaliza el texto y lo convierte a fonemas IPA antes de la inferencia.

## Capacidades

- Síntesis de voz en italiano (it-IT) a partir de texto plano, con salida en fichero WAV.
- Conversión de texto a fonemas IPA mediante gruut antes de la síntesis.
- Generación de espectrogramas mel que se transforman en audio con el vocoder HiFi-GAN integrado en el flujo de phoonnx.
- Integración como plugin de TTS en OVOS (ovos-tts-plugin-phoonnx) para asistentes de voz.
- Ejecución local en formato ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modos de pensamiento: es exclusivamente un modelo de síntesis de voz.
- Capacidad multilingüe limitada al italiano; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en italiano: integración en OVOS mediante ovos-tts-plugin-phoonnx para dotar de voz italiana a un asistente doméstico que funcione sin conexión, aprovechando el formato ONNX y el tamaño reducido del repositorio.
- Lectura de notificaciones y alertas: síntesis de mensajes cortos generados por sistemas domóticos o de monitorización, donde la latencia de un modelo Glow-TTS es adecuada para respuestas rápidas por frase.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual en italiano, ejecutándose en hardware modesto.
- Generación de audiolibros o contenido narrado por lotes: procesamiento por frases de textos largos con el fonemizador gruut, almacenando los WAV resultantes.
- Pruebas y desarrollo de pipelines TTS: uso como voz de referencia dentro de proyectos que emplean phoonnx y scriptconv, para validar flujos de normalización de texto y fonemización en italiano.
- Prototipado de interfaces conversacionales: generación de respuestas habladas en demos de chatbots o IVR en italiano antes de invertir en voces comerciales.
- Investigación en TTS: comparación de la calidad de Glow-TTS + HiFi-GAN frente a modelos más recientes en italiano dentro de estudios académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (0,1 GB en ONNX) y la naturaleza de Glow-TTS más HiFi-GAN small, se espera un consumo bajo, apto para CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución local y puede funcionar en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería más que suficiente, aunque no hay datos oficiales de rendimiento.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido tamaño del modelo y del vocoder.
- Opciones de despliegue: phoonnx (Python) y el plugin ovos-tts-plugin-phoonnx para OVOS; el modelo se distribuye en ONNX, por lo que también puede ejecutarse con ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| glowtts-it_it-lisa-gruut | Glow-TTS + HiFi-GAN | it-IT | ONNX | other (sin registrar) | Empaquetado para phoonnx/OVOS |
| Otras voces Larynx (p. ej. it-it_lisa-glow_tts original) | Glow-TTS | it-IT | tar.gz (Larynx) | consultar upstream | Mismo modelo base, sin empaquetar en ONNX |
| Otras voces de la colección Glow-TTS de Phoonnx | Glow-TTS | varios | ONNX | other | Mismo pipeline, distintos idiomas y hablantes |
| Piper (Rhasspy) | VITS | varios (incl. it) | ONNX | MIT (habitual) | Alternativa más moderna del mismo ecosistema, con licencia más clara |

No se dispone de datos de benchmarks que permitan comparar el rendimiento objetivo frente a estas alternativas.

## Limitaciones y advertencias

- Licencia "other" sin licencia registrada: el propio autor recomienda consultar la release original de Larynx antes de cualquier uso, lo que introduce incertidumbre para uso comercial.
- Modelo monoidioma: solo italiano (it-IT); no es adecuado para otros idiomas.
- Dependencia del front-end gruut: la calidad de la síntesis depende de la correcta fonemización del texto de entrada.
- No es un modelo de lenguaje: no razona, no sigue instrucciones complejas ni soporta tool calling; cualquier expectativa en ese sentido es incorrecta.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, números o palabras extranjeras no cubiertas por la normalización de scriptconv.
- Sin datos publicados sobre sesgos del hablante ni sobre la composición del dataset de entrenamiento.
- Calidad acústica limitada por el vocoder HiFi-GAN small (multi-VCTK), inferior a la de vocoders de mayor tamaño o modelos neuronales más recientes.
- Repositorio con muy pocas descargas (24) y sin likes: ecosistema reducido, menor probabilidad de mantenimiento activo y de soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-it_it-lisa-gruut
- Release original de Larynx (Rhasspy): https://github.com/rhasspy/larynx/releases/download/v1.0/it-it_lisa-glow_tts.tar.gz
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- phoonnx (librería TTS ONNX): https://github.com/TigreGotico/phoonnx
- scriptconv (normalización y fonemizadores): https://github.com/TigreGotico/scriptconv
