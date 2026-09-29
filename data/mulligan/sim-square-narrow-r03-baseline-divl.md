# mulligan/sim-square-narrow-r03-baseline-divl

## Resumen

sim-square-narrow-r03-baseline-divl es un agente de control robótico basado en estado (state-based), desarrollado por el equipo de Mulligan como parte de su proyecto de investigación en aprendizaje por refuerzo offline e imitación. El modelo resuelve la tarea simulada sim-square-narrow (asociada a la tarea de ensamblaje NutAssemblySquare, segun los nombres de los artefactos de entrenamiento), y su objetivo es producir políticas de manipulación con alta tasa de éxito a partir de datos de teleoperación y de rollouts de políticas previas.

Tecnicamente, el modelo combina un actor de difusion congelado (heredado del modelo padre sim-square-narrow-r03-baseline-idql) con un critico DIVL de tipo distributional. Se publica como una ronda R3, brazo "baseline", dentro de la celda de campana `sq_d0_r3_baseline_uniform_nocf_human_only`, con cinco semillas entrenadas hasta el paso 150001. Los artefactos entregados son `policy.pt` y `stats.json` por semilla.

La relevancia de esta ficha radica en que es un ejemplo representativo de pipeline de investigacion en RL offline para robótica (IQL, DDPG+BC, IDQL, DIVL y DAgger), con evaluacion cuantitativa publicada sobre una rejilla de estados iniciales reservada. La licencia es MIT y el repositorio ocupa 1,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente state-based con actor de difusion congelado y critico DIVL distributional |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (politica de control por paso, sin ventana de contexto en tokens) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en `policy.pt`, sin variantes cuantizadas) |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) mas `stats.json` |
| Tarea | sim-square-narrow |
| Ronda / brazo | R3 / baseline |
| Semillas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El agente es state-based: recibe observaciones de estado del entorno (no imagenes) y emite acciones de control. La pieza central es un actor de difusion congelado, procedente del modelo padre sim-square-narrow-r03-baseline-idql, sobre el que se entrena un critico DIVL de tipo distributional. La combinacion de un actor de difusion con un critico distributional busca mejorar la estimacion del valor y la estabilidad del aprendizaje offline.

