# HyperHilmi/FreeTaxi

## Resumen

FreeTaxi es un agente de aprendizaje por refuerzo entrenado con Q-learning tabular para resolver el entorno Taxi-v3 de Gymnasium, publicado en HuggingFace por el usuario HyperHilmi. No es un modelo de lenguaje ni una red neuronal: el artefacto es un diccionario serializado en Python (`q-learning.pkl`) que contiene la tabla de valores Q y el identificador del entorno (`env_id`), tal y como muestra el ejemplo de uso de la model card. La tarea consiste en recoger un pasajero y dejarlo en el destino dentro de una cuadrícula con estaciones, con un espacio de estados y acciones discreto y pequeño.

El interés de la ficha es acotado: se trata de un ejemplo mínimo y reproducible de pipeline de reinforcement learning de extremo a extremo (entrenamiento, publicación en el Hub, carga y evaluación), útil como material didáctico o como baseline de referencia en experimentos con Taxi-v3. El autor declara una recompensa media de 7,56 ± 2,71 en el conjunto de evaluación, si bien la métrica figura como no verificada en el `model-index`.

No hay información publicada sobre hiperparámetros, número de episodios de entrenamiento, semilla ni licencia. El repositorio registra cero descargas y cero likes en el momento de la consulta, y un tamaño reportado de 0,0 GB, por lo que la relevancia práctica fuera del ámbito educativo es muy limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (model-free, value-based, off-policy) sobre una tabla de pares estado-acción; no es un transformer ni una red neuronal |
| Parametros totales | No disponible como recuento de pesos; la tabla Q cubre el espacio estado-acción de Taxi-v3 (500 estados discretos x 6 acciones según la especificación del entorno) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica: el estado es una observación discreta entre 500 posibles, sin ventana de contexto |
| Tipos de cuantizacion | No disponible: no se publican variantes GGUF, AWQ, GPTQ ni equivalentes; los valores Q son números en un pickle |
| Idiomas soportados | No disponible: el modelo no procesa lenguaje natural |
| Licencia | No disponible: no declarada en la model card ni en los metadatos del repositorio |
| Formato de pesos | Pickle de Python (`q-learning.pkl`), cargado mediante `load_from_hub` |

## Arquitectura y entrenamiento

La arquitectura es Q-learning clásico, un método de control por diferencias temporales de tipo off-policy que aprende una función de valor acción-estado Q(s, a) y deriva de ella una política greedy. Al ser tabular, no hay capas, embeddings ni atención: la «memoria» del agente es una tabla indexada por el estado discreto de Taxi-v3 y la acción elegida, actualizada iterativamente con la regla de Bellman. El artefacto publicado incluye la tabla y el `env_id` del entorno con el que se entrenó, lo que permite reconstruir el agente sin código adicional.

No se dispone de información sobre el número de episodios de entrenamiento, la política de exploración (epsilon-greedy u otra), los valores de learning rate y factor de descuento, la semilla ni la composición del conjunto de evaluación. Tampoco se documenta ningún proceso de RLHF, DPO o ajuste fino supervisado, algo por otra parte ajeno a este tipo de agente. La model card únicamente advierte de que, al reconstruir el entorno, conviene comprobar atributos como `is_slippery=False`, lo que sugiere que la dinámica estocástica del entorno puede afectar a la evaluación de la política aprendida.

## Capacidades

