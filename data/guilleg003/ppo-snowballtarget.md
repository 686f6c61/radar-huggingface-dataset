# guilleg003/ppo-SnowballTarget

## Resumen

PPO SnowballTarget es una política neuronal entrenada con el algoritmo Proximal Policy Optimization (PPO) mediante Unity ML-Agents 1.1.0 sobre el entorno SnowballTarget, un escenario de aprendizaje por refuerzo en el que un agente debe apuntar y lanzar bolas de nieve contra objetivos. El modelo lo publica el usuario guilleg003 en Hugging Face y se distribuye en formato ONNX, listo para ser consumido por el motor de Unity a través del paquete de inferencia de ML-Agents. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de política entrenado para una tarea concreta dentro de un entorno de simulación.

El interés del repositorio es fundamentalmente didáctico y reproducible. La model card documenta explícitamente el stack de entrenamiento (Unity ML-Agents 1.1.0, PyTorch 2.2.2, configuración del curso y semilla 42) y el punto exacto de exportación (200 112 pasos del entrenador), lo que permite reproducir o auditar el experimento. La recompensa media registrada en el paso 200 000 fue de 25,891 con una desviación típica de 2,254, una métrica de rendimiento en episodios recientes de entrenamiento.

Dado que se trata de un modelo PPO pequeño exportado a ONNX para un único entorno, no dispone de arquitectura de lenguaje, contexto, tokenizador ni capacidades generativas. Su utilidad se limita a la inferencia dentro del entorno SnowballTarget o a servir como referencia para quienes sigan el mismo curso de ML-Agents.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor entrenada con PPO (Unity ML-Agents); topología concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (política de control, no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una política PPO entrenada con Unity ML-Agents 1.1.0 y PyTorch 2.2.2 sobre el entorno SnowballTarget, siguiendo la configuración del curso y con semilla 42. La model card no detalla la topología de la red (número de capas, unidades por capa, tipo de observaciones ni espacio de acciones), por lo que esos datos no están disponibles. El entrenamiento se exportó a ONNX en el paso 200 112 del entrenador, y el resumen del paso 200 000 registró una recompensa media de 25,891 con una desviación de 2,254 en los episodios recientes.

No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos; el interés técnico reside en la reproducibilidad del pipeline (versiones fijadas de ML-Agents y PyTorch, semilla declarada y punto de exportación explícito).

## Capacidades

- Control de agente en el entorno SnowballTarget de Unity ML-Agents: genera acciones a partir de las observaciones del entorno.
- Inferencia mediante ONNX, integrable en el motor de Unity a través de ML-Agents.
- Reproducibilidad del experimento: semilla 42, versiones de librerías y paso de exportación documentados.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento (thinking).
- No es un modelo generativo de texto.

## Casos de uso

- Reproducción de prácticas de curso: sirve como artefacto de referencia para quienes sigan la Unidad 5 del curso de ML-Agents y quieran comparar su propia política con una entrenada con la misma configuración y semilla.
- Inferencia en el entorno SnowballTarget: el ONNX puede cargarse en Unity para ejecutar el agente entrenado sin necesidad de reentrenar, útil para demostraciones o validación del comportamiento aprendido.
- Comparación de hiperparámetros: al fijar semilla y versiones, permite aislar el efecto de cambios en la configuración de PPO sobre la recompensa media.
- Docencia de aprendizaje por refuerzo: ejemplo mínimo y verificable de un ciclo completo entrenamiento-exportación-inferencia con ML-Agents.
- Auditoría de pipelines de exportación ONNX: útil para comprobar que la exportación desde PyTorch 2.2.2 a ONNX funciona correctamente con ML-Agents 1.1.0.
- Punto de partida para fine-tuning o continuación del entrenamiento: el checkpoint exportado puede servir como base para experimentos posteriores en el mismo entorno.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | ML-Agents-SnowballTarget | Training mean reward | 25,891 +/- 2,254 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un ONNX de un entorno ML-Agents, el modelo es de tamaño reducido y cabe holgadamente en cualquier GPU consumer, aunque no se documenta el tamaño exacto de los pesos.
- GPU recomendadas: no disponible; cualquier GPU compatible con la inferencia ONNX de Unity debería ser suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna con soporte ONNX, aunque no se aportan cifras concretas.
- Opciones de despliegue: inferencia ONNX dentro del motor de Unity mediante ML-Agents; no se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI) porque no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (políticas PPO para el entorno SnowballTarget) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Específico de un único entorno: la política solo es válida para SnowballTarget con la configuración de observaciones y acciones del curso; no generaliza a otras tareas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Métricas no verificadas: la recompensa media procede del propio autor y está marcada como no verificada; no hay evaluación independiente.
- Sin documentación de topología: al no detallarse la arquitectura de la red, es difícil auditar el modelo o replicarlo exactamente.
- Riesgo de sobreajuste al entorno de entrenamiento: al ser una política entrenada para una tarea concreta, el comportamiento fuera de la distribución de observaciones del entorno puede degradarse sin aviso.
- Sin soporte de lenguaje ni capacidades generativas: no debe emplearse para tareas de texto, código, visión o razonamiento.
- Tamaño de repositorio de 0,0 GB: no se especifica el tamaño real de los artefactos; verificar la integridad de la descarga antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guilleg003/ppo-SnowballTarget
- Unity ML-Agents (documentación y repositorio): https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents 1.1.0: https://github.com/Unity-Technologies/ml-agents/tree/release_20_docs
- PyTorch 2.2.2: https://pytorch.org/
- ONNX: https://onnx.ai/
