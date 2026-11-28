# shoemoney/ppo-doom-health-gathering-supreme

## Resumen

PPO ViZDoom Health Gathering Supreme es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el escenario `doom_health_gathering_supreme` de ViZDoom, un entorno de investigacion clasico en el que el agente debe recoger pociones de salud mientras esquiva ataques enemigos en un mapa de Doom. El modelo lo publica el usuario shoemoney en Hugging Face y se distribuye como checkpoint de la libreria Sample Factory, el framework de RL de alto rendimiento desarrollado por el grupo de Aleksei Petrenko.

El interes de esta ficha es acotado: no es un modelo de lenguaje ni un sistema multimodal, sino un artefacto de investigacion reproducible. El autor declara explicitamente que el entrenamiento parte de inicializacion aleatoria, sin importar pesos preentrenados, durante 507.904 pasos de entorno en una CPU gratuita de Google Colab. Se trata, por tanto, de un checkpoint temprano y de baja escala, pensado como material didactico o como referencia minima de un pipeline PPO completo (configuracion, log, codigo y replay incluidos).

La relevancia practica es limitada fuera del ambito del RL experimental. El agente obtiene una recompensa media de 4,38 +/- 1,19 en 30 episodios estocasticos evaluados con la ruta oficial `enjoy` de Sample Factory. No hay informacion sobre licencia, idiomas ni formato de pesos mas alla del propio checkpoint de Sample Factory, y el repositorio ocupa 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de politica PPO gestionada por Sample Factory (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Sample Factory (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de politica con recorte de la relacion de probabilidades para limitar la magnitud de las actualizaciones. La implementacion corresponde a Sample Factory, que paraleliza la recoleccion de experiencia y el calculo de gradientes en multiples workers. La politica consume observaciones visuales del entorno ViZDoom (`doom_health_gathering_supreme`), un escenario de recompensa dispersa en el que el agente recibe senal al recoger pociones de salud y penalizacion al morir.

Segun la model card, el entrenamiento se ejecuto desde inicializacion aleatoria durante 507.904 pasos de entorno en una CPU gratuita de Colab, sin importar pesos preentrenados. El autor senala que el cuaderno del curso asociado emplea un presupuesto mayor, de 4 millones de pasos, por lo que este checkpoint es deliberadamente temprano. Se incluyen configuracion, codigo, log y replay real del entrenamiento, lo que permite reproducir el proceso. No se documentan tecnicas adicionales como RLHF, DPO, decodificacion especulativa ni atencion lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme`: navegacion y recogida de pociones de salud.
- Politica estocastica entrenada con PPO, evaluable mediante la ruta `enjoy` de Sample Factory.
- Reproducibilidad: el repositorio incluye checkpoint, configuracion, codigo, log y replay del entrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes basados en LLM.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la observacion visual propia del entorno de Doom.

## Casos de uso

- Docencia y cursos de aprendizaje por refuerzo: el checkpoint sirve como ejemplo minimo y reproducible de un pipeline PPO completo con Sample Factory, util para que estudiantes comparen su propia ejecucion con una referencia publicada.
- Verificacion de pipelines de entrenamiento: al incluir configuracion, log y replay, permite depurar discrepancias en la recoleccion de experiencia o en la evaluacion `enjoy` antes de escalar a presupuestos mayores.
- Baseline de referencia en ViZDoom: util como punto de partida de baja calidad (507.904 pasos) frente al que medir mejoras al aumentar el numero de pasos o ajustar hiperparametros.
- Experimentos de reproducibilidad en CPU: el hecho de haberse entrenado en Colab CPU permite replicar el flujo en hardware modesto, sin GPU, para validar la infraestructura antes de invertir en computo.
- Analisis de curvas de aprendizaje: el log incluido permite estudiar la evolucion de la recompensa en un regimen de pocos pasos y compararla con el presupuesto de 4 millones de pasos del cuaderno del curso.
- Demostracion de evaluacion estocastica: el autor documenta 30 episodios post-entrenamiento con la ruta oficial, lo que sirve como plantilla para reportar metricas con desviacion estandar en RL.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | doom_health_gathering_supreme | Mean reward | 4,3843 +/- 1,1920 |

La evaluacion corresponde a 30 episodios estocasticos post-entrenamiento usando la ruta oficial `enjoy` de Sample Factory. No se han publicado en la informacion disponible resultados comparativos con otros agentes ni curvas de aprendizaje detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,5 GB y el entrenamiento se realizo en CPU, por lo que la inferencia es viable sin GPU.
- GPU recomendadas: no disponibles; no se documenta un requisito de GPU para la evaluacion `enjoy`.
- Compatibilidad con GPU de consumo: el artefacto se entreno en CPU de Colab, de modo que cualquier GPU consumer es, en principio, suficiente o sobredimensionada para la inferencia.
- Opciones de despliegue: Sample Factory (ruta `enjoy`), que es la unica via documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Pasos de entrenamiento | Recompensa media | Licencia |
|---|---|---|---|---|---|
| PPO ViZDoom Health Gathering Supreme (este) | doom_health_gathering_supreme | PPO (Sample Factory) | 507.904 | 4,38 +/- 1,19 | no disponible |
| Checkpoint de referencia del cuaderno del curso | doom_health_gathering_supreme | PPO (Sample Factory) | 4.000.000 (presupuesto declarado) | no disponible | no disponible |
| Otros agentes ViZDoom publicos | doom_health_gathering_supreme | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Checkpoint temprano: 507.904 pasos frente al presupuesto de 4 millones del cuaderno del curso, por lo que el rendimiento esta lejos del techo del entorno.
- Recompensa media baja y con alta varianza (desviacion estandar de 1,19 sobre 4,38), lo que indica comportamiento inestable entre episodios.
- Entrenado en CPU de Colab, lo que limita la escala y puede introducir diferencias frente a ejecuciones en GPU.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribucion sin consultar al autor.
- Sin informacion sobre sesgos; en un agente de RL de Doom el concepto de sesgo es distinto al de un LLM y no se documenta.
- Riesgo de sobreajuste al escenario concreto `doom_health_gathering_supreme`; no se declara generalizacion a otros mapas o variantes de ViZDoom.
- No apto para tareas de lenguaje, codigo, vision general ni atencion al cliente; su uso esta restringido al entorno de RL para el que fue entrenado.
- Los resultados de la model card no estan verificados de forma independiente (`verified: false`).

## Enlaces

- Hugging Face: https://huggingface.co/shoemoney/ppo-doom-health-gathering-supreme
- Sample Factory (framework de entrenamiento): https://github.com/alex-petrenko/sample-factory
- ViZDoom (entorno): https://github.com/mwydmuch/ViZDoom
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repos o demos especificos de este checkpoint.
