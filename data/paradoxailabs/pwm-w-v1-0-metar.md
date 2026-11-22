# PARADOXAIlabs/pwm-w-v1.0-metar

## Resumen

PWM-W v1.0 (identificador `pwm-w-v1.0-metar`) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, concretamente la entrega número 32 (modelo 30 de 56 publicados). Su tarea es la previsión de las próximas 24 horas de temperatura, humedad y viento a partir de informes METAR de seis aeropuertos de la India, incluido Delhi Palam. No es un modelo de lenguaje: es un modelo pequeño y especializado de forecasting espacio-temporal.

El modelo tiene 1.260.997 parámetros (aproximadamente 1,26 millones) y se distribuye como un único checkpoint de PyTorch de 5.184.207 bytes. Se entrenó el 9 de noviembre de 2026 en una ejecución de Kaggle (`pwm-v10`) y se publicó el 17 de noviembre de 2026 bajo licencia Apache-2.0. La model card no registra ningún resultado de evaluación para esta versión.

Su relevancia es acotada pero concreta: ofrece un artefacto reproducible (con configuración y pesos embebidos en el propio `.pt`) para experimentar con predicción meteorológica a corto plazo sobre datos METAR, un dominio donde los modelos públicos de pronóstico numérico son mucho más pesados. La ausencia de métricas publicadas obliga a validarlo por cuenta propia antes de cualquier uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en el repositorio GitHub del autor; configuración en `ck['cfg']`) |
| Parametros totales | 1.260.997 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch nativo, `torch.load`) |
| Idiomas soportados | no aplica (modelo de series temporales, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch `.pt` (`32_pwm-w_v1.0_metar.pt`, 5.184.207 bytes, SHA-256 `627d38db...19c9f5`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que el código está en el repositorio de GitHub del proyecto y que la configuración de entrenamiento se guarda dentro del checkpoint (`ck['cfg']`). El campo `meta` del archivo contiene nombre, tarea, datos, parámetros, resultado y ejecución de origen. No se especifica si se trata de un transformer, una red recurrente, un modelo convolucional espacio-temporal o un ensemble de varias arquitecturas.

El cambio declarado en esta versión es "autocorrección y un ensemble de dos arquitecturas (adoptado solo si es más de 2 sigma mejor)". Esto sugiere un pipeline de selección estadística entre dos candidatos, aunque no se detalla qué arquitecturas componen el ensemble ni cómo se combinan sus predicciones. Los datos de entrenamiento son informes METAR de seis aeropuertos indios; no se indica el número de tokens, el periodo temporal cubierto, la frecuencia de muestreo ni si hubo aumentación de datos. Los datos originales no se distribuyen con el modelo, solo sus fuentes y términos en `DATA_SOURCES.md`.

## Capacidades

- Predicción de las próximas 24 horas de temperatura, humedad y viento a partir de informes METAR.
- Modelado espacio-temporal sobre múltiples estaciones (seis aeropuertos indios), lo que permite explotar correlaciones entre ubicaciones.
- Ensemble interno de dos arquitecturas con criterio de adopción estadístico (>2 sigma).
- Carga sencilla mediante `torch.load` con acceso a pesos (`ck['weights']`), metadatos (`ck['meta']`), resultados (`ck['results']`) y configuración (`ck['cfg']`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo numérico especializado.

## Casos de uso

- Pronóstico operativo de aeródromo: alimentar un sistema de planificación de pistas y operaciones con la previsión a 24 h de temperatura, humedad y viento a partir de los METAR de las seis estaciones de entrenamiento.
- Investigación en forecasting espacio-temporal: servir como baseline ligero (1,26 M de parámetros) para comparar con modelos más grandes en tareas de predicción meteorológica a corto plazo.
- Reproducibilidad de experimentos: al incluir configuración, pesos y registros de ejecución en el propio archivo, permite auditar y repetir el entrenamiento en un entorno controlado.
- Prototipado rápido en entornos con recursos limitados: el checkpoint ocupa unos 5 MB, por lo que se puede cargar y ejecutar en CPU sin infraestructura dedicada.
- Docencia y divulgación: ejemplo didáctico de pipeline completo (datos METAR, ensemble, criterio de selección estadístico) para cursos de series temporales.
- Integración en pipelines de datos meteorológicos: como componente de un sistema mayor que consuma METAR y produzca previsiones a 24 h para agregación o alerta temprana, siempre tras validación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "no result recorded in the delhi-v1.0 README", por lo que no existen métricas de error (MAE, RMSE, etc.) ni comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa aproximadamente 5 MB y el modelo tiene 1,26 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch (por ejemplo, RTX 3060 o superior) es sobrada. También es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual; el cuello de botella no es el modelo sino el preprocesado de datos METAR.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de forecasting METAR o meteorológico a corto plazo, ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- No hay métricas de evaluación publicadas: no es posible afirmar su precisión sin una validación independiente.
- Dominio muy restringido: solo seis aeropuertos de la India y solo las variables temperatura, humedad y viento; no debe extrapolarse a otras regiones o variables sin reentrenamiento.
- El ensemble se adopta con un criterio estadístico (>2 sigma) que no se detalla; se desconoce el tamaño de la muestra de validación y el riesgo de sobreajuste en esa selección.
- La arquitectura no está documentada en la model card; depende del código del repositorio GitHub, lo que introduce un riesgo de reproducibilidad si este cambia.
- Los datos de entrenamiento no se distribuyen; solo se enlazan sus fuentes y términos, lo que limita la auditoría completa del dataset.
- Riesgo de deriva (drift) si se aplica a datos METAR posteriores al periodo de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero al no haber evaluación publicada, cualquier uso en producción debe ir precedido de validación propia y de un análisis de riesgos.
- No es un modelo de lenguaje: no procesa texto libre ni mantiene conversaciones; cualquier expectativa en ese sentido es incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-w-v1.0-metar
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (branch delhi-v1.0): https://github.com/paradoxailab/paradox-world-model/blob/delhi-v1.0/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y términos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#30 PWM-W v0.9 live): https://huggingface.co/PARADOXAIlabs/pwm-w-live-v0.9
- Modelo siguiente (#33 PWM-W v1.0 WMO): https://huggingface.co/PARADOXAIlabs/pwm-w-v1.0-wmo
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
