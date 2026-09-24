# sashank160105/sf-doom_health_gathering_supreme

## Resumen

`sf-doom_health_gathering_supreme` es un agente de aprendizaje por refuerzo publicado en HuggingFace por el usuario sashank160105. Se trata de una politica entrenada con APPO (Asynchronous Proximal Policy Optimization) mediante el framework Sample Factory para resolver el escenario `doom_health_gathering_supreme` del entorno ViZDoom. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones visuales del juego a acciones discretas.

El modelo se enmarca en la categoria de artefactos de investigacion en RL, pensados para reproducir experimentos, servir de referencia (baseline) y comparar variantes de algoritmos o hiperparametros sobre un mismo entorno. Su relevancia es limitada y acotada al ambito academico: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card es un README generado automaticamente por Sample Factory con informacion minima.

La model card no detalla arquitectura de red, numero de parametros, presupuesto de entrenamiento ni composicion del dataset de interacciones. El unico resultado declarado es una recompensa media de 12,50 +/- 1,20 en el escenario `doom_health_gathering_supreme`, marcada como no verificada. La licencia no se especifica, lo que condiciona cualquier uso mas alla de la experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de aprendizaje por refuerzo entrenado con APPO (Asynchronous PPO) sobre el framework Sample Factory |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es la observacion del entorno ViZDoom por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el agente no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio figura con un tamano de 0,0 GB y la model card no especifica el formato) |
| Framework / libreria | sample-factory |
| Tarea declarada (pipeline) | reinforcement-learning |
| Entorno | ViZDoom, escenario `doom_health_gathering_supreme` |
| Autor | sashank160105 |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion tecnica aportada por el autor es que se trata de un agente APPO entrenado con Sample Factory. APPO es la implementacion asincrona de PPO que caracteriza a este framework: varios workers generan experiencia en paralelo mientras el entrenamiento se ejecuta en un proceso separado, con politica y funcion de valor desacopladas. En tareas basadas en pixeles, la configuracion habitual de Sample Factory usa un codificador convolucional para las observaciones visuales y cabezas separadas de politica y valor, con una funcion de valor asimetrica que puede recibir informacion privilegiada del entorno; no obstante, la model card no confirma ninguna de estas decisiones de diseno para este checkpoint concreto.

No se especifica el numero de pasos de entrenamiento, el numero de entornos paralelos, el presupuesto de computo, la semilla o semillas utilizadas, ni si se aplicaron tecnicas adicionales como normalizacion de recompensas, recortes de ventaja o curricula. Tampoco se documenta el preprocesado de las observaciones (resolucion, escala de grises, apilado de fotogramas) ni el espacio de acciones resultante. Toda esta informacion se considera no disponible.

## Capacidades

- Control de un agente en el escenario `doom_health_gathering_supreme` de ViZDoom: el agente recibe observaciones visuales del entorno y emite acciones discretas de movimiento y disparo definidas por el propio escenario.
- Aprendizaje por refuerzo visual de extremo a extremo: la politica opera directamente sobre pixeles, sin ingenieria de caracteristicas manual.
- Reproduccion de experimentos de RL: al estar ligado al framework Sample Factory, puede cargarse con sus utilidades de evaluacion para replicar la politica entrenada.
- Punto de partida para ajuste fino o continuacion de entrenamiento sobre el mismo escenario.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (vision general, audio, modo de razonamiento): no disponible; la unica modalidad confirmada es la observacion visual del entorno ViZDoom.

## Casos de uso

- Reproduccion de resultados en investigacion de RL: cargar el checkpoint con Sample Factory y ejecutar la evaluacion sobre `doom_health_gathering_supreme` para comprobar la recompensa media declarada de 12,50 +/- 1,20, que el propio autor marca como no verificada.
- Baseline en comparaciones de algoritmos: usar este agente APPO como referencia frente a variantes de PPO, SAC o metodos basados en modelos evaluados en el mismo escenario de ViZDoom.
- Ablaciones de hiperparametros: reentrenar desde este checkpoint modificando tasa de aprendizaje, numero de workers o coeficiente de entropia, y medir el delta de recompensa respecto al punto de partida.
- Docencia y formacion en RL profundo: sirve como ejemplo minimo y ejecutable de un pipeline completo (entorno, recoleccion asincrona de experiencia, optimizacion de politica) sin necesidad de infraestructura de gran escala.
- Estudio de robustez y generalizacion: evaluar la politica con variaciones de semilla, cambios en la configuracion del escenario o perturbaciones en las observaciones para cuantificar su sensibilidad.
- Inicializacion en un curriculum de tareas ViZDoom: emplear la politica como punto de partida para escenarios relacionados (por ejemplo, recogida de salud con enemigos) y medir la transferencia.
- Pruebas de integracion de infraestructura de RL: validar pipelines de entrenamiento distribuido, registro de metricas o evaluacion periodica antes de escalar a tareas mas costosas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica no verificada):

