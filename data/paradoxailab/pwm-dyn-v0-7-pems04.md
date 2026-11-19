# paradoxailab/pwm-dyn-v0.7-pems04

## Resumen

PWM-Dyn v0.7 (variante pems04) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab, enmarcado en su familia "Paradox World Model" (PWM). Se trata del modelo número 14 de una serie de 56 publicados, y su tarea concreta es predecir los próximos 12 pasos de tráfico en condiciones de fallo de sensores (sensor outages). El modelo se ha entrenado y evaluado sobre el conjunto de datos PEMS04 del distrito 4 de Caltrans (área de la bahía de San Francisco), que cubre 307 sensores durante enero y febrero de 2018.

Con solo 334.628 parámetros, es un modelo extremadamente compacto orientado a un dominio muy específico: la predicción espacio-temporal de tráfico con robustez ante caídas de sensores. La versión v0.7 introduce "fallback base + outage training", una estrategia que reduce el error en escenarios de caída real de sensores entre un 11% y un 22% respecto a v0.6 en cinco redes, a costa de un ligero empeoramiento del error en condiciones limpias (entre un 0,4% y un 1,8%).

El modelo se distribuye como un checkpoint de PyTorch (`.pt`) que incluye pesos, configuración de entrenamiento y metadatos de la ejecución. Está publicado bajo licencia Apache-2.0 y su código de arquitectura reside en un repositorio de GitHub independiente. Es relevante para equipos que necesiten un baseline ligero y reproducible de forecasting de tráfico tolerante a fallos, más que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del autor) |
| Parametros totales | 334.628 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de predicción: 12 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint `.pt` (state dict en `ck["weights"]`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna; indica que el código de la versión está en el repositorio de GitHub `paradoxailab/paradox-world-model` y que la configuración de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. Por los tags (`spatiotemporal`, `traffic-forecasting`, `pwm-dyn`) y el dominio de aplicación, se trata de un modelo espacio-temporal para grafos de sensores, pero no se especifica en la información disponible si emplea atención, convoluciones de grafo, SSM o una combinación.

Los datos de entrenamiento corresponden a PEMS04 (Caltrans PeMS District 4, 307 sensores, enero-febrero de 2018). El entrenamiento se realizó el 4 de noviembre de 2026 en un notebook de Kaggle (commit `b0f6a08`), y la versión se publicó el 17 de noviembre de 2026. La innovación declarada de v0.7 es la combinación de "fallback base" con entrenamiento específico para caídas de sensores, que según el autor reduce el error en escenarios de outage real entre un 11% y un 22% frente a v0.6 en cinco redes, con un coste en condiciones limpias de entre +0,4% y +1,8%. No se documentan en la información disponible detalles sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Predicción de los próximos 12 pasos de tráfico sobre la red de 307 sensores de PEMS04.
- Robustez ante fallos de sensores (sensor outages): entrenado explícitamente para mantener precisión cuando faltan lecturas.
- Forecasting espacio-temporal: modela dependencias entre sensores de la red, no solo series individuales.
- Resultados reproducibles: el checkpoint incluye metadatos, configuración y registros de la ejecución (`ck['meta']`, `ck['cfg']`, `ck['results']`).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, visión ni audio.
- Empaquetado como ensemble de 3 semillas; este archivo corresponde a la semilla 200.

## Casos de uso

- Predicción de tráfico en tiempo real con sensores intermitentes: el modelo está entrenado para escenarios de outage, por lo que puede generar predicciones a 12 pasos incluso cuando parte de los sensores de la red no reportan, algo habitual en despliegues reales de PeMS.
- Baseline de investigación en forecasting espacio-temporal: con 334.628 parámetros sirve como referencia ligera y reproducible para comparar arquitecturas más complejas sobre PEMS04.
- Relleno de huecos en series de tráfico: dado que tolera lecturas ausentes, puede usarse para imputar o suavizar series antes de alimentar sistemas de gestión de tráfico.
- Sistemas de alerta temprana de congestión: la predicción a 12 pasos permite anticipar episodios de congestión en corredores concretos y activar avisos o rutas alternativas.
- Evaluación de robustez de pipelines de datos: útil para probar cómo se comporta un sistema de monitorización cuando fallan sensores, usando el modelo como referencia de error esperado.
- Prototipado en entornos con recursos limitados: su tamaño (menos de 1,4 MB de checkpoint) permite ejecutarlo en CPU o en dispositivos edge para demos y pruebas de concepto.

## Benchmarks y rendimiento

Resultados registrados por el autor en ParadoxBench-1.2 (ensemble de 3 semillas; este archivo es la semilla 200):

| Metrica | Valor |
|---|---|
| MAE en condiciones limpias (clean) | 18,53 |
| MAE con outages reales (Track G) | 21,05 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican; no hay tablas frente a baselines de forecasting).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1.374.337 bytes y el modelo tiene 334.628 parámetros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o incluso CPU es viable.
- Cabe en GPU consumer: sí, en todas las gamas actuales (y en CPU).
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `hf_hub_download`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de forecasting de tráfico (por ejemplo, STGCN, Graph WaveNet, DCRNN o similares), ni datos de rendimiento de alternativas sobre PEMS04 que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre PEMS04 (307 sensores, SF Bay Area, enero-febrero de 2018); no se garantiza su generalización a otras redes o periodos sin reentrenamiento.
- Horizonte limitado: solo predice 12 pasos; no está diseñado para horizontes más largos.
- Ligero empeoramiento en condiciones limpias respecto a v0.6 (+0,4% a +1,8% de error), como coste del entrenamiento para outages.
- Los resultados son los registrados por el autor en su propio benchmark (ParadoxBench-1.2); no hay validación independiente en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.
- No es un modelo de lenguaje: no debe esperarse razonamiento, generación de texto ni capacidades conversacionales.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos de las fuentes de datos (PEMS04, Caltrans) recogidos en `DATA_SOURCES.md` del repositorio.
- La carga requiere `weights_only=False` en `torch.load`, lo que implica confiar en el origen del checkpoint; verificar el SHA-256 publicado antes de cargarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems04
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentación v0.7 realworld: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#13): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems08
- Modelo siguiente (#15): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems03
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
