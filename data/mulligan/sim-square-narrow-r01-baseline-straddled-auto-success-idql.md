# mulligan/sim-square-narrow-r01-baseline-straddled-auto-success-idql

## Resumen

El modelo `mulligan/sim-square-narrow-r01-baseline-straddled-auto-success-idql` es un agente de control robotico basado en estado (no un modelo de lenguaje) entrenado con el algoritmo IDQL (Implicit Diffusion Q-Learning). Lo publica la organizacion `mulligan` dentro de su plataforma de investigacion Mulligan y su arena de evaluacion Policy Arena. Se trata de un checkpoint concreto de la ronda R1 para la tarea de simulacion `sim-square-narrow`, en la variante `baseline-straddled-auto-success`, y se distribuye con cinco semillas independientes (1 a 5), una por carpeta, todas en el paso de entrenamiento 150001.

Tecnicamente, el agente combina un actor de difusion con un critico IQL escalar. El artefacto incluye el checkpoint `policy.pt` en formato PyTorch y un fichero `stats.json` con los normalizadores de observaciones y acciones. El repositorio completo ocupa 1,4 GB y contiene las cinco semillas, cada una proveniente de un artefacto de Weights & Biases distinto y con un commit de git asociado.

Su relevancia es de tipo metodologico: forma parte de un pipeline de investigacion sobre aprendizaje por imitacion con datos de teleoperacion, rollouts de politica y DAgger, y sirve como baseline reproducible para comparar variantes de agente y de recopilacion de datos en la misma tarea. No es un modelo de proposito general ni esta pensado para inferencia de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion con critico IQL escalar (agente state-based) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (consume observaciones de estado, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`policy.pt`) mas `stats.json` con normalizadores |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Tarea | sim-square-narrow |
| Ronda de modelo | R1 |
| Brazo (arm) | baseline-straddled-auto-success |
| Celda de campana | `sq_d0_r1_baseline_uniform_nocf_straddled_auto_success` |
| Semillas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un actor parametrizado como modelo de difusion que genera acciones, acoplado a un critico IQL escalar que estima el valor de las acciones generadas. La model card lo describe explicitamente como "state-based IDQL agent: diffusion actor with scalar IQL critic". El estado se normaliza mediante los valores guardados en `stats.json`, que hay que aplicar antes de alimentar la politica. No se especifican en la informacion disponible el numero de parametros, la dimension de las observaciones, la arquitectura interna de la red de difusion (numero de pasos, tipo de scheduler) ni los hiperparametros de entrenamiento.

El entrenamiento usa tres conjuntos de datos del proyecto: `sim-square-narrow-c00-teleop-baseline` (demostraciones de teleoperacion), `sim-square-narrow-c01-baseline-policy-rollouts` (rollouts de la politica base) y `sim-square-narrow-c01-dagger-baseline` (datos de DAgger). No se detalla el numero de transiciones, la composicion exacta ni si hubo etapas de RLHF o preferencias, algo que no aplica en este dominio. Los cinco checkpoints son copias byte a byte de los artefactos de W&B correspondientes, con MD5 verificado contra el manifiesto del artefacto y SHA-256 registrado en `release.json`. La trazabilidad incluye el run de W&B y el commit de git de cada semilla; cuatro de las cinco semillas comparten commits distintos entre si (`1d6f645075c7`, `53320191c975`, `55e127140163`).

## Capacidades

- Control robotico por imitacion en la tarea `sim-square-narrow`, en entorno de simulacion.
- Generacion de acciones mediante actor de difusion a partir de observaciones de estado.
- Estimacion de valor de accion mediante critico IQL escalar (util para filtrado o ponderacion de acciones).
- Reproducibilidad por semilla: cinco politicas entrenadas de forma independiente para el mismo paso de entrenamiento.
- Integracion en pipelines de investigacion con datos heterogeneos (teleoperacion, rollouts de politica, DAgger).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modos de razonamiento tipo thinking, dado que no es un modelo de lenguaje.
- No se documentan capacidades de generalizacion fuera de la tarea ni de transferencia a otros entornos o robot fisico.

## Casos de uso

