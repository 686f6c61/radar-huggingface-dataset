# incoai/Qwen3.8-27B-Splash

## Resumen

Qwen3.8-27B-Splash es un paquete de inferencia publicado por Inco AI para su motor Splash, un runtime de codigo abierto para Apple Silicon. No es un checkpoint convencional: agrupa el modelo objetivo Qwen3.8-27B en su conversion de 4 bits, su draft DFlash 2 para decodificacion especulativa, el codificador de vision y el tokenizer, todo ello como artefactos de runtime de layout fijo. El repositorio ocupa 17,4 GB y se distribuye bajo licencia Apache-2.0.

El modelo subyacente, Qwen3.8-27B, es un transformer denso de 27.000 millones de parametros desarrollado por el equipo Qwen de Alibaba. Inco AI se encarga del empaquetado: kernels especificos por modelo, un draft DFlash 2 propio y un plan de memoria calculado para la maquina concreta en la que se va a servir. El paquete se construye a partir de `mlx-community/Qwen3.8-27B-4bit` (objetivo, tokenizer y vision) y de `incoai/Qwen3.8-27B-DFlash2` (draft).

Su relevancia es acotada pero clara: permite servir localmente un modelo denso de 27B con vision, tool calling, salida con JSON Schema y modo de razonamiento ajustable, exponiendo APIs compatibles con OpenAI Chat Completions, OpenAI Responses y Anthropic Messages. El precio es la dependencia total del motor Splash: no carga en Transformers, MLX ni llama.cpp, y exige un Mac con M3 o superior y al menos 36 GB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) empaquetado con draft DFlash 2 para decodificacion especulativa |
| Parametros totales | 27.000 millones (modelo denso) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el contexto util queda limitado por la memoria restante tras cargar los pesos) |
| Tipos de cuantizacion | 4 bits (conversion MLX de mlx-community, incluida en el paquete) |
| Idiomas soportados | no disponible (la model card remite a los idiomas de Qwen3.8-27B, sin enumerarlos) |
| Licencia | Apache-2.0 |
| Formato de pesos | artefactos de runtime de layout fijo del motor Splash; no es safetensors, ni GGUF, ni checkpoint MLX |
| Tamano del repositorio | 17,4 GB |
| Motor de inferencia | Splash (Inco AI), exclusivo para Apple Silicon |
| Modelos base | mlx-community/Qwen3.8-27B-4bit; incoai/Qwen3.8-27B-DFlash2 |
| Relacion con el modelo base | quantized |
| Plataforma minima | Apple M3 o superior, macOS 26.4 o posterior |
| Memoria unificada | 36 GB minimo; 48 GB o mas recomendado |
| Fecha de publicacion | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura del modelo objetivo es la de Qwen3.8-27B: un transformer denso de 27.000 millones de parametros con capacidades multimodales de entrada (texto, imagenes y PDF incrustados). Sobre esa base, Inco AI no reentrena ni ajusta el modelo, sino que lo empaqueta. El paquete incorpora tres piezas diferenciadas: el modelo objetivo en 4 bits procedente de la conversion de mlx-community, el codificador de vision y el tokenizer, junto con el draft DFlash 2 desarrollado por Inco AI.

La innovacion tecnica destacable es la decodificacion especulativa con DFlash 2. El draft propone tokens y el modelo objetivo verifica cada uno de ellos, de modo que el mecanismo altera la velocidad de generacion pero no la distribucion de salida del modelo. Ademas, el runtime calcula un plan de memoria especifico para cada maquina en el arranque, con kernels propios por modelo, y aborta con un desglose del presupuesto si el modelo no cabe. No se han facilitado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO: esa informacion corresponde a la model card de Qwen3.8-27B y no se reproduce en este paquete.

## Capacidades

