# mulligan/sim-square-narrow-r01-baseline-straddled-auto-success-divl

## Resumen

El modelo `mulligan/sim-square-narrow-r01-baseline-straddled-auto-success-divl` es un checkpoint de politica (agente) para robotica simulada, publicado por el usuario `mulligan` dentro del proyecto Mulligan, una linea de investigacion sobre recogida de datos guiada por rendimiento para aprendizaje en robot. No es un modelo de lenguaje: se trata de un agente basado en estado (state-based) que combina un actor de difusion congelado, heredado del checkpoint padre `sim-square-narrow-r01-baseline-straddled-auto-success-idql`, con un critico DIVL de tipo distributional. El repositorio incluye los ficheros `policy.pt` y `stats.json`, distribuidos en cinco carpetas, una por semilla (seed-1 a seed-5).

La tarea objetivo es `sim-square-narrow`, correspondiente a la ronda R1 del brazo `baseline-straddled-auto-success`, dentro de la celda de campana `sq_d0_r1_baseline_uniform_nocf_straddled_auto_success`. Todos los checkpoints corresponden al paso de entrenamiento 150001. El repositorio ocupa 1,4 GB e incluye los pesos de las cinco semillas, ademas de metadatos de procedencia (`release.json`) que registran hashes SHA-256 frente a los artefactos originales de Weights & Biases.

Su relevancia es fundamentalmente metodologica y de reproducibilidad: forma parte de una campana comparativa de tecnicas de aprendizaje por imitacion y refuerzo offline (IQL, DDPG+BC, IDQL, DIVL, DAgger) sobre una misma tarea, con evaluacion en una rejilla de estados iniciales reservada. La tasa de exito agregada en evaluacion se situa en torno al 82,4 %, con variacion entre semillas, lo que lo convierte en una referencia de linea base para comparar variantes posteriores del mismo proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente basado en estado: actor de difusion (congelado, heredado del checkpoint padre) mas critico DIVL de tipo distributional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de estado, no secuencia de texto); ventana concreta no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robotica, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, pickle de PyTorch) mas `stats.json` y `release.json` |
| Tarea | sim-square-narrow |
| Ronda de modelo | R1 |
| Brazo | baseline-straddled-auto-success |
| Celda de campana | `sq_d0_r1_baseline_uniform_nocf_straddled_auto_success` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente se define como «state-based agent with the parent's frozen diffusion actor and a distributional DIVL critic». Es decir, la parte generadora de acciones es un actor de difusion que no se entrena en esta ronda: se importa congelado desde el checkpoint `sim-square-narrow-r01-baseline-straddled-auto-success-idql`. Sobre esa base, la ronda R1 entrena un critico DIVL de tipo distributional, cuyo objetivo es estimar la distribucion de retornos en lugar de un valor escalar unico. Los nombres de los artefactos de Weights & Biases que originaron cada semilla (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indican que el pipeline de entrenamiento combina componentes de IQL, DDPG+BC, IDQL y DIVL sobre la tarea referida internamente como nut assembly square.

El entrenamiento se ejecuto sobre tres conjuntos de datos declarados: `sim-square-narrow-c00-teleop-baseline` (demostraciones de teleoperacion), `sim-square-narrow-c01-baseline-policy-rollouts` (rollouts de la politica base) y `sim-square-narrow-c01-dagger-baseline` (datos de agregacion de conjuntos de datos tipo DAgger a partir de la politica base). No se especifica en la informacion disponible el numero total de transiciones, la composicion exacta del dataset ni si hubo fases de RLHF o DPO, algo que en cualquier caso no aplica a este tipo de modelo. La innovacion tecnica destacable es la combinacion de un actor de difusion congelado con un critico distributional DIVL y una recogida de datos guiada por exito, repetida sobre cinco semillas para poder medir varianza entre ejecuciones.

## Capacidades

- Generacion de acciones de control para manipulacion robotica simulada en la tarea sim-square-narrow (entorno de tipo nut assembly square, segun la nomenclatura de los artefactos de entrenamiento).
- Aprendizaje por imitacion y por refuerzo offline: integra senales de demostraciones de teleoperacion, rollouts de politica base y datos de DAgger.
- Estimacion distributional de retornos mediante el critico DIVL, util para analisis de valor y no solo para seleccion de acciones.
- Evaluacion reproducible: cada semilla incluye sus propios pesos y estadisticas, de modo que se puede medir la dispersion entre semillas.
- Trazabilidad de procedencia: `release.json` registra la verificacion MD5/SHA-256 frente al manifiesto del artefacto original de W&B.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling, function calling, capacidades de agente multi-paso basadas en lenguaje ni capacidades multilingues. La etiqueta de idiomas figura como no disponible porque el modelo no procesa lenguaje natural.

## Casos de uso

- Linea base de comparacion en investigacion: sirve como referencia cuantitativa (aproximadamente 82,4 % de exito medio en la rejilla de evaluacion) frente a la cual medir variantes posteriores de la misma campana, como cambios de critico, de mezcla de datos o de rondas de minado.
- Estudio de varianza entre semillas: al incluir cinco semillas independientes, permite cuantificar la dispersion real del metodo (del 81,48 % al 84,11 % de exito) antes de extraer conclusiones de una unica ejecucion.
- Recogida de datos con DAgger: los conjuntos `sim-square-narrow-c01-dagger-baseline` y los rollouts de politica base se pueden reutilizar para entrenar nuevas rondas de agregacion con intervencion de un experto, usando este checkpoint como politica inicial.
- Investigacion en criticos distributionales: el componente DIVL se puede aislar para estudiar como afecta la modelizacion distributional del valor respecto a criticos escalares clasicos en tareas de ensamblaje.
- Ablaciones controladas de actor congelado: dado que el actor se hereda congelado del checkpoint IDQL, este repositorio permite aislar el efecto del critico manteniendo constante la politica base.
- Reproducibilidad de resultados publicados: los commits de git, los identificadores de ejecucion de W&B y los hashes permiten reconstruir exactamente el pipeline que genero estos pesos.
- Preentrenamiento para simulacion a realidad: los pesos se pueden usar como punto de partida para ajuste fino en un gemelo simulado de un banco de ensamblaje, antes de transferir a un robot real.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la evaluacion en rejilla de estados iniciales reservada (*held-out initial-state grid*), registrados en el dataset `sim-square-narrow-r00-r03-eval`. Se reproduce la tabla tal como aparece en la model card, con la tasa de exito calculada sobre los totales indicados.

