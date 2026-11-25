# darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF

## Resumen

Qwen3.8-Flash-Next-Magma-Coder-GGUF es una cuantizacion comunitaria en formato GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario darrellbest. No se trata de un fine-tuning ni de una poda: todos los pesos proceden del modelo original y se conservan la totalidad de los 512 expertos enrutados de las 48 capas, ademas de la cabeza MTP (multi-token prediction). El valor anadido del autor es la matriz de importancia (imatrix), calibrada sobre texto de programacion, tool-calling, razonamiento y trazas de agentes en lugar de texto web generico, lo que determina que pesos conservan mayor precision al cuantizar los expertos a 4 bits.

El modelo base es un transformer con arquitectura MoE y atencion lineal GDN (gated delta network), con 176.943.899.520 parametros totales segun los safetensors del modelo original. La cuantizacion se ofrece en varias compilaciones: v1 (preview, obsoleta), v2 (uniforme, recomendada, 130,9 GB) y v3 (precision mixta por experto almacenada en contenedor Q8_0, 191 GB). Ademas se distribuye un proyector de vision F16 y una cabeza MTP en Q8_0.

Su relevancia actual radica en que demuestra una tecnica de cuantizacion selectiva por experto para modelos MoE de gran tamano, con una reduccion estimada de error del 46 % a igual numero de bytes respecto a 4 bits uniformes. Es una publicacion de nicho (31 descargas, 0 likes) orientada a desarrolladores que quieran ejecutar un MoE de ~177B en hardware de consumo o estaciones de trabajo con GPUs de 96 GB, aceptando que la verificacion KL end-to-end aun esta pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal GDN, hyper-connections, indexer y cabeza MTP; 48 capas, 512 expertos enrutados por capa |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K (expertos gate/up), IQ4_NL (expertos down), Q8_0 (atencion, GDN, router, embeddings, lm_head, tabla n-gram), F32 (norms, convs, SSM); v3 con precision mixta IQ2_S a Q8_0 por experto en contenedor Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (6 shards por compilacion), mas `mmproj-F16.gguf` y `mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura de mezcla de expertos (MoE) con 48 capas y 512 expertos enrutados por capa, combinando atencion lineal GDN (gated delta network) con componentes adicionales como hyper-connections, un indexer y una cabeza de prediccion multi-token (MTP). La model card de la cuantizacion menciona explicitamente una tabla de embeddings n-gram (PLE) de 51.000 millones de parametros, lo que explica buena parte del total de 177B y del tamano de los ficheros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO.

La innovacion de esta publicacion no esta en el modelo base sino en el proceso de cuantizacion. El autor genero una imatrix sobre un corpus de aproximadamente 1,5 millones de tokens (367 fragmentos de 4096 tokens) compuesto por un 40 % de sesiones reales de agentes de codigo (incluidas transcripciones privadas filtradas de secretos y trayectorias del benchmark KannaCode) y un 25 % de issues de SWE-bench Lite con sus parches dorados y ficheros C++/CUDA/Python. Sobre esa matriz se diseno una asignacion de precision por experto: los 73.728 proyectores enrutados (512 expertos x 3 proyecciones x 48 capas) reciben entre 2 y 8 bits segun su importancia para el trafico de codigo y tool-calling, con 144 expertos degradados a IQ2_S y solo 33 elevados a Q8_0. El resultado se almacena en un contenedor Q8_0 para que sea cargable en llama.cpp con soporte `qwen4exp`, aunque ello anula el ahorro de tamano. La verificacion KL end-to-end esta en curso y no se han publicado resultados.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es conversacional y soporta bloques de pensamiento (thinking blocks) segun el formato de plantilla de chat empleado en la calibracion.
- Programacion: la imatrix se calibro especificamente sobre codigo Python, C++ y CUDA, incluyendo tareas de revision, refactorizacion y parcheo de issues de SWE-bench Lite.
- Tool calling / function calling: soporte nativo del formato XML `<tool_call><function=…>` y de resultados `<tool_response>`, verificado en las pruebas de humo con una llamada `get_weather`.
- Uso agentico: las trazas de calibracion incluyen sesiones multi-paso de agentes de codigo, lo que orienta la preservacion de precision hacia ese tipo de trafico.
- Capacidades multimodales: se distribuye un proyector de vision F16 (`mmproj-F16.gguf`) para entrada de imagenes, aunque no se detallan las tareas de vision soportadas.
- Prediccion multi-token: la cabeza MTP se incluye como fichero separado en Q8_0 (sin ajustar), lo que permite decodificacion especulativa si el runtime lo soporta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local para equipos con estacion de trabajo: con la compilacion v2 (130,9 GB) y `--n-cpu-moe` para descargar expertos a CPU, se puede desplegar en una GPU de 96 GB y obtener generacion de codigo con contexto de proyecto, manteniendo los pesos en la maquina sin depender de APIs externas.
- Automatizacion de revision de parches en CI/CD: el modelo se calibro con issues de SWE-bench Lite y sus parches dorados, por lo que es adecuado para tareas de generacion y validacion de diffs sobre repositorios, integrable mediante llama.cpp o vLLM en pipelines de integracion continua.
- Agentes de codigo multi-paso: el soporte de tool calling en formato XML y la calibracion sobre trayectorias de agentes permiten construir bucles de razonamiento con llamadas a herramientas (ejecucion de tests, lectura de ficheros, busquedas) en entornos controlados.
- Refactorizacion asistida de codigo C++/CUDA: la imatrix incluye fuentes de estos lenguajes enmarcadas como revision y refactorizacion, lo que orienta la precision hacia ese dominio frente a cuantizaciones genericas.
- Prototipado de investigacion sobre cuantizacion MoE: la publicacion incluye `expert-tiers.json` con el tipo asignado a cada (capa, experto, proyeccion) y las puntuaciones de presupuesto, util para reproducir o comparar estrategias de asignacion de bits.
- Despliegue con entrada de imagenes: combinando el modelo con `mmproj-F16.gguf` se pueden procesar capturas de pantalla o diagramas en flujos de asistencia tecnica, siempre que el runtime soporte el proyector.
- Evaluacion comparativa de calidad de cuantizacion: las compilaciones v1, v2 y v3 permiten medir el impacto de la calibracion por dominio y de la precision mixta por experto sobre las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una estimacion interna: la asignacion de precision mixta por experto reduce el error de reconstruccion ponderado por enrutamiento e imatrix un ~46 % respecto a 4 bits uniformes a igual numero de bytes. Esta cifra no ha sido validada con verificacion KL end-to-end, que el autor describe como pendiente. Como dato de rendimiento practico, la compilacion v3 en una GPU de 96 GB con `--n-cpu-moe 17` supero una prueba de humo a 6-9 tok/s.

## Requisitos de hardware

- VRAM estimada: la compilacion v2 ocupa 130,9 GB en disco, de los cuales unos 54 GB corresponden a la tabla n-gram (PLE), que es una busqueda en CPU y no necesita residir en VRAM. La v3 ocupa 191 GB (188 GB segun la model card) y la v1 otros 130,9 GB.
- GPU recomendadas: para v2 con descarga parcial de expertos a CPU, una GPU de 96 GB (A100 80 GB o H100 80 GB no bastan sin descarga; se recomienda H100 96 GB o similar). Para v3, el autor indica explicitamente GPU de 96 GB con `--n-cpu-moe 17`.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB sin descargar la practica totalidad de los expertos a CPU, lo que degradaria drasticamente el throughput. No se han publicado mediciones en ese escenario.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama pueden ejecutar la compilacion uniforme v2 (un ancho de bits por bloque de expertos por capa). vLLM y MLX se citan como compatibles con el mismo criterio. La compilacion v3 por experto solo carga en llama.cpp con soporte `qwen4exp`; la version compacta de ~122 GB requiere el runtime Magma (aun no publico, seguimiento en el issue #80).
- Latencia y throughput: 6-9 tok/s en la prueba de humo de v3 con descarga de 17 capas MoE a CPU en una GPU de 96 GB. No hay datos de throughput para v2 ni para configuraciones totalmente en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Magma-Coder-GGUF (esta ficha) | 176,9B totales | no disponible | GGUF Q4_K/IQ4_NL/Q8_0, mixta por experto en v3 | qwen-community-1.0 | Hugging Face, 31 descargas |
| Qwen/Qwen3.8-Flash-Next (original) | 176,9B totales | no disponible | safetensors (BF16/FP16 presumiblemente) | qwen-community-1.0 | Hugging Face, oficial |
| unsloth/Qwen3.8-Flash-Next-GGUF | 176,9B totales | no disponible | GGUF (incluye el Q8_0 de origen) | qwen-community-1.0 | Hugging Face |
| darrellbest/Qwen3.8-Flash-Next-Base-GGUF | 176,9B totales | no disponible | GGUF Q8_0 espejo de Unsloth | qwen-community-1.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. La diferencia principal entre ellas es el esquema de cuantizacion y la calibracion de la imatrix, no el modelo subyacente.

## Limitaciones y advertencias

- Es una cuantizacion no oficial: el autor declara explicitamente que no esta afiliada ni respaldada por Qwen ni Alibaba. Para produccion conviene validar la calidad frente al modelo original en las tareas objetivo.
- La verificacion KL end-to-end de la asignacion por experto esta pendiente; la cifra del 46 % de reduccion de error es una estimacion de reconstruccion, no una medida de calidad downstream.
- La compilacion v3 no carga en herramientas estandar (llama.cpp, LM Studio, Ollama, MLX, vLLM) salvo en llama.cpp con soporte `qwen4exp`; la version compacta de ~122 GB requiere el runtime Magma, aun no publico.
- El corpus de calibracion incluye transcripciones privadas de sesiones de agentes de codigo del autor, filtradas de secretos pero no distribuidas. No es posible auditar completamente la composicion del 40 % de la categoria "agent".
- La cabeza MTP se distribuye en Q8_0 sin ajustar ("untuned"), por lo que la decodificacion especulativa puede no aportar la aceleracion esperada.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinacion para el modelo base ni para la cuantizacion.
- Idiomas soportados no declarados en la informacion disponible; no se puede asumir un rendimiento multilingue equivalente al del modelo original sin verificacion.
- Licencia qwen-community-1.0: es necesario revisar el texto completo de la licencia antes de uso comercial, ya que la model card solo enlaza a `LICENSE` sin resumir sus restricciones.
- El modelo base tiene 177B parametros totales; incluso cuantizado, el despliegue requiere hardware de gama alta (96 GB de VRAM o descarga masiva a CPU con throughput de un digito en tok/s).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF Q8_0 de Unsloth (origen de la cuantizacion): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Espejo del Q8_0 del autor: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Base-GGUF
- Issue #80 del runtime Magma (soporte de precision mixta por experto): no disponible como URL en la informacion proporcionada
- Fichero de licencia: `LICENSE` dentro del repositorio de Hugging Face
