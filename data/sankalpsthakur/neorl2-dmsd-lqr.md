# sankalpsthakur/neorl2-dmsd-lqr

## Resumen

`neorl2-dmsd-lqr` no es un modelo de lenguaje ni una red neuronal profunda: es un controlador lineal-quadratico (LQR) identificado a partir de datos offline y publicado como un conjunto de 12 numeros (matrices A, B identificadas, ganancia K de 2x4 y feed-forward F de 2x2) que actuan sobre la planta del benchmark NeoRL-2 DMSD (double mass-spring-damper). Lo desarrolla el usuario de Hugging Face `sankalpsthakur` como artefacto reproducible de investigacion en control offline, con licencia Apache-2.0.

El problema que aborda es el benchmark NeoRL-2 de control offline: dado un dataset de transiciones fijo, obtener una politica que maximice la recompensa normalizada en el simulador oficial. Frente a los algoritmos de offline RL publicados (EDAC, MCQ, RAMBO, behaviour cloning), el autor propone identificacion de sistema mas diseno LQR clasico, y declara una puntuacion normalizada de 97.78 frente al mejor publicado de 78.65 (EDAC). El resultado es autoclasificado como "pre-registered, self-evaluated" y no verificado externamente.

La relevancia es metodologica: demuestra que en una tarea lineal y sin ruido la identificacion exacta del sistema mas un controlador LQR con feed-forward de objetivo supera ampliamente a los algoritmos de offline RL, y que el termino de feed-forward es determinante (sin el, la misma planta cae a 76.19). No aporta capacidades de generacion, razonamiento ni procesamiento de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Controlador lineal-quadratico (LQR) con feed-forward de objetivo sobre modelo de sistema identificado; sin red neuronal |
| Parametros totales | 12 numeros (A, B identificadas, K de 2x4, F de 2x2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica; artimética en coma flotante numpy) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | JSON (`protocol/frozen_config.json`, sha256 `c3f031e99dbdfa12...`) junto con codigo Python/numpy |

## Arquitectura y entrenamiento

La "arquitectura" es un controlador en espacio de estados: un modelo lineal discreto identificado (matrices A y B) a partir de las 100.000 transiciones del fichero de entrenamiento oficial y las 20.000 del fichero de validacion (este ultimo usado solo para seleccion de rollouts del modelo). Sobre ese modelo se disena una ganancia LQR K (2x4) con los pesos indicados, mas una matriz de feed-forward F (2x2) que incorpora la referencia de objetivo. El controlador final es un conjunto congelado de 12 numeros que se aplica directamente a la planta.

El "entrenamiento" es en realidad identificacion de sistema por minimos cuadrados sobre los datos offline, sin gradientes, sin GPU y sin RL. El autor documenta un error de validacion a un paso de 1.2e-7, coherente con una planta lineal y sin ruido. La innovacion destacable no es algorítmica sino de metodo y de rigor de protocolo: pre-registro del criterio de evaluacion antes de contactar el simulador, congelacion de la configuracion, registro de hashes y registro de pruebas (`PROVENANCE.md`, `TEST-LOG.md`). No hay RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Control optimo en espacio de estados de un sistema lineal de dos masas con muelle y amortiguador (DMSD).
- Identificacion de sistema lineal a partir de datos offline de transiciones.
- Diseno LQR con seleccion de pesos y feed-forward de referencia.
- Seguimiento de objetivo (target tracking) mediante el termino F.
- Evaluacion reproducible en el simulador oficial NeoRL-2 (modo train).
- Suite de 34 pruebas en numpy y replica del simulador para puntuacion local.
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Investigacion en control offline: sirve como referencia fuerte y barata (CPU, numpy) frente a algoritmos de offline RL en tareas lineales, para calibrar cuanto margen deja la identificacion exacta.
- Validacion de pipelines de evaluacion: el codigo de replica del simulador y el scorer permiten comprobar la correccion de un entorno NeoRL-2 antes de lanzar experimentos costosos.
- Baseline de sistemas lineales en produccion de control: en plantas que se comporten de forma aproximadamente lineal y sin ruido significativo, el flujo identificacion + LQR + feed-forward es directamente desplegable y determinista.
- Docencia de control optimo: el paquete incluye pre-registro, pruebas y resultados, util para ilustrar diseno LQR, feed-forward y evaluacion honesta.
- Auditoria metodologica de benchmarks: el patron de pre-registro y hashes es reutilizable para publicar resultados reproducibles en RL offline.
- Prototipado rapido de controladores sin GPU: al ejecutarse en CPU con numpy, permite iterar en entornos sin acelerador.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados externamente). Tarea: NeoRL-2 DMSD, simulador oficial, modo train, 1000 episodios por conjunto de semillas, semillas 7, 42 y 210. Metrica: puntuacion normalizada.

