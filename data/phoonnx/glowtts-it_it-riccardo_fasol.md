# Phoonnx/glowtts-it_it-riccardo_fasol

## Resumen

Glow-TTS it-IT Riccardo Fasol es un modelo de síntesis de voz (text-to-speech) en italiano empaquetado en formato ONNX para la librería phoonnx. El modelo original procede de Rhasspy, concretamente del proyecto Larynx v1.0, y ha sido reempaquetado por Phoonnx para su uso con su librería de TTS basada en ONNX. Se trata de un modelo Glow-TTS que genera espectrogramas a partir de fonemas IPA, que posteriormente son convertidos a audio por el vocoder HiFi-GAN multi-VCTK small.

El modelo está especializado en una única voz italiana (it-IT), identificada como "riccardo_fasol", y no soporta otros idiomas. Su arquitectura Glow-TTS es un modelo de síntesis no autorregresivo basado en normalizing flows, lo que permite una inferencia rápida y paralela en comparación con modelos autorregresivos como Tacotron 2. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que lo hace muy ligero y adecuado para despliegues en entornos con recursos limitados.

La relevancia de este modelo radica en su integración con el ecosistema phoonnx y OVOS (Open Voice OS), lo que facilita su uso en asistentes de voz y aplicaciones de TTS en italiano. Al estar empaquetado en ONNX, puede ejecutarse en una amplia variedad de hardware sin necesidad de GPUs dedicadas, y su licencia "other" requiere verificar las condiciones del proyecto original antes de su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flows) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX, presumiblemente FP32/FP16) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz no autorregresivo que utiliza normalizing flows para modelar la distribución de espectrogramas mel a partir de fonemas. A diferencia de los modelos autorregresivos, Glow-TTS permite generar el espectrograma completo en paralelo, lo que reduce la latencia de inferencia. El modelo produce un espectrograma que posteriormente es convertido a forma de onda por el vocoder HiFi-GAN multi-VCTK small, un generador adversarial que sintetiza audio de alta calidad a partir de espectrogramas mel.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo original fue entrenado por Rhasspy como parte del proyecto Larynx v1.0, que utiliza datos de voz de dominio público y técnicas de entrenamiento específicas para TTS. La innovación principal de Glow-TTS es su capacidad de alineamiento monotónico mediante atención por búsqueda (monotonic alignment search), que elimina la necesidad de alineamientos explícitos durante el entrenamiento.

## Capacidades

- Síntesis de voz en italiano (it-IT) a partir de texto escrito.
- Generación de espectrogramas mel mediante normalizing flows.
- Conversión de texto a fonemas IPA mediante gruut (a través de scriptconv).
- Integración con la librería phoonnx para Python y OVOS.
- Ejecución en formato ONNX, compatible con múltiples backends de inferencia.
- Síntesis no autorregresiva, lo que permite generación paralela y baja latencia.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo TTS).
- No soporta otros idiomas distintos del italiano.
- No soporta visión, audio de entrada ni modo "thinking".

## Casos de uso

- Asistentes de voz en italiano: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para proporcionar respuestas habladas en italiano en asistentes domésticos y aplicaciones de voz.
- Lectura de textos en aplicaciones de accesibilidad: puede convertir artículos, noticias o documentos en audio para personas con discapacidad visual, gracias a su bajo consumo de recursos y su formato ONNX ligero.
- Generación de audiolibros y podcasts: permite sintetizar grandes volúmenes de texto en italiano de forma rápida y paralela, adecuado para producción de contenido en lote.
- Sistemas de navegación y anuncios por voz: su baja latencia y su capacidad de ejecutarse en hardware modesto lo hacen adecuado para dispositivos embebidos que necesitan anuncios hablados en italiano.
- Prototipado de interfaces conversacionales: los desarrolladores pueden usar el modelo para crear prototipos de chatbots de voz en italiano sin necesidad de GPUs dedicadas, gracias a su formato ONNX y su integración con phoonnx.
- Educación y aprendizaje de idiomas: puede generar pronunciaciones de texto italiano para aplicaciones de aprendizaje de idiomas, aunque limitado a una única voz.
- Investigación en TTS: sirve como baseline ligero para experimentos de síntesis de voz en italiano, especialmente en entornos con recursos computacionales limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de ~0,1 GB en ONNX, es probable que quepa en CPU y en GPUs con poca memoria (menos de 1 GB), pero no se especifica.
- GPU recomendadas: no disponible; al ser un modelo ligero, cualquier GPU moderna (incluso integradas) debería ser suficiente.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU consumer debido al pequeño tamaño del repositorio (~0,1 GB).
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y cualquier runtime compatible con ONNX (ONNX Runtime, etc.).
- Latencia y throughput estimados: no disponible; Glow-TTS es no autorregresivo, por lo que se espera baja latencia, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-it_it-riccardo_fasol | Glow-TTS + HiFi-GAN | it-IT | no aplica | other | ONNX | Hugging Face (Phoonnx) |
| Larynx v1.0 (upstream) | Glow-TTS + HiFi-GAN | múltiples (incl. it-IT) | no aplica | ver upstream | tar.gz (modelo original) | GitHub Rhasspy |
| Coqui TTS (VITS) | VITS | múltiples | no aplica | MPL 2.0 (según modelo) | PyTorch | GitHub Coqui |
| Piper TTS | VITS | múltiples | no aplica | MIT (según modelo) | ONNX | GitHub Rhasspy |

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con una única voz (riccardo_fasol), puede presentar sesgos de género, edad o acento asociados a esa voz concreta.
- Riesgo de alucinación: en TTS, el riesgo se traduce en pronunciaciones incorrectas o artefactos de audio en palabras fuera del vocabulario o en fonemas mal transcritos.
- Limitaciones de contexto o idioma: solo soporta italiano (it-IT); no es multilingüe. No está diseñado para textos muy largos sin segmentación previa.
- Restricciones de licencia: la licencia es "other" y no se registra una licencia explícita; es necesario verificar la licencia del proyecto original Rhasspy Larynx antes de cualquier uso comercial.
- Caveats para producción: el modelo depende de gruut para la fonemización, lo que añade una dependencia externa; la calidad de la síntesis puede variar según la normalización del texto; no se han publicado métricas objetivas de calidad (MOS) en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-it_it-riccardo_fasol
- Modelo original (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/it-it_riccardo_fasol-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
