# mulligan/sim-square-broad-r02-auto-iql-n32-idql

## Resumen

sim-square-broad-r02-auto-iql-n32-idql es un agente de control para robotica basado en IDQL (Implicit Q-Learning con actor de difusion), desarrollado por el equipo de Mulligan dentro de su campana de evaluacion comparativa de algoritmos de aprendizaje por refuerzo offline. No es un modelo de lenguaje: se trata de una politica de control de espacio de acciones continuo, entrenada para resolver la tarea simulada sim-square-broad (manipulacion de una pieza cuadrada en un entorno simulado). El repositorio contiene cinco checkpoints, uno por semilla, cada uno con el fichero `policy.pt` (actor de difusion mas critico IQL escalar) y `stats.json` con los normalizadores de observaciones.

La relevancia del artefacto es metodologica: forma parte de la ronda R2 de la campana `sq_d1_r2_auto_iql_n32` y se enmarca en un bucle auto-mejorable en el que las politicas entrenadas generan nuevos rollouts que se anaden al conjunto de datos de la siguiente ronda. El modelo se ha entrenado hasta el paso 250001 en las cinco semillas y se ha evaluado sobre una rejilla de estados iniciales reservada, con tasas de exito agregadas en torno al 57,6 % (86.365 exitos sobre 150.000 rollouts).

El repositorio ocupa 1,4 GB, lo que sitúa cada checkpoint en aproximadamente 280 MB por semilla, un orden de magnitud propio de redes pequenas basadas en estados (sin codificador visual) y perfectamente asumible en hardware de consumo. La licencia es Apache 2.0 y los ficheros son copias byte a byte de los artefactos de Weights & Biases, verificadas por MD5 y con SHA-256 registrado en `release.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion (diffusion policy) con critico IQL escalar; entrada basada en estados (state-based), sin vision |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el agente consume observaciones de estado de la tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; politica de control robotico, no modelo linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`.pt`); el actor y el critico se empaquetan en `policy.pt` junto a `stats.json` con los normalizadores |
| Tarea | sim-square-broad |
| Ronda del modelo | R2 |
| Brazo / celda de campana | auto-iql-n32 / `sq_d1_r2_auto_iql_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB (~280 MB por semilla, estimacion a partir del tamano total) |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La politica combina dos componentes propios de IDQL. Por un lado, un critico Q escalar entrenado con IQL (Implicit Q-Learning), que evita consultar acciones fuera de la distribucion del dataset mediante regresion de expectiles y aprendizaje de la funcion de valor sin desplegar una politica separada durante el entrenamiento del critico. Por otro, un actor de difusion que genera acciones muestreando un proceso de denoising, y que se entrena mediante clonacion de comportamiento ponderada por el valor estimado. La entrada es el estado de la tarea (state-based), no imagenes, lo que explica el reducido tamano del checkpoint frente a politicas con codificador visual. El nombre del run de W&B asociado (`iql_ddpg_bc_idql_square_d1`) es coherente con esta combinacion de IQL, clonacion de comportamiento y actor IDQL.

El entrenamiento se inscribe en un bucle iterativo de tipo auto-mejorable o DAgger con minado de datos. El conjunto de entrenamiento declarado incluye un dataset de teleoperacion base (`sim-square-broad-c00-teleop-baseline`) y dos rondas de rollouts generados por la propia politica auto-IQL (`...-c01-auto-iql-n32-policy-rollouts` y `...-c02-auto-iql-n32-policy-rollouts`), de modo que el modelo de la ronda R2 aprende sobre datos que incluyen las consecuencias de politicas anteriores. No se documentan en la informacion disponible el numero de tokens, el volumen de transiciones ni la composicion exacta de los datasets, ni tampoco si hubo etapas de RLHF o DPO (categorias que, por otra parte, no aplican a este tipo de modelo). Los cinco checkpoints se entrenaron con los commits de codigo `17359115b544` (semillas 1, 2 y 3), `7eeb0185e5f5` (semilla 4) y `399b299a75f6` (semilla 5).

## Capacidades

- Generacion de acciones continuas para la tarea simulada sim-square-broad, a partir de observaciones de estado.
- Politica estocastica: el actor de difusion permite muestrear acciones diversas, no solo una accion determinista.
- Estimacion de valor: el critico IQL escalar permite puntuar estados y acciones dentro del mismo checkpoint.
- Normalizacion de observaciones incluida en `stats.json`, lo que facilita reproducir el preprocesado del entrenamiento.
- Multiples semillas en un mismo repositorio (1 a 5), lo que habilita analisis de varianza entre semillas.
- Generacion de rollouts para minado de datos: los datasets c01 y c02 se construyeron con politicas auto-IQL de este mismo linaje, y el modelo esta referenciado por los metadatos de `...-c03-auto-iql-n32-policy-rollouts`.
- Capacidades no soportadas: no hay soporte de tool calling ni de function calling, no hay razonamiento multi-paso en lenguaje, no hay capacidades multilingues, no hay modo thinking, ni vision, ni audio.

## Casos de uso

