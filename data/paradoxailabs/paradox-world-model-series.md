# PARADOXAIlabs/paradox-world-model-series

## Resumen

Paradox World Model Series es una coleccion de 56 modelos de series temporales geoespaciales publicados por PARADOXAIlabs entre las versiones #01 y #59. No se trata de un unico modelo fundacional, sino de un catalogo de predictores especializados por tarea y por region: prevision de flujo de trafico a 12 pasos, prevision de precipitacion en rejilla, prediccion de calidad del aire (PM2.5, PM10, NO2, ozono) y prevision meteorologica a 24 horas de temperatura, humedad y viento en estaciones. El conjunto completo ocupa 508,6 MB, lo que confirma que son modelos de escala muy reducida, no LLM.

La relevancia del proyecto reside en su enfoque de "world model" aplicado a dominios fisicos concretos: cada repositorio incluye pesos, datos de entrenamiento, resultados registrados y un checksum SHA-256, lo que facilita la reproducibilidad y la auditoria. La familia PWM-Dyn cubre trafico (PEMS03, PEMS04, PEMS07, PEMS08, METR-LA, PEMS-BAY), la familia PWM-W cubre meteorologia y calidad del aire, y la familia Atlas se centra en PM2.5 en Delhi. Las versiones avanzan de v0.4 a v1.0 e incorporan mejoras progresivas como robustez ante caidas de sensores (v0.7) o modelos hibridos que corrigen predicciones de Chronos-2 y TimesFM 2.5.

Los tamanos oscilan entre aproximadamente 316.900 y 10.538.577 parametros. La model card no especifica arquitectura interna, contexto, idiomas ni pipeline; se trata de modelos de regresion/forecasting, no de generacion de lenguaje. La licencia es Apache 2.0 en todos los casos, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos de forecasting de series temporales; no se detalla en la model card) |
| Parametros totales | Rango de 316.900 a 10.538.577 segun el modelo de la serie |
| Parametros activos | no aplica (no son modelos MoE) |
| Longitud de contexto | no disponible (horizontes de prediccion: 12 pasos en trafico, 24 h en meteorologia y calidad del aire) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la model card (se mencionan pesos y checksum SHA-256 por repositorio) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de los modelos. Por la naturaleza de las tareas (prediccion de los siguientes 12 pasos de flujo de trafico, de los siguientes dias de precipitacion en rejilla, de las siguientes 24 horas de contaminantes y de variables meteorologicas en estaciones) y por el rango de parametros (cientos de miles a unos 10 millones), se trata de modelos compactos de series temporales, probablemente con componentes espaciales (grafos de estaciones o rejillas) y temporales. La familia PWM-W Delhi v0.2 se describe explicitamente como hibrida: corrige las predicciones de Chronos-2 y TimesFM 2.5 usando el grafo de estaciones, lo que indica un diseno de post-procesado sobre modelos base de forecasting.

Cada repositorio incluye, segun la model card, los pesos, los datos de entrenamiento, los resultados registrados y un checksum SHA-256. No se especifican volumen de tokens, composicion del dataset ni si hubo RLHF o DPO, algo esperable en modelos de forecasting y no de lenguaje. Las versiones sucesivas documentan mejoras incrementales: v0.4.1 sobre v0.4, v0.6 anade PEMS03, PEMS07, METR-LA y PEMS-BAY, v0.7 introduce robustez ante caidas de sensores, y las versiones v0.8, v0.9 y v1.0 amplian parametros y cobertura. El encoder PWM-F v2.0/v2.1 (10.538.577 parametros) se preentrena sobre toda la India como componente de representacion meteorologica; la model card lo marca como "not adopted" en v2.0.

## Capacidades

- Prediccion de los siguientes 12 pasos de flujo de trafico en redes viarias (PEMS03, PEMS04, PEMS07, PEMS08, METR-LA, PEMS-BAY).
- Prediccion de trafico bajo condiciones de caida de sensores (familia PWM-Dyn v0.7 en adelante).
- Prediccion de los siguientes dias de precipitacion en rejilla para regiones de India (IMD central India, IMD west coast).
- Prediccion de las siguientes 24 horas de PM2.5, PM10, NO2 y ozono en estaciones de Delhi (PWM-W Delhi v0.1).
- Correccion hibrida de predicciones de PM2.5 sobre Chronos-2 y TimesFM 2.5 usando el grafo de estaciones (PWM-W Delhi v0.2).
- Prediccion de las siguientes 24 horas de temperatura, humedad y viento en estaciones (PWM-W Weather v0.3 a v1.0, PWM-X v0.9).
- Prediccion en tiempo real para estaciones de India (PWM-W v0.9 live).
- Encoder meteorologico de 10M de parametros preentrenado sobre toda la India (PWM-F encoder v2.0/v2.1).
- Prediccion de las siguientes 24 horas de PM2.5 en estaciones de Delhi (Atlas-Delhi v1.0/v1.1).
- No se documentan capacidades de generacion de texto, codigo, vision, tool calling ni agentes.

## Casos de uso

