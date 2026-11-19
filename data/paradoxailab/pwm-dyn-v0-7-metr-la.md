# paradoxailab/pwm-dyn-v0.7-metr-la

## Resumen

PWM-Dyn v0.7 METR-LA es un modelo de predicción de series temporales espacio-temporales desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model. Se trata del modelo número 17 de 56 publicados (la serie cubre los números 01 a 59) y está especializado en una tarea muy concreta: predecir los próximos 12 pasos de tráfico en la red de sensores de la autopista de Los Ángeles (METR-LA, 207 detectores de bucle), incluyendo escenarios con caídas reales de sensores.

El modelo es extremadamente compacto: 321.828 parámetros, lo que lo sitúa en la categoría de modelos ligeros diseñados para despliegue en entornos con recursos limitados. No es un modelo de lenguaje ni un transformer generativo de propósito general, sino un modelo dinámico especializado en forecasting espacio-temporal, empaquetado como un checkpoint de PyTorch (`.pt`) con pesos, configuración y metadatos de resultados embebidos.

Su relevancia radica en el enfoque en robustez ante fallos de sensores (outages), un problema práctico habitual en redes de tráfico reales. Según la model card, la versión v0.7 introduce entrenamiento con outages reales y reduce el error entre un 11 % y un 22 % frente a v0.6 en cinco redes, con un coste de solo un 0,4–1,8 % en el escenario limpio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo dinámico espacio-temporal; código en repositorio GitHub) |
| Parametros totales | 321.828 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`, `torch.save` con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de describirla como un modelo dinámico de la familia PWM-Dyn orientado a forecasting espacio-temporal. El código de arquitectura está disponible en el repositorio GitHub del proyecto y la configuración exacta de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. El modelo opera sobre la red METR-LA, compuesta por 207 sensores de bucle en las autopistas de Los Ángeles, y su tarea es predecir los 12 pasos siguientes.

El entrenamiento se realizó el 4 de noviembre de 2026 mediante un notebook de Kaggle (versión 365414722, commit b0f6a08). La innovación principal de esta versión es la incorporación de entrenamiento con outages reales junto con una base de fallback, lo que mejora la robustez ante la pérdida de sensores. Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y términos se documentan en `DATA_SOURCES.md`. No se especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de los próximos 12 pasos temporales de tráfico sobre la red METR-LA (207 sensores).
- Forecasting espacio-temporal multivariante con dependencias entre sensores.
- Robustez ante caídas de sensores (sensor outages), incluyendo escenarios reales del Track G de ParadoxBench-1.2.
- Modo ensemble: el archivo publicado corresponde a la semilla 200 de un ensemble de 3 semillas.
- Empaquetado autocontenido: el checkpoint incluye metadatos, pesos, configuración y registros de resultados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Predicción de tráfico en tiempo real en autopistas: el modelo genera los 12 pasos siguientes a partir del estado actual de los 207 sensores de METR-LA, adecuado para sistemas de gestión de tráfico y paneles de control.
- Tolerancia a fallos de sensores: al estar entrenado con outages reales, puede mantener predicciones útiles cuando parte de los detectores dejan de reportar, reduciendo la necesidad de imputación manual.
- Enrutamiento y estimación de tiempos de llegada: las predicciones a corto plazo alimentan motores de rutas que ajustan ETA según la evolución prevista del tráfico.
- Investigación en modelos mundo: sirve como componente dinámico dentro de la serie Paradox World Model para experimentos de simulación y planificación.
- Benchmarking reproducible: al incluir configuración y resultados en el propio archivo, permite reproducir y comparar contra ParadoxBench-1.2.
- Despliegue en entornos edge: con 321.828 parámetros y un archivo de 1,3 MB, cabe en dispositivos con recursos muy limitados (Raspberry Pi, microcontroladores con PyTorch, CPUs sin GPU).
- Detección de anomalías en la red viaria: desviaciones entre predicción y observación pueden señalar incidentes o fallos de sensor.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ParadoxBench-1.2 (test, limpio) | MAE | 2.918 |
| ParadoxBench-1.2 (Track G, outages reales) | MAE | 3.147 |

Resultados reportados con un ensemble de 3 semillas; el archivo publicado corresponde a la semilla 200. No se han publicado en la información disponible resultados comparativos con otros modelos externos (MMLU, HumanEval, GSM8K no aplican a este dominio).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1.322.226 bytes (1,3 MB) y el modelo tiene 321.828 parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100, H100 ni RTX 4090. Una GPU integrada o incluso CPU es suficiente.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) y en dispositivos edge.
- Opciones de despliegue: PyTorch nativo (`torch.load` con `weights_only=False`), exportación a TorchScript u ONNX no documentada pero viable por el tamaño; vLLM, llama.cpp, Ollama y TGI no aplican (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de forecasting espacio-temporal (por ejemplo, STGCN, Graph WaveNet, DCRNN o MTGNN), ni datos de rendimiento de alternativas en ParadoxBench-1.2. La única comparación interna es con PWM-Dyn v0.6, que según la model card empeora entre un 11 % y un 22 % en error con outages reales en cinco redes.

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice tráfico en la red METR-LA; no es transferible sin reentrenamiento a otras ciudades o dominios.
- Horizonte limitado a 12 pasos; no se especifica la resolución temporal (posiblemente 5 minutos por paso, pero no confirmado en la información).
- Sin datos de sesgo publicados; al operar sobre sensores físicos, puede heredar sesgos de cobertura de la red (zonas con menos detectores).
- Riesgo de degradación fuera de distribución si cambia la topología de sensores o las condiciones de tráfico respecto al periodo de entrenamiento.
- Los datos de entrenamiento no se distribuyen; la reproducibilidad completa depende de las fuentes externas documentadas en `DATA_SOURCES.md`.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar según `CITATION.cff`.
- El archivo requiere `weights_only=False` en `torch.load`, lo que implica confiar en el origen del checkpoint (riesgo de deserialización).
- Sin métricas de calibración, intervalos de confianza ni evaluación de drift temporal en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.7-metr-la
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README v0.7: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#16): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems07
- Modelo siguiente (#18): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems-bay
- Todos los modelos: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
