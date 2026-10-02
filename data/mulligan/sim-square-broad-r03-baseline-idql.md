# mulligan/sim-square-broad-r03-baseline-idql

## Resumen

`mulligan/sim-square-broad-r03-baseline-idql` es un agente de control para robotica en simulacion, desarrollado por el proyecto Mulligan y publicado bajo licencia MIT. No es un modelo de lenguaje: implementa el algoritmo IDQL (actor de difusion mas critico IQL escalar) y consume vectores de estado para producir acciones continuas en la tarea `sim-square-broad`. El repositorio contiene cinco politicas independientes (semillas 1 a 5), cada una con su checkpoint `policy.pt` y su fichero `stats.json` de normalizacion, ademas de los ficheros `release.json` con hashes SHA-256 de procedencia.

El modelo pertenece a la campana `sim-square-broad` en su ronda R3, brazo `baseline`, celda `sq_d1_r3_baseline_uniform_nocf_human_only`, y se entreno hasta el paso 250001. Los datos de entrenamiento combinan teleoperacion humana, rollouts de la propia politica y tres rondas de DAgger (c01, c02 y c03), lo que lo convierte en una referencia util para estudiar como escala el rendimiento al anadir datos de correccion en un pipeline offline/offline-online.

Su relevancia actual es metodologica: Mulligan publica campanas completas (datasets, checkpoints por semilla, configuraciones de ejecucion y evaluaciones) pensadas para comparar algoritmos y estrategias de recogida de datos de forma reproducible. La evaluacion publicada sobre una rejilla de estados iniciales reservada da una tasa de exito media del 78,46 % en 150.000 rollouts, con una dispersion apreciable entre semillas (del 72,19 % al 82,96 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion (politica generativa por difusion) con critico IQL escalar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un vector de estado por paso) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (agente de control; sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (pickle de PyTorch) + `stats.json` con normalizadores |
| Tarea | sim-square-broad |
| Ronda del modelo | R3 |
| Brazo | baseline |
| Celda de campana | `sq_d1_r3_baseline_uniform_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Pipeline en HuggingFace | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa IDQL (Implicit Diffusion Q-Learning), un esquema actor-critico en el que el actor es una politica de difusion que modela la distribucion de acciones y el critico es un critico IQL escalar entrenado por regresion de expectiles. Este diseno permite representar distribuciones de accion multimodales sin consultar acciones fuera de distribucion, un problema habitual en aprendizaje por refuerzo offline. La model card no documenta el numero de parametros, las dimensiones de observacion y accion, el numero de pasos de difusion ni la arquitectura interna de las redes, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizo hasta el paso 250001 sobre siete conjuntos de datos: `sim-square-broad-c00-teleop-baseline` (teleoperacion humana), rollouts de la politica baseline y conjuntos DAgger correspondientes a las rondas c01, c02 y c03. Esto configura un ciclo iterativo de recogida de datos con correcciones humanas sobre los fallos de la politica. No se menciona uso de RLHF ni de DPO, ni el numero de transiciones totales empleadas. La semantica exacta de la celda de campana `sq_d1_r3_baseline_uniform_nocf_human_only` no esta documentada en la model card, aunque el nombre sugiere muestreo uniforme de estados, ausencia de contrafactuales y uso exclusivo de datos humanos en la fase inicial.

## Capacidades

- Generacion de acciones de control continuo a partir de observaciones de estado, sin producir texto en ningun caso.
- Resolucion de la tarea de manipulacion simulada `sim-square-broad` con tasas de exito entre el 72,19 % y el 82,96 % segun la semilla.
- Modelado multimodal de la distribucion de acciones gracias al actor de difusion, lo que permite representar varios modos validos de actuacion ante un mismo estado.
- Aprendizaje offline puro a partir de conjuntos de datos previamente recogidos, sin necesidad de interaccion con el entorno durante el entrenamiento.
- Integracion en bucles de DAgger: la politica puede generar rollouts que despues se corrigen y se reincorporan al entrenamiento.
- Reproducibilidad por semilla: se publican cinco politicas independientes con sus configuraciones de ejecucion asociadas.
- Soporte de tool calling: no aplica. Soporte de agentes multi-paso en el sentido de los LLM: no aplica.
- Capacidades multilingues: no aplica. Capacidades de vision o audio: no disponibles (el modelo es state-based, no se documenta entrada visual).

## Casos de uso

- Linea base de referencia en investigacion de aprendizaje por refuerzo offline: sirve como punto de comparacion frente a otros algoritmos evaluados sobre la misma tarea `sim-square-broad`, ya que la evaluacion se realiza sobre una rejilla fija de estados iniciales reservados.
- Estudio del efecto de los datos de correccion: al haberse entrenado con teleoperacion, rollouts propios y tres rondas de DAgger, permite analizar cuanto aporta cada ronda de datos etiquetados al rendimiento final.
- Generacion de rollouts para aumentar datos: la politica puede desplegarse en el simulador para producir trayectorias que despues se etiquetan o filtran y se reinyectan en el siguiente ciclo de entrenamiento.
- Comparacion de estrategias de recogida de datos: la publicacion conjunta de los datasets c00 a c03 junto con los checkpoints permite reproducir experimentos de ablacion sobre el origen de los datos.
- Inicializacion para ajuste fino en simulacion: el checkpoint puede servir como punto de partida para entrenar variantes de la tarea o cambios de distribucion de estados iniciales sin partir de cero.
- Evaluacion estandarizada en plataformas de comparacion: el modelo esta integrado en el ecosistema de Policy Arena, lo que facilita someterlo a evaluaciones homogeneas frente a otros agentes.
- Reproduccion de resultados: los ficheros `release.json` con hashes SHA-256 y las configuraciones de ejecucion del repositorio de codigo permiten reentrenar cada checkpoint y verificar la procedencia de los ficheros.
- Analisis de robustez entre semillas: disponer de cinco politicas entrenadas con los mismos datos pero distinta semilla permite medir la varianza del algoritmo, que en este caso alcanza 10,77 puntos porcentuales entre la mejor y la peor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ya que no se trata de un modelo de lenguaje. La unica metrica publicada es la tasa de exito en la tarea `sim-square-broad`, medida sobre una rejilla de estados iniciales reservada y 30.000 rollouts por semilla.

| Semilla | Exitos / rollouts | Tasa de exito |
|---|---|---|
| seed-1 | 24887 / 30000 | 82,96 % |
| seed-2 | 24082 / 30000 | 80,27 % |
| seed-3 | 23481 / 30000 | 78,27 % |
| seed-4 | 21658 / 30000 | 72,19 % |
| seed-5 | 23580 / 30000 | 78,60 % |
| Media (5 semillas) | 117688 / 150000 | 78,46 % |

Los resultados proceden del conjunto de evaluacion `mulligan/sim-square-broad-r00-r03-eval`, con una carpeta de evaluacion por semilla (columna `N` = 1). No se publican comparaciones numericas frente a otros algoritmos en la misma tabla, ni intervalos de confianza.

## Requisitos de hardware

- No se publican cifras de VRAM, GPU recomendadas ni latencias en la model card.
- El repositorio completo ocupa 1,4 GB para cinco semillas, aproximadamente 280 MB por semilla incluyendo `policy.pt` y `stats.json`. A partir de ese tamano es razonable esperar que una sola politica se ejecute en CPU o en cualquier GPU de consumo, pero el autor no confirma requisitos minimos.
- El actor de difusion requiere varios pasos de denoising por accion, por lo que la latencia de inferencia sera superior a la de una politica determinista tipo MLP del mismo tamano. El numero de pasos no esta documentado.
- Opciones de despliegue: no aplica el ecosistema de servidores de LLM (vLLM, TGI, llama.cpp, Ollama). El checkpoint se carga con PyTorch; no se documenta exportacion a ONNX, TorchScript ni otros formatos.
- Advertencia de carga: los ficheros `.pt` son pickles de PyTorch y la propia model card indica cargarlos unicamente en un entorno de confianza.
- Throughput y latencia estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Algoritmo | Ronda | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mulligan/sim-square-broad-r03-baseline-idql` | sim-square-broad | IDQL (actor de difusion + critico IQL) | R3 | teleop-baseline, rollouts baseline c01-c03, DAgger baseline c01-c03 | MIT | Publico en HuggingFace, 5 semillas |
| `mulligan/sim-square-broad-r01-mulligan-idql` | sim-square-broad | IDQL (actor de difusion + critico IQL) | R1 | teleop-sobol, rollouts sobol, DAgger mulligan | MIT | Publico en HuggingFace |
| Otros brazos de la campana R3 | sim-square-broad | no disponible | R3 | no disponible | no disponible | No localizados en la busqueda |

La comparacion principal disponible es dentro de la propia familia Mulligan. La diferencia documentada entre la variante R1 y la R3 baseline esta en el regimen de recogida de datos: la R1 emplea teleoperacion con muestreo Sobol y DAgger etiquetado por el brazo `mulligan`, mientras que la R3 baseline se apoya en teleoperacion baseline, muestreo uniforme y DAgger baseline. No se han localizado en la busqueda web otros modelos publicos comparables para la tarea `sim-square-broad` fuera de la organizacion `mulligan`.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera ni comprende texto, y no dispone de tool calling, function calling, agentes conversacionales ni capacidades multilingues.
- Es un modelo basado en estado. No acepta imagenes ni senales de audio, por lo que no puede emplearse en configuraciones que solo dispongan de camaras sin una estimacion de estado previa.
- Tarea restringida a simulacion. No se documenta ningun resultado de transferencia a un robot real ni el gap sim-to-real asociado.
- Riesgo de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch que pueden ejecutar codigo arbitrario al deserializarse. Cargar solo en entornos de confianza y preferiblemente con `weights_only=True` si el formato lo permite.
- Varianza elevada entre semillas: la tasa de exito varia entre el 72,19 % y el 82,96 % sobre datos y receta identicos. Cualquier resultado de un unico checkpoint debe acompanarse de la semilla empleada y no debe extrapolarse.
- La evaluacion se realiza sobre una rejilla de estados iniciales reservada pero perteneciente a la misma distribucion de la tarea, con una unica carpeta de evaluacion por semilla. No se publican intervalos de confianza ni evaluaciones fuera de distribucion.
- No se documentan la arquitectura de red, el numero de parametros, el numero de pasos de difusion ni el numero total de transiciones de entrenamiento, lo que limita la reproducibilidad fuera de las recetas del repositorio de codigo de Mulligan.
- Alucinacion: no aplica en el sentido de generacion de texto. El riesgo equivalente es la produccion de acciones incorrectas o inseguras en estados no cubiertos por los datos de entrenamiento.
- Sesgos: no se documentan analisis de sesgo. Los datos provienen de teleoperacion humana y de rollouts de la propia politica, por lo que heredan las limitaciones de cobertura de esas demostraciones.
- La licencia MIT cubre los pesos del modelo, pero no implica necesariamente los mismos terminos para los siete conjuntos de datos de entrenamiento enlazados.
- Estado de adopcion nulo: 0 descargas y 0 likes, sin replicaciones independientes conocidas ni validacion por parte de terceros.
- Documentacion unicamente en ingles, sin traduccion al castellano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r03-baseline-idql
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Conjunto de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Datos de teleoperacion baseline: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Rollouts de la politica baseline (c01): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-baseline-policy-rollouts
- DAgger baseline (c01): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-baseline
- Rollouts de la politica baseline (c02): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-baseline-policy-rollouts
- DAgger baseline (c02): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-baseline
- Rollouts de la politica baseline (c03): https://huggingface.co/datasets/mulligan/sim-square-broad-c03-baseline-policy-rollouts
- DAgger baseline (c03): https://huggingface.co/datasets/mulligan/sim-square-broad-c03-dagger-baseline
- Modelo relacionado de la misma campana (ronda R1, brazo mulligan): https://huggingface.co/mulligan/sim-square-broad-r01-mulligan-idql
- Explorador de conjuntos de datos de la campana sim-square-broad: https://huggingface.co/datasets?other=sim-square-broad
- Configuraciones de ejecucion y recetas de reentrenamiento: alojadas en el repositorio de codigo de Mulligan; la model card no proporciona la URL directa
- Referencia del algoritmo IDQL: Hansen-Estruch et al., "IDQL: Implicit Q-Learning as an Actor-Critic Method with Diffusion Policies" (2023), https://arxiv.org/abs/2303.05098 (referencia externa, no enlazada desde la model card)
