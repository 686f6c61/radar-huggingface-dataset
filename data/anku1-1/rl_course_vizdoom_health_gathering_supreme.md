# anku1-1/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario anku1-1 en Hugging Face, presumiblemente como material de un curso de reinforcement learning, tal como sugiere el identificador del modelo. No se trata de un modelo de lenguaje: es una política entrenada para jugar un escenario concreto de Doom, por lo que sus capacidades se limitan a la toma de decisiones en ese entorno.

El escenario `health_gathering_supreme` es un benchmark clásico en ViZDoom en el que el agente debe recoger botiquines mientras sobrevive a los ataques de enemigos, con una dificultad incrementada respecto a la variante estándar. El resultado declarado en la model card es una recompensa media de 10,74 con una desviación típica de 2,65, medida sobre el conjunto de evaluación del propio autor y sin verificación externa.

La relevancia de este artefacto es formativa y experimental: sirve como ejemplo reproducible de cómo entrenar y distribuir políticas con Sample-Factory 2.0 y cómo cargarlas desde el Hub. No compite con modelos de propósito general ni puede usarse fuera del entorno para el que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo entrenada con APPO (Sample-Factory 2.0); la topología concreta de la red no está especificada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un agente RL; el entorno ViZDoom define observaciones por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible; distribuido como checkpoint de Sample-Factory (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo se entrena con APPO, el algoritmo de optimización de política asíncrono implementado en Sample-Factory 2.0. APPO combina la recolección de experiencia en múltiples workers asíncronos con una actualización de política tipo PPO, lo que permite paralelizar el muestreo del entorno y estabilizar el entrenamiento en tareas con recompensas dispersas. La política consume observaciones visuales del entorno ViZDoom (`doom_health_gathering_supreme`) y produce acciones discretas del juego; la arquitectura exacta de la red (capas convolucionales, tamaño del estado recurrente, etc.) no se detalla en la model card.

No se especifican en la información disponible el número de pasos de entorno, la composición del dataset de entrenamiento ni si se aplicaron técnicas adicionales como recompensas conformadas o currículos. La model card únicamente documenta los comandos para descargar el checkpoint, ejecutarlo con el script `enjoy` y reanudar el entrenamiento con `--restart_behavior=resume`, lo que indica que el artefacto está pensado para ser continuado o evaluado dentro del ecosistema Sample-Factory.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme`: navegación y recogida de botiquines bajo ataque enemigo.
- Toma de decisiones a partir de observaciones visuales del juego, con la política entrenada de extremo a extremo.
- Reanudación del entrenamiento desde el checkpoint publicado, útil para experimentos de ajuste fino o curricula.
- Integración con el flujo de trabajo de Sample-Factory: descarga desde el Hub, evaluación con `enjoy` y subida con `--push_to_hub`.
- Registro de métricas en TensorBoard (tag `tensorboard`), lo que facilita el seguimiento de la recompensa media durante el entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües ni visión genérica fuera del entorno de Doom.

## Casos de uso

- Docencia en cursos de reinforcement learning: el checkpoint permite a los alumnos cargar una política ya entrenada, reproducir la evaluación y comparar curvas de aprendizaje sin tener que entrenar desde cero.
- Reproducción de experimentos: sirve como línea base de APPO en `health_gathering_supreme` para contrastar con variantes propias (cambios de hiperparámetros, recompensas o arquitectura).
- Punto de partida para ajuste fino: reanudar el entrenamiento con `--restart_behavior=resume` y `--train_for_env_steps` permite continuar la optimización sobre el mismo entorno.
- Pruebas de infraestructura de entrenamiento distribuido: al ser un entorno visual ligero, es útil para validar pipelines de Sample-Factory, workers asíncronos y registro en TensorBoard antes de escalar a tareas mayores.
- Evaluación de técnicas de robustez: el escenario `supreme` añade dificultad, por lo que el agente puede emplearse para estudiar la varianza de recompensa y la estabilidad de la política.
- Demostraciones de despliegue en el Hub: ejemplifica el ciclo completo de publicación y descarga de políticas con Sample-Factory y Hugging Face, útil en talleres prácticos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 10,74 +/- 2,65 |

No se han publicado en la información disponible resultados comparativos con otras políticas, curvas de aprendizaje ni métricas adicionales (por ejemplo, longitud de episodio o tasa de éxito).

## Requisitos de hardware

- El repositorio ocupa 0,1 GB, por lo que el checkpoint cabe holgadamente en cualquier GPU de consumo; la VRAM necesaria para inferencia es reducida (no disponible la cifra exacta).
- Para evaluación (`enjoy`) basta una GPU modesta; para entrenamiento continuado se recomienda una GPU dedicada (por ejemplo, RTX 3090/4090 o superiores) y, preferiblemente, varios workers para aprovechar el muestreo asíncrono de APPO.
- Cabe en GPUs de consumo como RTX 3060 en adelante para inferencia; el entrenamiento puede ejecutarse también en CPU, aunque con menor throughput.
- Despliegue mediante Sample-Factory 2.0 (`sample_factory.huggingface.load_from_hub` y scripts `enjoy`/`train`); no aplica a vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anku1-1/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | 10,74 +/- 2,65 | no disponible | Hugging Face |
| Otras políticas APPO de Sample-Factory para ViZDoom | APPO | variantes de ViZDoom | no disponible | no disponible | no disponible |
| Políticas RL para Atari (p. ej. PPO/APPO) | PPO/APPO | suites Atari | no disponible en esta información | variable | variable |

No se dispone de comparativas cuantitativas publicadas con modelos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica para un único entorno de ViZDoom; no generaliza a otras tareas ni a texto.
- La recompensa media de 10,74 +/- 2,65 tiene una desviación típica elevada, lo que sugiere alta varianza entre episodios; conviene evaluar con múltiples semillas.
- El resultado no está verificado de forma independiente (`verified: false` en la model card).
- Licencia no declarada: no puede asumirse permiso para uso comercial ni redistribución sin consultar al autor.
- No se documentan sesgos, pero al tratarse de un agente entrenado en un videojuego con contenido violento, su uso debe limitarse al ámbito educativo e investigador.
- No hay información sobre el número de pasos de entrenamiento, hiperparámetros ni composición de datos, lo que dificulta la reproducibilidad exacta.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni razonamiento en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anku1-1/rl_course_vizdoom_health_gathering_supreme
- Repositorio Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Documentación de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
