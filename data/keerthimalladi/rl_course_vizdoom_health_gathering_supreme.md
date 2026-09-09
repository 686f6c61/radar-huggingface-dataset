# keerthimalladi/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `keerthimalladi/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Es un checkpoint generado con la librería Sample-Factory 2.0, desarrollado por el autor "keerthimalladi". El problema que resuelve es la optimización de la política de un agente en un juego 3D de disparos en primera persona, donde debe maximizar la recogida de objetos de salud y minimizar el daño recibido.

Se trata de un modelo de RL, no de un modelo de lenguaje: no genera texto ni ejecuta tareas de razonamiento simbólico. Su relevancia se limita al campo del aprendizaje por refuerzo, como punto de referencia para el entorno ViZDoom y para evaluar el algoritmo APPO. El repositorio ocupa 0.1 GB, pero no se detalla la arquitectura de la red ni el número de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de RL) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura de la red neuronal (por ejemplo, si es convolucional, recurrente o feed-forward) en la model card ni en el repositorio. El entrenamiento se realizó con el algoritmo APPO mediante la librería Sample-Factory 2.0, que está diseñada para la ejecución rápida de experimentos de RL.

El entorno `doom_health_gathering_supreme` forma parte de ViZDoom, un entorno de juegos 3D ampliamente utilizado en investigación. Al ser un modelo de RL, el proceso de entrenamiento se produce por interacción con el entorno, no con un dataset estático. No se informa del número de pasos de entrenamiento ni de los hiperparámetros utilizados. La recompensa media declarada por el autor es 10.20 ± 3.69, con un valor de verificación marcado como falso en la model card.

## Capacidades

- Control de un agente en el entorno `doom_health_gathering_supreme`: toma decisiones de acción a partir de observaciones visuales y de estado del juego.
- Optimización de recompensa acumulada: la política entrenada está orientada a maximizar la recogida de medidores de salud y a evitar daño.
- Guardado y reanudación de entrenamiento: el checkpoint permite continuar el entrenamiento o ejecutar una política ya entrenada mediante los scripts de Sample-Factory.
- Interoperabilidad con Sample-Factory: puede descargarse, ejecutarse y volver a subirse al Hub con las herramientas de la propia librería.
- No genera texto, no soporta tool calling, no es multilingüe y no tiene capacidades de visión generales más allá de las observaciones del entorno específico.

## Casos de uso

- Investigación en RL: se puede utilizar como baseline para comparar APPO con otros algoritmos en el entorno `doom_health_gathering_supreme`. Es adecuado porque el entorno es un benchmark estándar de ViZDoom y la recompensa declarada permite una comparación inicial.
- Evaluación de políticas: permite comprobar si cambios en el entorno, la recompensa o las semillas afectan al comportamiento del agente. Se carga el checkpoint con `sample_factory.huggingface.load_from_hub` y se ejecuta con el script `enjoy`.
- Docencia en aprendizaje por refuerzo: al ser un entorno visual 3D, resulta ilustrativo para estudiantes. Se puede mostrar el comportamiento del agente en tiempo real ejecutando el comando `enjoy` correspondiente.
- Desarrollo de agentes en entornos parcialmente observables: ViZDoom es un dominio POMDP; este agente sirve como ejemplo de política aprendida en un entorno con observaciones parciales.
- Pruebas de integración de Sample-Factory: el modelo puede usarse como prueba de humo para verificar que la instalación de la librería y del entorno funciona correctamente en un pipeline de CI/CD.
- Reproducción de resultados: ejecutando el modelo con la misma configuración y semilla se puede intentar verificar la métrica declarada (10.20 ± 3.69), útil para auditar la fiabilidad del resultado.

## Benchmarks y rendimiento

| Modelo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 10.20 ± 3.69 (no verificado) |

La recompensa está declarada por el autor del modelo y no ha sido verificada de forma independiente. No se presentan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware en la model card.
- El tamaño del repositorio es de 0.1 GB, por lo que el checkpoint es pequeño y cabe holgadamente en la memoria de la mayoría de GPUs.
- Puede ejecutarse en GPUs de consumidor (por ejemplo, RTX 3060 o GTX 1660) e incluso en CPU para la inferencia de un episodio.
- Para entrenamiento, Sample-Factory está pensado para ser eficiente en una sola GPU, pero no se especifican los requisitos mínimos exactos.
- Opciones de despliegue: ejecución mediante los scripts `enjoy` y `train` de Sample-Factory, con la instalación previa de ViZDoom y de la librería.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La recompensa declarada (10.20 ± 3.69) no está verificada; el campo `verified: false` en la model card implica que el valor no ha sido confirmado de forma independiente.
- El modelo está entrenado para un único entorno de ViZDoom y no generaliza a otros escenarios, ni a tareas de lenguaje, visión o razonamiento general.
- La licencia no está especificada. El uso comercial no está explícitamente autorizado y se requiere contactar con el autor para obtener más información.
- La arquitectura, los hiperparámetros y el número de pasos de entrenamiento no están documentados, lo que dificulta la reproducción exacta de los resultados.
- Para cargar y ejecutar el modelo es necesario disponer de versiones compatibles de Sample-Factory y ViZDoom; estas versiones no se indican en la documentación, lo que puede causar errores de compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keerthimalladi/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
