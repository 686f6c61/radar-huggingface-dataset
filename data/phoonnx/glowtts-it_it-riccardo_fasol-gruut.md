# Phoonnx/glowtts-it_it-riccardo_fasol-gruut

## Resumen

glowtts-it_it-riccardo_fasol-gruut es un modelo de sintesis de voz (text-to-speech) en italiano empaquetado en formato ONNX por Phoonnx. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx, una familia de voces TTS de codigo abierto orientadas a asistentes de voz y sistemas de domotica. Phoonnx se limita a repaquetar los pesos originales para que puedan ejecutarse con su libreria de inferencia ONNX, lo que facilita su integracion en pipelines modernos sin depender del stack original de Larynx.

La arquitectura Glow-TTS es un modelo de sintesis no autorregresivo basado en normalizing flows y alineamiento monotono, que genera espectrogramas mel a partir de fonemas. En este caso, la entrada de texto se procesa mediante el fonemizador gruut, que convierte el texto italiano en fonemas IPA antes de pasarlos al modelo. La salida espectral se convierte en audio mediante el vocoder HiFi-GAN multi-VCTK small, que Phoonnx descarga automaticamente junto con la voz.

El modelo es relevante para desarrolladores que necesitan una voz italiana ligera, ejecutable localmente y con licencia permisiva (aunque la licencia concreta no esta registrada en el repo). Su tamano reducido (0,1 GB en el repositorio) y su formato ONNX lo hacen adecuado para despliegues en CPU y en dispositivos de bajos recursos, asi como para integrarse en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flows, no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small (ONNX, descargado por phoonnx) |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo de sintesis de voz que combina normalizing flows con un alineamiento monotono aprendido (MAS, Monotonic Alignment Search). A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS genera el espectrograma completo en paralelo, lo que reduce la latencia de inferencia. La arquitectura transforma una distribucion latente gaussiana en el espectrograma mel mediante una serie de flujos invertibles condicionados por la secuencia de fonemas de entrada.

El modelo fue entrenado originalmente por Rhasspy como parte de Larynx v1.0, un proyecto orientado a voces TTS de codigo abierto para asistentes de voz. La entrada de texto se procesa con el fonemizador gruut, que normaliza el texto y lo convierte a fonemas IPA italianos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning. El vocoder asociado, HiFi-GAN multi-VCTK small, convierte el espectrograma mel en forma de onda de audio.

## Capacidades

- Sintesis de voz en italiano (it-IT) a partir de texto plano.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut (integrado via `scriptconv[gruut]`).
- Generacion de espectrogramas mel y conversion a audio WAV mediante el vocoder HiFi-GAN.
- Ejecucion local en CPU y GPU mediante ONNX Runtime (a traves de phoonnx).
- Integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada al italiano.

## Casos de uso

- **Asistentes de voz para domotica**: el modelo puede integrarse en un asistente tipo Mycroft/OVOS para leer respuestas en italiano con baja latencia, gracias a la generacion paralela de espectrogramas de Glow-TTS y su ejecucion en ONNX.
- **Lectura de notificaciones y alertas**: en sistemas de monitorizacion o IoT, el modelo puede sintetizar mensajes cortos en italiano para notificar eventos al usuario sin depender de servicios en la nube.
- **Accesibilidad**: conversion de texto a voz para lectores de pantalla o aplicaciones de accesibilidad en italiano, ejecutandose localmente en el dispositivo del usuario.
- **Audioguías y contenido educativo**: generacion de narraciones en italiano para aplicaciones de aprendizaje de idiomas o audioguías, donde se requiere una voz consistente y sin coste por peticion.
- **Prototipado de interfaces conversacionales**: desarrolladores que necesitan una voz italiana rapida para probar flujos de dialogo antes de invertir en voces comerciales.
- **Sistemas embebidos y edge computing**: el tamano reducido del repositorio (0,1 GB) y el formato ONNX permiten desplegar la voz en dispositivos con recursos limitados, como Raspberry Pi o mini-PC.
- **Generacion de contenido multimedia offline**: sintesis de locuciones en italiano para videos, podcasts o demos sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precision; por el tamano del repositorio (0,1 GB) y la naturaleza del modelo Glow-TTS, se estima un consumo inferior a 1 GB en inferencia, aunque no se confirma en la documentacion.
- **GPU recomendadas**: cualquier GPU con soporte ONNX Runtime (GTX 1050 o superior, RTX 3060, RTX 4090, A100, H100). El modelo es lo suficientemente pequeno como para ejecutarse en CPU.
- **Consumer GPU**: si, cabe en cualquier GPU de consumo moderna e incluso en CPU.
- **Opciones de despliegue**: phoonnx (libreria principal), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-it_it-riccardo_fasol-gruut | Glow-TTS + HiFi-GAN | Italiano | ONNX | other (sin registrar) | Hugging Face (Phoonnx) |
| Otras voces Larynx (Rhasspy) | Glow-TTS + HiFi-GAN | Multiples | Tar.gz / ONNX | Varía por voz | GitHub Rhasspy/Larynx |
| Piper TTS | VITS | Multiples | ONNX | MIT (mayoria) | GitHub Rhasspy/Piper |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- **Licencia incierta**: la model card indica explicitamente que no hay licencia registrada y recomienda consultar la release upstream antes de usar el modelo. Esto supone un riesgo para uso comercial.
- **Idioma unico**: solo soporta italiano (it-IT); no es multilingue.
- **Dependencia del fonemizador gruut**: la calidad de la sintesis depende de la correcta fonemizacion del texto italiano; errores en gruut afectan directamente al audio generado.
- **Riesgo de alucinacion acustica**: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario o en texto con caracteres especiales.
- **Sesgos**: no se documentan sesgos especificos, pero la voz esta entrenada sobre un hablante concreto (Riccardo Fasol), lo que limita la diversidad de voces y puede no representar variantes regionales del italiano.
- **Sin soporte para tareas de NLP**: no es un modelo de lenguaje; no puede usarse para razonamiento, codigo, matematicas ni agentes.
- **Mantenimiento**: el modelo fue empaquetado por Phoonnx a partir de un release de Larynx v1.0; no se garantiza actualizacion ni soporte activo.
- **Documentacion escasa**: no se detallan parametros, datos de entrenamiento ni benchmarks, lo que dificulta la evaluacion rigurosa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/glowtts-it_it-riccardo_fasol-gruut)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Coleccion Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Release upstream Larynx v1.0 (Rhasspy)](https://github.com/rhasspy/larynx/releases/download/v1.0/it-it_riccardo_fasol-glow_tts.tar.gz)
- [Vocoder hifigan-multi-vctk-small](https://huggingface.co/Phoonnx/hifigan-multi-vctk-small)