- Baseline de comparacion en investigacion: usar los cinco checkpoints como referencia fija de la ronda R1 para medir si una variante de agente o de recopilacion de datos mejora sobre `baseline-straddled-auto-success` en la misma tarea y paso de entrenamiento.
- Estudio de DAgger en manipulacion: dado que el entrenamiento consume datos de `sim-square-narrow-c01-dagger-baseline`, el checkpoint sirve para analizar como afecta la incorporacion de datos de correccion humana al comportamiento final de la politica.
- Analisis de varianza entre semillas: las cinco semillas permiten cuantificar la dispersion de la politica ante la misma tarea, algo habitual en evaluaciones de agentes de control donde una sola semilla no es representativa.
- Reproduccion de resultados: al incluir `release.json` con SHA-256 y referencias a runs de W&B y commits de git, el modelo se puede usar para replicar exactamente una evaluacion publicada en Policy Arena.
- Evaluacion comparativa en simulacion: integrar el agente en un bucle de evaluacion propio (por ejemplo, el conjunto `sim-square-narrow-r00-r03-eval`, que referencia estos checkpoints en sus metadatos) para obtener tasas de exito por semilla.
- Punto de partida para fine-tuning: emplear `policy.pt` como inicializacion en campañas posteriores de la misma tarea, en lugar de entrenar desde cero.
- Docencia y formacion: usar el par `policy.pt` mas `stats.json` como ejemplo minimo de pipeline IDQL completo, con normalizadores incluidos y trazabilidad de datos.
- Auditoria de procedencia: verificar la cadena artefacto de W&B, commit de git y fichero de release para estudios de reproducibilidad en aprendizaje por imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, retornos medios ni comparaciones numericas; unicamente referencia el conjunto de evaluacion `mulligan/sim-square-narrow-r00-r03-eval`, cuyos resultados no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada. El unico dato objetivo es el tamano del repositorio completo (1,4 GB para cinco semillas, por lo que cada semilla ocupa del orden de cientos de MB), lo que sugiere un consumo de memoria muy inferior al de un modelo de lenguaje, pero no se han publicado cifras oficiales de VRAM.
- Opciones de despliegue: no se documentan opciones de servidores de inferencia (vLLM, llama.cpp, Ollama, TGI, etc.), que ademas no aplican a este tipo de artefacto. El consumo esperado es cargar `policy.pt` y `stats.json` en un entorno Python con PyTorch.
- Latencia y throughput: no disponibles.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch; la propia model card indica que deben cargarse unicamente en un entorno de confianza.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints de la misma tarea con datos numericos comparables ni especificaciones de modelos alternativos. Como referencia cualitativa, el esquema IDQL se situa en la familia de metodos de aprendizaje por imitacion con actor generativo (frente a variantes como DDPG+BC, usada en los nombres de los artefactos de W&B de origen), pero no se ofrecen cifras para establecer una comparacion objetiva.

## Limitaciones y advertencias

- Dominio muy restringido: el agente esta entrenado para la tarea `sim-square-narrow` en simulacion; no hay evidencia de que funcione en otro entorno, otra tarea o un robot fisico.
- Sin datos de rendimiento publicados: no se puede afirmar que la politica resuelva la tarea con una tasa de exito determinada.
- Dependencia de los normalizadores: `stats.json` es obligatorio para preprocesar observaciones; usar el checkpoint sin el fichero correspondiente produce resultados invalidos.
- Riesgo de sobreajuste a la distribucion de datos: al entrenar con teleoperacion, rollouts de la politica base y DAgger especificos de esta campana, el comportamiento fuera de esa distribucion no esta caracterizado.
- Riesgo de seguridad al cargar pesos: los `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario; cargarlos solo en entornos de confianza.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia ni soporte por parte del autor.
- Trazabilidad parcial: la model card no documenta hiperparametros, arquitectura interna ni composicion exacta de los datos, lo que limita la reproducibilidad mas alla de la igualdad byte a byte de los pesos.
- Idiomas, sesgos y alucinacion: no aplica, al no ser un modelo de lenguaje; no obstante, cualquier comportamiento sesgado heredado de los datos de demostracion no esta analizado en la informacion disponible.
- Cero adopcion externa observable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-baseline-straddled-auto-success-idql
- Plataforma Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de politica base: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Dataset de DAgger: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Conjunto de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
