# Avinash76812/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) para resolver el escenario `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario Avinash76812 como entrega de la Unidad 8 (Parte 2) del curso Deep Reinforcement Learning de Hugging Face, y se ha entrenado con Sample Factory 2.0. No es un modelo de lenguaje: es una política neuronal que consume fotogramas RGB del juego y emite acciones discretas.

El problema que resuelve es un entorno de supervivencia con recompensa densa: el agente se mueve por una arena rectangular con suelo ácido que inflige daño periódico y debe recoger botiquines para prolongar su vida. El espacio de acciones es discreto (girar a la izquierda, girar a la derecha, avanzar), la recompensa por paso vivo es +1 y la muerte penaliza con -100, de modo que la estrategia óptima combina navegación, gestión de recursos y evitación de daño.

Su relevancia es fundamentalmente docente y de investigación: sirve como referencia reproducible de APPO sobre observaciones visuales, como línea base para comparar algoritmos de RL profundo y como ejemplo mínimo de carga y evaluación de checkpoints de Sample Factory desde el Hub. El autor declara una recompensa media de 12,50 ± 3,20, por encima del umbral de aprobado del curso (5,0), aunque la métrica no está verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente de aprendizaje por refuerzo profundo con APPO (actor-crítico, PPO asíncrono); topología concreta de la red no disponible en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones de píxeles del screen buffer RGB) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones del checkpoint) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explícita; repositorio gestionado con la librería `sample-factory` (checkpoint de entrenamiento y logs de TensorBoard, 0,1 GB) |

Otros datos del repositorio: pipeline declarado `reinforcement-learning`, etiquetas `deep-reinforcement-learning`, `reinforcement-learning`, `sample-factory`, `tensorboard`, `model-index`, `region:us`, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

APPO es una variante asíncrona de PPO en la que varios workers generan experiencia en paralelo mientras el learner actualiza la política, lo que permite alto rendimiento de muestreo en un único nodo. El agente es de tipo actor-crítico y trabaja sobre observaciones de píxeles (screen buffer RGB) con un espacio de acciones discreto de tres elementos: girar a la izquierda, girar a la derecha y avanzar. La model card no detalla el número de capas, canales, funciones de activación ni el tamaño del vector latente, por lo que la arquitectura interna exacta queda como dato no disponible.

