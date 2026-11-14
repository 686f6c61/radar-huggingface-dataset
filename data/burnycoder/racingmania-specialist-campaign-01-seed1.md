# BurnyCoder/racingmania-specialist-campaign-01-seed1

## Resumen

racingmania-specialist-campaign-01-seed1 es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con PPO para conducir en RacingMania, un juego de carreras contrarreloj 3D para navegador construido con three.js y el vehiculo `RaycastVehicle` de cannon-es. El modelo lo desarrolla Libor "Burny" Burian (BurnyCoder) y forma parte de una campana de agentes especialistas: en este caso, un agente entrenado sobre una unica pista de la campana (campaign-01) con la semilla 1. No es un modelo de lenguaje, sino una politica neuronal que mapea el estado del coche y 20 puntos de previsualizacion de la pista a acciones de direccion y pedal.

La arquitectura es una MLP de 2x256 unidades con activacion tanh, con cabezas separadas (actor y critico) y dos cabezas de tres vias para las acciones factoriales (izquierda/ninguna/derecha y gas/deriva/freno). El entrenamiento se realizo sobre un port en PyTorch de la fisica del coche, con 16 384 entornos paralelos, 200,27 millones de pasos de agente y un coste de reloj de 0,25 horas. El resultado se distribuye en formato PyTorch (`final.pt`) y ONNX (`policy.onnx`), este ultimo integrado directamente en el juego del navegador.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de RL (entorno, entrenamiento masivo en paralelo, evaluacion con intervalos de confianza bootstrap y despliegue en navegador via ONNX). Los resultados son modestos: SWS de 0,577 en las 5 pistas de la campana (40,0 % de finalizacion) y 0,286 en 971 pistas generadas no vistas (19,8 % de finalizacion), lo que refleja un sobreajuste a la pista de entrenamiento y una capacidad de generalizacion limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezas de 3 vias (acciones factoriales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observacion: estado del coche + 20 puntos de previsualizacion, `window_k=20`, `window_stride=3`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El agente es una red MLP con dos capas ocultas de 256 unidades y activacion tanh, que comparte tronco entre actor y critico y expone dos cabezas de tres vias para las acciones factoriales: direccion (izquierda/ninguna/derecha) y pedal (gas/deriva/freno). La observacion combina el estado del coche con 20 puntos de previsualizacion de la linea central de la pista (`window_k=20`, `window_stride=3`), normalizados mediante un `RunningNorm` congelado durante la evaluacion. El objetivo de recompensa es el progreso por la linea central.

El entrenamiento usa PPO con 16 384 entornos paralelos, 32 pasos por entorno, tasa de aprendizaje adaptativa (0,001 inicial, rango 1e-5 a 0,01, KL objetivo 0,01), `gamma=0.99`, `gae_lambda=0.95`, 4 minibatches, 5 epocas de actualizacion y recorte de 0,2. Se entrenaron 200 278 016 pasos de agente en 0,25 horas de reloj con `torch.compile` activado. Los estados de inicio son en parado y aleatorios sobre la linea central (p=0,5), con velocidad inicial entre 0 y 30 y desplazamiento lateral de 0,5. Solo se cargo una pista (`loaded_tracks=1`, `rotate_tracks_every=0`), lo que explica el caracter especialista del agente. La fisica corresponde a la version v1 y el commit de referencia es `11c90044c89cbecc5c74ac9d04237b431365514e`.

## Capacidades

- Control de conduccion en un juego de carreras 3D: direccion y pedal (gas/deriva/freno) a partir del estado del coche y la geometria local de la pista.
- Seguimiento de la linea central con previsualizacion de 20 puntos, lo que le permite anticipar curvas dentro de la ventana observada.
- Arranque desde parado y desde posiciones aleatorias sobre la linea central, gracias a la distribucion de estados iniciales del entrenamiento.
- Inferencia determinista (accion mas probable) o estocastica, segun el modo de muestreo del actor.
- Despliegue en navegador mediante ONNX Runtime: el grafo `policy.onnx` incluye la funcion de observacion, el normalizador congelado y el actor.
- Ejecucion en CPU: al ser una MLP pequena, no requiere GPU para inferencia.
- No soporta tool calling, agentes multi-paso, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Demostracion interactiva en navegador: el agente se carga como `policy.onnx` en el juego RacingMania y se selecciona en el menu "Watch the AI" para observar como conduce en las pistas de la campana, donde alcanza un 40 % de finalizacion.
- Baseline de referencia para nuevos agentes: sirve como punto de comparacion reproducible (SWS 0,577 en campana, 0,286 en test generado) frente a variantes con mas pistas o mayor capacidad, dentro del mismo repositorio y configuracion PPO.
- Estudio del sobreajuste en RL: el contraste entre el rendimiento en la pista de entrenamiento y en 971 pistas no vistas cuantifica la brecha de generalizacion de un especialista entrenado con una sola pista.
- Validacion de pipelines de simulacion masiva: la configuracion con 16 384 entornos y 200 millones de pasos en 0,25 horas sirve de plantilla para entrenar politicas en entornos fisicos batched en PyTorch.
- Pruebas de integracion PyTorch a ONNX: el par `final.pt`/`policy.onnx` permite verificar la equivalencia numerica entre el checkpoint de entrenamiento y el grafo exportado que consume el navegador.
- Docencia y divulgacion de RL: el ejemplo completo (entorno, recompensa por progreso, PPO, evaluacion con intervalos bootstrap) es util para explicar el ciclo completo de un agente de control continuo discretizado.
- Benchmark de fisica de vehiculos: al compartir el port de `RaycastVehicle`, el agente puede emplearse para comparar configuraciones de fisica (version v1) en terminos de finalizacion y velocidad media.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`). SWS (success-weighted speed) es la media sobre pistas de finalizacion x (tiempo del conductor scriptado / tiempo del agente); 1,0 equivale a igualar al conductor de referencia en todas las pistas. Una ejecucion determinista por pista desde parado; intervalos del 95 % por bootstrap de percentiles sobre pistas (una semilla).

| Conjunto de pistas | Pistas | SWS [IC 95 %] | Finalizacion |
|---|---|---|---|
| Campana (hechas a mano) | 5 | 0,577 [0,000, 1,188] | 40,0 % |
| Test (generadas no vistas) | 971 | 0,286 [0,250, 0,323] | 19,8 % |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; la MLP 2x256 ocupa unos pocos cientos de kilobytes en float32 y cabe en CPU.
- GPU recomendadas: ninguna imprescindible; cualquier CPU moderna basta para la inferencia en tiempo real dentro del juego. Para reentrenar, se recomienda una GPU con suficiente memoria para 16 384 entornos batched (no se especifica el modelo exacto en la informacion disponible).
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; el despliegue objetivo es el navegador via ONNX Runtime (WebAssembly/WebGL segun el runtime).
- Opciones de despliegue: ONNX Runtime (`policy.onnx`) para el juego web; PyTorch (`final.pt`) para scripts y evaluacion con `racingmania.runs.load_policy`.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento completo requirio 0,25 horas de reloj con `torch.compile` y 16 384 entornos paralelos.

## Comparativa con modelos similares

No se dispone de datos de otros agentes comparables en la informacion proporcionada (mismo juego, misma tarea o misma configuracion). El repositorio del autor incluye una campana de especialistas y probablemente variantes con distintas semillas y pistas, pero sus resultados no se detallan aqui. Se indica, por tanto, "no disponible".

| Modelo | Parametros | Contexto | SWS (campana) | SWS (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| racingmania-specialist-campaign-01-seed1 | no disponible (MLP 2x256) | no aplica | 0,577 | 0,286 | MIT | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sobreajuste claro a la pista de entrenamiento: la finalizacion cae del 40,0 % en campana al 19,8 % en pistas generadas no vistas, y el SWS del 0,577 al 0,286.
- Intervalo de confianza muy amplio en campana ([0,000, 1,188]) por disponer solo de 5 pistas y una semilla; las conclusiones sobre ese conjunto son estadisticamente fragiles.
- Entrenado con una unica pista (`loaded_tracks=1`): no se espera generalizacion a geometrias nuevas sin reentrenamiento o fine-tuning.
- Evaluacion determinista con una sola ejecucion por pista y una semilla; no se reporta varianza entre semillas de entrenamiento.
- Sin datos de sesgos, alucinacion o comportamiento fuera de distribucion mas alla de la caida de rendimiento observada; el agente puede fallar en curvas o configuraciones de pista no representadas en la pista de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no se especifican restricciones adicionales.
- No es un modelo de lenguaje ni un modelo generativo de proposito general; cualquier uso fuera del dominio de conduccion en RacingMania carece de sentido.
- Los resultados de la model card estan marcados como no verificados (`verified: false`); conviene reproducirlos con el commit indicado antes de usarlos como referencia.
- La fisica corresponde a la version v1; cambios en el motor de fisica pueden invalidar la politica.

## Enlaces

- Modelo en Hugging Face: <https://huggingface.co/BurnyCoder/racingmania-specialist-campaign-01-seed1>
- Repositorio del proyecto (codigo, paper y resultados completos): <https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game>
- Juego RacingMania (GitHub Pages, mencionado en la model card): sitio del repositorio anterior
- Documentacion de formatos (`docs/formats.md`, seccion "Policy model"): dentro del repositorio anterior
