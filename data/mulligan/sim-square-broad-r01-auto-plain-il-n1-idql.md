# mulligan/sim-square-broad-r01-auto-plain-il-n1-idql

## Resumen

`mulligan/sim-square-broad-r01-auto-plain-il-n1-idql` es un agente de aprendizaje por refuerzo para robótica, publicado por el proyecto Mulligan. Se trata de un controlador basado en estado (no visual) que implementa IDQL: un actor de difusión acompañado de un crítico IQL escalar. El repositorio contiene cinco checkpoints, uno por semilla (semillas 1 a 5), en formato PyTorch (`.pt`) junto con ficheros de normalización `stats.json`. La tarea objetivo se denomina `sim-square-broad` y el entrenamiento alcanza el paso 250001.

El modelo pertenece a la ronda R1, brazo `auto-plain-il-n1`, dentro de la celda de campaña etiquetada como `iterative-IL comparator`. Su función es servir de comparador reproducible frente a métodos de imitation learning iterativo, y los checkpoints son copias byte a byte de artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`.

Es relevante ahora porque forma parte de una infraestructura de evaluación abierta (Policy Arena) con una parrilla de estados iniciales reservada: cada semilla se evaluó con 30000 rollouts, con entre 14245 y 15392 éxitos según la semilla, lo que sitúa la tasa de éxito media en torno al 49,3 por ciento. La licencia es Apache 2.0 y el repositorio ocupa 1,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente IDQL: actor de difusion (diffusion policy) con critico IQL escalar, condicionado por estado |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta horizonte de decision ni ventana de observacion) |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | no aplicable (modelo de control robotico, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pt` (pickle) + `stats.json` con normalizadores |
| Tarea | sim-square-broad |
| Ronda de modelo | R1 |
| Brazo / celda de campana | auto-plain-il-n1 / iterative-IL comparator |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tipo de entrada | observaciones de estado (state-based) |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es IDQL (Implicit Diffusion Q-Learning): un actor de difusion que modela la distribucion de acciones y un critico IQL escalar que puntua dichas acciones. En esta variante el agente es *state-based*, es decir, la politica consume el estado del entorno en lugar de imagenes, algo coherente con el tamano contenido del repositorio. Los pesos se serializan como pickle de PyTorch, con los normalizadores de observaciones y acciones en `stats.json`.

