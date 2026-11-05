# Niiizzy/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene una política de aprendizaje por refuerzo profundo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario Niiizzy en Hugging Face como parte de un curso de RL, y está pensado para ejecutarse y reentrenarse con Sample-Factory 2.0, la librería de referencia del autor del algoritmo (Alex Petrenko). No es un modelo de lenguaje: es un agente que juega a un escenario concreto de Doom en primera persona.

El entorno `health_gathering_supreme` es un escenario de ViZDoom en el que el agente debe recoger packs de salud mientras esquiva bolas de fuego, con recompensa escasa y horizonte de decisión corto. La política aprende una representación visual directa de los píxeles del juego y produce acciones discretas de movimiento y giro. El resultado declarado es una recompensa media de 10,96 ± 4,18, un dato que indica que el agente completa el escenario de forma consistente pero con varianza apreciable entre episodios.

Su relevancia es fundamentalmente didáctica: sirve como ejemplo reproducible de un pipeline completo de RL (entrenamiento, evaluación, carga desde el Hub y reanudación) con Sample-Factory. El tamaño del repositorio (0,1 GB) corresponde a los pesos de la red y los checkpoints, no a un modelo generativo de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional + política/crítica para RL (algoritmo APPO sobre Sample-Factory 2.0); detalles de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de Sample-Factory (no safetensors ni GGUF); tamaño del repo 0,1 GB |

## Arquitectura y entrenamiento

El agente se entrena con APPO, una variante asíncrona de PPO que combina actores y aprendices desacoplados mediante una cola de experiencias, lo que permite escalar el muestreo y la actualización de gradientes de forma independiente. La política consume observaciones visuales del entorno ViZDoom (frames renderizados del juego) y emite acciones discretas; el crítico estima el valor del estado para calcular las ventajas. La implementación concreta de la red (número de capas convolucionales, tamaño de las capas recurrentes, etc.) no se detalla en la información disponible.

El entrenamiento se realizó sobre el entorno `doom_health_gathering_supreme`, un escenario de recompensa escasa en el que el agente debe navegar y recoger objetos de salud mientras evita proyectiles. No se documentan el número de pasos de entorno, la composición del dataset (en RL no hay dataset estático, sino experiencias generadas por interacción), ni si se aplicaron técnicas adicionales como reward shaping o curriculum learning. La model card indica únicamente que el modelo se entrenó con Sample-Factory 2.0 y ofrece los comandos para descargarlo, evaluarlo y reanudar el entrenamiento.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme` mediante acciones discretas.
- Procesamiento de observaciones visuales (frames del juego) como entrada de la política.
- Ejecución de políticas entrenadas con APPO a través del script `enjoy` de Sample-Factory.
- Reanudación del entrenamiento desde el checkpoint publicado con `--restart_behavior=resume`.
- Carga y publicación en el Hugging Face Hub mediante `sample_factory.huggingface.load_from_hub`.
- Registro de métricas de entrenamiento compatibles con TensorBoard (tag `tensorboard`).
- No soporta tool calling, function calling, agentes multi-paso en lenguaje natural, capacidades multilingües ni modos de razonamiento tipo thinking. No es un modelo multimodal ni generativo de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio sirve como ejemplo funcional de un agente APPO entrenado, con comandos listos para descargar, evaluar y reanudar, lo que permite a estudiantes reproducir el flujo completo en clase.
- Reproducción de experimentos: investigadores pueden cargar el checkpoint y verificar la recompensa media declarada (10,96 ± 4,18) para contrastar la variabilidad entre ejecuciones y sembrar comparaciones con sus propias políticas.
- Punto de partida para fine-tuning: el comando de reanudación con `--restart_behavior=resume` permite continuar el entrenamiento con hiperparámetros distintos (learning rate, número de actores, etc.) y medir el efecto sobre la recompensa.
- Evaluación de infraestructura de RL: al ser un entorno liviano (repo de 0,1 GB), es útil para validar pipelines de entrenamiento distribuido con Sample-Factory antes de escalar a entornos más costosos.
- Benchmarking de algoritmos: puede emplearse como línea base APPO frente a otras variantes (PPO, IMPALA) en el mismo escenario de ViZDoom para comparar estabilidad y sample efficiency.
- Integración en demos interactivas: el script `enjoy` permite renderizar el agente jugando en tiempo real, útil para material divulgativo o vídeos de presentación de resultados de RL.
- Estudio de robustez visual: al depender de píxeles, el agente puede someterse a perturbaciones en la observación (ruido, cambios de textura) para analizar la sensibilidad de políticas entrenadas con APPO.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 10,96 ± 4,18 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje y no aplica esa batería de evaluaciones.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,1 GB y la política es una red convolucional pequeña, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para inferencia; para reentrenamiento se recomienda al menos una RTX 3060/4090 o una A100/H100 si se escala el número de actores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con varios GB de VRAM; el cuello de botella es el renderizado del entorno ViZDoom, no la red.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), con soporte de carga desde el Hub mediante `sample_factory.huggingface.load_from_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Niiizzy/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | 10,96 ± 4,18 | no disponible | Hugging Face |
| Políticas APPO de referencia de Sample-Factory | APPO | ViZDoom (varios escenarios) | no disponible en esta ficha | MIT (Sample-Factory) | GitHub / Hub |
| Políticas PPO/IMPALA comparables en ViZDoom | PPO / IMPALA | doom_health_gathering_supreme | no disponible en esta ficha | variable | no disponible |

No se dispone de datos verificables de modelos alternativos en la información proporcionada; la comparación cuantitativa con otras políticas del mismo escenario queda pendiente de fuentes externas.

## Limitaciones y advertencias

- Específico de un único entorno: la política está entrenada para `doom_health_gathering_supreme` y no generaliza a otros escenarios ni tareas sin reentrenamiento.
- Varianza alta: la recompensa declarada tiene una desviación de ±4,18 sobre una media de 10,96, lo que indica comportamiento inconsistente entre episodios.
- Resultados no verificados: la métrica de la model card está marcada como `verified: false`; conviene reproducirla antes de usarla como referencia.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial es incierto y requiere contactar con el autor.
- Sin documentación de sesgos ni de robustez: no se han publicado análisis de sensibilidad a perturbaciones visuales, cambios de textura o condiciones de iluminación.
- Sin idiomas ni texto: no procesa lenguaje natural, por lo que no aplican evaluaciones de sesgo lingüístico ni de alucinación en el sentido habitual.
- Dependencia de la versión de Sample-Factory: los comandos de la model card asumen Sample-Factory 2.0; versiones distintas pueden requerir ajustes.
- Repositorio de autor único y con 0 descargas: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Niiizzy/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
- Entorno ViZDoom: no disponible en la información proporcionada
- Paper de APPO: no disponible en la información proporcionada
