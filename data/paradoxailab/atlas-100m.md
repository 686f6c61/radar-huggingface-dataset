# paradoxailab/atlas-100m

## Resumen

Atlas-100M es un modelo compacto de predicción espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) que unifica en un único conjunto de pesos la predicción meteorológica, la calidad del aire y el tráfico. Con 98.599.994 parámetros, emplea una arquitectura específica para series temporales con estaciones: un codificador por estación, atención entre estaciones con sesgo geométrico aprendido, dinámica latente iterada en el tiempo y un decodificador de cuantiles (10/50/90 %). No es un transformer de propósito general, sino un modelo especializado en pronóstico multiestación.

El modelo se presenta como una versión interina (2026-11-21) en la que solo se han evaluado meteorología y calidad del aire; los resultados de tráfico y la comparación híbrida con ECMWF/GFS siguen en ejecución. Deriva de Atlas-5K 24.1M mediante un crecimiento exacto de parámetros (verificado con el checkpoint G0), y se entrenó con 100.000 pasos sobre datos reales de estaciones: WEATHER-5K (5.672 estaciones), CPCB India (263 estaciones de PM2.5) y seis redes viarias de EE. UU., en una sola A100 durante 317,6 minutos.

Su relevancia radica en que compite con modelos fundacionales zero-shot (TimesFM, Chronos, Time-MoE, TiRex, TTM) en su dominio, con resultados favorables en 100 de 100 comparaciones meteorológicas, aunque con limitaciones explícitas en presión a nivel del mar y en estaciones no vistas durante el entrenamiento. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador por estación (8 bloques residuales) → atención entre estaciones con sesgo geométrico aprendido → dinámica latente (7 bloques por paso) → decodificador de cuantiles (10/50/90 %); ancho 784, 16 cabezas |
| Parametros totales | 98.599.994 (núcleo compartido 94.755.808 + adaptadores: meteorología 779.932, calidad del aire 2.983.932, tráfico 80.322) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de pronóstico de 24 h según el ejemplo de código) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt); ficheros `atlas100m_best.pt`, `atlas100m_weather_view.pt`, `atlas100m_aq_view.pt`, `atlas100m_traffic_view.pt`, más `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura no es un transformer estándar: cada estación se codifica con 8 bloques residuales, tras lo cual una capa de atención entre estaciones incorpora un sesgo geométrico aprendido que modela la relación espacial entre ubicaciones. La representación latente se avanza en el tiempo mediante 7 bloques por paso, y un decodificador de cuantiles (10/50/90 %) predice el cambio respecto a la última observación. El ancho es de 784 con 16 cabezas de atención. El modelo comparte un núcleo de 94,7 M de parámetros y añade adaptadores ligeros por dominio (meteorología, calidad del aire, tráfico).

El entrenamiento se realizó durante 100.000 pasos con datos reales de estaciones: WEATHER-5K (5.672 estaciones), CPCB all-India PM2.5 (263 estaciones) y seis redes viarias de EE. UU., usando una única A100 durante 317,6 minutos con semilla 700. El modelo se construyó a partir de Atlas-5K 24.1M mediante crecimiento exacto de parámetros, verificado en el checkpoint G0 (mismos pronósticos antes del entrenamiento). El diseño experimental se pre-registró en `PREREG.md` antes de la primera ejecución en GPU, y los resultados completos (victorias, empates y derrotas) se documentan en `RESULTS.md`. No se menciona RLHF ni DPO; el entrenamiento es supervisado con pérdida de cuantiles.

## Capacidades

- Pronóstico meteorológico multiestación a 24 h: temperatura, punto de rocío, dirección y velocidad del viento y presión a nivel del mar.
- Pronóstico de calidad del aire (PM2.5) sobre estaciones de la India.
- Pronóstico de tráfico (pendiente de evaluación publicada).
- Predicción probabilística mediante tres cuantiles (10/50/90 %), útil para intervalos de incertidumbre.
- Modelado espacial explícito: atención entre estaciones con sesgo geométrico, lo que permite aprovechar estaciones vecinas.
- Predicción del incremento respecto a la última observación (no del valor absoluto).
- No soporta tool calling, agentes, visión, audio ni capacidades lingüísticas: es un modelo numérico de series temporales.

## Casos de uso

- Pronóstico meteorológico operativo local: el modelo predice temperatura, viento y punto de rocío a 24 h para miles de estaciones, aprovechando la atención entre estaciones vecinas para mejorar la coherencia espacial.
- Gestión de calidad del aire urbana: con el adaptador de calidad del aire se pueden anticipar episodios de PM2.5 en estaciones de la India, útil para alertas sanitarias y decisiones de tráfico restringido.
- Predicción de tráfico en redes viarias: el adaptador de tráfico (pendiente de resultados publicados) permite estimar la evolución del flujo en redes como METR-LA o PEMS-BAY.
- Investigación en modelos fundacionales de series temporales: sirve como referencia entrenada específicamente para comparar contra modelos zero-shot como TimesFM o Chronos.
- Despliegue en entornos con recursos limitados: con ~98,6 M de parámetros y un entrenamiento de 317,6 minutos en una A100, es viable en una única GPU consumer para inferencia.
- Generación de intervalos de incertidumbre: los cuantiles 10/50/90 % permiten construir bandas de confianza para sistemas de alerta temprana.
- Evaluación de transferencia espacial: el modelo incluye comparaciones explícitas entre estaciones entrenadas y no entrenadas, útil para estudiar generalización geográfica.

## Benchmarks y rendimiento

Meteorología, test completo de 2023 (5.672 estaciones, MAE):

| Variable | MAE Atlas-100M | Comparación |
|---|---|---|
| Temperatura | 1,396 | −9,9 % frente a PhysicsFormer |
| Punto de rocío | 1,466 | −7,8 % frente a PhysicsFormer |
| Dirección del viento | 53,23 | −7,2 % frente a PhysicsFormer |
| Velocidad del viento | 1,172 | −3,1 % frente a PhysicsFormer |
| Presión a nivel del mar | 1,474 | +3,1 % (peor) frente a PhysicsFormer; peor que ECMWF-HRES (0,86) |

Comparación head-to-head con diez modelos fundacionales zero-shot (709 estaciones, test 2023 y periodo en vivo 2024-25): victoria en 100 de 100 comparaciones. Frente a TimesFM 3.0 en el test de 2023: temperatura −25,9 %, punto de rocío −25,6 %, dirección del viento −14,6 %, velocidad del viento −11,2 %, presión −25,1 %.

Calidad del aire (PM2.5, toda la India):

| Escenario | Resultado |
|---|---|
| Estaciones entrenadas | Victoria frente a Chronos-Bolt, Chronos-2, Sundial, TimesFM 2.5, Time-MoE, TiRex y TTM |
| Estaciones entrenadas | Empate con TimesFM 3.0, TimesFM 3.0 multivariante (+0,8 %, ligeramente peor) y Atlas-India v1.0 |
| Estaciones no entrenadas | Victoria solo frente a Time-MoE y TTM |

Tráfico y comparación híbrida con ECMWF/GFS: pendientes de publicación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~98,6 M de parámetros en fp32 el peso ronda los 0,4 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU de entrenamiento utilizada: una A100 (317,6 minutos, 100.000 pasos).
- GPU recomendadas para inferencia: cualquier GPU con suficiente VRAM para el tamaño del lote y el número de estaciones; no se especifican modelos concretos.
- Cabe en GPU consumer: sí, por el tamaño del modelo; no se detallan requisitos exactos.
- Opciones de despliegue: carga mediante PyTorch con `atlas.grow.load_any` o `m100.multi.MultiAtlas.load`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-100M | 98,6 M | no disponible (pronóstico 24 h) | Entrenado en estaciones; atención espacial | Apache-2.0 | Hugging Face |
| TimesFM 3.0 | no disponible | no disponible | Fundacional zero-shot | no disponible | no disponible |
| Chronos-Bolt / Chronos-2 | no disponible | no disponible | Fundacional zero-shot | no disponible | no disponible |
| Time-MoE | no disponible | no disponible | MoE zero-shot | no disponible | no disponible |
| PhysicsFormer | no disponible | no disponible | Físico publicado | no disponible | no disponible |

Atlas-100M supera a los modelos zero-shot en meteorología (100/100) y empata o gana frente a la mayoría en calidad del aire, pero pierde frente a ECMWF-HRES en presión y solo vence a Time-MoE y TTM en estaciones no entrenadas.

## Limitaciones y advertencias

- Entrenado específicamente en las tareas evaluadas frente a modelos zero-shot que no fueron ajustados en esos datos; la comparación no es simétrica.
- Rendimiento débil en presión a nivel del mar y en estaciones no vistas durante el entrenamiento.
- Un único seed de entrenamiento (semilla 700), lo que limita la robustez estadística de las conclusiones.
- No es un modelo global en rejilla ni se ha comparado con modelos world model de vídeo o robótica.
- Resultados de tráfico y comparación híbrida con ECMWF/GFS aún no publicados; la model card es interina.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de extrapolación incorrecta fuera de la distribución de estaciones y variables entrenadas.
- Licencia Apache-2.0 permite uso comercial; deben respetarse las licencias de los datos de origen (WEATHER-5K, NOAA ISD, CPCB vía Kaggle, Caltrans PeMS / METR-LA / PEMS-BAY).

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-100m
- Modelo base: https://huggingface.co/paradoxailab/atlas-5k-25m
- Pre-registro: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/m100/PREREG.md
- Informe completo: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/m100/RESULTS.md
- Repositorio: https://github.com/paradoxailab/paradox-world-model
