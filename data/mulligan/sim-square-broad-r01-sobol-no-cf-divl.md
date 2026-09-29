# mulligan/sim-square-broad-r01-sobol-no-cf-divl

## Resumen

sim-square-broad-r01-sobol-no-cf-divl es un agente de control para robótica basado en estado (sin visión) publicado por la organización Mulligan dentro de su campaña de investigación en aprendizaje por refuerzo. Corresponde a la ronda R1 de la tarea simulada `sim-square-broad`, en el brazo `sobol-no-cf` (celda de campaña `sq_d1_r1_ours_sobol_nocf_human_only`), y combina el actor de difusión congelado heredado del modelo `sim-square-broad-r01-sobol-no-cf-idql` con un crítico DIVL de tipo distribucional. El repositorio contiene cinco checkpoints, uno por semilla (semillas 1 a 5), todos capturados en el paso de entrenamiento 250001.

No es un modelo de lenguaje ni un modelo generativo de propósito general: no procesa texto ni imágenes y no tiene ventana de contexto en el sentido habitual. Su función es producir acciones de control a partir de observaciones de estado en un entorno de simulación, y se distribuye como un fichero `policy.pt` y un `stats.json` por semilla.

Su relevancia es metodológica y de reproducibilidad: sirve como referencia verificable (los ficheros son copias byte a byte de artefactos de W&B, con MD5 comprobado contra el manifiesto y SHA-256 registrado en `release.json`) para comparar variantes de un mismo algoritmo —en este caso, la incorporación de un crítico DIVL manteniendo congelado el actor— y como punto de partida para campañas de DAgger, minería de datos y evaluación en la arena pública de Mulligan.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente basado en estado con actor de difusión congelado (heredado de `sim-square-broad-r01-sobol-no-cf-idql`) y crítico DIVL distribucional |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; consume observaciones de estado) |
| Tipos de cuantizacion | no aplicable (no se publican pesos cuantizados) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | `policy.pt` (pickle de PyTorch) y `stats.json` por semilla; `release.json` con hashes SHA-256 |
| Tarea | sim-square-broad |
| Ronda de modelo | R1 |
| Brazo | sobol-no-cf |
| Celda de campana | `sq_d1_r1_ours_sobol_nocf_human_only` |
| Semillas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Commit de git | `551416bff972` (identico en las cinco semillas) |
| Tamano del repositorio | 1,4 GB (total, cinco semillas) |
| Pipeline declarado | robotics |
| Autor | mulligan |

## Arquitectura y entrenamiento

El modelo es un agente actor-crítico para control en simulación. El actor es una política de difusión que se hereda congelada del modelo `sim-square-broad-r01-sobol-no-cf-idql`; lo que se entrena en esta ronda es el crítico, de tipo DIVL y con formulación distribucional, según indica la propia model card. Los artefactos de W&B asociados a cada semilla se denominan `iql_ddpg_bc_idql_divl_square_d1_<marca temporal>`, nomenclatura de la que se deduce (sin que la model card lo detalle explícitamente) la presencia de componentes IQL, DDPG+BC, IDQL y DIVL en la tubería de entrenamiento. No se especifica el número de parámetros, la dimensión del espacio de observación o de acción, ni la arquitectura interna de las redes.

Los datos de entrenamiento declarados son tres conjuntos: `sim-square-broad-c00-teleop-sobol` (teleoperación), `sim-square-broad-c01-dagger-sobol-no-cf` (agregación de datos con DAgger) y `sim-square-broad-c01-sobol-policy-rollouts` (rollouts de política). No se publican en la información disponible el número de transiciones, la composición exacta del dataset ni detalles de regularización; tampoco aplican técnicas de alineación tipo RLHF o DPO, por tratarse de un agente de control y no de un modelo de lenguaje. El entrenamiento y la evaluación se realizaron con el código de investigación de Mulligan en el commit `551416bff972`.

## Capacidades

- Generación de acciones de control a partir de observaciones de estado en el entorno simulado `sim-square-broad`.
- Ejecución de una política de difusión preentrenada y congelada, complementada por un crítico distribucional entrenado en esta ronda.
- Robustez ante una rejilla amplia de estados iniciales ("broad") evaluada de forma retenida.
- Reutilización como actor docente o de referencia en campañas posteriores de DAgger y de minería de datos.
- Comparable entre semillas: se publican cinco semillas independientes del mismo paso de entrenamiento, lo que permite estudiar varianza.
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües ni de procesamiento de texto, imagen o audio.

## Casos de uso

