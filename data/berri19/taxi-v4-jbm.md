# berri19/Taxi-v4-jbm

## Resumen

Taxi-v4-jbm es un agente de aprendizaje por refuerzo entrenado con Q-Learning sobre el entorno Taxi-v4 de Gymnasium. Lo publica el usuario berri19 en Hugging Face y no se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada en un fichero `q-learning.pkl` que se carga junto con los metadatos del entorno para reproducir la política aprendida. El repositorio ocupa 0.0 GB y no registra descargas ni interacciones en el momento de la consulta.

El entorno Taxi-v4 es un problema clásico de control discreto: un taxi debe recoger y dejar pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones posibles, lo que da un espacio de estados de 500 combinaciones y seis acciones discretas. El agente aprende mediante Q-Learning tabular, sin aproximación funcional, por lo que su relevancia es fundamentalmente didáctica o de validación de pipelines de RL, no de producción a gran escala.

La model card declara un `mean_reward` de 7.56 +/- 2.71 sobre el propio entorno Taxi-v4, un resultado modesto que sugiere una política funcional pero lejos del óptimo teórico del entorno (que ronda 8-9 de recompensa media con políticas bien convergidas). No se especifican hiperparámetros de entrenamiento, número de episodios ni política de exploración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un algoritmo de diferencias temporales off-policy que actualiza una tabla Q(state, action) con la regla de Bellman. El espacio de estados de Taxi-v4 es finito y discreto (500 estados), y el de acciones es de 6 movimientos, por lo que la tabla Q es de tamaño reducido y no requiere aproximación con redes neuronales. El autor etiqueta el modelo como `custom-implementation`, lo que indica que la lógica de entrenamiento no proviene de una librería estándar como Stable-Baselines3, sino de una implementación propia.

No se detallan en la información disponible el número de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento, la política de exploración (epsilon-greedy u otra) ni la composición del dataset, que en este caso es simplemente la dinámica del entorno Taxi-v4. Tampoco se documenta si hubo evaluación con semillas fijas o validación cruzada.

## Capacidades

- Resolución del entorno Taxi-v4: recogida y entrega de pasajeros en una cuadrícula 5x5 con cuatro ubicaciones y paredes internas.
- Política determinista derivada de la tabla Q (selección de acción con mayor valor Q en cada estado).
- Carga mediante `load_from_hub` con el fichero `q-learning.pkl`, que incluye el `env_id` para reconstruir el entorno.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo mínimo y reproducible de Q-Learning tabular para explicar la regla de actualización de Bellman y la convergencia de la tabla Q en un entorno discreto.
- Validación de pipelines de RL: permite comprobar que un flujo de entrenamiento, serialización y carga desde Hugging Face funciona de extremo a extremo antes de escalar a entornos más complejos.
- Pruebas de integración con Gymnasium: útil para verificar la compatibilidad de versiones de `gym.make`, el registro del entorno y la carga de políticas desde pickle.
- Baseline de comparación: como referencia inferior para comparar contra agentes con aproximación funcional (DQN, PPO) en el mismo entorno Taxi-v4.
- Experimentos de reproducibilidad: al ser una tabla Q pequeña y determinista, facilita estudiar la varianza de la recompensa media entre episodios (declarada en +/- 2.71).
- Demostraciones educativas en notebooks: carga rápida y sin requisitos de GPU para ilustrar el bucle agente-entorno en clase o talleres.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.56 +/- 2.71 | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es una consulta a una tabla Q en memoria.
- CPU: cualquier procesador moderno es suficiente; el cuello de botella es la simulación del entorno Gymnasium, no el agente.
- GPU recomendadas: ninguna; no aplica.
- Cabe en cualquier equipo, incluidos portátiles de gama baja y entornos sin aceleración.
- Despliegue: carga directa con `load_from_hub` y `gym.make`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen de la implementación del entorno y del bucle de evaluación, no del agente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| berri19/Taxi-v4-jbm | Q-Learning tabular | Taxi-v4 | Tabla Q (max. 500x6) | no aplica | no disponible | Hugging Face |
| Agente Q-Learning de referencia (p. ej. Stable-Baselines3) | Q-Learning tabular | Taxi-v4 | Tabla Q equivalente | no aplica | MIT (SB3) | PyPI / GitHub |
| DQN sobre Taxi-v4 | Red neuronal profunda | Taxi-v4 | Miles de parametros | no aplica | variable | Implementaciones comunitarias |
| PPO sobre Taxi-v4 | Policy gradient | Taxi-v4 | Miles de parametros | no aplica | variable | Implementaciones comunitarias |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El `mean_reward` de 7.56 +/- 2.71 es bajo para Taxi-v4 y sugiere una política no del todo convergida; conviene validar con semillas fijas antes de usarla como referencia.
- El resultado está marcado como `verified: false`, es decir, no ha sido reproducido por terceros.
- La licencia no está declarada, lo que impide asumir permisos de uso comercial o redistribución.
- El formato `.pkl` es un pickle de Python y conlleva riesgos de seguridad si se carga de fuentes no confiables; conviene auditar el fichero antes de deserializarlo.
- No es un modelo de lenguaje: no procesa texto, no razona, no soporta tool calling ni agentes multi-paso.
- Depende de la versión de Gymnasium y del registro del entorno Taxi-v4; cambios de versión pueden romper la carga.
- No se documentan sesgos, pero la política está sobreajustada a la dinámica exacta del entorno y no generaliza a variantes (por ejemplo, `is_slippery=True` u otros mapas).
- No se especifican hiperparámetros ni episodios de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/berri19/Taxi-v4-jbm
- Entorno Taxi-v4 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de Gymnasium: https://gymnasium.farama.org/
- Repositorio de Stable-Baselines3 (alternativa de referencia para RL tabular y profundo): https://github.com/DLR-RM/stable-baselines3
