# furiosa-ai/Qwen3-VL-32B-Thinking

## Resumen

Qwen3-VL-32B-Thinking es un modelo denso de vision-lenguaje de 32 mil millones de parametros perteneciente a la familia Qwen3-VL, desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio concreto, publicado por furiosa-ai, empaqueta los pesos originales junto con un Furiosa Executable Bundle (FXB) optimizado para ejecutarse en aceleradores FuriosaAI RNGD mediante la libreria Furiosa-LLM. El modelo combina un codificador visual con un decodificador transformer denso y emplea embeddings posicionales Interleaved-MRoPE junto con fusion multinivel de caracteristicas DeepStack.

La variante Thinking emite una cadena de razonamiento explicita antes de la respuesta final, lo que la hace adecuada para tareas que requieren razonamiento visual complejo, analisis de documentos, OCR, interpretacion de graficos y comprension de video. Ademas, soporta de forma nativa el uso de herramientas (function calling) y mensajes multimodales estilo OpenAI con partes de contenido `image_url`.

Su relevancia actual radica en que ofrece una via de despliegue en hardware alternativo (RNGD) manteniendo la precision original de los pesos, sin cuantizacion, y con una API compatible con OpenAI que facilita la integracion en pipelines existentes. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer denso con codificador visual, Interleaved-MRoPE y DeepStack) |
| Parametros totales | 33.357.390.064 (~33,4 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguna aplicada (precision original); no se documentan otras opciones en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (junto con Furiosa Executable Bundle, FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL en su variante densa: un codificador visual acoplado a un decodificador transformer que procesa texto e imagenes de forma conjunta. Incorpora embeddings posicionales Interleaved-MRoPE y fusion multinivel de caracteristicas DeepStack, tecnicas que mejoran la alineacion entre representaciones visuales y textuales en distintas profundidades de la red. El modelo acepta entradas de imagen y texto y produce texto, incluyendo una cadena de razonamiento intermedia en esta edicion Thinking.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO). El repositorio de furiosa-ai no aplica cuantizacion y conserva la precision de los pesos originales del modelo base Qwen/Qwen3-VL-32B-Thinking. La innovacion practica de este empaquetado es la inclusion de un FXB para ejecucion en FuriosaAI RNGD con Furiosa-LLM, con una estrategia de paralelismo tensorial de 32 PEs que se mapea a cuatro tarjetas RNGD (8 PEs por tarjeta).

## Capacidades

- Generacion de texto y razonamiento multimodal con cadena de pensamiento explicita (Thinking).
- Comprension de imagenes: descripcion, analisis de escenas y razonamiento espacial.
- OCR y analisis de documentos, tablas y graficos.
- Comprension de video ademas de imagenes fijas.
- Soporte nativo de tool calling / function calling mediante el parser `hermes`.
- Razonamiento multi-paso y uso en flujos de agentes, con separacion del razonamiento y la respuesta final.
- Mensajes multimodales estilo OpenAI con partes `image_url` (URL remota, base64 inline o ruta local `file://`).
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion de datos de documentos: el modelo puede procesar facturas, formularios y tablas mediante OCR y devolver campos estructurados, aprovechando su capacidad de analisis de documentos y su modo Thinking para verificar pasos intermedios.
- Analisis de graficos financieros: interpretacion de series temporales y diagramas en informes, con razonamiento explicito que permite auditar como llego a una conclusion.
- Atencion al cliente con imagenes: gestion de conversaciones multi-turno donde el usuario adjunta capturas o fotos de productos, usando la API compatible con OpenAI para integrarse en sistemas existentes.
- Automatizacion de agentes con herramientas: pipelines donde el modelo decide que funcion invocar (busqueda, calculo, consulta a base de datos) mediante tool calling y encadena varios pasos de razonamiento.
- Moderacion y catalogacion de contenido visual: clasificacion y descripcion automatica de imagenes y videos en plataformas de contenido, con salida textual estructurada.
- Asistencia en entornos de investigacion: analisis de figuras cientificas y comprension de video para resumir experimentos o extraer conclusiones de material audiovisual.
- Despliegue en hardware alternativo: organizaciones con aceleradores FuriosaAI RNGD pueden servir el modelo con Furiosa-LLM sin recurrir a GPUs, manteniendo la precision original de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~33,4 B de parametros en precision original (sin cuantizar) el peso de los pesos supera los 60 GB, por lo que no cabe en GPUs de consumo de forma holgada.
- GPU recomendadas: no especificadas en la informacion; el repositorio esta orientado a FuriosaAI RNGD.
- Hardware objetivo documentado: FuriosaAI RNGD, con paralelismo tensorial de 32 PEs sobre cuatro tarjetas (8 PEs por tarjeta).
- Compatibilidad con GPU de consumo: no disponible; el tamano del modelo en precision original lo hace inviable en tarjetas de 24 GB sin cuantizacion externa.
- Opciones de despliegue: Furiosa-LLM (motor principal de este repositorio) con servidor compatible con OpenAI; el modelo base tambien puede ejecutarse con vLLM, SGLang y Transformers segun la model card upstream.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-VL-32B-Thinking (furiosa-ai) | ~33,4 B | no disponible | Apache 2.0 | Hugging Face, empaquetado FXB para RNGD |
| Qwen/Qwen3-VL-32B-Thinking (upstream) | ~33,4 B | no disponible | Apache 2.0 | Hugging Face, pesos originales para vLLM/SGLang/Transformers |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos generativos, especialmente en OCR de documentos de baja calidad o graficos ambiguos.
- La cadena de razonamiento puede alargar la latencia y el consumo de tokens; conviene limitar su uso en produccion cuando no sea necesaria.
- No se documentan los idiomas soportados en este repositorio; verificar el comportamiento multilingue antes de desplegar en produccion.
- La longitud de contexto no esta especificada en la informacion disponible; debe consultarse la model card upstream.
- El repositorio esta orientado a FuriosaAI RNGD; el uso en otras plataformas requiere acudir a los pesos del modelo base upstream.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones de los componentes del ecosistema Furiosa-LLM para uso comercial.
- No se aplica cuantizacion, lo que implica mayores requisitos de memoria y puede limitar el despliegue en hardware con recursos ajustados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-VL-32B-Thinking
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-VL-32B-Thinking
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Opciones de servidor para modelos vision-lenguaje: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html#server-options
- Web de FuriosaAI: https://furiosa.ai
