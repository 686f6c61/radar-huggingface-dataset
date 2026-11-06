# amilliontries/race-control-driver-ep16

## Resumen

`race-control-driver-ep16` es un agente de control continuo entrenado para pilotar coches de carreras en un simulador 2D propio, desarrollado por el creador del canal de YouTube "A Million Tries" (usuario `amilliontries` en Hugging Face). Corresponde al episodio 16 de la serie y es la evolución del piloto del episodio 15, al que se le añade la capacidad de percibir y respetar las señales de control de carrera: banderas amarillas y dobles amarillas por sectores, Virtual Safety Car (VSC), Safety Car real, banderas rojas y coches averiados detenidos en pista. Un único cerebro controla los ocho coches de cada carrera.

El modelo no es un LLM ni un transformer de lenguaje: es una red neuronal densa de tres capas (130 → 256 → 256 → 3) implementada en JAX, con solo 100.359 parámetros, que emite acciones de dirección, acelerador/freno y marcha atrás veinte veces por segundo. Se entrenó combinando expertos escritos a mano para cada tarea de control de carrera con aprendizaje por demostración (behavior cloning) sobre las trayectorias de esos expertos y del piloto del episodio 15.

Su relevancia es la de un caso de estudio reproducible de RL aplicado a dominio con reglas: el autor publica el código, el proceso de entrenamiento (pasos 9-15 del devlog) y un test de aceptación honesto en el que el modelo falla 2 de los 6 criterios. Es útil para investigadores interesados en imitation learning, control continuo multiagente y evaluación rigurosa de agentes con reglas dinámicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal densa (MLP) 130 → 256 → 256 (tanh) → 3, implementada en JAX |
| Parametros totales | 100.359 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la observación es un vector de 130 números por paso) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `jax`) |
| Frecuencia de decisión | 20 Hz (20 acciones por segundo) |
| Pipeline declarado | `reinforcement-learning` |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa de tres capas con activación tanh en las capas ocultas y salida de 3 dimensiones (dirección, pedal y marcha atrás). La entrada es un vector de 130 números: los 115 del piloto del episodio 15 más 15 señales nuevas de control de carrera (estado de la carrera —VSC, Safety Car, Safety Car en esta vuelta, bandera roja—, banderas en el sector propio y en el siguiente con los metros hasta él, tiempo acumulado frente al delta del VSC, si el coche de delante es el Safety Car, el lado del pit lane de su box y el coche detenido más cercano por delante con distancia y lado). El mismo cerebro se aplica a los ocho coches de la parrilla.

El entrenamiento siguió una estrategia híbrida en dos fases documentada en el devlog (pasos 9-15). Primero se escribieron expertos a mano para cada tarea de control de carrera: reducir bajo amarillas, mantener el delta bajo el VSC, hacer cola detrás del Safety Car y esquivar un coche detenido. Después se aplicó aprendizaje por demostración (`agents/bc_control.py`): las demostraciones usan la conducción de los expertos dentro de sus zonas de competencia y la del piloto del episodio 15 en el resto. La versión publicada es la ejecución D1-8, ronda 8, seleccionada entre nueve ejecuciones. El repositorio incluye también `ailearns.agents.ppo_car`, que construye la misma red para PPO, aunque la model card atribuye el resultado final a la fase de imitation learning.

## Capacidades

- Conducción autónoma en simulador 2D con acciones continuas (dirección, acelerador/freno y marcha atrás) a 20 Hz.
- Percepción de estado de carrera: VSC, Safety Car, Safety Car en esta vuelta y bandera roja.
- Lectura de banderas por sector (amarilla y doble amarilla) y distancia en metros hasta el siguiente sector.
- Gestión del delta de tiempo bajo Virtual Safety Car.
- Reconocimiento y seguimiento del Safety Car cuando lo tiene delante.
- Detección del coche detenido más cercano por delante, con distancia y lado, para intentar esquivarlo.
- Conocimiento del lado del pit lane correspondiente a su box.
- Control multiagente: una sola política gobierna los ocho coches de la carrera.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Investigación en imitation learning: reproducir el pipeline experto + behavior cloning con el código del tag `episode-16` para estudiar cómo escala la clonación cuando el experto solo cubre regiones parciales del espacio de estados.
- Estudio de control multiagente con política compartida: analizar el comportamiento emergente de ocho agentes que ejecutan la misma red en un entorno con reglas dinámicas (Safety Car, banderas) y comparar con políticas independientes.
- Benchmark de evaluación de agentes con reglas: reutilizar `scripts/race_accept.py` como plantilla de test de aceptación con criterios explícitos (penalizaciones, tiempo de carrera, ausencia de choques en la primera vuelta y en las relanzadas) y métricas de fallo honestas.
- Simulación de estrategia de carrera: usar el modelo como piloto base para probar protocolos de neutralización (VSC, Safety Car, bandera roja) en circuitos no vistos y medir el impacto en el tiempo total de carrera.
- Docencia de RL y JAX: el tamaño reducido (100.359 parámetros) y la licencia MIT permiten ejecutar el modelo en CPU y estudiar el flujo completo de observación, red y acción sin infraestructura pesada.
- Generación de datos sintéticos de conducción: las trayectorias del agente bajo banderas pueden servir como datos de entrenamiento o validación para otros controladores que deban respetar restricciones de velocidad sectoriales.
- Comparación de versiones de un agente: el par episodio 15 / episodio 16 permite medir el coste de añadir percepción de reglas (el modelo nuevo termina menos carreras y pierde más coches, pero reduce penalizaciones y tiempo de carrera).

