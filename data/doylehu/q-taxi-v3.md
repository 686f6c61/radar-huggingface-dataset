# DoyleHu/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario DoyleHu en Hugging Face y no es un modelo de lenguaje: no contiene pesos de red neuronal, sino una tabla Q serializada en formato pickle que asigna valores de accion a cada par estado-accion del entorno. Su interes es didactico y de referencia: sirve como ejemplo reproducible de un pipeline de RL clasico (entorno discreto, agente tabular, evaluacion con recompensa media) dentro del ecosistema de Hugging Face.

El repositorio tiene un tamano practicamente nulo (0.0 GB), lo que es coherente con una tabla Q de Taxi-v3: el entorno tiene 500 estados discretos y 6 acciones, por lo que la tabla completa ocupa unos pocos kilobytes. El modelo declara una recompensa media de 7.56 +/- 2.71 en el dataset Taxi-v3, un resultado modesto que sugiere un entrenamiento parcial o una politica no completamente convergida (el optimo de Taxi-v3 se situa en torno a 8-9 de recompensa media en evaluaciones estandar).

La relevancia actual es limitada para produccion, pero resulta util como material de aprendizaje, como baseline de comparacion para algoritmos de RL mas avanzados (DQN, PPO) y como ejemplo de publicacion de artefactos de RL en el Hub. No debe confundirse con un modelo generativo ni usarse fuera del entorno Taxi-v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q discreta; no aplica el concepto de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno discreto de 500 estados) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

Se trata de un agente de Q-Learning tabular, el algoritmo clasico de control off-policy basado en la ecuacion de Bellman. La "arquitectura" es una tabla Q indexada por estado y accion; en Taxi-v3 el espacio de estados es discreto (500 estados) y el de acciones tambien (6 acciones: mover norte, sur, este, oeste, recoger pasajero y dejar pasajero). No hay funcion de aproximacion, ni red neuronal, ni representacion de contexto.

No se dispone de informacion sobre hiperparametros de entrenamiento (tasa de aprendizaje, factor de descuento, politica epsilon-greedy, numero de episodios), composicion del dataset ni si se aplicaron tecnicas adicionales. La model card solo indica que es un agente Q-Learning entrenado para Taxi-v3 y muestra un ejemplo de carga mediante `load_from_hub` y `gym.make`. El autor advierte de que puede ser necesario ajustar atributos del entorno (por ejemplo `is_slippery=False`) al reconstruirlo.

## Capacidades

- Resolucion del entorno Taxi-v3: el agente selecciona acciones discretas para recoger y dejar pasajeros en un mapa de cuadricula.
- Politica greedy derivada de la tabla Q: dado un estado, devuelve la accion con mayor valor Q aprendido.
- Ejecucion ligera: no requiere GPU ni frameworks de deep learning, solo Python, Gymnasium y la carga del pickle.
- Reproducibilidad: el artefacto es un unico fichero `q-learning.pkl` facil de inspeccionar y versionar.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, vision, audio ni capacidades multilingues.
- No dispone de modo thinking ni de generacion de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo minimo de Q-Learning tabular en un curso, cargando el pickle y ejecutando episodios en Taxi-v3 para ilustrar la convergencia de la tabla Q.
- Baseline de comparacion: medir la recompensa media (7.56 +/- 2.71) frente a algoritmos mas avanzados como DQN o PPO en el mismo entorno para cuantificar la mejora.
- Depuracion de pipelines de RL: integrar el agente en un entorno de test para validar el bucle de evaluacion (rollout, calculo de recompensa, logging) antes de escalar a modelos neuronales.
- Reproduccion de experimentos: servir como referencia para replicar un entrenamiento Q-Learning con los mismos hiperparametros y comparar resultados.
- Demostraciones interactivas: construir una visualizacion del entorno Taxi-v3 donde el agente actua en tiempo real, util para talleres y charlas.
- Pruebas de integracion con Gymnasium: verificar la compatibilidad de la carga via `load_from_hub` y la reconstruccion del entorno con los atributos correctos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion con otros agentes en la model card.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es una consulta a una tabla en memoria.
- CPU: cualquier procesador moderno es suficiente; el cuello de botella es el bucle de simulacion del entorno, no el agente.
- GPU recomendadas: ninguna; no aplica.
- Cabe en cualquier equipo, incluidos Raspberry Pi y entornos sin acelerador.
- Despliegue: Python con Gymnasium y la utilidad `load_from_hub` de Hugging Face; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del paso del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DoyleHu/q-Taxi-v3 | Q-Learning tabular | Taxi-v3 | 7.56 +/- 2.71 | no disponible | Hugging Face |
| LordN77/q-Taxi-v3 | Q-Learning tabular | Taxi-v3 | no disponible | no disponible | Hugging Face |
| DBusAI/q-Taxi-v3 | Q-Learning tabular | Taxi-v3 | no disponible | no disponible | Hugging Face |

Los tres repositorios son agentes Q-Learning para Taxi-v3 publicados en el Hub; no se dispone de sus metricas ni de sus hiperparametros en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Especificidad total al entorno: el agente solo funciona en Taxi-v3; no generaliza a otros entornos ni a tareas del mundo real.
- Rendimiento modesto: 7.56 de recompensa media con desviacion de 2.71 indica una politica no completamente optima y con alta varianza entre episodios.
- Sin verificacion: la metrica esta marcada como `verified: false`; no ha sido validada de forma independiente.
- Licencia no especificada: no hay informacion sobre condiciones de uso comercial o redistribucion; conviene contactar con el autor antes de reutilizarlo.
- Dependencia de configuracion del entorno: el autor advierte de que hay que ajustar atributos como `is_slippery` al reconstruir el entorno; una configuracion incorrecta invalida la politica aprendida.
- Formato pickle: la carga de ficheros pickle implica riesgos de seguridad si la procedencia no es de confianza.
- Sin soporte de lenguaje, vision ni audio: no es adecuado para ninguna tarea de NLP o multimodal.
- Documentacion minima: no se detallan hiperparametros, numero de episodios ni procedimiento de evaluacion, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DoyleHu/q-Taxi-v3
- Modelo similar (LordN77): https://huggingface.co/LordN77/q-Taxi-v3
- Modelo similar (DBusAI): https://huggingface.co/DBusAI/q-Taxi-v3
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
