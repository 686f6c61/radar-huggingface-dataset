# Abhi-0112/bubble-hinglish-swift-ggml

## Resumen

`Abhi-0112/bubble-hinglish-swift-ggml` es una conversión de formato del modelo de reconocimiento automático de voz (ASR) `Oriserve/Whisper-Hindi2Hinglish-Swift` al formato GGML que carga `whisper.cpp`. No se trata de un modelo entrenado desde cero ni de un fine-tune nuevo: los pesos son idénticos a los del modelo original de Oriserve, salvo la conversión a float16 que aplica el propio conversor de whisper.cpp. El autor de la conversión es el usuario de Hugging Face Abhi-0112, y el modelo se usa en la aplicación de escritorio Bubble para dictado por voz sin conexión en inglés, hindi e hinglish (hindi escrito con caracteres latinos).

El modelo resuelve un problema muy concreto: permitir la transcripción de habla hinglish (code-switching hindi-inglés) en entornos sin GPU y sin conexión, gracias al formato GGML, que habilita la inferencia en CPU con `whisper.cpp`. Su relevancia es práctica más que investigadora: es un artefacto de despliegue que empaqueta un modelo especializado en una variante de Whisper base (unos 74 millones de parámetros) en un único fichero de aproximadamente 148 MB.

La ficha se basa únicamente en la información disponible en la model card y en los metadatos de Hugging Face. No hay datos publicados de benchmarks, composición del dataset de entrenamiento ni detalles del proceso de fine-tune original, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base de OpenAI), conversión a GGML |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base es Whisper base, ~74 M, dato no confirmado en la card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de 30 s propia de Whisper, no confirmado en la card) |
| Tipos de cuantizacion | Solo float16 para pesos 2-D; float32 para biases, norms y positional embeddings |
| Idiomas soportados | Hindi (hi), ingles (en); salida romanizada en hinglish si se usa `-l en` |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (fichero `ggml-hindi2hinglish-swift-f16.bin`, 147.951.465 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper base de OpenAI (transformer encoder-decoder para ASR), sobre la que Oriserve entrenó su variante Hindi2Hinglish-Swift. Esta ficha corresponde exclusivamente a la conversión de formato: el autor indica que los pesos no cambian respecto al modelo original, salvo la conversión a float16 que realiza el conversor de whisper.cpp. La conversión se hizo con un port en numpy de `models/convert-h5-to-ggml.py`, manteniendo el mismo mapeo de tensores, con pesos 2-D en float16 y biases, norms y embeddings posicionales en float32. Los filtros mel provienen de `mel_filters.npz` de openai/whisper (MIT).

No se dispone de información sobre el número de horas de audio, la composición del dataset, el uso de técnicas de aumento de datos ni si hubo RLHF u otras etapas de alineación en el entrenamiento original de Oriserve. La card solo documenta el proceso de conversión, no el de entrenamiento.

## Capacidades

- Reconocimiento automático de voz (ASR) en hindi, inglés e hinglish.
- Transcripción de habla con code-switching hindi-inglés, con salida en caracteres latinos (romanización) cuando se configura el idioma como `en`, tal como recomienda Oriserve.
- Inferencia offline en CPU mediante `whisper.cpp`, sin necesidad de GPU ni de servicios en la nube.
- Integración en aplicaciones de escritorio: es el motor de dictado por voz de la app Bubble.
- Ejecución mediante CLI (`whisper-cli`) con ficheros WAV como entrada.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Dictado por voz offline en aplicaciones de escritorio: el modelo se integra en la app Bubble para transcribir voz a texto sin conexión, aprovechando el formato GGML y su tamaño reducido (~148 MB) para distribuirse con la aplicación.
- Transcripción de reuniones y notas en hinglish: usuarios que alternan hindi e inglés en una misma frase obtienen texto romanizado directamente, sin necesidad de posprocesar la transliteración.
- Subtitulado de contenido audiovisual en hindi/inglés: con `whisper-cli` sobre ficheros WAV se pueden generar transcripciones para vídeos o pódcasts en entornos sin GPU.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU con whisper.cpp, permite transcribir colas de audio en máquinas modestas o contenedores sin acelerador.
- Prototipado e investigación en ASR multilingüe: sirve como punto de partida reproducible para evaluar el comportamiento de Whisper fine-tuneado en hinglish en pipelines de whisper.cpp.
- Aplicaciones de accesibilidad: dictado local para usuarios que necesitan entrada por voz en hindi o inglés sin enviar audio a servicios externos, lo que reduce exposición de datos.
- Integración en herramientas de línea de comandos y scripts: el binario `whisper-cli` permite encadenar transcripciones en flujos de shell para automatizar tareas de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU con whisper.cpp; el fichero GGML ocupa unos 148 MB, por lo que la memoria RAM necesaria es del orden de unos cientos de MB (no confirmado en la card).
- GPU recomendadas: no se especifican; el formato GGML está pensado para ejecución en CPU. No hay datos de soporte GPU documentados en la card.
- Cabe en cualquier equipo de consumo: el tamaño del fichero (~148 MB) permite ejecutarlo en portátiles y equipos de gama baja.
- Opciones de despliegue: `whisper.cpp` (CLI `whisper-cli` y biblioteca). No se documentan otros runners como vLLM, TGI, llama.cpp u Ollama, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Abhi-0112/bubble-hinglish-swift-ggml | No disponible (base Whisper base, ~74 M no confirmado) | No disponible (ventana Whisper de 30 s, no confirmado) | hi, en (hinglish romanizado) | Apache 2.0 | GGML f16 |
| Oriserve/Whisper-Hindi2Hinglish-Swift | No disponible | No disponible | hi, en | No disponible en la informacion proporcionada | safetensors |
| openai/whisper-base | ~74 M (dato externo no confirmado en la card) | Ventana de 30 s (dato externo no confirmado) | Multilingue | MIT | safetensors, GGML via conversión |

La comparativa se limita a estos tres porque la información proporcionada solo menciona el modelo original de Oriserve y el Whisper base de OpenAI como origen. No hay datos de rendimiento comparativo publicados en la información disponible.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier limitación del modelo original de Oriserve se hereda sin cambios.
- No hay benchmarks publicados que permitan estimar la calidad de transcripción en hinglish ni compararla con alternativas.
- La card recomienda usar `-l en` para obtener salida romanizada; usar otro ajuste de idioma puede degradar la transcripción o producir salida en devanagari, según se desprende de las instrucciones del autor.
- El modelo está especializado en hindi, inglés e hinglish; no se documenta soporte para otros idiomas.
- Riesgo de alucinación y errores de transcripción propio de los modelos Whisper, especialmente en audio con ruido o acentos no representados en el entrenamiento; no cuantificado en la información disponible.
- No se documentan sesgos específicos del fine-tune; al derivar de Whisper base, pueden persistir sesgos del modelo original.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y la atribución a Oriserve (entrenamiento), a OpenAI Whisper (modelo base, MIT) y al autor de la conversión.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica un uso muy limitado y poca validación comunitaria.
- La fecha de creación indicada en los metadatos (2026-11-06) es futura respecto a la información habitual disponible; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abhi-0112/bubble-hinglish-swift-ggml
- Modelo original: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Swift
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelo base de OpenAI Whisper: https://huggingface.co/openai/whisper-base
- Búsqueda de modelos GGML en Hugging Face: https://huggingface.co/models?search=ggml