- Evaluación comparativa de críticos en aprendizaje por refuerzo offline: al mantener congelado el actor y variar solo el crítico, permite aislar el efecto de la formulación DIVL distribucional frente a otras variantes del mismo brazo.
- Estudio de varianza entre semillas: las cinco semillas publicadas con idéntico paso de entrenamiento permiten cuantificar la dispersión del rendimiento sin reentrenar.
- Generación de datos para DAgger: la política puede desplegarse en el simulador para producir rollouts etiquetados que alimenten la siguiente ronda de agregación de datos.
- Punto de partida para destilación: al ser una política de difusión potencialmente costosa en inferencia, puede emplearse como docente para destilar una política estudiante más rápida en el mismo entorno.
- Investigación en sim-to-real: como política de referencia en una tarea de manipulación simulada, sirve de base para estudiar transferencia a hardware real antes de comprometer entrenamiento en robot físico.
- Reproducibilidad de resultados publicados: los ficheros son copias byte a byte de artefactos de W&B con MD5 verificado y SHA-256 registrado, lo que permite replicar exactamente las evaluaciones reportadas.
- Análisis de sensibilidad al estado inicial: la evaluación sobre una rejilla retenida de 32 estados iniciales por semilla facilita estudiar en qué regiones del espacio de estados falla la política.
- Base para investigación en crítica distribucional: el crítico DIVL puede reutilizarse o auditarse de forma independiente del actor congelado en experimentos de valoración fuera de política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K ni similares) en la información disponible, por tratarse de un agente de control robótico. Los únicos resultados de evaluación publicados son las tasas de éxito sobre una rejilla retenida de estados iniciales, con 32 estados por semilla y 30 000 rollouts por semilla, registrados en el conjunto `sim-square-broad-r00-r03-eval`.

| Semilla | N (estados iniciales) | Exitos / rollouts | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 20307 / 30000 | 67,69 % |
| seed-2 | 32 | 20866 / 30000 | 69,55 % |
| seed-3 | 32 | 21855 / 30000 | 72,85 % |
| seed-4 | 32 | 21029 / 30000 | 70,10 % |
| seed-5 | 32 | 21975 / 30000 | 73,25 % |
| Media (calculada) | 32 por semilla | 106032 / 150000 | 70,69 % |

La media de la última fila es un cálculo propio a partir de los datos publicados; no aparece como tal en la model card.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publica el tamaño de cada `policy.pt` ni el número de parámetros del actor o del crítico.
- Tamaño total del repositorio: 1,4 GB para las cinco semillas, lo que supone del orden de 280 MB por semilla incluyendo `policy.pt`, `stats.json` y metadatos (cálculo propio a partir del tamaño declarado).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; en ausencia de datos de tamaño, no puede confirmarse. Al tratarse de una política de control en simulación, es plausible que el actor sea una red de tamaño moderado, pero esto no está confirmado en la información proporcionada.
- Opciones de despliegue: los checkpoints son pickles de PyTorch (`policy.pt`), por lo que el despliegue esperado pasa por cargarlos con PyTorch y el código de investigación de Mulligan en el commit `551416bff972`. No se declara soporte para vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

En la información disponible solo se identifica un modelo directamente comparable: el padre del que procede el actor congelado. No se han encontrado otras alternativas comparables en la información proporcionada.

| Modelo | Relacion | Actor | Critico | Semillas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r01-sobol-no-cf-divl | Este modelo | Difusion congelada | DIVL distribucional | 5 | Apache 2.0 | HuggingFace |
| sim-square-broad-r01-sobol-no-cf-idql | Modelo padre (origen del actor congelado) | Difusion congelada | no disponible | no disponible | no disponible | HuggingFace |

Los datos de parámetros, contexto y rendimiento del modelo padre no están disponibles en la información proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Modelo basado en estado: no procesa visión, lenguaje ni audio; su uso está restringido al espacio de observación para el que fue entrenado.
- Específico del entorno `sim-square-broad`: no se declara transferencia a otras tareas, morfologías o robots reales.
- Ámbito simulado: no hay evidencia publicada de despliegue en hardware físico.
- Rendimiento imperfecto: la tasa de éxito media ronda el 70 %, con un rango entre el 67,69 % y el 73,25 % según la semilla, por lo que no es adecuado para producción sin una evaluación adicional específica del caso de uso.
- Varianza entre semillas apreciable (más de cinco puntos porcentuales entre la mejor y la peor), lo que obliga a reportar intervalos y no solo medias.
- Sesgos conocidos: no se documentan sesgos específicos, pero los datos de teleoperación humana pueden incorporar sesgos de demostración que la model card no analiza.
- Riesgo de alucinación: no aplicable en el sentido de los modelos de lenguaje, pero existe riesgo de acciones fuera de distribución ante estados iniciales no cubiertos por los datos de entrenamiento.
- Limitaciones de idioma: no aplicable; el modelo no procesa lenguaje natural.
- Seguridad de los pesos: los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en entornos de confianza, tal como advierte el propio autor.
- Licencia: Apache 2.0, permisiva para uso comercial, pero la licencia cubre el artefacto publicado y no necesariamente las dependencias del código de investigación ni el entorno de simulación subyacente.
- Ausencia de datos operativos: no se publican requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-sobol-no-cf-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r01-sobol-no-cf-idql
- Organización en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Arena de evaluaciones: https://arena.mulligan.page
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset de DAgger: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-sobol-no-cf
- Dataset de rollouts de política: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
