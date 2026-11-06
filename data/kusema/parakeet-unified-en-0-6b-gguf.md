# kusema/parakeet-unified-en-0.6b-gguf

## Resumen

Parakeet Unified English 0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por NVIDIA, orientado a la transcripción de audio en inglés. El repositorio `kusema/parakeet-unified-en-0.6b-gguf` no es el modelo original, sino un espejo (mirror) del archivo GGUF cuantizado que utiliza la aplicación de dictado para Windows Kusema, con el objetivo de garantizar la integridad de la descarga mediante la verificación de tamaño y SHA-256. El modelo base cuenta con 618.309.121 parámetros y está diseñado para transcripción de voz con un tamaño contenido que permite despliegue en entornos de escritorio.

La relevancia de este repositorio es acotada: se trata de una copia no modificada del archivo generado por el proyecto transcribe.cpp a partir del modelo original de NVIDIA, y su propósito es servir de fuente estable para una aplicación concreta. Para cualquier uso distinto del dictado en Kusema, la referencia adecuada es el modelo original `nvidia/parakeet-unified-en-0.6b`.

El modelo está publicado bajo la NVIDIA Open Model License, lo que condiciona su uso comercial a los términos de dicho acuerdo. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada en este repositorio, que remite explícitamente a la página del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; detalles en la página del modelo original de NVIDIA) |
| Parametros totales | 618.309.121 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | inglés (según el nombre del modelo y su propósito declarado; no se detalla en la información disponible) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | GGUF (archivo `parakeet-unified-en-0.6b-Q8_0.gguf`, 731.357.568 bytes) |
| SHA-256 | `4b50b6dd862bf6e346929aaf4f5eaacec003bfa3f56462d6c874b41ef2f38795` |
| Runtime | transcribe.cpp |
| Repositorio base | handy-computer/parakeet-unified-en-0.6b-gguf (revisión `7e948f21b7bdbac698d3318db9d350f1096f3b6c`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (tipo de encoder, mecanismo de atención, uso de CTC o de decodificación autorregresiva) ni los datos de entrenamiento (número de tokens, composición del corpus, técnicas de alineación o ajuste fino). El repositorio es un espejo de un archivo GGUF y remite a la página del modelo original de NVIDIA para estos detalles.

La única información técnica verificable es el proceso de conversión: el modelo original fue convertido a GGUF y cuantizado a Q8_0 por el proyecto transcribe.cpp, y este repositorio aloja una copia sin modificaciones adicionales de ese archivo. No se documentan innovaciones técnicas propias en esta ficha.

## Capacidades

- Reconocimiento automático del habla (ASR) para inglés, según la etiqueta de pipeline `automatic-speech-recognition`.
- Transcripción de audio orientada a aplicaciones de dictado, que es el caso de uso para el que se distribuye este espejo (aplicación Kusema para Windows).
- Ejecución mediante el runtime transcribe.cpp, lo que permite inferencia local sin depender de frameworks de Python.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio más allá de ASR, ni modo de pensamiento.
- No se detalla el soporte multilingüe más allá de la indicación de inglés en el nombre del modelo.

## Casos de uso

- Dictado por voz en Windows: la aplicación Kusema descarga este archivo GGUF y verifica su tamaño y SHA-256 tras la descarga, de modo que el modelo se usa para transcribir voz a texto en local dentro de esa aplicación.
- Transcripción local de reuniones y notas de voz: al ejecutarse con transcribe.cpp y un archivo Q8_0 de unos 731 MB, es viable en equipos de escritorio sin GPU dedicada de altas prestaciones, siempre que el runtime lo soporte.
- Subtitulado de contenido en inglés: el modelo puede emplearse para generar transcripciones de audio en inglés que después se sincronicen como subtítulos, aunque la información disponible no detalla marcas de tiempo ni segmentación.
- Integración en pipelines de procesamiento de audio por lotes: al ser un GGUF ejecutable con transcribe.cpp, puede incorporarse a scripts que conviertan ficheros de audio a texto de forma secuencial en un servidor de gama media.
- Prototipado de interfaces de voz: desarrolladores que necesiten un motor ASR en inglés de tamaño contenido pueden usar este archivo para validar flujos de captura de micrófono y transcripción antes de pasar a un despliegue con el modelo original.
- Verificación de integridad en distribución de software: el repositorio sirve como fuente estable con hash conocido para que una aplicación cliente compruebe que el binario descargado no ha sido alterado, un caso de uso de cadena de suministro más que de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio remite a la página del modelo original de NVIDIA para consultar sus métricas de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el archivo Q8_0 ocupa 731.357.568 bytes (aproximadamente 0,7 GB), por lo que la huella de pesos en memoria es de ese orden, a la que hay que sumar el estado del runtime y los buffers de audio.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: el tamaño del archivo (menos de 1 GB) sugiere que puede caber en GPUs de consumo con suficiente memoria libre, pero no se confirma en la documentación disponible.
- Opciones de despliegue: transcribe.cpp es el runtime indicado por el autor; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este archivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia de categoría, el modelo base es `nvidia/parakeet-unified-en-0.6b`, del que este repositorio es una copia cuantizada; cualquier comparación debería hacerse contra el modelo original y sus alternativas ASR, cuyos datos no se incluyen aquí.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial de un archivo GGUF; no es el modelo original ni ha sido entrenado por los autores de Kusema, que declaran no estar afiliados ni respaldados por NVIDIA.
- La licencia es la NVIDIA Open Model License, que impone condiciones específicas para uso comercial; es necesario revisar el texto del acuerdo incluido en el repositorio antes de cualquier despliegue productivo.
- El modelo está orientado a inglés; no se documenta soporte de otros idiomas en la información disponible.
- Solo se publica una cuantización Q8_0, lo que limita el ajuste fino entre calidad y consumo de memoria.
- No se dispone de información sobre sesgos, tasas de alucinación o errores de transcripción en dominios específicos (acentos, ruido de fondo, jerga técnica).
- Al ser un modelo ASR, las salidas son transcripciones y no texto generativo libre; los riesgos de alucinación se manifiestan como palabras o frases insertadas en la transcripción, pero no se cuantifican en la documentación disponible.
- Para producción se recomienda usar el modelo original de NVIDIA o el repositorio de conversión `handy-computer/parakeet-unified-en-0.6b-gguf`, y tratar este espejo como una fuente de distribución con hash verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kusema/parakeet-unified-en-0.6b-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Repositorio de conversión GGUF: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Aplicación Kusema: https://github.com/neulinc/kusema
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
