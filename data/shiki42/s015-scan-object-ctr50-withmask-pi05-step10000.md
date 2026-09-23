# Shiki42/s015-scan-object-ctr50-withmask-pi05-step10000

## Resumen

Este repositorio contiene un checkpoint de inferencia del modelo de visión-lenguaje-acción (VLA) PI0.5, entrenado mediante LoRA en JAX para la tarea robótica "scan object" (barrido de objetos) con un brazo robótico de dos efectores. Lo publica el usuario Shiki42 dentro del ecosistema OpenPI de Physical Intelligence y corresponde al paso 10.000 de un total de 30.000 pasos de entrenamiento del experimento E746 (run E746-R001). No se trata de un modelo de lenguaje generalista, sino de una política de control motriz que consume observaciones y emite acciones de robot.

El checkpoint parte del modelo base `XinY0201/openpi-pi05-base-jax` y se ha ajustado con LoRA sobre el conjunto de datos `Shiki42/ctr-scan-object-uniform50-20260917`, compuesto por 50 episodios y 14.163 fotogramas en la variante Uniform50. Incluye la ablación registrada S015 con IdleMask activada, donde la pérdida de acción consume la máscara `observation.arm_active_mask`. El repositorio ocupa 6,3 GB y contiene el árbol de parámetros de OpenPI y los activos de normalización, pero excluye el optimizador y el estado del cargador de entrenamiento.

