# HPAI-BSC/IRIS-14B

## Resumen

IRIS-14B es un modelo de lenguaje especializado en representaciones intermedias (IR) de compiladores, desarrollado por HPAI-BSC (Barcelona Supercomputing Center). Se trata de un ajuste fino del modelo base Qwen3-14B-Base, orientado a tareas que implican LLVM IR y GIMPLE, la representacion intermedia interna de GCC. El modelo esta pensado para asistir en tareas propias de la ingenieria de compiladores: generacion, traduccion, analisis y reparacion de codigo IR.

El modelo tiene 14.768.307.200 parametros (aproximadamente 14,77 mil millones) y se distribuye en formato safetensors, con un repositorio de 59,1 GB. Su acceso esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargarlo. No se especifica la licencia ni los idiomas soportados en la informacion publicada.

La relevancia de IRIS-14B radica en su nicho: la mayoria de modelos de codigo se centran en lenguajes de alto nivel, mientras que el trabajo sobre IR requiere conocer estructuras SSA, bloques basicos, tipos de LLVM y construcciones GIMPLE. El modelo se apoya en cuatro conjuntos de datos propios (GNU-IRIS, CodeForces-IRIS, ExeBench-IRIS y TheStack-IRIS) y esta asociado al preprint arXiv 2605.08247.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (ajuste fino de Qwen/Qwen3-14B-Base) |
| Parametros totales | 14.768.307.200 (14,77 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-14B-Base declara 32.768 tokens, pero no se confirma que IRIS-14B conserve esa ventana) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (acceso restringido que requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 59,1 GB |
| Modelo base | Qwen/Qwen3-14B-Base |
| Pipeline | text-generation |
| Fecha de creacion | 13 de enero de 2026 |
| Ultima actualizacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

IRIS-14B parte de Qwen3-14B-Base, un transformer denso de 14,77 mil millones de parametros. El ajuste fino se ha realizado sobre cuatro corpus propios relacionados con compiladores e IR: GNU-IRIS, CodeForces-IRIS, ExeBench-IRIS y TheStack-IRIS. Estos nombres sugieren una combinacion de codigo procedente de proyectos GNU, soluciones competitivas de CodeForces, funciones ejecutables con casos de prueba (ExeBench) y codigo de gran escala filtrado de TheStack, todo ello previsiblemente anotado o transformado para tareas de representacion intermedia.

No se dispone de informacion publica sobre el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset, la aplicacion de RLHF o DPO, ni sobre innovaciones de decodificacion. Los tags del repositorio mencionan LLVM, GIMPLE, GCC y Clang, lo que situa el foco en dos ecosistemas de compilacion: LLVM IR por un lado y GIMPLE (GCC) por otro. Tampoco se detalla si hubo entrenamiento adicional en fases (por ejemplo, SFT seguido de optimizacion por preferencias) ni si se emplearon tecnicas como decodificacion especulativa.

## Capacidades

- Generacion de texto y codigo con orientacion a compiladores.
- Trabajo con LLVM IR: generacion, transformacion y analisis de codigo IR.
- Trabajo con GIMPLE, la representacion intermedia de GCC.
- Traduccion entre representaciones intermedias y entre codigo fuente de alto nivel e IR.
- Tareas de reparacion y depuracion sobre IR o sobre codigo de compilador.
- Formato conversacional (etiqueta conversational en el repositorio), lo que sugiere soporte de dialogos multi-turno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio) o modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion de LLVM IR a GIMPLE (y a la inversa): el modelo puede recibir un modulo IR y producir la construccion equivalente en la otra representacion, util para estudiar diferencias semanticas entre GCC y LLVM.
- Generacion de IR en pipelines de compilacion: dado un fragmento de codigo fuente, producir el IR correspondiente para pruebas de regresion o validacion de pases de optimizacion.
- Reparacion de errores en IR generado automaticamente: detectar construcciones invalidas (tipos incompatibles, uso de valores indefinidos, bloques sin terminador) y proponer correcciones.
- Analisis estatico asistido por lenguaje natural: preguntar en lenguaje natural por el comportamiento de un bloque basico o de una cadena de definiciones SSA y obtener una explicacion tecnica.
- Investigacion en optimizacion de compiladores: proponer reescrituras de IR antes de aplicar un pase de optimizacion, como punto de partida para experimentos comparativos.
- Formacion y docencia en compiladores: generar ejemplos de IR explicados paso a paso, con distintos niveles de optimizacion, para asignaturas de construccion de compiladores.
- Migracion de codigo heredado: asistir en la actualizacion de codigo fuente apoyandose en el IR intermedio para preservar el comportamiento observable.
- Evaluacion de funciones ejecutables: con datos derivados de ExeBench, generar casos de entrada que ejerciten rutas del IR poco cubiertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia el preprint arXiv 2605.08247, pero no se ha podido acceder a su contenido ni a metricas tipo MMLU, HumanEval o GSM8K. Tampoco se dispone de resultados especificos para tareas de IR (por ejemplo, exactitud de traduccion LLVM IR a GIMPLE o tasa de compilacion correcta). Las busquedas web realizadas no devolvieron documentacion tecnica relevante sobre el modelo.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 29,5 GB solo para los pesos, mas cache KV. En la practica requiere A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB o dos GPU consumer de 24 GB con paralelismo tensorial.
- Cuantizacion a 8 bits: alrededor de 15 GB de pesos, por lo que cabe en una RTX 4090, RTX 5090, A6000 o L40S con margen para cache KV en contextos moderados.
- Cuantizacion a 4 bits: alrededor de 8-9 GB, lo que permitiria ejecutarlo en GPU de 12 GB (RTX 4070 Ti, RTX 3060 12 GB) o en equipos Apple Silicon con 16 GB de memoria unificada. No se publican pesos cuantizados oficiales, por lo que habria que generarlos.
- Cabe en GPU consumer: si, mediante cuantizacion; en precision completa no cabe en una sola GPU de 24 GB.
- Opciones de despliegue: vLLM, SGLang o TGI para servir en bf16; llama.cpp u Ollama solo si se generan pesos GGUF a partir de safetensors (no hay GGUF publicado).
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token con ninguna configuracion de hardware.

