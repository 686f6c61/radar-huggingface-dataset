# davidanugraha/R-Few-Qwen3.5-35B-A3B-SWE-Smith-r18

## Resumen

R-Few-Qwen3.5-35B-A3B-SWE-Smith-r18 es un repositorio de adaptadores LoRA publicados por el usuario davidanugraha, derivados del modelo base Qwen/Qwen3.5-35B-A3B. No se trata de un modelo terminado ni de una reivindicación de rendimiento: según la propia model card, es una «instantánea de portabilidad» de una campaña de aprendizaje por refuerzo en curso, correspondiente al ciclo 18 de un programa de mecánica de entrenamiento denominado R-Few aplicado a tareas de ingeniería de software (SWE) sobre dominios de SWE-Smith. El repositorio contiene dos linajes de checkpoints separados, Challenger y Solver, con adaptadores LoRA de servicio, recibos de commit, métricas de diagnóstico y checkpoints compactos de continuación en FSDP (optimizador, planificador y estado de RNG).

El problema que aborda es de investigación: explorar dinámicas de automejora y currículo sintético sobre tareas SWE, usando GRPO en el rol Challenger (generación de tareas) y un preset opcional RLOO en el rol Solver (resolución de tareas). La relevancia actual es acotada y puramente metodológica: sirve como evidencia de mecánica de entrenamiento y como material para estudiar estabilidad de GRPO/RLOO con adaptadores LoRA de rango 32 sobre un modelo MoE de 35B de parámetros totales. El repositorio ocupa 99,1 GB, pero no incluye los pesos del modelo base, y el autor advierte explícitamente de que la campaña se ejecutó desde un árbol de trabajo sin commitear, por lo que no debe reclamarse reproducción exacta del código fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) en el modelo base Qwen3.5-35B-A3B; este repositorio aporta adaptadores LoRA (PEFT) sobre dicho base. Detalle interno del base no disponible |
| Parametros totales | 35B en el modelo base; adaptadores LoRA de rango 32 / alpha 64 (recuento exacto de parametros de los adaptadores no disponible) |
| Parametros activos | Aproximadamente 3B segun la nomenclatura A3B del modelo base; no confirmado en la informacion proporcionada |
| Longitud de contexto | 114.688 tokens en el entrenamiento del Challenger; 65.536 tokens en el Solver. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No disponible. Solo se publican adaptadores en safetensors; no hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) y checkpoints compactos FSDP con estado de optimizador, planificador y RNG. No se incluyen los pesos del modelo base |

## Arquitectura y entrenamiento

El entrenamiento se articula en torno a dos roles con adaptadores LoRA independientes sobre el mismo base congelado. El Challenger usa 32 grupos de prompt por ciclo con K=8, optimizacion GRPO, rango LoRA 32 / alpha 64 y tasa de aprendizaje 1e-5, con una ventana de entrenamiento de 114.688 tokens y un universo de generacion compuesto por los 198 mundos de repositorio SWE-Smith clasificados como «broad-ready». El Solver emplea K=8, un preset opcional RLOO de SWE-Gym, el mismo rango y alpha de LoRA y tasa 1e-5, con 65.536 tokens de contexto. La banda de dificultad admitida es [0,2; 0,7], que admite entre 2 y 5 exitos con K=8. Los prompts del Challenger muestrean entre 0 y 5 ejemplos humanos.

El linaje de checkpoints registrado abarca cuatro actualizaciones efectivas del Challenger (steps 1 a 4) y dos del Solver (steps 1 y 2), con varias iteraciones externas sin actualizacion por falta de curriculo sintetico valido, varianza nula del Challenger o seleccion basada solo en datos humanos o solo en datos sinteticos. La instantanea se tomo con el ciclo 7 activo y sin decision terminal. Una innovacion reseñable es la restriccion conservadora del Solver: no se aplica actualizacion salvo que sobrevivan tareas humanas y sinteticas en el mismo ciclo, lo que el autor describe como adaptacion especifica a SWE y no como regla heredada de R-Zero (que filtra un pool variable, entrena lotes de tamano fijo y descarta lotes finales incompletos, sin restriccion de composicion). Limitacion critica del entrenamiento: el manifiesto canonico contiene 4.549 tareas SWE-Smith elegibles, pero la configuracion r18 materializa unicamente cinco tareas humanas unicas a partir de 16 candidatas validadas, reutilizadas en toda la condicionacion del Challenger y en cada pasada de dificultad del Solver.