| Metrica | Valor | Tarea | Dataset / entorno | Verificado |
|---|---|---|---|---|
| mean_reward | 12,50 +/- 1,20 | reinforcement-learning | doom_health_gathering_supreme | No |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), ni desgloses por semilla, ni curvas de aprendizaje. Tampoco se aportan datos de otros agentes comparables evaluados en el mismo escenario dentro de esta publicacion.

## Requisitos de hardware

- VRAM para inferencia: no disponible. La model card no especifica el tamano de la red ni el numero de parametros.
- [Estimacion no confirmada por el autor] Los agentes de ViZDoom entrenados con Sample Factory suelen emplear codificadores convolucionales del orden de pocos millones de parametros, por lo que la inferencia cabria holgadamente en GPUs de consumo; este dato no esta respaldado por la publicacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque por la naturaleza del entorno (observaciones de baja resolucion) es plausible, sin confirmacion.
- Opciones de despliegue: Sample Factory para carga y evaluacion del checkpoint. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un agente de RL.
- Latencia y throughput: no disponible. No se publican mediciones de pasos por segundo ni de tiempo de inferencia por fotograma.
- El repositorio figura con un tamano de 0,0 GB, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el artefacto es de tamano despreciable; conviene verificarlo antes de planificar el despliegue.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Existen otros agentes publicados bajo la misma convencion de nombres (`sf-*` para checkpoints de Sample Factory) y otros checkpoints de ViZDoom en HuggingFace, pero no se han aportado sus metricas, tamanos ni licencias, por lo que cualquier tabla comparativa seria especulativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sf-doom_health_gathering_supreme | no disponible | no aplica | mean_reward 12,50 +/- 1,20 (no verificado) | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Metricas no verificadas: el unico resultado publicado (12,50 +/- 1,20) esta marcado con `verified: false` en el model-index, sin semillas, intervalos de confianza ni protocolo de evaluacion descrito.
- Licencia ausente: al no especificarse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion. Tratarlo como material sin licencia clara hasta contactar con el autor.
- Especificidad extrema: la politica esta entrenada para un unico escenario de ViZDoom. No es portable a otros entornos, tareas o modalidades sin reentrenamiento.
- Ausencia de generalizacion documentada: no se aportan pruebas de robustez frente a cambios de semilla, variaciones del escenario o perturbaciones visuales.
- Sin capacidades de lenguaje: no genera texto, no responde a instrucciones, no soporta tool calling ni razonamiento multi-paso. No debe confundirse con un modelo fundacional.
- Riesgo de sobreajuste al entorno de entrenamiento: en RL visual es frecuente que la politica explote atajos del escenario; sin informacion de entrenamiento no puede descartarse.
- Sin validacion externa: 0 descargas y 0 likes implican que el artefacto no ha sido reproducido por terceros.
- Trazabilidad limitada: la model card es una plantilla autogenerada por Sample Factory; no incluye hiperparametros, presupuesto de computo, version del framework ni commit del entorno.
- Fecha de creacion y actualizacion en 2026-09-24: conviene comprobar que la marca temporal es correcta antes de citar el artefacto.
- Tamano de repositorio de 0,0 GB: existe riesgo de que los pesos no esten disponibles o sean inaccesibles; verificar la descarga antes de integrarlo en cualquier flujo.

## Enlaces

Enlaces incluidos en la model card:

- Modelo en HuggingFace: https://huggingface.co/sashank160105/sf-doom_health_gathering_supreme

Referencias del framework y del entorno (no incluidas en la model card, aportadas como contexto):

- Sample Factory (repositorio oficial del framework con el que se entreno el agente): https://github.com/alex-petrenko/sample-factory
- Articulo de Sample Factory (APPO, arXiv:2006.05990): https://arxiv.org/abs/2006.05990
- ViZDoom (entorno de investigacion en RL sobre Doom): https://vizdoom.cs.put.edu.pl/
- Documentacion de Sample Factory sobre entornos ViZDoom: https://github.com/alex-petrenko/sample-factory/blob/master/docs/02-configuration.md

No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales asociados especificamente a este checkpoint.
