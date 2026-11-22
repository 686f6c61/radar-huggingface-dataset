# RaquelBG05/ppo-LunarLander-v2-unit8

## Resumen

`ppo-LunarLander-v2-unit8` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Proximal Policy Optimization (PPO) sobre el entorno `LunarLander-v2` de Gymnasium (con el motor físico Box2D). Lo publica la usuaria RaquelBG05 como práctica de la unidad 8 del curso Deep Reinforcement Learning, y no es un modelo de lenguaje: es una política neuronal que controla la nave del juego de aterrizaje lunar.

El repositorio contiene los pesos de la política y del crítico entrenados en PyTorch, junto con el código auxiliar (`ppo.py`) necesario para instanciar el agente y evaluarlo. El checkpoint publicado corresponde a 460.800 interacciones de entrenamiento sobre un presupuesto total de 1.003.520, seleccionado mediante doce episodios de validación.

Su relevancia es fundamentalmente didáctica: sirve como referencia reproducible de un pipeline PPO completo (entrenamiento, selección de checkpoint y evaluación con semillas nuevas) para quienes estudian RL profundo. No está pensado para uso en producción ni para tareas de generación de texto, visión o razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y crítico entrenada con PPO (PyTorch); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones por paso; dimensión no disponible) |
| Tipos de cuantizacion | no disponible (checkpoint en `model.pt`, pesos en coma flotante de PyTorch) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict de PyTorch) |

## Arquitectura y entrenamiento

El agente sigue el esquema actor-crítico de PPO: una política que produce la distribución de acciones y un crítico que estima el valor del estado, ambos implementados en PyTorch. El entorno es `LunarLander-v2` de Gymnasium 0.29.1 con Box2D, un problema de control continuo con recompensa discreta por aterrizaje. No se detalla en la información disponible el número de capas, las dimensiones ocultas ni los hiperparámetros de PPO (clip ratio, epochs, tamaño de batch, learning rate).

El entrenamiento se realizó hasta 1.003.520 interacciones, con un checkpoint intermedio en 460.800 interacciones. La selección del checkpoint se hizo con doce episodios de validación y la evaluación final con 60 episodios y semillas nuevas (semilla 8300). No se menciona uso de RLHF, DPO ni innovaciones técnicas adicionales más allá del PPO estándar.

## Capacidades

- Control de política en el entorno `LunarLander-v2`: selecciona acciones discretas (no hacer nada, encender motor principal, motores laterales) a partir de observaciones del estado de la nave.
- Aprendizaje por refuerzo con actor-crítico: la política y el crítico se cargan por separado desde un state dict de PyTorch.
- Evaluación reproducible: el script de evaluación acepta semilla y número de episodios, lo que permite repetir experimentos.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No dispone de modo thinking ni de decodificación especulativa.

## Casos de uso

- Docencia de RL profundo: usar el checkpoint como ejemplo funcional de PPO para explicar en clase el bucle de entrenamiento, la selección de checkpoint por validación y la evaluación con semillas nuevas.
- Reproducción de experimentos: cargar `model.pt` con `torch.load` y ejecutar `evaluar(agente, semilla=8300, episodios=60)` para contrastar el retorno medio declarado (117,51 ± 115,66).
- Punto de partida para ajuste fino: reutilizar la política como inicialización en variantes de `LunarLander-v2` o en entornos de control continuo similares, midiendo la transferencia.
- Comparación de algoritmos: enfrentar este agente PPO con variantes DQN, A2C o SAC sobre el mismo entorno para analizar estabilidad y varianza del retorno.
- Análisis de varianza: la desviación típica elevada (±115,66) permite estudiar la sensibilidad del agente a la semilla inicial y a la política de exploración.
- Material de referencia para pipelines de RL: el código `ppo.py` y el cuaderno de Colab sirven como plantilla para estructurar proyectos de entrenamiento con Gymnasium y PyTorch.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reinforcement learning | LunarLander-v2 | mean_reward | 117,51 ± 115,66 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,0 GB) y la naturaleza del entorno, la inferencia cabe holgadamente en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente, aunque no es necesaria.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna; también en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`), ejecución del script `ppo.py` y reproducción en Google Colab mediante el cuaderno enlazado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del paso de simulación de Box2D y del hardware.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros agentes PPO sobre `LunarLander-v2` comparables en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite instrucciones en lenguaje natural.
- La métrica declarada (117,51 ± 115,66) presenta una desviación típica muy alta en relación con la media, lo que sugiere un comportamiento inestable entre episodios y semillas.
- El resultado no está verificado de forma independiente (`verified: false` en el model-index).
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- Entorno acotado: el agente está entrenado exclusivamente para `LunarLander-v2` con Gymnasium 0.29.1 y Box2D; no se garantiza su funcionamiento en otras versiones o entornos.
- No se documentan sesgos, alucinaciones ni restricciones idiomáticas porque no aplican a este tipo de modelo.
- El repositorio tiene 0 descargas y 0 likes, y el checkpoint se publicó sin documentación adicional sobre hiperparámetros o topología de red.

## Enlaces

- Hugging Face: https://huggingface.co/RaquelBG05/ppo-LunarLander-v2-unit8
- Cuaderno ejecutado en Google Colab: https://colab.research.google.com/drive/1mSfvMc_dVayfd7E3DLu3RRIIXcvjQcqD