## Comparativa con modelos similares

Datos de los modelos alternativos segun su documentacion publica. Los valores de rendimiento no estan disponibles para IRIS-14B, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IRIS-14B | 14,77 mil millones | no disponible | IR de compiladores (LLVM IR, GIMPLE) | no disponible | Acceso restringido (gated) |
| Qwen3-14B-Base | 14,8 mil millones | 32.768 tokens | Proposito general | Apache 2.0 | Publica |
| Qwen2.5-Coder-14B | 14,7 mil millones | 32.768 tokens (ampliable a 131.072 con YaRN) | Codigo generalista | Apache 2.0 | Publica |
| StarCoder2-15B | 15 mil millones | 16.384 tokens | Codigo generalista | BigCode OpenRAIL-M | Publica |

La diferencia principal de IRIS-14B no es el tamano ni el contexto, sino el dominio: ninguno de los modelos alternativos de la tabla esta especializado en representaciones intermedias de compiladores, lo que convierte a IRIS-14B en una opcion de nicho sin competencia directa identificada en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia y tratarse de un repositorio con acceso restringido, el uso comercial queda en incertidumbre hasta que se revise el acuerdo de acceso.
- Acceso gated: es obligatorio solicitar y aceptar condiciones en HuggingFace antes de descargar los pesos, lo que complica la automatizacion de pipelines de despliegue.
- Sin cuantizaciones oficiales: quien necesite GGUF, AWQ o GPTQ tendra que generarlas por su cuenta, con el coste y el riesgo de degradacion asociados.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan en parte los del modelo base Qwen3-14B-Base, no documentados aqui.
- Riesgo de alucinacion: el modelo puede producir IR sintacticamente plausible pero semanticamente incorrecto (por ejemplo, instrucciones que no preservan el comportamiento del programa original). Cualquier salida debe validarse compilando y ejecutando pruebas.
- Cobertura de idiomas no declarada: no se especifica que lenguajes naturales ni que lenguajes de programacion cubre, ni con que calidad.
- Contexto no confirmado: no se indica la ventana de contexto efectiva tras el ajuste fino, lo que complica planificar tareas sobre modulos IR grandes.
- Idiomas de programacion de origen limitados por los corpus: al derivarse de TheStack, GNU, ExeBench y CodeForces, la cobertura de lenguajes poco representados en esas fuentes sera previsiblemente baja.
- Validacion obligatoria en produccion: al no existir benchmarks publicados, no hay evidencia cuantitativa de la tasa de IR correcto ni de la tasa de compilacion exitosa.
- Estado del modelo: solo 5 descargas y 0 likes en el momento de redactar la ficha, lo que indica una adopcion muy temprana y poca validacion externa.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/HPAI-BSC/IRIS-14B
- Preprint asociado (referenciado en los tags del repositorio): https://arxiv.org/abs/2605.08247
- Dataset GNU-IRIS: https://huggingface.co/datasets/HPAI-BSC/GNU-IRIS
- Dataset CodeForces-IRIS: https://huggingface.co/datasets/HPAI-BSC/CodeForces-IRIS
- Dataset ExeBench-IRIS: https://huggingface.co/datasets/HPAI-BSC/ExeBench-IRIS
- Dataset TheStack-IRIS: https://huggingface.co/datasets/HPAI-BSC/TheStack-IRIS
- Modelo base Qwen3-14B-Base: https://huggingface.co/Qwen/Qwen3-14B-Base
