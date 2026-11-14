# BurnyCoder/racingmania-specialist-campaign-01-seed0

## Resumen

`racingmania-specialist-campaign-01-seed0` es un agente de refuerzo (reinforcement learning) desarrollado por BurnyCoder (Libor "Burny" Burian) dentro del proyecto de investigación RacingMania. No es un modelo de lenguaje: se trata de una política neuronal entrenada con PPO para conducir un coche en un videojuego de carreras 3D de time-attack ejecutable en navegador, construido con three.js y el `RaycastVehicle` de cannon-es. La política se entrena sobre un port en PyTorch de la misma física del vehículo que usa el juego, lo que permite transferir directamente el agente entrenado al entorno web.

La arquitectura es deliberadamente ligera: un MLP de dos capas de 256 unidades con activación tanh, compartido entre actor y crítico, con dos cabezas de tres vías cada una (dirección izquierda/recto/derecha y gas/deriva/freno). La observación combina el estado del coche con puntos de look-ahead sobre la línea central de la pista, y el objetivo de recompensa es el progreso sobre dicha línea central. El entrenamiento se realizó sobre una única pista de campaña (campaign-01) con estados iniciales tanto parados como aleatorizados sobre la línea central.

El modelo es relevante como pieza de un pipeline de investigación reproducible de conducción autónoma simulada: se publica junto con los ficheros de resultados (`run.json`, curvas de entrenamiento, CSVs de evaluación por pista) y con un export ONNX que el propio juego consume en el navegador. En el momento de redactar esta ficha, el estado declarado por el autor es **planned**: el checkpoint está registrado y el código y la configuración se subieron antes del entrenamiento, pero no hay métricas registradas ni evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezas de 3 vias (direccion y pedal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observacion definida por `window_k` de look-ahead |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa de dos capas ocultas de 256 unidades con activación tanh, compartido entre actor y crítico (esquema ActorCritic), con dos cabezas de salida discretas de tres acciones cada una: dirección (izquierda, recto, derecha) y pedal (gas, deriva, freno). La observación es una función que concatena el estado del coche con puntos de look-ahead sobre la línea central de la pista; el tamaño de la ventana de observación se parametriza con `window_k` y se calcula mediante `obs_size(k)`. Un normalizador de medias y varianzas en ejecución (`RunningNorm`) se congela en inferencia y se incluye tanto en el checkpoint como en el grafo ONNX exportado.

El algoritmo de entrenamiento es PPO, con recompensa basada en el progreso sobre la línea central. Los estados iniciales combinan arranque parado y posiciones aleatorias sobre la línea central. Los datos de entrenamiento se limitan a una única pista de campaña (campaign-01) y la física utilizada es la versión v1 del proyecto. No se han registrado en la información disponible el número de pasos de agente entrenados, las horas de reloj ni el commit de git asociado, que aparecen como campos vacíos en la model card. Tampoco se detalla la composición del dataset más allá de la pista empleada, ni si se aplicaron técnicas de regularización adicionales.

## Capacidades

- Conducción autónoma en el juego RacingMania: controla dirección y pedal de forma discreta (tres acciones por cabeza) a partir del estado del coche y puntos de look-ahead.
- Política determinista o estocástica: la API `agent.act(obs, deterministic=True)` permite seleccionar la acción más probable o muestrear.
- Export a ONNX con observación, normalizador y actor fusionados en un único grafo, ejecutable con `onnxruntime` en el navegador.
- Inferencia en CPU: el tamaño del MLP permite ejecutarlo sin GPU.
- Integración con el motor del juego: la física del entorno de entrenamiento es un port en PyTorch de la misma física del `RaycastVehicle` de cannon-es usada en el navegador.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- **Investigación en conducción autónoma simulada**: sirve como punto de partida reproducible para estudiar el efecto de la aleatorización de estados iniciales y del objetivo de progreso sobre la línea central en un entorno de carreras con física de vehículo realista.
- **Demostración interactiva en navegador**: el export `policy.onnx` se carga directamente en el juego web (`web/index.html` o GitHub Pages) mediante la opción "Watch the AI", lo que permite visualizar la política sin infraestructura adicional.
- **Benchmark de algoritmos RL**: al publicarse junto a `run.json`, curvas de entrenamiento y CSVs de evaluación por pista, el checkpoint puede usarse como referencia para comparar variantes de PPO, cambios en la observación o en la recompensa.
- **Pruebas de transferencia sim-a-sim**: la correspondencia entre la física de entrenamiento (PyTorch) y la del juego (cannon-es) permite evaluar la robustez de la política frente a pequeñas discrepancias entre simuladores.
- **Generación procedural de pistas**: la etiqueta `procedural-generation` del modelo sugiere su uso en experimentos donde la política se evalúa sobre pistas generadas, midiendo generalización fuera de la pista de entrenamiento.
- **Docencia y divulgación de RL**: el tamaño reducido del modelo y la disponibilidad del código completo lo hacen adecuado para talleres prácticos sobre PPO y entornos de simulación.
- **Base para especialistas por campaña**: el nombre del checkpoint indica que forma parte de una familia de "especialistas" por campaña; puede servir como inicialización o comparación frente a especialistas de otras pistas o semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define la métrica SWS (success-weighted speed: media sobre pistas de terminadas × tiempo del conductor scriptado / tiempo del agente, con intervalos bootstrap al 95 % sobre pistas y una sola semilla), pero la sección de evaluación indica explícitamente "_Not evaluated yet._". Tampoco se han registrado los pasos de agente entrenados ni las horas de reloj.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; por el tamaño del MLP (2x256) la inferencia cabe holgadamente en memoria de sistema y no requiere GPU.
- **GPU recomendadas**: no aplica; el modelo está pensado para ejecutarse en CPU tanto en PyTorch como en `onnxruntime`.
- **Consumer GPU**: sí, en cualquier GPU consumer, aunque no es necesario; también funciona solo con CPU.
- **Opciones de despliegue**: PyTorch (con el repositorio clonado y `uv sync`), ONNX Runtime (fichero `policy.onnx`) y el propio juego web en navegador.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes RL del mismo proyecto ni referencias a políticas comparables con parámetros, contexto o métricas publicadas.

## Limitaciones y advertencias

- **Estado "planned"**: el autor declara el checkpoint como registrado antes del entrenamiento; no hay métricas de entrenamiento ni evaluación publicadas, por lo que no debe asumirse que la política esté entrenada o sea funcional.
- **Especialización extrema**: entrenado únicamente sobre la pista campaign-01; se desconoce su capacidad de generalización a otras pistas.
- **Sin datos de sesgo**: no aplica en el sentido habitual de modelos de lenguaje, pero no hay análisis de comportamiento fuera de distribución ni de robustez frente a condiciones iniciales no vistas.
- **Riesgo de sobreajuste a la física v1**: cambios en la versión de la física del juego o del simulador pueden degradar el rendimiento de forma no cuantificada.
- **Licencia MIT**: permite uso comercial y modificación con atribución; no se han identificado restricciones adicionales en la información disponible.
- **Sin soporte de lenguaje natural**: no debe emplearse para tareas de texto, código, visión o razonamiento simbólico.
- **Reproducibilidad incompleta**: los campos de commit de git, pasos entrenados y horas de reloj están vacíos en la model card.

## Enlaces

- Modelo en Hugging Face: <https://huggingface.co/BurnyCoder/racingmania-specialist-campaign-01-seed0>
- Repositorio del proyecto (código, paper y resultados): <https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game>
- Documentación de formatos (sección "Policy model"): `docs/formats.md` dentro del repositorio
- Juego en navegador: `web/index.html` dentro del repositorio o el sitio de GitHub Pages del proyecto
