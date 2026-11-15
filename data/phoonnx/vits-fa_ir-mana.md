# Phoonnx/vits-fa_ir-mana

## Resumen

vits-fa_ir-mana es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado por Phoonnx a partir del modelo original Mana-Persian-Piper de MahtaFetrat. Está basado en la arquitectura VITS, una red generativa adversarial condicionada por texto que sintetiza audio de forma extremo a extremo sin necesidad de un vocoder separado. El modelo está especializado exclusivamente en persa (fa-IR) y su entrada de texto son fonemas en alfabeto IPA generados mediante espeak-ng.

La relevancia de este paquete es práctica: convierte un checkpoint Piper de la comunidad persa en un artefacto ONNX listo para ejecutarse con la librería phoonnx, lo que permite integrarlo tanto en Python como en el ecosistema de asistentes de voz OVOS. Con un tamaño de repositorio de 0,1 GB, es un modelo ligero pensado para despliegue en entornos con recursos limitados, incluidos dispositivos de borde.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni datos de entrenamiento más allá de la atribución al modelo upstream. La ficha se limita, por tanto, a los datos verificables publicados por el autor del empaquetado y por el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech extremo a extremo, ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | persa (fa-IR) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz condicionado por texto que combina un codificador de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. VITS produce waveforms directamente a partir de fonemas, evitando el pipeline clásico de modelo acústico más vocoder. La entrada de texto se procesa mediante espeak-ng para obtener fonemas en alfabeto IPA, que son la representación que consume el modelo.

El paquete distribuido por Phoonnx es una conversión a ONNX del modelo Mana-Persian-Piper de MahtaFetrat, orientada a inferencia con la librería phoonnx. No se ha publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO; estos datos corresponden al modelo upstream y no están detallados en la model card accesible.

## Capacidades

- Síntesis de voz en persa (fa-IR) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, agentes, visión, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.
- Monolingüe: no se declaran capacidades multilingües más allá del persa.

## Casos de uso

- Asistentes de voz en persa sobre OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en fa-IR con un modelo de 0,1 GB adecuado para dispositivos de borde.
- Lectura de contenido en aplicaciones persas: integración en Python con `TTSModelManager` para convertir artículos, notificaciones o mensajes en audio WAV, aprovechando la API directa `synthesize_wav`.
- Accesibilidad para usuarios iraníes: conversión de texto a voz en lectores de pantalla o interfaces de accesibilidad, dado el soporte nativo de fa-IR y la licencia MIT que permite uso comercial.
- Síntesis en el navegador: despliegue con phoonnx.js para generar voz persa del lado del cliente sin backend, útil en aplicaciones web educativas o de lectura.
- Prototipado de pipelines TTS: al ser un artefacto ONNX ligero, sirve para validar flujos de normalización de texto y fonemización con scriptconv antes de escalar a modelos mayores.
- Sistemas de anuncios automatizados: generación de avisos hablados en persa en entornos como transporte, comercio o domótica, donde el coste computacional debe ser mínimo.
- Investigación en TTS de bajos recursos: base para experimentos de fine-tuning o comparación de arquitecturas VITS en lenguas menos representadas, gracias a la licencia permisiva y al tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con un repositorio de 0,1 GB, la inferencia ONNX cabe holgadamente en GPUs de consumo e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño del artefacto (0,1 GB).
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato |
|---|---|---|---|---|---|
| vits-fa_ir-mana (este) | VITS | fa-IR | 0,1 GB | MIT | ONNX |
| MahtaFetrat/Mana-Persian-Piper (upstream) | VITS/Piper | fa-IR | no disponible | MIT | Piper |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | variable | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza persa (fa-IR); no admite otros idiomas.
- Dependencia de espeak-ng: sin el binario instalado, la fonemización puede ser incorrecta; el port espyak incluido en `phoonnx[espeak]` puede pronunciar mal algunas palabras por diferencias en los fonemas.
- No se han publicado métricas de calidad (MOS, WER de fonemas) ni evaluaciones de sesgo en la información disponible.
- Riesgo de pronunciación incorrecta en palabras con grafías ambiguas o préstamos, inherente a la fonemización automática con espeak-ng.
- La licencia MIT del upstream permite uso comercial, pero conviene verificar la cadena de atribución al modelo original Mana-Persian-Piper.
- El paquete es una conversión ONNX; no se documentan procesos de cuantización ni optimizaciones de latencia, por lo que el rendimiento real en producción debe medirse.
- Fecha de creación del repositorio indicada como 2026-11-14, dato que conviene contrastar con la fuente original antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-mana
- Modelo upstream: https://huggingface.co/MahtaFetrat/Mana-Persian-Piper
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
