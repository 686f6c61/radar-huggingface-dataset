# SoAIHQ/Qwen3.5-9B-GGUF

## Resumen

SoAIHQ/Qwen3.5-9B-GGUF es la version cuantizada en formato GGUF de Qwen3.5-9B, el modelo multimodal de 9B parametros desarrollado por Qwen. La cuantizacion la publica SoAI (SoAIHQ), que genera los ficheros para su ejecucion en llama.cpp y en su propia plataforma, con una matriz de importancia (imatrix) calibrada sobre un corpus propio de conversacion, codigo y llamadas a herramientas en lugar de texto web generico.

El modelo resuelve el problema de ejecutar un modelo multimodal con razonamiento explicito y ventana de 256K tokens en hardware de consumo. Es un modelo denso (no MoE) con arquitectura hibrida de Gated DeltaNet y atencion, entrada de imagen, tool calling y modo de pensamiento activado por defecto. Su relevancia actual esta en que combina capacidades de vision, razonamiento y agentes en un unico modelo de 9B cuantizable a 5,8 GB, algo que hasta ahora exigia modelos mucho mayores o sacrificar alguna de esas capacidades.

El repositorio incluye tres ficheros: Q4_K_M (5,8 GB), Q8_0 (9,8 GB) y el proyector multimodal mmproj en F16 (918,2 MB), necesario para entrada de imagenes. La licencia es Apache 2.0, heredada del modelo base. Es una publicacion reciente (creada el 26 de septiembre de 2026) con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, hibrida Gated DeltaNet + atencion |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (5,8 GB), Q8_0 (9,8 GB); proyector mmproj F16 (918,2 MB). SoAI no publica cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.5-9B |
| Entrada multimodal | Texto e imagen (audio no soportado) |
| Razonamiento | Modo thinking activado por defecto, desactivable por peticion |
| Tool calling | Si |
| Tamano del repositorio | 16,5 GB |
| Fecha de publicacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es densa e hibrida: combina capas de Gated DeltaNet con atencion, una variante de estado recurrente que reduce el coste de la atencion sobre secuencias largas y permite sostener los 262.144 tokens de contexto con un consumo de memoria mas contenido que un transformer de atencion completa. El modelo incorpora un proyector multimodal (mmproj) que traduce caracteristicas visuales al espacio de tokens de texto; en esta publicacion el proyector se distribuye en F16 y se carga por separado con el flag `--mmproj` de llama.cpp. El modelo base es multimodal de tipo image-text-to-text y no acepta audio.

Sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no hay datos en la informacion proporcionada. Lo que si documenta el autor de la cuantizacion es el proceso de calibracion de la imatrix de Q4_K_M: SoAI calcula la matriz de importancia sobre un corpus propio que incluye conversacion multiturno en 21 idiomas, ediciones de codigo en 22 lenguajes de programacion, llamadas a herramientas y sus resultados, matematicas paso a paso y prosa web, formateado con la plantilla de chat nativa del modelo (incluida su sintaxis de tool calling). Antes de cuantizar, el proceso verifica que los marcadores de chat, thinking y tool calls se almacenan como tokens especiales y que la plantilla embebida coincide con la original; si no, la conversion se detiene en lugar de publicar un fichero roto. Q8_0 se cuantiza sin imatrix porque el formato no la utiliza. El fichero de imatrix y la tabla de procedencia (revision original y commit de llama.cpp) se publican en el repositorio para poder reconstruir los ficheros.

## Capacidades

- Generacion de texto conversacional multiturno con contexto de hasta 262.144 tokens.
- Razonamiento explicito en modo thinking, activado por defecto y desactivable por peticion mediante `chat_template_kwargs` (`enable_thinking: false`).
- Comprension de imagenes como entrada (image-text-to-text), previa carga del proyector mmproj.
- Tool calling y function calling con sintaxis nativa, calibrada explicitamente en el corpus de cuantizacion.
- Flujos de agente y razonamiento multi-paso, apoyados en tool calling y en la ventana de contexto extendida.
- Capacidades multilingues: 201 idiomas y dialectos segun la model card del autor (21 idiomas presentes en el corpus de calibracion).
- No soporta entrada ni salida de audio.

## Casos de uso

