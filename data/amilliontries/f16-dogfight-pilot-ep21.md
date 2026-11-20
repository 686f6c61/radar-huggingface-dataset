# amilliontries/f16-dogfight-pilot-ep21

## Resumen

El modelo `f16-dogfight-pilot-ep21` es una red neuronal de politica entrenada con aprendizaje por refuerzo (PPO) para pilotar un F-16 simulativo en combates aereos uno contra uno (dogfight) con canones exclusivamente. Lo desarrolla el autor `amilliontries` en el contexto del canal de YouTube "A Million Tries", concretamente en el episodio 21 titulado "I Taught an AI to Dogfight. Fighting Itself Made It Worse.". No es un modelo de lenguaje ni un transformer generativo: es un agente de control continuo que mapea 38 observaciones del entorno a 4 acciones de vuelo a 20 Hz.

El entorno de simulacion es un modelo de vuelo de masa puntual en 3D construido a partir de datos publicos del F-16 (masa, superficie alar, empuje del F110, resistencia aerodinamica, limites de 9 g y 25 grados de angulo de ataque, canon M61 con dispersion y arrastre), validado contra tasas de giro, velocidad de esquina y velocidad punta publicadas. El agente se entreno primero contra un objetivo scriptado y despues mediante self-play contra versiones congeladas de si mismo. Esta ficha corresponde a la ejecucion de self-play numero 3 (`dogfight-self3`, actualizacion 1000), con un suelo minimo de exploracion impuesto tras detectar que la exploracion colapsaba en la primera ejecucion.

Con 152.841 parametros totales, es un modelo extremadamente pequeno (menos de 0,2 MB en safetensors) pensado para inferencia en JAX. Su relevancia no es la escala, sino la demostracion de un pipeline completo de RL con self-play, recompensa basada en dano y evaluacion A/B rigurosa sobre 512 combates. La licencia MIT permite reutilizacion comercial del codigo y pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) con cabezas de politica y valor: 38 -> 256 -> 256 (tanh) -> 4; cabeza de valor adicional solo en entrenamiento |
| Parametros totales | 152.841 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es modelo de lenguaje; observa 38 numeros por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria JAX) |

## Arquitectura y entrenamiento

La arquitectura es una red densa de tres capas: entrada de 38 dimensiones (estado del propio avion en su marco corporal: velocidad, Mach, altura, tasa de ascenso, actitud, g, angulo de ataque, acelerador, municion, salud, altura energetica; estado del adversario: posicion, distancia, direccion, velocidad de cierre, direccion de morro, velocidad, salud y municion; punto de mira del canon; tiempo restante), dos capas ocultas de 256 unidades con activacion tanh, y salida de 4 dimensiones. Tres salidas son comandos continuos en rango -1..1 (comando de g, tasa de alabeo y acelerador) y la cuarta es el logit de una probabilidad de disparo (dispara si p > 0,5). La red incluye pesos `pi*` para la politica y `v*` para la cabeza de valor, usada solo durante el entrenamiento. `log_std` representa la dispersion de exploracion de la palanca en tiempo de entrenamiento.

El entrenamiento usa PPO (`agents/ppo_dogfight.py`) con una recompensa definida como dano infligido menos dano recibido; estrellarse contra el suelo entrega la baja al adversario. El proceso fue por fases: primero un piloto de persecucion contra un objetivo scriptado, despues self-play con la mitad de los combates contra si mismo y la otra mitad contra las ultimas 16 versiones congeladas. La primera ejecucion de self-play empeoro el rendimiento porque la exploracion se redujo a cero; un experimento A/B identifico el restablecimiento de la exploracion como la variable decisiva. Esta ficha corresponde a la ejecucion `dogfight-self3` (actualizacion 1000) con un suelo minimo de exploracion.

## Capacidades

- Control continuo de vuelo de un F-16 simulativo a 20 Hz: comando de g, tasa de alabeo, acelerador y disparo.
- Combate aereo canon contra canon en 3D contra otro agente o contra objetivos scriptados.
- Percepcion del adversario en el marco corporal propio: posicion, distancia, direccion, velocidad de cierre, orientacion de morro, salud y municion.
- Calculo implicito del punto de mira del canon (donde pasaria una rafaga disparada en ese instante).
- Gestion de energia: mantiene altura energetica superior al piloto de persecucion (~7,9 km frente a 6,3 km) y vuela mas rapido con menor sobrepaso.
- Toma de decisiones bajo limite temporal de 120 s por combate (los empates se contabilizan como empates).
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en aprendizaje por refuerzo multiagente: sirve como referencia reproducible de un pipeline PPO con self-play, recompensa competitiva y evaluacion A/B sobre 512 combates con semilla fija (4242), util para estudiar colapso de exploracion y estabilidad de politicas.
- Simulacion de combate aereo para entrenamiento de pilotos: el agente puede actuar como adversario sintetico en escenarios de dogfight con canones, con comportamiento agresivo pero conservador en energia, adecuado para practicar maniobras defensivas.
- Benchmark de algoritmos de RL: al ser un modelo de 152.841 parametros con pesos safetensors y codigo MIT, se puede usar como baseline contra el que comparar variantes de PPO, SAC o self-play con poblaciones.
- Desarrollo de sistemas de piloto automatico tactico: la politica demuestra control continuo con limites fisicos realistas (9 g, 25 grados AoA, arrastre del canon), lo que permite estudiar la integracion de politicas neuronales en lazos de control de vuelo.
- Educacion y divulgacion tecnica: el modelo y su devlog documentan paso a paso como se construye un agente de RL desde cero, con resultados medidos, lo que lo hace idoneo para cursos de RL y simulacion.
- Pruebas de robustez de entornos simulados: al evaluarse contra objetivos scriptados (recto, giros, zigzag, ruptura a 9 g) con metricas de bajas y accidentes, sirve para validar la fidelidad del modelo de vuelo y del motor de simulacion.
- Generacion de repeticiones y datos sinteticos: el script `scripts/dogfight_replay.py` permite reproducir combates y extraer trazas para analisis posterior o para entrenar modelos supervisados de imitacion.