- Generacion de texto y razonamiento con profundidad ajustable. El razonamiento esta activado por defecto en el nivel `xhigh` del modelo; en Chat Completions se controla con `reasoning_effort` (`low`, `medium`, `xhigh`, donde `high` y `max` se mapean a `xhigh`, `minimal` a `low` y `none` lo desactiva). En Responses se usa el mismo conjunto de valores en `reasoning.effort`.
- Entrada multimodal: acepta texto, imagenes y PDF incrustados de hasta 20 paginas y 10 MiB por archivo.
- Tool calling y function calling en las tres APIs que sirve el motor.
- Salida estructurada mediante JSON Schema.
- Streaming en OpenAI Chat Completions, OpenAI Responses y Anthropic Messages.
- Integracion con agentes de codificacion: el comando `splash opencode`, `splash claude`, `splash codex` o `splash hermes` lanza el agente ya instalado apuntando al modelo servido.
- Capacidades multilingues: heredadas de Qwen3.8-27B, sin enumeracion concreta en la informacion disponible.
- Vision: incorpora el codificador de vision del checkpoint de origen, por lo que procesa imagenes ademas de texto.

## Casos de uso

- Agentes de codificacion en local: el paquete esta pensado para servir a OpenCode, Claude Code, Codex CLI y Hermes Agent desde un unico comando, con tool calling y streaming, lo que permite trabajar con un agente de codigo sin enviar el repositorio a un servicio externo.
- Asistencia sobre documentacion tecnica con PDF: al admitir PDF incrustados de hasta 20 paginas y 10 MiB, el modelo puede responder preguntas sobre manuales, especificaciones o informes sin convertir antes los documentos a texto.
- Extraccion de datos estructurados: la salida con JSON Schema permite generar registros validados contra un esquema en tareas de clasificacion, extraccion de entidades o normalizacion de formularios, con verificacion posterior del JSON.
- Analisis de capturas e interfaces: el codificador de vision permite interpretar capturas de pantalla, diagramas de arquitectura o graficos y describirlos o traducirlos a codigo.
- Prototipado con APIs compatibles: al exponer endpoints equivalentes a OpenAI y Anthropic, se puede reutilizar codigo cliente existente y cambiar la URL base a `http://127.0.0.1:8000/v1` para probar integraciones sin coste por token.
- Trabajo con datos sensibles sin salida a red: el servidor escucha en `127.0.0.1` y no requiere autenticacion en local, de modo que es utilizable en entornos con requisitos estrictos de confidencialidad mientras no se exponga a la red.
- Razonamiento con control de coste en tiempo: para tareas simples se puede fijar `reasoning_effort` en `low` o desactivar el razonamiento con `none`, reduciendo los tokens de salida y el tiempo hasta la respuesta final.
- Generacion asistida en el editor: cualquier cliente que hable el protocolo de Chat Completions puede apuntar al servidor local para autocompletado, refactorizacion o generacion de tests sobre un modelo de 27B en 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y tampoco una comparacion de calidad frente al checkpoint en bf16. El autor remite al post de lanzamiento de Splash (`https://inco.ai/blog/splash/`) como fuente de benchmarks del motor, donde se indica ademas que el paquete companero Qwen3.6-35B-A3B-Splash es mas rapido que este en las pruebas de Splash, sin cifras disponibles en esta ficha.

## Requisitos de hardware

