# bestdive/ppo-Pyramids

## Resumen

bestdive/ppo-Pyramids es una politica de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) mediante ML-Agents 1.1.0 sobre el entorno Pyramids del curso de Deep RL de Hugging Face. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de entrenamiento de agente unico, exportado como checkpoint ONNX para su ejecucion dentro de Unity. Lo publica Kay Zheng (usuario bestdive) como entrega de la Unidad 5 del citado curso.

El modelo se entreno desde inicializacion aleatoria, sin politica preentrenada, durante 100096 pasos de entorno, con semilla 42, en CPU gratuita de Google Colab y con la libreria mlagents 1.1.0. El resultado declarado es un retorno medio de -0,9999999310821295 con desviacion estandar poblacional de 0.0 sobre 112 episodios completados con semilla de entorno 100002. Es decir, la politica no ha resuelto la tarea de recompensa dispersa y todos los retornos de evaluacion son aproximadamente -1.

Su relevancia es acotada y de caracter educativo: documenta un resultado negativo reproducible, con configuracion, log de entrenamiento, artefacto ONNX y procedimiento de evaluacion independiente incluidos. Resulta util como referencia de trazabilidad metodologica (semillas fijas, evaluacion separada del entrenamiento, ausencia de metricas fabricadas) y como linea base minima frente a la que comparar futuros intentos sobre el mismo entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo entrenada con PPO mediante ML-Agents; topologia de red no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye el checkpoint ONNX tal cual |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | ONNX (checkpoint de inferencia para Unity), mas configuracion y log de entrenamiento |
| Framework de entrenamiento | ML-Agents 1.1.0, PyTorch 2.2.2, ONNX 1.15.0, onnxruntime |
| Entorno | ML-Agents Pyramids (curso Deep RL, Unidad 5) |
| Pasos de entrenamiento | 100096 |
| Semilla | 42 |
| Hardware de entrenamiento | CPU de Google Colab (gratuita), `--torch-device=cpu` |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la topologia concreta de la red (numero de capas, unidades por capa, tipo de extractor de caracteristicas ni dimensiones de las observaciones). Lo unico verificable es el algoritmo y el marco: PPO tal y como lo implementa ML-Agents en su version 1.1.0, entrenado desde inicializacion aleatoria, sin politica preentrenada y con asistencia de codigo y ejecucion por IA declarada por el autor. El entorno objetivo es Pyramids, una tarea de recompensa dispersa del material practico del curso.

El proceso de entrenamiento esta completamente especificado y es reproducible: Python 3.10.12, mlagents 1.1.0, torch 2.2.2, onnx 1.15.0, setuptools<81 y onnxruntime, con el comando `mlagents-learn training-config.yaml --env=PATH_TO_ENV --run-id=Kay-Pyramids --results-dir=results --no-graphics --seed=42 --torch-device=cpu`. No se empleo RLHF, DPO ni ningun otro ajuste posterior; no hay innovaciones tecnicas declaradas (ni atencion lineal, ni decodificacion especulativa, ni mezcla de expertos). El unico elemento metodologico destacable es la separacion explicita entre entrenamiento y evaluacion: la evaluacion se hizo con una semilla de entorno distinta (100002) y acciones ONNX deterministas, reteniendo todos los agentes que terminaban en el ultimo lote vectorial.

## Capacidades

- Control de agente en el entorno simulado ML-Agents Pyramids mediante acciones deterministas exportadas a ONNX.
- Inferencia integrable en Unity a traves de onnxruntime, sin dependencia de GPU.
- Reproduccion exacta del entrenamiento a partir de la configuracion, el log y la semilla incluidos en el repositorio.
- Evaluacion independiente auditable: el repositorio adjunta `evaluation.json` con el retorno de cada episodio y `evaluate_unity.py` con el procedimiento.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni capacidades multilingues.
- No soporta tool calling, function calling ni razonamiento multi-paso; su unica salida es la accion del agente en el entorno.
- No implementa modo de pensamiento ni ninguna capacidad especial adicional.

## Casos de uso

