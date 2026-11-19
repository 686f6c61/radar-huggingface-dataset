# paradoxailab/pwm-w-weather-v0.8-cpcb

## Resumen

PWM-W Weather v0.8 es un modelo de predicción meteorológica espacio-temporal a corto plazo desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. El modelo resuelve una tarea acotada: predecir las próximas 24 horas de temperatura, humedad y viento a partir de datos de estaciones meteorológicas. Con 985.853 parámetros, es un modelo extremadamente compacto orientado a series temporales, no un modelo de lenguaje, y se distribuye como un checkpoint de PyTorch (`state_dict`) junto con metadatos y registros de entrenamiento.

La relevancia de esta versión radica en su enfoque metodológico más que en su escala: emplea un encoder de 14 días y promediado de pesos (weight averaging), y reporta una validación de 0,4678, descrita por el autor como 6,4 sigma mejor que la línea base P0. El modelo se entrena con meteorología de estaciones CPCB/DPCC de Delhi (25 estaciones) y estaciones sinópticas WMO de la India (NOAA ISD).

Se trata de un artefacto de investigación con licencia Apache-2.0, sin benchmarks públicos independientes ni datos de rendimiento verificables más allá de la métrica de validación registrada por el autor. Su interés principal es para quienes trabajan en forecasting espacio-temporal de bajo coste computacional y quieran reproducir o auditar la metodología de la serie PWM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de forecasting espacio-temporal; código en repositorio GitHub del autor) |
| Parametros totales | 985.853 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada de 14 días según encoder) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch de precisión nativa) |
| Idiomas soportados | no aplica (modelo de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict dentro de un diccionario con `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna; indica únicamente que el código de arquitectura está en el repositorio GitHub del proyecto y que la configuración de entrenamiento se almacena en el propio checkpoint bajo la clave `ck['cfg']`. Por los tags (`spatiotemporal`, `forecasting`, `time-series-forecasting`) y el tamaño (985.853 parámetros), se trata de una red neuronal compacta para predicción de series espacio-temporales sobre estaciones meteorológicas, no de un transformer de lenguaje.

En cuanto al entrenamiento, la versión 0.8 introduce dos cambios respecto a la anterior: un encoder de 14 días y promediado de pesos. Los datos provienen de meteorología de estaciones CPCB/DPCC de Delhi (25 estaciones) y de estaciones sinópticas WMO en la India (NOAA ISD). El entrenamiento se realizó el 2026-11-08 en Kaggle (run `pwm-weather-v08-cpcb`). No se especifican el número de tokens, la composición exacta del dataset ni si hubo ajuste por refuerzo; los datos de entrenamiento no se incluyen y sus fuentes y términos se remiten a `DATA_SOURCES.md`.

## Capacidades

- Predicción de las próximas 24 horas de temperatura, humedad y viento.
- Modelado espacio-temporal sobre múltiples estaciones (25 estaciones CPCB/DPCC de Delhi y estaciones sinópticas WMO de la India).
- Entrada con ventana de contexto de 14 días (encoder de 14 días).
- Promediado de pesos como técnica de estabilización del entrenamiento.
- Registro de resultados y logs de ejecución embebidos en el checkpoint (`ck['results']`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de series temporales, no un LLM.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción meteorológica local a 24 horas: el modelo estima temperatura, humedad y viento para las estaciones de Delhi, adecuado para prototipos de nowcasting de bajo coste computacional.
- Investigación en forecasting espacio-temporal: sirve como referencia reproducible (checkpoint, configuración y logs incluidos) para comparar arquitecturas compactas frente a líneas base.
- Auditoría y reproducción de metodología: al incluir `ck['cfg']`, `ck['results']` y logs, permite reproducir el entrenamiento y verificar la métrica de validación reportada.
- Integración en pipelines de datos meteorológicos: al ser un checkpoint PyTorch de ~4 MB, se puede cargar en CPU y ejecutar en entornos con recursos mínimos.
- Docencia y experimentación: su tamaño (menos de un millón de parámetros) lo hace apto para estudiar técnicas de encoder temporal y weight averaging en series reales.
- Evaluación comparativa de modelos PWM: forma parte de una serie de 56 modelos, lo que permite comparar versiones y familias dentro del mismo marco experimental.
- Prototipado de alertas tempranas: como componente de un sistema mayor que combine predicciones de temperatura, humedad y viento para estaciones concretas.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Validación | 0,4678 | Métrica registrada por el autor; 6,4 sigma mejor que la línea base P0 |
| Comparación con modelos fundacionales | empate en tres pérdidas | Según el autor, tres pérdidas pasaron a empate |
| Viento | por detrás | El autor indica que el viento sigue por detrás |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de modelo. La única métrica disponible es la de validación registrada por el autor, sin desglose público verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 985.853 parámetros y un checkpoint de 4,17 MB, cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente, y la inferencia en CPU es viable.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.8 | 985.853 | ventana de 14 días (encoder) | Forecasting 24 h temp./humedad/viento | Apache-2.0 | Hugging Face + GitHub |
| PWM-W Weather v0.6 | no disponible | no disponible | Forecasting meteorológico | Apache-2.0 | Hugging Face |
| PWM-X (v0.9) | no disponible | no disponible | Serie PWM (modelo #29) | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables con modelos externos a la serie; la comparación se limita a versiones previas y posteriores del mismo proyecto.

## Limitaciones y advertencias

- Modelo de investigación con métricas reportadas por el autor y sin validación independiente.
- El autor reconoce que el rendimiento en viento sigue por detrás del resto de variables.
- Cobertura geográfica limitada: Delhi (25 estaciones CPCB/DPCC) y estaciones sinópticas WMO de la India; no hay evidencia de generalización a otras regiones.
- No se incluyen los datos de entrenamiento; la reproducibilidad depende de las fuentes externas referenciadas en `DATA_SOURCES.md`.
- La arquitectura no está descrita en la model card; hay que consultar el repositorio GitHub para conocerla.
- Riesgo de sobreajuste a las estaciones y al periodo de entrenamiento; sin benchmarks públicos no se puede evaluar la robustez fuera de muestra.
- Licencia Apache-2.0 permite uso comercial, pero al ser un modelo de investigación sin garantías, conviene validarlo antes de cualquier despliegue en producción.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni tareas generativas.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-w-weather-v0.8-cpcb
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (branch delhi-v0.8): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.8/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión anterior (#26 PWM-W Weather v0.6): https://huggingface.co/paradoxailab/pwm-w-weather-v0.6-cpcb
- Versión siguiente (#29 PWM-X v0.9): https://huggingface.co/paradoxailab/pwm-x-cpcb
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
