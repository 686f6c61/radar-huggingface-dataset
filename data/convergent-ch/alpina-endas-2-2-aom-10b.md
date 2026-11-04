# Convergent-ch/Alpina-Endas-2.2-AoM-10B

## Resumen

Alpina Endas 2.2-AoM-10B es un ensamblaje experimental de cinco modelos de texto independientes publicado por Convergent-ch bajo el paradigma que el autor denomina AoM (Assembly of Models, agregacion de modelos). No se trata de un unico transformer fusionado, sino de una coleccion de pesos almacenados por separado que suman 10.625.188.608 parametros en total: un modelo enrutador y planificador de 7.615.616.512 parametros (derivado de Qwen2.5-7B-Instruct) y cuatro especialistas de 752.393.024 parametros cada uno (derivados de Qwen3.5-0.8B) dedicados a generacion de codigo, revision de codigo, matematicas y logica/ciencia.

El modelo aborda el problema de la especializacion por tarea sin renunciar a un unico punto de entrada: el componente Input-Divisor divide la peticion del usuario en tareas y planifica su asignacion a los especialistas correspondientes. La propuesta es relevante como experimento de orquestacion multi-modelo de bajo coste, ya que todo el entrenamiento se realizo localmente en una unica GPU RTX 3060 Ti, y el conjunto completo se distribuye en GGUF con un tamano total de descarga de 7,93 GB.

El proyecto es explicitamente experimental: los especialistas se entrenaron con conjuntos de datos sinteticos acotados y el autor advierte de sobreajuste a esos patrones. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblaje de cinco transformers independientes (AoM); enrutador derivado de Qwen2.5-7B-Instruct y especialistas derivados de Qwen3.5-0.8B |
| Parametros totales | 10.625.188.608 (agregado de los cinco miembros; los modelos fuente completos suman 11.027.560.192 incluyendo pesos de vision omitidos en los GGUF de texto) |
| Parametros activos | No aplica como MoE; el Input-Divisor tiene 7.615.616.512 y cada especialista 752.393.024 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Input-Divisor en Q4_K_M; especialistas en Q8_0; entrenamiento con NF4 QLoRA (enrutador) y BF16 LoRA (especialistas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptadores fusionados antes de la conversion) |

## Arquitectura y entrenamiento

El sistema no es una red unica sino una agregacion orquestada de cinco modelos almacenados de forma independiente. El Input-Divisor, construido sobre Qwen2.5-7B-Instruct, actua como planificador: descompone la peticion en tareas y decide que especialista las atiende. Los cuatro especialistas (coder_builder, coder_reviewer, math y logic_science) parten de Qwen3.5-0.8B y se afinan para dominios concretos. El Input-Divisor se entreno con NF4 QLoRA y los especialistas con BF16 LoRA; en todos los casos los adaptadores se fusionaron en los pesos base antes de generar los GGUF.

El entrenamiento se realizo de forma local en una RTX 3060 Ti. Los datos son deliberadamente acotados: el codigo emplea ejemplos de self-oss-instruct, las matematicas usan el conjunto de entrenamiento de GSM8K y la rama de ciencia combina datos de entrenamiento de ARC con ejemplos sinteticos de logica. El autor indica que el Input-Divisor y el revisor se entrenaron sobre patrones sinteticos delimitados y pueden sobreajustarse a ellos. No se documenta numero de tokens de entrenamiento ni proceso de RLHF o DPO.

## Capacidades

- Generacion de texto y planificacion de tareas mediante el componente Input-Divisor.
- Generacion de codigo a traves del especialista coder_builder.
- Revision y critica de codigo mediante el especialista coder_reviewer.
- Resolucion de problemas matematicos con el especialista math, entrenado sobre GSM8K.
- Razonamiento logico y cientifico con el especialista logic_science, entrenado sobre ARC y logica sintetica.
- Enrutamiento multi-modelo: division de una peticion en subtareas y asignacion a especialistas.
- Despliegue individual de cada miembro como modelo independiente en Ollama.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma nativa; el unico mecanismo multi-paso es la planificacion del Input-Divisor.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio o modo thinking explicito: no disponibles en los GGUF de texto.