## Capacidades

- Generacion de texto orientada a tareas de ingenieria de software: el proposito declarado de los adaptadores es la resolucion de tareas SWE y la generacion de curriculo sintetico, no se ha publicado ninguna evaluacion que lo cuantifique.
- Dos roles diferenciados: un adaptador Challenger pensado para proponer tareas dentro de una banda de dificultad objetivo, y un adaptador Solver pensado para resolverlas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado de forma explicita; el escenario SWE-Smith implica ejecucion en repositorios, pero no se documenta el protocolo de herramientas.
- Capacidades multilingues: no disponible; el material de entrenamiento es codigo y tareas SWE, predominantemente en ingles tecnico.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible; el pipeline declarado es text-generation.
- Continuacion de entrenamiento: los checkpoints FSDP incluyen estado de optimizador, planificador y RNG, lo que permite reanudar la campaña desde los steps publicados.
- Ajuste fino posterior: al ser adaptadores PEFT, pueden combinarse con el base o sustituirse por adaptadores propios entrenados sobre el mismo base.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes SWE: el repositorio permite reanudar el ciclo 7 desde el Challenger step 4 y el Solver step 2 usando los checkpoints FSDP con estado de optimizador y planificador incluidos, algo poco habitual en publicaciones de adaptadores.
- Estudio de estabilidad de GRPO y RLOO: los recibos de commit y las metricas de diagnostico por checkpoint permiten analizar por que varias iteraciones externas no produjeron actualizacion (varianza nula del Challenger, ausencia de curriculo sintetico valido).
- Analisis de composicion de datos humano/sintetico: con solo cinco tareas humanas unicas frente a 4.549 elegibles, el artefacto es util para medir el impacto de un presupuesto humano minimo en un bucle de automejora.
- Punto de partida para fine-tuning LoRA propio en dominios SWE: los adaptadores de rango 32 / alpha 64 sirven como inicializacion o como linea base de comparacion frente a adaptadores entrenados con Basic GRPO.
- Auditoria de linaje de checkpoints: el repositorio documenta explicitamente que los steps cuentan actualizaciones efectivas del optimizador y no ciclos externos, lo que evita interpretaciones erroneas en estudios de reproducibilidad.
- Docencia y prototipado de infraestructura de entrenamiento: la combinacion de PEFT, verl, GRPO y RLOO sobre un MoE de 35B con contexto de 114.688 tokens es un ejemplo practico para montar pipelines de RL distribuido.
- Evaluacion comparativa pendiente sobre SWE-bench o SWE-Gym: los adaptadores son candidatos directos para ejecutar dicha evaluacion, aunque el autor no ha publicado resultados y los declara fuera del alcance de esta instantanea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que la instantanea no constituye un resultado R-Few terminado ni una afirmacion de eficacia, y que el ciclo 7 seguia en ejecucion en el momento de prepararla. No hay datos de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluacion, ni cifras de latencia o throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros del modelo base (35B totales, aproximadamente 3B activos por token segun la nomenclatura A3B) y del tamano del repositorio (99,1 GB). No proceden de mediciones publicadas por el autor.

