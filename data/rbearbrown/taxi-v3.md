# rbearbrown/Taxi-v3

## Resumen

`rbearbrown/Taxi-v3` es un agente de aprendizaje por refuerzo entrenado con Q-Learning sobre el entorno Taxi-v3 de Gymnasium (el clasico problema de recogida y entrega de pasajeros en una cuadricula de 5x5). Lo publica el usuario `rbearbrown` en HuggingFace, aparentemente como resultado de un ejercicio de entrenamiento con la libreria `stable-baselines3` y el formato de subida automatica de la plataforma. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada en un fichero `.pkl`.

El interes practico es limitado fuera del ambito educativo. Taxi-v3 es un entorno de juguete con un espacio de estados discreto de 500 posiciones y 6 acciones, pensado para validar algoritmos de RL tabular. El repositorio no incluye pesos en formato safetensors ni GGUF, no declara licencia y no tiene descargas ni likes en el momento de redactar esta ficha.

La relevancia actual es, por tanto, la de un artefacto de referencia para comparar implementaciones de Q-Learning y verificar pipelines de evaluacion en HuggingFace, no la de un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre espacio de estados discreto) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones, segun el entorno Taxi-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle de Python, fichero `q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning clasico, un metodo de diferencias temporales off-policy que aprende una funcion de valor-accion Q(s,a) representada como tabla. El agente observa el estado discreto del entorno Taxi-v3 (posicion del taxi, ubicacion del pasajero y destino) y selecciona una de las seis acciones disponibles (moverse en cuatro direcciones, recoger o dejar pasajero). La politica aprendida es greedy sobre la tabla Q.

No se dispone de informacion sobre hiperparametros (tasa de aprendizaje, factor de descuento, epsilon de exploracion, numero de episodios), composicion del dataset ni proceso de evaluacion. La model card menciona Taxi-v4 en el titulo y en el cuerpo, lo que sugiere una discrepancia entre el nombre del repositorio (`Taxi-v3`) y el entorno efectivamente usado; conviene verificar `model["env_id"]` al cargarlo. Tampoco se documenta si se aplico `is_slippery=False` ni ninguna otra modificacion del entorno.

## Capacidades

- Resolucion del entorno Taxi-v3: recoger un pasajero en una de las cuatro paradas y dejarlo en el destino indicado.
- Politica determinista greedy derivada de la tabla Q aprendida.
- Carga via `load_from_hub` de HuggingFace con el fichero `q-learning.pkl`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues, de vision, audio ni generacion de texto.
- No dispone de modo "thinking" ni decodificacion especulativa.

## Casos de uso

- Docencia de RL tabular: usar el agente como ejemplo funcional de Q-Learning en un curso introductorio, comparando la tabla Q aprendida con la solucion optima conocida del entorno.
- Verificacion de pipelines de HuggingFace: comprobar que el flujo `load_from_hub` + `gym.make` + evaluacion con `stable-baselines3` funciona de extremo a extremo antes de escalar a entornos mas complejos.
- Baseline de referencia: servir como punto de comparacion para agentes mas sofisticados (DQN, PPO) sobre Taxi-v3, dado que el reward medio declarado (7,50) es bajo y deja margen de mejora.
- Pruebas de integracion en CI: incluir el agente en tests automatizados que validen la API de evaluacion de entornos Gymnasium sin coste computacional apreciable.
- Reproducibilidad de experimentos: replicar el entrenamiento y contrastar la tabla Q resultante con la publicada para detectar diferencias de implementacion.
- Material de divulgacion: ilustrar en un blog o tutorial la diferencia entre un agente tabular y un modelo neuronal, usando este repositorio como ejemplo minimo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Entorno | Metrica | Valor | Verificado |
|---|---|---|---|
| Taxi-v3 | mean_reward | 7,50 +/- 2,76 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. El reward medio de 7,50 es sustancialmente inferior al optimo tipico de Taxi-v3 (en torno a 8-9 con `is_slippery=False` y politicas bien entrenadas), lo que sugiere un entrenamiento incompleto o una politica suboptima.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q en memoria RAM (unos pocos kilobytes).
- GPU recomendadas: ninguna; la inferencia es puramente CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluidos dispositivos de bajos recursos.
- Despliegue: carga directa con `pickle` o `load_from_hub`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: despreciables; la evaluacion esta limitada por la velocidad del entorno Gymnasium, no por el agente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Reward declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rbearbrown/Taxi-v3 | Q-Learning tabular | Taxi-v3 | 7,50 +/- 2,76 | no disponible | HuggingFace |
| Agente Q-Learning de referencia (stable-baselines3) | Q-Learning tabular | Taxi-v3 | no disponible en esta ficha | MIT (libreria) | PyPI / GitHub |
| DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | no disponible en esta ficha | MIT (libreria) | PyPI / GitHub |

No se dispone de datos comparativos verificados para otros agentes publicados en HuggingFace sobre el mismo entorno en la informacion proporcionada.

## Limitaciones y advertencias

- El agente solo funciona en Taxi-v3; no generaliza a otros entornos ni a variantes con dinamica distinta.
- La model card menciona Taxi-v4 en el titulo y en el cuerpo, mientras que el repositorio se llama Taxi-v3: posible inconsistencia que puede provocar fallos al cargar el entorno.
- El reward medio declarado (7,50) es bajo y la metrica no esta verificada por HuggingFace.
- Licencia no declarada: no se puede asumir uso comercial permitido.
- Formato `.pkl`: implica riesgos de seguridad al deserializar ficheros pickle de origen no confiable.
- Sin informacion sobre sesgos, alucinacion o limitaciones de contexto porque no es un modelo de lenguaje.
- No apto para produccion en tareas reales; su valor es educativo y de referencia.

## Enlaces

- HuggingFace: https://huggingface.co/rbearbrown/Taxi-v3
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Libreria stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- Documentacion de carga de modelos RL en HuggingFace: https://huggingface.co/docs/hub/models
