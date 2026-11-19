# paradoxailab/pwm-dyn-v0.7-pems08

## Resumen

PWM-Dyn v0.7 (variante PEMS08) es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model. Se trata del modelo número 13 de los 56 publicados en la serie y está especializado en una tarea muy concreta: predecir los siguientes 12 pasos de tráfico en la red de sensores PEMS08 (Distrito 8 de Caltrans en San Bernardino, 170 sensores, datos de julio a agosto de 2016), incluyendo condiciones de caída parcial de sensores (outages).

A diferencia de los modelos de lenguaje, es un modelo neuronal de pequeño tamaño (317.092 parámetros) entrenado específicamente para forecasting. Su relevancia radica en el enfoque de robustez ante fallos de sensores: la versión v0.7 introduce entrenamiento con caídas reales y un mecanismo de fallback, lo que según el autor reduce el error en escenarios de outage real entre un 11% y un 22% respecto a v0.6 en cinco redes, con un coste de entre 0,4% y 1,8% en condiciones limpias.

El modelo se distribuye como un checkpoint de PyTorch (`.pt`) con pesos, configuración y resultados embebidos, y está publicado bajo licencia Apache-2.0. No incluye los datos de entrenamiento, solo la referencia a sus fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuronal de forecasting espaciotemporal; el código está en el repositorio GitHub del autor) |
| Parametros totales | 317.092 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción: 12 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con state dict, `meta`, `cfg` y `results`) |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna más allá de que se trata de un modelo neuronal de forecasting espaciotemporal orientado a tráfico. El checkpoint almacena la configuración de entrenamiento en `ck['cfg']` y el código de la arquitectura está en el repositorio GitHub del proyecto (`paradoxailab/paradox-world-model`). El modelo tiene 317.092 parámetros, lo que lo sitúa en el rango de modelos ligeros desplegables en CPU.

El entrenamiento se realizó el 4 de noviembre de 2026 en un notebook de Kaggle (versión 365414722, commit b0f6a08), y el modelo se publicó el 17 de noviembre de 2026. Los datos de entrenamiento corresponden a PEMS08 (170 sensores, julio-agosto de 2016). La innovación principal de la versión v0.7 es la incorporación de entrenamiento con caídas reales de sensores y un mecanismo de fallback base, que mejora la robustez frente a outages. El resultado reportado se obtiene con un ensemble de 3 semillas; este archivo concreto corresponde a la semilla 200. No se especifican el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Predicción de los próximos 12 pasos de tráfico en la red PEMS08.
- Forecasting espaciotemporal sobre grafos de sensores (170 nodos).
- Robustez ante caídas parciales de sensores (outages reales, Track G de ParadoxBench-1.2).
- Mecanismo de fallback base para escenarios con datos incompletos.
- Evaluación en condiciones limpias (clean) y con outages reales.
- Modelo numérico: no soporta tool calling, agentes, multilingüismo ni modalidades de texto, visión o audio.

## Casos de uso

- Predicción de tráfico en tiempo real para gestión de autopistas: el modelo genera los 12 pasos siguientes a partir del estado actual de la red de 170 sensores, adecuado para paneles de control de operadores viarios.
- Tolerancia a fallos de sensores en producción: al estar entrenado con outages reales y disponer de fallback, puede mantener predicciones útiles cuando parte de los sensores dejan de reportar, evitando caídas del sistema de forecasting.
- Alimentación de sistemas de enrutamiento dinámico: las predicciones a corto plazo (12 pasos) pueden integrarse en motores de rutas que ajustan recomendaciones según congestión prevista.
- Investigación en modelos espaciotemporales: su tamaño reducido (317k parámetros) y su checkpoint autocontenido lo hacen útil como baseline reproducible para comparar arquitecturas en PEMS08.
- Simulación y planificación de incidentes: permite estimar el impacto de cortes de carril o cierres evaluando la evolución del tráfico bajo distintos escenarios de entrada.
- Despliegue en entornos con recursos limitados: al ser un modelo ligero en formato PyTorch, puede ejecutarse en CPU o en GPUs modestas dentro de sistemas embebidos de gestión de tráfico.
- Evaluación comparativa de robustez: sirve para estudiar la degradación de modelos de forecasting bajo sensores caídos, gracias a sus métricas separadas clean y outage.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ParadoxBench-1.2 (test, clean) | MAE | 14,22 |
| ParadoxBench-1.2 (Track G, outages reales) | MAE | 18,09 |
| Comparación con v0.6 (cinco redes) | Error en outages reales | reducción del 11% al 22% |
| Comparación con v0.6 (clean) | Error | aumento del 0,4% al 1,8% |

Los resultados corresponden a un ensemble de 3 semillas; el archivo publicado es la semilla 200. No se han publicado en la información disponible resultados frente a otros modelos externos (por ejemplo, STGCN, DCRNN o Graph WaveNet) en PEMS08.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (317.092 parámetros; el checkpoint ocupa 1.304.641 bytes).
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Funciona correctamente en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de borde.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y el código del repositorio GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 (PEMS08) | 317.092 | 12 pasos | Traffic forecasting PEMS08 con outages | Apache-2.0 | Hugging Face + GitHub |
| PWM-Dyn v0.6 (PEMS-Bay) | no disponible | no disponible | Traffic forecasting PEMS-Bay | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.7 (PEMS04) | no disponible | no disponible | Traffic forecasting PEMS04 | Apache-2.0 | Hugging Face |
| Otros modelos de referencia (STGCN, DCRNN, Graph WaveNet) | no disponible | no disponible | Traffic forecasting | variable | papers/repos académicos |

La comparación con modelos académicos de referencia no está respaldada por datos publicados en la información disponible; solo se documenta la comparación interna con v0.6.

## Limitaciones y advertencias

- Modelo específico para PEMS08: no es transferible directamente a otras redes sin reentrenamiento.
- Horizonte limitado a 12 pasos; no apto para predicciones de largo plazo.
- El resultado reportado es de un ensemble de 3 semillas; el archivo individual (semilla 200) puede presentar variabilidad respecto a la media del ensemble.
- No incluye datos de entrenamiento; solo se referencian sus fuentes y términos en `DATA_SOURCES.md`.
- No se documentan sesgos, pero al entrenarse con datos de 2016 de una región concreta (San Bernardino) puede no reflejar patrones de tráfico actuales o de otras geografías.
- Riesgo de degradación si los patrones de outage en producción difieren de los vistos en entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos de las fuentes de datos originales (Caltrans PeMS) para despliegues productivos.
- No es un modelo de lenguaje: no soporta texto, visión, audio ni instrucciones en lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems08
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentación v0.7: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#12): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems-bay
- Modelo siguiente (#14): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems04
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
