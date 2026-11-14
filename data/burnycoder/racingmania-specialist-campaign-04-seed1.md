# BurnyCoder/racingmania-specialist-campaign-04-seed1

## Resumen

racingmania-specialist-campaign-04-seed1 es un agente de aprendizaje por refuerzo (RL) entrenado con PPO para conducir un coche en RacingMania, un videojuego de carreras 3D de tipo time-attack para navegador desarrollado con three.js y cannon-es (`RaycastVehicle`). El modelo lo publica el autor del proyecto, Libor "Burny" Burian (BurnyCoder), como parte de una campana de experimentos de investigacion reproducibles. No es un modelo de lenguaje: es una politica de control que recibe el estado del coche y puntos de look-ahead sobre la pista, y emite dos acciones discretas de tres vias (volante y pedales).

La relevancia es acotada pero concreta: se trata de un checkpoint de investigacion dentro de un repositorio que incluye codigo, paper y resultados completos, con la fisica del coche reimplementada en PyTorch por lotes para entrenar en paralelo. El artefacto publicado incluye el checkpoint PyTorch (`final.pt`), una exportacion ONNX (`policy.onnx`) que es exactamente la que ejecuta el juego en el navegador, y ficheros de curvas de entrenamiento y evaluacion por pista.

Segun la propia model card, el estado del run es **planned**: los ficheros de codigo y configuracion se subieron antes del entrenamiento y la tarjeta se genero a partir de los ficheros de resultados. Los campos de pasos de entrenamiento, horas de reloj y commit de git figuran como no registrados ("-"), y la seccion de evaluacion indica explicitamente "_Not evaluated yet._". Conviene tratar este artefacto como un registro de campana pendiente de resultados, no como un agente con rendimiento verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezas discretas de 3 vias |
| Parametros totales | no disponible (MLP pequena; el numero exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observacion = estado del coche + puntos de look-ahead (`window_k`) |
| Tipos de cuantizacion | no disponible (no se documentan opciones de cuantizacion) |
| Idiomas soportados | no disponible (no aplica; el agente no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La politica es un `ActorCritic` con perceptron multicapa de dos capas ocultas de 256 unidades y activacion tanh, compartido entre actor y critico, con dos cabezas de accion discretas de tres vias cada una: volante (izquierda / ninguna / derecha) y pedales (acelerar / inercia / frenar). La observacion combina el estado del coche con puntos de look-ahead sobre la pista, parametrizados por `window_k`. El algoritmo de entrenamiento es PPO, con objetivo de progreso sobre la linea central de la pista, estados de inicio en posicion estatica y posiciones aleatorias sobre la linea central, y entrenamiento sobre una unica pista de campana (campaign-04). La fisica utilizada es la version v1.

El entrenamiento se ejecuta sobre un port batcheado en PyTorch de la misma fisica de coche que usa el juego (`RaycastVehicle` de cannon-es), lo que permite entrenar muchos entornos en paralelo manteniendo consistencia entre simulacion de entrenamiento y juego final. La normalizacion de observaciones se congela en inferencia mediante `RunningNorm` con `frozen = True`, y la exportacion ONNX empaqueta en un solo grafo la funcion de observacion, el normalizador congelado y el actor, que es exactamente lo que consume el juego en el navegador. Segun la model card, los campos de pasos de agente entrenados, horas de reloj y commit de git no estan registrados, y la configuracion de entrenamiento (`run.json`) aparece como "_Not logged yet._".

## Capacidades

- Control de conduccion en un juego de carreras 3D: emision de acciones discretas de volante y pedales a partir del estado del coche y de puntos de look-ahead.
- Inferencia en navegador mediante ONNX Runtime con un unico grafo que incluye observacion, normalizador congelado y actor.
- Ejecucion determinista en modo de evaluacion (`agent.act(..., deterministic=True)`), tomando la accion mas probable.
- Integracion con el juego RacingMania: el modelo aparece seleccionable en la opcion "Watch the AI" de la build web.
- Reutilizacion del checkpoint en Python dentro del repositorio (carga de `agent`, `norm`, `ppo` y `env_cfg` desde `final.pt`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes multi-paso ni capacidades multilingues: es una politica de control, no un modelo fundacional.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a videojuegos: sirve como checkpoint de referencia de una campana PPO sobre una pista concreta, util para comparar semillas y configuraciones dentro del mismo proyecto.
- Reproduccion de experimentos: cargando `final.pt` junto con las curvas de entrenamiento y los CSV de evaluacion por pista, permite auditar el proceso de entrenamiento y la metodologia de evaluacion (SWS con intervalos bootstrap al 95 %).
- Demostracion interactiva en navegador: la exportacion `policy.onnx` permite mostrar un agente RL conduciendo en el propio juego, sin backend Python, usando ONNX Runtime en el cliente.
- Desarrollo de pipelines de exportacion PyTorch a ONNX: el artefacto documenta en `docs/formats.md` (seccion "Policy model") las entradas y salidas del grafo, lo que lo convierte en un ejemplo concreto de congelacion de normalizador y empaquetado de actor en un solo modelo.
- Benchmark de fisicas y control: al compartir la fisica entre entrenamiento y juego, sirve para estudiar la brecha entre simulacion batcheada y ejecucion en el motor cannon-es.
- Base para experimentos de generalizacion entre pistas: aunque este run se entrena solo en campaign-04, el formato de checkpoint y la metrica SWS sobre multiples pistas permiten evaluar transferencia con otros runs del mismo proyecto.
- Docencia y ejercicios practicos de RL: la arquitectura MLP pequena y el codigo abierto (`uv sync` + carga del checkpoint) hacen viable montar practicas de PPO sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define la metrica principal, success-weighted speed (SWS), como la media sobre pistas de finished x (tiempo del conductor scriptado / tiempo del agente), con 1.0 indicando finalizar todas las pistas tan rapido como el conductor de referencia scriptado, y una ejecucion determinista por pista desde parado. Sin embargo, la seccion de evaluacion indica "_Not evaluated yet._" y los campos de pasos de agente entrenados y horas de reloj figuran sin registrar, por lo que no existen numeros que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: minima, del orden de decenas de megabytes o menos; la red es un MLP de dos capas de 256 unidades, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: innecesarias para inferencia; cualquier CPU moderna basta para ejecutar `policy.onnx` en el navegador. Para entrenamiento PPO con entornos batcheados, se beneficiaria de GPU (por ejemplo RTX 4090, A100) por el paralelismo de la fisica en PyTorch, aunque no se documentan requisitos concretos.
- Cabe en GPU consumer: si, en cualquier GPU consumer, e incluso en CPU y en el propio navegador del cliente.
- Opciones de despliegue: ONNX Runtime (navegador, tal como lo ejecuta el juego) y PyTorch dentro del repositorio (`racingmania.runs.load_policy`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros agentes RL comparables del mismo proyecto ni referencias externas con parametros, contexto, rendimiento y licencia verificables. Como referencia interna, el propio repositorio menciona otros runs de campana (por ejemplo, distintas semillas y campanas) con el mismo formato de checkpoint, pero sus resultados no se detallan en esta ficha.

## Limitaciones y advertencias

- Estado del run: la model card marca el estado como **planned**; pasos de agente entrenados, horas de reloj y commit de git no estan registrados, y la evaluacion indica "_Not evaluated yet._". No debe asumirse que el checkpoint tiene rendimiento validado.
- Entrenado solo en una pista (campaign-04): no hay evidencia publicada de generalizacion a otras pistas, condiciones o fisicas distintas de la version v1.
- Observacion limitada: el agente solo ve estado del coche y puntos de look-ahead; no procesa vision, mapa global ni lenguaje, por lo que no sirve para tareas fuera de este dominio.
- Acciones discretas de tres vias: el control es de baja resolucion (izquierda/ninguna/derecha y acelerar/inercia/frenar), lo que limita la precision de conduccion frente a politicas continuas.
- Riesgo de sobreajuste a la fisica de entrenamiento: aunque la fisica esta portada de forma consistente, cambios en `RaycastVehicle`, en la pista o en la configuracion del entorno pueden degradar el comportamiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales, pero tampoco garantias de idoneidad para produccion.
- Sin datos de sesgo, alucinacion o seguridad aplicables al dominio del lenguaje; las advertencias relevantes son de robustez de control y de reproducibilidad experimental.
- Artefactos auxiliares incompletos: `run.json` figura como "_Not logged yet._", lo que dificulta reproducir exactamente la configuracion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/racingmania-specialist-campaign-04-seed1
- Repositorio del proyecto (codigo, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Juego RacingMania (GitHub Pages): disponible a traves del repositorio anterior, opcion "Watch the AI"
