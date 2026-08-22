# Astora1mx/whisper-small-quran-asr-source-ONNX

## Resumen

El modelo **whisper-small-quran-asr-source-ONNX** es una conversión a formato ONNX del checkpoint `Astora1mx/whisper-small-quran-asr-source`, un sistema de reconocimiento automático del habla (ASR) especializado en la transcripción de recitaciones del Corán en árabe. El modelo original es a su vez un espejo del checkpoint MIT de `basharalrfooh/whisper-small-quran`, que a su vez se basa en el modelo `openai/whisper-small`. Esta versión ONNX está diseñada para ser utilizada con la librería Transformers.js, lo que permite su ejecución directamente en el navegador o en entornos Node.js sin necesidad de un servidor de inferencia dedicado.

El modelo resuelve el problema de la transcripción precisa de recitaciones coránicas, un dominio con vocabulario y fonética específicos que los modelos ASR genéricos a menudo manejan con menor precisión. Su relevancia radica en que ofrece una solución de ASR en árabe coránico con licencia MIT, lo que facilita su integración en aplicaciones web, herramientas educativas y proyectos de investigación. Al estar cuantizado y convertido a ONNX, es adecuado para despliegues en el lado del cliente (edge) con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder Transformer) |
| Parametros totales | ~244 millones (estimado, basado en Whisper Small) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (formato ONNX, posiblemente FP32) |
| Idiomas soportados | arabe (ar) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI, un transformer encoder-decoder entrenado para ASR multitarea. El encoder procesa espectrogramas de audio de 80 canales (Mel filterbank) en ventanas de 30 segundos, y el decoder autoregresivo genera la transcripcion. La version original fue afinada sobre `openai/whisper-small` con datos de recitacion coranica, probablemente mediante fine-tuning supervisado estandar (sin RLHF). El checkpoint base `bash-26alrfooh/whisper-small-quran` fue afinado para reconocer el arabe coranico con alta precision, incluyendo la correcta transcripcion de las reglas de tajwid y la diacritizacion del texto.

La conversion a ONNX se realizo mediante la herramienta automatica de Hugging Face Spaces `onnx-community/convert-to-onnx`, que exporta el modelo a formato ONNX para su uso con Transformers.js. El repositorio `Astora1mx/whisper-small-quran-asr-source` actua como fuente con metadatos explicito de `automatic-speech-recognition` para facilitar la conversion. No se dispone de informacion sobre el dataset exacto de entrenamiento ni el numero de tokens, aunque se infiere que es un dataset de recitaciones del Coran en arabe.

## Capacidades

- Reconocimiento de voz en arabe para recitaciones del Coran, incluyendo la transcripcion de versiculos con su diacritica.
- Generacion de transcripciones con marcas de tiempo (segments) si se usa la API de pipeline de Transformers.js.
- Soporte de decodificacion autoregressive estandar de Whisper (sin tool calling ni funciones de agente).
- Capacidad de procesar audio en tiempo real en el navegador via Transformers.js, sin servidor.
- Multilingue limitado: el modelo esta afinado exclusivamente para arabe coranico; no se garantiza buen rendimiento en otros idiomas.
- No soporta vision, audio de otros dominios ni modo de razonamiento explicito.

## Casos de uso

