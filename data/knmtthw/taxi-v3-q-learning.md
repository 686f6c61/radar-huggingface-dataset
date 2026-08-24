# KnMtthw/Taxi-v3-Q-learning

## Resumen

El modelo `KnMtthw/Taxi-v3-Q-learning` es un agente de aprendizaje por refuerzo basado en el algoritmo clásico de Q-learning, entrenado para resolver el entorno Taxi-v4 de Gymnasium (antes OpenAI Gym). Lo desarrolla el usuario KnMtthw y se distribuye como un fichero pickle (`q-learning.pkl`) que contiene la tabla de valores Q aprendida. No se trata de una red neuronal ni de un modelo de lenguaje: es una implementación tabular de Q-learning, donde cada estado del entorno (posición del taxi, destino del pasajero y estado del pasajero) se asocia con un valor de acción.

El problema que resuelve es el clásico de navegación en un grid de 5x5 donde el taxi debe recoger a un pasajero y dejarlo en el destino correcto, optimizando la recompensa acumulada. Su relevancia actual es principalmente didáctica y de referencia: sirve como ejemplo de implementación de Q-learning en un entorno discreto y como punto de partida para comparar algoritmos de RL. No es un modelo de propósito general ni tiene capacidad de generación de texto, visión o razonamiento simbólico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla de Q (Q-table) para Q-learning tabular, sin red neuronal |
| Parametros totales | No disponible (en Taxi-v3 el espacio de estados es 500 y 6 acciones, pero para Taxi-v4 no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Pickle (`.pkl`) |

## Arquitectura y entrenamiento

El modelo es una implementación tabular de Q-learning, sin red neuronal. El agente mantiene una tabla de valores Q donde cada entrada corresponde a un par (estado, acción) y se actualiza mediante la ecuación de Bellman: Q(s,a) = Q(s,a) + α·(r + γ·max_a' Q(s',a') - Q(s,a)). El entorno Taxi-v4 es una variante del clásico Taxi-v3, que consiste en un grid de 5x5 con 4 localizaciones posibles (R, G, B, Y), un pasajero y un destino. El espacio de estados discreto y el espacio de acciones (6 acciones: mover norte, sur, este, oeste, recoger y dejar) permiten el aprendizaje tabular sin aproximación funcional.

No se han publicado detalles sobre los hiperparámetros utilizados (tasa de aprendizaje α, factor de descuento γ, política de exploración, número de episodios) ni sobre la composición del proceso de entrenamiento. El autor indica que el agente fue entrenado en Taxi-v4, pero no se especifica si se usó una variante con o sin deslizamiento (`is_slippery`). La tabla Q se guarda en un fichero pickle y se carga mediante la función `load_from_hub` de la librería de Hugging Face.

## Capacidades

- Resolver el entorno Taxi-v4 de Gymnasium: el agente es capaz de recoger a un pasajero y dejarlo en el destino correcto, generando una secuencia de acciones válidas.
- Aprendizaje por refuerzo tabular: el modelo demuestra la aplicación de Q-learning en un entorno discreto y finito.
- Inferencia determinista: una vez entrenada la tabla Q, la política es determinista (selecciona la acción con mayor valor Q en cada estado).
- No soporta tool calling, function calling, ni razonamiento multi-paso fuera del ámbito del entorno.
- No tiene capacidades multilingües, de visión ni de generación de texto.

## Casos de uso

- Entorno educativo de aprendizaje por refuerzo: el modelo sirve para ilustrar cómo funciona Q-learning en un entorno discreto, permitiendo a estudiantes y desarrolladores inspeccionar la tabla Q y entender la convergencia del algoritmo.
- Benchmark de algoritmos RL: se puede usar como baseline para comparar con otros agentes (Deep Q-Networks, SARSA, etc.) en el entorno Taxi-v4, midiendo la recompensa media y la velocidad de convergencia.
- Prueba de integración de Hugging Face Hub: el repositorio incluye una función `load_from_hub` que permite cargar el modelo desde el Hub, sirviendo de ejemplo para empaquetar y distribuir agentes de RL.
- Prototipo de control de un agente simple: aunque no es útil para producción, puede servir como punto de partida para experimentar con el entorno antes de usar métodos más avanzados.
- Investigación sobre exploración y explotación: se puede analizar cómo varía la recompensa en función de la política de exploración (ε-greedy, softmax) usando este modelo como referencia.
- Evaluación de entornos: permite verificar el correcto funcionamiento del entorno Taxi-v4 y comparar su dinámica con Taxi-v3 (por ejemplo, si el entorno es determinista o con deslizamiento).

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado en el entorno Taxi-v4:

| Metrica | Valor |
|---|---|
| Recompensa media (mean_reward) | 7.56 ± 2.71 |

Este resultado está marcado como `verified: false`, es decir, no ha sido verificado de forma independiente. El valor es bajo en comparación con el rendimiento típico de Q-learning en Taxi-v3, donde agentes bien entrenados alcanzan recompensas medias superiores a 200. Esto sugiere que el entrenamiento ha sido insuficiente o que el entorno Taxi-v4 presenta una dinámica diferente (por ejemplo, mayor aleatoriedad). No se han publicado resultados de benchmarks adicionales.

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU. El modelo es una tabla Q en memoria (unos pocos kilobytes), por lo que se puede ejecutar en cualquier CPU.
- **GPU recomendadas**: ninguna.
- **Compatibilidad con hardware de consumo**: sí, cualquier ordenador con Python y Gymnasium puede cargar y ejecutar el agente.
- **Opciones de despliegue**: se puede cargar desde Hugging Face Hub con `load_from_hub`, o ejecutar directamente en un script con Gymnasium. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: la inferencia es inmediata (una consulta a la tabla Q), con latencia inferior a un milisegundo en CPU.

## Comparativa con modelos similares

Existen otros agentes de Q-learning para el mismo entorno en Hugging Face, aunque no se han publicado resultados de benchmarks:

| Modelo | Entorno | Formato | Recompensa media publicada | Licencia |
|---|---|---|---|---|
| KnMtthw/Taxi-v3-Q-learning | Taxi-v4 | Pickle (.pkl) | 7.56 ± 2.71 (no verificado) | No disponible |
| Aathi07/q-Taxi-v3 | Taxi-v3 | Pickle (.pkl) | No disponible | No disponible |
| Martim03/Q-Learning-Taxi-v3 | Taxi-v3 | Pickle (.pkl) | No disponible | No disponible |

Los tres modelos son conceptualmente idénticos (Q-learning tabular), pero difieren en el entorno de entrenamiento (Taxi-v3 vs Taxi-v4). No hay datos públicos para comparar su rendimiento de forma rigurosa.

## Limitaciones y advertencias

- **Rendimiento bajo**: la recompensa media publicada (7.56) es muy inferior a la de agentes Q-learning bien entrenados en Taxi-v3 (típicamente >200), lo que indica que el entrenamiento es ineficiente o que el entorno Taxi-v4 es más complejo. No es apto para producción.
- **No verificado**: los resultados no han sido verificados por la comunidad (`verified: false`).
- **Sin documentación de hiperparámetros**: no se especifican los parámetros de entrenamiento (α, γ, ε, episodios), por lo que no es reproducible.
- **Limitaciones del entorno**: el modelo solo funciona en el entorno Taxi-v4 y no se puede transferir a otros entornos sin reentrenamiento.
- **Sin soporte para otros tipos de entrada**: no acepta texto, imágenes ni audio, solo estados discretos del entorno.
- **Licencia no definida**: no se especifica la licencia, lo que limita su uso comercial o su redistribución sin autorización explícita.
- **Falta de robustez**: la tabla Q no es generalizable a variaciones del entorno (cambios de grid, número de pasajeros, etc.).

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/KnMtthw/Taxi-v3-Q-learning)
- [Aathi07/q-Taxi-v3 (modelo similar)](https://huggingface.co/Aathi07/q-Taxi-v3)
- [Martim03/Q-Learning-Taxi-v3 (modelo similar)](https://huggingface.co/Martim03/Q-Learning-Taxi-v3)
- [GitHub: yatheshl/Q-Learning-Taxi-v3](https://github.com/yatheshl/Q-Learning-Taxi-v3) (implementación de referencia)
- [GitHub: lhvy/Taxi-v3-Q-Learning](https://github.com/lhvy/Taxi-v3-Q-Learning) (implementación de referencia)
- [Tutorial de Q-learning con Taxi-v3](https://fxis.ai/edu/how-to-implement-q-learning-with-the-taxi-v3-environment/)
