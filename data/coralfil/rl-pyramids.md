# Coralfil/rl-pyramids

## Resumen

`Coralfil/rl-pyramids` es un agente de aprendizaje por refuerzo entrenado con Unity ML-Agents para el entorno Pyramids, un escenario de control motor en el que uno o varios agentes deben desplazarse y recolectar pirámides doradas dentro de una arena delimitada. No se trata de un modelo de lenguaje: es una política neuronal exportada en formato ML-Agents (`.onnx`), pensada para ser cargada por el motor Unity mediante el paquete `com.unity.ml-agents`. El autor lo publica como entrega certificada del curso Deep RL de Hugging Face.

El repositorio tiene un carácter marcadamente docente: cero descargas, cero likes, sin licencia declarada y sin idiomas, lo que refleja un artefacto de ejercicio más que un modelo listo para producción. La model card es mínima y solo aporta el resultado declarado en `model-index`: una recompensa media de 10,00 ± 1,00 en el entorno ML-Agents-Pyramids. No se documentan hiperparámetros, arquitectura de red, número de pasos de entrenamiento ni configuración del `.yaml` de entrenamiento.

Su relevancia es, por tanto, acotada: sirve como referencia reproducible para quien siga el curso de RL de Hugging Face y quiera comparar su propio agente con una política ya entrenada. Para cualquier uso fuera de ese contexto (investigación comparativa, despliegue en un juego, evaluación de algoritmos) la información disponible es insuficiente y habría que reentrenar o inspeccionar directamente los artefactos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de ML-Agents; no se especifica si es PPO, SAC u otro) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un agente de RL) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la informacion proporcionada (la libreria declarada es `ml-agents`, que habitualmente usa `.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura de la red neuronal del agente (numero de capas, unidades por capa, tipo de observaciones, uso de memoria recurrente o de intrincsic reward). La libreria declarada, `ml-agents`, corresponde al toolkit de Unity ML-Agents, cuyo algoritmo por defecto es PPO con redes fully-connected y, opcionalmente, LSTM para memoria. No se confirma en la informacion disponible que se haya usado PPO ni ninguna otra variante concreta.

Tampoco se documentan el numero de pasos de entrenamiento, la configuracion del entorno (numero de agentes, recompensas, curriculum), ni si se aplicaron tecnicas como self-play, imitation learning o curriculum learning. El unico dato objetivo es el resultado declarado: recompensa media de 10,00 ± 1,00 sobre el entorno ML-Agents-Pyramids, marcado como no verificado (`verified: false`) en el `model-index`.

## Capacidades

- Control de politica en el entorno Pyramids de Unity ML-Agents: el agente aprende a moverse y recolectar objetos dentro de la arena.
- Inferencia en tiempo real dentro de Unity mediante el componente `Behavior Parameters` y el modelo `.onnx` asociado.
- Entrenamiento reproducible como referencia del curso Deep RL de Hugging Face.
- No soporta generacion de texto, codigo, matematicas, vision, audio ni tool calling: no es un modelo de lenguaje.
- No soporta agentes multi-paso en el sentido de razonamiento simbólico; su "razonamiento" es la politica reactiva aprendida.
- Capacidades multilingues: no aplica.

## Casos de uso

- Docencia en cursos de RL: usar el agente como politica de referencia para comparar curvas de recompensa de alumnos que reentrenan el entorno Pyramids con distintos hiperparametros.
- Baseline en experimentos de ML-Agents: cargar el `.onnx` en Unity y medir la recompensa media como punto de partida antes de probar variantes (PPO con LSTM, SAC, recompensas shaping).
- Depuracion de entornos Unity: verificar que el pipeline de inferencia (observaciones, acciones, `Behavior Parameters`) funciona correctamente antes de entrenar un agente propio.
- Demostracion de integracion Hugging Face + Unity: ejemplo de como publicar y consumir un agente de ML-Agents desde el Hub en un flujo docente.
- Evaluacion de robustez: ejecutar la politica en variantes del entorno (distintas semillas, numero de agentes) para estudiar su varianza, dado el intervalo declarado de ±1,00.
- Prototipado de videojuegos: usar el agente como NPC placeholder en una escena de prueba mientras se disena el comportamiento final.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| ML-Agents-Pyramids | reinforcement-learning | mean_reward | 10,00 ± 1,00 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparaciones con otros agentes o curvas de aprendizaje) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una politica de ML-Agents de tama\u00f1o tipicamente pequeno (redes de decenas de miles de parametros), la inferencia suele ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; para entrenamiento, ML-Agents funciona en CPU y en GPU (CUDA) sin requisitos documentados en este repositorio.
- Cabe en GPU de consumo: previsiblemente si, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: Unity ML-Agents (Barracuda/Inference Engine), `mlagents-learn` para reentrenamiento, y el runtime de Python `mlagents-envs` para evaluacion headless.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros agentes publicados para el mismo entorno ML-Agents-Pyramids ni datos comparativos de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir permiso de uso comercial; hay que contactar con el autor o tratar el artefacto como no licenciado.
- Resultado no verificado (`verified: false`) y con una sola metrica; no hay evidencia de robustez ante cambios de semilla o de configuracion del entorno.
- Model card minima: no se documentan arquitectura, hiperparametros ni proceso de entrenamiento, lo que impide reproducir el resultado.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- Especifico del entorno Pyramids: no generaliza a otras tareas de RL ni a otros entornos de ML-Agents sin reentrenamiento.
- Riesgo de sobreajuste al entorno de entrenamiento: al no haber datos de evaluacion en variantes, no se puede descartar que la politica explote particularidades del escenario.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Hugging Face: https://huggingface.co/Coralfil/rl-pyramids
- Documentacion de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course
- Repositorio del entorno Pyramids (Unity ML-Agents examples): https://github.com/Unity-Technologies/ml-agents/tree/main/Project/Assets/ML-Agents/Examples/Pyramids
