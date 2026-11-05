# dummy033485/multi-agent-rl-navigation

## Resumen

`dummy033485/multi-agent-rl-navigation` es un repositorio de Hugging Face que contiene los artefactos de un proyecto de aprendizaje por refuerzo multiagente para navegacion 2D, presentado por su autor como proyecto de portafolio para una solicitud de admision en el laboratorio Trustworthy Autonomous Systems Lab (Georgia Tech). No se trata de un modelo de lenguaje: el repositorio empaqueta una politica PPO descentralizada compartida, un simulador fisico 2D propio, un controlador clasico de referencia y un protocolo de evaluacion con semillas fijas. El tamano del repositorio es de 0.0 GB, sin descargas ni likes en el momento de la consulta.

El interes tecnico del artefacto reside en su honestidad metodologica: compara la politica aprendida contra un controlador PD con campo de potencial repulsivo sobre exactamente los mismos layouts sembrados, e incluye condiciones de ruido, perturbaciones de dinamica y desplazamiento de obstaculos. El autor declara explicitamente que no hubo hardware real, que no existe garantia formal de seguridad y que todas las cifras son empiricas.

No se dispone de informacion sobre licencia, idiomas, pipeline ni formato de pesos en la metadata del repositorio. La model card describe la red como un MLP 20→128→128 con acciones gaussianas acotadas por tanh, entrenado con PPO desde cero en PyTorch y con inicializacion por imitation learning (behaviour cloning) del controlador clasico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 20→128→128 con acciones gaussianas acotadas por tanh; politica PPO descentralizada compartida entre agentes |
| Parametros totales | no disponible (arquitectura MLP pequena, cifra no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observacion de 20 dimensiones por agente, horizonte de episodio de 200 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye `sim.py`, `policies.py`, `train.py` y artefactos CSV/JSON, pero no se detalla el formato de serializacion de pesos) |

Parametros del simulador: arena de 12x12 con paredes, cinematica de doble integrador, `dt=0.1`, velocidad maxima 1.2, aceleracion maxima 3.0, radio de agente 0.25, limite de 200 pasos por episodio. Cada layout contiene 3 obstaculos circulares (radio 0.5-0.8) y 1 segmento de pared o barrera. Dos familias de layout generadas con semillas fijas: *general* (barrera de 3 m en angulo medio aleatorio) y *trap* (segmento vertical en x=6, y en [2,10], con huecos solo en los extremos).

## Arquitectura y entrenamiento

La politica es un perceptron multicapa de dos capas ocultas de 128 unidades que mapea una observacion descentralizada de 20 dimensiones a una accion de aceleracion continua, con una unica copia de pesos compartida por todos los agentes. La observacion incluye velocidad propia, vector y distancia al objetivo, obstaculo circular mas cercano (direccion, distancia a superficie, radio), segmento de pared mas cercano (direccion, distancia y ambos vectores de extremo), otro agente mas cercano (direccion, distancia) y distancia a la pared de la arena mas cercana. Los vectores de extremo se anadieron tras un fallo de entrenamiento: sin ellos la politica no podia observar donde termina la pared.

El entrenamiento combina behaviour cloning del controlador clasico sobre layouts *general* unicamente (400 episodios, 4 agentes, MSE de accion final 0.079), seguido de ajuste fino con PPO en cuatro fases: mixta con 1 agente (rampa de *trap*), solo *trap* con 1 agente y reinicio de exploracion, consolidacion mixta con 1 agente, y mixta con 4 agentes. Cada fase usa 300 iteraciones con rollouts de 128 pasos y 16 entornos, esto es, 614.400 pasos de entorno por fase; la cadena conservada suma 2.457.600 pasos mas el conjunto de BC. El autor documenta en `BUILD_REPORT.md` que los intentos previos de PPO desde cero fallaron con tasas de exito del 5-15%. El controlador clasico de referencia usa PD hacia el objetivo (KD=2.0) y campo de potencial radial repulsivo (ETA=6.0, D0=2.0) desde el obstaculo, segmento y vecino mas cercanos, sin truco de escape tangencial.

