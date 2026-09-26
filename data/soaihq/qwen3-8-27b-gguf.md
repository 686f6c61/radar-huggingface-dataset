# SoAIHQ/Qwen3.8-27B-GGUF

## Resumen

SoAIHQ/Qwen3.8-27B-GGUF es una compilacion de pesos en formato GGUF del modelo Qwen3.8-27B, desarrollado originalmente por Qwen y cuantizado por SoAI para su uso con llama.cpp y con el stack propio de SoAI. El repositorio contiene unicamente artefactos de cuantizacion, no pesos nuevos: se trata de una conversion del modelo base Qwen/Qwen3.8-27B, publicado bajo licencia Apache 2.0. El modelo original es denso, con 27.320.697.856 parametros (27,3B), y combina capas Gated DeltaNet con atencion en una arquitectura hibrida.

La relevancia de esta publicacion esta en el proceso de cuantizacion. Los ficheros Q4_K_M se generan con una matriz de importancia (imatrix) calculada por SoAI sobre un corpus de calibracion propio, compuesto por conversaciones de chat multi-turno en 21 idiomas, ediciones de codigo en 22 lenguajes de programacion, llamadas a herramientas con sus resultados, matematicas paso a paso y prosa web. Ademas, el pipeline de construccion verifica antes de cuantizar que los marcadores de chat, razonamiento y tool calling quedan almacenados como tokens especiales y que la plantilla de chat embebida coincide con la del modelo original.

