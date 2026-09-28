# davidheineman/opd-teacher-Q2.5I-Sorting-step149

## Resumen

`opd-teacher-Q2.5I-Sorting-step149` es un ajuste fino del modelo `Qwen/Qwen2.5-1.5B-Instruct` realizado por David Heineman mediante RLVE (Reinforcement Learning from Verifiable Environments) con el algoritmo GRPO sobre el entorno `Sorting` a dificultad 0. El modelo se entrenó durante 150 actualizaciones y el checkpoint publicado (`step149`, índice base cero) corresponde a la ultima actualizacion. No es un modelo de proposito general: es un "profesor" (teacher) construido especificamente para un experimento de destilacion on-policy sobre 32 entornos, en el que modelos mas pequenos aprenden a imitar las distribuciones de este profesor en la tarea de ordenacion.

Tecnicamente es un transformer decoder-only de la familia Qwen2 con 1.543.714.304 parametros (aproximadamente 1,54 mil millones), pesos en safetensors y un repositorio de 3,1 GB, lo que corresponde a un checkpoint en precision de 16 bits. La model card declara unicamente el idioma ingles y licencia Apache 2.0, heredada del modelo base, cuyo fichero de licencia original se incluye en el repositorio.

Su relevancia es fundamentalmente metodologica: ejemplifica el patron actual de generar profesores especializados mediante RL verifiable en entornos acotados, para despues transferir ese comportamiento a modelos menores mediante destilacion on-policy. Como artefacto de investigacion es reproducible (incluye enlace al run de W&B, al grupo de sweep y al codigo de entrenamiento), pero no esta pensado ni validado como asistente conversacional de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (según el modelo base) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens según la configuracion publicada del modelo base Qwen2.5-1.5B-Instruct; no verificado especificamente para este checkpoint |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (precision de 16 bits, 3,1 GB) |
| Idiomas soportados | Ingles (`en`) según la model card |
| Licencia | Apache 2.0 (se incluye el fichero `LICENSE` original de Qwen) |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de Qwen2 con atencion por consultas agrupadas (GQA) y 1,5 mil millones de parametros. El ajuste no modifica la topologia de la red: los pesos finales se convirtieron desde el checkpoint nativo del entrenamiento a safetensors y se validaron contra los nombres y las formas de tensor del modelo base, segun indica la model card.

El entrenamiento consistio en 150 actualizaciones con GRPO sobre el entorno `Sorting` a dificultad 0, dentro del marco RLVE. GRPO es un metodo de optimizacion de politica sin critico que estima la ventaja relativa de cada respuesta dentro de un grupo de muestras generadas por la misma politica, lo que encaja con entornos de recompensa verificable como la ordenacion de secuencias (la recompensa se calcula comprobando si la salida ordena correctamente). La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, el tamano de grupo de GRPO ni si hubo etapas adicionales de RLHF o DPO. El run de W&B y el grupo de sweep (`opd-teachers-20260927-191939`) estan enlazados, pero sus curvas no forman parte de la informacion disponible.

La innovacion destacable no esta en la arquitectura, sino en el procedimiento: generar profesores independientes por entorno (existe un modelo hermano equivalente para el entorno `ConvexHull`) para alimentar un experimento de destilacion on-policy multi-entorno.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de `Qwen2.5-1.5B-Instruct` (formato `conversational`).
- Razonamiento sobre tareas algorítmicas de ordenacion: el modelo fue optimizado por recompensa verificable en el entorno `Sorting` a dificultad 0.
- Generacion de secuencias de respuesta paso a paso en tareas de ordenacion, util como distribucion profesora en destilacion on-policy.
- Compatibilidad con `text-generation-inference` y con endpoints tipo OpenAI (`endpoints_compatible`), segun las etiquetas del repositorio.
- No hay evidencia publicada de soporte de tool calling, function calling ni comportamiento agentico multi-paso especifico en este checkpoint.
- No hay evidencia publicada de capacidades de vision, audio, modo de razonamiento explicito (thinking mode), ni decodificacion especulativa.
- Capacidad multilingue: la model card declara solo ingles. Aunque el modelo base Qwen2.5 cubre decenas de idiomas, no hay datos que confirmen que el ajuste con GRPO preserve ese comportamiento fuera del entorno de entrenamiento.
- Capacidad general fuera de `Sorting`: no evaluada y potencialmente degradada por el ajuste especializado.

## Casos de uso

