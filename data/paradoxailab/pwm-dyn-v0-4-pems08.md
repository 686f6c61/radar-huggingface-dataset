# paradoxailab/pwm-dyn-v0.4-pems08

## Resumen

PWM-Dyn v0.4 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Se trata del primer modelo publicado de una serie de 56 (numerados del 01 al 59) y está especializado en la predicción de los próximos 12 pasos de flujo de tráfico sobre el conjunto de datos PEMS08 (Caltrans PeMS Distrito 8, San Bernardino; 170 sensores, julio-agosto de 2016).

El modelo es extremadamente compacto: 318.148 parámetros, lo que lo sitúa en la categoría de modelos ligeros para forecasting. Se distribuye como un checkpoint de PyTorch (`01_pwm-dyn_v0.4_PEMS08.pt`, 1.299.673 bytes) que contiene el state dict, la configuración de entrenamiento y los resultados registrados. La tarea declarada es la predicción de los 12 pasos siguientes de flujo de tráfico, con un MAE de 14.53 en el test de ParadoxBench-1 Track A (ensemble de 3 semillas; este archivo es la semilla 0).

La relevancia de este modelo radica en su enfoque de "world model" aplicado a dominios físicos (tráfico), su licencia Apache-2.0 permisiva y su tamaño reducido, que permite despliegue en entornos con recursos muy limitados. La versión v0.4 introduce pistas de ParadoxBench-1, calibración split-conformal y una mejora sustancial en la cobertura de lluvia (del 54,7% al 84,7% con cobertura del 80%) respecto a v0.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub; configuración en `ck['cfg']`) |
| Parametros totales | 318.148 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea: predicción de 12 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`) con state dict, `cfg`, `meta` y `results` |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la model card. El código de la arquitectura de esta versión está en el repositorio de GitHub de ParadoxAI Lab, y la configuración de entrenamiento se almacena en el propio archivo bajo la clave `ck['cfg']`. El modelo pertenece a la familia PWM-Dyn ("Paradox World Model - Dynamics"), orientada a forecasting espaciotemporal.

Los datos de entrenamiento corresponden a PEMS08 (Caltrans PeMS Distrito 8, San Bernardino; 170 sensores; julio-agosto de 2016). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y términos están documentados en `DATA_SOURCES.md`. El modelo se entrenó el 2026-11-01 en un notebook de Kaggle (notebook0387a11c3a, versión 364310290) y se publicó el 2026-11-17. La versión v0.4 introduce pistas de ParadoxBench-1 y calibración split-conformal, que mejoran la cobertura de intervalos de predicción en condiciones de lluvia.

## Capacidades

- Predicción de los próximos 12 pasos de flujo de tráfico a partir de datos de sensores.
- Forecasting espaciotemporal sobre grafos de sensores (170 sensores en PEMS08).
- Calibración de intervalos de predicción mediante split-conformal (cobertura de lluvia del 84,7% con nivel nominal del 80%).
- Evaluación estandarizada mediante ParadoxBench-1 Track A (MAE 14,53 en test, ensemble de 3 semillas).
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- No se declaran capacidades de visión, audio ni modos de razonamiento explícito.

## Casos de uso

- Predicción de tráfico a corto plazo en autopistas: el modelo genera los 12 pasos siguientes de flujo a partir del estado actual de los 170 sensores de PEMS08, adecuado para paneles de control de tráfico en tiempo real por su reducido tamaño (318 K parámetros).
- Gestión de incidentes y congestión: al predecir flujo con 12 pasos de antelación, permite a operadores anticipar cuellos de botella y activar protocolos de desvío.
- Planificación de mantenimiento de sensores: la calibración split-conformal permite cuantificar la incertidumbre de las predicciones y detectar sensores con comportamiento anómalo.
- Investigación en world models: sirve como referencia reproducible (checkpoint con `meta`, `cfg` y `results` embebidos) para estudiar forecasting espaciotemporal con modelos ligeros.
- Despliegue en dispositivos de borde: con 318 K parámetros y checkpoint de 1,3 MB, cabe en microcontroladores o GPUs integradas para inferencia local en cabinas de control.
- Evaluación comparativa en ParadoxBench-1: útil como baseline para la serie PWM-Dyn y para comparar técnicas de calibración conformal en dominios físicos.
- Análisis de robustez ante condiciones meteorológicas: la mejora de cobertura en lluvia (54,7% a 84,7%) lo hace apto para estudios de fiabilidad de predicciones bajo clima adverso.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE | 14,53 | Ensemble de 3 semillas; este archivo es semilla 0 |
| Cobertura de lluvia (nominal 80%) | Cobertura empírica | 84,7% | v0.3: 54,7% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (modelo de 318 K parámetros; checkpoint de 1,3 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de forecasting espaciotemporal (por ejemplo, STGCN, Graph WaveNet, DCRNN o modelos de la familia PWM-Dyn), ni datos de rendimiento de alternativas sobre PEMS08 que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo específico de dominio: entrenado exclusivamente sobre PEMS08 (170 sensores, San Bernardino, julio-agosto de 2016); no se garantiza su generalización a otras redes de sensores, regiones o periodos.
- No es un modelo de lenguaje: no soporta texto, código, visión ni tool calling; su uso fuera de forecasting de tráfico no está validado.
- Riesgo de deriva temporal: al entrenarse con datos de 2016, su rendimiento puede degradarse en despliegues con patrones de tráfico actuales.
- Incertidumbre calibrada solo parcialmente: la cobertura conformal se reporta para lluvia (84,7% con nominal 80%); no se documentan garantías para otras condiciones.
- Datos de entrenamiento no incluidos: la reproducibilidad depende de `DATA_SOURCES.md` y del repositorio de GitHub.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda citar según `CITATION.cff` y verificar los términos de las fuentes de datos originales (Caltrans PeMS).
- Sin datos de sesgo, alucinación o limitaciones idiomáticas aplicables (modelo numérico).
- Estado "reported": los resultados provienen del propio autor y no se ha verificado una replicación independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.4-pems08
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- ParadoxBench v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Siguiente modelo de la serie: https://huggingface.co/paradoxailab/pwm-dyn-v0.4-pems04
- Todos los modelos: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio web: https://paradoxailab.com