- Material docente para la Unidad 5 del curso Deep RL de Hugging Face: sirve como ejemplo entregable de modelo genuinamente entrenado, sin minimo de recompensa exigido, y como ilustracion de un resultado negativo bien documentado.
- Linea base reproducible en investigacion sobre Pyramids: cualquier intento posterior puede compararse contra este retorno medio de -0,9999999310821295 medido sobre 112 episodios con semilla 100002.
- Verificacion de pipelines de evaluacion en ML-Agents: `evaluate_unity.py` y `evaluation.json` permiten validar que un arnés de evaluacion con seed fija y acciones ONNX deterministas funciona de extremo a extremo antes de aplicarlo a politicas mejores.
- Pruebas de integracion de inferencia ONNX en Unity: el checkpoint permite comprobar el ciclo completo de carga del modelo, alimentacion de observaciones y ejecucion de acciones dentro del motor, sin coste de GPU.
- Estudio de sensibilidad al numero de pasos en tareas de recompensa dispersa: con 100096 pasos y semilla 42 como punto de partida documentado, resulta util para analizar por que PPO no escapa del minimo local en Pyramids.
- Auditoria de higiene experimental: el repositorio incluye configuracion, log de entrenamiento, checkpoint y evaluacion independiente, por lo que sirve como plantilla de trazabilidad para revisiones metodologicas o de reproducibilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (metrica no verificada de forma externa):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | ML-Agents-Pyramids | mean_reward | -0,9999999310821295 +/- 0.0 |

Detalles de la evaluacion declarada: 112 episodios completados, semilla de entorno 100002, acciones ONNX deterministas, desviacion estandar poblacional de 0.0. La propia model card indica que la tarea de recompensa dispersa no esta resuelta y que todos los retornos de evaluacion son aproximadamente -1. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de modelos de lenguaje, porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Entrenamiento: CPU de Google Colab gratuita, con `--torch-device=cpu`. No se reporto uso de GPU.
- Inferencia: el checkpoint ONNX esta pensado para ejecutarse en Unity con onnxruntime, por lo que no requiere GPU dedicada; el repositorio ocupa 0.0 GB, lo que es compatible con despliegue en maquinas sin acelerador.
- VRAM estimada: no disponible en la model card. Al no publicarse el numero de parametros ni el tamano del fichero ONNX, no se puede calcular una cifra fiable.
- GPU recomendadas: no disponibles; no se documenta ninguna.
- Compatibilidad con GPU de consumo: no disponible; el propio autor entreno en CPU, lo que sugiere que no es necesario acelerador, pero no se aporta medicion de latencia ni throughput.
- Opciones de despliegue: Unity con onnxruntime como destino declarado. ML-Agents permite tambien la inferencia mediante el checkpoint de PyTorch, aunque la model card se centra en el ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card y los resultados de busqueda proporcionados no incluyen otros agentes entrenados sobre ML-Agents Pyramids ni metricas comparables, por lo que cualquier tabla de comparacion requeriria datos que no se han facilitado. Como referencia cualitativa, el propio autor situa este modelo como una politica introductoria que no resuelve la tarea, frente a la cual no se aporta ningun contrapunto con cifras.

## Limitaciones y advertencias

- La tarea no esta resuelta: el retorno medio es aproximadamente -1 y la desviacion estandar es 0.0, lo que indica un comportamiento degenerado y sin variabilidad entre episodios.
- Entrenamiento insuficiente: 100096 pasos de entorno en CPU es un presupuesto muy bajo para una tarea de recompensa dispersa como Pyramids.
- Sesgo de entrenamiento limitado a un unico entorno: el modelo no generaliza a otras tareas, escenarios ni dominios; la propia model card indica que su rendimiento esta limitado a esta tarea simulada.
- Riesgo de alucinacion: no aplica, ya que no genera lenguaje natural.
- Limitaciones de contexto e idioma: no aplican; no procesa texto.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, sin restricciones adicionales declaradas.
- Caveat para produccion: no debe desplegarse como politica operativa en ningun sistema real; su valor es exclusivamente educativo y de referencia metodologica.
- Metricas no verificadas: el campo `verified` del model-index es `false`, de modo que los resultados proceden unicamente de la evaluacion del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bestdive/ppo-Pyramids
- Repositorio del modelo, con `training-config.yaml`, log de entrenamiento, checkpoint ONNX, `evaluation.json` y `evaluate_unity.py`: https://huggingface.co/bestdive/ppo-Pyramids/tree/main
- Curso Deep RL de Hugging Face (Unidad 5, origen del entorno Pyramids): https://huggingface.co/learn/deep-rl-course
- Documentacion de ML-Agents 1.1.0: https://github.com/Unity-Technologies/ml-agents
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces recuperados correspondian al juego slither.io y no guardan relacion con la ficha. No se han encontrado papers, blogs ni demos adicionales asociados al modelo.