| Semilla | N | Exitos | Total de rollouts | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 6518 | 8000 | 81,48 % |
| seed-2 | 32 | 6530 | 8000 | 81,63 % |
| seed-3 | 32 | 6729 | 8000 | 84,11 % |
| seed-4 | 32 | 6528 | 8000 | 81,60 % |
| seed-5 | 32 | 6644 | 8000 | 83,05 % |
| Media (calculada) | — | 32949 | 40000 | 82,37 % |

Nota: la columna N aparece con valor 32 en la model card original mientras el total de rollouts es 8000; no se especifica en la informacion disponible a que corresponde exactamente ese 32 (posiblemente numero de estados iniciales de la rejilla). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark de lenguaje, ya que no aplican a este modelo. Tampoco se proporcionan comparaciones numericas con otros checkpoints del proyecto.

## Requisitos de hardware

- No se publican requisitos de VRAM ni de GPU en la informacion disponible.
- Se trata de un agente basado en estado con redes de tipo actor de difusion y critico, no de un modelo de lenguaje; el repositorio completo (cinco semillas) ocupa 1,4 GB, lo que implica del orden de cientos de megabytes por semilla (estimacion aproximada de 280 MB por semilla a partir del tamano total, no confirmada por el autor).
- Por su naturaleza y tamano, es probable que la inferencia quepa en GPU de consumo e incluso en CPU, pero esta afirmacion es una inferencia a partir del tamano del repositorio y no un dato publicado; debe validarse en el entorno concreto.
- GPU recomendadas: no disponible.
- Opciones de despliegue: carga directa de los ficheros `.pt` con PyTorch en un entorno de confianza, junto con el codigo de investigacion de Mulligan en el commit `3053203fc3df`. Los servidores de inferencia para modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no aplican a este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Paso de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mulligan/sim-square-narrow-r01-baseline-straddled-auto-success-divl` (este) | Actor de difusion congelado + critico DIVL distributional | sim-square-narrow | 150001 | MIT | Publico en HuggingFace, 0 descargas |
| `mulligan/sim-square-narrow-r01-baseline-straddled-auto-success-idql` | Actor de difusion IDQL (checkpoint padre) | sim-square-narrow | no disponible en la informacion proporcionada | MIT (segun el proyecto) | Publico en HuggingFace |
| Variantes de la campana c01/c02 (`sim-square-narrow-c01-dagger-baseline`, `...-c02-auto-iql-success-bc-n32-policy-rollouts`) | Politicas de comportamiento y rollouts asociados | sim-square-narrow | no disponible | MIT (segun el proyecto) | Publicos, principalmente como datasets |

No se dispone de resultados numericos comparables entre estos checkpoints en la informacion proporcionada, por lo que no se puede establecer una jerarquia de rendimiento mas alla de la evaluacion propia de este modelo. Tampoco se conocen alternativas externas al proyecto Mulligan evaluadas sobre la misma tarea con la que comparar de forma directa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al entrenarse principalmente con demostraciones de teleoperacion y rollouts de una politica base, hereda las limitaciones de cobertura de esos datos y puede degradarse fuera de la distribucion de estados de la tarea sim-square-narrow.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el analogo es la generacion de acciones no validas o fuera de distribucion cuando el estado observado se aleja de los datos de entrenamiento.
- Ambito restringido: el modelo esta especializado en una unica tarea de manipulacion simulada. No es un modelo general ni transferible sin ajuste a otras tareas.
- Limitaciones de idioma: no aplica, no procesa lenguaje natural.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia. No obstante, conviene revisar las condiciones de los datasets y del codigo de investigacion asociados, que pueden tener terminos propios.
- Riesgo de seguridad al cargar los pesos: la propia model card advierte de que los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en un entorno de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- Ausencia de documentacion de uso: no se incluyen ejemplos de inferencia, esquema de observaciones, espacio de acciones ni requisitos de dependencias, lo que dificulta la reproduccion fuera del pipeline de Mulligan.
- Trazabilidad temporal: las fechas de creacion y actualizacion del repositorio (2026) y las de los artefactos de entrenamiento son coherentes con el proyecto, pero un lector debe verificar los commits indicados antes de asumir equivalencia con una version concreta del codigo.
- Varianza entre semillas: la diferencia observada de casi 2,6 puntos porcentuales entre la mejor y la peor semilla implica que cualquier comparacion debe hacerse con multiples semillas y no con una unica ejecucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-baseline-straddled-auto-success-divl
- Checkpoint padre (actor IDQL): https://huggingface.co/mulligan/sim-square-narrow-r01-baseline-straddled-auto-success-idql
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de politica base: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Dataset de DAgger: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Pagina del proyecto Mulligan: https://mulligan.page/
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Datasets etiquetados con sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
- Repositorio de codigo de Mulligan: https://github.com/dudefication/mulligan/tree/main
- Dataset relacionado c02 (rollouts de politica auto-IQL): https://claru.ai/datasets/mulligan-sim-square-narrow-c02-auto-iql-success-bc-n32-policy-rollouts
