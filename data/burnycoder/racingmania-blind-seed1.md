# BurnyCoder/racingmania-blind-seed1

## Resumen

racingmania-blind-seed1 es un agente de aprendizaje por refuerzo (RL) desarrollado por BurnyCoder (Libor "Burny" Burian) como parte del proyecto de investigación RacingMania, un juego de carreras 3D de contrarreloj para navegador construido con three.js y el motor de físicas cannon-es (`RaycastVehicle`). El modelo resuelve el control de un vehículo en circuitos generados proceduralmente, y su calificación "blind" indica que el agente opera únicamente con el estado del coche y el punto más cercano de la línea central de la pista, sin percepción visual del entorno.

El agente se entrena con PPO sobre una implementación en PyTorch por lotes de la misma física del coche que usa el juego, lo que permite entrenar contra un simulador determinista y trasladar la política directamente al navegador. La arquitectura es una MLP de 2x256 con activación tanh para actor y crítico, con dos cabezas de tres vías (dirección y pedales). El objetivo de recompensa es el progreso sobre la línea central.

Es relevante como ejemplo de pipeline completo de RL aplicado a un dominio interactivo: física portada a PyTorch, entrenamiento PPO, exportación a ONNX y despliegue en un juego web. No obstante, en el momento de la ficha el modelo está en estado **planned**: el repositorio registra código y configuración antes del entrenamiento, y la model card indica explícitamente que no se ha evaluado todavía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y crítico), dos cabezas de 3 vías |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El agente es una red neuronal de política y valor (actor-crítico) con dos capas ocultas de 256 unidades y activación tanh. La cabeza de actor produce dos distribuciones categóricas de tres clases: dirección (izquierda, ninguna, derecha) y pedales (acelerar, coast, frenar). La observación combina el estado del coche con el punto más cercano de la línea central, con una ventana configurable (`window_k`) que determina la dimensión de entrada. La normalización de observaciones se realiza con un `RunningNorm` congelado en inferencia.

El entrenamiento usa PPO sobre un port por lotes a PyTorch de la física de `RaycastVehicle` de cannon-es, con estados iniciales de parado y aleatorios sobre la línea central. La recompensa es el progreso sobre la línea central. La model card indica que los pasos de entrenamiento, las horas de reloj y el commit de git figuran como no registrados ("-"), y la sección de configuración de entrenamiento aparece como "Not logged yet". La física corresponde a la versión v1.

## Capacidades

- Control de conducción en circuitos 3D: dirección y pedales (gas, coast, freno) mediante política categórica.
- Operación "blind": no usa visión; depende solo del estado del coche y de la línea central más cercana.
- Generalización a pistas generadas proceduralmente dentro del dominio del simulador.
- Inferencia determinista (acción más probable) o estocástica según el modo de muestreo.
- Exportación a ONNX con función de observación, normalizador congelado y actor en un único grafo, ejecutable en el navegador.
- Integración con el juego web para visualizar al agente en modo "Watch the AI".
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigación en RL aplicado a conducción: el agente sirve como línea base reproducible para comparar algoritmos (PPO frente a SAC, TD3, etc.) sobre la misma física y el mismo objetivo de progreso.
- Desarrollo de NPCs o pilotos automáticos para juegos de carreras en navegador: el ONNX se carga directamente en el cliente y controla el coche sin backend.
- Validación de portabilidad de física: entrenar contra el port en PyTorch y desplegar contra cannon-es permite medir la brecha sim-a-real dentro del propio juego.
- Estudio de percepción mínima ("blind"): comparar este agente con variantes con visión para cuantificar cuánto aporta la información visual frente a la línea central.
- Generación procedural de circuitos: evaluar la robustez del agente ante pistas nuevas generadas por el sistema del juego.
- Docencia y divulgación: pipeline completo y abierto (entrenamiento, exportación ONNX, integración web) útil para enseñar RL de extremo a extremo.
- Benchmarking de evaluación: la métrica SWS (velocidad ponderada por éxito) permite comparar agentes frente a un piloto scriptado de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "_Not evaluated yet._" y los campos de pasos entrenados y horas de reloj figuran sin registrar.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una MLP de 2x256 con dos cabezas de 3 clases ocupa del orden de cientos de kilobytes en fp32, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren; cualquier GPU moderna (RTX 3060 o superior) es sobrada para inferencia. Para entrenamiento PPO por lotes se recomienda una GPU con al menos 8-12 GB, aunque no hay datos publicados de consumo.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: PyTorch (cargando `final.pt` dentro del repositorio), ONNX Runtime (`policy.onnx`) y el propio juego web en el navegador.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| racingmania-blind-seed1 | Agente RL (PPO, MLP) | no disponible | no aplica | MIT | Hugging Face, estado planned |
| Otros agentes del proyecto RacingMania (semillas y variantes) | Agente RL (PPO, MLP) | no disponible | no aplica | MIT | Repositorio del autor |
| Agentes RL para juegos de carreras (p. ej. GT Sophy, OpenAI Five-like) | Agente RL | no disponible | no aplica | no disponible | No comparables directamente por escala y dominio |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Estado **planned**: el modelo está registrado antes del entrenamiento y no se ha evaluado; no debe considerarse un artefacto validado.
- Sin métricas publicadas: no hay resultados de SWS, curvas de entrenamiento ni configuración de entrenamiento registrada.
- Percepción "blind": el agente no ve la pista; su rendimiento depende de la calidad de la línea central y del estado del coche.
- Dependencia del simulador: entrena contra un port de la física de cannon-es; pequeñas divergencias entre el port y el motor real pueden degradar el comportamiento.
- Dominio estrecho: solo conduce en el entorno RacingMania; no es transferible a otros dominios sin reentrenamiento.
- Sin capacidades de lenguaje, visión, audio ni tool calling.
- Riesgo de sobreajuste a las pistas del pool de entrenamiento; la generalización a circuitos nuevos no está verificada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No apto para producción hasta que existan resultados de evaluación reproducibles.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/racingmania-blind-seed1
- Repositorio del proyecto (código, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Documentación de formatos (`docs/formats.md`, sección "Policy model") dentro del repositorio anterior.
- Juego web (GitHub Pages): enlazado desde el repositorio del proyecto.
