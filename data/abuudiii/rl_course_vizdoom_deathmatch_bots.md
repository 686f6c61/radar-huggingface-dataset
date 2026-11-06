# Abuudiii/rl_course_vizdoom_deathmatch_bots

## Resumen

`Abuudiii/rl_course_vizdoom_deathmatch_bots` es un checkpoint de aprendizaje por refuerzo profundo publicado en Hugging Face Hub, no un modelo de lenguaje. Se trata de una política entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_deathmatch_bots`, un escenario de combate deathmatch de ViZDoom utilizado habitualmente en cursos de reinforcement learning. El autor es el usuario Abuudiii y el artefacto se generó con Sample-Factory 2.0, la librería de referencia de Alex Petrenko para RL distribuido asíncrono.

El modelo resuelve una tarea concreta: controlar un agente en un entorno de disparos en primera persona a partir de observaciones visuales y recompensas escalares. No ofrece generación de texto, razonamiento simbólico ni capacidades multimodales en el sentido de los LLM; su salida es una distribución de acciones sobre el espacio de acciones de ViZDoom. Su relevancia es fundamentalmente didáctica y de reproducibilidad: permite cargar una política entrenada, evaluarla con el script `enjoy` de Sample-Factory y reanudar el entrenamiento desde el checkpoint.

El repositorio ocupa aproximadamente 0,1 GB, cuenta con 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas. El resultado declarado en la model card es un `mean_reward` de 0,00 ± 0,00, lo que sugiere que el checkpoint no completó un entrenamiento exitoso o que la métrica se registró antes de obtener señal de recompensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de deep RL entrenada con APPO (Sample-Factory 2.0); topología interna no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno ViZDoom; ventana de observación definida por la configuración del entorno, no declarada) |
| Tipos de cuantizacion | no disponible (no se publican pesos en formatos cuantizables tipo GGUF; checkpoint de Sample-Factory) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de Sample-Factory (directorio de entrenamiento con pesos y estado del optimizador), cargable vía `sample_factory.huggingface.load_from_hub` |

## Arquitectura y entrenamiento

El artefacto es una política entrenada con APPO, un algoritmo on-policy asíncrono que combina PPO con workers de inferencia y aprendizaje desacoplados, tal como lo implementa Sample-Factory 2.0. La arquitectura exacta de la red (codificador visual, capas recurrentes, tamaño de las capas) no se detalla en la model card; Sample-Factory utiliza por defecto codificadores convolucionales para observaciones de píxeles y capas recurrentes para el historial, pero la configuración concreta de este experimento no está publicada.

El entorno es `doom_deathmatch_bots`, un escenario de ViZDoom en el que el agente combate contra bots controlados por el juego. No se documentan el número de pasos de entorno, la composición del dataset (en RL no hay dataset supervisado, sino interacción con el simulador), ni si hubo ajuste fino posterior. No se declara ninguna innovación técnica adicional más allá del uso del stack Sample-Factory. El resultado de `mean_reward` de 0,00 ± 0,00 indica que, según la propia model card, la política no obtuvo recompensa media positiva en la evaluación registrada.

## Capacidades

- Control de agente en un entorno de disparos en primera persona (ViZDoom, escenario `doom_deathmatch_bots`) a partir de observaciones del entorno.
- Aprendizaje por refuerzo on-policy con APPO, apto para reanudar entrenamiento desde el checkpoint.
- Evaluación reproducible mediante el script `enjoy` de Sample-Factory.
- Carga y publicación en Hugging Face Hub mediante la integración nativa de Sample-Factory (`load_from_hub`, `--push_to_hub`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes basados en LLM.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No tiene visión en el sentido de comprensión de imágenes arbitrarias; consume observaciones del simulador ViZDoom.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Docencia de reinforcement learning: el checkpoint sirve como ejemplo práctico de un experimento APPO en Sample-Factory, permitiendo al alumnado cargarlo, inspeccionar la configuración y comparar curvas de entrenamiento en TensorBoard.
- Reproducción de experimentos: un investigador puede descargar el checkpoint con `load_from_hub` y reanudar el entrenamiento con `--restart_behavior=resume`, verificando si el resultado declarado (recompensa 0,00) se reproduce en su hardware.
- Punto de partida para ajuste fino: dado que el modelo está en un estado de recompensa nula, puede usarse como inicialización para continuar el entrenamiento con hiperparámetros corregidos y medir la mejora.
- Evaluación de infraestructura de RL distribuido: sirve para validar pipelines de Sample-Factory, comprobar el rendimiento de workers asíncronos y verificar la integración con Hugging Face Hub antes de lanzar experimentos costosos.
- Benchmarking de entornos ViZDoom: permite comparar la dificultad del escenario `doom_deathmatch_bots` frente a otros entornos de la suite y calibrar expectativas de recompensa.
- Pruebas de integración CI/CD para proyectos de RL: al ser un artefacto pequeño (0,1 GB), es adecuado para tests automáticos que verifiquen que la carga del modelo, la creación del entorno y la ejecución de un episodio funcionan en un contenedor.
- Material de auditoría de model cards: útil como caso de estudio sobre cómo declarar (o no) métricas verificadas y licencias en artefactos de RL publicados en el Hub.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Tarea | Dataset/entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|---|
| APPO | reinforcement-learning | doom_deathmatch_bots | mean_reward | 0,00 ± 0,00 | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un checkpoint pequeño, pero no se especifica el número de parámetros ni la arquitectura, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. Sample-Factory soporta ejecución en CPU y GPU; para entrenamiento distribuido se suelen emplear GPUs dedicadas, pero la model card no indica ninguna.
- Compatibilidad con GPU de consumo: probablemente sí para inferencia dado el tamaño del artefacto, pero no confirmado por el autor.
- Opciones de despliegue: Sample-Factory (`enjoy` y `train`), con integración de Hugging Face Hub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Abuudiii/rl_course_vizdoom_deathmatch_bots | Política RL | doom_deathmatch_bots | APPO | 0,00 ± 0,00 | no disponible | Hugging Face Hub |
| Checkpoints APPO de Sample-Factory para ViZDoom (otros autores) | Política RL | Escenarios ViZDoom | APPO | no disponible en esta consulta | variable | Hugging Face Hub |
| Políticas RL de referencia en ViZDoom (literatura académica) | Política RL | ViZDoom | PPO/A3C/etc. | no disponible en esta consulta | variable | Repositorios académicos |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparativa anterior es estructural y no de rendimiento.

## Limitaciones y advertencias

- El resultado declarado de recompensa media es 0,00 ± 0,00, lo que indica que la política no aprendió una estrategia efectiva en el entorno según la propia model card; no debe usarse como referencia de rendimiento.
- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- No se declaran idiomas ni datos de sesgo; al no procesar lenguaje natural, los sesgos relevantes serían los del simulador ViZDoom y los bots del entorno, no documentados.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de sobreinterpretar el checkpoint como un agente competente cuando la métrica declarada es nula.
- El artefacto está atado a la versión de Sample-Factory 2.0 y a la configuración del entorno `doom_deathmatch_bots`; cambios de versión pueden romper la carga o la reproducción.
- No hay información sobre el número de pasos de entrenamiento, la configuración de hiperparámetros ni la semilla, lo que dificulta la reproducibilidad exacta.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K ni desplegarse en pipelines de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/Abuudiii/rl_course_vizdoom_deathmatch_bots
- Sample-Factory (repositorio): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
