# Phoonnx/glowtts-en_us-cmu_rms

## Resumen

GlowTTS-en_us-cmu_rms es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y empaquetado posteriormente por Phoonnx para su uso con su libreria ONNX de TTS. El modelo convierte texto en ingles estadounidense, representado como fonemas IPA mediante el fonemizador gruut, en un espectrograma que luego es convertido a audio por el vocoder HiFi-GAN multi-VCTK small. Es, por tanto, un sistema TTS de dos etapas: el modelo Glow-TTS genera el espectrograma y el vocoder lo transforma en forma de onda.

El modelo esta pensado para sintesis de voz offline y ligera, con un repositorio de apenas 0,1 GB en formato ONNX, lo que lo hace adecuado para entornos con recursos limitados como asistentes de voz embebidos, aplicaciones de escritorio o dispositivos de borde. Su integracion principal es a traves de la libreria phoonnx y del ecosistema OVOS (Open Voice OS), donde se instala como plugin de TTS.

La relevancia actual del modelo es limitada pero concreta: se trata de una voz mas dentro del catalogo de voces Larynx empaquetadas para phoonnx, util para quienes necesitan una voz en ingles americano de bajo coste computacional y funcionamiento offline, sin dependencias de servicios en la nube. No es un modelo de ultima generacion ni compite en calidad con sistemas neuronales modernos de sintesis, sino que cubre el nicho de TTS ligero y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo de sintesis) + HiFi-GAN multi-VCTK small (vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz basado en flujos normalizadores (normalizing flows) que aprende una correspondencia monotona entre la secuencia de fonemas y el espectrograma mel, sin necesidad de alineamientos externos explicitos. El modelo original fue desarrollado por Rhasspy dentro del proyecto Larynx, que entreno voces sobre corpus publicos; en este caso la voz se denomina "cmu_rms", lo que sugiere un entrenamiento sobre datos derivados del corpus CMU (probablemente el dataset de voces CMU Arctic o similar) con normalizacion RMS. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no los documenta.

El pipeline completo consta de dos componentes: el modelo Glow-TTS, que recibe fonemas IPA generados por el fonemizador gruut y produce un espectrograma, y el vocoder HiFi-GAN multi-VCTK small, que convierte ese espectrograma en audio. Phoonnx descarga automaticamente el vocoder junto con la voz y gestiona la normalizacion del texto y la conversion a fonemas mediante su libreria scriptconv. La innovacion tecnica principal es el uso de flujos normalizadores para el alineamiento implicito, lo que simplifica el entrenamiento frente a arquitecturas autorregresivas tipo Tacotron, y el empaquetado en ONNX para inferencia portable.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut integrado en scriptconv.
- Generacion de espectrogramas mel y sintesis de audio final mediante el vocoder HiFi-GAN.
- Funcionamiento completamente offline, sin dependencias de servicios en la nube.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programatico en Python a traves de `TTSModelManager` de la libreria phoonnx.
- Salida de audio en formato WAV.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra como plugin de TTS en Open Voice OS, permitiendo que un asistente local sintetice respuestas en ingles americano sin conexion a internet, gracias a su tamano reducido (0,1 GB) y su formato ONNX optimizado para inferencia en CPU.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo ligero y offline, puede generar avisos hablados en tiempo real en sistemas de escritorio o kioscos sin consumir recursos significativos ni requerir red.
- Sistemas de accesibilidad para personas con discapacidad visual: sintesis de texto a voz para lectores de pantalla o aplicaciones de lectura de documentos en ingles, con latencia baja y funcionamiento local que preserva la privacidad del contenido leido.
- Automatizacion del hogar: integracion en plataformas de domotica basadas en OVOS o Rhasspy para anunciar eventos, estados de dispositivos o respuestas a comandos de voz en un asistente local.
- Prototipado rapido de interfaces conversacionales: desarrolladores que necesitan una voz de referencia en ingles para probar pipelines de dialogo, transcripcion o agentes conversacionales sin incurrir en costes de API ni en dependencias externas.
- Generacion de audio para contenido educativo o documentacion tecnica: sintesis de narraciones en ingles para tutoriales, cursos o material de formacion, con la ventaja de que el modelo puede ejecutarse en hardware modesto y de forma reproducible.
- Investigacion en TTS y evaluacion de pipelines: al ser un modelo Glow-TTS empaquetado en ONNX, sirve como referencia para comparar vocoders, fonemizadores o tecnicas de normalizacion de texto en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y el uso de ONNX, se estima que la inferencia puede ejecutarse en CPU sin GPU dedicada, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; al ser un modelo ONNX ligero, no requiere GPU para funcionar, aunque podria acelerarse con cualquier GPU compatible con ONNX Runtime.
- Compatibilidad con GPU de consumo: si, previsiblemente cualquier GPU de consumo puede ejecutarlo, e incluso es viable en CPU; no se documentan requisitos minimos oficiales.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime como backend de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_rms | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | no aplica |
| Otras voces Larynx empaquetadas por Phoonnx (coleccion Glow-TTS) | Glow-TTS + vocoder | segun voz | ONNX | other | no aplica |
| Piper (rhasspy/piper) | VITS | multiples | ONNX | MIT (segun proyecto) | no aplica |
| Coqui TTS (voces VITS) | VITS / Tacotron | multiples | varios | MPL 2.0 (segun proyecto) | no aplica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explicitamente que no hay licencia registrada para este modelo y recomienda consultar el release upstream antes de usarlo; esto supone un riesgo legal para uso comercial.
- Idioma unico: solo soporta ingles estadounidense (en-US); no es multilingue.
- Dependencia del fonemizador gruut: la calidad de la sintesis depende de la correcta conversion de texto a fonemas IPA; textos con abreviaturas, numeros o simbolos pueden requerir normalizacion previa por scriptconv.
- Calidad de voz limitada: al tratarse de una voz Glow-TTS de Larynx con vocoder HiFi-GAN small, la calidad no es comparable a sistemas neuronales modernos de sintesis (p. ej., modelos basados en difusion o LLM de audio).
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario de entrenamiento o en nombres propios.
- Sin soporte de control de prosodia avanzado ni de emociones: no se documentan capacidades de control de estilo, velocidad o entonacion mas alla de lo que ofrezca la libreria phoonnx.
- Documentacion incompleta: no se detallan parametros, datos de entrenamiento ni benchmarks, lo que dificulta la evaluacion rigurosa del modelo.
- Fecha de creacion futura en los metadatos (2026-11-14): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_rms
- Release upstream de Rhasspy Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_rms-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
