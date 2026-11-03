# cavi-ai/Qwen3-VL-8B-Instruct-MLX-4bit

## Resumen

Qwen3-VL-8B-Instruct-MLX-4bit es una conversion cuantizada a 4 bits del modelo vision-language Qwen/Qwen3-VL-8B-Instruct, empaquetada en formato MLX para su ejecucion nativa en Apple Silicon. La desarrolla cavi-ai (Sasan Sotoodehfar) y no tiene vinculacion oficial con Qwen. El modelo resuelve el problema de desplegar un VLM de 8.700 millones de parametros en Macs con memoria unificada limitada, reduciendo el peso de los pesos a 5,76 GB (5,37 GiB) frente a los aproximadamente 17 GB que ocuparia la version en bf16.

La tarea principal que declara el autor es el GUI grounding: localizar controles en capturas de pantalla de paginas web y devolver sus coordenadas en una rejilla normalizada de 0 a 1000. Esto lo hace util para automatizacion de navegador, agentes que operan interfaces graficas y pipelines de testing visual. El modelo conserva la torre de vision en bf16 y solo cuantiza las capas lineales, embeddings y cabeza de salida del modelo de lenguaje, lo que preserva la calidad perceptiva.

Se trata de una ficha de conversion, no de un modelo nuevo: la arquitectura, el entrenamiento y las capacidades subyacentes son las del Qwen3-VL-8B-Instruct original. Los datos de rendimiento publicados por el autor se limitan a su propio banco de pruebas sobre 13 paginas web y 85 controles, medidos en un Apple M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (torre de vision de 27 bloques + modelo de lenguaje de 36 capas, hidden size 4096); pesos en formato MLX |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit affine con group size 64 en capas lineales, token embedding y output head; torre de vision, merger y normas en bf16 |
| Idiomas soportados | en (segun la model card; el modelo base de Qwen es multilingue, pero la conversion declara solo ingles) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), 2 shards, 5,76 GB / 5,37 GiB en total |

## Arquitectura y entrenamiento

La conversion mantiene la arquitectura del Qwen3-VL-8B-Instruct: un modelo de lenguaje de 36 capas con hidden size 4096 acoplado a una torre de vision de 27 bloques y un modulo merger que proyecta las representaciones visuales al espacio del lenguaje. La cuantizacion se aplica de forma selectiva: solo las capas lineales, el token embedding y la cabeza de salida del LM pasan a 4 bits (afin, group size 64), mientras que la torre de vision, su merger y las normas del LM se conservan en bf16. Esta decision busca no degradar la percepcion visual, que es el punto critico para tareas de grounding.

No se proporcionan en la informacion disponible datos sobre el entrenamiento del modelo base: numero de tokens, composicion del dataset, fases de RLHF/DPO ni innovaciones de atencion. La conversion se realizo a partir de la revision `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b` del modelo original, con la herramienta mlx-agent del mismo autor. El paquete incluye processor, tokenizer y chat template heredados del modelo base.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- GUI grounding: localiza controles nombrados en capturas de pantalla y devuelve coordenadas en rejilla 0-1000 sobre la imagen.
- Clasificacion de retos visuales: el autor reporta uso para distinguir captcha, verificacion o ausencia de reto en paginas web.
- Comprension de imagenes en general, heredada del modelo base Qwen3-VL.
- Soporte de plantilla de chat y conversacion multi-turno con imagenes.
- Capacidades de tool calling, agentes, thinking mode, vision avanzada o audio del modelo base: no disponibles en la informacion proporcionada para esta conversion.
- Capacidades multilingues: la model card declara solo `en`; no se documentan otros idiomas en esta ficha.

## Casos de uso

- Automatizacion de navegador con agentes: el modelo recibe una captura de la pagina y devuelve el centro del control a pulsar en coordenadas 0-1000, que se convierten a pixeles multiplicando por ancho/1000 y alto/1000. El autor valida este flujo en su servidor de vision bobby-browser.
- Testing visual de interfaces: dado un conjunto de capturas de paginas, el modelo localiza botones, enlaces y campos por nombre, lo que permite generar aserciones automatizadas sobre la presencia y posicion de elementos.
- Deteccion de retos anti-bot en pipelines de scraping: clasifica si una pagina muestra captcha, verificacion u otro reto antes de decidir la siguiente accion, con 11 aciertos sobre 13 paginas en las pruebas del autor.
- Asistencia en escritorio para Mac: al ejecutarse en MLX sobre Apple Silicon con 6,4 GB de memoria residente, puede integrarse en herramientas locales que necesitan describir o interpretar la pantalla sin enviar imagenes a la nube.
- Prototipado de agentes de UI en portatiles: con latencia mediana de 3,8 s por peticion en un M5 Max, sirve para iterar sobre flujos de interaccion antes de mover el sistema a infraestructura con GPU.
- Extraccion de informacion de capturas: descripcion de contenido visual y respuesta a preguntas sobre imagenes en aplicaciones de documentacion o soporte, aprovechando la via image-text-to-text del modelo base.
- Demos y evaluacion offline de VLMs: el formato MLX y el tamano de 5,76 GB permiten distribuir el modelo en un portatil para pruebas sin conexion.

