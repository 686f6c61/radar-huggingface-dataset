# PARADOXAIlabs/pwm-w-weather-v0.8-cpcb

## Resumen

PWM-W Weather v0.8 es un modelo de predicción meteorológica espacio-temporal de muy pequeña escala (985.853 parámetros) desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model. Su tarea concreta es el pronóstico a 24 horas de tres variables meteorológicas (temperatura, humedad y viento) sobre estaciones de la India, combinando datos de la red CPCB/DPCC de Delhi (25 estaciones) con estaciones sinópticas WMO del conjunto NOAA ISD. Se publica como pesos PyTorch (`.pt`) con licencia Apache-2.0 y pipeline declarado `time-series-forecasting`.

El modelo no es un LLM ni un transformer generativo de propósito general: es un predictor numérico especializado, entrenado el 8 de noviembre de 2026 en Kaggle y publicado el 17 de noviembre de 2026. La versión 0.8 introduce un encoder de 14 días y promediado de pesos respecto a la versión anterior (v0.6), y reporta una validación de 0,4678, descrita por el autor como «6,4 sigma mejor que P0», con empate en tres pérdidas frente a los modelos fundacionales de referencia y un rendimiento aún inferior en la variable viento.

Su relevancia es acotada pero clara: demuestra que un modelo de menos de un millón de parámetros puede aproximarse a baselines fundacionales en pronóstico local de corto plazo, lo que lo hace viable en entornos con recursos mínimos (CPU, dispositivos embebidos) y en escenarios de investigación sobre modelado del mundo («world models») a pequeña escala. No obstante, la información pública es escasa y el modelo no incluye datos de entrenamiento ni benchmarks estándar comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (predictor espacio-temporal; código en repositorio GitHub del autor) |
| Parametros totales | 985.853 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (encoder de 14 días según la model card) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch, `torch.load` con `weights_only=False`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que se trata de un modelo espacio-temporal de la familia PWM-W y que el código de la arquitectura de esta versión reside en el repositorio GitHub `paradoxailab/paradox-world-model`, rama `delhi-v0.8`. La configuración exacta de entrenamiento se almacena dentro del propio fichero de pesos en la clave `ck['cfg']`, pero no se reproduce en la documentación pública. El cambio principal de la versión 0.8 respecto a la 0.6 es la incorporación de un encoder de 14 días y promediado de pesos (weight averaging), lo que sugiere una ventana de entrada de dos semanas de observaciones meteorológicas para producir el pronóstico de 24 horas.

Los datos de entrenamiento no se distribuyen con el modelo. Según la model card, provienen de la meteorología de estaciones CPCB/DPCC de Delhi (25 estaciones) y de estaciones sinópticas WMO de la India (NOAA ISD); las fuentes y términos se documentan en `DATA_SOURCES.md` del repositorio. No se especifica el número de tokens, la composición exacta del dataset, ni si se emplearon técnicas de ajuste tipo RLHF/DPO (poco probables en un modelo de pronóstico numérico). El entrenamiento se realizó el 8 de noviembre de 2026 en un notebook de Kaggle (`pwm-weather-v08-cpcb`).

## Capacidades

- Pronóstico a 24 horas de temperatura, humedad y viento sobre estaciones meteorológicas de la India.
- Modelado espacio-temporal: aprovecha la correlación entre estaciones (25 estaciones CPCB/DPCC en Delhi más estaciones sinópticas WMO).
- Entrada con ventana de 14 días (encoder de 14 días introducido en esta versión).
- Inferencia en CPU: el checkpoint pesa 4.172.677 bytes (~4 MB) y se carga con `torch.load(..., map_location="cpu")`.
- Metadatos y resultados embebidos en el checkpoint (`ck["meta"]`, `ck["results"]`), lo que facilita la trazabilidad de la ejecución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo numérico especializado, no un modelo de lenguaje.

## Casos de uso

- Pronóstico local de corto plazo en zonas urbanas de la India: el modelo produce las próximas 24 horas de temperatura, humedad y viento a partir de 14 días de observaciones de estaciones CPCB/DPCC, útil para alertas tempranas de confort térmico o gestión de demanda eléctrica.
- Despliegue en dispositivos de borde: con menos de un millón de parámetros y un checkpoint de ~4 MB, puede ejecutarse en CPU en estaciones meteorológicas o gateways IoT sin GPU.
- Investigación en modelado del mundo a pequeña escala: sirve como baseline ligero para estudiar cómo escalan las arquitecturas espacio-temporales con presupuestos de parámetros mínimos.
- Relleno e interpolación de series meteorológicas: el encoder de 14 días y el modelado entre estaciones permiten estimar valores faltantes en estaciones con sensores degradados.
- Prototipado rápido en pipelines de ciencia de datos: al cargarse con `huggingface_hub` y `torch.load`, se integra en notebooks y scripts de validación sin infraestructura adicional.
- Comparación de baselines en investigación climática regional: su resultado de validación (0,4678) y su empate en tres pérdidas frente a modelos fundacionales lo hacen útil como referencia de bajo coste en estudios comparativos.

