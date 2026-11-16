# OsaurusAI/gemma-4-31B-it-qat-MXFP4

## Resumen

OsaurusAI/gemma-4-31B-it-qat-MXFP4 es una distribucion cuantizada en formato MLX del modelo multimodal Gemma 4 31B en su variante instruction-tuned con Quantization-Aware Training (QAT), publicado originalmente por Google. El bundle ha sido convertido por OsaurusAI para ejecutarse en Apple Silicon mediante la libreria MLX, aplicando cuantizacion MXFP4 (4 bits, group size 32) a las capas lineales del decoder mientras se preservan en fp16 las embeddings, las normas y los embedders multimodales de fusion temprana.

El modelo parte de `google/gemma-4-31B-it-qat-q4_0-unquantized`, conserva la arquitectura `Gemma4ForConditionalGeneration` con 60 capas de texto (10 de atencion completa y 50 de atencion deslizante), tamano oculto de 5376 y un total de 31.273.088.876 parametros. Mantiene la torre de vision (`gemma4_vision`, 27 capas, hidden size 1152, patch size 16) y el procesador multimodal con `image_seq_length=280`, lo que permite entrada image-text-to-text. El repositorio ocupa 19,6 GB repartidos en 18 shards safetensors.

Su relevancia radica en ofrecer una ruta practica para ejecutar un modelo multimodal de 31B en hardware Apple Silicon con un peso en disco de aproximadamente 18,19 GiB de pesos indexados, manteniendo las capacidades de tool calling y razonamiento del Gemma 4 original a traves de metadatos de parser (`gemma4`) y una plantilla de chat adaptada a runtimes vMLX/Osaurus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4` / `Gemma4ForConditionalGeneration` (transformer decoder con atencion completa y deslizante, mas torre de vision) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (bits=4, group_size=32) en lineales del decoder; embeddings, normas y embedders multimodales en fp16 passthrough; 410 tensores cuantizados con sidecars `.scales` |
| Idiomas soportados | en |
| Licencia | gemma |
| Formato de pesos | safetensors (MLX), 18 shards, indice `model.safetensors.index.json`; no es GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 4 en su variante multimodal: un decoder de 60 capas con hidden size 5376, combinando 10 capas de atencion completa con 50 de atencion deslizante (sliding attention), lo que reduce el coste computacional en secuencias largas. La parte de vision se implementa como `gemma4_vision` con 27 capas, hidden size 1152 y patch size 16, integrada mediante un esquema de fusion temprana ("early-fusion media embedders") que se conserva en fp16 en este bundle. El procesador define `image_seq_length=280`, `audio_seq_length=750` y `audio_ms_per_token=40`.

La variante original de Google emplea Quantization-Aware Training (QAT), de modo que el modelo fue entrenado teniendo en cuenta la cuantizacion a 4 bits, lo que mitiga la perdida de calidad respecto a una cuantizacion post-entrenamiento convencional. OsaurusAI aplica sobre esa base una conversion a MXFP4 con group size 32 mediante MLX, cuantizando 410 tensores lineales del decoder y manteniendo intactas las partes sensibles (embeddings, normas, embedders de vision). No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni detalles de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles con formato de turnos y canales propio de Gemma 4.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`) mediante la torre de vision integrada.
- Soporte de tool calling: el bundle incluye metadatos de parser de herramientas (`gemma4`) y la plantilla de chat incorpora la clausula de compatibilidad de eleccion obligatoria de herramienta usada por vMLX/Osaurus.
- Soporte de razonamiento multi-paso con parser de razonamiento (`gemma4`) y gestion de canales de pensamiento; la plantilla elimina el prefill vacio de canal de pensamiento para que los turnos sin thinking arranquen en contenido visible.
- Capacidades de agente y razonamiento multi-turno a traves de la plantilla de chat adaptada.
- Capacidad multimodal de audio: `audio_config` esta presente en la configuracion, aunque el soporte en runtime depende del procesador Gemma 4 activo.
- Video: no se declara una ruta de runtime verificada (no hay `video_config` en la configuracion fuente).

## Casos de uso

