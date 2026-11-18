# alelav/Taxi-v3_model_1

## Resumen

Taxi-v3_model_1 es un agente de aprendizaje por refuerzo entrenado con Q-Learning sobre el entorno Taxi-v4 de Gymnasium (la variante moderna del clasico Taxi-v3). Lo publica el usuario alelav en Hugging Face y no es un modelo de lenguaje: es una tabla Q serializada en formato pickle que se carga junto con el identificador del entorno para reproducir la politica aprendida. El repositorio tiene un tamano practicamente nulo (0.0 GB), lo que confirma que los pesos son una tabla de valores Q y no una red neuronal.

El problema que resuelve es el clasico benchmark de control discreto: un taxi debe recoger y dejar pasajeros en una cuadricula de 5x5 con 4 ubicaciones posibles, gestionando un estado de 500 combinaciones discretas y 6 acciones. Es relevante como ejemplo minimo y reproducible de un pipeline de RL con Q-Learning tabular, util para docencia, validacion de entornos y como linea base frente a metodos mas complejos (DQN, PPO).

El autor declara un reward medio de 7.56 +/- 2.71 sobre Taxi-v4, un resultado por debajo del optimo del entorno (que ronda 8-9 con politicas bien entrenadas), lo que sugiere un entrenamiento parcial o con hiperparametros conservadores. No hay informacion sobre licencia, idiomas ni detalles del entrenamiento mas alla de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

Se trata de un agente de Q-Learning tabular, el algoritmo clasico de control off-policy sin modelo. Mantiene una tabla Q indexada por el par (estado, accion) y la actualiza con la regla de Bellman usando una tasa de aprendizaje y un factor de descuento. El entorno Taxi-v4 tiene 500 estados discretos y 6 acciones (mover norte, sur, este, oeste, recoger pasajero y dejar pasajero), por lo que la tabla Q es de dimensiones manejables y no requiere aproximacion funcional.

La model card no detalla hiperparametros (alpha, gamma, epsilon, numero de episodios), ni la politica de exploracion, ni si se uso decaimiento de epsilon. El unico dato verificable es el resultado declarado: mean_reward de 7.56 +/- 2.71 sobre Taxi-v4. El tag `custom-implementation` indica que el agente se entreno con una implementacion propia y no con una libreria estandar como Stable-Baselines3, aunque el formato de carga (`load_from_hub` con `q-learning.pkl`) es el habitual en los agentes subidos con la herramienta de Hugging Face para RL.

## Capacidades

- Resolucion del entorno Taxi-v4: recoger y dejar pasajeros en una cuadricula 5x5 con 4 ubicaciones y gestion de estado del pasajero.
- Politica greedy derivada de la tabla Q: dada una observacion discreta, devuelve una accion.
- Reproducibilidad: el pickle incluye el `env_id` para reconstruir el entorno con `gym.make`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues, vision, audio ni thinking mode.
- No es un agente generalizable: solo opera sobre el espacio de estados de Taxi-v4.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo minimo y ejecutable de Q-Learning tabular para explicar la ecuacion de Bellman, la exploracion epsilon-greedy y la convergencia de la tabla Q en un entorno de 500 estados.
- Linea base en investigacion: util como referencia inferior frente a metodos con aproximacion funcional (DQN, PPO) al comparar curvas de aprendizaje en Taxi-v4.
- Validacion de pipelines de RL: permite comprobar que un entorno Gymnasium, un wrapper de evaluacion y el flujo de carga desde Hugging Face funcionan de extremo a extremo antes de escalar a entornos mas costosos.
- Test de integracion en librerias de RL: al ser un pickle pequeno con `env_id`, se puede usar en tests unitarios que verifiquen la carga de agentes y la ejecucion de episodios.
- Demostraciones de evaluacion estocastica: con un reward de 7.56 +/- 2.71, sirve para ilustrar la varianza entre episodios y la diferencia entre politica greedy y politica con exploracion.
- Prototipado de sistemas de planificacion discreta: la estructura estado-accion de Taxi-v4 es analogo a problemas de logistica y reparto en cuadricula, y el agente puede servir de punto de partida conceptual antes de pasar a entornos continuos o de mayor dimension.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.56 +/- 2.71 |

No se han publicado en la informacion disponible resultados comparativos con otros agentes, curvas de aprendizaje ni numero de episodios de evaluacion.

## Requisitos de hardware

- VRAM: no requiere GPU; la tabla Q es de kilobytes y se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier consumer GPU o incluso en CPU y en entornos sin acelerador.
- Despliegue: Python con `gymnasium` y `huggingface_hub` (`load_from_hub`); no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica, la inferencia es una consulta a una tabla y el cuello de botella es el bucle del entorno.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| alelav/Taxi-v3_model_1 | Q-Learning tabular | Taxi-v4 | tabla Q (500 x 6) | no aplica | mean_reward 7.56 +/- 2.71 (declarado) | no disponible |
| Agentes Q-Learning de referencia en Taxi-v3 | Q-Learning tabular | Taxi-v3 | tabla Q (500 x 6) | no aplica | no disponible en esta ficha | no disponible |
| DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | red pequena (MLP) | no aplica | no disponible en esta ficha | no disponible |

No se dispone de datos verificados de los modelos alternativos en la informacion proporcionada; la comparativa es estructural, no de rendimiento.

## Limitaciones y advertencias

- El reward declarado (7.56) esta por debajo del optimo del entorno, lo que indica una politica suboptima o un entrenamiento incompleto.
- La metrica esta marcada como `verified: false`; no ha sido reproducida de forma independiente.
- No hay informacion sobre licencia, lo que impide asumir uso comercial sin consultar al autor.
- El agente solo funciona sobre Taxi-v4; cualquier cambio en la dinamica del entorno o en el espacio de estados invalida la tabla Q.
- No es un modelo de lenguaje ni un agente general: no procesa texto, no razona y no se puede aplicar a tareas fuera del entorno.
- La carga depende de que el pickle sea compatible con la version de Python y de las dependencias usadas al guardarlo; los pickles pueden fallar entre versiones y presentan riesgos de seguridad si provienen de fuentes no confiables.
- No se documentan sesgos, pero la politica puede estar sesgada hacia las trayectorias vistas durante el entrenamiento y generalizar mal a configuraciones iniciales poco frecuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alelav/Taxi-v3_model_1
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de carga de agentes RL en Hugging Face: https://huggingface.co/docs/hub/en/models-downloading
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