## Benchmarks y rendimiento

La model card reporta un único resultado de validación: **0,4678**, descrito como «6,4 sigma mejor que P0», con empate en tres pérdidas frente a los modelos fundacionales de referencia y peor rendimiento en la variable viento. No se especifica la métrica exacta (¿RMSE? ¿MAE normalizado?), ni se aportan tablas por variable, ni comparaciones numéricas con MMLU, HumanEval, GSM8K u otros benchmarks estándar (no aplicables a este tipo de modelo).

| Metrica | Valor | Notas |
|---|---|---|
| Validación (global) | 0,4678 | Métrica no especificada en la model card |
| Mejora vs P0 | 6,4 sigma | Según el autor |
| Comparación con modelos fundacionales | Empate en 3 pérdidas; peor en viento | Sin cifras detalladas |
| Benchmarks estándar (MMLU, HumanEval, GSM8K) | no disponible | No aplicables a un modelo numérico |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa ~4 MB y el modelo tiene 985.853 parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de memoria (GTX 1050, RTX 3050, RTX 4090, A100, H100) es suficiente. En la práctica, la CPU es la opción natural.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en Raspberry Pi y dispositivos embebidos con PyTorch.
- Opciones de despliegue: PyTorch nativo (`torch.load`), `huggingface_hub` para descarga; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W Weather v0.8 (este) | 985.853 | Encoder de 14 días (no especificado en tokens) | Pronóstico 24 h temp./humedad/viento, India | Apache-2.0 | Hugging Face, pesos `.pt` |
| PWM-W Weather v0.6 | no disponible | no disponible | Pronóstico meteorológico, India | Apache-2.0 | Hugging Face |
| PWM-X (v0.9) | no disponible | no disponible | Modelo de la misma serie Paradox World Model | Apache-2.0 (presumible, no confirmado) | Hugging Face |
| Modelos fundacionales de referencia | no disponible | no disponible | Pronóstico meteorológico | no disponible | no disponible |

No se dispone de datos numéricos de los modelos fundacionales citados por el autor (sin nombres ni parámetros), por lo que la comparación cuantitativa no es posible con la información disponible. La serie Paradox World Model incluye 56 modelos publicados (numeración 01–59), de los cuales este es el número 28 de la serie y el 27 publicado.

## Limitaciones y advertencias

- Cobertura geográfica restringida: entrenado con estaciones de Delhi (CPCB/DPCC) y estaciones sinópticas WMO de la India; no se garantiza su validez fuera de esa región.
- Variable viento con rendimiento inferior: la propia model card reconoce que «wind still trails» respecto a los modelos fundacionales.
- Métrica de validación no especificada: el valor 0,4678 no indica qué métrica es, lo que dificulta la comparación rigurosa con otros trabajos.
- Sin datos de entrenamiento publicados: no se pueden auditar sesgos de muestreo, cobertura temporal ni calidad de las observaciones.
- Riesgo de alucinación en sentido amplio: como modelo numérico, puede producir pronósticos plausibles pero incorrectos en regímenes meteorológicos no vistos (eventos extremos, estaciones poco representadas).
- Documentación escasa: no se detalla arquitectura, hiperparámetros, ni el número de tokens de entrenamiento; el código debe consultarse en el repositorio GitHub del autor.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; verificar los términos de las fuentes de datos (CPCB/DPCC, NOAA ISD) si se redistribuyen derivados.
- Sin benchmarks estándar: no hay resultados en MMLU, HumanEval ni GSM8K (no aplicables), ni comparaciones numéricas con baselines publicados.
- Advertencia de producción: al ser un modelo de 0,98 M de parámetros con validación única, no debe usarse como única fuente para decisiones críticas sin validación local adicional.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.8-cpcb
- Repositorio GitHub (rama de esta versión): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.8/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (v0.6): https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.6-cpcb
- Modelo siguiente (PWM-X v0.9): https://huggingface.co/PARADOXAIlabs/pwm-x-cpcb
- Serie completa en Hugging Face: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