- Asistente local en Mac con Apple Silicon: el bundle esta empaquetado para MLX/vMLX, de modo que puede cargarse con `mlx_vlm` y ejecutarse en equipos con memoria unificada suficiente, sin depender de GPUs dedicadas.
- Analisis de imagenes con descripcion en lenguaje natural: gracias a la torre de vision de 27 capas y `image_seq_length=280`, se puede usar para captioning, extraccion de informacion de capturas o documentos escaneados.
- Agentes con tool calling en flujos de automatizacion: los metadatos de parser `gemma4` y la plantilla de chat con compatibilidad de herramienta obligatoria permiten integrar el modelo en pipelines donde el modelo debe invocar funciones externas.
- Razonamiento multi-paso asistido: el parser de razonamiento y la gestion de canales permiten separar el pensamiento interno del contenido visible, util para tareas de planificacion o resolucion de problemas.
- Prototipado de aplicaciones multimodales en local: al conservar el procesador completo (`Gemma4Processor`) y la plantilla de chat, sirve como banco de pruebas para desarrolladores que quieran validar flujos image-text-to-text antes de desplegar en infraestructura mayor.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en hardware local Apple Silicon y no requerir llamadas a API, es adecuado para procesar imagenes y texto sensibles sin salida a la nube.
- Evaluacion comparativa de cuantizacion QAT+MXFP4: util para investigadores que quieran medir la degradacion de un modelo 31B multimodal al pasar a 4 bits con group size 32 frente al original sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 19,6 GB y los pesos indexados suman 18,19 GiB; se recomienda al menos 24 GB de memoria unificada para cargar el modelo con margen para el contexto y el procesador.
- Hardware objetivo: Apple Silicon (el bundle esta etiquetado `apple-silicon` y usa la libreria `mlx`); no esta pensado para GPUs NVIDIA.
- Cabe en equipos consumer Apple con memoria unificada de 24 GB o superior (por ejemplo, configuraciones de Mac con chip de la familia M-series); en configuraciones de 16 GB el margen es muy ajustado y no se garantiza.
- Opciones de despliegue: runtime MLX/vMLX con soporte de Gemma 4 MXFP4; carga mediante `mlx_vlm` (`from mlx_vlm import load, generate`). No debe cargarse con runtimes GGUF (llama.cpp, Ollama en formato GGUF) porque el bundle no es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| OsaurusAI/gemma-4-31B-it-qat-MXFP4 | 31,27 B | no disponible | Texto + vision | gemma | safetensors MLX (MXFP4) |
| google/gemma-4-31B-it-qat-q4_0-unquantized (modelo base) | 31,27 B | no disponible | Texto + vision | gemma | safetensors |
| Alternativas equivalentes de 30B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente `en`; el rendimiento en castellano u otros idiomas no esta garantizado y puede degradarse.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Gemma de Google, que impone restricciones de uso (incluidas clausulas de uso aceptable) y obligaciones de atribucion.
- Formato no portable: al ser un bundle MLX/MXFP4, no es compatible con runtimes GGUF ni con ecosistemas NVIDIA/CUDA; queda restringido a Apple Silicon.
- Cuantizacion a 4 bits: aunque QAT mitiga la perdida, la cuantizacion MXFP4 con group size 32 puede introducir degradacion en tareas sensibles a la precision numerica (matematicas, codigo).
- Audio y video: `audio_config` existe pero el soporte en runtime depende del procesador; no se declara ruta de video verificada, por lo que no deben asumirse capacidades de video.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad en la informacion disponible; como en cualquier LLM, existe riesgo de generar contenido incorrecto, especialmente en tareas multimodales.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo en la model card proporcionada.
- Repositorio de terceros: el bundle lo mantiene OsaurusAI, no Google; la actualizacion y el soporte dependen del mantenedor y no del autor original.
- Descargas y adopcion muy bajas (55 descargas, 0 likes en el momento de la consulta), lo que implica poca validacion comunitaria del bundle.

## Enlaces

- Hugging Face: https://huggingface.co/OsaurusAI/gemma-4-31B-it-qat-MXFP4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Sitio del mantenedor: https://osaurus.ai
- Contacto del mantenedor: eric@osaurus.ai
