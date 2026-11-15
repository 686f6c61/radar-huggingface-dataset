# Phoonnx/multiband_melgan-en_us-ljspeech

## Resumen

Multiband MelGAN para inglés estadounidense es un vocoder neuronal empaquetado en formato ONNX por Phoonnx, a partir del modelo original publicado por Coqui dentro de su librería TTS (versión 0.6.1). Su función es convertir espectrogramas mel en formas de onda de audio, es decir, es la etapa final de un pipeline de síntesis de voz: un modelo acústico como Glow-TTS genera el espectrograma y este vocoder lo transforma en señal audible. No es un modelo de texto a voz completo, sino un componente especializado que se usa junto a un modelo acústico compatible.

El modelo procede del ecosistema Coqui TTS, que lo distribuye con licencia MPL según la lista de modelos del proyecto original. Phoonnx lo ha reempaquetado para su propia librería de inferencia ONNX, de modo que se descarga automáticamente junto con las voces que lo requieren, sin pasos adicionales por parte del usuario. En la información disponible no se detallan parámetros, longitud de contexto ni datos de entrenamiento del vocoder.

Su relevancia actual es acotada pero concreta: permite ejecutar síntesis de voz en inglés con un vocoder ligero y exportable a ONNX dentro del stack de Phoonnx y OVOS, lo que facilita el despliegue en entornos donde se prefiere inferencia portable y sin dependencias pesadas de PyTorch. Está pensado para la voz `coqui-en-ljspeech-glow-tts` (Glow-TTS sobre el corpus LJSpeech).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vocoder neuronal Multiband MelGAN (generador adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a vocoder; opera sobre espectrogramas mel) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en (inglés; voces en en-US) |
| Licencia | other (el upstream declara MPL en la lista de modelos de Coqui TTS) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Multiband MelGAN es un vocoder basado en un generador adversarial que sintetiza la forma de onda a partir de espectrogramas mel. La variante "multiband" descompone la generación en varias bandas de frecuencia, lo que reduce el coste computacional frente a MelGAN estándar y permite obtener audio de mayor calidad con menos operaciones. El modelo original fue entrenado por Coqui sobre el corpus LJSpeech, un conjunto de audio en inglés estadounidense de una única hablante femenina.

Phoonnx no ha reentrenado el modelo: lo ha convertido y empaquetado en ONNX para su librería `phoonnx`. No se dispone en la información proporcionada de detalles sobre el número de tokens, la composición exacta del dataset, ni sobre si se aplicaron técnicas de refinamiento posteriores. Tampoco se documentan innovaciones adicionales más allá de la propia arquitectura multibanda y la exportación a ONNX.

## Capacidades

- Conversión de espectrogramas mel a forma de onda de audio (vocoder).
- Generación de audio de voz en inglés estadounidense a partir de la salida de un modelo acústico compatible.
- Integración automática en el pipeline de Phoonnx: se descarga junto con las voces que lo requieren.
- Ejecución mediante inferencia ONNX, sin dependencia obligatoria de PyTorch en tiempo de ejecución.
- Compatibilidad declarada con la voz `coqui-en-ljspeech-glow-tts` (Glow-TTS sobre LJSpeech).
- No realiza síntesis de texto a voz por sí mismo: requiere un modelo acústico que produzca el espectrograma.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; su función es exclusivamente de síntesis de waveform.

## Casos de uso

- Síntesis de voz embebida en inglés: se usa como etapa final de un pipeline Glow-TTS + vocoder para generar audio de una hablante en inglés estadounidense en aplicaciones de lectura en voz alta.
- Asistentes de voz locales en OVOS: al estar empaquetado para Phoonnx y OVOS, permite dotar de voz a asistentes que se ejecutan en local sin depender de servicios en la nube.
- Despliegue portable con ONNX Runtime: útil en entornos donde no se quiere instalar PyTorch completo, ya que el vocoder se ejecuta como grafo ONNX.
- Prototipado rápido de TTS: al descargarse automáticamente con la voz asociada, reduce el trabajo de configuración en pruebas de concepto de síntesis de voz.
- Generación de audiolibros o contenido narrado en inglés: combinado con Glow-TTS sobre LJSpeech, produce voz consistente para narración de texto largo.
- Evaluación de pipelines TTS en investigación: sirve como vocoder de referencia para comparar calidad y latencia frente a otros vocoders del ecosistema Coqui.
- Integración en aplicaciones de accesibilidad: lectura de texto en pantalla para usuarios angloparlantes mediante un stack ligero y portable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser un vocoder ligero y exportado a ONNX, se espera un consumo bajo, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; la ejecución ONNX permite inferencia en CPU y en GPU compatibles con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime a través de la librería Phoonnx (Python y OVOS); no se documentan otros runners.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Idioma | Licencia | Contexto / parámetros |
|---|---|---|---|---|---|
| Phoonnx multiband_melgan-en_us-ljspeech | Vocoder Multiband MelGAN | ONNX | en | other (upstream MPL) | no disponible |
| Coqui multiband-melgan (original, v0.6.1) | Vocoder Multiband MelGAN | PyTorch (checkpoint Coqui TTS) | en | MPL | no disponible |
| Otros vocoders de la colección Phoonnx | Vocoders varios | ONNX | según voz | según modelo | no disponible |

La comparación directa con alternativas concretas (por ejemplo, HiFi-GAN u otros vocoders) no está disponible en la información proporcionada; solo se puede contrastar con el modelo original de Coqui, del que este es una conversión a ONNX.

## Limitaciones y advertencias

- No es un modelo de texto a voz autónomo: necesita un modelo acústico que genere el espectrograma mel de entrada.
- Solo soporta inglés (en-US) y está asociado a una única voz de LJSpeech; no es multilingüe ni multi-hablante.
- No se documentan sesgos específicos, pero al derivar de LJSpeech hereda las características de esa única hablante (voz femenina, inglés estadounidense).
- Riesgo de artefactos o degradación de calidad si el espectrograma de entrada no coincide con la distribución esperada por el vocoder.
- Licencia `other` en Hugging Face y MPL declarada por el upstream: conviene verificar las condiciones exactas antes de uso comercial.
- El repositorio figura con 0 descargas y 0 likes, y tamaño de 0.0 GB en la información disponible; la madurez y el soporte de la comunidad no están contrastados.
- No se dispone de datos de benchmarks ni de latencia, por lo que las estimaciones de rendimiento en producción deben medirse directamente.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/multiband_melgan-en_us-ljspeech
- Modelo original (Coqui TTS v0.6.1): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/vocoder_models--en--ljspeech--multiband-melgan.zip
- Librería Phoonnx: https://github.com/TigreGotico/phoonnx
- Scriptconv (normalización de texto y fonemizadores): https://github.com/TigreGotico/scriptconv
- Colección de vocoders de Phoonnx: https://huggingface.co/collections/Phoonnx/vocoders-6af8eab202014765d7fce3c9
- Voz compatible Glow-TTS: https://huggingface.co/Phoonnx/glowtts-en_us-ljspeech-coqui
