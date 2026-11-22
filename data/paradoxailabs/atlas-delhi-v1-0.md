# PARADOXAIlabs/atlas-delhi-v1.0

## Resumen

Atlas-Delhi v1.0 es un modelo de prediccion de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, concretamente el modelo numero 34 de los 56 publicados. Su tarea especifica es la prevision de las proximas 24 horas de concentracion de PM2.5 en estaciones de medicion de calidad del aire en Delhi, utilizando datos de las 39 estaciones de monitorizacion continua de la red CPCB (Central Pollution Control Board) recogidos a traves del conjunto OpenCity "Delhi Hourly Air Quality Reports".

El modelo es extremadamente compacto: 967.632 parametros, lo que lo situa en el orden de magnitud de un modelo de juguete o de un experimento de investigacion mas que de un sistema de produccion. Se distribuye como un unico checkpoint PyTorch (`37_atlas_delhi_v1.0.pt`, 3.994.789 bytes) que contiene pesos, configuracion, metadatos y registros de resultados. La arquitectura Atlas incorpora estado de estacion aprendido, atencion sobre geometria, pasos latentes y un decodificador de cuantiles.

Su relevancia es principalmente metodologica y de referencia: el propio autor documenta que el modelo pierde frente a TimesFM 2.5 (MAE de 30,83 frente a 33,42 en estaciones vistas, un 8,4% peor), por lo que su interes reside en la trazabilidad del experimento y en servir como linea base reproducible para prevision espacio-temporal de calidad del aire, no en superar el estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atlas (estado de estacion aprendido, atencion sobre geometria, pasos latentes, decodificador de cuantiles) |
| Parametros totales | 967.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con `torch.load`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Atlas definida por ParadoxAI Lab, que combina cuatro componentes: un estado de estacion aprendido (representaciones latentes por cada una de las 39 estaciones CPCB), un mecanismo de atencion sobre la geometria de la red de estaciones (lo que permite explotar correlaciones espaciales entre ubicaciones), pasos latentes de prediccion y un decodificador de cuantiles que produce distribuciones predictivas en lugar de estimaciones puntuales. El checkpoint incluye la configuracion de entrenamiento completa en la clave `ck['cfg']`, aunque el contenido no se detalla en la informacion disponible.

El entrenamiento se realizo el 12 de noviembre de 2026 en el entorno "Kaggle atlas-delhi v2" y el modelo se publico el 17 de noviembre de 2026. Los datos de entrenamiento no se distribuyen con el modelo; las fuentes y terminos se documentan en el fichero `DATA_SOURCES.md` del repositorio de GitHub. No se especifica en la informacion disponible el volumen de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de prevision numerica).

## Capacidades

- Prevision de series temporales: genera las proximas 24 horas de concentracion de PM2.5 en estaciones de calidad del aire.
- Prediccion espacio-temporal: modela conjuntamente multiples estaciones mediante atencion sobre la geometria de la red.
- Salida probabilistica: el decodificador de cuantiles permite obtener intervalos de prediccion, no solo valores puntuales.
- Generalizacion a estaciones no vistas: el autor reporta resultados separados para estaciones vistas (MAE 33,42) y no vistas (MAE 29,07).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues, al ser un modelo numerico especializado en series temporales.

## Casos de uso

- Linea base de investigacion en calidad del aire: sirve como referencia reproducible (pesos, configuracion y resultados en un unico fichero) para comparar nuevas arquitecturas de prevision de PM2.5 en Delhi.
- Prototipado rapido de sistemas de alerta temprana: con menos de un millon de parametros, el modelo puede ejecutarse en CPU para generar previsiones a 24 horas en entornos con recursos minimos.
- Estudio de generalizacion espacial: la separacion entre estaciones vistas y no vistas permite analizar como se comporta la atencion geometrica cuando se incorporan nuevas ubicaciones a la red.
- Docencia y divulgacion: ejemplo compacto y trazable de arquitectura con estado aprendido por entidad, atencion geometrica y decodificador cuantil.
- Analisis de incertidumbre: el decodificador de cuantiles permite estudiar la calibracion de intervalos predictivos en series ambientales con alta variabilidad.
- Reproducibilidad de experimentos: el checkpoint incluye metadatos, configuracion y registros de ejecucion, lo que facilita auditorias y replicaciones del resultado reportado.

## Benchmarks y rendimiento

| Modelo | MAE estaciones vistas | MAE estaciones no vistas | Notas |
|---|---|---|---|
| Atlas-Delhi v1.0 | 33,42 | 29,07 | Media de 3 semillas |
| TimesFM 2.5 | 30,83 | no disponible | Referencia citada por el autor; Atlas-Delhi es un 8,4% peor en estaciones vistas |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no ser aplicables a un modelo de series temporales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 3.994.789 bytes y el modelo tiene 967.632 parametros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo es viable incluso en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) y en la mayoria de entornos integrados.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y el codigo del repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | MAE (vistas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Atlas-Delhi v1.0 | 967.632 | no disponible | PM2.5 24 h, Delhi | 33,42 | Apache-2.0 | Hugging Face |
| TimesFM 2.5 | no disponible | no disponible | Series temporales generales | 30,83 | no disponible | no disponible en la informacion |
| Atlas-Delhi v1.1 | no disponible | no disponible | PM2.5 24 h, Delhi | no disponible | Apache-2.0 | Hugging Face (sucesor directo) |

No se dispone de informacion suficiente para comparar con otras alternativas especializadas en calidad del aire.

## Limitaciones y advertencias

- Rendimiento inferior a la referencia: el propio autor reconoce que el modelo pierde un 8,4% frente a TimesFM 2.5 en estaciones vistas.
- Ambito geografico y temporal restringido: entrenado exclusivamente con datos de Delhi y para un horizonte de 24 horas; no se garantiza su validez fuera de ese contexto.
- Sesgos potenciales: la red CPCB tiene 39 estaciones con cobertura desigual, lo que puede introducir sesgos hacia zonas mejor monitorizadas.
- Riesgo de error en episodios extremos: no se documenta el comportamiento en picos de contaminacion, donde los modelos de series temporales suelen degradarse.
- Datos de entrenamiento no incluidos: la reproducibilidad completa depende de las fuentes externas documentadas en `DATA_SOURCES.md`.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Modelo de investigacion: con 967.632 parametros y 0 descargas en el momento de la consulta, no debe considerarse un sistema listo para produccion sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.0
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (PWM-F encoder v2.1): https://huggingface.co/PARADOXAIlabs/pwm-f-encoder-v2.1
- Modelo siguiente (Atlas-Delhi v1.1): https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.1
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web: https://paradoxailab.com
