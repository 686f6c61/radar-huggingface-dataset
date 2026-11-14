# BurnyCoder/racingmania-specialist-campaign-05-seed1

## Resumen

racingmania-specialist-campaign-05-seed1 es un agente de aprendizaje por refuerzo desarrollado por BurnyCoder (Libor "Burny" Burian) dentro del proyecto de investigación RacingMania, un juego de carreras 3D de tipo time-attack para navegador construido con three.js y cannon-es (`RaycastVehicle`). El modelo resuelve el problema de control de un vehículo en un circuito concreto mediante una política neuronal entrenada con PPO sobre un port a PyTorch de la física del coche, ejecutada en lotes para acelerar el entrenamiento. Es, por tanto, un checkpoint especializado en una única pista (campaign-05) y una única semilla (seed 1), no un modelo de lenguaje.

La arquitectura es una MLP pequeña de dos capas de 256 unidades con activación tanh, compartida entre actor y crítico, con dos cabezas de tres vías cada una: una para la dirección (izquierda, ninguna, derecha) y otra para el pedal (acelerar, inercia, frenar). La observación combina el estado del coche con puntos de look-ahead sobre la línea central del circuito. El objetivo de entrenamiento es el progreso sobre la línea central. El modelo se distribuye en formato PyTorch (`final.pt`) y ONNX (`policy.onnx`), este último con la función de observación, el normalizador congelado y el actor fusionados en un único grafo, tal como lo consume el juego en el navegador.

El interés del modelo es fundamentalmente metodológico y de reproducibilidad: forma parte de una campaña de experimentos registrada antes del entrenamiento, con tarjeta generada a partir de los ficheros de resultados. En el momento de la publicación, el estado declarado es "planned": el código y la configuración se subieron antes de entrenar, y la sección de evaluación indica explícitamente que aún no se ha evaluado. No hay métricas, curvas ni datos de entrenamiento registrados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezas de 3 vias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observacion de estado + puntos de look-ahead; `window_k` configurable) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch y ONNX en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El agente es una red neuronal de política y valor (`ActorCritic`) con un tronco MLP de dos capas de 256 unidades y activación tanh, y dos cabezas de tres salidas: la de dirección codifica izquierda/ninguna/derecha y la de pedal codifica acelerar/inercia/frenar. El algoritmo de entrenamiento es PPO (Proximal Policy Optimization). La observación por defecto combina el estado del coche con puntos de look-ahead sobre la línea central, con una ventana configurable (`window_k`) que determina la dimensionalidad de la entrada. El objetivo es el progreso sobre la línea central del circuito. Los estados de inicio son parado y posiciones aleatorias sobre la línea central.

El entrenamiento se realiza sobre un único circuito de campaña (campaign-05) y una única semilla (seed 1), con física en versión v1. El proyecto entrena sobre un port a PyTorch de la física del coche original (cannon-es `RaycastVehicle`) que permite ejecutar entornos en lote. La información disponible no incluye el número de pasos de agente entrenados, las horas de reloj ni el commit de Git: la tarjeta declara esos campos como no registrados ("-"). Tampoco se documenta la configuración de entrenamiento, que aparece como "Not logged yet". No se indica el uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Control de conducción en un circuito concreto: produce acciones discretas de dirección (izquierda, ninguna, derecha) y pedal (acelerar, inercia, frenar) a partir del estado del coche y de puntos de look-ahead.
- Política determinista: permite seleccionar la acción más probable para evaluación reproducible.
- Inferencia en navegador: el grafo ONNX incluye la función de observación, el normalizador congelado y el actor, de modo que el juego puede ejecutar la política sin dependencias de Python.
- Normalización de observaciones: incluye un `RunningNorm` congelado en el checkpoint para estandarizar las entradas en inferencia.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modalidades de visión o audio: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas de conducción en el juego: cargar `policy.onnx` en la build web de RacingMania y seleccionar el modelo en la opción "Watch the AI" para observar cómo conduce el agente en campaign-05 con la física v1.
- Reproducción de experimentos de RL: usar `final.pt` junto con el repositorio (`uv sync`) para recargar actor, crítico y normalizador con `racingmania.runs.load_policy` y repetir la inferencia determinista.
- Baseline de referencia en investigación de PPO aplicado a conducción: sirve como punto de comparación para otras semillas o campañas del mismo proyecto, dado que comparte arquitectura y configuración declarada.
- Integración en pipelines de evaluación automatizada: los CSV por pista en `eval/` y la métrica SWS (success-weighted speed) permiten incorporar el modelo a un arnés de evaluación comparativa entre checkpoints.
- Docencia y demostración de RL en navegador: el par PyTorch/ONNX y el juego web facilitan mostrar el ciclo observación-política-acción en un entorno visual e interactivo.
- Estudio de especialización por pista: al estar entrenado solo en campaign-05, permite analizar el sobreajuste a una pista concreta frente a políticas más generales del mismo proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la tarjeta indica explícitamente "_Not evaluated yet._" y no se incluyen valores de SWS ni curvas de entrenamiento o validación en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño de la red (MLP 2x256) es previsible que sea muy reducida, pero no se publica una cifra.
- GPU recomendadas: no disponible. La inferencia ONNX está pensada para ejecutarse en el navegador, lo que sugiere que el modelo es ligero, pero no se documenta hardware objetivo.
- ¿Cabe en GPU de consumo? No se especifica; el despliegue previsto es en navegador mediante ONNX Runtime, no en GPU dedicada.
- Opciones de despliegue: ONNX Runtime (grafo `policy.onnx`) y PyTorch dentro del repositorio del proyecto (`final.pt` con `racingmania.runs.load_policy`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| racingmania-specialist-campaign-05-seed1 | no disponible (MLP 2x256) | no aplica | no evaluado | MIT | Hugging Face + repo GitHub |
| Otras semillas/campañas de RacingMania | no disponible | no aplica | no disponible | MIT (presumible, mismo proyecto) | Repositorio del proyecto |
| Otros agentes PPO para conducción | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Estado "planned": la tarjeta indica que el registro se creó antes del entrenamiento y que la evaluación aún no se ha realizado; no hay evidencia publicada de que la política funcione.
- Especialización extrema: entrenado en una sola pista (campaign-05) y una sola semilla (seed 1); no se espera generalización a otros circuitos.
- Sin métricas de entrenamiento: no se registran pasos de agente, horas de reloj, commit de Git ni configuración de entrenamiento, lo que limita la reproducibilidad efectiva.
- Física acoplada: el agente depende de la versión v1 de la física del proyecto; cambios en el simulador pueden invalidar la política.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo, aunque en un agente de conducción el sesgo relevante sería el sobreajuste a la pista y a la distribución de estados de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es producir acciones fuera de distribución ante estados no vistos.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Caveat para producción: al no haber evaluación publicada, no se recomienda su uso en ningún sistema real sin una validación previa por parte del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/racingmania-specialist-campaign-05-seed1
- Repositorio del proyecto (código, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Documentación de formatos del proyecto (sección "Policy model"): `docs/formats.md` en el repositorio anterior
- Juego web: `web/index.html` en el repositorio anterior (también disponible vía GitHub Pages del proyecto)
