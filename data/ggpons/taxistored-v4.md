# ggpons/taxistored-v4

## Resumen

`ggpons/taxistored-v4` es un agente de aprendizaje por refuerzo entrenado con Q-Learning sobre el entorno `Taxi-v3` de Gymnasium (antiguo OpenAI Gym). Lo publica el usuario `ggpons` en Hugging Face y no es un modelo de lenguaje: es una tabla Q serializada en formato pickle que representa la politica aprendida por un agente tabular. El repositorio tiene un tamano practicamente nulo (0.0 GB) y no registra descargas ni likes en el momento de la consulta.

El problema que resuelve es el clasico problema del taxi: un agente debe recoger a un pasajero en una de las cuatro ubicaciones posibles y dejarlo en su destino dentro de una rejilla de 5x5, con 500 estados discretos y 6 acciones posibles. Es un entorno de juguete ampliamente utilizado como banco de pruebas para algoritmos de RL, no para aplicaciones de produccion.

Su relevancia es por tanto didactica o de referencia: sirve para reproducir un pipeline de entrenamiento Q-Learning con la libreria de Hugging Face para RL (`load_from_hub`), no como componente de sistemas reales. No hay informacion sobre arquitectura neuronal, parametros, contexto ni idiomas porque no aplica a este tipo de artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre 500 estados discretos y 6 acciones) |
| Parametros totales | no disponible (tabla Q, no red neuronal; el tamano del repo es 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Gymnasium `Taxi-v3`, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

El artefacto es un agente Q-Learning tabular, no un transformer ni un modelo neuronal. La politica se almacena como una tabla Q que mapea cada uno de los 500 estados discretos de `Taxi-v3` a valores de accion para las 6 acciones del entorno (moverse norte, sur, este, oeste, recoger pasajero y dejar pasajero). El entrenamiento se realiza por actualizaciones de Bellman con la regla de Q-Learning estandar, aunque la model card no especifica hiperparametros como tasa de aprendizaje, factor de descuento, politica epsilon-greedy ni numero de episodios.

No hay informacion sobre el numero de episodios de entrenamiento, la semilla utilizada, la version exacta de Gymnasium ni si se empleo `is_slippery=False` o el entorno estocastico por defecto. La model card advierte explicitamente de que el usuario debe comprobar si necesita anadir atributos adicionales al entorno al cargar el modelo. No se documenta ninguna innovacion tecnica: es una implementacion custom de Q-Learning, tal y como indican los tags del repositorio.

## Capacidades

- Resolucion del entorno `Taxi-v3` de Gymnasium: recoger y dejar pasajeros en una rejilla 5x5 con 500 estados discretos.
- Seleccion de accion greedy a partir de la tabla Q aprendida.
- Carga directa desde el Hub mediante `load_from_hub(repo_id="ggpons/taxistored-v4", filename="q-learning.pkl")`.
- Integracion con el ecosistema Gymnasium a traves de `gym.make(model["env_id"])`.
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, ni razonamiento en lenguaje natural.
- No tiene capacidades multilingues, de vision, audio ni modo thinking.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo funcional de un agente Q-Learning tabular para ilustrar la diferencia entre metodos tabulares y metodos con aproximacion de funcion en un curso introductorio.
- Reproduccion de experimentos: permite comparar la politica aprendida con otras ejecuciones de Q-Learning sobre `Taxi-v3` usando la misma metrica de recompensa media.
- Baseline en investigacion de RL: puede usarse como referencia de rendimiento minima frente a algoritmos mas avanzados (DQN, PPO, A2C) en el mismo entorno de juguete.
- Pruebas de integracion de infraestructura RL: valida el flujo `load_from_hub` + `gym.make` + bucle de evaluacion en pipelines de CI antes de desplegar agentes mas complejos.
- Demostraciones educativas interactivas: util para notebooks que muestran visualmente la politica del taxi paso a paso sin requerir GPU ni dependencias pesadas.
- Verificacion de entornos personalizados: si se modifica `Taxi-v3` (por ejemplo, con `is_slippery` distinto), el agente sirve para comprobar como degrada una politica tabular ante cambios en la dinamica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.44 +/- 2.79 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion con otros agentes en la model card.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es un pickle de una tabla Q de tamano despreciable (repo de 0.0 GB).
- GPU recomendadas: ninguna; la inferencia es una consulta a diccionario en CPU.
- Cabe en cualquier consumer GPU y en cualquier CPU, incluso en entornos sin aceleracion.
- Opciones de despliegue: Python con `gymnasium` y la libreria de carga de modelos RL de Hugging Face; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza tabular, la seleccion de accion es una operacion O(1) en memoria.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ggpons/taxistored-v4 | Q-Learning tabular | Taxi-v3 | tabla Q (0.0 GB) | no aplica | no disponible | Hugging Face |
| Agentes Q-Learning de referencia (p. ej. los generados por el RL baseline de Hugging Face) | Q-Learning tabular | Taxi-v3 | tabla Q | no aplica | habitualmente MIT/Apache-2.0 | Hugging Face |
| DQN sobre Taxi-v3 | Red neuronal | Taxi-v3 | orden de 10^4-10^5 | no aplica | variable | Repositorios de investigacion |
| PPO sobre Taxi-v3 | Policy gradient | Taxi-v3 | orden de 10^4-10^5 | no aplica | variable | Repositorios de investigacion |

No hay datos publicados que permitan comparar el rendimiento de este agente con alternativas concretas mas alla de la metrica declarada por el autor.

## Limitaciones y advertencias

- Ambito extremadamente restringido: solo funciona en `Taxi-v3`; no es reutilizable en otros entornos ni tareas.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribucion; hay que contactar con el autor.
- Resultados no verificados (`verified: false`): la recompensa media de 7.44 +/- 2.79 la declara el autor y no ha sido validada por un tercero.
- Varianza alta: la desviacion tipica de 2.79 sobre una media de 7.44 indica una politica inestable entre episodios.
- Dependencia del entorno: la model card advierte de que puede ser necesario ajustar atributos como `is_slippery`; cargarlo con una configuracion distinta a la del entrenamiento puede degradar el rendimiento.
- Sin informacion sobre sesgos, alucinacion o idiomas porque no es un modelo de lenguaje; esos criterios no aplican.
- Sin garantias de reproducibilidad: no se documentan semillas, hiperparametros ni version de Gymnasium.
- Sin mantenimiento aparente: creado y actualizado el mismo dia, sin descargas ni likes.

## Enlaces

- Hugging Face: https://huggingface.co/ggpons/taxistored-v4
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de carga de modelos RL en Hugging Face: https://huggingface.co/docs/hub/en/models-downloading
