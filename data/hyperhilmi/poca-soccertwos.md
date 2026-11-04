# HyperHilmi/poca-SoccerTwos

## Resumen

`poca-SoccerTwos` es un modelo de aprendizaje por refuerzo entrenado con el algoritmo POCA (Policy Optimization with Clipped Advantages, la implementación de PPO de Unity ML-Agents) para jugar al entorno `SoccerTwos` de Unity ML-Agents. Lo publica el usuario HyperHilmi en Hugging Face y su propósito es servir como agente entrenado dentro de una simulación de fútbol 2 contra 2, no como modelo de lenguaje. No es un LLM: no genera texto ni procesa lenguaje natural, sino que produce acciones a partir de observaciones vectoriales y visuales del entorno.

El modelo se distribuye como un archivo de pesos de ML-Agents (`.nn` o `.onnx`, según el formato que haya subido el autor) y se ejecuta a través de la librería `ml-agents`, o directamente en el navegador mediante el visor de modelos de Unity en Hugging Face. Su relevancia es acotada: sirve como referencia práctica para quienes entrenan agentes multiagente con ML-Agents y quieren reanudar el entrenamiento o inspeccionar una política ya entrenada. No hay información sobre arquitectura de red, número de parámetros, contexto ni idiomas porque esos conceptos no aplican a este tipo de modelo.

La ficha se ha elaborado únicamente con los metadatos y la model card disponibles en Hugging Face. No se han encontrado papers, blogs ni resultados de benchmarks asociados a esta publicación concreta, por lo que muchos campos figuran como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para RL (ML-Agents, algoritmo POCA); topología exacta no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (los pesos de ML-Agents no se cuantizan habitualmente) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` / `.onnx` (formato de ML-Agents; el archivo concreto no se detalla) |

## Arquitectura y entrenamiento

El agente se entrena con el algoritmo POCA de Unity ML-Agents, una variante de PPO con ventajas recortadas, sobre el entorno `SoccerTwos`, que simula un partido de fútbol 2 contra 2 con agentes que comparten política o compiten según la configuración. La observación del entorno combina información vectorial del estado y, opcionalmente, observaciones visuales, y la política produce acciones discretas (movimiento y decisiones de juego). La model card no especifica el número de capas, el tamaño de las capas ocultas, el número de pasos de entrenamiento, la composición de recompensas ni si se usó entrenamiento autocurricular o imitación.

No se documenta el número total de pasos de entorno, el número de réplicas de entrenamiento ni los hiperparámetros del fichero YAML. Tampoco se indica si el agente se entrenó contra oponentes fijos, autojuego o currículo. No hay información sobre innovaciones técnicas adicionales más allá del uso estándar de POCA con ML-Agents.

## Capacidades

- Control de agente en el entorno `SoccerTwos` de Unity ML-Agents: percepción del estado del partido y selección de acciones de movimiento y juego.
- Aprendizaje multiagente: el entorno implica dos equipos de dos agentes, con dinámicas de cooperación y competición.
- Reanudación de entrenamiento: los pesos pueden cargarse con `mlagents-learn --resume` para continuar el entrenamiento desde el checkpoint publicado.
- Visualización en navegador: el modelo puede reproducirse en el visor de modelos de Unity en Hugging Face seleccionando el archivo `.nn`/`.onnx`.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reanudar el entrenamiento de un agente SoccerTwos: cargar los pesos con `mlagents-learn <config>.yaml --run-id=<id> --resume` para continuar el aprendizaje desde el checkpoint y ajustar hiperparámetros sin partir de cero.
- Evaluación comparativa de políticas: usar el agente como oponente o compañero de referencia en experimentos de autojuego y medir la tasa de victorias de nuevas políticas frente a esta.
- Docencia y divulgación de RL multiagente: reproducir el agente en el visor web de Hugging Face para mostrar en clase cómo una política entrenada controla a un jugador en un entorno Unity.
- Depuración de entornos ML-Agents: emplear el agente como caso de prueba para validar que una configuración de escena, observaciones y acciones produce inferencias coherentes.
- Punto de partida para fine-tuning con currículo: utilizar los pesos como inicialización en experimentos que añadan recompensas por posesión, pases o presión, y comparar la curva de aprendizaje con la de un entrenamiento desde cero.
- Integración en demos interactivas de Unity: exportar el modelo a ONNX e incorporarlo a una build de Unity con el componente Behavior Parameters para una demo jugable fuera de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de victorias, recompensa media por episodio, Elo ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de una política de RL de tamaño reducido, la inferencia suele ejecutarse en CPU sin GPU dedicada, pero no se confirma el tamaño del modelo.
- GPU recomendadas: no disponibles. Para entrenamiento continuado, ML-Agents se beneficia de GPU (por ejemplo, RTX 3090/4090 o A100) para acelerar la simulación y las actualizaciones de política, aunque no hay datos específicos de este checkpoint.
- GPU de consumo: previsiblemente cabe en cualquier GPU de consumo e incluso en CPU, dado el carácter ligero típico de las políticas de ML-Agents; sin confirmación del autor.
- Despliegue: `ml-agents` (Python) para inferencia y reentrenamiento; visor de modelos de Unity en Hugging Face para reproducción en navegador; exportación a ONNX para Unity Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HyperHilmi/poca-SoccerTwos | SoccerTwos | POCA (ML-Agents) | no disponible | no aplica | no disponible | Hugging Face |
| unity/ml-agents SoccerTwos (referencia oficial) | SoccerTwos | POCA | no disponible | no aplica | según repositorio ML-Agents | Repositorio Unity ML-Agents |
| Otros agentes SoccerTwos de la comunidad en Hugging Face | SoccerTwos | POCA/PPO | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el agente solo es válido para el entorno `SoccerTwos` con la misma configuración de observaciones y acciones; no se transfiere a otras tareas sin reentrenamiento.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial, redistribución o modificación; hay que contactar con el autor antes de cualquier uso en producción.
- Sin documentación de entrenamiento: no se conocen hiperparámetros, número de pasos ni configuración de recompensas, lo que dificulta reproducir los resultados.
- Riesgo de sobreajuste a oponentes concretos: al no documentarse el régimen de entrenamiento (autojuego, oponentes fijos), el comportamiento frente a políticas nuevas es incierto.
- Cero tracción verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de calidad ni evaluaciones independientes.
- No apto para tareas de lenguaje, visión general, código o razonamiento: cualquier uso fuera del entorno Unity SoccerTwos carece de sentido.
- Posibles sesgos de política: como en todo agente de RL, puede explotar comportamientos degenerados del entorno (p. ej., quedarse quieto o repetir acciones) si la recompensa no los penaliza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyperHilmi/poca-SoccerTwos
- Repositorio Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de modelos Unity en Hugging Face: https://huggingface.co/unity
