# PARADOXAIlabs/atlas-100m

## Resumen

Atlas-100M es un modelo compacto de predicción espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) que unifica en un único conjunto de pesos la predicción meteorológica, la calidad del aire y el tráfico. Con 98.599.994 parámetros, emplea una arquitectura específica para datos de estaciones: un codificador por estación, atención entre estaciones con sesgo geométrico aprendido, dinámica latente por pasos temporales y un decodificador cuantílico (percentiles 10, 50 y 90) que predice el cambio respecto a la última observación.

El modelo se presenta como un "world model" de dominio específico, no como un modelo fundacional de propósito general. Se entrena exclusivamente con datos reales de estaciones: WEATHER-5K (5.672 estaciones), CPCB de PM2.5 en India (263 estaciones) y seis redes viarias de EE. UU. La relevancia actual radica en su estrategia de pre-registro de hipótesis antes de cada ejecución en GPU y en la publicación exhaustiva de victorias, empates y derrotas frente a modelos fundacionales de series temporales (TimesFM, Chronos, Time-MoE, TiRex, TTM) y especialistas (STID, Graph WaveNet, STAEformer).

La versión 1.1 añade mejoras en el dominio del tráfico (Atlas-100M-TXL2) y un híbrido que incorpora pronósticos globales de ECMWF IFS, AIFS y NOAA GFS. El modelo destaca en meteorología (100 de 100 victorias frente a diez modelos fundacionales zero-shot) pero pierde claramente en tráfico frente a especialistas entrenados, una limitación que el propio autor documenta de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador por estación (8 bloques residuales) → atención entre estaciones con sesgo geométrico aprendido → dinámica latente (7 bloques por paso) → decodificador cuantílico (10/50/90 %); anchura 784, 16 cabezas |
| Parametros totales | 98.599.994 (núcleo compartido 94.755.808 + adaptadores: meteorología 779.932, calidad del aire 2.983.932, tráfico 80.322) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt): `atlas100m_best.pt`, `atlas100m_weather_view.pt`, `atlas100m_aq_view.pt`, `atlas100m_traffic_view.pt`, `traffic/atlas100mT_best.pt`, `traffic/atlas100mT1d_best.pt`, `traffic/atlas100mTXL2_best.pt`, `hybrid/hybrid_best.pt`, `hybrid/hybrid2_best.pt` |

## Arquitectura y entrenamiento

La arquitectura procesa datos de estaciones mediante un codificador individual de 8 bloques residuales por estación, seguido de un mecanismo de atención entre estaciones que incorpora un sesgo geométrico aprendido (lo que permite al modelo explotar la proximidad espacial entre sensores). Sobre esa representación opera un módulo de dinámica latente que avanza el estado en el tiempo con 7 bloques por paso, y finalmente un decodificador cuantílico que emite predicciones en los percentiles 10, 50 y 90, formuladas como el cambio respecto a la última observación. La anchura es de 784 y usa 16 cabezas de atención.

El entrenamiento se realizó durante 100.000 pasos exclusivamente con datos reales de estaciones: WEATHER-5K (5.672 estaciones), CPCB de PM2.5 en toda India (263 estaciones) y seis redes viarias estadounidenses, en una única A100 durante 317,6 minutos con semilla 700. El modelo se construyó a partir de Atlas-5K 24.1M mediante crecimiento exacto (verificado con el checkpoint G0: mismos pronósticos antes del entrenamiento). No se menciona RLHF ni DPO, al no tratarse de un modelo lingüístico. La innovación metodológica destacable es el pre-registro de hipótesis (`PREREG.md`) comprometido antes de la primera ejecución en GPU, junto con la publicación del informe completo de resultados (`RESULTS.md`) que incluye cada victoria, empate y derrota con tests pareados corregidos por Holm.

## Capacidades

