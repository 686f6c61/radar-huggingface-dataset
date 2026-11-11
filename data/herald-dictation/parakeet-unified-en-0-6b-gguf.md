# herald-dictation/parakeet-unified-en-0.6b-gguf

## Resumen

Parakeet Unified English 0.6B (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-unified-en-0.6b` de NVIDIA, empaquetada para su uso con [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El repositorio lo publica `herald-dictation` para que la aplicación de dictado offline Herald descargue los pesos desde su propio espacio de Hugging Face en lugar de depender del alojamiento de otro proyecto.

El modelo cuenta con 618.309.121 parámetros (aproximadamente 0,6 mil millones) y está especializado exclusivamente en inglés (`en`). Se distribuye como un único fichero `parakeet-unified-en-0.6b-Q8_0.gguf` de 731.357.568 bytes en cuantización Q8_0, lo que lo sitúa en el rango de modelos ligeros aptos para ejecución local en CPU o GPU de consumo.

La relevancia de esta ficha radica en que se trata de un artefacto de empaquetado, no de un modelo nuevo: los pesos son una copia byte a byte de la conversión publicada por `handy-computer` (commit `7e948f2`), sin modificaciones. Su interés práctico es el despliegue de transcripción de voz privada y sin conexión mediante transcribe.cpp, bajo la NVIDIA Open Model License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de NVIDIA; la model card no detalla la topología interna) |
| Parámetros totales | 618.309.121 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (fichero publicado); otras cuantizaciones en el repositorio original `handy-computer/parakeet-unified-en-0.6b-gguf` |
| Idiomas soportados | inglés (`en`) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | GGUF (`parakeet-unified-en-0.6b-Q8_0.gguf`, 731.357.568 bytes, SHA-256 `4b50b6dd862bf6e346929aaf4f5eaacec003bfa3f56462d6c874b41ef2f38795`) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo base de NVIDIA (tipo de encoder, mecanismo de atención, uso de CTC, RNN-T o attention-based encoder-decoder). Tampoco se documentan el volumen de datos de entrenamiento, la composición del corpus ni si hubo etapas de ajuste fino supervisado o preferencias. Cualquier afirmación al respecto sería especulativa y no se incluye.

Lo que sí consta es el proceso de conversión: los pesos originales de `nvidia/parakeet-unified-en-0.6b` fueron convertidos a GGUF por `handy-computer` para el runtime transcribe.cpp, y `herald-dictation` publica una copia idéntica byte a byte de esa conversión (commit `7e948f2`). No se aplicó ninguna modificación a los pesos ni reentrenamiento; el único cambio respecto al original es el formato de serialización y la cuantización a Q8_0.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés: transcripción de audio a texto.
- Ejecución offline y local mediante transcribe.cpp, sin dependencia de servicios en la nube.
- Integración orientada al dictado privado en la aplicación Herald.
- Modelo de un solo idioma: no soporta traducción ni transcripción multilingüe.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No se documenta un modo "thinking" ni funcionalidades especiales adicionales.

## Casos de uso

- Dictado offline en escritorio: Herald utiliza este GGUF para transcribir voz a texto en local, de modo que el audio del usuario nunca sale del equipo. El tamaño de 0,7 GB y la cuantización Q8_0 permiten cargarlo en memoria de forma rápida.
- Transcripción de reuniones privadas: al ejecutarse con transcribe.cpp sin conexión, es adecuado para entornos con requisitos de confidencialidad (despachos legales, sanidad, sector público) donde no se permite enviar audio a terceros.
- Subtitulado y notas de voz en inglés: generación de transcripciones de grabaciones cortas o notas dictadas, con un modelo de 618 M de parámetros que reduce los requisitos de cómputo frente a alternativas de mayor tamaño.
- Prototipado de pipelines ASR: sirve como componente de referencia en experimentos con transcribe.cpp para comparar latencia y calidad frente a otras cuantizaciones del mismo modelo disponibles en el repositorio original.
- Aplicaciones de accesibilidad: entrada de texto por voz en herramientas de escritura para usuarios con movilidad reducida, ejecutándose en hardware de consumo.
- Integración en herramientas de línea de comandos: transcripción por lotes de ficheros de audio en inglés dentro de scripts locales, aprovechando el formato GGUF y el runtime ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero Q8_0 ocupa 731.357.568 bytes (aproximadamente 0,7 GB); se necesita al menos ese espacio más el overhead del runtime transcribe.cpp.
- GPU recomendadas: no disponible en la información proporcionada.
- GPU de consumo: por tamaño (0,6 B de parámetros, 0,7 GB en Q8_0) es plausible que quepa en GPU de consumo e incluso en CPU, pero la información disponible no confirma requisitos oficiales ni GPUs validadas.
- Opciones de despliegue: transcribe.cpp (runtime para el que está empaquetado el GGUF). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| parakeet-unified-en-0.6b-gguf (este) | 618.309.121 | no disponible | en | NVIDIA Open Model License | GGUF Q8_0 | Copia byte a byte de la conversión de handy-computer; runtime transcribe.cpp |
| nvidia/parakeet-unified-en-0.6b | 618.309.121 (según dato del repo) | no disponible | en | NVIDIA Open Model License | safetensors (modelo base) | Modelo original de NVIDIA; referencia de pesos sin cuantizar |
| handy-computer/parakeet-unified-en-0.6b-gguf | 618.309.121 (según dato del repo) | no disponible | en | NVIDIA Open Model License | GGUF (varias cuantizaciones) | Conversión original a transcribe.cpp; incluye otras cuantizaciones además de Q8_0 |

No se dispone de datos de rendimiento comparado con otros modelos ASR (por ejemplo, Whisper) en la información proporcionada, por lo que no se incluye una comparación de calidad.

## Limitaciones y advertencias

- Solo inglés: no transcribe ni traduce otros idiomas.
- Licencia NVIDIA Open Model License: es una licencia "other" con condiciones específicas; debe revisarse el texto completo antes de uso comercial. El repositorio incluye `LICENSE` y un `NOTICE` con la atribución exigida ("Licensed by NVIDIA Corporation under the NVIDIA Open Model License").
- Artefacto de empaquetado: los pesos no han sido modificados por `herald-dictation`; cualquier problema de calidad o sesgo proviene del modelo original de NVIDIA.
- Riesgo de alucinación y errores de transcripción: no se documentan tasas de error (WER) en la información disponible, por lo que no puede evaluarse su fiabilidad en dominios concretos (acentos, ruido, jerga técnica).
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Contexto y duración de audio: no se especifica la longitud máxima de audio soportada ni la ventana de contexto.
- Ecosistema limitado: el GGUF está pensado para transcribe.cpp; no se garantiza compatibilidad con otros runtimes habituales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación reducido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/herald-dictation/parakeet-unified-en-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Conversión original GGUF: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
