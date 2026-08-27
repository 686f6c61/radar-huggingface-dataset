# roshana1s/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `roshana1s/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de VizDoom. Ha sido desarrollado por el usuario roshana1s como parte de un curso de RL, utilizando la librería Sample-Factory 2.0. El objetivo del agente es maximizar la recolección de paquetes de salud en un escenario 3D de disparos en primera persona, un problema clásico para evaluar políticas de control continuo con observaciones parcialmente observables.

La relevancia de este modelo radica en su carácter didáctico: es un ejemplo de entrenamiento de un agente RL en un entorno de videojuego con una recompensa escasa y esporádica, lo que exige un diseño cuidadoso de la función de recompensa y del algoritmo de optimización. Aunque no se trata de un modelo de lenguaje o visión de propósito general, su publicación en Hugging Face permite reproducir y comparar resultados dentro del ecosistema de Sample-Factory. No se dispone de información sobre la arquitectura interna, el número de parámetros ni la longitud de contexto, ya que la model card no los detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente RL basado en red neuronal, probablemente convolucional + recurrente, pero no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (entorno de observaciones parciales, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene pesos de Sample-Factory, probablemente en formato binario propio, pero no se especifica) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Se sabe que fue entrenado con el algoritmo APPO, una variante asíncrona de PPO implementada en Sample-Factory 2.0, que combina múltiples workers de recolección de experiencia con un optimizador central. El entorno `doom_health_gathering_supreme` de VizDoom presenta al agente una vista en primera persona y le recompensa por recoger paquetes de salud; el agente debe aprender a navegar y explorar el mapa de forma eficiente. No se especifican el número de pasos de entrenamiento, el tamaño del lote, la función de recompensa exacta ni si se aplicaron técnicas adicionales como normalización de ventajas o recorte de gradiente. Tampoco se indica el número de parámetros ni la arquitectura de la red (convolucional, recurrente, etc.).

## Capacidades

- Control de un agente en un entorno 3D de VizDoom, específicamente la tarea de recolección de salud.
- Aprendizaje de políticas de navegación y exploración en un espacio de observaciones parcialmente observable.
- Optimización de recompensa acumulada mediante el algoritmo APPO.
- No es un modelo generativo de texto, código o visión; sus capacidades se limitan al entorno concreto para el que fue entrenado.
- No soporta tool calling, agentes conversacionales ni razonamiento multi-paso fuera del ámbito del juego.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el comportamiento de APPO en entornos de recompensa escasa, permitiendo comparar variantes de hiperparámetros o arquitecturas.
- Evaluación de algoritmos RL: al estar publicado en Hugging Face, puede utilizarse como referencia para validar implementaciones propias de PPO o APPO en VizDoom.
- Reproducción de experimentos docentes: el modelo forma parte de un curso de RL, por lo que es útil para que estudiantes verifiquen que sus agentes alcanzan un umbral mínimo de recompensa (por ejemplo, >= 5 en la tarea).
- Benchmarking de entornos de simulación: permite medir la dificultad del escenario `doom_health_gathering_supreme` y comparar el rendimiento de distintos agentes.
- Desarrollo de técnicas de exploración: al ser una tarea con recompensas espaciadas, es un banco de pruebas para métodos de exploración intrínseca o recuento de novedades.
- Integración en pipelines de entrenamiento distribuido: Sample-Factory soporta entrenamiento asíncrono, y este modelo puede servir como ejemplo de cómo cargar y reanudar entrenamiento desde un checkpoint.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado, sin verificación independiente:

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 11.48 +/- 5.18 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La métrica `mean_reward` corresponde a la recompensa media obtenida por episodio, y la desviación estándar indica una variabilidad considerable entre episodios.

## Requisitos de hardware

- No se dispone de información sobre requisitos de hardware específicos para este modelo.
- Dado que el repositorio ocupa 0.1 GB, es probable que el checkpoint sea pequeño (del orden de decenas de megabytes), por lo que la inferencia podría ejecutarse en CPU sin problemas.
- Para entrenar o reanudar el entrenamiento, se recomienda una GPU con al menos 4-8 GB de VRAM, aunque no se especifica.
- El despliegue se realiza mediante Sample-Factory, que ofrece scripts de `enjoy` para ejecutar el agente. No se menciona compatibilidad con vLLM, Ollama u otros frameworks de inferencia, ya que no es un modelo de lenguaje.
- La latencia dependerá del hardware; en una GPU moderna, la inferencia debería ser en tiempo real (varios cientos de FPS), pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos entrenados en el mismo entorno con los que comparar directamente. Existen otros repositorios en Hugging Face con el mismo nombre (por ejemplo, `Vishath/rl_course_vizdoom_health_gathering_supreme` o `b10401015/rl_course_vizdoom_health_gathering_supreme`), pero no se han publicado sus métricas ni detalles. Por tanto, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no es transferible a otras tareas sin reentrenamiento.
- La recompensa media declarada (11.48) tiene una desviación estándar alta (5.18), lo que indica que el rendimiento es muy variable entre episodios; no es un agente robusto en términos de consistencia.
- No se ha verificado de forma independiente el resultado del benchmark; el valor proviene del autor y puede no ser reproducible.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación. Se recomienda contactar con el autor antes de utilizarlo en proyectos productivos.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad, ya que no es un modelo de lenguaje.
- El entrenamiento se realizó con Sample-Factory 2.0; para cargar el modelo es necesario instalar esa librería y seguir los comandos indicados en la model card, lo que puede suponer una barrera técnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/roshana1s/rl_course_vizdoom_health_gathering_supreme
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Repositorio de Sample-Factory en GitHub: https://github.com/alex-petrenko/sample-factory
- Ejemplo de uso en el curso de RL de Hugging Face (notebook de la unidad 8): https://colab.research.google.com/github/huggingface/deep-rl-class/blob/master/notebooks/unit8/unit8_part2.ipynb
