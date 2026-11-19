# paradoxailab/pwm-dyn-v0.4-pems04

## Resumen

PWM-Dyn v0.4 PEMS04 es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concretamente, resuelve la tarea de predecir los siguientes 12 pasos de flujo de trafico sobre el conjunto de datos PEMS04 (Caltrans PeMS District 4, area de la bahia de San Francisco; 307 sensores, enero-febrero de 2018). Es el modelo numero 2 de una serie de 56 publicados (numeros 01-59) y se distribuye bajo licencia Apache-2.0.

El modelo es extremadamente compacto: 335.684 parametros totales. No es un transformer de lenguaje generativo, sino un modelo especializado de forecasting espaciotemporal cuyo unico artefacto publicado es un checkpoint de PyTorch de 1.369.177 bytes (aproximadamente 1,3 MB). El repositorio de Hugging Face figura con un tamano de 0,0 GB, coherente con ese unico fichero de pesos.

La relevancia de esta ficha es acotada: se trata de un modelo de investigacion de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card extendida sobre arquitectura ni datos de entrenamiento mas alla de la fuente del dataset. La version v0.4 introduce pistas de evaluacion ParadoxBench-1, calibracion split-conformal y una mejora declarada de cobertura de lluvia al 80% del 54,7% al 84,7% respecto a v0.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; no descrita en la model card) |
| Parametros totales | 335.684 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de horizonte fijo: 12 pasos futuros) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict serializado con `torch.load`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El codigo de la arquitectura de esta version se encuentra en el repositorio de GitHub del proyecto (`paradoxailab/paradox-world-model`), y la configuracion de entrenamiento esta almacenada en el propio fichero de checkpoint bajo la clave `ck['cfg']`. No se dispone de informacion sobre el tipo de bloque (transformer, grafo espacio-temporal, SSM u otro), el numero de capas ni las dimensiones ocultas.

En cuanto a datos, el entrenamiento se realizo sobre PEMS04 (Caltrans PeMS District 4, area de la bahia de San Francisco; 307 sensores, enero-febrero de 2018). El entrenamiento se ejecuto el 2026-11-01 en un notebook de Kaggle (identificador `0387a11c3a`, version 364310290) y el modelo se publico el 2026-11-17. Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se documentan en `DATA_SOURCES.md`. No se especifica el numero de tokens ni la composicion exacta del dataset, ni si hubo RLHF/DPO (no aplicable en sentido estricto a un modelo de forecasting). La innovacion declarada en esta version es la incorporacion de pistas de evaluacion ParadoxBench-1 y calibracion split-conformal, con mejora de cobertura de lluvia al 80% del 54,7% al 84,7% frente a v0.3.

## Capacidades

- Prediccion de los siguientes 12 pasos de flujo de trafico a partir de datos de sensores espaciotemporales.
- Forecasting espaciotemporal sobre grafos de sensores (307 sensores en PEMS04).
- Calibracion de intervalos de prediccion mediante split-conformal (declarado para esta version).
- Evaluacion bajo ParadoxBench-1 Track A (tarea de prediccion de trafico).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prediccion de trafico a corto plazo en corredores urbanos: el modelo genera los 12 pasos siguientes de flujo a partir del estado actual de la red de sensores, adecuado para sistemas de gestion de trafico en tiempo casi real dado su tamano minimo (335.684 parametros) y su bajo coste de inferencia.
- Alimentacion de paneles de control de movilidad: al producir predicciones de horizonte fijo sobre 307 sensores, puede integrarse en dashboards operativos de distritos de transporte que ya trabajen con la topologia PeMS.
- Investigacion en forecasting espaciotemporal: sirve como linea base reproducible (checkpoint, configuracion y resultados registrados) para comparar metodos sobre PEMS04 bajo ParadoxBench-1 Track A.
- Calibracion de incertidumbre en predicciones meteorologicas de trafico: la calibracion split-conformal declarada (cobertura de lluvia al 80% del 84,7%) lo hace util para escenarios donde se necesita cuantificar la incertidumbre de la prediccion, no solo el valor puntual.
- Despliegue en entornos con recursos muy limitados: con un checkpoint de 1,3 MB, es viable ejecutarlo en CPU o en dispositivos edge sin GPU dedicada, lo que permite prototipado rapido en campo.
- Evaluacion comparativa de modelos de world model: al formar parte de una serie documentada de 56 modelos con resultados registrados, permite analizar la evolucion de versiones (v0.3 a v0.4) y el efecto de cambios de calibracion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1 Track A (test) | MAE | 19,21 | Ensemble de 3 semillas; este fichero es la semilla 0 |
| Cobertura de lluvia al 80% | Cobertura | 84,7% | Frente a 54,7% en v0.3 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) por no ser aplicables a un modelo de series temporales. No se dispone de comparaciones numericas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1.369.177 bytes y el modelo tiene 335.684 parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna (RTX 3060 o superior) es mas que suficiente. No hay indicacion de que se haya entrenado o evaluado en A100/H100.
- Cabe en GPU consumer: si, en cualquier modelo, y tambien en CPU y dispositivos edge.
- Opciones de despliegue: carga directa con `torch.load` (PyTorch) segun el ejemplo de la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otros modelos de forecasting espaciotemporal (por ejemplo, STGCN, Graph WaveNet, DCRNN o METR-LA/PEMS baselines). El unico punto de comparacion interno es la version anterior v0.3 del mismo modelo, con cobertura de lluvia al 80% del 54,7% frente al 84,7% de v0.4.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- La arquitectura no esta documentada en la model card; para reproducirla hay que consultar el repositorio de GitHub del autor.
- Entrenado exclusivamente sobre PEMS04 (307 sensores, enero-febrero de 2018); no hay garantia de generalizacion a otras redes de sensores, ciudades o periodos temporales.
- Horizonte fijo de 12 pasos; no es un modelo generativo de proposito general ni soporta prompting, tool calling ni tareas linguisticas.
- Riesgo de sobreajuste al dataset de entrenamiento y a la evaluacion ParadoxBench-1, que es un benchmark propio del autor.
- No se documentan sesgos especificos, pero al derivar de datos de trafico de una region concreta puede heredar sesgos de cobertura de sensores y condiciones meteorologicas de la zona.
- No se dispone de informacion sobre alucinacion en el sentido habitual (no es un modelo de lenguaje), pero las predicciones puntuales pueden ser erroneas sin indicacion de incertidumbre salvo que se use la calibracion conformal.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos de las fuentes de datos en `DATA_SOURCES.md` antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.4-pems04
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentacion ParadoxBench v0.4: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.4-paradoxbench/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (serie #01): https://huggingface.co/paradoxailab/pwm-dyn-v0.4-pems08
- Modelo siguiente (serie #03): https://huggingface.co/paradoxailab/pwm-dyn-v0.4-imd_central_india
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
