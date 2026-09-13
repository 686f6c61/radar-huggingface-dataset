# Nikhitha123/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene una politica de aprendizaje por refuerzo profundo (deep reinforcement learning) entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario Nikhitha123 en Hugging Face, y el propio modelo declara haberse entrenado con Sample-Factory 2.0, la libreria de referencia de Alex Petrenko para entrenamiento distribuido de agentes en entornos visuales. No se trata de un modelo de lenguaje: es un agente que aprende una politica de control (actor-critico) a partir de observaciones visuales del videojuego, con el objetivo de recoger paquetes de salud y sobrevivir el maximo tiempo posible.

El interes practico del repositorio es acotado pero claro: sirve como artefacto reproducible de un curso o experimento de RL. La model card incluye el comando exacto de descarga y de evaluacion con `enjoy`, lo que permite reejecutar la politica sin reentrenar. El resultado declarado por el autor es una recompensa media de 11,97 +/- 4,61 en el entorno, una cifra modesta que sugiere un entrenamiento parcial o una configuracion de curriculum limitada, y que ademas no esta verificada (el campo `verified` de la model-index es `false`).

La relevancia de la ficha es, por tanto, la de documentar correctamente un checkpoint de RL y no confundirlo con un modelo generativo: no hay contexto en tokens, no hay idiomas, no hay cuantizaciones GGUF ni tool calling. Cualquier comparacion con LLMs seria un error de categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico con codificador convolucional (CNN) sobre observaciones visuales; algoritmo APPO de Sample-Factory 2.0 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL con historial de observaciones; no hay ventana de tokens) |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas (FP32/FP16 depende del checkpoint) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no especificado; el repositorio se carga con `sample_factory.huggingface.load_from_hub` (checkpoints de Sample-Factory, tipicamente PyTorch) |
| Entorno de entrenamiento | ViZDoom `doom_health_gathering_supreme` |
| Algoritmo | APPO |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-13 |
| Fecha de actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

La politica se entrena con APPO, la implementacion de Sample-Factory del algoritmo PPO en su variante asincrona. En Sample-Factory, APPO combina un `AsyncRunner` que recolecta experiencia en multiples workers paralelos con un estimador de ventaja generalizada (GAE) y una actualizacion por lotes del actor-critico. El modelo se define mediante un encoder convolucional para las observaciones visuales del entorno ViZDoom `doom_health_gathering_supreme`, tarea en la que el agente debe recoger medikits mientras esquiva o minimiza el dano de los enemigos; el episodio termina cuando la salud llega a cero o se agota el tiempo.

