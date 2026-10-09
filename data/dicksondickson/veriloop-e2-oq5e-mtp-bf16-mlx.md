# dicksondickson/VeriLoop-E2-oQ5e-mtp-bf16-MLX

## Resumen

VeriLoop-E2-oQ5e-mtp-bf16-MLX es un checkpoint cuantizado publicado por el usuario dicksondickson a partir del modelo tsinghua-sigs-robot-lab/VeriLoop-E2. No es un entrenamiento propio: es una conversion de pesos al formato MLX, la libreria de Apple para inferencia en silicio propio, realizada con la herramienta oMLX 0.7.0 con la matriz de importancia (imatrix) activada. La cuantizacion es de 5 bits, etiquetada como oQ5e, y los tensores considerados criticos se mantienen en bf16, lo que segun la model card esta pensado para chips Apple M3 y posteriores.

El modelo cuenta con 27.872.753.616 parametros (unos 27,87 mil millones) y el repositorio ocupa 20,4 GB. La licencia declarada es MIT y la model card no especifica pipeline. No se documentan arquitectura, longitud de contexto, idiomas soportados ni datos de entrenamiento del modelo base, de modo que buena parte de las especificaciones habituales quedan como no disponibles.

Su interes es practico: permite ejecutar un modelo de aproximadamente 28B de parametros en un Mac con memoria unificada suficiente, sin depender de CUDA y con una huella en disco muy inferior a la de los pesos en bf16. Con 0 descargas y 1 like en el momento de redactar esta ficha, es un artefacto sin validacion comunitaria y sin mediciones de calidad publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en la model card; las etiquetas del repositorio (qwen3_5, qwen3.8) apuntan a la familia Qwen, sin confirmar |
| Parametros totales | 27.872.753.616 (aprox. 27,87 B) |
| Parametros activos | No aplica (no se documenta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5 bits (oQ5e) con imatrix; precision mixta con tensores importantes en bf16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Modelo base | tsinghua-sigs-robot-lab/VeriLoop-E2 |
| Herramienta de cuantizacion | oMLX 0.7.0 con imatrix |
| Tamano del repositorio | 20,4 GB |
| Hardware objetivo | Apple Silicon M3 o posterior, segun la model card |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base VeriLoop-E2: la model card de esta cuantizacion no indica si se trata de un transformer denso, un MoE, un modelo hibrido o una variante con atencion lineal, ni detalla el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO. Las etiquetas del repositorio mencionan qwen y qwen3_5, lo que sugiere una arquitectura de la familia Qwen, pero no hay confirmacion en la informacion proporcionada.

Lo unico documentado es el proceso de cuantizacion, no el entrenamiento. Este checkpoint se genero con oMLX 0.7.0 aplicando una cuantizacion de 5 bits con matriz de importancia y dejando determinados tensores en bf16. Ese esquema de precision mixta busca concentrar la perdida de informacion en las capas menos sensibles y preservar en precision completa las que mas afectan a la calidad de salida. La model card restringe ese enfoque a chips Apple M3 o posteriores. El sufijo "mtp" del nombre del repositorio no aparece explicado en la model card, por lo que no se puede confirmar a que se refiere.

## Capacidades

La model card no enumera capacidades funcionales. Al tratarse de una cuantizacion, el comportamiento del modelo depende integramente del checkpoint base, cuya informacion no se incluye en los datos disponibles. Por tanto:

- Generacion de texto: no documentada de forma explicita; se hereda del modelo base.
- Razonamiento y matematicas: no disponible; sin benchmarks ni ejemplos publicados.
- Generacion de codigo: no disponible; no se declara soporte ni evaluacion.
- Tool calling / function calling: no disponible; sin mencion en la model card.
- Agentes y razonamiento multi-paso: no disponible. La etiqueta "mtp" del nombre podria apuntar a multi-token prediction, pero no esta explicada.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; no se menciona ninguna.
- Capacidad confirmada: ejecucion local en Apple Silicon mediante MLX, con carga de pesos en precision mixta (5 bits mas tensores bf16) sin necesidad de GPU NVIDIA.

## Casos de uso

Conviene recordar que estas aplicaciones dependen de las capacidades del modelo base, no verificadas en la informacion disponible. Los escenarios se plantean desde el punto de vista del despliegue:

- Desarrollo e inferencia local en macOS: permite disponer de un modelo de unos 28B en un Mac Studio o MacBook Pro con memoria unificada de 32 GB o mas, sin GPU dedicada, usando oMLX como runtime.
- Evaluacion de la cuantizacion frente al modelo base en bf16: comparar perplejidad, coherencia y calidad en tareas propias entre este checkpoint (20,4 GB) y los pesos completos, para decidir si la perdida de precision de 5 bits es asumible en el caso de uso.
- Procesamiento de datos sensibles sin salida a la nube: al ejecutarse en local, el contenido no abandona el equipo; encaja en entornos con requisitos de confidencialidad que no permiten APIs externas.
- Procesamiento por lotes en hardware Apple: tareas de resumen, clasificacion o extraccion de informacion sobre corpus propios, aprovechando la memoria unificada de los chips Max o Ultra.
- Validacion de pipeline de despliegue: probar la descarga, carga y servicio de un modelo cuantizado con precision mixta en oMLX antes de replicarlo en un parque de equipos Apple.
- Banco de pruebas de cuantizaciones: usar este checkpoint como referencia frente a otras variantes del mismo modelo base para medir el impacto de distintas precisiones sobre tareas concretas.
- Experimentacion con adaptadores ligeros: emplear el checkpoint como punto de partida para ajuste fino con LoRA en MLX, siempre que el formato y la arquitectura lo permitan (soporte no documentado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de metricas de degradacion por cuantizacion (perplejidad, divergencia KL, similitud con las salidas en bf16). Tampoco se publican mediciones de tokens por segundo ni de latencia.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 20,4 GB; con el overhead de carga del runtime MLX conviene reservar al menos unos 24 GB de memoria unificada. Se recomienda 32 GB o mas para trabajar con contexto amplio.
- GPU compatibles: no aplica a GPUs discretas NVIDIA o AMD, ya que el formato es MLX y esta atado a Apple Silicon. Indicados los chips Apple M3 o posteriores segun la model card, por el uso de tensores en bf16.
- Cabe en GPU de consumo: no en el sentido habitual (RTX 4090, etc.), porque MLX no se ejecuta sobre CUDA. En el ecosistema Apple cabe en equipos con 32 GB de memoria unificada o mas.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx), la herramienta con la que se genero el checkpoint. Otros runners MLX (por ejemplo mlx-lm) no tienen soporte confirmado para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para ningun chip concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Precision y tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VeriLoop-E2-oQ5e-mtp-bf16-MLX (este) | 27,87 B | 5 bits con imatrix, precision mixta bf16; 20,4 GB | No disponible | MIT | HuggingFace, formato MLX |
| tsinghua-sigs-robot-lab/VeriLoop-E2 (base) | No disponible (coincide en numero de tensores, no confirmado) | bf16; tamano no disponible | No disponible | No disponible en la informacion | HuggingFace |
| Otras cuantizaciones del mismo modelo base (GGUF, AWQ, GPTQ u otras variantes MLX) | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la informacion proporcionada |

No se dispone de datos para comparar con alternativas de otros desarrolladores de la misma categoria (modelos densos de 27B a 32B). Cualquier comparacion de rendimiento seria especulativa al no existir benchmarks publicados.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el paso de bf16 a 5 bits con precision mixta degrada la salida, y no se publican mediciones de esa degradacion (perplejidad, KL, evaluaciones por tarea).
- Sin validacion comunitaria: 0 descargas y 1 like en el momento de redactar la ficha; el checkpoint no ha sido contrastado por terceros.
- Model card minima: no documenta arquitectura, contexto, idiomas, datos de entrenamiento ni casos de uso previstos, lo que dificulta anticipar su comportamiento.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es un riesgo inherente a los modelos generativos y no hay datos que permitan acotarlo.
- Sesgos: no documentados. Al desconocerse el dataset de entrenamiento del modelo base, no se pueden anticipar sesgos de genero, idioma o dominio.
- Licencia: se declara MIT, pero conviene verificar la licencia del modelo base antes de un uso comercial, ya que la informacion proporcionada no la incluye.
- Restriccion de plataforma: el formato MLX solo se ejecuta en Apple Silicon, y la model card exige M3 o posterior por los tensores en bf16. No es desplegable en CUDA ni en ROCm.
- Ambiguedad en las etiquetas: los terminos "mtp" y "oQe" no estan explicados en la model card; no deben interpretarse como funcionalidades confirmadas.
- Huella en disco: 20,4 GB de repositorio, a lo que hay que sumar espacio temporal durante la descarga y la carga en memoria.
- Metadatos llamativos: HuggingFace indica fecha de creacion 2026-10-09 y actualizacion 2026-10-09, posterior a la fecha habitual de consulta; conviene tratarlo como posible inconsistencia de metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicksondickson/VeriLoop-E2-oQ5e-mtp-bf16-MLX
- Modelo base: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Herramienta de cuantizacion y runtime oMLX: https://github.com/jundot/omlx
- Paper, blog o demo asociados: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los resultados obtenidos correspondian a portales de autenticacion de entornos educativos franceses (ENT), sin relacion con el modelo.
