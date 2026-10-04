# e12ex2/breakit-2b

## Resumen

breakit-2b es un modelo de lenguaje de 1.881.825.088 parametros (aproximadamente 1,88 mil millones) desarrollado por el usuario e12ex2 (Neil Bauman) y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo de proposito general: es un atacante especializado en busqueda de fallos. Su tarea concreta consiste en leer un programa en C que pasa todas las pruebas de ejemplo y proponer entradas de test que hagan que el programa imprima una respuesta incorrecta. El modelo no necesita conocer la solucion correcta, solo intentar refutar el programa; cada conjetura se verifica ejecutandola.

Tecnicamente es un fine-tune del modelo base Qwen/Qwen3.5-2B-Base, entrenado con LoRA y posteriormente fusionado, sobre aproximadamente 6.800 pares verificados de (programa incorrecto, entrada que lo rompe), cada uno acompanado de una explicacion del bug en una linea. El dataset asociado es e12ex2/breakit-data. El modelo hereda la arquitectura de texto de la familia Qwen3.5, aunque la model card no detalla numero de capas, mecanismo de atencion ni longitud de contexto entrenada.

Su relevancia actual reside en que ofrece una alternativa local, gratuita y sin conexion a los modelos frontera para una tarea de verificacion de codigo muy concreta. Con 50 intentos alcanza un 69,9% de exito sobre 83 programas C defectuosos reservados, frente al 83,1% de Claude Opus o gpt-6-luna con solo 5 intentos y al 53,0% de un fuzzer de mutacion sin modelo. No supera a los modelos frontera, pero el propio autor lo posiciona como una opcion offline razonable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de texto, derivada de Qwen/Qwen3.5-2B-Base (etiqueta qwen3_5_text); numero de capas, cabezas y tipo de atencion no disponibles |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible; el formato de prompt de la model card esta redactado en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen3.5-2B-Base (fine-tune con LoRA fusionado) |
| Dataset de entrenamiento | e12ex2/breakit-data (aproximadamente 6.800 pares verificados) |
| Tamano del repositorio | 5,5 GB |
| Fecha de publicacion | 2026-10-04 (ultima actualizacion 2026-10-04) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-2B-Base, un transformer decoder de la familia Qwen3.5 para texto. La model card y las etiquetas del repositorio no aportan informacion sobre el numero de capas, el esquema de atencion, la funcion de activacion ni la longitud de contexto soportada, por lo que esos detalles quedan como no disponibles. El ajuste se realizo mediante LoRA sobre el modelo base y los pesos resultantes se fusionaron en un unico checkpoint de aproximadamente 1,88 mil millones de parametros, publicado en safetensors.

El entrenamiento se llevo a cabo sobre unos 6.800 pares verificados de tipo (programa incorrecto, entrada que lo rompe). Cada par incluye ademas una explicacion del bug en una sola linea. La verificacion es un componente central del diseno: no se aceptan conjeturas del modelo sin comprobarlas ejecutandolas contra soluciones de referencia, de modo que el modelo aprende a producir entradas que rompen el programa y a justificar brevemente por que. No se documenta en la informacion disponible si hubo fases de RLHF, DPO u otro tipo de alineacion posterior, ni la composicion exacta del dataset mas alla de que los programas estan en C y provienen de problemas de tipo competitivo o de verificacion. Tampoco se detalla ningun mecanismo de innovacion tecnica adicional (decodificacion especulativa, atencion lineal, decodificacion restringida por gramatica, etc.).

## Capacidades

- Generacion de entradas de test que rompen programas en C: el modelo produce una explicacion del fallo y una entrada valida que provoca una respuesta incorrecta o un fallo en ejecucion.
- Razonamiento sobre codigo orientado a falsacion: no busca la solucion correcta, sino refutar el programa dado, lo que lo hace util como atacante automatico dentro de un pipeline de validacion.
- Comprension de enunciados de problemas y de codigo fuente en C, ya que el formato de prompt combina el enunciado del problema, el programa candidato y la peticion de contraejemplo.
- Generacion de contraejemplos verificables: cada salida esta pensada para ejecutarse y comprobarse, no para aceptarse por confianza.
- Busqueda multi-intento: la evaluacion publicada mide el exito acumulado con 5 y con 50 conjeturas, lo que implica que el modelo esta disenado para muestrear varias entradas por programa en lugar de dar una unica respuesta.
- Explicacion del bug: cada par de entrenamiento incluye una explicacion en una linea, y el formato de prompt la solicita explicitamente antes de la entrada rompedora.
- No se documentan capacidades de tool calling, function calling, uso de agentes, vision, audio ni modo de razonamiento extendido (thinking mode). No hay evidencia en la informacion disponible de soporte multilingue mas alla del ingles de los prompts.

