# RulOfficial/q-learning-Taxi-v3

## Resumen

`RulOfficial/q-learning-Taxi-v3` no es un modelo de lenguaje neuronal, sino un agente de aprendizaje por refuerzo tabular que implementa Q-Learning clásico sobre el entorno `Taxi-v3` de Gymnasium. Lo publica el usuario RulOfficial como repositorio reproducible que incluye la tabla Q entrenada (`q_table.npy`), los hiperparámetros y resultados de entrenamiento (`resultados.json`), una gráfica de evidencia y el script `train_q_learning.py` con las dependencias necesarias.

El modelo resuelve el problema de despacho de un taxi en una cuadrícula de 5x5 con cuatro ubicaciones de recogida y entrega, 500 estados discretos y 6 acciones posibles. No hay parámetros neuronales, ni tokenizador, ni ventana de contexto: el "modelo" es una matriz de 500x6 valores Q que codifica la política aprendida tras 8000 episodios de entrenamiento con semilla 42.

Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo mínimo y reproducible de un pipeline completo de RL tabular (entrenamiento, evaluación, certificación de umbral y artefactos versionados) y como punto de comparación para implementaciones propias en entornos discretos de Gymnasium.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (sin red neuronal) |
| Parametros totales | 500 estados x 6 acciones = 3000 valores Q (matriz de 500x6) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entorno con 500 estados discretos) |
| Tipos de cuantizacion | no disponible (no aplica; tabla almacenada en `.npy`) |
| Idiomas soportados | es (etiqueta declarada en la model card) |
| Licencia | MIT |
| Formato de pesos | `.npy` (NumPy) para la tabla Q; `.json` para hiperparámetros y métricas |

## Arquitectura y entrenamiento

Se trata de Q-Learning tabular puro: una tabla Q de dimensiones 500x6 indexada por el estado discreto del entorno `Taxi-v3` y la acción elegida entre las 6 disponibles (moverse en las cuatro direcciones, recoger y dejar pasajero). La actualización sigue la regla clásica de diferencias temporales con tasa de aprendizaje alpha = 0,7 y factor de descuento gamma = 0,99, con política epsilon-greedy que decae desde epsilon = 1,0 hasta un mínimo de 0,01.

El entrenamiento se ejecutó durante 8000 episodios con semilla 42, seguido de una evaluación de 100 episodios. No hay datos sobre composición de dataset (el entorno es determinista y sintético), ni sobre RLHF, DPO o técnicas de alineación, ya que no aplican a este paradigma. La innovación destacable es la trazabilidad: se publican hiperparámetros, semillas, cobertura de estados y una métrica de certificación explícita (`mean_reward - std_reward` con umbral 4,5), lo que facilita la reproducción exacta del resultado.

## Capacidades

- Resolución del entorno `Taxi-v3` de Gymnasium mediante política greedy sobre la tabla Q aprendida.
- Toma de decisiones secuenciales en espacios de estados y acciones discretos y finitos.
- Recogida y entrega de pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones designadas.
- Reproducibilidad completa: semilla fija (42), hiperparámetros documentados y script de entrenamiento incluido.
- Evaluación cuantitativa con métricas de recompensa media, desviación estándar y cobertura de estados.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, visión, audio ni generación de texto.
- No tiene capacidades multilingües en sentido lingüístico; la etiqueta `es` se refiere al idioma de la documentación.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio sirve como ejemplo completo y ejecutable de Q-Learning tabular, con script, hiperparámetros y resultados, para cursos introductorios de RL.
- Verificación de pipelines de entrenamiento: al incluir semilla, métricas y umbral de certificación, permite comprobar que una infraestructura propia reproduce exactamente los resultados publicados.
- Baseline de comparación: cualquier implementación nueva sobre `Taxi-v3` (SARSA, Double Q-Learning, DQN) puede contrastarse contra esta tabla Q de referencia con la misma semilla y número de episodios.
- Pruebas de integración con Gymnasium: útil para validar versiones de Gymnasium, NumPy y dependencias en entornos de CI antes de escalar a entornos más complejos.
- Generación de material didáctico: la gráfica `evidencia_entrenamiento.png` y el JSON de resultados permiten ilustrar curvas de aprendizaje y comparación de estrategias de exploración.
- Prototipado de sistemas de despacho discretos: la formulación estado-acción del taxi es trasladable a problemas logísticos simplificados con espacios discretos, como asignación de rutas en cuadrículas.

## Benchmarks y rendimiento

Resultados publicados en la model card para la semilla 42 (evaluación sobre 100 episodios):

| Metrica | Valor |
|---|---|
| Recompensa media | 7,66 |
| Desviacion estandar | 2,53 |
| Puntuacion mean - std | 5,13 |
| Umbral de certificacion | 4,5 |
| Resultado | Umbral superado |
| Estados visitados en entrenamiento | 404 de 500 |
| Estados visitados en evaluacion | 227 de 500 |

No se han publicado comparaciones con otros agentes (SARSA, DQN, PPO) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la tabla Q ocupa 500x6 valores en coma flotante (del orden de kilobytes).
- GPU: innecesaria; el entrenamiento y la inferencia se ejecutan en CPU.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos sin GPU.
- Despliegue: Python con NumPy y Gymnasium; no requiere vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos tabulares.
- Latencia y throughput: no publicados; en la práctica, la inferencia es una consulta a una matriz, del orden de microsegundos por paso, y el entrenamiento de 8000 episodios se completa en segundos o pocos minutos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RulOfficial/q-learning-Taxi-v3 | 3000 valores Q (500x6) | no aplica | mean - std = 5,13; recompensa media 7,66 | MIT | Hugging Face |
| Agente SARSA sobre Taxi-v3 | no disponible | no aplica | no disponible | no disponible | no disponible |
| DQN sobre Taxi-v3 | red neuronal (tamano no disponible) | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos publicados de alternativas comparables en la informacion proporcionada; las filas de SARSA y DQN se incluyen solo como categorias de referencia y sus valores figuran como no disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite prompts.
- Específico de `Taxi-v3`: la tabla Q no es transferible a otros entornos ni a variantes del problema sin reentrenamiento.
- Cobertura parcial del espacio de estados: solo 404 de 500 estados visitados durante el entrenamiento y 227 durante la evaluación, por lo que la política puede ser subóptima en estados poco explorados.
- Alta varianza: desviación estándar de 2,53 sobre una recompensa media de 7,66, lo que indica comportamiento irregular entre episodios.
- Sin datos de sesgos, alucinación o robustez más allá del entorno sintético; estos riesgos no aplican en el sentido habitual, pero la política puede fallar ante cambios en la dinámica del entorno.
- Licencia MIT: permite uso comercial y modificación con atribución; no se han documentado restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- El tamaño del repositorio figura como 0.0 GB, coherente con artefactos de pocos kilobytes, pero conviene verificar la integridad de los archivos antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RulOfficial/q-learning-Taxi-v3
- Entorno Taxi-v3 de Gymnasium (referencia del entorno): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de NumPy (formato `.npy`): https://numpy.org/doc/stable/reference/generated/numpy.lib.format.html