Su relevancia es doble: por un lado, documenta con trazabilidad exhaustiva (commits, hashes, semillas y manifiestos) un ajuste fino reproducible sobre la familia PI0.5; por otro, la propia model card indica que la evaluación está pendiente y no se reclama ninguna tasa de éxito, lo que lo convierte en un artefacto de investigación más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) PI0.5 basado en flujo (backbone no detallado en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (parametros JAX en el arbol OpenPI) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | Parametros OpenPI en JAX (`params/`) mas activos de normalizacion (`assets/`) |
| Libreria | openpi |
| Tarea (pipeline) | robotics |
| Tamano del repositorio | 6,3 GB |
| Paso del checkpoint | 10.000 de 30.000 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un PI0.5, la variante mejorada de π₀ que Physical Intelligence describe como un VLA basado en flujo y con mejor generalizacion en entornos abiertos. En lugar de generar texto, la política produce ventanas de acciones motrices a partir de observaciones. En este caso concreto se aplica un ajuste fino con LoRA en JAX sobre el modelo base `XinY0201/openpi-pi05-base-jax` (commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`), de modo que solo una parte de los parametros se reentrena y el resto queda congelado.

Los datos de entrenamiento provienen del dataset `Shiki42/ctr-scan-object-uniform50-20260917` (revision `a34f2a32d3738e3607f226a777b41d42d0522908`), con 50 episodios y 14.163 fotogramas en configuracion Uniform50. La semilla es 87431, el tamano de lote es 16 y la acumulacion de gradiente es 1. La innovacion tecnica destacable en este run es la ablacion S015 con IdleMask activada: la perdida de accion consume `observation.arm_active_mask`, mientras que la mascara estandar de relleno temporal se mantiene. La normalizacion usa cuantiles globales de NumPy al 1% y 99% con interpolacion lineal (artefacto con SHA-256 `e08ec02f286016017abf90e5be9f11e7507bd4b93a1b68473ac22dd7c3fb62b8`), y las estadisticas se calculan sobre todos los elementos no rellenados de la ventana de accion con peso unitario. No se menciona RLHF ni DPO, ya que no es un modelo conversacional.

## Capacidades

- Generacion de acciones motrices para un brazo robotico de dos efectores: posiciones articulares de izquierda y derecha mas estados del gripper.
- Ejecucion de la tarea "scan object" (barrido de objetos) sobre la que fue ajustado.
- Condicionamiento por observaciones visuales, al tratarse de un modelo vision-lenguaje-accion.
- Tratamiento de periodos de inactividad del brazo mediante la mascara `observation.arm_active_mask` (IdleMask).
- Integracion en el ecosistema OpenPI y compatibilidad con pesos en formato JAX.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de un VLA de control motriz).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingues: no disponibles; la etiqueta de idioma declarada es unicamente "en".
- Modo de razonamiento explicito (thinking mode), vision general o audio: no disponible.

## Casos de uso

- Investigacion en manipulacion robotica con brazo dual: permite ejecutar y estudiar la tarea de barrido de objetos en un banco de pruebas real o simulado, usando el arbol de parametros y los activos de normalizacion incluidos.
- Reproduccion de ablaciones controladas: al incorporar la ablacion S015 con IdleMask activada, sirve para comparar su efecto frente a variantes sin mascara dentro del mismo protocolo experimental.
- Punto de partida para ajustes finos adicionales: su naturaleza LoRA en JAX y su trazabilidad (commits, semillas, manifiestos) facilitan continuar el entrenamiento o adaptarlo a tareas afines.
- Comparativa de checkpoints intermedios: al existir un checkpoint hermano en el paso 20.000 del mismo experimento, permite estudiar la evolucion del rendimiento entre pasos dentro de un mismo run.
- Estudio de formato de datos roboticos: el dataset asociado usa LeRobot v3.0 a 25 FPS con posiciones articulares y estados de gripper, util para validar canalizaciones de datos en investigacion.
- Evaluacion y depuracion de politicas VLA en laboratorio: dado que la evaluacion esta pendiente, es adecuado para montar protocolos de evaluacion antes de cualquier uso aplicado.
- Analisis de generalizacion de la familia PI0.5: permite medir como se comporta una politica basada en flujo entrenada con solo 50 episodios en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta pendiente y que no se reclama ninguna tasa de exito. Lo unico verificado es que la recarga en proceso nuevo y las comprobaciones de parametros finitos pasaron para los pasos 10k, 20k y 30k.

## Requisitos de hardware

- La model card no especifica requisitos de VRAM ni hardware recomendado.
- El repositorio ocupa 6,3 GB, por lo que los pesos en precision completa requeriran del orden de esa cifra de memoria, mas el espacio para activaciones y buffers de inferencia. Es una estimacion a partir del tamano del repositorio, no un dato oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de los pesos sugiere que podria caber en GPU de gama alta con memoria suficiente, pero no hay dato oficial que lo confirme.
- Opciones de despliegue: el modelo esta pensado para el ecosistema OpenPI (`github.com/Physical-Intelligence/openpi`), con inferencia en JAX. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a una politica de control motriz.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / datos | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shiki42/s015-scan-object-ctr50-withmask-pi05-step10000 (este) | LoRA PI0.5 JAX, tarea scan object | Dataset Uniform50, 50 episodios / 14.163 fotogramas; paso 10.000/30.000 | no disponible | HuggingFace, 0 descargas |
| Shiki42/s015-scan-object-ctr50-withmask-pi05-step20000 | LoRA PI0.5 JAX, mismo experimento | Mismo dataset; paso 20.000/30.000 | no disponible | HuggingFace |
| π₀ (openpi) | VLA basado en flujo | no disponible | no disponible | Repositorio openpi |
| π₀-FAST (openpi) | VLA autorregresivo basado en tokenizador FAST | no disponible | no disponible | Repositorio openpi |
| π₀.₅ (openpi) | VLA basado en flujo, mejor generalizacion en entornos abiertos | no disponible | no disponible | Repositorio openpi |

## Limitaciones y advertencias

- Evaluacion pendiente: la model card no aporta ninguna tasa de exito, por lo que no se puede afirmar que el modelo funcione correctamente en la tarea objetivo.
- Licencia no disponible: la ausencia de licencia explicita impide determinar si se permite el uso comercial; conviene tratar el modelo como no apto para produccion hasta aclararlo.
- Ambito muy estrecho: esta ajustado para una unica tarea ("scan object") sobre un tipo de robot concreto, no es un modelo generalista.
- Dataset reducido: 50 episodios y 14.163 fotogramas, con una sola semilla (87431), lo que limita la robustez estadistica de cualquier conclusion.
- Idioma: la unica lengua declarada es el ingles, aunque en la practica se trata de control motriz y no de generacion de texto.
- Riesgo de alucinacion: en un VLA no aplica en el sentido textual, pero si existe riesgo de generar acciones fisicamente invalidas o inseguras fuera de la distribucion de entrenamiento.
- Ausencia de estado del optimizador y del cargador de datos: el repositorio solo contiene parametros de inferencia, de modo que no permite reanudar el entrenamiento tal cual.
- Comprobaciones limitadas: las verificaciones realizadas cubren la recarga del checkpoint y la finitud de los parametros, no la calidad de las acciones generadas.
- Contexto: no se documenta ninguna longitud de contexto ni ventana de observacion mas alla de la ventana de accion normalizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/s015-scan-object-ctr50-withmask-pi05-step10000
- Checkpoint hermano (paso 20.000): https://huggingface.co/Shiki42/s015-scan-object-ctr50-withmask-pi05-step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-uniform50-20260917
- Dataset relacionado (scan object, left-first): https://claru.ai/datasets/shiki42-ctr-scan-object-left-first-20260916
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Perfil de GitHub del autor: https://github.com/Shiki42/
