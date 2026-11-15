# BurnyCoder/racingmania-specialist-finetune-campaign-04-seed1

## Resumen

racingmania-specialist-finetune-campaign-04-seed1 es un agente de aprendizaje por refuerzo (reinforcement learning) desarrollado por BurnyCoder (Libor "Burny" Burian) para RacingMania, un juego de carreras 3D de tipo time-attack jugable en navegador construido con three.js y el `RaycastVehicle` de cannon-es. No es un modelo de lenguaje: es una politica PPO especializada que controla un coche en un unico circuito de la campana del juego, obtenida mediante fine-tuning del generalista de la semilla 1 y entrenada contra un port batcheado en PyTorch de la misma fisica del vehiculo.

El modelo resuelve el problema de conduccion autonoma en pistas de carreras con generacion procedural: recibe el estado del coche mas 20 puntos de look-ahead sobre la linea central y emite dos decisiones discretas de tres vias (volante izquierda/recto/derecha y gas/planeo/freno). Su relevancia esta en servir como caso reproducible de deep RL aplicado a un entorno de juego original, con checkpoints, curvas de entrenamiento y evaluaciones por pista publicadas junto al codigo, el paper y el repositorio.

La arquitectura es una MLP de 2x256 con activacion tanh para actor y critico, con cabezas factorizadas, entrenada durante 200.278.016 pasos de agente en 0,26 horas de reloj con 16.384 entornos paralelos. El resultado es un especialista con rendimiento limitado: 26,5 % de SWS (success-weighted speed) y 17,9 % de tasa de finalizacion en 971 pistas generadas no vistas, lo que refleja un sobreajuste claro a la pista de entrenamiento de la campana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezas factorizadas de 3 vias |
| Parametros totales | no disponible (MLP pequena; no declarado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observacion = estado del coche + 20 puntos de look-ahead (window_k=20, stride=3) |
| Tipos de cuantizacion | no disponible; exportacion a ONNX con normalizador congelado |
| Idiomas soportados | no disponible (no es modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El agente sigue PPO con una red MLP de dos capas ocultas de 256 unidades y activacion tanh, compartida entre actor y critico, con dos cabezas de accion factorizadas de tres vias cada una (volante y pedales). La observacion combina el estado del coche con 20 puntos de look-ahead sobre la linea central muestreados cada 3 pasos, y el objetivo de recompensa es el progreso a lo largo de la linea central. El entrenamiento usa 16.384 entornos paralelos, 32 pasos por entorno, tasa de aprendizaje 3e-4 con ajuste adaptativo hacia un KL deseado de 0,01, GAE lambda 0,95, gamma 0,99, 4 minibatches y 5 epocas de actualizacion, con `torch.compile` activado.

Este checkpoint concreto es un especialista de la campana 04, semilla 1, afinado desde el generalista de la misma semilla sobre una unica pista de la campana. Los estados de inicio alternan arranque parado y arranque aleatorio sobre la linea central (p=0,5, velocidad entre 0 y 30, desplazamiento lateral de 0,5), con 1500 pasos maximos por episodio y escala de recompensa 0,1. No se aplican penalizaciones por caida ni coste temporal, y el autor indica que no hay rotacion de pistas durante el entrenamiento (`rotate_tracks_every=0`). Los 200 millones de pasos se completaron en 0,26 horas de reloj, lo que da una idea de la ligereza del entorno.

## Capacidades

- Control de conduccion en un juego de carreras 3D: decide volante (izquierda, recto, derecha) y pedales (gas, planeo, freno) a partir del estado del coche y la geometria local de la pista.
- Seguimiento de linea central mediante look-ahead: usa 20 puntos de la trayectoria de referencia como entrada, lo que le permite anticipar curvas en funcion de la ventana configurada.
- Inferencia en navegador: el grafo ONNX empaqueta funcion de observacion, normalizador congelado y actor, de modo que la politica se ejecuta directamente en el juego web.
- Reproducibilidad: checkpoint con `agent`, `norm`, configuracion PPO y `env_cfg`, ademas de `run.json`, curvas de entrenamiento y CSV de evaluacion por pista.
- Acciones deterministas o estocasticas: permite muestrear la accion o tomar la mas probable para evaluacion.
- No soporta tool calling, agentes multi-paso, vision, audio ni capacidades multilingues: es una politica de control, no un modelo generativo.

## Casos de uso

- Benchmark reproducible de RL: sirve como referencia de PPO en un entorno de conduccion con fisica realista y generacion procedural, util para comparar algoritmos, hiperparametros o tecnicas de curriculum.
- Estudio de sobreajuste en especialistas: al comparar este checkpoint con el generalista de la misma semilla se puede cuantificar la perdida de generalizacion al pasar de 5 pistas hechas a mano a 971 pistas generadas no vistas.
- Evaluacion de transferencia de politica: el par de conjuntos de evaluacion (campana y test generado) permite medir la brecha entre rendimiento en distribucion y fuera de distribucion con intervalos bootstrap.
- Integracion en el juego web: cargando `policy.onnx` con onnxruntime en el navegador, el agente conduce en tiempo real dentro de la seccion "Watch the AI".
- Base para fine-tuning adicional: al ser un especialista de una sola pista, es un punto de partida para experimentos de adaptacion rapida o de mezcla de especialistas.
- Docencia y divulgacion de deep RL: el codigo, el paper y las instrucciones de uso (PyTorch y ONNX) permiten reproducir el pipeline completo en un clon del repositorio con `uv sync`.
- Investigacion en generacion procedural aplicada a juegos: el conjunto de 971 pistas generadas no vistas actua como test de robustez para politicas de conduccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Conjunto de pistas | Pistas | SWS [IC 95 %] | Tasa de finalizacion |
|---|---|---|---|
| Campana (hechas a mano) | 5 | 0,424 [0,000, 1,271] | 20,0 % |
| Test (generadas no vistas) | 971 | 0,265 [0,229, 0,301] | 17,9 % |

SWS (success-weighted speed) es la media sobre pistas de finalizado x (tiempo del conductor scriptado / tiempo del agente); 1,0 significa terminar todas las pistas tan rapido como el conductor de referencia. La evaluacion usa una ejecucion determinista por pista desde parado con la accion mas probable, y los intervalos son bootstrap del percentil 95 sobre pistas con una sola semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: minimo, del orden de decenas de MB; el modelo es una MLP de 2x256 y el grafo ONNX incluye observacion y normalizador.
- GPU recomendadas: no requiere GPU; CPU es suficiente. Cualquier GPU consumer (por ejemplo, una RTX 4090) sobra para la inferencia.
- Cabe en cualquier GPU consumer y en CPU; tambien en el navegador via onnxruntime.
- Opciones de despliegue: PyTorch (checkpoint `final.pt` dentro del repositorio) y ONNX Runtime (`policy.onnx`) en el juego web.
- Latencia y throughput estimados: no disponibles de forma explicita; el entrenamiento completo de 200 millones de pasos requirio 0,26 horas de reloj con 16.384 entornos, lo que sugiere inferencia por paso muy rapida.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada. El autor menciona que este checkpoint se afina desde el generalista de la semilla 1 del mismo proyecto, pero no se han facilitado sus metricas para una comparacion directa.

| Modelo | Parametros | Contexto | SWS (test) | Finalizacion (test) | Licencia |
|---|---|---|---|---|---|
| racingmania-specialist-finetune-campaign-04-seed1 | no disponible | no aplica | 0,265 | 17,9 % | MIT |
| Generalista seed 1 (referencia del autor) | no disponible | no aplica | no disponible | no disponible | MIT |

## Limitaciones y advertencias

- Especializacion extrema: entrenado en una unica pista de la campana, con una tasa de finalizacion del 17,9 % en pistas generadas no vistas, lo que indica escasa generalizacion.
- Rendimiento modesto: SWS de 0,265 en test y de 0,424 en campana, con intervalos amplios en el conjunto pequeno de 5 pistas (IC 95 % de 0,000 a 1,271), por lo que la estimacion en campana es muy inestable.
- Evaluacion con una sola semilla y sin verificacion externa: el autor marca las metricas como no verificadas.
- Riesgo de sobreajuste a la fisica v1: el modelo esta entrenado contra una version concreta de la fisica; cambios en el motor o en `RaycastVehicle` pueden degradar el comportamiento.
- No hay datos sobre sesgos: al no ser un modelo linguistico, no aplican sesgos de lenguaje, pero no se ha documentado el comportamiento en escenarios de borde (colisiones, atascos, limites de pista).
- Sin soporte multilingue, tool calling ni agentes: no debe evaluarse como modelo generativo.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales declaradas.
- En produccion, conviene fijar la version de la fisica y el normalizador congelado para garantizar la reproducibilidad del comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/racingmania-specialist-finetune-campaign-04-seed1
- Repositorio GitHub (codigo, paper y resultados completos): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Juego RacingMania (GitHub Pages, seccion "Watch the AI"): disponible desde el repositorio anterior
- Documentacion de formatos (`docs/formats.md`, seccion "Policy model"): incluida en el repositorio anterior
