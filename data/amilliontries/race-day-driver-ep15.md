# amilliontries/race-day-driver-ep15

## Resumen

Race-day-driver-ep15 es una política de control continuo entrenada para conducir coches de carreras en un simulador multijugador de 8 vehículos. Lo desarrolla el creador de contenido "A Million Tries" como parte de la serie documental de su canal de YouTube, y se publica como checkpoint reproducible bajo licencia MIT. No es un modelo de lenguaje: es una red neuronal pequeña (96.519 parámetros) que mapea 115 observaciones numéricas del entorno a 3 acciones de control (volante, pedales y marcha atrás) a 20 Hz.

El problema que aborda es la gestión completa de una carrera con reglas físicas y estratégicas: desgaste de neumáticos escalado a 305 km de Gran Premio, límite de combustible sin repostaje, aire sucio, daños por contacto y una parada en boxes con limitador automático a 80 km/h en la que el coche debe detenerse exactamente en su caja. La relevancia técnica está en el pipeline de entrenamiento: PPO en un "colegio de carreras" que fracasó en aprender a parar (unas 60.000 llamadas, 0 paradas), imitación de un piloto de boxes escrito a mano (de 2 a 146 de 256 coches en circuitos no vistos) y finalmente evolución sobre resultados de carrera completos con neumáticos de GP.

La arquitectura es un perceptrón de tres capas (115 → 256 → 256 con tanh → 3), implementado en JAX y exportado en safetensors. Es un artefacto de investigación y divulgación, no un modelo de propósito general: su valor está en la reproducibilidad del experimento y en el estudio de la combinación de RL, imitación y estrategias evolutivas sobre un dominio con dinámica compleja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) denso: 115 → 256 → 256 (tanh) → 3 |
| Parametros totales | 96.519 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de control; ventana de observación de 115 números por paso) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería JAX) |

## Arquitectura y entrenamiento

La política es una MLP de tres capas con activación tanh en las capas ocultas y salida de 3 dimensiones que se ejecuta a 20 Hz. La entrada son 115 números: los 82 del piloto de la episodio 14 (láseres que ahora también se detienen en otros coches, la carretera por delante, el movimiento propio, estado de neumáticos, combustible y diales del coche) más los dos coches más cercanos por delante y por detrás, el estado de daños del propio coche, el compuesto de neumático, la llamada de boxes y una medida precisa de los metros hasta la caja. El código de referencia está en `games/race_field.py` y `agents/es_field.py`, y `ailearns.agents.ppo_car` construye la misma red.

El entrenamiento es un híbrido en tres fases documentado en los pasos 8-9 del devlog. Primero, PPO en un "colegio de carreras" con tramos de un minuto de carreras reales, devolución del coste de una parada llamada por el equipo y un entrenador de boxes: unas 60.000 llamadas y 0 paradas aprendidas. Después, imitación de un piloto de boxes escrito a mano, que llevó de 2 a 146 de 256 coches con parada llamada en circuitos no vistos. Finalmente, evolución sobre resultados de carrera (terminar y rápido; no terminar penaliza; sin entrenador), primero carreras completas y luego desgaste de neumáticos de Gran Premio. El checkpoint publicado corresponde a esa última ejecución, generación 50.

## Capacidades

- Control continuo de un coche de carreras: volante, acelerador, freno y marcha atrás, 20 veces por segundo.
- Conducción en carrera multijugador de 8 coches con contacto, daños físicos y aire sucio.
- Gestión de neumáticos blandos, medios y duros con desgaste escalado a 305 km y fallo al agotarse.
- Gestión de combustible con límite y sin repostaje; un depósito vacío retira el coche.
- Ejecución de la parada en boxes: giro de entrada, frenada y detención exacta en la caja con limitador automático a 80 km/h.
- Percepción de los dos coches más cercanos por delante y por detrás, además de láseres que se detienen en otros vehículos.
- No soporta tool calling, agentes multi-paso, lenguaje natural, visión ni audio.

## Casos de uso

