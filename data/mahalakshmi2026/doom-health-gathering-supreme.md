# MahaLakshmi2026/doom-health-gathering-supreme

## Resumen

`MahaLakshmi2026/doom-health-gathering-supreme` es un checkpoint de aprendizaje por refuerzo profundo (deep reinforcement learning) publicado en Hugging Face Hub por el usuario MahaLakshmi2026. No es un modelo de lenguaje: se trata de una política entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme`, un escenario de ViZDoom en el que el agente debe recoger paquetes de salud evitando morir. El modelo se ha entrenado y empaquetado con Sample-Factory 2.0, la libreria de referencia para RL asincrono a gran escala.

La relevancia de esta ficha es doble. Por un lado, sirve como ejemplo de artefacto de RL publicado con el formato estandar de Sample-Factory y el Hub, con scripts de descarga, evaluacion (`enjoy`) y reanudacion de entrenamiento (`train`) ya documentados en la model card. Por otro, permite ilustrar las diferencias entre una ficha de modelo de RL y una de un LLM: aqui no hay tokens de contexto, ni cuantizaciones, ni idiomas soportados, sino un entorno, un algoritmo, un presupuesto de pasos de entorno y una recompensa media.

El repositorio ocupa aproximadamente 0,1 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 26 de septiembre de 2026. La model card no declara licencia ni idiomas, y el unico resultado de rendimiento publicado es una recompensa media de 9,12 ± 5,00 en el entorno de entrenamiento, marcada como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization), actor-critico con codificador convolucional para observaciones visuales (detalles de capas no especificados en la model card) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable (politica de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplicable en el sentido de cuantizacion de LLM) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Sample-Factory, cargado mediante `sample_factory.huggingface.load_from_hub`; el formato exacto de fichero no se detalla en la model card |
| Algoritmo | APPO |
| Entorno de entrenamiento | `doom_health_gathering_supreme` (ViZDoom) |
| Libreria de entrenamiento | Sample-Factory 2.0 |
| Tarea (pipeline) | reinforcement-learning |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |
| Region declarada | us |

## Arquitectura y entrenamiento

La model card indica unicamente que se trata de un modelo APPO entrenado en el entorno `doom_health_gathering_supreme` con Sample-Factory 2.0. APPO es una variante asincrona de PPO en la que varios workers recolectan experiencia en paralelo y un learner actualiza la politica; en Sample-Factory se implementa como un esquema actor-critico connormalizacion de vantajas y truncamiento de la ratio de politica. El entorno es un escenario de ViZDoom con observaciones visuales (pantalla del juego) y recompensa basada en la recogida de botiquines y la supervivencia, con un episodio de recompensa total tipicamente limitado.

No se especifican en la informacion disponible el numero de pasos de entorno empleados, el tamano del dataset de experiencia, la composicion de las recompensas intermedias, ni si se aplicaron tecnicas adicionales como curriculum learning, randomizacion de dominio o ajuste fino posterior. Tampoco se detalla la topologia exacta de la red (numero de capas convolucionales, dimensionalidad del embedding, numero de unidades en la cabeza de politica y de valor). La model card unicamente documenta los comandos para descargar el checkpoint, ejecutarlo con el script `enjoy` y reanudar el entrenamiento con `train` y `--restart_behavior=resume`, indicando que puede ser necesario ajustar `--train_for_env_steps` a un valor suficientemente alto porque el experimento se reanuda en el paso en el que concluyo.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme`: seleccion de acciones discretas a partir de observaciones visuales del juego.
- Recogida de objetos (paquetes de salud) y supervivencia durante episodios completos, que es el objetivo del escenario.
- Inferencia determinista o estocastica de la politica entrenada mediante el script `enjoy` de Sample-Factory.
- Reanudacion del entrenamiento desde el checkpoint publicado, lo que permite fine-tuning o continuacion de la curva de aprendizaje.
- Integracion con el ecosistema Sample-Factory: TensorBoard para curvas de entrenamiento, exportacion a otros formatos soportados por la libreria y publicacion en el Hub con `--push_to_hub`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, capacidades de agente multi-paso fuera del entorno, ni soporte multilingue, ya que no es un modelo de lenguaje.
- No se documentan en la informacion disponible modos especiales (thinking, audio, vision general) ni capacidades adicionales mas alla de la politica de control descrita.

## Casos de uso

