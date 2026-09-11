# 0xSojalSec/DeepSeek-V4.1-Flash-MLX-MAC

## Resumen

DeepSeek-V4.1-Flash-MLX-MAC es una conversion no oficial del modelo deepseek-ai/DeepSeek-V4.1-Flash a formato MLX de Apple, publicada por el usuario 0xSojalSec. Se trata de un checkpoint experimental cuantizado de forma afin a 2 bits (group size 64) partiendo directamente del checkpoint oficial con precision mixta FP4/FP8 y componentes BF16/F32, es decir, no es una conversion desde BF16. El payload de pesos ocupa 238,80 GB (222,40 GiB) repartidos en 143.982 tensores y 48 shards, con 763.205.315.794 parametros totales declarados en los safetensors.

El modelo conserva la arquitectura `deepseek_v41` del original, incluida la memoria condicional Engram, y mantiene las tres etapas nativas de MTP (DSpark) con 3.584 tensores MTP convertidos. El atractivo principal es la posibilidad de ejecutar un modelo de mas de 700.000 millones de parametros en un unico Mac Studio M3 Ultra de 256 GiB de memoria unificada, con el backbone de texto residente en RAM y las tablas Engram en SSD. El autor reporta 9,46 tokens/s en decodificacion codiciosa con cache Engram caliente en pruebas cortas de solo texto.

