# mulligan/sim-square-narrow-r03-mulligan-no-c03-rollouts-divl

## Resumen

El modelo `mulligan/sim-square-narrow-r03-mulligan-no-c03-rollouts-divl` no es un modelo de lenguaje, sino un agente de control para robótica publicado por la organización Mulligan dentro de su campaña de experimentos sobre la tarea simulada `sim-square-narrow`. Se trata de un agente basado en estado (state-based) que combina un actor de difusión congelado, heredado del modelo padre `sim-square-narrow-r03-mulligan-no-c03-rollouts-idql`, con un crítico DIVL de tipo distributional. El repositorio distribuye exclusivamente los artefactos de política (`policy.pt` y `stats.json`) para cinco semillas independientes, más un `release.json` con los hashes SHA-256 de cada fichero.

La relevancia del modelo es metodológica más que de producto: forma parte de una comparativa controlada de recetas de aprendizaje por refuerzo offline/por imitación sobre una misma tarea, con evaluación en una rejilla de estados iniciales reservada (held-out) y resultados publicados por semilla. El identificador del brazo experimental, `mulligan-no-c03-rollouts`, indica que esta variante se entrenó sin los rollouts de la ronda c03, lo que permite aislar el efecto de esa fuente de datos frente a otros brazos de la misma campaña.

El checkpoint publicado corresponde al paso de entrenamiento 150001 y ocupa 1,4 GB en total para las cinco carpetas de semilla. No se publican en la model card ni el número de parámetros, ni la arquitectura concreta de las redes, ni el número de pasos de difusión, por lo que buena parte de las especificaciones habituales quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de control con actor de difusion congelado (heredado del padre IDQL) y critico DIVL distributional; detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: agente de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en formato PyTorch pickle) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) mas `stats.json` por semilla; hashes SHA-256 en `release.json` |
| Tarea | sim-square-narrow |
| Ronda de modelo | R3 |
| Brazo experimental | mulligan-no-c03-rollouts |
| Celda de campana | `square_narrow_r3_mulligan_with_cf_human_only_no_c03_rollouts` |
| Semillas publicadas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB (conjunto de las cinco semillas y ficheros auxiliares) |
| Tipo de observacion | basada en estado (state-based), no en imagen |

## Arquitectura y entrenamiento

La model card describe el agente en una sola frase tecnica: se trata de un agente basado en estado que utiliza el actor de difusion congelado del modelo padre y un critico DIVL de tipo distributional. El padre indicado es `mulligan/sim-square-narrow-r03-mulligan-no-c03-rollouts-idql`, lo que sugiere una familia de métodos de aprendizaje por refuerzo offline con politicas de difusion (la terminologia IDQL apunta a Implicit Diffusion Q-Learning), sobre la que esta variante sustituye o anade un critico distributional. La model card no expande el acronimo DIVL ni detalla la arquitectura de las redes, el numero de pasos de difusion, el tamano de las capas ni el presupuesto de computo, por lo que esos datos quedan como no disponibles.

En cuanto a los datos, el entrenamiento combina seis conjuntos publicados en la organizacion `mulligan`: teleoperacion con SOBOL (`sim-square-narrow-c00-teleop-sobol`), dos rondas de DAgger con Mulligan (`c01-dagger-mulligan` y `c02-dagger-mulligan`), rollouts de politica SOBOL (`c01-sobol-policy-rollouts`), rollouts de politica Mulligan (`c02-mulligan-policy-rollouts`) y una tercera ronda de DAgger (`c03-dagger-mulligan`). El nombre del brazo, `no-c03-rollouts`, indica que esta variante excluye los rollouts de la ronda c03 del entrenamiento, aunque el dataset de DAgger de c03 si figura entre los listados. No se especifica el numero de transiciones totales, la composicion porcentual del dataset ni si se aplicaron fases de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no aplicables aqui).

## Capacidades

- Control de politica para la tarea simulada `sim-square-narrow`, con observaciones basadas en estado.
- Generacion de acciones multimodal mediante un actor de difusion, lo que permite representar distribuciones de accion no unimodales.
- Estimacion de valor distributional a traves del critico DIVL, orientada a mejorar la estabilidad del aprendizaje offline.
- Cinco checkpoints independientes (semillas 1 a 5) que permiten estudiar varianza entre ejecuciones y reproducibilidad.
- Reutilizacion del actor del modelo padre IDQL como componente congelado, lo que facilita comparaciones controladas entre criticos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso simbolico, vision, audio ni procesamiento de lenguaje natural; no aplican a este tipo de artefacto.

## Casos de uso

- Reproduccion de experimentos de RL offline: cargar `policy.pt` de cada semilla y replicar la evaluacion sobre la rejilla de estados iniciales reservada, comparando la dispersion entre semillas (de 95,65 % a 98,01 % de exito).
- Ablacion de fuentes de datos: al ser el brazo `no-c03-rollouts`, permite medir el efecto de excluir los rollouts de la ronda c03 frente a otros brazos de la misma campana que si los incluyen.
- Generacion de datos sinteticos de politica: los rollouts del agente pueden registrarse para alimentar nuevas rondas de DAgger o de destilacion, tal y como sugiere la cadena de datasets c01 a c03.
- Benchmarking interno de metodos de critico: al mantener el actor congelado y variar el critico (IDQL frente a DIVL), sirve como punto de comparacion para evaluar estimadores de valor en regimen offline.
- Investigacion en simulacion robotica: uso del agente como linea base en entornos simulados de insercion o colocacion de precision antes de plantear transferencia a un robot real.
- Evaluacion estandarizada en plataforma: los resultados pueden contrastarse en Policy Arena, el portal de evaluaciones de Mulligan, junto al resto de brazos de la ronda R3.
- Analisis de robustez ante condiciones iniciales: el desglose por semilla y por estado inicial del dataset de evaluacion permite estudiar que configuraciones del entorno provocan fallos.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la evaluacion held-out sobre una rejilla de estados iniciales, recogidos en el dataset `mulligan/sim-square-narrow-r00-r03-eval` (N = 32 por semilla, 8000 rollouts registrados por semilla).

