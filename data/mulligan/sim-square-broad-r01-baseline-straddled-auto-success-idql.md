# mulligan/sim-square-broad-r01-baseline-straddled-auto-success-idql

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo offline para robotica denominado IDQL, acronimo de Implicit Diffusion Q-Learning. Se trata de un actor de difusion entrenado junto con un critico IQL escalar, y esta publicado por el usuario mulligan como parte del proyecto Mulligan, una infraestructura de investigacion y evaluacion de politicas de robotica. No es un modelo de lenguaje: es un checkpoint de politica (policy.pt) que mapea estados a acciones dentro de una tarea de manipulacion simulada llamada sim-square-broad.

El modelo corresponde a la ronda R1 del ciclo de entrenamiento, bajo el brazo "baseline-straddled-auto-success" y la celda de campana sq_d1_r1_baseline_uniform_nocf_straddled_auto_success. Se publican cinco semillas (seed-1 a seed-5), todas ellas en el paso de entrenamiento 250001, lo que permite estudiar la variabilidad entre ejecuciones. El peso del repositorio es de 1,4 GB en total, incluyendo los cinco checkpoints y los ficheros de normalizacion stats.json.

Su relevancia es principalmente de investigacion: sirve como linea base reproducible de un agente IDQL para una tarea concreta, con trazabilidad completa hacia los artefactos de Weights & Biases, los commits de codigo y los datasets de entrenamiento. Los checkpoints son copias byte a byte de los artefactos originales, verificadas mediante MD5 y SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion con critico IQL escalar (IDQL, aprendizaje por refuerzo offline) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de control por estados, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (agente de robotica basado en estados, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) mas stats.json con normalizadores |

Datos adicionales: tamano del repositorio 1,4 GB (cinco semillas); paso de entrenamiento 250001; semillas 1, 2, 3, 4 y 5; tarea sim-square-broad; ronda R1.

## Arquitectura y entrenamiento

La arquitectura combina un actor de difusion (que genera acciones mediante un proceso de difusion) con un critico escalar entrenado con Implicit Q-Learning (IQL). Esta composicion es la que da nombre al metodo IDQL. El agente es "state-based", es decir, opera sobre representaciones de estado en lugar de imagenes, lo que lo diferencia de las politicas de difusion puramente visuales. En el repositorio, cada semilla incluye un unico checkpoint policy.pt y un fichero stats.json con los normalizadores de estado y accion.

En cuanto a los datos, el modelo se entreno a partir de tres conjuntos publicados en la organizacion mulligan: sim-square-broad-c00-teleop-baseline (teleoperacion base), sim-square-broad-c01-baseline-policy-rollouts (rollouts de politica base) y sim-square-broad-c01-dagger-baseline (datos de DAgger). La combinacion de teleoperacion, rollouts y DAgger indica un pipeline de aprendizaje por imitacion iterativo con recogida de datos guiada. No se especifican en la informacion disponible el numero de tokens ni de transiciones, ni la composicion detallada del dataset, ni si se aplicaron etapas de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no aplicables aqui). El entrenamiento se realizo con el codigo de investigacion de Mulligan en los commits indicados (mayoritariamente 604a0622cf7b, con 11dfbbda36b2 y 4dcb7a9e8e7b en algunas semillas).

## Capacidades

- Control de robotica basado en estados: genera acciones a partir de observaciones de estado para la tarea sim-square-broad.
- Aprendizaje por refuerzo offline: entrenado sin interaccion en linea, a partir de datos previamente recogidos.
- Aprendizaje por imitacion con DAgger: los datasets incluyen datos teleoperados, rollouts de politica y agregacion iterativa tipo DAgger.
- Reproducibilidad multi-semilla: se publican cinco semillas independientes para medir varianza.
- Trazabilidad de artefactos: cada checkpoint enlaza con su artefacto de W&B, su run y su commit de codigo.
- Normalizacion incluida: los ficheros stats.json permiten reconstruir la normalizacion de entradas y salidas.
- No dispone de tool calling, function calling, soporte de agentes conversacionales, capacidades multilingues ni modos de razonamiento, por tratarse de una politica de control y no de un modelo generativo de lenguaje.