- **Aplicaciones educativas para estudiantes del Coran**: el modelo puede transcribir la recitacion de un estudiante y compararla con la transcripcion canonica, facilitando la correccion de la pronunciacion y el tajwid. Su ejecucion en el navegador permite una experiencia interactiva sin latencia de red.
- **Herramientas de busqueda en audio**: los predicadores o investigadores pueden buscar versiculos concretos dentro de largas grabaciones de recitaciones gracias a la transcripcion con timestamps que ofrece Whisper.
- **Aplicaciones de moviles y web para el estudio islamico**: integrable en aplicaciones de lectura del Coran que ofrecen la transcripcion sincronizada del audio, mejorando la accesibilidad para personas con discapacidad auditiva.
- **Generacion de subtitulos para videos de recitaciones**: el modelo puede transcribir audio de videos de YouTube o plataformas similares para generar subtitulos en arabe, facilitando la comprension y el estudio.
- **Sistemas de evaluacion de la recitacion**: en plataformas de ensenanza en linea, el modelo puede puntuar la precision de la recitacion comparando la transcripcion generada con el texto canonico.
- **Asistentes de voz para consultas coranicas**: permite a un usuario preguntar por un versiculo recitandolo, y el sistema lo transcribe y busca en una base de datos, todo en el lado del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `whisper-small-quran` del autor original (`bash-26alrfooh`) reporta "excelentes resultados" en su conjunto de evaluacion, pero no se especifican numeros (WER, CER) ni se comparan con otros modelos. La informacion disponible no incluye metricas cuantitativas.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo Whisper Small (~739 M parametros), en FP32 ocupa ~3 GB. Una cuantizacion INT8 reduciria el peso a ~0.7 GB, aunque no se especifica el tipo de cuantizacion del ONNX.
- **GPU recomendadas**: puede ejecutarse en GPUs de gama media como la NVIDIA GTX 1060 (6 GB) o superiores. En el navegador, se recomienda una GPU con al menos 4 GB de VRAM para una experiencia fluida.
- **Consumer GPU**: si, cabe en la mayoria de GPUs de consumo modernas (RTX 2060, RTX 3060, etc.). En CPUs, se puede ejecutar con Transformers.js, aunque la latencia sera mayor.
- **Opciones de despliegue**: Transformers.js (navegador, Node.js), ONNX Runtime Web/Node, y cualquier framework compatible con ONNX (por ejemplo, `onnxruntime-node`).
- **Latencia y throughput**: no disponible. Para un audio de 30 segundos, se espera una latencia de unos pocos segundos en GPU, y mas lenta en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| **whisper-small-quran-asr-source-ONNX** | ~739 M | 30 s audio | ar | MIT | ONNX |
| **openai/whisper-small** | ~739 M | 30 s audio | 96 idiomas | MIT | PyTorch, ONNX |
| **MaddoggProduction/whisper-small-quran-lora-dataset-mix** | ~739 M | 30 s audio | ar | no disponible | PyTorch (LoRA) |
| **wasimlhr/whisper-quran-v1** | no disponible | no disponible | ar | no disponible | no disponible |

El modelo se diferencia de `openai/whisper-small` por estar especializado en arabe coranico, lo que probablemente mejora la precision en ese dominio a costa de perder capacidad multilingue. Frente a las alternativas de afinamiento (LoRA, v1), esta version ONNX ofrece la ventaja de ser directamente ejecutable en el navegador y con licencia MIT, lo que facilita su integracion en proyectos comerciales.

## Limitaciones y advertencias

- **Especializacion en arabe coranico**: el modelo no es adecuado para transcripcion de arabe dialectal o moderno estandar fuera del contexto coranico; su rendimiento en otros idiomas es pobre o nulo.
- **Sesgos y alucinaciones**: como cualquier modelo ASR, puede alucinar palabras, especialmente en audio con ruido o con recitaciones que no se ajusten a las variantes del corpus de entrenamiento. La diacritica puede ser inconsistente en algunos casos.
- **Limitaciones de contexto**: Whisper procesa ventanas de 30 segundos de audio; para recitaciones mas largas, se debe segmentar el audio, lo que puede perder contexto entre segmentos.
- **Licencia MIT**: permite uso comercial, pero se debe mantener la atribucion. La informacion de la model card indica que los pesos provienen de un checkpoint MIT, pero el dataset de entrenamiento original no esta especificado, por lo que puede haber restricciones no declaradas.
- **Dependencia de Transformers.js**: el modelo esta pensado para Transformers.js, pero la conversion puede no estar optimizada para todos los navegadores (requiere WebGPU o WASM). En navegadores antiguos, el rendimiento puede ser pobre.

## Enlaces

- [HuggingFace - Astora1mx/whisper-small-quran-asr-source-ONNX](https://huggingface.co/Astora1mx/whisper-small-quran-asr-source-ONNX)
- [HuggingFace - Astora1mx/whisper-small-quran-asr-source (modelo base)](https://huggingface.co/Astora1mx/whisper-small-quran-asr-source)
- [HuggingFace - bash-26alrfooh/whisper-small-quran (checkpoint original)](https://huggingface.co/bash-26alrfooh/whisper-small-quran)
- [HuggingFace - MaddoggProduction/whisper-small-quran-lora-dataset-mix](https://huggingface.co/MaddoggProduction/whisper-small-quran-lora-dataset-mix)
- [HuggingFace - wasimlhr/whisper-quran-v1](https://huggingface.co/wasimlhr/whisper-quran-v1)
- [GitHub - aHishamm/QuranWhisper](https://github.com/aHishamm/QuranWhisper)
- [GitHub - MUmarJ/sherpa-onnx-models (modelos ONNX para Coran)](https://github.com/MUmarJ/sherpa-onnx-models)
- [HuggingFace Space - convert-to-onnx](https://huggingface.co/spaces/onnx-community/convert-to-onnx)