- Predicción meteorológica por estación: temperatura, punto de rocío, dirección y velocidad del viento y presión a nivel del mar.
- Predicción de calidad del aire: PM2.5 a nivel de estación en toda India.
- Predicción de tráfico: siguiente hora en pasos de 5 minutos sobre seis redes viarias de EE. UU. (con limitaciones, ver más abajo).
- Predicción multi-paso en el tiempo mediante dinámica latente iterada.
- Predicción cuantílica (percentiles 10, 50 y 90), lo que permite intervalos de incertidumbre.
- Modelo multi-dominio con núcleo compartido y adaptadores específicos por dominio, con pesos del núcleo almacenados una sola vez.
- Modo híbrido: la vista meteorológica puede ingerir pronósticos globales (ECMWF IFS, AIFS, NOAA GFS) como entradas adicionales.
- No soporta tool calling, agentes ni capacidades lingüísticas: no es un modelo de lenguaje.
- No soporta visión, audio ni modos de razonamiento explícito.

## Casos de uso

- Predicción meteorológica local a corto plazo: el modelo genera pronósticos por estación con intervalos cuantílicos, adecuado para servicios meteorológicos que operan redes densas de sensores (5.672 estaciones en el conjunto de entrenamiento) y necesitan temperatura, viento, punto de rocío y presión con incertidumbre cuantificada.
- Corrección de sesgo de pronósticos globales: el modo híbrido lee las salidas de ECMWF IFS, AIFS y NOAA GFS y produce una predicción corregida; en las pruebas superó a IFS bruto y corregido en temperatura (−19 % / −11 %), punto de rocío (−25 % / −16 %), dirección del viento (−22 %) y velocidad del viento (−30 % / −17 %).
- Monitorización de calidad del aire en India: la vista de calidad del aire predice PM2.5 en estaciones CPCB; útil para sistemas de alerta temprana en ciudades con alta contaminación, aunque su ventaja se limita a estaciones vistas durante el entrenamiento.
- Investigación en modelos fundacionales de series temporales: el modelo sirve como referencia reproducible (pre-registro, semilla fija, informe completo) para comparar arquitecturas de atención entre estaciones frente a enfoques zero-shot.
- Relleno de huecos en series de sensores: la formulación como predicción del cambio respecto a la última observación permite reconstruir observaciones faltantes en redes de estaciones meteorológicas o de calidad del aire.
- Evaluación de estrategias de adaptación multi-dominio: los adaptadores por dominio (menos de 3 M de parámetros cada uno sobre un núcleo de 94,8 M) permiten estudiar cuánto conocimiento comparte entre meteorología, aire y tráfico, y el proyecto publica los pesos por vista para reproducir el análisis.
- Predicción de tráfico en ausencia de especialistas: solo recomendable cuando no se dispone de un modelo de tráfico entrenado, ya que frente a especialistas pierde en 22 de 24 comparaciones; la variante TXL2 (20,45 M de parámetros de tráfico) reduce las derrotas pero no alcanza a STAEformer ni a PWM-Dyn en algunas redes.

## Benchmarks y rendimiento

Meteorología, test completo de 2023 (5.672 estaciones, MAE):

| Variable | MAE Atlas-100M | Comparación con PhysicsFormer | Comparación con ECMWF-HRES |
|---|---|---|---|
| Temperatura | 1,396 | −9,9 % (mejor) | No disponible |
| Punto de rocío | 1,466 | −7,8 % (mejor) | No disponible |
| Dirección del viento | 53,23 | −7,2 % (mejor) | No disponible |
| Velocidad del viento | 1,172 | −3,1 % (mejor) | No disponible |
| Presión a nivel del mar | 1,474 | +3,1 % (peor) | Peor (0,86) |

Comparación cara a cara con diez modelos fundacionales zero-shot (709 estaciones, test 2023 y periodo en vivo 2024-25): victoria en 100 de 100 comparaciones. Frente a TimesFM 3.0 en el test de 2023: temperatura −25,9 %, punto de rocío −25,6 %, dirección del viento −14,6 %, velocidad del viento −11,2 %, presión −25,1 %.

Calidad del aire, PM2.5 en toda India (estaciones entrenadas / no entrenadas): victoria frente a Chronos-Bolt, Chronos-2, Sundial, TimesFM 2.5, Time-MoE, TiRex y TTM en estaciones entrenadas; empate con TimesFM 3.0, TimesFM 3.0 multivariante (+0,8 %, ligeramente peor) y Atlas-India v1.0. En estaciones nunca entrenadas, solo gana a Time-MoE y TTM.

