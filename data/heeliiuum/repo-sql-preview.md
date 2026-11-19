# heeliiuum/RePO-SQL-Preview

## Resumen

RePO-SQL Preview es un conjunto de adaptadores PEFT LoRA publicados por el equipo KDGC (usuario `heeliiuum` en Hugging Face) sobre el modelo base Qwen/Qwen3.5-9B, orientados especificamente a la tarea de text-to-SQL. No se trata de un modelo completo, sino de un paquete de adaptadores que implementa una arquitectura de tres componentes: un planificador de exploracion (Exploration Planner), un generador de SQL (SQL Generator) y un selector de candidatos (Candidate Selector). El objetivo declarado es la evaluacion en el benchmark BIRD, un conjunto de referencia para traduccion de lenguaje natural a consultas SQL sobre bases de datos reales.

El repositorio se publica como "Preview" y contiene dos configuraciones del mismo modelo base: una entrenada solo con SFT (supervised fine-tuning) y otra con SFT seguido de RL (SFT+RL). El generador de SQL dispone de dos checkpoints distintos (`sql-generator-sft/` y `sql-generator-sft-rl/`), mientras que el planificador y el selector comparten adaptador entre ambas configuraciones. El tamano del repositorio es de 5,5 GB, coherente con varios adaptadores LoRA sobre un base de 9B de parametros.

La relevancia del proyecto radica en su enfoque modular para text-to-SQL: separar la planificacion de la exploracion del esquema, la generacion de la consulta y la seleccion entre candidatos es una estrategia habitual para mejorar la precision en benchmarks complejos como BIRD. Sin embargo, la informacion publicada es muy limitada: no hay model card detallada, no se declaran licencia ni idiomas, y no se aportan resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores PEFT LoRA sobre transformer denso (base Qwen/Qwen3.5-9B) |
| Parametros totales | No disponible (el base Qwen3.5-9B tiene 9B; los adaptadores LoRA anaden un numero no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-9B, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |
| Modelo base | Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) |
| Revision de adaptadores | `8d989c70459235116c08deacd4885f559bfcc254` |
| Componentes | Exploration Planner, SQL Generator (SFT y SFT+RL), Candidate Selector |
| Tamano del repo | 5,5 GB |
| Tags | text-to-sql, lora, safetensors |

## Arquitectura y entrenamiento

El proyecto no entrena un modelo desde cero, sino que aplica tecnicas de ajuste eficiente (PEFT LoRA) sobre Qwen3.5-9B. La arquitectura resultante es un pipeline de tres modulos especializados: un Exploration Planner que probablemente descompone la pregunta en lenguaje natural y planifica la exploracion del esquema de la base de datos; un SQL Generator que produce la consulta SQL; y un Candidate Selector que elige entre multiples candidatos generados. Esta descomposicion es tipica en sistemas text-to-SQL de alto rendimiento en BIRD, donde la complejidad del esquema y las preguntas ambiguas requieren razonamiento multi-paso.

El entrenamiento se realizo en dos fases para el generador de SQL: primero SFT (supervised fine-tuning) y despues una fase de RL (reinforcement learning) sobre el checkpoint SFT, dando lugar a `sql-generator-sft-rl/`. El planificador y el selector solo disponen de una version, presumiblemente entrenada con SFT. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni los detalles del algoritmo de RL empleado. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural (text-to-SQL) sobre esquemas de bases de datos reales.
- Planificacion de exploracion del esquema: descomposicion de la pregunta y seleccion de tablas y columnas relevantes.
- Generacion de multiples candidatos SQL y seleccion del mejor mediante un modulo dedicado.
- Razonamiento multi-paso orientado a la resolucion de consultas complejas (joins, agregaciones, subconsultas), segun el diseno del pipeline.
- Evaluacion offline sobre el benchmark BIRD mediante el paquete de inferencia proporcionado por el equipo KDGC.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades multimodales (vision, audio): no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion (los idiomas no estan declarados).

## Casos de uso

