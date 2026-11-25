# hf-amitkumawat/nilm-heavy-15min

## Resumen

NILM heavy-15min es un modelo de desagregación de cargas eléctricas (Non-Intrusive Load Monitoring, NILM) desarrollado por el usuario hf-amitkumawat y publicado en Hugging Face bajo licencia Apache 2.0. Su función es leer una serie temporal de consumo eléctrico agregado con cadencia de 15 minutos (el intervalo habitual en los contadores inteligentes AMI de estilo indio) y predecir, para cada intervalo, la potencia media de tres electrodomésticos de ciclo largo: termo de agua (water heater), bomba de calor (heat pump) y secadora de ropa (clothes dryer).

El modelo emplea una arquitectura seq2point basada en una CNN 1D combinada con una BiGRU, con aproximadamente 1,2 millones de parámetros. Se entrenó sobre AMPDS2, un conjunto de dos años de datos de contador a resolución de 1 minuto remuestreados a 15 minutos, con una ventana de entrada de 96 intervalos (24 horas) y características de hora del día y día de la semana. La relevancia actual radica en que los métodos clásicos no supervisados de NILM (FHMM, optimización combinatoria) se degradan severamente a resoluciones de 15 o 30 minutos, mientras que un modelo supervisado entrenado específicamente en esa resolución mantiene un rendimiento viable.