- Investigación en RL híbrido: reproducir el pipeline PPO → imitación → evolución sobre un dominio con dinámica física compleja, usando el checkpoint como punto de partida o línea base.
- Estudio de imitación de políticas: analizar cómo la imitación de un piloto de boxes escrito a mano desbloquea una habilidad que PPO no adquirió tras 60.000 llamadas.
- Evaluación de estrategias evolutivas sobre resultados de carrera: comparar la generación 50 con generaciones anteriores bajo las mismas reglas (256 carreras, campos mixtos, neumáticos de GP).
- Simulación de estrategia de boxes: usar la política para estudiar cuándo y cómo un agente decide entrar a boxes con la llamada del equipo al superar el 60 % de desgaste del peor neumático.
- Docencia y divulgación: ejemplo ejecutable y de pequeño tamaño (96.519 parámetros) para explicar control continuo, recompensas escasas y entrenamiento multi-fase.
- Benchmark de robustez en circuitos no vistos: medir la generalización de la política en circuitos de test con diseños de coche aleatorios.
- Integración en simuladores de carreras personalizados: la red es lo bastante pequeña para ejecutarse en CPU a 20 Hz dentro de un bucle de simulación propio.

## Benchmarks y rendimiento

Resultados publicados en la model card bajo las reglas finales (comisarios retiran un coche parado en 10 s, un depósito vacío retira el coche), con 256 carreras de coche en campos mixtos de diseños aleatorios, circuitos de test, neumáticos de GP y el equipo llamando cuando el peor neumático supera el 60 %:

| Piloto | Terminó | Destrozado | Contra el muro | Seco y varado | Paradas por coche |
|---|---|---|---|---|---|
| El piloto de carrera completa antes de neumáticos de GP | 49 % | 18 % | 21 % | 11 % | 1,79 |
| **Este (entrenado con neumáticos de GP)** | **66 %** | **8 %** | 8 % | 8 % | 1,49 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (96.519 parámetros en safetensors); el repositorio ocupa 0,0 GB.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna ejecuta la red a 20 Hz sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en CPU.
- Opciones de despliegue: JAX directamente, o reimplementación de la MLP en NumPy/PyTorch a partir de los pesos safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles de forma explícita; la política está diseñada para 20 inferencias por segundo por coche.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| race-day-driver-ep15 | 96.519 | 115 números por paso, 20 Hz | Conducción de carreras multiagente con boxes | MIT | Hugging Face |
| Políticas PPO de referencia en entornos de control continuo (p. ej. MuJoCo) | Variable, típicamente 10^4-10^6 | Estado del entorno | Control continuo genérico | Variable | Librerías como Stable-Baselines3 |
| Agentes de conducción en simuladores (p. ej. CARLA) | Variable, a menudo CNN + MLP | Imágenes y estado | Conducción urbana | Variable | Repositorios de investigación |

No se dispone de comparativas directas publicadas con otros pilotos del mismo simulador más allá de la línea base de la generación anterior incluida en la tabla de benchmarks.

## Limitaciones y advertencias

- Ámbito muy restringido: solo conduce en el simulador `race_field.py` del proyecto; no es transferible a otros entornos sin reentrenar.
- No procesa lenguaje, imágenes ni audio; no sirve como modelo de propósito general.
- Rendimiento limitado incluso en su dominio: 66 % de carreras terminadas y 8 % de coches destrozados en la evaluación publicada.
- Sesgos conocidos: no documentados; el entrenamiento usa campos mixtos de diseños aleatorios, lo que puede introducir dependencias del diseño de coche.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la política puede tomar decisiones erróneas (paradas fallidas, choques) fuera de la distribución de circuitos y condiciones vistas.
- Limitaciones de idioma: no aplica; no hay soporte multilingüe.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Caveat para producción: es un artefacto de divulgación e investigación con 22 descargas y sin mantenimiento declarado; validar exhaustivamente antes de cualquier uso serio.

## Enlaces

- Hugging Face: https://huggingface.co/amilliontries/race-day-driver-ep15
- Código (tag `episode-15`): https://github.com/backstab319/a-million-tries/tree/episode-15
- Canal de YouTube: https://www.youtube.com/@amilliontries
