# ilyass200404/rl_course_vizdoom_health_gathering_supreme-unit8-2

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. El modelo ha sido publicado por el usuario ilyass200404 dentro de lo que parece ser un curso de reinforcement learning (el identificador incluye "rl_course" y "unit8"), y se distribuye a traves del Hub de Hugging Face con el formato de checkpoints de Sample-Factory 2.0, la libreria de entrenamiento distribuido desarrollada por Alex Petrenko.

A diferencia de un modelo de lenguaje, aqui no hay pesos de transformer ni tokenizador: se trata de una politica neuronal que recibe fotogramas del entorno (observaciones visuales) y emite acciones discretas, con el objetivo de maximizar la recoleccion de botiquines en un escenario 3D de Doom. Esto implica que conceptos como "longitud de contexto", "cuantizacion" o "idiomas soportados" no aplican en el sentido habitual; el alcance del modelo esta delimitado por el entorno concreto para el que fue entrenado.

Su relevancia es fundamentalmente docente y de investigacion: sirve como ejemplo reproducible de un pipeline completo de RL (entrenamiento, evaluacion, publicacion en el Hub y reanudacion del entrenamiento), y como linea base para comparar variantes de algoritmos o de configuracion en un entorno visual con recompensa dispersa. El resultado declarado por el autor es una recompensa media de 10,88 +/- 5,25, no verificada, sobre un repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente de RL entrenado con APPO sobre Sample-Factory 2.0; la configuracion concreta de red no se publica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; consume observaciones visuales por fotograma del entorno ViZDoom |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | no aplica / no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Sample-Factory (repositorio de 0,1 GB); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

APPO es un algoritmo actor-critico asincrono derivado de PPO, pensado para entrenamiento distribuido de alta eficiencia en entornos con observaciones visuales. En Sample-Factory, la implementacion tipica para entornos ViZDoom combina un codificador convolucional que procesa los fotogramas con una capa recurrente (habitualmente LSTM) que mantiene estado temporal, mas dos cabezas de salida: la politica (acciones discretas) y la funcion de valor. La model card no detalla la configuracion exacta empleada (numero de capas, canales, unidades recurrentes ni hiperparametros), por lo que esos datos no se pueden confirmar con la informacion disponible.

El entrenamiento se realizo sobre el entorno `doom_health_gathering_supreme`, una variante del escenario "health gathering" de ViZDoom en la que el agente debe recoger botiquines para sobrevivir el mayor tiempo posible en un mapa con liquidos daninos. No se documentan el numero total de pasos de entorno, la composicion del dataset (aqui generado por el propio simulador, no hay corpus de texto), ni si se aplicaron tecnicas adicionales de ajuste como RLHF o DPO, que no tienen sentido en este contexto. La model card si indica como reanudar el entrenamiento con `--restart_behavior=resume` y como evaluar el modelo con el script `enjoy`, lo que confirma que el checkpoint es compatible con el flujo estandar de Sample-Factory.

## Capacidades

- Control de agente en un entorno 3D de ViZDoom: selecciona acciones discretas a partir de observaciones visuales para maximizar la recoleccion de botiquines.
- Politica reactiva con memoria temporal (arquitectura recurrente habitual en Sample-Factory), lo que permite integrar informacion de varios fotogramas.
- Evaluacion reproducible mediante el script `enjoy` de Sample-Factory sobre el entorno `doom_health_gathering_supreme`.
- Reanudacion del entrenamiento desde el checkpoint publicado, con la opcion `--restart_behavior=resume`.
- Publicacion y carga desde el Hub de Hugging Face mediante `sample_factory.huggingface.load_from_hub`.
- Registro de metricas compatible con TensorBoard (etiqueta `tensorboard` del repositorio).
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, capacidades de agente multi-paso en el sentido de los LLM, ni soporte multilingue.

## Casos de uso