El repositorio incluye dos checkpoints (15 y 30 minutos), scripts de inferencia y entrenamiento, y documenta de forma transparente sus limitaciones, en particular el colapso de la cabeza de la secadora a 30 minutos y su tendencia a sobreactivar detecciones. El tamaño del repositorio es de 0,0 GB según la información disponible, aunque contiene pesos en formato PyTorch (`.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2point: CNN 1D + BiGRU |
| Parametros totales | ~1,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 intervalos (24 h de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, state_dict + norm stats + thresholds) |

## Arquitectura y entrenamiento

La arquitectura es un modelo seq2point: una red convolucional 1D procesa la ventana de entrada de 96 intervalos (24 horas) y una BiGRU modela la dependencia temporal bidireccional, produciendo para cada intervalo la potencia media estimada de cada electrodoméstico. La entrada se complementa con características de hora del día y día de la semana. El modelo tiene aproximadamente 1,2 millones de parámetros, lo que lo hace extremadamente ligero.

El entrenamiento se realizó sobre el conjunto AMPDS2 (Harvard Dataverse, doi 10.7910/DVN/FIE0S4), con dos años de datos de contador a 1 minuto remuestreados a 15 minutos. El agregado se compone de los canales MHE + WHE (el canal BME del dataset es un medidor de rama de 120 V que no captura los circuitos de 240 V y no es utilizable como agregado). La partición es de 21 meses para entrenamiento y 3 meses para test (8.736 ventanas retenidas). La configuración de entrenamiento es de 8 épocas, batch de 256, optimizador Adam con tasa 1e-3 y una función de pérdida que combina MSE con una BCE auxiliar de ON/OFF; este término BCE es lo que evita que la cabeza de la secadora, con ciclo de trabajo muy bajo, colapse a todo apagado. Existe además una variante entrenada sobre medias de 30 minutos con la misma arquitectura.

## Capacidades

- Desagregación de consumo eléctrico agregado en tres electrodomésticos: termo de agua, bomba de calor y secadora.
- Predicción por intervalo de la potencia media (en vatios) de cada electrodoméstico.
- Detección de bloques ON consecutivos (bloques de al menos 15 minutos) mediante umbrales incluidos en el checkpoint.
- Autodetección de la cadencia de 15 o 30 minutos en el script de inferencia.
- Entrada de datos en formato CSV con columnas `ts, mains` o `mains_kwh`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo de series temporales, no un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Desagregación de contadores AMI de 15 minutos: el modelo consume directamente la exportación del contador en kW/kWh a 15 minutos y devuelve la potencia estimada de termo, bomba de calor y secadora, lo que permite a una utility ofrecer informes de consumo por aparato sin instalar sensores adicionales.
- Detección de termo de agua para gestión de demanda: con un MAE de 108 W y un F1 de bloque de 0,909 a 15 minutos, es adecuado para identificar ciclos de calentamiento y programar desplazamientos de carga en horas valle.
- Monitorización de bombas de calor y climatización: el F1 de bloque de 0,848 a 15 minutos permite estimar el consumo de calefacción/refrigeración y alimentar programas de eficiencia energética o de respuesta a la demanda.
- Análisis de hábitos de secadora en estudios de eficiencia: aunque la cabeza de secadora tiene alta sensibilidad (recall 0,955) y baja precisión (0,184), sirve para estudios agregados si se filtra por longitud mínima de bloque de 2 o más intervalos.
- Adaptación a mercados con cadencia de 30 minutos: el checkpoint de 30 minutos ofrece MAE de 164 W y F1 de bloque de 0,928 para el termo, adecuado para utilities con esa resolución de AMI.
- Reentrenamiento sobre datos propios de AMI: el script `train_nilm.py` permite reentrenar con datos etiquetados de hogares propios; según el autor, es un cambio de mapeo de columnas, no un rediseño.
- Investigación en NILM supervisado a baja resolución: sirve como línea base reproducible para comparar con FHMM y métodos combinatorios en el régimen de 15/30 minutos, donde los métodos no supervisados se degradan.

## Benchmarks y rendimiento

Resultados sobre los últimos 3 meses retenidos (bloque = intervalos ON consecutivos de al menos 15 minutos), checkpoint de 15 minutos:

| Aparato | MAE (W) | F1 por intervalo | Precisión de bloque | Recall de bloque | F1 de bloque |
|---|---|---|---|---|---|
| Termo de agua (whe) | 108 | 0,956 | 0,911 | 0,908 | 0,909 |
| Bomba de calor (hpe) | 150 | 0,771 | 0,761 | 0,957 | 0,848 |
| Secadora (cde) | 101 | 0,331 | 0,184 | 0,955 | 0,309 |

Resultados de la variante de 30 minutos (últimos 3 meses retenidos, intervalos de 30 minutos):

| Aparato | MAE (W) | F1 por intervalo | F1 de bloque |
|---|---|---|---|
| Termo de agua (whe) | 164 | 0,957 | 0,928 |
| Bomba de calor (hpe) | 219 | 0,659 | 0,803 |
| Secadora (cde) | 110 | 0,000 | 0,000 (colapsada) |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con ~1,2 M de parámetros, el checkpoint ocupa unos pocos megabytes y la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer y también en CPU; la inferencia sobre lotes de ventanas de 96 intervalos es viable en CPU para volúmenes moderados.
- Opciones de despliegue: el repositorio proporciona `infer_nilm.py` (PyTorch) y `train_nilm.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NILM heavy-15min | Seq2point CNN 1D + BiGRU | ~1,2 M | 96 intervalos (24 h) | Apache 2.0 | Hugging Face |
| FHMM (método clásico no supervisado) | Modelo oculto de Markov factorial | no aplica | ventana configurable | implementaciones varias (p. ej. NILMTK) | código abierto |
| Optimización combinatoria (CO) | Búsqueda sobre estados de aparatos | no aplica | ventana configurable | implementaciones varias | código abierto |

No se dispone de datos de benchmarks comparativos directos entre este modelo y las alternativas clásicas en la información proporcionada; la model card cita literatura (Zhao et al., Applied Energy 262, 2020; Mariño et al., IEEE GTD-LA 2024) que respalda la superioridad del enfoque supervisado a resolución de despliegue, pero sin cifras comparativas en el repositorio.

## Limitaciones y advertencias

- La cabeza de secadora sobreactiva: detecta el 95 % de las ejecuciones reales pero genera 342 bloques predichos frente a 66 reales; en producción debe filtrarse con una longitud mínima de bloque de 2 o más intervalos.
- A 30 minutos, la cabeza de secadora colapsa por completo (F1 0,000), ya que su proporción de intervalos ON cae a ~2 %.
- No debe alimentarse el checkpoint de 15 minutos con datos de 30 minutos ni viceversa: hay desajuste de ventana y cadencia.
- La transferencia de la cabeza de bomba de calor a equipos split indios de 1–1,5 kW no está probada.
- No existe cabeza para vehículo eléctrico; se necesitarían datos sintéticos o de utility, ya que no hay ground truth público a 15 minutos (UTEFING está restringido por formulario).
- El modelo se entrenó sobre AMPDS2 (Canadá); su generalización a otras geografías y hábitos de consumo no está validada.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de falsos positivos en la detección de bloques ON, especialmente en la secadora.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- El repositorio figura con 0 descargas y 0 likes, y el tamaño reportado es de 0,0 GB, lo que sugiere poca validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hf-amitkumawat/nilm-heavy-15min
- Dataset de entrenamiento: https://huggingface.co/datasets/hf-amitkumawat/ampds2-coarse-heavy-nilm
- AMPDS2 (Harvard Dataverse): https://doi.org/10.7910/DVN/FIE0S4
- Zhao et al., Applied Energy 262, 2020: https://doi.org/10.1016/j.apenergy.2020.114949
- Mariño et al., IEEE GTD-LA 2024: https://doi.org/10.1109/GTDLA61236.2024.10913528
- ML Intern (herramienta de construcción): https://hf.co/chat?mode=ml-intern
