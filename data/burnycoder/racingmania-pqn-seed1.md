# BurnyCoder/racingmania-pqn-seed1

## Resumen

`racingmania-pqn-seed1` es un agente de aprendizaje por refuerzo desarrollado por BurnyCoder (Libor "Burny" Burian) dentro del proyecto de investigacion RacingMania. Se trata de una politica entrenada con PPO para conducir un coche en un juego de carreras 3D por navegador construido con three.js y el motor de fisicas cannon-es (`RaycastVehicle`). El modelo no es un modelo de lenguaje: es un controlador neuronal que mapea observaciones del entorno (estado del coche y puntos de mirada hacia delante) a acciones discretas de direccion y pedal.

La relevancia del artefacto es metodologica mas que de rendimiento: forma parte de una iniciativa que replica la fisica del coche en PyTorch para entrenar agentes de forma batcheada y despues exportarlos a ONNX para que corran en el navegador. La model card indica que el estado del run es "planned": el registro, el codigo y la configuracion se publicaron antes del entrenamiento, y la tarjeta se genero a partir de ficheros de resultado el 14 de noviembre de 2026.

En el momento de la publicacion no hay metricas de evaluacion, ni horas de entrenamiento, ni pasos de agente registrados. El checkpoint y el ONNX se distribuyen bajo licencia MIT, pero deben considerarse artefactos de un pipeline de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 con activacion tanh (actor y critico), dos cabezas de 3 vias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observacion es estado del coche + puntos de look-ahead) |
| Tipos de cuantizacion | no disponible (se distribuye checkpoint PyTorch y ONNX en precision original) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `final.pt` (PyTorch), `policy.onnx` (ONNX Runtime) |

## Arquitectura y entrenamiento

La politica es un perceptron multicapa de dos capas ocultas de 256 unidades con activacion tanh, compartido entre actor y critico, con dos cabezas de tres vias cada una: una para direccion (izquierda / ninguna / derecha) y otra para pedal (acelerar / inercia / frenar). La observacion por defecto combina el estado del coche con puntos de look-ahead sobre la pista, y el objetivo de recompensa es el progreso respecto a la linea central. El algoritmo de entrenamiento es PPO, con estados iniciales tanto desde parado como aleatorios sobre la linea central, y los datos provienen de un pool de entrenamiento generado proceduralmente.

La innovacion tecnica del proyecto no esta en la red sino en el pipeline: se entrena sobre un port batcheado en PyTorch de la misma fisica del coche que corre en el navegador, y se exporta un grafo ONNX que integra la funcion de observacion, el normalizador congelado y el actor, de modo que la inferencia en el juego coincide con la del entrenamiento. La model card declara explicitamente que no se han registrado aun pasos de agente, horas de reloj ni el commit de git asociado al run, y que la configuracion de entrenamiento no esta volcada en `run.json`.

## Capacidades

- Control de conduccion en un juego de carreras 3D: direccion discreta de tres vias y control de pedal de tres vias.
- Inferencia determinista seleccionando la accion mas probable (argmax sobre los logits de cada cabeza).
- Observacion basada en estado del coche mas puntos de look-ahead configurables mediante `window_k`.
- Exportacion a ONNX con funcion de observacion y normalizador integrados, ejecutable en navegador.
- Normalizacion de observaciones con `RunningNorm` en modo congelado durante la inferencia.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento: es un controlador de politica, no un modelo generativo.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a videojuegos: sirve como referencia reproducible de un pipeline PPO con fisica batcheada en PyTorch y exportacion ONNX.
- Benchmark de algoritmos de RL: al estar registrado con semilla fija (`seed1`), permite comparar variantes de PPO, cambios de recompensa o de observacion sobre la misma fisica.
- Demostracion interactiva en navegador: el `policy.onnx` se carga en el juego de GitHub Pages para visualizar al agente conduciendo en tiempo real.
- Estudio de transferencia simulacion-navegador: el port batcheado de la fisica de cannon-es permite medir la brecha entre el entorno de entrenamiento y el runtime del juego.
- Generacion procedural de pistas como banco de pruebas: el pool de entrenamiento generado proceduralmente se puede reutilizar para evaluar robustez del agente ante trazados no vistos.
- Docencia y divulgacion: el codigo y los ficheros de resultado (curvas de entrenamiento y validacion, CSV por pista en `eval/`) sirven como material didactico de un ciclo completo de RL.
- Base para agentes de conduccion mas complejos: la arquitectura y el formato de checkpoint (`agent`, `norm`, `ppo`, `env_cfg`, `obs_dim`) son un punto de partida para extender acciones o entradas.

## Benchmarks y rendimiento

La metrica definida por el autor es Success-Weighted Speed (SWS): media sobre pistas de (finalizado x tiempo del conductor scriptado / tiempo del agente), con 1.0 indicando que se completa cada pista tan rapido como el conductor de referencia, una ejecucion determinista por pista desde parado y usando la accion mas probable, con intervalos bootstrap del 95 por ciento sobre pistas para una sola semilla.

La model card indica explicitamente: "Not evaluated yet." No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una MLP 2x256 con dos cabezas de 3 vias ocupa del orden de unos pocos cientos de kilobytes en float32 (el numero exacto de parametros no esta disponible en la informacion proporcionada).
- GPU recomendadas: no requiere GPU dedicada; cabe en cualquier GPU consumer e incluso en CPU.
- Cabe en GPU consumer: si, en cualquier modelo actual (RTX 4090, RTX 3060, etc.) y en GPUs integradas.
- Opciones de despliegue: PyTorch (`final.pt`), ONNX Runtime (`policy.onnx`) y el runtime del juego en navegador; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano de la red se espera latencia despreciable por paso, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| racingmania-pqn-seed1 | no disponible | no aplica | no evaluado | MIT | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El run esta en estado "planned": no hay pasos de agente, horas de entrenamiento, commit de git ni configuracion de entrenamiento registrados en la model card.
- No se ha publicado ninguna evaluacion; el SWS esta definido pero marcado como "Not evaluated yet.".
- Es un controlador especifico del juego RacingMania y de su fisica v1; no es reutilizable fuera de ese entorno sin reentrenamiento.
- No procesa lenguaje ni tiene capacidades generativas, de vision o de audio; cualquier uso fuera del control de conduccion queda fuera de su alcance.
- Al ser una politica entrenada con una sola semilla, la varianza entre ejecuciones no esta caracterizada.
- Riesgo de sobreajuste al pool de pistas generado proceduralmente; no hay datos sobre generalizacion a trazados fuera de distribucion.
- La licencia MIT permite uso comercial, pero el artefacto no esta validado para produccion y carece de garantias de rendimiento.
- La fecha de creacion y actualizacion indicada (2026-11-14) procede de los metadatos del repositorio y no ha podido contrastarse con otra fuente.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/racingmania-pqn-seed1
- Repositorio del proyecto (codigo, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Documentacion de formatos (`docs/formats.md`, seccion "Policy model"): referenciada en la model card dentro del repositorio anterior.
- Juego en navegador (GitHub Pages): referenciado en la model card como sitio de GitHub Pages del repositorio; URL exacta no disponible en la informacion proporcionada.
