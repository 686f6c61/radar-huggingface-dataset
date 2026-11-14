# BurnyCoder/racingmania-specialist-finetune-campaign-03-seed1

## Resumen

racingmania-specialist-finetune-campaign-03-seed1 es un agente de aprendizaje por refuerzo (RL) entrenado con PPO para conducir un vehiculo en RacingMania, un videojuego original de carreras contrarreloj en 3D para navegador construido con three.js y cannon-es (`RaycastVehicle`). El autor, Libor "Burny" Burian (BurnyCoder), entrena los pilotos sobre un port en PyTorch por lotes de la misma fisica del coche que usa el juego web, de modo que la politica aprendida puede exportarse a ONNX y ejecutarse directamente en el navegador. Este checkpoint concreto es un especialista afinado a partir del generalista de la semilla 1 dentro de la campana 3 de fine-tuning.

No se trata de un modelo de lenguaje ni de un transformer: la politica es una MLP de dos capas de 256 unidades con activacion tanh, con actor y critico separados y dos cabezas de tres vias (una para direccion y otra para pedales). El objetivo de recompensa es el progreso por la linea central del circuito, y la observacion combina el estado del coche con 20 puntos de previsualizacion (look-ahead) sobre la pista. Se entreno durante 200.278.016 pasos de agente en una sola pista de campana (campaign-03), con 16.384 entornos paralelos.