## Benchmarks y rendimiento

Los unicos datos publicados son las mediciones del autor en un Apple M5 Max, sobre su propio conjunto de 13 paginas web y capturas de 1900x980.

| Prueba | Resultado |
|---|---|
| Grounding: pulsar el control nombrado, 85 controles en 13 paginas | 81 aciertos |
| Clasificacion de retos (captcha, verificacion o ninguno), 13 paginas | 11 correctos |
| Tiempo por peticion, mediana / p95 | 3,8 s / 5,1 s |
| Memoria residente del servidor | 6,4 GB |
| Primera peticion tras la carga | 7,0 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon Mac (la libreria mlx no soporta CUDA ni CPU x86 de forma practica para este modelo).
- Memoria unificada: el autor reporta 6,4 GB residentes en servidor con el modelo cargado; se recomienda al menos 12-16 GB de memoria unificada para margen del sistema y del procesador de imagenes.
- Peso en disco: 5,76 GB (5,37 GiB) en dos shards safetensors.
- GPUs recomendadas: Apple M-series; el autor mide en un M5 Max. No aplica A100, H100 ni RTX 4090, ya que el formato MLX no esta pensado para esas plataformas.
- Cabe en Macs consumer con memoria unificada suficiente (M1/M2/M3/M4 con 16 GB o mas); no se documentan pruebas en configuraciones de 8 GB.
- Despliegue: `mlx-vlm==0.6.10` con Python 3.10 o superior; el autor lo integra en su servidor de vision bobby-browser mediante un proveedor mlx-vlm. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia: mediana de 3,8 s y p95 de 5,1 s por peticion en M5 Max con capturas de 1900x980; primera peticion tras la carga de 7,0 s. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| cavi-ai/Qwen3-VL-8B-Instruct-MLX-4bit | 8,77 B | no disponible | MLX 4-bit, Apple Silicon | Apache-2.0 | Conversion no oficial; grounding medido por el autor |
| Qwen/Qwen3-VL-8B-Instruct | 8,77 B | no disponible en la informacion | safetensors bf16, GPU CUDA y otras | Apache-2.0 | Modelo base oficial; sin cuantizar, mayor huella de memoria |
| Otras conversiones MLX 4-bit de Qwen3-VL-8B | 8,77 B | no disponible | MLX 4-bit | Apache-2.0 | No se dispone de datos verificados de alternativas comparables en la informacion proporcionada |

La comparacion cuantitativa de rendimiento frente a otras conversiones o al modelo base no esta disponible: el autor solo publica sus propias metricas de grounding y latencia.

## Limitaciones y advertencias

- Conversion no oficial: no esta afiliada ni respaldada por Qwen; los resultados pueden diferir de los del modelo base.
- La cuantizacion a 4 bits puede degradar tareas distintas del grounding; no se han publicado evaluaciones generales que cuantifiquen esa perdida.
- La model card declara solo ingles; no se garantiza el comportamiento multilingue del modelo base en esta conversion.
- No se documenta la longitud de contexto soportada; conviene validarla antes de usarla con capturas grandes o conversaciones largas.
- Riesgo de alucinacion inherente a los VLM: puede devolver coordenadas o clasificaciones plausibles pero incorrectas, como muestran los 4 fallos sobre 85 controles y los 2 fallos sobre 13 paginas.
- Las metricas de grounding y clasificacion provienen de un conjunto de prueba propio del autor (13 paginas), no de un benchmark publico; la generalizacion a otras interfaces no esta validada.
- Dependencia de plataforma: requiere Apple Silicon y `mlx-vlm==0.6.10`; no es portable a CUDA sin reconversion.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe conservar el aviso de licencia y no atribuir el modelo a Qwen ni a cavi-ai como si fuera oficial.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cavi-ai/Qwen3-VL-8B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Herramienta de conversion mlx-agent: https://github.com/cavi-ai/mlx-agent
- Servidor de vision bobby-browser: https://github.com/cavi-ai/bobby-browser
- Sitio del autor: https://cavi-ai.xyz