- Atencion al cliente automatizada: con 256K tokens de contexto el modelo puede mantener conversaciones multi-turno muy largas o ingerir historiales completos de ticket sin truncar, y su soporte de tool calling permite consultar sistemas de CRM o bases de conocimiento en mitad del dialogo.
- Analisis de documentos con imagenes: al aceptar entrada de imagen, se puede usar para extraer y razonar sobre capturas, diagramas o documentos escaneados combinados con preguntas en texto, cargando el mmproj junto al modelo.
- Generacion y refactorizacion de codigo: el corpus de calibracion incluye ediciones de codigo en 22 lenguajes, por lo que el modelo esta ajustado para tareas de parcheo y modificacion de ficheros, integrable en pipelines de CI/CD mediante tool calling.
- Agentes autonomos de varios pasos: la combinacion de tool calling nativo, modo thinking y contexto largo permite encadenar busquedas, ejecuciones y verificaciones dentro de una misma ventana.
- Razonamiento matematico paso a paso: el modo thinking y la calibracion sobre problemas resueltos paso a paso lo hacen adecuado para tutoria o verificacion de calculos, con la posibilidad de desactivar el razonamiento visible en produccion.
- Asistente local en estacion de trabajo: con Q4_K_M (5,8 GB) el modelo cabe en una GPU de consumo, lo que permite desplegar un asistente con vision y razonamiento sin enviar datos a servicios externos.
- Procesamiento multilingue: con soporte declarado de 201 idiomas, se puede usar para traduccion, resumen o clasificacion en carteras de idiomas amplias desde un unico modelo.
- Analisis de repositorios o bases de codigo extensas: la ventana de 256K permite cargar ficheros completos o varios modulos a la vez para tareas de revision y busqueda semantica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y la metadata de HuggingFace no aporta metricas de rendimiento.

## Requisitos de hardware

- VRAM para Q4_K_M: 5,8 GB de pesos mas 918,2 MB del proyector mmproj si se usa vision. El contexto adicional crece con la longitud configurada (hasta 262.144 tokens), por lo que la VRAM total depende del valor que se fije.
- VRAM para Q8_0: 9,8 GB de pesos, mas el mmproj si se usa vision, mas la memoria de contexto.
- GPU de consumo: Q4_K_M esta dimensionado para una unica GPU de consumo. Con 5,8 GB de pesos, tarjetas de 8 GB dejan poco margen para contexto; 12 GB o mas ofrecen holgura. Q8_0 requiere tarjetas de gama alta con 12-16 GB o superior.
- GPU de centro de datos: A100, H100 y equivalentes ejecutan cualquiera de las dos cuantizaciones con contexto largo sin problema de capacidad.
- Despliegue: llama.cpp y llama-server (servidor con API compatible con OpenAI e interfaz de chat en http://localhost:8080), Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Ejecucion parcial en CPU: llama.cpp puede repartir las capas entre GPU y CPU, lo que permite ejecutar el modelo sin GPU a costa de latencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada de imagen | Razonamiento | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| SoAIHQ/Qwen3.5-9B-GGUF | 9,2B (denso) | 262.144 | Si | Si (thinking por defecto) | Si | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-9B (base, 16 bits) | 9,2B (denso) | 262.144 | Si | Si | Si | Apache 2.0 | safetensors |
| Otras alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria. La unica comparacion documentada es frente al modelo base sin cuantizar, del que esta publicacion es una conversion: misma arquitectura, mismo contexto y mismas capacidades, con perdida de calidad declarada como baja en Q4_K_M y casi nula en Q8_0, y con un peso de fichero de aproximadamente un tercio en Q4_K_M respecto a los pesos originales de 16 bits.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: cualquier limitacion del modelo base Qwen3.5-9B se hereda intacta.
- La cuantizacion Q4_K_M introduce perdida de calidad respecto a los pesos originales; el autor la califica de baja para su tamano, pero no publica mediciones cuantitativas que lo respalden.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad ni de tasas de error en la informacion disponible.
- El modo thinking esta activado por defecto y consume tokens de salida y de contexto adicionales; Qwen recomienda al menos 128K de contexto configurado para dejar espacio al razonamiento y hasta 32K tokens de salida en la mayoria de consultas.
- El rendimiento multilingue real puede variar entre los distintos idiomas; el corpus de calibracion de la imatrix solo cubre 21 idiomas, aunque la model card declara 201.
- Para usar imagenes es obligatorio cargar el fichero mmproj por separado; si se omite, la entrada de imagen no funciona.
- No hay soporte de audio, ni de entrada ni de salida.
- El repositorio tiene 0 descargas y 0 likes en el momento de redactar la ficha, por lo que no existe validacion de la comunidad sobre la calidad real de estas cuantizaciones.
- La licencia Apache 2.0 permite uso comercial, pero los terminos aplicables son los del modelo base de Qwen; conviene revisar el fichero LICENSE enlazado en la model card.
- SoAI no publica cuantizaciones por debajo de 4 bits, lo que limita el despliegue en hardware con menos de 6 GB de VRAM.
- El tamano del repositorio (16,5 GB) obliga a descargar selectivamente los ficheros necesarios si no se quiere ocupar todo el espacio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SoAIHQ/Qwen3.5-9B-GGUF
- Arbol de ficheros: https://huggingface.co/SoAIHQ/Qwen3.5-9B-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Q4_K_M: https://huggingface.co/SoAIHQ/Qwen3.5-9B-GGUF/resolve/main/Qwen3.5-9B-Q4_K_M.gguf
- Q8_0: https://huggingface.co/SoAIHQ/Qwen3.5-9B-GGUF/resolve/main/Qwen3.5-9B-Q8_0.gguf
- Proyector multimodal mmproj F16: https://huggingface.co/SoAIHQ/Qwen3.5-9B-GGUF/resolve/main/mmproj-Qwen3.5-9B-f16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio del autor de la cuantizacion: https://soai.to