## Casos de uso

- Verificacion automatica en jueces de programacion competitiva: tras recibir un envio que pasa las pruebas de ejemplo, se lanzan 50 conjeturas del modelo, se ejecutan contra las soluciones de referencia y, si alguna discrepa, el envio se marca como incorrecto antes de enviarlo al usuario.
- Generacion de conjuntos de pruebas para bibliotecas y funciones criticas: el modelo propone entradas limite que el conjunto de tests actual no cubre, y esas entradas se incorporan a la suite de pruebas una vez verificadas.
- Triaje de candidatos en pipelines de sintesis de codigo: cuando un generador de codigo produce varias soluciones que superan los tests de ejemplo, breakit-2b actua como filtro barato y local para descartar las que tienen fallos no detectados.
- Educacion y ensenanza de depuracion: dado un programa erroneo, el modelo aporta una explicacion breve del bug y un caso concreto que lo expone, lo que sirve como material didactico para estudiantes de programacion.
- Auditoria offline en entornos sin conexion: al ser un modelo de 1,88 mil millones de parametros ejecutable en local, encaja en entornos con requisitos de confidencialidad donde no se pueden enviar programas a APIs externas.
- Fuzzing guiado por modelo como complemento al fuzzing de mutacion: en la evaluacion publicada el modelo supera al fuzzer de mutacion sin modelo (69,9% frente a 53,0% con 50 intentos), por lo que puede combinarse con tecnicas clasicas para aumentar la cobertura de fallos.
- Investigacion en falsacion automatica y verificacion de programas: sirve como punto de partida reproducible y de bajo coste para estudiar si un modelo pequeno, entrenado solo con pares verificados, puede aproximarse al comportamiento de un atacante de mayor tamano.

## Benchmarks y rendimiento

La model card publica una evaluacion sobre 83 programas C defectuosos, reservados y provenientes de problemas no vistos. Un programa cuenta como roto si alguna conjetura es una entrada legal sobre la que el programa discrepa de soluciones de referencia unanimes, o si provoca un fallo en ejecucion. Se aplican validadores estrictos de entrada por problema.

| Atacante | 5 conjeturas | 50 conjeturas |
|---|---|---|
| Claude Opus | 83,1% | No disponible |
| gpt-6-luna | 83,1% | No disponible |
| breakit-2b (este modelo) | 27,7% | 69,9% |
| Qwen3.5-0.8B, misma receta sin explicaciones de bug | 24,1% | 68,7% |
| Qwen3.5-0.8B-Base sin entrenar | 31,3% | No disponible |
| Fuzzer de mutacion (sin modelo) | No disponible | 53,0% |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Los unicos datos disponibles son los de esta tarea especifica de falsacion de programas en C.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento real de parametros, no publicada por el autor): aproximadamente 3,8 GB en BF16/FP16 solo para pesos, alrededor de 1,9 GB en cuantizacion INT8 y en torno a 1,0-1,2 GB en INT4. Anadiendo cache KV y overhead del runtime, se puede asumir del orden de 5-6 GB en BF16, 3 GB en INT8 y 2 GB en INT4, dependiendo de la longitud de contexto efectiva.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070, RTX 4080 o RTX 4090. En el extremo profesional, cabe holgadamente en A100, H100, L40S o incluso en GPUs de gama de entrada con 8 GB. El modelo tambien puede ejecutarse en CPU, dado su tamano.
- Cabe en GPU consumer: si, con claridad. Con cuantizacion INT4 es viable incluso en equipos con 6-8 GB de VRAM, y en BF16 en cualquier GPU con 8 GB o mas.
- Opciones de despliegue: al ser un checkpoint safetensors de la familia Qwen3.5, es compatible en principio con vLLM, TGI, SGLang y transformers para inferencia en GPU. En CPU, llama.cpp u Ollama serian adecuados, pero requeriria convertir los pesos a GGUF, y no hay evidencia en la informacion disponible de que existan versiones GGUF publicadas.
- Latencia y throughput estimados: no disponibles. El autor no publica medidas de latencia ni de tokens por segundo. Como referencia estructural, el escenario de evaluacion implica 50 generaciones por programa, por lo que el coste por programa es 50 veces el de una unica generacion.

## Comparativa con modelos similares

