# haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit-vision

## Resumen

Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit-vision es un artefacto de despliegue derivado de Qwen/Qwen3.8-Flash-Next, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con capacidad de vision (pipeline image-text-to-text). No es un checkpoint de Transformers, sino un paquete en formato propietario `.finch` disenado para el motor de inferencia out-of-core FinchMoE, orientado a aplicaciones de macOS e iOS. Lo publica el autor haihengh, creador del motor FinchMoE, y su proposito es permitir ejecutar un modelo de gran tamano con los expertos enrutados cuantizados a 4 bits y almacenados fuera de memoria, manteniendo la torre de vision del modelo original.

El modelo base es un MoE de 125B parametros (segun el nombre del checkpoint) con atencion lineal, expertos compartidos y una tabla PLE (probablemente positional/lookup embedding) cuantizada a int4. Este repositorio concreto empaqueta los pesos residentes (atencion, expertos compartidos, router) a 4-8 bits y los expertos enrutados a 4 bits afines con grupo 64, ademas de copiar byte a byte la torre de vision BF16 (333 tensores, 856,3 MiB). El resultado ocupa 104,9 GB (97,70 GiB) y esta pensado para ejecutarse en hardware Apple con el motor FinchMoE, no en GPUs convencionales mediante vLLM o llama.cpp.

Su relevancia es limitada pero especifica: demuestra una via para llevar modelos MoE de gran escala a equipos de consumo Apple mediante cuantizacion agresiva y carga selectiva de expertos, e incorpora vision sin reentrenar. La licencia es la Qwen Community License 1.0, con restricciones de uso comercial que deben revisarse antes de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal, expertos compartidos y tabla PLE; torre de vision incluida |
| Parametros totales | 125B (segun nombre del checkpoint; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Texto: atencion y expertos compartidos a 4 bits, atencion lineal y router a 8 bits, tabla PLE int4 grupo 32, expertos enrutados 4 bits afines grupo 64 con escalas/sesgos BF16; vision: BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (other) |
| Formato de pesos | Finch `.finch` (manifest + pesos residentes + expertos empaquetados + tokenizer + vision); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura Mixture-of-Experts con atencion lineal, expertos compartidos y una tabla PLE. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; solo indica que la "abliteration", cuando aplica, se realizo upstream en Qwen/Qwen3.8-Flash-Next. Este artefacto no modifica los pesos en terminos de entrenamiento: solo cambia el contenedor, la cuantizacion y anade la carga util de vision.

La innovacion tecnica principal es el formato FinchMoE: los expertos enrutados (512 por capa, 48 capas, stride de 2.768.896 bytes) se almacenan en un pool de 68.048.388.096 bytes (63,38 GiB) y se cargan selectivamente desde disco, mientras los pesos residentes (3.877.265.688 bytes) permanecen en memoria. La torre de vision se copia byte a byte desde el modelo fuente (333 tensores BF16, 856,3 MiB) y solo se mapea durante la codificacion de imagenes. El manifiesto incluye SHA-256 y un recibo de verificacion `verified-install.json`.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de gran escala; el artefacto conserva sus pesos de texto con la misma receta que el hermano solo-texto.
- Capacidad de vision: pipeline image-text-to-text; la torre visual permite procesar imagenes en turnos multimodales.
- Tool calling / function calling: no documentado en la model card; no disponible.
- Agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingues: no documentadas; no disponible.
- Modo thinking: no documentado; no disponible.
- Procesamiento de video: existe `video_preprocessor_config.json` en la carga util de vision, lo que sugiere soporte de entrada de video, aunque no se detalla su alcance.

## Casos de uso

- Inferencia local en macOS/iOS con modelos de gran escala: el motor FinchMoE carga los expertos enrutados desde disco, permitiendo ejecutar un MoE de 125B en equipos Apple con memoria unificada limitada, a costa de latencia de E/S.
- Asistentes multimodales de escritorio: la torre de vision permite responder preguntas sobre imagenes capturadas localmente, con los pesos de texto cuantizados a 4 bits para reducir el espacio residente.
- Prototipado de pipelines image-text-to-text sin GPU: util para desarrolladores que quieran evaluar el comportamiento multimodal del modelo base en hardware Apple antes de desplegarlo en infraestructura mayor.
- Investigacion sobre cuantizacion MoE: el artefacto sirve para estudiar el impacto de 4 bits en expertos enrutados (grupo 64) frente a 8 bits en router y atencion lineal, comparando con el hermano solo-texto.
- Procesamiento de documentos con imagenes en local: digitalizacion y descripcion de capturas o escaneos en flujos de trabajo de escritorio, sin enviar datos a la nube.
- Evaluacion de viabilidad de despliegue edge: medir throughput y latencia del motor FinchMoE con vision activada frente a desactivada, para decidir si el modelo encaja en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta variante "no se mide por separado" y remite al hermano solo-texto `haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit` para calidad y throughput del camino de texto.

## Requisitos de hardware

- VRAM/RAM: el repositorio ocupa 104,9 GB en disco; los pesos residentes son 3,88 GB y el pool de expertos 63,38 GiB, cargado selectivamente. Se requiere almacenamiento rapido (SSD) y memoria unificada suficiente para residentes mas expertos activos.
- GPU recomendadas: el motor FinchMoE esta orientado a Mac/iOS (Apple Silicon); no se documenta soporte para A100, H100 ni RTX 4090.
- Consumer GPU: no se indica compatibilidad con GPUs de consumo convencionales; el formato `.finch` no es compatible con llama.cpp, vLLM ni Ollama.
- Opciones de despliegue: FinchMoECLI y las apps Mac/iOS de FinchMoE. El CLI acepta `--model`, `--messages-file` y `--max-new`.
- Latencia y throughput: no disponibles; dependen del almacenamiento y de la tasa de aciertos de expertos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit-vision (este) | 125B (MoE) | no disponible | Finch `.finch` | Qwen Community 1.0 | HuggingFace, 0 descargas |
| Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit (hermano solo-texto) | 125B (MoE) | no disponible | Finch `.finch` | Qwen Community 1.0 | HuggingFace |
| Qwen/Qwen3.8-Flash-Next (base) | 125B (MoE) | no disponible | safetensors BF16 | Qwen Community 1.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: requiere el motor FinchMoE y no funciona con vLLM, llama.cpp, Ollama ni TGI.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- Idiomas soportados y longitud de contexto no estan disponibles; no se debe asumir un contexto largo sin verificacion.
- La licencia Qwen Community License 1.0 impone restricciones de uso comercial; es obligatorio revisar el archivo LICENSE antes de cualquier despliegue en produccion.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria independiente.
- La calidad del camino de texto no se mide en este repositorio; se remite al hermano solo-texto, y la torre de vision no tiene evaluacion publicada.
- El rendimiento depende criticamente del almacenamiento: la carga selectiva de expertos desde disco puede introducir latencia elevada frente a un modelo totalmente residente.
- El modelo base puede haber sufrido "abliteration" upstream; conviene verificar el comportamiento del checkpoint fuente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Hermano solo-texto: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit
- Motor FinchMoE: https://github.com/haihengh/finchMoE
- Licencia: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit-vision/blob/main/LICENSE