- Evaluacion y reproduccion en BIRD: el caso de uso principal y documentado es ejecutar el pipeline sobre BIRD Test mediante `bash bird.sh test /path/to/bird-test`, comparando las predicciones SFT y SFT+RL en `runs/SFT/submission/predict_test.json` y `runs/SFT+RL/submission/predict_test.json`. Es adecuado para investigadores que quieran reproducir o comparar resultados en este benchmark.
- Investigacion en text-to-SQL modular: el diseno de tres componentes (planificador, generador, selector) permite estudiar el impacto de cada modulo por separado, por ejemplo sustituyendo el selector o comparando SFT frente a SFT+RL en el generador.
- Analisis de la contribucion del RL en generacion de SQL: al publicar dos checkpoints del generador (`sql-generator-sft/` y `sql-generator-sft-rl/`), el repositorio facilita experimentos controlados sobre el efecto del aprendizaje por refuerzo en la calidad de las consultas.
- Base para ajuste especifico de dominio: los adaptadores LoRA pueden servir como punto de partida para fine-tuning adicional sobre esquemas propios de una organizacion, dado que el base Qwen3.5-9B es un modelo generalista.
- Prototipado de asistentes de consulta a bases de datos: el pipeline completo puede integrarse en herramientas internas de exploracion de datos donde el usuario formula preguntas en lenguaje natural y el sistema devuelve SQL ejecutable, siempre que se valide la correccion de las consultas.
- Docencia y formacion en text-to-SQL: el paquete de inferencia y los scripts (`bird.sh setup`, `download`, `test`) simplifican la puesta en marcha en un A100 para demostraciones y practicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la evaluacion en BIRD y describe el procedimiento para generar predicciones, pero no incluye cifras de exactitud de ejecucion ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion. Como referencia, un modelo base de 9B en precision FP16 requiere aproximadamente 18 GB solo para pesos, mas memoria para el contexto y los adaptadores; en cuantizacion de 8 bits rondaria los 9-10 GB y en 4 bits unos 5-6 GB, aunque estas cifras son estimaciones generales y no estan confirmadas por el autor.
- GPU recomendadas: la model card indica explicitamente el uso de una A100 para la evaluacion en BIRD.
- Compatibilidad con GPU de consumo: no confirmada. Un base de 9B podria caber en GPUs de consumo con cuantizacion (por ejemplo, RTX 4090 de 24 GB en FP16 justo al limite, o en 8/4 bits con holgura), pero el pipeline de tres adaptadores y el contexto adicional pueden incrementar los requisitos.
- Opciones de despliegue: el autor proporciona un paquete de inferencia propio con scripts `bird.sh`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al tratarse de adaptadores LoRA sobre Qwen3.5-9B, seria necesario cargarlos con PEFT sobre el base y el framework de inferencia que se elija, extremo no verificado en la informacion.
- Latencia y throughput: no disponibles. El pipeline ejecuta dos configuraciones secuencialmente (SFT y SFT+RL) sobre la misma GPU, lo que duplica el coste de evaluacion completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RePO-SQL Preview (este) | Base 9B + LoRA | No disponible | Pipeline modular text-to-SQL (planificador + generador + selector) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B | 9B | No disponible en esta ficha | Modelo generalista base | No disponible en esta ficha | Hugging Face (modelo base) |
| Otros sistemas text-to-SQL sobre BIRD | No disponible | No disponible | Varía (prompting, fine-tuning, pipelines multi-agente) | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no declara licencia, idiomas, contexto, datos de entrenamiento ni resultados, lo que dificulta evaluar su idoneidad para produccion.
- Licencia no especificada: al no declararse licencia, no se puede asumir permiso para uso comercial; es necesario contactar con el autor o consultar el repositorio del modelo base.
- Estado "Preview": el propio nombre indica que es una version preliminar, sujeta a cambios y sin garantias de estabilidad.
- Dependencia de un paquete de inferencia externo: la evaluacion requiere el "inference code package supplied by KDGC Team", no incluido en el repositorio de Hugging Face; sin el, los adaptadores no son directamente utilizables.
- Riesgo de alucinacion en SQL: como todo sistema text-to-SQL, puede generar consultas sintacticamente validas pero semanticamente incorrectas; se recomienda validacion y ejecucion controlada antes de usar en entornos reales.
- Sesgos: no documentados. Al heredar el base Qwen3.5-9B, podria arrastrar sesgos del mismo, pero no hay informacion al respecto.
- Limitaciones de contexto e idioma: no declaradas; el rendimiento fuera del dominio de BIRD (esquemas y estilo de preguntas del benchmark) no esta caracterizado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- Reproducibilidad: se fijan revisiones concretas del base (`c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y de los adaptadores (`8d989c70459235116c08deacd4885f559bfcc254`), lo que ayuda a reproducir, pero no se documentan semillas ni hiperparametros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/heeliiuum/RePO-SQL-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Benchmark BIRD (referencia del autor, no enlazado en la model card): no disponible en la informacion
- Paquete de inferencia del equipo KDGC: no disponible en la informacion
- Paper o blog del modelo: no disponible en la informacion
- Repositorio de codigo: no disponible en la informacion
