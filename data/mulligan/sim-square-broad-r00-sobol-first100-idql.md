# mulligan/sim-square-broad-r00-sobol-first100-idql

## Resumen

Se trata de un agente de control robotico entrenado con el algoritmo IDQL (Implicit Diffusion Q-Learning) para la tarea `sim-square-broad`, una variante amplia del clasico problema de insercion de una pieza cuadrada sobre una clavija en simulacion. El modelo lo publica el usuario `mulligan` como parte del proyecto Mulligan, una infraestructura de evaluacion comparativa de politicas de robotica. No es un modelo de lenguaje: es una politica estado-accion almacenada como checkpoint de PyTorch.

El artefacto contiene cinco semillas independientes (1 a 5), cada una en su propia carpeta, todas entrenadas durante 250.001 pasos sobre el dataset de demostraciones por teleoperacion `sim-square-broad-c00-teleop-sobol-first100`. La variante "sobol-first100" hace referencia a la seleccion de 100 estados iniciales muestreados con una secuencia de Sobol, lo que reparte la cobertura del espacio de estados iniciales de forma mas uniforme que un muestreo aleatorio.

Su relevancia es fundamentalmente de investigacion: sirve como punto de referencia reproducible (cinco semillas, commits de Git registrados, artefactos de Weights & Biases verificados por MD5 y SHA-256) para comparar metodos de aprendizaje por refuerzo offline con politicas de difusion en tareas de manipulacion de precision. El repositorio, de 1,4 GB, esta bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente IDQL: actor de difusion con critico IQL escalar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: la entrada es una observacion de estado de dimension fija, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de PyTorch (`policy.pt`, serializado como pickle) mas normalizadores en `stats.json` |
| Tarea | sim-square-broad |
| Ronda / brazo | R0 / sobol-first100 |
| Celda de campana | `sq_d1_r0_first100_ours_sobol` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250.001 |
| Dataset de entrenamiento | mulligan/sim-square-broad-c00-teleop-sobol-first100 |
| Tamano del repositorio | 1,4 GB (aproximadamente 280 MB por semilla, estimacion a partir del tamano total) |
| Fecha de publicacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

IDQL combina dos componentes: un critico entrenado con Implicit Q-Learning (regresion por expectiles sobre valores Q, sin necesidad de consultar acciones fuera del dataset) y un actor generativo de tipo difusion. El actor aprende una distribucion sobre acciones condicionada al estado y se entrena con clonacion de comportamiento reponderada, dando mas peso a las acciones del dataset cuyo valor estimado por el critico es mayor. En inferencia, el actor genera varias acciones candidatas mediante el proceso de denoising y se selecciona la de mayor valor Q segun el critico. La model card no especifica el numero de pasos de difusion, el numero de candidatos muestreados, el tamano de las redes ni el horizonte de prediccion de acciones.

