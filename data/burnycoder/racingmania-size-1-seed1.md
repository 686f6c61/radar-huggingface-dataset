# BurnyCoder/racingmania-size-1-seed1

## Resumen

`racingmania-size-1-seed1` es un checkpoint de aprendizaje por refuerzo (RL) entrenado con PPO para conducir un coche en RacingMania, un videojuego original de carreras contrarreloj en 3D para navegador, construido con three.js y el `RaycastVehicle` de cannon-es. El modelo lo publica BurnyCoder (Libor "Burny" Burian) dentro de un proyecto de investigación sobre conducción autónoma en entornos de carreras procedurales, y forma parte de una familia de runs parametrizados por número de pistas y semilla; esta variante corresponde a 1 pista generada y semilla 1.

No se trata de un modelo de lenguaje ni de un transformer generativo: la política es un MLP de 2 capas ocultas de 256 unidades con activación tanh, compartido entre actor y crítico, con dos cabezas de 3 vías cada una (una para dirección: izquierda/ninguna/derecha, y otra para pedales: acelerar/derivar/frenar). La observación combina el estado del coche con puntos de look-ahead sobre la línea central de la pista. El objetivo de recompensa es el progreso sobre la línea central.

Es relevante ahora como artefacto reproducible y didáctico de RL profundo aplicado a física de vehículos: el mismo port batcheado en PyTorch de la física del coche se usa tanto para entrenar como para exportar una política ONNX que corre directamente en el navegador. Sin embargo, la propia model card indica que el run está en estado "planned": el registro se creó y se subieron código y configuración antes del entrenamiento, y la evaluación figura como "Not evaluated yet", por lo que no hay resultados de rendimiento publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y crítico), dos cabezas de 3 vías |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de estado + look-ahead) |
| Tipos de cuantización | no disponible (checkpoint PyTorch y grafo ONNX en fp32) |
| Idiomas soportados | no disponible (no aplica; política de control, sin entrada/salida de texto) |
| Licencia | MIT |
| Formato de pesos | `final.pt` (PyTorch: state dicts `agent` y `norm`, ajustes `ppo` y `env_cfg`, `obs_dim`) y `policy.onnx` (observación + normalizador congelado + actor en un solo grafo) |

## Arquitectura y entrenamiento

La política es una red `ActorCritic` implementada en PyTorch con cuerpo MLP de dos capas de 256 unidades y tanh, y dos cabezas discretas de 3 acciones: dirección (0/1/2 = izquierda/ninguna/derecha) y pedales (gas/coast/brake). El algoritmo de optimización es PPO. La observación por defecto combina el estado del coche con puntos de look-ahead parametrizados por `window_k`, y el tamaño de observación se calcula con `obs_size(k)`. Un `RunningNorm` congelado normaliza las observaciones antes de la política, y el grafo ONNX exportado integra la función de observación, el normalizador y el actor en una única unidad desplegable.

El entrenamiento se realiza sobre un port batcheado en PyTorch de la misma física del coche que usa el juego (cannon-es `RaycastVehicle`), con recompensa basada en el progreso sobre la línea central y estados iniciales de salida parada más posiciones aleatorias sobre la línea central. Según la model card, este run cubre 1 pista generada proceduralmente con semilla 1. Los campos de pasos de agente entrenados, horas de reloj y commit de git aparecen como "-", y la configuración de entrenamiento (`run.json`) figura como "Not logged yet"; por tanto, no hay datos publicados sobre volumen de entrenamiento ni hiperparámetros efectivos.

## Capacidades