## Benchmarks y rendimiento

Los únicos datos publicados son el test de aceptación del autor: 32 carreras completas (256 coches-carrera) en circuitos no vistos, con control de carrera activo, comparando con el piloto del episodio 15 en las mismas carreras.

| Métrica | Piloto ep. 15 (sin sentidos de control de carrera) | `race-control-driver-ep16` |
|---|---|---|
| Carreras terminadas | 64% | 58% |
| Coches fuera de carrera | 55 | 83 |
| Penalizaciones por carrera | No disponible | 0,12 |
| Tiempo de carrera (min) | 44,71 | 44,11 |
| Episodios con choque contra coches detenidos | 8 | 10 |
| Éxito al superar un accidente bajo Safety Car | No disponible | 96% (61% en la primera ejecución de demostración) |

El autor indica que el modelo pasa 4 de los 6 criterios del test (penalizaciones, tiempo de carrera, sin choques en la vuelta 1 ni en las relanzadas) y que el test, tal como está escrito, no se supera. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos en precisión completa (100.359 parámetros); cualquier GPU consumer de la última década es suficiente.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo cabe en CPU. En GPU, cualquier tarjeta compatible con JAX (por ejemplo, RTX 4090, A100, H100) ejecuta la inferencia sin cuello de botella por tamaño.
- Cabe en cualquier GPU consumer: sí, incluidas GTX 1050, RTX 3050 o superiores; el límite práctico es el simulador, no la red.
- Opciones de despliegue: JAX con los pesos safetensors del repo; el código del tag `episode-16` del repositorio de GitHub incluye el simulador (`games/race_control.py`) y los agentes. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma publicada; la política está diseñada para emitir una acción cada 50 ms (20 Hz), lo que fija el presupuesto de cómputo por paso.

## Comparativa con modelos similares

No hay modelos públicos directamente comparables en el ecosistema de Hugging Face con el mismo simulador y las mismas reglas de carrera. La comparación más pertinente es con las versiones anteriores del propio autor:

| Modelo | Parámetros | Contexto / observación | Control de carrera | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `race-control-driver-ep16` | 100.359 | Vector de 130 números, 20 Hz | Sí (banderas, VSC, Safety Car, bandera roja) | MIT | Hugging Face |
| `race-day-driver-ep15` | No disponible en la información | Vector de 115 números (sin sentidos de control de carrera) | No | No disponible en la información | Hugging Face |
| `race-car-v5` (episodio 5) | No disponible en la información | Láseres de 120 m; arranques descentrados y en movimiento | No | No disponible en la información | Hugging Face |

## Limitaciones y advertencias

- El test de aceptación del propio autor no se supera: el modelo termina menos carreras que el baseline (58% frente a 64%) y pierde más coches (83 frente a 55).
- Choca contra coches detenidos con una frecuencia similar al baseline (10 episodios frente a 8); el objetivo del test era la mitad.
- Es un agente específico de un simulador propietario del autor; no es transferible a conducción real ni a otros entornos sin reentrenamiento.
- No procesa lenguaje natural ni tiene capacidades de razonamiento simbólico, tool calling o agentes multi-paso.
- Riesgo de sobreajuste a las condiciones de entrenamiento: el autor reporta degradación en circuitos no vistos (el test se hizo precisamente sobre circuitos no vistos).
- No hay información publicada sobre sesgos de comportamiento más allá de las métricas del test; al ser una política de control, los sesgos relevantes son los del simulador y los de los expertos usados como demostración.
- La licencia MIT permite uso comercial y modificación, pero el simulador y el código asociado deben revisarse por separado en el repositorio de GitHub.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa independiente del autor.
- No se documentan cuantizaciones ni formatos alternativos de pesos; solo safetensors para JAX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amilliontries/race-control-driver-ep16
- Perfil del autor en Hugging Face: https://huggingface.co/amilliontries
- Piloto del episodio 15: https://huggingface.co/amilliontries/race-day-driver-ep15
- Piloto del episodio 5: https://huggingface.co/amilliontries/race-car-v5
- Código del episodio 16 (tag `episode-16`): https://github.com/backstab319/a-million-tries/tree/episode-16
- Canal de YouTube: https://www.youtube.com/@amilliontries