Los datos de entrenamiento proceden del dataset `sim-square-broad-c00-teleop-sobol-first100`, compuesto por demostraciones de teleoperacion con una seleccion de 100 estados iniciales basada en secuencias de Sobol. Los nombres de los artefactos de Weights & Biases (`square-d1-dagger-mining-01a`, `iql_ddpg_bc_idql_...`) sugieren un pipeline de entrenamiento iterativo con minado de datos tipo DAgger, aunque la model card no describe ese procedimiento ni el volumen total de transiciones. Los cinco checkpoints son copias byte a byte de los artefactos de W&B, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`. Se entrenaron y evaluaron con el codigo de investigacion de Mulligan en los commits `56db5a8b9fca`, `30eb2d49c9c0`, `42cda0628b1c` (semillas 3 y 4) y `f5052536d556`.

## Capacidades

- Politica de control estado-accion para la tarea de insercion de pieza cuadrada (`Square`) en simulacion.
- Modelado generativo de la distribucion de acciones mediante un actor de difusion, con seleccion de la accion final guiada por el critico IQL.
- Cobertura amplia de estados iniciales (`broad`), al haber sido entrenado con una seleccion Sobol de 100 configuraciones iniciales.
- Cinco semillas independientes que permiten estimar la varianza del metodo de entrenamiento.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible (no aplica).
- Capacidades multilingues: no disponible (no aplica).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada. El modelo es "state-based", por lo que la entrada es un vector de estado, no imagenes.

## Casos de uso

- Referencia comparativa en investigacion de RL offline: usar los cinco checkpoints como linea base frente a otros metodos (IQL puro, Diffusion-QL, QSM) sobre la misma tarea y el mismo dataset, aprovechando que hay cinco semillas para reportar media y desviacion tipica.
- Estudio de reproducibilidad: verificar que la carga de `policy.pt` con `stats.json` reproduce las trayectorias de evaluacion registradas en los commits de Git indicados, dentro de un entorno controlado.
- Analisis de robustez ante variacion del estado inicial: evaluar la politica en configuraciones iniciales fuera de la seleccion Sobol para medir cuanto degrada el rendimiento fuera de la distribucion de entrenamiento.
- Punto de partida para aprendizaje por refuerzo offline a partir de datos propios: reentrenar el critico y el actor con un dataset de teleoperacion equivalente en otro banco de trabajo simulado, manteniendo la misma receta IDQL.
- Inicializacion para ajuste fino con DAgger en simulacion: usar la politica como punto de partida de un bucle de recogida de datos con un experto, dado el indicio de que el pipeline original ya uso minado de datos.
- Docencia y divulgacion: ejemplo autocontenido de agente IDQL con artefactos verificables, util para explicar la diferencia entre critico por regresion de expectiles y actor generativo.
- Deteccion de modos de fallo en insercion de precision: inspeccionar los casos en que el critico asigna valores altos a acciones que fallan, para caracterizar errores de estimacion de valor en tareas de contacto.
- Generacion de datos de evaluacion: desplegar la politica en el simulador para producir trayectorias que alimenten el dataset de evaluacion `sim-square-broad-r00-r03-eval`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, retornos medios ni comparaciones numericas. El dataset `sim-square-broad-r00-r03-eval` referencia estos checkpoints en sus metadatos, pero no se proporcionan las metricas asociadas. No se debe inferir ningun nivel de rendimiento a partir del numero de paso de entrenamiento ni del tamano del repositorio.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita. Al ser un modelo basado en estado, sin vision ni lenguaje, la huella de memoria es muy reducida; se estima por debajo de 1 GB, pero es una estimacion no confirmada.
- GPU recomendadas: no requiere aceleradores de gama alta para inferencia. Almacenamiento del repositorio completo: 1,4 GB.
- Viabilidad en GPU de consumo: previsiblemente si, en cualquier GPU consumer con unos pocos GB de VRAM; tambien cabe esperar ejecucion en CPU, dado el caracter estado-accion del modelo.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje. La carga se realiza con PyTorch (`torch.load`) y la integracion con el simulador depende del codigo de investigacion de Mulligan, no publicado en esta ficha.
- Latencia y throughput: no disponibles. El coste por paso de decision depende del numero de pasos de difusion y del numero de candidatos evaluados por el critico, parametros que la model card no especifica. El entrenamiento se realizo en GPU, pero no se indica el modelo.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de este checkpoint ni de sus alternativas en la informacion proporcionada, por lo que la comparacion numerica es "no disponible". A continuacion se compara unicamente el enfoque metodologico.

| Metodo | Tipo de actor | Tipo de critico | Licencia del checkpoint | Disponibilidad |
|---|---|---|---|---|
| IDQL (este modelo) | Difusion | IQL escalar por expectiles | Apache 2.0 | 5 semillas publicadas, sin benchmarks |
| IQL | Determinista (AWR) | IQL escalar por expectiles | no disponible en esta ficha | no disponible |
| Diffusion-QL | Difusion | Q-learning con condicionamiento por valor | no disponible en esta ficha | no disponible |
| Diffusion Policy (clonacion de comportamiento) | Difusion | Ninguno | no disponible en esta ficha | no disponible |

La diferencia clave frente a la clonacion de comportamiento pura es que IDQL incorpora informacion de valor a traves del critico, y frente a IQL clasico, que sustituye la politica unimodal por una distribucion generativa capaz de representar comportamientos multimodales.

## Limitaciones y advertencias

- Dominio muy restringido: la politica esta especializada en una unica tarea de simulacion (`sim-square-broad`). No es directamente transferible a un robot real ni a otra tarea sin reentrenamiento.
- Carga insegura: los archivos `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse. La propia model card advierte de cargarlos unicamente en entornos de confianza.
- Sin validacion externa: cero descargas y cero likes, sin resultados de benchmarks publicados en la informacion disponible.
- Varianza entre semillas desconocida: se publican cinco semillas, pero no se aportan metricas que permitan cuantificar su dispersion. Cualquier uso debe evaluar las cinco por separado.
- Sesgo de datos: el entrenamiento se apoya en demostraciones de teleoperacion con una seleccion concreta de estados iniciales (Sobol, primeros 100). El rendimiento fuera de esa distribucion no esta caracterizado.
- Trazabilidad parcial del pipeline: los nombres de los artefactos apuntan a un proceso de minado tipo DAgger, pero la model card no documenta el procedimiento completo ni el volumen de datos resultante.
- Sin capacidades multimodales: no procesa lenguaje, imagen ni audio; la entrada es un vector de estado.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la utilidad comercial real depende de resolver la transferencia al mundo real, no cubierta por este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r00-sobol-first100-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol-first100
- Dataset de evaluacion que referencia estos checkpoints: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Referencia metodologica de IDQL (articulo "IDQL: Implicit Q-Learning as an Actor-Critic Method with Diffusion Policies"): no enlazada en la model card