- Control de conducción en un entorno de carreras 3D: salida de dirección (izquierda/ninguna/derecha) y pedales (acelerar/derivar/frenar) a partir del estado del coche y puntos de look-ahead.
- Política determinista en inferencia: la model card especifica ejecución con `deterministic=True` y, en ONNX, selección por `argmax` de los logits.
- Despliegue en navegador: el grafo `policy.onnx` está pensado para ejecutarse con onnxruntime en el juego web de RacingMania.
- Entrenamiento y evaluación reproducibles dentro del repositorio: checkpoint `final.pt`, curvas de entrenamiento y validación, y CSVs de evaluación por pista bajo `eval/`.
- Generalización limitada por diseño: entrenado sobre 1 pista; no se documenta capacidad de transferencia a pistas no vistas.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Investigación en RL para conducción: reproducir el run con `uv sync` y el código del repositorio para estudiar PPO sobre física de vehículos batcheada, comparando curvas de entrenamiento y validación entre semillas y tamaños de pista.
- Benchmark de generalización procedural: usar esta política (1 pista, semilla 1) como línea base frente a runs con más pistas para medir cuánto rendimiento se pierde al entrenar con diversidad limitada, mediante la métrica SWS descrita en la model card.
- Demo interactiva en navegador: cargar `policy.onnx` con onnxruntime y observar al agente conduciendo en `web/index.html` o en el sitio de GitHub Pages, eligiendo el modelo bajo "Watch the AI".
- Integración en pipelines de simulación: ejecutar la política sobre el port PyTorch de la física para generar trayectorias de referencia o datos de comportamiento para análisis posteriores.
- Validación de exportación ONNX: usar `policy.onnx` como caso de prueba para verificar paridad entre la inferencia PyTorch (`agent.act`) y la inferencia ONNX (`argmax` de logits) en un grafo que empaqueta observación, normalizador y actor.
- Docencia de RL profundo: ejemplo compacto (MLP 2x256, PPO, acciones discretas de 3 vías) para ilustrar el ciclo observación-normalización-política-acción en un entorno con física realista.

## Benchmarks y rendimiento

La model card define la métrica principal, SWS (success-weighted speed): media sobre pistas de (terminado × tiempo del conductor scriptado / tiempo del agente), donde 1.0 significa terminar todas las pistas tan rápido como el conductor de referencia scriptado, con una ejecución determinista por pista desde parado y usando la acción más probable, e intervalos de confianza al 95 % por bootstrap de percentiles sobre pistas (una semilla).

Sin embargo, la sección de evaluación indica explícitamente "Not evaluated yet". No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la arquitectura (MLP 2x256 tanh con dos cabezas de 3 vías) el modelo es de tamaño muy reducido y cabe con holgura en cualquier GPU, pero no se publican cifras de parámetros ni de memoria.
- GPU recomendadas: no disponible. La inferencia ONNX está diseñada para ejecutarse en el navegador del juego, lo que sugiere que también funciona en CPU.
- ¿Cabe en GPU consumer? Sí, con reservas: por la arquitectura descrita es presumible que quepa en cualquier GPU consumer e incluso en CPU, pero no hay datos publicados que lo confirmen de forma explícita.
- Opciones de despliegue: PyTorch (checkpoint `final.pt` dentro del repositorio, con `uv sync`), onnxruntime (`policy.onnx`) y el propio juego web (`web/index.html` o GitHub Pages). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma familia RacingMania (por ejemplo, runs con distinto número de pistas o semillas) con datos de rendimiento publicados, ni alternativas de RL para conducción con métricas equivalentes.

## Limitaciones y advertencias

- Estado del run: la model card lo marca como "planned" (registrado; código y configuración subidos antes del entrenamiento), con pasos de agente, horas de reloj y commit de git sin registrar.
- Sin evaluación: la sección de evaluación indica "Not evaluated yet"; no hay SWS, curvas ni CSVs de resultados publicados.
- Configuración de entrenamiento no registrada: `run.json` figura como "Not logged yet".
- Entrenado sobre 1 única pista generada con semilla 1; no hay evidencia publicada de generalización a pistas no vistas ni a variaciones de física.
- Dominio muy estrecho: solo control de conducción con acciones discretas de 3 vías; no es un modelo de lenguaje y no tiene capacidades de texto, visión, audio, tool calling ni agentes multi-paso.
- Sesgos conocidos: no disponibles; al ser una política entrenada por recompensa sobre una pista concreta, es esperable un comportamiento sobreajustado a esa pista, aunque no se documenta formalmente.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es que la política produzca acciones no válidas o conducción deficiente fuera de la distribución de entrenamiento, sin datos publicados al respecto.
- Licencia MIT: permite uso comercial y modificación con atribución; debe conservarse el aviso de copyright del autor (Libor "Burny" Burian) y citarse el repositorio.
- Para producción: verificar antes la paridad entre `final.pt` y `policy.onnx`, y no asumir rendimiento alguno hasta que existan resultados de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/racingmania-size-1-seed1
- Repositorio del proyecto (código, paper y resultados completos): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Juego web: `web/index.html` dentro del repositorio, o el sitio de GitHub Pages del proyecto
- Documentación del formato de política ONNX: `docs/formats.md`, sección "Policy model", dentro del repositorio
