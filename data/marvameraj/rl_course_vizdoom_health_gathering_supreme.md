# marvameraj/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un checkpoint de una política de aprendizaje por refuerzo profundo entrenada con Sample Factory sobre el escenario `doom_health_gathering_supreme` de ViZDoom. No es un modelo de lenguaje ni un modelo generativo: es una red de política que mapea observaciones visuales del entorno a acciones discretas, con el objetivo de maximizar la supervivencia recogiendo botiquines. El autor lo publica como entregable de la Unidad 8, Parte 2, del curso de Deep Reinforcement Learning de Hugging Face.

El algoritmo empleado es APPO (Asynchronous Proximal Policy Optimization), la implementación asíncrona de PPO que distribuye Sample Factory, sobre PyTorch. El entrenamiento se realizó en Google Colab, según indica la propia model card, y el repositorio incluye el checkpoint resultante. No se especifican en la información disponible el número de parámetros de la red, el número de pasos de entrenamiento ni la composición exacta de la configuración de entrenamiento.

Su relevancia es fundamentalmente didáctica y de reproducibilidad: sirve como referencia mínima para comparar implementaciones de APPO, para estudiar la curva de aprendizaje en un entorno deViZDoom y como punto de partida para experimentos propios. El único resultado declarado es una recompensa media de 5 sobre el conjunto de evaluación del entorno, marcada como no verificada por el propio autor. El repositorio no tiene descargas ni valoraciones, y su licencia no está indicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política neuronal (codificador visual + cabeza de política/valor) entrenada con APPO sobre Sample Factory; topología concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de refuerzo; la entrada son observaciones por fotograma, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Sample Factory sobre PyTorch (el repositorio indica que se incluye el checkpoint entrenado; extensión y estructura exactas no confirmadas) |
| Algoritmo | APPO (Asynchronous Proximal Policy Optimization) |
| Libreria | sample-factory |
| Framework | PyTorch |
| Entorno | `doom_health_gathering_supreme` (ViZDoom) |
| Espacio de acciones | no disponible en la ficha (el escenario de ViZDoom emplea acciones discretas) |
| Hardware de entrenamiento | Google Colab (según la model card) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La política se entrena con APPO, la variante asíncrona de PPO que Sample Factory implementa para entrenamiento de agentes a partir de píxeles con alto rendimiento. Este tipo de implementaciones desacoplan la recolección de experiencia (workers de entorno que ejecutan la política en CPU) de la optimización (pasos de gradiente batcheados en GPU), lo que permite sostener tasas de muestreo elevadas con un solo dispositivo. La información proporcionada no detalla la topología concreta de la red (número de capas convolucionales, tamaño de las capas fully connected, ni el número total de parámetros).

El entorno `doom_health_gathering_supreme` es un escenario de ViZDoom en el que el agente recibe observaciones visuales del motor del juego y debe sobrevivir recogiendo botiquines mientras el suelo u otras fuentes le restan salud. La recompensa está definida por el propio entorno; no se documentan en la información disponible técnicas adicionales como reward shaping, currículos de entrenamiento, aumento de datos ni procesos de ajuste tipo RLHF o DPO (que no aplican a este tipo de modelo). Tampoco se especifican el número de fotogramas consumidos, el tamaño de lote, la tasa de aprendizaje ni la semilla utilizada.

## Capacidades

- Control de agente a partir de observaciones visuales: la política procesa fotogramas del entorno ViZDoom y emite acciones discretas para moverse y recoger botiquines.
- Toma de decisiones secuenciales en un entorno con dinámica de recompensa continua y episodios con condición de terminación por salud o por tiempo.
- Evaluación reproducible dentro del ecosistema Sample Factory: puede cargarse con la misma librería con la que fue entrenado.
- Registro de métricas: el repositorio está etiquetado con `tensorboard`, por lo que se espera que el entrenamiento generase trazas de TensorBoard, aunque no se confirma que estén incluidas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente multi-paso orientadas a herramientas externas (el concepto de agente aquí se refiere a agente de RL, no a agentes basados en LLM).
- No dispone de capacidades multilingües ni de generación de texto, código, matemáticas, visión general o audio.
- No dispone de modo de razonamiento explícito (thinking mode) ni de salidas en lenguaje natural.

## Casos de uso

