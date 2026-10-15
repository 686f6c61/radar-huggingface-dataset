# Donghyun1228/pi05-libero-main-module-lr-view-medium-v3-e0p9-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de politica robotica publicado por el usuario Donghyun1228 bajo el identificador `pi05-libero-main-module-lr-view-medium-v3-e0p9-1000-20261015`. Se distribuye a traves de la libreria openpi y esta etiquetado como robotica, LIBERO e inverse-dynamics, lo que lo situa en la familia de modelos visión-lenguaje-acción (VLA) orientados a control de manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. El peso del repositorio es de 6,9 GB y la licencia declarada es Apache-2.0.

No es un modelo de proposito general ni un modelo de lenguaje: es un candidato experimental de ajuste fino sobre una politica base, tal y como indica su propia model card ("Main-method module LR candidate"). La informacion disponible describe una configuracion concreta de hiperparametros (vista `view_medium`, multiplicador de vision 3.0, multiplicador de experto 0.9, LLM congelado), un entrenamiento de 1000 actualizaciones con batch 32 y semilla 42, y una evaluacion de cribado de 314/400 aciertos sobre indices oficiales de LIBERO. El autor declara explicitamente que ese cribado se uso para seleccionar hiperparametros y que no constituye una confirmacion independiente.

Su relevancia es acotada y de caracter reproducible: sirve como artefacto de investigacion para comparar configuraciones de ajuste dentro de la suite LIBERO, no como modelo listo para produccion. No tiene descargas ni valoraciones, los idiomas soportados no estan declarados y no se ha publicado una evaluacion completa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) de la familia openpi; modulo de vision en `view_medium` con multiplicador 3.0, experto con multiplicador 0.9 y LLM congelado |
| Parametros totales | no disponible (el autor no declara recuento; el repositorio ocupa 6,9 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el autor no declara idiomas; las tareas LIBERO usan instrucciones en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 6,9 GB en la libreria openpi) |

## Arquitectura y entrenamiento

La model card identifica el artefacto como un "candidato de modulo principal con learning rate" dentro de una politica VLA. Los unicos parametros arquitectonicos explicitados son los multiplicadores de la configuracion `view_medium`: vision 3.0, experto 0.9 y LLM congelado. Congelar el LLM implica que el ajuste se aplica a los modulos de vision y al experto de accion, no al componente linguistico. No se declara el numero de parametros, la dimension de las representaciones, el mecanismo de atencion ni la longitud de contexto.

En cuanto al entrenamiento, el autor indica: datos de contacto denso existentes y pre-adaptacion original, escalado nativo posterior a Adam, 1000 actualizaciones (`raw999`), batch de 32, semilla 42, normalizacion preservada y muneca (wrist) de la fuente original. El hardware citado es "A1000–3" con ocho clientes por GPU y MuJoCo 3.2.3, con flujos aleatorios de politica compartidos e inicializacion en 0. No se especifica el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO; tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. El autor advierte que la busqueda en rejilla finita no demuestra un optimo global.

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de observaciones visuales e instrucciones de tarea, segun el pipeline de robotica declarado.
- Ajuste especializado para las tareas de la suite LIBERO (indices oficiales 0-9), con datos de contacto denso.
- Modelado de dinamica inversa, segun la etiqueta `inverse-dynamics` del repositorio.
- Configuracion con vision reforzada (multiplicador 3.0) y experto a 0.9, orientada a escenas con `view_medium`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible (es una politica de control, no un agente conversacional).
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): vision si, por tratarse de una politica VLA; audio y modo thinking no disponibles.

## Casos de uso

