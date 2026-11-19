# paradoxailab/pwm-dyn-v0.4-imd_central_india

## Resumen

PWM-Dyn v0.4 (`pwm-dyn-v0.4-imd_central_india`) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Su tarea concreta es la prediccion de los proximos dias de precipitacion en rejilla sobre la region central de la India, entrenado con datos IMD de precipitacion diaria en rejilla de 0,25 grados para el periodo 2000-2024. Se trata del modelo numero 3 de una serie de 56 publicados (numeracion 01-59).

El modelo es extremadamente compacto: 415.989 parametros, con pesos en formato PyTorch (`.pt`, 1.690.122 bytes). No es un modelo de lenguaje ni un transformer de proposito general, sino un modelo dinamico especializado en pronostico meteorologico regional. Su relevancia radica en la incorporacion de calibracion split-conformal en esta version, que eleva la cobertura del intervalo de confianza del 80% del 54,7% al 84,7% respecto a v0.3, un avance significativo en la fiabilidad de las predicciones probabilisticas.

La version se entrena con un notebook de Kaggle (0387a11c3a, version 364310290) el 2026-11-01 y se publica el 2026-11-17. El modelo reporta un MAE de 2,84 mm/dia en el test de ParadoxBench-1 Track A usando un ensemble de 3 semillas (este archivo corresponde a la semilla 0). La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo dinamico espaciotemporal; codigo en repositorio GitHub) |
| Parametros totales | 415.989 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no disponible (no es un modelo linguistico; salida numerica de precipitacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, 1.690.122 bytes) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo dinamico espaciotemporal ("pwm-dyn") para pronostico de precipitacion en rejilla. El codigo de arquitectura se encuentra en el repositorio GitHub de Paradox World Model y la configuracion de entrenamiento se almacena en el propio archivo de pesos bajo la clave `ck['cfg']`. El modelo cuenta con 415.989 parametros, un tamano muy reducido que sugiere una arquitectura ligera, probablemente basada en convoluciones o en un modelo recurrente/grafico adaptado a rejillas espaciales.

Los datos de entrenamiento son la precipitacion diaria en rejilla IMD a 0,25 grados para la India central durante 2000-2024. No se especifica el numero de tokens ni la composicion exacta del dataset (los datos no se incluyen en el repositorio; sus fuentes y terminos estan en `DATA_SOURCES.md`). La innovacion tecnica destacable de esta version es la incorporacion de calibracion split-conformal, que mejora la cobertura empirica del intervalo de prediccion del 80% desde el 54,7% (v0.3) hasta el 84,7% (v0.4). No se menciona RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de pronostico numerico.

## Capacidades

- Prediccion de los proximos dias de precipitacion diaria en rejilla sobre la India central.
- Pronostico espaciotemporal con resolucion espacial de 0,25 grados.
- Prediccion probabilistica con intervalos de confianza calibrados mediante split-conformal (cobertura del 80% del 84,7%).
- Evaluacion mediante ParadoxBench-1 Track A (MAE de 2,84 mm/dia con ensemble de 3 semillas).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no es un modelo linguistico).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Pronostico meteorologico regional: el modelo genera predicciones de precipitacion diaria a 0,25 grados para la India central, util para servicios meteorologicos que necesitan estimaciones a corto plazo en zonas con alta variabilidad monzonica.
- Gestion de recursos hidricos: las predicciones calibradas con intervalos de confianza permiten a los gestores de embalses y cuencas planificar la asignacion de agua con una medida explicita de incertidumbre (cobertura del 80% del 84,7%).
- Agricultura de precision: los agricultores de la India central pueden usar los pronosticos de precipitacion para planificar siembras, riegos y cosechas, aprovechando la resolucion espacial de 0,25 grados.
- Alerta temprana de inundaciones: la prediccion de precipitacion con intervalos calibrados sirve como entrada a sistemas de alerta hidrologica en cuencas vulnerables de la region.
- Investigacion climatica: el modelo, con solo 415.989 parametros, es un banco de pruebas ligero para experimentar con calibracion conformal en pronostico espaciotemporal y comparar con modelos de mayor tamano.
- Integracion en pipelines de investigacion: al ser un checkpoint PyTorch de 1,7 MB, se puede cargar y ejecutar en CPU para experimentos reproducibles dentro de flujos de evaluacion de ParadoxBench-1.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE | 2,84 mm/dia | Ensemble de 3 semillas; este archivo es la semilla 0 |
| Cobertura del intervalo del 80% (v0.4) | Cobertura empirica | 84,7% | Frente al 54,7% de v0.3 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de pronostico de precipitacion.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el checkpoint ocupa 1,7 MB y el modelo tiene 415.989 parametros (menos de 2 MB en punto flotante de 32 bits).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso GPUs integradas) y en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) e integracion en pipelines Python; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (pronostico espaciotemporal de precipitacion en rejilla) ni datos de rendimiento de alternativas. Dentro de la propia serie de ParadoxAI Lab, la version anterior es PWM-Dyn v0.4 (modelo #02, `pwm-dyn-v0.4-pems04`) y la siguiente es el modelo #04 (`pwm-dyn-v0.4-imd_west_coast`), pero no se aportan sus metricas para comparar.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en precipitacion de la India central; no generaliza a otras variables meteorologicas ni a otras regiones sin reentrenamiento.
- El MAE reportado (2,84 mm/dia) corresponde a un ensemble de 3 semillas, pero el archivo publicado es solo la semilla 0; el rendimiento individual puede diferir del ensemble.
- La cobertura calibrada del 84,7% es para el intervalo del 80%; no se documenta la calibracion para otros niveles de confianza.
- No se detalla la arquitectura ni los hiperparametros en la model card; es necesario consultar el repositorio GitHub y la clave `ck['cfg']` del checkpoint.
- Los datos de entrenamiento no se incluyen; su disponibilidad y terminos dependen de `DATA_SOURCES.md` y de las condiciones de uso de los datos IMD.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones erroneas fuera del dominio de entrenamiento (periodos o regiones no cubiertos por 2000-2024 en la India central).
- Sesgos conocidos: no documentados; cabe esperar sesgos derivados de la distribucion del dataset IMD y de la region concreta.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos de los datos IMD subyacentes antes de un despliegue en produccion.
- El modelo se publica con estado "reported" y sin descargas ni likes; no hay validacion independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.4-imd_central_india
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de ParadoxBench v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#02): https://huggingface.co/paradoxailab/pwm-dyn-v0.4-pems04
- Modelo siguiente (#04): https://huggingface.co/paradoxailab/pwm-dyn-v0.4-imd_west_coast
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio web: https://paradoxailab.com