Su relevancia es doble: por un lado, explora el limite practico de la cuantizacion a 2 bits sobre un modelo de escala frontera; por otro, documenta una estrategia de offload selectivo (backbone en memoria, Engram en disco) que permite inferencia local en hardware Apple Silicon. Conviene subrayar que es un lanzamiento experimental con runtime propio, sin validacion en cargadores MLX estandar ni en oMLX, sin benchmarks estandar publicados y con una ventana de contexto de diagnostico limitada a 128 tokens en el runtime incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek_v41` con memoria condicional Engram; MTP nativo DSpark de 3 etapas |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens segun la config del modelo original; contexto largo no validado en esta conversion, con limite de 128 tokens en el diagnostico del runtime |
| Tipos de cuantizacion | Afin a 2 bits, group size 64; algunos parametros no matriciales se mantienen en mayor precision. Requantizacion estandar, no oQ calibrada |
| Idiomas soportados | no disponible |
| Licencia | MIT (la licencia del modelo base no consta en la informacion disponible) |
| Formato de pesos | Safetensors en layout de origen MLX; 48 shards |
| Precaucion de origen | Checkpoint mixto FP4/FP8 oficial con componentes BF16/F32, no una conversion desde BF16 |
| Payload de pesos | 238,80 GB / 222,40 GiB, mas cabeceras, tokenizer y ficheros de configuracion |
| Tensores / shards | 143.982 / 48 |
| Tensores MTP | 3.584 convertidos, tres etapas DSpark retenidas |
| Libreria | mlx |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash (relacion: quantized) |

## Arquitectura y entrenamiento

La arquitectura declarada es `deepseek_v41`, con un mecanismo de memoria condicional denominado Engram. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO: esos datos pertenecen al modelo original y no se detallan en esta ficha. Lo que si se documenta es la estructura de pesos: 48 shards en layout de origen MLX, 143.982 tensores en total y la conservacion integra de los pesos de MTP (3.584 tensores repartidos en tres etapas DSpark) y de los pesos relacionados con vision.

La innovacion tecnica de esta publicacion no esta en el entrenamiento, sino en la conversion y la estrategia de ejecucion. La cuantizacion es afin a 2 bits con group size 64 aplicada sobre un checkpoint de precision mixta FP4/FP8; los parametros no matriciales se dejan en mayor precision. Ademas, el autor incluye un runtime propio en Python que mantiene el backbone de texto residente en memoria, deja las tablas Engram en SSD y puede cachear en memoria de proceso las filas Engram usadas con frecuencia. Tambien implementa verificacion serial de MTP, que en las pruebas realizadas resulto mas lenta que la decodificacion sin MTP (8,54 frente a 9,46 tokens/s), con una media de tokens borrador aceptados de 1,33 y 1,00 por bloque en los dos diagnosticos; la verificacion por bloques acelerada no esta validada.

## Capacidades

- Generacion de texto en modo chat con el encoder de chat del modelo original y decodificacion codiciosa.
- Razonamiento aritmetico basico: en la prueba registrada responde correctamente a "What is 2+2?" con "2 plus 2 equals 4.".
- Generacion de codigo en modo diagnostico: el test incluye un prefijo de 24 tokens de una funcion Python, sin completar ni ejecutar la funcion.
- Inferencia local en Apple Silicon mediante MLX, con el backbone en memoria unificada y las tablas Engram en SSD.
- Decodificacion especulativa mediante MTP nativo DSpark de tres etapas, conservado en la conversion (con verificacion serial, actualmente mas lenta que la decodificacion estandar).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el runtime de diagnostico no implementa bucle de agente.
- Capacidades multilingues: no disponible.
- Capacidades especiales: pesos relacionados con vision retenidos en el checkpoint, pero sin validacion en esta conversion; no hay modo thinking documentado.

## Casos de uso

- Investigacion en cuantizacion extrema: sirve como banco de pruebas para estudiar el impacto de una cuantizacion afin a 2 bits con group size 64 sobre un modelo de mas de 700.000 millones de parametros, comparando salidas contra el checkpoint FP4/FP8 original.
- Inferencia local privada en Apple Silicon: equipos con Mac Studio M3 Ultra de 256 GiB pueden ejecutar el modelo sin enviar datos a servicios externos, con el backbone en 160,88 GiB de memoria y 57,22 GiB de tablas Engram en SSD.
- Validacion de estrategias de offload selectivo: el runtime permite medir el equilibrio entre memoria residente, cache de filas Engram y latencia, util para disenar politicas de gestion de memoria en modelos con memoria condicional.
- Estudio de decodificacion especulativa con MTP: al conservar los 3.584 tensores MTP, permite reproducir y comparar verificacion serial frente a decodificacion estandar y medir la tasa de aceptacion de tokens borrador.
- Pruebas de diagnostico y humo (smoke tests) en pipelines de investigacion: el script `runtime/generate.py` con `--max-tokens` y `--repeat` ofrece un punto de entrada reproducible para verificar que un checkpoint MLX carga y genera sin arrancar un servidor.
- Analisis de viabilidad de modelos frontera en hardware de escritorio: los datos de RSS maximo (166,69 GiB), carga en frio (aproximadamente tres minutos) y throughput (8,80-9,46 tokens/s) permiten decidir si este tipo de despliegue encaja en un flujo de trabajo real.
- Formacion y demostraciones tecnicas: ilustra de forma tangible las diferencias entre precision mixta FP4/FP8 y 2 bits, y entre cargadores MLX estandar y runtimes personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son los diagnosticos cortos medidos por el autor el 2026-09-10 con MLX 0.32.0, decodificacion codiciosa y el encoder de chat del modelo original en modo `chat`, sobre un Mac Studio M3 Ultra de 256 GiB.

| Diagnostico | Tokens de salida | Pasos de decodificacion medidos | Sin MTP, cache Engram caliente | MTP nativo, verificacion serial |
|---|---:|---:|---:|---:|
| Aritmetica, prompt de 14 tokens | 9, incluido EOS | 8 | 9,46 tokens/s | 8,54 tokens/s |
| Funcion Python, prompt de 16 tokens | 24, detenido por limite de salida | 23 | 8,80 tokens/s | 8,17 tokens/s |

El autor aclara que la cifra destacada de 9,5 tokens/s redondea el resultado de 9,46 y que se trata de una observacion corta, no de una garantia de velocidad sostenida. La carga inicial del modelo y el procesamiento del prompt quedan excluidos de la velocidad de decodificacion. En una comparacion separada de dos prompts repetidos sin cache explicita de filas Engram, el adaptador optimizado sin MTP produjo entre 8,62 y 8,97 tokens/s. Los MTP nativos generaron salidas codiciosas identicas en ambos diagnosticos.

## Requisitos de hardware

- Memoria unificada: el backbone de texto medido ocupa 160,88 GiB; las tablas Engram suman 57,22 GiB y permanecen en SSD. Los pesos MTP anaden 4,15 GiB cuando se cargan.
- Pico de RSS de proceso: 166,69 GiB en una sesion de benchmark combinada, sin contar la cache del sistema de ficheros ni el resto del uso del sistema.
- Equipo probado: Mac Studio M3 Ultra con 256 GiB de memoria unificada. Es previsible que se necesite ese orden de magnitud de RAM unificada, con margen adicional para macOS, asignaciones temporales y crecimiento del contexto.
- GPU dedicadas: no aplicable. El formato es MLX y no hay ruta CUDA documentada; no cabe en una RTX 4090 (24 GB) ni en configuraciones de 64 o 128 GB.
- Opciones de despliegue: unicamente el runtime propio incluido en el repositorio (`runtime/requirements.txt`, `runtime/generate.py`, pruebas con `unittest`). No arranca servidor. Los cargadores MLX estandar y oMLX no han sido validados para este checkpoint con layout de origen; vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato.
- Latencia y throughput: 8,80-9,46 tokens/s en decodificacion codiciosa con cache Engram caliente; 8,17-8,54 tokens/s con MTP nativo y verificacion serial. La carga en frio tardo aproximadamente tres minutos en el entorno de desarrollo, cifra dependiente del almacenamiento.
- Almacenamiento: el repositorio ocupa 238,80 GB, mas espacio libre para la cache de filas Engram y el sistema.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con su modelo de origen. No se han identificado en la informacion proporcionada otras conversiones MLX comparables de DeepSeek-V4.1-Flash ni alternativas de la misma categoria con datos verificables.

| Modelo | Parametros | Precision / cuantizacion | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-MLX-MAC (esta ficha) | 763.205.315.794 | 2 bits afin, group size 64 | Safetensors MLX, 48 shards, 238,80 GB | 1.048.576 tokens declarados en la config original; contexto largo no validado | MIT para la conversion | Publicado en HuggingFace; runtime propio; no validado en cargadores MLX estandar |
| deepseek-ai/DeepSeek-V4.1-Flash (modelo base) | igual arquitectura y parametros que el origen de la conversion | Precision mixta FP4/FP8 con componentes BF16/F32 | no disponible | 1.048.576 tokens segun la config referenciada | no disponible en la informacion proporcionada | Modelo oficial de referencia |

## Limitaciones y advertencias

- Caracter experimental explicito: es un lanzamiento de pesos y runtime independiente, no una release de oMLX que se pueda usar como sustituto directo.
- Compatibilidad: los cargadores MLX estandar y oMLX no han sido validados para este checkpoint con layout de origen; el autor indica que no se instala soporte en oMLX.
- Contexto: aunque la config del modelo original especifica 1.048.576 tokens, el contexto largo no esta validado en esta conversion y el runtime de diagnostico impone un limite de 128 tokens.
- Rendimiento no representativo: los 9,46 tokens/s corresponden a prompts muy cortos con cache Engram caliente; en conversaciones reales la tasa de aciertos de cache puede ser distinta y la velocidad sostenida no esta garantizada.
- MTP mas lento en la configuracion actual: la verificacion serial de los MTP nativos rindio por debajo de la decodificacion estandar y la verificacion por bloques acelerada no esta validada. La media de tokens borrador aceptados fue de 1,33 y 1,00 por bloque.
- Calidad no demostrada: no hay benchmarks de razonamiento, codigo o chat. El unico control de texto registrado es una respuesta aritmetica de una linea y un prefijo de 24 tokens de una funcion Python que no se completo ni se ejecuto. No hay evidencia de que la cuantizacion a 2 bits preserve la calidad del checkpoint FP4/FP8.
- Riesgo de alucionacion y sesgos: no cuantificados en la informacion disponible. Al tratarse de una requantizacion agresiva sin calibracion oQ, el riesgo de degradacion en tareas de razonamiento largo es una incognita abierta.
- Vision: los pesos relacionados con vision se conservan en el checkpoint, pero no hay validacion de su funcionamiento en esta conversion.
- Idiomas: no se declara lista de idiomas soportados; no hay evidencia de comportamiento multilingue en la informacion disponible.
- Licencia: la conversion se publica bajo MIT, pero la licencia del modelo base no consta. Antes de un uso comercial conviene verificar las condiciones del checkpoint original deepseek-ai/DeepSeek-V4.1-Flash.
- Consumo de recursos: exige del orden de 166,69 GiB de RSS y 238,80 GB de almacenamiento, lo que restringe su uso a equipos Apple Silicon de gama muy alta.
- Model card incompleta: el contenido disponible se corta en la seccion de validacion y limitaciones, por lo que pueden existir restricciones adicionales no recogidas aqui.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/0xSojalSec/DeepSeek-V4.1-Flash-MLX-MAC
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Apple MLX (repositorio): https://github.com/ml-explore/mlx
- Sitio de DeepSeek: https://www.deepseek.com/
- Repositorio de referencia citado en la model card (logo): https://github.com/deepseek-ai/DeepSeek-V2
- Runtime y guia de uso: carpeta `runtime/` del repositorio descargado (`runtime/README.md`, `runtime/requirements.txt`, `runtime/generate.py`)
- Descarga indicada por el autor: `hf download Vontra/DeepSeek-V4.1-Flash-MLX-2bit-MTP --local-dir DeepSeek-V4.1-Flash-MLX-2bit-MTP` (nota: el identificador usado en el comando de descarga no coincide con el identificador de esta ficha)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente herramientas de conversion de documentos sin relacion con el contenido de esta ficha.