- Inferencia en bf16: alrededor de 70 GB solo para pesos del base, mas cache KV; requiere multiples GPU o GPU de 80 GB con contexto reducido.
- Inferencia en 8 bits: aproximadamente 35 GB de pesos, viable en una A100 80 GB o H100 80 GB.
- Inferencia en 4 bits: aproximadamente 18-20 GB de pesos, lo que situa el modelo al limite de una RTX 4090 o RTX 3090 de 24 GB, con poco margen para contexto largo.
- Contexto largo: los 65.536 tokens del Solver y los 114.688 del Challenger son ventanas de entrenamiento, no de servicio; la cache KV a esas longitudes exige memoria adicional muy significativa y probablemente paralelismo por tensor.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16, A100 40 GB en configuracion multi-GPU, y GPU de consumo de 24 GB solo con cuantizacion de 4 bits y contextos moderados.
- Despliegue: transformers con PEFT para cargar el adaptador, vLLM con soporte de adaptadores LoRA, y TGI si se confirma compatibilidad con el base. llama.cpp y Ollama no estan disponibles porque no se publican pesos GGUF ni conversion documentada.
- Almacenamiento: el repositorio completo ocupa 99,1 GB e incluye estado de optimizador y planificador; cargar solo los adaptadores de servicio requiere una fraccion muy pequena de ese espacio, pero los checkpoints FSDP completos son necesarios para continuar el entrenamiento.
- Latencia y throughput: no disponible. Al ser un MoE con aproximadamente 3B parametros activos, la velocidad por token deberia ser mas cercana a la de un modelo denso de ese orden que a la de uno de 35B densos, pero no se aportan cifras.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada adaptadores publicos comparables de la misma categoria (LoRA de RL sobre un MoE para tareas SWE). La unica comparacion documentada es contra el propio modelo base.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| R-Few-Qwen3.5-35B-A3B-SWE-Smith-r18 | 35B totales en el base; adaptadores LoRA rango 32 | 114.688 tokens (Challenger, entrenamiento) y 65.536 (Solver) | safetensors + checkpoints FSDP | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-35B-A3B (base) | 35B totales, aproximadamente 3B activos | No disponible | No disponible | No disponible en la informacion proporcionada | Referenciado como base en revision 59d61f3ce65a6d9863b86d2e96597125219dc754 |
| Basic GRPO y R-Few (metodos) | No aplica | No disponible | No disponible | No disponible | Mencionados como lineas de comparacion en la model card, sin cifras publicadas |
| R-Zero | No disponible | No disponible | No disponible | No disponible | Citado como referencia metodologica; la model card senala diferencias de filtrado y composicion de lotes |

## Limitaciones y advertencias

- Instantanea no terminal: el ciclo 7 seguia activo al preparar el repositorio y no se incluye ninguna decision final. No debe presentarse como resultado R-Few ni como afirmacion de eficacia.
- Presupuesto humano minimo: solo cinco tareas humanas unicas de 4.549 elegibles alimentan la condicionacion del Challenger y todas las pasadas del Solver, por lo que r18 vale como evidencia de mecanica pero no como comparacion final de presupuesto humano completo.
- Reproducibilidad no garantizada: la campaña se ejecuto desde un arbol de trabajo sin commitear y el checkout cambio despues de lanzar el ciclo 7. El propio autor pide no reclamar reproduccion exacta hasta que se consolide el codigo fuente.
- Licencia no disponible: no se especifica licencia ni en el repositorio ni en la informacion proporcionada, por lo que el uso comercial es indeterminado y depende ademas de la licencia del modelo base.
- Ausencia total de evaluacion: cero descargas, cero likes y ninguna metrica de rendimiento, calidad o seguridad publicada. No hay evidencia de que los adaptadores funcionen mejor que el base.
- Entrenamiento muy corto: cuatro actualizaciones efectivas del Challenger y dos del Solver. Es esperable un ajuste marginal sobre el comportamiento del base.
- Desviacion metodologica: la restriccion de exigir tareas humanas y sinteticas en el mismo ciclo antes de actualizar el Solver es una adaptacion conservadora a SWE y no una regla de R-Zero, lo que complica la comparacion directa entre metodos.
- Artefactos no incluidos: los aproximadamente 392 GiB de la campaña original (generaciones del Challenger, rollouts del Solver, artefactos de tareas y auditorias) se archivan por separado en S3 y no forman parte de este repositorio.
- Idiomas y sesgos: no hay informacion sobre cobertura idiomatica ni evaluacion de sesgos. Al entrenar sobre repositorios y tareas tecnicas, se heredan los sesgos presentes en ese material.
- Riesgo de alucinacion: no evaluado. En tareas SWE, los modos de fallo tipicos incluyen parches sintacticamente validos pero semanticamente incorrectos y llamadas a APIs inexistentes.
- Carga practica: el repositorio de 99,1 GB mezcla adaptadores de servicio y checkpoints FSDP con estado de optimizador; seleccionar los artefactos correctos para inferencia requiere revisar la estructura de directorios.
- Idiomas soportados y tipos de cuantizacion figuran como no disponibles, lo que limita la planificacion de despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidanugraha/R-Few-Qwen3.5-35B-A3B-SWE-Smith-r18
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B (revision fijada en la model card: 59d61f3ce65a6d9863b86d2e96597125219dc754)
- Documentacion de migracion citada dentro del repositorio: metadata/docs/MACHINE_MIGRATION.md
- Configuraciones citadas dentro del repositorio: metadata/configs/
- No se han encontrado otros enlaces relevantes en la busqueda web realizada; los resultados devueltos corresponden al Fascicolo Sanitario Elettronico italiano y no guardan relacion con este modelo.
