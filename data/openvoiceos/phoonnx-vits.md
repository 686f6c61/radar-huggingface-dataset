# OpenVoiceOS/phoonnx-vits

## Resumen

phoonnx-vits es un repositorio agregado (mono-repo) que reúne voces del sistema de síntesis de voz VITS en formato ONNX, empaquetadas para su uso con la librería phoonnx del proyecto OpenVoiceOS. No se trata de un modelo único entrenado por OpenVoiceOS, sino de una colección de voces procedentes de distintas fuentes (Piper, Meta MMS-TTS y voces comunitarias) reorganizadas por subcarpeta, una por modelo. El repositorio lo mantiene la comunidad OpenVoiceOS como espejo de voces TTS de código abierto, con el objetivo de simplificar la distribución y el consumo de estas voces desde un único punto.

Cada subcarpeta contiene un modelo VITS independiente en formato ONNX con su tokenizador y configuración asociados, lo que permite cargar voces de forma modular. La relevancia actual radica en la estandarización del despliegue de TTS ligero en entornos de asistencia por voz, domótica y sistemas embebidos, donde VITS ofrece síntesis neuronal de calidad con huella de cómputo reducida frente a modelos autorregresivos o de difusión.

El repositorio tiene un tamaño de 24,3 GB, reflejo de la acumulación de múltiples voces con distintos niveles de calidad (medium, high). No dispone de descargas ni interacciones registradas en Hugging Face en el momento de la consulta, y la licencia global declarada es MIT, aunque las licencias efectivas varían por subcarpeta según el origen de cada voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), exportado a ONNX |
| Parametros totales | no disponible (varía por subcarpeta; el repo no publica cifras por voz) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (en_US, en_GB), alemán (de_DE), francés (fr_FR), español (mms-spa), ucraniano (uk_UA), twi (tw), chichewa (ny), makhuwa (vmw); el campo `language` del repo no está cumplimentado |
| Licencia | MIT global; por subcarpeta: MIT (Piper), CC-BY-NC-4.0 (MMS), Apache-2.0 (voces ucranianas), other (voces kasanoma) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es VITS, un modelo TTS end-to-end que combina un codificador de texto, un prior variacional condicionado por alineamiento monotónico, un decodificador generativo basado en normalizing flows y un discriminador adversarial entrenado con pérdida adversarial (GAN) más pérdida de reconstrucción espectral. Esta formulación permite síntesis de alta calidad sin necesidad de un vocoder externo, ya que el decodificador genera directamente la forma de onda. En este repositorio los pesos se distribuyen ya exportados a ONNX para inferencia optimizada.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición de los datasets ni si se aplicaron etapas de RLHF o ajuste fino, dado que las voces proceden de proyectos de terceros (rhasspy/piper-voices, Meta MMS-TTS, RomanStasyshyn y michsethowusu/kasanoma). Las voces Piper emplean el front-end fonemizador espeak; las voces MMS operan directamente sobre grafemas; las voces kasanoma usan espeak con el front-end `lfn`. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) end-to-end a partir de texto de entrada, con salida de audio.
- Fonemización mediante espeak para las voces Piper, lo que habilita pronunciación basada en reglas fonéticas para los idiomas cubiertos.
- Modelado directo sobre grafemas en las voces MMS (mms-eng, mms-spa, mms-fra, mms-deu), sin fonemizador intermedio.
- Cobertura multilingüe parcial: inglés (variantes US y GB), alemán, francés, español, ucraniano, twi, chichewa y makhuwa.
- Múltiples niveles de calidad por voz (medium y high), permitiendo escoger compromiso entre calidad y coste computacional.
- Integración nativa con la librería phoonnx y compatibilidad declarada con el ecosistema Piper.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento, por tratarse de un modelo TTS.

## Casos de uso