## Capacidades

- Navegacion 2D punto a punto en un simulador propio con obstaculos circulares y segmentos de pared.
- Coordinacion multiagente: una sola politica compartida controla hasta 4 agentes de forma descentralizada, con cero colisiones agente-agente en la condicion limpia.
- Resolucion de layouts tipo *trap* que derrotan a un controlador de campo potencial puro (tasa de exito 0.80 en 1 agente y 0.83 en 4 agentes frente a 0.00 del clasico).
- Robustez evaluada frente a ruido de observacion (sigma=0.05 y sigma=0.10), perturbacion de dinamica (ruido de aceleracion sigma=1.0) y desplazamiento de obstaculos (+0.5 en x).
- No soporta tool calling, function calling, generacion de texto, codigo, matematicas, vision, audio, modo de razonamiento explicito ni capacidades multilingues: no es un modelo de lenguaje ni un modelo multimodal.
- No incorpora garantia formal de seguridad; las cifras de seguridad son empiricas sobre los layouts de test fijos.

## Casos de uso

- Evaluacion academica de politicas de RL frente a baselines clasicos: el repositorio proporciona `sim.py`, `policies.py`, `train.py`, `eval.csv` (728 filas) y `results.json`, lo que permite reproducir la comparativa con las mismas semillas (1000-1019 para 1 agente, 2000-2011 para 4 agentes) y usar el artefacto como material docente o de revision.
- Investigacion en coordinacion multiagente descentralizada: sirve como banco de pruebas de bajo coste para estudiar politicas compartidas en enjambres de 4 agentes con observacion parcial de 20 dimensiones, sin dependencia de hardware ni entornos externos.
- Estudio de robustez y sim-to-real preliminar: las condiciones de ruido de observacion y perturbacion de dinamica permiten medir la degradacion de una politica aprendida antes de plantear transferencia a un robot real.
- Desarrollo de tecnicas de imitation learning: el pipeline de behaviour cloning desde un controlador PD mas ajuste PPO es un ejemplo reproducible de inicializacion por imitacion en un entorno de control continuo.
- Benchmark de planificacion con obstaculos no convexos: la familia *trap* con huecos solo en los extremos es un caso de prueba util para detectar minimos locales en planificadores basados en campos de potencial.
- Prototipado de agentes para videojuegos o simulaciones de multitudes en 2D: la politica compartida de 20 dimensiones de entrada es ligera y puede integrarse en un bucle de simulacion a `dt=0.1` sin requisitos de computo significativos.
- Analisis de seguridad de sistemas autonomos: el calculo de tasa de violacion de seguridad (fraccion de pasos activos con holgura inferior a 0.15) ofrece una metrica concreta para discutir la ausencia de garantias formales en politicas aprendidas.

## Benchmarks y rendimiento

Resultados copiados de `results.json` en la condicion limpia (episodios por agente: 20 en 1 agente, 48 en 4 agentes por politica y condicion):

| Politica | Agentes | Exito | Colision | Colision con obstaculo | Colision agente-agente | Timeout | Pasos (exito) | Longitud de camino | Holgura minima (exito) | Tasa violacion seguridad | General | Trap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Clasica | 1 | 0.450 | 0.000 | 0.000 | 0.000 | 0.550 | 73.22 | 5.35 | 0.588 | 0.000 | 0.90 | 0.00 |
| RL | 1 | 0.700 | 0.200 | 0.200 | 0.000 | 0.100 | 86.00 | 9.59 | 0.419 | 0.033 | 0.60 | 0.80 |
| Clasica | 4 | 0.396 | 0.000 | 0.000 | 0.000 | 0.604 | 160.42 | 5.87 | 0.690 | 0.000 | 0.79 | 0.00 |
| RL | 4 | 0.792 | 0.146 | 0.146 | 0.000 | 0.062 | 141.18 | 10.63 | 0.505 | 0.019 | 0.75 | 0.83 |