| Semilla | Rollouts evaluados | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 7724 | 96,55 % |
| seed-2 | 8000 | 7680 | 96,00 % |
| seed-3 | 8000 | 7652 | 95,65 % |
| seed-4 | 8000 | 7841 | 98,01 % |
| seed-5 | 8000 | 7699 | 96,24 % |
| Media (calculo propio) | 40000 | 38596 | 96,49 % |

La diferencia entre la mejor y la peor semilla es de 2,36 puntos porcentuales, lo que da una idea de la varianza del metodo en esta tarea. No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K y similares no aplican, y no hay tabla cruzada con los brazos alternativos en la informacion disponible).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican parametros, tipo de red ni pasos de difusion, por lo que no puede derivarse una cifra fiable.
- Tamano en disco: 1,4 GB para el repositorio completo con las cinco semillas. Como orden de magnitud, cada semilla ocuparia del orden de centenas de MB, aunque no se publica el desglose por fichero.
- GPU recomendadas: no disponible. No hay indicacion en la model card sobre GPU empleadas en entrenamiento o evaluacion.
- Viabilidad en GPU de consumo: no disponible por falta de datos de tamano del modelo. Por el volumen del repositorio (1,4 GB), es plausible que el actor quepa en GPUs de consumo, pero se trata de una estimacion no confirmada por el autor.
- Opciones de despliegue: los pesos se distribuyen como pickles de PyTorch (`.pt`), por lo que el despliegue requiere cargarlos en un entorno de confianza con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un agente de control.
- Latencia y throughput: no disponible. El coste por accion dependera del numero de pasos de difusion del actor, dato no publicado.
- Advertencia de seguridad: la propia model card indica que los ficheros `.pt` son pickles de PyTorch y deben cargarse solo en entornos de confianza.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo padre explicitamente citado. No hay datos cruzados de rendimiento con otras variantes.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sim-square-narrow-r03-mulligan-no-c03-rollouts-divl` (este) | no disponible | no aplica | 96,49 % de exito medio en la evaluacion held-out (5 semillas) | MIT | Publico en HuggingFace, 0 descargas |
| `sim-square-narrow-r03-mulligan-no-c03-rollouts-idql` (padre del actor) | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros brazos de la campana R3 (por ejemplo, variantes con rollouts c03) | no disponible | no aplica | no disponible | no disponible | Referenciados en el ecosistema Mulligan, sin datos en esta busqueda |

No se conocen modelos comparables de otros autores con los que contrastar, dado que se trata de un agente especifico de una tarea simulada concreta.

## Limitaciones y advertencias

- Especificidad de tarea: el agente esta entrenado para `sim-square-narrow` y no se documenta ningun tipo de generalizacion a otras tareas o entornos.
- Observaciones basadas en estado: no procesa imagenes ni entradas multimodales, lo que limita su uso directo en configuraciones con percepcion visual.
- Ambito de evaluacion restringido: los resultados corresponden a una rejilla de estados iniciales reservada con N = 32 por semilla; no hay evaluacion en entorno real ni evidencia de transferencia sim-to-real.
- Varianza entre semillas: la tasa de exito oscila entre 95,65 % y 98,01 %, de modo que el rendimiento esperado en produccion depende de la semilla elegida.
- Riesgo de fallo en el 2-4 % de los rollouts: en tareas de manipulacion fisica ese margen puede ser inaceptable sin una capa de supervision o recuperacion.
- Ausencia de documentacion tecnica: no se publican parametros, arquitectura de red, numero de pasos de difusion, hiperparametros de entrenamiento ni composicion exacta del dataset.
- Riesgo de seguridad al cargar pesos: los `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario; deben cargarse solo en entornos de confianza, tal y como advierte la propia model card.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia del modelo padre y de los datasets asociados no se detalla en la informacion proporcionada.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad ni soporte externo verificado.
- Sesgos: no se documentan analisis de sesgo ni de equidad; en un agente de control, el equivalente serian sesgos en la distribucion de estados y acciones aprendidos de la teleoperacion y de los rollouts, no cuantificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-no-c03-rollouts-divl
- Modelo padre (actor congelado, IDQL): https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-no-c03-rollouts-idql
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion c00: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan
- Dataset de rollouts SOBOL c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mulligan
- Dataset de rollouts Mulligan c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset DAgger c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mulligan
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Portal de evaluaciones Policy Arena: https://arena.mulligan.page

Nota sobre la busqueda web: los resultados devueltos en la busqueda (paginas de LinkedIn y un hilo de Zhihu) no guardan relacion con este modelo ni con el proyecto Mulligan; no se han incorporado. Tampoco se ha localizado la URL publica del repositorio de codigo de Mulligan donde se encuentran los `release/run-configs` y las recipes de reentrenamiento citadas en la model card.