Su relevancia es acotada pero clara para quien investiga RL aplicado a juegos: es un artefacto reproducible (incluye `final.pt`, `policy.onnx`, `run.json`, curvas de entrenamiento y CSVs de evaluacion), con licencia MIT, pensado para integrarse en el repositorio del proyecto y visualizarse en el propio juego. El estado declarado es "trained", es decir, entrenado hasta su presupuesto de pasos pero aun no evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezas de 3 vias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observacion `window_k` = 20 puntos look-ahead con stride 3) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; export ONNX en float32) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`, con state dicts de `agent` y `norm`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La politica es una red neuronal de perceptron multicapa con dos capas ocultas de 256 neuronas y activacion tanh, con modulos separados de actor y critico. El modo de accion es `factored`, con dos cabezas discretas de tres vias: direccion (izquierda / ninguna / derecha) y pedales (acelerar / inercia / frenar). La observacion integra el estado del coche mas 20 puntos de look-ahead sobre la pista (`window_k` = 20, `window_stride` = 3), y las observaciones pasan por un normalizador de media y varianza en ejecucion (`RunningNorm`) que se congela al exportar a ONNX.

El entrenamiento usa PPO con 16.384 entornos paralelos, 32 pasos por entorno y 4 minibatchs, con tasa de aprendizaje adaptativa (objetivo de KL de 0,01, rango entre 1e-5 y 1e-1), gamma 0,99, GAE lambda 0,95, 5 epocas de actualizacion, coeficiente de clipping 0,2, entropia 0,01 y valor 1,0, sin weight decay. El presupuesto fue de 200.000.000 pasos, completados en 0,27 horas de reloj. Los estados de inicio combinan arranque parado y arranque aleatorio sobre la linea central (probabilidad 0,5, velocidad inicial entre 0 y 30, desplazamiento lateral de 0,5), con un maximo de 1.500 pasos por episodio y recompensa escalada a 0,1. La campana usa una sola pista (`loaded_tracks` = 1) y no rota pistas (`rotate_tracks_every` = 0). El commit de referencia es `f534e2ecfd35ac1483fdb9b36f269df935d25a07`, fisica version v1.

## Capacidades

- Conduccion autonoma en RacingMania: controla direccion y pedales a partir del estado del coche y de la geometria local de la pista.
- Seguimiento de linea central: la recompensa es el progreso por la linea central, por lo que la politica esta optimizada para avanzar rapidamente por el circuito.
- Generalizacion limitada a una pista: entrenado en una sola pista de la campana 3; no se documenta transferencia a otras pistas.
- Arranque desde parado y desde posiciones aleatorias sobre la linea central, gracias al muestreo de estados iniciales durante el entrenamiento.
- Inferencia en navegador: la exportacion ONNX agrupa funcion de observacion, normalizador congelado y actor en un unico grafo, ejecutable con onnxruntime en el juego.
- Inferencia en PyTorch: carga de `final.pt` con `ActorCritic` y `RunningNorm` dentro del repositorio.
- Seleccion determinista de accion: `agent.act(..., deterministic=True)` devuelve la accion mas probable (argmax sobre las logits de cada cabeza).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingues ni vision; no es un modelo generativo de texto.

## Casos de uso

- Visualizacion de pilotos IA en el juego: cargar `policy.onnx` en `web/index.html` y elegir el modelo en la seccion "Watch the AI" para observar al agente conduciendo en el navegador; es el caso de uso previsto por el autor.
- Investigacion en RL para videojuegos: usar `final.pt` y `run.json` como punto de partida reproducible para estudiar PPO con entornos masivamente paralelos (16.384 envs) y tasa de aprendizaje adaptativa por KL.
- Fine-tuning de especialistas: al ser un especialista de la campana 3 derivado del generalista de la semilla 1, sirve como base para experimentos de curriculum o de especializacion por pista.
- Analisis de fisica de vehiculos: comparar el comportamiento del agente con la fisica `RaycastVehicle` de cannon-es y el port en PyTorch, verificando la paridad entre el entorno de entrenamiento y el juego.
- Evaluacion de metricas de conduccion: emplear los CSVs de `eval/` y la metrica SWS (velocidad ponderada por exito) para medir progreso y tiempo de vuelta frente al piloto scriptado de referencia.
- Despliegue ligero en entornos sin GPU: la MLP es pequena y la exportacion ONNX permite ejecucion en CPU o incluso en navegador, lo que facilita demos y pruebas de integracion.
- Reproducibilidad de experimentos: el checkpoint incluye configuracion completa de PPO y entorno, semilla y commit, lo que permite reentrenar o auditar el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo esta "trained" pero "not yet evaluated"; la metrica definida (SWS, velocidad ponderada por exito, con intervalos bootstrap al 95 % sobre pistas y una sola semilla) no tiene valores reportados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una MLP de 2x256 neuronas, la huella es minima y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: innecesarias para inferencia; cualquier GPU (por ejemplo, RTX 4090, RTX 3060 o integradas) sirve. Para reentrenar con 16.384 entornos paralelos se requiere una GPU de datacenter (A100, H100) o un presupuesto de memoria acorde al numero de entornos.
- Cabe en consumer GPU: si, con margen amplio; el cuello de botella real es el entorno de simulacion por lotes, no la red.
- Opciones de despliegue: onnxruntime (via `policy.onnx`) en navegador o servidor, y PyTorch dentro del repositorio (`racingmania.runs.load_policy`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponible. El entrenamiento completo de 200.278.016 pasos consumio 0,27 horas de reloj, lo que da una idea del throughput del pipeline de entrenamiento, pero no se reportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| racingmania-specialist-finetune-campaign-03-seed1 | no disponible (MLP 2x256) | ventana look-ahead de 20 puntos | no evaluado (SWS sin valores) | MIT | Hugging Face + repo GitHub |
| Generalista seed-1 (misma campana) | no disponible | ventana look-ahead de 20 puntos | no disponible | MIT | repo GitHub |
| Otros especialistas de campaign-03 | no disponible | ventana look-ahead de 20 puntos | no disponible | MIT | repo GitHub |

No se dispone de modelos comparables externos documentados en la informacion proporcionada; las alternativas naturales son los demas checkpoints del mismo proyecto, cuyos datos no se detallan.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara estado "trained" y "not yet evaluated"; no hay cifras de rendimiento que respalden su calidad.
- Entrenado en una sola pista (`loaded_tracks` = 1): no hay evidencia de generalizacion a otros circuitos.
- Una sola semilla: los intervalos bootstrap sobre pistas son de una unica semilla, por lo que la variabilidad entre entrenamientos no esta caracterizada.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingues ni de razonamiento simbolico; cualquier uso fuera de la conduccion en RacingMania no esta soportado.
- Riesgo de sobreajuste a la fisica v1 y al commit indicado: cambios en la fisica o en la version del juego pueden invalidar la politica.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser una politica entrenada por recompensa de progreso, puede adoptar comportamientos agresivos no deseados en contextos distintos de la contrarreloj.
- Restricciones de licencia: MIT permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales.
- Caveat de produccion: la inferencia determinista usa argmax por cabeza, lo que puede producir comportamientos poco exploratorios; para demos interactivas conviene validar el comportamiento en todas las pistas de interes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/racingmania-specialist-finetune-campaign-03-seed1
- Repositorio del proyecto (codigo, paper y resultados completos): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Documentacion de formatos (`docs/formats.md`, seccion "Policy model"): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game/blob/main/docs/formats.md
- Juego web (`web/index.html`): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game/blob/main/web/index.html