- Asistentes de voz domésticos: las voces Piper medium (en_US-lessac, de_DE-thorsten, fr_FR-siwis) permiten generar respuestas habladas en local con latencia baja, adecuadas para sistemas de domótica y asistentes offline tipo OpenVoiceOS.
- Lectura de textos y notificaciones: el modelo puede sintetizar contenido textual dinámico (alertas, resúmenes, correos) en los idiomas cubiertos, integrándose en pipelines de accesibilidad para personas con discapacidad visual.
- Síntesis multilingüe en aplicaciones de traducción: combinando las voces MMS (eng, spa, fra, deu) se puede construir un servicio que reciba texto traducido y lo vocalice en el idioma de destino, aunque las voces MMS conllevan restricciones de licencia no comercial.
- Localización de contenido audiovisual: las voces ucranianas de calidad high (tetiana, mykyta, oleksa) permiten generar pistas de voz para doblaje o narración en ucraniano con licencia Apache-2.0, apta para uso comercial.
- Sistemas embebidos y dispositivos de bajo consumo: al distribuirse en ONNX y con voces medium, el modelo puede ejecutarse en CPU o en GPUs de gama baja, encajando en Raspberry Pi y dispositivos IoT que requieran TTS local sin dependencia de la nube.
- Investigación lingüística en lenguas de bajos recursos: las voces kasanoma para twi, chichewa y makhuwa permiten experimentar con síntesis en idiomas africanos poco representados, si bien debe revisarse su licencia `other` antes de cualquier uso.
- Pruebas de integración y evaluación de pipelines TTS: al ser un espejo organizado por subcarpetas, sirve como banco de pruebas para comparar voces Piper frente a MMS en términos de calidad y latencia dentro de un mismo framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; las voces VITS medium de Piper suelen operar en el rango de cientos de MB a ~1 GB en FP32, pero el repositorio no publica cifras por voz.
- GPU recomendadas: no disponible en la información proporcionada; por la naturaleza ligera de VITS, cabría esperar ejecución viable en GPUs de gama media y baja, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el formato ONNX y el tamaño típico de voces VITS medium sugieren viabilidad en GPUs de consumo, sin datos oficiales.
- Opciones de despliegue: librería phoonnx (declarada como librería principal), ecosistema Piper y ejecución mediante ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phoonnx-vits (este repo) | VITS (ONNX) | en, de, fr, es, uk, tw, ny, vmw | ONNX | MIT global; variable por subcarpeta | Hugging Face (OpenVoiceOS) |
| rhasspy/piper-voices | VITS (Piper) | Múltiples | ONNX | MIT | Hugging Face, GitHub |
| Meta MMS-TTS | VITS (MMS) | Más de 1.000 idiomas | PyTorch / ONNX (vía terceros) | CC-BY-NC-4.0 | Hugging Face (facebook) |
| Coqui TTS (VITS) | VITS / Tacotron2 | Múltiples | PyTorch | MPL-2.0 (según modelo) | GitHub, Hugging Face |

La comparativa se limita a parámetros cualitativos porque el repositorio no publica métricas de calidad (MOS, latencia) ni recuentos de parámetros por voz. Las voces incluidas son en su mayoría espejos de Piper y MMS, por lo que la comparación directa con esos proyectos originales es la referencia más fiable.

## Limitaciones y advertencias

- Licencias heterogéneas: aunque el repo declara MIT de forma global, las voces MMS están bajo CC-BY-NC-4.0 (prohibido el uso comercial) y las voces kasanoma bajo `other` sin licencia declarada en origen; es imprescindible revisar el README de cada subcarpeta antes de usar.
- Las voces kasanoma proceden de un proyecto que no especifica licencia, lo que introduce incertidumbre legal para cualquier despliegue en producción.
- Calidad variable entre voces: las voces medium y high proceden de entrenamientos distintos y no hay evaluación comparativa publicada, por lo que la calidad percibida puede diferir notablemente.
- Cobertura de idiomas incompleta y no normalizada: el campo `language` del repositorio no está cumplimentado, lo que complica el filtrado automático por idioma.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos en texto fuera de distribución, especialmente en nombres propios, siglas y números.
- Sesgos: no se documentan análisis de sesgo demográfico, acento o género en las voces; las voces derivadas de Piper y MMS pueden heredar sesgos de sus datasets originales.
- Sin métricas de rendimiento publicadas: no hay datos de MOS, latencia ni throughput, lo que impide una evaluación cuantitativa previa a producción.
- Tamaño del repositorio elevado (24,3 GB): la descarga completa es costosa; conviene clonar solo las subcarpetas necesarias mediante descarga selectiva.
- Sin descargas ni validación comunitaria registrada en Hugging Face: la madurez y el mantenimiento del repo no están contrastados por uso real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpenVoiceOS/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Colección phoonnx community mirror: https://huggingface.co/collections/OpenVoiceOS/phoonnx-community-mirror-6a2204d302e0e7497870cd68
- Voces Piper originales: https://huggingface.co/rhasspy/piper-voices
- Meta MMS-TTS: https://huggingface.co/facebook/mms-tts-eng (y variantes por idioma)
- ONNX de MMS multilingüe: https://huggingface.co/willwade/mms-tts-multilingual-models-onnx
- Voces ucranianas (RomanStasyshyn): https://huggingface.co/RomanStasyshyn
- Discusión de voces Piper: https://github.com/OHF-Voice/piper1-gpl/discussions/212
- Voces kasanoma: https://github.com/michsethowusu/kasanoma
