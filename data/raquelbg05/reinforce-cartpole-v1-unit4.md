# RaquelBG05/Reinforce-CartPole-v1-unit4

## Resumen

`RaquelBG05/Reinforce-CartPole-v1-unit4` es una política de aprendizaje por refuerzo entrenada con el algoritmo REINFORCE sobre el entorno clásico CartPole-v1 de Gymnasium. Lo desarrolla RaquelBG05 como entregable de la Unidad 4 del curso Deep Reinforcement Learning de Hugging Face, y no es un modelo de lenguaje: es una red neuronal pequeña que mapea observaciones de cuatro dimensiones (posición y velocidad del carro, ángulo y velocidad angular del poste) a una distribución de probabilidad sobre dos acciones discretas (empujar a izquierda o derecha).

El interés es fundamentalmente didáctico y de reproducibilidad: implementa REINFORCE con retornos de Monte Carlo, una línea base calculada a partir de las demás trayectorias del lote y gradientes sobre acciones muestreadas, todo en PyTorch. El checkpoint publicado corresponde al lote 30 de entrenamiento, con 16 episodios por lote y semilla 42, y declara una recompensa media de 500,0 con desviación típica 0,0 sobre 50 episodios de evaluación en modo greedy, es decir, el máximo teórico del entorno.