No se dispone de informacion sobre el numero de pasos de entrenamiento, la composicion del dataset de experiencia, el numero de workers, la semilla ni el presupuesto de computo empleado. Tampoco se documenta el uso de tecnicas adicionales como reward shaping, curriculum learning, auto-regresion de acciones o normalizacion de recompensas, aunque el sufijo `supreme` en el nombre del entorno indica la variante mas dificil. No hay RLHF ni DPO: son tecnicas de alineacion de modelos de lenguaje y no aplican aqui.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme` a partir de observaciones visuales.
- Politica de navegacion y recogida de objetos (medikits) con evasiva basica de enemigos, en la medida en que la recompensa media de 11,97 lo permita.
- Ejecucion de inferencia determinista o estocastica segun la configuracion de `enjoy` de Sample-Factory.
- Reproducibilidad del pipeline de evaluacion mediante el comando publicado en la model card.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso con herramientas externas.
- No tiene capacidades multilingues.
- No dispone de modo de razonamiento explicito (thinking mode), vision o audio mas alla de las observaciones del propio entorno de juego.
- No es un modelo de proposito general: su politica solo tiene sentido dentro del entorno para el que fue entrenada.

## Casos de uso

- Reproduccion de experimentos docentes de RL: el repositorio permite descargar el checkpoint y ejecutar `enjoy` para observar el comportamiento aprendido, util en cursos de aprendizaje por refuerzo profundo.
- Linea base (baseline) para comparar algoritmos: sirve como referencia APPO sobre `doom_health_gathering_supreme` frente a PPO, IMPALA o DQN entrenados por terceros, siempre que se respete la misma configuracion de entorno.
- Estudio de recompensas dispersas y shaping: la tarea de recoger salud con recompensa escasa es un banco de pruebas clasico para tecnicas de recompensa auxiliar.
- Ablaciones de hiperparametros de Sample-Factory: el checkpoint permite fijar un punto de partida y variar numero de workers, learning rate o tamano de lote para medir el impacto en la recompensa media.
- Analisis de robustez visual: se puede evaluar al agente con variaciones de textura, iluminacion o resolucion en ViZDoom para medir su sensibilidad a la distribucion de observaciones.
- Demostraciones de inferencia en vivo: dado el reducido tamano del repositorio (0,1 GB), es viable integrar la politica en un bucle interactivo de demostracion o en un video de resultados sin infraestructura de GPU de gama alta.
- Generacion de trayectorias para aprendizaje por imitacion: las rollout del agente pueden usarse como datos de comportamiento para entrenar politicas mas simples por destilacion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados, `verified: false`):

| Algoritmo | Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|---|
| APPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 11,97 +/- 4,61 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion con modelos similares dentro del repositorio, ni datos de rendimiento por episodio, tasa de exito, tiempo de supervivencia medio o curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio completo ocupa 0,1 GB y una politica convolucional de este tipo suele residir en memoria muy por debajo de 1 GB; esta cifra es una estimacion derivada del tamano del repositorio, no un dato declarado por el autor.
- GPU recomendadas: no disponibles. El entrenamiento con Sample-Factory es escalable en GPU (A100, H100, RTX 4090, etc.), pero no se documenta la configuracion usada para este checkpoint.
- Compatibilidad con GPU de consumo: es razonable esperar que la inferencia quepa en cualquier GPU de consumo e incluso en CPU, dado el tamano del artefacto, aunque no hay confirmacion oficial.
- Opciones de despliegue: Sample-Factory para carga y evaluacion (`sample_factory.huggingface.load_from_hub` y el script `enjoy`). No se contemplan vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles. Dependen por completo del hardware, de la resolucion de observacion de ViZDoom y del numero de entornos paralelos en `enjoy`.

## Comparativa con modelos similares

No se dispone de datos verificables de parametros, contexto, rendimiento o licencia de alternativas comparables dentro de la informacion proporcionada.

| Modelo | Categoria | Parametros | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nikhitha123/rl_course_vizdoom_health_gathering_supreme | APPO / ViZDoom | no disponible | doom_health_gathering_supreme | 11,97 +/- 4,61 (no verificado) | no disponible | Hugging Face, 0 descargas |
| Otras politicas APPO de referencia de Sample-Factory para el mismo entorno | APPO / ViZDoom | no disponible | doom_health_gathering_supreme | no disponible | no disponible | no disponible |
| Politicas PPO o IMPALA entrenadas por terceros en ViZDoom | RL visual | no disponible | variantes de ViZDoom | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La recompensa declarada (11,97 +/- 4,61) no esta verificada y presenta una desviacion tipica alta, lo que indica un comportamiento muy variable entre episodios.
- No hay informacion sobre sesgos, pero al tratarse de un agente entrenado en un unico entorno, su politica no generaliza fuera de `doom_health_gathering_supreme`.
- Riesgo de sobreajuste al escenario concreto: cambios en texturas, mapas o dinamica del juego pueden degradar el rendimiento sin aviso.
- La licencia es no disponible, por lo que no puede confirmarse el uso comercial del checkpoint ni su redistribucion.
- El repositorio no incluye configuracion completa de entrenamiento, numero de pasos ni semillas, lo que limita la reproducibilidad estricta del resultado.
- El campo `verified` de la model-index es `false`: los numeros provienen unicamente del autor.
- La model card utiliza la plantilla generica de Sample-Factory; no documenta el script `enjoy` concreto (aparece como `<path.to.enjoy.module>`), por lo que el usuario debe localizarlo en el codigo fuente.
- Las fechas del repositorio (creacion y actualizacion en 2026-09-13) figuran tal cual en la informacion proporcionada.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo: devuelven articulos en italiano sobre aplicaciones de streaming para Fire TV Stick, sin relacion alguna con el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nikhitha123/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory 2.0 (repositorio): https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Enlaces adicionales relevantes: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
