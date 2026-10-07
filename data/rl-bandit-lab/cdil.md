# rl-bandit-lab/CDIL

## Resumen

CDIL es el repositorio de pesos del método AdaptDICE, presentado en el artículo "Semi-Supervised Cross-Domain Imitation Learning" (arXiv:2602.10793) por el grupo rl-bandit-lab, vinculado al NYCU RL Bandits Lab. No es un modelo de lenguaje: se trata de un conjunto de políticas de control continuo entrenadas mediante imitación en régimen offline y semi-supervisado, capaces de transferir comportamiento entre un dominio fuente y un dominio objetivo con dinámicas distintas y con datos objetivo mayoritariamente sin etiquetar.

El problema que resuelve es el coste de obtener demostraciones expertas en el dominio objetivo. AdaptDICE combina demostraciones etiquetadas (pocas) con trayectorias imperfectas (muchas, mezcla de experto y aleatorio) y aprende una política objetivo usando el marco DICE, apoyándose en modelos fuente preentrenados con DemoDICE y en flujos normalizadores preentrenados para alinear representaciones entre dominios. El repositorio publica los checkpoints finales (iteración 500k) para seis entornos: Hopper, HalfCheetah y Ant en MuJoCo, y Lift, Door y Wipe en robosuite.

La relevancia actual está en que ofrece pesos listos para cargar en investigación de imitation learning y offline RL, con licencia MIT, cinco semillas por configuración y tres regímenes de datos (Default, Expert-Rich y Sub-Optimal-Rich), lo que facilita reproducibilidad y comparación de métodos en escenarios de transferencia entre dominios. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes MLP independientes (actor, cost, critic, decoder de estado, action_decoder) con capa oculta de 256 unidades, mas flujos normalizadores preentrenados por entorno (excepto en Wipe, entrenado sin flujo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume una observacion por paso de decision) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin variantes cuantizadas documentadas) |
| Idiomas soportados | no aplica (modelo de control, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (un fichero por entorno, conjunto y semilla) |
| Algoritmo | AdaptDICE (implementado como `--algorithm=avatar_dice`, clase `agent.avatar_dice.Avatar`) |
| Entornos cubiertos | Hopper, HalfCheetah, Ant (MuJoCo); Lift, Door, Wipe (robosuite) |
| Particiones de datos | set1 (Default), set2 (Expert-Rich), set3 (Sub-Optimal-Rich) |
| Semillas publicadas | 0, 1, 2, 3, 4 |
| Checkpoint | Iteracion 500k (solo pesos, sin estado del optimizador) |
| Prefijos de claves | `actor.*`, `decoder.*`, `action_decoder.*`, `cost.*`, `critic.*` |
| Libreria | PyTorch |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-05 |
| Ultima actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

AdaptDICE se apoya en el marco DICE (DIstribution Correction Estimation) para aprendizaje por imitacion offline. El imitador (`Avatar`) agrupa cinco modulos: `actor` (politica del dominio objetivo), `cost` y `critic` (funciones de coste y valor del problema DICE), `decoder` (mapeo de estado G, aplicado antes del flujo) y `action_decoder` (mapeo de accion H, tambien antes del flujo). Todas las redes usan tamano oculto 256. En cinco de los seis entornos se emplean flujos normalizadores preentrenados almacenados en `flow_model/<env>/` dentro del repositorio de codigo; Wipe se entreno sin flujo.

El regimen de entrenamiento es semi-supervisado y cross-domain: existen demostraciones en el dominio fuente (modelos DemoDICE en `pretrained_models/*.pickle`) y, en el dominio objetivo, un numero reducido de trayectorias expertas etiquetadas (`--expert_num_traj`, denotado `E<e>`) junto con un conjunto mayor de trayectorias imperfectas sin etiquetar formadas por `a` trayectorias expertas y `b` aleatorias (denotado `I<a>-<b>`). La model card no detalla el numero de tokens, episodios ni pasos de entrenamiento, ni si se emplearon etapas de RLHF o DPO, tecnicas estas que no aplican a este tipo de modelo. Tampoco se documenta ninguna innovacion de decodificacion especulativa ni de atencion lineal.

Un detalle operativo relevante es que la politica espera observaciones normalizadas con un cero final que actua como indicador de estado absorbente. La normalizacion se calcula a partir de los datos objetivo imperfectos con `shift = -mean` y `scale = 1 / (std + 1e-3)`, de modo que para reproducir resultados hay que usar exactamente los mismos ficheros de dataset y los mismos recuentos de trayectorias indicados en la model card.

## Capacidades

- Generacion de acciones continuas: produce comandos de control por paso para tareas de locomotion (Hopper, HalfCheetah, Ant) y de manipulacion (Lift, Door, Wipe).
- Imitacion cross-domain: aprende una politica en un dominio objetivo con dinamicas distintas de las del dominio fuente, usando modelos fuente preentrenados como referencia.
- Aprendizaje semi-supervisado: aprovecha pocas trayectorias expertas etiquetadas junto con datos imperfectos sin etiquetar (experto mas aleatorio).
- Estimacion de coste y valor: los modulos `cost` y `critic` implementan la formulacion DICE y pueden reutilizarse para puntuar transiciones o como base de etapas posteriores.
- Mapeo de estado y accion: los modulos `decoder` y `action_decoder` proyectan estado y accion al espacio del flujo, lo que permite integrar los pesos en canalizaciones con normalizacion.
- Manejo de estado absorbente: soporta el flag de estado absorbente en la observacion normalizada, necesario para tareas con terminacion.
- Multiples regimenes de datos: pesos disponibles para escenarios con pocos expertos (Default), con mas expertos (Expert-Rich) y con datos muy suboptimos (Sub-Optimal-Rich).
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues. Las etiquetas del repositorio no incluyen ninguna funcionalidad de lenguaje natural.

## Casos de uso

- Transferencia sim-to-sim entre dominios con dinamicas distintas: se carga el checkpoint del entorno objetivo y se evalua la politica bajo parametros fisicos modificados, usando los pesos AdaptDICE como referencia de hasta donde llega la adaptacion sin datos etiquetados abundantes.
- Manipulacion robotica con pocas demostraciones: en Lift, Door y Wipe (robosuite) el modelo permite entrenar tareas de agarre o apertura con tan solo una trayectoria experta etiquetada (set1, `E1`), reduciendo el coste de teleoperacion.
- Preentrenamiento de politicas para RL online posterior: los pesos sirven como inicializacion y despues se afinan con un algoritmo de RL online, aprovechando que las funciones `actor` y `critic` ya estan entrenadas en el dominio objetivo.
- Investigacion reproducible en imitation learning: el repositorio publica cinco semillas por configuracion, lo que permite medir varianza entre semillas en lugar de reportar una unica ejecucion, algo habitual en experimentos de MuJoCo.
- Benchmark de metodos de offline RL por imitacion: el coste y el critico entrenados pueden emplearse para comparar nuevas propuestas de regularizacion o de correccion de distribucion frente a AdaptDICE bajo particiones de datos identicas (set1, set2, set3).
- Filtrado y puntuacion de datasets imperfectos: dado que `cost` y `critic` modelan la discrepancia respecto al experto, se pueden usar para puntuar trayectorias no etiquetadas y descartar las mas alejadas antes de reentrenar.
- Estudio de robustez ante datos suboptimos: con la particion set3 (por ejemplo `E1_I50-100` en Hopper) se puede analizar la degradacion de la politica cuando la proporcion de trayectorias aleatorias es muy alta.
- Prototipado en simulacion sin GPU: al tratarse de redes MLP pequenas, los checkpoints se pueden ejecutar en CPU para pruebas de integracion antes de escalar a experimentos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la estructura de los checkpoints, los entornos y los regimenes de datos, pero no incluye cifras de retorno, tasas de exito ni comparaciones cuantitativas con otros metodos. El articulo asociado se referencia como arXiv:2602.10793, pero no se ha facilitado su contenido numerico en la informacion disponible, por lo que no se presentan tablas de resultados para no inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de decenas o pocos cientos de MB por checkpoint, segun el tamano del repositorio (0,1 GB para el conjunto completo de entornos, conjuntos y semillas) y el tamano oculto de 256 unidades. Es una estimacion basada en el tamano del repositorio, no un dato publicado.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente, incluidas GTX 10xx y superiores; para entrenamiento o evaluacion masiva en paralelo son adecuadas RTX 3090, RTX 4090, A100 o H100, aunque no se documentan requisitos especificos.
- Cabe en GPU de consumo: si, y con margen amplio; tambien cabe en CPU y en sistemas embebidos, siempre que el entorno de simulacion (MuJoCo o robosuite) pueda ejecutarse.
- Opciones de despliegue: PyTorch con `safetensors.torch.load_file` para cargar pesos y el repositorio de codigo (NYCU-RL-Bandits-Lab/CDIL) para construir el imitador `Avatar` tal como lo hace `train_il.py` con `--algorithm=avatar_dice`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Dependencias de entorno: MuJoCo para Hopper, HalfCheetah y Ant; robosuite para Lift, Door y Wipe; flujos normalizadores preentrenados de `flow_model/<env>/` en todos los entornos salvo Wipe.
- Latencia y throughput: no disponibles. Al ser redes MLP con capa oculta de 256 unidades, la inferencia por paso es de coste bajo en GPU moderna, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de modelos comparables en la informacion proporcionada. La unica referencia metodologica explicita es DemoDICE, empleado como generador de los modelos del dominio fuente (`pretrained_models/*.pickle`), pero la model card no publica cifras de ninguno de los dos. La tabla siguiente refleja unicamente lo que consta en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CDIL (AdaptDICE) | no disponible | no aplica | no disponible | MIT | HuggingFace (rl-bandit-lab/CDIL) |
| DemoDICE (modelos fuente) | no disponible | no aplica | no disponible | no disponible | Ficheros `.pickle` en el repositorio de codigo |
| Otros metodos de imitation learning offline | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no genera texto, codigo ni respuestas, y no admite tool calling ni razonamiento multi-paso.
- Solo cubre seis entornos concretos (Hopper, HalfCheetah, Ant, Lift, Door, Wipe); no hay garantia de generalizacion a otras tareas o morfologias sin reentrenamiento.
- Los pesos dependen de los datos de entrenamiento alojados en el repositorio de codigo; reproducir resultados exige usar los mismos ficheros de dataset y los mismos recuentos de trayectorias, no solo el checkpoint.
- La normalizacion de observaciones es parte del contrato de uso (`shift = -mean`, `scale = 1 / (std + 1e-3)`, cero final para el estado absorbente). Aplicar otra normalizacion invalida la politica.
- Los ficheros contienen solo pesos, sin estado del optimizador: no permiten reanudar el entrenamiento desde la iteracion 500k, solo inferencia o fine-tuning desde cero del optimizador.
- El modelo Wipe se entreno sin flujo normalizador, por lo que su canalizacion difiere de la del resto de entornos y no se puede tratar de forma homogenea.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de comportamiento fuera de distribucion cuando el estado observado se aleja de la distribucion de los datos objetivo imperfectos.
- Sesgos conocidos: no se documenta ningun analisis de sesgo. Los datos imperfectos contienen trayectorias aleatorias, lo que puede sesgar la politica hacia comportamientos suboptimos si el entrenamiento no los pondera adecuadamente.
- Validacion solo en simulacion: no se aportan resultados de transferencia a robot real (sim-to-real), por lo que el despliegue fisico requeriria validacion adicional.
- Limitaciones de idioma: no aplica, el modelo no procesa texto.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No se imponen restricciones adicionales documentadas, pero la licencia de los datos y del codigo asociado debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes, y no se ha publicado informacion de mantenimiento posterior a la actualizacion del 2026-10-06.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los resultados obtenidos correspondian a sitios sin relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rl-bandit-lab/CDIL
- Articulo: https://arxiv.org/abs/2602.10793
- Codigo: https://github.com/NYCU-RL-Bandits-Lab/CDIL
- Datasets: https://huggingface.co/datasets/rl-bandit-lab/CDIL
- Referencia de los modelos fuente DemoDICE y flujos preentrenados: incluidos en el repositorio de codigo (`pretrained_models/*.pickle`, `flow_model/<env>/`)
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales relacionados con este modelo.
