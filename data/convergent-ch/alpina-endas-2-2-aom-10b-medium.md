# Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium

## Resumen

Alpina Endas 2.2-AoM-10B-Medium es un ensamblaje experimental de cinco modelos de texto independientes que el autor denomina AoM (Assembly of Models, segun la nomenclatura de los tags). Lo desarrolla Convergent-ch y no se distribuye como una red neuronal fusionada, sino como cinco archivos GGUF separados que se ejecutan de forma independiente en Ollama: un Input-Divisor de 7.615.616.512 parametros derivado de Qwen2.5-7B-Instruct y cuatro especialistas de 752.393.024 parametros cada uno derivados de Qwen3.5-0.8B (coder, code reviewer, matematicas y logica/ciencia). El total agregado es de 10.625.188.608 parametros, de ahi la etiqueta comercial "10B".

El problema que intenta resolver es la orquestacion manual de tareas: el Input-Divisor trocea la peticion del usuario y planifica su asignacion a los especialistas. Sin embargo, la propia model card advierte de que las descargas no anaden orquestacion multi-modelo automatica a Ollama estandar, por lo que el flujo de planificacion y despacho debe implementarlo el usuario por su cuenta.

Es relevante ahora como ejemplo de patron de composicion modular de modelos pequenos en lugar de escalado monolitico, y por su enfoque de despliegue en hardware de consumo: el entrenamiento se realizo localmente en una RTX 3060 Ti y el conjunto completo de GGUF pesa 7,93 GB. Se trata de un artefacto de investigacion con datos de entrenamiento acotados, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblaje de cinco transformers independientes (un Input-Divisor derivado de Qwen2.5-7B-Instruct y cuatro especialistas derivados de Qwen3.5-0.8B); no es una red fusionada |
| Parametros totales | 10.625.188.608 en GGUF de texto; 11.027.560.192 en los modelos fuente originales, incluyendo pesos de vision omitidos en los especialistas de texto |
| Parametros activos | No aplica (no es MoE; cada miembro se ejecuta de forma independiente) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Input-Divisor en Q4_K_M; especialistas en Q8_0; adaptadores LoRA fusionados antes de la conversion a GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de descarga separado) |

Desglose por miembro:

| Miembro | Parametros en su GGUF | Cuantizacion |
|---|---:|---|
| Input-Divisor | 7.615.616.512 | Q4_K_M |
| Coder | 752.393.024 | Q8_0 |
| Code reviewer | 752.393.024 | Q8_0 |
| Mathematics | 752.393.024 | Q8_0 |
| Logic and science | 752.393.024 | Q8_0 |
| Total AoM | 10.625.188.608 | - |

## Arquitectura y entrenamiento

El sistema no es un transformer unico ni un MoE, sino una coleccion de cinco modelos con pesos almacenados de forma independiente. El Input-Divisor se deriva de Qwen2.5-7B-Instruct mediante NF4 QLoRA y actua como planificador: divide la peticion del usuario en tareas y decide su asignacion a los especialistas. Los cuatro especialistas se derivan de Qwen3.5-0.8B mediante LoRA en BF16. Todos los adaptadores se fusionaron en los pesos base antes de la conversion a GGUF, de modo que cada archivo descargado es un modelo autonomo ejecutable en Ollama estandar.

El entrenamiento fue local en una RTX 3060 Ti y utiliza datos acotados: el codigo emplea ejemplos self-oss-instruct, las matematicas usan datos de entrenamiento de GSM8K y la parte de ciencia combina datos de entrenamiento de ARC con ejemplos sinteticos de logica. El autor califica explicitamente estas especializaciones como "small-data" y experimentales, con riesgo de sobreajuste a los patrones sinteticos acotados. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles mediante cinco modelos independientes.
- Planificacion y descomposicion de tareas: el Input-Divisor divide la peticion y planifica su asignacion a los especialistas.
- Generacion de codigo mediante el especialista coder.
- Revision de codigo mediante el especialista code reviewer, que emite critica sobre el codigo.
- Resolucion de problemas matematicos mediante el especialista de matematicas.
- Razonamiento logico y respuesta a preguntas de ciencia mediante el especialista logic_science.
- Despliegue individual de cada miembro en Ollama mediante Modelfiles proporcionados por el autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Planificacion de tareas de desarrollo: usar el Input-Divisor para descomponer una peticion compleja en subtareas y enrutar cada una al especialista correspondiente mediante un orquestador propio, ya que Ollama estandar no anade esta orquestacion automaticamente.
- Generacion de fragmentos de codigo en local: el especialista coder de 752 millones de parametros en Q8_0 cabe en GPUs de consumo y permite prototipar generacion de codigo sin conexion.
- Revision estatica asistida de parches: el especialista code reviewer puede generar comentarios de revision sobre diffs antes de un pipeline de CI/CD, teniendo en cuenta que el codigo no se ejecuta ni se prueba automaticamente.
- Practica de problemas matematicos de nivel GSM8K: el especialista de matematicas, entrenado sobre datos de GSM8K, sirve para resolver ejercicios de aritmetica de varios pasos en un entorno educativo controlado.
- Preguntas de ciencia y logica: el especialista logic_science, entrenado con datos de ARC y ejemplos sinteticos, puede responder cuestionarios de opcion multiple y ejercicios de razonamiento.
- Investigacion sobre composicion modular de modelos: el ensamblaje sirve como banco de pruebas para estudiar enrutamiento, descomposicion de tareas y coordinacion entre modelos pequenos especializados frente a un modelo monolitico.
- Despliegue en hardware modesto: con 7,93 GB totales de descarga y entrenamiento realizado en una RTX 3060 Ti, el conjunto es adecuado para experimentar en estaciones de trabajo con una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y advierte de que no se han establecido mejoras amplias en codigo o razonamiento.