El modelo es multimodal de entrada (texto e imagen), con una ventana de contexto de 262.144 tokens (256K), modo de razonamiento configurable mediante el parametro `reasoning_effort` (low, medium, xhigh) y soporte de tool calling. El repositorio ocupa 46,8 GB e incluye los ficheros Q4_K_M (16,8 GB), Q8_0 (29,0 GB) y el proyector multimodal mmproj en F16 (927,6 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, hibrida Gated DeltaNet + atencion |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (16,8 GB), Q8_0 (29,0 GB); proyector multimodal mmproj en F16 (927,6 MB). No se publican cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 201 idiomas y dialectos segun la model card del autor; el metadato de idiomas de HuggingFace figura como no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |
| Tarea declarada (pipeline) | image-text-to-text |
| Modalidades de entrada | Texto e imagen (la imagen requiere el fichero mmproj) |
| Modalidades de salida | Texto |
| Tool calling | Si |
| Razonamiento | Si, activado por defecto; profundidad ajustable con `reasoning_effort` (low, medium, xhigh; por defecto xhigh) |
| Modelo base | Qwen/Qwen3.8-27B |
| Cuantizado por | SoAI |
| Compatibilidad declarada | llama.cpp v0.5.0, endpoints_compatible |
| Tamano del repositorio | 46,8 GB |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3B parametros que sustituye parte del mecanismo de atencion clasico por capas Gated DeltaNet, un esquema de estado recurrente con compuertas que reduce el coste asociado al procesamiento de secuencias largas. Esta hibridacion es la que permite sostener una ventana de 262.144 tokens manteniendo, segun el autor, el comportamiento de atencion donde resulta necesario. El modelo incorpora ademas un encoder de vision, distribuido en este repositorio como un proyector multimodal independiente en F16 que debe cargarse aparte mediante `--mmproj`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO para el modelo base. Lo que si documenta el repositorio es el proceso de cuantizacion: la imatrix de Q4_K_M se calcula a partir de un corpus de calibracion propio de SoAI, formateado con la plantilla de chat del propio modelo, incluida su sintaxis nativa de tool calling, de modo que la matriz de importancia se ajusta a los patrones de tokens reales de uso. Q8_0 no utiliza imatrix porque el formato Q8_0 de llama.cpp no lo admite. Antes de cuantizar, el pipeline valida que los marcadores de chat, razonamiento y tool calling se almacenan como tokens especiales; si la conversion los importa como texto plano, el proceso se detiene en lugar de publicar el fichero. El fichero de imatrix se publica en el repositorio y la tabla de procedencia fija la revision original y el commit de llama.cpp, lo que permite reproducir la build.

## Capacidades

- Generacion de texto y conversacion multi-turno en 201 idiomas y dialectos declarados.
- Razonamiento explicito con modo thinking activado por defecto, con control de profundidad mediante `reasoning_effort` en tres niveles (low, medium, xhigh) y desactivacion con `"enable_thinking": false`.
- Entrada de imagenes mediante el proyector mmproj en F16, con pipeline declarado image-text-to-text. El audio no esta soportado.
- Tool calling y function calling con sintaxis nativa, incluida en el corpus de calibracion de la imatrix.
- Generacion y edicion de codigo, con calibracion especifica sobre 22 lenguajes de programacion.
- Matematicas paso a paso, tambien presentes en el corpus de calibracion.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones de muchas vueltas.
- Servidor local con interfaz de chat y API compatible con el esquema de OpenAI a traves de `llama-server`.
- Ejecucion repartida entre GPU y CPU, o completamente en CPU, segun la configuracion de llama.cpp.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto, el modelo puede mantener conversaciones multi-turno largas y arrastrar el historial completo de un caso sin truncar, y el tool calling nativo permite conectarlo a sistemas de gestion de tickets o consultas de pedidos.
- Asistentes de codigo en produccion: dado su soporte de tool calling y su calibracion sobre ediciones de codigo en 22 lenguajes, puede integrarse en pipelines de CI/CD para generar parches, revisar diffs o resolver incidencias a partir de la salida de un linter o de un test fallido.
- Analisis de documentos con imagenes: al aceptar entrada de imagen, sirve para extraer y razonar sobre capturas, diagramas, graficos o paginas escaneadas, combinando la lectura visual con texto de contexto largo en el mismo prompt.
- Procesamiento de expedientes extensos: contratos, informes tecnicos o transcripciones que superan la ventana de modelos de 32K o 128K pueden procesarse en una sola pasada, con razonamiento en modo xhigh cuando la tarea exige verificacion.
- Agentes multi-paso: el modo thinking configurable permite ajustar el coste computacional por consulta, usando low para tareas rutinarias de un agente y xhigh para planificacion o diagnostico de fallos.
- Despliegue en local con requisitos moderados: la cuantizacion Q4_K_M de 16,8 GB esta pensada para equipos de consumo con GPU de gama alta, lo que facilita prototipos y entornos con requisitos de privacidad que impiden enviar datos a una API externa.
- Evaluacion y comparacion de cuantizaciones: la publicacion de dos niveles de cuantizacion y del fichero de imatrix permite medir en produccion la perdida de calidad de Q4_K_M frente a Q8_0 en el dominio concreto de cada equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- Memoria para Q4_K_M: 16,8 GB solo de pesos. Hay que sumar la memoria del contexto, que crece con la longitud configurada, y 927,6 MB adicionales si se usa entrada de imagen. El tamano exacto del KV cache no esta disponible en la informacion proporcionada.
- Memoria para Q8_0: 29,0 GB solo de pesos, mas contexto y, en su caso, el proyector multimodal.
- GPU de 24 GB (por ejemplo RTX 4090 o A6000): Q4_K_M deberia caber con margen limitado para el contexto; Q8_0 no cabe sin repartir capas con la CPU.
- GPU de 40 GB o 80 GB (A100, H100): permiten Q8_0 completo y ventanas de contexto amplias.
- Configuraciones multi-GPU: no se documentan en el repositorio, pero llama.cpp permite repartir capas entre dispositivos y CPU.
- CPU: llama.cpp puede ejecutar el modelo integramente en CPU, con la penalizacion de velocidad correspondiente.
- Opciones de despliegue: llama.cpp v0.5.0 es la ruta soportada explicitamente, tanto con `llama-server -hf SoAIHQ/Qwen3.8-27B-GGUF:Q4_K_M` como con descarga manual de ficheros y carga del `--mmproj`. El repositorio esta etiquetado como endpoints_compatible, lo que apunta a una API compatible con OpenAI. No se documentan integraciones especificas con vLLM, TGI u Ollama en la informacion disponible.
- Parametros de muestreo recomendados por el autor: modo thinking con temperature 1.0, top_p 0.95, top_k 20, min_p 0.0 y presence_penalty 0.0; modo no thinking con temperature 0.7, top_p 0.8, top_k 20, min_p 0.0 y presence_penalty 1.5.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto comparado de modelos alternativos en la informacion proporcionada. La unica referencia directa es el propio modelo base y sus dos cuantizaciones publicadas en este repositorio:

| Referencia | Parametros | Contexto | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27,3B | 262.144 tokens | Apache 2.0 | safetensors, segun el modelo base (no confirmado en esta informacion) | No disponible (el autor indica que Q4_K_M es aproximadamente un tercio del peso en 16 bits) |
| SoAIHQ/Qwen3.8-27B-GGUF Q4_K_M | 27,3B | 262.144 tokens | Apache 2.0 | GGUF | 16,8 GB |
| SoAIHQ/Qwen3.8-27B-GGUF Q8_0 | 27,3B | 262.144 tokens | Apache 2.0 | GGUF | 29,0 GB |
| Modelos alternativos de ~27B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, ni del modelo base en este repositorio ni de las cuantizaciones, por lo que no es posible cuantificar la perdida de calidad frente a los pesos originales.
- No se detalla la composicion del dataset de entrenamiento del modelo base ni si se aplicaron tecnicas de alineacion (RLHF, DPO), de modo que los sesgos conocidos del modelo no estan documentados en esta informacion.
- Riesgo de alucinacion inherente a los modelos generativos: el modo thinking activado por defecto genera cadenas de razonamiento que pueden aumentar la latencia y el consumo de tokens sin garantizar la correccion del resultado.
- El uso de imagenes requiere cargar el fichero mmproj en F16; omitirlo desactiva la capacidad multimodal. El audio no esta soportado.
- Las cuantizaciones Q4_K_M y Q8_0 implican perdida de precision respecto a los pesos originales. El propio autor no publica cuantizaciones por debajo de 4 bits por considerarlas de calidad insuficiente.
- El Q8_0 se genera sin imatrix, porque el formato Q8_0 de llama.cpp no la admite; el proceso de calibracion descrito aplica solo a Q4_K_M.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B, a las que apunta el propio repositorio.
- Los metadatos de HuggingFace indican 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre estos ficheros en el momento de la consulta.
- El repositorio declara compatibilidad con llama.cpp v0.5.0; otras versiones o runtimes GGUF no estan verificados en la informacion disponible.
- La model card original aparece truncada en el apartado de fuentes del corpus de calibracion, por lo que no se puede verificar el detalle completo de las fuentes empleadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SoAIHQ/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Fichero Q4_K_M: https://huggingface.co/SoAIHQ/Qwen3.8-27B-GGUF/resolve/main/Qwen3.8-27B-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/SoAIHQ/Qwen3.8-27B-GGUF/resolve/main/Qwen3.8-27B-Q8_0.gguf
- Proyector multimodal mmproj F16: https://huggingface.co/SoAIHQ/Qwen3.8-27B-GGUF/resolve/main/mmproj-Qwen3.8-27B-f16.gguf
- Arbol de ficheros del repositorio: https://huggingface.co/SoAIHQ/Qwen3.8-27B-GGUF/tree/main
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de SoAI: https://soai.to