Lectura: la politica RL supera en exito al controlador clasico en todas las configuraciones y es la unica que resuelve los layouts *trap* y coordina 4 agentes sin colisiones agente-agente en limpio. Pierde en seguridad en el caso de 1 agente (20% de colisiones frente a 0% del clasico, que falla por timeout contra la pared). Los caminos de RL son mas largos (9.59 frente a 5.35 en 1 agente), lo que indica desvios deliberados. La tabla de robustez de la model card esta truncada en la informacion disponible, por lo que no se reproducen aqui las cifras de las condiciones con ruido ni con desplazamiento de obstaculos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con una MLP de 20→128→128 el numero de parametros es del orden de decenas de miles, por lo que la inferencia cabe holgadamente en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el entrenamiento descrito usa PyTorch con 16 entornos vectorizados y rollouts de 128 pasos, carga compatible con una unica GPU consumer, aunque el autor no publica requisitos.
- Cabe en GPU consumer: si, por el tamano de la red; no se detalla el modelo concreto.
- Opciones de despliegue: el repositorio esta planteado como codigo Python (`sim.py`, `policies.py`, `train.py`) ejecutado localmente; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dummy033485/multi-agent-rl-navigation` | Politica RL para navegacion 2D multiagente | MLP 20→128→128 | Observacion de 20 dim., episodios de 200 pasos | Exito 0.700 (1 agente) y 0.792 (4 agentes) en limpio | no disponible | Hugging Face, 0 descargas |
| Controlador PD + campo de potencial (baseline incluido en el mismo repo) | Control clasico | No aprendido (KD=2.0, ETA=6.0, D0=2.0) | Observacion completa del simulador | Exito 0.450 (1 agente) y 0.396 (4 agentes); 0% colisiones; 0.00 en *trap* | no disponible | Incluido en `policies.py` |
| Otras politicas RL de navegacion multiagente publicadas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada; la unica comparacion documentada es contra el baseline clasico incluido en el propio repositorio.

## Limitaciones y advertencias

- No es un resultado robotico: no se uso hardware y la politica no tiene garantia formal de seguridad; todas las cifras de seguridad son empiricas sobre layouts de test fijos del simulador.
- El 20% de colisiones en el caso de 1 agente en limpio es una limitacion relevante para cualquier uso en produccion o en sistemas fisicos.
- Los caminos de la politica RL son mas largos que los del controlador clasico (9.59 frente a 5.35 en 1 agente; 10.63 frente a 5.87 en 4 agentes), lo que implica desvios y mayor consumo de tiempo en misiones sensibles a la ruta.
- El layout *trap* esta construido deliberadamente para derrotar a un controlador de campo potencial puro; los resultados no deben generalizarse a entornos no representados en las dos familias de layouts del simulador.
- La tabla de robustez de la model card esta truncada en la informacion disponible; no se pueden verificar las cifras bajo ruido de observacion, perturbacion de dinamica ni desplazamiento de obstaculos.
- El entrenamiento desde cero con PPO fallo en intentos previos (exito 5-15%), lo que sugiere sensibilidad al diseno de recompensas y a la inicializacion; el pipeline final depende de behaviour cloning del controlador clasico.
- No se especifica licencia, lo que impide determinar las condiciones de uso comercial o de redistribucion.
- El repositorio tiene 0 descargas y 0 likes, sin Space de Hugging Face asociado; no hay evidencia de validacion por parte de terceros.
- El autor presenta el proyecto como portafolio de admision academica; no debe interpretarse como un sistema validado para operacion real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dummy033485/multi-agent-rl-navigation
- `BUILD_REPORT.md` (mencionado en la model card, disponible dentro del repositorio): no se proporciona URL directa
- `results.json`, `eval.csv`, `training_curve.csv`, `training_curve_*.csv` (artefactos citados en la model card): no se proporcionan URLs directas
- Paper, blog, demo o Space adicionales: no disponibles en la informacion proporcionada