El entrenamiento se realizó con Sample Factory 2.0 sobre el escenario `doom_health_gathering_supreme` de ViZDoom. La dinámica del entorno combina recompensa por supervivencia (+1 por paso), penalización por muerte (-100) y recogida de botiquines para contrarrestar el daño del suelo ácido. No se documentan en la información disponible el número de pasos de entorno, el tamaño de lote, la tasa de aprendizaje, el uso de normalización de recompensas ni técnicas adicionales como currículos o recompensas auxiliares. No se menciona RLHF ni DPO, algo esperable porque la optimización es puramente por recompensa escalar del entorno, no a partir de preferencias humanas.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme` mediante una política que produce una de tres acciones discretas por paso.
- Percepción visual directa desde píxeles RGB del screen buffer, sin extracción de características manual.
- Aprendizaje de una política de supervivencia con recompensa densa: maximizar pasos vivos, recolectar botiquines y esquivar el terreno ácido.
- Ejecución y visualización mediante `sample_factory.enjoy`, lo que permite inspeccionar el comportamiento del agente en tiempo real.
- No dispone de generación de texto, razonamiento simbólico, matemáticas ni código: es un agente de control, no un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta orquestación de agentes en el sentido de los LLM (planificación multi-paso con herramientas externas); su "razonamiento" se limita a la política aprendida sobre el estado visual.
- No tiene capacidades multilingües ni procesamiento de audio, imagen general o vídeo fuera del bucle de observación del entorno.
- No dispone de modo "thinking" ni de modos de razonamiento explícitos.

## Casos de uso

- Docencia de aprendizaje por refuerzo: la Unidad 8 del curso de Hugging Face puede reproducirse cargando el checkpoint con `sample_factory.huggingface.load_from_hub` y ejecutando `sample_factory.enjoy`, lo que permite al alumnado comprobar de forma tangible el resultado de entrenar APPO sobre píxeles.
- Línea base para comparación de algoritmos: sirve como referencia de APPO en un escenario con recompensa densa frente a PPO estándar, IMPALA o R2D2 en experimentos de investigación reproducibles.
- Estudio de robustez visual: al consumir directamente píxeles RGB, es útil para analizar sensibilidad a perturbaciones de imagen (cambios de textura, ruido, oclusiones) y su efecto en la recompensa media.
- Experimentos de generalización: entrenar variantes con cambios en la disposición de obstáculos o en la tasa de daño del suelo ácido permite medir cuánto sobreajusta el agente a la configuración original del escenario.
- Ajuste fino y curriculum learning: el checkpoint puede servir como inicialización para escenarios más difíciles de ViZDoom (por ejemplo, `deathmatch` o versiones con menos botiquines) y reducir el coste de entrenamiento desde cero.
- Demostraciones de infraestructura: validar pipelines de despliegue de Sample Factory en clúster (carga de checkpoints desde el Hub, monitorización con TensorBoard, generación de vídeos de replay) como paso previo a experimentos mayores.
- Reproducción de resultados de forma independiente: el repositorio permite verificar la métrica declarada (12,50 ± 3,20) y evaluar su varianza con distintas semillas, algo especialmente relevante al estar la métrica marcada como no verificada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (métrica no verificada, `verified: false`):

| Algoritmo | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12,50 ± 3,20 | no |

Datos derivados que figuran en la model card:

| Métrica | Valor |
|---|---|
| Resultado (media - desviación típica) | 9,30 |
| Requisito de aprobado del curso | ≥ 5,0 |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo, ni comparaciones numéricas con agentes alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras oficiales de memoria.
- Consideración general (no confirmada por el autor): se trata de una política convolucional sobre observaciones de píxeles, no de un modelo de lenguaje, y el repositorio completo ocupa 0,1 GB, por lo que el checkpoint es de escala reducida y la inferencia no debería exigir GPU de gama alta.
- GPU recomendadas: no disponibles. Sample Factory 2.0 está optimizado para entrenamiento en una única GPU, pero no se especifica el modelo concreto utilizado en este entrenamiento.
- ¿Cabe en GPU de consumo? No se documenta. Por el tamaño del repositorio, es plausible que sí, pero es una inferencia, no un dato publicado.
- Latencia y throughput: no disponibles.
- Opciones de despliegue: las indicadas en la model card, ambas basadas en Sample Factory:
  - Carga del modelo: `python -m sample_factory.huggingface.load_from_hub -r Avinash76812/rl_course_vizdoom_health_gathering_supreme`
  - Ejecución del agente: `python -m sample_factory.enjoy --env=doom_health_gathering_supreme --experiment=rl_course_vizdoom_health_gathering_supreme --train_dir=train_dir`
- Dependencias: Sample Factory y ViZDoom instalados, más el stack de PyTorch asociado. No se contemplan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI porque no aplican a un agente de RL.

## Comparativa con modelos similares

No se han encontrado en la información disponible datos publicados de agentes comparables (mismo algoritmo, mismo escenario o mismo curso) que permitan una comparación numérica rigurosa. La comparativa se limita a lo declarado por el autor.

| Modelo | Algoritmo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | APPO (Sample Factory 2.0) | doom_health_gathering_supreme | mean_reward 12,50 ± 3,20 | no disponible | Hugging Face Hub, 0 descargas, 0 likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El único punto de referencia objetivo disponible es el umbral de aprobado del curso (recompensa media - desviación típica ≥ 5,0), que este agente supera con 9,30.

## Limitaciones y advertencias

- Métrica no verificada: el propio `model-index` marca el resultado como `verified: false`; los 12,50 ± 3,20 proceden únicamente del autor.
- Varianza elevada: la desviación típica de 3,20 sobre una media de 12,50 implica un comportamiento muy variable entre episodios; la media menos la desviación (9,30) queda relativamente cerca del umbral de 5,0.
- Sobreajuste al escenario: es un agente especializado en un único entorno con observaciones RGB concretas; no hay evidencia de transferencia a otros escenarios de ViZDoom ni a otros dominios.
- Sin capacidades de lenguaje: no genera texto, no responde a instrucciones en lenguaje natural, no soporta tool calling ni agentes multi-paso al estilo LLM. Cualquier caso de uso conversacional queda fuera de su alcance.
- Riesgo de sobreestimación de rendimiento: la métrica es una recompensa media en un entorno estocástico; no se documentan protocolos de evaluación, número de episodios ni semillas, por lo que la reproducibilidad no está garantizada.
- Licencia no disponible: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Ausencia de validación comunitaria: 0 descargas y 0 likes desde su publicación, sin informes externos de funcionamiento.
- Dependencia del entorno: la ejecución requiere ViZDoom y Sample Factory 2.0; cambios de versión en cualquiera de las dos dependencias pueden romper la carga del checkpoint.
- Sesgos: no se documenta ningún análisis de sesgos. En este tipo de agente el riesgo relevante no es sesgo social sino explotación de artefactos del simulador (por ejemplo, políticas que maximizan recompensa mediante comportamientos degenerados que no generalizan).
- Artefactos de visualización: el repositorio incluye un archivo `replay.mp4` generado por el autor; un vídeo de replay no constituye evidencia cuantitativa del rendimiento medio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avinash76812/rl_course_vizdoom_health_gathering_supreme
- Sample Factory 2.0 (repositorio de la librería de entrenamiento): https://github.com/alex-petrenko/sample-factory
- Curso Deep Reinforcement Learning de Hugging Face: https://huggingface.co/learn/deep-rl-course
- ViZDoom (entorno de los escenarios de Doom): https://github.com/Farama-Foundation/ViZDoom
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo ni sobre su escenario; los enlaces obtenidos correspondían a servicios de mensajería sin relación con el contenido de la ficha y se han descartado.
