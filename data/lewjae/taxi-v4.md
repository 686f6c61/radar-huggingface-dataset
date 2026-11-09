# lewjae/taxi-v4

## Resumen

`lewjae/taxi-v4` es un agente de aprendizaje por refuerzo entrenado con Q-Learning para resolver el entorno `Taxi-v4` de Gymnasium (anteriormente OpenAI Gym). No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementación personalizada de Q-Learning tabular que aprende una política óptima para el problema clásico del taxi, donde un agente debe recoger y dejar pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones posibles.

El modelo lo publica el usuario `lewjae` en Hugging Face bajo el pipeline `reinforcement-learning` y la etiqueta `custom-implementation`. El repositorio tiene un tamaño de 0.0 GB, lo que es coherente con una tabla Q almacenada en un fichero pickle (`q-learning.pkl`) en lugar de pesos de red neuronal. La model card declara un `mean_reward` de 7.56 +/- 2.71 sobre el entorno `Taxi-v4`, una métrica modesta que sugiere que la política no ha convergido al óptimo teórico del entorno (que ronda recompensas medias de 8-9 en configuraciones bien entrenadas).

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo mínimo reproducible de un agente Q-Learning empaquetado con el formato de Hugging Face y del estándar `model-index` para declarar resultados. No es un modelo adecuado para tareas de generación, razonamiento o producción en NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (implementación personalizada, sin red neuronal) |
| Parametros totales | no disponible (tabla Q discreta; el tamaño depende de estados x acciones del entorno Taxi-v4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de refuerzo con 500 estados discretos) |
| Tipos de cuantizacion | no disponible (no aplica a una tabla Q en pickle) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning clásico, un algoritmo de aprendizaje por refuerzo off-policy y model-free que estima el valor de pares estado-acción mediante una tabla Q. El entorno `Taxi-v4` de Gymnasium es un MDP discreto con 500 estados (25 posiciones del taxi x 5 posiciones de pasajero x 4 destinos) y 6 acciones (moverse en cuatro direcciones, recoger y dejar pasajero). La implementación se etiqueta como `custom-implementation`, lo que indica que el autor escribió su propio bucle de entrenamiento en lugar de usar una librería como Stable-Baselines3.

No se dispone de información sobre hiperparámetros (tasa de aprendizaje, factor de descuento, política epsilon-greedy, número de episodios), composición del dataset ni procesos de RLHF/DPO, que en este contexto no aplican. La model card únicamente documenta el artefacto resultante (`q-learning.pkl`) y el `env_id` del entorno, e incluye una advertencia sobre la posibilidad de necesitar atributos adicionales como `is_slippery=False` al recrear el entorno.

## Capacidades

- Resolución del entorno `Taxi-v4` de Gymnasium mediante una política Q-Learning entrenada.
- Selección de acciones discretas (6 posibles) en un espacio de estados finito (500 estados).
- Carga e inferencia mediante `load_from_hub` con el fichero `q-learning.pkl`.
- Integración con el ecosistema Gymnasium para evaluación y reproducción.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step en el sentido de LLM; el bucle de decisión es el propio del entorno de refuerzo.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo mínimo de Q-Learning tabular para explicar conceptos de política, función de valor y exploración en un curso introductorio.
- Reproducción de experimentos: cargar `q-learning.pkl` con `load_from_hub` y evaluar la recompensa media en `Taxi-v4` para comparar contra otras implementaciones publicadas en Hugging Face.
- Benchmark de referencia para entornos Gymnasium: servir como línea base de Q-Learning frente a métodos más avanzados (DQN, PPO) en el mismo entorno.
- Pruebas de integración de Hugging Face Hub en pipelines de RL: validar el flujo de descarga, carga y ejecución de artefactos pickle en herramientas internas.
- Generación de datos sintéticos de trayectorias: ejecutar la política entrenada para producir episodios etiquetados que alimenten otros experimentos de RL o de imitación.
- Comparación de entornos clásicos: usar el agente como referencia para estudiar la variabilidad del `mean_reward` (7.56 +/- 2.71) y discutir la estabilidad del entrenamiento en `Taxi-v4`.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el artefacto es un pickle con una tabla Q y cabe en memoria RAM convencional.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer y también en CPU; el cuello de botella es el bucle del entorno Gymnasium, no el modelo.
- Opciones de despliegue: ejecución directa con Python, `gymnasium` y `huggingface_hub`; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del paso del entorno `Taxi-v4` y no del agente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lewjae/taxi-v4 | Q-Learning tabular | Taxi-v4 | mean_reward 7.56 +/- 2.71 | no disponible | Hugging Face |
| lucaje123/Taxi-v4 | Q-Learning | Taxi-v4 | no disponible | no disponible | Hugging Face |
| Hoaichu/Taxi-v4 | Reinforcement learning | Taxi-v4 | no disponible | no disponible | Hugging Face |

Los tres modelos pertenecen a la misma categoría (agentes Q-Learning para `Taxi-v4`) y comparten el mismo enfoque y formato de artefacto. La información pública disponible no permite comparar rendimiento entre ellos más allá de la métrica declarada por `lewjae/taxi-v4`.

## Limitaciones y advertencias

- El `mean_reward` de 7.56 +/- 2.71 no está verificado por el Hub (`verified: false`) y presenta una desviación típica elevada, lo que indica una política inestable o no completamente convergida.
- El modelo solo resuelve `Taxi-v4`; no es transferible a otros entornos ni tareas sin reentrenamiento.
- No procesa lenguaje natural, imágenes ni audio; no debe evaluarse como un modelo generativo.
- La licencia no está declarada, por lo que el uso comercial queda sin marco legal explícito y requiere contactar con el autor.
- El formato `q-learning.pkl` implica riesgos de seguridad al deserializar pickles de origen desconocido; conviene auditar el fichero antes de cargarlo en producción.
- La model card advierte de que pueden ser necesarios atributos adicionales del entorno (`is_slippery=False`, etc.) al recrearlo, lo que puede alterar los resultados si no se replican las condiciones de entrenamiento.
- No hay información sobre hiperparámetros ni semillas, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Hugging Face: https://huggingface.co/lewjae/taxi-v4
- Modelo comparable lucaje123/Taxi-v4: https://huggingface.co/lucaje123/Taxi-v4
- Ficha de Hoaichu/Taxi-v4 en Essa Mamdani: https://essamamdani.com/ai-models/hf-hoaichu-taxi-v4
