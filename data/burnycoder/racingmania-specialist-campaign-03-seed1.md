# BurnyCoder/racingmania-specialist-campaign-03-seed1

## Resumen

racingmania-specialist-campaign-03-seed1 es un agente de aprendizaje por refuerzo profundo entrenado con PPO para conducir en RacingMania, un videojuego de carreras contrarreloj 3D para navegador basado en three.js y en el vehículo `RaycastVehicle` de cannon-es. Lo desarrolla Libor "Burny" Burian (BurnyCoder) como parte de un proyecto de investigación abierta sobre conducción autónoma en entornos de carreras procedurales, que incluye el motor del juego, un port batcheado de la física del coche a PyTorch y el pipeline de entrenamiento.

El modelo es un "especialista": se entrenó exclusivamente sobre una única pista del modo campaña (campaign-03), con el objetivo de maximizar el progreso respecto a la línea central. La política es una MLP de dos capas de 256 unidades con activación tanh, con dos cabezas de tres vías (dirección: izquierda/ninguna/derecha; pedal: acelerar/derrapar/frenar), y observa el estado del coche más 20 puntos de anticipación de la pista.

Su relevancia es metodológica más que de producto: sirve como referencia para estudiar generalización de políticas de RL entrenadas en una sola pista frente a pistas generadas no vistas, y como artefacto reproducible (checkpoint PyTorch, ONNX, curvas y CSVs de evaluación) dentro de un repositorio con paper y código abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 2x256 tanh (actor y crítico), dos cabezas de 3 vías (factored) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación: estado del coche + 20 puntos de anticipación, `window_k=20`, `window_stride=3`) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `final.pt` y grafo ONNX `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`final.pt`) y ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política es una red neuronal totalmente conectada con dos capas ocultas de 256 unidades y activación tanh, compartida entre actor y crítico, con dos cabezas de acción de tres valores cada una (modo `factored`). La observación combina el estado del vehículo con 20 puntos de anticipación sobre la pista (`window_k=20`, `window_stride=3`), normalizados mediante un `RunningNorm` congelado en inferencia. El entrenamiento usa PPO con 16.384 entornos paralelos, 32 pasos por rollout, 4 minibatches, 5 épocas de actualización, `clip_coef=0.2`, GAE con `gamma=0.99` y `gae_lambda=0.95`, y una tasa de aprendizaje adaptativa acotada entre 1e-5 y 1e-2 con `desired_kl=0.01`.

Se entrenaron 200.278.016 pasos de agente (configurado `total_steps=200000000`) sobre una sola pista de campaña, con `rotate_tracks_every=0` y `loaded_tracks=1`, en aproximadamente 0,35 horas de reloj. Los estados iniciales son de parado o aleatorios sobre la línea central con probabilidad 0,5, con velocidades de arranque entre 0 y 30 y desplazamiento lateral de 0,5. La recompensa es progreso respecto a la línea central con `reward_scale=0.1`, sin coste temporal, penalización por caída ni peso de pista (`blind=False`). El entrenamiento usó `torch.compile`.

## Capacidades

- Control de conducción en RacingMania: selección discreta de dirección (izquierda/ninguna/derecha) y pedal (acelerar/derrapar/frenar) a partir del estado del coche y de la geometría local de la pista.
- Seguimiento de línea central con anticipación de 20 puntos, lo que permite trazar curvas a partir de la información de la pista por delante del vehículo.
- Arranque desde parado y desde posiciones aleatorias sobre la línea central, gracias al entrenamiento con estados iniciales mixtos.
- Inferencia determinista (acción más probable) y estocástica, según el modo de muestreo.
- Exportación a ONNX con normalizador congelado incluido en el grafo, lo que permite ejecutarlo en el navegador con onnxruntime.
- No soporta tool calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües: es una política de control específica del dominio.

## Casos de uso

- Referencia de generalización en RL: evaluar cómo una política entrenada en una sola pista se comporta en 971 pistas generadas no vistas, con métricas SWS y tasa de finalización, para estudiar sobreajuste al trazado.
- Baseline en investigación de conducción autónoma simulada: comparar algoritmos (PPO frente a SAC, TD3, etc.) o variantes de observación sobre el mismo entorno y física.
- Demostración interactiva en navegador: cargar `policy.onnx` en el juego web y visualizar al agente conduciendo en la opción "Watch the AI", útil para docencia y divulgación.
- Pruebas de regresión de física y simulación: al ser un checkpoint congelado con commit de git asociado, sirve para detectar cambios de comportamiento cuando se modifica el port de física del vehículo.
- Generación de datos de comportamiento para análisis: ejecutar el agente sobre pistas generadas y registrar trayectorias para estudiar curvas de velocidad, puntos de frenada y errores de trazada.
- Punto de partida para fine-tuning: reutilizar `final.pt` como inicialización para entrenar un agente generalista sobre múltiples pistas o con recompensas adicionales (coste temporal, penalización por caída).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados externamente, `verified: false`). SWS (success-weighted speed) es la media sobre pistas de finalizado × (tiempo del conductor scriptado / tiempo del agente); 1,0 equivale a completar todas las pistas tan rápido como el conductor de referencia. Una ejecución determinista por pista desde parado, con intervalos bootstrap del 95 % sobre pistas (una semilla).

| Conjunto de pistas | Pistas | SWS [IC 95 %] | Finalizadas |
|---|---|---|---|
| Campaña (hechas a mano) | 5 | 0,290 [0,000, 0,870] | 20,0 % |
| Test (generadas no vistas) | 971 | 0,329 [0,291, 0,367] | 22,3 % |

## Requisitos de hardware

- Inferencia en CPU: la política es una MLP de dos capas de 256 unidades; el cuello de botella es la simulación física del juego, no la red. Ejecutable con onnxruntime en CPU sin GPU.
- GPU: no requiere GPU dedicada para la inferencia. Cualquier GPU consumer (por ejemplo, GTX 1650 o superior) sobra para el forward pass; el entrenamiento original usó 16.384 entornos batcheados en PyTorch y se completó en 0,35 horas de reloj, lo que sugiere aceleración por GPU en el pipeline de entrenamiento, aunque el modelo no especifica el hardware exacto.
- VRAM estimada: no disponible; por el tamaño de la red (dos capas de 256), el uso es de unos pocos MB, dominado por el estado del entorno si se simula en batch.
- Despliegue: PyTorch (`final.pt` con `agent` y `norm`) y ONNX Runtime (`policy.onnx`, tal como lo ejecuta el juego en el navegador). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita; la evaluación se hace con una ejecución determinista por pista y `max_steps=1500` por episodio.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (agentes de RL para RacingMania u otros juegos de carreras con física similar) en la documentación proporcionada. El propio repositorio del autor podría contener otros especialistas y agentes generalistas de la misma campaña, pero sus especificaciones no se detallan aquí.

| Modelo | Parámetros | Contexto | SWS (test) | Finalización (test) | Licencia |
|---|---|---|---|---|---|
| racingmania-specialist-campaign-03-seed1 | no disponible (MLP 2x256) | no aplica | 0,329 | 22,3 % | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sobreajuste a una sola pista: entrenado únicamente en campaign-03, con `rotate_tracks_every=0` y `loaded_tracks=1`; la tasa de finalización en pistas no vistas es del 22,3 %, lo que indica una generalización limitada.
- Rendimiento bajo en términos absolutos: SWS de 0,329 en test y 0,290 en campaña, lejos del conductor scriptado de referencia (1,0).
- Intervalos de confianza amplios: en el conjunto de campaña, el IC del 95 % va de 0,000 a 0,870 con solo 5 pistas y una semilla; las cifras deben interpretarse con cautela.
- Métricas no verificadas: los resultados de la model-index están marcados como `verified: false` y proceden del propio autor.
- Sin evaluación estocástica ni multi-semilla: una ejecución determinista por pista, lo que no captura la varianza de la política.
- Dominio muy restringido: no es un modelo de lenguaje ni un modelo multimodal; no admite instrucciones en lenguaje natural ni transferencia directa a otros simuladores sin reentrenamiento.
- Dependencia del código del repositorio: la carga en PyTorch requiere clonar el proyecto (`racingmania.env.obs`, `racingmania.rl.networks`, `racingmania.rl.normalizer`) y respetar el formato descrito en `docs/formats.md`.
- Licencia MIT: permite uso comercial y modificación con atribución; no obstante, el juego y la física subyacentes forman parte del mismo repositorio y deben revisarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/racingmania-specialist-campaign-03-seed1
- Repositorio del proyecto (código, paper y resultados): https://github.com/BurnyCoder/reinforcement-learning-in-trackmania-like-racing-game
- Juego en GitHub Pages (opción "Watch the AI"): disponible a través del repositorio anterior
- Commit de entrenamiento: `8b86d3895e96f87bb0daa813c2d40cce56f21472`