Los datos de entrenamiento proceden de dos datasets de la organizacion `mulligan`: `sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperacion) y `sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts` (rollouts de una politica compartida de behavior cloning). El modelo referencia y es referenciado por los datasets `sim-square-broad-c02-auto-plain-il-n1-policy-rollouts` y `sim-square-broad-r00-r03-eval`. No se documenta en la informacion disponible el numero de tokens o transiciones, la composicion exacta del dataset, ni si se empleo RLHF o DPO; tampoco se detallan hiperparametros de difusion (numero de pasos de denoising, ruido, schedule). El entrenamiento y la evaluacion se realizaron con el codigo de investigacion de Mulligan en los commits `5878cfaa3a44`, `71bb192943c9`, `a6d9cf270a79`, `334735876f82` y `6f80d0798988` (uno por semilla).

## Capacidades

- Control robotico por estado en simulacion para la tarea `sim-square-broad`.
- Generacion de acciones multimodales mediante actor de difusion, adecuado para tareas con multiples soluciones validas.
- Estimacion de valor de acciones mediante critico IQL escalar, utilizable para filtrar o puntuar rollouts.
- Ejecucion determinista o estocastica segun el muestreo del actor (no se especifica en la model card).
- Recoleccion de rollouts etiquetados que alimentan datasets posteriores de la campana (`c02`).
- Reproducibilidad por semilla: cinco checkpoints independientes entrenados con pasos identicos (250001).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues, de vision ni de audio.

## Casos de uso

- Linea base reproducible en investigacion de imitation learning iterativo: cargar los cinco checkpoints y comparar contra metodos DAgger o de mineria de datos sobre la misma parrilla de estados iniciales.
- Generacion de datos de entrenamiento: ejecutar la politica en el simulador para producir rollouts etiquetados que se incorporan al dataset `sim-square-broad-c02-auto-plain-il-n1-policy-rollouts`.
- Estudio de varianza entre semillas: con cinco semillas y 30000 rollouts por semilla, permite medir la dispersion del exito (47,5 a 51,3 por ciento) y decidir cuantas semillas son necesarias en futuras rondas.
- Evaluacion de criticos y actores en aprendizaje offline-to-online: el critico IQL escalar permite estudiar como se correlaciona el valor estimado con el exito real en la parrilla reservada.
- Validacion de pipelines de control antes de sim-to-real: al ser un agente de estado y tamano reducido, se puede integrar en bucles de simulacion con requisitos de computo bajos.
- Controlador de referencia en pruebas de regresion de infraestructura: sirve para verificar que un runner de evaluacion reproduce exactamente los recuentos de exito publicados.
- Docencia y prototipado: el repositorio de 1,4 GB se descarga y se ejecuta en una estacion de trabajo sin GPU dedicada, lo que facilita experimentos con politicas de difusion.
- Auditoria de trazabilidad: al ser copias byte a byte de artefactos W&B con MD5 y SHA-256, permite reproducir la cadena de procedencia en entornos industriales con requisitos de auditoria.

## Benchmarks y rendimiento

Evaluacion en parrilla reservada de estados iniciales, con 30000 rollouts por semilla (datos de la model card, dataset `sim-square-broad-r00-r03-eval`):

| Semilla | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 30000 | 14623 | 48,74 % |
| seed-2 | 30000 | 14245 | 47,48 % |
| seed-3 | 30000 | 14604 | 48,68 % |
| seed-4 | 30000 | 15109 | 50,36 % |
| seed-5 | 30000 | 15392 | 51,31 % |
| Media (5 semillas) | 150000 | 73973 | 49,32 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, dado que no es un modelo de lenguaje. Tampoco se proporcionan curvas de aprendizaje, comparaciones por paso de entrenamiento ni metricas de exito por tipo de estado inicial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo ocupa 1,4 GB e incluye cinco checkpoints (aproximadamente 280 MB por semilla segun el tamano del repositorio, dato derivado y no confirmado por el autor).
- GPU recomendadas: no especificadas por el autor. Por el tamano de los checkpoints, cualquier GPU con al menos 2 GB de memoria deberia poder alojar la politica; se trata de una estimacion, no de un dato publicado.
- GPU de consumo: previsiblemente cabe en cualquier GPU de consumo (serie RTX 30/40 o inferior) e incluso en CPU, ya que son redes de politica de estado y no modelos de lenguaje de gran tamano.
- Opciones de despliegue: no se documentan. No hay pesos en formato GGUF, safetensors ni ONNX, por lo que no aplican vLLM, llama.cpp, Ollama ni TGI. La carga se realiza con PyTorch y los ficheros `policy.pt` y `stats.json`.
- Latencia y throughput: no disponibles. En politicas de difusion es habitual requerir varios pasos de denoising por accion, pero el numero de pasos no se indica en la model card, por lo que no puede estimarse la latencia.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch; deben cargarse unicamente en un entorno de confianza.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo pertenece a una familia mas amplia (Mulligan) con otros brazos, celdas de campana y rondas, y el dataset de evaluacion referenciado cubre las rondas r00 a r03, pero en la documentacion facilitada no aparecen resultados por modelo para esas rondas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-broad-r01-auto-plain-il-n1-idql | no disponible | no disponible | 49,32 % de exito medio en 150000 rollouts | apache-2.0 | pesos PyTorch, 5 semillas |
| Otros brazos de la campana sim-square-broad (r00-r03) | no disponible | no disponible | no disponible | no disponible | referenciados por el dataset de evaluacion |
| Alternativas externas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasa de exito moderada: la media es del 49,32 por ciento, con un maximo del 51,31 por ciento en la mejor semilla. No es un controlador fiable para operacion autonoma sin supervision.
- Varazon entre semillas: el rango observado es de 47,48 a 51,31 por ciento, lo que indica una dispersion no despreciable y obliga a reportar multiples semillas.
- Sesgo de tarea: entrenado y evaluado exclusivamente en `sim-square-broad`; no hay evidencia de generalizacion a otras tareas, morfologias o entornos reales.
- Dependencia de los normalizadores: `stats.json` es imprescindible para reproducir el comportamiento; su omision o sustitucion invalida los resultados.
- Riesgo de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; no se documentan restricciones adicionales.
- Ausencia de datos clave: no se publican parametros, arquitectura de red detallada, hiperparametros de difusion, latencia ni requisitos de hardware, lo que dificulta reproducir el entrenamiento desde cero.
- Alucinacion: no aplicable en el sentido de los modelos generativos de lenguaje; el riesgo equivalente es la ejecucion de acciones con alta confianza en estados fuera de distribucion.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes, con lo que no existe validacion externa por parte de la comunidad.
- Idiomas y contexto: no aplicable, ya que el modelo no procesa texto ni mantiene contexto conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-auto-plain-il-n1-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts de politica compartida: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts
- Dataset referenciado por metadatos: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-plain-il-n1-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Paper o publicacion tecnica: no disponible en la informacion proporcionada
- Resultados de busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre una persona publica ajena al proyecto), por lo que se descartan como fuentes.