- Evaluacion comparativa de algoritmos de RL offline: el checkpoint sirve como referencia reproducible de IDQL en la tarea sim-square-broad, con cinco semillas y paso de entrenamiento fijo, para comparar contra otras armas de la misma campana.
- Generacion de datos de entrenamiento por round: desplegar la politica para producir nuevos rollouts que alimenten la ronda siguiente, tal como se hizo entre c01, c02 y c03.
- Analisis de varianza entre semillas: las diferencias observadas en la evaluacion (del 55,57 % al 62,59 % de exito) permiten estudiar la sensibilidad del algoritmo a la inicializacion.
- Destilacion o inicializacion de politicas mas ligeras: al ser un modelo state-based pequeno, resulta adecuado como profesor para destilar una politica de inferencia mas rapida.
- Investigacion sobre clonacion de comportamiento ponderada por valor: la pareja actor de difusion mas critico IQL permite aislar el efecto del peso por valor en el rendimiento final.
- Pruebas de robustez frente a estados iniciales: la evaluacion sobre rejilla reservada de estados iniciales admite reutilizar el checkpoint para medir generalizacion en condiciones iniciales no vistas.
- Integracion en entornos de simulacion para benchmarking interno: al cargarse como checkpoint de PyTorch, se puede insertar en un bucle de evaluacion automatizado sin dependencias de servicio de inferencia.

## Benchmarks y rendimiento

La model card publica una evaluacion sobre una rejilla reservada de estados iniciales, con 32 estados iniciales por semilla y 30.000 rollouts por semilla. Se reproduce tal cual:

| Semilla | N (estados iniciales) | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 30000 | 16735 | 55,78 % |
| seed-2 | 32 | 30000 | 16670 | 55,57 % |
| seed-3 | 32 | 30000 | 16813 | 56,04 % |
| seed-4 | 32 | 30000 | 18778 | 62,59 % |
| seed-5 | 32 | 30000 | 17369 | 57,90 % |
| Agregado | 160 | 150000 | 86365 | 57,58 % |

No se han publicado resultados de otros benchmarks publicos (tipo MMLU, HumanEval o GSM8K) en la informacion disponible; esas metricas no aplican a un modelo de control robotico. Tampoco se proporcionan resultados de las otras rondas o brazos de la campana, por lo que no es posible establecer una comparacion numerica dentro de la propia campana con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, el repositorio completo de 1,4 GB contiene cinco copias, lo que sugiere aproximadamente 280 MB por semilla entre pesos y normalizadores; una politica state-based de ese tamano es holgadamente ejecutable en GPU de consumo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el perfil del modelo (state-based, sin vision, sin modelo de lenguaje), no requiere aceleradores de gama alta tipo A100 o H100, si bien el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: muy probable en cualquier GPU reciente con unos pocos GB de VRAM, e incluso viable en CPU para evaluacion a baja frecuencia de control. Es una inferencia a partir del tamano del repositorio, no un dato declarado por el autor.
- Opciones de despliegue: carga directa del checkpoint PyTorch (`policy.pt`) junto con `stats.json`. No aplican servidores de inferencia de LLM como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Latencia y throughput estimados: no disponibles. El coste por accion depende del numero de pasos de denoising del actor de difusion, parametro que no se documenta en la informacion disponible.
- Advertencia de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en un entorno de confianza.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye parametros ni resultados de modelos alternativos comparables. El unico contexto de comparacion posible es la propia campana de Mulligan (rondas R0 a R3 y brazos alternativos como `auto-iql-success-bc-n32`), pero no se facilitan sus metricas, por lo que no se puede construir una tabla comparativa con datos verificables.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-broad-r02-auto-iql-n32-idql (este modelo) | no disponible | no aplica | 57,58 % de exito agregado en la rejilla de evaluacion | apache-2.0 | HuggingFace, 0 descargas |
| Otros brazos o rondas de la campana Mulligan | no disponible | no aplica | no disponible | no disponible | parcialmente referenciados en metadatos |
| Otras politicas IDQL publicas | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especificidad de tarea: el modelo esta entrenado exclusivamente para sim-square-broad. No es transferible sin reentrenamiento a otras tareas, morfologias de robot o entornos reales.
- Entrada basada en estados: no procesa imagenes ni lenguaje, por lo que no puede utilizarse en configuraciones que requieran percepcion visual directa.
- Rendimiento moderado y variable: la tasa de exito agregada es del 57,58 %, con una horquilla entre semillas del 55,57 % al 62,59 %. Cerca de cuatro de cada diez rollouts no alcanzan el exito en la rejilla evaluada.
- Sin datos de generalizacion fuera de distribucion: la evaluacion se limita a una rejilla reservada de estados iniciales de la propia simulacion; no hay evidencia de comportamiento en el mundo real.
- Sesgos: no se documentan analisis de sesgo. En este dominio, el sesgo relevante seria la cobertura del dataset de teleoperacion base y de los rollouts auto-generados, que puede limitar el comportamiento ante estados poco representados.
- Riesgo de fallo silencioso: al no publicarse metricas de seguridad ni de deteccion de estados anomalos, no se recomienda su uso directo en sistemas fisicos sin capas de supervision externas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y no se ofrece garantia alguna por parte del autor.
- Riesgo de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch; cargarlos en entornos no confiables puede ejecutar codigo arbitrario.
- Trazabilidad parcial: aunque se documentan los artefactos de W&B y los commits de codigo, el codigo de entrenamiento y evaluacion no se incluye en el repositorio, lo que dificulta la reproduccion completa.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado los resultados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-auto-iql-n32-idql
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Rollouts auto-IQL ronda c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Rollouts auto-IQL ronda c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-n32-policy-rollouts
- Rollouts auto-IQL ronda c03 (referencia al modelo en metadatos): https://huggingface.co/datasets/mulligan/sim-square-broad-c03-auto-iql-n32-policy-rollouts
- Dataset de evaluacion r00-r03: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de rollouts con clonacion de comportamiento exitosa: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Vista del dataset anterior: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts/viewer
- Ficha externa del dataset de rollouts: https://claru.ai/datasets/mulligan-sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Referencia sobre el algoritmo IQL: https://www.codesota.com/model/iql