## Casos de uso

- Linea base reproducible en investigacion de RL offline: el modelo sirve como referencia fija (paso 250001, cinco semillas) contra la que comparar variantes de IDQL, IQL o politicas de difusion en la misma tarea.
- Evaluacion comparativa en Policy Arena: los checkpoints pueden enviarse a la plataforma de evaluacion de Mulligan para obtener metricas de politica en la tarea sim-square-broad.
- Estudio de varianza entre semillas: al incluir cinco semillas del mismo brazo, permite analizar la estabilidad del entrenamiento y la dispersion de resultados.
- Generacion de rollouts para DAgger: el agente puede desplegarse en simulacion para producir trayectorias que alimenten nuevas rondas de agregacion de datos, replicando el rol de las campanas c01.
- Mineria de datos de mejora autoimpulsada: dado que procede de un pipeline de "self-improving" con mineria DAgger, puede emplearse como punto de partida para seleccionar transiciones de alta calidad.
- Integracion en pipelines de formacion en robotica: el checkpoint PyTorch puede cargarse en un bucle de simulacion para experimentar con recogida de datos y ajuste fino de politicas.
- Referencia para replicacion cientifica: la verificacion MD5/SHA-256 y el enlace a commits concretos facilitan reproducir exactamente los resultados publicados.
- Comparacion entre brazos de campana: util para contrastar el brazo baseline-straddled-auto-success frente a otras celdas de la misma campana experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de exito, retorno ni metricas de tarea; unicamente se indica que existe un conjunto de evaluacion asociado (sim-square-broad-r00-r03-eval) que referencia este modelo mediante metadatos. No se inventan numeros.

## Requisitos de hardware

- El repositorio ocupa 1,4 GB e incluye cinco checkpoints (uno por semilla) mas los ficheros de normalizacion, por lo que cada checkpoint individual pesa del orden de cientos de megabytes en disco.
- VRAM estimada para inferencia: no disponible. No se especifica el numero de parametros ni el presupuesto de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma confirmada; por el tamano del repositorio (politica basada en estados, sin vision) es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: carga mediante PyTorch (policy.pt) con los normalizadores stats.json; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de control.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos verificables en la informacion proporcionada. Como metodos relacionados de forma conceptual se pueden citar IQL (Implicit Q-Learning) y las politicas de difusion (diffusion policies) para robotica, pero no se aportan parametros, contexto ni rendimiento de alternativas concretas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-broad-r01-baseline-straddled-auto-success-idql | no disponible | no aplica | no disponible | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser una politica entrenada con datos de teleoperacion y rollouts, heredaria las limitaciones de la distribucion de esos datos, pero no se documentan.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje, aunque una politica de difusion puede generar acciones fuera de distribucion ante estados no vistos.
- Limitacion de alcance: el modelo esta entrenado para una unica tarea (sim-square-broad) y es state-based; no es un modelo de proposito general ni procesa lenguaje, vision ni audio.
- Limitacion de idioma: no aplica, ya que no maneja lenguaje natural.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial y modificacion, sujeto a los terminos de dicha licencia.
- Seguridad de carga: los ficheros .pt son pickles de PyTorch y deben cargarse unicamente en entornos de confianza, tal como advierte la propia model card.
- Trazabilidad obligatoria: los checkpoints son copias byte a byte de artefactos de W&B; cualquier modificacion rompe la verificacion MD5/SHA-256 documentada en release.json.
- Sin datos de rendimiento publicados: no es posible avalar su eficacia en produccion con las cifras disponibles.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), lo que limita la validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-baseline-straddled-auto-success-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset sim-square-broad-c00-teleop-baseline: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset sim-square-broad-c01-baseline-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-baseline-policy-rollouts
- Dataset sim-square-broad-c01-dagger-baseline: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-baseline
- Dataset de evaluacion sim-square-broad-r00-r03-eval: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