El entrenamiento se apoya en un conjunto heterogeneo de datos: teleoperacion base (c00), rollouts de la politica baseline (c01, c02) y datos de DAgger sobre la baseline (c01, c02, c03). Los nombres de los artefactos de W&B (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indican el uso combinado de IQL, DDPG+BC, IDQL y DIVL en el pipeline. Los checkpoints son copias byte a byte de los artefactos de W&B (verificacion MD5 contra el manifiesto y SHA-256 en `release.json`). No se detalla en la informacion disponible el numero de tokens ni la composicion exacta de las transiciones de entrenamiento.

## Capacidades

- Control robótico de manipulacion en simulacion para la tarea sim-square-narrow (ensamblaje de pieza cuadrada, segun los nombres de artefactos).
- Politica de imitacion/aprendizaje offline capaz de explotar datos de teleoperacion y de rollouts.
- Aprendizaje por refuerzo offline mediante actor de difusion mas critico distributional (DIVL).
- Soporte de entrenamiento iterativo con DAgger (correccion de la politica baseline).
- Reproducibilidad multi-semilla: cinco semillas entrenadas de forma independiente.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en RL offline: usar el agente como linea base (baseline) reproducible para comparar variantes de actor/critico en la tarea sim-square-narrow, aprovechando las cinco semillas y los pasos de entrenamiento fijados.
- Evaluacion de algoritmos de imitacion: emplear el pipeline IQL/DDPG+BC/IDQL/DIVL documentado para medir el efecto de cada componente sobre la tasa de exito.
- Generacion de datos sinteticos de politica: ejecutar la politica para producir rollouts que alimenten futuras rondas de DAgger, como ya se hizo con los conjuntos c01, c02 y c03.
- Analisis de robustez ante estados iniciales: usar la rejilla de estados iniciales reservada de la evaluacion para estudiar la sensibilidad del agente a distintas condiciones de partida.
- Reutilizacion como actor congelado: integrar el actor en nuevos experimentos donde solo se entrene el critico, dado que el actor se hereda del modelo padre.
- Reproduccion de experimentos academicos: replicar resultados a partir de los artefactos de W&B referenciados y del commit de codigo (`3053203fc3df`).
- Benchmarking interno de manipulacion: comparar la tasa de exito de este brazo baseline frente a otros brazos y rondas del mismo proyecto Mulligan.

## Benchmarks y rendimiento

La model card publica resultados de evaluacion sobre una rejilla de estados iniciales reservada (`sim-square-narrow-r00-r03-eval`), con N=32 y un total de 8000 ensayos por semilla.

| Semilla | N | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 7554/8000 | 94,43 % |
| seed-2 | 32 | 7645/8000 | 95,56 % |
| seed-3 | 32 | 7595/8000 | 94,94 % |
| seed-4 | 32 | 7455/8000 | 93,19 % |
| seed-5 | 32 | 7448/8000 | 93,10 % |

Media aritmetica de las cinco semillas: 37697/40000, es decir, 94,24 % de exito. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; estos no aplican al tratarse de una politica de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. Al ser un agente state-based con un actor de difusion, el coste de inferencia es bajo en comparacion con modelos de vision-lenguaje; es plausible su ejecucion en GPU de gama consumer o incluso en CPU, pero no se aportan cifras concretas.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: carga mediante PyTorch (los ficheros `.pt` son pickles de PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch, por lo que deben cargarse unicamente en un entorno de confianza.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Licencia | Disponibilidad | Tasa de exito |
|---|---|---|---|---|---|
| sim-square-narrow-r03-baseline-divl | sim-square-narrow | Actor de difusion congelado + critico DIVL | MIT | HuggingFace | 94,24 % (media 5 semillas) |
| sim-square-narrow-r03-baseline-idql | sim-square-narrow | IDQL (origen del actor congelado) | no disponible en la informacion | HuggingFace | no disponible |
| Otros brazos/rondas de Mulligan | sim-square-narrow | Depende del brazo (baseline, DAgger, etc.) | MIT (segun proyecto) | HuggingFace | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada. La comparacion con `sim-square-narrow-r03-baseline-idql` es estructural: este modelo hereda su actor congelado y sustituye/introduce el critico DIVL.

## Limitaciones y advertencias

- Ambito restringido: el modelo esta especializado en una unica tarea simulada (sim-square-narrow) y no generaliza a otras tareas sin reentrenamiento.
- Dominio simulado: no hay evidencia en la informacion disponible de transferencia a robots reales (sim-to-real no documentado).
- Entrada state-based: depende del vector de estado del simulador, por lo que no procesa imagenes ni lenguaje.
- Riesgo de sobreajuste a la rejilla de entrenamiento y a los estados iniciales cubiertos por los datos de teleoperacion y DAgger.
- Riesgo de alucinacion: no aplicable, al no ser un modelo generativo de lenguaje.
- Sesgos conocidos: no disponibles; no se documentan analisis de sesgo para esta politica.
- Limitaciones de contexto o idioma: no aplicables.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero debe conservarse el aviso de copyright correspondiente.
- Carga segura: los `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse; cargar solo en entornos de confianza.
- Reproducibilidad: depende de los commits de codigo y de los artefactos de W&B referenciados; sin ellos, la replicacion puede no ser exacta.
- Sin resultados de robustez: no se publican pruebas ante perturbaciones, ruido de sensores o cambios de dinamica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-baseline-divl
- Modelo padre (IDQL, origen del actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r03-baseline-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts baseline c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Dataset DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Dataset de rollouts baseline c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-baseline-policy-rollouts
- Dataset DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-baseline
- Dataset DAgger c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-baseline
- Dataset de rollouts Mulligan c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Referencia externa sobre rollouts baseline c03: https://claru.ai/datasets/mulligan-sim-square-narrow-c03-baseline-policy-rollouts