Tráfico (seis redes, siguiente hora en pasos de 5 min): derrota clara en 22 de 24 comparaciones frente a especialistas entrenados STID, Graph WaveNet, STAEformer y PWM-Dyn v0.6r (4-27 % peor); frente a fundacionales zero-shot: 7 victorias, 11 empates, 12 derrotas (pierde con TimesFM 2.5/3.0 en las cuatro redes PeMS). La variante TXL2 logra 18 victorias y 12 empates frente a fundacionales, y 4 victorias, 13 empates y 7 derrotas frente a especialistas.

Meteorología en India (68 estaciones, 2023 y 2024-25): 19 victorias, 74 empates, 7 derrotas de 100 comparaciones (a nivel global: 100 de 100).

Híbrido con pronósticos globales (178 estaciones, 2025, 24 h, `hybrid2_best.pt`): victoria frente a IFS bruto y corregido en temperatura (−19 % / −11 %), punto de rocío (−25 % / −16 %), dirección del viento (−22 %) y velocidad del viento (−30 % / −17 %); victoria frente a GFS bruto y corregido en las cinco variables; victoria frente a AIFS bruto en temperatura y viento (resto de comparaciones con AIFS: empate); derrota frente a IFS corregido en presión a nivel del mar (+12 %). Total: 45 victorias, 9 empates, 1 derrota. La comparación con GraphCast está pendiente de completar los archivos de pronóstico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 98,6 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,4 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- Entrenamiento: una única A100 durante 317,6 minutos para 100.000 pasos.
- GPU recomendadas: A100 para entrenamiento; para inferencia, cualquier GPU con suficiente VRAM para los pesos y los lotes de estaciones (no se publican cifras de throughput).
- Cabe en GPU consumer: sí, por tamaño de pesos; no se especifican requisitos adicionales de memoria para lotes grandes de estaciones.
- Opciones de despliegue: la model card solo indica carga mediante PyTorch con las funciones `m100.multi.MultiAtlas.load`, `atlas.grow.load_any`, `m100.traffic_plus.load_plus` y `m100.hybrid.HybridData` del repositorio GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-100M | 98,6 M | No disponible | Gana a 10 fundacionales en meteorología (100/100); pierde en tráfico frente a especialistas | Apache 2.0 | Hugging Face + GitHub |
| TimesFM 3.0 | No disponible | No disponible | Pierde frente a Atlas-100M en las cinco variables meteorológicas (−11 % a −26 %); empata en calidad del aire; gana en cuatro redes PeMS de tráfico | No disponible | No disponible |
| Chronos-Bolt / Chronos-2 | No disponible | No disponible | Pierden frente a Atlas-100M en calidad del aire en estaciones entrenadas | No disponible | No disponible |
| STAEformer / PWM-Dyn (especialistas de tráfico) | No disponible | No disponible | Ganan a Atlas-100M en 22 de 24 comparaciones de tráfico; TXL2 reduce la brecha pero sigue por detrás en algunas redes | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo está entrenado para la tarea frente a modelos zero-shot: los fundacionales comparados no fueron ajustados en estos conjuntos de datos, y Atlas sí vio los años anteriores de las mismas estaciones y los vecinos de cada estación, lo que favorece sus resultados.
- Rendimiento débil en presión a nivel del mar (peor que PhysicsFormer en +3,1 % y que ECMWF-HRES) y en estaciones nunca vistas durante el entrenamiento.
- En India el rendimiento es similar, no superior, a los fundacionales (19 victorias, 74 empates, 7 derrotas).
- Tráfico: el autor recomienda explícitamente no usar la vista de tráfico cuando se dispone de un modelo de tráfico entrenado; la variante TXL2 mejora pero no supera a STAEformer ni a PWM-Dyn en todas las redes.
- Un solo seed de entrenamiento por modelo, lo que limita la robustez estadística de las conclusiones.
- No es un modelo global en rejilla y no se ha comparado con modelos world model de vídeo o robótica.
- La comparación con GraphCast y con estaciones indias frente a otros sistemas está pendiente de completarse.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera de los dominios y estaciones evaluados.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones poco fiables fuera de la distribución de entrenamiento (nuevas estaciones, nuevas regiones geográficas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-100m
- Modelo base Atlas-5K 24.1M: https://huggingface.co/PARADOXAIlabs/atlas-5k-25m
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Marcador de resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/m100/STANDINGS.md
- Pre-registro: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/m100/PREREG.md
- Informe completo de resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/m100/RESULTS.md
