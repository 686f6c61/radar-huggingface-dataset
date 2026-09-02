# JONNYVERSE/whisper-base

## Resumen

JONNYVERSE/whisper-base es una conversión a pesos ONNX del modelo de reconocimiento automático del habla (ASR) openai/whisper-base, preparada específicamente para ser compatible con la librería Transformers.js de Hugging Face. El objetivo es permitir la ejecución de transcripción de voz directamente en el navegador o en entornos Node.js, sin necesidad de un backend dedicado. El modelo original, whisper-base, es un transformer encoder-decoder de 74 millones de parámetros entrenado por OpenAI sobre 680 000 horas de audio etiquetado de forma supervisada débil, capaz de realizar reconocimiento multilingüe, traducción de voz e identificación de idioma sin ajuste fino previo.

Esta ficha resulta relevante para desarrolladores que buscan integrar ASR en aplicaciones web o de escritorio con JavaScript, aprovechando la optimización ONNX y el ecosistema Transformers.js. La conversión mantiene la licencia Apache 2.0, lo que facilita su uso comercial, y el repositorio incluye los pesos en formato ONNX listos para cargar con la librería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 74 millones (según documentación de OpenAI) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (pesos ONNX sin cuantizar) |
| Idiomas soportados | no disponibles en la model card (el modelo base soporta múltiples idiomas según OpenAI) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de openai/whisper-base a formato ONNX, realizada por el autor JONNYVERSE, con el fin de que sea cargable desde Transformers.js. No introduce cambios en la arquitectura original: se trata de un transformer encoder-decoder con atención de escala logarítmica en el encoder y decodificación autorregresiva, entrenado por OpenAI con 680 000 horas de audio etiquetado mediante supervisión débil a gran escala. El entrenamiento incluye tareas de reconocimiento de voz, traducción de voz y detección de idioma, lo que le confiere una buena generalización a dominios y datasets diversos sin necesidad de ajuste fino.

La conversión a ONNX se realiza siguiendo las recomendaciones de Hugging Face, colocando los pesos en una subcarpeta `onnx` y usando la herramienta Optimum. No se documentan innovaciones adicionales en el proceso de conversión ni se menciona cuantización.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe: transcribe audio en múltiples idiomas sin configuración adicional.
- Traducción de voz: puede traducir audio de un idioma a otro (típicamente a inglés), según las capacidades del modelo base.
- Identificación de idioma: el modelo original puede detectar el idioma hablado en el audio.
- Robustez a dominios variados: entrenado con datos diversos, generaliza bien a acentos, ruido y condiciones de grabación distintas.
- Compatibilidad con Transformers.js: ejecutable en navegador (WebAssembly/WebGPU) o Node.js mediante la librería JavaScript.
- No incluye soporte de tool calling ni capacidades de agente, al ser exclusivamente un modelo de audio.

## Casos de uso

- Transcripción en tiempo real en el navegador: integrar el modelo en una aplicación web para convertir voz a texto sin enviar audio a un servidor, preservando la privacidad y reduciendo latencia. Se usa con `pipeline('automatic-speech-recognition', ...)` de Transformers.js.
- Subtitulado automático de vídeos: procesar pistas de audio de vídeos cargados localmente o desde URLs para generar subtítulos en varios idiomas, aprovechando la capacidad multilingüe del modelo base.
- Asistentes de voz en aplicaciones de escritorio basadas en Electron: usar los pesos ONNX en Node.js para transcribir comandos de voz y activar acciones en la interfaz.
- Accesibilidad para personas con discapacidad auditiva: convertir reuniones o conferencias en texto en tiempo real dentro de herramientas colaborativas web, con ejecución local para evitar dependencias externas.
- Análisis de llamadas y atención al cliente: transcribir grabaciones de llamadas en entornos Node.js para su posterior análisis de sentimiento o búsqueda de palabras clave, gracias a la licencia Apache 2.0 que permite uso comercial.
- Prototipado rápido de aplicaciones de voz: al ser un modelo pequeño (74M) y con pesos ONNX, es adecuado para pruebas y demos en entornos con recursos limitados, como Raspberry Pi o dispositivos móviles via WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de WER ni comparativas con otros modelos. Los datos sobre el rendimiento del modelo base (whisper-base) están disponibles en la documentación de OpenAI, pero no se reproducen aquí al no formar parte de la información proporcionada.

## Requisitos de hardware

- Los pesos ONNX ocupan aproximadamente 3.0 GB en disco (tamaño del repositorio), lo que sugiere que en memoria ocuparán un valor similar o superior según el formato de precisión (probablemente FP32).
- Al ser un modelo de 74M de parámetros, puede ejecutarse en CPU con razonable velocidad para audio corto, pero para uso en tiempo real se recomienda GPU con al menos 4 GB de VRAM si se usa en backend.
- En navegador, Transformers.js puede usar WebGPU si está disponible, reduciendo la carga sobre la CPU; de lo contrario, cae a WebAssembly (WASM) con rendimiento aceptable para clips breves.
- GPU recomendadas: cualquier GPU moderna con soporte WebGPU (por ejemplo, integradas Intel, AMD o NVIDIA) para uso en navegador; en servidores, una NVIDIA T4 o superior es suficiente.
- Opciones de despliegue: Transformers.js (JavaScript), ONNX Runtime (Python o C++), o cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JONNYVERSE/whisper-base (ONNX) | 74M | no disponible | ONNX | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74M | 30 s de audio (según OpenAI) | PyTorch | MIT | Hugging Face |
| openai/whisper-tiny | 39M | 30 s de audio | PyTorch | MIT | Hugging Face |
| openai/whisper-small | 244M | 30 s de audio | PyTorch | MIT | Hugging Face |

La comparativa se basa en el modelo original de OpenAI; la conversión ONNX no altera la arquitectura ni los parámetros. La principal diferencia es el formato de pesos y el ecosistema de ejecución (JavaScript vs. Python).

## Limitaciones y advertencias

- No se especifican los idiomas soportados en la model card; aunque el modelo base de OpenAI soporta 99 idiomas, esta conversión no garantiza el mismo comportamiento si no se han incluido los archivos de vocabulario adecuados.
- El modelo puede presentar alucinaciones en la transcripción, especialmente en audio con mucho ruido o habla solapada, como es común en los modelos Whisper.
- La conversión ONNX no incluye cuantización, por lo que el tamaño de 3 GB puede ser elevado para aplicaciones web con requisitos de carga rápida; se recomienda considerar cuantización adicional si se despliega en el navegador.
- La licencia Apache 2.0 permite uso comercial, pero hay que verificar que los pesos convertidos no incorporan restricciones adicionales del autor; la model card no menciona ninguna.
- El modelo no está diseñado para tareas de generación de texto general ni razonamiento; es exclusivamente para audio.
- No se dispone de información sobre el proceso de conversión (versión de Optimum, precisión de los pesos, etc.), lo que puede afectar a la reproducibilidad.
- La fecha de creación (2026-09-02) es futura, lo que sugiere que puede tratarse de un error de metadatos o de una fecha no verificada; no afecta al contenido técnico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JONNYVERSE/whisper-base
- Modelo original openai/whisper-base: https://huggingface.co/openai/whisper-base
- Modelo openai/whisper-base.en: https://huggingface.co/openai/whisper-base.en
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Herramienta Optimum para conversión ONNX: https://huggingface.co/docs/optimum/index
