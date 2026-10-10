# naveenalavilli/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario naveenalavilli en Hugging Face como parte de la Unidad 8, parte II, del curso de aprendizaje por refuerzo profundo de Hugging Face, y se ha entrenado desde cero con asistencia de IA utilizando Sample-Factory 2.0, el framework de Alex Petrenko.

No es un modelo de lenguaje: no genera texto ni procesa instrucciones. Su función es recibir observaciones del entorno (frames del videojuego Doom) y emitir acciones discretas con el objetivo de recoger botellas de salud y sobrevivir el mayor tiempo posible, un problema clásico de control a partir de píxeles.

Su relevancia es principalmente docente y de investigación: constituye un ejemplo reproducible de un pipeline completo de RL (entrenamiento, evaluación con 30 episodios y publicación en el Hub) y un punto de partida para reanudar el entrenamiento o comparar algoritmos. El repositorio ocupa 0,1 GB, no tiene descargas ni likes y la licencia no está especificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible. Se trata de un agente de RL entrenado con APPO en Sample-Factory; la model card no detalla la topología de la red (en Sample-Factory los entornos ViZDoom suelen usar un codificador convolucional sobre observaciones visuales, pero no se confirma para esta ejecución) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL que consume observaciones del entorno, no secuencias de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible. La model card indica que se incluyen checkpoints y la configuración de entrenamiento, pero no especifica el formato (no se mencionan safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

APPO es la variante asíncrona de PPO implementada en Sample-Factory: varios *workers* recogen experiencia en paralelo de múltiples instancias del entorno mientras un proceso de aprendizaje actualiza los pesos, y el desfase entre la política que genera los datos y la que se entrena se corrige con técnicas de *importance sampling* y V-trace. El entorno es ViZDoom `doom_health_gathering_supreme`, donde el agente debe recoger botellas de salud y sobrevivir; la observación es visual y el espacio de acciones es discreto. La model card no especifica el número de capas, el tamaño del estado recurrente ni los hiperparámetros concretos.

El entrenamiento se realizó desde cero ("trained from scratch") con asistencia de IA, en el marco de la Unidad 8 parte II del curso de Hugging Face. No aplica el concepto de tokens de entrenamiento: los datos proceden de la interacción con el simulador, no de un corpus textual. Tampoco hay RLHF ni DPO, ya que el algoritmo es de gradiente de política sobre recompensa del entorno. La evaluación declarada se hizo sobre 30 episodios y el repositorio incluye la configuración de entrenamiento y los checkpoints, lo que permite reanudar el entrenamiento con `--restart_behavior=resume`.

## Capacidades

- Control a partir de píxeles: el agente procesa observaciones visuales del entorno ViZDoom y produce acciones discretas.
- Política específica de supervivencia y recogida de recursos en `doom_health_gathering_supreme`: maximizar botellas de salud recolectadas y el tiempo de supervivencia.
- Reanudación de entrenamiento: los checkpoints y la configuración incluidos permiten continuar el entrenamiento desde el punto en que se dejó.
- Evaluación reproducible: la model card documenta el script `enjoy` y la métrica declarada (`mean_reward` sobre 30 episodios).
- Publicación en el Hub: el flujo de trabajo con Sample-Factory permite subir nuevos modelos con el flag `--push_to_hub`.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso en lenguaje natural, ni capacidades multilingües, ni visión de propósito general: es un agente de RL de un único entorno.

## Casos de uso

- Material docente en cursos de RL profundo: sirve como ejemplo completo y reproducible de un experimento APPO sobre ViZDoom, con checkpoints, TensorBoard y métrica publicada, integrable en la Unidad 8 del curso de Hugging Face.
- Baseline de comparación en ViZDoom: permite medir el efecto de cambios de hiperparámetros, codificadores o algoritmos frente al resultado declarado de 9,84 ± 4,46 de recompensa media.
- Reanudación y *fine-tuning* del entrenamiento: partiendo de los checkpoints incluidos se puede continuar el entrenamiento con más pasos de entorno o con variantes del entorno, algo útil para estudiar convergencia y estabilidad.
- Estudio de robustez y varianza: con una desviación típica de 4,46 sobre una media de 9,84, el modelo es un caso práctico para analizar la varianza de la política, el número de episodios necesario para estimaciones fiables y técnicas de reducción de varianza.
- Validación de infraestructura de entrenamiento asíncrono: sirve para comprobar el correcto funcionamiento de pipelines de Sample-Factory (workers, *batched sampling*, checkpoints) antes de lanzar experimentos más costosos.
- Experimentos de exploración y memoria: al ser un entorno con estados parcialmente observables y necesidad de navegación, es un banco de pruebas para comparar arquitecturas recurrentes frente a no recurrentes.
- Demostraciones y visualización: el script `enjoy` permite generar vídeos o trazas del comportamiento del agente para publicaciones, clases o informes.

## Benchmarks y rendimiento

Datos declarados por el autor en el *model-index* de la model card (no verificados externamente):

| Algoritmo | Tarea | Entorno | Métrica | Valor | Episodios | Verificado |
|---|---|---|---|---|---|---|
| APPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 9,84 ± 4,46 | 30 | no |

No se han publicado en la información disponible resultados comparativos con otros modelos o algoritmos sobre este mismo entorno, ni métricas adicionales (longitud de episodio, tasa de éxito, recompensa máxima).

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publica ninguna medición de memoria, latencia ni *throughput*.
- GPU recomendadas: no disponible. Orientativamente, los agentes de ViZDoom en Sample-Factory emplean redes pequeñas sobre observaciones visuales de baja resolución, por lo que la inferencia no requiere aceleradores de gama alta como A100 o H100; se trata de una apreciación general del framework, no de un dato de este modelo.
- GPU de consumo: no disponible como dato confirmado. Orientativamente, tanto la inferencia como el entrenamiento de este tipo de agentes suelen ser viables en GPU de consumo e incluso en CPU para evaluación, aunque no hay confirmación para esta ejecución concreta.
- Opciones de despliegue: scripts de Sample-Factory (`enjoy` para evaluación, `train` con `--restart_behavior=resume` para continuar el entrenamiento) y carga desde el Hub con `python -m sample_factory.huggingface.load_from_hub`. No aplican vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje. No se documenta exportación a TorchScript, ONNX u otros formatos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables, y no se aportan datos de rendimiento de alternativas sobre `doom_health_gathering_supreme`. Se trata, además, de un nicho muy específico (checkpoints de RL para ViZDoom publicados por alumnos de cursos), donde no existen referencias estandarizadas de comparación en la model card.

## Limitaciones y advertencias

- Especificidad del entorno: el agente está entrenado exclusivamente para `doom_health_gathering_supreme`; no es transferible a otros juegos, tareas ni dominios sin reentrenamiento.
- Alta varianza en la métrica declarada: 9,84 ± 4,46 implica un coeficiente de variación de aproximadamente el 45 %; con 30 episodios, el error estándar de la media es de aproximadamente 0,81, por lo que el valor real puede diferir apreciablemente.
- Métrica no verificada: el propio *model-index* marca el resultado como `verified: false`; se trata de un dato declarado por el autor sin validación independiente.
- Licencia no especificada: al no indicarse licencia, no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Sin validación de la comunidad: 0 descargas y 0 *likes*, y fechas de creación y actualización de 2026-10-10, por lo que no existe evidencia de uso o revisión por terceros.
- Ausencia de documentación técnica: no se publican hiperparámetros, arquitectura exacta, número de pasos de entrenamiento ni curva de aprendizaje, lo que dificulta la reproducibilidad estricta.
- Sin información sobre sesgos: al no ser un modelo de lenguaje ni tratar datos humanos, no aplican sesgos demográficos, pero no se ha realizado ningún análisis de comportamiento fuera de la distribución del entrenamiento.
- Riesgo de sobreajuste al simulador: como en cualquier política entrenada en un único entorno, el comportamiento puede degradarse ante pequeñas modificaciones de la dinámica, la recompensa o la representación visual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naveenalavilli/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Documentación de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
- Entorno ViZDoom: https://vizdoom.cs.put.edu.pl/
- Paper de Sample-Factory: no disponible en la información proporcionada
- Demo o Space asociado: no disponible
