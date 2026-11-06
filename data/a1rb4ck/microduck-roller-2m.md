# a1rb4Ck/microduck-roller-2m

## Resumen

microduck-roller-2m es un modelo de aprendizaje por refuerzo (reinforcement learning) publicado por el usuario a1rb4Ck en Hugging Face, concebido como entrada para la competición microduck arena bajo la modalidad "roller-sprint-2m". No se trata de un modelo de lenguaje, sino de una política de control entrenada para un robot con ruedas (un "duck on wheels", es decir, un microduck con ruedas en lugar de patas). El modelo resuelve la tarea de locomoción rodante en un entorno de simulación, y su relevancia es acotada al ecosistema de la competición microduck: sirve como referencia reproducible para los cinco seeds oficiales del certamen.

La model card es explícita sobre las limitaciones: el autor indica que el robot, diseñado originalmente para caminar, no mostró predisposición a rodar y pasó la mayor parte del entrenamiento intentando andar de todos modos. La política se compone de una red MLP para la marcha (gait) más tablas específicas para cada uno de los cinco seeds oficiales. Fuera de esos seeds, el modelo "va por su cuenta", lo que en la práctica significa que su comportamiento no está garantizado.

No se dispone de información sobre arquitectura detallada, número de parámetros, contexto, idiomas ni datos de entrenamiento más allá de lo indicado. El modelo se distribuye bajo licencia Apache 2.0 y la librería asociada es `microduck`. El número de descargas y likes es cero en el momento de la consulta, lo que refleja su carácter de contribución reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP para la marcha (gait) más tablas específicas por seed; política de RL para robot rodante |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería `microduck`) |

## Arquitectura y entrenamiento

La información disponible describe una política compuesta por una red MLP que gobierna la marcha (gait) del robot, complementada con tablas específicas para cada uno de los cinco seeds oficiales de la competición microduck arena. El pipeline declarado en Hugging Face es `reinforcement-learning`, y las etiquetas incluyen `robotics`, `microduck` y `microduck-arena`. No se especifican el número de capas, las dimensiones de las capas ocultas, la función de recompensa, el algoritmo de RL empleado (PPO, SAC, etc.), el número de pasos de entrenamiento ni la composición del entorno de simulación.

El autor menciona que el modelo parte de tablas desarrolladas por jrubiosainz (remix12) y por "el resto de la comunidad roller", lo que sugiere un entrenamiento incremental o derivado sobre artefactos previos de la competición. No se documenta si hubo fases de ajuste fino, currículo de entrenamiento o técnicas de dominio aleatorio. Tampoco se indica si el modelo incorpora innovaciones técnicas destacables más allá de la combinación MLP + tablas por seed.

## Capacidades

- Control de locomoción rodante de un robot microduck con ruedas en el entorno de simulación de microduck arena.
- Ejecución de la política de marcha (gait) mediante una red MLP entrenada por refuerzo.
- Comportamiento especializado para los cinco seeds oficiales de la competición, gracias a las tablas asociadas a cada uno.
- Reproducibilidad de resultados en los seeds oficiales, lo que permite comparar la entrada con otras del certamen.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo "thinking"; no aplican a este tipo de modelo.
- Fuera de los seeds oficiales, el comportamiento no está garantizado y el modelo "va por su cuenta", según el autor.

## Casos de uso

- Participación en la competición microduck arena: el modelo sirve como entrada oficial en la modalidad roller-sprint-2m, ejecutando la política entrenada sobre los cinco seeds del certamen y permitiendo comparar su rendimiento con otras entradas.
- Reproducción de resultados de referencia: al estar asociado a seeds concretos, permite a otros participantes replicar exactamente las condiciones de evaluación y verificar métricas de sprint rodante.
- Estudio de políticas híbridas MLP + tablas: investigadores interesados en cómo combinar una red neuronal de gait con tablas discretas por seed pueden usar este modelo como caso de estudio concreto.
- Análisis de transferencia de locomoción caminante a rodante: el autor documenta que el robot, diseñado para caminar, intentó andar durante el entrenamiento; el modelo es útil para estudiar ese sesgo y sus efectos en el comportamiento final.
- Base para ajuste fino en la comunidad roller: al apoyarse en tablas de jrubiosainz (remix12) y de otros miembros, puede servir como punto de partida para nuevas entradas que modifiquen la política o el entorno.
- Docencia y divulgación sobre RL aplicado a robótica de bajo coste: el modelo ilustra un pipeline completo (entorno, recompensa, política, evaluación por seeds) en un dominio acotado y comprensible.
- No se documentan casos de uso fuera del ámbito de la competición microduck; el modelo no es adecuado para tareas de lenguaje, visión ni generación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de sprint, tiempos, distancias ni comparaciones numéricas con otras entradas de la competición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política MLP con tablas, la huella de memoria previsiblemente es muy reducida, pero no se publican cifras.
- GPU recomendadas: no disponible. No se especifica si el entrenamiento o la inferencia requieren GPU.
- ¿Cabe en GPU de consumo? No disponible; por la naturaleza del modelo (MLP + tablas), es plausible que sí, pero no está documentado.
- Opciones de despliegue: la librería declarada es `microduck`; no se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que además no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras entradas de la competición microduck arena con las que comparar parámetros, contexto, rendimiento o licencia. Las tablas de jrubiosainz (remix12) y de "el resto de la comunidad roller" se mencionan como base, pero no se detallan sus características ni se ofrecen métricas comparables.

## Limitaciones y advertencias

- El propio autor advierte que el robot, diseñado para caminar, no mostró predisposición a rodar y dedicó la mayor parte del entrenamiento a intentar andar; esto puede reflejarse en un comportamiento rodante subóptimo.
- El modelo está especializado en los cinco seeds oficiales; fuera de ellos, el comportamiento no está garantizado ("anywhere else it's on its own").
- No se documentan sesgos conocidos, pero al ser una política entrenada en simulación, cabe esperar una brecha sim-to-real no cuantificada.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de lenguaje.
- No se especifican limitaciones de contexto ni de idioma porque no aplican a este tipo de modelo.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan condiciones adicionales de la competición microduck arena que puedan restringir el uso de las entradas.
- No se publican métricas de rendimiento, por lo que no es posible evaluar su calidad relativa frente a otras entradas sin ejecutarlo en el entorno oficial.
- La ausencia de descargas y likes (0 en ambos) indica que el modelo no ha sido validado por la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a1rb4Ck/microduck-roller-2m
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