| Configuracion | Semillas 7 | Semillas 42 | Semillas 210 | Media |
|---|---|---|---|---|
| LQR identificado congelado (principal) | 97.78 | 97.83 | 97.74 | 97.78 |
| LQR con parametros verdaderos (referencia, sin claim) | 97.78 | 97.83 | 97.74 | 97.78 |
| Ablacion sin feed-forward (sin claim) | 76.09 | 76.34 | 76.15 | 76.19 |
| Desplazamiento: masa 30 en vez de 20 (sin claim) | 94.26 | 94.32 | 94.19 | 94.26 |

Comparativa con metodos publicados en la misma tarea (NeoRL-2, tabla 2 del paper):

| Metodo | Puntuacion normalizada |
|---|---|
| neorl2-dmsd-lqr (este artefacto) | 97.78 |
| EDAC | 78.65 |
| MCQ | 77.75 |
| RAMBO | 76.22 |
| Behaviour cloning | 65.09 |
| Politica de datos | 56.64 |

El paper NeoRL-2 considera resuelta una tarea a partir de 95 y afirma que ningun algoritmo supera 95 en ninguna tarea. El autor senala que la tarea es lineal y sin ruido, por lo que el resultado es esperable y debe interpretarse como comparacion de clases de metodo (identificacion + LQR frente a offline RL), no como margen dificil.

## Requisitos de hardware

- VRAM: 0 GB; la inferencia y la puntuacion se ejecutan en CPU con numpy.
- GPU recomendadas: ninguna; el autor indica explicitamente que no se uso GPU.
- GPU de consumo: no aplica.
- Despliegue: Python con numpy y pytest; los kernels de evaluacion oficial se ejecutan como kernels de CPU en Kaggle.
- Latencia y throughput: no disponibles en la informacion proporcionada; el coste dominante es la evaluacion en el simulador (1000 episodios por conjunto de semillas).

## Comparativa con modelos similares

| Criterio | neorl2-dmsd-lqr | EDAC (offline RL) | MCQ (offline RL) | RAMBO (offline RL) |
|---|---|---|---|---|
| Tipo | Identificacion + LQR | Actor-critico con ensemble y regularizacion | Actor-critico con Q-ensemble | Modelo del mundo + actor-critico |
| Parametros | 12 numeros | red neuronal (tamano no disponible) | red neuronal (tamano no disponible) | red neuronal (tamano no disponible) |
| Contexto | no aplica | no aplica | no aplica | no aplica |
| Puntuacion NeoRL-2 DMSD | 97.78 (autoevaluado) | 78.65 | 77.75 | 76.22 |
| Licencia | Apache-2.0 | no disponible | no disponible | no disponible |
| Disponibilidad | Hugging Face + GitHub | publicaciones y repos | publicaciones y repos | publicaciones y repos |
| Requiere GPU | no | si (tipicamente) | si (tipicamente) | si (tipicamente) |

## Limitaciones y advertencias

- Resultado autoevaluado y no verificado por un tercero; no es un ranking oficial.
- Solo valido para tareas lineales y sin ruido; el autor declara explicitamente que no demuestra nada sobre tareas no lineales o con ruido, ni sobre offline RL en general.
- El exito depende del termino de feed-forward: sin el, la puntuacion cae a 76.19, por debajo de EDAC.
- Posible contaminacion de seleccion: la familia de controladores se inspiro en barridos sobre una replica del simulador de evaluacion, y los baselines tambien se ajustaron en el simulador de evaluacion.
- Ambiguedades en la barra de comparacion: el paper cita 78.56 en el texto y 78.65 en la tabla, y no queda claro si uso 100 o 1000 episodios de evaluacion.
- Una sola ejecucion puntuada; no hay timestamp externo del pre-registro.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni capacidades multilingues.
- Sin datos de sesgo, alucinacion o comportamiento fuera de distribucion mas alla del experimento de cambio de masa (94.26).
- Licencia Apache-2.0 para el codigo; el benchmark NeoRL-2 tiene su propia atribucion y condiciones, que deben respetarse.

## Enlaces

- Hugging Face: https://huggingface.co/sankalpsthakur/neorl2-dmsd-lqr
- Repositorio de codigo: https://github.com/sankalpsthakur/neorl2-dmsd-lqr
- Resultados: https://github.com/sankalpsthakur/neorl2-dmsd-lqr/blob/main/RESULTS.md
- Paper NeoRL-2: https://arxiv.org/abs/2503.19267
- Repositorio del benchmark: https://github.com/polixir/NeoRL2
- Dataset: https://huggingface.co/datasets/polixirai/NeoRL2
