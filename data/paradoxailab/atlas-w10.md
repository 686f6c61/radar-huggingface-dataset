# paradoxailab/atlas-w10

## Resumen

Atlas W10 es un modelo neuronal de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model. Concretamente, resuelve la predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de medición de calidad del aire en India, combinando datos de 263 estaciones de la red CPCB (14 redes distintas) con variables meteorológicas de ERA5 obtenidas vía Open-Meteo. Forma parte del bloque "Atlas" de la serie y ocupa la posición 52 del catálogo (modelo 49 de 56 publicados).

El modelo tiene 9.909.792 parámetros (aproximadamente 10M, de ahí el sufijo W10) y se distribuye como un checkpoint de PyTorch (`.pt`) de unos 39,7 MB. La model card indica explícitamente que esta versión no fue adoptada ("not adopted") dentro del proceso interno de selección de la serie, con un resultado de validación de 8.773, lo que supone un empeoramiento del 1,02 % respecto a la versión anterior Atlas W1 (1M + weather). Se trata, por tanto, de un artefacto de investigación con valor documental y reproducibilidad más que de un modelo listo para producción.

La relevancia actual del modelo es acotada: su interés principal reside en formar parte de un experimento controlado y públicamente documentado sobre escalado de parámetros en predicción espacio-temporal con variables exógenas meteorológicas, no en ser un sistema de forecasting de referencia. La licencia Apache-2.0 permite reutilización comercial, pero la ausencia de benchmarks públicos y de datos de entrenamiento en el repositorio limita su evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal para forecasting espacio-temporal; código en repositorio GitHub del autor) |
| Parametros totales | 9.909.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción: 24 h) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna; indica únicamente que el código está en el repositorio de GitHub del proyecto y que la configuración de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. Por los tags y el nombre ("spatiotemporal", "Atlas"), se trata de un modelo para predicción espacio-temporal sobre una red de estaciones, con entrada de variables meteorológicas exógenas (ERA5 vía Open-Meteo) además de las series históricas de PM2.5.

Los datos de entrenamiento provienen de dos fuentes: el dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)" (red CPCB, 14 redes y 263 estaciones) y los datos meteorológicos ERA5 de Copernicus C3S servidos por Open-Meteo. El entrenamiento se realizó el 2026-11-16 en un kernel de Kaggle identificado como `atlas-w10-s400`. No se especifican en la información disponible el número de tokens o pasos, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO (poco habituales en este dominio). El resultado de validación registrado es 8.773, un 1,02 % peor que Atlas W1, y la versión se marca como no adoptada, lo que sugiere que el aumento de parámetros de 1M a 10M junto con la incorporación de meteorología no aportó mejora en este experimento.

## Capacidades

- Predicción de las próximas 24 horas de PM2.5 en estaciones de la red CPCB de India.
- Modelado espacio-temporal: incorpora información de múltiples estaciones (263) y de 14 redes distintas.
- Integración de variables exógenas meteorológicas (ERA5) junto con la serie objetivo.
- Forecasting de series temporales numéricas; no genera texto, código ni realiza razonamiento simbólico.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No incluye modo "thinking", visión ni audio.

## Casos de uso

- Investigación sobre escalado de parámetros en forecasting espacio-temporal: el modelo sirve como punto de comparación controlado frente a Atlas W1 (1M) para estudiar si el aumento de capacidad mejora la predicción de PM2.5 con variables meteorológicas; su valor es metodológico y reproducible.
- Reproducción de experimentos: al incluir la configuración (`ck['cfg']`), los resultados (`ck['results']`) y los logs de la ejecución en el propio checkpoint, permite replicar el entrenamiento y auditar el resultado de validación de 8.773.
- Prototipado de sistemas de alerta temprana de contaminación: podría integrarse como componente de un pipeline que estime PM2.5 a 24 h en estaciones indias, siempre que se valide localmente y se acepte que la versión no fue adoptada por el propio autor.
- Docencia y experimentación con modelos pequeños: con ~10M parámetros y 39,7 MB, es ligero para ejecutarse en CPU y adecuado para prácticas sobre forecasting con datos exógenos.
- Estudio de la contribución de la meteorología en la predicción de calidad del aire: al comparar W10 con W1 se puede analizar el efecto de añadir ERA5 en un modelo de mayor tamaño.
- Base para ajuste fino en otras regiones o contaminantes: la licencia Apache-2.0 y el formato PyTorch permiten adaptar el checkpoint a nuevas series espacio-temporales, aunque requerirá trabajo adicional al no publicarse los datos de entrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Resultado de validacion (registrado) | 8.773 |
| Variacion vs Atlas W1 (1M + weather) | +1.02 % (empeora) |
| Estado en la serie | no adoptado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas adicionales como MAE, RMSE o R² por estación. La única cifra disponible es el resultado de validación interno de la serie, sin definición pública de la métrica en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~9,9M parámetros en FP32 el modelo ocupa unos 40 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior, A100, H100) es sobredimensionada para este tamaño.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM; también en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre el `.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Resultado validacion | Licencia | Estado |
|---|---|---|---|---|---|
| Atlas W10 (este modelo) | 9.909.792 | 24 h | 8.773 | Apache-2.0 | no adoptado |
| Atlas W1 | no disponible (1M aprox. por nombre) | 24 h | ~8.684 (inferido de +1.02 %) | Apache-2.0 | no disponible |
| Atlas W10r | no disponible (10M + weather, regularizado) | 24 h | no disponible | Apache-2.0 | no disponible |

No se dispone de información sobre modelos de terceros comparables (por ejemplo, baselines de forecasting de calidad del aire) en la documentación proporcionada. La comparación más directa es interna a la serie Paradox World Model.

## Limitaciones y advertencias

- El propio autor marca la versión como "not adopted": empeora un 1,02 % respecto a Atlas W1, por lo que no es la variante recomendada de la serie.
- No se publican los datos de entrenamiento, solo sus fuentes y términos; la reproducibilidad completa depende de acceder a los datasets originales (Kaggle y Open-Meteo/ERA5).
- La métrica de validación (8.773) no está definida en la información disponible, lo que impide interpretarla o compararla con literatura externa.
- Ámbito geográfico restringido a estaciones de India (red CPCB); el rendimiento fuera de esa región no está validado.
- Riesgo de degradación ante cambios de distribución (nuevas estaciones, cambios en redes de sensores o en regímenes meteorológicos) no evaluado.
- No se documentan sesgos específicos, pero al ser un modelo numérico sobre datos de sensores puede heredar sesgos de cobertura y calidad de la red CPCB.
- Licencia Apache-2.0 permite uso comercial, pero la falta de benchmarks y de adopción interna aconseja no desplegarlo en producción sin validación propia.
- No aplica a tareas de lenguaje, código o razonamiento; su uso fuera del forecasting de series temporales no está soportado.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-w10
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la serie Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie completa: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (Atlas W1): https://huggingface.co/paradoxailab/atlas-w1
- Modelo siguiente (Atlas W10r): https://huggingface.co/paradoxailab/atlas-w10r
- Catálogo de la serie en Hugging Face: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
