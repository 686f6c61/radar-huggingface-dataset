# PAkshayV/q-Taxi-v3

## Resumen

El modelo `PAkshayV/q-Taxi-v3` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning clásico para resolver el entorno `Taxi-v3` de Gymnasium. Este entorno simula un taxi en una cuadrícula de 5x5 que debe recoger y dejar pasajeros en ubicaciones específicas, optimizando la ruta y evitando penalizaciones. El autor, PAkshayV, publica el agente entrenado como un archivo pickle (`q-learning.pkl`) que puede cargarse directamente con la utilidad `load_from_hub` de Hugging Face.

El modelo no es una red neuronal ni un transformer, sino una tabla Q (tabla de valores estado-acción) aprendida mediante actualizaciones iterativas de la ecuación de Bellman. Su relevancia es principalmente didáctica: sirve como ejemplo de implementación personalizada de Q-Learning y como punto de partida para experimentos de RL en entornos discretos. El repositorio no incluye información sobre el proceso de entrenamiento (número de episodios, hiperparámetros, política de exploración), por lo que la reproducibilidad completa no está garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla Q (Q-Learning tabular, sin red neuronal) |
| Parametros totales | No disponible (tabla de 500 estados x 6 acciones en Taxi-v3, no confirmado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entorno de RL episódico) |
| Tipos de cuantizacion | No aplica (archivo pickle con tabla Q) |
| Idiomas soportados | No aplica (agente de RL, sin procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Pickle (`.pkl`) |

## Arquitectura y entrenamiento

El agente utiliza Q-Learning tabular, un algoritmo de aprendizaje por refuerzo sin modelo (model-free) que aprende una función de valor Q(s, a) para cada par estado-acción. En el entorno Taxi-v3, el espacio de estados es discreto (500 estados posibles: posición del taxi, destino y estado del pasajero) y el espacio de acciones tiene 6 acciones discretas (mover en 4 direcciones, recoger y dejar). La política resultante es determinista: en cada estado se elige la acción con mayor valor Q.

No se dispone de detalles sobre el proceso de entrenamiento: ni el número de episodios, ni la tasa de aprendizaje, ni el factor de descuento, ni la estrategia de exploración (epsilon-greedy, softmax, etc.). El autor indica que es una "custom-implementation", pero no aporta el código de entrenamiento en la model card. El archivo `q-learning.pkl` contiene la tabla Q serializada junto con el identificador del entorno (`env_id`), como se muestra en el ejemplo de uso.

## Capacidades

- Resolver el entorno Taxi-v3 de forma óptima o casi óptima: el agente aprende a recoger y dejar pasajeros minimizando el número de pasos y evitando acciones ilegales.
- Inferencia determinista: una vez entrenado, la política es fija y no requiere exploración.
- Carga sencilla desde Hugging Face mediante `load_from_hub`, lo que facilita su integración en pipelines de evaluación o comparación.
- No tiene capacidades de generación de texto, visión, tool calling ni razonamiento simbólico; es un agente puramente reactivo para un entorno de cuadrícula.

## Casos de uso

- **Educación en aprendizaje por refuerzo**: el modelo sirve como ejemplo práctico de Q-Learning tabular para estudiantes que quieran ver un agente entrenado y comparar su comportamiento con implementaciones propias.
- **Benchmark de algoritmos RL**: se puede utilizar como referencia de rendimiento (mean_reward 7.52) para comparar con otros agentes entrenados en Taxi-v3, ya sea con Q-Learning, SARSA o Deep Q-Networks.
- **Prueba de entornos Gymnasium**: al cargar el agente y ejecutarlo en el entorno, se puede verificar que la instalación de Gymnasium y las versiones de las dependencias son correctas.
- **Análisis de políticas**: se puede inspeccionar la tabla Q para estudiar qué acciones prefiere el agente en cada estado y entender la lógica aprendida.
- **Generación de datos de demostración**: el agente puede ejecutarse para generar trayectorias (estado, acción, recompensa) que sirvan para entrenar otros modelos, por ejemplo mediante aprendizaje por imitación.
- **Comparativa de hiperparámetros**: aunque no se documentan los hiperparámetros, el archivo permite evaluar el resultado final y contrastarlo con agentes entrenados con distintas configuraciones.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado, sin verificación independiente:

| Tarea | Entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.52 +/- 2.71 |

Este valor de recompensa media es relativamente bajo para Taxi-v3, donde una política óptima suele alcanzar recompensas positivas en torno a 8-9 por episodio (el entorno penaliza con -1 por paso y -10 por acciones ilegales). La desviación estándar de 2.71 sugiere que el agente no es completamente estable, posiblemente debido a una exploración residual o a un entrenamiento insuficiente. No se han publicado comparaciones con otros agentes en la misma tarea.

## Requisitos de hardware

- **VRAM**: no requiere GPU. La tabla Q ocupa unos pocos kilobytes (500 estados x 6 acciones x 8 bytes por float64 ≈ 24 KB).
- **CPU**: cualquier procesador moderno es suficiente; la inferencia es instantánea (una operación de lookup en tabla).
- **RAM**: menos de 10 MB para cargar el archivo pickle y el entorno.
- **Despliegue**: se puede ejecutar en cualquier máquina con Python y Gymnasium. No requiere vLLM, llama.cpp ni Ollama.
- **Latencia**: del orden de microsegundos por decisión, limitada por el bucle del entorno.

## Comparativa con modelos similares

Existen otros repositorios en Hugging Face con agentes Q-Learning para Taxi-v3, como `pk-aiml/q-Taxi-v3` y `avoroshilov/q-Taxi-v3`, pero no se dispone de sus métricas ni de sus especificaciones. En general, todos los agentes tabulares para Taxi-v3 comparten la misma arquitectura (tabla Q) y se diferencian únicamente en el proceso de entrenamiento. No hay modelos comparables de mayor escala para este entorno, ya que es un problema de juguete.

| Modelo | Arquitectura | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|
| PAkshayV/q-Taxi-v3 | Tabla Q | 7.52 +/- 2.71 | No disponible | Publico en HF |
| pk-aiml/q-Taxi-v3 | Tabla Q | No disponible | No disponible | Publico en HF |
| avoroshilov/q-Taxi-v3 | Tabla Q | No disponible | No disponible | Publico en HF |

## Limitaciones y advertencias

- **Rendimiento subóptimo**: la recompensa media de 7.52 está por debajo de lo que alcanza una política óptima en Taxi-v3 (típicamente > 8). El agente puede cometer errores ocasionales o dar rodeos.
- **Falta de documentación**: no se especifican hiperparámetros, número de episodios, semilla aleatoria ni criterio de convergencia, lo que impide reproducir el entrenamiento.
- **Sin verificación independiente**: la métrica declarada no está verificada por terceros; es posible que el resultado no sea reproducible en otras versiones de Gymnasium.
- **Alcance limitado**: el agente solo funciona en el entorno Taxi-v3 con la configuración por defecto; no es transferible a otros entornos sin reentrenamiento.
- **Licencia no especificada**: al no indicarse licencia, el uso comercial del archivo pickle es legalmente ambiguo; se recomienda contactar al autor antes de utilizarlo en productos.
- **Formato propietario**: el archivo pickle depende de la versión de Python y de las clases de Gymnasium; puede no cargarse correctamente en entornos con versiones distintas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PAkshayV/q-Taxi-v3
- Repositorio similar (pk-aiml): https://huggingface.co/pk-aiml/q-Taxi-v3
- Repositorio similar (avoroshilov): https://huggingface.co/avoroshilov/q-Taxi-v3
- Proyecto de referencia en GitHub (yatheshl/Q-Learning-Taxi-v3): https://github.com/yatheshl/Q-Learning-Taxi-v3
- Guía sobre Q-Learning con Taxi-v3 (fxis.ai): https://fxis.ai/edu/unlocking-the-world-of-q-learning-with-taxi-v3/
