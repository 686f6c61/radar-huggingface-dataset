# PARADOXAIlabs/pwm-dyn-v0.4-pems04

## Resumen

PWM-Dyn v0.4 (variante PEMS04) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su linea Paradox World Model, concretamente el modelo numero 2 de una serie de 56 publicados. Su tarea especifica es el pronostico de los proximos 12 pasos de flujo de trafico sobre el conjunto de datos PEMS04 (Caltrans PeMS District 4, area de la bahia de San Francisco; 307 sensores, enero-febrero de 2018). Con 335.684 parametros, es un modelo de escala muy reducida orientado a un benchmark concreto mas que a uso general.

El modelo se distribuye como un unico checkpoint PyTorch (`02_pwm-dyn_v0.4_PEMS04.pt`, 1.369.177 bytes) que incluye pesos, configuracion de entrenamiento, metadatos y registros de resultados. La version v0.4 introduce pistas de evaluacion ParadoxBench-1 y calibracion conformal por particiones (split-conformal), con una mejora declarada en cobertura al 80% para precipitacion del 54,7% al 84,7% respecto a v0.3. El resultado registrado en ParadoxBench-1 Track A es un MAE de 19,21 en test con un ensemble de 3 semillas (este archivo corresponde a la semilla 0).

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo fundacional de proposito general, sino un artefacto de investigacion reproducible para pronostico de trafico con licencia Apache-2.0. Resulta util para quien quiera reproducir o comparar resultados en PEMS04 y en el benchmark propio del autor, pero no para tareas de NLP, vision o generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; configuracion en `ck['cfg']`) |
| Parametros totales | 335.684 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (predice 12 pasos futuros de flujo de trafico) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo numerico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con `torch.save`, requiere `weights_only=False`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna (transformer, GNN, SSM o hibrida). La model card indica que el codigo de arquitectura reside en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuracion exacta de entrenamiento esta embebida en el checkpoint bajo la clave `ck['cfg']`. El modelo se entreno el 2026-11-01 en un notebook de Kaggle (identificador `notebook0387a11c3a`, version 364310290) y se publico el 2026-11-17.

Los datos de entrenamiento corresponden a PEMS04 (307 sensores, enero-febrero de 2018). Los datos brutos no se distribuyen con el modelo; sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio. La innovacion tecnica declarada en v0.4 es la incorporacion de pistas de evaluacion ParadoxBench-1 y calibracion conformal por particiones, que mejora la cobertura empirica al 80% nominal en la tarea de precipitacion (del 54,7% al 84,7%). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Pronostico de los proximos 12 pasos de flujo de trafico a partir de observaciones historicas de 307 sensores.
- Prediccion puntual con calibracion conformal por particiones para intervalos de cobertura nominal (80% reportado).
- Evaluacion en ParadoxBench-1 Track A (tarea de trafico) y en la pista de precipitacion.
- Serializacion autocontenida: el checkpoint incluye metadatos, configuracion y registros de resultados, lo que facilita la reproducibilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No es un modelo generativo de texto: su salida es numerica sobre la serie temporal.

## Casos de uso

- Prediccion de trafico a corto plazo en corredores urbanos: dado el historial reciente de los 307 sensores de PeMS District 4, el modelo emite los 12 pasos siguientes, util para paneles de operacion viaria con horizonte de minutos.
- Reproduccion de resultados academicos en PEMS04: investigadores que comparen metodos de pronostico espaciotemporal pueden cargar el checkpoint, recuperar `ck['cfg']` y replicar el MAE reportado de 19,21 con el ensemble de 3 semillas.
- Evaluacion de calibracion conformal: el modelo sirve como referencia para probar tecnicas de split-conformal en series temporales, dado que documenta cobertura al 80% en la pista de precipitacion.
- Baseline ligero en pipelines de investigacion: con 335.684 parametros y un fichero de 1,37 MB, puede ejecutarse en CPU dentro de notebooks o entornos con recursos minimos.
- Docencia y prototipado de forecasting espaciotemporal: el checkpoint incluye `meta`, `weights`, `results` y `cfg`, lo que permite inspeccionar el flujo completo de entrenamiento y evaluacion sin infraestructura adicional.
- Auditoria de metodologia de benchmark: al publicar reglas, predicciones y resultados en `RESULTS.md` y en el README de `v0.4-paradoxbench`, el modelo puede usarse para revisar la trazabilidad de un benchmark propio.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE | 19,21 | Ensemble de 3 semillas; este archivo es la semilla 0 |
| Pista de precipitacion (cobertura 80%) | Cobertura empirica | 84,7% (vs 54,7% en v0.3) | Calibracion split-conformal |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones numericas con modelos alternativos en PEMS04.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa 1.369.177 bytes y el modelo tiene 335.684 parametros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1 GB de memoria libre es suficiente. Una RTX 4090, A100 o H100 estarian sobredimensionadas para este modelo.
- Compatibilidad con GPU consumer: si, en cualquier modelo actual (GTX 1050 o superior, RTX serie 20/30/40, etc.), e incluso en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.4 PEMS04 | 335.684 | 12 pasos | Trafico PEMS04 | Apache-2.0 | Hugging Face + GitHub |
| PWM-Dyn v0.4 PEMS08 | no disponible | 12 pasos | Trafico PEMS08 | Apache-2.0 | Hugging Face (serie #01) |
| PWM-Dyn v0.4 IMD Central India | no disponible | 12 pasos | Precipitacion | Apache-2.0 | Hugging Face (serie #03) |

No se dispone de datos de benchmarks ni de especificaciones de modelos externos comparables en la informacion proporcionada; la comparativa se limita a variantes de la misma serie.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo predice flujo de trafico en el conjunto PEMS04; no generaliza a otras ciudades, sensores o tareas sin reentrenamiento.
- Escala muy reducida (335.684 parametros): la capacidad de representacion es limitada y el MAE de 19,21 refleja el rendimiento en un unico benchmark propio del autor, sin validacion independiente.
- El benchmark ParadoxBench-1 es definido por el propio autor del modelo; los resultados no han sido verificados por terceros.
- Riesgo de sobreajuste al periodo enero-febrero de 2018 y a la topologia de 307 sensores de PeMS District 4; no hay evidencia de robustez ante cambios de distribucion.
- La arquitectura no esta descrita en la model card; para reproducirla hay que consultar el repositorio GitHub, lo que introduce dependencia de codigo externo no versionado en el checkpoint.
- La carga requiere `weights_only=False` en `torch.load`, lo que implica ejecutar deserializacion de pickle; conviene auditar el fichero antes de cargarlo en entornos no confiables.
- No apto para tareas de NLP, vision, generacion de texto, agentes ni tool calling; no debe presentarse como modelo de lenguaje.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (PEMS04) tienen sus propios terminos recogidos en `DATA_SOURCES.md`; verificar antes de uso en produccion.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de adopcion externa ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-pems04
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README del benchmark v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (serie #01, PEMS08): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-pems08
- Modelo siguiente (serie #03, IMD Central India): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.4-imd_central_india
- Coleccion de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