- Destilacion on-policy como profesor: es su proposito declarado. Se usa para generar distribuciones de tokens sobre el entorno `Sorting` que un modelo alumno mas pequeno imita, dentro del experimento de 32 entornos. Su valor esta en la senal de recompensa verificable, no en la calidad conversacional.
- Generacion de trayectorias sinteticas de ordenacion: se puede muestrear el modelo para producir soluciones y razonamientos sobre listas de entrada, que despues se filtran por correccion y se reutilizan como datos de entrenamiento supervisado o de preferencias.
- Investigacion en GRPO y RLVE: sirve como checkpoint de referencia para reproducir el run `731ba2a4`, comparar hiperparametros (numero de actualizaciones, dificultad del entorno) y estudiar como evoluciona la politica a lo largo de 150 pasos.
- Ablaciones de destilacion: al existir checkpoints equivalentes por entorno, permite medir el efecto de entrenar un alumno con uno o varios profesores y cuantificar el olvido catastrofico respecto al modelo base.
- Linea base en evaluaciones de razonamiento algorítmico: se puede incluir como referencia especializada en tareas de ordenacion frente a modelos generalistas del mismo tamano, siempre que se documente que esta optimizado para ese entorno.
- Generacion de datos para modelos pequenos orientados a algoritmia: util en pipelines que necesitan datos sinteticos baratos de tareas verificables, ejecutables en una unica GPU de consumo.
- Prototipado local de experimentos de RL: con 3,1 GB de pesos se puede desplegar en portatiles con GPU modesta para probar bucles de generacion, recompensa y filtrado antes de escalar a modelos mayores.
- Advertencia de uso: no se recomienda como asistente de atencion al cliente, generacion de codigo en produccion ni tareas generales de instruccion, porque no hay evaluaciones publicadas fuera del entorno `Sorting`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas del entorno `Sorting` (por ejemplo, tasa de exito por dificultad). El unico dato cuantitativo de entrenamiento disponible es el numero de actualizaciones (150) y la dificultad del entorno (0).

## Requisitos de hardware

- Pesos en safetensors a 16 bits: aproximadamente 3,1 GB, coherente con el tamano del repositorio.
- VRAM estimada para inferencia: en bf16/fp16, del orden de 4 a 6 GB contando cache KV y activaciones; en cuantizacion de 8 bits, 2 a 3 GB; en cuantizacion de 4 bits, 1,5 a 2,5 GB (estimaciones, no medidas publicadas).
- Cache KV: con la configuracion publicada del modelo base (28 capas, 2 cabezas KV, head_dim 128) el coste es de aproximadamente 28 KB por token en fp16, es decir, unos 0,9 GB a 32.768 tokens y unos 115 MB a 4096 tokens.
- GPU recomendadas: cabe con holgura en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en entornos de servidor, A100, H100, L40S o L4 son sobredimensionadas para un modelo de 1,5B y se justifican solo por concurrencia o por integrarse en un pipeline mayor.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM, TGI (`text-generation-inference` esta en las etiquetas), SGLang y servidores compatibles con la API de OpenAI (`endpoints_compatible`). Para llama.cpp u Ollama seria necesaria una conversion propia a GGUF, ya que el repositorio no publica ficheros GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-Sorting-step149 | 1,54B | 32.768 tokens (heredado del base) | Apache 2.0 | Safetensors en HuggingFace | Especializado por GRPO en el entorno `Sorting`; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF, multiples runtime | Modelo base; proposito general e instrucciones; referencias publicas de evaluacion en su model card |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Safetensors, GGUF | Alternativa abierta de tamano comparable, contexto menor |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Safetensors, GGUF | Contexto mucho mayor; licencia con restricciones para algunos usos |

Los datos de los modelos alternativos proceden de sus fichas publicas y no se han verificado en la busqueda realizada; se incluyen solo como referencia orientativa de categoria y tamano.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: la propia model card lo describe como profesor para un experimento de destilacion on-policy sobre 32 entornos, no como asistente general.
- Especializacion extrema: el ajuste con GRPO se limita al entorno `Sorting` a dificultad 0. Es esperable una degradacion del seguimiento de instrucciones generales y del conocimiento del modelo base (olvido catastrofico), aunque no se han publicado mediciones de ese efecto.
- Riesgo de alucinacion: como cualquier modelo de 1,5B, puede generar razonamientos plausibles pero incorrectos; en tareas de ordenacion la salida debe validarse siempre con un comprobador externo.
- Idioma: la model card declara unicamente ingles. No hay evidencia de cobertura multilingue tras el ajuste.
- Sesgos: no se han publicado analisis de sesgos, toxicidad ni evaluaciones de seguridad para este checkpoint.
- Riesgo de reward hacking: al optimizar una recompensa verificable concreta durante 150 actualizaciones, la politica puede haber aprendido atajos especificos del entorno (por ejemplo, formatos de salida que maximizan la recompensa sin generalizar).
- Sin evaluaciones: no hay resultados de benchmarks ni tasas de exito publicadas, por lo que cualquier afirmacion de rendimiento seria especulativa.
- Licencia: Apache 2.0, lo que permite uso comercial, pero el repositorio incluye la licencia original de Qwen y conviene revisar las condiciones del modelo base para el despliegue final.
- Reproducibilidad: existe enlace al run de W&B y al codigo de entrenamiento, pero los artefactos de datos y los detalles completos del sweep no estan en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Sorting-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo hermano (entorno ConvexHull): https://huggingface.co/davidheineman/opd-teacher-Q2.5I-ConvexHull-step149
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/731ba2a4
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Perfil de HuggingFace del autor: https://huggingface.co/davidheineman/models
- Perfil de GitHub del autor: https://github.com/davidheineman
- Sitio personal del autor: https://davidheineman.com/
