# Phoonnx/glowtts-en_us-blizzard_fls-gruut

## Resumen

Glow-TTS en_us-blizzard_fls-gruut es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por Rhasspy dentro del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo implementa la arquitectura Glow-TTS, un modelo generativo basado en flujos normalizantes que transforma fonemas en espectrogramas mel, que posteriormente son convertidos a audio por un vocoder HiFi-GAN independiente (hifigan-multi-vctk-small).

El modelo está especializado en inglés estadounidense (en-US) y su entrada no es texto plano, sino fonemas en alfabeto IPA generados mediante el fonemizador gruut. Esta separación entre front-end textual (scriptconv/gruut) y modelo acústico es característica del ecosistema Larynx y permite un control preciso de la pronunciación, a costa de requerir un pipeline adicional para procesar texto arbitrario.

Su relevancia actual es limitada pero específica: se trata de un modelo ligero (repo de 0,1 GB) pensado para despliegue en entornos con recursos restringidos, integrable en asistentes de voz como OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx. No es un modelo competitivo en calidad de voz frente a sistemas neuronales modernos basados en difusión o modelos autorregresivos de gran escala, sino una pieza de infraestructura para TTS local y determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flujos normalizantes) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis acústica basado en flujos normalizantes invertibles que modela directamente la distribución de espectrogramas mel condicionada a una secuencia de fonemas. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS permite alineamiento monotónico mediante atención dura y generación paralela, lo que se traduce en inferencia rápida y determinista. La salida del modelo es un espectrograma mel que se convierte en forma de onda mediante el vocoder HiFi-GAN multi-VCTK small, descargado automáticamente por phoonnx junto con la voz.

El modelo original procede del release v1.0 de Larynx (Rhasspy) y fue entrenado sobre el corpus Blizzard FLS (conjunto de datos de voz expresiva en inglés). No se dispone en la información proporcionada de detalles sobre número de tokens de audio, horas de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas de RLHF o ajuste fino posterior. La innovación técnica principal es la propia arquitectura Glow-TTS (generación paralela con alineamiento monotónico) y el uso de fonemas IPA como representación intermedia, que desacopla el modelo acústico del front-end lingüístico.

## Capacidades

- Síntesis de voz a partir de fonemas IPA en inglés estadounidense (en-US).
- Generación de espectrogramas mel y conversión a audio WAV mediante vocoder HiFi-GAN.
- Integración con el fonemizador gruut a través de scriptconv para normalización de texto y conversión a fonemas.
- Uso como plugin de TTS en OVOS/Mycroft (ovos-tts-plugin-phoonnx).
- Inferencia en CPU y GPU mediante ONNX Runtime, sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No soporta visión, audio de entrada ni modos de pensamiento.
- Capacidad multilingüe: únicamente en-US.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se integra mediante el plugin ovos-tts-plugin-phoonnx y permite respuestas habladas en inglés estadounidense sin depender de servicios en la nube, con un footprint de repositorio de 0,1 GB.
- Sistemas embebidos y dispositivos de borde: al ejecutarse vía ONNX Runtime y con pesos ligeros, es adecuado para Raspberry Pi y dispositivos con CPU modesta donde no cabe un modelo TTS neuronal grande.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la síntesis por frase con latencia baja y determinista permite generar avisos cortos bajo demanda.
- Generación de audio para pruebas automatizadas: al ser determinista y no autorregresivo, produce la misma salida para la misma entrada fonémica, lo que facilita tests de regresión en pipelines de audio.
- Prototipado de interfaces de voz en investigación: sirve como baseline reproducible de Glow-TTS para comparar con modelos más modernos en experimentos académicos.
- Accesibilidad en aplicaciones de escritorio Linux: integración con lectores de pantalla o herramientas de accesibilidad que requieran TTS local en inglés sin conexión.
- Generación de datasets de audio sintético controlado: la entrada por fonemas IPA permite generar pronunciaciones exactas para experimentos de fonética o aumentación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo y el vocoder caben holgadamente en menos de 1 GB de memoria en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 4090, A100, H100) funcionará, aunque el modelo es lo bastante pequeño como para no requerir GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU; también en CPU.
- Opciones de despliegue: phoonnx (Python), OVOS/Mycroft mediante ovos-tts-plugin-phoonnx, ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo de flujos con generación paralela, la latencia esperada es baja por frase, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-en_us-blizzard_fls-gruut (este) | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Hugging Face (Phoonnx) |
| Otras voces Larynx (p. ej. en-us-* en el release v1.0 de Rhasspy) | Glow-TTS + HiFi-GAN | en-US y otros | tarball original / ONNX empaquetado | según release upstream | GitHub Rhasspy / colección Phoonnx |
| Modelos TTS neuronales modernos (p. ej. VITS, Piper) | VITS / end-to-end | múltiples | ONNX | variable | Hugging Face / GitHub |

No se dispone de datos de benchmarks ni de parámetros comparables para establecer una comparación cuantitativa con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explícitamente que no hay licencia registrada y recomienda consultar el release upstream antes de cualquier uso; esto supone un riesgo legal para uso comercial.
- Idioma único: solo en-US; no admite otros idiomas ni variantes regionales.
- Entrada por fonemas IPA: requiere un front-end (scriptconv + gruut) para convertir texto plano; sin él, el modelo no procesa texto directamente.
- Calidad de voz inferior a modelos neuronales modernos basados en difusión o modelos autorregresivos de gran escala; no apta para producciones de alta fidelidad sin evaluación previa.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o con grafías ambiguas, dependiente de la calidad del fonemizador gruut.
- Sin soporte de control de prosodia avanzado, emociones ni estilos más allá de lo aprendido en el corpus Blizzard FLS.
- Sin datos publicados de benchmarks, sesgos o evaluaciones de calidad; no se puede garantizar comportamiento en dominios específicos.
- Repositorio con muy pocas descargas (22) y sin likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-blizzard_fls-gruut
- Upstream original (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_blizzard_fls-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
