# SLAI-AITP/SLAI-T-Rex-Flash

## Resumen

SLAI T-Rex-Flash es un modelo de lenguaje especializado en investigación operativa (Operations Research, OR) y programación matemática, desarrollado por SLAI-AITP a partir del checkpoint DeepSeek-V4-Flash mediante un proceso de post-entrenamiento en dos fases: continuación del pre-entrenamiento con parámetros completos (CPT) seguida de ajuste fino supervisado (SFT) con una receta denominada Clean-CoT. El modelo está diseñado para traducir problemas de optimización expresados en lenguaje natural a formulaciones matemáticas y programas Python compatibles con solvers como Gurobi, así como para tareas de modelado sensibles a la estructura y problemas orientados a la viabilidad.

El entrenamiento se realizó sobre un Ascend CloudMatrix384 SuperPOD con NPUs Ascend 910C, alcanzando una utilización de FLOPs del modelo (MFU) del 34,22 %, con una mejora de 2,93 veces respecto a la receta de referencia de código abierto. Con aproximadamente 291 000 millones de parámetros, el modelo conserva en gran medida las capacidades generales del modelo base (MMLU 5-shot de 88,5 frente a 87,6) mientras mejora notablemente en benchmarks de OR, con una ganancia media de 11,27 puntos porcentuales sobre DeepSeek-V4-Flash. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para investigación y desarrollo en modelado matemático y generación de código para solvers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V4-Flash (arquitectura DeepSeek-V4; detalles especificos no disponibles) |
| Parametros totales | 290 944 616 402 (aproximadamente 291 000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la fase SFT usa secuencias de 8192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de DeepSeek-V4-Flash, del que no se detallan en la informacion disponible los componentes internos (si es denso o de mezcla de expertos, tipo de atencion, etc.). El proceso de post-entrenamiento consta de dos etapas: una fase de CPT con parametros completos que incorpora terminologia de investigacion operativa, patrones de formulacion, APIs de solvers y prioris estructurales; y una fase posterior de SFT con la receta Clean-CoT que alinea estas capacidades con instrucciones de tarea, contratos de salida, explicaciones matematicas e implementaciones ejecutables estilo Gurobi. La receta SFT reportada utiliza una longitud de secuencia de 8192 tokens, optimizador AdamW, un tamano de lote global de 128 y optimizacion de parametros completos. El entrenamiento se llevo a cabo en un Ascend CloudMatrix384 SuperPOD con NPUs Ascend 910C, logrando un 34,22 % de MFU, 2,93 veces superior a la receta de referencia de codigo abierto.

## Capacidades

- Traduccion de problemas de optimizacion en lenguaje natural a programas matematicos formales (identificacion de variables, funcion objetivo y restricciones).
- Generacion de implementaciones Python estilo Gurobi ejecutables y compatibles con solvers.
- Tareas orientadas a viabilidad (feasibility-oriented tasks) y modelado de optimizacion sensible a la estructura.
- Produccion de modelos compatibles con solvers bajo contratos de salida estrictos (secciones etiquetadas como `thinking`, `<model>` y `<python>` en datos de entrenamiento).
- Escritura de programas LP y salidas solo de codigo segun contratos especificos de tarea.
- Razonamiento estructurado y explicaciones matematicas asociadas a las formulaciones.
- Capacidades generales de lenguaje conservadas del modelo base: razonamiento, matematicas, generacion de codigo y conocimiento general (MMLU 88,5; GSM8K 90,3; HumanEval 68,8).

## Casos de uso

- Formulacion automatica de problemas de optimizacion: un analista describe un problema de planificacion de produccion o asignacion de recursos en lenguaje natural y el modelo genera la formulacion matematica completa con variables, restricciones y funcion objetivo, lista para revision.
- Generacion de codigo Gurobi en produccion: el modelo produce implementaciones Python ejecutables que pueden integrarse en pipelines de optimizacion existentes, reduciendo el tiempo de desarrollo de prototipos de modelos de programacion lineal o entera.
- Validacion de viabilidad de modelos: dado un conjunto de restricciones, el modelo identifica si el problema es factible y sugiere ajustes estructurales, util en entornos de planificacion con multiples escenarios.
- Educacion e investigacion en investigacion operativa: generacion de ejemplos resueltos, explicaciones paso a paso de formulaciones y comparacion de enfoques de modelado para materiales docentes.
- Automatizacion de tareas de modelado en consultoria: traduccion de requisitos de clientes a modelos estandarizados que los equipos pueden revisar y desplegar sin partir de cero.
- Estudio de post-entrenamiento adaptativo por dominio: el modelo sirve como caso de referencia para investigar recetas de CPT y SFT orientadas a razonamiento estructurado en dominios especializados.

## Benchmarks y rendimiento

Resultados reportados en el informe tecnico bajo evaluacion zero-shot Pass@1. `Overall` es la media sin ponderar de los cuatro benchmarks de OR:

| Modelo | NL4OPT | OptiBench | B4O-Feasible | B4O-ORGEval | Overall |
|---|---:|---:|---:|---:|---:|
| DeepSeek-V4-Flash | 84,08 | 63,33 | 60,47 | 34,26 | 60,54 |
| SLAI T-Rex-Flash | 89,52 | 67,12 | 71,22 | 59,39 | 71,81 |

Retencion de capacidades generales:

| Benchmark | SLAI T-Rex-Flash | Base |
|---|---:|---:|
| MMLU, 5-shot | 88,5 | 87,6 |
| MMLU-Pro, 5-shot | 69,2 | 71,0 |
| CMMLU, 5-shot | 92,4 | 92,1 |
| HumanEval, 0-shot | 68,8 | 69,4 |
| GSM8K, 8-shot | 90,3 | 89,8 |
| MATH, 4-shot | 56,7 | 58,4 |

Los autores advierten que las comparaciones solo son validas bajo las mismas plantillas de prompt, presupuestos de decodificacion, versiones de benchmark, entorno de solver e implementacion de puntuacion descritos en el articulo.

## Requisitos de hardware

- El checkpoint pesa aproximadamente 581,9 GB en safetensors, por lo que en precision FP16 o BF16 se necesitan del orden de 580 GB de VRAM para alojar los pesos completos.
- No se dispone de datos oficiales de VRAM para inferencia ni de GPUs recomendadas en la informacion publicada.
- Dado el tamano de 291 000 millones de parametros, el despliegue requiere multiples aceleradores (varias GPUs de alta capacidad o NPUs Ascend) o el uso de cuantizacion, aunque no se publican tipos de cuantizacion soportados.
- El entrenamiento se realizo en NPUs Ascend 910C sobre un Ascend CloudMatrix384 SuperPOD; el despliegue en inferencia requiere un runtime compatible con la arquitectura DeepSeek-V4 y con el formato de checkpoint del repositorio.
- No se indican opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible; la model card recomienda revisar los archivos de configuracion del repositorio antes del despliegue.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

La unica comparativa directa disponible en la informacion es contra su modelo base, DeepSeek-V4-Flash, en los benchmarks de OR y de capacidades generales (ver seccion de benchmarks). No se dispone de comparaciones publicadas con otros modelos especializados en investigacion operativa. Como referencia de categoria, se puede senalar que el modelo comparte tamano y arquitectura con DeepSeek-V4-Flash, pero no hay datos de otros modelos de OR comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---:|---|---|---|
| SLAI T-Rex-Flash | 291 000 millones | no disponible | Apache 2.0 | Investigacion operativa |
| DeepSeek-V4-Flash | 291 000 millones (base) | no disponible | no disponible | Generalista |

## Limitaciones y advertencias

- El modelo esta orientado a investigacion operativa y programacion matematica; fuera de este dominio sus capacidades son las del modelo base generalista, sin mejoras especificas.
- Solo se declara soporte para ingles (`language: en`); no se garantiza un rendimiento adecuado en otros idiomas aunque el modelo base pueda tener capacidades multilingues.
- No se publican datos sobre sesgos, alucinacion o comportamiento en entornos de produccion; como todo modelo de lenguaje, puede generar formulaciones incorrectas o codigo no ejecutable, por lo que se recomienda validacion humana de las salidas.
- La longitud de contexto de inferencia no esta documentada; la secuencia de entrenamiento SFT es de 8192 tokens, lo que sugiere una ventana limitada para problemas de optimizacion muy extensos.
- El despliegue requiere un runtime compatible con la arquitectura DeepSeek-V4 y con el formato de checkpoint; la model card advierte que las flags de servicio distribuido dependen del hardware, la version del runtime y la memoria disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base DeepSeek-V4-Flash si se planea un despliegue en produccion.
- Los resultados de benchmarks solo son comparables bajo las condiciones exactas descritas en el articulo tecnico; extrapolarlos a otros entornos puede llevar a conclusiones erroneas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SLAI-AITP/SLAI-T-Rex-Flash
- Articulo tecnico (arXiv): https://arxiv.org/abs/2607.20145
- PDF del articulo: https://arxiv.org/pdf/2607.20145
- Repositorio de codigo y recetas de entrenamiento: https://github.com/SLAI-AITP/SLAI-T-Rex
- Descarga del checkpoint via ModelScope: `SLAIAITP/DeepSeek-V4-Flash-OR` (instrucciones en la model card)
