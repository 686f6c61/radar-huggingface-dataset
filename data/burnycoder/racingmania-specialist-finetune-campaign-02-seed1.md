# BurnyCoder/racingmania-specialist-finetune-campaign-02-seed1

## Resumen

`racingmania-specialist-finetune-campaign-02-seed1` es un agente de refuerzo (no un modelo de lenguaje) publicado por BurnyCoder dentro del proyecto de investigación RacingMania, un juego original de carreras 3D contrarreloj para navegador construido con three.js y el `RaycastVehicle` de cannon-es. El agente se entrena sobre un port en PyTorch de la misma física del coche que ejecuta el juego, de modo que la política aprendida puede transferirse directamente al entorno web.

El modelo emplea PPO sobre una red MLP de dos capas de 256 unidades con activación tanh, compartida entre actor y crítico, con dos cabezas de tres acciones cada una: una para dirección (izquierda, ninguna, derecha) y otra para pedales (acelerar, inercia, frenar). La observación combina el estado del coche con puntos de mira hacia delante sobre la línea central de la pista, y el objetivo de recompensa es el progreso sobre esa línea central.

Es relevante como ejemplo reproducible de entrenamiento de conducción end-to-end con RL en un dominio controlado, con artefactos exportados a ONNX para inferencia en el navegador. En el momento de redactar esta ficha el run figura como **planned**: el registro y la configuración se publicaron antes del entrenamiento, y la model card indica explícitamente que aún no se ha evaluado y que no hay métricas de entrenamiento registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y critico), dos cabezas de 3 acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observacion usa una ventana de puntos de mira `window_k`) |
| Tipos de cuantizacion | no disponible (exportacion a ONNX en float32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`), ONNX (`policy.onnx`), JSON de configuracion (`run.json`) y CSV de evaluacion |

## Arquitectura y entrenamiento

La política es una red neuronal densa de tipo actor-crítico con dos capas ocultas de 256 unidades y activación tanh, implementada en `racingmania.rl.networks.ActorCritic`. El actor produce dos distribuciones categóricas independientes de tres clases (dirección y pedales) y el crítico estima el valor del estado. Las observaciones pasan por un normalizador de medias y varianzas en ejecución (`RunningNorm`) que se congela en inferencia y se incluye en el grafo ONNX exportado, junto con la función de observación y el actor, de forma que el navegador ejecuta un único grafo sin lógica adicional.

El algoritmo de entrenamiento es PPO, con datos generados sobre un port batcheado en PyTorch de la física del coche del juego. El entrenamiento se realiza sobre una única pista de campaña (campaign-02) y los estados iniciales combinan arranque parado y posiciones aleatorias sobre la línea central. La recompensa optimizada es el progreso sobre la línea central. La model card no registra el número de pasos de agente, las horas de reloj ni el commit de Git utilizados, y la sección de configuración de entrenamiento aparece como no registrada.

## Capacidades

- Conducción autónoma en el dominio específico del juego RacingMania: control de dirección (izquierda, ninguna, derecha) y de pedales (acelerar, inercia, frenar) a partir del estado del coche.
- Percepción basada en puntos de mira hacia delante sobre la línea central de la pista, con tamaño de ventana configurable (`window_k`).
- Inferencia determinista seleccionando la acción más probable de cada cabeza, tal como se describe para la evaluación y para el modo "Watch the AI" del juego.
- Exportación a ONNX con observación, normalizador y actor en un único grafo, apta para ejecución en navegador.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modalidades de visión o audio: es un agente de control, no un modelo generativo de propósito general.

## Casos de uso

- Demostración interactiva en navegador: el agente se carga como `policy.onnx` y se ejecuta dentro del juego (`web/index.html` o el sitio de GitHub Pages) bajo la opción "Watch the AI", permitiendo visualizar la política entrenada sin backend adicional.
- Investigación reproducible en RL: el repositorio incluye código, paper y resultados completos, de modo que el run sirve como punto de partida para replicar PPO sobre física de vehículos con `RaycastVehicle`.
- Estudio de transferencia simulación-juego: al entrenar sobre un port en PyTorch de la misma física que el juego, el agente permite medir la brecha entre el entorno de entrenamiento batcheado y el motor real en el navegador.
- Comparación de semillas y campañas: al estar etiquetado como `campaign-02-seed1`, se integra en una campaña de runs con distintas semillas para analizar varianza del entrenamiento y estabilidad de la política.
- Evaluación con métricas agregadas: el script de evaluación produce CSV por pista y la métrica SWS (velocidad ponderada por éxito), útil para comparar variantes de recompensa u observación sobre el mismo conjunto de pistas.
- Base para experimentos de generación procedural: la etiqueta `procedural-generation` sugiere su uso en pipelines donde las pistas se generan y el agente se evalúa sobre ellas, aunque la model card no detalla este flujo.
- Integración en pipelines de investigación con PyTorch: el checkpoint `final.pt` incluye los state dicts de agente y normalizador, la configuración PPO y la del entorno, lo que permite reanudar análisis o ajuste fino dentro del repositorio con `uv sync`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define la métrica SWS (media sobre pistas de terminadas × tiempo del conductor scriptado / tiempo del agente, con intervalos bootstrap del 95 % sobre pistas y una sola semilla) pero indica explícitamente "_Not evaluated yet_". Tampoco se registran pasos de agente entrenados ni horas de reloj.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la arquitectura (MLP 2x256) el coste es mínimo y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realiza sobre un port batcheado en PyTorch, por lo que se beneficiaría de GPU, pero no hay datos de consumo.
- Cabe en GPU consumer: sí, por el tamaño reducido de la red; no se documenta ningún requisito concreto.
- Opciones de despliegue: PyTorch dentro del repositorio (`racingmania.runs.load_policy`) y ONNX Runtime (`onnxruntime.InferenceSession`) para el navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes de RL comparables del mismo proyecto ni referencias externas con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El run está marcado como **planned**: el código y la configuración se publicaron antes del entrenamiento, y los campos de pasos, horas y commit aparecen vacíos. No debe asumirse que exista una política entrenada utilizable.
- No hay evaluación publicada; la métrica SWS queda pendiente y no hay intervalos de confianza calculados.
- El agente está especializado en una única pista de campaña (campaign-02), por lo que la generalización a otras pistas no está demostrada.
- La observación depende de puntos de mira sobre la línea central y del estado del coche; no hay percepción visual ni entrada de imagen.
- No es un modelo de lenguaje: no admite prompts, tool calling ni generación de texto; cualquier uso fuera del dominio de conducción del juego carece de sentido.
- Riesgo de sobreajuste a la física del port en PyTorch frente al motor real del navegador; la model card no reporta métricas de transferencia.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos, límites de contexto ni restricciones idiomáticas porque no aplican al tipo de modelo.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/racingmania-specialist-finetune-campaign-02-seed1
- Repositorio del proyecto (código, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Especificación de formatos, sección "Policy model": `docs/formats.md` dentro del repositorio
