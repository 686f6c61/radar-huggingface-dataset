# BurnyCoder/racingmania-specialist-finetune-campaign-01-seed1

## Resumen

racingmania-specialist-finetune-campaign-01-seed1 es un agente de aprendizaje por refuerzo entrenado con PPO para conducir en RacingMania, un videojuego de carreras de 3D contrarreloj para navegador construido con three.js y cannon-es (`RaycastVehicle`). Lo desarrolla Libor "Burny" Burian (BurnyCoder) y forma parte de una campana de experimentos cuyo objetivo es entrenar pilotos automaticos sobre un port fisico en PyTorch del mismo modelo de coche que usa el juego, de forma que la politica aprendida pueda transferirse al navegador sin reentrenamiento.

El modelo es un especialista: parte del generalista de la semilla 1 y se ajusta finamente sobre una unica pista de campana (campaign-01). La politica es una MLP pequena de dos capas de 256 unidades con activacion tanh, con cabezas separadas para direccion y pedales (modo de accion factorizado), que observa el estado del coche mas 20 puntos de look-ahead sobre la linea central. Se entrenaron 200.278.016 pasos de agente con 16.384 entornos paralelos en apenas 0,26 horas de reloj, lo que refleja un pipeline de simulacion por lotes muy optimizado.

Su relevancia es doble: por un lado, demuestra un flujo completo de entrenamiento, evaluacion y despliegue (checkpoint PyTorch y grafo ONNX listo para el navegador) en un dominio de control continuo con generacion procedural de circuitos; por otro, publica resultados honestos sobre generalizacion, con una tasa de finalizacion del 31,8 % en 971 pistas generadas no vistas, lo que lo convierte en un caso de estudio util sobre sobreajuste a pistas concretas en RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezas de 3 acciones (direccion y pedales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observacion = estado del coche + 20 puntos de look-ahead (window_k=20, stride=3) |
| Tipos de cuantizacion | no disponible (exportacion ONNX en float32) |
| Idiomas soportados | no aplica (agente de control, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La politica es un actor-critico con cuerpo MLP compartido de dos capas de 256 unidades y tanh, y dos cabezas de tres vias en modo de accion factorizado: una para direccion (izquierda, ninguna, derecha) y otra para pedales (acelerar, inercia, frenar). La observacion combina el estado del coche con 20 puntos de look-ahead muestreados cada 3 pasos sobre la linea central de la pista, y pasa por un normalizador de media movil (`RunningNorm`) que se congela en inferencia. El algoritmo es PPO con GAE (lambda 0,95, gamma 0,99), clip de 0,2, 4 minilotes, 5 epocas de actualizacion, coeficiente de entropia 0,01 y learning rate adaptativo con KL objetivo de 0,01 (rango 1e-5 a 1e-2).

El entrenamiento se realizo sobre una sola pista de campana, con 16.384 entornos paralelos, 32 pasos por entorno y un total de 200 millones de pasos, usando `torch.compile`. Los estados de arranque se sortean al 50 % entre parado y posicion aleatoria sobre la linea central (velocidad 0-30, desplazamiento lateral 0,5), con un maximo de 1.500 pasos por episodio. La recompensa se basa en el progreso sobre la linea central, escalada por 0,1, sin coste temporal ni penalizacion por caida. El ajuste fino parte del generalista de la semilla 1 y se especializa en campaign-01, lo que explica el mejor rendimiento en pistas hechas a mano frente a las generadas.

## Capacidades

- Control de conduccion en tiempo real: decide direccion y pedales a partir del estado del coche y de la geometria local de la pista.
- Seguimiento de linea central mediante look-ahead de 20 puntos, lo que le permite anticipar curvas.
- Arranque desde parado y desde posiciones aleatorias de la pista, gracias a la aleatorizacion durante el entrenamiento.
- Inferencia determinista (accion mas probable) o estocastica segun se configure.
- Exportacion a ONNX con observacion, normalizador y actor en un unico grafo, ejecutable con onnxruntime en el navegador.
- Integracion directa con el juego RacingMania mediante el selector "Watch the AI".
- No soporta tool calling, agentes multi-paso, texto, vision, audio ni capacidades multilingues: es un agente de control puro.

## Casos de uso

- Demostracion jugable de conduccion autonoma: el grafo `policy.onnx` se carga en el navegador y el agente conduce en las pistas de campana, sirviendo como escaparate tecnico del proyecto.
- Investigacion en RL para control continuo: el checkpoint `final.pt` permite reproducir el entrenamiento con `uv sync` y el repositorio, util para estudiar PPO con entornos masivamente paralelos.
- Estudio de generalizacion y sobreajuste: con 971 pistas generadas no vistas y una tasa de finalizacion del 31,8 %, es un banco de pruebas para medir la brecha entre pistas de entrenamiento y pistas nuevas.
- Base para ajuste fino en nuevas pistas: al ser un especialista de campaign-01, sirve como punto de partida para campanas de fine-tuning sobre otros circuitos.
- Referencia de pipeline de despliegue: el par `final.pt` + `policy.onnx` ejemplifica el flujo entrenamiento en PyTorch, exportacion a ONNX e inferencia en cliente web con onnxruntime.
- Benchmark interno de conduccion: la metrica SWS (success-weighted speed) y la tasa de finalizacion permiten comparar variantes del agente y semillas dentro del mismo proyecto.
- Docencia en deep RL: la red pequena (2x256) y los tiempos de entrenamiento cortos (0,26 h) lo hacen adecuado para practicas y talleres.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). SWS = media sobre pistas de (finalizado x tiempo del piloto scriptado / tiempo del agente); 1,0 equivale a igualar al piloto de referencia en todas las pistas. Una ejecucion determinista por pista desde parado; intervalos de confianza al 95 % por bootstrap sobre pistas (una semilla).

| Conjunto de pistas | Pistas | SWS [IC 95 %] | Tasa de finalizacion |
|---|---|---|---|
| Campaign (hechas a mano) | 5 | 0,586 [0,000, 1,196] | 40,0 % |
| Test (generadas no vistas) | 971 | 0,478 [0,435, 0,523] | 31,8 % |

## Requisitos de hardware

- Inferencia en navegador: el grafo `policy.onnx` es una MLP de 2x256, por lo que cabe holgadamente en CPU y no requiere GPU; se ejecuta con onnxruntime en el cliente.
- Entrenamiento: 16.384 entornos paralelos y 200 millones de pasos en 0,26 horas de reloj, lo que implica una GPU de datacenter con `torch.compile` (el autor no especifica el modelo exacto; no disponible).
- VRAM estimada para inferencia: no disponible, pero por el tamano de la red es del orden de decenas de MB en float32.
- Cabe en cualquier GPU consumer e incluso en CPU; no se requieren aceleradores dedicados para el despliegue.
- Opciones de despliegue: onnxruntime (navegador o servidor), PyTorch con el repositorio `racingmania`, y exportacion a otros runtimes ONNX.
- Latencia y throughput: no disponibles de forma explicita; el juego ejecuta la politica en tiempo real en el navegador.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un agente de RL especifico de un juego propio, sin equivalentes publicos directos con los que contrastar parametros, contexto o licencia. No disponible.

## Limitaciones y advertencias

- Especialista de una sola pista: se ajusto finamente sobre campaign-01 y su rendimiento cae en pistas generadas no vistas (SWS 0,478 y 31,8 % de finalizacion frente a 0,586 y 40,0 % en campana).
- Tasa de finalizacion baja: no termina la mayoria de las pistas, lo que lo hace inadecuado como piloto autonomo fiable sin mas entrenamiento o ajuste.
- Intervalos de confianza amplios en el conjunto de campana (5 pistas), con limite inferior 0,000; los resultados por pista son muy variables.
- Evaluacion con una sola semilla y una unica ejecucion determinista por pista; no hay validacion independiente de las metricas (`verified: false`).
- Sin capacidades de lenguaje, vision ni tool calling; no es un modelo de proposito general.
- Dependencia del entorno: la politica asume el modelo fisico `RaycastVehicle` y el formato de observacion del proyecto; cambios en la fisica o en la pista invalidan el agente.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Riesgo de sobreajuste a la linea central y a la geometria de campaign-01; el agente puede fallar en curvas o configuraciones no representadas en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/racingmania-specialist-finetune-campaign-01-seed1
- Repositorio del proyecto (codigo, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Juego RacingMania (GitHub Pages): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game (sitio publicado desde el repositorio)
