# BurnyCoder/racingmania-specialist-campaign-02-seed1

## Resumen

`racingmania-specialist-campaign-02-seed1` es un agente de aprendizaje por refuerzo desarrollado por BurnyCoder (Libor "Burny" Burian) como parte del proyecto de investigacion RacingMania, un juego de carreras 3D de tipo time-attack para navegador construido con three.js y cannon-es. El modelo es un piloto automatico entrenado con PPO sobre un port en PyTorch de la fisica del vehiculo del propio juego, con el objetivo de maximizar el progreso sobre la linea central de la pista.

Se trata de una politica compacta: una MLP de dos capas ocultas de 256 unidades con activacion tanh, compartida por actor y critico, con dos cabezales de tres vias que emiten decisiones discretas de direccion (izquierda, ninguna, derecha) y pedal (acelerar, inercia, frenar). La observacion combina el estado del coche con puntos de look-ahead sobre la pista.

El modelo corresponde a un run concreto del proyecto (campana 02, semilla 1) y su estado es "planned": fue registrado y se subieron codigo y configuracion antes del entrenamiento, pero no consta que se haya entrenado ni evaluado. Su relevancia es acotada: sirve como artefacto reproducible de investigacion en RL aplicado a conduccion, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezales de 3 vias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observacion basada en estado del coche y puntos de look-ahead) |
| Tipos de cuantizacion | no disponible (exportacion a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La politica es una red MLP con dos capas ocultas de 256 unidades y activacion tanh, compartida entre actor y critico, con dos cabezales de tres vias para las acciones discretas de direccion y pedal. El algoritmo de entrenamiento es PPO sobre una reimplementacion batched en PyTorch de la fisica del coche del juego original (cannon-es `RaycastVehicle`). La observacion por defecto combina el estado del coche con puntos de look-ahead sobre la pista, parametrizados por `window_k`. El objetivo de recompensa es el progreso sobre la linea central.

El entrenamiento se realiza sobre una unica pista de campana (campaign-02), con estados iniciales tanto parados como aleatorizados sobre la linea central. Segun la model card, el run esta en estado "planned" y los campos de configuracion de entrenamiento (`run.json`: pasos entrenados, horas de reloj, commit de git) no estan registrados. No se documenta uso de RLHF/DPO, decodificacion especulativa ni innovaciones de atencion, ya que no es un transformer ni un modelo de lenguaje.

## Capacidades

- Control de conduccion en un juego de carreras 3D: emite acciones discretas de direccion (izquierda, ninguna, derecha) y pedal (acelerar, inercia, frenar).
- Seguimiento de linea central: optimiza el progreso sobre la trayectoria de referencia de la pista.
- Inferencia determinista y estocastica: la API `agent.act(..., deterministic=True)` permite seleccionar la accion mas probable o muestrear.
- Exportacion a ONNX: el grafo `policy.onnx` integra la funcion de observacion, el normalizador congelado y el actor, listo para ejecutarse en el navegador.
- Generalizacion limitada a una pista: entrenado sobre una unica pista de campana (campaign-02).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo thinking.

## Casos de uso

- Demostracion de conduccion automatica en el navegador: el modelo se carga como `policy.onnx` y se selecciona en el menu "Watch the AI" del juego, permitiendo visualizar la politica entrenada en tiempo real sin backend de Python.
- Investigacion reproducible en RL: sirve como artefacto de referencia para comparar variantes de PPO, configuraciones de observacion (`window_k`) y semillas dentro del proyecto RacingMania.
- Benchmark de fisica de vehiculos: al entrenar sobre un port batched de la fisica de cannon-es, permite medir como distintas politicas explotan o fallan ante el mismo modelo fisico.
- Generacion procedural de contenido: la etiqueta `procedural-generation` sugiere su uso en pipelines que generan pistas o campanas y requieren un piloto de referencia para validarlas.
- Educacion en deep RL: la simplicidad de la MLP (2x256) y la disponibilidad de curvas de entrenamiento y validacion facilitan su uso como ejemplo didactico de PPO con acciones discretas.
- Integracion en CI/CD de investigacion: los checkpoints `final.pt` y `policy.onnx` junto con los CSV de evaluacion por pista permiten automatizar pruebas de regresion de politicas en un repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta pendiente ("_Not evaluated yet._") y que el run esta en estado "planned". La metrica definida por el autor es la velocidad ponderada por exito (SWS): media sobre pistas de (finalizado x tiempo del piloto scriptado / tiempo del agente), con 1.0 como referencia de igualar al piloto scriptado, pero no se aportan valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano de la MLP (2x256) es previsible que quepa en cualquier GPU consumer e incluso en CPU, aunque no se documentan cifras.
- GPU recomendadas: no disponible; no se especifican requisitos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano reducido de la red, aunque no se confirma en la informacion.
- Opciones de despliegue: PyTorch (dentro del repositorio, con `uv sync`), ONNX Runtime (`onnxruntime`) y el propio juego en navegador via `policy.onnx`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (agentes RL para conduccion en juegos de carreras) con los que establecer una comparacion de parametros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Estado "planned": el run fue registrado y se subieron codigo y configuracion antes del entrenamiento; no consta que el modelo este entrenado ni evaluado.
- Especializacion extrema: entrenado sobre una unica pista (campaign-02), por lo que no se espera generalizacion a otras pistas o campanas.
- Sin datos de entrenamiento registrados: pasos, horas de reloj y commit de git no estan disponibles, lo que dificulta la reproducibilidad.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-paso; las etiquetas de idioma no aplican.
- Riesgo de sobreajuste a la fisica del port: la politica se entrena sobre un port batched de la fisica del juego, no sobre el motor original, lo que puede introducir discrepancias de comportamiento.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece garantia alguna sobre el rendimiento del modelo.
- Sin evaluacion publicada: no hay evidencia cuantitativa de su calidad como piloto.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/racingmania-specialist-campaign-02-seed1
- Repositorio del proyecto: https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Documentacion de formatos (seccion "Policy model"): `docs/formats.md` dentro del repositorio