No debe confundirse con un modelo generativo: no procesa texto, no tiene ventana de contexto lingüística ni pesos en formato safetensors/GGUF, y su utilidad en producción se limita a servir como referencia de implementación o como política base para experimentos de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (perceptrón multicapa) como política estocástica para RL; número de capas y unidades ocultas no disponible (el campo `hidden` se lee de la configuración del checkpoint) |
| Parametros totales | no disponible (el tamaño del repo es 0.0 GB; los pesos se distribuyen en `policy.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno CartPole-v1: observación de 4 dimensiones por paso; horizonte máximo de 500 pasos por episodio) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `policy.pt` (checkpoint PyTorch con claves `config`, `weights` y `env_id`), más `results.json` y `reinforce.py` |

## Arquitectura y entrenamiento

La política es una red neuronal implementada en PyTorch que se instancia con `Politica(cfg["features"], cfg["hidden"], checkpoint["env_id"])` y se carga desde `policy.pt`. El algoritmo es REINFORCE clásico: se recogen trayectorias completas, se calculan retornos de Monte Carlo y se aplica una línea base estimada con las otras trayectorias del mismo lote para reducir la varianza del estimador de gradiente. Los gradientes se calculan sobre las acciones efectivamente muestreadas (policy gradient), no sobre un objetivo supervisado.

El entrenamiento usó la semilla 42, lotes de 16 episodios y el checkpoint publicado corresponde al lote 30. La selección del checkpoint se hizo por validación, y la evaluación se realiza con política greedy (acción de mayor probabilidad). El repositorio incluye `reinforce.py` con la definición de la red, el preprocesamiento y la evaluación, y `results.json` con las semillas y los retornos por episodio, lo que permite reproducir el experimento. No se documentan innovaciones técnicas adicionales (no hay atención, decodificación especulativa ni mecanismos híbridos).

## Capacidades

- Control de política en el entorno CartPole-v1: selecciona entre dos acciones discretas a partir de observaciones continuas de cuatro dimensiones.
- Aprendizaje por refuerzo con policy gradient: implementación de REINFORCE con retornos de Monte Carlo y línea base por lote.
- Evaluación determinista en modo greedy, además del muestreo estocástico durante el entrenamiento.
- Reproducibilidad: semilla fijada (42), registro de retornos por episodio en `results.json` y checkpoint con configuración embebida.
- Carga en CPU sin dependencias de GPU (`torch.load(..., map_location="cpu", weights_only=True)`).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento extendido: no es un modelo de lenguaje.

## Casos de uso

- Material docente para la Unidad 4 del curso Deep RL de Hugging Face: sirve como referencia funcional de REINFORCE con línea base para que los alumnos comparen su propia implementación con una que alcanza la recompensa máxima del entorno.
- Verificación de pipelines de RL: al declarar 500,0 ± 0,0 de recompensa media en modo greedy, es útil como caso de prueba para validar herramientas de evaluación y registro de experimentos (W&B, MLflow) sin necesidad de entrenar desde cero.
- Punto de partida para experimentos de ablación: modificar la línea base, el tamaño de lote o la arquitectura de la política y medir el impacto en la varianza y la velocidad de convergencia sobre CartPole-v1.
- Docencia de PyTorch: el código de `reinforce.py` ilustra el ciclo completo de recogida de trayectorias, cálculo de retornos, pérdida de policy gradient y actualización de pesos en un caso de tamaño manejable.
- Pruebas de integración de entornos Gymnasium: validar el bucle de interacción agente-entorno, el recorte de episodios a 500 pasos y el formateo de observaciones antes de escalar a entornos más complejos.
- Referencia de empaquetado de checkpoints: el formato `policy.pt` con `config`, `weights` y `env_id` es un ejemplo de cómo publicar una política de RL de forma autocontenida y cargable con `weights_only=True`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | CartPole-v1 | Mean reward | 500,0000 +/- 0,0000 |

Detalles de la evaluación según la model card: 50 episodios, recompensa media 500,0000, desviación típica 0,0000, media menos desviación 500,0000, política de evaluación greedy. El máximo teórico de CartPole-v1 es 500 por episodio, por lo que el resultado indica que la política completa los 500 pasos en todos los episodios evaluados. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; la política es una red pequeña que cabe en CPU y en cualquier GPU consumer. El tamaño exacto de parámetros no está disponible.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente para inferencia y para entrenamiento en CartPole-v1.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: PyTorch nativo cargando `policy.pt` con `torch.load`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita; por la escala del entorno (pasos de milisegundos en CPU) se espera inferencia en el orden de microsegundos por paso, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reinforce-CartPole-v1-unit4 (este) | REINFORCE con línea base | CartPole-v1 | 500,0000 +/- 0,0000 (greedy, 50 episodios) | no disponible | Hugging Face |
| Políticas DQN de referencia del curso Deep RL | DQN | CartPole-v1 | no disponible en la información proporcionada | no disponible | Hugging Face / curso |
| Políticas PPO de referencia del curso Deep RL | PPO | CartPole-v1 | no disponible en la información proporcionada | no disponible | Hugging Face / curso |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparación cuantitativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Ámbito muy restringido: la política solo es válida para CartPole-v1; no generaliza a otros entornos ni a variaciones de la dinámica del entorno.
- Resultado en el máximo teórico con desviación cero: 500,0 ± 0,0 en 50 episodios greedy puede indicar una evaluación poco exigente o un conjunto de evaluación limitado; conviene replicar con más episodios y semillas antes de tomar el dato como referencia robusta.
- Métrica no verificada: el campo `verified` del model-index es `false`; los resultados proceden exclusivamente del autor.
- Licencia no especificada: no hay información sobre uso comercial, lo que impide asumir permisos de redistribución o explotación en producción.
- Sin documentación de sesgos, alucinación o comportamiento fuera de distribución más allá del entorno de entrenamiento; en RL, la política puede degradarse ante perturbaciones numéricas o cambios en la escala de observaciones.
- Repositorio de 0.0 GB y sin descargas ni likes: no hay evidencia de uso comunitario ni de mantenimiento; el código y los pesos deben revisarse antes de reutilizarse.
- No es un modelo de lenguaje: cualquier expectativa de generación de texto, código o razonamiento es inaplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaquelBG05/Reinforce-CartPole-v1-unit4
- Práctica oficial de la Unidad 4 del curso Deep RL: https://huggingface.co/learn/deep-rl-course/unit4/hands-on
