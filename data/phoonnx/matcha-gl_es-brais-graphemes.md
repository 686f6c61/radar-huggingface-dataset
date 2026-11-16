# Phoonnx/matcha-gl_es-brais-graphemes

## Resumen

matcha-gl_es-brais-graphemes es un modelo de síntesis de voz (text-to-speech) en gallego, empaquetado en formato ONNX por Phoonnx a partir del modelo original de Proxecto Nós (`proxectonos/Nos_TTS-brais-matcha-graphemes`). Implementa la arquitectura Matcha-TTS, un modelo de síntesis neuronal no autorregresivo basado en flow matching que genera mel-espectrogramas a partir de una secuencia de entrada, que en este caso son grafemas directos del texto (sin conversión fonética previa). El modelo se distribuye como un artefacto listo para ejecutar con la librería `phoonnx`, orientada a despliegue ligero en Python y en el ecosistema OVOS.

La relevancia de este modelo es doble. Por un lado, cubre una lengua de bajos recursos como el gallego, para la que existen pocos sistemas TTS de calidad y menos aún empaquetados para inferencia ONNX reproducible. Por otro, su enfoque de entrada por grafemas simplifica el pipeline: elimina la necesidad de un fonemizador específico del idioma y delega la normalización textual en `scriptconv`, con un `GraphemePhonemizer` que actúa como paso trivial de conversión.

El repositorio ocupa aproximadamente 0,1 GB y se publica bajo licencia Apache 2.0. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la documentación proporcionada, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (síntesis neuronal no autorregresiva con flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | gallego (`gl`, variante `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de síntesis de voz basada en modelos de difusión por flow matching, que predice mel-espectrogramas de forma no autorregresiva. A diferencia de los sistemas en dos etapas con fonemizador obligatorio, este empaquetado recibe directamente los caracteres del texto y los procesa mediante el `GraphemePhonemizer` de `scriptconv`, que normaliza la entrada y la convierte en la secuencia que consume el modelo. El modelo original fue entrenado por Proxecto Nós y posteriormente exportado a ONNX y empaquetado por Phoonnx para su uso con la librería homónima.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni detalles del vocoder asociado en la documentación proporcionada. El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que sugiere un tamaño compacto adecuado para inferencia en CPU o GPU de gama baja, aunque no se confirman los parámetros exactos.

## Capacidades

- Síntesis de voz en gallego (`gl-ES`) a partir de texto plano.
- Entrada directa por grafemas: no requiere un fonemizador específico del idioma, ya que la conversión se resuelve con `GraphemePhonemizer` de `scriptconv`.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)` de `phoonnx`.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Normalización y conversión de texto delegadas a `scriptconv` antes de la síntesis.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, tool calling ni razonamiento multi-paso; se trata de un modelo puramente TTS.

## Casos de uso

- Asistentes de voz en gallego: el modelo puede integrarse en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz a asistentes domésticos en gallego, seleccionando la voz `proxectonos/brais-matcha-graphemes` en la configuración.
- Lectura de contenido web y documentos: dado que acepta texto plano por grafemas, es adecuado para convertir artículos, noticias o documentación en audio para usuarios gallegohablantes, sin necesidad de un pipeline fonético adicional.
- Accesibilidad para personas con discapacidad visual: síntesis de textos largos en gallego con un modelo ligero (0,1 GB) que puede ejecutarse en local sin depender de servicios en la nube.
- Sistemas de megafonía y avisos automatizados: generación de mensajes pregrabados o dinámicos en gallego para transporte público, aeropuertos o comercios, donde la latencia y el coste por inferencia importan.
- Aplicaciones educativas de aprendizaje de gallego: producción de audio de pronunciación a partir de texto escrito, aprovechando la entrada por grafemas para reflejar la ortografía estándar.
- Integración en pipelines de Python con ONNX: al distribuirse en ONNX y con la librería `phoonnx`, puede incorporarse en servicios backend o scripts de generación por lotes sin depender de frameworks pesados de deep learning.
- Prototipado rápido de interfaces de voz: el empaquetado y la API simple (`TTSModelManager`, `load()`, `synthesize_wav`) permiten validar productos de voz en gallego con pocas líneas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0,1 GB) sugiere que el modelo cabe holgadamente en GPUs de gama baja e incluso podría ejecutarse en CPU.
- GPU recomendadas: no se especifican en la documentación; por tamaño, cualquier GPU con al menos 2-4 GB de memoria debería ser suficiente, aunque no se confirma.
- ¿Cabe en GPU de consumo? Probablemente sí, dada la huella de 0,1 GB, pero no se documenta oficialmente.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. El formato ONNX permite además ejecución con `onnxruntime` directamente, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| matcha-gl_es-brais-graphemes (este) | Gallego | Matcha-TTS | ~0,1 GB (repo) | Apache 2.0 | ONNX |
| proxectonos/Nos_TTS-brais-matcha-graphemes | Gallego | Matcha-TTS | no disponible | Apache 2.0 | no disponible |
| Otros modelos Matcha-TTS de la colección Phoonnx | Varios | Matcha-TTS | variable | según upstream | ONNX |

La comparación con alternativas de otros idiomas o familias (por ejemplo, VITS o FastSpeech2) no está disponible en la información proporcionada. El modelo upstream de Proxecto Nós es la referencia directa y comparte arquitectura, idioma y licencia; la diferencia principal es el empaquetado ONNX y la integración con `phoonnx`/OVOS.

## Limitaciones y advertencias

- Cobertura limitada a un único idioma (gallego, `gl-ES`); no se documenta soporte multilingüe.
- Entrada por grafemas: aunque simplifica el pipeline, puede producir pronunciaciones menos precisas en palabras con ortografía irregular o extranjerismos, al no disponer de un fonemizador específico.
- No se documentan sesgos concretos, pero al ser un modelo entrenado por un tercero (Proxecto Nós) y sin información sobre el corpus, no puede descartarse sesgo de voz, género o registro.
- Riesgo de alucinación acústica: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o ruido en entradas atípicas (números, siglas, símbolos).
- No se especifican requisitos de normalización textual más allá de `scriptconv`; textos con abreviaturas o formato complejo pueden requerir preprocesado adicional.
- Licencia Apache 2.0 declarada por el upstream, lo que permite uso comercial, pero conviene verificar la model card original de Proxecto Nós para condiciones adicionales.
- El modelo está empaquetado para `phoonnx` (versión preliminar, `pip install --pre phoonnx`); la API puede cambiar y no se garantiza estabilidad en producción.
- No se documentan métricas de calidad (MOS, WER) ni benchmarks, lo que dificulta evaluar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-brais-graphemes
- Modelo upstream: https://huggingface.co/proxectonos/Nos_TTS-brais-matcha-graphemes
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