## Requisitos de hardware

- El conjunto completo de GGUF ocupa 7,93 GB en disco, repartidos entre cinco archivos.
- Input-Divisor: 7.615.616.512 parametros en Q4_K_M; requiere aproximadamente entre 5 y 6 GB de VRAM para inferencia, estimacion orientativa a partir del tamano del archivo.
- Cada especialista: 752.393.024 parametros en Q8_0; requiere aproximadamente 1 GB de VRAM por modelo, estimacion orientativa.
- Como los cinco miembros se ejecutan de forma independiente, no es necesario cargar todos simultaneamente; la VRAM necesaria depende del miembro activo y del orquestador.
- GPU recomendadas: RTX 3060 Ti o superior para el Input-Divisor; los especialistas caben en GPUs de consumo con 4 GB o mas de VRAM.
- El entrenamiento se realizo localmente en una RTX 3060 Ti, lo que confirma la viabilidad en hardware de consumo.
- Opciones de despliegue: Ollama mediante los Modelfiles proporcionados por el autor; llama.cpp es compatible al tratarse de archivos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Alpina Endas 2.2-AoM-10B-Medium | 10,63B agregados en 5 modelos (7,62B + 4 x 0,75B) | No disponible | Apache 2.0 | GGUF | Ensamblaje experimental; requiere orquestacion externa |
| Qwen2.5-7B-Instruct | 7,62B | No disponible en la informacion proporcionada | Apache 2.0 | Safetensors, GGUF | Modelo base del Input-Divisor; monolitico y de proposito general |
| Qwen3.5-0.8B | 0,75B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base de los cuatro especialistas |

La comparacion con alternativas monoliticas de tamano similar (por ejemplo, modelos densos de 7 a 8 mil millones de parametros) no puede completarse con datos de rendimiento porque el autor no publica benchmarks. La diferencia estructural es que Alpina Endas reparte la carga entre cinco modelos con cuantizaciones distintas y no ofrece una unica red con contexto compartido.

## Limitaciones y advertencias

- Especializaciones experimentales entrenadas con datos acotados; el Input-Divisor y el revisor pueden sobreajustar patrones sinteticos.
- Las criticas del code reviewer y las respuestas cientificas pueden ser erroneas, segun advierte el propio autor.
- No se han establecido mejoras amplias en codigo o razonamiento.
- El codigo generado no se ejecuta ni se prueba automaticamente.
- El conjunto no anade orquestacion multi-modelo automatica a Ollama estandar; el total de parametros es un agregado, no una red fusionada.
- Los especialistas de texto omiten los pesos de vision de los modelos fuente.
- Solo se declara soporte de ingles.
- Longitud de contexto no documentada.
- Riesgo de alucinacion inherente a modelos de este tamano y a los datos sinteticos de entrenamiento; no se documentan sesgos especificos.
- Licencia Apache 2.0, que permite uso comercial, pero el caracter experimental y la ausencia de evaluaciones desaconsejan su uso en produccion sin validacion propia.
- No incluye aplicacion de escritorio, entrada de inicio ni instalador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium
- Repositorio de pesos GGUF: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium-GGUF
- Arbol de descargas GGUF: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium-GGUF/tree/main
- Input-Divisor Q4_K_M: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium-GGUF/resolve/main/input-divisor-Q4_K_M.gguf?download=true
- Coder Q8_0: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium-GGUF/resolve/main/coder_builder-Q8_0.gguf?download=true
- Code reviewer Q8_0: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium-GGUF/resolve/main/coder_reviewer-Q8_0.gguf?download=true
- Mathematics Q8_0: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium-GGUF/resolve/main/math-Q8_0.gguf?download=true
- Logic and science Q8_0: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium-GGUF/resolve/main/logic_science-Q8_0.gguf?download=true
- Modelo base del Input-Divisor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base de los especialistas: https://huggingface.co/Qwen/Qwen3.5-0.8B