- Investigacion en RL visual: reproducir el entrenamiento de APPO sobre `doom_health_gathering_supreme` como linea base para comparar variantes de algoritmo (PPO, IMPALA, R2D2) bajo el mismo entorno y presupuesto de pasos.
- Benchmarking de infraestructura de entrenamiento asincrono: usar el checkpoint y los scripts de Sample-Factory para medir throughput de muestras por segundo en distintas GPUs y configuraciones de workers.
- Reanudacion y fine-tuning: partir del checkpoint publicado mediante `--restart_behavior=resume` para estudiar tecnicas de curriculum, randomizacion o ajuste de hiperparametros sin empezar de cero.
- Docencia y formacion en RL: ejemplo minimo y reproducible de un artefacto de RL publicado en el Hub, util para explicar el ciclo descarga-evaluacion-reentrenamiento con Sample-Factory.
- Evaluacion de robustez de politicas visuales: analizar la varianza de la recompensa (la desviacion tipica publicada, ± 5,00, es alta respecto a la media de 9,12) para estudiar la estabilidad de la politica entre episodios y semillas.
- Desarrollo de pipelines de investigacion reproducibles: integrar la descarga desde el Hub y la ejecucion headless de ViZDoom en contenedores o entornos de CI para pruebas de regresion de politicas.
- Comparacion de envoltorios y entornos: emplear el modelo como punto de partida para portar el escenario a otros frameworks (Gymnasium, EnvPool) y validar la equivalencia de recompensas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. No estan verificados de forma independiente.

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 9,12 ± 5,00 | No |

No se han publicado en la informacion disponible otros resultados de benchmarks, comparaciones con lineas base ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Dado que el repositorio completo ocupa 0,1 GB, la politica y su optimizador caben holgadamente en cualquier GPU de consumo; la inferencia puede ejecutarse incluso en CPU, aunque ViZDoom requiere renderizado y puede beneficiarse de GPU.
- VRAM estimada para reanudar el entrenamiento: no disponible. Depende del numero de workers, del tamano de lote y de la configuracion de Sample-Factory, no solo del tamano del checkpoint.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU compatible con PyTorch (por ejemplo, RTX 3060 o superior para entrenamiento asincrono con varios workers) es suficiente segun el tamano del artefacto; no se requieren aceleradores de clase A100/H100.
- GPU de consumo: si, el checkpoint es pequeno y cabe en practicamente cualquier GPU de consumo actual e incluso en inferencia por CPU.
- Opciones de despliegue: scripts `enjoy` y `train` de Sample-Factory, descarga mediante `python -m sample_factory.huggingface.load_from_hub -r MahaLakshmi2026/doom-health-gathering-supreme`, TensorBoard para monitorizacion y ViZDoom en modo headless para servidores sin pantalla. No aplican vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican medidas de pasos por segundo, tiempo por episodio ni utilizacion de GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MahaLakshmi2026/doom-health-gathering-supreme | APPO (Sample-Factory) | doom_health_gathering_supreme | no disponible | no aplicable | mean_reward 9,12 ± 5,00 (no verificado) | no disponible | Hugging Face Hub |
| Otros checkpoints APPO de Sample-Factory para el mismo entorno | APPO (Sample-Factory) | doom_health_gathering_supreme | no disponible | no aplicable | no disponible | no disponible | no disponible en la informacion consultada |
| Politicas de referencia de ViZDoom para health gathering | no disponible | doom_health_gathering_supreme | no disponible | no aplicable | no disponible | no disponible | no disponible en la informacion consultada |

No se dispone de datos comparativos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy restringido: la politica solo ha sido entrenada para el escenario `doom_health_gathering_supreme` y no es transferible directamente a otras tareas sin reentrenamiento.
- Varianza elevada: la recompensa media declarada es 9,12 con una desviacion tipica de 5,00, lo que indica un comportamiento poco estable entre episodios y sugiere un riesgo alto de resultados inconsistentes en despliegue.
- Resultado no verificado: la metrica del `model-index` esta marcada como `verified: false` y procede unicamente del autor; no hay evaluacion independiente.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia de informacion de reproducibilidad: no se documentan semilla, numero de pasos de entorno, hiperparametros, version exacta de ViZDoom ni configuracion de hardware, lo que dificulta reproducir el resultado.
- Riesgo de sobreajuste al entorno: no se documentan tecnicas de randomizacion ni conjuntos de evaluacion separados, por lo que el rendimiento fuera de la distribucion de entrenamiento es desconocido.
- Idiomas: no aplicable; no es un modelo de lenguaje y la model card no declara capacidades linguisticas.
- Sesgos: no se documenta ningun analisis de sesgos, comportamiento etico ni limitaciones de seguridad del agente.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso comunitario ni validacion externa.
- Consideraciones de produccion: al ser un checkpoint de investigacion sin licencia ni garantias, no se recomienda su uso en sistemas criticos sin una evaluacion previa exhaustiva y una revision legal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MahaLakshmi2026/doom-health-gathering-supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Documentacion de integracion con Hugging Face en Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/
- Entorno relacionado (ViZDoom, escenario health gathering): no se proporciona un enlace especifico en la informacion disponible.
