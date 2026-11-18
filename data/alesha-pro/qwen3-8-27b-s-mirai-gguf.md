# alesha-pro/Qwen3.8-27B-S-mirai-GGUF

## Resumen

Qwen3.8-27B-S-mirai-GGUF es una conversión comunitaria a formato GGUF del checkpoint Qwen3.8-27B-S-experimental de Mirai, una versión comprimida a 2,4 bits del modelo Qwen3.8-27B de Alibaba. El trabajo lo publica el usuario alesha-pro y su aportación principal es trasladar los códigos trellis comprimidos de Mirai al contenedor GGUF sin recuantizar, bit a bit, de modo que un modelo de 27 000 millones de parámetros ocupa 11,2 GB y puede ejecutarse en una única GPU de 12 GB.

El modelo es un transformer híbrido (atención lineal DeltaNet combinada con atención clásica) con capacidades de razonamiento, uso de herramientas y visión, esta última aportada por un codificador multimodal extraído del checkpoint base original de Qwen. Incluye además un bloque MTP (multi-token prediction) para decodificación especulativa y un fichero opcional de vector de control que elimina las negativas del modelo.

Su relevancia es práctica: el formato introduce cuatro tipos ggml nuevos, por lo que llama.cpp estándar, LM Studio y Ollama no pueden cargarlo. Solo funcionan dos motores, mirai-s-ada (recomendado) y el fork llama.cpp-mirai-s del propio autor. Con 8 442 descargas y 53 likes en pocas semanas, se ha convertido en una vía realista para desplegar un modelo de 27B con contexto largo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal DeltaNet y MTP (multi-token prediction) |
| Parametros totales | 27B (aproximado; el campo de safetensors del repo indica 322.560, dato no representativo del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens con caché KV q8_0 en mirai-s-ada; 128K con q4_0 y 74K con q8_0 en el fork de referencia |
| Tipos de cuantizacion | 2,4 bits con códigos trellis (formato propietario, 4 tipos ggml nuevos); bloque MTP en Q8_0; embeddings en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (11,2 GB el modelo; 0,93 GB el codificador de visión; 1,3 MB el vector de control) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido: combina capas de atención lineal DeltaNet con capas de atención tradicional, lo que reduce el coste de memoria del contexto largo. Incorpora un bloque MTP que permite decodificación especulativa con borrador interno, y el checkpoint de Mirai aplica una compresión agresiva a 2,4 bits mediante códigos trellis, sin recuantización posterior en la conversión a GGUF. El codificador de visión no viene en el checkpoint de Mirai (solo incluye el modelo de lenguaje) y se toma del Qwen/Qwen3.8-27B original en F16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. El modelo base parece derivar de Qwen3.8-27B, pero los detalles de entrenamiento no están documentados en la model card. La innovación técnica destacable es doble: la compresión trellis a 2,4 bits que mantiene un 27B en 11,2 GB, y la decodificación especulativa MTP integrada en el propio GGUF.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto; acepta `reasoning_effort` con valores `low`, `medium` y `xhigh`, y se puede desactivar con `enable_thinking: false`.
- Capacidades de visión mediante el codificador mmproj extraído del Qwen3.8-27B base; el encoder puede ejecutarse en CPU sin consumir VRAM.
- Soporte de tool calling y function calling a través de la plantilla de chat Qwen3.8 y el flag `--jinja` del servidor.
- Razonamiento multi-paso y uso en agentes, favorecido por el contexto largo (hasta 262K tokens).
- Decodificación especulativa MTP para acelerar la generación en GPUs de 16 GB o más.
- Eliminación opcional de negativas mediante un vector de control en modo proyección (fichero de 1,3 MB).
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Asistente de código en local: con 128K de contexto y tool calling, el modelo puede indexar un repositorio mediano y responder consultas sobre él dentro de una GPU de 12 GB, sin depender de APIs externas.
- Análisis de documentos largos: los 262.144 tokens de contexto en mirai-s-ada permiten procesar informes, contratos o expedientes completos en una sola pasada, con la caché KV repartida entre VRAM y RAM del sistema.
- Agentes autónomos multi-paso: el modo de razonamiento configurable (`reasoning_effort`) y el soporte de herramientas lo hacen adecuado para pipelines de agentes que encadenan búsquedas, ejecuciones y verificaciones.
- Procesamiento de imágenes en local: con el codificador mmproj se pueden hacer tareas de descripción, extracción de datos de capturas o preguntas sobre diagramas sin enviar imágenes a servicios externos.
- Despliegue en estaciones de trabajo con RTX 4070 o 3090: el rendimiento medido (76,6 tok/s en 4070 con mirai-s-ada y 40 tok/s en 3090 con el fork) permite uso interactivo en producción interna.
- Investigación sobre alineación y negativas: el vector de control de negativas permite estudiar el comportamiento del modelo con y sin rechazos sin reentrenar, útil en experiments de interpretabilidad.
- Prototipado de chatbots con contexto largo: la combinación de contexto extendido y velocidad de decodificación razonable facilita iterar sobre conversaciones multi-turno extensas en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son medidas de velocidad de decodificación:

| Motor | GPU | Contexto | Decodificación |
|---|---|---|---|
| mirai-s-ada | RTX 4070 12 GB | chat nuevo | 76,6 tok/s |
| mirai-s-ada | RTX 4070 12 GB | 60K | 61,7 tok/s |
| llama.cpp-mirai-s | RTX 3090 | chat nuevo | 40 tok/s |
| llama.cpp-mirai-s | RTX 3090 | 62K | 34,6 tok/s |

## Requisitos de hardware

- VRAM estimada: 11,2 GB de fichero, de los cuales 7,8 GB van a la GPU y 2,5 GB de embeddings F16 permanecen en RAM del sistema; el codificador de visión (0,93 GB) puede ejecutarse en CPU sin VRAM.
- GPU recomendadas: RTX 4070 12 GB (con mirai-s-ada), RTX 3090 12 GB limitada, RTX 4090 y superiores para más contexto o MTP.
- Cabe en GPU de consumo de 12 GB; para MTP especulativo se necesitan al menos 16 GB.
- Opciones de despliegue: mirai-s-ada (Windows bundle y Linux desde fuente, recomendado) y llama.cpp-mirai-s (fork de referencia, Linux desde fuente). llama.cpp estándar, LM Studio y Ollama no cargan el formato.
- Latencia y throughput: 76,6 tok/s en RTX 4070 con mirai-s-ada en chat nuevo y 61,7 tok/s a 60K de contexto; 40 tok/s y 34,6 tok/s respectivamente en RTX 3090 con el fork.
- Nota de configuración: `-np 1` es importante en este modelo híbrido, ya que cada slot del servidor mantiene su propio estado DeltaNet y el número por defecto de slots añade unos 450 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-S-mirai-GGUF | 27B | hasta 262K | 2,4 bits trellis | Apache 2.0 | GGUF en HF, solo 2 motores |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | F16/BF16 estándar | no disponible | HF, ecosistema estándar |
| trymirai/Qwen3.8-27B-S-experimental | 27B | no disponible | 2,4 bits trellis | no disponible | HF, checkpoint original |

La ventaja frente al modelo base es el tamaño (11,2 GB frente a decenas de GB en F16) y la posibilidad de ejecutarlo en 12 GB de VRAM. La desventaja es la compatibilidad: requiere motores modificados y no funciona en el ecosistema estándar de llama.cpp.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato añade cuatro tipos ggml nuevos y no carga en llama.cpp estándar, LM Studio ni Ollama; solo funciona con mirai-s-ada o llama.cpp-mirai-s.
- Es una conversión comunitaria, no una versión oficial de Mirai ni de Qwen.
- La compresión a 2,4 bits puede degradar la calidad frente al modelo en F16 o BF16; no se han publicado benchmarks que cuantifiquen esa pérdida.
- El vector de control para eliminar negativas es opcional y altera el comportamiento de seguridad del modelo; su uso en producción requiere evaluación propia.
- Los idiomas soportados no están documentados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluaciones publicadas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B original, no indicada en la información proporcionada.
- El contexto máximo de 262K depende del motor y de la configuración de la caché KV; en el fork de referencia baja a 128K o 74K según el tipo de caché.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alesha-pro/Qwen3.8-27B-S-mirai-GGUF
- Modelo base (Mirai): https://huggingface.co/trymirai/Qwen3.8-27B-S-experimental
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor recomendado mirai-s-ada: https://github.com/professorpalmer/mirai-s-ada
- Releases de mirai-s-ada: https://github.com/professorpalmer/mirai-s-ada/releases
- Fork de referencia llama.cpp-mirai-s: https://github.com/alesha-pro/llama.cpp-mirai-s