- Evaluacion comparativa de hiperparametros en LIBERO: el checkpoint sirve como punto de referencia reproducible (semilla 42, 1000 actualizaciones, batch 32) frente a otros candidatos de la misma rejilla de busqueda, tal y como sugiere el propio autor al describirlo como cribado.
- Investigacion en manipulacion con contacto denso: al haberse ajustado con datos de contacto denso, es adecuado para estudiar agarres y empujes donde el contacto entre superficies es frecuente y critico.
- Punto de partida para ajustes posteriores (pre-adapt): el autor menciona una pre-adaptacion original, por lo que puede emplearse como inicializacion de nuevos experimentos en lugar de partir de la politica base.
- Modelado de dinamica inversa: permite experimentar con la inferencia de acciones a partir de pares de estados, util para etiquetado automatico de trayectorias en simulacion.
- Validacion en simulacion MuJoCo 3.2.3: el entorno declarado permite reproducir el pipeline completo sin riesgo fisico ni coste de robot real, con indices oficiales 0-9 de LIBERO.
- Analisis del efecto de congelar el LLM: al mantener el componente linguistico congelado y ajustar vision y experto, es un caso de estudio para medir cuanto rendimiento aporta cada modulo.
- Banco de pruebas de normalizacion y escalado: el autor preserva la normalizacion original y aplica escalado nativo posterior a Adam, lo que lo hace util para estudiar el impacto de esas decisiones.
- Despliegue en robot real: posible en principio, pero no esta recomendado ni validado, dado que no se ha publicado evaluacion completa ni prueba en hardware fisico.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Condiciones |
|---|---|---|---|
| LIBERO (indices oficiales 0-9) | Tasa de exito en cribado | 314/400 (78,5 %) | Semilla 7; usado para seleccion de hiperparametros, no como confirmacion independiente |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de evaluaciones completas de LIBERO con semillas multiples. El autor afirma explicitamente que no reclama una evaluacion completa nueva para este candidato y que el cribado de 314/400 no constituye una confirmacion independiente.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como orientacion, el repositorio ocupa 6,9 GB, por lo que los pesos en precision de almacenamiento rondarian esa cifra, con el coste adicional de activaciones y de las imagenes de entrada; esta estimacion no procede de documentacion del autor.
- GPU recomendadas: el autor cita "A1000–3" como hardware de entrenamiento, con ocho clientes por GPU. No se especifica la VRAM por GPU ni la configuracion exacta.
- GPU de consumo: no confirmado. Dado que el modelo base de la familia openpi suele necesitar aceleradores con bastante memoria y que el entrenamiento se hizo sobre A100, no puede afirmarse que quepa en una RTX 4090 sin cuantizacion o sin ajustes.
- Opciones de despliegue: la libreria declarada es openpi, que expone un servidor de politica para inferencia remota. vLLM, llama.cpp, Ollama y TGI no aplican directamente porque no es un modelo de lenguaje autoregresivo de texto.
- Latencia y throughput: no disponibles. No se publican medidas de latencia, frecuencia de control ni acciones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-main-module-lr-view-medium-v3-e0p9-1000 (este) | no disponible | no disponible | 314/400 en cribado LIBERO (semilla 7) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Politicas base de la familia openpi (pi0, pi0.5) | no disponible en la informacion proporcionada | no disponible | no disponible | no confirmado en la informacion disponible | Repositorio openpi del autor original |
| Otros ajustes LIBERO sobre openpi | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria. Las politicas base de openpi se citan unicamente como referencia de familia.

## Limitaciones y advertencias

- Evaluacion incompleta: el unico resultado disponible es un cribado con una sola semilla (semilla 7) sobre 400 episodios, y el propio autor advierte que no es una confirmacion independiente ni una evaluacion completa.
- Seleccion de hiperparametros sobre el mismo conjunto de cribado: existe riesgo de sobreajuste al conjunto usado para elegir la configuracion.
- Busqueda en rejilla finita: el autor senala que no demuestra optimalidad global.
- Entorno simulado unicamente: el entrenamiento y el cribado se hicieron en MuJoCo 3.2.3, sin validacion en robot fisico.
- Dominio muy restringido: las tareas se limitan a los indices oficiales 0-9 de LIBERO, con instrucciones en ingles; no hay evidencia de generalizacion fuera de ese conjunto.
- Idiomas no declarados: no puede asumirse soporte multilingue de las instrucciones.
- Sesgos: no documentados por el autor. No hay analisis de sesgo visual, demografico ni de generalizacion entre objetos o escenas.
- Riesgo de alucinacion: no aplica en el sentido linguistico habitual, pero si existe riesgo de acciones incorrectas o inseguras al ejecutar la politica fuera de su distribucion de entrenamiento.
- Ausencia de traccion: 0 descargas y 0 likes, sin issues ni discusion publica que permitan validacion por terceros.
- Licencia: Apache-2.0 permite uso comercial, pero al tratarse de un checkpoint de investigacion sin evaluacion completa, su uso en produccion con robots reales no esta respaldado por evidencia publicada.
- Fechas de creacion y actualizacion (2026-10-14 y 2026-10-15) posteriores a la fecha habitual de publicacion; conviene verificar la vigencia del artefacto.
- Nomenclatura de hardware ambigua ("A1000–3"), lo que dificulta reproducir exactamente el entorno de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-view-medium-v3-e0p9-1000-20261015
- Model card del autor: incluida en la pagina anterior.
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. Las coincidencias devueltas corresponden a sitios de contenido para adultos sin relacion alguna con el artefacto, por lo que se descartan. No hay papers, repositorios ni demos adicionales disponibles.