- Memoria unificada: 36 GB como minimo, 48 GB o mas recomendado. El motor comprueba la memoria disponible al arrancar y se detiene con un desglose del presupuesto si el modelo no cabe.
- Procesador: Apple M3 o superior. El runtime es especifico de Apple Silicon y Metal.
- Sistema operativo: macOS 26.4 o posterior.
- GPU dedicadas: no soportadas. No hay ruta de ejecucion para CUDA, por lo que el modelo no se puede desplegar en RTX 4090, A100, H100 ni similares. La pregunta de si cabe en una GPU de consumo no aplica: el unico backend es la memoria unificada del Mac.
- Opciones de despliegue: exclusivamente el motor Splash, instalado con `brew install incoai/tap/splash` y arrancado con `splash serve --model incoai/Qwen3.8-27B-Splash`. No carga en vLLM, llama.cpp, Ollama, TGI, MLX ni Transformers. El servidor expone chat en `http://127.0.0.1:8000` y API en `http://127.0.0.1:8000/v1`.
- Almacenamiento y red: la primera ejecucion descarga 17,4 GB, verifica el paquete, calcula el plan de memoria y arranca el servidor. Las descargas interrumpidas se reanudan y las ejecuciones posteriores no necesitan red.
- Contexto y concurrencia: dependen de la memoria que quede libre tras cargar los pesos. Un Mac de 36 GB soporta menos contexto y menos peticiones concurrentes que uno de 48 GB.
- Latencia y throughput: no disponibles. El efecto conocido de DFlash 2 es la mejora de velocidad mediante decodificacion especulativa, sin cifras publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Motor | Licencia | Notas |
|---|---|---|---|---|---|---|
| incoai/Qwen3.8-27B-Splash | 27B densos, 4 bits | no aplica | no disponible | Splash (Apple Silicon) | Apache-2.0 | Incluye draft DFlash 2 y vision; 17,4 GB |
| incoai/Qwen3.6-35B-A3B-Splash | 35B MoE, 4 bits | aprox. 3B por token | no disponible | Splash (Apple Silicon) | Apache-2.0 | Paquete companero; segun el autor, el mas rapido de los dos en los benchmarks de Splash |
| mlx-community/Qwen3.8-27B-4bit | 27B densos, 4 bits | no aplica | no disponible | MLX | Apache-2.0 | Checkpoint upstream del objetivo; sin draft especulativo ni plan de memoria de Splash |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no aplica | no disponible | no disponible | Apache-2.0 | Draft de decodificacion especulativa; no es un modelo de lenguaje autonomo |

No se dispone de comparaciones frente a modelos densos de tamano similar de otros fabricantes dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El paquete hereda los sesgos, el corte de conocimiento y los modos de fallo de Qwen3.8-27B. Hay que consultar la model card upstream para el detalle.
- El objetivo es la conversion a 4 bits de mlx-community. El autor no ha publicado ninguna comparacion de calidad frente al checkpoint en bf16, por lo que la perdida de calidad por cuantizacion es desconocida.
- La decodificacion especulativa cambia la velocidad, no la distribucion de salida: el draft propone y el objetivo verifica cada token. No debe esperarse una mejora de calidad por este mecanismo.
- El razonamiento esta activado por defecto. Los tokens de razonamiento cuentan tanto en el limite de salida como en el tiempo hasta la respuesta final, lo que puede agotar presupuestos de tokens ajustados.
- El contexto util esta acotado por la memoria libre tras los pesos. Un equipo de 36 GB soportara menos contexto y menos peticiones concurrentes que uno de 48 GB, sin valores concretos publicados.
- El servidor enlaza `127.0.0.1` y no implementa autenticacion. Exponerlo a una red sin un proxy delante deja el modelo accesible sin control de acceso.
- Restricciones de portabilidad: no es un checkpoint de Transformers, MLX ni GGUF. Cargarlo fuera de Splash esta explicitamente fuera de alcance; para otros motores hay que usar los checkpoints upstream.
- El draft DFlash 2 no es un modelo de lenguaje autonomo y no debe usarse por separado.
- La licencia Apache-2.0 permite uso comercial, pero cada componente upstream es tambien Apache-2.0 y sigue aplicando la licencia y la politica de uso de Qwen3.8-27B.
- El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta: no hay validacion independiente de la comunidad sobre este empaquetado.
- El modelo solo se ejecuta en Apple Silicon M3 o superior con macOS 26.4 o posterior, lo que excluye cualquier infraestructura x86 o basada en GPU NVIDIA.
- La model card proporcionada aparece truncada en la seccion sobre el campo `thinking` de Anthropic Messages, por lo que el detalle completo de esa integracion no esta disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/incoai/Qwen3.8-27B-Splash
- Motor Splash (GitHub): https://github.com/incoai/splash
- Post de lanzamiento y benchmarks: https://inco.ai/blog/splash/
- DFlash 2: https://inco.ai/blog/dflash2/
- Paquete companero Qwen3.6-35B-A3B-Splash: https://huggingface.co/incoai/Qwen3.6-35B-A3B-Splash
- Checkpoint objetivo upstream: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Draft DFlash 2 para Qwen3.8-27B: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Instalacion de Homebrew: https://brew.sh

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos del repositorio.
