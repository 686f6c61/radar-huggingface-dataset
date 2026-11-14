# BurnyCoder/racingmania-generalist-seed0

## Resumen

racingmania-generalist-seed0 es un agente de refuerzo (reinforcement learning) desarrollado por BurnyCoder (Libor "Burny" Burian) dentro del proyecto de investigación RacingMania, un juego de carreras 3D de tipo time-attack para navegador construido con three.js y cannon-es (`RaycastVehicle`). El modelo es un piloto automático entrenado con PPO sobre un port en PyTorch batcheado de la misma física del coche que usa el juego, lo que permite entrenar en paralelo y desplegar después la política en el navegador.

Técnicamente no es un modelo de lenguaje: la arquitectura es un MLP de 2x256 unidades con activación tanh para actor y crítico, con dos cabezas de tres vías cada una (dirección y pedal). La observación combina el estado del coche con puntos de look-ahead sobre la línea central de la pista, y el objetivo de entrenamiento es el progreso sobre esa línea central. El artefacto se publica en formato PyTorch (`final.pt`) y ONNX (`policy.onnx`) para inferencia en el juego.

Es relevante ahora por su carácter de registro reproducible de un experimento de deep RL aplicado a un dominio concreto (conducción en circuitos generados proceduralmente), con licencia MIT y código abierto. No obstante, la propia model card indica que el run está en estado "planned" y que aún no se ha evaluado, por lo que no hay resultados de rendimiento disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y crítico), dos cabezas de 3 vías |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación = estado del coche + puntos de look-ahead) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El agente sigue el algoritmo PPO con una red actor-crítico compartida de tipo MLP de dos capas de 256 unidades y activación tanh. La política se descompone en dos cabezas de tres vías: una para la dirección (izquierda / ninguna / derecha) y otra para el pedal (acelerar / dejar de acelerar / frenar). La observación por defecto combina el estado del coche con puntos de look-ahead sobre la línea central de la pista, con un parámetro de ventana `window_k` que determina cuántos puntos se incluyen. El objetivo de recompensa es el progreso sobre la línea central.

El entrenamiento se realiza sobre un pool de entrenamiento generado, con estados iniciales tanto parados como en posiciones aleatorias de la línea central. La física utilizada es la versión v1 del proyecto y se ejecuta en un port batcheado en PyTorch de la física del juego original, lo que permite paralelizar la recolección de experiencia. La model card indica que el run está registrado pero en estado "planned": el código y la configuración se subieron antes del entrenamiento, y no se han registrado ni los pasos de agente entrenados, ni las horas de reloj, ni el commit de git, ni la configuración de entrenamiento en `run.json`. No se documenta el uso de RLHF, DPO ni innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Control de conducción en el juego RacingMania: selección discreta de dirección (izquierda, ninguna, derecha) y pedal (acelerar, dejar de acelerar, frenar) a partir del estado del coche y de puntos de look-ahead.
- Generalización a circuitos generados proceduralmente: el entrenamiento usa un pool de pistas y estados iniciales aleatorios sobre la línea central, orientado a un piloto generalista.
- Inferencia en navegador mediante ONNX Runtime: el grafo `policy.onnx` integra la función de observación, el normalizador congelado y el actor, tal como lo ejecuta el juego.
- Inferencia en PyTorch fuera del navegador, cargando `final.pt` con los state dicts de `agent` y `norm` y la configuración de PPO y del entorno.
- Ejecución determinista: la acción se obtiene tomando el argmax de las logits de cada cabeza.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Piloto automático en el navegador: el modelo se carga como `policy.onnx` en el juego (`web/index.html` o el sitio de GitHub Pages) y se selecciona en la opción "Watch the AI" para que conduzca de forma autónoma en los circuitos.
- Referencia de comportamiento para investigación en RL: sirve como baseline reproducible para comparar variantes de PPO, configuraciones de observación o estrategias de recompensa sobre el mismo entorno de física batcheada.
- Validación de un pipeline de simulación a despliegue: el flujo entrenamiento en PyTorch, exportación a ONNX y ejecución en el navegador es un ejemplo completo de cómo llevar una política de RL a producción web.
- Generación de datos de conducción sintética: las trayectorias del agente sobre pistas procedurales pueden usarse para análisis de comportamiento, ajuste de parámetros de física o depuración del motor de simulación.
- Benchmark de generalización en pistas: al entrenar sobre un pool de circuitos y evaluar por pista, permite estudiar la transferencia del agente a geometrías no vistas durante el entrenamiento.
- Docencia y demostraciones de deep RL: el par `final.pt` + `policy.onnx` y la estructura de `run.json`, curvas de entrenamiento y CSVs de evaluación por pista facilitan material didáctico sobre PPO y entornos de control continuo discretizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define la métrica Success-weighted speed (SWS) como la media sobre pistas de (terminado) x (tiempo del piloto scriptado / tiempo del agente), con 1.0 indicando que se completa cada pista tan rápido como el piloto de referencia scriptado, con intervalos de bootstrap del percentil 95 sobre pistas y una sola semilla; sin embargo, la sección de evaluación indica explícitamente "Not evaluated yet".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es un MLP de 2x256, por lo que el requisito es mínimo y cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de PyTorch u ONNX Runtime es suficiente. No se requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño reducido de la red.
- Opciones de despliegue: PyTorch (cargando `final.pt` dentro del repositorio con `uv sync`) y ONNX Runtime (`policy.onnx`) para el navegador.
- Latencia y throughput estimados: no disponibles; no se han registrado datos de rendimiento.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (agentes de RL para conducción en juegos de carreras con física batcheada y despliegue en navegador).

## Limitaciones y advertencias

- Estado del run "planned": el código y la configuración se subieron antes del entrenamiento; no hay constancia de que el checkpoint `final.pt` o el `policy.onnx` correspondan a un entrenamiento completado.
- Sin evaluación publicada: la sección de evaluación indica "Not evaluated yet", por lo que no hay evidencia de rendimiento ni de generalización a pistas no vistas.
- Sin métricas de entrenamiento registradas: no se han documentado pasos de agente, horas de reloj, commit de git ni configuración de entrenamiento en `run.json`.
- Dominio muy restringido: el modelo solo produce acciones de dirección y pedal para el entorno RacingMania; no es reutilizable fuera de ese juego o de su port de física.
- Sesgos y alucinación: no aplican en el sentido habitual de modelos de lenguaje, pero el agente puede exhibir comportamientos degenerados (por ejemplo, quedarse parado o salirse de la pista) si la política no está bien entrenada o si la física del despliegue difiere de la del entrenamiento.
- Dependencia de la física v1: cambios en la versión de la física o en la función de observación pueden invalidar la política.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar al autor y el repositorio según lo indicado en la model card.
- Ausencia de soporte multilingüe, de tool calling y de otras capacidades de modelos generativos, por su naturaleza de agente de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/racingmania-generalist-seed0
- Repositorio del proyecto (código, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Documentación de formatos (`docs/formats.md`, sección "Policy model"): no disponible como enlace directo; referenciada en el repositorio anterior.