- Docencia de reinforcement learning: el repositorio funciona como ejemplo completo de un ciclo de entrenamiento APPO con publicacion en Hugging Face, util para que un alumno reproduzca el pipeline de principio a fin.
- Linea base para comparar algoritmos: se puede evaluar PPO, APPO u otras variantes sobre `doom_health_gathering_supreme` usando este checkpoint como referencia de partida, teniendo en cuenta el valor declarado de 10,88 +/- 5,25.
- Estudio de recompensa dispersa y supervivencia: el escenario obliga al agente a gestionar un recurso vital decreciente, lo que lo convierte en un banco de pruebas para tecnicas de exploracion y shaping de recompensa.
- Aprendizaje por transferencia y ajuste fino: al permitir reanudar el entrenamiento, sirve para experimentar con curricula (mapas mas grandes, mas enemigos, cambios en la tasa de aparicion de botiquines) partiendo de una politica ya entrenada.
- Investigacion en vision para control: permite analizar como una politica convolucional extrae informacion util de fotogramas de baja resolucion en un entorno de primera persona.
- Pruebas de robustez y aleatoriedad: dada la desviacion estandar reportada (+/- 5,25), es un candidato adecuado para estudiar varianza entre semillas, estabilidad de la politica y sensibilidad a perturbaciones visuales.
- Reproducibilidad en ensenanza universitaria: el identificador "unit8" sugiere su uso como material de una unidad didactica concreta, util para verificar resultados de practicas de laboratorio.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 10,88 +/- 5,25 | No |

No se han publicado en la informacion disponible otros resultados de benchmarks ni comparaciones con modelos similares.

## Requisitos de hardware

- El repositorio completo ocupa 0,1 GB, por lo que el checkpoint es pequeno en comparacion con modelos de lenguaje; no se publica el numero de parametros.
- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano del repo, es razonable esperar que la politica quepa en menos de 1 GB de memoria, pero se trata de una estimacion derivada del tamano del artefacto, no de un dato publicado.
- GPU recomendadas: no disponibles. El entrenamiento con Sample-Factory esta pensado para GPU (se usan habitualmente tarjetas tipo RTX 3090/4090 o A100 en configuraciones multiproceso), mientras que la evaluacion de una unica politica puede ejecutarse en CPU.
- Cabe en GPU de consumo: previsiblemente si, en cualquier GPU con al menos unos pocos GB de VRAM; tambien es viable la ejecucion en CPU para inferencia aislada.
- Opciones de despliegue: Sample-Factory (`enjoy` para evaluacion, `train` para reanudar). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Dependencia adicional: el entorno ViZDoom debe estar instalado y disponible para poder ejecutar el agente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ilyass200404/rl_course_vizdoom_health_gathering_supreme-unit8-2 | Agente RL (APPO) | doom_health_gathering_supreme | no disponible | no aplica | mean_reward 10,88 +/- 5,25 (no verificado) | no disponible | Hugging Face Hub |
| Otros checkpoints APPO de Sample-Factory para ViZDoom | Agente RL (APPO) | ViZDoom (diversos escenarios) | no disponible | no aplica | no disponible en la informacion proporcionada | habitualmente MIT en el codigo de Sample-Factory; la licencia del checkpoint no se especifica | Hugging Face Hub / repositorios de Sample-Factory |

No se dispone de datos publicados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo tiene sentido en el entorno `doom_health_gathering_supreme`; no es reutilizable como modelo de lenguaje ni como sistema de vision general.
- Varianza elevada: la metrica declarada es 10,88 +/- 5,25, lo que indica una desviacion estandar muy alta en relacion con la media y sugiere inestabilidad o alta dependencia de la semilla y de la evaluacion.
- Resultado no verificado: el campo `verified` del `model-index` es `false`; el valor procede unicamente del autor.
- Licencia no disponible: no se especifica licencia para los pesos, lo que genera incertidumbre juridica para cualquier uso, incluido el comercial.
- Ausencia de documentacion tecnica: no se publican hiperparametros, arquitectura exacta, numero de pasos de entrenamiento ni curva de aprendizaje, lo que dificulta la reproducibilidad fina.
- Sin informacion sobre sesgos: no se documentan analisis de sesgo ni de comportamiento indeseado; en RL esto incluye comportamientos degenerados o explotacion de fallos del simulador.
- Riesgo de sobreajuste al entorno: al no haberse evaluado en variantes del escenario, se desconoce su capacidad de generalizacion.
- Cero traccion en el Hub: 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Requiere el stack completo de Sample-Factory y ViZDoom: no es un artefacto autocontenido tipo safetensors/GGUF y su uso implica dependencias de Python y del simulador.
- Idiomas: no aplica; cualquier expectativa de procesamiento de lenguaje natural queda fuera del alcance del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilyass200404/rl_course_vizdoom_health_gathering_supreme-unit8-2
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
- Entorno ViZDoom (referencia del escenario utilizado, no enlazado en la model card): https://vizdoom.cs.put.edu.pl/