- Resolución de Taxi-v3: selecciona una de las 6 acciones discretas (moverse al norte, sur, este u oeste, recoger pasajero, dejar pasajero) a partir del estado discreto actual, siguiendo la política greedy derivada de la tabla Q.
- Aprendizaje por refuerzo off-policy: la política almacenada es el resultado de Q-learning, por lo que no requiere gradientes ni GPU para inferencia.
- Persistencia del entorno asociado: el pickle incluye el `env_id`, lo que permite instanciar el entorno correcto con `gym.make(model["env_id"])`.
- No soporta generación de texto, razonamiento en lenguaje natural, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta flujos de agente multi-paso basados en lenguaje; su «razonamiento» se limita a un único paso de decisión por transición.
- No tiene capacidades multilingües ni procesamiento de audio o visión.
- No dispone de modo de razonamiento extendido (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Docencia de reinforcement learning: sirve como ejemplo completo y de tamaño mínimo para ilustrar el ciclo entrenamiento-publicación-carga-evaluación en un curso introductorio, ya que el artefacto se carga con dos líneas de código y se ejecuta íntegramente en CPU.
- Baseline de referencia en experimentos con Taxi-v3: cualquier propuesta nueva (DQN, SARSA, policy gradient) puede compararse contra esta política para comprobar si aporta mejora real sobre un Q-learning tabular ya entrenado.
- Pruebas de integración de pipelines de evaluación: permite validar el código de rollouts, el cálculo de recompensa media y el logging antes de conectarlo a entornos y modelos más costosos, porque el coste por episodio es despreciable.
- Verificación de flujos de registro y versionado en el Hub: útil para probar la descarga de artefactos, la gestión de `model-index` y la carga de pickles en un entorno controlado, sin depender de modelos de gran tamaño.
- Estudio de hiperparámetros: al ser un algoritmo tabular, el efecto de alpha, gamma y epsilon sobre la recompensa media es observable con pocos recursos, lo que lo convierte en un banco de pruebas para técnicas de búsqueda de hiperparámetros.
- Depuración de entornos Gymnasium: el aviso de la model card sobre `is_slippery` lo hace adecuado para reproducir el impacto de la dinámica estocástica del entorno en el rendimiento de una política ya entrenada.
- Demos interactivas y notebooks educativos: la política puede visualizarse paso a paso en un notebook sin infraestructura de servido, lo que facilita explicar la relación entre tabla Q, estado y acción.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,56 +/- 2,71 | No |

No se han publicado otros resultados de benchmarks en la información disponible. No se documenta el número de episodios de evaluación, la semilla ni el intervalo de confianza, y el autor marca explícitamente la métrica como no verificada. La desviación típica de 2,71 sobre una media de 7,56 implica una dispersión elevada entre episodios, por lo que el valor debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El modelo es una tabla de valores en un pickle y no requiere acelerador gráfico.
- GPU recomendadas: ninguna. La inferencia es una búsqueda en una tabla de 6 entradas por estado y se ejecuta en CPU convencional.
- Cabe en cualquier GPU de consumo y también en dispositivos sin GPU (Raspberry Pi, contenedores sin aceleración), aunque no se aprovecharía el hardware.
- Opciones de despliegue: `load_from_hub` junto con `gym.make` para reconstruir el entorno, o carga directa del pickle y selección de acción por `argmax` sobre la fila correspondiente al estado. vLLM, TGI, llama.cpp y Ollama no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles como medición publicada. Por la estructura del artefacto (una búsqueda sobre 6 valores por paso), el coste dominante será el `step()` del entorno de Gymnasium y no la inferencia del modelo.
- El tamaño del repositorio se reporta como 0,0 GB, por lo que el artefacto ocupa, como máximo, unos pocos kilobytes; no se ha podido confirmar el contenido exacto del fichero.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de alternativas en la información proporcionada. La siguiente comparación es cualitativa y se limita a la naturaleza del enfoque; las celdas de rendimiento de los competidores quedan como no disponibles.

| Modelo / enfoque | Tipo | Parametros | Contexto | Rendimiento en Taxi-v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HyperHilmi/FreeTaxi | Q-learning tabular | Tabla 500 x 6 | No aplica | 7,56 +/- 2,71 (no verificado) | No disponible | HuggingFace |
| Q-learning tabular del RL Zoo (Stable-Baselines3) | Q-learning tabular | No disponible | No aplica | No disponible | No disponible | Repositorio de RL Zoo |
| DQN sobre Taxi-v3 | Red neuronal profunda (value-based) | No disponible | No aplica | No disponible | No disponible | Implementaciones en SB3 y similares |
| Política aleatoria | Baseline sin aprendizaje | 0 | No aplica | No disponible | No aplica | Trivial de reproducir |

La diferencia relevante frente a DQN es que FreeTaxi no necesita aproximación funcional: la tabla es exacta para el espacio discreto de Taxi-v3 y no requiere GPU, pero tampoco escala a espacios de estados continuos o de gran cardinalidad.

## Limitaciones y advertencias

- Licencia no declarada: sin términos explícitos, el uso comercial queda en una zona legal gris y conviene contactar con el autor antes de integrarlo en un producto.
- Métrica no verificada: el `model-index` marca `verified: false` y no se documenta el protocolo de evaluación, por lo que el 7,56 de recompensa media no es reproducible tal cual.
- Varianza elevada: una desviación típica de 2,71 sobre una media de 7,56 indica un comportamiento muy variable entre episodios; no se especifica el número de episodios evaluados.
- Sensibilidad a la configuración del entorno: la propia model card advierte de la necesidad de revisar atributos como `is_slippery`, de modo que los resultados pueden cambiar sustancialmente entre configuraciones o versiones de Gymnasium.
- Cero generalización: la política está ligada a los 500 estados de Taxi-v3 y no es transferible a otros entornos ni a variantes con distinta topología.
- No es un modelo de lenguaje: no sirve para generación de texto, código, atención al cliente ni ninguna tarea de NLP, pese a aparecer catalogado en un Hub mayoritariamente de LLM.
- Riesgo de deserialización: los ficheros pickle pueden ejecutar código arbitrario al cargarse; tratándose de un repositorio de terceros con cero descargas, es recomendable inspeccionar el artefacto o cargarlo en un entorno aislado.
- Falta de reproducibilidad del entrenamiento: no se publican hiperparámetros, semilla ni número de episodios, por lo que no se puede reentrenar el agente para replicar el resultado.
- Ausencia de validación comunitaria: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que respalden la calidad del artefacto.
- Tamaño de repositorio reportado de 0,0 GB: no se puede confirmar que el pickle esté íntegro ni que contenga la tabla completa.

## Enlaces

- HuggingFace: https://huggingface.co/HyperHilmi/FreeTaxi

No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