- Reproducción de resultados en cursos de RL: el checkpoint permite a un estudiante evaluar la política entrenada en la Unidad 8 del curso de Hugging Face sin repetir el entrenamiento completo, y comparar su propia implementación contra este resultado.
- Baseline para comparar algoritmos: puede usarse como referencia de partida frente a variantes de PPO síncrono u otros algoritmos en el mismo escenario, siempre que se fije la misma configuración de evaluación y número de episodios.
- Estudio de eficiencia de muestreo: al estar entrenado con APPO en Colab, resulta útil para analizar cuántas muestras requiere una configuración asíncrona frente a alternativas con recursos equivalentes.
- Punto de partida para ajuste fino: la política puede servir para experimentar con transferencia a escenarios ViZDoom relacionados (por ejemplo, variantes de recogida de salud) mediante reentrenamiento parcial.
- Validación de infraestructura de entrenamiento: sirve para comprobar que un clúster, contenedor o entorno de Colab reproduce correctamente el pipeline de Sample Factory antes de lanzar experimentos más costosos.
- Docencia y material de prácticas: puede incorporarse a cuadernos de laboratorio como ejemplo de política entrenada, para ilustrar evaluación con semillas fijas y medición de recompensa media.
- Investigación en robustez de políticas visuales: permite medir cómo se degrada el comportamiento al modificar parámetros del entorno (resolución, texturas, velocidad del motor) y evaluar la generalización de una política convolucional pequeña.
- Comparación de curvas de aprendizaje: dado que el escenario se usa habitualmente como prueba de concepto de RL visual, el checkpoint facilita generar gráficas comparativas de recompensa frente a pasos de entorno.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` del repositorio. El propio autor marca la métrica como no verificada.

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 5 | no |

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no aplican a un modelo de esta naturaleza. Tampoco se proporciona la curva de aprendizaje, el número de episodios de evaluación ni la desviación típica de la recompensa media.

## Requisitos de hardware

- VRAM para inferencia: no especificada por el autor. Para una política convolucional de ViZDoom de este tipo, la inferencia suele ejecutarse en CPU y, en GPU, ocuparía previsiblemente menos de 2 GB, pero es una estimación orientativa y no un dato confirmado.
- GPU recomendadas: el autor no indica ninguna. La model card menciona que el entrenamiento se hizo en Google Colab, lo que en la práctica implica una GPU de gama de entrada o media del catálogo de Colab.
- Cabe en GPU de consumo: con alta probabilidad sí, dado el tamaño reducido esperado de la red y el tamaño del repositorio (0,0 GB), aunque no hay confirmación oficial.
- Opciones de despliegue: carga del checkpoint mediante la librería Sample Factory. No se documentan en el repositorio exportaciones a GGUF, ONNX, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La velocidad de inferencia depende del coste del propio entorno ViZDoom, no solo de la red.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables en la información proporcionada. La comparación se limita a aspectos cualitativos.

| Modelo / implementación | Algoritmo | Entorno | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (marvameraj) | APPO (Sample Factory) | doom_health_gathering_supreme | 5 (no verificado) | no disponible | checkpoint en Hugging Face |
| APPO de Sample Factory (referencia de la librería) | APPO | ViZDoom (varios escenarios) | no disponible | MIT (licencia de la librería) | repositorio público de la librería |
| PPO de Stable-Baselines3 | PPO | ViZDoom (varios escenarios) | no disponible | MIT (licencia de la librería) | repositorio público de la librería |
| RLlib (Ray) con PPO/APPO | PPO / APPO | ViZDoom (varios escenarios) | no disponible | Apache 2.0 (licencia de la librería) | repositorio público de la librería |

Las licencias indicadas corresponden a las librerías, no a checkpoints concretos, y no implican que existan políticas publicadas equivalentes para este escenario.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explícita, el uso comercial del checkpoint queda en un limbo legal; conviene contactar con el autor antes de cualquier uso en producción.
- Métrica no verificada: el valor de recompensa media (5) está declarado por el autor con `verified: false`, sin curva de aprendizaje ni protocolo de evaluación detallado.
- Repositorio de 0,0 GB: el tamaño reportado sugiere que el checkpoint es muy pequeño o que los ficheros grandes no se han subido. Debe comprobarse la lista de archivos antes de asumir que el modelo es utilizable.
- Ausencia de validación comunitaria: cero descargas y cero valoraciones, por lo que no hay evidencia externa de que la política funcione o se cargue correctamente.
- Especialización extrema: la política está ajustada a un único escenario de ViZDoom. No se espera generalización a otros entornos, tareas o dominios sin reentrenamiento.
- Riesgo de sobreajuste al entorno: no se documentan técnicas de regularización, aumento de datos ni evaluación con semillas múltiples, de modo que el rendimiento real puede variar entre episodios.
- Sin información sobre sesgos: en RL visual, los sesgos relevantes son los derivados de las texturas, la iluminación y la distribución de mapas del escenario; no hay análisis publicado al respecto.
- No apto para tareas de lenguaje o generación: no debe emplearse como sustituto de un LLM ni para responder preguntas, generar texto o código.
- Limitación de despliegue: al depender del ecosistema Sample Factory, la integración en otros pipelines requiere trabajo adicional de conversión no documentado.
- Aviso de contenido: la model card del autor se ha utilizado únicamente como material de referencia; su contenido no debe interpretarse como instrucciones de ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marvameraj/rl_course_vizdoom_health_gathering_supreme
- Sample Factory (repositorio de la librería): https://github.com/alex-petrenko/sample-factory
- Paper de Sample Factory (ICML 2020, "Sample Factory: Egocentric 3D Control from Pixels at 100000 FPS with Asynchronous Reinforcement Learning"): https://arxiv.org/abs/2006.11751
- ViZDoom (entorno y documentación): https://vizdoom.cs.put.edu.pl/
- Curso de Deep Reinforcement Learning de Hugging Face, Unidad 8: https://huggingface.co/learn/deep-rl-course/unit8/introduction