## Casos de uso

- Enrutamiento de peticiones mixtas en un asistente tecnico: el Input-Divisor clasifica la consulta y la deriva al especialista adecuado (codigo, matematicas o ciencia), lo que permite un unico punto de entrada con respuestas mas focalizadas.
- Generacion de fragmentos de codigo en prototipos: el especialista coder_builder puede producir funciones y snippets sobre Qwen3.5-0.8B, adecuado para entornos de desarrollo con recursos limitados.
- Revision automatizada de parches en un pipeline de CI: coder_reviewer puede generar comentarios de revision sobre diffs, aunque sus criticas deben validarse porque el autor advierte que pueden ser erroneas.
- Resolucion de problemas aritmeticos de tipo GSM8K: el especialista math sirve para ejercicios de razonamiento matematico de nivel escolar en ingles.
- Preguntas de logica y ciencia de nivel ARC: el especialista logic_science permite construir un banco de pruebas de QA cientifico de baja latencia.
- Despliegue ligero en hardware de consumo: al distribuirse en GGUF (7,93 GB en total) y poder ejecutarse cada miembro por separado en Ollama, es viable en equipos con GPU modesta o incluso CPU.
- Investigacion sobre orquestacion multi-modelo: el ensamblaje sirve como banco de pruebas para estudiar enrutamiento y especializacion con modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el Input-Divisor en Q4_K_M ocupa aproximadamente 4,5 GB; cada especialista en Q8_0 ronda los 0,8 GB. La ejecucion secuencial de enrutador y un especialista requiere en torno a 5-6 GB de VRAM.
- GPU recomendadas: RTX 3060 Ti (la usada en el entrenamiento) es suficiente para el Input-Divisor; cualquier GPU con 6 GB o mas puede alojar el flujo completo.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: Ollama mediante los Modelfile incluidos (importacion con `ollama create`); llama.cpp por ser formato GGUF. No se documenta soporte para vLLM o TGI, ya que cada miembro es un modelo independiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Alpina Endas 2.2-AoM-10B | 10,63B agregados (7,6B enrutador + 4 x 0,75B especialistas) | No disponible | Apache 2.0 | Ensamblaje multi-modelo con enrutador |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (segun modelo base) | Apache 2.0 | Modelo unico generalista |
| Qwen3.5-0.8B | 0,75B | No disponible | Apache 2.0 | Modelo unico pequeno |
| Mixture-of-Experts convencional (referencia) | Variable | Variable | Variable | Red unica con enrutamiento interno |

El ensamblaje se distingue de un MoE convencional en que los expertos no comparten una red ni un enrutador entrenado conjuntamente: son pesos independientes que requieren orquestacion externa. Frente a Qwen2.5-7B-Instruct, ofrece especializacion por dominio pero con menor garantia de calidad general, dado su caracter experimental y sus datos de entrenamiento acotados.

## Limitaciones y advertencias

- Modelos experimentales entrenados con datos pequenos y sinteticos; el Input-Divisor y el revisor pueden sobreajustarse a los patrones de entrenamiento.
- Las criticas del revisor de codigo y las respuestas cientificas pueden ser incorrectas.
- No se ha demostrado una mejora general en codigo o razonamiento frente a los modelos base.
- El codigo generado no se ejecuta ni se prueba automaticamente.
- El unico idioma declarado es el ingles; no hay soporte multilingue documentado.
- No hay orquestacion automatica multi-modelo en Ollama estandar: el total de parametros es un agregado, no una red fusionada.
- No se incluye aplicacion de escritorio, entrada de inicio ni instalador.
- La longitud de contexto no esta documentada, lo que limita su uso en conversaciones largas sin verificacion previa.
- Riesgo de alucinacion inherente a modelos de este tamano, agravado por la especializacion estrecha de los datos.
- Licencia Apache 2.0 permite uso comercial, pero el caracter experimental desaconseja su uso en produccion sin evaluacion propia.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B
- HuggingFace (repositorio de pesos GGUF): https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-GGUF
- Modelo base Input-Divisor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base especialistas: https://huggingface.co/Qwen/Qwen3.5-0.8B