## Benchmarks y rendimiento

Resultados medidos sobre 512 combates nuevos (nivel 1: cualquier inicio en ~4 km, cualquier rumbo; semilla 4242), muestreados como en entrenamiento:

| Adversario | Victorias | Derrotas |
|---|---|---|
| Self-play run 2 (mejor anterior) | 57,2% | 14,3% |
| Piloto de persecucion (origen) | 62,1% | 5,5% |
| Objetivo scriptado (recto, giros, zigzag, ruptura a 9 g) | 67,2% (bajas) | 0,6% (accidentes) |

El resto son empates por limite de tiempo de 120 s. En 512 combates mantiene mas energia que el piloto de persecucion (altura energetica ~7,9 km frente a 6,3 km), vuela mas rapido, tira menos g y casi nunca sobrepasa; no encontro las maniobras verticales de manual.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para pesos (152.841 parametros en safetensors); el cuello de botella real es el entorno de simulacion, no la red.
- GPU recomendadas: cualquier GPU compatible con JAX (CUDA o ROCm); incluso CPU es suficiente para inferencia dada la escala del modelo.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: JAX (libreria declarada), con el codigo del repositorio `backstab319/a-million-tries` en el tag `episode-21`; no hay variantes GGUF, Ollama, vLLM ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; el control opera a 20 Hz (50 ms por paso), cota que cualquier hardware moderno cumple con holgura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| f16-dogfight-pilot-ep21 | 152.841 | no aplica (38 observaciones/paso) | Control de dogfight con PPO y self-play | MIT | Hugging Face + GitHub |
| Self-play run 2 (mismo autor) | no disponible | no aplica | Misma tarea, version anterior | MIT (presumible) | Referenciado, no publicado como repo independiente |
| Piloto de persecucion (mismo autor) | no disponible | no aplica | Misma tarea, fase previa contra objetivo scriptado | MIT (presumible) | Referenciado en el devlog |

No se dispone de informacion sobre modelos comparables de terceros en la misma categoria (agentes de RL para dogfight aereo) en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona simbolicamente, no soporta tool calling ni vision. Cualquier uso fuera del control de vuelo simulativo es inadecuado.
- El modelo de vuelo es una masa puntual en 3D, no un simulador de alta fidelidad: no modela inercias estructurales, flameo, fallos de sistemas ni dinamica de misiles.
- Entrenado exclusivamente para combate canon contra canon; no cubre misiles, formaciones, comunicaciones ni misiones multiobjetivo.
- No encontro las maniobras verticales de manual segun el autor; su repertorio tactico esta limitado a lo que emergio del self-play.
- Los empates por limite de 120 s representan una fraccion relevante de los combates; el porcentaje de victorias no equivale a superioridad tactica completa.
- Riesgo de sobreajuste al entorno concreto de entrenamiento (parametros del F-16, semilla, nivel 1 de inicio); el rendimiento fuera de esa distribucion no esta documentado.
- La exploracion requiere un suelo minimo; sin el, el entrenamiento colapsa (documentado en la primera ejecucion de self-play). Replicar el pipeline exige controlar ese hiperparametro.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero sin garantia implicita; no hay restricciones adicionales documentadas.
- Sesgos conocidos: no disponibles; al no procesar datos humanos ni lenguaje, no aplican sesgos demograficos, pero puede heredar sesgos del diseno del entorno y de la recompensa.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos; el riesgo equivalente es que la politica produzca acciones fuera de distribucion en estados no vistos durante el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/amilliontries/f16-dogfight-pilot-ep21
- Codigo (tag `episode-21`): https://github.com/backstab319/a-million-tries/tree/episode-21
- Canal de YouTube: https://www.youtube.com/@amilliontries
- No se han encontrado papers, blogs adicionales ni demos en la informacion proporcionada.