No se conocen modelos de proposito general comparables: breakit-2b es un atacante especializado, no un asistente conversacional. La comparativa mas razonable es la que ofrece la propia model card frente a otros atacantes.

| Modelo | Parametros | Enfoque | 5 conjeturas | 50 conjeturas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| breakit-2b | 1,88 mil millones | Fine-tune de Qwen3.5-2B para falsar programas en C | 27,7% | 69,9% | Apache 2.0 | Pesos abiertos en HuggingFace |
| Claude Opus | No disponible | Modelo frontera propietario de uso general | 83,1% | No disponible | Propietaria | Solo API |
| gpt-6-luna | No disponible | Modelo frontera propietario de uso general | 83,1% | No disponible | Propietaria | Solo API |
| Qwen3.5-0.8B, misma receta sin explicaciones de bug | 0,8 mil millones (aproximado, no confirmado) | Fine-tune especializado con receta ablacionada | 24,1% | 68,7% | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Qwen3.5-0.8B-Base sin entrenar | 0,8 mil millones (aproximado, no confirmado) | Modelo base sin ajuste especifico | 31,3% | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Fuzzer de mutacion | No aplica | Tecnica clasica de generacion de entradas sin modelo | No disponible | 53,0% | No aplica | Herramienta generica |

Un detalle relevante de la tabla es que el Qwen3.5-0.8B-Base sin entrenar obtiene un 31,3% con 5 conjeturas, ligeramente por encima del 27,7% de breakit-2b. La ventaja del modelo ajustado aparece al escalar el numero de intentos, donde llega al 69,9% con 50 conjeturas. La comparacion con modelos de 0,8 mil millones, en lugar de con el propio Qwen3.5-2B-Base sin ajustar, es una limitacion de la evaluacion publicada.

## Limitaciones y advertencias

- Rendimiento muy inferior a los modelos frontera: 27,7% con 5 conjeturas frente al 83,1% de Claude Opus y gpt-6-luna, y 69,9% con 50 conjeturas. No es una alternativa a un modelo frontera, sino una opcion local de bajo coste.
- Ausencia de una comparacion directa con su propio modelo base: la evaluacion contrasta con variantes de Qwen3.5-0.8B, no con Qwen3.5-2B-Base sin entrenar, lo que impide aislar con precision la ganancia atribuible al ajuste a este tamano.
- Riesgo de alucinacion en la explicacion del bug: el modelo genera una explicacion en lenguaje natural antes de la entrada rompedora, y esa explicacion puede ser incorrecta aunque la entrada final si rompa el programa. La verificacion por ejecucion solo valida la entrada, no el texto explicativo.
- Las entradas propuestas pueden ser invalidas: la model card indica explicitamente que se aplican validadores estrictos por problema, lo que implica que una parte de las conjeturas no cumple las restricciones de entrada y se descarta. El tanto por ciento de exito refleja entradas validas, no generaciones brutas.
- Especializacion estrecha: el modelo esta entrenado para programas en C que pasan las pruebas de ejemplo. No hay evidencia de que funcione con otros lenguajes, con programas ya fallidos en las pruebas de ejemplo o con tareas de generacion de codigo convencionales.
- Idiomas: no se documenta soporte multilingue. El formato de prompt de la model card esta en ingles, y no hay datos sobre comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada: se desconoce la ventana maxima soportada, lo que es un riesgo para programas o enunciados largos que se acerquen a ese limite.
- Datos de contexto y arquitectura incompletos: no se publican el numero de tokens de entrenamiento, la composicion del dataset (mas alla del recuento de pares), ni detalles de arquitectura internos.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, sin clausulas de uso aceptable documentadas en la informacion disponible. Conviene verificar igualmente las condiciones del modelo base Qwen/Qwen3.5-2B-Base del que deriva.
- Adopcion muy baja: 22 descargas y 0 me gusta en el momento de recopilar la informacion, lo que limita la validacion independiente de los resultados por parte de terceros.
- No hay resultados en benchmarks estandar: no se puede situar el modelo en tareas generales de razonamiento, codigo o matematicas, solo en la tarea especifica de falsacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/e12ex2/breakit-2b
- Dataset de entrenamiento: https://huggingface.co/datasets/e12ex2/breakit-data
- Perfil del autor en HuggingFace: https://huggingface.co/e12ex2
- Ficha del autor en LLM Explorer: https://llm-explorer.com/list/?mtr=e12ex2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- No se han encontrado en la busqueda web papers, blogs tecnicos ni repositorios de codigo asociados especificamente a breakit-2b.
