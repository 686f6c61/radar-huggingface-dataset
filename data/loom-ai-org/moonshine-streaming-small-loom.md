# loom-ai-org/moonshine-streaming-small-loom

## Resumen

Moonshine Streaming Small es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado originalmente por Useful Sensors, con 123 millones de parametros. Esta ficha corresponde a la exportacion `loom-ai-org/moonshine-streaming-small-loom`, que empaqueta los pesos originales sin modificaciones en un unico fichero GGUF autodescriptivo para el runtime loom.cpp. La arquitectura combina un encoder de ventana deslizante sobre la forma de onda cruda con un decoder autoregresivo, lo que permite procesar audio en streaming a medida que llega.

La relevancia de esta exportacion radica en el formato: un GGUF que transporta sus propias topologias de grafo, tokenizer y driver de inferencia, gestionado por `loom-py-rt`. Esto simplifica el despliegue de ASR ligero en entornos donde no se quiere arrastrar un stack completo de transformers, y el tamano de 123 M lo hace apto para dispositivos con recursos limitados.

Es importante distinguir este proyecto del servicio comercial Loom (grabacion de pantalla): no existe relacion entre ambos. El nombre "loom" aqui designa la familia de herramientas de loom-ai-org (loom.cpp, loom-exporter, loom-py).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: encoder de ventana deslizante sobre forma de onda cruda + decoder autoregresivo |
| Parametros totales | 123.359.073 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; limite operativo de 81,9 s por llamada (4096 filas de posicion a 50 por segundo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (`moonshine-streaming-small.gguf`) |
| Modelo base | moonshine-ai/moonshine-streaming-small |
| Libreria | loom-py-rt |
| Entrada de audio | mono, 16 kHz |
| Tamano del repo | 1,5 GB |
| Descargas | 19 |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El encoder opera directamente sobre la forma de onda cruda mediante una ventana deslizante, evitando el preprocesado clasico de features acusticas. El decoder es autoregresivo y genera la transcripcion token a token con decodificacion greedy. La tabla de posiciones del decoder dispone de 4096 filas de encoder a razon de 50 por segundo, lo que fija el techo de 81,9 segundos por llamada.

No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card del export indica que la decodificacion esta limitada a 6,5 tokens por segundo de audio "para evitar bucles de alucinacion". Esta exportacion no ejecuta el encoder de forma incremental: procesa el clip completo en una pasada, pese a que el modelo base este disenado para streaming.

## Capacidades

- Transcripcion de voz a texto en ingles sobre audio mono a 16 kHz.
- Procesamiento por ventana deslizante en el encoder, heredado del modelo base.
- Interfaz de streaming en `loom-py`: `stream.push()` devuelve actualizaciones incrementales y `stream.finish()` cierra la decodificacion; el flag `update.revised` indica si texto previo se ha revisado.
- Salida con marcas de tiempo: `timestamps=True` devuelve `segments`, aunque al no emitir tokens de timestamp el resultado es un unico tramo que cubre el clip completo y `result.timestamped` vale `False`.
- Acceso de bajo nivel via `model.infer(...)`, que pasa argumentos directamente al driver embebido en el GGUF (`model.driver_source` documenta los parametros aceptados).
- No soporta seleccion de idioma: no acepta argumento `language=` (se ignora con aviso).
- No dispone de tool calling, function calling, vision, audio generation ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones y notas de voz: clips de hasta 81,9 s se transcriben en una sola llamada; para grabaciones largas se segmenta por pausas y se procesa por partes.
- Subtitulado de contenido en ingles: la salida en streaming permite ir mostrando texto a medida que llega audio de microfono, con actualizaciones incrementales.
- Dictado en aplicaciones de escritorio: el tamano de 123 M y el formato GGUF permiten integrarlo en clientes locales sin depender de servicios en nube.
- Preprocesado de audio para pipelines de NLU: convertir comandos de voz en texto antes de pasarlos a un clasificador o a un LLM.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones cortas segmentadas con un VAD como `silero-vad-loom`.
- Prototipado de interfaces de voz en tiempo real: la API `stream.push()` facilita experimentar con latencia y revision de texto sin montar infraestructura de serving compleja.
- Sistemas embebidos y edge computing: al no requerir un stack de transformers y caber en 1,5 GB de repo, es viable en equipos con recursos moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; con 123 M de parametros, la inferencia en FP32 ronda aproximadamente 0,5 GB y en FP16 unos 0,25 GB, mas overhead del runtime y buffers de audio (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas en la informacion proporcionada; por tamano, cualquier GPU consumer moderna deberia ser suficiente.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo; no hay confirmacion oficial de modelos concretos.
- Opciones de despliegue: runtime `loom.cpp` mediante `loom-py-rt` (`pip install -U "loom-py-rt[hub]>=1.0.0"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| moonshine-streaming-small-loom | 123 M | 81,9 s por llamada | en | MIT | GGUF (loom.cpp) |
| moonshine-ai/moonshine-streaming-small | 123 M (mismos pesos) | mismo limite del modelo base | en | MIT | pesos originales |
| Whisper small (referencia de categoria) | ~244 M | 30 s por ventana | multilingue | MIT | safetensors, GGUF, etc. |

Los datos de Whisper small se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento publicadas entre ambos en la informacion proporcionada. La ventaja diferencial de esta exportacion frente al modelo base es el empaquetado GGUF autodescriptivo y la API de streaming de loom-py.

## Limitaciones y advertencias

- Limite estricto de 81,9 s por llamada: clips mas largos se rechazan con error en lugar de truncarse; hay que segmentar por pausas con un VAD.
- Solo ingles: no admite seleccion de idioma y cualquier argumento `language=` se ignora.
- Entrada exclusivamente mono a 16 kHz.
- No emite tokens de timestamp: `segments` es un unico tramo del clip completo y `result.timestamped` es `False`; no tratar start/end como fronteras elegidas por el modelo.
- Decodificacion greedy limitada a 6,5 tokens por segundo de audio; clips de menos de unos 0,3 s no devuelven texto.
- Riesgo de repeticiones o palabras inventadas en audio ruidoso o muy corto, comportamiento comun en reconocedores encoder-decoder.
- Esta exportacion no ejecuta el encoder de forma incremental: el streaming de la API entrega actualizaciones, pero el procesamiento subyacente es por pasada completa del clip.
- No se documentan sesgos especificos; al entrenarse solo en ingles, el rendimiento en acentos no representados en el dataset original es desconocido.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias del runtime.
- El nombre "loom" no guarda relacion con el servicio comercial Loom de grabacion de pantalla; evitar confusion en busquedas y documentacion.
- Repo con muy pocas descargas (19) y sin likes: ecosistema de validacion limitado, sin garantias de mantenimiento.

## Enlaces

- Hugging Face (esta exportacion): https://huggingface.co/loom-ai-org/moonshine-streaming-small-loom
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-small
- loom.cpp: https://github.com/loom-ai-org/loom.cpp
- loom-exporter: https://github.com/loom-ai-org/loom-exporter
- loom-py: https://github.com/loom-ai-org/loom-py
- Paquete PyPI: https://pypi.org/project/loom-py-rt/