- Gestion de trafico urbano: los modelos PWM-Dyn predicen los siguientes 12 pasos de flujo en redes como PEMS08 o METR-LA, lo que permite alimentar sistemas de semaforos adaptativos y paneles de informacion viaria con horizontes de decenas de minutos.
- Tolerancia a fallos de sensores: las versiones v0.7 estan entrenadas para predecir trafico bajo caidas de sensores, adecuadas para centros de control que necesitan continuidad de prediccion cuando parte de la red de espiras inductivas falla.
- Prediccion de precipitacion regional: los modelos PWM-Dyn sobre IMD central India y west coast generan los siguientes dias de lluvia en rejilla, utiles para alertas tempranas de inundaciones y planificacion agricola.
- Calidad del aire en Delhi: PWM-W Delhi v0.1 y Atlas-Delhi v1.0/v1.1 predicen las siguientes 24 horas de PM2.5, PM10, NO2 y ozono por estacion, lo que sirve para emitir avisos sanitarios y activar protocolos de reduccion de trafico.
- Correccion de modelos base de series temporales: PWM-W Delhi v0.2 actua como capa de post-procesado que corrige Chronos-2 y TimesFM 2.5 con el grafo de estaciones, apropiado para equipos que ya usan esos modelos y quieren mejorar la precision local sin reentrenar desde cero.
- Prediccion meteorologica operativa: PWM-W Weather v0.4 a v1.0 y PWM-X v0.9 generan las siguientes 24 horas de temperatura, humedad y viento en estaciones (CPCB, WMO, METAR), utiles para aeropuertos, agricultura y gestores de red electrica.
- Representacion meteorologica para transferencia: el encoder PWM-F v2.0/v2.1, preentrenado sobre toda la India, puede servir como extractor de caracteristicas para modelos posteriores en tareas meteorologicas regionales.
- Despliegue en tiempo real: PWM-W v0.9 live esta pensado para prediccion en tiempo real de estaciones indias, con un tamano de 985.853 parametros que permite inferencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica el estado de cada modelo ("reported", "see branch", "see paper", "not recorded", "not adopted") pero no incluye cifras de metricas (MAE, RMSE, MAPE) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos; el modelo mas grande de la serie tiene 10.538.577 parametros (PWM-F encoder v2.0/v2.1), lo que en fp32 ocupa aproximadamente 42 MB y en fp16 unos 21 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 pueden ejecutar estos modelos con holgura.
- Cabe en GPU consumer: si, en todas las GPU consumer actuales, y tambien en CPU y en dispositivos edge.
- Opciones de despliegue: no se especifican en la model card. Por tamano, son desplegables con PyTorch estandar, ONNX Runtime o TensorFlow Lite; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables a estos modelos).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 (PEMS08) | 317.092 | Trafico, 12 pasos, robusto a caidas | 12 pasos | Apache 2.0 | Hugging Face |
| PWM-W Weather v1.0 | 1.260.997 | Temperatura, humedad, viento 24 h | 24 h | Apache 2.0 | Hugging Face |
| Atlas-Delhi v1.1 | 967.632 | PM2.5 24 h en Delhi | 24 h | Apache 2.0 | Hugging Face |
| Chronos-2 | no disponible en la informacion | Forecasting general de series temporales | no disponible | no disponible en la informacion | referenciado como base corregida por PWM-W Delhi v0.2 |
| TimesFM 2.5 | no disponible en la informacion | Forecasting general de series temporales | no disponible | no disponible en la informacion | referenciado como base corregida por PWM-W Delhi v0.2 |

La comparativa con Chronos-2 y TimesFM 2.5 es cualitativa: la model card los menciona como modelos base cuyas predicciones de PM2.5 corrige PWM-W Delhi v0.2, pero no aporta cifras de mejora ni especificaciones de esos modelos.

## Limitaciones y advertencias

- Son modelos de forecasting especializados, no modelos de lenguaje: no generan texto, codigo ni mantienen conversaciones.
- La cobertura geografica esta limitada a las regiones de entrenamiento: redes de trafico PEMS y METR-LA, estaciones de India (IMD, CPCB, WMO, METAR) y Delhi para calidad del aire. No se documenta generalizacion a otras regiones.
- Varios modelos figuran con estado "not recorded", "not adopted" o "see branch", lo que indica que sus resultados no estan consolidados o que no fueron adoptados en la serie principal; conviene verificar el repositorio concreto antes de usarlos en produccion.
- La model card no documenta sesgos, tasas de alucinacion (concepto no aplicable a forecasting), limitaciones de contexto ni caveats de produccion mas alla del estado de cada modelo.
- La licencia Apache 2.0 permite uso comercial, pero no se detalla si los datos de entrenamiento (PEMS, IMD, CPCB, METAR) imponen restricciones adicionales de redistribucion.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y la model card esta incompleta (la tabla se corta en el modelo #38), lo que limita la validacion externa.
- No se especifica el formato de pesos ni el pipeline, por lo que la integracion requiere inspeccionar cada repositorio individual.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Codigo fuente y registros: https://github.com/paradoxailab/paradox-world-model
- PWM-Dyn v0.4 PEMS08: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-pems08
- PWM-Dyn v0.7 PEMS08: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems08
- PWM-W Delhi v0.1: https://huggingface.co/PARADOXAIlabs/pwm-w-delhi-v0.1
- PWM-W Delhi v0.2: https://huggingface.co/PARADOXAIlabs/pwm-w-delhi-v0.2
- PWM-W Weather v0.4 CPCB: https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.4-cpcb
- PWM-W Weather v0.8 CPCB: https://huggingface.co/PARADOXAIlabs/pwm-w-weather-v0.8-cpcb
- PWM-X (v0.9) CPCB: https://huggingface.co/PARADOXAIlabs/pwm-x-cpcb
- PWM-W v0.9 live: https://huggingface.co/PARADOXAIlabs/pwm-w-live-v0.9
- PWM-F encoder v2.0: https://huggingface.co/PARADOXAIlabs/pwm-f-encoder-v2.0
- PWM-F encoder v2.1: https://huggingface.co/PARADOXAIlabs/pwm-f-encoder-v2.1
- Atlas-Delhi v1.0: https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.0
