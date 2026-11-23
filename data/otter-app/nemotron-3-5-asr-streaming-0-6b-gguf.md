# otter-app/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

`otter-app/nemotron-3.5-asr-streaming-0.6b-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicada por el desarrollador `otter-app` como artefacto de descarga bajo demanda para su aplicación de escritorio Otter. No se trata de un modelo nuevo ni de un ajuste fino: es una copia sin modificaciones del GGUF ya publicado por `vibe-app`, empaquetada para consumo directo desde la aplicación.

El modelo base pertenece a la familia Nemotron de NVIDIA y está diseñado específicamente para transcripción en streaming, con aproximadamente 638 millones de parámetros (637.991.968 según los pesos en safetensors). Su tamaño contenido lo hace apto para inferencia en CPU y en GPUs de consumo, lo que explica el interés en una distribución cuantizada en GGUF mediante la librería ggml.

La relevancia de esta ficha es doble: por un lado, documenta un modelo ASR pequeño y orientado a streaming; por otro, advierte de que el repositorio es un artefacto de distribución de una aplicación concreta, con cero descargas y cero likes en el momento de la consulta, y con una licencia `openmdw-1.1` que conviene revisar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de la familia Nemotron; la model card no detalla la arquitectura interna) |
| Parametros totales | 637.991.968 (~0,64 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se referencia explícitamente el archivo Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como `license: other` en Hugging Face) |
| Formato de pesos | GGUF (librería ggml); el modelo base upstream se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Lo que sí se puede afirmar es que se trata de un modelo de reconocimiento automático del habla orientado a streaming, con unos 638 millones de parámetros, y que la versión de este repositorio es una conversión a GGUF mediante ggml, sin cambios en los pesos respecto al modelo original de NVIDIA. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineación.

La innovación técnica destacable, según el propio nombre del modelo, es la capacidad de transcripción en streaming: el modelo está pensado para procesar audio de forma incremental en lugar de exigir la señal completa antes de emitir texto. El repositorio incluye el hash SHA-256 del archivo `nemotron-3.5-asr-streaming-0.6b-Q4_K_M.gguf` (`41c99fa5fb6f3d35f68e79adc3e755eca2232a8d921178bd647b71194792b8fd`), lo que permite verificar la integridad de la descarga. No se documentan detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, tarea principal del modelo.
- Procesamiento en streaming: el diseño del modelo base apunta a transcripción incremental, adecuada para audio en tiempo real.
- Inferencia en formato GGUF: compatible con el ecosistema ggml, lo que permite ejecución en CPU y GPU sin necesidad de frameworks de deep learning pesados.
- Verificación de integridad: el repositorio publica el hash SHA-256 del archivo cuantizado Q4_K_M.
- Capacidades de tool calling, agentes, visión, audio generativo, modo thinking o multilingüismo explícito: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción en tiempo real en aplicaciones de escritorio: la aplicación Otter descarga este GGUF bajo demanda para ofrecer dictado o subtitulado local, aprovechando el tamaño reducido del modelo (unos 0,5 GB de repositorio) y su orientación a streaming.
- Subtitulado de reuniones y videollamadas: el modelo puede procesar el audio de forma incremental y emitir texto conforme se habla, lo que encaja con la generación de subtítulos en directo sin esperar al final de la intervención.
- Notas de voz a texto en local: con 638 M de parámetros y cuantización Q4_K_M, es viable ejecutarlo en portátiles sin GPU dedicada, lo que permite transcribir grabaciones sin enviar audio a servicios en la nube.
- Asistentes de voz integrados en herramientas de productividad: la transcripción en streaming alimenta pipelines posteriores (resumen, búsqueda, comandos) con baja latencia al no requerir una GPU de datacenter.
- Prototipado e investigación en ASR: al ser un GGUF ligero, sirve como base para experimentar con decodificación, segmentación de audio y comparación de cuantizaciones en entornos con recursos limitados.
- Procesamiento por lotes de audio de corta duración en CPU: para volúmenes moderados de ficheros, la ejecución vía ggml evita el coste de infraestructura GPU, aunque el throughput no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa una fracción del repositorio de 0,5 GB, por lo que la inferencia cuantizada requiere del orden de 1 GB o menos de memoria; no se dispone de cifras oficiales de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 2 GB de VRAM debería poder alojar el modelo cuantizado, pero no hay validación oficial.
- GPU de consumo: el tamaño (0,64 B de parámetros) sugiere que cabe en GPUs de consumo e incluso en CPU, aunque no se documentan requisitos mínimos ni rendimiento medido.
- Opciones de despliegue: el formato GGUF es compatible con el ecosistema ggml; la model card solo menciona su uso desde la aplicación Otter. No se confirma soporte explícito de llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| otter-app/nemotron-3.5-asr-streaming-0.6b-gguf | ~0,64 B | no disponible | GGUF | openmdw-1.1 | Copia del GGUF de vibe-app; artefacto de la app Otter |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,64 B | no disponible | safetensors | openmdw-1.1 | Modelo base upstream de NVIDIA |
| vibe-app/nemotron-3.5-asr-streaming-0.6b-gguf | ~0,64 B | no disponible | GGUF | openmdw-1.1 | Conversión original a GGUF de la que deriva este repositorio |

No se dispone de información sobre otros modelos ASR comparables (por ejemplo, de la familia Whisper) en la documentación proporcionada, por lo que no se incluyen cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Este repositorio no es un modelo original: es una copia sin modificaciones de otro GGUF (`vibe-app/...`), a su vez derivado de `nvidia/nemotron-3.5-asr-streaming-0.6b`. Cualquier problema del modelo base se hereda.
- La model card es mínima y remite a la del modelo upstream; no documenta idiomas, contexto, arquitectura ni datos de entrenamiento.
- Licencia `openmdw-1.1` etiquetada como `license: other`: es imprescindible revisar los términos del upstream antes de uso comercial, ya que la ficha no aclara restricciones.
- Riesgo de alucinación y errores de transcripción: inherente a los modelos ASR, especialmente con audio ruidoso, acentos no vistos en entrenamiento o vocabulario técnico; no hay datos de tasas de error (WER) publicados.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe ni el rendimiento en castellano.
- Sin métricas de latencia ni throughput: no se puede evaluar su idoneidad para streaming estricto en producción sin pruebas propias.
- Repositorio con cero descargas y creado recientemente: sin validación comunitaria; conviene verificar el hash SHA-256 publicado antes de usarlo.
- El soporte de herramientas de despliegue (llama.cpp, Ollama, etc.) no está confirmado en la documentación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/otter-app/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- GGUF original del que deriva: https://huggingface.co/vibe-app/nemotron-3.5-asr-streaming-0.6b-gguf
- Aplicación Otter (repositorio): https://github.com/victorfu/otter
